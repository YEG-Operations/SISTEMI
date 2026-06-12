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

/** Legge il primo foglio di un .xlsx come { headers, rows }. */
export function readXlsx(filePath: string): Sheet {
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
    const cellRe =
      /<c r="([A-Z]+)(\d+)"(?:[^>]*t="([^"]*)")?[^>]*>([\s\S]*?)<\/c>/g;
    const grid: Record<number, Record<string, string>> = {};
    let c: RegExpExecArray | null;
    while ((c = cellRe.exec(sheet))) {
      const col = c[1]!;
      const row = Number(c[2]);
      const type = c[3];
      const inner = c[4]!;
      let val = "";
      const vM = /<v>([\s\S]*?)<\/v>/.exec(inner);
      const isM = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
      if (type === "s" && vM) val = strings[parseInt(vM[1]!, 10)] ?? "";
      else if (isM) val = decodeEntities(isM[1]!);
      else if (vM) val = vM[1]!;
      (grid[row] = grid[row] || {})[col] = val.trim();
    }

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
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
