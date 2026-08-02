import socialI18n from '~/components/social/social.i18n.json'

/**
 * Default (Slovak) social link labels sourced from the social i18n dictionary.
 * Locale-aware components should resolve labels via the dictionary directly.
 */
const defaultLabels = socialI18n.sk.links

/**
 * Shared social media links configuration
 * Used across multiple components for consistency
 */
export const SOCIAL_LINKS = [
  {
    href: 'https://www.linkedin.com/in/lukas-chylik/',
    label: defaultLabels.linkedin,
    icon: 'linkedin',
  },
  {
    href: 'https://discord.gg/yXfUhRjx',
    label: defaultLabels.discord,
    icon: 'discord',
  },
  {
    href: 'https://codepen.io/luko248',
    label: defaultLabels.codepen,
    icon: 'codepen',
  },
  {
    href: 'https://github.com/Luko248',
    label: defaultLabels.github,
    icon: 'github',
  },
] as const
