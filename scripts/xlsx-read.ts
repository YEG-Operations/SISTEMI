/**
 * Lettore .xlsx minimale e senza dipendenze.
 * Un .xlsx è uno zip di XML; usiamo `unzip` (presente su macOS/Linux) per estrarlo
 * e poi parsifichiamo sharedStrings + il primo foglio con semplici regex.
 * Sufficiente per file tabellari semplici (id, scenario).
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, "\n")
    .replace(/&apos;/g, "'");
}

export type Sheet = { headers: string[]; rows: Record<string, string>[] };

/**
 * Riga come letta dal foglio, indicizzata per lettera di colonna (A, B, C, ...)
 * invece che per nome header. Utile quando l'header ha nomi duplicati (es. due
 * colonne "Invitee ID"): `readXlsx` in quel caso perde la prima, perché scrive
 * entrambe nella stessa chiave dell'oggetto per riga.
 */
export type RawSheet = { headerRow: Record<string, string>; rows: Record<string, string>[] };

/** Legge il primo foglio grezzo, per lettera di colonna (A, B, C, ...). */
export function readXlsxRaw(filePath: string): RawSheet {
  const grid = parseSheetGrid(filePath);
  const rowNums = Object.keys(grid)
    .map(Number)
    .sort((a, b) => a - b);
  if (rowNums.length === 0) return { headerRow: {}, rows: [] };

  const headerRow = grid[rowNums[0]!]!;
  const rows = rowNums.slice(1).map((rn) => grid[rn] ?? {});
  return { headerRow, rows };
}

/** Parsifica il primo foglio in una grid { riga: { colonna: valore } }. */
function parseSheetGrid(filePath: string): Record<number, Record<string, string>> {
  const dir = mkdtempSync(join(tmpdir(), "xlsx-"));
  try {
    execFileSync("unzip", ["-o", filePath, "-d", dir], { stdio: "ignore" });

    // sharedStrings (opzionale: alcuni file usano inline strings).
    const strings: string[] = [];
    const ssPath = join(dir, "xl", "sharedStrings.xml");
    if (existsSync(ssPath)) {
      const ss = readFileSync(ssPath, "utf8");
      const siRe = /<si>([\s\S]*?)<\/si>/g;
      let m: RegExpExecArray | null;
      while ((m = siRe.exec(ss))) {
        const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
        let t: RegExpExecArray | null;
        let txt = "";
        while ((t = tRe.exec(m[1]!))) txt += t[1];
        strings.push(decodeEntities(txt));
      }
    }

    const sheet = readFileSync(
      join(dir, "xl", "worksheets", "sheet1.xml"),
      "utf8",
    );
    // Ogni tag <c> può essere self-closing (cella vuota, es. <c r="F1" s="3"/>)
    // oppure aperto con contenuto e chiusura </c>. Le due forme vanno matchate
    // come alternative COMPLETE e indipendenti (ognuna col proprio prefisso
    // <c r="...">): condividere un prefisso lazy comune fa sì che, davanti a
    // più celle self-closing consecutive, il branch "con contenuto" catturi
    // erroneamente fino al prossimo </c> disponibile, sfasando le colonne.
    const cellRe =
      /<c r="([A-Z]+)(\d+)"[^>]*\/>|<c r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>/g;
    const grid: Record<number, Record<string, string>> = {};
    let c: RegExpExecArray | null;
    while ((c = cellRe.exec(sheet))) {
      if (c[1]) {
        // Cella self-closing: vuota.
        (grid[Number(c[2])] = grid[Number(c[2])] || {})[c[1]] = "";
        continue;
      }
      const col = c[3]!;
      const row = Number(c[4]);
      const attrs = c[5]!;
      const inner = c[6]!;
      const typeM = /\st="([^"]*)"/.exec(attrs);
      const type = typeM?.[1];
      let val = "";
      const vM = /<v>([\s\S]*?)<\/v>/.exec(inner);
      const isM = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
      if (type === "s" && vM) val = strings[parseInt(vM[1]!, 10)] ?? "";
      else if (isM) val = decodeEntities(isM[1]!);
      else if (vM) val = vM[1]!;
      (grid[row] = grid[row] || {})[col] = val.trim();
    }

    return grid;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Legge il primo foglio di un .xlsx come { headers, rows }. */
export function readXlsx(filePath: string): Sheet {
  const grid = parseSheetGrid(filePath);
  const rowNums = Object.keys(grid)
    .map(Number)
    .sort((a, b) => a - b);
  if (rowNums.length === 0) return { headers: [], rows: [] };

  const headerRow = grid[rowNums[0]!]!;
  const cols = Object.keys(headerRow).sort();
  const headers = cols.map((col) => headerRow[col]!);

  const rows = rowNums.slice(1).map((rn) => {
    const obj: Record<string, string> = {};
    cols.forEach((col, i) => {
      obj[headers[i]!] = grid[rn]?.[col] ?? "";
    });
    return obj;
  });

  return { headers, rows };
}
