/**
 * Genera lib/id-map.json a partire dall'Excel delle correlazioni id → scenario.
 *
 * Uso:  npx tsx scripts/build-id-map.ts uniqueid.xlsx
 *       (default: uniqueid.xlsx nella root del progetto)
 *
 * L'Excel deve avere due colonne: l'ID univoco del partecipante (es. "Invitee ID")
 * e lo scenario di viaggio (es. "Viaggio"). I nomi degli scenari vengono normalizzati
 * sulle chiavi valide di SCENARIOS (vedi lib/scenarios.ts).
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SCENARIOS } from "../lib/scenarios";
import { readXlsx } from "./xlsx-read";

const OUT = resolve("lib/id-map.json");

/** Alias per nomi che non si normalizzano direttamente sulla chiave scenario. */
const ALIASES: Record<string, string> = {
  torino: "torinos",
  milano: "milanos",
  roma: "romas",
  "mezzi-propri": "mezzi-propri",
};

/**
 * Correzioni manuali id → scenario, applicate DOPO la lettura dell'Excel.
 * Servono quando lo scenario di un partecipante va cambiato ma il file sorgente
 * non è (ancora) aggiornato: così la modifica sopravvive a una rigenerazione.
 * Chiavi in minuscolo. Lo scenario deve esistere in SCENARIOS.
 */
const OVERRIDES: Record<string, string> = {
  // Spostati da romas a catania (richiesta manuale).
  "4db002a3-9001-4dda-9e01-8d6382c7a993": "catania",
  "658b22cd-d955-477b-8b7e-04bf79831523": "catania",
  // Elena Baudino e Silvia Bagnasacco erano forzate su torino-17-24sep, ma il
  // loro viaggio è quello del file Cvent: partenza del 18 settembre, come
  // Alessia Girardi. L'override è stato tolto perché rimetteva il 17.
  // torino-19-24sep — id forniti manualmente (non presenti nel file Cvent).
  // Flavia Giuliana Brero, Lidia Brero.
  "4eb0afca-7a03-436b-8bf2-94aece1d04a5": "torino-19-24sep",
  "6370c061-75e1-499e-b669-448b88947e5a": "torino-19-24sep",
  // Filippo Ravenni: nessun rientro su Roma, resta la sola andata.
  "f3b67120-fd14-4810-b292-f9d1019f65cf": "roma-andata",
  // Bretella Cagliari → Linate anticipata al 19 set (XZ 2354 al posto del
  // W2 8640 del 20): vale per questo solo partecipante, gli altri di `cagliari`
  // restano al 20.
  "3c6516d8-c09d-4d9a-9a94-af85b16cd1b2": "cagliari-19sep",
  // Non vola in andata (raggiunge Parigi in autonomia), usufruisce del solo
  // volo di rientro su Milano Linate: da `milanos` a `milano-ritorno`.
  "d9ab6529-04e3-4d02-92b9-05b65a6ef113": "milano-ritorno",
  // Aggiunta l'andata AF 1103 del 20 set: da solo rientro su Torino a viaggio
  // completo, quindi `torinos`.
  "149556d2-c809-4470-b39e-e396c5178bd3": "torinos",
  // Marco Cosci: il rientro su Roma non è più a nostro carico, se l'è prenotato
  // da sé. Resta il solo transfer per l'aeroporto (vedi convocazione), quindi
  // niente tratte da mostrare: da `roma-ritorno` a `solo-transfer`.
  "a29917dd-65c8-41b1-b0fc-b3d94fc37bd3": "solo-transfer",
};

/**
 * Partecipanti da escludere: non fanno più parte del viaggio (rinunce o
 * cancellazioni). Restano elencati qui, e non semplicemente tolti dal JSON,
 * perché altrimenti tornerebbero alla prima rigenerazione dall'Excel.
 * Il loro link porta a /info come un id sconosciuto.
 */
const ESCLUSI: string[] = [
  "0900f56c-812a-429e-b1b1-d73369b593b7", // era romas
  "4c793e25-a3dd-4763-9254-691ae7847500", // era palermo
  "f4a3db86-560b-428e-86a9-f9f06263be03", // era palermo
  "2e6f0fe0-fb3d-4170-aaf8-356e9b5c1654", // era romas
  "ca93bde0-599c-42e8-8260-710683c29536", // era romas
  "9952bee3-b249-42c3-a6a6-2374f6ca5cf4", // era torino-ritorno-21:10
  "eb4da38b-2645-4263-a4dc-6060d5a83c3e", // era milanos
  "0c712775-5d6c-4884-ad07-56620459c8c3", // era torino-19-24sep
];

/** Porta un valore "Viaggio" dell'Excel alla chiave scenario corretta. */
function normalizeScenario(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const resolved = ALIASES[key] ?? key;
  return SCENARIOS[resolved] ? resolved : null;
}

/** Individua le colonne id e scenario in modo tollerante ai nomi dell'header. */
function pickColumns(headers: string[]): { idCol: string; scenarioCol: string } {
  const idCol =
    headers.find((h) => /id/i.test(h)) ?? headers[0]!;
  const scenarioCol =
    headers.find((h) => /viagg|scenario|trasfer|volo|registrazion/i.test(h)) ??
    headers.find((h) => h !== idCol) ??
    headers[1]!;
  return { idCol, scenarioCol };
}

function main() {
  const file = process.argv[2] ?? "uniqueid.xlsx";
  const { headers, rows } = readXlsx(resolve(file));
  if (rows.length === 0) {
    console.error(`Nessuna riga trovata in ${file}.`);
    process.exit(1);
  }

  const { idCol, scenarioCol } = pickColumns(headers);
  console.log(`Colonna ID: "${idCol}"  |  Colonna scenario: "${scenarioCol}"`);

  const map: Record<string, string> = {};
  const errors: string[] = [];
  let count = 0;

  for (const row of rows) {
    const id = (row[idCol] ?? "").trim();
    const rawScenario = (row[scenarioCol] ?? "").trim();
    if (!id && !rawScenario) continue; // riga vuota
    if (!id) {
      errors.push(`Riga senza ID (scenario "${rawScenario}").`);
      continue;
    }
    const scenario = normalizeScenario(rawScenario);
    if (!scenario) {
      errors.push(`ID ${id}: scenario non riconosciuto "${rawScenario}".`);
      continue;
    }
    // Gli id sono case-insensitive: salviamo in minuscolo.
    const key = id.toLowerCase();
    if (map[key] && map[key] !== scenario) {
      errors.push(`ID duplicato con scenari diversi: ${id}.`);
    }
    map[key] = scenario;
    count++;
  }

  if (errors.length) {
    console.error("\nProblemi rilevati:");
    errors.forEach((e) => console.error("  - " + e));
    if (count === 0) process.exit(1);
  }

  // Applica le correzioni manuali (vedi OVERRIDES).
  for (const [id, scenario] of Object.entries(OVERRIDES)) {
    if (!SCENARIOS[scenario]) {
      console.error(`OVERRIDE: scenario inesistente "${scenario}" per ${id}.`);
      continue;
    }
    const from = map[id] ?? "(assente)";
    map[id] = scenario;
    console.log(`Override: ${id}  ${from} → ${scenario}`);
  }

  // Toglie chi non partecipa più (vedi ESCLUSI).
  for (const id of ESCLUSI) {
    if (map[id]) {
      console.log(`Escluso: ${id}  (era ${map[id]})`);
      delete map[id];
    }
  }

  writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n", "utf8");
  console.log(`\nScritti ${Object.keys(map).length} id in ${OUT}.`);
}

main();
