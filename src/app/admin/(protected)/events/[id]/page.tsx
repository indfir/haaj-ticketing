import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventEditor } from "@/components/admin/event-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      formFields: { orderBy: { sortOrder: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  return <EventEditor event={event} />;
}
