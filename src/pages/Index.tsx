import { useState, useCallback } from "react";

type CalcState = {
  display: string;
  expression: string;
  operator: string | null;
  operand: number | null;
  waitingForOperand: boolean;
  justEvaluated: boolean;
};

const INITIAL: CalcState = {
  display: "0",
  expression: "",
  operator: null,
  operand: null,
  waitingForOperand: false,
  justEvaluated: false,
};

const BUTTONS = [
  { label: "AC", type: "fn", wide: false },
  { label: "+/−", type: "fn", wide: false },
  { label: "%", type: "fn", wide: false },
  { label: "÷", type: "op", wide: false },
  { label: "7", type: "num", wide: false },
  { label: "8", type: "num", wide: false },
  { label: "9", type: "num", wide: false },
  { label: "×", type: "op", wide: false },
  { label: "4", type: "num", wide: false },
  { label: "5", type: "num", wide: false },
  { label: "6", type: "num", wide: false },
  { label: "−", type: "op", wide: false },
  { label: "1", type: "num", wide: false },
  { label: "2", type: "num", wide: false },
  { label: "3", type: "num", wide: false },
  { label: "+", type: "op", wide: false },
  { label: "0", type: "num", wide: true },
  { label: ".", type: "num", wide: false },
  { label: "=", type: "eq", wide: false },
];

export default function Index() {
  const [state, setState] = useState<CalcState>(INITIAL);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const animatePress = (label: string) => {
    setPressedKey(label);
    setTimeout(() => setPressedKey(null), 150);
  };

  const calculate = (a: number, op: string, b: number): number => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      default: return b;
    }
  };

  const formatNumber = (n: number): string => {
    if (isNaN(n)) return "Ошибка";
    if (!isFinite(n)) return "∞";
    const s = parseFloat(n.toPrecision(12)).toString();
    if (s.length > 12) return parseFloat(n.toExponential(6)).toString();
    return s;
  };

  const handleButton = useCallback((label: string) => {
    animatePress(label);
    setState(prev => {
      const cur = parseFloat(prev.display);

      if (label === "AC") return INITIAL;

      if (label === "+/−") {
        return { ...prev, display: formatNumber(cur * -1) };
      }

      if (label === "%") {
        return { ...prev, display: formatNumber(cur / 100) };
      }

      if (["÷", "×", "−", "+"].includes(label)) {
        if (prev.operator && !prev.waitingForOperand) {
          const result = calculate(prev.operand!, prev.operator, cur);
          return {
            ...prev,
            display: formatNumber(result),
            expression: `${formatNumber(result)} ${label}`,
            operator: label,
            operand: result,
            waitingForOperand: true,
            justEvaluated: false,
          };
        }
        return {
          ...prev,
          expression: `${prev.display} ${label}`,
          operator: label,
          operand: cur,
          waitingForOperand: true,
          justEvaluated: false,
        };
      }

      if (label === "=") {
        if (!prev.operator) return prev;
        const b = prev.justEvaluated ? prev.operand! : cur;
        const a = prev.justEvaluated ? cur : prev.operand!;
        const result = calculate(a, prev.operator, b);
        return {
          ...prev,
          display: formatNumber(result),
          expression: "",
          operand: prev.justEvaluated ? prev.operand : cur,
          waitingForOperand: false,
          justEvaluated: true,
        };
      }

      if (label === ".") {
        if (prev.waitingForOperand) {
          return { ...prev, display: "0.", waitingForOperand: false };
        }
        if (prev.display.includes(".")) return prev;
        return { ...prev, display: prev.display + "." };
      }

      if (prev.waitingForOperand || prev.justEvaluated) {
        return { ...prev, display: label, waitingForOperand: false, justEvaluated: false };
      }

      const newDisplay = prev.display === "0" ? label : prev.display + label;
      if (newDisplay.length > 12) return prev;
      return { ...prev, display: newDisplay };
    });
  }, []);

  const fontSize =
    state.display.length > 9 ? "text-3xl" :
    state.display.length > 6 ? "text-4xl" :
    "text-5xl";

  return (
    <div
      className="min-h-screen flex items-center justify-center font-rubik"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #12001a 40%, #0a0f1a 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div
        className="relative w-80 rounded-3xl overflow-hidden animate-fade-in"
        style={{
          background: "rgba(15, 10, 25, 0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {/* Display */}
        <div
          className="px-6 pt-8 pb-6"
          style={{ background: "linear-gradient(180deg, rgba(168,85,247,0.06) 0%, transparent 100%)" }}
        >
          <div className="text-right min-h-[28px] mb-1">
            <span
              className="font-mono text-sm tracking-wider"
              style={{ color: "rgba(168,85,247,0.7)" }}
            >
              {state.expression || "\u00A0"}
            </span>
          </div>
          <div className="text-right overflow-hidden">
            <span
              className={`font-mono font-bold ${fontSize} tracking-tight`}
              style={{ color: "#ffffff", textShadow: "0 0 30px rgba(168,85,247,0.5)" }}
            >
              {state.display}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)" }} />

        {/* Buttons */}
        <div className="p-4 grid grid-cols-4 gap-3">
          {BUTTONS.map((btn, i) => {
            const isPressed = pressedKey === btn.label;

            let bg = "";
            let shadow = "";
            let border = "";

            if (btn.type === "fn") {
              bg = "rgba(255,255,255,0.12)";
              shadow = "0 4px 12px rgba(0,0,0,0.3)";
              border = "1px solid rgba(255,255,255,0.08)";
            } else if (btn.type === "op") {
              bg = "linear-gradient(135deg, #7c3aed, #a855f7)";
              shadow = "0 4px 20px rgba(124,58,237,0.5)";
              border = "1px solid rgba(168,85,247,0.4)";
            } else if (btn.type === "eq") {
              bg = "linear-gradient(135deg, #06b6d4, #0ea5e9)";
              shadow = "0 4px 20px rgba(6,182,212,0.5)";
              border = "1px solid rgba(6,182,212,0.4)";
            } else {
              bg = "rgba(255,255,255,0.07)";
              shadow = "0 4px 12px rgba(0,0,0,0.2)";
              border = "1px solid rgba(255,255,255,0.08)";
            }

            return (
              <button
                key={`${btn.label}-${i}`}
                onClick={() => handleButton(btn.label)}
                className={`
                  ${btn.wide ? "col-span-2" : "col-span-1"}
                  h-16 rounded-2xl font-rubik font-semibold text-xl
                  transition-all duration-100 select-none cursor-pointer
                  hover:brightness-125 active:scale-95
                `}
                style={{
                  background: bg,
                  color: "#ffffff",
                  boxShadow: isPressed ? "none" : shadow,
                  transform: isPressed ? "scale(0.93)" : "scale(1)",
                  border,
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
