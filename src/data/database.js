// [CONFIG] Banco de dados de referência — equipamentos e tarifas padrão
// Substitua os produtos por catálogo real do fornecedor quando disponível

export const BESS_PRODUCTS = [
  { id: 'bess-30', label: 'BESS 30 kWh / 15 kW', capacityKwh: 30, powerKw: 15, priceUSD: 18000, chemistry: 'LFP', cycleLife: 6000, dod: 0.90 },
  { id: 'bess-60', label: 'BESS 60 kWh / 30 kW', capacityKwh: 60, powerKw: 30, priceUSD: 34000, chemistry: 'LFP', cycleLife: 6000, dod: 0.90 },
  { id: 'bess-100', label: 'BESS 100 kWh / 50 kW', capacityKwh: 100, powerKw: 50, priceUSD: 55000, chemistry: 'LFP', cycleLife: 6000, dod: 0.90 },
  { id: 'bess-200', label: 'BESS 200 kWh / 100 kW', capacityKwh: 200, powerKw: 100, priceUSD: 100000, chemistry: 'LFP', cycleLife: 6000, dod: 0.90 },
]

// [CONFIG] Tarifa padrão — modelo ANEEL grupo B (baixa tensão) com ponta/fora-ponta
// Valores em R$/kWh. Atualizar conforme distribuidora e modalidade tarifária do cliente.
export const TARIFF_DEFAULTS = {
  offPeak: 0.75,   // fora-ponta (R$/kWh)
  peak: 1.45,      // ponta — 18h às 21h (R$/kWh)
  demand: 35.00,   // demanda contratada (R$/kW/mês) — grupo A
  peakHours: [18, 19, 20], // horas de ponta (índice 0–23)
}

// [CONFIG] Parâmetros financeiros padrão
export const FINANCIAL_DEFAULTS = {
  analysisYears: 20,         // horizonte de análise em anos
  discountRate: 0.10,        // taxa de desconto anual (10%)
  exchangeRate: 5.10,        // USD → BRL (atualizar periodicamente)
  inflationRate: 0.045,      // inflação energética anual estimada (4,5%)
  installationCost: 0.15,    // custo de instalação como % do CAPEX do equipamento
  omCostAnnual: 0.02,        // O&M anual como % do CAPEX total
}
