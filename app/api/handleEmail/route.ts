import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "../../lib/email";

export async function handleEmailVerification(
  email: string,
  username: string,
  password: string,
  pool: Pool
) {
  try {
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("Generating verification token...");
    const verificationToken = randomBytes(10).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15);

    console.log("Sending verification email...");
    await sendVerificationEmail(email, verificationToken);
    console.log("Verification email sent to:", email);

    console.log("Storing verification token in the database...");
    await pool.query(
      "INSERT INTO todo.pending_users (pending_id, username, email, password_hash, created_at, verification_code) VALUES (todo.uuid_generate_v7(), $1, $2, $3, NOW(), $4);",
      [username, email, hashedPassword, verificationToken]
    );
    console.log("Verification token stored successfully.");
  } catch (error) {
    console.error("Error in email verification process:", error);
    throw error; // Re-throw the error to ensure it's logged in the caller
  }
}