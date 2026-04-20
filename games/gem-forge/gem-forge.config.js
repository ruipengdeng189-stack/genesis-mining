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
            { id: 'volt', name: { zh: '雷涌', en: 'Volt' }, accent: '#ffe56a' },
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
                effect: { zh: '提高热量恢复，并降低批量熔炼的压力。', en: 'Improves heat recovery and batch-forge comfort.' }
            },
            {
                id: 'voltRelay',
                slot: 'resonance',
                family: 'volt',
                rarity: 'epic',
                name: { zh: '雷涌继电', en: 'Volt Relay' },
                shardUnlock: 26,
                baseScore: 102,
                shardCostBase: 22,
                shardCostStep: 10,
                goldCostBase: 420,
                goldCostStep: 180,
                effect: { zh: '提高双倍产出与高阶跃升触发率。', en: 'Raises double-output and tier-jump odds.' }
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
            { id: '1-1', name: { zh: '暖炉启封', en: 'Warm Kiln' }, recommended: 180, reward: { gold: 160, dust: 14, catalyst: 2, seasonXp: 24 }, focus: ['ember', 'tide'] },
            { id: '1-2', name: { zh: '合金试压', en: 'Alloy Pressure' }, recommended: 360, reward: { gold: 230, dust: 18, catalyst: 2, seasonXp: 30 }, focus: ['tide', 'volt'] },
            { id: '1-3', name: { zh: '棱镜试炼', en: 'Prism Trial' }, recommended: 640, reward: { gold: 320, dust: 24, catalyst: 3, seasonXp: 40 }, focus: ['volt', 'ember'] },
            { id: '2-1', name: { zh: '晶压炉室', en: 'Crystal Press' }, recommended: 1080, reward: { gold: 440, dust: 34, catalyst: 4, seasonXp: 54 }, focus: ['ember', 'void'] },
            { id: '2-2', name: { zh: '余烬反应堆', en: 'Ember Reactor' }, recommended: 1620, reward: { gold: 620, dust: 44, catalyst: 5, seasonXp: 70 }, focus: ['ember', 'volt'] },
            { id: '2-3', name: { zh: '共鸣熔芯', en: 'Resonance Core' }, recommended: 2360, reward: { gold: 860, dust: 58, catalyst: 7, seasonXp: 92 }, focus: ['tide', 'void'] },
            { id: '3-1', name: { zh: '虚空镜厅', en: 'Void Mirror' }, recommended: 3380, reward: { gold: 1160, dust: 78, catalyst: 9, seasonXp: 118 }, focus: ['void', 'volt'] },
            { id: '3-2', name: { zh: '符印之心', en: 'Sigil Heart' }, recommended: 4720, reward: { gold: 1520, dust: 102, catalyst: 12, seasonXp: 152 }, focus: ['void', 'ember'] },
            { id: '3-3', name: { zh: '创世砧核', en: 'Genesis Anvil' }, recommended: 6480, reward: { gold: 1980, dust: 134, catalyst: 15, seasonXp: 192 }, focus: ['void', 'tide'] }
        ],
        workshop: [
            {
                id: 'heatCap',
                name: { zh: '热量上限', en: 'Heat Cap' },
                maxLevel: 12,
                baseCostGold: 320,
                costGoldStep: 180,
                baseCostDust: 2,
                costDustStep: 8,
                effectBase: 24,
                effectStep: 14
            },
            {
                id: 'heatRegen',
                name: { zh: '热量恢复', en: 'Heat Regen' },
                maxLevel: 12,
                baseCostGold: 300,
                costGoldStep: 160,
                baseCostDust: 2,
                costDustStep: 8,
                effectBase: 0.22,
                effectStep: 0.16
            },
            {
                id: 'rareRate',
                name: { zh: '稀有率强化', en: 'Rare Rate' },
                maxLevel: 10,
                baseCostGold: 460,
                costGoldStep: 240,
                baseCostDust: 14,
                costDustStep: 12,
                effectBase: 0.018,
                effectStep: 0.012
            },
            {
                id: 'dustYield',
                name: { zh: '熔尘回收', en: 'Dust Yield' },
                maxLevel: 10,
                baseCostGold: 480,
                costGoldStep: 250,
                baseCostDust: 16,
                costDustStep: 12,
                effectBase: 0.1,
                effectStep: 0.06
            },
            {
                id: 'catalystRefine',
                name: { zh: '催化提炼', en: 'Catalyst Refine' },
                maxLevel: 8,
                baseCostGold: 680,
                costGoldStep: 320,
                baseCostDust: 26,
                costDustStep: 16,
                effectBase: 0.06,
                effectStep: 0.05
            }
        ],
        forgeBalance: {
            heatMax: 120,
            batchSmeltHeatCost: 14,
            batchSmeltGoldGain: 12,
            batchSmeltDustGain: 1,
            pityTier3Need: 22,
            pityTier4Need: 76,
            dropRates: {
                tier1: 0.8,
                tier2: 0.17,
                tier3: 0.03
            }
        },
        forgeEconomy: {
            sigilUnlockGoldBase: 320,
            sigilUnlockGoldPerScore: 3.2,
            sigilUnlockGoldPerShard: 18,
            fuseCosts: {
                1: { gold: 130, catalyst: 0 },
                2: { gold: 320, catalyst: 0 },
                3: { gold: 780, catalyst: 3 },
                4: { gold: 2080, catalyst: 10 }
            },
            awakenCosts: {
                3: { gold: 520, dust: 36, catalyst: 2 },
                4: { gold: 1380, dust: 108, catalyst: 8 },
                5: { gold: 3480, dust: 300, catalyst: 18 }
            },
            goldReserveBase: 980,
            goldReserveStep: 560,
            dustReserveBase: 110,
            dustReserveStep: 68,
            failRewardGoldFactor: 0.46,
            failRewardDustFactor: 0.52,
            failRewardCatalystFactor: 0.28,
            failRewardXpFactor: 0.42,
            shopProgressFactorStep: 0.08,
            freeShardFlow: {
                contractSuccessBase: 5,
                contractSuccessStep: 1,
                contractFailBase: 2,
                contractFailStep: 1,
                dailySupply: 4,
                shopGoldCrate: 6,
                shopDustCrate: 4,
                shopSponsorVault: 6
            }
        },
        missions: [
            { id: 'm1', title: { zh: '开炉 10 次', en: 'Forge 10 Times' }, target: 10, reward: { gold: 180, dust: 12 } },
            { id: 'm2', title: { zh: '完成 3 次合成', en: 'Fuse 3 Times' }, target: 3, reward: { gold: 220, dust: 14 } },
            { id: 'm3', title: { zh: '符印升级 2 次', en: 'Upgrade 2 Sigils' }, target: 2, reward: { gold: 280, dust: 16, catalyst: 2 } },
            { id: 'm4', title: { zh: '推进至 1-3', en: 'Reach 1-3' }, target: 3, reward: { gold: 360, dust: 24, catalyst: 2 } },
            { id: 'm5', title: { zh: '工坊升级 5 次', en: 'Upgrade Workshop 5 Times' }, target: 5, reward: { gold: 460, dust: 28 } },
            { id: 'm6', title: { zh: '获得 1 颗 T3 宝石', en: 'Obtain 1 T3 Gem' }, target: 1, reward: { gold: 600, dust: 34, catalyst: 3 } },
            { id: 'm7', title: { zh: '推进至 2-2', en: 'Reach 2-2' }, target: 5, reward: { gold: 820, dust: 50, catalyst: 4 } },
            { id: 'm8', title: { zh: '完成 20 次合成', en: 'Fuse 20 Times' }, target: 20, reward: { gold: 1080, dust: 70, catalyst: 5 } },
            { id: 'm9', title: { zh: '获得 3 颗 T4 宝石', en: 'Obtain 3 T4 Gems' }, target: 3, reward: { gold: 1480, dust: 96, catalyst: 8 } },
            { id: 'm10', title: { zh: '推进至 3-3', en: 'Reach 3-3' }, target: 9, reward: { gold: 2100, dust: 132, catalyst: 12, seasonXp: 120 } }
        ],
        seasonNodes: [
            { id: 's1', xp: 120, reward: { gold: 220, dust: 14 } },
            { id: 's2', xp: 280, reward: { gold: 320, dust: 18 } },
            { id: 's3', xp: 500, reward: { gold: 480, dust: 28, catalyst: 2 } },
            { id: 's4', xp: 780, reward: { gold: 660, dust: 36 } },
            { id: 's5', xp: 1120, reward: { gold: 920, dust: 48, catalyst: 3 } },
            { id: 's6', xp: 1520, reward: { gold: 1180, dust: 62 } },
            { id: 's7', xp: 1980, reward: { gold: 1500, dust: 80, catalyst: 4 } },
            { id: 's8', xp: 2500, reward: { gold: 1880, dust: 104, catalyst: 5 } }
        ],
        sponsorSeasonNodes: [
            { id: 'sp1', xp: 120, reward: { gold: 460, dust: 30, catalyst: 2 } },
            { id: 'sp2', xp: 500, reward: { gold: 980, dust: 72, catalyst: 4 } },
            { id: 'sp3', xp: 1120, reward: { gold: 1760, dust: 128, catalyst: 6 } },
            { id: 'sp4', xp: 1980, reward: { gold: 2860, dust: 210, catalyst: 10 } },
            { id: 'sp5', xp: 2500, reward: { gold: 4180, dust: 320, catalyst: 16 } }
        ],
        shopItems: [
            {
                id: 'dailySupply',
                free: true,
                cooldownHours: 24,
                title: { zh: '每日引火箱', en: 'Daily Spark Box' },
                reward: { gold: 180, dust: 10, catalyst: 1 }
            },
            {
                id: 'goldCrate',
                priceType: 'gold',
                basePrice: 3600,
                repeatGrowth: 0.34,
                title: { zh: '熔尘补给箱', en: 'Dust Crate' },
                reward: { dust: 72, catalyst: 3 }
            },
            {
                id: 'dustCrate',
                priceType: 'dust',
                basePrice: 220,
                repeatGrowth: 0.32,
                title: { zh: '催化反应箱', en: 'Catalyst Crate' },
                reward: { gold: 1150, catalyst: 10 }
            },
            {
                id: 'sponsorVault',
                priceType: 'gold',
                basePrice: 10800,
                repeatGrowth: 0.42,
                requiresSponsor: true,
                title: { zh: '赞助棱镜库', en: 'Sponsor Prism Vault' },
                reward: { dust: 260, catalyst: 18 }
            }
        ],
        paymentOffers: [
            {
                id: 'starter',
                price: 1.0,
                name: { zh: '火种补给', en: 'Spark Starter' },
                reward: { gold: 2400, dust: 90, catalyst: 10 },
                focusShards: 16,
                permanent: { heatCap: 24, rareRate: 0.035, contractStability: 90 }
            },
            {
                id: 'accelerator',
                price: 2.99,
                name: { zh: '熔炉加速箱', en: 'Forge Booster' },
                reward: { gold: 8800, dust: 300, catalyst: 26 },
                focusShards: 30,
                permanent: { heatCap: 42, rareRate: 0.06, dustYield: 0.1, contractStability: 180 }
            },
            {
                id: 'rush',
                price: 3.99,
                name: { zh: '卡点突围包', en: 'Wall Breaker' },
                reward: { gold: 15800, dust: 520, catalyst: 46 },
                focusShards: 46,
                permanent: { heatCap: 60, rareRate: 0.09, dustYield: 0.14, catalystYield: 0.05, contractStability: 300 }
            },
            {
                id: 'sovereign',
                price: 5.99,
                name: { zh: '棱镜统御包', en: 'Prism Dominion' },
                reward: { gold: 28600, dust: 940, catalyst: 82 },
                focusShards: 66,
                permanent: { heatCap: 88, rareRate: 0.13, dustYield: 0.2, catalystYield: 0.09, contractStability: 460 }
            },
            {
                id: 'nexus',
                price: 9.99,
                name: { zh: '棱核中枢包', en: 'Prism Nexus' },
                reward: { gold: 43800, dust: 1460, catalyst: 124 },
                focusShards: 92,
                permanent: { heatCap: 108, rareRate: 0.17, dustYield: 0.26, catalystYield: 0.13, contractStability: 680 }
            },
            {
                id: 'throne',
                price: 12.99,
                name: { zh: '创世砧核', en: 'Genesis Anvil' },
                reward: { gold: 56800, dust: 1960, catalyst: 168 },
                focusShards: 124,
                permanent: { heatCap: 132, rareRate: 0.2, dustYield: 0.32, catalystYield: 0.18, contractStability: 900 }
            }
        ],
        sponsorTiers: [
            { id: 'locked', threshold: 0, title: { zh: '未激活', en: 'Locked' }, heatCapBonus: 0, rareRateBonus: 0, dustYieldBonus: 0, catalystYieldBonus: 0, contractStabilityBonus: 0, contractSlotBonus: 0 },
            { id: 'spark', threshold: 1, title: { zh: '火种赞助', en: 'Spark Sponsor' }, heatCapBonus: 24, rareRateBonus: 0.035, dustYieldBonus: 0.1, catalystYieldBonus: 0.05, contractStabilityBonus: 120, contractSlotBonus: 1 },
            { id: 'relay', threshold: 4, title: { zh: '继电赞助', en: 'Relay Sponsor' }, heatCapBonus: 52, rareRateBonus: 0.075, dustYieldBonus: 0.18, catalystYieldBonus: 0.1, contractStabilityBonus: 260, contractSlotBonus: 1 },
            { id: 'dominion', threshold: 10, title: { zh: '统御赞助', en: 'Dominion Sponsor' }, heatCapBonus: 90, rareRateBonus: 0.12, dustYieldBonus: 0.28, catalystYieldBonus: 0.16, contractStabilityBonus: 440, contractSlotBonus: 2 },
            { id: 'genesis', threshold: 20, title: { zh: '创世赞助', en: 'Genesis Sponsor' }, heatCapBonus: 136, rareRateBonus: 0.18, dustYieldBonus: 0.4, catalystYieldBonus: 0.24, contractStabilityBonus: 700, contractSlotBonus: 2 }
        ],
        paymentMilestones: [
            {
                id: 'tier1',
                threshold: 1,
                reward: { gold: 1500, dust: 72, catalyst: 8 },
                permanent: { heatCap: 10, rareRate: 0.012, contractStability: 40 }
            },
            {
                id: 'tier2',
                threshold: 4,
                reward: { gold: 5600, dust: 240, catalyst: 20 },
                permanent: { heatCap: 16, dustYield: 0.04, catalystYield: 0.025, contractStability: 70 }
            },
            {
                id: 'tier3',
                threshold: 10,
                reward: { gold: 14800, dust: 560, catalyst: 48 },
                permanent: { heatCap: 22, rareRate: 0.024, dustYield: 0.05, contractStability: 110 }
            },
            {
                id: 'tier4',
                threshold: 20,
                reward: { gold: 33800, dust: 1260, catalyst: 112 },
                permanent: { heatCap: 30, rareRate: 0.036, dustYield: 0.08, catalystYield: 0.05, contractStability: 160 }
            }
        ],
        baseSave: {
            gold: 2200,
            dust: 72,
            catalyst: 22,
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
