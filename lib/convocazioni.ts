/**
 * Testi delle convocazioni per l'evento Sistemi 50 (#Parigi 20-23 set 2026).
 *
 * Ogni partecipante apre /convocazione?param=<id-univoco> e vede la propria
 * convocazione, declinata:
 *   1) per persona, quando esiste un testo dedicato (override per singolo id);
 *   2) altrimenti per tipologia di viaggio (chiave scenario), come per il
 *      piano viaggi in lib/scenarios.ts.
 *
 * ── Stato attuale: RIENTRO DEL 23 SETTEMBRE ──────────────────────────────
 * Le convocazioni di partenza (20 settembre e date anticipate) hanno esaurito
 * il loro scopo e sono state sostituite da quella del rientro. La struttura è
 * la stessa per tutti:
 *   check-out → orario di partenza dalla lobby → volo di rientro →
 *   check-in in aeroporto (+ eventuale assistenza allo scalo) → franchigia.
 * Cambia solo la parte dinamica: l'orario della lobby e l'operativo di volo.
 *
 * Gli orari dei voli sono allineati a lib/scenarios.ts (le stesse tratte che il
 * partecipante vede nelle card del piano viaggi) per non generare incoerenze.
 *
 * In ogni convocazione è aggiunta, in fondo, la clausola richiesta:
 *   "La compagnia aerea si riserva la facoltà di imbarcare in stiva il bagaglio
 *    a mano in base alla disponibilità di spazio a bordo."
 * (renderizzata automaticamente dalla card: vedi BAGGAGE_DISCLAIMER.)
 */

import idMap from "./id-map.json";

/** Riferimento di assistenza in aeroporto, con numero cliccabile da mobile. */
export type Contact = {
  /** Nome dell'assistente o del servizio (es. "Assistenza ai transiti"). */
  name: string;
  /** Numero nel formato leggibile, es. "+39 340 051 3990". */
  phone: string;
  /** Quando il numero è attivo, es. "attiva dall'ora di convocazione". */
  note?: string;
};

/**
 * Riga di convocazione. I contatti stanno attaccati alla riga a cui si
 * riferiscono e non in fondo alla card: le assistenze non valgono per l'intero
 * viaggio (quella di Fiumicino risponde solo allo scalo) e un elenco unico in
 * coda non direbbe chi chiamare e quando.
 */
export type CallStep =
  | string
  | {
      text: string;
      /** Recapiti validi per questa riga (e solo per questa). */
      contacts?: Contact[];
      /** Riga da evidenziare per intero (es. la boarding pass in app). */
      bold?: boolean;
    };

/** Riga di convocazione con i relativi recapiti di assistenza. */
const conContatti = (text: string, ...contacts: Contact[]): CallStep => ({
  text,
  contacts,
});

/** Blocco di una convocazione. Tutti i campi sono opzionali: si mostra solo ciò che serve. */
export type Convocazione = {
  /** Data mostrata sopra l'operativo di volo. */
  dateLabel?: string;
  /** Indicazioni che precedono il volo (check-out, partenza dalla lobby). */
  call?: CallStep[];
  /** Operativo/i di volo, una riga per tratta. */
  flights?: string[];
  /** Etichetta della sezione voli (default "Volo"). */
  flightsLabel?: string;
  /**
   * Indicazioni che seguono l'operativo (check-in, assistenza allo scalo).
   * Stanno dopo il volo perché vi si riferiscono: anticiparle sopra
   * costringerebbe a leggere "una volta sbarcato" prima di sapere dove si va.
   */
  airport?: CallStep[];
  /** Etichetta della sezione post-volo (default "In aeroporto"). */
  airportLabel?: string;
  /** Franchigia bagaglio. */
  baggage?: string[];
  /** Etichetta della sezione bagaglio (default "Franchigia bagaglio"). */
  baggageLabel?: string;
  /** Note finali (es. "ulteriori dettagli verranno comunicati…"). */
  notes?: string[];
};

/**
 * Clausola obbligatoria, presente in tutte le convocazioni che riguardano un
 * volo. Chi non vola con noi non la vede: parla di bagaglio a mano da
 * imbarcare in stiva.
 */
