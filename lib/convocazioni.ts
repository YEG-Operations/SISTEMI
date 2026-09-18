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
 * riferiscono e non in fondo alla card: in più tratte le assistenze sono
 * diverse (es. un referente per il primo volo, altre solo al transito di
 * Fiumicino) e un elenco unico in coda non direbbe chi chiamare e quando.
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

/**
 * Una giornata di viaggio: il suo volo e la sua convocazione, in sequenza.
 * Serve a chi parte su due giorni — la bretella il 19, il volo per Parigi il
 * 20: tenere insieme tutti i voli e poi tutte le indicazioni costringerebbe a
 * saltare avanti e indietro tra due date.
 */
export type Giornata = { date: string; flights?: string[]; call?: CallStep[] };

/** Blocco di una convocazione. Tutti i campi sono opzionali: si mostra solo ciò che serve. */
export type Convocazione = {
  /** Data principale mostrata nella fascia della card (assente per chi non ha volo di andata). */
  dateLabel?: string;
  /** Operativo/i di volo, una riga per tratta. */
  flights?: string[];
  /** Etichetta della sezione voli (default "Volo"). */
  flightsLabel?: string;
  /** Dove/quando presentarsi e altre indicazioni operative. */
  call?: CallStep[];
  /** Viaggio su più giorni: volo e convocazione di ciascuno, in ordine. Alternativo a flights/call. */
  days?: Giornata[];
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

/**
 * Clausola obbligatoria, presente in tutte le convocazioni che riguardano un
 * volo. Chi raggiunge Parigi in auto non la vede: parla di bagaglio a mano da
 * imbarcare in stiva.
 */
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

/**
 * Boarding pass in app: presente nei Word delle partenze in cui il check-in è
 * già stato fatto dall'organizzazione (via Roma FCO e Cagliari).
 * Evidenziata: è l'unica riga che richiede un'azione prima di partire.
 */
const BOARDING_PASS: CallStep = {
  text: 'La tua boarding pass è disponibile nella sezione dedicata "Boarding Pass", all\'interno di questa app.',
  bold: true,
};

const DOC_ESPATRIO = "un documento di identità in corso di validità e valido per l'espatrio";

const ATTIVO_CONVOCAZIONE = "attivo dall'ora di convocazione";
const ATTIVA_CONVOCAZIONE = "attiva dall'ora di convocazione";
const ATTIVA_MATTINO_20 = "attiva dal mattino del 20 settembre";

/** Presentazione al check-in "due ore prima" per un volo specifico. */
const duePrima = (volo: string) =>
  `Sei pregato di presentarti al banco check-in del volo ${volo} due ore prima dell'orario di decollo, munito di ${DOC_ESPATRIO}.`;

/** Presentazione al check-in a un orario preciso per un volo specifico. */
const allOra = (volo: string, ora: string) =>
  `Sei pregato di presentarti al banco check-in del volo ${volo} alle ore ${ora}, munito di ${DOC_ESPATRIO}.`;

/** Assistenti al transito di Roma Fiumicino: identiche per tutte le partenze via FCO. */
const CONTATTI_TRANSITO_FCO: Contact[] = [
  { name: "Assistenza ai transiti", phone: "+39 335 779 1234", note: ATTIVA_MATTINO_20 },
  { name: "Alessandra", phone: "+39 338 844 6639", note: ATTIVA_MATTINO_20 },
];

/**
 * Transito a Roma Fiumicino: bagaglio spedito a Parigi e meeting point
 * Feltrinelli. I recapiti delle assistenti stanno su questa riga perché
 * rispondono solo per il transito, non per il volo di partenza.
 */
const FCO_TRANSITO: CallStep[] = [
  "Il tuo bagaglio verrà spedito direttamente all'aeroporto di Parigi Charles de Gaulle.",
  conContatti(
    "Una volta arrivato a Roma Fiumicino, recati al meeting point della Libreria Feltrinelli in area transiti, ad inizio corridoio gates voli ITA (Terminal T1), dove troverai le nostre assistenti dedicate che ti daranno indicazioni sul volo per Parigi.",
    ...CONTATTI_TRANSITO_FCO
  ),
];

/**
 * Riferimento di supporto per chi non ha un'assistente al banco del check-in.
 * Sta sempre subito sotto la riga della boarding pass: chi non trova la carta
 * d'imbarco in app è proprio chi ha bisogno di chiamare qualcuno.
 */
const DAVIDE: CallStep = conContatti("Contatto in caso di necessità:", {
  name: "Davide",
  phone: "+39 345 071 0247",
  note: ATTIVO_CONVOCAZIONE,
});

// --- Builder per famiglie di scenari --------------------------------------

/** Convocazione con volo diretto da un aeroporto italiano (Torino / Milano / Roma). */
function diretto(
  dateLabel: string,
  flight: string,
  call: CallStep[],
  notes: string[] = []
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

/**
 * Convocazione con volo di avvicinamento verso Roma FCO e poi Parigi.
 * `apertura` sono le righe specifiche dell'aeroporto di partenza (orario di
 * presentazione ed eventuale assistente in loco); il transito a Fiumicino è
 * identico per tutti.
 */
function viaFco(localLeg: string, apertura: CallStep[]): Convocazione {
  return {
    dateLabel: DOM_20,
    flights: [localLeg, "AZ 318 Roma Fiumicino → Parigi Charles de Gaulle · 11:00 – 13:15"],
    call: [...apertura, ...FCO_TRANSITO],
    baggage: BAGGAGE_STD,
    parking: true,
  };
}

/**
 * Convocazione per chi arriva a Parigi in autonomia (nessun volo di andata).
 * Non mostra il volo di rientro, né il parcheggio: restano nel piano viaggi.
 * La data è quella del ritrovo in hotel (domenica 20), non quella del rientro.
 */
function soloRientro(): Convocazione {
  return {
    dateLabel: DOM_20,
    hotel: HOTEL,
    call: [DOC_REMINDER],
    baggageLabel: "Franchigia bagaglio volo di rientro",
    baggage: BAGGAGE_STD,
    notes: [NOTE_FUTURE],
  };
}

// --- Convocazioni per tipologia di viaggio (chiave scenario) ---------------

const TORINO_20: Convocazione = diretto(
  DOM_20,
  "AF 1103 Torino → Parigi Charles de Gaulle · 10:20 – 11:50",
  [
    `Presentati alle ore 07:50 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino, con ${DOC_ESPATRIO}.`,
    conContatti(
      "Al banco del check-in troverai le assistenti dedicate Giada e Andreana, che ti aiuteranno con le pratiche di check-in e la consegna del bagaglio.",
      { name: "Giada", phone: "+39 340 051 3990", note: ATTIVA_CONVOCAZIONE },
      { name: "Andreana", phone: "+39 335 693 2876", note: ATTIVA_CONVOCAZIONE }
    ),
  ]
);

const MILANO_20: Convocazione = diretto(
  DOM_20,
  "AZ 312 Milano Linate → Parigi Charles de Gaulle · 14:25 – 16:00",
  [
    `Presentati alle ore 12:00 direttamente ai banchi del check-in del volo ITA, area 1, primo piano partenze, aeroporto di Milano Linate, con ${DOC_ESPATRIO}.`,
    conContatti(
      "Al banco del check-in troverai le assistenti dedicate Youstina e Martina, che ti aiuteranno con le pratiche di check-in e la consegna del bagaglio.",
      { name: "Youstina", phone: "+39 380 349 1575", note: ATTIVA_CONVOCAZIONE },
      { name: "Martina", phone: "+39 329 229 8549", note: ATTIVA_CONVOCAZIONE }
    ),
  ]
);

const ROMA_20: Convocazione = diretto(
  DOM_20,
  "AZ 318 Roma Fiumicino → Parigi Charles de Gaulle · 11:00 – 13:15",
  [
    `Presentati alle ore 08:30 direttamente ai banchi del check-in del volo ITA, Terminal T1, aeroporto di Roma Fiumicino, con ${DOC_ESPATRIO}.`,
    conContatti(
      "Al banco del check-in troverai l'assistente dedicata Samantha, che ti aiuterà con le pratiche di check-in e la consegna del bagaglio.",
      { name: "Samantha", phone: "+39 379 182 9181", note: ATTIVA_CONVOCAZIONE }
    ),
  ]
);

// Partenza del 19 da Torino: il testo dà del "voi" (è una convocazione rivolta
// al gruppo che parte insieme), a differenza delle altre che danno del "tu".
const TORINO_19: Convocazione = diretto(
  SAB_19,
  "AF 1103 Torino → Parigi Charles de Gaulle · 10:20 – 11:50",
  [
    `Presentatevi alle ore 08:15 direttamente ai banchi del check-in del volo, primo piano partenze, aeroporto di Torino, muniti di ${DOC_ESPATRIO}.`,
    conContatti(
      "Al vostro arrivo al banco del check-in troverete Giada, che vi fornirà le carte di imbarco e il fast track.",
      { name: "Giada", phone: "+39 340 051 3990", note: ATTIVA_CONVOCAZIONE }
    ),
  ]
);

/** Convocazioni indicizzate per chiave scenario (come in lib/scenarios.ts). */
export const CONVOCAZIONI: Record<string, Convocazione> = {
  // --- Voli diretti (andata + ritorno o solo andata) ---
  torinos: TORINO_20,
  milanos: MILANO_20,
  romas: ROMA_20,
  // Solo andata: la convocazione di partenza è identica a Milano/Roma. Andranno
  // però scorporati quando arriveranno le convocazioni del rientro, che per
  // loro non esiste.
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
  // Partenza del 19 set da Torino: convocazione alle 08:15 (non 07:50 come il
  // 20) e carte di imbarco consegnate in aeroporto insieme al fast track.
  "torino-19sep": TORINO_19,
  // Andata sabato 19 set (rientro giovedì 24): stessa convocazione di partenza.
  "torino-19-24sep": TORINO_19,

  // --- Voli di avvicinamento via Milano Linate ---
  cagliari: {
    dateLabel: DOM_20,
    flights: [
      "XZ 2354 Cagliari → Milano Linate · 08:00 – 09:20",
      "AZ 312 Milano Linate → Parigi Charles de Gaulle · 14:25 – 16:00",
    ],
    call: [
      `Sei pregato di recarti in aeroporto a Cagliari due ore prima del decollo del volo, al banco check-in del volo, con ${DOC_ESPATRIO}.`,
      BOARDING_PASS,
      // A Cagliari non c'è un'assistente al banco: il riferimento è Davide.
      DAVIDE,
      conContatti(
        "Al tuo arrivo a Milano Linate, recupera il bagaglio e dirigiti verso l'uscita. Agli arrivi troverai Youstina, che ti accompagnerà ai banchi check-in del volo per Parigi e ti aiuterà nelle pratiche di check-in e di consegna del bagaglio.",
        { name: "Youstina", phone: "+39 380 349 1575", note: ATTIVA_MATTINO_20 }
      ),
    ],
    baggage: BAGGAGE_STD,
    parking: true,
  },
  // Bretella Cagliari → Linate anticipata al 19 settembre (scenario
  // `cagliari-19sep`): tra le due tratte c'è una notte, quindi non vale
  // l'assistenza agli arrivi di Linate prevista dallo scenario `cagliari`.
  // Le due giornate si susseguono complete — volo e convocazione del 19, poi
  // volo e convocazione del 20 — perché sono due partenze distinte: il 19 da
  // Cagliari (due ore prima, senza assistente in loco), il 20 da Linate come
  // per `milanos`.
  "cagliari-19sep": {
    days: [
      {
        date: SAB_19,
        flights: ["XZ 2354 Cagliari → Milano Linate · 08:00 – 09:20"],
        call: [
          `Sei pregato di recarti in aeroporto a Cagliari due ore prima del decollo del volo, al banco check-in del volo, con ${DOC_ESPATRIO}.`,
          BOARDING_PASS,
          DAVIDE,
        ],
      },
      {
        date: DOM_20,
        flights: ["AZ 312 Milano Linate → Parigi Charles de Gaulle · 14:25 – 16:00"],
        call: [
          `Presentati alle ore 12:00 direttamente ai banchi del check-in del volo ITA, area 1, primo piano partenze, aeroporto di Milano Linate, con ${DOC_ESPATRIO}.`,
          conContatti(
            "Al banco del check-in troverai le assistenti dedicate Youstina e Martina, che ti aiuteranno con le pratiche di check-in e la consegna del bagaglio.",
            { name: "Youstina", phone: "+39 380 349 1575", note: ATTIVA_CONVOCAZIONE },
            { name: "Martina", phone: "+39 329 229 8549", note: ATTIVA_CONVOCAZIONE }
          ),
        ],
      },
    ],
    baggage: BAGGAGE_STD,
    parking: true,
  },

  // --- Voli di avvicinamento via Roma Fiumicino ---
  palermo: viaFco("AZ 1770 Palermo → Roma Fiumicino · 08:00 – 09:10", [
    allOra("AZ 1770", "06:00"),
    conContatti(
      "Al banco del check-in troverai l'assistente dedicata Lucrezia, che ti aiuterà nelle procedure di check-in e nell'imbarco del bagaglio.",
      { name: "Lucrezia", phone: "+39 328 569 7651", note: ATTIVA_CONVOCAZIONE }
    ),
  ]),
  catania: viaFco("AZ 1736 Catania → Roma Fiumicino · 07:05 – 08:30", [
    allOra("AZ 1736", "05:05"),
    conContatti(
      "Al banco del check-in troverai l'assistente dedicata Daniela Luana, che ti aiuterà nelle procedure di check-in e nell'imbarco del bagaglio.",
      { name: "Daniela Luana", phone: "+39 333 801 5882", note: ATTIVA_CONVOCAZIONE }
    ),
  ]),
  // Partenze senza assistente in aeroporto di origine: il riferimento per il
  // primo volo è Davide, le assistenti di Fiumicino rispondono solo al transito.
  bari: viaFco("AZ 1602 Bari → Roma Fiumicino · 06:30 – 07:40", [
    duePrima("AZ 1602"),
    BOARDING_PASS,
    DAVIDE,
  ]),
  brindisi: viaFco("AZ 1620 Brindisi → Roma Fiumicino · 06:20 – 07:35", [
    duePrima("AZ 1620"),
    BOARDING_PASS,
    DAVIDE,
  ]),
  lamezia: viaFco("AZ 1162 Lamezia Terme → Roma Fiumicino · 06:15 – 07:30", [
    duePrima("AZ 1162"),
    BOARDING_PASS,
    DAVIDE,
  ]),
  napoli: viaFco("AZ 1268 Napoli → Roma Fiumicino · 06:35 – 07:25", [
    duePrima("AZ 1268"),
    BOARDING_PASS,
    DAVIDE,
  ]),

  // --- Solo rientro (arrivo a Parigi in autonomia, nessun volo di andata) ---
  "torino-ritorno": soloRientro(),
  "milano-ritorno": soloRientro(),
  "roma-ritorno": soloRientro(),
  "olbia-ritorno": soloRientro(),

  // --- Mezzi propri (posto auto riservato all'hotel) ---
  // Nessun volo e nessun bagaglio: la clausola sul bagaglio a mano imbarcato in
  // stiva non ha senso per chi raggiunge Parigi in auto (vedi BAGGAGE_DISCLAIMER).
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
  // Nessun override attivo: l'unico partecipante che ne aveva uno (arrivo a
  // Parigi in autonomia, solo volo di rientro) ha ora l'andata AF 1103 del
  // 20 set e usa la convocazione standard di Torino.
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
  const sezioniVolo = (g: { flights?: string[]; call?: CallStep[] }) => {
    if (g.flights?.length) {
      out.push((conv.flightsLabel ?? "VOLO").toUpperCase(), ...g.flights, "");
    }
    if (g.call?.length) out.push("CONVOCAZIONE", ...righeCall(g.call), "");
  };

  if (conv.days?.length) {
    // Viaggio su più giorni: ogni giornata con il suo volo e la sua convocazione.
    for (const g of conv.days) {
      out.push(g.date.toUpperCase(), "");
      sezioniVolo(g);
    }
  } else {
    sezioniVolo(conv);
  }
  if (conv.baggage?.length) {
    out.push(
      (conv.baggageLabel ?? "Franchigia bagaglio").toUpperCase(),
      ...conv.baggage.map((b) => `- ${b}`),
      ""
    );
    out.push(BAGGAGE_DISCLAIMER, "");
  }
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
