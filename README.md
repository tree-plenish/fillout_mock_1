# Form.io to Supabase Webhook Service (Next.js)


Form submission URL: https://lzxtmoeysjiohyc.form.io/treeplenishtest


A Next.js webhook service that receives form submissions from Form.io and stores them in a Supabase database. Optimized for deployment on Vercel.

## Features

- Next.js API routes for serverless deployment
- Receives POST requests from Form.io form submissions
- Automatically creates or updates school records in Supabase
- Creates event records linked to schools
- Error handling and validation
- Built-in CORS support
- Health check endpoint

## Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account and project
- A Form.io account with a form set up
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

## Setting Up Form.io Webhook

1. Log in to your Form.io account
2. Open your form at https://lzxtmoeysjiohyc.form.io/treeplenishtest
3. Go to **Actions** or **Webhooks** settings
4. Add a new webhook with the URL:
   - For Vercel: `https://your-app.vercel.app/api/webhook/formio`
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/webhook/formio`

### Local Testing with ngrok

For local testing, use [ngrok](https://ngrok.com/) to create a public URL:

```bash
ngrok http 3000
```

Then use the ngrok URL in Form.io: `https://your-ngrok-url.ngrok.io/api/webhook/formio`

## API Endpoints

### POST `/api/webhook/formio`
Receives form submission data from Form.io and stores it in Supabase.

**Expected Form.io Fields:**
- `schoolName` - Name of the school
- `city` - City
- `state` - State
- `schoolContactEmail` - Contact email
- `typeOfSchool` - Type of school (not stored, for reference only)
- `address` - Address (not stored, for reference only)
- `zipPostalCode` - ZIP/Postal code (not stored, for reference only)
- `schoolContactName` - Contact name (not stored, for reference only)
- `role` - Role (not stored, for reference only)
- `preferredEventDatesOrTimeline` - Event start date
- `endDate` - Event end date
- `typeOfEvent` - Type of event
- `estimatedNumberOfTreesToPlant` - Estimated number of trees

**Mapped to Supabase:**
- Schools: `name`, `city`, `state`, `contact_email`
- Events: `title`, `goal_trees`, `event_date`, `description`

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
  "service": "Form.io to Supabase Webhook"
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
│   │       └── formio/
│   │           └── route.js      # Form.io webhook endpoint
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
- `longitude` (float8) - Longitude coordinate (optional)
- `latitude` (float8) - Latitude coordinate (optional)
- `total_trees_planted` (int4) - Total trees planted across all events
- `trees_planted_this_year` (int4) - Trees planted this year
- `participated_years` (int2) - Number of years participated
- `owner_id` (int8) - User ID of school owner (optional)
- `created_at` (timestamptz) - Creation timestamp

**Note:** The webhook populates `name`, `city`, `state`, `country`, and `contact_email`. Other fields like `total_trees_planted` are calculated/updated by other processes.

### Events Table
- `id` (int8) - Primary key
- `title` (varchar) - Event title
- `school_id` (int8) - Foreign key to schools
- `goal_trees` (int4) - Target number of trees
- `trees_planted` (int4) - Actual number of trees planted (defaults to 0)
- `event_date` (date) - Event date
- `description` (text) - Event description
- `pickup` (bool) - Whether pickup is available (defaults to false)
- `created_at` (timestamptz) - Creation timestamp

## How It Works

1. Form.io sends a POST request to `/api/webhook/formio` when a form is submitted
2. The service extracts the form data from the `submission.data` object
3. Maps Form.io fields to the expected Supabase schema
4. It checks if a school with the same name and city exists:
   - If yes: Updates the existing school record
   - If no: Creates a new school record
5. Creates a new event record linked to the school
6. Returns a success response with the created/updated records

## Error Handling

The service includes comprehensive error handling:
- Invalid form data structure returns a 400 error
- Database errors are logged and return a 500 error
- All errors include descriptive messages in the response

## Testing

You can test the webhook using curl with Form.io's payload structure:

```bash
curl -X POST https://your-app.vercel.app/api/webhook/formio \
  -H "Content-Type: application/json" \
  -d '{
    "request": {},
    "submission": {
      "data": {
        "schoolName": "Green Valley High",
        "city": "Springfield",
        "state": "CA",
        "schoolContactEmail": "contact@greenvalley.edu",
        "typeOfEvent": "Tree Planting Day",
        "estimatedNumberOfTreesToPlant": "100",
        "preferredEventDatesOrTimeline": "2025-11-15",
        "endDate": "2025-11-15"
      }
    },
    "params": {}
  }'
```

For local testing:
```bash
curl -X POST http://localhost:3000/api/webhook/formio \
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
- Verify the webhook URL in Form.io settings
- Check the Vercel logs for incoming requests
- Ensure the form field names match the expected Form.io field keys

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
