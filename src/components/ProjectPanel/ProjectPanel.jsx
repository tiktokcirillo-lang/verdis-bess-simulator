import { useForm } from 'react-hook-form'
import useSimulatorStore from '../../store/useSimulatorStore'

const SEGMENTS = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'outro', label: 'Outro' },
]

function ProjectPanel() {
  const { project, setProject, setStep } = useSimulatorStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: project,
  })

  function onSubmit(data) {
    setProject({
      ...data,
      installedSolarKwp: parseFloat(data.installedSolarKwp) || 0,
    })
    setStep(2)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dados do Projeto</h2>
        <p className="text-gray-400 mt-1 text-sm">Informações gerais do cliente e local de instalação.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Nome do cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome do cliente
          </label>
          <input
            {...register('clientName', { required: 'Campo obrigatório' })}
            placeholder="Ex: Indústria Alfa Ltda."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {errors.clientName && (
            <p className="text-red-400 text-xs mt-1">{errors.clientName.message}</p>
          )}
        </div>

        {/* Localização */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Localização
          </label>
          <input
            {...register('location', { required: 'Campo obrigatório' })}
            placeholder="Ex: São Paulo, SP"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {errors.location && (
            <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>
          )}
        </div>

        {/* Segmento */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Segmento
          </label>
          <select
            {...register('segment', { required: 'Campo obrigatório' })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="">Selecione...</option>
            {SEGMENTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.segment && (
            <p className="text-red-400 text-xs mt-1">{errors.segment.message}</p>
          )}
        </div>

        {/* Solar instalado */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Potência solar instalada (kWp) <span className="text-gray-500 font-normal">— opcional</span>
          </label>
          <input
            {...register('installedSolarKwp')}
            type="number"
            min="0"
            step="0.1"
            placeholder="Ex: 120"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition mt-2"
        >
          Próximo — Cargas →
        </button>
      </form>
    </div>
  )
}

export default ProjectPanel
