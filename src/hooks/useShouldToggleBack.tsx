import { signal } from '@preact/signals'
import { useCallback } from 'preact/hooks'
const shouldToggleBack = signal(false)

function useShouldToggleBack(): [boolean, (_: boolean) => void] {
  const setShouldToggleBack = useCallback(
    (newShouldToggleBack: boolean) => {
      shouldToggleBack.value = newShouldToggleBack
    },
    [shouldToggleBack],
  )
  return [shouldToggleBack.value, setShouldToggleBack]
}

export default useShouldToggleBack
