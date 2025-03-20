import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function handler(event: { queryStringParameters: { token: string }; headers: Record<string, string> }) {

  console.log("Headers received:", event.headers);
  //console.log("Request received from:", event.requestContext.identity.sourceIp);

  const { token } = event.queryStringParameters;
  const client = await pool.connect();
  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Verification token is required." }),
    };
  }

  console.log("Verifying token:", token);

  try{
    await client.query("BEGIN");

    // Fetch and delete in a single step
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
    console.log("User verified successfully:", email);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<h1>Email Verified</h1><p>You can now <a href='/login'>log in</a>.</p>`,
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