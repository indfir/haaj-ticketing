import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateEventSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  category: z.enum(["OBSERVATION", "WORKSHOP", "LECTURE", "STARGAZING", "MEETUP", "OTHER"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED", "ARCHIVED"]).optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
  locationName: z.string().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  locationMapUrl: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isOnline: z.boolean().optional(),
  onlineUrl: z.string().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  allowWaitlist: z.boolean().optional(),
  registrationOpensAt: z.string().datetime().optional().nullable(),
  registrationClosesAt: z.string().datetime().optional().nullable(),
  requiresApproval: z.boolean().optional(),
  isMembersOnly: z.boolean().optional(),
  priceIDR: z.number().int().min(0).optional(),
  paymentInfo: z.string().optional().nullable(),
  paymentLink: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  formFields: z.array(z.object({
    id: z.string().optional(),
    label: z.string(),
    helpText: z.string().optional(),
    type: z.enum(["TEXT", "TEXTAREA", "EMAIL", "PHONE", "NUMBER", "SELECT", "MULTISELECT", "CHECKBOX", "DATE"]),
    options: z.any().optional(),
    isRequired: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      formFields: { orderBy: { sortOrder: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found" } }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { formFields, ...eventData } = parsed.data;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Event not found" } }, { status: 404 });
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...eventData,
      ...(eventData.startAt && { startAt: new Date(eventData.startAt) }),
      ...(eventData.endAt && { endAt: new Date(eventData.endAt) }),
      ...(eventData.registrationOpensAt !== undefined && {
        registrationOpensAt: eventData.registrationOpensAt ? new Date(eventData.registrationOpensAt) : null,
      }),
      ...(eventData.registrationClosesAt !== undefined && {
        registrationClosesAt: eventData.registrationClosesAt ? new Date(eventData.registrationClosesAt) : null,
      }),
    },
    include: { formFields: { orderBy: { sortOrder: "asc" } } },
  });

  if (formFields) {
    await prisma.eventFormField.deleteMany({
      where: { eventId: id, id: { notIn: formFields.filter((f) => f.id).map((f) => f.id!) } },
    });

    for (const [i, field] of formFields.entries()) {
      if (field.id) {
        await prisma.eventFormField.update({
          where: { id: field.id },
          data: { ...field, sortOrder: field.sortOrder ?? i },
        });
      } else {
        await prisma.eventFormField.create({
          data: { ...field, eventId: id, sortOrder: field.sortOrder ?? i },
        });
      }
    }
  }

  const updated = await prisma.event.findUnique({
    where: { id },
    include: { formFields: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;
  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
