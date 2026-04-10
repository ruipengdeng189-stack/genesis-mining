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
            backHub: '返回大厅',
            runnerEyebrow: '高速跑酷正式版',
            runnerTitle: '创世疾跑',
            runnerSubtitle: '三车道 · 霓虹闪避 · 爽快冲榜',
            goldLabel: '金币',
            coreLabel: '能核',
            bestLabel: '最佳距离',
            distanceLabel: '距离',
            scoreLabel: '积分',
            comboLabel: '连击',
            startKicker: 'NEON RUSH',
            startTitle: '准备冲刺',
            startDesc: '左右切道，上滑跳跃，下滑滑铲，尽可能吃满金币与能量。',
            startRun: '开始跑酷',
            pauseTitle: '已暂停',
            resumeRun: '继续',
            endRun: '结束本局',
            reviveKicker: 'SECOND CHANCE',
            reviveTitle: '是否立即复活？',
            reviveDesc: '复活仅消耗能核。每局最多复活 2 次，充值奖励请前往商店验证领取。',
            reviveBtn: '消耗 20 能核复活',
            skipRevive: '直接结算',
            resultKicker: 'RUN COMPLETE',
            resultTitle: '本局结算',
            resultClose: '关闭',
            goldGainLabel: '金币收益',
            coreGainLabel: '能核收益',
            restartRun: '再来一局',
            overclockLabel: '超频',
            skillLabel: '技能冷却',
            leftBtn: '左移',
            jumpBtn: '跳跃',
            rightBtn: '右移',
            slideBtn: '滑铲',
            skillBtn: '释放技能',
            overclockBtn: '超频冲刺',
            pauseBtn: '暂停',
            tabRun: '跑酷',
            tabLoadout: '装配',
            tabMissions: '任务',
            tabSeason: '赛季',
            tabShop: '商店',
            pausedToast: '已暂停本局',
            resumedToast: '继续冲刺',
            overclockReady: '超频已充满',
            overclockActive: '进入超频冲刺',
            overclockNeed: '超频能量不足',
            skillShield: '护盾展开',
            skillDash: '相位冲刺启动',
            skillCooling: '技能冷却中',
            notEnoughGold: '金币不足',
            notEnoughCore: '能核不足，无法复活',
            revived: '复活成功，继续冲榜',
            missionClaimed: '任务奖励已领取',
            equipped: '已切换装配',
            unlocked: '解锁成功',
            topupShopInfo: '所有充值礼包都会在链上校验成功后即时发奖，并同步解锁赞助轨道。',
            runPanelTitle: '今日赛道',
            runPanelDesc: '短局爽感优先，核心是“再来一把”的高速循环。',
            runBriefEyebrow: '赛道简报',
            runBriefBtn: '查看详情',
            runEvent1: '霓虹风暴',
            runEvent1Desc: '障碍刷新更快，但能量胶囊出现率提升。',
            runEvent2: '连击试炼',
            runEvent2Desc: '保持 20 连击后，金币得分加成大幅提高。',
            runEvent3: '赛季脉冲',
            runEvent3Desc: '每跑满 800m 额外获得赛季经验与冲榜分。',
            legendCoin: '金币奖励',
            legendEnergy: '能量奖励',
            legendWall: '红色危险墙',
            legendGuide: '↑跳栏 · ↓滑门',
            newbieAssistBadge: '新手保护',
            newbieAssistHint: '首局前 900m 障碍减速并放缓刷新，先熟悉跳跃和滑铲节奏。',
            newbieAssistToast: '新手保护已开启：前 900m 障碍更慢、更易观察',
            controlsTitle: '操作提示',
            controlsDesc: '手机支持左右点击切道、上滑跳跃、下滑滑铲；桌面也支持方向键与空格。',
            statCurrentRunner: '当前角色',
            statCurrentSkill: '主动技能',
            statCurrentPassive: '被动芯片',
            loadoutTitle: '装配配置',
            loadoutDesc: '角色负责手感差异，技能负责关键逆转，被动芯片决定长期养成方向。',
            runnerTagStarter: '初始可用',
            runnerTagUnlock: '达成条件解锁',
            runnerEquip: '装备',
            runnerUnlock: '解锁',
            runnerEquipped: '已装备',
            skillSection: '技能模块',
            passiveSection: '被动芯片',
            missionsTitle: '任务中心',
            missionsDesc: '用任务拉起短期目标与回流节奏。',
            missionClaim: '领取奖励',
            missionDone: '已完成',
            missionLocked: '未完成',
            seasonTitle: '赛季轨道',
            seasonDesc: '赛季等级围绕活跃局数、里程和冲榜表现成长。',
            seasonLevel: '赛季等级',
            seasonXp: '赛季经验',
            seasonNext: '距离下一级',
            shopTitle: '补给商店',
            shopDesc: '使用游戏内资源换即时增益，直接强化接下来几局跑酷。',
            shopPreview: '仅预览',
            shopHot: '高转化',
            shopValue: '高价值',
            shopClaim: '免费领取',
            shopBuy: '立即购买',
            shopSoldOut: '今日售罄',
            shopUnavailable: '资源不足',
            freeReviveUsed: '已使用免费复活，继续冲榜',
            freeReviveReady: '本局已携带免费复活',
            bestToast: '刷新最佳距离',
            runReadyToast: '赛道已加载，准备起跑',
            hitWall: '撞击障碍，冲刺中断',
            seasonReward: '赛季奖励',
            rankTitle: '冲榜评级',
            rankDesc: '距离、连击和无伤表现一起决定跑酷评分。',
            touchHint: '点击左右切道 · 上滑跳跃 · 下滑滑铲'
        },
        en: {
            backHub: 'Back To Hub',
            runnerEyebrow: 'Full Runner Release',
            runnerTitle: 'Genesis Rush',
            runnerSubtitle: '3 Lanes · Neon Dodges · Rank Pressure',
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
            legendGuide: '↑ Jump · ↓ Slide',
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
            touchHint: 'Tap left/right to lane swap · swipe up jump · swipe down slide'
        }
    };

    const RUNNERS = [
        {
            id: 'flash',
            accent: '#57e5ff',
            title: { zh: '霓虹疾影', en: 'Neon Flash' },
            desc: { zh: '基础型高速角色，转向灵敏，适合作为默认上手机体。', en: 'Balanced starter runner with responsive lane changes.' },
            unlock: { type: 'default', value: 0 },
            stats: { speed: 1, combo: 1, control: 1.1 }
        },
        {
            id: 'volt',
            accent: '#ffd66b',
            title: { zh: '电弧穿梭者', en: 'Arc Volt' },
            desc: { zh: '偏向金币收益与能量循环，适合追求资源的中期角色。', en: 'Better gold flow and overclock gain for mid-game farming.' },
            unlock: { type: 'bestDistance', value: 900, gold: 1400 },
            stats: { speed: 1.06, combo: 1, control: 1 }
        },
        {
            id: 'prism',
            accent: '#a46bff',
            title: { zh: '棱镜裂空者', en: 'Prism Splitter' },
            desc: { zh: '高风险高收益，冲榜分与连击成长更强。', en: 'High-risk, high-reward runner built for ladder score pushes.' },
            unlock: { type: 'totalRuns', value: 6, gold: 2600 },
            stats: { speed: 1.08, combo: 1.15, control: 0.96 }
        }
    ];

    const ACTIVE_SKILLS = [
        {
            id: 'shield',
            title: { zh: '偏振护盾', en: 'Polar Shield' },
            desc: { zh: '获得 3 秒护盾，挡住一次致命撞击。', en: 'Gain a 3-second shield that blocks one fatal hit.' },
            unlock: { type: 'default', value: 0 },
            cooldown: 14
        },
        {
            id: 'dash',
            title: { zh: '相位冲刺', en: 'Phase Dash' },
            desc: { zh: '立刻清除前方近距离障碍并补充超频。', en: 'Clear nearby obstacles instantly and fill overclock.' },
            unlock: { type: 'seasonLevel', value: 3, gold: 1600 },
            cooldown: 12
        }
    ];

    const PASSIVES = [
        {
            id: 'magnet',
            title: { zh: '磁暴牵引', en: 'Magnet Pull' },
            desc: { zh: '吸附相邻车道的金币与能量。', en: 'Attract coins and energy from adjacent lanes.' },
            unlock: { type: 'default', value: 0 }
        },
        {
            id: 'resonance',
            title: { zh: '谐振回路', en: 'Resonance Loop' },
            desc: { zh: '高连击时超频增长更快，适合冲榜。', en: 'Boost overclock gain at high combo for ladder pushes.' },
            unlock: { type: 'totalDistance', value: 3000, gold: 2000 }
        }
    ];

    const RUNNER_PAYMENT_OFFERS = [
        {
            id: 'starter',
            price: 1.0,
            accent: '#57e5ff',
            badge: { zh: '首充推荐', en: 'Starter' },
            name: { zh: '起跑补给', en: 'Recovery Pack' },
            desc: { zh: '补足前期金币、能核与首轮增益，适合快速把节奏跑起来。', en: 'A steady first top-up that stabilizes gold, cores, and your first boost cycle.' },
            reward: { gold: 4000, core: 40, xp: 180, starterOverclockRuns: 2, settlementBoostRuns: 1 }
        },
        {
            id: 'accelerator',
            price: 2.99,
            accent: '#ff8fe8',
            badge: { zh: '高性价比', en: 'Value' },
            name: { zh: '超频推进包', en: 'Hyper Pack' },
            desc: { zh: '提高中期资源与超频循环，让跑局更容易进入爽点。', en: 'Builds a stronger mid-game loop with more resources and faster overclock pacing.' },
            reward: { gold: 12000, core: 120, xp: 460, starterOverclockRuns: 4, settlementBoostRuns: 3, freeRevives: 1 }
        },
        {
            id: 'rush',
            price: 3.99,
            accent: '#ffb168',
            badge: { zh: '冲榜包', en: 'Rush' },
            name: { zh: '冲榜脉冲包', en: 'Rank Surge Pack' },
            desc: { zh: '偏向高分追击，补足高压跑法需要的金币、经验与容错。', en: 'A ladder-focused bundle that supports high-score attempts with safer retries.' },
            reward: { gold: 20000, core: 180, xp: 720, starterOverclockRuns: 3, settlementBoostRuns: 5, freeRevives: 2 }
        },
        {
            id: 'sovereign',
            price: 5.99,
            accent: '#ffe27b',
            badge: { zh: '统治包', en: 'Core' },
            name: { zh: '统治协定', en: 'Dominance Pack' },
            desc: { zh: '一口气抬高后期养成强度，同时解锁本赛季赞助轨道。', en: 'A stronger late-loop injection that also makes the sponsor lane feel meaningful.' },
            reward: { gold: 42000, core: 320, xp: 1180, starterOverclockRuns: 5, settlementBoostRuns: 8, freeRevives: 3 }
        },
        {
            id: 'nexus',
            price: 9.99,
            accent: '#7dffb3',
            badge: { zh: '后期核心', en: 'Endgame' },
            name: { zh: '核心枢纽包', en: 'T4 Nexus Pack' },
            desc: { zh: '适合冲赛季后段与守榜，储备足够覆盖多轮高压尝试。', en: 'Designed for deep-season defense and multiple high-pressure scoring attempts.' },
            reward: { gold: 78000, core: 520, xp: 1800, starterOverclockRuns: 8, settlementBoostRuns: 12, freeRevives: 5 }
        },
        {
            id: 'throne',
            price: 12.99,
            accent: '#89c9ff',
            badge: { zh: '王座级', en: 'Summit' },
            name: { zh: '王座协议', en: 'Throne Protocol' },
            desc: { zh: '顶级礼包，覆盖冲榜、赛季、续航三条主线，直接进入后期推进节奏。', en: 'A top-end bundle that powers ladder, season, and sustain all at once.' },
            reward: { gold: 120000, core: 780, xp: 2600, starterOverclockRuns: 12, settlementBoostRuns: 18, freeRevives: 8 }
        }
    ];

    const FUNCTIONAL_SHOP_OFFERS = [
        {
            id: 'daily-cache',
            accent: '#57e5ff',
            stock: 1,
            title: { zh: '每日补给箱', en: 'Daily Supply Cache' },
            desc: { zh: '每天可免费领取一次，给你稳定的开局资源。', en: 'Free once per day to keep your session loop moving.' },
            cost: { gold: 0, core: 0 },
            reward: { gold: 520, core: 4 }
        },
        {
            id: 'core-crate',
            accent: '#ffd66b',
            stock: 2,
            title: { zh: '能核补充包', en: 'Core Refill Crate' },
            desc: { zh: '用金币换取更多能核，降低复活和技能试错压力。', en: 'Convert gold into cores so revives and retries feel less punishing.' },
            cost: { gold: 1600, core: 0 },
            reward: { gold: 0, core: 14 }
        },
        {
            id: 'battery-pack',
            accent: '#a46bff',
            stock: 2,
            title: { zh: '超频电池组', en: 'Overclock Battery Pack' },
            desc: { zh: '接下来 3 局开局自带额外超频能量，更容易进入爽点。', en: 'Your next 3 runs start with bonus overclock charge for a faster excitement curve.' },
            cost: { gold: 0, core: 10 },
            reward: { starterOverclockRuns: 3 }
        },
        {
            id: 'summit-contract',
            accent: '#59ff9b',
            stock: 1,
            title: { zh: '冲榜赞助合同', en: 'Summit Sponsor Contract' },
            desc: { zh: '接下来 3 局额外提高结算金币与赛季经验，并附带 1 次免费复活。', en: 'Boost the next 3 runs with extra settlement gold, season XP, and 1 free revive.' },
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

    function loadState() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) {
                localStorage.setItem(HUB_LANG_KEY, baseState.lang);
                return deepClone(baseState);
            }
            const parsed = JSON.parse(raw);
            return {
                ...deepClone(baseState),
                ...parsed,
                loadout: { ...deepClone(baseState.loadout), ...(parsed.loadout || {}) },
                unlocked: {
                    runners: Array.from(new Set([...(baseState.unlocked.runners || []), ...((parsed.unlocked && parsed.unlocked.runners) || [])])),
                    skills: Array.from(new Set([...(baseState.unlocked.skills || []), ...((parsed.unlocked && parsed.unlocked.skills) || [])])),
                    passives: Array.from(new Set([...(baseState.unlocked.passives || []), ...((parsed.unlocked && parsed.unlocked.passives) || [])]))
                },
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
                basic: '基础任务',
                combo: '连击任务',
                elite: '精英任务',
                timed: '限时任务'
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
                title: { zh: '日常脉冲：热机局数', en: 'Daily Pulse: Startup Runs' },
                desc: {
                    zh: `今日完成 ${formatNumber(3 + pulseScale)} 局跑酷。`,
                    en: `Finish ${formatNumber(3 + pulseScale)} runs today.`
                },
                current: () => Math.min(playerProfile.dailyStats.runs || 0, 3 + pulseScale),
                target: 3 + pulseScale,
                reward: buildMissionReward({ gold: 720, core: 12, xp: 52 }, chapter, 1 + pulseScale * 0.08)
            },
            {
                key: 'distance',
                tier: 'timed',
                title: { zh: '日常脉冲：里程拉满', en: 'Daily Pulse: Distance Feed' },
                desc: {
                    zh: `今日累计跑到 ${formatNumber(1800 + pulseScale * 420)}m。`,
                    en: `Reach ${formatNumber(1800 + pulseScale * 420)}m total distance today.`
                },
                current: () => Math.min(playerProfile.dailyStats.distance || 0, 1800 + pulseScale * 420),
                target: 1800 + pulseScale * 420,
                reward: buildMissionReward({ gold: 760, core: 12, xp: 56 }, chapter, 1 + pulseScale * 0.08)
            },
            {
                key: 'combo',
                tier: 'combo',
                title: { zh: '日常脉冲：连击手感', en: 'Daily Pulse: Combo Feel' },
                desc: {
                    zh: `今日达成 ${formatNumber(18 + pulseScale * 4)} 连击。`,
                    en: `Reach combo ${formatNumber(18 + pulseScale * 4)} today.`
                },
                current: () => Math.min(playerProfile.dailyStats.bestCombo || 0, 18 + pulseScale * 4),
                target: 18 + pulseScale * 4,
                reward: buildMissionReward({ gold: 820, core: 14, xp: 58 }, chapter, 1 + pulseScale * 0.09)
            },
            {
                key: 'score',
                tier: 'basic',
                title: { zh: '日常脉冲：高分校准', en: 'Daily Pulse: Score Calibration' },
                desc: {
                    zh: `今日单局积分达到 ${formatNumber(1500 + pulseScale * 320)}。`,
                    en: `Hit ${formatNumber(1500 + pulseScale * 320)} score in a run today.`
                },
                current: () => Math.min(playerProfile.dailyStats.bestScore || 0, 1500 + pulseScale * 320),
                target: 1500 + pulseScale * 320,
                reward: buildMissionReward({ gold: 860, core: 14, xp: 60 }, chapter, 1 + pulseScale * 0.1)
            },
            {
                key: 'clean',
                tier: 'elite',
                title: { zh: '日常脉冲：无伤推进', en: 'Daily Pulse: Clean Routing' },
                desc: {
                    zh: `今日无碰撞跑到 ${formatNumber(900 + pulseScale * 180)}m。`,
                    en: `Reach ${formatNumber(900 + pulseScale * 180)}m in a clean run today.`
                },
                current: () => Math.min(playerProfile.dailyStats.cleanDistance || 0, 900 + pulseScale * 180),
                target: 900 + pulseScale * 180,
                reward: buildMissionReward({ gold: 920, core: 16, xp: 66 }, chapter, 1 + pulseScale * 0.11)
            },
            {
                key: 'overclock',
                tier: 'combo',
                title: { zh: '日常脉冲：超频回路', en: 'Daily Pulse: Overclock Loop' },
                desc: {
                    zh: `今日触发 ${formatNumber(2 + Math.floor(pulseScale / 2))} 次超频。`,
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
                title: { zh: '章节主线：距离推进', en: 'Chapter Contract: Distance Push' },
                desc: {
                    zh: `单局跑到 ${formatNumber(600 + stage * 250)}m。`,
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
                title: { zh: '章节主线：持续热机', en: 'Chapter Contract: Heat Loop' },
                desc: {
                    zh: `累计完成 ${formatNumber(4 + stage * 2)} 局跑酷。`,
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
                title: { zh: '章节主线：连击节奏', en: 'Chapter Contract: Combo Rhythm' },
                desc: {
                    zh: `达成 ${formatNumber(18 + stage * 4)} 连击。`,
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
                title: { zh: '章节主线：高分稳定', en: 'Chapter Contract: Score Stability' },
                desc: {
                    zh: `单局积分达到 ${formatNumber(1000 + stage * 320)}。`,
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
                    title: { zh: '精英合约：总里程积压', en: 'Elite Contract: Distance Stack' },
                    desc: {
                        zh: `累计总里程达到 ${formatNumber(3200 + (chapter - 2) * 1800)}m。`,
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
                    title: { zh: '精英合约：无伤推进', en: 'Elite Contract: Clean Velocity' },
                    desc: {
                        zh: `无碰撞跑到 ${formatNumber(950 + (chapter - 2) * 220)}m。`,
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
                title: { zh: '精英合约：冲榜评级', en: 'Elite Contract: Ladder Rating' },
                desc: {
                    zh: `跑酷评分达到 ${formatNumber(1100 + (chapter - 4) * 260)}。`,
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
        if (unlock.type === 'bestDistance') return `最佳距离 ${unlock.value}m + ${unlock.gold || 0} 金币`;
        if (unlock.type === 'totalRuns') return `累计 ${unlock.value} 局 + ${unlock.gold || 0} 金币`;
        if (unlock.type === 'seasonLevel') return `赛季 ${unlock.value} 级 + ${unlock.gold || 0} 金币`;
        if (unlock.type === 'totalDistance') return `总里程 ${unlock.value}m + ${unlock.gold || 0} 金币`;
        return t('runnerTagUnlock');
    }

    function canPurchaseUnlock(def) {
        const unlock = def.unlock || {};
        return meetsUnlock(def) && (unlock.gold || 0) <= playerProfile.gold;
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
                    title: { zh: '启程补给', en: 'Kickoff Supply' },
                    desc: { zh: '给开季前几局补一波金币与能核，先把节奏跑起来。', en: 'A small early-season injection to stabilize your first few runs.' },
                    gold: 900,
                    core: 6
                },
                premium: {
                    title: { zh: '赞助启程礼', en: 'Sponsor Kickoff' },
                    desc: { zh: '解锁赞助轨道后，赛季前段就能额外拿到资源与起跑加速。', en: 'The sponsor lane starts paying immediately with resources and faster run starts.' },
                    gold: 1200,
                    core: 8,
                    xp: 60,
                    starterOverclockRuns: 1,
                    label: { zh: '限定尾迹 · 已入库', en: 'Season trail · stored' }
                }
            },
            {
                level: 4,
                free: {
                    title: { zh: '中段续航', en: 'Mid-Run Reserve' },
                    desc: { zh: '提高中段容错，适合继续冲更长距离。', en: 'More fuel for extending mid-length runs with less friction.' },
                    gold: 1400,
                    core: 10
                },
                premium: {
                    title: { zh: '护盾赞助补给', en: 'Shield Sponsor Cache' },
                    desc: { zh: '提高中段容错，给高压跑法补一层免费复活与能核。', en: 'Adds more retry safety with extra cores and a free revive for tougher runs.' },
                    core: 14,
                    freeRevives: 1,
                    label: { zh: '护盾换肤 · 已记录', en: 'Shield skin · archived' }
                }
            },
            {
                level: 6,
                free: {
                    title: { zh: '冲榜现金流', en: 'Ladder Cashflow' },
                    desc: { zh: '开始兼顾金币滚雪球与继续开局的资本。', en: 'Adds a stronger gold spike so the ladder loop can keep rolling.' },
                    gold: 2200,
                    core: 14
                },
                premium: {
                    title: { zh: '赛季框体礼', en: 'Season Frame Cache' },
                    desc: { zh: '这一档开始给出更强的冲榜续航，适合持续拉高评分。', en: 'From here the sponsor lane shifts toward longer ladder pressure and steadier scoring.' },
                    gold: 2400,
                    core: 10,
                    settlementBoostRuns: 2,
                    label: { zh: '赛季头像框 · 已记录', en: 'Season frame · archived' }
                }
            },
            {
                level: 8,
                free: {
                    title: { zh: '高压补仓', en: 'Pressure Refill' },
                    desc: { zh: '更适合进入高难节奏后的连续尝试。', en: 'Meant for the point where attempts get hotter and more frequent.' },
                    gold: 3200,
                    core: 22
                },
                premium: {
                    title: { zh: '任务增幅卡', en: 'Mission Boost Card' },
                    desc: { zh: '同步补强任务推进、起跑爆发和结算效率，适合中后期冲章节。', en: 'Supports chapter pushing with better starts, stronger settlements, and smoother mission flow.' },
                    gold: 3200,
                    xp: 120,
                    starterOverclockRuns: 2,
                    settlementBoostRuns: 1,
                    label: { zh: '任务加速权限', en: 'Mission boost access' }
                }
            },
            {
                level: 10,
                free: {
                    title: { zh: '冲刺能核箱', en: 'Core Surge Box' },
                    desc: { zh: '给后续复活、技能试错、极限冲榜留出空间。', en: 'Creates breathing room for revives, skill retries, and harder pushes.' },
                    gold: 4200,
                    core: 30
                },
                premium: {
                    title: { zh: '电弧冲刺礼', en: 'Arc Sprint Cache' },
                    desc: { zh: '后期容错压力开始上来，这一档重点补免费复活和核心资源。', en: 'Late-season attempts get sharper, so this tier leans into retry safety and core resources.' },
                    gold: 4200,
                    core: 24,
                    freeRevives: 1,
                    label: { zh: '高阶拖尾 · 已入库', en: 'Arc trail · stored' }
                }
            },
            {
                level: 12,
                free: {
                    title: { zh: '后期储备', en: 'Late Reserve' },
                    desc: { zh: '把后期每次开跑的资源焦虑再往下压一层。', en: 'Softens late-game resource pressure so repeat runs stay attractive.' },
                    gold: 5600,
                    core: 40
                },
                premium: {
                    title: { zh: '商店权限票', en: 'Store Access Ticket' },
                    desc: { zh: '把中后期的商店补给链拉长，让你更敢连续重开试更高分。', en: 'Expands your mid-to-late shop loop so repeated high-score attempts feel sustainable.' },
                    gold: 6200,
                    core: 28,
                    settlementBoostRuns: 2,
                    label: { zh: '商店权益已激活', en: 'Store perk activated' }
                }
            },
            {
                level: 14,
                free: {
                    title: { zh: '榜首推进器', en: 'Summit Push' },
                    desc: { zh: '更强金币包，方便冲前几名时持续重开。', en: 'A heavier gold drop built for repeated attempts near the summit.' },
                    gold: 7600,
                    core: 52
                },
                premium: {
                    title: { zh: '王座冲榜礼', en: 'Summit Prestige Cache' },
                    desc: { zh: '临近榜首时，这一档会明显提高开局速度与容错储备。', en: 'Near the summit, this tier pushes both early tempo and late-run safety much harder.' },
                    gold: 8400,
                    core: 36,
                    starterOverclockRuns: 2,
                    freeRevives: 1,
                    label: { zh: '荣誉姿态 · 已解锁', en: 'Prestige pose · unlocked' }
                }
            },
            {
                level: 16,
                free: {
                    title: { zh: '赛季终局补给', en: 'Season End Cache' },
                    desc: { zh: '最后一段资源回馈，让高活跃玩家有明确收尾目标。', en: 'A stronger end-of-track payout for players who stay active deep into the season.' },
                    gold: 9800,
                    core: 66
                },
                premium: {
                    title: { zh: '赛季王座礼', en: 'Season Throne Cache' },
                    desc: { zh: '赛季尾段的大额回馈，专门服务于冲榜守榜与高频重开。', en: 'A heavy end-of-season sponsor payout built for summit chasing and defense.' },
                    gold: 12000,
                    core: 48,
                    settlementBoostRuns: 3,
                    freeRevives: 2,
                    label: { zh: '限定跑者皮肤 · 已存档', en: 'Season skin · archived' }
                }
            }
        ];
    }

    function getRankRewards() {
        return [
            {
                id: 'rank_520',
                score: 520,
                title: { zh: '白银启封奖励', en: 'Silver Gate Cache' },
                desc: {
                    zh: '第一次把评分推到白银线后，立刻给一波继续冲分的起跑资源。',
                    en: 'Your first push into Silver should immediately fund a few stronger follow-up runs.'
                },
                reward: { gold: 1200, core: 10, starterOverclockRuns: 1 }
            },
            {
                id: 'rank_1180',
                score: 1180,
                title: { zh: '黄金追击奖励', en: 'Gold Chase Cache' },
                desc: {
                    zh: '到了黄金以后，开始需要更稳的中局节奏，因此补一层结算增益。',
                    en: 'Gold asks for more stable mid-run rhythm, so the reward shifts toward settlement power.'
                },
                reward: { gold: 2600, core: 16, settlementBoostRuns: 1 }
            },
            {
                id: 'rank_2060',
                score: 2060,
                title: { zh: '白金突破奖励', en: 'Platinum Break Cache' },
                desc: {
                    zh: '白金开始容错更重要，加入一次免费复活来支持极限尝试。',
                    en: 'At Platinum, retry tolerance matters more, so this one adds a free revive.'
                },
                reward: { gold: 4200, core: 24, freeRevives: 1 }
            },
            {
                id: 'rank_3320',
                score: 3320,
                title: { zh: '钻石稳压奖励', en: 'Diamond Pressure Cache' },
                desc: {
                    zh: '钻石段需要持续守节奏，因此同时补起跑爆发和结算收益。',
                    en: 'Diamond asks you to sustain pressure, so this reward supports both starts and settlements.'
                },
                reward: { gold: 6800, core: 36, starterOverclockRuns: 1, settlementBoostRuns: 2 }
            },
            {
                id: 'rank_4980',
                score: 4980,
                title: { zh: '传说封顶奖励', en: 'Legend Summit Cache' },
                desc: {
                    zh: '传说段是榜单荣誉门槛，奖励会明显更厚，用来支撑后续守榜。',
                    en: 'Legend is where prestige starts to matter, so the payout is noticeably heavier for ladder defense.'
                },
                reward: { gold: 9800, core: 52, freeRevives: 2, settlementBoostRuns: 2 }
            },
            {
                id: 'rank_6200',
                score: 6200,
                title: { zh: '赛季超载奖励', en: 'Season Overdrive Cache' },
                desc: {
                    zh: '超过传说线后，继续给一档顶段冲刺奖励，保持后期目标不空。',
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
            return localize({ zh: `超频开局 x${amount}`, en: `Boosted starts x${amount}` });
        }
        if (key === 'settlementBoostRuns') {
            return localize({ zh: `结算增益 x${amount}`, en: `Settlement boost x${amount}` });
        }
        if (key === 'freeRevives') {
            return localize({ zh: `免费复活 x${amount}`, en: `Free revives x${amount}` });
        }
        return amount;
    }

    function getBoostInventoryEntries() {
        return [
            {
                key: 'starterOverclockRuns',
                accent: '#a46bff',
                title: localize({ zh: '起跑超频', en: 'Starter Overclock' }),
                desc: localize({ zh: '每次消耗 1 局，开局额外携带 28% 超频能量，更快进入爽点。', en: 'Consumes 1 charge per run and starts you with +28% overclock.' }),
                count: playerProfile.boosts.starterOverclockRuns || 0
            },
            {
                key: 'settlementBoostRuns',
                accent: '#59ff9b',
                title: localize({ zh: '结算增益', en: 'Settlement Boost' }),
                desc: localize({ zh: '每次消耗 1 局，结算金币与赛季经验同时提升至 1.25 倍。', en: 'Consumes 1 charge per run and boosts settlement gold plus season XP to x1.25.' }),
                count: playerProfile.boosts.settlementBoostRuns || 0
            },
            {
                key: 'freeRevives',
                accent: '#57e5ff',
                title: localize({ zh: '免费复活', en: 'Free Revive' }),
                desc: localize({ zh: '保留到真正失误时才消耗，不会在开局白白浪费。', en: 'Stays stored until a real revive is used, so the charge is never wasted on run start.' }),
                count: playerProfile.boosts.freeRevives || 0
            }
        ];
    }

    function renderCostPills(cost = {}) {
        const labels = [];
        if (cost.gold) {
            labels.push(localize({ zh: `消耗金币 ${formatNumber(cost.gold)}`, en: `Costs ${formatNumber(cost.gold)} gold` }));
        }
        if (cost.core) {
            labels.push(localize({ zh: `消耗能核 ${formatNumber(cost.core)}`, en: `Costs ${formatNumber(cost.core)} cores` }));
        }
        if (!labels.length) {
            labels.push(localize({ zh: '免费领取', en: 'Free claim' }));
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
            else showToast(t('notEnoughCore'));
            return;
        }

        playerProfile.gold -= offer.cost.gold || 0;
        playerProfile.core -= offer.cost.core || 0;
        applyRewardBundle(offer.reward);
        playerProfile.shop.stock[id] = Math.max(0, remaining - 1);

        saveState();
        playSfx('reward');
        showToast(localize({
            zh: `${localize(offer.title)} 已入库`,
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
            return localize({ zh: '支付校验失败，请稍后重试。', en: 'Payment verification failed. Please try again.' });
        }
        if (lower.includes('txid not found')) {
            return localize({ zh: '未在 TRON 主网找到该 txid，请确认已上链。', en: 'This txid was not found on TRON mainnet yet.' });
        }
        if (lower.includes('not confirmed yet')) {
            return localize({ zh: '交易还未确认，请稍后再次校验。', en: 'This transfer is not confirmed yet. Try again shortly.' });
        }
        if (lower.includes('execution failed')) {
            return localize({ zh: '链上交易执行失败，无法发奖。', en: 'The on-chain transaction failed, so rewards cannot be granted.' });
        }
        if (lower.includes('not a trc20 contract transfer')) {
            return localize({ zh: '该交易不是 TRC20 转账。', en: 'This transaction is not a TRC20 transfer.' });
        }
        if (lower.includes('not trc20 usdt')) {
            return localize({ zh: '该交易不是 TRC20-USDT 转账。', en: 'This transaction is not a TRC20-USDT payment.' });
        }
        if (lower.includes('recipient address')) {
            return localize({ zh: '收款地址不匹配，请确认你转入的是当前订单地址。', en: 'Recipient address mismatch. Please send to the address shown in the current order.' });
        }
        if (lower.includes('amount mismatch')) {
            return localize({ zh: '支付金额与当前订单的精确金额不一致。', en: 'The payment amount does not match the current exact order amount.' });
        }
        if (lower.includes('before this order was created')) {
            return localize({ zh: '该交易早于订单创建时间，不能用于当前订单。', en: 'This transfer happened before the order was created and cannot be used.' });
        }
        if (lower.includes('after the order expired') || lower.includes('order expired')) {
            return localize({ zh: '订单已过期，请重新创建订单后再支付。', en: 'This order has expired. Create a new order before paying again.' });
        }
        if (lower.includes('already been used by another order') || lower.includes('another txid')) {
            return localize({ zh: '该 txid 已被其他订单使用。', en: 'This txid has already been used by another order.' });
        }
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) {
            return localize({ zh: '订单创建失败，请重新选择礼包。', en: 'Failed to create the payment order. Please select the pack again.' });
        }
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) {
            return localize({ zh: '支付接口暂时不可用，请稍后再试。', en: 'The payment service is temporarily unavailable. Please try again later.' });
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
            dom.paymentTitle.textContent = playerProfile.lang === 'en' ? 'Runner Top-Up Center' : '跑酷充值中心';
        }
        if (dom.paymentDesc) {
            dom.paymentDesc.textContent = playerProfile.lang === 'en'
                ? 'Create an on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant rewards.'
                : '先创建链上订单，再去 OKX Wallet 支付精确金额，最后粘贴 txid 校验并发放奖励。';
        }
        if (dom.paymentOrderLabel) dom.paymentOrderLabel.textContent = playerProfile.lang === 'en' ? 'Order ID' : '订单号';
        if (dom.paymentExactLabel) dom.paymentExactLabel.textContent = playerProfile.lang === 'en' ? 'Exact Amount' : '精确金额';
        if (dom.paymentExpiryLabel) dom.paymentExpiryLabel.textContent = playerProfile.lang === 'en' ? 'Expires In' : '剩余时间';
        if (dom.paymentAddressLabel) dom.paymentAddressLabel.textContent = playerProfile.lang === 'en' ? 'Receiving Address' : '收款地址';
        if (dom.paymentTxidLabel) dom.paymentTxidLabel.textContent = playerProfile.lang === 'en' ? 'Paste OKX Wallet txid' : '粘贴 OKX Wallet 的 txid';
        if (dom.paymentTxidInput) {
            dom.paymentTxidInput.placeholder = playerProfile.lang === 'en'
                ? 'Paste the on-chain txid from OKX Wallet'
                : '请输入或粘贴 OKX Wallet 的链上 txid';
        }
        if (dom.paymentTxidHint) {
            dom.paymentTxidHint.textContent = playerProfile.lang === 'en'
                ? 'Only payments that match the exact amount, recipient address, and valid time window can pass verification.'
                : '只有金额、收款地址和有效时间窗口全部匹配的订单，才能通过校验。';
        }
        if (dom.paymentCopyAddressBtn) dom.paymentCopyAddressBtn.textContent = playerProfile.lang === 'en' ? 'Copy Address' : '复制地址';
        if (dom.paymentCopyAmountBtn) dom.paymentCopyAmountBtn.textContent = playerProfile.lang === 'en' ? 'Copy Exact Amount' : '复制精确金额';
        if (dom.paymentVerifyBtn) dom.paymentVerifyBtn.textContent = playerProfile.lang === 'en' ? 'Verify TXID' : '校验 TXID';
        if (dom.paymentAmount) dom.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `$${offer.price.toFixed(2)} USDT`;
        if (dom.paymentMeta) {
            dom.paymentMeta.textContent = playerProfile.lang === 'en'
                ? `OKX Wallet · ${order?.network || 'TRON (TRC20)'} · ${localize(offer.name)}`
                : `OKX 钱包 · ${order?.network || 'TRON (TRC20)'} · ${localize(offer.name)}`;
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
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'Creating on-chain order…' : '正在创建链上订单…';
            dom.paymentVerifyBtn.disabled = true;
            dom.paymentCopyAddressBtn.disabled = true;
            dom.paymentCopyAmountBtn.disabled = true;
            return;
        }

        if (paymentVerificationState === 'verifying') {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'Verifying payment on-chain…' : '正在链上校验支付…';
            dom.paymentVerifyBtn.disabled = true;
            dom.paymentCopyAddressBtn.disabled = true;
            dom.paymentCopyAmountBtn.disabled = true;
            return;
        }

        dom.paymentCopyAddressBtn.disabled = false;
        dom.paymentCopyAmountBtn.disabled = false;

        if (paymentVerificationState === 'verified') {
            dom.paymentStatus.textContent = paymentVerificationNotice || (playerProfile.lang === 'en' ? 'Payment verified and reward granted.' : '支付已校验通过，奖励已发放。');
            dom.paymentStatus.classList.add('is-success');
            dom.paymentVerifyBtn.disabled = true;
            return;
        }

        if (orderExpired) {
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'This order has expired. Select the pack again to create a fresh order.' : '当前订单已过期，请重新选择礼包创建新订单。';
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
            dom.paymentStatus.textContent = playerProfile.lang === 'en' ? 'TXID format looks invalid. Please paste the 64-character on-chain txid.' : 'TXID 格式不正确，请粘贴 64 位链上 txid。';
            dom.paymentStatus.classList.add('is-error');
            dom.paymentVerifyBtn.disabled = true;
            return;
        }

        dom.paymentStatus.textContent = paymentVerificationNotice || (playerProfile.lang === 'en'
            ? 'Create an order, complete the payment in OKX Wallet, then paste the txid here.'
            : '先创建订单，再去 OKX Wallet 完成支付，最后把 txid 粘贴到这里校验。');
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
                    paymentVerificationError = error?.message || localize({ zh: '订单创建失败，请稍后重试。', en: 'Failed to create order. Please try again.' });
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
            ? localize({ zh: '收款地址已复制。', en: 'Receiving address copied.' })
            : localize({ zh: '自动复制不可用，请手动复制地址。', en: 'Automatic copy is unavailable. Please copy the address manually.' });
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
            ? localize({ zh: '精确金额已复制。', en: 'Exact amount copied.' })
            : localize({ zh: '自动复制不可用，请手动复制精确金额。', en: 'Automatic copy is unavailable. Please copy the exact amount manually.' });
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
            zh: `充值成功：${localize(offer.name)} 奖励已到账`,
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
            paymentVerificationError = localize({ zh: 'TXID 格式不正确，请检查后重新输入。', en: 'Invalid TXID format. Please check and try again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if ((playerProfile.payment.verifiedTxids || []).includes(txid)) {
            paymentVerificationError = localize({ zh: '该 txid 已经使用过，不能重复发奖。', en: 'This TXID has already been used and cannot grant rewards again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (!currentPaymentOrder || isPaymentOrderExpired(currentPaymentOrder)) {
            paymentVerificationError = localize({ zh: '当前订单已过期，请重新创建订单。', en: 'The current order has expired. Please create a new one.' });
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
                paymentVerificationNotice = localize({ zh: '该订单奖励已发放，无需重复领取。', en: 'Rewards for this order have already been granted.' });
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
                paymentVerificationNotice = localize({ zh: '链上校验成功，奖励已发放。', en: 'On-chain verification succeeded and rewards were granted.' });
                saveState();
            } catch (claimError) {
                paymentVerificationNotice = localize({
                    zh: '链上校验成功，奖励已到账；后台发奖记录将在稍后自动同步。',
                    en: 'On-chain verification succeeded and rewards were granted. Backend sync will retry automatically.'
                });
                console.warn('Runner payment claim sync queued.', { orderId, claimError });
            }
            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || localize({ zh: '支付校验失败，请稍后重试。', en: 'Payment verification failed. Please try again.' });
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
                title: { zh: '霓虹青铜', en: 'Neon Bronze' },
                short: { zh: '青铜', en: 'Bronze' },
                desc: { zh: '刚完成上手阶段，重点是把切道和连击节奏稳定下来。', en: 'Past the onboarding phase. Focus on stable lane reads and clean combo timing.' },
                settlement: { gold: 1800, core: 10 }
            },
            {
                id: 'silver',
                min: 520,
                color: '#d9f6ff',
                title: { zh: '疾影白银', en: 'Velocity Silver' },
                short: { zh: '白银', en: 'Silver' },
                desc: { zh: '开始具备连续冲刺能力，节奏和资源循环进入正反馈。', en: 'The run loop starts compounding and resource flow becomes smoother.' },
                settlement: { gold: 3200, core: 16 }
            },
            {
                id: 'gold',
                min: 1180,
                color: '#ffd66b',
                title: { zh: '脉冲黄金', en: 'Pulse Gold' },
                short: { zh: '黄金', en: 'Gold' },
                desc: { zh: '已经是可靠的冲榜层，连击和无伤表现会明显放大价值。', en: 'A reliable ladder tier where combo and clean routing amplify sharply.' },
                settlement: { gold: 5200, core: 28 }
            },
            {
                id: 'platinum',
                min: 2050,
                color: '#88ffe9',
                title: { zh: '弧光铂金', en: 'Arc Platinum' },
                short: { zh: '铂金', en: 'Platinum' },
                desc: { zh: '进入高压段位，开始拼稳定高分与更少失误。', en: 'High-pressure tier where consistency and cleaner execution matter more.' },
                settlement: { gold: 8200, core: 42 }
            },
            {
                id: 'diamond',
                min: 3300,
                color: '#b89cff',
                title: { zh: '裂隙钻石', en: 'Rift Diamond' },
                short: { zh: '钻石', en: 'Diamond' },
                desc: { zh: '具备明显荣誉感的高段位，适合赛季尾声发力冲刺。', en: 'A prestige tier with visible status and stronger late-season push value.' },
                settlement: { gold: 12800, core: 62 }
            },
            {
                id: 'apex',
                min: 5100,
                color: '#ff8dc7',
                title: { zh: '创世巅峰', en: 'Genesis Apex' },
                short: { zh: '巅峰', en: 'Apex' },
                desc: { zh: '当前赛季顶段，重心从晋升转为守榜与刷更高荣誉。', en: 'Current seasonal cap. The goal shifts from promotion to defending status.' },
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
                    <span>${playerProfile.lang === 'en' ? `${formatNumber(tier.min)}+ rating` : `${formatNumber(tier.min)}+ 段位分`}</span>
                </div>
                <div class="modal-rule-values">
                    <span>${t('goldLabel')} +${formatNumber(tier.settlement.gold)}</span>
                    <span>${t('coreLabel')} +${formatNumber(tier.settlement.core)}</span>
                </div>
            </div>
        `).join('');

        return {
            kicker: playerProfile.lang === 'en' ? 'SEASON MANUAL' : '赛季说明',
            title: playerProfile.lang === 'en' ? 'How division, settlement and activity fit together' : '段位、结算与活跃如何联动',
            desc: playerProfile.lang === 'en'
                ? 'A clear explanation of what to chase this season and why it matters.'
                : '把本赛季要追什么、为什么要追、结算怎么算，一次讲清楚。',
            body: `
                <div class="modal-info-grid">
                    <article class="modal-info-card featured">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CURRENT ESTIMATE' : '当前预估'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                        <strong>${formatNumber(settlementPreview.totalGold)} ${t('goldLabel')} / ${formatNumber(settlementPreview.totalCore)} ${t('coreLabel')}</strong>
                        <p>${playerProfile.lang === 'en'
                            ? 'Current estimate = highest division reward reached this season + steady season level bonus.'
                            : '当前预估 = 本赛季达到的最高段位奖励 + 赛季等级提供的稳定活跃加成。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'SETTLEMENT RULE' : '结算规则'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Highest division wins' : '按本赛季最高段位结算'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Once a higher division is reached, the seasonal settlement estimate upgrades accordingly.'
                            : '只要你在本赛季冲到更高段位，赛季结算预估就会同步升级，不需要一直停留在该段位。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'ACTIVITY BONUS' : '活跃加成'}</div>
                        <h3>${playerProfile.lang === 'en' ? `Season Lv.${seasonLevel}` : `赛季 Lv.${seasonLevel}`}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `Current activity bonus contributes ${formatNumber(settlementPreview.levelBonusGold)} gold and ${formatNumber(settlementPreview.levelBonusCore)} cores.`
                            : `当前活跃加成额外提供 ${formatNumber(settlementPreview.levelBonusGold)} 金币与 ${formatNumber(settlementPreview.levelBonusCore)} 能核。`}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CLIMB TIP' : '冲分建议'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Distance is not enough by itself' : '只堆距离还不够'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Combo length and clean runs weigh heavily in rating. Stable routing beats random risks.'
                            : '段位分不只看距离，连击和无伤表现权重也很高。稳定跑法比乱赌更容易冲段。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'LADDER BOUNTY' : '冲榜赏金'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Rating breakpoints also pay immediate rewards' : '关键评分档还会额外发即时奖励'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Besides season level rewards, rating milestones now grant gold, cores, and stored boosts that can be claimed immediately.'
                            : '除了赛季等级奖励外，跑酷评分达到关键档位后，也会立即开放金币、能核和增益储备奖励。'}</p>
                    </article>
                </div>
                <div class="modal-rule-list">
                    <div class="modal-rule-head">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION PAYOUT TABLE' : '段位结算表'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Every tier has a visible reward jump' : '每档段位都对应清晰的结算提升'}</h3>
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
            kicker: playerProfile.lang === 'en' ? 'MISSION MANUAL' : '任务手册',
            title: playerProfile.lang === 'en' ? 'Layered mission board rules' : '分层任务板规则',
            desc: playerProfile.lang === 'en'
                ? 'Explains how chapter contracts, daily pulse missions, and elite objectives work together.'
                : '把章节任务、每日脉冲和精英合约的推进关系一次讲清楚。',
            body: `
                <div class="modal-info-grid">
                    <article class="modal-info-card featured">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CURRENT BOARD' : '当前任务板'}</div>
                        <h3>${playerProfile.lang === 'en' ? `Chapter ${chapter}` : `第 ${chapter} 章`}</h3>
                        <strong>${playerProfile.lang === 'en' ? `${chapterClaimed}/${chapterContracts.length} chapter contracts claimed` : `已领取 ${chapterClaimed} / ${chapterContracts.length} 个章节合约`}</strong>
                        <p>${playerProfile.lang === 'en'
                            ? 'Claim every core and elite contract on the current board to unlock the next chapter immediately.'
                            : '当前章节的主线任务与精英合约全部领取后，会立即解锁下一章。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DAILY PULSE' : '每日脉冲'}</div>
                        <h3>${localize(pulseMission.title)}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `One rotating daily objective refreshes every local midnight. Current progress: ${formatNumber(pulseState.current)} / ${formatNumber(pulseMission.target)}.`
                            : `每天本地零点刷新 1 个脉冲任务。当前进度：${formatNumber(pulseState.current)} / ${formatNumber(pulseMission.target)}。`}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE CONTRACTS' : '精英合约'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Unlock from Chapter 2 onward' : '从第 2 章开始开放'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Elite objectives focus on total distance, clean routing, and later even ladder rating to keep late-game pressure meaningful.'
                            : '精英合约会把总里程、无伤表现，以及后续的冲榜评分都拉进任务体系，保证后期仍有追逐压力。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'SCALING' : '难度成长'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Targets rise with your chapter' : '目标会随章节抬升'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? `Daily targets scale every 2 chapters. Current pulse intensity tier: +${pulseScale}.`
                            : `每日任务每 2 章提升一档强度。当前脉冲强度档位：+${pulseScale}。`}</p>
                    </article>
                </div>
                <div class="modal-rule-list">
                    <div class="modal-rule-head">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'BOARD FLOW' : '任务板流程'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'The board is split into three layers' : '任务板分为三层推进'}</h3>
                        </div>
                    </div>
                    <div class="modal-rule-grid">
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'CORE' : '主线'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Distance · Runs · Combo · Score' : '距离 · 局数 · 连击 · 分数'}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'These are the backbone contracts of every chapter and are always required for advancement.'
                                : '这是每一章都会出现的核心合约，也是推进章节的刚性条件。'}</p>
                        </article>
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE' : '精英'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Total distance · Clean run · Ladder score' : '总里程 · 无伤 · 冲榜评分'}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'Elite objectives inject stronger mid and late-game pressure and reward better resources.'
                                : '精英合约专门负责中后期压力与更厚的资源回报。'}</p>
                        </article>
                        <article class="modal-info-card">
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'PULSE' : '脉冲'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'One daily rotating objective' : '每天 1 个轮换目标'}</h3>
                            <p>${playerProfile.lang === 'en'
                                ? 'Pulse missions are optional for chapter progression, but they accelerate gold, cores, and season XP noticeably.'
                                : '脉冲任务不强制推进章节，但能显著补充金币、能核与赛季经验。'}</p>
                        </article>
                    </div>
                </div>
            `
        };
    }

    function renderRunBriefModal() {
        return {
            kicker: playerProfile.lang === 'en' ? 'RUN BRIEF' : '赛道简报',
            title: playerProfile.lang === 'en' ? 'Track, boosts, and ladder overview' : '赛道、增益与榜单总览',
            desc: playerProfile.lang === 'en'
                ? 'Keep the main run screen clean, and open this panel whenever you want the full track briefing.'
                : '把跑酷主界面留给操作，把今日赛道、增益、段位与榜单情报集中到这里查看。',
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
                name: isPlayer ? localize({ zh: '你', en: 'YOU' }) : rivalNames[(rank * 3 + playerRank) % rivalNames.length],
                note: isPlayer
                    ? localize({ zh: '当前个人段位估算', en: 'Estimated current ladder slot' })
                    : rank < playerRank
                        ? localize({ zh: '前方竞争者', en: 'Target ahead' })
                        : localize({ zh: '后方追赶者', en: 'Pressure behind' }),
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
                zh: `距 ${localize(divisionInfo.nextTier.title)} 还差 ${formatNumber(divisionInfo.pointsToNext)} 分`,
                en: `${formatNumber(divisionInfo.pointsToNext)} rating to ${localize(divisionInfo.nextTier.title)}`
            })
            : localize({
                zh: '已到达本赛季当前最高段位，重点转为守榜与刷更高评分。',
                en: 'You are at the seasonal cap. The next goal is defending it with higher-rated runs.'
            });

        return `
            <article class="event-card division-card" style="--tier-color:${divisionInfo.tier.color};">
                <div class="card-title-row">
                    <div>
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION STATUS' : '段位状态'}</div>
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
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Expected settle' : '预计结算'} ${formatNumber(settlement.totalGold)} ${t('goldLabel')}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle cores' : '结算能核'} ${formatNumber(settlement.totalCore)}</span>
                    <span class="reward-pill">${divisionInfo.nextTier ? localize(divisionInfo.nextTier.title) : localize({ zh: '赛季顶段', en: 'Season Cap' })}</span>
                </div>
            </article>
        `;
    }

    function renderRewardPills(reward, className = 'reward-pill') {
        const labels = [];
        if (reward.gold) {
            labels.push(localize({ zh: `金币 +${formatNumber(reward.gold)}`, en: `Gold +${formatNumber(reward.gold)}` }));
        }
        if (reward.core) {
            labels.push(localize({ zh: `能核 +${formatNumber(reward.core)}`, en: `Cores +${formatNumber(reward.core)}` }));
        }
        if (reward.xp) {
            labels.push(localize({ zh: `赛季经验 +${formatNumber(reward.xp)}`, en: `Season XP +${formatNumber(reward.xp)}` }));
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
                    zh: `距 ${localize(divisionInfo.nextTier.title)} 还差 ${formatNumber(divisionInfo.pointsToNext)} 段位分`,
                    en: `${formatNumber(divisionInfo.pointsToNext)} rating to ${localize(divisionInfo.nextTier.title)}`
                })
                : localize({
                    zh: '已保持本赛季当前顶段，接下来就是继续拉高荣誉分。',
                    en: 'You are already sitting at the current seasonal cap.'
                });

        dom.resultRankPanel.innerHTML = `
            <div class="result-rank-card ${promoted ? 'is-promoted' : ''}" style="--tier-color:${divisionInfo.tier.color};">
                ${promoted ? `
                    <div class="promotion-banner">
                        <div class="overlay-kicker">${playerProfile.lang === 'en' ? 'DIVISION PROMOTION' : '段位晋升'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                        <p>${promotionText}</p>
                    </div>
                ` : ''}
                <div class="result-rank-head">
                    <div>
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'DIVISION RESULT' : '段位反馈'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                    </div>
                    <span class="pill ${promoted ? 'hot' : 'good'}">${promoted
                        ? localize({ zh: '晋升成功', en: 'Promoted' })
                        : localize(divisionInfo.tier.short)}</span>
                </div>
                <div class="result-rank-desc">
                    <strong>${detailText}</strong>
                    <p>${localize(divisionInfo.tier.desc)}</p>
                </div>
                <div class="progress-track division-track"><i style="width:${divisionInfo.progressPct}%"></i></div>
                <div class="reward-row">
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Rating' : '段位分'} ${formatNumber(divisionInfo.score)}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle Gold' : '结算金币'} ${formatNumber(settlementPreview.totalGold)}</span>
                    <span class="reward-pill">${playerProfile.lang === 'en' ? 'Settle Cores' : '结算能核'} ${formatNumber(settlementPreview.totalCore)}</span>
                </div>
                <div class="promotion-actions">
                    <button class="ghost-btn wide-btn" type="button" data-open-modal="season-rules">${playerProfile.lang === 'en' ? 'View Season Rules' : '查看赛季规则'}</button>
                    ${promoted
                        ? `<button class="primary-btn wide-btn" type="button" data-open-tab="season">${playerProfile.lang === 'en' ? 'Open Season Panel' : '打开赛季面板'}</button>`
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
        if (!ms) return playerProfile.lang === 'en' ? 'N/A' : '未达成';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milli = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milli).padStart(2, '0')}`;
    }

    function getRunGrade(distance, combo, hitless) {
        const value = distance + (combo * 34) + (hitless ? 280 : 0);
        if (value >= 2200) return { grade: 'S', color: '#ffd66b', text: playerProfile.lang === 'en' ? 'Perfect arc pressure. This run can contest the ladder.' : '极限压榜表现，这一局已经具备冲榜含金量。' };
        if (value >= 1500) return { grade: 'A', color: '#57e5ff', text: playerProfile.lang === 'en' ? 'Strong rhythm and clean routing. Very stable for repeat runs.' : '节奏稳定、路线干净，是很成熟的一次冲刺。' };
        if (value >= 900) return { grade: 'B', color: '#9fe9ff', text: playerProfile.lang === 'en' ? 'Solid growth run with room to push combo harder.' : '是一局不错的成长跑，但连击和躲避还能继续压榨。' };
        if (value >= 450) return { grade: 'C', color: '#ffb56b', text: playerProfile.lang === 'en' ? 'Warm-up level. Focus on lane reads and better timing.' : '热身局水平，先把读路和跳滑节奏再稳一点。' };
        return { grade: 'D', color: '#ff7d9b', text: playerProfile.lang === 'en' ? 'Early break. Try safer lane changes and save revive value.' : '开局断档较早，建议先稳切道并保留复活容错。' };
    }

    function renderStatBars(runner) {
        const rows = [
            { label: playerProfile.lang === 'en' ? 'Speed' : '速度', value: runner.stats.speed, max: 1.2 },
            { label: playerProfile.lang === 'en' ? 'Combo' : '连击', value: runner.stats.combo, max: 1.2 },
            { label: playerProfile.lang === 'en' ? 'Control' : '操控', value: runner.stats.control, max: 1.2 }
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
                    zh: `任务奖励已领取 · 已推进到第 ${advancedChapter} 章`,
                    en: `Mission reward claimed · advanced to Chapter ${advancedChapter}`
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
            localize({ zh: `已领取 Lv.${level} 赛季奖励`, en: `Claimed season reward Lv.${level}` }),
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
            localize({ zh: `已领取 Lv.${level} 赞助轨道奖励`, en: `Claimed sponsor reward Lv.${level}` }),
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
            localize({ zh: `已领取冲榜奖励`, en: 'Ladder reward claimed' }),
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

    function renderRunTab() {
        const runner = getRunner(playerProfile.loadout.runner);
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
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'RUN BOOSTS' : '运行增益'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Turn stored resources into stronger next runs' : '把储备资源直接转成接下来几局的爽点'}</h3>
                        </div>
                        <span class="pill ${readyBoostCount > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `${readyBoostCount} armed` : `已备战 ${readyBoostCount}`}</span>
                    </div>
                    <p>${playerProfile.lang === 'en'
                        ? 'Supply-shop boosts now affect real gameplay: faster overclock starts, stronger settlement, and safer revive flow.'
                        : '补给商店里的增益已经会真实作用到跑局里：更快开爽、更强结算、以及更稳的复活容错。'}</p>
                    <div class="reward-row">
                        ${liveBoosts.length
                            ? liveBoosts.map((entry) => `<span class="reward-pill">${playerProfile.lang === 'en' ? 'Live Now' : '本局生效'} · ${entry.title}</span>`).join('')
                            : `<span class="reward-pill">${playerProfile.lang === 'en' ? 'No temporary boost is active this run' : '当前没有生效中的临时增益'}</span>`}
                    </div>
                    <div class="boost-list">
                        ${boostEntries.map((entry) => `
                            <div class="boost-row ${entry.count > 0 || game.activeBoosts.includes(entry.key) ? 'is-live' : ''}" style="--boost-accent:${entry.accent};">
                                <div class="card-title-row">
                                    <div>
                                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'RESERVE' : '储备'}</div>
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
                            <h3>${playerProfile.lang === 'en' ? 'Track Pressure Feed' : '赛道压力情报'}</h3>
                        </div>
                        <span class="pill hot">x${runner.stats.speed.toFixed(2)}</span>
                    </div>
                    <p>${t('runEvent1Desc')}</p>
                    <div class="tag-row">
                        <span class="pill">${playerProfile.lang === 'en' ? 'Fastest 500m' : '500m 最快'} ${fastest500}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Best Clean' : '无伤最佳'} ${bestClean}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Overclock Uses' : '累计超频'} ${formatNumber(playerProfile.stats.overclockUses || 0)}</span>
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
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Best Combo' : '最高连击'} ${formatNumber(playerProfile.stats.longestCombo)}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Perfect Runs' : '无伤局数'} ${formatNumber(playerProfile.stats.perfectRuns)}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Total Runs' : '累计局数'} ${formatNumber(playerProfile.totalRuns)}</span>
                    </div>
                </article>

                ${renderDivisionCard(divisionInfo)}

                <article class="event-card leaderboard-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'LIVE LADDER' : '即时榜压'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Nearest Rivals' : '近身对手'}</h3>
                        </div>
                        <span class="pill hot">#${leaderboard.playerRank}</span>
                    </div>
                    <p>${leaderboard.playerRank === 1
                        ? localize({ zh: '你已经暂时站在榜首，接下来更重要的是守住优势与继续刷高评分。', en: 'You are temporarily holding rank #1. The next job is defending it with cleaner, higher-rated runs.' })
                        : localize({ zh: '榜单不只看距离，还会放大连击与无伤表现。越稳，冲榜越快。', en: 'The ladder amplifies combo and clean runs as well as distance. Stable routing climbs faster.' })}</p>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Run Rating' : '跑酷评分'} ${formatNumber(rankScore)}</span>
                        <span class="reward-pill">${leaderboard.playerRank === 1
                            ? localize({ zh: '你已占据榜首', en: 'You own the summit' })
                            : localize({ zh: `距上一名 ${formatNumber(leaderboard.nextGap)}`, en: `Gap to next ${formatNumber(leaderboard.nextGap)}` })}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? 'Tip: keep combo above 20' : '建议：连击尽量保持 20 以上'}</span>
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
                        <span class="pill">${playerProfile.lang === 'en' ? 'Combo' : '连击'} x${runner.stats.combo.toFixed(2)}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Control' : '操控'} x${runner.stats.control.toFixed(2)}</span>
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
                            <p>${playerProfile.lang === 'en' ? 'Current active loadout with runner, skill and passive synced.' : '当前生效中的跑者、主动技能与被动芯片组合。'}</p>
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
                    ? localize({ zh: '可领取', en: 'Ready To Claim' })
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
                            ? localize({ zh: '每日轮换', en: 'Daily Rotation' })
                            : mission.section === 'elite'
                                ? localize({ zh: '章节高压目标', en: 'Chapter Pressure Goal' })
                                : localize({ zh: `第 ${chapter} 章主线`, en: `Chapter ${chapter} Core` })}</span>
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
                        <button class="ghost-btn" type="button" data-open-modal="mission-rules">${playerProfile.lang === 'en' ? 'Rules' : '规则'}</button>
                    </div>
                    <div class="season-kpi-grid">
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Board Chapter' : '任务章节'}</span>
                            <strong>${playerProfile.lang === 'en' ? `Chapter ${chapter}` : `第 ${chapter} 章`}</strong>
                        </div>
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Ready Rewards' : '可领奖励'}</span>
                            <strong>${formatNumber(claimableCount)}</strong>
                        </div>
                        <div class="season-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Daily Reset' : '日常刷新'}</span>
                            <strong id="missionDailyReset">${playerProfile.lang === 'en' ? 'Updating…' : '更新中…'}</strong>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today runs ${formatNumber(dailyStats.runs)}` : `今日局数 ${formatNumber(dailyStats.runs)}`}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today best combo ${formatNumber(dailyStats.bestCombo)}` : `今日最高连击 ${formatNumber(dailyStats.bestCombo)}`}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Today clean ${formatNumber(dailyStats.cleanDistance)}m` : `今日无伤 ${formatNumber(dailyStats.cleanDistance)}m`}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot">${playerProfile.lang === 'en' ? `Claimable ${claimableCount}` : `可领取 ${claimableCount}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? `Active ${missions.length}` : `进行中 ${missions.length}`}</span>
                        <span class="pill">${playerProfile.lang === 'en'
                            ? 'Claim all chapter contracts to unlock the next chapter'
                            : '领取完当前章节合约后解锁下一章'}</span>
                    </div>
                </article>
                ${claimableMissions.length
                    ? `
                        <article class="event-card shop-section-card">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'READY NOW' : '立即可领'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Claimable contracts are pinned first' : '可领取任务已置顶显示'}</h3>
                                </div>
                                <span class="pill hot">${formatNumber(claimableMissions.length)}</span>
                            </div>
                            <p>${playerProfile.lang === 'en'
                                ? 'These rewards are already finished. Claim them first to unlock the next board faster.'
                                : '这些奖励已经达成，先领掉可以更快解锁下一章。'}</p>
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
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'DAILY PULSE' : '每日脉冲'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'One rotating daily mission keeps the session warm' : '轮换日常负责维持每日活跃节奏'}</h3>
                                </div>
                            </div>
                        </article>
                        ${pulseMissions.map(renderMissionCard).join('')}
                    `
                    : ''}
                <article class="event-card shop-section-card">
                    <div class="card-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'CORE CONTRACTS' : '章节主线'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Distance, runs, combo, and score define chapter pacing' : '距离、局数、连击、分数共同决定章节推进'}</h3>
                        </div>
                    </div>
                </article>
                ${coreMissions.map(renderMissionCard).join('')}
                ${eliteMissions.length
                    ? `
                        <article class="event-card shop-section-card">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'ELITE CONTRACTS' : '精英合约'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Mid / late-game pressure and bigger rewards live here' : '中后期压力与更厚奖励集中在这里'}</h3>
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
                        <span>${playerProfile.lang === 'en' ? `${formatNumber(tier.min)}+ rating` : `${formatNumber(tier.min)}+ 段位分`}</span>
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
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Claimable ${formatNumber(totalClaimableCount)}` : `可领取 ${formatNumber(totalClaimableCount)}`}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot" id="seasonCountdown">${playerProfile.lang === 'en' ? `Ends In ${countdown}` : `赛季剩余 ${countdown}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Free + Sponsor dual track' : '免费 + 赞助双轨'}</span>
                        <span class="pill ${rankClaimableCount > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `Ladder rewards ${formatNumber(rankClaimableCount)} ready` : `冲榜奖励待领 ${formatNumber(rankClaimableCount)}`}</span>
                    </div>
                    <div class="season-banner">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'Season Pulse' : '赛季脉冲'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Short sessions feed the pass, missions and ladder together.' : '短局活跃会同时喂养通行证、任务与冲榜节奏。'}</h3>
                        <div class="season-kpi-grid">
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Distance' : '最佳距离'}</span>
                                <strong>${formatDistance(playerProfile.bestDistance)}</strong>
                            </div>
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Score' : '最佳积分'}</span>
                                <strong>${formatNumber(playerProfile.bestScore)}</strong>
                            </div>
                            <div class="season-kpi">
                                <span class="mini-label">${playerProfile.lang === 'en' ? 'Total Distance' : '总里程'}</span>
                                <strong>${formatDistance(playerProfile.totalDistance)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="progress-track"><i style="width:${(currentXp / 120) * 100}%"></i></div>
                    <div class="season-rail">
                        <section class="season-lane">
                            <div class="season-lane-head">
                                <div>
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'FREE TRACK' : '免费轨道'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Claim practical resources as soon as levels unlock.' : '等级一到就能领取，主打实用资源补给。'}</h3>
                                </div>
                                <span class="pill good">${playerProfile.lang === 'en' ? `${claimableCount} ready` : `${claimableCount} 个待领`}</span>
                            </div>
                            <div class="season-node-row">
                                ${rewards.map((reward) => {
                                    const state = getSeasonRewardState(reward.level);
                                    const buttonLabel = state.claimed
                                        ? localize({ zh: '已领取', en: 'Claimed' })
                                        : state.claimable
                                            ? localize({ zh: '领取免费奖励', en: 'Claim Free Reward' })
                                            : localize({ zh: `Lv.${reward.level} 解锁`, en: `Unlock at Lv.${reward.level}` });
                                    const statusLabel = state.claimed
                                        ? localize({ zh: '已完成', en: 'Done' })
                                        : state.claimable
                                            ? localize({ zh: '可领取', en: 'Ready' })
                                            : localize({ zh: '未解锁', en: 'Locked' });
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
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'SPONSOR TRACK' : '赞助轨道'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Verified top-up unlocks a second reward lane with stronger seasonal payoffs.' : '完成链上校验后，开启第二条更偏中后期价值的赛季奖励轨道。'}</h3>
                                </div>
                                <span class="pill ${sponsorUnlocked ? 'good' : ''}">${sponsorUnlocked
                                    ? (playerProfile.lang === 'en' ? `${formatNumber(sponsorClaimableCount)} ready` : `待领 ${formatNumber(sponsorClaimableCount)}`)
                                    : (playerProfile.lang === 'en' ? 'Locked by top-up' : '充值后解锁')}</span>
                            </div>
                            <div class="season-node-row">
                                ${rewards.map((reward) => {
                                    const state = getSeasonSponsorRewardState(reward.level);
                                    const buttonLabel = !state.passUnlocked
                                        ? localize({ zh: '前往商店解锁', en: 'Unlock In Shop' })
                                        : state.claimed
                                            ? localize({ zh: '已领取', en: 'Claimed' })
                                            : state.claimable
                                                ? localize({ zh: '领取赞助奖励', en: 'Claim Sponsor Reward' })
                                                : localize({ zh: `Lv.${reward.level} 解锁`, en: `Unlock at Lv.${reward.level}` });
                                    return `
                                        <article class="season-node is-premium ${state.unlocked ? 'is-unlocked' : ''} ${state.claimable ? 'is-claimable' : ''} ${state.claimed ? 'is-claimed' : ''}">
                                            <div class="season-node-top">
                                                <span class="pill hot">Lv.${reward.level}</span>
                                                <span class="pill ${state.claimable ? 'good' : ''}">${!state.passUnlocked
                                                    ? localize({ zh: '未解锁', en: 'Locked' })
                                                    : state.claimed
                                                        ? localize({ zh: '已完成', en: 'Done' })
                                                        : state.claimable
                                                            ? localize({ zh: '可领取', en: 'Ready' })
                                                            : localize({ zh: '成长中', en: 'Progressing' })}</span>
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
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'LADDER BOUNTY' : '冲榜赏金'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Every major rating breakpoint now gives an instant chase reward.' : '每个关键评分档位都会给即时可领的冲榜回馈。'}</h3>
                        </div>
                        <span class="pill hot">#${leaderboard.playerRank}</span>
                    </div>
                    <div class="settlement-highlight">
                        <div>
                            <div class="mini-label">${playerProfile.lang === 'en' ? 'Current ladder status' : '当前冲榜状态'}</div>
                            <strong>${playerProfile.lang === 'en'
                                ? `Rating ${formatNumber(rankScore)} · ${localize(divisionInfo.tier.title)}`
                                : `评分 ${formatNumber(rankScore)} · ${localize(divisionInfo.tier.title)}`}</strong>
                            <p>${nextRankReward
                                ? (playerProfile.lang === 'en'
                                    ? `${formatNumber(Math.max(0, nextRankReward.score - rankScore))} rating to ${localize(nextRankReward.title)}.`
                                    : `距离 ${localize(nextRankReward.title)} 还差 ${formatNumber(Math.max(0, nextRankReward.score - rankScore))} 评分。`)
                                : (playerProfile.lang === 'en'
                                    ? 'All current ladder bounty tiers are already claimed. Keep defending the summit.'
                                    : '当前冲榜奖励已全部领取，接下来重点转为守榜与刷更高评分。')}</p>
                        </div>
                        <div class="reward-row">
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Nearest rival gap ${formatNumber(leaderboard.nextGap)}` : `距上一名 ${formatNumber(leaderboard.nextGap)}`}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Ready rewards ${formatNumber(rankClaimableCount)}` : `待领奖励 ${formatNumber(rankClaimableCount)}`}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? `Best distance ${formatDistance(playerProfile.bestDistance)}` : `最佳距离 ${formatDistance(playerProfile.bestDistance)}`}</span>
                        </div>
                    </div>
                    <div class="season-node-row">
                        ${rankRewards.map((reward) => {
                            const state = getRankRewardState(reward, rankScore);
                            const gap = Math.max(0, reward.score - rankScore);
                            const buttonLabel = state.claimed
                                ? localize({ zh: '已领取', en: 'Claimed' })
                                : state.claimable
                                    ? localize({ zh: '领取冲榜奖励', en: 'Claim Ladder Reward' })
                                    : localize({ zh: `还差 ${formatNumber(gap)}`, en: `${formatNumber(gap)} to go` });
                            return `
                                <article class="season-node ${state.claimable ? 'is-claimable' : ''} ${state.claimed ? 'is-claimed' : ''}">
                                    <div class="season-node-top">
                                        <span class="pill hot">${formatNumber(reward.score)}</span>
                                        <span class="pill ${state.claimable ? 'good' : ''}">${state.claimed
                                            ? localize({ zh: '已完成', en: 'Done' })
                                            : state.claimable
                                                ? localize({ zh: '可领取', en: 'Ready' })
                                                : localize({ zh: '冲榜中', en: 'Climbing' })}</span>
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
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'SEASON SETTLEMENT' : '赛季结算'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Clear rules, clear target, clear motivation.' : '把结算目标讲清楚，玩家才更愿意继续冲。'}</h3>
                        </div>
                        <span class="pill hot">${localize(divisionInfo.tier.short)}</span>
                    </div>
                    <div class="settlement-highlight">
                        <div>
                            <div class="mini-label">${playerProfile.lang === 'en' ? 'Current expected payout' : '当前预计结算'}</div>
                            <strong>${formatNumber(settlementPreview.totalGold)} ${t('goldLabel')} / ${formatNumber(settlementPreview.totalCore)} ${t('coreLabel')}</strong>
                            <p>${playerProfile.lang === 'en'
                                ? 'Final estimate = current highest division reward + season level activity bonus.'
                                : '当前预估 = 本赛季最高段位奖励 + 赛季等级活跃加成。'}</p>
                        </div>
                        <div class="reward-row">
                            <span class="reward-pill">${playerProfile.lang === 'en' ? 'Base reward' : '基础奖励'} ${formatNumber(settlementPreview.baseGold)} / ${formatNumber(settlementPreview.baseCore)}</span>
                            <span class="reward-pill">${playerProfile.lang === 'en' ? 'Level bonus' : '等级加成'} ${formatNumber(settlementPreview.levelBonusGold)} / ${formatNumber(settlementPreview.levelBonusCore)}</span>
                        </div>
                    </div>
                    <div class="settlement-grid">${settlementRows}</div>
                    <div class="panel-meta-row">
                        <span class="pill">${playerProfile.lang === 'en' ? 'Settlement uses the highest division reached this season.' : '赛季结算按本赛季达到的最高段位计算。'}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Season level adds a steady activity bonus.' : '赛季等级会额外提供稳定活跃加成。'}</span>
                    </div>
                    <div class="promotion-actions">
                        <button class="ghost-btn wide-btn" type="button" data-open-modal="season-rules">${playerProfile.lang === 'en' ? 'Read Full Season Rules' : '查看完整赛季规则'}</button>
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
                            <h3>${playerProfile.lang === 'en' ? 'Verified top-up, sponsor track, and live supplies all converge here.' : '真实充值、赞助轨道和实装补给统一收口到这个页面。'}</h3>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyOffers} live supply offers` : `实装补给 ${readyOffers} 项`}</span>
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `${readyBoostCount} stored boost types` : `增益储备 ${readyBoostCount} 类`}</span>
                        <span class="reward-pill">${t('topupShopInfo')}</span>
                    </div>
                    <div class="shop-kpi-grid">
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Verified Top-Ups' : '已校验充值'}</span>
                            <strong>${formatNumber(playerProfile.payment.purchaseCount || 0)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Sponsor Track' : '赞助轨道'}</span>
                            <strong>${sponsorUnlocked ? (playerProfile.lang === 'en' ? 'Unlocked' : '已解锁') : (playerProfile.lang === 'en' ? 'Locked' : '未解锁')}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Total Spent' : '累计充值'}</span>
                            <strong>$${totalSpentText}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Distance' : '最佳距离'}</span>
                            <strong>${formatDistance(playerProfile.bestDistance)}</strong>
                        </div>
                    </div>
                    <div class="runner-payment-cta">
                        <span class="pill ${sponsorUnlocked ? 'good' : 'hot'}">${sponsorUnlocked
                            ? (playerProfile.lang === 'en' ? 'Sponsor rewards are now claimable in Season' : '赛季页已开放赞助奖励')
                            : (playerProfile.lang === 'en' ? 'Any verified top-up unlocks the sponsor track' : '任意一笔校验成功的充值都会解锁赞助轨道')}</span>
                        <button class="primary-btn" type="button" data-open-payment="starter">${playerProfile.lang === 'en' ? 'Open Top-Up' : '打开充值'}</button>
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
                            <span class="shop-price">${playerProfile.lang === 'en' ? 'On-chain verified' : '链上校验发奖'}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'OKX Wallet · TRON (TRC20)' : 'OKX 钱包 · TRON (TRC20)'}</span>
                        </div>
                        <div class="shop-meta">
                            ${renderRewardPills(offer.reward, 'shop-pill')}
                        </div>
                        <button class="primary-btn wide-btn" type="button" data-open-payment="${offer.id}">${playerProfile.lang === 'en' ? 'Create Order & Pay' : '创建订单并支付'}</button>
                    </article>
                `).join('')}

                <article class="stat-card shop-section-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${playerProfile.lang === 'en' ? 'BOOST RESERVE' : '增益仓库'}</div>
                            <h3>${playerProfile.lang === 'en' ? 'Everything bought here feeds directly into the next sessions' : '这里买到的东西会直接喂给后续几局，不再只是展示'}</h3>
                        </div>
                    </div>
                    <div class="boost-list">
                        ${boostEntries.map((entry) => `
                            <div class="boost-row ${entry.count > 0 ? 'is-live' : ''}" style="--boost-accent:${entry.accent};">
                                <div class="card-title-row">
                                    <div>
                                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'STORED' : '已储备'}</div>
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
                                <div class="eyebrow">${playerProfile.lang === 'en' ? 'LIVE OFFER' : '实装补给'}</div>
                                <h3>${localize(offer.title)}</h3>
                            </div>
                            <span class="pill ${remaining > 0 ? 'good' : ''}">${playerProfile.lang === 'en' ? `${remaining}/${offer.stock} left` : `剩余 ${remaining}/${offer.stock}`}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${freeClaim ? localize({ zh: 'FREE', en: 'FREE' }) : localize({ zh: '即时生效', en: 'Instant effect' })}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'Affects your next runs immediately' : '立即作用到接下来几局'}</span>
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
        document.title = playerProfile.lang === 'en' ? 'Genesis Rush' : '创世疾跑';
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
            ? `${localize(runner.title)} · ${localize(divisionInfo.tier.title)} · #${leaderboard.playerRank}`
            : `${localize(runner.title)} · ${localize(divisionInfo.tier.title)} · 排名 #${leaderboard.playerRank}`;

        dom.runBriefMeta.textContent = playerProfile.lang === 'en'
            ? `${localize(skill.title)} / ${localize(passive.title)} · Open the full run brief for boosts, ladder, and track details.`
            : `${localize(skill.title)} / ${localize(passive.title)} · 点击查看完整赛道简报，集中浏览增益、榜单与赛道情报。`;
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
            dom.reviveBtn.textContent = localize({ zh: '免费复活', en: 'Free Revive' });
            descNode.textContent = localize({
                zh: '本局已携带 1 次免费复活，本次点击不会消耗能核。',
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
        node.textContent = playerProfile.lang === 'en' ? `Ends In ${countdown}` : `赛季剩余 ${countdown}`;
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
        node.textContent = playerProfile.lang === 'en' ? `Resets In ${countdown}` : `刷新剩余 ${countdown}`;
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
        game.skillCooldownMax = skill.cooldown;
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
        game.speedBase = 20 * runner.stats.speed;
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
        const previousDivision = getDivisionInfo(getRunnerRankScore());
        const previousBestDistance = playerProfile.bestDistance;
        const perfectRun = !force && game.reviveCount === 0 && game.dodgeRun >= 12;
        const runDistance = Math.floor(game.distance);
        const runScore = Math.floor(game.score);
        const baseGoldGain = Math.max(120, Math.floor(game.distance * 0.42 + game.coinsRun * 9 + game.maxCombo * 14));
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
                zh: `晋升成功：已进入 ${localize(divisionInfo.tier.title)}。`,
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
            playerProfile.lang === 'en' ? `Combo x${formatNumber(game.maxCombo)}` : `连击 x${formatNumber(game.maxCombo)}`,
            playerProfile.lang === 'en' ? `Dodges ${formatNumber(game.dodgeRun)}` : `闪避 ${formatNumber(game.dodgeRun)}`,
            playerProfile.lang === 'en' ? `Revives ${formatNumber(game.reviveCount)}` : `复活 ${formatNumber(game.reviveCount)}`,
            playerProfile.lang === 'en' ? `Season XP +${formatNumber(seasonXpGain)}` : `赛季经验 +${formatNumber(seasonXpGain)}`,
            game.runGoldMultiplier > 1 ? (playerProfile.lang === 'en' ? `Gold x${game.runGoldMultiplier.toFixed(2)}` : `金币倍率 x${game.runGoldMultiplier.toFixed(2)}`) : '',
            game.runSeasonXpMultiplier > 1 ? (playerProfile.lang === 'en' ? `XP x${game.runSeasonXpMultiplier.toFixed(2)}` : `经验倍率 x${game.runSeasonXpMultiplier.toFixed(2)}`) : '',
            game.freeReviveConsumed ? t('freeReviveUsed') : '',
            game.hitless ? (playerProfile.lang === 'en' ? 'Clean Run' : '无伤完成') : (playerProfile.lang === 'en' ? 'Damaged Run' : '受损完成')
        ].filter(Boolean).map((text) => `<span class="reward-pill">${text}</span>`).join('');
        renderResultOverlayCard();
        resetResultOverlayScroll();
        setOverlay(dom.resultOverlay);
        playSfx(promoted ? 'promote' : 'reward');
        if (promoted) {
            showToast(localize({ zh: `段位晋升：${localize(divisionInfo.tier.title)}`, en: `Promoted: ${localize(divisionInfo.tier.title)}` }));
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
        if (skill.id === 'shield') {
            game.shieldTimer = 3;
            showToast(t('skillShield'));
        } else if (skill.id === 'dash') {
            game.objects = game.objects.filter((obj) => !(obj.type !== 'coin' && obj.type !== 'energy' && obj.z < 28 && Math.abs(obj.lane - game.lane) <= 1));
            game.overclock = Math.min(100, game.overclock + 35);
            game.flashTimer = 0.45;
            showToast(t('skillDash'));
        }
        game.skillCooldown = skill.cooldown;
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
            ? localize({ zh: '+1 金币', en: '+1 Gold' })
            : localize({ zh: '+1 能核', en: '+1 Core' });
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
        const sameLane = obj.lane === game.lane;
        const nearLane = Math.abs(obj.lane - game.lane) <= 1;
        const canMagnet = passive.id === 'magnet' && nearLane;

        if ((obj.type === 'coin' || obj.type === 'energy') && (sameLane || canMagnet)) {
            if (obj.type === 'coin') {
                game.coinsRun += 1;
                game.score += 35 + game.combo * 2;
                game.overclock = Math.min(100, game.overclock + 1.5);
                playSfx('coin');
                spawnPickupBurst('coin', obj);
            } else {
                game.coreRun += 1;
                game.score += 50;
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
            game.score += 70 * game.combo;
            game.overclock = Math.min(100, game.overclock + 4);
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
        const passive = getPassive(playerProfile.loadout.passive);
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
        game.score += game.speedCurrent * dt * 4 + game.combo * dt * 8;
        if (!game.timeAt500 && game.distance >= 500) {
            game.timeAt500 = Math.floor(game.elapsed * 1000);
        }

        game.x += (game.targetLane - game.x) * Math.min(1, dt * 10 * runner.stats.control);
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
            if ((obj.type === 'coin' || obj.type === 'energy') && passive.id === 'magnet' && Math.abs(obj.lane - game.lane) <= 1 && obj.z < 32) {
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

        if (passive.id === 'resonance' && game.combo >= 12) {
            game.overclock = Math.min(100, game.overclock + dt * 4.5);
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

        for (let side = 0; side < (compactScene ? 1 : 2); side += 1) {
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
                ctx.fillText('⚡', x, y + 1);
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
                    ctx.fillText('↓', x, top + h * 0.22);
                } else if (obj.type === 'hurdle') {
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.font = `800 ${Math.max(10, size * 0.16)}px Inter`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('↑', x, top - Math.max(8, size * 0.14));
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
        ctx.fillText(playerProfile.lang === 'en' ? 'Swipe or buttons to control' : '手势或按钮控制', 18, 28);
        ctx.fillStyle = 'rgba(142,166,191,0.95)';
        ctx.fillText(playerProfile.lang === 'en' ? `Revives ${MAX_REVIVES - game.reviveCount}/${MAX_REVIVES}` : `剩余复活 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);
        const liveBoostLabels = [];
        if (game.runGoldMultiplier > 1 || game.runSeasonXpMultiplier > 1) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'SETTLEMENT x1.25' : '结算 x1.25');
        }
        if (game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'FREE REVIVE READY' : '免费复活待命');
        }
        if (liveBoostLabels.length) {
            ctx.fillStyle = 'rgba(89,255,155,0.95)';
            ctx.fillText(liveBoostLabels.join(' · '), 18, 72);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(159,233,255,0.94)';
        ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width - 18, 28);
        ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
        ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '超频激活中') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '赛道稳定'), width - 18, 50);
        ctx.textAlign = 'left';

        if (compactScene) {
            const topHudHeight = liveBoostLabels.length ? 88 : 64;
            const leftHudWidth = Math.min(width * 0.58, 280);
            ctx.fillStyle = 'rgba(3,6,13,0.84)';
            ctx.fillRect(0, 0, leftHudWidth, topHudHeight);
            ctx.fillStyle = 'rgba(3,6,13,0.98)';
            ctx.fillRect(width * 0.7, 0, width * 0.3, 70);
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

        for (let side = 0; side < (compactScene ? 1 : 2); side += 1) {
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
        ctx.fillText(playerProfile.lang === 'en' ? `Revives ${MAX_REVIVES - game.reviveCount}/${MAX_REVIVES}` : `剩余复活 ${Math.max(0, MAX_REVIVES - game.reviveCount)}/${MAX_REVIVES}`, 18, 50);
        const liveBoostLabels = [];
        if (game.runGoldMultiplier > 1 || game.runSeasonXpMultiplier > 1) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'SETTLEMENT x1.25' : '结算 x1.25');
        }
        if (game.freeReviveAvailable && (playerProfile.boosts.freeRevives || 0) > 0) {
            liveBoostLabels.push(playerProfile.lang === 'en' ? 'FREE REVIVE READY' : '免费复活待命');
        }
        if (liveBoostLabels.length) {
            ctx.fillStyle = 'rgba(89,255,155,0.95)';
            ctx.fillText(liveBoostLabels.join(' 路 '), 18, 72);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(159,233,255,0.94)';
        ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width - 18, 28);
        ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
        ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '超频激活中') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '赛道稳定'), width - 18, 50);
        ctx.textAlign = 'left';

        if (compactScene) {
            const topHudHeight = liveBoostLabels.length ? 88 : 64;
            const leftHudWidth = Math.min(width * 0.58, 280);
            ctx.fillStyle = 'rgba(3,6,13,0.84)';
            ctx.fillRect(0, 0, leftHudWidth, topHudHeight);
            ctx.fillStyle = 'rgba(3,6,13,0.98)';
            ctx.fillRect(width * 0.7, 0, width * 0.3, 70);
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
