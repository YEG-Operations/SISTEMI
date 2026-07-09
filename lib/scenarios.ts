/**
 * Dati degli scenari di viaggio per l'evento Sistemi 50 (#Parigi 20-23 set 2026).
 * Fonte: "SISTEMI_PARIGI 2026_26.06.30.xlsx" (foglio "Master list Parigi").
 *
 * La persona apre un link con ?Param=<scenario> e vede la soluzione corrispondente.
 * Alcuni scenari includono anche voli di avvicinamento (es. Palermo → Roma prima
 * dell'andata Roma → Parigi, e Roma → Palermo dopo il ritorno).
 */

export type FlightLeg = {
  /** Fase del viaggio: i voli di avvicinamento precedono l'andata / seguono il ritorno. */
  phase: "Avvicinamento andata" | "Andata" | "Ritorno" | "Avvicinamento ritorno";
  /** Data leggibile, es. "Domenica 20 settembre 2026". */
  date: string;
  /** Operativo volo, es. "AF 1103 Torino → Paris Charles de Gaulle". */
  flight: string;
  /** Aeroporto/città di partenza (estratto per la card). */
  from: string;
  /** Aeroporto/città di arrivo. */
  to: string;
  /** Orario di partenza "HH:MM". */
  departure: string;
  /** Orario di arrivo "HH:MM". */
  arrival: string;
  /** Franchigia bagagli (una voce per riga). */
  baggage: string[];
};

/** Franchigia bagagli: identica per tutte le tratte con volo. */
const BAGGAGE = [
  "1 bagaglio da stiva 23 kg",
  "1 bagaglio a mano (massimo 8 kg, dimensioni 55 × 35 × 25 cm) più un accessorio personale (es. borsa a mano) da riporre sotto il sedile",
];

const VEN_18 = "Venerdì 18 settembre 2026";
const SAB_19 = "Sabato 19 settembre 2026";
const DOM_20 = "Domenica 20 settembre 2026";
const MER_23 = "Mercoledì 23 settembre 2026";
const GIO_24 = "Giovedì 24 settembre 2026";

function leg(
  phase: FlightLeg["phase"],
  date: string,
  flight: string,
  from: string,
  to: string,
  departure: string,
  arrival: string
): FlightLeg {
  return { phase, date, flight, from, to, departure, arrival, baggage: BAGGAGE };
}

/**
 * Voli principali da/per Parigi. La data è parametrica perché alcuni scenari
 * partono il 18/19 settembre o rientrano il 24.
 */
const TORINO = {
  andata: (date: string) =>
    leg(
      "Andata",
      date,
      "AF 1103 Torino → Paris Charles de Gaulle",
      "Torino (TRN)",
      "Paris Charles de Gaulle (CDG)",
      "10:20",
      "11:50"
    ),
  ritorno: (date: string) =>
    leg(
      "Ritorno",
      date,
      "AF 1702 Paris Charles de Gaulle → Torino",
      "Paris Charles de Gaulle (CDG)",
      "Torino (TRN)",
      "15:40",
      "17:05"
    ),
  ritornoSera: (date: string) =>
    leg(
      "Ritorno",
      date,
      "AF 1502 Paris Charles de Gaulle → Torino",
      "Paris Charles de Gaulle (CDG)",
      "Torino (TRN)",
      "21:10",
      "22:35"
    ),
};

const MILANO = {
  // Il master Excel riporta 18:20 come arrivo dell'andata: refuso (coincide con
  // l'arrivo del ritorno; la tratta LIN→CDG dura ~1h30). Confermato 16:00.
  andata: (date: string) =>
    leg(
      "Andata",
      date,
      "AZ 312 Milano Linate → Paris Charles de Gaulle",
      "Milano Linate (LIN)",
      "Paris Charles de Gaulle (CDG)",
      "14:30",
      "16:00"
    ),
  ritorno: (date: string) =>
    leg(
      "Ritorno",
      date,
      "AZ 313 Paris Charles de Gaulle → Milano Linate",
      "Paris Charles de Gaulle (CDG)",
      "Milano Linate (LIN)",
      "16:50",
      "18:20"
    ),
};

const ROMA = {
  andata: (date: string) =>
    leg(
      "Andata",
      date,
      "AZ 318 Roma Fiumicino → Paris Charles de Gaulle",
      "Roma Fiumicino (FCO)",
      "Paris Charles de Gaulle (CDG)",
      "11:00",
      "13:15"
    ),
  ritorno: (date: string) =>
    leg(
      "Ritorno",
      date,
      "AZ 325 Paris Charles de Gaulle → Roma Fiumicino",
      "Paris Charles de Gaulle (CDG)",
      "Roma Fiumicino (FCO)",
      "18:15",
      "20:25"
    ),
};

