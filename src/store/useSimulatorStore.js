import { create } from 'zustand'

// Store central — todo o estado do simulador vive aqui
const useSimulatorStore = create((set, get) => ({

  // --- Dados do projeto ---
  project: {
    clientName: '',
    location: '',
    segment: '', // [CONFIG] segmentos: industrial, comercial, agro, outro
    installedSolarKwp: 0,
  },

  // --- Parâmetros de carga ---
  loads: {
    peakKw: 0,
    avgKw: 0,
    monthlyKwh: 0,
    tariffOffPeak: 0.75,   // [CONFIG] padrão TARIFF_DEFAULTS
    tariffPeak: 1.45,
    tariffDemand: 35.00,
  },

  // --- Produto BESS selecionado ---
  selectedProduct: null,

  // --- Resultados da simulação atual ---
  results: null,

  // --- Cenários salvos (máx 3) ---
  scenarios: [],

  // --- Step do fluxo (1 a 5) ---
  currentStep: 1,

  // --- Actions ---
  setProject: (data) => set((state) => ({
    project: { ...state.project, ...data }
  })),

  setLoads: (data) => set((state) => ({
    loads: { ...state.loads, ...data }
  })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  setResults: (results) => set({ results }),

  setStep: (step) => set({ currentStep: step }),

  saveScenario: (label) => {
    const { selectedProduct, loads, results, scenarios } = get()
    if (!results || scenarios.length >= 3) return // [CONFIG] limite de 3 cenários

    const scenario = {
      id: Date.now(),
      label,
      product: selectedProduct,
      loads,
      results,
      financingSnapshot: {
        entradaPct: 20,
        prazo: 48,
      },
      createdAt: new Date().toISOString(),
    }

    set({ scenarios: [...scenarios, scenario] })
  },

  removeScenario: (id) => set((state) => ({
    scenarios: state.scenarios.filter(s => s.id !== id)
  })),

  resetSimulation: () => set({
    results: null,
    selectedProduct: null,
    currentStep: 1,
  }),
}))

export default useSimulatorStore
