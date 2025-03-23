export default function middleware() {
  // This file acts as a placeholder to prevent Next.js from trying to server-render API routes
  // during static export build, since they're handled client-side in production
  return new Response(null, { status: 404 });
} 