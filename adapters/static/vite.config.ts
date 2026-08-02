import { qwikVite } from '@qwik.dev/core/optimizer'
import { ssgAdapter } from '@qwik.dev/router/adapters/ssg/vite'
import { qwikRouter } from '@qwik.dev/router/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { rehypeHeadingAnchor } from '../../src/utils/rehype-heading-anchor'
import { rehypeShiki } from '../../src/utils/rehype-shiki'

export default defineConfig({
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
    ssgAdapter({
      origin: 'https://lukaschylik.dev',
      maxWorkers: 1,
    }),
  ],
  build: {
    ssr: true,
    target: 'esnext',
    rollupOptions: {
      input: ['@qwik-router-config'],
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    exclude: [],
  },
})
