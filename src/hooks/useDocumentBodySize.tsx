import { useEffect, useState } from 'preact/hooks'

// Define general type for useWindowSize hook, which includes width and height
export interface Size {
  width: number
  height: number
}

// Hook
export default function useDocumentBodySize(): Size {
  const [documentSize, setDocumentSize] = useState<Size>({
    width: document.body.clientWidth,
    height: document.body.clientHeight,
  })
  useEffect(() => {
    // Handler to call on document body resize
    const resizeObserver = new ResizeObserver((entries) =>
      setDocumentSize({
        width: entries[0].target.clientWidth,
        height: entries[0].target.clientHeight,
      }),
    )
    resizeObserver.observe(document.body)

    return () => resizeObserver.disconnect()
  }, []) // Empty array ensures that effect is only run on mount
  return documentSize
}
