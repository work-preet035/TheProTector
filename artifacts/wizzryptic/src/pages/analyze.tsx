import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, Copy, Check, Zap } from "lucide-react";
import { useAnalyzeText } from "@workspace/api-client-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const ENGLISH_FREQ: Record<string, number> = {
  e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1,
  r: 6.0, d: 4.3, l: 4.0, c: 2.8, u: 2.8, m: 2.4, w: 2.4, f: 2.2,
  g: 2.0, y: 2.0, p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15, q: 0.1, z: 0.07,
};

const COMMON_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "is", "are", "was", "were", "has", "had", "been", "can", "could",
]);

function caesarShift(text: string, shift: number): string {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
      if (/[A-Z]/.test(char)) return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      return char;
    })
    .join("");
}

function scoreText(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z]+/g) ?? [];
  let score = 0;
  for (const word of words) {
    if (COMMON_WORDS.has(word)) score += word.length * 3;
  }
  // Also score by English letter frequencies
  const counts: Record<string, number> = {};
  let total = 0;
  for (const c of lower) {
    if (/[a-z]/.test(c)) { counts[c] = (counts[c] || 0) + 1; total++; }
  }
  for (const [ch, eng] of Object.entries(ENGLISH_FREQ)) {
    const actual = total > 0 ? ((counts[ch] || 0) / total) * 100 : 0;
    score -= Math.abs(actual - eng);
  }
  return score;
}

interface BruteResult {
  shift: number;
  text: string;
  score: number;
}

type AnalysisResult = {
  frequencies: { char: string; count: number; percentage: number }[];
  mostCommon: string;
  suggestedShift: number;
  totalChars: number;
  alphabeticChars: number;
};

export default function Analyze() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [bruteResults, setBruteResults] = useState<BruteResult[]>([]);
  const [showBrute, setShowBrute] = useState(false);
  const [activeTab, setActiveTab] = useState<"frequency" | "brute">("frequency");

  const analyzeMut = useAnalyzeText();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    const r = await analyzeMut.mutateAsync({ data: { text } });
    setResult(r);
    setShowBrute(false);
    setActiveTab("frequency");
  };

  const handleBruteForce = () => {
    if (!text.trim()) return;
    const results: BruteResult[] = [];
    for (let shift = 1; shift <= 25; shift++) {
      const decoded = caesarShift(text, shift);
      results.push({ shift, text: decoded, score: scoreText(decoded) });
    }
    results.sort((a, b) => b.score - a.score);
    setBruteResults(results);
    setShowBrute(true);
    setActiveTab("brute");
  };

  const chartData = result?.frequencies.slice(0, 26).map((f) => ({
    char: f.char.toUpperCase(),
    actual: f.percentage,
    english: ENGLISH_FREQ[f.char] ?? 0,
  }));

  return (
    <div className="h-full flex flex-col p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-primary font-mono text-sm">// frequency_analyzer</span>
        <h1 className="text-2xl font-mono font-bold text-foreground mb-6 mt-1 tracking-tight">Frequency Analyzer</h1>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs font-mono text-muted-foreground mb-6">
        Paste ciphertext for frequency analysis and Caesar shift suggestion — or run brute-force to try all 25 shifts at once.
      </motion.p>

      {/* Input */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-muted-foreground">CIPHERTEXT INPUT</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your ciphertext here..."
          className="w-full min-h-[90px] bg-background border border-border rounded p-3 font-mono text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
        />
        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={handleBruteForce}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded font-mono text-sm bg-secondary text-foreground hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Zap size={14} />
            Brute Force
          </button>
          <button
            onClick={handleAnalyze}
            disabled={analyzeMut.isPending || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(0,200,80,0.2)]"
          >
            <Activity size={14} />
            {analyzeMut.isPending ? "Analyzing..." : "Analyze Frequency"}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      {(result || showBrute) && (
        <div className="flex gap-1 mb-4 border-b border-border">
          {result && (
            <button
              onClick={() => setActiveTab("frequency")}
              className={`px-4 py-2 font-mono text-xs border-b-2 transition-all -mb-px ${
                activeTab === "frequency"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Frequency Analysis
            </button>
          )}
          {showBrute && (
            <button
              onClick={() => setActiveTab("brute")}
              className={`px-4 py-2 font-mono text-xs border-b-2 transition-all -mb-px flex items-center gap-1.5 ${
                activeTab === "brute"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap size={11} />
              Brute Force (25 shifts)
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Frequency Tab */}
        {activeTab === "frequency" && result && (
          <motion.div key="frequency" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Chars", value: result.totalChars },
                { label: "Alphabetic", value: result.alphabeticChars },
                { label: "Most Common", value: result.mostCommon.toUpperCase() },
                { label: "Suggested Shift", value: result.suggestedShift },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className={`text-2xl font-mono font-bold ${i >= 2 ? "text-primary" : "text-foreground"}`}>{s.value}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">LETTER FREQUENCY DISTRIBUTION</span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-primary inline-block" />Actual</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-blue-500/60 inline-block" />English avg</span>
                </div>
              </div>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barGap={1}>
                    <XAxis dataKey="char" tick={{ fill: "hsl(225,10%,60%)", fontSize: 10, fontFamily: "Fira Code, monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(225,10%,60%)", fontSize: 10, fontFamily: "Fira Code, monospace" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ background: "hsl(225,15%,10%)", border: "1px solid hsl(225,15%,15%)", borderRadius: 6, fontFamily: "Fira Code, monospace", fontSize: 11 }}
                      labelStyle={{ color: "hsl(0,0%,95%)" }}
                      formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name === "actual" ? "Actual" : "English avg"]}
                    />
                    <Bar dataKey="actual" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.char} fill={entry.char === result.mostCommon.toUpperCase() ? "hsl(145,80%,50%)" : "hsl(145,80%,35%)"} />
                      ))}
                    </Bar>
                    <Bar dataKey="english" fill="hsl(220,70%,55%)" opacity={0.5} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground font-mono text-sm">No alphabetic characters found.</div>
              )}
            </div>

            {result.suggestedShift > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="text-xs font-mono text-primary mb-1">SUGGESTED DECRYPTION</div>
                <p className="text-sm font-mono text-foreground/80">
                  Based on frequency analysis, this looks like a <strong className="text-foreground">Caesar cipher with shift {result.suggestedShift}</strong>.
                  The most common letter <strong className="text-primary">{result.mostCommon.toUpperCase()}</strong> maps to <strong className="text-foreground">E</strong> (the most common English letter).
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Brute Force Tab */}
        {activeTab === "brute" && showBrute && (
          <motion.div key="brute" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} className="text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                All 25 shifts ranked by English readability score — highest match at top.
              </span>
            </div>
            <div className="space-y-2 overflow-auto max-h-[500px] pr-1">
              {bruteResults.map((r, i) => (
                <motion.div
                  key={r.shift}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`bg-card border rounded-lg p-3 flex items-start gap-3 transition-colors ${
                    i === 0 ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex flex-col items-center min-w-[48px]">
                    <span className={`text-xs font-mono font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                      shift {r.shift}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-sm break-all line-clamp-2 ${i === 0 ? "text-primary" : "text-foreground/80"}`}>
                      {r.text}
                    </p>
                  </div>
                  <CopyButton text={r.text} />
                </motion.div>
              ))}
            </div>
            <div className="text-xs font-mono text-muted-foreground/50 pt-2 border-t border-border">
              Scoring uses English word dictionary + letter frequency matching. Best match ranked #1.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
