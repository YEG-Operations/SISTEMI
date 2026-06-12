/**
 * Security headers applicati a tutte le risposte (vedi next.config.ts e middleware.ts).
 */

type HeaderTuple = { key: string; value: string };

/**
 * Content-Security-Policy.
 * - default-src 'self': tutto dallo stesso origin salvo eccezioni esplicite.
 * - 'unsafe-inline' su script è necessario perché Next.js inietta script inline
 *   per il bootstrap dell'hydration di React e i dati RSC; senza, l'hydration
 *   fallisce e la pagina resta bianca. Accettabile: sito pubblico senza dati sensibili.
 * - 'unsafe-inline' su style è necessario per gli stili inline di Next/Tailwind.
 * - frame-ancestors 'none' impedisce l'embedding (clickjacking).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** Header di sicurezza applicati a tutte le risposte. */
export function securityHeaders(): HeaderTuple[] {
  return [
    { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "no-referrer" },
    // Link inviati ai partecipanti: non vanno indicizzati dai motori.
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
  ];
}
