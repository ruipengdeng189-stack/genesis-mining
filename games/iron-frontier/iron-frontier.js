(function () {
    const CONFIG = window.IRON_FRONTIER_CONFIG;
    if (!CONFIG) return;

    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_iron_frontier_v1_save';
    const TOAST_MS = 2200;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_GAME_ID = 'iron-frontier';
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_TXID_PATTERN = /^[a-fA-F0-9]{64}$/;
    const MODULE_POWER = {
        locomotive: 72,
        mainGun: 98,
        armorCar: 66,
        supportCar: 52,
        ultimate: 40
    };
    const BATTLE_TICK_MS = 1100;
    const SKILL_COOLDOWNS = {
        overdrive: 4,
        barrier: 5,
        repair: 4
    };
    const COPY = {
        zh: {
            backToHub: '← 返回大厅',
            sfxOn: 'SFX ON',
            sfxOff: 'SFX OFF',
            preview: '首章雏形',
            summaryCopy: '大厅入口、章节推进、自动战斗与成长升级已接通，现在可以直接体验首章。',
            currentStage: '当前关卡',
            clearCount: '已通关',
            nextTarget: '下一目标',
            power: '当前战力',
            chapter: '章节',
            chapterProgress: '章节进度',
            loadout: '当前编组',
            powerStateLow: '战力偏低',
            powerStateReady: '战力适中',
            powerStateHigh: '战力充足',
            runTitle: '路线简报',
            runBody: '只保留开打前必要信息：战力差、压力、收益与编组。',
            startRun: '开始本关',
            routePreview: '路线概览',
            rewardPreview: '本关奖励',
            pressure: '压力',
            rewardFocus: '收益焦点',
            routeNode: '路线节点',
            unlocked: '已开放',
            locked: '未开放',
            cleared: '已完成',
            trainTitle: '列车整备',
            trainBody: '提升车头、主炮、护甲、支援与轨炮，会直接影响局内推进与生存。',
            upgrade: '升级',
            maxLevel: '已满级',
            level: 'Lv',
            cost: '消耗',
            effect: '效果',
            crewTitle: '乘员配置',
            crewBody: '上阵 3 名乘员；乘员被动会直接影响推进、承伤、修复与收益。',
            active: '已上阵',
            assign: '上阵',
            remove: '下阵',
            passive: '被动',
            workshopTitle: '工坊研究',
            workshopBody: '研究提供全局成长，优先补足当前章节最缺的一项即可。',
            missionsTitle: '任务面板',
            missionsBody: '完成短目标领取资源，作为章节推进的额外补给。',
            claim: '领取',
            claimed: '已领取',
            seasonTitle: '赛季轨道',
            seasonBody: '赛季按 XP 解锁，免费与高级奖励共用一套紧凑展示。',
            shopTitle: '商店骨架',
            shopBody: '软货币商品可直接购买；礼包先展示精确金额与奖励映射。',
            freeSupply: '免费补给',
            buy: '购买',
            previewOrder: '查看',
            laterConnectPayment: '稍后接支付闭环',
            viewExactAmount: '查看精确金额示意',
            cooldown: '冷却中',
            exactAmountHint: '创建订单后会生成当前礼包专属金额，并展示到账奖励与长期增益。',
            paymentNext: '完成转账并提交 TXID 后，系统会校验订单并发放奖励。',
            battlePreview: '战斗页',
            integrity: '车体',
            shield: '护盾',
            heat: '热量',
            progress: '进度',
            advance: '手动加速',
            skillOverdrive: '⚡ 超载',
            skillBarrier: '🛡 护盾',
            skillRepair: '🔧 修复',
            skillUltimate: '🚄 轨炮',
            battleWarmup: '列车出发中，主炮自动开火，玩家负责技能与事件选择。',
            battleWin: '演示完成，已结算本关奖励。',
            battleFail: '列车损伤过高，带回部分回收物资。',
            battleVictoryTitle: '本局胜利',
            battleDefeatTitle: '本局撤退',
            battleReturn: '返回整备',
            battleRetry: '再次出发',
            battleOverheat: '系统过热，推进效率下降，建议优先修复或停超载。',
            battleBossIncoming: '首领压力上升，建议预留护盾与轨炮。',
            battleUnderpowered: '当前战力略低于推荐值，首章后期建议先补整备。',
            battleEventResolved: '路线事件已处理，列车继续推进。',
            skillReady: '就绪',
            skillCooldown: '冷却 {value}',
            ultimateCharge: '轨炮充能 {value}%',
            routeBonus: '路线加成',
            manualBurst: '手动推进 1 段',
            powerGap: '战力差',
            partialReward: '带回回收物资',
            noResource: '资源不足，先补整备或完成任务。',
            upgraded: '升级完成',
            researchUpgraded: '研究升级完成',
            supplyClaimed: '补给已领取',
            missionClaimed: '任务奖励已到账',
            seasonClaimed: '赛季奖励已领取',
            bundlePreview: '礼包预览',
            bundleMock: '礼包会展示专属金额、到账内容与长期加成，便于你按当前进度选择。',
            eventChoose: '路线事件',
            lockedStageTip: '先完成前置关卡，再继续推进。',
            chapterLockedTip: '需先通关前一章 Boss。',
            selected: '已选中',
            comingPayment: '订单校验与奖励发放',
            exactAmount: '精确金额',
            permanent: '长期收益',
            bonusReward: '额外收益',
            activeCrew: '当前编组',
            battleLogs: '战况回放',
            premiumPreview: '高级线预览',
            daySupplyReady: '免费补给已就绪',
            waitTemplate: '还需等待 {time}',
            openOffer: '打开礼包预览',
            safeRoute: '稳态路线',
            eliteStage: '精英',
            bossStage: 'Boss',
            normalStage: '普通'
        },
        en: {
            backToHub: '← Back To Hub',
            sfxOn: 'SFX ON',
            sfxOff: 'SFX OFF',
            preview: 'Preview Build',
            summaryCopy: 'Hub entry, chapter flow, auto-battle, and growth upgrades are connected. Chapter one is now directly playable.',
            currentStage: 'Stage',
            clearCount: 'Clears',
            nextTarget: 'Next Target',
            power: 'Power',
            chapter: 'Chapter',
            chapterProgress: 'Chapter Progress',
            loadout: 'Loadout',
            powerStateLow: 'Power Low',
            powerStateReady: 'Power On Pace',
            powerStateHigh: 'Power Ahead',
            runTitle: 'Route Brief',
            runBody: 'Only the essentials stay here before launch: power gap, pressure, rewards, and loadout.',
            startRun: 'Start Stage',
            routePreview: 'Route Preview',
            rewardPreview: 'Stage Rewards',
            pressure: 'Pressure',
            rewardFocus: 'Reward Focus',
            routeNode: 'Route Nodes',
            unlocked: 'Open',
            locked: 'Locked',
            cleared: 'Cleared',
            trainTitle: 'Train Prep',
            trainBody: 'Train modules directly change battle pace, survivability, repair, and burst windows.',
            upgrade: 'Upgrade',
            maxLevel: 'Max',
            level: 'Lv',
            cost: 'Cost',
            effect: 'Effect',
            crewTitle: 'Crew Setup',
            crewBody: 'Three crew slots are active; passives directly affect pace, defense, repair, and payouts.',
            active: 'Active',
            assign: 'Deploy',
            remove: 'Remove',
            passive: 'Passive',
            workshopTitle: 'Workshop',
            workshopBody: 'Research is a global growth lane. Upgrade the weakest part of the current chapter first.',
            missionsTitle: 'Mission Panel',
            missionsBody: 'Short goals provide extra resources to keep chapter progression moving.',
            claim: 'Claim',
            claimed: 'Claimed',
            seasonTitle: 'Season Track',
            seasonBody: 'Season nodes unlock by XP, with free and premium rewards in one compact track.',
            shopTitle: 'Shop Skeleton',
            shopBody: 'Soft-currency goods are live; bundles show exact price and reward mapping.',
            freeSupply: 'Free Supply',
            buy: 'Buy',
            previewOrder: 'View',
            laterConnectPayment: 'Hook payment later',
            viewExactAmount: 'View exact amount',
            cooldown: 'Cooldown',
            exactAmountHint: 'Creating an order reveals the exact amount for this offer, plus the reward and permanent bonus it unlocks.',
            paymentNext: 'After the transfer, submit the TXID to verify the order and grant the rewards.',
            battlePreview: 'Battle Preview',
            integrity: 'Integrity',
            shield: 'Shield',
            heat: 'Heat',
            progress: 'Progress',
            advance: 'Burst Advance',
            skillOverdrive: '⚡ Overdrive',
            skillBarrier: '🛡 Barrier',
            skillRepair: '🔧 Repair',
            skillUltimate: '🚄 Rail Burst',
            battleWarmup: 'Train is moving. Main gun auto-fires while the player manages skills and route events.',
            battleWin: 'Demo complete. Stage rewards settled.',
            battleFail: 'Train took heavy damage. Partial salvage returned.',
            battleVictoryTitle: 'Victory',
            battleDefeatTitle: 'Retreat',
            battleReturn: 'Back To Prep',
            battleRetry: 'Run Again',
            battleOverheat: 'Systems are overheating. Repair or stop pushing overdrive.',
            battleBossIncoming: 'Boss pressure is rising. Save barrier and Rail Burst.',
            battleUnderpowered: 'Current power is slightly below the recommendation. Consider more prep soon.',
            battleEventResolved: 'Route event resolved. The train moves again.',
            skillReady: 'Ready',
            skillCooldown: 'CD {value}',
            ultimateCharge: 'Rail Burst {value}%',
            routeBonus: 'Route Bonus',
            manualBurst: 'Advance 1 Segment',
            powerGap: 'Gap',
            partialReward: 'Partial Salvage',
            noResource: 'Not enough resources. Clear missions or upgrade later.',
            upgraded: 'Upgrade complete',
            researchUpgraded: 'Research upgraded',
            supplyClaimed: 'Supply claimed',
            missionClaimed: 'Mission rewards claimed',
            seasonClaimed: 'Season rewards claimed',
            bundlePreview: 'Offer Preview',
            bundleMock: 'Each bundle shows its exact amount, instant rewards, and permanent bonus so you can choose by your current pace.',
            eventChoose: 'Route Event',
            lockedStageTip: 'Clear the previous stage first.',
            chapterLockedTip: 'Clear the previous chapter boss first.',
            selected: 'Selected',
            comingPayment: 'Order check & reward grant',
            exactAmount: 'Exact Amount',
            permanent: 'Permanent',
            bonusReward: 'Bonus Yield',
            activeCrew: 'Active Crew',
            battleLogs: 'Battle Logs',
            premiumPreview: 'Premium Preview',
            daySupplyReady: 'Free supply ready',
            waitTemplate: 'Wait {time}',
            openOffer: 'Open offer preview',
            safeRoute: 'Steady Route',
            eliteStage: 'Elite',
            bossStage: 'Boss',
            normalStage: 'Normal'
        }
    };

    const nodes = {
        heroEyebrow: document.getElementById('heroEyebrow'),
        heroTitle: document.getElementById('heroTitle'),
        heroSubtitle: document.getElementById('heroSubtitle'),
        heroChips: document.getElementById('heroChips'),
        resourceStrip: document.getElementById('resourceStrip'),
        heroSummary: document.getElementById('heroSummary'),
        panelContent: document.getElementById('panelContent'),
        tabBar: document.getElementById('tabBar'),
        soundToggle: document.getElementById('soundToggle'),
        backToHubLink: document.getElementById('backToHubLink'),
        battleOverlay: document.getElementById('battleOverlay'),
        battleEyebrow: document.getElementById('battleEyebrow'),
        battleStageTitle: document.getElementById('battleStageTitle'),
        battleIntegrityValue: document.getElementById('battleIntegrityValue'),
        battleShieldValue: document.getElementById('battleShieldValue'),
        battleHeatValue: document.getElementById('battleHeatValue'),
        battleProgressValue: document.getElementById('battleProgressValue'),
        battleIntegrityBar: document.getElementById('battleIntegrityBar'),
        battleShieldBar: document.getElementById('battleShieldBar'),
        battleHeatBar: document.getElementById('battleHeatBar'),
        battleProgressBar: document.getElementById('battleProgressBar'),
        battleTip: document.getElementById('battleTip'),
        battleField: document.getElementById('battleField'),
        battleTrain: document.getElementById('battleTrain'),
        battleThreatLane: document.getElementById('battleThreatLane'),
        battleEventArea: document.getElementById('battleEventArea'),
        battleAdvanceBtn: document.getElementById('battleAdvanceBtn'),
        battleCloseBtn: document.getElementById('battleCloseBtn'),
        offerDrawer: document.getElementById('offerDrawer'),
        drawerEyebrow: document.getElementById('drawerEyebrow'),
        drawerTitle: document.getElementById('drawerTitle'),
        offerDrawerBody: document.getElementById('offerDrawerBody'),
        offerCloseBtn: document.getElementById('offerCloseBtn'),
        offerLaterBtn: document.getElementById('offerLaterBtn'),
        offerMockPayBtn: document.getElementById('offerMockPayBtn'),
        toast: document.getElementById('toast')
    };

    let toastTimer = null;
    let activeOfferId = '';
    let battleState = null;
    let battleLoopHandle = null;
    let paymentBusyAction = '';
    let paymentNotice = '';
    let paymentNoticeTone = 'info';
    let paymentNoticeOfferId = '';
    let paymentDraftTxid = '';
    let debugOfferId = '';
    let state = loadState();

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createDefaultPaymentState() {
        return {
            minerId: '',
            claimedOfferIds: [],
            claimedOrders: {},
            verifiedTxids: [],
            recentOrders: [],
            pendingOrder: null,
            totalSpent: 0,
            purchaseCount: 0,
            lastPayAddress: '',
            permanent: {
                dailyFreeClaims: 0,
                fuelPayout: 0,
                crewDiscount: 0,
                eliteBossReward: 0
            }
        };
    }

    function createDefaultState() {
        return {
            lang: getInitialLang(),
            activeTab: 'run',
            selectedStageId: '1-1',
            resources: deepClone(CONFIG.starterResources),
            moduleLevels: CONFIG.modules.reduce((accumulator, item) => {
                accumulator[item.id] = 1;
                return accumulator;
            }, {}),
            crewLevels: CONFIG.crew.reduce((accumulator, item) => {
                accumulator[item.id] = 1;
                return accumulator;
            }, {}),
            activeCrew: [...CONFIG.starterCrew],
            researchLevels: CONFIG.research.reduce((accumulator, item) => {
                accumulator[item.id] = 0;
                return accumulator;
            }, {}),
            stageClears: {},
            claimedMissions: [],
            claimedSeason: [],
            dailyFreeClaimAt: 0,
            dailyFreeClaimsUsed: 0,
            payment: createDefaultPaymentState(),
            stats: {
                runs: 0,
                wins: 0,
                upgrades: 0,
                skills: 0,
                researchUpgrades: 0,
                stageClears: 0
            },
            soundEnabled: false
        };
    }

    function getInitialLang() {
        try {
            const saved = localStorage.getItem(HUB_LANG_KEY);
            if (saved === 'en' || saved === 'zh') return saved;
        } catch (error) {}
        const browserLang = String(navigator.language || '').toLowerCase();
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }

    function loadState() {
        const fallback = createDefaultState();
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return {
                ...fallback,
                ...parsed,
                resources: { ...fallback.resources, ...(parsed.resources || {}) },
                moduleLevels: { ...fallback.moduleLevels, ...(parsed.moduleLevels || {}) },
                crewLevels: { ...fallback.crewLevels, ...(parsed.crewLevels || {}) },
                researchLevels: { ...fallback.researchLevels, ...(parsed.researchLevels || {}) },
                stats: { ...fallback.stats, ...(parsed.stats || {}) },
                payment: {
                    ...fallback.payment,
                    ...((parsed.payment && typeof parsed.payment === 'object') ? parsed.payment : {}),
                    claimedOfferIds: Array.isArray(parsed.payment?.claimedOfferIds)
                        ? parsed.payment.claimedOfferIds.filter((offerId) => CONFIG.bundles.some((item) => item.id === offerId))
                        : [],
                    claimedOrders: parsed.payment?.claimedOrders && typeof parsed.payment.claimedOrders === 'object'
                        ? parsed.payment.claimedOrders
                        : {},
                    verifiedTxids: Array.isArray(parsed.payment?.verifiedTxids) ? parsed.payment.verifiedTxids : [],
                    recentOrders: Array.isArray(parsed.payment?.recentOrders) ? parsed.payment.recentOrders.map((order) => normalizeOrder(order)).filter(Boolean) : [],
                    pendingOrder: normalizeOrder(parsed.payment?.pendingOrder),
                    permanent: {
                        ...fallback.payment.permanent,
                        ...((parsed.payment?.permanent && typeof parsed.payment.permanent === 'object') ? parsed.payment.permanent : {})
                    }
                },
                activeCrew: Array.isArray(parsed.activeCrew) && parsed.activeCrew.length ? parsed.activeCrew.slice(0, 3) : fallback.activeCrew,
                stageClears: parsed.stageClears && typeof parsed.stageClears === 'object' ? parsed.stageClears : {},
                claimedMissions: Array.isArray(parsed.claimedMissions) ? parsed.claimedMissions : [],
                claimedSeason: Array.isArray(parsed.claimedSeason) ? parsed.claimedSeason : [],
                dailyFreeClaimsUsed: Number(parsed.dailyFreeClaimsUsed || 0)
            };
        } catch (error) {
            return fallback;
        }
    }

    function saveState() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            localStorage.setItem(HUB_LANG_KEY, state.lang);
        } catch (error) {}
    }

    function t(key) {
        const copy = COPY[state.lang] || COPY.zh;
        return copy[key] || COPY.zh[key] || key;
    }

    function text(zh, en) {
        return state.lang === 'zh' ? zh : en;
    }

    function localize(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value[state.lang] || value.zh || value.en || '';
    }

    function formatNumber(value) {
        return (Number(value) || 0).toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
    }

    function roundFixed(value, digits = 4) {
        return Number(Number(value || 0).toFixed(digits));
    }

    function formatPercent(value) {
        return `${Math.round(Number(value || 0) * 100)}%`;
    }

    function formatPaymentAmount(value) {
        return Number(Number(value || 0)).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function formatShortCost(cost) {
        return Object.entries(cost || {})
            .filter(([, amount]) => Number(amount) > 0)
            .map(([key, amount]) => {
                const resource = CONFIG.resources.find((item) => item.id === key);
                return `${resource ? resource.icon : key} ${formatNumber(amount)}`;
            })
            .join(' · ');
    }

    function getStage(stageId) {
        return CONFIG.stages.find((item) => item.id === stageId) || CONFIG.stages[0];
    }

    function getModule(moduleId) {
        return CONFIG.modules.find((item) => item.id === moduleId);
    }

    function getCrew(crewId) {
        return CONFIG.crew.find((item) => item.id === crewId);
    }

    function getResearch(researchId) {
        return CONFIG.research.find((item) => item.id === researchId);
    }

    function getOffer(offerId) {
        return CONFIG.bundles.find((item) => item.id === offerId);
    }

    function hasActiveCrew(crewId) {
        return state.activeCrew.includes(crewId);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function mergeRewards(...sources) {
        const merged = {};
        sources.forEach((source) => {
            Object.entries(source || {}).forEach(([key, amount]) => {
                merged[key] = (merged[key] || 0) + (Number(amount) || 0);
            });
        });
        return merged;
    }

    function getCurrentPower() {
        let total = 268;
        Object.entries(state.moduleLevels).forEach(([moduleId, level]) => {
            total += Math.max(0, (Number(level) || 1) - 1) * (MODULE_POWER[moduleId] || 0);
        });
        state.activeCrew.forEach((crewId) => {
            total += Math.max(0, (Number(state.crewLevels[crewId]) || 1) - 1) * 22;
        });
        Object.values(state.researchLevels).forEach((level) => {
            total += (Number(level) || 0) * 26;
        });
        return total;
    }

    function getTotalClears() {
        return Object.keys(state.stageClears).filter((stageId) => state.stageClears[stageId]).length;
    }

    function getSelectedChapter() {
        return getStage(state.selectedStageId).chapter || 1;
    }

    function getChapterStages(chapter) {
        return CONFIG.stages.filter((stage) => stage.chapter === chapter);
    }

    function getChapterBossStage(chapter) {
        const chapterStages = getChapterStages(chapter);
        return chapterStages[chapterStages.length - 1] || null;
    }

    function isChapterUnlocked(chapter) {
        if (chapter <= 1) return true;
        const previousBoss = getChapterBossStage(chapter - 1);
        return previousBoss ? Boolean(state.stageClears[previousBoss.id]) : false;
    }

    function getChapterEntryStage(chapter) {
        const chapterStages = getChapterStages(chapter);
        return chapterStages.find((stage) => isStageUnlocked(stage.id) && !state.stageClears[stage.id])
            || [...chapterStages].reverse().find((stage) => isStageUnlocked(stage.id))
            || chapterStages[0];
    }

    function getChapterProgress(chapter) {
        const chapterStages = getChapterStages(chapter);
        return {
            total: chapterStages.length,
            cleared: chapterStages.filter((stage) => state.stageClears[stage.id]).length
        };
    }

    function getPowerState(stage) {
        const ratio = getCurrentPower() / Math.max(1, stage.recommended);
        if (ratio < 0.92) return { tone: 'low', label: t('powerStateLow') };
        if (ratio > 1.1) return { tone: 'high', label: t('powerStateHigh') };
        return { tone: 'ready', label: t('powerStateReady') };
    }

    function getPowerGap(stage) {
        const gap = getCurrentPower() - Math.max(0, stage.recommended || 0);
        if (gap === 0) return '±0';
        return `${gap > 0 ? '+' : ''}${formatNumber(gap)}`;
    }

    function getBattleProfile(stage) {
        const fireResearch = Number(state.researchLevels.fireDirector || 0);
        const platingResearch = Number(state.researchLevels.platingWeld || 0);
        const repairResearch = Number(state.researchLevels.repairGrid || 0);
        const salvageResearch = Number(state.researchLevels.salvageCharter || 0);
        const relayResearch = Number(state.researchLevels.relayDecoder || 0);
        const powerRatio = clamp(getCurrentPower() / Math.max(1, stage.recommended), 0.72, 1.34);

        return {
            powerRatio,
            attackMul: 1 + (state.moduleLevels.mainGun - 1) * 0.09 + fireResearch * 0.035 + (hasActiveCrew('knox') ? 0.08 : 0),
            defenseMul: 1 + (state.moduleLevels.armorCar - 1) * 0.08 + platingResearch * 0.04 + (hasActiveCrew('ves') ? 0.04 : 0),
            repairMul: 1 + (state.moduleLevels.supportCar - 1) * 0.07 + repairResearch * 0.04 + (hasActiveCrew('lio') ? 0.06 : 0),
            salvageMul: 1 + salvageResearch * 0.03 + (hasActiveCrew('suri') ? 0.07 : 0),
            relayMul: 1 + relayResearch * 0.03,
            eventMul: 1 + (hasActiveCrew('mira') ? 0.06 : 0),
            progressMul: clamp(0.78 + powerRatio * 0.22, 0.78, 1.26),
            difficultyMul: clamp(1 + (1 - powerRatio) * 0.65, 0.82, 1.34),
            segmentCount: stage.type === 'boss' ? 8 : (stage.type === 'elite' ? 7 : 6)
        };
    }

    function getNextUnclearedStage() {
        return CONFIG.stages.find((stage) => !state.stageClears[stage.id]) || CONFIG.stages[CONFIG.stages.length - 1];
    }

    function isStageUnlocked(stageId) {
        const index = CONFIG.stages.findIndex((item) => item.id === stageId);
        if (index <= 0) return true;
        const previous = CONFIG.stages[index - 1];
        return Boolean(state.stageClears[previous.id]);
    }

    function ensureSelectedStageValid() {
        if (!CONFIG.stages.some((item) => item.id === state.selectedStageId)) {
            state.selectedStageId = CONFIG.stages[0].id;
            return;
        }
        const selectedStage = getStage(state.selectedStageId);
        if (!isStageUnlocked(selectedStage.id) || !isChapterUnlocked(selectedStage.chapter)) {
            const fallbackStage = getNextUnclearedStage();
            state.selectedStageId = isStageUnlocked(fallbackStage.id) ? fallbackStage.id : CONFIG.stages[0].id;
        }
    }

    function addRewards(reward) {
        Object.entries(reward || {}).forEach(([key, amount]) => {
            state.resources[key] = Math.max(0, (Number(state.resources[key]) || 0) + (Number(amount) || 0));
        });
    }

    function canAfford(cost) {
        return Object.entries(cost || {}).every(([key, amount]) => (Number(state.resources[key]) || 0) >= (Number(amount) || 0));
    }

    function spend(cost) {
        if (!canAfford(cost)) {
            showToast(t('noResource'));
            return false;
        }
        Object.entries(cost || {}).forEach(([key, amount]) => {
            state.resources[key] = Math.max(0, (Number(state.resources[key]) || 0) - (Number(amount) || 0));
        });
        return true;
    }

    function getModuleUpgradeCost(moduleId) {
        const level = Number(state.moduleLevels[moduleId]) || 1;
        const table = CONFIG.moduleUpgradeTables[moduleId] || [];
        return table[level - 1] || null;
    }

    function getCrewUpgradeCost(crewId) {
        const level = Number(state.crewLevels[crewId]) || 1;
        const baseCost = CONFIG.crewUpgradeTable[level - 1] || null;
        if (!baseCost) return null;
        const discount = clamp(1 - Number(state.payment?.permanent?.crewDiscount || 0), 0.2, 1);
        const nextCost = {};
        Object.entries(baseCost).forEach(([key, amount]) => {
            const numericAmount = Number(amount || 0);
            nextCost[key] = numericAmount > 0 ? Math.max(1, Math.round(numericAmount * discount)) : 0;
        });
        return nextCost;
    }

    function getResearchUpgradeCost(researchId) {
        const definition = getResearch(researchId);
        const currentLevel = Number(state.researchLevels[researchId]) || 0;
        if (!definition || currentLevel >= definition.maxLevel) return null;
        const scrap = Math.round((definition.baseCost.scrap || 0) * Math.pow(1.46, currentLevel));
        const fuelCells = Math.round((definition.baseCost.fuelCells || 0) * Math.pow(1.42, currentLevel));
        const coreChips = (definition.baseCost.coreChips || 0) + Math.floor(currentLevel / 2);
        const relayData = definition.baseCost.relayData ? definition.baseCost.relayData + Math.floor(Math.max(0, currentLevel - 2) / 2) : 0;
        return { scrap, fuelCells, coreChips, relayData };
    }

    function getMissionProgress(mission) {
        if (!mission) return 0;
        return Math.min(mission.target, Number(state.stats[mission.metric]) || 0);
    }

    function getStageTypeLabel(stage) {
        if (stage.type === 'boss') return t('bossStage');
        if (stage.type === 'elite') return t('eliteStage');
        return t('normalStage');
    }

    function getDailyFreeClaimLimit() {
        return 1 + Math.max(0, Math.floor(Number(state.payment?.permanent?.dailyFreeClaims || 0)));
    }

    function getFreeSupplyOffer() {
        return CONFIG.softShop.find((item) => item.id === 'dailyFree') || null;
    }

    function ensureFreeSupplyWindowFresh() {
        const offer = getFreeSupplyOffer();
        if (!offer || !offer.cooldownHours || !state.dailyFreeClaimAt) return false;
        const cooldownMs = offer.cooldownHours * 60 * 60 * 1000;
        if ((Date.now() - Number(state.dailyFreeClaimAt || 0)) >= cooldownMs) {
            state.dailyFreeClaimAt = 0;
            state.dailyFreeClaimsUsed = 0;
            saveState();
            return true;
        }
        return false;
    }

    function getFreeSupplyState() {
        const offer = getFreeSupplyOffer();
        if (!offer || !offer.cooldownHours) {
            return { limit: 1, used: 0, remainingClaims: 1, remainingMs: 0 };
        }
        ensureFreeSupplyWindowFresh();
        const limit = getDailyFreeClaimLimit();
        const used = Math.max(0, Number(state.dailyFreeClaimsUsed || 0));
        const remainingClaims = Math.max(0, limit - used);
        const cooldownMs = offer.cooldownHours * 60 * 60 * 1000;
        const elapsed = Date.now() - Number(state.dailyFreeClaimAt || 0);
        return {
            limit,
            used,
            remainingClaims,
            remainingMs: remainingClaims > 0 ? 0 : Math.max(0, cooldownMs - elapsed)
        };
    }

    function getFreeSupplyRemaining() {
        return getFreeSupplyState().remainingMs;
    }

    function getPendingOrderExpiresInMs(order) {
        if (!order?.expiresAt) return 0;
        return Math.max(0, new Date(order.expiresAt).getTime() - Date.now());
    }

    function isPendingOrderExpired(order) {
        return getPendingOrderExpiresInMs(order) <= 0;
    }

    function isTerminalPaymentOrder(order) {
        if (!order) return true;
        if (order.rewardGranted) return true;
        const status = String(order.status || '').toLowerCase();
        return status === 'granted' || status === 'cancelled' || status === 'expired';
    }

    function normalizeOrder(order) {
        if (!order || typeof order !== 'object') return null;
        const normalized = {
            orderId: String(order.orderId || order.order_id || order.id || ''),
            id: String(order.orderId || order.order_id || order.id || ''),
            offerId: String(order.offerId || order.offer_id || ''),
            offerName: String(order.offerName || order.offer_name || ''),
            exactAmount: roundFixed(Number(order.exactAmount || order.exact_amount || order.baseAmount || order.base_amount || 0), PAYMENT_ORDER_DISPLAY_DECIMALS),
            baseAmount: roundFixed(Number(order.baseAmount || order.base_amount || 0), 2),
            payAddress: String(order.payAddress || order.pay_address || ''),
            network: String(order.network || 'TRON (TRC20)'),
            expiresAt: String(order.expiresAt || order.expires_at || ''),
            status: String(order.status || 'pending'),
            txid: String(order.txid || ''),
            createdAt: String(order.createdAt || order.created_at || ''),
            paidAt: String(order.paidAt || order.paid_at || ''),
            rewardGranted: !!(order.rewardGranted ?? order.reward_granted),
            gameId: String(order.gameId || order.game_id || PAYMENT_GAME_ID),
            reused: !!order.reused
        };
        if (!normalized.orderId || !normalized.offerId) return null;
        return normalized;
    }

    function getPendingOrder() {
        const order = normalizeOrder(state.payment?.pendingOrder);
        if (!order) return null;
        if (isTerminalPaymentOrder(order)) {
            state.payment.pendingOrder = null;
            saveState();
            return null;
        }
        if (String(order.status || '').toLowerCase() === 'pending' && isPendingOrderExpired(order)) {
            state.payment.pendingOrder = null;
            saveState();
            return null;
        }
        return order;
    }

    function getPendingOrderForOffer(offerId) {
        const order = getPendingOrder();
        if (!order) return null;
        return String(order.offerId || '') === String(offerId || '') ? order : null;
    }

    function setPendingOrder(order) {
        state.payment.pendingOrder = normalizeOrder(order);
        saveState();
    }

    function getPaymentMinerId() {
        let minerId = String(state.payment?.minerId || '').trim();
        if (!minerId) {
            const uid = (window.crypto?.randomUUID?.() || `${Date.now()}${Math.random()}`).replace(/-/g, '');
            minerId = `if_${uid.slice(0, 20)}`;
            state.payment.minerId = minerId;
            saveState();
        }
        return minerId;
    }

    function isOfferOwned(offerId) {
        return Array.isArray(state.payment?.claimedOfferIds) && state.payment.claimedOfferIds.includes(offerId);
    }

    function formatRemaining(ms) {
        if (ms <= 0) return t('daySupplyReady');
        const totalMinutes = Math.ceil(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return t('waitTemplate').replace('{time}', `${hours}h ${minutes}m`);
    }

    function showToast(message) {
        if (!nodes.toast) return;
        nodes.toast.textContent = message;
        nodes.toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => nodes.toast.classList.remove('is-visible'), TOAST_MS);
    }

    function setLanguage(nextLang) {
        state.lang = nextLang === 'en' ? 'en' : 'zh';
        saveState();
        renderAll();
    }

    function applyDebugQueryState() {
        try {
            const params = new URLSearchParams(window.location.search);
            const nextLang = params.get('lang');
            const nextTab = params.get('tab');
            const nextStage = params.get('stage');
            const nextOffer = params.get('offer');

            if (nextLang === 'zh' || nextLang === 'en') {
                state.lang = nextLang;
            }
            if (nextTab && CONFIG.tabs.some((item) => item.id === nextTab)) {
                state.activeTab = nextTab;
            }
            if (nextStage && CONFIG.stages.some((item) => item.id === nextStage) && isStageUnlocked(nextStage)) {
                state.selectedStageId = nextStage;
            }
            if (nextOffer && CONFIG.bundles.some((item) => item.id === nextOffer)) {
                debugOfferId = nextOffer;
            }

            ensureSelectedStageValid();
            return params.get('battle') === '1';
        } catch (error) {
            return false;
        }
    }

    function rememberRecentOrder(order, overrides = {}) {
        const normalized = normalizeOrder({ ...order, ...overrides });
        if (!normalized) return;
        state.payment.recentOrders = [
            normalized,
            ...state.payment.recentOrders.filter((entry) => String(entry.orderId || entry.id || '') !== String(normalized.orderId || normalized.id || ''))
        ].slice(0, 10);
    }

    function applyPermanentBonus(bonus) {
        Object.entries(bonus || {}).forEach(([key, amount]) => {
            state.payment.permanent[key] = roundFixed(Number(state.payment.permanent[key] || 0) + Number(amount || 0), 4);
        });
    }

    function grantPaymentRewards(payload) {
        const offer = getOffer(payload.offerId);
        if (!offer) return;
        const orderId = String(payload.orderId || '').trim();
        if (orderId && state.payment.claimedOrders[orderId]) return;
        if (!isOfferOwned(offer.id)) {
            addRewards(offer.reward || {});
            applyPermanentBonus(offer.permanentBonus || {});
            state.payment.claimedOfferIds.push(offer.id);
        }
        if (orderId) state.payment.claimedOrders[orderId] = true;
        if (payload.txid && !state.payment.verifiedTxids.includes(payload.txid)) state.payment.verifiedTxids.push(payload.txid);
        state.payment.purchaseCount = Number(state.payment.purchaseCount || 0) + 1;
        state.payment.totalSpent = roundFixed(Number(state.payment.totalSpent || 0) + Number(payload.exactAmount || offer.price || 0), 4);
        state.payment.lastPayAddress = String(payload.payAddress || state.payment.pendingOrder?.payAddress || state.payment.lastPayAddress || '');
        rememberRecentOrder({
            orderId,
            offerId: offer.id,
            offerName: localize(offer.title),
            exactAmount: payload.exactAmount || offer.price,
            txid: payload.txid || '',
            status: 'granted',
            rewardGranted: true,
            payAddress: payload.payAddress || state.payment.pendingOrder?.payAddress || '',
            gameId: PAYMENT_GAME_ID
        });
        if (state.payment.pendingOrder && String(state.payment.pendingOrder.orderId || state.payment.pendingOrder.id || '') === orderId) {
            state.payment.pendingOrder = null;
        }
        saveState();
    }

    async function copyText(value, successMessage) {
        const textValue = String(value || '').trim();
        if (!textValue) {
            showToast(text('当前没有可复制的内容。', 'Nothing available to copy.'));
            return;
        }
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(textValue);
        } else {
            const input = document.createElement('textarea');
            input.value = textValue;
            input.setAttribute('readonly', 'true');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        showToast(successMessage);
    }

    async function createBackendPaymentOrder(offerId) {
        const response = await fetch(`${PAYMENT_API_BASE}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minerId: getPaymentMinerId(), offerId, gameId: PAYMENT_GAME_ID })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) {
            const error = new Error(payload.error || text('订单创建失败。', 'Failed to create order.'));
            error.order = normalizeOrder(payload.order || null);
            error.code = String(payload.code || '');
            throw error;
        }
        const order = normalizeOrder(payload.order || payload);
        if (order) order.reused = !!payload.reused;
        return order;
    }

    async function verifyBackendPayment(orderId, txid) {
        const params = new URLSearchParams({
            orderId,
            minerId: getPaymentMinerId(),
            txid
        });
        const response = await fetch(`${PAYMENT_API_BASE}/verify-payment?${params.toString()}`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) {
            throw new Error(payload.error || text('交易校验失败。', 'Verification failed.'));
        }
        return payload;
    }

    async function checkBackendOrder(orderId) {
        const params = new URLSearchParams({
            orderId,
            minerId: getPaymentMinerId()
        });
        const response = await fetch(`${PAYMENT_API_BASE}/check-order?${params.toString()}`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) {
            throw new Error(payload.error || text('订单检查失败。', 'Order check failed.'));
        }
        return payload;
    }

    async function claimBackendPayment(orderId, txid) {
        const response = await fetch(`${PAYMENT_API_BASE}/claim-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, minerId: getPaymentMinerId(), txid })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) {
            throw new Error(payload.error || text('奖励发放失败。', 'Reward claim failed.'));
        }
        return payload;
    }

    function setPaymentNoticeForOffer(offerId, message, tone = 'info') {
        paymentNoticeOfferId = String(offerId || '');
        paymentNotice = String(message || '');
        paymentNoticeTone = tone;
    }

    function ensureOfferPaymentNotice(offer, force = false) {
        if (!offer) return;
        if (!force && paymentNoticeOfferId === offer.id && paymentNotice) return;
        const order = getPendingOrderForOffer(offer.id);
        if (isOfferOwned(offer.id)) {
            setPaymentNoticeForOffer(offer.id, text('该礼包权益已生效。', 'This pack is already active.'), 'success');
            return;
        }
        if (order?.status === 'paid' && order?.txid) {
            setPaymentNoticeForOffer(offer.id, text('检测到已支付订单，可直接恢复奖励。', 'A paid order is ready to restore.'), 'success');
            return;
        }
        if (order?.status === 'pending') {
            setPaymentNoticeForOffer(offer.id, text('订单已生成，按精确金额转账后粘贴 TXID 校验。', 'Order ready. Pay the exact amount, then paste the TXID.'), 'info');
            return;
        }
        setPaymentNoticeForOffer(offer.id, text('先创建订单，再支付并校验。', 'Create an order, then pay and verify.'), 'info');
    }

    async function createOfferOrder(offerId) {
        const offer = getOffer(offerId);
        if (!offer) return;
        if (isOfferOwned(offer.id)) {
            setPaymentNoticeForOffer(offer.id, text('该礼包权益已生效。', 'This pack is already active.'), 'success');
            openOffer(offer.id);
            return;
        }
        paymentBusyAction = 'create';
        setPaymentNoticeForOffer(offer.id, text('正在创建订单...', 'Creating order...'), 'info');
        openOffer(offer.id);
        try {
            const order = await createBackendPaymentOrder(offer.id);
            if (!order) throw new Error(text('订单创建失败。', 'Failed to create order.'));
            if (order.status === 'paid' && order.txid) {
                const claimResult = await claimBackendPayment(order.orderId, order.txid);
                grantPaymentRewards({
                    offerId: offer.id,
                    orderId: claimResult?.order?.orderId || order.orderId,
                    txid: order.txid,
                    exactAmount: claimResult?.order?.exactAmount || order.exactAmount,
                    payAddress: order.payAddress
                });
                setPaymentNoticeForOffer(offer.id, text('已恢复已支付订单，奖励已到账。', 'Paid order restored and rewards granted.'), 'success');
                showToast(text('已恢复这笔已支付订单。', 'Recovered the paid order rewards.'));
            } else {
                setPendingOrder(order);
                rememberRecentOrder(order);
                saveState();
                setPaymentNoticeForOffer(
                    offer.id,
                    order.reused
                        ? text('已恢复待支付订单，请按精确金额完成支付。', 'Pending order restored. Please pay the exact amount.')
                        : text('订单已创建，请按精确金额完成支付。', 'Order created. Please pay the exact amount.'),
                    'success'
                );
                showToast(
                    order.reused
                        ? text('已恢复待支付订单。', 'Pending order restored.')
                        : text('订单已创建。', 'Order created.')
                );
            }
        } catch (error) {
            if (error.order?.status === 'paid' && error.order?.txid) {
                const claimResult = await claimBackendPayment(error.order.orderId || error.order.id, error.order.txid);
                grantPaymentRewards({
                    offerId: error.order.offerId,
                    orderId: claimResult?.order?.orderId || error.order.orderId || error.order.id,
                    txid: error.order.txid,
                    exactAmount: claimResult?.order?.exactAmount || error.order.exactAmount || error.order.baseAmount,
                    payAddress: error.order.payAddress
                });
                setPaymentNoticeForOffer(offer.id, text('已恢复待补发订单，奖励已到账。', 'Recovered the paid order and applied rewards.'), 'success');
                showToast(text('已恢复这笔已支付订单。', 'Recovered the paid order.'));
            } else if (error.code === 'OFFER_ALREADY_OWNED' && error.order) {
                if (!isOfferOwned(error.order.offerId)) {
                    grantPaymentRewards({
                        offerId: error.order.offerId,
                        orderId: error.order.orderId || error.order.id,
                        txid: error.order.txid || '',
                        exactAmount: error.order.exactAmount || error.order.baseAmount,
                        payAddress: error.order.payAddress
                    });
                }
                setPaymentNoticeForOffer(error.order.offerId || offer.id, text('该礼包权益已恢复。', 'Pack ownership restored.'), 'success');
                showToast(text('已恢复这档礼包权益。', 'Restored this pack ownership.'));
                activeOfferId = error.order.offerId || offer.id;
            } else if (error.order) {
                setPendingOrder(error.order);
                rememberRecentOrder(error.order);
                activeOfferId = error.order.offerId || offer.id;
                setPaymentNoticeForOffer(activeOfferId, error.message || text('已有待处理订单，请先完成当前订单。', 'A pending order already exists.'), 'warning');
                showToast(text('已恢复当前待处理订单。', 'Restored the current pending order.'));
            } else {
                setPaymentNoticeForOffer(offer.id, error.message || text('订单创建失败。', 'Failed to create order.'), 'warning');
                showToast(error.message || text('订单创建失败。', 'Failed to create order.'));
            }
        } finally {
            paymentBusyAction = '';
            openOffer(activeOfferId || offer.id);
            renderAll();
        }
    }

    async function copyOfferAmount(offerId) {
        let order = getPendingOrderForOffer(offerId);
        if (!order && !isOfferOwned(offerId)) {
            await createOfferOrder(offerId);
            order = getPendingOrderForOffer(offerId);
        }
        if (!order?.exactAmount) {
            showToast(text('当前没有可复制的精确金额。', 'No exact amount available yet.'));
            return;
        }
        await copyText(formatPaymentAmount(order.exactAmount), text('精确金额已复制。', 'Exact amount copied.'));
    }

    async function copyOfferAddress(offerId) {
        let order = getPendingOrderForOffer(offerId);
        if (!order && !isOfferOwned(offerId)) {
            await createOfferOrder(offerId);
            order = getPendingOrderForOffer(offerId);
        }
        if (!order?.payAddress) {
            showToast(text('当前没有可复制的收款地址。', 'No payment address available yet.'));
            return;
        }
        await copyText(order.payAddress, text('地址已复制。', 'Address copied.'));
    }

    async function checkOfferOrder(offerId) {
        const order = getPendingOrderForOffer(offerId);
        if (!order) {
            setPaymentNoticeForOffer(offerId, text('请先创建有效订单。', 'Please create a valid order first.'), 'warning');
            openOffer(offerId);
            return;
        }
        paymentBusyAction = 'check';
        setPaymentNoticeForOffer(offerId, text('正在检查订单状态...', 'Checking order status...'), 'info');
        openOffer(offerId);
        try {
            const payload = await checkBackendOrder(order.orderId);
            const remote = normalizeOrder(payload.order || payload);
            if (!remote) throw new Error(text('订单信息无效。', 'Invalid order payload.'));
            if (String(remote.status || '').toLowerCase() === 'expired') {
                state.payment.pendingOrder = null;
                saveState();
                setPaymentNoticeForOffer(offerId, text('订单已过期，请重新创建。', 'This order expired. Please create a new one.'), 'warning');
            } else {
                setPendingOrder(remote);
                rememberRecentOrder(remote);
                if (String(remote.status || '').toLowerCase() === 'paid' && remote.txid) {
                    setPaymentNoticeForOffer(offerId, text('检测到已支付订单，可直接恢复奖励。', 'A paid order is ready to restore.'), 'success');
                } else {
                    setPaymentNoticeForOffer(offerId, text('订单仍待支付，完成转账后再校验即可。', 'Order is still pending. Complete the transfer, then verify it.'), 'info');
                }
            }
        } catch (error) {
            setPaymentNoticeForOffer(offerId, error.message || text('订单状态检查失败。', 'Failed to check order status.'), 'warning');
        } finally {
            paymentBusyAction = '';
            openOffer(offerId);
        }
    }

    async function claimOfferReward(offerId) {
        const order = getPendingOrderForOffer(offerId);
        if (!order || String(order.status || '').toLowerCase() !== 'paid' || !order.txid) {
            setPaymentNoticeForOffer(offerId, text('当前没有可恢复的已支付订单。', 'No paid order is ready to restore.'), 'warning');
            openOffer(offerId);
            return;
        }
        paymentBusyAction = 'claim';
        setPaymentNoticeForOffer(offerId, text('正在恢复奖励...', 'Restoring rewards...'), 'info');
        openOffer(offerId);
        try {
            const claimResult = await claimBackendPayment(order.orderId, order.txid);
            grantPaymentRewards({
                offerId,
                orderId: claimResult?.order?.orderId || order.orderId,
                txid: order.txid,
                exactAmount: claimResult?.order?.exactAmount || order.exactAmount,
                payAddress: order.payAddress
            });
            setPaymentNoticeForOffer(offerId, text('支付已确认，奖励已发放。', 'Payment confirmed and rewards granted.'), 'success');
            showToast(text('奖励已到账。', 'Rewards granted.'));
            renderAll();
        } catch (error) {
            setPaymentNoticeForOffer(offerId, error.message || text('奖励恢复失败。', 'Failed to restore rewards.'), 'warning');
        } finally {
            paymentBusyAction = '';
            openOffer(offerId);
        }
    }

    async function verifyOfferTxid(offerId) {
        const offer = getOffer(offerId);
        if (!offer) return;
        const order = getPendingOrderForOffer(offerId);
        if (!order) {
            setPaymentNoticeForOffer(offerId, text('请先创建有效订单。', 'Please create a valid order first.'), 'warning');
            openOffer(offerId);
            return;
        }
        if (isOfferOwned(offerId)) {
            setPaymentNoticeForOffer(offerId, text('该礼包权益已生效。', 'This pack is already active.'), 'success');
            openOffer(offerId);
            return;
        }
        const txid = String(paymentDraftTxid || '').trim();
        if (!PAYMENT_TXID_PATTERN.test(txid)) {
            setPaymentNoticeForOffer(offerId, text('TXID 格式不正确。', 'TXID format is invalid.'), 'warning');
            openOffer(offerId);
            return;
        }
        paymentBusyAction = 'verify';
        setPaymentNoticeForOffer(offerId, text('正在校验交易...', 'Verifying transaction...'), 'info');
        openOffer(offerId);
        try {
            const verified = await verifyBackendPayment(order.orderId, txid);
            const claimResult = await claimBackendPayment(order.orderId, txid);
            grantPaymentRewards({
                offerId,
                orderId: claimResult?.order?.orderId || verified?.order?.orderId || order.orderId,
                txid,
                exactAmount: claimResult?.order?.exactAmount || verified?.order?.exactAmount || order.exactAmount,
                payAddress: order.payAddress
            });
            paymentDraftTxid = '';
            setPaymentNoticeForOffer(offerId, text('支付校验完成，奖励已发放。', 'Payment verified and rewards granted.'), 'success');
            showToast(text('支付已校验。', 'Payment verified.'));
            renderAll();
        } catch (error) {
            setPaymentNoticeForOffer(offerId, error.message || text('校验失败。', 'Verification failed.'), 'warning');
        } finally {
            paymentBusyAction = '';
            openOffer(offerId);
        }
    }

    function buildCombatFocusChips(stage = getStage(state.selectedStageId)) {
        const profile = getBattleProfile(stage);
        return [
            `${text('推进', 'Pace')} x${profile.progressMul.toFixed(2)}`,
            `${text('防护', 'Guard')} x${profile.defenseMul.toFixed(2)}`,
            `${text('修复', 'Repair')} x${profile.repairMul.toFixed(2)}`,
            `${text('回收', 'Salvage')} x${profile.salvageMul.toFixed(2)}`
        ];
    }

    function buildOwnedPerkChips() {
        const chips = [];
        if (Number(state.payment?.permanent?.dailyFreeClaims || 0) > 0) {
            chips.push(text(`免费补给 +${Number(state.payment.permanent.dailyFreeClaims)}`, `Free Supply +${Number(state.payment.permanent.dailyFreeClaims)}`));
        }
        if (Number(state.payment?.permanent?.fuelPayout || 0) > 0) {
            chips.push(text(`燃料 +${formatPercent(state.payment.permanent.fuelPayout)}`, `Fuel +${formatPercent(state.payment.permanent.fuelPayout)}`));
        }
        if (Number(state.payment?.permanent?.crewDiscount || 0) > 0) {
            chips.push(text(`乘员消耗 -${formatPercent(state.payment.permanent.crewDiscount)}`, `Crew Cost -${formatPercent(state.payment.permanent.crewDiscount)}`));
        }
        if (Number(state.payment?.permanent?.eliteBossReward || 0) > 0) {
            chips.push(text(`精英/Boss +${formatPercent(state.payment.permanent.eliteBossReward)}`, `Elite/Boss +${formatPercent(state.payment.permanent.eliteBossReward)}`));
        }
        return chips;
    }

    function renderHero() {
        document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
        document.title = localize(CONFIG.meta.title);
        nodes.backToHubLink.textContent = t('backToHub');
        nodes.soundToggle.textContent = state.soundEnabled ? t('sfxOn') : t('sfxOff');
        nodes.soundToggle.setAttribute('aria-pressed', state.soundEnabled ? 'true' : 'false');
        nodes.heroEyebrow.textContent = localize(CONFIG.meta.eyebrow);
        nodes.heroTitle.textContent = localize(CONFIG.meta.title);
        nodes.heroSubtitle.textContent = localize(CONFIG.meta.subtitle);
        nodes.heroChips.innerHTML = [
            `<span class="if-hero-chip">${t('preview')}</span>`,
            ...CONFIG.heroTags.map((tag) => `<span class="if-hero-chip">${localize(tag)}</span>`)
        ].join('');
        nodes.resourceStrip.innerHTML = CONFIG.resources.map((resource) => `
            <div class="if-resource-card">
                <div class="if-resource-label"><span>${resource.icon}</span><span>${localize(resource.label)}</span></div>
                <div class="if-resource-value">${formatNumber(state.resources[resource.id])}</div>
            </div>
        `).join('');
        nodes.drawerEyebrow.textContent = t('bundlePreview');
        nodes.offerLaterBtn.textContent = text('关闭', 'Close');
        nodes.offerMockPayBtn.textContent = text('创建订单', 'Create Order');
        document.querySelector('[data-battle-action="overdrive"]').innerHTML = `<span>${t('skillOverdrive')}</span><small>${t('skillReady')}</small>`;
        document.querySelector('[data-battle-action="barrier"]').innerHTML = `<span>${t('skillBarrier')}</span><small>${t('skillReady')}</small>`;
        document.querySelector('[data-battle-action="repair"]').innerHTML = `<span>${t('skillRepair')}</span><small>${t('skillReady')}</small>`;
        document.querySelector('[data-battle-action="ultimate"]').innerHTML = `<span>${t('skillUltimate')}</span><small>${t('ultimateCharge').replace('{value}', '0')}</small>`;
        nodes.battleAdvanceBtn.textContent = t('manualBurst');
        document.getElementById('battleIntegrityLabel').textContent = t('integrity');
        document.getElementById('battleShieldLabel').textContent = t('shield');
        document.getElementById('battleHeatLabel').textContent = t('heat');
        document.getElementById('battleProgressLabel').textContent = t('progress');
    }

    function renderSummary() {
        const nextStage = getNextUnclearedStage();
        const perkChips = buildOwnedPerkChips();
        nodes.heroSummary.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${t('preview')}</div>
                    <h2>${localize(CONFIG.meta.title)}</h2>
                    <p>${t('summaryCopy')}</p>
                </div>
                <div class="if-chip-row">
                    <span class="if-chip">${t('power')} ${formatNumber(getCurrentPower())}</span>
                    <span class="if-chip">${t('currentStage')} ${state.selectedStageId}</span>
                    <span class="if-chip">${text('累计充值', 'Spent')} ${Number(state.payment?.totalSpent || 0).toFixed(2)} USDT</span>
                </div>
            </div>
            <div class="if-chip-row">
                ${buildCombatFocusChips().map((item) => `<span class="if-chip">${item}</span>`).join('')}
                ${perkChips.length ? perkChips.map((item) => `<span class="if-chip">${item}</span>`).join('') : `<span class="if-chip">${text('未生效付费权益', 'No paid perks active')}</span>`}
            </div>
            <div class="if-summary-grid">
                <div class="if-stat-card"><span>${t('power')}</span><strong>${formatNumber(getCurrentPower())}</strong></div>
                <div class="if-stat-card"><span>${t('currentStage')}</span><strong>${state.selectedStageId}</strong></div>
                <div class="if-stat-card"><span>${t('clearCount')}</span><strong>${formatNumber(getTotalClears())}</strong></div>
                <div class="if-stat-card"><span>${t('nextTarget')}</span><strong>${nextStage.id}</strong></div>
            </div>
        `;
    }

    function renderTabBar() {
        nodes.tabBar.innerHTML = CONFIG.tabs.map((tab) => `
            <button class="if-tab ${state.activeTab === tab.id ? 'is-active' : ''}" type="button" data-tab="${tab.id}">
                <span class="if-tab-icon">${tab.icon}</span>
                <span class="if-tab-label">${localize(tab.label)}</span>
            </button>
        `).join('');
        document.querySelectorAll('[data-lang-switch]').forEach((button) => {
            const lang = button.getAttribute('data-lang-switch');
            button.classList.toggle('is-active', lang === state.lang);
            button.setAttribute('aria-pressed', lang === state.lang ? 'true' : 'false');
        });
    }

    function renderPanel() {
        if (state.activeTab === 'run') {
            renderRunTab();
            return;
        }
        if (state.activeTab === 'train') {
            renderTrainTab();
            return;
        }
        if (state.activeTab === 'crew') {
            renderCrewTab();
            return;
        }
        if (state.activeTab === 'workshop') {
            renderWorkshopTab();
            return;
        }
        if (state.activeTab === 'missions') {
            renderMissionsTab();
            return;
        }
        if (state.activeTab === 'season') {
            renderSeasonTab();
            return;
        }
        renderShopTab();
    }

    function renderRunTab() {
        const stage = getStage(state.selectedStageId);
        const chapter = getSelectedChapter();
        const powerState = getPowerState(stage);
        const powerGap = getPowerGap(stage);
        const battleProfile = getBattleProfile(stage);
        const status = state.stageClears[stage.id] ? t('cleared') : (isStageUnlocked(stage.id) ? t('unlocked') : t('locked'));
        const chapterStages = getChapterStages(chapter);
        nodes.panelContent.innerHTML = `
            <div class="if-run-layout">
                <div class="if-panel-head">
                    <div>
                        <div class="eyebrow">${localize(CONFIG.tabs[0].label)} · ${t('chapter')} ${chapter}</div>
                        <h2>${t('runTitle')}</h2>
                        <p>${t('runBody')}</p>
                    </div>
                    <div class="if-chip-row">
                        <span class="if-chip">${t('currentStage')} ${stage.id}</span>
                        <span class="if-chip">${t('power')} ${formatNumber(getCurrentPower())} / ${formatNumber(stage.recommended)}</span>
                        <span class="if-chip">${powerState.label}</span>
                    </div>
                </div>
                <div class="if-chapter-strip">
                    ${[1, 2, 3, 4].map((chapterId) => {
                        const chapterProgress = getChapterProgress(chapterId);
                        const chapterUnlocked = isChapterUnlocked(chapterId);
                        return `
                            <button class="if-chapter-btn ${chapter === chapterId ? 'is-active' : ''}" type="button" data-action="select-chapter" data-chapter="${chapterId}" ${chapterUnlocked ? '' : 'disabled'}>
                                <span>${t('chapter')} ${chapterId}</span>
                                <strong>${chapterUnlocked ? `${chapterProgress.cleared}/${chapterProgress.total}` : t('locked')}</strong>
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="if-run-hero">
                    <div class="if-run-hero-top">
                        <div>
                            <div class="if-mini-label">${getStageTypeLabel(stage)}</div>
                            <strong>${stage.id} · ${localize(stage.name)}</strong>
                            <div class="if-muted">${t('pressure')}：${localize(stage.pressure)} · ${t('rewardFocus')}：${localize(stage.rewardFocus)}</div>
                        </div>
                        <span class="if-inline-pill">${status}</span>
                    </div>
                    <div class="if-route-chips">
                        <span class="if-chip">${t('routeNode')} ${battleProfile.segmentCount}</span>
                        <span class="if-chip">${t('eventChoose')} ×2</span>
                        <span class="if-chip">${t('powerGap')} ${powerGap}</span>
                        <span class="if-chip">${t('chapterProgress')} ${getChapterProgress(chapter).cleared}/${getChapterProgress(chapter).total}</span>
                    </div>
                    <div class="if-btn-row">
                        <button class="primary-btn" type="button" data-action="open-battle" ${isStageUnlocked(stage.id) ? '' : 'disabled'}>${t('startRun')}</button>
                    </div>
                </div>
                <div class="if-card-grid">
                    <div class="if-mini-card">
                        <div class="if-mini-label">${t('rewardPreview')}</div>
                        <div class="if-reward-row">${buildRewardItems(stage.reward)}</div>
                    </div>
                    <div class="if-mini-card">
                        <div class="if-mini-label">${t('loadout')}</div>
                        <div class="if-mini-list">
                            ${CONFIG.modules.map((module) => `<span class="if-cost-item">${module.icon} ${localize(module.name)} ${t('level')} ${state.moduleLevels[module.id]}</span>`).join('')}
                            ${state.activeCrew.map((crewId) => `<span class="if-cost-item">${getCrew(crewId).icon} ${localize(getCrew(crewId).name)}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="if-stage-grid">
                    ${chapterStages.map((item) => {
                        const unlocked = isStageUnlocked(item.id);
                        const cleared = Boolean(state.stageClears[item.id]);
                        return `
                            <button class="if-stage-card ${state.selectedStageId === item.id ? 'is-selected' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="select-stage" data-stage-id="${item.id}">
                                <div class="if-stage-head">
                                    <div>
                                        <div class="if-mini-label">${getStageTypeLabel(item)}</div>
                                        <strong>${item.id}</strong>
                                    </div>
                                    <span class="if-stage-tag">${cleared ? t('cleared') : (unlocked ? t('unlocked') : t('locked'))}</span>
                                </div>
                                <div class="if-muted">${localize(item.name)}</div>
                                <div class="if-stage-recommended">${t('power')} ${formatNumber(item.recommended)}</div>
                                <div class="if-cost-row">
                                    <span class="if-cost-item">${t('pressure')} · ${localize(item.pressure)}</span>
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function renderTrainTab() {
        const stage = getStage(state.selectedStageId);
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[1].label)}</div>
                    <h2>${t('trainTitle')}</h2>
                    <p>${t('trainBody')}</p>
                </div>
                <div class="if-chip-row">
                    <span class="if-chip">${t('power')} ${formatNumber(getCurrentPower())}</span>
                    ${buildCombatFocusChips(stage).map((item) => `<span class="if-chip">${item}</span>`).join('')}
                </div>
            </div>
            <div class="if-card-grid">
                ${CONFIG.modules.map((item) => {
                    const level = state.moduleLevels[item.id];
                    const cost = getModuleUpgradeCost(item.id);
                    return `
                        <div class="if-module-card">
                            <div class="if-card-head">
                                <div>
                                    <div class="if-mini-label">${localize(item.name)}</div>
                                    <strong class="if-module-title">${item.icon} ${t('level')} ${level}</strong>
                                </div>
                                <span class="if-inline-pill">${level >= item.maxLevel ? t('maxLevel') : `${t('cost')} ${cost ? formatShortCost(cost) : '—'}`}</span>
                            </div>
                            <div class="if-muted">${localize(item.summary)}</div>
                            <div class="if-cost-row">
                                <span class="if-cost-item">${t('effect')} · ${localize(item.effect)}</span>
                            </div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="upgrade-module" data-module-id="${item.id}" ${level >= item.maxLevel ? 'disabled' : ''}>${t('upgrade')}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderCrewTab() {
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[2].label)}</div>
                    <h2>${t('crewTitle')}</h2>
                    <p>${t('crewBody')}</p>
                </div>
                <div class="if-chip-row">
                    <span class="if-chip">${t('activeCrew')}</span>
                    ${state.activeCrew.map((crewId) => `<span class="if-chip">${localize(getCrew(crewId).name)}</span>`).join('')}
                    ${Number(state.payment?.permanent?.crewDiscount || 0) > 0 ? `<span class="if-chip">${text('乘员消耗 -', 'Crew Cost -')}${formatPercent(state.payment.permanent.crewDiscount)}</span>` : ''}
                </div>
            </div>
            <div class="if-card-grid">
                ${CONFIG.crew.map((item) => {
                    const level = state.crewLevels[item.id];
                    const cost = getCrewUpgradeCost(item.id);
                    const active = state.activeCrew.includes(item.id);
                    return `
                        <div class="if-crew-card">
                            <div class="if-card-head">
                                <div>
                                    <div class="if-mini-label">${localize(item.role)}</div>
                                    <strong class="if-crew-title">${item.icon} ${localize(item.name)} · ${t('level')} ${level}</strong>
                                </div>
                                <span class="if-inline-pill">${active ? t('active') : localize(item.role)}</span>
                            </div>
                            <div class="if-muted">${localize(item.summary)}</div>
                            <div class="if-cost-row">
                                <span class="if-cost-item">${t('passive')} · ${localize(item.passive)}</span>
                            </div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="toggle-crew" data-crew-id="${item.id}">${active ? t('remove') : t('assign')}</button>
                                <button class="ghost-btn" type="button" data-action="upgrade-crew" data-crew-id="${item.id}" ${level >= item.maxLevel ? 'disabled' : ''}>${level >= item.maxLevel ? t('maxLevel') : `${t('upgrade')} · ${formatShortCost(cost || {})}`}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderWorkshopTab() {
        const stage = getStage(state.selectedStageId);
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[3].label)}</div>
                    <h2>${t('workshopTitle')}</h2>
                    <p>${t('workshopBody')}</p>
                </div>
                <div class="if-chip-row">
                    ${buildCombatFocusChips(stage).map((item) => `<span class="if-chip">${item}</span>`).join('')}
                </div>
            </div>
            <div class="if-card-grid">
                ${CONFIG.research.map((item) => {
                    const level = state.researchLevels[item.id];
                    const cost = getResearchUpgradeCost(item.id);
                    return `
                        <div class="if-research-card">
                            <div class="if-card-head">
                                <div>
                                    <div class="if-mini-label">${item.icon} ${localize(item.name)}</div>
                                    <strong>${t('level')} ${level}</strong>
                                </div>
                                <span class="if-inline-pill">${level >= item.maxLevel ? t('maxLevel') : `${t('cost')} ${cost ? formatShortCost(cost) : '—'}`}</span>
                            </div>
                            <div class="if-cost-row">
                                <span class="if-cost-item">${t('effect')} · ${localize(item.effect)}</span>
                            </div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="upgrade-research" data-research-id="${item.id}" ${level >= item.maxLevel ? 'disabled' : ''}>${t('upgrade')}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderMissionsTab() {
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[4].label)}</div>
                    <h2>${t('missionsTitle')}</h2>
                    <p>${t('missionsBody')}</p>
                </div>
            </div>
            <div class="if-season-grid">
                ${CONFIG.missions.map((mission) => {
                    const progress = getMissionProgress(mission);
                    const claimed = state.claimedMissions.includes(mission.id);
                    const ready = progress >= mission.target && !claimed;
                    return `
                        <div class="if-mission-card">
                            <div class="if-season-head">
                                <div>
                                    <div class="if-mini-label">${progress}/${mission.target}</div>
                                    <strong class="if-season-title">${localize(mission.title)}</strong>
                                </div>
                                <span class="if-inline-pill">${claimed ? t('claimed') : (ready ? t('claim') : `${progress}/${mission.target}`)}</span>
                            </div>
                            <div class="if-reward-row">${buildRewardItems(mission.reward)}</div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="claim-mission" data-mission-id="${mission.id}" ${ready ? '' : 'disabled'}>${claimed ? t('claimed') : t('claim')}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderSeasonTab() {
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[5].label)}</div>
                    <h2>${t('seasonTitle')}</h2>
                    <p>${t('seasonBody')}</p>
                </div>
                <div class="if-chip-row">
                    <span class="if-chip">XP ${formatNumber(state.resources.seasonXp)}</span>
                    <span class="if-chip">${t('premiumPreview')}</span>
                </div>
            </div>
            <div class="if-season-grid">
                ${CONFIG.season.map((node) => {
                    const claimed = state.claimedSeason.includes(node.id);
                    const ready = state.resources.seasonXp >= node.xp && !claimed;
                    const action = node.premium ? 'open-offer' : 'claim-season';
                    const actionAttr = node.premium ? 'data-offer-id="captain"' : `data-season-id="${node.id}"`;
                    const buttonLabel = node.premium ? t('previewOrder') : (claimed ? t('claimed') : t('claim'));
                    const disabledAttr = node.premium ? '' : (ready ? '' : 'disabled');
                    return `
                        <div class="if-season-card">
                            <div class="if-season-head">
                                <div>
                                    <div class="if-mini-label">${node.premium ? t('premiumPreview') : localize(CONFIG.tabs[5].label)}</div>
                                    <strong class="if-season-title">${localize(node.title)} · XP ${node.xp}</strong>
                                </div>
                                <span class="if-inline-pill">${claimed ? t('claimed') : (ready ? t('claim') : `XP ${node.xp}`)}</span>
                            </div>
                            <div class="if-reward-row">${buildRewardItems(node.reward)}</div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="${action}" ${actionAttr} ${disabledAttr}>${buttonLabel}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderShopTab() {
        const freeState = getFreeSupplyState();
        const pendingOrder = getPendingOrder();
        const perkChips = buildOwnedPerkChips();
        nodes.panelContent.innerHTML = `
            <div class="if-panel-head">
                <div>
                    <div class="eyebrow">${localize(CONFIG.tabs[6].label)}</div>
                    <h2>${t('shopTitle')}</h2>
                    <p>${t('shopBody')}</p>
                </div>
                <div class="if-chip-row">
                    <span class="if-chip">${text('累计充值', 'Spent')} ${Number(state.payment?.totalSpent || 0).toFixed(2)} USDT</span>
                    <span class="if-chip">${text('已生效礼包', 'Active Packs')} ${formatNumber(state.payment?.claimedOfferIds?.length || 0)}</span>
                    ${pendingOrder ? `<span class="if-chip">${text('待处理订单', 'Pending')} ${escapeHtml(pendingOrder.offerId)}</span>` : ''}
                </div>
            </div>
            <div class="if-chip-row">
                ${perkChips.length ? perkChips.map((item) => `<span class="if-chip">${item}</span>`).join('') : `<span class="if-chip">${text('礼包权益会在这里汇总显示', 'Pack perks will appear here')}</span>`}
            </div>
            <div class="if-shop-grid">
                ${CONFIG.softShop.map((offer) => {
                    const isFree = offer.price === 0;
                    const disabled = isFree ? freeState.remainingClaims <= 0 : !canAfford(offer.price);
                    const title = isFree
                        ? `${localize(offer.title)} · ${freeState.remainingClaims > 0 ? text(`剩余 ${freeState.remainingClaims}/${freeState.limit}`, `${freeState.remainingClaims}/${freeState.limit} left`) : formatRemaining(freeState.remainingMs)}`
                        : localize(offer.title);
                    return `
                        <div class="if-shop-card">
                            <div class="if-shop-head">
                                <div>
                                    <div class="if-mini-label">${localize(offer.tag)}</div>
                                    <strong>${title}</strong>
                                </div>
                                <span class="if-inline-pill">${isFree ? `${t('freeSupply')} ${freeState.limit > 1 ? `x${freeState.limit}` : ''}` : formatShortCost(offer.price)}</span>
                            </div>
                            <div class="if-reward-row">${buildRewardItems(offer.reward)}</div>
                            <div class="if-card-actions">
                                <button class="ghost-btn" type="button" data-action="buy-soft-offer" data-offer-id="${offer.id}" ${disabled ? 'disabled' : ''}>${isFree ? (freeState.remainingClaims > 0 ? t('claim') : t('cooldown')) : t('buy')}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
                ${CONFIG.bundles.map((offer) => {
                    const owned = isOfferOwned(offer.id);
                    const order = getPendingOrderForOffer(offer.id);
                    const readyClaim = order && String(order.status || '').toLowerCase() === 'paid' && order.txid;
                    const pill = owned
                        ? text('已生效', 'Active')
                        : readyClaim
                            ? text('待恢复', 'Ready')
                            : order
                                ? text('待支付', 'Pending')
                                : offer.exactPrice;
                    return `
                    <div class="if-shop-card ${owned ? 'is-owned' : ''}">
                        <div class="if-shop-head">
                            <div>
                                <div class="if-mini-label">${t('bundlePreview')}</div>
                                <strong>${localize(offer.title)}</strong>
                            </div>
                            <span class="if-inline-pill">${pill}</span>
                        </div>
                        <div class="if-reward-row">${buildRewardItems(offer.reward)}</div>
                        <div class="if-cost-row"><span class="if-cost-item">${t('permanent')} · ${localize(offer.permanent)}</span></div>
                        <div class="if-card-actions">
                            <button class="ghost-btn" type="button" data-action="open-offer" data-offer-id="${offer.id}">${owned ? text('查看权益', 'View Perk') : order ? text('继续订单', 'Continue') : t('previewOrder')}</button>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
    }

    function buildRewardItems(reward) {
        return Object.entries(reward || {})
            .filter(([, amount]) => Number(amount) > 0)
            .map(([key, amount]) => {
                const resource = CONFIG.resources.find((item) => item.id === key);
                const label = resource ? localize(resource.label) : key;
                const icon = resource ? resource.icon : '•';
                return `<span class="if-reward-item">${icon} ${label} +${formatNumber(amount)}</span>`;
            })
            .join('');
    }

    function clearBattleLoop() {
        if (battleLoopHandle) {
            window.clearInterval(battleLoopHandle);
            battleLoopHandle = null;
        }
    }

    function startBattleLoop() {
        clearBattleLoop();
        battleLoopHandle = window.setInterval(() => {
            if (!battleState || battleState.activeEvent || battleState.settled || nodes.battleOverlay.classList.contains('is-hidden')) {
                return;
            }
            advanceBattle(false);
        }, BATTLE_TICK_MS);
    }

    function buildBattleReward(stage, win) {
        const profile = battleState?.profile || getBattleProfile(stage);
        const salvageMul = profile.salvageMul + (battleState?.salvageBoost || 0);
        const relayMul = profile.relayMul + (battleState?.chargeBoost || 0) * 0.12;
        const baseReward = win
            ? {
                scrap: Math.round((stage.reward.scrap || 0) * salvageMul),
                fuelCells: Math.round((stage.reward.fuelCells || 0) * (0.92 + (salvageMul - 1) * 0.65)),
                coreChips: Math.round(stage.reward.coreChips || 0),
                relayData: Math.round((stage.reward.relayData || 0) * relayMul),
                seasonXp: Math.round(stage.reward.seasonXp || 0)
            }
            : {
                scrap: Math.round((stage.reward.scrap || 0) * 0.38 * Math.max(0.9, salvageMul)),
                fuelCells: Math.round((stage.reward.fuelCells || 0) * 0.32),
                coreChips: Math.max(0, Math.round((stage.reward.coreChips || 0) * 0.2)),
                relayData: 0,
                seasonXp: Math.round((stage.reward.seasonXp || 0) * 0.35)
            };
        const permanent = state.payment?.permanent || {};
        if (Number(permanent.fuelPayout || 0) > 0) {
            baseReward.fuelCells = Math.round((baseReward.fuelCells || 0) * (1 + Number(permanent.fuelPayout || 0)));
        }
        if (Number(permanent.eliteBossReward || 0) > 0 && (stage.type === 'elite' || stage.type === 'boss')) {
            const bonusRate = 1 + Number(permanent.eliteBossReward || 0);
            ['scrap', 'fuelCells', 'coreChips', 'relayData', 'seasonXp'].forEach((key) => {
                baseReward[key] = Math.round((baseReward[key] || 0) * bonusRate);
            });
        }
        return mergeRewards(baseReward, battleState?.rewardBonus || {});
    }

    function openBattle(stageId = state.selectedStageId) {
        const stage = getStage(stageId);
        if (!isStageUnlocked(stage.id)) {
            showToast(t('lockedStageTip'));
            return;
        }
        const profile = getBattleProfile(stage);
        battleState = {
            stageId: stage.id,
            profile,
            integrity: 100,
            shield: clamp(62 + (state.moduleLevels.armorCar - 1) * 12 + (state.researchLevels.platingWeld || 0) * 2, 0, 100),
            heat: Math.max(6, 14 - state.moduleLevels.supportCar),
            progress: 0,
            wave: 0,
            enemyCount: stage.type === 'boss' ? 6 : 4,
            logs: [t('battleWarmup')],
            eventQueue: deepClone(CONFIG.battleEvents),
            activeEvent: null,
            rewardBonus: {},
            overdriveTurns: 0,
            barrierTurns: 0,
            chargeBoost: 0,
            salvageBoost: 0,
            skillCooldowns: {
                overdrive: 0,
                barrier: 0,
                repair: 0
            },
            ultimateCharge: clamp(30 + (state.moduleLevels.ultimate - 1) * 10 + (state.researchLevels.relayDecoder || 0) * 4, 0, 100),
            settled: false,
            result: null,
            rewardsApplied: false
        };
        nodes.battleOverlay.classList.remove('is-hidden');
        document.body.classList.add('if-modal-open');
        renderBattle();
        startBattleLoop();
    }

    function closeBattle() {
        clearBattleLoop();
        battleState = null;
        nodes.battleOverlay.classList.add('is-hidden');
        document.body.classList.remove('if-modal-open');
    }

    function pushBattleLog(message) {
        if (!battleState) return;
        battleState.logs.unshift(message);
        battleState.logs = battleState.logs.slice(0, 5);
    }

    function renderBattleButtons() {
        const overdriveBtn = document.querySelector('[data-battle-action="overdrive"]');
        const barrierBtn = document.querySelector('[data-battle-action="barrier"]');
        const repairBtn = document.querySelector('[data-battle-action="repair"]');
        const ultimateBtn = document.querySelector('[data-battle-action="ultimate"]');
        if (!battleState) return;

        const applyButtonState = (button, label, ready, meta, isUltimate) => {
            if (!button) return;
            button.disabled = battleState.settled ? true : (!ready || Boolean(battleState.activeEvent));
            button.classList.toggle('is-ready', ready && !battleState.settled && !battleState.activeEvent);
            button.classList.toggle('is-cooling', !ready || battleState.settled || Boolean(battleState.activeEvent));
            button.classList.toggle('is-ultimate', Boolean(isUltimate));
            button.innerHTML = `<span>${label}</span><small>${meta}</small>`;
        };

        const overdriveReady = battleState.skillCooldowns.overdrive <= 0;
        const barrierReady = battleState.skillCooldowns.barrier <= 0;
        const repairReady = battleState.skillCooldowns.repair <= 0;
        const ultimateReady = battleState.ultimateCharge >= 100;

        applyButtonState(overdriveBtn, t('skillOverdrive'), overdriveReady, battleState.activeEvent ? t('eventChoose') : (overdriveReady ? t('skillReady') : t('skillCooldown').replace('{value}', battleState.skillCooldowns.overdrive)), false);
        applyButtonState(barrierBtn, t('skillBarrier'), barrierReady, battleState.activeEvent ? t('eventChoose') : (barrierReady ? t('skillReady') : t('skillCooldown').replace('{value}', battleState.skillCooldowns.barrier)), false);
        applyButtonState(repairBtn, t('skillRepair'), repairReady, battleState.activeEvent ? t('eventChoose') : (repairReady ? t('skillReady') : t('skillCooldown').replace('{value}', battleState.skillCooldowns.repair)), false);
        applyButtonState(ultimateBtn, t('skillUltimate'), ultimateReady, battleState.activeEvent ? t('eventChoose') : t('ultimateCharge').replace('{value}', Math.round(battleState.ultimateCharge)), true);

        nodes.battleAdvanceBtn.disabled = Boolean(battleState.activeEvent || battleState.settled);
        nodes.battleAdvanceBtn.textContent = battleState.activeEvent ? t('eventChoose') : t('manualBurst');
    }

    function renderBattleInfoCard(stage) {
        if (battleState.settled && battleState.result) {
            return `
                <div class="if-event-card if-result-card ${battleState.result.win ? '' : 'is-fail'}">
                    <div class="if-mini-label">${battleState.result.win ? t('battleVictoryTitle') : t('battleDefeatTitle')}</div>
                    <div class="if-result-title">${stage.id} · ${localize(stage.name)}</div>
                    <div class="if-result-copy">${battleState.result.win ? t('battleWin') : t('partialReward')}</div>
                    <div class="if-reward-row">${buildRewardItems(battleState.result.payout)}</div>
                    <div class="if-btn-row">
                        <button class="ghost-btn" type="button" data-battle-action="result-close">${t('battleReturn')}</button>
                        <button class="primary-btn" type="button" data-battle-action="result-retry">${t('battleRetry')}</button>
                    </div>
                </div>
            `;
        }

        if (battleState.activeEvent) {
            return `
                <div class="if-event-card">
                    <div class="if-mini-label">${t('eventChoose')}</div>
                    <strong>${localize(battleState.activeEvent.title)}</strong>
                    <div class="if-battle-pill-strip">
                        <span class="if-inline-pill">${t('routeBonus')} ${Math.round((battleState.profile.eventMul - 1) * 100)}%</span>
                        <span class="if-inline-pill">${t('ultimateCharge').replace('{value}', Math.round(battleState.ultimateCharge))}</span>
                    </div>
                    <div class="if-event-options">
                        ${battleState.activeEvent.options.map((option) => `
                            <button class="if-event-option" type="button" data-battle-action="event-option" data-event-option="${option.id}">
                                <strong>${localize(option.label)}</strong>
                                <div class="if-muted">${localize(option.result)}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div class="if-event-card">
                <div class="if-mini-label">${t('battleLogs')}</div>
                <div class="if-battle-pill-strip">
                    <span class="if-inline-pill">${t('chapter')} ${stage.chapter}</span>
                    <span class="if-inline-pill">${t('routeNode')} ${battleState.wave}/${battleState.profile.segmentCount}</span>
                    <span class="if-inline-pill">${t('ultimateCharge').replace('{value}', Math.round(battleState.ultimateCharge))}</span>
                    <span class="if-inline-pill">${t('power')} ${formatNumber(getCurrentPower())}</span>
                </div>
                <div class="if-log-list">
                    ${battleState.logs.map((entry) => `<div class="if-log-item">${entry}</div>`).join('')}
                </div>
            </div>
        `;
    }

    function renderBattle() {
        if (!battleState) return;
        const stage = getStage(battleState.stageId);
        const trainShift = Math.round((battleState.progress / 100) * 84);
        const tip = battleState.settled
            ? (battleState.result?.win ? t('battleVictoryTitle') : t('battleDefeatTitle'))
            : battleState.activeEvent
                ? `${t('eventChoose')} · ${localize(battleState.activeEvent.title)}`
                : (battleState.heat >= 90 ? t('battleOverheat') : (getCurrentPower() < stage.recommended ? t('battleUnderpowered') : (stage.type === 'boss' && battleState.progress >= 65 ? t('battleBossIncoming') : localize(stage.pressure))));

        nodes.battleEyebrow.textContent = `${t('battlePreview')} · ${getStageTypeLabel(stage)}`;
        nodes.battleStageTitle.textContent = `${stage.id} · ${localize(stage.name)}`;
        nodes.battleIntegrityValue.textContent = `${Math.round(battleState.integrity)}%`;
        nodes.battleShieldValue.textContent = `${Math.round(battleState.shield)}%`;
        nodes.battleHeatValue.textContent = `${Math.round(battleState.heat)}%`;
        nodes.battleProgressValue.textContent = `${Math.round(battleState.progress)}%`;
        nodes.battleIntegrityBar.style.width = `${clamp(battleState.integrity, 0, 100)}%`;
        nodes.battleShieldBar.style.width = `${clamp(battleState.shield, 0, 100)}%`;
        nodes.battleHeatBar.style.width = `${clamp(battleState.heat, 0, 100)}%`;
        nodes.battleProgressBar.style.width = `${clamp(battleState.progress, 0, 100)}%`;
        nodes.battleTip.textContent = tip;
        nodes.battleTrain.style.setProperty('--if-train-shift', `${trainShift}px`);
        nodes.battleTrain.classList.toggle('is-boosting', battleState.overdriveTurns > 0);
        nodes.battleTrain.classList.toggle('is-barrier', battleState.barrierTurns > 0);
        nodes.battleThreatLane.innerHTML = Array.from({ length: Math.max(3, Math.min(stage.type === 'boss' ? 12 : 10, battleState.enemyCount)) })
            .map((_, index) => `<div class="if-threat-dot ${stage.type === 'boss' && index < 3 ? 'is-boss' : ''}">${stage.type === 'boss' ? 'B' : 'EN'}-${index + 1}</div>`)
            .join('');
        nodes.battleEventArea.innerHTML = renderBattleInfoCard(stage);
        renderBattleButtons();
    }

    function applyBattleSkill(action) {
        if (!battleState || battleState.settled || battleState.activeEvent) return;
        if (action !== 'ultimate' && battleState.skillCooldowns[action] > 0) return;
        if (action === 'ultimate' && battleState.ultimateCharge < 100) return;

        state.stats.skills += 1;

        if (action === 'overdrive') {
            battleState.heat = clamp(battleState.heat + 14, 0, 100);
            battleState.progress = clamp(battleState.progress + 4, 0, 100);
            battleState.overdriveTurns = Math.max(battleState.overdriveTurns, 2);
            battleState.skillCooldowns.overdrive = SKILL_COOLDOWNS.overdrive;
            pushBattleLog(state.lang === 'zh' ? '主炮超载完成，推进与火力短时间同步拉高。' : 'Main gun overdrive spikes both pressure and pace.');
        }
        if (action === 'barrier') {
            battleState.shield = clamp(battleState.shield + 26 + Math.round((state.moduleLevels.armorCar - 1) * 4), 0, 100);
            battleState.barrierTurns = Math.max(battleState.barrierTurns, 2);
            battleState.skillCooldowns.barrier = SKILL_COOLDOWNS.barrier;
            pushBattleLog(state.lang === 'zh' ? '护盾列车顶上前线，短时间压低承伤。' : 'Barrier car moves up and cuts incoming pressure.');
        }
        if (action === 'repair') {
            battleState.integrity = clamp(battleState.integrity + Math.round((16 + state.moduleLevels.supportCar * 2) * battleState.profile.repairMul), 0, 100);
            battleState.heat = clamp(battleState.heat - 20, 0, 100);
            battleState.skillCooldowns.repair = SKILL_COOLDOWNS.repair;
            pushBattleLog(state.lang === 'zh' ? '支援车完成抢修，车体与热量都回到了更安全的区间。' : 'Support car repairs the train and cools the system down.');
        }
        if (action === 'ultimate') {
            battleState.progress = clamp(battleState.progress + 16 + state.moduleLevels.ultimate * 2, 0, 100);
            battleState.heat = clamp(battleState.heat + 10, 0, 100);
            battleState.enemyCount = Math.max(2, battleState.enemyCount - 4);
            battleState.ultimateCharge = 0;
            pushBattleLog(state.lang === 'zh' ? '轨炮扫清正前方整段轨道，敌群节奏被强行打断。' : 'Rail Burst clears the lane ahead and disrupts enemy rhythm.');
        }
        saveState();
        renderBattle();
    }

    function applyEventOption(optionId) {
        if (!battleState || !battleState.activeEvent) return;
        const option = battleState.activeEvent.options.find((item) => item.id === optionId);
        if (!option) return;
        battleState.integrity = clamp(battleState.integrity + (option.integrity || 0), 0, 100);
        battleState.shield = clamp(battleState.shield + (option.shield || 0), 0, 100);
        battleState.progress = clamp(battleState.progress + Math.round((option.progress || 0) * battleState.profile.eventMul), 0, 100);
        battleState.heat = clamp(battleState.heat + (option.heat || 0), 0, 100);
        battleState.overdriveTurns = Math.max(battleState.overdriveTurns, option.overdrive || 0);
        battleState.barrierTurns = Math.max(battleState.barrierTurns, option.barrier || 0);
        battleState.chargeBoost = Math.max(battleState.chargeBoost, option.chargeBoost || 0);
        battleState.salvageBoost = Math.max(battleState.salvageBoost, option.salvageBoost || 0);
        Object.entries(option.bonusReward || {}).forEach(([key, amount]) => {
            battleState.rewardBonus[key] = (battleState.rewardBonus[key] || 0) + amount;
        });
        pushBattleLog(localize(option.result));
        pushBattleLog(t('battleEventResolved'));
        battleState.activeEvent = null;
        renderBattle();
    }

    function settleBattle(win) {
        if (!battleState || battleState.settled) return;
        clearBattleLoop();
        const stage = getStage(battleState.stageId);
        const payout = buildBattleReward(stage, win);

        if (!battleState.rewardsApplied) {
            state.stats.runs += 1;
            if (win) {
                state.stats.wins += 1;
                if (!state.stageClears[stage.id]) {
                    state.stageClears[stage.id] = true;
                    state.stats.stageClears += 1;
                }
                const stageIndex = CONFIG.stages.findIndex((item) => item.id === stage.id);
                const nextStage = CONFIG.stages[stageIndex + 1];
                if (nextStage && isStageUnlocked(nextStage.id)) {
                    state.selectedStageId = nextStage.id;
                }
            }
            addRewards(payout);
            battleState.rewardsApplied = true;
        }

        battleState.settled = true;
        battleState.result = { win, payout };
        saveState();
        renderBattle();
        showToast(win ? t('battleWin') : t('battleFail'));
    }

    function advanceBattle(isManual = false) {
        if (!battleState || battleState.activeEvent || battleState.settled) return;
        const stage = getStage(battleState.stageId);
        battleState.wave += 1;

        Object.keys(battleState.skillCooldowns).forEach((skillId) => {
            battleState.skillCooldowns[skillId] = Math.max(0, battleState.skillCooldowns[skillId] - 1);
        });

        const overdriveMul = battleState.overdriveTurns > 0 ? 1.24 + (hasActiveCrew('knox') ? 0.06 : 0) : 1;
        const heatPenalty = battleState.heat >= 84 ? 0.82 : 1;
        const baseThreat = stage.type === 'boss' ? 20 : (stage.type === 'elite' ? 15 : 11);
        const incoming = Math.max(
            4,
            Math.round((baseThreat + battleState.wave * 2.2) * battleState.profile.difficultyMul / battleState.profile.defenseMul * (battleState.barrierTurns > 0 ? 0.58 : 1))
        );
        const progressGain = Math.round(
            (10 + state.moduleLevels.mainGun * 2 + state.moduleLevels.locomotive * 1.4) *
            battleState.profile.progressMul *
            overdriveMul *
            heatPenalty
        );

        battleState.shield -= incoming;
        if (battleState.shield < 0) {
            battleState.integrity = Math.max(0, battleState.integrity + battleState.shield);
            battleState.shield = 0;
        }

        battleState.progress = clamp(battleState.progress + progressGain + (isManual ? 3 : 0), 0, 100);
        battleState.heat = clamp(
            battleState.heat + 7 + (battleState.overdriveTurns > 0 ? 7 : 0) - (state.moduleLevels.supportCar - 1) * 2 - (state.researchLevels.repairGrid || 0),
            0,
            100
        );
        battleState.ultimateCharge = clamp(
            battleState.ultimateCharge + Math.round(10 * (1 + (state.researchLevels.relayDecoder || 0) * 0.03 + battleState.chargeBoost + (hasActiveCrew('mira') ? 0.04 : 0))),
            0,
            100
        );
        battleState.enemyCount = Math.min(stage.type === 'boss' ? 12 : 10, (stage.type === 'boss' ? 5 : 3) + battleState.wave + Math.round(battleState.profile.difficultyMul * 1.5));

        if (battleState.heat >= 92) {
            battleState.integrity = Math.max(0, battleState.integrity - 4);
            pushBattleLog(t('battleOverheat'));
        } else {
            pushBattleLog(state.lang === 'zh'
                ? `推进到第 ${battleState.wave} 段轨道，敌潮被持续压回。`
                : `Advanced into segment ${battleState.wave}; the train keeps forcing the lane open.`);
        }

        if (stage.type === 'boss' && battleState.progress >= 68 && battleState.wave >= 4) {
            pushBattleLog(t('battleBossIncoming'));
        }

        battleState.overdriveTurns = Math.max(0, battleState.overdriveTurns - 1);
        battleState.barrierTurns = Math.max(0, battleState.barrierTurns - 1);

        if ((battleState.wave === 2 || battleState.wave === 4) && battleState.eventQueue.length) {
            battleState.activeEvent = battleState.eventQueue.shift();
            renderBattle();
            return;
        }

        if (battleState.integrity <= 0) {
            settleBattle(false);
            return;
        }
        if (battleState.progress >= 100) {
            settleBattle(true);
            return;
        }
        renderBattle();
    }

    function openOffer(offerId) {
        const offer = getOffer(offerId);
        if (!offer) return;
        const offerChanged = activeOfferId !== offerId;
        activeOfferId = offerId;
        if (offerChanged) paymentDraftTxid = '';
        ensureOfferPaymentNotice(offer, offerChanged);
        const order = getPendingOrderForOffer(offer.id);
        const owned = isOfferOwned(offer.id);
        const readyClaim = order && String(order.status || '').toLowerCase() === 'paid' && order.txid;
        const mainAction = owned ? 'owned' : readyClaim ? 'claim' : order ? 'check' : 'create';
        const mainLabel = owned
            ? text('已生效', 'Active')
            : readyClaim
                ? text('恢复奖励', 'Restore Rewards')
                : order
                    ? text('检查状态', 'Check Status')
                    : text('创建订单', 'Create Order');
        const orderAmount = order?.exactAmount ? `${formatPaymentAmount(order.exactAmount)} USDT` : offer.exactPrice;
        const expiresText = order
            ? (String(order.status || '').toLowerCase() === 'pending'
                ? formatRemaining(getPendingOrderExpiresInMs(order))
                : String(order.status || '').toLowerCase() === 'paid'
                    ? text('已支付', 'Paid')
                    : text('已完成', 'Completed'))
            : '--';
        const activePerks = buildOwnedPerkChips();
        nodes.drawerEyebrow.textContent = t('bundlePreview');
        nodes.drawerTitle.textContent = localize(offer.title);
        nodes.offerDrawerBody.innerHTML = `
            <div class="if-payment-grid">
                <div class="if-mini-card">
                    <div class="if-mini-label">${t('exactAmount')}</div>
                    <div class="if-offer-amount">${orderAmount}</div>
                    <div class="if-muted">${order ? text('订单创建后会锁定唯一精确金额。', 'A created order locks this exact amount.') : t('exactAmountHint')}</div>
                </div>
                <div class="if-mini-card">
                    <div class="if-mini-label">${text('支付状态', 'Status')}</div>
                    <div class="if-offer-amount if-offer-amount--small">${owned ? text('已生效', 'Active') : readyClaim ? text('待恢复', 'Ready') : order ? text('待支付', 'Pending') : text('未建单', 'No Order')}</div>
                    <div class="if-muted">${paymentNoticeOfferId === offer.id ? escapeHtml(paymentNotice) : ''}</div>
                </div>
            </div>
            <div class="if-mini-card">
                <div class="if-mini-label">${t('bonusReward')}</div>
                <div class="if-reward-row">${buildRewardItems(offer.reward)}</div>
            </div>
            <div class="if-mini-card">
                <div class="if-mini-label">${t('permanent')}</div>
                <div class="if-cost-row"><span class="if-cost-item">${localize(offer.permanent)}</span></div>
                <div class="if-chip-row">
                    ${activePerks.length ? activePerks.map((item) => `<span class="if-chip">${escapeHtml(item)}</span>`).join('') : `<span class="if-chip">${text('购买后这里会显示长期加成', 'Long-term perks appear here after purchase')}</span>`}
                </div>
            </div>
            <div class="if-mini-card">
                <div class="if-mini-label">${text('订单信息', 'Order Details')}</div>
                <div class="if-payment-info-grid">
                    <div class="if-payment-info"><span>${text('订单号', 'Order')}</span><strong>${escapeHtml(order?.orderId || '--')}</strong></div>
                    <div class="if-payment-info"><span>${text('网络', 'Network')}</span><strong>${escapeHtml(order?.network || 'TRON (TRC20)')}</strong></div>
                    <div class="if-payment-info"><span>${text('剩余时间', 'Expires')}</span><strong>${escapeHtml(expiresText)}</strong></div>
                    <div class="if-payment-info"><span>${text('当前状态', 'Live Status')}</span><strong>${escapeHtml(order?.status || '--')}</strong></div>
                </div>
                <div class="if-payment-address-block">
                    <span class="if-mini-label">${text('收款地址', 'Pay Address')}</span>
                    <div class="if-payment-address">${escapeHtml(order?.payAddress || state.payment?.lastPayAddress || '--')}</div>
                </div>
                <div class="if-btn-row">
                    <button class="ghost-btn" type="button" data-payment-action="copy-amount" data-offer-id="${offer.id}" ${paymentBusyAction ? 'disabled' : ''}>${text('复制金额', 'Copy Amount')}</button>
                    <button class="ghost-btn" type="button" data-payment-action="copy-address" data-offer-id="${offer.id}" ${paymentBusyAction ? 'disabled' : ''}>${text('复制地址', 'Copy Address')}</button>
                    <button class="ghost-btn" type="button" data-payment-action="check-order" data-offer-id="${offer.id}" ${order && !paymentBusyAction ? '' : 'disabled'}>${text('检查状态', 'Check Status')}</button>
                </div>
            </div>
            <div class="if-mini-card">
                <div class="if-mini-label">${text('链上 TXID', 'On-chain TXID')}</div>
                <input class="if-payment-input" data-payment-txid-input="true" type="text" autocomplete="off" spellcheck="false" value="${escapeAttr(paymentDraftTxid)}" placeholder="${escapeAttr(text('粘贴链上 TXID', 'Paste on-chain TXID'))}" ${paymentBusyAction ? 'disabled' : ''}>
                <div class="if-payment-status is-${paymentNoticeTone}">${escapeHtml(paymentNoticeOfferId === offer.id ? paymentNotice : '')}</div>
                <div class="if-btn-row">
                    <button class="primary-btn" type="button" data-payment-action="verify-txid" data-offer-id="${offer.id}" ${owned || paymentBusyAction ? 'disabled' : ''}>${text('校验 TXID', 'Verify TXID')}</button>
                    <button class="ghost-btn" type="button" data-payment-action="claim-order" data-offer-id="${offer.id}" ${readyClaim && !paymentBusyAction ? '' : 'disabled'}>${text('恢复奖励', 'Restore Rewards')}</button>
                </div>
            </div>
        `;
        nodes.offerLaterBtn.textContent = text('关闭', 'Close');
        nodes.offerLaterBtn.disabled = Boolean(paymentBusyAction);
        nodes.offerMockPayBtn.textContent = mainLabel;
        nodes.offerMockPayBtn.disabled = mainAction === 'owned' || Boolean(paymentBusyAction);
        nodes.offerMockPayBtn.dataset.offerAction = mainAction;
        nodes.offerMockPayBtn.dataset.offerId = offer.id;
        nodes.offerDrawer.classList.remove('is-hidden');
        document.body.classList.add('if-modal-open');
    }

    function closeOffer() {
        activeOfferId = '';
        nodes.offerDrawer.classList.add('is-hidden');
        document.body.classList.remove('if-modal-open');
    }

    function handlePanelAction(actionNode) {
        const action = actionNode.getAttribute('data-action');
        if (!action) return;
        if (action === 'select-chapter') {
            const chapterId = Number(actionNode.getAttribute('data-chapter') || 1);
            if (!isChapterUnlocked(chapterId)) {
                showToast(t('chapterLockedTip'));
                return;
            }
            const entryStage = getChapterEntryStage(chapterId);
            if (!entryStage) return;
            state.selectedStageId = entryStage.id;
            saveState();
            renderAll();
            showToast(`${t('chapter')} ${chapterId}`);
            return;
        }
        if (action === 'select-stage') {
            const stageId = actionNode.getAttribute('data-stage-id');
            if (!isStageUnlocked(stageId)) {
                showToast(t('lockedStageTip'));
                return;
            }
            state.selectedStageId = stageId;
            saveState();
            renderAll();
            showToast(`${t('selected')} ${stageId}`);
            return;
        }
        if (action === 'open-battle') {
            openBattle();
            return;
        }
        if (action === 'upgrade-module') {
            const moduleId = actionNode.getAttribute('data-module-id');
            const definition = getModule(moduleId);
            const cost = getModuleUpgradeCost(moduleId);
            if (!definition || !cost || !spend(cost)) return;
            state.moduleLevels[moduleId] += 1;
            state.stats.upgrades += 1;
            saveState();
            renderAll();
            showToast(`${localize(definition.name)} ${t('upgraded')}`);
            return;
        }
        if (action === 'upgrade-crew') {
            const crewId = actionNode.getAttribute('data-crew-id');
            const definition = getCrew(crewId);
            const cost = getCrewUpgradeCost(crewId);
            if (!definition || !cost || !spend(cost)) return;
            state.crewLevels[crewId] += 1;
            state.stats.upgrades += 1;
            saveState();
            renderAll();
            showToast(`${localize(definition.name)} ${t('upgraded')}`);
            return;
        }
        if (action === 'toggle-crew') {
            const crewId = actionNode.getAttribute('data-crew-id');
            const active = state.activeCrew.includes(crewId);
            if (active) {
                if (state.activeCrew.length <= 1) {
                    showToast(state.lang === 'zh' ? '至少保留 1 名上阵乘员。' : 'Keep at least 1 deployed crew.');
                    return;
                }
                state.activeCrew = state.activeCrew.filter((id) => id !== crewId);
            } else {
                if (state.activeCrew.length >= 3) state.activeCrew.shift();
                state.activeCrew.push(crewId);
            }
            saveState();
            renderAll();
            showToast(localize(getCrew(crewId).name));
            return;
        }
        if (action === 'upgrade-research') {
            const researchId = actionNode.getAttribute('data-research-id');
            const definition = getResearch(researchId);
            const cost = getResearchUpgradeCost(researchId);
            if (!definition || !cost || !spend(cost)) return;
            state.researchLevels[researchId] += 1;
            state.stats.researchUpgrades += 1;
            state.stats.upgrades += 1;
            saveState();
            renderAll();
            showToast(`${localize(definition.name)} ${t('researchUpgraded')}`);
            return;
        }
        if (action === 'claim-mission') {
            const missionId = actionNode.getAttribute('data-mission-id');
            const mission = CONFIG.missions.find((item) => item.id === missionId);
            if (!mission || state.claimedMissions.includes(missionId) || getMissionProgress(mission) < mission.target) return;
            state.claimedMissions.push(missionId);
            addRewards(mission.reward);
            saveState();
            renderAll();
            showToast(t('missionClaimed'));
            return;
        }
        if (action === 'claim-season') {
            const seasonId = actionNode.getAttribute('data-season-id');
            const node = CONFIG.season.find((item) => item.id === seasonId);
            if (!node || state.claimedSeason.includes(seasonId) || state.resources.seasonXp < node.xp) return;
            state.claimedSeason.push(seasonId);
            addRewards(node.reward);
            saveState();
            renderAll();
            showToast(t('seasonClaimed'));
            return;
        }
        if (action === 'buy-soft-offer') {
            const offerId = actionNode.getAttribute('data-offer-id');
            const offer = CONFIG.softShop.find((item) => item.id === offerId);
            if (!offer) return;
            if (offer.price === 0) {
                const freeState = getFreeSupplyState();
                if (freeState.remainingClaims <= 0) {
                    showToast(formatRemaining(freeState.remainingMs));
                    return;
                }
                if (!state.dailyFreeClaimAt) state.dailyFreeClaimAt = Date.now();
                state.dailyFreeClaimsUsed = Number(state.dailyFreeClaimsUsed || 0) + 1;
                addRewards(offer.reward);
                saveState();
                renderAll();
                showToast(t('supplyClaimed'));
                return;
            }
            if (!spend(offer.price)) return;
            addRewards(offer.reward);
            saveState();
            renderAll();
            showToast(localize(offer.title));
            return;
        }
        if (action === 'open-offer') {
            openOffer(actionNode.getAttribute('data-offer-id'));
        }
    }

    function bindEvents() {
        document.querySelectorAll('[data-lang-switch]').forEach((button) => {
            button.addEventListener('click', () => setLanguage(button.getAttribute('data-lang-switch')));
        });

        nodes.soundToggle.addEventListener('click', () => {
            state.soundEnabled = !state.soundEnabled;
            saveState();
            renderHero();
            showToast(state.soundEnabled ? t('sfxOn') : t('sfxOff'));
        });

        nodes.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            state.activeTab = button.getAttribute('data-tab') || 'run';
            saveState();
            renderAll();
        });

        nodes.panelContent.addEventListener('click', (event) => {
            const actionNode = event.target.closest('[data-action]');
            if (actionNode) handlePanelAction(actionNode);
        });

        document.addEventListener('click', (event) => {
            const battleActionNode = event.target.closest('[data-battle-action]');
            if (battleActionNode) {
                const action = battleActionNode.getAttribute('data-battle-action');
                if (action === 'advance') advanceBattle(true);
                else if (action === 'event-option') applyEventOption(battleActionNode.getAttribute('data-event-option'));
                else if (action === 'result-close') {
                    closeBattle();
                    renderAll();
                } else if (action === 'result-retry') {
                    const stageId = battleState?.stageId || state.selectedStageId;
                    openBattle(stageId);
                }
                else applyBattleSkill(action);
            }

            const paymentActionNode = event.target.closest('[data-payment-action]');
            if (paymentActionNode) {
                const action = String(paymentActionNode.getAttribute('data-payment-action') || '');
                const offerId = String(paymentActionNode.getAttribute('data-offer-id') || activeOfferId || '');
                const tasks = {
                    'copy-amount': () => copyOfferAmount(offerId),
                    'copy-address': () => copyOfferAddress(offerId),
                    'check-order': () => checkOfferOrder(offerId),
                    'verify-txid': () => verifyOfferTxid(offerId),
                    'claim-order': () => claimOfferReward(offerId)
                };
                if (tasks[action]) {
                    Promise.resolve(tasks[action]()).catch((error) => {
                        setPaymentNoticeForOffer(offerId, error.message || text('支付操作失败。', 'Payment action failed.'), 'warning');
                        openOffer(offerId);
                    });
                }
            }
        });

        nodes.battleCloseBtn.addEventListener('click', closeBattle);
        nodes.offerCloseBtn.addEventListener('click', closeOffer);
        nodes.offerLaterBtn.addEventListener('click', closeOffer);
        nodes.offerMockPayBtn.addEventListener('click', () => {
            const offerId = String(nodes.offerMockPayBtn.getAttribute('data-offer-id') || activeOfferId || '');
            const action = String(nodes.offerMockPayBtn.getAttribute('data-offer-action') || '');
            if (!offerId || !action || action === 'owned') return;
            const tasks = {
                create: () => createOfferOrder(offerId),
                check: () => checkOfferOrder(offerId),
                claim: () => claimOfferReward(offerId)
            };
            if (tasks[action]) {
                Promise.resolve(tasks[action]()).catch((error) => {
                    setPaymentNoticeForOffer(offerId, error.message || text('支付操作失败。', 'Payment action failed.'), 'warning');
                    openOffer(offerId);
                });
            }
        });

        nodes.battleOverlay.addEventListener('click', (event) => {
            if (event.target === nodes.battleOverlay) closeBattle();
        });

        nodes.offerDrawer.addEventListener('input', (event) => {
            const input = event.target.closest('[data-payment-txid-input]');
            if (!input) return;
            paymentDraftTxid = String(input.value || '');
        });

        nodes.offerDrawer.addEventListener('click', (event) => {
            if (event.target === nodes.offerDrawer) closeOffer();
        });
    }

    function renderAll() {
        renderHero();
        renderSummary();
        renderTabBar();
        renderPanel();
        if (battleState) renderBattle();
        if (activeOfferId && !nodes.offerDrawer.classList.contains('is-hidden')) openOffer(activeOfferId);
    }

    const autoOpenBattle = applyDebugQueryState();

    bindEvents();
    renderAll();

    if (autoOpenBattle) {
        openBattle(state.selectedStageId);
    }
    if (debugOfferId) {
        openOffer(debugOfferId);
    }
}());
