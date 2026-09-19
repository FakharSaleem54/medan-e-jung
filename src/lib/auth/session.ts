import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "cod_admin_session";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "default_family_secret";

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session || session.value !== ADMIN_SECRET) {
    redirect("/admin/login");
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session && session.value === ADMIN_SECRET;
}
