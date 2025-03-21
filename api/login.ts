import pool from "../lib/db"
import bcrypt from "bcryptjs"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const client = await pool.connect()
  try {
    const { username, email, password } = req.body

    if ((!email && !username) || !password) {
      return res.status(400).json({ error: "Email or username and password are required" })
    }

    const result = await client.query(
      `SELECT user_id, password_hash FROM todo.users WHERE email = $1 OR username = $2;`,
      [email, username],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const password_hash = result.rows[0].password_hash
    const valid = await bcrypt.compare(password + process.env.PEPPER_SECRET!, password_hash)

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    return res.status(200).json({ message: "Login successful", user_id: result.rows[0].user_id })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Login error:", error.stack || error.message)
    } else {
      console.error("Login error:", error)
    }

    return res.status(500).json({ error: "An unexpected error occurred during login" })
  } finally {
    client.release()
  }
}