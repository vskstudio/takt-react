import { useResolveTakt, type TaktInstance } from './store'
import { noopTakt } from './noop'

/** Returns the live Takt instance provided by `<Takt>`, or a never-throwing no-op. */
export function useTakt(): TaktInstance {
  return useResolveTakt() ?? noopTakt()
}
