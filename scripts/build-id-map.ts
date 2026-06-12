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
    headers.find((h) => /viagg|scenario|trasfer|volo/i.test(h)) ??
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

  writeFileSync(OUT, JSON.stringify(map, null, 2) + "\n", "utf8");
  console.log(`\nScritti ${count} id in ${OUT}.`);
}

main();
