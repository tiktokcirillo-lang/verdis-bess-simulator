import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import useSimulatorStore from '../../store/useSimulatorStore'
import { exportPDF } from '../../pdf/exportPDF.jsx'
import EmptyState from '../UI/EmptyState'

// --- KPI Card ---
function KpiCard({ label, value, sub, color = 'emerald', large = false }) {
  const colors = {
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-bold ${large ? 'text-3xl' : 'text-2xl'} ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// --- Badge de classificação ---
function ClassificationBadge({ classification }) {
  const colors = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    green: 'bg-green-500/20 text-green-400 border-green-500/40',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    red: 'bg-red-500/20 text-red-400 border-red-500/40',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[classification.color]}`}>
      {classification.label}
    </span>
  )
}

// --- Tooltip customizado ---
function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-gray-400 mb-1">{label}h</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(1)} {unit}
        </p>
      ))}
    </div>
  )
}

// --- Tooltip do fluxo de caixa ---
function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-gray-400 mb-1">Ano {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: R$ {Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  )
}

// --- Executive principal ---
function Executive() {
  const { results, project, setStep, saveScenario, scenarios } = useSimulatorStore()

  if (!results) {
    return (
      <EmptyState
        icon="📊"
        title="Nenhuma simulação executada"
        description="Preencha os dados do projeto, configure as cargas e selecione um equipamento BESS para ver os resultados aqui."
        action="Iniciar simulação"
        onAction={() => setStep(1)}
      />
    )
  }

  const {
    hourlyResult,
    demandReduction,
    savings,
    capex,
    cashFlows,
    npv,
    irr,
    simplePayback,
    discountedPayback,
    classification,
    alerts,
    product,
    analysisYears,
  } = results

  // Dados para o gráfico de curva de carga (24h)
  const loadChartData = hourlyResult.map(h => ({
    hour: h.hour,
    'Carga Total': h.loadKw,
    'Rede (c/ BESS)': h.gridKw,
    'BESS': h.bessKw,
  }))

  // Dados para o gráfico de fluxo de caixa acumulado
  let cumulative = 0
  const cashFlowChartData = cashFlows.map((flow, t) => {
    cumulative += flow
    return {
      ano: t,
      'Fluxo Acumulado': parseFloat(cumulative.toFixed(0)),
      'Fluxo Anual': parseFloat(flow.toFixed(0)),
    }
  })

  // Breakeven ano (onde fluxo acumulado cruza zero)
  const breakevenYear = typeof simplePayback === 'number' ? simplePayback : null

  function handleSaveScenario() {
    const label = `Cenário ${scenarios.length + 1} — ${product.label}`
    saveScenario(label)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel Executivo</h2>
          <p className="text-gray-400 text-sm mt-1">
            {project.clientName} — {project.location} — {product.label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClassificationBadge classification={classification} />
          <button
            onClick={handleSaveScenario}
            disabled={scenarios.length >= 3}
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 rounded-lg transition"
          >
            Salvar cenário
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const styles = {
              warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
              info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
              error: 'bg-red-500/10 border-red-500/30 text-red-300',
            }
            const icons = { warning: '⚠', info: 'ℹ', error: '✕' }
            return (
              <div key={i} className={`flex gap-2 px-4 py-2.5 rounded-lg border text-sm ${styles[alert.type]}`}>
                <span>{icons[alert.type]}</span>
                <span>{alert.message}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* KPIs financeiros */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Indicadores Financeiros</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="TIR"
            value={`${irr}%`}
            sub={`Desconto: ${(results.discountRate * 100 || 10).toFixed(0)}% a.a.`}
            color={irr >= 12 ? 'emerald' : irr >= 6 ? 'yellow' : 'red'}
            large
          />
          <KpiCard
            label="VPL"
            value={`R$ ${(npv / 1000).toFixed(0)}k`}
            sub={`R$ ${npv.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            color={npv >= 0 ? 'emerald' : 'red'}
          />
          <KpiCard
            label="Payback Simples"
            value={typeof simplePayback === 'number' ? `${simplePayback} anos` : '>horizonte'}
            sub={`Descontado: ${typeof discountedPayback === 'number' ? discountedPayback + ' anos' : '>horizonte'}`}
            color={typeof simplePayback === 'number' && simplePayback <= 8 ? 'emerald' : 'yellow'}
          />
          <KpiCard
            label="CAPEX Total"
            value={`R$ ${(capex.totalBRL / 1000).toFixed(0)}k`}
            sub={`Equip. + instalação (${((capex.installationBRL / capex.equipmentBRL) * 100).toFixed(0)}%)`}
            color="blue"
          />
        </div>
      </div>

      {/* KPIs de economia */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Economia Tarifária</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Economia Mensal"
            value={`R$ ${savings.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            sub="energia + demanda"
            color="emerald"
          />
          <KpiCard
            label="Economia Anual"
            value={`R$ ${(savings.totalAnnual / 1000).toFixed(0)}k`}
            sub={`R$ ${savings.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
            color="emerald"
          />
          <KpiCard
            label="Redução de Ponta"
            value={`${demandReduction.reductionKw} kW`}
            sub={`${demandReduction.reductionPct}% de redução`}
            color="blue"
          />
          <KpiCard
            label="Pico c/ BESS"
            value={`${demandReduction.peakWithKw} kW`}
            sub={`Sem BESS: ${demandReduction.peakWithoutKw} kW`}
            color="green"
          />
        </div>
      </div>

      {/* Gráfico — Curva de Carga 24h */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
          Curva de Carga — Perfil Diário (24h)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={loadChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="hour" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}h`} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}kW`} />
            <Tooltip content={<CustomTooltip unit="kW" />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="Carga Total" stroke="#6b7280" fill="url(#gradLoad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Rede (c/ BESS)" stroke="#10b981" fill="url(#gradGrid)" strokeWidth={2} />
            <Bar dataKey="BESS" fill="#065f46" radius={[2, 2, 0, 0]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico — Fluxo de Caixa Acumulado */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
          Fluxo de Caixa Acumulado — {analysisYears} anos
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={cashFlowChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="ano" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `Ano ${v}`} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CashFlowTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
            {breakevenYear && (
              <ReferenceLine
                x={breakevenYear}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: `Payback: Ano ${breakevenYear}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }}
              />
            )}
            <Area type="monotone" dataKey="Fluxo Acumulado" stroke="#10b981" fill="url(#gradCash)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Descrição da classificação */}
      <div className={`
        rounded-xl border p-5
        ${classification.color === 'emerald' || classification.color === 'green'
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : classification.color === 'yellow'
          ? 'bg-yellow-500/5 border-yellow-500/20'
          : 'bg-red-500/5 border-red-500/20'
        }
      `}>
        <div className="flex items-center gap-3 mb-2">
          <ClassificationBadge classification={classification} />
          <span className="text-sm text-gray-400">Avaliação do projeto</span>
        </div>
        <p className="text-gray-300 text-sm">{classification.description}</p>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition"
        >
          ← Trocar equipamento
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition"
        >
          Comparar cenários
        </button>
        <button
          onClick={() => exportPDF(results, project)}
          className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Exportar PDF →
        </button>
      </div>
    </div>
  )
}

export default Executive
