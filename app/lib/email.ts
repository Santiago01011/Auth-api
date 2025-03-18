import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // You can change this to your verified domain later
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <h1>Welcome to Todo App!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw new Error("Failed to send verification email")
    }

    return data
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send verification email")
  }
}

