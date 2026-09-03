import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { ConvocazioneCard } from "@/components/ConvocazioneCard";
import { ConvocazioneActions } from "@/components/ConvocazioneActions";
import {
  resolveConvocazione,
  convocazioneToText,
  CONVOCAZIONE_ID_KEYS,
} from "@/lib/convocazioni";

/**
 * Pagina convocazione: legge il parametro (?param=<id-univoco>) e mostra la
 * convocazione del partecipante, con pulsanti per scaricarla e tornare al
 * piano viaggi. Se l'id manca o non è valido → redirect a /info.
 */
export async function ConvocazionePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.param ?? params.Param ?? params.PARAM;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const result = resolveConvocazione(value);
  const isDev = process.env.NODE_ENV !== "production";

  if (!result) {
    if (!isDev) redirect("/info");
    if (value) redirect("/info");
    return <DevIndex />;
  }

  const backHref = `/?param=${encodeURIComponent(value ?? "")}`;
  const { convocazione } = result;

  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="La tua convocazione" />

      <div className="mx-auto max-w-2xl px-5 py-6">
        <div className="space-y-4">
          <p className="text-center text-sm text-sistemi-ink/70">
            Ecco la tua convocazione
          </p>

          {convocazione ? (
            <>
              <ConvocazioneCard conv={convocazione} />
              <ConvocazioneActions
                text={convocazioneToText(convocazione)}
                filename="Convocazione-Sistemi50-Parigi.txt"
                backHref={backHref}
              />
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-6 text-center shadow-card">
                <div className="mb-3 text-3xl" aria-hidden>
                  📄
                </div>
                <p className="text-sm leading-relaxed text-sistemi-ink/80">
                  La tua convocazione ti verrà comunicata a breve
                  dall&apos;organizzazione dell&apos;evento.
                </p>
              </div>
              <a
                href={backHref}
                className="flex items-center justify-center gap-2 rounded-xl border border-sistemi-red/30 bg-white px-5 py-3 text-sm font-semibold text-sistemi-red shadow-card transition hover:bg-sistemi-red/5"
              >
                <span aria-hidden>←</span>
                Torna al piano viaggi
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

/** Indice di test, solo in sviluppo: link per id reali. */
function DevIndex() {
  return (
    <main className="min-h-screen bg-sistemi-mist">
      <BrandHeader subtitle="La tua convocazione" />
      <div className="mx-auto max-w-2xl space-y-4 px-5 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50">
            Test per ID partecipante (solo sviluppo)
          </p>
          <ul className="space-y-1">
            {CONVOCAZIONE_ID_KEYS.map((id) => (
              <li key={id}>
                <a
                  href={`/convocazione?param=${id}`}
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
