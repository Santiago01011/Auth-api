# Auth API with Next.js & TypeScript

This project is an authentication API built with Next.js, TypeScript, and PostgreSQL. It includes user registration, email verification, and other authentication-related features.

## Project Structure

```
auth-api
├── app
│   ├── api
│   │   ├── register
│   │   │   └── route.ts    # API route for user registration
│   │   └── verify
│   │       └── route.ts    # API route for email verification
│   ├── page.tsx            # Default Next.js page
├── lib
│   └── email.ts            # Email sending logic
├── package.json            # NPM configuration file
├── tsconfig.json           # TypeScript configuration file
├── .env                    # Environment variables
├── test_script.sh          # Script to test the /api/register endpoint
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v16 or higher recommended).
- **PostgreSQL**: A running PostgreSQL instance (local or cloud-based).
- **Docker** (optional): For running PostgreSQL in a container.

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd auth-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root of the project:
     ```env
     DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     RESEND_API_KEY=<your_resend_api_key>
     ```
   - Replace `<username>`, `<password>`, `<host>`, `<port>`, `<database_name>`, and `<your_resend_api_key>` with your actual values.

4. **Run the application:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   - Use the provided `test_script.sh` to test the `/api/register` endpoint:
     ```bash
     ./test_script.sh
     ```

## Scripts

- `dev`: Starts the Next.js development server.
- `build`: Builds the application for production.
- `start`: Starts the production server.

## Features

- **User Registration**: Register users with email, password, and full name.
- **Email Verification**: Send verification emails with unique tokens.
- **PostgreSQL Integration**: Store user data securely in a PostgreSQL database.

## Contributing

Feel free to submit issues and pull requests for any improvements or features you would like to see!

## License

This project is licensed under the MIT License.