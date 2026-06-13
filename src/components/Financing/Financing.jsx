import { useState } from 'react'
import { PRAZO_OPTIONS, DEFAULT_ENTRADA_PCT, calcFinancing } from '../../engine/financing'

function BankCard({ bank }) {
  const fmtBRL = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={`
      flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all
      ${bank.positivo
        ? 'border-emerald-800/60 bg-emerald-950/20'
        : 'border-gray-800 bg-gray-900/50'
      }
    `}>
      {/* Nome + taxa */}
      <div className="flex items-center gap-3 sm:w-44 shrink-0">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: bank.color }}
        />
        <div>
          <p className="text-white font-semibold text-sm">{bank.name}</p>
          <p className="text-gray-500 text-xs">
            {(bank.monthlyRate * 100).toFixed(2)}% a.m.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Parcela/mês</p>
          <p className="text-white font-bold text-sm">{fmtBRL(bank.parcela)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Total pago</p>
          <p className="text-gray-300 text-sm">{fmtBRL(bank.totalPago)}</p>
          <p className="text-red-400 text-xs">+{fmtBRL(bank.jurosTotal)} juros</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-0.5">Parcela vs Economia</p>
          <p className={`text-sm font-bold ${bank.positivo ? 'text-emerald-400' : 'text-red-400'}`}>
            {bank.positivo
              ? `sobram ${fmtBRL(bank.saldoMensal)}/mês`
              : `faltam ${fmtBRL(Math.abs(bank.saldoMensal))}/mês`
            }
          </p>
        </div>
      </div>
    </div>
  )
}

function Financing({ capexTotal, economiaMensal }) {
  const [entradaPct, setEntradaPct] = useState(DEFAULT_ENTRADA_PCT)
  const [prazo, setPrazo] = useState(48)

  const fmtBRL = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const results = calcFinancing(capexTotal, economiaMensal, entradaPct, prazo)
  const entrada = (entradaPct / 100) * capexTotal
  const valorFinanciado = capexTotal - entrada

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">

      {/* Cabeçalho */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
          Simulação de Financiamento
        </h3>
        <p className="text-xs text-gray-600">
          Taxas de referência para crédito solar (abr/2026) — sistema Price, parcelas fixas.
        </p>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Entrada */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Entrada</span>
            <span className="text-emerald-400 font-semibold text-sm">
              {entradaPct}% — {fmtBRL(entrada)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={entradaPct}
            onChange={e => setEntradaPct(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5"
          />
          <div className="flex justify-between text-xs text-gray-700 mt-1">
            <span>0%</span><span>70%</span>
          </div>
        </div>

        {/* Prazo */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Prazo</span>
            <span className="text-emerald-400 font-semibold text-sm">{prazo} meses</span>
          </div>
          <div className="flex gap-2">
            {PRAZO_OPTIONS.map(p => (
              <button
                key={p}
                onClick={() => setPrazo(p)}
                className={`
                  flex-1 py-2 rounded-lg text-xs font-semibold transition-colors
                  ${prazo === p
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                {p}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'CAPEX total',      value: fmtBRL(capexTotal),      color: 'text-white' },
          { label: 'Entrada',          value: fmtBRL(entrada),         color: 'text-emerald-400' },
          { label: 'Valor financiado', value: fmtBRL(valorFinanciado), color: 'text-blue-400' },
          { label: 'Economia/mês',     value: fmtBRL(economiaMensal),  color: 'text-emerald-400' },
        ].map(item => (
          <div key={item.label} className="bg-gray-800/60 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Cards dos bancos */}
      <div className="space-y-2.5">
        {results.map(bank => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>

      <p className="text-xs text-gray-700">
        * Simulação pelo sistema Price. Taxas são médias de mercado e podem variar
        conforme perfil do cliente e negociação com o banco.
      </p>
    </div>
  )
}

export default Financing
