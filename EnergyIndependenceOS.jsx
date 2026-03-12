import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Upload, Zap, Sun, Battery, Car, Flame, ChevronRight, Check, ArrowRight, Shield, TrendingDown, DollarSign, Leaf, MapPin, Star, Clock, X, ChevronDown, Users, BarChart3, Target, Award } from "lucide-react";

// ─── Theme ───
const C = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2235",
  border: "#1e293b",
  accent: "#22c55e",
  accentDim: "#166534",
  accentGlow: "rgba(34,197,94,0.15)",
  gold: "#facc15",
  blue: "#3b82f6",
  orange: "#f97316",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

// ─── Mock Data ───
const MONTHLY_USAGE = [
  { month: "Jan", kwh: 1420, cost: 213, solar: 380 },
  { month: "Feb", kwh: 1280, cost: 192, solar: 460 },
  { month: "Mar", kwh: 1150, cost: 173, solar: 620 },
  { month: "Apr", kwh: 980, cost: 147, solar: 780 },
  { month: "May", kwh: 1050, cost: 158, solar: 920 },
  { month: "Jun", kwh: 1380, cost: 207, solar: 1050 },
  { month: "Jul", kwh: 1620, cost: 243, solar: 1100 },
  { month: "Aug", kwh: 1580, cost: 237, solar: 1060 },
  { month: "Sep", kwh: 1290, cost: 194, solar: 880 },
  { month: "Oct", kwh: 1100, cost: 165, solar: 680 },
  { month: "Nov", kwh: 1250, cost: 188, solar: 440 },
  { month: "Dec", kwh: 1450, cost: 218, solar: 340 },
];

const ROADMAP_ITEMS = [
  {
    id: "solar",
    icon: Sun,
    title: "Rooftop Solar (8.4 kW)",
    subtitle: "Covers 72% of annual usage",
    cost: "$18,200",
    netCost: "$7,280",
    incentive: "$10,920",
    roi: "4.2 years",
    savings: "$1,740/yr",
    ownership: 48,
    priority: 1,
    status: "recommended",
    details: "Based on your roof area (1,400 sq ft south-facing), an 8.4 kW system with 21 panels optimally covers your consumption profile. The 30% federal ITC plus your state rebate drops the net cost to $7,280.",
  },
  {
    id: "battery",
    icon: Battery,
    title: "Home Battery (13.5 kWh)",
    subtitle: "Store solar, eliminate peak rates",
    cost: "$11,500",
    netCost: "$8,050",
    incentive: "$3,450",
    roi: "6.8 years",
    savings: "$1,180/yr",
    ownership: 28,
    priority: 2,
    status: "recommended",
    details: "A 13.5 kWh battery system lets you store excess solar production and avoid peak TOU rates ($0.38/kWh). With SGIP rebate and federal credit, net cost is $8,050.",
  },
  {
    id: "ev",
    icon: Car,
    title: "EV Charger (Level 2, 48A)",
    subtitle: "Charge at home with your solar",
    cost: "$1,800",
    netCost: "$1,260",
    incentive: "$540",
    roi: "0.8 years",
    savings: "$1,620/yr",
    ownership: 12,
    priority: 3,
    status: "quick-win",
    details: "A Level 2 charger eliminates gas costs. Charging your EV with solar costs ~$0.03/kWh vs $0.15/kWh grid or $3.50/gal gas equivalent. The 30% federal credit applies here too.",
  },
  {
    id: "heatpump",
    icon: Flame,
    title: "Heat Pump HVAC",
    subtitle: "3x more efficient than gas furnace",
    cost: "$8,500",
    netCost: "$5,950",
    incentive: "$2,550",
    roi: "5.1 years",
    savings: "$1,160/yr",
    ownership: 12,
    priority: 4,
    status: "planned",
    details: "Replace your gas furnace with a heat pump for 300% efficiency gains. The IRA provides up to $2,000 in tax credits, plus your utility offers a $550 rebate.",
  },
];

