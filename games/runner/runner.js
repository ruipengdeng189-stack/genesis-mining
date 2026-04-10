(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_runner_v1_save';
    const MAX_REVIVES = 2;
    const REVIVE_COST = 20;
    const SEASON_ANCHOR_UTC = Date.UTC(2026, 3, 7, 0, 0, 0);
    const SEASON_LENGTH_MS = 14 * 24 * 60 * 60 * 1000;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_TXID_REGEX = /^[A-Fa-f0-9]{64}$/;
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_ORDER_WINDOW_MS = 15 * 60 * 1000;
    const NEWBIE_ASSIST_DISTANCE = 900;
    const NEWBIE_ASSIST_OBSTACLE_SPEED = 0.76;
    const NEWBIE_ASSIST_SPAWN_MIN = 0.36;

    const TEXT = {
        zh: {
            backHub: '杩斿洖澶у巺',
            runnerEyebrow: '楂橀€熻窇閰锋寮忕増',
            runnerTitle: '鍒涗笘鐤捐窇',
            runnerSubtitle: '涓夎溅閬?路 闇撹櫣闂伩 路 鐖藉揩鍐叉',
            goldLabel: '閲戝竵',
            coreLabel: '鑳芥牳',
            bestLabel: '鏈€浣宠窛绂?,
            distanceLabel: '璺濈',
            scoreLabel: '绉垎',
            comboLabel: '杩炲嚮',
            startKicker: 'NEON RUSH',
            startTitle: '鍑嗗鍐插埡',
            startDesc: '宸﹀彸鍒囬亾锛屼笂婊戣烦璺冿紝涓嬫粦婊戦摬锛屽敖鍙兘鍚冩弧閲戝竵涓庤兘閲忋€?,
            startRun: '寮€濮嬭窇閰?,
            pauseTitle: '宸叉殏鍋?,
            resumeRun: '缁х画',
            endRun: '缁撴潫鏈眬',
            reviveKicker: 'SECOND CHANCE',
            reviveTitle: '鏄惁绔嬪嵆澶嶆椿锛?,
            reviveDesc: '澶嶆椿浠呮秷鑰楄兘鏍搞€傛瘡灞€鏈€澶氬娲?2 娆★紝鍏呭€煎鍔辫鍓嶅線鍟嗗簵楠岃瘉棰嗗彇銆?,
            reviveBtn: '娑堣€?20 鑳芥牳澶嶆椿',
            skipRevive: '鐩存帴缁撶畻',
            resultKicker: 'RUN COMPLETE',
            resultTitle: '鏈眬缁撶畻',
            resultClose: '鍏抽棴',
            goldGainLabel: '閲戝竵鏀剁泭',
            coreGainLabel: '鑳芥牳鏀剁泭',
            restartRun: '鍐嶆潵涓€灞€',
            overclockLabel: '瓒呴',
            skillLabel: '鎶€鑳藉喎鍗?,
            leftBtn: '宸︾Щ',
            jumpBtn: '璺宠穬',
            rightBtn: '鍙崇Щ',
            slideBtn: '婊戦摬',
            skillBtn: '閲婃斁鎶€鑳?,
            overclockBtn: '瓒呴鍐插埡',
            pauseBtn: '鏆傚仠',
            tabRun: '璺戦叿',
            tabLoadout: '瑁呴厤',
            tabMissions: '浠诲姟',
            tabSeason: '璧涘',
            tabShop: '鍟嗗簵',
            pausedToast: '宸叉殏鍋滄湰灞€',
            resumedToast: '缁х画鍐插埡',
            overclockReady: '瓒呴宸插厖婊?,
            overclockActive: '杩涘叆瓒呴鍐插埡',
            overclockNeed: '瓒呴鑳介噺涓嶈冻',
            skillShield: '鎶ょ浘灞曞紑',
            skillDash: '鐩镐綅鍐插埡鍚姩',
            skillCooling: '鎶€鑳藉喎鍗翠腑',
            notEnoughGold: '閲戝竵涓嶈冻',
            notEnoughCore: '鑳芥牳涓嶈冻锛屾棤娉曞娲?,
            revived: '澶嶆椿鎴愬姛锛岀户缁啿姒?,
            missionClaimed: '浠诲姟濂栧姳宸查鍙?,
            equipped: '宸插垏鎹㈣閰?,
            unlocked: '瑙ｉ攣鎴愬姛',
            topupShopInfo: '鎵€鏈夊厖鍊肩ぜ鍖呴兘浼氬湪閾句笂鏍￠獙鎴愬姛鍚庡嵆鏃跺彂濂栵紝骞跺悓姝ヨВ閿佽禐鍔╄建閬撱€?,
            runPanelTitle: '浠婃棩璧涢亾',
            runPanelDesc: '鐭眬鐖芥劅浼樺厛锛屾牳蹇冩槸鈥滃啀鏉ヤ竴鎶娾€濈殑楂橀€熷惊鐜€?,
            runBriefEyebrow: '璧涢亾绠€鎶?,
            runBriefBtn: '鏌ョ湅璇︽儏',
            runEvent1: '闇撹櫣椋庢毚',
            runEvent1Desc: '闅滅鍒锋柊鏇村揩锛屼絾鑳介噺鑳跺泭鍑虹幇鐜囨彁鍗囥€?,
            runEvent2: '杩炲嚮璇曠偧',
            runEvent2Desc: '淇濇寔 20 杩炲嚮鍚庯紝閲戝竵寰楀垎鍔犳垚澶у箙鎻愰珮銆?,
            runEvent3: '璧涘鑴夊啿',
            runEvent3Desc: '姣忚窇婊?800m 棰濆鑾峰緱璧涘缁忛獙涓庡啿姒滃垎銆?,
            legendCoin: '閲戝竵濂栧姳',
            legendEnergy: '鑳介噺濂栧姳',
            legendWall: '绾㈣壊鍗遍櫓澧?,
            legendGuide: '鈫戣烦鏍?路 鈫撴粦闂?,
            newbieAssistBadge: '鏂版墜淇濇姢',
            newbieAssistHint: '棣栧眬鍓?900m 闅滅鍑忛€熷苟鏀剧紦鍒锋柊锛屽厛鐔熸倝璺宠穬鍜屾粦閾茶妭濂忋€?,
            newbieAssistToast: '鏂版墜淇濇姢宸插紑鍚細鍓?900m 闅滅鏇存參銆佹洿鏄撹瀵?,
            controlsTitle: '鎿嶄綔鎻愮ず',
            controlsDesc: '鎵嬫満鏀寔宸﹀彸鐐瑰嚮鍒囬亾銆佷笂婊戣烦璺冦€佷笅婊戞粦閾诧紱妗岄潰涔熸敮鎸佹柟鍚戦敭涓庣┖鏍笺€?,
            statCurrentRunner: '褰撳墠瑙掕壊',
            statCurrentSkill: '涓诲姩鎶€鑳?,
            statCurrentPassive: '琚姩鑺墖',
            loadoutTitle: '瑁呴厤閰嶇疆',
            loadoutDesc: '瑙掕壊璐熻矗鎵嬫劅宸紓锛屾妧鑳借礋璐ｅ叧閿€嗚浆锛岃鍔ㄨ姱鐗囧喅瀹氶暱鏈熷吇鎴愭柟鍚戙€?,
            runnerTagStarter: '鍒濆鍙敤',
            runnerTagUnlock: '杈炬垚鏉′欢瑙ｉ攣',
            runnerEquip: '瑁呭',
            runnerUnlock: '瑙ｉ攣',
            runnerEquipped: '宸茶澶?,
            skillSection: '鎶€鑳芥ā鍧?,
            passiveSection: '琚姩鑺墖',
            missionsTitle: '浠诲姟涓績',
            missionsDesc: '鐢ㄤ换鍔℃媺璧风煭鏈熺洰鏍囦笌鍥炴祦鑺傚銆?,
            missionClaim: '棰嗗彇濂栧姳',
            missionDone: '宸插畬鎴?,
            missionLocked: '鏈畬鎴?,
            seasonTitle: '璧涘杞ㄩ亾',
            seasonDesc: '璧涘绛夌骇鍥寸粫娲昏穬灞€鏁般€侀噷绋嬪拰鍐叉琛ㄧ幇鎴愰暱銆?,
            seasonLevel: '璧涘绛夌骇',
            seasonXp: '璧涘缁忛獙',
            seasonNext: '璺濈涓嬩竴绾?,
            shopTitle: '琛ョ粰鍟嗗簵',
            shopDesc: '浣跨敤娓告垙鍐呰祫婧愭崲鍗虫椂澧炵泭锛岀洿鎺ュ己鍖栨帴涓嬫潵鍑犲眬璺戦叿銆?,
            shopPreview: '浠呴瑙?,
            shopHot: '楂樿浆鍖?,
            shopValue: '楂樹环鍊?,
            shopClaim: '鍏嶈垂棰嗗彇',
            shopBuy: '绔嬪嵆璐拱',
            shopSoldOut: '浠婃棩鍞絼',
            shopUnavailable: '璧勬簮涓嶈冻',
            freeReviveUsed: '宸蹭娇鐢ㄥ厤璐瑰娲伙紝缁х画鍐叉',
            freeReviveReady: '鏈眬宸叉惡甯﹀厤璐瑰娲?,
            bestToast: '鍒锋柊鏈€浣宠窛绂?,
            runReadyToast: '璧涢亾宸插姞杞斤紝鍑嗗璧疯窇',
            hitWall: '鎾炲嚮闅滅锛屽啿鍒轰腑鏂?,
            seasonReward: '璧涘濂栧姳',
            rankTitle: '鍐叉璇勭骇',
            rankDesc: '璺濈銆佽繛鍑诲拰鏃犱激琛ㄧ幇涓€璧峰喅瀹氳窇閰疯瘎鍒嗐€?,
            touchHint: '鐐瑰嚮宸﹀彸鍒囬亾 路 涓婃粦璺宠穬 路 涓嬫粦婊戦摬'
        },
        en: {
            backHub: 'Back To Hub',
            runnerEyebrow: 'Full Runner Release',
            runnerTitle: 'Genesis Rush',
            runnerSubtitle: '3 Lanes 路 Neon Dodges 路 Rank Pressure',
            goldLabel: 'Gold',
            coreLabel: 'Cores',
            bestLabel: 'Best Distance',
            distanceLabel: 'Distance',
            scoreLabel: 'Score',
            comboLabel: 'Combo',
            startKicker: 'NEON RUSH',
            startTitle: 'Ready To Rush',
            startDesc: 'Switch lanes, jump, slide, and grab coins plus energy to extend the run.',
            startRun: 'Start Run',
            pauseTitle: 'Paused',
            resumeRun: 'Resume',
            endRun: 'End Run',
            reviveKicker: 'SECOND CHANCE',
            reviveTitle: 'Revive now?',
            reviveDesc: 'Revives spend cores only. Each run allows up to 2 revives, while top-up rewards are verified in the shop.',
            reviveBtn: 'Spend 20 Cores',
            skipRevive: 'Settle Now',
            resultKicker: 'RUN COMPLETE',
            resultTitle: 'Run Results',
            resultClose: 'Close',
            goldGainLabel: 'Gold Gain',
            coreGainLabel: 'Core Gain',
            restartRun: 'Run Again',
            overclockLabel: 'Overclock',
            skillLabel: 'Skill Cooldown',
            leftBtn: 'Left',
            jumpBtn: 'Jump',
            rightBtn: 'Right',
            slideBtn: 'Slide',
            skillBtn: 'Cast Skill',
            overclockBtn: 'Overclock',
            pauseBtn: 'Pause',
            tabRun: 'Run',
            tabLoadout: 'Loadout',
            tabMissions: 'Missions',
            tabSeason: 'Season',
            tabShop: 'Shop',
            pausedToast: 'Run paused',
            resumedToast: 'Back to speed',
            overclockReady: 'Overclock ready',
            overclockActive: 'Overclock engaged',
            overclockNeed: 'Overclock not full yet',
            skillShield: 'Shield online',
            skillDash: 'Phase dash triggered',
            skillCooling: 'Skill cooling down',
            notEnoughGold: 'Not enough gold',
            notEnoughCore: 'Not enough cores to revive',
            revived: 'Revived. Push the rank again',
            missionClaimed: 'Mission reward claimed',
            equipped: 'Loadout updated',
            unlocked: 'Unlocked successfully',
            topupShopInfo: 'Verified top-up packs grant rewards instantly after on-chain confirmation and also unlock the sponsor track.',
            runPanelTitle: 'Today\'s Track',
            runPanelDesc: 'Short-run excitement first, designed around a fast one-more-run loop.',
            runBriefEyebrow: 'Run Brief',
            runBriefBtn: 'View Details',
            runEvent1: 'Neon Storm',
            runEvent1Desc: 'Faster obstacle pacing, but more energy capsules spawn.',
            runEvent2: 'Combo Trial',
            runEvent2Desc: 'Reach combo 20 and gold scoring ramps up sharply.',
            runEvent3: 'Season Pulse',
            runEvent3Desc: 'Every 800m grants extra season XP and ladder points.',
            legendCoin: 'Coin Reward',
            legendEnergy: 'Energy Reward',
            legendWall: 'Red Crash Wall',
            legendGuide: '鈫?Jump 路 鈫?Slide',
            newbieAssistBadge: 'NEWBIE',
            newbieAssistHint: 'Before 900m in your first run, obstacles move slower and spawn more gently.',
            newbieAssistToast: 'Newbie assist active: early obstacles are slower and easier to read',
            controlsTitle: 'Controls',
            controlsDesc: 'Phone controls support left / right taps for lane swaps, swipe up to jump, and swipe down to slide.',
            statCurrentRunner: 'Runner',
            statCurrentSkill: 'Active Skill',
            statCurrentPassive: 'Passive Chip',
            loadoutTitle: 'Loadout Setup',
            loadoutDesc: 'Runners shape control feel, active skills swing tight moments, and passive chips define long-term builds.',
            runnerTagStarter: 'Starter',
            runnerTagUnlock: 'Unlock by milestone',
            runnerEquip: 'Equip',
            runnerUnlock: 'Unlock',
            runnerEquipped: 'Equipped',
            skillSection: 'Skill Module',
            passiveSection: 'Passive Chip',
            missionsTitle: 'Mission Center',
            missionsDesc: 'Short-term goals keep the session loop sticky.',
            missionClaim: 'Claim Reward',
            missionDone: 'Completed',
            missionLocked: 'In Progress',
            seasonTitle: 'Season Track',
            seasonDesc: 'Season growth is driven by activity, distance, and ladder performance.',
            seasonLevel: 'Season Level',
            seasonXp: 'Season XP',
            seasonNext: 'To Next Level',
            shopTitle: 'Supply Shop',
            shopDesc: 'Spend in-game resources on instant boosts that improve your next few runs.',
            shopPreview: 'Preview Only',
            shopHot: 'Hot',
            shopValue: 'Value',
            shopClaim: 'Claim Free',
            shopBuy: 'Buy Now',
            shopSoldOut: 'Sold Out Today',
            shopUnavailable: 'Need More Resources',
            freeReviveUsed: 'Free revive used. Back to the rush',
            freeReviveReady: 'Free revive armed for this run',
            bestToast: 'New best distance',
            runReadyToast: 'Track loaded. Ready to rush',
            hitWall: 'Obstacle hit. Run interrupted',
            seasonReward: 'Season rewards',
            rankTitle: 'Rank Rating',
            rankDesc: 'Distance, combo and clean dodges together define your run rating.',
            touchHint: 'Tap left/right to lane swap 路 swipe up jump 路 swipe down slide'
        }
    };

    const RUNNERS = [
        {
            id: 'flash',
            accent: '#57e5ff',
            title: { zh: '闇撹櫣鐤惧奖', en: 'Neon Flash' },
            desc: { zh: '鍩虹鍨嬮珮閫熻鑹诧紝杞悜鐏垫晱锛岄€傚悎浣滀负榛樿涓婃墜鏈轰綋銆?, en: 'Balanced starter runner with responsive lane changes.' },
            unlock: { type: 'default', value: 0 },
            stats: { speed: 1, combo: 1, control: 1.1 },
            upgradeScale: 1
        },
        {
            id: 'volt',
            accent: '#ffd66b',
            title: { zh: '鐢靛姬绌挎鑰?, en: 'Arc Volt' },
            desc: { zh: '鍋忓悜閲戝竵鏀剁泭涓庤兘閲忓惊鐜紝閫傚悎杩芥眰璧勬簮鐨勪腑鏈熻鑹层€?, en: 'Better gold flow and overclock gain for mid-game farming.' },
            unlock: { type: 'bestDistance', value: 900, gold: 3600, core: 0 },
            stats: { speed: 1.06, combo: 1, control: 1 },
            upgradeScale: 1.08
        },
        {
            id: 'prism',
            accent: '#a46bff',
            title: { zh: '妫遍暅瑁傜┖鑰?, en: 'Prism Splitter' },
            desc: { zh: '楂橀闄╅珮鏀剁泭锛屽啿姒滃垎涓庤繛鍑绘垚闀挎洿寮恒€?, en: 'High-risk, high-reward runner built for ladder score pushes.' },
            unlock: { type: 'totalRuns', value: 8, gold: 7600, core: 18 },
            stats: { speed: 1.08, combo: 1.15, control: 0.96 },
            upgradeScale: 1.18
        }
    ];

    const ACTIVE_SKILLS = [
        {
            id: 'shield',
            title: { zh: '鍋忔尟鎶ょ浘', en: 'Polar Shield' },
            desc: { zh: '鑾峰緱 3 绉掓姢鐩撅紝鎸′綇涓€娆¤嚧鍛芥挒鍑汇€?, en: 'Gain a 3-second shield that blocks one fatal hit.' },
            unlock: { type: 'default', value: 0 },
            cooldown: 14,
            upgradeScale: 1
        },
        {
            id: 'dash',
            title: { zh: '鐩镐綅鍐插埡', en: 'Phase Dash' },
            desc: { zh: '绔嬪埢娓呴櫎鍓嶆柟杩戣窛绂婚殰纰嶅苟琛ュ厖瓒呴銆?, en: 'Clear nearby obstacles instantly and fill overclock.' },
            unlock: { type: 'seasonLevel', value: 3, gold: 4200, core: 12 },
            cooldown: 12,
            upgradeScale: 1.12
        }
    ];

    const PASSIVES = [
        {
            id: 'magnet',
            title: { zh: '纾佹毚鐗靛紩', en: 'Magnet Pull' },
            desc: { zh: '鍚搁檮鐩搁偦杞﹂亾鐨勯噾甯佷笌鑳介噺銆?, en: 'Attract coins and energy from adjacent lanes.' },
            unlock: { type: 'default', value: 0 },
            upgradeScale: 1
        },
        {
            id: 'resonance',
            title: { zh: '璋愭尟鍥炶矾', en: 'Resonance Loop' },
            desc: { zh: '楂樿繛鍑绘椂瓒呴澧為暱鏇村揩锛岄€傚悎鍐叉銆?, en: 'Boost overclock gain at high combo for ladder pushes.' },
            unlock: { type: 'totalDistance', value: 3000, gold: 5400, core: 16 },
            upgradeScale: 1.15
        }
    ];

    const RUNNER_PAYMENT_OFFERS = [
        {
            id: 'starter',
            price: 1.0,
            accent: '#57e5ff',
            badge: { zh: '棣栧厖鎺ㄨ崘', en: 'Starter' },
            name: { zh: '璧疯窇琛ョ粰', en: 'Recovery Pack' },
            desc: { zh: '琛ヨ冻鍓嶆湡閲戝竵銆佽兘鏍镐笌棣栬疆澧炵泭锛岄€傚悎蹇€熸妸鑺傚璺戣捣鏉ャ€?, en: 'A steady first top-up that stabilizes gold, cores, and your first boost cycle.' },
            reward: { gold: 4000, core: 40, xp: 180, starterOverclockRuns: 2, settlementBoostRuns: 1, label: { zh: '鍙洿鎺ユ姇鍏ユ案涔呭崌绾?, en: 'Feeds permanent upgrades' } }
        },
        {
            id: 'accelerator',
            price: 2.99,
            accent: '#ff8fe8',
            badge: { zh: '楂樻€т环姣?, en: 'Value' },
            name: { zh: '瓒呴鎺ㄨ繘鍖?, en: 'Hyper Pack' },
            desc: { zh: '鎻愰珮涓湡璧勬簮涓庤秴棰戝惊鐜紝璁╄窇灞€鏇村鏄撹繘鍏ョ埥鐐广€?, en: 'Builds a stronger mid-game loop with more resources and faster overclock pacing.' },
            reward: { gold: 12000, core: 120, xp: 460, starterOverclockRuns: 4, settlementBoostRuns: 3, freeRevives: 1, label: { zh: '閫傚悎瑙ｉ攣骞跺崌绾ф妧鑳?, en: 'Great for unlocks and skill upgrades' } }
        },
        {
            id: 'rush',
            price: 3.99,
            accent: '#ffb168',
            badge: { zh: '鍐叉鍖?, en: 'Rush' },
            name: { zh: '鍐叉鑴夊啿鍖?, en: 'Rank Surge Pack' },
            desc: { zh: '鍋忓悜楂樺垎杩藉嚮锛岃ˉ瓒抽珮鍘嬭窇娉曢渶瑕佺殑閲戝竵銆佺粡楠屼笌瀹归敊銆?, en: 'A ladder-focused bundle that supports high-score attempts with safer retries.' },
            reward: { gold: 20000, core: 180, xp: 720, starterOverclockRuns: 3, settlementBoostRuns: 5, freeRevives: 2, label: { zh: '涓湡寮哄害璺冭縼鍖?, en: 'Mid-game power spike' } }
        },
        {
            id: 'sovereign',
            price: 5.99,
            accent: '#ffe27b',
            badge: { zh: '缁熸不鍖?, en: 'Core' },
            name: { zh: '缁熸不鍗忓畾', en: 'Dominance Pack' },
            desc: { zh: '涓€鍙ｆ皵鎶珮鍚庢湡鍏绘垚寮哄害锛屽悓鏃惰В閿佹湰璧涘璧炲姪杞ㄩ亾銆?, en: 'A stronger late-loop injection that also makes the sponsor lane feel meaningful.' },
            reward: { gold: 42000, core: 320, xp: 1180, starterOverclockRuns: 5, settlementBoostRuns: 8, freeRevives: 3, label: { zh: '鍚庢湡姘镐箙鍏绘垚琛ョ粰', en: 'Late-loop permanent growth' } }
        },
        {
            id: 'nexus',
            price: 9.99,
            accent: '#7dffb3',
            badge: { zh: '鍚庢湡鏍稿績', en: 'Endgame' },
            name: { zh: '鏍稿績鏋㈢航鍖?, en: 'T4 Nexus Pack' },
            desc: { zh: '閫傚悎鍐茶禌瀛ｅ悗娈典笌瀹堟锛屽偍澶囪冻澶熻鐩栧杞珮鍘嬪皾璇曘€?, en: 'Designed for deep-season defense and multiple high-pressure scoring attempts.' },
            reward: { gold: 78000, core: 520, xp: 1800, starterOverclockRuns: 8, settlementBoostRuns: 12, freeRevives: 5, label: { zh: '缁堢洏瑁呴厤鍩瑰吇涓诲姏鍖?, en: 'Endgame build funding' } }
        },
        {
            id: 'throne',
            price: 12.99,
            accent: '#89c9ff',
            badge: { zh: '鐜嬪骇绾?, en: 'Summit' },
            name: { zh: '鐜嬪骇鍗忚', en: 'Throne Protocol' },
            desc: { zh: '椤剁骇绀煎寘锛岃鐩栧啿姒溿€佽禌瀛ｃ€佺画鑸笁鏉′富绾匡紝鐩存帴杩涘叆鍚庢湡鎺ㄨ繘鑺傚銆?, en: 'A top-end bundle that powers ladder, season, and sustain all at once.' },
            reward: { gold: 120000, core: 780, xp: 2600, starterOverclockRuns: 12, settlementBoostRuns: 18, freeRevives: 8, label: { zh: '婊￠厤鍐叉鎺ㄨ繘鍖?, en: 'Max-build ladder push' } }
        }
    ];

    const LOADOUT_UPGRADE_CAPS = {
        runners: 10,
        skills: 8,
        passives: 8
    };

    const LOADOUT_UPGRADE_COSTS = {
        runners: { goldBase: 900, goldStep: 520, coreBase: 0, coreStep: 0 },
        skills: { goldBase: 700, goldStep: 420, coreBase: 8, coreStep: 3 },
        passives: { goldBase: 640, goldStep: 380, coreBase: 6, coreStep: 3 }
    };

    const FUNCTIONAL_SHOP_OFFERS = [
        {
            id: 'daily-cache',
            accent: '#57e5ff',
            stock: 1,
            title: { zh: '姣忔棩琛ョ粰绠?, en: 'Daily Supply Cache' },
            desc: { zh: '姣忓ぉ鍙厤璐归鍙栦竴娆★紝缁欎綘绋冲畾鐨勫紑灞€璧勬簮銆?, en: 'Free once per day to keep your session loop moving.' },
            cost: { gold: 0, core: 0 },
            reward: { gold: 520, core: 4 }
        },
        {
            id: 'core-crate',
            accent: '#ffd66b',
            stock: 2,
            title: { zh: '鑳芥牳琛ュ厖鍖?, en: 'Core Refill Crate' },
            desc: { zh: '鐢ㄩ噾甯佹崲鍙栨洿澶氳兘鏍革紝闄嶄綆澶嶆椿鍜屾妧鑳借瘯閿欏帇鍔涖€?, en: 'Convert gold into cores so revives and retries feel less punishing.' },
            cost: { gold: 1600, core: 0 },
            reward: { gold: 0, core: 14 }
        },
        {
            id: 'battery-pack',
            accent: '#a46bff',
            stock: 2,
            title: { zh: '瓒呴鐢垫睜缁?, en: 'Overclock Battery Pack' },
            desc: { zh: '鎺ヤ笅鏉?3 灞€寮€灞€鑷甫棰濆瓒呴鑳介噺锛屾洿瀹规槗杩涘叆鐖界偣銆?, en: 'Your next 3 runs start with bonus overclock charge for a faster excitement curve.' },
            cost: { gold: 0, core: 10 },
            reward: { starterOverclockRuns: 3 }
        },
        {
            id: 'summit-contract',
            accent: '#59ff9b',
            stock: 1,
            title: { zh: '鍐叉璧炲姪鍚堝悓', en: 'Summit Sponsor Contract' },
            desc: { zh: '鎺ヤ笅鏉?3 灞€棰濆鎻愰珮缁撶畻閲戝竵涓庤禌瀛ｇ粡楠岋紝骞堕檮甯?1 娆″厤璐瑰娲汇€?, en: 'Boost the next 3 runs with extra settlement gold, season XP, and 1 free revive.' },
            cost: { gold: 2600, core: 8 },
            reward: { settlementBoostRuns: 3, freeRevives: 1 }
        }
    ];

    const dom = {
        canvas: document.getElementById('runnerCanvas'),
        canvasWrap: document.getElementById('canvasWrap'),
        runnerMain: document.getElementById('runnerMain'),
        stageCard: document.getElementById('stageCard'),
        panelCard: document.getElementById('panelCard'),
        startOverlay: document.getElementById('startOverlay'),
        pauseOverlay: document.getElementById('pauseOverlay'),
        reviveOverlay: document.getElementById('reviveOverlay'),
        resultOverlay: document.getElementById('resultOverlay'),
        resultCloseBtn: document.getElementById('resultCloseBtn'),
        goldValue: document.getElementById('goldValue'),
        coreValue: document.getElementById('coreValue'),
        bestDistanceValue: document.getElementById('bestDistanceValue'),
        distanceValue: document.getElementById('distanceValue'),
        scoreValue: document.getElementById('scoreValue'),
        comboValue: document.getElementById('comboValue'),
        resultDistance: document.getElementById('resultDistance'),
        resultScore: document.getElementById('resultScore'),
        resultGold: document.getElementById('resultGold'),
        resultCore: document.getElementById('resultCore'),
        resultBadge: document.getElementById('resultBadge'),
        resultSummary: document.getElementById('resultSummary'),
        resultRankPanel: document.getElementById('resultRankPanel'),
        resultMeta: document.getElementById('resultMeta'),
        newbieAssistHint: document.getElementById('newbieAssistHint'),
        overclockBar: document.getElementById('overclockBar'),
        skillBar: document.getElementById('skillBar'),
        runBriefBtn: document.getElementById('runBriefBtn'),
        runBriefHeadline: document.getElementById('runBriefHeadline'),
        runBriefMeta: document.getElementById('runBriefMeta'),
        panelContent: document.getElementById('panelContent'),
        tabBar: document.getElementById('tabBar'),
        soundToggle: document.getElementById('soundToggle'),
        langToggle: document.getElementById('langToggle'),
        startRunBtn: document.getElementById('startRunBtn'),
        restartRunBtn: document.getElementById('restartRunBtn'),
        pauseBtn: document.getElementById('pauseBtn'),
        resumeBtn: document.getElementById('resumeBtn'),
        quitRunBtn: document.getElementById('quitRunBtn'),
        reviveBtn: document.getElementById('reviveBtn'),
        skipReviveBtn: document.getElementById('skipReviveBtn'),
        skillBtn: document.getElementById('skillBtn'),
        overclockBtn: document.getElementById('overclockBtn'),
        toast: document.getElementById('toast'),
        infoModal: document.getElementById('infoModal'),
        infoModalKicker: document.getElementById('infoModalKicker'),
        infoModalTitle: document.getElementById('infoModalTitle'),
        infoModalDesc: document.getElementById('infoModalDesc'),
        infoModalBody: document.getElementById('infoModalBody'),
        infoModalCloseBtn: document.getElementById('infoModalCloseBtn'),
        paymentModal: document.getElementById('runnerPaymentModal'),
        paymentOfferGrid: document.getElementById('runnerPaymentOfferGrid'),
        paymentCloseBtn: document.getElementById('runnerPaymentCloseBtn'),
        paymentTitle: document.getElementById('runnerPaymentTitle'),
        paymentDesc: document.getElementById('runnerPaymentDesc'),
        paymentAmount: document.getElementById('runnerPaymentAmount'),
        paymentMeta: document.getElementById('runnerPaymentMeta'),
        paymentOrderLabel: document.getElementById('runnerPaymentOrderLabel'),
        paymentOrderId: document.getElementById('runnerPaymentOrderId'),
        paymentExactLabel: document.getElementById('runnerPaymentExactLabel'),
        paymentExactAmount: document.getElementById('runnerPaymentExactAmount'),
        paymentExpiryLabel: document.getElementById('runnerPaymentExpiryLabel'),
        paymentExpiry: document.getElementById('runnerPaymentExpiry'),
        paymentAddressLabel: document.getElementById('runnerPaymentAddressLabel'),
        paymentWallet: document.getElementById('runnerPaymentWallet'),
        paymentCopyAddressBtn: document.getElementById('runnerPaymentCopyAddressBtn'),
        paymentCopyAmountBtn: document.getElementById('runnerPaymentCopyAmountBtn'),
        paymentTxidLabel: document.getElementById('runnerPaymentTxidLabel'),
        paymentTxidInput: document.getElementById('runnerPaymentTxidInput'),
        paymentTxidHint: document.getElementById('runnerPaymentTxidHint'),
        paymentStatus: document.getElementById('runnerPaymentStatus'),
        paymentVerifyBtn: document.getElementById('runnerPaymentVerifyBtn')
    };

    const ctx = dom.canvas.getContext('2d');

    function getTabFromHash() {
        const hash = String(window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
        return ['run', 'loadout', 'missions', 'season', 'shop'].includes(hash) ? hash : 'run';
    }

    let activeTab = getTabFromHash();
    let toastTimer = 0;
    let seasonCountdownTimer = 0;
    let missionCountdownTimer = 0;
    let paymentCountdownTimer = 0;
    let audioCtx = null;
    let lastResult = null;
    let activeInfoModal = '';
    let selectedPaymentOfferId = 'starter';
    let currentPaymentOrder = null;
    let paymentVerificationState = 'idle';
    let paymentVerificationError = '';
    let paymentVerificationNotice = '';
    let paymentOrderNonce = 0;
    let paymentOrderRequestPromise = null;
    const panelScrollState = {
        run: 0,
        loadout: 0,
        missions: 0,
        season: 0,
        shop: 0
    };

    const baseState = {
        lang: localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh',
        soundEnabled: true,
        gold: 3200,
        core: 60,
        bestDistance: 0,
        bestScore: 0,
        totalRuns: 0,
        totalDistance: 0,
        totalGoldEarned: 0,
        seasonXp: 120,
        seasonLevel: 2,
        seasonClaims: {},
        rankClaims: {},
        missionBoard: {
            chapter: 1,
            dailyKey: '',
            seeded: false
        },
        boosts: {
            starterOverclockRuns: 0,
            settlementBoostRuns: 0,
            freeRevives: 0
        },
        shop: {
            dailyKey: '',
            stock: {}
        },
        payment: {
            minerId: '',
            purchaseCount: 0,
            totalSpent: 0,
            passUnlocked: false,
            claimedOrders: {},
            pendingClaims: {},
            premiumSeasonClaims: {},
            verifiedTxids: []
        },
        loadout: {
            runner: 'flash',
            skill: 'shield',
            passive: 'magnet'
        },
        upgrades: buildDefaultUpgradeState(),
        unlocked: {
            runners: ['flash'],
            skills: ['shield'],
            passives: ['magnet']
        },
        missionsClaimed: {},
        dailyStats: {
            key: '',
            runs: 0,
            distance: 0,
            bestDistance: 0,
            bestCombo: 0,
            bestScore: 0,
            cleanDistance: 0,
            overclocks: 0
        },
        stats: {
            longestCombo: 0,
            perfectRuns: 0,
            goldRuns: 0,
            bestCleanDistance: 0,
            fastest500TimeMs: null,
            overclockUses: 0
        }
    };

    const playerProfile = loadState();

    const game = {
        running: false,
        paused: false,
        awaitingRevive: false,
        lane: 1,
        targetLane: 1,
        x: 1,
        y: 0,
        vy: 0,
        slideTimer: 0,
        shieldTimer: 0,
        skillCooldown: 0,
        skillCooldownMax: 14,
        overclock: 0,
        overclockActive: 0,
        runGoldMultiplier: 1,
        runSeasonXpMultiplier: 1,
        reviveCount: 0,
        freeReviveAvailable: false,
        freeReviveConsumed: false,
        activeBoosts: [],
        distance: 0,
        score: 0,
        combo: 1,
        maxCombo: 1,
        coinsRun: 0,
        coreRun: 0,
        dodgeRun: 0,
        objects: [],
        spawnTimer: 0,
        elapsed: 0,
        speedBase: 20,
        speedCurrent: 20,
        lastTime: 0,
        flashTimer: 0,
        hitless: true,
        timeAt500: null,
        message: '',
        newbieAssist: false,
        pickupBursts: []
    };

    function t(key) {
        return (TEXT[playerProfile.lang] && TEXT[playerProfile.lang][key]) || key;
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function buildDefaultUpgradeState() {
        return {
            runners: Object.fromEntries(RUNNERS.map((runner) => [runner.id, runner.unlock?.type === 'default' ? 1 : 0])),
            skills: Object.fromEntries(ACTIVE_SKILLS.map((skill) => [skill.id, skill.unlock?.type === 'default' ? 1 : 0])),
            passives: Object.fromEntries(PASSIVES.map((passive) => [passive.id, passive.unlock?.type === 'default' ? 1 : 0]))
        };
    }

    function getUpgradeCollectionKey(category) {
        if (category === 'runner' || category === 'runners') return 'runners';
        if (category === 'skill' || category === 'skills') return 'skills';
        return 'passives';
    }

    function getUpgradeDefs(category) {
        const resolved = getUpgradeCollectionKey(category);
        if (resolved === 'runners') return RUNNERS;
        if (resolved === 'skills') return ACTIVE_SKILLS;
        return PASSIVES;
    }

    function getUpgradeCap(category) {
        return LOADOUT_UPGRADE_CAPS[getUpgradeCollectionKey(category)] || 1;
    }

    function normalizeUpgradeState(rawUpgrades = {}, unlockedState = {}) {
        const defaults = buildDefaultUpgradeState();
        const normalized = {
            runners: {},
            skills: {},
            passives: {}
        };

        Object.keys(defaults).forEach((category) => {
            const unlockedSet = new Set((unlockedState[category] || []));
            Object.keys(defaults[category]).forEach((id) => {
                const rawLevel = Number(rawUpgrades?.[category]?.[id]);
                const fallbackLevel = defaults[category][id];
                let level = Number.isFinite(rawLevel) ? Math.floor(rawLevel) : fallbackLevel;
                if (unlockedSet.has(id)) {
                    level = Math.max(1, level);
                } else {
                    level = 0;
                }
                normalized[category][id] = clamp(level, 0, getUpgradeCap(category));
            });
        });

        return normalized;
    }

    function getEntryLevel(category, id) {
        const resolved = getUpgradeCollectionKey(category);
        return Math.max(0, Math.floor(playerProfile.upgrades?.[resolved]?.[id] || 0));
    }

    function getUpgradeScale(def) {
        return Number(def?.upgradeScale) || 1;
    }

    function getUpgradeCost(category, def, currentLevel = getEntryLevel(category, def.id)) {
        const resolved = getUpgradeCollectionKey(category);
        const cap = getUpgradeCap(resolved);
        if (!def || currentLevel <= 0 || currentLevel >= cap) return null;
        const config = LOADOUT_UPGRADE_COSTS[resolved];
        const tier = Math.max(0, currentLevel - 1);
        const scale = getUpgradeScale(def);
        const gold = Math.round((config.goldBase + tier * config.goldStep) * scale / 10) * 10;
        const core = Math.round((config.coreBase + tier * config.coreStep) * scale);
        return {
            gold: Math.max(0, gold),
            core: Math.max(0, core)
        };
    }

    function canUpgradeEntry(category, def) {
        const cost = getUpgradeCost(category, def);
        return !!cost && canAffordCost(cost);
    }

    function getRunnerStats(runner, level = getEntryLevel('runners', runner.id)) {
        const growth = Math.max(0, level - 1);
        const scale = getUpgradeScale(runner);
        return {
            speed: Number((runner.stats.speed + growth * 0.018 * scale).toFixed(3)),
            combo: Number((runner.stats.combo + growth * 0.02 * scale).toFixed(3)),
            control: Number((runner.stats.control + growth * 0.016 * scale).toFixed(3))
        };
    }

    function getSkillRuntime(skill, level = getEntryLevel('skills', skill.id)) {
        const growth = Math.max(0, level - 1);
        const scale = getUpgradeScale(skill);
        const cooldown = Math.max(7.2, skill.cooldown - growth * 0.45 * scale);
        if (skill.id === 'shield') {
            return {
                cooldown: Number(cooldown.toFixed(2)),
                shieldDuration: Number((3 + growth * 0.24 * scale).toFixed(2))
            };
        }
        return {
            cooldown: Number(cooldown.toFixed(2)),
            clearDistance: Number((28 + growth * 2.2 * scale).toFixed(1)),
            overclockGain: Number((35 + growth * 4 * scale).toFixed(1))
        };
    }

    function getPassiveRuntime(passive, level = getEntryLevel('passives', passive.id)) {
        const growth = Math.max(0, level - 1);
        const scale = getUpgradeScale(passive);
        if (passive.id === 'magnet') {
            return {
                laneReach: growth >= 4 ? 2 : 1,
                pickupZ: Number((32 + growth * 2.3 * scale).toFixed(1)),
                coinYieldBonus: Number((growth * 0.05 * scale).toFixed(2))
            };
        }
        return {
            comboThreshold: Math.max(7, 12 - Math.floor(growth / 2)),
            overclockPerSecond: Number((4.5 + growth * 0.55 * scale).toFixed(2))
        };
    }

    function getUnlockCost(def) {
        const unlock = def?.unlock || {};
        return {
            gold: unlock.gold || 0,
            core: unlock.core || 0
        };
    }

    function formatUnlockCostText(unlock = {}) {
        const parts = [];
        if (unlock.gold) {
            parts.push(playerProfile.lang === 'en' ? `${formatNumber(unlock.gold)} gold` : `${formatNumber(unlock.gold)} 閲戝竵`);
        }
        if (unlock.core) {
            parts.push(playerProfile.lang === 'en' ? `${formatNumber(unlock.core)} cores` : `${formatNumber(unlock.core)} 鑳芥牳`);
        }
        return parts.length ? ` + ${parts.join(' + ')}` : '';
    }

    function renderCompactCostPills(cost = {}, className = 'pill') {
        const labels = [];
        if (cost.gold) {
            labels.push(playerProfile.lang === 'en' ? `${formatNumber(cost.gold)} gold` : `${formatNumber(cost.gold)} 閲戝竵`);
        }
        if (cost.core) {
            labels.push(playerProfile.lang === 'en' ? `${formatNumber(cost.core)} cores` : `${formatNumber(cost.core)} 鑳芥牳`);
        }
        if (!labels.length) {
            labels.push(playerProfile.lang === 'en' ? 'Free' : '鍏嶈垂');
        }
        return labels.map((text) => `<span class="${className}">${text}</span>`).join('');
    }

    function getTotalUpgradeInvestment() {
        return ['runners', 'skills', 'passives'].reduce((sum, category) => {
            return sum + getUpgradeDefs(category).reduce((innerSum, def) => innerSum + Math.max(0, getEntryLevel(category, def.id) - 1), 0);
        }, 0);
    }

    function getAffordableUpgradeCount() {
        return ['runners', 'skills', 'passives'].reduce((sum, category) => {
            return sum + getUpgradeDefs(category).filter((def) => {
                return isUnlocked(category, def) && !!getUpgradeCost(category, def);
            }).filter((def) => canUpgradeEntry(category, def)).length;
        }, 0);
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) {
                localStorage.setItem(HUB_LANG_KEY, baseState.lang);
                return deepClone(baseState);
            }
            const parsed = JSON.parse(raw);
            const unlockedState = {
                runners: Array.from(new Set([...(baseState.unlocked.runners || []), ...((parsed.unlocked && parsed.unlocked.runners) || [])])),
                skills: Array.from(new Set([...(baseState.unlocked.skills || []), ...((parsed.unlocked && parsed.unlocked.skills) || [])])),
                passives: Array.from(new Set([...(baseState.unlocked.passives || []), ...((parsed.unlocked && parsed.unlocked.passives) || [])]))
            };
            return {
                ...deepClone(baseState),
                ...parsed,
                loadout: { ...deepClone(baseState.loadout), ...(parsed.loadout || {}) },
                upgrades: normalizeUpgradeState(parsed.upgrades, unlockedState),
                unlocked: unlockedState,
                seasonClaims: { ...(parsed.seasonClaims || {}) },
                rankClaims: { ...(parsed.rankClaims || {}) },
                missionBoard: { ...deepClone(baseState.missionBoard), ...(parsed.missionBoard || {}) },
                boosts: { ...deepClone(baseState.boosts), ...(parsed.boosts || {}) },
                shop: {
                    ...deepClone(baseState.shop),
                    ...(parsed.shop || {}),
                    stock: { ...deepClone(baseState.shop.stock), ...((parsed.shop && parsed.shop.stock) || {}) }
                },
                payment: {
                    ...deepClone(baseState.payment),
                    ...(parsed.payment || {}),
                    claimedOrders: { ...deepClone(baseState.payment.claimedOrders), ...((parsed.payment && parsed.payment.claimedOrders) || {}) },
                    pendingClaims: { ...deepClone(baseState.payment.pendingClaims), ...((parsed.payment && parsed.payment.pendingClaims) || {}) },
                    premiumSeasonClaims: { ...deepClone(baseState.payment.premiumSeasonClaims), ...((parsed.payment && parsed.payment.premiumSeasonClaims) || {}) },
                    verifiedTxids: Array.isArray(parsed.payment && parsed.payment.verifiedTxids)
                        ? Array.from(new Set((parsed.payment && parsed.payment.verifiedTxids) || [])).slice(0, 100)
                        : []
                },
                missionsClaimed: { ...(parsed.missionsClaimed || {}) },
                dailyStats: { ...deepClone(baseState.dailyStats), ...(parsed.dailyStats || {}) },
                stats: { ...deepClone(baseState.stats), ...(parsed.stats || {}) }
            };
        } catch (error) {
            console.warn('Failed to load runner save.', error);
            return deepClone(baseState);
        }
    }

    function saveState() {
        playerProfile.seasonLevel = calcSeasonLevel(playerProfile.seasonXp);
        localStorage.setItem(SAVE_KEY, JSON.stringify(playerProfile));
        localStorage.setItem(HUB_LANG_KEY, playerProfile.lang);
    }

    function formatNumber(value) {
        return Math.floor(value).toLocaleString(playerProfile.lang === 'en' ? 'en-US' : 'zh-CN');
    }

    function formatDistance(value) {
        return `${formatNumber(value)}m`;
    }

        function calcSeasonLevel(xp) {
        return Math.max(1, Math.floor(xp / 120) + 1);
    }

    function getSeasonEndTime(now = Date.now()) {
        const elapsed = Math.max(0, now - SEASON_ANCHOR_UTC);
        const cycle = Math.floor(elapsed / SEASON_LENGTH_MS);
        return SEASON_ANCHOR_UTC + ((cycle + 1) * SEASON_LENGTH_MS);
    }

    function formatCountdown(ms) {
        const safe = Math.max(0, ms);
        const totalSeconds = Math.floor(safe / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (value) => String(value).padStart(2, '0');
        if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function missionTierLabel(tier) {
        const tierMap = {
            zh: {
                basic: '鍩虹浠诲姟',
                combo: '杩炲嚮浠诲姟',
                elite: '绮捐嫳浠诲姟',
                timed: '闄愭椂浠诲姟'
            },
            en: {
                basic: 'Basic',
                combo: 'Combo',
                elite: 'Elite',
                timed: 'Timed'
            }
        };
        return tierMap[playerProfile.lang][tier] || tier;
    }

    function getEmptyDailyStats(dayKey = getLocalDayKey()) {
        return {
            key: dayKey,
            runs: 0,
            distance: 0,
            bestDistance: 0,
            bestCombo: 0,
            bestScore: 0,
            cleanDistance: 0,
            overclocks: 0
        };
    }

    function hashString(value) {
        return Array.from(String(value || '')).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
    }

    function estimateMissionChapter() {
        const bestDistanceScore = Math.floor(playerProfile.bestDistance / 850);
        const totalRunsScore = Math.floor(playerProfile.totalRuns / 8);
        const totalDistanceScore = Math.floor(playerProfile.totalDistance / 7000);
        const seasonScore = Math.floor(calcSeasonLevel(playerProfile.seasonXp) / 3);
        const ladderScore = Math.floor(getRunnerRankScore() / 1400);
        return Math.max(1, Math.min(12, 1 + bestDistanceScore + totalRunsScore + totalDistanceScore + seasonScore + ladderScore));
    }

    function ensureMissionBoardState() {
        let changed = false;
        if (!playerProfile.missionBoard || typeof playerProfile.missionBoard !== 'object') {
            playerProfile.missionBoard = deepClone(baseState.missionBoard);
            changed = true;
        }

        const estimatedChapter = estimateMissionChapter();
        const currentChapter = Number(playerProfile.missionBoard.chapter);
        const normalizedChapter = Number.isFinite(currentChapter) && currentChapter >= 1
            ? Math.floor(currentChapter)
            : estimatedChapter;

        if (playerProfile.missionBoard.chapter !== normalizedChapter) {
            playerProfile.missionBoard.chapter = normalizedChapter;
            changed = true;
        }

        if (!playerProfile.missionBoard.seeded) {
            const seededChapter = Math.max(playerProfile.missionBoard.chapter, estimatedChapter);
            if (playerProfile.missionBoard.chapter !== seededChapter) {
                playerProfile.missionBoard.chapter = seededChapter;
            }
            playerProfile.missionBoard.seeded = true;
            changed = true;
        }

        const dayKey = getLocalDayKey();
        if (playerProfile.missionBoard.dailyKey !== dayKey) {
            playerProfile.missionBoard.dailyKey = dayKey;
            changed = true;
        }

        return changed;
    }

    function ensureDailyProgressState() {
        let changed = false;
        if (!playerProfile.dailyStats || typeof playerProfile.dailyStats !== 'object') {
            playerProfile.dailyStats = getEmptyDailyStats();
            changed = true;
        }

        const dayKey = getLocalDayKey();
        if (playerProfile.dailyStats.key !== dayKey) {
            playerProfile.dailyStats = getEmptyDailyStats(dayKey);
            changed = true;
        }

        ['runs', 'distance', 'bestDistance', 'bestCombo', 'bestScore', 'cleanDistance', 'overclocks'].forEach((key) => {
            const raw = Number(playerProfile.dailyStats[key]);
            const normalized = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
            if (playerProfile.dailyStats[key] !== normalized) {
                playerProfile.dailyStats[key] = normalized;
                changed = true;
            }
        });

        if (!playerProfile.missionBoard || playerProfile.missionBoard.dailyKey !== dayKey) {
            playerProfile.missionBoard = {
                ...deepClone(baseState.missionBoard),
                ...(playerProfile.missionBoard || {}),
                dailyKey: dayKey
            };
            changed = true;
        }

        return changed;
    }

    function getMissionChapter() {
        ensureMissionBoardState();
        const raw = Number(playerProfile.missionBoard.chapter);
        return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
    }

    function buildMissionReward(baseReward, chapter, multiplier = 1) {
        const scale = Math.max(0, chapter - 1);
        return {
            gold: Math.max(120, Math.round((baseReward.gold + scale * 180) * multiplier)),
            core: Math.max(4, Math.round((baseReward.core + scale * 2.2) * Math.max(1, multiplier * 0.92))),
            xp: Math.max(12, Math.round((baseReward.xp + scale * 9) * multiplier))
        };
    }

    function getMissionPulseVariant(dayKey, chapter = getMissionChapter()) {
        ensureDailyProgressState();
        const pulseScale = Math.max(0, Math.floor((chapter - 1) / 2));
        const variants = [
            {
                key: 'runs',
                tier: 'timed',
                title: { zh: '鏃ュ父鑴夊啿锛氱儹鏈哄眬鏁?, en: 'Daily Pulse: Startup Runs' },
                desc: {
                    zh: `浠婃棩瀹屾垚 ${formatNumber(3 + pulseScale)} 灞€璺戦叿銆俙,
                    en: `Finish ${formatNumber(3 + pulseScale)} runs today.`
                },
                current: () => Math.min(playerProfile.dailyStats.runs || 0, 3 + pulseScale),
                target: 3 + pulseScale,
                reward: buildMissionReward({ gold: 720, core: 12, xp: 52 }, chapter, 1 + pulseScale * 0.08)
            },
            {
                key: 'distance',
                tier: 'timed',
                title: { zh: '鏃ュ父鑴夊啿锛氶噷绋嬫媺婊?, en: 'Daily Pulse: Distance Feed' },
                desc: {
                    zh: `浠婃棩绱璺戝埌 ${formatNumber(1800 + pulseScale * 420)}m銆俙,
                    en: `Reach ${formatNumber(1800 + pulseScale * 420)}m total distance today.`
                },
                current: () => Math.min(playerProfile.dailyStats.distance || 0, 1800 + pulseScale * 420),
                target: 1800 + pulseScale * 420,
                reward: buildMissionReward({ gold: 760, core: 12, xp: 56 }, chapter, 1 + pulseScale * 0.08)
            },
            {
                key: 'combo',
                tier: 'combo',
                title: { zh: '鏃ュ父鑴夊啿锛氳繛鍑绘墜鎰?, en: 'Daily Pulse: Combo Feel' },
                desc: {
                    zh: `浠婃棩杈炬垚 ${formatNumber(18 + pulseScale * 4)} 杩炲嚮銆俙,
                    en: `Reach combo ${formatNumber(18 + pulseScale * 4)} today.`
                },
                current: () => Math.min(playerProfile.dailyStats.bestCombo || 0, 18 + pulseScale * 4),
                target: 18 + pulseScale * 4,
                reward: buildMissionReward({ gold: 820, core: 14, xp: 58 }, chapter, 1 + pulseScale * 0.09)
            },
            {
                key: 'score',
                tier: 'basic',
                title: { zh: '鏃ュ父鑴夊啿锛氶珮鍒嗘牎鍑?, en: 'Daily Pulse: Score Calibration' },
                desc: {
                    zh: `浠婃棩鍗曞眬绉垎杈惧埌 ${formatNumber(1500 + pulseScale * 320)}銆俙,
                    en: `Hit ${formatNumber(1500 + pulseScale * 320)} score in a run today.`
                },
                current: () => Math.min(playerProfile.dailyStats.bestScore || 0, 1500 + pulseScale * 320),
                target: 1500 + pulseScale * 320,
                reward: buildMissionReward({ gold: 860, core: 14, xp: 60 }, chapter, 1 + pulseScale * 0.1)
            },
            {
                key: 'clean',
                tier: 'elite',
                title: { zh: '鏃ュ父鑴夊啿锛氭棤浼ゆ帹杩?, en: 'Daily Pulse: Clean Routing' },
                desc: {
                    zh: `浠婃棩鏃犵鎾炶窇鍒?${formatNumber(900 + pulseScale * 180)}m銆俙,
                    en: `Reach ${formatNumber(900 + pulseScale * 180)}m in a clean run today.`
                },
                current: () => Math.min(playerProfile.dailyStats.cleanDistance || 0, 900 + pulseScale * 180),
                target: 900 + pulseScale * 180,
                reward: buildMissionReward({ gold: 920, core: 16, xp: 66 }, chapter, 1 + pulseScale * 0.11)
            },
            {
                key: 'overclock',
                tier: 'combo',
                title: { zh: '鏃ュ父鑴夊啿锛氳秴棰戝洖璺?, en: 'Daily Pulse: Overclock Loop' },
                desc: {
                    zh: `浠婃棩瑙﹀彂 ${formatNumber(2 + Math.floor(pulseScale / 2))} 娆¤秴棰戙€俙,
                    en: `Trigger overclock ${formatNumber(2 + Math.floor(pulseScale / 2))} times today.`
                },
                current: () => Math.min(playerProfile.dailyStats.overclocks || 0, 2 + Math.floor(pulseScale / 2)),
                target: 2 + Math.floor(pulseScale / 2),
                reward: buildMissionReward({ gold: 880, core: 15, xp: 62 }, chapter, 1 + pulseScale * 0.1)
            }
        ];
        const selected = variants[hashString(dayKey) % variants.length];
        return {
            ...selected,
            id: `pulse_${dayKey}_${selected.key}`,
            section: 'pulse'
        };
    }

    function buildMissionBoard(chapter, dayKey) {
        const stage = Math.max(0, chapter - 1);
        const coreMissions = [
            {
                id: `chapter_${chapter}_distance`,
                section: 'core',
                tier: 'basic',
                title: { zh: '绔犺妭涓荤嚎锛氳窛绂绘帹杩?, en: 'Chapter Contract: Distance Push' },
                desc: {
                    zh: `鍗曞眬璺戝埌 ${formatNumber(600 + stage * 250)}m銆俙,
                    en: `Reach ${formatNumber(600 + stage * 250)}m in a single run.`
                },
                current: () => Math.min(Math.max(Math.floor(game.distance), playerProfile.bestDistance), 600 + stage * 250),
                target: 600 + stage * 250,
                reward: buildMissionReward({ gold: 460, core: 8, xp: 34 }, chapter)
            },
            {
                id: `chapter_${chapter}_runs`,
                section: 'core',
                tier: 'basic',
                title: { zh: '绔犺妭涓荤嚎锛氭寔缁儹鏈?, en: 'Chapter Contract: Heat Loop' },
                desc: {
                    zh: `绱瀹屾垚 ${formatNumber(4 + stage * 2)} 灞€璺戦叿銆俙,
                    en: `Finish ${formatNumber(4 + stage * 2)} total runs.`
                },
                current: () => Math.min(playerProfile.totalRuns, 4 + stage * 2),
                target: 4 + stage * 2,
                reward: buildMissionReward({ gold: 560, core: 10, xp: 38 }, chapter)
            },
            {
                id: `chapter_${chapter}_combo`,
                section: 'core',
                tier: 'combo',
                title: { zh: '绔犺妭涓荤嚎锛氳繛鍑昏妭濂?, en: 'Chapter Contract: Combo Rhythm' },
                desc: {
                    zh: `杈炬垚 ${formatNumber(18 + stage * 4)} 杩炲嚮銆俙,
                    en: `Reach combo ${formatNumber(18 + stage * 4)}.`
                },
                current: () => Math.min(Math.max(game.maxCombo, playerProfile.stats.longestCombo), 18 + stage * 4),
                target: 18 + stage * 4,
                reward: buildMissionReward({ gold: 620, core: 11, xp: 44 }, chapter, 1.04)
            },
            {
                id: `chapter_${chapter}_score`,
                section: 'core',
                tier: 'basic',
                title: { zh: '绔犺妭涓荤嚎锛氶珮鍒嗙ǔ瀹?, en: 'Chapter Contract: Score Stability' },
                desc: {
                    zh: `鍗曞眬绉垎杈惧埌 ${formatNumber(1000 + stage * 320)}銆俙,
                    en: `Hit ${formatNumber(1000 + stage * 320)} score in a run.`
                },
                current: () => Math.min(Math.max(Math.floor(game.score), playerProfile.bestScore), 1000 + stage * 320),
                target: 1000 + stage * 320,
                reward: buildMissionReward({ gold: 700, core: 12, xp: 46 }, chapter, 1.08)
            }
        ];

        const eliteMissions = [];
        if (chapter >= 2) {
            eliteMissions.push(
                {
                    id: `chapter_${chapter}_total_distance`,
                    section: 'elite',
                    tier: 'elite',
                    title: { zh: '绮捐嫳鍚堢害锛氭€婚噷绋嬬Н鍘?, en: 'Elite Contract: Distance Stack' },
                    desc: {
                        zh: `绱鎬婚噷绋嬭揪鍒?${formatNumber(3200 + (chapter - 2) * 1800)}m銆俙,
                        en: `Reach ${formatNumber(3200 + (chapter - 2) * 1800)}m total distance.`
                    },
                    current: () => Math.min(playerProfile.totalDistance, 3200 + (chapter - 2) * 1800),
                    target: 3200 + (chapter - 2) * 1800,
                    reward: buildMissionReward({ gold: 1100, core: 20, xp: 72 }, chapter, 1.16)
                },
                {
                    id: `chapter_${chapter}_clean_distance`,
                    section: 'elite',
                    tier: 'elite',
                    title: { zh: '绮捐嫳鍚堢害锛氭棤浼ゆ帹杩?, en: 'Elite Contract: Clean Velocity' },
                    desc: {
                        zh: `鏃犵鎾炶窇鍒?${formatNumber(950 + (chapter - 2) * 220)}m銆俙,
                        en: `Reach ${formatNumber(950 + (chapter - 2) * 220)}m with a clean run.`
                    },
                    current: () => Math.min(playerProfile.stats.bestCleanDistance || 0, 950 + (chapter - 2) * 220),
                    target: 950 + (chapter - 2) * 220,
                    reward: buildMissionReward({ gold: 1320, core: 24, xp: 84 }, chapter, 1.22)
                }
            );
        }

        if (chapter >= 4) {
            eliteMissions.push({
                id: `chapter_${chapter}_rank`,
                section: 'elite',
                tier: 'elite',
                title: { zh: '绮捐嫳鍚堢害锛氬啿姒滆瘎绾?, en: 'Elite Contract: Ladder Rating' },
                desc: {
                    zh: `璺戦叿璇勫垎杈惧埌 ${formatNumber(1100 + (chapter - 4) * 260)}銆俙,
                    en: `Reach ${formatNumber(1100 + (chapter - 4) * 260)} run rating.`
                },
                current: () => Math.min(getRunnerRankScore(), 1100 + (chapter - 4) * 260),
                target: 1100 + (chapter - 4) * 260,
                reward: buildMissionReward({ gold: 1500, core: 28, xp: 96 }, chapter, 1.28)
            });
        }

        return [getMissionPulseVariant(dayKey, chapter), ...coreMissions, ...eliteMissions];
    }

    function sortMissionEntries(left, right) {
        const leftRank = left.state.complete && !left.state.claimed ? 0 : !left.state.claimed ? 1 : 2;
        const rightRank = right.state.complete && !right.state.claimed ? 0 : !right.state.claimed ? 1 : 2;
        if (leftRank !== rightRank) return leftRank - rightRank;
        const leftRatio = left.target > 0 ? left.state.current / left.target : 0;
        const rightRatio = right.target > 0 ? right.state.current / right.target : 0;
        return rightRatio - leftRatio;
    }

    function maybeAdvanceMissionChapter() {
        const chapter = getMissionChapter();
        const chapterContracts = buildMissionBoard(chapter, getLocalDayKey()).filter((mission) => mission.section !== 'pulse');
        const allClaimed = chapterContracts.length > 0 && chapterContracts.every((mission) => !!playerProfile.missionsClaimed[mission.id]);
        if (!allClaimed) return 0;
        playerProfile.missionBoard.chapter = Math.min(30, chapter + 1);
        return playerProfile.missionBoard.chapter;
    }

    function missionDefinitions() {
        ensureMissionBoardState();
        ensureDailyProgressState();
        return buildMissionBoard(getMissionChapter(), playerProfile.dailyStats.key || getLocalDayKey());
    }

    function getRunner(id) {
        return RUNNERS.find((item) => item.id === id) || RUNNERS[0];
    }

    function getSkill(id) {
        return ACTIVE_SKILLS.find((item) => item.id === id) || ACTIVE_SKILLS[0];
    }

    function getPassive(id) {
        return PASSIVES.find((item) => item.id === id) || PASSIVES[0];
    }

    function localize(item) {
        if (!item) return '';
        if (typeof item === 'string') return item;
        return item[playerProfile.lang] || item.zh || item.en || '';
    }

    function isUnlocked(category, def) {
        return playerProfile.unlocked[category].includes(def.id);
    }

    function meetsUnlock(def) {
        const unlock = def.unlock || { type: 'default', value: 0 };
        if (unlock.type === 'default') return true;
        if (unlock.type === 'bestDistance') return playerProfile.bestDistance >= unlock.value;
        if (unlock.type === 'totalRuns') return playerProfile.totalRuns >= unlock.value;
        if (unlock.type === 'seasonLevel') return calcSeasonLevel(playerProfile.seasonXp) >= unlock.value;
        if (unlock.type === 'totalDistance') return playerProfile.totalDistance >= unlock.value;
        return false;
    }

    function unlockConditionText(def) {
        const unlock = def.unlock || { type: 'default', value: 0 };
        if (unlock.type === 'default') return t('runnerTagStarter');
        if (playerProfile.lang === 'en') {
            if (unlock.type === 'bestDistance') return `Best ${unlock.value}m + ${unlock.gold || 0} gold`;
            if (unlock.type === 'totalRuns') return `${unlock.value} runs + ${unlock.gold || 0} gold`;
            if (unlock.type === 'seasonLevel') return `Season Lv.${unlock.value} + ${unlock.gold || 0} gold`;
            if (unlock.type === 'totalDistance') return `Total ${unlock.value}m + ${unlock.gold || 0} gold`;
        }
        if (unlock.type === 'bestDistance') return `鏈€浣宠窛绂?${unlock.value}m + ${unlock.gold || 0} 閲戝竵`;
        if (unlock.type === 'totalRuns') return `绱 ${unlock.value} 灞€ + ${unlock.gold || 0} 閲戝竵`;
        if (unlock.type === 'seasonLevel') return `璧涘 ${unlock.value} 绾?+ ${unlock.gold || 0} 閲戝竵`;
        if (unlock.type === 'totalDistance') return `鎬婚噷绋?${unlock.value}m + ${unlock.gold || 0} 閲戝竵`;
        return t('runnerTagUnlock');
    }

    function canPurchaseUnlock(def) {
        const unlock = def.unlock || {};
        return meetsUnlock(def) && (unlock.gold || 0) <= playerProfile.gold;
    }

    function unlockConditionText(def) {
        const unlock = def.unlock || { type: 'default', value: 0 };
        if (unlock.type === 'default') return t('runnerTagStarter');
        if (playerProfile.lang === 'en') {
            if (unlock.type === 'bestDistance') return `Best ${unlock.value}m${formatUnlockCostText(unlock)}`;
            if (unlock.type === 'totalRuns') return `${unlock.value} runs${formatUnlockCostText(unlock)}`;
            if (unlock.type === 'seasonLevel') return `Season Lv.${unlock.value}${formatUnlockCostText(unlock)}`;
            if (unlock.type === 'totalDistance') return `Total ${unlock.value}m${formatUnlockCostText(unlock)}`;
        }
        if (unlock.type === 'bestDistance') return `鏈€浣宠窛绂?${unlock.value}m${formatUnlockCostText(unlock)}`;
        if (unlock.type === 'totalRuns') return `绱 ${unlock.value} 灞€${formatUnlockCostText(unlock)}`;
        if (unlock.type === 'seasonLevel') return `璧涘 ${unlock.value} 绾?{formatUnlockCostText(unlock)}`;
        if (unlock.type === 'totalDistance') return `鎬婚噷绋?${unlock.value}m${formatUnlockCostText(unlock)}`;
        return t('runnerTagUnlock');
    }

    function canPurchaseUnlock(def) {
        return meetsUnlock(def) && canAffordCost(getUnlockCost(def));
    }

    function getMissionState(mission) {
        const current = mission.current();
        const complete = current >= mission.target;
        const claimed = !!playerProfile.missionsClaimed[mission.id];
        return { current, complete, claimed };
    }

    function getClaimableMissionCount() {
        return missionDefinitions().filter((mission) => {
            const state = getMissionState(mission);
            return state.complete && !state.claimed;
        }).length;
    }

    function getTrueShopClaimCount() {
        if (ensureDailyShopState()) {
            saveState();
        }
        return FUNCTIONAL_SHOP_OFFERS.filter((offer) => {
            const remaining = getRemainingShopStock(offer.id);
            const isFreeClaim = (offer.cost?.gold || 0) <= 0 && (offer.cost?.core || 0) <= 0;
            return remaining > 0 && isFreeClaim;
        }).length;
    }

    function getSeasonRewards() {
        return [
            {
                level: 2,
                free: {
                    title: { zh: '鍚▼琛ョ粰', en: 'Kickoff Supply' },
                    desc: { zh: '缁欏紑瀛ｅ墠鍑犲眬琛ヤ竴娉㈤噾甯佷笌鑳芥牳锛屽厛鎶婅妭濂忚窇璧锋潵銆?, en: 'A small early-season injection to stabilize your first few runs.' },
                    gold: 900,
                    core: 6
                },
                premium: {
                    title: { zh: '璧炲姪鍚▼绀?, en: 'Sponsor Kickoff' },
                    desc: { zh: '瑙ｉ攣璧炲姪杞ㄩ亾鍚庯紝璧涘鍓嶆灏辫兘棰濆鎷垮埌璧勬簮涓庤捣璺戝姞閫熴€?, en: 'The sponsor lane starts paying immediately with resources and faster run starts.' },
                    gold: 1200,
                    core: 8,
                    xp: 60,
                    starterOverclockRuns: 1,
                    label: { zh: '闄愬畾灏捐抗 路 宸插叆搴?, en: 'Season trail 路 stored' }
                }
            },
            {
                level: 4,
                free: {
                    title: { zh: '涓缁埅', en: 'Mid-Run Reserve' },
                    desc: { zh: '鎻愰珮涓瀹归敊锛岄€傚悎缁х画鍐叉洿闀胯窛绂汇€?, en: 'More fuel for extending mid-length runs with less friction.' },
                    gold: 1400,
                    core: 10
                },
                premium: {
                    title: { zh: '鎶ょ浘璧炲姪琛ョ粰', en: 'Shield Sponsor Cache' },
                    desc: { zh: '鎻愰珮涓瀹归敊锛岀粰楂樺帇璺戞硶琛ヤ竴灞傚厤璐瑰娲讳笌鑳芥牳銆?, en: 'Adds more retry safety with extra cores and a free revive for tougher runs.' },
                    core: 14,
                    freeRevives: 1,
                    label: { zh: '鎶ょ浘鎹㈣偆 路 宸茶褰?, en: 'Shield skin 路 archived' }
                }
            },
            {
                level: 6,
                free: {
                    title: { zh: '鍐叉鐜伴噾娴?, en: 'Ladder Cashflow' },
                    desc: { zh: '寮€濮嬪吋椤鹃噾甯佹粴闆悆涓庣户缁紑灞€鐨勮祫鏈€?, en: 'Adds a stronger gold spike so the ladder loop can keep rolling.' },
                    gold: 2200,
                    core: 14
                },
                premium: {
                    title: { zh: '璧涘妗嗕綋绀?, en: 'Season Frame Cache' },
                    desc: { zh: '杩欎竴妗ｅ紑濮嬬粰鍑烘洿寮虹殑鍐叉缁埅锛岄€傚悎鎸佺画鎷夐珮璇勫垎銆?, en: 'From here the sponsor lane shifts toward longer ladder pressure and steadier scoring.' },
                    gold: 2400,
                    core: 10,
                    settlementBoostRuns: 2,
                    label: { zh: '璧涘澶村儚妗?路 宸茶褰?, en: 'Season frame 路 archived' }
                }
            },
            {
                level: 8,
                free: {
                    title: { zh: '楂樺帇琛ヤ粨', en: 'Pressure Refill' },
                    desc: { zh: '鏇撮€傚悎杩涘叆楂橀毦鑺傚鍚庣殑杩炵画灏濊瘯銆?, en: 'Meant for the point where attempts get hotter and more frequent.' },
                    gold: 3200,
                    core: 22
                },
                premium: {
                    title: { zh: '浠诲姟澧炲箙鍗?, en: 'Mission Boost Card' },
                    desc: { zh: '鍚屾琛ュ己浠诲姟鎺ㄨ繘銆佽捣璺戠垎鍙戝拰缁撶畻鏁堢巼锛岄€傚悎涓悗鏈熷啿绔犺妭銆?, en: 'Supports chapter pushing with better starts, stronger settlements, and smoother mission flow.' },
                    gold: 3200,
                    xp: 120,
                    starterOverclockRuns: 2,
                    settlementBoostRuns: 1,
                    label: { zh: '浠诲姟鍔犻€熸潈闄?, en: 'Mission boost access' }
                }
            },
            {
                level: 10,
                free: {
                    title: { zh: '鍐插埡鑳芥牳绠?, en: 'Core Surge Box' },
                    desc: { zh: '缁欏悗缁娲汇€佹妧鑳借瘯閿欍€佹瀬闄愬啿姒滅暀鍑虹┖闂淬€?, en: 'Creates breathing room for revives, skill retries, and harder pushes.' },
                    gold: 4200,
                    core: 30
                },
                premium: {
                    title: { zh: '鐢靛姬鍐插埡绀?, en: 'Arc Sprint Cache' },
                    desc: { zh: '鍚庢湡瀹归敊鍘嬪姏寮€濮嬩笂鏉ワ紝杩欎竴妗ｉ噸鐐硅ˉ鍏嶈垂澶嶆椿鍜屾牳蹇冭祫婧愩€?, en: 'Late-season attempts get sharper, so this tier leans into retry safety and core resources.' },
                    gold: 4200,
                    core: 24,
                    freeRevives: 1,
                    label: { zh: '楂橀樁鎷栧熬 路 宸插叆搴?, en: 'Arc trail 路 stored' }
                }
            },
            {
                level: 12,
                free: {
                    title: { zh: '鍚庢湡鍌ㄥ', en: 'Late Reserve' },
                    desc: { zh: '鎶婂悗鏈熸瘡娆″紑璺戠殑璧勬簮鐒﹁檻鍐嶅線涓嬪帇涓€灞傘€?, en: 'Softens late-game resource pressure so repeat runs stay attractive.' },
                    gold: 5600,
                    core: 40
                },
                premium: {
                    title: { zh: '鍟嗗簵鏉冮檺绁?, en: 'Store Access Ticket' },
                    desc: { zh: '鎶婁腑鍚庢湡鐨勫晢搴楄ˉ缁欓摼鎷夐暱锛岃浣犳洿鏁㈣繛缁噸寮€璇曟洿楂樺垎銆?, en: 'Expands your mid-to-late shop loop so repeated high-score attempts feel sustainable.' },
                    gold: 6200,
                    core: 28,
                    settlementBoostRuns: 2,
                    label: { zh: '鍟嗗簵鏉冪泭宸叉縺娲?, en: 'Store perk activated' }
                }
            },
            {
                level: 14,
                free: {
                    title: { zh: '姒滈鎺ㄨ繘鍣?, en: 'Summit Push' },
                    desc: { zh: '鏇村己閲戝竵鍖咃紝鏂逛究鍐插墠鍑犲悕鏃舵寔缁噸寮€銆?, en: 'A heavier gold drop built for repeated attempts near the summit.' },
                    gold: 7600,
                    core: 52
                },
                premium: {
                    title: { zh: '鐜嬪骇鍐叉绀?, en: 'Summit Prestige Cache' },
                    desc: { zh: '涓磋繎姒滈鏃讹紝杩欎竴妗ｄ細鏄庢樉鎻愰珮寮€灞€閫熷害涓庡閿欏偍澶囥€?, en: 'Near the summit, this tier pushes both early tempo and late-run safety much harder.' },
                    gold: 8400,
                    core: 36,
                    starterOverclockRuns: 2,
                    freeRevives: 1,
                    label: { zh: '鑽ｈ獕濮挎€?路 宸茶В閿?, en: 'Prestige pose 路 unlocked' }
                }
            },
            {
                level: 16,
                free: {
                    title: { zh: '璧涘缁堝眬琛ョ粰', en: 'Season End Cache' },
                    desc: { zh: '鏈€鍚庝竴娈佃祫婧愬洖棣堬紝璁╅珮娲昏穬鐜╁鏈夋槑纭敹灏剧洰鏍囥€?, en: 'A stronger end-of-track payout for players who stay active deep into the season.' },
                    gold: 9800,
                    core: 66
                },
                premium: {
                    title: { zh: '璧涘鐜嬪骇绀?, en: 'Season Throne Cache' },
                    desc: { zh: '璧涘灏炬鐨勫ぇ棰濆洖棣堬紝涓撻棬鏈嶅姟浜庡啿姒滃畧姒滀笌楂橀閲嶅紑銆?, en: 'A heavy end-of-season sponsor payout built for summit chasing and defense.' },
                    gold: 12000,
                    core: 48,
                    settlementBoostRuns: 3,
                    freeRevives: 2,
                    label: { zh: '闄愬畾璺戣€呯毊鑲?路 宸插瓨妗?, en: 'Season skin 路 archived' }
                }
            }
        ];
    }

    function getRankRewards() {
        return [
            {
                id: 'rank_520',
                score: 520,
                title: { zh: '鐧介摱鍚皝濂栧姳', en: 'Silver Gate Cache' },
                desc: {
                    zh: '绗竴娆℃妸璇勫垎鎺ㄥ埌鐧介摱绾垮悗锛岀珛鍒荤粰涓€娉㈢户缁啿鍒嗙殑璧疯窇璧勬簮銆?,
                    en: 'Your first push into Silver should immediately fund a few stronger follow-up runs.'
                },
                reward: { gold: 1200, core: 10, starterOverclockRuns: 1 }
            },
            {
                id: 'rank_1180',
                score: 1180,
                title: { zh: '榛勯噾杩藉嚮濂栧姳', en: 'Gold Chase Cache' },
                desc: {
                    zh: '鍒颁簡榛勯噾浠ュ悗锛屽紑濮嬮渶瑕佹洿绋崇殑涓眬鑺傚锛屽洜姝よˉ涓€灞傜粨绠楀鐩娿€?,
                    en: 'Gold asks for more stable mid-run rhythm, so the reward shifts toward settlement power.'
                },
                reward: { gold: 2600, core: 16, settlementBoostRuns: 1 }
            },
            {
                id: 'rank_2060',
                score: 2060,
                title: { zh: '鐧介噾绐佺牬濂栧姳', en: 'Platinum Break Cache' },
                desc: {
                    zh: '鐧介噾寮€濮嬪閿欐洿閲嶈锛屽姞鍏ヤ竴娆″厤璐瑰娲绘潵鏀寔鏋侀檺灏濊瘯銆?,
                    en: 'At Platinum, retry tolerance matters more, so this one adds a free revive.'
                },
                reward: { gold: 4200, core: 24, freeRevives: 1 }
            },
            {
                id: 'rank_3320',
                score: 3320,
                title: { zh: '閽荤煶绋冲帇濂栧姳', en: 'Diamond Pressure Cache' },
                desc: {
                    zh: '閽荤煶娈甸渶瑕佹寔缁畧鑺傚锛屽洜姝ゅ悓鏃惰ˉ璧疯窇鐖嗗彂鍜岀粨绠楁敹鐩娿€?,
                    en: 'Diamond asks you to sustain pressure, so this reward supports both starts and settlements.'
                },
                reward: { gold: 6800, core: 36, starterOverclockRuns: 1, settlementBoostRuns: 2 }
            },
            {
                id: 'rank_4980',
                score: 4980,
                title: { zh: '浼犺灏侀《濂栧姳', en: 'Legend Summit Cache' },
                desc: {
                    zh: '浼犺娈垫槸姒滃崟鑽ｈ獕闂ㄦ锛屽鍔变細鏄庢樉鏇村帤锛岀敤鏉ユ敮鎾戝悗缁畧姒溿€?,
                    en: 'Legend is where prestige starts to matter, so the payout is noticeably heavier for ladder defense.'
                },
                reward: { gold: 9800, core: 52, freeRevives: 2, settlementBoostRuns: 2 }
            },
            {
                id: 'rank_6200',
                score: 6200,
                title: { zh: '璧涘瓒呰浇濂栧姳', en: 'Season Overdrive Cache' },
                desc: {
                    zh: '瓒呰繃浼犺绾垮悗锛岀户缁粰涓€妗ｉ《娈靛啿鍒哄鍔憋紝淇濇寔鍚庢湡鐩爣涓嶇┖銆?,
                    en: 'Past the Legend line, a final overdrive cache keeps late-season aspiration alive.'
                },
                reward: { gold: 13600, core: 72, starterOverclockRuns: 2, settlementBoostRuns: 3, freeRevives: 2 }
            }
        ];
    }

    function getSeasonRewardState(level) {
        const currentLevel = calcSeasonLevel(playerProfile.seasonXp);
        const claimed = !!playerProfile.seasonClaims[String(level)];
        return {
            claimed,
            unlocked: currentLevel >= level,
            claimable: currentLevel >= level && !claimed
        };
    }

    function getClaimableSeasonRewardCount() {
        return getSeasonRewards().filter((reward) => getSeasonRewardState(reward.level).claimable).length;
    }

    function getSeasonSponsorRewardState(level) {
        const currentLevel = calcSeasonLevel(playerProfile.seasonXp);
        const claimed = !!(playerProfile.payment && playerProfile.payment.premiumSeasonClaims && playerProfile.payment.premiumSeasonClaims[String(level)]);
        const passUnlocked = !!(playerProfile.payment && playerProfile.payment.passUnlocked);
        return {
            claimed,
            passUnlocked,
            unlocked: passUnlocked && currentLevel >= level,
            claimable: passUnlocked && currentLevel >= level && !claimed
        };
    }

    function getClaimableSeasonSponsorRewardCount() {
        return getSeasonRewards().filter((reward) => getSeasonSponsorRewardState(reward.level).claimable).length;
    }

    function getRankRewardState(reward, score = getRunnerRankScore()) {
        const claimed = !!playerProfile.rankClaims[reward.id];
        return {
            claimed,
            unlocked: score >= reward.score,
            claimable: score >= reward.score && !claimed
        };
    }

    function getClaimableRankRewardCount(score = getRunnerRankScore()) {
        return getRankRewards().filter((reward) => getRankRewardState(reward, score).claimable).length;
    }

    function getLocalDayKey() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    }

    function getDefaultShopStock() {
        return FUNCTIONAL_SHOP_OFFERS.reduce((stock, offer) => {
            stock[offer.id] = offer.stock;
            return stock;
        }, {});
    }

    function ensureDailyShopState() {
        if (!playerProfile.shop || typeof playerProfile.shop !== 'object') {
            playerProfile.shop = deepClone(baseState.shop);
        }
        if (!playerProfile.shop.stock || typeof playerProfile.shop.stock !== 'object') {
            playerProfile.shop.stock = {};
        }

        const dayKey = getLocalDayKey();
        let changed = false;

        if (playerProfile.shop.dailyKey !== dayKey) {
            playerProfile.shop.dailyKey = dayKey;
            playerProfile.shop.stock = getDefaultShopStock();
            changed = true;
        }

        FUNCTIONAL_SHOP_OFFERS.forEach((offer) => {
            const raw = Number(playerProfile.shop.stock[offer.id]);
            const normalized = Number.isFinite(raw)
                ? Math.max(0, Math.min(offer.stock, Math.floor(raw)))
                : offer.stock;
            if (playerProfile.shop.stock[offer.id] !== normalized) {
                playerProfile.shop.stock[offer.id] = normalized;
                changed = true;
            }
        });

        return changed;
    }

    function getFunctionalShopOffer(id) {
        return FUNCTIONAL_SHOP_OFFERS.find((offer) => offer.id === id) || null;
    }

    function getRemainingShopStock(id) {
        const offer = getFunctionalShopOffer(id);
        if (!offer) return 0;
        const current = Number(playerProfile.shop.stock[offer.id]);
        return Number.isFinite(current) ? Math.max(0, current) : offer.stock;
    }

    function canAffordCost(cost = {}) {
        return (cost.gold || 0) <= playerProfile.gold && (cost.core || 0) <= playerProfile.core;
    }

    function formatBoostRewardText(key, value = 0) {
        const amount = formatNumber(value);
        if (key === 'starterOverclockRuns') {
            return localize({ zh: `瓒呴寮€灞€ x${amount}`, en: `Boosted starts x${amount}` });
        }
        if (key === 'settlementBoostRuns') {
            return localize({ zh: `缁撶畻澧炵泭 x${amount}`, en: `Settlement boost x${amount}` });
        }
        if (key === 'freeRevives') {
            return localize({ zh: `鍏嶈垂澶嶆椿 x${amount}`, en: `Free revives x${amount}` });
        }
        return amount;
    }

    function getBoostInventoryEntries() {
        return [
            {
                key: 'starterOverclockRuns',
                accent: '#a46bff',
                title: localize({ zh: '璧疯窇瓒呴', en: 'Starter Overclock' }),
                desc: localize({ zh: '姣忔娑堣€?1 灞€锛屽紑灞€棰濆鎼哄甫 28% 瓒呴鑳介噺锛屾洿蹇繘鍏ョ埥鐐广€?, en: 'Consumes 1 charge per run and starts you with +28% overclock.' }),
                count: playerProfile.boosts.starterOverclockRuns || 0
            },
            {
                key: 'settlementBoostRuns',
                accent: '#59ff9b',
                title: localize({ zh: '缁撶畻澧炵泭', en: 'Settlement Boost' }),
                desc: localize({ zh: '姣忔娑堣€?1 灞€锛岀粨绠楅噾甯佷笌璧涘缁忛獙鍚屾椂鎻愬崌鑷?1.25 鍊嶃€?, en: 'Consumes 1 charge per run and boosts settlement gold plus season XP to x1.25.' }),
                count: playerProfile.boosts.settlementBoostRuns || 0
            },
            {
                key: 'freeRevives',
                accent: '#57e5ff',
                title: localize({ zh: '鍏嶈垂澶嶆椿', en: 'Free Revive' }),
                desc: localize({ zh: '淇濈暀鍒扮湡姝ｅけ璇椂鎵嶆秷鑰楋紝涓嶄細鍦ㄥ紑灞€鐧界櫧娴垂銆?, en: 'Stays stored until a real revive is used, so the charge is never wasted on run start.' }),
                count: playerProfile.boosts.freeRevives || 0
            }
        ];
    }

    function renderCostPills(cost = {}) {
        const labels = [];
        if (cost.gold) {
            labels.push(localize({ zh: `娑堣€楅噾甯?${formatNumber(cost.gold)}`, en: `Costs ${formatNumber(cost.gold)} gold` }));
        }
        if (cost.core) {
            labels.push(localize({ zh: `娑堣€楄兘鏍?${formatNumber(cost.core)}`, en: `Costs ${formatNumber(cost.core)} cores` }));
        }
        if (!labels.length) {
            labels.push(localize({ zh: '鍏嶈垂棰嗗彇', en: 'Free claim' }));
        }
        return labels.map((text) => `<span class="shop-pill">${text}</span>`).join('');
    }

    function applyRewardBundle(reward = {}) {
        playerProfile.gold += reward.gold || 0;
        playerProfile.core += reward.core || 0;
        playerProfile.seasonXp += reward.xp || 0;
        playerProfile.boosts.starterOverclockRuns += reward.starterOverclockRuns || 0;
        playerProfile.boosts.settlementBoostRuns += reward.settlementBoostRuns || 0;
        playerProfile.boosts.freeRevives += reward.freeRevives || 0;
    }

    function getShopAlertCount() {
        return getTrueShopClaimCount();
    }

    function purchaseShopOffer(id) {
        if (ensureDailyShopState()) {
            saveState();
        }

        const offer = getFunctionalShopOffer(id);
        if (!offer) return;

        const remaining = getRemainingShopStock(id);
        if (remaining <= 0) {
            showToast(t('shopSoldOut'));
            return;
        }

        if (!canAffordCost(offer.cost)) {
            const needGold = (offer.cost.gold || 0) > playerProfile.gold;
            const needCore = (offer.cost.core || 0) > playerProfile.core;
            if (needGold && needCore) showToast(t('shopUnavailable'));
            else if (needGold) showToast(t('notEnoughGold'));
            else showToast(playerProfile.lang === 'en' ? 'Not enough cores' : '鑳芥牳涓嶈冻');
            return;
        }

        playerProfile.gold -= offer.cost.gold || 0;
        playerProfile.core -= offer.cost.core || 0;
        applyRewardBundle(offer.reward);
        playerProfile.shop.stock[id] = Math.max(0, remaining - 1);

        saveState();
        playSfx('reward');
        showToast(localize({
            zh: `${localize(offer.title)} 宸插叆搴揱,
            en: `${localize(offer.title)} added`
        }));
        renderAll();
    }

    function getSelectedPaymentOffer() {
        return RUNNER_PAYMENT_OFFERS.find((offer) => offer.id === selectedPaymentOfferId) || RUNNER_PAYMENT_OFFERS[0];
    }

    function getPaymentMinerId() {
        if (playerProfile.payment.minerId) {
            return playerProfile.payment.minerId;
        }
        playerProfile.payment.minerId = `RUNNER_${Math.random().toString(16).slice(2, 10).toUpperCase()}${Date.now().toString(16).slice(-6).toUpperCase()}`;
        saveState();
        return playerProfile.payment.minerId;
    }

    function mapPaymentApiError(errorMessage) {
        const text = String(errorMessage || '').trim();
        const lower = text.toLowerCase();

        if (!text) {
            return localize({ zh: '鏀粯鏍￠獙澶辫触锛岃绋嶅悗閲嶈瘯銆?, en: 'Payment verification failed. Please try again.' });
        }
        if (lower.includes('txid not found')) {
            return localize({ zh: '鏈湪 TRON 涓荤綉鎵惧埌璇?txid锛岃纭宸蹭笂閾俱€?, en: 'This txid was not found on TRON mainnet yet.' });
        }
        if (lower.includes('not confirmed yet')) {
            return localize({ zh: '浜ゆ槗杩樻湭纭锛岃绋嶅悗鍐嶆鏍￠獙銆?, en: 'This transfer is not confirmed yet. Try again shortly.' });
        }
        if (lower.includes('execution failed')) {
            return localize({ zh: '閾句笂浜ゆ槗鎵ц澶辫触锛屾棤娉曞彂濂栥€?, en: 'The on-chain transaction failed, so rewards cannot be granted.' });
        }
        if (lower.includes('not a trc20 contract transfer')) {
            return localize({ zh: '璇ヤ氦鏄撲笉鏄?TRC20 杞处銆?, en: 'This transaction is not a TRC20 transfer.' });
        }
        if (lower.includes('not trc20 usdt')) {
            return localize({ zh: '璇ヤ氦鏄撲笉鏄?TRC20-USDT 杞处銆?, en: 'This transaction is not a TRC20-USDT payment.' });
        }
        if (lower.includes('recipient address')) {
            return localize({ zh: '鏀舵鍦板潃涓嶅尮閰嶏紝璇风‘璁や綘杞叆鐨勬槸褰撳墠璁㈠崟鍦板潃銆?, en: 'Recipient address mismatch. Please send to the address shown in the current order.' });
        }
        if (lower.includes('amount mismatch')) {
            return localize({ zh: '鏀粯閲戦涓庡綋鍓嶈鍗曠殑绮剧‘閲戦涓嶄竴鑷淬€?, en: 'The payment amount does not match the current exact order amount.' });
        }
        if (lower.includes('before this order was created')) {
            return localize({ zh: '璇ヤ氦鏄撴棭浜庤鍗曞垱寤烘椂闂达紝涓嶈兘鐢ㄤ簬褰撳墠璁㈠崟銆?, en: 'This transfer happened before the order was created and cannot be used.' });
        }
        if (lower.includes('after the order expired') || lower.includes('order expired')) {
            return localize({ zh: '璁㈠崟宸茶繃鏈燂紝璇烽噸鏂板垱寤鸿鍗曞悗鍐嶆敮浠樸€?, en: 'This order has expired. Create a new order before paying again.' });
        }
        if (lower.includes('already been used by another order') || lower.includes('another txid')) {
            return localize({ zh: '璇?txid 宸茶鍏朵粬璁㈠崟浣跨敤銆?, en: 'This txid has already been used by another order.' });
        }
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) {
            return localize({ zh: '璁㈠崟鍒涘缓澶辫触锛岃閲嶆柊閫夋嫨绀煎寘銆?, en: 'Failed to create the payment order. Please select the pack again.' });
        }
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) {
            return localize({ zh: '鏀粯鎺ュ彛鏆傛椂涓嶅彲鐢紝璇风◢鍚庡啀璇曘€?, en: 'The payment service is temporarily unavailable. Please try again later.' });
        }
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                minerId: getPaymentMinerId(),
                offerId
            })
        });
        return buildClientPaymentOrder(payload?.order);
    }

    async function verifyBackendPayment(orderId, txid) {
        const query = new URLSearchParams({
            orderId: String(orderId || ''),
            txid: String(txid || '')
        });
        return requestPaymentApi(`/verify-payment?${query.toString()}`);
    }

    async function claimBackendPayment(orderId, txid) {
        return requestPaymentApi('/claim-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId, txid })
        });
    }

    function formatPaymentUsdt(value) {
        return `${Number(value || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS)} USDT`;
    }

    async function flushPendingPaymentClaims({ silent = true } = {}) {
        const pendingClaims = playerProfile.payment.pendingClaims || {};
        const pendingEntries = Object.entries(pendingClaims);

        if (!pendingEntries.length) {
            return 0;
        }

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
                    console.warn('Runner payment claim sync failed.', { orderId, error });
                }
            }
        }

        saveState();
        return syncedCount;
    }

    function isPaymentOrderExpired(order = currentPaymentOrder) {
        return !order || Number(order.expiresAt || 0) <= Date.now();
    }

    function getPaymentOrderCountdown(order = currentPaymentOrder) {
        if (!order) return '--:--';
        return formatCountdown(Math.max(0, Number(order.expiresAt || 0) - Date.now()));
    }

    async function copyTextToClipboard(value) {
        const text = String(value || '').trim();
        if (!text) return false;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (error) {
        }

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
        if (!dom.paymentOfferGrid) return;
        dom.paymentOfferGrid.innerHTML = RUNNER_PAYMENT_OFFERS.map((offer) => `
            <button
                class="runner-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}"
                type="button"
                data-select-payment-offer="${offer.id}"
                style="--offer-accent:${offer.accent};"
            >
                <span class="pill runner-payment-offer-badge" style="color:${offer.accent};border-color:${offer.accent}55;">${localize(offer.badge)}</span>
                <div class="runner-payment-offer-price">$${offer.price.toFixed(2)}</div>
                <h3>${localize(offer.name)}</h3>
                <p>${localize(offer.desc)}</p>
                <div class="reward-row">${renderRewardPills(offer.reward, 'shop-pill')}</div>
            </button>
        `).join('');
    }

    function renderPaymentOrderUI() {
        const offer = getSelectedPaymentOffer();
        const order = currentPaymentOrder && currentPaymentOrder.offerId === offer.id ? currentPaymentOrder : null;
        if (dom.paymentTitle) {
            dom.paymentTitle.textContent = playerProfile.lang === 'en' ? 'Runner Top-Up Center' : '璺戦叿鍏呭€间腑蹇?;
        }
        if (dom.paymentDesc) {
            dom.paymentDesc.textContent = playerProfile.lang === 'en'
                ? 'Create an on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant rewards.'
                : '鍏堝垱寤洪摼涓婅鍗曪紝鍐嶅幓 OKX Wallet 鏀粯绮剧‘閲戦锛屾渶鍚庣矘璐?txid 鏍￠獙骞跺彂鏀惧鍔便€?;
        }
        if (dom.paymentOrderLabel) dom.paymentOrderLabel.textContent = playerProfile.lang === 'en' ? 'Order ID' : '璁㈠崟鍙?;
        if (dom.paymentExactLabel) dom.paymentExactLabel.textContent = playerProfile.lang === 'en' ? 'Exact Amount' : '绮剧‘閲戦';
        if (dom.paymentExpiryLabel) dom.paymentExpiryLabel.textContent = playerProfile.lang === 'en' ? 'Expires In' : '鍓╀綑鏃堕棿';
        if (dom.paymentAddressLabel) dom.paymentAddressLabel.textContent = playerProfile.lang === 'en' ? 'Receiving Address' : '鏀舵鍦板潃';
        if (dom.paymentTxidLabel) dom.paymentTxidLabel.textContent = playerProfile.lang === 'en' ? 'Paste OKX Wallet txid' : '绮樿创 OKX Wallet 鐨?txid';
        if (dom.paymentTxidInput) {
            dom.paymentTxidInput.placeholder = playerProfile.lang === 'en'
                ? 'Paste the on-chain txid from OKX Wallet'
                : '璇疯緭鍏ユ垨绮樿创 OKX Wallet 鐨勯摼涓?txid';
        }
        if (dom.paymentTxidHint) {
            dom.paymentTxidHint.textContent = playerProfile.lang === 'en'
                ? 'Only payments that match the exact amount, recipient address, and valid time window can pass verification.'
                : '鍙湁閲戦銆佹敹娆惧湴鍧€鍜屾湁鏁堟椂闂寸獥鍙ｅ叏閮ㄥ尮閰嶇殑璁㈠崟锛屾墠鑳介€氳繃鏍￠獙銆?;
        }
        if (dom.paymentCopyAddressBtn) dom.paymentCopyAddressBtn.textContent = playerProfile.lang === 'en' ? 'Copy Address' : '澶嶅埗鍦板潃';
        if (dom.paymentCopyAmountBtn) dom.paymentCopyAmountBtn.textContent = playerProfile.lang === 'en' ? 'Copy Exact Amount' : '澶嶅埗绮剧‘閲戦';
        if (dom.paymentVerifyBtn) dom.paymentVerifyBtn.textContent = playerProfile.lang === 'en' ? 'Verify TXID' : '鏍￠獙 TXID';
        if (dom.paymentAmount) dom.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `$${offer.price.toFixed(2)} USDT`;
        if (dom.paymentMeta) {
            dom.paymentMeta.textContent = playerProfile.lang === 'en'
                ? `OKX Wallet 路 ${order?.network || 'TRON (TRC20)'} 路 ${localize(offer.name)}`
                : `OKX 閽卞寘 路 ${order?.network || 'TRON (TRC20)'} 路 ${localize(offer.name)}`;
        }
        if (dom.paymentOrderId) dom.paymentOrderId.textContent = order ? order.id : '--';
        if (dom.paymentExactAmount) dom.paymentExactAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : '--';
        if (dom.paymentExpiry) dom.paymentExpiry.textContent = order ? getPaymentOrderCountdown(order) : '--:--';
        if (dom.paymentWallet) dom.paymentWallet.textContent = order?.payAddress || 'TRiNCMEiH8ev31PbgN9ZCUkw48yFqF8boW';
    }

    function getNormalizedPaymentTxid() {
        return String(dom.paymentTxidInput?.value || '').trim();
    }

    function refreshPaymentVerificationState() {
        if (!dom.paymentStatus || !dom.paymentVerifyBtn || !dom.paymentCopyAddressBtn || !dom.paymentCopyAmountBtn) return;
        const txid = getNormalizedPaymentTxid();
        const txidValid = PAYMENT_TXID_REGEX.test(txid);
        const orderExpired = isPaymentOrderExpired(currentPaymentOrder);

        dom.paymentStatus.classList.remove('is-error', 'is-success');

        if (paymentVerificationState === 'creating') {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'Creating on-chain order鈥? : '姝ｅ湪鍒涘缓閾句笂璁㈠崟鈥?;
            dom.paymentVerifyBtn.disabled = true;
            dom.paymentCopyAddressBtn.disabled = true;
            dom.paymentCopyAmountBtn.disabled = true;
            return;
        }

        if (paymentVerificationState === 'verifying') {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'Verifying payment on-chain鈥? : '姝ｅ湪閾句笂鏍￠獙鏀粯鈥?;
            dom.paymentVerifyBtn.disabled = true;
            dom.paymentCopyAddressBtn.disabled = true;
            dom.paymentCopyAmountBtn.disabled = true;
            return;
        }

        dom.paymentCopyAddressBtn.disabled = false;
        dom.paymentCopyAmountBtn.disabled = false;

        if (paymentVerificationState === 'verified') {
            dom.paymentStatus.textContent = paymentVerificationNotice || (playerProfile.lang === 'en' ? 'Payment verified and reward granted.' : '鏀粯宸叉牎楠岄€氳繃锛屽鍔卞凡鍙戞斁銆?);
            dom.paymentStatus.classList.add('is-success');
            dom.paymentVerifyBtn.disabled = true;
            return;
        }

        if (orderExpired) {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'This order has expired. Select the pack again to create a fresh order.' : '褰撳墠璁㈠崟宸茶繃鏈燂紝璇烽噸鏂伴€夋嫨绀煎寘鍒涘缓鏂拌鍗曘€?;
            dom.paymentStatus.classList.add('is-error');
            dom.paymentVerifyBtn.disabled = true;
            return;
        }

        if (paymentVerificationError) {
            dom.paymentStatus.textContent = paymentVerificationError;
            dom.paymentStatus.classList.add('is-error');
            dom.paymentVerifyBtn.disabled = !txidValid || !currentPaymentOrder;
            return;
        }

        if (txid && !txidValid) {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'TXID format looks invalid. Please paste the 64-character on-chain txid.' : 'TXID 鏍煎紡涓嶆纭紝璇风矘璐?64 浣嶉摼涓?txid銆?;
            dom.paymentStatus.classList.add('is-error');
            dom.paymentVerifyBtn.disabled = true;
            return;
        }

        dom.paymentStatus.textContent = paymentVerificationNotice || (playerProfile.lang === 'en'
            ? 'Create an order, complete the payment in OKX Wallet, then paste the txid here.'
            : '鍏堝垱寤鸿鍗曪紝鍐嶅幓 OKX Wallet 瀹屾垚鏀粯锛屾渶鍚庢妸 txid 绮樿创鍒拌繖閲屾牎楠屻€?);
        dom.paymentVerifyBtn.disabled = !txidValid || !currentPaymentOrder;
    }

    function resetPaymentVerificationState(clearInput = false) {
        paymentVerificationState = 'idle';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        if (clearInput && dom.paymentTxidInput) {
            dom.paymentTxidInput.value = '';
        }
        refreshPaymentVerificationState();
    }

    function updatePaymentExpiryUI() {
        if (dom.paymentExpiry && currentPaymentOrder) {
            dom.paymentExpiry.textContent = getPaymentOrderCountdown(currentPaymentOrder);
        }
        if (dom.paymentModal && !dom.paymentModal.classList.contains('is-hidden')) {
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
        if (clearInput && dom.paymentTxidInput) {
            dom.paymentTxidInput.value = '';
        }
        renderPaymentOrderUI();
        refreshPaymentVerificationState();

        const requestPromise = createBackendPaymentOrder(offer.id)
            .then((order) => {
                if (requestId !== paymentOrderNonce) {
                    return currentPaymentOrder || order;
                }
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
                    paymentVerificationError = error?.message || localize({ zh: '璁㈠崟鍒涘缓澶辫触锛岃绋嶅悗閲嶈瘯銆?, en: 'Failed to create order. Please try again.' });
                    renderPaymentOrderUI();
                    refreshPaymentVerificationState();
                }
                throw error;
            })
            .finally(() => {
                if (paymentOrderRequestPromise === requestPromise) {
                    paymentOrderRequestPromise = null;
                }
            });

        paymentOrderRequestPromise = requestPromise;
        return requestPromise;
    }

    function selectPaymentOffer(offerId, { refreshOrder = true } = {}) {
        const offer = RUNNER_PAYMENT_OFFERS.find((item) => item.id === offerId);
        if (!offer) return;
        selectedPaymentOfferId = offer.id;
        renderPaymentOfferGrid();
        renderPaymentOrderUI();
        if (refreshOrder && dom.paymentModal && !dom.paymentModal.classList.contains('is-hidden')) {
            resetPaymentVerificationState(true);
            syncPaymentOrderForSelectedOffer(true, true).catch(() => {});
        }
    }

    async function openPaymentModal(offerId = null) {
        if (!dom.paymentModal) return;
        if (offerId) {
            selectedPaymentOfferId = offerId;
        }
        flushPendingPaymentClaims().catch(() => {});
        renderPaymentOfferGrid();
        resetPaymentVerificationState(true);
        renderPaymentOrderUI();
        dom.paymentModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
        try {
            await syncPaymentOrderForSelectedOffer(
                !currentPaymentOrder
                || currentPaymentOrder.offerId !== selectedPaymentOfferId
                || isPaymentOrderExpired(currentPaymentOrder),
                true
            );
        } catch (error) {
        }
        refreshPaymentVerificationState();
    }

    function closePaymentModal() {
        if (!dom.paymentModal) return;
        dom.paymentModal.classList.add('is-hidden');
        if (!activeInfoModal) {
            document.body.classList.remove('modal-open');
        }
    }

    async function copyPaymentAddress() {
        const wallet = String(dom.paymentWallet?.textContent || '').trim();
        const copied = await copyTextToClipboard(wallet);
        paymentVerificationError = '';
        paymentVerificationNotice = copied
            ? localize({ zh: '鏀舵鍦板潃宸插鍒躲€?, en: 'Receiving address copied.' })
            : localize({ zh: '鑷姩澶嶅埗涓嶅彲鐢紝璇锋墜鍔ㄥ鍒跺湴鍧€銆?, en: 'Automatic copy is unavailable. Please copy the address manually.' });
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
            ? localize({ zh: '绮剧‘閲戦宸插鍒躲€?, en: 'Exact amount copied.' })
            : localize({ zh: '鑷姩澶嶅埗涓嶅彲鐢紝璇锋墜鍔ㄥ鍒剁簿纭噾棰濄€?, en: 'Automatic copy is unavailable. Please copy the exact amount manually.' });
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    function grantPaymentRewards({ orderId, txid, offerId }) {
        const offer = RUNNER_PAYMENT_OFFERS.find((item) => item.id === offerId) || getSelectedPaymentOffer();
        if (!offer) {
            return false;
        }
        if (playerProfile.payment.claimedOrders[orderId]) {
            return false;
        }

        applyRewardBundle(offer.reward);
        playerProfile.payment.purchaseCount += 1;
        playerProfile.payment.totalSpent = Math.round((Number(playerProfile.payment.totalSpent || 0) + Number(offer.price || 0)) * 100) / 100;
        playerProfile.payment.passUnlocked = true;
        playerProfile.payment.claimedOrders[orderId] = true;
        playerProfile.payment.pendingClaims[orderId] = txid;
        playerProfile.payment.verifiedTxids = [txid, ...(playerProfile.payment.verifiedTxids || []).filter((item) => item !== txid)].slice(0, 100);
        saveState();
        playSfx('promote');
        showToast(localize({
            zh: `鍏呭€兼垚鍔燂細${localize(offer.name)} 濂栧姳宸插埌璐,
            en: `Top-up complete: ${localize(offer.name)} rewards granted`
        }));
        renderAll();
        return true;
    }

    async function handlePaymentConfirm() {
        if (paymentVerificationState === 'creating' || paymentVerificationState === 'verifying') {
            return;
        }

        const txid = getNormalizedPaymentTxid();
        if (!PAYMENT_TXID_REGEX.test(txid)) {
            paymentVerificationError = localize({ zh: 'TXID 鏍煎紡涓嶆纭紝璇锋鏌ュ悗閲嶆柊杈撳叆銆?, en: 'Invalid TXID format. Please check and try again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if ((playerProfile.payment.verifiedTxids || []).includes(txid)) {
            paymentVerificationError = localize({ zh: '璇?txid 宸茬粡浣跨敤杩囷紝涓嶈兘閲嶅鍙戝銆?, en: 'This TXID has already been used and cannot grant rewards again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (!currentPaymentOrder || isPaymentOrderExpired(currentPaymentOrder)) {
            paymentVerificationError = localize({ zh: '褰撳墠璁㈠崟宸茶繃鏈燂紝璇烽噸鏂板垱寤鸿鍗曘€?, en: 'The current order has expired. Please create a new one.' });
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

            if (orderPayload?.rewardGranted || playerProfile.payment.claimedOrders[orderId]) {
                if (orderPayload?.rewardGranted && playerProfile.payment.pendingClaims[orderId]) {
                    delete playerProfile.payment.pendingClaims[orderId];
                }
                paymentVerificationState = 'verified';
                paymentVerificationNotice = localize({ zh: '璇ヨ鍗曞鍔卞凡鍙戞斁锛屾棤闇€閲嶅棰嗗彇銆?, en: 'Rewards for this order have already been granted.' });
                refreshPaymentVerificationState();
                saveState();
                return;
            }

            grantPaymentRewards({
                orderId,
                txid,
                offerId: resolvedOfferId
            });

            paymentVerificationState = 'verified';
            try {
                await claimBackendPayment(orderId, txid);
                delete playerProfile.payment.pendingClaims[orderId];
                paymentVerificationNotice = localize({ zh: '閾句笂鏍￠獙鎴愬姛锛屽鍔卞凡鍙戞斁銆?, en: 'On-chain verification succeeded and rewards were granted.' });
                saveState();
            } catch (claimError) {
                paymentVerificationNotice = localize({
                    zh: '閾句笂鏍￠獙鎴愬姛锛屽鍔卞凡鍒拌处锛涘悗鍙板彂濂栬褰曞皢鍦ㄧ◢鍚庤嚜鍔ㄥ悓姝ャ€?,
                    en: 'On-chain verification succeeded and rewards were granted. Backend sync will retry automatically.'
                });
                console.warn('Runner payment claim sync queued.', { orderId, claimError });
            }
            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || localize({ zh: '鏀粯鏍￠獙澶辫触锛岃绋嶅悗閲嶈瘯銆?, en: 'Payment verification failed. Please try again.' });
            refreshPaymentVerificationState();
        }
    }

    function getRunnerRankScore() {
        return Math.floor(
            playerProfile.bestDistance * 0.7
            + playerProfile.stats.longestCombo * 40
            + playerProfile.stats.perfectRuns * 120
        );
    }

    function getDivisionTiers() {
        return [
            {
                id: 'bronze',
                min: 0,
                color: '#8fe6ff',
                title: { zh: '闇撹櫣闈掗摐', en: 'Neon Bronze' },
                short: { zh: '闈掗摐', en: 'Bronze' },
                desc: { zh: '鍒氬畬鎴愪笂鎵嬮樁娈碉紝閲嶇偣鏄妸鍒囬亾鍜岃繛鍑昏妭濂忕ǔ瀹氫笅鏉ャ€?, en: 'Past the onboarding phase. Focus on stable lane reads and clean combo timing.' },
                settlement: { gold: 1800, core: 10 }
            },
            {
                id: 'silver',
                min: 520,
                color: '#d9f6ff',
                title: { zh: '鐤惧奖鐧介摱', en: 'Velocity Silver' },
                short: { zh: '鐧介摱', en: 'Silver' },
                desc: { zh: '寮€濮嬪叿澶囪繛缁啿鍒鸿兘鍔涳紝鑺傚鍜岃祫婧愬惊鐜繘鍏ユ鍙嶉銆?, en: 'The run loop starts compounding and resource flow becomes smoother.' },
                settlement: { gold: 3200, core: 16 }
            },
            {
                id: 'gold',
                min: 1180,
                color: '#ffd66b',
                title: { zh: '鑴夊啿榛勯噾', en: 'Pulse Gold' },
                short: { zh: '榛勯噾', en: 'Gold' },
                desc: { zh: '宸茬粡鏄彲闈犵殑鍐叉灞傦紝杩炲嚮鍜屾棤浼よ〃鐜颁細鏄庢樉鏀惧ぇ浠峰€笺€?, en: 'A reliable ladder tier where combo and clean routing amplify sharply.' },
                settlement: { gold: 5200, core: 28 }
            },
            {
                id: 'platinum',
                min: 2050,
                color: '#88ffe9',
                title: { zh: '寮у厜閾傞噾', en: 'Arc Platinum' },
                short: { zh: '閾傞噾', en: 'Platinum' },
                desc: { zh: '杩涘叆楂樺帇娈典綅锛屽紑濮嬫嫾绋冲畾楂樺垎涓庢洿灏戝け璇€?, en: 'High-pressure tier where consistency and cleaner execution matter more.' },
                settlement: { gold: 8200, core: 42 }
            },
            {
                id: 'diamond',
                min: 3300,
                color: '#b89cff',
                title: { zh: '瑁傞殭閽荤煶', en: 'Rift Diamond' },
                short: { zh: '閽荤煶', en: 'Diamond' },
                desc: { zh: '鍏峰鏄庢樉鑽ｈ獕鎰熺殑楂樻浣嶏紝閫傚悎璧涘灏惧０鍙戝姏鍐插埡銆?, en: 'A prestige tier with visible status and stronger late-season push value.' },
                settlement: { gold: 12800, core: 62 }
            },
            {
                id: 'apex',
                min: 5100,
                color: '#ff8dc7',
                title: { zh: '鍒涗笘宸呭嘲', en: 'Genesis Apex' },
                short: { zh: '宸呭嘲', en: 'Apex' },
                desc: { zh: '褰撳墠璧涘椤舵锛岄噸蹇冧粠鏅嬪崌杞负瀹堟涓庡埛鏇撮珮鑽ｈ獕銆?, en: 'Current seasonal cap. The goal shifts from promotion to defending status.' },
                settlement: { gold: 18600, core: 90 }
            }
        ];
    }

    function getDivisionInfo(score = getRunnerRankScore()) {
        const tiers = getDivisionTiers();
        let tier = tiers[0];
        let tierIndex = 0;
        tiers.forEach((candidate, index) => {
            if (score >= candidate.min) {
                tier = candidate;
                tierIndex = index;
            }
        });
        const nextTier = tiers[tierIndex + 1] || null;
        const tierSpan = nextTier ? Math.max(1, nextTier.min - tier.min) : 1;
        const progressPct = nextTier
            ? Math.max(8, Math.min(100, ((score - tier.min) / tierSpan) * 100))
            : 100;
        const pointsToNext = nextTier ? Math.max(0, nextTier.min - score) : 0;
        return {
            score,
            tier,
            tierIndex,
            nextTier,
            progressPct,
            pointsToNext
        };
    }

    function getSeasonSettlementPreview(divisionInfo = getDivisionInfo(), seasonLevel = calcSeasonLevel(playerProfile.seasonXp)) {
        const levelBonusGold = seasonLevel * 180;
        const levelBonusCore = seasonLevel * 2;
        const baseGold = divisionInfo.tier.settlement.gold;
        const baseCore = divisionInfo.tier.settlement.core;
        return {
            baseGold,
            baseCore,
            levelBonusGold,
            levelBonusCore,
            totalGold: baseGold + levelBonusGold,
            totalCore: baseCore + levelBonusCore
        };
    }

    function renderSeasonRulesModal() {
        const divisionInfo = getDivisionInfo();
        const seasonLevel = calcSeasonLevel(playerProfile.seasonXp);
        const settlementPreview = getSeasonSettlementPreview(divisionInfo, seasonLevel);
        const divisionRows = getDivisionTiers().map((tier) => `
            <div class="modal-rule-row ${tier.id === divisionInfo.tier.id ? 'is-current' : ''}" style="--tier-color:${tier.color};">
                <div class="modal-rule-tier">
                    <strong>${localize(tier.title)}</strong>
                    <span>${playerProfile.lang === 'en' ? `${formatNumber(tier.min)}+ rating` : `${formatNumber(tier.min)}+ 娈典綅鍒哷}</span>
                </div>
                <div class="modal-rule-values">
                    <span>${t('goldLabel')} +${formatNumber(tier.settlement.gold)}</span>
                    <span>${t('coreLabel')} +${formatNumber(tier.settlement.core)}</span>
                </div>
            </div>
        `).join('');

        return {
            kicker: playerProfile.lang === 'en' ? 'SEASON MANUAL' : '璧涘璇存槑',
            title: playerProfile.lang === 'en' ? 'How division, settlement and activity fit together' : '娈典綅銆佺粨绠椾笌娲昏穬濡備綍鑱斿姩',
            desc: playerProfile.lang === 'en'
                ? 'A clear explanation of what to chase this season and why it matters.'
                : '鎶婃湰璧涘瑕佽拷浠€涔堛€佷负浠€涔堣杩姐€佺粨绠楁€庝箞绠楋紝涓€娆¤娓呮銆?,
            body: `
                <div class="modal-info-grid">
                    <article class="modal-info-card featured">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CURRENT ESTIMATE' : '褰撳墠棰勪及'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                        <strong>${formatNumber(settlementPreview.totalGold)} ${t('goldLabel')} / ${formatNumber(settlementPreview.totalCore)} ${t('coreLabel')}</strong>
                        <p>${playerProfile.lang === 'en'
                            ? 'Current estimate = highest division reward reached this season + steady season level bonus.'
                            : '褰撳墠棰勪及 = 鏈禌瀛ｈ揪鍒扮殑鏈€楂樻浣嶅鍔?+ 璧涘绛夌骇鎻愪緵鐨勭ǔ瀹氭椿璺冨姞鎴愩€?}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'SETTLEMENT RULE' : '缁撶畻瑙勫垯'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Highest division wins' : '鎸夋湰璧涘鏈€楂樻浣嶇粨绠?}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Once a higher division is reached, the seasonal settlement estimate upgrades accordingly.'
                            : '鍙浣犲湪鏈禌瀛ｅ啿鍒版洿楂樻浣嶏紝璧涘缁撶畻棰勪及灏变細鍚屾鍗囩骇锛屼笉闇€瑕佷竴鐩村仠鐣欏湪璇ユ浣嶃€?}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'ACTIVITY BONUS' : '娲昏穬鍔犳垚'}</div>
                        <h3>${playerProfile.lang === 'en' ? `Season Lv.${seasonLevel}` : `璧涘 Lv.${seasonLevel}`}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `Current activity bonus contributes ${formatNumber(settlementPreview.levelBonusGold)} gold and ${formatNumber(settlementPreview.levelBonusCore)} cores.`
                            : `褰撳墠娲昏穬鍔犳垚棰濆鎻愪緵 ${formatNumber(settlementPreview.levelBonusGold)} 閲戝竵涓?${formatNumber(settlementPreview.levelBonusCore)} 鑳芥牳銆俙}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CLIMB TIP' : '鍐插垎寤鸿'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Distance is not enough by itself' : '鍙爢璺濈杩樹笉澶?}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Combo length and clean runs weigh heavily in rating. Stable routing beats random risks.'
                            : '娈典綅鍒嗕笉鍙湅璺濈锛岃繛鍑诲拰鏃犱激琛ㄧ幇鏉冮噸涔熷緢楂樸€傜ǔ瀹氳窇娉曟瘮涔辫祵鏇村鏄撳啿娈点€?}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'LADDER BOUNTY' : '鍐叉璧忛噾'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Rating breakpoints also pay immediate rewards' : '鍏抽敭璇勫垎妗ｈ繕浼氶澶栧彂鍗虫椂濂栧姳'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Besides season level rewards, rating milestones now grant gold, cores, and stored boosts that can be claimed immediately.'
                            : '闄や簡璧涘绛夌骇濂栧姳澶栵紝璺戦叿璇勫垎杈惧埌鍏抽敭妗ｄ綅鍚庯紝涔熶細绔嬪嵆寮€鏀鹃噾甯併€佽兘鏍稿拰澧炵泭鍌ㄥ濂栧姳銆?}</p>
                    </article>
                </div>
                <div class="modal-rule-list">
                    <div class="modal-rule-head">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION PAYOUT TABLE' : '娈典綅缁撶畻琛?}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Every tier has a visible reward jump' : '姣忔。娈典綅閮藉搴旀竻鏅扮殑缁撶畻鎻愬崌'}</h3>
                        </div>
                    </div>
                    <div class="modal-rule-grid">${divisionRows}</div>
                </div>
            `
        };
    }

    function renderMissionRulesModal() {
        const chapter = getMissionChapter();
        const dayKey = playerProfile.dailyStats.key || getLocalDayKey();
        const pulseMission = getMissionPulseVariant(dayKey, chapter);
        const pulseState = getMissionState(pulseMission);
        const chapterContracts = buildMissionBoard(chapter, dayKey).filter((mission) => mission.section !== 'pulse');
        const chapterClaimed = chapterContracts.filter((mission) => playerProfile.missionsClaimed[mission.id]).length;
        const pulseScale = Math.max(0, Math.floor((chapter - 1) / 2));

        return {
            kicker: playerProfile.lang === 'en' ? 'MISSION MANUAL' : '浠诲姟鎵嬪唽',
            title: playerProfile.lang === 'en' ? 'Layered mission board rules' : '鍒嗗眰浠诲姟鏉胯鍒?,
            desc: playerProfile.lang === 'en'
                ? 'Explains how chapter contracts, daily pulse missions, and elite objectives work together.'
                : '鎶婄珷鑺備换鍔°€佹瘡鏃ヨ剦鍐插拰绮捐嫳鍚堢害鐨勬帹杩涘叧绯讳竴娆¤娓呮銆?,
            body: `
                <div class="modal-info-grid">
                    <article class="modal-info-card featured">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CURRENT BOARD' : '褰撳墠浠诲姟鏉?}</div>
                        <h3>${playerProfile.lang === 'en' ? `Chapter ${chapter}` : `绗?${chapter} 绔燻}</h3>
                        <strong>${playerProfile.lang === 'en' ? `${chapterClaimed}/${chapterContracts.length} chapter contracts claimed` : `宸查鍙?${chapterClaimed} / ${chapterContracts.length} 涓珷鑺傚悎绾}</strong>
                        <p>${playerProfile.lang === 'en'
                            ? 'Claim every core and elite contract on the current board to unlock the next chapter immediately.'
                            : '褰撳墠绔犺妭鐨勪富绾夸换鍔′笌绮捐嫳鍚堢害鍏ㄩ儴棰嗗彇鍚庯紝浼氱珛鍗宠В閿佷笅涓€绔犮€?}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DAILY PULSE' : '姣忔棩鑴夊啿'}</div>
                        <h3>${localize(pulseMission.title)}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `One rotating daily objective refreshes every local midnight. Current progress: ${formatNumber(pulseState.current)} / ${formatNumber(pulseMission.target)}.`
                            : `姣忓ぉ鏈湴闆剁偣鍒锋柊 1 涓剦鍐蹭换鍔°€傚綋鍓嶈繘搴︼細${formatNumber(pulseState.current)} / ${formatNumber(pulseMission.target)}銆俙}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE CONTRACTS' : '绮捐嫳鍚堢害'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Unlock from Chapter 2 onward' : '浠庣 2 绔犲紑濮嬪紑鏀?}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Elite objectives focus on total distance, clean routing, and later even ladder rating to keep late-game pressure meaningful.'
                            : '绮捐嫳鍚堢害浼氭妸鎬婚噷绋嬨€佹棤浼よ〃鐜帮紝浠ュ強鍚庣画鐨勫啿姒滆瘎鍒嗛兘鎷夎繘浠诲姟浣撶郴锛屼繚璇佸悗鏈熶粛鏈夎拷閫愬帇鍔涖€?}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'SCALING' : '闅惧害鎴愰暱'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Targets rise with your chapter' : '鐩爣浼氶殢绔犺妭鎶崌'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `Daily targets scale every 2 chapters. Current pulse intensity tier: +${pulseScale}.`
                            : `姣忔棩浠诲姟姣?2 绔犳彁鍗囦竴妗ｅ己搴︺€傚綋鍓嶈剦鍐插己搴︽。浣嶏細+${pulseScale}銆俙}</p>
                    </article>
                </div>
                <div class="modal-rule-list">
                    <div class="modal-rule-head">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'BOARD FLOW' : '浠诲姟鏉挎祦绋?}</div>
                            <h3>${playerProfile.lang === 'en' ? 'The board is split into three layers' : '浠诲姟鏉垮垎涓轰笁灞傛帹杩?}</h3>
                        </div>
                    </div>
                    <div class="modal-rule-grid">
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'CORE' : '涓荤嚎'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Distance 路 Runs 路 Combo 路 Score' : '璺濈 路 灞€鏁?路 杩炲嚮 路 鍒嗘暟'}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'These are the backbone contracts of every chapter and are always required for advancement.'
                                : '杩欐槸姣忎竴绔犻兘浼氬嚭鐜扮殑鏍稿績鍚堢害锛屼篃鏄帹杩涚珷鑺傜殑鍒氭€ф潯浠躲€?}</p>
                        </article>
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE' : '绮捐嫳'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Total distance 路 Clean run 路 Ladder score' : '鎬婚噷绋?路 鏃犱激 路 鍐叉璇勫垎'}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'Elite objectives inject stronger mid and late-game pressure and reward better resources.'
                                : '绮捐嫳鍚堢害涓撻棬璐熻矗涓悗鏈熷帇鍔涗笌鏇村帤鐨勮祫婧愬洖鎶ャ€?}</p>
                        </article>
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'PULSE' : '鑴夊啿'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'One daily rotating objective' : '姣忓ぉ 1 涓疆鎹㈢洰鏍?}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'Pulse missions are optional for chapter progression, but they accelerate gold, cores, and season XP noticeably.'
                                : '鑴夊啿浠诲姟涓嶅己鍒舵帹杩涚珷鑺傦紝浣嗚兘鏄捐憲琛ュ厖閲戝竵銆佽兘鏍镐笌璧涘缁忛獙銆?}</p>
                        </article>
                    </div>
                </div>
            `
        };
    }

    function renderRunBriefModal() {
        return {
            kicker: playerProfile.lang === 'en' ? 'RUN BRIEF' : '璧涢亾绠€鎶?,
            title: playerProfile.lang === 'en' ? 'Track, boosts, and ladder overview' : '璧涢亾銆佸鐩婁笌姒滃崟鎬昏',
            desc: playerProfile.lang === 'en'
                ? 'Keep the main run screen clean, and open this panel whenever you want the full track briefing.'
                : '鎶婅窇閰蜂富鐣岄潰鐣欑粰鎿嶄綔锛屾妸浠婃棩璧涢亾銆佸鐩娿€佹浣嶄笌姒滃崟鎯呮姤闆嗕腑鍒拌繖閲屾煡鐪嬨€?,
            body: `<div class="run-brief-modal-body">${renderRunTab()}</div>`
        };
    }

    function getRunnerLeaderboard(rankScore = getRunnerRankScore()) {
        const rivalNames = ['Nova-17', 'PulseX', 'ArcMira', 'VoltKid', 'ZeroKai', 'Rune-8', 'Astra-V', 'Helix', 'IonFox', 'Blink-3', 'StormQ', 'Nexa'];
        const playerRank = Math.max(1, 48 - Math.floor(rankScore / 180));
        const startRank = Math.max(1, playerRank - 2);
        const size = 6;
        const baseGap = Math.max(30, 150 - Math.min(92, Math.floor(rankScore / 24)));
        const entries = [];

        for (let offset = 0; offset < size; offset += 1) {
            const rank = startRank + offset;
            const isPlayer = rank === playerRank;
            let score = rankScore;

            if (rank < playerRank) {
                const gap = ((playerRank - rank) * baseGap) + (rank * 13);
                score = rankScore + gap;
            } else if (rank > playerRank) {
                const gap = ((rank - playerRank) * Math.max(24, Math.floor(baseGap * 0.8))) + (rank * 9);
                score = Math.max(60, rankScore - gap);
            }

            entries.push({
                rank,
                name: isPlayer ? localize({ zh: '浣?, en: 'YOU' }) : rivalNames[(rank * 3 + playerRank) % rivalNames.length],
                note: isPlayer
                    ? localize({ zh: '褰撳墠涓汉娈典綅浼扮畻', en: 'Estimated current ladder slot' })
                    : rank < playerRank
                        ? localize({ zh: '鍓嶆柟绔炰簤鑰?, en: 'Target ahead' })
                        : localize({ zh: '鍚庢柟杩借刀鑰?, en: 'Pressure behind' }),
                score,
                isPlayer
            });
        }

        const nextGap = playerRank <= 1
            ? 0
            : Math.max(0, ((entries.find((entry) => entry.rank === playerRank - 1) || {}).score || (rankScore + baseGap)) - rankScore);

        return { playerRank, nextGap, entries };
    }

    function renderDivisionCard(divisionInfo = getDivisionInfo()) {
        const settlement = getSeasonSettlementPreview(divisionInfo);
        const progressText = divisionInfo.nextTier
            ? localize({
                zh: `璺?${localize(divisionInfo.nextTier.title)} 杩樺樊 ${formatNumber(divisionInfo.pointsToNext)} 鍒哷,
                en: `${formatNumber(divisionInfo.pointsToNext)} rating to ${localize(divisionInfo.nextTier.title)}`
            })
            : localize({
                zh: '宸插埌杈炬湰璧涘褰撳墠鏈€楂樻浣嶏紝閲嶇偣杞负瀹堟涓庡埛鏇撮珮璇勫垎銆?,
                en: 'You are at the seasonal cap. The next goal is defending it with higher-rated runs.'
            });

        return `
            <article class="event-card division-card" style="--tier-color:${divisionInfo.tier.color};">
                <div class="card-title-row">
                    <div>
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION STATUS' : '娈典綅鐘舵€?}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                    </div>
                    <span class="pill hot">${formatNumber(divisionInfo.score)}</span>
                </div>
                <div class="division-hero">
                    <div class="division-mark">${localize(divisionInfo.tier.short)}</div>
                    <div>
                        <strong>${progressText}</strong>
                        <p>${localize(divisionInfo.tier.desc)}</p>
                    </div>
                </div>
                <div class="progress-track division-track"><i style="width:${divisionInfo.progressPct}%"></i></div>
                <div class="reward-row">
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Expected settle' : '棰勮缁撶畻'} ${formatNumber(settlement.totalGold)} ${t('goldLabel')}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle cores' : '缁撶畻鑳芥牳'} ${formatNumber(settlement.totalCore)}</span>
                    <span class="reward-pill">${divisionInfo.nextTier ? localize(divisionInfo.nextTier.title) : localize({ zh: '璧涘椤舵', en: 'Season Cap' })}</span>
                </div>
            </article>
        `;
    }

    function renderRewardPills(reward, className = 'reward-pill') {
        const labels = [];
        if (reward.gold) {
            labels.push(localize({ zh: `閲戝竵 +${formatNumber(reward.gold)}`, en: `Gold +${formatNumber(reward.gold)}` }));
        }
        if (reward.core) {
            labels.push(localize({ zh: `鑳芥牳 +${formatNumber(reward.core)}`, en: `Cores +${formatNumber(reward.core)}` }));
        }
        if (reward.xp) {
            labels.push(localize({ zh: `璧涘缁忛獙 +${formatNumber(reward.xp)}`, en: `Season XP +${formatNumber(reward.xp)}` }));
        }
        if (reward.starterOverclockRuns) {
            labels.push(formatBoostRewardText('starterOverclockRuns', reward.starterOverclockRuns));
        }
        if (reward.settlementBoostRuns) {
            labels.push(formatBoostRewardText('settlementBoostRuns', reward.settlementBoostRuns));
        }
        if (reward.freeRevives) {
            labels.push(formatBoostRewardText('freeRevives', reward.freeRevives));
        }
        if (reward.label) {
            labels.push(localize(reward.label));
        }
        return labels.map((text) => `<span class="${className}">${text}</span>`).join('');
    }

    function showRewardToast(title, reward = {}, note = '') {
        if (!dom.toast) return;
        const rewardsHtml = renderRewardPills(reward).trim();
        dom.toast.classList.add('is-visible', 'is-reward');
        dom.toast.innerHTML = `
            <div class="toast-title">${title}</div>
            ${note ? `<div class="toast-note">${note}</div>` : ''}
            ${rewardsHtml ? `<div class="toast-rewards">${rewardsHtml}</div>` : ''}
        `;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            dom.toast.classList.remove('is-visible', 'is-reward');
            dom.toast.textContent = '';
        }, 2200);
    }

    function renderResultOverlayCard() {
        if (!lastResult || !dom.resultRankPanel) return;
        const { divisionInfo, promoted, promotionText, settlementPreview } = lastResult;
        const detailText = promoted
            ? promotionText
            : divisionInfo.nextTier
                ? localize({
                    zh: `璺?${localize(divisionInfo.nextTier.title)} 杩樺樊 ${formatNumber(divisionInfo.pointsToNext)} 娈典綅鍒哷,
                    en: `${formatNumber(divisionInfo.pointsToNext)} rating to ${localize(divisionInfo.nextTier.title)}`
                })
                : localize({
                    zh: '宸蹭繚鎸佹湰璧涘褰撳墠椤舵锛屾帴涓嬫潵灏辨槸缁х画鎷夐珮鑽ｈ獕鍒嗐€?,
                    en: 'You are already sitting at the current seasonal cap.'
                });

        dom.resultRankPanel.innerHTML = `
            <div class="result-rank-card ${promoted ? 'is-promoted' : ''}" style="--tier-color:${divisionInfo.tier.color};">
                ${promoted ? `
                    <div class="promotion-banner">
                        <div class="overlay-kicker">${playerProfile.lang === 'en' ? 'DIVISION PROMOTION' : '娈典綅鏅嬪崌'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                        <p>${promotionText}</p>
                    </div>
                ` : ''}
                <div class="result-rank-head">
                    <div>
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION RESULT' : '娈典綅鍙嶉'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                    </div>
                    <span class="pill ${promoted ? 'hot' : 'good'}">${promoted
                        ? localize({ zh: '鏅嬪崌鎴愬姛', en: 'Promoted' })
                        : localize(divisionInfo.tier.short)}</span>
                </div>
                <div class="result-rank-desc">
                    <strong>${detailText}</strong>
                    <p>${localize(divisionInfo.tier.desc)}</p>
                </div>
                <div class="progress-track division-track"><i style="width:${divisionInfo.progressPct}%"></i></div>
                <div class="reward-row">
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Rating' : '娈典綅鍒?} ${formatNumber(divisionInfo.score)}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle Gold' : '缁撶畻閲戝竵'} ${formatNumber(settlementPreview.totalGold)}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle Cores' : '缁撶畻鑳芥牳'} ${formatNumber(settlementPreview.totalCore)}</span>
                </div>
                <div class="promotion-actions">
                    <button class="ghost-btn wide-btn" type="button" data-open-modal="season-rules">${playerProfile.lang === 'en' ? 'View Season Rules' : '鏌ョ湅璧涘瑙勫垯'}</button>
                    ${promoted
                        ? `<button class="primary-btn wide-btn" type="button" data-open-tab="season">${playerProfile.lang === 'en' ? 'Open Season Panel' : '鎵撳紑璧涘闈㈡澘'}</button>`
                        : ''}
                </div>
            </div>
        `;
    }

    function openInfoModal(kind) {
        if (!dom.infoModal) return;
        let content = null;
        if (kind === 'season-rules') {
            content = renderSeasonRulesModal();
        } else if (kind === 'mission-rules') {
            content = renderMissionRulesModal();
        } else if (kind === 'run-brief') {
            content = renderRunBriefModal();
        }
        if (!content) return;
        activeInfoModal = kind;
        dom.infoModalKicker.textContent = content.kicker;
        dom.infoModalTitle.textContent = content.title;
        dom.infoModalDesc.textContent = content.desc;
        dom.infoModalBody.innerHTML = content.body;
        dom.infoModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
    }

    function closeInfoModal() {
        activeInfoModal = '';
        if (!dom.infoModal) return;
        dom.infoModal.classList.add('is-hidden');
        if (!dom.paymentModal || dom.paymentModal.classList.contains('is-hidden')) {
            document.body.classList.remove('modal-open');
        }
    }

    function switchTab(tab, syncHash = true) {
        if (!['run', 'loadout', 'missions', 'season', 'shop'].includes(tab)) return;
        if (dom.panelContent) {
            panelScrollState[activeTab] = dom.panelContent.scrollTop || 0;
        }
        if (tab !== 'run' && game.running && !game.paused && !game.awaitingRevive) {
            pauseRun();
        }
        activeTab = tab;
        if (syncHash) {
            window.location.hash = activeTab;
        }
        renderPanel({ preserveScroll: true });
        renderTabLayout({ preserveScroll: true });
    }

    function renderTabLayout({ preserveScroll = true } = {}) {
        document.body.dataset.runnerTab = activeTab;
        dom.runnerMain?.classList.toggle('is-run-tab', activeTab === 'run');
        dom.runnerMain?.classList.toggle('is-content-tab', activeTab !== 'run');
        dom.stageCard?.classList.toggle('is-tab-hidden', activeTab !== 'run');
        updateRuntimeBodyState();
        if (dom.panelContent) {
            const nextScroll = preserveScroll ? (panelScrollState[activeTab] || 0) : 0;
            requestAnimationFrame(() => {
                if (dom.panelContent) {
                    dom.panelContent.scrollTop = nextScroll;
                }
            });
        }
        requestAnimationFrame(resizeCanvas);
    }

    function getLoadoutAlertCount() {
        return 0;
    }

    function updateTabBadges() {
        const missionCount = getClaimableMissionCount();
        const loadoutCount = getLoadoutAlertCount();
        const seasonCount = getClaimableSeasonRewardCount() + getClaimableSeasonSponsorRewardCount() + getClaimableRankRewardCount();
        const shopCount = getTrueShopClaimCount();
        Array.from(dom.tabBar.querySelectorAll('.tab-btn')).forEach((button) => {
            const tab = button.dataset.tab;
            const count = tab === 'missions'
                ? missionCount
                : tab === 'loadout'
                    ? loadoutCount
                    : tab === 'season'
                        ? seasonCount
                        : tab === 'shop'
                            ? shopCount
                        : 0;
            if (count > 0) {
                button.dataset.count = String(Math.min(99, count));
                button.dataset.dot = 'true';
            } else {
                button.removeAttribute('data-count');
                button.removeAttribute('data-dot');
            }
            button.classList.toggle('is-active', tab === activeTab);
        });
    }

    function formatTimeMs(ms) {
        if (!ms) return playerProfile.lang === 'en' ? 'N/A' : '鏈揪鎴?;
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milli = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milli).padStart(2, '0')}`;
    }

    function getRunGrade(distance, combo, hitless) {
        const value = distance + (combo * 34) + (hitless ? 280 : 0);
        if (value >= 2200) return { grade: 'S', color: '#ffd66b', text: playerProfile.lang === 'en' ? 'Perfect arc pressure. This run can contest the ladder.' : '鏋侀檺鍘嬫琛ㄧ幇锛岃繖涓€灞€宸茬粡鍏峰鍐叉鍚噾閲忋€? };
        if (value >= 1500) return { grade: 'A', color: '#57e5ff', text: playerProfile.lang === 'en' ? 'Strong rhythm and clean routing. Very stable for repeat runs.' : '鑺傚绋冲畾銆佽矾绾垮共鍑€锛屾槸寰堟垚鐔熺殑涓€娆″啿鍒恒€? };
        if (value >= 900) return { grade: 'B', color: '#9fe9ff', text: playerProfile.lang === 'en' ? 'Solid growth run with room to push combo harder.' : '鏄竴灞€涓嶉敊鐨勬垚闀胯窇锛屼絾杩炲嚮鍜岃翰閬胯繕鑳界户缁帇姒ㄣ€? };
        if (value >= 450) return { grade: 'C', color: '#ffb56b', text: playerProfile.lang === 'en' ? 'Warm-up level. Focus on lane reads and better timing.' : '鐑韩灞€姘村钩锛屽厛鎶婅璺拰璺虫粦鑺傚鍐嶇ǔ涓€鐐广€? };
        return { grade: 'D', color: '#ff7d9b', text: playerProfile.lang === 'en' ? 'Early break. Try safer lane changes and save revive value.' : '寮€灞€鏂。杈冩棭锛屽缓璁厛绋冲垏閬撳苟淇濈暀澶嶆椿瀹归敊銆? };
    }

    function renderStatBars(runner) {
        const rows = [
            { label: playerProfile.lang === 'en' ? 'Speed' : '閫熷害', value: runner.stats.speed, max: 1.2 },
            { label: playerProfile.lang === 'en' ? 'Combo' : '杩炲嚮', value: runner.stats.combo, max: 1.2 },
            { label: playerProfile.lang === 'en' ? 'Control' : '鎿嶆帶', value: runner.stats.control, max: 1.2 }
        ];
        return `
            <div class="stat-bars">
                ${rows.map((row) => `
                    <div class="stat-bar">
                        <span class="mini-label">${row.label}</span>
                        <div class="stat-bar-track"><i style="width:${Math.max(14, Math.min(100, (row.value / row.max) * 100))}%"></i></div>
                        <strong class="mono">${row.value.toFixed(2)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function claimMission(id) {
        const mission = missionDefinitions().find((item) => item.id === id);
        if (!mission) return;
        const complete = mission.current() >= mission.target;
        if (!complete || playerProfile.missionsClaimed[id]) return;
        playerProfile.missionsClaimed[id] = true;
        applyRewardBundle(mission.reward);
        const advancedChapter = mission.section === 'pulse' ? 0 : maybeAdvanceMissionChapter();
        saveState();
        playSfx(advancedChapter ? 'promote' : 'reward');
        showRewardToast(
            advancedChapter
                ? localize({
                    zh: `浠诲姟濂栧姳宸查鍙?路 宸叉帹杩涘埌绗?${advancedChapter} 绔燻,
                    en: `Mission reward claimed 路 advanced to Chapter ${advancedChapter}`
                })
                : t('missionClaimed'),
            mission.reward,
            localize(mission.title)
        );
        renderAll({ preservePanelScroll: true });
    }

    function claimSeasonReward(level) {
        const reward = getSeasonRewards().find((item) => item.level === level);
        const state = reward ? getSeasonRewardState(reward.level) : null;
        if (!reward || !state || !state.claimable) return;
        playerProfile.seasonClaims[String(level)] = true;
        applyRewardBundle(reward.free);
        saveState();
        playSfx('reward');
        showRewardToast(
            localize({ zh: `宸查鍙?Lv.${level} 璧涘濂栧姳`, en: `Claimed season reward Lv.${level}` }),
            reward.free,
            localize(reward.free.title)
        );
        renderAll({ preservePanelScroll: true });
    }

    function claimSeasonSponsorReward(level) {
        const reward = getSeasonRewards().find((item) => item.level === level);
        const state = reward ? getSeasonSponsorRewardState(reward.level) : null;
        if (!reward || !state || !state.claimable) return;
        playerProfile.payment.premiumSeasonClaims[String(level)] = true;
        applyRewardBundle(reward.premium);
        saveState();
        playSfx('promote');
        showRewardToast(
            localize({ zh: `宸查鍙?Lv.${level} 璧炲姪杞ㄩ亾濂栧姳`, en: `Claimed sponsor reward Lv.${level}` }),
            reward.premium,
            localize(reward.premium.title)
        );
        renderAll({ preservePanelScroll: true });
    }

    function claimRankReward(id) {
        const reward = getRankRewards().find((item) => item.id === id);
        const state = reward ? getRankRewardState(reward) : null;
        if (!reward || !state || !state.claimable) return;
        playerProfile.rankClaims[reward.id] = true;
        applyRewardBundle(reward.reward);
        saveState();
        playSfx('promote');
        showRewardToast(
            localize({ zh: `宸查鍙栧啿姒滃鍔盽, en: 'Ladder reward claimed' }),
            reward.reward,
            localize(reward.title)
        );
        renderAll({ preservePanelScroll: true });
    }

    function unlockEntry(category, id) {
        const list = category === 'runners' ? RUNNERS : category === 'skills' ? ACTIVE_SKILLS : PASSIVES;
        const entry = list.find((item) => item.id === id);
        if (!entry || isUnlocked(category, entry)) return;
        if (!meetsUnlock(entry) || !canPurchaseUnlock(entry)) {
            showToast(t('notEnoughGold'));
            return;
        }
        playerProfile.gold -= entry.unlock.gold || 0;
        playerProfile.unlocked[category].push(id);
        saveState();
        playSfx('reward');
        showToast(t('unlocked'));
        renderAll();
    }

    function equipEntry(type, id) {
        if (type === 'runner' && playerProfile.unlocked.runners.includes(id)) playerProfile.loadout.runner = id;
        if (type === 'skill' && playerProfile.unlocked.skills.includes(id)) playerProfile.loadout.skill = id;
        if (type === 'passive' && playerProfile.unlocked.passives.includes(id)) playerProfile.loadout.passive = id;
        saveState();
        playSfx('move');
        showToast(t('equipped'));
        renderAll();
    }

    function unlockEntry(category, id) {
        const resolved = getUpgradeCollectionKey(category);
        const list = getUpgradeDefs(resolved);
        const entry = list.find((item) => item.id === id);
        if (!entry || isUnlocked(resolved, entry)) return;
        if (!meetsUnlock(entry)) {
            showToast(unlockConditionText(entry));
            return;
        }
        if (!canPurchaseUnlock(entry)) {
            const cost = getUnlockCost(entry);
            const needGold = (cost.gold || 0) > playerProfile.gold;
            const needCore = (cost.core || 0) > playerProfile.core;
            if (needGold && needCore) showToast(playerProfile.lang === 'en' ? 'Not enough gold and cores' : '閲戝竵涓庤兘鏍镐笉瓒?);
            else if (needGold) showToast(t('notEnoughGold'));
            else showToast(playerProfile.lang === 'en' ? 'Not enough cores' : '鑳芥牳涓嶈冻');
            return;
        }
        const cost = getUnlockCost(entry);
        playerProfile.gold -= cost.gold || 0;
        playerProfile.core -= cost.core || 0;
        playerProfile.unlocked[resolved].push(id);
        playerProfile.upgrades[resolved][id] = Math.max(1, playerProfile.upgrades[resolved][id] || 0);
        saveState();
        playSfx('reward');
        showToast(playerProfile.lang === 'en' ? `${localize(entry.title)} unlocked` : `${localize(entry.title)} 宸茶В閿乣);
        renderAll({ preservePanelScroll: true });
    }

    function equipEntry(type, id) {
        if (type === 'runner' && playerProfile.unlocked.runners.includes(id)) playerProfile.loadout.runner = id;
        if (type === 'skill' && playerProfile.unlocked.skills.includes(id)) playerProfile.loadout.skill = id;
        if (type === 'passive' && playerProfile.unlocked.passives.includes(id)) playerProfile.loadout.passive = id;
        saveState();
        playSfx('move');
        showToast(t('equipped'));
        renderAll({ preservePanelScroll: true });
    }

    function upgradeEntry(category, id) {
        const resolved = getUpgradeCollectionKey(category);
        const def = getUpgradeDefs(resolved).find((item) => item.id === id);
        if (!def || !isUnlocked(resolved, def)) return;
        const level = getEntryLevel(resolved, id);
        const cost = getUpgradeCost(resolved, def, level);
        if (!cost) {
            showToast(playerProfile.lang === 'en' ? 'Already at max level' : '宸茶揪鍒版弧绾?);
            return;
        }
        const needGold = (cost.gold || 0) > playerProfile.gold;
        const needCore = (cost.core || 0) > playerProfile.core;
        if (needGold || needCore) {
            if (needGold && needCore) showToast(playerProfile.lang === 'en' ? 'Not enough gold and cores' : '閲戝竵涓庤兘鏍镐笉瓒?);
            else if (needGold) showToast(t('notEnoughGold'));
            else showToast(playerProfile.lang === 'en' ? 'Not enough cores' : '鑳芥牳涓嶈冻');
            return;
        }
        playerProfile.gold -= cost.gold || 0;
        playerProfile.core -= cost.core || 0;
        playerProfile.upgrades[resolved][id] = level + 1;
        saveState();
        playSfx('reward');
        showToast(playerProfile.lang === 'en' ? `${localize(def.title)} upgraded to Lv.${level + 1}` : `${localize(def.title)} 鍗囪嚦 Lv.${level + 1}`);
        renderAll({ preservePanelScroll: true });
    }

    function renderRunTab() {
        const runner = getRunner(playerProfile.loadout.runner);
        const runnerStats = getRunnerStats(runner);
        const skill = getSkill(playerProfile.loadout.skill);
        const passive = getPassive(playerProfile.loadout.passive);
        const rankScore = getRunnerRankScore();
        const divisionInfo = getDivisionInfo(rankScore);
        const leaderboard = getRunnerLeaderboard(rankScore);
        const fastest500 = formatTimeMs(playerProfile.stats.fastest500TimeMs);
        const bestClean = formatDistance(playerProfile.stats.bestCleanDistance || 0);
        const boostEntries = getBoostInventoryEntries();
        const readyBoostCount = boostEntries.filter((entry) => entry.count > 0).length;
        const liveBoosts = boostEntries.filter((entry) => game.activeBoosts.includes(entry.key));
        return `
            <div class="card-grid">
                <article class="stat-card showcase-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('runPanelTitle')}</div>
                            <h3>${t('runPanelDesc')}</h3>
                        </div>
                    </div>
                    <div class="runner-showcase">
                        <div class="runner-avatar" style="background:linear-gradient(135deg, ${runner.accent}33, rgba(164,107,255,0.22));"></div>
                        <div>
                            <h3>${localize(runner.title)}</h3>
                            <p>${localize(runner.desc)}</p>
                        </div>
                    </div>
                    ${renderStatBars(runner)}
                    <div class="stat-row">
                        <span class="pill">${t('statCurrentSkill')}: ${localize(skill.title)}</span>
                        <span class="pill">${t('statCurrentPassive')}: ${localize(passive.title)}</span>
                        <span class="pill good">${t('touchHint')}</span>
                    </div>
                </article>

                <article class="event-card boost-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'RUN BOOSTS' : '杩愯澧炵泭'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Turn stored resources into stronger next runs' : '鎶婂偍澶囪祫婧愮洿鎺ヨ浆鎴愭帴涓嬫潵鍑犲眬鐨勭埥鐐?}</h3>
                        </div>
                        <span class="pill ${readyBoostCount > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `${readyBoostCount} armed` : `宸插鎴?${readyBoostCount}`}</span>
                    </div>
                    <p>${playerProfile.lang === 'en'
                        ? 'Supply-shop boosts now affect real gameplay: faster overclock starts, stronger settlement, and safer revive flow.'
                        : '琛ョ粰鍟嗗簵閲岀殑澧炵泭宸茬粡浼氱湡瀹炰綔鐢ㄥ埌璺戝眬閲岋細鏇村揩寮€鐖姐€佹洿寮虹粨绠椼€佷互鍙婃洿绋崇殑澶嶆椿瀹归敊銆?}</p>
                    <div class="reward-row">
                        ${liveBoosts.length
                            ? liveBoosts.map((entry) => `<span class="reward-pill">${playerProfile.lang === 'en' ? 'Live Now' : '鏈眬鐢熸晥'} 路 ${entry.title}</span>`).join('')
                            : `<span class="reward-pill">${playerProfile.lang === 'en' ? 'No temporary boost is active this run' : '褰撳墠娌℃湁鐢熸晥涓殑涓存椂澧炵泭'}</span>`}
                    </div>
                    <div class="boost-list">
                        ${boostEntries.map((entry) => `
                            <div class="boost-row ${entry.count > 0 || game.activeBoosts.includes(entry.key) ? 'is-live' : ''}" style="--boost-accent:${entry.accent};">
                                <div class="card-title-row">
                                    <div>
                                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'RESERVE' : '鍌ㄥ'}</div>
                                        <h3>${entry.title}</h3>
                                    </div>
                                    <span class="pill ${entry.count > 0 || game.activeBoosts.includes(entry.key) ? 'good' : ''}">${formatBoostRewardText(entry.key, entry.count)}</span>
                                </div>
                                <p>${entry.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </article>

                <article class="event-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${t('runEvent1')}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Track Pressure Feed' : '璧涢亾鍘嬪姏鎯呮姤'}</h3>
                        </div>
                        <span class="pill hot">x${runnerStats.speed.toFixed(2)}</span>
                    </div>
                    <p>${t('runEvent1Desc')}</p>
                    <div class="tag-row">
                        <span class="pill">${playerProfile.lang === 'en' ? 'Fastest 500m' : '500m 鏈€蹇?} ${fastest500}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Best Clean' : '鏃犱激鏈€浣?} ${bestClean}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Overclock Uses' : '绱瓒呴'} ${formatNumber(playerProfile.stats.overclockUses || 0)}</span>
                    </div>
                </article>

                <article class="event-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${t('runEvent2')}</div>
                            <h3>${t('rankTitle')}</h3>
                        </div>
                        <span class="pill">${formatNumber(rankScore)}</span>
                    </div>
                    <p>${t('rankDesc')}</p>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Best Combo' : '鏈€楂樿繛鍑?} ${formatNumber(playerProfile.stats.longestCombo)}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Perfect Runs' : '鏃犱激灞€鏁?} ${formatNumber(playerProfile.stats.perfectRuns)}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Total Runs' : '绱灞€鏁?} ${formatNumber(playerProfile.totalRuns)}</span>
                    </div>
                </article>

                ${renderDivisionCard(divisionInfo)}

                <article class="event-card leaderboard-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'LIVE LADDER' : '鍗虫椂姒滃帇'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Nearest Rivals' : '杩戣韩瀵规墜'}</h3>
                        </div>
                        <span class="pill hot">#${leaderboard.playerRank}</span>
                    </div>
                    <p>${leaderboard.playerRank === 1
                        ? localize({ zh: '浣犲凡缁忔殏鏃剁珯鍦ㄦ棣栵紝鎺ヤ笅鏉ユ洿閲嶈鐨勬槸瀹堜綇浼樺娍涓庣户缁埛楂樿瘎鍒嗐€?, en: 'You are temporarily holding rank #1. The next job is defending it with cleaner, higher-rated runs.' })
                        : localize({ zh: '姒滃崟涓嶅彧鐪嬭窛绂伙紝杩樹細鏀惧ぇ杩炲嚮涓庢棤浼よ〃鐜般€傝秺绋筹紝鍐叉瓒婂揩銆?, en: 'The ladder amplifies combo and clean runs as well as distance. Stable routing climbs faster.' })}</p>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Run Rating' : '璺戦叿璇勫垎'} ${formatNumber(rankScore)}</span>
                        <span class="reward-pill">${leaderboard.playerRank === 1
                            ? localize({ zh: '浣犲凡鍗犳嵁姒滈', en: 'You own the summit' })
                            : localize({ zh: `璺濅笂涓€鍚?${formatNumber(leaderboard.nextGap)}`, en: `Gap to next ${formatNumber(leaderboard.nextGap)}` })}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Tip: keep combo above 20' : '寤鸿锛氳繛鍑诲敖閲忎繚鎸?20 浠ヤ笂'}</span>
                    </div>
                    <div class="leaderboard-list">
                        ${leaderboard.entries.map((entry) => `
                            <div class="leaderboard-row ${entry.isPlayer ? 'is-player' : ''}">
                                <span class="leaderboard-rank">#${entry.rank}</span>
                                <div class="leaderboard-name">
                                    <strong>${entry.name}</strong>
                                    <span class="leaderboard-note">${entry.note}</span>
                                </div>
                                <span class="leaderboard-score">${formatNumber(entry.score)}</span>
                            </div>
                        `).join('')}
                    </div>
                </article>

                <article class="rule-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${t('controlsTitle')}</div>
                            <h3>${t('runEvent3')}</h3>
                        </div>
                    </div>
                    <p>${t('controlsDesc')}</p>
                    <div class="reward-row">
                        <span class="reward-pill">${t('runEvent3Desc')}</span>
                    </div>
                </article>
            </div>
        `;
    }

    function renderLoadoutActionButton(type, id, owned, equipped) {
        const unlockType = type === 'runner' ? 'runners' : type === 'skill' ? 'skills' : 'passives';
        if (!owned) {
            return `<button class="ghost-btn loadout-action-btn loadout-unlock-btn wide-btn" data-unlock="${unlockType}" data-id="${id}" type="button">${t('runnerUnlock')}</button>`;
        }
        if (equipped) {
            return `<button class="ghost-btn loadout-action-btn loadout-equipped-btn wide-btn" type="button" disabled>${t('runnerEquipped')}</button>`;
        }
        return `<button class="primary-btn loadout-action-btn loadout-equip-btn wide-btn" data-equip="${type}" data-id="${id}" type="button">${t('runnerEquip')}</button>`;
    }

    function renderLoadoutTab() {
        const equippedRunner = getRunner(playerProfile.loadout.runner);
        const equippedSkill = getSkill(playerProfile.loadout.skill);
        const equippedPassive = getPassive(playerProfile.loadout.passive);
        const runnerCards = RUNNERS.map((runner) => {
            const owned = isUnlocked('runners', runner);
            const equipped = playerProfile.loadout.runner === runner.id;
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${owned ? t('runnerTagStarter') : t('runnerTagUnlock')}</div>
                            <h3>${localize(runner.title)}</h3>
                        </div>
                        <span class="pill" style="color:${runner.accent};border-color:${runner.accent}55;">SPD x${runner.stats.speed.toFixed(2)}</span>
                    </div>
                    <p>${localize(runner.desc)}</p>
                    <div class="runner-meta">
                        <span class="pill">${unlockConditionText(runner)}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Combo' : '杩炲嚮'} x${runner.stats.combo.toFixed(2)}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Control' : '鎿嶆帶'} x${runner.stats.control.toFixed(2)}</span>
                    </div>
                    ${renderLoadoutActionButton('runner', runner.id, owned, equipped)}
                </article>
            `;
        }).join('');

        const skillCards = ACTIVE_SKILLS.map((skill) => {
            const owned = isUnlocked('skills', skill);
            const equipped = playerProfile.loadout.skill === skill.id;
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${t('skillSection')}</div>
                            <h3>${localize(skill.title)}</h3>
                        </div>
                        <span class="pill">${skill.cooldown}s</span>
                    </div>
                    <p>${localize(skill.desc)}</p>
                    <div class="runner-meta">
                        <span class="pill">${unlockConditionText(skill)}</span>
                    </div>
                    ${renderLoadoutActionButton('skill', skill.id, owned, equipped)}
                </article>
            `;
        }).join('');

        const passiveCards = PASSIVES.map((passive) => {
            const owned = isUnlocked('passives', passive);
            const equipped = playerProfile.loadout.passive === passive.id;
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${t('passiveSection')}</div>
                            <h3>${localize(passive.title)}</h3>
                        </div>
                    </div>
                    <p>${localize(passive.desc)}</p>
                    <div class="runner-meta">
                        <span class="pill">${unlockConditionText(passive)}</span>
                    </div>
                    ${renderLoadoutActionButton('passive', passive.id, owned, equipped)}
                </article>
            `;
        }).join('');

        return `
            <div class="card-grid loadout-grid">
                <article class="stat-card showcase-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('loadoutTitle')}</div>
                            <h3>${t('loadoutDesc')}</h3>
                        </div>
                    </div>
                    <div class="runner-showcase">
                        <div class="runner-avatar" style="background:linear-gradient(135deg, ${equippedRunner.accent}33, rgba(164,107,255,0.22));"></div>
                        <div>
                            <h3>${localize(equippedRunner.title)}</h3>
                            <p>${playerProfile.lang === 'en' ? 'Current active loadout with runner, skill and passive synced.' : '褰撳墠鐢熸晥涓殑璺戣€呫€佷富鍔ㄦ妧鑳戒笌琚姩鑺墖缁勫悎銆?}</p>
                        </div>
                    </div>
                    ${renderStatBars(equippedRunner)}
                    <div class="panel-meta-row">
                        <span class="pill">${t('statCurrentSkill')}: ${localize(equippedSkill.title)}</span>
                        <span class="pill">${t('statCurrentPassive')}: ${localize(equippedPassive.title)}</span>
                    </div>
                </article>
                ${runnerCards}
                ${skillCards}
                ${passiveCards}
            </div>
        `;
    }

    function renderStatBars(runner) {
        const stats = getRunnerStats(runner);
        const rows = [
            { label: playerProfile.lang === 'en' ? 'Speed' : '閫熷害', value: stats.speed, max: 1.36 },
            { label: playerProfile.lang === 'en' ? 'Combo' : '杩炲嚮', value: stats.combo, max: 1.42 },
            { label: playerProfile.lang === 'en' ? 'Control' : '鎿嶆帶', value: stats.control, max: 1.36 }
        ];
        return `
            <div class="stat-bars">
                ${rows.map((row) => `
                    <div class="stat-bar">
                        <span class="mini-label">${row.label}</span>
                        <div class="stat-bar-track"><i style="width:${Math.max(14, Math.min(100, (row.value / row.max) * 100))}%"></i></div>
                        <strong class="mono">${row.value.toFixed(2)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function getLoadoutSpecPillLabels(type, def, level = 1) {
        if (type === 'runner') {
            const stats = getRunnerStats(def, level);
            return [
                `SPD x${stats.speed.toFixed(2)}`,
                `${playerProfile.lang === 'en' ? 'Combo' : '杩炲嚮'} x${stats.combo.toFixed(2)}`,
                `${playerProfile.lang === 'en' ? 'Control' : '鎿嶆帶'} x${stats.control.toFixed(2)}`
            ];
        }
        if (type === 'skill') {
            const runtime = getSkillRuntime(def, level);
            if (def.id === 'shield') {
                return [
                    playerProfile.lang === 'en' ? `Shield ${runtime.shieldDuration.toFixed(1)}s` : `鎶ょ浘 ${runtime.shieldDuration.toFixed(1)}s`,
                    `CD ${runtime.cooldown.toFixed(1)}s`
                ];
            }
            return [
                playerProfile.lang === 'en' ? `Clear ${runtime.clearDistance.toFixed(0)}m` : `娓呴殰 ${runtime.clearDistance.toFixed(0)}m`,
                playerProfile.lang === 'en' ? `Overclock +${runtime.overclockGain.toFixed(0)}` : `瓒呴 +${runtime.overclockGain.toFixed(0)}`,
                `CD ${runtime.cooldown.toFixed(1)}s`
            ];
        }
        const runtime = getPassiveRuntime(def, level);
        if (def.id === 'magnet') {
            return [
                playerProfile.lang === 'en' ? `Pull 卤${runtime.laneReach} lane` : `鍚搁檮 卤${runtime.laneReach} 杞﹂亾`,
                playerProfile.lang === 'en' ? `Pickup ${runtime.pickupZ.toFixed(0)}m` : `鍚搁檮 ${runtime.pickupZ.toFixed(0)}m`,
                playerProfile.lang === 'en' ? `Gold +${Math.round(runtime.coinYieldBonus * 100)}%` : `閲戝竵 +${Math.round(runtime.coinYieldBonus * 100)}%`
            ];
        }
        return [
            playerProfile.lang === 'en' ? `Combo 鈮?{runtime.comboThreshold}` : `杩炲嚮 鈮?{runtime.comboThreshold}`,
            playerProfile.lang === 'en' ? `Overclock +${runtime.overclockPerSecond.toFixed(1)}/s` : `瓒呴 +${runtime.overclockPerSecond.toFixed(1)}/绉抈
        ];
    }

    function renderLoadoutSpecPills(type, def, level = 1) {
        return getLoadoutSpecPillLabels(type, def, level).map((label) => `<span class="pill">${label}</span>`).join('');
    }

    function renderLoadoutUpgradeMeta(type, def, owned) {
        const category = getUpgradeCollectionKey(type);
        const level = owned ? getEntryLevel(category, def.id) : 1;
        const cap = getUpgradeCap(category);
        const upgradeCost = owned ? getUpgradeCost(category, def, level) : null;
        return `
            <div class="runner-meta loadout-upgrade-meta">
                ${owned
                    ? `<span class="pill good">Lv.${level}/${cap}</span>${upgradeCost ? renderCompactCostPills(upgradeCost) : `<span class="pill good">MAX</span>`}`
                    : `<span class="pill">${unlockConditionText(def)}</span>`}
            </div>
            <div class="runner-meta loadout-spec-row">
                ${renderLoadoutSpecPills(type, def, level)}
            </div>
        `;
    }

    function renderLoadoutActionButton(type, id, owned, equipped) {
        const category = getUpgradeCollectionKey(type);
        const def = getUpgradeDefs(category).find((item) => item.id === id);
        if (!owned) {
            return `<button class="ghost-btn loadout-action-btn loadout-unlock-btn wide-btn" data-unlock="${category}" data-id="${id}" type="button">${t('runnerUnlock')}</button>`;
        }
        const level = getEntryLevel(category, id);
        const upgradeCost = getUpgradeCost(category, def, level);
        const canUpgrade = !!upgradeCost && canUpgradeEntry(category, def);
        return `
            <div class="loadout-action-grid">
                ${equipped
                    ? `<button class="ghost-btn loadout-action-btn loadout-equipped-btn" type="button" disabled>${t('runnerEquipped')}</button>`
                    : `<button class="primary-btn loadout-action-btn loadout-equip-btn" data-equip="${type}" data-id="${id}" type="button">${t('runnerEquip')}</button>`}
                ${upgradeCost
                    ? `<button class="${canUpgrade ? 'primary-btn' : 'ghost-btn'} loadout-action-btn loadout-upgrade-btn ${canUpgrade ? 'is-ready' : ''}" data-upgrade-loadout="${category}" data-id="${id}" type="button">${playerProfile.lang === 'en' ? `Upgrade Lv.${level + 1}` : `鍗囩骇 Lv.${level + 1}`}</button>`
                    : `<button class="ghost-btn loadout-action-btn loadout-maxed-btn" type="button" disabled>MAX</button>`}
            </div>
        `;
    }

    function renderLoadoutTab() {
        const equippedRunner = getRunner(playerProfile.loadout.runner);
        const equippedSkill = getSkill(playerProfile.loadout.skill);
        const equippedPassive = getPassive(playerProfile.loadout.passive);
        const runnerCards = RUNNERS.map((runner) => {
            const owned = isUnlocked('runners', runner);
            const equipped = playerProfile.loadout.runner === runner.id;
            const runnerStats = getRunnerStats(runner, owned ? getEntryLevel('runners', runner.id) : 1);
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${owned ? (equipped ? (playerProfile.lang === 'en' ? 'ACTIVE RUNNER' : '褰撳墠瑙掕壊') : (playerProfile.lang === 'en' ? 'OWNED RUNNER' : '宸茶В閿佽鑹?)) : t('runnerTagUnlock')}</div>
                            <h3>${localize(runner.title)}</h3>
                        </div>
                        <span class="pill" style="color:${runner.accent};border-color:${runner.accent}55;">SPD x${runnerStats.speed.toFixed(2)}</span>
                    </div>
                    <p>${localize(runner.desc)}</p>
                    ${renderLoadoutUpgradeMeta('runner', runner, owned)}
                    ${renderLoadoutActionButton('runner', runner.id, owned, equipped)}
                </article>
            `;
        }).join('');

        const skillCards = ACTIVE_SKILLS.map((skill) => {
            const owned = isUnlocked('skills', skill);
            const equipped = playerProfile.loadout.skill === skill.id;
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${owned ? (equipped ? (playerProfile.lang === 'en' ? 'ACTIVE SKILL' : '褰撳墠鎶€鑳?) : t('skillSection')) : t('runnerTagUnlock')}</div>
                            <h3>${localize(skill.title)}</h3>
                        </div>
                    </div>
                    <p>${localize(skill.desc)}</p>
                    ${renderLoadoutUpgradeMeta('skill', skill, owned)}
                    ${renderLoadoutActionButton('skill', skill.id, owned, equipped)}
                </article>
            `;
        }).join('');

        const passiveCards = PASSIVES.map((passive) => {
            const owned = isUnlocked('passives', passive);
            const equipped = playerProfile.loadout.passive === passive.id;
            return `
                <article class="runner-card loadout-card ${equipped ? 'is-active' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${owned ? (equipped ? (playerProfile.lang === 'en' ? 'ACTIVE CHIP' : '褰撳墠鑺墖') : t('passiveSection')) : t('runnerTagUnlock')}</div>
                            <h3>${localize(passive.title)}</h3>
                        </div>
                    </div>
                    <p>${localize(passive.desc)}</p>
                    ${renderLoadoutUpgradeMeta('passive', passive, owned)}
                    ${renderLoadoutActionButton('passive', passive.id, owned, equipped)}
                </article>
            `;
        }).join('');

        return `
            <div class="card-grid loadout-grid">
                <article class="stat-card showcase-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('loadoutTitle')}</div>
                            <h3>${t('loadoutDesc')}</h3>
                        </div>
                    </div>
                    <div class="runner-showcase">
                        <div class="runner-avatar" style="background:linear-gradient(135deg, ${equippedRunner.accent}33, rgba(164,107,255,0.22));"></div>
                        <div>
                            <h3>${localize(equippedRunner.title)}</h3>
                            <p>${playerProfile.lang === 'en' ? 'Permanent upgrades now directly amplify your active runner, skill, and passive chip.' : '姘镐箙鍗囩骇浼氱洿鎺ユ斁澶у綋鍓嶇敓鏁堢殑瑙掕壊銆佷富鍔ㄦ妧鑳戒笌琚姩鑺墖銆?}</p>
                        </div>
                    </div>
                    ${renderStatBars(equippedRunner)}
                    <div class="panel-meta-row">
                        <span class="pill">${t('statCurrentSkill')}: ${localize(equippedSkill.title)}</span>
                        <span class="pill">${t('statCurrentPassive')}: ${localize(equippedPassive.title)}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill good">${playerProfile.lang === 'en' ? `Permanent +${formatNumber(getTotalUpgradeInvestment())} Lv` : `姘镐箙寮哄寲 +${formatNumber(getTotalUpgradeInvestment())} 绾}</span>
                        <span class="pill ${getAffordableUpgradeCount() > 0 ? 'hot' : ''}">${playerProfile.lang === 'en' ? `${formatNumber(getAffordableUpgradeCount())} upgrades ready` : `${formatNumber(getAffordableUpgradeCount())} 椤瑰彲鍗囩骇`}</span>
                    </div>
                </article>
                ${runnerCards}
                ${skillCards}
                ${passiveCards}
            </div>
        `;
    }

    function renderMissionsTab() {
        const chapter = getMissionChapter();
        const missions = missionDefinitions()
            .map((mission) => ({ ...mission, state: getMissionState(mission) }))
            .sort(sortMissionEntries);
        const claimableCount = missions.filter((mission) => mission.state.complete && !mission.state.claimed).length;
        const claimableMissions = missions.filter((mission) => mission.state.complete && !mission.state.claimed);
        const pulseMissions = missions.filter((mission) => mission.section === 'pulse' && (mission.state.claimed || !mission.state.complete));
        const coreMissions = missions.filter((mission) => mission.section === 'core' && (mission.state.claimed || !mission.state.complete));
        const eliteMissions = missions.filter((mission) => mission.section === 'elite' && (mission.state.claimed || !mission.state.complete));
        const dailyStats = playerProfile.dailyStats;
        const renderMissionCard = (mission) => {
            const { current, complete, claimed } = mission.state;
            const progressPct = Math.max(0, Math.min(100, (current / mission.target) * 100));
            const statusText = claimed
                ? t('missionDone')
                : complete
                    ? localize({ zh: '鍙鍙?, en: 'Ready To Claim' })
                    : t('missionLocked');
            return `
                <article class="mission-card ${complete && !claimed ? 'is-claimable' : ''}">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${statusText}</div>
                            <h3>${localize(mission.title)}</h3>
                        </div>
                        <span class="pill ${complete && !claimed ? 'hot' : ''}">${formatNumber(current)} / ${formatNumber(mission.target)}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="tier-pill ${mission.tier}">${missionTierLabel(mission.tier)}</span>
                        <span class="pill">${mission.section === 'pulse'
                            ? localize({ zh: '姣忔棩杞崲', en: 'Daily Rotation' })
                            : mission.section === 'elite'
                                ? localize({ zh: '绔犺妭楂樺帇鐩爣', en: 'Chapter Pressure Goal' })
                                : localize({ zh: `绗?${chapter} 绔犱富绾縛, en: `Chapter ${chapter} Core` })}</span>
                    </div>
                    <p>${localize(mission.desc)}</p>
                    <div class="progress-track"><i style="width:${progressPct}%"></i></div>
                    <div class="reward-row">${renderRewardPills(mission.reward)}</div>
                    <button class="${complete && !claimed ? 'primary-btn' : 'ghost-btn'} wide-btn" ${complete && !claimed ? '' : 'disabled'} data-claim-mission="${mission.id}" type="button">
                        ${claimed ? t('missionDone') : t('missionClaim')}
                    </button>
                </article>
            `;
        };

        return `
            <div class="card-grid">
                <article class="stat-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('missionsTitle')}</div>
                            <h3>${t('missionsDesc')}</h3>
                        </div>
                        <button class="ghost-btn" type="button" data-open-modal="mission-rules">${playerProfile.lang === 'en' ? 'Rules' : '瑙勫垯'}</button>
                    </div>
                    <div class="season-kpi-grid">
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Board Chapter' : '浠诲姟绔犺妭'}</span>
                            <strong>${playerProfile.lang === 'en' ? `Chapter ${chapter}` : `绗?${chapter} 绔燻}</strong>
                        </div>
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Ready Rewards' : '鍙濂栧姳'}</span>
                            <strong>${formatNumber(claimableCount)}</strong>
                        </div>
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Daily Reset' : '鏃ュ父鍒锋柊'}</span>
                            <strong id="missionDailyReset">${playerProfile.lang === 'en' ? 'Updating鈥? : '鏇存柊涓€?}</strong>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today runs ${formatNumber(dailyStats.runs)}` : `浠婃棩灞€鏁?${formatNumber(dailyStats.runs)}`}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today best combo ${formatNumber(dailyStats.bestCombo)}` : `浠婃棩鏈€楂樿繛鍑?${formatNumber(dailyStats.bestCombo)}`}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today clean ${formatNumber(dailyStats.cleanDistance)}m` : `浠婃棩鏃犱激 ${formatNumber(dailyStats.cleanDistance)}m`}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot">${playerProfile.lang === 'en' ? `Claimable ${claimableCount}` : `鍙鍙?${claimableCount}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? `Active ${missions.length}` : `杩涜涓?${missions.length}`}</span>
                        <span class="pill">${playerProfile.lang === 'en'
                            ? 'Claim all chapter contracts to unlock the next chapter'
                            : '棰嗗彇瀹屽綋鍓嶇珷鑺傚悎绾﹀悗瑙ｉ攣涓嬩竴绔?}</span>
                    </div>
                </article>
                ${claimableMissions.length
                    ? `
                        <article class="event-card shop-section-card">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'READY NOW' : '绔嬪嵆鍙'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Claimable contracts are pinned first' : '鍙鍙栦换鍔″凡缃《鏄剧ず'}</h3>
                                </div>
                                <span class="pill hot">${formatNumber(claimableMissions.length)}</span>
                            </div>
                            <p>${playerProfile.lang === 'en'
                                ? 'These rewards are already finished. Claim them first to unlock the next board faster.'
                                : '杩欎簺濂栧姳宸茬粡杈炬垚锛屽厛棰嗘帀鍙互鏇村揩瑙ｉ攣涓嬩竴绔犮€?}</p>
                            <div class="reward-row">
                                ${claimableMissions.slice(0, 4).map((mission) => `<span class="reward-pill">${localize(mission.title)}</span>`).join('')}
                            </div>
                        </article>
                        ${claimableMissions.map(renderMissionCard).join('')}
                    `
                    : ''}
                ${pulseMissions.length
                    ? `
                        <article class="event-card shop-section-card">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'DAILY PULSE' : '姣忔棩鑴夊啿'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'One rotating daily mission keeps the session warm' : '杞崲鏃ュ父璐熻矗缁存寔姣忔棩娲昏穬鑺傚'}</h3>
                                </div>
                            </div>
                        </article>
                        ${pulseMissions.map(renderMissionCard).join('')}
                    `
                    : ''}
                <article class="event-card shop-section-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'CORE CONTRACTS' : '绔犺妭涓荤嚎'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Distance, runs, combo, and score define chapter pacing' : '璺濈銆佸眬鏁般€佽繛鍑汇€佸垎鏁板叡鍚屽喅瀹氱珷鑺傛帹杩?}</h3>
                        </div>
                    </div>
                </article>
                ${coreMissions.map(renderMissionCard).join('')}
                ${eliteMissions.length
                    ? `
                        <article class="event-card shop-section-card">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE CONTRACTS' : '绮捐嫳鍚堢害'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Mid / late-game pressure and bigger rewards live here' : '涓悗鏈熷帇鍔涗笌鏇村帤濂栧姳闆嗕腑鍦ㄨ繖閲?}</h3>
                                </div>
                            </div>
                        </article>
                        ${eliteMissions.map(renderMissionCard).join('')}
                    `
                    : ''}
            </div>
        `;
    }

    function renderSeasonTab() {
        const level = calcSeasonLevel(playerProfile.seasonXp);
        const rankScore = getRunnerRankScore();
        const divisionInfo = getDivisionInfo(rankScore);
        const leaderboard = getRunnerLeaderboard(rankScore);
        const settlementPreview = getSeasonSettlementPreview(divisionInfo, level);
        const currentXp = playerProfile.seasonXp % 120;
        const next = 120 - currentXp;
        const countdown = formatCountdown(getSeasonEndTime() - Date.now());
        const rewards = getSeasonRewards();
        const rankRewards = getRankRewards();
        const claimableCount = getClaimableSeasonRewardCount();
        const sponsorClaimableCount = getClaimableSeasonSponsorRewardCount();
        const rankClaimableCount = getClaimableRankRewardCount(rankScore);
        const totalClaimableCount = claimableCount + sponsorClaimableCount + rankClaimableCount;
        const sponsorUnlocked = !!playerProfile.payment.passUnlocked;
        const nextRankReward = rankRewards.find((reward) => !getRankRewardState(reward, rankScore).claimed && rankScore < reward.score)
            || rankRewards.find((reward) => !getRankRewardState(reward, rankScore).claimed)
            || null;
        const settlementRows = getDivisionTiers().map((tier) => {
            const isCurrent = tier.id === divisionInfo.tier.id;
            return `
                <div class="settlement-row ${isCurrent ? 'is-current' : ''}" style="--tier-color:${tier.color};">
                    <div class="settlement-tier">
                        <strong>${localize(tier.title)}</strong>
                        <span>${playerProfile.lang === 'en' ? `${formatNumber(tier.min)}+ rating` : `${formatNumber(tier.min)}+ 娈典綅鍒哷}</span>
                    </div>
                    <div class="settlement-values">
                        <span>${t('goldLabel')} +${formatNumber(tier.settlement.gold)}</span>
                        <span>${t('coreLabel')} +${formatNumber(tier.settlement.core)}</span>
                    </div>
                </div>
            `;
        }).join('');
        return `
            <div class="card-grid">
                <article class="season-track">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('seasonTitle')}</div>
                            <h3>${t('seasonDesc')}</h3>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${t('seasonLevel')} Lv.${level}</span>
                        <span class="reward-pill">${t('seasonXp')} ${formatNumber(playerProfile.seasonXp)}</span>
                        <span class="reward-pill">${t('seasonNext')} ${formatNumber(next)} XP</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Claimable ${formatNumber(totalClaimableCount)}` : `鍙鍙?${formatNumber(totalClaimableCount)}`}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot" id="seasonCountdown">${playerProfile.lang === 'en' ? `Ends In ${countdown}` : `璧涘鍓╀綑 ${countdown}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Free + Sponsor dual track' : '鍏嶈垂 + 璧炲姪鍙岃建'}</span>
                        <span class="pill ${rankClaimableCount > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `Ladder rewards ${formatNumber(rankClaimableCount)} ready` : `鍐叉濂栧姳寰呴 ${formatNumber(rankClaimableCount)}`}</span>
                    </div>
                    <div class="season-banner">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'Season Pulse' : '璧涘鑴夊啿'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Short sessions feed the pass, missions and ladder together.' : '鐭眬娲昏穬浼氬悓鏃跺杺鍏婚€氳璇併€佷换鍔′笌鍐叉鑺傚銆?}</h3>
                        <div class="season-kpi-grid">
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Distance' : '鏈€浣宠窛绂?}</span>
                                <strong>${formatDistance(playerProfile.bestDistance)}</strong>
                            </div>
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Score' : '鏈€浣崇Н鍒?}</span>
                                <strong>${formatNumber(playerProfile.bestScore)}</strong>
                            </div>
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Total Distance' : '鎬婚噷绋?}</span>
                                <strong>${formatDistance(playerProfile.totalDistance)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="progress-track"><i style="width:${(currentXp / 120) * 100}%"></i></div>
                    <div class="season-rail">
                        <section class="season-lane">
                            <div class="season-lane-head">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'FREE TRACK' : '鍏嶈垂杞ㄩ亾'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Claim practical resources as soon as levels unlock.' : '绛夌骇涓€鍒板氨鑳介鍙栵紝涓绘墦瀹炵敤璧勬簮琛ョ粰銆?}</h3>
                                </div>
                                <span class="pill good">${playerProfile.lang === 'en' ? `${claimableCount} ready` : `${claimableCount} 涓緟棰哷}</span>
                            </div>
                            <div class="season-node-row">
                                ${rewards.map((reward) => {
                                    const state = getSeasonRewardState(reward.level);
                                    const buttonLabel = state.claimed
                                        ? localize({ zh: '宸查鍙?, en: 'Claimed' })
                                        : state.claimable
                                            ? localize({ zh: '棰嗗彇鍏嶈垂濂栧姳', en: 'Claim Free Reward' })
                                            : localize({ zh: `Lv.${reward.level} 瑙ｉ攣`, en: `Unlock at Lv.${reward.level}` });
                                    const statusLabel = state.claimed
                                        ? localize({ zh: '宸插畬鎴?, en: 'Done' })
                                        : state.claimable
                                            ? localize({ zh: '鍙鍙?, en: 'Ready' })
                                            : localize({ zh: '鏈В閿?, en: 'Locked' });
                                    return `
                                        <article class="season-node ${state.claimable ? 'is-claimable' : ''} ${state.claimed ? 'is-claimed' : ''}">
                                            <div class="season-node-top">
                                                <span class="pill hot">Lv.${reward.level}</span>
                                                <span class="pill ${state.claimable ? 'good' : ''}">${statusLabel}</span>
                                            </div>
                                            <div>
                                                <h3>${localize(reward.free.title)}</h3>
                                                <p>${localize(reward.free.desc)}</p>
                                            </div>
                                            <div class="reward-row">${renderRewardPills(reward.free)}</div>
                                            <button class="${state.claimable ? 'primary-btn' : 'ghost-btn'} wide-btn" type="button" ${state.claimable ? `data-claim-season="${reward.level}"` : 'disabled'}>${buttonLabel}</button>
                                        </article>
                                    `;
                                }).join('')}
                            </div>
                        </section>
                        <section class="season-lane">
                            <div class="season-lane-head">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'SPONSOR TRACK' : '璧炲姪杞ㄩ亾'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Verified top-up unlocks a second reward lane with stronger seasonal payoffs.' : '瀹屾垚閾句笂鏍￠獙鍚庯紝寮€鍚浜屾潯鏇村亸涓悗鏈熶环鍊肩殑璧涘濂栧姳杞ㄩ亾銆?}</h3>
                                </div>
                                <span class="pill ${sponsorUnlocked ? 'good' : ''}">${sponsorUnlocked
                                    ? (playerProfile.lang === 'en' ? `${formatNumber(sponsorClaimableCount)} ready` : `寰呴 ${formatNumber(sponsorClaimableCount)}`)
                                    : (playerProfile.lang === 'en' ? 'Locked by top-up' : '鍏呭€煎悗瑙ｉ攣')}</span>
                            </div>
                            <div class="season-node-row">
                                ${rewards.map((reward) => {
                                    const state = getSeasonSponsorRewardState(reward.level);
                                    const buttonLabel = !state.passUnlocked
                                        ? localize({ zh: '鍓嶅線鍟嗗簵瑙ｉ攣', en: 'Unlock In Shop' })
                                        : state.claimed
                                            ? localize({ zh: '宸查鍙?, en: 'Claimed' })
                                            : state.claimable
                                                ? localize({ zh: '棰嗗彇璧炲姪濂栧姳', en: 'Claim Sponsor Reward' })
                                                : localize({ zh: `Lv.${reward.level} 瑙ｉ攣`, en: `Unlock at Lv.${reward.level}` });
                                    return `
                                        <article class="season-node is-premium ${state.unlocked ? 'is-unlocked' : ''} ${state.claimable ? 'is-claimable' : ''} ${state.claimed ? 'is-claimed' : ''}">
                                            <div class="season-node-top">
                                                <span class="pill hot">Lv.${reward.level}</span>
                                                <span class="pill ${state.claimable ? 'good' : ''}">${!state.passUnlocked
                                                    ? localize({ zh: '鏈В閿?, en: 'Locked' })
                                                    : state.claimed
                                                        ? localize({ zh: '宸插畬鎴?, en: 'Done' })
                                                        : state.claimable
                                                            ? localize({ zh: '鍙鍙?, en: 'Ready' })
                                                            : localize({ zh: '鎴愰暱涓?, en: 'Progressing' })}</span>
                                            </div>
                                            <div>
                                                <h3>${localize(reward.premium.title)}</h3>
                                                <p>${localize(reward.premium.desc)}</p>
                                            </div>
                                            <div class="reward-row">${renderRewardPills(reward.premium, 'shop-pill')}</div>
                                            <button
                                                class="${state.claimable ? 'primary-btn' : 'ghost-btn'} wide-btn"
                                                type="button"
                                                ${state.claimable
                                                    ? `data-claim-season-premium="${reward.level}"`
                                                    : (!state.passUnlocked ? 'data-open-tab="shop"' : 'disabled')}
                                            >${buttonLabel}</button>
                                        </article>
                                    `;
                                }).join('')}
                            </div>
                        </section>
                    </div>
                </article>

                <article class="season-track settlement-card" style="--tier-color:${divisionInfo.tier.color};">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'LADDER BOUNTY' : '鍐叉璧忛噾'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Every major rating breakpoint now gives an instant chase reward.' : '姣忎釜鍏抽敭璇勫垎妗ｄ綅閮戒細缁欏嵆鏃跺彲棰嗙殑鍐叉鍥為銆?}</h3>
                        </div>
                        <span class="pill hot">#${leaderboard.playerRank}</span>
                    </div>
                    <div class="settlement-highlight">
                        <div>
                            <div class="mini-label">${playerProfile.lang === 'en' ? 'Current ladder status' : '褰撳墠鍐叉鐘舵€?}</div>
                            <strong>${playerProfile.lang === 'en'
                                ? `Rating ${formatNumber(rankScore)} 路 ${localize(divisionInfo.tier.title)}`
                                : `璇勫垎 ${formatNumber(rankScore)} 路 ${localize(divisionInfo.tier.title)}`}</strong>
                            <p>${nextRankReward
                                ? (playerProfile.lang === 'en'
                                    ? `${formatNumber(Math.max(0, nextRankReward.score - rankScore))} rating to ${localize(nextRankReward.title)}.`
                                    : `璺濈 ${localize(nextRankReward.title)} 杩樺樊 ${formatNumber(Math.max(0, nextRankReward.score - rankScore))} 璇勫垎銆俙)
                                : (playerProfile.lang === 'en'
                                    ? 'All current ladder bounty tiers are already claimed. Keep defending the summit.'
                                    : '褰撳墠鍐叉濂栧姳宸插叏閮ㄩ鍙栵紝鎺ヤ笅鏉ラ噸鐐硅浆涓哄畧姒滀笌鍒锋洿楂樿瘎鍒嗐€?)}</p>
                        </div>
                        <div class="reward-row">
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Nearest rival gap ${formatNumber(leaderboard.nextGap)}` : `璺濅笂涓€鍚?${formatNumber(leaderboard.nextGap)}`}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Ready rewards ${formatNumber(rankClaimableCount)}` : `寰呴濂栧姳 ${formatNumber(rankClaimableCount)}`}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Best distance ${formatDistance(playerProfile.bestDistance)}` : `鏈€浣宠窛绂?${formatDistance(playerProfile.bestDistance)}`}</span>
                        </div>
                    </div>
                    <div class="season-node-row">
                        ${rankRewards.map((reward) => {
                            const state = getRankRewardState(reward, rankScore);
                            const gap = Math.max(0, reward.score - rankScore);
                            const buttonLabel = state.claimed
                                ? localize({ zh: '宸查鍙?, en: 'Claimed' })
                                : state.claimable
                                    ? localize({ zh: '棰嗗彇鍐叉濂栧姳', en: 'Claim Ladder Reward' })
                                    : localize({ zh: `杩樺樊 ${formatNumber(gap)}`, en: `${formatNumber(gap)} to go` });
                            return `
                                <article class="season-node ${state.claimable ? 'is-claimable' : ''} ${state.claimed ? 'is-claimed' : ''}">
                                    <div class="season-node-top">
                                        <span class="pill hot">${formatNumber(reward.score)}</span>
                                        <span class="pill ${state.claimable ? 'good' : ''}">${state.claimed
                                            ? localize({ zh: '宸插畬鎴?, en: 'Done' })
                                            : state.claimable
                                                ? localize({ zh: '鍙鍙?, en: 'Ready' })
                                                : localize({ zh: '鍐叉涓?, en: 'Climbing' })}</span>
                                    </div>
                                    <div>
                                        <h3>${localize(reward.title)}</h3>
                                        <p>${localize(reward.desc)}</p>
                                    </div>
                                    <div class="reward-row">${renderRewardPills(reward.reward)}</div>
                                    <button class="${state.claimable ? 'primary-btn' : 'ghost-btn'} wide-btn" type="button" ${state.claimable ? `data-claim-rank="${reward.id}"` : 'disabled'}>${buttonLabel}</button>
                                </article>
                            `;
                        }).join('')}
                    </div>
                </article>

                <article class="season-track settlement-card" style="--tier-color:${divisionInfo.tier.color};">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'SEASON SETTLEMENT' : '璧涘缁撶畻'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Clear rules, clear target, clear motivation.' : '鎶婄粨绠楃洰鏍囪娓呮锛岀帺瀹舵墠鏇存効鎰忕户缁啿銆?}</h3>
                        </div>
                        <span class="pill hot">${localize(divisionInfo.tier.short)}</span>
                    </div>
                    <div class="settlement-highlight">
                        <div>
                            <div class="mini-label">${playerProfile.lang === 'en' ? 'Current expected payout' : '褰撳墠棰勮缁撶畻'}</div>
                            <strong>${formatNumber(settlementPreview.totalGold)} ${t('goldLabel')} / ${formatNumber(settlementPreview.totalCore)} ${t('coreLabel')}</strong>
                            <p>${playerProfile.lang === 'en'
                                ? 'Final estimate = current highest division reward + season level activity bonus.'
                                : '褰撳墠棰勪及 = 鏈禌瀛ｆ渶楂樻浣嶅鍔?+ 璧涘绛夌骇娲昏穬鍔犳垚銆?}</p>
                        </div>
                        <div class="reward-row">
                            <span class="reward-pill">${playerProfile.lang === 'en' ? 'Base reward' : '鍩虹濂栧姳'} ${formatNumber(settlementPreview.baseGold)} / ${formatNumber(settlementPreview.baseCore)}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? 'Level bonus' : '绛夌骇鍔犳垚'} ${formatNumber(settlementPreview.levelBonusGold)} / ${formatNumber(settlementPreview.levelBonusCore)}</span>
                        </div>
                    </div>
                    <div class="settlement-grid">${settlementRows}</div>
                    <div class="panel-meta-row">
                        <span class="pill">${playerProfile.lang === 'en' ? 'Settlement uses the highest division reached this season.' : '璧涘缁撶畻鎸夋湰璧涘杈惧埌鐨勬渶楂樻浣嶈绠椼€?}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Season level adds a steady activity bonus.' : '璧涘绛夌骇浼氶澶栨彁渚涚ǔ瀹氭椿璺冨姞鎴愩€?}</span>
                    </div>
                    <div class="promotion-actions">
                        <button class="ghost-btn wide-btn" type="button" data-open-modal="season-rules">${playerProfile.lang === 'en' ? 'Read Full Season Rules' : '鏌ョ湅瀹屾暣璧涘瑙勫垯'}</button>
                    </div>
                </article>
            </div>
        `;
    }

    function renderShopTab() {
        if (ensureDailyShopState()) {
            saveState();
        }

        const boostEntries = getBoostInventoryEntries();
        const readyOffers = getShopAlertCount();
        const readyBoostCount = boostEntries.filter((entry) => entry.count > 0).length;
        const sponsorUnlocked = !!playerProfile.payment.passUnlocked;
        const totalSpentText = Number(playerProfile.payment.totalSpent || 0).toFixed(2);

        return `
            <div class="card-grid">
                <article class="stat-card showcase-card runner-payment-pass-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('shopTitle')}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Verified top-up, sponsor track, and live supplies all converge here.' : '鐪熷疄鍏呭€笺€佽禐鍔╄建閬撳拰瀹炶琛ョ粰缁熶竴鏀跺彛鍒拌繖涓〉闈€?}</h3>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyOffers} live supply offers` : `瀹炶琛ョ粰 ${readyOffers} 椤筦}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyBoostCount} stored boost types` : `澧炵泭鍌ㄥ ${readyBoostCount} 绫籤}</span>
                        <span class="reward-pill">${t('topupShopInfo')}</span>
                    </div>
                    <div class="shop-kpi-grid">
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Verified Top-Ups' : '宸叉牎楠屽厖鍊?}</span>
                            <strong>${formatNumber(playerProfile.payment.purchaseCount || 0)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Sponsor Track' : '璧炲姪杞ㄩ亾'}</span>
                            <strong>${sponsorUnlocked ? (playerProfile.lang === 'en' ? 'Unlocked' : '宸茶В閿?) : (playerProfile.lang === 'en' ? 'Locked' : '鏈В閿?)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Total Spent' : '绱鍏呭€?}</span>
                            <strong>$${totalSpentText}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Distance' : '鏈€浣宠窛绂?}</span>
                            <strong>${formatDistance(playerProfile.bestDistance)}</strong>
                        </div>
                    </div>
                    <div class="runner-payment-cta">
                        <span class="pill ${sponsorUnlocked ? 'good' : 'hot'}">${sponsorUnlocked
                            ? (playerProfile.lang === 'en' ? 'Sponsor rewards are now claimable in Season' : '璧涘椤靛凡寮€鏀捐禐鍔╁鍔?)
                            : (playerProfile.lang === 'en' ? 'Any verified top-up unlocks the sponsor track' : '浠绘剰涓€绗旀牎楠屾垚鍔熺殑鍏呭€奸兘浼氳В閿佽禐鍔╄建閬?)}</span>
                        <button class="primary-btn" type="button" data-open-payment="starter">${playerProfile.lang === 'en' ? 'Open Top-Up' : '鎵撳紑鍏呭€?}</button>
                    </div>
                </article>

                ${RUNNER_PAYMENT_OFFERS.map((offer) => `
                    <article class="shop-card ${offer.id === 'accelerator' || offer.id === 'throne' ? 'featured' : ''}" style="--shop-accent:${offer.accent};">
                        <div class="card-title-row">
                            <div>
                                <div class="eyebrow">${localize(offer.badge)}</div>
                                <h3>${localize(offer.name)}</h3>
                            </div>
                            <span class="pill hot">$${offer.price.toFixed(2)}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${playerProfile.lang === 'en' ? 'On-chain verified' : '閾句笂鏍￠獙鍙戝'}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'OKX Wallet 路 TRON (TRC20)' : 'OKX 閽卞寘 路 TRON (TRC20)'}</span>
                        </div>
                        <div class="shop-meta">
                            ${renderRewardPills(offer.reward, 'shop-pill')}
                        </div>
                        <button class="primary-btn wide-btn" type="button" data-open-payment="${offer.id}">${playerProfile.lang === 'en' ? 'Create Order & Pay' : '鍒涘缓璁㈠崟骞舵敮浠?}</button>
                    </article>
                `).join('')}

                <article class="stat-card shop-section-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'BOOST RESERVE' : '澧炵泭浠撳簱'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Everything bought here feeds directly into the next sessions' : '杩欓噷涔板埌鐨勪笢瑗夸細鐩存帴鍠傜粰鍚庣画鍑犲眬锛屼笉鍐嶅彧鏄睍绀?}</h3>
                        </div>
                    </div>
                    <div class="boost-list">
                        ${boostEntries.map((entry) => `
                            <div class="boost-row ${entry.count > 0 ? 'is-live' : ''}" style="--boost-accent:${entry.accent};">
                                <div class="card-title-row">
                                    <div>
                                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'STORED' : '宸插偍澶?}</div>
                                        <h3>${entry.title}</h3>
                                    </div>
                                    <span class="pill ${entry.count > 0 ? 'good' : ''}">${formatBoostRewardText(entry.key, entry.count)}</span>
                                </div>
                                <p>${entry.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </article>

                ${FUNCTIONAL_SHOP_OFFERS.map((offer) => {
                    const remaining = getRemainingShopStock(offer.id);
                    const freeClaim = (offer.cost.gold || 0) === 0 && (offer.cost.core || 0) === 0;
                    const actionable = remaining > 0 && canAffordCost(offer.cost);
                    const buttonLabel = remaining <= 0
                        ? t('shopSoldOut')
                        : freeClaim
                            ? t('shopClaim')
                            : actionable
                                ? t('shopBuy')
                                : t('shopUnavailable');

                    return `
                    <article class="shop-card functional ${actionable ? 'featured' : ''}" style="--shop-accent:${offer.accent};">
                        <div class="card-title-row">
                            <div>
                                <div class="eyebrow">${playerProfile.lang === 'en' ? 'LIVE OFFER' : '瀹炶琛ョ粰'}</div>
                                <h3>${localize(offer.title)}</h3>
                            </div>
                            <span class="pill ${remaining > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `${remaining}/${offer.stock} left` : `鍓╀綑 ${remaining}/${offer.stock}`}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${freeClaim ? localize({ zh: 'FREE', en: 'FREE' }) : localize({ zh: '鍗虫椂鐢熸晥', en: 'Instant effect' })}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'Affects your next runs immediately' : '绔嬪嵆浣滅敤鍒版帴涓嬫潵鍑犲眬'}</span>
                        </div>
                        <div class="shop-meta">
                            ${renderCostPills(offer.cost)}
                            ${renderRewardPills(offer.reward, 'shop-pill')}
                        </div>
                        <button class="${actionable ? 'primary-btn' : 'ghost-btn'} wide-btn" type="button" ${actionable ? `data-buy-shop="${offer.id}"` : 'disabled'}>${buttonLabel}</button>
                    </article>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderShopTab() {
        if (ensureDailyShopState()) {
            saveState();
        }

        const boostEntries = getBoostInventoryEntries();
        const readyOffers = getShopAlertCount();
        const readyBoostCount = boostEntries.filter((entry) => entry.count > 0).length;
        const sponsorUnlocked = !!playerProfile.payment.passUnlocked;
        const totalSpentText = Number(playerProfile.payment.totalSpent || 0).toFixed(2);
        const permanentPower = getTotalUpgradeInvestment();
        const affordableUpgrades = getAffordableUpgradeCount();

        return `
            <div class="card-grid">
                <article class="stat-card showcase-card runner-payment-pass-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('shopTitle')}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Verified top-ups now feed permanent loadout growth, sponsor rewards, and live supplies together.' : '鍏呭€煎鍔辩幇鍦ㄤ細鍚屾椂娴佸叆姘镐箙鍏绘垚銆佽禐鍔╄禌瀛ｅ拰鍗虫椂琛ョ粰銆?}</h3>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyOffers} live supply offers` : `鍗虫椂琛ョ粰 ${readyOffers} 椤筦}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyBoostCount} stored boost types` : `宸插偍澶囧鐩?${readyBoostCount} 绫籤}</span>
                        <span class="reward-pill ${affordableUpgrades > 0 ? 'hot' : ''}">${playerProfile.lang === 'en' ? `${affordableUpgrades} permanent upgrades ready` : `${affordableUpgrades} 椤规案涔呭崌绾у彲鐐筦}</span>
                    </div>
                    <div class="shop-kpi-grid">
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Verified Top-Ups' : '宸叉牎楠屽厖鍊?}</span>
                            <strong>${formatNumber(playerProfile.payment.purchaseCount || 0)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Sponsor Track' : '璧炲姪璧涢亾'}</span>
                            <strong>${sponsorUnlocked ? (playerProfile.lang === 'en' ? 'Unlocked' : '宸茶В閿?) : (playerProfile.lang === 'en' ? 'Locked' : '鏈В閿?)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Total Spent' : '绱鍏呭€?}</span>
                            <strong>$${totalSpentText}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Permanent Power' : '姘镐箙寮哄寲'}</span>
                            <strong>+${formatNumber(permanentPower)} Lv</strong>
                        </div>
                    </div>
                    <div class="runner-payment-cta">
                        <span class="pill ${sponsorUnlocked ? 'good' : 'hot'}">${sponsorUnlocked
                            ? (playerProfile.lang === 'en' ? 'Sponsor rewards are live, and top-ups now push permanent upgrades immediately.' : '璧炲姪濂栧姳宸插紑鍚紝鍏呭€艰祫婧愪細绔嬪埢杞寲涓烘案涔呭崌绾с€?)
                            : (playerProfile.lang === 'en' ? 'Any verified top-up unlocks the sponsor track and accelerates permanent upgrades.' : '浠绘剰涓€绗斿厖鍊奸兘浼氳В閿佽禐鍔╄禌閬擄紝骞跺姞閫熸案涔呭吇鎴愩€?)}</span>
                        <button class="primary-btn" type="button" data-open-payment="starter">${playerProfile.lang === 'en' ? 'Open Top-Up' : '鎵撳紑鍏呭€?}</button>
                    </div>
                </article>

                ${RUNNER_PAYMENT_OFFERS.map((offer) => `
                    <article class="shop-card ${offer.id === 'accelerator' || offer.id === 'throne' ? 'featured' : ''}" style="--shop-accent:${offer.accent};">
                        <div class="card-title-row">
                            <div>
                                <div class="eyebrow">${localize(offer.badge)}</div>
                                <h3>${localize(offer.name)}</h3>
                            </div>
                            <span class="pill hot">$${offer.price.toFixed(2)}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${playerProfile.lang === 'en' ? 'On-chain verified' : '閾句笂鏍￠獙鍙戝'}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'OKX Wallet 路 TRON (TRC20)' : 'OKX 閽卞寘 路 TRON (TRC20)'}</span>
                        </div>
                        <div class="shop-meta">
                            ${renderRewardPills(offer.reward, 'shop-pill')}
                        </div>
                        <button class="primary-btn wide-btn" type="button" data-open-payment="${offer.id}">${playerProfile.lang === 'en' ? 'Create Order & Pay' : '鍒涘缓璁㈠崟骞舵敮浠?}</button>
                    </article>
                `).join('')}

                <article class="stat-card shop-section-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'BOOST RESERVE' : '澧炵泭浠撳簱'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Temporary boosts still matter, but permanent upgrades are now the main long-term sink.' : '涓存椂澧炵泭渚濇棫鏈夋晥锛屼絾闀挎湡鎴愰暱鐨勪富娑堣€楀凡缁忚浆鍚戞案涔呭崌绾с€?}</h3>
                        </div>
                    </div>
                    <div class="boost-list">
                        ${boostEntries.map((entry) => `
                            <div class="boost-row ${entry.count > 0 ? 'is-live' : ''}" style="--boost-accent:${entry.accent};">
                                <div class="card-title-row">
                                    <div>
                                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'STORED' : '宸插偍澶?}</div>
                                        <h3>${entry.title}</h3>
                                    </div>
                                    <span class="pill ${entry.count > 0 ? 'good' : ''}">${formatBoostRewardText(entry.key, entry.count)}</span>
                                </div>
                                <p>${entry.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </article>

                ${FUNCTIONAL_SHOP_OFFERS.map((offer) => {
                    const remaining = getRemainingShopStock(offer.id);
                    const freeClaim = (offer.cost.gold || 0) === 0 && (offer.cost.core || 0) === 0;
                    const actionable = remaining > 0 && canAffordCost(offer.cost);
                    const buttonLabel = remaining <= 0
                        ? t('shopSoldOut')
                        : freeClaim
                            ? t('shopClaim')
                            : actionable
                                ? t('shopBuy')
                                : t('shopUnavailable');

                    return `
                    <article class="shop-card functional ${actionable ? 'featured' : ''}" style="--shop-accent:${offer.accent};">
                        <div class="card-title-row">
                            <div>
                                <div class="eyebrow">${playerProfile.lang === 'en' ? 'LIVE OFFER' : '鍗虫椂琛ョ粰'}</div>
                                <h3>${localize(offer.title)}</h3>
                            </div>
                            <span class="pill ${remaining > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `${remaining}/${offer.stock} left` : `鍓╀綑 ${remaining}/${offer.stock}`}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${freeClaim ? localize({ zh: 'FREE', en: 'FREE' }) : localize({ zh: '鍗虫椂鐢熸晥', en: 'Instant effect' })}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'Affects your next runs immediately' : '绔嬪埢浣滅敤鍒版帴涓嬫潵鍑犲眬'}</span>
                        </div>
                        <div class="shop-meta">
                            ${renderCostPills(offer.cost)}
                            ${renderRewardPills(offer.reward, 'shop-pill')}
                        </div>
                        <button class="${actionable ? 'primary-btn' : 'ghost-btn'} wide-btn" type="button" ${actionable ? `data-buy-shop="${offer.id}"` : 'disabled'}>${buttonLabel}</button>
                    </article>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderPanel({ preserveScroll = false } = {}) {
        const currentScroll = preserveScroll && dom.panelContent
            ? (dom.panelContent.scrollTop || panelScrollState[activeTab] || 0)
            : 0;
        const htmlByTab = {
            run: renderRunTab(),
            loadout: renderLoadoutTab(),
            missions: renderMissionsTab(),
            season: renderSeasonTab(),
            shop: renderShopTab()
        };
        dom.panelContent.innerHTML = htmlByTab[activeTab] || htmlByTab.run;
        panelScrollState[activeTab] = currentScroll;
        updateTabBadges();
        if (dom.panelContent) {
            requestAnimationFrame(() => {
                if (dom.panelContent) {
                    dom.panelContent.scrollTop = panelScrollState[activeTab] || 0;
                }
            });
        }
    }

    function applyI18n() {
        document.documentElement.lang = playerProfile.lang === 'en' ? 'en' : 'zh-CN';
        document.title = playerProfile.lang === 'en' ? 'Genesis Rush' : '鍒涗笘鐤捐窇';
        Array.from(document.querySelectorAll('[data-i18n]')).forEach((node) => {
            const key = node.dataset.i18n;
            node.textContent = t(key);
        });
        dom.langToggle.textContent = playerProfile.lang === 'en' ? '\u4E2D' : 'EN';
        dom.soundToggle.textContent = playerProfile.soundEnabled ? 'SFX ON' : 'SFX OFF';
        dom.soundToggle.classList.toggle('is-off', !playerProfile.soundEnabled);
    }

    function renderSummary() {
        dom.goldValue.textContent = formatNumber(playerProfile.gold);
        dom.coreValue.textContent = formatNumber(playerProfile.core);
        dom.bestDistanceValue.textContent = formatDistance(playerProfile.bestDistance);
        renderRunBriefStrip();
    }

    function renderRunBriefStrip() {
        if (!dom.runBriefHeadline || !dom.runBriefMeta) return;
        const runner = getRunner(playerProfile.loadout.runner);
        const skill = getSkill(playerProfile.loadout.skill);
        const passive = getPassive(playerProfile.loadout.passive);
        const rankScore = getRunnerRankScore();
        const divisionInfo = getDivisionInfo(rankScore);
        const leaderboard = getRunnerLeaderboard(rankScore);

        dom.runBriefHeadline.textContent = playerProfile.lang === 'en'
            ? `${localize(runner.title)} 路 ${localize(divisionInfo.tier.title)} 路 #${leaderboard.playerRank}`
            : `${localize(runner.title)} 路 ${localize(divisionInfo.tier.title)} 路 鎺掑悕 #${leaderboard.playerRank}`;

        dom.runBriefMeta.textContent = playerProfile.lang === 'en'
            ? `${localize(skill.title)} / ${localize(passive.title)} 路 Open the full run brief for boosts, ladder, and track details.`
            : `${localize(skill.title)} / ${localize(passive.title)} 路 鐐瑰嚮鏌ョ湅瀹屾暣璧涢亾绠€鎶ワ紝闆嗕腑娴忚澧炵泭銆佹鍗曚笌璧涢亾鎯呮姤銆俙;
    }

    function renderHud() {
        dom.distanceValue.textContent = formatDistance(Math.floor(game.distance));
        dom.scoreValue.textContent = formatNumber(game.score);
        dom.comboValue.textContent = `x${formatNumber(game.combo)}`;
        dom.overclockBar.style.width = `${Math.max(0, Math.min(100, game.overclock))}%`;
        const cooldownPct = game.skillCooldownMax > 0
            ? ((game.skillCooldownMax - game.skillCooldown) / game.skillCooldownMax) * 100
            : 100;
        dom.skillBar.style.width = `${Math.max(0, Math.min(100, cooldownPct))}%`;
        updateNewbieAssistUI();
    }

    function isNewbieAssistActive() {
        return playerProfile.totalRuns === 0 && (!game.running || game.distance < NEWBIE_ASSIST_DISTANCE);
    }

    function updateNewbieAssistUI() {
        if (!dom.newbieAssistHint) return;
        dom.newbieAssistHint.classList.toggle('is-hidden', !isNewbieAssistActive());
    }

    function getRunTuningProfile() {
        const totalRuns = playerProfile.totalRuns || 0;
        if (totalRuns === 0) {
            return {
                goldMultiplier: 1.2,
                xpMultiplier: 1.08,
                coreFloor: 4,
                rewardBias: 0.16,
                trackSpeedMultiplier: 0.8,
                obstacleApproachMultiplier: 0.68,
                spawnRelax: 0.32,
                spawnMin: 0.64,
                rewardZBonus: 14,
                obstacleZBonus: 30,
                trailingRewardZBonus: 16
            };
        }
        if (totalRuns < 3) {
            return {
                goldMultiplier: 1.12,
                xpMultiplier: 1.04,
                coreFloor: 3,
                rewardBias: 0.1,
                trackSpeedMultiplier: 0.88,
                obstacleApproachMultiplier: 0.8,
                spawnRelax: 0.22,
                spawnMin: 0.48,
                rewardZBonus: 8,
                obstacleZBonus: 18,
                trailingRewardZBonus: 10
            };
        }
        if (totalRuns < 6) {
            return {
                goldMultiplier: 1.05,
                xpMultiplier: 1.02,
                coreFloor: 2,
                rewardBias: 0.05,
                trackSpeedMultiplier: 0.94,
                obstacleApproachMultiplier: 0.9,
                spawnRelax: 0.14,
                spawnMin: 0.38,
                rewardZBonus: 4,
                obstacleZBonus: 10,
                trailingRewardZBonus: 5
            };
        }
        return {
            goldMultiplier: 1,
            xpMultiplier: 1,
            coreFloor: 2,
            rewardBias: 0,
            trackSpeedMultiplier: 1,
            obstacleApproachMultiplier: 1,
            spawnRelax: 0.08,
            spawnMin: 0.32,
            rewardZBonus: 0,
            obstacleZBonus: 0,
            trailingRewardZBonus: 0
        };
    }

    function updateRuntimeBodyState() {
        document.body.classList.toggle('runner-playing', activeTab === 'run' && game.running);
    }

    function renderAll({ preservePanelScroll = true } = {}) {
        if (preservePanelScroll && dom.panelContent) {
            panelScrollState[activeTab] = dom.panelContent.scrollTop || 0;
        }
        let shouldSave = false;
        if (ensureMissionBoardState()) {
            shouldSave = true;
        }
        if (ensureDailyProgressState()) {
            shouldSave = true;
        }
        if (ensureDailyShopState()) {
            shouldSave = true;
        }
        if (shouldSave) {
            saveState();
        }
        applyI18n();
        renderTabLayout({ preserveScroll: preservePanelScroll });
        updateReviveOverlayCopy();
        renderSummary();
        renderHud();
        renderPanel({ preserveScroll: preservePanelScroll });
        renderPaymentOfferGrid();
        renderResultOverlayCard();
        renderPaymentOrderUI();
        updatePaymentExpiryUI();
        updateMissionCountdownUI();
        if (activeInfoModal) {
            openInfoModal(activeInfoModal);
        }
    }

    function updateReviveOverlayCopy() {
        const descNode = dom.reviveOverlay.querySelector('[data-i18n="reviveDesc"]');
        if (!descNode) return;
        if (game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0) {
            dom.reviveBtn.textContent = localize({ zh: '鍏嶈垂澶嶆椿', en: 'Free Revive' });
            descNode.textContent = localize({
                zh: '鏈眬宸叉惡甯?1 娆″厤璐瑰娲伙紝鏈鐐瑰嚮涓嶄細娑堣€楄兘鏍搞€?,
                en: 'This run has 1 free revive armed, so this revive spends no cores.'
            });
            return;
        }
        dom.reviveBtn.textContent = t('reviveBtn');
        descNode.textContent = t('reviveDesc');
    }

    function updateSeasonCountdownUI() {
        const node = document.getElementById('seasonCountdown');
        if (!node) return;
        const countdown = formatCountdown(getSeasonEndTime() - Date.now());
        node.textContent = playerProfile.lang === 'en' ? `Ends In ${countdown}` : `璧涘鍓╀綑 ${countdown}`;
    }

    function updateMissionCountdownUI() {
        const dayKey = getLocalDayKey();
        if ((playerProfile.dailyStats && playerProfile.dailyStats.key !== dayKey)
            || (playerProfile.missionBoard && playerProfile.missionBoard.dailyKey !== dayKey)
            || (playerProfile.shop && playerProfile.shop.dailyKey !== dayKey)) {
            renderAll();
            return;
        }
        const node = document.getElementById('missionDailyReset');
        if (!node) return;
        const nextReset = new Date();
        nextReset.setHours(24, 0, 0, 0);
        const countdown = formatCountdown(nextReset.getTime() - Date.now());
        node.textContent = playerProfile.lang === 'en' ? `Resets In ${countdown}` : `鍒锋柊鍓╀綑 ${countdown}`;
    }

    function showToast(message) {
        if (!message) return;
        dom.toast.classList.remove('is-reward');
        dom.toast.textContent = message;
        dom.toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            dom.toast.classList.remove('is-visible');
            dom.toast.classList.remove('is-reward');
        }, 1700);
    }

    function ensureAudio() {
        if (!playerProfile.soundEnabled) return null;
        if (!audioCtx) {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) return null;
            audioCtx = new AudioContextCtor();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    function playTone({ frequency = 440, frequencyEnd = null, duration = 0.14, type = 'sine', volume = 0.04, delay = 0 } = {}) {
        const context = ensureAudio();
        if (!context) return;
        const start = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (frequencyEnd !== null) {
            oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequencyEnd), start + duration);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
    }

    function playSfx(name) {
        if (!playerProfile.soundEnabled) return;
        if (name === 'move') playTone({ frequency: 360, frequencyEnd: 420, duration: 0.08, type: 'square', volume: 0.018 });
        if (name === 'jump') playTone({ frequency: 440, frequencyEnd: 740, duration: 0.14, type: 'triangle', volume: 0.03 });
        if (name === 'slide') playTone({ frequency: 320, frequencyEnd: 180, duration: 0.12, type: 'sawtooth', volume: 0.024 });
        if (name === 'coin') playTone({ frequency: 780, frequencyEnd: 1040, duration: 0.09, type: 'square', volume: 0.028 });
        if (name === 'energy') playTone({ frequency: 520, frequencyEnd: 920, duration: 0.12, type: 'triangle', volume: 0.03 });
        if (name === 'skill') {
            playTone({ frequency: 520, frequencyEnd: 780, duration: 0.11, type: 'triangle', volume: 0.026 });
            playTone({ frequency: 780, frequencyEnd: 980, duration: 0.12, type: 'sine', volume: 0.02, delay: 0.04 });
        }
        if (name === 'overclock') {
            playTone({ frequency: 440, frequencyEnd: 880, duration: 0.14, type: 'sawtooth', volume: 0.03 });
            playTone({ frequency: 660, frequencyEnd: 1320, duration: 0.18, type: 'triangle', volume: 0.025, delay: 0.03 });
        }
        if (name === 'hit') playTone({ frequency: 240, frequencyEnd: 70, duration: 0.2, type: 'sawtooth', volume: 0.04 });
        if (name === 'reward') {
            playTone({ frequency: 660, frequencyEnd: 880, duration: 0.12, type: 'triangle', volume: 0.028 });
            playTone({ frequency: 880, frequencyEnd: 1320, duration: 0.16, type: 'triangle', volume: 0.024, delay: 0.05 });
        }
        if (name === 'promote') {
            playTone({ frequency: 520, frequencyEnd: 780, duration: 0.12, type: 'triangle', volume: 0.026 });
            playTone({ frequency: 780, frequencyEnd: 1240, duration: 0.18, type: 'sine', volume: 0.024, delay: 0.05 });
            playTone({ frequency: 1040, frequencyEnd: 1560, duration: 0.22, type: 'triangle', volume: 0.024, delay: 0.11 });
        }
        if (name === 'start') {
            playTone({ frequency: 520, frequencyEnd: 760, duration: 0.12, type: 'sawtooth', volume: 0.026 });
            playTone({ frequency: 760, frequencyEnd: 1180, duration: 0.18, type: 'triangle', volume: 0.022, delay: 0.06 });
        }
    }

    function setOverlay(target) {
        [dom.startOverlay, dom.pauseOverlay, dom.reviveOverlay, dom.resultOverlay].forEach((overlay) => {
            overlay.classList.toggle('is-hidden', overlay !== target);
        });
    }

    function hideOverlays() {
        [dom.startOverlay, dom.pauseOverlay, dom.reviveOverlay, dom.resultOverlay].forEach((overlay) => {
            overlay.classList.add('is-hidden');
        });
    }

    function closeResultOverlay() {
        if (!dom.resultOverlay || dom.resultOverlay.classList.contains('is-hidden')) return;
        if (!game.running && !game.awaitingRevive) {
            setOverlay(dom.startOverlay);
            return;
        }
        dom.resultOverlay.classList.add('is-hidden');
    }

    function resetResultOverlayScroll() {
        if (!dom.resultOverlay) return;
        dom.resultOverlay.scrollTop = 0;
        const resultCard = dom.resultOverlay.querySelector('.overlay-card');
        if (resultCard) {
            resultCard.scrollTop = 0;
        }
    }

    function resetRunState() {
        const runner = getRunner(playerProfile.loadout.runner);
        const skill = getSkill(playerProfile.loadout.skill);
        const runnerStats = getRunnerStats(runner);
        const skillRuntime = getSkillRuntime(skill);
        lastResult = null;
        dom.resultOverlay.classList.remove('is-promoted');
        dom.resultRankPanel.innerHTML = '';
        closeInfoModal();
        game.running = false;
        game.paused = false;
        game.awaitingRevive = false;
        game.lane = 1;
        game.targetLane = 1;
        game.x = 1;
        game.y = 0;
        game.vy = 0;
        game.slideTimer = 0;
        game.shieldTimer = 0;
        game.skillCooldown = 0;
        game.skillCooldownMax = skillRuntime.cooldown;
        game.overclock = 0;
        game.overclockActive = 0;
        game.runGoldMultiplier = 1;
        game.runSeasonXpMultiplier = 1;
        game.reviveCount = 0;
        game.freeReviveAvailable = false;
        game.freeReviveConsumed = false;
        game.activeBoosts = [];
        game.distance = 0;
        game.score = 0;
        game.combo = 1;
        game.maxCombo = 1;
        game.coinsRun = 0;
        game.coreRun = 0;
        game.dodgeRun = 0;
        game.objects = [];
        game.spawnTimer = 0;
        game.elapsed = 0;
        game.speedBase = 20 * runnerStats.speed;
        game.speedCurrent = game.speedBase;
        game.lastTime = 0;
        game.flashTimer = 0;
        game.hitless = true;
        game.timeAt500 = null;
        game.message = '';
        game.pickupBursts = [];
        game.newbieAssist = playerProfile.totalRuns === 0;
        renderHud();
    }

    function applyRunBoosts() {
        let changed = false;
        game.activeBoosts = [];

        if ((playerProfile.boosts.starterOverclockRuns || 0) > 0) {
            playerProfile.boosts.starterOverclockRuns -= 1;
            game.overclock = Math.max(game.overclock, 28);
            game.activeBoosts.push('starterOverclockRuns');
            changed = true;
        }

        if ((playerProfile.boosts.settlementBoostRuns || 0) > 0) {
            playerProfile.boosts.settlementBoostRuns -= 1;
            game.runGoldMultiplier = 1.25;
            game.runSeasonXpMultiplier = 1.25;
            game.activeBoosts.push('settlementBoostRuns');
            changed = true;
        }

        if ((playerProfile.boosts.freeRevives || 0) > 0) {
            game.freeReviveAvailable = true;
            game.activeBoosts.push('freeRevives');
        }

        if (changed) {
            saveState();
        }
    }

    function startRun() {
        resetRunState();
        applyRunBoosts();
        resetResultOverlayScroll();
        hideOverlays();
        dom.stageCard?.scrollIntoView({ block: 'start', behavior: 'auto' });
        game.running = true;
        renderAll();
        playSfx('start');
        if (game.newbieAssist) {
            showToast(t('newbieAssistToast'));
            return;
        }
        showToast(t('runReadyToast'));
    }

    function pauseRun() {
        if (!game.running || game.awaitingRevive) return;
        game.paused = true;
        setOverlay(dom.pauseOverlay);
        showToast(t('pausedToast'));
    }

    function resumeRun() {
        if (!game.running) return;
        game.paused = false;
        hideOverlays();
        showToast(t('resumedToast'));
    }

    function endRun(force = false) {
        const tuning = getRunTuningProfile();
        const runner = getRunner(playerProfile.loadout.runner);
        const runnerStats = getRunnerStats(runner);
        const previousDivision = getDivisionInfo(getRunnerRankScore());
        const previousBestDistance = playerProfile.bestDistance;
        const perfectRun = !force && game.reviveCount === 0 && game.dodgeRun >= 12;
        const runDistance = Math.floor(game.distance);
        const runScore = Math.floor(game.score);
        const comboGoldFactor = 1 + Math.max(0, runnerStats.combo - 1) * 0.9;
        const baseGoldGain = Math.max(120, Math.floor(game.distance * 0.42 + game.coinsRun * 9 + game.maxCombo * 14 * comboGoldFactor));
        const goldGain = Math.max(baseGoldGain, Math.floor(baseGoldGain * game.runGoldMultiplier * tuning.goldMultiplier));
        const coreGain = Math.max(tuning.coreFloor, Math.floor(game.distance / 260) + game.coreRun);
        const baseSeasonXpGain = Math.max(12, Math.floor(game.distance / 60) + game.dodgeRun * 2);
        const seasonXpGain = Math.max(baseSeasonXpGain, Math.floor(baseSeasonXpGain * game.runSeasonXpMultiplier * tuning.xpMultiplier));
        const gradeInfo = getRunGrade(Math.floor(game.distance), game.maxCombo, game.hitless);
        ensureDailyProgressState();
        playerProfile.gold += goldGain;
        playerProfile.core += coreGain;
        playerProfile.totalGoldEarned += goldGain;
        playerProfile.totalRuns += 1;
        playerProfile.totalDistance += runDistance;
        playerProfile.bestScore = Math.max(playerProfile.bestScore, runScore);
        if (game.maxCombo > playerProfile.stats.longestCombo) {
            playerProfile.stats.longestCombo = game.maxCombo;
        }
        if (perfectRun) {
            playerProfile.stats.perfectRuns += 1;
        }
        if (game.hitless) {
            playerProfile.stats.bestCleanDistance = Math.max(playerProfile.stats.bestCleanDistance || 0, Math.floor(game.distance));
        }
        if (game.timeAt500) {
            playerProfile.stats.fastest500TimeMs = playerProfile.stats.fastest500TimeMs
                ? Math.min(playerProfile.stats.fastest500TimeMs, game.timeAt500)
                : game.timeAt500;
        }
        if (goldGain >= 1000) {
            playerProfile.stats.goldRuns += 1;
        }
        playerProfile.bestDistance = Math.max(playerProfile.bestDistance, runDistance);
        playerProfile.seasonXp += seasonXpGain;
        playerProfile.dailyStats.runs += 1;
        playerProfile.dailyStats.distance += runDistance;
        playerProfile.dailyStats.bestDistance = Math.max(playerProfile.dailyStats.bestDistance, runDistance);
        playerProfile.dailyStats.bestCombo = Math.max(playerProfile.dailyStats.bestCombo, game.maxCombo);
        playerProfile.dailyStats.bestScore = Math.max(playerProfile.dailyStats.bestScore, runScore);
        if (game.hitless) {
            playerProfile.dailyStats.cleanDistance = Math.max(playerProfile.dailyStats.cleanDistance, runDistance);
        }

        const divisionInfo = getDivisionInfo(
            Math.floor(
                playerProfile.bestDistance * 0.7
                + playerProfile.stats.longestCombo * 40
                + playerProfile.stats.perfectRuns * 120
            )
        );
        const promoted = divisionInfo.tierIndex > previousDivision.tierIndex;
        const promotionText = promoted
            ? localize({
                zh: `鏅嬪崌鎴愬姛锛氬凡杩涘叆 ${localize(divisionInfo.tier.title)}銆俙,
                en: `Promotion complete: ${localize(divisionInfo.tier.title)} unlocked.`
            })
            : '';
        const settlementPreview = getSeasonSettlementPreview(divisionInfo);

        saveState();
        game.running = false;
        game.paused = false;
        game.awaitingRevive = false;

        lastResult = {
            distance: runDistance,
            score: runScore,
            goldGain,
            coreGain,
            seasonXpGain,
            gradeInfo,
            divisionInfo,
            promoted,
            promotionText,
            settlementPreview,
            maxCombo: game.maxCombo,
            dodgeRun: game.dodgeRun,
            reviveCount: game.reviveCount,
            hitless: game.hitless,
            runGoldMultiplier: game.runGoldMultiplier,
            runSeasonXpMultiplier: game.runSeasonXpMultiplier,
            activeBoosts: [...game.activeBoosts],
            freeReviveConsumed: game.freeReviveConsumed
        };

        dom.resultDistance.textContent = formatDistance(lastResult.distance);
        dom.resultScore.textContent = formatNumber(lastResult.score);
        dom.resultGold.textContent = formatNumber(goldGain);
        dom.resultCore.textContent = formatNumber(coreGain);
        dom.resultBadge.textContent = gradeInfo.grade;
        dom.resultBadge.style.background = `linear-gradient(135deg, ${gradeInfo.color}, #ffffff)`;
        dom.resultSummary.textContent = promoted ? promotionText : gradeInfo.text;
        dom.resultOverlay.classList.toggle('is-promoted', promoted);
        dom.resultMeta.innerHTML = [
            playerProfile.lang === 'en' ? `Combo x${formatNumber(game.maxCombo)}` : `杩炲嚮 x${formatNumber(game.maxCombo)}`,
            playerProfile.lang === 'en' ? `Dodges ${formatNumber(game.dodgeRun)}` : `闂伩 ${formatNumber(game.dodgeRun)}`,
            playerProfile.lang === 'en' ? `Revives ${formatNumber(game.reviveCount)}` : `澶嶆椿 ${formatNumber(game.reviveCount)}`,
            playerProfile.lang === 'en' ? `Season XP +${formatNumber(seasonXpGain)}` : `璧涘缁忛獙 +${formatNumber(seasonXpGain)}`,
            game.runGoldMultiplier > 1 ? (playerProfile.lang === 'en' ? `Gold x${game.runGoldMultiplier.toFixed(2)}` : `閲戝竵鍊嶇巼 x${game.runGoldMultiplier.toFixed(2)}`) : '',
            game.runSeasonXpMultiplier > 1 ? (playerProfile.lang === 'en' ? `XP x${game.runSeasonXpMultiplier.toFixed(2)}` : `缁忛獙鍊嶇巼 x${game.runSeasonXpMultiplier.toFixed(2)}`) : '',
            game.freeReviveConsumed ? t('freeReviveUsed') : '',
            game.hitless ? (playerProfile.lang === 'en' ? 'Clean Run' : '鏃犱激瀹屾垚') : (playerProfile.lang === 'en' ? 'Damaged Run' : '鍙楁崯瀹屾垚')
        ].filter(Boolean).map((text) => `<span class="reward-pill">${text}</span>`).join('');
        renderResultOverlayCard();
        resetResultOverlayScroll();
        setOverlay(dom.resultOverlay);
        playSfx(promoted ? 'promote' : 'reward');
        if (promoted) {
            showToast(localize({ zh: `娈典綅鏅嬪崌锛?{localize(divisionInfo.tier.title)}`, en: `Promoted: ${localize(divisionInfo.tier.title)}` }));
        } else if (Math.floor(game.distance) > previousBestDistance) {
            showToast(t('bestToast'));
        }
        renderAll();
    }

    function tryRevive() {
        if (!game.awaitingRevive) return;
        const canUseFreeRevive = game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0;
        if (!canUseFreeRevive && playerProfile.core < REVIVE_COST) {
            showToast(t('notEnoughCore'));
            return;
        }
        if (canUseFreeRevive) {
            playerProfile.boosts.freeRevives = Math.max(0, (playerProfile.boosts.freeRevives || 0) - 1);
            game.freeReviveAvailable = false;
            game.freeReviveConsumed = true;
            game.activeBoosts = game.activeBoosts.filter((key) => key !== 'freeRevives');
        } else {
            playerProfile.core -= REVIVE_COST;
        }
        saveState();
        game.awaitingRevive = false;
        game.running = true;
        game.paused = false;
        game.shieldTimer = 1.6;
        game.flashTimer = 0.8;
        game.objects = game.objects.filter((obj) => obj.z > 10);
        hideOverlays();
        playSfx('reward');
        showToast(canUseFreeRevive ? t('freeReviveUsed') : t('revived'));
        renderAll();
    }

    function failRun() {
        game.running = false;
        if (game.reviveCount < MAX_REVIVES) {
            game.awaitingRevive = true;
            updateReviveOverlayCopy();
            setOverlay(dom.reviveOverlay);
            return;
        }
        endRun();
    }

    function moveLane(direction) {
        game.targetLane = Math.max(0, Math.min(2, game.targetLane + direction));
        playSfx('move');
    }

    function jump() {
        if (game.y > 0.04) return;
        game.vy = 1.95;
        playSfx('jump');
    }

    function slide() {
        if (game.y > 0.12) return;
        game.slideTimer = 0.78;
        playSfx('slide');
    }

    function useSkill() {
        if (!game.running || game.paused || game.awaitingRevive) return;
        if (game.skillCooldown > 0) {
            showToast(t('skillCooling'));
            return;
        }
        const skill = getSkill(playerProfile.loadout.skill);
        const skillRuntime = getSkillRuntime(skill);
        if (skill.id === 'shield') {
            game.shieldTimer = skillRuntime.shieldDuration;
            showToast(t('skillShield'));
        } else if (skill.id === 'dash') {
            game.objects = game.objects.filter((obj) => !(obj.type !== 'coin' && obj.type !== 'energy' && obj.z < skillRuntime.clearDistance && Math.abs(obj.lane - game.lane) <= 1));
            game.overclock = Math.min(100, game.overclock + skillRuntime.overclockGain);
            game.flashTimer = 0.45;
            showToast(t('skillDash'));
        }
        game.skillCooldown = skillRuntime.cooldown;
        playSfx('skill');
    }

    function triggerOverclock() {
        if (!game.running || game.paused || game.awaitingRevive) return;
        if (game.overclock < 100) {
            showToast(t('overclockNeed'));
            return;
        }
        ensureDailyProgressState();
        game.overclock = 100;
        game.overclockActive = 4.8;
        game.flashTimer = 0.55;
        playerProfile.stats.overclockUses = (playerProfile.stats.overclockUses || 0) + 1;
        playerProfile.dailyStats.overclocks += 1;
        saveState();
        playSfx('overclock');
        showToast(t('overclockActive'));
    }

    function spawnObject() {
        const tuning = getRunTuningProfile();
        const roll = Math.random();
        const lane = Math.floor(Math.random() * 3);
        const earlyRunFactor = Math.max(0, 1 - (game.elapsed / 12));
        const rewardBaseZ = 132 + tuning.rewardZBonus;
        const obstacleBaseZ = 132 + tuning.obstacleZBonus + (earlyRunFactor * 22);
        const coinThreshold = 0.36 + tuning.rewardBias * 0.65 + earlyRunFactor * 0.08;
        const energyThreshold = coinThreshold + 0.14 + tuning.rewardBias * 0.35 + earlyRunFactor * 0.03;
        if (roll < coinThreshold) {
            game.objects.push({ type: 'coin', lane, z: rewardBaseZ + Math.random() * 14, value: 1 });
            if (Math.random() < 0.45) {
                game.objects.push({ type: 'coin', lane, z: rewardBaseZ + 10 + Math.random() * 10, value: 1 });
            }
            return;
        }
        if (roll < energyThreshold) {
            game.objects.push({ type: 'energy', lane, z: rewardBaseZ + Math.random() * 12, value: 1 });
            return;
        }
        const obstacleType = roll < 0.7 ? 'wall' : roll < 0.85 ? 'hurdle' : 'gate';
        game.objects.push({ type: obstacleType, lane, z: obstacleBaseZ + Math.random() * 18, value: 1 });
        if (Math.random() < 0.22) {
            game.objects.push({
                type: Math.random() < 0.55 ? 'coin' : 'energy',
                lane: Math.floor(Math.random() * 3),
                z: (150 + tuning.trailingRewardZBonus) + Math.random() * 12,
                value: 1
            });
        }
    }

    function spawnPickupBurst(type, obj) {
        const label = type === 'coin'
            ? localize({ zh: '+1 閲戝竵', en: '+1 Gold' })
            : localize({ zh: '+1 鑳芥牳', en: '+1 Core' });
        game.pickupBursts.push({
            type,
            lane: obj.lane,
            z: Math.max(10, obj.z),
            label,
            life: 0.68,
            duration: 0.68
        });
        if (game.pickupBursts.length > 10) {
            game.pickupBursts.splice(0, game.pickupBursts.length - 10);
        }
    }

    function handleCollision(obj) {
        const passive = getPassive(playerProfile.loadout.passive);
        const passiveRuntime = getPassiveRuntime(passive);
        const runner = getRunner(playerProfile.loadout.runner);
        const runnerStats = getRunnerStats(runner);
        const sameLane = obj.lane === game.lane;
        const nearLane = Math.abs(obj.lane - game.lane) <= passiveRuntime.laneReach;
        const canMagnet = passive.id === 'magnet' && nearLane;

        if ((obj.type === 'coin' || obj.type === 'energy') && (sameLane || canMagnet)) {
            if (obj.type === 'coin') {
                const coinValue = 1 + (passive.id === 'magnet' ? passiveRuntime.coinYieldBonus : 0);
                game.coinsRun += coinValue;
                game.score += 35 + game.combo * 2 * runnerStats.combo;
                game.overclock = Math.min(100, game.overclock + 1.5 + Math.max(0, coinValue - 1) * 8);
                playSfx('coin');
                spawnPickupBurst('coin', obj);
            } else {
                game.coreRun += 1;
                game.score += 50 + Math.max(0, runnerStats.combo - 1) * 18;
                game.overclock = Math.min(100, game.overclock + 8);
                playSfx('energy');
                spawnPickupBurst('energy', obj);
            }
            obj.remove = true;
            return;
        }

        if (!sameLane) return;

        const jumping = game.y > 0.42;
        const sliding = game.slideTimer > 0.05;
        let dodged = false;

        if (obj.type === 'hurdle') dodged = jumping;
        else if (obj.type === 'gate') dodged = sliding;
        else if (obj.type === 'wall') dodged = false;

        if (game.overclockActive > 0) {
            obj.remove = true;
            game.combo += 2;
            return;
        }

        if (dodged) {
            game.combo += 1;
            game.maxCombo = Math.max(game.maxCombo, game.combo);
            game.dodgeRun += 1;
            game.score += 70 * game.combo * runnerStats.combo;
            game.overclock = Math.min(100, game.overclock + 4 + Math.max(0, runnerStats.combo - 1) * 2);
            obj.remove = true;
            playSfx('move');
            return;
        }

        if (game.shieldTimer > 0) {
            game.shieldTimer = 0;
            obj.remove = true;
            game.flashTimer = 0.5;
            game.combo = Math.max(1, game.combo - 4);
            game.hitless = false;
            playSfx('skill');
            showToast(t('skillShield'));
            return;
        }

        game.hitless = false;
        playSfx('hit');
        showToast(t('hitWall'));
        game.reviveCount += 1;
        failRun();
    }

    function updateGame(dt) {
        if (!game.running || game.paused || game.awaitingRevive) return;
        const runner = getRunner(playerProfile.loadout.runner);
        const runnerStats = getRunnerStats(runner);
        const passive = getPassive(playerProfile.loadout.passive);
        const passiveRuntime = getPassiveRuntime(passive);
        const tuning = getRunTuningProfile();

        game.elapsed += dt;
        game.spawnTimer -= dt;
        game.skillCooldown = Math.max(0, game.skillCooldown - dt);
        game.shieldTimer = Math.max(0, game.shieldTimer - dt);
        game.flashTimer = Math.max(0, game.flashTimer - dt);

        if (game.overclockActive > 0) {
            game.overclockActive = Math.max(0, game.overclockActive - dt);
            game.overclock = Math.max(0, game.overclock - dt * 22);
        } else {
            game.overclock = Math.min(100, game.overclock + dt * 3.2);
        }

        const warmupFactor = Math.min(1, game.elapsed / 14);
        const distanceSpeedGain = Math.min(12, Math.max(0, game.distance - 240) / 260);
        const baseTrackSpeed = (game.speedBase + distanceSpeedGain) * (0.78 + warmupFactor * 0.22);
        game.speedCurrent = baseTrackSpeed * tuning.trackSpeedMultiplier + (game.overclockActive > 0 ? 10 : 0);
        game.distance += game.speedCurrent * dt * 10;
        game.score += game.speedCurrent * dt * 4 + game.combo * dt * 8 * runnerStats.combo;
        if (!game.timeAt500 && game.distance >= 500) {
            game.timeAt500 = Math.floor(game.elapsed * 1000);
        }

        game.x += (game.targetLane - game.x) * Math.min(1, dt * 10 * runnerStats.control);
        game.lane = Math.round(game.x);

        game.vy -= dt * 4.8;
        game.y = Math.max(0, game.y + game.vy * dt * 2.2);
        if (game.y === 0) {
            game.vy = Math.max(0, game.vy);
        }
        game.slideTimer = Math.max(0, game.slideTimer - dt);

        if (game.spawnTimer <= 0) {
            spawnObject();
            const baseSpawnTimer = Math.max(0.4, 1.06 - Math.min(0.52, Math.max(0, game.distance - 180) / 3600));
            game.spawnTimer = Math.max(tuning.spawnMin, baseSpawnTimer + tuning.spawnRelax);
        }

        game.objects.forEach((obj) => {
            const approachMultiplier = obj.type !== 'coin' && obj.type !== 'energy'
                ? tuning.obstacleApproachMultiplier
                : 1;
            obj.z -= game.speedCurrent * dt * 3.8 * approachMultiplier;
            if ((obj.type === 'coin' || obj.type === 'energy') && passive.id === 'magnet' && Math.abs(obj.lane - game.lane) <= passiveRuntime.laneReach && obj.z < passiveRuntime.pickupZ) {
                obj.lane = game.lane;
            }
            if (obj.z <= 9) {
                handleCollision(obj);
            }
        });
        game.objects = game.objects.filter((obj) => !obj.remove && obj.z > -10);
        game.pickupBursts = game.pickupBursts.filter((burst) => {
            burst.life = Math.max(0, burst.life - dt);
            burst.z = Math.max(6, burst.z - game.speedCurrent * dt * 1.25);
            return burst.life > 0;
        });

        if (passive.id === 'resonance' && game.combo >= passiveRuntime.comboThreshold) {
            game.overclock = Math.min(100, game.overclock + dt * passiveRuntime.overclockPerSecond);
        }
        if (game.overclock >= 100 && game.elapsed - Math.floor(game.elapsed) < dt) {
            showToast(t('overclockReady'));
        }

        game.maxCombo = Math.max(game.maxCombo, game.combo);
        renderHud();
    }

    function getRoadProgressFromY(y, height) {
        return clamp((y - height * 0.18) / (height * 0.82), 0, 1);
    }

    function getRoadProfile(width) {
        const compactScene = width <= 680;
        return compactScene
            ? {
                farLeftRatio: 0.33,
                nearLeftRatio: 0.075,
                farRightRatio: 0.67,
                nearRightRatio: 0.925
            }
            : {
                farLeftRatio: 0.36,
                nearLeftRatio: 0.11,
                farRightRatio: 0.64,
                nearRightRatio: 0.89
            };
    }

    function getRoadEdges(width, roadProgress) {
        const clampedProgress = clamp(roadProgress, 0, 1);
        const profile = getRoadProfile(width);
        return {
            left: width * (profile.farLeftRatio + (profile.nearLeftRatio - profile.farLeftRatio) * clampedProgress),
            right: width * (profile.farRightRatio + (profile.nearRightRatio - profile.farRightRatio) * clampedProgress)
        };
    }

    function getLaneBoundaryX(boundaryIndex, width, roadProgress) {
        const { left, right } = getRoadEdges(width, roadProgress);
        const laneWidth = (right - left) / 3;
        return left + laneWidth * boundaryIndex;
    }

    function getLaneCenterX(lane, width, roadProgress) {
        const { left, right } = getRoadEdges(width, roadProgress);
        const laneWidth = (right - left) / 3;
        return left + laneWidth * (lane + 0.5);
    }

    function projectObject(obj, width, height) {
        const perspective = Math.max(0.04, 1 - obj.z / 150);
        const y = height * 0.12 + perspective * height * 0.78;
        const roadProgress = getRoadProgressFromY(y, height);
        const x = getLaneCenterX(obj.lane, width, roadProgress);
        const size = 18 + perspective * 64;
        return { x, y, size, perspective, roadProgress };
    }

    function renderScene() {
        const dpr = window.devicePixelRatio || 1;
        const rect = dom.canvas.getBoundingClientRect();
        const width = dom.canvas.width / dpr;
        const height = dom.canvas.height / dpr;
        const compactScene = width <= 680;
        const roadFar = getRoadEdges(width, 0);
        const roadNear = getRoadEdges(width, 1);
        const roadNearWidth = roadNear.right - roadNear.left;
        const roadFarCenter = (roadFar.left + roadFar.right) / 2;

        ctx.clearRect(0, 0, width, height);

        const flashAlpha = game.flashTimer > 0 ? 0.16 + game.flashTimer * 0.2 : 0;
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#09152d');
        sky.addColorStop(0.55, '#0a1020');
        sky.addColorStop(1, '#03060d');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const starCount = 26;
        for (let index = 0; index < starCount; index += 1) {
            const px = ((index * 97) + Math.floor(game.distance * 0.9)) % (width + 80) - 40;
            const py = 36 + ((index * 53) % Math.floor(height * 0.34));
            const radius = (index % 4 === 0 ? 1.8 : 1.1) + (game.overclockActive > 0 ? 0.3 : 0);
            ctx.fillStyle = `rgba(159, 233, 255, ${0.16 + (index % 5) * 0.04})`;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let side = 0; side < 2; side += 1) {
            for (let tower = 0; tower < 6; tower += 1) {
                const depth = 1 - tower / 6;
                const towerHeight = 36 + depth * 110;
                const towerWidth = 12 + depth * 18;
                const x = side === 0
                    ? width * 0.08 + tower * 18
                    : width * 0.92 - tower * 18 - towerWidth;
                const y = height * 0.26 + tower * 26;
                ctx.fillStyle = `rgba(${side === 0 ? '87,229,255' : '164,107,255'}, ${0.08 + depth * 0.18})`;
                ctx.fillRect(x, y, towerWidth, towerHeight);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(x + towerWidth * 0.18, y + 10, towerWidth * 0.2, towerHeight - 20);
            }
        }

        ctx.save();
        ctx.translate(width / 2, height * 0.52);
        ctx.strokeStyle = 'rgba(87,229,255,0.12)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i += 1) {
            const y = i * 24;
            ctx.beginPath();
            ctx.moveTo(-width * 0.44 + i * 8, y);
            ctx.lineTo(width * 0.44 - i * 8, y);
            ctx.stroke();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(roadNear.left, height);
        ctx.lineTo(roadFar.left, height * 0.18);
        ctx.lineTo(roadFar.right, height * 0.18);
        ctx.lineTo(roadNear.right, height);
        ctx.closePath();
        const roadGradient = ctx.createLinearGradient(0, height * 0.18, 0, height);
        roadGradient.addColorStop(0, 'rgba(18,28,54,0.6)');
        roadGradient.addColorStop(1, 'rgba(9,13,24,0.96)');
        ctx.fillStyle = roadGradient;
        ctx.fill();

        for (let streak = 0; streak < 14; streak += 1) {
            const offset = ((game.distance * (2.4 + streak * 0.08)) + streak * 26) % height;
            const alpha = 0.03 + (game.overclockActive > 0 ? 0.035 : 0);
            const laneGlowOffset = roadNearWidth * (0.15 + streak * 0.018);
            ctx.strokeStyle = `rgba(87,229,255,${alpha})`;
            ctx.lineWidth = 1 + (streak % 3 === 0 ? 1 : 0);
            ctx.beginPath();
            ctx.moveTo(roadNear.left + laneGlowOffset, height - offset);
            ctx.lineTo(roadFarCenter, height * 0.18 + offset * 0.08);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(roadNear.right - laneGlowOffset, height - offset);
            ctx.lineTo(roadFarCenter, height * 0.18 + offset * 0.08);
            ctx.stroke();
        }

        for (let boundaryIndex = 0; boundaryIndex <= 3; boundaryIndex += 1) {
            const topX = getLaneBoundaryX(boundaryIndex, width, 0);
            const bottomX = getLaneBoundaryX(boundaryIndex, width, 1);
            const isOuter = boundaryIndex === 0 || boundaryIndex === 3;
            ctx.strokeStyle = isOuter ? 'rgba(96,212,255,0.32)' : 'rgba(96,212,255,0.42)';
            ctx.lineWidth = isOuter ? 2.4 : 3;
            ctx.beginPath();
            ctx.moveTo(bottomX, height);
            ctx.lineTo(topX, height * 0.18);
            ctx.stroke();
        }

        const sortedObjects = [...game.objects].sort((a, b) => b.z - a.z);
        sortedObjects.forEach((obj) => {
            const { x, y, size } = projectObject(obj, width, height);
            if (obj.type === 'coin') {
                ctx.shadowBlur = 18;
                ctx.shadowColor = 'rgba(255,214,107,0.46)';
                ctx.fillStyle = '#ffd66b';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'rgba(14, 20, 32, 0.92)';
                ctx.font = `700 ${Math.max(10, size * 0.18)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('+', x, y);
            } else if (obj.type === 'energy') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(87,229,255,0.44)';
                ctx.fillStyle = '#57e5ff';
                ctx.beginPath();
                ctx.moveTo(x, y - size * 0.28);
                ctx.lineTo(x + size * 0.18, y);
                ctx.lineTo(x, y + size * 0.28);
                ctx.lineTo(x - size * 0.18, y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(14, 20, 32, 0.96)';
                ctx.font = `700 ${Math.max(10, size * 0.18)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('鈿?, x, y + 1);
            } else {
                ctx.shadowBlur = 18;
                ctx.shadowColor = obj.type === 'wall' ? 'rgba(255,106,136,0.38)' : obj.type === 'hurdle' ? 'rgba(255,149,79,0.32)' : 'rgba(157,134,255,0.36)';
                ctx.fillStyle = obj.type === 'wall' ? '#ff5f7f' : obj.type === 'hurdle' ? '#ff954f' : '#9d86ff';
                const w = obj.type === 'gate' ? size * 0.94 : size * 0.64;
                const h = obj.type === 'hurdle' ? size * 0.28 : size * 0.74;
                const top = obj.type === 'gate' ? y - size * 0.7 : y - h;
                ctx.fillRect(x - w / 2, top, w, h);
                ctx.strokeStyle = 'rgba(255,255,255,0.78)';
                ctx.lineWidth = Math.max(1.5, size * 0.035);
                ctx.strokeRect(x - w / 2, top, w, h);
                if (obj.type === 'gate') {
                    ctx.clearRect(x - w * 0.28, y - size * 0.3, w * 0.56, size * 0.3);
                    ctx.fillStyle = 'rgba(255,255,255,0.88)';
                    ctx.font = `800 ${Math.max(10, size * 0.16)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('鈫?, x, top + h * 0.22);
                } else if (obj.type === 'hurdle') {
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.font = `800 ${Math.max(10, size * 0.16)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('鈫?, x, top - Math.max(8, size * 0.14));
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.92)';
                    ctx.font = `800 ${Math.max(10, size * 0.18)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('!', x, top + h * 0.5);
                }
            }
            ctx.shadowBlur = 0;
        });

        const playerX = width / 2 + (game.x - 1) * width * 0.16;
        const playerY = height * 0.82 - game.y * height * 0.22 + (game.slideTimer > 0 ? 18 : 0);
        const bodyW = 34;
        const bodyH = game.slideTimer > 0 ? 28 : 52;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.beginPath();
        ctx.ellipse(playerX, height * 0.88, 28, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.shadowBlur = game.shieldTimer > 0 ? 28 : 16;
        ctx.shadowColor = game.shieldTimer > 0 ? '#9fe9ff' : '#57e5ff';
        if (game.overclockActive > 0) {
            ctx.fillStyle = 'rgba(87,229,255,0.16)';
            ctx.beginPath();
            ctx.moveTo(playerX, playerY - bodyH * 0.3);
            ctx.lineTo(playerX - 44, playerY + 26);
            ctx.lineTo(playerX + 44, playerY + 26);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = game.overclockActive > 0 ? '#ffffff' : '#57e5ff';
        ctx.fillRect(playerX - bodyW / 2, playerY - bodyH, bodyW, bodyH);
        ctx.fillStyle = '#a46bff';
        ctx.fillRect(playerX - bodyW * 0.34, playerY - bodyH - 16, bodyW * 0.68, 14);
        if (game.shieldTimer > 0) {
            ctx.strokeStyle = 'rgba(159,233,255,0.84)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(playerX, playerY - bodyH * 0.58, 34, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(0.24, flashAlpha)})`;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 14px Inter';
        ctx.fillText(playerProfile.lang === 'en' ? 'Swipe or buttons to control' : '鎵嬪娍鎴栨寜閽帶鍒?, 18, 28);
        ctx.fillStyle = 'rgba(142,166,191,0.95)';
        ctx.fillText(playerProfile.lang === 'en' ? `Revives ${MAX_REVIVES - game.reviveCount}/${MAX_REVIVES}` : `鍓╀綑澶嶆椿 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);
        const liveBoostLabels = [];
        if (game.runGoldMultiplier > 1 || game.runSeasonXpMultiplier > 1) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'SETTLEMENT x1.25' : '缁撶畻 x1.25');
        }
        if (game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'FREE REVIVE READY' : '鍏嶈垂澶嶆椿寰呭懡');
        }
        if (liveBoostLabels.length) {
            ctx.fillStyle = 'rgba(89,255,155,0.95)';
            ctx.fillText(liveBoostLabels.join(' 路 '), 18, 72);
        }

        if (!compactScene) {
        if (!compactScene) {
            ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(159,233,255,0.94)';
        ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width - 18, 28);
        ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
        ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '瓒呴婵€娲讳腑') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '璧涢亾绋冲畾'), width - 18, 50);
        ctx.textAlign = 'left';
        }

        if (compactScene) {
            const topHudHeight = liveBoostLabels.length ? 88 : 64;
            const leftHudWidth = Math.min(width * 0.64, 300);
            ctx.fillStyle = 'rgba(3,6,13,0.84)';
            ctx.fillRect(0, 0, leftHudWidth, topHudHeight);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = '600 14px Inter';
            ctx.fillText(playerProfile.lang === 'en' ? 'Swipe or buttons to control' : '鎵嬪娍鎴栨寜閽帶鍒?, 18, 28);
            ctx.fillStyle = 'rgba(142,166,191,0.95)';
            ctx.fillText(playerProfile.lang === 'en' ? `Revives ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}` : `鍓╀綑澶嶆椿 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);
            if (liveBoostLabels.length) {
                ctx.fillStyle = 'rgba(89,255,155,0.95)';
                ctx.fillText(liveBoostLabels.join(' / '), 18, 72);
            }
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(159,233,255,0.94)';
            ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width * 0.5, 28);
            ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
            ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '瓒呴婵€娲讳腑') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '璧涢亾绋冲畾'), width * 0.5, 50);
            ctx.textAlign = 'left';
        }

        if (!rect.width || !rect.height) {
            resizeCanvas();
        }
    }

    function renderSceneV2() {
        const dpr = window.devicePixelRatio || 1;
        const rect = dom.canvas.getBoundingClientRect();
        const width = dom.canvas.width / dpr;
        const height = dom.canvas.height / dpr;
        const compactScene = width <= 680;
        const roadFar = getRoadEdges(width, 0);
        const roadNear = getRoadEdges(width, 1);
        const roadNearWidth = roadNear.right - roadNear.left;
        const roadFarCenter = (roadFar.left + roadFar.right) / 2;

        ctx.clearRect(0, 0, width, height);

        const flashAlpha = game.flashTimer > 0 ? 0.16 + game.flashTimer * 0.2 : 0;
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#09152d');
        sky.addColorStop(0.55, '#0a1020');
        sky.addColorStop(1, '#03060d');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const starCount = 26;
        for (let index = 0; index < starCount; index += 1) {
            const px = ((index * 97) + Math.floor(game.distance * 0.9)) % (width + 80) - 40;
            const py = 36 + ((index * 53) % Math.floor(height * 0.34));
            const radius = (index % 4 === 0 ? 1.8 : 1.1) + (game.overclockActive > 0 ? 0.3 : 0);
            ctx.fillStyle = `rgba(159, 233, 255, ${0.16 + (index % 5) * 0.04})`;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let side = 0; side < 2; side += 1) {
            for (let tower = 0; tower < 6; tower += 1) {
                const depth = 1 - tower / 6;
                const towerHeight = 36 + depth * 110;
                const towerWidth = 12 + depth * 18;
                const towerX = side === 0
                    ? width * 0.08 + tower * 18
                    : width * 0.92 - tower * 18 - towerWidth;
                const towerY = height * 0.26 + tower * 26;
                ctx.fillStyle = `rgba(${side === 0 ? '87,229,255' : '164,107,255'}, ${0.08 + depth * 0.18})`;
                ctx.fillRect(towerX, towerY, towerWidth, towerHeight);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(towerX + towerWidth * 0.18, towerY + 10, towerWidth * 0.2, towerHeight - 20);
            }
        }

        ctx.save();
        ctx.translate(width / 2, height * 0.52);
        ctx.strokeStyle = 'rgba(87,229,255,0.12)';
        ctx.lineWidth = 1;
        for (let index = 0; index < 12; index += 1) {
            const gridY = index * 24;
            ctx.beginPath();
            ctx.moveTo(-width * 0.44 + index * 8, gridY);
            ctx.lineTo(width * 0.44 - index * 8, gridY);
            ctx.stroke();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(roadNear.left, height);
        ctx.lineTo(roadFar.left, height * 0.18);
        ctx.lineTo(roadFar.right, height * 0.18);
        ctx.lineTo(roadNear.right, height);
        ctx.closePath();
        const roadGradient = ctx.createLinearGradient(0, height * 0.18, 0, height);
        roadGradient.addColorStop(0, 'rgba(18,28,54,0.6)');
        roadGradient.addColorStop(1, 'rgba(9,13,24,0.96)');
        ctx.fillStyle = roadGradient;
        ctx.fill();

        for (let streak = 0; streak < 14; streak += 1) {
            const offset = ((game.distance * (2.4 + streak * 0.08)) + streak * 26) % height;
            const alpha = 0.03 + (game.overclockActive > 0 ? 0.035 : 0);
            const laneGlowOffset = roadNearWidth * (0.15 + streak * 0.018);
            ctx.strokeStyle = `rgba(87,229,255,${alpha})`;
            ctx.lineWidth = 1 + (streak % 3 === 0 ? 1 : 0);
            ctx.beginPath();
            ctx.moveTo(roadNear.left + laneGlowOffset, height - offset);
            ctx.lineTo(roadFarCenter, height * 0.18 + offset * 0.08);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(roadNear.right - laneGlowOffset, height - offset);
            ctx.lineTo(roadFarCenter, height * 0.18 + offset * 0.08);
            ctx.stroke();
        }

        for (let boundaryIndex = 0; boundaryIndex <= 3; boundaryIndex += 1) {
            const topX = getLaneBoundaryX(boundaryIndex, width, 0);
            const bottomX = getLaneBoundaryX(boundaryIndex, width, 1);
            const isOuter = boundaryIndex === 0 || boundaryIndex === 3;
            ctx.strokeStyle = isOuter ? 'rgba(96,212,255,0.28)' : 'rgba(96,212,255,0.44)';
            ctx.lineWidth = isOuter ? 2.2 : 3;
            ctx.beginPath();
            ctx.moveTo(bottomX, height);
            ctx.lineTo(topX, height * 0.18);
            ctx.stroke();
        }

        const sortedObjects = [...game.objects].sort((a, b) => b.z - a.z);
        sortedObjects.forEach((obj) => {
            const { x, y, size } = projectObject(obj, width, height);
            if (obj.type === 'coin') {
                ctx.shadowBlur = 18;
                ctx.shadowColor = 'rgba(255,214,107,0.46)';
                ctx.fillStyle = '#ffd66b';
                ctx.beginPath();
                ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'rgba(14, 20, 32, 0.92)';
                ctx.font = `700 ${Math.max(10, size * 0.18)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('+', x, y);
            } else if (obj.type === 'energy') {
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(87,229,255,0.44)';
                ctx.fillStyle = '#57e5ff';
                ctx.beginPath();
                ctx.moveTo(x, y - size * 0.28);
                ctx.lineTo(x + size * 0.18, y);
                ctx.lineTo(x, y + size * 0.28);
                ctx.lineTo(x - size * 0.18, y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(14, 20, 32, 0.96)';
                ctx.font = `700 ${Math.max(10, size * 0.18)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\u26A1', x, y + 1);
            } else {
                ctx.shadowBlur = 18;
                ctx.shadowColor = obj.type === 'wall' ? 'rgba(255,106,136,0.38)' : obj.type === 'hurdle' ? 'rgba(255,149,79,0.32)' : 'rgba(157,134,255,0.36)';
                ctx.fillStyle = obj.type === 'wall' ? '#ff5f7f' : obj.type === 'hurdle' ? '#ff954f' : '#9d86ff';
                const objectWidth = obj.type === 'gate' ? size * 0.94 : size * 0.64;
                const objectHeight = obj.type === 'hurdle' ? size * 0.28 : size * 0.74;
                const top = obj.type === 'gate' ? y - size * 0.7 : y - objectHeight;
                ctx.fillRect(x - objectWidth / 2, top, objectWidth, objectHeight);
                ctx.strokeStyle = 'rgba(255,255,255,0.78)';
                ctx.lineWidth = Math.max(1.5, size * 0.035);
                ctx.strokeRect(x - objectWidth / 2, top, objectWidth, objectHeight);
                if (obj.type === 'gate') {
                    ctx.clearRect(x - objectWidth * 0.28, y - size * 0.3, objectWidth * 0.56, size * 0.3);
                    ctx.fillStyle = 'rgba(255,255,255,0.88)';
                    ctx.font = `800 ${Math.max(10, size * 0.16)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('\u2193', x, top + objectHeight * 0.22);
                } else if (obj.type === 'hurdle') {
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.font = `800 ${Math.max(10, size * 0.16)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('\u2191', x, top - Math.max(8, size * 0.14));
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.92)';
                    ctx.font = `800 ${Math.max(10, size * 0.18)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('!', x, top + objectHeight * 0.5);
                }
            }
            ctx.shadowBlur = 0;
        });

        game.pickupBursts.forEach((burst) => {
            const { x, y, size } = projectObject({ lane: burst.lane, z: burst.z }, width, height);
            const progress = 1 - (burst.life / burst.duration);
            const rise = 18 + progress * (22 + size * 0.26);
            const burstScale = 0.12 + progress * 0.11;
            const alpha = clamp(1 - progress * 1.05, 0, 1);
            const glowColor = burst.type === 'coin' ? '255,214,107' : '87,229,255';

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgba(${glowColor},0.82)`;
            ctx.lineWidth = Math.max(2, size * 0.05);
            ctx.beginPath();
            ctx.arc(x, y - rise * 0.18, size * burstScale, 0, Math.PI * 2);
            ctx.stroke();

            for (let index = 0; index < 4; index += 1) {
                const angle = (Math.PI * 2 * index) / 4 + progress * 1.6;
                const radius = size * (0.12 + progress * 0.18);
                const particleX = x + Math.cos(angle) * radius;
                const particleY = y - rise * 0.18 + Math.sin(angle) * radius * 0.55;
                ctx.fillStyle = `rgba(${glowColor},0.9)`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, Math.max(1.5, size * 0.032), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = `rgba(255,255,255,${0.98 * alpha})`;
            ctx.font = `800 ${Math.max(12, size * 0.18)}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(burst.label, x, y - rise - size * 0.24);
            ctx.restore();
        });

        const playerLaneProgress = getRoadProgressFromY(height * 0.88, height);
        const playerX = getLaneCenterX(game.x, width, playerLaneProgress);
        const playerY = height * 0.82 - game.y * height * 0.22 + (game.slideTimer > 0 ? 18 : 0);
        const bodyW = 34;
        const bodyH = game.slideTimer > 0 ? 28 : 52;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.beginPath();
        ctx.ellipse(playerX, height * 0.88, 28, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.shadowBlur = game.shieldTimer > 0 ? 28 : 16;
        ctx.shadowColor = game.shieldTimer > 0 ? '#9fe9ff' : '#57e5ff';
        if (game.overclockActive > 0) {
            ctx.fillStyle = 'rgba(87,229,255,0.16)';
            ctx.beginPath();
            ctx.moveTo(playerX, playerY - bodyH * 0.3);
            ctx.lineTo(playerX - 44, playerY + 26);
            ctx.lineTo(playerX + 44, playerY + 26);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = game.overclockActive > 0 ? '#ffffff' : '#57e5ff';
        ctx.fillRect(playerX - bodyW / 2, playerY - bodyH, bodyW, bodyH);
        ctx.fillStyle = '#a46bff';
        ctx.fillRect(playerX - bodyW * 0.34, playerY - bodyH - 16, bodyW * 0.68, 14);
        if (game.shieldTimer > 0) {
            ctx.strokeStyle = 'rgba(159,233,255,0.84)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(playerX, playerY - bodyH * 0.58, 34, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(0.24, flashAlpha)})`;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 14px Inter';
        ctx.fillText(playerProfile.lang === 'en' ? 'Swipe or buttons to control' : '手势或按钮控制', 18, 28);
        ctx.fillStyle = 'rgba(142,166,191,0.95)';
        ctx.fillText(playerProfile.lang === 'en' ? `Revives ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}` : `剩余复活 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);

        const liveBoostLabels = [];
        if (game.runGoldMultiplier > 1 || game.runSeasonXpMultiplier > 1) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'SETTLEMENT x1.25' : '结算 x1.25');
        }
        if (game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'FREE REVIVE READY' : '免费复活待命');
        }
        if (liveBoostLabels.length) {
            ctx.fillStyle = 'rgba(89,255,155,0.95)';
            ctx.fillText(liveBoostLabels.join(' / '), 18, 72);
        }

        if (compactScene) {
            const topHudHeight = liveBoostLabels.length ? 88 : 64;
            const leftHudWidth = Math.min(width * 0.64, 300);
            ctx.fillStyle = 'rgba(3,6,13,0.84)';
            ctx.fillRect(0, 0, leftHudWidth, topHudHeight);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = '600 14px Inter';
            ctx.fillText(playerProfile.lang === 'en' ? 'Swipe or buttons to control' : '手势或按钮控制', 18, 28);
            ctx.fillStyle = 'rgba(142,166,191,0.95)';
            ctx.fillText(playerProfile.lang === 'en' ? `Revives ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}` : `剩余复活 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);
            if (liveBoostLabels.length) {
                ctx.fillStyle = 'rgba(89,255,155,0.95)';
                ctx.fillText(liveBoostLabels.join(' / '), 18, 72);
            }
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(159,233,255,0.94)';
            ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width * 0.5, 28);
            ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
            ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '超频激活中') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '赛道稳定'), width * 0.5, 50);
            ctx.textAlign = 'left';
        } else {
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(159,233,255,0.94)';
            ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width - 18, 28);
            ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
            ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '超频激活中') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '赛道稳定'), width - 18, 50);
            ctx.textAlign = 'left';
        }

        if (!rect.width || !rect.height) {
            resizeCanvas();
        }
    }
    function resizeCanvas() {
        const rect = dom.canvasWrap.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const width = Math.max(320, Math.floor(rect.width));
        const height = Math.max(340, Math.floor(rect.height));
        dom.canvas.width = Math.floor(width * dpr);
        dom.canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderSceneV2();
    }

    function gameLoop(timestamp) {
        if (!game.lastTime) game.lastTime = timestamp;
        const dt = Math.min(0.033, (timestamp - game.lastTime) / 1000);
        game.lastTime = timestamp;
        updateGame(dt);
        renderSceneV2();
        requestAnimationFrame(gameLoop);
    }

    function handleAction(action) {
        if (!game.running || game.paused || game.awaitingRevive) return;
        if (action === 'left') moveLane(-1);
        if (action === 'right') moveLane(1);
        if (action === 'jump') jump();
        if (action === 'slide') slide();
    }

    function getCanvasTouchThresholds() {
        const rect = dom.canvasWrap.getBoundingClientRect();
        return {
            horizontal: Math.max(32, rect.width * 0.08),
            vertical: Math.max(28, rect.height * 0.12)
        };
    }

    function resolveTouchGestureAction(dx, dy) {
        const threshold = getCanvasTouchThresholds();
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold.horizontal) {
            return dx > 0 ? 'right' : 'left';
        }
        if (Math.abs(dy) > threshold.vertical) {
            return dy < 0 ? 'jump' : 'slide';
        }
        return '';
    }

    function resolveTouchTapAction(touch) {
        const rect = dom.canvasWrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return '';
        const relX = (touch.clientX - rect.left) / rect.width;
        const relY = (touch.clientY - rect.top) / rect.height;
        if (relX < 0.34) return 'left';
        if (relX > 0.66) return 'right';
        if (relY > 0.68) return 'slide';
        return 'jump';
    }

    function bindEvents() {
        dom.soundToggle.addEventListener('click', () => {
            playerProfile.soundEnabled = !playerProfile.soundEnabled;
            saveState();
            applyI18n();
            if (playerProfile.soundEnabled) {
                ensureAudio();
                playSfx('reward');
            }
        });

        dom.langToggle.addEventListener('click', () => {
            playerProfile.lang = playerProfile.lang === 'en' ? 'zh' : 'en';
            saveState();
            renderAll();
            renderSceneV2();
        });

        dom.runBriefBtn?.addEventListener('click', () => {
            openInfoModal('run-brief');
        });

        dom.startRunBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            startRun();
        });
        dom.restartRunBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            startRun();
        });
        dom.pauseBtn.addEventListener('click', pauseRun);
        dom.resumeBtn.addEventListener('click', resumeRun);
        dom.quitRunBtn.addEventListener('click', () => endRun(true));
        dom.reviveBtn.addEventListener('click', tryRevive);
        dom.skipReviveBtn.addEventListener('click', () => endRun());
        dom.skillBtn.addEventListener('click', useSkill);
        dom.overclockBtn.addEventListener('click', triggerOverclock);

        Array.from(document.querySelectorAll('[data-action]')).forEach((button) => {
            button.addEventListener('click', () => handleAction(button.dataset.action));
        });

        dom.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('.tab-btn');
            if (!button) return;
            switchTab(button.dataset.tab || 'run');
        });

        dom.panelContent.addEventListener('click', (event) => {
            const unlockButton = event.target.closest('[data-unlock]');
            if (unlockButton) {
                unlockEntry(unlockButton.dataset.unlock, unlockButton.dataset.id);
                return;
            }
            const upgradeButton = event.target.closest('[data-upgrade-loadout]');
            if (upgradeButton) {
                upgradeEntry(upgradeButton.dataset.upgradeLoadout, upgradeButton.dataset.id);
                return;
            }
            const equipButton = event.target.closest('[data-equip]');
            if (equipButton) {
                equipEntry(equipButton.dataset.equip, equipButton.dataset.id);
                return;
            }
            const claimButton = event.target.closest('[data-claim-mission]');
            if (claimButton) {
                claimMission(claimButton.dataset.claimMission);
                return;
            }
            const seasonClaimButton = event.target.closest('[data-claim-season]');
            if (seasonClaimButton) {
                claimSeasonReward(Number(seasonClaimButton.dataset.claimSeason));
                return;
            }
            const seasonPremiumClaimButton = event.target.closest('[data-claim-season-premium]');
            if (seasonPremiumClaimButton) {
                claimSeasonSponsorReward(Number(seasonPremiumClaimButton.dataset.claimSeasonPremium));
                return;
            }
            const rankClaimButton = event.target.closest('[data-claim-rank]');
            if (rankClaimButton) {
                claimRankReward(rankClaimButton.dataset.claimRank);
                return;
            }
            const shopBuyButton = event.target.closest('[data-buy-shop]');
            if (shopBuyButton) {
                purchaseShopOffer(shopBuyButton.dataset.buyShop);
                return;
            }
            const openModalButton = event.target.closest('[data-open-modal]');
            if (openModalButton) {
                openInfoModal(openModalButton.dataset.openModal);
                return;
            }
            const openTabButton = event.target.closest('[data-open-tab]');
            if (openTabButton) {
                closeInfoModal();
                switchTab(openTabButton.dataset.openTab || 'run');
                return;
            }
            const openPaymentButton = event.target.closest('[data-open-payment]');
            if (openPaymentButton) {
                openPaymentModal(openPaymentButton.dataset.openPayment || 'starter');
            }
        });

        dom.resultOverlay.addEventListener('click', (event) => {
            if (event.target === dom.resultOverlay) {
                closeResultOverlay();
                return;
            }
            const openModalButton = event.target.closest('[data-open-modal]');
            if (openModalButton) {
                openInfoModal(openModalButton.dataset.openModal);
                return;
            }
            const openTabButton = event.target.closest('[data-open-tab]');
            if (openTabButton) {
                switchTab(openTabButton.dataset.openTab || 'run');
            }
        });

        if (dom.resultCloseBtn) {
            dom.resultCloseBtn.addEventListener('click', closeResultOverlay);
        }

        dom.infoModalCloseBtn.addEventListener('click', closeInfoModal);
        dom.infoModal.addEventListener('click', (event) => {
            if (event.target === dom.infoModal) {
                closeInfoModal();
            }
        });

        dom.paymentCloseBtn?.addEventListener('click', closePaymentModal);
        dom.paymentModal?.addEventListener('click', (event) => {
            if (event.target === dom.paymentModal) {
                closePaymentModal();
            }
        });
        dom.paymentOfferGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-select-payment-offer]');
            if (!button) return;
            selectPaymentOffer(button.dataset.selectPaymentOffer || 'starter');
        });
        dom.paymentCopyAddressBtn?.addEventListener('click', copyPaymentAddress);
        dom.paymentCopyAmountBtn?.addEventListener('click', copyPaymentAmount);
        dom.paymentVerifyBtn?.addEventListener('click', handlePaymentConfirm);
        dom.paymentTxidInput?.addEventListener('input', () => {
            paymentVerificationState = paymentVerificationState === 'verified' ? 'verified' : 'idle';
            paymentVerificationError = '';
            paymentVerificationNotice = paymentVerificationState === 'verified' ? paymentVerificationNotice : '';
            refreshPaymentVerificationState();
        });
        dom.panelContent?.addEventListener('scroll', () => {
            panelScrollState[activeTab] = dom.panelContent?.scrollTop || 0;
        }, { passive: true });

        let touchStartX = 0;
        let touchStartY = 0;
        let touchActionHandled = false;
        dom.canvasWrap.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchActionHandled = false;
        }, { passive: true });

        dom.canvasWrap.addEventListener('touchmove', (event) => {
            if (touchActionHandled) return;
            const touch = event.changedTouches[0];
            const action = resolveTouchGestureAction(touch.clientX - touchStartX, touch.clientY - touchStartY);
            if (!action) return;
            touchActionHandled = true;
            handleAction(action);
        }, { passive: true });

        dom.canvasWrap.addEventListener('touchend', (event) => {
            const touch = event.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            if (touchActionHandled) {
                touchActionHandled = false;
                return;
            }
            const gestureAction = resolveTouchGestureAction(dx, dy);
            const tapAction = gestureAction || resolveTouchTapAction(touch);
            if (tapAction) {
                handleAction(tapAction);
            }
        }, { passive: true });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') handleAction('left');
            if (event.key === 'ArrowRight') handleAction('right');
            if (event.key === 'ArrowUp' || event.key === ' ') handleAction('jump');
            if (event.key === 'ArrowDown') handleAction('slide');
            if (event.key.toLowerCase() === 'p') {
                if (game.paused) resumeRun(); else pauseRun();
            }
            if (event.key.toLowerCase() === 'f') useSkill();
            if (event.key.toLowerCase() === 'r') triggerOverclock();
        });

        window.addEventListener('resize', resizeCanvas);
        window.visualViewport?.addEventListener('resize', resizeCanvas);
        window.visualViewport?.addEventListener('scroll', resizeCanvas);
        window.addEventListener('hashchange', () => {
            const nextTab = getTabFromHash();
            if (nextTab !== activeTab) {
                switchTab(nextTab, false);
            }
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && activeInfoModal) {
                closeInfoModal();
                return;
            }
            if (event.key === 'Escape' && dom.paymentModal && !dom.paymentModal.classList.contains('is-hidden')) {
                closePaymentModal();
            }
        });
    }

    bindEvents();
    renderAll();
    updateSeasonCountdownUI();
    updateMissionCountdownUI();
    updatePaymentExpiryUI();
    seasonCountdownTimer = window.setInterval(updateSeasonCountdownUI, 1000);
    missionCountdownTimer = window.setInterval(updateMissionCountdownUI, 1000);
    paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
    resizeCanvas();
    setOverlay(dom.startOverlay);
    requestAnimationFrame(gameLoop);
}());