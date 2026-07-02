# Sistemi 50 — Soluzioni di viaggio (#Parigi 20-23 settembre 2026)

Web app che mostra a ogni partecipante la propria **soluzione di viaggio** per
l'evento del 50° di Sistemi, in base a un parametro nel link.

Un link con `?Param=<scenario>` mostra lo scenario corrispondente:

```
https://<dominio>/?Param=torinos
```

## I parametri

Fonte dati: master Excel "SISTEMI_PARIGI 2026" (foglio "Master list Parigi").
Alcuni scenari includono **voli di avvicinamento** (andata e/o ritorno) via
Roma Fiumicino o Milano Linate, mostrati come card aggiuntive.

| `?Param=` | Mostra |
|-----------|--------|
| `torinos` | Torino — andata + ritorno (20 → 23 set) |
| `milanos` | Milano — andata + ritorno |
| `romas` | Roma — andata + ritorno |
| `torino-18sep` | Torino — andata ven 18 set, ritorno mer 23 in serata (AF 1502) |
| `torino-19sep` | Torino — andata sab 19 set, ritorno mer 23 |
| `torino-19-24sep` | Torino — andata sab 19 set, ritorno gio 24 |
| `cagliari` | Cagliari — A/R via Milano Linate (4 voli) |
| `palermo` | Palermo — A/R via Roma Fiumicino (4 voli) |
| `catania` | Catania — A/R via Roma Fiumicino (4 voli) |
| `bari` | Bari — A/R via Roma Fiumicino (4 voli) |
| `brindisi` | Brindisi — A/R via Roma Fiumicino (4 voli) |
| `lamezia` | Lamezia Terme — A/R via Roma Fiumicino (4 voli) |
| `napoli` | Napoli — A/R via Roma Fiumicino (4 voli) |
| `torino-ritorno` | Torino — solo ritorno |
| `torino-ritorno-21:10` | Torino — solo ritorno serale (AF 1502, 21:10) |
| `milano-ritorno` | Milano — solo ritorno |
| `roma-ritorno` | Roma — solo ritorno |
| `olbia-ritorno` | Olbia — solo ritorno, via Milano Linate (2 voli) |
| `milano-andata` | Milano — solo andata |
| `roma-andata` | Roma — solo andata |
| `mezzi-propri` | Messaggio "viaggio con mezzi propri" (nessun volo) |

Il parametro è case-insensitive. Un parametro mancante o non valido mostra un
messaggio neutro ("Soluzione non trovata").

## Stack

- **Next.js 15 (App Router) + TypeScript**, **Tailwind CSS**.
- Nessun database: i contenuti sono statici in [`lib/scenarios.ts`](lib/scenarios.ts).
- Deploy nativo su **Vercel**.

```
app/page.tsx            legge ?Param= e mostra lo scenario
lib/scenarios.ts        dati degli scenari (voli, orari, bagaglio)
components/FlightCard.tsx   card volo stile "carta d'imbarco"
components/BrandHeader.tsx  intestazione brandizzata Sistemi 50
lib/security.ts         security headers
middleware.ts           applica gli header
public/brand/           logo e banner Sistemi
```

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000 (in sviluppo vedi un indice con tutti i link di test)
oppure direttamente http://localhost:3000/?Param=torinos

## Build

```bash
npm run build && npm start
```

## Aggiornare i dati di viaggio

Modifica [`lib/scenarios.ts`](lib/scenarios.ts): i voli principali da/per Parigi
(Torino, Milano, Roma, con data parametrica), i voli di avvicinamento e la
composizione degli scenari. Per aggiungere uno scenario, inserisci una nuova
chiave in `SCENARIOS`.

## Deploy su Vercel

1. Importa il repository su Vercel (rileva automaticamente Next.js).
2. Nessuna variabile d'ambiente richiesta.
3. Deploy. Assegna il dominio e distribuisci i link `?Param=...` ai partecipanti.
