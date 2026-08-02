import { component$ } from '@qwik.dev/core'
import { About, Contact, References, Services, Stats } from '~/sections'

export default component$(() => {
  return (
    <>
      <Stats />
      <About />
      <References />
      <Services />
      <Contact />
    </>
  )
})
