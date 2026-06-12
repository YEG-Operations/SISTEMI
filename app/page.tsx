import { BrandHeader } from "@/components/BrandHeader";
import { FlightCard } from "@/components/FlightCard";
import { resolveScenario, SCENARIO_KEYS } from "@/lib/scenarios";

/**
 * Pagina unica: legge il parametro (?Param=torinos, ?Param=milano-ritorno, ...)
 * e mostra la soluzione di viaggio corrispondente. Contenuti statici dal file Excel.
 */
export default async function HomePage({
  searchParams,
}: {
  // In Next 15 searchParams è una Promise.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Accetta ?Param= (come da specifica) ma anche varianti comuni di maiuscole.
  const raw = params.Param ?? params.param ?? params.PARAM;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const scenario = resolveScenario(value);

  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle={scenario ? scenario.title : "Le tue soluzioni di viaggio"} />

      <div className="mx-auto max-w-2xl px-5 py-6">
        {scenario ? (
          <div className="space-y-4">
            <p className="text-center text-sm text-sistemi-ink/70">
              {scenario.subtitle}
            </p>

            {scenario.notice ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-card">
                <div className="mb-3 text-3xl" aria-hidden>
                  🚗
                </div>
                <p className="text-sm leading-relaxed text-sistemi-ink/80">
                  {scenario.notice}
                </p>
              </div>
            ) : (
              scenario.legs.map((leg) => (
                <FlightCard key={`${leg.phase}-${leg.flight}`} leg={leg} />
              ))
            )}

            <p className="pt-2 text-center text-xs text-sistemi-ink/50">
              Per assistenza o modifiche contatta l&apos;organizzazione
              dell&apos;evento.
            </p>
          </div>
        ) : (
          <NoScenario hasParam={Boolean(value)} />
        )}
      </div>
    </main>
  );
}

/** Mostrato quando il parametro manca o non è valido. */
function NoScenario({ hasParam }: { hasParam: boolean }) {
  const isDev = process.env.NODE_ENV !== "production";
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-7 text-center shadow-card">
        <h2 className="text-lg font-bold text-sistemi-ink">
          {hasParam ? "Soluzione non trovata" : "Benvenuto/a"}
        </h2>
        <p className="mt-2 text-sm text-sistemi-ink/70">
          {hasParam
            ? "Il link che hai aperto non corrisponde a una soluzione di viaggio valida. Verifica di aver aperto il link corretto ricevuto dall'organizzazione."
            : "Apri il link personalizzato che hai ricevuto dall'organizzazione per vedere la tua soluzione di viaggio per l'evento di Parigi."}
        </p>
      </div>

      {/* Indice link di test, visibile solo in sviluppo. */}
      {isDev && (
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50">
            Link di test (solo sviluppo)
          </p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {SCENARIO_KEYS.map((key) => (
              <li key={key}>
                <a
                  href={`/?Param=${key}`}
                  className="block rounded-lg px-3 py-2 text-sm text-sistemi-red hover:bg-sistemi-red/5"
                >
                  ?Param={key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
