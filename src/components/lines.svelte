<script lang="ts">
  import { locale } from 'svelte-intl-precompile';
  /** 半角スペースで分割した文字列 */
  export let string = ""
</script>

{#if $locale == "en"}
  <span>{string}</span>
{:else}
  {#each string.split(" ") as chunk}
    <span>{chunk}</span>
  {/each}
{/if}

<style lang="stylus">
  span
    display: inline-block
</style>
