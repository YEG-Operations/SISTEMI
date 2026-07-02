import type { FlightLeg } from "@/lib/scenarios";

/** Etichetta della fascia superiore per ciascuna fase del viaggio. */
const PHASE_LABELS: Record<FlightLeg["phase"], string> = {
  "Avvicinamento andata": "🛫 Avvicinamento andata",
  Andata: "🛫 Andata",
  Ritorno: "🛬 Ritorno",
  "Avvicinamento ritorno": "🛬 Avvicinamento ritorno",
};

/** Card volo in stile "carta d'imbarco" brandizzata Sistemi. */
export function FlightCard({ leg }: { leg: FlightLeg }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      {/* Fascia superiore con fase e data */}
      <div className="flex items-center justify-between bg-sistemi-red px-5 py-3 text-white">
        <span className="text-sm font-bold uppercase tracking-wide">
          {PHASE_LABELS[leg.phase]}
        </span>
        <span className="text-xs font-medium text-white/85">{leg.date}</span>
      </div>

      <div className="px-5 py-5">
        {/* Percorso: partenza → arrivo con orari */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-2xl font-extrabold leading-none text-sistemi-ink">
              {leg.departure}
            </p>
            <p className="mt-1 max-w-[8rem] text-xs text-sistemi-ink/60">
              {leg.from}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center px-1">
            <span aria-hidden className="text-sistemi-red">
              ✈
            </span>
            <div className="my-1 h-px w-full bg-sistemi-ink/15" />
            <span className="text-[10px] uppercase tracking-wide text-sistemi-ink/40">
              Diretto
            </span>
          </div>

          <div className="text-right">
            <p className="text-2xl font-extrabold leading-none text-sistemi-ink">
              {leg.arrival}
            </p>
            <p className="mt-1 max-w-[8rem] text-xs text-sistemi-ink/60">
              {leg.to}
            </p>
          </div>
        </div>

        {/* Dettagli volo */}
        <div className="mt-5 space-y-2 border-t border-dashed border-sistemi-ink/15 pt-4">
          <Row label="Volo" value={leg.flight} />
          <Row label="Bagaglio" value={leg.baggage} />
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50 sm:w-20 sm:pt-0.5">
        {label}
      </span>
      <span className="text-sm leading-relaxed text-sistemi-ink">{value}</span>
    </div>
  );
}
