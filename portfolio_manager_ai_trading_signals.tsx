import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Layers, Plus, Trash2, Edit3, 
  RefreshCw, Award, Activity, Search, ShieldAlert, Cpu, CheckCircle2, XCircle, 
  BarChart2, Maximize2, Filter, Zap, ArrowUpRight, ArrowDownRight, Info, Eye, ChevronDown
} from 'lucide-react';

// --- INITIAL DEFAULT DATA ---
const INITIAL_PORTFOLIOS = [
  {
    id: 'p1',
    name: 'Hauptdepot (Growth)',
    currency: 'EUR',
    positions: [
      { id: 'pos1', symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 25, buyPrice: 110.50, currentPrice: 128.40, sector: 'Technologie', dividendYield: 0.08, payoutFreq: 'Quartalsweise' },
      { id: 'pos2', symbol: 'MSFT', name: 'Microsoft Corp.', shares: 15, buyPrice: 380.00, currentPrice: 425.20, sector: 'Technologie', dividendYield: 0.72, payoutFreq: 'Quartalsweise' },
      { id: 'pos3', symbol: 'ALV.DE', name: 'Allianz SE', shares: 30, buyPrice: 240.00, currentPrice: 278.50, sector: 'Finanzen', dividendYield: 5.10, payoutFreq: 'Jährlich' }
    ]
  },
  {
    id: 'p2',
    name: 'Dividenden Depot',
    currency: 'EUR',
    positions: [
      { id: 'pos4', symbol: 'O', name: 'Realty Income', shares: 100, buyPrice: 52.30, currentPrice: 58.10, sector: 'Immobilien', dividendYield: 5.45, payoutFreq: 'Monatlich' },
      { id: 'pos5', symbol: 'JNJ', name: 'Johnson & Johnson', shares: 40, buyPrice: 150.20, currentPrice: 161.80, sector: 'Gesundheitswesen', dividendYield: 3.10, payoutFreq: 'Quartalsweise' }
    ]
  },
  {
    id: 'p3',
    name: 'Crypto & Risk Depot',
    currency: 'USD',
    positions: [
      { id: 'pos6', symbol: 'BTC', name: 'Bitcoin', shares: 0.45, buyPrice: 58000, currentPrice: 66400, sector: 'Krypto', dividendYield: 0, payoutFreq: 'Keine' },
      { id: 'pos7', symbol: 'TSLA', name: 'Tesla Inc.', shares: 20, buyPrice: 210.00, currentPrice: 242.30, sector: 'Automobil', dividendYield: 0, payoutFreq: 'Keine' }
    ]
  }
];

const INITIAL_SIGNALS = [
  {
    id: 'sig1',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    market: 'Nasdaq',
    direction: 'LONG',
    entry: 124.50,
    tp1: 132.00,
    tp2: 138.50,
    sl: 119.80,
    leverage: '3x Turbo',
    crv: '1:2.9',
    confidence: 88,
    reasoning: 'Bullisches EMA 20/50 Crossover im 4h-Chart. RSI nach Überverkauft-Rebound steigend mit hohem Kaufvolumen an der $122 Unterstützung.',
    time: 'Heute, 08:30 Uhr',
    status: 'ACTIVE',
    priceData: generateMockCandles(124.50, 60)
  },
  {
    id: 'sig2',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    market: 'Nasdaq',
    direction: 'SHORT',
    entry: 248.00,
    tp1: 232.00,
    tp2: 218.00,
    sl: 256.50,
    leverage: '5x CFD',
    crv: '1:3.4',
    confidence: 81,
    reasoning: 'Bärischer Widerstand an der $250 Marke mehrfach bestätigt. Bearish Divergence im RSI (14) deutet auf bevorstehende Konsolidierung hin.',
    time: 'Heute, 09:15 Uhr',
    status: 'ACTIVE',
    priceData: generateMockCandles(248.00, 60, true)
  },
  {
    id: 'sig3',
    symbol: 'SAP.DE',
    name: 'SAP SE',
    market: 'DAX',
    direction: 'LONG',
    entry: 194.20,
    tp1: 204.00,
    tp2: 212.00,
    sl: 189.50,
    leverage: '1x (Direkt)',
    crv: '1:3.1',
    confidence: 91,
    reasoning: 'Ausbruch aus der monatelangen Tassen-mit-Henkel-Formation. EMA 200 bietet starke Unterstützung knapp unterhalb des Einstiegs.',
    time: 'Gestern',
    status: 'WON',
    priceData: generateMockCandles(194.20, 60)
  }
];

