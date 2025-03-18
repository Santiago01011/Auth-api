import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { sendVerificationEmail } from "../../lib/email"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

export async function POST(request: Request) {
  try {
    // Extract the body from the request
    const body = JSON.parse(request.body || "{}"); // Use request.body for serverless-offline

    const { email, password, username } = body;

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 });
    }

    // Check if email or username already exists
    const userCheck = await pool.query(
      "SELECT * FROM todo.users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      const existingField = userCheck.rows[0].email === email ? "email" : "username";
      const existingValue = userCheck.rows[0][existingField];
      return NextResponse.json(
        { error: `${existingField}: ${existingValue} already exists, try login` },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 1); // Token expires in 24 hours

    // Send verification email
    // await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: "Registration initiated. Please check your email for verification.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message); // Log only the error message
    } else {
      console.error("Registration error:", error); // Log the entire error if it's not an instance of Error
    }
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
  }
}

