<script context="module">
  import { addMessages, init } from 'svelte-intl-precompile';
  import ja from '$locales/ja.js';
  import en from '$locales/en.js';
  addMessages('ja', ja);
  addMessages('en', en);
  init({
    initialLocale: 'ja',
    fallbackLocale: 'ja'
  });
</script>
<script lang="ts">
  import { locale } from 'svelte-intl-precompile';
  $locale = "en"
</script>
<slot/>
