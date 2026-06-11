// Gerenciador de cenários — permite salvar e comparar até 3 simulações

/**
 * Cria um objeto de cenário padronizado.
 */
export function createScenario(id, label, inputs, results) {
  return {
    id,
    label,
    createdAt: new Date().toISOString(),
    inputs,
    results,
  }
}

/**
 * Compara dois cenários e retorna as diferenças percentuais nos KPIs principais.
 */
export function compareScenarios(scenarioA, scenarioB) {
  const diff = (a, b) => b !== 0 ? parseFloat(((a - b) / Math.abs(b) * 100).toFixed(1)) : 0

  return {
    irrDiff: diff(scenarioA.results.irr, scenarioB.results.irr),
    npvDiff: diff(scenarioA.results.npv, scenarioB.results.npv),
    paybackDiff: diff(scenarioA.results.simplePayback, scenarioB.results.simplePayback),
    savingsDiff: diff(scenarioA.results.totalAnnual, scenarioB.results.totalAnnual),
  }
}
