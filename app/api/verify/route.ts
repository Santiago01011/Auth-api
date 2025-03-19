import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function GET(event: { queryStringParameters: { token: string } }) {
  try {
    const { token } = event.queryStringParameters;

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Verification token is required." }),
      };
    }

    console.log("Verifying token:", token);

    // Check if the token exists and is valid
    const result = await pool.query(
      `
      SELECT pending_id, email, username FROM todo.pending_users
      WHERE verification_code = $1
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or expired verification token." }),
      };
    }

    const { pending_id, email, username } = result.rows[0];

    // Move the user from pending_users to users
    try {
      await pool.query(
        `
        INSERT INTO todo.users (user_id, email, username, password_hash, created_at)
        SELECT todo.uuid_generate_v7(), email, username, password_hash, NOW()
        FROM todo.pending_users
        WHERE pending_id = $1
        `,
        [pending_id]
      );
    } catch (error) {
      console.error("Error moving user to users table:", error.stack || error.message);
      throw new Error("Failed to verify user.");
    }

    // Delete the user from pending_users
    await pool.query("DELETE FROM todo.pending_users WHERE pending_id = $1", [pending_id]);

    console.log("User verified successfully:", email);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Email verified successfully." }),
    };
  } catch (error) {
    console.error("Verification error:", error.stack || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred during verification." }),
    };
  }
}