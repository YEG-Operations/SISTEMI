/**
 * Testi delle convocazioni per l'evento Sistemi 50 (#Parigi 20-23 set 2026).
 *
 * Ogni partecipante apre /convocazione?param=<id-univoco> e vede la propria
 * convocazione, declinata:
 *   1) per persona, quando esiste un testo dedicato (override per singolo id);
 *   2) altrimenti per tipologia di viaggio (chiave scenario), come per il
 *      piano viaggi in lib/scenarios.ts.
 *
 * Fonte: i file Word nella cartella /convocazioni. Gli orari dei voli mostrati
 * sono allineati a lib/scenarios.ts (le stesse tratte che il partecipante vede
 * nelle card del piano viaggi) per non generare incoerenze sul sito.
 *
 * In ogni convocazione è aggiunta, in fondo, la clausola richiesta:
 *   "La compagnia aerea si riserva la facoltà di imbarcare in stiva il bagaglio
 *    a mano in base alla disponibilità di spazio a bordo."
 * (renderizzata automaticamente dalla card: vedi BAGGAGE_DISCLAIMER.)
 */

import idMap from "./id-map.json";

/** Blocco di una convocazione. Tutti i campi sono opzionali: si mostra solo ciò che serve. */
export type Convocazione = {
  /** Data principale mostrata nella fascia della card (assente per chi non ha volo di andata). */
  dateLabel?: string;
  /** Operativo/i di volo, una riga per tratta. */
  flights?: string[];
  /** Etichetta della sezione voli (default "Volo"). */
  flightsLabel?: string;
  /** Dove/quando presentarsi e altre indicazioni operative. */
  call?: string[];
  /** Informazioni hotel (per chi arriva in autonomia o ha solo il rientro). */
  hotel?: string[];
  /** Franchigia bagaglio. */
  baggage?: string[];
  /** Etichetta della sezione bagaglio (default "Franchigia bagaglio"). */
  baggageLabel?: string;
  /** Mostra il blocco parcheggio convenzionato. */
  parking?: boolean;
  /** Note finali (es. "ulteriori dettagli verranno comunicati…"). */
  notes?: string[];
};

/** Clausola obbligatoria aggiunta a TUTTE le convocazioni. */
export const BAGGAGE_DISCLAIMER =
  "La compagnia aerea si riserva la facoltà di imbarcare in stiva il bagaglio a mano in base alla disponibilità di spazio a bordo.";

/** Link parcheggio convenzionato (comune a tutte le convocazioni con parcheggio). */
export const PARKING_URL =
  "https://www.parkingo.com/it/prenotazione-parcheggio-yeg-ventana-group";

// --- Costanti di testo riutilizzabili -------------------------------------

const DOM_20 = "Domenica 20 settembre 2026";
const VEN_18 = "Venerdì 18 settembre 2026";
const SAB_19 = "Sabato 19 settembre 2026";

const BAGGAGE_STD = [
  "1 bagaglio da stiva 23 kg",
  "1 bagaglio a mano (massimo 8 kg, dimensioni 55×35×25 cm) più un accessorio personale (45×36×20 cm) da riporre sotto il sedile",
];

const HOTEL = [
  "Ti aspettiamo presso l'Hotel Du Collectionneur a partire dalle ore 16:00.",
  "Hotel Du Collectionneur — 51-57 Rue de Courcelles, 75008 Paris",
];

const DOC_REMINDER =
  "Ti ricordiamo di voler portare con te un documento di identità in corso di validità e valido per l'espatrio.";

const NOTE_FUTURE =
  "Ulteriori dettagli e i contatti delle assistenti verranno comunicati nei prossimi giorni.";

const NOTE_FUTURE_SHORT =
  "Ulteriori dettagli e i contatti verranno condivisi nei prossimi giorni.";

// --- Builder per famiglie di scenari --------------------------------------

/** Convocazione con volo diretto da un aeroporto italiano (Torino / Milano / Roma). */
function diretto(
  dateLabel: string,
  flight: string,
  call: string[],
  notes: string[] = [NOTE_FUTURE]
): Convocazione {
  return {
    dateLabel,
    flights: [flight],
    call,
    baggage: BAGGAGE_STD,
    parking: true,
    notes,
  };
}

