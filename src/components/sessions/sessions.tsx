import { $, component$ } from '@qwik.dev/core'
import type { DocumentHead } from '@qwik.dev/router'
import Container from '~/components/container/container'
import Section from '~/components/section/section'
import SectionTitle from '~/components/section/section.title'
import { SESSION_VIDEO_SOURCES } from '~/constants/sessions'
import { getLocaleFromPathname, useLocale } from '~/i18n'
import { cls } from '~/utils'
import i18n from './sessions.i18n.json'

/**
 * Escapes text for use inside an HTML attribute or element body.
 * @param text - Raw text
 */
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Builds a lightweight `srcdoc` placeholder for a YouTube embed: a thumbnail
 * with a play link that swaps in the privacy-enhanced player on click, so no
 * YouTube scripts or cookies load until the visitor asks for the video.
 * @param src - Original YouTube embed URL
 * @param title - Video title
 * @param playLabel - Accessible label of the play link
 */
const youTubeFacade = (src: string, title: string, playLabel: string) => {
  const id = new URL(src).pathname.split('/').pop() ?? ''
  const player = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const label = escapeHtml(`${playLabel}: ${title}`)
  return `<style>html,body{height:100%;margin:0;background:#000}a{position:relative;display:block;height:100%}img{width:100%;height:100%;object-fit:cover}span{position:absolute;inset:0;margin:auto;width:68px;height:48px;border-radius:12px;background:#f00;opacity:.9}span::after{content:'';position:absolute;inset:0;margin:auto;width:0;height:0;border-style:solid;border-width:10px 0 10px 18px;border-color:transparent transparent transparent #fff;translate:3px 0}a:hover span,a:focus-visible span{opacity:1}a:focus-visible{outline:3px solid #a855f7;outline-offset:-3px}</style><a href='${player}' aria-label='${label}'><img src='${thumb}' alt='' loading='lazy'><span></span></a>`
}

/**
 * Document head for the sessions routes; locale derived from the URL so a
 * single export serves both /sessions and /en/sessions.
 */
export const head: DocumentHead = ({ url }) => {
  const t = i18n[getLocaleFromPathname(url.pathname)]

  return {
    title: t.headTitle,
    meta: [
      {
        name: 'description',
        content: t.headDescription,
      },
    ],
  }
}

/**
 * Locale-aware sessions page listing all conference and meetup talk
 * recordings in a three-column grid with Picture-in-Picture support.
 * Shared by the sk (/sessions) and en (/en/sessions) routes.
 */
const Sessions = component$(() => {
  const t = i18n[useLocale()]

  const openPiP = $((event: MouseEvent) => {
    const button = (event.target as HTMLElement).closest('button[data-pip]')
    if (!button) return

    const wrapper = button.parentElement
    if (!wrapper) return

    const iframe = wrapper.querySelector('iframe')
    if (!iframe) return

    if (!('documentPictureInPicture' in window)) {
      return
    }

    ;(window as any).documentPictureInPicture
      .requestWindow({ width: 640, height: 360 })
      .then((pipWindow: any) => {
        pipWindow.document.head.innerHTML = `<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;width:100%;height:100vh}iframe{width:100%;height:100%;border:none}</style>`

        const placeholder = document.createElement('div')
        placeholder.className = iframe.className
        placeholder.style.cssText =
          'display:flex;align-items:center;justify-content:center;color:#888;font-size:14px;font-family:monospace'
        placeholder.textContent = t.pipPlaceholder
        wrapper.insertBefore(placeholder, iframe)

        pipWindow.document.body.append(iframe)

        pipWindow.addEventListener('pagehide', () => {
          placeholder.replaceWith(iframe)
        })
      })
  })

  return (
    <Section id="sessions" centerContent={false}>
      <Container size="md">
        <SectionTitle text={t.title} />
        <p
          class={cls(
            'content-fade-in',
            'text-sm lg:text-base 3xl:text-lg',
            'leading-relaxed font-light',
            'mb-8 md:mb-12',
            'text-gray-800 dark:text-gray-300',
            'font-mono text-pretty',
            'max-w-[70ch]',
          )}>
          {t.intro}
        </p>
        <ul class="content-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 list-none p-0 m-0">
          {SESSION_VIDEO_SOURCES.map((src, index) => (
            <li key={src} class="relative group grid gap-3" onClick$={openPiP}>
              <iframe
                class="w-full aspect-video block rounded-lg overflow-clip border-2 border-black dark:border-white"
                loading="lazy"
                width="560"
                srcdoc={youTubeFacade(src, t.videos[index], t.play)}
                title={t.videos[index]}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullscreen></iframe>
              <p class="font-mono text-xs md:text-sm leading-relaxed text-gray-800 dark:text-gray-300 m-0">
                {t.videos[index]}
              </p>
              <button
                type="button"
                data-pip
                aria-label={t.pipButton}
                title={t.pipButton}
                class="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <rect x="11" y="9" width="10" height="7" rx="1" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
})

export default Sessions