export const BAGGAGE_DISCLAIMER =
  "La compagnia aerea si riserva la facoltà di imbarcare in stiva il bagaglio a mano in base alla disponibilità di spazio a bordo.";

// --- Costanti di testo riutilizzabili -------------------------------------

const MER_23 = "Mercoledì 23 settembre 2026";
/** Chi ha prolungato di una notte rientra il giorno dopo, stesso operativo. */
const GIO_24 = "Giovedì 24 settembre 2026";

const BAGGAGE_STD = [
  "1 bagaglio da stiva da 23 kg",
  "1 bagaglio a mano (massimo 8 kg, dimensioni 55×35×25 cm) più un accessorio personale (45×36×20 cm) da riporre sotto il sedile",
];

/**
 * Apertura uguale per tutti: il check-out non dipende dall'orario del volo, ma
 * dall'orario di rilascio delle camere.
 */
const CHECKOUT: CallStep[] = [
  "Ti ricordiamo di effettuare il check-out prima della partenza dell'attività scelta e comunque entro le ore 12:00, provvedendo a saldare eventuali extra al momento del check-out della camera.",
  "È stato previsto per te un deposito bagagli in hotel.",
];

/**
 * Unica riga davvero dinamica della convocazione: il gruppo di appartenenza si
 * riconosce dall'orario di partenza dalla lobby.
 */
const lobby = (ora: string): CallStep =>
  `Partenza dalla lobby dell'hotel alle ore ${ora}`;

/** Check-in del rientro: uguale per tutti, nessuno ha la carta già emessa. */
const CHECKIN =
  "Il check-in verrà effettuato in aeroporto ai banchi della compagnia.";

/**
 * Scalo di Roma Fiumicino (bretellati): l'assistenza aeroportuale accoglie
 * all'arrivo del volo da Parigi e accompagna alla coincidenza.
 */
const SCALO_FCO: CallStep = conContatti(
  "Una volta sbarcato dal volo a Roma Fiumicino, troverai ad attenderti l'assistenza aeroportuale.",
  { name: "Assistenza transiti", phone: "+39 335 779 1234" }
);

/**
 * Scalo di Milano Linate (Cagliari e Olbia): a differenza di Fiumicino non c'è
 * assistenza in loco, il bagaglio va ritirato e reimbarcato. La riga è
 * evidenziata perché richiede un'azione: recuperare la boarding pass in app.
 */
const SCALO_LIN: CallStep = {
  text: 'Una volta atterrato a Milano Linate, dovrai ritirare il tuo bagaglio e recarti al banco check-in della compagnia per proseguire il tuo viaggio; trovi la boarding pass nella sezione dedicata "Boarding Pass" all\'interno di questa app.',
  bold: true,
};

// --- Operativi di rientro (allineati a lib/scenarios.ts) -------------------

const AF_1702 = "AF 1702 Parigi Charles de Gaulle → Torino · 15:40 – 17:05";
/** Stessa tratta e stesso orario dell'AF 1702, ma il 24 il volo è l'AF 1102. */
const AF_1102 = "AF 1102 Parigi Charles de Gaulle → Torino · 15:40 – 17:05";
const AZ_313 = "AZ 313 Parigi Charles de Gaulle → Milano Linate · 16:50 – 18:20";
const AZ_325 = "AZ 325 Parigi Charles de Gaulle → Roma Fiumicino · 18:15 – 20:25";
const AF_1502 = "AF 1502 Parigi Charles de Gaulle → Torino · 21:10 – 22:35";

// --- Builder ---------------------------------------------------------------

/**
 * Convocazione di rientro: cambia solo l'orario della lobby, l'operativo e
 * l'eventuale indicazione di scalo. Tutto il resto è identico per tutti.
 * La data è il 23 per tutti tranne chi ha prolungato di una notte.
 */
function rientro(
  lobbyOra: string,
  flights: string[],
  scalo: CallStep[] = [],
  date: string = MER_23
): Convocazione {
  return {
    dateLabel: date,
    call: [...CHECKOUT, lobby(lobbyOra)],
    flightsLabel: "Volo di rientro",
    flights,
    airport: [CHECKIN, ...scalo],
    baggage: BAGGAGE_STD,
  };
}

