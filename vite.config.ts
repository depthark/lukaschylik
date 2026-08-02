/**
 * Base Vite configuration for Qwik application with SSR support
 */

import { fileURLToPath } from 'node:url'
import { qwikVite } from '@qwik.dev/core/optimizer'
import { qwikRouter } from '@qwik.dev/router/vite'
import { defineConfig, type UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
import { rehypeHeadingAnchor } from './src/utils/rehype-heading-anchor'
import { rehypeShiki } from './src/utils/rehype-shiki'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

const { dependencies = {}, devDependencies = {} } = pkg as PackageJson
errorOnDuplicatesPkgDeps(devDependencies, dependencies)

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      qwikRouter({
        mdxPlugins: {
          remarkGfm: false,
          rehypeSyntaxHighlight: false,
          rehypeAutolinkHeadings: false,
        },
        mdx: {
          rehypePlugins: [rehypeShiki, rehypeHeadingAnchor],
        },
      }),
      qwikVite(),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    optimizeDeps: {
      exclude: [],
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    server: {
      headers: {
        'Cache-Control': 'public, max-age=0',
      },
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  }
})

/**
 * Validates that dependencies are not duplicated between devDependencies and dependencies
 * @param devDeps - Development dependencies
 * @param deps - Production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDeps: Record<string, string>,
  deps: Record<string, string>,
) {
  let msg = ''

  const duplicateDeps = Object.keys(devDeps).filter((dep) => deps[dep])

  const qwikPkg = Object.keys(deps).filter((value) => /qwik/i.test(value))

  msg = `Move qwik packages ${qwikPkg.join(', ')} to devDependencies`

  if (qwikPkg.length > 0) {
    throw new Error(msg)
  }

  msg = `
    Warning: The dependency "${duplicateDeps.join(', ')}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `

  if (duplicateDeps.length > 0) {
    throw new Error(msg)
  }
}
