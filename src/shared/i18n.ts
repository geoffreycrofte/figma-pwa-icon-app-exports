/**
 * All user-facing text, in English and French. Shared by the UI and by the
 * plugin's notifications, so wording stays consistent.
 */
import type { ApplyReport, SelectionSummary } from './messages.ts'
import type { PresetId } from './presets.ts'

export type Lang = 'en' | 'fr'

export const LANGS: readonly Lang[] = ['en', 'fr']

/** Each language's name, written in that language (never translated). */
export const LANG_NAMES: Readonly<Record<Lang, string>> = { en: 'English', fr: 'Français' }

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

export function detectLang(locale: string | undefined): Lang {
  return locale?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

/** English: 1 is singular. French: 0 and 1 are singular. */
function plural(lang: Lang, n: number, one: string, other: string): string {
  const singular = lang === 'fr' ? n <= 1 : n === 1
  return singular ? one : other
}

interface PresetText {
  readonly label: string
  readonly description: string
}

export interface Strings {
  readonly appTitle: string
  readonly homeHeading: string
  readonly generateLabel: string
  readonly generateDescription: string
  readonly exportLabel: string
  readonly exportDescription: string
  readonly back: string
  readonly presetsLegend: string
  readonly presets: Readonly<Record<PresetId, PresetText>>
  readonly sizesLabel: (sizes: readonly number[], svg: boolean) => string
  readonly applyButton: string
  readonly exportHint: string
  readonly noPresetError: string
  readonly noSelectionError: string
  /** Selection count and ignored items. The non-square warning is separate. */
  readonly selection: (s: SelectionSummary) => string
  /** Empty when every layer is square. */
  readonly nonSquareWarning: (nonSquare: number) => string
  readonly creditPrefix: string
  readonly languageLabel: string
  readonly langSaveError: string
  readonly newTab: string
  readonly applyDone: (r: ApplyReport) => string
  readonly templatesDone: (count: number) => string
  readonly templatesSectionName: string
  readonly unexpectedError: (detail: string) => string
}

const en: Strings = {
  appTitle: 'PWA Icon App Exports',
  homeHeading: 'What do you want to do?',
  generateLabel: 'Generate templates',
  generateDescription: 'Ready-to-draw icons with explanations and live previews on a phone and in a browser.',
  exportLabel: 'Export selected frames',
  exportDescription: 'Add PWA icon export sizes to the frames you selected.',
  back: 'Back',
  presetsLegend: 'Icon sets to add',
  presets: {
    standard: { label: 'PWA icons', description: 'Web app manifest icons.' },
    maskable: {
      label: 'Maskable icons',
      description: 'Android adaptive icons. Keep content inside the central 80% safe zone.',
    },
    apple: {
      label: 'Apple touch icons',
      description: 'iPhone and iPad home screen. Use an opaque background.',
    },
    favicon: { label: 'Favicons', description: 'Browser tabs and bookmarks.' },
  },
  sizesLabel: (sizes, svg) => `Sizes: ${sizes.join(', ')} px${svg ? ' + SVG' : ''}.`,
  applyButton: 'Add export settings',
  exportHint: 'Existing export settings are kept. Then export from the Export section of the right panel.',
  noPresetError: 'Choose at least one icon set.',
  noSelectionError: 'Select at least one frame on the canvas first.',
  selection: ({ eligible, ineligible }) => {
    const parts: string[] = []
    if (eligible === 0) parts.push('No frame selected.')
    else parts.push(`${eligible} ${plural('en', eligible, 'layer', 'layers')} selected.`)
    if (ineligible > 0) {
      parts.push(`${ineligible} selected ${plural('en', ineligible, 'item', 'items')} cannot be exported and will be ignored.`)
    }
    return parts.join(' ')
  },
  nonSquareWarning: (n) =>
    n > 0
      ? `${n} ${plural('en', n, 'layer is', 'layers are')} not square: exported icons will not be square either.`
      : '',
  creditPrefix: 'Free plugin by',
  languageLabel: 'Interface language',
  langSaveError: 'Your language choice could not be saved for next time.',
  newTab: ' (opens in a new tab)',
  applyDone: ({ updated, added, failed }) => {
    const parts: string[] = []
    if (updated > 0) {
      parts.push(
        added > 0
          ? `Export settings added to ${updated} ${plural('en', updated, 'layer', 'layers')} (${added} new ${plural('en', added, 'size', 'sizes')}).`
          : `${updated} ${plural('en', updated, 'layer', 'layers')} already had these export settings.`,
      )
    }
    if (failed > 0) {
      parts.push(`${failed} ${plural('en', failed, 'layer', 'layers')} could not be updated (locked or inside an instance?).`)
    }
    return parts.join(' ')
  },
  templatesDone: (count) =>
    `${count} templates created and selected on the canvas. Draw in each one: the previews below update live.`,
  templatesSectionName: 'PWA icon templates',
  unexpectedError: (detail) => `Something went wrong: ${detail}`,
}

const fr: Strings = {
  appTitle: 'PWA Icon App Exports',
  homeHeading: 'Que voulez-vous faire\u00a0?',
  generateLabel: 'Générer des gabarits',
  generateDescription: 'Des icônes prêtes à dessiner, avec explications et aperçus en direct sur mobile et dans un navigateur.',
  exportLabel: 'Exporter les frames sélectionnés',
  exportDescription: 'Ajouter les tailles d’export d’icônes PWA aux frames sélectionnés.',
  back: 'Retour',
  presetsLegend: 'Jeux d’icônes à ajouter',
  presets: {
    standard: { label: 'Icônes PWA', description: 'Icônes du manifeste de l’application web.' },
    maskable: {
      label: 'Icônes maskable',
      description: 'Icônes adaptatives Android. Gardez le contenu dans la zone de sécurité centrale de 80\u00a0%.',
    },
    apple: {
      label: 'Icônes Apple touch',
      description: 'Écran d’accueil iPhone et iPad. Utilisez un fond opaque.',
    },
    favicon: { label: 'Favicons', description: 'Onglets et favoris du navigateur.' },
  },
  sizesLabel: (sizes, svg) => `Tailles\u00a0: ${sizes.join(', ')} px${svg ? ' + SVG' : ''}.`,
  applyButton: 'Ajouter les réglages d’export',
  exportHint: 'Les réglages d’export existants sont conservés. Exportez ensuite depuis la section Export du panneau de droite.',
  noPresetError: 'Choisissez au moins un jeu d’icônes.',
  noSelectionError: 'Sélectionnez d’abord au moins un frame sur le canevas.',
  selection: ({ eligible, ineligible }) => {
    const parts: string[] = []
    if (eligible === 0) parts.push('Aucun frame sélectionné.')
    else parts.push(`${eligible} ${plural('fr', eligible, 'calque sélectionné', 'calques sélectionnés')}.`)
    if (ineligible > 0) {
      parts.push(`${ineligible} ${plural('fr', ineligible, 'élément sélectionné ne peut pas être exporté et sera ignoré', 'éléments sélectionnés ne peuvent pas être exportés et seront ignorés')}.`)
    }
    return parts.join(' ')
  },
  nonSquareWarning: (n) =>
    n > 0
      ? `${n} ${plural('fr', n, 'calque n’est pas carré', 'calques ne sont pas carrés')}\u00a0: les icônes exportées ne le seront pas non plus.`
      : '',
  creditPrefix: 'Plugin gratuit par',
  languageLabel: 'Langue de l’interface',
  langSaveError: 'Votre choix de langue n’a pas pu être enregistré pour la prochaine fois.',
  newTab: ' (s’ouvre dans un nouvel onglet)',
  applyDone: ({ updated, added, failed }) => {
    const parts: string[] = []
    if (updated > 0) {
      parts.push(
        added > 0
          ? `Réglages d’export ajoutés à ${updated} ${plural('fr', updated, 'calque', 'calques')} (${added} ${plural('fr', added, 'nouvelle taille', 'nouvelles tailles')}).`
          : `${updated} ${plural('fr', updated, 'calque avait', 'calques avaient')} déjà ces réglages d’export.`,
      )
    }
    if (failed > 0) {
      parts.push(`${failed} ${plural('fr', failed, 'calque n’a pas pu être modifié', 'calques n’ont pas pu être modifiés')} (verrouillé ou dans une instance\u00a0?).`)
    }
    return parts.join(' ')
  },
  templatesDone: (count) =>
    `${count} gabarits créés et sélectionnés sur le canevas. Dessinez dans chacun\u00a0: les aperçus en dessous se mettent à jour en direct.`,
  templatesSectionName: 'Gabarits d’icônes PWA',
  unexpectedError: (detail) => `Une erreur est survenue\u00a0: ${detail}`,
}

export const STRINGS: Readonly<Record<Lang, Strings>> = { en, fr }
