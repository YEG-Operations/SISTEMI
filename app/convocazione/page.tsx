import { ConvocazionePage } from "@/components/ConvocazionePage";

export default function ConvocazioneRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ConvocazionePage searchParams={searchParams} />;
}
