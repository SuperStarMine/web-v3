<svelte:head>
  <title>{meta.title}</title>
  <link rel="stylesheet" href="https://use.typekit.net/lkm8uks.css" />
  <meta property="og:title" content={meta.title} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={meta.url} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:site_name" content="SUPER STARMINE" />
  <meta property="og:image" content={meta.image} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@necromance_chan" />
  <script
    async
    src="https://platform.twitter.com/widgets.js"
    charset="utf-8"
  ></script>
</svelte:head>

<script>
  import Line from "../components/necromance/line.svelte";
  const meta = {
    lang: 'ja',
    title: 'れーぞく！ネクロマンスちゃん - SUPER STARMINE',
    url: 'https://superstarmine.com/necromance',
    description: '「セカイを”れーぞく”せよ！」──最凶の魔女ネクロマンスとともに魔女伝説の謎を解き明かすべく戦う、全方位シューティングゲーム「れーぞく！ネクロマンスちゃん」の公式サイトです。',
    image: 'https://next.superstarmine.com/img/necromance_ogp.png',
    canonical: 'https://superstarmine.com/necromance',
  };
  </script>

<nav class="nav">
  <div class="nav__left">
    <a href="/">
      <img class="nav__logo" alt="サークルロゴ" src="../assets/img/necromance/ssm_logo_color_white.png" />
    </a>
  </div>
  <div class="nav__right">
    <div class="nav__menu-button" style="display:none;">
      <svg style="width:40px;height:40px" viewBox="0 0 24 24">
        <path
          fill="#56449A"
          d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
        />
      </svg>
    </div>
  </div>
</nav>
<section class="section hero-section">
  <div class="hero-section__elements-wrapper">
    <div class="hero-section__elements">
      <img
        class="hero-section__layer01"
        src="../assets/img/necromance/keyvisual/01.png"
        alt="キービジュアル01"
      />
      <img
        class="hero-section__layer03"
        src="../assets/img/necromance/keyvisual/03.png"
        alt="キービジュアル03"
      />
      <img
        class="hero-section__layer04"
        src="../assets/img/necromance/keyvisual/04.png"
        alt="キービジュアル04"
      />
      <img
        class="hero-section__layer05"
        src="../assets/img/necromance/keyvisual/05.png"
        alt="キービジュアル05"
      />
      <img
        class="hero-section__layer06"
        src="../assets/img/necromance/keyvisual/06.png"
        alt="キービジュアル06"
      />
      <img
        class="hero-section__layer07"
        src="../assets/img/necromance/keyvisual/07.png"
        alt="キービジュアル07"
      />
      <img
        class="hero-section__layer08"
        src="../assets/img/necromance/keyvisual/08.png"
        alt="キービジュアル08"
      />
      <img
        class="hero-section__layer09"
        src="../assets/img/necromance/keyvisual/09.png"
        alt="キービジュアル09"
      />
      <img
        class="hero-section__layer10"
        src="../assets/img/necromance/keyvisual/10.png"
        alt="キービジュアル10"
      />
      <img
        class="hero-section__layer11"
        src="../assets/img/necromance/keyvisual/11.png"
        alt="キービジュアル11"
      />
      <img
        class="hero-section__layer12"
        src="../assets/img/necromance/keyvisual/12.png"
        alt="キービジュアル12"
      />
      <img
        class="hero-section__layer02"
        src="../assets/img/necromance/keyvisual/02.png"
        alt="キービジュアル02"
      />
      <img
        class="hero-section__logo"
        src="../assets/img/necromance/ぞくロマロゴ_Ver3.png"
        alt="ロゴ"
      />
    </div>
  </div>
  <div class="hero-section__shape-divider">
    <svg
      viewBox="0 0 1280 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;bottom:0"
    >
      <path
        d="M342.816 63.56C404.683 74.35 464.587 93.69 526.283 105.42C614.165 122.14 705.685 123.15 793.429 105.81C878.699 89 967.115 48 1051.37 27.17C1126.09 8.69 1207.67 1.08 1280 24.17V120H0V92.65C109.297 53.7958 227.854 43.7355 342.816 63.56Z"
        fill="#56449A"
      />
    </svg>
  </div>
