import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import removeAttr from 'remove-attr';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
    define: {
        'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        __DEV__: process.env.NODE_ENV === 'development',
    },
    plugins: [
        vue(),
        vueJsx(),
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
