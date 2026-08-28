/**
 * Attività scelte per partecipante per le giornate del 21 e 23 settembre 2026.
 * Fonte: "import sistemi app.xlsx" (colonne "Attività 21/09/2026" e
 * "Attività 23/09/2026"), stesso Invitee ID già usato per lib/scenarios.ts.
 *
 * Le mappe id → attività sono generate con `npm run build-activity-map`
 * (vedi scripts/build-activity-map.ts) in lib/activity-map-21.json e
 * lib/activity-map-23.json.
 */

import activityMap21 from "./activity-map-21.json";
import activityMap23 from "./activity-map-23.json";

export type ActivityDay = "21" | "23";

export type ActivityResult =
  | { status: "assigned"; name: string }
  | { status: "not-registered" };

export const DATE_LABEL: Record<ActivityDay, string> = {
  "21": "Lunedì 21 settembre 2026",
  "23": "Mercoledì 23 settembre 2026",
};

const ACTIVITY_MAP: Record<ActivityDay, Record<string, string>> = {
  "21": activityMap21,
  "23": activityMap23,
};

function resolveDay(
  day: ActivityDay,
  raw: string
): ActivityResult | null {
  const name = ACTIVITY_MAP[day][raw];
  if (!name) return null;
  if (name === "Non iscritto") return { status: "not-registered" };
  return { status: "assigned", name };
}

/**
 * Risolve il parametro del link nelle attività assegnate al partecipante
 * per entrambe le giornate (21 e 23 settembre).
 *
 * Il parametro è l'**id univoco** del partecipante (lo stesso usato per i
 * voli). Se l'id non è presente in nessuna delle due mappe, ritorna null
 * (id sconosciuto → redirect a /info).
 */
export function resolveActivities(
  param: string | null | undefined
): Record<ActivityDay, ActivityResult> | null {
  if (!param) return null;
  const raw = param.trim().toLowerCase();

  const day21 = resolveDay("21", raw);
  const day23 = resolveDay("23", raw);
  if (!day21 && !day23) return null;

  return {
    "21": day21 ?? { status: "not-registered" },
    "23": day23 ?? { status: "not-registered" },
  };
}

/** Elenco degli id validi (per l'indice di test in sviluppo). */
export function activityIdKeys(): string[] {
  return Object.keys(activityMap21);
}
