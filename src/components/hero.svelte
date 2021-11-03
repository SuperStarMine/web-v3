<script lang="ts">
  import Picture from './picture.svelte';
  import Lines from './lines.svelte';
  import Button from './button.svelte';
  import { t } from 'svelte-intl-precompile';
</script>

<div class="wrapper">
  <Picture imageId="foh7rj5YI_E"/>
  <div class="content" style="--bg-color: #F7931E; --fg-color: #FFF">
    <span class="em-text">{$t('necromance.subtitle')}</span>
    <h2 class="em-text">
      <Lines string="{$t('necromance.title')}" />
    </h2>
    <p class="description">
      <Lines string="{$t('necromance.description')}" />
    </p>
    <Button target="necromance">{$t('hero.button')}</Button>
  </div>
</div>

<style lang="stylus">

  .wrapper
    --buttonColor: #0A6AFA
    position: relative
    height: "min(90%, 90vh)" % null
    :global(img)
      height: 100%
      width: 100%
      filter: blur(0.1vw)
      object-fit: cover

  @media screen and (orientation: landscape)
    .em-text
      font-size: 2vw
      h2&
        font-size: 3vw

  .content
    position: absolute
    padding: calc(50vh + env(safe-area-inset-top)) calc(var(--base-size) / 2 + env(safe-area-inset-right)) calc(var(--base-size) / 2) calc(var(--base-size) / 2 + env(safe-area-inset-left))
    bottom: 0
    height: 100%
    width: 100%
    display flex
    flex-direction: column
    justify-content: flex-end
    align-items: flex-start
    background: linear-gradient(to right, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0))
    @media screen and (orientation: portrait)
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0))
    box-sizing: border-box
    // padding: calc(var(--base-size) / 2)

  .description
    color: #FFF
    @media screen and (orientation: landscape)
      width: 40%
</style>
