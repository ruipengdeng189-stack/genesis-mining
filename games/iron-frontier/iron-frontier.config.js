(function () {
    window.IRON_FRONTIER_CONFIG = {
        meta: {
            id: 'iron-frontier',
            title: { zh: '铁轨远征', en: 'Iron Frontier' },
            subtitle: { zh: '列车生存经营 · 路线事件 · 局外成长', en: 'Rail Survival Management · Route Events · Out-of-Run Growth' },
            eyebrow: { zh: 'GENESIS GAME 9 · PREVIEW BUILD', en: 'GENESIS GAME 9 · PREVIEW BUILD' },
            accent: '#ffb357'
        },
        tabs: [
            { id: 'run', icon: '▶', label: { zh: 'Run', en: 'Run' } },
            { id: 'train', icon: '▣', label: { zh: 'Train', en: 'Train' } },
            { id: 'crew', icon: '☰', label: { zh: 'Crew', en: 'Crew' } },
            { id: 'workshop', icon: '✦', label: { zh: 'Workshop', en: 'Workshop' } },
            { id: 'missions', icon: '✓', label: { zh: 'Missions', en: 'Missions' } },
            { id: 'season', icon: '⌁', label: { zh: 'Season', en: 'Season' } },
            { id: 'shop', icon: '◎', label: { zh: 'Shop', en: 'Shop' } }
        ],
        resources: [
            { id: 'scrap', icon: '▣', label: { zh: '废钢', en: 'Scrap' } },
            { id: 'fuelCells', icon: '◈', label: { zh: '燃料芯', en: 'Fuel' } },
            { id: 'coreChips', icon: '✦', label: { zh: '核心片', en: 'Chips' } },
            { id: 'relayData', icon: '⌁', label: { zh: '中继码', en: 'Relay' } },
            { id: 'seasonXp', icon: '▲', label: { zh: '赛季经验', en: 'Season XP' } }
        ],
        heroTags: [
            { zh: '独立战斗页', en: 'Standalone Battle' },
            { zh: '单屏整备', en: 'Single-Screen Prep' },
            { zh: '路线事件', en: 'Route Events' }
        ],
        starterResources: {
            scrap: 2400,
            fuelCells: 140,
            coreChips: 18,
            relayData: 2,
            seasonXp: 0
        },
        starterCrew: ['mira', 'knox', 'lio'],
        modules: [
            { id: 'locomotive', icon: '🚂', maxLevel: 7, name: { zh: '车头', en: 'Locomotive' }, summary: { zh: '耐久、推进、容错核心', en: 'Core source of integrity and steady pacing' }, effect: { zh: '耐久 +9% / 减伤 +1.2%', en: 'Integrity +9% / DR +1.2%' } },
            { id: 'mainGun', icon: '💥', maxLevel: 8, name: { zh: '主炮车', en: 'Main Gun' }, summary: { zh: '主输出、清怪、Boss 破段', en: 'Primary damage, wave clear, boss pressure' }, effect: { zh: '伤害 +11% / 首领伤害 +2%', en: 'Damage +11% / Boss damage +2%' } },
            { id: 'armorCar', icon: '🛡', maxLevel: 7, name: { zh: '装甲车', en: 'Armor Car' }, summary: { zh: '护盾与减伤，稳定战线', en: 'Shield, mitigation, line stability' }, effect: { zh: '护盾 +10% / 减伤 +1.5%', en: 'Shield +10% / DR +1.5%' } },
            { id: 'supportCar', icon: '🔧', maxLevel: 6, name: { zh: '支援车', en: 'Support Car' }, summary: { zh: '修复、冷却、掉落回收', en: 'Repair, cooldown, salvage support' }, effect: { zh: '修复 +8% / 冷却 -1.5%', en: 'Repair +8% / Cooldown -1.5%' } },
            { id: 'ultimate', icon: '⚡', maxLevel: 5, name: { zh: '轨炮大招', en: 'Rail Burst' }, summary: { zh: '清场、破段、危急反打', en: 'Clear waves, break bosses, emergency swing' }, effect: { zh: '直伤 +15% / 充能 -4%', en: 'Burst +15% / Charge -4%' } }
        ],
        moduleUpgradeTables: {
            locomotive: [{ scrap: 160, fuelCells: 10 }, { scrap: 240, fuelCells: 14 }, { scrap: 360, fuelCells: 20 }, { scrap: 540, fuelCells: 30 }, { scrap: 810, fuelCells: 44 }, { scrap: 1220, fuelCells: 62 }],
            mainGun: [{ scrap: 130, fuelCells: 12 }, { scrap: 200, fuelCells: 16 }, { scrap: 300, fuelCells: 22 }, { scrap: 460, fuelCells: 32 }, { scrap: 700, fuelCells: 46 }, { scrap: 1060, fuelCells: 66 }, { scrap: 1600, fuelCells: 92 }],
            armorCar: [{ scrap: 110, fuelCells: 10 }, { scrap: 170, fuelCells: 14 }, { scrap: 260, fuelCells: 20 }, { scrap: 390, fuelCells: 28 }, { scrap: 590, fuelCells: 40 }, { scrap: 900, fuelCells: 56 }],
            supportCar: [{ scrap: 100, fuelCells: 8 }, { scrap: 150, fuelCells: 12 }, { scrap: 230, fuelCells: 18 }, { scrap: 350, fuelCells: 26 }, { scrap: 530, fuelCells: 38 }],
            ultimate: [{ scrap: 240, fuelCells: 14, relayData: 1 }, { scrap: 360, fuelCells: 22, relayData: 2 }, { scrap: 560, fuelCells: 32, relayData: 3 }, { scrap: 860, fuelCells: 46, relayData: 5 }]
        },
        crewUpgradeTable: [
            { scrap: 140, coreChips: 2 },
            { scrap: 220, coreChips: 3 },
            { scrap: 340, coreChips: 5 },
            { scrap: 520, coreChips: 8 },
            { scrap: 780, coreChips: 12 }
        ],
        crew: [
            { id: 'mira', icon: '⚙', maxLevel: 6, name: { zh: '米拉', en: 'Mira' }, role: { zh: '列车长', en: 'Conductor' }, summary: { zh: '推进效率与事件收益', en: 'Route pace and event value' }, passive: { zh: '路线选择收益 +6%', en: 'Route choice value +6%' } },
            { id: 'knox', icon: '✹', maxLevel: 6, name: { zh: '诺克斯', en: 'Knox' }, role: { zh: '炮手', en: 'Gunner' }, summary: { zh: '主炮伤害与超载强化', en: 'Main gun damage and overdrive burst' }, passive: { zh: '超载期间伤害 +8%', en: 'Overdrive damage +8%' } },
            { id: 'lio', icon: '🔩', maxLevel: 6, name: { zh: '里奥', en: 'Lio' }, role: { zh: '机械师', en: 'Mechanic' }, summary: { zh: '修复、冷却、过热恢复', en: 'Repair, cooldown and heat control' }, passive: { zh: '修复额外恢复 +6%', en: 'Repair restores +6%' } },
            { id: 'ves', icon: '⌖', maxLevel: 6, name: { zh: '维斯', en: 'Vess' }, role: { zh: '侦察员', en: 'Scout' }, summary: { zh: '精英预警与波次处理', en: 'Elite warning and wave rhythm' }, passive: { zh: '精英预警更早出现', en: 'Elite warnings appear earlier' } },
            { id: 'suri', icon: '◌', maxLevel: 6, name: { zh: '苏芮', en: 'Suri' }, role: { zh: '拾荒者', en: 'Scavenger' }, summary: { zh: '废钢回收与结算加成', en: 'Scrap salvage and payout boost' }, passive: { zh: '废钢收益 +7%', en: 'Scrap gain +7%' } }
        ],
        research: [
            { id: 'boilerMesh', icon: '◈', maxLevel: 10, name: { zh: '锅炉网格', en: 'Boiler Mesh' }, effect: { zh: '基础耐久 +3%', en: 'Base integrity +3%' }, baseCost: { scrap: 120, fuelCells: 8, coreChips: 1 } },
            { id: 'fireDirector', icon: '✦', maxLevel: 12, name: { zh: '火控导向', en: 'Fire Director' }, effect: { zh: '主炮伤害 +3.5%', en: 'Main gun +3.5%' }, baseCost: { scrap: 140, fuelCells: 10, coreChips: 1 } },
            { id: 'platingWeld', icon: '▣', maxLevel: 10, name: { zh: '装甲焊接', en: 'Plating Weld' }, effect: { zh: '护盾 +4%', en: 'Shield +4%' }, baseCost: { scrap: 130, fuelCells: 9, coreChips: 1 } },
            { id: 'repairGrid', icon: '▤', maxLevel: 10, name: { zh: '修复网格', en: 'Repair Grid' }, effect: { zh: '修复效率 +4%', en: 'Repair +4%' }, baseCost: { scrap: 130, fuelCells: 9, coreChips: 1 } },
            { id: 'salvageCharter', icon: '◎', maxLevel: 8, name: { zh: '回收宪章', en: 'Salvage Charter' }, effect: { zh: '废钢 / 燃料收益 +3%', en: 'Scrap / Fuel +3%' }, baseCost: { scrap: 160, fuelCells: 12, coreChips: 1 } },
            { id: 'relayDecoder', icon: '⌁', maxLevel: 8, name: { zh: '中继解码', en: 'Relay Decoder' }, effect: { zh: '终极充能 +3%', en: 'Ultimate charge +3%' }, baseCost: { scrap: 180, fuelCells: 12, coreChips: 1, relayData: 1 } }
        ],
        stages: [
            { id: '1-1', chapter: 1, type: 'normal', name: { zh: '尘轨前哨', en: 'Dustrail Outpost' }, recommended: 160, reward: { scrap: 90, fuelCells: 8, coreChips: 0, relayData: 0, seasonXp: 12 }, pressure: { zh: '热身波次', en: 'Warm-up waves' }, rewardFocus: { zh: '基础废钢', en: 'Starter scrap' } },
            { id: '1-2', chapter: 1, type: 'normal', name: { zh: '断轨支线', en: 'Broken Spur' }, recommended: 250, reward: { scrap: 110, fuelCells: 10, coreChips: 0, relayData: 0, seasonXp: 14 }, pressure: { zh: '第一次护盾消耗', en: 'First shield drain' }, rewardFocus: { zh: '燃料补给', en: 'Fuel pickup' } },
            { id: '1-3', chapter: 1, type: 'normal', name: { zh: '灰烬仓栈', en: 'Ash Depot' }, recommended: 360, reward: { scrap: 140, fuelCells: 12, coreChips: 1, relayData: 0, seasonXp: 16 }, pressure: { zh: '修复按钮教学', en: 'Repair timing check' }, rewardFocus: { zh: '第一片芯片', en: 'First chip' } },
            { id: '1-4', chapter: 1, type: 'normal', name: { zh: '锈谷狭道', en: 'Rust Gorge' }, recommended: 520, reward: { scrap: 180, fuelCells: 16, coreChips: 1, relayData: 0, seasonXp: 20 }, pressure: { zh: '连续压迫', en: 'Sustained pressure' }, rewardFocus: { zh: '中期整备起点', en: 'Prep ramp-up' } },
            { id: '1-5', chapter: 1, type: 'elite', name: { zh: '掠夺停靠站', en: 'Raider Stop' }, recommended: 700, reward: { scrap: 230, fuelCells: 20, coreChips: 2, relayData: 0, seasonXp: 24 }, pressure: { zh: '首个精英', en: 'First elite' }, rewardFocus: { zh: '装甲补强', en: 'Armor boost' } },
            { id: '1-6', chapter: 1, type: 'boss', name: { zh: '焦痕枢纽', en: 'Scorch Nexus' }, recommended: 920, reward: { scrap: 310, fuelCells: 26, coreChips: 3, relayData: 1, seasonXp: 30 }, pressure: { zh: '首个 Boss', en: 'First boss' }, rewardFocus: { zh: '终极技能解锁感', en: 'Ultimate timing' } },
            { id: '2-1', chapter: 2, type: 'normal', name: { zh: '铁泥站场', en: 'Ironmud Yard' }, recommended: 1180, reward: { scrap: 380, fuelCells: 30, coreChips: 3, relayData: 0, seasonXp: 34 }, pressure: { zh: '双路线判断', en: 'Dual route choice' }, rewardFocus: { zh: '废钢提速', en: 'Scrap pace' } },
            { id: '2-2', chapter: 2, type: 'normal', name: { zh: '裂隧回廊', en: 'Fracture Tunnel' }, recommended: 1480, reward: { scrap: 460, fuelCells: 36, coreChips: 4, relayData: 0, seasonXp: 40 }, pressure: { zh: '护盾续航', en: 'Shield uptime' }, rewardFocus: { zh: '燃料循环', en: 'Fuel loop' } },
            { id: '2-3', chapter: 2, type: 'normal', name: { zh: '熔炉脊线', en: 'Furnace Ridge' }, recommended: 1840, reward: { scrap: 560, fuelCells: 42, coreChips: 5, relayData: 1, seasonXp: 46 }, pressure: { zh: '主炮 / 研究双检定', en: 'Gun / lab double check' }, rewardFocus: { zh: '主炮成型', en: 'Gun shaping' } },
            { id: '2-4', chapter: 2, type: 'normal', name: { zh: '积水道岔', en: 'Flood Switch' }, recommended: 2280, reward: { scrap: 680, fuelCells: 50, coreChips: 6, relayData: 1, seasonXp: 54 }, pressure: { zh: '事件取舍', en: 'Event tradeoff' }, rewardFocus: { zh: '研究补齐', en: 'Lab catch-up' } },
            { id: '2-5', chapter: 2, type: 'elite', name: { zh: '余烬桥', en: 'Cinder Bridge' }, recommended: 2840, reward: { scrap: 820, fuelCells: 60, coreChips: 7, relayData: 1, seasonXp: 64 }, pressure: { zh: '精英冲锋车', en: 'Elite rush car' }, rewardFocus: { zh: '终极充能', en: 'Ultimate charge' } },
            { id: '2-6', chapter: 2, type: 'boss', name: { zh: '废钢堡垒', en: 'Scrap Bastion' }, recommended: 3480, reward: { scrap: 990, fuelCells: 72, coreChips: 8, relayData: 2, seasonXp: 76 }, pressure: { zh: '持久战 Boss', en: 'Attrition boss' }, rewardFocus: { zh: '中继码起量', en: 'Relay start' } },
            { id: '3-1', chapter: 3, type: 'normal', name: { zh: '静电脉冲口', en: 'Static Mouth' }, recommended: 4260, reward: { scrap: 1200, fuelCells: 84, coreChips: 10, relayData: 1, seasonXp: 88 }, pressure: { zh: '高热度管理', en: 'Heat management' }, rewardFocus: { zh: '芯片增量', en: 'Chip ramp' } },
            { id: '3-2', chapter: 3, type: 'normal', name: { zh: '雾灯中继', en: 'Fog Relay' }, recommended: 5180, reward: { scrap: 1460, fuelCells: 98, coreChips: 12, relayData: 1, seasonXp: 102 }, pressure: { zh: '支援车检定', en: 'Support car check' }, rewardFocus: { zh: '燃料回收', en: 'Fuel recovery' } },
            { id: '3-3', chapter: 3, type: 'normal', name: { zh: '回响编组场', en: 'Echo Marshalling' }, recommended: 6300, reward: { scrap: 1760, fuelCells: 116, coreChips: 14, relayData: 1, seasonXp: 118 }, pressure: { zh: '完整编组考核', en: 'Full build check' }, rewardFocus: { zh: '乘员同步', en: 'Crew sync' } },
            { id: '3-4', chapter: 3, type: 'normal', name: { zh: '断阵天线', en: 'Broken Antenna' }, recommended: 7640, reward: { scrap: 2120, fuelCells: 138, coreChips: 16, relayData: 2, seasonXp: 136 }, pressure: { zh: '连续事件段', en: 'Consecutive events' }, rewardFocus: { zh: '中后期废钢', en: 'Mid-late scrap' } },
            { id: '3-5', chapter: 3, type: 'elite', name: { zh: '核心峡谷', en: 'Core Canyon' }, recommended: 9240, reward: { scrap: 2560, fuelCells: 164, coreChips: 18, relayData: 2, seasonXp: 156 }, pressure: { zh: '精英波连段', en: 'Elite chain' }, rewardFocus: { zh: '研究补全', en: 'Research fill' } },
            { id: '3-6', chapter: 3, type: 'boss', name: { zh: '信号暴君', en: 'Signal Tyrant' }, recommended: 11160, reward: { scrap: 3080, fuelCells: 196, coreChips: 21, relayData: 3, seasonXp: 180 }, pressure: { zh: '终极节奏检定', en: 'Ultimate tempo' }, rewardFocus: { zh: '高阶中继', en: 'High relay' } },
            { id: '4-1', chapter: 4, type: 'normal', name: { zh: '黑轨裂口', en: 'Blackrail Breach' }, recommended: 13460, reward: { scrap: 3720, fuelCells: 232, coreChips: 24, relayData: 2, seasonXp: 206 }, pressure: { zh: '后期波次厚度', en: 'Late wave density' }, rewardFocus: { zh: '终章起量', en: 'Final arc start' } },
            { id: '4-2', chapter: 4, type: 'normal', name: { zh: '守门三角洲', en: 'Gate Delta' }, recommended: 16220, reward: { scrap: 4480, fuelCells: 274, coreChips: 27, relayData: 2, seasonXp: 234 }, pressure: { zh: '同步成长检定', en: 'Sync growth check' }, rewardFocus: { zh: '车头跃升', en: 'Locomotive jump' } },
            { id: '4-3', chapter: 4, type: 'normal', name: { zh: '虚零交汇点', en: 'Null Junction' }, recommended: 19520, reward: { scrap: 5400, fuelCells: 324, coreChips: 30, relayData: 3, seasonXp: 264 }, pressure: { zh: '高压防线', en: 'Heavy defense' }, rewardFocus: { zh: '高阶研究', en: 'Upper research' } },
            { id: '4-4', chapter: 4, type: 'normal', name: { zh: '死火机城', en: 'Deadfire Yard' }, recommended: 23480, reward: { scrap: 6500, fuelCells: 382, coreChips: 33, relayData: 3, seasonXp: 296 }, pressure: { zh: '终局容错', en: 'Final survivability' }, rewardFocus: { zh: '终局资源', en: 'Endgame resources' } },
            { id: '4-5', chapter: 4, type: 'elite', name: { zh: '冠炉高墙', en: 'Crown Furnace' }, recommended: 28220, reward: { scrap: 7800, fuelCells: 452, coreChips: 37, relayData: 4, seasonXp: 332 }, pressure: { zh: '连续精英与过热', en: 'Elite chain and heat' }, rewardFocus: { zh: '终盘整备', en: 'Endgame prep' } },
            { id: '4-6', chapter: 4, type: 'boss', name: { zh: '远境之门', en: 'Far Frontier Gate' }, recommended: 33880, reward: { scrap: 9360, fuelCells: 536, coreChips: 42, relayData: 6, seasonXp: 372 }, pressure: { zh: '终局 Boss', en: 'Final boss' }, rewardFocus: { zh: '全线毕业', en: 'Full completion' } }
        ],
        missions: [
            { id: 'm1', metric: 'runs', target: 2, title: { zh: '完成 2 次出发', en: 'Finish 2 Runs' }, reward: { scrap: 320, fuelCells: 20 } },
            { id: 'm2', metric: 'wins', target: 1, title: { zh: '打通 1 个站点', en: 'Clear 1 Stage' }, reward: { scrap: 420, fuelCells: 24, coreChips: 2 } },
            { id: 'm3', metric: 'upgrades', target: 4, title: { zh: '完成 4 次升级', en: 'Complete 4 Upgrades' }, reward: { scrap: 520, fuelCells: 30, coreChips: 2 } },
            { id: 'm4', metric: 'skills', target: 8, title: { zh: '释放 8 次技能', en: 'Use 8 Skills' }, reward: { scrap: 620, fuelCells: 36, coreChips: 3 } },
            { id: 'm5', metric: 'researchUpgrades', target: 3, title: { zh: '提升 3 次研究', en: 'Upgrade Research 3 Times' }, reward: { scrap: 760, fuelCells: 42, coreChips: 4, relayData: 1 } },
            { id: 'm6', metric: 'stageClears', target: 4, title: { zh: '通过 4 个关卡', en: 'Clear 4 Stages' }, reward: { scrap: 980, fuelCells: 56, coreChips: 5, relayData: 1, seasonXp: 50 } }
        ],
        season: [
            { id: 'f1', xp: 80, title: { zh: '免费 1', en: 'Free 1' }, reward: { scrap: 260, fuelCells: 16 } },
            { id: 'f2', xp: 180, title: { zh: '免费 2', en: 'Free 2' }, reward: { scrap: 360, fuelCells: 20, coreChips: 2 } },
            { id: 'f3', xp: 320, title: { zh: '免费 3', en: 'Free 3' }, reward: { scrap: 520, fuelCells: 28 } },
            { id: 'f4', xp: 520, title: { zh: '免费 4', en: 'Free 4' }, reward: { scrap: 760, fuelCells: 40, coreChips: 3 } },
            { id: 'f5', xp: 760, title: { zh: '免费 5', en: 'Free 5' }, reward: { scrap: 1080, fuelCells: 58, relayData: 1 } },
            { id: 'f6', xp: 1080, title: { zh: '免费 6', en: 'Free 6' }, reward: { scrap: 1480, fuelCells: 74, coreChips: 5 } },
            { id: 'p1', xp: 80, premium: true, title: { zh: '高级 1', en: 'Premium 1' }, reward: { scrap: 520, fuelCells: 28 } },
            { id: 'p2', xp: 180, premium: true, title: { zh: '高级 2', en: 'Premium 2' }, reward: { scrap: 820, fuelCells: 44, coreChips: 3 } },
            { id: 'p3', xp: 320, premium: true, title: { zh: '高级 3', en: 'Premium 3' }, reward: { scrap: 1260, fuelCells: 68, relayData: 1 } },
            { id: 'p4', xp: 520, premium: true, title: { zh: '高级 4', en: 'Premium 4' }, reward: { scrap: 1860, fuelCells: 96, coreChips: 5 } },
            { id: 'p5', xp: 760, premium: true, title: { zh: '高级 5', en: 'Premium 5' }, reward: { scrap: 2680, fuelCells: 142, relayData: 2 } },
            { id: 'p6', xp: 1080, premium: true, title: { zh: '高级 6', en: 'Premium 6' }, reward: { scrap: 3920, fuelCells: 210, coreChips: 9 } }
        ],
        softShop: [
            { id: 'dailyFree', title: { zh: '每日补给', en: 'Daily Supply' }, price: 0, reward: { scrap: 180, fuelCells: 12, seasonXp: 12 }, cooldownHours: 20, tag: { zh: '免费', en: 'Free' } },
            { id: 'fuelCache', title: { zh: '燃料缓存', en: 'Fuel Cache' }, price: { scrap: 680 }, reward: { fuelCells: 24 }, tag: { zh: '软货币', en: 'Soft' } },
            { id: 'chipCrate', title: { zh: '芯片补箱', en: 'Chip Crate' }, price: { scrap: 980 }, reward: { coreChips: 3, fuelCells: 10 }, tag: { zh: '成长', en: 'Growth' } },
            { id: 'relayRepair', title: { zh: '中继修复件', en: 'Relay Repair' }, price: { coreChips: 6 }, reward: { relayData: 1 }, tag: { zh: '稀有', en: 'Rare' } }
        ],
        bundles: [
            { id: 'starter', price: 6, exactPrice: '6.00 USDT', title: { zh: '新手列车包', en: 'Starter Rail Pack' }, reward: { scrap: 2600, fuelCells: 160, coreChips: 12, relayData: 1 }, permanent: { zh: '每日免费整备补给 +1', en: 'Daily free prep +1' }, permanentBonus: { dailyFreeClaims: 1 } },
            { id: 'convoy', price: 15, exactPrice: '15.00 USDT', title: { zh: '车队补给包', en: 'Convoy Supply Pack' }, reward: { scrap: 6400, fuelCells: 360, coreChips: 28, relayData: 2 }, permanent: { zh: '燃料结算 +10%', en: 'Fuel payout +10%' }, permanentBonus: { fuelPayout: 0.1 } },
            { id: 'captain', price: 30, exactPrice: '30.00 USDT', title: { zh: '列车长成长包', en: 'Captain Growth Pack' }, reward: { scrap: 12000, fuelCells: 680, coreChips: 48, relayData: 4 }, permanent: { zh: '乘员训练效率 +12%', en: 'Crew training +12%' }, permanentBonus: { crewDiscount: 0.12 } },
            { id: 'arsenal', price: 68, exactPrice: '68.00 USDT', title: { zh: '前线军械包', en: 'Frontier Arsenal Pack' }, reward: { scrap: 22000, fuelCells: 1280, coreChips: 88, relayData: 10 }, permanent: { zh: '精英 / Boss 奖励 +12%', en: 'Elite / Boss rewards +12%' }, permanentBonus: { eliteBossReward: 0.12 } }
        ],
        battleEvents: [
            {
                id: 'station',
                title: { zh: '废弃站台', en: 'Abandoned Platform' },
                options: [
                    { id: 'station-salvage', label: { zh: '回收物资', en: 'Salvage Crates' }, result: { zh: '立即获得额外废钢并提升本局掉落。', en: 'Gain scrap now and improve this run salvage.' }, bonusReward: { scrap: 120 }, salvageBoost: 0.12 },
                    { id: 'station-repair', label: { zh: '快速修整', en: 'Quick Repair' }, result: { zh: '恢复车体与护盾。', en: 'Recover integrity and shield.' }, integrity: 14, shield: 20 }
                ]
            },
            {
                id: 'relay',
                title: { zh: '信号岔路', en: 'Relay Split' },
                options: [
                    { id: 'relay-fire', label: { zh: '火力超载', en: 'Fire Surge' }, result: { zh: '推进更快，但热量更高。', en: 'Push faster at higher heat.' }, progress: 10, heat: 16, overdrive: 1 },
                    { id: 'relay-safe', label: { zh: '稳态推进', en: 'Steady Route' }, result: { zh: '保持稳定并回复少量热量。', en: 'Stay stable and cool down.' }, progress: 6, heat: -10 }
                ]
            },
            {
                id: 'merchant',
                title: { zh: '黑市车队', en: 'Black Market Convoy' },
                options: [
                    { id: 'merchant-battery', label: { zh: '换能电池', en: 'Swap Batteries' }, result: { zh: '终极充能提升。', en: 'Boost ultimate charge.' }, progress: 8, chargeBoost: 0.12 },
                    { id: 'merchant-plates', label: { zh: '加固装甲', en: 'Reinforce Plates' }, result: { zh: '立刻获得护盾与减伤。', en: 'Gain instant shield and mitigation.' }, shield: 24, barrier: 1 }
                ]
            }
        ]
    };
}());