/** Rientro via Roma Fiumicino: volo Parigi → FCO e proseguimento locale. */
const viaFco = (proseguimento: string): Convocazione =>
  rientro("14:45", [AZ_325, proseguimento], [SCALO_FCO]);

/** Chi rientra per conto proprio: nessuna indicazione, solo il saluto. */
const SALUTO: Convocazione = { call: ["Buon proseguimento!"] };

/** Chi prosegue il soggiorno a Parigi. */
const RESTA_A_PARIGI: Convocazione = { call: ["Buon proseguimento a Parigi!"] };

// --- Convocazioni per tipologia di viaggio (chiave scenario) ---------------

/** Convocazioni indicizzate per chiave scenario (come in lib/scenarios.ts). */
export const CONVOCAZIONI: Record<string, Convocazione> = {
  // --- Lobby 12:15 · AF 1702 per Torino ---
  torinos: rientro("12:15", [AF_1702]),
  "torino-19sep": rientro("12:15", [AF_1702]),
  "torino-ritorno": rientro("12:15", [AF_1702]),
  // Una notte in più a Parigi: stesso orario di pickup, ma il 24 — e il volo
  // delle 15:40 quel giorno è l'AF 1102, non l'AF 1702. Senza la riga sul
  // check-in ai banchi: per loro non vale.
  "torino-19-24sep": {
    ...rientro("12:15", [AF_1102], [], GIO_24),
    airport: undefined,
  },

  // --- Lobby 13:15 · AZ 313 per Milano Linate ---
  milanos: rientro("13:15", [AZ_313]),
  "milano-ritorno": rientro("13:15", [AZ_313]),
  // Cagliari e Olbia rientrano con lo stesso volo su Linate e proseguono in
  // serata: per loro si aggiunge il reimbarco del bagaglio allo scalo.
  cagliari: rientro(
    "13:15",
    [AZ_313, "W2 8645 Milano Linate → Cagliari · 21:30 – 22:50"],
    [SCALO_LIN]
  ),
  // Melis: l'andata era anticipata al 19, il rientro è identico a `cagliari`.
  "cagliari-19sep": rientro(
    "13:15",
    [AZ_313, "W2 8645 Milano Linate → Cagliari · 21:30 – 22:50"],
    [SCALO_LIN]
  ),
  "olbia-ritorno": rientro(
    "13:15",
    [AZ_313, "W2 8468 Milano Linate → Olbia · 21:00 – 22:10"],
    [SCALO_LIN]
  ),

  // --- Lobby 14:45 · AZ 325 per Roma Fiumicino ---
  romas: rientro("14:45", [AZ_325]),
  "roma-ritorno": rientro("14:45", [AZ_325]),
  // Bretellati: stesso volo su Fiumicino, poi la coincidenza serale.
  palermo: viaFco("AZ 1789 Roma Fiumicino → Palermo · 21:25 – 22:30"),
  catania: viaFco("AZ 1719 Roma Fiumicino → Catania · 21:15 – 22:30"),
  bari: viaFco("AZ 1603 Roma Fiumicino → Bari · 21:45 – 22:55"),
  brindisi: viaFco("AZ 1625 Roma Fiumicino → Brindisi · 21:45 – 23:00"),
  lamezia: viaFco("AZ 1173 Roma Fiumicino → Lamezia Terme · 21:50 – 23:00"),
  napoli: viaFco("AZ 1267 Roma Fiumicino → Napoli · 21:45 – 22:40"),

  // --- Lobby 17:45 · AF 1502 per Torino (rientro serale) ---
  "torino-18sep": rientro("17:45", [AF_1502]),
  "torino-ritorno-21:10": rientro("17:45", [AF_1502]),

  // --- Senza volo di rientro con noi ---
  // Chi rientra per conto proprio non ha nulla da organizzare: meglio un saluto
  // che il messaggio "la convocazione ti verrà comunicata a breve", perché per
  // loro non arriverà mai.
  "milano-andata": SALUTO,
  "roma-andata": SALUTO,
  "mezzi-propri": SALUTO,
};

// --- Convocazioni personalizzate (per singola persona) ---------------------
// Chiave: id univoco del partecipante in minuscolo. Sovrascrive la convocazione
// per tipologia quando presente.

