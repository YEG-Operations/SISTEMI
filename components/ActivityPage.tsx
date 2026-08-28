import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { ActivityCard } from "@/components/ActivityCard";
import { resolveActivities, DATE_LABEL, activityIdKeys } from "@/lib/activities";

/**
 * Pagina unica attività: legge il parametro (?param=<id-univoco>) e mostra le
 * attività assegnate al partecipante per il 21 e il 23 settembre.
 * Se l'id manca o non è valido → redirect a /info.
 */
export async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.param ?? params.Param ?? params.PARAM;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const activities = resolveActivities(value);
  const isDev = process.env.NODE_ENV !== "production";

  if (!activities) {
    if (!isDev) redirect("/info");
    if (value) redirect("/info");
    return <DevIndex />;
  }

  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="Le tue attività" />

      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="space-y-4">
          <p className="text-center text-sm text-sistemi-ink/70">
            Visualizza di seguito le tue attività
          </p>

          <ActivityCard dateLabel={DATE_LABEL["21"]} icon="📍" result={activities["21"]} />
          <ActivityCard dateLabel={DATE_LABEL["23"]} icon="🏛️" result={activities["23"]} />
        </div>
      </div>
    </main>
  );
}

/** Indice di test, solo in sviluppo: link per id reali. */
function DevIndex() {
  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="Le tue attività" />
      <div className="mx-auto max-w-2xl space-y-4 px-5 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50">
            Test per ID partecipante (solo sviluppo)
          </p>
          <ul className="space-y-1">
            {activityIdKeys().map((id) => (
              <li key={id}>
                <a
                  href={`/attivita?param=${id}`}
                  className="block truncate rounded-lg px-3 py-2 font-mono text-xs text-sistemi-red hover:bg-sistemi-red/5"
                >
                  ?param={id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
