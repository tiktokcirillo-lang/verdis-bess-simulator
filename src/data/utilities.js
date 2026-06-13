// Banco de dados de distribuidoras por estado — fonte: ANEEL
// [CONFIG] Atualizar tarifas conforme reajustes anuais da ANEEL

export const UTILITIES_BY_STATE = {
  AC: ['Energisa Acre', 'Eletroacre'],
  AL: ['Energisa Alagoas', 'Eletrobrás Distribuição Alagoas'],
  AP: ['Energisa Amapá', 'CEA'],
  AM: ['Amazonas Energia'],
  BA: ['Coelba (Neoenergia)', 'Energisa Bahia'],
  CE: ['Enel Ceará', 'Energisa Ceará'],
  DF: ['Neoenergia Brasília', 'CEB'],
  ES: ['Energisa Espírito Santo', 'EDP Espírito Santo'],
  GO: ['Energisa Goiás'],
  MA: ['Energisa Maranhão', 'Equatorial Maranhão'],
  MT: ['Energisa Mato Grosso'],
  MS: ['Energisa Mato Grosso do Sul'],
  MG: ['CEMIG', 'Energisa Minas Gerais', 'EDP Minas Gerais'],
  PA: ['Equatorial Pará', 'Energisa Pará'],
  PB: ['Energisa Paraíba'],
  PR: ['Copel', 'Energisa Paraná'],
  PE: ['Neoenergia Pernambuco', 'Energisa Pernambuco'],
  PI: ['Energisa Piauí', 'Equatorial Piauí'],
  RJ: ['Enel Rio de Janeiro', 'Light'],
  RN: ['Energisa Rio Grande do Norte', 'Cosern'],
  RS: ['CEEE Equatorial', 'RGE Sul', 'Energisa Rio Grande do Sul'],
  RO: ['Energisa Rondônia'],
  RR: ['Energisa Roraima'],
  SC: ['Celesc', 'Energisa Santa Catarina'],
  SP: ['Enel São Paulo', 'CPFL Paulista', 'CPFL Piratininga', 'Elektro', 'EDP São Paulo'],
  SE: ['Energisa Sergipe'],
  TO: ['Energisa Tocantins'],
}