export const PERSON_CONVOCAZIONI: Record<string, Convocazione> = {
  // Marco Cosci: rientra con il gruppo delle 14:45 fino all'aeroporto, ma il
  // volo se l'è prenotato per conto suo. Niente operativo, niente check-in e
  // niente franchigia: sono tutte cose che dipendono dal biglietto, e il suo
  // non lo abbiamo emesso noi. Resta il solo transfer.
  "a29917dd-65c8-41b1-b0fc-b3d94fc37bd3": {
    call: [...CHECKOUT, lobby("14:45")],
  },
  // Renato Chichi e Anna Maria Stampi: proseguono il soggiorno a Parigi.
  "578d2f24-bc5d-4fd0-8c19-6b7084a36e43": RESTA_A_PARIGI,
  "4b310176-d1ec-4b7f-b85a-2ba485db12a0": RESTA_A_PARIGI,
};

// --- Risoluzione id → convocazione -----------------------------------------

const ID_MAP: Record<string, string> = idMap;

export type ConvocazioneResult = {
  /** Convocazione da mostrare, o null se lo scenario non ne ha ancora una. */
  convocazione: Convocazione | null;
};

/**
 * Risolve il parametro del link nella convocazione corretta.
 * - Ritorna null solo se il parametro non corrisponde ad alcun partecipante/scenario.
 * - Ritorna { convocazione: null } se lo scenario esiste ma non ha (ancora) una
 *   convocazione dedicata (es. chi non ha volo di rientro).
 */
export function resolveConvocazione(
  param: string | null | undefined
): ConvocazioneResult | null {
  if (!param) return null;
  const raw = param.trim().toLowerCase();

  // 1) id univoco del partecipante
  const scenarioKey = ID_MAP[raw];
  if (scenarioKey) {
    const personal = PERSON_CONVOCAZIONI[raw];
    if (personal) return { convocazione: personal };
    return { convocazione: CONVOCAZIONI[scenarioKey] ?? null };
  }

  // 2) solo in sviluppo: nome scenario diretto (?param=torinos)
  if (process.env.NODE_ENV !== "production") {
    const key = raw.replace(/\s+/g, "-");
    if (CONVOCAZIONI[key]) return { convocazione: CONVOCAZIONI[key]! };
    // scenario noto ma senza convocazione dedicata
    if (Object.values(ID_MAP).includes(key)) return { convocazione: null };
  }

  return null;
}

/** Elenco degli id validi (per l'indice di test in sviluppo). */
export const CONVOCAZIONE_ID_KEYS = Object.keys(ID_MAP);

/** Versione testuale della convocazione, per il download. */
export function convocazioneToText(conv: Convocazione): string {
  const out: string[] = [];
  out.push("SISTEMI 50 · #Parigi 20-23 settembre 2026");
  out.push("LA TUA CONVOCAZIONE");
  out.push("");

  // I recapiti seguono la riga a cui si riferiscono, come nella card.
  const righeCall = (call: CallStep[]) =>
    call.flatMap((step) =>
      typeof step === "string"
        ? [step]
        : [
            step.text,
            ...(step.contacts ?? []).map(
              (c) => `  ${c.name}: ${c.phone}${c.note ? ` (${c.note})` : ""}`
            ),
          ]
    );

  if (conv.call?.length) out.push("CONVOCAZIONE", ...righeCall(conv.call), "");
  if (conv.flights?.length) {
    out.push((conv.flightsLabel ?? "VOLO").toUpperCase());
    if (conv.dateLabel) out.push(conv.dateLabel);
    out.push(...conv.flights, "");
  }
  if (conv.airport?.length) {
    out.push(
      (conv.airportLabel ?? "In aeroporto").toUpperCase(),
      ...righeCall(conv.airport),
      ""
    );
  }
  if (conv.baggage?.length) {
    out.push(
      (conv.baggageLabel ?? "Franchigia bagaglio").toUpperCase(),
      ...conv.baggage.map((b) => `- ${b}`),
      ""
    );
    out.push(BAGGAGE_DISCLAIMER, "");
  }
  if (conv.notes?.length) {
    out.push(conv.notes.join(" "));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
