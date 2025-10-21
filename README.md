# Fillout to Supabase Webhook Service (Next.js)


Check out the form: https://treeplenish.fillout.com/t/7n929xW6mUus


A Next.js webhook service that receives form submissions from Fillout and stores them in a Supabase database. Optimized for deployment on Vercel.

## Features

- Next.js API routes for serverless deployment
- Receives POST requests from Fillout form submissions
- Automatically creates or updates school records in Supabase
- Creates event records linked to schools
- Error handling and validation
- Built-in CORS support
- Health check endpoint

## Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account and project
- A Fillout account with a form set up
- A Vercel account (for deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tree-plenish/fillout_mock_1.git
cd fillout_mock_1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.local.example`:
```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
```

## Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **Project URL** (this is your `SUPABASE_URL`)
5. Copy the **service_role** key (this is your `SUPABASE_SERVICE_KEY`)
   - **Important**: Use the service role key, not the anon key, as the service role has full permissions

## Running Locally

### Development Mode
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
6. Click **"Deploy"**

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables:
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
```

5. Redeploy with environment variables:
```bash
vercel --prod
```

## Setting Up Fillout Webhook

1. Log in to your [Fillout account](https://fillout.com/)
2. Open your form
3. Go to **Integrations** or **Webhooks** settings
4. Add a new webhook with the URL:
   - For Vercel: `https://your-app.vercel.app/api/webhook/fillout`
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/webhook/fillout`

### Local Testing with ngrok

For local testing, use [ngrok](https://ngrok.com/) to create a public URL:

```bash
ngrok http 3000
```

Then use the ngrok URL in Fillout: `https://your-ngrok-url.ngrok.io/api/webhook/fillout`

## API Endpoints

### POST `/api/webhook/fillout`
Receives form submission data from Fillout and stores it in Supabase.

**Expected Form Fields:**
- `school_name` - Name of the school
- `full_address` - Full address (optional)
- `address` - Street address
- `city` - City
- `state` - State
- `zip_code` - Zip code
- `country` - Country
- `school_contact_name` - Contact person name
- `school_contact_email` - Contact email
- `event_date_range` - Date range for the event
- `event_start_date` - Event start date
- `event_end_date` - Event end date
- `event_type` - Type of event
- `event_estimate_trees` - Estimated number of trees

**Response:**
```json
{
  "success": true,
  "data": {
    "school": { ... },
    "event": { ... }
  }
}
```

### GET `/api/health`
Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T12:00:00.000Z",
  "service": "Fillout to Supabase Webhook"
}
```

## Project Structure

```
fillout_mock_1/
├── app/
│   ├── api/
│   │   ├── health/
│   │   │   └── route.js          # Health check endpoint
│   │   └── webhook/
│   │       └── fillout/
│   │           └── route.js      # Main webhook endpoint
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home page
├── lib/
│   └── supabase.js               # Supabase client & utilities
├── .env.local.example            # Environment variables template
├── .gitignore
├── next.config.js                # Next.js configuration
├── package.json
├── README.md
└── vercel.json                   # Vercel deployment config
```

## Database Schema

The service interacts with two main tables in Supabase:

### Schools Table
- `id` (int8) - Primary key
- `name` (varchar) - School name
- `city` (varchar) - City
- `state` (varchar) - State
- `country` (varchar) - Country
- `contact_email` (varchar) - Contact email
- `created_at` (timestamptz) - Creation timestamp

### Events Table
- `id` (int8) - Primary key
- `title` (varchar) - Event title
- `school_id` (int8) - Foreign key to schools
- `goal_trees` (int4) - Target number of trees
- `event_date` (date) - Event date
- `description` (text) - Event description
- `created_at` (timestamptz) - Creation timestamp

## How It Works

1. Fillout sends a POST request to `/api/webhook/fillout` when a form is submitted
2. The service extracts the form data from the request
3. It checks if a school with the same name and city exists:
   - If yes: Updates the existing school record
   - If no: Creates a new school record
4. Creates a new event record linked to the school
5. Returns a success response with the created/updated records

## Error Handling

The service includes comprehensive error handling:
- Invalid form data structure returns a 400 error
- Database errors are logged and return a 500 error
- All errors include descriptive messages in the response

## Testing

You can test the webhook using curl:

```bash
curl -X POST https://your-app.vercel.app/api/webhook/fillout \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      {"name": "school_name", "value": "Green Valley High"},
      {"name": "city", "value": "Springfield"},
      {"name": "state", "value": "CA"},
      {"name": "country", "value": "USA"},
      {"name": "school_contact_email", "value": "contact@greenvalley.edu"},
      {"name": "event_type", "value": "Tree Planting Day"},
      {"name": "event_estimate_trees", "value": "100"},
      {"name": "event_start_date", "value": "2025-11-15"}
    ]
  }'
```

For local testing:
```bash
curl -X POST http://localhost:3000/api/webhook/fillout \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

## Monitoring and Logging

- All webhook requests are logged to the console
- Successful submissions log school and event IDs
- Errors are logged with detailed messages
- On Vercel, logs can be viewed in the Vercel Dashboard under the "Logs" tab

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | Yes |

## Security Considerations

- `.env.local` is gitignored to prevent exposing credentials
- Use the Supabase service role key for full database access
- Vercel automatically provides HTTPS
- Consider adding webhook signature verification for additional security
- Environment variables are securely stored in Vercel

## Vercel Deployment Benefits

- **Serverless**: Automatically scales with traffic
- **Global CDN**: Fast response times worldwide
- **Zero configuration**: No server setup required
- **Automatic HTTPS**: SSL certificates included
- **Environment variables**: Secure credential storage
- **Instant deployments**: Deploy with git push

## Troubleshooting

### Service won't start locally
- Check that all dependencies are installed: `npm install`
- Verify your `.env.local` file has the correct Supabase credentials
- Ensure you're using Node.js v18 or higher

### Webhook not receiving data
- Verify the webhook URL in Fillout settings
- Check the Vercel logs for incoming requests
- Ensure the form field names match the expected names

### Database errors
- Verify your Supabase credentials are correct
- Check that the tables exist in your Supabase project
- Ensure the service role key has the necessary permissions
- Check Vercel logs for detailed error messages

### Deployment issues
- Ensure environment variables are set in Vercel
- Check the build logs in Vercel dashboard
- Verify your `next.config.js` is properly configured

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Vercel documentation](https://vercel.com/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Open an issue on [GitHub](https://github.com/tree-plenish/fillout_mock_1/issues)

## License

ISC
