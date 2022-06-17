import fs from 'fs/promises'
import path from 'path'
import type { DepOptimizationOptions } from 'vite'
import type { Options } from '.'

type EsbuildOptions = NonNullable<DepOptimizationOptions['esbuildOptions']>
type EsbuildPlugin = NonNullable<EsbuildOptions['plugins']>[number]

// List of options that changes the prebundling result
const PREBUNDLE_SENSITIVE_OPTIONS: (keyof Options)[] = [
  'template',
  'script',
  'style',
  // TODO: Is this safe to serialize to JSON?
  'compiler'
]

export function esbuildVuePlugin(option: Options): EsbuildPlugin {
  return {
    name: 'vue',
    setup(build) {
      // build.onLoad({ filter: /.vue$/ }, () => {
      //   // TODO
      // })
    }
  }
}

/**
 * @returns Whether the Vue metadata has changed
 */
export async function saveVueMetadata(
  cacheDir: string,
  options: Options
): Promise<boolean> {
  const vueMetadataPath = path.resolve(cacheDir, `_vue_metadata.json`)
  const currentVueMetadata = generateVueMetadata(options)

  let existingVueMetadata: string | undefined
  try {
    existingVueMetadata = await fs.readFile(vueMetadataPath, 'utf8')
  } catch {
    // ignore
  }

  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(vueMetadataPath, currentVueMetadata)
  return currentVueMetadata !== existingVueMetadata
}

function generateVueMetadata(options: Options) {
  const metadata: Record<string, any> = {}
  for (const key of PREBUNDLE_SENSITIVE_OPTIONS) {
    metadata[key] = options[key]
  }
  return JSON.stringify(metadata, (_, v) => {
    return typeof v === 'function' ? v.toString() : v
  })
}
