// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@nuxt/image',
  ],
  ssr: false,

  devtools: { enabled: true },

  runtimeConfig: {
    // AI Provider Selection
    AI_PROVIDER: process.env.AI_PROVIDER || 'openai', // 'openai' or 'azure'

    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    // Azure OpenAI Configuration
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    preset: 'vercel',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables.scss" as *;',
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        indent: 2,
        semi: true,
        quotes: 'single',
      },
    },
  },
});
