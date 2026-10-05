/**
 * Several slips → one A4 PDF, three per page (3 × 99 mm = 297 mm) with dashed cut lines.
 * Each slip SVG is rasterised at 300 dpi: the browser renders the text with system fonts,
 * so č, ć, š, ž and đ come out right without embedding a font in the PDF.
 */
const DPI = 300
const MM = DPI / 25.4
const PER_PAGE = 3

async function svgToPng(svg: string): Promise<string> {
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(210 * MM)
  canvas.height = Math.round(99 * MM)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

export async function slipsToPdf(svgs: string[]): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  pdf.setProperties({ title: 'Nalozi za plaćanje', creator: 'Uplatnica CG' })

  for (let i = 0; i < svgs.length; i++) {
    const slot = i % PER_PAGE
    if (i > 0 && slot === 0) pdf.addPage()
    pdf.addImage(await svgToPng(svgs[i]!), 'PNG', 0, slot * 99, 210, 99, undefined, 'FAST')
    if (slot < PER_PAGE - 1 && i < svgs.length - 1) {
      pdf.setLineDashPattern([2, 2], 0)
      pdf.setLineWidth(0.1)
      pdf.line(0, (slot + 1) * 99, 210, (slot + 1) * 99)
    }
  }
  return pdf.output('blob')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
