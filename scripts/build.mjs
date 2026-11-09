// Builds the plugin into dist/:
//   dist/code.js  – sandbox code (src/main/main.ts)
//   dist/ui.html  – UI with its CSS and bundled script inlined (Figma loads a single HTML string)
// Usage: node scripts/build.mjs [--watch]
import * as esbuild from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const watch = process.argv.includes('--watch')

// Figma's sandbox and UI iframe both support ES2020.
const common = { bundle: true, target: 'es2020', logLevel: 'info', legalComments: 'none' }

/** Inlines CSS and the UI bundle into the HTML shell. */
const inlineUi = {
  name: 'inline-ui',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return
      const script = result.outputFiles.find((f) => f.path.endsWith('.js')).text
      const [html, css] = await Promise.all([
        readFile(join(root, 'src/ui/index.html'), 'utf8'),
        readFile(join(root, 'src/ui/styles.css'), 'utf8'),
      ])
      // Function replacers: the bundle may contain `$&`-like sequences.
      const out = html
        .replace('/*__STYLE__*/', () => css)
        .replace('/*__SCRIPT__*/', () => script.replace(/<\/script/gi, '<\\/script'))
      await mkdir(dist, { recursive: true })
      await writeFile(join(dist, 'ui.html'), out)
    })
  },
}

const contexts = await Promise.all([
  esbuild.context({ ...common, entryPoints: [join(root, 'src/main/main.ts')], outfile: join(dist, 'code.js') }),
  esbuild.context({
    ...common,
    entryPoints: [join(root, 'src/ui/ui.ts')],
    outfile: join(dist, 'ui.js'),
    write: false,
    minify: !watch,
    plugins: [inlineUi],
  }),
])

if (watch) {
  await Promise.all(contexts.map((ctx) => ctx.watch()))
  console.log('Watching… (HTML/CSS changes: save ui.ts or restart to re-inline)')
} else {
  await Promise.all(contexts.map((ctx) => ctx.rebuild()))
  await Promise.all(contexts.map((ctx) => ctx.dispose()))
}
