import { lazy } from 'preact/compat'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import WithLayout from './pages/WithLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const PostRequestPage = lazy(() => import('./pages/PostRequestPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<WithLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/report' element={<ReportPage />} />
          <Route path='/post-request' element={<PostRequestPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
