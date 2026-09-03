/**
 * Genera lib/contacts.json: associazione Nome, Cognome, Email, Invitee ID
 * a partire da "import sistemi app.xlsx" (colonne A/B/C + Invitee ID in F o J).
 *
 * Uso:  npx tsx scripts/build-contacts.ts "import sistemi app.xlsx"
 *       (default: "import sistemi app.xlsx" nella root del progetto)
 *
 * Non è usato a runtime dall'app: è un riferimento locale per operazioni
 * manuali (trovare l'id di un partecipante dato nome/cognome/email).
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readXlsxRaw } from "./xlsx-read";

const OUT = resolve("lib/contacts.json");

const COL_NOME = "A";
const COL_COGNOME = "B";
const COL_EMAIL = "C";
const COL_ID_PRIMARIA = "F";
const COL_ID_SECONDARIA = "J";

type Contact = { nome: string; cognome: string; email: string; id: string };

function main() {
  const file = process.argv[2] ?? "import sistemi app.xlsx";
  const { rows } = readXlsxRaw(resolve(file));

  if (rows.length === 0) {
    console.error(`Nessuna riga trovata in ${file}.`);
    process.exit(1);
  }

  const contacts: Contact[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const nome = (row[COL_NOME] ?? "").trim();
    const cognome = (row[COL_COGNOME] ?? "").trim();
    const email = (row[COL_EMAIL] ?? "").trim();
    const id = (row[COL_ID_SECONDARIA] || row[COL_ID_PRIMARIA] || "").trim();

    if (!nome && !cognome) continue;
    if (!id) {
      errors.push(`${nome} ${cognome}: nessun Invitee ID (né F né J).`);
      continue;
    }
    contacts.push({ nome, cognome, email, id: id.toUpperCase() });
  }

  if (errors.length) {
    console.error("\nProblemi rilevati:");
    errors.forEach((e) => console.error("  - " + e));
  }

  writeFileSync(OUT, JSON.stringify(contacts, null, 2) + "\n", "utf8");
  console.log(`\nScritti ${contacts.length} contatti in ${OUT}.`);
}

main();
