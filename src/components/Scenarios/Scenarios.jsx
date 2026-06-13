import useSimulatorStore from '../../store/useSimulatorStore'
import { compareScenarios } from '../../engine/scenarios'
import { exportPDF } from '../../pdf/exportPDF.jsx'

// --- Badge de classificação inline ---
function ClassBadge({ classification }) {
  const colors = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    green:   'bg-green-500/20 text-green-400 border-green-500/40',
    yellow:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    red:     'bg-red-500/20 text-red-400 border-red-500/40',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[classification.color]}`}>
      {classification.label}
    </span>
  )
}

// --- Linha de KPI comparativa ---
function CompareRow({ label, values, unit = '', higherIsBetter = true, formatFn }) {
  const nums = values.map(v => typeof v === 'number' ? v : null)
  const allValid = nums.every(n => n !== null)

  const best = allValid
    ? higherIsBetter ? Math.max(...nums) : Math.min(...nums)
    : null

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <span className="text-xs text-gray-500 self-center">{label}</span>
      {values.map((v, i) => {
        const isBest = allValid && nums[i] === best
        return (
          <div
            key={i}
            className={`
              text-center py-2 rounded-lg text-sm font-medium
              ${isBest ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-gray-300'}
            `}
          >
            {formatFn ? formatFn(v) : `${v}${unit}`}
          </div>
        )
      })}
    </div>
  )
}

// --- Card de cenário ---
function ScenarioCard({ scenario, index, onRemove }) {
  const { results, product, loads, label } = scenario

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 relative">
      {/* Remover */}
      <button
        onClick={() => onRemove(scenario.id)}
        className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition text-lg leading-none"
        title="Remover cenário"
      >
        ×
      </button>

      {/* Header */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Cenário {index + 1}</span>
        <p className="text-white font-semibold text-sm mt-0.5 pr-6">{label}</p>
        <div className="flex items-center gap-2 mt-2">
          <ClassBadge classification={results.classification} />
          <span className="text-xs text-gray-500">{product.chemistry} · {product.capacityKwh} kWh</span>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="space-y-2">
        <MiniKpi label="TIR" value={`${results.irr}%`} />
        <MiniKpi label="VPL" value={`R$ ${(results.npv / 1000).toFixed(0)}k`} />
        <MiniKpi
          label="Payback"
          value={typeof results.simplePayback === 'number' ? `${results.simplePayback} anos` : '>horizonte'}
        />
        <MiniKpi label="Economia/mês" value={`R$ ${results.savings.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
        <MiniKpi label="CAPEX" value={`R$ ${(results.capex.totalBRL / 1000).toFixed(0)}k`} />
        <MiniKpi
          label="Redução ponta"
          value={`${results.demandReduction.reductionKw} kW (${results.demandReduction.reductionPct}%)`}
        />
      </div>

      {/* Inputs resumidos */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Parâmetros de entrada</p>
        <div className="space-y-1">
          <MiniKpi label="Pico" value={`${loads.peakKw} kW`} dim />
          <MiniKpi label="Média" value={`${loads.avgKw} kW`} dim />
          <MiniKpi label="Tarifa ponta" value={`R$ ${loads.tariffPeak}/kWh`} dim />
        </div>
      </div>
    </div>
  )
}

function MiniKpi({ label, value, dim = false }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={dim ? 'text-gray-500' : 'text-gray-200'}>{value}</span>
    </div>
  )
}

