(function () {
    window.GENESIS_CIPHER_MATCH_CONFIG = {
        meta: {
            id: 'cipher-match',
            title: { zh: '密码消除', en: 'Cipher Match' },
            subtitle: {
                zh: '6x6 解码消除，兼顾章节闯关、构筑成长与赛季循环。',
                en: 'A 6x6 decode puzzler with chapter runs, deck growth, and season loops.'
            }
        },
        tabs: [
            { id: 'run', label: { zh: '闯关', en: 'Run' } },
            { id: 'deck', label: { zh: '构筑', en: 'Deck' } },
            { id: 'lab', label: { zh: '研究', en: 'Lab' } },
            { id: 'missions', label: { zh: '任务', en: 'Missions' } },
            { id: 'season', label: { zh: '赛季', en: 'Season' } },
            { id: 'shop', label: { zh: '商店', en: 'Shop' } }
        ],
        currencies: [
            { id: 'credits', label: { zh: '金币', en: 'Credits' }, icon: '◎' },
            { id: 'keyBits', label: { zh: '密钥位', en: 'Key Bits' }, icon: '◇' },
            { id: 'cipherDust', label: { zh: '密码尘', en: 'Cipher Dust' }, icon: '✦' },
            { id: 'seasonXp', label: { zh: '赛季经验', en: 'Season XP' }, icon: '✧' }
        ],
        board: {
            size: 6,
            freeRunsPerDay: 6,
            buyMovesBase: 220,
            entryCostByChapter: { 1: 180, 2: 320, 3: 540, 4: 880 },
            colors: [
                { id: 'alpha', icon: 'A', name: { zh: '蓝码', en: 'Azure' } },
                { id: 'beta', icon: 'B', name: { zh: '紫码', en: 'Violet' } },
                { id: 'gamma', icon: 'C', name: { zh: '青码', en: 'Cyan' } },
                { id: 'delta', icon: 'D', name: { zh: '金码', en: 'Gold' } },
                { id: 'omega', icon: 'Ω', name: { zh: '核码', en: 'Core' } }
            ]
        },
        upgradeCurves: {
            leader: { baseCredits: 190, creditGrowth: 1.34, baseBits: 24, bitGrowth: 1.22 },
            module: { baseCredits: 130, creditGrowth: 1.28, baseBits: 16, bitGrowth: 1.18 },
            skill: { baseCredits: 160, creditGrowth: 1.31, baseBits: 18, bitGrowth: 1.2 }
        },
        cardMaxLevels: {
            leader: 12,
            module: 10,
            skill: 10
        },
        leaders: [
            {
                id: 'glintFox',
                name: { zh: '微光狐', en: 'Glint Fox' },
                role: { zh: '快节奏连锁', en: 'Fast cascades' },
                skill: { zh: '让当前缺口最大的目标额外减少 6 点。', en: 'Removes 6 extra progress from your biggest remaining target.' },
                effect: { zh: '连锁加速', en: 'Cascade tempo' },
                basePower: 92
            },
            {
                id: 'wardenNine',
                name: { zh: '九号守门人', en: 'Warden Nine' },
                role: { zh: '步数与容错', en: 'Moves and stability' },
                skill: { zh: '立刻恢复 3 步，并把能量回到 35。', en: 'Immediately restores 3 moves and resets energy to 35.' },
                effect: { zh: '稳扎稳打', en: 'Steady control' },
                basePower: 108
            },
            {
                id: 'novaEcho',
                name: { zh: '新星回声', en: 'Nova Echo' },
                role: { zh: '首领压制', en: 'Boss break' },
                skill: { zh: '对全部目标造成额外压制，护盾目标额外 -4。', en: 'Pressures all goals and deals an extra -4 to shield targets.' },
                effect: { zh: '破盾推进', en: 'Boss pressure' },
                basePower: 102
            }
        ],
        modules: [
            {
                id: 'prismTap',
                name: { zh: '棱镜触发', en: 'Prism Tap' },
                role: { zh: '充能更快', en: 'Faster charge' },
                effect: { zh: '每回合额外获得能量。', en: 'Earns extra energy every successful move.' },
                basePower: 48
            },
            {
                id: 'relayCache',
                name: { zh: '中继缓存', en: 'Relay Cache' },
                role: { zh: '提高收益', en: 'More rewards' },
                effect: { zh: '结算金币 / 密钥位收益提高。', en: 'Improves credits and key bit rewards on victory.' },
                basePower: 44
            },
            {
                id: 'hardPatch',
                name: { zh: '硬补丁', en: 'Hard Patch' },
                role: { zh: '开局多步', en: 'More opening moves' },
                effect: { zh: '开局步数 +1。', en: 'Adds 1 starting move.' },
                basePower: 52
            },
            {
                id: 'burstIndex',
                name: { zh: '爆发索引', en: 'Burst Index' },
                role: { zh: '大连击分数', en: 'Big match score' },
                effect: { zh: '4 连及以上时获得额外分数。', en: 'Adds bonus score on 4+ tile clears.' },
                basePower: 58
            },
            {
                id: 'traceMine',
                name: { zh: '追迹针', en: 'Trace Mine' },
                role: { zh: '护盾压制', en: 'Shield pressure' },
                effect: { zh: '每次有效交换后，护盾目标额外 -1。', en: 'Deals an extra -1 to shield goals after each valid move.' },
                basePower: 55
            }
        ],
        skills: [
            {
                id: 'gridBurst',
                name: { zh: '棋盘爆破', en: 'Grid Burst' },
                role: { zh: '目标直压', en: 'Goal burst' },
                effect: { zh: '最大缺口目标 -6。', en: 'Largest remaining goal -6.' },
                energyCost: 100,
                basePower: 68
            },
            {
                id: 'colorHack',
                name: { zh: '颜色劫持', en: 'Color Hack' },
                role: { zh: '收色更快', en: 'Fast color clear' },
                effect: { zh: '缺口最大的颜色目标 -8。', en: 'Largest remaining color goal -8.' },
                energyCost: 100,
                basePower: 72
            },
            {
                id: 'stasisField',
                name: { zh: '停滞场', en: 'Stasis Field' },
                role: { zh: '补步续命', en: 'Move recovery' },
                effect: { zh: '恢复 3 步并清空一个小目标 3 点。', en: 'Restores 3 moves and trims a small goal by 3.' },
                energyCost: 100,
                basePower: 70
            }
        ],
        chapters: [
            {
                id: '1-1',
                chapter: 1,
                name: { zh: '断码码头', en: 'Broken Dock' },
                recommended: 180,
                moves: 20,
                goals: [
                    { type: 'alpha', amount: 12 },
                    { type: 'beta', amount: 10 }
                ],
                pressure: { zh: '新手引导', en: 'Starter route' },
                rewardFocus: { zh: '基础金币', en: 'Starter credits' },
                reward: { credits: 240, keyBits: 30, cipherDust: 10, seasonXp: 30 }
            },
            {
                id: '1-2',
                chapter: 1,
                name: { zh: '循环街区', en: 'Loop Block' },
                recommended: 270,
                moves: 20,
                goals: [
                    { type: 'gamma', amount: 13 },
                    { type: 'delta', amount: 12 }
                ],
                pressure: { zh: '节奏检查', en: 'Tempo check' },
                rewardFocus: { zh: '密钥位', en: 'Key bits' },
                reward: { credits: 310, keyBits: 38, cipherDust: 12, seasonXp: 36 }
            },
            {
                id: '1-3',
                chapter: 1,
                name: { zh: '防火墙门', en: 'Firewall Gate' },
                recommended: 400,
                moves: 22,
                goals: [
                    { type: 'omega', amount: 12 },
                    { type: 'shield', amount: 8 }
                ],
                pressure: { zh: '首个软卡点', en: 'First soft gate' },
                rewardFocus: { zh: '首领破盾材料', en: 'Boss break dust' },
                reward: { credits: 390, keyBits: 50, cipherDust: 18, seasonXp: 44 }
            },
            {
                id: '2-1',
                chapter: 2,
                name: { zh: '镜像港', en: 'Mirror Port' },
                recommended: 520,
                moves: 21,
                goals: [
                    { type: 'alpha', amount: 16 },
                    { type: 'delta', amount: 14 }
                ],
                pressure: { zh: '双线目标', en: 'Dual goals' },
                rewardFocus: { zh: '高额金币', en: 'Higher credits' },
                reward: { credits: 560, keyBits: 70, cipherDust: 20, seasonXp: 58 }
            },
            {
                id: '2-2',
                chapter: 2,
                name: { zh: '裂屏矩阵', en: 'Fracture Matrix' },
                recommended: 650,
                moves: 22,
                goals: [
                    { type: 'beta', amount: 17 },
                    { type: 'gamma', amount: 16 }
                ],
                pressure: { zh: '研究卡点', en: 'Research gate' },
                rewardFocus: { zh: '研究材料补强', en: 'Research dust' },
                reward: { credits: 730, keyBits: 90, cipherDust: 28, seasonXp: 72 }
            },
            {
                id: '2-3',
                chapter: 2,
                name: { zh: '主密钥冠', en: 'Crown Key' },
                recommended: 780,
                moves: 24,
                goals: [
                    { type: 'omega', amount: 14 },
                    { type: 'shield', amount: 12 }
                ],
                pressure: { zh: '中期首领卡点', en: 'Mid boss gate' },
                rewardFocus: { zh: '中期成长跳板', en: 'Mid-growth springboard' },
                reward: { credits: 920, keyBits: 116, cipherDust: 38, seasonXp: 88 }
            },
            {
                id: '3-1',
                chapter: 3,
                name: { zh: '回声桥', en: 'Echo Bridge' },
                recommended: 900,
                moves: 22,
                goals: [
                    { type: 'alpha', amount: 18 },
                    { type: 'delta', amount: 18 }
                ],
                pressure: { zh: '长连锁检测', en: 'Long combo gate' },
                rewardFocus: { zh: '高额金币', en: 'High credits' },
                reward: { credits: 1120, keyBits: 138, cipherDust: 44, seasonXp: 98 }
            },
            {
                id: '3-2',
                chapter: 3,
                name: { zh: '裂隙缓存', en: 'Rift Cache' },
                recommended: 1030,
                moves: 23,
                goals: [
                    { type: 'beta', amount: 19 },
                    { type: 'gamma', amount: 18 },
                    { type: 'omega', amount: 10 }
                ],
                pressure: { zh: '三目标成长墙', en: 'Triple-goal wall' },
                rewardFocus: { zh: '密钥位冲刺', en: 'Bit spike' },
                reward: { credits: 1460, keyBits: 182, cipherDust: 56, seasonXp: 116 }
            },
            {
                id: '3-3',
                chapter: 3,
                name: { zh: '终焉防火墙', en: 'Terminal Firewall' },
                recommended: 1160,
                moves: 25,
                goals: [
                    { type: 'omega', amount: 18 },
                    { type: 'shield', amount: 16 }
                ],
                pressure: { zh: '后段首领卡点', en: 'Late boss gate' },
                rewardFocus: { zh: '后段资源爆发', en: 'Late burst rewards' },
                reward: { credits: 1880, keyBits: 236, cipherDust: 78, seasonXp: 142 }
            },
            {
                id: '4-1',
                chapter: 4,
                name: { zh: '镜核回廊', en: 'Mirror Core' },
                recommended: 1260,
                moves: 24,
                goals: [
                    { type: 'beta', amount: 22 },
                    { type: 'delta', amount: 20 }
                ],
                pressure: { zh: '高压双目标', en: 'High-pressure dual goals' },
                rewardFocus: { zh: '后期金币追赶', en: 'Late credits' },
                reward: { credits: 2360, keyBits: 296, cipherDust: 92, seasonXp: 162 }
            },
            {
                id: '4-2',
                chapter: 4,
                name: { zh: '崩解索引', en: 'Break Index' },
                recommended: 1360,
                moves: 25,
                goals: [
                    { type: 'alpha', amount: 22 },
                    { type: 'gamma', amount: 20 },
                    { type: 'omega', amount: 14 }
                ],
                pressure: { zh: '终盘成长墙', en: 'Endgame wall' },
                rewardFocus: { zh: '密钥位高峰', en: 'Bit peak' },
                reward: { credits: 2940, keyBits: 368, cipherDust: 118, seasonXp: 194 }
            },
            {
                id: '4-3',
                chapter: 4,
                name: { zh: '零域主防火墙', en: 'Null Firewall' },
                recommended: 1440,
                moves: 27,
                goals: [
                    { type: 'omega', amount: 20 },
                    { type: 'delta', amount: 16 },
                    { type: 'shield', amount: 18 }
                ],
                pressure: { zh: '终章首领战', en: 'Final boss' },
                rewardFocus: { zh: '终局资源爆发', en: 'Final burst rewards' },
                reward: { credits: 3620, keyBits: 452, cipherDust: 152, seasonXp: 232 }
            }
        ],
        research: [
            {
                id: 'decodeCache',
                icon: '➕',
                name: { zh: '解码缓存', en: 'Decode Cache' },
                desc: { zh: '每 3 级开局多 1 步。', en: 'Gain +1 starting move every 3 levels.' },
                effect: { zh: '开局步数成长', en: 'Opening moves' },
                maxLevel: 12,
                baseCredits: 140,
                baseDust: 10
            },
            {
                id: 'pulseBattery',
                icon: '⚡',
                name: { zh: '脉冲电池', en: 'Pulse Battery' },
                desc: { zh: '每级提升能量上限 6。', en: 'Each level raises max energy by 6.' },
                effect: { zh: '技能充能上限', en: 'Skill energy cap' },
                maxLevel: 10,
                baseCredits: 160,
                baseDust: 12
            },
            {
                id: 'signalAmp',
                icon: '✦',
                name: { zh: '讯号增幅', en: 'Signal Amp' },
                desc: { zh: '技能效果每级提高 4%。', en: 'Skill impact grows 4% per level.' },
                effect: { zh: '主动技加成', en: 'Skill power' },
                maxLevel: 10,
                baseCredits: 180,
                baseDust: 14
            },
            {
                id: 'lootRelay',
                icon: '◎',
                name: { zh: '战利中继', en: 'Loot Relay' },
                desc: { zh: '胜利金币 / 密钥位奖励每级 +5%。', en: 'Victory credits and bits +5% per level.' },
                effect: { zh: '章节收益', en: 'Chapter rewards' },
                maxLevel: 12,
                baseCredits: 190,
                baseDust: 16
            },
            {
                id: 'stabilityMesh',
                icon: '⬢',
                name: { zh: '稳定网格', en: 'Stability Mesh' },
                desc: { zh: '构筑战力每级 +4%。', en: 'Deck power +4% per level.' },
                effect: { zh: '推荐战力追赶', en: 'Power growth' },
                maxLevel: 10,
                baseCredits: 220,
                baseDust: 18
            }
        ],
        missions: [
            { id: 'm1', title: { zh: '完成 2 局', en: 'Finish 2 Runs' }, metric: 'runs', target: 2, reward: { credits: 280, keyBits: 22 } },
            { id: 'm2', title: { zh: '获胜 2 局', en: 'Win 2 Runs' }, metric: 'wins', target: 2, reward: { credits: 360, keyBits: 28, cipherDust: 6 } },
            { id: 'm3', title: { zh: '累计消除 90 格', en: 'Clear 90 Tiles' }, metric: 'matchedTiles', target: 90, reward: { credits: 420, keyBits: 34 } },
            { id: 'm4', title: { zh: '升级卡牌 4 次', en: 'Upgrade 4 Cards' }, metric: 'upgrades', target: 4, reward: { credits: 520, keyBits: 42, cipherDust: 8 } },
            { id: 'm5', title: { zh: '研究升级 3 次', en: 'Upgrade Research 3 Times' }, metric: 'researchUpgrades', target: 3, reward: { credits: 560, keyBits: 40, cipherDust: 10 } },
            { id: 'm6', title: { zh: '通过 3 个章节关卡', en: 'Clear 3 Stages' }, metric: 'chapterClears', target: 3, reward: { credits: 720, keyBits: 56, cipherDust: 12, seasonXp: 40 } },
            { id: 'm7', title: { zh: '通过 6 个章节关卡', en: 'Clear 6 Stages' }, metric: 'chapterClears', target: 6, reward: { credits: 980, keyBits: 74, cipherDust: 18, seasonXp: 54 } },
            { id: 'm8', title: { zh: '获胜 8 局', en: 'Win 8 Runs' }, metric: 'wins', target: 8, reward: { credits: 1320, keyBits: 104, cipherDust: 28, seasonXp: 72 } },
            { id: 'm9', title: { zh: '通过 10 个章节关卡', en: 'Clear 10 Stages' }, metric: 'chapterClears', target: 10, reward: { credits: 1880, keyBits: 148, cipherDust: 42, seasonXp: 96 } }
        ],
        seasonFreeTrack: [
            { id: 'f1', xp: 80, reward: { credits: 240, keyBits: 16 } },
            { id: 'f2', xp: 200, reward: { credits: 320, keyBits: 24, cipherDust: 8 } },
            { id: 'f3', xp: 380, reward: { credits: 460, keyBits: 38 } },
            { id: 'f4', xp: 620, reward: { credits: 640, keyBits: 56, cipherDust: 12 } },
            { id: 'f5', xp: 920, reward: { credits: 920, keyBits: 78, cipherDust: 18 } },
            { id: 'f6', xp: 1320, reward: { credits: 1280, keyBits: 104, cipherDust: 26 } }
        ],
        seasonPremiumTrack: [
            { id: 'p1', xp: 80, reward: { credits: 520, keyBits: 36 } },
            { id: 'p2', xp: 200, reward: { credits: 760, keyBits: 54, cipherDust: 16 } },
            { id: 'p3', xp: 380, reward: { credits: 1260, keyBits: 96, cipherDust: 26 } },
            { id: 'p4', xp: 620, reward: { credits: 1820, keyBits: 136, cipherDust: 36 } },
            { id: 'p5', xp: 920, reward: { credits: 2780, keyBits: 208, cipherDust: 50 } },
            { id: 'p6', xp: 1320, reward: { credits: 3880, keyBits: 292, cipherDust: 72 } }
        ],
        shopItems: [
            {
                id: 'dailyFree',
                title: { zh: '每日免费补给', en: 'Daily Free Supply' },
                price: 0,
                reward: { credits: 220, keyBits: 18, cipherDust: 8, seasonXp: 18 },
                daily: true
            },
            {
                id: 'bitBundle',
                title: { zh: '密钥位补给', en: 'Key Bit Bundle' },
                price: 480,
                reward: { keyBits: 60 }
            },
            {
                id: 'dustPack',
                title: { zh: '密码尘补给', en: 'Dust Pack' },
                price: 620,
                reward: { cipherDust: 30 }
            },
            {
                id: 'boosterTray',
                title: { zh: '闯关加速盘', en: 'Run Booster Tray' },
                price: 960,
                reward: { credits: 520, keyBits: 44, cipherDust: 18, seasonXp: 36 }
            }
        ],
        paymentOffers: [
            {
                id: 'starterPack',
                price: 6,
                name: { zh: '新手破译包', en: 'Starter Decode Pack' },
                permanent: { zh: '适合 1-3 / 2-1 首次卡点：永久 +1 每日免费局，每局开局更稳。', en: 'Built for the 1-3 / 2-1 soft gate: +1 daily free run and stronger starts every run.' },
                oneTime: true,
                reward: { starterBoost: true, credits: 2600, keyBits: 220, cipherDust: 72 }
            },
            {
                id: 'seasonPass',
                price: 18,
                name: { zh: '赛季通行证', en: 'Season Pass' },
                permanent: { zh: '适合 2-2 / 2-3 研究卡点：解锁高级轨道，研究更便宜，中后段开局与收益也更稳。', en: 'Built for the 2-2 / 2-3 research gate: unlocks the premium track, lowers research cost, and steadies late-run openers and payouts.' },
                oneTime: true,
                reward: { premiumSeason: true, credits: 4200, keyBits: 320, cipherDust: 160, seasonXp: 180 }
            },
            {
                id: 'breakerVault',
                price: 68,
                name: { zh: '破关金库', en: 'Breaker Vault' },
                permanent: { zh: '适合 3-3 / 4-x 首领卡点：永久减轻首领反制，让后段 Boss 战更可控，并提高后段结算收益。', en: 'Built for the 3-3 / 4-x boss gate: permanently softens boss counters, makes late boss fights more controllable, and boosts late-stage payouts.' },
                oneTime: true,
                reward: { vaultRelay: true, credits: 18000, keyBits: 1350, cipherDust: 560 }
            }
        ]
    };
}());