</section>
<main class="main">
  <section class="section movie-section">
    <div class="content">
      <div class="movie-section__video-wrapper">
        <iframe
          class="movie-section__iframe"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/jLoTKRXC-X0"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </div>
  </section>
  <section class="section news-section">
    <div class="content">
      <div class="heading">
        <h2>News</h2>
        <span>ニュース</span>
      </div>
      <ul class="news-section__list">
        <li class="news-item">
          <time class="news-item__date" datetime="2020-09-27">2021/09/27</time>
          <p class="news-item__heading">公式サイトをリニューアルしました！</p>
          <p class="news-item__text">新しいサイトを宜しくお願いします！</p>
        </li>
        <li class="news-item">
          <a href="https://youtu.be/c9WYyPyVM18?t=165">
            <time class="news-item__date" datetime="2020-09-27">2021/06/05</time
            >
            <p class="news-item__heading">
              INDIE Live Expo 2021にてご紹介いただきました！
            </p>
            <p class="news-item__text">
              リンク先のYouTube動画でぜひご確認ください！
            </p>
          </a>
        </li>
        <li class="news-item">
          <a href="https://www.4gamer.net/games/999/G999905/20201228102/">
            <time class="news-item__date" datetime="2020-12-19">2020/12/19</time
            >
            <p class="news-item__heading">
              ゲームクリエイター甲子園2020にて総合大賞3位、審査員特別賞、話題賞を受賞しました！
            </p>
            <p class="news-item__text">詳細はリンク先の記事をご覧ください！</p>
          </a>
        </li>
      </ul>
    </div>
  </section>
  <section class="section world-section">
    <div class="content">
      <div class="heading">
        <h2>World</h2>
        <span>ワールド</span>
      </div>
      <div class="world-section__block01">
        <div class="filled-sentence">
          <Line align="left" slideIn="left" string="伝承の時代から 幾星霜──" />
          <Line
            align="left"
            slideIn="left"
            string="何人も寄りつかぬ 険阻な山々に囲まれた 広大な樹林、 “フレーダーマオスの森”。"
          />
          <Line
            align="left"
            slideIn="left"
            string="屈強な木々が生い茂る その森には、 だれもが怖じ恐れる 妖女が棲むという 言伝がある。"
          />
          <Line
            align="left"
            slideIn="left"
            string="彼の者は人々に、 畏怖を込めて こう呼ばれた── “魔女”と。"
          />
        </div>
        <div class="world-section__block01__img">
          <img src="../assets/img/necromance/enemies.png" alt="敵" />
        </div>
      </div>
      <div style="height: 80px;" />
      <div class="world-section__block02">
        <div class="world-section__block02__img">
          <img src="../assets/img/necromance/necromance_doya.png" alt="ドヤ顔のネクロマンスちゃん" />
        </div>
        <div class="filled-sentence">
          <Line
            align="right"
            slideIn="right"
            string="そんな魔女伝説の調査のため、 森を訪れた 民俗学者のあなた。"
          />
          <Line
            align="right"
            slideIn="right"
            string="しかし現れたのは、 『自称』天才魔女の 女の子！？"
          />
          <Line
            className="text--necro"
            align="right"
            slideIn="right"
            string="アンタ、 魔女にキョーミ あるんでしょ？"
          />
          <Line
            className="text--necro"
            align="right"
            slideIn="right"
            string="いいわ、アタシが連れて ってあげる！"
          />
          <Line
            align="right"
            slideIn="right"
            string="謎の少女と学者は 魔女伝説の全容を 明らかにするため、 魔物うごめく 森の奥を目指す──"
          />
        </div>
      </div>
    </div>
  </section>
  <section class="section characters-section">
    <div class="content">
      <div class="heading heading--center">
        <h2>CHARACTERS</h2>
        <span>キャラクター</span>
      </div>
      <div class="character">
        <div class="character__contents">
          <div class="character__figure">
            <img
              src="../assets/img/necromance/Necromance_smile_alpha_shadow.png"
              alt="笑顔のネクロマンスちゃん"
            />
          </div>
          <div class="character__description">
            <h3 class="character__spell">NECROMANCE</h3>
            <p class="character__name">ネクロマンス</p>
            <p class="character__intro">
              胸元と頭のリボンがトレードマークの女の子。<br />
              14歳くらいに見える。<br />
              尊大な態度とそれに不釣り合いな体躯で、学者の前に現れる。<br />
              とある魔女を恨み、復讐を誓っているらしいが——。<br />
            </p>
          </div>
        </div>
      </div>
      <p class="characters-section__more">
        さらに個性豊かなキャラクターが続々登場！
      </p>
    </div>
  </section>
  <section class="section system-section">
    <div class="content">
      <div class="heading">
        <h2>SYSTEM</h2>
        <span>ゲームシステム</span>
      </div>
      <br />
      <img src="../assets/img/necromance/system_01.png" width="500px" alt="ゲームシステム説明イラスト01" />
      <p class="system-section__text">敵弾をスレスレで避けて“れーぞく”！</p>
      <img src="../assets/img/necromance/system_02.png" width="500px" alt="ゲームシステム説明イラスト02" />
      <p class="system-section__text">スキルを発動してステージを攻略しよう！</p>
      <img src="../assets/img/necromance/system_03.png" width="500px" alt="ゲームシステム説明イラスト03" />
      <p class="system-section__text">ステージの最後には凶悪な魔物が！</p>
    </div>
  </section>
  <section class="section discord-section">
    <div class="content">
      <div class="heading">
        <h2>DISCORD</h2>
        <span>ディスコード</span>
      </div>
      <div class="filled-sentence">
        <Line
          align="center"
          slideIn="left"
          string="Discordの公式コミュニティー では 開発陣より情報を 先行公開中！"
        />
        <Line
          align="center"
          slideIn="left"
          string="参加して最新情報を ゲットしよう！"
        />
      </div>
      <a
        class="button button--discord"
        style="margin-top: 60px;"
        href="https://discord.gg/FvZvX8gEDx"
      >
        サーバーに参加する
      </a>
    </div>
  </section>
  <section class="section twitter-section">
    <div class="content">
      <p class="twitter-section__followText">Twitterもフォローしてね！</p>
      <a
        class="twitter-timeline"
        data-width="400"
        data-height="400"
        data-chrome="noheader nofooter noborders"
        href="https://twitter.com/necromance_chan?ref_src=twsrc%5Etfw"
        >Tweets by necromance_chan</a
      ><br />
      <a
        class="button button--twitter"
        style="margin-top: 60px;"
        href="https://twitter.com/necromance_chan"
      >
        Twitter をフォローする
      </a>
    </div>
  </section>