const INCENTIVES = [
  { name: "Federal ITC (30%)", amount: 5460, type: "Tax Credit", source: "IRA" },
  { name: "State Solar Rebate", amount: 3200, type: "Rebate", source: "State" },
  { name: "SGIP Battery Rebate", amount: 3450, type: "Rebate", source: "State" },
  { name: "EV Charger Credit (30%)", amount: 540, type: "Tax Credit", source: "IRA" },
  { name: "Heat Pump Credit", amount: 2000, type: "Tax Credit", source: "IRA" },
  { name: "Utility Rebate", amount: 550, type: "Rebate", source: "Utility" },
  { name: "Net Metering Credits", amount: 840, type: "Annual Credit", source: "Utility" },
];

const INSTALLERS = [
  { name: "SunPower Certified", rating: 4.9, reviews: 342, price: "$$", badge: "Premium", distance: "3.2 mi" },
  { name: "GreenHome Solar", rating: 4.7, reviews: 189, price: "$", badge: "Best Value", distance: "5.1 mi" },
  { name: "Tesla Energy", rating: 4.5, reviews: 521, price: "$$$", badge: "Integrated", distance: "8.4 mi" },
];

// ─── Circular Progress ───
function OwnershipGauge({ value, size = 220, label }) {
  const [animVal, setAnimVal] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const dur = 1800;
    const animate = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimVal(Math.round(ease * value));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animVal / 100) * circ;
  const color = animVal < 30 ? C.orange : animVal < 60 ? C.gold : C.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s ease", filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 30, textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: size / 3.5, fontWeight: 800, color, fontFamily: "system-ui" }}>{animVal}%</div>
        <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{label || "Energy Owned"}</div>
      </div>
      <div style={{ height: size / 2 - 20 }} />
    </div>
  );
}

// ─── Stat Card ───
function Stat({ icon: Icon, label, value, sub, color = C.accent }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Button ───
function Btn({ children, onClick, variant = "primary", style = {}, icon: Icon, disabled }) {
  const base = {
    padding: "12px 24px", borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
    transition: "all 0.2s", opacity: disabled ? 0.5 : 1, fontFamily: "system-ui",
  };
  const variants = {
    primary: { background: C.accent, color: "#000", boxShadow: `0 0 20px ${C.accent}33` },
    secondary: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.accent, padding: "8px 16px" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children} {Icon && <Icon size={16} />}
    </button>
  );
}

