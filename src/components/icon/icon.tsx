import { component$ } from '@qwik.dev/core'
import type { IconProps } from './icon.types'
import portfolioData from './portfolio.json'

/**
 * Interface for the portfolio JSON structure
 */
interface PortfolioIcon {
  paths: string[]
  tags: string[]
  grid: number
}

interface PortfolioSelection {
  order: number
  name: string
  prevSize: number
}

interface PortfolioData {
  selection: PortfolioSelection[]
  icons: PortfolioIcon[]
}

/**
 * Helper function to parse portfolio.json and convert it to iconPaths format
 * @param data - The imported portfolio JSON data
 * @returns Record<string, string> - Icon name to SVG path mapping
 */
const parsePortfolioIcons = (data: PortfolioData): Record<string, string> => {
  const iconPaths: Record<string, string> = {}

  data.selection.forEach((selection, index) => {
    const iconData = data.icons[index]
    if (iconData && iconData.paths.length > 0) {
      const paths = iconData.paths.join(' ')
      iconPaths[selection.name] = paths
    }
  })

  return iconPaths
}

/**
 * Icon definitions map containing SVG paths for each icon
 */
const iconPaths: Record<string, string> = parsePortfolioIcons(
  portfolioData as PortfolioData,
)

/**
 * Icon component that renders inline SVG icons.
 * This component displays SVG icons using inline path definitions,
 * ensuring they work correctly on statically generated pages.
 *
 * @component
 * @param {IconProps} props - Component properties passed to the Qwik component.
 * @param {string} props.name - The name of the icon to display.
 * @param {string} [props.cls] - Optional CSS class to apply to the icon.
 * @param {string} [props.size] - Optional size for the icon (e.g., "1rem", "24px").
 * @param {string} [props.color] - Optional color for the icon.
 * @returns {JSX.Element} An SVG element containing the icon path.
 */
const Icon = component$<IconProps>(({ name, cls, size, color }) => {
  const classes = [
    `icon icon-${name}`,
    'aspect-square',
    'transition-colors duration-200',
    cls,
  ]
    .filter(Boolean)
    .join(' ')

  const iconPath = name ? iconPaths[name] : undefined

  const hasTailwindWidth = cls && /\b(w-\d+|w-\d+\/\d+)\b/.test(cls)

  if (!name || !iconPath) {
    console.warn(`Icon "${name}" not found`)
    return (
      <div
        class={classes}
        style={{
          '--icon_size': !hasTailwindWidth ? size : undefined,
          '--icon_color': color,
        }}
      />
    )
  }

  return (
    <svg
      class={classes}
      viewBox="0 0 1024 1024"
      role="img"
      aria-label={name}
      style={{
        '--icon_size': !hasTailwindWidth ? size : undefined,
        '--icon_color': color,
      }}>
      <path d={iconPath} />
    </svg>
  )
})

export default Icon
