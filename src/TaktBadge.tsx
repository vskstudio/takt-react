import { type ImgHTMLAttributes } from 'react'
import { badgeUrl, type BadgeVariant, type BadgeGlyph, type WidgetLang } from '@vskstudio/takt-core'

export interface TaktBadgeProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Site identifier; selects which badge to render. */
  domain: string
  /** Badge layout variant. */
  variant?: BadgeVariant
  /** Leading glyph. */
  glyph?: BadgeGlyph
  /** Caption language. */
  lang?: WidgetLang
  /** Override the Takt host the SVG is served from. */
  host?: string
}

export function TaktBadge({ domain, variant, glyph, lang, host, alt = 'takt', ...rest }: TaktBadgeProps) {
  return (
    <img
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
      src={badgeUrl(domain, { host, variant, glyph, lang })}
    />
  )
}

TaktBadge.displayName = 'TaktBadge'
