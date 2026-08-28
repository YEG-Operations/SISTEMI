/**
 * Genera lib/activity-map-21.json e lib/activity-map-23.json a partire
 * dall'Excel delle attività per partecipante.
 *
 * Uso:  npx tsx scripts/build-activity-map.ts "import sistemi app.xlsx"
 *       (default: "import sistemi app.xlsx" nella root del progetto)
 *
 * Il file ha due colonne "Invitee ID" (per come è esportato, non è un errore
 * di battitura): una allineata a ogni riga, una seconda che nelle righe
 * aggiunte manualmente in fondo al file resta vuota. Usiamo quindi, per
 * ciascuna riga, la SECONDA colonna "Invitee ID" incontrata se valorizzata,
 * altrimenti la prima come fallback — confermato con l'organizzazione che
 * è la combinazione corretta per tutte le righe del file (verificato: le
 * uniche 5 righe dove le due colonne differiscono sono risolte così).
 *
 * Le colonne sono lette per lettera (non per nome header) perché due colonne
 * con lo stesso nome "Invitee ID" altrimenti si sovrascriverebbero a vicenda
 * in un lookup per nome.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readXlsxRaw } from "./xlsx-read";

const OUT_21 = resolve("lib/activity-map-21.json");
const OUT_23 = resolve("lib/activity-map-23.json");

const COL_NOME = "A";
const COL_COGNOME = "B";
const COL_ATTIVITA_21 = "D";
const COL_ATTIVITA_23 = "E";
const COL_ID_PRIMARIA = "F";
const COL_ID_SECONDARIA = "J";

function buildMap(
  rows: Record<string, string>[],
  col: string
): { map: Record<string, string>; errors: string[] } {
  const map: Record<string, string> = {};
  const errors: string[] = [];

  for (const row of rows) {
    const name = `${row[COL_NOME] ?? ""} ${row[COL_COGNOME] ?? ""}`.trim();
    const id = (row[COL_ID_SECONDARIA] || row[COL_ID_PRIMARIA] || "").trim();
    const activity = (row[col] ?? "").trim();
    if (!id) {
      if (name) errors.push(`${name}: nessun Invitee ID (né F né J).`);
      continue;
    }
    const key = id.toLowerCase();
    if (map[key] && map[key] !== activity) {
      errors.push(`ID duplicato con attività diverse (col. ${col}): ${id} (${name}).`);
    }
    map[key] = activity || "Non iscritto";
  }

  return { map, errors };
}

function main() {
  const file = process.argv[2] ?? "import sistemi app.xlsx";
  const { headerRow, rows } = readXlsxRaw(resolve(file));

  if (rows.length === 0) {
    console.error(`Nessuna riga trovata in ${file}.`);
    process.exit(1);
  }

  console.log(
    `Colonne rilevate — Nome:"${headerRow[COL_NOME]}" Cognome:"${headerRow[COL_COGNOME]}" ` +
      `Attività21:"${headerRow[COL_ATTIVITA_21]}" Attività23:"${headerRow[COL_ATTIVITA_23]}" ` +
      `ID primaria(${COL_ID_PRIMARIA}):"${headerRow[COL_ID_PRIMARIA]}" ID secondaria(${COL_ID_SECONDARIA}):"${headerRow[COL_ID_SECONDARIA]}"`
  );

  const { map: map21, errors: errors21 } = buildMap(rows, COL_ATTIVITA_21);
  const { map: map23, errors: errors23 } = buildMap(rows, COL_ATTIVITA_23);

  const errors = [...new Set([...errors21, ...errors23])];
  if (errors.length) {
    console.error("\nProblemi rilevati:");
    errors.forEach((e) => console.error("  - " + e));
  }

  writeFileSync(OUT_21, JSON.stringify(map21, null, 2) + "\n", "utf8");
  writeFileSync(OUT_23, JSON.stringify(map23, null, 2) + "\n", "utf8");

  console.log(`\nScritti ${Object.keys(map21).length} id in ${OUT_21}.`);
  console.log(`Scritti ${Object.keys(map23).length} id in ${OUT_23}.`);
}

main();
