import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { getMonthlyIrradiation, MONTH_NAMES_PT } from '../../data/irradiation'
import { generateAnnualSolarProfile } from '../../engine/solarPosition'
import { useMemo, useState } from 'react'

function TooltipIrrad({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)} {p.name.includes('Irrad') ? 'kWh/m²/dia' : ''}
        </p>
      ))}
    </div>
  )
}

function TooltipHourly({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}h</p>
      <p className="text-yellow-400">
        Irradiância: {Number(payload[0]?.value * 100).toFixed(0)}%
      </p>
    </div>
  )
}

function SolarProfile({ stateSigla, systemKwp = 0 }) {
  const [selectedMonth, setSelectedMonth] = useState(0) // 0 = todos

  const monthlyIrrad  = useMemo(() => getMonthlyIrradiation(stateSigla), [stateSigla])
  const annualProfile = useMemo(() => generateAnnualSolarProfile(stateSigla), [stateSigla])

  // Dados para o gráfico mensal
  const monthlyChartData = MONTH_NAMES_PT.map((name, i) => ({
    name,
    'Irrad. (kWh/m²/dia)': monthlyIrrad[i],
    ...(systemKwp > 0 && {
      'Geração est. (kWh)': parseFloat((monthlyIrrad[i] * systemKwp * 30 * 0.75).toFixed(0)),
    }),
  }))

  // Dados para o gráfico horário do mês selecionado
  const monthData = selectedMonth > 0
    ? annualProfile[selectedMonth - 1]
    : null

  const hourlyChartData = monthData
    ? monthData.hourlyIrradiance.map((v, h) => ({ hour: h, irradiância: v }))
    : []

  // KPIs anuais
  const avgAnnual    = parseFloat((monthlyIrrad.reduce((a, b) => a + b, 0) / 12).toFixed(2))
  const peakMonth    = MONTH_NAMES_PT[monthlyIrrad.indexOf(Math.max(...monthlyIrrad))]
  const lowestMonth  = MONTH_NAMES_PT[monthlyIrrad.indexOf(Math.min(...monthlyIrrad))]
  const variation    = parseFloat(((Math.max(...monthlyIrrad) - Math.min(...monthlyIrrad)) / avgAnnual * 100).toFixed(1))

  if (!stateSigla) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">
        Selecione um estado na etapa de Cargas para visualizar o perfil solar.
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Irrad. média anual', value: `${avgAnnual} kWh/m²/dia`, color: 'text-yellow-400' },
          { label: 'Melhor mês',         value: peakMonth,                  color: 'text-emerald-400' },
          { label: 'Pior mês',           value: lowestMonth,                color: 'text-red-400'     },
          { label: 'Variação sazonal',   value: `${variation}%`,            color: 'text-blue-400'    },
        ].map(kpi => (
          <div key={kpi.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico mensal */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-5">
          Irradiação Mensal — {stateSigla}
          {systemKwp > 0 && ` · Sistema ${systemKwp.toFixed(1)} kWp`}
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip content={<TooltipIrrad />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <Bar dataKey="Irrad. (kWh/m²/dia)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            {systemKwp > 0 && (
              <Bar dataKey="Geração est. (kWh)" fill="#10b981" radius={[3, 3, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seletor de mês + curva horária */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Curva de Irradiância Horária
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES_PT.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i + 1)}
                className={`
                  px-2.5 py-1 rounded text-xs font-medium transition-colors
                  ${selectedMonth === i + 1
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {selectedMonth > 0 && monthData ? (
          <>
            {/* Info do mês */}
            <div className="flex gap-4 mb-4 text-xs text-gray-500">
              <span>Nascer: <span className="text-gray-300">{monthData.sunriseH}h</span></span>
              <span>Pôr: <span className="text-gray-300">{monthData.sunsetH}h</span></span>
              <span>Horas de luz: <span className="text-gray-300">{monthData.daylightH}h</span></span>
              <span>Pico: <span className="text-yellow-400">{(monthData.peakIrradiance * 100).toFixed(0)}%</span></span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="hour" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `${v}h`} />
                <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip content={<TooltipHourly />} />
                <Area
                  type="monotone"
                  dataKey="irradiância"
                  stroke="#f59e0b"
                  fill="url(#gradSolar)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-600 text-sm text-center py-8">
            Selecione um mês acima para ver a curva horária.
          </p>
        )}
      </div>

    </div>
  )
}

export default SolarProfile
