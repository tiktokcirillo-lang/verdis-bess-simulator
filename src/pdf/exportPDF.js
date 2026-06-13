import { pdf } from '@react-pdf/renderer'
import ReportDocument from './ReportDocument'

export async function exportPDF(results, project) {
  const blob = await pdf(
    <ReportDocument results={results} project={project} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `verdis-bess-${project.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
