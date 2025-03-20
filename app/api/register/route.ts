import pool from "../../lib/db";
import { handleEmailVerification } from "../handleEmail/route";

export async function POST(event: { body: string }) {
  try {
    console.log("Database URL:", process.env.DATABASE_URL);
    console.log("Request body:", event.body);

    const body = JSON.parse(event.body);
    const { email, password, username, redirectUrl } = body;

    if (!email || !password || !username) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Email, password, and username are required",
        }),
      };
    }

    console.log("Checking if user exists...");
    const userCheck = await pool.query(
      `
      SELECT 'users' AS source, email, username FROM todo.users WHERE email = $1 OR username = $2
      UNION
      SELECT 'pending_users' AS source, email, username FROM todo.pending_users WHERE email = $1
      `,
      [email, username]
    );
    if (userCheck.rows.length > 0) {
      const existingField = userCheck.rows[0].email === email ? "email" : "username";
      const existingValue = userCheck.rows[0][existingField];
      const source = userCheck.rows[0].source;
      const message =
        source === "users"
          ? `${existingField}: ${existingValue} already exists, try login.`
          : `${existingField}: ${existingValue} is already pending verification. Please check your email.`;
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: message,
        }),
      };
    }
    // Return early to the client
    console.log("Returning success response to client...");
    const response = {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: "Registration received. Verification email will be sent shortly.",
      }),
    };

    // Handle email verification asynchronously
    handleEmailVerification(email, username, password, pool).catch((error) => {
      console.error("Error in asynchronous email verification process:", error);
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Registration error:", error.stack || error.message);
    } else {
      console.error("Registration error:", error);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An unexpected error occurred during registration" }),
    };
  }
}