// --- Tabela comparativa (2–3 cenários) ---
function ComparisonTable({ scenarios }) {
  if (scenarios.length < 2) return null

  const values = (fn) => scenarios.map(s => fn(s))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-5">
        Comparativo direto
      </h3>

      {/* Header das colunas */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `160px repeat(${scenarios.length}, 1fr)` }}>
        <div />
        {scenarios.map((s, i) => (
          <div key={s.id} className="text-center text-xs text-gray-400 font-medium">
            Cenário {i + 1}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <CompareRow
          label="TIR (%)"
          values={values(s => s.results.irr)}
          higherIsBetter={true}
          formatFn={v => `${v}%`}
        />
        <CompareRow
          label="VPL (R$)"
          values={values(s => s.results.npv)}
          higherIsBetter={true}
          formatFn={v => `R$ ${(v / 1000).toFixed(0)}k`}
        />
        <CompareRow
          label="Payback (anos)"
          values={values(s => typeof s.results.simplePayback === 'number' ? s.results.simplePayback : 999)}
          higherIsBetter={false}
          formatFn={v => v === 999 ? '>horizonte' : `${v} anos`}
        />
        <CompareRow
          label="Economia/mês"
          values={values(s => s.results.savings.totalMonthly)}
          higherIsBetter={true}
          formatFn={v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
        />
        <CompareRow
          label="CAPEX total"
          values={values(s => s.results.capex.totalBRL)}
          higherIsBetter={false}
          formatFn={v => `R$ ${(v / 1000).toFixed(0)}k`}
        />
        <CompareRow
          label="Redução ponta"
          values={values(s => s.results.demandReduction.reductionPct)}
          higherIsBetter={true}
          formatFn={v => `${v}%`}
        />
        <CompareRow
          label="Capacidade BESS"
          values={values(s => s.product.capacityKwh)}
          higherIsBetter={false}
          formatFn={v => `${v} kWh`}
        />
      </div>

      {/* Diff entre os dois primeiros cenários */}
      {scenarios.length >= 2 && (() => {
        const diff = compareScenarios(scenarios[0], scenarios[1])
        return (
          <div className="mt-5 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-3">Variação: Cenário 1 vs Cenário 2</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'TIR', val: diff.irrDiff },
                { label: 'VPL', val: diff.npvDiff },
                { label: 'Payback', val: diff.paybackDiff, invert: true },
                { label: 'Economia', val: diff.savingsDiff },
              ].map(({ label, val, invert }) => {
                const positive = invert ? val < 0 : val > 0
                return (
                  <div key={label} className="bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className={`text-xs font-medium ${positive ? 'text-emerald-400' : val === 0 ? 'text-gray-400' : 'text-red-400'}`}>
                      {val > 0 ? '+' : ''}{val}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// --- Componente principal ---
function Scenarios() {
  const { scenarios, removeScenario, setStep, results, project } = useSimulatorStore()

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Comparação de Cenários</h2>
          <p className="text-gray-400 text-sm mt-1">
            Salve até 3 cenários no painel de resultados para comparar aqui.
          </p>
        </div>
        {results && (
          <button
            onClick={() => setStep(5)}
            className="text-sm px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition"
          >
            ← Voltar aos resultados
          </button>
        )}
      </div>

      {/* Estado vazio */}
      {scenarios.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Nenhum cenário salvo ainda.
          </p>
          <p className="text-gray-600 text-xs mb-6">
            Execute uma simulação, acesse o Painel Executivo e clique em "Salvar cenário".
          </p>
          <button
            onClick={() => setStep(results ? 5 : 1)}
            className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
          >
            {results ? 'Ir para resultados' : 'Iniciar simulação'}
          </button>
        </div>
      )}

      {/* Cards dos cenários */}
      {scenarios.length > 0 && (
        <div className={`grid gap-5 ${
          scenarios.length === 1 ? 'grid-cols-1 max-w-sm' :
          scenarios.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-3'
        }`}>
          {scenarios.map((scenario, i) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={i}
              onRemove={removeScenario}
            />
          ))}

          {/* Slot vazio — adicionar cenário */}
          {scenarios.length < 3 && (
            <button
              onClick={() => setStep(results ? 5 : 3)}
              className="border border-gray-800 border-dashed rounded-xl p-5 text-center text-gray-600 hover:text-gray-400 hover:border-gray-700 transition flex flex-col items-center justify-center gap-2 min-h-48"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm">Adicionar cenário</span>
            </button>
          )}
        </div>
      )}

      {/* Tabela comparativa */}
      {scenarios.length >= 2 && <ComparisonTable scenarios={scenarios} />}

      {/* Ações */}
      <div className="flex gap-3 pb-8">
        <button
          onClick={() => setStep(results ? 5 : 3)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition"
        >
          ← Voltar
        </button>
        <button
          onClick={() => results && exportPDF(results, project)}
          disabled={!results}
          className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
        >
          Exportar PDF →
        </button>
      </div>
    </div>
  )
}

export default Scenarios
