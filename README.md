 # Domain History Checker

This is a simple Next.js application that allows users to look up domain registration details using WHOIS and RDAP protocols. It features a clean, intuitive UI and includes server-side API route rate limiting to prevent abuse.
 

## Setup & Installation

Follow these steps to get the project up and running on your local machine.

### 1. Clone the repository (or create a new Next.js project)
If you created a new Next.js project based on the previous instructions, you can skip this. Otherwise:

```bash
git clone https://github.com/CasualEngineerZombie/domain-history-checker
cd domain-history-checker
```

### 2. Install Dependencies
Install all the necessary npm packages:

```bash
npm install
# or
yarn install
```

### 3. Set Up Vercel KV (for Rate Limiting)
This application uses Vercel KV for persistent and scalable rate limiting.

- **Create a Vercel Account**: If you don't have one, sign up at [vercel.com](https://vercel.com).
- **Create a KV Database**:
  - Go to your Vercel Dashboard.
  - Navigate to the "Storage" tab.
  - Click "Connect Store" and choose "KV". Follow the prompts to create a new KV database and link it to your Next.js project.
- **Get Environment Variables**: After creation, Vercel will provide you with connection details (URL and Token).
- **Create .env.local**: In the root of your project, create a file named `.env.local` and add the following environment variables (replace `<your_values>` with the actual values from Vercel KV):

```bash
KV_URL="<your_kv_url>"
KV_REST_API_TOKEN="<your_kv_token>"
KV_REST_API_URL="<your_kv_rest_api_url>"
```

**Important**: For local development, these variables need to be present. If you omit them or provide invalid ones, the rate limiter will fail to initialize.

### 4. Project Structure (Verify)
Ensure your project structure generally matches the following for the components to resolve correctly:

```
domain-history-checker/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── whois.ts
│   │   ├── api/
│   │   │   └── whois/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   └── DomainHistoryChecker.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── ratelimit.ts
│   └── types/
│       └── whois-json.d.ts
├── .env.local
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## Running the Application
Once the setup is complete, you can run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

The application will be accessible at `http://localhost:3000`.

## Testing Rate Limiting
To test the API route rate limiting (configured in `lib/ratelimit.ts` for 5 requests per 10 seconds per IP):

1. Ensure the dev server is running.
2. Open your terminal or a tool like Postman/Insomnia.
3. Send POST requests rapidly to `http://localhost:3000/api/whois` with a JSON body like `{"domain": "example.com"}`.

   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"domain": "example.com"}' http://localhost:3000/api/whois
   ```

4. Observe the responses:
   - The first 5 requests within a 10-second window should return `200 OK` (with WHOIS data).
   - The 6th request (and subsequent ones within that window) should return `429 Too Many Requests` with an error message indicating the rate limit.
   - The `429` response headers will include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix timestamp).
5. Wait for the reset: After a `429` response, wait for the `Retry-After` duration (or simply more than 10 seconds from your first request). Subsequent requests should then succeed again.