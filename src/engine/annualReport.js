import { getMonthlyIrradiation, MONTH_NAMES_PT } from '../data/irradiation.js'
import { generateAnnualSolarProfile } from './solarPosition.js'
import { FINANCIAL_DEFAULTS } from '../data/database.js'

export function generateAnnualReport(stateSigla, product, savings, capex) {
  const monthlyIrrad  = getMonthlyIrradiation(stateSigla || 'SP')
  const solarProfile  = generateAnnualSolarProfile(stateSigla || 'SP')
  const avgAnnual     = parseFloat((monthlyIrrad.reduce((a, b) => a + b, 0) / 12).toFixed(2))

  // Performance ratio padrão para BESS em ciclo diário
  const PR = 0.88

  const monthlyData = MONTH_NAMES_PT.map((monthName, i) => {
    const irradFactor    = monthlyIrrad[i] / avgAnnual
    const solarProfile_i = solarProfile[i]

    const cycleEfficiency = 0.85 + (irradFactor - 1) * 0.05
    const clampedEff = Math.max(0.75, Math.min(0.95, cycleEfficiency))

    const economiaMes = parseFloat((savings.totalMonthly * clampedEff).toFixed(2))

    const energyShiftedKwh = parseFloat(
      (product.capacityKwh * product.dod * PR * 30 * clampedEff).toFixed(0)
    )

    // Fator da rede elétrica brasileira: 0.0817 tCO₂/MWh (ONS 2024)
    const co2EvitadoKg = parseFloat((energyShiftedKwh * 0.0817).toFixed(1))

    return {
      month:           i + 1,
      monthName,
      irradiance:      monthlyIrrad[i],
      irradFactor:     parseFloat(irradFactor.toFixed(3)),
      cycleEfficiency: parseFloat(clampedEff.toFixed(3)),
      economiaMes,
      energyShiftedKwh,
      co2EvitadoKg,
      sunriseH:        solarProfile_i.sunriseH,
      sunsetH:         solarProfile_i.sunsetH,
      daylightH:       solarProfile_i.daylightH,
      peakIrradiance:  solarProfile_i.peakIrradiance,
    }
  })

  const totalEconomiaAnual  = parseFloat(monthlyData.reduce((a, m) => a + m.economiaMes, 0).toFixed(2))
  const totalEnergyShifted  = monthlyData.reduce((a, m) => a + m.energyShiftedKwh, 0)
  const totalCO2Evitado     = parseFloat(monthlyData.reduce((a, m) => a + m.co2EvitadoKg, 0).toFixed(1))
  const melhorMes           = monthlyData.reduce((a, b) => a.economiaMes > b.economiaMes ? a : b)
  const piorMes             = monthlyData.reduce((a, b) => a.economiaMes < b.economiaMes ? a : b)
  const variacaoSazonal     = parseFloat(((melhorMes.economiaMes - piorMes.economiaMes) / savings.totalMonthly * 100).toFixed(1))

  const projectionYears = Array.from({ length: FINANCIAL_DEFAULTS.analysisYears }, (_, y) => {
    const year     = y + 1
    const inflated = totalEconomiaAnual * Math.pow(1 + FINANCIAL_DEFAULTS.inflationRate, y)
    return {
      year,
      economiaAnual: parseFloat(inflated.toFixed(2)),
      economiaAcum:  0,
    }
  })

  let acum = -capex.totalBRL
  projectionYears.forEach(row => {
    acum += row.economiaAnual
    row.economiaAcum = parseFloat(acum.toFixed(2))
  })

  return {
    stateSigla,
    avgAnnualIrradiation: avgAnnual,
    monthlyData,
    totalEconomiaAnual,
    totalEnergyShifted,
    totalCO2Evitado,
    melhorMes: melhorMes.monthName,
    piorMes:   piorMes.monthName,
    variacaoSazonal,
    projectionYears,
    equivalencias: {
      arvoresPlantadas: Math.round(totalCO2Evitado / 21.77),
      kmNaoRodados:     Math.round(totalCO2Evitado / 0.21),
      casasMes:         parseFloat((totalEnergyShifted / 156).toFixed(1)),
    },
  }
}
