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
    const DEFENSE_DEBUG_ENABLED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

    const TEXT = {
        zh: {
            pageTitle: '创世防线 / Genesis Defense',
            backHub: '返回大厅',
            heroEyebrow: 'TRI-LANE DEFENSE LIVE',
            heroTitle: '创世防线',
            heroSubtitle: '三路塔防 · 波次强化 · 核心守卫',
            goldLabel: '金币',
            coreLabel: '能核',
            fragmentLabel: '碎片',
            seasonLabel: '赛季',
            ratingLabel: '战力',
            bestStageLabel: '最高章节',
            chapterLabel: '章节',
            waveLabel: '波次',
            coreHpLabel: '核心',
            threatLabel: '威胁',
            startKicker: 'CORE DEFENSE',
            startTitle: '部署防线',
            startRun: '开始防守',
            upgradeKicker: 'WAVE UPGRADE',
            upgradeTitle: '选择一项强化',
            upgradeSubtitle: '每波结束后可获得 1 次临时增益，尽量围绕当前炮台阵容做组合。',
            pauseKicker: 'DEFENSE PAUSED',
            pauseTitle: '战局已暂停',
            resumeRun: '继续防守',
            quitRun: '结束本局',
            goldGainLabel: '金币收益',
            coreGainLabel: '能核收益',
            seasonGainLabel: '赛季经验',
            chapterProgressLabel: '章节进度',
            restartRun: '再守一局',
            nextChapter: '挑战下一章',
            loadoutShortcut: '前往装配',
            pauseBtn: '暂停',
            tabDefend: '防线',
            tabPrep: '部署',
            tabLoadout: '装配',
            tabResearch: '研究',
            tabMissions: '任务',
            tabSeason: '赛季',
            tabShop: '商店',
            skillEmp: 'EMP 脉冲',
            skillOverclock: '超频回路',
            skillShield: '守护立场',
            threatStable: '稳定',
            threatRising: '升温',
            threatDanger: '危险',
            defendPanelTitle: '前线防守',
            defendPanelDesc: '这里专注战斗状态与快速开战，章节选择与部署建议已挪到“部署”页。',
            prepPanelTitle: '章节部署',
            prepPanelDesc: '选章节、看敌潮、对照推荐编队，再决定是否直接开打。',
            loadoutPanelTitle: '三路装配',
            loadoutPanelDesc: '每条通道可独立装配炮台，主动技能决定关键波次的翻盘空间。',
            researchPanelTitle: '研究实验室',
            researchPanelDesc: '研究是长期成长主轴，会同时抬高稳定通关率和后续章节战力门槛。',
            missionsPanelTitle: '任务中心',
            missionsPanelDesc: '把可领取奖励置顶，帮助你快速获得短线反馈与资源回流。',
            seasonPanelTitle: '赛季轨道',
            seasonPanelDesc: '完成防守、推进章节、累计击杀都能提升赛季等级并领取里程奖励。',
            shopPanelTitle: '补给商店',
            shopPanelDesc: '日常补给负责基础回流，资源箱承担中期推进，链上校验充值会解锁赞助轨道与额外赛季奖励。',
            recommendRating: '推荐战力',
            rewardPreview: '掉落预览',
            enemyPreview: '敌潮预览',
            chapterBuff: '章节特性',
            chapterLocked: '未解锁',
            chapterUnlocked: '已解锁',
            defendNow: '立即防守',
            lane1: '左路',
            lane2: '中路',
            lane3: '右路',
            laneSelect: '当前装配路',
            skillSelect: '主动技能',
            equipNow: '装备到当前路',
            equipped: '已装备',
            unlockNow: '解锁',
            upgradeNow: '升级',
            upgradeMax: '已满级',
            needFragments: '需要碎片',
            needGold: '需要金币',
            needCores: '需要能核',
            levelText: '等级',
            rareText: '稀有',
            epicText: '史诗',
            commonText: '基础',
            supportText: '经济',
            dpsText: '输出',
            actionReady: '可操作',
            actionLocked: '未满足',
            researchEffect: '当前效果',
            researchCost: '研究消耗',
            missionClaim: '领取奖励',
            missionClaimed: '已领取',
            missionLocked: '进行中',
            seasonClaim: '领取节点',
            seasonClaimed: '已领取',
            seasonProgress: '赛季进度',
            seasonToNext: '距离下一级',
            shopClaim: '免费领取',
            shopBuy: '立即购买',
            shopSoldOut: '冷却中',
            startDescTemplate: '为三条通道装配炮台并守住创世核心，击退 6 波敌潮后获得金币、能核与蓝图碎片。当前章节：{chapter}。',
            startMetaReward: '通关奖励 {gold} 金币 · {core} 能核 · {fragment} 碎片',
            startMetaEnemy: '敌潮重点：{enemy}',
            battleNoteIdle: '优先确认三路炮台配置，再开局迎战敌潮。',
            battleNoteWave: '波次推进中：优先处理高速怪与护盾怪，技能留给压力峰值或 BOSS。',
            battleNoteUpgrade: '波次已清空，选择一项强化继续推进。',
            battleNoteResultWin: '防线守住了，资源已结算，可继续冲更高章节。',
            battleNoteResultLose: '核心被击穿，先补强装配或研究，再尝试重新开局。',
            toastSaved: '防线进度已同步保存',
            toastSkillCooling: '技能冷却中',
            toastSkillReady: '主动技能已就绪',
            toastSkillEmp: 'EMP 已释放，敌人被短暂压制',
            toastSkillOverclock: '炮台进入超频输出',
            toastSkillShield: '核心护盾已展开',
            toastBossIncoming: 'Boss 已入场，准备迎击',
            toastNotEnoughGold: '金币不足',
            toastNotEnoughCore: '能核不足',
            toastMissionClaimed: '任务奖励已领取',
            toastSeasonClaimed: '赛季节点奖励已领取',
            toastResearchUp: '研究等级提升',
            toastTowerUp: '炮台升级成功',
            toastTowerUnlock: '炮台解锁成功',
            toastEquipped: '当前通道装配已更新',
            toastDailySupply: '已领取今日补给',
            toastShopBought: '补给已到账',
            toastWaveClear: '本波清空，选择强化继续推进',
            toastRunWin: '防线成功守住',
            toastRunLose: '核心被突破，本局结束',
            toastChapterUnlocked: '新章节已解锁',
            toastFinalChapterClear: '终章已攻破，终局奖励已开启',
            toastNeedUnlock: '请先解锁该炮台',
            toastNeedFragments: '碎片不足',
            toastNeedLane: '请选择一条通道进行装配',
            resultWinKicker: 'DEFENSE SUCCESS',
            resultLoseKicker: 'CORE BREACHED',
            resultWinTitle: '防线胜利',
            resultLoseTitle: '防线失守',
            chapterProgressWin: '已解锁至 {chapter}',
            chapterProgressLose: '当前最高推进 {chapter}',
            resultStats: '击杀 {kills} · 伤害 {damage}',
            chapterInfoBoss: '第 6 波固定出现 Boss',
            missionReadyDot: '可领取',
            seasonReadyDot: '可领取',
            labReadyDot: '可升级',
            dailyReadyDot: '免费',
            sponsorTrack: '赞助轨道',
            sponsorDesc: '任意一笔校验成功的充值都会解锁赞助轨道，并在赛季页开放额外奖励节点。',
            chapterBadgeNew: '新章节',
            chapterBadgeCurrent: '当前挑战',
            waveText: '第 {wave} / 6 波',
            skillReady: '{skill} · 可释放',
            skillCooling: '{skill} · {time}s',
            coreShieldText: '护盾 {value}',
            waveIncomingText: '第 {wave} 波来袭',
            finalWaveIncomingText: '最终波来袭',
            bossIncomingText: 'Boss 压境',
            skillReadyBanner: '{skill} 已就绪',
            laneStripDps: '路伤害',
            laneStripEmpty: '未装配',
            laneStripLevel: 'Lv.{level}',
            researchMaxed: '研究已满',
            fragmentsGain: '{name} 碎片 +{value}',
            seasonNodeTitle: '赛季节点 {index}',
            shopFreeTitle: '日常补给箱',
            shopFreeDesc: '每 20 小时可领取一次，提供金币、能核与基础炮台碎片。',
            shopGoldTitle: '蓝图补给箱',
            shopGoldDesc: '消耗金币抽取蓝图碎片，适合中期抬高炮台等级。',
            shopCoreTitle: '高能中继箱',
            shopCoreDesc: '消耗能核换取稀有/史诗碎片与额外金币。',
            previewTowerPower: '战力构成',
            previewWavePressure: '压力曲线',
            previewEconomy: '资源回流',
            chapterStateTitle: '当前章节压力',
            chapterStateDesc: '数值会随着章节逐步抬高，高稀有炮台更适合承担后期突破。',
            bonusDamage: '火力增幅',
            bonusSpeed: '冷却加速',
            bonusShield: '护盾加厚',
            bonusGold: '战利回收',
            bonusFreeze: '冰缓扩散',
            bonusCrit: '核心暴击',
            bonusSplash: '爆裂链式',
            statRuns: '防守局数',
            statWins: '成功守住',
            statKills: '累计击杀',
            statDamage: '总伤害',
            statSkills: '技能释放',
            statResearch: '研究次数',
            statBest: '最高推进',
            statFinalClears: '终章通关',
            enemyFast: '高速怪',
            enemyShield: '护盾怪',
            enemySplit: '分裂怪',
            enemyElite: '精英怪',
            enemyBoss: '裂隙巨像',
            enemyGrunt: '杂兵',
            towerPulse: '脉冲塔',
            towerLaser: '激光塔',
            towerFrost: '霜冻塔',
            towerRocket: '火箭塔',
            towerHarvest: '采集塔',
            towerChain: '链击塔',
            towerRail: '轨炮塔',
            rarityCommon: '基础',
            rarityRare: '稀有',
            rarityEpic: '史诗'
        },
        en: {
            pageTitle: 'Genesis Defense',
            backHub: 'Back To Hub',
            heroEyebrow: 'TRI-LANE DEFENSE LIVE',
            heroTitle: 'Genesis Defense',
            heroSubtitle: '3 Lanes · Wave Upgrades · Core Survival',
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
            tabPrep: 'Setup',
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
            defendPanelTitle: 'Frontline Defense',
            defendPanelDesc: 'This page now focuses on live battle status and fast entry. Chapter setup moved to Setup.',
            prepPanelTitle: 'Chapter Setup',
            prepPanelDesc: 'Pick a chapter, inspect the enemy mix, compare your gap, then decide whether to deploy now.',
            loadoutPanelTitle: 'Tri-Lane Loadout',
            loadoutPanelDesc: 'Each lane equips its own tower, while your active skill defines wave-saving moments.',
            researchPanelTitle: 'Research Lab',
            researchPanelDesc: 'Research is the long-term progression spine for both stability and difficulty gates.',
            missionsPanelTitle: 'Mission Center',
            missionsPanelDesc: 'Claimable rewards are pinned to the top so your feedback loop stays visible.',
            seasonPanelTitle: 'Season Track',
            seasonPanelDesc: 'Defense clears, chapter pushes, and total kills all feed your season rewards.',
            shopPanelTitle: 'Supply Shop',
            shopPanelDesc: 'Daily supply stabilizes retention, resource crates push mid-game growth, and verified top-ups unlock bonus season rewards.',
            toastFinalChapterClear: 'Final chapter cleared. Endgame rewards unlocked',
            toastSkillReady: 'Active skill is ready',
            toastBossIncoming: 'Boss is on the field',
            waveIncomingText: 'Wave {wave} incoming',
            finalWaveIncomingText: 'Final wave incoming',
            bossIncomingText: 'Boss incoming',
            skillReadyBanner: '{skill} ready',
            statFinalClears: 'Final Clears'
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
            trait: { zh: '基础试炼，主要熟悉三路装配与波次强化节奏。', en: 'Intro chapter to learn three-lane setup and wave upgrades.' },
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
            trait: { zh: '高速怪明显增多，优先准备激光塔与控场技能。', en: 'Fast enemies show up more often, making laser and control tools more valuable.' },
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
            trait: { zh: '分裂怪与精英开始进入主波次，需要更稳的减速与爆裂伤害。', en: 'Split enemies and elites enter the main waves, pushing for slows and splash damage.' },
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
            trait: { zh: '护盾怪血量成长明显，链击塔与轨炮塔开始展现价值。', en: 'Shield units grow tougher, and chain / rail tools start to matter.' },
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
            trait: { zh: '中后期章节，经济与输出要同步抬高，否则会被精英波拖垮。', en: 'Mid-late chapter where economy and damage must scale together.' },
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
            trait: { zh: '第二章终局章节，Boss 波极重，建议优先准备史诗轨炮塔。', en: 'Final chapter of Arc 2 with a brutal boss wave. Epic rail setups shine here.' },
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
            trait: { zh: '进入第 3 章后，三路会同时承受快怪与精英怪压力，必须保证至少两路具备稳定收线能力。', en: 'Chapter 3 opens with simultaneous pressure from fast and elite enemies, so at least two lanes must clear reliably.' },
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
            trait: { zh: '护盾怪、分裂怪与 Boss 会连续叠压，护盾技能与链击 / 火箭的联动会明显更稳。', en: 'Shield units, split enemies, and the boss stack together here, making shield timing and Chain/Rocket synergy much more reliable.' },
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
            trait: { zh: '当前开放内容的终章，最终 Boss 波会把三路一起压满，建议至少拥有 1 路高等级轨炮与 1 路稳定减速。', en: 'This is the current end chapter. The final boss wave saturates all three lanes, so you want one high-level Rail lane plus one stable slow lane.' },
            enemies: ['fast', 'shield', 'split', 'boss'],
            fragmentFocus: ['rail', 'chain', 'frost']
        }
    ];

    const TOWERS = {
        pulse: { id: 'pulse', tier: 'common', baseDamage: 16, cooldown: 0.72, range: 450, upgradeGold: 220, unlockFragments: 0, color: '#72f4ff', power: 55, splash: 0, slow: 0 },
        laser: { id: 'laser', tier: 'common', baseDamage: 10, cooldown: 0.34, range: 560, upgradeGold: 260, unlockFragments: 0, color: '#ff9a5a', power: 58, splash: 0, slow: 0 },
        frost: { id: 'frost', tier: 'rare', baseDamage: 12, cooldown: 0.62, range: 500, upgradeGold: 320, unlockFragments: 36, color: '#8ad6ff', power: 78, splash: 0, slow: 0.28 },
        rocket: { id: 'rocket', tier: 'rare', baseDamage: 24, cooldown: 1.08, range: 520, upgradeGold: 380, unlockFragments: 40, color: '#ffd26b', power: 92, splash: 0.42, slow: 0 },
        harvest: { id: 'harvest', tier: 'common', baseDamage: 8, cooldown: 0.84, range: 420, upgradeGold: 210, unlockFragments: 0, color: '#65ffb2', power: 52, splash: 0, slow: 0, goldBonus: 0.55 },
        chain: { id: 'chain', tier: 'rare', baseDamage: 15, cooldown: 0.64, range: 500, upgradeGold: 460, unlockFragments: 56, color: '#b58cff', power: 112, splash: 0, slow: 0, chain: 0.42 },
        rail: { id: 'rail', tier: 'epic', baseDamage: 44, cooldown: 1.28, range: 620, upgradeGold: 720, unlockFragments: 92, color: '#ff6b89', power: 164, splash: 0, slow: 0, pierce: true }
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
        { id: 'm16', title: { zh: '赛季冲刺', en: 'Season Surge' }, desc: { zh: '累计获得 5200 赛季经验。', en: 'Earn 5200 Season XP total.' }, target: 5200, metric: (save) => save.seasonXp, reward: { gold: 8200, cores: 220, fragments: { frost: 28, chain: 28, rail: 24 } } },
        { id: 'm17', title: { zh: '终章首破', en: 'Final Breakthrough' }, desc: { zh: '成功通关章节 3-3 1 次。', en: 'Clear chapter 3-3 once.' }, target: 1, metric: (save) => getChapterWinCount('3-3', save), reward: { gold: 9600, cores: 240, seasonXp: 320, fragments: { rail: 28, chain: 26, frost: 24 } } },
        { id: 'm18', title: { zh: '终章镇守', en: 'Final Hold' }, desc: { zh: '成功通关章节 3-3 4 次。', en: 'Clear chapter 3-3 four times.' }, target: 4, metric: (save) => getChapterWinCount('3-3', save), reward: { gold: 13800, cores: 320, seasonXp: 460, fragments: { rail: 32, chain: 32, rocket: 30 } } },
        { id: 'm19', title: { zh: '赛季高峰', en: 'Season Apex' }, desc: { zh: '累计获得 8800 赛季经验。', en: 'Earn 8800 Season XP total.' }, target: 8800, metric: (save) => save.seasonXp, reward: { gold: 16200, cores: 380, fragments: { frost: 34, chain: 34, rail: 32 } } },
        { id: 'm20', title: { zh: '巅峰火控', en: 'Peak Fire Control' }, desc: { zh: '将任意炮台升到 8 级。', en: 'Upgrade any tower to level 8.' }, target: 8, metric: (save) => getHighestTowerLevel(save), reward: { gold: 18800, cores: 460, seasonXp: 620, fragments: { rocket: 36, chain: 36, rail: 40 } } }
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
        { id: 's16', xp: 7350, reward: { gold: 5200, cores: 160, fragments: { frost: 30, rocket: 30, chain: 30, rail: 28 } } },
        { id: 's17', xp: 8750, reward: { gold: 6800, cores: 196, fragments: { chain: 34, rail: 30 } } },
        { id: 's18', xp: 10350, reward: { fragments: { frost: 32, rocket: 32, rail: 30 }, cores: 220 } },
        { id: 's19', xp: 12350, reward: { gold: 9200, cores: 260, fragments: { chain: 34, rail: 34, rocket: 30 } } },
        { id: 's20', xp: 14600, reward: { gold: 12600, cores: 320, fragments: { frost: 38, rocket: 38, chain: 38, rail: 36 } } }
    ];

    const UPGRADE_CHOICES = [
        { id: 'damage', label: { zh: '全路火力 +18%', en: 'All lane damage +18%' }, hint: { zh: '火力增幅', en: 'Damage Boost' }, apply: (battle) => { battle.modifiers.damage *= 1.18; } },
        { id: 'speed', label: { zh: '全路攻速 +16%', en: 'All lane fire rate +16%' }, hint: { zh: '冷却加速', en: 'Cooldown Speed' }, apply: (battle) => { battle.modifiers.attackSpeed *= 1.16; } },
        { id: 'gold', label: { zh: '本局金币收益 +22%', en: 'Gold gain this run +22%' }, hint: { zh: '战利回收', en: 'Salvage Boost' }, apply: (battle) => { battle.modifiers.gold *= 1.22; } },
        { id: 'shield', label: { zh: '核心立即获得额外护盾', en: 'Gain instant shield' }, hint: { zh: '护盾加厚', en: 'Shield Boost' }, apply: (battle) => { battle.shield = Math.min(getCoreShieldCap() * 1.45, battle.shield + 70 + getResearchLevel('fortify') * 10); } },
        { id: 'freeze', label: { zh: '炮台命中附带 12% 冰缓', en: '12% slow chance on hit' }, hint: { zh: '冰缓扩散', en: 'Freeze Spread' }, apply: (battle) => { battle.modifiers.freezeChance += 0.12; } },
        { id: 'splash', label: { zh: '炮台追加 20% 溅射伤害', en: '20% splash damage added' }, hint: { zh: '爆裂链式', en: 'Splash Chain' }, apply: (battle) => { battle.modifiers.splashBonus += 0.2; } },
        { id: 'repair', label: { zh: '核心修复 +28 并补盾', en: 'Repair core +28 and shield' }, hint: { zh: '稳住防线', en: 'Stabilize Core' }, apply: (battle) => { battle.coreHp = Math.min(getCoreMaxHp(), battle.coreHp + 28 + getResearchLevel('fortify') * 4); battle.shield = Math.min(getCoreShieldCap() * 1.7, battle.shield + 38 + getResearchLevel('fortify') * 6); } },
        { id: 'skillReset', label: { zh: '技能冷却 -8 秒', en: 'Skill cooldown -8s' }, hint: { zh: '技能回路', en: 'Skill Loop' }, apply: (battle) => { battle.skillCooldown = Math.max(0, battle.skillCooldown - 8); battle.laneSkillGlow = SKILL_READY_GLOW_MS; } },
        { id: 'bossBreak', label: { zh: '精英 / Boss 伤害 +35%', en: 'Elite/Boss damage +35%' }, hint: { zh: '压制突围包', en: 'Pressure Breaker' }, apply: (battle) => { battle.modifiers.eliteDamage *= 1.35; } },
        { id: 'coreFlow', label: { zh: '能核掉落 +45%', en: 'Core drops +45%' }, hint: { zh: '能核回流', en: 'Core Flow' }, apply: (battle) => { battle.modifiers.coreGain *= 1.45; } }
    ];

    const SHOP_ITEMS = [
        {
            id: 'goldCrate',
            priceType: 'gold',
            basePrice: 920,
            kicker: { zh: '920 G', en: '920 G' },
            slot: { zh: '成长碎片', en: 'Growth Fragments' },
            title: { zh: '蓝图补给箱', en: 'Blueprint Crate' },
            desc: { zh: '金币向基础资源箱，偏向霜冻 / 火箭 / 链击的中期成长。', en: 'A gold sink for mid-game fragment growth focused on Frost, Rocket, and Chain.' }
        },
        {
            id: 'forgeCrate',
            priceType: 'gold',
            basePrice: 2480,
            kicker: { zh: '2480 G', en: '2480 G' },
            slot: { zh: '推进军械', en: 'Push Arsenal' },
            title: { zh: '前线军械箱', en: 'Frontline Arsenal' },
            desc: { zh: '为卡章节准备的高阶金币箱，会补充能核、赛季经验和高压章节常用碎片。', en: 'A heavier gold sink for chapter walls with cores, Season XP, and higher-tier fragments.' }
        },
        {
            id: 'coreCrate',
            priceType: 'core',
            basePrice: 34,
            kicker: { zh: '34 C', en: '34 C' },
            slot: { zh: '稀有箱', en: 'Rare Box' },
            title: { zh: '高能中继箱', en: 'High-Energy Relay' },
            desc: { zh: '能核向补给箱，主要补连锁 / 轨炮碎片，并带回一部分金币与赛季经验。', en: 'A core sink that feeds Chain and Rail growth while refunding some gold and Season XP.' }
        },
        {
            id: 'relayCrate',
            priceType: 'core',
            basePrice: 72,
            kicker: { zh: '72 C', en: '72 C' },
            slot: { zh: '后期核心', en: 'Late Core' },
            title: { zh: '矩阵中枢箱', en: 'Matrix Nexus Crate' },
            desc: { zh: '偏后期的高阶能核箱，专门提高赛季推进与轨炮 / 链击收集效率。', en: 'A late-game core sink built to speed up Season progress and Rail/Chain collection.' }
        },
        {
            id: 'sponsorSupply',
            priceType: 'gold',
            basePrice: 6800,
            repeatGrowth: 0.26,
            milestoneGrowth: 0.1,
            requiresSponsor: true,
            kicker: { zh: '6800 G', en: '6800 G' },
            slot: { zh: '赞助专供', en: 'Sponsor Only' },
            title: { zh: '赞助军备箱', en: 'Sponsor Arsenal Crate' },
            desc: { zh: '赞助轨道解锁后开放的高阶金币箱，主补能核、赛季经验与轨炮 / 链击碎片。', en: 'A sponsor-only gold sink focused on cores, Season XP, and Rail/Chain growth.' }
        },
        {
            id: 'sponsorPrism',
            priceType: 'core',
            basePrice: 128,
            repeatGrowth: 0.22,
            milestoneGrowth: 0.08,
            requiresSponsor: true,
            kicker: { zh: '128 C', en: '128 C' },
            slot: { zh: '终局赞助', en: 'Sponsor Endgame' },
            title: { zh: '创世棱镜箱', en: 'Genesis Prism Crate' },
            desc: { zh: '赞助专属终局能核箱，可把能核直接转成大量金币、赛季经验与高阶碎片。', en: 'A sponsor-exclusive endgame core sink that converts cores into big gold, Season XP, and high-tier fragments.' }
        }
    ];

    const DEFENSE_PAYMENT_OFFERS = [
        {
            id: 'starter',
            price: 1.0,
            accent: '#57e5ff',
            badge: { zh: '首充推荐', en: 'Starter' },
            name: { zh: '前线补给', en: 'Frontline Cache' },
            desc: { zh: '快速补足前期金币、能核和基础塔台碎片，让前三章推进更平稳。', en: 'A light first pack that stabilizes gold, cores, and starter tower fragments.' },
            reward: { gold: 3200, cores: 28, seasonXp: 120, fragments: { pulse: 20, laser: 18, harvest: 16 } }
        },
        {
            id: 'accelerator',
            price: 2.99,
            accent: '#ff8fe8',
            badge: { zh: '中期提速', en: 'Value' },
            name: { zh: '中继加速箱', en: 'Relay Booster' },
            desc: { zh: '适合补强中期波次压力，提供更实用的冻结、火箭和连锁碎片。', en: 'A mid-loop power spike with more practical fragments for dangerous waves.' },
            reward: { gold: 9800, cores: 86, seasonXp: 320, fragments: { frost: 24, rocket: 24, chain: 12 } }
        },
        {
            id: 'rush',
            price: 3.99,
            accent: '#ffb168',
            badge: { zh: '冲关实装', en: 'Rush' },
            name: { zh: '压制突围包', en: 'Pressure Breaker' },
            desc: { zh: '专为卡章节点准备，兼顾金币、能核和高压章节需要的高阶碎片。', en: 'Designed for chapter walls with extra economy and higher-tier fragments.' },
            reward: { gold: 14800, cores: 132, seasonXp: 480, fragments: { rocket: 28, chain: 18, rail: 10 } }
        },
        {
            id: 'sovereign',
            price: 5.99,
            accent: '#ffe27b',
            badge: { zh: '核心成长', en: 'Core' },
            name: { zh: '指挥中枢包', en: 'Command Relay' },
            desc: { zh: '同步补强战力与赛季收益，适合开始冲击中后期章节。', en: 'A stronger growth bundle for deeper chapter pushes and season progress.' },
            reward: { gold: 24000, cores: 210, seasonXp: 760, fragments: { frost: 28, rocket: 28, chain: 22, rail: 16 } }
        },
        {
            id: 'nexus',
            price: 9.99,
            accent: '#7dffb3',
            badge: { zh: '后期核心', en: 'Endgame' },
            name: { zh: '堡垒核心包', en: 'Citadel Core' },
            desc: { zh: '围绕后期阵容补给，直接提高能核储备和连锁 / 轨炮成长速度。', en: 'An endgame pack that boosts core stock and high-tier tower growth.' },
            reward: { gold: 42000, cores: 360, seasonXp: 1200, fragments: { frost: 32, rocket: 32, chain: 34, rail: 28 } }
        },
        {
            id: 'throne',
            price: 12.99,
            accent: '#89c9ff',
            badge: { zh: '终局整备', en: 'Summit' },
            name: { zh: '创世军械库', en: 'Genesis Arsenal' },
            desc: { zh: '覆盖整套塔台成长所需，适合准备长期守线与冲赛季奖励。', en: 'A full arsenal bundle built for long-term defense and season chasing.' },
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
        { id: 'p10', xp: 6400, reward: { gold: 19600, cores: 240, fragments: { chain: 34, rail: 34, rocket: 30 } } },
        { id: 'p11', xp: 7900, reward: { gold: 25800, cores: 310, fragments: { rail: 38, chain: 34, frost: 30 } } },
        { id: 'p12', xp: 9600, reward: { gold: 33600, cores: 390, fragments: { rocket: 36, chain: 38, rail: 42 } } },
        { id: 'p13', xp: 11400, reward: { gold: 42800, cores: 480, fragments: { frost: 36, rocket: 34, chain: 42, rail: 46 } } },
        { id: 'p14', xp: 13600, reward: { gold: 54800, cores: 590, fragments: { frost: 40, rocket: 40, chain: 46, rail: 50 } } }
    ];

    const LANE_POSITIONS = [170, 360, 550];
    const ENEMY_TYPE_IDS = new Set(['grunt', 'fast', 'shield', 'split', 'elite', 'boss']);
    const CHAPTER_WAVE_SCRIPTS = Object.freeze({});

    const initialSave = loadSave();
    const state = {
        lang: getInitialLang(),
        soundEnabled: true,
        save: initialSave,
        activeTab: 'defend',
        toastTimer: 0,
        renderQueued: false,
        battleLoopStarted: false,
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
    let lastBattleInsightStamp = '';
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheDom();
        bindStaticEvents();
        markHubOpen();
        applyLanguage();
        updateStartPanel();
        renderAll();
        registerDebugApi();
        flushPendingPaymentClaims().catch(() => {});
        paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
        startLoop();
    }

    function cacheDom() {
        ui.stageCard = document.getElementById('stageCard');
        ui.canvas = document.getElementById('battlefieldCanvas');
        ui.ctx = ui.canvas.getContext('2d');
        ui.toast = document.getElementById('toast');
        ui.panelCard = document.getElementById('panelCard');
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
        ui.battleAlertStack = document.getElementById('battleAlertStack');
        ui.battleInsights = document.getElementById('battleInsights');
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
            event.preventDefault();
            event.stopPropagation();
            state.save.selectedLane = Number(target.dataset.laneIndex) || 0;
            saveProgress();
            renderLaneStrip();
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
            case 'applyChapterPresetStart':
                startChapterWithPreset(value || getCurrentChapter().id);
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
            case 'claimAllMissions':
                claimAllMissions();
                break;
            case 'claimSeason':
                claimSeason(value);
                break;
            case 'claimAllSeason':
                claimAllSeasonRewards();
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
            case 'resumeBattle':
                resumeBattle();
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
            spawnBursts: [],
            bannerTimer: 0,
            bannerDuration: 0,
            bannerText: '',
            bannerTone: 'wave',
            edgeFlashTimer: 0,
            edgeFlashDuration: 0,
            edgeFlashTone: 'wave',
            bossAlertTimer: 0,
            skillReadyPulse: 0,
            alerts: [],
            laneAlertTimers: [0, 0, 0],
            shotTraces: [],
            skillBursts: [],
            hitBursts: [],
            defeatBursts: [],
            coreImpactTimer: 0,
            coreImpactSeverity: 0,
            screenShakeTimer: 0,
            screenShakeStrength: 0,
            waveClearTimer: 0,
            waveSpawnedCount: 0,
            waveQueueSafetyRetries: 0,
            nextEnemyId: 1,
            nextAlertId: 1,
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

    function createBaseSave() {
        return {
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
            stats: { runs: 0, wins: 0, kills: 0, bossKills: 0, skillsUsed: 0, researchDone: 0, totalDamage: 0, chapterWins: {} },
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
    }

    function clampSaveNumber(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const numeric = Math.floor(Number(value));
        if (!Number.isFinite(numeric)) return fallback;
        return Math.max(min, Math.min(max, numeric));
    }

    function normalizeSave(save, base = createBaseSave()) {
        const normalized = {
            ...base,
            ...save
        };
        normalized.gold = clampSaveNumber(normalized.gold, base.gold, 0);
        normalized.cores = clampSaveNumber(normalized.cores, base.cores, 0);
        normalized.seasonXp = clampSaveNumber(normalized.seasonXp, base.seasonXp, 0);
        normalized.chapterIndex = clampSaveNumber(normalized.chapterIndex, base.chapterIndex, 0, CHAPTERS.length - 1);
        normalized.bestChapterIndex = clampSaveNumber(normalized.bestChapterIndex, Math.max(base.bestChapterIndex, normalized.chapterIndex), 0, CHAPTERS.length - 1);
        normalized.bestChapterIndex = Math.max(normalized.bestChapterIndex, normalized.chapterIndex);
        normalized.chapterIndex = Math.min(normalized.chapterIndex, normalized.bestChapterIndex);
        normalized.selectedLane = clampSaveNumber(normalized.selectedLane, base.selectedLane, 0, 2);
        normalized.selectedSkill = SKILLS[normalized.selectedSkill] ? normalized.selectedSkill : base.selectedSkill;
        normalized.laneLoadout = Array.isArray(normalized.laneLoadout) && normalized.laneLoadout.length === 3
            ? normalized.laneLoadout.map((towerId, index) => (TOWERS[towerId] ? towerId : base.laneLoadout[index]))
            : base.laneLoadout.slice();
        normalized.towerLevels = Object.fromEntries(
            Object.keys(base.towerLevels).map((towerId) => [towerId, clampSaveNumber(normalized.towerLevels?.[towerId], base.towerLevels[towerId], 0)])
        );
        normalized.towerFragments = Object.fromEntries(
            Object.keys(base.towerFragments).map((towerId) => [towerId, clampSaveNumber(normalized.towerFragments?.[towerId], base.towerFragments[towerId], 0)])
        );
        normalized.researches = Object.fromEntries(
            Object.keys(base.researches).map((researchId) => [researchId, clampSaveNumber(normalized.researches?.[researchId], base.researches[researchId], 0)])
        );
        normalized.shopPurchases = normalized.shopPurchases && typeof normalized.shopPurchases === 'object'
            ? { ...normalized.shopPurchases }
            : {};
        normalized.missionClaimed = Array.isArray(normalized.missionClaimed) ? Array.from(new Set(normalized.missionClaimed.filter(Boolean))) : [];
        normalized.seasonClaimed = Array.isArray(normalized.seasonClaimed) ? Array.from(new Set(normalized.seasonClaimed.filter(Boolean))) : [];
        normalized.dailySupplyAt = Math.max(0, Number(normalized.dailySupplyAt) || 0);
        normalized.stats = {
            ...base.stats,
            ...(normalized.stats || {}),
            runs: clampSaveNumber(normalized.stats?.runs, base.stats.runs, 0),
            wins: clampSaveNumber(normalized.stats?.wins, base.stats.wins, 0),
            kills: clampSaveNumber(normalized.stats?.kills, base.stats.kills, 0),
            bossKills: clampSaveNumber(normalized.stats?.bossKills, base.stats.bossKills, 0),
            skillsUsed: clampSaveNumber(normalized.stats?.skillsUsed, base.stats.skillsUsed, 0),
            researchDone: clampSaveNumber(normalized.stats?.researchDone, base.stats.researchDone, 0),
            totalDamage: clampSaveNumber(normalized.stats?.totalDamage, base.stats.totalDamage, 0),
            chapterWins: normalized.stats?.chapterWins && typeof normalized.stats.chapterWins === 'object'
                ? Object.fromEntries(Object.entries(normalized.stats.chapterWins).map(([chapterId, wins]) => [chapterId, clampSaveNumber(wins, 0, 0)]))
                : {}
        };
        normalized.payment = {
            ...base.payment,
            ...(normalized.payment || {}),
            minerId: typeof normalized.payment?.minerId === 'string' ? normalized.payment.minerId : '',
            purchaseCount: clampSaveNumber(normalized.payment?.purchaseCount, base.payment.purchaseCount, 0),
            totalSpent: Math.max(0, Number(normalized.payment?.totalSpent) || 0),
            passUnlocked: !!normalized.payment?.passUnlocked,
            claimedOrders: normalized.payment?.claimedOrders && typeof normalized.payment.claimedOrders === 'object' ? { ...normalized.payment.claimedOrders } : {},
            pendingClaims: normalized.payment?.pendingClaims && typeof normalized.payment.pendingClaims === 'object' ? { ...normalized.payment.pendingClaims } : {},
            premiumSeasonClaims: normalized.payment?.premiumSeasonClaims && typeof normalized.payment.premiumSeasonClaims === 'object' ? { ...normalized.payment.premiumSeasonClaims } : {},
            verifiedTxids: Array.isArray(normalized.payment?.verifiedTxids)
                ? Array.from(new Set(normalized.payment.verifiedTxids)).slice(0, 100)
                : []
        };
        return normalized;
    }

    function loadSave() {
        const base = createBaseSave();

        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return base;
            const parsed = JSON.parse(raw);
            return normalizeSave({
                ...base,
                ...parsed,
                laneLoadout: Array.isArray(parsed?.laneLoadout) && parsed.laneLoadout.length === 3 ? parsed.laneLoadout.slice(0, 3) : base.laneLoadout,
                towerLevels: { ...base.towerLevels, ...(parsed?.towerLevels || {}) },
                towerFragments: { ...base.towerFragments, ...(parsed?.towerFragments || {}) },
                researches: { ...base.researches, ...(parsed?.researches || {}) },
                shopPurchases: { ...base.shopPurchases, ...(parsed?.shopPurchases || {}) },
                missionClaimed: Array.isArray(parsed?.missionClaimed) ? parsed.missionClaimed : [],
                seasonClaimed: Array.isArray(parsed?.seasonClaimed) ? parsed.seasonClaimed : [],
                stats: {
                    ...base.stats,
                    ...(parsed?.stats || {}),
                    chapterWins: {
                        ...base.stats.chapterWins,
                        ...((parsed?.stats?.chapterWins && typeof parsed.stats.chapterWins === 'object') ? parsed.stats.chapterWins : {})
                    }
                },
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
            }, base);
        } catch (error) {
            return base;
        }
    }

    function saveProgress(showToastMessage) {
        try {
            state.save = normalizeSave(state.save);
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

    function getBattleToneColor(tone) {
        const map = {
            wave: '114,244,255',
            skill: '114,244,255',
            overclock: '255,154,90',
            shield: '255,210,107',
            emp: '114,244,255',
            boss: '255,107,137'
        };
        return map[tone] || map.wave;
    }

    function hexToRgbString(hex, fallback = '255,255,255') {
        if (typeof hex !== 'string') return fallback;
        const normalized = hex.trim().replace('#', '');
        const fullHex = normalized.length === 3
            ? normalized.split('').map((part) => `${part}${part}`).join('')
            : normalized;
        if (!/^[0-9a-fA-F]{6}$/.test(fullHex)) return fallback;
        return `${parseInt(fullHex.slice(0, 2), 16)},${parseInt(fullHex.slice(2, 4), 16)},${parseInt(fullHex.slice(4, 6), 16)}`;
    }

    function getBattleAlertToneLabel(tone) {
        return {
            wave: getLocalized({ zh: '波次', en: 'Wave' }),
            skill: getLocalized({ zh: '技能', en: 'Skill' }),
            emp: getLocalized({ zh: '技能', en: 'Skill' }),
            shield: getLocalized({ zh: '技能', en: 'Skill' }),
            overclock: getLocalized({ zh: '强化', en: 'Boost' }),
            boss: 'Boss'
        }[tone] || getLocalized({ zh: '战场', en: 'Battle' });
    }

    function renderBattleAlerts() {
        if (!ui.battleAlertStack) return;
        const alerts = Array.isArray(state.battle.alerts) ? state.battle.alerts.slice().sort((a, b) => b.id - a.id) : [];
        ui.battleAlertStack.innerHTML = alerts.map((alert) => `
            <article class="battle-alert-card is-${alert.tone}">
                <span class="battle-alert-tag">${getBattleAlertToneLabel(alert.tone)}</span>
                <div class="battle-alert-text">${alert.text}</div>
            </article>
        `).join('');
    }

    function pushBattleAlert(text, tone = 'wave', duration = 2.2) {
        if (!text) return;
        state.battle.alerts = [
            ...(Array.isArray(state.battle.alerts) ? state.battle.alerts : []),
            {
                id: state.battle.nextAlertId++,
                text,
                tone,
                expiresAt: performance.now() + Math.max(0.8, duration) * 1000
            }
        ].slice(-3);
        renderBattleAlerts();
    }

    function getLaneSpawnAlert(spawn) {
        const laneName = getLaneName(spawn.lane);
        if (spawn.type === 'boss') {
            return {
                tone: 'boss',
                duration: 2.8,
                text: getLocalized({ zh: `${laneName} Boss 压境`, en: `Boss pressing ${laneName}` })
            };
        }
        if (spawn.type === 'elite') {
            return {
                tone: 'overclock',
                duration: 2,
                text: getLocalized({ zh: `${laneName} 精英突入`, en: `Elite breach on ${laneName}` })
            };
        }
        return {
            tone: 'wave',
            duration: 1.6,
            text: getLocalized({ zh: `${laneName} 来敌 · ${enemyLabel(spawn.type)}`, en: `${laneName} incoming · ${enemyLabel(spawn.type)}` })
        };
    }

    function getEnemyBurstTone(type) {
        if (type === 'boss') return 'boss';
        if (type === 'elite') return 'overclock';
        if (type === 'shield') return 'shield';
        return 'wave';
    }

    function getTowerTraceTone(towerId) {
        return hexToRgbString(TOWERS[towerId]?.color, getBattleToneColor('wave'));
    }

    function pushTowerShotTrace(towerId, fromX, fromY, toX, toY, scale = 1, chained = false) {
        const durationMap = {
            pulse: 0.16,
            laser: 0.12,
            frost: 0.18,
            rocket: 0.24,
            harvest: 0.14,
            chain: 0.2,
            rail: 0.22
        };
        const widthMap = {
            pulse: 3.2,
            laser: 2.6,
            frost: 3.4,
            rocket: 5,
            harvest: 2.8,
            chain: 3.2,
            rail: 5.8
        };
        state.battle.shotTraces.push({
            towerId,
            fromX,
            fromY,
            toX,
            toY,
            tone: getTowerTraceTone(towerId),
            timer: durationMap[towerId] || 0.16,
            duration: durationMap[towerId] || 0.16,
            width: (widthMap[towerId] || 3) * scale,
            scale,
            chained: !!chained
        });
        if (state.battle.shotTraces.length > 40) state.battle.shotTraces.shift();
    }

    function pushSkillBurst(skillId) {
        const duration = skillId === 'overclock' ? 1.15 : 0.92;
        state.battle.skillBursts.push({
            skillId,
            timer: duration,
            duration
        });
        if (state.battle.skillBursts.length > 8) state.battle.skillBursts.shift();
    }

    function pushHitBurst(x, y, tone = 'wave', scale = 1) {
        state.battle.hitBursts.push({
            x,
            y,
            tone,
            scale,
            timer: 0.26,
            duration: 0.26
        });
        if (state.battle.hitBursts.length > 28) state.battle.hitBursts.shift();
    }

    function pushDefeatBurst(enemy) {
        state.battle.defeatBursts.push({
            x: enemy.x,
            y: enemy.y,
            radius: enemy.radius,
            tone: getEnemyBurstTone(enemy.type),
            timer: enemy.boss ? 0.9 : (enemy.elite ? 0.66 : 0.48),
            duration: enemy.boss ? 0.9 : (enemy.elite ? 0.66 : 0.48),
            boss: !!enemy.boss,
            elite: !!enemy.elite
        });
        if (state.battle.defeatBursts.length > 16) state.battle.defeatBursts.shift();
    }

    function triggerCoreImpact(damage, shieldAbsorbed = 0) {
        const severity = Math.min(1.8, Math.max(damage, shieldAbsorbed * 0.6) / 20);
        state.battle.coreImpactTimer = Math.max(state.battle.coreImpactTimer, 0.5 + severity * 0.24);
        state.battle.coreImpactSeverity = Math.max(state.battle.coreImpactSeverity, severity);
        state.battle.screenShakeTimer = Math.max(state.battle.screenShakeTimer, 0.2 + severity * 0.14);
        state.battle.screenShakeStrength = Math.max(state.battle.screenShakeStrength, 5 + severity * 6);
        triggerEdgeFlash(shieldAbsorbed > 0 && damage <= 0 ? 'shield' : 'boss', 0.45 + severity * 0.16);
    }

    function triggerWaveClearCelebration() {
        state.battle.waveClearTimer = Math.max(state.battle.waveClearTimer, 1.2);
        state.battle.screenShakeTimer = Math.max(state.battle.screenShakeTimer, 0.18);
        state.battle.screenShakeStrength = Math.max(state.battle.screenShakeStrength, 4.2);
        pushBattleAlert(
            getLocalized({
                zh: `第 ${state.battle.currentWave} 波已清空，准备拿强化继续推进`,
                en: `Wave ${state.battle.currentWave} cleared. Take an upgrade and keep pushing.`
            }),
            'wave',
            2.5
        );
    }

    function triggerBattleBanner(text, tone = 'wave', duration = 1.6) {
        if (!text) return;
        state.battle.bannerText = text;
        state.battle.bannerTone = tone;
        state.battle.bannerDuration = duration;
        state.battle.bannerTimer = duration;
    }

    function triggerEdgeFlash(tone = 'wave', duration = 0.9) {
        state.battle.edgeFlashTone = tone;
        state.battle.edgeFlashDuration = duration;
        state.battle.edgeFlashTimer = duration;
    }

    function announceSkillReady() {
        if (!state.battle.running || state.battle.finished) return;
        state.battle.skillReadyPulse = Math.max(state.battle.skillReadyPulse, 1.8);
        triggerBattleBanner(t('skillReadyBanner').replace('{skill}', t(SKILLS[state.save.selectedSkill].nameKey)), 'skill', 1.1);
        pushBattleAlert(
            getLocalized({
                zh: `${t(SKILLS[state.save.selectedSkill].nameKey)} 已可释放，留给高压路更赚`,
                en: `${t(SKILLS[state.save.selectedSkill].nameKey)} is ready. Save it for the highest-pressure lane.`
            }),
            'skill',
            2.4
        );
        showToast(t('toastSkillReady'));
    }

    function tickBattleVisuals(delta) {
        if (!delta) return;
        state.battle.spawnBursts = state.battle.spawnBursts
            .map((burst) => ({ ...burst, timer: Math.max(0, burst.timer - delta) }))
            .filter((burst) => burst.timer > 0);
        state.battle.shotTraces = state.battle.shotTraces
            .map((trace) => ({ ...trace, timer: Math.max(0, trace.timer - delta) }))
            .filter((trace) => trace.timer > 0);
        state.battle.skillBursts = state.battle.skillBursts
            .map((burst) => ({ ...burst, timer: Math.max(0, burst.timer - delta) }))
            .filter((burst) => burst.timer > 0);
        state.battle.bannerTimer = Math.max(0, state.battle.bannerTimer - delta);
        state.battle.edgeFlashTimer = Math.max(0, state.battle.edgeFlashTimer - delta);
        state.battle.bossAlertTimer = Math.max(0, state.battle.bossAlertTimer - delta);
        state.battle.skillReadyPulse = Math.max(0, state.battle.skillReadyPulse - delta);
        state.battle.laneAlertTimers = state.battle.laneAlertTimers.map((timer) => Math.max(0, timer - delta));
        state.battle.hitBursts = state.battle.hitBursts
            .map((burst) => ({ ...burst, timer: Math.max(0, burst.timer - delta) }))
            .filter((burst) => burst.timer > 0);
        state.battle.defeatBursts = state.battle.defeatBursts
            .map((burst) => ({ ...burst, timer: Math.max(0, burst.timer - delta) }))
            .filter((burst) => burst.timer > 0);
        state.battle.coreImpactTimer = Math.max(0, state.battle.coreImpactTimer - delta);
        state.battle.coreImpactSeverity = state.battle.coreImpactTimer > 0
            ? Math.max(0, state.battle.coreImpactSeverity - delta * 1.8)
            : 0;
        state.battle.waveClearTimer = Math.max(0, state.battle.waveClearTimer - delta);
        state.battle.screenShakeTimer = Math.max(0, state.battle.screenShakeTimer - delta);
        state.battle.screenShakeStrength = state.battle.screenShakeTimer > 0
            ? Math.max(0, state.battle.screenShakeStrength - delta * 18)
            : 0;
        const nextAlerts = state.battle.alerts.filter((alert) => alert.expiresAt > performance.now());
        if (nextAlerts.length !== state.battle.alerts.length) {
            state.battle.alerts = nextAlerts;
            renderBattleAlerts();
        }
    }

    function fillRoundRect(ctx, x, y, width, height, radius) {
        const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
        ctx.beginPath();
        ctx.moveTo(x + safeRadius, y);
        ctx.lineTo(x + width - safeRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
        ctx.lineTo(x + width, y + height - safeRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
        ctx.lineTo(x + safeRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
        ctx.lineTo(x, y + safeRadius);
        ctx.quadraticCurveTo(x, y, x + safeRadius, y);
        ctx.closePath();
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
        syncStartOverlayState();
        renderSummary();
        renderHud();
        renderActionBar();
        renderLaneStrip();
        renderBattleAlerts();
        renderPanel();
        renderTabState();
        if (ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            renderPaymentOfferGrid();
            renderPaymentOrderUI();
            refreshPaymentVerificationState();
        }
        drawBattlefield();
    }

    function syncStartOverlayState() {
        if (!ui.startOverlay) return;
        const shouldShow = !state.battle.running && !state.battle.finished && !state.battle.awaitingUpgrade && !state.battle.paused;
        if (shouldShow) showOverlay(ui.startOverlay);
        else hideOverlay(ui.startOverlay);
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
        renderBattleInsights();
    }

    function renderActionBar() {
        ui.soundToggle.textContent = state.soundEnabled ? 'SFX ON' : 'SFX OFF';
        const skill = SKILLS[state.save.selectedSkill];
        const skillReady = state.battle.skillCooldown <= 0;
        ui.skillBtn.textContent = skillReady
            ? t('skillReady').replace('{skill}', t(skill.nameKey))
            : t('skillCooling').replace('{skill}', t(skill.nameKey)).replace('{time}', String(state.battle.skillCooldown.toFixed(1)));
        ui.skillBtn.disabled = !state.battle.running || state.battle.awaitingUpgrade || state.battle.paused;
        ui.pauseBtn.disabled = !state.battle.running || state.battle.finished;
        ui.skillBtn.classList.toggle('is-skill-ready', skillReady && state.battle.running && !state.battle.paused && !state.battle.awaitingUpgrade);
        ui.skillBtn.classList.toggle('is-skill-ready-fresh', skillReady && state.battle.skillReadyPulse > 0 && state.battle.running);
        ui.skillBtn.classList.toggle('is-boss-pressure', state.battle.bossAlertTimer > 0 && state.battle.running);
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
                    <div class="lane-meta">${tower ? `${t('laneStripLevel').replace('{level}', level)} · ${rarityLabel(tower.tier)}` : ''}</div>
                </button>
            `;
        }).join('');
    }

    function renderPanel() {
        switch (state.activeTab) {
            case 'prep': renderPrepTab(); break;
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
                zh: '开局先稳住中路，再用采集塔把前两波金币滚起来。',
                en: 'Stabilize the middle lane first, then let Harvest snowball the first two waves.'
            },
            '1-2': {
                zh: '第 2 波快怪会提速，EMP 不要在开场空放。',
                en: 'Fast enemies spike on wave 2, so do not waste EMP on the opener.'
            },
            '1-3': {
                zh: '先补减速路，再补爆裂路，开局别急着追求三路平均。',
                en: 'Lock in one slow lane and one splash lane before trying to balance all three.'
            },
            '2-1': {
                zh: '护盾怪开始抬头，优先让链击或轨炮接住中后段。',
                en: 'Shield units matter now, so let Chain or Rail own the mid-late stretch.'
            },
            '2-2': {
                zh: '至少一条路要先成型，再考虑用经济塔吃长线收益。',
                en: 'Complete one stable lane first, then convert spare room into economy.'
            },
            '2-3': {
                zh: '第 6 波前尽量保住满盾，终局会直接考你 Boss 处理。',
                en: 'Try to stay near full shield before wave 6 because the boss check is direct.'
            },
            '3-1': {
                zh: '开局优先稳住两路清线，再用超频把第三路的爆发抬起来。',
                en: 'Stabilize two lanes first, then use Overclock to raise the burst on the third.'
            },
            '3-2': {
                zh: '前两波先留技能，第 4 波开始会出现连续叠压。',
                en: 'Save your skill through the opener because chained pressure starts on wave 4.'
            },
            '3-3': {
                zh: '先保减速路和轨炮路，第 6 波前尽量把核心护盾补满。',
                en: 'Protect your slow lane and Rail lane first, and refill shield before wave 6.'
            }
        };
        return getLocalized(map[chapter.id] || {
            zh: '先看敌潮结构，再围绕当前最稳的两路来做开局部署。',
            en: 'Read the enemy mix first, then anchor your opener around the two most stable lanes.'
        });
    }

    function getChapterWavePlan(chapter) {
        const map = {
            '1-1': { zh: '节奏平稳，重点熟悉三路站位与升级时机。', en: 'A steady intro wave plan built to teach lanes and upgrade timing.' },
            '1-2': { zh: '第 2 波快怪试压，第 4 波开始出现更明显的分路拉扯。', en: 'Wave 2 tests fast enemy control and wave 4 starts lane-pulling pressure.' },
            '1-3': { zh: '第 3 波开始混入分裂怪，第 4-6 波更考验减速与溅射。', en: 'Split enemies start on wave 3 and waves 4-6 lean harder on slow plus splash.' },
            '2-1': { zh: '第 4 波起会连续出现高血单位，终局 Boss 更偏正面压制。', en: 'Wave 4 onward adds consecutive bulkier units before a direct boss check.' },
            '2-2': { zh: '中期波次会持续考验经济与输出同步成型。', en: 'Mid waves pressure both economy and damage at the same time.' },
            '2-3': { zh: '第 5-6 波明显提压，结尾以重 Boss 波做章节门槛。', en: 'Waves 5-6 spike sharply and the chapter closes on a heavy boss gate.' },
            '3-1': { zh: '第 2 波双侧快压，第 4 波双精英试压，第 6 波 Boss 前再补一轮侧路冲线。', en: 'Wave 2 sends side-lane speed pressure, wave 4 adds dual elites, and wave 6 rechecks side lanes before the boss.' },
            '3-2': { zh: '第 2 波双护盾起手，第 4-5 波连续叠加分裂与精英，第 6 波 Boss 带护盾支援。', en: 'Wave 2 opens with double shield pressure, waves 4-5 stack split plus elite threats, and wave 6 adds boss support pressure.' },
            '3-3': { zh: '第 2 波三路快压，第 4-5 波连续三线叠压，第 6 波 Boss 前后都有侧路精英补压。', en: 'Wave 2 pressures all three lanes, waves 4-5 keep triple-lane stacking, and wave 6 wraps the boss with side-lane elite pressure.' }
        };
        return getLocalized(map[chapter.id] || {
            zh: '波次会逐渐把三路一起抬压，务必提前准备稳定清线点。',
            en: 'Pressure rises toward all three lanes together, so prepare stable clear points early.'
        });
    }

    function getBattleWaveGuide(chapter, waveNumber) {
        const map = {
            '3-1': {
                2: { zh: '第 2 波双侧快压已进场，先看边路清线再决定是否交超频。', en: 'Wave 2 side-lane speed pressure is live. Read your side clears before spending Overclock.' },
                4: { zh: '第 4 波双精英会同时试压两侧，别把全部爆发压在同一路。', en: 'Wave 4 sends dual elites into the side lanes, so do not overcommit all burst to one lane.' },
                6: { zh: 'Boss 前还有一轮侧路冲线，核心护盾别在开波前就见底。', en: 'One more side-lane rush arrives before the boss, so do not enter the wave on empty shield.' }
            },
            '3-2': {
                2: { zh: '第 2 波双护盾会拖长战线，技能尽量继续保留。', en: 'Wave 2 double shield units extend the fight, so keep your skill held if possible.' },
                4: { zh: '第 4 波开始分裂与护盾叠压，链击 / 火箭会比单点更稳。', en: 'Wave 4 stacks split and shield pressure, making Chain or Rocket safer than single-target lanes.' },
                5: { zh: '第 5 波双精英是本章最危险的中段节点，必要时先交护盾。', en: 'Wave 5 dual elites are the most dangerous mid-run checkpoint here, so shielding early is fine.' },
                6: { zh: 'Boss 会带着支援怪一起压中后段，别等核心掉血后才补盾。', en: 'The boss arrives with support pressure, so refresh shield before the core starts leaking.' }
            },
            '3-3': {
                2: { zh: '第 2 波三路快压会直接摸底你的清线能力，优先保最脆的一路。', en: 'Wave 2 tests all three lanes immediately, so protect whichever lane is least stable.' },
                4: { zh: '第 4 波三线叠压开始成型，减速路不能断。', en: 'Wave 4 starts the true triple-lane stack, so your slow lane cannot collapse.' },
                5: { zh: '第 5 波会把护盾和精英一起抬上来，火箭 / 链击的覆盖比贪单发更重要。', en: 'Wave 5 stacks shield units with elites, so Rocket or Chain coverage beats greedy single shots.' },
                6: { zh: '最终波会在 Boss 两侧持续补压，先保住两翼再集中火力处理中心。', en: 'The final wave keeps feeding pressure into both sides of the boss, so hold the wings before hard-focusing center.' }
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
        return getChapterOpeningGuide(chapter);
    }

    function getLanePressureInfo(index) {
        const towerId = state.save.laneLoadout[index];
        const enemies = state.battle.enemies
            .filter((enemy) => enemy.lane === index)
            .sort((a, b) => b.y - a.y);
        const leadingEnemy = enemies[0] || null;
        const pushProgress = leadingEnemy ? Math.max(0, Math.min(1, leadingEnemy.y / SAFE_CORE_Y)) : 0;
        const densityPressure = Math.min(0.34, enemies.length * 0.08);
        const specialPressure = enemies.some((enemy) => enemy.boss) ? 0.34 : (enemies.some((enemy) => enemy.elite) ? 0.18 : 0);
        const pressure = Math.min(1, pushProgress * 0.68 + densityPressure + specialPressure);
        const towerName = towerId && TOWERS[towerId] ? towerLabel(towerId) : getLocalized({ zh: '空位', en: 'Empty' });
        const dps = towerId && TOWERS[towerId] ? Math.round(getTowerPreviewDps(towerId)) : 0;
        let tone = 'idle';
        let stateLabel = getLocalized({ zh: '待战', en: 'Standby' });
        if (enemies.length) {
            if (pressure >= 0.72) {
                tone = 'danger';
                stateLabel = getLocalized({ zh: '高压', en: 'Danger' });
            } else if (pressure >= 0.4) {
                tone = 'rising';
                stateLabel = getLocalized({ zh: '接敌', en: 'Engaged' });
            } else {
                tone = 'stable';
                stateLabel = getLocalized({ zh: '稳住', en: 'Stable' });
            }
        }
        return {
            index,
            laneName: getLaneName(index),
            towerName,
            dps,
            enemies,
            enemyCount: enemies.length,
            leadingEnemy,
            leadingLabel: leadingEnemy ? enemyLabel(leadingEnemy.type) : getLocalized({ zh: '暂无敌人', en: 'No enemies' }),
            progress: pressure,
            progressPercent: Math.round(pressure * 100),
            pushPercent: Math.round(pushProgress * 100),
            tone,
            stateLabel
        };
    }

    function getUpcomingSpawnPreview(limit = 3) {
        const upcoming = state.battle.spawnQueue.slice(0, limit).map((spawn) => {
            const remain = Math.max(0, spawn.at - state.battle.currentWaveElapsed);
            return `${getLaneName(spawn.lane)} · ${enemyLabel(spawn.type)} · ${remain.toFixed(1)}s`;
        });
        if (upcoming.length) return upcoming.join(' / ');
        if (state.battle.running) {
            return getLocalized({
                zh: '本波敌人已出完，清场后就会进入强化选择。',
                en: 'All enemies for this wave have spawned. Clear the field to enter the upgrade choice.'
            });
        }
        return `${t('enemyPreview')}：${getCurrentChapter().enemies.map((enemyId) => enemyLabel(enemyId)).join(' / ')}`;
    }

    function getBattleDirectiveSummary(chapter, laneInfoList) {
        if (state.battle.awaitingUpgrade) {
            return {
                title: getLocalized({ zh: '本波已清空，先选强化再继续', en: 'Wave cleared. Pick an upgrade first.' }),
                body: getLocalized({ zh: '优先补当前短板：清线不稳补攻速 / 溅射，核心吃压就补护盾或减速。', en: 'Patch the weakest point first: add fire rate/splash for lane clear, or shield/slow if the core is under pressure.' })
            };
        }
        if (state.battle.finished) {
            return state.battle.result?.win
                ? {
                    title: getLocalized({ zh: '防线守住了，可以继续冲章节', en: 'Defense held. You can push the next chapter.' }),
                    body: getLocalized({ zh: '先看结算里哪种碎片和资源回流最多，再决定是补研究还是继续冲关。', en: 'Check which fragments and resources came back strongest, then decide between research or another push.' })
                }
                : {
                    title: getLocalized({ zh: '这次是被卡点打穿了', en: 'This run hit a wall.' }),
                    body: getLocalized({ zh: '回头补最薄弱的一路，或者先升研究与炮台等级，再回来挑战会更稳。', en: 'Patch the weakest lane or upgrade research and towers before retrying.' })
                };
        }
        if (!state.battle.running) {
            return {
                title: getLocalized({ zh: '开局前先看清三路分工', en: 'Read the three-lane roles before starting.' }),
                body: getChapterDirective(chapter)
            };
        }
        if (state.battle.paused) {
            return {
                title: getLocalized({ zh: '战斗已暂停，恢复后会从当前波继续', en: 'Battle is paused and resumes from the current wave.' }),
                body: getLocalized({ zh: '看右上方技能和三路压力，再决定是立刻恢复还是先调整装配。', en: 'Check skill timing and lane pressure, then decide whether to resume immediately or adjust loadout first.' })
            };
        }
        const hottestLane = laneInfoList.slice().sort((a, b) => b.progress - a.progress)[0];
        const skillName = t(SKILLS[state.save.selectedSkill].nameKey);
        if (state.battle.skillCooldown <= 0 && hottestLane && (hottestLane.tone === 'danger' || hottestLane.enemyCount >= 4)) {
            return {
                title: getLocalized({
                    zh: `${hottestLane.laneName} 已进入高压区，可准备交 ${skillName}`,
                    en: `${hottestLane.laneName} is under pressure. ${skillName} is ready.`
                }),
                body: getLocalized({
                    zh: '别急着在平稳波次空放技能，等高速怪、精英或 Boss 真正贴近核心时再交更赚。',
                    en: 'Do not dump the skill during a calm stretch. Wait until fast enemies, elites, or the boss truly threaten the core.'
                })
            };
        }
        return {
            title: getLocalized({ zh: `当前重点：第 ${state.battle.currentWave} 波的节奏控制`, en: `Current focus: pacing wave ${state.battle.currentWave}` }),
            body: getBattleWaveGuide(chapter, state.battle.currentWave)
        };
    }

    function getSkillTimingHint(laneInfoList) {
        const skillName = t(SKILLS[state.save.selectedSkill].nameKey);
        if (!state.battle.running) {
            return getLocalized({
                zh: `技能定位：${skillName}。开局先观察两波节奏，再决定什么时候交技能。`,
                en: `Skill role: ${skillName}. Watch the first two waves before committing it.`
            });
        }
        if (state.battle.skillCooldown > 0) {
            return getLocalized({
                zh: `${skillName} 冷却中，还需 ${state.battle.skillCooldown.toFixed(1)} 秒。`,
                en: `${skillName} is cooling down for ${state.battle.skillCooldown.toFixed(1)}s more.`
            });
        }
        if (laneInfoList.some((lane) => lane.leadingEnemy?.boss)) {
            return getLocalized({
                zh: `${skillName} 已就绪，Boss 已入场，这一轮可以直接交。`,
                en: `${skillName} is ready and the boss is on the field. This is a good cast window.`
            });
        }
        if (laneInfoList.some((lane) => lane.enemyCount >= 3 && lane.tone !== 'idle')) {
            return getLocalized({
                zh: `${skillName} 已就绪，等敌人真正堆在一路时交会更值。`,
                en: `${skillName} is ready. Wait until a lane truly stacks up for more value.`
            });
        }
        return getLocalized({
            zh: `${skillName} 已就绪，先留着应对后续高压或 Boss。`,
            en: `${skillName} is ready. Hold it for the next spike or boss.`
        });
    }

    function renderBattleInsights() {
        if (!ui.battleInsights) return;
        const chapter = getCurrentChapter();
        const laneInfoList = [0, 1, 2].map((index) => getLanePressureInfo(index));
        const stamp = JSON.stringify({
            lang: state.lang,
            chapter: chapter.id,
            selectedSkill: state.save.selectedSkill,
            laneLoadout: state.save.laneLoadout.join('|'),
            laneLevels: state.save.laneLoadout.map((towerId) => getTowerLevel(towerId)).join('|'),
            running: state.battle.running,
            paused: state.battle.paused,
            finished: state.battle.finished,
            awaitingUpgrade: state.battle.awaitingUpgrade,
            wave: state.battle.currentWave,
            core: Math.round(state.battle.coreHp),
            shield: Math.round(state.battle.shield / 10),
            cooldown: Math.ceil(state.battle.skillCooldown),
            lanes: laneInfoList.map((lane) => `${lane.tone}:${lane.enemyCount}:${lane.leadingEnemy?.type || 'none'}:${Math.round(lane.progress * 5)}`),
            next: state.battle.spawnQueue.slice(0, 3).map((spawn) => `${spawn.type}:${spawn.lane}:${Math.ceil(Math.max(0, spawn.at - state.battle.currentWaveElapsed))}`).join('|'),
            kills: state.battle.runStats.kills,
            damage: Math.round(state.battle.runStats.damage / 100)
        });
        if (stamp === lastBattleInsightStamp) return;
        lastBattleInsightStamp = stamp;
        const directive = getBattleDirectiveSummary(chapter, laneInfoList);
        const summaryChipUpcoming = state.battle.running
            ? getLocalized({ zh: `下一波：${getUpcomingSpawnPreview(2)}`, en: `Next: ${getUpcomingSpawnPreview(2)}` })
            : getUpcomingSpawnPreview(2);
        const summaryChipPerformance = state.battle.running || state.battle.finished
            ? getLocalized({
                zh: `本局击杀 ${formatCompact(state.battle.runStats.kills)} · 伤害 ${formatCompact(Math.round(state.battle.runStats.damage))}`,
                en: `Run ${formatCompact(state.battle.runStats.kills)} kills · ${formatCompact(Math.round(state.battle.runStats.damage))} damage`
            })
            : t('startMetaReward')
                .replace('{gold}', formatCompact(chapter.goldReward))
                .replace('{core}', formatCompact(chapter.coreReward))
                .replace('{fragment}', formatCompact(chapter.fragmentReward));
        const summaryChipAnchor = state.battle.running || state.battle.finished
            ? getLocalized({
                zh: `核心护盾 ${formatCompact(Math.round(state.battle.shield))}`,
                en: `Core shield ${formatCompact(Math.round(state.battle.shield))}`
            })
            : getLocalized({
                zh: `推荐战力 ${formatCompact(chapter.recommended)}`,
                en: `Recommended power ${formatCompact(chapter.recommended)}`
            });
        ui.battleInsights.innerHTML = `
            <div class="battle-insight-grid">
                ${laneInfoList.map((lane) => `
                    <article class="lane-pressure-card is-${lane.tone}">
                        <div class="lane-pressure-head">
                            <span class="lane-pressure-title">${lane.laneName}</span>
                            <span class="lane-pressure-state">${lane.stateLabel}</span>
                        </div>
                        <div class="lane-pressure-main">${lane.towerName}</div>
                        <div class="lane-pressure-sub">${getLocalized({
                            zh: `${lane.enemyCount} 敌 · DPS ${formatCompact(lane.dps)}`,
                            en: `${lane.enemyCount} foes · DPS ${formatCompact(lane.dps)}`
                        })}</div>
                        <div class="pressure-track">
                            <span class="pressure-bar" style="width:${lane.progressPercent}%;"></span>
                        </div>
                        <div class="lane-pressure-meta">${lane.leadingEnemy
                            ? getLocalized({
                                zh: `前锋 ${lane.leadingLabel} · 推进 ${lane.pushPercent}%`,
                                en: `${lane.leadingLabel} · ${lane.pushPercent}% pushed`
                            })
                            : getLocalized({
                                zh: `当前空闲 · 可继续滚经济`,
                                en: `Idle lane · safe for economy`
                            })}</div>
                    </article>
                `).join('')}
            </div>
            <div class="battle-insight-summary">
                <div class="battle-insight-kicker">${getLocalized({ zh: '战况速览', en: 'Battle Readout' })}</div>
                <div class="battle-insight-title">${directive.title}</div>
                <div class="battle-insight-body">${directive.body}</div>
                <div class="battle-insight-chip-row">
                    <span class="mini-chip">${summaryChipUpcoming}</span>
                    <span class="mini-chip">${getSkillTimingHint(laneInfoList)}</span>
                    <span class="mini-chip">${summaryChipPerformance}</span>
                    <span class="mini-chip">${summaryChipAnchor}</span>
                </div>
            </div>
        `;
    }

    function getChapterDirective(chapter) {
        const map = {
            '1-1': {
                zh: '建议以脉冲塔 / 激光塔 / 采集塔起步，先稳住清线效率和前期金币回流。',
                en: 'Open with Pulse / Laser / Harvest to stabilize lanes and build early economy.'
            },
            '1-2': {
                zh: '高速怪会明显增加，优先让激光塔守主路，并把 EMP 留给最密集的冲线波次。',
                en: 'Fast enemies spike here. Let Laser hold the main lane and save EMP for the densest rushes.'
            },
            '1-3': {
                zh: '分裂怪和精英开始成型，霜冻塔 + 火箭塔的减速爆裂组合会比纯经济更稳。',
                en: 'Split enemies and elites start to matter, so Frost + Rocket is safer than pure economy.'
            },
            '2-1': {
                zh: '护盾怪血量抬升后，链击塔开始接管中后段火力，超频适合用来强顶高压波次。',
                en: 'As shield units grow bulkier, Chain takes over mid-late DPS and Overclock carries pressure spikes.'
            },
            '2-2': {
                zh: '这是经济与输出双检定章节，至少保证一路稳定清线，再补采集塔做滚雪球。',
                en: 'This chapter tests both economy and damage. Lock one lane first, then snowball with Harvest.'
            },
            '2-3': {
                zh: 'Boss 波极重，优先准备高等级轨炮 / 链击组合，并在最终波前尽量保满核心护盾。',
                en: 'The boss wave is brutal. Prioritize high-level Rail / Chain setups and keep the core shield healthy.'
            },
            '3-1': {
                zh: '至少让两路具备稳定清线能力，再用超频把第三路的爆发抬起来；单靠采集塔滚雪球会明显吃力。',
                en: 'Make sure two lanes can clear consistently, then use Overclock to raise the burst on the third lane. Harvest-only snowballing gets punished here.'
            },
            '3-2': {
                zh: '护盾怪与分裂怪会连续施压，建议用护盾技能硬顶危险波，并让链击 / 火箭负责处理中后段堆怪。',
                en: 'Shield and split enemies stack together, so use the shield skill to absorb danger spikes and let Chain/Rocket handle clustered mid-late lanes.'
            },
            '3-3': {
                zh: '终章的关键不是单路极限输出，而是三路都不能崩。优先保住减速路与轨炮路，再用剩余资源补足第三路。',
                en: 'The final chapter is less about one perfect lane and more about preventing any lane collapse. Protect your slow lane and Rail lane first, then patch the third lane.'
            }
        };
        return getLocalized(map[chapter.id] || {
            zh: '围绕当前章节敌潮特性调整装配与技能，让三路压力尽量均衡。',
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

    function applyChapterPreset(chapterId, applySkill = true, options = {}) {
        const { showNotice = true, rerender = true } = options;
        const chapter = CHAPTERS.find((item) => item.id === chapterId) || getCurrentChapter();
        const preset = getChapterLoadoutPreset(chapter);
        state.save.laneLoadout = preset.lanes.slice(0, 3);
        if (applySkill) {
            state.save.selectedSkill = preset.skill;
        }
        saveProgress();
        if (showNotice) {
            showToast(getLocalized({
                zh: applySkill ? `已应用 ${chapter.id} 推荐编队` : `已应用 ${chapter.id} 推荐火力组合`,
                en: applySkill ? `${chapter.id} preset applied` : `${chapter.id} lane preset applied`
            }));
        }
        if (rerender) renderAll();
    }

    function getChapterPrepOverview(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const preset = getChapterLoadoutPreset(chapter, saveSnapshot);
        const currentLanes = [0, 1, 2].map((laneIndex) => saveSnapshot.laneLoadout?.[laneIndex] || preset.lanes[laneIndex] || 'pulse');
        const currentSkill = saveSnapshot.selectedSkill || preset.skill;
        const laneMatches = preset.lanes.map((towerId, laneIndex) => currentLanes[laneIndex] === towerId);
        const skillMatches = currentSkill === preset.skill;
        const powerGap = Math.max(0, Math.round(chapter.recommended - getPowerRating(saveSnapshot)));
        const adjustmentsNeeded = laneMatches.filter((matched) => !matched).length + (skillMatches ? 0 : 1);
        return {
            preset,
            currentLanes,
            currentSkill,
            laneMatches,
            skillMatches,
            powerGap,
            adjustmentsNeeded,
            ready: adjustmentsNeeded === 0 && powerGap <= 0
        };
    }

    function getResearchMeta(researchId) {
        const titleMap = {
            attack: state.lang === 'zh' ? '火力矩阵' : 'Damage Matrix',
            cadence: state.lang === 'zh' ? '冷却回路' : 'Cooldown Circuit',
            fortify: state.lang === 'zh' ? '核心装甲' : 'Core Armor',
            salvage: state.lang === 'zh' ? '战利回收' : 'Salvage Recovery',
            relay: state.lang === 'zh' ? '继电增幅' : 'Relay Amplifier'
        };
        const descMap = {
            attack: state.lang === 'zh' ? '提升所有炮台基础伤害。' : 'Improves base damage for all towers.',
            cadence: state.lang === 'zh' ? '提升所有炮台攻击频率。' : 'Improves attack speed for all towers.',
            fortify: state.lang === 'zh' ? '提升核心上限与护盾容量。' : 'Raises max core HP and shield.',
            salvage: state.lang === 'zh' ? '提升本局金币收益和采集塔回收量。' : 'Improves gold rewards and harvest returns.',
            relay: state.lang === 'zh' ? '缩短主动技能冷却，并提升技能强度。' : 'Shortens active skill cooldown and strengthens the skill.'
        };
        return {
            title: titleMap[researchId] || researchId,
            desc: descMap[researchId] || ''
        };
    }

    function getResearchRecommendationReason(researchId, chapter = getCurrentChapter(), preset = getChapterLoadoutPreset(chapter)) {
        const enemies = new Set(chapter.enemies || []);
        switch (researchId) {
            case 'attack':
                return enemies.has('boss') || enemies.has('shield')
                    ? getLocalized({ zh: '当前章节有护盾怪或 Boss，优先补足单发伤害更稳。', en: 'Shield units and bosses in this chapter make stronger per-shot damage the safest push.' })
                    : getLocalized({ zh: '这是最稳定的通用火力补强，能直接缩短每波清场时间。', en: 'This is the most reliable all-purpose firepower upgrade for shortening each wave.' });
            case 'cadence':
                return enemies.has('fast')
                    ? getLocalized({ zh: '高速怪压力明显，先补攻速更容易守住前排节奏。', en: 'Fast enemies are the main pressure here, so extra fire rate helps stabilize the front line.' })
                    : getLocalized({ zh: '当前推荐阵容里有持续输出塔，攻速收益会更直观。', en: 'Your current recommended loadout has sustained-fire towers, so attack speed pays off quickly.' });
            case 'fortify':
                return enemies.has('elite') || enemies.has('boss') || preset.skill === 'shield'
                    ? getLocalized({ zh: '精英波和 Boss 波更吃核心容错，核心装甲能提高续航。', en: 'Elite and boss waves reward more core durability, making this the safer survival pick.' })
                    : getLocalized({ zh: '如果你经常被后段压穿，先补核心装甲会更稳。', en: 'If late waves keep leaking through, fortify is the most stable fix.' });
            case 'salvage':
                return preset.lanes.includes('harvest')
                    ? getLocalized({ zh: '当前推荐阵容带采集塔，战利回收会同步放大金币循环。', en: 'The current preset includes Harvest, so salvage upgrades amplify your gold loop immediately.' })
                    : getLocalized({ zh: '当你想加快后续金币循环时，战利回收是最稳的经济补强。', en: 'When you want faster long-term gold flow, Salvage is the most reliable economy upgrade.' });
            case 'relay':
                return preset.skill === 'shield' || preset.skill === 'overclock'
                    ? getLocalized({ zh: '当前章节推荐主动技吃频率，继电增幅能明显改善关键波的技能覆盖。', en: 'The recommended active skill benefits a lot from tighter cooldown coverage in this chapter.' })
                    : getLocalized({ zh: '主动技能越快转好，越容易接住高压波次。', en: 'Shorter skill cycles make high-pressure waves much easier to absorb.' });
            default:
                return getLocalized({ zh: '先补这个分支能更平滑地推进当前章节。', en: 'This branch gives the smoothest progression into the current chapter.' });
        }
    }

    function getResearchUpgradePlan(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const preset = getChapterLoadoutPreset(chapter, saveSnapshot);
        const enemies = new Set(chapter.enemies || []);
        const currentPower = getPowerRating(saveSnapshot);
        const powerGap = Math.max(0, Math.round(chapter.recommended - currentPower));
        const rankedPlan = Object.keys(RESEARCH).map((researchId) => {
            const research = RESEARCH[researchId];
            const level = getResearchLevel(researchId, saveSnapshot);
            const maxLevel = research.maxLevel;
            const maxed = level >= maxLevel;
            const cost = maxed
                ? 0
                : Math.round(
                    research.baseCost
                    + research.stepCost * level
                    + Math.max(0, level - 2) * research.stepCost * 0.12
                    + Math.max(0, level - 5) * research.stepCost * 0.18
                );
            let score = 10;
            if (researchId === 'attack') {
                score += 16 + (powerGap > 0 ? 10 : 4);
                if (enemies.has('shield')) score += 12;
                if (enemies.has('boss')) score += 10;
                if (preset.lanes.some((towerId) => ['rocket', 'rail', 'chain'].includes(towerId))) score += 8;
            }
            if (researchId === 'cadence') {
                score += 14 + (powerGap > 0 ? 8 : 4);
                if (enemies.has('fast')) score += 16;
                if (preset.lanes.some((towerId) => ['pulse', 'laser', 'frost', 'chain'].includes(towerId))) score += 8;
            }
            if (researchId === 'fortify') {
                score += 10;
                if (enemies.has('elite')) score += 8;
                if (enemies.has('boss')) score += 10;
                if (powerGap > 180) score += 4;
                if (preset.skill === 'shield') score += 6;
            }
            if (researchId === 'salvage') {
                score += 8;
                if (preset.lanes.includes('harvest')) score += 16;
                if ((saveSnapshot.gold || 0) < 1200) score += 6;
            }
            if (researchId === 'relay') {
                score += 9;
                if (preset.skill === 'shield') score += 10;
                if (preset.skill === 'overclock') score += 8;
                if (preset.skill === 'emp') score += 5;
                if (enemies.has('boss')) score += 4;
            }
            score -= level * 1.6;
            if (!maxed && (saveSnapshot.gold || 0) >= cost) score += 6;
            if (maxed) score = -999;
            const currentEffect = research.effect(level);
            const nextEffect = research.effect(Math.min(maxLevel, level + 1));
            return {
                id: researchId,
                level,
                maxLevel,
                maxed,
                cost,
                affordable: !maxed && (saveSnapshot.gold || 0) >= cost,
                shortage: !maxed ? Math.max(0, cost - (saveSnapshot.gold || 0)) : 0,
                score,
                currentEffect,
                nextEffect,
                nextDelta: Math.max(0, nextEffect - currentEffect),
                meta: getResearchMeta(researchId),
                reason: getResearchRecommendationReason(researchId, chapter, preset)
            };
        }).sort((a, b) => b.score - a.score || a.cost - b.cost || a.id.localeCompare(b.id));

        const activeList = rankedPlan.filter((item) => !item.maxed);
        activeList.forEach((item, index) => {
            item.rank = index + 1;
        });
        rankedPlan.filter((item) => item.maxed).forEach((item) => {
            item.rank = 0;
        });
        const list = [...activeList, ...rankedPlan.filter((item) => item.maxed)];

        return {
            powerGap,
            top: activeList[0] || null,
            topAffordable: activeList.find((item) => item.affordable) || null,
            list
        };
    }

    function startChapterWithPreset(chapterId) {
        const chapterIndex = CHAPTERS.findIndex((item) => item.id === chapterId);
        if (chapterIndex >= 0 && state.save.chapterIndex !== chapterIndex) {
            state.save.chapterIndex = chapterIndex;
        }
        applyChapterPreset(chapterId, true, { showNotice: false, rerender: false });
        startBattle(false);
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
            ? getLocalized({ zh: '日常补给可领取', en: 'Daily supply ready' })
            : getLocalized({
                zh: `下一次补给 ${formatTime(DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - state.save.dailySupplyAt))}`,
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

    function getDefendQuickAccessItems(prepOverview, economyPreview) {
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        const seasonTotalReady = economyPreview.seasonReady + economyPreview.sponsorReady;
        const researchReadyCount = Object.keys(RESEARCH).filter((id) => canUpgradeResearch(id)).length;
        return [
            {
                label: getLocalized({ zh: '装配', en: 'Loadout' }),
                value: prepOverview.adjustmentsNeeded > 0
                    ? getLocalized({ zh: `待调 ${prepOverview.adjustmentsNeeded}`, en: `${prepOverview.adjustmentsNeeded} left` })
                    : getLocalized({ zh: '已就绪', en: 'Ready' }),
                meta: getLocalized({ zh: '三路 + 技能', en: '3 lanes + skill' }),
                action: 'openTab',
                data: 'loadout',
                tone: prepOverview.adjustmentsNeeded > 0 ? 'warn' : 'ready'
            },
            {
                label: getLocalized({ zh: '研究', en: 'Research' }),
                value: researchReadyCount > 0
                    ? getLocalized({ zh: `可升 ${researchReadyCount}`, en: `${researchReadyCount} ready` })
                    : getLocalized({ zh: '查看', en: 'View' }),
                meta: getLocalized({ zh: '火力 / 冷却 / 护盾', en: 'Damage / Cadence / Shield' }),
                action: 'openTab',
                data: 'research',
                tone: researchReadyCount > 0 ? 'ready' : 'neutral'
            },
            {
                label: getLocalized({ zh: '任务', en: 'Missions' }),
                value: economyPreview.missionReady > 0 ? `x${economyPreview.missionReady}` : '0',
                meta: economyPreview.missionReady > 0
                    ? getLocalized({ zh: '待领取', en: 'Claimable' })
                    : getLocalized({ zh: '进行中', en: 'In progress' }),
                action: 'openTab',
                data: 'missions',
                tone: economyPreview.missionReady > 0 ? 'ready' : 'neutral'
            },
            {
                label: getLocalized({ zh: '赛季', en: 'Season' }),
                value: seasonTotalReady > 0 ? `x${seasonTotalReady}` : `Lv.${seasonInfo.level}`,
                meta: seasonTotalReady > 0
                    ? getLocalized({ zh: '奖励待领', en: 'Rewards ready' })
                    : getLocalized({ zh: '轨道进度', en: 'Track progress' }),
                action: 'openTab',
                data: 'season',
                tone: seasonTotalReady > 0 ? 'ready' : 'neutral'
            },
            {
                label: getLocalized({ zh: '补给', en: 'Supply' }),
                value: economyPreview.dailyReady
                    ? getLocalized({ zh: '可领取', en: 'Ready' })
                    : (hasShopRedDot()
                        ? getLocalized({ zh: '可购买', en: 'Deals' })
                        : getLocalized({ zh: '打开', en: 'Open' })),
                meta: economyPreview.dailyReady
                    ? getLocalized({ zh: '日常补给', en: 'Daily supply' })
                    : getLocalized({ zh: '商店 / 充值', en: 'Shop / top-up' }),
                action: economyPreview.dailyReady ? 'claimDaily' : 'openTab',
                data: economyPreview.dailyReady ? 'daily' : 'shop',
                tone: economyPreview.dailyReady ? 'ready' : (hasShopRedDot() ? 'warn' : 'neutral')
            }
        ];
    }

    function renderCompactKpiGrid(items) {
        return `
            <div class="compact-kpi-grid">
                ${items
                    .filter(Boolean)
                    .map((item) => `
                        <div class="compact-kpi">
                            <span>${item.label}</span>
                            <strong>${item.value}</strong>
                        </div>
                    `)
                    .join('')}
            </div>
        `;
    }

    function renderInlineLinkRow(items = []) {
        const nodes = items
            .filter((item) => item && item.label && item.action)
            .map((item) => `
                <button class="ghost-btn" type="button" data-action="${item.action}" data-value="${item.value || ''}">
                    ${item.label}
                </button>
            `)
            .join('');
        return nodes ? `<div class="inline-link-row">${nodes}</div>` : '';
    }

    function renderLimitedChipMarkup(chips = [], options = {}) {
        const limit = Number.isFinite(options.limit) ? options.limit : Infinity;
        const visible = chips.filter(Boolean);
        if (visible.length > limit) {
            const hiddenCount = visible.length - limit;
            return [
                ...visible.slice(0, limit),
                `<span class="mini-chip is-muted">${getLocalized({ zh: `+${hiddenCount} 项`, en: `+${hiddenCount} more` })}</span>`
            ].join('');
        }
        return visible.join('');
    }

    function renderDefendTab() {
        const current = getCurrentChapter();
        const focusPreview = getChapterFocusPreview(current);
        const recommendedSkill = t(SKILLS[getRecommendedSkillIdForChapter(current)].nameKey);
        const economyPreview = getDefenseEconomyPreview(current);
        const prepOverview = getChapterPrepOverview(current);
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        const researchReadyCount = Object.keys(RESEARCH).filter((researchId) => canUpgradeResearch(researchId)).length;
        const battleActive = state.battle.running && !state.battle.finished;
        const battlePaused = battleActive && state.battle.paused;
        const battleWave = battleActive ? Math.max(1, state.battle.currentWave || 1) : 0;
        const currentSkillId = state.save.selectedSkill || prepOverview.currentSkill || prepOverview.preset.skill;
        const currentSkillLabel = t(SKILLS[currentSkillId].nameKey);
        const laneSummary = prepOverview.currentLanes
            .map((towerId, laneIndex) => `${getLaneName(laneIndex)}·${towerLabel(towerId)}`)
            .join(' / ');
        const battleStatusLabel = state.battle.finished
            ? getLocalized({ zh: '本局已结束', en: 'Run finished' })
            : battlePaused
                ? getLocalized({ zh: '战斗已暂停', en: 'Battle paused' })
                : battleActive
                    ? getLocalized({ zh: `第 ${battleWave}/${TOTAL_WAVES} 波进行中`, en: `Wave ${battleWave}/${TOTAL_WAVES} live` })
                    : prepOverview.ready
                        ? getLocalized({ zh: '部署完成，可直接开战', en: 'Ready to defend' })
                        : getLocalized({ zh: `还差 ${prepOverview.adjustmentsNeeded} 项部署`, en: `${prepOverview.adjustmentsNeeded} setup items left` });
        const statusChipLabel = state.battle.finished
            ? getLocalized({ zh: '已结算', en: 'Finished' })
            : battlePaused
                ? getLocalized({ zh: '已暂停', en: 'Paused' })
                : battleActive
                    ? getLocalized({ zh: `第${battleWave}波`, en: `Wave ${battleWave}` })
                    : prepOverview.ready
                        ? getLocalized({ zh: '可开战', en: 'Ready' })
                        : getLocalized({ zh: `待调 ${prepOverview.adjustmentsNeeded}`, en: `${prepOverview.adjustmentsNeeded} left` });
        const battleStatusCopy = state.battle.finished
            ? getLocalized({
                zh: '本局已经结算完成。想继续推进时，可先去“部署”页切章节，再返回这里开打。',
                en: 'The run is complete. Open Setup to choose the next chapter, then come back here to start again.'
            })
            : battlePaused
                ? getLocalized({
                    zh: '你刚离开战斗页时系统已自动暂停；回到这里后可直接继续，不会丢失本局进度。',
                    en: 'The battle auto-paused when you left the combat view, so you can safely resume from here.'
                })
                : battleActive
                    ? getLocalized({
                        zh: '战斗已经在上方主视野中进行，这里只保留关键信息与快捷操作，尽量不打扰战场视野。',
                        en: 'The fight is already live in the main battlefield above. This panel keeps only compact status and quick actions.'
                    })
                    : prepOverview.ready
                        ? getLocalized({
                            zh: '当前章节、三路装配和主动技能已经达标，点击开始即可直接进入战斗界面。',
                            en: 'Your current chapter, lane setup, and active skill are aligned. Start when you are ready.'
                        })
                        : getLocalized({
                            zh: '如果你还看不清该怎么配，直接进“部署”页按顺序看章节说明、推荐技能和一键编队即可。',
                            en: 'If the setup still feels unclear, open Setup and follow the chapter guide, skill suggestion, and one-tap preset.'
                        });
        const primaryAction = battlePaused
            ? {
                action: 'resumeBattle',
                value: 'resume',
                label: getLocalized({ zh: '继续战斗', en: 'Resume Battle' })
            }
            : battleActive
                ? null
                : prepOverview.ready
                    ? {
                        action: 'startChapter',
                        value: current.id,
                        label: getLocalized({ zh: '开始防守', en: 'Start Defense' })
                    }
                    : {
                        action: 'openTab',
                        value: 'prep',
                        label: getLocalized({ zh: '前往部署', en: 'Open Setup' })
                    };
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('defendPanelTitle'),
                getLocalized({
                    zh: '这里只看战斗状态、当前章节和快捷入口；章节选择、敌潮说明与推荐部署已独立到“部署”页。',
                    en: 'This view now focuses on battle status, the current chapter, and fast actions. Chapter selection and prep details live in Setup.'
                }),
                `<div class="mini-chip">${current.id} · ${statusChipLabel}</div>`
            )}
            <div class="defend-battle-layout">
                <article class="defend-primary-card stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '战斗总览', en: 'Battle Overview' })}</div>
                            <div class="card-title">${battleStatusLabel}</div>
                        </div>
                        <div class="card-number">${prepOverview.powerGap > 0
                            ? getLocalized({ zh: `差 ${formatCompact(prepOverview.powerGap)}`, en: `Gap ${formatCompact(prepOverview.powerGap)}` })
                            : getLocalized({ zh: '已达标', en: 'On target' })}</div>
                    </div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '当前章节', en: 'Chapter' }), value: current.id },
                        { label: getLocalized({ zh: '波次', en: 'Wave' }), value: battleActive ? `${battleWave}/${TOTAL_WAVES}` : `0/${TOTAL_WAVES}` },
                        { label: getLocalized({ zh: '待领奖励', en: 'Claims' }), value: String(economyPreview.claimableTotal) },
                        { label: t('seasonLabel'), value: `Lv.${seasonInfo.level}` }
                    ])}
                    <div class="chip-row defend-chip-row">
                        <span class="mini-chip">${t('enemyPreview')} ${current.enemies.map((enemyId) => enemyLabel(enemyId)).join(' / ')}</span>
                        <span class="mini-chip">${getLocalized({ zh: `当前技能 ${currentSkillLabel}`, en: `Skill ${currentSkillLabel}` })}</span>
                        <span class="mini-chip">${getLocalized({ zh: `掉落倾向 ${focusPreview}`, en: `Focus ${focusPreview}` })}</span>
                        <span class="mini-chip">${t('rewardPreview')} ${formatCompact(current.goldReward)}G / ${formatCompact(current.coreReward)}C / ${formatCompact(current.fragmentReward)} ${t('fragmentLabel')}</span>
                    </div>
                    <div class="defend-inline-note">${battleStatusCopy}</div>
                    <div class="card-actions compact defend-card-actions">
                        ${primaryAction
                            ? `<button class="primary-btn" type="button" data-action="${primaryAction.action}" data-value="${primaryAction.value}">
                                ${primaryAction.label}
                            </button>`
                            : `<button class="primary-btn" type="button" disabled>
                                ${getLocalized({ zh: '战斗进行中', en: 'Battle Live' })}
                            </button>`}
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="prep">
                            ${getLocalized({ zh: '章节部署', en: 'Open Setup' })}
                        </button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="loadout">
                            ${getLocalized({ zh: '去装配页', en: 'Open Loadout' })}
                        </button>
                    </div>
                </article>
                <div class="card-grid defend-side-grid">
                    <article class="stat-card defend-side-card">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${getLocalized({ zh: '当前部署', en: 'Current Setup' })}</div>
                                <div class="card-title">${prepOverview.ready
                                    ? getLocalized({ zh: '编队已就绪', en: 'Preset ready' })
                                    : getLocalized({ zh: `待调整 ${prepOverview.adjustmentsNeeded} 项`, en: `${prepOverview.adjustmentsNeeded} tweaks left` })}</div>
                            </div>
                            <div class="card-number">${formatCompact(getPowerRating(state.save))}</div>
                        </div>
                        <div class="card-copy">${laneSummary}</div>
                        <div class="defend-side-copy">${getLocalized({
                            zh: `推荐主动技能：${recommendedSkill}`,
                            en: `Recommended skill: ${recommendedSkill}`
                        })}</div>
                    </article>
                    <article class="stat-card defend-side-card">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${getLocalized({ zh: '敌潮焦点', en: 'Enemy Focus' })}</div>
                                <div class="card-title">${getLocalized({ zh: '本章威胁', en: 'Pressure Mix' })}</div>
                            </div>
                            <div class="card-number">${getLocalized({ zh: `${current.enemies.length}类`, en: `${current.enemies.length} types` })}</div>
                        </div>
                        <div class="card-copy">${getChapterWavePlan(current)}</div>
                        <div class="defend-side-copy">${getChapterOpeningGuide(current)}</div>
                    </article>
                    <article class="stat-card defend-side-card">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${getLocalized({ zh: '成长入口', en: 'Progression' })}</div>
                                <div class="card-title">${researchReadyCount > 0
                                    ? getLocalized({ zh: `研究可升 ${researchReadyCount} 项`, en: `${researchReadyCount} research upgrades ready` })
                                    : getLocalized({ zh: '成长平稳', en: 'Stable growth' })}</div>
                            </div>
                            <div class="card-number">${getLocalized({ zh: `最佳 ${CHAPTERS[state.save.bestChapterIndex].id}`, en: `Best ${CHAPTERS[state.save.bestChapterIndex].id}` })}</div>
                        </div>
                        <div class="card-copy">${getLocalized({
                            zh: `本章累计通关 ${getChapterWinCount(current.id)} 次`,
                            en: `${current.id} cleared ${getChapterWinCount(current.id)} times`
                        })}</div>
                        <div class="defend-side-copy">${getLocalized({
                            zh: '若战力不足，优先回部署页看推荐，再到装配 / 研究页补强。',
                            en: 'If your power is short, check Setup first and then strengthen via Loadout or Research.'
                        })}</div>
                    </article>
                    <article class="stat-card defend-side-card">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${getLocalized({ zh: '资源回流', en: 'Resource Loop' })}</div>
                                <div class="card-title">${economyPreview.claimableTotal > 0
                                    ? getLocalized({ zh: `${economyPreview.claimableTotal} 份待领`, en: `${economyPreview.claimableTotal} rewards ready` })
                                    : getLocalized({ zh: '当前无待领', en: 'No pending claims' })}</div>
                            </div>
                            <div class="card-number">Lv.${seasonInfo.level}</div>
                        </div>
                        <div class="card-copy">${economyPreview.dailyRemaining}</div>
                        <div class="defend-side-copy">${getLocalized({
                            zh: '任务、赛季与补给都保留在各自页签中处理，战斗页只保留结果和入口。',
                            en: 'Missions, season, and supply stay in their own tabs so the battle page remains clean.'
                        })}</div>
                    </article>
                </div>
            </div>
        `;
    }

    function renderPrepTab() {
        const current = getCurrentChapter();
        const focusPreview = getChapterFocusPreview(current);
        const recommendedSkill = t(SKILLS[getRecommendedSkillIdForChapter(current)].nameKey);
        const economyPreview = getDefenseEconomyPreview(current);
        const prepOverview = getChapterPrepOverview(current);
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        const quickAccessItems = getDefendQuickAccessItems(prepOverview, economyPreview);
        const prepGuideCards = [
            {
                step: '01',
                title: getLocalized({ zh: '先选章节', en: 'Pick the chapter' }),
                copy: getLocalized({
                    zh: '先确认你要推哪一章。章节越高，敌潮组合、推荐战力和波次压力都会同步提高。',
                    en: 'Choose the chapter you want to push. Higher chapters raise enemy mix, recommended power, and wave pressure.'
                })
            },
            {
                step: '02',
                title: getLocalized({ zh: '看差距与推荐', en: 'Check the gap' }),
                copy: getLocalized({
                    zh: '重点看推荐战力、推荐技能、敌潮预览和掉落倾向；看不懂时直接照推荐编队来。',
                    en: 'Read the recommended power, suggested skill, enemy preview, and drop focus. If unsure, simply follow the preset.'
                })
            },
            {
                step: '03',
                title: getLocalized({ zh: '同步后开打', en: 'Sync and deploy' }),
                copy: getLocalized({
                    zh: '差距小就一键套用并开打；差距大时先去装配或研究补强，再回这里继续推进。',
                    en: 'If the gap is small, apply and deploy immediately. If it is large, strengthen via Loadout or Research first.'
                })
            }
        ];
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('prepPanelTitle'),
                getLocalized({
                    zh: '“部署”页负责选章节、读敌潮、看推荐与决定是否直接开打。看不懂时，就按下方 3 步走即可。',
                    en: 'Setup is where you choose the chapter, read the enemy plan, and decide whether you are ready to deploy. If unsure, just follow the 3 steps below.'
                }),
                `<div class="mini-chip">${current.id} · ${formatCompact(current.recommended)}</div>`
            )}
            <div class="prep-guide-grid">
                ${prepGuideCards.map((item) => `
                    <article class="prep-guide-card">
                        <span class="prep-guide-step">${item.step}</span>
                        <strong>${item.title}</strong>
                        <p class="prep-guide-copy">${item.copy}</p>
                    </article>
                `).join('')}
            </div>
            <div class="prep-guide-note">
                ${getLocalized({
                    zh: '简单理解：这里就是“打哪一章、需要多少战力、推荐带什么、现在能不能直接开”的决策页。',
                    en: 'In plain words: this is the decision page for which chapter to push, how much power you need, what to bring, and whether you can start now.'
                })}
            </div>
            <div class="chapter-row defend-chapter-row">
                ${CHAPTERS.map((chapter, index) => `
                    <button class="chapter-btn ${index === state.save.chapterIndex ? 'active' : ''}" type="button" data-action="chapter" data-value="${index}" ${index > state.save.bestChapterIndex ? 'disabled' : ''}>
                        ${chapter.id}${index === state.save.chapterIndex ? ` · ${t('chapterBadgeCurrent')}` : ''}
                    </button>
                `).join('')}
            </div>
            <div class="defend-compact-layout">
                <article class="defend-primary-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '开战面板', en: 'Frontline Ready' })}</div>
                            <div class="card-title">${prepOverview.ready
                                ? getLocalized({ zh: `${current.id} 可直接开打`, en: `${current.id} is ready` })
                                : getLocalized({ zh: `${current.id} 还差 ${prepOverview.adjustmentsNeeded} 项调整`, en: `${current.id} needs ${prepOverview.adjustmentsNeeded} tweaks` })}</div>
                        </div>
                        <div class="card-number">${prepOverview.powerGap > 0
                            ? getLocalized({ zh: `差 ${formatCompact(prepOverview.powerGap)}`, en: `Gap ${formatCompact(prepOverview.powerGap)}` })
                            : getLocalized({ zh: '达标', en: 'Ready' })}</div>
                    </div>
                    <div class="defend-mini-stat-grid">
                        <div class="defend-mini-stat">
                            <span>${t('previewTowerPower')}</span>
                            <strong>${formatCompact(getPowerRating(state.save))}</strong>
                        </div>
                        <div class="defend-mini-stat">
                            <span>${t('recommendRating')}</span>
                            <strong>${formatCompact(current.recommended)}</strong>
                        </div>
                        <div class="defend-mini-stat">
                            <span>${getLocalized({ zh: '待领总数', en: 'Claims Ready' })}</span>
                            <strong>${economyPreview.claimableTotal}</strong>
                        </div>
                        <div class="defend-mini-stat">
                            <span>${t('seasonLabel')}</span>
                            <strong>Lv.${seasonInfo.level}</strong>
                        </div>
                    </div>
                    <div class="chip-row defend-chip-row">
                        <span class="mini-chip">${t('rewardPreview')} ${formatCompact(current.goldReward)}G / ${formatCompact(current.coreReward)}C / ${formatCompact(current.fragmentReward)} ${t('fragmentLabel')}</span>
                        <span class="mini-chip">${t('enemyPreview')} ${current.enemies.map((enemyId) => enemyLabel(enemyId)).join(' / ')}</span>
                        <span class="mini-chip">${getLocalized({ zh: `掉落倾向 ${focusPreview}`, en: `Focus ${focusPreview}` })}</span>
                        <span class="mini-chip">${getLocalized({ zh: `推荐技能 ${recommendedSkill}`, en: `Skill ${recommendedSkill}` })}</span>
                    </div>
                    <div class="defend-inline-note">${prepOverview.ready
                        ? getLocalized({
                            zh: '当前三路与技能已经对齐，可直接开打；需要更细调装配时再去“装配”页。',
                            en: 'Your lanes and skill are aligned, so you can defend now. Open Loadout only when you want finer tuning.'
                        })
                        : getLocalized({
                            zh: '优先一键同步推荐编队，差距大的章节先补战力再开打。',
                            en: 'Sync the recommended preset first, and close larger power gaps before pushing harder chapters.'
                        })}</div>
                    <div class="card-actions compact defend-card-actions">
                        <button class="primary-btn" type="button" data-action="${prepOverview.ready ? 'startChapter' : 'applyChapterPresetStart'}" data-value="${current.id}">
                            ${prepOverview.ready
                                ? getLocalized({ zh: '直接开打', en: 'Defend Now' })
                                : getLocalized({ zh: '一键套用并开打', en: 'Apply & Defend' })}
                        </button>
                        <button class="ghost-btn" type="button" data-action="applyChapterPreset" data-value="${current.id}">
                            ${getLocalized({ zh: '同步推荐编队', en: 'Apply Preset' })}
                        </button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="loadout">
                            ${getLocalized({ zh: '去装配页', en: 'Open Loadout' })}
                        </button>
                    </div>
                </article>
                <div class="defend-quick-grid">
                    ${quickAccessItems.map((item) => `
                        <button class="defend-quick-btn is-${item.tone}" type="button" data-action="${item.action}" data-value="${item.data}">
                            <span class="defend-quick-label">${item.label}</span>
                            <strong class="defend-quick-value">${item.value}</strong>
                            <span class="defend-quick-meta">${item.meta}</span>
                        </button>
                    `).join('')}
                    <article class="defend-quick-summary">
                        <span class="defend-quick-label">${getLocalized({ zh: '本章节奏', en: 'Wave Plan' })}</span>
                        <strong class="defend-quick-value">${getLocalized({ zh: `共 ${TOTAL_WAVES} 波`, en: `${TOTAL_WAVES} waves` })}</strong>
                        <span class="defend-quick-meta">${getChapterWavePlan(current)}</span>
                    </article>
                    <article class="defend-quick-summary">
                        <span class="defend-quick-label">${getLocalized({ zh: '历史推进', en: 'Progress' })}</span>
                        <strong class="defend-quick-value">${t('statBest')} ${CHAPTERS[state.save.bestChapterIndex].id}</strong>
                        <span class="defend-quick-meta">${getLocalized({ zh: `${current.id} 通关 ${getChapterWinCount(current.id)} 次`, en: `${current.id} cleared ${getChapterWinCount(current.id)} times` })}</span>
                    </article>
                </div>
            </div>
        `;
    }

    function renderLoadoutTab() {
        const selectedLane = state.save.selectedLane;
        const chapter = getCurrentChapter();
        const preset = getChapterLoadoutPreset(chapter);
        const prepOverview = getChapterPrepOverview(chapter);
        const presetSkillLabel = t(SKILLS[preset.skill].nameKey);
        const unlockedTowerCount = Object.values(TOWERS).filter((tower) => {
            const level = getTowerLevel(tower.id);
            return level > 0 || tower.unlockFragments === 0;
        }).length;
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('loadoutPanelTitle'),
                getLocalized({
                    zh: '三路装配集中处理，选路后直接换塔或换技能。',
                    en: 'Tune all three lanes here, then swap towers or skills quickly.'
                }),
                `<div class="mini-chip">${t('laneSelect')} · ${getLaneName(selectedLane)}</div>`
            )}
            <article class="stat-card compact-overview-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized({ zh: '章节推荐编队', en: 'Chapter Preset' })}</div>
                        <div class="card-title">${chapter.id} · ${presetSkillLabel}</div>
                    </div>
                    <div class="card-number">${preset.usedFallback
                        ? getLocalized({ zh: '已自动适配', en: 'Auto adjusted' })
                        : getLocalized({ zh: '标准编队', en: 'Standard preset' })}</div>
                </div>
                <div class="card-copy">${preset.usedFallback
                    ? getLocalized({
                        zh: '未解锁炮台已自动改为当前可用的同定位方案。',
                        en: 'Some recommended towers are still locked, so the preset automatically swaps to currently available alternatives.'
                    })
                    : getLocalized({
                        zh: '一键套用当前章节推荐，随后就能直接开打。',
                        en: 'Apply the recommended three-lane build and active skill for the current chapter in one tap.'
                    })}</div>
                ${renderCompactKpiGrid([
                    { label: getLocalized({ zh: '当前选路', en: 'Selected Lane' }), value: getLaneName(selectedLane) },
                    { label: getLocalized({ zh: '当前炮台', en: 'Current Tower' }), value: towerLabel(state.save.laneLoadout[selectedLane]) },
                    { label: getLocalized({ zh: '已解锁', en: 'Unlocked' }), value: `${unlockedTowerCount} / ${Object.keys(TOWERS).length}` },
                    { label: getLocalized({ zh: '待调整', en: 'Tweaks Left' }), value: String(Math.max(0, prepOverview.adjustmentsNeeded)) }
                ])}
                <div class="reward-row">
                    ${preset.lanes.map((towerId, laneIndex) => `<span class="mini-chip">${getLaneName(laneIndex)} · ${towerLabel(towerId)}</span>`).join('')}
                    <span class="mini-chip">${getLocalized({ zh: `技能 ${presetSkillLabel}`, en: `Skill ${presetSkillLabel}` })}</span>
                </div>
                <div class="card-actions compact" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="applyChapterPreset" data-value="${chapter.id}">
                        ${getLocalized({ zh: '套用推荐', en: 'Apply Preset' })}
                    </button>
                    <button class="primary-btn" type="button" data-action="${prepOverview.ready ? 'startChapter' : 'applyChapterPresetStart'}" data-value="${chapter.id}">
                        ${prepOverview.ready
                            ? getLocalized({ zh: '开打', en: 'Defend' })
                            : getLocalized({ zh: '套用并开打', en: 'Apply & Defend' })}
                    </button>
                    <button class="ghost-btn" type="button" data-action="applyChapterLanePreset" data-value="${chapter.id}">
                        ${getLocalized({ zh: '仅三路', en: 'Lanes Only' })}
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
            <article class="compact-overview-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('skillSelect')}</div>
                        <div class="card-title">${t(SKILLS[state.save.selectedSkill].nameKey)}</div>
                    </div>
                    <div class="card-number">${state.lang === 'zh' ? '主动位' : 'Active Slot'}</div>
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
            <article class="tower-card compact-list-card ${(canUpgrade || canUnlock) ? 'ready' : ''} ${!unlocked ? 'locked' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${rarityLabel(tower.tier)}</div>
                        <div class="card-title">${towerLabel(tower.id)}</div>
                    </div>
                    <div class="card-number">${t('levelText')} ${level || 0}</div>
                </div>
                <div class="card-copy">${getTowerDescription(tower.id)}</div>
                <div class="tower-tags compact">
                    ${renderLimitedChipMarkup([
                        `<span class="tag-chip">${t('dpsText')} ${formatCompact(Math.round(getTowerPreviewDps(tower.id)))}</span>`,
                        `<span class="tag-chip">${formatCompact(state.save.towerFragments[tower.id] || 0)} ${t('fragmentLabel')}</span>`,
                        focusRecommended ? `<span class="tag-chip">${getLocalized({ zh: '章节掉落倾向', en: 'Focus Drop' })}</span>` : '',
                        ...recommendedLanes.map((laneName) => `<span class="tag-chip">${getLocalized({ zh: `推荐 ${laneName}`, en: `${laneName} preset` })}</span>`)
                    ], { limit: 4 })}
                </div>
                <div class="progress-line"><i style="width:${(progress * 100).toFixed(2)}%;"></i></div>
                <div class="card-actions compact">
                    ${unlocked
                        ? (equipped
                            ? `<button class="ghost-btn" type="button" disabled>${t('equipped')}</button>`
                            : `<button class="primary-btn" type="button" data-action="equipTower" data-value="${tower.id}">${t('equipNow')}</button>`)
                        : `<button class="primary-btn" type="button" data-action="unlockTower" data-value="${tower.id}" ${canUnlock ? '' : 'disabled'}>${t('unlockNow')}</button>`}
                    ${unlocked
                        ? `<button class="ghost-btn" type="button" data-action="upgradeTower" data-value="${tower.id}" ${(canUpgrade && level < 8) ? '' : 'disabled'}>${level >= 8 ? t('upgradeMax') : `${t('upgradeNow')} · ${formatCompact(getTowerUpgradeCost(tower.id))}G`}</button>`
                        : `<button class="ghost-btn" type="button" disabled>${t('needFragments')} ${formatCompact(getUnlockNeed(tower.id))}</button>`}
                </div>
            </article>
        `;
    }

    function renderResearchTab() {
        const chapter = getCurrentChapter();
        const researchPlan = getResearchUpgradePlan(chapter);
        const topResearch = researchPlan.top;
        const topAffordableResearch = researchPlan.topAffordable;
        const economyPreview = getDefenseEconomyPreview(chapter);
        const seasonTotalReady = economyPreview.seasonReady + economyPreview.sponsorReady;
        const researchReadyCount = researchPlan.list.filter((item) => item.affordable && !item.maxed).length;
        const researchMaxedCount = researchPlan.list.filter((item) => item.maxed).length;
        const sortedResearchIds = researchPlan.list.map((item) => item.id);
        const recoveryAction = economyPreview.dailyReady
            ? {
                action: 'claimDaily',
                value: 'daily',
                label: getLocalized({ zh: '领取补给', en: 'Claim Supply' })
            }
            : economyPreview.missionReady > 0
                ? {
                    action: 'openTab',
                    value: 'missions',
                    label: getLocalized({ zh: `任务 x${economyPreview.missionReady}`, en: `Missions x${economyPreview.missionReady}` })
                }
                : seasonTotalReady > 0
                    ? {
                        action: 'openTab',
                        value: 'season',
                        label: getLocalized({ zh: `赛季 x${seasonTotalReady}`, en: `Season x${seasonTotalReady}` })
                    }
                    : {
                        action: 'openTab',
                        value: 'defend',
                        label: getLocalized({ zh: '返回防线', en: 'Back To Defend' })
                    };
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('researchPanelTitle'),
                getLocalized({
                    zh: '这里只做升级决策，缺资源就从这里直接跳去回收。',
                    en: 'Make upgrade decisions here, then jump straight to recovery when resources run low.'
                })
            )}
            <div class="card-grid tab-overview-grid">
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '当前研究路线', en: 'Current Research Route' })}</div>
                            <div class="card-title">${topResearch
                                ? topResearch.meta.title
                                : getLocalized({ zh: '研究已全部满级', en: 'All research maxed' })}</div>
                        </div>
                        <div class="card-number">${topResearch
                            ? (topResearch.affordable
                                ? getLocalized({ zh: `${formatCompact(topResearch.cost)}G 可升`, en: `${formatCompact(topResearch.cost)}G ready` })
                                : getLocalized({ zh: `还差 ${formatCompact(topResearch.shortage)}G`, en: `Need ${formatCompact(topResearch.shortage)}G` }))
                            : getLocalized({ zh: '已毕业', en: 'Maxed' })}</div>
                    </div>
                    <div class="card-copy">${topResearch
                        ? `${topResearch.reason} ${researchPlan.powerGap > 0
                            ? getLocalized({ zh: '先补战力缺口，再冲章节。', en: 'Close the power gap first, then push chapters.' })
                            : getLocalized({ zh: '当前更偏向补稳定度与容错。', en: 'Focus on stability and safety now.' })}`
                        : getLocalized({ zh: '研究已满，可以把资源转去装配、赛季和推进。', en: 'Research is maxed, so shift resources into loadout, season, and chapter pushes.' })}</div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '可升分支', en: 'Ready Upgrades' }), value: String(researchReadyCount) },
                        { label: getLocalized({ zh: '已满分支', en: 'Maxed Branches' }), value: String(researchMaxedCount) },
                        { label: getLocalized({ zh: '战力缺口', en: 'Power Gap' }), value: researchPlan.powerGap > 0 ? formatCompact(researchPlan.powerGap) : getLocalized({ zh: '达标', en: 'Ready' }) },
                        { label: getLocalized({ zh: '当前金币', en: 'Current Gold' }), value: `${formatCompact(state.save.gold)}G` }
                    ])}
                    ${topResearch ? `<div class="reward-row compact">
                        ${researchPlan.list.slice(0, 3).map((item, index) => `<span class="mini-chip">${getLocalized({ zh: `推荐 ${index + 1} · ${item.meta.title} +${item.nextDelta}%`, en: `Top ${index + 1} · ${item.meta.title} +${item.nextDelta}%` })}</span>`).join('')}
                    </div>` : ''}
                    <div class="card-actions compact" style="margin-top:12px;">
                        ${topAffordableResearch
                            ? `<button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${topAffordableResearch.id}">
                                ${getLocalized({ zh: `升 ${topAffordableResearch.meta.title}`, en: `Upgrade ${topAffordableResearch.meta.title}` })}
                            </button>`
                            : `<button class="primary-btn" type="button" data-action="${recoveryAction.action}" data-value="${recoveryAction.value}">
                                ${recoveryAction.label}
                            </button>`}
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="prep">
                            ${getLocalized({ zh: '部署', en: 'Setup' })}
                        </button>
                    </div>
                </article>
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '资源回流', en: 'Resource Recovery' })}</div>
                            <div class="card-title">${recoveryAction.label}</div>
                        </div>
                        <div class="card-number">${getLocalized({ zh: `待领 ${economyPreview.claimableTotal}`, en: `${economyPreview.claimableTotal} ready` })}</div>
                    </div>
                    <div class="card-copy">${economyPreview.dailyRemaining}</div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '任务', en: 'Missions' }), value: String(economyPreview.missionReady) },
                        { label: getLocalized({ zh: '赛季', en: 'Season' }), value: String(economyPreview.seasonReady) },
                        { label: getLocalized({ zh: '赞助', en: 'Sponsor' }), value: String(economyPreview.sponsorReady) },
                        { label: getLocalized({ zh: '补给', en: 'Supply' }), value: economyPreview.dailyReady ? getLocalized({ zh: '可领', en: 'Ready' }) : getLocalized({ zh: '冷却中', en: 'Cooldown' }) }
                    ])}
                    <div class="card-actions compact" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="${recoveryAction.action}" data-value="${recoveryAction.value}">
                            ${recoveryAction.label}
                        </button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="prep">
                            ${getLocalized({ zh: '部署', en: 'Setup' })}
                        </button>
                    </div>
                </article>
            </div>
            <div class="research-grid">
                ${sortedResearchIds
                    .map((researchId) => renderResearchCard(researchId, researchPlan.list.find((item) => item.id === researchId) || null))
                    .join('')}
            </div>
        `;
    }

    function renderResearchCard(researchId, recommendation = null) {
        const level = getResearchLevel(researchId);
        const maxLevel = RESEARCH[researchId].maxLevel;
        const cost = getResearchCost(researchId);
        const maxed = level >= maxLevel;
        const meta = getResearchMeta(researchId);
        const currentEffect = RESEARCH[researchId].effect(level);
        const nextEffect = RESEARCH[researchId].effect(Math.min(maxLevel, level + 1));
        const nextDelta = Math.max(0, nextEffect - currentEffect);
        const isRecommended = !!recommendation && !recommendation.maxed;
        return `
            <article class="research-card compact-list-card ${canUpgradeResearch(researchId) ? 'ready' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${t('researchPanelTitle')}</div>
                        <div class="card-title">${meta.title}</div>
                    </div>
                    <div class="card-number">Lv.${level} / ${maxLevel}</div>
                </div>
                <div class="card-copy">${meta.desc}</div>
                <div class="chip-row compact">
                    ${renderLimitedChipMarkup([
                        `<span class="mini-chip">${t('researchEffect')} ${currentEffect}%</span>`,
                        !maxed ? `<span class="mini-chip">${getLocalized({ zh: `下一级 +${nextDelta}%`, en: `Next +${nextDelta}%` })}</span>` : '',
                        isRecommended ? `<span class="mini-chip">${getLocalized({ zh: `推荐位 ${researchPlanIndexLabel(recommendation, state.lang)}`, en: `Priority ${researchPlanIndexLabel(recommendation, state.lang)}` })}</span>` : '',
                        `<span class="mini-chip">${maxed ? t('researchMaxed') : `${t('researchCost')} ${formatCompact(cost)}G`}</span>`
                    ], { limit: 3 })}
                </div>
                ${isRecommended ? `<div class="card-copy">${recommendation.reason}</div>` : ''}
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${researchId}" ${canUpgradeResearch(researchId) ? '' : 'disabled'}>
                        ${maxed ? t('researchMaxed') : `${t('upgradeNow')} · ${formatCompact(cost)}G`}
                    </button>
                </div>
            </article>
        `;
    }

    function researchPlanIndexLabel(recommendation, lang = state.lang) {
        if (!recommendation) return '';
        const index = Math.max(1, Number(recommendation.rank || 0));
        return lang === 'zh' ? `#${index}` : `#${index}`;
    }

    function mergeRewards(...rewards) {
        const merged = { gold: 0, cores: 0, seasonXp: 0, fragments: {} };
        rewards.filter(Boolean).forEach((reward) => {
            merged.gold += Number(reward.gold) || 0;
            merged.cores += Number(reward.cores) || 0;
            merged.seasonXp += Number(reward.seasonXp) || 0;
            if (reward.fragments) {
                Object.entries(reward.fragments).forEach(([towerId, amount]) => {
                    merged.fragments[towerId] = (merged.fragments[towerId] || 0) + (Number(amount) || 0);
                });
            }
        });
        if (!Object.keys(merged.fragments).length) delete merged.fragments;
        if (!merged.gold) delete merged.gold;
        if (!merged.cores) delete merged.cores;
        if (!merged.seasonXp) delete merged.seasonXp;
        return merged;
    }

    function getClaimableMissionBundle(saveSnapshot = state.save) {
        const missions = MISSIONS.filter((mission) => !saveSnapshot.missionClaimed.includes(mission.id) && mission.metric(saveSnapshot) >= mission.target);
        return {
            count: missions.length,
            ids: missions.map((mission) => mission.id),
            reward: mergeRewards(...missions.map((mission) => mission.reward))
        };
    }

    function getClaimableSeasonBundle(saveSnapshot = state.save) {
        const standardNodes = SEASON_NODES.filter((node) => !saveSnapshot.seasonClaimed.includes(node.id) && saveSnapshot.seasonXp >= node.xp);
        const sponsorNodes = SPONSOR_SEASON_NODES.filter((node) => !!saveSnapshot.payment.passUnlocked && !saveSnapshot.payment.premiumSeasonClaims[node.id] && saveSnapshot.seasonXp >= node.xp);
        return {
            count: standardNodes.length + sponsorNodes.length,
            sponsorCount: sponsorNodes.length,
            standardIds: standardNodes.map((node) => node.id),
            sponsorIds: sponsorNodes.map((node) => node.id),
            reward: mergeRewards(...standardNodes.map((node) => node.reward), ...sponsorNodes.map((node) => node.reward))
        };
    }

    function renderMissionsTab() {
        const missionViews = MISSIONS.map((mission) => getMissionView(mission)).sort((a, b) => b.sort - a.sort);
        const missionBundle = getClaimableMissionBundle();
        const missionClaimedCount = missionViews.filter((mission) => mission.claimed).length;
        const missionActiveCount = missionViews.filter((mission) => !mission.claimed && !mission.claimable).length;
        const missionCompletionRate = missionViews.length ? Math.round((missionClaimedCount / missionViews.length) * 100) : 0;
        const nextMission = missionViews.find((mission) => !mission.claimed);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('missionsPanelTitle'),
                getLocalized({
                    zh: '可领取置顶，未完成任务只保留关键进度与奖励。',
                    en: 'Claimables stay pinned first, while unfinished missions keep only key progress and rewards.'
                }),
                `<div class="mini-chip">${missionBundle.count > 0
                    ? getLocalized({ zh: `当前可批量领取 ${missionBundle.count} 个`, en: `${missionBundle.count} ready to batch claim` })
                    : (state.lang === 'zh' ? '可领取奖励已置顶' : 'Claimables pinned first')
                }</div>`
            )}
            <div class="card-grid tab-overview-grid">
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '任务回收', en: 'Mission Sweep' })}</div>
                            <div class="card-title">${missionBundle.count > 0
                                ? getLocalized({ zh: `${missionBundle.count} 个奖励待领取`, en: `${missionBundle.count} rewards ready` })
                                : getLocalized({ zh: '当前暂无待领取任务', en: 'No mission rewards ready' })}</div>
                        </div>
                        <div class="card-number">${getLocalized({ zh: '一键结算', en: 'Batch Claim' })}</div>
                    </div>
                    <div class="card-copy">${missionBundle.count > 0
                        ? getLocalized({
                            zh: '已完成任务在这里一次结算，避免来回切页。',
                            en: 'Cash out finished missions in one tap to recycle gold, cores, and fragments into your current defense build.'
                        })
                        : getLocalized({
                            zh: '继续推进目标，满足条件后这里会自动亮起。',
                            en: 'Keep advancing mission goals and this panel will switch into a one-tap claim entry as soon as rewards are ready.'
                        })}</div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '待领', en: 'Ready' }), value: String(missionBundle.count) },
                        { label: getLocalized({ zh: '已领', en: 'Claimed' }), value: String(missionClaimedCount) },
                        { label: getLocalized({ zh: '进行中', en: 'Active' }), value: String(missionActiveCount) },
                        { label: getLocalized({ zh: '完成率', en: 'Progress' }), value: `${missionCompletionRate}%` }
                    ])}
                    ${missionBundle.count > 0 ? `<div class="reward-row compact">${renderRewardChips(missionBundle.reward, { limit: 3 })}</div>` : ''}
                    <div class="card-actions compact" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="claimAllMissions" ${missionBundle.count > 0 ? '' : 'disabled'}>
                            ${getLocalized({ zh: '一键领取', en: 'Claim All' })}
                        </button>
                    </div>
                </article>
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '任务概览', en: 'Mission Snapshot' })}</div>
                            <div class="card-title">${nextMission
                                ? nextMission.title
                                : getLocalized({ zh: '当前任务已全部清空', en: 'All current missions cleared' })}</div>
                        </div>
                        <div class="card-number">${missionViews.length ? `${missionCompletionRate}%` : '0%'}</div>
                    </div>
                    <div class="card-copy">${nextMission
                        ? nextMission.desc
                        : getLocalized({ zh: '继续推进章节与战斗表现，会刷新更多任务目标。', en: 'Keep pushing chapters and battle metrics to surface more mission goals.' })}</div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '总任务', en: 'Total' }), value: String(missionViews.length) },
                        { label: getLocalized({ zh: '待领', en: 'Ready' }), value: String(missionBundle.count) },
                        { label: getLocalized({ zh: '未完成', en: 'Pending' }), value: String(Math.max(0, missionViews.length - missionClaimedCount - missionBundle.count)) },
                        { label: getLocalized({ zh: '推进建议', en: 'Next' }), value: nextMission ? `${nextMission.progress} / ${nextMission.target}` : getLocalized({ zh: '已清空', en: 'Cleared' }) }
                    ])}
                    ${renderInlineLinkRow([
                        {
                            action: 'openTab',
                            value: 'prep',
                            label: getLocalized({ zh: '去部署', en: 'Open Setup' })
                        },
                        {
                            action: 'openTab',
                            value: 'defend',
                            label: getLocalized({ zh: '看战斗', en: 'Battle View' })
                        }
                    ])}
                </article>
            </div>
            <div class="mission-grid">
                ${missionViews.map((mission) => `
                    <article class="mission-card compact-list-card ${mission.claimable ? 'claimable' : ''} ${mission.claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${mission.claimable ? t('missionReadyDot') : t(mission.claimed ? 'missionClaimed' : 'missionLocked')}</div>
                                <div class="card-title">${mission.title}</div>
                            </div>
                            <div class="card-number">${mission.progress} / ${mission.target}</div>
                        </div>
                        <div class="card-copy">${mission.desc}</div>
                        <div class="progress-line"><i style="width:${(mission.progressRate * 100).toFixed(2)}%;"></i></div>
                        <div class="reward-row compact">${mission.rewardChips}</div>
                        <div class="card-actions compact">
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
        const seasonBundle = getClaimableSeasonBundle();
        const finalChapterId = CHAPTERS[CHAPTERS.length - 1].id;
        const finalChapterClears = getChapterWinCount(finalChapterId);
        const seasonRemaining = Math.max(0, seasonInfo.required - seasonInfo.progress);
        const nodes = SEASON_NODES.map((node, index) => ({ node, index, claimable: isSeasonClaimable(node.id), claimed: state.save.seasonClaimed.includes(node.id) }))
            .sort(compareRewardNodeState);
        const nextStandardNode = nodes.find(({ claimed }) => !claimed) || null;
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('seasonPanelTitle'),
                getLocalized({
                    zh: '这里只看等级、推进和待领奖励，节点列表压缩在下方。',
                    en: 'Track level, progress, and ready rewards here, with the node list compressed below.'
                })
            )}
            <div class="card-grid tab-overview-grid">
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('seasonLabel')}</div>
                            <div class="card-title">Lv.${seasonInfo.level}</div>
                        </div>
                        <div class="card-number">${formatCompact(state.save.seasonXp)} XP</div>
                    </div>
                    <div class="progress-line"><i style="width:${(rate * 100).toFixed(2)}%;"></i></div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '距下一档', en: 'To Next' }), value: seasonInfo.required > 0 ? formatCompact(seasonRemaining) : getLocalized({ zh: '已满', en: 'Max' }) },
                        { label: getLocalized({ zh: '待领', en: 'Ready' }), value: String(seasonBundle.count) },
                        { label: getLocalized({ zh: '赞助', en: 'Sponsor' }), value: String(seasonBundle.sponsorCount) },
                        { label: getLocalized({ zh: '终章通关', en: 'Final Clears' }), value: formatCompact(finalChapterClears) }
                    ])}
                </article>
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('statDamage')}</div>
                            <div class="card-title">${formatCompact(state.save.stats.totalDamage)}</div>
                        </div>
                        <div class="card-number">${t('statKills')} ${formatCompact(state.save.stats.kills)}</div>
                    </div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '局数', en: 'Runs' }), value: formatCompact(state.save.stats.runs) },
                        { label: getLocalized({ zh: '胜利', en: 'Wins' }), value: formatCompact(state.save.stats.wins) },
                        { label: getLocalized({ zh: '击杀', en: 'Kills' }), value: formatCompact(state.save.stats.kills) },
                        { label: getLocalized({ zh: '终章', en: 'Final' }), value: formatCompact(finalChapterClears) }
                    ])}
                </article>
                <article class="stat-card compact-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '赛季回收', en: 'Season Sweep' })}</div>
                            <div class="card-title">${seasonBundle.count > 0
                                ? getLocalized({ zh: `${seasonBundle.count} 个节点待领取`, en: `${seasonBundle.count} nodes ready` })
                                : getLocalized({ zh: '当前暂无待领取', en: 'Nothing ready yet' })}</div>
                        </div>
                        <div class="card-number">${seasonBundle.sponsorCount > 0
                            ? getLocalized({ zh: `赞助 ${seasonBundle.sponsorCount}`, en: `Sponsor ${seasonBundle.sponsorCount}` })
                            : getLocalized({ zh: '标准轨道', en: 'Standard Track' })}</div>
                    </div>
                    <div class="card-copy">${seasonBundle.count > 0
                        ? getLocalized({
                            zh: '标准节点和赞助奖励都能在这里一起结算。',
                            en: 'Standard season nodes and sponsor-track rewards can now be settled together in one sweep.'
                        })
                        : getLocalized({
                            zh: '继续推章节和赛季经验，达到节点后这里会自动亮起。',
                            en: 'Keep pushing chapters and Season XP; this panel will surface a batch-claim entry once nodes are ready.'
                        })}</div>
                    ${renderCompactKpiGrid([
                        { label: getLocalized({ zh: '标准待领', en: 'Standard' }), value: String(Math.max(0, seasonBundle.count - seasonBundle.sponsorCount)) },
                        { label: getLocalized({ zh: '赞助待领', en: 'Sponsor' }), value: String(seasonBundle.sponsorCount) },
                        { label: getLocalized({ zh: '下一标准档', en: 'Next Node' }), value: nextStandardNode ? formatCompact(nextStandardNode.node.xp) : getLocalized({ zh: '完成', en: 'Done' }) },
                        { label: getLocalized({ zh: '当前 XP', en: 'Current XP' }), value: formatCompact(state.save.seasonXp) }
                    ])}
                    ${seasonBundle.count > 0 ? `<div class="reward-row compact">${renderRewardChips(seasonBundle.reward, { limit: 3 })}</div>` : ''}
                    <div class="card-actions compact" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="claimAllSeason" ${seasonBundle.count > 0 ? '' : 'disabled'}>
                            ${getLocalized({ zh: '一键领取', en: 'Claim All' })}
                        </button>
                    </div>
                </article>
            </div>
            <div class="season-grid">
                ${nodes.map(({ node, index, claimable, claimed }) => `
                    <article class="season-node compact-list-card ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${claimable ? t('seasonReadyDot') : `XP ${node.xp}`}</div>
                                <div class="card-title">${t('seasonNodeTitle').replace('{index}', String(index + 1))}</div>
                            </div>
                            <div class="card-number">${formatCompact(node.xp)} XP</div>
                        </div>
                        <div class="reward-row compact">${renderRewardChips(node.reward, { limit: 3 })}</div>
                        <div class="card-actions compact">
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
        const strategyPlan = getShopStrategyPlan();
        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                t('shopPanelTitle'),
                getLocalized({
                    zh: '每日补给、资源包和充值放在同页，减少来回切换。',
                    en: 'Daily supply, resource packs, and top-up all live on one page to cut extra switching.'
                }),
                `<div class="mini-chip">${sponsorUnlocked
                    ? getLocalized({ zh: `赞助轨道已解锁 · 待领 ${sponsorReady}`, en: `Sponsor track unlocked · ${sponsorReady} ready` })
                    : getLocalized({ zh: '任意一笔校验成功的充值都会解锁赞助轨道', en: 'Any verified top-up unlocks the sponsor track' })
                }</div>`
            )}
            <div class="card-grid tab-overview-grid">
                ${renderShopStrategyCard(strategyPlan)}
                ${renderTopupOverviewCard(strategyPlan)}
                ${renderDailyCard()}
            </div>
            <div class="shop-grid">
                ${SHOP_ITEMS.map((offer) => renderShopOfferCard(offer, strategyPlan)).join('')}
                ${DEFENSE_PAYMENT_OFFERS.map((offer) => renderPaymentOfferCard(offer, strategyPlan)).join('')}
            </div>
        `;
    }

    function renderDailyCard() {
        const ready = isDailySupplyReady();
        const supplyReward = getDailySupplyReward();
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const remaining = ready ? '' : formatTime(DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - state.save.dailySupplyAt));
        return `
            <article class="shop-card compact-overview-card ${ready ? 'mission-card claimable' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${ready ? t('dailyReadyDot') : remaining}</div>
                        <div class="card-title">${t('shopFreeTitle')}</div>
                    </div>
                    <div class="card-number">Free</div>
                </div>
                <div class="card-copy">${getLocalized({ zh: '每天一领；首充后补给会继续抬高。', en: 'Claim once per day; first top-up boosts the supply tier.' })}</div>
                <div class="reward-row">
                    <span class="mini-chip">${sponsorUnlocked ? getLocalized({ zh: '赞助加成已生效', en: 'Sponsor boost active' }) : getLocalized({ zh: '首充可升级每日补给', en: 'Top-up unlocks daily boost' })}</span>
                </div>
                <div class="reward-row compact">${renderRewardChips(supplyReward, { limit: 3 })}</div>
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="claimDaily" data-value="daily" ${ready ? '' : 'disabled'}>${ready ? getLocalized({ zh: '领取', en: 'Claim' }) : `${t('shopSoldOut')} · ${remaining}`}</button>
                </div>
            </article>
        `;
    }

    function renderGoldShopCard() {
        return `
            <article class="shop-card compact-list-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">920 G</div>
                        <div class="card-title">${t('shopGoldTitle')}</div>
                    </div>
                    <div class="card-number">${t('fragmentLabel')}</div>
                </div>
                <div class="card-copy">${t('shopGoldDesc')}</div>
                <div class="reward-row compact">${renderRewardChips({ fragments: { frost: 10, rocket: 10, chain: 6 }, gold: 120 }, { limit: 3 })}</div>
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="goldCrate" ${state.save.gold >= 920 ? '' : 'disabled'}>${t('shopBuy')}</button>
                </div>
            </article>
        `;
    }

    function renderCoreShopCard() {
        return `
            <article class="shop-card compact-list-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">34 C</div>
                        <div class="card-title">${t('shopCoreTitle')}</div>
                    </div>
                    <div class="card-number">${state.lang === 'zh' ? '稀有箱' : 'Rare Box'}</div>
                </div>
                <div class="card-copy">${t('shopCoreDesc')}</div>
                <div class="reward-row compact">${renderRewardChips({ gold: 280, fragments: { chain: 12, rail: 8 } }, { limit: 3 })}</div>
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="coreCrate" ${state.save.cores >= 34 ? '' : 'disabled'}>${t('shopBuy')}</button>
                </div>
            </article>
        `;
    }

    function getDefenseProgressTier(saveSnapshot = state.save) {
        return Math.max(1, (saveSnapshot.bestChapterIndex || 0) + 1);
    }

    function getShopOfferById(id) {
        return SHOP_ITEMS.find((offer) => offer.id === id) || null;
    }

    function getShopOfferPurchaseCount(id, saveSnapshot = state.save) {
        return Math.max(0, Number(saveSnapshot.shopPurchases?.[id]) || 0);
    }

    function isShopOfferUnlocked(offer, saveSnapshot = state.save) {
        if (!offer) return false;
        return !offer.requiresSponsor || !!saveSnapshot.payment?.passUnlocked;
    }

    function getShopOfferCost(id, saveSnapshot = state.save) {
        const offer = getShopOfferById(id);
        if (!offer) return 0;
        const count = getShopOfferPurchaseCount(id, saveSnapshot);
        const repeatGrowth = Number.isFinite(offer.repeatGrowth)
            ? offer.repeatGrowth
            : (offer.priceType === 'gold' ? 0.22 : 0.18);
        const milestoneGrowth = Number.isFinite(offer.milestoneGrowth)
            ? offer.milestoneGrowth
            : (offer.priceType === 'gold' ? 0.08 : 0.06);
        return Math.round(offer.basePrice * (1 + count * repeatGrowth + Math.floor(count / 3) * milestoneGrowth));
    }

    function canAffordShopOffer(offerOrId, saveSnapshot = state.save) {
        const offer = typeof offerOrId === 'string' ? getShopOfferById(offerOrId) : offerOrId;
        if (!offer || !isShopOfferUnlocked(offer, saveSnapshot)) return false;
        const cost = getShopOfferCost(offer.id, saveSnapshot);
        return offer.priceType === 'gold' ? (saveSnapshot.gold || 0) >= cost : (saveSnapshot.cores || 0) >= cost;
    }

    function getDailySupplyReward(saveSnapshot = state.save) {
        const tier = getDefenseProgressTier(saveSnapshot);
        const sponsorUnlocked = !!saveSnapshot.payment.passUnlocked;
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

    function getShopOfferPreview(id, saveSnapshot = state.save) {
        const tier = getDefenseProgressTier(saveSnapshot);
        const count = getShopOfferPurchaseCount(id, saveSnapshot);
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
            case 'sponsorSupply':
                return {
                    cores: 26 + tier * 6 + Math.floor(count * 4),
                    seasonXp: 84 + tier * 20 + count * 9,
                    fragments: {
                        rocket: 10 + tier + Math.floor(count * 0.5),
                        chain: 13 + tier + Math.floor(count * 0.7),
                        rail: 8 + Math.floor(tier * 0.95) + Math.floor(count * 0.5)
                    }
                };
            case 'sponsorPrism':
                return {
                    gold: 1320 + intensity * 196,
                    seasonXp: 92 + tier * 22 + count * 8,
                    fragments: {
                        rocket: 8 + Math.floor(tier * 0.9) + Math.floor(count * 0.35),
                        chain: 12 + tier + Math.floor(count * 0.55),
                        rail: 11 + Math.floor(tier * 0.95) + Math.floor(count * 0.6)
                    }
                };
            default:
                return {};
        }
    }

    function getRewardFocusMetrics(reward, chapter = getCurrentChapter()) {
        const focusSet = new Set(chapter.fragmentFocus || []);
        let focusFragments = 0;
        let totalFragments = 0;
        if (reward?.fragments) {
            Object.entries(reward.fragments).forEach(([towerId, amount]) => {
                const numericAmount = Number(amount) || 0;
                if (numericAmount <= 0) return;
                totalFragments += numericAmount;
                if (focusSet.has(towerId)) focusFragments += numericAmount;
            });
        }
        return { focusFragments, totalFragments };
    }

    function getNextSponsorSeasonNode(saveSnapshot = state.save) {
        const node = SPONSOR_SEASON_NODES.find((item) => !saveSnapshot.payment.premiumSeasonClaims[item.id]);
        if (!node) return null;
        return {
            node,
            ready: !!saveSnapshot.payment.passUnlocked && (Number(saveSnapshot.seasonXp) || 0) >= node.xp,
            remainingXp: Math.max(0, node.xp - (Number(saveSnapshot.seasonXp) || 0))
        };
    }

    function getGoldShopRecommendation(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const prepOverview = getChapterPrepOverview(chapter, saveSnapshot);
        const candidates = SHOP_ITEMS
            .filter((offer) => offer.priceType === 'gold' && isShopOfferUnlocked(offer, saveSnapshot))
            .map((offer) => {
                const preview = getShopOfferPreview(offer.id, saveSnapshot);
                const cost = getShopOfferCost(offer.id, saveSnapshot);
                const focus = getRewardFocusMetrics(preview, chapter);
                let score = (focus.focusFragments * 2.6) + focus.totalFragments + (Number(preview.cores) || 0) * 3.4 + (Number(preview.seasonXp) || 0) * 0.18;
                if (prepOverview.powerGap > 260 && offer.id === 'forgeCrate') score += 18;
                if (prepOverview.powerGap <= 260 && offer.id === 'goldCrate') score += 10;
                if (prepOverview.preset.lanes.includes('harvest') && offer.id === 'goldCrate') score += 6;
                if (offer.id === 'sponsorSupply') {
                    if (chapter.fragmentFocus.includes('chain')) score += 12;
                    if (chapter.fragmentFocus.includes('rail')) score += 16;
                    if (prepOverview.powerGap > 420) score += 18;
                    if ((saveSnapshot.gold || 0) < cost * 0.6) score -= 22;
                }
                if ((saveSnapshot.gold || 0) >= cost) score += 6;
                score -= cost / (offer.id === 'sponsorSupply' ? 420 : 260);
                return {
                    offer,
                    preview,
                    cost,
                    affordable: canAffordShopOffer(offer, saveSnapshot),
                    shortage: Math.max(0, cost - (saveSnapshot.gold || 0)),
                    score,
                    reason: offer.id === 'sponsorSupply'
                        ? getLocalized({
                            zh: '更适合把高额金币直接转成终局养成资源，一次补足能核、赛季经验和轨炮 / 链击碎片。',
                            en: 'Best when you want to convert a large gold stash into endgame cores, Season XP, and Rail/Chain fragments.'
                        })
                        : offer.id === 'forgeCrate'
                            ? getLocalized({
                                zh: '更适合卡章节时补能核、赛季经验和高压章节常用碎片。',
                                en: 'Better when you are stuck on chapter pressure and need cores, Season XP, and higher-tier fragments.'
                            })
                            : getLocalized({
                                zh: '更适合稳定补中期常用碎片，持续抬高三路基础战力。',
                                en: 'Better for steady mid-game fragment growth and raising baseline lane power.'
                            })
                };
            })
            .sort((a, b) => b.score - a.score || a.cost - b.cost);
        return candidates[0] || null;
    }

    function getCoreShopRecommendation(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const prepOverview = getChapterPrepOverview(chapter, saveSnapshot);
        const candidates = SHOP_ITEMS
            .filter((offer) => offer.priceType === 'core' && isShopOfferUnlocked(offer, saveSnapshot))
            .map((offer) => {
                const preview = getShopOfferPreview(offer.id, saveSnapshot);
                const cost = getShopOfferCost(offer.id, saveSnapshot);
                const focus = getRewardFocusMetrics(preview, chapter);
                let score = (focus.focusFragments * 2.8) + focus.totalFragments + (Number(preview.gold) || 0) / 110 + (Number(preview.seasonXp) || 0) * 0.16;
                if (chapter.fragmentFocus.includes('rail') && offer.id === 'relayCrate') score += 16;
                if (prepOverview.powerGap > 340 && offer.id === 'relayCrate') score += 10;
                if (offer.id === 'sponsorPrism') {
                    if (chapter.fragmentFocus.includes('rocket')) score += 10;
                    if (chapter.fragmentFocus.includes('chain')) score += 12;
                    if (chapter.fragmentFocus.includes('rail')) score += 18;
                    if (prepOverview.powerGap > 460) score += 16;
                    if ((saveSnapshot.cores || 0) < cost * 0.6) score -= 18;
                }
                if ((saveSnapshot.cores || 0) >= cost) score += 6;
                score -= cost / (offer.id === 'sponsorPrism' ? 18 : 12);
                return {
                    offer,
                    preview,
                    cost,
                    affordable: canAffordShopOffer(offer, saveSnapshot),
                    shortage: Math.max(0, cost - (saveSnapshot.cores || 0)),
                    score,
                    reason: offer.id === 'sponsorPrism'
                        ? getLocalized({
                            zh: '更适合把能核压缩成大额金币回流与终局碎片，适合高压章节前集中补一口。',
                            en: 'Best when you want to compress cores into a large gold refund plus endgame fragments before harder chapters.'
                        })
                        : offer.id === 'relayCrate'
                            ? getLocalized({
                                zh: '更偏后期，适合补链击 / 轨炮和赛季推进。',
                                en: 'Leans later-game and is better for Chain/Rail growth plus Season progress.'
                            })
                            : getLocalized({
                                zh: '更轻量，适合先补链击 / 轨炮再回一点金币。',
                                en: 'A lighter spend that feeds Chain/Rail first and refunds some gold.'
                            })
                };
            })
            .sort((a, b) => b.score - a.score || a.cost - b.cost);
        return candidates[0] || null;
    }

    function getPaymentOfferRecommendation(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        const sponsorUnlocked = !!saveSnapshot.payment.passUnlocked;
        const prepOverview = getChapterPrepOverview(chapter, saveSnapshot);
        const nextSponsorNode = getNextSponsorSeasonNode(saveSnapshot);
        const sponsorReady = SPONSOR_SEASON_NODES.filter((node) => !!saveSnapshot.payment.passUnlocked && !saveSnapshot.payment.premiumSeasonClaims[node.id] && (Number(saveSnapshot.seasonXp) || 0) >= node.xp).length;
        const targetOfferId = !sponsorUnlocked
            ? (prepOverview.powerGap <= 220 ? 'starter'
                : prepOverview.powerGap <= 420 ? 'accelerator'
                    : prepOverview.powerGap <= 680 ? 'rush'
                        : prepOverview.powerGap <= 980 ? 'sovereign'
                            : prepOverview.powerGap <= 1320 ? 'nexus'
                                : 'throne')
            : (prepOverview.powerGap <= 240 ? 'accelerator'
                : prepOverview.powerGap <= 620 ? 'rush'
                    : prepOverview.powerGap <= 980 ? 'sovereign'
                        : prepOverview.powerGap <= 1360 ? 'nexus'
                            : 'throne');
        const offer = DEFENSE_PAYMENT_OFFERS.find((item) => item.id === targetOfferId) || DEFENSE_PAYMENT_OFFERS[0];
        return {
            offer,
            sponsorUnlocked,
            sponsorReady,
            nextSponsorNode,
            reason: !sponsorUnlocked
                ? getLocalized({
                    zh: '首笔校验充值会永久解锁赞助轨道，所以现在不仅是在买资源，也是在打开后续赛季额外奖励。',
                    en: 'Your first verified payment permanently unlocks the Sponsor track, so you are buying both resources and a future reward lane.'
                })
                : sponsorReady > 0
                    ? getLocalized({
                        zh: '赞助节点已经有可领奖励，建议先去赛季页结算，再决定是否继续补包。',
                        en: 'Sponsor rewards are already ready, so claim them in Season first before deciding on another pack.'
                    })
                    : getLocalized({
                        zh: '当前推荐礼包会更贴近本章节缺口，并继续抬高赞助轨道的回收价值。',
                        en: 'This pack best matches your current chapter gap while increasing the value of your Sponsor track.'
                    })
        };
    }

    function getShopStrategyPlan(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        return {
            prepOverview: getChapterPrepOverview(chapter, saveSnapshot),
            goldRoute: getGoldShopRecommendation(chapter, saveSnapshot),
            coreRoute: getCoreShopRecommendation(chapter, saveSnapshot),
            paymentRoute: getPaymentOfferRecommendation(chapter, saveSnapshot)
        };
    }

    function getRecommendedPaymentOfferId(chapter = getCurrentChapter(), saveSnapshot = state.save) {
        return getPaymentOfferRecommendation(chapter, saveSnapshot).offer.id;
    }

    function syncRecommendedPaymentOfferSelection({ force = false, chapter = getCurrentChapter(), saveSnapshot = state.save } = {}) {
        const recommendedOfferId = getRecommendedPaymentOfferId(chapter, saveSnapshot);
        const currentExists = DEFENSE_PAYMENT_OFFERS.some((offer) => offer.id === selectedPaymentOfferId);
        if (force || !currentExists) {
            selectedPaymentOfferId = recommendedOfferId;
        }
        return recommendedOfferId;
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

    function renderShopOfferCard(offer, strategyPlan = null) {
        const cost = getShopOfferCost(offer.id);
        const unlocked = isShopOfferUnlocked(offer);
        const lockedBySponsor = !!offer.requiresSponsor && !unlocked;
        const canAfford = unlocked && canAffordShopOffer(offer);
        const purchases = getShopOfferPurchaseCount(offer.id);
        const preview = getShopOfferPreview(offer.id);
        const priceSuffix = offer.priceType === 'gold' ? 'G' : 'C';
        const isRecommended = strategyPlan && (strategyPlan.goldRoute?.offer.id === offer.id || strategyPlan.coreRoute?.offer.id === offer.id);
        const paymentOfferId = strategyPlan?.paymentRoute?.offer?.id || selectedPaymentOfferId;
        const chips = lockedBySponsor
            ? [
                `<span class="mini-chip">${getLocalized({ zh: '赞助专供', en: 'Sponsor Only' })}</span>`,
                `<span class="mini-chip">${getLocalized({ zh: '首充后开放', en: 'Unlocks After First Top-Up' })}</span>`,
                isRecommended ? `<span class="mini-chip">${getLocalized({ zh: '后期高价值', en: 'Late-Game Value' })}</span>` : ''
            ].filter(Boolean)
            : [
                `<span class="mini-chip">${getLocalized({ zh: `已购买 ${purchases} 次`, en: `${purchases} bought` })}</span>`,
                `<span class="mini-chip">${offer.priceType === 'gold' ? getLocalized({ zh: '金币消耗点', en: 'Gold sink' }) : getLocalized({ zh: '能核消耗点', en: 'Core sink' })}</span>`,
                offer.requiresSponsor ? `<span class="mini-chip">${getLocalized({ zh: '赞助专供', en: 'Sponsor Only' })}</span>` : '',
                isRecommended ? `<span class="mini-chip">${getLocalized({ zh: '当前推荐', en: 'Recommended now' })}</span>` : ''
            ].filter(Boolean);
        return `
            <article class="shop-card compact-list-card ${lockedBySponsor ? 'premium' : ''} ${canAfford ? 'mission-card claimable' : ''}">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${formatCompact(cost)} ${priceSuffix}</div>
                        <div class="card-title">${getLocalized(offer.title)}</div>
                    </div>
                    <div class="card-number">${getLocalized(offer.slot)}</div>
                </div>
                <div class="card-copy">${lockedBySponsor
                    ? getLocalized({
                        zh: `首笔校验充值后开放。${getLocalized(offer.desc)}`,
                        en: `Unlocks after your first verified payment. ${getLocalized(offer.desc)}`
                    })
                    : getLocalized(offer.desc)}</div>
                <div class="reward-row compact">${renderLimitedChipMarkup(chips, { limit: 3 })}</div>
                <div class="reward-row compact">${renderRewardChips(preview, { limit: 3 })}</div>
                <div class="card-actions compact">
                    ${lockedBySponsor
                        ? `<button class="primary-btn" type="button" data-action="openPayment" data-value="${paymentOfferId}">${getLocalized({ zh: '去解锁', en: 'Unlock' })}</button>`
                        : `<button class="primary-btn" type="button" data-action="buyShop" data-value="${offer.id}" ${canAfford ? '' : 'disabled'}>${getLocalized({ zh: `购买 · ${formatCompact(cost)} ${priceSuffix}`, en: `Buy · ${formatCompact(cost)} ${priceSuffix}` })}</button>`}
                </div>
            </article>
        `;
    }

    function renderShopStrategyCard(strategyPlan = getShopStrategyPlan()) {
        const { prepOverview, goldRoute, coreRoute, paymentRoute } = strategyPlan;
        const nextSponsorNode = paymentRoute.nextSponsorNode;
        const primaryAction = paymentRoute.sponsorUnlocked && paymentRoute.sponsorReady > 0
            ? {
                action: 'claimAllSeason',
                value: 'season',
                label: getLocalized({ zh: '领赞助', en: 'Claim Sponsor' })
            }
            : {
                action: 'openPayment',
                value: paymentRoute.offer.id,
                label: getLocalized({ zh: '开礼包', en: 'Open Pack' })
            };
        const supportAction = goldRoute?.affordable
            ? {
                action: 'buyShop',
                value: goldRoute.offer.id,
                label: getLocalized({ zh: '买金币包', en: 'Buy Gold Pack' })
            }
            : coreRoute?.affordable
                ? {
                    action: 'buyShop',
                    value: coreRoute.offer.id,
                    label: getLocalized({ zh: '买能核包', en: 'Buy Core Pack' })
                }
                : {
                    action: 'openTab',
                    value: 'defend',
                    label: getLocalized({ zh: '去防线', en: 'Battle View' })
                };
        return `
            <article class="shop-card premium topup-overview-card compact-overview-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized({ zh: '当前商城路线', en: 'Current Shop Route' })}</div>
                        <div class="card-title">${paymentRoute.sponsorUnlocked && paymentRoute.sponsorReady > 0
                            ? getLocalized({ zh: '先回收赞助，再决定补包', en: 'Claim sponsor first, then repack' })
                            : getLocalized({ zh: '按当前章节缺口给出推荐', en: 'Routes tuned to your chapter gap' })}</div>
                    </div>
                    <div class="card-number">${prepOverview.powerGap > 0
                        ? getLocalized({ zh: `缺口 ${formatCompact(prepOverview.powerGap)}`, en: `Gap ${formatCompact(prepOverview.powerGap)}` })
                        : getLocalized({ zh: '战力达标', en: 'Power ready' })}</div>
                </div>
                <div class="card-copy">${paymentRoute.reason}</div>
                <div class="shop-kpi-grid">
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '战力缺口', en: 'Power Gap' })}</span>
                        <strong>${prepOverview.powerGap > 0 ? formatCompact(prepOverview.powerGap) : getLocalized({ zh: '达标', en: 'Ready' })}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '待领奖励', en: 'Ready Claims' })}</span>
                        <strong>${formatCompact(paymentRoute.sponsorReady || 0)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '金币短缺', en: 'Gold Shortage' })}</span>
                        <strong>${goldRoute && !goldRoute.affordable ? `${formatCompact(goldRoute.shortage)}G` : getLocalized({ zh: '足够', en: 'Enough' })}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '能核短缺', en: 'Core Shortage' })}</span>
                        <strong>${coreRoute && !coreRoute.affordable ? `${formatCompact(coreRoute.shortage)}C` : getLocalized({ zh: '足够', en: 'Enough' })}</strong>
                    </div>
                </div>
                <div class="reward-row">
                    ${goldRoute ? `<span class="mini-chip">${getLocalized({ zh: `金币优先 ${getLocalized(goldRoute.offer.title)}`, en: `Gold ${getLocalized(goldRoute.offer.title)}` })}</span>` : ''}
                    ${coreRoute ? `<span class="mini-chip">${getLocalized({ zh: `能核优先 ${getLocalized(coreRoute.offer.title)}`, en: `Core ${getLocalized(coreRoute.offer.title)}` })}</span>` : ''}
                    <span class="mini-chip">${getLocalized({ zh: `充值优先 ${getLocalized(paymentRoute.offer.name)}`, en: `Top-up ${getLocalized(paymentRoute.offer.name)}` })}</span>
                </div>
                <div class="reward-row">
                    ${nextSponsorNode
                        ? (paymentRoute.sponsorUnlocked
                            ? `<span class="mini-chip">${nextSponsorNode.ready
                                ? getLocalized({ zh: '赞助节点已就绪', en: 'Sponsor node ready' })
                                : getLocalized({ zh: `下一赞助节点还差 ${formatCompact(nextSponsorNode.remainingXp)} XP`, en: `${formatCompact(nextSponsorNode.remainingXp)} XP to next sponsor node` })}</span>`
                            : `<span class="mini-chip">${getLocalized({ zh: '首充永久解锁赞助轨道', en: 'First top-up unlocks Sponsor track' })}</span>`)
                        : `<span class="mini-chip">${getLocalized({ zh: '赞助轨道已全部领取', en: 'Sponsor track completed' })}</span>`}
                    ${goldRoute && !goldRoute.affordable ? `<span class="mini-chip">${getLocalized({ zh: `金币还差 ${formatCompact(goldRoute.shortage)}`, en: `Need ${formatCompact(goldRoute.shortage)}G` })}</span>` : ''}
                    ${coreRoute && !coreRoute.affordable ? `<span class="mini-chip">${getLocalized({ zh: `能核还差 ${formatCompact(coreRoute.shortage)}`, en: `Need ${formatCompact(coreRoute.shortage)}C` })}</span>` : ''}
                </div>
                ${nextSponsorNode ? `<div class="reward-row compact">
                    <span class="mini-chip">${getLocalized({ zh: '下个赞助节点预览', en: 'Next Sponsor Reward' })}</span>
                    ${renderRewardChips(nextSponsorNode.node.reward, { limit: 3 })}
                </div>` : ''}
                <div class="card-actions compact" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="${primaryAction.action}" data-value="${primaryAction.value}">
                        ${primaryAction.label}
                    </button>
                    <button class="ghost-btn" type="button" data-action="${supportAction.action}" data-value="${supportAction.value}">
                        ${supportAction.label}
                    </button>
                </div>
            </article>
        `;
    }

    function renderTopupOverviewCard(strategyPlan = getShopStrategyPlan()) {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const premiumReady = getSponsorSeasonReadyCount();
        const seasonInfo = getSeasonLevelInfo(state.save.seasonXp);
        const nextSponsorNode = strategyPlan.paymentRoute.nextSponsorNode;
        return `
            <article class="shop-card premium topup-overview-card compact-overview-card">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">VERIFIED TOP-UP</div>
                        <div class="card-title">${getLocalized({ zh: '防线充值中心', en: 'Defense Top-Up Center' })}</div>
                    </div>
                    <div class="card-number">${sponsorUnlocked ? getLocalized({ zh: '已解锁', en: 'Unlocked' }) : getLocalized({ zh: '待解锁', en: 'Locked' })}</div>
                </div>
                <div class="card-copy">${sponsorUnlocked
                    ? getLocalized({ zh: '校验成功后奖励直发到账，赛季赞助节点同步开启。', en: 'Verified payments grant rewards instantly and keep Sponsor nodes live.' })
                    : getLocalized({ zh: '下单、精确支付、粘贴 txid 校验，即可发奖并永久解锁赞助轨道。', en: 'Create an order, pay the exact amount, then verify the txid to grant rewards and unlock the Sponsor track.' })
                }</div>
                <div class="reward-row">
                    <span class="mini-chip">${getLocalized({ zh: `${premiumReady} 个赞助节点待领取`, en: `${premiumReady} sponsor nodes ready` })}</span>
                    <span class="mini-chip">OKX Wallet · TRON (TRC20)</span>
                    <span class="mini-chip">${getLocalized({ zh: `推荐礼包 ${getLocalized(strategyPlan.paymentRoute.offer.name)}`, en: `Recommended ${getLocalized(strategyPlan.paymentRoute.offer.name)}` })}</span>
                    ${nextSponsorNode
                        ? `<span class="mini-chip">${sponsorUnlocked
                            ? (nextSponsorNode.ready
                                ? getLocalized({ zh: '下个赞助节点可领', en: 'Next sponsor node ready' })
                                : getLocalized({ zh: `下个赞助节点差 ${formatCompact(nextSponsorNode.remainingXp)} XP`, en: `${formatCompact(nextSponsorNode.remainingXp)} XP to next sponsor node` }))
                            : getLocalized({ zh: '首充后开启赞助节点', en: 'First top-up unlocks sponsor nodes' })}</span>`
                        : ''}
                </div>
                ${nextSponsorNode ? `<div class="reward-row compact">
                    <span class="mini-chip">${getLocalized({ zh: '下个赞助节点奖励', en: 'Next Sponsor Reward' })}</span>
                    ${renderRewardChips(nextSponsorNode.node.reward, { limit: 3 })}
                </div>` : ''}
                <div class="shop-kpi-grid">
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '已校验订单', en: 'Verified Orders' })}</span>
                        <strong>${formatCompact(state.save.payment.purchaseCount || 0)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '赞助轨道', en: 'Sponsor Track' })}</span>
                        <strong>${sponsorUnlocked ? getLocalized({ zh: '已解锁', en: 'Unlocked' }) : getLocalized({ zh: '待解锁', en: 'Locked' })}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '累计充值', en: 'Total Spent' })}</span>
                        <strong>$${Number(state.save.payment.totalSpent || 0).toFixed(2)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '赛季等级', en: 'Season Level' })}</span>
                        <strong>Lv.${seasonInfo.level}</strong>
                    </div>
                </div>
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="${sponsorUnlocked && premiumReady > 0 ? 'claimAllSeason' : 'openPayment'}" data-value="${sponsorUnlocked && premiumReady > 0 ? 'season' : strategyPlan.paymentRoute.offer.id}">
                        ${sponsorUnlocked && premiumReady > 0
                            ? getLocalized({ zh: '领待奖', en: 'Claim Ready' })
                            : getLocalized({ zh: '开礼包', en: 'Open Pack' })}
                    </button>
                    ${sponsorUnlocked && premiumReady > 0 ? `<button class="ghost-btn" type="button" data-action="openTab" data-value="season">
                        ${getLocalized({ zh: '赛季', en: 'Season' })}
                    </button>` : ''}
                </div>
            </article>
        `;
    }

    function renderPaymentOfferCard(offer, strategyPlan = null) {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const isRecommended = strategyPlan?.paymentRoute?.offer.id === offer.id;
        return `
            <article class="shop-card compact-list-card paypack" style="--offer-accent:${offer.accent};">
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized(offer.badge)}</div>
                        <div class="card-title">${getLocalized(offer.name)}</div>
                    </div>
                    <div class="card-number">$${offer.price.toFixed(2)}</div>
                </div>
                <div class="card-copy">${getLocalized(offer.desc)}</div>
                <div class="reward-row compact">
                    ${renderLimitedChipMarkup([
                        `<span class="mini-chip">${getLocalized({ zh: '链上校验发奖', en: 'On-chain verified' })}</span>`,
                        `<span class="mini-chip">TRON (TRC20)</span>`,
                        !sponsorUnlocked ? `<span class="mini-chip">${getLocalized({ zh: '首充解锁赞助', en: 'Unlocks Sponsor' })}</span>` : '',
                        isRecommended ? `<span class="mini-chip">${getLocalized({ zh: '当前推荐', en: 'Recommended now' })}</span>` : ''
                    ], { limit: 3 })}
                </div>
                <div class="reward-row compact">${renderRewardChips(offer.reward, { limit: 3 })}</div>
                <div class="card-actions compact">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${offer.id}">
                        ${getLocalized({ zh: '立即支付', en: 'Pay Now' })}
                    </button>
                </div>
            </article>
        `;
    }

    function renderSponsorSeasonSection() {
        const sponsorUnlocked = !!state.save.payment.passUnlocked;
        const nextSponsorNode = getNextSponsorSeasonNode();
        const strategyPlan = getShopStrategyPlan();
        const sponsorReady = getSponsorSeasonReadyCount();

        if (!sponsorUnlocked) {
            return `
                <article class="shop-card premium topup-overview-card">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${t('sponsorTrack')}</div>
                            <div class="card-title">${getLocalized({ zh: '赞助轨道未开启', en: 'Sponsor Track Locked' })}</div>
                        </div>
                        <div class="card-number">${getLocalized({ zh: '待解锁', en: 'Locked' })}</div>
                    </div>
                    <div class="card-copy">${getLocalized({ zh: '任意一笔校验成功的充值都会解锁赞助轨道，并随赛季经验追加额外奖励。', en: 'Any verified top-up unlocks the Sponsor track and adds extra rewards as Season XP grows.' })}</div>
                    ${nextSponsorNode ? `<div class="reward-row compact">
                        <span class="mini-chip">${getLocalized({ zh: '解锁后首个赞助节点', en: 'First Sponsor Node After Unlock' })}</span>
                        ${renderRewardChips(nextSponsorNode.node.reward, { limit: 3 })}
                    </div>` : `<div class="reward-row compact">${renderRewardChips({ gold: 1800, cores: 20, fragments: { chain: 12, rail: 8 } }, { limit: 3 })}</div>`}
                    <div class="card-actions compact">
                        <button class="primary-btn" type="button" data-action="openPayment" data-value="${strategyPlan.paymentRoute.offer.id}">${getLocalized({ zh: '立即解锁', en: 'Unlock Now' })}</button>
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
                    <p>${getLocalized({ zh: '达到指定赛季经验后，就能在这里领取额外赞助奖励。', en: 'Reach the required Season XP here to claim extra sponsor rewards.' })}</p>
                </div>
                <div class="mini-chip">${getLocalized({ zh: `待领取 ${sponsorReady} 个节点`, en: `${sponsorReady} nodes ready` })}</div>
            </div>
            ${nextSponsorNode ? `
                <article class="shop-card premium topup-overview-card" style="margin-bottom:14px;">
                    <div class="card-top">
                        <div>
                            <div class="card-kicker">${getLocalized({ zh: '下一赞助节点', en: 'Next Sponsor Node' })}</div>
                            <div class="card-title">${getLocalized({ zh: `赞助节点 ${SPONSOR_SEASON_NODES.findIndex((item) => item.id === nextSponsorNode.node.id) + 1}`, en: `Sponsor Node ${SPONSOR_SEASON_NODES.findIndex((item) => item.id === nextSponsorNode.node.id) + 1}` })}</div>
                        </div>
                        <div class="card-number">${nextSponsorNode.ready
                            ? getLocalized({ zh: '可直接领取', en: 'Ready Now' })
                            : getLocalized({ zh: `还差 ${formatCompact(nextSponsorNode.remainingXp)} XP`, en: `${formatCompact(nextSponsorNode.remainingXp)} XP left` })}</div>
                    </div>
                    <div class="card-copy">${nextSponsorNode.ready
                        ? getLocalized({ zh: '这个节点已经达标，可直接从当前页领取。', en: 'This node is ready and can be claimed from the current page.' })
                        : getLocalized({ zh: '继续抬升赛季经验，就能拿到这一档赞助奖励。', en: 'Keep raising Season XP to unlock this sponsor reward tier.' })}</div>
                    <div class="reward-row compact">${renderRewardChips(nextSponsorNode.node.reward, { limit: 3 })}</div>
                    <div class="card-actions compact" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="${nextSponsorNode.ready ? 'claimAllSeason' : 'openTab'}" data-value="${nextSponsorNode.ready ? 'season' : 'shop'}">
                            ${nextSponsorNode.ready
                                ? getLocalized({ zh: '一键领取', en: 'Claim Ready' })
                                : getLocalized({ zh: '商城补强', en: 'Shop Route' })}
                        </button>
                    </div>
                </article>
            ` : ''}
            <div class="season-grid">
                ${sponsorNodes.map(({ node, index, claimable, claimed }) => `
                    <article class="season-node compact-list-card ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${claimable ? getLocalized({ zh: '可领取', en: 'Ready' }) : `XP ${node.xp}`}</div>
                                <div class="card-title">${getLocalized({ zh: `赞助节点 ${index + 1}`, en: `Sponsor Node ${index + 1}` })}</div>
                            </div>
                            <div class="card-number">${formatCompact(node.xp)} XP</div>
                        </div>
                        <div class="reward-row compact">${renderRewardChips(node.reward, { limit: 3 })}</div>
                        <div class="card-actions compact">
                            <button class="primary-btn" type="button" data-action="claimSponsorSeason" data-value="${node.id}" ${claimable ? '' : 'disabled'}>
                                ${claimed ? t('seasonClaimed') : t('seasonClaim')}
                            </button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderRewardChips(reward, options = {}) {
        const limit = Number.isFinite(options.limit) ? options.limit : Infinity;
        reward = reward || {};
        const chips = [];
        if (reward.gold) chips.push(`<span class="mini-chip">${formatCompact(reward.gold)} G</span>`);
        if (reward.cores) chips.push(`<span class="mini-chip">${formatCompact(reward.cores)} C</span>`);
        if (reward.seasonXp) chips.push(`<span class="mini-chip">${formatCompact(reward.seasonXp)} ${getLocalized({ zh: '赛季经验', en: 'Season XP' })}</span>`);
        if (reward.fragments) {
            Object.entries(reward.fragments).forEach(([towerId, amount]) => {
                if ((Number(amount) || 0) > 0) chips.push(`<span class="mini-chip">${towerLabel(towerId)} +${formatCompact(amount)}</span>`);
            });
        }
        if (chips.length > limit) {
            const hiddenCount = chips.length - limit;
            return [
                ...chips.slice(0, limit),
                `<span class="mini-chip is-muted">${getLocalized({ zh: `+${hiddenCount} 项`, en: `+${hiddenCount} more` })}</span>`
            ].join('');
        }
        return chips.join('');
    }

    function renderTabState() {
        document.body.dataset.defenseTab = state.activeTab;
        document.querySelectorAll('.tab-btn[data-tab]').forEach((node) => node.classList.toggle('is-active', node.dataset.tab === state.activeTab));
        const redDots = { defend: false, prep: false, loadout: hasLoadoutRedDot(), research: hasResearchRedDot(), missions: hasMissionRedDot(), season: hasSeasonRedDot(), shop: hasShopRedDot() };
        Object.entries(redDots).forEach(([tab, active]) => {
            const dot = document.querySelector(`[data-tab-dot="${tab}"]`);
            if (dot) dot.classList.toggle('active', !!active);
        });
    }

    function scrollToActiveSection(tab) {
        const target = tab === 'defend' ? ui.stageCard : ui.panelCard;
        if (!target) return;
        requestAnimationFrame(() => {
            try {
                target.scrollIntoView({ block: 'start', behavior: 'smooth' });
            } catch (error) {}
        });
    }

    function switchTab(tab) {
        const nextTab = ['defend', 'prep', 'loadout', 'research', 'missions', 'season', 'shop'].includes(tab) ? tab : 'defend';
        const changed = state.activeTab !== nextTab;
        if (changed && nextTab !== 'defend' && state.battle.running && !state.battle.finished && !state.battle.paused) {
            pauseBattle();
        }
        state.activeTab = nextTab;
        renderAll();
        if (changed) scrollToActiveSection(nextTab);
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
        const prepOverview = getChapterPrepOverview(chapter);
        ui.startDescription.textContent = `${t('startDescTemplate').replace('{chapter}', chapter.id)} ${getChapterOpeningGuide(chapter)}`;
        ui.startMeta.innerHTML = `
            <span class="mini-chip">${t('startMetaReward').replace('{gold}', formatCompact(chapter.goldReward)).replace('{core}', formatCompact(chapter.coreReward)).replace('{fragment}', formatCompact(chapter.fragmentReward))}</span>
            <span class="mini-chip">${t('startMetaEnemy').replace('{enemy}', mainEnemy)}</span>
            <span class="mini-chip">${getLocalized({ zh: `碎片倾向 ${focusPreview}`, en: `Focus Drops ${focusPreview}` })}</span>
            <span class="mini-chip">${getLocalized({ zh: `推荐技能 ${recommendedSkill}`, en: `Recommended Skill ${recommendedSkill}` })}</span>
            <span class="mini-chip">${prepOverview.ready
                ? getLocalized({ zh: '推荐编队已就绪', en: 'Preset ready' })
                : getLocalized({ zh: `还有 ${prepOverview.adjustmentsNeeded} 项待调整`, en: `${prepOverview.adjustmentsNeeded} prep tweaks` })}</span>
        `;
    }

    function startBattle(restart) {
        if (!restart && state.battle.running && !state.battle.finished) return;
        startLoop();
        state.battle = createEmptyBattle();
        state.activeTab = 'defend';
        state.battle.running = true;
        state.battle.coreHp = getCoreMaxHp();
        state.battle.shield = getCoreShieldCap();
        state.battle.lastFrame = performance.now();
        state.battle.skillReadyPulse = 1.8;
        lastBattleInsightStamp = '';
        state.save.stats.runs += 1;
        saveProgress();
        hideOverlay(ui.resultOverlay);
        hideOverlay(ui.pauseOverlay);
        hideOverlay(ui.upgradeOverlay);
        hideOverlay(ui.startOverlay);
        startWave(1);
        renderAll();
        scrollToActiveSection('defend');
    }

    function startWave(waveNumber) {
        state.battle.currentWave = waveNumber;
        state.battle.currentWaveElapsed = 0;
        state.battle.spawnQueue = buildWaveQueue(getCurrentChapter(), waveNumber);
        state.battle.awaitingUpgrade = false;
        state.battle.pendingChoices = [];
        state.battle.waveSpawnedCount = 0;
        state.battle.waveQueueSafetyRetries = 0;
        state.battle.lastFrame = performance.now();
        hideOverlay(ui.upgradeOverlay);
        const incomingText = waveNumber >= TOTAL_WAVES
            ? t('finalWaveIncomingText')
            : t('waveIncomingText').replace('{wave}', String(waveNumber));
        triggerBattleBanner(
            incomingText,
            waveNumber >= TOTAL_WAVES ? 'boss' : 'wave',
            waveNumber >= TOTAL_WAVES ? 2 : 1.5
        );
        triggerEdgeFlash(waveNumber >= TOTAL_WAVES ? 'boss' : 'wave', waveNumber >= TOTAL_WAVES ? 1.2 : 0.6);
        pushBattleAlert(
            waveNumber >= TOTAL_WAVES
                ? getLocalized({ zh: '最终波已开启，Boss 即将到场', en: 'Final wave started. Boss arrival is imminent.' })
                : getLocalized({ zh: `${incomingText}，注意先吃压的那一路`, en: `${incomingText}. Watch the first lane that buckles.` }),
            waveNumber >= TOTAL_WAVES ? 'boss' : 'wave',
            waveNumber >= TOTAL_WAVES ? 2.8 : 2.3
        );
        seedOpeningEnemy();
    }

    function buildWaveQueue(chapter, waveNumber) {
        const queue = [];
        let at = 0;
        const chapterIndex = clampSaveNumber(state.save.chapterIndex, 0, 0, CHAPTERS.length - 1);
        const count = 5 + waveNumber * 2 + chapterIndex;
        for (let index = 0; index < count; index += 1) {
            at += getWaveSpawnSpacing(index, waveNumber, chapterIndex);
            const pool = getEnemyPoolForWave(chapter, waveNumber);
            queue.push({ at, lane: (index + waveNumber + chapterIndex) % 3, type: pool[index % pool.length] });
        }
        if (waveNumber === TOTAL_WAVES) queue.push({ at: at + 1.6, lane: 1, type: 'boss' });
        else if (waveNumber >= 4) queue.push({ at: at + 0.9, lane: (waveNumber + 1) % 3, type: 'elite' });
        queue.push(...getChapterWaveQueueExtras(chapter, waveNumber, at));
        if (!queue.length) {
            const fallbackType = getEnemyPoolForWave(chapter, waveNumber)[0] || 'grunt';
            queue.push(
                { at: 1.1, lane: 0, type: fallbackType },
                { at: 1.7, lane: 1, type: fallbackType },
                { at: 2.3, lane: 2, type: fallbackType }
            );
        }
        queue.sort((a, b) => a.at - b.at || a.lane - b.lane);
        return queue;
    }

    function getWaveSpawnSpacing(index, waveNumber, chapterIndex) {
        const baseSpacing = Math.max(0.38, 1.08 - waveNumber * 0.08 - chapterIndex * 0.04 + (index % 2 === 0 ? 0.1 : 0));
        if (index === 0) return Math.max(0.26, baseSpacing - 0.82);
        if (index === 1) return Math.max(0.48, baseSpacing - 0.48);
        if (index === 2) return Math.max(0.62, baseSpacing - 0.34);
        return baseSpacing;
    }

    function getChapterWaveQueueExtras(chapter, waveNumber, baseTailAt) {
        const script = CHAPTER_WAVE_SCRIPTS[chapter.id]?.[waveNumber];
        if (!Array.isArray(script) || !script.length) return [];
        const tailAt = Math.max(1.4, Number(baseTailAt) || 1.4);
        return script.map((entry, index) => ({
            at: Math.max(0.72, Number((tailAt * entry.progress + index * 0.015).toFixed(2))),
            lane: Math.max(0, Math.min(2, Number(entry.lane) || 0)),
            type: normalizeWaveSpawnType(entry.type, chapter, waveNumber)
        }));
    }

    function normalizeWaveSpawnType(type, chapter, waveNumber) {
        if (ENEMY_TYPE_IDS.has(type)) return type;
        return getEnemyPoolForWave(chapter, waveNumber)[0] || 'grunt';
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
                enemy.hitFlash = Math.max(enemy.hitFlash || 0, enemy.boss ? 0.4 : 0.28);
            });
            cleanupDeadEnemies();
            pushSkillBurst('emp');
            state.battle.screenShakeTimer = Math.max(state.battle.screenShakeTimer, 0.22);
            state.battle.screenShakeStrength = Math.max(state.battle.screenShakeStrength, 6.4);
            showToast(t('toastSkillEmp'));
            triggerEdgeFlash('emp', 0.65);
        } else if (state.save.selectedSkill === 'overclock') {
            state.battle.skillEffect = 'overclock';
            state.battle.skillEffectTimer = 8;
            pushSkillBurst('overclock');
            showToast(t('toastSkillOverclock'));
            triggerEdgeFlash('overclock', 0.8);
        } else {
            state.battle.shield = Math.min(getCoreShieldCap() * 1.6, state.battle.shield + 70 * relayBoost);
            state.battle.coreHp = Math.min(getCoreMaxHp(), state.battle.coreHp + 18 * relayBoost);
            pushSkillBurst('shield');
            showToast(t('toastSkillShield'));
            triggerEdgeFlash('shield', 0.8);
        }
        state.save.stats.skillsUsed += 1;
        state.battle.skillCooldown = Math.max(6, SKILLS[state.save.selectedSkill].cooldown * (1 - getResearchLevel('relay') * 0.06));
        state.battle.laneSkillGlow = SKILL_READY_GLOW_MS;
        state.battle.skillReadyPulse = 0;
        saveProgress();
        renderAll();
    }

    function seedOpeningEnemy() {
        if (!state.battle.spawnQueue.length) return;
        const openingSpawn = state.battle.spawnQueue.shift();
        spawnEnemy(openingSpawn);
        state.battle.currentWaveElapsed = Math.max(state.battle.currentWaveElapsed, Math.max(0, openingSpawn.at - 0.16));
    }

    function startLoop() {
        if (state.battleLoopStarted) return;
        state.battleLoopStarted = true;
        const step = (timestamp) => {
            try {
                updateBattle(timestamp);
                drawBattlefield();
            } catch (error) {
                console.error('[defense] battle loop error', error);
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    function updateBattle(timestamp) {
        const battle = state.battle;
        const delta = Math.min(0.05, Math.max(0, (timestamp - battle.lastFrame) / 1000));
        battle.lastFrame = timestamp;
        tickBattleVisuals(delta);

        if (!battle.running || battle.paused || battle.awaitingUpgrade || battle.finished) {
            if (battle.skillCooldown > 0 && !battle.paused && !battle.finished) {
                const previousCooldown = battle.skillCooldown;
                battle.skillCooldown = Math.max(0, battle.skillCooldown - delta);
                if (previousCooldown > 0 && battle.skillCooldown <= 0) announceSkillReady();
                renderActionBar();
            }
            return;
        }

        battle.totalElapsed += delta;
        battle.currentWaveElapsed += delta;
        const previousCooldown = battle.skillCooldown;
        battle.skillCooldown = Math.max(0, battle.skillCooldown - delta);
        if (previousCooldown > 0 && battle.skillCooldown <= 0) announceSkillReady();
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
            if (battle.waveSpawnedCount <= 0 && battle.waveQueueSafetyRetries < 1) {
                battle.waveQueueSafetyRetries += 1;
                battle.currentWaveElapsed = 0;
                battle.spawnQueue = buildWaveQueue(getCurrentChapter(), battle.currentWave);
                renderHud();
                renderActionBar();
                return;
            }
            if (battle.waveSpawnedCount <= 0 && battle.currentWaveElapsed < 0.9) {
                renderHud();
                renderActionBar();
                return;
            }
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
        const spawnY = getEnemySpawnY(spawn.type, state.battle.currentWave);
        state.battle.waveSpawnedCount += 1;
        state.battle.enemies.push({
            id: state.battle.nextEnemyId++,
            type: spawn.type,
            lane: spawn.lane,
            x: LANE_POSITIONS[spawn.lane],
            y: spawnY,
            hp: stats.hp,
            maxHp: stats.hp,
            speed: stats.speed,
            damage: stats.damage,
            rewardGold: stats.rewardGold,
            rewardCore: stats.rewardCore,
            radius: stats.radius,
            stun: 0,
            slow: 0,
            hitFlash: 0,
            hitFxCooldown: 0,
            spawnFx: spawn.type === 'boss' ? 1.2 : 0.9,
            split: stats.split,
            elite: stats.elite,
            boss: stats.boss
        });
        state.battle.spawnBursts.push({
            x: LANE_POSITIONS[spawn.lane],
            y: 96,
            radius: spawn.type === 'boss' ? 100 : 72,
            timer: spawn.type === 'boss' ? 1.4 : 0.9,
            duration: spawn.type === 'boss' ? 1.4 : 0.9,
            tone: spawn.type === 'boss' ? 'boss' : (spawn.type === 'elite' ? 'overclock' : 'wave'),
            label: spawn.type === 'boss'
                ? 'BOSS'
                : (spawn.type === 'elite'
                    ? getLocalized({ zh: '精英', en: 'ELITE' })
                    : ''),
            subLabel: spawn.type === 'boss'
                ? getLocalized({ zh: `${getLaneName(spawn.lane)}压境`, en: `${getLaneName(spawn.lane)} under push` })
                : (spawn.type === 'elite'
                    ? getLocalized({ zh: `${getLaneName(spawn.lane)}突入`, en: `${getLaneName(spawn.lane)} breach` })
                    : '')
        });
        const shouldShowLaneAlert = spawn.type === 'boss' || spawn.type === 'elite';
        if (shouldShowLaneAlert) {
            const laneAlert = getLaneSpawnAlert(spawn);
            pushBattleAlert(laneAlert.text, laneAlert.tone, laneAlert.duration);
            state.battle.laneAlertTimers[spawn.lane] = spawn.type === 'boss' ? 1.8 : 1.15;
        }
        if (spawn.type === 'boss') {
            state.battle.bossAlertTimer = 3.2;
            state.battle.skillReadyPulse = Math.max(state.battle.skillReadyPulse, 1.4);
            triggerBattleBanner(t('bossIncomingText'), 'boss', 2.2);
            triggerEdgeFlash('boss', 1.5);
            showToast(t('toastBossIncoming'));
        }
    }

    function getEnemySpawnY(type, waveNumber) {
        if (type === 'boss') return 42;
        if (type === 'elite') return waveNumber <= 2 ? 118 : 96;
        return waveNumber <= 2 ? 132 : 108;
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
        const chapterIndex = clampSaveNumber(state.save.chapterIndex, 0, 0, CHAPTERS.length - 1);
        const waveFactor = 1 + wave * 0.18 + chapterIndex * 0.11;
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
            enemy.spawnFx = Math.max(0, (Number(enemy.spawnFx) || 0) - delta * 2.4);
            enemy.hitFlash = Math.max(0, (Number(enemy.hitFlash) || 0) - delta * 4.2);
            enemy.hitFxCooldown = Math.max(0, (Number(enemy.hitFxCooldown) || 0) - delta);
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
        let shieldAbsorbed = 0;
        if (state.battle.shield > 0) {
            const absorbed = Math.min(state.battle.shield, remaining);
            state.battle.shield -= absorbed;
            remaining -= absorbed;
            shieldAbsorbed += absorbed;
        }
        if (remaining > 0) state.battle.coreHp -= remaining;
        if (damage > 0) triggerCoreImpact(remaining, shieldAbsorbed);
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
                hitFlash: 0,
                hitFxCooldown: 0,
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
            const targets = enemyByLane[lane].filter((enemy) => isEnemyInTowerRange(towerId, lane, enemy));
            if (!targets.length) continue;
            state.battle.laneTimers[lane] = 0;
            fireLaneTower(towerId, lane, targets);
        }
    }

    function isEnemyInTowerRange(towerId, lane, enemy) {
        const tower = TOWERS[towerId];
        if (!tower || !enemy || enemy.lane !== lane) return false;
        const towerY = 842;
        const reach = tower.range || 480;
        return Math.abs(towerY - enemy.y) <= reach;
    }

    function fireLaneTower(towerId, lane, targets) {
        const tower = TOWERS[towerId];
        let damage = getTowerDamagePerShot(towerId);
        if (state.battle.skillEffect === 'overclock') damage *= 1.42;
        const target = targets[0];
        const towerX = LANE_POSITIONS[lane];
        const towerY = 842;
        pushTowerShotTrace(towerId, towerX, towerY, target.x, target.y, 1);
        applyDamage(target, damage, towerId);
        if (tower.splash || state.battle.modifiers.splashBonus > 0) {
            const splash = damage * ((tower.splash || 0) + state.battle.modifiers.splashBonus);
            targets.slice(1, 3).forEach((enemy) => {
                pushTowerShotTrace(towerId, towerX, towerY, enemy.x, enemy.y, 0.82);
                applyDamage(enemy, splash, towerId, true);
            });
        }
        if (tower.chain) targets.slice(1, 3).forEach((enemy, index) => {
            pushTowerShotTrace(towerId, target.x, target.y, enemy.x, enemy.y, Math.max(0.62, 0.82 - index * 0.1), true);
            applyDamage(enemy, damage * tower.chain, towerId, true);
        });
        if (tower.pierce) targets.slice(1).forEach((enemy, index) => {
            pushTowerShotTrace(towerId, towerX, towerY, enemy.x, enemy.y, Math.max(0.58, 0.86 - index * 0.1));
            applyDamage(enemy, damage * 0.45, towerId, true);
        });
        if (tower.slow > 0) target.slow = Math.max(target.slow, tower.slow + state.battle.modifiers.freezeChance);
        else if (Math.random() < state.battle.modifiers.freezeChance) target.slow = Math.max(target.slow, 0.22);
        state.battle.laneFlash[lane] = 1;
    }

    function applyDamage(enemy, amount, towerId, noGoldBonus) {
        if (!enemy) return;
        const finalAmount = amount * ((enemy.elite || enemy.boss) ? state.battle.modifiers.eliteDamage : 1);
        enemy.hitFlash = Math.max(enemy.hitFlash || 0, enemy.boss ? 0.34 : 0.22);
        if ((enemy.hitFxCooldown || 0) <= 0) {
            pushHitBurst(enemy.x, enemy.y, getEnemyBurstTone(enemy.type), noGoldBonus ? 0.78 : 1);
            enemy.hitFxCooldown = noGoldBonus ? 0.08 : 0.05;
        }
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
        pushDefeatBurst(enemy);
        if (enemy.boss) {
            state.battle.screenShakeTimer = Math.max(state.battle.screenShakeTimer, 0.4);
            state.battle.screenShakeStrength = Math.max(state.battle.screenShakeStrength, 11);
        } else if (enemy.elite) {
            state.battle.screenShakeTimer = Math.max(state.battle.screenShakeTimer, 0.16);
            state.battle.screenShakeStrength = Math.max(state.battle.screenShakeStrength, 4.8);
        }
        state.save.gold += gold;
        state.save.cores += coreGain;
    }

    function cleanupDeadEnemies() {
        state.battle.enemies = state.battle.enemies.filter((enemy) => enemy.hp > 0);
    }

    function presentUpgradeChoices() {
        state.battle.awaitingUpgrade = true;
        state.battle.pendingChoices = pickUpgradeChoices();
        triggerWaveClearCelebration();
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
        state.battle.pendingChoices = [];
        state.battle.lastFrame = performance.now();
        startWave(state.battle.currentWave + 1);
        renderAll();
    }

    function finishBattle(win, forcedQuit) {
        const chapter = getCurrentChapter();
        const finalChapterId = CHAPTERS[CHAPTERS.length - 1].id;
        let finishToastKey = win ? 'toastRunWin' : 'toastRunLose';
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
            const chapterWins = state.save.stats.chapterWins && typeof state.save.stats.chapterWins === 'object'
                ? state.save.stats.chapterWins
                : {};
            state.save.stats.chapterWins = chapterWins;
            chapterWins[chapter.id] = (Number(chapterWins[chapter.id]) || 0) + 1;
            const prevBest = state.save.bestChapterIndex;
            if (state.save.chapterIndex >= state.save.bestChapterIndex && state.save.bestChapterIndex < CHAPTERS.length - 1) {
                state.save.bestChapterIndex += 1;
            }
            if (chapter.id === finalChapterId && chapterWins[chapter.id] === 1) finishToastKey = 'toastFinalChapterClear';
            else if (prevBest !== state.save.bestChapterIndex) finishToastKey = 'toastChapterUnlocked';
        }
        state.battle.result = { win, forcedQuit: !!forcedQuit, goldGain, coreGain, seasonGain, fragmentGain, chapterProgress: CHAPTERS[state.save.bestChapterIndex].id };
        saveProgress();
        renderResultOverlay();
        renderAll();
        showToast(t(finishToastKey));
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

    function claimAllMissions() {
        const bundle = getClaimableMissionBundle();
        if (!bundle.count) return;
        state.save.missionClaimed = Array.from(new Set([...state.save.missionClaimed, ...bundle.ids]));
        grantReward(bundle.reward);
        saveProgress();
        showToast(getLocalized({ zh: `已一键领取 ${bundle.count} 个任务奖励`, en: `${bundle.count} mission rewards claimed` }));
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

    function claimAllSeasonRewards() {
        const bundle = getClaimableSeasonBundle();
        if (!bundle.count) return;
        state.save.seasonClaimed = Array.from(new Set([...state.save.seasonClaimed, ...bundle.standardIds]));
        bundle.sponsorIds.forEach((id) => {
            state.save.payment.premiumSeasonClaims[id] = true;
        });
        grantReward(bundle.reward);
        saveProgress();
        showToast(getLocalized({
            zh: `已批量领取 ${bundle.count} 个赛季节点奖励`,
            en: `${bundle.count} season rewards claimed`
        }));
        renderAll();
    }

    function claimSponsorSeason(id) {
        const node = SPONSOR_SEASON_NODES.find((item) => item.id === id);
        if (!node || !isSponsorSeasonClaimable(id)) return;
        state.save.payment.premiumSeasonClaims[id] = true;
        grantReward(node.reward);
        saveProgress();
        showToast(getLocalized({ zh: '赞助轨道奖励已领取', en: 'Sponsor track reward claimed.' }));
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
        if (!isShopOfferUnlocked(offer)) {
            return showToast(getLocalized({ zh: '先解锁赞助轨道', en: 'Unlock Sponsor track first' }));
        }
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

    function getCurrentChapter() {
        return CHAPTERS[clampSaveNumber(state.save.chapterIndex, 0, 0, CHAPTERS.length - 1)] || CHAPTERS[0];
    }
    function getChapterWinCount(chapterId, saveSnapshot = state.save) { return Number(saveSnapshot.stats?.chapterWins?.[chapterId]) || 0; }
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
    function getMissionView(mission) {
        const progress = Math.min(mission.target, mission.metric(state.save));
        const claimed = state.save.missionClaimed.includes(mission.id);
        const claimable = !claimed && progress >= mission.target;
        return {
            id: mission.id,
            title: getLocalized(mission.title),
            desc: getLocalized(mission.desc),
            target: mission.target,
            progress,
            progressRate: mission.target <= 0 ? 1 : progress / mission.target,
            rewardChips: renderRewardChips(mission.reward, { limit: 3 }),
            claimable,
            claimed,
            sort: claimable ? 4000 : claimed ? 100 : 1000 + progress
        };
    }
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

        if (!text) return getLocalized({ zh: '支付校验失败，请稍后重试。', en: 'Payment verification failed. Please try again.' });
        if (lower.includes('txid not found')) return getLocalized({ zh: '未在 TRON 主网找到该 txid，请确认交易已经上链。', en: 'This txid was not found on TRON mainnet yet.' });
        if (lower.includes('not confirmed yet')) return getLocalized({ zh: '该交易还未确认，请稍后再试。', en: 'This transfer is not confirmed yet. Try again shortly.' });
        if (lower.includes('execution failed')) return getLocalized({ zh: '链上交易执行失败，无法发奖。', en: 'The on-chain transaction failed, so rewards cannot be granted.' });
        if (lower.includes('not a trc20 contract transfer')) return getLocalized({ zh: '这不是一笔 TRC20 转账。', en: 'This transaction is not a TRC20 transfer.' });
        if (lower.includes('not trc20 usdt')) return getLocalized({ zh: '该交易不是 TRC20-USDT 支付。', en: 'This transaction is not a TRC20-USDT payment.' });
        if (lower.includes('recipient address')) return getLocalized({ zh: '收款地址不匹配，请确认转入的是当前订单地址。', en: 'Recipient address mismatch. Please send to the address shown in the current order.' });
        if (lower.includes('amount mismatch')) return getLocalized({ zh: '支付金额与当前订单的精确金额不一致。', en: 'The payment amount does not match the current exact order amount.' });
        if (lower.includes('before this order was created')) return getLocalized({ zh: '该交易早于订单创建时间，不能用于当前订单。', en: 'This transfer happened before the order was created and cannot be used.' });
        if (lower.includes('after the order expired') || lower.includes('order expired')) return getLocalized({ zh: '当前订单已过期，请重新创建订单。', en: 'This order has expired. Create a new order before paying again.' });
        if (lower.includes('already been used by another order') || lower.includes('another txid')) return getLocalized({ zh: '该 txid 已被其他订单使用。', en: 'This txid has already been used by another order.' });
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) return getLocalized({ zh: '订单创建失败，请重新选择礼包。', en: 'Failed to create the payment order. Please select the pack again.' });
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) return getLocalized({ zh: '支付接口暂时不可用，请稍后再试。', en: 'The payment service is temporarily unavailable. Please try again later.' });
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
        const recommendedOfferId = getRecommendedPaymentOfferId();
        ui.paymentOfferGrid.innerHTML = DEFENSE_PAYMENT_OFFERS.map((offer) => `
            <button
                class="defense-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}"
                type="button"
                data-select-payment-offer="${offer.id}"
                style="--offer-accent:${offer.accent};"
            >
                <span class="pill defense-payment-offer-badge" style="color:${offer.accent};border-color:${offer.accent}55;">${getLocalized(offer.badge)}</span>
                ${offer.id === recommendedOfferId ? `<span class="pill defense-payment-offer-badge" style="color:${offer.accent};border-color:${offer.accent}55;">${getLocalized({ zh: '当前推荐', en: 'Recommended' })}</span>` : ''}
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

        if (ui.paymentTitle) ui.paymentTitle.textContent = getLocalized({ zh: '防线充值中心', en: 'Defense Top-Up Center' });
        if (ui.paymentDesc) ui.paymentDesc.textContent = getLocalized({ zh: '创建链上订单后，使用 OKX Wallet 支付精确金额，再粘贴 txid 校验并发放防线奖励。', en: 'Create an on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant Defense rewards.' });
        if (ui.paymentOrderLabel) ui.paymentOrderLabel.textContent = getLocalized({ zh: '订单号', en: 'Order ID' });
        if (ui.paymentExactLabel) ui.paymentExactLabel.textContent = getLocalized({ zh: '精确金额', en: 'Exact Amount' });
        if (ui.paymentExpiryLabel) ui.paymentExpiryLabel.textContent = getLocalized({ zh: '剩余时间', en: 'Expires In' });
        if (ui.paymentAddressLabel) ui.paymentAddressLabel.textContent = getLocalized({ zh: '收款地址', en: 'Receiving Address' });
        if (ui.paymentTxidLabel) ui.paymentTxidLabel.textContent = getLocalized({ zh: '粘贴 OKX Wallet 的 txid', en: 'Paste OKX Wallet txid' });
        if (ui.paymentTxidInput) ui.paymentTxidInput.placeholder = getLocalized({ zh: '请输入或粘贴 OKX Wallet 的链上 txid', en: 'Paste the on-chain txid from OKX Wallet' });
        if (ui.paymentTxidHint) ui.paymentTxidHint.textContent = getLocalized({ zh: '只有金额、地址和有效时间窗口全部匹配的订单才能通过校验。', en: 'Only payments that match the exact amount, recipient address, and valid time window can pass verification.' });
        if (ui.paymentCopyAddressBtn) ui.paymentCopyAddressBtn.textContent = getLocalized({ zh: '复制地址', en: 'Copy Address' });
        if (ui.paymentCopyAmountBtn) ui.paymentCopyAmountBtn.textContent = getLocalized({ zh: '复制精确金额', en: 'Copy Exact Amount' });
        if (ui.paymentVerifyBtn) ui.paymentVerifyBtn.textContent = getLocalized({ zh: '校验 TXID', en: 'Verify TXID' });
        if (ui.paymentAmount) ui.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `$${offer.price.toFixed(2)} USDT`;
        if (ui.paymentMeta) ui.paymentMeta.textContent = `${getLocalized({ zh: 'OKX 钱包', en: 'OKX Wallet' })} · ${order?.network || 'TRON (TRC20)'} · ${getLocalized(offer.name)}`;
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
            ui.paymentStatus.textContent = paymentVerificationNotice || getLocalized({ zh: '支付已校验通过，奖励已发放。', en: 'Payment verified and rewards granted.' });
            ui.paymentStatus.classList.add('is-success');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        if (orderExpired) {
            ui.paymentStatus.textContent = getLocalized({ zh: '当前订单已过期，请重新选择礼包创建新订单。', en: 'This order has expired. Select the pack again to create a fresh order.' });
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
            ui.paymentStatus.textContent = getLocalized({ zh: 'TXID 格式不正确，请粘贴 64 位链上 txid。', en: 'TXID format looks invalid. Please paste the 64-character on-chain txid.' });
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        ui.paymentStatus.textContent = paymentVerificationNotice || getLocalized({ zh: '先创建订单，再去 OKX Wallet 完成支付，最后把 txid 粘贴到这里校验。', en: 'Create an order, complete the payment in OKX Wallet, then paste the txid here.' });
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
                    paymentVerificationError = error?.message || getLocalized({ zh: '订单创建失败，请稍后重试。', en: 'Failed to create order. Please try again.' });
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
        else syncRecommendedPaymentOfferSelection({ force: true });
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
            ? getLocalized({ zh: '收款地址已复制。', en: 'Receiving address copied.' })
            : getLocalized({ zh: '自动复制不可用，请手动复制地址。', en: 'Automatic copy is unavailable. Please copy the address manually.' });
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
            ? getLocalized({ zh: '精确金额已复制。', en: 'Exact amount copied.' })
            : getLocalized({ zh: '自动复制不可用，请手动复制精确金额。', en: 'Automatic copy is unavailable. Please copy the exact amount manually.' });
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
            paymentVerificationError = getLocalized({ zh: 'TXID 格式不正确，请检查后重新输入。', en: 'Invalid TXID format. Please check and try again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if ((state.save.payment.verifiedTxids || []).includes(txid)) {
            paymentVerificationError = getLocalized({ zh: '该 txid 已经使用过，不能重复发奖。', en: 'This TXID has already been used and cannot grant rewards again.' });
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (!currentPaymentOrder || isPaymentOrderExpired(currentPaymentOrder)) {
            paymentVerificationError = getLocalized({ zh: '当前订单已过期，请重新创建订单。', en: 'The current order has expired. Please create a new one.' });
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
                paymentVerificationNotice = getLocalized({ zh: '该订单奖励已发放，无需重复领取。', en: 'Rewards for this order have already been granted.' });
                refreshPaymentVerificationState();
                saveProgress();
                return;
            }

            grantPaymentRewards({ orderId, txid, offerId: resolvedOfferId });

            paymentVerificationState = 'verified';
            try {
                await claimBackendPayment(orderId, txid);
                delete state.save.payment.pendingClaims[orderId];
                paymentVerificationNotice = getLocalized({ zh: '链上校验成功，奖励已发放。', en: 'On-chain verification succeeded and rewards were granted.' });
                saveProgress();
            } catch (claimError) {
                paymentVerificationNotice = getLocalized({ zh: '链上校验成功，奖励已到账；后台发奖记录将在稍后自动同步。', en: 'On-chain verification succeeded and rewards were granted. Backend sync will retry automatically.' });
                console.warn('Defense payment claim sync queued.', { orderId, claimError });
            }
            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || getLocalized({ zh: '支付校验失败，请稍后重试。', en: 'Payment verification failed. Please try again.' });
            refreshPaymentVerificationState();
        }
    }

    function drawBattlefield() {
        const ctx = ui.ctx;
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const shakeRatio = state.battle.screenShakeTimer > 0
            ? Math.max(0.18, Math.min(1, state.battle.screenShakeTimer / 0.4))
            : 0;
        const shakeX = shakeRatio > 0 ? Math.sin(performance.now() * 0.05) * state.battle.screenShakeStrength * shakeRatio : 0;
        const shakeY = shakeRatio > 0 ? Math.cos(performance.now() * 0.065) * state.battle.screenShakeStrength * 0.7 * shakeRatio : 0;
        ctx.save();
        ctx.translate(shakeX, shakeY);
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#091224');
        gradient.addColorStop(0.45, '#0a1629');
        gradient.addColorStop(1, '#040811');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawLanes(ctx);
        drawBossPressure(ctx);
        drawActiveSkillField(ctx);
        drawWaveClearCelebration(ctx);
        drawSpawnBursts(ctx);
        drawCore(ctx);
        drawTowers(ctx);
        drawEnemies(ctx);
        drawTowerShots(ctx);
        drawSkillBursts(ctx);
        drawHitBursts(ctx);
        drawDefeatBursts(ctx);
        drawCanvasTopInfo(ctx);
        ctx.restore();
        drawCoreImpactOverlay(ctx);
        drawBattleBanner(ctx);
        drawEdgeFlash(ctx);
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

    function drawSpawnBursts(ctx) {
        state.battle.spawnBursts.forEach((burst) => {
            const progress = Math.max(0, Math.min(1, burst.timer / burst.duration));
            const alpha = progress * 0.5;
            const radius = burst.radius * (1.2 - progress * 0.45);
            const tone = getBattleToneColor(burst.tone);
            ctx.save();
            ctx.strokeStyle = `rgba(${tone}, ${alpha})`;
            ctx.lineWidth = 4 + progress * 8;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `rgba(${tone}, ${alpha * 0.18})`;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius * 0.72, 0, Math.PI * 2);
            ctx.fill();
            if (burst.label) {
                ctx.fillStyle = `rgba(3,8,18,${Math.min(0.84, 0.5 + alpha * 0.8)})`;
                fillRoundRect(ctx, burst.x - 52, burst.y - 18, 104, 30, 999);
                ctx.fill();
                ctx.strokeStyle = `rgba(${tone}, ${Math.min(0.8, alpha + 0.18)})`;
                ctx.lineWidth = 1.5;
                fillRoundRect(ctx, burst.x - 52, burst.y - 18, 104, 30, 999);
                ctx.stroke();
                ctx.fillStyle = `rgba(${tone}, ${Math.min(1, alpha + 0.24)})`;
                ctx.font = '800 16px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(burst.label, burst.x, burst.y + 3);
            }
            if (burst.subLabel) {
                ctx.fillStyle = `rgba(238,245,255,${Math.min(0.92, alpha + 0.24)})`;
                ctx.font = '600 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(burst.subLabel, burst.x, burst.y + 28);
            }
            ctx.restore();
        });
    }

    function drawBossPressure(ctx) {
        const boss = state.battle.enemies.find((enemy) => enemy.boss);
        if (!boss) return;
        const laneWidth = 150;
        const left = boss.x - laneWidth / 2;
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);
        const alpha = 0.12 + pulse * 0.08;
        const gradient = ctx.createLinearGradient(boss.x, 0, boss.x, CANVAS_HEIGHT);
        gradient.addColorStop(0, `rgba(255,107,137,${alpha + 0.04})`);
        gradient.addColorStop(0.34, `rgba(255,107,137,${alpha * 0.46})`);
        gradient.addColorStop(1, 'rgba(255,107,137,0)');
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(left, 0, laneWidth, CANVAS_HEIGHT);
        ctx.strokeStyle = `rgba(255,107,137,${0.18 + pulse * 0.12})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 14]);
        ctx.beginPath();
        ctx.moveTo(boss.x, Math.max(40, boss.y - 160));
        ctx.lineTo(boss.x, SAFE_CORE_Y - 18);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let index = 0; index < 3; index += 1) {
            const y = 120 + ((performance.now() * 0.18 + index * 150) % Math.max(220, SAFE_CORE_Y - 180));
            ctx.strokeStyle = `rgba(255,107,137,${0.1 + pulse * 0.08})`;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(boss.x - 44, y);
            ctx.lineTo(boss.x, y + 16);
            ctx.lineTo(boss.x + 44, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawActiveSkillField(ctx) {
        if (state.battle.skillEffect !== 'overclock' || state.battle.skillEffectTimer <= 0) return;
        const ratio = Math.max(0, Math.min(1, state.battle.skillEffectTimer / 8));
        const pulse = 0.45 + 0.55 * Math.sin(performance.now() * 0.01);
        ctx.save();
        LANE_POSITIONS.forEach((laneX) => {
            const width = 84;
            const gradient = ctx.createLinearGradient(laneX, 100, laneX, CANVAS_HEIGHT);
            gradient.addColorStop(0, `rgba(255,154,90,${0.12 + ratio * 0.06 + pulse * 0.04})`);
            gradient.addColorStop(0.35, `rgba(255,154,90,${0.04 + pulse * 0.02})`);
            gradient.addColorStop(1, 'rgba(255,154,90,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(laneX - width / 2, 120, width, CANVAS_HEIGHT - 120);
        });
        ctx.restore();
    }

    function drawTowerShots(ctx) {
        state.battle.shotTraces.forEach((trace) => {
            const progress = 1 - Math.max(0, Math.min(1, trace.timer / trace.duration));
            const alpha = (1 - progress) * (trace.towerId === 'rail' ? 0.96 : 0.78);
            const midX = (trace.fromX + trace.toX) / 2;
            const midY = (trace.fromY + trace.toY) / 2;
            ctx.save();
            ctx.shadowColor = `rgba(${trace.tone}, ${alpha * 0.8})`;
            ctx.shadowBlur = trace.towerId === 'rail' ? 26 : 16;
            ctx.strokeStyle = `rgba(${trace.tone}, ${alpha})`;
            ctx.lineWidth = trace.width;
            if (trace.towerId === 'rocket') {
                const controlX = midX + (trace.fromX <= CANVAS_WIDTH / 2 ? 26 : -26);
                const controlY = midY - 36;
                ctx.beginPath();
                ctx.moveTo(trace.fromX, trace.fromY - 10);
                ctx.quadraticCurveTo(controlX, controlY, trace.toX, trace.toY);
                ctx.stroke();
            } else if (trace.towerId === 'chain' || trace.chained) {
                const zigzagCount = 4;
                ctx.beginPath();
                ctx.moveTo(trace.fromX, trace.fromY);
                for (let index = 1; index < zigzagCount; index += 1) {
                    const ratio = index / zigzagCount;
                    const offset = index % 2 === 0 ? -14 : 14;
                    ctx.lineTo(
                        trace.fromX + (trace.toX - trace.fromX) * ratio + offset,
                        trace.fromY + (trace.toY - trace.fromY) * ratio
                    );
                }
                ctx.lineTo(trace.toX, trace.toY);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(trace.fromX, trace.fromY);
                ctx.lineTo(trace.toX, trace.toY);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(trace.toX, trace.toY, Math.max(3, trace.width * 0.7), 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(${trace.tone}, ${alpha * 0.22})`;
            ctx.beginPath();
            ctx.arc(trace.toX, trace.toY, trace.width * 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function drawSkillBursts(ctx) {
        state.battle.skillBursts.forEach((burst) => {
            const progress = 1 - Math.max(0, Math.min(1, burst.timer / burst.duration));
            const alpha = (1 - progress) * 0.72;
            ctx.save();
            if (burst.skillId === 'emp') {
                const scanY = 140 + progress * (SAFE_CORE_Y - 160);
                LANE_POSITIONS.forEach((laneX) => {
                    ctx.fillStyle = `rgba(114,244,255,${alpha * 0.12})`;
                    ctx.fillRect(laneX - 42, 100, 84, SAFE_CORE_Y - 120);
                });
                ctx.strokeStyle = `rgba(114,244,255,${alpha})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(60, scanY);
                ctx.lineTo(CANVAS_WIDTH - 60, scanY);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.7})`;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(60, scanY - 14);
                ctx.lineTo(CANVAS_WIDTH - 60, scanY - 14);
                ctx.moveTo(60, scanY + 14);
                ctx.lineTo(CANVAS_WIDTH - 60, scanY + 14);
                ctx.stroke();
            } else if (burst.skillId === 'shield') {
                const radius = 110 + progress * 80;
                ctx.strokeStyle = `rgba(255,210,107,${alpha})`;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(CANVAS_WIDTH / 2, SAFE_CORE_Y + 40, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = `rgba(255,210,107,${alpha * 0.16})`;
                ctx.beginPath();
                ctx.arc(CANVAS_WIDTH / 2, SAFE_CORE_Y + 40, radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            } else if (burst.skillId === 'overclock') {
                LANE_POSITIONS.forEach((laneX, index) => {
                    const rise = 24 + progress * 48 + index * 6;
                    ctx.strokeStyle = `rgba(255,154,90,${alpha})`;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(laneX, 930);
                    ctx.lineTo(laneX, 930 - rise);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(laneX, 842, 40 + progress * 18, 0, Math.PI * 2);
                    ctx.stroke();
                });
            }
            ctx.restore();
        });
    }

    function drawHitBursts(ctx) {
        state.battle.hitBursts.forEach((burst) => {
            const progress = 1 - Math.max(0, Math.min(1, burst.timer / burst.duration));
            const alpha = 0.56 * (1 - progress);
            const tone = getBattleToneColor(burst.tone);
            const radius = 10 * burst.scale + progress * 16 * burst.scale;
            ctx.save();
            ctx.fillStyle = `rgba(${tone}, ${alpha * 0.16})`;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius + 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(${tone}, ${alpha})`;
            ctx.lineWidth = 2.8 + (1 - progress) * 1.4;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.72})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(burst.x - radius * 0.5, burst.y - radius * 0.5);
            ctx.lineTo(burst.x + radius * 0.5, burst.y + radius * 0.5);
            ctx.moveTo(burst.x + radius * 0.5, burst.y - radius * 0.5);
            ctx.lineTo(burst.x - radius * 0.5, burst.y + radius * 0.5);
            ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.48})`;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, 4 + progress * 5 * burst.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function drawDefeatBursts(ctx) {
        state.battle.defeatBursts.forEach((burst) => {
            const progress = 1 - Math.max(0, Math.min(1, burst.timer / burst.duration));
            const tone = getBattleToneColor(burst.tone);
            const alpha = (1 - progress) * (burst.boss ? 0.82 : 0.58);
            const radius = burst.radius + progress * (burst.boss ? 48 : 30);
            ctx.save();
            ctx.fillStyle = `rgba(${tone}, ${alpha * (burst.boss ? 0.2 : 0.12)})`;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(${tone}, ${alpha})`;
            ctx.lineWidth = burst.boss ? 5 : (burst.elite ? 3.5 : 2.5);
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.62})`;
            for (let index = 0; index < (burst.boss ? 8 : 5); index += 1) {
                const angle = (Math.PI * 2 * index) / (burst.boss ? 8 : 5) + progress * 0.5;
                const inner = burst.radius * 0.4;
                const outer = radius + 14;
                ctx.beginPath();
                ctx.moveTo(burst.x + Math.cos(angle) * inner, burst.y + Math.sin(angle) * inner);
                ctx.lineTo(burst.x + Math.cos(angle) * outer, burst.y + Math.sin(angle) * outer);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    function drawCore(ctx) {
        if (state.battle.coreImpactTimer > 0) {
            const alpha = Math.min(0.32, state.battle.coreImpactSeverity * 0.12 + state.battle.coreImpactTimer * 0.08);
            ctx.fillStyle = `rgba(255,107,137,${alpha})`;
            ctx.fillRect(80, SAFE_CORE_Y - 10, CANVAS_WIDTH - 160, 96);
        }
        if (state.battle.bossAlertTimer > 0) {
            const pulse = 0.18 + (state.battle.bossAlertTimer % 0.6) * 0.18;
            ctx.fillStyle = `rgba(255,107,137,${pulse})`;
            ctx.fillRect(76, SAFE_CORE_Y - 8, CANVAS_WIDTH - 152, 96);
        }
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
            if (state.battle.skillEffect === 'overclock' && state.battle.skillEffectTimer > 0) {
                const ratio = Math.max(0, Math.min(1, state.battle.skillEffectTimer / 8));
                const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.013 + index * 0.8);
                ctx.strokeStyle = `rgba(255,154,90,${0.22 + ratio * 0.16 + pulse * 0.08})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, 38 + pulse * 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255,232,194,${0.2 + pulse * 0.12})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y - 54);
                ctx.lineTo(x, y - 24);
                ctx.stroke();
            }
            if (state.battle.skillReadyPulse > 0 && state.battle.running) {
                const pulse = state.battle.skillReadyPulse;
                ctx.strokeStyle = `rgba(114,244,255,${Math.min(0.45, pulse * 0.22)})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(x, y, 42 + (1.8 - Math.min(1.8, pulse)) * 12, 0, Math.PI * 2);
                ctx.stroke();
            }
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
            const spawnScale = 1 + (Number(enemy.spawnFx) || 0) * 0.45;
            const spawnAlpha = Math.max(0.48, 1 - (Number(enemy.spawnFx) || 0) * 0.42);
            const radius = enemy.radius * spawnScale;
            ctx.save();
            ctx.globalAlpha = spawnAlpha;
            ctx.fillStyle = colors[enemy.type] || '#ffffff';
            ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2); ctx.fill();
            if (enemy.boss) {
                const pulse = 0.45 + 0.55 * Math.sin(performance.now() * 0.015);
                ctx.strokeStyle = `rgba(255,107,137,${0.32 + pulse * 0.18})`;
                ctx.lineWidth = 5;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 16 + pulse * 8, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = `rgba(255,107,137,${0.08 + pulse * 0.05})`;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 10, 0, Math.PI * 2); ctx.fill();
            }
            if (enemy.elite) {
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.lineWidth = enemy.boss ? 5 : 3;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 8, 0, Math.PI * 2); ctx.stroke();
            }
            if (enemy.stun > 0 || enemy.slow > 0) {
                ctx.strokeStyle = enemy.stun > 0 ? 'rgba(255,210,107,0.7)' : 'rgba(114,244,255,0.72)';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 14, 0, Math.PI * 2); ctx.stroke();
            }
            if (enemy.hitFlash > 0) {
                ctx.fillStyle = `rgba(255,255,255,${Math.min(0.42, enemy.hitFlash)})`;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 4, 0, Math.PI * 2); ctx.fill();
            }
            if (enemy.boss && state.battle.bossAlertTimer > 0) {
                ctx.strokeStyle = `rgba(255,107,137,${0.26 + state.battle.bossAlertTimer * 0.08})`;
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 18, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
            drawHealthBar(ctx, enemy, radius);
        });
    }

    function drawHealthBar(ctx, enemy, radiusOverride = enemy.radius) {
        const width = radiusOverride * 2;
        const x = enemy.x - width / 2;
        const y = enemy.y - radiusOverride - 16;
        ctx.fillStyle = 'rgba(0,0,0,0.36)';
        ctx.fillRect(x, y, width, 6);
        ctx.fillStyle = enemy.boss ? '#ff6b89' : '#72f4ff';
        ctx.fillRect(x, y, width * Math.max(0, enemy.hp / enemy.maxHp), 6);
    }

    function drawCanvasTopInfo(ctx) {
        const skillReady = state.battle.skillCooldown <= 0;
        const displayWaveText = state.battle.running || state.battle.finished || state.battle.awaitingUpgrade
            ? t('waveText').replace('{wave}', String(Math.max(1, state.battle.currentWave || 1)))
            : `0 / ${TOTAL_WAVES}`;
        if (skillReady && state.battle.running) {
            ctx.fillStyle = 'rgba(114,244,255,0.12)';
            fillRoundRect(ctx, 14, 10, 260, 78, 18);
            ctx.fill();
            ctx.strokeStyle = 'rgba(114,244,255,0.24)';
            ctx.lineWidth = 1.5;
            fillRoundRect(ctx, 14, 10, 260, 78, 18);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        ctx.font = '600 18px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${getCurrentChapter().id} · ${displayWaveText}`, 20, 34);
        ctx.font = '500 14px Inter';
        ctx.fillStyle = 'rgba(145,162,192,0.96)';
        ctx.fillText(`${t('threatLabel')}: ${t(getThreatKey())}`, 20, 56);
        ctx.fillStyle = skillReady ? 'rgba(114,244,255,0.98)' : 'rgba(145,162,192,0.96)';
        ctx.fillText(`${t(SKILLS[state.save.selectedSkill].nameKey)} · ${state.battle.skillCooldown > 0 ? state.battle.skillCooldown.toFixed(1) + 's' : getLocalized({ zh: '可释放', en: 'READY' })}`, 20, 78);
    }

    function drawCoreImpactOverlay(ctx) {
        if (state.battle.coreImpactTimer <= 0) return;
        const alpha = Math.min(0.18, state.battle.coreImpactSeverity * 0.08 + state.battle.coreImpactTimer * 0.04);
        const gradient = ctx.createLinearGradient(0, SAFE_CORE_Y - 120, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, `rgba(255,107,137,0)`);
        gradient.addColorStop(0.45, `rgba(255,107,137,${alpha * 0.75})`);
        gradient.addColorStop(1, `rgba(255,107,137,${alpha})`);
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, SAFE_CORE_Y - 120, CANVAS_WIDTH, CANVAS_HEIGHT - SAFE_CORE_Y + 120);
        ctx.restore();
    }

    function drawWaveClearCelebration(ctx) {
        if (state.battle.waveClearTimer <= 0) return;
        const ratio = Math.max(0, Math.min(1, state.battle.waveClearTimer / 1.2));
        const alpha = Math.min(0.34, ratio * 0.28);
        ctx.save();
        LANE_POSITIONS.forEach((laneX, index) => {
            const width = 96 + index * 10;
            const gradient = ctx.createLinearGradient(laneX, 100, laneX, CANVAS_HEIGHT);
            gradient.addColorStop(0, `rgba(114,244,255,${alpha})`);
            gradient.addColorStop(0.42, 'rgba(114,244,255,0.02)');
            gradient.addColorStop(1, 'rgba(114,244,255,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(laneX - width / 2, 0, width, CANVAS_HEIGHT);
        });
        ctx.strokeStyle = `rgba(114,244,255,${alpha + 0.12})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(62, 160 + (1 - ratio) * 24);
        ctx.lineTo(CANVAS_WIDTH - 62, 160 + (1 - ratio) * 24);
        ctx.stroke();
        ctx.fillStyle = `rgba(114,244,255,${0.22 + alpha})`;
        ctx.font = '800 26px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(getLocalized({ zh: '波次清空', en: 'WAVE CLEAR' }), CANVAS_WIDTH / 2, 208 + (1 - ratio) * 12);
        ctx.fillStyle = `rgba(238,245,255,${0.28 + alpha})`;
        ctx.font = '600 14px Inter';
        ctx.fillText(
            getLocalized({ zh: '强化已就绪，准备下一波', en: 'Upgrade ready. Prepare the next wave.' }),
            CANVAS_WIDTH / 2,
            232 + (1 - ratio) * 12
        );
        ctx.restore();
    }

    function drawBattleBanner(ctx) {
        if (state.battle.bannerTimer <= 0 && state.battle.bossAlertTimer <= 0) return;
        const activeTimer = state.battle.bannerTimer > 0 ? state.battle.bannerTimer : state.battle.bossAlertTimer;
        const activeDuration = state.battle.bannerTimer > 0 ? state.battle.bannerDuration : 3.2;
        const progress = Math.max(0, Math.min(1, activeTimer / Math.max(0.001, activeDuration)));
        const alpha = Math.min(1, 0.28 + progress * 0.62);
        const tone = state.battle.bannerTimer > 0 ? state.battle.bannerTone : 'boss';
        const title = state.battle.bannerTimer > 0 ? state.battle.bannerText : t('bossIncomingText');
        const subtitle = tone === 'boss'
            ? getLocalized({ zh: '优先保住核心护盾，再集中火力处理 Boss', en: 'Protect the core shield first, then focus the boss.' })
            : getLocalized({ zh: '观察哪一路先吃压，再决定何时交技能', en: 'Read which lane breaks first, then decide when to cast.' });
        const toneColor = getBattleToneColor(tone);
        const width = tone === 'boss' ? 420 : 360;
        const x = (CANVAS_WIDTH - width) / 2;
        const y = tone === 'boss' ? 112 : 132;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgba(3,8,18,${tone === 'boss' ? 0.88 : 0.76})`;
        fillRoundRect(ctx, x, y, width, tone === 'boss' ? 100 : 84, 22);
        ctx.fill();
        ctx.strokeStyle = `rgba(${toneColor}, ${Math.min(0.95, alpha)})`;
        ctx.lineWidth = tone === 'boss' ? 3 : 2;
        fillRoundRect(ctx, x, y, width, tone === 'boss' ? 100 : 84, 22);
        ctx.stroke();
        ctx.fillStyle = `rgba(${toneColor}, ${Math.min(1, alpha)})`;
        ctx.font = tone === 'boss' ? '800 28px Inter' : '800 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(title, CANVAS_WIDTH / 2, y + 36);
        ctx.fillStyle = 'rgba(238,245,255,0.9)';
        ctx.font = '600 14px Inter';
        ctx.fillText(subtitle, CANVAS_WIDTH / 2, y + 62);
        if (tone === 'boss') {
            ctx.fillStyle = 'rgba(255,107,137,0.18)';
            fillRoundRect(ctx, x + 16, y + 72, width - 32, 14, 999);
            ctx.fill();
            ctx.fillStyle = `rgba(${toneColor}, 0.72)`;
            fillRoundRect(ctx, x + 16, y + 72, (width - 32) * Math.max(0.18, progress), 14, 999);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawEdgeFlash(ctx) {
        const activeTimer = Math.max(state.battle.edgeFlashTimer, state.battle.bossAlertTimer * 0.6);
        if (activeTimer <= 0) return;
        const duration = Math.max(state.battle.edgeFlashDuration || 0.001, 0.001);
        const ratio = state.battle.bossAlertTimer > 0
            ? Math.max(0.2, Math.min(1, state.battle.bossAlertTimer / 3.2))
            : Math.max(0, Math.min(1, activeTimer / duration));
        const tone = state.battle.bossAlertTimer > 0 ? 'boss' : state.battle.edgeFlashTone;
        const toneColor = getBattleToneColor(tone);
        ctx.save();
        ctx.strokeStyle = `rgba(${toneColor}, ${0.18 + ratio * 0.34})`;
        ctx.lineWidth = 10 + ratio * 16;
        ctx.shadowColor = `rgba(${toneColor}, ${0.22 + ratio * 0.28})`;
        ctx.shadowBlur = 28;
        ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
        ctx.restore();
    }

    function setupDebugBattleScene() {
        state.activeTab = 'defend';
        document.body.setAttribute('data-defense-tab', 'defend');
        hideOverlay(ui.startOverlay);
        hideOverlay(ui.upgradeOverlay);
        hideOverlay(ui.pauseOverlay);
        hideOverlay(ui.resultOverlay);
        state.save = {
            ...state.save,
            chapterIndex: 0,
            bestChapterIndex: Math.max(state.save.bestChapterIndex, 0),
            selectedSkill: 'emp',
            laneLoadout: ['pulse', 'laser', 'harvest'],
            towerLevels: { ...state.save.towerLevels, pulse: 4, laser: 4, harvest: 3, frost: 2, rocket: 2, chain: 1, rail: 1 },
            researches: { ...state.save.researches, attack: 2, cadence: 2, fortify: 1, salvage: 1, relay: 2 }
        };
        state.battle = createEmptyBattle(state.save);
        state.battle.running = true;
        state.battle.currentWave = 3;
        state.battle.coreHp = getCoreMaxHp();
        state.battle.shield = getCoreShieldCap();
        state.battle.lastFrame = performance.now();
    }

    function addDebugEnemy(type, lane, y) {
        const chapter = getCurrentChapter();
        const stats = getEnemyStats(type, chapter, type === 'boss' ? TOTAL_WAVES : Math.max(2, state.battle.currentWave || 2));
        state.battle.enemies.push({
            id: state.battle.nextEnemyId++,
            type,
            lane,
            x: LANE_POSITIONS[lane],
            y,
            hp: stats.hp,
            maxHp: stats.hp,
            speed: stats.speed,
            damage: stats.damage,
            rewardGold: stats.rewardGold,
            rewardCore: stats.rewardCore,
            radius: stats.radius,
            stun: 0,
            slow: 0,
            hitFlash: 0,
            hitFxCooldown: 0,
            spawnFx: 0.4,
            split: stats.split,
            elite: stats.elite,
            boss: stats.boss
        });
    }

    function registerDebugApi() {
        if (!DEFENSE_DEBUG_ENABLED) return;
        window.__DEFENSE_DEBUG__ = {
            startRun() {
                startBattle(true);
                renderAll();
            },
            pickFirstUpgrade() {
                if (!state.battle.awaitingUpgrade || !state.battle.pendingChoices?.length) return false;
                applyUpgradeChoice(state.battle.pendingChoices[0].id);
                return true;
            },
            liveSnapshot() {
                return {
                    running: state.battle.running,
                    paused: state.battle.paused,
                    finished: state.battle.finished,
                    awaitingUpgrade: state.battle.awaitingUpgrade,
                    wave: state.battle.currentWave,
                    currentWaveElapsed: Number(state.battle.currentWaveElapsed?.toFixed?.(2) || 0),
                    enemies: state.battle.enemies.map((enemy) => `${enemy.type}:${enemy.lane}:${Math.round(enemy.y)}:${Math.round(enemy.hp)}`),
                    spawnQueue: state.battle.spawnQueue.slice(0, 5).map((spawn) => `${spawn.type}:${spawn.lane}:${Number(spawn.at.toFixed(2))}`),
                    pendingChoices: (state.battle.pendingChoices || []).map((choice) => choice.id),
                    waveText: ui.waveValue?.textContent || '',
                    note: ui.battleNote?.textContent || ''
                };
            },
            impact() {
                setupDebugBattleScene();
                state.battle.currentWave = 3;
                addDebugEnemy('elite', 1, 322);
                const enemy = state.battle.enemies[0];
                enemy.hitFlash = 0.3;
                pushHitBurst(enemy.x, enemy.y, 'overclock', 1);
                renderAll();
            },
            coreHit() {
                setupDebugBattleScene();
                state.battle.currentWave = 5;
                state.battle.shield = 12;
                state.battle.coreHp = Math.max(12, getCoreMaxHp() - 26);
                addDebugEnemy('boss', 1, SAFE_CORE_Y - 72);
                triggerCoreImpact(22, 10);
                renderAll();
            },
            waveClear() {
                setupDebugBattleScene();
                state.battle.currentWave = 2;
                triggerWaveClearCelebration();
                renderAll();
            },
            wave(waveNumber = 3) {
                setupDebugBattleScene();
                state.battle.currentWave = Math.max(1, Math.min(TOTAL_WAVES, Number(waveNumber) || 3));
                addDebugEnemy('fast', 0, 248);
                addDebugEnemy('shield', 1, 208);
                addDebugEnemy('grunt', 2, 228);
                state.battle.spawnBursts.push({
                    x: LANE_POSITIONS[1],
                    y: 96,
                    radius: 88,
                    timer: 1.1,
                    duration: 1.1,
                    tone: 'wave',
                    label: getLocalized({ zh: '敌袭', en: 'WAVE' }),
                    subLabel: getLocalized({ zh: '中路接敌', en: 'MID CONTACT' })
                });
                triggerBattleBanner(t('waveIncomingText').replace('{wave}', String(state.battle.currentWave)), 'wave', 1.8);
                triggerEdgeFlash('wave', 0.8);
                pushBattleAlert(getLocalized({ zh: `第 ${state.battle.currentWave} 波来袭，先看中路接敌`, en: `Wave ${state.battle.currentWave} incoming. Mid lane contacts first.` }), 'wave', 2.2);
                renderAll();
            },
            skillReady() {
                setupDebugBattleScene();
                state.battle.currentWave = 4;
                addDebugEnemy('elite', 1, 322);
                addDebugEnemy('fast', 2, 284);
                state.battle.skillCooldown = 0;
                state.battle.skillReadyPulse = 1.8;
                pushBattleAlert(getLocalized({ zh: '主动技能已就绪，现在可以处理高压路', en: 'Active skill is ready. You can answer the pressured lane now.' }), 'skill', 2.2);
                triggerBattleBanner(t('skillReadyBanner').replace('{skill}', t(SKILLS[state.save.selectedSkill].nameKey)), 'skill', 1.2);
                renderAll();
            },
            skillCast(skillId = 'emp') {
                setupDebugBattleScene();
                const nextSkillId = SKILLS[skillId] ? skillId : 'emp';
                state.save.selectedSkill = nextSkillId;
                state.battle.currentWave = 4;
                addDebugEnemy('elite', 1, 320);
                addDebugEnemy('shield', 2, 278);
                addDebugEnemy('fast', 0, 264);
                if (nextSkillId === 'shield') {
                    state.battle.shield = 0;
                    state.battle.coreHp = Math.max(24, getCoreMaxHp() - 34);
                }
                state.battle.skillCooldown = 0;
                useSkill();
                renderAll();
            },
            towerFire(towerId = 'rail') {
                setupDebugBattleScene();
                const nextTowerId = TOWERS[towerId] ? towerId : 'rail';
                state.save.laneLoadout = ['pulse', nextTowerId, 'harvest'];
                state.battle.currentWave = 5;
                addDebugEnemy('elite', 1, 304);
                addDebugEnemy('shield', 1, 244);
                addDebugEnemy('grunt', 1, 198);
                fireLaneTower(nextTowerId, 1, state.battle.enemies.filter((enemy) => enemy.lane === 1).sort((a, b) => b.y - a.y));
                state.battle.shotTraces = state.battle.shotTraces.map((trace) => ({
                    ...trace,
                    timer: Math.max(trace.timer, 0.42),
                    duration: Math.max(trace.duration, 0.42),
                    width: trace.width * 1.18
                }));
                renderAll();
            },
            boss() {
                setupDebugBattleScene();
                state.battle.currentWave = TOTAL_WAVES;
                addDebugEnemy('boss', 1, 246);
                addDebugEnemy('elite', 0, 284);
                addDebugEnemy('elite', 2, 284);
                state.battle.bossAlertTimer = 3.2;
                state.battle.skillReadyPulse = 1.5;
                state.battle.spawnBursts.push({
                    x: LANE_POSITIONS[1],
                    y: 96,
                    radius: 112,
                    timer: 1.5,
                    duration: 1.5,
                    tone: 'boss',
                    label: 'BOSS',
                    subLabel: getLocalized({ zh: '中路压境', en: 'CENTER PUSH' })
                });
                triggerBattleBanner(t('bossIncomingText'), 'boss', 2.3);
                triggerEdgeFlash('boss', 1.4);
                pushBattleAlert(getLocalized({ zh: 'Boss 已到场，先保核心护盾再集火', en: 'Boss is on the field. Stabilize the core shield, then focus fire.' }), 'boss', 2.5);
                renderAll();
            },
            snapshot() {
                return {
                    wave: state.battle.currentWave,
                    enemies: state.battle.enemies.map((enemy) => `${enemy.type}:${enemy.lane}:${Math.round(enemy.y)}`),
                    alerts: state.battle.alerts.map((alert) => `${alert.tone}:${alert.text}`)
                };
            }
        };
    }
})();
