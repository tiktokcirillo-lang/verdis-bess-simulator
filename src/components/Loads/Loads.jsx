import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import useSimulatorStore from '../../store/useSimulatorStore'
import { BRAZILIAN_STATES } from '../../data/brazilianStates'
import { getUtilitiesByState, getTariffByUtility } from '../../data/utilities'

function AutoBadge() {
  return (
    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-emerald-900/60 text-emerald-400 border border-emerald-800/50">
      auto
    </span>
  )
}

function Loads() {
  const { loads, setLoads, setStep } = useSimulatorStore()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: loads,
  })

  const peakKw  = watch('peakKw')
  const avgKw   = watch('avgKw')
  const state   = watch('state')
  const utility = watch('utility')
  const avgExceedsPeak = parseFloat(avgKw) > parseFloat(peakKw) && parseFloat(peakKw) > 0

  const utilities = state ? getUtilitiesByState(state) : []

  useEffect(() => {
    setValue('utility', '')
    setValue('tariffOffPeak', 0.75)
    setValue('tariffPeak', 1.45)
    setValue('tariffDemand', 35.00)
  }, [state, setValue])

  useEffect(() => {
    if (!utility) return
    const tariff = getTariffByUtility(utility)
    setValue('tariffOffPeak', tariff.offPeak)
    setValue('tariffPeak', tariff.peak)
    setValue('tariffDemand', tariff.demand)
  }, [utility, setValue])

  const hasUtility = !!utility

  function onSubmit(data) {
    setLoads({
      peakKw:        parseFloat(data.peakKw),
      avgKw:         parseFloat(data.avgKw),
      monthlyKwh:    parseFloat(data.monthlyKwh),
      tariffOffPeak: parseFloat(data.tariffOffPeak),
      tariffPeak:    parseFloat(data.tariffPeak),
      tariffDemand:  parseFloat(data.tariffDemand),
      state:         data.state,
      utility:       data.utility,
    })
    setStep(3)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Configuração de Cargas</h2>
        <p className="text-gray-400 mt-1 text-sm">
          Perfil de consumo, localização e tarifas da unidade consumidora.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Localização ── */}
        <div className="border-b border-gray-800 pb-5">
          <p className="text-sm font-medium text-gray-300 mb-4">Localização</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <select
                {...register('state')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition appearance-none"
              >
                <option value="">Selecione...</option>
                {BRAZILIAN_STATES.map(s => (
                  <option key={s.sigla} value={s.sigla}>{s.sigla} — {s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Distribuidora
                {hasUtility && <AutoBadge />}
              </label>
              <select
                {...register('utility')}
                disabled={!state || utilities.length === 0}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">
                  {state ? 'Selecione...' : 'Selecione o estado primeiro'}
                </option>
                {utilities.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {hasUtility && (
            <p className="text-xs text-emerald-500 mt-2">
              Tarifas sugeridas automaticamente com base na distribuidora. Ajuste se necessário.
            </p>
          )}
        </div>

        {/* ── Demanda ── */}
        <div className="border-b border-gray-800 pb-5">
          <p className="text-sm font-medium text-gray-300 mb-4">Perfil de Demanda</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Demanda de ponta (kW)
              </label>
              <input
                {...register('peakKw', {
                  required: 'Campo obrigatório',
                  min: { value: 1, message: 'Mínimo 1 kW' },
                })}
                type="number" min="1" step="0.1"
                placeholder="Ex: 200"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {errors.peakKw && (
                <p className="text-red-400 text-xs mt-1">{errors.peakKw.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Demanda média (kW)
              </label>
              <input
                {...register('avgKw', {
                  required: 'Campo obrigatório',
                  min: { value: 1, message: 'Mínimo 1 kW' },
                })}
                type="number" min="1" step="0.1"
                placeholder="Ex: 130"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {errors.avgKw && (
                <p className="text-red-400 text-xs mt-1">{errors.avgKw.message}</p>
              )}
              {avgExceedsPeak && (
                <p className="text-yellow-400 text-xs mt-1">
                  ⚠ Demanda média não pode superar a demanda de ponta.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Consumo mensal (kWh)
              </label>
              <input
                {...register('monthlyKwh', {
                  required: 'Campo obrigatório',
                  min: { value: 100, message: 'Mínimo 100 kWh' },
                })}
                type="number" min="100" step="10"
                placeholder="Ex: 45000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {errors.monthlyKwh && (
                <p className="text-red-400 text-xs mt-1">{errors.monthlyKwh.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tarifas ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-300">Tarifas vigentes</p>
            {hasUtility && (
              <span className="text-xs text-gray-500">Fonte: {utility}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Fora-ponta (R$/kWh)
                {hasUtility && <AutoBadge />}
              </label>
              <input
                {...register('tariffOffPeak', { required: true, min: 0.01 })}
                type="number" step="0.01" min="0.01"
                className={`
                  w-full bg-gray-800 rounded-lg px-3 py-2 text-white text-sm
                  focus:outline-none transition border
                  ${hasUtility
                    ? 'border-emerald-800/60 focus:border-emerald-500'
                    : 'border-gray-700 focus:border-emerald-500'
                  }
                `}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Ponta (R$/kWh)
                {hasUtility && <AutoBadge />}
              </label>
              <input
                {...register('tariffPeak', { required: true, min: 0.01 })}
                type="number" step="0.01" min="0.01"
                className={`
                  w-full bg-gray-800 rounded-lg px-3 py-2 text-white text-sm
                  focus:outline-none transition border
                  ${hasUtility
                    ? 'border-emerald-800/60 focus:border-emerald-500'
                    : 'border-gray-700 focus:border-emerald-500'
                  }
                `}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Demanda (R$/kW)
                {hasUtility && <AutoBadge />}
              </label>
              <input
                {...register('tariffDemand', { required: true, min: 0 })}
                type="number" step="0.01" min="0"
                className={`
                  w-full bg-gray-800 rounded-lg px-3 py-2 text-white text-sm
                  focus:outline-none transition border
                  ${hasUtility
                    ? 'border-emerald-800/60 focus:border-emerald-500'
                    : 'border-gray-700 focus:border-emerald-500'
                  }
                `}
              />
            </div>
          </div>

          {!hasUtility && (
            <p className="text-xs text-gray-600 mt-2">
              Selecione a distribuidora acima para sugestão automática de tarifas.
            </p>
          )}
        </div>

        {/* ── Ações ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition"
          >
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={avgExceedsPeak}
            className="flex-[2] w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
          >
            Próximo — Equipamento →
          </button>
        </div>
      </form>
    </div>
  )
}

export default Loads
