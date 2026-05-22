import { useState } from "react";

const SYSTEM_PROMPT = `You are a professional financial analyst specializing in turnaround investing and distressed equity.

Find undervalued stocks that are:
- Currently carrying significant debt or operating at a loss
- Showing improving revenue trends or clear unit economics
- Projected to reach profitability within 1-3 years
- Available to trade on Robinhood (US-listed equities)

Search the web for the MOST CURRENT financial data available. Use real, up-to-date numbers.

Return ONLY a valid JSON array. No markdown. No explanation. No code fences. Just a raw JSON array.

Use EXACTLY this schema for each stock:
[
  {
    "ticker": "TICKER",
    "name": "Full Company Name",
    "sector": "Sector",
    "currentPrice": "$XX.XX",
    "marketCap": "$XX.XB",
    "debtLevel": "High | Very High | Extreme",
    "debtToEquity": "X.Xx",
    "currentEPS": "-$X.XX",
    "projectedProfitYear": "20XX",
    "revenueGrowth": "+XX% YoY",
    "whyUndervalued": "2-3 sentences explaining the valuation gap and opportunity",
    "keyCatalysts": ["Short catalyst 1", "Short catalyst 2", "Short catalyst 3"],
    "riskLevel": "High | Very High | Extreme",
    "analystConsensus": "Strong Buy | Buy | Hold",
    "priceTarget": "$XX.XX"
  }
]`;

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg0: #050c1a; --bg1: #0a1628; --bg2: #0d1f38; --border: #112240; --border2: #1a3358; --amber: #f59e0b; --green: #10b981; --red: #ef4444; --orange: #f97316; --purple: #818cf8; --text: #cbd5e1; --muted: #475569; --dim: #1e3a5f; }
  body { background: var(--bg0); }
  .card { transition: border-color 0.2s; }
  .card:hover { border-color: var(--border2) !important; }
  .mode-btn { transition: all 0.15s; }
  .metric-cell:hover { background: rgba(255,255,255,0.025); }
  .rh-link { transition: background 0.15s; }
  .rh-link:hover { background: rgba(0,200,5,0.1) !important; }
  .scan-btn { transition: all 0.18s; }
  .scan-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .scan-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
  input:focus { outline: none; border-color: var(--border2) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.07); }
  input::placeholder { color: var(--dim); }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .stock-card { animation: fadeIn 0.35s ease both; }
  .dot-pulse { animation: blink 1.4s ease-in-out infinite; }
`;

const MONO = "'SF Mono','Fira Code','Consolas','Courier New',monospace";
const SANS = "system-ui,-apple-system,'Segoe UI',sans-serif";

const riskColor   = r => ({ "High":"#f59e0b","Very High":"#f97316","Extreme":"#ef4444" }[r] ?? "#f59e0b");
const buyColor    = c => ({ "Strong Buy":"#10b981","Buy":"#34d399","Hold":"#f59e0b" }[c]  ?? "#f59e0b");
const toHex18     = c => c + "18";
const toHex30     = c => c + "30";

function Badge({ label, color }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: "10px", fontWeight: 600,
      color, background: toHex18(color), border: `1px solid ${toHex30(color)}`,
      borderRadius: "4px", padding: "2px 8px", letterSpacing: "0.05em",
      display: "inline-block"
    }}>{label}</span>
  );
}

function MetricCell({ label, value, color, last }) {
  return (
    <div className="metric-cell" style={{
      padding: "14px 18px",
      borderRight: last ? "none" : "1px solid var(--border)"
    }}>
      <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.1em", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: "17px", fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function StockCard({ s, delay }) {
  return (
    <div className="card stock-card" style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden", marginBottom: "20px",
      animationDelay: `${delay}ms`
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 22px", display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{
            fontFamily: MONO, fontSize: "19px", fontWeight: 700,
            color: "var(--amber)", background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.22)", borderRadius: "9px",
            padding: "8px 14px", minWidth: "78px", textAlign: "center",
            letterSpacing: "0.05em"
          }}>{s.ticker}</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 500, color: "#f1f5f9" }}>{s.name}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{s.sector} &nbsp;·&nbsp; {s.marketCap}</div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
          <div style={{ fontFamily: MONO, fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>{s.currentPrice}</div>
          <div style={{ marginTop: "6px" }}>
            <Badge label={s.analystConsensus} color={buyColor(s.analystConsensus)} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid var(--border)" }}>
        <MetricCell label="DEBT / EQUITY"    value={s.debtToEquity}         color="#f97316" />
        <MetricCell label="CURRENT EPS"      value={s.currentEPS}           color="#ef4444" />
        <MetricCell label="REVENUE GROWTH"   value={s.revenueGrowth}        color="#10b981" />
        <MetricCell label="PROFIT BY"        value={s.projectedProfitYear}  color="#818cf8" last />
      </div>

      {/* Analysis */}
      <div style={{
        padding: "18px 22px", display: "grid",
        gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)",
        gap: "24px", borderBottom: "1px solid var(--border)"
      }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.1em", marginBottom: "9px" }}>WHY UNDERVALUED</div>
          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.75, fontFamily: SANS }}>{s.whyUndervalued}</p>
        </div>
        <div>
          <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.1em", marginBottom: "9px" }}>KEY CATALYSTS</div>
          {(s.keyCatalysts || []).map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "7px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)", flexShrink: 0, marginTop: "6px" }} />
              <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.55, fontFamily: SANS }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "12px 22px", background: "#040b17",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.1em" }}>RISK</span>
          <Badge label={s.riskLevel?.toUpperCase()} color={riskColor(s.riskLevel)} />
          <span style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.1em" }}>TARGET</span>
          <span style={{ fontFamily: MONO, fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>{s.priceTarget}</span>
        </div>
        <a className="rh-link"
          href={`https://robinhood.com/stocks/${s.ticker}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: "10px", fontWeight: 600,
            color: "#00c805", border: "1px solid rgba(0,200,5,0.28)",
            borderRadius: "6px", padding: "7px 13px", textDecoration: "none",
            letterSpacing: "0.06em"
          }}>
          VIEW ON ROBINHOOD ↗
        </a>
      </div>
    </div>
  );
}

