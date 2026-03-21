import { cn } from "@/lib/utils";

const statusConfig: Record<string, { color: string, bg: string, border: string }> = {
  "À commander": { 
    color: "text-red-700", 
    bg: "bg-red-50",
    border: "border-red-100"
  },
  "Commandé": { 
    color: "text-amber-700", 
    bg: "bg-amber-50",
    border: "border-amber-100"
  },
  "Reçu - À prévenir": { 
    color: "text-emerald-700", 
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  },
  "Terminé": { 
    color: "text-slate-600", 
    bg: "bg-slate-100",
    border: "border-slate-200"
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig["À commander"];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.color,
      config.bg,
      config.border
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-60")} />
      {status}
    </span>
  );
}