const AI_STATS = {
  winRate: 82.4,
  totalProfitPct: 142.8,
  profitFactor: 2.34,
  avgCrv: '1:3.1',
  totalTrades: 128,
  wonTrades: 105,
  lostTrades: 23,
  learnings: [
    { id: 1, date: 'Gestern', text: 'Stopp-Loss Abstände bei US-Tech-Aktien vor Fed-Sitzungen um 1.2% geweitet zur Vermeidung von Fehlausstiegen.' },
    { id: 2, date: 'Vor 3 Tagen', text: 'Gewichtung von RSI-Divergenzen im Stundencharts bei DAX-Werten erhöht (Verbesserung der Trefferquote um 4.2%).' },
    { id: 3, date: 'Vor 5 Tagen', text: 'Hebel-Empfehlung bei hoher VIX-Volatilität automatisch von max 10x auf 3x-5x gedrosselt.' }
  ]
};

// --- HELPER FUNCTIONS ---
function generateMockCandles(basePrice, count = 60, isBearishInitial = false) {
  let candles = [];
  let current = basePrice * (isBearishInitial ? 1.08 : 0.92);
  let now = new Date().getTime();
  const step = 24 * 3600 * 1000;

  for (let i = count; i >= 0; i--) {
    let change = (Math.random() - 0.48) * (basePrice * 0.025);
    let open = current;
    let close = open + change;
    let high = Math.max(open, close) + Math.random() * (basePrice * 0.012);
    let low = Math.min(open, close) - Math.random() * (basePrice * 0.012);
    let volume = Math.floor(Math.random() * 500000 + 100000);

    candles.push({
      timestamp: now - i * step,
      open, high, low, close, volume
    });
    current = close;
  }
  return candles;
}

