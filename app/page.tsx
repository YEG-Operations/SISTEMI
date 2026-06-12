import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { FlightCard } from "@/components/FlightCard";
import { resolveScenario, SCENARIO_KEYS, ID_KEYS } from "@/lib/scenarios";

/**
 * Pagina unica: legge il parametro (?param=<id-univoco>) e mostra la soluzione
 * di viaggio del partecipante. L'id è risolto nello scenario via lib/id-map.json.
 * Se l'id manca o non è valido → redirect a /info.
 */
export default async function HomePage({
  searchParams,
}: {
  // In Next 15 searchParams è una Promise.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Accetta ?param= (come da specifica) e varianti di maiuscole.
  const raw = params.param ?? params.Param ?? params.PARAM;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const scenario = resolveScenario(value);
  const isDev = process.env.NODE_ENV !== "production";

  // In produzione: id mancante o non valido → pagina informativa.
  // In sviluppo: senza parametro mostriamo l'indice di test.
  if (!scenario) {
    if (!isDev) redirect("/info");
    if (value) redirect("/info"); // anche in dev, un id errato va a /info
    return <DevIndex />;
  }

  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle={scenario.title} />

      <div className="mx-auto max-w-2xl px-5 py-6">
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
      </div>
    </main>
  );
}

/** Indice di test, solo in sviluppo: link per id reali e per nome scenario. */
function DevIndex() {
  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="Le tue soluzioni di viaggio" />
      <div className="mx-auto max-w-2xl space-y-4 px-5 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50">
            Test per ID partecipante (solo sviluppo)
          </p>
          <ul className="space-y-1">
            {ID_KEYS.map((id) => (
              <li key={id}>
                <a
                  href={`/?param=${id}`}
                  className="block truncate rounded-lg px-3 py-2 font-mono text-xs text-sistemi-red hover:bg-sistemi-red/5"
                >
                  ?param={id}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50">
            Test per nome scenario (solo sviluppo)
          </p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {SCENARIO_KEYS.map((key) => (
              <li key={key}>
                <a
                  href={`/?param=${key}`}
                  className="block rounded-lg px-3 py-2 text-sm text-sistemi-red hover:bg-sistemi-red/5"
                >
                  ?param={key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
