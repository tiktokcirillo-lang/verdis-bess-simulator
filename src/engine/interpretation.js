// Motor de interpretação — classifica e recomenda com base nos resultados financeiros
import { getIrradiationByState } from '../data/irradiation.js'

/**
 * Classifica a viabilidade do projeto em 4 níveis.
 * [CONFIG] Thresholds ajustáveis conforme critério de aprovação da Verdis.
 */
export function classifyProject(irr, simplePayback) {
  if (irr >= 20 && simplePayback <= 5) {
    return { label: 'Excelente', color: 'emerald', description: 'Projeto altamente viável. Recomendação forte de implementação.' }
  } else if (irr >= 12 && simplePayback <= 8) {
    return { label: 'Bom', color: 'green', description: 'Projeto viável com retorno sólido.' }
  } else if (irr >= 6 && simplePayback <= 12) {
    return { label: 'Marginal', color: 'yellow', description: 'Projeto viável com ressalvas. Avaliar condições de financiamento.' }
  } else {
    return { label: 'Inviável', color: 'red', description: 'Projeto não atinge retorno mínimo aceitável nas condições simuladas.' }
  }
}

/**
 * Gera alertas contextuais com base nos parâmetros de entrada.
 */
export function generateAlerts(inputs, results) {
  const alerts = []

  if (inputs.peakKw < 30) {
    alerts.push({ type: 'warning', message: 'Demanda de ponta abaixo de 30 kW — benefício tarifário de demanda pode ser limitado.' })
  }

  if (results.reductionPct < 20) {
    alerts.push({ type: 'info', message: 'Redução de ponta abaixo de 20% — considere um BESS de maior capacidade.' })
  }

  if (results.irr < 0) {
    alerts.push({ type: 'error', message: 'TIR negativa — o projeto não recupera o investimento no horizonte analisado.' })
  }

  if (results.simplePayback === '>horizonte') {
    alerts.push({ type: 'error', message: 'Payback excede o horizonte de análise de ' + results.analysisYears + ' anos.' })
  }

  // Alerta contextual de irradiação (quando estado disponível)
  if (inputs.state) {
    const irrad = getIrradiationByState(inputs.state)
    if (irrad >= 5.5) {
      alerts.push({
        type: 'info',
        message: `${inputs.state} tem irradiação de ${irrad} kWh/m²/dia — excelente potencial para solar+BESS.`,
      })
    } else if (irrad < 4.5) {
      alerts.push({
        type: 'warning',
        message: `${inputs.state} tem irradiação abaixo da média (${irrad} kWh/m²/dia) — avaliar viabilidade solar antes de dimensionar o BESS.`,
      })
    }
  }

  return alerts
}