// ─── Landing Page ───
function Landing({ onStart }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const features = [
    { icon: Zap, title: "AI Bill Analysis", desc: "Upload your utility bill and get instant insights on your consumption patterns and savings potential" },
    { icon: Target, title: "Personalized Roadmap", desc: "A scored, prioritized plan to reach 100% energy independence — customized to your home" },
    { icon: DollarSign, title: "Incentive Finder", desc: "Every federal, state, and local incentive you qualify for — automatically calculated" },
    { icon: Shield, title: "Installer Matching", desc: "Get matched with vetted, top-rated installers in your area with transparent pricing" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 40px", borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={20} color="#000" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>EnergyOS</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span style={{ color: C.textDim, cursor: "pointer", fontSize: 14 }}>How it works</span>
          <span style={{ color: C.textDim, cursor: "pointer", fontSize: 14 }}>Pricing</span>
          <Btn onClick={onStart} style={{ padding: "8px 20px", fontSize: 14 }}>Get Started</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "100px 40px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
          background: C.accentGlow, color: C.accent, border: `1px solid ${C.accentDim}`, marginBottom: 24,
        }}>
          $16,200 in incentives available for your area
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -1 }}>
          Own Your <span style={{ color: C.accent }}>Energy</span>
        </h1>
        <p style={{ fontSize: 20, color: C.textDim, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 40px" }}>
          Upload your utility bill. Get a personalized roadmap to energy independence with every incentive you qualify for — in 60 seconds.
        </p>
        <Btn onClick={onStart} style={{ margin: "0 auto", padding: "16px 36px", fontSize: 17 }} icon={ArrowRight}>
          Upload Your Bill — It's Free
        </Btn>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 28 }}>
          {[["5K+", "homeowners helped"], ["$16K", "avg incentives found"], ["4.2 yr", "avg solar payback"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20,
        padding: "40px 40px 80px", maxWidth: 1000, margin: "0 auto",
      }}>
        {features.map((f, i) => (
          <div key={i}
            onMouseEnter={() => setHoveredFeature(i)}
            onMouseLeave={() => setHoveredFeature(null)}
            style={{
              background: hoveredFeature === i ? C.cardHover : C.card,
              border: `1px solid ${hoveredFeature === i ? C.accent + "44" : C.border}`,
              borderRadius: 14, padding: 24, transition: "all 0.2s", cursor: "default",
            }}>
            <f.icon size={28} color={C.accent} style={{ marginBottom: 14 }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Upload Flow ───
function UploadFlow({ onAnalyze }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [address, setAddress] = useState("");
  const [utility, setUtility] = useState("");

  const handleFile = () => setFile({ name: "utility_bill_feb2026.pdf", size: "2.4 MB" });

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
    }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px" }}>Upload Your Utility Bill</h2>
          <p style={{ color: C.textDim, fontSize: 15 }}>We'll analyze your consumption and find every incentive you qualify for</p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(); }}
          onClick={handleFile}
          style={{
            border: `2px dashed ${file ? C.accent : dragOver ? C.accent : C.border}`,
            borderRadius: 16, padding: 48, textAlign: "center", cursor: "pointer",
            background: file ? C.accentGlow : dragOver ? C.accentGlow : "transparent",
            transition: "all 0.2s", marginBottom: 24,
          }}
        >
          {file ? (
            <>
              <Check size={40} color={C.accent} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: C.accent }}>{file.name}</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>{file.size} — Ready to analyze</div>
            </>
          ) : (
            <>
              <Upload size={40} color={C.textMuted} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Drop your utility bill here</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>PDF, JPG, or PNG — or click to browse</div>
            </>
          )}
        </div>

        {/* Form Fields */}
        {[
          { label: "Home Address", placeholder: "123 Main St, Austin, TX 78701", val: address, set: setAddress, icon: MapPin },
          { label: "Utility Provider", placeholder: "Austin Energy", val: utility, set: setUtility, icon: Zap },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textDim, marginBottom: 6 }}>{f.label}</label>
            <div style={{ position: "relative" }}>
              <f.icon size={16} color={C.textMuted} style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "12px 12px 12px 40px", background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 10, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "system-ui",
                }}
                onFocus={(e) => e.target.style.borderColor = C.accent + "66"}
                onBlur={(e) => e.target.style.borderColor = C.border}
              />
            </div>
          </div>
        ))}

        <Btn onClick={onAnalyze} disabled={!file} icon={ArrowRight}
          style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "14px 24px" }}>
          Analyze My Energy
        </Btn>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <Shield size={14} color={C.textMuted} />
          <span style={{ fontSize: 12, color: C.textMuted }}>Your data is encrypted and never shared</span>
        </div>
      </div>
    </div>
  );
}

// ─── Analysis Loading ───
function Analyzing({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Reading your utility bill...",
    "Analyzing consumption patterns...",
    "Scanning 3,247 incentive programs...",
    "Calculating solar potential for your roof...",
    "Estimating battery & EV savings...",
    "Building your personalized roadmap...",
  ];

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 800));
    const done = setTimeout(onDone, steps.length * 800 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ maxWidth: 480, width: "100%", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
            background: C.accentGlow, display: "flex", alignItems: "center", justifyContent: "center",
            animation: "pulse 2s infinite",
          }}>
            <Zap size={28} color={C.accent} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Analyzing Your Energy Profile</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
              borderRadius: 10, background: step > i ? C.accentGlow : "transparent",
              opacity: step > i ? 1 : step === i ? 0.6 : 0.2, transition: "all 0.4s",
            }}>
              {step > i ? <Check size={18} color={C.accent} /> : <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.textMuted}` }} />}
              <span style={{ fontSize: 14, color: step > i ? C.accent : C.textDim }}>{s}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }`}</style>
      </div>
    </div>
  );
}

