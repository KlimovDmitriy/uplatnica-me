// Renders social preview images (public/og/<locale>.png) and PWA icons (public/icons/*.png).
// Run after changing texts or the logo: `npm run assets`. Output is committed.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const root = new URL('../public/', import.meta.url)
mkdirSync(new URL('icons/', root), { recursive: true })
mkdirSync(new URL('og/', root), { recursive: true })

const render = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' } })
    .render().asPng()

// ---- Icons ---------------------------------------------------------------
const logo = readFileSync(new URL('favicon.svg', root), 'utf8')
const inner = logo.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
// Maskable icons need the logo inside the central 80 % safe zone on a full-bleed background.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#111"/><g transform="translate(4.8 4.8) scale(.7)">${inner}</g></svg>`
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#111"/><g transform="translate(3.2 3.2) scale(.8)">${inner}</g></svg>`

writeFileSync(new URL('icons/icon-192.png', root), render(logo, 192))
writeFileSync(new URL('icons/icon-512.png', root), render(logo, 512))
writeFileSync(new URL('icons/maskable-512.png', root), render(maskable, 512))
writeFileSync(new URL('icons/apple-touch-icon.png', root), render(apple, 180))

// ---- Open Graph images ---------------------------------------------------
const TEXT = {
  sr: ['Nalog za plaćanje', 'za Crnu Goru', 'Besplatno · porezi, takse i kazne · PDF'],
  en: ['Montenegro', 'payment order', 'Free · taxes, fees and fines · PDF'],
  ru: ['Платёжка', 'для Черногории', 'Бесплатно · налоги, сборы и штрафы · PDF'],
}
const L = ['Naziv platioca', 'Svrha plaćanja', 'Naziv primaoca plaćanja', 'Iznos', 'Transakcioni račun primaoca plaćanja', 'NALOG PLATIOCA', 'Poziv na broj odobrenja']

function og(locale) {
  const [t1, t2, sub] = TEXT[locale]
  const line = '#111'
  const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${line}" stroke-width="2"/>`
  const caption = (x, y, s) => `<text x="${x}" y="${y}" font-size="12" fill="${line}" text-anchor="middle">(${s})</text>`
  const mono = (x, y, s) => `<text x="${x}" y="${y}" font-size="16" font-weight="700" font-family="Courier New, monospace" fill="#1f2937" text-anchor="middle">${s}</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#111"/>
  <g transform="translate(72 72)" font-family="Segoe UI, Arial, sans-serif">
    <g transform="scale(1.75)">${inner}</g>
    <text x="72" y="40" font-size="34" font-weight="700" fill="#fff">Uplatnica CG</text>
    <text x="0" y="150" font-size="64" font-weight="800" fill="#fff">${t1}</text>
    <text x="0" y="226" font-size="64" font-weight="800" fill="#fff">${t2}</text>
    <text x="0" y="288" font-size="28" fill="#9a9a9a">${sub}</text>
  </g>
  <g transform="translate(650 400) rotate(-4)" font-family="Arial, sans-serif">
    <rect x="0" y="0" width="520" height="250" rx="6" fill="#fff"/>
    <text x="60" y="30" font-size="16" font-weight="700" fill="${line}">${L[5]}</text>
    ${box(15, 45, 230, 40)}${caption(130, 100, L[0])}
    ${box(15, 115, 230, 40)}${caption(130, 170, L[1])}
    ${box(15, 185, 230, 40)}${caption(130, 240, L[2])}
    <line x1="262" y1="40" x2="262" y2="240" stroke="${line}" stroke-width="2"/>
    <text x="278" y="118" font-size="15" font-weight="700" fill="${line}">EUR</text>
    ${box(315, 97, 190, 30)}${mono(410, 118, '=85,40=')}${caption(410, 142, L[3])}
    ${box(278, 155, 227, 28)}${mono(391, 175, '540-3028014-56')}${caption(391, 198, 'Račun primaoca')}
    ${box(278, 208, 30, 26)}${mono(293, 227, '18')}
    ${box(315, 208, 190, 26)}${mono(410, 227, '0205973210263-302')}
  </g>
</svg>`
}

for (const locale of Object.keys(TEXT)) {
  writeFileSync(new URL(`og/${locale}.png`, root), render(og(locale), 1200))
}
console.log('assets generated')
