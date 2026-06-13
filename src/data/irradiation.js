// Irradiação solar média diária por estado (kWh/m²/dia)
// [CONFIG] Fonte: INPE Atlas Solarimétrico do Brasil
// Valores médios anuais — usar para cálculo de geração integrada solar+BESS

export const IRRADIATION_BY_STATE = {
  AC: 4.50, AL: 5.20, AP: 4.20, AM: 4.10,
  BA: 5.70, CE: 6.10, DF: 5.30, ES: 5.35,
  GO: 5.50, MA: 5.10, MT: 5.75, MS: 5.50,
  MG: 5.20, PA: 4.40, PB: 5.35, PR: 4.85,
  PE: 5.45, PI: 5.80, RJ: 5.10, RN: 5.75,
  RS: 4.60, RO: 4.65, RR: 4.20, SC: 4.70,
  SE: 5.50, SP: 4.85, TO: 5.60,
}

// Irradiação mensal relativa por estado (fator multiplicador sobre a média anual)
// Permite estimar variação sazonal sem banco de dados completo
// [CONFIG] Perfis baseados em latitude média de cada estado
export const MONTHLY_PROFILE_BY_REGION = {
  // Norte (próximo ao equador — variação pequena)
  norte: [1.0, 0.95, 0.90, 0.88, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.05, 1.02],
  // Nordeste (alta irradiação, variação moderada)
  nordeste: [1.05, 1.02, 0.95, 0.90, 0.88, 0.90, 0.92, 0.98, 1.05, 1.10, 1.10, 1.05],
  // Centro-Oeste (variação sazonal média)
  centroOeste: [0.95, 0.92, 0.95, 1.00, 1.05, 1.10, 1.12, 1.15, 1.10, 1.00, 0.90, 0.88],
  // Sudeste (variação média)
  sudeste: [0.95, 0.90, 0.92, 0.98, 1.05, 1.10, 1.12, 1.10, 1.05, 1.00, 0.92, 0.90],
  // Sul (maior variação sazonal)
  sul: [1.05, 1.00, 0.95, 0.90, 0.82, 0.80, 0.82, 0.88, 0.95, 1.02, 1.05, 1.08],
}

// Mapeamento de estado para região climática
export const STATE_REGION = {
  AC: 'norte',  AM: 'norte',  AP: 'norte',  PA: 'norte',
  RO: 'norte',  RR: 'norte',  TO: 'norte',
  AL: 'nordeste', BA: 'nordeste', CE: 'nordeste', MA: 'nordeste',
  PB: 'nordeste', PE: 'nordeste', PI: 'nordeste', RN: 'nordeste',
  SE: 'nordeste',
  DF: 'centroOeste', GO: 'centroOeste', MT: 'centroOeste', MS: 'centroOeste',
  ES: 'sudeste', MG: 'sudeste', RJ: 'sudeste', SP: 'sudeste',
  PR: 'sul', RS: 'sul', SC: 'sul',
}

export const MONTH_NAMES_PT = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
]

/**
 * Retorna irradiação média anual para um estado.
 */
export function getIrradiationByState(stateSigla) {
  return IRRADIATION_BY_STATE[stateSigla] || 5.0
}

/**
 * Retorna perfil mensal de irradiação para um estado (12 valores em kWh/m²/dia).
 */
export function getMonthlyIrradiation(stateSigla) {
  const annual = getIrradiationByState(stateSigla)
  const region = STATE_REGION[stateSigla] || 'sudeste'
  const profile = MONTHLY_PROFILE_BY_REGION[region]
  return profile.map(factor => parseFloat((annual * factor).toFixed(2)))
}
