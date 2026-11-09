/**
 * Text drawn on the canvas by "Generate templates": one guide card and one
 * in-context preview per preset, plus the fake content of the mockups.
 */
import type { Lang } from './i18n.ts'
import type { PresetId } from './presets.ts'

export interface Guide {
  readonly title: string
  readonly intro: string
  readonly tips: readonly string[]
  /** Snippet showing how the exported files are referenced in a web app. */
  readonly code: string
  readonly previewTitle: string
  readonly previewCaption: string
}

export interface CanvasText {
  readonly sizesLabel: string
  readonly codeLabel: string
  readonly appName: string
  readonly time: string
  readonly url: string
  readonly newTab: string
  readonly themeLight: string
  readonly themeDark: string
  readonly masks: Readonly<Record<'circle' | 'squircle' | 'rounded' | 'teardrop', string>>
  readonly guides: Readonly<Record<PresetId, Guide>>
}

const en: CanvasText = {
  sizesLabel: 'Exported sizes:',
  codeLabel: 'In your code',
  appName: 'My App',
  time: '9:41',
  url: 'myapp.example',
  newTab: 'New tab',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  masks: { circle: 'Circle', squircle: 'Squircle', rounded: 'Rounded square', teardrop: 'Teardrop' },
  guides: {
    standard: {
      title: 'PWA icon',
      intro:
        'The main icon of your web app, declared in the web app manifest. Browsers and operating systems pick the closest size.',
      tips: [
        'Draw in the 512 × 512 frame: all 10 sizes are generated on export.',
        'A transparent background is allowed, but Android then shows the icon inside a white disc (see the preview).',
        'Prefer simple, contrasted shapes: the icon is often seen at 48 px.',
      ],
      code: '"icons": [\n  { "src": "icon-192x192.png", "sizes": "192x192", "type": "image/png" },\n  { "src": "icon-512x512.png", "sizes": "512x512", "type": "image/png" }\n]',
      previewTitle: 'Preview: Android home screen',
      previewCaption:
        'Without a maskable icon, Android shrinks your icon into a white disc. Add a maskable icon to fill the whole shape.',
    },
    maskable: {
      title: 'Maskable icon',
      intro:
        'Android crops the icon to the shape chosen by the device maker (circle, squircle, teardrop…). The icon must cover the whole frame, without transparency.',
      tips: [
        'Fill the entire frame: the background is part of the icon.',
        'Keep what matters inside the pink area: a centred circle 80% of the width (409 px).',
        'Show or hide layout grids with Ctrl G (⌃ G on Mac).',
      ],
      code: '{ "src": "icon-maskable-512x512.png", "sizes": "512x512",\n  "type": "image/png", "purpose": "maskable" }',
      previewTitle: 'Preview: Android shapes',
      previewCaption: 'The same icon cropped by different devices. Check that nothing important is cut off.',
    },
    apple: {
      title: 'Apple touch icon',
      intro:
        'iPhone and iPad ignore the manifest icons: they read the apple-touch-icon link. iOS rounds the corners itself.',
      tips: [
        'Use an opaque background: transparency turns black.',
        'Do not round the corners yourself.',
        'Leave some room around the symbol.',
      ],
      code: '<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">',
      previewTitle: 'Preview: iPhone home screen',
      previewCaption: 'iOS applies its own rounded corners. Transparent areas appear black.',
    },
    favicon: {
      title: 'Favicon',
      intro: 'The icon of tabs, bookmarks and history. It is shown as small as 16 px, on light and dark backgrounds.',
      tips: [
        'Simplify: at 16 px, only a strong symbol stays readable.',
        'Check it on both tabs of the preview (light and dark).',
        'The SVG version can adapt to the theme with prefers-color-scheme.',
      ],
      code: '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon-32x32.png" sizes="32x32">',
      previewTitle: 'Preview: browser tab',
      previewCaption: 'Your favicon at 16 px, in light and dark themes.',
    },
  },
}

const fr: CanvasText = {
  sizesLabel: 'Tailles exportées\u00a0:',
  codeLabel: 'Dans votre code',
  appName: 'Mon app',
  time: '9:41',
  url: 'monapp.example',
  newTab: 'Nouvel onglet',
  themeLight: 'Thème clair',
  themeDark: 'Thème sombre',
  masks: { circle: 'Cercle', squircle: 'Squircle', rounded: 'Carré arrondi', teardrop: 'Goutte' },
  guides: {
    standard: {
      title: 'Icône PWA',
      intro:
        'L’icône principale de votre application web, déclarée dans le manifeste. Navigateurs et systèmes choisissent la taille la plus proche.',
      tips: [
        'Dessinez dans le frame de 512 × 512 : les 10 tailles sont générées à l’export.',
        'Un fond transparent est possible, mais Android affiche alors l’icône dans une pastille blanche (voir l’aperçu).',
        'Préférez des formes simples et contrastées : l’icône est souvent vue à 48 px.',
      ],
      code: '"icons": [\n  { "src": "icon-192x192.png", "sizes": "192x192", "type": "image/png" },\n  { "src": "icon-512x512.png", "sizes": "512x512", "type": "image/png" }\n]',
      previewTitle: 'Aperçu : écran d’accueil Android',
      previewCaption:
        'Sans icône maskable, Android réduit votre icône dans une pastille blanche. Ajoutez une icône maskable pour occuper toute la forme.',
    },
    maskable: {
      title: 'Icône maskable',
      intro:
        'Android découpe l’icône selon la forme choisie par le fabricant (cercle, squircle, goutte…). L’icône doit couvrir tout le frame, sans transparence.',
      tips: [
        'Remplissez tout le frame : le fond fait partie de l’icône.',
        'Gardez l’essentiel dans la zone rose : un cercle centré de 80 % de la largeur (409 px).',
        'Affichez ou masquez les grilles avec Ctrl G (⌃ G sur Mac).',
      ],
      code: '{ "src": "icon-maskable-512x512.png", "sizes": "512x512",\n  "type": "image/png", "purpose": "maskable" }',
      previewTitle: 'Aperçu : formes Android',
      previewCaption: 'La même icône découpée par différents appareils. Vérifiez que rien d’important n’est coupé.',
    },
    apple: {
      title: 'Icône Apple touch',
      intro:
        'L’iPhone et l’iPad ignorent les icônes du manifeste : ils lisent la balise apple-touch-icon. iOS arrondit lui-même les coins.',
      tips: [
        'Utilisez un fond opaque : la transparence devient noire.',
        'N’arrondissez pas les coins vous-même.',
        'Laissez de la marge autour du motif.',
      ],
      code: '<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">',
      previewTitle: 'Aperçu : écran d’accueil iPhone',
      previewCaption: 'iOS applique ses propres coins arrondis. Les zones transparentes apparaissent en noir.',
    },
    favicon: {
      title: 'Favicon',
      intro:
        'L’icône des onglets, favoris et de l’historique. Elle s’affiche dès 16 px, sur fond clair comme sombre.',
      tips: [
        'Simplifiez : à 16 px, seul un symbole fort reste lisible.',
        'Vérifiez-la sur les deux onglets de l’aperçu (clair et sombre).',
        'La version SVG peut s’adapter au thème avec prefers-color-scheme.',
      ],
      code: '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon-32x32.png" sizes="32x32">',
      previewTitle: 'Aperçu : onglet de navigateur',
      previewCaption: 'Votre favicon à 16 px, en thème clair et sombre.',
    },
  },
}

export const CANVAS_TEXT: Readonly<Record<Lang, CanvasText>> = { en, fr }
