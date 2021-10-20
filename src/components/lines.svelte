<script lang="ts">
  /** 半角スペースで分割した文字列 */
  export let string = ""
</script>

{#each string.split(" ") as chunk}
  <span>{chunk}</span>
{/each}

<style lang="stylus">
  span
    display: inline-block
</style>
