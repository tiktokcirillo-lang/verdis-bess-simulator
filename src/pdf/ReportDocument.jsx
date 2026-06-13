import {
  Document, Page, Text, View, StyleSheet
} from '@react-pdf/renderer'
import { FINANCIAL_DEFAULTS } from '../data/database'
import { generateAnnualReport } from '../engine/annualReport'

const C = {
  bg: '#0a0e10',
  surface: '#111827',
  border: '#1f2937',
  emerald: '#10b981',
  emeraldDark: '#065f46',
  text: '#f9fafb',
  muted: '#9ca3af',
  dim: '#4b5563',
  yellow: '#f59e0b',
  red: '#ef4444',
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingHorizontal: 40,
    paddingVertical: 36,
    fontFamily: 'Helvetica',
    color: C.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  logoBox: {
    width: 28,
    height: 28,
    backgroundColor: C.emerald,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 14, fontFamily: 'Helvetica-Bold' },
  headerTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.text },
  headerSub: { fontSize: 9, color: C.muted, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerDate: { fontSize: 8, color: C.dim },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kpiCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
    width: '23%',
  },
  kpiLabel: { fontSize: 7, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  kpiSub: { fontSize: 7, color: C.dim, marginTop: 3 },
  table: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: '#0d1117' },
  tableCell: { fontSize: 9, color: C.text },
  tableCellMuted: { fontSize: 9, color: C.muted },
  tableCellBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.emerald },
  tableColLabel: { width: '45%' },
  tableColValue: { width: '30%' },
  tableColUnit: { width: '25%' },
  specLabel: { fontSize: 9, color: C.muted },
  specValue: { fontSize: 9, color: C.text },
  alertBox: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  alertText: { fontSize: 8, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  footerText: { fontSize: 7, color: C.dim },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  classDescription: { fontSize: 9, color: C.muted, flex: 1 },
  projectGrid: { flexDirection: 'row', gap: 8 },
  projectCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
  },
})

function badgeColors(color) {
  const map = {
    emerald: { bg: '#022c22', text: C.emerald, border: '#065f46' },
    green:   { bg: '#052e16', text: '#4ade80', border: '#166534' },
    yellow:  { bg: '#1c1100', text: C.yellow,  border: '#92400e' },
    red:     { bg: '#1c0000', text: C.red,     border: '#7f1d1d' },
  }
  return map[color] || map.emerald
}

function alertColors(type) {
  const map = {
    warning: { bg: '#1c1100', border: '#92400e', text: C.yellow },
    info:    { bg: '#0c1a2e', border: '#1e3a5f', text: '#60a5fa' },
    error:   { bg: '#1c0000', border: '#7f1d1d', text: C.red },
  }
  return map[type] || map.info
}

function fmtBRL(value) {
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
}

