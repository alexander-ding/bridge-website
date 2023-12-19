import { FunctionalComponent } from 'preact'
import { Link } from 'react-router-dom'

import Footer from '../components/Footer'

/**
 * Write a short description of this component here...
 */
const NotFoundPage: FunctionalComponent = () => {
  return (
    <div className='prose m-auto'>
      <h1>404</h1>
      <p>Oops! We couldn't find the page you're looking for.</p>
      <Link to='/'>cd ..</Link>
      <Footer />
    </div>
  )
}

export default NotFoundPage
