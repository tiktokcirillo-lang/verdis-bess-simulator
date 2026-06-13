import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { generateAnnualReport } from '../../engine/annualReport'
import { useMemo } from 'react'

function KpiMini({ label, value, color = 'text-emerald-400', sub }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label, prefix = 'R$', decimals = 0 }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {prefix} {Number(p.value).toLocaleString('pt-BR', { minimumFractionDigits: decimals })}
        </p>
      ))}
    </div>
  )
}

function AnnualReport({ stateSigla, product, savings, capex }) {
  const report = useMemo(
    () => generateAnnualReport(stateSigla, product, savings, capex),
    [stateSigla, product, savings, capex]
  )

  if (!stateSigla || !product) return null

  const fmtBRL = v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`

  const monthlyChartData = report.monthlyData.map(m => ({
    name:    m.monthName,
    Economia: m.economiaMes,
    'Energia deslocada (kWh)': m.energyShiftedKwh,
  }))

  const projectionData = report.projectionYears.map(y => ({
    ano:  `Ano ${y.year}`,
    'Economia acumulada': y.economiaAcum,
    'Economia anual':     y.economiaAnual,
  }))

  const breakevenYear = report.projectionYears.find(y => y.economiaAcum >= 0)?.year || null

  return (
    <div className="space-y-8">

      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          Impacto Anual Estimado — {stateSigla}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiMini
            label="Economia anual"
            value={fmtBRL(report.totalEconomiaAnual)}
            color="text-emerald-400"
            sub="c/ inflação tarifária"
          />
          <KpiMini
            label="Energia deslocada"
            value={`${report.totalEnergyShifted.toLocaleString('pt-BR')} kWh`}
            color="text-blue-400"
            sub="energia fora da rede/ano"
          />
          <KpiMini
            label="CO₂ evitado"
            value={`${report.totalCO2Evitado} kg`}
            color="text-green-400"
            sub={`≈ ${report.equivalencias.arvoresPlantadas} árvores/ano`}
          />
          <KpiMini
            label="Variação sazonal"
            value={`${report.variacaoSazonal}%`}
            color="text-yellow-400"
            sub={`${report.melhorMes} vs ${report.piorMes}`}
          />
        </div>
      </div>

      <div className="bg-green-950/20 border border-green-900/40 rounded-xl p-5">
        <p className="text-xs text-green-500 uppercase tracking-wider font-medium mb-3">
          Equivalências ambientais anuais
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">
              {report.equivalencias.arvoresPlantadas}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">árvores plantadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {report.equivalencias.kmNaoRodados.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">km não rodados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {report.equivalencias.casasMes}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">casas abastecidas/mês</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-5">
          Economia Mensal Estimada (com variação sazonal)
        </h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip prefix="R$" decimals={0} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <Bar dataKey="Economia" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-5">
          Projeção de Retorno Acumulado ({report.projectionYears.length} anos)
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={projectionData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAccum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="ano" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} interval={3} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip prefix="R$" decimals={0} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
            {breakevenYear && (
              <ReferenceLine
                x={`Ano ${breakevenYear}`}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: `Payback: Ano ${breakevenYear}`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="Economia acumulada"
              stroke="#10b981"
              fill="url(#gradAccum)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Dados Mensais Detalhados
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {['Mês', 'Irrad.', 'Luz solar', 'Ef. ciclo', 'Energia deslocada', 'Economia', 'CO₂ evitado'].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.monthlyData.map((m, i) => {
                const isTop = m.economiaMes === Math.max(...report.monthlyData.map(x => x.economiaMes))
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className={`py-2 px-2 font-medium ${isTop ? 'text-emerald-400' : 'text-white'}`}>
                      {m.monthName}
                    </td>
                    <td className="py-2 px-2 text-yellow-400">{m.irradiance} kWh/m²</td>
                    <td className="py-2 px-2 text-gray-400">{m.daylightH}h</td>
                    <td className="py-2 px-2 text-gray-400">{(m.cycleEfficiency * 100).toFixed(0)}%</td>
                    <td className="py-2 px-2 text-blue-400">{m.energyShiftedKwh.toLocaleString('pt-BR')} kWh</td>
                    <td className="py-2 px-2 text-emerald-400 font-medium">
                      {fmtBRL(m.economiaMes)}
                    </td>
                    <td className="py-2 px-2 text-green-400">{m.co2EvitadoKg} kg</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700">
                <td className="py-2 px-2 text-gray-400 font-medium" colSpan={4}>Total anual</td>
                <td className="py-2 px-2 text-blue-400 font-bold">
                  {report.totalEnergyShifted.toLocaleString('pt-BR')} kWh
                </td>
                <td className="py-2 px-2 text-emerald-400 font-bold">
                  {fmtBRL(report.totalEconomiaAnual)}
                </td>
                <td className="py-2 px-2 text-green-400 font-bold">
                  {report.totalCO2Evitado} kg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}

export default AnnualReport
