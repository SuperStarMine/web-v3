<script>
  export let target = "", disabled = false, Class = "", targetEvent = "";
  // let isAnchor = RegExp("\/").test(target);
  // if(targetEvent){
  //   let event = new window.CustomEvent(targetEvent);
  //   target = function(){
  //     document.dispatchEvent(event);
  //   }
  // }
</script>

<a href="{!disabled ? target : 'javascript:void(0);'}" class="{Class}" {disabled}><slot></slot></a>

<!-- {#if isAnchor}
  <a href="{!disabled ? target : 'javascript:void(0);'}" class="{Class}" {disabled}><slot></slot></a>
  {:else}
  <button on:click={!disabled ? target : 'javascript:void(0);'} class="{Class}"{disabled}><slot></slot></button>
{/if} -->

<style lang="stylus">
  a, button
    margin: 0
    padding: 0 4ch
    position: relative
    box-sizing: border-box
    border solid 0.15em var(--buttonColor)
    font-size: calc(1em * 14 / 12)
    font-weight: bold
    line-height: 2em
    border-radius: 2em
    color: var(--buttonColor)
    background-color: white
    transition filter 300ms ease-out 0ms
    filter none
    z-index: 1
    &:after
      content: ''
      position: absolute
      top: calc((2em - 0.6em) / 2)
      right: 1em
      display: block
      width: calc(0.6em - 3px * 2)
      height: calc(0.6em - 3px * 2)
      border solid 0.15em var(--buttonColor)
      border-color: var(--buttonColor) var(--buttonColor) transparent transparent
      transform: rotate(45deg)
    &:hover
      filter brightness(0.8)
    &:disabled
      &:hover
        filter none
        cursor not-allowed
</style>