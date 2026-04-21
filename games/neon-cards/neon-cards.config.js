(function () {
    window.GENESIS_NEON_CARDS_CONFIG = {
        meta: {
            id: 'neon-cards',
            title: { zh: '霓虹卡牌', en: 'Neon Cards' },
            subtitle: { zh: '三路实时卡战，兼顾卡组成长与赛季推进', en: 'Tri-lane live card battle with deck growth and season progression' }
        },
        tabs: [
            { id: 'clash', label: { zh: '对战', en: 'Clash' } },
            { id: 'deck', label: { zh: '卡组', en: 'Deck' } },
            { id: 'lab', label: { zh: '研究', en: 'Lab' } },
            { id: 'missions', label: { zh: '任务', en: 'Missions' } },
            { id: 'season', label: { zh: '赛季', en: 'Season' } },
            { id: 'shop', label: { zh: '商店', en: 'Shop' } }
        ],
        currencies: [
            { id: 'credits', label: { zh: '金币', en: 'Credits' } },
            { id: 'tactCores', label: { zh: '战术核心', en: 'Tact Cores' } },
            { id: 'cipherChips', label: { zh: '芯片', en: 'Cipher Chips' } },
            { id: 'seasonXp', label: { zh: '赛季经验', en: 'Season XP' } }
        ],
        battle: {
            sessionSeconds: 72,
            freeClashesPerDay: 3,
            entryCostByChapter: {
                chapter1: 700,
                chapter2: 1050,
                chapter3: 1680,
                chapter4: 2520
            }
        },
        upgradeCurves: {
            leaderCreditBase: 120,
            leaderCreditGrowth: 1.2,
            unitCreditBase: 70,
            unitCreditGrowth: 1.18,
            tacticCreditBase: 95,
            tacticCreditGrowth: 1.19
        },
        starUpgrades: [
            { from: 1, to: 2, fragments: 20, tactCores: 18, credits: 800, cipherChips: 0 },
            { from: 2, to: 3, fragments: 50, tactCores: 42, credits: 1800, cipherChips: 0 },
            { from: 3, to: 4, fragments: 120, tactCores: 90, credits: 4200, cipherChips: 2 },
            { from: 4, to: 5, fragments: 260, tactCores: 180, credits: 9800, cipherChips: 6 }
        ],
        leaders: [
            {
                id: 'marshalZero',
                name: { zh: '零式统帅', en: 'Marshal Zero' },
                role: { zh: '均衡推进', en: 'Balanced push' },
                skill: { zh: '短时间为三路超频，提高攻击与攻速。', en: 'Temporarily overclocks all lanes for more attack and fire rate.' },
                stats: { power: 96, attack: 20, hp: 160, charge: 1 },
                unlockStage: '1-1'
            },
            {
                id: 'aegisNova',
                name: { zh: '神盾星核', en: 'Aegis Nova' },
                role: { zh: '护盾续航', en: 'Shield sustain' },
                skill: { zh: '为全场友军补充护盾，并强化前排生存。', en: 'Adds shields to your board and improves frontline survival.' },
                stats: { power: 104, attack: 16, hp: 196, charge: 0.92 },
                unlockStage: '1-3'
            },
            {
                id: 'voltFox',
                name: { zh: '伏特狐', en: 'Volt Fox' },
                role: { zh: '快攻爆发', en: 'Fast burst' },
                skill: { zh: '对单路进行爆发清线，更适合快攻压制。', en: 'A single-lane burst skill built for tempo pressure.' },
                stats: { power: 100, attack: 24, hp: 142, charge: 1.08 },
                unlockStage: '2-2'
            }
        ],
        units: [
            {
                id: 'bladePup',
                name: { zh: '刃犬', en: 'Blade Pup' },
                role: { zh: '2费快攻前排', en: '2-cost tempo pressure' },
                lane: 'front',
                cost: 2,
                stats: { power: 58, attack: 18, hp: 96, speed: 1.15 },
                unlockStage: '1-1'
            },
            {
                id: 'bulwarkBot',
                name: { zh: '堡垒机兵', en: 'Bulwark Bot' },
                role: { zh: '3费前排承伤', en: '3-cost frontline tank' },
                lane: 'front',
                cost: 3,
                stats: { power: 66, attack: 12, hp: 180, speed: 0.82 },
                unlockStage: '1-1'
            },
            {
                id: 'pulseGunner',
                name: { zh: '脉冲枪手', en: 'Pulse Gunner' },
                role: { zh: '3费稳定后排', en: '3-cost stable ranged DPS' },
                lane: 'back',
                cost: 3,
                stats: { power: 72, attack: 28, hp: 108, speed: 0.96 },
                unlockStage: '1-1'
            },
            {
                id: 'repairPixie',
                name: { zh: '修复妖精', en: 'Repair Pixie' },
                role: { zh: '2费续航辅助', en: '2-cost sustain support' },
                lane: 'support',
                cost: 2,
                stats: { power: 54, attack: 8, hp: 82, speed: 1 },
                unlockStage: '1-2'
            },
            {
                id: 'railSniper',
                name: { zh: '磁轨狙击', en: 'Rail Sniper' },
                role: { zh: '4费 Boss 点杀', en: '4-cost boss burst' },
                lane: 'back',
                cost: 4,
                stats: { power: 86, attack: 46, hp: 96, speed: 0.72 },
                unlockStage: '1-3'
            },
            {
                id: 'chainBrute',
                name: { zh: '锁链巨汉', en: 'Chain Brute' },
                role: { zh: '4费群伤前排', en: '4-cost splash frontline' },
                lane: 'front',
                cost: 4,
                stats: { power: 90, attack: 34, hp: 220, speed: 0.76 },
                unlockStage: '2-1'
            },
            {
                id: 'mirrorGuard',
                name: { zh: '镜卫', en: 'Mirror Guard' },
                role: { zh: '反击防守', en: 'Counter defense' },
                lane: 'front',
                cost: 3,
                stats: { power: 78, attack: 20, hp: 152, speed: 0.88 },
                unlockStage: '2-2'
            },
            {
                id: 'phantomRunner',
                name: { zh: '幻影疾行者', en: 'Phantom Runner' },
                role: { zh: '绕后收割', en: 'Backline sweep' },
                lane: 'front',
                cost: 2,
                stats: { power: 63, attack: 24, hp: 88, speed: 1.1 },
                unlockStage: '2-3'
            }
        ],
        tactics: [
            {
                id: 'overclockBurst',
                name: { zh: '过载脉冲', en: 'Overclock Burst' },
                role: { zh: '单路爆发增益', en: 'Single-lane burst boost' },
                cost: 3,
                stats: { power: 62, impact: 1.18 },
                unlockStage: '1-1'
            },
            {
                id: 'shieldNet',
                name: { zh: '护盾网投', en: 'Shield Net' },
                role: { zh: '补盾续航', en: 'Shield sustain' },
                cost: 3,
                stats: { power: 58, impact: 1.12 },
                unlockStage: '1-2'
            },
            {
                id: 'empLock',
                name: { zh: 'EMP封锁', en: 'EMP Lock' },
                role: { zh: '控制停火', en: 'Control shutdown' },
                cost: 4,
                stats: { power: 74, impact: 1.24 },
                unlockStage: '2-2'
            },
            {
                id: 'orbitalDrop',
                name: { zh: '轨道打击', en: 'Orbital Drop' },
                role: { zh: '高费清场', en: 'High-cost lane nuke' },
                cost: 5,
                stats: { power: 92, impact: 1.34 },
                unlockStage: '3-1'
            }
        ],
        chapters: [
            { id: '1-1', name: { zh: '霓虹码头', en: 'Neon Dock' }, recommended: 240, chapter: 1, reward: { credits: 200, tactCores: 12, cipherChips: 0, seasonXp: 18 }, pressure: { zh: '前线抢节奏', en: 'Frontline Tempo' }, rewardFocus: { zh: '基础金币', en: 'Starter credits' } },
            { id: '1-2', name: { zh: '回路街区', en: 'Circuit Block' }, recommended: 420, chapter: 1, reward: { credits: 280, tactCores: 16, cipherChips: 0, seasonXp: 22 }, pressure: { zh: '能量节奏', en: 'Energy Timing' }, rewardFocus: { zh: '前期核心', en: 'Early cores' } },
            { id: '1-3', name: { zh: '信标争夺', en: 'Beacon Clash' }, recommended: 680, chapter: 1, reward: { credits: 380, tactCores: 20, cipherChips: 1, seasonXp: 28 }, pressure: { zh: '首个 Boss', en: 'First Boss' }, rewardFocus: { zh: '首个芯片', en: 'First chip' } },
            { id: '2-1', name: { zh: '裂隙广场', en: 'Fracture Plaza' }, recommended: 1040, chapter: 2, reward: { credits: 520, tactCores: 28, cipherChips: 1, seasonXp: 36 }, pressure: { zh: '双路线压', en: 'Two-lane Pressure' }, rewardFocus: { zh: '核心产出', en: 'Core income' } },
            { id: '2-2', name: { zh: '低语回廊', en: 'Whisper Hall' }, recommended: 1560, chapter: 2, reward: { credits: 690, tactCores: 34, cipherChips: 2, seasonXp: 42 }, pressure: { zh: '控制检定', en: 'Control Check' }, rewardFocus: { zh: '稀有成型', en: 'Rare setup' } },
            { id: '2-3', name: { zh: '镜像内城', en: 'Mirror Core' }, recommended: 2260, chapter: 2, reward: { credits: 900, tactCores: 42, cipherChips: 2, seasonXp: 50 }, pressure: { zh: '第二个 Boss', en: 'Second Boss' }, rewardFocus: { zh: '中期金币', en: 'Mid credits' } },
            { id: '3-1', name: { zh: '赤电线圈', en: 'Red Coil' }, recommended: 3320, chapter: 3, reward: { credits: 1180, tactCores: 54, cipherChips: 3, seasonXp: 62 }, pressure: { zh: '后排承压', en: 'Backline Pressure' }, rewardFocus: { zh: '更多芯片', en: 'More chips' } },
            { id: '3-2', name: { zh: '深层中继', en: 'Deep Relay' }, recommended: 4680, chapter: 3, reward: { credits: 1490, tactCores: 66, cipherChips: 4, seasonXp: 76 }, pressure: { zh: '研究门槛', en: 'Research Gate' }, rewardFocus: { zh: '后期核心', en: 'Late cores' } },
            { id: '3-3', name: { zh: '穹顶主板', en: 'Dome Mainframe' }, recommended: 6460, chapter: 3, reward: { credits: 1880, tactCores: 82, cipherChips: 5, seasonXp: 92 }, pressure: { zh: '史诗检定', en: 'Epic Check' }, rewardFocus: { zh: '史诗成型', en: 'Epic setup' } },
            { id: '4-1', name: { zh: '零区突围', en: 'Zero District' }, recommended: 8420, chapter: 4, reward: { credits: 2280, tactCores: 96, cipherChips: 6, seasonXp: 108 }, pressure: { zh: '高压快攻', en: 'Heavy Tempo' }, rewardFocus: { zh: '后期金币', en: 'Late credits' } },
            { id: '4-2', name: { zh: '湮灭界桥', en: 'Null Bridge' }, recommended: 10680, chapter: 4, reward: { credits: 2740, tactCores: 112, cipherChips: 8, seasonXp: 126 }, pressure: { zh: '4星门槛', en: '4-Star Gate' }, rewardFocus: { zh: '高阶芯片', en: 'High chips' } },
            { id: '4-3', name: { zh: '冠冕中枢', en: 'Crown Nexus' }, recommended: 13280, chapter: 4, reward: { credits: 3360, tactCores: 132, cipherChips: 10, seasonXp: 148 }, pressure: { zh: '终局 Boss', en: 'Final Boss' }, rewardFocus: { zh: '精英卡包', en: 'Elite crate' } }
        ],
        research: [
            { id: 'energyMatrix', name: { zh: '能量矩阵', en: 'Energy Matrix' }, desc: { zh: '提升能量回复，并在关键等级提高能量上限。', en: 'Improves energy regeneration and raises max energy at breakpoints.' }, maxLevel: 12, baseCredits: 120, baseChips: 2, effect: { zh: '能量回复 +2%', en: 'Energy regen +2%' } },
            { id: 'frontlineArmor', name: { zh: '前线装甲', en: 'Frontline Armor' }, desc: { zh: '提高前排生命与护盾强度。', en: 'Raises frontline HP and shield durability.' }, maxLevel: 12, baseCredits: 120, baseChips: 2, effect: { zh: '前排生存 +4%', en: 'Frontline survival +4%' } },
            { id: 'fireControl', name: { zh: '火控校准', en: 'Fire Control' }, desc: { zh: '提高后排与远程单位输出。', en: 'Increases ranged and backline damage.' }, maxLevel: 15, baseCredits: 140, baseChips: 3, effect: { zh: '后排伤害 +3.5%', en: 'Ranged damage +3.5%' } },
            { id: 'tacticCompiler', name: { zh: '战术编译器', en: 'Tactic Compiler' }, desc: { zh: '提高战术卡效果与队长技能充能。', en: 'Improves tactic impact and leader skill charge.' }, maxLevel: 10, baseCredits: 150, baseChips: 3, effect: { zh: '战术效率 +5%', en: 'Tactic efficiency +5%' } },
            { id: 'bountyRelay', name: { zh: '赏金中继', en: 'Bounty Relay' }, desc: { zh: '提高章节金币与战术核心收益。', en: 'Improves chapter credits and tact core income.' }, maxLevel: 10, baseCredits: 160, baseChips: 3, effect: { zh: '收益 +3%', en: 'Yield +3%' } }
        ],
        missions: [
            { id: 'm1', title: { zh: '对战 3 次', en: 'Play 3 Matches' }, metric: 'duels', target: 3, reward: { credits: 260, tactCores: 16 } },
            { id: 'm2', title: { zh: '赢下 2 场', en: 'Win 2 Matches' }, metric: 'wins', target: 2, reward: { credits: 320, tactCores: 18 } },
            { id: 'm3', title: { zh: '开启 2 个标准卡包', en: 'Open 2 Standard Crates' }, metric: 'cratesOpened', target: 2, reward: { credits: 420, tactCores: 24 } },
            { id: 'm4', title: { zh: '卡牌总升级 4 次', en: 'Upgrade Cards 4 Times' }, metric: 'cardUpgrades', target: 4, reward: { credits: 560, tactCores: 28, cipherChips: 1 } },
            { id: 'm5', title: { zh: '研究总等级达到 4', en: 'Reach Total Research Lv4' }, metric: 'researchTotal', target: 4, reward: { credits: 720, tactCores: 34, cipherChips: 1 } },
            { id: 'm6', title: { zh: '击败首个 Boss', en: 'Defeat First Boss' }, metric: 'bossWins', target: 1, reward: { credits: 960, tactCores: 40, cipherChips: 2, standardCrates: 1 } },
            { id: 'm7', title: { zh: '赛季经验达到 320', en: 'Reach 320 Season XP' }, metric: 'seasonXp', target: 320, reward: { credits: 1280, tactCores: 52, cipherChips: 2 } },
            { id: 'm8', title: { zh: '赢下 8 场对战', en: 'Win 8 Matches' }, metric: 'wins', target: 8, reward: { credits: 1880, tactCores: 78, cipherChips: 3, eliteCrates: 1 } }
        ],
        seasonFreeTrack: [
            { id: 'f1', xp: 80, reward: { credits: 220, tactCores: 12 } },
            { id: 'f2', xp: 180, reward: { credits: 320, tactCores: 18 } },
            { id: 'f3', xp: 320, reward: { credits: 460, tactCores: 24, standardCrates: 1 } },
            { id: 'f4', xp: 520, reward: { credits: 640, tactCores: 34, cipherChips: 1 } },
            { id: 'f5', xp: 760, reward: { credits: 920, tactCores: 44 } },
            { id: 'f6', xp: 1080, reward: { credits: 1280, tactCores: 58, standardCrates: 1 } },
            { id: 'f7', xp: 1460, reward: { credits: 1720, tactCores: 72, cipherChips: 2 } },
            { id: 'f8', xp: 1920, reward: { credits: 2280, tactCores: 90, eliteCrates: 1 } }
        ],
        seasonPremiumTrack: [
            { id: 'p1', xp: 80, reward: { credits: 480, tactCores: 26 } },
            { id: 'p2', xp: 320, reward: { credits: 860, tactCores: 42, standardCrates: 1 } },
            { id: 'p3', xp: 760, reward: { credits: 1480, tactCores: 78, cipherChips: 2 } },
            { id: 'p4', xp: 1080, reward: { credits: 2280, tactCores: 116, eliteCrates: 1 } },
            { id: 'p5', xp: 1460, reward: { credits: 3240, tactCores: 156, cipherChips: 4 } },
            { id: 'p6', xp: 1920, reward: { credits: 4680, tactCores: 220, eliteCrates: 1 } }
        ],
        shopItems: [
            { id: 'dailySupply', title: { zh: '每日免费补给', en: 'Daily Free Supply' }, price: 0, reward: { credits: 180, tactCores: 10, seasonXp: 16 }, freeCooldownHours: 20 },
            { id: 'standardCrate', title: { zh: '标准卡包', en: 'Standard Crate' }, price: 360, reward: { standardCrates: 1 } },
            { id: 'coreBundle', title: { zh: '核心补给', en: 'Core Bundle' }, price: 620, reward: { tactCores: 26 } },
            { id: 'chipCache', title: { zh: '芯片缓存', en: 'Chip Cache' }, price: 1380, reward: { cipherChips: 4, tactCores: 22 } }
        ],
        paymentOffers: [
            { id: 'starter', price: 6, name: { zh: '新手卡组包', en: 'Starter Deck Pack' }, reward: { credits: 3000, tactCores: 120, cipherChips: 8, eliteCrates: 1 }, permanent: { zh: '能量回复 +3%', en: 'Energy regen +3%' } },
            { id: 'tactical', price: 15, name: { zh: '战术补给包', en: 'Tactical Supply Pack' }, reward: { credits: 9000, tactCores: 340, cipherChips: 20, eliteCrates: 2 }, permanent: { zh: '每日免费对战 +1', en: 'Daily free clash +1' } },
            { id: 'champion', price: 68, name: { zh: '冠军卡组包', en: 'Champion Deck Pack' }, reward: { credits: 48000, tactCores: 1800, cipherChips: 120, eliteCrates: 4 }, permanent: { zh: '全队攻击 +8% / 生命 +8%', en: 'Squad attack +8% / HP +8%' } }
        ]
    };
}());
