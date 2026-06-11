// Motor de simulação energética BESS
// Simula ciclos diários de carga/descarga com base na curva de demanda informada

import { TARIFF_DEFAULTS } from '../data/database.js'

/**
 * Gera uma curva de carga horária (24h) a partir de pico e média.
 * [CONFIG] Perfil de carga sintético — substitua por dados reais do cliente (medição) quando disponível.
 * Perfil assume: demanda baixa de 0h–6h, crescimento gradual 6h–9h,
 * plateau comercial 9h–18h, pico 18h–21h, queda 21h–23h.
 */
export function generateLoadCurve(peakKw, avgKw) {
  const ratio = avgKw / peakKw
  const profile = [
    0.30, 0.25, 0.22, 0.20, 0.20, 0.25, // 0h–5h
    0.45, 0.65, 0.80, 0.90, 0.95, 1.00, // 6h–11h
    0.98, 0.95, 0.92, 0.90, 0.88, 0.85, // 12h–17h
    1.00, 0.98, 0.95, 0.70, 0.50, 0.35, // 18h–23h (pico às 18h)
  ]
  return profile.map(p => parseFloat((p * peakKw * ratio * (1 / 0.65)).toFixed(2)))
}

/**
 * Simula um dia completo de operação do BESS.
 * Estratégia: carregar na fora-ponta, descarregar na ponta.
 * Retorna array de 24 objetos com estado a cada hora.
 */
export function simulateDay(loadCurveKw, product) {
  const { capacityKwh, powerKw, dod } = product
  const usableCapacity = capacityKwh * dod
  const { peakHours } = TARIFF_DEFAULTS

  let soc = usableCapacity * 0.20 // [CONFIG] SOC inicial: 20% da capacidade utilizável
  const hourly = []

  for (let h = 0; h < 24; h++) {
    const load = loadCurveKw[h]
    const isPeak = peakHours.includes(h)
    let bessAction = 0 // kW positivo = descarga, negativo = carga

    if (isPeak && soc > 0) {
      // Descarga na ponta — reduz a demanda da rede
      const discharge = Math.min(powerKw, soc, load)
      bessAction = discharge
      soc -= discharge
    } else if (!isPeak && soc < usableCapacity) {
      // Carga fora da ponta
      const charge = Math.min(powerKw, usableCapacity - soc)
      bessAction = -charge
      soc += charge
    }

    const gridDraw = Math.max(0, load - bessAction)

    hourly.push({
      hour: h,
      loadKw: load,
      bessKw: bessAction,
      gridKw: gridDraw,
      socKwh: parseFloat(soc.toFixed(2)),
      isPeak,
    })
  }

  return hourly
}

/**
 * Calcula a redução de demanda de ponta a partir da simulação diária.
 * Retorna o pico máximo sem BESS vs com BESS.
 */
export function calcDemandReduction(hourlyResult) {
  const peakWithout = Math.max(...hourlyResult.map(h => h.loadKw))
  const peakWith = Math.max(...hourlyResult.map(h => h.gridKw))
  return {
    peakWithoutKw: parseFloat(peakWithout.toFixed(2)),
    peakWithKw: parseFloat(peakWith.toFixed(2)),
    reductionKw: parseFloat((peakWithout - peakWith).toFixed(2)),
    reductionPct: parseFloat(((peakWithout - peakWith) / peakWithout * 100).toFixed(1)),
  }
}
