<script>
  import Cframe from "../components/common-frame.svelte";
  import Nheader from "../components/nav-header.svelte";
  import Hero from "../components/hero.svelte";
  import Static from "../components/static-content.svelte";
  import Dlist from "../components/date-list.svelte";
  import Footer from "../components/footer.svelte";
  import Cards from "../components/cards.svelte";
  import { settings } from "../toppageSettings.js";
  import { globalSettings } from '../globalSettings.js';
  import Button from '../components/button.svelte';
</script>

<Nheader contents={settings.find(v => v.sectionType == 'navHeader').contents} {globalSettings}/>
<main>
  <Hero />
  <article>
    <div class="title">
      <h2>GAMES</h2><h3>作品紹介</h3>
    </div>
    </article>
</main>

<style lang="stylus">
// :root

// @media screen and (max-width 680px)

vendor(prop, args)
  -webkit-{prop} args
  -moz-{prop} args
  {prop} args

vendorarg(prop, arg)
  {prop} -webkit-+arg
  {prop} -moz-+arg
  {prop} arg
// ########################################
:global(html, body, main, #svelte)
  margin 0
  width 100%
  height 100%
  background: black
  vendor(text-size-adjust, 100%)
  font-family -apple-system, 'BlinkMacSystemFont', 'Hiragino Kaku Gothic ProN', 'メイリオ', 'Helvetica Neue', 'Helvetica', 'Arial', system-ui, sans-serif

:global(a)
  text-decoration: none

:global(.heavy)
  font-weight 900

:global(.regular)
  font-weight 400

:global(.break-scope)
  display inline-block

:global(.em-text)
  background-color: var(--bg-color)
  color: var(--fg-color)
  display: inline-block

:global(h2.em-text)
  margin:0.3em 0

:global(.pc-hide)
  @media screen and (min-width 600px)
    display none

:global(.mobile-hide)
  @media screen and (max-width 600px)
    display none

article
  background-color: #F8F9FB
  .title
    font-size: 3em
    @media screen and (orientation: portrait)
      font-size: 2.5em

    h2, h3
      margin: 0
      display: inline-block

    h3
      font-size: calc(1em * 14 / 12)
    &:before
      content: ''
      display: inline-block
      width: 1ch
      height: 3em
      @media screen and (orientation: portrait)
        height: 2.5em
      background-color: red
</style>
