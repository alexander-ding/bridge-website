import { FunctionalComponent } from 'preact'
import { Suspense } from 'preact/compat'
import { useEffect } from 'preact/hooks'
import { Outlet, useLocation } from 'react-router-dom'

import LazyLoad from '../components/LazyLoad'
import { Navbar } from '../components/Navbar'

const WithLayout: FunctionalComponent = () => {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <>
      <Navbar />
      <Suspense fallback={<LazyLoad />}>
        <main className='px-7 py-8'>
          <Outlet />
        </main>
      </Suspense>
    </>
  )
}

export default WithLayout
