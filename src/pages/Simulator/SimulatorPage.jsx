import Header from '../../components/Header/Header'
import ProjectPanel from '../../components/ProjectPanel/ProjectPanel'
import Loads from '../../components/Loads/Loads'
import Equipment from '../../components/Equipment/Equipment'
import Scenarios from '../../components/Scenarios/Scenarios'
import Executive from '../../components/Executive/Executive'
import PageTransition from '../../components/UI/PageTransition'
import useSimulatorStore from '../../store/useSimulatorStore'

const STEPS = {
  1: ProjectPanel,
  2: Loads,
  3: Equipment,
  4: Scenarios,
  5: Executive,
}

function SimulatorPage() {
  const { currentStep } = useSimulatorStore()
  const StepComponent = STEPS[currentStep]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Gradiente de fundo sutil */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {StepComponent && (
          <PageTransition key={currentStep}>
            <StepComponent />
          </PageTransition>
        )}
      </main>
    </div>
  )
}

export default SimulatorPage
