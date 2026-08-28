import type { ActivityResult } from "@/lib/activities";

/** Card attività in stile "carta d'imbarco" brandizzata Sistemi. */
export function ActivityCard({
  dateLabel,
  icon,
  result,
}: {
  dateLabel: string;
  icon: string;
  result: ActivityResult;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card">
      {/* Fascia superiore con data come titolo e icona a destra */}
      <div className="flex items-center justify-between bg-sistemi-red px-5 py-3 text-white">
        <span className="text-sm font-bold uppercase tracking-wide">
          {dateLabel}
        </span>
        <span aria-hidden className="text-lg">
          {icon}
        </span>
      </div>

      <div className="px-5 py-6 text-center">
        {result.status === "assigned" ? (
          <p className="text-lg font-extrabold leading-snug text-sistemi-ink">
            {result.name}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-sistemi-ink/60">
            Nessuna attività registrata per questa giornata.
          </p>
        )}
      </div>
    </section>
  );
}