export type Scenario = {
  /** Titolo mostrato in pagina. */
  title: string;
  /** Sottotitolo/descrizione breve. */
  subtitle: string;
  /** Tratte da mostrare in ordine cronologico (0–4). Vuoto = senza voli (mezzi propri). */
  legs: FlightLeg[];
  /** Messaggio speciale (es. mezzi propri). Mostrato al posto delle card. */
  notice?: string;
};

/**
 * Scenario con voli di avvicinamento via un hub (Roma o Milano): fino a 4 tratte
 * in ordine cronologico (avvicinamento, andata, ritorno, avvicinamento ritorno).
 */
function viaHub(
  city: string,
  hubName: string,
  hub: typeof ROMA | typeof MILANO,
  avvicinamentoAndata: FlightLeg,
  avvicinamentoRitorno: FlightLeg
): Scenario {
  return {
    title: `Il tuo viaggio · ${city}`,
    subtitle: `Voli di andata e ritorno da/per ${city} via ${hubName}`,
    legs: [
      avvicinamentoAndata,
      hub.andata(DOM_20),
      hub.ritorno(MER_23),
      avvicinamentoRitorno,
    ],
  };
}

/**
 * Gli scenari, indicizzati per valore del parametro (case-insensitive).
 * Le chiavi corrispondono ai valori "TIPO DI REGISTRAZIONE" del master Excel.
 */
export const SCENARIOS: Record<string, Scenario> = {
  // --- Andata + Ritorno completi (date standard 20 → 23 settembre) ---
  torinos: {
    title: "Il tuo viaggio · Torino",
    subtitle: "Volo di andata e ritorno da/per Torino",
    legs: [TORINO.andata(DOM_20), TORINO.ritorno(MER_23)],
  },
  milanos: {
    title: "Il tuo viaggio · Milano",
    subtitle: "Volo di andata e ritorno da/per Milano",
    legs: [MILANO.andata(DOM_20), MILANO.ritorno(MER_23)],
  },
  romas: {
    title: "Il tuo viaggio · Roma",
    subtitle: "Volo di andata e ritorno da/per Roma",
    legs: [ROMA.andata(DOM_20), ROMA.ritorno(MER_23)],
  },

  // --- Andata + Ritorno con date/orari alternativi (Torino) ---
  "torino-18sep": {
    title: "Il tuo viaggio · Torino",
    subtitle: "Andata venerdì 18 settembre, ritorno mercoledì 23 in serata",
    legs: [TORINO.andata(VEN_18), TORINO.ritornoSera(MER_23)],
  },
  "torino-19sep": {
    title: "Il tuo viaggio · Torino",
    subtitle: "Andata sabato 19 settembre, ritorno mercoledì 23",
    legs: [TORINO.andata(SAB_19), TORINO.ritorno(MER_23)],
  },
  "torino-19-24sep": {
    title: "Il tuo viaggio · Torino",
    subtitle: "Andata sabato 19 settembre, ritorno giovedì 24",
    legs: [TORINO.andata(SAB_19), TORINO.ritorno(GIO_24)],
  },
  // --- Andata + Ritorno con voli di avvicinamento via Milano ---
  cagliari: viaHub(
    "Cagliari",
    "Milano Linate",
    MILANO,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "W2 8640 Cagliari → Milano Linate",
      "Cagliari (CAG)",
      "Milano Linate (LIN)",
      "08:00",
      "09:20"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "W2 8645 Milano Linate → Cagliari",
      "Milano Linate (LIN)",
      "Cagliari (CAG)",
      "21:30",
      "22:50"
    )
  ),

  // --- Andata + Ritorno con voli di avvicinamento via Roma ---
  palermo: viaHub(
    "Palermo",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1770 Palermo → Roma Fiumicino",
      "Palermo (PMO)",
      "Roma Fiumicino (FCO)",
      "08:00",
      "09:10"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1789 Roma Fiumicino → Palermo",
      "Roma Fiumicino (FCO)",
      "Palermo (PMO)",
      "21:20",
      "22:30"
    )
  ),
  catania: viaHub(
    "Catania",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1728 Catania → Roma Fiumicino",
      "Catania (CTA)",
      "Roma Fiumicino (FCO)",
      "08:05",
      "09:30"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1719 Roma Fiumicino → Catania",
      "Roma Fiumicino (FCO)",
      "Catania (CTA)",
      "21:15",
      "22:30"
    )
  ),
  bari: viaHub(
    "Bari",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1602 Bari → Roma Fiumicino",
      "Bari (BRI)",
      "Roma Fiumicino (FCO)",
      "06:30",
      "07:40"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1603 Roma Fiumicino → Bari",
      "Roma Fiumicino (FCO)",
      "Bari (BRI)",
      "21:50",
      "22:55"
    )
  ),
  brindisi: viaHub(
    "Brindisi",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1620 Brindisi → Roma Fiumicino",
      "Brindisi (BDS)",
      "Roma Fiumicino (FCO)",
      "06:20",
      "07:35"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1625 Roma Fiumicino → Brindisi",
      "Roma Fiumicino (FCO)",
      "Brindisi (BDS)",
      "21:45",
      "23:00"
    )
  ),
  lamezia: viaHub(
    "Lamezia Terme",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1162 Lamezia Terme → Roma Fiumicino",
      "Lamezia Terme (SUF)",
      "Roma Fiumicino (FCO)",
      "06:15",
      "07:30"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1173 Roma Fiumicino → Lamezia Terme",
      "Roma Fiumicino (FCO)",
      "Lamezia Terme (SUF)",
      "21:50",
      "23:00"
    )
  ),
  napoli: viaHub(
    "Napoli",
    "Roma Fiumicino",
    ROMA,
    leg(
      "Avvicinamento andata",
      DOM_20,
      "AZ 1268 Napoli → Roma Fiumicino",
      "Napoli (NAP)",
      "Roma Fiumicino (FCO)",
      "06:35",
      "07:25"
    ),
    leg(
      "Avvicinamento ritorno",
      MER_23,
      "AZ 1267 Roma Fiumicino → Napoli",
      "Roma Fiumicino (FCO)",
      "Napoli (NAP)",
      "21:45",
      "22:40"
    )
  ),

  // --- Solo ritorno ---
  "torino-ritorno": {
    title: "Il tuo rientro · Torino",
    subtitle: "Volo di ritorno da Parigi a Torino",
    legs: [TORINO.ritorno(MER_23)],
  },
  "torino-ritorno-21:10": {
    title: "Il tuo rientro · Torino",
    subtitle: "Volo di ritorno da Parigi a Torino in serata",
    legs: [TORINO.ritornoSera(MER_23)],
  },
  "milano-ritorno": {
    title: "Il tuo rientro · Milano",
    subtitle: "Volo di ritorno da Parigi a Milano",
    legs: [MILANO.ritorno(MER_23)],
  },
  "roma-ritorno": {
    title: "Il tuo rientro · Roma",
    subtitle: "Volo di ritorno da Parigi a Roma",
    legs: [ROMA.ritorno(MER_23)],
  },
  "olbia-ritorno": {
    title: "Il tuo rientro · Olbia",
    subtitle: "Volo di ritorno da Parigi a Olbia via Milano Linate",
    legs: [
      MILANO.ritorno(MER_23),
      leg(
        "Avvicinamento ritorno",
        MER_23,
        "W2 8468 Milano Linate → Olbia",
        "Milano Linate (LIN)",
        "Olbia (OLB)",
        "21:00",
        "22:10"
      ),
    ],
  },

  // --- Solo andata ---
  "milano-andata": {
    title: "La tua andata · Milano",
    subtitle: "Volo di andata da Milano a Parigi",
    legs: [MILANO.andata(DOM_20)],
  },
  "roma-andata": {
    title: "La tua andata · Roma",
    subtitle: "Volo di andata da Roma a Parigi",
    legs: [ROMA.andata(DOM_20)],
  },

  // --- Mezzi propri ---
  "mezzi-propri": {
    title: "Viaggio con mezzi propri",
    subtitle: "Raggiungi Parigi in autonomia",
    legs: [],
    notice:
      "Per questo evento raggiungerai Parigi con mezzi propri. Conserva le ricevute di viaggio: per indicazioni su rimborsi, parcheggi e logistica contatta l'organizzazione dell'evento.",
  },
};

