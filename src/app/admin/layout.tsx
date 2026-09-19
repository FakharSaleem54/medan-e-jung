import Link from "next/link";
import { isAuthenticated } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuth && (
        <header className="glass-panel m-2 sm:m-4 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sticky top-2 sm:top-4 z-50">
          <div>
            <div
              className="font-black tracking-[0.2em] text-gaming-accent text-sm sm:text-base"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              MEDAN E JUNG
            </div>
            <div className="text-xs tracking-widest text-military-olive uppercase">DURRANI · HQ Command</div>
          </div>
          <nav className="flex flex-wrap gap-3 sm:gap-5 text-xs tracking-widest uppercase text-military-khaki">
            <Link href="/admin" className="hover:text-gaming-accent transition-colors">Dashboard</Link>
            <Link href="/admin/upload" className="hover:text-gaming-accent transition-colors">Upload</Link>
            <Link href="/admin/players" className="hover:text-gaming-accent transition-colors">Operators</Link>
            <Link href="/matches" className="hover:text-gaming-accent transition-colors">Matches</Link>
            <Link href="/" className="hover:text-gaming-accent transition-colors">← Field</Link>
          </nav>
        </header>
      )}
      <main className="flex-1 p-3 sm:p-4 w-full max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
