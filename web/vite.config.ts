import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import removeAttr from 'remove-attr';

// https://vite.dev/config/
export default defineConfig({
    define: {
        'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        __DEV__: process.env.NODE_ENV === 'development',
    },
    plugins: [
        vue(),
        vueDevTools(),
        process.env.NODE_ENV === 'production'
            ? removeAttr({
                  extensions: ['vue', 'js', 'ts', 'html'],
                  attributes: ['data-test'],
              })
            : null,
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