</main>
<div class="share-section">
  <div class="share-section__dialogue">
    <img
      class="share-section__mini-necromance"
      src="../assets/img/necromance/mini_necromance.png"
      alt="ミニネクロマンスちゃん"
    />
    <img
      class="share-section__text"
      src="../assets/img/necromance/please_share_text.png"
      alt="シェアしなさいよね！"
    />
  </div>
  <div class="share-section__share-buttons">
    <a
      class="share-section__button--twitter"
      href="https://twitter.com/intent/tweet?text=%E3%82%8C%E3%83%BC%E3%81%9E%E3%81%8F%E5%85%A8%E6%96%B9%E4%BD%8DSTG%E3%80%8E%E3%82%8C%E3%83%BC%E3%81%9E%E3%81%8F%EF%BC%81%E3%83%8D%E3%82%AF%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%A1%E3%82%83%E3%82%93%E3%80%8F%E5%85%AC%E5%BC%8F%E3%82%B5%E3%82%A4%E3%83%88%20https%3A%2F%2Fsuperstarmine.com%2Fnecromance%2F%20%23%E3%81%9E%E3%81%8F%E3%83%AD%E3%83%9E%20%23%E3%82%8C%E3%83%BC%E3%81%9E%E3%81%8F%E3%83%8D%E3%82%AF%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%A1%E3%82%83%E3%82%93%20%40necromance_chan%E3%82%88%E3%82%8A%20"
    >
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"
        />
      </svg>
    </a>
    <a
      class="share-section__button--facebook"
      href="https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=https%3A%2F%2Fsuperstarmine.com%2Fnecromance%2F&display=popup&ref=plugin&src=share_button"
    >
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
        />
      </svg>
    </a>
  </div>
</div>
<footer class="footer">
  <div class="content">
    <img
      class="footer__circle-logo"
      src="../assets/img/necromance/ssm_logo_color_black.png"
      alt="サークルロゴ"
    />
    <p class="footer__copyright">
      &copy; 2021 HIBIKI CUBE, かずえもん, スーパースターマイン
    </p>
    <hr class="footer__divider" />
    <p class="footer__license">
      このWebサイトのソースコードは Mozilla Public License 2.0ライセンス
      の下で提供されており <a href="https://github.com/SuperStarMine/web-v3"
        >GitHub</a
      >
      から入手して利用できます。<br />
      The source code of this web site is licensed under a Mozilla Public License
      2.0 and available at
      <a href="https://github.com/SuperStarMine/web-v3">GitHub</a>.
    </p>
    <p class="footer__license">
      全てのソースコード以外の画像や動画などのリソースは
      クリエイティブ・コモンズ 表示 - 改変禁止 4.0 国際 ライセンス
      の下に提供されています。<br />
      All non-source code resources such as images and videos are licensed under
      a Creative Commons Attribution-NoDerivatives 4.0 International License.
    </p>
  </div>
</footer>

<style lang="scss">
@import "../assets/css/necromance/reset.css";
@import "../assets/css/necromance/main.scss";
</style>