// Motor financeiro — TIR, VPL, Payback, CAPEX/OPEX

import { FINANCIAL_DEFAULTS } from '../data/database.js'

/**
 * Calcula o CAPEX total do projeto em BRL.
 */
export function calcCapex(product, config = FINANCIAL_DEFAULTS) {
  const equipmentBRL = product.priceUSD * config.exchangeRate
  const installationBRL = equipmentBRL * config.installationCost
  return {
    equipmentBRL: parseFloat(equipmentBRL.toFixed(2)),
    installationBRL: parseFloat(installationBRL.toFixed(2)),
    totalBRL: parseFloat((equipmentBRL + installationBRL).toFixed(2)),
  }
}

/**
 * Projeta o fluxo de caixa anual ao longo do horizonte de análise.
 * Aplica inflação tarifária sobre a economia e O&M sobre o CAPEX.
 */
export function buildCashFlow(annualSavings, capexTotal, config = FINANCIAL_DEFAULTS) {
  const flows = []

  // Ano 0 — investimento inicial (negativo)
  flows.push(-capexTotal)

  for (let year = 1; year <= config.analysisYears; year++) {
    const inflatedSavings = annualSavings * Math.pow(1 + config.inflationRate, year - 1)
    const omCost = capexTotal * config.omCostAnnual
    const netFlow = inflatedSavings - omCost
    flows.push(parseFloat(netFlow.toFixed(2)))
  }

  return flows
}

/**
 * Calcula o VPL (Valor Presente Líquido).
 */
export function calcNPV(cashFlows, discountRate = FINANCIAL_DEFAULTS.discountRate) {
  return parseFloat(
    cashFlows.reduce((npv, flow, t) => {
      return npv + flow / Math.pow(1 + discountRate, t)
    }, 0).toFixed(2)
  )
}

/**
 * Calcula a TIR (Taxa Interna de Retorno) via método de Newton-Raphson.
 * [CONFIG] Máximo de 1000 iterações, tolerância de 0.0001.
 */
export function calcIRR(cashFlows) {
  let rate = 0.10
  const maxIter = 1000
  const tolerance = 0.0001

  for (let i = 0; i < maxIter; i++) {
    const npv = cashFlows.reduce((acc, flow, t) => acc + flow / Math.pow(1 + rate, t), 0)
    const dnpv = cashFlows.reduce((acc, flow, t) => acc - t * flow / Math.pow(1 + rate, t + 1), 0)

    if (Math.abs(dnpv) < 1e-10) break

    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < tolerance) {
      return parseFloat((newRate * 100).toFixed(2)) // retorna em %
    }
    rate = newRate
  }

  return parseFloat((rate * 100).toFixed(2))
}

/**
 * Calcula o Payback Simples e Descontado em anos.
 */
export function calcPayback(cashFlows, discountRate = FINANCIAL_DEFAULTS.discountRate) {
  let cumSimple = 0
  let cumDiscounted = 0
  let simplePayback = null
  let discountedPayback = null

  for (let t = 0; t < cashFlows.length; t++) {
    const discounted = cashFlows[t] / Math.pow(1 + discountRate, t)
    cumSimple += cashFlows[t]
    cumDiscounted += discounted

    if (simplePayback === null && cumSimple >= 0) simplePayback = t
    if (discountedPayback === null && cumDiscounted >= 0) discountedPayback = t
  }

  return {
    simplePayback: simplePayback ?? '>horizonte',
    discountedPayback: discountedPayback ?? '>horizonte',
  }
}
