(function () {
    window.GENESIS_DRONE_SQUAD_CONFIG = {
        meta: {
            id: 'drone-squad',
            title: { zh: '无人机编队', en: 'Drone Squad' },
            subtitle: { zh: '自动射击、拖拽走位、机库成长', en: 'Auto-fire, dodge, and hangar growth' }
        },
        tabs: [
            { id: 'sortie', label: { zh: '出击', en: 'Sortie' } },
            { id: 'hangar', label: { zh: '机库', en: 'Hangar' } },
            { id: 'blueprints', label: { zh: '蓝图', en: 'Blueprints' } },
            { id: 'missions', label: { zh: '任务', en: 'Missions' } },
            { id: 'season', label: { zh: '赛季', en: 'Season' } },
            { id: 'shop', label: { zh: '商店', en: 'Shop' } }
        ],
        currencies: [
            { id: 'credits', label: { zh: '金币', en: 'Credits' } },
            { id: 'alloy', label: { zh: '合金', en: 'Alloy' } },
            { id: 'coreChips', label: { zh: '核芯', en: 'Core Chips' } },
            { id: 'seasonXp', label: { zh: '赛季经验', en: 'Season XP' } }
        ],
        battle: {
            sessionSeconds: 90,
            eliteSpawnSeconds: [24, 48, 68],
            upgradePickSeconds: [22, 52],
            bossSpawnSecond: 78,
            freeSortiesPerDay: 3,
            sortieCostByChapter: {
                chapter1: 600,
                chapter2: 900,
                chapter3: 1400
            },
            reviveChipDailyGrant: 1,
            waveScaling: {
                hpPerWave: 0.18,
                damagePerWave: 0.12,
                bossHpScalar: 4.6,
                bossDamageScalar: 2.4
            }
        },
        chassis: [
            {
                id: 'pulseFrame',
                name: { zh: '脉冲机', en: 'Pulse Frame' },
                role: { zh: '均衡输出', en: 'Balanced output' },
                stats: { attack: 32, fireRate: 1, maxShield: 140, speed: 1 },
                unlockStage: '1-1'
            },
            {
                id: 'prismFrame',
                name: { zh: '裂光机', en: 'Prism Frame' },
                role: { zh: '高射速', en: 'Rapid fire' },
                stats: { attack: 26, fireRate: 1.28, maxShield: 118, speed: 1.06 },
                unlockStage: '1-3'
            },
            {
                id: 'bulwarkFrame',
                name: { zh: '堡垒机', en: 'Bulwark Frame' },
                role: { zh: '高容错', en: 'High survival' },
                stats: { attack: 28, fireRate: 0.92, maxShield: 184, speed: 0.94 },
                unlockStage: '2-2'
            }
        ],
        wingmen: [
            {
                id: 'interceptorWing',
                name: { zh: '拦截翼', en: 'Interceptor Wing' },
                role: { zh: '补足清怪', en: 'Wave clear assist' },
                unlockStage: '1-1'
            },
            {
                id: 'pierceWing',
                name: { zh: '穿甲翼', en: 'Pierce Wing' },
                role: { zh: '精英穿透', en: 'Elite piercing' },
                unlockStage: '1-3'
            },
            {
                id: 'magnetWing',
                name: { zh: '磁吸翼', en: 'Magnet Wing' },
                role: { zh: '吸附掉落', en: 'Pickup support' },
                unlockStage: '2-1'
            },
            {
                id: 'aegisWing',
                name: { zh: '护盾翼', en: 'Aegis Wing' },
                role: { zh: '护盾修复', en: 'Shield restore' },
                unlockStage: '2-3'
            }
        ],
        moduleRarities: [
            { id: 'common', label: { zh: '普通', en: 'Common' }, weight: 78 },
            { id: 'rare', label: { zh: '稀有', en: 'Rare' }, weight: 18 },
            { id: 'epic', label: { zh: '史诗', en: 'Epic' }, weight: 3.4 },
            { id: 'legend', label: { zh: '传说', en: 'Legend' }, weight: 0.6 }
        ],
        modules: [
            {
                id: 'burstCore',
                slot: 'core',
                name: { zh: '爆裂核心', en: 'Burst Core' },
                effect: { zh: '提升暴击和短时爆发', en: 'Improves crit and burst windows' }
            },
            {
                id: 'pierceArray',
                slot: 'weapon',
                name: { zh: '穿透阵列', en: 'Pierce Array' },
                effect: { zh: '提升穿透和精英击杀效率', en: 'Improves pierce and elite clear speed' }
            },
            {
                id: 'aegisShell',
                slot: 'shield',
                name: { zh: '神盾外壳', en: 'Aegis Shell' },
                effect: { zh: '提升护盾与恢复', en: 'Improves shield size and recovery' }
            },
            {
                id: 'hunterNode',
                slot: 'boss',
                name: { zh: '猎首节点', en: 'Hunter Node' },
                effect: { zh: '提升 Boss 增伤', en: 'Increases boss damage' }
            }
        ],
        chapters: [
            { id: '1-1', name: { zh: '港区试飞', en: 'Dock Trial' }, recommended: 220, reward: { credits: 180, alloy: 10, coreChips: 0, seasonXp: 18 }, chapter: 1 },
            { id: '1-2', name: { zh: '低轨巡航', en: 'Low Orbit Run' }, recommended: 380, reward: { credits: 250, alloy: 14, coreChips: 0, seasonXp: 22 }, chapter: 1 },
            { id: '1-3', name: { zh: '裂缝截击', en: 'Rift Intercept' }, recommended: 620, reward: { credits: 340, alloy: 18, coreChips: 1, seasonXp: 28 }, chapter: 1 },
            { id: '2-1', name: { zh: '废舰残带', en: 'Wreck Belt' }, recommended: 980, reward: { credits: 470, alloy: 24, coreChips: 1, seasonXp: 36 }, chapter: 2 },
            { id: '2-2', name: { zh: '雾化前哨', en: 'Mist Outpost' }, recommended: 1500, reward: { credits: 620, alloy: 30, coreChips: 2, seasonXp: 42 }, chapter: 2 },
            { id: '2-3', name: { zh: '磁暴走廊', en: 'Storm Corridor' }, recommended: 2200, reward: { credits: 820, alloy: 38, coreChips: 2, seasonXp: 50 }, chapter: 2 },
            { id: '3-1', name: { zh: '裂星带', en: 'Star Fracture' }, recommended: 3200, reward: { credits: 1080, alloy: 48, coreChips: 3, seasonXp: 62 }, chapter: 3 },
            { id: '3-2', name: { zh: '深域舰坟', en: 'Deep Graveyard' }, recommended: 4500, reward: { credits: 1380, alloy: 60, coreChips: 4, seasonXp: 76 }, chapter: 3 },
            { id: '3-3', name: { zh: '终端母巢', en: 'Terminal Hive' }, recommended: 6200, reward: { credits: 1760, alloy: 74, coreChips: 5, seasonXp: 92 }, chapter: 3 }
        ],
        upgradeCurves: {
            chassisCreditBase: 80,
            chassisCreditGrowth: 1.18,
            wingmanCreditBase: 110,
            wingmanCreditGrowth: 1.2,
            moduleCreditBase: 140,
            moduleCreditGrowth: 1.22
        },
        starUpgrades: [
            { from: 1, to: 2, shards: 20, alloy: 30, credits: 900 },
            { from: 2, to: 3, shards: 50, alloy: 80, credits: 2200 },
            { from: 3, to: 4, shards: 120, alloy: 180, credits: 5200 },
            { from: 4, to: 5, shards: 250, alloy: 420, credits: 12000 }
        ],
        research: [
            {
                id: 'weaponSync',
                name: { zh: '武器同步', en: 'Weapon Sync' },
                desc: { zh: '永久提升全队基础伤害。', en: 'Permanently boosts squad base damage.' },
                maxLevel: 15,
                baseCost: 6,
                growth: 1.42
            },
            {
                id: 'shieldVolume',
                name: { zh: '护盾扩容', en: 'Shield Volume' },
                desc: { zh: '永久提升护盾上限。', en: 'Permanently increases max shield.' },
                maxLevel: 15,
                baseCost: 6,
                growth: 1.42
            },
            {
                id: 'energyLoop',
                name: { zh: '能量回路', en: 'Energy Loop' },
                desc: { zh: '永久提升技能充能。', en: 'Permanently improves skill charge speed.' },
                maxLevel: 12,
                baseCost: 8,
                growth: 1.45
            },
            {
                id: 'magnetField',
                name: { zh: '拾取磁场', en: 'Magnet Field' },
                desc: { zh: '永久提升掉落吸附半径。', en: 'Permanently increases pickup radius.' },
                maxLevel: 10,
                baseCost: 5,
                growth: 1.36
            },
            {
                id: 'bountyProtocol',
                name: { zh: '赏金协议', en: 'Bounty Protocol' },
                desc: { zh: '永久提升章节金币与合金奖励。', en: 'Permanently increases stage credits and alloy rewards.' },
                maxLevel: 12,
                baseCost: 8,
                growth: 1.48
            }
        ],
        moduleCrafting: {
            dailyFree: 1,
            baseCreditCost: 300,
            baseAlloyCost: 8,
            surgeAfterCrafts: 5,
            surgeCreditCost: 450,
            surgeAlloyCost: 12,
            rarePity: 10,
            epicPity: 30
        },
        missions: [
            { id: 'm1', title: { zh: '出击 5 次', en: 'Sortie 5 Times' }, target: 5, reward: { credits: 240, alloy: 12 } },
            { id: 'm2', title: { zh: '击败 3 个精英', en: 'Defeat 3 Elites' }, target: 3, reward: { credits: 320, alloy: 14 } },
            { id: 'm3', title: { zh: '解锁第 2 个翼机位', en: 'Unlock Wing Slot 2' }, target: 1, reward: { credits: 420, alloy: 18, coreChips: 1 } },
            { id: 'm4', title: { zh: '通关 1-3', en: 'Clear 1-3' }, target: 3, reward: { credits: 560, alloy: 24, coreChips: 1 } },
            { id: 'm5', title: { zh: '主机升到 Lv10', en: 'Reach Chassis Lv10' }, target: 10, reward: { credits: 760, alloy: 28 } },
            { id: 'm6', title: { zh: '制造 2 个稀有模组', en: 'Craft 2 Rare Modules' }, target: 2, reward: { credits: 980, alloy: 34, coreChips: 2 } },
            { id: 'm7', title: { zh: '通关 2-2', en: 'Clear 2-2' }, target: 5, reward: { credits: 1260, alloy: 42, coreChips: 2 } },
            { id: 'm8', title: { zh: '3 台机体达到 3★', en: 'Reach 3 Star on 3 Units' }, target: 3, reward: { credits: 1680, alloy: 56, coreChips: 3 } },
            { id: 'm9', title: { zh: '击败首个章节 Boss', en: 'Defeat First Chapter Boss' }, target: 1, reward: { credits: 2120, alloy: 68, coreChips: 4 } },
            { id: 'm10', title: { zh: '通关 3-3', en: 'Clear 3-3' }, target: 9, reward: { credits: 2860, alloy: 88, coreChips: 6, seasonXp: 120 } }
        ],
        seasonFreeTrack: [
            { id: 's1', xp: 80, reward: { credits: 180, alloy: 10 } },
            { id: 's2', xp: 180, reward: { credits: 240, alloy: 12 } },
            { id: 's3', xp: 320, reward: { credits: 320, alloy: 16, coreChips: 1 } },
            { id: 's4', xp: 500, reward: { credits: 420, alloy: 18 } },
            { id: 's5', xp: 720, reward: { credits: 560, alloy: 24, coreChips: 1 } },
            { id: 's6', xp: 980, reward: { credits: 720, alloy: 28 } },
            { id: 's7', xp: 1280, reward: { credits: 940, alloy: 34, coreChips: 2 } },
            { id: 's8', xp: 1620, reward: { credits: 1180, alloy: 42 } }
        ],
        seasonPremiumTrack: [
            { id: 'sp1', xp: 80, reward: { credits: 420, alloy: 24, reviveChips: 1 } },
            { id: 'sp2', xp: 320, reward: { credits: 820, alloy: 46, coreChips: 2 } },
            { id: 'sp3', xp: 720, reward: { credits: 1380, alloy: 76, chassisShards: 18 } },
            { id: 'sp4', xp: 1280, reward: { credits: 2120, alloy: 124, coreChips: 4 } },
            { id: 'sp5', xp: 1620, reward: { credits: 3180, alloy: 188, epicModuleCrates: 1 } }
        ],
        shopItems: [
            {
                id: 'dailySupply',
                title: { zh: '每日免费补给', en: 'Daily Supply' },
                price: 0,
                reward: { credits: 180, alloy: 8, seasonXp: 18 },
                freeCooldownHours: 20
            },
            {
                id: 'creditCrate',
                title: { zh: '金币补给箱', en: 'Credit Crate' },
                price: 460,
                reward: { credits: 580, alloy: 0 }
            },
            {
                id: 'alloyCrate',
                title: { zh: '合金补给箱', en: 'Alloy Crate' },
                price: 880,
                reward: { credits: 0, alloy: 22 }
            },
            {
                id: 'chipRelay',
                title: { zh: '核芯中继箱', en: 'Chip Relay' },
                price: 1680,
                reward: { coreChips: 6, alloy: 18 }
            },
            {
                id: 'sponsorVault',
                title: { zh: '赞助军械库', en: 'Sponsor Vault' },
                price: 2980,
                reward: { credits: 1800, alloy: 54, coreChips: 8, reviveChips: 1 }
            }
        ],
        paymentOffers: [
            {
                id: 'starter',
                price: 6,
                name: { zh: '新手启航包', en: 'Starter Flight Pack' },
                reward: { credits: 2800, alloy: 120, coreChips: 6, reviveChips: 1, chassisShards: 24, wingmanShards: 20 },
                permanent: { attackBoost: 0.04, shieldBoost: 0.03 }
            },
            {
                id: 'accelerator',
                price: 15,
                name: { zh: '加速跃迁包', en: 'Accelerator Pack' },
                reward: { credits: 7600, alloy: 360, coreChips: 18, reviveChips: 2, wingmanShards: 56 },
                permanent: { attackBoost: 0.08, alloyYield: 0.08 }
            },
            {
                id: 'rush',
                price: 30,
                name: { zh: '突进突破包', en: 'Rush Break Pack' },
                reward: { credits: 16200, alloy: 760, coreChips: 42, reviveChips: 4, epicModuleCrates: 1 },
                permanent: { bossDamage: 0.12, attackBoost: 0.12 }
            },
            {
                id: 'sovereign',
                price: 68,
                name: { zh: '统御军械包', en: 'Sovereign Arsenal Pack' },
                reward: { credits: 36800, alloy: 1620, coreChips: 96, reviveChips: 8, epicModuleCrates: 2, wingmanShards: 160 },
                permanent: { bossDamage: 0.2, shieldBoost: 0.16, alloyYield: 0.12 }
            },
            {
                id: 'nexus',
                price: 128,
                name: { zh: '枢纽舰队包', en: 'Nexus Fleet Pack' },
                reward: { credits: 78000, alloy: 3600, coreChips: 220, reviveChips: 16, legendModuleCrates: 1, chassisShards: 260, wingmanShards: 260 },
                permanent: { attackBoost: 0.28, bossDamage: 0.3, shieldBoost: 0.22, alloyYield: 0.18 }
            }
        ],
        sponsorTiers: [
            { id: 'locked', threshold: 0, title: { zh: '未激活', en: 'Locked' }, dailyFreeSorties: 0, bossChipBonus: 0, alloyYieldBonus: 0, epicPityBonus: 0 },
            { id: 'spark', threshold: 1, title: { zh: '火花赞助', en: 'Spark Sponsor' }, dailyFreeSorties: 1, bossChipBonus: 0, alloyYieldBonus: 0.05, epicPityBonus: 0 },
            { id: 'relay', threshold: 4, title: { zh: '中继赞助', en: 'Relay Sponsor' }, dailyFreeSorties: 1, bossChipBonus: 0.1, alloyYieldBonus: 0.08, epicPityBonus: 0.08 },
            { id: 'dominion', threshold: 10, title: { zh: '统御赞助', en: 'Dominion Sponsor' }, dailyFreeSorties: 2, bossChipBonus: 0.16, alloyYieldBonus: 0.15, epicPityBonus: 0.12 },
            { id: 'genesis', threshold: 20, title: { zh: '创世赞助', en: 'Genesis Sponsor' }, dailyFreeSorties: 2, bossChipBonus: 0.24, alloyYieldBonus: 0.22, epicPityBonus: 0.2 }
        ],
        baseSave: {
            tab: 'sortie',
            selectedChapterId: '1-1',
            selectedChassisId: 'pulseFrame',
            selectedWingmen: ['interceptorWing', ''],
            selectedModules: {
                core: '',
                weapon: '',
                shield: '',
                boss: ''
            },
            credits: 1200,
            alloy: 60,
            coreChips: 4,
            seasonXp: 0,
            reviveChips: 1,
            unlockedChapterIndex: 0,
            clearedChapters: [],
            chassisLevels: {},
            chassisStars: {},
            wingmanLevels: {},
            wingmanStars: {},
            moduleLevels: {},
            moduleInventory: [],
            shardInventory: {},
            researchLevels: {},
            missionClaimed: [],
            seasonClaimed: [],
            dailySupplyAt: 0,
            freeSortieDayKey: '',
            freeSortiesUsedToday: 0,
            payment: {
                minerId: '',
                claimedOrders: {},
                pendingClaims: {},
                verifiedTxids: [],
                purchaseCount: 0,
                totalSpent: 0,
                lastPayAddress: '',
                permanent: { attackBoost: 0, shieldBoost: 0, bossDamage: 0, alloyYield: 0 },
                passUnlocked: false
            }
        }
    };
}());