/** Convocazione con volo di avvicinamento verso Roma FCO e poi Parigi. */
function viaFco(localLeg: string, notes: string[] = [NOTE_FUTURE_SHORT]): Convocazione {
  return {
    dateLabel: DOM_20,
    flights: [localLeg, "AZ 318 Roma Fiumicino → Parigi Charles de Gaulle · 11:00 – 13:15"],
    call: [
      "Presentati al banco del check-in del volo due ore prima dell'orario di decollo, munito di un documento d'identità in corso di validità e valido per l'espatrio.",
      "Il bagaglio verrà spedito direttamente all'aeroporto di Parigi Charles de Gaulle.",
      "Una volta arrivato a Roma Fiumicino, recati al meeting point davanti alla Libreria Feltrinelli in area transiti, ad inizio corridoio gates voli ITA (Terminal T1), dove troverai un'assistenza dedicata che ti darà indicazioni sul volo per Parigi.",
    ],
    baggage: BAGGAGE_STD,
    parking: true,
    notes,
  };
}

/**
 * Convocazione per chi arriva a Parigi in autonomia (nessun volo di andata).
 * Non mostra il volo di rientro né la relativa data, e non riporta il parcheggio:
 * queste informazioni restano nel piano viaggi.
 */
function soloRientro(): Convocazione {
  return {
    hotel: HOTEL,
    call: [DOC_REMINDER],
    baggage: BAGGAGE_STD,
    notes: [NOTE_FUTURE],
  };
}

// --- Convocazioni per tipologia di viaggio (chiave scenario) ---------------

const TORINO_20: Convocazione = diretto(
  DOM_20,
  "AF 1103 Torino → Parigi Charles de Gaulle · 10:20 – 11:50",
  [
    "Presentati alle ore 07:50 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino, con un documento d'identità in corso di validità e valido per l'espatrio.",
    "Al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
  ]
);

const MILANO_20: Convocazione = diretto(
  DOM_20,
  "AZ 312 Milano Linate → Parigi Charles de Gaulle · 14:25 – 16:00",
  [
    "Presentati alle ore 12:00 direttamente ai banchi del check-in del volo ITA, area 1, primo piano partenze, aeroporto di Milano Linate, con un documento d'identità in corso di validità e valido per l'espatrio.",
    "Al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
  ]
);

const ROMA_20: Convocazione = diretto(
  DOM_20,
  "AZ 318 Roma Fiumicino → Parigi Charles de Gaulle · 11:00 – 13:15",
  [
    "Presentati alle ore 08:30 direttamente ai banchi del check-in del volo ITA, Terminal T1, aeroporto di Roma Fiumicino, con un documento d'identità in corso di validità e valido per l'espatrio.",
    "Al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
  ]
);