const SCAN_MSGS = [
  "SEARCHING MARKET DATA...",
  "ANALYZING DEBT STRUCTURES...",
  "PROJECTING PROFITABILITY...",
  "IDENTIFYING CATALYSTS...",
  "SCORING OPPORTUNITIES..."
];

export default function TurnaroundScreener() {
  const [mode, setMode] = useState("auto");
  const [tickers, setTickers] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Bracket-aware JSON array extractor — handles trailing text/comments after the array
  const extractJSONArray = (text) => {
    text = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    const start = text.indexOf("[");
    if (start === -1) throw new Error("No stock data found in response");
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (esc)          { esc = false; continue; }
      if (ch === "\\")  { esc = true;  continue; }
      if (ch === '"')   { inStr = !inStr; continue; }
      if (inStr)        continue;
      if (ch === "[" || ch === "{") depth++;
      else if (ch === "]" || ch === "}") {
        depth--;
        if (depth === 0) return JSON.parse(text.slice(start, i + 1));
      }
    }
    throw new Error("Response JSON was incomplete — please try again");
  };

  // API call with automatic tool-use loop (handles web_search rounds)
  const callAPI = async (messages) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    // If the model wants to use a tool, feed results back and continue
    if (data.stop_reason === "tool_use") {
      const toolResults = (data.content || [])
        .filter(b => b.type === "tool_use")
        .map(b => ({ type: "tool_result", tool_use_id: b.id, content: "" }));
      return callAPI([
        ...messages,
        { role: "assistant", content: data.content },
        { role: "user",      content: toolResults }
      ]);
    }
    return data;
  };

  const runScan = async () => {
    setLoading(true);
    setError("");
    setStocks([]);
    setMsgIdx(0);

    const interval = setInterval(() => setMsgIdx(i => (i + 1) % SCAN_MSGS.length), 2800);

    const userMsg = mode === "manual" && tickers.trim()
      ? `Analyze these specific stocks for turnaround potential and debt-to-profitability trajectory: ${tickers.toUpperCase()}. Search for current price, debt-to-equity, EPS, revenue growth rate, and analyst price targets for each.`
      : "Find the 5-6 most compelling undervalued turnaround stocks right now — companies currently carrying high debt or operating at a loss but with strong projected paths to profitability within 1-2 years. Use the latest available financial data.";

    try {
      const data = await callAPI([{ role: "user", content: userMsg }]);
      clearInterval(interval);

      const textBlocks = (data.content || []).filter(b => b.type === "text");
      const raw = textBlocks[textBlocks.length - 1]?.text || "";
      const parsed = extractJSONArray(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("No stocks returned — please try again");
      setStocks(parsed);
      setLastUpdated(new Date());
    } catch (e) {
      clearInterval(interval);
      setError(`Scan failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canScan = !loading && (mode === "auto" || tickers.trim().length > 0);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ fontFamily: SANS, background: "var(--bg0)", minHeight: "100vh", color: "var(--text)" }}>

        {/* Nav */}
        <div style={{ background: "var(--bg1)", borderBottom: "1px solid var(--border)", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <div style={{ background: "var(--amber)", width: "34px", height: "34px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📈</div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 600, color: "#f1f5f9", letterSpacing: "0.1em" }}>TURNAROUND SCREENER</div>
              <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.14em", marginTop: "2px" }}>AI-POWERED · LIVE DATA · ROBINHOOD READY</div>
            </div>
          </div>
          {lastUpdated && (
            <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.08em" }}>
              UPDATED {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 20px" }}>

          {/* Control Panel */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "22px", marginBottom: "30px" }}>
            <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.12em", marginBottom: "12px" }}>SCREENING MODE</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
              {[["auto","AUTO-FIND OPPORTUNITIES"],["manual","ANALYZE MY TICKERS"]].map(([m, label]) => (
                <button key={m} className="mode-btn" onClick={() => setMode(m)} style={{
                  padding: "9px 18px", borderRadius: "7px", cursor: "pointer",
                  border: mode === m ? "1px solid var(--amber)" : "1px solid var(--border)",
                  background: mode === m ? "rgba(245,158,11,0.1)" : "transparent",
                  color: mode === m ? "var(--amber)" : "var(--muted)",
                  fontFamily: MONO, fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em"
                }}>{label}</button>
              ))}
            </div>

            {mode === "manual" && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)", letterSpacing: "0.12em", marginBottom: "8px" }}>TICKER SYMBOLS (comma-separated)</div>
                <input
                  value={tickers}
                  onChange={e => setTickers(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && canScan && runScan()}
                  placeholder="e.g. RIVN, LCID, SOFI, OPEN, NKLA"
                  style={{
                    width: "100%", padding: "11px 14px",
                    background: "var(--bg0)", border: "1px solid var(--border)",
                    borderRadius: "8px", color: "#94a3b8",
                    fontFamily: MONO, fontSize: "14px",
                    transition: "border-color 0.15s, box-shadow 0.15s"
                  }}
                />
              </div>
            )}

            <button
              className="scan-btn"
              onClick={runScan}
              disabled={!canScan}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "transparent" : "var(--amber)",
                border: loading ? "1px solid rgba(245,158,11,0.25)" : "none",
                borderRadius: "9px",
                color: loading ? "var(--amber)" : "#050c1a",
                fontFamily: MONO, fontSize: "12px", fontWeight: 700,
                letterSpacing: "0.12em", cursor: canScan ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
              }}
            >
              {loading
                ? <><span className="dot-pulse">⟳</span> {SCAN_MSGS[msgIdx]}</>
                : `⚡  ${mode === "auto" ? "SCAN FOR OPPORTUNITIES" : "ANALYZE TICKERS"}`
              }
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "14px 18px", color: "#f87171", fontSize: "13px", marginBottom: "22px", fontFamily: SANS }}>
              {error}
            </div>
          )}

          {/* Results */}
          {stocks.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px", alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" }}>
                  {stocks.length} TURNAROUND OPPORTUNITIES FOUND
                </div>
                <div style={{ fontFamily: MONO, fontSize: "9px", color: "var(--dim)" }}>⚠ NOT FINANCIAL ADVICE</div>
              </div>

              {stocks.map((s, i) => <StockCard key={s.ticker} s={s} delay={i * 80} />)}

              <div style={{
                background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)",
                borderRadius: "10px", padding: "14px 18px",
                fontFamily: MONO, fontSize: "10px", color: "var(--dim)", lineHeight: 1.8, letterSpacing: "0.03em"
              }}>
                ⚠ DISCLAIMER: Results are AI-generated from publicly available data and are for informational purposes only. Investing in pre-profitable or heavily indebted companies carries significant risk including potential total loss of capital. Always conduct independent research and consult a licensed financial advisor before investing.
              </div>
            </>
          )}

          {/* Empty */}
          {!loading && stocks.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "90px 20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "18px" }}>🔎</div>
              <div style={{ fontFamily: MONO, fontSize: "11px", color: "var(--dim)", letterSpacing: "0.14em", marginBottom: "10px" }}>READY TO SCAN</div>
              <div style={{ fontSize: "13px", color: "#1e3a5f", fontFamily: SANS }}>
                Find stocks in debt with a clear path to profitability
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
