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
            defendPanelTitle: '章节部署',
            defendPanelDesc: '选择章节、查看敌潮构成，并围绕三路炮台配置决定本局节奏。',
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
            shopPreviewOnly: '预留后续支付接入',
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
            toastSkillEmp: 'EMP 已释放，敌人被短暂压制',
            toastSkillOverclock: '炮台进入超频输出',
            toastSkillShield: '核心护盾已展开',
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
            trait: { zh: '当前版本最高章节，Boss 波极重，建议优先准备史诗轨炮塔。', en: 'Current final chapter with a brutal boss wave. Epic rail setups shine here.' },
            enemies: ['shield', 'split', 'elite', 'boss'],
            fragmentFocus: ['rail', 'chain', 'rocket']
        }
    ];

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
        { id: 'm8', title: { zh: '核心工程师', en: 'Core Engineer' }, desc: { zh: '将任意炮台升到 4 级。', en: 'Upgrade any tower to level 4.' }, target: 4, metric: (save) => getHighestTowerLevel(save), reward: { gold: 1600, fragments: { rail: 14, chain: 14 } } }
    ];

    const SEASON_NODES = [
        { id: 's1', xp: 90, reward: { gold: 300, cores: 8 } },
        { id: 's2', xp: 210, reward: { fragments: { pulse: 16, laser: 16 } } },
        { id: 's3', xp: 360, reward: { gold: 560, cores: 14 } },
        { id: 's4', xp: 540, reward: { fragments: { frost: 18, rocket: 18 } } },
        { id: 's5', xp: 760, reward: { gold: 820, cores: 22 } },
        { id: 's6', xp: 1020, reward: { fragments: { chain: 24 } } },
        { id: 's7', xp: 1320, reward: { gold: 1100, cores: 28 } },
        { id: 's8', xp: 1660, reward: { fragments: { rail: 28 }, cores: 36 } }
    ];

    const UPGRADE_CHOICES = [
        { id: 'damage', label: { zh: '全路火力 +18%', en: 'All lane damage +18%' }, hint: { zh: '火力增幅', en: 'Damage Boost' }, apply: (battle) => { battle.modifiers.damage *= 1.18; } },
        { id: 'speed', label: { zh: '全路攻速 +16%', en: 'All lane fire rate +16%' }, hint: { zh: '冷却加速', en: 'Cooldown Speed' }, apply: (battle) => { battle.modifiers.attackSpeed *= 1.16; } },
        { id: 'gold', label: { zh: '本局金币收益 +22%', en: 'Gold gain this run +22%' }, hint: { zh: '战利回收', en: 'Salvage Boost' }, apply: (battle) => { battle.modifiers.gold *= 1.22; } },
        { id: 'shield', label: { zh: '核心立即获得额外护盾', en: 'Gain instant shield' }, hint: { zh: '护盾加厚', en: 'Shield Boost' }, apply: (battle) => { battle.shield = Math.min(getCoreShieldCap() * 1.45, battle.shield + 70 + getResearchLevel('fortify') * 10); } },
        { id: 'freeze', label: { zh: '炮台命中附带 12% 冰缓', en: '12% slow chance on hit' }, hint: { zh: '冰缓扩散', en: 'Freeze Spread' }, apply: (battle) => { battle.modifiers.freezeChance += 0.12; } },
        { id: 'splash', label: { zh: '炮台追加 20% 溅射伤害', en: '20% splash damage added' }, hint: { zh: '爆裂链式', en: 'Splash Chain' }, apply: (battle) => { battle.modifiers.splashBonus += 0.2; } }
    ];

    const SHOP_ITEMS = [
        { id: 'daily', type: 'daily' },
        { id: 'goldCrate', type: 'gold', priceGold: 920 },
        { id: 'coreCrate', type: 'core', priceCore: 34 },
        { id: 'premium', type: 'premium' }
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
        { id: 'p5', xp: 1700, reward: { gold: 5600, cores: 72, fragments: { rail: 20 } } }
    ];

    const LANE_POSITIONS = [170, 360, 550];

    const state = {
        lang: getInitialLang(),
        soundEnabled: true,
        save: loadSave(),
        activeTab: 'defend',
        toastTimer: 0,
        renderQueued: false,
        battle: createEmptyBattle()
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

    function createEmptyBattle() {
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
            coreHp: getCoreMaxHp(),
            shield: 0,
            skillCooldown: 0,
            skillEffectTimer: 0,
            skillEffect: null,
            modifiers: {
                damage: 1,
                attackSpeed: 1,
                gold: 1,
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
        ui.langToggle.textContent = state.lang === 'zh' ? 'EN' : '中';
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
        ui.battleNote.textContent = state.battle.awaitingUpgrade
            ? t('battleNoteUpgrade')
            : state.battle.finished
                ? (state.battle.result?.win ? t('battleNoteResultWin') : t('battleNoteResultLose'))
                : state.battle.running
                    ? t('battleNoteWave')
                    : t('battleNoteIdle');
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
                    <div class="lane-meta">${tower ? `${t('laneStripLevel').replace('{level}', level)} · ${rarityLabel(tower.tier)}` : ''}</div>
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
        return 'shield';
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
            }
        };
        return getLocalized(map[chapter.id] || {
            zh: '围绕当前章节敌潮特性调整装配与技能，让三路压力尽量均衡。',
            en: 'Adjust your loadout and skill to the enemy mix so all three lanes stay balanced.'
        });
    }

    function renderDefendTab() {
        const current = getCurrentChapter();
        const focusPreview = getChapterFocusPreview(current);
        const recommendedSkill = t(SKILLS[getRecommendedSkillIdForChapter(current)].nameKey);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('defendPanelTitle'), t('defendPanelDesc'))}
            <div class="chapter-row">
                ${CHAPTERS.map((chapter, index) => `
                    <button class="chapter-btn ${index === state.save.chapterIndex ? 'active' : ''}" type="button" data-action="chapter" data-value="${index}" ${index > state.save.bestChapterIndex ? 'disabled' : ''}>
                        ${chapter.id}${index === state.save.chapterIndex ? ` · ${t('chapterBadgeCurrent')}` : ''}
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
                    <span class="mini-chip">${getLocalized({ zh: `碎片倾向 ${focusPreview}`, en: `Focus Drops ${focusPreview}` })}</span>
                    <span class="mini-chip">${getLocalized({ zh: `推荐技能 ${recommendedSkill}`, en: `Recommended Skill ${recommendedSkill}` })}</span>
                </div>
                <div class="card-actions" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="startChapter" data-value="${state.save.chapterIndex}">${t('defendNow')}</button>
                </div>
            </article>
            <article>
                <div class="card-top">
                    <div>
                        <div class="card-kicker">${getLocalized({ zh: '章节战术', en: 'Chapter Brief' })}</div>
                        <div class="card-title">${getLocalized({ zh: '推荐装配路线', en: 'Recommended Build Path' })}</div>
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
                            <div class="card-title">${t('chapterInfoBoss')}</div>
                        </div>
                        <div class="card-number">${t('statRuns')} ${formatCompact(state.save.stats.runs)}</div>
                    </div>
                    <div class="card-copy">${t('statKills')} ${formatCompact(state.save.stats.kills)} · ${t('statWins')} ${formatCompact(state.save.stats.wins)}</div>
                </article>
            </div>
        `;
    }

    function renderLoadoutTab() {
        const selectedLane = state.save.selectedLane;
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('loadoutPanelTitle'), t('loadoutPanelDesc'), `<div class="mini-chip">${t('laneSelect')} · ${getLaneName(selectedLane)}</div>`)}
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
                </div>
                <div class="progress-line"><i style="width:${(progress * 100).toFixed(2)}%;"></i></div>
                <div class="card-actions">
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
                        ${maxed ? t('researchMaxed') : `${t('upgradeNow')} · ${formatCompact(cost)}G`}
                    </button>
                </div>
            </article>
        `;
    }

    function renderMissionsTab() {
        const missionViews = MISSIONS.map((mission) => getMissionView(mission)).sort((a, b) => b.sort - a.sort);
        ui.panelContent.innerHTML = `
            ${renderPanelHead(t('missionsPanelTitle'), t('missionsPanelDesc'), `<div class="mini-chip">${state.lang === 'zh' ? '可领取奖励已置顶' : 'Claimables pinned first'}</div>`)}
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
            .sort((a, b) => Number(b.claimable) - Number(a.claimable) || Number(a.claimed) - Number(b.claimed) || a.index - b.index);
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
                    <div class="card-copy">${t('statRuns')} ${formatCompact(state.save.stats.runs)} · ${t('statWins')} ${formatCompact(state.save.stats.wins)}</div>
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
                    ? getLocalized({ zh: `赞助轨道已解锁 · 待领 ${sponsorReady}`, en: `Sponsor track unlocked · ${sponsorReady} ready` })
                    : getLocalized({ zh: '任意一笔校验成功的充值都会解锁赞助轨道', en: 'Any verified top-up unlocks the sponsor track' })
                }</div>`
            )}
            <div class="card-grid">
                ${renderTopupOverviewCard()}
                ${renderDailyCard()}
            </div>
            <div class="shop-grid">
                ${renderGoldShopCard()}
                ${renderCoreShopCard()}
                ${DEFENSE_PAYMENT_OFFERS.map((offer) => renderPaymentOfferCard(offer)).join('')}
            </div>
        `;
    }

    function renderDailyCard() {
        const ready = isDailySupplyReady();
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
                <div class="reward-row">${renderRewardChips({ gold: 360, cores: 10, fragments: { pulse: 10, laser: 10 } })}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="claimDaily" data-value="daily" ${ready ? '' : 'disabled'}>${ready ? t('shopClaim') : `${t('shopSoldOut')} · ${remaining}`}</button>
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
                    <div class="card-number">${state.lang === 'zh' ? '稀有箱' : 'Rare Box'}</div>
                </div>
                <div class="card-copy">${t('shopCoreDesc')}</div>
                <div class="reward-row">${renderRewardChips({ gold: 280, fragments: { chain: 12, rail: 8 } })}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="buyShop" data-value="coreCrate" ${state.save.cores >= 34 ? '' : 'disabled'}>${t('shopBuy')}</button>
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
                        <div class="card-title">${getLocalized({ zh: '防线充值中心', en: 'Defense Top-Up Center' })}</div>
                    </div>
                    <div class="card-number">${sponsorUnlocked ? getLocalized({ zh: '已开启', en: 'Unlocked' }) : getLocalized({ zh: '未开启', en: 'Locked' })}</div>
                </div>
                <div class="card-copy">${sponsorUnlocked
                    ? getLocalized({ zh: '链上校验成功后，充值奖励会直接到账，同时赛季页会开放赞助轨道额外节点。', en: 'Verified payments grant rewards instantly and unlock extra Sponsor nodes in Season.' })
                    : getLocalized({ zh: '创建订单后按精确金额支付，再粘贴 txid 校验即可发奖，并永久解锁赞助轨道。', en: 'Create an order, pay the exact amount, then verify the txid to grant rewards and unlock the Sponsor track.' })
                }</div>
                <div class="reward-row">
                    <span class="mini-chip">${getLocalized({ zh: `${premiumReady} 个赞助节点待领取`, en: `${premiumReady} sponsor nodes ready` })}</span>
                    <span class="mini-chip">OKX Wallet · TRON (TRC20)</span>
                </div>
                <div class="shop-kpi-grid">
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '已校验订单', en: 'Verified Orders' })}</span>
                        <strong>${formatCompact(state.save.payment.purchaseCount || 0)}</strong>
                    </div>
                    <div class="shop-kpi">
                        <span>${getLocalized({ zh: '赞助轨道', en: 'Sponsor Track' })}</span>
                        <strong>${sponsorUnlocked ? getLocalized({ zh: '已解锁', en: 'Unlocked' }) : getLocalized({ zh: '未解锁', en: 'Locked' })}</strong>
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
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${selectedPaymentOfferId}">
                        ${getLocalized({ zh: '打开充值', en: 'Open Top-Up' })}
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
                    <span class="mini-chip">${getLocalized({ zh: '链上校验发奖', en: 'On-chain verified' })}</span>
                    <span class="mini-chip">TRON (TRC20)</span>
                </div>
                <div class="reward-row">${renderRewardChips(offer.reward)}</div>
                <div class="card-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${offer.id}">
                        ${getLocalized({ zh: '创建订单并支付', en: 'Create Order & Pay' })}
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
                            <div class="card-title">${getLocalized({ zh: '赞助轨道未开启', en: 'Sponsor Track Locked' })}</div>
                        </div>
                        <div class="card-number">${getLocalized({ zh: '待解锁', en: 'Locked' })}</div>
                    </div>
                    <div class="card-copy">${getLocalized({ zh: '任意一笔链上校验成功的充值都会解锁赞助轨道，随后可随赛季经验领取额外金币、能核和高阶塔台碎片。', en: 'Any verified top-up unlocks the Sponsor track so you can claim extra gold, cores, and high-tier fragments as Season XP grows.' })}</div>
                    <div class="reward-row">${renderRewardChips({ gold: 1800, cores: 20, fragments: { chain: 12, rail: 8 } })}</div>
                    <div class="card-actions">
                        <button class="primary-btn" type="button" data-action="openPayment" data-value="starter">${getLocalized({ zh: '立即解锁', en: 'Unlock Now' })}</button>
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
            .sort((a, b) => Number(b.claimable) - Number(a.claimed) || Number(a.claimed) - Number(b.claimed) || a.index - b.index);

        return `
            <div class="panel-head">
                <div>
                    <h3>${t('sponsorTrack')}</h3>
                    <p>${getLocalized({ zh: '赞助轨道已开启。达到指定赛季经验后，可领取额外金币、能核与高阶碎片。', en: 'Sponsor track is now live. Reach the required Season XP to claim extra gold, cores, and high-tier fragments.' })}</p>
                </div>
                <div class="mini-chip">${getLocalized({ zh: `待领取 ${getSponsorSeasonReadyCount()} 个节点`, en: `${getSponsorSeasonReadyCount()} nodes ready` })}</div>
            </div>
            <div class="season-grid">
                ${sponsorNodes.map(({ node, index, claimable, claimed }) => `
                    <article class="season-node ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}">
                        <div class="card-top">
                            <div>
                                <div class="card-kicker">${claimable ? getLocalized({ zh: '可领取', en: 'Ready' }) : `XP ${node.xp}`}</div>
                                <div class="card-title">${getLocalized({ zh: `赞助节点 ${index + 1}`, en: `Sponsor Node ${index + 1}` })}</div>
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
                        <div class="card-title">${state.lang === 'zh' ? '赞助礼包预留位' : 'Sponsor Pack Slot'}</div>
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
        if (reward.seasonXp) chips.push(`<span class="mini-chip">${formatCompact(reward.seasonXp)} ${getLocalized({ zh: '赛季经验', en: 'Season XP' })}</span>`);
        if (reward.fragments) {
            Object.entries(reward.fragments).forEach(([towerId, amount]) => chips.push(`<span class="mini-chip">${towerLabel(towerId)} +${formatCompact(amount)}</span>`));
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
        ui.startDescription.textContent = t('startDescTemplate').replace('{chapter}', chapter.id);
        ui.startMeta.innerHTML = `
            <span class="mini-chip">${t('startMetaReward').replace('{gold}', formatCompact(chapter.goldReward)).replace('{core}', formatCompact(chapter.coreReward)).replace('{fragment}', formatCompact(chapter.fragmentReward))}</span>
            <span class="mini-chip">${t('startMetaEnemy').replace('{enemy}', mainEnemy)}</span>
            <span class="mini-chip">${getLocalized({ zh: `碎片倾向 ${focusPreview}`, en: `Focus Drops ${focusPreview}` })}</span>
            <span class="mini-chip">${getLocalized({ zh: `推荐技能 ${recommendedSkill}`, en: `Recommended Skill ${recommendedSkill}` })}</span>
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
        return queue;
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
        enemy.hp -= amount;
        state.battle.runStats.damage += amount;
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
        state.save.gold += gold;
        state.save.cores += enemy.rewardCore;
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
        showToast(getLocalized({ zh: '赞助轨道奖励已领取', en: 'Sponsor track reward claimed.' }));
        renderAll();
    }

    function claimDailySupply() {
        if (!isDailySupplyReady()) return;
        state.save.dailySupplyAt = Date.now();
        grantReward({ gold: 360, cores: 10, fragments: { pulse: 10, laser: 10 } });
        saveProgress();
        showToast(t('toastDailySupply'));
        renderAll();
    }

    function buyShopItem(id) {
        if (id === 'goldCrate') {
            if (state.save.gold < 920) return showToast(t('toastNotEnoughGold'));
            state.save.gold -= 920;
            grantReward({ gold: 120, fragments: { frost: 8 + randomInt(0, 4), rocket: 8 + randomInt(0, 4), chain: 4 + randomInt(0, 3) } });
        } else if (id === 'coreCrate') {
            if (state.save.cores < 34) return showToast(t('toastNotEnoughCore'));
            state.save.cores -= 34;
            grantReward({ gold: 280, fragments: { chain: 10 + randomInt(0, 4), rail: 6 + randomInt(0, 3) } });
        } else {
            return;
        }
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
        return research.baseCost + research.stepCost * getResearchLevel(researchId);
    }

    function getResearchLevel(researchId) {
        return Number(state.save.researches[researchId]) || 0;
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
        return Math.round(tower.upgradeGold * (1 + (level - 1) * 0.42));
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

    function getCoreMaxHp() {
        return 100 + getResearchLevel('fortify') * 12;
    }

    function getCoreShieldCap() {
        return 38 + getResearchLevel('fortify') * 10;
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
    function hasShopRedDot() { return isDailySupplyReady(); }
    function showToast(message) { if (!message) return; ui.toast.textContent = message; ui.toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2200); }
    function showOverlay(node) { node.classList.remove('is-hidden'); }
    function hideOverlay(node) { node.classList.add('is-hidden'); }
    function towerLabel(towerId) { return t(`tower${capitalize(towerId)}`); }
    function enemyLabel(enemyId) { return t(`enemy${capitalize(enemyId)}`); }
    function rarityLabel(rarity) { return t(`rarity${capitalize(rarity)}`); }
    function getLaneName(index) { return t(`lane${index + 1}`); }
    function getTowerDescription(towerId) { const mapZh = { pulse: '均衡输出，适合作为三路通用主塔。', laser: '超高射速，专门处理前排快节奏敌人。', frost: '附带减速效果，能显著稳定危险波次。', rocket: '高额爆裂伤害，擅长处理聚集单位。', harvest: '伤害偏低，但击杀时额外回收金币。', chain: '命中后会向同路其他目标传导伤害。', rail: '单发穿透整路，适合压制 Boss 与精英。' }; const mapEn = { pulse: 'Balanced damage and easy to fit in any lane.', laser: 'Very fast fire rate for early fast enemies.', frost: 'Applies slow and smooths dangerous waves.', rocket: 'Explosive splash damage for clustered lanes.', harvest: 'Low damage, but grants extra gold on kills.', chain: 'Hits jump to extra targets in the same lane.', rail: 'Pierces the whole lane, great against elites and bosses.' }; return state.lang === 'zh' ? mapZh[towerId] : mapEn[towerId]; }
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
        ctx.fillText(`${getCurrentChapter().id} · ${t('waveText').replace('{wave}', String(Math.max(1, state.battle.currentWave || 1)))}`, 20, 34);
        ctx.font = '500 14px Inter';
        ctx.fillStyle = 'rgba(145,162,192,0.96)';
        ctx.fillText(`${t('threatLabel')}: ${t(getThreatKey())}`, 20, 56);
        ctx.fillText(`${t(SKILLS[state.save.selectedSkill].nameKey)} · ${state.battle.skillCooldown > 0 ? state.battle.skillCooldown.toFixed(1) + 's' : 'READY'}`, 20, 78);
    }
})();
