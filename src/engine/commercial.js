// Motor comercial — cálculo de economia tarifária mensal e anual

import { TARIFF_DEFAULTS } from '../data/database.js'

/**
 * Calcula a economia mensal com o BESS com base na simulação diária.
 * [CONFIG] Assume 22 dias úteis/mês para demanda e 30 dias para energia.
 */
export function calcMonthlySavings(hourlyResult, tariff = TARIFF_DEFAULTS) {
  const { offPeak, peak, demand, peakHours } = tariff

  let energySavingsMonthly = 0

  for (const h of hourlyResult) {
    const rate = peakHours.includes(h.hour) ? peak : offPeak
    const savedKwh = h.bessKw > 0 ? h.bessKw : 0
    energySavingsMonthly += savedKwh * rate * 30 // 30 dias
  }

  // Redução de demanda contratada (kW ponta)
  const peakLoads = hourlyResult.filter(h => h.isPeak)
  const demandWithout = Math.max(...peakLoads.map(h => h.loadKw))
  const demandWith = Math.max(...peakLoads.map(h => h.gridKw))
  const demandReductionKw = Math.max(0, demandWithout - demandWith)
  const demandSavingsMonthly = demandReductionKw * demand

  const totalMonthly = energySavingsMonthly + demandSavingsMonthly

  return {
    energySavingsMonthly: parseFloat(energySavingsMonthly.toFixed(2)),
    demandSavingsMonthly: parseFloat(demandSavingsMonthly.toFixed(2)),
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalAnnual: parseFloat((totalMonthly * 12).toFixed(2)),
  }
}
