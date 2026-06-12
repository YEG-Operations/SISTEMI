# Sistemi 50 — Soluzioni di viaggio (#Parigi 20-23 settembre 2026)

Web app che mostra a ogni partecipante la propria **soluzione di viaggio** per
l'evento del 50° di Sistemi, in base a un parametro nel link.

Un link con `?Param=<scenario>` mostra lo scenario corrispondente:

```
https://<dominio>/?Param=torinos
```

## Gli 8 parametri

| `?Param=` | Mostra |
|-----------|--------|
| `torinos` | Torino — andata + ritorno |
| `milanos` | Milano — andata + ritorno |
| `romas` | Roma — andata + ritorno |
| `torino-ritorno` | Torino — solo ritorno |
| `milano-ritorno` | Milano — solo ritorno |
| `roma-ritorno` | Roma — solo ritorno |
| `milano-andata` | Milano — solo andata |
| `mezzi-propri` | Messaggio "viaggio con mezzi propri" (nessun volo) |

Il parametro è case-insensitive. Un parametro mancante o non valido mostra un
messaggio neutro ("Soluzione non trovata").

## Stack

- **Next.js 15 (App Router) + TypeScript**, **Tailwind CSS**.
- Nessun database: i contenuti sono statici in [`lib/scenarios.ts`](lib/scenarios.ts).
- Deploy nativo su **Vercel**.

```
app/page.tsx            legge ?Param= e mostra lo scenario
lib/scenarios.ts        dati degli 8 scenari (voli, orari, bagaglio)
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

Modifica [`lib/scenarios.ts`](lib/scenarios.ts): le 3 tratte base (Torino, Milano,
Roma) con andata/ritorno, e la composizione degli 8 scenari. Per aggiungere uno
scenario, inserisci una nuova chiave in `SCENARIOS`.

## Deploy su Vercel

1. Importa il repository su Vercel (rileva automaticamente Next.js).
2. Nessuna variabile d'ambiente richiesta.
3. Deploy. Assegna il dominio e distribuisci i link `?Param=...` ai partecipanti.
