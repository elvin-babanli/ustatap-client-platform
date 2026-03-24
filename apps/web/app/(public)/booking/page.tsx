import { BookingFlow } from "./_components/BookingFlow";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ masterId?: string; serviceId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <BookingFlow
        masterId={params.masterId ?? ""}
        preselectedServiceId={params.serviceId ?? ""}
      />
    </div>
  );
}