function fmtDate() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function ReportDocument({ results, project }) {
  const {
    demandReduction, savings, capex,
    npv, irr, simplePayback, discountedPayback,
    classification, alerts, product, analysisYears,
    cashFlows,
  } = results

  const bc = badgeColors(classification.color)

  const annualReport = results.loads?.state
    ? generateAnnualReport(results.loads.state, product, savings, capex)
    : null

  let cum = 0
  const cfSummary = cashFlows
    .map((v, i) => { cum += v; return { ano: i, acumulado: cum, anual: v } })
    .filter(r => r.ano % 5 === 0 || r.ano === cashFlows.length - 1)

  return (
    <Document
      title={`Verdis BESS — ${project.clientName}`}
      author="Verdis BESS Simulator"
      subject="Relatório de Viabilidade BESS"
    >
      {/* PÁGINA 1 — Resumo Executivo */}
      <Page size="A4" style={s.page}>

        <View style={s.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>V</Text>
            </View>
            <View>
              <Text style={s.headerTitle}>Verdis BESS Simulator</Text>
              <Text style={s.headerSub}>Relatório de Viabilidade — Armazenamento de Energia</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{fmtDate()}</Text>
            <Text style={[s.headerDate, { marginTop: 2 }]}>Página 1 de 2</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Dados do Projeto</Text>
          <View style={s.projectGrid}>
            <View style={s.projectCard}>
              <Text style={s.specLabel}>Cliente</Text>
              <Text style={[s.specValue, { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 }]}>
                {project.clientName}
              </Text>
            </View>
            <View style={s.projectCard}>
              <Text style={s.specLabel}>Localização</Text>
              <Text style={[s.specValue, { fontSize: 11, marginTop: 2 }]}>{project.location}</Text>
            </View>
            <View style={s.projectCard}>
              <Text style={s.specLabel}>Segmento</Text>
              <Text style={[s.specValue, { fontSize: 11, marginTop: 2, textTransform: 'capitalize' }]}>
                {project.segment}
              </Text>
            </View>
            {project.installedSolarKwp > 0 && (
              <View style={s.projectCard}>
                <Text style={s.specLabel}>Solar instalado</Text>
                <Text style={[s.specValue, { fontSize: 11, marginTop: 2 }]}>
                  {project.installedSolarKwp} kWp
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Classificação do Projeto</Text>
          <View style={[s.classRow, { borderColor: bc.border, backgroundColor: bc.bg }]}>
            <View style={[s.badge, { backgroundColor: bc.bg, borderWidth: 1, borderColor: bc.border }]}>
              <Text style={[s.badgeText, { color: bc.text }]}>{classification.label}</Text>
            </View>
            <Text style={s.classDescription}>{classification.description}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Indicadores Financeiros</Text>
          <View style={s.kpiGrid}>
            {[
              {
                label: 'TIR',
                value: `${irr}%`,
                sub: `Desconto: ${(FINANCIAL_DEFAULTS.discountRate * 100).toFixed(0)}% a.a.`,
                color: irr >= 12 ? C.emerald : irr >= 6 ? C.yellow : C.red,
              },
              {
                label: 'VPL',
                value: `R$ ${(npv / 1000).toFixed(0)}k`,
                sub: fmtBRL(npv),
                color: npv >= 0 ? C.emerald : C.red,
              },
              {
                label: 'Payback Simples',
                value: typeof simplePayback === 'number' ? `${simplePayback} anos` : '>horizonte',
                sub: `Descontado: ${typeof discountedPayback === 'number' ? discountedPayback + ' anos' : '>horizonte'}`,
                color: typeof simplePayback === 'number' && simplePayback <= 8 ? C.emerald : C.yellow,
              },
              {
                label: 'CAPEX Total',
                value: `R$ ${(capex.totalBRL / 1000).toFixed(0)}k`,
                sub: `Equip. + instalação`,
                color: '#60a5fa',
              },
            ].map((kpi, i) => (
              <View key={i} style={s.kpiCard}>
                <Text style={s.kpiLabel}>{kpi.label}</Text>
                <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={s.kpiSub}>{kpi.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Economia Tarifária</Text>
          <View style={s.kpiGrid}>
            {[
              { label: 'Economia Mensal', value: fmtBRL(savings.totalMonthly), sub: 'energia + demanda', color: C.emerald },
              { label: 'Economia Anual', value: `R$ ${(savings.totalAnnual / 1000).toFixed(0)}k`, sub: fmtBRL(savings.totalAnnual), color: C.emerald },
              { label: 'Redução de Ponta', value: `${demandReduction.reductionKw} kW`, sub: `${demandReduction.reductionPct}% de redução`, color: '#60a5fa' },
              { label: 'Pico c/ BESS', value: `${demandReduction.peakWithKw} kW`, sub: `Sem BESS: ${demandReduction.peakWithoutKw} kW`, color: '#4ade80' },
            ].map((kpi, i) => (
              <View key={i} style={s.kpiCard}>
                <Text style={s.kpiLabel}>{kpi.label}</Text>
                <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={s.kpiSub}>{kpi.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {alerts.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Alertas e Observações</Text>
            {alerts.map((alert, i) => {
              const ac = alertColors(alert.type)
              const icons = { warning: '⚠ ', info: 'ℹ ', error: '✕ ' }
              return (
                <View key={i} style={[s.alertBox, { backgroundColor: ac.bg, borderColor: ac.border }]}>
                  <Text style={[s.alertText, { color: ac.text }]}>
                    {icons[alert.type]}{alert.message}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Verdis BESS Simulator — Relatório Confidencial</Text>
          <Text style={s.footerText}>{project.clientName} · {fmtDate()}</Text>
        </View>
      </Page>

      {/* PÁGINA 2 — Detalhamento Técnico */}
      <Page size="A4" style={s.page}>

        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Detalhamento Técnico</Text>
            <Text style={s.headerSub}>{project.clientName} — {product.label}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{fmtDate()}</Text>
            <Text style={[s.headerDate, { marginTop: 2 }]}>Página 2 de 2</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Especificações do Equipamento</Text>
          <View style={s.table}>
            {[
              ['Modelo', product.label, ''],
              ['Capacidade', `${product.capacityKwh}`, 'kWh'],
              ['Potência', `${product.powerKw}`, 'kW'],
              ['Química', product.chemistry, ''],
              ['Profundidade de descarga (DoD)', `${product.dod * 100}`, '%'],
              ['Ciclos de vida', `${product.cycleLife.toLocaleString('pt-BR')}`, 'ciclos'],
            ].map(([label, value, unit], i) => (
              <View key={i} style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}>
                <Text style={[s.tableCellMuted, s.tableColLabel]}>{label}</Text>
                <Text style={[s.tableCellBold, s.tableColValue]}>{value}</Text>
                <Text style={[s.tableCellMuted, s.tableColUnit]}>{unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Composição do CAPEX</Text>
          <View style={s.table}>
            {[
              ['Equipamento (USD)', `USD ${product.priceUSD.toLocaleString('en-US')}`, ''],
              ['Câmbio utilizado', `R$ ${FINANCIAL_DEFAULTS.exchangeRate.toFixed(2)}`, 'por USD'],
              ['Equipamento (BRL)', fmtBRL(capex.equipmentBRL), ''],
              ['Instalação', fmtBRL(capex.installationBRL), `${(FINANCIAL_DEFAULTS.installationCost * 100).toFixed(0)}% do equip.`],
              ['CAPEX Total', fmtBRL(capex.totalBRL), ''],
            ].map(([label, value, unit], i) => (
              <View key={i} style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}>
                <Text style={[s.tableCellMuted, s.tableColLabel]}>{label}</Text>
                <Text style={[s.tableCellBold, s.tableColValue]}>{value}</Text>
                <Text style={[s.tableCellMuted, s.tableColUnit]}>{unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Parâmetros da Simulação</Text>
          <View style={s.table}>
            {[
              ['Horizonte de análise', `${analysisYears}`, 'anos'],
              ['Taxa de desconto', `${(FINANCIAL_DEFAULTS.discountRate * 100).toFixed(0)}`, '% a.a.'],
              ['Inflação tarifária estimada', `${(FINANCIAL_DEFAULTS.inflationRate * 100).toFixed(1)}`, '% a.a.'],
              ['O&M anual', `${(FINANCIAL_DEFAULTS.omCostAnnual * 100).toFixed(0)}`, '% do CAPEX'],
              ['Tarifa fora-ponta', `R$ ${savings.energySavingsMonthly > 0 ? '0,75' : '-'}`, 'R$/kWh'],
              ['Tarifa ponta', 'R$ 1,45', 'R$/kWh (18h–21h)'],
            ].map(([label, value, unit], i) => (
              <View key={i} style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}>
                <Text style={[s.tableCellMuted, s.tableColLabel]}>{label}</Text>
                <Text style={[s.tableCellBold, s.tableColValue]}>{value}</Text>
                <Text style={[s.tableCellMuted, s.tableColUnit]}>{unit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Fluxo de Caixa Acumulado (resumo)</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableCellMuted, { width: '20%', fontSize: 8 }]}>Ano</Text>
              <Text style={[s.tableCellMuted, { width: '40%', fontSize: 8 }]}>Fluxo Anual</Text>
              <Text style={[s.tableCellMuted, { width: '40%', fontSize: 8 }]}>Acumulado</Text>
            </View>
            {cfSummary.map((row, i) => (
              <View key={i} style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}>
                <Text style={[s.tableCell, { width: '20%' }]}>{row.ano}</Text>
                <Text style={[s.tableCell, { width: '40%', color: row.anual >= 0 ? C.emerald : C.red }]}>
                  {fmtBRL(row.anual)}
                </Text>
                <Text style={[s.tableCell, { width: '40%', color: row.acumulado >= 0 ? C.emerald : C.muted }]}>
                  {fmtBRL(row.acumulado)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {annualReport && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Geração e Economia Mensal Estimada</Text>
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.tableCellMuted, { width: '18%', fontSize: 8 }]}>Mês</Text>
                <Text style={[s.tableCellMuted, { width: '20%', fontSize: 8 }]}>Irrad.</Text>
                <Text style={[s.tableCellMuted, { width: '18%', fontSize: 8 }]}>Luz solar</Text>
                <Text style={[s.tableCellMuted, { width: '22%', fontSize: 8 }]}>Energia deslocada</Text>
                <Text style={[s.tableCellMuted, { width: '22%', fontSize: 8 }]}>Economia</Text>
              </View>
              {annualReport.monthlyData.map((m, i) => (
                <View key={i} style={[s.tableRow, i % 2 !== 0 && s.tableRowAlt]}>
                  <Text style={[s.tableCell, { width: '18%' }]}>{m.monthName}</Text>
                  <Text style={[s.tableCell, { width: '20%', color: '#f59e0b' }]}>
                    {m.irradiance} kWh/m²
                  </Text>
                  <Text style={[s.tableCell, { width: '18%', color: C.muted }]}>
                    {m.daylightH}h
                  </Text>
                  <Text style={[s.tableCell, { width: '22%', color: '#60a5fa' }]}>
                    {m.energyShiftedKwh.toLocaleString('pt-BR')} kWh
                  </Text>
                  <Text style={[s.tableCellBold, { width: '22%' }]}>
                    R$ {m.economiaMes.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </Text>
                </View>
              ))}
              <View style={[s.tableRow, { backgroundColor: '#0d1117' }]}>
                <Text style={[s.tableCellBold, { width: '56%', color: C.muted }]}>Total anual</Text>
                <Text style={[s.tableCellBold, { width: '22%', color: '#60a5fa' }]}>
                  {annualReport.totalEnergyShifted.toLocaleString('pt-BR')} kWh
                </Text>
                <Text style={[s.tableCellBold, { width: '22%' }]}>
                  R$ {annualReport.totalEconomiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {annualReport && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Impacto Ambiental Anual</Text>
            <View style={s.kpiGrid}>
              {[
                { label: 'CO₂ evitado', value: `${annualReport.totalCO2Evitado} kg`, color: '#4ade80' },
                { label: 'Árvores equivalentes', value: `${annualReport.equivalencias.arvoresPlantadas}`, color: '#4ade80' },
                { label: 'km não rodados', value: `${annualReport.equivalencias.kmNaoRodados.toLocaleString('pt-BR')}`, color: '#4ade80' },
                { label: 'Casas abastecidas/mês', value: `${annualReport.equivalencias.casasMes}`, color: '#4ade80' },
              ].map((kpi, i) => (
                <View key={i} style={s.kpiCard}>
                  <Text style={s.kpiLabel}>{kpi.label}</Text>
                  <Text style={[s.kpiValue, { color: kpi.color, fontSize: 14 }]}>{kpi.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Verdis BESS Simulator — Relatório Confidencial</Text>
          <Text style={s.footerText}>{project.clientName} · {fmtDate()}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReportDocument
