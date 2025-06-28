# WHOIS/RDAP Explorer

This is a Next.js application that enables users to explore domain registration details using WHOIS and RDAP protocols. It features a clean, intuitive UI and includes server-side API route rate limiting to prevent abuse.

## Setup & Installation

Follow these steps to set up and run the project on your local machine.

### 1. Clone the Repository (or Create a New Next.js Project)
If you created a new Next.js project based on prior instructions, you can skip this step. Otherwise:

```bash
git clone https://github.com/CasualEngineerZombie/whois-rdap-explorer
cd whois-rdap-explorer
```

### 2. Install Dependencies
Install all required npm packages:

```bash
npm install
# or
yarn install
```

### 3. Set Up Vercel KV (for Rate Limiting)
This application uses Vercel KV for persistent and scalable rate limiting.

- **Create a Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have an account.
- **Create a KV Database**:
  - Navigate to the "Storage" tab in your Vercel Dashboard.
  - Click "Connect Store" and select "KV". Follow the prompts to create a new KV database and link it to your Next.js project.
- **Get Environment Variables**: Vercel will provide connection details (URL and Token) after creation.
- **Create .env.local**: In the project root, create a `.env.local` file and add the following environment variables (replace `<your_values>` with the actual values from Vercel KV):

```bash
KV_URL="<your_kv_url>"
KV_REST_API_TOKEN="<your_kv_token>"
KV_REST_API_URL="<your_kv_rest_api_url>"
```

**Important**: These variables are required for local development. Invalid or missing variables will cause the rate limiter to fail.

### 4. Project Structure (Verify)
Ensure your project structure aligns with the following to ensure components resolve correctly:

```
whois-rdap-explorer/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── whois-rdap.ts
│   │   ├── api/
│   │   │   └── whois-rdap/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   └── WHOISRDAPExplorer.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── ratelimit.ts
│   └── types/
│       └── whois-rdap.d.ts
├── .env.local
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Running the Application
After completing the setup, run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Testing Rate Limiting
To test the API route rate limiting (configured in `lib/ratelimit.ts` for 5 requests per 10 seconds per IP):

1. Ensure the development server is running.
2. Use a terminal or a tool like Postman/Insomnia.
3. Send POST requests rapidly to `http://localhost:3000/api/whois-rdap` with a JSON body like `{"domain": "example.com"}`.

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"domain": "example.com"}' http://localhost:3000/api/whois-rdap
   ```

4. Observe the responses:
   - The first 5 requests within a 10-second window should return `200 OK` with WHOIS/RDAP data.
   - The 6th request (and subsequent ones within the window) should return `429 Too Many Requests` with an error message indicating the rate limit.
   - The `429` response headers will include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix timestamp).
5. Wait for the reset: After a `429` response, wait for the `Retry-After` duration (or more than 10 seconds from the first request). Subsequent requests should succeed again.