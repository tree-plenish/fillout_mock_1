export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Fillout to Supabase Webhook</h1>
        <p className="text-lg text-gray-600 mb-8">
          Webhook service is running and ready to receive form submissions
        </p>

        <div className="bg-gray-100 rounded-lg p-6 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

          <div className="text-left space-y-4">
            <div>
              <code className="bg-blue-100 px-3 py-1 rounded text-sm font-mono">
                POST /api/webhook/fillout
              </code>
              <p className="text-gray-700 mt-2">
                Webhook endpoint for Fillout form submissions
              </p>
            </div>

            <div>
              <code className="bg-green-100 px-3 py-1 rounded text-sm font-mono">
                GET /api/health
              </code>
              <p className="text-gray-700 mt-2">
                Health check endpoint
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/api/health"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Check Health Status
          </a>
        </div>
      </div>
    </main>
  );
}
