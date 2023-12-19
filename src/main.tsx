import 'nprogress/nprogress.css'
import 'uno.css'
import './index.css'

import { render } from 'preact'

import { App } from './app'

render(<App />, document.getElementById('app') as HTMLElement)
