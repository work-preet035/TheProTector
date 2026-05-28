import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Lock, Unlock, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCaesarCipher,
  useRot13Cipher,
  useVigenereCipher,
  useBase64Cipher,
  useAtbashCipher,
  getGetCipherHistoryQueryKey,
  getGetCipherStatsQueryKey,
} from "@workspace/api-client-react";

type Algorithm = "caesar" | "rot13" | "vigenere" | "base64" | "atbash";

const ALGORITHMS: { id: Algorithm; label: string; desc: string; hasKey?: boolean; hasMode?: boolean; modePair?: [string, string] }[] = [
  { id: "caesar", label: "Caesar Cipher", desc: "Classic shift cipher — shift each letter by N positions.", hasMode: true, modePair: ["encrypt", "decrypt"] },
  { id: "rot13", label: "ROT-13", desc: "A fixed Caesar shift of 13. Symmetric — encode and decode are the same operation." },
  { id: "vigenere", label: "Vigenère", desc: "Polyalphabetic cipher using a repeating keyword for variable shift.", hasKey: true, hasMode: true, modePair: ["encrypt", "decrypt"] },
  { id: "base64", label: "Base64", desc: "Binary-to-text encoding used throughout the web.", hasMode: true, modePair: ["encode", "decode"] },
  { id: "atbash", label: "Atbash Cipher", desc: "Mirror the alphabet — A↔Z, B↔Y, C↔X. Symmetric." },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-border"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Home() {
  const [activeAlgo, setActiveAlgo] = useState<Algorithm>("caesar");
  const [inputText, setInputText] = useState("");
  const [shift, setShift] = useState(13);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<string>("encrypt");
  const [result, setResult] = useState<{ output: string; algorithm: string; mode: string } | null>(null);

  const queryClient = useQueryClient();

  const caesarMut = useCaesarCipher();
  const rot13Mut = useRot13Cipher();
  const vigenereMut = useVigenereCipher();
  const base64Mut = useBase64Cipher();
  const atbashMut = useAtbashCipher();

  const isLoading = caesarMut.isPending || rot13Mut.isPending || vigenereMut.isPending || base64Mut.isPending || atbashMut.isPending;

  const algo = ALGORITHMS.find((a) => a.id === activeAlgo)!;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetCipherHistoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCipherStatsQueryKey() });
  };

  const handleRun = async () => {
    if (!inputText.trim()) return;
    try {
      let out: { output: string; algorithm: string; mode: string } | undefined;

      if (activeAlgo === "caesar") {
        const r = await caesarMut.mutateAsync({ data: { text: inputText, shift, mode: mode as "encrypt" | "decrypt" } });
        out = r;
      } else if (activeAlgo === "rot13") {
        const r = await rot13Mut.mutateAsync({ data: { text: inputText } });
        out = { ...r, mode: "encode/decode" };
      } else if (activeAlgo === "vigenere") {
        const r = await vigenereMut.mutateAsync({ data: { text: inputText, key, mode: mode as "encrypt" | "decrypt" } });
        out = r;
      } else if (activeAlgo === "base64") {
        const r = await base64Mut.mutateAsync({ data: { text: inputText, mode: mode as "encode" | "decode" } });
        out = r;
      } else if (activeAlgo === "atbash") {
        const r = await atbashMut.mutateAsync({ data: { text: inputText } });
        out = { ...r, mode: "encrypt/decrypt" };
      }

      if (out) {
        setResult(out);
        invalidate();
      }
    } catch {
      // errors shown inline
    }
  };

  const handleAlgoChange = (id: Algorithm) => {
    setActiveAlgo(id);
    setResult(null);
    const a = ALGORITHMS.find((a) => a.id === id)!;
    if (a.modePair) setMode(a.modePair[0]);
    else setMode("encode/decode");
  };

  const errorMsg = caesarMut.error?.message || rot13Mut.error?.message || vigenereMut.error?.message || base64Mut.error?.message || atbashMut.error?.message;

  return (
    <div className="h-full flex flex-col p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-primary font-mono text-sm">// cipher_lab</span>
        </div>
        <h1 className="text-2xl font-mono font-bold text-foreground mb-6 tracking-tight">Cipher Lab</h1>
      </motion.div>

      {/* Algorithm Selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2 mb-6 flex-wrap">
        {ALGORITHMS.map((a) => (
          <button
            key={a.id}
            onClick={() => handleAlgoChange(a.id)}
            className={`px-4 py-2 rounded font-mono text-xs border transition-all ${
              activeAlgo === a.id
                ? "bg-primary/10 text-primary border-primary/40 shadow-[0_0_12px_rgba(0,200,80,0.15)]"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-border"
            }`}
          >
            {a.label}
          </button>
        ))}
      </motion.div>

      {/* Algorithm description */}
      <motion.p key={activeAlgo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-muted-foreground mb-6">
        {algo.desc}
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">INPUT</span>
              {algo.hasMode && (
                <div className="flex rounded overflow-hidden border border-border text-xs font-mono">
                  {algo.modePair!.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1.5 transition-all ${mode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to process..."
              className="flex-1 min-h-[140px] bg-background border border-border rounded p-3 font-mono text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
            />

            {/* Controls */}
            <div className="flex flex-col gap-3">
              {activeAlgo === "caesar" && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted-foreground w-20">SHIFT</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={shift}
                    onChange={(e) => setShift(Math.max(1, Math.min(25, Number(e.target.value))))}
                    className="w-20 bg-background border border-border rounded px-3 py-1.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 text-center"
                  />
                  <span className="text-xs text-muted-foreground font-mono">(1–25)</span>
                </div>
              )}
              {algo.hasKey && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-mono text-muted-foreground w-20">KEY</label>
                  <input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="keyword..."
                    className="flex-1 bg-background border border-border rounded px-3 py-1.5 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleRun}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center justify-center gap-2 py-2.5 rounded font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(0,200,80,0.2)] hover:shadow-[0_0_20px_rgba(0,200,80,0.35)]"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : mode === "decrypt" || mode === "decode" ? <Unlock size={14} /> : <Lock size={14} />}
              {isLoading ? "Processing..." : mode === "decrypt" || mode === "decode" ? "Decrypt / Decode" : "Encrypt / Encode"}
            </button>

            {errorMsg && (
              <p className="text-destructive text-xs font-mono">{errorMsg}</p>
            )}
          </div>
        </motion.div>

        {/* Output Panel */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">OUTPUT</span>
              {result && <CopyButton text={result.output} />}
            </div>

            <div className="flex-1 min-h-[140px] bg-background border border-border rounded p-3 font-mono text-sm relative overflow-auto">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key={result.output}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-primary whitespace-pre-wrap break-all"
                  >
                    {result.output}
                  </motion.div>
                ) : (
                  <motion.span
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground/40"
                  >
                    Output will appear here...
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 pt-2 border-t border-border">
                <span className="text-xs font-mono text-muted-foreground">algorithm: <span className="text-foreground">{result.algorithm}</span></span>
                <span className="text-xs font-mono text-muted-foreground">mode: <span className="text-foreground">{result.mode}</span></span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
