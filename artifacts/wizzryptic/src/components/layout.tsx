import { Link, useLocation } from "wouter";
import { Terminal, History, Activity, Info } from "lucide-react";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Cipher Lab", icon: Terminal },
    { href: "/history", label: "History", icon: History },
    { href: "/analyze", label: "Analyze", icon: Activity },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-xs">
            TP
          </div>
          <h1 className="font-mono font-bold text-lg tracking-wider text-primary">
            The ProTector
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const active = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all font-mono text-sm ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={18} className={active ? "text-primary" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border text-xs text-muted-foreground font-mono text-center">
          SYSTEM_READY_ //
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 pointer-events-none z-[-1] opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background" />
        {children}
      </main>
    </div>
  );
}
