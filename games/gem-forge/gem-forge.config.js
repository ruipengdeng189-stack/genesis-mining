(function () {
    window.GENESIS_GEM_FORGE_CONFIG = {
        meta: {
            id: 'gem-forge',
            title: { zh: '宝石熔炉', en: 'Gem Forge' },
            subtitle: { zh: '熔炼、合成、升阶、觉醒', en: 'Smelt, Fuse, Ascend, Awaken' }
        },
        tabs: [
            { id: 'forge', label: { zh: '熔炉', en: 'Forge' } },
            { id: 'contracts', label: { zh: '合同', en: 'Contracts' } },
            { id: 'sigils', label: { zh: '符印', en: 'Sigils' } },
            { id: 'workshop', label: { zh: '工坊', en: 'Workshop' } },
            { id: 'missions', label: { zh: '任务', en: 'Missions' } },
            { id: 'season', label: { zh: '赛季', en: 'Season' } },
            { id: 'shop', label: { zh: '商店', en: 'Shop' } }
        ],
        currencies: [
            { id: 'gold', label: { zh: '金币', en: 'Gold' } },
            { id: 'dust', label: { zh: '熔尘', en: 'Dust' } },
            { id: 'catalyst', label: { zh: '催化剂', en: 'Catalyst' } },
            { id: 'seasonXp', label: { zh: '赛季经验', en: 'Season XP' } }
        ],
        gemFamilies: [
            { id: 'ember', name: { zh: '余烬', en: 'Ember' }, accent: '#ff8b57' },
            { id: 'tide', name: { zh: '潮汐', en: 'Tide' }, accent: '#57c7ff' },
            { id: 'volt', name: { zh: '雷霆', en: 'Volt' }, accent: '#ffe56a' },
            { id: 'void', name: { zh: '虚空', en: 'Void' }, accent: '#ba7cff' }
        ],
        gemTiers: [
            { tier: 1, fuseNeed: 3, score: 18, dismantleDust: 2, awakenCatalyst: 0 },
            { tier: 2, fuseNeed: 3, score: 46, dismantleDust: 6, awakenCatalyst: 0 },
            { tier: 3, fuseNeed: 3, score: 118, dismantleDust: 18, awakenCatalyst: 2 },
            { tier: 4, fuseNeed: 3, score: 288, dismantleDust: 54, awakenCatalyst: 6 },
            { tier: 5, fuseNeed: 3, score: 720, dismantleDust: 160, awakenCatalyst: 14 }
        ],
        sigils: [
            {
                id: 'emberCore',
                slot: 'main',
                family: 'ember',
                rarity: 'rare',
                name: { zh: '余烬主印', en: 'Ember Core' },
                shardUnlock: 20,
                baseScore: 80,
                shardCostBase: 18,
                shardCostStep: 8,
                goldCostBase: 300,
                goldCostStep: 140,
                effect: { zh: '提高熔炼主产出与合同金币回收。', en: 'Raises forge output and contract gold return.' }
            },
            {
                id: 'tideLoop',
                slot: 'echo',
                family: 'tide',
                rarity: 'rare',
                name: { zh: '潮汐回路', en: 'Tide Loop' },
                shardUnlock: 22,
                baseScore: 76,
                shardCostBase: 18,
                shardCostStep: 8,
                goldCostBase: 300,
                goldCostStep: 140,
                effect: { zh: '提高热量恢复并降低批量熔炼压力。', en: 'Improves heat recovery and batch-forge comfort.' }
            },
            {
                id: 'voltRelay',
                slot: 'resonance',
                family: 'volt',
                rarity: 'epic',
                name: { zh: '雷霆继电', en: 'Volt Relay' },
                shardUnlock: 26,
                baseScore: 102,
                shardCostBase: 22,
                shardCostStep: 10,
                goldCostBase: 420,
                goldCostStep: 180,
                effect: { zh: '提高双倍产出和高阶跳升触发率。', en: 'Raises double-output and tier-jump odds.' }
            },
            {
                id: 'voidMirror',
                slot: 'main',
                family: 'void',
                rarity: 'epic',
                name: { zh: '虚空镜印', en: 'Void Mirror' },
                shardUnlock: 30,
                baseScore: 122,
                shardCostBase: 26,
                shardCostStep: 12,
                goldCostBase: 520,
                goldCostStep: 220,
                effect: { zh: '提高 T3+ 稀有率与后期合同稳定性。', en: 'Raises T3+ odds and stabilizes late contracts.' }
            },
            {
                id: 'prismCrown',
                slot: 'resonance',
                family: 'void',
                rarity: 'legendary',
                name: { zh: '棱镜冠印', en: 'Prism Crown' },
                shardUnlock: 40,
                baseScore: 168,
                shardCostBase: 34,
                shardCostStep: 16,
                goldCostBase: 760,
                goldCostStep: 300,
                effect: { zh: '提高 T4/T5 产线与觉醒转化效率。', en: 'Improves T4/T5 flow and awakening conversion.' }
            }
        ],
        contracts: [
            { id: '1-1', name: { zh: '暖炉启封', en: 'Warm Kiln' }, recommended: 180, reward: { gold: 180, dust: 18, catalyst: 2, seasonXp: 28 }, focus: ['ember', 'tide'] },
            { id: '1-2', name: { zh: '合金试压', en: 'Alloy Pressure' }, recommended: 320, reward: { gold: 280, dust: 24, catalyst: 2, seasonXp: 36 }, focus: ['tide', 'volt'] },
            { id: '1-3', name: { zh: '棱镜试炼', en: 'Prism Trial' }, recommended: 540, reward: { gold: 420, dust: 34, catalyst: 3, seasonXp: 48 }, focus: ['volt', 'ember'] },
            { id: '2-1', name: { zh: '晶压炉室', en: 'Crystal Press' }, recommended: 860, reward: { gold: 620, dust: 48, catalyst: 4, seasonXp: 66 }, focus: ['ember', 'void'] },
            { id: '2-2', name: { zh: '余烬反应堆', en: 'Ember Reactor' }, recommended: 1260, reward: { gold: 860, dust: 62, catalyst: 5, seasonXp: 88 }, focus: ['ember', 'volt'] },
            { id: '2-3', name: { zh: '共鸣熔芯', en: 'Resonance Core' }, recommended: 1780, reward: { gold: 1160, dust: 84, catalyst: 7, seasonXp: 116 }, focus: ['tide', 'void'] },
            { id: '3-1', name: { zh: '虚空镜厅', en: 'Void Mirror' }, recommended: 2440, reward: { gold: 1520, dust: 112, catalyst: 9, seasonXp: 146 }, focus: ['void', 'volt'] },
            { id: '3-2', name: { zh: '符印之心', en: 'Sigil Heart' }, recommended: 3260, reward: { gold: 1960, dust: 146, catalyst: 12, seasonXp: 182 }, focus: ['void', 'ember'] },
            { id: '3-3', name: { zh: '创世砧核', en: 'Genesis Anvil' }, recommended: 4320, reward: { gold: 2520, dust: 192, catalyst: 16, seasonXp: 228 }, focus: ['void', 'tide'] }
        ],
        workshop: [
            {
                id: 'heatCap',
                name: { zh: '热量上限', en: 'Heat Cap' },
                maxLevel: 12,
                baseCostGold: 240,
                costGoldStep: 130,
                baseCostDust: 0,
                costDustStep: 4,
                effectBase: 20,
                effectStep: 12
            },
            {
                id: 'heatRegen',
                name: { zh: '热量恢复', en: 'Heat Regen' },
                maxLevel: 12,
                baseCostGold: 220,
                costGoldStep: 120,
                baseCostDust: 0,
                costDustStep: 4,
                effectBase: 0.2,
                effectStep: 0.14
            },
            {
                id: 'rareRate',
                name: { zh: '稀有率强化', en: 'Rare Rate' },
                maxLevel: 10,
                baseCostGold: 320,
                costGoldStep: 160,
                baseCostDust: 10,
                costDustStep: 8,
                effectBase: 0.015,
                effectStep: 0.01
            },
            {
                id: 'dustYield',
                name: { zh: '熔尘回收', en: 'Dust Yield' },
                maxLevel: 10,
                baseCostGold: 340,
                costGoldStep: 170,
                baseCostDust: 12,
                costDustStep: 8,
                effectBase: 0.08,
                effectStep: 0.05
            },
            {
                id: 'catalystRefine',
                name: { zh: '催化剂提炼', en: 'Catalyst Refine' },
                maxLevel: 8,
                baseCostGold: 480,
                costGoldStep: 220,
                baseCostDust: 20,
                costDustStep: 12,
                effectBase: 0.05,
                effectStep: 0.04
            }
        ],
        forgeBalance: {
            heatMax: 120,
            batchSmeltHeatCost: 12,
            batchSmeltGoldGain: 18,
            batchSmeltDustGain: 2,
            pityTier3Need: 18,
            pityTier4Need: 60,
            dropRates: {
                tier1: 0.78,
                tier2: 0.18,
                tier3: 0.04
            }
        },
        missions: [
            { id: 'm1', title: { zh: '开炉 10 次', en: 'Forge 10 Times' }, target: 10, reward: { gold: 220, dust: 16 } },
            { id: 'm2', title: { zh: '完成 3 次合成', en: 'Fuse 3 Times' }, target: 3, reward: { gold: 260, dust: 18 } },
            { id: 'm3', title: { zh: '符印升级 2 次', en: 'Upgrade 2 Sigils' }, target: 2, reward: { gold: 320, dust: 20, catalyst: 2 } },
            { id: 'm4', title: { zh: '推进至 1-3', en: 'Reach 1-3' }, target: 3, reward: { gold: 420, dust: 28, catalyst: 3 } },
            { id: 'm5', title: { zh: '工坊升级 5 次', en: 'Upgrade Workshop 5 Times' }, target: 5, reward: { gold: 560, dust: 34 } },
            { id: 'm6', title: { zh: '获得 1 颗 T3 宝石', en: 'Obtain 1 T3 Gem' }, target: 1, reward: { gold: 720, dust: 40, catalyst: 4 } },
            { id: 'm7', title: { zh: '推进至 2-2', en: 'Reach 2-2' }, target: 5, reward: { gold: 980, dust: 62, catalyst: 5 } },
            { id: 'm8', title: { zh: '完成 20 次合成', en: 'Fuse 20 Times' }, target: 20, reward: { gold: 1280, dust: 84, catalyst: 6 } },
            { id: 'm9', title: { zh: '获得 3 颗 T4 宝石', en: 'Obtain 3 T4 Gems' }, target: 3, reward: { gold: 1820, dust: 116, catalyst: 10 } },
            { id: 'm10', title: { zh: '推进至 3-3', en: 'Reach 3-3' }, target: 9, reward: { gold: 2560, dust: 168, catalyst: 14, seasonXp: 180 } }
        ],
        seasonNodes: [
            { id: 's1', xp: 120, reward: { gold: 280, dust: 18 } },
            { id: 's2', xp: 280, reward: { gold: 420, dust: 24 } },
            { id: 's3', xp: 500, reward: { gold: 620, dust: 36, catalyst: 2 } },
            { id: 's4', xp: 780, reward: { gold: 860, dust: 48 } },
            { id: 's5', xp: 1120, reward: { gold: 1180, dust: 64, catalyst: 3 } },
            { id: 's6', xp: 1520, reward: { gold: 1540, dust: 82 } },
            { id: 's7', xp: 1980, reward: { gold: 1960, dust: 104, catalyst: 4 } },
            { id: 's8', xp: 2500, reward: { gold: 2480, dust: 132, catalyst: 5 } }
        ],
        sponsorSeasonNodes: [
            { id: 'sp1', xp: 120, reward: { gold: 360, dust: 24, catalyst: 2 } },
            { id: 'sp2', xp: 500, reward: { gold: 740, dust: 54, catalyst: 3 } },
            { id: 'sp3', xp: 1120, reward: { gold: 1320, dust: 96, catalyst: 5 } },
            { id: 'sp4', xp: 1980, reward: { gold: 2180, dust: 150, catalyst: 8 } },
            { id: 'sp5', xp: 2500, reward: { gold: 2960, dust: 210, catalyst: 12 } }
        ],
        shopItems: [
            {
                id: 'dailySupply',
                free: true,
                cooldownHours: 20,
                title: { zh: '每日引火箱', en: 'Daily Spark Box' },
                reward: { gold: 240, dust: 18, catalyst: 1 }
            },
            {
                id: 'goldCrate',
                priceType: 'gold',
                basePrice: 1800,
                repeatGrowth: 0.24,
                title: { zh: '熔尘补给箱', en: 'Dust Crate' },
                reward: { dust: 62, catalyst: 3 }
            },
            {
                id: 'dustCrate',
                priceType: 'dust',
                basePrice: 120,
                repeatGrowth: 0.22,
                title: { zh: '催化反应箱', en: 'Catalyst Crate' },
                reward: { gold: 920, catalyst: 9 }
            },
            {
                id: 'sponsorVault',
                priceType: 'gold',
                basePrice: 5200,
                repeatGrowth: 0.28,
                requiresSponsor: true,
                title: { zh: '赞助棱镜库', en: 'Sponsor Prism Vault' },
                reward: { dust: 188, catalyst: 14 }
            }
        ],
        paymentOffers: [
            {
                id: 'starter',
                price: 1.0,
                name: { zh: '火种补给', en: 'Spark Starter' },
                reward: { gold: 1800, dust: 72, catalyst: 8 },
                permanent: { heatCap: 20, rareRate: 0.03 }
            },
            {
                id: 'accelerator',
                price: 2.99,
                name: { zh: '熔炉加速箱', en: 'Forge Booster' },
                reward: { gold: 6200, dust: 220, catalyst: 20 },
                permanent: { heatCap: 36, rareRate: 0.05, dustYield: 0.08 }
            },
            {
                id: 'rush',
                price: 3.99,
                name: { zh: '卡点突围包', en: 'Wall Breaker' },
                reward: { gold: 11800, dust: 420, catalyst: 38 },
                permanent: { heatCap: 52, rareRate: 0.08, dustYield: 0.12 }
            },
            {
                id: 'sovereign',
                price: 5.99,
                name: { zh: '棱镜统御包', en: 'Prism Dominion' },
                reward: { gold: 22800, dust: 760, catalyst: 68 },
                permanent: { heatCap: 80, rareRate: 0.12, dustYield: 0.18, catalystYield: 0.08 }
            },
            {
                id: 'nexus',
                price: 9.99,
                name: { zh: '棱核中枢包', en: 'Prism Nexus' },
                reward: { gold: 30800, dust: 1020, catalyst: 92 },
                permanent: { heatCap: 94, rareRate: 0.14, dustYield: 0.21, catalystYield: 0.11 }
            },
            {
                id: 'throne',
                price: 12.99,
                name: { zh: '创世砧核', en: 'Genesis Anvil' },
                reward: { gold: 38800, dust: 1280, catalyst: 120 },
                permanent: { heatCap: 110, rareRate: 0.16, dustYield: 0.24, catalystYield: 0.14 }
            }
        ],
        sponsorTiers: [
            { id: 'locked', threshold: 0, title: { zh: '未激活', en: 'Locked' }, heatCapBonus: 0, rareRateBonus: 0, dustYieldBonus: 0, catalystYieldBonus: 0, contractSlotBonus: 0 },
            { id: 'spark', threshold: 1, title: { zh: '火种赞助', en: 'Spark Sponsor' }, heatCapBonus: 20, rareRateBonus: 0.03, dustYieldBonus: 0.08, catalystYieldBonus: 0.04, contractSlotBonus: 1 },
            { id: 'relay', threshold: 5, title: { zh: '继电赞助', en: 'Relay Sponsor' }, heatCapBonus: 42, rareRateBonus: 0.06, dustYieldBonus: 0.14, catalystYieldBonus: 0.08, contractSlotBonus: 1 },
            { id: 'dominion', threshold: 12, title: { zh: '统御赞助', en: 'Dominion Sponsor' }, heatCapBonus: 72, rareRateBonus: 0.1, dustYieldBonus: 0.22, catalystYieldBonus: 0.14, contractSlotBonus: 2 },
            { id: 'genesis', threshold: 25, title: { zh: '创世赞助', en: 'Genesis Sponsor' }, heatCapBonus: 110, rareRateBonus: 0.15, dustYieldBonus: 0.32, catalystYieldBonus: 0.22, contractSlotBonus: 2 }
        ],
        paymentMilestones: [
            { id: 'tier1', threshold: 1, reward: { gold: 1200, dust: 60, catalyst: 6 } },
            { id: 'tier2', threshold: 5, reward: { gold: 4200, dust: 180, catalyst: 16 } },
            { id: 'tier3', threshold: 12, reward: { gold: 11800, dust: 460, catalyst: 42 } },
            { id: 'tier4', threshold: 25, reward: { gold: 25800, dust: 980, catalyst: 92 } }
        ],
        baseSave: {
            gold: 2400,
            dust: 80,
            catalyst: 24,
            seasonXp: 0,
            contractIndex: 0,
            bestContractIndex: 0,
            heat: 120,
            selectedSigils: ['emberCore', 'tideLoop', 'voltRelay'],
            sigilLevels: {
                emberCore: 1,
                tideLoop: 1,
                voltRelay: 0,
                voidMirror: 0,
                prismCrown: 0
            },
            sigilShards: {
                emberCore: 20,
                tideLoop: 20,
                voltRelay: 12,
                voidMirror: 8,
                prismCrown: 0
            },
            workshopLevels: {
                heatCap: 0,
                heatRegen: 0,
                rareRate: 0,
                dustYield: 0,
                catalystRefine: 0
            },
            missionClaimed: [],
            seasonClaimed: [],
            shopPurchases: {},
            payment: {
                minerId: '',
                purchaseCount: 0,
                totalSpent: 0,
                passUnlocked: false,
                milestoneClaims: {},
                claimedOrders: {},
                pendingClaims: {},
                premiumSeasonClaims: {},
                verifiedTxids: []
            }
        }
    };
}());
