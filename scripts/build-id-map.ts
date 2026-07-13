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
  // torino-17-24sep — id forniti manualmente (non presenti nel file Cvent).
  // Elena Baudino, Silvia Bagnasacco.
  "9c1bd2c9-b306-43a9-b755-28189d5b580a": "torino-17-24sep",
  "3d8fcae5-02ea-4b9a-a2dc-65696b78b73e": "torino-17-24sep",
};

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

  writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n", "utf8");
  console.log(`\nScritti ${count} id in ${OUT}.`);
}

main();
