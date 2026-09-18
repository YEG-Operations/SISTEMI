import type { CallStep, Contact, Convocazione, Giornata } from "@/lib/convocazioni";
import { BAGGAGE_DISCLAIMER, PARKING_URL } from "@/lib/convocazioni";

/** Card convocazione in stile "carta d'imbarco" brandizzata Sistemi. */
export function ConvocazioneCard({ conv }: { conv: Convocazione }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      {/* Fascia superiore con titolo */}
      <div className="flex items-center bg-sistemi-red px-5 py-3 text-white">
        <span className="text-sm font-bold uppercase tracking-wide">
          📄 La tua convocazione
        </span>
      </div>

      <div className="space-y-5 px-5 py-5">
        {conv.hotel ? (
          <Block label="Ritrovo">
            {/* Senza voli la data non avrebbe dove comparire (nelle altre
                convocazioni sta sopra l'operativo): la mostriamo qui, sopra il
                ritrovo in hotel. */}
            {conv.dateLabel && !conv.flights && !conv.days ? (
              <p className="mb-2 text-sm font-bold text-sistemi-red">
                {conv.dateLabel}
              </p>
            ) : null}
            {listOf(conv.hotel)}
          </Block>
        ) : null}

        {/* Viaggio su più giorni: ogni giornata completa (volo e convocazione)
            prima di passare alla successiva, così le due partenze non si
            mescolano. */}
        {conv.days?.length
          ? conv.days.map((g, i) => (
              <Giorno key={i} giornata={g} flightsLabel={conv.flightsLabel} />
            ))
          : null}

        {conv.flights ? (
          <Block label={conv.flightsLabel ?? "Volo"}>
            {conv.dateLabel ? (
              <p className="mb-2 text-sm font-bold text-sistemi-red">
                {conv.dateLabel}
              </p>
            ) : null}
            {listOfFlights(conv.flights)}
          </Block>
        ) : null}

        {conv.call ? (
          <Block label="Convocazione">{listOfSteps(conv.call)}</Block>
        ) : null}

        {/* Franchigia e clausola obbligatoria vanno insieme: chi non vola (mezzi
            propri) non ha né l'una né l'altra. */}
        {conv.baggage ? (
          <>
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
            <p className="rounded-xl bg-sistemi-mist px-4 py-3 text-xs italic leading-relaxed text-sistemi-ink/70">
              {BAGGAGE_DISCLAIMER}
            </p>
          </>
        ) : null}

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

/** Volo e convocazione di una singola giornata, con la data in testa. */
function Giorno({
  giornata,
  flightsLabel,
}: {
  giornata: Giornata;
  flightsLabel?: string;
}) {
  return (
    <div className="space-y-4 border-l-2 border-sistemi-red/20 pl-4">
      <p className="text-sm font-bold text-sistemi-red">{giornata.date}</p>
      {giornata.flights?.length ? (
        <Block label={flightsLabel ?? "Volo"}>{listOfFlights(giornata.flights)}</Block>
      ) : null}
      {giornata.call?.length ? (
        <Block label="Convocazione">{listOfSteps(giornata.call)}</Block>
      ) : null}
    </div>
  );
}

function listOfFlights(flights: string[]) {
  return (
    <ul className="space-y-1.5">
      {flights.map((f, i) => (
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
  );
}

function listOfSteps(call: CallStep[]) {
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-sistemi-ink">
      {call.map((step, i) => (
        <Step key={i} step={step} />
      ))}
    </div>
  );
}

/** Una riga di convocazione: testo (eventualmente in evidenza) e suoi recapiti. */
function Step({ step }: { step: CallStep }) {
  if (typeof step === "string") return <p>{withBoldTimes(step)}</p>;
  const testo = step.bold ? (
    <strong className="font-bold">{step.text}</strong>
  ) : (
    withBoldTimes(step.text)
  );
  if (!step.contacts?.length) return <p>{testo}</p>;
  return (
    <div className="space-y-1.5">
      <p>{testo}</p>
      {/* I recapiti stanno sotto la riga a cui si riferiscono: in più tratte
          le assistenze sono diverse. */}
      <ul className="space-y-1 border-l-2 border-sistemi-red/30 pl-3">
        {step.contacts.map((c) => (
          <ContactLine key={c.phone} contact={c} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Nome, numero cliccabile e nota di attivazione sulla stessa riga: la nota va
 * a capo solo quando lo spazio finisce, quindi è testo in linea e non un
 * elemento flex (che andrebbe a capo tutto intero a prescindere).
 */
function ContactLine({ contact: c }: { contact: Contact }) {
  return (
    <li>
      <span className="font-semibold">{c.name}</span>{" "}
      <a
        href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}
        className="whitespace-nowrap font-bold text-sistemi-red underline underline-offset-2"
      >
        {c.phone}
      </a>
      {c.note ? (
        <span className="text-xs text-sistemi-ink/60"> ({c.note})</span>
      ) : null}
    </li>
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