// Calculate Technical Score & Indicators
function calculateTechnicalScore(price, buyPrice) {
  const diff = ((price - buyPrice) / buyPrice) * 100;
  let score = 50 + diff * 1.5;
  score = Math.max(10, Math.min(98, Math.round(score)));
  
  let rec = { label: 'Halten', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  if (score >= 70) rec = { label: 'Kaufen', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  if (score <= 35) rec = { label: 'Verkaufen', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  
  return { score, rec };
}

// Rates for mock conversion
const FX_RATES = { EUR: 1, USD: 1.09, USDT: 1.09 };

export default function App() {
  // State
  const [portfolios, setPortfolios] = useState(() => {
    const saved = localStorage.getItem('pm_portfolios');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIOS;
  });

  const [signals, setSignals] = useState(() => {
    const saved = localStorage.getItem('pm_signals');
    return saved ? JSON.parse(saved) : INITIAL_SIGNALS;
  });

  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'signals' | 'generator'
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('ALL'); // 'ALL' or portfolio.id
  const [displayCurrency, setDisplayCurrency] = useState('EUR'); // 'EUR', 'USD', 'USDT'
  
  // Modals & Forms
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPortName, setNewPortName] = useState('');
  const [newPortCurr, setNewPortCurr] = useState('EUR');

  // Charting selection
  const [selectedStockForChart, setSelectedStockForChart] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' | 'line'
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);

  // New Position Form
  const [posForm, setPosForm] = useState({
    symbol: '', name: '', shares: '', buyPrice: '', sector: 'Technologie', dividendYield: '0', payoutFreq: 'Quartalsweise'
  });

  // Generator State
  const [genTicker, setGenTicker] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState(null);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('pm_portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  useEffect(() => {
    localStorage.setItem('pm_signals', JSON.stringify(signals));
  }, [signals]);

  // Handle Currency Symbol
  const getCurrSymbol = (curr = displayCurrency) => {
    if (curr === 'EUR') return '€';
    if (curr === 'USD') return '$';
    if (curr === 'USDT') return '₮';
    return '€';
  };

  // Convert Values between currencies
  const convertVal = (val, fromCurr = 'EUR', toCurr = displayCurrency) => {
    if (fromCurr === toCurr) return val;
    // Normalize to EUR first
    const inEUR = val / (FX_RATES[fromCurr] || 1);
    return inEUR * (FX_RATES[toCurr] || 1);
  };

  // Portfolio Calculations
  const allPositions = selectedPortfolioId === 'ALL'
    ? portfolios.flatMap(p => p.positions.map(pos => ({ ...pos, originCurr: p.currency })))
    : (portfolios.find(p => p.id === selectedPortfolioId)?.positions || []).map(pos => ({
        ...pos, originCurr: portfolios.find(p => p.id === selectedPortfolioId)?.currency || 'EUR'
      }));

  const totalBuyValue = allPositions.reduce((acc, p) => acc + convertVal(p.shares * p.buyPrice, p.originCurr), 0);
  const totalCurrentValue = allPositions.reduce((acc, p) => acc + convertVal(p.shares * p.currentPrice, p.originCurr), 0);
  const totalGainLoss = totalCurrentValue - totalBuyValue;
  const totalGainLossPct = totalBuyValue > 0 ? (totalGainLoss / totalBuyValue) * 100 : 0;

  // Dividend Calculations (Brutto / Netto ~ 26.375% Abgeltungsteuer + Soli)
  const totalAnnualGrossDiv = allPositions.reduce((acc, p) => {
    const posVal = convertVal(p.shares * p.currentPrice, p.originCurr);
    return acc + (posVal * (p.dividendYield / 100));
  }, 0);
  const totalAnnualNetDiv = totalAnnualGrossDiv * (1 - 0.26375);

  // Auto select default stock for primary chart
  useEffect(() => {
    if (allPositions.length > 0 && !selectedStockForChart) {
      setSelectedStockForChart({
        symbol: allPositions[0].symbol,
        name: allPositions[0].name,
        candles: generateMockCandles(allPositions[0].currentPrice, 80)
      });
    }
  }, [allPositions]);

  // Handlers
  const handleAddPortfolio = (e) => {
    e.preventDefault();
    if (!newPortName) return;
    const newP = {
      id: 'p_' + Date.now(),
      name: newPortName,
      currency: newPortCurr,
      positions: []
    };
    setPortfolios([...portfolios, newP]);
    setSelectedPortfolioId(newP.id);
    setNewPortName('');
    setShowAddPortfolio(false);
  };

  const handleDeletePortfolio = (id) => {
    if (portfolios.length <= 1) {
      alert("Es muss mindestens ein Portfolio existieren.");
      return;
    }
    setPortfolios(portfolios.filter(p => p.id !== id));
    setSelectedPortfolioId('ALL');
  };

  const handleAddPosition = (e) => {
    e.preventDefault();
    if (!posForm.symbol || !posForm.shares || !posForm.buyPrice) return;
    
    const targetPortId = selectedPortfolioId === 'ALL' ? portfolios[0].id : selectedPortfolioId;
    const buyP = parseFloat(posForm.buyPrice);
    const mockCurrent = buyP * (1 + (Math.random() * 0.2 - 0.08));

    const newPos = {
      id: 'pos_' + Date.now(),
      symbol: posForm.symbol.toUpperCase(),
      name: posForm.name || posForm.symbol.toUpperCase(),
      shares: parseFloat(posForm.shares),
      buyPrice: buyP,
      currentPrice: parseFloat(mockCurrent.toFixed(2)),
      sector: posForm.sector,
      dividendYield: parseFloat(posForm.dividendYield || '0'),
      payoutFreq: posForm.payoutFreq
    };

    setPortfolios(portfolios.map(p => {
      if (p.id === targetPortId) {
        return { ...p, positions: [...p.positions, newPos] };
      }
      return p;
    }));

    setPosForm({ symbol: '', name: '', shares: '', buyPrice: '', sector: 'Technologie', dividendYield: '0', payoutFreq: 'Quartalsweise' });
    setShowAddPosition(false);
  };

  const handleDeletePosition = (posId) => {
    setPortfolios(portfolios.map(p => ({
      ...p,
      positions: p.positions.filter(pos => pos.id !== posId)
    })));
  };

  // Generate AI Signal Simulation
  const handleRunGenerator = () => {
    if (!genTicker) return;
    setGenLoading(true);
    setGeneratedSignal(null);

    setTimeout(() => {
      const isLong = Math.random() > 0.4;
      const basePrice = Math.floor(Math.random() * 200 + 40);
      const entry = basePrice;
      const tp1 = isLong ? parseFloat((entry * 1.06).toFixed(2)) : parseFloat((entry * 0.94).toFixed(2));
      const tp2 = isLong ? parseFloat((entry * 1.12).toFixed(2)) : parseFloat((entry * 0.88).toFixed(2));
      const sl = isLong ? parseFloat((entry * 0.96).toFixed(2)) : parseFloat((entry * 1.04).toFixed(2));

      const newSig = {
        id: 'gen_' + Date.now(),
        symbol: genTicker.toUpperCase(),
        name: `${genTicker.toUpperCase()} Inc.`,
        market: 'US / Global',
        direction: isLong ? 'LONG' : 'SHORT',
        entry,
        tp1,
        tp2,
        sl,
        leverage: isLong ? '3x Turbo' : '5x CFD',
        crv: '1:3.0',
        confidence: Math.floor(Math.random() * 18 + 80),
        reasoning: `KI-Pattern Match: ${isLong ? 'Bullisches Momentum' : 'Bärischer Druck'} im Tages-Chart erkannt. Starke Divergenz beim MACD & EMA support bei $${entry}.`,
        time: 'Gerade eben',
        status: 'ACTIVE',
        priceData: generateMockCandles(entry, 60, !isLong)
      };

      setGeneratedSignal(newSig);
      setGenLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
      {/* --- HEADER NAVBAR --- */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              ApexTrader AI
            </h1>
            <p className="text-xs text-slate-400">Portfolio & Live AI Daytrading Terminal</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'portfolio' 
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Portfolios</span>
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'signals' 
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>AI Signals</span>
            <span className="bg-amber-400/20 text-amber-300 text-xs px-1.5 py-0.5 rounded-full font-bold border border-amber-400/30">
              HOT
            </span>
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'generator' 
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Signal Scanner</span>
          </button>
        </div>

        {/* Global Currency & Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 mr-2">Währung:</span>
            {['EUR', 'USD', 'USDT'].map(curr => (
              <button
                key={curr}
                onClick={() => setDisplayCurrency(curr)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  displayCurrency === curr ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 lg:p-8 max-w-[1700px] w-full mx-auto space-y-8">

        {/* ================= TAB 1: PORTFOLIO MANAGEMENT ================= */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            
            {/* Portfolio Switcher Bar & KPI Cards */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1" /> Depots:
                </span>
                <button
                  onClick={() => setSelectedPortfolioId('ALL')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedPortfolioId === 'ALL'
                      ? 'bg-slate-700 text-white border border-slate-500 shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  🌐 Gesamtübersicht (Alle)
                </button>
                {portfolios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPortfolioId(p.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedPortfolioId === p.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-slate-500">({p.currency})</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowAddPortfolio(true)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-dashed border-cyan-500/40 rounded-lg transition-all"
                  title="Neues Depot erstellen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {selectedPortfolioId !== 'ALL' && (
                  <button
                    onClick={() => handleDeletePortfolio(selectedPortfolioId)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Depot Löschen</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddPosition(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Position Hinzufügen</span>
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <p className="text-xs font-medium text-slate-400">Gesamtwert Portfolio</p>
                <p className="text-2xl font-bold mt-1 text-slate-100">
                  {totalCurrentValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs">
                  <span className="text-slate-500">Kaufwert:</span>
                  <span className="text-slate-300 font-medium">
                    {totalBuyValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <p className="text-xs font-medium text-slate-400">Gesamter Gewinn / Verlust</p>
                <p className={`text-2xl font-bold mt-1 flex items-center ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                </p>
                <div className="flex items-center space-x-1 mt-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold ${totalGainLossPct >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {totalGainLossPct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {totalGainLossPct >= 0 ? '+' : ''}{totalGainLossPct.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 ml-1">All-Time</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <p className="text-xs font-medium text-slate-400">Jährliche Brutto-Dividende</p>
                <p className="text-2xl font-bold mt-1 text-cyan-400">
                  {totalAnnualGrossDiv.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Ø { (totalAnnualGrossDiv / 12).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } {getCurrSymbol()} / Monat
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                <p className="text-xs font-medium text-slate-400">Netto-Dividende (nach ~26.38% Steuer)</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {totalAnnualNetDiv.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Inkl. Soli & Abgeltungssteuer
                </p>
              </div>
            </div>

            {/* TRADINGVIEW-STYLE CANVAS CHART SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <span>{selectedStockForChart?.name || 'Portfolio Performance'}</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
                        {selectedStockForChart?.symbol || 'GLOBAL'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">Interaktives Terminal Chart & Technische Indikatoren</p>
                  </div>
                </div>

                {/* Chart Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Chart Type Toggle */}
                  <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                    <button 
                      onClick={() => setChartType('candlestick')}
                      className={`px-2.5 py-1 rounded transition-all ${chartType === 'candlestick' ? 'bg-cyan-500 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Candles
                    </button>
                    <button 
                      onClick={() => setChartType('line')}
                      className={`px-2.5 py-1 rounded transition-all ${chartType === 'line' ? 'bg-cyan-500 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Linie
                    </button>
                  </div>

                  {/* Indicator Toggles */}
                  <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                    <button 
                      onClick={() => setShowEMA20(!showEMA20)}
                      className={`px-2 py-1 rounded font-semibold ${showEMA20 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-500 line-through'}`}
                    >
                      EMA 20
                    </button>
                    <button 
                      onClick={() => setShowEMA50(!showEMA50)}
                      className={`px-2 py-1 rounded font-semibold ${showEMA50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-500 line-through'}`}
                    >
                      EMA 50
                    </button>
                    <button 
                      onClick={() => setShowEMA200(!showEMA200)}
                      className={`px-2 py-1 rounded font-semibold ${showEMA200 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-500 line-through'}`}
                    >
                      EMA 200
                    </button>
                  </div>

                  {/* Timeframe Selector */}
                  <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                    {['1D', '1W', '1M', '3M', '1J', '5J'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setChartTimeframe(tf)}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${chartTimeframe === tf ? 'bg-slate-700 text-cyan-400 border border-slate-600' : 'text-slate-400 hover:text-white'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas Component Container */}
              <div className="w-full relative bg-slate-950/60 rounded-xl border border-slate-800 p-2 overflow-hidden">
                <TradingCanvasChart 
                  data={selectedStockForChart?.candles || generateMockCandles(150, 70)} 
                  chartType={chartType}
                  showEMA20={showEMA20}
                  showEMA50={showEMA50}
                  showEMA200={showEMA200}
                />
              </div>
            </div>

            {/* POSITIONS TABLE SECTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Portfolio Positionen</h3>
                  <p className="text-xs text-slate-400">Übersicht aller Einzelwerte mit Live-Kennzahlen und KI-Scores</p>
                </div>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                  {allPositions.length} Positionen
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Ticker / Name</th>
                      <th className="py-3.5 px-4 text-right">Stückzahl</th>
                      <th className="py-3.5 px-4 text-right">Kaufkurs</th>
                      <th className="py-3.5 px-4 text-right">Akt. Kurs</th>
                      <th className="py-3.5 px-4 text-right">Gesamtwert</th>
                      <th className="py-3.5 px-4 text-right">G/V (€ / %)</th>
                      <th className="py-3.5 px-4 text-center">Div. Rendite</th>
                      <th className="py-3.5 px-4 text-center">KI Tech-Score</th>
                      <th className="py-3.5 px-4 text-center">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allPositions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-12 text-slate-500">
                          Keine Positionen in diesem Depot vorhanden. Klicken Sie auf "Position Hinzufügen".
                        </td>
                      </tr>
                    ) : (
                      allPositions.map((pos) => {
                        const buyVal = convertVal(pos.shares * pos.buyPrice, pos.originCurr);
                        const curVal = convertVal(pos.shares * pos.currentPrice, pos.originCurr);
                        const diff = curVal - buyVal;
                        const diffPct = buyVal > 0 ? (diff / buyVal) * 100 : 0;
                        const { score, rec } = calculateTechnicalScore(pos.currentPrice, pos.buyPrice);

                        return (
                          <tr 
                            key={pos.id} 
                            className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            onClick={() => {
                              setSelectedStockForChart({
                                symbol: pos.symbol,
                                name: pos.name,
                                candles: generateMockCandles(pos.currentPrice, 70)
                              });
                            }}
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs group-hover:border-cyan-500/50 transition-colors">
                                  {pos.symbol.substring(0, 3)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-200">{pos.symbol}</div>
                                  <div className="text-[11px] text-slate-400">{pos.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-300">{pos.shares}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                              {pos.buyPrice.toFixed(2)} {getCurrSymbol(pos.originCurr)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-100">
                              {pos.currentPrice.toFixed(2)} {getCurrSymbol(pos.originCurr)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                              {curVal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrSymbol()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">
                              <div className={`font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {diff >= 0 ? '+' : ''}{diff.toFixed(2)} {getCurrSymbol()}
                              </div>
                              <div className={`text-[10px] ${diffPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
                                {pos.dividendYield}%
                              </span>
                              <div className="text-[10px] text-slate-500 mt-0.5">{pos.payoutFreq}</div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rec.color}`}>
                                  {rec.label} ({score})
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDeletePosition(pos.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                                title="Position löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: AI TRADING SIGNALS ================= */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            
            {/* AI Performance Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center space-x-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-semibold">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    <span>Selbstlernendes KI-Protokoll Aktiv</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Tägliche High-Potential Daytrading Signals</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automatisierte Mustererkennung für Nasdaq, NYSE & DAX. Inklusive Einstiegszonen, Stopp-Loss & Hebel-Verhältnis.
                  </p>
                </div>

                {/* AI Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Trefferquote</p>
                    <p className="text-xl font-black text-emerald-400">{AI_STATS.winRate}%</p>
                    <p className="text-[10px] text-slate-500">{AI_STATS.wonTrades}W / {AI_STATS.lostTrades}L</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Gesamtprofit</p>
                    <p className="text-xl font-black text-cyan-400">+{AI_STATS.totalProfitPct}%</p>
                    <p className="text-[10px] text-slate-500">kumuliert</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Profit Factor</p>
                    <p className="text-xl font-black text-amber-400">{AI_STATS.profitFactor}</p>
                    <p className="text-[10px] text-slate-500">Ø CRV {AI_STATS.avgCrv}</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Trades Gesamt</p>
                    <p className="text-xl font-black text-slate-200">{AI_STATS.totalTrades}</p>
                    <p className="text-[10px] text-slate-500">verifiziert</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Self-Learning AI Logs Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Letzte KI-Lerneinheiten & Modell-Feedback
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_STATS.learnings.map(item => (
                  <div key={item.id} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                    <p className="text-slate-300 leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SIGNALS LISTING WITH DEDICATED CHARTS */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-100 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-400" /> Aktuelle Trading-Setups & Signale
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {signals.map(sig => (
                  <div key={sig.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-xl space-y-4">
                    
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider flex items-center ${
                          sig.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {sig.direction === 'LONG' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                          {sig.direction}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-bold text-slate-100">{sig.symbol}</h4>
                            <span className="text-xs text-slate-400">({sig.name})</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{sig.market} • Signal von {sig.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <p className="text-slate-400">KI Konfidenz</p>
                          <p className="font-bold text-cyan-400 text-sm">{sig.confidence}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400">Hebel / Zertifikat</p>
                          <p className="font-bold text-amber-400 text-sm">{sig.leverage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400">CRV</p>
                          <p className="font-bold text-slate-200 text-sm">{sig.crv}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Grid: Metrics & Dedicated Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Side Details */}
                      <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                        {/* Price Marks */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-500 block">Einstieg ( Entry )</span>
                            <span className="text-blue-400 font-bold font-mono text-sm">${sig.entry.toFixed(2)}</span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-500 block">Stop Loss ( SL )</span>
                            <span className="text-rose-400 font-bold font-mono text-sm">${sig.sl.toFixed(2)}</span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-500 block">Take Profit 1</span>
                            <span className="text-emerald-400 font-bold font-mono text-sm">${sig.tp1.toFixed(2)}</span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-500 block">Take Profit 2</span>
                            <span className="text-emerald-300 font-bold font-mono text-sm">${sig.tp2.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* KI Reasoning Box */}
                        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                          <span className="text-cyan-400 font-semibold flex items-center">
                            <Cpu className="w-3.5 h-3.5 mr-1" /> KI-Begründung & Technische Analyse:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{sig.reasoning}</p>
                        </div>
                      </div>

                      {/* Right Side Dedicated Signal Chart */}
                      <div className="lg:col-span-7 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
                          <span>Analyse Chart inkl. Marken</span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Entry</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> TP</span>
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> SL</span>
                          </div>
                        </div>
                        <SignalDedicatedCanvasChart 
                          data={sig.priceData}
                          entry={sig.entry}
                          tp1={sig.tp1}
                          sl={sig.sl}
                        />
                      </div>

                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 3: SIGNAL GENERATOR / SCANNER ================= */}
        {activeTab === 'generator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-cyan-400" /> KI-Signal Scanner & Setup Generator
                </h2>
                <p className="text-xs text-slate-400">
                  Geben Sie ein beliebiges Aktienkürzel (z.B. AAPL, AMZN, BABA, MSFT) ein, um die KI-Marktanalyse zu starten und ein vollwertiges Trading-Setup zu erzeugen.
                </p>
              </div>

              {/* Search input form */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={genTicker}
                    onChange={(e) => setGenTicker(e.target.value)}
                    placeholder="Ticker / WKN eingeben (z.B. AAPL, AMD, PLTR)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleRunGenerator}
                  disabled={genLoading || !genTicker}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-sm text-white rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {genLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>{genLoading ? 'Scanne Markt...' : 'Signal Generieren'}</span>
                </button>
              </div>

              {/* Generated Result Output */}
              {generatedSignal && (
                <div className="mt-8 pt-6 border-t border-slate-800 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      Analyse Erfolgreich
                    </span>
                    <button
                      onClick={() => {
                        setSignals([generatedSignal, ...signals]);
                        setActiveTab('signals');
                      }}
                      className="text-xs text-cyan-400 hover:underline font-semibold"
                    >
                      + Zu Hauptsignalen hinzufügen
                    </button>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-white">{generatedSignal.symbol}</h3>
                        <p className="text-xs text-slate-400">{generatedSignal.name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        generatedSignal.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {generatedSignal.direction}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Einstieg</span>
                        <span className="text-blue-400 font-bold">${generatedSignal.entry.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Take Profit 1</span>
                        <span className="text-emerald-400 font-bold">${generatedSignal.tp1.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Stop Loss</span>
                        <span className="text-rose-400 font-bold">${generatedSignal.sl.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Konfidenz</span>
                        <span className="text-cyan-400 font-bold">{generatedSignal.confidence}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                      {generatedSignal.reasoning}
                    </p>

                    <div className="pt-2">
                      <SignalDedicatedCanvasChart 
                        data={generatedSignal.priceData}
                        entry={generatedSignal.entry}
                        tp1={generatedSignal.tp1}
                        sl={generatedSignal.sl}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL: NEUES PORTFOLIO --- */}
      {showAddPortfolio && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Neues Portfolio Erstellen</h3>
            <form onSubmit={handleAddPortfolio} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Portfolio Name</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Dividenden Depot, Trading, etc."
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Basiswährung</label>
                <select
                  value={newPortCurr}
                  onChange={(e) => setNewPortCurr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="USDT">USDT (₮)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPortfolio(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEUE POSITION --- */}
      {showAddPosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Neue Position Hinzufügen</h3>
            <form onSubmit={handleAddPosition} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ticker / Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. AAPL, MSFT"
                    value={posForm.symbol}
                    onChange={(e) => setPosForm({ ...posForm, symbol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="z.B. Apple Inc."
                    value={posForm.name}
                    onChange={(e) => setPosForm({ ...posForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Stückzahl *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="z.B. 10"
                    value={posForm.shares}
                    onChange={(e) => setPosForm({ ...posForm, shares: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Kaufkurs pro Stück *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="z.B. 150.50"
                    value={posForm.buyPrice}
                    onChange={(e) => setPosForm({ ...posForm, buyPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sektor</label>
                  <select
                    value={posForm.sector}
                    onChange={(e) => setPosForm({ ...posForm, sector: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Technologie">Technologie</option>
                    <option value="Finanzen">Finanzen</option>
                    <option value="Gesundheitswesen">Gesundheit</option>
                    <option value="Konsumgüter">Konsumgüter</option>
                    <option value="Immobilien">Immobilien</option>
                    <option value="Krypto">Krypto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Div. Rendite %</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="z.B. 2.5"
                    value={posForm.dividendYield}
                    onChange={(e) => setPosForm({ ...posForm, dividendYield: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ausschüttung</label>
                  <select
                    value={posForm.payoutFreq}
                    onChange={(e) => setPosForm({ ...posForm, payoutFreq: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Quartalsweise">Quartalsweise</option>
                    <option value="Monatlich">Monatlich</option>
                    <option value="Jährlich">Jährlich</option>
                    <option value="Keine">Keine</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPosition(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl"
                >
                  Position Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// CANVAS COMPONENT 1: MAIN TRADINGVIEW-STYLE CANVAS CHART
// ============================================================================
function TradingCanvasChart({ data, chartType, showEMA20, showEMA50, showEMA200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 380;

    // Layout splits
    const mainChartHeight = height * 0.65;
    const volumeHeight = height * 0.12;
    const rsiHeight = height * 0.18;
    const padding = 30;

    ctx.clearRect(0, 0, width, height);

    // Calculate Price Min/Max
    let minPrice = Math.min(...data.map(d => d.low));
    let maxPrice = Math.max(...data.map(d => d.high));
    const priceRange = (maxPrice - minPrice) || 1;

    // Calculate EMAs
    const calcEMA = (period) => {
      let k = 2 / (period + 1);
      let emaArray = [];
      let prevEma = data[0].close;
      data.forEach((d, i) => {
        if (i === 0) emaArray.push(prevEma);
        else {
          let currentEma = d.close * k + prevEma * (1 - k);
          emaArray.push(currentEma);
          prevEma = currentEma;
        }
      });
      return emaArray;
    };

    const ema20 = calcEMA(20);
    const ema50 = calcEMA(50);
    const ema200 = calcEMA(200);

    // Calculate RSI (14)
    const calcRSI = (period = 14) => {
      let rsiArr = [];
      let gains = 0, losses = 0;

      for (let i = 1; i <= period && i < data.length; i++) {
        let diff = data[i].close - data[i - 1].close;
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }

      let avgGain = gains / period;
      let avgLoss = losses / period;

      for (let i = 0; i < data.length; i++) {
        if (i < period) {
          rsiArr.push(50);
          continue;
        }
        let diff = data[i].close - data[i - 1].close;
        let gain = diff >= 0 ? diff : 0;
        let loss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        let rsi = 100 - (100 / (1 + rs));
        rsiArr.push(rsi);
      }
      return rsiArr;
    };

    const rsiValues = calcRSI(14);

    const stepX = (width - padding * 2) / (data.length - 1);

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      let y = (mainChartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // 1. MAIN PRICE CHART (Candles or Line)
    data.forEach((d, i) => {
      const x = padding + i * stepX;
      const openY = mainChartHeight - ((d.open - minPrice) / priceRange) * mainChartHeight;
      const closeY = mainChartHeight - ((d.close - minPrice) / priceRange) * mainChartHeight;
      const highY = mainChartHeight - ((d.high - minPrice) / priceRange) * mainChartHeight;
      const lowY = mainChartHeight - ((d.low - minPrice) / priceRange) * mainChartHeight;

      const isGreen = d.close >= d.open;
      const color = isGreen ? '#10b981' : '#f43f5e';

      if (chartType === 'candlestick') {
        // High/Low line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        ctx.fillStyle = color;
        const candleWidth = Math.max(stepX * 0.6, 2);
        ctx.fillRect(x - candleWidth / 2, Math.min(openY, closeY), candleWidth, Math.max(Math.abs(closeY - openY), 2));
      }
    });

    // Draw Line Chart option
    if (chartType === 'line') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = padding + i * stepX;
        const closeY = mainChartHeight - ((d.close - minPrice) / priceRange) * mainChartHeight;
        if (i === 0) ctx.moveTo(x, closeY);
        else ctx.lineTo(x, closeY);
      });
      ctx.stroke();
    }

    // Draw EMAs
    const drawEMALine = (emaData, strokeColor) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      emaData.forEach((val, i) => {
        const x = padding + i * stepX;
        const y = mainChartHeight - ((val - minPrice) / priceRange) * mainChartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    if (showEMA20) drawEMALine(ema20, '#3b82f6'); // Blue
    if (showEMA50) drawEMALine(ema50, '#f59e0b'); // Yellow
    if (showEMA200) drawEMALine(ema200, '#a855f7'); // Purple

    // 2. VOLUME BARS
    const volumeYStart = mainChartHeight + 10;
    const maxVol = Math.max(...data.map(d => d.volume)) || 1;
    data.forEach((d, i) => {
      const x = padding + i * stepX;
      const volHeight = (d.volume / maxVol) * volumeHeight;
      const y = volumeYStart + (volumeHeight - volHeight);
      const isGreen = d.close >= d.open;

      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
      const barWidth = Math.max(stepX * 0.6, 2);
      ctx.fillRect(x - barWidth / 2, y, barWidth, volHeight);
    });

    // 3. RSI SUBPLOT
    const rsiYStart = volumeYStart + volumeHeight + 20;
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(padding, rsiYStart, width - padding * 2, rsiHeight);

    // Overbought (70) and Oversold (30) Lines
    const rsi70Y = rsiYStart + rsiHeight - (0.70 * rsiHeight);
    const rsi30Y = rsiYStart + rsiHeight - (0.30 * rsiHeight);

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padding, rsi70Y);
    ctx.lineTo(width - padding, rsi70Y);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.beginPath();
    ctx.moveTo(padding, rsi30Y);
    ctx.lineTo(width - padding, rsi30Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // RSI Line
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    rsiValues.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = rsiYStart + rsiHeight - ((val / 100) * rsiHeight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Text Overlay
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(`RSI(14): ${rsiValues[rsiValues.length - 1].toFixed(1)}`, padding + 5, rsiYStart + 12);

  }, [data, chartType, showEMA20, showEMA50, showEMA200]);

  return <canvas ref={canvasRef} className="w-full block" />;
}

// ============================================================================
// CANVAS COMPONENT 2: DEDICATED SIGNAL CHART WITH ENTRY, TP & SL LINES
// ============================================================================
function SignalDedicatedCanvasChart({ data, entry, tp1, sl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 200;
    const padding = 25;

    ctx.clearRect(0, 0, width, height);

    // Min Max Range including TP and SL
    let minPrice = Math.min(...data.map(d => d.low), sl);
    let maxPrice = Math.max(...data.map(d => d.high), tp1);
    const priceRange = (maxPrice - minPrice) || 1;

    const stepX = (width - padding * 2) / (data.length - 1);

    // Draw Price Candles
    data.forEach((d, i) => {
      const x = padding + i * stepX;
      const openY = height - ((d.open - minPrice) / priceRange) * height;
      const closeY = height - ((d.close - minPrice) / priceRange) * height;
      const highY = height - ((d.high - minPrice) / priceRange) * height;
      const lowY = height - ((d.low - minPrice) / priceRange) * height;

      const isGreen = d.close >= d.open;
      const color = isGreen ? '#10b981' : '#f43f5e';

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      ctx.fillStyle = color;
      const candleWidth = Math.max(stepX * 0.5, 2);
      ctx.fillRect(x - candleWidth / 2, Math.min(openY, closeY), candleWidth, Math.max(Math.abs(closeY - openY), 1));
    });

    // Helper for Level Overlay Lines
    const drawPriceLevel = (price, color, label) => {
      const y = height - ((price - minPrice) / priceRange) * height;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(`${label}: $${price.toFixed(2)}`, width - padding - 75, y - 4);
    };

    drawPriceLevel(entry, '#3b82f6', 'Einstieg');
    drawPriceLevel(tp1, '#10b981', 'TP1');
    drawPriceLevel(sl, '#f43f5e', 'SL');

  }, [data, entry, tp1, sl]);

  return <canvas ref={canvasRef} className="w-full block" />;
}