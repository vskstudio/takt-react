import { type IframeHTMLAttributes } from 'react'
import { embedUrl, type EmbedTheme, type WidgetLang } from '@vskstudio/takt-core'

export interface TaktEmbedProps extends Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'src'> {
  /** Site identifier; selects which dashboard to embed. */
  domain: string
  /** Color theme. */
  theme?: EmbedTheme
  /** UI language. */
  lang?: WidgetLang
  /** Override the Takt host the page is served from. */
  host?: string
}

export function TaktEmbed({
  domain,
  theme,
  lang,
  host,
  width = 404,
  height = 264,
  title = 'takt',
  style,
  ...rest
}: TaktEmbedProps) {
  return (
    <iframe
      src={embedUrl(domain, { host, theme, lang })}
      width={width}
      height={height}
      title={title}
      loading="lazy"
      style={{ border: 0, ...style }}
      {...rest}
    />
  )
}

TaktEmbed.displayName = 'TaktEmbed'
