import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCipherHistory,
  useClearCipherHistory,
  useGetCipherStats,
  getGetCipherHistoryQueryKey,
  getGetCipherStatsQueryKey,
} from "@workspace/api-client-react";

const ALGO_COLORS: Record<string, string> = {
  "Caesar Cipher": "text-green-400 bg-green-400/10 border-green-400/20",
  "ROT13": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "Vigenère Cipher": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Base64": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Atbash Cipher": "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded text-muted-foreground hover:text-primary transition-colors"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
    </button>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function History() {
  const queryClient = useQueryClient();
  const { data: historyData, isLoading } = useGetCipherHistory();
  const { data: statsData } = useGetCipherStats();
  const clearMut = useClearCipherHistory();

  const handleClear = async () => {
    await clearMut.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getGetCipherHistoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCipherStatsQueryKey() });
  };

  const items = historyData?.items ?? [];
  const stats = statsData;

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-primary font-mono text-sm">// operation_history</span>
        <div className="flex items-center justify-between mt-1 mb-6">
          <h1 className="text-2xl font-mono font-bold text-foreground tracking-tight">History</h1>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearMut.isPending}
              className="flex items-center gap-2 px-3 py-2 rounded font-mono text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border hover:border-destructive/30 transition-all"
            >
              <Trash2 size={13} />
              Clear History
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      {stats && stats.totalOperations > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-primary">{stats.totalOperations}</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Total Operations</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-mono font-bold text-foreground">{stats.mostUsedAlgorithm}</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Most Used</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-xs font-mono text-muted-foreground mb-2">By Algorithm</div>
            <div className="flex flex-col gap-1">
              {Object.entries(stats.byAlgorithm).slice(0, 3).map(([algo, count]) => (
                <div key={algo} className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground truncate max-w-[100px]">{algo}</span>
                  <span className="text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* History List */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground font-mono text-sm animate-pulse">Loading history...</span>
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
            <Clock size={28} className="text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-mono text-sm">No cipher operations yet.</p>
          <p className="text-muted-foreground/50 font-mono text-xs">Use the Cipher Lab to get started.</p>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-auto space-y-3">
          <AnimatePresence>
            {items.map((item, i) => {
              const colorClass = ALGO_COLORS[item.algorithm] || "text-primary bg-primary/10 border-primary/20";
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${colorClass}`}>
                        {item.algorithm}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground/60 border border-border px-2 py-0.5 rounded">
                        {item.mode}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50">{formatTime(item.timestamp)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">INPUT</div>
                      <div className="flex items-start gap-1">
                        <span className="text-xs font-mono text-foreground/80 break-all line-clamp-2 flex-1">{item.input}</span>
                        <CopyButton text={item.input} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">OUTPUT</div>
                      <div className="flex items-start gap-1">
                        <span className="text-xs font-mono text-primary break-all line-clamp-2 flex-1">{item.output}</span>
                        <CopyButton text={item.output} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
