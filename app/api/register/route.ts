import pool from "../../lib/db";
import { handleEmailVerification } from "../handleEmail/route";

export async function POST(event: { body: string }) {
  const client = await pool.connect();

  try {
    const body = JSON.parse(event.body);
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Email, password, and username are required",
        }),
      };
    }

    // Check if user already exists
    const existingUser = await client.query(
      `SELECT email FROM todo.users WHERE email = $1 OR username = $2;`,
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "Email or username already exists. Try logging in.",
        }),
      };
    }

    // Check if user is already pending verification
    const existingPending = await client.query(
      `SELECT email, created_at FROM todo.pending_users WHERE email = $1 OR username = $2;`,
      [email, username]
    );

    if (existingPending.rows.length > 0) {
      const createdAt = new Date(existingPending.rows[0].created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffMinutes < 15) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            error: "Account is already pending verification. Check your email.",
          }),
        };
      }

      // Expired pending verification → delete it
      await client.query(
        `DELETE FROM todo.pending_users WHERE email = $1 OR username = $2;`,
        [email, username]
      );
    }

    // Send verification email
    await handleEmailVerification(email, username, password, pool);

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: "Registration received. Verification email will be sent shortly.",
      }),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An unexpected error occurred during registration" }),
    };
  } finally {
    client.release();
  }
}