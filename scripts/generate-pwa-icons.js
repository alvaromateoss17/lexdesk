import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, '..')
const publicDir = join(root, 'public')
const iconsDir  = join(publicDir, 'icons')

mkdirSync(iconsDir, { recursive: true })

// Wrap the favicon SVG in a square canvas with the app background color
const svgRaw = readFileSync(join(publicDir, 'favicon.svg'), 'utf-8')

function wrapSvg(size, iconSize) {
  const padding = Math.round((size - iconSize) / 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0C0E14"/>
  <image href="data:image/svg+xml;base64,${Buffer.from(svgRaw).toString('base64')}"
    x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}"/>
</svg>`
}

const icons = [
  { name: 'icon-72.png',   size: 72,   iconSize: 44 },
  { name: 'icon-96.png',   size: 96,   iconSize: 60 },
  { name: 'icon-128.png',  size: 128,  iconSize: 80 },
  { name: 'icon-144.png',  size: 144,  iconSize: 90 },
  { name: 'icon-152.png',  size: 152,  iconSize: 96 },
  { name: 'icon-192.png',  size: 192,  iconSize: 120 },
  { name: 'icon-384.png',  size: 384,  iconSize: 240 },
  { name: 'icon-512.png',  size: 512,  iconSize: 320 },
  // Apple touch icon (no border-radius applied by browser itself)
  { name: 'apple-touch-icon.png', size: 180, iconSize: 110 },
  // Maskable icon — icon fills the entire canvas (safe area = 80%)
  { name: 'icon-maskable-192.png', size: 192, iconSize: 154, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, iconSize: 410, maskable: true },
]

async function generate() {
  for (const { name, size, iconSize, maskable } of icons) {
    const svg = maskable
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
          <rect width="${size}" height="${size}" fill="#0C0E14"/>
          <image href="data:image/svg+xml;base64,${Buffer.from(svgRaw).toString('base64')}"
            x="${(size - iconSize) / 2}" y="${(size - iconSize) / 2}" width="${iconSize}" height="${iconSize}"/>
        </svg>`
      : wrapSvg(size, iconSize)

    await sharp(Buffer.from(svg)).png().toFile(join(iconsDir, name))
    console.log(`✓ ${name} (${size}×${size})`)
  }
  console.log('\nAll PWA icons generated in public/icons/')
}

generate().catch(console.error)
