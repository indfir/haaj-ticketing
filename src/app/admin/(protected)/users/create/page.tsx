import { prisma } from "@/lib/db";
import { UserCreateForm } from "@/components/admin/user-create-form";

export const dynamic = "force-dynamic";

export default function CreateUserPage() {
  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <UserCreateForm />
    </div>
  );
}
