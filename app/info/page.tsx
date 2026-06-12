import { BrandHeader } from "@/components/BrandHeader";

/**
 * Pagina informativa generica dell'evento. Vi atterra chi apre un link senza id
 * valido (id mancante o non riconosciuto).
 */
export default function InfoPage() {
  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="Informazioni evento" />

      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="rounded-2xl bg-white p-7 text-center shadow-card">
          <h2 className="text-lg font-bold text-sistemi-ink">
            Le tue soluzioni di viaggio
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sistemi-ink/70">
            Per visualizzare i dettagli del tuo viaggio per l&apos;evento di
            Parigi, apri il <strong>link personale</strong> che hai ricevuto
            dall&apos;organizzazione.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-sistemi-ink/70">
            Se hai aperto il tuo link e vedi questo messaggio, il codice
            potrebbe non essere corretto. Contatta l&apos;organizzazione
            dell&apos;evento per ricevere assistenza.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-sistemi-ink/50">
          Sistemi 50 · #Parigi · 20-23 settembre 2026
        </p>
      </div>
    </main>
  );
}
