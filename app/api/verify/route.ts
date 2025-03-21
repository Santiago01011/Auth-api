import pool from "../../lib/db";

export async function handler(event: { queryStringParameters: { token: string }; headers: Record<string, string> }) {
  const { token } = event.queryStringParameters;
  const client = await pool.connect();
  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Verification token is required." }),
    };
  }
  try{
    await client.query("BEGIN");
    const result = await client.query(
      `DELETE FROM todo.pending_users
      WHERE verification_code = $1
      AND created_at >= NOW() - INTERVAL '15 minutes'
      RETURNING email, username, password_hash;`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid or expired verification token.");
    }
    const { email, username, password_hash } = result.rows[0];
    const insertResult = await client.query(
      `INSERT INTO todo.users (user_id, email, username, password_hash, created_at)
      VALUES (todo.uuid_generate_v7(), $1, $2, $3, NOW())
      ON CONFLICT (email, username) DO NOTHING
      RETURNING user_id;`,
      [email, username, password_hash]
    );

    if (insertResult.rows.length === 0) {
      throw new Error("User is already verified.");
    }
    await client.query("COMMIT");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User verified successfully." }),
    };
  } catch (error) {
      await client.query("ROLLBACK");
      console.error("Verification error:", error.message);
      return {
        statusCode: error.message === "Invalid or expired verification token."
          ? 400
          : 500,
        body: JSON.stringify({ error: error.message || "An unexpected error occurred during verification." }),
      };
  } finally {
    client.release();
  }
}