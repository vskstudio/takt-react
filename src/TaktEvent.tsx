'use client'

import { Children, cloneElement, isValidElement, type MouseEvent, type ReactElement } from 'react'
import { useTaktEvent, type TaktEventParams } from './useTaktEvent'

type ClickableProps = { onClick?: (e: MouseEvent) => void }

/**
 * Declarative click tracking around a single child element:
 * `<TaktEvent name="Signup"><button>…</button></TaktEvent>`. Composes the
 * child's existing `onClick`; tracks through the active instance.
 */
export function TaktEvent({ children, ...params }: TaktEventParams & { children: ReactElement }) {
  const { onClick } = useTaktEvent(params)
  const child = Children.only(children)
  if (!isValidElement<ClickableProps>(child)) return child
  return cloneElement(child, {
    onClick: (e: MouseEvent) => {
      child.props.onClick?.(e)
      onClick()
    },
  })
}
