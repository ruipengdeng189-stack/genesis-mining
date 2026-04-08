(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_runner_v1_save';
    const MAX_REVIVES = 2;
    const REVIVE_COST = 20;
    const SEASON_ANCHOR_UTC = Date.UTC(2026, 3, 7, 0, 0, 0);
    const SEASON_LENGTH_MS = 14 * 24 * 60 * 60 * 1000;

    const TEXT = {
        zh: {
            backHub: '返回大厅',
            runnerEyebrow: '高速跑酷原型',
            runnerTitle: '创世疾跑',
            runnerSubtitle: '三车道 · 霓虹闪避 · 爽快冲榜',
            goldLabel: '金币',
            coreLabel: '能核',
            bestLabel: '最佳距离',
            distanceLabel: '距离',
            scoreLabel: '积分',
            comboLabel: '连击',
            startKicker: 'NEON PROTOTYPE',
            startTitle: '准备冲刺',
            startDesc: '左右切道，上滑跳跃，下滑滑铲，尽可能吃满金币与能量。',
            startRun: '开始跑酷',
            pauseTitle: '已暂停',
            resumeRun: '继续',
            endRun: '结束本局',
            reviveKicker: 'SECOND CHANCE',
            reviveTitle: '是否立即复活？',
            reviveDesc: '本原型使用能核复活，不接真实支付。每局最多复活 2 次。',
            reviveBtn: '消耗 20 能核复活',
            skipRevive: '直接结算',
            resultKicker: 'RUN COMPLETE',
            resultTitle: '本局结算',
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
            prototypeShop: '此页仅展示商业化结构，当前未接真实支付。',
            runPanelTitle: '今日赛道',
            runPanelDesc: '短局爽感优先，核心是“再来一把”的高速循环。',
            runEvent1: '霓虹风暴',
            runEvent1Desc: '障碍刷新更快，但能量胶囊出现率提升。',
            runEvent2: '连击试炼',
            runEvent2Desc: '保持 20 连击后，金币得分加成大幅提高。',
            runEvent3: '赛季脉冲',
            runEvent3Desc: '每跑满 800m 额外获得赛季经验与冲榜分。',
            controlsTitle: '操作提示',
            controlsDesc: '手机支持左右 / 上下滑动，桌面也支持方向键与空格。',
            statCurrentRunner: '当前角色',
            statCurrentSkill: '主动技能',
            statCurrentPassive: '被动芯片',
            loadoutTitle: '装配配置',
            loadoutDesc: '先做数值框架：角色负责手感差异，技能承担中局逆转。',
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
            shopTitle: '商店预览',
            shopDesc: '这里只展示未来礼包结构，不会触发付费或扣款。',
            shopPreview: '仅预览',
            shopHot: '高转化',
            shopValue: '高价值',
            bestToast: '刷新最佳距离',
            runReadyToast: '赛道已加载，准备起跑',
            hitWall: '撞击障碍，冲刺中断',
            seasonReward: '赛季奖励预览',
            rankTitle: '冲榜评级',
            rankDesc: '距离、连击和无伤表现一起决定跑酷评分。',
            touchHint: '手势：左/右切道 · 上跳跃 · 下滑铲'
        },
        en: {
            backHub: 'Back To Hub',
            runnerEyebrow: 'High-Speed Runner Prototype',
            runnerTitle: 'Genesis Rush',
            runnerSubtitle: '3 Lanes · Neon Dodges · Rank Pressure',
            goldLabel: 'Gold',
            coreLabel: 'Cores',
            bestLabel: 'Best Distance',
            distanceLabel: 'Distance',
            scoreLabel: 'Score',
            comboLabel: 'Combo',
            startKicker: 'NEON PROTOTYPE',
            startTitle: 'Ready To Rush',
            startDesc: 'Switch lanes, jump, slide, and grab coins plus energy to extend the run.',
            startRun: 'Start Run',
            pauseTitle: 'Paused',
            resumeRun: 'Resume',
            endRun: 'End Run',
            reviveKicker: 'SECOND CHANCE',
            reviveTitle: 'Revive now?',
            reviveDesc: 'This prototype uses cores for revive and does not connect real payment. Max 2 revives per run.',
            reviveBtn: 'Spend 20 Cores',
            skipRevive: 'Settle Now',
            resultKicker: 'RUN COMPLETE',
            resultTitle: 'Run Results',
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
            prototypeShop: 'This page only previews monetization structure. No real payment is connected.',
            runPanelTitle: 'Today\'s Track',
            runPanelDesc: 'Short-run excitement first, designed around a fast one-more-run loop.',
            runEvent1: 'Neon Storm',
            runEvent1Desc: 'Faster obstacle pacing, but more energy capsules spawn.',
            runEvent2: 'Combo Trial',
            runEvent2Desc: 'Reach combo 20 and gold scoring ramps up sharply.',
            runEvent3: 'Season Pulse',
            runEvent3Desc: 'Every 800m grants extra season XP and ladder points.',
            controlsTitle: 'Controls',
            controlsDesc: 'Phones support swipe gestures. Desktop also supports arrows and space.',
            statCurrentRunner: 'Runner',
            statCurrentSkill: 'Active Skill',
            statCurrentPassive: 'Passive Chip',
            loadoutTitle: 'Loadout Setup',
            loadoutDesc: 'First prototype focuses on the number framework: runners shape feel, skills swing runs.',
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
            shopTitle: 'Shop Preview',
            shopDesc: 'This panel shows future packs only. No payment or charge happens here.',
            shopPreview: 'Preview Only',
            shopHot: 'Hot',
            shopValue: 'Value',
            bestToast: 'New best distance',
            runReadyToast: 'Track loaded. Ready to rush',
            hitWall: 'Obstacle hit. Run interrupted',
            seasonReward: 'Season reward preview',
            rankTitle: 'Rank Rating',
            rankDesc: 'Distance, combo and clean dodges together define your run rating.',
            touchHint: 'Gesture: left/right switch · up jump · down slide'
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

    const SHOP_OFFERS = [
        {
            id: 'starter',
            badge: 'hot',
            name: { zh: '起跑补给箱', en: 'Starter Supply' },
            desc: { zh: '适合首充：核心金币 + 入门护航。', en: 'Designed like an entry bundle with safe early momentum.' },
            items: [
                { zh: '金币 x 2,000', en: 'Gold x 2,000' },
                { zh: '能核 x 30', en: 'Cores x 30' },
                { zh: '赛季经验 x 80', en: 'Season XP x 80' }
            ]
        },
        {
            id: 'ladder',
            badge: 'value',
            name: { zh: '冲榜增幅包', en: 'Ladder Boost Pack' },
            desc: { zh: '更适合中后期，重点拉高超频循环和复活容错。', en: 'A mid/late-game structure focused on overclock flow and revive safety.' },
            items: [
                { zh: '能核 x 90', en: 'Cores x 90' },
                { zh: '黄金门票 x 1', en: 'Golden Ticket x 1' },
                { zh: '冲榜分加成 1 小时', en: '1h ladder score bonus' }
            ]
        },
        {
            id: 'season',
            badge: 'hot',
            name: { zh: '赛季通行证', en: 'Season Pass' },
            desc: { zh: '围绕每日任务、等级奖励和限定外观设计。', en: 'Built around daily missions, level rewards and a premium skin line.' },
            items: [
                { zh: '额外奖励轨道', en: 'Bonus reward track' },
                { zh: '专属霓虹尾迹', en: 'Exclusive neon trail' },
                { zh: '结算金币 +20%', en: '+20% settlement gold' }
            ]
        }
    ];

    const dom = {
        canvas: document.getElementById('runnerCanvas'),
        canvasWrap: document.getElementById('canvasWrap'),
        startOverlay: document.getElementById('startOverlay'),
        pauseOverlay: document.getElementById('pauseOverlay'),
        reviveOverlay: document.getElementById('reviveOverlay'),
        resultOverlay: document.getElementById('resultOverlay'),
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
        overclockBar: document.getElementById('overclockBar'),
        skillBar: document.getElementById('skillBar'),
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
        infoModalCloseBtn: document.getElementById('infoModalCloseBtn')
    };

    const ctx = dom.canvas.getContext('2d');

    function getTabFromHash() {
        const hash = String(window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
        return ['run', 'loadout', 'missions', 'season', 'shop'].includes(hash) ? hash : 'run';
    }

    let activeTab = getTabFromHash();
    let toastTimer = 0;
    let seasonCountdownTimer = 0;
    let audioCtx = null;
    let lastResult = null;
    let activeInfoModal = '';

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
        reviveCount: 0,
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
        message: ''
    };

    function t(key) {
        return (TEXT[playerProfile.lang] && TEXT[playerProfile.lang][key]) || key;
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
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
                missionsClaimed: { ...(parsed.missionsClaimed || {}) },
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

    function missionDefinitions() {
        return [
            {
                id: 'distance_600',
                tier: 'basic',
                title: { zh: '基础热身', en: 'Warm-Up Sprint' },
                desc: { zh: '单局跑到 600m。', en: 'Reach 600m in a single run.' },
                current: () => Math.min(Math.floor(Math.max(game.distance, playerProfile.bestDistance)), 600),
                target: 600,
                reward: { gold: 450, core: 8, xp: 35 }
            },
            {
                id: 'combo_20',
                tier: 'combo',
                title: { zh: '连击节奏', en: 'Combo Rhythm' },
                desc: { zh: '达成 20 连击。', en: 'Reach combo 20.' },
                current: () => Math.min(Math.max(game.maxCombo, playerProfile.stats.longestCombo), 20),
                target: 20,
                reward: { gold: 600, core: 10, xp: 40 }
            },
            {
                id: 'runs_4',
                tier: 'basic',
                title: { zh: '持续热机', en: 'Heat Loop' },
                desc: { zh: '累计进行 4 局跑酷。', en: 'Finish 4 total runs.' },
                current: () => Math.min(playerProfile.totalRuns, 4),
                target: 4,
                reward: { gold: 700, core: 12, xp: 50 }
            },
            {
                id: 'distance_4000',
                tier: 'elite',
                title: { zh: '长线冲刺', en: 'Longline Rush' },
                desc: { zh: '累计总里程达到 4,000m。', en: 'Reach 4,000m total distance.' },
                current: () => Math.min(playerProfile.totalDistance, 4000),
                target: 4000,
                reward: { gold: 1200, core: 24, xp: 80 }
            },
            {
                id: 'clean_1200',
                tier: 'elite',
                title: { zh: '零损疾行', en: 'Clean Velocity' },
                desc: { zh: '无碰撞跑到 1,200m。', en: 'Reach 1,200m with a clean no-hit run.' },
                current: () => Math.min(playerProfile.stats.bestCleanDistance || 0, 1200),
                target: 1200,
                reward: { gold: 1800, core: 36, xp: 110 }
            },
            {
                id: 'time_500_35',
                tier: 'timed',
                title: { zh: '限时热区', en: 'Timed Heat' },
                desc: { zh: '35 秒内冲到 500m。', en: 'Reach 500m within 35 seconds.' },
                current: () => {
                    if (playerProfile.stats.fastest500TimeMs && playerProfile.stats.fastest500TimeMs <= 35000) return 500;
                    if (game.running && game.elapsed <= 35) return Math.min(Math.floor(game.distance), 500);
                    return 0;
                },
                target: 500,
                reward: { gold: 1350, core: 22, xp: 90 }
            },
            {
                id: 'overclock_6',
                tier: 'combo',
                title: { zh: '超频上瘾', en: 'Overclock Fever' },
                desc: { zh: '累计触发 6 次超频冲刺。', en: 'Trigger overclock 6 times in total.' },
                current: () => Math.min(playerProfile.stats.overclockUses || 0, 6),
                target: 6,
                reward: { gold: 1500, core: 28, xp: 100 }
            }
        ];
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
                    title: { zh: '霓虹尾迹', en: 'Neon Trail' },
                    desc: { zh: '更像身份展示位的赛季限定拖尾。', en: 'A premium cosmetic trail that signals season participation.' },
                    label: { zh: '限定视觉预览', en: 'Exclusive cosmetic preview' }
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
                    title: { zh: '护盾换肤', en: 'Shield Skin' },
                    desc: { zh: '把主动技能也做成可展示资产。', en: 'Turns the active skill into something visually collectible too.' },
                    label: { zh: '技能外观预览', en: 'Skill cosmetic preview' }
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
                    title: { zh: '赛季头像框', en: 'Season Frame' },
                    desc: { zh: '强化赛季身份感与截图传播感。', en: 'Built for identity and screenshot-worthy account flair.' },
                    label: { zh: '头像框预览', en: 'Profile frame preview' }
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
                    desc: { zh: '如果以后接付费，这类会是非常自然的高价值奖励。', en: 'A natural premium-value item if the game later gains real monetization.' },
                    label: { zh: '任务加成预览', en: 'Mission boost preview' }
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
                    title: { zh: '电弧拖尾', en: 'Arc Sprint Trail' },
                    desc: { zh: '更夸张的视觉反馈，适合搭配高分玩家展示。', en: 'A more intense visual effect aimed at higher-performing players.' },
                    label: { zh: '高阶拖尾预览', en: 'Advanced trail preview' }
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
                    title: { zh: '商店折扣券', en: 'Shop Discount Ticket' },
                    desc: { zh: '给未来礼包系统预留更高层的商业化接口。', en: 'Reserved as a future high-value bridge into store offers.' },
                    label: { zh: '商店权益预览', en: 'Store perk preview' }
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
                    title: { zh: '冲榜姿态', en: 'Rank Pose' },
                    desc: { zh: '更偏荣誉展示与社交传播价值。', en: 'A prestige-facing reward meant for social proof and status.' },
                    label: { zh: '荣誉外观预览', en: 'Prestige cosmetic preview' }
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
                    title: { zh: '限定跑者皮肤', en: 'Season Runner Skin' },
                    desc: { zh: '把赛季尾部价值集中到高辨识度奖励上。', en: 'Concentrates tail-end value into a highly visible collectible.' },
                    label: { zh: '限定皮肤预览', en: 'Limited skin preview' }
                }
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
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'CURRENT PREVIEW' : '当前预估'}</div>
                        <h3>${localize(divisionInfo.tier.title)}</h3>
                        <strong>${formatNumber(settlementPreview.totalGold)} ${t('goldLabel')} / ${formatNumber(settlementPreview.totalCore)} ${t('coreLabel')}</strong>
                        <p>${playerProfile.lang === 'en'
                            ? 'Current preview = highest division reward reached this season + steady season level bonus.'
                            : '当前预估 = 本赛季达到的最高段位奖励 + 赛季等级提供的稳定活跃加成。'}</p>
                    </article>
                    <article class="modal-info-card">
                        <div class="eyebrow">${playerProfile.lang === 'en' ? 'SETTLEMENT RULE' : '结算规则'}</div>
                        <h3>${playerProfile.lang === 'en' ? 'Highest division wins' : '按本赛季最高段位结算'}</h3>
                        <p>${playerProfile.lang === 'en'
                            ? 'Once a higher division is reached, the seasonal settlement preview upgrades accordingly.'
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
        if (reward.label) {
            labels.push(localize(reward.label));
        }
        return labels.map((text) => `<span class="${className}">${text}</span>`).join('');
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
        document.body.classList.remove('modal-open');
    }

    function switchTab(tab, syncHash = true) {
        if (!['run', 'loadout', 'missions', 'season', 'shop'].includes(tab)) return;
        activeTab = tab;
        if (syncHash) {
            window.location.hash = activeTab;
        }
        renderPanel();
    }

    function getLoadoutAlertCount() {
        const runners = RUNNERS.filter((item) => !isUnlocked('runners', item) && canPurchaseUnlock(item)).length;
        const skills = ACTIVE_SKILLS.filter((item) => !isUnlocked('skills', item) && canPurchaseUnlock(item)).length;
        const passives = PASSIVES.filter((item) => !isUnlocked('passives', item) && canPurchaseUnlock(item)).length;
        return runners + skills + passives;
    }

    function updateTabBadges() {
        const missionCount = getClaimableMissionCount();
        const loadoutCount = getLoadoutAlertCount();
        const seasonCount = getClaimableSeasonRewardCount();
        Array.from(dom.tabBar.querySelectorAll('.tab-btn')).forEach((button) => {
            const tab = button.dataset.tab;
            const count = tab === 'missions'
                ? missionCount
                : tab === 'loadout'
                    ? loadoutCount
                    : tab === 'season'
                        ? seasonCount
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
        playerProfile.gold += mission.reward.gold;
        playerProfile.core += mission.reward.core;
        playerProfile.seasonXp += mission.reward.xp;
        saveState();
        playSfx('reward');
        showToast(t('missionClaimed'));
        renderAll();
    }

    function claimSeasonReward(level) {
        const reward = getSeasonRewards().find((item) => item.level === level);
        const state = reward ? getSeasonRewardState(reward.level) : null;
        if (!reward || !state || !state.claimable) return;
        playerProfile.seasonClaims[String(level)] = true;
        playerProfile.gold += reward.free.gold || 0;
        playerProfile.core += reward.free.core || 0;
        saveState();
        playSfx('reward');
        showToast(localize({ zh: `已领取 Lv.${level} 赛季奖励`, en: `Claimed season reward Lv.${level}` }));
        renderAll();
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

    function renderLoadoutTab() {
        const equippedRunner = getRunner(playerProfile.loadout.runner);
        const equippedSkill = getSkill(playerProfile.loadout.skill);
        const equippedPassive = getPassive(playerProfile.loadout.passive);
        const runnerCards = RUNNERS.map((runner) => {
            const owned = isUnlocked('runners', runner);
            const equipped = playerProfile.loadout.runner === runner.id;
            return `
                <article class="runner-card ${equipped ? 'is-active' : ''}">
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
                    ${owned
                        ? `<button class="primary-btn wide-btn" data-equip="runner" data-id="${runner.id}" type="button">${equipped ? t('runnerEquipped') : t('runnerEquip')}</button>`
                        : `<button class="ghost-btn wide-btn" data-unlock="runners" data-id="${runner.id}" type="button">${t('runnerUnlock')}</button>`}
                </article>
            `;
        }).join('');

        const skillCards = ACTIVE_SKILLS.map((skill) => {
            const owned = isUnlocked('skills', skill);
            const equipped = playerProfile.loadout.skill === skill.id;
            return `
                <article class="runner-card ${equipped ? 'is-active' : ''}">
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
                    ${owned
                        ? `<button class="primary-btn wide-btn" data-equip="skill" data-id="${skill.id}" type="button">${equipped ? t('runnerEquipped') : t('runnerEquip')}</button>`
                        : `<button class="ghost-btn wide-btn" data-unlock="skills" data-id="${skill.id}" type="button">${t('runnerUnlock')}</button>`}
                </article>
            `;
        }).join('');

        const passiveCards = PASSIVES.map((passive) => {
            const owned = isUnlocked('passives', passive);
            const equipped = playerProfile.loadout.passive === passive.id;
            return `
                <article class="runner-card ${equipped ? 'is-active' : ''}">
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
                    ${owned
                        ? `<button class="primary-btn wide-btn" data-equip="passive" data-id="${passive.id}" type="button">${equipped ? t('runnerEquipped') : t('runnerEquip')}</button>`
                        : `<button class="ghost-btn wide-btn" data-unlock="passives" data-id="${passive.id}" type="button">${t('runnerUnlock')}</button>`}
                </article>
            `;
        }).join('');

        return `
            <div class="card-grid">
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
        const missions = missionDefinitions()
            .map((mission) => ({ ...mission, state: getMissionState(mission) }))
            .sort((left, right) => {
                const leftRank = left.state.complete && !left.state.claimed ? 0 : !left.state.claimed ? 1 : 2;
                const rightRank = right.state.complete && !right.state.claimed ? 0 : !right.state.claimed ? 1 : 2;
                return leftRank - rightRank;
            });
        const claimableCount = missions.filter((mission) => mission.state.complete && !mission.state.claimed).length;
        return `
            <div class="card-grid">
                <article class="stat-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('missionsTitle')}</div>
                            <h3>${t('missionsDesc')}</h3>
                        </div>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot">${playerProfile.lang === 'en' ? `Claimable ${claimableCount}` : `可领取 ${claimableCount}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? `Total ${missions.length}` : `总任务 ${missions.length}`}</span>
                    </div>
                </article>
                ${missions.map((mission) => {
                    const { current, complete, claimed } = mission.state;
                    const progressPct = Math.max(0, Math.min(100, (current / mission.target) * 100));
                    return `
                        <article class="mission-card ${complete && !claimed ? 'is-claimable' : ''}">
                            <div class="card-title-row">
                                <div>
                                    <div class="eyebrow">${complete ? t('missionDone') : t('missionLocked')}</div>
                                    <h3>${localize(mission.title)}</h3>
                                </div>
                                <span class="pill">${formatNumber(current)} / ${formatNumber(mission.target)}</span>
                            </div>
                            <div class="panel-meta-row">
                                <span class="tier-pill ${mission.tier}">${missionTierLabel(mission.tier)}</span>
                            </div>
                            <p>${localize(mission.desc)}</p>
                            <div class="progress-track"><i style="width:${progressPct}%"></i></div>
                            <div class="reward-row">
                                <span class="reward-pill">${t('goldLabel')} +${formatNumber(mission.reward.gold)}</span>
                                <span class="reward-pill">${t('coreLabel')} +${formatNumber(mission.reward.core)}</span>
                                <span class="reward-pill">${t('seasonXp')} +${formatNumber(mission.reward.xp)}</span>
                            </div>
                            <button class="${complete && !claimed ? 'primary-btn' : 'ghost-btn'} wide-btn" ${complete && !claimed ? '' : 'disabled'} data-claim-mission="${mission.id}" type="button">
                                ${claimed ? t('missionDone') : t('missionClaim')}
                            </button>
                        </article>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderSeasonTab() {
        const level = calcSeasonLevel(playerProfile.seasonXp);
        const divisionInfo = getDivisionInfo();
        const settlementPreview = getSeasonSettlementPreview(divisionInfo, level);
        const currentXp = playerProfile.seasonXp % 120;
        const next = 120 - currentXp;
        const countdown = formatCountdown(getSeasonEndTime() - Date.now());
        const rewards = getSeasonRewards();
        const claimableCount = getClaimableSeasonRewardCount();
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
                        <span class="reward-pill">${playerProfile.lang === 'en' ? `Claimable ${formatNumber(claimableCount)}` : `可领取 ${formatNumber(claimableCount)}`}</span>
                    </div>
                    <div class="panel-meta-row">
                        <span class="pill hot" id="seasonCountdown">${playerProfile.lang === 'en' ? `Ends In ${countdown}` : `赛季剩余 ${countdown}`}</span>
                        <span class="pill">${playerProfile.lang === 'en' ? 'Free + Premium dual track' : '免费 + 高级双轨预览'}</span>
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
                                    <div class="eyebrow">${playerProfile.lang === 'en' ? 'PREMIUM TRACK' : '高级轨道'}</div>
                                    <h3>${playerProfile.lang === 'en' ? 'Preview the higher-value identity and monetization layer.' : '预览更偏身份感与付费价值的高阶奖励层。'}</h3>
                                </div>
                                <span class="pill">${playerProfile.lang === 'en' ? 'Preview only' : '仅展示预览'}</span>
                            </div>
                            <div class="season-node-row">
                                ${rewards.map((reward) => {
                                    const state = getSeasonRewardState(reward.level);
                                    return `
                                        <article class="season-node is-premium ${state.unlocked ? 'is-unlocked' : ''}">
                                            <div class="season-node-top">
                                                <span class="pill hot">Lv.${reward.level}</span>
                                                <span class="pill">${state.unlocked
                                                    ? localize({ zh: '已看到该层', en: 'Track reached' })
                                                    : localize({ zh: '待解锁预览', en: 'Preview locked' })}</span>
                                            </div>
                                            <div>
                                                <h3>${localize(reward.premium.title)}</h3>
                                                <p>${localize(reward.premium.desc)}</p>
                                            </div>
                                            <div class="reward-row">${renderRewardPills(reward.premium, 'shop-pill')}</div>
                                            <button class="ghost-btn wide-btn" type="button" disabled>${state.unlocked
                                                ? localize({ zh: '高级奖励预览', en: 'Premium Preview' })
                                                : localize({ zh: `Lv.${reward.level} 后开放`, en: `Opens at Lv.${reward.level}` })}</button>
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
                                ? 'Final preview = current highest division reward + season level activity bonus.'
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
        return `
            <div class="card-grid">
                <article class="stat-card showcase-card">
                    <div class="panel-title-row">
                        <div>
                            <div class="eyebrow">${t('shopTitle')}</div>
                            <h3>${t('shopDesc')}</h3>
                        </div>
                    </div>
                    <div class="reward-row">
                        <span class="reward-pill">${t('prototypeShop')}</span>
                    </div>
                    <div class="shop-kpi-grid">
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Best Distance' : '最佳距离'}</span>
                            <strong>${formatDistance(playerProfile.bestDistance)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Core Reserve' : '能核储备'}</span>
                            <strong>${formatNumber(playerProfile.core)}</strong>
                        </div>
                        <div class="shop-kpi">
                            <span class="mini-label">${playerProfile.lang === 'en' ? 'Gold Reserve' : '金币储备'}</span>
                            <strong>${formatNumber(playerProfile.gold)}</strong>
                        </div>
                    </div>
                </article>
                ${SHOP_OFFERS.map((offer, index) => `
                    <article class="shop-card ${offer.badge === 'hot' ? 'featured' : ''}">
                        <div class="card-title-row">
                            <div>
                                <div class="eyebrow">${offer.badge === 'hot' ? t('shopHot') : t('shopValue')}</div>
                                <h3>${localize(offer.name)}</h3>
                            </div>
                            <span class="pill ${offer.badge === 'hot' ? 'hot' : 'good'}">${t('shopPreview')}</span>
                        </div>
                        <p>${localize(offer.desc)}</p>
                        <div class="panel-meta-row">
                            <span class="shop-price">${playerProfile.lang === 'en' ? `$${(index + 1) * 2.99}` : `CNY ${(index + 1) * 18}`}</span>
                            <span class="pill">${playerProfile.lang === 'en' ? 'Structured for future monetization' : '未来可接商业化结构'}</span>
                        </div>
                        <div class="shop-meta">
                            ${offer.items.map((item) => `<span class="shop-pill">${localize(item)}</span>`).join('')}
                        </div>
                        <button class="ghost-btn wide-btn" type="button" disabled>${t('shopPreview')}</button>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderPanel() {
        const htmlByTab = {
            run: renderRunTab(),
            loadout: renderLoadoutTab(),
            missions: renderMissionsTab(),
            season: renderSeasonTab(),
            shop: renderShopTab()
        };
        dom.panelContent.innerHTML = htmlByTab[activeTab] || htmlByTab.run;
        updateTabBadges();
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
    }

    function renderAll() {
        applyI18n();
        renderSummary();
        renderHud();
        renderPanel();
        renderResultOverlayCard();
        if (activeInfoModal) {
            openInfoModal(activeInfoModal);
        }
    }

    function updateSeasonCountdownUI() {
        const node = document.getElementById('seasonCountdown');
        if (!node) return;
        const countdown = formatCountdown(getSeasonEndTime() - Date.now());
        node.textContent = playerProfile.lang === 'en' ? `Ends In ${countdown}` : `赛季剩余 ${countdown}`;
    }

    function showToast(message) {
        if (!message) return;
        dom.toast.textContent = message;
        dom.toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            dom.toast.classList.remove('is-visible');
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
        game.reviveCount = 0;
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
        renderHud();
    }

    function startRun() {
        resetRunState();
        hideOverlays();
        game.running = true;
        playSfx('start');
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
        const previousDivision = getDivisionInfo(getRunnerRankScore());
        const previousBestDistance = playerProfile.bestDistance;
        const perfectRun = !force && game.reviveCount === 0 && game.dodgeRun >= 12;
        const goldGain = Math.max(120, Math.floor(game.distance * 0.42 + game.coinsRun * 9 + game.maxCombo * 14));
        const coreGain = Math.max(2, Math.floor(game.distance / 260) + game.coreRun);
        const gradeInfo = getRunGrade(Math.floor(game.distance), game.maxCombo, game.hitless);
        playerProfile.gold += goldGain;
        playerProfile.core += coreGain;
        playerProfile.totalGoldEarned += goldGain;
        playerProfile.totalRuns += 1;
        playerProfile.totalDistance += Math.floor(game.distance);
        playerProfile.bestScore = Math.max(playerProfile.bestScore, Math.floor(game.score));
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
        playerProfile.bestDistance = Math.max(playerProfile.bestDistance, Math.floor(game.distance));
        playerProfile.seasonXp += Math.floor(game.distance / 60) + game.dodgeRun * 2;

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
            distance: Math.floor(game.distance),
            score: Math.floor(game.score),
            goldGain,
            coreGain,
            gradeInfo,
            divisionInfo,
            promoted,
            promotionText,
            settlementPreview,
            maxCombo: game.maxCombo,
            dodgeRun: game.dodgeRun,
            reviveCount: game.reviveCount,
            hitless: game.hitless
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
            game.hitless ? (playerProfile.lang === 'en' ? 'Clean Run' : '无伤完成') : (playerProfile.lang === 'en' ? 'Damaged Run' : '受损完成')
        ].map((text) => `<span class="reward-pill">${text}</span>`).join('');
        renderResultOverlayCard();
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
        if (playerProfile.core < REVIVE_COST) {
            showToast(t('notEnoughCore'));
            return;
        }
        playerProfile.core -= REVIVE_COST;
        saveState();
        game.awaitingRevive = false;
        game.running = true;
        game.paused = false;
        game.shieldTimer = 1.6;
        game.flashTimer = 0.8;
        game.objects = game.objects.filter((obj) => obj.z > 10);
        hideOverlays();
        playSfx('reward');
        showToast(t('revived'));
        renderAll();
    }

    function failRun() {
        game.running = false;
        if (game.reviveCount < MAX_REVIVES) {
            game.awaitingRevive = true;
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
        game.overclock = 100;
        game.overclockActive = 4.8;
        game.flashTimer = 0.55;
        playerProfile.stats.overclockUses = (playerProfile.stats.overclockUses || 0) + 1;
        saveState();
        playSfx('overclock');
        showToast(t('overclockActive'));
    }

    function spawnObject() {
        const roll = Math.random();
        const lane = Math.floor(Math.random() * 3);
        if (roll < 0.36) {
            game.objects.push({ type: 'coin', lane, z: 132 + Math.random() * 14, value: 1 });
            if (Math.random() < 0.45) {
                game.objects.push({ type: 'coin', lane, z: 142 + Math.random() * 10, value: 1 });
            }
            return;
        }
        if (roll < 0.5) {
            game.objects.push({ type: 'energy', lane, z: 132 + Math.random() * 12, value: 1 });
            return;
        }
        const obstacleType = roll < 0.7 ? 'wall' : roll < 0.85 ? 'hurdle' : 'gate';
        game.objects.push({ type: obstacleType, lane, z: 132 + Math.random() * 18, value: 1 });
        if (Math.random() < 0.22) {
            game.objects.push({
                type: Math.random() < 0.55 ? 'coin' : 'energy',
                lane: Math.floor(Math.random() * 3),
                z: 150 + Math.random() * 12,
                value: 1
            });
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
            } else {
                game.coreRun += 1;
                game.score += 50;
                game.overclock = Math.min(100, game.overclock + 8);
                playSfx('energy');
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

        game.speedCurrent = game.speedBase + Math.min(14, game.distance / 130) + (game.overclockActive > 0 ? 12 : 0);
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
            game.spawnTimer = Math.max(0.24, 0.82 - Math.min(0.48, game.distance / 2800));
        }

        game.objects.forEach((obj) => {
            obj.z -= game.speedCurrent * dt * 3.8;
            if (obj.type === 'coin' && passive.id === 'magnet' && Math.abs(obj.lane - game.lane) <= 1 && obj.z < 32) {
                obj.lane = game.lane;
            }
            if (obj.z <= 9) {
                handleCollision(obj);
            }
        });
        game.objects = game.objects.filter((obj) => !obj.remove && obj.z > -10);

        if (passive.id === 'resonance' && game.combo >= 12) {
            game.overclock = Math.min(100, game.overclock + dt * 4.5);
        }
        if (game.overclock >= 100 && game.elapsed - Math.floor(game.elapsed) < dt) {
            showToast(t('overclockReady'));
        }

        game.maxCombo = Math.max(game.maxCombo, game.combo);
        renderHud();
    }

    function projectObject(obj, width, height) {
        const perspective = Math.max(0.04, 1 - obj.z / 150);
        const roadHalf = 60 + perspective * width * 0.32;
        const x = width / 2 + (obj.lane - 1) * roadHalf * 0.72;
        const y = height * 0.12 + perspective * height * 0.78;
        const size = 18 + perspective * 64;
        return { x, y, size, perspective };
    }

    function renderScene() {
        const dpr = window.devicePixelRatio || 1;
        const rect = dom.canvas.getBoundingClientRect();
        const width = dom.canvas.width / dpr;
        const height = dom.canvas.height / dpr;

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
        ctx.moveTo(width * 0.14, height);
        ctx.lineTo(width * 0.38, height * 0.18);
        ctx.lineTo(width * 0.62, height * 0.18);
        ctx.lineTo(width * 0.86, height);
        ctx.closePath();
        const roadGradient = ctx.createLinearGradient(0, height * 0.18, 0, height);
        roadGradient.addColorStop(0, 'rgba(18,28,54,0.6)');
        roadGradient.addColorStop(1, 'rgba(9,13,24,0.96)');
        ctx.fillStyle = roadGradient;
        ctx.fill();

        for (let streak = 0; streak < 14; streak += 1) {
            const offset = ((game.distance * (2.4 + streak * 0.08)) + streak * 26) % height;
            const alpha = 0.03 + (game.overclockActive > 0 ? 0.035 : 0);
            ctx.strokeStyle = `rgba(87,229,255,${alpha})`;
            ctx.lineWidth = 1 + (streak % 3 === 0 ? 1 : 0);
            ctx.beginPath();
            ctx.moveTo(width * 0.28 + streak * 6, height - offset);
            ctx.lineTo(width * 0.5, height * 0.18 + offset * 0.08);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(width * 0.72 - streak * 6, height - offset);
            ctx.lineTo(width * 0.5, height * 0.18 + offset * 0.08);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(96,212,255,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height);
        ctx.lineTo(width * 0.5, height * 0.18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width * 0.32, height);
        ctx.lineTo(width * 0.46, height * 0.18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width * 0.68, height);
        ctx.lineTo(width * 0.54, height * 0.18);
        ctx.stroke();

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
            } else {
                ctx.shadowBlur = 16;
                ctx.shadowColor = obj.type === 'wall' ? 'rgba(255,106,136,0.32)' : obj.type === 'hurdle' ? 'rgba(255,214,107,0.24)' : 'rgba(157,134,255,0.32)';
                ctx.fillStyle = obj.type === 'wall' ? '#ff6a88' : obj.type === 'hurdle' ? '#ffd66b' : '#9d86ff';
                const w = obj.type === 'gate' ? size * 0.9 : size * 0.62;
                const h = obj.type === 'hurdle' ? size * 0.28 : size * 0.72;
                const top = obj.type === 'gate' ? y - size * 0.7 : y - h;
                ctx.fillRect(x - w / 2, top, w, h);
                if (obj.type === 'gate') {
                    ctx.clearRect(x - w * 0.28, y - size * 0.3, w * 0.56, size * 0.3);
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

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(159,233,255,0.94)';
        ctx.fillText(`${formatNumber(Math.floor(game.speedCurrent * 10))} km/h`, width - 18, 28);
        ctx.fillStyle = game.overclockActive > 0 ? 'rgba(255,214,107,0.95)' : 'rgba(142,166,191,0.95)';
        ctx.fillText(game.overclockActive > 0 ? (playerProfile.lang === 'en' ? 'OVERCLOCK LIVE' : '超频激活中') : (playerProfile.lang === 'en' ? 'TRACK STABLE' : '赛道稳定'), width - 18, 50);
        ctx.textAlign = 'left';

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
        renderScene();
    }

    function gameLoop(timestamp) {
        if (!game.lastTime) game.lastTime = timestamp;
        const dt = Math.min(0.033, (timestamp - game.lastTime) / 1000);
        game.lastTime = timestamp;
        updateGame(dt);
        renderScene();
        requestAnimationFrame(gameLoop);
    }

    function handleAction(action) {
        if (!game.running || game.paused || game.awaitingRevive) return;
        if (action === 'left') moveLane(-1);
        if (action === 'right') moveLane(1);
        if (action === 'jump') jump();
        if (action === 'slide') slide();
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
            renderScene();
        });

        dom.startRunBtn.addEventListener('click', startRun);
        dom.restartRunBtn.addEventListener('click', startRun);
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
            const openModalButton = event.target.closest('[data-open-modal]');
            if (openModalButton) {
                openInfoModal(openModalButton.dataset.openModal);
                return;
            }
            const openTabButton = event.target.closest('[data-open-tab]');
            if (openTabButton) {
                closeInfoModal();
                switchTab(openTabButton.dataset.openTab || 'run');
            }
        });

        dom.resultOverlay.addEventListener('click', (event) => {
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

        dom.infoModalCloseBtn.addEventListener('click', closeInfoModal);
        dom.infoModal.addEventListener('click', (event) => {
            if (event.target === dom.infoModal) {
                closeInfoModal();
            }
        });

        let touchStartX = 0;
        let touchStartY = 0;
        dom.canvasWrap.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        dom.canvasWrap.addEventListener('touchend', (event) => {
            const touch = event.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
                handleAction(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > 28) {
                handleAction(dy < 0 ? 'jump' : 'slide');
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
        window.addEventListener('hashchange', () => {
            const nextTab = getTabFromHash();
            if (nextTab !== activeTab) {
                switchTab(nextTab, false);
            }
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && activeInfoModal) {
                closeInfoModal();
            }
        });
    }

    bindEvents();
    renderAll();
    updateSeasonCountdownUI();
    seasonCountdownTimer = window.setInterval(updateSeasonCountdownUI, 1000);
    resizeCanvas();
    setOverlay(dom.startOverlay);
    requestAnimationFrame(gameLoop);
}());
