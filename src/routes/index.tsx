import { component$ } from '@qwik.dev/core'
import { About, Contact, References, Services, Stats } from '~/sections'

export default component$(() => {
  return (
    <>
      <About />
      <Stats />
      <References />
      <Services />
      <Contact />
    </>
  )
})
