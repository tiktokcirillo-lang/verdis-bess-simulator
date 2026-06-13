// Motor de financiamento — calcula PMT pelo sistema Price e compara bancos parceiros

// [CONFIG] Bancos e taxas de referência (abr/2026) — atualize conforme mercado
export const BANKS = [
  { id: 'sicredi',   name: 'Sicredi',        monthlyRate: 0.0079, color: '#00a651' },
  { id: 'bb',        name: 'Banco do Brasil', monthlyRate: 0.0089, color: '#f9d000' },
  { id: 'santander', name: 'Santander',       monthlyRate: 0.0099, color: '#ec0000' },
  { id: 'caixa',     name: 'Caixa Econômica', monthlyRate: 0.0109, color: '#005ca9' },
  { id: 'bv',        name: 'BV Financeira',   monthlyRate: 0.0139, color: '#7b2d8b' },
]

// [CONFIG] Opções de prazo em meses
export const PRAZO_OPTIONS = [24, 36, 48, 60, 72]

// [CONFIG] Entrada padrão: 20% do CAPEX
export const DEFAULT_ENTRADA_PCT = 20

/**
 * Calcula parcela mensal pelo sistema Price (PMT).
 */
export function calcPMT(pv, r, n) {
  if (r === 0) return pv / n
  const factor = Math.pow(1 + r, n)
  return (pv * r * factor) / (factor - 1)
}

/**
 * Gera resultados completos de financiamento para todos os bancos.
 * @param {number} capexTotal - CAPEX total em BRL
 * @param {number} economiaMensal - Economia mensal estimada em BRL
 * @param {number} entradaPct - Percentual de entrada (0-100)
 * @param {number} prazo - Prazo em meses
 */
export function calcFinancing(capexTotal, economiaMensal, entradaPct, prazo) {
  const entrada = (entradaPct / 100) * capexTotal
  const valorFinanciado = capexTotal - entrada

  return BANKS.map(bank => {
    const parcela = calcPMT(valorFinanciado, bank.monthlyRate, prazo)
    const totalPago = parcela * prazo + entrada
    const jurosTotal = totalPago - capexTotal
    const saldoMensal = economiaMensal - parcela

    return {
      ...bank,
      entrada,
      valorFinanciado,
      parcela: parseFloat(parcela.toFixed(2)),
      totalPago: parseFloat(totalPago.toFixed(2)),
      jurosTotal: parseFloat(jurosTotal.toFixed(2)),
      saldoMensal: parseFloat(saldoMensal.toFixed(2)),
      positivo: saldoMensal >= 0,
    }
  })
}
