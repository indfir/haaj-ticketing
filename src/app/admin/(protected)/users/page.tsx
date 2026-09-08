import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          createdEvents: true,
          checkIns: true,
        },
      },
    },
  });

  const roleColors: Record<string, "success" | "warning" | "destructive" | "muted" | "info"> = {
    SUPERADMIN: "destructive",
    ORGANIZER: "success",
    CHECKIN_STAFF: "info",
  };

  return (
    <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6 sm:mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Users
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage admin users and their roles.
          </p>
        </div>
        <Link
          href="/admin/users/create"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
        >
          Invite User
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="border border-[var(--border)] rounded-lg p-12 bg-[var(--card)] text-center">
          <p className="text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
            No users yet
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Invite your first admin user to get started.
          </p>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">User</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Role</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Events</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Check-ins</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Joined</th>
                <th className="text-center px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Status</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium">{user.name ?? "Unnamed"}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={roleColors[user.role] ?? "muted"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-center tabular-nums">
                    {user._count.createdEvents}
                  </td>
                  <td className="px-5 py-3 text-center tabular-nums">
                    {user._count.checkIns}
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {formatInTimeZone(user.createdAt, "Asia/Jakarta", "d MMM yyyy")}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={user.isActive ? "success" : "muted"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
