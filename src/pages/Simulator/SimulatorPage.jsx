import Header from '../../components/Header/Header'
import ProjectPanel from '../../components/ProjectPanel/ProjectPanel'
import Loads from '../../components/Loads/Loads'
import Equipment from '../../components/Equipment/Equipment'
import Executive from '../../components/Executive/Executive'
import useSimulatorStore from '../../store/useSimulatorStore'

function SimulatorPage() {
  const { currentStep } = useSimulatorStore()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        {currentStep === 1 && <ProjectPanel />}
        {currentStep === 2 && <Loads />}
        {currentStep === 3 && <Equipment />}
        {currentStep === 5 && <Executive />}
      </main>
    </div>
  )
}

export default SimulatorPage
