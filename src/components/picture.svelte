<script lang="ts">
  import { onMount } from 'svelte';
  import { sync } from '../sync-store.js';
  import { globalSettings } from '../globalSettings.js';
  export let
    imageId = "",
    sizes = "100vw",
    alt = `${imageId}${imageId != "" ? "の" : ""}画像`,
    width = "",
    height = "",
    click: svelte.JSX.EventHandler = null,
    title = "画像",
    useTiny = false,
    loadLazy = true,
    groupId = "",
    groupImagesCount: Number = null,
    imageDirectory = globalSettings.imageDirectory,
    imageExtensionsShort = globalSettings.imageExtensionsShort,
    imageSizes = globalSettings.imageSizes,
    tinyImageExtensionsShort = globalSettings.tinyImageExtensionsShort,
    tinyImageSize = globalSettings.tinyImageSize;
  let loading = true;
  onMount(() => {
    addEventListener('load', () => loading = false);
  });

  function resolveSrcsets(imageDirectory, imageExtensionsShort, imageSizes, imageId, loading, tinyImageExtensionsShort, tinyImageSize) {
    return (loading && useTiny ? tinyImageExtensionsShort : imageExtensionsShort).map(ext => {
      if(loading && useTiny){
        return `${imageDirectory}${imageId}@${tinyImageSize}w.${ext} ${tinyImageSize}w`
      }else{
        return imageSizes.map(size => `${imageDirectory}${imageId}@${size}w.${ext} ${size}w`);
      }
    });
  }

  function getSafeImageExtensionIndex(imageExtensionsShort) {
    return imageExtensionsShort.findIndex(i => i == "jpg" || i == "png") || 0;
  }

  function loadEventDispatcher(groupId, groupImagesCount) {
    if(groupId){
      $sync.loadImagesCount[groupId] = $sync.loadImagesCount[groupId] > 0 ? $sync.loadImagesCount[groupId] + 1 : 1;
      if($sync.loadImagesCount[groupId] >= groupImagesCount && !$sync.loadEventDispatched){
        window.dispatchEvent(new CustomEvent('pictureGroup_load', {detail: groupId}));
        $sync.loadEventDispatched = true;
      }
    }
  }
</script>

{#if imageExtensionsShort.includes('svg')}
  <picture on:click={click} {title}>
    <img src="{imageDirectory}{imageId}.svg" {alt} {width} {height} loading={loadLazy ? 'lazy' : 'eager'} on:load={() => loadEventDispatcher(groupId, groupImagesCount)}>
  </picture>
{:else}
  <picture on:click={click} {title}>
    {#each imageExtensionsShort.filter(v => v != 'svg') as ext, i}
      <source type="image/{ext}" {sizes} srcset="{resolveSrcsets(imageDirectory, imageExtensionsShort, imageSizes, imageId, loading, tinyImageExtensionsShort, tinyImageSize)[i]}">
    {/each}
    <img {sizes} srcset="{resolveSrcsets(imageDirectory, imageExtensionsShort, imageSizes, imageId, loading, tinyImageExtensionsShort, tinyImageSize)[getSafeImageExtensionIndex(imageExtensionsShort.filter(v => v != 'svg'))]}" {alt} {width} {height} loading={loadLazy ? 'lazy' : 'eager'} on:load={() => loadEventDispatcher(groupId, groupImagesCount)}>
  </picture>
{/if}

<style lang="stylus">
  img
    vertical-align: top
</style>