// Mappa id univoco partecipante → chiave scenario. Generata dall'Excel delle
// correlazioni con `npm run build-id-map` (vedi scripts/build-id-map.ts).
import idMap from "./id-map.json";

const ID_MAP: Record<string, string> = idMap;

/**
 * Risolve il parametro del link nello scenario corretto.
 *
 * Il parametro è l'**id univoco** del partecipante (es. il GUID Cvent): viene
 * cercato nella mappa id → scenario. In sviluppo accettiamo anche il nome diretto
 * dello scenario (es. ?param=torinos) per comodità di test.
 */
export function resolveScenario(param: string | null | undefined): Scenario | null {
  if (!param) return null;
  const raw = param.trim().toLowerCase();

  // 1) id univoco del partecipante → scenario
  const mapped = ID_MAP[raw];
  if (mapped && SCENARIOS[mapped]) return SCENARIOS[mapped]!;

  // 2) solo in sviluppo: nome scenario diretto (?param=torinos)
  if (process.env.NODE_ENV !== "production") {
    const key = raw.replace(/\s+/g, "-");
    if (SCENARIOS[key]) return SCENARIOS[key]!;
  }

  return null;
}

/** Elenco delle chiavi scenario (per la pagina indice di test in sviluppo). */
export const SCENARIO_KEYS = Object.keys(SCENARIOS);

/** Elenco degli id validi (per i link di test in sviluppo). */
export const ID_KEYS = Object.keys(ID_MAP);