// [CONFIG] Tarifas médias por distribuidora (R$/kWh) — referência abr/2026
// Grupo B (baixa tensão, residencial/comercial pequeno)
export const UTILITY_TARIFFS = {
  // São Paulo
  'Enel São Paulo':      { offPeak: 0.88, peak: 1.62, demand: 0 },
  'CPFL Paulista':       { offPeak: 0.89, peak: 1.65, demand: 38 },
  'CPFL Piratininga':    { offPeak: 0.92, peak: 1.70, demand: 40 },
  'Elektro':             { offPeak: 0.85, peak: 1.58, demand: 36 },
  'EDP São Paulo':       { offPeak: 0.87, peak: 1.61, demand: 37 },
  // Minas Gerais
  'CEMIG':               { offPeak: 0.82, peak: 1.52, demand: 34 },
  'EDP Minas Gerais':    { offPeak: 0.84, peak: 1.55, demand: 35 },
  'Energisa Minas Gerais': { offPeak: 0.83, peak: 1.54, demand: 35 },
  // Rio de Janeiro
  'Enel Rio de Janeiro': { offPeak: 0.90, peak: 1.68, demand: 39 },
  'Light':               { offPeak: 0.95, peak: 1.75, demand: 42 },
  // Paraná
  'Copel':               { offPeak: 0.84, peak: 1.56, demand: 35 },
  'Energisa Paraná':     { offPeak: 0.86, peak: 1.59, demand: 36 },
  // Santa Catarina
  'Celesc':              { offPeak: 0.87, peak: 1.61, demand: 37 },
  'Energisa Santa Catarina': { offPeak: 0.86, peak: 1.59, demand: 36 },
  // Rio Grande do Sul
  'CEEE Equatorial':     { offPeak: 0.86, peak: 1.59, demand: 36 },
  'RGE Sul':             { offPeak: 0.88, peak: 1.62, demand: 37 },
  'Energisa Rio Grande do Sul': { offPeak: 0.87, peak: 1.60, demand: 36 },
  // Bahia
  'Coelba (Neoenergia)': { offPeak: 0.80, peak: 1.48, demand: 33 },
  'Energisa Bahia':      { offPeak: 0.81, peak: 1.50, demand: 33 },
  // Ceará
  'Enel Ceará':          { offPeak: 0.78, peak: 1.44, demand: 32 },
  'Energisa Ceará':      { offPeak: 0.79, peak: 1.46, demand: 32 },
  // Pernambuco
  'Neoenergia Pernambuco': { offPeak: 0.81, peak: 1.50, demand: 33 },
  'Energisa Pernambuco': { offPeak: 0.80, peak: 1.48, demand: 32 },
  // Goiás
  'Energisa Goiás':      { offPeak: 0.79, peak: 1.46, demand: 32 },
  // Mato Grosso
  'Energisa Mato Grosso': { offPeak: 0.83, peak: 1.54, demand: 35 },
  // Mato Grosso do Sul
  'Energisa Mato Grosso do Sul': { offPeak: 0.82, peak: 1.52, demand: 34 },
  // Distrito Federal
  'Neoenergia Brasília': { offPeak: 0.81, peak: 1.50, demand: 33 },
  'CEB':                 { offPeak: 0.81, peak: 1.50, demand: 33 },
  // Espírito Santo
  'Energisa Espírito Santo': { offPeak: 0.83, peak: 1.54, demand: 35 },
  'EDP Espírito Santo':  { offPeak: 0.84, peak: 1.55, demand: 35 },
  // Maranhão
  'Energisa Maranhão':   { offPeak: 0.77, peak: 1.42, demand: 31 },
  'Equatorial Maranhão': { offPeak: 0.76, peak: 1.40, demand: 31 },
  // Pará
  'Equatorial Pará':     { offPeak: 0.78, peak: 1.44, demand: 32 },
  'Energisa Pará':       { offPeak: 0.79, peak: 1.46, demand: 32 },
  // Piauí
  'Energisa Piauí':      { offPeak: 0.77, peak: 1.42, demand: 31 },
  'Equatorial Piauí':    { offPeak: 0.76, peak: 1.40, demand: 31 },
  // Rio Grande do Norte
  'Energisa Rio Grande do Norte': { offPeak: 0.80, peak: 1.48, demand: 32 },
  'Cosern':              { offPeak: 0.79, peak: 1.46, demand: 32 },
  // Paraíba
  'Energisa Paraíba':    { offPeak: 0.80, peak: 1.48, demand: 32 },
  // Sergipe
  'Energisa Sergipe':    { offPeak: 0.80, peak: 1.48, demand: 32 },
  // Alagoas
  'Energisa Alagoas':    { offPeak: 0.79, peak: 1.46, demand: 31 },
  'Eletrobrás Distribuição Alagoas': { offPeak: 0.78, peak: 1.44, demand: 31 },
  // Amazonas
  'Amazonas Energia':    { offPeak: 0.76, peak: 1.40, demand: 30 },
  // Rondônia
  'Energisa Rondônia':   { offPeak: 0.78, peak: 1.44, demand: 31 },
  // Roraima
  'Energisa Roraima':    { offPeak: 0.75, peak: 1.38, demand: 30 },
  // Tocantins
  'Energisa Tocantins':  { offPeak: 0.79, peak: 1.46, demand: 32 },
  // Acre
  'Energisa Acre':       { offPeak: 0.76, peak: 1.40, demand: 30 },
  'Eletroacre':          { offPeak: 0.75, peak: 1.38, demand: 30 },
  // Amapá
  'Energisa Amapá':      { offPeak: 0.77, peak: 1.42, demand: 31 },
  'CEA':                 { offPeak: 0.76, peak: 1.40, demand: 31 },
}

// [CONFIG] Tarifa padrão quando distribuidora não está mapeada
export const TARIFF_FALLBACK = { offPeak: 0.82, peak: 1.52, demand: 34 }

export function getUtilitiesByState(stateSigla) {
  return UTILITIES_BY_STATE[stateSigla] || []
}

export function getTariffByUtility(utilityName) {
  return UTILITY_TARIFFS[utilityName] || TARIFF_FALLBACK
}

export function getAllStates() {
  return Object.keys(UTILITIES_BY_STATE).sort()
}
