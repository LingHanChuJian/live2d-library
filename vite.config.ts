import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import banner from 'vite-plugin-banner'

import { replace, startCase } from 'lodash-unified'
import { name, version, description, author } from './package.json'

export function getRootPath(...dir: string[]) {
    return resolve(process.cwd(), ...dir)
}

const info = `/**\n * name: ${name}\n * version: v${version}\n * description: ${description}\n * author: ${author.name}\n * Copyright 2021-present\n * Released under the MIT License.\n */`

export default defineConfig({
    build: {
        target: 'es2018',
        outDir: 'dist',
        sourcemap: true,
        lib: {
            entry: getRootPath('packages', 'index.ts'),
            formats: ['umd', 'es', 'cjs'],
            name: replace(startCase(name), /\s/g, ''),
            fileName: format => `live2d_library.${format}.min.js`
        },
    },
    plugins: [
        banner(info),
        dts({ outputDir: 'typings' })
    ]
})
