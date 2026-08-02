import type { LinkProps } from '@qwik.dev/router'

export interface NavigationLinkProps extends LinkProps {
  icon?: string
}

export interface NavigationProps {
  small?: boolean
  links?: NavigationLinkProps[]
}
