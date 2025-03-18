import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const result = await pool.query(
      "SELECT user_id, email, password_hash, full_name, is_verified FROM users WHERE email = $1",
      [email],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = result.rows[0]

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 403 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate a session token
    const sessionToken = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Session expires in 30 days

    // Store session in database
    await pool.query(`INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)`, [
      user.user_id,
      sessionToken,
      expiresAt,
    ])

    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

