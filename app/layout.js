export const metadata = {
  title: 'Fillout to Supabase Webhook',
  description: 'Webhook service for Fillout form submissions to Supabase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
