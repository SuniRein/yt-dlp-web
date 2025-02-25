import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import pluginPinia from 'eslint-plugin-pinia';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginVue from 'eslint-plugin-vue';

export default [
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },

    {
        name: 'app/files-to-ignore',
        ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },

    ...pluginVue.configs['flat/essential'],
    ...vueTsEslintConfig(),

    {
        ...pluginVitest.configs.recommended,
        files: ['src/**/__tests__/*'],
    },
    skipFormatting,

    pluginPinia.configs['recommended-flat'],

    {
        plugins: { 'simple-import-sort': simpleImportSort },
        rules: {
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        [`^@vue/test-utils$`, `^vitest$`],
                        [`^vue$`, `^vue-router$`, `^pinia$`],
                        [`^naive-ui`, `^@vicons`],
                        [`^@/App.vue$`, `^@/components`],
                        [`^@/dev`],
                        [`^@/router`],
                        [`^@/types`],
                        [`^@/store`],
                        [`^@/utils`],
                        [`^[^.]`],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
        },
    },
];
