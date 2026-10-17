/**
 * Reference project category key, resolved to a label via `references.i18n.json`.
 */
type ReferenceTypeKey = 'designSystem' | 'collaboration' | 'web'

/**
 * Reference project shown in the references section.
 */
export interface ReferenceEntry {
  /** Project or client name */
  title: string
  /** Path to the website preview screenshot */
  img: string
  /** Full project URL */
  webURL: string
  /** Display hostname */
  website: string
  /** Category key */
  type: ReferenceTypeKey
}

/**
 * Selected client references, shared by the references section and WebMCP tools.
 */
export const REFERENCES: ReferenceEntry[] = [
  {
    title: 'Vertice',
    img: '/images/references/vertice.avif',
    webURL: 'https://vertice.one/',
    website: 'vertice.one',
    type: 'designSystem',
  },
  {
    title: 'VIGo',
    img: '/images/references/vigo.avif',
    webURL: 'https://vig.cz/',
    website: 'vig.cz',
    type: 'designSystem',
  },
  {
    title: 'Riganti',
    img: '/images/references/riganti.avif',
    webURL: 'https://www.riganti.cz/',
    website: 'riganti.cz',
    type: 'collaboration',
  },
  {
    title: 'Update Conference',
    img: '/images/references/update-conference.avif',
    webURL: 'https://www.updateconference.net/',
    website: 'updateconference.net',
    type: 'collaboration',
  },
  {
    title: 'Update Days',
    img: '/images/references/update-days.avif',
    webURL: 'https://www.updatedays.cz/',
    website: 'updatedays.cz',
    type: 'collaboration',
  },
  {
    title: 'Meetupdate',
    img: '/images/references/meetupdate.avif',
    webURL: 'https://www.meetupdate.cz/',
    website: 'meetupdate.cz',
    type: 'collaboration',
  },
  {
    title: 'DotVVM',
    img: '/images/references/dotvvm.avif',
    webURL: 'https://www.dotvvm.com/',
    website: 'dotvvm.com',
    type: 'collaboration',
  },
  {
    title: 'Vila SCALA',
    img: '/images/references/vila-scala-cover.avif',
    webURL: 'https://www.vila-scala.cz/',
    website: 'vila-scala.cz',
    type: 'web',
  },
  {
    title: 'ANEW STYLE',
    img: '/images/references/anewstyle-2026-cover.avif',
    webURL: 'https://anewstyle.cz/',
    website: 'anewstyle.cz',
    type: 'web',
  },
  {
    title: 'Brand DESIGN',
    img: '/images/references/brand-design.avif',
    webURL: 'https://brand-design.cz/',
    website: 'brand-design.cz',
    type: 'web',
  },
  {
    title: 'Elendris',
    img: '/images/references/elendris.avif',
    webURL: 'https://elendris.cz/',
    website: 'elendris.cz',
    type: 'web',
  },
]
