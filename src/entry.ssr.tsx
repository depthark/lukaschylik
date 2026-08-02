/**
 * WHAT IS THIS FILE?
 *
 * SSR renderer function, used by Qwik Router.
 *
 * Note that this is the only place the Qwik renderer is called.
 * On the client, containers resume and do not call render.
 */
import { createRenderer } from '@qwik.dev/router'
import Root from './root'

export default createRenderer((opts) => {
  return {
    jsx: <Root />,
    options: {
      ...opts,
      containerAttributes: {
        lang: 'sk',
        ...opts.containerAttributes,
      },
    },
  }
})
