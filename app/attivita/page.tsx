import { ActivityPage } from "@/components/ActivityPage";

export default function AttivitaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ActivityPage searchParams={searchParams} />;
}
