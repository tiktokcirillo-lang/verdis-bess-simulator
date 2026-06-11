import useSimulatorStore from '../../store/useSimulatorStore'

const STEPS = [
  { id: 1, label: 'Projeto' },
  { id: 2, label: 'Cargas' },
  { id: 3, label: 'Equipamento' },
  { id: 4, label: 'Cenários' },
  { id: 5, label: 'Resultado' },
]

function Header() {
  const { currentStep, setStep, results } = useSimulatorStore()

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Verdis <span className="text-emerald-400">BESS</span>
          </span>
        </div>

        {/* Steps */}
        <nav className="flex items-center gap-1">
          {STEPS.map((step, i) => {
            const isActive = step.id === currentStep
            const isDone = step.id < currentStep
            const isClickable = step.id < currentStep || (step.id === 5 && results)

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isClickable && setStep(step.id)}
                  disabled={!isClickable && !isActive}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${isActive ? 'bg-emerald-500 text-white' : ''}
                    ${isDone ? 'text-emerald-400 hover:bg-gray-800 cursor-pointer' : ''}
                    ${!isActive && !isDone ? 'text-gray-500 cursor-default' : ''}
                  `}
                >
                  <span className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs
                    ${isActive ? 'bg-emerald-600' : ''}
                    ${isDone ? 'bg-emerald-900 text-emerald-400' : ''}
                    ${!isActive && !isDone ? 'bg-gray-800 text-gray-600' : ''}
                  `}>
                    {isDone ? '✓' : step.id}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>

                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px mx-1 ${isDone ? 'bg-emerald-700' : 'bg-gray-800'}`} />
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Header
