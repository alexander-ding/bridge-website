import { FunctionalComponent } from 'preact'

import useDocumentBodySize from '../../hooks/useDocumentBodySize'
import useWindowSize from '../../hooks/useWindowSize'

const Footer: FunctionalComponent = () => {
  const windowSize = useWindowSize()
  const documentSize = useDocumentBodySize()
  return (
    <footer className='mt-10 mb-6 opacity-50 flex flex-row'>
      <div className='inline-block flex-auto'>
        Built with ❤️ by{' '}
        <a
          target='_blank'
          href='https://alexding.me'
        >
          Alex Ding
        </a>,{' '}
        <a
          target='_blank'
          href='https://github.com/L1Z3'
        >Elizabeth Jones
        </a>, and{' '}
        <a
          target='_blank'
          href='https://willykidd.github.io/'
        >Weili Shi
        </a>.
      </div>
      {
        documentSize.height > windowSize.height ? (
          <div className='justify-self-end self-center'>
            <a
              className='cursor-pointer flex-nowrap lt-sm:border-b-0!'
              title='Back to top'
              onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}
            >
              <span
                className='lt-sm:display-none'
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                Back to Top{' '}
              </span>
              <i className='i-ri-arrow-up-s-line' />
            </a>
          </div>
        ) : null
      }
    </footer >
  )
}

export default Footer
