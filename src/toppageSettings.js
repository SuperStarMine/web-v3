export const settings = [
  {
    sectionType: 'navHeader',
    themeColor: '#fff',
    contents: {
      imageId: 'ssm-logo-landscape',
      aspectRatio: { width: 157213, height: 60041 },
      imageExtensionsShort: ['svg'],
      items: [
        {id: 'top', label: '作品'},
        {id: 'news', label: 'ニュース'},
        {id: 'about', label: 'チームについて'},
        {id: 'members', label: 'メンバー'}
      ]
    }
  },
  {
    sectionType: 'slideHero',
    pairId: 'hero',
  },
  {
    sectionType: 'slideDesc',
    pairId: 'hero',
    isParent: true,
    contents: {
      articles: [
        {
          title: 'れーぞく！ネクロマンスちゃん',
          subtitle: 'れーぞく全方位シューティングゲーム',
          themeColor: '#ed773e',
          imageId: 'necromance_ss',
          alt: 'れーぞく！ネクロマンスちゃんのプレイ画面',
          aspectRatio: {width: 16, height: 9},
          description: [
            'スーパースターマイン第一作目のSTG。',
            '敵弾をスレスレでかわすことで強大な必殺技をブッ放せる、という『れーぞくシステム』を搭載。リスクとリターンの取捨選択に手に汗握る、白熱したバトルを楽しめる。',
            'ストーリーや世界観をこだわり抜き、カットイン映像やボイス付きシナリオパートといったリッチな表現にも挑戦。',
            'ゲームクリエイター甲子園2020にて総合大賞3位、審査員特別賞、話題賞受賞。コミックマーケット97、デジゲー博2020に出展。',
            'Boothにて体験版を配信中。'
          ],
          buttons: [
            {
              popup: '今すぐアクセス',
              title: '公式サイトに行く',
              target: '/necromance/',
              spaMode: true
            }
          ],
          slides: [
            {
              type: 'youtube',
              id: 'foh7rj5YI_E'
            }
          ],
          specs: {
            times: [
              {
                year: '2019',
                month: '8',
                annotation: '〜',
              }
            ],
            platforms: [
              {
                name: 'Windows',
                version: '7',
                orLater: true
              },
              {
                name: 'macOS',
                version: 'Sierra',
                orLater: true
              }
            ]
          }
        },
        {
          title: 'SPINNER',
          subtitle: '新感覚ホッケーアクションゲーム',
          themeColor: '#464646',
          imageId: 'spinner_ss',
          alt: 'SPINNERのプレイ画面',
          aspectRatio: {width: 16, height: 9},
          description: [
            'ハンドルコントローラーを用いて戦う1vs1のホッケーゲーム。',
            'ゴールがなく、パックが端のラインを超えると対となるラインにワープするという仕様が特徴。',
            'GCGEXPO2019にて総合優勝。',
            '2020年2月に開催され、200名近くの業界人が参加したゲーム業界年始あいさつ会では体験会を開催し、プロクリエイターの方々から建設的なフィードバックをいただいた。'
          ],
          buttons: [
            {
              title: '紹介記事を読む',
              target: 'https://game.creators-guild.com/g4c/%e3%82%b2%e3%83%bc%e3%83%a0%e6%a5%ad%e7%95%8c%e4%ba%a4%e6%b5%81%e4%bc%9a%e3%81%ab%e6%bd%9c%e5%85%a5%ef%bc%81/'
            }
          ],
          specs: {
            times: [
              {
                year: '2019',
                month: '11',
                annotation: '(2週間)',
              }
            ],
            platforms: [
              {
                name: 'Windows',
                version: '7',
                orLater: true
              },
              {
                name: 'macOS',
                version: 'Sierra',
                orLater: true
              }
            ]
          }
        },
        {
          title: 'CUPRUNMEN',
          subtitle: 'VRMタイムアタックランゲーム',
          themeColor: '#b56c4e',
          imageId: 'cup-run_ss',
          alt: 'CUPRUNMENのプレイ画面',
          aspectRatio: {width: 16, height: 9},
          description: [
            '初となるフルリモート体制で制作したランゲーム。',
            '技術的にユニークな点として、「プレイヤーの向きとステージの法線ベクトルから溢れるスープ量を算出する」という処理を行っている。',
            'また、ローカルのVRMアバターをゲームに用いるという試みを行った。',
            'ニコニコネット超会議超ハッカソンに出展。'
          ],
          buttons: [
            {
              popup: '今すぐプレイ',
              title: [
                'unityroomで',
                '遊ぶ'
              ],
              target: 'https://unityroom.com/games/cuprunmen'
            }
          ],
          slides: [
            {
              type: 'youtube',
              id: 'm44wTn8nk9Y'
            }
          ],
          specs: {
            times: [
              {
                year: '2020',
                month: '4',
                annotation: '(5日)',
              }
            ],
            platforms: [
              {
                name: 'WebGL'
              }
            ]
          }
        },
        {
          title: 'フォーリンパフェ',
          subtitle: 'パフェ積みアクションゲーム',
          themeColor: '#4ae0ef',
          imageId: 'fall_in_parfait-ss1',
          alt: 'フォーリンパフェのプレイ画面',
          aspectRatio: {width: 16, height: 9},
          description: [
            '2020年8月に開催されたUnity1Weekで制作したゲーム。',
            '『上から落ちてくる材料を器でキャッチしてパフェを作る』というシンプルな操作性ながら、パフェを大きくなるにつれて爆弾に当たりやすくなる、オンラインランキングの実装といった工夫により、上級者にとってもやり込みがいのあるゲームとなった。',
            '一番の特長は『フォトモード』で、プレイヤーは自分の作ったパフェを撮影してTwitterに投稿することができる。',
            'ゲームデザインの中にマーケティングの視点を持ち込んだ、ゲーム“商品”としての草分け的な作品となった。',
            'Unity1Weekゲームジャムにて約500作品中総合部門46位、絵作り部門35位獲得。',
            'デベロッパーズゲームコンテスト2020にて企業賞受賞。',
            '福岡ゲームコンテスト2021、Ohayoo Casual Game Contestに出展。'
          ],
          buttons: [
            {
              popup: '今すぐプレイ',
              title: [
                'unityroomで',
                '遊ぶ'
              ],
              target: 'https://unityroom.com/games/fallinparfait'
            }
          ],
          slides: [
            {
              type: 'youtube',
              id: 'ZIFt6yuOMAQ'
            }
          ],
          specs: {
            times: [
              {
                year: '2020',
                month: '8',
                annotation: '(1週間)',
              },
              {
                year: '2020',
                month: '12',
                annotation: '(1ヶ月)',
              }
            ],
            platforms: [
              {
                name: 'iOS',
                version: '10',
                orLater: true
              },
              {
                name: 'Android',
                version: '8',
                orLater: true
              },
              {
                name: 'WebGL'
              }
            ]
          }
        },
        {
          title: '爆買いマーケット',
          subtitle: '爆買いアクションランゲーム',
          themeColor: '#da3c26',
          imageId: 'bakugai-img',
          aspectRatio: {width: 1, height: 1},
          alt: '',
          description: [
            'フォーリンパフェに続く、Unity1Week二作目。',
            'ショッピングカートに搭乗してスーパーマーケットを爆走し、床の商品を拾ったり商品棚や他のプレイヤーを攻撃することでスコアを稼ぐ。',
            '今回は初めてAIプレイヤーを導入した。それぞれのAIに性格付け（攻撃型・収集型・逃亡型）をすることで、プレイヤーは毎回刺激的なゲーム展開を楽しめるようになった。',
            'Unity1Weekゲームジャムに出展。'
          ],
          buttons: [
            {
              popup: '今すぐプレイ',
              title: [
                'unityroomで',
                '遊ぶ'
              ],
              target: 'https://unityroom.com/games/bakugaimarket'
            }
          ],
          slides: [
            {
              type: 'youtube',
              id: 'vTsy8NCYSNE'
            }
          ],
          specs: {
            times: [
              {
                year: '2020',
                month: '2',
                annotation: '(12日)',
              }
            ],
            platforms: [
              {
                name: 'WebGL'
              }
            ]
          }
        }
      ]
    }
  },
  {
    sectionType: 'dateList',
    title: 'NEWS',
    subtitle: 'チームからのお知らせ',
    themeColor: '#f73f23',
    id: 'news',
    contents: {
      shownItemsCount: 3,
      articles: [
        {
          title: '『フォーリンパフェ』がデベロッパーズゲームコンテスト2020にて企業賞（f4samurai賞）を受賞！',
          date: {
            year: '2021',
            month: '1',
            day: '29'
          },
          url: 'https://twitter.com/MachiCollider/status/1355123713226625027'
        },
        {
          title: 'スーパースターマインが「活躍する電大人」に掲載！',
          date: {
            year: '2021',
            month: '1',
            day: '28'
          },
          url: 'https://www.dendai.ac.jp/dendai-people/20210128-01.html'
        },
        {
          title: '『れーぞく！ネクロマンスちゃん』がゲームクリエイター甲子園2020にて総合大賞3位、審査員特別賞（鈴木英仁賞）、話題賞を受賞！',
          date: {
            year: '2020',
            month: '12',
            day: '19'
          },
          url: 'https://www.4gamer.net/games/999/G999905/20201228102/'
        },
        {
          title: '『れーぞく！ネクロマンスちゃん』をデジゲー博2020に出展！',
          date: {
            year: '2020',
            month: '11',
            day: '29'
          },
          url: 'http://digigame-expo.org/'
        },
        {
          title: '『フォーリンパフェ』がUnity 1Weekゲームジャムにて総合ランキング、絵作りランキングに入賞！',
          date: {
            year: '2020',
            month: '8',
            day: '30'
          },
          url: 'https://unityroom.com/unity1weeks/17'
        },
        {
          title: '『SPINNER』をゲーム業界交流会に出展！',
          date: {
            year: '2020',
            month: '2',
            day: '6'
          },
          url: 'https://game.creators-guild.com/g4c/%E3%82%B2%E3%83%BC%E3%83%A0%E6%A5%AD%E7%95%8C%E4%BA%A4%E6%B5%81%E4%BC%9A%E3%81%AB%E6%BD%9C%E5%85%A5%EF%BC%81/'
        },
        {
          title: 'ゲームクリエイターズギルド様からインタビューをしていただきました！',
          date: {
            year: '2019',
            month: '12',
            day: '27'
          },
          url: 'https://game.creators-guild.com/g4c/interview-studentgamescreator-20190114/'
        },
        {
          title: '『SPINNER』がGCG EXPO 2019で最優秀賞を受賞！',
          date: {
            year: '2019',
            month: '11',
            day: '30'
          },
          url: 'https://game.creators-guild.com/g4c/event-realevent-20191205/'
        },
        {
          title: '『れーぞく！ネクロマンスちゃん』をゲーム制作者交流会 GAME^3に出展！',
          date: {
            year: '2019',
            month: '9',
            day: '8'
          },
          url: 'https://game3.trap.jp/10th/'
        }
      ]
    }
  },
  {
    sectionType: 'static',
    title: 'ABOUT',
    themeColor: '#f78323',
    id: 'about',
    contents: {
      imageId: 'ssm-logo-landscape',
      aspectRatio: { width: 157213, height: 60041 },
      imageExtensionsShort: ['svg'],
      article: [
        "スーパースターマインは大学サークル発、新進気鋭のゲーム制作チーム。",
        "面白いものが大好きです。"
      ],
      bottomButtonsLayout: 'left',
      bottomButtons: [
        {
          title: [
            'お問い合わせ'
          ],
          target: 'https://docs.google.com/forms/d/e/1FAIpQLSd6Z3feC7onaq9SJa1Blfdd7frPFCsm4zQUCfQr9XqPxM3gzA/viewform'
        },
        {
          title: 'Twitter',
          target: 'https://twitter.com/necromance_chan'
        }
      ]
    }
  },
  {
    sectionType: 'cards',
    title: 'MEMBERS',
    themeColor: '#f7a723',
    id: 'members',
    contents: {
      logoImageId: 'ssm-logo',
      logoImageExtensionsShort: ['svg'],
      logoAspectRatio: {width: 47581, height: 90047},
      backfaceLogoImageId: 'ssm-logo-landscape',
      backfaceLogoImageExtensionsShort: ['svg'],
      backfaceLogoAspectRatio: {width: 157213, height: 60041},
      imageDirectory: './img/members/',
      cards: [
        {
          name: 'マチコー',
          imageId: 'machiko',
          post: [
            'リーダー',
            'プランナー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'MachiCollider'
            },
            {
              name: 'note',
              id: 'machikou_mk2'
            },
            {
              name: 'qiita',
              id: 'Machikof'
            }
          ],
          backfaceColor: '#E03D16',
          backfaceLogoBrightness: 10
        },
        {
          name: 'いーだ',
          imageId: 'i-da',
          post: [
            'プログラマー',
            'マスタリングエンジニア'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'GoodPaddyField5'
            },
            {
              name: 'note',
              id: '203_'
            }
          ],
          backfaceColor: '#57e827',
          backfaceLogoBrightness: 10
        },
        {
          name: 'Amu',
          imageId: 'amu',
          post: [
            'UI/ロゴデザイナー',
            'エフェクトクリエーター'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'Amu_dsgn'
            }
          ],
          backfaceColor: '#e84327',
          backfaceLogoBrightness: 10
        },
        {
          name: 'HIBIKI CUBE',
          imageId: 'hibiki',
          post: [
            'Webエンジニア',
            'CGモデラー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'hibiki_cube'
            },
            {
              name: 'github',
              id: 'HIBIKI-CUBE'
            },
            {
              name: 'qiita',
              id: 'HIBIKI-CUBE'
            },
            {
              name: 'lastfm',
              id: 'HIBIKI_CUBE'
            }
          ],
          backfaceColor: '#27b1e8',
          backfaceLogoBrightness: 10
        },
        {
          name: 'Matsu',
          imageId: '',
          post: [
            'プログラマー',
            'レベルデザイナー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'sake_unity_stu'
            },
            {
              name: 'github',
              id: 'AtaruMatsudaira'
            }
          ],
          backfaceColor: '#e82727',
          backfaceLogoBrightness: 10
        },
        {
          name: 'ナミー',
          imageId: '',
          post: [
            'デバッガー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'fi_matsu'
            }
          ],
          backfaceColor: '#6e27e8',
          backfaceLogoBrightness: 10
        },
        {
          name: 'えちょ',
          imageId: 'echo',
          post: [
            'レベルデザイナー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'ysXKPSlvMZqVtIW'
            }
          ],
          backfaceColor: '#000000',
          backfaceLogoBrightness: 10
        },
        {
          name: '十二月ねこ',
          imageId: '',
          post: [
            'CGモデラー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'Subamaru_7'
            }
          ],
          backfaceColor: '#e82781',
          backfaceLogoBrightness: 10
        },
        {
          name: 'かずえもん',
          imageId: 'kazuemon',
          post: [
            'Webデザイナー'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'kazuemon_0602',
              customUrl: '//k6n.jp/tw'
            },
            {
              name: 'youtube',
              id: 'kazuemon',
              customUrl: '//k6n.jp/yt'
            },
            {
              name: 'github',
              id: 'kazuemon',
              customUrl: '//k6n.jp/gh'
            },
          ],
          backfaceColor: '#e8a127',
          backfaceLogoBrightness: 10
        },
        {
          name: 'NEO',
          imageId: 'neo',
          post: [
            'エフェクト',
            'サウンドデザイン'
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'neo_97m'
            },
            {
              name: 'github',
              id: 'NEON1212121'
            },
          ],
          backfaceColor: '#7de8bd',
          backfaceLogoBrightness: 10
        },
        {
          name: 'すぎのこ',
          post: [
            '3Dモデラー',
          ],
          accounts: [
            {
              name: 'twitter',
              id: 'ucSzlqTS3y78lIN'
            }
          ],
          backfaceColor: '#145866',
          backfaceLogoBrightness: 10
        }
      ]
    }
  },
  {
    sectionType: 'footer',
    themeColor: '#fff',
    contents: {
      copyright: ['&copy; 2021', 'HIBIKI CUBE', 'スーパースターマイン'],
      codeLicense: {
        license: 'mpl-2.0',
        linkLabel: 'GitHub',
        url: 'https://github.com/HIBIKI-CUBE/superstarmine-web',
      },
      assetsLicense: {
        ccType: 'by-nd'
      }
    }
  }
]