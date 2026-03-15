import { next } from '@vercel/edge';

const BOT_UA = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Googlebot|bingbot/i;

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return next();

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/services\/([a-f0-9-]+)$/);
  if (!match) return next();

  const serviceId = match[1];
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://duxzlhctpddkcwtbmwum.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eHpsaGN0cGRka2N3dGJtd3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODgwOTUsImV4cCI6MjA3NzU2NDA5NX0.paZZxjJWTpWh2RabUF0PVNcAyDJzb3ia2WDAiXu87yY';

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/services?id=eq.${serviceId}&is_active=eq.true&select=name,description,price,image_url`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return next();

    const service = data[0];
    const origin = 'https://www.bitbuyboss.store';
    const image = service.image_url || `${origin}/og-image.png`;
    const pageUrl = `${origin}/services/${serviceId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(service.name)} — BitBuyBoss</title>
  <meta name="description" content="${escapeHtml(service.description)}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(service.name)}" />
  <meta property="og:description" content="${escapeHtml(service.description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:site_name" content="BitBuyBoss" />
  <meta property="product:price:amount" content="${service.price}" />
  <meta property="product:price:currency" content="USD" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(service.name)}" />
  <meta name="twitter:description" content="${escapeHtml(service.description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
</head>
<body>
  <h1>${escapeHtml(service.name)}</h1>
  <p>${escapeHtml(service.description)}</p>
  <p>$${service.price}</p>
  <a href="${escapeHtml(pageUrl)}">View on BitBuyBoss</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return next();
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const config = {
  matcher: '/services/:id*',
};
