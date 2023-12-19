import nProgress from 'nprogress'
import { FunctionalComponent } from 'preact'
import { useEffect } from 'preact/hooks'

const LazyLoad: FunctionalComponent = () => {
  useEffect(() => {
    nProgress.start()

    return () => {
      nProgress.done()
    }
  })

  return null
}

export default LazyLoad
