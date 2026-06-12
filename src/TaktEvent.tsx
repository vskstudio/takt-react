'use client'

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { useTaktEvent, type TaktEventParams } from './useTaktEvent'

type ClickableProps = { onClick?: (e: MouseEvent) => void; ref?: Ref<unknown> }

// React 19 exposes the child ref as a regular prop; React 18 carries it on the
// element. Read props.ref first to avoid React 19's `element.ref` deprecation.
function childRef(child: ReactElement<ClickableProps> & { ref?: Ref<unknown> }): Ref<unknown> | undefined {
  return child.props.ref ?? child.ref
}

function setRef<T>(ref: Ref<T> | undefined, value: T): void {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as { current: T }).current = value
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>): (value: T) => void {
  return (value) => refs.forEach((ref) => setRef(ref, value))
}

/**
 * Declarative click tracking around a single child element:
 * `<TaktEvent name="Signup"><button>…</button></TaktEvent>`. Composes the
 * child's existing `onClick`; tracks through the active instance. Forwards an
 * incoming `ref` onto the child, composing with any ref the child already has.
 */
export const TaktEvent = forwardRef<unknown, TaktEventParams & { children: ReactNode }>(
  function TaktEvent({ children, ...params }, ref) {
    const { onClick } = useTaktEvent(params)
    if (!isValidElement<ClickableProps>(children)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[takt] <TaktEvent> expects a single React element child; tracking is disabled.',
        )
      }
      return children
    }
    const child = children as ReactElement<ClickableProps> & { ref?: Ref<unknown> }
    return cloneElement(child, {
      ref: composeRefs(ref, childRef(child)),
      onClick: (e: MouseEvent) => {
        child.props.onClick?.(e)
        onClick()
      },
    })
  },
)

TaktEvent.displayName = 'TaktEvent'
