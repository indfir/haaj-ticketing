import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