/** Convocazioni indicizzate per chiave scenario (come in lib/scenarios.ts). */
export const CONVOCAZIONI: Record<string, Convocazione> = {
  // --- Voli diretti (andata + ritorno o solo andata) ---
  torinos: TORINO_20,
  milanos: MILANO_20,
  romas: ROMA_20,
  "milano-andata": MILANO_20,
  "roma-andata": ROMA_20,
  // Andata Torino 20 set (il rientro serale non cambia la convocazione di partenza).
  "torino-ritorno-21:10": TORINO_20,

  // --- Torino con date alternative ---
  "torino-18sep": diretto(
    VEN_18,
    "AF 1103 Torino → Parigi Charles de Gaulle · 10:50 – 12:20",
    [
      "Presentati alle ore 08:20 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino.",
      DOC_REMINDER,
    ],
    [] // il testo di origine non riporta la nota finale
  ),
  "torino-19sep": diretto(
    SAB_19,
    "AF 1103 Torino → Parigi Charles de Gaulle · 10:20 – 11:50",
    [
      "Presentati alle ore 07:50 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino, munito di documento d'identità in corso di validità e valido per l'espatrio.",
      "Al tuo arrivo al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
    ]
  ),
  // Andata sabato 19 set (rientro giovedì 24): stessa convocazione di partenza.
  "torino-19-24sep": diretto(
    SAB_19,
    "AF 1103 Torino → Parigi Charles de Gaulle · 10:20 – 11:50",
    [
      "Presentati alle ore 07:50 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino, munito di documento d'identità in corso di validità e valido per l'espatrio.",
      "Al tuo arrivo al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
    ]
  ),

  // --- Voli di avvicinamento via Milano Linate ---
  cagliari: {
    dateLabel: DOM_20,
    flights: [
      "W2 8640 Cagliari → Milano Linate · 08:00 – 09:20",
      "AZ 312 Milano Linate → Parigi Charles de Gaulle · 14:25 – 16:00",
    ],
    call: [
      "Presentati in aeroporto due ore prima del decollo, al banco del check-in del volo, con un documento d'identità in corso di validità e valido per l'espatrio.",
      "Al tuo arrivo a Milano Linate, recupera il bagaglio e dirigiti verso l'uscita. Agli arrivi troverai un'assistenza dedicata che ti accompagnerà ai banchi del check-in del volo per Parigi.",
      "Al banco del check-in troverai un'assistenza dedicata che ti aiuterà nel disbrigo delle pratiche aeroportuali.",
    ],
    baggage: BAGGAGE_STD,
    parking: true,
    notes: [NOTE_FUTURE],
  },

  // --- Voli di avvicinamento via Roma Fiumicino ---
  palermo: viaFco("AZ 1770 Palermo → Roma Fiumicino · 08:00 – 09:10"),
  catania: viaFco("AZ 1736 Catania → Roma Fiumicino · 07:05 – 08:30", [
    "Ulteriori comunicazioni e i contatti delle assistenti verranno forniti nei prossimi giorni.",
  ]),
  bari: viaFco("AZ 1602 Bari → Roma Fiumicino · 06:30 – 07:40"),
  brindisi: viaFco("AZ 1620 Brindisi → Roma Fiumicino · 06:20 – 07:35"),
  lamezia: viaFco("AZ 1162 Lamezia Terme → Roma Fiumicino · 06:15 – 07:30"),
  napoli: viaFco("AZ 1268 Napoli → Roma Fiumicino · 06:35 – 07:25"),

  // --- Solo rientro (arrivo a Parigi in autonomia, nessun volo di andata) ---
  "torino-ritorno": soloRientro(),
  "milano-ritorno": soloRientro(),
  "roma-ritorno": soloRientro(),
  "olbia-ritorno": soloRientro(),

  // --- Mezzi propri (posto auto riservato all'hotel) ---
  "mezzi-propri": {
    dateLabel: DOM_20,
    hotel: [
      "Ti aspettiamo presso l'Hotel Du Collectionneur a partire dalle ore 16:00.",
      "Hotel Du Collectionneur — 51-57 Rue de Courcelles, 75008 Paris",
      "Per te è stato previsto un posto auto riservato per la durata dell'evento.",
      "Lo staff sarà disponibile al tuo arrivo per assistenza.",
    ],
  },
};

// --- Convocazioni personalizzate (per singola persona) ---------------------
// Chiave: id univoco del partecipante in minuscolo. Sovrascrive la convocazione
// per tipologia quando presente.

export const PERSON_CONVOCAZIONI: Record<string, Convocazione> = {
  // Partecipante con convocazione dedicata (scenario torino-ritorno): arriva a
  // Parigi in autonomia, ha il volo di rientro. Testo dedicato dal Word di
  // riferimento. L'associazione id -> nominativo è nel file locale (non versionato).
  "149556d2-c809-4470-b39e-e396c5178bd3": {
    hotel: HOTEL,
    call: [DOC_REMINDER],
    baggage: BAGGAGE_STD,
  },
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
 *   convocazione dedicata (es. torino-17-24sep).
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
  if (conv.dateLabel) out.push(conv.dateLabel);
  out.push("");

  if (conv.hotel?.length) {
    out.push("RITROVO", ...conv.hotel, "");
  }
  if (conv.flights?.length) {
    out.push((conv.flightsLabel ?? "VOLO").toUpperCase(), ...conv.flights, "");
  }
  if (conv.call?.length) {
    out.push("CONVOCAZIONE", ...conv.call, "");
  }
  if (conv.baggage?.length) {
    out.push(
      (conv.baggageLabel ?? "Franchigia bagaglio").toUpperCase(),
      ...conv.baggage.map((b) => `- ${b}`),
      ""
    );
  }
  out.push(BAGGAGE_DISCLAIMER, "");
  if (conv.parking) {
    out.push(
      "PARCHEGGIO",
      "Se desideri prenotare un posto auto a prezzi convenzionati:",
      PARKING_URL,
      ""
    );
  }
  if (conv.notes?.length) {
    out.push(conv.notes.join(" "));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
