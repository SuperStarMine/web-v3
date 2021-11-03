import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify';
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin.js';
import importAssets from 'svelte-preprocess-import-assets';
import { sequence } from './src/sequence.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sequence([preprocess(), importAssets()]),
  kit: {
    vite: {
      plugins: [
        precompileIntl('locales') // if your translations are defined in /locales/[lang].json
      ]
    },
    adapter: netlify(),
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte'
  }
};

export default config;
