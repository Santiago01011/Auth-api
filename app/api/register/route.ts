import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "../../lib/email"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

// Test database connection during initialization
pool.connect()
  .then(client => {
    console.log("Database connection successful");
    client.release();
  })
  .catch(err => {
    console.error("Database connection error:", err.message);
    // Log the error but do not stop the server
  });

export async function POST(request: Request) {
  try {
    console.log("Incoming request:", request);

    const { email, password, username, redirectUrl } = await request.json();
    console.log("Parsed body:", { email, password, username, redirectUrl });
    console.log("Connecting to database with URL:", process.env.DATABASE_URL);
    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Check if user already exists
    const userCheck = await pool.query("SELECT * FROM todo.users WHERE email = $1", [email])

    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setDate(tokenExpiry.getDate() + 1) // Token expires in 24 hours

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, verification_token, verification_token_expires_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
      [email, hashedPassword, username, verificationToken, tokenExpiry],
    )

    const userId = result.rows[0].user_id

    // Store the redirectUrl with the token if provided
    if (redirectUrl) {
      await pool.query(`INSERT INTO verification_redirects (token, redirect_url) VALUES ($1, $2)`, [
        verificationToken,
        redirectUrl,
      ])
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        success: true,
        message: "Registration initiated. Please check your email for verification.",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message); // Log only the error message
    } else {
      console.error("Registration error:", error); // Log the entire error if it's not an instance of Error
    }
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}

