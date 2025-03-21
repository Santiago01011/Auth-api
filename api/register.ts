import pool from "../lib/db"
import { handleEmailVerification } from "./handleEmail"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const client = await pool.connect()

  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      })
    }

    // Check if user already exists
    const existingUser = await client.query(`SELECT email FROM todo.users WHERE email = $1 OR username = $2;`, [
      email,
      username,
    ])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Email or username already exists. Try logging in.",
      })
    }

    // Check if user is already pending verification
    const existingPending = await client.query(
      `SELECT email, created_at FROM todo.pending_users WHERE email = $1 OR username = $2;`,
      [email, username],
    )

    if (existingPending.rows.length > 0) {
      const createdAt = new Date(existingPending.rows[0].created_at)
      const now = new Date()
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

      if (diffMinutes < 15) {
        return res.status(409).json({
          error: "Account is already pending verification. Check your email.",
        })
      }

      // Expired pending verification → delete it
      await client.query(`DELETE FROM todo.pending_users WHERE email = $1 OR username = $2;`, [email, username])
    }

    // Send verification email
    await handleEmailVerification(email, username, password, pool)

    return res.status(201).json({
      success: true,
      message: "Registration received. Verification email will be sent shortly.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ error: "An unexpected error occurred during registration" })
  } finally {
    client.release()
  }
}

