import { Link, useLocation } from "wouter";
import { LayoutDashboard, FlaskConical, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/Design-Olivier_1773856555630.webp";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
    { href: "/preparations", label: "Préparations", icon: FlaskConical },
    { href: "/inbody", label: "InBody", icon: Activity },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-xl shadow-slate-200/50 hidden md:flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-center">
        <img
          src={logoPath}
          alt="Pharmacie l'Olivier"
          className="h-14 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-slate-100">
        <div className="bg-gradient-to-br from-secondary/50 to-secondary/10 rounded-2xl p-4 border border-secondary/20">
          <p className="text-sm font-semibold text-secondary-foreground">Besoin d'aide ?</p>
          <p className="text-xs text-secondary-foreground/70 mt-1">Contactez le support technique.</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Tableau", icon: LayoutDashboard },
    { href: "/preparations", label: "Préparations", icon: FlaskConical },
    { href: "/inbody", label: "InBody", icon: Activity },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 z-50 flex justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
        return (
          <Link key={item.href} href={item.href} className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[56px]",
            isActive ? "text-primary" : "text-slate-400"
          )}>
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
