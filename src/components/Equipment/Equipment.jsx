import { useState } from 'react'
import { BESS_PRODUCTS, FINANCIAL_DEFAULTS } from '../../data/database'
import useSimulatorStore from '../../store/useSimulatorStore'
import { generateLoadCurve, simulateDay, calcDemandReduction } from '../../engine/simulator'
import { calcMonthlySavings } from '../../engine/commercial'
import { calcCapex, buildCashFlow, calcNPV, calcIRR, calcPayback } from '../../engine/financial'
import { classifyProject, generateAlerts } from '../../engine/interpretation'

function Equipment() {
  const { loads, setSelectedProduct, setResults, setStep } = useSimulatorStore()
  const [selected, setSelected] = useState(null)
  const [running, setRunning] = useState(false)

  function handleSelect(product) {
    setSelected(product)
  }

  function handleSimulate() {
    if (!selected) return
    setRunning(true)

    // Pequeno delay para feedback visual
    setTimeout(() => {
      // 1. Curva de carga
      const loadCurve = generateLoadCurve(loads.peakKw, loads.avgKw)

      // 2. Simulação diária
      const hourlyResult = simulateDay(loadCurve, selected)

      // 3. Redução de demanda
      const demandReduction = calcDemandReduction(hourlyResult)

      // 4. Economia comercial — usa tarifas do usuário
      const tariff = {
        offPeak: loads.tariffOffPeak,
        peak: loads.tariffPeak,
        demand: loads.tariffDemand,
        peakHours: [18, 19, 20],
      }
      const savings = calcMonthlySavings(hourlyResult, tariff)

      // 5. CAPEX
      const capex = calcCapex(selected)

      // 6. Fluxo de caixa
      const cashFlows = buildCashFlow(savings.totalAnnual, capex.totalBRL)

      // 7. Indicadores financeiros
      const npv = calcNPV(cashFlows)
      const irr = calcIRR(cashFlows)
      const payback = calcPayback(cashFlows)

      // 8. Classificação e alertas
      const classification = classifyProject(irr, payback.simplePayback)
      const alerts = generateAlerts(
        { peakKw: loads.peakKw, state: loads.state || '' },
        { reductionPct: demandReduction.reductionPct, irr, ...payback, analysisYears: FINANCIAL_DEFAULTS.analysisYears }
      )

      // 9. Montar resultado completo
      const results = {
        hourlyResult,
        demandReduction,
        savings,
        capex,
        cashFlows,
        npv,
        irr,
        simplePayback: payback.simplePayback,
        discountedPayback: payback.discountedPayback,
        classification,
        alerts,
        product: selected,
        analysisYears: FINANCIAL_DEFAULTS.analysisYears,
        loads,
      }

      setSelectedProduct(selected)
      setResults(results)
      setRunning(false)
      setStep(5)
    }, 600)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Seleção de Equipamento</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Escolha o sistema BESS a ser simulado. Os preços são referência — atualize em <code className="text-emerald-400">src/data/database.js</code>.
        </p>
      </div>

      {/* Cards de produto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {BESS_PRODUCTS.map((product) => {
          const isSelected = selected?.id === product.id
          return (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className={`
                text-left p-5 rounded-xl border transition-all
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }
              `}
            >
              {/* Header do card */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-white font-semibold text-sm">{product.label}</span>
                <span className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                  ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}
                `}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </span>
              </div>

              {/* Specs */}
              <div className="space-y-1.5">
                <SpecRow label="Capacidade" value={`${product.capacityKwh} kWh`} />
                <SpecRow label="Potência" value={`${product.powerKw} kW`} />
                <SpecRow label="Química" value={product.chemistry} />
                <SpecRow label="Ciclos de vida" value={product.cycleLife.toLocaleString('pt-BR')} />
                <SpecRow label="DoD" value={`${product.dod * 100}%`} />
              </div>

              {/* Preço */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500">Referência de preço</span>
                <p className="text-emerald-400 font-bold text-lg">
                  USD {product.priceUSD.toLocaleString('en-US')}
                </p>
                <p className="text-gray-500 text-xs">
                  ≈ R$ {(product.priceUSD * FINANCIAL_DEFAULTS.exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Resumo da seleção */}
      {selected && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400">
            Equipamento selecionado:{' '}
            <span className="text-emerald-400 font-medium">{selected.label}</span>
            {' '}— CAPEX estimado:{' '}
            <span className="text-white font-medium">
              R$ {(selected.priceUSD * FINANCIAL_DEFAULTS.exchangeRate * (1 + FINANCIAL_DEFAULTS.installationCost))
                .toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-gray-500 text-xs ml-1">(equip. + instalação)</span>
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSimulate}
          disabled={!selected || running}
          className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Simulando...
            </>
          ) : (
            'Simular →'
          )}
        </button>
      </div>
    </div>
  )
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  )
}

export default Equipment
