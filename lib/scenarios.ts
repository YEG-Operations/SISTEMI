/**
 * Dati degli scenari di viaggio per l'evento Sistemi 50 (#Parigi 20-23 set 2026).
 * Fonte: "LISTA TEST PER APP - SISTEMI.xlsx" (date/orari decodificati dal formato Excel).
 *
 * La persona apre un link con ?Param=<scenario> e vede la soluzione corrispondente.
 * Gli 8 parametri sono fissi (vedi SCENARIOS in fondo).
 */

export type FlightLeg = {
  /** Etichetta "Andata" / "Ritorno". */
  phase: "Andata" | "Ritorno";
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
  /** Franchigia bagagli. */
  baggage: string;
};

/** Franchigia bagagli: identica per tutte le tratte nel file. */
const BAGGAGE =
  "1 bagaglio a mano da 8 kg (55 × 35 × 25 cm) in cappelliera + 1 accessorio a scelta tra zainetto, borsetta o PC portatile sotto il sedile.";

const DATE_ANDATA = "Domenica 20 settembre 2026";
const DATE_RITORNO = "Mercoledì 23 settembre 2026";

/** Le 3 tratte base con andata e ritorno, dai dati del file. */
const ROUTES = {
  torino: {
    city: "Torino",
    outbound: {
      phase: "Andata",
      date: DATE_ANDATA,
      flight: "AF 1103 Torino → Paris Charles de Gaulle",
      from: "Torino (TRN)",
      to: "Paris Charles de Gaulle (CDG)",
      departure: "10:20",
      arrival: "11:50",
      baggage: BAGGAGE,
    },
    return: {
      phase: "Ritorno",
      date: DATE_RITORNO,
      flight: "AF 1702 Paris Charles de Gaulle → Torino",
      from: "Paris Charles de Gaulle (CDG)",
      to: "Torino (TRN)",
      departure: "15:40",
      arrival: "17:05",
      baggage: BAGGAGE,
    },
  },
  milano: {
    city: "Milano",
    outbound: {
      phase: "Andata",
      date: DATE_ANDATA,
      flight: "AZ 312 Milano Linate → Paris Charles de Gaulle",
      from: "Milano Linate (LIN)",
      to: "Paris Charles de Gaulle (CDG)",
      departure: "14:30",
      arrival: "16:00",
      baggage: BAGGAGE,
    },
    return: {
      phase: "Ritorno",
      date: DATE_RITORNO,
      flight: "AZ 313 Paris Charles de Gaulle → Milano Linate",
      from: "Paris Charles de Gaulle (CDG)",
      to: "Milano Linate (LIN)",
      departure: "16:50",
      arrival: "18:20",
      baggage: BAGGAGE,
    },
  },
  roma: {
    city: "Roma",
    outbound: {
      phase: "Andata",
      date: DATE_ANDATA,
      flight: "AZ 318 Roma Fiumicino → Paris Charles de Gaulle",
      from: "Roma Fiumicino (FCO)",
      to: "Paris Charles de Gaulle (CDG)",
      departure: "11:00",
      arrival: "13:15",
      baggage: BAGGAGE,
    },
    return: {
      phase: "Ritorno",
      date: DATE_RITORNO,
      flight: "AZ 325 Paris Charles de Gaulle → Roma Fiumicino",
      from: "Paris Charles de Gaulle (CDG)",
      to: "Roma Fiumicino (FCO)",
      departure: "18:15",
      arrival: "20:25",
      baggage: BAGGAGE,
    },
  },
} as const satisfies Record<
  string,
  { city: string; outbound: FlightLeg; return: FlightLeg }
>;

export type Scenario = {
  /** Titolo mostrato in pagina. */
  title: string;
  /** Sottotitolo/descrizione breve. */
  subtitle: string;
  /** Tratte da mostrare (0, 1 o 2). Vuoto = scenario senza voli (mezzi propri). */
  legs: FlightLeg[];
  /** Messaggio speciale (es. mezzi propri). Mostrato al posto delle card. */
  notice?: string;
};

/**
 * Gli 8 scenari, indicizzati per valore del parametro (case-insensitive).
 * Le chiavi corrispondono esattamente ai parametri richiesti.
 */
export const SCENARIOS: Record<string, Scenario> = {
  // --- Andata + Ritorno completi ---
  torinos: {
    title: "Il tuo viaggio · Torino",
    subtitle: "Volo di andata e ritorno da/per Torino",
    legs: [ROUTES.torino.outbound, ROUTES.torino.return],
  },
  milanos: {
    title: "Il tuo viaggio · Milano",
    subtitle: "Volo di andata e ritorno da/per Milano",
    legs: [ROUTES.milano.outbound, ROUTES.milano.return],
  },
  romas: {
    title: "Il tuo viaggio · Roma",
    subtitle: "Volo di andata e ritorno da/per Roma",
    legs: [ROUTES.roma.outbound, ROUTES.roma.return],
  },

  // --- Solo ritorno ---
  "torino-ritorno": {
    title: "Il tuo rientro · Torino",
    subtitle: "Volo di ritorno da Parigi a Torino",
    legs: [ROUTES.torino.return],
  },
  "milano-ritorno": {
    title: "Il tuo rientro · Milano",
    subtitle: "Volo di ritorno da Parigi a Milano",
    legs: [ROUTES.milano.return],
  },
  "roma-ritorno": {
    title: "Il tuo rientro · Roma",
    subtitle: "Volo di ritorno da Parigi a Roma",
    legs: [ROUTES.roma.return],
  },

  // --- Solo andata ---
  "milano-andata": {
    title: "La tua andata · Milano",
    subtitle: "Volo di andata da Milano a Parigi",
    legs: [ROUTES.milano.outbound],
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

/** Normalizza il parametro (case-insensitive, spazi → trattini) e risolve lo scenario. */
export function resolveScenario(param: string | null | undefined): Scenario | null {
  if (!param) return null;
  const key = param.trim().toLowerCase().replace(/\s+/g, "-");
  return SCENARIOS[key] ?? null;
}

/** Elenco dei parametri validi (per la pagina indice di test). */
export const SCENARIO_KEYS = Object.keys(SCENARIOS);
