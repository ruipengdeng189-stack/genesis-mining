(function () {
    window.GENESIS_ORBITAL_FALL_CONFIG = {
        meta: {
            id: 'orbital-fall',
            title: { zh: '轨道坠落', en: 'Orbital Fall' },
            subtitle: {
                zh: '单手生存射击 · 轻肉鸽成长',
                en: 'One-Hand Survival Shooter · Light Roguelike Growth'
            },
            description: {
                zh: '竖屏单手拖拽走位、武器自动开火、局内三选一成长、局外装备与研究养成，面向短局高频活跃与赛季推进。',
                en: 'A portrait one-hand survival shooter with drag movement, auto-fire, in-run 3-choice upgrades, and long-term growth through loadout and research.'
            }
        },
        tabs: [
            { id: 'run', label: { zh: '闯关', en: 'Run' }, icon: '▶' },
            { id: 'arsenal', label: { zh: '整备', en: 'Arsenal' }, icon: '⌘' },
            { id: 'lab', label: { zh: '研究', en: 'Lab' }, icon: '◎' },
            { id: 'missions', label: { zh: '任务', en: 'Missions' }, icon: '✓' },
            { id: 'season', label: { zh: '赛季', en: 'Season' }, icon: '★' },
            { id: 'shop', label: { zh: '商店', en: 'Shop' }, icon: '¤' }
        ],
        resources: [
            { id: 'credits', label: { zh: '金币', en: 'Credits' }, short: { zh: '币', en: 'CR' }, icon: '●' },
            { id: 'alloy', label: { zh: '合金', en: 'Alloy' }, short: { zh: '合', en: 'AL' }, icon: '■' },
            { id: 'signal', label: { zh: '信号', en: 'Signal' }, short: { zh: '信', en: 'SG' }, icon: '✦' },
            { id: 'eliteKeys', label: { zh: '续航钥匙', en: 'Recovery Keys' }, short: { zh: '钥', en: 'KEY' }, icon: '⟡' },
            { id: 'seasonXp', label: { zh: '赛季经验', en: 'Season XP' }, short: { zh: '季', en: 'SP' }, icon: '✪' }
        ],
        layoutSpec: {
            battle: {
                separateScene: true,
                hideMetaTabsWhileRunning: true,
                portraitOnly: true,
                arenaHeight: '74dvh',
                minArenaHeightPx: 520,
                hudRows: 2,
                maxHudGroups: 4,
                topHudBlocks: ['hp', 'shield', 'timer', 'charge'],
                stageGoalMode: 'icon-pills',
                maxBottomActions: 2,
                bottomActions: ['ultimate', 'pause'],
                showMoveHintOnce: true,
                compactToastSeconds: 1.4,
                longCopyAllowed: false,
                detailPanelMode: 'pause-sheet'
            },
            runPrep: {
                singleScreen: true,
                primaryWidgets: ['chapter', 'power', 'loadout', 'start'],
                stageCardsPerRow: 2,
                loadoutRows: 2,
                startButtonSticky: true
            },
            contentTabs: {
                compactCards: true,
                iconFirst: true,
                paragraphLines: 2,
                innerScroll: true,
                singleScreenTarget: true,
                statDensity: 'high'
            }
        },
        economy: {
            startingResources: {
                credits: 2200,
                alloy: 160,
                signal: 18,
                seasonXp: 0
            },
            startingLoadout: {
                hullId: 'flare',
                weaponIds: ['pulse-gun', 'arc-laser'],
                droneId: 'scrap-magnet',
                ultimateId: 'nova-burst'
            },
            startingPower: 252,
            corePowerCycle: 105,
            powerCurveExponent: 4.1,
            dailyFreeRunCount: 3,
            continueCosts: [180, 360],
            stageUnlockRule: 'clearPrevious',
            hullLevelCosts: [
                { level: 2, credits: 160, alloy: 10 },
                { level: 3, credits: 240, alloy: 14 },
                { level: 4, credits: 360, alloy: 20 },
                { level: 5, credits: 540, alloy: 28 },
                { level: 6, credits: 810, alloy: 40 },
                { level: 7, credits: 1180, alloy: 56 }
            ],
            weaponLevelCosts: [
                { level: 2, credits: 120, alloy: 12 },
                { level: 3, credits: 180, alloy: 16 },
                { level: 4, credits: 270, alloy: 22 },
                { level: 5, credits: 410, alloy: 30 },
                { level: 6, credits: 620, alloy: 42 },
                { level: 7, credits: 930, alloy: 58 },
                { level: 8, credits: 1380, alloy: 80 }
            ],
            droneLevelCosts: [
                { level: 2, credits: 90, alloy: 8 },
                { level: 3, credits: 140, alloy: 12 },
                { level: 4, credits: 220, alloy: 18 },
                { level: 5, credits: 330, alloy: 26 },
                { level: 6, credits: 500, alloy: 36 }
            ],
            ultimateLevelCosts: [
                { level: 2, credits: 220, alloy: 14, signal: 2 },
                { level: 3, credits: 340, alloy: 20, signal: 3 },
                { level: 4, credits: 520, alloy: 28, signal: 4 },
                { level: 5, credits: 780, alloy: 40, signal: 6 }
            ]
        },
        battleTuning: {
            runLengthSeconds: {
                normal: [120, 180],
                elite: [150, 210],
                boss: [210, 300]
            },
            enemyCap: {
                early: 18,
                mid: 28,
                late: 36
            },
            eliteSpawnWindows: [
                { stageRange: '1-x', seconds: [80, 110] },
                { stageRange: '2-x', seconds: [75, 120] },
                { stageRange: '3-x', seconds: [70, 130] },
                { stageRange: '4-x', seconds: [65, 140] }
            ],
            eliteKeyBoost: {
                rewardRate: 0.28,
                signalBonus: 0.12,
                extraSignalVictory: 2,
                enemyCapBonus: 3,
                spawnRateBonus: 0.1,
                eliteTimerRate: 0.84,
                firstEliteRate: 0.72,
                bossHpRate: 0.1,
                bossDamageRate: 0.08
            },
            combatDefaults: {
                normal: {
                    openingHint: {
                        zh: '拖动战机走位，优先吃经验球，别被小怪包住。',
                        en: 'Drag to move, grab XP first, and avoid getting boxed in.'
                    },
                    allowEliteSpawns: true,
                    enemyCapBonus: 0,
                    spawnIntervalRate: 1,
                    lateSpawnRate: 0.84,
                    firstEliteRate: 1,
                    eliteEveryRate: 1,
                    normalHpRate: 1,
                    normalSpeedRate: 1,
                    normalDamageRate: 1,
                    eliteHpRate: 1,
                    eliteSpeedRate: 1,
                    eliteDamageRate: 1,
                    bossHpRate: 1,
                    bossDamageRate: 1,
                    bossSpeedRate: 1,
                    bossBulletSpeedRate: 1,
                    pickupRangeBonus: 0,
                    chargeRate: 1,
                    chargeOnKillRate: 1,
                    xpDropRate: 1,
                    eliteDropRate: 1,
                    bossDropRate: 1,
                    normalDropCountBonus: 0,
                    eliteDropCountBonus: 0,
                    bossDropCountBonus: 0,
                    waveHpGrowth: 0.18,
                    waveDamageGrowth: 0.12
                },
                elite: {
                    openingHint: {
                        zh: '精英会更早压进来，技能别空放，先稳住安全区。',
                        en: 'Elites enter earlier here. Hold skills for value and keep a safe lane open.'
                    },
                    allowEliteSpawns: true,
                    enemyCapBonus: -1,
                    spawnIntervalRate: 1.04,
                    lateSpawnRate: 0.88,
                    firstEliteRate: 0.78,
                    eliteEveryRate: 0.82,
                    normalHpRate: 1,
                    normalSpeedRate: 1,
                    normalDamageRate: 1,
                    eliteHpRate: 1.08,
                    eliteSpeedRate: 1,
                    eliteDamageRate: 1.04,
                    bossHpRate: 1,
                    bossDamageRate: 1,
                    bossSpeedRate: 1,
                    bossBulletSpeedRate: 1.02,
                    pickupRangeBonus: 4,
                    chargeRate: 1.02,
                    chargeOnKillRate: 1.05,
                    xpDropRate: 1.05,
                    eliteDropRate: 1.12,
                    bossDropRate: 1,
                    normalDropCountBonus: 0,
                    eliteDropCountBonus: 1,
                    bossDropCountBonus: 0,
                    waveHpGrowth: 0.22,
                    waveDamageGrowth: 0.14
                },
                boss: {
                    openingHint: {
                        zh: 'Boss 关先保血和护盾，满能量后把大招留给首领。',
                        en: 'Protect HP and shield first. Save the ultimate for the boss.'
                    },
                    allowEliteSpawns: false,
                    enemyCapBonus: -2,
                    spawnIntervalRate: 1.08,
                    lateSpawnRate: 0.92,
                    firstEliteRate: 1.16,
                    eliteEveryRate: 1.2,
                    normalHpRate: 0.96,
                    normalSpeedRate: 0.98,
                    normalDamageRate: 0.94,
                    eliteHpRate: 0.98,
                    eliteSpeedRate: 1,
                    eliteDamageRate: 0.96,
                    bossHpRate: 1.02,
                    bossDamageRate: 1.02,
                    bossSpeedRate: 1,
                    bossBulletSpeedRate: 1.04,
                    pickupRangeBonus: 8,
                    chargeRate: 1.08,
                    chargeOnKillRate: 1.08,
                    xpDropRate: 1,
                    eliteDropRate: 1,
                    bossDropRate: 1.16,
                    normalDropCountBonus: 0,
                    eliteDropCountBonus: 0,
                    bossDropCountBonus: 2,
                    waveHpGrowth: 0.14,
                    waveDamageGrowth: 0.1
                }
            },
            stageCombatTuning: {
                '1-1': {
                    openingHint: {
                        zh: '先熟悉拖动和拾取，前半段压力很轻，优先把经验吃满。',
                        en: 'Learn movement and pickups first. Early pressure is light, so focus on XP.'
                    },
                    allowEliteSpawns: false,
                    enemyCapBonus: -3,
                    spawnIntervalRate: 1.16,
                    lateSpawnRate: 1,
                    normalHpRate: 0.82,
                    normalSpeedRate: 0.9,
                    normalDamageRate: 0.82,
                    pickupRangeBonus: 18,
                    chargeRate: 1.08,
                    xpDropRate: 1.15,
                    waveHpGrowth: 0.08,
                    waveDamageGrowth: 0.04
                },
                '1-2': {
                    openingHint: {
                        zh: '继续先拿升级，再练习边走位边收经验。',
                        en: 'Keep prioritizing early upgrades while practicing movement and XP pickup.'
                    },
                    allowEliteSpawns: false,
                    enemyCapBonus: -2,
                    spawnIntervalRate: 1.12,
                    lateSpawnRate: 0.98,
                    normalHpRate: 0.88,
                    normalDamageRate: 0.88,
                    pickupRangeBonus: 12,
                    xpDropRate: 1.1
                },
                '1-3': {
                    openingHint: {
                        zh: '这一关开始要边清线边走位，不要被残骸逼到角落。',
                        en: 'Start clearing while moving here. Do not let wreckage trap you in corners.'
                    },
                    allowEliteSpawns: false,
                    enemyCapBonus: -1,
                    spawnIntervalRate: 1.06,
                    lateSpawnRate: 0.94,
                    normalHpRate: 0.94,
                    normalDamageRate: 0.92,
                    xpDropRate: 1.06
                },
                '1-4': {
                    openingHint: {
                        zh: '第二把武器开始发力，优先保持中线清怪空间。',
                        en: 'Your second weapon starts to matter here. Keep the center lane clear.'
                    },
                    enemyCapBonus: 0,
                    spawnIntervalRate: 1.02,
                    lateSpawnRate: 0.88,
                    eliteEveryRate: 1.08,
                    normalHpRate: 1.02,
                    eliteHpRate: 0.96
                },
                '1-5': {
                    openingHint: {
                        zh: '第一只精英会更早出现，留好大招收它。',
                        en: 'The first elite shows up earlier here. Save the ultimate for it.'
                    },
                    firstEliteRate: 0.76,
                    eliteEveryRate: 0.82,
                    eliteHpRate: 0.94,
                    eliteDamageRate: 0.92
                },
                '1-6': {
                    openingHint: {
                        zh: '首个 Boss 关先保护盾，首个大招尽量交给首领。',
                        en: 'Protect your shield first. Try to spend the first ultimate on the boss.'
                    },
                    enemyCapBonus: -3,
                    normalHpRate: 0.92,
                    bossHpRate: 0.92,
                    bossDamageRate: 0.9,
                    bossBulletSpeedRate: 0.94,
                    chargeRate: 1.12
                },
                '2-3': {
                    openingHint: {
                        zh: '从这里开始同时考验清怪和资源转化，别贪吃边角经验。',
                        en: 'Wave clear and resource conversion both matter here. Do not overreach for edge XP.'
                    },
                    enemyCapBonus: 1,
                    spawnIntervalRate: 0.97,
                    lateSpawnRate: 0.84,
                    normalHpRate: 1.05,
                    eliteHpRate: 1.06,
                    normalDamageRate: 1.04,
                    waveHpGrowth: 0.22
                },
                '2-5': {
                    openingHint: {
                        zh: '精英会连续压进来，保持横向移动比站桩更重要。',
                        en: 'Elites chain together here. Lateral movement matters more than standing and firing.'
                    },
                    firstEliteRate: 0.74,
                    eliteEveryRate: 0.78,
                    eliteHpRate: 1.08,
                    eliteDamageRate: 1.06
                },
                '2-6': {
                    openingHint: {
                        zh: '这一战开始要求稳定循环，技能不要空放。',
                        en: 'This fight starts testing your full loop. Do not waste your skills.'
                    },
                    enemyCapBonus: -1,
                    bossHpRate: 1.02,
                    bossDamageRate: 1.04,
                    bossBulletSpeedRate: 1.02,
                    chargeRate: 1.06
                },
                '3-3': {
                    openingHint: {
                        zh: '完整构筑的检验点来了，先保住走位空间，再贪输出。',
                        en: 'This is the first full build check. Protect your movement space before chasing damage.'
                    },
                    enemyCapBonus: 2,
                    spawnIntervalRate: 0.92,
                    lateSpawnRate: 0.78,
                    firstEliteRate: 0.82,
                    eliteEveryRate: 0.86,
                    normalHpRate: 1.1,
                    eliteHpRate: 1.14,
                    eliteDamageRate: 1.08,
                    waveHpGrowth: 0.24,
                    waveDamageGrowth: 0.16
                },
                '3-5': {
                    openingHint: {
                        zh: '精英压强明显变高，技能好了就主动换一波空间。',
                        en: 'Elite pressure rises sharply here. Spend skills to buy space when they are ready.'
                    },
                    firstEliteRate: 0.72,
                    eliteEveryRate: 0.74,
                    eliteHpRate: 1.16,
                    eliteDamageRate: 1.1
                },
                '3-6': {
                    openingHint: {
                        zh: '母舰弹幕更密，优先清掉贴身杂兵再盯首领。',
                        en: 'The carrier fires denser patterns. Clear nearby mobs before tunneling the boss.'
                    },
                    bossHpRate: 1.08,
                    bossDamageRate: 1.1,
                    bossBulletSpeedRate: 1.08,
                    chargeRate: 1.04
                },
                '4-2': {
                    openingHint: {
                        zh: '后期开始要边走边收，站桩会很快丢掉节奏。',
                        en: 'Late-game starts here: keep moving while collecting, or you lose tempo fast.'
                    },
                    enemyCapBonus: 2,
                    spawnIntervalRate: 0.9,
                    lateSpawnRate: 0.76,
                    normalHpRate: 1.12,
                    normalSpeedRate: 1.05,
                    normalDamageRate: 1.08,
                    eliteHpRate: 1.12,
                    waveHpGrowth: 0.26
                },
                '4-4': {
                    openingHint: {
                        zh: '终盘前的稳定性测试，护盾和大招节奏比硬拼更重要。',
                        en: 'This is the pre-final stability check. Shield timing and ult rhythm beat brute force.'
                    },
                    enemyCapBonus: 3,
                    spawnIntervalRate: 0.86,
                    lateSpawnRate: 0.72,
                    normalHpRate: 1.16,
                    eliteHpRate: 1.18,
                    normalDamageRate: 1.1,
                    waveHpGrowth: 0.28,
                    waveDamageGrowth: 0.18
                },
                '4-5': {
                    openingHint: {
                        zh: '主炮区会持续压屏，能清侧翼就别只盯正前。',
                        en: 'The main gun zone compresses the screen. Clear the flanks instead of tunneling forward.'
                    },
                    enemyCapBonus: 2,
                    firstEliteRate: 0.68,
                    eliteEveryRate: 0.7,
                    eliteHpRate: 1.22,
                    eliteDamageRate: 1.12
                },
                '4-6': {
                    openingHint: {
                        zh: '最终首领更吃节奏，留出位移空间，满能量就立刻出手。',
                        en: 'The final boss is rhythm-heavy. Keep escape space open and cast as soon as you are charged.'
                    },
                    enemyCapBonus: 0,
                    bossHpRate: 1.16,
                    bossDamageRate: 1.14,
                    bossBulletSpeedRate: 1.12,
                    chargeRate: 1.02,
                    bossDropRate: 1.2
                }
            },
            choiceCorePool: [
                'attack-rate',
                'projectile-count',
                'shield-refill',
                'pickup-range'
            ],
            choiceAdvancedPool: [
                'crit-arc',
                'ultimate-charge',
                'drone-overclock',
                'close-burst'
            ],
            levelChoicePool: [
                'attack-rate',
                'projectile-count',
                'shield-refill',
                'pickup-range',
                'crit-arc',
                'ultimate-charge',
                'drone-overclock',
                'close-burst'
            ],
            pressurePoints: [
                {
                    stageId: '1-1',
                    expectedPower: 130,
                    cause: {
                        zh: '棣栧叧鍏堢啛鎮夋嫋鎷借蛋浣嶃€佸惛缁忛獙鍜屼繚鎸佷腑绾跨┖浣嶃€?,
                        en: 'Use the opening stage to learn drag movement, XP pickup, and keeping the center lane open.'
                    },
                    playerHint: {
                        zh: '鍏堢ǔ鐫€鎵擄紝涓嶆€ョ潃璐竟瑙掔粡楠岋紝鐔熸倝鑺傚姣旂‖鍐叉洿閲嶈銆?,
                        en: 'Play steady first. Learning tempo matters more than chasing risky edge XP.'
                    },
                    goalTags: [
                        { zh: '鍏堢啛鎮夎蛋浣?, en: 'Learn Movement' },
                        { zh: '缁忛獙浼樺厛', en: 'XP First' }
                    ],
                    recommendedFocus: []
                },
                {
                    stageId: '1-2',
                    expectedPower: 200,
                    cause: {
                        zh: '寮€濮嬮渶瑕佷竴鐐圭ǔ瀹氳緭鍑猴紝涓绘鍏堟彁涓€绾у氨浼氶『寰堝銆?,
                        en: 'You now need a little more stable damage, and one main-weapon level smooths this out a lot.'
                    },
                    playerHint: {
                        zh: '浼樺厛鎶婁富姝﹁ˉ鍒?Lv2锛屽啀缁х画缁冧範杈硅蛋杈瑰悆缁忛獙銆?,
                        en: 'Raise your main weapon to Lv2 first, then keep practicing move-and-collect rhythm.'
                    },
                    goalTags: [
                        { zh: '涓绘 Lv2', en: 'Main Wpn Lv2' },
                        { zh: '绋冲悆缁忛獙', en: 'Safe XP' }
                    ],
                    targetBuild: {
                        weaponTargetLevels: [2, 1]
                    },
                    goalCost: { credits: 120, alloy: 12, signal: 0 },
                    totalCost: { credits: 120, alloy: 12, signal: 0 },
                    recommendedFocus: ['weaponLv2']
                },
                {
                    stageId: '1-3',
                    expectedPower: 290,
                    cause: {
                        zh: '绗簩鎶婃鍣ㄥ紑濮嬪奖鍝嶆竻绾块€熷害锛屽弻姝﹀悓姝ヤ細鏇寸ǔ銆?,
                        en: 'Your second weapon starts affecting clear speed, so synced dual-weapon levels feel much steadier.'
                    },
                    playerHint: {
                        zh: '鎶婂弻姝﹂兘琛ュ埌 Lv2锛屾竻鎬┖闂翠細鏄庢樉鏇磋垝鏈嶃€?,
                        en: 'Bring both weapons to Lv2 and the room you play in becomes noticeably safer.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv2', en: '2 Wpn Lv2' },
                        { zh: '涓嚎娓呮€?, en: 'Center Clear' }
                    ],
                    targetBuild: {
                        weaponTargetLevels: [2, 2]
                    },
                    goalCost: { credits: 120, alloy: 12, signal: 0 },
                    totalCost: { credits: 240, alloy: 24, signal: 0 },
                    recommendedFocus: ['weaponLv2']
                },
                {
                    stageId: '1-4',
                    expectedPower: 430,
                    cause: {
                        zh: '绗竴娆℃€兢瀵嗗害鎶崌锛屽紑濮嬭€冮獙鍓绛夌骇鍜屽熀纭€鎴樺姏鐮旂┒銆?,
                        en: 'This is the first real density spike, testing your off-weapon level and basic combat research.'
                    },
                    playerHint: {
                        zh: '鎶婄浜屾妸姝﹀櫒鎻愬埌 Lv3锛屽啀琛ユ帹杩涚綉鏍?1锛屾帹杩涗細椤哄緢澶氥€?,
                        en: 'Push the second weapon to Lv3, then add Thruster Mesh 1 for a much smoother push.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv2', en: '2 Wpn Lv2' },
                        { zh: '鍓 Lv3', en: '2nd Wpn Lv3' },
                        { zh: '鎺ㄨ繘 1', en: 'Mesh 1' }
                    ],
                    targetBuild: {
                        weaponTargetLevels: [2, 3],
                        researchLevels: { 'thruster-mesh': 1 }
                    },
                    goalCost: { credits: 400, alloy: 16, signal: 2 },
                    totalCost: { credits: 640, alloy: 40, signal: 2 },
                    recommendedFocus: ['weaponLv3', 'thruster-mesh-1'],
                    recommendedOffer: 'starter'
                },
                {
                    stageId: '1-5',
                    expectedPower: 570,
                    cause: {
                        zh: '棣栧彧绮捐嫳寮€濮嬪帇缂╃珯浣嶏紝鏈轰綋瀹归敊鍜屽弻姝﹀悓姝ラ兘瑕佽窡涓娿€?,
                        en: 'The first elite starts squeezing your movement space, so hull safety and synced dual weapons both matter.'
                    },
                    playerHint: {
                        zh: '鏈轰綋鍏堝埌 Lv2锛屽弻姝﹀悓姝ュ埌 Lv3锛屾墦绮捐嫳浼氱ǔ寰堝銆?,
                        en: 'Get the hull to Lv2 and both weapons to Lv3 for a much steadier elite fight.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv2', en: 'Hull Lv2' },
                        { zh: '鍙屾 Lv3', en: '2 Wpn Lv3' },
                        { zh: '绮捐嫳棰勫', en: 'Elite Prep' }
                    ],
                    targetBuild: {
                        hullLevel: 2,
                        weaponTargetLevels: [3, 3],
                        researchLevels: { 'thruster-mesh': 1 }
                    },
                    goalCost: { credits: 340, alloy: 26, signal: 0 },
                    totalCost: { credits: 980, alloy: 66, signal: 2 },
                    recommendedFocus: ['hullLv2', 'weaponLv3'],
                    recommendedOffer: 'starter'
                },
                {
                    stageId: '1-6',
                    expectedPower: 760,
                    cause: {
                        zh: '棣栦釜 Boss 浼氭鏌ョ画鑸笌澶ф嫑鑺傚锛屽崟鐐硅緭鍑轰笉鍐嶅鐢ㄣ€?,
                        en: 'The first boss checks sustain and ultimate timing, so raw damage alone is no longer enough.'
                    },
                    playerHint: {
                        zh: '鏈轰綋鍒?Lv3锛屽啀琛ユ牳蹇冨弽搴斿爢 1锛岄涓?Boss 浼氱ǔ寰堝銆?,
                        en: 'Raise the hull to Lv3 and add Core Reactor 1 to make the first boss much steadier.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv3', en: 'Hull Lv3' },
                        { zh: '鍙屾 Lv3', en: '2 Wpn Lv3' },
                        { zh: '鏍稿績 1', en: 'Core 1' }
                    ],
                    targetBuild: {
                        hullLevel: 3,
                        weaponTargetLevels: [3, 3],
                        researchLevels: {
                            'thruster-mesh': 1,
                            'core-reactor': 1
                        }
                    },
                    goalCost: { credits: 420, alloy: 14, signal: 2 },
                    totalCost: { credits: 1400, alloy: 80, signal: 4 },
                    recommendedFocus: ['hullLv3', 'core-reactor-1'],
                    recommendedOffer: 'starter'
                },
                {
                    stageId: '2-1',
                    expectedPower: 960,
                    cause: {
                        zh: '绗簩绔犲紑鍦哄紑濮嬫媺闀挎垬绾匡紝琛ヤ竴妗ｆ棤浜烘満鑳芥槑鏄炬敼鍠勫惛闄勫拰琛ヤ激銆?,
                        en: 'Chapter 2 starts stretching fights out, and one drone level noticeably improves pickup flow and chip damage.'
                    },
                    playerHint: {
                        zh: '涓绘鍏堝埌 Lv4锛屽啀琛ユ棤浜烘満 Lv2锛岃繘绗簩绔犱細鏇撮『銆?,
                        en: 'Push the main weapon to Lv4 first, then bring the drone to Lv2 for a smoother Chapter 2 entry.'
                    },
                    goalTags: [
                        { zh: '涓绘 Lv4', en: 'Main Wpn Lv4' },
                        { zh: '鏃犱汉鏈?Lv2', en: 'Drone Lv2' },
                        { zh: '浜岀珷寮€鍦?, en: 'C2 Entry' }
                    ],
                    targetBuild: {
                        hullLevel: 3,
                        weaponTargetLevels: [4, 3],
                        droneLevel: 2,
                        researchLevels: {
                            'thruster-mesh': 1,
                            'core-reactor': 1
                        }
                    },
                    goalCost: { credits: 360, alloy: 30, signal: 0 },
                    totalCost: { credits: 1760, alloy: 110, signal: 4 },
                    recommendedFocus: ['weaponLv4', 'droneLv2'],
                    recommendedOffer: 'starter'
                },
                {
                    stageId: '2-2',
                    expectedPower: 1220,
                    cause: {
                        zh: '杩欓噷寮€濮嬪嚭鐜板悎閲戜笌鐮旂┒鐨勫弻绾垮帇鍔涳紝涓嶈兘鍙爢鍗曟ā鍧椼€?,
                        en: 'This is where alloy pressure and research pressure start arriving together, so single-path upgrades fall off.'
                    },
                    playerHint: {
                        zh: '鏈轰綋鍜屽弻姝﹂兘鎻愪竴妗ｏ紝鍐嶈ˉ鎺ㄨ繘 2 涓庡帇閾?1锛屼腑鏈熶細鏇寸ǔ銆?,
                        en: 'Raise the hull and both weapons, then add Mesh 2 and Alloy Press 1 for a steadier mid-game.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv4', en: 'Hull Lv4' },
                        { zh: '鍙屾 Lv4', en: '2 Wpn Lv4' },
                        { zh: '鍘嬮摳 1', en: 'Press 1' }
                    ],
                    targetBuild: {
                        hullLevel: 4,
                        weaponTargetLevels: [4, 4],
                        droneLevel: 2,
                        researchLevels: {
                            'thruster-mesh': 2,
                            'alloy-press': 1,
                            'core-reactor': 1
                        }
                    },
                    goalCost: { credits: 1130, alloy: 42, signal: 5 },
                    totalCost: { credits: 2890, alloy: 152, signal: 9 },
                    recommendedFocus: ['hullLv4', 'thruster-mesh-2', 'alloy-press-1'],
                    recommendedOffer: 'accelerator'
                },
                {
                    stageId: '2-3',
                    expectedPower: 1540,
                    cause: {
                        zh: '涓湡绗竴娆″畬鏁存垬鍔涢棬妲涙潵浜嗭紝姝﹀櫒銆佸ぇ鎷涘拰鐮旂┒閮藉緱璺熶笂銆?,
                        en: 'The first full mid-game power check is here, and weapons, ultimate, and research all need to keep up.'
                    },
                    playerHint: {
                        zh: '鍙屾鎻愬埌 Lv5锛屽啀琛ュぇ鎷?2 鍜屽帇閾?2锛岃繖娈典細椤哄緢澶氥€?,
                        en: 'Bring both weapons to Lv5, then add Ultimate 2 and Press 2 to smooth this stretch out.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv5', en: '2 Wpn Lv5' },
                        { zh: '澶ф嫑 Lv2', en: 'Ult Lv2' },
                        { zh: '鍘嬮摳 2', en: 'Press 2' }
                    ],
                    targetBuild: {
                        hullLevel: 4,
                        weaponTargetLevels: [5, 5],
                        ultimateLevel: 2,
                        researchLevels: {
                            'thruster-mesh': 3,
                            'alloy-press': 2,
                            'core-reactor': 1
                        }
                    },
                    goalCost: { credits: 1680, alloy: 66, signal: 9 },
                    totalCost: { credits: 4570, alloy: 218, signal: 18 },
                    recommendedFocus: ['weaponLv5', 'ultimateLv2', 'alloy-press-2'],
                    recommendedOffer: 'accelerator'
                },
                {
                    stageId: '2-4',
                    expectedPower: 1930,
                    cause: {
                        zh: '闀挎尝娆″紑濮嬭€冮獙鎸佺画琛ュ垁涓庢嬀鍙栨晥鐜囷紝闇€瑕佹妸鑺傚鎷夌ǔ銆?,
                        en: 'Longer waves start testing sustained clear and pickup efficiency, so your rhythm needs to stabilize.'
                    },
                    playerHint: {
                        zh: '琛ュ埌鏃犱汉鏈?Lv3锛屼繚鎸佸弻姝?Lv5锛岃繖鍏充細鑸掓湇寰堝銆?,
                        en: 'Add Drone Lv3 while holding dual Lv5 weapons and this stage feels much cleaner.'
                    },
                    goalTags: [
                        { zh: '鏃犱汉鏈?Lv3', en: 'Drone Lv3' },
                        { zh: '鍙屾 Lv5', en: '2 Wpn Lv5' },
                        { zh: '绋充綇娉㈡', en: 'Stable Waves' }
                    ],
                    targetBuild: {
                        hullLevel: 4,
                        weaponTargetLevels: [5, 5],
                        droneLevel: 3,
                        ultimateLevel: 2,
                        researchLevels: {
                            'thruster-mesh': 3,
                            'alloy-press': 2,
                            'core-reactor': 1
                        }
                    },
                    goalCost: { credits: 230, alloy: 20, signal: 0 },
                    totalCost: { credits: 4800, alloy: 238, signal: 18 },
                    recommendedFocus: ['droneLv3', 'weaponLv5'],
                    recommendedOffer: 'accelerator'
                },
                {
                    stageId: '2-5',
                    expectedPower: 2400,
                    cause: {
                        zh: '绮捐嫳寮€濮嬭繛缁帇杩涳紝鍗曢潬璧颁綅宸蹭笉澶燂紝闇€瑕佸墠鎺掍激瀹虫洿蹇垚鍨嬨€?,
                        en: 'Elites start chaining into each other, and movement alone is no longer enough without faster front-loaded damage.'
                    },
                    playerHint: {
                        zh: '涓绘鍏堝埌 Lv6锛屾満浣撹ˉ鍒?Lv5锛屽啀鎶婃牳蹇冨弽搴斿爢鎻愬埌 2銆?,
                        en: 'Push the main weapon to Lv6, bring the hull to Lv5, and then raise Core Reactor to 2.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv5', en: 'Hull Lv5' },
                        { zh: '涓绘 Lv6', en: 'Main Wpn Lv6' },
                        { zh: '鏍稿績 2', en: 'Core 2' }
                    ],
                    targetBuild: {
                        hullLevel: 5,
                        weaponTargetLevels: [6, 5],
                        droneLevel: 3,
                        ultimateLevel: 2,
                        researchLevels: {
                            'thruster-mesh': 3,
                            'alloy-press': 3,
                            'core-reactor': 2
                        }
                    },
                    goalCost: { credits: 1810, alloy: 70, signal: 7 },
                    totalCost: { credits: 6610, alloy: 308, signal: 25 },
                    recommendedFocus: ['weaponLv6', 'hullLv5', 'core-reactor-2'],
                    recommendedOffer: 'accelerator'
                },
                {
                    stageId: '2-6',
                    expectedPower: 2940,
                    cause: {
                        zh: '绗簩绔?Boss 寮€濮嬫鏌ユ暣濂楀惊鐜槸鍚﹀畬鏁达紝澶ф嫑涓庡熀纭€鎴樺姏閮戒笉鑳芥帀闃熴€?,
                        en: 'The Chapter 2 boss starts checking whether your whole loop is complete, including ultimate timing and baseline combat power.'
                    },
                    playerHint: {
                        zh: '鍙屾琛ラ綈鍒?Lv6锛屽啀鎻愬ぇ鎷?3 鍜屾帹杩?4锛孊oss 浼氱ǔ寰堝銆?,
                        en: 'Finish dual Lv6 weapons, then add Ultimate 3 and Mesh 4 to steady the boss fight.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv6', en: '2 Wpn Lv6' },
                        { zh: '澶ф嫑 Lv3', en: 'Ult Lv3' },
                        { zh: '鎺ㄨ繘 4', en: 'Mesh 4' }
                    ],
                    targetBuild: {
                        hullLevel: 5,
                        weaponTargetLevels: [6, 6],
                        droneLevel: 3,
                        ultimateLevel: 3,
                        researchLevels: {
                            'thruster-mesh': 4,
                            'alloy-press': 3,
                            'core-reactor': 2
                        }
                    },
                    goalCost: { credits: 1660, alloy: 62, signal: 9 },
                    totalCost: { credits: 8270, alloy: 370, signal: 34 },
                    recommendedFocus: ['weaponLv6', 'ultimateLv3', 'thruster-mesh-4'],
                    recommendedOffer: 'accelerator'
                },
                {
                    stageId: '3-1',
                    expectedPower: 3620,
                    cause: {
                        zh: '绗笁绔犺捣鎵嬬簿鑻卞帇鍔涙洿鏃╁埌鏉ワ紝鎺у満涓庨澶栬ˉ浼よ涓€璧疯ˉ涓娿€?,
                        en: 'Chapter 3 brings elite pressure in earlier, so control and extra support damage both need to come online.'
                    },
                    playerHint: {
                        zh: '鏃犱汉鏈烘彁鍒?Lv4锛屽啀琛ョ簿鑻卞崗璁?1锛屽墠鍑犲叧浼氭洿椤恒€?,
                        en: 'Raise the drone to Lv4, then add Elite Protocol 1 for a smoother opening stretch.'
                    },
                    goalTags: [
                        { zh: '鏃犱汉鏈?Lv4', en: 'Drone Lv4' },
                        { zh: '绮捐嫳 1', en: 'Elite 1' },
                        { zh: '鎺у満璧锋', en: 'Control Start' }
                    ],
                    targetBuild: {
                        hullLevel: 5,
                        weaponTargetLevels: [6, 6],
                        droneLevel: 4,
                        ultimateLevel: 3,
                        researchLevels: {
                            'thruster-mesh': 4,
                            'alloy-press': 3,
                            'elite-protocol': 1,
                            'core-reactor': 2
                        }
                    },
                    goalCost: { credits: 440, alloy: 18, signal: 2 },
                    totalCost: { credits: 8710, alloy: 388, signal: 36 },
                    recommendedFocus: ['droneLv4', 'elite-protocol-1'],
                    recommendedOffer: 'rush'
                },
                {
                    stageId: '3-2',
                    expectedPower: 4420,
                    cause: {
                        zh: '绮捐嫳鐨勮绾挎洿闀匡紝鏀剁泭鐮旂┒濡傛灉钀藉悗锛屼腑娈典細鏄庢樉鎷栨參銆?,
                        en: 'Elites live longer here, and falling behind on elite reward research noticeably slows the mid stretch.'
                    },
                    playerHint: {
                        zh: '鎶婄簿鑻卞崗璁彁鍒?2锛岀户缁繚鎸佸弻姝?6 鐨勬竻绾挎晥鐜囥€?,
                        en: 'Raise Elite Protocol to 2 while holding your dual Lv6 clear pace.'
                    },
                    goalTags: [
                        { zh: '绮捐嫳 2', en: 'Elite 2' },
                        { zh: '鍙屾 Lv6', en: '2 Wpn Lv6' },
                        { zh: '鎸佺画娓呯嚎', en: 'Sustain Clear' }
                    ],
                    targetBuild: {
                        hullLevel: 5,
                        weaponTargetLevels: [6, 6],
                        droneLevel: 4,
                        ultimateLevel: 3,
                        researchLevels: {
                            'thruster-mesh': 4,
                            'alloy-press': 3,
                            'elite-protocol': 2,
                            'core-reactor': 2
                        }
                    },
                    goalCost: { credits: 340, alloy: 0, signal: 3 },
                    totalCost: { credits: 9050, alloy: 388, signal: 39 },
                    recommendedFocus: ['elite-protocol-2', 'weaponLv6'],
                    recommendedOffer: 'rush'
                },
                {
                    stageId: '3-3',
                    expectedPower: 5480,
                    cause: {
                        zh: '杩欓噷鏄涓€娆″畬鏁存瀯绛戞楠岋紝灏忓箙鎻愭棭淇″彿璋冭皭鑳藉噺杞诲悗闈㈢殑鐮旂┒璐熸媴銆?,
                        en: 'This is the first full-build check, and an early Signal Tuner pick slightly lightens the research burden ahead.'
                    },
                    playerHint: {
                        zh: '鍏堝紑淇″彿璋冭皭 1锛屾妸鍚庨潰鍑犳。鐮旂┒鎴愭湰鍘嬩笅鏉ワ紝鎺ㄨ繘浼氭洿椤恒€?,
                        en: 'Open Signal Tuner 1 first to shave down the next few research steps and keep the push smooth.'
                    },
                    goalTags: [
                        { zh: '璋冭皭 1', en: 'Tuner 1' },
                        { zh: '澶ф嫑 Lv3', en: 'Ult Lv3' },
                        { zh: '瀹屾暣鏋勭瓚', en: 'Full Build' }
                    ],
                    targetBuild: {
                        hullLevel: 5,
                        weaponTargetLevels: [6, 6],
                        droneLevel: 4,
                        ultimateLevel: 3,
                        researchLevels: {
                            'thruster-mesh': 4,
                            'alloy-press': 3,
                            'signal-tuner': 1,
                            'elite-protocol': 2,
                            'core-reactor': 2
                        }
                    },
                    goalCost: { credits: 58, alloy: 0, signal: 2 },
                    totalCost: { credits: 9108, alloy: 388, signal: 41 },
                    recommendedFocus: ['signal-tuner-1', 'ultimateLv3', 'elite-protocol-2'],
                    recommendedOffer: 'rush'
                },
                {
                    stageId: '3-4',
                    expectedPower: 6680,
                    cause: {
                        zh: '閲嶇伀鍔涗笌鍚庢湡鐮旂┒寮€濮嬬湡姝ｆ帴绠¤妭濂忥紝杩欓噷闇€瑕佹媺寮€涓诲姏妯″潡妗ｄ綅銆?,
                        en: 'Heavy weapons and late-game research start taking over the pacing here, so core modules need a bigger jump.'
                    },
                    playerHint: {
                        zh: '鏈轰綋鎻愬埌 Lv6锛屼富姝﹀厛涓?Lv7锛屽啀琛ユ牳蹇?3锛屼細鏄庢樉椤哄緢澶氥€?,
                        en: 'Raise the hull to Lv6, push the main weapon to Lv7, then add Core 3 for a much smoother climb.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv6', en: 'Hull Lv6' },
                        { zh: '涓绘 Lv7', en: 'Main Wpn Lv7' },
                        { zh: '鏍稿績 3', en: 'Core 3' }
                    ],
                    targetBuild: {
                        hullLevel: 6,
                        weaponTargetLevels: [7, 6],
                        droneLevel: 4,
                        ultimateLevel: 3,
                        researchLevels: {
                            'thruster-mesh': 5,
                            'alloy-press': 3,
                            'signal-tuner': 1,
                            'elite-protocol': 2,
                            'core-reactor': 3
                        }
                    },
                    goalCost: { credits: 3112, alloy: 98, signal: 12 },
                    totalCost: { credits: 12220, alloy: 486, signal: 53 },
                    recommendedFocus: ['weaponLv7', 'hullLv6', 'core-reactor-3'],
                    recommendedOffer: 'rush'
                },
                {
                    stageId: '3-5',
                    expectedPower: 8120,
                    cause: {
                        zh: '绮捐嫳鐖嗗彂鍜屽熬娈靛瘑搴︿竴璧锋姮鍗囷紝闇€瑕佸畬鏁寸殑杈撳嚭涓庣画鑸粍浠躲€?,
                        en: 'Elite burst windows and late-wave density both rise here, calling for a complete damage-and-sustain package.'
                    },
                    playerHint: {
                        zh: '鎶婂弻姝﹁ˉ鍒?Lv7锛屽啀鎻愭棤浜烘満 5 鍜屽ぇ鎷?4锛岃繖娈典細绋冲緢澶氥€?,
                        en: 'Finish dual Lv7 weapons, then raise the drone to 5 and the ultimate to 4 for a steadier stretch.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv7', en: '2 Wpn Lv7' },
                        { zh: '鏃犱汉鏈?Lv5', en: 'Drone Lv5' },
                        { zh: '澶ф嫑 Lv4', en: 'Ult Lv4' }
                    ],
                    targetBuild: {
                        hullLevel: 6,
                        weaponTargetLevels: [7, 7],
                        droneLevel: 5,
                        ultimateLevel: 4,
                        researchLevels: {
                            'thruster-mesh': 5,
                            'alloy-press': 4,
                            'signal-tuner': 2,
                            'elite-protocol': 3,
                            'core-reactor': 3
                        }
                    },
                    goalCost: { credits: 2882, alloy: 112, signal: 17 },
                    totalCost: { credits: 15102, alloy: 598, signal: 70 },
                    recommendedFocus: ['weaponLv7', 'droneLv5', 'ultimateLv4'],
                    recommendedOffer: 'rush'
                },
                {
                    stageId: '3-6',
                    expectedPower: 9860,
                    cause: {
                        zh: '杩欎竴鎴樺紑濮嬫洿鐪嬮噸 Boss 鐖嗗彂绐楀彛锛屽ぇ鎷涘惊鐜繀椤绘洿楗辨弧銆?,
                        en: 'This fight leans harder on burst windows, so your ultimate cycle needs more margin.'
                    },
                    playerHint: {
                        zh: '鎶婃牳蹇冨弽搴斿爢鎻愬埌 4锛孊oss 鐨勭垎鍙戣妭濂忎細绋冲畾寰堝銆?,
                        en: 'Raise Core Reactor to 4 to make the boss burst cycle noticeably steadier.'
                    },
                    goalTags: [
                        { zh: '鏍稿績 4', en: 'Core 4' },
                        { zh: 'Boss 鐖嗗彂', en: 'Boss Burst' },
                        { zh: '鍙屾 Lv7', en: '2 Wpn Lv7' }
                    ],
                    targetBuild: {
                        hullLevel: 6,
                        weaponTargetLevels: [7, 7],
                        droneLevel: 5,
                        ultimateLevel: 4,
                        researchLevels: {
                            'thruster-mesh': 5,
                            'alloy-press': 4,
                            'signal-tuner': 2,
                            'elite-protocol': 3,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 534, alloy: 0, signal: 6 },
                    totalCost: { credits: 15636, alloy: 598, signal: 76 },
                    recommendedFocus: ['core-reactor-4', 'ultimateLv4'],
                    recommendedOffer: 'sovereign'
                },
                {
                    stageId: '4-1',
                    expectedPower: 11900,
                    cause: {
                        zh: '缁堢珷寮€鍦烘洿鑰冮獙鍚庣画鐮旂┒鎴愭湰鎺у埗锛屼笉鍙槸鍗曠函鍫嗕激瀹炽€?,
                        en: 'The final chapter opening starts caring more about future research efficiency than raw damage alone.'
                    },
                    playerHint: {
                        zh: '鍏堟妸淇″彿璋冭皭鎻愬埌 3锛屽悗闈㈢殑缁堢珷琛ュ己浼氳交寰堝銆?,
                        en: 'Bring Signal Tuner up to 3 first to make the rest of the final chapter much lighter.'
                    },
                    goalTags: [
                        { zh: '璋冭皭 3', en: 'Tuner 3' },
                        { zh: '缁堢珷璧锋', en: 'Final Entry' },
                        { zh: '绋冲畾杞寲', en: 'Stable Scaling' }
                    ],
                    targetBuild: {
                        hullLevel: 6,
                        weaponTargetLevels: [7, 7],
                        droneLevel: 5,
                        ultimateLevel: 4,
                        researchLevels: {
                            'thruster-mesh': 5,
                            'alloy-press': 4,
                            'signal-tuner': 3,
                            'elite-protocol': 3,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 148, alloy: 0, signal: 0 },
                    totalCost: { credits: 15784, alloy: 598, signal: 76 },
                    recommendedFocus: ['signal-tuner-3'],
                    recommendedOffer: 'sovereign'
                },
                {
                    stageId: '4-2',
                    expectedPower: 14100,
                    cause: {
                        zh: '鍚庢湡绗竴閬撶‖澧欐潵浜嗭紝闇€瑕佹洿楂樼殑鍓嶆帓鐖嗗彂鎶婅妭濂忔姠鍥炴潵銆?,
                        en: 'The first true late-game wall is here, and you need more front-loaded damage to reclaim tempo.'
                    },
                    playerHint: {
                        zh: '鍏堟妸涓€鎶婁富鍔涙鍣ㄦ彁鍒?Lv8锛岄珮鍘嬫尝娆′細鏄庢樉鏇村鏄撳鐞嗐€?,
                        en: 'Push one core weapon to Lv8 first and the high-pressure waves become much easier to control.'
                    },
                    goalTags: [
                        { zh: '涓绘 Lv8', en: 'Main Wpn Lv8' },
                        { zh: '楂樺帇鎶㈣妭濂?, en: 'Tempo Lead' },
                        { zh: '璋冭皭 3', en: 'Tuner 3' }
                    ],
                    targetBuild: {
                        hullLevel: 6,
                        weaponTargetLevels: [8, 7],
                        droneLevel: 5,
                        ultimateLevel: 4,
                        researchLevels: {
                            'thruster-mesh': 5,
                            'alloy-press': 4,
                            'signal-tuner': 3,
                            'elite-protocol': 3,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 1380, alloy: 80, signal: 0 },
                    totalCost: { credits: 17164, alloy: 678, signal: 76 },
                    recommendedFocus: ['weaponLv8', 'signal-tuner-3'],
                    recommendedOffer: 'sovereign'
                },
                {
                    stageId: '4-3',
                    expectedPower: 17100,
                    cause: {
                        zh: '杩欓噷閲嶆柊鍥炲埌澶氱郴缁熷悓姝ユ垚闀匡紝鏈轰綋鍜屽熀纭€鎴樺姏鐮旂┒瑕佷竴璧锋媺鍗囥€?,
                        en: 'This stage returns to synchronized multi-system growth, asking for both hull strength and baseline power research.'
                    },
                    playerHint: {
                        zh: '鏈轰綋鎻愬埌 Lv7锛屽啀琛ユ帹杩?6锛岃繖娈甸暱绾挎垬鏂椾細绋冲緢澶氥€?,
                        en: 'Raise the hull to Lv7, then add Mesh 6 to steady these longer late-game fights.'
                    },
                    goalTags: [
                        { zh: '鏈轰綋 Lv7', en: 'Hull Lv7' },
                        { zh: '鎺ㄨ繘 6', en: 'Mesh 6' },
                        { zh: '闀跨嚎浣滄垬', en: 'Long Fight' }
                    ],
                    targetBuild: {
                        hullLevel: 7,
                        weaponTargetLevels: [8, 7],
                        droneLevel: 5,
                        ultimateLevel: 4,
                        researchLevels: {
                            'thruster-mesh': 6,
                            'alloy-press': 4,
                            'signal-tuner': 3,
                            'elite-protocol': 3,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 2535, alloy: 56, signal: 10 },
                    totalCost: { credits: 19699, alloy: 734, signal: 86 },
                    recommendedFocus: ['hullLv7', 'thruster-mesh-6', 'core-reactor-4'],
                    recommendedOffer: 'sovereign'
                },
                {
                    stageId: '4-4',
                    expectedPower: 20400,
                    cause: {
                        zh: '缁堢洏鍓嶇殑瀹屾暣绋冲畾鎬ф祴璇曟潵浜嗭紝杈撳嚭銆佺画鑸拰鐮旂┒娣卞害閮借鍒颁綅銆?,
                        en: 'The full pre-finale stability test is here, and damage, sustain, and research depth all need to be online.'
                    },
                    playerHint: {
                        zh: '鍙屾琛ラ綈鍒?Lv8锛屽啀鎻愭棤浜烘満 6銆佸ぇ鎷?5 鍜岀簿鑻?4锛岀粓鐩樹細绋冲緢澶氥€?,
                        en: 'Finish dual Lv8 weapons, then raise Drone 6, Ultimate 5, and Elite 4 to steady the final stretch.'
                    },
                    goalTags: [
                        { zh: '鍙屾 Lv8', en: '2 Wpn Lv8' },
                        { zh: '鏃犱汉鏈?Lv6', en: 'Drone Lv6' },
                        { zh: '绮捐嫳 4', en: 'Elite 4' }
                    ],
                    targetBuild: {
                        hullLevel: 7,
                        weaponTargetLevels: [8, 8],
                        droneLevel: 6,
                        ultimateLevel: 5,
                        researchLevels: {
                            'thruster-mesh': 6,
                            'alloy-press': 4,
                            'signal-tuner': 4,
                            'elite-protocol': 4,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 3579, alloy: 156, signal: 13 },
                    totalCost: { credits: 23278, alloy: 890, signal: 99 },
                    recommendedFocus: ['weaponLv8', 'droneLv6', 'elite-protocol-4'],
                    recommendedOffer: 'nexus'
                },
                {
                    stageId: '4-5',
                    expectedPower: 24400,
                    cause: {
                        zh: '鏈€鍚庣殑绮捐嫳鍏虫洿鍍忕爺绌惰ˉ鍏ㄧ偣锛岄噸鍦ㄦ妸缁堝眬璧勬簮鏁堢巼琛ユ弧銆?,
                        en: 'The last elite stage plays more like a research-finishing checkpoint, focused on capping endgame efficiency.'
                    },
                    playerHint: {
                        zh: '鎶婂悎閲戝帇閾歌ˉ鍒?5锛屾渶缁堝嚑妗ｈˉ寮轰細鏇磋交鏉俱€?,
                        en: 'Raise Alloy Press to 5 and the final few upgrade steps become much easier to fund.'
                    },
                    goalTags: [
                        { zh: '鍘嬮摳 5', en: 'Press 5' },
                        { zh: '澶ф嫑 Lv5', en: 'Ult Lv5' },
                        { zh: '缁堝眬棰勭儹', en: 'Final Prep' }
                    ],
                    targetBuild: {
                        hullLevel: 7,
                        weaponTargetLevels: [8, 8],
                        droneLevel: 6,
                        ultimateLevel: 5,
                        researchLevels: {
                            'thruster-mesh': 6,
                            'alloy-press': 5,
                            'signal-tuner': 4,
                            'elite-protocol': 4,
                            'core-reactor': 4
                        }
                    },
                    goalCost: { credits: 722, alloy: 0, signal: 7 },
                    totalCost: { credits: 24000, alloy: 890, signal: 106 },
                    recommendedFocus: ['alloy-press-5', 'ultimateLv5'],
                    recommendedOffer: 'nexus'
                },
                {
                    stageId: '4-6',
                    expectedPower: 29200,
                    cause: {
                        zh: '鏈€缁?Boss 鏇寸湅閲嶅厖鑳借妭濂忎笌鏀跺熬寰幆锛岀粓灞€鐮旂┒瑕佸畬鏁撮棴鐜€?,
                        en: 'The final boss leans harder on charge cadence and end-of-run loops, so your endgame research needs to be fully closed out.'
                    },
                    playerHint: {
                        zh: '鎶婁俊鍙疯皟璋愬拰鏍稿績鍙嶅簲鍫嗛兘琛ユ弧锛屾渶缁堟垬浼氱ǔ寰堝銆?,
                        en: 'Finish both Signal Tuner and Core Reactor to make the final fight much more stable.'
                    },
                    goalTags: [
                        { zh: '璋冭皭 5', en: 'Tuner 5' },
                        { zh: '鏍稿績 5', en: 'Core 5' },
                        { zh: '缁堝眬寰幆', en: 'Final Loop' }
                    ],
                    targetBuild: {
                        hullLevel: 7,
                        weaponTargetLevels: [8, 8],
                        droneLevel: 6,
                        ultimateLevel: 5,
                        researchLevels: {
                            'thruster-mesh': 6,
                            'alloy-press': 5,
                            'signal-tuner': 5,
                            'elite-protocol': 4,
                            'core-reactor': 5
                        }
                    },
                    goalCost: { credits: 1134, alloy: 0, signal: 7 },
                    totalCost: { credits: 25134, alloy: 890, signal: 113 },
                    recommendedFocus: ['signal-tuner-5', 'core-reactor-5', 'weaponLv8'],
                    recommendedOffer: 'nexus'
                }
            ]
        },
        hulls: [
            {
                id: 'flare',
                unlockStage: '1-1',
                name: { zh: '余烬机体', en: 'Flare Hull' },
                role: { zh: '均衡新手', en: 'Balanced Starter' },
                perk: { zh: '开局护盾回复更稳', en: 'Steadier opening shield flow' },
                stats: { hp: 100, shield: 60, speed: 1, power: 80 }
            },
            {
                id: 'bulwark',
                unlockStage: '1-4',
                name: { zh: '壁垒机体', en: 'Bulwark Hull' },
                role: { zh: '容错生存', en: 'Tank Survival' },
                perk: { zh: '护盾厚，适合首领战', en: 'Heavy shield for boss fights' },
                stats: { hp: 118, shield: 84, speed: 0.92, power: 88 }
            },
            {
                id: 'vector',
                unlockStage: '2-2',
                name: { zh: '矢量机体', en: 'Vector Hull' },
                role: { zh: '高速闪避', en: 'High Mobility' },
                perk: { zh: '走位快，适合高密度关卡', en: 'Fast repositioning for dense stages' },
                stats: { hp: 86, shield: 46, speed: 1.12, power: 84 }
            }
        ],
        weapons: [
            {
                id: 'pulse-gun',
                unlockStage: '1-1',
                name: { zh: '脉冲炮', en: 'Pulse Gun' },
                role: { zh: '均衡速射', en: 'Balanced' },
                power: 54
            },
            {
                id: 'arc-laser',
                unlockStage: '1-1',
                name: { zh: '电弧激光', en: 'Arc Laser' },
                role: { zh: '持续主输出', en: 'Sustain DPS' },
                power: 58
            },
            {
                id: 'shard-cannon',
                unlockStage: '1-3',
                name: { zh: '碎片炮', en: 'Shard Cannon' },
                role: { zh: '清群爆发', en: 'Wave Burst' },
                power: 60
            },
            {
                id: 'rail-spike',
                unlockStage: '1-5',
                name: { zh: '轨钉炮', en: 'Rail Spike' },
                role: { zh: '穿透打线', en: 'Pierce' },
                power: 62
            },
            {
                id: 'swarm-missile',
                unlockStage: '2-2',
                name: { zh: '蜂群飞弹', en: 'Swarm Missile' },
                role: { zh: '自动追踪', en: 'Tracking' },
                power: 64
            },
            {
                id: 'ion-ring',
                unlockStage: '2-4',
                name: { zh: '离子环', en: 'Ion Ring' },
                role: { zh: '近身控场', en: 'Close Control' },
                power: 66
            },
            {
                id: 'tesla-web',
                unlockStage: '3-1',
                name: { zh: '特斯拉网', en: 'Tesla Web' },
                role: { zh: '范围减速', en: 'Area Slow' },
                power: 68
            },
            {
                id: 'singularity-core',
                unlockStage: '3-4',
                name: { zh: '奇点核炮', en: 'Singularity Core' },
                role: { zh: '后期重炮', en: 'Late Heavy' },
                power: 74
            }
        ],
        drones: [
            {
                id: 'scrap-magnet',
                unlockStage: '1-1',
                name: { zh: '废料磁吸机', en: 'Scrap Magnet' },
                role: { zh: '拾取辅助', en: 'Pickup' },
                power: 26
            },
            {
                id: 'guard-orb',
                unlockStage: '1-5',
                name: { zh: '守护球机', en: 'Guard Orb' },
                role: { zh: '护盾保护', en: 'Shield' },
                power: 28
            },
            {
                id: 'spark-healer',
                unlockStage: '2-1',
                name: { zh: '火花修复机', en: 'Spark Healer' },
                role: { zh: '续航恢复', en: 'Heal' },
                power: 28
            },
            {
                id: 'pierce-eye',
                unlockStage: '2-3',
                name: { zh: '穿刺瞄准机', en: 'Pierce Eye' },
                role: { zh: '首领专注', en: 'Boss Focus' },
                power: 30
            },
            {
                id: 'shock-scout',
                unlockStage: '3-1',
                name: { zh: '震荡侦察机', en: 'Shock Scout' },
                role: { zh: '控场辅助', en: 'Control' },
                power: 30
            },
            {
                id: 'echo-cache',
                unlockStage: '3-5',
                name: { zh: '回声缓存机', en: 'Echo Cache' },
                role: { zh: '充能辅助', en: 'Charge' },
                power: 32
            }
        ],
        ultimates: [
            {
                id: 'nova-burst',
                unlockStage: '1-1',
                name: { zh: '新星爆发', en: 'Nova Burst' },
                role: { zh: '基础清屏', en: 'Wave Clear' },
                cooldown: 32,
                chargeNeed: 100,
                power: 34
            },
            {
                id: 'phase-dash',
                unlockStage: '1-6',
                name: { zh: '相位穿梭', en: 'Phase Dash' },
                role: { zh: '位移脱险', en: 'Escape Dash' },
                cooldown: 26,
                chargeNeed: 90,
                power: 32
            },
            {
                id: 'gravity-net',
                unlockStage: '2-5',
                name: { zh: '引力网', en: 'Gravity Net' },
                role: { zh: '聚怪控场', en: 'Control Net' },
                cooldown: 36,
                chargeNeed: 110,
                power: 36
            },
            {
                id: 'orbital-lance',
                unlockStage: '3-6',
                name: { zh: '轨道长枪', en: 'Orbital Lance' },
                role: { zh: '首领爆发', en: 'Boss Burst' },
                cooldown: 40,
                chargeNeed: 120,
                power: 40
            }
        ],
        research: [
            {
                id: 'thruster-mesh',
                name: { zh: '推进网格', en: 'Thruster Mesh' },
                focus: { zh: '基础战力', en: 'Core Power' },
                maxLevel: 6,
                levels: [
                    { level: 1, credits: 220, signal: 2, powerBonus: 0.04 },
                    { level: 2, credits: 320, signal: 3, powerBonus: 0.08 },
                    { level: 3, credits: 470, signal: 4, powerBonus: 0.12 },
                    { level: 4, credits: 700, signal: 6, powerBonus: 0.16 },
                    { level: 5, credits: 1040, signal: 8, powerBonus: 0.20 },
                    { level: 6, credits: 1540, signal: 11, powerBonus: 0.24 }
                ]
            },
            {
                id: 'salvage-link',
                name: { zh: '回收链路', en: 'Salvage Link' },
                focus: { zh: '金币收益', en: 'Credit Yield' },
                maxLevel: 5,
                levels: [
                    { level: 1, credits: 180, signal: 2, creditsBonus: 0.05 },
                    { level: 2, credits: 260, signal: 3, creditsBonus: 0.10 },
                    { level: 3, credits: 380, signal: 4, creditsBonus: 0.15 },
                    { level: 4, credits: 560, signal: 6, creditsBonus: 0.20 },
                    { level: 5, credits: 820, signal: 8, creditsBonus: 0.25 }
                ]
            },
            {
                id: 'alloy-press',
                name: { zh: '合金压铸', en: 'Alloy Press' },
                focus: { zh: '合金收益', en: 'Alloy Yield' },
                maxLevel: 5,
                levels: [
                    { level: 1, credits: 180, signal: 2, alloyBonus: 0.06 },
                    { level: 2, credits: 260, signal: 3, alloyBonus: 0.12 },
                    { level: 3, credits: 390, signal: 4, alloyBonus: 0.18 },
                    { level: 4, credits: 580, signal: 6, alloyBonus: 0.24 },
                    { level: 5, credits: 860, signal: 8, alloyBonus: 0.30 }
                ]
            },
            {
                id: 'signal-tuner',
                name: { zh: '信号调谐', en: 'Signal Tuner' },
                focus: { zh: '研究减负', en: 'Research Discount' },
                maxLevel: 5,
                levels: [
                    { level: 1, credits: 200, signal: 2, researchDiscount: 0.04 },
                    { level: 2, credits: 300, signal: 3, researchDiscount: 0.08 },
                    { level: 3, credits: 450, signal: 4, researchDiscount: 0.12 },
                    { level: 4, credits: 670, signal: 6, researchDiscount: 0.16 },
                    { level: 5, credits: 1000, signal: 8, researchDiscount: 0.20 }
                ]
            },
            {
                id: 'elite-protocol',
                name: { zh: '精英协议', en: 'Elite Protocol' },
                focus: { zh: '精英收益', en: 'Elite Drops' },
                maxLevel: 4,
                levels: [
                    { level: 1, credits: 220, signal: 2, eliteDropBonus: 0.08 },
                    { level: 2, credits: 340, signal: 3, eliteDropBonus: 0.16 },
                    { level: 3, credits: 520, signal: 5, eliteDropBonus: 0.24 },
                    { level: 4, credits: 780, signal: 7, eliteDropBonus: 0.32 }
                ]
            },
            {
                id: 'core-reactor',
                name: { zh: '核心反应堆', en: 'Core Reactor' },
                focus: { zh: '大招充能', en: 'Ultimate Charge' },
                maxLevel: 5,
                levels: [
                    { level: 1, credits: 180, signal: 2, ultimateChargeBonus: 0.06 },
                    { level: 2, credits: 260, signal: 3, ultimateChargeBonus: 0.12 },
                    { level: 3, credits: 390, signal: 4, ultimateChargeBonus: 0.18 },
                    { level: 4, credits: 580, signal: 6, ultimateChargeBonus: 0.24 },
                    { level: 5, credits: 860, signal: 8, ultimateChargeBonus: 0.30 }
                ]
            }
        ],
        chapters: [
            { id: '1-1', chapter: 1, index: 1, name: { zh: '碎环外沿', en: 'Outer Debris' }, kind: 'normal', recommended: 140, duration: 120, enemyCap: 12, reward: { credits: 90, alloy: 8, signal: 0, seasonXp: 12 } },
            { id: '1-2', chapter: 1, index: 2, name: { zh: '漂浮残骸', en: 'Floating Scrap' }, kind: 'normal', recommended: 220, duration: 130, enemyCap: 13, reward: { credits: 110, alloy: 10, signal: 0, seasonXp: 14 } },
            { id: '1-3', chapter: 1, index: 3, name: { zh: '回收航道', en: 'Salvage Lane' }, kind: 'normal', recommended: 320, duration: 140, enemyCap: 14, reward: { credits: 140, alloy: 12, signal: 0, seasonXp: 16 } },
            { id: '1-4', chapter: 1, index: 4, name: { zh: '裂缝密带', en: 'Crack Cluster' }, kind: 'normal', recommended: 460, duration: 150, enemyCap: 16, reward: { credits: 180, alloy: 16, signal: 1, seasonXp: 20 } },
            { id: '1-5', chapter: 1, index: 5, name: { zh: '巡航封锁', en: 'Patrol Lockdown' }, kind: 'elite', recommended: 620, duration: 165, enemyCap: 17, reward: { credits: 230, alloy: 20, signal: 1, seasonXp: 24 } },
            { id: '1-6', chapter: 1, index: 6, name: { zh: '余烬守门者', en: 'Ember Gatekeeper' }, kind: 'boss', recommended: 820, duration: 180, enemyCap: 18, reward: { credits: 300, alloy: 26, signal: 2, seasonXp: 30 } },
            { id: '2-1', chapter: 2, index: 1, name: { zh: '低轨风暴', en: 'Low Orbit Storm' }, kind: 'normal', recommended: 1040, duration: 150, enemyCap: 18, reward: { credits: 360, alloy: 30, signal: 2, seasonXp: 34 } },
            { id: '2-2', chapter: 2, index: 2, name: { zh: '静电断层', en: 'Static Fault' }, kind: 'normal', recommended: 1320, duration: 165, enemyCap: 20, reward: { credits: 430, alloy: 36, signal: 3, seasonXp: 40 } },
            { id: '2-3', chapter: 2, index: 3, name: { zh: '回旋碎潮', en: 'Whirl Drift' }, kind: 'normal', recommended: 1660, duration: 180, enemyCap: 22, reward: { credits: 520, alloy: 42, signal: 3, seasonXp: 46 } },
            { id: '2-4', chapter: 2, index: 4, name: { zh: '裂片井道', en: 'Shard Well' }, kind: 'normal', recommended: 2080, duration: 195, enemyCap: 23, reward: { credits: 630, alloy: 50, signal: 4, seasonXp: 54 } },
            { id: '2-5', chapter: 2, index: 5, name: { zh: '聚能前哨', en: 'Charge Outpost' }, kind: 'elite', recommended: 2580, duration: 210, enemyCap: 24, reward: { credits: 770, alloy: 60, signal: 5, seasonXp: 64 } },
            { id: '2-6', chapter: 2, index: 6, name: { zh: '雷暴典狱', en: 'Storm Warden' }, kind: 'boss', recommended: 3180, duration: 225, enemyCap: 25, reward: { credits: 940, alloy: 72, signal: 6, seasonXp: 76 } },
            { id: '3-1', chapter: 3, index: 1, name: { zh: '深空折层', en: 'Deep Fold' }, kind: 'normal', recommended: 3900, duration: 180, enemyCap: 25, reward: { credits: 1140, alloy: 84, signal: 7, seasonXp: 88 } },
            { id: '3-2', chapter: 3, index: 2, name: { zh: '黑栅浮港', en: 'Black Grid Port' }, kind: 'normal', recommended: 4760, duration: 195, enemyCap: 27, reward: { credits: 1380, alloy: 98, signal: 8, seasonXp: 102 } },
            { id: '3-3', chapter: 3, index: 3, name: { zh: '湮灭回廊', en: 'Null Corridor' }, kind: 'normal', recommended: 5800, duration: 210, enemyCap: 28, reward: { credits: 1670, alloy: 116, signal: 10, seasonXp: 118 } },
            { id: '3-4', chapter: 3, index: 4, name: { zh: '坍缩核心', en: 'Collapse Core' }, kind: 'normal', recommended: 7040, duration: 225, enemyCap: 30, reward: { credits: 2020, alloy: 138, signal: 12, seasonXp: 136 } },
            { id: '3-5', chapter: 3, index: 5, name: { zh: '裂界狩猎', en: 'Rift Hunt' }, kind: 'elite', recommended: 8520, duration: 240, enemyCap: 31, reward: { credits: 2440, alloy: 164, signal: 14, seasonXp: 156 } },
            { id: '3-6', chapter: 3, index: 6, name: { zh: '尖啸母舰', en: 'Shriek Carrier' }, kind: 'boss', recommended: 10300, duration: 255, enemyCap: 32, reward: { credits: 2940, alloy: 196, signal: 17, seasonXp: 180 } },
            { id: '4-1', chapter: 4, index: 1, name: { zh: '残星废轨', en: 'Starfall Rail' }, kind: 'normal', recommended: 12400, duration: 210, enemyCap: 32, reward: { credits: 3540, alloy: 232, signal: 20, seasonXp: 206 } },
            { id: '4-2', chapter: 4, index: 2, name: { zh: '暴风折镜', en: 'Storm Mirror' }, kind: 'normal', recommended: 14900, duration: 225, enemyCap: 33, reward: { credits: 4260, alloy: 274, signal: 23, seasonXp: 234 } },
            { id: '4-3', chapter: 4, index: 3, name: { zh: '炽核坠场', en: 'Burning Fallsite' }, kind: 'normal', recommended: 17900, duration: 240, enemyCap: 34, reward: { credits: 5120, alloy: 324, signal: 27, seasonXp: 264 } },
            { id: '4-4', chapter: 4, index: 4, name: { zh: '终焰壁垒', en: 'Final Bastion' }, kind: 'normal', recommended: 21400, duration: 255, enemyCap: 35, reward: { credits: 6140, alloy: 382, signal: 31, seasonXp: 296 } },
            { id: '4-5', chapter: 4, index: 5, name: { zh: '主炮封域', en: 'Main Gun Zone' }, kind: 'elite', recommended: 25600, duration: 270, enemyCap: 36, reward: { credits: 7360, alloy: 452, signal: 36, seasonXp: 332 } },
            { id: '4-6', chapter: 4, index: 6, name: { zh: '轨道断罪者', en: 'Orbital Judicator' }, kind: 'boss', recommended: 30600, duration: 300, enemyCap: 38, reward: { credits: 8820, alloy: 536, signal: 42, seasonXp: 372 } }
        ],
        missions: [
            { id: 'm1', metric: 'runs', target: 2, title: { zh: '完成 2 局', en: 'Finish 2 Runs' }, reward: { credits: 240, alloy: 18 } },
            { id: 'm2', metric: 'survivalSeconds', target: 480, title: { zh: '生存 8 分钟', en: 'Survive 8 Minutes' }, reward: { credits: 320, alloy: 24 } },
            { id: 'm3', metric: 'eliteKills', target: 3, title: { zh: '击败 3 个精英', en: 'Defeat 3 Elites' }, reward: { credits: 420, alloy: 30, signal: 2 } },
            { id: 'm4', metric: 'stageClears', target: 4, title: { zh: '通过 4 个关卡', en: 'Clear 4 Stages' }, reward: { credits: 560, alloy: 38, signal: 2, seasonXp: 28 } },
            { id: 'm5', metric: 'bossKills', target: 2, title: { zh: '击败 2 个首领', en: 'Defeat 2 Bosses' }, reward: { credits: 760, alloy: 52, signal: 4, seasonXp: 42, eliteKeys: 1 } }
        ],
        seasonFreeTrack: [
            { id: 'f1', xp: 80, reward: { credits: 320, alloy: 24 } },
            { id: 'f2', xp: 240, reward: { credits: 520, alloy: 40, signal: 2 } },
            { id: 'f3', xp: 520, reward: { credits: 820, alloy: 64, signal: 3, eliteKeys: 1 } },
            { id: 'f4', xp: 920, reward: { credits: 1260, alloy: 96, signal: 5 } },
            { id: 'f5', xp: 1420, reward: { credits: 1880, alloy: 148, signal: 7, eliteKeys: 1 } },
            { id: 'f6', xp: 2040, reward: { credits: 2720, alloy: 220, signal: 10 } }
        ],
        seasonPremiumTrack: [
            { id: 'p1', xp: 80, reward: { credits: 520, alloy: 42, signal: 2 } },
            { id: 'p2', xp: 240, reward: { credits: 860, alloy: 72, signal: 4, eliteKeys: 1 } },
            { id: 'p3', xp: 520, reward: { credits: 1420, alloy: 118, signal: 6 } },
            { id: 'p4', xp: 920, reward: { credits: 2260, alloy: 186, signal: 10, eliteKeys: 2 } },
            { id: 'p5', xp: 1420, reward: { credits: 3480, alloy: 286, signal: 15 } },
            { id: 'p6', xp: 2040, reward: { credits: 5200, alloy: 420, signal: 22, eliteKeys: 2 } }
        ],
        shopItems: [
            {
                id: 'dailySupply',
                price: 0,
                title: { zh: '每日补给', en: 'Daily Supply' },
                reward: { credits: 220, alloy: 18, seasonXp: 18 },
                daily: true
            },
            {
                id: 'alloyCache',
                price: 460,
                title: { zh: '合金补给', en: 'Alloy Cache' },
                reward: { alloy: 26 }
            },
            {
                id: 'signalBurst',
                price: 820,
                title: { zh: '信号突发', en: 'Signal Burst' },
                reward: { signal: 4, alloy: 18 }
            },
            {
                id: 'eliteKey',
                price: 1320,
                title: { zh: '续航钥匙', en: 'Recovery Key' },
                reward: { alloy: 36, signal: 4, eliteKeys: 1 }
            }
        ],
        paymentOffers: [
            {
                id: 'starter',
                price: 6,
                baseAmount: 6.0,
                oneTime: true,
                unlockStage: '1-1',
                name: { zh: '鍚埅琛ョ粰鍖?, en: 'Starter Launch Pack' },
                reward: { credits: 2200, alloy: 150, signal: 10, eliteKeys: 1 },
                permanentText: { zh: '姣忔棩鍔犳垚灞€ +1', en: '+1 daily bonus run' },
                permanentBonus: { dailyFreeRuns: 1 },
                recommendedAt: '1-4 ~ 2-1',
                solves: ['1-4', '1-5', '1-6', '2-1']
            },
            {
                id: 'accelerator',
                price: 15,
                baseAmount: 15.0,
                oneTime: true,
                unlocksPremiumSeason: true,
                unlockStage: '1-4',
                name: { zh: '鍔犻€熻ˉ缁欏寘', en: 'Accelerator Supply Pack' },
                reward: { credits: 5600, alloy: 340, signal: 20, eliteKeys: 2 },
                permanentText: { zh: '鍚堥噾缁撶畻 +10%', en: '+10% alloy payout' },
                permanentBonus: { alloyYield: 0.10 },
                recommendedAt: '2-2 ~ 2-6',
                solves: ['2-2', '2-3', '2-4', '2-5', '2-6']
            },
            {
                id: 'rush',
                price: 30,
                baseAmount: 30.0,
                oneTime: true,
                unlocksPremiumSeason: true,
                unlockStage: '2-5',
                name: { zh: '绐佽繘绐佺牬鍖?, en: 'Rush Break Pack' },
                reward: { credits: 9200, alloy: 560, signal: 32, eliteKeys: 3 },
                permanentText: { zh: '澶ф嫑鍏呰兘 +12%', en: '+12% ultimate charge' },
                permanentBonus: { ultimateCharge: 0.12 },
                recommendedAt: '3-1 ~ 3-5',
                solves: ['3-1', '3-2', '3-3', '3-4', '3-5']
            },
            {
                id: 'sovereign',
                price: 68,
                baseAmount: 68.0,
                oneTime: true,
                unlocksPremiumSeason: true,
                unlockStage: '3-4',
                name: { zh: '缁熷尽姝﹁鍖?, en: 'Sovereign Arsenal Pack' },
                reward: { credits: 15000, alloy: 920, signal: 52, eliteKeys: 5 },
                permanentText: { zh: '绮捐嫳 / 棣栭濂栧姳 +14%', en: '+14% elite and boss payout' },
                permanentBonus: { bossYield: 0.14, signalYield: 0.06 },
                recommendedAt: '3-6 ~ 4-3',
                solves: ['3-6', '4-1', '4-2', '4-3']
            },
            {
                id: 'nexus',
                price: 128,
                baseAmount: 128.0,
                oneTime: true,
                unlocksPremiumSeason: true,
                unlockStage: '4-2',
                name: { zh: '鏍稿績鐭╅樀鍖?, en: 'Nexus Matrix Pack' },
                reward: { credits: 28000, alloy: 1680, signal: 96, eliteKeys: 8 },
                permanentText: { zh: '鍏ㄥ眬鎴愰暱鏁堢巼 +8%', en: '+8% global growth efficiency' },
                permanentBonus: { globalGrowth: 0.08, signalYield: 0.10 },
                recommendedAt: '4-4 ~ 4-6',
                solves: ['4-4', '4-5', '4-6']
            }
        ],
        dailyRouteModels: [
            {
                id: 'early-free',
                phase: 'early',
                tier: 'free',
                label: { zh: '新手白嫖', en: 'Starter Free' },
                stageIds: ['1-4', '1-5', '1-6', '1-6'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'alloyCache'],
                note: {
                    zh: '4 局收满任务和日补给，足够回到 1-6 附近继续补强。',
                    en: 'Four runs plus daily supply is enough to keep reinforcing around 1-6.'
                }
            },
            {
                id: 'early-light',
                phase: 'early',
                tier: 'light',
                label: { zh: '新手小氪', en: 'Starter Light' },
                stageIds: ['1-5', '1-6', '1-6', '2-1', '2-1'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'alloyCache', 'signalBurst'],
                note: {
                    zh: '多打一局把过渡拉顺，优先把 2-1 前的机体和双武补齐。',
                    en: 'One extra run smooths the transition and helps finish hull and weapon upgrades before 2-1.'
                }
            },
            {
                id: 'early-mid',
                phase: 'early',
                tier: 'mid',
                label: { zh: '新手中氪', en: 'Starter Mid' },
                stageIds: ['1-6', '1-6', '2-1', '2-2', '2-2'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'alloyCache', 'signalBurst'],
                note: {
                    zh: '前期节奏会明显更顺，资源仍优先投向武器、机体和赛季推进。',
                    en: 'Early pacing becomes much smoother, but resources should still prioritize weapons, hull, and season progress.'
                }
            },
            {
                id: 'mid-free',
                phase: 'mid',
                tier: 'free',
                label: { zh: '中期白嫖', en: 'Mid Free' },
                stageIds: ['2-3', '2-4', '2-5', '2-6'],
                missionIds: ['m1', 'm2', 'm4'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'alloyCache'],
                note: {
                    zh: '稳定 4 局把任务和日补给吃满，优先补武器与合金压铸。',
                    en: 'A steady four-run loop with daily supply keeps weapons and alloy research moving.'
                }
            },
            {
                id: 'mid-light',
                phase: 'mid',
                tier: 'light',
                label: { zh: '中期小氪', en: 'Mid Light' },
                stageIds: ['2-4', '2-5', '2-6', '2-6', '3-1'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'alloyCache', 'signalBurst'],
                note: {
                    zh: '多打一局把双资源缺口抹平，中期更容易连推到 3-x。',
                    en: 'An extra run smooths the dual-resource gap and makes it easier to chain into 3-x.'
                }
            },
            {
                id: 'mid-mid',
                phase: 'mid',
                tier: 'mid',
                label: { zh: '中期中氪', en: 'Mid Mid' },
                stageIds: ['2-5', '2-6', '2-6', '3-2', '3-3'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'signalBurst', 'alloyCache'],
                note: {
                    zh: '双线赛季和更高回收同时发力，主构筑成型会明显提前。',
                    en: 'Premium tracks and faster recovery kick in together, bringing core builds online earlier.'
                }
            },
            {
                id: 'late-free',
                phase: 'late',
                tier: 'free',
                label: { zh: '后期白嫖', en: 'Late Free' },
                stageIds: ['3-4', '3-5', '3-6', '4-1'],
                missionIds: ['m1', 'm2', 'm4'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'signalBurst'],
                note: {
                    zh: '以后期 4 局稳回收为主，先保核心研究和无人机同步成长。',
                    en: 'A steady four-run late loop should first protect core research and drone growth.'
                }
            },
            {
                id: 'late-light',
                phase: 'late',
                tier: 'light',
                label: { zh: '后期小氪', en: 'Late Light' },
                stageIds: ['3-5', '3-6', '3-6', '4-1', '4-2'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'signalBurst', 'eliteKey'],
                note: {
                    zh: '多打一局把高压关收益吃满，适合冲 4-2 到 4-4。',
                    en: 'An extra high-pressure run helps cash out late rewards and push toward 4-2 to 4-4.'
                }
            },
            {
                id: 'late-mid',
                phase: 'late',
                tier: 'mid',
                label: { zh: '后期中氪', en: 'Late Mid' },
                stageIds: ['4-2', '4-3', '4-4', '4-5', '4-6', '4-6'],
                missionIds: ['m1', 'm2', 'm4', 'm5'],
                shopDailyId: 'dailySupply',
                shopFocus: ['dailySupply', 'signalBurst', 'eliteKey'],
                note: {
                    zh: '后期主打高收益关与双线赛季，终盘缺口会明显缩短。',
                    en: 'Late game focuses on high-yield stages and dual-track season gains to noticeably shorten the final gap.'
                }
            }
        ],
        baseSave: {
            tab: 'run',
            selectedChapterId: '1-1',
            selectedHullId: 'flare',
            selectedWeaponIds: ['pulse-gun', 'arc-laser'],
            selectedDroneId: 'scrap-magnet',
            selectedUltimateId: 'nova-burst',
            credits: 2200,
            alloy: 160,
            signal: 18,
            seasonXp: 0,
            eliteKeys: 0,
            unlockedChapterIndex: 0,
            clearedChapters: [],
            hullLevels: { flare: 1 },
            weaponLevels: { 'pulse-gun': 1, 'arc-laser': 1 },
            droneLevels: { 'scrap-magnet': 1 },
            ultimateLevels: { 'nova-burst': 1 },
            researchLevels: {},
            missionClaimed: [],
            missionDayKey: '',
            missionDailyBaseStats: {
                runs: 0,
                survivalSeconds: 0,
                eliteKills: 0,
                stageClears: 0,
                bossKills: 0
            },
            seasonClaimed: [],
            seasonClaimedPremium: [],
            dailySupplyAt: 0,
            freeRunDayKey: '',
            freeRunsUsedToday: 0,
            armedEliteKey: false,
            seenBattleHint: false,
            payment: {
                minerId: '',
                claimedOrders: {},
                pendingClaims: {},
                verifiedTxids: [],
                claimedOfferIds: [],
                pendingOrder: null,
                recentOrders: [],
                purchaseCount: 0,
                totalSpent: 0,
                lastPayAddress: '',
                permanent: {
                    dailyFreeRuns: 0,
                    creditYield: 0,
                    alloyYield: 0,
                    signalYield: 0,
                    bossYield: 0,
                    ultimateCharge: 0,
                    globalGrowth: 0
                },
                premiumSeason: false
            }
        }
    };
}());
