export interface ReferenceProps {
  title: string
  webURL?: string
  website?: string
  type?: string
  /** Path to the website preview screenshot shown in the hover circle */
  img?: string
  /** CSS object-position that keeps the site name inside the preview circle */
  imgPosition?: string
}
