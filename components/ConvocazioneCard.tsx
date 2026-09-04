import type { Convocazione } from "@/lib/convocazioni";
import { BAGGAGE_DISCLAIMER, PARKING_URL } from "@/lib/convocazioni";

/** Card convocazione in stile "carta d'imbarco" brandizzata Sistemi. */
export function ConvocazioneCard({ conv }: { conv: Convocazione }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      {/* Fascia superiore con titolo e data */}
      <div className="flex items-center justify-between bg-sistemi-red px-5 py-3 text-white">
        <span className="text-sm font-bold uppercase tracking-wide">
          📄 La tua convocazione
        </span>
        {conv.dateLabel ? (
          <span className="text-xs font-medium text-white/85">
            {conv.dateLabel}
          </span>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5">
        {conv.hotel ? <Block label="Ritrovo">{listOf(conv.hotel)}</Block> : null}

        {conv.flights ? (
          <Block label={conv.flightsLabel ?? "Volo"}>
            {conv.dateLabel ? (
              <p className="mb-2 text-sm font-bold text-sistemi-red">
                {conv.dateLabel}
              </p>
            ) : null}
            <ul className="space-y-1.5">
              {conv.flights.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-sistemi-ink"
                >
                  <span aria-hidden className="pt-0.5 text-sistemi-red">
                    ✈
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {conv.call ? (
          <Block label="Convocazione">
            <div className="space-y-1.5 text-sm leading-relaxed text-sistemi-ink">
              {conv.call.map((l, i) => (
                <p key={i}>{withBoldTimes(l)}</p>
              ))}
            </div>
          </Block>
        ) : null}

        {conv.baggage ? (
          <Block label={conv.baggageLabel ?? "Franchigia bagaglio"}>
            <ul className="space-y-1 text-sm leading-relaxed text-sistemi-ink">
              {conv.baggage.map((item, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden className="text-sistemi-red">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {/* Clausola obbligatoria: presente in TUTTE le convocazioni. */}
        <p className="rounded-xl bg-sistemi-mist px-4 py-3 text-xs italic leading-relaxed text-sistemi-ink/70">
          {BAGGAGE_DISCLAIMER}
        </p>

        {conv.parking ? (
          <Block label="Parcheggio">
            <p className="text-sm leading-relaxed text-sistemi-ink">
              Se desideri prenotare un posto auto a prezzi convenzionati,{" "}
              <a
                href={PARKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sistemi-red underline underline-offset-2"
              >
                prenota al link dedicato
              </a>
              .
            </p>
          </Block>
        ) : null}

        {conv.notes && conv.notes.length ? (
          <p className="border-t border-dashed border-sistemi-ink/15 pt-4 text-sm font-bold leading-relaxed text-sistemi-ink">
            {conv.notes.join(" ")}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-sistemi-ink/50 sm:w-24 sm:pt-0.5">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function listOf(lines: string[]) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-sistemi-ink">
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  );
}

/** Rende in grassetto gli orari (formato HH:MM) all'interno di un testo. */
function withBoldTimes(text: string) {
  const parts = text.split(/(\d{1,2}[:.]\d{2})/g);
  return parts.map((p, i) =>
    /^\d{1,2}[:.]\d{2}$/.test(p) ? (
      <strong key={i} className="font-bold">
        {p}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
