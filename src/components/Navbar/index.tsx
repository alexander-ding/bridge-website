import './index.css'

import { useCallback } from 'preact/hooks'
import { NavLink } from 'react-router-dom'

import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme'
import Background from '../Background'

export function Navbar() {
  const [colorScheme, setColorScheme] = useColorScheme()

  const toggleTheme = useCallback(() => {
    if (colorScheme === ColorScheme.Dark) {
      setColorScheme(ColorScheme.Light)
    } else {
      setColorScheme(ColorScheme.Dark)
    }
  }, [colorScheme, setColorScheme])


  return (
    <header className='text-gray-700 dark:text-gray-200'>
      <Background />
      <nav className='nav'>
        <div className='spacer' />
        <div className='right'>
          <NavLink title='Report' to='/report'>
            <span className='lt-sm:display-none'>Report </span>
            <i className='i-ri-tools-line' />
          </NavLink>
          <NavLink title='Post Request' to='/post-request'>
            <span className='lt-sm:display-none'>Post Request </span>
            <i className='i-ri-flask-line' />
          </NavLink>
          <a
            title='Demo Video'
            target='_blank'
            href='https://www.youtube.com/watch?v=E2NQlRVIX6Q'
          >
            <i className='i-ri-youtube-line' />
          </a>
          <a
            title='GitHub'
            target='_blank'
            href='https://github.com/alexander-ding/bridge'
          >
            <i className='i-ri-github-line' />
          </a>
          <a
            title='Toggle theme'
            className='select-none'
            onClick={toggleTheme}
          >
            <i
              className={
                colorScheme === ColorScheme.Light
                  ? 'i-ri-sun-line'
                  : 'i-ri-moon-line'
              }
            />
          </a>
        </div>
      </nav>
    </header>
  )
}
