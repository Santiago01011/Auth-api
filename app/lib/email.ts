import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.PUBLIC_APP_URL}/api/verify?token=${token}`;
  console.log("Verification URL:", verificationUrl);

  // try {
  //   const { data, error } = await resend.emails.send({
  //     from: "onboarding@resend.dev",
  //     to: email,
  //     subject: "Verify Your Email Address",
  //     html: `
  //       <h1>Welcome to Todo App!</h1>
  //       <p>Please click the link below to verify your email address:</p>
  //       <a href="${verificationUrl}" target="_blank">Verify Email</a>
  //       <p>Or click the button below to verify directly:</p>
  //       <a href="#" onclick="fetchVerification()">Verify Email</a>
  //       <script>
  //         function fetchVerification() {
  //           fetch("${verificationUrl}")
  //             .then(response => response.json())
  //             .then(data => alert(data.message))
  //             .catch(error => alert('Error: ' + error));
  //         }
  //       </script>
  //       <p>This link will expire in 15 minutes.</p>
  //     `,
  //   });

  //   if (error) {
  //     console.error("Error sending email:", error);
  //     throw new Error("Failed to send verification email");
  //   }

  //   return data;
  // } catch (error) {
  //   console.error("Error sending email:", error);
  //   throw new Error("Failed to send verification email");
  // }
}

