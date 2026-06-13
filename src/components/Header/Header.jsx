import useSimulatorStore from '../../store/useSimulatorStore'
import ProgressBar from '../UI/ProgressBar'

const STEPS = [
  { id: 1, label: 'Projeto' },
  { id: 2, label: 'Cargas' },
  { id: 3, label: 'Equipamento' },
  { id: 4, label: 'Cenários' },
  { id: 5, label: 'Resultado' },
]

function Header() {
  const { currentStep, setStep, results, resetSimulation } = useSimulatorStore()

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 sm:px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => resetSimulation()}
            className="flex items-center gap-2 group"
            title="Reiniciar simulação"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-base tracking-tight">
                Verdis <span className="text-emerald-400">BESS</span>
              </span>
              <p className="text-gray-600 text-xs leading-none">Simulator</p>
            </div>
          </button>

          {/* Steps */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {STEPS.map((step, i) => {
              const isActive = step.id === currentStep
              const isDone = step.id < currentStep
              const isClickable = isDone || (step.id === 4) || (step.id === 5 && results)

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => isClickable && setStep(step.id)}
                    disabled={!isClickable && !isActive}
                    title={step.label}
                    className={`
                      flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all
                      ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : ''}
                      ${isDone ? 'text-emerald-400 hover:bg-gray-800 cursor-pointer' : ''}
                      ${!isActive && !isDone ? 'text-gray-600 cursor-default' : ''}
                    `}
                  >
                    <span className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0
                      ${isActive ? 'bg-emerald-600 text-white' : ''}
                      ${isDone ? 'bg-emerald-900 text-emerald-400' : ''}
                      ${!isActive && !isDone ? 'bg-gray-800 text-gray-600' : ''}
                    `}>
                      {isDone ? '✓' : step.id}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>

                  {i < STEPS.length - 1 && (
                    <div className={`w-3 h-px mx-0.5 flex-shrink-0 ${isDone ? 'bg-emerald-800' : 'bg-gray-800'}`} />
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Barra de progresso */}
        <ProgressBar current={currentStep} total={STEPS.length} />
      </div>
    </header>
  )
}

export default Header
