import { useEffect, useRef } from 'preact/hooks'

const useAnimationFrame = (callback: (_: number) => void) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate: FrameRequestCallback = (time) => {
    if (previousTimeRef.current != undefined) {
      callback(time)
    }
    previousTimeRef.current = time
    requestRef.current = window.requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, []) // Make sure the effect runs only once
}

export default useAnimationFrame
