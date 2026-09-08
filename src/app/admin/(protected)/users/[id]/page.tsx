import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { UserEditForm } from "@/components/admin/user-edit-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <UserEditForm user={user} />
    </div>
  );
}
