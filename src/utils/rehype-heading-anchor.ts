import type { Element, ElementContent, Root } from 'hast'
import { visit } from 'unist-util-visit'
import portfolioData from '../components/icon/portfolio.json'
import headingAnchorI18n from './rehype-heading-anchor.i18n.json'

/**
 * Supported heading tags that should receive a copy-link control.
 */
const COPYABLE_HEADING_TAGS = new Set(['h2', 'h3', 'h4', 'h5', 'h6'])

/**
 * Source SVG used for the copy-link icon.
 */
const HEADING_LINK_ICON = readHeadingLinkIcon()

/**
 * Icon selection entry in the portfolio icon JSON.
 */
interface PortfolioSelection {
  /** Icon name. */
  name: string
}

/**
 * Icon geometry entry in the portfolio icon JSON.
 */
interface PortfolioIcon {
  /** SVG paths used to render the icon. */
  paths: string[]
  /** Source icon grid size. */
  grid: number
}

/**
 * Portfolio icon data shape.
 */
interface PortfolioData {
  /** Ordered icon name definitions. */
  selection: PortfolioSelection[]
  /** Ordered SVG geometry definitions. */
  icons: PortfolioIcon[]
}

/**
 * Minimal shape of the vfile passed to a rehype transformer.
 */
interface RehypeVFile {
  /** Absolute path of the processed file, when available. */
  path?: string
  /** History of file paths, first entry is the original path. */
  history?: string[]
}

/**
 * Resolves the localized copy-link label from the processed MDX file path.
 * Paths containing an `/en/` segment resolve to English, everything else
 * resolves to Slovak. Returns null when the vfile path is unavailable.
 * @param file - vfile handed to the transformer by the rehype pipeline
 */
function resolveCopyLinkLabel(file?: RehypeVFile): string | null {
  const filePath = file?.path ?? file?.history?.[0]

  if (typeof filePath !== 'string' || filePath.length === 0) {
    return null
  }

  const normalizedPath = filePath.replace(/\\/g, '/')
  const locale = normalizedPath.includes('/en/') ? 'en' : 'sk'

  return headingAnchorI18n[locale].copyLink
}

/**
 * Rehype plugin that appends a copy-link control to copyable headings.
 * The copy-link title/aria-label locale is detected from the vfile path of
 * the processed MDX file; when no path is available on the vfile, the anchor
 * is emitted without title and aria-label attributes.
 */
export function rehypeHeadingAnchor() {
  return (tree: Root, file?: RehypeVFile) => {
    const copyLinkLabel = resolveCopyLinkLabel(file)

    visit(tree, 'element', (node: Element) => {
      if (!isCopyableHeading(node)) {
        return
      }

      const headingId = getHeadingId(node)
      if (!headingId) {
        return
      }

      const headingChildren = [...node.children]

      node.properties = appendClassName(node.properties, 'heading-with-anchor')
      node.children = [
        createHeadingTextNode(headingChildren),
        createHeadingCopyAnchor(headingId, copyLinkLabel),
      ]
    })
  }
}

/**
 * Returns whether the current node is a supported heading.
 */
function isCopyableHeading(node: Element): boolean {
  return COPYABLE_HEADING_TAGS.has(node.tagName)
}

/**
 * Reads the heading ID from the current heading node.
 */
function getHeadingId(node: Element): string | null {
  const headingId = node.properties?.id

  if (typeof headingId === 'string' && headingId.length > 0) {
    return headingId
  }

  return null
}

/**
 * Adds a class name to an existing HAST properties object.
 */
function appendClassName(
  properties: Element['properties'],
  className: string,
): Element['properties'] {
  const currentClassName = properties?.className
  const normalizedClassNames = Array.isArray(currentClassName)
    ? [...currentClassName]
    : typeof currentClassName === 'string'
      ? [currentClassName]
      : []

  if (!normalizedClassNames.includes(className)) {
    normalizedClassNames.push(className)
  }

  return {
    ...properties,
    className: normalizedClassNames,
  }
}

/**
 * Creates a wrapper node for the heading text content.
 */
function createHeadingTextNode(children: ElementContent[]): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: ['heading-anchor__text'],
    },
    children,
  }
}

/**
 * Creates the copy-link anchor that is appended to each heading.
 * @param headingId - Target heading ID
 * @param copyLinkLabel - Localized label, or null to omit title/aria-label
 */
function createHeadingCopyAnchor(
  headingId: string,
  copyLinkLabel: string | null,
): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: {
      href: `#${headingId}`,
      className: ['heading-anchor-copy'],
      dataCopyHeading: headingId,
      ...(copyLinkLabel
        ? { title: copyLinkLabel, ariaLabel: copyLinkLabel }
        : {}),
    },
    children: [createHeadingCopyIcon()],
  }
}

/**
 * Creates the inline SVG node used inside the copy-link anchor.
 */
function createHeadingCopyIcon(): Element {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['heading-anchor-copy__icon'],
      viewBox: HEADING_LINK_ICON.viewBox,
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ariaHidden: 'true',
      focusable: 'false',
    },
    children: HEADING_LINK_ICON.paths.map((pathValue) => ({
      type: 'element',
      tagName: 'path',
      properties: {
        d: pathValue,
        fill: 'currentColor',
      },
      children: [],
    })),
  }
}

/**
 * Reads the link icon source embedded in the portfolio icon JSON.
 */
function readHeadingLinkIcon(): { paths: string[]; viewBox: string } {
  const { selection, icons } = portfolioData as PortfolioData
  const linkIconIndex = selection.findIndex((icon) => icon.name === 'link')
  const linkIcon = icons[linkIconIndex]

  if (linkIconIndex === -1 || !linkIcon) {
    throw new Error('The "link" icon is missing from portfolio.json.')
  }

  return {
    paths: linkIcon.paths.map((pathValue) =>
      pathValue.replace(/\s+/g, ' ').trim(),
    ),
    viewBox: `0 0 ${linkIcon.grid} ${linkIcon.grid}`,
  }
}
