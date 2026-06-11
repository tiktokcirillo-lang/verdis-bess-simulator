import { useForm } from 'react-hook-form'
import useSimulatorStore from '../../store/useSimulatorStore'

function Loads() {
  const { loads, setLoads, setStep } = useSimulatorStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: loads,
  })

  const peakKw = watch('peakKw')
  const avgKw = watch('avgKw')

  // Alerta se média > pico
  const avgExceedsPeak = parseFloat(avgKw) > parseFloat(peakKw) && parseFloat(peakKw) > 0

  function onSubmit(data) {
    setLoads({
      peakKw: parseFloat(data.peakKw),
      avgKw: parseFloat(data.avgKw),
      monthlyKwh: parseFloat(data.monthlyKwh),
      tariffOffPeak: parseFloat(data.tariffOffPeak),
      tariffPeak: parseFloat(data.tariffPeak),
      tariffDemand: parseFloat(data.tariffDemand),
    })
    setStep(3)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Configuração de Cargas</h2>
        <p className="text-gray-400 mt-1 text-sm">Perfil de consumo e tarifas da unidade consumidora.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Demanda de ponta */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
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
          {errors.peakKw && <p className="text-red-400 text-xs mt-1">{errors.peakKw.message}</p>}
        </div>

        {/* Demanda média */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
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
          {errors.avgKw && <p className="text-red-400 text-xs mt-1">{errors.avgKw.message}</p>}
          {avgExceedsPeak && (
            <p className="text-yellow-400 text-xs mt-1">⚠ Demanda média não pode superar a demanda de ponta.</p>
          )}
        </div>

        {/* Consumo mensal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
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
          {errors.monthlyKwh && <p className="text-red-400 text-xs mt-1">{errors.monthlyKwh.message}</p>}
        </div>

        {/* Tarifas */}
        <div className="border-t border-gray-800 pt-5">
          <p className="text-sm font-medium text-gray-300 mb-4">Tarifas vigentes</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fora-ponta (R$/kWh)</label>
              <input
                {...register('tariffOffPeak', { required: true, min: 0.01 })}
                type="number" step="0.01" min="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ponta (R$/kWh)</label>
              <input
                {...register('tariffPeak', { required: true, min: 0.01 })}
                type="number" step="0.01" min="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Demanda (R$/kW)</label>
              <input
                {...register('tariffDemand', { required: true, min: 0 })}
                type="number" step="0.01" min="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

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
            className="flex-2 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
          >
            Próximo — Equipamento →
          </button>
        </div>
      </form>
    </div>
  )
}

export default Loads
