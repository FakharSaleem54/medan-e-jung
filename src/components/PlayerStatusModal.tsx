"use client";

import { useState, useTransition } from "react";
import { togglePlayerActive } from "@/app/actions";

type PlayerStatusModalProps = {
  players: { id: string; name: string; active: boolean }[];
};

export default function PlayerStatusModal({ players }: PlayerStatusModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, active: boolean) => {
    startTransition(() => {
      togglePlayerActive(id, !active);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs sm:text-sm text-military-khaki hover:text-gaming-accent transition-colors tracking-widest uppercase border border-glass-border px-3 sm:px-4 py-1.5 sm:py-2 rounded shrink-0"
      >
        👥 Status
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md max-h-[80vh] flex flex-col rounded-lg overflow-hidden border border-glass-border">
            <div className="flex justify-between items-center p-4 border-b border-glass-border bg-surface/50">
              <h2
                className="text-lg tracking-[0.2em] uppercase text-military-olive font-bold"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Operator Status
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-military-khaki hover:text-gaming-accent text-xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left">
                <tbody className="divide-y divide-glass-border/50">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold tracking-wide text-text-primary text-sm sm:text-base">
                        {p.name}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggle(p.id, p.active)}
                          disabled={isPending}
                          className={`px-3 py-1 text-xs tracking-widest uppercase font-mono rounded border transition-colors ${
                            p.active 
                              ? "bg-pakistan-green/20 text-green-400 border-green-500/30 hover:bg-pakistan-green/40" 
                              : "bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40"
                          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {p.active ? "ACTIVE" : "AWAY"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-glass-border bg-surface/50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full btn-primary px-4 py-2 rounded text-sm uppercase tracking-widest"
              >
                Close & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
