import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email, token) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50;">Welcome to Todo App!</h1>
          <p>Thank you for signing up! Please use the verification token below to verify your email address:</p>
          <div style="background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 5px; display: inline-block; margin: 10px 0;">
            <code style="font-size: 16px; font-weight: bold; color: #555;">${token}</code>
          </div>
          <p>This token will expire in 15 minutes. If you did not sign up for Todo App, please ignore this email.</p>
          <p style="font-size: 12px; color: #999;">- The Todo App Team</p>
        </div>
      `,
    })
    return data
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send verification email")
  }
}

