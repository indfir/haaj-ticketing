import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createEventSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  category: z.enum(["OBSERVATION", "WORKSHOP", "LECTURE", "STARGAZING", "MEETUP", "OTHER"]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  timezone: z.string().default("Asia/Jakarta"),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationMapUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  allowWaitlist: z.boolean().default(false),
  registrationOpensAt: z.string().datetime().optional(),
  registrationClosesAt: z.string().datetime().optional(),
  requiresApproval: z.boolean().default(false),
  isMembersOnly: z.boolean().default(false),
  priceIDR: z.number().int().min(0).default(0),
  paymentInfo: z.string().optional().nullable(),
  paymentLink: z.string().optional().nullable(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  formFields: z.array(z.object({
    label: z.string(),
    helpText: z.string().optional(),
    type: z.enum(["TEXT", "TEXTAREA", "EMAIL", "PHONE", "NUMBER", "SELECT", "MULTISELECT", "CHECKBOX", "DATE"]),
    options: z.any().optional(),
    isRequired: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { formFields, ...eventData } = parsed.data;

  let createdById = session.user.id;
  if (!createdById && session.user.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    createdById = dbUser?.id;
  }
  if (!createdById) {
    const fallbackUser = await prisma.user.findFirst();
    createdById = fallbackUser?.id!;
  }

  const event = await prisma.event.create({
    data: {
      ...eventData,
      startAt: new Date(eventData.startAt),
      endAt: new Date(eventData.endAt),
      registrationOpensAt: eventData.registrationOpensAt ? new Date(eventData.registrationOpensAt) : null,
      registrationClosesAt: eventData.registrationClosesAt ? new Date(eventData.registrationClosesAt) : null,
      createdById,
      formFields: formFields
        ? {
            create: formFields.map((f, i) => ({
              ...f,
              sortOrder: f.sortOrder ?? i,
            })),
          }
        : undefined,
    },
    include: { formFields: true },
  });

  return NextResponse.json({ event }, { status: 201 });
}
