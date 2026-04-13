(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const HUB_PROFILE_KEY = 'genesis_arcade_hub_profile_v1';
    const SAVE_KEY = 'genesis_defense_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const CANVAS_WIDTH = 720;
    const CANVAS_HEIGHT = 1040;
    const TOTAL_WAVES = 6;
    const SAFE_CORE_Y = 910;
    const SKILL_READY_GLOW_MS = 240;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_TXID_REGEX = /^[A-Fa-f0-9]{64}$/;
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_ORDER_WINDOW_MS = 15 * 60 * 1000;

    const TEXT = {
        zh: {
            pageTitle: '鍒涗笘闃茬嚎 / Genesis Defense',
            backHub: '杩斿洖澶у巺',
            heroEyebrow: 'TRI-LANE DEFENSE LIVE',
            heroTitle: '鍒涗笘闃茬嚎',
            heroSubtitle: '涓夎矾濉旈槻 路 娉㈡寮哄寲 路 鏍稿績瀹堝崼',
            goldLabel: '閲戝竵',
            coreLabel: '鑳芥牳',
            fragmentLabel: '纰庣墖',
            seasonLabel: '璧涘',
            ratingLabel: '鎴樺姏',
            bestStageLabel: '鏈€楂樼珷鑺',
            chapterLabel: '绔犺妭',
            waveLabel: '娉㈡',
            coreHpLabel: '鏍稿績',
            threatLabel: '濞佽儊',
            startKicker: 'CORE DEFENSE',
            startTitle: '閮ㄧ讲闃茬嚎',
            startRun: '寮€濮嬮槻瀹',
            upgradeKicker: 'WAVE UPGRADE',
            upgradeTitle: '閫夋嫨涓€椤瑰己鍖',
            upgradeSubtitle: '姣忔尝缁撴潫鍚庡彲鑾峰緱 1 娆′复鏃跺鐩婏紝灏介噺鍥寸粫褰撳墠鐐彴闃靛鍋氱粍鍚堛€',
            pauseKicker: 'DEFENSE PAUSED',
            pauseTitle: '鎴樺眬宸叉殏鍋',
            resumeRun: '缁х画闃插畧',
            quitRun: '缁撴潫鏈眬',
            goldGainLabel: '閲戝竵鏀剁泭',
            coreGainLabel: '鑳芥牳鏀剁泭',
            seasonGainLabel: '璧涘缁忛獙',
            chapterProgressLabel: '绔犺妭杩涘害',
            restartRun: '鍐嶅畧涓€灞€',
            nextChapter: '鎸戞垬涓嬩竴绔',
            loadoutShortcut: '鍓嶅線瑁呴厤',
            pauseBtn: '鏆傚仠',
            tabDefend: '闃茬嚎',
            tabLoadout: '瑁呴厤',
            tabResearch: '鐮旂┒',
            tabMissions: '浠诲姟',
            tabSeason: '璧涘',
            tabShop: '鍟嗗簵',
            skillEmp: 'EMP 鑴夊啿',
            skillOverclock: '瓒呴鍥炶矾',
            skillShield: '瀹堟姢绔嬪満',
            threatStable: '绋冲畾',
            threatRising: '鍗囨俯',
            threatDanger: '鍗遍櫓',
            defendPanelTitle: '绔犺妭閮ㄧ讲',
            defendPanelDesc: '閫夋嫨绔犺妭銆佹煡鐪嬫晫娼瀯鎴愶紝骞跺洿缁曚笁璺偖鍙伴厤缃喅瀹氭湰灞€鑺傚銆',
            loadoutPanelTitle: '涓夎矾瑁呴厤',
            loadoutPanelDesc: '姣忔潯閫氶亾鍙嫭绔嬭閰嶇偖鍙帮紝涓诲姩鎶€鑳藉喅瀹氬叧閿尝娆＄殑缈荤洏绌洪棿銆',
            researchPanelTitle: '鐮旂┒瀹為獙瀹',
            researchPanelDesc: '鐮旂┒鏄暱鏈熸垚闀夸富杞达紝浼氬悓鏃舵姮楂樼ǔ瀹氶€氬叧鐜囧拰鍚庣画绔犺妭鎴樺姏闂ㄦ銆',
            missionsPanelTitle: '浠诲姟涓績',
            missionsPanelDesc: '鎶婂彲棰嗗彇濂栧姳缃《锛屽府鍔╀綘蹇€熻幏寰楃煭绾垮弽棣堜笌璧勬簮鍥炴祦銆',
            seasonPanelTitle: '璧涘杞ㄩ亾',
            seasonPanelDesc: '瀹屾垚闃插畧銆佹帹杩涚珷鑺傘€佺疮璁″嚮鏉€閮借兘鎻愬崌璧涘绛夌骇骞堕鍙栭噷绋嬪鍔便€',
            shopPanelTitle: '琛ョ粰鍟嗗簵',
            shopPanelDesc: '鏃ュ父琛ョ粰璐熻矗鍩虹鍥炴祦锛岃祫婧愮鎵挎媴涓湡鎺ㄨ繘锛岄摼涓婃牎楠屽厖鍊间細瑙ｉ攣璧炲姪杞ㄩ亾涓庨澶栬禌瀛ｅ鍔便€',
            recommendRating: '鎺ㄨ崘鎴樺姏',
            rewardPreview: '鎺夎惤棰勮',
            enemyPreview: '鏁屾疆棰勮',
            chapterBuff: '绔犺妭鐗规€',
            chapterLocked: '鏈В閿',
            chapterUnlocked: '宸茶В閿',
            defendNow: '绔嬪嵆闃插畧',
            lane1: '宸﹁矾',
            lane2: '涓矾',
            lane3: '鍙宠矾',
            laneSelect: '褰撳墠瑁呴厤璺',
            skillSelect: '涓诲姩鎶€鑳',
            equipNow: '瑁呭鍒板綋鍓嶈矾',
            equipped: '宸茶澶',
            unlockNow: '瑙ｉ攣',
            upgradeNow: '鍗囩骇',
            upgradeMax: '宸叉弧绾',
            needFragments: '闇€瑕佺鐗',
            needGold: '闇€瑕侀噾甯',
            needCores: '闇€瑕佽兘鏍',
            levelText: '绛夌骇',
            rareText: '绋€鏈',
            epicText: '鍙茶瘲',
            commonText: '鍩虹',
            supportText: '缁忔祹',
            dpsText: '杈撳嚭',
            actionReady: '鍙搷浣',
            actionLocked: '鏈弧瓒',
            researchEffect: '褰撳墠鏁堟灉',
            researchCost: '鐮旂┒娑堣€',
            missionClaim: '棰嗗彇濂栧姳',
            missionClaimed: '宸查鍙',
            missionLocked: '杩涜涓',
            seasonClaim: '棰嗗彇鑺傜偣',
            seasonClaimed: '宸查鍙',
            seasonProgress: '璧涘杩涘害',
            seasonToNext: '璺濈涓嬩竴绾',
            shopClaim: '鍏嶈垂棰嗗彇',
            shopBuy: '绔嬪嵆璐拱',
            shopSoldOut: '鍐峰嵈涓',
            shopPreviewOnly: '棰勭暀鍚庣画鏀粯鎺ュ叆',
            startDescTemplate: '涓轰笁鏉￠€氶亾瑁呴厤鐐彴骞跺畧浣忓垱涓栨牳蹇冿紝鍑婚€€ 6 娉㈡晫娼悗鑾峰緱閲戝竵銆佽兘鏍镐笌钃濆浘纰庣墖銆傚綋鍓嶇珷鑺傦細{chapter}銆',
            startMetaReward: '閫氬叧濂栧姳 {gold} 閲戝竵 路 {core} 鑳芥牳 路 {fragment} 纰庣墖',
            startMetaEnemy: '鏁屾疆閲嶇偣锛歿enemy}',
            battleNoteIdle: '浼樺厛纭涓夎矾鐐彴閰嶇疆锛屽啀寮€灞€杩庢垬鏁屾疆銆',
            battleNoteWave: '娉㈡鎺ㄨ繘涓細浼樺厛澶勭悊楂橀€熸€笌鎶ょ浘鎬紝鎶€鑳界暀缁欏帇鍔涘嘲鍊兼垨 BOSS銆',
            battleNoteUpgrade: '娉㈡宸叉竻绌猴紝閫夋嫨涓€椤瑰己鍖栫户缁帹杩涖€',
            battleNoteResultWin: '闃茬嚎瀹堜綇浜嗭紝璧勬簮宸茬粨绠楋紝鍙户缁啿鏇撮珮绔犺妭銆',
            battleNoteResultLose: '鏍稿績琚嚮绌匡紝鍏堣ˉ寮鸿閰嶆垨鐮旂┒锛屽啀灏濊瘯閲嶆柊寮€灞€銆',
            toastSaved: '闃茬嚎杩涘害宸插悓姝ヤ繚瀛',
            toastSkillCooling: '鎶€鑳藉喎鍗翠腑',
            toastSkillEmp: 'EMP 宸查噴鏀撅紝鏁屼汉琚煭鏆傚帇鍒',
            toastSkillOverclock: '鐐彴杩涘叆瓒呴杈撳嚭',
            toastSkillShield: '鏍稿績鎶ょ浘宸插睍寮€',
            toastNotEnoughGold: '閲戝竵涓嶈冻',
            toastNotEnoughCore: '鑳芥牳涓嶈冻',
            toastMissionClaimed: '浠诲姟濂栧姳宸查鍙',
            toastSeasonClaimed: '璧涘鑺傜偣濂栧姳宸查鍙',
            toastResearchUp: '鐮旂┒绛夌骇鎻愬崌',
            toastTowerUp: '鐐彴鍗囩骇鎴愬姛',
            toastTowerUnlock: '鐐彴瑙ｉ攣鎴愬姛',
            toastEquipped: '褰撳墠閫氶亾瑁呴厤宸叉洿鏂',
            toastDailySupply: '宸查鍙栦粖鏃ヨˉ缁',
            toastShopBought: '琛ョ粰宸插埌璐',
            toastWaveClear: '鏈尝娓呯┖锛岄€夋嫨寮哄寲缁х画鎺ㄨ繘',
            toastRunWin: '闃茬嚎鎴愬姛瀹堜綇',
            toastRunLose: '鏍稿績琚獊鐮达紝鏈眬缁撴潫',
            toastChapterUnlocked: '鏂扮珷鑺傚凡瑙ｉ攣',
            toastNeedUnlock: '璇峰厛瑙ｉ攣璇ョ偖鍙',
            toastNeedFragments: '纰庣墖涓嶈冻',
            toastNeedLane: '璇烽€夋嫨涓€鏉￠€氶亾杩涜瑁呴厤',
            resultWinKicker: 'DEFENSE SUCCESS',
            resultLoseKicker: 'CORE BREACHED',
            resultWinTitle: '闃茬嚎鑳滃埄',
            resultLoseTitle: '闃茬嚎澶卞畧',
            chapterProgressWin: '宸茶В閿佽嚦 {chapter}',
            chapterProgressLose: '褰撳墠鏈€楂樻帹杩?{chapter}',
            resultStats: '鍑绘潃 {kills} 路 浼ゅ {damage}',
            chapterInfoBoss: '绗?6 娉㈠浐瀹氬嚭鐜?Boss',
            missionReadyDot: '鍙鍙',
            seasonReadyDot: '鍙鍙',
            labReadyDot: '鍙崌绾',
            dailyReadyDot: '鍏嶈垂',
            sponsorTrack: '璧炲姪杞ㄩ亾',
            sponsorDesc: '浠绘剰涓€绗旀牎楠屾垚鍔熺殑鍏呭€奸兘浼氳В閿佽禐鍔╄建閬擄紝骞跺湪璧涘椤靛紑鏀鹃澶栧鍔辫妭鐐广€',
            chapterBadgeNew: '鏂扮珷鑺',
            chapterBadgeCurrent: '褰撳墠鎸戞垬',
            waveText: '绗?{wave} / 6 娉',
            skillReady: '{skill} 路 鍙噴鏀',
            skillCooling: '{skill} 路 {time}s',
            coreShieldText: '鎶ょ浘 {value}',
            laneStripDps: '璺激瀹',
            laneStripEmpty: '鏈閰',
            laneStripLevel: 'Lv.{level}',
            researchMaxed: '鐮旂┒宸叉弧',
            fragmentsGain: '{name} 纰庣墖 +{value}',
            seasonNodeTitle: '璧涘鑺傜偣 {index}',
            shopFreeTitle: '鏃ュ父琛ョ粰绠',
            shopFreeDesc: '姣?20 灏忔椂鍙鍙栦竴娆★紝鎻愪緵閲戝竵銆佽兘鏍镐笌鍩虹鐐彴纰庣墖銆',
            shopGoldTitle: '钃濆浘琛ョ粰绠',
            shopGoldDesc: '娑堣€楅噾甯佹娊鍙栬摑鍥剧鐗囷紝閫傚悎涓湡鎶珮鐐彴绛夌骇銆',
            shopCoreTitle: '楂樿兘涓户绠',
            shopCoreDesc: '娑堣€楄兘鏍告崲鍙栫█鏈?鍙茶瘲纰庣墖涓庨澶栭噾甯併€',
            previewTowerPower: '鎴樺姏鏋勬垚',
            previewWavePressure: '鍘嬪姏鏇茬嚎',
            previewEconomy: '璧勬簮鍥炴祦',
            chapterStateTitle: '褰撳墠绔犺妭鍘嬪姏',
            chapterStateDesc: '鏁板€间細闅忕潃绔犺妭閫愭鎶珮锛岄珮绋€鏈夌偖鍙版洿閫傚悎鎵挎媴鍚庢湡绐佺牬銆',
            bonusDamage: '鐏姏澧炲箙',
            bonusSpeed: '鍐峰嵈鍔犻€',
            bonusShield: '鎶ょ浘鍔犲帤',
            bonusGold: '鎴樺埄鍥炴敹',
            bonusFreeze: '鍐扮紦鎵╂暎',
            bonusCrit: '鏍稿績鏆村嚮',
            bonusSplash: '鐖嗚閾惧紡',
            statRuns: '闃插畧灞€鏁',
            statWins: '鎴愬姛瀹堜綇',
            statKills: '绱鍑绘潃',
            statDamage: '鎬讳激瀹',
            statSkills: '鎶€鑳介噴鏀',
            statResearch: '鐮旂┒娆℃暟',
            statBest: '鏈€楂樻帹杩',
            enemyFast: '楂橀€熸€',
            enemyShield: '鎶ょ浘鎬',
            enemySplit: '鍒嗚鎬',
            enemyElite: '绮捐嫳鎬',
            enemyBoss: '瑁傞殭宸ㄥ儚',
            enemyGrunt: '鏉傚叺',
            towerPulse: '鑴夊啿濉',
            towerLaser: '婵€鍏夊',
            towerFrost: '闇滃喕濉',
            towerRocket: '鐏濉',
            towerHarvest: '閲囬泦濉',
            towerChain: '閾惧嚮濉',
            towerRail: '杞ㄧ偖濉',
            rarityCommon: '鍩虹',
            rarityRare: '绋€鏈',
            rarityEpic: '鍙茶瘲'
        },
        en: {
            pageTitle: 'Genesis Defense',
            backHub: 'Back To Hub',
            heroEyebrow: 'TRI-LANE DEFENSE LIVE',
            heroTitle: 'Genesis Defense',
            heroSubtitle: '3 Lanes 路 Wave Upgrades 路 Core Survival',
            goldLabel: 'Gold',
            coreLabel: 'Cores',
            fragmentLabel: 'Fragments',
            seasonLabel: 'Season',
            ratingLabel: 'Power',
            bestStageLabel: 'Best Stage',
            chapterLabel: 'Chapter',
            waveLabel: 'Wave',
            coreHpLabel: 'Core',
            threatLabel: 'Threat',
            startKicker: 'CORE DEFENSE',
            startTitle: 'Deploy The Line',
            startRun: 'Start Defense',
            upgradeKicker: 'WAVE UPGRADE',
            upgradeTitle: 'Choose An Upgrade',
            upgradeSubtitle: 'Every cleared wave grants one temporary boost. Build around your current lanes.',
            pauseKicker: 'DEFENSE PAUSED',
            pauseTitle: 'Defense Paused',
            resumeRun: 'Resume Defense',
            quitRun: 'End This Run',
            goldGainLabel: 'Gold Gain',
            coreGainLabel: 'Core Gain',
            seasonGainLabel: 'Season XP',
            chapterProgressLabel: 'Chapter Progress',
            restartRun: 'Run Again',
            nextChapter: 'Next Chapter',
            loadoutShortcut: 'Open Loadout',
            pauseBtn: 'Pause',
            tabDefend: 'Defend',
            tabLoadout: 'Loadout',
            tabResearch: 'Research',
            tabMissions: 'Missions',
            tabSeason: 'Season',
            tabShop: 'Shop',
            skillEmp: 'EMP Pulse',
            skillOverclock: 'Overclock Loop',
            skillShield: 'Guardian Field',
            threatStable: 'Stable',
            threatRising: 'Rising',
            threatDanger: 'Critical',
            defendPanelTitle: 'Chapter Setup',
            defendPanelDesc: 'Pick a chapter, inspect the enemy mix, and decide how your three lanes should carry the run.',
            loadoutPanelTitle: 'Tri-Lane Loadout',
            loadoutPanelDesc: 'Each lane equips its own tower, while your active skill defines wave-saving moments.',
            researchPanelTitle: 'Research Lab',
            researchPanelDesc: 'Research is the long-term progression spine for both stability and difficulty gates.',
            missionsPanelTitle: 'Mission Center',
            missionsPanelDesc: 'Claimable rewards are pinned to the top so your feedback loop stays visible.',
            seasonPanelTitle: 'Season Track',
            seasonPanelDesc: 'Defense clears, chapter pushes, and total kills all feed your season rewards.',
            shopPanelTitle: 'Supply Shop',
            shopPanelDesc: 'Daily supply stabilizes retention, resource crates push mid-game growth, and verified top-ups unlock bonus season rewards.'
        }
    };

    const CHAPTERS = [
        {
            id: '1-1',
            recommended: 160,
            baseHp: 46,
            baseSpeed: 62,
            goldReward: 420,
            coreReward: 10,
            fragmentReward: 18,
            trait: { zh: '鍩虹璇曠偧锛屼富瑕佺啛鎮変笁璺閰嶄笌娉㈡寮哄寲鑺傚銆', en: 'Intro chapter to learn three-lane setup and wave upgrades.' },
            enemies: ['grunt', 'fast', 'shield'],
            fragmentFocus: ['pulse', 'laser', 'harvest']
        },
        {
            id: '1-2',
            recommended: 240,
            baseHp: 56,
            baseSpeed: 68,
            goldReward: 560,
            coreReward: 12,
            fragmentReward: 20,
            trait: { zh: '楂橀€熸€槑鏄惧澶氾紝浼樺厛鍑嗗婵€鍏夊涓庢帶鍦烘妧鑳姐€', en: 'Fast enemies show up more often, making laser and control tools more valuable.' },
            enemies: ['grunt', 'fast', 'shield', 'split'],
            fragmentFocus: ['laser', 'frost', 'rocket']
        },
        {
            id: '1-3',
            recommended: 360,
            baseHp: 72,
            baseSpeed: 74,
            goldReward: 740,
            coreReward: 16,
            fragmentReward: 24,
            trait: { zh: '鍒嗚鎬笌绮捐嫳寮€濮嬭繘鍏ヤ富娉㈡锛岄渶瑕佹洿绋崇殑鍑忛€熶笌鐖嗚浼ゅ銆', en: 'Split enemies and elites enter the main waves, pushing for slows and splash damage.' },
            enemies: ['grunt', 'fast', 'split', 'elite'],
            fragmentFocus: ['frost', 'rocket', 'chain']
        },
        {
            id: '2-1',
            recommended: 520,
            baseHp: 92,
            baseSpeed: 78,
            goldReward: 930,
            coreReward: 20,
            fragmentReward: 28,
            trait: { zh: '鎶ょ浘鎬閲忔垚闀挎槑鏄撅紝閾惧嚮濉斾笌杞ㄧ偖濉斿紑濮嬪睍鐜颁环鍊笺€', en: 'Shield units grow tougher, and chain / rail tools start to matter.' },
            enemies: ['shield', 'split', 'elite', 'boss'],
            fragmentFocus: ['rocket', 'chain', 'rail']
        },
        {
            id: '2-2',
            recommended: 720,
            baseHp: 118,
            baseSpeed: 84,
            goldReward: 1180,
            coreReward: 24,
            fragmentReward: 34,
            trait: { zh: '涓悗鏈熺珷鑺傦紝缁忔祹涓庤緭鍑鸿鍚屾鎶珮锛屽惁鍒欎細琚簿鑻辨尝鎷栧灝銆', en: 'Mid-late chapter where economy and damage must scale together.' },
            enemies: ['fast', 'shield', 'elite', 'boss'],
            fragmentFocus: ['chain', 'rail', 'frost']
        },
        {
            id: '2-3',
            recommended: 940,
            baseHp: 148,
            baseSpeed: 88,
            goldReward: 1520,
            coreReward: 30,
            fragmentReward: 40,
            trait: { zh: '褰撳墠鐗堟湰鏈€楂樼珷鑺傦紝Boss 娉㈡瀬閲嶏紝寤鸿浼樺厛鍑嗗鍙茶瘲杞ㄧ偖濉斻€', en: 'Current final chapter with a brutal boss wave. Epic rail setups shine here.' },
            enemies: ['shield', 'split', 'elite', 'boss'],
            fragmentFocus: ['rail', 'chain', 'rocket']
        },
        {
            id: '3-1',
            recommended: 1220,
            baseHp: 178,
            baseSpeed: 92,
            goldReward: 1860,
            coreReward: 36,
            fragmentReward: 46,
            trait: { zh: '杩涘叆绗?3 绔犲悗锛屼笁璺細鍚屾椂鎵垮彈蹇€笌绮捐嫳鎬帇鍔涳紝蹇呴』淇濊瘉鑷冲皯涓よ矾鍏峰绋冲畾鏀剁嚎鑳藉姏銆', en: 'Chapter 3 opens with simultaneous pressure from fast and elite enemies, so at least two lanes must clear reliably.' },
            enemies: ['fast', 'split', 'elite', 'boss'],
            fragmentFocus: ['rail', 'frost', 'chain']
        },
        {
            id: '3-2',
            recommended: 1520,
            baseHp: 214,
            baseSpeed: 96,
            goldReward: 2260,
            coreReward: 42,
            fragmentReward: 54,
            trait: { zh: '鎶ょ浘鎬€佸垎瑁傛€笌 Boss 浼氳繛缁彔鍘嬶紝鎶ょ浘鎶€鑳戒笌閾惧嚮 / 鐏鐨勮仈鍔ㄤ細鏄庢樉鏇寸ǔ銆', en: 'Shield units, split enemies, and the boss stack together here, making shield timing and Chain/Rocket synergy much more reliable.' },
            enemies: ['shield', 'split', 'elite', 'boss'],
            fragmentFocus: ['rail', 'rocket', 'chain']
        },
        {
            id: '3-3',
            recommended: 1880,
            baseHp: 258,
            baseSpeed: 100,
            goldReward: 2780,
            coreReward: 48,
            fragmentReward: 62,
            trait: { zh: '褰撳墠寮€鏀惧唴瀹圭殑缁堢珷锛屾渶缁?Boss 娉細鎶婁笁璺竴璧峰帇婊★紝寤鸿鑷冲皯鎷ユ湁 1 璺珮绛夌骇杞ㄧ偖涓?1 璺ǔ瀹氬噺閫熴€', en: 'This is the current end chapter. The final boss wave saturates all three lanes, so you want one high-level Rail lane plus one stable slow lane.' },
            enemies: ['fast', 'shield', 'split', 'boss'],
            fragmentFocus: ['rail', 'chain', 'frost']
        }
    ];

    const CHAPTER_WAVE_SCRIPTS = {
        '3-1': {
            2: [
                { progress: 0.24, lane: 0, type: 'fast' },
                { progress: 0.3, lane: 2, type: 'fast' },
                { progress: 0.38, lane: 1, type: 'shield' }
            ],
            4: [
                { progress: 0.34, lane: 0, type: 'elite' },
                { progress: 0.42, lane: 2, type: 'elite' },
                { progress: 0.54, lane: 1, type: 'split' }
            ],
            6: [
                { progress: 0.48, lane: 0, type: 'fast' },
                { progress: 0.56, lane: 2, type: 'fast' },
                { progress: 0.68, lane: 1, type: 'elite' }
            ]
        },
        '3-2': {
            2: [
                { progress: 0.22, lane: 0, type: 'shield' },
                { progress: 0.28, lane: 1, type: 'fast' },
                { progress: 0.34, lane: 2, type: 'shield' }
            ],
            4: [
                { progress: 0.3, lane: 0, type: 'split' },
                { progress: 0.36, lane: 1, type: 'shield' },
                { progress: 0.42, lane: 2, type: 'split' },
                { progress: 0.56, lane: 1, type: 'elite' }
            ],
            5: [
                { progress: 0.46, lane: 0, type: 'elite' },
                { progress: 0.53, lane: 2, type: 'elite' },
                { progress: 0.62, lane: 1, type: 'shield' }
            ],
            6: [
                { progress: 0.5, lane: 0, type: 'shield' },
                { progress: 0.6, lane: 2, type: 'split' },
                { progress: 0.72, lane: 1, type: 'elite' }
            ]
        },
        '3-3': {
            2: [
                { progress: 0.2, lane: 0, type: 'fast' },
                { progress: 0.25, lane: 1, type: 'fast' },
                { progress: 0.3, lane: 2, type: 'fast' }
            ],
            4: [
                { progress: 0.28, lane: 0, type: 'split' },
                { progress: 0.35, lane: 1, type: 'elite' },
                { progress: 0.42, lane: 2, type: 'split' }
            ],
            5: [
                { progress: 0.34, lane: 0, type: 'shield' },
                { progress: 0.44, lane: 1, type: 'elite' },
                { progress: 0.54, lane: 2, type: 'shield' }
            ],
            6: [
                { progress: 0.42, lane: 0, type: 'fast' },
                { progress: 0.48, lane: 2, type: 'fast' },
                { progress: 0.6, lane: 0, type: 'elite' },
                { progress: 0.68, lane: 2, type: 'elite' },
                { progress: 0.78, lane: 1, type: 'split' }
            ]
        }
    };

    const TOWERS = {
        pulse: { id: 'pulse', tier: 'common', baseDamage: 16, cooldown: 0.72, upgradeGold: 220, unlockFragments: 0, color: '#72f4ff', power: 55, splash: 0, slow: 0 },
        laser: { id: 'laser', tier: 'common', baseDamage: 10, cooldown: 0.34, upgradeGold: 260, unlockFragments: 0, color: '#ff9a5a', power: 58, splash: 0, slow: 0 },
        frost: { id: 'frost', tier: 'rare', baseDamage: 12, cooldown: 0.62, upgradeGold: 320, unlockFragments: 36, color: '#8ad6ff', power: 78, splash: 0, slow: 0.28 },
        rocket: { id: 'rocket', tier: 'rare', baseDamage: 24, cooldown: 1.08, upgradeGold: 380, unlockFragments: 40, color: '#ffd26b', power: 92, splash: 0.42, slow: 0 },
        harvest: { id: 'harvest', tier: 'common', baseDamage: 8, cooldown: 0.84, upgradeGold: 210, unlockFragments: 0, color: '#65ffb2', power: 52, splash: 0, slow: 0, goldBonus: 0.55 },
        chain: { id: 'chain', tier: 'rare', baseDamage: 15, cooldown: 0.64, upgradeGold: 460, unlockFragments: 56, color: '#b58cff', power: 112, splash: 0, slow: 0, chain: 0.42 },
        rail: { id: 'rail', tier: 'epic', baseDamage: 44, cooldown: 1.28, upgradeGold: 720, unlockFragments: 92, color: '#ff6b89', power: 164, splash: 0, slow: 0, pierce: true }
    };

    const SKILLS = {
        emp: { id: 'emp', cooldown: 20, nameKey: 'skillEmp' },
        overclock: { id: 'overclock', cooldown: 24, duration: 8, nameKey: 'skillOverclock' },
        shield: { id: 'shield', cooldown: 18, nameKey: 'skillShield' }
    };

    const RESEARCH = {
        attack: { id: 'attack', maxLevel: 10, baseCost: 320, stepCost: 140, effect: (level) => level * 8 },
        cadence: { id: 'cadence', maxLevel: 10, baseCost: 360, stepCost: 150, effect: (level) => level * 6 },
        fortify: { id: 'fortify', maxLevel: 8, baseCost: 420, stepCost: 170, effect: (level) => level * 12 },
        salvage: { id: 'salvage', maxLevel: 10, baseCost: 340, stepCost: 135, effect: (level) => level * 10 },
        relay: { id: 'relay', maxLevel: 8, baseCost: 460, stepCost: 190, effect: (level) => level * 6 }
    };

    const MISSIONS = [
        { id: 'm1', title: { zh: '初次守住', en: 'First Hold' }, desc: { zh: '成功守住 1 次防线。', en: 'Win 1 defense run.' }, target: 1, metric: (save) => save.stats.wins, reward: { cores: 24, gold: 280 } },
        { id: 'm2', title: { zh: '清剿命令', en: 'Purge Order' }, desc: { zh: '累计击杀 90 名敌人。', en: 'Kill 90 enemies total.' }, target: 90, metric: (save) => save.stats.kills, reward: { gold: 640, fragments: { pulse: 16, laser: 16 } } },
        { id: 'm3', title: { zh: '研究启动', en: 'Research Start' }, desc: { zh: '完成 2 次研究升级。', en: 'Complete 2 research upgrades.' }, target: 2, metric: (save) => save.stats.researchDone, reward: { gold: 880, fragments: { frost: 18 } } },
        { id: 'm4', title: { zh: '中期突破', en: 'Mid Push' }, desc: { zh: '推进至章节 1-3。', en: 'Reach chapter 1-3.' }, target: 3, metric: (save) => save.bestChapterIndex + 1, reward: { cores: 36, fragments: { rocket: 20 } } },
        { id: 'm5', title: { zh: '战场调度', en: 'Tactical Control' }, desc: { zh: '累计释放 12 次主动技能。', en: 'Use active skills 12 times.' }, target: 12, metric: (save) => save.stats.skillsUsed, reward: { gold: 960, fragments: { chain: 18 } } },
        { id: 'm6', title: { zh: '守线老兵', en: 'Line Veteran' }, desc: { zh: '累计参与 8 局防守。', en: 'Play 8 defense runs.' }, target: 8, metric: (save) => save.stats.runs, reward: { gold: 1260, cores: 30 } },
        { id: 'm7', title: { zh: '精英镇压', en: 'Elite Suppression' }, desc: { zh: '击败 8 只精英或 Boss。', en: 'Defeat 8 elites or bosses.' }, target: 8, metric: (save) => save.stats.bossKills, reward: { fragments: { rail: 18 }, cores: 48 } },
        { id: 'm8', title: { zh: '核心工程师', en: 'Core Engineer' }, desc: { zh: '将任意炮台升到 4 级。', en: 'Upgrade any tower to level 4.' }, target: 4, metric: (save) => getHighestTowerLevel(save), reward: { gold: 1600, fragments: { rail: 14, chain: 14 } } },
        { id: 'm9', title: { zh: '深区突破', en: 'Deep Push' }, desc: { zh: '推进至章节 3-1。', en: 'Reach chapter 3-1.' }, target: 7, metric: (save) => save.bestChapterIndex + 1, reward: { gold: 2200, cores: 54, fragments: { rail: 16, chain: 18 } } },
        { id: 'm10', title: { zh: '火力成型', en: 'Build Complete' }, desc: { zh: '将任意炮台升到 6 级。', en: 'Upgrade any tower to level 6.' }, target: 6, metric: (save) => getHighestTowerLevel(save), reward: { gold: 2800, fragments: { frost: 20, rocket: 20, rail: 18 } } },
        { id: 'm11', title: { zh: '持续压制', en: 'Sustained Fire' }, desc: { zh: '累计造成 120000 点伤害。', en: 'Deal 120000 total damage.' }, target: 120000, metric: (save) => save.stats.totalDamage, reward: { gold: 3200, cores: 72, fragments: { chain: 22 } } },
        { id: 'm12', title: { zh: '守线统帅', en: 'Line Commander' }, desc: { zh: '累计赢下 18 局防守。', en: 'Win 18 defense runs.' }, target: 18, metric: (save) => save.stats.wins, reward: { gold: 3800, cores: 96, fragments: { rail: 20, rocket: 24 } } },
        { id: 'm13', title: { zh: '前线推进', en: 'Forward Pressure' }, desc: { zh: '推进至章节 3-2。', en: 'Reach chapter 3-2.' }, target: 8, metric: (save) => save.bestChapterIndex + 1, reward: { gold: 4600, cores: 120, fragments: { rail: 18, rocket: 22, chain: 22 } } },
        { id: 'm14', title: { zh: '终章接入', en: 'Final Approach' }, desc: { zh: '推进至章节 3-3。', en: 'Reach chapter 3-3.' }, target: 9, metric: (save) => save.bestChapterIndex + 1, reward: { gold: 5600, cores: 146, fragments: { rail: 24, frost: 20, chain: 24 } } },
        { id: 'm15', title: { zh: '高压常驻', en: 'Pressure Resident' }, desc: { zh: '累计赢下 24 局防守。', en: 'Win 24 defense runs.' }, target: 24, metric: (save) => save.stats.wins, reward: { gold: 6800, cores: 180, fragments: { rail: 26, rocket: 28 } } },
        { id: 'm16', title: { zh: '赛季冲刺', en: 'Season Surge' }, desc: { zh: '累计获得 5200 赛季经验。', en: 'Earn 5200 Season XP total.' }, target: 5200, metric: (save) => save.seasonXp, reward: { gold: 8200, cores: 220, fragments: { frost: 28, chain: 28, rail: 24 } } }
    ];

    const SEASON_NODES = [
        { id: 's1', xp: 90, reward: { gold: 300, cores: 8 } },
        { id: 's2', xp: 210, reward: { fragments: { pulse: 16, laser: 16 } } },
        { id: 's3', xp: 360, reward: { gold: 560, cores: 14 } },
        { id: 's4', xp: 540, reward: { fragments: { frost: 18, rocket: 18 } } },
        { id: 's5', xp: 760, reward: { gold: 820, cores: 22 } },
        { id: 's6', xp: 1020, reward: { fragments: { chain: 24 } } },
        { id: 's7', xp: 1320, reward: { gold: 1100, cores: 28 } },
        { id: 's8', xp: 1660, reward: { fragments: { rail: 28 }, cores: 36 } },
        { id: 's9', xp: 2060, reward: { gold: 1560, cores: 40 } },
        { id: 's10', xp: 2500, reward: { fragments: { frost: 22, rocket: 22, chain: 18 } } },
        { id: 's11', xp: 3000, reward: { gold: 2140, cores: 56, fragments: { rail: 18 } } },
        { id: 's12', xp: 3600, reward: { fragments: { rail: 32, chain: 24 }, cores: 72 } },
        { id: 's13', xp: 4300, reward: { gold: 2860, cores: 84, fragments: { rocket: 24, chain: 20 } } },
        { id: 's14', xp: 5150, reward: { fragments: { rail: 26, frost: 26, chain: 22 }, cores: 96 } },
        { id: 's15', xp: 6150, reward: { gold: 3980, cores: 124, fragments: { rail: 24, rocket: 28 } } },
        { id: 's16', xp: 7350, reward: { gold: 5200, cores: 160, fragments: { frost: 30, rocket: 30, chain: 30, rail: 28 } } }
    ];

    const UPGRADE_CHOICES = [
        { id: 'damage', label: { zh: '鍏ㄨ矾鐏姏 +18%', en: 'All lane damage +18%' }, hint: { zh: '鐏姏澧炲箙', en: 'Damage Boost' }, apply: (battle) => { battle.modifiers.damage *= 1.18; } },
        { id: 'speed', label: { zh: '鍏ㄨ矾鏀婚€?+16%', en: 'All lane fire rate +16%' }, hint: { zh: '鍐峰嵈鍔犻€', en: 'Cooldown Speed' }, apply: (battle) => { battle.modifiers.attackSpeed *= 1.16; } },
        { id: 'gold', label: { zh: '鏈眬閲戝竵鏀剁泭 +22%', en: 'Gold gain this run +22%' }, hint: { zh: '鎴樺埄鍥炴敹', en: 'Salvage Boost' }, apply: (battle) => { battle.modifiers.gold *= 1.22; } },
        { id: 'shield', label: { zh: '鏍稿績绔嬪嵆鑾峰緱棰濆鎶ょ浘', en: 'Gain instant shield' }, hint: { zh: '鎶ょ浘鍔犲帤', en: 'Shield Boost' }, apply: (battle) => { battle.shield = Math.min(getCoreShieldCap() * 1.45, battle.shield + 70 + getResearchLevel('fortify') * 10); } },
        { id: 'freeze', label: { zh: '鐐彴鍛戒腑闄勫甫 12% 鍐扮紦', en: '12% slow chance on hit' }, hint: { zh: '鍐扮紦鎵╂暎', en: 'Freeze Spread' }, apply: (battle) => { battle.modifiers.freezeChance += 0.12; } },
        { id: 'splash', label: { zh: '鐐彴杩藉姞 20% 婧呭皠浼ゅ', en: '20% splash damage added' }, hint: { zh: '鐖嗚閾惧紡', en: 'Splash Chain' }, apply: (battle) => { battle.modifiers.splashBonus += 0.2; } },
        { id: 'repair', label: { zh: '鏍稿績淇 +28 骞惰ˉ鐩', en: 'Repair core +28 and shield' }, hint: { zh: '绋充綇闃茬嚎', en: 'Stabilize Core' }, apply: (battle) => { battle.coreHp = Math.min(getCoreMaxHp(), battle.coreHp + 28 + getResearchLevel('fortify') * 4); battle.shield = Math.min(getCoreShieldCap() * 1.7, battle.shield + 38 + getResearchLevel('fortify') * 6); } },
        { id: 'skillReset', label: { zh: '鎶€鑳藉喎鍗?-8 绉', en: 'Skill cooldown -8s' }, hint: { zh: '鎶€鑳藉洖璺', en: 'Skill Loop' }, apply: (battle) => { battle.skillCooldown = Math.max(0, battle.skillCooldown - 8); battle.laneSkillGlow = SKILL_READY_GLOW_MS; } },
        { id: 'bossBreak', label: { zh: '绮捐嫳 / Boss 浼ゅ +35%', en: 'Elite/Boss damage +35%' }, hint: { zh: '閲嶅帇鍏嬪埗', en: 'Pressure Breaker' }, apply: (battle) => { battle.modifiers.eliteDamage *= 1.35; } },
        { id: 'coreFlow', label: { zh: '鑳芥牳鎺夎惤 +45%', en: 'Core drops +45%' }, hint: { zh: '鑳芥牳鍥炴祦', en: 'Core Flow' }, apply: (battle) => { battle.modifiers.coreGain *= 1.45; } }
    ];

    const SHOP_ITEMS = [
        {
            id: 'goldCrate',
            priceType: 'gold',
            basePrice: 920,
            kicker: { zh: '920 G', en: '920 G' },
            slot: { zh: '鎴愰暱纰庣墖', en: 'Growth Fragments' },
            title: { zh: '钃濆浘琛ョ粰绠', en: 'Blueprint Crate' },
            desc: { zh: '閲戝竵鍚戝熀纭€璧勬簮绠憋紝鍋忓悜闇滃喕 / 鐏 / 閾惧嚮鐨勪腑鏈熸垚闀裤€', en: 'A gold sink for mid-game fragment growth focused on Frost, Rocket, and Chain.' }
        },
        {
            id: 'forgeCrate',
            priceType: 'gold',
            basePrice: 2480,
            kicker: { zh: '2480 G', en: '2480 G' },
            slot: { zh: '鎺ㄨ繘鍐涙', en: 'Push Arsenal' },
            title: { zh: '鍓嶇嚎鍐涙绠', en: 'Frontline Arsenal' },
            desc: { zh: '涓哄崱绔犺妭鍑嗗鐨勯珮闃堕噾甯佺锛屼細琛ュ厖鑳芥牳銆佽禌瀛ｇ粡楠屽拰楂樺帇绔犺妭甯哥敤纰庣墖銆', en: 'A heavier gold sink for chapter walls with cores, Season XP, and higher-tier fragments.' }
        },
        {
            id: 'coreCrate',
            priceType: 'core',
            basePrice: 34,
            kicker: { zh: '34 C', en: '34 C' },
            slot: { zh: '绋€鏈夌', en: 'Rare Box' },
            title: { zh: '楂樿兘涓户绠', en: 'High-Energy Relay' },
            desc: { zh: '鑳芥牳鍚戣ˉ缁欑锛屼富瑕佽ˉ杩為攣 / 杞ㄧ偖纰庣墖锛屽苟甯﹀洖涓€閮ㄥ垎閲戝竵涓庤禌瀛ｇ粡楠屻€', en: 'A core sink that feeds Chain and Rail growth while refunding some gold and Season XP.' }
        },
        {
            id: 'relayCrate',
            priceType: 'core',
            basePrice: 72,
            kicker: { zh: '72 C', en: '72 C' },
            slot: { zh: '鍚庢湡鏍稿績', en: 'Late Core' },
            title: { zh: '鐭╅樀涓灑绠', en: 'Matrix Nexus Crate' },
            desc: { zh: '鍋忓悗鏈熺殑楂橀樁鑳芥牳绠憋紝涓撻棬鎻愰珮璧涘鎺ㄨ繘涓庤建鐐?/ 閾惧嚮鏀堕泦鏁堢巼銆', en: 'A late-game core sink built to speed up Season progress and Rail/Chain collection.' }
        }
    ];

    const DEFENSE_PAYMENT_OFFERS = [
        {
            id: 'starter',
            price: 1.0,
            accent: '#57e5ff',
            badge: { zh: '棣栧厖鎺ㄨ崘', en: 'Starter' },
            name: { zh: '鍓嶇嚎琛ョ粰', en: 'Frontline Cache' },
            desc: { zh: '蹇€熻ˉ瓒冲墠鏈熼噾甯併€佽兘鏍稿拰鍩虹濉斿彴纰庣墖锛岃鍓嶄笁绔犳帹杩涙洿骞崇ǔ銆', en: 'A light first pack that stabilizes gold, cores, and starter tower fragments.' },
            reward: { gold: 3200, cores: 28, seasonXp: 120, fragments: { pulse: 20, laser: 18, harvest: 16 } }
        },
        {
            id: 'accelerator',
            price: 2.99,
            accent: '#ff8fe8',
            badge: { zh: '涓湡鎻愰€', en: 'Value' },
            name: { zh: '涓户鍔犻€熺', en: 'Relay Booster' },
            desc: { zh: '閫傚悎琛ュ己涓湡娉㈡鍘嬪姏锛屾彁渚涙洿瀹炵敤鐨勫喕缁撱€佺伀绠拰杩為攣纰庣墖銆', en: 'A mid-loop power spike with more practical fragments for dangerous waves.' },
            reward: { gold: 9800, cores: 86, seasonXp: 320, fragments: { frost: 24, rocket: 24, chain: 12 } }
        },
        {
            id: 'rush',
            price: 3.99,
            accent: '#ffb168',
            badge: { zh: '鍐插叧瀹炶', en: 'Rush' },
            name: { zh: '鍘嬪埗绐佸洿鍖', en: 'Pressure Breaker' },
            desc: { zh: '涓撲负鍗＄珷鑺傜偣鍑嗗锛屽吋椤鹃噾甯併€佽兘鏍稿拰楂樺帇绔犺妭闇€瑕佺殑楂橀樁纰庣墖銆', en: 'Designed for chapter walls with extra economy and higher-tier fragments.' },
            reward: { gold: 14800, cores: 132, seasonXp: 480, fragments: { rocket: 28, chain: 18, rail: 10 } }
        },
        {
            id: 'sovereign',
            price: 5.99,
            accent: '#ffe27b',
            badge: { zh: '鏍稿績鎴愰暱', en: 'Core' },
            name: { zh: '鎸囨尌涓灑鍖', en: 'Command Relay' },
            desc: { zh: '鍚屾琛ュ己鎴樺姏涓庤禌瀛ｆ敹鐩婏紝閫傚悎寮€濮嬪啿鍑讳腑鍚庢湡绔犺妭銆', en: 'A stronger growth bundle for deeper chapter pushes and season progress.' },
            reward: { gold: 24000, cores: 210, seasonXp: 760, fragments: { frost: 28, rocket: 28, chain: 22, rail: 16 } }
        },
        {
            id: 'nexus',
            price: 9.99,
            accent: '#7dffb3',
            badge: { zh: '鍚庢湡鏍稿績', en: 'Endgame' },
            name: { zh: '鍫″瀿鏍稿績鍖', en: 'Citadel Core' },
            desc: { zh: '鍥寸粫鍚庢湡闃靛琛ョ粰锛岀洿鎺ユ彁楂樿兘鏍稿偍澶囧拰杩為攣 / 杞ㄧ偖鎴愰暱閫熷害銆', en: 'An endgame pack that boosts core stock and high-tier tower growth.' },
            reward: { gold: 42000, cores: 360, seasonXp: 1200, fragments: { frost: 32, rocket: 32, chain: 34, rail: 28 } }
        },
        {
            id: 'throne',
            price: 12.99,
            accent: '#89c9ff',
            badge: { zh: '缁堝眬鏁村', en: 'Summit' },
            name: { zh: '鍒涗笘鍐涙搴', en: 'Genesis Arsenal' },
            desc: { zh: '瑕嗙洊鏁村濉斿彴鎴愰暱鎵€闇€锛岄€傚悎鍑嗗闀挎湡瀹堢嚎涓庡啿璧涘濂栧姳銆', en: 'A full arsenal bundle built for long-term defense and season chasing.' },
            reward: { gold: 62000, cores: 520, seasonXp: 1800, fragments: { pulse: 40, laser: 40, harvest: 40, frost: 36, rocket: 36, chain: 30, rail: 24 } }
        }
    ];

    const SPONSOR_SEASON_NODES = [
        { id: 'p1', xp: 140, reward: { gold: 1800, cores: 20 } },
        { id: 'p2', xp: 380, reward: { fragments: { frost: 18, rocket: 18 } } },
        { id: 'p3', xp: 760, reward: { gold: 3600, cores: 42 } },
        { id: 'p4', xp: 1200, reward: { fragments: { chain: 24, rail: 18 } } },
        { id: 'p5', xp: 1700, reward: { gold: 5600, cores: 72, fragments: { rail: 20 } } },
        { id: 'p6', xp: 2280, reward: { gold: 7600, cores: 96, fragments: { chain: 28 } } },
        { id: 'p7', xp: 3000, reward: { fragments: { frost: 24, rocket: 24, rail: 24 } } },
        { id: 'p8', xp: 3900, reward: { gold: 11200, cores: 140, fragments: { chain: 30, rail: 30 } } },
        { id: 'p9', xp: 5000, reward: { gold: 14800, cores: 180, fragments: { frost: 28, rocket: 28, rail: 24 } } },
        { id: 'p10', xp: 6400, reward: { gold: 19600, cores: 240, fragments: { chain: 34, rail: 34, rocket: 30 } } }
    ];

    const LANE_POSITIONS = [170, 360, 550];

    const initialSave = loadSave();
    const state = {
        lang: getInitialLang(),
        soundEnabled: true,
        save: initialSave,
        activeTab: 'defend',
        toastTimer: 0,
        renderQueued: false,
        battle: createEmptyBattle(initialSave)
    };

    const ui = {};
    let currentPaymentOrder = null;
    let selectedPaymentOfferId = DEFENSE_PAYMENT_OFFERS[0].id;
    let paymentCountdownTimer = 0;
    let paymentVerificationState = 'idle';
    let paymentVerificationError = '';
    let paymentVerificationNotice = '';
    let paymentOrderNonce = 0;
    let paymentOrderRequestPromise = null;
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheDom();
        bindStaticEvents();
        markHubOpen();
        applyLanguage();
        updateStartPanel();
        renderAll();
        flushPendingPaymentClaims().catch(() => {});
        paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
        startLoop();
    }

    function cacheDom() {
        ui.canvas = document.getElementById('battlefieldCanvas');
        ui.ctx = ui.canvas.getContext('2d');
        ui.toast = document.getElementById('toast');
        ui.panelContent = document.getElementById('panelContent');
        ui.tabBar = document.getElementById('tabBar');
        ui.laneStrip = document.getElementById('laneStrip');
        ui.startOverlay = document.getElementById('startOverlay');
        ui.startMeta = document.getElementById('startMeta');
        ui.startDescription = document.getElementById('startDescription');
        ui.upgradeOverlay = document.getElementById('upgradeOverlay');
        ui.upgradeChoiceGrid = document.getElementById('upgradeChoiceGrid');
        ui.pauseOverlay = document.getElementById('pauseOverlay');
        ui.resultOverlay = document.getElementById('resultOverlay');
        ui.resultKicker = document.getElementById('resultKicker');
        ui.resultTitle = document.getElementById('resultTitle');
        ui.resultGold = document.getElementById('resultGold');
        ui.resultCore = document.getElementById('resultCore');
        ui.resultSeason = document.getElementById('resultSeason');
        ui.resultProgress = document.getElementById('resultProgress');
        ui.resultFragments = document.getElementById('resultFragments');
        ui.resultMeta = document.getElementById('resultMeta');
        ui.waveValue = document.getElementById('waveValue');
        ui.chapterValue = document.getElementById('chapterValue');
        ui.coreHpValue = document.getElementById('coreHpValue');
        ui.threatValue = document.getElementById('threatValue');
        ui.goldValue = document.getElementById('goldValue');
        ui.coreValue = document.getElementById('coreValue');
        ui.fragmentValue = document.getElementById('fragmentValue');
        ui.seasonLevelValue = document.getElementById('seasonLevelValue');
        ui.ratingValue = document.getElementById('ratingValue');
        ui.bestStageValue = document.getElementById('bestStageValue');
        ui.skillBtn = document.getElementById('skillBtn');
        ui.loadoutShortcutBtn = document.getElementById('loadoutShortcutBtn');
        ui.pauseBtn = document.getElementById('pauseBtn');
        ui.battleNote = document.getElementById('battleNote');
        ui.soundToggle = document.getElementById('soundToggle');
        ui.langToggle = document.getElementById('langToggle');
        ui.startRunBtn = document.getElementById('startRunBtn');
        ui.resumeBtn = document.getElementById('resumeBtn');
        ui.quitRunBtn = document.getElementById('quitRunBtn');
        ui.restartRunBtn = document.getElementById('restartRunBtn');
        ui.nextChapterBtn = document.getElementById('nextChapterBtn');
        ui.paymentModal = document.getElementById('defensePaymentModal');
        ui.paymentOfferGrid = document.getElementById('defensePaymentOfferGrid');
        ui.paymentCloseBtn = document.getElementById('defensePaymentCloseBtn');
        ui.paymentTitle = document.getElementById('defensePaymentTitle');
        ui.paymentDesc = document.getElementById('defensePaymentDesc');
        ui.paymentAmount = document.getElementById('defensePaymentAmount');
        ui.paymentMeta = document.getElementById('defensePaymentMeta');
        ui.paymentOrderLabel = document.getElementById('defensePaymentOrderLabel');
        ui.paymentOrderId = document.getElementById('defensePaymentOrderId');
        ui.paymentExactLabel = document.getElementById('defensePaymentExactLabel');
        ui.paymentExactAmount = document.getElementById('defensePaymentExactAmount');
        ui.paymentExpiryLabel = document.getElementById('defensePaymentExpiryLabel');
        ui.paymentExpiry = document.getElementById('defensePaymentExpiry');
        ui.paymentAddressLabel = document.getElementById('defensePaymentAddressLabel');
        ui.paymentWallet = document.getElementById('defensePaymentWallet');
        ui.paymentCopyAddressBtn = document.getElementById('defensePaymentCopyAddressBtn');
        ui.paymentCopyAmountBtn = document.getElementById('defensePaymentCopyAmountBtn');
        ui.paymentTxidLabel = document.getElementById('defensePaymentTxidLabel');
        ui.paymentTxidInput = document.getElementById('defensePaymentTxidInput');
        ui.paymentTxidHint = document.getElementById('defensePaymentTxidHint');
        ui.paymentStatus = document.getElementById('defensePaymentStatus');
        ui.paymentVerifyBtn = document.getElementById('defensePaymentVerifyBtn');
    }

    function bindStaticEvents() {
        ui.langToggle.addEventListener('click', () => {
            state.lang = state.lang === 'zh' ? 'en' : 'zh';
            try { localStorage.setItem(HUB_LANG_KEY, state.lang); } catch (error) {}
            applyLanguage();
            updateStartPanel();
            renderAll();
        });

        ui.soundToggle.addEventListener('click', () => {
            state.soundEnabled = !state.soundEnabled;
            renderActionBar();
        });

        ui.startRunBtn.addEventListener('click', () => startBattle(false));
        ui.resumeBtn.addEventListener('click', resumeBattle);
        ui.quitRunBtn.addEventListener('click', () => finishBattle(false, true));
        ui.restartRunBtn.addEventListener('click', () => startBattle(true));
        ui.nextChapterBtn.addEventListener('click', () => {
            if (state.save.chapterIndex < CHAPTERS.length - 1) {
                state.save.chapterIndex = Math.min(state.save.chapterIndex + 1, state.save.bestChapterIndex);
            }
            saveProgress();
            hideOverlay(ui.resultOverlay);
            updateStartPanel();
            renderAll();
        });

        ui.pauseBtn.addEventListener('click', pauseBattle);
        ui.loadoutShortcutBtn.addEventListener('click', () => switchTab('loadout'));
        ui.skillBtn.addEventListener('click', useSkill);

        ui.tabBar.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-tab]');
            if (btn) switchTab(btn.dataset.tab);
        });

        ui.laneStrip.addEventListener('click', (event) => {
            const target = event.target.closest('[data-lane-index]');
            if (!target) return;
            state.save.selectedLane = Number(target.dataset.laneIndex) || 0;
            switchTab('loadout');
        });

        ui.panelContent.addEventListener('click', onPanelAction);

        ui.upgradeChoiceGrid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-upgrade-choice]');
            if (button && state.battle.awaitingUpgrade) applyUpgradeChoice(button.dataset.upgradeChoice);
        });

        ui.paymentCloseBtn?.addEventListener('click', closePaymentModal);
        ui.paymentModal?.addEventListener('click', (event) => {
            if (event.target === ui.paymentModal) {
                closePaymentModal();
            }
        });
        ui.paymentOfferGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-select-payment-offer]');
            if (!button) return;
            selectPaymentOffer(button.dataset.selectPaymentOffer || DEFENSE_PAYMENT_OFFERS[0].id);
        });
        ui.paymentCopyAddressBtn?.addEventListener('click', copyPaymentAddress);
        ui.paymentCopyAmountBtn?.addEventListener('click', copyPaymentAmount);
        ui.paymentVerifyBtn?.addEventListener('click', handlePaymentConfirm);
        ui.paymentTxidInput?.addEventListener('input', () => {
            paymentVerificationState = paymentVerificationState === 'verified' ? 'verified' : 'idle';
            paymentVerificationError = '';
            paymentVerificationNotice = paymentVerificationState === 'verified' ? paymentVerificationNotice : '';
            refreshPaymentVerificationState();
        });

        window.addEventListener('resize', queueRender);
        window.addEventListener('beforeunload', saveProgress);
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
                closePaymentModal();
            }
        });
    }

    function onPanelAction(event) {
        const actionNode = event.target.closest('[data-action]');
        if (!actionNode) return;
        const action = actionNode.dataset.action;
        const value = actionNode.dataset.value;

        switch (action) {
            case 'chapter':
                selectChapter(Number(value));
                break;
            case 'lane':
                state.save.selectedLane = Number(value) || 0;
                renderAll();
                break;
            case 'skill':
                state.save.selectedSkill = value;
                saveProgress();
                renderAll();
                break;
            case 'applyChapterPreset':
                applyChapterPreset(value || getCurrentChapter().id, true);
                break;
            case 'applyChapterLanePreset':
                applyChapterPreset(value || getCurrentChapter().id, false);
                break;
            case 'equipTower':
                equipTower(value);
                break;
            case 'upgradeTower':
                upgradeTower(value);
                break;
            case 'unlockTower':
                unlockTower(value);
                break;
            case 'upgradeResearch':
                upgradeResearch(value);
                break;
            case 'claimMission':
                claimMission(value);
                break;
            case 'claimSeason':
                claimSeason(value);
                break;
            case 'claimDaily':
                claimDailySupply();
                break;
            case 'buyShop':
                buyShopItem(value);
                break;
            case 'openPayment':
                openPaymentModal(value || null);
                break;
            case 'openTab':
                switchTab(value || 'defend');
                break;
            case 'startChapter':
                startBattle(false);
                break;
            case 'claimSponsorSeason':
                claimSponsorSeason(value);
                break;
            default:
                break;
        }
    }

    function createEmptyBattle(saveSnapshot = state.save) {
        return {
            running: false,
            paused: false,
            finished: false,
            awaitingUpgrade: false,
            currentWave: 0,
            currentWaveElapsed: 0,
            totalElapsed: 0,
            enemies: [],
            spawnQueue: [],
            laneTimers: [0, 0, 0],
            laneFlash: [0, 0, 0],
            laneSkillGlow: 0,
            nextEnemyId: 1,
            coreHp: getCoreMaxHp(saveSnapshot),
            shield: 0,
            skillCooldown: 0,
            skillEffectTimer: 0,
            skillEffect: null,
            modifiers: {
                damage: 1,
                attackSpeed: 1,
                gold: 1,
                eliteDamage: 1,
                coreGain: 1,
                freezeChance: 0,
                splashBonus: 0
            },
            pendingChoices: [],
            runStats: {
                kills: 0,
                damage: 0,
                bossKills: 0,
                clearedWaves: 0
            },
            result: null,
            lastFrame: performance.now()
        };
    }

    function getInitialLang() {
        try {
            const saved = localStorage.getItem(HUB_LANG_KEY);
            if (saved === 'zh' || saved === 'en') return saved;
        } catch (error) {}
        return String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    function loadSave() {
        const base = {
            gold: 2800,
            cores: 140,
            chapterIndex: 0,
            bestChapterIndex: 0,
            seasonXp: 0,
            selectedSkill: 'emp',
            selectedLane: 0,
            laneLoadout: ['pulse', 'laser', 'harvest'],
            towerLevels: { pulse: 1, laser: 1, frost: 0, rocket: 0, harvest: 1, chain: 0, rail: 0 },
            towerFragments: { pulse: 20, laser: 20, frost: 18, rocket: 22, harvest: 20, chain: 14, rail: 6 },
            researches: { attack: 0, cadence: 0, fortify: 0, salvage: 0, relay: 0 },
            shopPurchases: {},
            missionClaimed: [],
            seasonClaimed: [],
            dailySupplyAt: 0,
            stats: { runs: 0, wins: 0, kills: 0, bossKills: 0, skillsUsed: 0, researchDone: 0, totalDamage: 0 },
            payment: {
                minerId: '',
                purchaseCount: 0,
                totalSpent: 0,
                passUnlocked: false,
                claimedOrders: {},
                pendingClaims: {},
                premiumSeasonClaims: {},
                verifiedTxids: []
            }
        };

        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return base;
            const parsed = JSON.parse(raw);
            return {
                ...base,
                ...parsed,
                laneLoadout: Array.isArray(parsed?.laneLoadout) && parsed.laneLoadout.length === 3 ? parsed.laneLoadout.slice(0, 3) : base.laneLoadout,
                towerLevels: { ...base.towerLevels, ...(parsed?.towerLevels || {}) },
                towerFragments: { ...base.towerFragments, ...(parsed?.towerFragments || {}) },
                researches: { ...base.researches, ...(parsed?.researches || {}) },
                shopPurchases: { ...base.shopPurchases, ...(parsed?.shopPurchases || {}) },
                missionClaimed: Array.isArray(parsed?.missionClaimed) ? parsed.missionClaimed : [],
                seasonClaimed: Array.isArray(parsed?.seasonClaimed) ? parsed.seasonClaimed : [],
                stats: { ...base.stats, ...(parsed?.stats || {}) },
                payment: {
                    ...base.payment,
                    ...(parsed?.payment || {}),
                    claimedOrders: { ...base.payment.claimedOrders, ...((parsed?.payment && parsed.payment.claimedOrders) || {}) },
                    pendingClaims: { ...base.payment.pendingClaims, ...((parsed?.payment && parsed.payment.pendingClaims) || {}) },
                    premiumSeasonClaims: { ...base.payment.premiumSeasonClaims, ...((parsed?.payment && parsed.payment.premiumSeasonClaims) || {}) },
                    verifiedTxids: Array.isArray(parsed?.payment?.verifiedTxids)
                        ? Array.from(new Set(parsed.payment.verifiedTxids)).slice(0, 100)
                        : []
                }
            };
        } catch (error) {
            return base;
        }
    }

    function saveProgress(showToastMessage) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
            if (showToastMessage) showToast(t('toastSaved'));
        } catch (error) {}
    }

    function markHubOpen() {
        try {
            const profile = JSON.parse(localStorage.getItem(HUB_PROFILE_KEY) || '{}');
            profile.lastGameId = 'defense';
            profile.gameOpens = profile.gameOpens && typeof profile.gameOpens === 'object' ? profile.gameOpens : {};
            profile.gameOpens.defense = Math.max(0, Number(profile.gameOpens.defense) || 0) + 1;
            profile.interestedGameIds = Array.isArray(profile.interestedGameIds) ? profile.interestedGameIds : [];
            if (!profile.interestedGameIds.includes('defense')) profile.interestedGameIds.push('defense');
            localStorage.setItem(HUB_PROFILE_KEY, JSON.stringify(profile));
        } catch (error) {}
    }

    function t(key) {
        return (TEXT[state.lang] && TEXT[state.lang][key]) || (TEXT.zh && TEXT.zh[key]) || key;
    }

    function getLocalized(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value[state.lang] || value.zh || value.en || '';
    }

    function formatCompact(value) {
        const numeric = Number(value) || 0;
        const locale = state.lang === 'zh' ? 'zh-CN' : 'en-US';
        if (Math.abs(numeric) < 1000) return numeric.toLocaleString(locale);
        return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(numeric);
    }

    function formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
    }

    function applyLanguage() {
        document.title = t('pageTitle');
        document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
        ui.langToggle.textContent = state.lang === 'zh' ? 'EN' : '涓';
        document.querySelectorAll('[data-i18n]').forEach((node) => {
            const key = node.getAttribute('data-i18n');
            node.textContent = t(key);
        });
    }

    function renderAll() {
        renderSummary();
        renderHud();
        renderActionBar();
        renderLaneStrip();
        renderPanel();
        renderTabState();
        if (ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            renderPaymentOfferGrid();
            renderPaymentOrderUI();
            refreshPaymentVerificationState();
        }
        drawBattlefield();
    }

    function queueRender() {
        if (state.renderQueued) return;
        state.renderQueued = true;
        requestAnimationFrame(() => {
            state.renderQueued = false;
            renderAll();
        });
    }

    function renderSummary() {
        ui.goldValue.textContent = formatCompact(state.save.gold);
        ui.coreValue.textContent = formatCompact(state.save.cores);
        ui.fragmentValue.textContent = formatCompact(getTotalFragments(state.save));
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        ui.seasonLevelValue.textContent = `Lv.${seasonInfo.level}`;
        ui.ratingValue.textContent = formatCompact(getPowerRating(state.save));
        ui.bestStageValue.textContent = CHAPTERS[state.save.bestChapterIndex]?.id || CHAPTERS[0].id;
    }

    function renderHud() {
        const chapter = getCurrentChapter();
        ui.chapterValue.textContent = chapter.id;
        ui.waveValue.textContent = state.battle.running || state.battle.finished
            ? t('waveText').replace('{wave}', String(Math.max(1, state.battle.currentWave)))
            : `0 / ${TOTAL_WAVES}`;
        ui.coreHpValue.textContent = `${Math.max(0, Math.round(state.battle.coreHp))} / ${getCoreMaxHp()}`;
        ui.threatValue.textContent = t(getThreatKey());
        ui.battleNote.textContent = getBattleNoteText(chapter);
        updateStartPanel();
    }

    function renderActionBar() {
        ui.soundToggle.textContent = state.soundEnabled ? 'SFX ON' : 'SFX OFF';
        const skill = SKILLS[state.save.selectedSkill];
        ui.skillBtn.textContent = state.battle.skillCooldown <= 0
            ? t('skillReady').replace('{skill}', t(skill.nameKey))
            : t('skillCooling').replace('{skill}', t(skill.nameKey)).replace('{time}', String(state.battle.skillCooldown.toFixed(1)));
        ui.skillBtn.disabled = !state.battle.running || state.battle.awaitingUpgrade || state.battle.paused;
        ui.pauseBtn.disabled = !state.battle.running || state.battle.finished;
    }

    function renderLaneStrip() {
        ui.laneStrip.innerHTML = state.save.laneLoadout.map((towerId, index) => {
            const tower = TOWERS[towerId];
            const level = getTowerLevel(towerId);
            const dps = tower ? Math.round(getTowerPreviewDps(towerId)) : 0;
            return `
                <button class="lane-slot ${state.save.selectedLane === index ? 'active' : ''}" type="button" data-lane-index="${index}">
                    <div class="lane-slot-top">
                        <span class="lane-name">${getLaneName(index)}</span>
                        <span class="lane-dps">${t('laneStripDps')} ${formatCompact(dps)}</span>
                    </div>
                    <div class="lane-tower">${tower ? towerLabel(towerId) : t('laneStripEmpty')}</div>
                    <div class="lane-meta">${tower ? `${t('laneStripLevel').replace('{level}', level)} 路 ${rarityLabel(tower.tier)}` : ''}</div>
                </button>
            `;
        }).join('');
    }

    function renderPanel() {
        switch (state.activeTab) {
            case 'loadout': renderLoadoutTab(); break;
            case 'research': renderResearchTab(); break;
            case 'missions': renderMissionsTab(); break;
            case 'season': renderSeasonTab(); break;
            case 'shop': renderShopTab(); break;
            default: renderDefendTab(); break;
        }
    }

    function renderPanelHead(title, desc, extra) {
        return `<div class="panel-head"><div><h3>${title}</h3><p>${desc}</p></div>${extra || ''}</div>`;
    }

    function getChapterFocusPreview(chapter) {
        return chapter.fragmentFocus.map((towerId) => towerLabel(towerId)).join(' / ');
    }

    function getRecommendedSkillIdForChapter(chapter) {
        if (chapter.id === '1-1' || chapter.id === '1-2') return 'emp';
        if (chapter.id === '1-3' || chapter.id === '2-1') return 'overclock';
        if (chapter.id === '3-1') return 'overclock';
        if (chapter.id === '3-2' || chapter.id === '3-3') return 'shield';
        return 'shield';
    }

    function getChapterOpeningGuide(chapter) {
        const map = {
            '1-1': {
                zh: '寮€灞€鍏堢ǔ浣忎腑璺紝鍐嶇敤閲囬泦濉旀妸鍓嶄袱娉㈤噾甯佹粴璧锋潵銆',
                en: 'Stabilize the middle lane first, then let Harvest snowball the first two waves.'
            },
            '1-2': {
                zh: '绗?2 娉㈠揩鎬細鎻愰€燂紝EMP 涓嶈鍦ㄥ紑鍦虹┖鏀俱€',
                en: 'Fast enemies spike on wave 2, so do not waste EMP on the opener.'
            },
            '1-3': {
                zh: '鍏堣ˉ鍑忛€熻矾锛屽啀琛ョ垎瑁傝矾锛屽紑灞€鍒€ョ潃杩芥眰涓夎矾骞冲潎銆',
                en: 'Lock in one slow lane and one splash lane before trying to balance all three.'
            },
            '2-1': {
                zh: '鎶ょ浘鎬紑濮嬫姮澶达紝浼樺厛璁╄繛閿佹垨杞ㄧ偖鎺ヤ綇涓悗娈点€',
                en: 'Shield units matter now, so let Chain or Rail own the mid-late stretch.'
            },
            '2-2': {
                zh: '鑷冲皯涓€鏉¤矾瑕佸厛鎴愬瀷锛屽啀鑰冭檻鐢ㄧ粡娴庡鍚冮暱绾挎敹鐩娿€',
                en: 'Complete one stable lane first, then convert spare room into economy.'
            },
            '2-3': {
                zh: '绗?6 娉㈠墠灏介噺淇濅綇婊＄浘锛岀粓灞€浼氱洿鎺ヨ€冧綘 Boss 澶勭悊銆',
                en: 'Try to stay near full shield before wave 6 because the boss check is direct.'
            },
            '3-1': {
                zh: '寮€灞€浼樺厛绋充綇涓よ矾娓呯嚎锛屽啀鐢ㄨ秴棰戞妸绗笁璺殑鐖嗗彂鎶捣鏉ャ€',
                en: 'Stabilize two lanes first, then use Overclock to raise the burst on the third.'
            },
            '3-2': {
                zh: '鍓嶄袱娉㈠厛鐣欐妧鑳斤紝绗?4 娉㈠紑濮嬩細鍑虹幇杩炵画鍙犲帇銆',
                en: 'Save your skill through the opener because chained pressure starts on wave 4.'
            },
            '3-3': {
                zh: '鍏堜繚鍑忛€熻矾鍜岃建鐐矾锛岀 6 娉㈠墠灏介噺鎶婃牳蹇冩姢鐩捐ˉ婊°€',
                en: 'Protect your slow lane and Rail lane first, and refill shield before wave 6.'
            }
        };
        return getLocalized(map[chapter.id] || {
            zh: '鍏堢湅鏁屾疆缁撴瀯锛屽啀鍥寸粫褰撳墠鏈€绋崇殑涓よ矾鏉ュ仛寮€灞€閮ㄧ讲銆',
            en: 'Read the enemy mix first, then anchor your opener around the two most stable lanes.'
        });
    }

    function getChapterWavePlan(chapter) {
        const map = {
            '1-1': { zh: '鑺傚骞崇ǔ锛岄噸鐐圭啛鎮変笁璺珯浣嶄笌鍗囩骇鏃舵満銆', en: 'A steady intro wave plan built to teach lanes and upgrade timing.' },
            '1-2': { zh: '绗?2 娉㈠揩鎬瘯鍘嬶紝绗?4 娉㈠紑濮嬪嚭鐜版洿鏄庢樉鐨勫垎璺媺鎵€', en: 'Wave 2 tests fast enemy control and wave 4 starts lane-pulling pressure.' },
            '1-3': { zh: '绗?3 娉㈠紑濮嬫贩鍏ュ垎瑁傛€紝绗?4-6 娉㈡洿鑰冮獙鍑忛€熶笌婧呭皠銆', en: 'Split enemies start on wave 3 and waves 4-6 lean harder on slow plus splash.' },
            '2-1': { zh: '绗?4 娉㈣捣浼氳繛缁嚭鐜伴珮琛€鍗曚綅锛岀粓灞€ Boss 鏇村亸姝ｉ潰鍘嬪埗銆', en: 'Wave 4 onward adds consecutive bulkier units before a direct boss check.' },
            '2-2': { zh: '涓湡娉㈡浼氭寔缁€冮獙缁忔祹涓庤緭鍑哄悓姝ユ垚鍨嬨€', en: 'Mid waves pressure both economy and damage at the same time.' },
            '2-3': { zh: '绗?5-6 娉㈡槑鏄炬彁鍘嬶紝缁撳熬浠ラ噸 Boss 娉㈠仛绔犺妭闂ㄦ銆', en: 'Waves 5-6 spike sharply and the chapter closes on a heavy boss gate.' },
            '3-1': { zh: '绗?2 娉㈠弻渚у揩鍘嬶紝绗?4 娉㈠弻绮捐嫳璇曞帇锛岀 6 娉?Boss 鍓嶅啀琛ヤ竴娆′晶璺啿绾裤€', en: 'Wave 2 sends side-lane speed pressure, wave 4 adds dual elites, and wave 6 rechecks side lanes before the boss.' },
            '3-2': { zh: '绗?2 娉㈠弻鎶ょ浘璧锋墜锛岀 4-5 娉㈣繛缁彔鍔犲垎瑁備笌绮捐嫳锛岀 6 娉?Boss 甯︽姢鐩炬敮鎻淬€', en: 'Wave 2 opens with double shield pressure, waves 4-5 stack split plus elite threats, and wave 6 adds boss support pressure.' },
            '3-3': { zh: '绗?2 娉笁璺揩鍘嬶紝绗?4-5 娉㈣繛缁笁绾垮彔鍘嬶紝绗?6 娉?Boss 鍓嶅悗閮芥湁渚ц矾绮捐嫳琛ュ帇銆', en: 'Wave 2 pressures all three lanes, waves 4-5 keep triple-lane stacking, and wave 6 wraps the boss with side-lane elite pressure.' }
        };
        return getLocalized(map[chapter.id] || {
            zh: '娉㈡浼氶€愭笎鎶婁笁璺竴璧锋姮鍘嬶紝鍔″繀鎻愬墠鍑嗗绋冲畾娓呯嚎鐐广€',
            en: 'Pressure rises toward all three lanes together, so prepare stable clear points early.'
        });
    }

    function getBattleWaveGuide(chapter, waveNumber) {
        const map = {
            '3-1': {
                2: { zh: '绗?2 娉㈠弻渚у揩鍘嬪凡杩涘満锛屽厛鐪嬭竟璺竻绾垮啀鍐冲畾鏄惁浜よ秴棰戙€', en: 'Wave 2 side-lane speed pressure is live. Read your side clears before spending Overclock.' },
                4: { zh: '绗?4 娉㈠弻绮捐嫳浼氬悓鏃惰瘯鍘嬩袱渚э紝鍒妸鍏ㄩ儴鐖嗗彂鍘嬪湪鍚屼竴璺€', en: 'Wave 4 sends dual elites into the side lanes, so do not overcommit all burst to one lane.' },
                6: { zh: 'Boss 鍓嶈繕鏈変竴杞晶璺啿绾匡紝鏍稿績鎶ょ浘鍒湪寮€娉㈠墠灏辫搴曘€', en: 'One more side-lane rush arrives before the boss, so do not enter the wave on empty shield.' }
            },
            '3-2': {
                2: { zh: '绗?2 娉㈠弻鎶ょ浘浼氭嫋闀挎垬绾匡紝鎶€鑳藉敖閲忕户缁繚鐣欍€', en: 'Wave 2 double shield units extend the fight, so keep your skill held if possible.' },
                4: { zh: '绗?4 娉㈠紑濮嬪垎瑁備笌鎶ょ浘鍙犲帇锛岃繛閿?/ 鐏浼氭瘮鍗曠偣鏇寸ǔ銆', en: 'Wave 4 stacks split and shield pressure, making Chain or Rocket safer than single-target lanes.' },
                5: { zh: '绗?5 娉㈠弻绮捐嫳鏄湰绔犳渶鍗遍櫓鐨勪腑娈佃妭鐐癸紝蹇呰鏃跺厛浜ゆ姢鐩俱€', en: 'Wave 5 dual elites are the most dangerous mid-run checkpoint here, so shielding early is fine.' },
                6: { zh: 'Boss 浼氬甫鐫€鏀彺鎬竴璧峰帇涓悗娈碉紝鍒瓑鏍稿績鎺夎鍚庢墠琛ョ浘銆', en: 'The boss arrives with support pressure, so refresh shield before the core starts leaking.' }
            },
            '3-3': {
                2: { zh: '绗?2 娉笁璺揩鍘嬩細鐩存帴鎽稿簳浣犵殑娓呯嚎鑳藉姏锛屼紭鍏堜繚鏈€钖勭殑涓€璺€', en: 'Wave 2 tests all three lanes immediately, so protect whichever lane is least stable.' },
                4: { zh: '绗?4 娉笁绾垮彔鍘嬪紑濮嬪舰鎴愶紝鍑忛€熻矾涓嶈兘鏂€', en: 'Wave 4 starts the true triple-lane stack, so your slow lane cannot collapse.' },
                5: { zh: '绗?5 娉細鎶婃姢鐩惧拰绮捐嫳涓€璧锋姮涓婃潵锛岀伀绠?/ 杩為攣鐨勮鐩栨瘮璐崟鍙戞洿閲嶈銆', en: 'Wave 5 stacks shield units with elites, so Rocket or Chain coverage beats greedy single shots.' },
                6: { zh: '鏈€缁堟尝浼氬湪 Boss 涓や晶鎸佺画琛ュ帇锛屽厛淇濅綇涓ょ考鍐嶉泦涓伀鍔涘鐞嗕腑蹇冦€', en: 'The final wave keeps feeding pressure into both sides of the boss, so hold the wings before hard-focusing center.' }
            }
        };
        return getLocalized(map[chapter.id]?.[waveNumber] || {
            zh: waveNumber <= 1 ? getChapterWavePlan(chapter) : t('battleNoteWave'),
            en: waveNumber <= 1 ? getChapterWavePlan(chapter) : t('battleNoteWave')
        });
    }

    function getBattleNoteText(chapter) {
        if (state.battle.awaitingUpgrade) return t('battleNoteUpgrade');
        if (state.battle.finished) return state.battle.result?.win ? t('battleNoteResultWin') : t('battleNoteResultLose');
        if (state.battle.running) return getBattleWaveGuide(chapter, state.battle.currentWave);
        return `${getChapterOpeningGuide(chapter)} ${getChapterWavePlan(chapter)}`;
    }

    function getChapterDirective(chapter) {
        const map = {
            '1-1': {
                zh: '寤鸿浠ヨ剦鍐插 / 婵€鍏夊 / 閲囬泦濉旇捣姝ワ紝鍏堢ǔ浣忔竻绾挎晥鐜囧拰鍓嶆湡閲戝竵鍥炴祦銆',
                en: 'Open with Pulse / Laser / Harvest to stabilize lanes and build early economy.'
            },
            '1-2': {
                zh: '楂橀€熸€細鏄庢樉澧炲姞锛屼紭鍏堣婵€鍏夊瀹堜富璺紝骞舵妸 EMP 鐣欑粰鏈€瀵嗛泦鐨勫啿绾挎尝娆°€',
                en: 'Fast enemies spike here. Let Laser hold the main lane and save EMP for the densest rushes.'
            },
            '1-3': {
                zh: '鍒嗚鎬拰绮捐嫳寮€濮嬫垚鍨嬶紝闇滃喕濉?+ 鐏濉旂殑鍑忛€熺垎瑁傜粍鍚堜細姣旂函缁忔祹鏇寸ǔ銆',
                en: 'Split enemies and elites start to matter, so Frost + Rocket is safer than pure economy.'
            },
            '2-1': {
                zh: '鎶ょ浘鎬閲忔姮鍗囧悗锛岄摼鍑诲寮€濮嬫帴绠′腑鍚庢鐏姏锛岃秴棰戦€傚悎鐢ㄦ潵寮洪《楂樺帇娉㈡銆',
                en: 'As shield units grow bulkier, Chain takes over mid-late DPS and Overclock carries pressure spikes.'
            },
            '2-2': {
                zh: '杩欐槸缁忔祹涓庤緭鍑哄弻妫€瀹氱珷鑺傦紝鑷冲皯淇濊瘉涓€璺ǔ瀹氭竻绾匡紝鍐嶈ˉ閲囬泦濉斿仛婊氶洩鐞冦€',
                en: 'This chapter tests both economy and damage. Lock one lane first, then snowball with Harvest.'
            },
            '2-3': {
                zh: 'Boss 娉㈡瀬閲嶏紝浼樺厛鍑嗗楂樼瓑绾ц建鐐?/ 閾惧嚮缁勫悎锛屽苟鍦ㄦ渶缁堟尝鍓嶅敖閲忎繚婊℃牳蹇冩姢鐩俱€',
                en: 'The boss wave is brutal. Prioritize high-level Rail / Chain setups and keep the core shield healthy.'
            },
            '3-1': {
                zh: '鑷冲皯璁╀袱璺叿澶囩ǔ瀹氭竻绾胯兘鍔涳紝鍐嶇敤瓒呴鎶婄涓夎矾鐨勭垎鍙戞姮璧锋潵锛涘崟闈犻噰闆嗗婊氶洩鐞冧細鏄庢樉鍚冨姏銆',
                en: 'Make sure two lanes can clear consistently, then use Overclock to raise the burst on the third lane. Harvest-only snowballing gets punished here.'
            },
            '3-2': {
                zh: '鎶ょ浘鎬笌鍒嗚鎬細杩炵画鏂藉帇锛屽缓璁敤鎶ょ浘鎶€鑳界‖椤跺嵄闄╂尝锛屽苟璁╅摼鍑?/ 鐏璐熻矗澶勭悊涓悗娈靛爢鎬€',
                en: 'Shield and split enemies stack together, so use the shield skill to absorb danger spikes and let Chain/Rocket handle clustered mid-late lanes.'
            },
            '3-3': {
                zh: '缁堢珷鐨勫叧閿笉鏄崟璺瀬闄愯緭鍑猴紝鑰屾槸涓夎矾閮戒笉鑳藉穿銆備紭鍏堜繚浣忓噺閫熻矾涓庤建鐐矾锛屽啀鐢ㄥ墿浣欒祫婧愯ˉ瓒崇涓夎矾銆',
                en: 'The final chapter is less about one perfect lane and more about preventing any lane collapse. Protect your slow lane and Rail lane first, then patch the third lane.'
            }
        };
        return getLocalized(map[chapter.id] || {
            zh: '鍥寸粫褰撳墠绔犺妭鏁屾疆鐗规€ц皟鏁磋閰嶄笌鎶€鑳斤紝璁╀笁璺帇鍔涘敖閲忓潎琛°€',
            en: 'Adjust your loadout and skill to the enemy mix so all three lanes stay balanced.'
        });
    }

    function getChapterPresetConfig(chapterId) {
        const map = {
            '1-1': { lanes: ['pulse', 'laser', 'harvest'], skill: 'emp' },
            '1-2': { lanes: ['laser', 'pulse', 'harvest'], skill: 'emp' },
            '1-3': { lanes: ['frost', 'rocket', 'harvest'], skill: 'overclock' },
            '2-1': { lanes: ['chain', 'frost', 'rocket'], skill: 'overclock' },
            '2-2': { lanes: ['harvest', 'chain', 'rocket'], skill: 'overclock' },
            '2-3': { lanes: ['frost', 'chain', 'rail'], skill: 'shield' },
            '3-1': { lanes: ['chain', 'frost', 'rail'], skill: 'overclock' },
            '3-2': { lanes: ['frost', 'rocket', 'chain'], skill: 'shield' },
            '3-3': { lanes: ['frost', 'chain', 'rail'], skill: 'shield' }
        };
        return map[chapterId] || { lanes: ['pulse', 'laser', 'harvest'], skill: getRecommendedSkillIdForChapter(getCurrentChapter()) };
    }

    function isTowerUnlockedForSave(towerId, saveSnapshot = state.save) {
        const tower = TOWERS[towerId];
        const level = Number(saveSnapshot.towerLevels?.[towerId]) || 0;
        return !!tower && (level > 0 || tower.unlockFragments === 0);
    }

    function getTowerPresetFallbacks(towerId) {
        const fallbackMap = {
            pulse: ['pulse', 'laser', 'harvest'],
            laser: ['laser', 'pulse', 'harvest'],
            harvest: ['harvest', 'pulse', 'laser'],
            frost: ['frost', 'laser', 'pulse', 'harvest'],
            rocket: ['rocket', 'laser', 'pulse', 'chain'],
            chain: ['chain', 'laser', 'pulse', 'rocket'],
            rail: ['rail', 'chain', 'rocket', 'laser', 'pulse']
        };
        return fallbackMap[towerId] || ['pulse', 'laser', 'harvest'];
    }

    function getChapterLoadoutPreset(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const config = getChapterPresetConfig(chapter.id);
        const used = new Set();
        const resolvedLanes = config.lanes.map((towerId, laneIndex) => {
            const preferredOrder = [
                towerId,
                ...getTowerPresetFallbacks(towerId),
                ...(saveSnapshot.laneLoadout || []),
                'pulse',
                'laser',
                'harvest'
            ];
            let resolved = preferredOrder.find((candidate) => !used.has(candidate) && isTowerUnlockedForSave(candidate, saveSnapshot));
            if (!resolved) {
                resolved = preferredOrder.find((candidate) => isTowerUnlockedForSave(candidate, saveSnapshot))
                    || saveSnapshot.laneLoadout?.[laneIndex]
                    || 'pulse';
            }
            used.add(resolved);
            return resolved;
        });
        return {
            chapterId: chapter.id,
            skill: config.skill,
            preferredLanes: config.lanes,
            lanes: resolvedLanes,
            usedFallback: resolvedLanes.some((towerId, index) => towerId !== config.lanes[index])
        };
    }

    function applyChapterPreset(chapterId, applySkill = true) {
        const chapter = CHAPTERS.find((item) => item.id === chapterId) || getCurrentChapter();
        const preset = getChapterLoadoutPreset(chapter);
        state.save.laneLoadout = preset.lanes.slice(0, 3);
        if (applySkill) {
            state.save.selectedSkill = preset.skill;
        }
        saveProgress();
        showToast(getLocalized({
            zh: applySkill ? `宸插簲鐢?${chapter.id} 鎺ㄨ崘缂栭槦` : `宸插簲鐢?${chapter.id} 鎺ㄨ崘鐏姏缁勫悎`,
            en: applySkill ? `${chapter.id} preset applied` : `${chapter.id} lane preset applied`
        }));
        renderAll();
    }

    function getClaimableMissionCount() {
        return MISSIONS.filter((mission) => !state.save.missionClaimed.includes(mission.id) && mission.metric(state.save) >= mission.target).length;
    }

    function getClaimableSeasonCount() {
        return SEASON_NODES.filter((node) => isSeasonClaimable(node.id)).length;
    }

    function getDefenseEconomyPreview(chapter = getCurrentChapter()) {
        const missionReady = getClaimableMissionCount();
        const seasonReady = getClaimableSeasonCount();
        const sponsorReady = getSponsorSeasonReadyCount();
        const dailyReady = isDailySupplyReady();
        const dailyRemaining = dailyReady
            ? getLocalized({ zh: '鏃ュ父琛ョ粰鍙鍙', en: 'Daily supply ready' })
            : getLocalized({
                zh: `涓嬩竴娆¤ˉ缁?${formatTime(DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - state.save.dailySupplyAt))}`,
                en: `Next supply ${formatTime(DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - state.save.dailySupplyAt))}`
            });
        const claimableTotal = missionReady + seasonReady + sponsorReady + (dailyReady ? 1 : 0);
        const powerGap = Math.max(0, chapter.recommended - getPowerRating(state.save));
        return {
            missionReady,
            seasonReady,
            sponsorReady,
            dailyReady,
            dailyRemaining,
            claimableTotal,
            powerGap,
            clearPreview: {
                gold: chapter.goldReward,
                cores: chapter.coreReward,
                fragments: chapter.fragmentReward
            }
        };
    }

    function renderDefendTab() {
        const current = getCurrentChapter();
        const focusPreview = getChapterFocusPreview(current);
        const recommendedSkill = t(SKILLS[getRecommendedSkillIdForChapter(current)].nameKey);
        const economyPreview = getDefenseEconomyPreview(current);
        const seasonTotalReady = economyPreview.seasonReady + economyPreview.sponsorReady;
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('defendPanelTitle'), t('defendPanelDesc'))}
            <div class="chapter-row">
                ${CHAPTERS.map((chapter, index) => `
                    <button class="chapter-btn ${index === state.save.chapterIndex ? 'active' : ''}" type="button" data-action="chapter" data-value="${index}" ${index > state.save.bestChapterIndex ? 'disabled' : ''}>
                        ${chapter.id}${index === state.save.chapterIndex ? ` 路 ${t('chapterBadgeCurrent')}` : ''}
                    </button>
                `).join('')}
            </div>
            <article>
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('chapterLabel')}</div>
                        <div class="card-title">${current.id}</div>
                    </div>
                    <div class="card-number">${t('recommendRating')} ${formatCompact(current.recommended)}</div>
                </div>
                <div class="card-copy">${getLocalized(current.trait)}</div>
                <div class="chip-row" style="margin-top:10px;">
                    <span class="mini-chip">${t('rewardPreview')} ${formatCompact(current.goldReward)}G</span>
                    <span class="mini-chip">${formatCompact(current.coreReward)} C</span>
                    <span class="mini-chip">${formatCompact(current.fragmentReward)} ${t('fragmentLabel')}</span>
                    <span class="mini-chip">${t('enemyPreview')} ${current.enemies.map((enemyId) => enemyLabel(enemyId)).join(' / ')}</span>
                    <span class="mini-chip">${getLocalized({ zh: `纰庣墖鍊惧悜 ${focusPreview}`, en: `Focus Drops ${focusPreview}` })}</span>
                    <span class="mini-chip">${getLocalized({ zh: `鎺ㄨ崘鎶€鑳?${recommendedSkill}`, en: `Recommended Skill ${recommendedSkill}` })}</span>
                </div>
                <div class="card-actions" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="startChapter" data-value="${state.save.chapterIndex}">${t('defendNow')}</button>
                </div>
            </article>
            <article>
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized({ zh: '绔犺妭鎴樻湳', en: 'Chapter Brief' })}</div>
                        <div class="card-title">${getLocalized({ zh: '鎺ㄨ崘瑁呴厤璺嚎', en: 'Recommended Build Path' })}</div>
                    </div>
                    <div class="card-number">${recommendedSkill}</div>
                </div>
                <div class="card-copy">${getChapterDirective(current)}</div>
                <div class="chip-row" style="margin-top:10px;">
                    ${current.fragmentFocus.map((towerId) => `<span class="mini-chip">${towerLabel(towerId)}</span>`).join('')}
                </div>
            </article>
            <div class="card-grid">
                <article class="stat-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('previewTowerPower')}</div>
                            <div class="card-title">${formatCompact(getPowerRating(state.save))}</div>
                        </div>
                        <div class="card-number">${t('statBest')} ${CHAPTERS[state.save.bestChapterIndex].id}</div>
                    </div>
                    <div class="card-copy">${t('chapterStateDesc')}</div>
                </article>
                <article class="stat-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('previewWavePressure')}</div>
                            <div class="card-title">${getLocalized({ zh: `共 ${TOTAL_WAVES} 波`, en: `${TOTAL_WAVES} Waves` })}</div>
                        </div>
                        <div class="card-number">${t('chapterInfoBoss')}</div>
                        </div>
                        <div class="card-copy">${getChapterWavePlan(current)}</div>
                    </article>
                <article class="stat-card">
                    <div class="card-top">
                        <div>
                        <div class="card-kicker">${t('previewEconomy')}</div>
                            <div class="card-title">${economyPreview.claimableTotal > 0
                                ? getLocalized({ zh: '寮€鎵撳墠鏈夎祫婧愬彲鍥炴敹', en: 'Resources are ready before the next run' })
                                : getLocalized({ zh: '鏈珷鑺傚洖鏀剁幆宸茬粡鎼ソ', en: 'This chapter loop is ready to fund itself' })}</div>
                        </div>
                        <div class="card-number">${economyPreview.claimableTotal > 0
                            ? getLocalized({ zh: `寰呴 ${economyPreview.claimableTotal}`, en: `${economyPreview.claimableTotal} ready` })
                            : economyPreview.dailyReady ? getLocalized({ zh: '鍙琛ョ粰', en: 'Supply ready' }) : economyPreview.dailyRemaining}</div>
                    </div>
                    <div class="card-copy">${economyPreview.powerGap > 0
                        ? getLocalized({
                            zh: `鎺ㄨ崘鍏堣ˉ ${formatCompact(economyPreview.powerGap)} 鎴樺姏鍐嶅啿鏈珷鑺傦紝鍚屾椂鍙厛鍥炴敹鏃ュ父 / 浠诲姟 / 璧涘璧勬簮銆`,
                            en: `You are about ${formatCompact(economyPreview.powerGap)} power short, so reclaim daily, mission, and season resources before pushing.`
                        })
                        : getLocalized({
                            zh: '褰撳墠鎴樺姏宸茬粡杈惧埌鎺ㄨ崘鍖洪棿锛屽彲鐩存帴寮€鎵撳苟绻佺粰璧勬簮鍥炴祦銆',
                            en: 'Your power is inside the recommended range, so you can defend now and keep the resource loop rolling.'
                        })}</div>
                    <div class="reward-row">
                        <span class="mini-chip">${getLocalized({ zh: `閫氬叧棰勮 ${formatCompact(economyPreview.clearPreview.gold)}G`, en: `Clear ${formatCompact(economyPreview.clearPreview.gold)}G` })}</span>
                        <span class="mini-chip">${getLocalized({ zh: `${formatCompact(economyPreview.clearPreview.cores)} C`, en: `${formatCompact(economyPreview.clearPreview.cores)} C` })}</span>
                        <span class="mini-chip">${getLocalized({ zh: `${formatCompact(economyPreview.clearPreview.fragments)} ${t('fragmentLabel')}`, en: `${formatCompact(economyPreview.clearPreview.fragments)} ${t('fragmentLabel')}` })}</span>
                        <span class="mini-chip">${economyPreview.dailyRemaining}</span>
                        <span class="mini-chip">${getLocalized({ zh: `浠诲姟寰呴 ${economyPreview.missionReady}`, en: `Missions ${economyPreview.missionReady}` })}</span>
                        <span class="mini-chip">${getLocalized({ zh: `璧涘寰呴 ${seasonTotalReady}`, en: `Season ${seasonTotalReady}` })}</span>
                    </div>
                    <div class="card-actions" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="${economyPreview.dailyReady ? 'claimDaily' : 'openTab'}" data-value="${economyPreview.dailyReady ? 'daily' : 'shop'}">
                            ${economyPreview.dailyReady
                                ? getLocalized({ zh: '鐩存帴棰嗗彇琛ョ粰', en: 'Claim Supply' })
                                : getLocalized({ zh: '鎵撳紑琛ョ粰', en: 'Open Supply' })}
                        </button>
                        ${economyPreview.missionReady > 0
                            ? `<button class="ghost-btn" type="button" data-action="openTab" data-value="missions">${getLocalized({ zh: `浠诲姟 x${economyPreview.missionReady}`, en: `Missions x${economyPreview.missionReady}` })}</button>`
                            : ''}
                        ${seasonTotalReady > 0
                            ? `<button class="ghost-btn" type="button" data-action="openTab" data-value="season">${getLocalized({ zh: `璧涘 x${seasonTotalReady}`, en: `Season x${seasonTotalReady}` })}</button>`
                            : ''}
                    </div>
                </article>
            </div>
        `;
    }

    function renderLoadoutTab() {
        const selectedLane = state.save.selectedLane;
        const chapter = getCurrentChapter();
        const preset = getChapterLoadoutPreset(chapter);
        const presetSkillLabel = t(SKILLS[preset.skill].nameKey);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('loadoutPanelTitle'), t('loadoutPanelDesc'), `<div class="mini-chip">${t('laneSelect')} 路 ${getLaneName(selectedLane)}</div>`)}
            <article class="stat-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized({ zh: '绔犺妭鎺ㄨ崘缂栭槦', en: 'Chapter Preset' })}</div>
                        <div class="card-title">${chapter.id} 路 ${presetSkillLabel}</div>
                    </div>
                    <div class="card-number">${preset.usedFallback
                        ? getLocalized({ zh: '宸茶嚜鍔ㄩ€傞厤', en: 'Auto adjusted' })
                        : getLocalized({ zh: '鏍囧噯缂栭槦', en: 'Standard preset' })}</div>
                </div>
                <div class="card-copy">${preset.usedFallback
                    ? getLocalized({
                        zh: '閮ㄥ垎鎺ㄨ崘鐐彴灏氭湭瑙ｉ攣锛岀郴缁熷凡鑷姩鐢ㄥ綋鍓嶅彲鐢ㄧ殑鍚屽畾浣嶇偖鍙版浛鎹€',
                        en: 'Some recommended towers are still locked, so the preset automatically swaps to currently available alternatives.'
                    })
                    : getLocalized({
                        zh: '涓€閿簲鐢ㄥ綋鍓嶇珷鑺傜殑鎺ㄨ崘涓夎矾缂栭槦鍜屼富鍔ㄦ妧鑳斤紝鍙互鐩存帴寮€濮嬮槻瀹堛€',
                        en: 'Apply the recommended three-lane build and active skill for the current chapter in one tap.'
                    })}</div>
                <div class="reward-row">
                    ${preset.lanes.map((towerId, laneIndex) => `<span class="mini-chip">${getLaneName(laneIndex)} 路 ${towerLabel(towerId)}</span>`).join('')}
                    <span class="mini-chip">${getLocalized({ zh: `鎶€鑳?${presetSkillLabel}`, en: `Skill ${presetSkillLabel}` })}</span>
                </div>
                <div class="card-actions" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="applyChapterPreset" data-value="${chapter.id}">
                        ${getLocalized({ zh: '涓€閿簲鐢ㄦ帹鑽愮紪闃?', en: 'Apply Preset' })}
                    </button>
                    <button class="ghost-btn" type="button" data-action="applyChapterLanePreset" data-value="${chapter.id}">
                        ${getLocalized({ zh: '鍙浛鎹笁璺厤缃?', en: 'Apply Lanes Only' })}
                    </button>
                </div>
            </article>
            <div class="lane-picker">
                ${[0, 1, 2].map((lane) => `
                    <button class="lane-picker-btn ${selectedLane === lane ? 'active' : ''}" type="button" data-action="lane" data-value="${lane}">
                        ${getLaneName(lane)}
                    </button>
                `).join('')}
            </div>
            <article>
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('skillSelect')}</div>
                        <div class="card-title">${t(SKILLS[state.save.selectedSkill].nameKey)}</div>
                    </div>
                    <div class="card-number">${state.lang === 'zh' ? '涓诲姩浣' : 'Active Slot'}</div>
                </div>
                <div class="skill-picker" style="margin-top:12px;">
                    ${Object.values(SKILLS).map((skill) => `
                        <button class="skill-picker-btn ${state.save.selectedSkill === skill.id ? 'active' : ''}" type="button" data-action="skill" data-value="${skill.id}">
                            ${t(skill.nameKey)}
                        </button>
                    `).join('')}
                </div>
            </article>
            <div class="tower-grid">
                ${Object.values(TOWERS)
                    .sort((a, b) => getTowerSortScore(b.id) - getTowerSortScore(a.id))
                    .map((tower) => renderTowerCard(tower))
                    .join('')}
            </div>
        `;
    }

    function renderTowerCard(tower) {
        const level = getTowerLevel(tower.id);
        const unlocked = level > 0 || tower.unlockFragments === 0;
        const equipped = state.save.laneLoadout[state.save.selectedLane] === tower.id;
        const canUpgrade = unlocked && level > 0 && level < 8 && state.save.gold >= getTowerUpgradeCost(tower.id);
        const canUnlock = !unlocked && (state.save.towerFragments[tower.id] || 0) >= getUnlockNeed(tower.id);
        const progress = unlocked ? Math.min(1, level / 8) : Math.min(1, (state.save.towerFragments[tower.id] || 0) / getUnlockNeed(tower.id));
        const chapter = getCurrentChapter();
        const preset = getChapterLoadoutPreset(chapter);
        const recommendedLanes = preset.lanes
            .map((towerId, laneIndex) => towerId === tower.id ? getLaneName(laneIndex) : '')
            .filter(Boolean);
        const focusRecommended = chapter.fragmentFocus.includes(tower.id);
        return `
            <article class="tower-card ${(canUpgrade || canUnlock) ? 'ready' : ''} ${!unlocked ? 'locked' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${rarityLabel(tower.tier)}</div>
                        <div class="card-title">${towerLabel(tower.id)}</div>
                    </div>
                    <div class="card-number">${t('levelText')} ${level || 0}</div>
                </div>
                <div class="card-copy">${getTowerDescription(tower.id)}</div>
                <div class="tower-tags">
                    <span class="tag-chip">${t('dpsText')} ${formatCompact(Math.round(getTowerPreviewDps(tower.id)))}</span>
                    <span class="tag-chip">${formatCompact(state.save.towerFragments[tower.id] || 0)} ${t('fragmentLabel')}</span>
                    ${focusRecommended ? `<span class="tag-chip">${getLocalized({ zh: '绔犺妭鎺夎惤鍊惧悜', en: 'Focus Drop' })}</span>` : ''}
                    ${recommendedLanes.map((laneName) => `<span class="tag-chip">${getLocalized({ zh: `鎺ㄨ崘 ${laneName}`, en: `${laneName} preset` })}</span>`).join('')}
                </div>
                <div class="progress-line"><i style="width:${(progress * 100).toFixed(2)}%;"></i></div>
                <div class="card-actions">
                    ${unlocked
                        ? (equipped
                            ? `<button class="ghost-btn" type="button" disabled>${t('equipped')}</button>`
                            : `<button class="primary-btn" type="button" data-action="equipTower" data-value="${tower.id}">${t('equipNow')}</button>`)
                        : `<button class="primary-btn" type="button" data-action="unlockTower" data-value="${tower.id}" ${canUnlock ? '' : 'disabled'}>${t('unlockNow')}</button>`}
                    ${unlocked
                        ? `<button class="ghost-btn" type="button" data-action="upgradeTower" data-value="${tower.id}" ${(canUpgrade && level < 8) ? '' : 'disabled'}>${level >= 8 ? t('upgradeMax') : `${t('upgradeNow')} 路 ${formatCompact(getTowerUpgradeCost(tower.id))}G`}</button>`
                        : `<button class="ghost-btn" type="button" disabled>${t('needFragments')} ${formatCompact(getUnlockNeed(tower.id))}</button>`}
                </div>
            </article>
        `;
    }

    function renderResearchTab() {
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('researchPanelTitle'), t('researchPanelDesc'))}
            <div class="research-grid">
                ${Object.keys(RESEARCH)
                    .sort((a, b) => Number(canUpgradeResearch(b)) - Number(canUpgradeResearch(a)))
                    .map((researchId) => renderResearchCard(researchId))
                    .join('')}
            </div>
        `;
    }

    function renderResearchCard(researchId) {
        const level = getResearchLevel(researchId);
        const maxLevel = RESEARCH[researchId].maxLevel;
        const cost = getResearchCost(researchId);
        const maxed = level >= maxLevel;
        const titleMap = {
            attack: state.lang === 'zh' ? '鐏姏鐭╅樀' : 'Damage Matrix',
            cadence: state.lang === 'zh' ? '鍐峰嵈鍥炶矾' : 'Cooldown Circuit',
            fortify: state.lang === 'zh' ? '鏍稿績瑁呯敳' : 'Core Armor',
            salvage: state.lang === 'zh' ? '鎴樺埄鍥炴敹' : 'Salvage Recovery',
            relay: state.lang === 'zh' ? '缁х數澧炲箙' : 'Relay Amplifier'
        };
        const descMap = {
            attack: state.lang === 'zh' ? '鎻愬崌鎵€鏈夌偖鍙板熀纭€浼ゅ銆' : 'Improves base damage for all towers.',
            cadence: state.lang === 'zh' ? '鎻愬崌鎵€鏈夌偖鍙版敾鍑婚鐜囥€' : 'Improves attack speed for all towers.',
            fortify: state.lang === 'zh' ? '鎻愬崌鏍稿績涓婇檺涓庢姢鐩惧閲忋€' : 'Raises max core HP and shield.',
            salvage: state.lang === 'zh' ? '鎻愬崌鏈眬閲戝竵鏀剁泭鍜岄噰闆嗗鍥炴敹閲忋€' : 'Improves gold rewards and harvest returns.',
            relay: state.lang === 'zh' ? '缂╃煭涓诲姩鎶€鑳藉喎鍗达紝骞舵彁鍗囨妧鑳藉己搴︺€' : 'Shortens active skill cooldown and strengthens the skill.'
        };
        return `
            <article class="research-card ${canUpgradeResearch(researchId) ? 'ready' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('researchPanelTitle')}</div>
                        <div class="card-title">${titleMap[researchId]}</div>
                    </div>
                    <div class="card-number">Lv.${level} / ${maxLevel}</div>
                </div>
                <div class="card-copy">${descMap[researchId]}</div>
                <div class="chip-row">
                    <span class="mini-chip">${t('researchEffect')} ${RESEARCH[researchId].effect(level)}%</span>
                    <span class="mini-chip">${maxed ? t('researchMaxed') : `${t('researchCost')} ${formatCompact(cost)}G`}</span>
                </div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${researchId}" ${canUpgradeResearch(researchId) ? '' : 'disabled'}>
                        ${maxed ? t('researchMaxed') : `${t('upgradeNow')} 路 ${formatCompact(cost)}G`}
                    </button>
                </div>
            </article>
        `;
    }

    function renderMissionsTab() {
        const missionViews = MISSIONS.map((mission) => getMissionView(mission)).sort((a, b) => b.sort - a.sort);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('missionsPanelTitle'), t('missionsPanelDesc'), `<div class="mini-chip">${state.lang === 'zh' ? '鍙鍙栧鍔卞凡缃《' : 'Claimables pinned first'}</div>`)}
            <div class="mission-grid">
                ${missionViews.map((mission) => `
                    <article class="mission-card ${mission.claimable ? 'claimable' : ''} ${mission.claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${mission.claimable ? t('missionReadyDot') : t(mission.claimed ? 'missionClaimed' : 'missionLocked')}</div>
                                <div class="card-title">${mission.title}</div>
                            </div>
                            <div class="card-number">${mission.progress} / ${mission.target}</div>
                        </div>
                        <div class="card-copy">${mission.desc}</div>
                        <div class="progress-line"><i style="width:${(mission.progressRate * 100).toFixed(2)}%;"></i></div>
                        <div class="reward-row">${mission.rewardChips}</div>
                        <div class="card-actions">
                            <button class="primary-btn" type="button" data-action="claimMission" data-value="${mission.id}" ${mission.claimable ? '' : 'disabled'}>
                                ${mission.claimed ? t('missionClaimed') : t('missionClaim')}
                            </button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderSeasonTab() {
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        const rate = seasonInfo.required <= 0 ? 1 : seasonInfo.progress / seasonInfo.required;
        const nodes = SEASON_NODES.map((node, index) => ({ node, index, claimable: isSeasonClaimable(node.id), claimed: state.save.seasonClaimed.includes(node.id) }))
            .sort(compareRewardNodeState);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('seasonPanelTitle'), t('seasonPanelDesc'))}
            <div class="card-grid">
                <article class="stat-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('seasonLabel')}</div>
                            <div class="card-title">Lv.${seasonInfo.level}</div>
                        </div>
                        <div class="card-number">${formatCompact(state.save.seasonXp)} XP</div>
                    </div>
                    <div class="progress-line"><i style="width:${(rate * 100).toFixed(2)}%;"></i></div>
                    <div class="card-copy">${t('seasonToNext')} ${formatCompact(seasonInfo.required - seasonInfo.progress)}</div>
                </article>
                <article class="stat-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('statDamage')}</div>
                            <div class="card-title">${formatCompact(state.save.stats.totalDamage)}</div>
                        </div>
                        <div class="card-number">${t('statKills')} ${formatCompact(state.save.stats.kills)}</div>
                    </div>
                    <div class="card-copy">${t('statRuns')} ${formatCompact(state.save.stats.runs)} 路 ${t('statWins')} ${formatCompact(state.save.stats.wins)}</div>
                </article>
            </div>
            <div class="season-grid">
                ${nodes.map(({ node, index, claimable, claimed }) => `
                    <article class="season-node ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${claimable ? t('seasonReadyDot') : `XP ${node.xp}`}</div>
                                <div class="card-title">${t('seasonNodeTitle').replace('{index}', String(index + 1))}</div>
                            </div>
                            <div class="card-number">${formatCompact(node.xp)} XP</div>
                        </div>
                        <div class="reward-row">${renderRewardChips(node.reward)}</div>
                        <div class="card-actions">
                            <button class="primary-btn" type="button" data-action="claimSeason" data-value="${node.id}" ${claimable ? '' : 'disabled'}>
                                ${claimed ? t('seasonClaimed') : t('seasonClaim')}
                            </button>
                        </div>
                    </article>
                `).join('')}
            </div>
            ${renderSponsorSeasonSection()}
        `;
    }

    function renderShopTab() {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const sponsorReady = getSponsorSeasonReadyCount();
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('shopPanelTitle'),
                t('shopPanelDesc'),
                `<div class="mini-chip">${sponsorUnlocked
                    ? getLocalized({ zh: `璧炲姪杞ㄩ亾宸茶В閿?路 寰呴 ${sponsorReady}`, en: `Sponsor track unlocked 路 ${sponsorReady} ready` })
                    : getLocalized({ zh: '浠绘剰涓€绗旀牎楠屾垚鍔熺殑鍏呭€奸兘浼氳В閿佽禐鍔╄建閬', en: 'Any verified top-up unlocks the sponsor track' })
                }</div>`
            )}
            <div class="card-grid">
                ${renderTopupOverviewCard()}
                ${renderDailyCard()}
            </div>
            <div class="shop-grid">
                ${SHOP_ITEMS.map((offer) => renderShopOfferCard(offer)).join('')}
                ${DEFENSE_PAYMENT_OFFERS.map((offer) => renderPaymentOfferCard(offer)).join('')}
            </div>
        `;
    }

    function renderDailyCard() {
        const ready = isDailySupplyReady();
        const supplyReward = getDailySupplyReward();
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const remaining = ready ? '' : formatTime(DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - state.save.dailySupplyAt));
        return `
            <article class="shop-card ${ready ? 'mission-card claimable' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${ready ? t('dailyReadyDot') : remaining}</div>
                        <div class="card-title">${t('shopFreeTitle')}</div>
                    </div>
                    <div class="card-number">Free</div>
                </div>
                <div class="card-copy">${t('shopFreeDesc')}</div>
                <div class="reward-row">
                    <span class="mini-chip">${sponsorUnlocked ? getLocalized({ zh: '璧炲姪鍔犳垚宸茬敓鏁', en: 'Sponsor boost active' }) : getLocalized({ zh: '棣栧厖鍙崌绾ф瘡鏃ヨˉ缁', en: 'Top-up unlocks daily boost' })}</span>
                </div>
                <div class="reward-row">${renderRewardChips(supplyReward)}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="claimDaily" data-value="daily" ${ready ? '' : 'disabled'}>${ready ? t('shopClaim') : `${t('shopSoldOut')} 路 ${remaining}`}</button>
                </div>
            </article>
        `;
    }

    function renderGoldShopCard() {
        return `
            <article class="shop-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">920 G</div>
                        <div class="card-title">${t('shopGoldTitle')}</div>
                    </div>
                    <div class="card-number">${t('fragmentLabel')}</div>
                </div>
                <div class="card-copy">${t('shopGoldDesc')}</div>
                <div class="reward-row">${renderRewardChips({ fragments: { frost: 10, rocket: 10, chain: 6 }, gold: 120 })}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="goldCrate" ${state.save.gold >= 920 ? '' : 'disabled'}>${t('shopBuy')}</button>
                </div>
            </article>
        `;
    }

    function renderCoreShopCard() {
        return `
            <article class="shop-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">34 C</div>
                        <div class="card-title">${t('shopCoreTitle')}</div>
                    </div>
                    <div class="card-number">${state.lang === 'zh' ? '绋€鏈夌' : 'Rare Box'}</div>
                </div>
                <div class="card-copy">${t('shopCoreDesc')}</div>
                <div class="reward-row">${renderRewardChips({ gold: 280, fragments: { chain: 12, rail: 8 } })}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="coreCrate" ${state.save.cores >= 34 ? '' : 'disabled'}>${t('shopBuy')}</button>
                </div>
            </article>
        `;
    }

    function getDefenseProgressTier() {
        return Math.max(1, (state.save.bestChapterIndex || 0) + 1);
    }

    function getShopOfferById(id) {
        return SHOP_ITEMS.find((offer) => offer.id === id) || null;
    }

    function getShopOfferPurchaseCount(id) {
        return Math.max(0, Number(state.save.shopPurchases?.[id]) || 0);
    }

    function getShopOfferCost(id) {
        const offer = getShopOfferById(id);
        if (!offer) return 0;
        const count = getShopOfferPurchaseCount(id);
        const repeatGrowth = offer.priceType === 'gold' ? 0.22 : 0.18;
        const milestoneGrowth = offer.priceType === 'gold' ? 0.08 : 0.06;
        return Math.round(offer.basePrice * (1 + count * repeatGrowth + Math.floor(count / 3) * milestoneGrowth));
    }

    function canAffordShopOffer(offerOrId) {
        const offer = typeof offerOrId === 'string' ? getShopOfferById(offerOrId) : offerOrId;
        if (!offer) return false;
        const cost = getShopOfferCost(offer.id);
        return offer.priceType === 'gold' ? state.save.gold >= cost : state.save.cores >= cost;
    }

    function getDailySupplyReward() {
        const tier = getDefenseProgressTier();
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const reward = {
            gold: 360 + tier * 120 + Math.max(0, tier - 4) * 70,
            cores: 10 + tier * 2 + Math.max(0, tier - 6),
            fragments: {
                pulse: Math.max(6, 11 - Math.floor(tier / 2)),
                laser: Math.max(6, 11 - Math.floor(tier / 2))
            }
        };
        if (tier >= 3) {
            reward.fragments.frost = 5 + Math.floor(tier * 0.85);
            reward.fragments.rocket = 5 + Math.floor(tier * 0.85);
        }
        if (tier >= 5) reward.fragments.chain = 4 + Math.floor(tier * 0.75);
        if (tier >= 7) reward.fragments.rail = 2 + Math.floor((tier - 6) * 1.5);
        if (sponsorUnlocked) {
            reward.gold += 280 + tier * 70;
            reward.cores += 6 + Math.floor(tier * 1.2);
            reward.seasonXp = 40 + tier * 12;
            reward.fragments.chain = (reward.fragments.chain || 0) + 4;
            if (tier >= 6) reward.fragments.rail = (reward.fragments.rail || 0) + 3;
        }
        return reward;
    }

    function getShopOfferPreview(id) {
        const tier = getDefenseProgressTier();
        const count = getShopOfferPurchaseCount(id);
        const intensity = tier + Math.floor(count / 2);
        switch (id) {
            case 'goldCrate':
                return {
                    gold: 110 + intensity * 18,
                    fragments: {
                        frost: 9 + tier + Math.floor(count * 0.4),
                        rocket: 9 + tier + Math.floor(count * 0.4),
                        chain: 4 + Math.floor(tier / 2) + Math.floor(count * 0.25)
                    }
                };
            case 'forgeCrate':
                return {
                    cores: 12 + tier * 2 + Math.floor(count * 0.6),
                    seasonXp: 30 + tier * 10 + count * 4,
                    fragments: {
                        rocket: 8 + tier + Math.floor(count * 0.4),
                        chain: 6 + Math.floor(tier * 0.9) + Math.floor(count * 0.3),
                        rail: tier >= 4 ? 3 + Math.floor((tier - 3) * 0.8) + Math.floor(count * 0.2) : 0
                    }
                };
            case 'coreCrate':
                return {
                    gold: 260 + intensity * 52,
                    seasonXp: 18 + tier * 7 + count * 3,
                    fragments: {
                        chain: 10 + tier + Math.floor(count * 0.5),
                        rail: 6 + Math.floor(tier * 0.75) + Math.floor(count * 0.35)
                    }
                };
            case 'relayCrate':
                return {
                    gold: 520 + intensity * 84,
                    seasonXp: 46 + tier * 12 + count * 5,
                    fragments: {
                        rocket: 6 + Math.floor(tier * 0.8) + Math.floor(count * 0.25),
                        chain: 12 + tier + Math.floor(count * 0.6),
                        rail: 9 + Math.floor(tier * 0.9) + Math.floor(count * 0.45)
                    }
                };
            default:
                return {};
        }
    }

    function buildShopOfferReward(id) {
        const preview = getShopOfferPreview(id);
        const reward = {};
        if (preview.gold) reward.gold = preview.gold + randomInt(24, Math.max(36, Math.round(preview.gold * 0.08)));
        if (preview.cores) reward.cores = preview.cores + randomInt(1, Math.max(2, Math.round(preview.cores * 0.15)));
        if (preview.seasonXp) reward.seasonXp = preview.seasonXp + randomInt(4, Math.max(8, Math.round(preview.seasonXp * 0.12)));
        if (preview.fragments) {
            reward.fragments = {};
            Object.entries(preview.fragments).forEach(([towerId, amount]) => {
                if (amount > 0) reward.fragments[towerId] = amount + randomInt(0, Math.max(1, Math.round(amount * 0.22)));
            });
        }
        return reward;
    }

    function renderShopOfferCard(offer) {
        const cost = getShopOfferCost(offer.id);
        const canAfford = canAffordShopOffer(offer);
        const purchases = getShopOfferPurchaseCount(offer.id);
        const preview = getShopOfferPreview(offer.id);
        const priceSuffix = offer.priceType === 'gold' ? 'G' : 'C';
        return `
            <article class="shop-card ${canAfford ? 'mission-card claimable' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${formatCompact(cost)} ${priceSuffix}</div>
                        <div class="card-title">${getLocalized(offer.title)}</div>
                    </div>
                    <div class="card-number">${getLocalized(offer.slot)}</div>
                </div>
                <div class="card-copy">${getLocalized(offer.desc)}</div>
                <div class="reward-row">
                    <span class="mini-chip">${getLocalized({ zh: `已购买 ${purchases} 次`, en: `${purchases} bought` })}</span>
                    <span class="mini-chip">${offer.priceType === 'gold' ? getLocalized({ zh: '閲戝竵娑堣€楃偣', en: 'Gold sink' }) : getLocalized({ zh: '鑳芥牳娑堣€楃偣', en: 'Core sink' })}</span>
                </div>
                <div class="reward-row">${renderRewardChips(preview)}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="${offer.id}" ${canAfford ? '' : 'disabled'}>${t('shopBuy')} 路 ${formatCompact(cost)} ${priceSuffix}</button>
                </div>
            </article>
        `;
    }

    function renderTopupOverviewCard() {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const premiumReady = getSponsorSeasonReadyCount();
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        return `
            <article class="shop-card premium topup-overview-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">VERIFIED TOP-UP</div>
                        <div class="card-title">${getLocalized({ zh: '闃茬嚎鍏呭€间腑蹇', en: 'Defense Top-Up Center' })}</div>
                    </div>
                    <div class="card-number">${sponsorUnlocked ? getLocalized({ zh: '宸插紑鍚', en: 'Unlocked' }) : getLocalized({ zh: '鏈紑鍚', en: 'Locked' })}</div>
                </div>
                <div class="card-copy">${sponsorUnlocked
                    ? getLocalized({ zh: '閾句笂鏍￠獙鎴愬姛鍚庯紝鍏呭€煎鍔变細鐩存帴鍒拌处锛屽悓鏃惰禌瀛ｉ〉浼氬紑鏀捐禐鍔╄建閬撻澶栬妭鐐广€', en: 'Verified payments grant rewards instantly and unlock extra Sponsor nodes in Season.' })
                    : getLocalized({ zh: '鍒涘缓璁㈠崟鍚庢寜绮剧‘閲戦鏀粯锛屽啀绮樿创 txid 鏍￠獙鍗冲彲鍙戝锛屽苟姘镐箙瑙ｉ攣璧炲姪杞ㄩ亾銆', en: 'Create an order, pay the exact amount, then verify the txid to grant rewards and unlock the Sponsor track.' })
                }</div>
                <div class="reward-row">
                    <span class="mini-chip">${getLocalized({ zh: `${premiumReady} 涓禐鍔╄妭鐐瑰緟棰嗗彇`, en: `${premiumReady} sponsor nodes ready` })}</span>
                    <span class="mini-chip">OKX Wallet 路 TRON (TRC20)</span>
                </div>
                <div class="shop-kpi-grid">
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '宸叉牎楠岃鍗', en: 'Verified Orders' })}</span>
                        <strong>${formatCompact(state.save.payment.purchaseCount || 0)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '璧炲姪杞ㄩ亾', en: 'Sponsor Track' })}</span>
                        <strong>${sponsorUnlocked ? getLocalized({ zh: '宸茶В閿', en: 'Unlocked' }) : getLocalized({ zh: '鏈В閿', en: 'Locked' })}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '绱鍏呭€', en: 'Total Spent' })}</span>
                        <strong>$${Number(state.save.payment.totalSpent || 0).toFixed(2)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '璧涘绛夌骇', en: 'Season Level' })}</span>
                        <strong>Lv.${seasonInfo.level}</strong>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${selectedPaymentOfferId}">
                        ${getLocalized({ zh: '鎵撳紑鍏呭€', en: 'Open Top-Up' })}
                    </button>
                </div>
            </article>
        `;
    }

    function renderPaymentOfferCard(offer) {
        return `
            <article class="shop-card paypack" style="--offer-accent:${offer.accent};">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized(offer.badge)}</div>
                        <div class="card-title">${getLocalized(offer.name)}</div>
                    </div>
                    <div class="card-number">$${offer.price.toFixed(2)}</div>
                </div>
                <div class="card-copy">${getLocalized(offer.desc)}</div>
                <div class="reward-row">
                    <span class="mini-chip">${getLocalized({ zh: '閾句笂鏍￠獙鍙戝', en: 'On-chain verified' })}</span>
                    <span class="mini-chip">TRON (TRC20)</span>
                </div>
                <div class="reward-row">${renderRewardChips(offer.reward)}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${offer.id}">
                        ${getLocalized({ zh: '鍒涘缓璁㈠崟骞舵敮浠', en: 'Create Order & Pay' })}
                    </button>
                </div>
            </article>
        `;
    }

    function renderSponsorSeasonSection() {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;

        if (!sponsorUnlocked) {
            return `
                <article class="shop-card premium topup-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('sponsorTrack')}</div>
                            <div class="card-title">${getLocalized({ zh: '璧炲姪杞ㄩ亾鏈紑鍚', en: 'Sponsor Track Locked' })}</div>
                        </div>
                        <div class="card-number">${getLocalized({ zh: '寰呰В閿', en: 'Locked' })}</div>
                    </div>
                    <div class="card-copy">${getLocalized({ zh: '浠绘剰涓€绗旈摼涓婃牎楠屾垚鍔熺殑鍏呭€奸兘浼氳В閿佽禐鍔╄建閬擄紝闅忓悗鍙殢璧涘缁忛獙棰嗗彇棰濆閲戝竵銆佽兘鏍稿拰楂橀樁濉斿彴纰庣墖銆', en: 'Any verified top-up unlocks the Sponsor track so you can claim extra gold, cores, and high-tier fragments as Season XP grows.' })}</div>
                    <div class="reward-row">${renderRewardChips({ gold: 1800, cores: 20, fragments: { chain: 12, rail: 8 } })}</div>
                    <div class="card-actions">
                        <button class="primary-btn" type="button" data-action="openPayment" data-value="starter">${getLocalized({ zh: '绔嬪嵆瑙ｉ攣', en: 'Unlock Now' })}</button>
                    </div>
                </article>
            `;
        }

        const sponsorNodes = SPONSOR_SEASON_NODES
            .map((node, index) => ({
                node,
                index,
                claimable: isSponsorSeasonClaimable(node.id),
                claimed: !!state.save.payment.premiumSeasonClaims[node.id]
            }))
            .sort(compareRewardNodeState);

        return `
            <div class="panel-head">
                <div>
                    <h3>${t('sponsorTrack')}</h3>
                    <p>${getLocalized({ zh: '璧炲姪杞ㄩ亾宸插紑鍚€傝揪鍒版寚瀹氳禌瀛ｇ粡楠屽悗锛屽彲棰嗗彇棰濆閲戝竵銆佽兘鏍镐笌楂橀樁纰庣墖銆', en: 'Sponsor track is now live. Reach the required Season XP to claim extra gold, cores, and high-tier fragments.' })}</p>
                </div>
                <div class="mini-chip">${getLocalized({ zh: `待领取 ${getSponsorSeasonReadyCount()} 个节点`, en: `${getSponsorSeasonReadyCount()} nodes ready` })}</div>
            </div>
            <div class="season-grid">
                ${sponsorNodes.map(({ node, index, claimable, claimed }) => `
                    <article class="season-node ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${claimable ? getLocalized({ zh: '鍙鍙', en: 'Ready' }) : `XP ${node.xp}`}</div>
                                <div class="card-title">${getLocalized({ zh: `璧炲姪鑺傜偣 ${index + 1}`, en: `Sponsor Node ${index + 1}` })}</div>
                            </div>
                            <div class="card-number">${formatCompact(node.xp)} XP</div>
                        </div>
                        <div class="reward-row">${renderRewardChips(node.reward)}</div>
                        <div class="card-actions">
                            <button class="primary-btn" type="button" data-action="claimSponsorSeason" data-value="${node.id}" ${claimable ? '' : 'disabled'}>
                                ${claimed ? t('seasonClaimed') : t('seasonClaim')}
                            </button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderPremiumCard() {
        return `
            <article class="shop-card premium">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('sponsorTrack')}</div>
                        <div class="card-title">${state.lang === 'zh' ? '璧炲姪绀煎寘棰勭暀浣' : 'Sponsor Pack Slot'}</div>
                    </div>
                    <div class="card-number">Future</div>
                </div>
                <div class="card-copy">${t('sponsorDesc')}</div>
                <div class="reward-row">${renderRewardChips({ gold: 2200, cores: 90, fragments: { rail: 26, chain: 22 } })}</div>
                <div class="card-actions">
                    <button class="ghost-btn" type="button" disabled>${t('shopPreviewOnly')}</button>
                </div>
            </article>
        `;
    }

    function renderRewardChips(reward) {
        const chips = [];
        if (reward.gold) chips.push(`<span class="mini-chip">${formatCompact(reward.gold)} G</span>`);
        if (reward.cores) chips.push(`<span class="mini-chip">${formatCompact(reward.cores)} C</span>`);
        if (reward.seasonXp) chips.push(`<span class="mini-chip">${formatCompact(reward.seasonXp)} ${getLocalized({ zh: '璧涘缁忛獙', en: 'Season XP' })}</span>`);
        if (reward.fragments) {
            Object.entries(reward.fragments).forEach(([towerId, amount]) => {
                if ((Number(amount) || 0) > 0) chips.push(`<span class="mini-chip">${towerLabel(towerId)} +${formatCompact(amount)}</span>`);
            });
        }
        return chips.join('');
    }

    function renderTabState() {
        document.body.dataset.defenseTab = state.activeTab;
        document.querySelectorAll('.tab-btn[data-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.tab === state.activeTab));
        const redDots = { defend: false, loadout: hasLoadoutRedDot(), research: hasResearchRedDot(), missions: hasMissionRedDot(), season: hasSeasonRedDot(), shop: hasShopRedDot() };
        Object.entries(redDots).forEach(([tab, active]) => {
            const dot = document.querySelector(`[data-tab-dot="${tab}"]`);
            if (dot) dot.classList.toggle('active', !!active);
        });
    }

    function switchTab(tab) {
        state.activeTab = tab;
        renderAll();
    }

    function selectChapter(index) {
        if (index < 0 || index > state.save.bestChapterIndex) return;
        state.save.chapterIndex = index;
        saveProgress();
        updateStartPanel();
        renderAll();
    }

    function updateStartPanel() {
        const chapter = getCurrentChapter();
        const mainEnemy = chapter.enemies.map((enemyId) => enemyLabel(enemyId)).join(' / ');
        const focusPreview = getChapterFocusPreview(chapter);
        const recommendedSkill = t(SKILLS[getRecommendedSkillIdForChapter(chapter)].nameKey);
        ui.startDescription.textContent = `${t('startDescTemplate').replace('{chapter}', chapter.id)} ${getChapterOpeningGuide(chapter)} ${getChapterWavePlan(chapter)}`;
        ui.startMeta.innerHTML = `
            <span class="mini-chip">${t('startMetaReward').replace('{gold}', formatCompact(chapter.goldReward)).replace('{core}', formatCompact(chapter.coreReward)).replace('{fragment}', formatCompact(chapter.fragmentReward))}</span>
            <span class="mini-chip">${t('startMetaEnemy').replace('{enemy}', mainEnemy)}</span>
            <span class="mini-chip">${getLocalized({ zh: `纰庣墖鍊惧悜 ${focusPreview}`, en: `Focus Drops ${focusPreview}` })}</span>
            <span class="mini-chip">${getLocalized({ zh: `鎺ㄨ崘鎶€鑳?${recommendedSkill}`, en: `Recommended Skill ${recommendedSkill}` })}</span>
        `;
    }

    function startBattle(restart) {
        if (!restart && state.battle.running && !state.battle.finished) return;
        state.battle = createEmptyBattle();
        state.battle.running = true;
        state.battle.coreHp = getCoreMaxHp();
        state.battle.shield = getCoreShieldCap();
        state.battle.lastFrame = performance.now();
        state.save.stats.runs += 1;
        saveProgress();
        hideOverlay(ui.resultOverlay);
        hideOverlay(ui.pauseOverlay);
        hideOverlay(ui.upgradeOverlay);
        hideOverlay(ui.startOverlay);
        startWave(1);
        renderAll();
    }

    function startWave(waveNumber) {
        state.battle.currentWave = waveNumber;
        state.battle.currentWaveElapsed = 0;
        state.battle.spawnQueue = buildWaveQueue(getCurrentChapter(), waveNumber);
        state.battle.awaitingUpgrade = false;
        hideOverlay(ui.upgradeOverlay);
    }

    function buildWaveQueue(chapter, waveNumber) {
        const queue = [];
        let at = 0.8;
        const count = 5 + waveNumber * 2 + state.save.chapterIndex;
        for (let index = 0; index < count; index += 1) {
            at += Math.max(0.38, 1.08 - waveNumber * 0.08 - state.save.chapterIndex * 0.04 + (index % 2 === 0 ? 0.1 : 0));
            const pool = getEnemyPoolForWave(chapter, waveNumber);
            queue.push({ at, lane: (index + waveNumber + state.save.chapterIndex) % 3, type: pool[index % pool.length] });
        }
        if (waveNumber === TOTAL_WAVES) queue.push({ at: at + 1.6, lane: 1, type: 'boss' });
        else if (waveNumber >= 4) queue.push({ at: at + 0.9, lane: (waveNumber + 1) % 3, type: 'elite' });
        queue.push(...getChapterWaveQueueExtras(chapter, waveNumber, at));
        queue.sort((a, b) => a.at - b.at || a.lane - b.lane);
        return queue;
    }

    function getChapterWaveQueueExtras(chapter, waveNumber, baseTailAt) {
        const script = CHAPTER_WAVE_SCRIPTS[chapter.id]?.[waveNumber];
        if (!Array.isArray(script) || !script.length) return [];
        const tailAt = Math.max(1.4, Number(baseTailAt) || 1.4);
        return script.map((entry, index) => ({
            at: Math.max(0.72, Number((tailAt * entry.progress + index * 0.015).toFixed(2))),
            lane: Math.max(0, Math.min(2, Number(entry.lane) || 0)),
            type: entry.type
        }));
    }

    function getEnemyPoolForWave(chapter, waveNumber) {
        const pool = ['grunt'];
        if (chapter.enemies.includes('fast') && waveNumber >= 2) pool.push('fast');
        if (chapter.enemies.includes('shield') && waveNumber >= 2) pool.push('shield');
        if (chapter.enemies.includes('split') && waveNumber >= 3) pool.push('split');
        if (chapter.enemies.includes('elite') && waveNumber >= 4) pool.push('elite');
        return pool;
    }

    function pauseBattle() {
        if (!state.battle.running || state.battle.finished) return;
        state.battle.paused = true;
        showOverlay(ui.pauseOverlay);
        renderAll();
    }

    function resumeBattle() {
        if (!state.battle.running || state.battle.finished) return;
        state.battle.paused = false;
        state.battle.lastFrame = performance.now();
        hideOverlay(ui.pauseOverlay);
        renderAll();
    }

    function useSkill() {
        if (!state.battle.running || state.battle.paused || state.battle.awaitingUpgrade || state.battle.finished) return;
        if (state.battle.skillCooldown > 0) {
            showToast(t('toastSkillCooling'));
            return;
        }
        const relayBoost = 1 + getResearchLevel('relay') * 0.08;
        if (state.save.selectedSkill === 'emp') {
            state.battle.enemies.forEach((enemy) => {
                enemy.hp -= 62 * relayBoost;
                enemy.stun = Math.max(enemy.stun, 1.6);
            });
            cleanupDeadEnemies();
            showToast(t('toastSkillEmp'));
        } else if (state.save.selectedSkill === 'overclock') {
            state.battle.skillEffect = 'overclock';
            state.battle.skillEffectTimer = 8;
            showToast(t('toastSkillOverclock'));
        } else {
            state.battle.shield = Math.min(getCoreShieldCap() * 1.6, state.battle.shield + 70 * relayBoost);
            state.battle.coreHp = Math.min(getCoreMaxHp(), state.battle.coreHp + 18 * relayBoost);
            showToast(t('toastSkillShield'));
        }
        state.save.stats.skillsUsed += 1;
        state.battle.skillCooldown = Math.max(6, SKILLS[state.save.selectedSkill].cooldown * (1 - getResearchLevel('relay') * 0.06));
        state.battle.laneSkillGlow = SKILL_READY_GLOW_MS;
        saveProgress();
        renderAll();
    }

    function startLoop() {
        const step = (timestamp) => {
            updateBattle(timestamp);
            drawBattlefield();
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    function updateBattle(timestamp) {
        const battle = state.battle;
        const delta = Math.min(0.05, Math.max(0, (timestamp - battle.lastFrame) / 1000));
        battle.lastFrame = timestamp;

        if (!battle.running || battle.paused || battle.awaitingUpgrade || battle.finished) {
            if (battle.skillCooldown > 0 && !battle.paused && !battle.finished) {
                battle.skillCooldown = Math.max(0, battle.skillCooldown - delta);
                renderActionBar();
            }
            return;
        }

        battle.totalElapsed += delta;
        battle.currentWaveElapsed += delta;
        battle.skillCooldown = Math.max(0, battle.skillCooldown - delta);
        battle.laneSkillGlow = Math.max(0, battle.laneSkillGlow - delta * 1000);
        if (battle.skillEffectTimer > 0) {
            battle.skillEffectTimer = Math.max(0, battle.skillEffectTimer - delta);
            if (battle.skillEffectTimer <= 0) battle.skillEffect = null;
        }

        while (battle.spawnQueue.length && battle.currentWaveElapsed >= battle.spawnQueue[0].at) spawnEnemy(battle.spawnQueue.shift());
        updateEnemies(delta);
        updateTowers(delta);
        cleanupDeadEnemies();

        if (battle.coreHp <= 0) {
            finishBattle(false);
            return;
        }
        if (!battle.spawnQueue.length && !battle.enemies.length) {
            battle.runStats.clearedWaves = Math.max(battle.runStats.clearedWaves, battle.currentWave);
            if (battle.currentWave >= TOTAL_WAVES) finishBattle(true);
            else presentUpgradeChoices();
        }

        renderHud();
        renderActionBar();
    }

    function spawnEnemy(spawn) {
        const chapter = getCurrentChapter();
        const stats = getEnemyStats(spawn.type, chapter, state.battle.currentWave);
        state.battle.enemies.push({
            id: state.battle.nextEnemyId++,
            type: spawn.type,
            lane: spawn.lane,
            x: LANE_POSITIONS[spawn.lane],
            y: -40,
            hp: stats.hp,
            maxHp: stats.hp,
            speed: stats.speed,
            damage: stats.damage,
            rewardGold: stats.rewardGold,
            rewardCore: stats.rewardCore,
            radius: stats.radius,
            stun: 0,
            slow: 0,
            split: stats.split,
            elite: stats.elite,
            boss: stats.boss
        });
    }

    function getEnemyStats(type, chapter, wave) {
        const base = {
            grunt: { hp: chapter.baseHp, speed: chapter.baseSpeed, damage: 8, rewardGold: 10, rewardCore: 0, radius: 20 },
            fast: { hp: chapter.baseHp * 0.78, speed: chapter.baseSpeed * 1.46, damage: 10, rewardGold: 12, rewardCore: 0, radius: 18 },
            shield: { hp: chapter.baseHp * 1.5, speed: chapter.baseSpeed * 0.84, damage: 14, rewardGold: 16, rewardCore: 1, radius: 22 },
            split: { hp: chapter.baseHp * 1.02, speed: chapter.baseSpeed * 1.1, damage: 11, rewardGold: 14, rewardCore: 0, radius: 19, split: true },
            elite: { hp: chapter.baseHp * 2.5, speed: chapter.baseSpeed * 0.95, damage: 18, rewardGold: 28, rewardCore: 2, radius: 26, elite: true },
            boss: { hp: chapter.baseHp * 6.8, speed: chapter.baseSpeed * 0.72, damage: 30, rewardGold: 64, rewardCore: 6, radius: 34, elite: true, boss: true }
        }[type];
        const waveFactor = 1 + wave * 0.18 + state.save.chapterIndex * 0.11;
        return {
            hp: Math.round(base.hp * waveFactor),
            speed: base.speed * (1 + wave * 0.04),
            damage: Math.round(base.damage * (1 + wave * 0.05)),
            rewardGold: Math.round(base.rewardGold * (1 + wave * 0.12)),
            rewardCore: Math.round(base.rewardCore * (1 + wave * 0.06)),
            radius: base.radius,
            split: !!base.split,
            elite: !!base.elite,
            boss: !!base.boss
        };
    }

    function updateEnemies(delta) {
        for (let index = state.battle.enemies.length - 1; index >= 0; index -= 1) {
            const enemy = state.battle.enemies[index];
            enemy.stun = Math.max(0, enemy.stun - delta);
            enemy.slow = Math.max(0, enemy.slow - delta * 0.5);
            if (enemy.stun > 0) continue;
            const slowFactor = 1 - Math.min(0.65, enemy.slow);
            enemy.y += enemy.speed * slowFactor * delta;
            if (enemy.y >= SAFE_CORE_Y) {
                dealCoreDamage(enemy.damage);
                if (enemy.split) spawnSplitChildren(enemy);
                state.battle.enemies.splice(index, 1);
            }
        }
    }

    function dealCoreDamage(damage) {
        let remaining = damage;
        if (state.battle.shield > 0) {
            const absorbed = Math.min(state.battle.shield, remaining);
            state.battle.shield -= absorbed;
            remaining -= absorbed;
        }
        if (remaining > 0) state.battle.coreHp -= remaining;
    }

    function spawnSplitChildren(enemy) {
        if (enemy.boss) return;
        for (let count = 0; count < 2; count += 1) {
            state.battle.enemies.push({
                id: state.battle.nextEnemyId++,
                type: 'grunt',
                lane: enemy.lane,
                x: enemy.x + (count === 0 ? -18 : 18),
                y: enemy.y - 12,
                hp: Math.max(18, enemy.maxHp * 0.35),
                maxHp: Math.max(18, enemy.maxHp * 0.35),
                speed: enemy.speed * 1.12,
                damage: Math.max(5, enemy.damage * 0.5),
                rewardGold: Math.max(4, enemy.rewardGold * 0.45),
                rewardCore: 0,
                radius: 14,
                stun: 0,
                slow: 0,
                split: false,
                elite: false,
                boss: false
            });
        }
    }

    function updateTowers(delta) {
        const enemyByLane = [[], [], []];
        state.battle.enemies.forEach((enemy) => enemyByLane[enemy.lane].push(enemy));
        enemyByLane.forEach((list) => list.sort((a, b) => b.y - a.y));
        for (let lane = 0; lane < 3; lane += 1) {
            const towerId = state.save.laneLoadout[lane];
            if (!TOWERS[towerId] || getTowerLevel(towerId) <= 0) continue;
            state.battle.laneTimers[lane] += delta;
            const cooldown = getTowerCooldown(towerId);
            if (state.battle.laneTimers[lane] < cooldown) continue;
            const targets = enemyByLane[lane];
            if (!targets.length) continue;
            state.battle.laneTimers[lane] = 0;
            fireLaneTower(towerId, lane, targets);
        }
    }

    function fireLaneTower(towerId, lane, targets) {
        const tower = TOWERS[towerId];
        let damage = getTowerDamagePerShot(towerId);
        if (state.battle.skillEffect === 'overclock') damage *= 1.42;
        const target = targets[0];
        applyDamage(target, damage, towerId);
        if (tower.splash || state.battle.modifiers.splashBonus > 0) {
            const splash = damage * ((tower.splash || 0) + state.battle.modifiers.splashBonus);
            targets.slice(1, 3).forEach((enemy) => applyDamage(enemy, splash, towerId, true));
        }
        if (tower.chain) targets.slice(1, 3).forEach((enemy) => applyDamage(enemy, damage * tower.chain, towerId, true));
        if (tower.pierce) targets.slice(1).forEach((enemy) => applyDamage(enemy, damage * 0.45, towerId, true));
        if (tower.slow > 0) target.slow = Math.max(target.slow, tower.slow + state.battle.modifiers.freezeChance);
        else if (Math.random() < state.battle.modifiers.freezeChance) target.slow = Math.max(target.slow, 0.22);
        state.battle.laneFlash[lane] = 1;
    }

    function applyDamage(enemy, amount, towerId, noGoldBonus) {
        if (!enemy) return;
        const finalAmount = amount * ((enemy.elite || enemy.boss) ? state.battle.modifiers.eliteDamage : 1);
        enemy.hp -= finalAmount;
        state.battle.runStats.damage += finalAmount;
        if (enemy.hp <= 0) rewardEnemyKill(enemy, towerId, noGoldBonus);
    }

    function rewardEnemyKill(enemy, towerId, noGoldBonus) {
        if (enemy._rewarded) return;
        enemy._rewarded = true;
        state.battle.runStats.kills += 1;
        if (enemy.elite || enemy.boss) state.battle.runStats.bossKills += 1;
        const salvageBonus = 1 + getResearchLevel('salvage') * 0.1;
        let gold = Math.round(enemy.rewardGold * salvageBonus * state.battle.modifiers.gold);
        if (!noGoldBonus && towerId === 'harvest') gold += Math.round(enemy.rewardGold * TOWERS.harvest.goldBonus * salvageBonus);
        const coreGain = Math.max(1, Math.ceil(enemy.rewardCore * state.battle.modifiers.coreGain));
        state.save.gold += gold;
        state.save.cores += coreGain;
    }

    function cleanupDeadEnemies() {
        state.battle.enemies = state.battle.enemies.filter((enemy) => enemy.hp > 0);
    }

    function presentUpgradeChoices() {
        state.battle.awaitingUpgrade = true;
        state.battle.pendingChoices = pickUpgradeChoices();
        ui.upgradeChoiceGrid.innerHTML = state.battle.pendingChoices.map((choice) => `
            <button class="choice-card" type="button" data-upgrade-choice="${choice.id}">
                <strong>${getLocalized(choice.label)}</strong>
                <span class="card-copy">${getLocalized(choice.hint)}</span>
            </button>
        `).join('');
        showOverlay(ui.upgradeOverlay);
        showToast(t('toastWaveClear'));
        renderHud();
    }

    function pickUpgradeChoices() {
        const seed = [...UPGRADE_CHOICES];
        const picked = [];
        while (seed.length && picked.length < 3) picked.push(seed.splice(Math.floor(Math.random() * seed.length), 1)[0]);
        return picked;
    }

    function applyUpgradeChoice(choiceId) {
        const choice = UPGRADE_CHOICES.find((item) => item.id === choiceId);
        if (!choice) return;
        choice.apply(state.battle);
        hideOverlay(ui.upgradeOverlay);
        state.battle.awaitingUpgrade = false;
        startWave(state.battle.currentWave + 1);
        renderAll();
    }

    function finishBattle(win, forcedQuit) {
        const chapter = getCurrentChapter();
        state.battle.running = false;
        state.battle.finished = true;
        state.battle.paused = false;
        state.battle.awaitingUpgrade = false;
        const clearedWaves = win ? TOTAL_WAVES : Math.max(1, state.battle.currentWave - (state.battle.spawnQueue.length > 0 || state.battle.enemies.length > 0 ? 1 : 0));
        const rewardMultiplier = win ? 1 : 0.48;
        const baseGold = chapter.goldReward + state.battle.runStats.kills * 7;
        const baseCores = chapter.coreReward + Math.floor(state.battle.runStats.kills / 12);
        const goldGain = Math.round(baseGold * rewardMultiplier * getGoldMultiplier() * state.battle.modifiers.gold);
        const coreGain = Math.round(baseCores * rewardMultiplier);
        const seasonGain = Math.round((50 + clearedWaves * 18 + (win ? 36 : 0)) * (1 + getResearchLevel('relay') * 0.03));
        const fragmentGain = rewardFragmentsForChapter(chapter, win);
        grantReward({ gold: goldGain, cores: coreGain, fragments: fragmentGain });
        state.save.seasonXp += seasonGain;
        state.save.stats.kills += state.battle.runStats.kills;
        state.save.stats.totalDamage += Math.round(state.battle.runStats.damage);
        state.save.stats.bossKills += state.battle.runStats.bossKills;
        if (win) {
            state.save.stats.wins += 1;
            const prevBest = state.save.bestChapterIndex;
            if (state.save.chapterIndex >= state.save.bestChapterIndex && state.save.bestChapterIndex < CHAPTERS.length - 1) {
                state.save.bestChapterIndex += 1;
                if (prevBest !== state.save.bestChapterIndex) showToast(t('toastChapterUnlocked'));
            }
        }
        state.battle.result = { win, forcedQuit: !!forcedQuit, goldGain, coreGain, seasonGain, fragmentGain, chapterProgress: CHAPTERS[state.save.bestChapterIndex].id };
        saveProgress();
        renderResultOverlay();
        renderAll();
        showToast(t(win ? 'toastRunWin' : 'toastRunLose'));
    }

    function renderResultOverlay() {
        const result = state.battle.result;
        if (!result) return;
        ui.resultKicker.textContent = t(result.win ? 'resultWinKicker' : 'resultLoseKicker');
        ui.resultTitle.textContent = t(result.win ? 'resultWinTitle' : 'resultLoseTitle');
        ui.resultGold.textContent = formatCompact(result.goldGain);
        ui.resultCore.textContent = formatCompact(result.coreGain);
        ui.resultSeason.textContent = formatCompact(result.seasonGain);
        ui.resultProgress.textContent = result.chapterProgress;
        ui.resultFragments.innerHTML = Object.entries(result.fragmentGain).map(([towerId, amount]) => `<span class="reward-chip">${t('fragmentsGain').replace('{name}', towerLabel(towerId)).replace('{value}', formatCompact(amount))}</span>`).join('');
        ui.resultMeta.innerHTML = `
            <span class="mini-chip">${(result.win ? t('chapterProgressWin') : t('chapterProgressLose')).replace('{chapter}', result.chapterProgress)}</span>
            <span class="mini-chip">${t('resultStats').replace('{kills}', formatCompact(state.battle.runStats.kills)).replace('{damage}', formatCompact(Math.round(state.battle.runStats.damage)))}</span>
        `;
        ui.nextChapterBtn.style.display = result.win && state.save.chapterIndex < state.save.bestChapterIndex ? '' : 'none';
        showOverlay(ui.resultOverlay);
    }

    function claimMission(id) {
        const mission = MISSIONS.find((item) => item.id === id);
        if (!mission || state.save.missionClaimed.includes(id) || mission.metric(state.save) < mission.target) return;
        state.save.missionClaimed.push(id);
        grantReward(mission.reward);
        saveProgress();
        showToast(t('toastMissionClaimed'));
        renderAll();
    }

    function claimSeason(id) {
        const node = SEASON_NODES.find((item) => item.id === id);
        if (!node || !isSeasonClaimable(id)) return;
        state.save.seasonClaimed.push(id);
        grantReward(node.reward);
        saveProgress();
        showToast(t('toastSeasonClaimed'));
        renderAll();
    }

    function claimSponsorSeason(id) {
        const node = SPONSOR_SEASON_NODES.find((item) => item.id === id);
        if (!node || !isSponsorSeasonClaimable(id)) return;
        state.save.payment.premiumSeasonClaims[id] = true;
        grantReward(node.reward);
        saveProgress();
        showToast(getLocalized({ zh: '璧炲姪杞ㄩ亾濂栧姳宸查鍙', en: 'Sponsor track reward claimed.' }));
        renderAll();
    }

    function claimDailySupply() {
        if (!isDailySupplyReady()) return;
        state.save.dailySupplyAt = Date.now();
        grantReward(getDailySupplyReward());
        saveProgress();
        showToast(t('toastDailySupply'));
        renderAll();
    }

    function buyShopItem(id) {
        const offer = getShopOfferById(id);
        if (!offer) return;
        const cost = getShopOfferCost(id);
        if (offer.priceType === 'gold') {
            if (state.save.gold < cost) return showToast(t('toastNotEnoughGold'));
            state.save.gold -= cost;
        } else if (offer.priceType === 'core') {
            if (state.save.cores < cost) return showToast(t('toastNotEnoughCore'));
            state.save.cores -= cost;
        } else {
            return;
        }
        grantReward(buildShopOfferReward(id));
        state.save.shopPurchases[id] = getShopOfferPurchaseCount(id) + 1;
        saveProgress();
        showToast(t('toastShopBought'));
        renderAll();
    }

    function equipTower(towerId) {
        if (getTowerLevel(towerId) <= 0) return showToast(t('toastNeedUnlock'));
        state.save.laneLoadout[state.save.selectedLane] = towerId;
        saveProgress();
        showToast(t('toastEquipped'));
        renderAll();
    }

    function unlockTower(towerId) {
        const need = getUnlockNeed(towerId);
        if ((state.save.towerFragments[towerId] || 0) < need) return showToast(t('toastNeedFragments'));
        state.save.towerFragments[towerId] -= need;
        state.save.towerLevels[towerId] = 1;
        saveProgress();
        showToast(t('toastTowerUnlock'));
        renderAll();
    }

    function upgradeTower(towerId) {
        const level = getTowerLevel(towerId);
        if (level <= 0) return showToast(t('toastNeedUnlock'));
        if (level >= 8) return;
        const cost = getTowerUpgradeCost(towerId);
        if (state.save.gold < cost) return showToast(t('toastNotEnoughGold'));
        state.save.gold -= cost;
        state.save.towerLevels[towerId] += 1;
        saveProgress();
        showToast(t('toastTowerUp'));
        renderAll();
    }

    function upgradeResearch(researchId) {
        if (!canUpgradeResearch(researchId)) return showToast(t('toastNotEnoughGold'));
        const cost = getResearchCost(researchId);
        state.save.gold -= cost;
        state.save.researches[researchId] += 1;
        state.save.stats.researchDone += 1;
        saveProgress();
        showToast(t('toastResearchUp'));
        renderAll();
    }

    function grantReward(reward) {
        if (!reward) return;
        state.save.gold += Number(reward.gold) || 0;
        state.save.cores += Number(reward.cores) || 0;
        state.save.seasonXp += Number(reward.seasonXp) || 0;
        if (reward.fragments) Object.entries(reward.fragments).forEach(([towerId, amount]) => {
            state.save.towerFragments[towerId] = (state.save.towerFragments[towerId] || 0) + (Number(amount) || 0);
        });
    }

    function rewardFragmentsForChapter(chapter, win) {
        const total = win ? chapter.fragmentReward : Math.max(8, Math.round(chapter.fragmentReward * 0.55));
        const rewards = {};
        const targets = chapter.fragmentFocus.slice();
        for (let index = 0; index < total; index += 1) {
            const towerId = targets[index % targets.length];
            rewards[towerId] = (rewards[towerId] || 0) + 1;
        }
        return rewards;
    }

    function canUpgradeResearch(researchId) {
        const research = RESEARCH[researchId];
        const level = getResearchLevel(researchId);
        return !!research && level < research.maxLevel && state.save.gold >= getResearchCost(researchId);
    }

    function getResearchCost(researchId) {
        const research = RESEARCH[researchId];
        const level = getResearchLevel(researchId);
        const softRamp = Math.max(0, level - 2) * research.stepCost * 0.12;
        const lateRamp = Math.max(0, level - 5) * research.stepCost * 0.18;
        return Math.round(research.baseCost + research.stepCost * level + softRamp + lateRamp);
    }

    function getResearchLevel(researchId, saveSnapshot = state.save) {
        return Number(saveSnapshot.researches[researchId]) || 0;
    }

    function getTowerLevel(towerId) {
        const tower = TOWERS[towerId];
        const level = Number(state.save.towerLevels[towerId]) || 0;
        if (tower && tower.unlockFragments === 0 && level <= 0) return 1;
        return level;
    }

    function getTowerUpgradeCost(towerId) {
        const tower = TOWERS[towerId];
        const level = getTowerLevel(towerId);
        const baseCost = tower.upgradeGold * (1 + (level - 1) * 0.42);
        const midRamp = level >= 4 ? tower.upgradeGold * (level - 3) * 0.14 : 0;
        const lateRamp = level >= 6 ? tower.upgradeGold * (level - 5) * 0.18 : 0;
        return Math.round(baseCost + midRamp + lateRamp);
    }

    function getUnlockNeed(towerId) {
        return TOWERS[towerId]?.unlockFragments || 0;
    }

    function getTowerDamagePerShot(towerId) {
        const tower = TOWERS[towerId];
        const level = Math.max(1, getTowerLevel(towerId));
        const attackBoost = 1 + getResearchLevel('attack') * 0.08;
        return tower.baseDamage * (1 + (level - 1) * 0.24) * attackBoost * state.battle.modifiers.damage;
    }

    function getTowerCooldown(towerId) {
        const tower = TOWERS[towerId];
        const fireBoost = 1 + getResearchLevel('cadence') * 0.06;
        const overclockBoost = state.battle.skillEffect === 'overclock' ? 1.3 : 1;
        return Math.max(0.12, tower.cooldown / (fireBoost * state.battle.modifiers.attackSpeed * overclockBoost));
    }

    function getTowerPreviewDps(towerId) {
        return getTowerLevel(towerId) <= 0 ? 0 : getTowerDamagePerShot(towerId) / getTowerCooldown(towerId);
    }

    function getPowerRating(save) {
        const towerPower = Object.entries(TOWERS).reduce((sum, [towerId, tower]) => {
            const level = Number(save.towerLevels[towerId]) || (tower.unlockFragments === 0 ? 1 : 0);
            return level <= 0 ? sum : sum + tower.power * (1 + (level - 1) * 0.26);
        }, 0);
        const researchPower = Object.values(save.researches).reduce((sum, level) => sum + (Number(level) || 0) * 38, 0);
        return Math.round(towerPower + researchPower + (save.bestChapterIndex + 1) * 56);
    }

    function getGoldMultiplier() {
        return 1 + getResearchLevel('salvage') * 0.1;
    }

    function getCoreMaxHp(saveSnapshot = state.save) {
        return 100 + getResearchLevel('fortify', saveSnapshot) * 12;
    }

    function getCoreShieldCap(saveSnapshot = state.save) {
        return 38 + getResearchLevel('fortify', saveSnapshot) * 10;
    }

    function getSeasonLevelInfo(xp) {
        let level = 1;
        let required = 110;
        let remaining = Math.max(0, Number(xp) || 0);
        while (remaining >= required) {
            remaining -= required;
            level += 1;
            required = 110 + (level - 1) * 34;
        }
        return { level, required, progress: remaining };
    }

    function compareRewardNodeState(a, b) {
        return Number(b.claimable) - Number(a.claimable)
            || Number(a.claimed) - Number(b.claimed)
            || a.index - b.index;
    }

    function getCurrentChapter() { return CHAPTERS[state.save.chapterIndex] || CHAPTERS[0]; }
    function getTotalFragments(save) { return Object.values(save.towerFragments || {}).reduce((sum, value) => sum + (Number(value) || 0), 0); }
    function getHighestTowerLevel(save) { return Math.max(...Object.values(save.towerLevels || { pulse: 1 }).map((level) => Number(level) || 0)); }
    function getThreatKey() { return state.battle.coreHp <= getCoreMaxHp() * 0.35 || state.battle.enemies.length >= 8 ? 'threatDanger' : (state.battle.coreHp <= getCoreMaxHp() * 0.6 || state.battle.enemies.length >= 4 ? 'threatRising' : 'threatStable'); }
    function isSeasonClaimable(nodeId) { return !state.save.seasonClaimed.includes(nodeId) && !!SEASON_NODES.find((node) => node.id === nodeId && state.save.seasonXp >= node.xp); }
    function isSponsorSeasonClaimable(nodeId) { return !!state.save.payment.passUnlocked && !state.save.payment.premiumSeasonClaims[nodeId] && !!SPONSOR_SEASON_NODES.find((node) => node.id === nodeId && state.save.seasonXp >= node.xp); }
    function getSponsorSeasonReadyCount() { return SPONSOR_SEASON_NODES.filter((node) => isSponsorSeasonClaimable(node.id)).length; }
    function isDailySupplyReady() { return !state.save.dailySupplyAt || Date.now() - state.save.dailySupplyAt >= DAILY_SUPPLY_COOLDOWN_MS; }
    function hasLoadoutRedDot() { return Object.keys(TOWERS).some((towerId) => { const level = getTowerLevel(towerId); return level <= 0 ? (state.save.towerFragments[towerId] || 0) >= getUnlockNeed(towerId) : (level < 8 && state.save.gold >= getTowerUpgradeCost(towerId)); }); }
    function hasResearchRedDot() { return Object.keys(RESEARCH).some((id) => canUpgradeResearch(id)); }
    function hasMissionRedDot() { return MISSIONS.some((mission) => !state.save.missionClaimed.includes(mission.id) && mission.metric(state.save) >= mission.target); }
    function hasSeasonRedDot() { return SEASON_NODES.some((node) => isSeasonClaimable(node.id)) || SPONSOR_SEASON_NODES.some((node) => isSponsorSeasonClaimable(node.id)); }
    function hasShopRedDot() { return isDailySupplyReady() || SHOP_ITEMS.some((offer) => canAffordShopOffer(offer)); }
    function showToast(message) { if (!message) return; ui.toast.textContent = message; ui.toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2200); }
    function showOverlay(node) { node.classList.remove('is-hidden'); }
    function hideOverlay(node) { node.classList.add('is-hidden'); }
    function towerLabel(towerId) { return t(`tower${capitalize(towerId)}`); }
    function enemyLabel(enemyId) { return t(`enemy${capitalize(enemyId)}`); }
    function rarityLabel(rarity) { return t(`rarity${capitalize(rarity)}`); }
    function getLaneName(index) { return t(`lane${index + 1}`); }
    function getTowerDescription(towerId) {
        const mapZh = {
            pulse: '均衡输出，适合作为三路通用主塔。',
            laser: '超高射速，专门处理前排快节奏敌人。',
            frost: '附带减速效果，能显著稳定危险波次。',
            rocket: '高额爆裂伤害，擅长处理聚集单位。',
            harvest: '伤害偏低，但击杀时额外回收金币。',
            chain: '命中后会向同一路其他目标传导伤害。',
            rail: '单发穿透整路，适合压制 Boss 与精英。'
        };
        const mapEn = {
            pulse: 'Balanced damage and easy to fit in any lane.',
            laser: 'Very fast fire rate for early fast enemies.',
            frost: 'Applies slow and smooths dangerous waves.',
            rocket: 'Explosive splash damage for clustered lanes.',
            harvest: 'Low damage, but grants extra gold on kills.',
            chain: 'Hits jump to extra targets in the same lane.',
            rail: 'Pierces the whole lane, great against elites and bosses.'
        };
        return state.lang === 'zh' ? mapZh[towerId] : mapEn[towerId];
    }
    function getMissionView(mission) { const progress = Math.min(mission.target, mission.metric(state.save)); const claimed = state.save.missionClaimed.includes(mission.id); const claimable = !claimed && progress >= mission.target; return { id: mission.id, title: getLocalized(mission.title), desc: getLocalized(mission.desc), target: mission.target, progress, progressRate: mission.target <= 0 ? 1 : progress / mission.target, rewardChips: renderRewardChips(mission.reward), claimable, claimed, sort: claimable ? 4000 : claimed ? 100 : 1000 + progress }; }
    function getTowerSortScore(towerId) { const level = getTowerLevel(towerId); const equipped = state.save.laneLoadout.includes(towerId) ? 1000 : 0; const ready = (level <= 0 && (state.save.towerFragments[towerId] || 0) >= getUnlockNeed(towerId)) || (level > 0 && level < 8 && state.save.gold >= getTowerUpgradeCost(towerId)) ? 400 : 0; return equipped + ready + level * 20 + (state.save.towerFragments[towerId] || 0); }
    function capitalize(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''; }
    function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    function getSelectedPaymentOffer() {
        return DEFENSE_PAYMENT_OFFERS.find((offer) => offer.id === selectedPaymentOfferId) || DEFENSE_PAYMENT_OFFERS[0];
    }

    function getPaymentMinerId() {
        if (state.save.payment.minerId) {
            return state.save.payment.minerId;
        }
        state.save.payment.minerId = `DEFENSE_${Math.random().toString(16).slice(2, 10).toUpperCase()}${Date.now().toString(16).slice(-6).toUpperCase()}`;
        saveProgress();
        return state.save.payment.minerId;
    }

    function mapPaymentApiError(errorMessage) {
        const text = String(errorMessage || '').trim();
        const lower = text.toLowerCase();

        if (!text) return getLocalized({ zh: '鏀粯鏍￠獙澶辫触锛岃绋嶅悗閲嶈瘯銆', en: 'Payment verification failed. Please try again.' });
        if (lower.includes('txid not found')) return getLocalized({ zh: '鏈湪 TRON 涓荤綉鎵惧埌璇?txid锛岃纭浜ゆ槗宸茬粡涓婇摼銆', en: 'This txid was not found on TRON mainnet yet.' });
        if (lower.includes('not confirmed yet')) return getLocalized({ zh: '璇ヤ氦鏄撹繕鏈‘璁わ紝璇风◢鍚庡啀璇曘€', en: 'This transfer is not confirmed yet. Try again shortly.' });
        if (lower.includes('execution failed')) return getLocalized({ zh: '閾句笂浜ゆ槗鎵ц澶辫触锛屾棤娉曞彂濂栥€', en: 'The on-chain transaction failed, so rewards cannot be granted.' });
        if (lower.includes('not a trc20 contract transfer')) return getLocalized({ zh: '杩欎笉鏄竴绗?TRC20 杞处銆', en: 'This transaction is not a TRC20 transfer.' });
        if (lower.includes('not trc20 usdt')) return getLocalized({ zh: '璇ヤ氦鏄撲笉鏄?TRC20-USDT 鏀粯銆', en: 'This transaction is not a TRC20-USDT payment.' });
        if (lower.includes('recipient address')) return getLocalized({ zh: '鏀舵鍦板潃涓嶅尮閰嶏紝璇风‘璁よ浆鍏ョ殑鏄綋鍓嶈鍗曞湴鍧€銆', en: 'Recipient address mismatch. Please send to the address shown in the current order.' });
        if (lower.includes('amount mismatch')) return getLocalized({ zh: '鏀粯閲戦涓庡綋鍓嶈鍗曠殑绮剧‘閲戦涓嶄竴鑷淬€', en: 'The payment amount does not match the current exact order amount.' });
        if (lower.includes('before this order was created')) return getLocalized({ zh: '璇ヤ氦鏄撴棭浜庤鍗曞垱寤烘椂闂达紝涓嶈兘鐢ㄤ簬褰撳墠璁㈠崟銆', en: 'This transfer happened before the order was created and cannot be used.' });
        if (lower.includes('after the order expired') || lower.includes('order expired')) return getLocalized({ zh: '褰撳墠璁㈠崟宸茶繃鏈燂紝璇烽噸鏂板垱寤鸿鍗曘€', en: 'This order has expired. Create a new order before paying again.' });
        if (lower.includes('already been used by another order') || lower.includes('another txid')) return getLocalized({ zh: '璇?txid 宸茶鍏朵粬璁㈠崟浣跨敤銆', en: 'This txid has already been used by another order.' });
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) return getLocalized({ zh: '璁㈠崟鍒涘缓澶辫触锛岃閲嶆柊閫夋嫨绀煎寘銆', en: 'Failed to create the payment order. Please select the pack again.' });
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) return getLocalized({ zh: '鏀粯鎺ュ彛鏆傛椂涓嶅彲鐢紝璇风◢鍚庡啀璇曘€', en: 'The payment service is temporarily unavailable. Please try again later.' });
        return text;
    }

    async function requestPaymentApi(path, init = {}) {
        const response = await fetch(`${PAYMENT_API_BASE}${path}`, init);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
            throw new Error(mapPaymentApiError(payload?.error || payload?.message));
        }
        return payload;
    }

    function buildClientPaymentOrder(order) {
        return {
            id: String(order?.orderId || order?.order_id || '--'),
            offerId: String(order?.offerId || order?.offer_id || selectedPaymentOfferId),
            offerName: String(order?.offerName || order?.offer_name || ''),
            minerId: String(order?.minerId || order?.miner_id || getPaymentMinerId()),
            createdAt: Date.parse(order?.createdAt || order?.created_at || '') || Date.now(),
            expiresAt: Date.parse(order?.expiresAt || order?.expires_at || '') || (Date.now() + PAYMENT_ORDER_WINDOW_MS),
            exactAmount: Number(order?.exactAmount || order?.baseAmount || 0),
            payAddress: String(order?.payAddress || ''),
            network: String(order?.network || 'TRON (TRC20)'),
            status: String(order?.status || 'pending')
        };
    }

    async function createBackendPaymentOrder(offerId) {
        const payload = await requestPaymentApi('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minerId: getPaymentMinerId(), offerId })
        });
        return buildClientPaymentOrder(payload?.order);
    }

    async function verifyBackendPayment(orderId, txid) {
        const query = new URLSearchParams({ orderId: String(orderId || ''), txid: String(txid || '') });
        return requestPaymentApi(`/verify-payment?${query.toString()}`);
    }

    async function claimBackendPayment(orderId, txid) {
        return requestPaymentApi('/claim-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, txid })
        });
    }

    function formatPaymentUsdt(value) {
        return `${Number(value || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS)} USDT`;
    }

    async function flushPendingPaymentClaims({ silent = true } = {}) {
        const pendingClaims = state.save.payment.pendingClaims || {};
        const pendingEntries = Object.entries(pendingClaims);
        if (!pendingEntries.length) return 0;

        let syncedCount = 0;
        for (const [orderId, txid] of pendingEntries) {
            if (!orderId || !txid) {
                delete pendingClaims[orderId];
                continue;
            }
            try {
                await claimBackendPayment(orderId, txid);
                delete pendingClaims[orderId];
                syncedCount += 1;
            } catch (error) {
                if (!silent) {
                    console.warn('Defense payment claim sync failed.', { orderId, error });
                }
            }
        }
        saveProgress();
        return syncedCount;
    }

    function isPaymentOrderExpired(order = currentPaymentOrder) {
        return !!order && Number(order.expiresAt || 0) <= Date.now();
    }

    function getPaymentOrderCountdown(order = currentPaymentOrder) {
        if (!order) return '--:--';
        return formatTime(Math.max(0, Number(order.expiresAt || 0) - Date.now()));
    }

    async function copyTextToClipboard(value) {
        const text = String(value || '').trim();
        if (!text) return false;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {}

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }
        textarea.remove();
        return copied;
    }

    function renderPaymentOfferGrid() {
        if (!ui.paymentOfferGrid) return;
        ui.paymentOfferGrid.innerHTML = DEFENSE_PAYMENT_OFFERS.map((offer) => `
            <button
                class="defense-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}"
                type="button"
                data-select-payment-offer="${offer.id}"
                style="--offer-accent:${offer.accent};"
            >
                <span class="pill defense-payment-offer-badge" style="color:${offer.accent};border-color:${offer.accent}55;">${getLocalized(offer.badge)}</span>
                <div class="defense-payment-offer-price">$${offer.price.toFixed(2)}</div>
                <h3>${getLocalized(offer.name)}</h3>
                <p>${getLocalized(offer.desc)}</p>
                <div class="reward-row">${renderRewardChips(offer.reward)}</div>
            </button>
        `).join('');
    }

    function renderPaymentOrderUI() {
        const offer = getSelectedPaymentOffer();
        const order = currentPaymentOrder && currentPaymentOrder.offerId === offer.id ? currentPaymentOrder : null;

        if (ui.paymentTitle) ui.paymentTitle.textContent = getLocalized({ zh: '闃茬嚎鍏呭€间腑蹇', en: 'Defense Top-Up Center' });
        if (ui.paymentDesc) ui.paymentDesc.textContent = getLocalized({ zh: '鍒涘缓閾句笂璁㈠崟鍚庯紝浣跨敤 OKX Wallet 鏀粯绮剧‘閲戦锛屽啀绮樿创 txid 鏍￠獙骞跺彂鏀鹃槻绾垮鍔便€', en: 'Create an on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant Defense rewards.' });
        if (ui.paymentOrderLabel) ui.paymentOrderLabel.textContent = getLocalized({ zh: '璁㈠崟鍙', en: 'Order ID' });
        if (ui.paymentExactLabel) ui.paymentExactLabel.textContent = getLocalized({ zh: '绮剧‘閲戦', en: 'Exact Amount' });
        if (ui.paymentExpiryLabel) ui.paymentExpiryLabel.textContent = getLocalized({ zh: '鍓╀綑鏃堕棿', en: 'Expires In' });
        if (ui.paymentAddressLabel) ui.paymentAddressLabel.textContent = getLocalized({ zh: '鏀舵鍦板潃', en: 'Receiving Address' });
        if (ui.paymentTxidLabel) ui.paymentTxidLabel.textContent = getLocalized({ zh: '绮樿创 OKX Wallet 鐨?txid', en: 'Paste OKX Wallet txid' });
        if (ui.paymentTxidInput) ui.paymentTxidInput.placeholder = getLocalized({ zh: '璇疯緭鍏ユ垨绮樿创 OKX Wallet 鐨勯摼涓?txid', en: 'Paste the on-chain txid from OKX Wallet' });
        if (ui.paymentTxidHint) ui.paymentTxidHint.textContent = getLocalized({ zh: '鍙湁閲戦銆佸湴鍧€鍜屾湁鏁堟椂闂寸獥鍙ｅ叏閮ㄥ尮閰嶇殑璁㈠崟鎵嶈兘閫氳繃鏍￠獙銆', en: 'Only payments that match the exact amount, recipient address, and valid time window can pass verification.' });
        if (ui.paymentCopyAddressBtn) ui.paymentCopyAddressBtn.textContent = getLocalized({ zh: '澶嶅埗鍦板潃', en: 'Copy Address' });
        if (ui.paymentCopyAmountBtn) ui.paymentCopyAmountBtn.textContent = getLocalized({ zh: '澶嶅埗绮剧‘閲戦', en: 'Copy Exact Amount' });
        if (ui.paymentVerifyBtn) ui.paymentVerifyBtn.textContent = getLocalized({ zh: '鏍￠獙 TXID', en: 'Verify TXID' });
        if (ui.paymentAmount) ui.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `$${offer.price.toFixed(2)} USDT`;
        if (ui.paymentMeta) ui.paymentMeta.textContent = `${getLocalized({ zh: 'OKX 閽卞寘', en: 'OKX Wallet' })} 路 ${order?.network || 'TRON (TRC20)'} 路 ${getLocalized(offer.name)}`;
        if (ui.paymentOrderId) ui.paymentOrderId.textContent = order ? order.id : '--';
        if (ui.paymentExactAmount) ui.paymentExactAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : '--';
        if (ui.paymentExpiry) ui.paymentExpiry.textContent = order ? getPaymentOrderCountdown(order) : '--:--';
        if (ui.paymentWallet) ui.paymentWallet.textContent = order?.payAddress || '--';
    }

    function getNormalizedPaymentTxid() {
        return String(ui.paymentTxidInput?.value || '').trim();
    }

    function refreshPaymentVerificationState() {
        if (!ui.paymentStatus || !ui.paymentVerifyBtn || !ui.paymentCopyAddressBtn || !ui.paymentCopyAmountBtn) return;
        const txid = getNormalizedPaymentTxid();
        const txidValid = PAYMENT_TXID_REGEX.test(txid);
        const hasOrder = !!currentPaymentOrder;
        const orderExpired = isPaymentOrderExpired(currentPaymentOrder);

        ui.paymentStatus.classList.remove('is-error', 'is-success');

        if (paymentVerificationState === 'creating') {
            ui.paymentStatus.textContent = getLocalized({ zh: '正在创建链上订单…', en: 'Creating on-chain order…' });
            ui.paymentVerifyBtn.disabled = true;
            ui.paymentCopyAddressBtn.disabled = true;
            ui.paymentCopyAmountBtn.disabled = true;
            return;
        }

        if (paymentVerificationState === 'verifying') {
            ui.paymentStatus.textContent = getLocalized({ zh: '正在链上校验支付…', en: 'Verifying payment on-chain…' });
            ui.paymentVerifyBtn.disabled = true;
            ui.paymentCopyAddressBtn.disabled = true;
            ui.paymentCopyAmountBtn.disabled = true;
            return;
        }

        ui.paymentCopyAddressBtn.disabled = !hasOrder;
        ui.paymentCopyAmountBtn.disabled = !hasOrder;

        if (paymentVerificationState === 'verified') {
            ui.paymentStatus.textContent = paymentVerificationNotice || getLocalized({ zh: '鏀粯宸叉牎楠岄€氳繃锛屽鍔卞凡鍙戞斁銆', en: 'Payment verified and rewards granted.' });
            ui.paymentStatus.classList.add('is-success');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        if (orderExpired) {
            ui.paymentStatus.textContent = getLocalized({ zh: '褰撳墠璁㈠崟宸茶繃鏈燂紝璇烽噸鏂伴€夋嫨绀煎寘鍒涘缓鏂拌鍗曘€', en: 'This order has expired. Select the pack again to create a fresh order.' });
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        if (paymentVerificationError) {
            ui.paymentStatus.textContent = paymentVerificationError;
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = !txidValid || !hasOrder;
            return;
        }

        if (txid && !txidValid) {
            ui.paymentStatus.textContent = getLocalized({ zh: 'TXID 鏍煎紡涓嶆纭紝璇风矘璐?64 浣嶉摼涓?txid銆', en: 'TXID format looks invalid. Please paste the 64-character on-chain txid.' });
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        ui.paymentStatus.textContent = paymentVerificationNotice || getLocalized({ zh: '鍏堝垱寤鸿鍗曪紝鍐嶅幓 OKX Wallet 瀹屾垚鏀粯锛屾渶鍚庢妸 txid 绮樿创鍒拌繖閲屾牎楠屻€', en: 'Create an order, complete the payment in OKX Wallet, then paste the txid here.' });
        ui.paymentVerifyBtn.disabled = !txidValid || !hasOrder;
    }

    function resetPaymentVerificationState(clearInput = false) {
        paymentVerificationState = 'idle';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        if (clearInput && ui.paymentTxidInput) {
            ui.paymentTxidInput.value = '';
        }
        refreshPaymentVerificationState();
    }

    function updatePaymentExpiryUI() {
        if (ui.paymentExpiry && currentPaymentOrder) {
            ui.paymentExpiry.textContent = getPaymentOrderCountdown(currentPaymentOrder);
        }
        if (ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            refreshPaymentVerificationState();
        }
    }

    async function syncPaymentOrderForSelectedOffer(force = false, clearInput = false) {
        const offer = getSelectedPaymentOffer();
        if (!force && currentPaymentOrder && currentPaymentOrder.offerId === offer.id && !isPaymentOrderExpired(currentPaymentOrder)) {
            renderPaymentOrderUI();
            refreshPaymentVerificationState();
            return currentPaymentOrder;
        }

        const requestId = ++paymentOrderNonce;
        paymentVerificationState = 'creating';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        if (clearInput && ui.paymentTxidInput) {
            ui.paymentTxidInput.value = '';
        }
        renderPaymentOrderUI();
        refreshPaymentVerificationState();

        const requestPromise = createBackendPaymentOrder(offer.id)
            .then((order) => {
                if (requestId !== paymentOrderNonce) return currentPaymentOrder || order;
                currentPaymentOrder = order;
                paymentVerificationState = 'idle';
                paymentVerificationError = '';
                paymentVerificationNotice = '';
                renderPaymentOrderUI();
                refreshPaymentVerificationState();
                return order;
            })
            .catch((error) => {
                if (requestId === paymentOrderNonce) {
                    currentPaymentOrder = null;
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = error?.message || getLocalized({ zh: '璁㈠崟鍒涘缓澶辫触锛岃绋嶅悗閲嶈瘯銆', en: 'Failed to create order. Please try again.' });
                    renderPaymentOrderUI();
                    refreshPaymentVerificationState();
                }
                throw error;
            })
            .finally(() => {
                if (paymentOrderRequestPromise === requestPromise) paymentOrderRequestPromise = null;
            });

        paymentOrderRequestPromise = requestPromise;
        return requestPromise;
    }

    function selectPaymentOffer(offerId, { refreshOrder = true } = {}) {
        const offer = DEFENSE_PAYMENT_OFFERS.find((item) => item.id === offerId);
        if (!offer) return;
        selectedPaymentOfferId = offer.id;
        renderPaymentOfferGrid();
        renderPaymentOrderUI();
        if (refreshOrder && ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            resetPaymentVerificationState(true);
            syncPaymentOrderForSelectedOffer(true, true).catch(() => {});
        }
    }

    async function openPaymentModal(offerId = null) {
        if (!ui.paymentModal) return;
        if (offerId) selectedPaymentOfferId = offerId;
        flushPendingPaymentClaims().catch(() => {});
        renderPaymentOfferGrid();
        resetPaymentVerificationState(true);
        renderPaymentOrderUI();
        ui.paymentModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
        try {
            await syncPaymentOrderForSelectedOffer(
                !currentPaymentOrder
                || currentPaymentOrder.offerId !== selectedPaymentOfferId
                || isPaymentOrderExpired(currentPaymentOrder),
                true
            );
        } catch (error) {}
        refreshPaymentVerificationState();
    }

    function closePaymentModal() {
        if (!ui.paymentModal) return;
        ui.paymentModal.classList.add('is-hidden');
        document.body.classList.remove('modal-open');
    }

    async function copyPaymentAddress() {
        const wallet = String(ui.paymentWallet?.textContent || '').trim();
        const copied = await copyTextToClipboard(wallet);
        paymentVerificationError = '';
        paymentVerificationNotice = copied
            ? getLocalized({ zh: '鏀舵鍦板潃宸插鍒躲€', en: 'Receiving address copied.' })
            : getLocalized({ zh: '鑷姩澶嶅埗涓嶅彲鐢紝璇锋墜鍔ㄥ鍒跺湴鍧€銆', en: 'Automatic copy is unavailable. Please copy the address manually.' });
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    async function copyPaymentAmount() {
        let order = currentPaymentOrder && !isPaymentOrderExpired(currentPaymentOrder) ? currentPaymentOrder : null;
        if (!order) {
            try {
                order = await syncPaymentOrderForSelectedOffer(true, false);
            } catch (error) {
                return;
            }
        }
        const copied = await copyTextToClipboard(Number(order.exactAmount || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS));
        paymentVerificationError = '';
        paymentVerificationNotice = copied
            ? getLocalized({ zh: '绮剧‘閲戦宸插鍒躲€', en: 'Exact amount copied.' })
            : getLocalized({ zh: '鑷姩澶嶅埗涓嶅彲鐢紝璇锋墜鍔ㄥ鍒剁簿纭噾棰濄€', en: 'Automatic copy is unavailable. Please copy the exact amount manually.' });
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    function grantPaymentRewards({ orderId, txid, offerId }) {
        const offer = DEFENSE_PAYMENT_OFFERS.find((item) => item.id === offerId) || getSelectedPaymentOffer();
        if (!offer || state.save.payment.claimedOrders[orderId]) return false;

        grantReward(offer.reward);
        state.save.payment.purchaseCount += 1;
        state.save.payment.totalSpent = Math.round((Number(state.save.payment.totalSpent || 0) + Number(offer.price || 0)) * 100) / 100;
        state.save.payment.passUnlocked = true;
        state.save.payment.claimedOrders[orderId] = true;
        state.save.payment.pendingClaims[orderId] = txid;
        state.save.payment.verifiedTxids = [txid, ...(state.save.payment.verifiedTxids || []).filter((item) => item !== txid)].slice(0, 100);
        saveProgress();
        showToast(getLocalized({ zh: `充值成功：${getLocalized(offer.name)} 奖励已到账`, en: `Top-up complete: ${getLocalized(offer.name)} rewards granted` }));
        renderAll();
        return true;
    }

    async function handlePaymentConfirm() {
        if (paymentVerificationState === 'creating' || paymentVerificationState === 'verifying') return;

        const txid = getNormalizedPaymentTxid();
        if (!PAYMENT_TXID_REGEX.test(txid)) {
            paymentVerificationError = getLocalized({ zh: 'TXID 鏍煎紡涓嶆纭紝璇锋鏌ュ悗閲嶆柊杈撳叆銆', en: 'Invalid TXID format. Please check and try again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if ((state.save.payment.verifiedTxids || []).includes(txid)) {
            paymentVerificationError = getLocalized({ zh: '璇?txid 宸茬粡浣跨敤杩囷紝涓嶈兘閲嶅鍙戝銆', en: 'This TXID has already been used and cannot grant rewards again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (!currentPaymentOrder || isPaymentOrderExpired(currentPaymentOrder)) {
            paymentVerificationError = getLocalized({ zh: '褰撳墠璁㈠崟宸茶繃鏈燂紝璇烽噸鏂板垱寤鸿鍗曘€', en: 'The current order has expired. Please create a new one.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        const orderId = currentPaymentOrder.id;
        paymentVerificationState = 'verifying';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        refreshPaymentVerificationState();

        try {
            const verificationResult = await verifyBackendPayment(orderId, txid);
            const orderPayload = verificationResult?.order || {};
            const resolvedOfferId = String(orderPayload?.offerId || currentPaymentOrder.offerId || selectedPaymentOfferId);

            if (orderPayload?.rewardGranted || state.save.payment.claimedOrders[orderId]) {
                if (orderPayload?.rewardGranted && state.save.payment.pendingClaims[orderId]) {
                    delete state.save.payment.pendingClaims[orderId];
                }
                paymentVerificationState = 'verified';
                paymentVerificationNotice = getLocalized({ zh: '璇ヨ鍗曞鍔卞凡鍙戞斁锛屾棤闇€閲嶅棰嗗彇銆', en: 'Rewards for this order have already been granted.' });
                refreshPaymentVerificationState();
                saveProgress();
                return;
            }

            grantPaymentRewards({ orderId, txid, offerId: resolvedOfferId });

            paymentVerificationState = 'verified';
            try {
                await claimBackendPayment(orderId, txid);
                delete state.save.payment.pendingClaims[orderId];
                paymentVerificationNotice = getLocalized({ zh: '閾句笂鏍￠獙鎴愬姛锛屽鍔卞凡鍙戞斁銆', en: 'On-chain verification succeeded and rewards were granted.' });
                saveProgress();
            } catch (claimError) {
                paymentVerificationNotice = getLocalized({ zh: '閾句笂鏍￠獙鎴愬姛锛屽鍔卞凡鍒拌处锛涘悗鍙板彂濂栬褰曞皢鍦ㄧ◢鍚庤嚜鍔ㄥ悓姝ャ€', en: 'On-chain verification succeeded and rewards were granted. Backend sync will retry automatically.' });
                console.warn('Defense payment claim sync queued.', { orderId, claimError });
            }
            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || getLocalized({ zh: '鏀粯鏍￠獙澶辫触锛岃绋嶅悗閲嶈瘯銆', en: 'Payment verification failed. Please try again.' });
            refreshPaymentVerificationState();
        }
    }

    function drawBattlefield() {
        const ctx = ui.ctx;
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#091224');
        gradient.addColorStop(0.45, '#0a1629');
        gradient.addColorStop(1, '#040811');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawLanes(ctx);
        drawCore(ctx);
        drawTowers(ctx);
        drawEnemies(ctx);
        drawCanvasTopInfo(ctx);
    }

    function drawLanes(ctx) {
        const laneWidth = 150;
        LANE_POSITIONS.forEach((laneX, index) => {
            const left = laneX - laneWidth / 2;
            ctx.fillStyle = index === 1 ? 'rgba(114,244,255,0.05)' : 'rgba(255,255,255,0.025)';
            ctx.fillRect(left, 0, laneWidth, CANVAS_HEIGHT);
            ctx.strokeStyle = 'rgba(114,244,255,0.12)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(left, 0); ctx.lineTo(left, CANVAS_HEIGHT); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(left + laneWidth, 0); ctx.lineTo(left + laneWidth, CANVAS_HEIGHT); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.setLineDash([10, 12]);
            ctx.beginPath(); ctx.moveTo(laneX, 0); ctx.lineTo(laneX, CANVAS_HEIGHT); ctx.stroke();
            ctx.setLineDash([]);
        });
    }

    function drawCore(ctx) {
        ctx.fillStyle = 'rgba(255,154,90,0.16)';
        ctx.fillRect(80, SAFE_CORE_Y, CANVAS_WIDTH - 160, 80);
        ctx.strokeStyle = 'rgba(255,210,107,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeRect(110, SAFE_CORE_Y + 8, CANVAS_WIDTH - 220, 56);
        ctx.fillStyle = '#ffd26b';
        ctx.font = '700 22px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`CORE ${Math.max(0, Math.round(state.battle.coreHp))} / ${getCoreMaxHp()}`, CANVAS_WIDTH / 2, SAFE_CORE_Y + 42);
        if (state.battle.shield > 0) {
            ctx.fillStyle = '#72f4ff';
            ctx.font = '600 16px Inter';
            ctx.fillText(t('coreShieldText').replace('{value}', String(Math.round(state.battle.shield))), CANVAS_WIDTH / 2, SAFE_CORE_Y + 64);
        }
    }

    function drawTowers(ctx) {
        state.save.laneLoadout.forEach((towerId, index) => {
            const tower = TOWERS[towerId];
            if (!tower || getTowerLevel(towerId) <= 0) return;
            const x = LANE_POSITIONS[index];
            const y = 842;
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(x - 38, y + 34, 76, 24);
            ctx.fillStyle = tower.color;
            ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(3,8,18,0.72)';
            ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
            if (state.battle.laneFlash[index] > 0) {
                ctx.strokeStyle = 'rgba(255,210,107,0.8)';
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.arc(x, y, 38 + state.battle.laneFlash[index] * 12, 0, Math.PI * 2); ctx.stroke();
                state.battle.laneFlash[index] = Math.max(0, state.battle.laneFlash[index] - 0.08);
            }
            ctx.fillStyle = '#eef5ff';
            ctx.font = '600 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`Lv.${getTowerLevel(towerId)}`, x, y + 62);
        });
    }

    function drawEnemies(ctx) {
        const colors = { grunt: '#91a2c0', fast: '#72f4ff', shield: '#ffd26b', split: '#9f79ff', elite: '#ff9a5a', boss: '#ff6b89' };
        state.battle.enemies.forEach((enemy) => {
            ctx.fillStyle = colors[enemy.type] || '#ffffff';
            ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2); ctx.fill();
            if (enemy.elite) {
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.lineWidth = enemy.boss ? 5 : 3;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2); ctx.stroke();
            }
            if (enemy.stun > 0 || enemy.slow > 0) {
                ctx.strokeStyle = enemy.stun > 0 ? 'rgba(255,210,107,0.7)' : 'rgba(114,244,255,0.72)';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius + 14, 0, Math.PI * 2); ctx.stroke();
            }
            drawHealthBar(ctx, enemy);
        });
    }

    function drawHealthBar(ctx, enemy) {
        const width = enemy.radius * 2;
        const x = enemy.x - width / 2;
        const y = enemy.y - enemy.radius - 16;
        ctx.fillStyle = 'rgba(0,0,0,0.36)';
        ctx.fillRect(x, y, width, 6);
        ctx.fillStyle = enemy.boss ? '#ff6b89' : '#72f4ff';
        ctx.fillRect(x, y, width * Math.max(0, enemy.hp / enemy.maxHp), 6);
    }

    function drawCanvasTopInfo(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        ctx.font = '600 18px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${getCurrentChapter().id} 路 ${t('waveText').replace('{wave}', String(Math.max(1, state.battle.currentWave || 1)))}`, 20, 34);
        ctx.font = '500 14px Inter';
        ctx.fillStyle = 'rgba(145,162,192,0.96)';
        ctx.fillText(`${t('threatLabel')}: ${t(getThreatKey())}`, 20, 56);
        ctx.fillText(`${t(SKILLS[state.save.selectedSkill].nameKey)} 路 ${state.battle.skillCooldown > 0 ? state.battle.skillCooldown.toFixed(1) + 's' : 'READY'}`, 20, 78);
    }
})();
