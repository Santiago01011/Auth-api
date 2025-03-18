import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Verify the token
    const currentDate = new Date()
    const result = await pool.query(
      `UPDATE users 
       SET is_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL 
       WHERE verification_token = $1 
       AND verification_token_expires_at > $2 
       AND is_verified = FALSE
       RETURNING user_id, email`,
      [token, currentDate],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Check if there's a redirect URL associated with this token
    const redirectResult = await pool.query(`SELECT redirect_url FROM verification_redirects WHERE token = $1`, [token])

    // Delete the redirect entry
    if (redirectResult.rows.length > 0) {
      await pool.query(`DELETE FROM verification_redirects WHERE token = $1`, [token])

      const redirectUrl = redirectResult.rows[0].redirect_url

      // If there's a custom protocol for the Java app, redirect to it
      if (redirectUrl.startsWith("todoapp://") || redirectUrl.includes("://")) {
        return NextResponse.redirect(redirectUrl)
      }

      // Otherwise, return success with the redirect URL
      return NextResponse.json({
        success: true,
        message: "Email verified successfully. You can now log in.",
        redirectUrl,
      })
    }

    // Default success response
    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "An error occurred during verification" }, { status: 500 })
  }
}

