import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/server/auth/session";

export default async function DoctorDashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const token = (await cookies()).get("shifalink-session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !session.roles.includes("doctor")) {
    redirect(`/${locale}/login?redirect=/${locale}/doctor/summary`);
  }

  return children;
}
