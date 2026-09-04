/**
 * Azioni della pagina convocazione: al momento solo il ritorno al piano viaggi.
 * (Il download PDF è stato rimosso perché la pagina gira embeddata nell'iframe
 * di Cvent, dove i download vengono bloccati.)
 */
export function ConvocazioneActions({ backHref }: { backHref: string }) {
  return (
    <div className="flex">
      <a
        href={backHref}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sistemi-red/30 bg-white px-5 py-3 text-sm font-semibold text-sistemi-red shadow-card transition hover:bg-sistemi-red/5"
      >
        <span aria-hidden>←</span>
        Torna al piano viaggi
      </a>
    </div>
  );
}
