<script>
  import { onMount } from 'svelte';
  import BezierEasing from 'bezier-easing';
  import SAT from 'sat';
  import Picture from './picture.svelte';
  import { goto } from '$app/navigation';
  export let contents, globalSettings;

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  let header, checkbox;

  const scroll_duration = 400; //ms
  let abort_scroll = false;

  function smoothScroll(time, start_time, origin, destination) {
    if (time == start_time) {
      checked = false;
      requestAnimationFrame((time) => smoothScroll(time, start_time, origin, destination));
      return;
    }
    if (abort_scroll) {
      abort_scroll = false;
      return;
    }
    scrollTo({
      top:
        origin +
        (destination || origin * -1) * easeInOutCubic((time - start_time) / scroll_duration)
    });
    if (time - start_time > scroll_duration) return;
    requestAnimationFrame((time) => smoothScroll(time, start_time, origin, destination));
  }

  function triggerSmoothScroll(target) {
    if (target != 'top') {
      var targetElement = document.getElementById(target);
    }
    requestAnimationFrame((time) =>
      smoothScroll(
        time,
        time,
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
        target == 'top' ? 0 : targetElement.getBoundingClientRect().top - header.clientHeight
      )
    );
  }

  let client = false, checked = true;
  onMount(() => {
    client = true;
    setTimeout(() => {
      checked = false;
    }, 2000);
  });
  //Game unit starts here{
  const game = {
    engaged: false,
    startTime: null,
    lastTime: null,
    hit: false,
    wasHit: false,
    keysPressed: {
      w: false,
      a: false,
      s: false,
      d: false
    },
    command: [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a'
    ],
    commandsCount: 0,
    backgroundElement: null,
    debug: null,
    field: {
      width: 0,
      height: 0,
      origin: {
        x: null,
        y: null
      }
    },
    arrow: {
      element: null,
      svgElement: null,
      width: 0,
      height: 0,
      speed: 20,
      collision: null,
      x: 0,
      y: 0,
      r: 0,
      offset: {
        x: null,
        y: null
      }
    },
    obstacles: {
      lastAdded: null,
      interval: 500,
      duration: 2000,
      width: 200,
      height: 200,
      parent: null,
      elements: []
    },
    launch: {
      launching: false,
      launched: false,
      distance: 0,
      duration: 2000,
      turn: {
        turning: false,
        startTime: null,
        startPoint: {
          x: 0,
          y: 0
        },
        radius: 0
      }
    },

    customEasing: BezierEasing(0.25, -0.4, 0.75, 1),

    handleKeyDown: function (e) {
      if (game.engaged) {
        if (Object.keys(game.keysPressed).includes(e.key)) {
          game.keysPressed[e.key] = true;
          if (game.keysPressed.w && game.keysPressed.s) {
            switch (e.key) {
              case 'w':
                game.keysPressed.s = false;
                break;
              case 's':
                game.keysPressed.w = false;
                break;
            }
          }
          if (game.keysPressed.a && game.keysPressed.d) {
            switch (e.key) {
              case 'a':
                game.keysPressed.d = false;
                break;
              case 'd':
                game.keysPressed.a = false;
                break;
            }
          }
        }
      } else if (e.key == game.command[game.commandsCount] && checked) {
        if (++game.commandsCount == game.command.length) {
          requestAnimationFrame(game.init);
          game.engaged = true;
          game.backgroundElement.classList.add('shown');
        }
      } else game.commandsCount = 0;
    },

    init: function () {
      game.arrow.width = game.arrow.svgElement.getBoundingClientRect().width;
      game.arrow.height = game.arrow.svgElement.getBoundingClientRect().height;
      game.arrow.offset.x = game.arrow.svgElement.getBoundingClientRect().x;
      game.arrow.offset.y = game.arrow.svgElement.getBoundingClientRect().y;
      game.arrow.collision = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(),
        new SAT.Vector(game.arrow.width, game.arrow.height / 2),
        new SAT.Vector(0, game.arrow.height)
      ]);
      game.field.width = innerWidth;
      game.field.height = innerHeight;
      game.field.origin.x = game.field.width - game.arrow.x;
      game.field.origin.y = game.field.height / 2;
      game.launch.turn.radius = (game.field.height - game.arrow.offset.y) / 4;
      game.launch.turn.startPoint.x = -(
        game.field.width -
        (game.field.width - game.arrow.offset.x) * 2 -
        game.launch.turn.radius
      );
      game.launch.turn.startPoint.y = game.arrow.offset.y;
      game.launch.distance =
        game.launch.turn.radius * Math.PI + Math.abs(game.launch.turn.startPoint.x);
      game.obstacles.width = game.field.width / 7;
      game.obstacles.height = game.field.width / 7;
      requestAnimationFrame(game.update);
    },

    map_range: function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    },

    update: function (time) {
      game.wasHit = game.hit;
      game.hit = false;
      if (game.startTime == null) {
        game.startTime = time;
      }
      if (!game.launch.launched) {
        if (time - game.startTime < game.launch.duration) {
          if (!game.launch.turn.turning) {
            game.arrow.x = -(
              game.customEasing((time - game.startTime) / game.launch.duration) *
              game.launch.distance
            );
            if (game.arrow.x < game.launch.turn.startPoint.x) {
              game.launch.turn.turning = true;
              game.launch.turn.startTime = time;
            }
          } else {
            game.arrow.x =
              Math.cos(
                game.map_range(
                  game.customEasing((time - game.startTime) / game.launch.duration),
                  game.customEasing(
                    (game.launch.turn.startTime - game.startTime) /
                      game.launch.duration
                  ),
                  1,
                  0.5,
                  1.5
                ) * Math.PI
              ) *
                game.launch.turn.radius +
              game.launch.turn.startPoint.x;
            game.arrow.y =
              Math.sin(
                game.map_range(
                  game.customEasing((time - game.startTime) / game.launch.duration),
                  game.customEasing(
                    (game.launch.turn.startTime - game.startTime) /
                      game.launch.duration
                  ),
                  1,
                  0.5,
                  1.5
                ) * Math.PI
              ) *
                -game.launch.turn.radius +
              game.launch.turn.startPoint.y +
              game.launch.turn.radius;
            game.arrow.r = game.map_range(
              game.customEasing((time - game.startTime) / game.launch.duration),
              game.customEasing(
                (game.launch.turn.startTime - game.startTime) /
                  game.launch.duration
              ),
              1,
              0,
              -180
            );
          }
        } else {
          game.launch.launched = true;
          game.arrow.collision.translate(
            game.arrow.svgElement.getBoundingClientRect().x,
            game.arrow.svgElement.getBoundingClientRect().y
          );
        }
      } else {
        const delta = (game.arrow.speed * (time - game.lastTime)) / 60;
        if (game.keysPressed.w) {
          const deltaFixed =
            delta -
            (game.arrow.collision.calcPoints[0].y - delta < 0 ? game.arrow.speed : 0);
          game.arrow.y -= deltaFixed;
          game.arrow.collision.translate(0, -deltaFixed);
        }
        if (game.keysPressed.a) {
          const deltaFixed =
            delta -
            (game.arrow.collision.calcPoints[0].x - delta < 0 ? game.arrow.speed : 0);
          game.arrow.x -= deltaFixed;
          game.arrow.collision.translate(-deltaFixed, 0);
        }
        if (game.keysPressed.s) {
          const deltaFixed =
            delta -
            (game.arrow.collision.calcPoints[2].y + delta > game.field.height
              ? game.arrow.speed
              : 0);
          game.arrow.y += deltaFixed;
          game.arrow.collision.translate(0, deltaFixed);
        }
        if (game.keysPressed.d) {
          const deltaFixed =
            delta -
            (game.arrow.collision.calcPoints[1].x + delta > game.field.width
              ? game.arrow.speed
              : 0);
          game.arrow.x += deltaFixed;
          game.arrow.collision.translate(deltaFixed, 0);
        }
        if (game.obstacles.lastAdded == null)
          game.obstacles.lastAdded = time - game.obstacles.interval;
        if (time - game.obstacles.lastAdded >= game.obstacles.interval) {
          const obstacle = {};
          obstacle.element = document.createElement('div');
          obstacle.element.classList.add('game-obstacle');
          obstacle.element.style.setProperty('--gameFieldWidth', game.field.width + 'px');
          obstacle.element.style.setProperty('--width', game.obstacles.width + 'px');
          obstacle.element.style.setProperty('--height', game.obstacles.height + 'px');
          obstacle.angle = Math.random() * 360 - 180;
          obstacle.element.style.setProperty('--angle', obstacle.angle + 'deg');
          obstacle.rotation = Math.random() * 360 * 4 - 360 * 2;
          obstacle.element.style.setProperty('--rotation', obstacle.rotation + 'deg');
          obstacle.startY =
            Math.random() * (game.field.height + game.obstacles.height) -
            game.obstacles.height / 2;
          obstacle.element.style.setProperty('--StartY', obstacle.startY + 'px');
          obstacle.endY =
            Math.random() * (game.field.height + game.obstacles.height) -
            game.obstacles.height;
          obstacle.element.style.setProperty('--EndY', obstacle.endY + 'px');
          obstacle.element.style.setProperty('--duration', game.obstacles.duration + 'ms');
          obstacle.collision = new SAT.Box(
            new SAT.Vector(game.field.width, obstacle.startY),
            game.obstacles.width,
            game.obstacles.height
          ).toPolygon();
          obstacle.collision.translate(
            -game.obstacles.width / 2,
            -game.obstacles.height / 2
          );
          obstacle.collision.rotate(-1 * obstacle.angle * (Math.PI / 180));
          obstacle.collision.translate(
            game.obstacles.width / 2,
            game.obstacles.height / 2
          );
          game.obstacles.lastAdded = time;
          obstacle.addedAt = time;
          obstacle.destroyAt = time + game.obstacles.duration;
          game.obstacles.parent.appendChild(obstacle.element);
          game.obstacles.elements.push(obstacle);
        }
        game.obstacles.elements.forEach((v) => {
          if (time > v.destroyAt) {
            v.element.remove();
            game.obstacles.elements = game.obstacles.elements.filter((w) => w !== v);
          }
        });
        game.obstacles.elements.forEach((v) => {
          const transformRatio = (time - v.addedAt) / game.obstacles.duration;
          const timePassed = time - game.lastTime;
          v.collision.setOffset(
            new SAT.Vector(
              -transformRatio * (game.field.width + game.obstacles.width),
              transformRatio * (v.endY - v.startY)
            )
          );
          v.collision.translate(-game.obstacles.width / 2, -game.obstacles.height / 2);
          v.collision.rotate(-timePassed * v.rotation);
          v.collision.translate(game.obstacles.width / 2, game.obstacles.height / 2);
          const tmp = game.hit;
          game.hit =
            (SAT.testPolygonPolygon(v.collision, game.arrow.collision, new SAT.Response()) ||
              game.hit) &&
            !game.wasHit;
          if (game.hit && !tmp) {
            v.element.style.backgroundColor = '#f00';
          }
        });
      }
      game.lastTime = time;
      checked = true;
      requestAnimationFrame(game.update);
    }
  }