// ─── Dashboard ───
function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedItem, setExpandedItem] = useState(null);
  const [showInstallers, setShowInstallers] = useState(false);

  const totalIncentives = INCENTIVES.reduce((a, b) => a + b.amount, 0);
  const annualSavings = ROADMAP_ITEMS.reduce((a, b) => a + parseInt(b.savings.replace(/[^0-9]/g, "")), 0);
  const totalCost = ROADMAP_ITEMS.reduce((a, b) => a + parseInt(b.cost.replace(/[^0-9]/g, "")), 0);
  const totalNet = ROADMAP_ITEMS.reduce((a, b) => a + parseInt(b.netCost.replace(/[^0-9]/g, "")), 0);

  const projectionData = Array.from({ length: 25 }, (_, i) => ({
    year: 2026 + i,
    withoutSolar: Math.round(2400 * Math.pow(1.035, i)),
    withSolar: i < 1 ? 2400 : Math.round(Math.max(200, 600 * Math.pow(0.97, i))),
    cumSavings: i < 1 ? 0 : Math.round(Array.from({ length: i }, (_, j) => (2400 * Math.pow(1.035, j + 1)) - Math.max(200, 600 * Math.pow(0.97, j + 1))).reduce((a, b) => a + b, 0)),
  }));

  const breakdownData = [
    { name: "HVAC", value: 42, color: C.orange },
    { name: "Appliances", value: 22, color: C.blue },
    { name: "Lighting", value: 12, color: C.gold },
    { name: "EV", value: 15, color: C.accent },
    { name: "Other", value: 9, color: C.textMuted },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: Target },
    { id: "incentives", label: "Incentives", icon: DollarSign },
    { id: "installers", label: "Installers", icon: Users },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui" }}>
      {/* Top Bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 32px", borderBottom: `1px solid ${C.border}`, background: C.card,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={17} color="#000" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>EnergyOS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={14} color={C.textMuted} />
          <span style={{ fontSize: 13, color: C.textDim }}>123 Main St, Austin, TX · Austin Energy</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, padding: "12px 32px", borderBottom: `1px solid ${C.border}`,
        background: C.card,
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
            background: activeTab === t.id ? C.accentGlow : "transparent",
            color: activeTab === t.id ? C.accent : C.textDim,
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.2s", fontFamily: "system-ui",
          }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === "overview" && (
          <>
            {/* Top Stats Row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28,
                display: "flex", flexDirection: "column", alignItems: "center", minWidth: 240,
              }}>
                <OwnershipGauge value={23} size={180} />
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 8, textAlign: "center" }}>
                  You own <strong style={{ color: C.accent }}>23%</strong> of your energy today
                </div>
                <div style={{
                  marginTop: 12, padding: "6px 14px", borderRadius: 8, background: C.accentGlow,
                  fontSize: 12, fontWeight: 600, color: C.accent,
                }}>
                  → 100% achievable in 18 months
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 300 }}>
                <Stat icon={DollarSign} label="Annual Energy Cost" value="$2,435" sub="Top 30% in your area" color={C.orange} />
                <Stat icon={TrendingDown} label="Projected Savings" value={`$${annualSavings.toLocaleString()}/yr`} sub="After full roadmap" color={C.accent} />
                <Stat icon={Award} label="Available Incentives" value={`$${totalIncentives.toLocaleString()}`} sub="Federal + State + Utility" color={C.gold} />
                <Stat icon={Leaf} label="Carbon Offset" value="8.4 tons/yr" sub="= 18,500 miles not driven" color={C.accent} />
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
              {/* Usage Chart */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Monthly Usage vs Solar Production</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={MONTHLY_USAGE}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" stroke={C.textMuted} fontSize={11} />
                    <YAxis stroke={C.textMuted} fontSize={11} />
                    <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="kwh" stroke={C.orange} fill={C.orange + "22"} name="Usage (kWh)" />
                    <Area type="monotone" dataKey="solar" stroke={C.accent} fill={C.accent + "22"} name="Solar (kWh)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown Pie */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Consumption Breakdown</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {breakdownData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {breakdownData.map((d) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textDim }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                      {d.name} {d.value}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 25-Year Projection */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>25-Year Cost Projection</div>
                <div style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>
                  Lifetime savings: ${projectionData[24].cumSavings.toLocaleString()}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" stroke={C.textMuted} fontSize={11} interval={4} />
                  <YAxis stroke={C.textMuted} fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => `$${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="withoutSolar" stroke={C.red} fill={C.red + "11"} name="Without Solar" />
                  <Area type="monotone" dataKey="withSolar" stroke={C.accent} fill={C.accent + "22"} name="With EnergyOS" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* ─── ROADMAP TAB ─── */}
        {activeTab === "roadmap" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Path to 100%</h2>
                <p style={{ fontSize: 14, color: C.textDim, margin: 0 }}>Prioritized by ROI — complete all 4 steps to own your energy</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: C.textMuted }}>Total Investment</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>${totalNet.toLocaleString()} <span style={{ fontSize: 13, color: C.textMuted, textDecoration: "line-through" }}>${totalCost.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textDim, marginBottom: 8 }}>
                <span>Energy Independence Progress</span>
                <span style={{ color: C.accent, fontWeight: 600 }}>0% → 100%</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden", display: "flex" }}>
                {ROADMAP_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    width: `${item.ownership}%`, height: "100%",
                    background: [C.accent, C.blue, C.gold, C.orange][i],
                    opacity: 0.7,
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", marginTop: 8, gap: 16 }}>
                {ROADMAP_ITEMS.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textDim }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: [C.accent, C.blue, C.gold, C.orange][i] }} />
                    {item.title.split("(")[0].trim()} +{item.ownership}%
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap Items */}
            {ROADMAP_ITEMS.map((item, idx) => {
              const expanded = expandedItem === idx;
              const colors = [C.accent, C.blue, C.gold, C.orange];
              return (
                <div key={idx} onClick={() => setExpandedItem(expanded ? null : idx)} style={{
                  background: C.card, border: `1px solid ${expanded ? colors[idx] + "44" : C.border}`,
                  borderRadius: 14, padding: 20, marginBottom: 12, cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: `${colors[idx]}15`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <item.icon size={24} color={colors[idx]} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</span>
                        {item.status === "quick-win" && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.gold + "22", color: C.gold }}>QUICK WIN</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{item.subtitle}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: colors[idx] }}>{item.netCost}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>
                        <span style={{ textDecoration: "line-through" }}>{item.cost}</span> · ROI {item.roi}
                      </div>
                    </div>
                    <ChevronDown size={18} color={C.textMuted} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, margin: "0 0 16px" }}>{item.details}</p>
                      <div style={{ display: "flex", gap: 24 }}>
                        {[
                          { label: "Annual Savings", value: item.savings, color: C.accent },
                          { label: "Incentives", value: item.incentive, color: C.gold },
                          { label: "Ownership Gain", value: `+${item.ownership}%`, color: colors[idx] },
                        ].map((s) => (
                          <div key={s.label}>
                            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase" }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      <Btn onClick={(e) => { e.stopPropagation(); setActiveTab("installers"); }}
                        style={{ marginTop: 16, padding: "10px 20px", fontSize: 13 }} icon={ArrowRight}>
                        Get Installer Quotes
                      </Btn>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ─── INCENTIVES TAB ─── */}
        {activeTab === "incentives" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Incentives</h2>
              <p style={{ fontSize: 14, color: C.textDim, margin: 0 }}>We found ${totalIncentives.toLocaleString()} in incentives for your location</p>
            </div>

            {/* Summary Card */}
            <div style={{
              background: `linear-gradient(135deg, ${C.accentDim}44, ${C.card})`,
              border: `1px solid ${C.accent}33`, borderRadius: 14, padding: 28, marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 13, color: C.textDim, marginBottom: 4 }}>Total Available Incentives</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: C.accent }}>${totalIncentives.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>Reduces your total investment from ${totalCost.toLocaleString()} to ${totalNet.toLocaleString()}</div>
              </div>
              <OwnershipGauge value={Math.round((totalIncentives / totalCost) * 100)} size={120} label="Cost Covered" />
            </div>

            {/* Incentive List */}
            {INCENTIVES.map((inc, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "16px 20px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <DollarSign size={18} color={C.gold} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{inc.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{inc.type} · {inc.source}</div>
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>${inc.amount.toLocaleString()}</div>
              </div>
            ))}

            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: 20, marginTop: 20, fontSize: 13, color: C.textDim, lineHeight: 1.7,
            }}>
              <div style={{ fontWeight: 600, color: C.text, marginBottom: 6, fontSize: 14 }}>How it works</div>
              The Inflation Reduction Act (IRA) provides a 30% federal tax credit on solar, batteries, and EV chargers through 2032.
              Your state and utility offer additional rebates that stack on top. EnergyOS automatically calculates every incentive
              you qualify for and updates as programs change.
            </div>
          </>
        )}

        {/* ─── INSTALLERS TAB ─── */}
        {activeTab === "installers" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Matched Installers</h2>
              <p style={{ fontSize: 14, color: C.textDim, margin: 0 }}>Top-rated, vetted installers near 123 Main St, Austin, TX</p>
            </div>

            {INSTALLERS.map((inst, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: 24, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: [C.accentGlow, `${C.blue}15`, `${C.orange}15`][i],
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Sun size={24} color={[C.accent, C.blue, C.orange][i]} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600 }}>{inst.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                        background: i === 0 ? C.accent + "22" : i === 1 ? C.gold + "22" : C.blue + "22",
                        color: i === 0 ? C.accent : i === 1 ? C.gold : C.blue,
                      }}>
                        {inst.badge}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                      <span style={{ fontSize: 13, color: C.textDim, display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} color={C.gold} fill={C.gold} /> {inst.rating} ({inst.reviews})
                      </span>
                      <span style={{ fontSize: 13, color: C.textDim }}>{inst.distance}</span>
                      <span style={{ fontSize: 13, color: C.textDim }}>{inst.price}</span>
                    </div>
                  </div>
                </div>
                <Btn style={{ padding: "10px 20px", fontSize: 13 }} icon={ArrowRight}>
                  Get Quote
                </Btn>
              </div>
            ))}

            <div style={{
              background: `linear-gradient(135deg, ${C.accentDim}44, ${C.card})`,
              border: `1px solid ${C.accent}33`, borderRadius: 14, padding: 28, marginTop: 24, textAlign: "center",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Ready to own your energy?</h3>
              <p style={{ fontSize: 14, color: C.textDim, margin: "0 0 20px" }}>
                Get free quotes from all matched installers with one click. No spam, no obligation.
              </p>
              <Btn style={{ margin: "0 auto", padding: "14px 32px" }} icon={Zap}>
                Request All Quotes
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function EnergyOS() {
  const [screen, setScreen] = useState("landing");

  return (
    <>
      {screen === "landing" && <Landing onStart={() => setScreen("upload")} />}
      {screen === "upload" && <UploadFlow onAnalyze={() => setScreen("analyzing")} />}
      {screen === "analyzing" && <Analyzing onDone={() => setScreen("dashboard")} />}
      {screen === "dashboard" && <Dashboard />}
    </>
  );
}