</script>

<svelte:window
  on:keydown={game.handleKeyDown}
  on:keyup={(e) => {
    if (Object.keys(game.keysPressed).includes(e.key)) game.keysPressed[e.key] = false;
  }}
/>

<header
  bind:this={header}
  style="--itemsCount: {contents.items.length};"
  class="{client && checked ? 'checked' : ''} {game.engaged ? 'game' : ''}"
>
  <Picture
    click={() =>
      location.pathname == '/'
        ? triggerSmoothScroll('top')
        : goto("/")}
    title="クリックすると{client && location.pathname == '/'
      ? 'ページの先頭'
      : 'トップページ'}に移動します"
    imageId={contents.imageId}
    width={contents.aspectRatio.width}
    height={contents.aspectRatio.height}
  />
  <input
    type="checkbox"
    class="ui_button header_button_checkbox"
    name="header_button_checkbox"
    id="header_button_checkbox"
    bind:checked={checked}
  />
  <label
    for="header_button_checkbox"
    class="header_button {client && checked ? 'checked' : ''}"
    title="クリックするとナビゲーションを開閉できます"
  >
    <div
      class="header_button_svg-wrapper"
      style="--arrow-x:{game.arrow.x}px;--arrow-y:{game.arrow.y}px;--arrow-r:{game
        .arrow.r}deg;"
      bind:this={game.arrow.element}
    >
      <svg class="header_button_svg" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"
          bind:this={game.arrow.svgElement}
          stroke="#444"
        />
      </svg>
    </div>
  </label>
  <nav class="header_navigation">
    <label for="header_button_checkbox" class="header_navigation_close_button">
      <span class="header_navigation_close_button_text">
        <span class="break-scope">ナビゲーション</span>を<span class="break-scope">閉じる</span>
      </span>
      <svg class="header_navigation_close_button_svg" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
        />
      </svg>
    </label>
    <div
      class="header_close_area"
      on:click={() => (checked = false)}
      on:touchstart={() => (checked = false)}
    />
    {#each contents.items as item}
      <div class="header_navigation_list_items" on:click={() => triggerSmoothScroll(item.id)}>
        {item.label}
      </div>
    {/each}
    <div class="header_button_dummy">
      <svg class="header_button_svg" viewBox="0 0 24 24" fill="white" />
    </div>
  </nav>
</header>
<div
  class="game-background"
  bind:this={game.backgroundElement}
  style="--bg: {game.hit ? '#f73f22' : '#000'}"
/>
<div bind:this={game.obstacles.parent} />

<!-- <div class="game-debug">{game.debug ? JSON.stringify(game.debug) : ''}</div> -->
<style lang="stylus">
:root
  --base-size calc(3.5rem)
  --base-size-vw 1vw
  --navigation-width 70vw
  --ui-bg #FFF
  --ui-bg-hover #fff
  --ui-bg-focus #333
  --ui-over-text-color #000
  --ui-over-bg #222
  --ui-over-bg-hover #888
  --ui-over-text-hover-color #000
  --ui-text-color #FFF
  --ui-text-hover-color #000

vendor(prop, args)
  {prop} args
  -webkit-{prop} args
  -moz-{prop} args

vendorarg(prop, arg)
  {prop} arg
  {prop} -webkit-+arg
  {prop} -moz-+arg

.break-scope
  display inline-block
  white-space nowrap

header
  position fixed
  top calc(var(--base-size) / 2 + env(safe-area-inset-top))
  @media screen and (orientation: portrait)
    top calc(var(--base-size) / 6 + env(safe-area-inset-top))
    transition-property: top width margin border-radius overflow
    transition-duration: 0.3s
    transition-timing-function: ease
    &.checked
      top: env(safe-area-inset-top)
      width:100%
      margin: 0 "max(0%, 0%)" % null 0 "max(0%, 0%)" % null
      border-radius: 0 0 0 calc(var(--base-size) / 2)
  display flex
  align-items center
  @media screen and (orientation: landscape)
    &:not(.game)
      overflow: hidden
  justify-content space-between
  transform translateZ(999999999px)
  width: "min(90%, calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right)))" % null
  margin: 0 "max(5%, env(safe-area-inset-right))" % null 0 "max(5%, env(safe-area-inset-left))" % null
  padding 0 0 0 calc(var(--base-size) / 2)
  border-radius: calc(var(--base-size) / 2)
  height var(--base-size)
  box-sizing border-box
  background-color var(--ui-bg)
  color var(--text-color)
  @media (prefers-color-scheme: dark)
    background-color var(--ui-bg)
    color var(--text-color)
  z-index 1000

  :global(img)
    width auto
    height calc(var(--base-size) * 0.75)
    background-color #fff0
    cursor pointer
    z-index 7000

  :global(picture)
    z-index 7000

// .game-debug
//   position fixed
//   background-color #fff8
//   z-index 10000000

.game-background
  position fixed
  z-index 10
  opacity 0
  pointer-events none
  height 100vh
  width 100%
  background-color var(--bg)
  transition opacity 1s ease 1s

:global(.game-background.shown)
  opacity 0.5 !important

:global(.game-obstacle)
  position fixed
  z-index 20000
  pointer-events none
  width var(--width)
  height var(--height)
  background-color #fff
  top 0
  right 0
  transform translateX(var(--width)) rotate(var(--angle))
  animation move-obstacle var(--duration) linear both

@keyframes -global-move-obstacle
  from
    transform translate(var(--width), var(--StartY)) rotate(var(--angle))
  to
    transform translate(calc(var(--gameFieldWidth) * -1), var(--EndY)) rotate(calc(var(--rotation) + var(--angle)))

.header_button
  margin 0
  position fixed
  top 0
  right 0
  z-index 7000
  border none
  box-sizing border-box
  border-radius: 0 calc(var(--base-size) / 2) calc(var(--base-size) / 2) 0
  height var(--base-size)
  display inline-flex
  align-items center
  justify-content center
  background-color #444
  cursor pointer
  @media screen and (orientation: portrait)
    transition: border-radius 0.3s ease
    &.checked
      border-radius: 0 0 0 0
  @media screen and (orientation: landscape)
    &:hover
      background-color #555

.header_button_dummy
  margin 0
  z-index 6000
  border none
  box-sizing border-box
  border-radius: 0 calc(var(--base-size) / 2) calc(var(--base-size) / 2) 0
  cursor pointer
  height var(--base-size)
  display inline-flex
  align-items center
  justify-content center
  background-color var(--ui-over-bg)
  @media screen and (orientation: portrait)
    display none

.header_button, .header_button_dummy
  padding: 0 calc(var(--base-size) / 2) 0 calc(var(--base-size) / 2)

#header_button_checkbox:checked ~ .header_button
  padding: 0 calc(var(--base-size) / 2) 0

.header_button_svg-wrapper
  display flex
  justify-content center
  align-items center
  height 100%
  z-index 8000
  transform translate(var(--arrow-x), var(--arrow-y)) rotate(var(--arrow-r))

.header_button_svg
  margin auto 0
  height 60%
  transform translate(0, -2%)
  z-index 8000
  fill white
  pointer-events none
  animation-name derotate_svg
  animation-duration 200ms
  animation-timing-function ease-out
  animation-delay 200ms
  animation-fill-mode both

.header_close_area
  display none
  position absolute
  background-color transparent
  cursor pointer
  height 100%
  width 100%
  left -100%
  top 0

.header_button_checkbox
  display none

.header_navigation
  display flex
  width var(--navigation-width)
  z-index 6000
  font-size var(--base-size-vw)
  position fixed
  top 0
  right 0
  background-color var(--ui-over-bg)
  opacity: 1
  @media screen and (orientation: portrait)
    flex-direction column
    width 50vw
    font-size calc(var(--base-size) / 3)
    height 100vh
  @media screen and (orientation: landscape)
    border-radius: calc(var(--base-size) / 6) calc(var(--base-size) / 2) calc(var(--base-size) / 2) calc(var(--base-size) / 6)
  animation-name fold_navigation
  animation-duration 200ms
  animation-timing-function ease-out
  animation-fill-mode both

.header_navigation_list_items
  display block
  width 100%
  background-color transparent
  cursor pointer
  height var(--base-size)
  line-height var(--base-size)
  margin 0
  padding 0
  border none
  text-align center
  color var(--ui-text-color)

  @media screen and (orientation: portrait)
    &:nth-last-child(2):after
      content ''
      position absolute
      display block
      background-color var(--ui-text-color)
      height 1px
      left calc(50vw * 0.05)
      transform translate(0, calc(100% - 1px))
      width calc(50vw * 0.9)

  &:hover
    background-color var(--ui-over-bg-hover)

  &+&:not(:nth-child(2)):before
    content ''
    position absolute
    display block
    background-color var(--ui-text-color)
    @media screen and (orientation: landscape)
      width 1px
      top calc(var(--base-size) * 0.1)
      transform translate(-0.5px, 0)
      height calc(var(--base-size) * 0.8)
    @media screen and (orientation: portrait)
      height 1px
      left calc(50vw * 0.05)
      transform translate(0, -0.5px)
      width calc(50vw * 0.9)

.header_navigation_close_button
  display flex
  align-items center
  cursor pointer
  margin 0
  line-height calc(var(--base-size) / 2)
  font-weight normal
  box-sizing border-box
  color var(--ui-text-color)
  &:hover
    background-color #ccc
    & .header_navigation_close_button_svg
      fill #ff0200
  @media screen and (orientation: landscape)
    border-radius: calc(var(--base-size) / 6) 0 0 calc(var(--base-size) / 6)
    padding 0 1ch 0
  @media screen and (orientation: portrait)
    height var(--base-size)
    padding-left 1.5ch
    border-bottom solid 1px

.header_navigation_close_button_text
  display flex
  align-items center
  @media screen and (orientation: portrait)
    display none

.header_navigation_close_button_svg
  height 60%
  z-index 8000
  fill white
  transition fill 150ms ease-in-out 0s
  @media screen and (orientation: landscape)
    display none

#header_button_checkbox:checked ~ .header_navigation
  animation-name expand_navigation
  animation-duration 200ms
  animation-timing-function ease-out
  animation-delay 100ms
  animation-fill-mode both
  & .header_close_area
    display block

#header_button_checkbox:checked ~ .header_button svg
  animation-name rotate_svg
  animation-duration 150ms
  animation-timing-function ease-in
  animation-delay 0ms
  animation-fill-mode both

#header_button_checkbox:checked ~ .header_button
  @media screen and (orientation: landscape)
    transition-delay 150ms

@keyframes rotate_svg
  0%
    transform rotate(45deg)
  100%
    transform rotate(270deg)

@keyframes derotate_svg
  0%
    transform rotate(270deg)
  100%
    transform rotate(45deg)

@media screen and (orientation: landscape)
  @keyframes expand_button
    0%
      transform translate(0, 0)
    100%
      transform translate(calc(var(--navigation-width) * -1), 0)

  @keyframes fold_button
    0%
      transform translate(calc(var(--navigation-width) * -1), 0)
    100%
      transform translate(0, 0)

  @keyframes expand_navigation
    0%
      transform translate(100%, 0%)
      opacity: 0
    100%
      transform translate(0%, 0%)
      opacity: 1

  @keyframes fold_navigation
    0%
      transform translate(0%, 0%)
      opacity: 1
    100%
      transform translate(100%, 0%)
      opacity: 0

@media screen and (orientation: portrait)
  @keyframes expand_navigation
    0%
      transform translate(100%, 0%)
      opacity: 0
    100%
      transform translate(0%, 0%)
      opacity: 1

  @keyframes fold_navigation
    0%
      transform translate(0%, 0%)
      opacity: 1
    100%
      transform translate(100%, 0%)
      opacity: 0
</style>
