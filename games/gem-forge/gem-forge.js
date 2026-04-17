(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_gem_forge_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const SLOT_ORDER = ['main', 'echo', 'resonance'];
    const SMELT_HEAT_COST = 4;
    const POWER_PER_GEM_SCORE = 0.3;
    const POWER_PER_AWAKEN_SCORE = 0.95;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_ORDER_STORAGE_KEY = 'genesis_gem_forge_payment_order_v1';
    const PAYMENT_TXID_REGEX = /^[A-Fa-f0-9]{64}$/;
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_ORDER_WINDOW_MS = 15 * 60 * 1000;
    const FORGE_TIMING_TARGET = 0.5;
    const FORGE_TIMING_PERFECT_WINDOW = 0.045;
    const FORGE_TIMING_GREAT_WINDOW = 0.11;
    const FORGE_TIMING_GOOD_WINDOW = 0.2;
    const FORGE_TIMING_ROUGH_WINDOW = 0.31;
    const FORGE_TIMING_EDGE_MIN = 0.06;
    const FORGE_TIMING_EDGE_MAX = 0.94;
    const FORGE_TIMING_SPEED_MIN = 0.00048;
    const FORGE_TIMING_SPEED_MAX = 0.00072;
    const FORGE_RELIC_MAX = 24;
    const FORGE_RELIC_PITY_NEED = 7;
    const FORGE_RELIC_EPIC_PITY_NEED = 18;
    const FORGE_RELIC_FORMS = {
        rare: { zh: '炉印', en: 'Seal' },
        epic: { zh: '冠冕', en: 'Crown' },
        legend: { zh: '星核', en: 'Star Core' },
        mythic: { zh: '圣座', en: 'Throne' }
    };

    const config = window.GENESIS_GEM_FORGE_CONFIG;
    if (!config) return;

    const tabMap = Object.fromEntries(config.tabs.map((tab) => [tab.id, tab]));
    const familyMap = Object.fromEntries(config.gemFamilies.map((family) => [family.id, family]));
    const sigilMap = Object.fromEntries(config.sigils.map((sigil) => [sigil.id, sigil]));
    const workshopMap = Object.fromEntries(config.workshop.map((item) => [item.id, item]));

    const state = {
        lang: readLang(),
        tab: 'forge',
        save: loadSave(),
        toastTimer: 0,
        relicTimer: 0,
        uiMotionTimer: 0,
        pendingUiMotion: '',
        pendingUiMotionDuration: 420,
        forgeTiming: createForgeTimingState(),
        activeRelicCelebration: null
    };

    const ui = {};
    let currentPaymentOrder = null;
    let selectedPaymentOfferId = config.paymentOffers[0]?.id || 'starter';
    let paymentCountdownTimer = 0;
    let paymentVerificationState = 'idle';
    let paymentVerificationError = '';
    let paymentVerificationNotice = '';
    let paymentOrderNonce = 0;
    let paymentOrderRequestPromise = null;

    document.addEventListener('DOMContentLoaded', init);

    function ensureRelicCelebrationUi() {
        if (document.getElementById('gfRelicModal')) return;
        const shell = document.querySelector('.gf-shell') || document.body;
        const host = document.createElement('div');
        host.innerHTML = `
            <div class="gf-relic-modal is-hidden" id="gfRelicModal">
                <div class="gf-relic-card" id="gfRelicCard">
                    <div class="gf-relic-glow"></div>
                    <div class="gf-relic-ring"></div>
                    <div class="eyebrow" id="gfRelicEyebrow">LEGEND RELIC</div>
                    <h2 id="gfRelicTitle">Relic Drop</h2>
                    <p id="gfRelicCopy"></p>
                    <div class="gf-kpi-grid gf-relic-kpis" id="gfRelicStats"></div>
                    <div class="gf-chip-row" id="gfRelicRewards"></div>
                    <div class="gf-action-row" style="margin-top:16px;">
                        <button class="primary-btn wide-btn" type="button" data-action="dismissRelicCelebration" id="gfRelicAction">继续</button>
                    </div>
                </div>
            </div>
        `.trim();
        shell.appendChild(host.firstElementChild);
    }

    function init() {
        cacheUi();
        bindEvents();
        restoreStoredPaymentOrder();
        syncHeat();
        renderAll();
        syncCurrentPaymentOrderStatus({ recoverRewards: true, silent: true }).catch(() => {});
        flushPendingPaymentClaims().catch(() => {});
        paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
    }

    function cacheUi() {
        ensureRelicCelebrationUi();
        ui.heroEyebrow = document.getElementById('heroEyebrow');
        ui.heroTitle = document.getElementById('heroTitle');
        ui.heroSubtitle = document.getElementById('heroSubtitle');
        ui.resourceStrip = document.getElementById('resourceStrip');
        ui.heroSummary = document.getElementById('heroSummary');
        ui.panelContent = document.getElementById('panelContent');
        ui.tabBar = document.getElementById('tabBar');
        ui.toast = document.getElementById('toast');
        ui.langButtons = Array.from(document.querySelectorAll('[data-lang-switch]'));
        ui.paymentModal = document.getElementById('gfPaymentModal');
        ui.paymentOfferGrid = document.getElementById('gfPaymentOfferGrid');
        ui.paymentCloseBtn = document.getElementById('gfPaymentCloseBtn');
        ui.paymentTitle = document.getElementById('gfPaymentTitle');
        ui.paymentDesc = document.getElementById('gfPaymentDesc');
        ui.paymentAmount = document.getElementById('gfPaymentAmount');
        ui.paymentMeta = document.getElementById('gfPaymentMeta');
        ui.paymentOrderLabel = document.getElementById('gfPaymentOrderLabel');
        ui.paymentOrderId = document.getElementById('gfPaymentOrderId');
        ui.paymentExactLabel = document.getElementById('gfPaymentExactLabel');
        ui.paymentExactAmount = document.getElementById('gfPaymentExactAmount');
        ui.paymentExpiryLabel = document.getElementById('gfPaymentExpiryLabel');
        ui.paymentExpiry = document.getElementById('gfPaymentExpiry');
        ui.paymentAddressLabel = document.getElementById('gfPaymentAddressLabel');
        ui.paymentWallet = document.getElementById('gfPaymentWallet');
        ui.paymentCopyAddressBtn = document.getElementById('gfPaymentCopyAddressBtn');
        ui.paymentCopyAmountBtn = document.getElementById('gfPaymentCopyAmountBtn');
        ui.paymentTxidLabel = document.getElementById('gfPaymentTxidLabel');
        ui.paymentTxidInput = document.getElementById('gfPaymentTxidInput');
        ui.paymentTxidHint = document.getElementById('gfPaymentTxidHint');
        ui.paymentStatus = document.getElementById('gfPaymentStatus');
        ui.paymentVerifyBtn = document.getElementById('gfPaymentVerifyBtn');
        ui.relicModal = document.getElementById('gfRelicModal');
        ui.relicCard = document.getElementById('gfRelicCard');
        ui.relicEyebrow = document.getElementById('gfRelicEyebrow');
        ui.relicTitle = document.getElementById('gfRelicTitle');
        ui.relicCopy = document.getElementById('gfRelicCopy');
        ui.relicStats = document.getElementById('gfRelicStats');
        ui.relicRewards = document.getElementById('gfRelicRewards');
        ui.relicAction = document.getElementById('gfRelicAction');
    }

    function bindEvents() {
        ui.langButtons.forEach((button) => {
            button.addEventListener('click', () => {
                state.lang = button.dataset.langSwitch === 'en' ? 'en' : 'zh';
                try { localStorage.setItem(HUB_LANG_KEY, state.lang); } catch (error) {}
                queueUiMotion('tab', 280);
                renderAll();
            });
        });

        ui.tabBar.addEventListener('click', (event) => {
            const target = event.target.closest('[data-tab]');
            if (!target) return;
            state.tab = tabMap[target.dataset.tab] ? target.dataset.tab : 'forge';
            queueUiMotion('tab', 280);
            renderAll();
        });

        ui.panelContent.addEventListener('click', onPanelAction);
        ui.paymentCloseBtn?.addEventListener('click', closePaymentModal);
        ui.paymentModal?.addEventListener('click', (event) => {
            if (event.target === ui.paymentModal) closePaymentModal();
        });
        ui.relicModal?.addEventListener('click', (event) => {
            if (event.target === ui.relicModal) dismissRelicCelebration();
        });
        ui.relicAction?.addEventListener('click', dismissRelicCelebration);
        ui.paymentOfferGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-select-payment-offer]');
            if (!button) return;
            selectPaymentOffer(button.dataset.selectPaymentOffer, { refreshOrder: true });
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
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelForgeTimingSession();
            } else if (state.tab === 'forge') {
                renderAll();
            }
        });
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && ui.relicModal && !ui.relicModal.classList.contains('is-hidden')) {
                dismissRelicCelebration();
            } else if (event.key === 'Escape' && ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
                closePaymentModal();
            }
        });
        window.addEventListener('beforeunload', saveProgress);
    }

    function onPanelAction(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        const value = target.dataset.value || '';
        if (state.forgeTiming.active && action !== 'stopForgeTiming') {
            cancelForgeTimingSession();
        }

        switch (action) {
            case 'smeltOne': smeltOne(); break;
            case 'smeltBatch': smeltBatch(); break;
            case 'startForgeTiming': startForgeTiming(); break;
            case 'stopForgeTiming': stopForgeTiming(); break;
            case 'fuseGem': fuseGem(value); break;
            case 'awakenGem': awakenGem(value); break;
            case 'salvageGem': salvageGem(value); break;
            case 'smartRecycle': smartRecycleGems(); break;
            case 'selectContract': selectContract(Number(value)); break;
            case 'runContract': runContract(Number(value)); break;
            case 'equipSigil': equipSigil(value); break;
            case 'unlockSigil': unlockSigil(value); break;
            case 'upgradeSigil': upgradeSigil(value); break;
            case 'upgradeWorkshop': upgradeWorkshop(value); break;
            case 'claimMission': claimMission(value); break;
            case 'claimAllMissions': claimAllMissions(); break;
            case 'claimSeason': claimSeasonNode(value); break;
            case 'claimSponsorSeason': claimSponsorSeasonNode(value); break;
            case 'claimAllSeason': claimAllSeason(); break;
            case 'claimDailySupply': claimDailySupply(); break;
            case 'buyShopItem': buyShopItem(value); break;
            case 'buyOffer': openPaymentModal(value); break;
            case 'openPayment': openPaymentModal(value); break;
            case 'claimMilestone': claimPaymentMilestone(value); break;
            case 'claimAllMilestones': claimAllPaymentMilestones(); break;
            case 'claimRelicChase': claimRelicChase(value); break;
            case 'dismissRelicCelebration': dismissRelicCelebration(); break;
            case 'openTab':
                state.tab = tabMap[value] ? value : state.tab;
                queueUiMotion('tab', 280);
                renderAll();
                break;
            default:
                break;
        }
    }

    function queueUiMotion(kind = 'success', duration = 420) {
        clearTimeout(state.uiMotionTimer);
        state.pendingUiMotion = kind;
        state.pendingUiMotionDuration = duration;
    }

    function triggerUiMotion(kind = 'success', duration = 420) {
        state.pendingUiMotion = kind;
        state.pendingUiMotionDuration = duration;
        applyPendingUiMotion();
    }

    function applyPendingUiMotion() {
        const kind = state.pendingUiMotion;
        if (!kind) return;
        const className = `is-feedback-${kind}`;
        const targets = [ui.panelContent, ui.heroSummary, ui.resourceStrip, ui.tabBar].filter(Boolean);

        targets.forEach((target) => {
            Array.from(target.classList)
                .filter((name) => name.startsWith('is-feedback-'))
                .forEach((name) => target.classList.remove(name));
            void target.offsetWidth;
            target.classList.add(className);
        });

        state.pendingUiMotion = '';
        clearTimeout(state.uiMotionTimer);
        state.uiMotionTimer = window.setTimeout(() => {
            targets.forEach((target) => target.classList.remove(className));
        }, state.pendingUiMotionDuration || 420);
    }

    function cancelForgeTimingSession() {
        if (state.forgeTiming.frameId) {
            window.cancelAnimationFrame(state.forgeTiming.frameId);
        }
        state.forgeTiming.active = false;
        state.forgeTiming.frameId = 0;
        state.forgeTiming.lastTickAt = 0;
        syncForgeTimingUi();
    }

    function startForgeTiming() {
        syncHeat();
        if (state.save.heat < SMELT_HEAT_COST) {
            return showToast(text('热量不足，先等恢复或补热量上限。', 'Not enough heat. Wait for regen or raise heat cap first.'), 'warning');
        }
        cancelForgeTimingSession();
        state.forgeTiming.active = true;
        state.forgeTiming.pointer = 0.18 + Math.random() * 0.22;
        state.forgeTiming.direction = Math.random() > 0.5 ? 1 : -1;
        state.forgeTiming.speed = FORGE_TIMING_SPEED_MIN + Math.random() * (FORGE_TIMING_SPEED_MAX - FORGE_TIMING_SPEED_MIN);
        state.forgeTiming.lastTickAt = performance.now();
        renderAll();
        state.forgeTiming.frameId = window.requestAnimationFrame(stepForgeTiming);
    }

    function stopForgeTiming() {
        if (!state.forgeTiming.active) return;
        const outcome = evaluateForgeTiming(state.forgeTiming.pointer);
        cancelForgeTimingSession();
        state.forgeTiming.lastOutcome = outcome.id;
        resolveForgeTimingSmelt(outcome);
    }

    function stepForgeTiming(timestamp) {
        if (!state.forgeTiming.active) return;
        const elapsed = Math.max(0, Number(timestamp) - Number(state.forgeTiming.lastTickAt || timestamp));
        state.forgeTiming.lastTickAt = Number(timestamp) || performance.now();
        state.forgeTiming.pointer += state.forgeTiming.direction * elapsed * state.forgeTiming.speed;
        if (state.forgeTiming.pointer >= FORGE_TIMING_EDGE_MAX) {
            state.forgeTiming.pointer = FORGE_TIMING_EDGE_MAX;
            state.forgeTiming.direction = -1;
        } else if (state.forgeTiming.pointer <= FORGE_TIMING_EDGE_MIN) {
            state.forgeTiming.pointer = FORGE_TIMING_EDGE_MIN;
            state.forgeTiming.direction = 1;
        }
        syncForgeTimingUi();
        state.forgeTiming.frameId = window.requestAnimationFrame(stepForgeTiming);
    }

    function syncForgeTimingUi() {
        const bar = document.getElementById('gfForgeTimingBar');
        const needle = document.getElementById('gfForgeTimingNeedle');
        const status = document.getElementById('gfForgeTimingStatus');
        const hint = document.getElementById('gfForgeTimingHint');
        if (bar) {
            bar.classList.toggle('is-active', !!state.forgeTiming.active);
            bar.dataset.quality = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer).id : String(state.forgeTiming.lastOutcome || 'idle');
        }
        if (needle) {
            needle.style.left = `${(state.forgeTiming.pointer * 100).toFixed(2)}%`;
        }
        if (status || hint) {
            const outcome = state.forgeTiming.active
                ? evaluateForgeTiming(state.forgeTiming.pointer)
                : getForgeTimingRestingState();
            if (status) status.textContent = outcome.status;
            if (hint) hint.textContent = outcome.hint;
        }
    }

    function getForgeTimingRestingState() {
        const lastOutcome = state.forgeTiming.lastOutcome && state.forgeTiming.lastOutcome !== 'idle'
            ? getForgeTimingMeta(state.forgeTiming.lastOutcome)
            : null;
        return {
            status: lastOutcome
                ? text(`上次手感 · ${lastOutcome.shortZh}`, `Last touch · ${lastOutcome.shortEn}`)
                : text('手动控火', 'Manual Control'),
            hint: text('先点“开始控火”，指针扫过甜区时再次点击收炉；手动更容易爆珍藏。', 'Tap Start Control, then stop in the sweet zone. Manual control is the best way to chase relics.')
        };
    }

    function getForgeTimingMeta(outcomeId) {
        switch (outcomeId) {
            case 'perfect':
                return {
                    id: 'perfect',
                    shortZh: '完美',
                    shortEn: 'Perfect',
                    statusZh: '完美控火',
                    statusEn: 'Perfect Control',
                    hintZh: '完美区会显著提高高阶与珍藏掉率。',
                    hintEn: 'Perfect windows sharply lift high-tier and relic odds.',
                    rareBonus: 0.14,
                    jumpChance: 0.08,
                    doubleChance: 0.12,
                    extraGemChance: 0.1,
                    relicChance: 0.22,
                    dustBonus: 0,
                    xpBonus: 16,
                    comboGain: 2,
                    tone: 'claim'
                };
            case 'great':
                return {
                    id: 'great',
                    shortZh: '极佳',
                    shortEn: 'Great',
                    statusZh: '精准控火',
                    statusEn: 'Precise Control',
                    hintZh: '稳定命中甜区，适合冲高价值珍藏。',
                    hintEn: 'A stable sweet-zone hit that is great for valuable relics.',
                    rareBonus: 0.08,
                    jumpChance: 0.05,
                    doubleChance: 0.06,
                    extraGemChance: 0.06,
                    relicChance: 0.12,
                    dustBonus: 0,
                    xpBonus: 12,
                    comboGain: 1,
                    tone: 'success'
                };
            case 'good':
                return {
                    id: 'good',
                    shortZh: '稳定',
                    shortEn: 'Stable',
                    statusZh: '稳定控火',
                    statusEn: 'Stable Control',
                    hintZh: '有稳定加成，适合边玩边攒库存。',
                    hintEn: 'A safe boost for steady stock building.',
                    rareBonus: 0.03,
                    jumpChance: 0.02,
                    doubleChance: 0.02,
                    extraGemChance: 0.03,
                    relicChance: 0.05,
                    dustBonus: 2,
                    xpBonus: 9,
                    comboGain: 1,
                    tone: 'success'
                };
            case 'rough':
                return {
                    id: 'rough',
                    shortZh: '擦边',
                    shortEn: 'Rough',
                    statusZh: '擦边收炉',
                    statusEn: 'Rough Lock',
                    hintZh: '能出货，但珍藏概率一般。',
                    hintEn: 'Still useful, but relic odds stay modest.',
                    rareBonus: 0,
                    jumpChance: 0,
                    doubleChance: 0,
                    extraGemChance: 0,
                    relicChance: 0.02,
                    dustBonus: 4,
                    xpBonus: 7,
                    comboGain: -999,
                    tone: 'warning'
                };
            case 'unstable':
            default:
                return {
                    id: 'unstable',
                    shortZh: '过热',
                    shortEn: 'Overheat',
                    statusZh: '过热收炉',
                    statusEn: 'Overheat Lock',
                    hintZh: '虽然也能出货，但更适合先练手感。',
                    hintEn: 'You still get loot, but this is mostly a practice stop.',
                    rareBonus: 0,
                    jumpChance: 0,
                    doubleChance: 0,
                    extraGemChance: 0,
                    relicChance: 0,
                    dustBonus: 6,
                    xpBonus: 6,
                    comboGain: -999,
                    tone: 'warning'
                };
        }
    }

    function evaluateForgeTiming(pointer = state.forgeTiming.pointer) {
        const delta = Math.abs(Number(pointer) - FORGE_TIMING_TARGET);
        const combo = Math.max(0, Number(state.save.forgeCombo) || 0);
        const comboRareBonus = Math.min(0.08, combo * 0.008);
        const comboRelicBonus = Math.min(0.12, combo * 0.015);
        const base = delta <= FORGE_TIMING_PERFECT_WINDOW
            ? getForgeTimingMeta('perfect')
            : delta <= FORGE_TIMING_GREAT_WINDOW
                ? getForgeTimingMeta('great')
                : delta <= FORGE_TIMING_GOOD_WINDOW
                    ? getForgeTimingMeta('good')
                    : delta <= FORGE_TIMING_ROUGH_WINDOW
                        ? getForgeTimingMeta('rough')
                        : getForgeTimingMeta('unstable');
        return {
            ...base,
            delta,
            status: state.forgeTiming.active
                ? text(`${base.statusZh} · 点击收炉`, `${base.statusEn} · Tap to stop`)
                : text(base.statusZh, base.statusEn),
            hint: state.forgeTiming.active
                ? text(`当前连击 x${combo}，甜区越准越容易爆珍藏。`, `Current streak x${combo}. Better precision means better relic odds.`)
                : text(base.hintZh, base.hintEn),
            rareBonus: base.rareBonus + comboRareBonus,
            relicChance: base.relicChance + comboRelicBonus
        };
    }

    function getMotionSnapshot() {
        return JSON.stringify({
            tab: state.tab,
            gold: Math.round(Number(state.save.gold) || 0),
            dust: Math.round(Number(state.save.dust) || 0),
            catalyst: Math.round(Number(state.save.catalyst) || 0),
            seasonXp: Math.round(Number(state.save.seasonXp) || 0),
            contractIndex: state.save.contractIndex,
            bestContractIndex: state.save.bestContractIndex,
            heat: Math.round(Number(state.save.heat) || 0),
            selectedSigils: (state.save.selectedSigils || []).join('|'),
            sigilLevels: Object.values(state.save.sigilLevels || {}).join('|'),
            workshopLevels: Object.values(state.save.workshopLevels || {}).join('|'),
            missionClaimed: (state.save.missionClaimed || []).length,
            seasonClaimed: (state.save.seasonClaimed || []).length,
            premiumSeason: Object.keys(state.save.payment?.premiumSeasonClaims || {}).length,
            milestones: Object.keys(state.save.payment?.milestoneClaims || {}).length,
            dailySupplyAt: Number(state.save.dailySupplyAt) || 0,
            lastResult: state.save.lastResult?.title || ''
        });
    }

    function wrapActionWithMotion(actionFn, kind = 'success', duration = 420) {
        return function wrappedActionWithMotion(...args) {
            const before = getMotionSnapshot();
            const result = actionFn.apply(this, args);
            const after = getMotionSnapshot();
            if (before !== after) triggerUiMotion(kind, duration);
            return result;
        };
    }

    function renderAll() {
        syncHeat();
        applyLangState();
        renderResourceStrip();
        renderHeroSummary();
        renderActiveTab();
        renderTabBar();
        if (ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            renderPaymentOfferGrid();
            renderPaymentOrderUI();
            refreshPaymentVerificationState();
        }
        applyPendingUiMotion();
        syncForgeTimingUi();
    }

    function getSelectedPaymentOffer() {
        return config.paymentOffers.find((offer) => offer.id === selectedPaymentOfferId) || config.paymentOffers[0];
    }

    function getPaymentMinerId() {
        if (state.save.payment.minerId) return state.save.payment.minerId;
        state.save.payment.minerId = `GEMFORGE_${Math.random().toString(16).slice(2, 10).toUpperCase()}${Date.now().toString(16).slice(-6).toUpperCase()}`;
        saveProgress();
        return state.save.payment.minerId;
    }

    function mapPaymentApiError(errorMessage) {
        const raw = String(errorMessage || '').trim();
        const lower = raw.toLowerCase();

        if (!raw) return text('支付校验失败，请稍后重试。', 'Payment verification failed. Please try again.');
        if (lower.includes('txid not found')) return text('暂未在 TRON 主网上找到该 txid，请稍后再试。', 'This txid was not found on TRON mainnet yet.');
        if (lower.includes('not confirmed yet')) return text('这笔转账还未确认，请稍后再试。', 'This transfer is not confirmed yet. Try again shortly.');
        if (lower.includes('execution failed')) return text('链上交易执行失败，无法发放奖励。', 'The on-chain transaction failed, so rewards cannot be granted.');
        if (lower.includes('not a trc20 contract transfer')) return text('这不是 TRC20 合约转账。', 'This transaction is not a TRC20 transfer.');
        if (lower.includes('not trc20 usdt')) return text('这笔支付不是 TRC20-USDT。', 'This transaction is not a TRC20-USDT payment.');
        if (lower.includes('recipient address')) return text('收款地址不匹配，请按当前订单地址支付。', 'Recipient address mismatch. Please pay to the address shown in the current order.');
        if (lower.includes('amount mismatch')) return text('支付金额与当前订单的精确金额不一致。', 'The payment amount does not match the current exact order amount.');
        if (lower.includes('before this order was created')) return text('这笔转账早于订单创建时间，不能用于当前订单。', 'This transfer happened before the order was created and cannot be used.');
        if (lower.includes('after the order expired') || lower.includes('order expired')) return text('当前订单已过期，请重新创建订单。', 'This order has expired. Please create a new order.');
        if (lower.includes('already been used by another order') || lower.includes('another txid')) return text('该 txid 已被其他订单使用。', 'This txid has already been used by another order.');
        if (lower.includes('minerid does not match order')) return text('当前订单与本地账号不匹配，请重新创建订单。', 'This order does not belong to the current player. Please create a new order.');
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) return text('订单创建失败，请重新选择礼包。', 'Failed to create the payment order. Please select the pack again.');
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) return text('支付服务暂时不可用，请稍后重试。', 'The payment service is temporarily unavailable. Please try again later.');
        return raw;
    }

    async function requestPaymentApi(path, init = {}) {
        let response;
        try {
            response = await fetch(`${PAYMENT_API_BASE}${path}`, init);
        } catch (error) {
            throw new Error(text('支付服务暂时不可用，请检查网络后重试。', 'The payment service is temporarily unavailable. Please check your network and try again.'));
        }

        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.ok === false) {
            throw new Error(mapPaymentApiError(payload?.error || payload?.message));
        }
        return payload;
    }

    function buildClientPaymentOrder(order) {
        const createdAtRaw = order?.createdAt ?? order?.created_at;
        const expiresAtRaw = order?.expiresAt ?? order?.expires_at;
        return {
            id: String(order?.id || order?.orderId || order?.order_id || '--'),
            offerId: String(order?.offerId || order?.offer_id || selectedPaymentOfferId),
            offerName: String(order?.offerName || order?.offer_name || ''),
            minerId: String(order?.minerId || order?.miner_id || getPaymentMinerId()),
            createdAt: typeof createdAtRaw === 'number' ? createdAtRaw : (Date.parse(createdAtRaw || '') || Date.now()),
            expiresAt: typeof expiresAtRaw === 'number' ? expiresAtRaw : (Date.parse(expiresAtRaw || '') || (Date.now() + PAYMENT_ORDER_WINDOW_MS)),
            exactAmount: Number(order?.exactAmount || order?.baseAmount || 0),
            payAddress: String(order?.payAddress || ''),
            network: String(order?.network || 'TRON (TRC20)'),
            status: String(order?.status || 'pending'),
            txid: String(order?.txid || ''),
            paidAt: String(order?.paidAt || order?.paid_at || ''),
            rewardGranted: !!(order?.rewardGranted ?? order?.reward_granted)
        };
    }

    function formatPaymentUsdt(value) {
        return `${Number(value || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS)} USDT`;
    }

    function isPaymentOrderExpired(order = currentPaymentOrder) {
        if (!order) return false;
        const status = String(order.status || 'pending');
        if (status === 'expired' || status === 'cancelled') return true;
        if (status === 'paid' || status === 'granted') return false;
        return Number(order.expiresAt || 0) <= Date.now();
    }

    function isPaymentOrderSettledLocally(order = currentPaymentOrder) {
        return !!order?.id && !!state.save.payment.claimedOrders?.[order.id];
    }

    function persistCurrentPaymentOrder() {
        try {
            const order = currentPaymentOrder;
            const shouldPersist = !!order
                && !!order.id
                && order.id !== '--'
                && !isPaymentOrderSettledLocally(order)
                && String(order.status || 'pending') !== 'expired'
                && String(order.status || 'pending') !== 'cancelled';

            if (shouldPersist) {
                localStorage.setItem(PAYMENT_ORDER_STORAGE_KEY, JSON.stringify(order));
            } else {
                localStorage.removeItem(PAYMENT_ORDER_STORAGE_KEY);
            }
        } catch (error) {}
    }

    function setCurrentPaymentOrder(order, { persist = true } = {}) {
        currentPaymentOrder = order ? buildClientPaymentOrder(order) : null;
        if (currentPaymentOrder?.offerId && config.paymentOffers.some((offer) => offer.id === currentPaymentOrder.offerId)) {
            selectedPaymentOfferId = currentPaymentOrder.offerId;
        }
        if (persist) persistCurrentPaymentOrder();
        return currentPaymentOrder;
    }

    function restoreStoredPaymentOrder() {
        try {
            const raw = localStorage.getItem(PAYMENT_ORDER_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const storedOrder = buildClientPaymentOrder(parsed);
            if (!storedOrder?.id || storedOrder.id === '--') {
                localStorage.removeItem(PAYMENT_ORDER_STORAGE_KEY);
                return null;
            }
            return setCurrentPaymentOrder(storedOrder, { persist: true });
        } catch (error) {
            try { localStorage.removeItem(PAYMENT_ORDER_STORAGE_KEY); } catch (innerError) {}
            return null;
        }
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
        const query = new URLSearchParams({ orderId: String(orderId || ''), txid: String(txid || ''), minerId: getPaymentMinerId() });
        return requestPaymentApi(`/verify-payment?${query.toString()}`);
    }

    async function claimBackendPayment(orderId, txid) {
        return requestPaymentApi('/claim-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, txid, minerId: getPaymentMinerId() })
        });
    }

    async function checkBackendPaymentOrder(orderId) {
        const query = new URLSearchParams({ orderId: String(orderId || ''), minerId: getPaymentMinerId() });
        return requestPaymentApi(`/check-order?${query.toString()}`);
    }

    async function syncCurrentPaymentOrderStatus({ recoverRewards = false, silent = true } = {}) {
        if (!currentPaymentOrder?.id || currentPaymentOrder.id === '--') return null;

        try {
            const payload = await checkBackendPaymentOrder(currentPaymentOrder.id);
            const syncedOrder = buildClientPaymentOrder(payload?.order || currentPaymentOrder);

            if (syncedOrder.minerId && syncedOrder.minerId !== getPaymentMinerId()) {
                setCurrentPaymentOrder(null);
                if (!silent) {
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = text('检测到本地缓存订单归属不一致，已自动清除。', 'The cached order belongs to a different player and was cleared.');
                    refreshPaymentVerificationState();
                }
                return null;
            }

            if (syncedOrder.status === 'expired' || syncedOrder.status === 'cancelled') {
                setCurrentPaymentOrder(null);
                if (!silent && ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = syncedOrder.status === 'expired'
                        ? text('当前订单已过期，请重新创建订单。', 'This order has expired. Please create a new one.')
                        : text('当前订单已失效，请重新创建订单。', 'This order is no longer valid. Please create a new one.');
                    renderPaymentOrderUI();
                    refreshPaymentVerificationState();
                }
                return null;
            }

            setCurrentPaymentOrder(syncedOrder);

            if ((syncedOrder.rewardGranted || syncedOrder.status === 'granted') && state.save.payment.pendingClaims[syncedOrder.id]) {
                delete state.save.payment.pendingClaims[syncedOrder.id];
                saveProgress();
            }

            const needsRecovery = recoverRewards
                && !isPaymentOrderSettledLocally(syncedOrder)
                && !!syncedOrder.txid
                && (syncedOrder.status === 'paid' || syncedOrder.status === 'granted' || syncedOrder.rewardGranted);

            if (needsRecovery) {
                grantPaymentRewards({
                    orderId: syncedOrder.id,
                    txid: syncedOrder.txid,
                    offerId: syncedOrder.offerId,
                    queueClaim: !(syncedOrder.rewardGranted || syncedOrder.status === 'granted')
                });

                if (syncedOrder.rewardGranted || syncedOrder.status === 'granted') {
                    delete state.save.payment.pendingClaims[syncedOrder.id];
                    saveProgress();
                    paymentVerificationState = 'verified';
                    paymentVerificationError = '';
                    paymentVerificationNotice = text('检测到已支付订单，奖励已自动补发。', 'A paid order was found and rewards were restored automatically.');
                    setCurrentPaymentOrder({ ...syncedOrder, status: syncedOrder.status || 'granted', rewardGranted: true });
                } else {
                    try {
                        await claimBackendPayment(syncedOrder.id, syncedOrder.txid);
                        delete state.save.payment.pendingClaims[syncedOrder.id];
                        saveProgress();
                        paymentVerificationState = 'verified';
                        paymentVerificationError = '';
                        paymentVerificationNotice = text('检测到已支付订单，奖励已自动到账并完成后台补记。', 'A paid order was found. Rewards were restored and synced automatically.');
                        setCurrentPaymentOrder({ ...syncedOrder, status: 'granted', rewardGranted: true });
                    } catch (claimError) {
                        paymentVerificationState = 'verified';
                        paymentVerificationError = '';
                        paymentVerificationNotice = text('检测到已支付订单，奖励已自动到账；后台发奖记录将稍后自动同步。', 'A paid order was found. Rewards were restored and backend sync will retry automatically.');
                        console.warn('Gem Forge payment recovery claim sync queued.', { orderId: syncedOrder.id, claimError });
                        setCurrentPaymentOrder({ ...syncedOrder, status: 'paid', rewardGranted: false });
                    }
                }
            }

            if (ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
                renderPaymentOrderUI();
                refreshPaymentVerificationState();
            }
            return currentPaymentOrder;
        } catch (error) {
            if (!silent) {
                paymentVerificationState = 'idle';
                paymentVerificationNotice = '';
                paymentVerificationError = error?.message || text('订单状态同步失败，请稍后重试。', 'Failed to sync the order state. Please try again.');
                refreshPaymentVerificationState();
            }
            return null;
        }
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
                    console.warn('Gem Forge payment claim sync failed.', { orderId, error });
                }
            }
        }
        saveProgress();
        return syncedCount;
    }

    function getPaymentOrderCountdown(order = currentPaymentOrder) {
        if (!order) return '--:--';
        const status = String(order.status || 'pending');
        if (status === 'granted') return text('已发奖', 'Granted');
        if (status === 'paid') return text('已支付', 'Paid');
        if (status === 'expired') return text('已过期', 'Expired');
        const remain = Math.max(0, Number(order.expiresAt || 0) - Date.now());
        const totalSeconds = Math.ceil(remain / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    async function copyTextToClipboard(value) {
        const content = String(value || '').trim();
        if (!content) return false;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(content);
                return true;
            }
        } catch (error) {}

        const textarea = document.createElement('textarea');
        textarea.value = content;
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
        ui.paymentOfferGrid.innerHTML = config.paymentOffers.map((offer) => {
            const projected = getProjectedOfferImpact(offer);
            return `
                <button
                    class="gf-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}"
                    type="button"
                    data-select-payment-offer="${offer.id}"
                >
                    <span class="pill gf-payment-offer-badge">${text('链上礼包', 'On-Chain Pack')}</span>
                    ${offer.id === recommendedOfferId ? `<span class="pill gf-payment-offer-badge">${text('当前推荐', 'Recommended')}</span>` : ''}
                    <div class="gf-payment-offer-price">$${offer.price.toFixed(2)}</div>
                    <h3>${localize(offer.name)}</h3>
                    <p>${text(`立即补入 ${formatCompact(offer.reward.gold)} 金币、${formatCompact(offer.reward.dust)} 熔尘、${formatCompact(offer.reward.catalyst)} 催化剂，并给当前合同焦点符印各 ${formatCompact(offer.focusShards || 0)} 碎片。`, `Instantly grants ${formatCompact(offer.reward.gold)} gold, ${formatCompact(offer.reward.dust)} dust, ${formatCompact(offer.reward.catalyst)} catalyst, and ${formatCompact(offer.focusShards || 0)} shards to each current-focus sigil.`)}</p>
                    <div class="gf-chip-row">
                        <span class="gf-chip is-strong">${text('战力', 'Power')} +${formatCompact(projected.powerGain)}</span>
                        <span class="gf-chip">${text('卡点差距', 'Gap')} ${formatCompact(projected.currentGap)} → ${formatCompact(projected.projectedGap)}</span>
                        ${(offer.focusShards || 0) > 0 ? `<span class="gf-chip is-success">${text('焦点碎片', 'Focus Shards')} +${formatCompact(offer.focusShards || 0)}</span>` : ''}
                        ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text('预计推进', 'Reach')} +${projected.reachGain}</span>` : ''}
                    </div>
                </button>
            `;
        }).join('');
    }

    function renderPaymentOrderUI() {
        const offer = getSelectedPaymentOffer();
        const order = currentPaymentOrder && currentPaymentOrder.offerId === offer.id ? currentPaymentOrder : null;

        if (ui.paymentTitle) ui.paymentTitle.textContent = text('Gem Forge 充值中心', 'Gem Forge Top-Up Center');
        if (ui.paymentDesc) ui.paymentDesc.textContent = text('创建链上订单后，使用 OKX Wallet 按精确金额支付，再粘贴 txid 校验并发放奖励。', 'Create an on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant rewards.');
        if (ui.paymentOrderLabel) ui.paymentOrderLabel.textContent = text('订单号', 'Order ID');
        if (ui.paymentExactLabel) ui.paymentExactLabel.textContent = text('精确金额', 'Exact Amount');
        if (ui.paymentExpiryLabel) ui.paymentExpiryLabel.textContent = text('剩余时间', 'Expires In');
        if (ui.paymentAddressLabel) ui.paymentAddressLabel.textContent = text('收款地址', 'Receiving Address');
        if (ui.paymentTxidLabel) ui.paymentTxidLabel.textContent = text('粘贴 OKX Wallet 的 txid', 'Paste OKX Wallet txid');
        if (ui.paymentTxidInput) ui.paymentTxidInput.placeholder = text('请输入或粘贴链上 txid', 'Paste the on-chain txid from OKX Wallet');
        if (ui.paymentTxidHint) ui.paymentTxidHint.textContent = text('只有金额、地址和有效时间都匹配的订单，才能通过校验。', 'Only payments that match the exact amount, recipient address, and valid time window can pass verification.');
        if (ui.paymentCopyAddressBtn) ui.paymentCopyAddressBtn.textContent = text('复制地址', 'Copy Address');
        if (ui.paymentCopyAmountBtn) ui.paymentCopyAmountBtn.textContent = text('复制精确金额', 'Copy Exact Amount');
        if (ui.paymentVerifyBtn) ui.paymentVerifyBtn.textContent = text('校验 TXID', 'Verify TXID');
        if (ui.paymentAmount) ui.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `$${offer.price.toFixed(2)} USDT`;
        if (ui.paymentMeta) ui.paymentMeta.textContent = `${text('OKX 钱包', 'OKX Wallet')} · ${order?.network || 'TRON (TRC20)'} · ${localize(offer.name)}`;
        if (ui.paymentOrderId) ui.paymentOrderId.textContent = order ? order.id : '--';
        if (ui.paymentExactAmount) ui.paymentExactAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : '--';
        if (ui.paymentExpiry) ui.paymentExpiry.textContent = order ? getPaymentOrderCountdown(order) : '--:--';
        if (ui.paymentWallet) ui.paymentWallet.textContent = order?.payAddress || '--';
    }

    function getNormalizedPaymentTxid() {
        return String(ui.paymentTxidInput?.value || '').trim().toLowerCase();
    }

    function refreshPaymentVerificationState() {
        if (!ui.paymentStatus || !ui.paymentVerifyBtn || !ui.paymentCopyAddressBtn || !ui.paymentCopyAmountBtn) return;
        const txid = getNormalizedPaymentTxid();
        const txidValid = PAYMENT_TXID_REGEX.test(txid);
        const hasOrder = !!currentPaymentOrder;
        const orderExpired = isPaymentOrderExpired(currentPaymentOrder);

        ui.paymentStatus.classList.remove('is-error', 'is-success');

        if (paymentVerificationState === 'creating') {
            ui.paymentStatus.textContent = text('正在创建链上订单…', 'Creating on-chain order…');
            ui.paymentVerifyBtn.disabled = true;
            ui.paymentCopyAddressBtn.disabled = true;
            ui.paymentCopyAmountBtn.disabled = true;
            return;
        }

        if (paymentVerificationState === 'verifying') {
            ui.paymentStatus.textContent = text('正在链上校验支付…', 'Verifying payment on-chain…');
            ui.paymentVerifyBtn.disabled = true;
            ui.paymentCopyAddressBtn.disabled = true;
            ui.paymentCopyAmountBtn.disabled = true;
            return;
        }

        ui.paymentCopyAddressBtn.disabled = !hasOrder;
        ui.paymentCopyAmountBtn.disabled = !hasOrder;

        if (paymentVerificationState === 'verified') {
            ui.paymentStatus.textContent = paymentVerificationNotice || text('支付已校验通过，奖励已发放。', 'Payment verified and rewards granted.');
            ui.paymentStatus.classList.add('is-success');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        if (orderExpired) {
            ui.paymentStatus.textContent = txidValid
                ? text('当前订单倒计时已结束；如果你已在有效期内完成支付，仍可继续校验该 txid。', 'The order window has ended, but you can still verify this txid if the payment was completed before expiry.')
                : text('当前订单已过期；未支付请重新创建订单，已支付可继续粘贴 txid 校验。', 'The order window has ended. Create a new order if you did not pay, or paste the txid if you already paid in time.');
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = !txidValid || !hasOrder;
            return;
        }

        if (paymentVerificationError) {
            ui.paymentStatus.textContent = paymentVerificationError;
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = !txidValid || !hasOrder;
            return;
        }

        if (txid && !txidValid) {
            ui.paymentStatus.textContent = text('TXID 格式不正确，请粘贴 64 位链上 txid。', 'TXID format looks invalid. Please paste the 64-character on-chain txid.');
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        ui.paymentStatus.textContent = paymentVerificationNotice || text('先创建订单，再去 OKX Wallet 完成支付，最后把 txid 粘贴到这里校验。', 'Create an order, complete the payment in OKX Wallet, then paste the txid here.');
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
        if (clearInput && ui.paymentTxidInput) ui.paymentTxidInput.value = '';
        renderPaymentOrderUI();
        refreshPaymentVerificationState();

        const requestPromise = createBackendPaymentOrder(offer.id)
            .then((order) => {
                if (requestId !== paymentOrderNonce) return currentPaymentOrder || order;
                setCurrentPaymentOrder(order);
                paymentVerificationState = 'idle';
                paymentVerificationError = '';
                paymentVerificationNotice = '';
                renderPaymentOrderUI();
                refreshPaymentVerificationState();
                return order;
            })
            .catch((error) => {
                if (requestId === paymentOrderNonce) {
                    setCurrentPaymentOrder(null);
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = error?.message || text('订单创建失败，请稍后重试。', 'Failed to create order. Please try again.');
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
        const offer = config.paymentOffers.find((item) => item.id === offerId);
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
        if (!currentPaymentOrder) restoreStoredPaymentOrder();
        const hasRecoverableOrder = !!currentPaymentOrder && !isPaymentOrderSettledLocally(currentPaymentOrder);

        if (hasRecoverableOrder) {
            selectedPaymentOfferId = currentPaymentOrder.offerId;
        } else if (offerId && config.paymentOffers.some((offer) => offer.id === offerId)) {
            selectedPaymentOfferId = offerId;
        } else if (config.paymentOffers.some((offer) => offer.id === getRecommendedPaymentOfferId())) {
            selectedPaymentOfferId = getRecommendedPaymentOfferId();
        } else if (!config.paymentOffers.some((offer) => offer.id === selectedPaymentOfferId)) {
            selectedPaymentOfferId = config.paymentOffers[0]?.id || 'starter';
        }

        flushPendingPaymentClaims().catch(() => {});
        renderPaymentOfferGrid();
        resetPaymentVerificationState(true);
        renderPaymentOrderUI();
        ui.paymentModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');

        try {
            if (currentPaymentOrder) {
                await syncCurrentPaymentOrderStatus({ recoverRewards: true, silent: true });
            }

            if (
                paymentVerificationState !== 'verified' && (
                    !currentPaymentOrder
                    || isPaymentOrderSettledLocally(currentPaymentOrder)
                    || currentPaymentOrder.offerId !== selectedPaymentOfferId
                    || isPaymentOrderExpired(currentPaymentOrder)
                )
            ) {
                await syncPaymentOrderForSelectedOffer(true, true);
            }
        } catch (error) {}

        refreshPaymentVerificationState();
    }

    function closePaymentModal() {
        if (!ui.paymentModal) return;
        ui.paymentModal.classList.add('is-hidden');
        document.body.classList.remove('modal-open');
    }

    function dismissRelicCelebration() {
        clearTimeout(state.relicTimer);
        state.relicTimer = 0;
        state.activeRelicCelebration = null;
        if (!ui.relicModal || !ui.relicCard) return;
        ui.relicModal.classList.add('is-hidden');
        ui.relicCard.classList.remove('is-legend', 'is-mythic');
        document.body.classList.remove('relic-open');
    }

    function showRelicCelebration(relic, options = {}) {
        const normalized = normalizeForgeRelic(relic);
        if (!normalized || !ui.relicModal || !ui.relicCard) return;
        const family = familyMap[normalized.familyId];
        const rarityLabel = getForgeRelicRarityLabel(normalized.rarity);
        const qualityLabel = getForgeRelicQualityLabel(normalized.qualityId);
        const autoDismissMs = normalized.rarity === 'mythic' ? 4800 : 3600;
        clearTimeout(state.relicTimer);
        state.activeRelicCelebration = normalized;
        ui.relicModal.classList.remove('is-hidden');
        ui.relicCard.classList.remove('is-legend', 'is-mythic');
        ui.relicCard.classList.add(normalized.rarity === 'mythic' ? 'is-mythic' : 'is-legend');
        ui.relicCard.style.setProperty('--gf-relic-accent', family?.accent || '#b56fff');
        ui.relicCard.style.setProperty('--gf-relic-accent-glow', `${family?.accent || '#b56fff'}44`);
        ui.relicEyebrow.textContent = normalized.rarity === 'mythic'
            ? text('神话珍藏降临', 'Mythic Relic Descends')
            : text('传说珍藏掉落', 'Legend Relic Found');
        ui.relicTitle.textContent = localize(normalized.title);
        ui.relicCopy.textContent = text(
            `${rarityLabel}珍藏已入柜。${qualityLabel}命中了高价值掉落区，本次奖励与永久增益已即时到账。`,
            `${rarityLabel} relic archived. ${qualityLabel} hit the premium drop zone, and both the reward and permanent bonus are already granted.`
        );
        ui.relicStats.innerHTML = renderKpiGrid([
            { label: text('收藏分', 'Collector Score'), value: formatCompact(normalized.score) },
            { label: text('品质', 'Quality'), value: qualityLabel },
            { label: text('系别', 'Family'), value: localize(family?.name) || '--' },
            { label: text('阶位', 'Tier'), value: `T${normalized.tier}` }
        ]);
        ui.relicRewards.innerHTML = `
            <span class="gf-chip is-strong">${rarityLabel}</span>
            ${renderRewardChips(normalized.reward, { limit: 4 })}
            ${renderPermanentChips(normalized.permanent, { limit: 3 })}
        `;
        ui.relicAction.textContent = normalized.rarity === 'mythic'
            ? text('收下神话珍藏', 'Claim Mythic Relic')
            : text('继续熔炼', 'Continue Forging');
        document.body.classList.add('relic-open');
        triggerUiMotion('claim', normalized.rarity === 'mythic' ? 900 : 700);
        if (!options.sticky) {
            state.relicTimer = window.setTimeout(() => dismissRelicCelebration(), autoDismissMs);
        }
    }

    async function copyPaymentAddress() {
        const wallet = String(ui.paymentWallet?.textContent || '').trim();
        const copied = await copyTextToClipboard(wallet);
        paymentVerificationError = '';
        paymentVerificationNotice = copied
            ? text('收款地址已复制。', 'Receiving address copied.')
            : text('自动复制不可用，请手动复制地址。', 'Automatic copy is unavailable. Please copy the address manually.');
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
            ? text('精确金额已复制。', 'Exact amount copied.')
            : text('自动复制不可用，请手动复制精确金额。', 'Automatic copy is unavailable. Please copy the exact amount manually.');
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    function grantPaymentRewards({ orderId, txid, offerId, queueClaim = true }) {
        const offer = config.paymentOffers.find((item) => item.id === offerId) || getSelectedPaymentOffer();
        if (!offer || !orderId || state.save.payment.claimedOrders[orderId]) return false;

        const beforeTier = getSponsorTier();
        const normalizedTxid = PAYMENT_TXID_REGEX.test(String(txid || '').trim()) ? String(txid).trim().toLowerCase() : '';

        grantReward(offer.reward);
        state.save.payment.passUnlocked = true;
        state.save.payment.purchaseCount += 1;
        state.save.payment.totalSpent = Math.round((Number(state.save.payment.totalSpent || 0) + Number(offer.price || 0)) * 100) / 100;
        applyPermanentBonus(offer.permanent);
        grantFocusShards(getCurrentContract().focus, Number(offer.focusShards || 0));
        state.save.payment.claimedOrders[orderId] = true;

        if (queueClaim && normalizedTxid) {
            state.save.payment.pendingClaims[orderId] = normalizedTxid;
        } else {
            delete state.save.payment.pendingClaims[orderId];
        }

        if (normalizedTxid) {
            state.save.payment.verifiedTxids = [normalizedTxid, ...(state.save.payment.verifiedTxids || []).filter((item) => item !== normalizedTxid)].slice(0, 100);
        }

        const afterTier = getSponsorTier();
        const tierPromotion = afterTier.id !== beforeTier.id;
        const milestoneReadyCount = config.paymentMilestones.filter((milestone) => {
            const view = getMilestoneView(milestone);
            return view && view.claimable;
        }).length;

        saveProgress();
        showToast(
            tierPromotion
                ? text(`充值成功：${localize(offer.name)} 已到账，赞助档位提升到 ${localize(afterTier.title)}。${milestoneReadyCount > 0 ? ` 另有 ${milestoneReadyCount} 个里程碑奖励待领取。` : ''}`, `Top-up complete: ${localize(offer.name)} granted and sponsor tier promoted to ${localize(afterTier.title)}.${milestoneReadyCount > 0 ? ` ${milestoneReadyCount} milestone rewards are now ready.` : ''}`)
                : text(`充值成功：${localize(offer.name)} 奖励已到账。${milestoneReadyCount > 0 ? ` 另有 ${milestoneReadyCount} 个里程碑奖励待领取。` : ''}`, `Top-up complete: ${localize(offer.name)} rewards granted.${milestoneReadyCount > 0 ? ` ${milestoneReadyCount} milestone rewards are now ready.` : ''}`)
        );
        renderAll();
        return true;
    }

    async function handlePaymentConfirm() {
        if (paymentVerificationState === 'creating' || paymentVerificationState === 'verifying') return;

        const txid = getNormalizedPaymentTxid();
        if (!PAYMENT_TXID_REGEX.test(txid)) {
            paymentVerificationError = text('TXID 格式不正确，请检查后重新输入。', 'Invalid TXID format. Please check and try again.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if ((state.save.payment.verifiedTxids || []).includes(txid)) {
            paymentVerificationError = text('该 txid 已经使用过，不能重复发奖。', 'This TXID has already been used and cannot grant rewards again.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (!currentPaymentOrder) {
            paymentVerificationError = text('当前没有可校验的订单，请先创建订单。', 'There is no active order to verify. Please create one first.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (currentPaymentOrder.status === 'expired' || currentPaymentOrder.status === 'cancelled') {
            paymentVerificationError = text('当前订单已失效，请重新创建订单。', 'This order is no longer valid. Please create a new one.');
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
            const resolvedOrder = buildClientPaymentOrder({
                ...currentPaymentOrder,
                ...orderPayload,
                txid: orderPayload?.txid || txid
            });
            const resolvedOfferId = String(resolvedOrder.offerId || currentPaymentOrder.offerId || selectedPaymentOfferId);
            const hadLocalReward = !!state.save.payment.claimedOrders[orderId];
            setCurrentPaymentOrder(resolvedOrder);

            if (resolvedOrder.rewardGranted || hadLocalReward) {
                if (resolvedOrder.rewardGranted && !hadLocalReward) {
                    grantPaymentRewards({ orderId, txid: resolvedOrder.txid || txid, offerId: resolvedOfferId, queueClaim: false });
                }
                if (resolvedOrder.rewardGranted && state.save.payment.pendingClaims[orderId]) {
                    delete state.save.payment.pendingClaims[orderId];
                }
                paymentVerificationState = 'verified';
                paymentVerificationNotice = resolvedOrder.rewardGranted && !hadLocalReward
                    ? text('该订单已在后台完成发奖，本地奖励已自动补发。', 'This order was already granted on the backend. Local rewards were restored.')
                    : text('该订单奖励已发放，无需重复领取。', 'Rewards for this order have already been granted.');
                refreshPaymentVerificationState();
                saveProgress();
                return;
            }

            grantPaymentRewards({ orderId, txid, offerId: resolvedOfferId });
            paymentVerificationState = 'verified';

            try {
                await claimBackendPayment(orderId, txid);
                delete state.save.payment.pendingClaims[orderId];
                setCurrentPaymentOrder({ ...resolvedOrder, status: 'granted', rewardGranted: true, txid });
                paymentVerificationNotice = text('链上校验成功，奖励已发放。', 'On-chain verification succeeded and rewards were granted.');
                saveProgress();
            } catch (claimError) {
                setCurrentPaymentOrder({ ...resolvedOrder, status: 'paid', rewardGranted: false, txid });
                paymentVerificationNotice = text('链上校验成功，奖励已到账；后台发奖记录将稍后自动同步。', 'On-chain verification succeeded and rewards were granted. Backend sync will retry automatically.');
                console.warn('Gem Forge payment claim sync queued.', { orderId, claimError });
            }
            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || text('支付校验失败，请稍后重试。', 'Payment verification failed. Please try again.');
            refreshPaymentVerificationState();
        }
    }

    function applyLangState() {
        document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
        document.title = state.lang === 'en' ? 'Gem Forge' : '宝石熔炉';
        ui.heroEyebrow.textContent = state.lang === 'en' ? 'GENESIS GEM FORGE' : '创世宝石熔炉';
        ui.heroTitle.textContent = localize(config.meta.title);
        ui.heroSubtitle.textContent = localize(config.meta.subtitle);
        ui.langButtons.forEach((button) => {
            const isActive = button.dataset.langSwitch === state.lang;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function renderResourceStrip() {
        const resources = [
            { label: text('金币', 'Gold'), value: formatCompact(state.save.gold) },
            { label: text('熔尘', 'Dust'), value: formatCompact(state.save.dust) },
            { label: text('催化剂', 'Catalyst'), value: formatCompact(state.save.catalyst) },
            { label: text('赛季经验', 'Season XP'), value: formatCompact(state.save.seasonXp) }
        ];

        ui.resourceStrip.innerHTML = resources.map((item) => `
            <div class="gf-resource-pill">
                <span>${item.label}</span>
                <strong>${item.value}</strong>
            </div>
        `).join('');
    }

    function renderHeroSummary() {
        const contract = getCurrentContract();
        const power = getCurrentPower();
        const effectivePower = getEffectiveContractPower();
        const powerGap = Math.max(0, contract.recommended - effectivePower);
        const sponsorTier = getSponsorTier();
        const heatMax = getHeatMax();
        const diagnosis = getGrowthDiagnosis();

        ui.heroSummary.innerHTML = `
            ${renderPanelHead(
                text('当前推进', 'Current Route'),
                '',
                `<div class="gf-chip is-strong">${text('当前合同', 'Contract')} · ${contract.id}</div>`
            )}
            <div class="gf-kpi-grid">
                <div class="gf-kpi-card"><span>${text('有效战力', 'Effective')}</span><strong>${formatCompact(effectivePower)}</strong></div>
                <div class="gf-kpi-card"><span>${text('热量', 'Heat')}</span><strong>${formatCompact(Math.floor(state.save.heat))}/${formatCompact(heatMax)}</strong></div>
                <div class="gf-kpi-card"><span>${text('赞助档位', 'Sponsor')}</span><strong>${localize(sponsorTier.title)}</strong></div>
                <div class="gf-kpi-card"><span>${text('最高合同', 'Best')}</span><strong>${config.contracts[state.save.bestContractIndex].id}</strong></div>
            </div>
            <div class="gf-chip-row gf-summary-status-row" style="margin-top:12px;">
                <span class="gf-chip is-strong">${powerGap > 0 ? text(`还差 ${formatCompact(powerGap)}`, `Gap ${formatCompact(powerGap)}`) : text('已够线', 'Ready')}</span>
                <span class="gf-chip">${text('下一步', 'Next')} · ${diagnosis.freeShort}</span>
                <span class="gf-chip is-success">${text('稳定补正', 'Stability')} · +${formatCompact(Math.max(0, effectivePower - power.total))}</span>
                <span class="gf-chip is-success">${text('热量恢复', 'Heat Regen')} · ${formatCompact(getHeatRegenPerSecond())}/s</span>
                <span class="gf-chip">${text('稀有率强化', 'Rare Rate')} · +${formatPercent(getRareBonus())}</span>
                <span class="gf-chip">${text('熔尘回收', 'Dust Yield')} · +${formatPercent(getDustBonus())}</span>
            </div>
        `;
    }

    function renderActiveTab() {
        switch (state.tab) {
            case 'forge': renderForgeTab(); break;
            case 'contracts': renderContractsTab(); break;
            case 'sigils': renderSigilsTab(); break;
            case 'workshop': renderWorkshopTab(); break;
            case 'missions': renderMissionsTab(); break;
            case 'season': renderSeasonTab(); break;
            case 'shop': renderShopTab(); break;
            default:
                state.tab = 'forge';
                renderForgeTab();
                break;
        }
    }

    function renderTabBar() {
        const redDots = {
            forge: hasForgeRedDot(),
            contracts: hasContractRedDot(),
            sigils: hasSigilRedDot(),
            workshop: hasWorkshopRedDot(),
            missions: hasMissionRedDot(),
            season: hasSeasonRedDot(),
            shop: hasShopRedDot()
        };

        ui.tabBar.innerHTML = config.tabs.map((tab) => `
            <button class="gf-tab-btn ${state.tab === tab.id ? 'is-active' : ''}" type="button" data-tab="${tab.id}">
                ${localize(tab.label)}
                <i class="gf-tab-dot ${redDots[tab.id] ? 'is-ready' : ''}"></i>
            </button>
        `).join('');
    }

    function renderForgeTab() {
        const contract = getCurrentContract();
        const power = getCurrentPower();
        const heatEnoughOne = state.save.heat >= SMELT_HEAT_COST;
        const heatEnoughBatch = state.save.heat >= config.forgeBalance.batchSmeltHeatCost;
        const inventoryRows = getGemInventoryRows();
        const fuseReady = inventoryRows.filter((row) => row.canFuse);
        const awakenReady = inventoryRows.filter((row) => row.canAwaken);
        const lastResult = state.save.lastResult;

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('熔炉主界面', 'Forge Core'),
                text('单屏只保留热量、合同焦点、保底进度、熔炼按钮和当前可操作库存，先把循环跑顺。', 'This view keeps only heat, contract focus, pity progress, forge buttons, and actionable inventory so the core loop stays readable.'),
                `<div class="gf-chip">${text('焦点掉落', 'Focus')} · ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('熔炉状态', 'Forge Status')}</div>
                            <div class="gf-card-title">${text('热量与保底', 'Heat & Pity')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(Math.floor(state.save.heat))}</div>
                    </div>
                    <div class="gf-card-copy">${text('单次熔炼消耗 4 热量；批量熔炼用 12 热量跑 3 次，并附带少量金币/熔尘回流。', 'Single forge spends 4 heat. Batch forge spends 12 heat for 3 rolls and adds a small gold/dust return.')}</div>
                    ${renderKpiGrid([
                        { label: text('热量上限', 'Heat Cap'), value: formatCompact(getHeatMax()) },
                        { label: text('恢复 / 秒', 'Regen / s'), value: formatCompact(getHeatRegenPerSecond()) },
                        { label: text('T3 保底', 'T3 Pity'), value: `${Math.max(0, config.forgeBalance.pityTier3Need - state.save.pity.t3)}` },
                        { label: text('T4 保底', 'T4 Pity'), value: `${Math.max(0, config.forgeBalance.pityTier4Need - state.save.pity.t4)}` }
                    ])}
                    <div class="gf-progress"><i style="width:${Math.min(100, (state.save.heat / Math.max(1, getHeatMax())) * 100).toFixed(2)}%;"></i></div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="smeltOne" ${heatEnoughOne ? '' : 'disabled'}>${text('立即熔炼', 'Smelt Now')}</button>
                        <button class="ghost-btn" type="button" data-action="smeltBatch" ${heatEnoughBatch ? '' : 'disabled'}>${text('批量熔炼 x3', 'Batch x3')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('当前卡点', 'Current Wall')}</div>
                            <div class="gf-card-title">${power.total >= contract.recommended ? text('可以继续冲合同', 'Ready to push') : text('仍需补强', 'Needs more power')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(Math.max(0, contract.recommended - power.total))}</div>
                    </div>
                    <div class="gf-card-copy">${text(`合同 ${contract.id} 推荐战力 ${formatCompact(contract.recommended)}，通关会回收金币、熔尘、催化剂与聚焦符印碎片。`, `Contract ${contract.id} recommends ${formatCompact(contract.recommended)} power and returns gold, dust, catalyst, and focus sigil shards.`)}</div>
                    ${renderKpiGrid([
                        { label: text('当前战力', 'Power'), value: formatCompact(power.total) },
                        { label: text('推荐线', 'Recommended'), value: formatCompact(contract.recommended) },
                        { label: text('金币回收', 'Gold'), value: formatCompact(contract.reward.gold) },
                        { label: text('熔尘回收', 'Dust'), value: formatCompact(contract.reward.dust) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${contract.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                        <span class="gf-chip is-warning">${text('建议同时抬符印与工坊', 'Raise sigils and workshop together')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="openTab" data-value="contracts">${text('去合同页推进', 'Open Contracts')}</button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="sigils">${text('去补符印', 'Raise Sigils')}</button>
                    </div>
                </article>
            </div>
            ${lastResult ? `
                <article class="gf-result-box">
                    <strong>${text('最近结果', 'Latest Result')} · ${lastResult.title}</strong>
                    <p>${lastResult.copy}</p>
                    <div class="gf-chip-row" style="margin-top:10px;">
                        ${lastResult.tags.map((tag) => `<span class="gf-chip is-strong">${tag}</span>`).join('')}
                    </div>
                </article>
            ` : ''}
            <article class="gf-list-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('宝石库存', 'Gem Stock')}</div>
                        <div class="gf-card-title">${text(`${fuseReady.length} 条可合成，${awakenReady.length} 条可觉醒`, `${fuseReady.length} fuse-ready, ${awakenReady.length} awaken-ready`)}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getTotalGemCount())}</div>
                </div>
                <div class="gf-card-copy">${text('这里按“能不能操作”排序：能合成、能觉醒、价值高的宝石会自动置顶。', 'Rows are sorted by actionability first, so fuse-ready, awaken-ready, and high-value gems stay on top.')}</div>
                <div class="gf-list" style="margin-top:12px;">
                    ${inventoryRows.length ? inventoryRows.slice(0, 12).map(renderGemRow).join('') : `<div class="gf-empty">${text('当前库存还是空的，先点一次“立即熔炼”拿到第一批宝石。', 'Your stock is empty. Start with one smelt to get the first gems rolling.')}</div>`}
                </div>
            </article>
        `;
    }

    function renderContractsTab() {
        const currentPower = getCurrentPower().total;
        const visibleContracts = config.contracts.map((contract, index) => {
            const unlocked = index <= state.save.bestContractIndex;
            const selected = index === state.save.contractIndex;
            const cleared = index < state.save.bestContractIndex;
            const preview = index === state.save.bestContractIndex + 1;
            const powerGap = Math.max(0, contract.recommended - currentPower);
            return { contract, index, unlocked, selected, cleared, preview, powerGap };
        });

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('合同推进', 'Contracts'),
                text('这页只回答三件事：当前推哪档、差多少、打赢后回什么。', 'This view answers only three things: which contract to push, how far you are, and what comes back when it clears.'),
                `<div class="gf-chip">${text('最高推进', 'Best')} · ${config.contracts[state.save.bestContractIndex].id}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('当前目标', 'Current Goal')}</div>
                            <div class="gf-card-title">${getCurrentContract().id} · ${localize(getCurrentContract().name)}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(currentPower)}</div>
                    </div>
                    <div class="gf-card-copy">${text('当前战力若已达推荐线，就直接去跑；若差距明显，优先补符印等级、熔尘和高阶宝石。', 'Run immediately when you are on the recommended line. Otherwise, raise sigils, dust flow, and higher-tier gems first.')}</div>
                    ${renderKpiGrid([
                        { label: text('当前战力', 'Power'), value: formatCompact(currentPower) },
                        { label: text('推荐战力', 'Recommended'), value: formatCompact(getCurrentContract().recommended) },
                        { label: text('差值', 'Gap'), value: formatCompact(Math.max(0, getCurrentContract().recommended - currentPower)) },
                        { label: text('成功率', 'Clear State'), value: currentPower >= getCurrentContract().recommended ? text('稳', 'Ready') : text('缺口', 'Gap') }
                    ])}
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="runContract" data-value="${state.save.contractIndex}">${text('执行当前合同', 'Run Contract')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('奖励结构', 'Reward Mix')}</div>
                            <div class="gf-card-title">${text('合同越高，金币越不够用', 'Higher contracts tighten gold')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(getCurrentContract().reward.gold)}</div>
                    </div>
                    <div class="gf-card-copy">${text('金币只覆盖一部分后续升级，熔尘和催化剂会越来越像真正卡点，付费价值也会更明确。', 'Gold covers only part of the next upgrades, while dust and catalyst become clearer walls over time and make top-up value easier to feel.')}</div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${renderRewardChips(getContractPreviewReward(getCurrentContract()), { limit: 4 })}
                    </div>
                </article>
            </div>
            <div class="gf-list">
                ${visibleContracts.map(({ contract, index, unlocked, selected, cleared, preview, powerGap }) => `
                    <article class="gf-list-card gf-contract-card ${selected ? 'is-current' : ''} ${!unlocked ? 'is-locked' : ''}">
                        <div class="gf-row-head">
                            <div>
                                <div class="eyebrow">${contract.id}</div>
                                <div class="gf-card-title">${localize(contract.name)}</div>
                            </div>
                            <div class="gf-card-number">${formatCompact(contract.recommended)}</div>
                        </div>
                        <div class="gf-card-copy">${unlocked
                            ? (powerGap > 0
                                ? text(`当前还差 ${formatCompact(powerGap)} 战力，优先补 ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')} 焦点相关收益。`, `You are ${formatCompact(powerGap)} power short. Focus on ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')} outputs first.`)
                                : text('当前战力已够线，直接执行合同拿资源并解锁下一档。', 'You are on the line. Run it now for resources and the next unlock.'))
                            : text('上一档还没打通，这里先只看推荐线和奖励，不要提前分散资源。', 'The previous step is not cleared yet, so only read the recommendation and reward for now.')}</div>
                        <div class="gf-chip-row" style="margin-top:10px;">
                            ${contract.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                            ${cleared ? `<span class="gf-chip is-success">${text('已通关', 'Cleared')}</span>` : ''}
                            ${selected ? `<span class="gf-chip is-strong">${text('当前选中', 'Selected')}</span>` : ''}
                            ${preview && !unlocked ? `<span class="gf-chip is-warning">${text('下一档预览', 'Next Preview')}</span>` : ''}
                            ${!preview && !unlocked ? `<span class="gf-chip is-warning">${text('未解锁', 'Locked')}</span>` : ''}
                        </div>
                        <div class="gf-chip-row" style="margin-top:10px;">
                            ${renderRewardChips(getContractPreviewReward(contract), { limit: 4 })}
                        </div>
                        <div class="gf-action-row" style="margin-top:12px;">
                            <button class="ghost-btn" type="button" data-action="selectContract" data-value="${index}" ${unlocked ? '' : 'disabled'}>${selected ? text('当前目标', 'Current Target') : text('设为目标', 'Set Target')}</button>
                            <button class="primary-btn" type="button" data-action="runContract" data-value="${index}" ${unlocked ? '' : 'disabled'}>${text('执行', 'Run')}</button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderSigilsTab() {
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, level, index };
        });
        const totalShards = Object.values(state.save.sigilShards).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const sortedSigils = config.sigils.slice().sort((a, b) => getSigilSortScore(b.id) - getSigilSortScore(a.id));

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('符印构筑', 'Sigils'),
                text('每个符印只吃自己的碎片；顶部总碎片只是汇总，不代表任意一个符印都能直接解锁或升级。', 'Each sigil uses its own shards. The total shard number is only a summary and does not mean every sigil can be unlocked or upgraded immediately.'),
                `<div class="gf-chip">${text('总碎片', 'Total Shards')} · ${formatCompact(totalShards)}</div>`
            )}
            <div class="gf-slot-grid">
                ${slotCards.map(renderSlotCard).join('')}
            </div>
            <article class="gf-list-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('符印列表', 'Sigil List')}</div>
                        <div class="gf-card-title">${text('先看可操作项，再决定补哪条线', 'Review actionable sigils first')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getSelectedSigilPower())}</div>
                </div>
                <div class="gf-card-copy">${text('排序优先级：已装备 > 可解锁/可升级 > 当前合同焦点 > 高稀有。', 'Sorting priority: equipped > unlockable/upgradable > current contract focus > higher rarity.')}</div>
                <div class="gf-list" style="margin-top:12px;">
                    ${sortedSigils.map(renderSigilRow).join('')}
                </div>
            </article>
        `;
    }

    function renderWorkshopTab() {
        const sortedWorkshop = config.workshop.slice().sort((a, b) => {
            const affordA = canUpgradeWorkshop(a.id) ? 1 : 0;
            const affordB = canUpgradeWorkshop(b.id) ? 1 : 0;
            return affordB - affordA;
        });
        const priorityTarget = getPriorityWorkshopTarget();
        const rareRate = getWorkshopEffect('rareRate');
        const heatRegen = getWorkshopEffect('heatRegen');
        const dustYield = getWorkshopEffect('dustYield');
        const catalystRefine = getWorkshopEffect('catalystRefine');

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('工坊', 'Workshop'),
                '',
                `<div class="gf-chip">${text('研究次数', 'Research Count')} · ${formatCompact(state.save.stats.workshopUps)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card ${priorityTarget?.affordable ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('优先升级', 'Priority Upgrade')}</div>
                            <div class="gf-card-title">${priorityTarget ? localize(priorityTarget.item.name) : text('当前工坊已封顶', 'Workshop maxed')}</div>
                        </div>
                        <div class="gf-card-number">${priorityTarget ? `Lv.${getWorkshopLevel(priorityTarget.workshopId)}` : text('完成', 'Done')}</div>
                    </div>
                    ${priorityTarget ? renderKpiGrid([
                        { label: text('当前', 'Current'), value: formatWorkshopEffect(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId)) },
                        { label: text('下级', 'Next'), value: formatWorkshopEffect(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId, getWorkshopLevel(priorityTarget.workshopId) + 1)) },
                        { label: text('金币', 'Gold'), value: formatCompact(priorityTarget.cost.gold) },
                        { label: text('熔尘', 'Dust'), value: formatCompact(priorityTarget.cost.dust) }
                    ]) : renderKpiGrid([
                        { label: text('热量恢复', 'Heat Regen'), value: formatWorkshopEffect('heatRegen', heatRegen) },
                        { label: text('稀有率', 'Rare Rate'), value: formatWorkshopEffect('rareRate', rareRate) },
                        { label: text('熔尘收益', 'Dust'), value: formatWorkshopEffect('dustYield', dustYield) },
                        { label: text('催化提炼', 'Catalyst'), value: formatWorkshopEffect('catalystRefine', catalystRefine) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${priorityTarget
                            ? `<span class="gf-chip is-strong">${getWorkshopRelationCopy(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId), getWorkshopEffect(priorityTarget.workshopId, getWorkshopLevel(priorityTarget.workshopId) + 1))}</span>`
                            : `<span class="gf-chip is-success">${text('5 条常驻线都已升满，可回到熔炉与合同继续推进。', 'All 5 permanent lines are maxed. Return to Forge and Contracts to keep pushing.')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${priorityTarget?.affordable ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${priorityTarget ? 'upgradeWorkshop' : 'openTab'}" data-value="${priorityTarget ? priorityTarget.workshopId : 'forge'}">${priorityTarget ? text('立即升级', 'Upgrade Now') : text('返回熔炉', 'Back to Forge')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('常驻快照', 'Permanent Snapshot')}</div>
                            <div class="gf-card-title">${text('工坊加成会立刻写入熔炉、合同与产出。', 'Workshop bonuses apply immediately to forge, contracts, and economy.')}</div>
                        </div>
                        <div class="gf-card-number">${sortedWorkshop.filter((item) => getWorkshopLevel(item.id) >= item.maxLevel).length}/${sortedWorkshop.length}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('热量恢复', 'Heat Regen'), value: formatWorkshopEffect('heatRegen', heatRegen) },
                        { label: text('稀有率', 'Rare Rate'), value: formatWorkshopEffect('rareRate', rareRate) },
                        { label: text('熔尘收益', 'Dust'), value: formatWorkshopEffect('dustYield', dustYield) },
                        { label: text('催化提炼', 'Catalyst'), value: formatWorkshopEffect('catalystRefine', catalystRefine) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} · ${formatWorkshopEffect('heatCap', getWorkshopEffect('heatCap'))}</span>
                        <span class="gf-chip">${text('当前可升', 'Ready Up')} · ${formatCompact(sortedWorkshop.filter((item) => canUpgradeWorkshop(item.id)).length)}</span>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${sortedWorkshop.map(renderWorkshopCompactRow).join('')}
            </div>
        `;
    }

    function renderMissionsTab() {
        const missionViews = config.missions.map(getMissionView).sort((a, b) => b.sort - a.sort);
        const claimable = missionViews.filter((item) => item.claimable);
        const pending = missionViews.filter((item) => !item.claimed && !item.claimable);
        const visible = [...claimable, ...pending.slice(0, Math.max(4, 6 - claimable.length))];
        const bundleReward = mergeRewards(...claimable.map((item) => item.reward));
        const nextMission = claimable[0] || pending[0] || null;
        const nextRoute = nextMission ? getMissionRoute(nextMission.id) : { tab: 'forge', label: text('去熔炉', 'Open Forge') };
        const claimedCount = state.save.missionClaimed.length;
        const boardProgress = config.missions.length ? Math.round((claimedCount / config.missions.length) * 100) : 100;
        const batchAction = claimable.length > 0
            ? { action: 'claimAllMissions', value: '', label: text('一键领取', 'Claim All'), cls: 'primary-btn' }
            : { action: 'openTab', value: nextRoute.tab, label: nextRoute.label, cls: 'ghost-btn' };
        const nextAction = nextMission
            ? nextMission.claimable
                ? { action: 'claimMission', value: nextMission.id, label: text('立即领取', 'Claim Now'), cls: 'primary-btn' }
                : { action: 'openTab', value: nextRoute.tab, label: nextRoute.label, cls: 'ghost-btn' }
            : { action: 'openTab', value: 'forge', label: text('回熔炉', 'Back to Forge'), cls: 'ghost-btn' };

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('任务', 'Missions'),
                '',
                `<div class="gf-chip">${text('可领', 'Ready')} · ${claimable.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('任务总览', 'Mission Board')}</div>
                            <div class="gf-card-title">${claimable.length > 0 ? text(`${claimable.length} 个奖励待领`, `${claimable.length} rewards ready`) : text('当前先做最近目标', 'Push the nearest goal first')}</div>
                        </div>
                        <div class="gf-card-number">${claimable.length > 0 ? claimable.length : `${boardProgress}%`}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${text('待领', 'Ready')} · ${claimable.length}</span>
                        <span class="gf-chip">${text('已领', 'Claimed')} · ${claimedCount}/${config.missions.length}</span>
                        <span class="gf-chip">${text('完成率', 'Board')} · ${boardProgress}%</span>
                    </div>
                    ${claimable.length > 0
                        ? `<div class="gf-chip-row" style="margin-top:12px;">${renderRewardChips(bundleReward, { limit: 3 })}</div>`
                        : `<div class="gf-chip-row" style="margin-top:12px;"><span class="gf-chip">${text('当前暂无可领，直接去做最近一条即可。', 'Nothing is ready. Just push the nearest task.')}</span></div>`}
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${batchAction.cls}" type="button" data-action="${batchAction.action}" data-value="${batchAction.value}">${batchAction.label}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('最近目标', 'Nearest Goal')}</div>
                            <div class="gf-card-title">${nextMission ? nextMission.title : text('当前任务已清空', 'Mission board clear')}</div>
                        </div>
                        <div class="gf-card-number">${nextMission ? `${Math.round(nextMission.progressRate * 100)}%` : '100%'}</div>
                    </div>
                    ${nextMission ? `<div class="gf-progress gf-progress--small"><i style="width:${(nextMission.progressRate * 100).toFixed(2)}%;"></i></div>` : ''}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${nextMission ? `${nextMission.progress}/${nextMission.target}` : text('已完成', 'Done')}</span>
                        ${nextMission ? `<span class="gf-chip">${nextRoute.label}</span>` : `<span class="gf-chip">${text('当前可先回熔炉和合同推进。', 'Return to Forge or Contracts next.')}</span>`}
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${nextMission ? renderRewardChips(nextMission.reward, { limit: 2 }) : ''}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${nextAction.cls}" type="button" data-action="${nextAction.action}" data-value="${nextAction.value}">${nextAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${visible.length ? visible.map(renderMissionCompactRow).join('') : `<div class="gf-empty">${text('当前没有可显示的任务。', 'No visible missions right now.')}</div>`}
            </div>
        `;
    }
    function renderSeasonTab() {
        const seasonNodes = config.seasonNodes.map((node) => getSeasonNodeView(node, false)).sort(compareNodeState);
        const sponsorNodes = config.sponsorSeasonNodes.map((node) => getSeasonNodeView(node, true)).sort(compareNodeState);
        const claimableSeason = seasonNodes.filter((node) => node.claimable);
        const claimableSponsor = sponsorNodes.filter((node) => node.claimable);
        const sponsorTier = getSponsorTier();
        const nextFree = seasonNodes.find((node) => !node.claimed && !node.claimable) || null;
        const nextSponsor = sponsorNodes.find((node) => !node.claimed && !node.claimable) || null;
        const visibleFree = [...claimableSeason, ...(nextFree ? [nextFree] : [])].slice(0, 3);
        const visibleSponsor = [...claimableSponsor, ...(nextSponsor ? [nextSponsor] : [])].slice(0, 3);
        const totalReady = claimableSeason.length + claimableSponsor.length;
        const freeAction = totalReady > 0
            ? { action: 'claimAllSeason', value: '', label: text('一键领取', 'Claim All'), cls: 'primary-btn' }
            : { action: 'openTab', value: 'forge', label: text('去熔炉拿 XP', 'Forge for XP'), cls: 'ghost-btn' };
        const sponsorAction = !state.save.payment.passUnlocked
            ? { action: 'openPayment', value: getRecommendedPaymentOfferId(), label: text('开启赞助', 'Unlock Sponsor'), cls: 'primary-btn' }
            : claimableSponsor.length > 0
                ? { action: 'claimAllSeason', value: '', label: text(`领取赞助 ${claimableSponsor.length}`, `Claim ${claimableSponsor.length}`), cls: 'primary-btn' }
                : { action: 'openPayment', value: getRecommendedPaymentOfferId(), label: text('继续冲档', 'Top Up'), cls: 'ghost-btn' };

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('赛季', 'Season'),
                '',
                `<div class="gf-chip">${text('赞助档位', 'Sponsor')} · ${localize(sponsorTier.title)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('免费轨', 'Free Track')}</div>
                            <div class="gf-card-title">${claimableSeason.length > 0 ? text(`${claimableSeason.length} 个节点待领`, `${claimableSeason.length} nodes ready`) : text('先推 XP 再回来收菜', 'Earn XP then come back')}</div>
                        </div>
                        <div class="gf-card-number">${claimableSeason.length > 0 ? claimableSeason.length : formatCompact(state.save.seasonXp)}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">XP · ${formatCompact(state.save.seasonXp)}</span>
                        <span class="gf-chip">${text('可领', 'Ready')} · ${claimableSeason.length}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${nextFree ? nextFree.id : text('已满', 'Done')}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('还差', 'Gap')} · ${nextFree ? formatCompact(Math.max(0, nextFree.xp - state.save.seasonXp)) : '0'}</span>
                        ${nextFree ? renderRewardChips(nextFree.reward, { limit: 2 }) : `<span class="gf-chip is-success">${text('免费轨已全部打完。', 'Free track completed.')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${freeAction.cls}" type="button" data-action="${freeAction.action}" data-value="${freeAction.value}">${freeAction.label}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助轨', 'Sponsor Track')}</div>
                            <div class="gf-card-title">${state.save.payment.passUnlocked ? text(`${claimableSponsor.length} 个赞助节点待领`, `${claimableSponsor.length} sponsor nodes ready`) : text('首充后开启', 'Unlocks after first top-up')}</div>
                        </div>
                        <div class="gf-card-number">${state.save.payment.passUnlocked ? claimableSponsor.length : text('未激活', 'Locked')}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${localize(sponsorTier.title)}</span>
                        <span class="gf-chip">${text('可领', 'Ready')} · ${claimableSponsor.length}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${nextSponsor ? nextSponsor.id : text('已满', 'Done')}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} +${formatCompact(sponsorTier.heatCapBonus)}</span>
                        <span class="gf-chip">${text('稀有率', 'Rare Rate')} +${formatPercent(sponsorTier.rareRateBonus)}</span>
                        <span class="gf-chip">${text('还差 XP', 'XP Gap')} · ${nextSponsor ? formatCompact(Math.max(0, nextSponsor.xp - state.save.seasonXp)) : '0'}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${sponsorAction.cls}" type="button" data-action="${sponsorAction.action}" data-value="${sponsorAction.value}">${sponsorAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${visibleFree.map((node) => renderSeasonCompactRow(node, false)).join('')}
            </div>
            <div class="gf-divider"></div>
            <div class="gf-list gf-list--compact">
                ${visibleSponsor.map((node) => renderSeasonCompactRow(node, true)).join('')}
            </div>
        `;
    }
    function renderActivePaymentCard() {
        const order = currentPaymentOrder;
        if (!order || isPaymentOrderSettledLocally(order)) return '';

        const offer = config.paymentOffers.find((item) => item.id === order.offerId);
        const statusLabel = order.status === 'paid'
            ? text('待校验', 'Verify')
            : order.status === 'granted'
                ? text('已发放', 'Granted')
                : isPaymentOrderExpired(order)
                    ? text('已过期', 'Expired')
                    : text('进行中', 'Active');

        return `
            <article class="gf-compact-row is-ready">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${offer ? localize(offer.name) : text('链上订单', 'On-Chain Order')}</div>
                    <div class="gf-compact-sub">${text('检测到一笔未完成或待校验订单，可直接继续，无需重新找礼包。', 'An unfinished or verification-pending order was found. Resume directly without finding the pack again.')}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip">${text('订单', 'Order')} · ${order.id}</span>
                        <span class="gf-chip is-strong">${text('金额', 'Amount')} · ${formatPaymentUsdt(order.exactAmount)}</span>
                        <span class="gf-chip">${text('剩余', 'Time')} · ${getPaymentOrderCountdown(order)}</span>
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${statusLabel}</strong>
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${order.offerId}">${text('继续支付', 'Resume')}</button>
                </div>
                </div>
            </article>
        `;
    }
    function renderGrowthDiagnosisCard() {
        const diagnosis = getGrowthDiagnosis();
        const offer = config.paymentOffers.find((item) => item.id === diagnosis.recommendedOfferId) || config.paymentOffers[0];
        return `
            <article class="gf-compact-row ${diagnosis.powerGap > 0 ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${diagnosis.title}</div>
                    <div class="gf-compact-sub">${diagnosis.summary}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip">${text('合同', 'Contract')} · ${diagnosis.contractId}</span>
                        ${diagnosis.powerGap > 0 ? `<span class="gf-chip is-warning">${text('差距', 'Gap')} · ${formatCompact(diagnosis.powerGap)}</span>` : `<span class="gf-chip is-success">${text('已够线', 'Ready')}</span>`}
                        <span class="gf-chip">${text('免费路线', 'Free')} · ${diagnosis.freeShort}</span>
                        <span class="gf-chip is-strong">${localize(offer.name)}</span>
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${diagnosis.powerGap > 0 ? `-${formatCompact(diagnosis.powerGap)}` : text('Ready', 'Ready')}</strong>
                    <div class="gf-action-row">
                        <button class="primary-btn" type="button" data-action="openPayment" data-value="${offer.id}">${text('打开礼包', 'Open Pack')}</button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="${diagnosis.freeTab}">${diagnosis.freeLabel}</button>
                    </div>
                </div>
            </article>
        `;
    }

    function getVisibleShopItems(limit = 3) {
        const recommendedItemId = getRecommendedShopItemId();
        const candidates = config.shopItems.filter((item) => item.id !== 'dailySupply');
        const visible = [];
        const seen = new Set();

        function push(item) {
            if (!item || seen.has(item.id) || visible.length >= limit) return;
            seen.add(item.id);
            visible.push(item);
        }

        push(candidates.find((item) => item.id === recommendedItemId));
        candidates.filter((item) => isShopItemReady(item.id)).forEach(push);
        candidates.forEach(push);
        return visible;
    }
    function renderShopTab() {
        const sponsorTier = getSponsorTier();
        const milestoneViews = config.paymentMilestones.map((milestone) => getMilestoneView(milestone));
        const claimableMilestones = milestoneViews.filter((item) => item.claimable);
        const readyShopItems = config.shopItems.filter((item) => isShopItemReady(item.id));
        const activePaymentCard = renderActivePaymentCard();
        const growthDiagnosisCard = renderGrowthDiagnosisCard();
        const milestoneSummary = getMilestoneSummary();
        const recommendedItemId = getRecommendedShopItemId();
        const recommendedItem = config.shopItems.find((item) => item.id === recommendedItemId);
        const recommendedOffer = config.paymentOffers.find((item) => item.id === getRecommendedPaymentOfferId()) || config.paymentOffers[0];
        const visibleMilestones = [...claimableMilestones, ...milestoneViews.filter((item) => !item.claimed && !item.claimable).slice(0, 1)].slice(0, 2);
        const visibleShopItems = getVisibleShopItems(3);
        const dailySupply = config.shopItems.find((item) => item.id === 'dailySupply');
        const dailyReady = isDailySupplyReady();
        const dailyAction = dailyReady
            ? { action: 'claimDailySupply', value: '', label: text('免费领取', 'Claim Free'), cls: 'primary-btn' }
            : { action: 'openPayment', value: recommendedOffer.id, label: text('去补给', 'Open Top-Up'), cls: 'ghost-btn' };
        const sponsorAction = milestoneSummary.claimableCount > 0
            ? { action: 'claimAllMilestones', value: '', label: text('领取里程碑', 'Claim Milestones'), cls: 'primary-btn' }
            : { action: 'openPayment', value: recommendedOffer.id, label: text('打开推荐礼包', 'Open Pack'), cls: 'primary-btn' };

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('商店', 'Shop'),
                '',
                `<div class="gf-chip">${text('可回收入口', 'Ready Sources')} · ${readyShopItems.length + claimableMilestones.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card gf-shop-card ${dailyReady ? 'is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('每日免费', 'Daily Free')}</div>
                            <div class="gf-card-title">${text('每日引火箱', 'Daily Spark Box')}</div>
                        </div>
                        <div class="gf-card-number">${dailyReady ? text('免费', 'Free') : formatDurationCompact(getDailySupplyRemainingMs())}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${dailySupply ? renderRewardChips(dailySupply.reward, { limit: 3 }) : ''}
                        <span class="gf-chip is-success">${text('焦点碎片', 'Focus Shards')} +4</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${dailyReady ? text('当前可直接领取。', 'Ready to claim now.') : text('20 小时刷新一次。', 'Refreshes every 20 hours.')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${dailyAction.cls}" type="button" data-action="${dailyAction.action}" data-value="${dailyAction.value}">${dailyAction.label}</button>
                    </div>
                </article>
                <article class="gf-card gf-shop-card ${milestoneSummary.claimableCount > 0 ? 'is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助与里程碑', 'Sponsor & Milestones')}</div>
                            <div class="gf-card-title">${localize(sponsorTier.title)}</div>
                        </div>
                        <div class="gf-card-number">$${Number(state.save.payment.totalSpent || 0).toFixed(2)}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${text('可领', 'Ready')} · ${milestoneSummary.claimableCount}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${milestoneSummary.nextThreshold > 0 ? `$${milestoneSummary.nextThreshold.toFixed(2)}` : text('已满', 'Maxed')}</span>
                        <span class="gf-chip">${text('还差', 'Gap')} · ${milestoneSummary.nextThreshold > 0 ? `$${milestoneSummary.nextGap.toFixed(2)}` : '0'}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} +${formatCompact(sponsorTier.heatCapBonus)}</span>
                        <span class="gf-chip">${text('稀有率', 'Rare Rate')} +${formatPercent(sponsorTier.rareRateBonus)}</span>
                        <span class="gf-chip">${text('熔尘回收', 'Dust')} +${formatPercent(sponsorTier.dustYieldBonus)}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${sponsorAction.cls}" type="button" data-action="${sponsorAction.action}" data-value="${sponsorAction.value}">${sponsorAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${activePaymentCard || ''}
                ${growthDiagnosisCard}
                ${visibleMilestones.map((item) => `
                    <article class="gf-compact-row ${item.claimable ? 'is-ready' : ''}">
                        <div class="gf-compact-main">
                            <div class="gf-compact-title">${text('里程碑', 'Milestone')} · $${item.threshold.toFixed(2)}</div>
                            <div class="gf-compact-sub">${item.claimable ? text('本档已可领取，先收下再决定是否继续冲下一档。', 'This tier is ready. Claim it first, then decide whether to top up further.') : text('这里给的是额外资源和永久加成，适合在卡点时跨一档拿。', 'This tier adds extra resources and permanent stats, ideal for breaking a wall.')}</div>
                            <div class="gf-chip-row">
                                ${renderRewardChips(item.reward, { limit: 2 })}
                                ${renderPermanentChips(item.permanent, { limit: 2 })}
                            </div>
                        </div>
                        <div class="gf-compact-side">
                            <strong>${item.claimed ? text('已领', 'Claimed') : item.claimable ? text('可领', 'Ready') : text('未达', 'Pending')}</strong>
                            <button class="${item.claimable ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${item.claimable ? 'claimMilestone' : 'openPayment'}" data-value="${item.claimable ? item.id : milestoneSummary.recommendedOfferId}">${item.claimable ? text('领取', 'Claim') : text('去补', 'Top Up')}</button>
                        </div>
                    </article>
                `).join('')}
                ${renderPaymentOffer(recommendedOffer)}
                ${recommendedItem && recommendedItem.id !== 'dailySupply' ? renderShopItemRow(recommendedItem) : ''}
                ${visibleShopItems.filter((item) => !recommendedItem || item.id !== recommendedItem.id).map(renderShopItemRow).join('')}
            </div>
        `;
    }
    function renderShopItemRow(item) {
        const ready = isShopItemReady(item.id);
        const locked = !!item.requiresSponsor && !state.save.payment.passUnlocked;
        const price = getShopPrice(item.id);
        const fallback = item.priceType === 'dust'
            ? { tab: 'forge', label: text('去拿熔尘', 'Get Dust') }
            : { tab: 'contracts', label: text('去拿金币', 'Get Gold') };
        const action = locked
            ? { action: 'openPayment', value: getRecommendedPaymentOfferId(), label: text('开赞助', 'Unlock Sponsor'), cls: 'ghost-btn' }
            : ready
                ? { action: item.free ? 'claimDailySupply' : 'buyShopItem', value: item.id, label: item.free ? text('领取', 'Claim') : text('购买', 'Buy'), cls: item.free ? 'primary-btn' : 'ghost-btn' }
                : { action: 'openTab', value: fallback.tab, label: fallback.label, cls: 'ghost-btn' };
        const priceLabel = item.free
            ? text('免费', 'Free')
            : `${formatCompact(price)} ${item.priceType === 'gold' ? 'G' : 'D'}`;
        const summary = locked
            ? text('开通赞助后再买这类中后期补给。', 'Unlock sponsor before buying this mid-late supply.')
            : ready
                ? text('资源已够，可直接补当前短板。', 'Resources are ready. Patch the current shortage directly.')
                : item.priceType === 'gold'
                    ? text('金币不够时先去合同推进。', 'Push contracts first when gold is short.')
                    : text('熔尘不够时先回熔炉。', 'Return to Forge when dust is short.');

        return `
            <article class="gf-compact-row ${ready && !locked ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(item.title)}</div>
                    <div class="gf-compact-sub">${summary}</div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(item.reward, { limit: 3 })}
                        ${locked ? `<span class="gf-chip is-warning">${text('需赞助', 'Sponsor')}</span>` : ''}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${priceLabel}</strong>
                    <button class="${action.cls}" type="button" data-action="${action.action}" data-value="${action.value}">${action.label}</button>
                </div>
            </article>
        `;
    }
    function renderPaymentOffer(offer) {
        const projected = getProjectedOfferImpact(offer);
        return `
            <article class="gf-compact-row ${projected.powerGain > 0 ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(offer.name)}</div>
                    <div class="gf-compact-sub">${projected.currentGap > projected.projectedGap
                        ? text(`预计缩小差距 ${formatCompact(projected.currentGap - projected.projectedGap)}，并立即补一波资源。`, `Cuts the gap by ${formatCompact(projected.currentGap - projected.projectedGap)} and instantly refills resources.`)
                        : text('直接补金币 / 熔尘 / 催化，并抬升常驻赞助属性。', 'Directly refills gold / dust / catalyst and raises permanent sponsor stats.')}</div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(offer.reward, { limit: 3 })}
                        <span class="gf-chip is-strong">${text('战力', 'Power')} +${formatCompact(projected.powerGain)}</span>
                        ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text('预计推进', 'Reach')} +${projected.reachGain}</span>` : ''}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>$${offer.price.toFixed(2)}</strong>
                    <button class="primary-btn" type="button" data-action="buyOffer" data-value="${offer.id}">${text('链上支付', 'Pay')}</button>
                </div>
            </article>
        `;
    }
    function renderGemRow(row) {
        const family = familyMap[row.familyId];
        const recycleDust = getRecycleDustValue(row.tier, 1);
        const safeKeep = getSmartRecycleKeepCount(row.familyId, row.tier);
        const safeOverflow = Number.isFinite(safeKeep) ? Math.max(0, row.count - safeKeep) : 0;
        return `
            <div class="gf-list-row">
                <div class="gf-list-copy">
                    <div class="gf-gem-badge">
                        <i class="gf-gem-dot" style="color:${family.accent}; background:${family.accent};"></i>
                        <div class="gf-list-title">${localize(family.name)} · T${row.tier}</div>
                    </div>
                    <div class="gf-list-sub">${text(`库存 ${row.count} · 觉醒 ${row.awakened} · 单颗战力 ${formatCompact(row.score)}`, `Owned ${row.count} · Awakened ${row.awakened} · ${formatCompact(row.score)} power each`)}</div>
                </div>
                    ${safeOverflow > 0 ? `<div class="gf-list-sub">${text(`智能回收会保留 ${safeKeep} 颗，本行还可安全回收 ${safeOverflow} 颗。`, `Smart recycle keeps ${safeKeep}. ${safeOverflow} more can be safely recycled here.`)}</div>` : ''}
                <div class="gf-row-actions">
                    <button class="ghost-btn" type="button" data-action="salvageGem" data-value="${row.key}" ${row.count > 0 && recycleDust > 0 ? '' : 'disabled'}>${text(`回收 1 · +${formatCompact(recycleDust)} 尘`, `Recycle 1 · +${formatCompact(recycleDust)} dust`)}</button>
                    <button class="ghost-btn" type="button" data-action="fuseGem" data-value="${row.key}" ${row.canFuse ? '' : 'disabled'}>${text('3 合 1', 'Fuse 3 → 1')}</button>
                    <button class="primary-btn" type="button" data-action="awakenGem" data-value="${row.key}" ${row.canAwaken ? '' : 'disabled'}>${text('觉醒', 'Awaken')}</button>
                </div>
            </div>
        `;
    }

    function renderCompactGemActionRow(row) {
        const family = familyMap[row.familyId];
        const recycleDust = getRecycleDustValue(row.tier, 1);
        return `
            <article class="gf-compact-row">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">
                        <i class="gf-gem-dot" style="color:${family.accent}; background:${family.accent};"></i>
                        ${localize(family.name)} · T${row.tier}
                    </div>
                    <div class="gf-compact-sub">${text(`库存 ${row.count} · 觉醒 ${row.awakened}`, `Owned ${row.count} · Awakened ${row.awakened}`)}</div>
                </div>
                <div class="gf-compact-side">
                    <div class="gf-chip-row">
                        ${row.canFuse ? `<span class="gf-chip is-success">${text('可合成', 'Fuse Ready')}</span>` : ''}
                        ${row.canAwaken ? `<span class="gf-chip is-warning">${text('可觉醒', 'Awaken Ready')}</span>` : ''}
                    </div>
                    <div class="gf-action-row">
                        <button class="ghost-btn" type="button" data-action="salvageGem" data-value="${row.key}">${text(`回收 +${formatCompact(recycleDust)}`, `Recycle +${formatCompact(recycleDust)}`)}</button>
                        <button class="ghost-btn" type="button" data-action="fuseGem" data-value="${row.key}">${text('合成', 'Fuse')}</button>
                        <button class="primary-btn" type="button" data-action="awakenGem" data-value="${row.key}">${text('觉醒', 'Awaken')}</button>
                    </div>
                </div>
            </article>
        `;
    }

    function getForgeCollectorScore(saveSnapshot = state.save) {
        const relics = Array.isArray(saveSnapshot.forgeRelics) ? saveSnapshot.forgeRelics : [];
        return relics.reduce((sum, relic) => {
            const rarityWeight = getForgeRelicRarityWeight(relic.rarity);
            return sum + Math.round((Number(relic.score) || 0) * (0.9 + rarityWeight * 0.45));
        }, 0);
    }

    function getForgeCollectorTier(score = getForgeCollectorScore()) {
        if (score >= 22000) return { zh: '圣座馆长', en: 'Throne Curator' };
        if (score >= 12000) return { zh: '星核馆长', en: 'Star Curator' };
        if (score >= 5600) return { zh: '传奇鉴藏者', en: 'Legend Collector' };
        if (score >= 1800) return { zh: '高阶鉴藏者', en: 'Senior Collector' };
        if (score >= 600) return { zh: '熔炉鉴藏者', en: 'Forge Collector' };
        return { zh: '新晋藏家', en: 'Rookie Collector' };
    }

    function getForgeRelicBreakdown(saveSnapshot = state.save) {
        const relics = Array.isArray(saveSnapshot.forgeRelics) ? saveSnapshot.forgeRelics : [];
        const byRarity = { rare: 0, epic: 0, legend: 0, mythic: 0 };
        const byFamily = { ember: 0, tide: 0, volt: 0, void: 0 };
        let topScore = 0;
        relics.forEach((relic) => {
            if (Object.prototype.hasOwnProperty.call(byRarity, relic.rarity)) byRarity[relic.rarity] += 1;
            if (Object.prototype.hasOwnProperty.call(byFamily, relic.familyId)) byFamily[relic.familyId] += 1;
            topScore = Math.max(topScore, Number(relic.score) || 0);
        });
        return {
            byRarity,
            byFamily,
            topScore,
            total: relics.length,
            collectorScore: getForgeCollectorScore(saveSnapshot)
        };
    }

    function getForgeRelicQualityLabel(qualityId = '') {
        switch (qualityId) {
            case 'perfect': return text('完美控火', 'Perfect Control');
            case 'great': return text('精准控火', 'Precise Control');
            case 'good': return text('稳定控火', 'Stable Control');
            case 'rough': return text('擦边收炉', 'Rough Lock');
            case 'unstable':
            default: return text('过热收炉', 'Overheat Lock');
        }
    }

    function getForgeTopRelics(limit = 3, saveSnapshot = state.save) {
        const relics = Array.isArray(saveSnapshot.forgeRelics) ? saveSnapshot.forgeRelics.slice() : [];
        return relics
            .sort((left, right) => {
                const rarityGap = getForgeRelicRarityWeight(right.rarity) - getForgeRelicRarityWeight(left.rarity);
                if (rarityGap !== 0) return rarityGap;
                return Number(right.score || 0) - Number(left.score || 0);
            })
            .slice(0, Math.max(0, limit));
    }

    function getRelicChaseClaimKey(contractId, chaseId) {
        return `${String(contractId || '0')}::${String(chaseId || 'focus')}`;
    }

    function getRelicCountByFamilies(familyIds = [], options = {}, saveSnapshot = state.save) {
        const relics = Array.isArray(saveSnapshot.forgeRelics) ? saveSnapshot.forgeRelics : [];
        const minRarityWeight = Number(options.minRarityWeight || 1);
        return relics.filter((relic) => familyIds.includes(relic.familyId) && getForgeRelicRarityWeight(relic.rarity) >= minRarityWeight).length;
    }

    function getRelicScoreByFamilies(familyIds = [], saveSnapshot = state.save) {
        const relics = Array.isArray(saveSnapshot.forgeRelics) ? saveSnapshot.forgeRelics : [];
        return relics
            .filter((relic) => familyIds.includes(relic.familyId))
            .reduce((sum, relic) => sum + Math.round(Number(relic.score || 0)), 0);
    }

    function getRelicChaseDefinitions(contract = getCurrentContract(), saveSnapshot = state.save) {
        const stage = Math.max(0, Number(saveSnapshot.bestContractIndex || 0));
        const focusFamilies = (contract.focus || []).slice(0, 2);
        const focusLabel = focusFamilies.map((familyId) => localize(familyMap[familyId]?.name)).join(' / ') || text('焦点家族', 'Focus Lines');
        const collectorGoal = 900 + stage * 260;
        return [
            {
                id: 'focusRack',
                title: text('焦点开柜', 'Focus Rack'),
                desc: text(`优先收集 ${focusLabel} 的珍藏，先把本章展柜立起来。`, `Collect relics from ${focusLabel} first to establish this chapter's showcase.`),
                target: 2,
                progress: getRelicCountByFamilies(focusFamilies, {}, saveSnapshot),
                reward: { gold: 460 + stage * 110, dust: 28 + stage * 8, seasonXp: 36 + stage * 8 },
                permanent: null,
                readyTab: 'forge'
            },
            {
                id: 'focusEpic',
                title: text('高阶藏品', 'Premium Piece'),
                desc: text(`打出 1 件 ${focusLabel} 史诗及以上珍藏，拉开和普通熔炼的差距。`, `Drop 1 epic-or-better relic from ${focusLabel} to create a clear premium spike.`),
                target: 1,
                progress: getRelicCountByFamilies(focusFamilies, { minRarityWeight: 2 }, saveSnapshot),
                reward: { catalyst: 3 + Math.floor(stage / 2), seasonXp: 72 + stage * 10 },
                permanent: { rareRate: Number((0.003 + stage * 0.0003).toFixed(4)) },
                readyTab: 'forge'
            },
            {
                id: 'collectorScore',
                title: text('馆长陈列', 'Curator Display'),
                desc: text(`把 ${focusLabel} 的收藏分推到 ${formatCompact(collectorGoal)}，形成这一章的炫耀资本。`, `Push ${focusLabel} collector score to ${formatCompact(collectorGoal)} to build a brag-worthy chapter display.`),
                target: collectorGoal,
                progress: getRelicScoreByFamilies(focusFamilies, saveSnapshot),
                reward: { gold: 980 + stage * 180, dust: 64 + stage * 14, catalyst: 4 + Math.floor(stage / 3), seasonXp: 120 + stage * 12 },
                permanent: { heatCap: 1 + Math.floor(stage / 3), dustYield: Number((0.003 + stage * 0.00035).toFixed(4)) },
                readyTab: 'forge'
            }
        ];
    }

    function getRelicChaseViews(contract = getCurrentContract(), saveSnapshot = state.save) {
        return getRelicChaseDefinitions(contract, saveSnapshot).map((item) => {
            const claimKey = getRelicChaseClaimKey(contract.id, item.id);
            const claimed = !!saveSnapshot.relicChaseClaims?.[claimKey];
            const progress = Math.min(item.target, Math.max(0, Number(item.progress || 0)));
            const claimable = !claimed && progress >= item.target;
            return {
                ...item,
                contractId: contract.id,
                claimKey,
                claimed,
                claimable,
                progress,
                progressRate: item.target > 0 ? Math.min(1, progress / item.target) : 1
            };
        });
    }

    function claimRelicChase(claimKey) {
        const contract = getCurrentContract();
        const view = getRelicChaseViews(contract).find((item) => item.claimKey === claimKey);
        if (!view) return showToast(text('当前没有可领取的珍藏追逐奖励。', 'This relic chase reward is not available right now.'), 'warning');
        if (view.claimed) return showToast(text('这档珍藏追逐奖励已经领过了。', 'This relic chase reward has already been claimed.'), 'warning');
        if (!view.claimable) return showToast(text('还没达到这档珍藏追逐目标。', 'This relic chase target is not reached yet.'), 'warning');
        grantReward(view.reward);
        applyPermanentBonus(view.permanent);
        state.save.relicChaseClaims[view.claimKey] = true;
        state.save.lastResult = {
            type: 'relicChase',
            title: text(`珍藏追逐完成 · ${view.title}`, `Relic Chase Complete · ${view.title}`),
            copy: text(`已完成 ${view.title}，奖励和永久增益已经到账。继续控火，可以顺着当前焦点家族继续冲更高档珍藏。`, `Completed ${view.title}. Rewards and permanent bonuses are already granted. Keep controlling the forge to push even higher relics in the current focus lines.`),
            tags: [view.title, contract.id, text('已领奖', 'Claimed')],
            reward: view.reward,
            permanent: view.permanent
        };
        showToast(text(`已领取 ${view.title} 奖励。`, `Claimed ${view.title} reward.`), 'claim');
        saveProgress();
        renderAll();
    }

    function renderRelicCompactRow(relic, rank = 0) {
        const family = familyMap[relic.familyId];
        const title = localize(relic.title);
        return `
            <article class="gf-compact-row gf-relic-row is-${relic.rarity}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">
                        <i class="gf-gem-dot" style="color:${family?.accent || '#fff'}; background:${family?.accent || '#fff'};"></i>
                        ${title}
                        <span class="gf-relic-rarity is-${relic.rarity}">${getForgeRelicRarityLabel(relic.rarity)}</span>
                    </div>
                    <div class="gf-compact-sub">${text(`第 ${rank + 1} 展位 · ${localize(family?.name)} 系 · ${getForgeRelicQualityLabel(relic.qualityId)}`, `Slot ${rank + 1} · ${localize(family?.name)} line · ${getForgeRelicQualityLabel(relic.qualityId)}`)}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip is-strong">T${relic.tier}</span>
                        ${renderRewardChips(relic.reward, { limit: 2 })}
                        ${renderPermanentChips(relic.permanent, { limit: 2 })}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${formatCompact(relic.score)}</strong>
                    <span class="gf-mini-label">${text('收藏分', 'Score')}</span>
                </div>
            </article>
        `;
    }

    function renderRelicCabinetCard() {
        const summary = getForgeRelicSummary();
        const breakdown = getForgeRelicBreakdown();
        const topRelics = getForgeTopRelics(3);
        const collectorTier = localize(getForgeCollectorTier(breakdown.collectorScore));
        const bestFamily = Object.entries(breakdown.byFamily)
            .sort((left, right) => right[1] - left[1])[0];
        const bestFamilyLabel = bestFamily && bestFamily[1] > 0
            ? `${localize(familyMap[bestFamily[0]]?.name)} x${bestFamily[1]}`
            : text('尚未成柜', 'No dominant line yet');

        return `
            <article class="gf-list-card gf-relic-cabinet">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('珍藏展柜', 'Relic Cabinet')}</div>
                        <div class="gf-card-title">${collectorTier}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(breakdown.collectorScore)}</div>
                </div>
                ${renderKpiGrid([
                    { label: text('收藏分', 'Collector Score'), value: formatCompact(breakdown.collectorScore) },
                    { label: text('最高单件', 'Top Piece'), value: formatCompact(breakdown.topScore) },
                    { label: text('神话/传说', 'Mythic/Legend'), value: `${formatCompact(breakdown.byRarity.mythic)}/${formatCompact(breakdown.byRarity.legend)}` },
                    { label: text('主力系列', 'Main Line'), value: bestFamilyLabel }
                ])}
                <div class="gf-chip-row" style="margin-top:12px;">
                    <span class="gf-chip is-success">${text('珍稀', 'Rare')} · ${formatCompact(breakdown.byRarity.rare)}</span>
                    <span class="gf-chip is-success">${text('史诗', 'Epic')} · ${formatCompact(breakdown.byRarity.epic)}</span>
                    <span class="gf-chip is-strong">${text('传说', 'Legend')} · ${formatCompact(breakdown.byRarity.legend)}</span>
                    <span class="gf-chip is-strong">${text('神话', 'Mythic')} · ${formatCompact(breakdown.byRarity.mythic)}</span>
                    <span class="gf-chip">${text('当前保底', 'Current Pity')} · ${formatCompact(summary.pityRemain)}</span>
                </div>
                <div class="gf-list gf-list--compact" style="margin-top:12px;">
                    ${topRelics.length
                        ? topRelics.map((relic, index) => renderRelicCompactRow(relic, index)).join('')
                        : `<div class="gf-empty">${text(`珍藏还没开张。优先打出“精准 / 完美控火”，当前再过 ${summary.pityRemain} 次至少会补出一件珍藏。`, `No relics yet. Aim for Great or Perfect control. In ${summary.pityRemain} more attempts, pity will guarantee a relic.`)}</div>`}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}">${state.forgeTiming.active ? text('定点收炉', 'Lock Result') : text('继续冲珍藏', 'Chase Relics')}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="shop">${text('看赞助增益', 'View Sponsor Boost')}</button>
                </div>
            </article>
        `;
    }

    function renderRelicChaseRow(view) {
        const action = view.claimed
            ? { label: text('已领取', 'Claimed'), action: 'openTab', value: 'forge', cls: 'ghost-btn' }
            : view.claimable
                ? { label: text('领取', 'Claim'), action: 'claimRelicChase', value: view.claimKey, cls: 'primary-btn' }
                : { label: text('继续冲', 'Keep Pushing'), action: 'openTab', value: view.readyTab || 'forge', cls: 'ghost-btn' };
        return `
            <article class="gf-compact-row ${view.claimable ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${view.title}</div>
                    <div class="gf-compact-sub">${view.desc}</div>
                    <div class="gf-progress gf-progress--small"><i style="width:${(view.progressRate * 100).toFixed(2)}%;"></i></div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(view.reward, { limit: 3 })}
                        ${renderPermanentChips(view.permanent, { limit: 2 })}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${formatCompact(view.progress)}/${formatCompact(view.target)}</strong>
                    <button class="${action.cls}" type="button" data-action="${action.action}" data-value="${action.value}">${action.label}</button>
                </div>
            </article>
        `;
    }

    function renderRelicChaseCard(contract = getCurrentContract()) {
        const views = getRelicChaseViews(contract);
        const claimableCount = views.filter((item) => item.claimable).length;
        const claimedCount = views.filter((item) => item.claimed).length;
        return `
            <article class="gf-list-card gf-relic-chase-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('珍藏追逐', 'Relic Chase')}</div>
                        <div class="gf-card-title">${text('把当前焦点家族做成这一章的招牌展柜', 'Turn the current focus lines into this chapter’s signature cabinet')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(claimedCount)}/${formatCompact(views.length)}</div>
                </div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    <span class="gf-chip is-strong">${text('当前合同', 'Current Contract')} · ${contract.id}</span>
                    <span class="gf-chip">${text('已完成', 'Completed')} · ${formatCompact(claimedCount)}</span>
                    <span class="gf-chip ${claimableCount > 0 ? 'is-success' : ''}">${text('可领取', 'Ready')} · ${formatCompact(claimableCount)}</span>
                </div>
                <div class="gf-list gf-list--compact" style="margin-top:12px;">
                    ${views.map(renderRelicChaseRow).join('')}
                </div>
            </article>
        `;
    }

    function renderMissionCompactRow(mission) {
        const route = getMissionRoute(mission.id);
        return `
            <article class="gf-compact-row ${mission.claimable ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${mission.title}</div>
                    <div class="gf-compact-sub">${getMissionDesc(mission.id)}</div>
                    <div class="gf-progress gf-progress--small"><i style="width:${(mission.progressRate * 100).toFixed(2)}%;"></i></div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(mission.reward, { limit: 3 })}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${mission.progress}/${mission.target}</strong>
                    <button class="${mission.claimable ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${mission.claimable ? 'claimMission' : 'openTab'}" data-value="${mission.claimable ? mission.id : route.tab}">${mission.claimable ? text('领取', 'Claim') : route.label}</button>
                </div>
            </article>
        `;
    }

    function renderSeasonCompactRow(node, sponsor = false) {
        const gapXp = Math.max(0, Number(node.xp || 0) - Number(state.save.seasonXp || 0));
        const action = node.claimable
            ? { action: sponsor ? 'claimSponsorSeason' : 'claimSeason', value: node.id, label: text('领取', 'Claim'), cls: 'primary-btn' }
            : sponsor && !state.save.payment.passUnlocked
                ? { action: 'openTab', value: 'shop', label: text('去开赞助', 'Unlock Sponsor'), cls: 'ghost-btn' }
                : { action: 'openTab', value: gapXp > 0 ? 'forge' : 'season', label: gapXp > 0 ? text('去拿 XP', 'Get XP') : text('查看', 'View'), cls: 'ghost-btn' };
        return `
            <article class="gf-compact-row ${node.claimable ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${sponsor ? text('赞助轨', 'Sponsor') : text('免费轨', 'Free')} · ${node.id}</div>
                    <div class="gf-compact-sub">${node.claimed
                        ? text('该节点已领取。', 'This node is already claimed.')
                        : sponsor && !state.save.payment.passUnlocked
                            ? text('先开赞助，再领这条赛季奖励。', 'Unlock sponsor first to claim this reward.')
                            : gapXp > 0
                                ? text(`还差 ${formatCompact(gapXp)} XP。`, `${formatCompact(gapXp)} XP remaining.`)
                                : text('当前节点可立即领取。', 'This node is ready to claim.')}</div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(node.reward, { limit: 3 })}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${node.claimed ? text('已领', 'Claimed') : node.claimable ? text('可领', 'Ready') : `${formatCompact(node.xp)} XP`}</strong>
                    <button class="${node.claimed ? 'ghost-btn' : action.cls}" type="button" data-action="${node.claimed ? 'openTab' : action.action}" data-value="${node.claimed ? 'season' : action.value}">${node.claimed ? text('已完成', 'Done') : action.label}</button>
                </div>
            </article>
        `;
    }

    function getVisibleContractViews(limit = 4) {
        const effectivePower = getEffectiveContractPower();
        const all = config.contracts.map((contract, index) => {
            const unlocked = index <= state.save.bestContractIndex;
            const selected = index === state.save.contractIndex;
            const cleared = index < state.save.bestContractIndex;
            const preview = index === state.save.bestContractIndex + 1;
            const powerGap = Math.max(0, contract.recommended - effectivePower);
            return { contract, index, unlocked, selected, cleared, preview, powerGap };
        });
        const visible = [];
        const seen = new Set();

        function pushIndex(index) {
            if (!Number.isFinite(index) || index < 0 || index >= all.length || seen.has(index) || visible.length >= limit) return;
            seen.add(index);
            visible.push(all[index]);
        }

        pushIndex(state.save.contractIndex);
        pushIndex(state.save.bestContractIndex + 1);
        pushIndex(state.save.bestContractIndex);
        pushIndex(state.save.bestContractIndex - 1);
        all.forEach((entry) => {
            if (visible.length >= limit) return;
            if (entry.unlocked || entry.preview) pushIndex(entry.index);
        });

        return {
            visible,
            totalRelevant: all.filter((entry) => entry.unlocked || entry.preview).length
        };
    }

    function renderContractCompactRow(entry) {
        const { contract, index, unlocked, selected, cleared, preview, powerGap } = entry;
        const focusLabel = contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ');
        const action = selected
            ? { action: 'runContract', value: index, label: text('执行', 'Run'), cls: 'primary-btn' }
            : { action: 'selectContract', value: index, label: unlocked ? text('设目标', 'Set Target') : text('预设下一档', 'Set Next'), cls: 'ghost-btn' };
        const statusLabel = selected
            ? text('当前', 'Current')
            : preview
                ? text('下一档', 'Next')
                : cleared
                    ? text('已通', 'Cleared')
                    : unlocked
                        ? text('开放', 'Open')
                        : text('锁定', 'Locked');
        const summary = !unlocked && preview
            ? text(`通关上一档后正式开启，焦点为 ${focusLabel}。`, `Unlocks after clearing the previous stage. Focus: ${focusLabel}.`)
            : powerGap > 0
                ? text(`还差 ${formatCompact(powerGap)} 有效战力，优先补 ${focusLabel}。`, `Need ${formatCompact(powerGap)} more effective power. Focus ${focusLabel} first.`)
                : text('已经够线，可直接执行并拿走本档奖励。', 'You are on the line. Run now and collect this stage reward.');

        return `
            <article class="gf-compact-row ${selected || (unlocked && powerGap <= 0) ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${contract.id} · ${localize(contract.name)}</div>
                    <div class="gf-compact-sub">${summary}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip is-strong">${statusLabel}</span>
                        ${contract.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                        ${renderRewardChips(getContractPreviewReward(contract), { limit: 2 })}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${powerGap > 0 ? `-${formatCompact(powerGap)}` : text('Ready', 'Ready')}</strong>
                    <button class="${action.cls}" type="button" data-action="${action.action}" data-value="${action.value}">${action.label}</button>
                </div>
            </article>
        `;
    }

    function renderMiniSlotCard(item) {
        const family = item.sigil ? familyMap[item.sigil.family] : null;
        const locked = item.slotId === 'resonance' && state.save.bestContractIndex < 2;
        return `
            <article class="gf-mini-slot ${locked ? 'is-locked' : ''} ${item.level > 0 ? 'is-equipped' : ''}">
                <span>${getSlotName(item.slotId)}</span>
                <strong>${locked ? text('未开', 'Locked') : item.sigil ? localize(item.sigil.name) : text('空槽', 'Empty')}</strong>
                <small>${locked
                    ? text('推进到 1-3 开启', 'Unlock at 1-3')
                    : item.sigil
                        ? `Lv.${item.level} · ${localize(family.name)}`
                        : text('装同槽符印', 'Equip a matching sigil')}</small>
            </article>
        `;
    }

    function renderSigilCompactRow(sigil) {
        const level = getSigilLevel(sigil.id);
        const unlocked = level > 0;
        const equipped = state.save.selectedSigils.includes(sigil.id);
        const slotLocked = sigil.slot === 'resonance' && state.save.bestContractIndex < 2;
        const shardOwned = getSigilShardCount(sigil.id);
        const upgradeCost = getSigilUpgradeCost(sigil.id);
        const focus = getCurrentContract().focus.includes(sigil.family);
        const primaryLabel = unlocked
            ? (level >= 8
                ? text('已满', 'Maxed')
                : text(`升 ${formatCompact(upgradeCost.gold)}G`, `Up ${formatCompact(upgradeCost.gold)}G`))
            : text(`解 ${formatCompact(sigil.shardUnlock)}`, `Unlock ${formatCompact(sigil.shardUnlock)}`);
        const detail = unlocked
            ? text(`碎片 ${formatCompact(shardOwned)}/${formatCompact(upgradeCost.shards)} · 金币 ${formatCompact(state.save.gold)}/${formatCompact(upgradeCost.gold)}`, `Shards ${formatCompact(shardOwned)}/${formatCompact(upgradeCost.shards)} · Gold ${formatCompact(state.save.gold)}/${formatCompact(upgradeCost.gold)}`)
            : text(`碎片 ${formatCompact(shardOwned)}/${formatCompact(sigil.shardUnlock)} · ${getSlotName(sigil.slot)}`, `Shards ${formatCompact(shardOwned)}/${formatCompact(sigil.shardUnlock)} · ${getSlotName(sigil.slot)}`);

        return `
            <article class="gf-compact-row ${equipped || focus ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(sigil.name)} · ${localize(familyMap[sigil.family].name)}</div>
                    <div class="gf-compact-sub">${detail}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip">${getSlotName(sigil.slot)}</span>
                        <span class="gf-chip">${text('战力', 'Power')} · ${formatCompact(getSigilPower(sigil.id))}</span>
                        ${focus ? `<span class="gf-chip is-success">${text('本章焦点', 'Focus')}</span>` : ''}
                        ${equipped ? `<span class="gf-chip is-strong">${text('已装', 'Equipped')}</span>` : ''}
                        ${slotLocked ? `<span class="gf-chip is-warning">${text('槽位未开', 'Slot Locked')}</span>` : ''}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${unlocked ? `Lv.${level}` : text('未解', 'Locked')}</strong>
                    <div class="gf-action-row">
                        <button class="ghost-btn" type="button" data-action="equipSigil" data-value="${sigil.id}">${equipped ? text('已装', 'Equipped') : text('装备', 'Equip')}</button>
                        <button class="primary-btn" type="button" data-action="${unlocked ? 'upgradeSigil' : 'unlockSigil'}" data-value="${sigil.id}">${primaryLabel}</button>
                    </div>
                </div>
            </article>
        `;
    }

    function renderWorkshopCompactRow(item) {
        const level = getWorkshopLevel(item.id);
        const cost = getWorkshopUpgradeCost(item.id);
        const currentEffect = getWorkshopEffect(item.id);
        const nextEffect = getWorkshopEffect(item.id, level + 1);
        const maxed = level >= item.maxLevel;
        const ready = canUpgradeWorkshop(item.id) && !maxed;

        return `
            <article class="gf-compact-row ${ready ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(item.name)} · Lv.${level}</div>
                    <div class="gf-compact-sub">${maxed
                        ? text(`当前效果 ${formatWorkshopEffect(item.id, currentEffect)}，该路线已封顶。`, `Current effect ${formatWorkshopEffect(item.id, currentEffect)}. This line is maxed.`)
                        : text(`当前 ${formatWorkshopEffect(item.id, currentEffect)} → 下级 ${formatWorkshopEffect(item.id, nextEffect)}`, `Current ${formatWorkshopEffect(item.id, currentEffect)} → Next ${formatWorkshopEffect(item.id, nextEffect)}`)}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip">${text('金币', 'Gold')} · ${maxed ? '-' : formatCompact(cost.gold)}</span>
                        <span class="gf-chip">${text('熔尘', 'Dust')} · ${maxed ? '-' : formatCompact(cost.dust)}</span>
                        <span class="gf-chip ${ready ? 'is-success' : maxed ? 'is-strong' : 'is-warning'}">${maxed ? text('已封顶', 'Maxed') : ready ? text('可升级', 'Ready') : text('资源不足', 'Need res')}</span>
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${maxed ? text('已满', 'Maxed') : `Lv.${level + 1}`}</strong>
                    <button class="${ready ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="upgradeWorkshop" data-value="${item.id}">${maxed ? text('已封顶', 'Maxed') : text('升级', 'Upgrade')}</button>
                </div>
            </article>
        `;
    }

    function renderForgeStageCard(options = {}) {
        const contract = options.contract || getCurrentContract();
        const effectivePower = Number(options.effectivePower || 0);
        const gap = Math.max(0, contract.recommended - effectivePower);
        const heatMax = Math.max(1, getHeatMax());
        const heatPercent = Math.min(100, (state.save.heat / heatMax) * 100);
        const t3Remain = Math.max(0, config.forgeBalance.pityTier3Need - state.save.pity.t3);
        const t4Remain = Math.max(0, config.forgeBalance.pityTier4Need - state.save.pity.t4);
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const locked = slotId === 'resonance' && state.save.bestContractIndex < 2;
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, locked, level };
        });
        const slotPills = slotCards.map((item) => ({
            label: getSlotName(item.slotId),
            value: item.locked
                ? text('未开', 'Locked')
                : item.sigil && item.level > 0
                    ? `${localize(item.sigil.name)} Lv.${item.level}`
                    : text('空位', 'Empty')
        }));
        const focusFamilies = contract.focus.map((familyId) => ({
            family: familyMap[familyId],
            total: getFamilyGemCount(familyId),
            awakened: getFamilyAwakenedCount(familyId)
        }));
        const focusAwakened = focusFamilies.reduce((sum, item) => sum + item.awakened, 0);
        const heatEnoughOne = state.save.heat >= SMELT_HEAT_COST;
        const heatEnoughBatch = state.save.heat >= config.forgeBalance.batchSmeltHeatCost;
        const timingOutcome = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer) : getForgeTimingRestingState();
        const relicSummary = getForgeRelicSummary();
        const bestRelicLabel = relicSummary.best
            ? `${getForgeRelicRarityLabel(relicSummary.best.rarity)} ${formatCompact(relicSummary.best.score)}`
            : text('尚未掉落', 'No relic yet');
        const timingNeedleLeft = `${(state.forgeTiming.pointer * 100).toFixed(2)}%`;

        return `
            <article class="gf-card gf-forge-stage">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('熔炉战场', 'Forge Stage')}</div>
                        <div class="gf-card-title">${gap > 0 ? text(`还差 ${formatCompact(gap)} 才能稳过 ${contract.id}`, `${formatCompact(gap)} short of ${contract.id}`) : text(`${contract.id} 已可推进`, `${contract.id} ready`)}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                </div>
                <div class="gf-forge-scene gf-forge-scene--solo">
                    <div class="gf-forge-core-wrap">
                        <div class="gf-forge-core">
                            <span>${text('炉芯热量', 'Core Heat')}</span>
                            <strong>${formatCompact(Math.floor(state.save.heat))}</strong>
                            <small>${heatPercent.toFixed(0)}%</small>
                        </div>
                        <div class="gf-forge-meter-grid">
                            <div class="gf-forge-meter">
                                <span>T3 ${text('保底', 'Pity')}</span>
                                <strong>${t3Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t3 / Math.max(1, config.forgeBalance.pityTier3Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                            <div class="gf-forge-meter">
                                <span>T4 ${text('保底', 'Pity')}</span>
                                <strong>${t4Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t4 / Math.max(1, config.forgeBalance.pityTier4Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                        </div>
                        <div class="gf-forge-control">
                            <div class="gf-forge-control-head">
                                <span>${state.forgeTiming.active ? text('控火进行中', 'Control Live') : text('手动控火', 'Manual Control')}</span>
                                <strong id="gfForgeTimingStatus">${timingOutcome.status}</strong>
                            </div>
                            <button id="gfForgeTimingBar" class="gf-forge-timing-bar ${state.forgeTiming.active ? 'is-active' : ''}" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}" data-quality="${state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer).id : String(state.forgeTiming.lastOutcome || 'idle')}">
                                <span class="gf-forge-timing-zone is-good"></span>
                                <span class="gf-forge-timing-zone is-great"></span>
                                <span class="gf-forge-timing-zone is-perfect"></span>
                                <span class="gf-forge-timing-center"></span>
                                <i id="gfForgeTimingNeedle" class="gf-forge-timing-needle" style="left:${timingNeedleLeft};"></i>
                            </button>
                            <div id="gfForgeTimingHint" class="gf-forge-control-copy">${timingOutcome.hint}</div>
                        </div>
                    </div>
                    <div class="gf-action-row">
                        <button class="primary-btn" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}">${state.forgeTiming.active
                            ? text('定点收炉', 'Lock Result')
                            : (heatEnoughOne ? text('开始控火', 'Start Control') : text(`热量不足 · 还差 ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))}`, `Need ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))} heat`))}</button>
                        <button class="ghost-btn" type="button" data-action="smeltOne">${heatEnoughOne ? text('速熔 1 次', 'Quick Smelt') : text('等待热量', 'Wait Heat')}</button>
                        <button class="ghost-btn" type="button" data-action="smeltBatch">${heatEnoughBatch ? text('批量速熔 x3', 'Batch x3') : text(`批量还差 ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`, `Need ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`)}</button>
                    </div>
                    <div class="gf-inline-grid gf-forge-quick-grid">
                        ${slotPills.map((item) => `
                            <div class="gf-inline-pill">
                                <span>${item.label}</span>
                                <strong>${item.value}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="gf-chip-row gf-forge-badge-strip" style="margin-top:12px;">
                    <span class="gf-chip is-strong">${text('合同', 'Contract')} · ${contract.id}</span>
                    ${focusFamilies.map((item) => `<span class="gf-chip is-success">${localize(item.family.name)} ${formatCompact(item.total)}</span>`).join('')}
                    <span class="gf-chip ${gap > 0 ? 'is-warning' : 'is-success'}">${gap > 0 ? text(`还差 ${formatCompact(gap)}`, `Gap ${formatCompact(gap)}`) : text('已够线', 'Ready')}</span>
                    <span class="gf-chip">${text('觉醒', 'Awaken')} · ${formatCompact(focusAwakened)}</span>
                    <span class="gf-chip">${text('热量恢复', 'Heat Regen')} · ${formatCompact(getHeatRegenPerSecond())}/s</span>
                    <span class="gf-chip is-strong">${text('珍藏柜', 'Relics')} · ${formatCompact(relicSummary.count)}</span>
                    <span class="gf-chip">${text('最佳', 'Best')} · ${bestRelicLabel}</span>
                    <span class="gf-chip ${relicSummary.combo > 0 ? 'is-success' : ''}">${text('连击', 'Streak')} · x${formatCompact(relicSummary.combo)}</span>
                    <span class="gf-chip">${text('珍藏保底', 'Relic Pity')} · ${relicSummary.pityRemain}</span>
                </div>
            </article>
        `;
    }
    function renderSlotCard(item) {
        const slotName = getSlotName(item.slotId);
        const isLocked = item.slotId === 'resonance' && state.save.bestContractIndex < 2;
        const family = item.sigil ? familyMap[item.sigil.family] : null;
        return `
            <article class="gf-slot-card ${item.level > 0 ? 'gf-sigil-card is-equipped' : ''} ${isLocked ? 'is-locked' : ''}">
                <div class="eyebrow">${slotName}</div>
                <div class="gf-card-title">${item.sigil ? localize(item.sigil.name) : text('未装配', 'Empty')}</div>
                <div class="gf-card-copy">${isLocked
                    ? text('第三槽在推进到 1-3 后开启。', 'The third slot opens after reaching 1-3.')
                    : item.sigil
                        ? text(`当前等级 Lv.${item.level}，主系为 ${localize(family.name)}。`, `Current level Lv.${item.level} with ${localize(family.name)} as the main family.`)
                        : text('当前槽位为空，去下方列表里选择匹配槽位的符印。', 'This slot is empty. Pick a matching sigil from the list below.')}</div>
            </article>
        `;
    }

    function renderSigilRow(sigil) {
        const level = getSigilLevel(sigil.id);
        const unlocked = level > 0;
        const equipped = state.save.selectedSigils.includes(sigil.id);
        const slotLocked = sigil.slot === 'resonance' && state.save.bestContractIndex < 2;
        const shardOwned = getSigilShardCount(sigil.id);
        const unlockReady = !unlocked && shardOwned >= sigil.shardUnlock;
        const upgradeCost = getSigilUpgradeCost(sigil.id);
        const upgradeReady = unlocked && level < 8 && state.save.gold >= upgradeCost.gold && shardOwned >= upgradeCost.shards;
        const focus = getCurrentContract().focus.includes(sigil.family);
        return `
            <article class="gf-list-card gf-sigil-card ${equipped ? 'is-equipped' : ''} ${!unlocked ? 'is-locked' : ''}">
                <div class="gf-row-head">
                    <div>
                        <div class="eyebrow">${getSlotName(sigil.slot)} · ${localize(familyMap[sigil.family].name)}</div>
                        <div class="gf-card-title">${localize(sigil.name)} · Lv.${level}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getSigilPower(sigil.id))}</div>
                </div>
                <div class="gf-card-copy">${localize(sigil.effect)}</div>
                <div class="gf-chip-row" style="margin-top:10px;">
                    <span class="gf-chip">${text('碎片', 'Shards')} · ${formatCompact(shardOwned)}</span>
                    ${focus ? `<span class="gf-chip is-success">${text('本章焦点', 'Current Focus')}</span>` : ''}
                    ${equipped ? `<span class="gf-chip is-strong">${text('已装配', 'Equipped')}</span>` : ''}
                    ${slotLocked ? `<span class="gf-chip is-warning">${text('槽位未开', 'Slot Locked')}</span>` : ''}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="ghost-btn" type="button" data-action="equipSigil" data-value="${sigil.id}">${equipped ? text('当前已装', 'Equipped') : text('装到槽位', 'Equip')}</button>
                    <button class="primary-btn" type="button" data-action="${unlocked ? 'upgradeSigil' : 'unlockSigil'}" data-value="${sigil.id}">${unlocked
                        ? (level >= 8 ? text('已满级', 'Maxed') : text(`升级 · ${formatCompact(upgradeCost.gold)}G / ${formatCompact(upgradeCost.shards)} 碎片`, `Upgrade · ${formatCompact(upgradeCost.gold)}G / ${formatCompact(upgradeCost.shards)} shards`))
                        : text(`解锁 · ${formatCompact(sigil.shardUnlock)} 碎片`, `Unlock · ${formatCompact(sigil.shardUnlock)} shards`)}</button>
                </div>
            </article>
        `;
    }

    function renderSeasonNode(node, sponsor = false) {
        return `
            <article class="gf-card gf-node-card ${node.claimable ? 'is-ready' : ''}">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${sponsor ? text('赞助轨', 'Sponsor') : text('免费轨', 'Free')}</div>
                        <div class="gf-card-title">${node.id}</div>
                    </div>
                    <div class="gf-card-number">${node.claimed ? text('已领', 'Claimed') : node.claimable ? text('可领', 'Ready') : `${formatCompact(node.xp)} XP`}</div>
                </div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${renderRewardChips(node.reward, { limit: 4 })}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="${sponsor ? 'claimSponsorSeason' : 'claimSeason'}" data-value="${node.id}" ${node.claimable ? '' : 'disabled'}>${node.claimed ? text('已领取', 'Claimed') : text('领取', 'Claim')}</button>
                </div>
            </article>
        `;
    }

    function renderPanelHead(title, copy, side = '') {
        return `
            <div class="gf-panel-head">
                <div class="gf-panel-title-wrap">
                    <div class="eyebrow">${title}</div>
                    <h2>${title}</h2>
                    ${copy ? `<div class="gf-panel-copy">${copy}</div>` : ''}
                </div>
                ${side}
            </div>
        `;
    }

    function renderKpiGrid(items) {
        return `
            <div class="gf-kpi-grid">
                ${items.filter(Boolean).map((item) => `
                    <div class="gf-kpi-card">
                        <span>${item.label}</span>
                        <strong>${item.value}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderRewardChips(reward, options = {}) {
        const limit = Number.isFinite(options.limit) ? options.limit : Infinity;
        const chips = [];
        if (!reward) return '';
        if (reward.gold) chips.push(`<span class="gf-chip">${formatCompact(reward.gold)} ${text('金币', 'Gold')}</span>`);
        if (reward.dust) chips.push(`<span class="gf-chip">${formatCompact(reward.dust)} ${text('熔尘', 'Dust')}</span>`);
        if (reward.catalyst) chips.push(`<span class="gf-chip">${formatCompact(reward.catalyst)} ${text('催化剂', 'Catalyst')}</span>`);
        if (reward.seasonXp) chips.push(`<span class="gf-chip">${formatCompact(reward.seasonXp)} XP</span>`);
        if (reward.sigils) {
            Object.entries(reward.sigils).forEach(([sigilId, amount]) => {
                const sigil = sigilMap[sigilId];
                if (sigil) chips.push(`<span class="gf-chip">${localize(sigil.name)} +${formatCompact(amount)}</span>`);
            });
        }
        if (chips.length > limit) return [...chips.slice(0, limit), `<span class="gf-chip">+${chips.length - limit}</span>`].join('');
        return chips.join('');
    }

    function renderPermanentChips(permanent, options = {}) {
        const limit = Number.isFinite(options.limit) ? options.limit : Infinity;
        const chips = [];
        if (!permanent) return '';
        if (permanent.heatCap) chips.push(`<span class="gf-chip is-strong">${text('永久热量', 'Perm Heat')} +${formatCompact(permanent.heatCap)}</span>`);
        if (permanent.rareRate) chips.push(`<span class="gf-chip is-strong">${text('永久稀有率', 'Perm Rare')} +${formatPercent(permanent.rareRate)}</span>`);
        if (permanent.dustYield) chips.push(`<span class="gf-chip is-success">${text('永久熔尘', 'Perm Dust')} +${formatPercent(permanent.dustYield)}</span>`);
        if (permanent.catalystYield) chips.push(`<span class="gf-chip is-success">${text('永久催化', 'Perm Catalyst')} +${formatPercent(permanent.catalystYield)}</span>`);
        if (chips.length > limit) return [...chips.slice(0, limit), `<span class="gf-chip">+${chips.length - limit}</span>`].join('');
        return chips.join('');
    }

    function getFamilyGemCount(familyId, minTier = 1) {
        return config.gemTiers.reduce((sum, tierMeta) => {
            if (tierMeta.tier < minTier) return sum;
            return sum + getGemCount(familyId, tierMeta.tier);
        }, 0);
    }

    function getFamilyAwakenedCount(familyId) {
        return config.gemTiers.reduce((sum, tierMeta) => {
            const key = buildGemKey(familyId, tierMeta.tier);
            return sum + getAwakenedCount(key);
        }, 0);
    }

    function getDailySupplyRemainingMs() {
        if (isDailySupplyReady()) return 0;
        return Math.max(0, DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - Number(state.save.dailySupplyAt || 0)));
    }

    function formatDurationCompact(ms) {
        const totalSeconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${Math.max(1, minutes)}m`;
    }

    function getMissionRoute(missionId) {
        switch (missionId) {
            case 'm1':
            case 'm2':
            case 'm6':
            case 'm8':
            case 'm9':
                return { tab: 'forge', label: text('去熔炉', 'Open Forge') };
            case 'm3':
                return { tab: 'sigils', label: text('去符印', 'Open Sigils') };
            case 'm4':
            case 'm7':
            case 'm10':
                return { tab: 'contracts', label: text('去合同', 'Open Contracts') };
            case 'm5':
                return { tab: 'workshop', label: text('去工坊', 'Open Workshop') };
            default:
                return { tab: 'forge', label: text('去熔炉', 'Open Forge') };
        }
    }

    function getMissionDesc(missionId) {
        switch (missionId) {
            case 'm1': return text('多开炉拿基础库存。', 'Forge more starter stock.');
            case 'm2': return text('先把可合成行吃掉。', 'Consume fuse-ready rows first.');
            case 'm3': return text('升级主印和共鸣槽。', 'Upgrade main and echo sigils.');
            case 'm4': return text('当前够线就去推 1-3。', 'Push to 1-3 once ready.');
            case 'm5': return text('优先热量恢复和稀有率。', 'Prioritize heat regen and rare rate.');
            case 'm6': return text('攒出第一颗 T3。', 'Build your first T3.');
            case 'm7': return text('中期开始补 2-2。', 'Push toward 2-2 in midgame.');
            case 'm8': return text('持续做高阶合成。', 'Keep chaining higher fusions.');
            case 'm9': return text('开始追 T4 产线。', 'Start chasing T4 output.');
            case 'm10': return text('终局目标推进到 3-3。', 'Endgame push to 3-3.');
            default: return text('继续当前主循环。', 'Continue the core loop.');
        }
    }

    function getRecommendedShopItemId() {
        const diagnosis = getGrowthDiagnosis();
        if (diagnosis.pressureId === 'catalyst') {
            return state.save.payment.passUnlocked ? 'sponsorVault' : 'dustCrate';
        }
        if (diagnosis.pressureId === 'dust') return 'goldCrate';
        if (diagnosis.pressureId === 'gold') return 'dustCrate';
        return state.save.payment.passUnlocked ? 'sponsorVault' : 'goldCrate';
    }

    function createBaseSave() {
        const base = clone(config.baseSave);
        return {
            ...base,
            heat: base.heat,
            gems: {},
            awakened: {},
            pity: { t3: 0, t4: 0 },
            dailySupplyAt: 0,
            lastHeatAt: Date.now(),
            lastResult: null,
            forgeCombo: 0,
            relicPity: 0,
            forgeRelics: [],
            relicChaseClaims: {},
            permanent: {
                heatCap: 0,
                rareRate: 0,
                dustYield: 0,
                catalystYield: 0
            },
            stats: {
                smelts: 0,
                batchSmelts: 0,
                fuses: 0,
                salvages: 0,
                awakenings: 0,
                sigilUps: 0,
                workshopUps: 0,
                contractRuns: 0,
                contractWins: 0,
                highestTier: 1,
                tier3Drops: 0,
                tier4Drops: 0,
                manualSmelts: 0,
                perfectControls: 0,
                relicDrops: 0,
                mythicRelics: 0
            }
        };
    }

    function loadSave() {
        const base = createBaseSave();
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return base;
            return normalizeSave(JSON.parse(raw), base);
        } catch (error) {
            return base;
        }
    }

    function normalizeSave(save, base = createBaseSave()) {
        const next = {
            ...base,
            ...clone(save || {}),
            payment: { ...base.payment, ...(save?.payment || {}) },
            permanent: { ...base.permanent, ...(save?.permanent || {}) },
            stats: { ...base.stats, ...(save?.stats || {}) },
            pity: { ...base.pity, ...(save?.pity || {}) },
            gems: { ...(save?.gems || {}) },
            awakened: { ...(save?.awakened || {}) },
            forgeRelics: Array.isArray(save?.forgeRelics) ? save.forgeRelics.slice(0, FORGE_RELIC_MAX) : [],
            relicChaseClaims: save?.relicChaseClaims && typeof save.relicChaseClaims === 'object' ? { ...save.relicChaseClaims } : {},
            sigilLevels: { ...base.sigilLevels, ...(save?.sigilLevels || {}) },
            sigilShards: { ...base.sigilShards, ...(save?.sigilShards || {}) },
            workshopLevels: { ...base.workshopLevels, ...(save?.workshopLevels || {}) },
            shopPurchases: { ...base.shopPurchases, ...(save?.shopPurchases || {}) }
        };

        next.gold = clampNumber(next.gold, base.gold);
        next.dust = clampNumber(next.dust, base.dust);
        next.catalyst = clampNumber(next.catalyst, base.catalyst);
        next.seasonXp = clampNumber(next.seasonXp, base.seasonXp);
        next.contractIndex = clampNumber(next.contractIndex, base.contractIndex, 0, config.contracts.length - 1);
        next.bestContractIndex = clampNumber(next.bestContractIndex, Math.max(base.bestContractIndex, next.contractIndex), 0, config.contracts.length - 1);
        next.contractIndex = Math.min(next.contractIndex, next.bestContractIndex);
        next.heat = Math.max(0, Number(next.heat) || 0);
        next.lastHeatAt = Math.max(0, Number(next.lastHeatAt) || Date.now());
        next.dailySupplyAt = Math.max(0, Number(next.dailySupplyAt) || 0);
        next.forgeCombo = Math.max(0, Math.round(Number(next.forgeCombo) || 0));
        next.relicPity = Math.max(0, Math.round(Number(next.relicPity) || 0));
        next.forgeRelics = next.forgeRelics
            .map(normalizeForgeRelic)
            .filter(Boolean)
            .slice(0, FORGE_RELIC_MAX);
        next.relicChaseClaims = next.relicChaseClaims && typeof next.relicChaseClaims === 'object' ? { ...next.relicChaseClaims } : {};
        next.selectedSigils = Array.isArray(next.selectedSigils) ? next.selectedSigils.slice(0, 3) : base.selectedSigils.slice();
        while (next.selectedSigils.length < 3) next.selectedSigils.push('');
        next.selectedSigils = next.selectedSigils.map((sigilId, index) => {
            const slotId = SLOT_ORDER[index];
            if (sigilMap[sigilId]?.slot === slotId) return sigilId;
            const fallback = index === 0 ? 'emberCore' : index === 1 ? 'tideLoop' : 'voltRelay';
            return sigilMap[fallback]?.slot === slotId ? fallback : '';
        });
        next.missionClaimed = Array.isArray(next.missionClaimed) ? Array.from(new Set(next.missionClaimed)) : [];
        next.seasonClaimed = Array.isArray(next.seasonClaimed) ? Array.from(new Set(next.seasonClaimed)) : [];
        next.payment.minerId = typeof next.payment?.minerId === 'string' ? next.payment.minerId : '';
        next.payment.milestoneClaims = next.payment?.milestoneClaims && typeof next.payment.milestoneClaims === 'object' ? { ...next.payment.milestoneClaims } : {};
        next.payment.claimedOrders = next.payment?.claimedOrders && typeof next.payment.claimedOrders === 'object' ? { ...next.payment.claimedOrders } : {};
        next.payment.pendingClaims = next.payment?.pendingClaims && typeof next.payment.pendingClaims === 'object' ? { ...next.payment.pendingClaims } : {};
        next.payment.premiumSeasonClaims = next.payment?.premiumSeasonClaims && typeof next.payment.premiumSeasonClaims === 'object' ? { ...next.payment.premiumSeasonClaims } : {};
        next.payment.verifiedTxids = Array.isArray(next.payment?.verifiedTxids)
            ? Array.from(new Set(next.payment.verifiedTxids.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))).slice(0, 100)
            : [];
        return next;
    }

    function createForgeTimingState() {
        return {
            active: false,
            pointer: 0.24,
            direction: 1,
            speed: FORGE_TIMING_SPEED_MIN,
            lastTickAt: 0,
            frameId: 0,
            lastOutcome: 'idle'
        };
    }

    function normalizeForgeRelic(relic) {
        if (!relic || typeof relic !== 'object') return null;
        const familyId = typeof relic.familyId === 'string' ? relic.familyId : '';
        const rarity = typeof relic.rarity === 'string' ? relic.rarity : 'rare';
        if (!familyMap[familyId] || !FORGE_RELIC_FORMS[rarity]) return null;
        return {
            id: String(relic.id || `${familyId}_${Date.now().toString(16)}`),
            familyId,
            rarity,
            tier: Math.max(1, Math.min(5, Math.round(Number(relic.tier) || 1))),
            score: Math.max(1, Math.round(Number(relic.score) || 1)),
            title: relic.title && typeof relic.title === 'object'
                ? {
                    zh: String(relic.title.zh || ''),
                    en: String(relic.title.en || '')
                }
                : {
                    zh: `${familyMap[familyId].name.zh}${FORGE_RELIC_FORMS[rarity].zh}`,
                    en: `${familyMap[familyId].name.en} ${FORGE_RELIC_FORMS[rarity].en}`
                },
            reward: {
                gold: Math.max(0, Math.round(Number(relic.reward?.gold) || 0)),
                dust: Math.max(0, Math.round(Number(relic.reward?.dust) || 0)),
                catalyst: Math.max(0, Math.round(Number(relic.reward?.catalyst) || 0)),
                seasonXp: Math.max(0, Math.round(Number(relic.reward?.seasonXp) || 0))
            },
            permanent: {
                heatCap: Math.max(0, Number(relic.permanent?.heatCap) || 0),
                rareRate: Math.max(0, Number(relic.permanent?.rareRate) || 0),
                dustYield: Math.max(0, Number(relic.permanent?.dustYield) || 0),
                catalystYield: Math.max(0, Number(relic.permanent?.catalystYield) || 0)
            },
            qualityId: typeof relic.qualityId === 'string' ? relic.qualityId : 'good',
            createdAt: Math.max(0, Number(relic.createdAt) || Date.now())
        };
    }

    function saveProgress() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch (error) {}
    }

    function syncHeat() {
        const now = Date.now();
        const previous = Number(state.save.lastHeatAt) || now;
        const elapsed = Math.max(0, (now - previous) / 1000);
        const max = getHeatMax();
        if (elapsed > 0 && state.save.heat < max) {
            state.save.heat = Math.min(max, state.save.heat + elapsed * getHeatRegenPerSecond());
        }
        state.save.lastHeatAt = now;
    }

    function resolveForgeTimingSmelt(outcome) {
        syncHeat();
        if (state.save.heat < SMELT_HEAT_COST) {
            return showToast(text('热量刚好不足，先等一口恢复。', 'Heat dipped too low. Wait for a little regen first.'), 'warning');
        }
        state.save.heat -= SMELT_HEAT_COST;
        state.save.stats.smelts += 1;
        state.save.stats.manualSmelts += 1;
        if (outcome.id === 'perfect') state.save.stats.perfectControls += 1;
        state.save.seasonXp += 6 + outcome.xpBonus;
        state.save.dust += outcome.dustBonus;
        if (outcome.comboGain > 0) {
            state.save.forgeCombo = Math.min(12, Number(state.save.forgeCombo || 0) + outcome.comboGain);
        } else if (outcome.comboGain < 0) {
            state.save.forgeCombo = 0;
        }
        const result = performSmeltRoll({
            rareBonus: outcome.rareBonus,
            jumpChance: outcome.jumpChance,
            doubleChance: outcome.doubleChance,
            extraGemChance: outcome.extraGemChance,
            controlKey: outcome.id,
            controlLabel: text(outcome.shortZh, outcome.shortEn)
        });
        const relic = tryForgeRelicDrop(result, outcome);
        applySmeltResultEnhanced({
            ...result,
            controlKey: outcome.id,
            controlLabel: text(outcome.shortZh, outcome.shortEn),
            relic
        });
        triggerUiMotion(relic ? 'claim' : 'forge', relic ? 620 : 460);
        saveProgress();
        renderAll();
    }

    function smeltOne() {
        cancelForgeTimingSession();
        syncHeat();
        if (state.save.heat < SMELT_HEAT_COST) return showToast(text('热量不足，先等恢复或补热量上限。', 'Not enough heat. Wait for regen or raise heat cap first.'));
        const result = performSmeltRoll();
        state.save.heat -= SMELT_HEAT_COST;
        state.save.stats.smelts += 1;
        state.save.seasonXp += 6;
        applySmeltResultEnhanced(result);
        saveProgress();
        renderAll();
    }

    function smeltBatch() {
        cancelForgeTimingSession();
        syncHeat();
        if (state.save.heat < config.forgeBalance.batchSmeltHeatCost) return showToast(text('批量熔炼至少需要 12 热量。', 'Batch forge needs at least 12 heat.'));
        state.save.heat -= config.forgeBalance.batchSmeltHeatCost;
        const rolls = [];
        for (let index = 0; index < 3; index += 1) {
            const result = performSmeltRoll();
            rolls.push(result);
            applySmeltResultEnhanced(result, true);
            state.save.stats.smelts += 1;
        }
        const batchDustBonus = Math.round(config.forgeBalance.batchSmeltDustGain * (1 + getDustBonus()) + getSigilPassives().batchDustBonus);
        const batchGoldBonus = Math.round(config.forgeBalance.batchSmeltGoldGain * (1 + getGoldBonus()));
        state.save.gold += batchGoldBonus;
        state.save.dust += batchDustBonus;
        state.save.seasonXp += 22;
        state.save.stats.batchSmelts += 1;
        const topTier = rolls.reduce((max, item) => Math.max(max, item.tier), 1);
        const familyName = localize(familyMap[rolls[0].familyId].name);
        const pityHits = rolls.filter((item) => item.pityType);
        const pitySummary = pityHits.length
            ? pityHits.some((item) => item.pityType === 't4')
                ? text(`本轮触发 ${pityHits.length} 次 T4 保底，已经直接补入高阶产线。`, `This batch triggered T4 pity ${pityHits.length} time(s), pushing higher-tier output straight into stock.`)
                : text(`本轮触发 ${pityHits.length} 次 T3 保底，已经把高阶库存补了上来。`, `This batch triggered T3 pity ${pityHits.length} time(s), helping refill higher-tier stock.`)
            : '';
        state.save.lastResult = {
            type: 'smelt',
            title: text(`批量熔炼完成 · 最高 T${topTier}`, `Batch Forge Complete · Top T${topTier}`),
            copy: text(`本轮共熔出 ${rolls.reduce((sum, item) => sum + item.quantity, 0)} 颗宝石，并额外回收 ${formatCompact(batchGoldBonus)} 金币 / ${formatCompact(batchDustBonus)} 熔尘。${pitySummary}`, `This batch forged ${rolls.reduce((sum, item) => sum + item.quantity, 0)} gems and returned ${formatCompact(batchGoldBonus)} gold / ${formatCompact(batchDustBonus)} dust.${pitySummary}`),
            tags: [
                `${text('首颗家族', 'Lead Family')} · ${familyName}`,
                `T${topTier}`,
                `${text('批量奖励', 'Batch Bonus')} +${formatCompact(batchDustBonus)}D`,
                ...Array.from(new Set(pityHits.map((item) => getPityLabel(item.pityType)).filter(Boolean)))
            ]
        };
        showToast(pityHits.length
            ? text(`批量熔炼完成，并触发 ${getPityLabel(pityHits.some((item) => item.pityType === 't4') ? 't4' : 't3')}。`, `Batch forge complete with ${getPityLabel(pityHits.some((item) => item.pityType === 't4') ? 't4' : 't3')} triggered.`)
            : text('批量熔炼完成，优先处理能合成的高价值宝石。', 'Batch forge complete. Handle the highest-value fuse candidates first.'));
        saveProgress();
        renderAll();
    }

    function performSmeltRoll(options = {}) {
        const rareBonus = getRareBonus() + (Number(options.rareBonus) || 0);
        const passives = getSigilPassives();
        const tierRoll = rollTier(rareBonus, passives.jumpChance + (Number(options.jumpChance) || 0));
        const tier = tierRoll.tier;
        const familyId = rollFamilyId();
        let quantity = Math.random() < Math.min(0.6, passives.doubleChance + (Number(options.doubleChance) || 0)) ? 2 : 1;
        if (Math.random() < Math.min(0.28, (passives.bonusExtraGemChance || 0) + (Number(options.extraGemChance) || 0))) quantity += 1;
        addGem(familyId, tier, quantity);
        if (tier >= 3) {
            state.save.pity.t3 = 0;
            state.save.stats.tier3Drops += quantity;
        } else {
            state.save.pity.t3 += 1;
        }
        if (tier >= 4) {
            state.save.pity.t4 = 0;
            state.save.stats.tier4Drops += quantity;
        } else {
            state.save.pity.t4 += 1;
        }
        state.save.stats.highestTier = Math.max(state.save.stats.highestTier, tier);
        return {
            familyId,
            tier,
            quantity,
            pityType: tierRoll.pityType || '',
            controlKey: String(options.controlKey || ''),
            controlLabel: String(options.controlLabel || '')
        };
    }

    function rollTier(rareBonus, jumpChance) {
        const pityForceT3 = state.save.pity.t3 + 1 >= config.forgeBalance.pityTier3Need;
        const pityForceT4 = state.save.pity.t4 + 1 >= config.forgeBalance.pityTier4Need;
        if (pityForceT4) return { tier: 4, pityType: 't4' };
        if (pityForceT3) return { tier: 3, pityType: 't3' };
        const base = { ...config.forgeBalance.dropRates };
        const rareLift = Math.min(0.18, rareBonus);
        const tier3Rate = Math.min(0.18, base.tier3 + rareLift * 0.45);
        const tier2Rate = Math.min(0.34, base.tier2 + rareLift * 0.7);
        const tier1Rate = Math.max(0.42, 1 - tier2Rate - tier3Rate);
        const roll = Math.random();
        let tier = roll < tier1Rate ? 1 : roll < tier1Rate + tier2Rate ? 2 : 3;
        if (Math.random() < Math.min(0.22, jumpChance) && tier < 5) tier += 1;
        return { tier: Math.min(5, tier), pityType: '' };
    }

    function rollFamilyId() {
        const weights = {};
        config.gemFamilies.forEach((family) => {
            weights[family.id] = 1;
        });
        getCurrentContract().focus.forEach((familyId) => {
            weights[familyId] = (weights[familyId] || 1) + 1.45;
        });
        getSelectedSigils().forEach((sigil) => {
            weights[sigil.family] = (weights[sigil.family] || 1) + 0.85;
        });
        const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
        let needle = Math.random() * total;
        for (const family of config.gemFamilies) {
            needle -= weights[family.id];
            if (needle <= 0) return family.id;
        }
        return config.gemFamilies[0].id;
    }

    function getForgeRelicRarityWeight(rarity) {
        switch (rarity) {
            case 'mythic': return 4;
            case 'legend': return 3;
            case 'epic': return 2;
            case 'rare':
            default: return 1;
        }
    }

    function getForgeRelicRarityLabel(rarity) {
        switch (rarity) {
            case 'mythic': return text('神话', 'Mythic');
            case 'legend': return text('传说', 'Legend');
            case 'epic': return text('史诗', 'Epic');
            case 'rare':
            default: return text('珍稀', 'Rare');
        }
    }

    function getForgeRelicSummary() {
        const relics = Array.isArray(state.save.forgeRelics) ? state.save.forgeRelics : [];
        const best = relics.slice().sort((left, right) => {
            const rarityGap = getForgeRelicRarityWeight(right.rarity) - getForgeRelicRarityWeight(left.rarity);
            if (rarityGap !== 0) return rarityGap;
            return Number(right.score || 0) - Number(left.score || 0);
        })[0] || null;
        return {
            count: relics.length,
            best,
            latest: relics[0] || null,
            combo: Math.max(0, Number(state.save.forgeCombo) || 0),
            pityRemain: Math.max(0, FORGE_RELIC_PITY_NEED - (Number(state.save.relicPity) || 0))
        };
    }

    function addForgeRelic(relic) {
        const normalized = normalizeForgeRelic(relic);
        if (!normalized) return null;
        state.save.forgeRelics = [normalized, ...(state.save.forgeRelics || [])].slice(0, FORGE_RELIC_MAX);
        state.save.stats.relicDrops += 1;
        if (normalized.rarity === 'mythic') state.save.stats.mythicRelics += 1;
        return normalized;
    }

    function buildForgeRelic(result, rarity, outcome) {
        const family = familyMap[result.familyId];
        const form = FORGE_RELIC_FORMS[rarity] || FORGE_RELIC_FORMS.rare;
        const rarityMultiplier = rarity === 'mythic' ? 2.7 : rarity === 'legend' ? 1.9 : rarity === 'epic' ? 1.35 : 1;
        const tierScale = 1 + Math.max(0, result.tier - 1) * 0.24;
        const score = Math.round((58 + result.tier * 22 + outcome.xpBonus * 2.4 + Math.random() * 28) * rarityMultiplier * tierScale);
        const reward = {
            gold: Math.round((70 + score * 1.8) * (rarity === 'mythic' ? 1.55 : rarity === 'legend' ? 1.25 : 1)),
            dust: Math.round((8 + result.tier * 6 + score * 0.12) * (rarity === 'mythic' ? 1.45 : 1)),
            catalyst: Math.max(0, Math.round((rarity === 'rare' ? 0 : rarity === 'epic' ? 1 : rarity === 'legend' ? 3 : 6) + Math.max(0, result.tier - 3))),
            seasonXp: Math.round(rarity === 'rare' ? 0 : rarity === 'epic' ? 12 : rarity === 'legend' ? 28 : 56)
        };
        const permanent = {
            heatCap: 0,
            rareRate: 0,
            dustYield: 0,
            catalystYield: 0
        };
        const bonusScale = rarity === 'mythic' ? 2.4 : rarity === 'legend' ? 1.7 : rarity === 'epic' ? 1.15 : 0.7;
        switch (result.familyId) {
            case 'ember':
                permanent.rareRate = Number((0.0026 * bonusScale + result.tier * 0.00035).toFixed(4));
                permanent.heatCap = Math.round(1 + bonusScale + Math.max(0, result.tier - 2) * 0.8);
                break;
            case 'tide':
                permanent.dustYield = Number((0.0032 * bonusScale + result.tier * 0.00045).toFixed(4));
                permanent.heatCap = Math.round(1 + Math.max(0, bonusScale - 0.35));
                break;
            case 'volt':
                permanent.heatCap = Math.round(2 + bonusScale * 1.8 + Math.max(0, result.tier - 2));
                permanent.rareRate = Number((0.0016 * bonusScale + result.tier * 0.00025).toFixed(4));
                break;
            case 'void':
            default:
                permanent.catalystYield = Number((0.0032 * bonusScale + result.tier * 0.00045).toFixed(4));
                permanent.rareRate = Number((0.0018 * bonusScale + result.tier * 0.00028).toFixed(4));
                break;
        }
        return {
            id: `relic_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`,
            familyId: result.familyId,
            rarity,
            tier: result.tier,
            score,
            qualityId: outcome.id,
            createdAt: Date.now(),
            title: {
                zh: `${family.name.zh}${form.zh}`,
                en: `${family.name.en} ${form.en}`
            },
            reward,
            permanent
        };
    }

    function tryForgeRelicDrop(result, outcome) {
        const pityCount = Math.max(0, Number(state.save.relicPity) || 0);
        const forcedRare = pityCount + 1 >= FORGE_RELIC_PITY_NEED;
        const forcedEpic = pityCount + 1 >= FORGE_RELIC_EPIC_PITY_NEED && (outcome.id === 'perfect' || outcome.id === 'great');
        const baseChance = outcome.relicChance + Math.max(0, result.tier - 1) * 0.02;
        const shouldDrop = forcedRare || Math.random() < Math.min(0.62, baseChance);
        if (!shouldDrop) {
            state.save.relicPity = pityCount + 1;
            return null;
        }
        const rarityRoll = Math.random();
        let rarity = 'rare';
        if (forcedEpic) {
            rarity = rarityRoll < 0.22 ? 'mythic' : rarityRoll < 0.56 ? 'legend' : 'epic';
        } else if (outcome.id === 'perfect') {
            rarity = rarityRoll < 0.03 ? 'mythic' : rarityRoll < 0.13 ? 'legend' : rarityRoll < 0.42 ? 'epic' : 'rare';
        } else if (outcome.id === 'great') {
            rarity = rarityRoll < 0.01 ? 'mythic' : rarityRoll < 0.07 ? 'legend' : rarityRoll < 0.28 ? 'epic' : 'rare';
        } else if (outcome.id === 'good') {
            rarity = rarityRoll < 0.003 ? 'mythic' : rarityRoll < 0.025 ? 'legend' : rarityRoll < 0.15 ? 'epic' : 'rare';
        }
        if (result.tier >= 4 && rarity === 'rare' && Math.random() < 0.45) rarity = 'epic';
        if (result.tier >= 5 && rarity === 'epic' && Math.random() < 0.28) rarity = 'legend';
        const relic = addForgeRelic(buildForgeRelic(result, rarity, outcome));
        state.save.relicPity = 0;
        grantReward(relic.reward);
        applyPermanentBonus(relic.permanent);
        return relic;
    }

    function applySmeltResult(result, silent = false) {
        const familyName = localize(familyMap[result.familyId].name);
        const pityLabel = getPityLabel(result.pityType);
        state.save.lastResult = {
            type: 'smelt',
            title: text(`${familyName} T${result.tier} 宝石`, `${familyName} T${result.tier} Gem`),
            copy: result.pityType
                ? text(`本次熔炼获得 ${result.quantity} 颗 ${familyName} T${result.tier} 宝石，并触发了 ${pityLabel}。继续攒到 3 颗就能合到下一阶。`, `You forged ${result.quantity} ${familyName} T${result.tier} gems and triggered ${pityLabel}. Reach 3 copies to fuse into the next tier.`)
                : text(`本次熔炼获得 ${result.quantity} 颗 ${familyName} T${result.tier} 宝石。继续攒到 3 颗就能合到下一阶。`, `You forged ${result.quantity} ${familyName} T${result.tier} gems. Reach 3 copies to fuse into the next tier.`),
            tags: [familyName, `T${result.tier}`, `${text('数量', 'Qty')} ${result.quantity}`, pityLabel].filter(Boolean)
        };
        if (!silent) showToast(result.pityType
            ? text(`${pityLabel}：${familyName} T${result.tier}`, `${pityLabel}: ${familyName} T${result.tier}`)
            : text(`熔炼成功：${familyName} T${result.tier}`, `Forged ${familyName} T${result.tier}`));
    }

    function applySmeltResultEnhanced(result, silent = false) {
        const familyName = localize(familyMap[result.familyId].name);
        const pityLabel = getPityLabel(result.pityType);
        const controlLabel = String(result.controlLabel || '');
        const relic = result.relic ? normalizeForgeRelic(result.relic) : null;
        state.save.lastResult = {
            type: relic ? 'relic' : 'smelt',
            title: relic
                ? text(`${getForgeRelicRarityLabel(relic.rarity)}珍藏 · ${localize(relic.title)}`, `${getForgeRelicRarityLabel(relic.rarity)} Relic · ${localize(relic.title)}`)
                : text(`${familyName} T${result.tier} 宝石`, `${familyName} T${result.tier} Gem`),
            copy: relic
                ? text(`这次${controlLabel || '控火'}直接爆出 ${localize(relic.title)}，已自动入柜并发放奖励。后续可继续冲更高稀有度与更高收藏分。`, `This ${controlLabel || 'manual forge'} dropped ${localize(relic.title)}. It has been archived automatically and its rewards are already granted.`)
                : result.pityType
                    ? text(`本次${controlLabel || '熔炼'}获得 ${result.quantity} 颗 ${familyName} T${result.tier} 宝石，并触发了 ${pityLabel}。继续攒到 3 颗就能合到下一阶。`, `This ${controlLabel || 'forge'} gave ${result.quantity} ${familyName} T${result.tier} gems and triggered ${pityLabel}. Reach 3 copies to fuse into the next tier.`)
                    : text(`本次${controlLabel || '熔炼'}获得 ${result.quantity} 颗 ${familyName} T${result.tier} 宝石。继续攒到 3 颗就能合到下一阶。`, `This ${controlLabel || 'forge'} gave ${result.quantity} ${familyName} T${result.tier} gems. Reach 3 copies to fuse into the next tier.`),
            tags: [familyName, `T${result.tier}`, `${text('数量', 'Qty')} ${result.quantity}`, controlLabel, pityLabel, relic ? getForgeRelicRarityLabel(relic.rarity) : ''].filter(Boolean),
            reward: relic ? relic.reward : null,
            permanent: relic ? relic.permanent : null
        };
        if (!silent) {
            if (relic) {
                showToast(text(`爆出${getForgeRelicRarityLabel(relic.rarity)}珍藏：${localize(relic.title)}`, `Dropped ${getForgeRelicRarityLabel(relic.rarity)} relic: ${localize(relic.title)}`), relic.rarity === 'legend' || relic.rarity === 'mythic' ? 'claim' : 'success');
                if (relic.rarity === 'legend' || relic.rarity === 'mythic') {
                    showRelicCelebration(relic);
                }
            } else if (result.pityType) {
                showToast(text(`${pityLabel}：${familyName} T${result.tier}`, `${pityLabel}: ${familyName} T${result.tier}`), controlLabel ? 'success' : 'neutral');
            } else {
                showToast(controlLabel
                    ? text(`${controlLabel}收炉：${familyName} T${result.tier}`, `${controlLabel}: ${familyName} T${result.tier}`)
                    : text(`熔炼成功：${familyName} T${result.tier}`, `Forged ${familyName} T${result.tier}`), controlLabel ? 'success' : 'neutral');
            }
        }
    }

    function fuseGem(key) {
        const { familyId, tier } = parseGemKey(key);
        const tierMeta = getTierMeta(tier);
        const count = getGemCount(familyId, tier);
        if (!familyId || !tierMeta || tier >= 5) return;
        if (count < tierMeta.fuseNeed) return showToast(text('同阶宝石不足 3 颗。', 'Need 3 gems of the same tier first.'));
        addGem(familyId, tier, -tierMeta.fuseNeed);
        addGem(familyId, tier + 1, 1);
        state.save.stats.fuses += 1;
        state.save.stats.highestTier = Math.max(state.save.stats.highestTier, tier + 1);
        state.save.seasonXp += 12 + tier * 4;
        const familyName = localize(familyMap[familyId].name);
        state.save.lastResult = {
            title: text(`合成成功 · ${familyName} T${tier + 1}`, `Fusion Complete · ${familyName} T${tier + 1}`),
            copy: text(`消耗 3 颗 T${tier}，合成出 1 颗 T${tier + 1}。现在高阶宝石会开始明显拉升合同战力。`, `Three T${tier} gems fused into one T${tier + 1}. Higher tiers now start making a visible difference in contract power.`),
            tags: [familyName, `T${tier} → T${tier + 1}`, text('战力提升', 'Power Up')]
        };
        showToast(text('合成成功，当前高阶宝石已计入战力。', 'Fusion complete. The higher-tier gem now counts toward power.'));
        saveProgress();
        renderAll();
    }

    function awakenGem(key) {
        const { familyId, tier } = parseGemKey(key);
        const tierMeta = getTierMeta(tier);
        if (!familyId || !tierMeta || tier < 3) return showToast(text('至少 T3 才能觉醒。', 'Awakening starts at T3.'));
        if (getGemCount(familyId, tier) < 1) return showToast(text('缺少可觉醒的本体宝石。', 'Missing the base gem to awaken.'));
        if (state.save.catalyst < tierMeta.awakenCatalyst) return showToast(text('催化剂不足。', 'Not enough catalyst.'));
        addGem(familyId, tier, -1);
        state.save.catalyst -= tierMeta.awakenCatalyst;
        state.save.awakened[key] = (Number(state.save.awakened[key]) || 0) + 1;
        state.save.stats.awakenings += 1;
        state.save.seasonXp += 28 + tier * 6;
        const familyName = localize(familyMap[familyId].name);
        state.save.lastResult = {
            title: text(`觉醒成功 · ${familyName} T${tier}`, `Awakened · ${familyName} T${tier}`),
            copy: text(`消耗 1 颗 T${tier} 本体与 ${tierMeta.awakenCatalyst} 催化剂，换来永久觉醒战力。`, `Consumed one T${tier} gem and ${tierMeta.awakenCatalyst} catalyst for permanent awakened power.`),
            tags: [familyName, `T${tier}`, text('永久加成', 'Permanent Bonus')]
        };
        showToast(text('觉醒完成，永久战力已提高。', 'Awakening complete. Permanent power increased.'));
        saveProgress();
        renderAll();
    }

    function salvageGem(key) {
        const { familyId, tier } = parseGemKey(key);
        const tierMeta = getTierMeta(tier);
        if (!familyId || !tierMeta) return;
        if (getGemCount(familyId, tier) < 1) return showToast(text('缺少可回收的宝石。', 'No gem is available to recycle.'));
        const dustGain = getRecycleDustValue(tier, 1);
        if (dustGain <= 0) return showToast(text('该阶宝石当前无法回收。', 'This tier cannot be recycled right now.'));
        addGem(familyId, tier, -1);
        state.save.dust += dustGain;
        state.save.stats.salvages += 1;
        const familyName = localize(familyMap[familyId].name);
        state.save.lastResult = {
            type: 'salvage',
            title: text(`回收完成 · ${familyName} T${tier}`, `Recycle Complete · ${familyName} T${tier}`),
            copy: text(`回收 1 颗 ${familyName} T${tier} 宝石，返还 ${formatCompact(dustGain)} 熔尘。`, `Recycled 1 ${familyName} T${tier} gem and returned ${formatCompact(dustGain)} dust.`),
            tags: [familyName, `T${tier}`, `${text('熔尘', 'Dust')} +${formatCompact(dustGain)}`]
        };
        showToast(text(`已回收 ${familyName} T${tier}，返还 ${formatCompact(dustGain)} 熔尘。`, `Recycled ${familyName} T${tier} for ${formatCompact(dustGain)} dust.`));
        saveProgress();
        renderAll();
    }

    function smartRecycleGems() {
        const plan = getSmartRecyclePlan();
        if (!plan.entries.length) return showToast(text('当前没有适合智能回收的低优先库存。', 'There is no low-priority stock to smart recycle right now.'));
        plan.entries.forEach((entry) => {
            addGem(entry.familyId, entry.tier, -entry.amount);
            state.save.dust += entry.dust;
        });
        state.save.stats.salvages += plan.totalCount;
        state.save.lastResult = {
            type: 'salvage',
            title: text('智能回收完成', 'Smart Recycle Complete'),
            copy: text(`本次共回收 ${plan.totalCount} 颗低优先宝石，返还 ${formatCompact(plan.totalDust)} 熔尘，并保留当前推进仍需要的关键库存。`, `Recycled ${plan.totalCount} lower-priority gems for ${formatCompact(plan.totalDust)} dust while keeping the key stock needed for your current push.`),
            tags: [
                `${text('回收', 'Recycled')} ${plan.totalCount}`,
                `${text('熔尘', 'Dust')} +${formatCompact(plan.totalDust)}`,
                text('已保留推进库存', 'Push stock kept')
            ]
        };
        showToast(text(`智能回收完成，返还 ${formatCompact(plan.totalDust)} 熔尘。`, `Smart recycle returned ${formatCompact(plan.totalDust)} dust.`));
        saveProgress();
        renderAll();
    }

    function selectContract(index) {
        if (!Number.isFinite(index) || index < 0 || index >= config.contracts.length) return;
        if (index > state.save.bestContractIndex + 1) return showToast(text('前一档还没打通。', 'Clear the previous contract first.'));
        if (state.save.contractIndex === index) return showToast(text('当前已经是这档合同。', 'This is already your current contract.'));
        state.save.contractIndex = index;
        showToast(text(`已切换到合同 ${config.contracts[index].id}。`, `Target switched to ${config.contracts[index].id}.`));
        saveProgress();
        renderAll();
    }

    function runContract(index) {
        if (!Number.isFinite(index) || index < 0 || index >= config.contracts.length) return;
        if (index > state.save.bestContractIndex + 1) return showToast(text('该合同尚未解锁。', 'This contract is not unlocked yet.'));
        const contract = config.contracts[index];
        const power = getCurrentPower().total;
        const passives = getSigilPassives();
        const success = power + passives.contractStability >= contract.recommended;
        const reward = getContractPreviewReward(contract, success);
        grantReward(reward);
        grantFocusShards(contract.focus, success ? 8 + index * 2 : 4 + index);
        state.save.stats.contractRuns += 1;
        if (success) {
            state.save.stats.contractWins += 1;
            if (index >= state.save.bestContractIndex) state.save.bestContractIndex = Math.min(config.contracts.length - 1, index + 1);
            state.save.contractIndex = Math.min(config.contracts.length - 1, Math.max(state.save.contractIndex, index + 1));
        }
        state.save.lastResult = {
            title: success ? text(`合同完成 · ${contract.id}`, `Contract Cleared · ${contract.id}`) : text(`合同未稳过 · ${contract.id}`, `Contract Missed · ${contract.id}`),
            copy: success
                ? text('战力已够线，已回收合同奖励并推动到下一档。继续抬高高阶宝石和符印，可以更稳打后续合同。', 'You were on the line, collected the contract reward, and pushed to the next tier. Keep raising higher-tier gems and sigils for smoother later clears.')
                : text('当前仍有战力缺口，已发放一部分保底回流。优先补符印、工坊和高阶宝石，再回来打穿。', 'There is still a power gap, so only partial fallback rewards were granted. Raise sigils, workshop, and higher-tier gems before retrying.'),
            tags: [contract.id, success ? text('推进成功', 'Cleared') : text('差一点', 'Almost'), `${text('战力', 'Power')} ${formatCompact(power)}`]
        };
        showToast(success ? text(`合同 ${contract.id} 已完成。`, `Contract ${contract.id} cleared.`) : text(`合同 ${contract.id} 仍有缺口。`, `Contract ${contract.id} still has a gap.`));
        saveProgress();
        renderAll();
    }

    function unlockSigil(sigilId) {
        const sigil = sigilMap[sigilId];
        if (!sigil) return;
        if (getSigilLevel(sigilId) > 0) return showToast(text('该符印已经解锁。', 'This sigil is already unlocked.'));
        if (getSigilShardCount(sigilId) < sigil.shardUnlock) return showToast(text('符印碎片不足。', 'Not enough sigil shards.'));
        state.save.sigilShards[sigilId] -= sigil.shardUnlock;
        state.save.sigilLevels[sigilId] = 1;
        showToast(text('符印已解锁。', 'Sigil unlocked.'));
        saveProgress();
        renderAll();
    }

    function equipSigil(sigilId) {
        const sigil = sigilMap[sigilId];
        if (!sigil) return;
        if (getSigilLevel(sigilId) <= 0) return showToast(text('请先解锁该符印。', 'Unlock this sigil first.'));
        if (sigil.slot === 'resonance' && state.save.bestContractIndex < 2) return showToast(text('第三槽推进到 1-3 后开启。', 'The third slot opens after reaching 1-3.'));
        const slotIndex = SLOT_ORDER.indexOf(sigil.slot);
        if (slotIndex < 0) return;
        state.save.selectedSigils[slotIndex] = sigilId;
        showToast(text('符印装配已更新。', 'Sigil loadout updated.'));
        saveProgress();
        renderAll();
    }

    function upgradeSigil(sigilId) {
        const sigil = sigilMap[sigilId];
        if (!sigil) return;
        const level = getSigilLevel(sigilId);
        if (level <= 0) return showToast(text('请先解锁该符印。', 'Unlock this sigil first.'));
        if (level >= 8) return showToast(text('该符印已经满级。', 'This sigil is already maxed.'));
        const cost = getSigilUpgradeCost(sigilId);
        if (state.save.gold < cost.gold) return showToast(text('金币不足。', 'Not enough gold.'));
        if (getSigilShardCount(sigilId) < cost.shards) return showToast(text('符印碎片不足。', 'Not enough sigil shards.'));
        state.save.gold -= cost.gold;
        state.save.sigilShards[sigilId] -= cost.shards;
        state.save.sigilLevels[sigilId] += 1;
        state.save.stats.sigilUps += 1;
        showToast(text('符印升级成功。', 'Sigil upgraded.'));
        saveProgress();
        renderAll();
    }

    function upgradeWorkshop(workshopId) {
        const item = workshopMap[workshopId];
        if (!item) return showToast(text('未找到该工坊路线。', 'Workshop line not found.'));
        if (getWorkshopLevel(workshopId) >= item.maxLevel) return showToast(text('该工坊路线已经封顶。', 'This workshop line is already maxed.'));
        if (!canUpgradeWorkshop(workshopId)) return showToast(text('资源不足，先补金币或熔尘。', 'Not enough resources. Refill gold or dust first.'));
        const cost = getWorkshopUpgradeCost(workshopId);
        state.save.gold -= cost.gold;
        state.save.dust -= cost.dust;
        state.save.workshopLevels[workshopId] += 1;
        state.save.stats.workshopUps += 1;
        showToast(text('工坊升级完成。', 'Workshop upgraded.'));
        saveProgress();
        renderAll();
    }

    function claimMission(missionId) {
        const mission = config.missions.find((item) => item.id === missionId);
        if (!mission) return showToast(text('未找到该任务。', 'Mission not found.'));
        const view = getMissionView(mission);
        if (!view) return showToast(text('当前无法领取该任务。', 'This mission cannot be claimed right now.'));
        if (view.claimed) return showToast(text('该任务奖励已经领取过了。', 'This mission reward has already been claimed.'));
        if (!view.claimable) {
            const route = getMissionRoute(missionId);
            state.tab = tabMap[route.tab] ? route.tab : state.tab;
            renderAll();
            return showToast(text('任务尚未完成，已跳到对应页签。', 'Mission not ready. Routed to the relevant tab.'));
        }
        grantReward(view.reward);
        state.save.missionClaimed.push(missionId);
        showToast(text('任务奖励已领取。', 'Mission reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimAllMissions() {
        const claimable = config.missions.map(getMissionView).filter((item) => item.claimable);
        if (!claimable.length) return showToast(text('当前没有可领取的任务奖励。', 'There are no mission rewards ready right now.'));
        claimable.forEach((item) => {
            grantReward(item.reward);
            state.save.missionClaimed.push(item.id);
        });
        state.save.missionClaimed = Array.from(new Set(state.save.missionClaimed));
        showToast(text(`已领取 ${claimable.length} 个任务奖励。`, `Claimed ${claimable.length} mission rewards.`));
        saveProgress();
        renderAll();
    }

    function claimSeasonNode(nodeId) {
        const node = config.seasonNodes.find((item) => item.id === nodeId);
        if (!node) return showToast(text('未找到该赛季节点。', 'Season node not found.'));
        if (state.save.seasonClaimed.includes(node.id)) return showToast(text('该赛季奖励已经领取。', 'This season reward has already been claimed.'));
        if (!isSeasonClaimable(node.id)) {
            const gapXp = Math.max(0, Number(node.xp || 0) - Number(state.save.seasonXp || 0));
            if (gapXp > 0) {
                state.tab = 'forge';
                renderAll();
                return showToast(text(`还差 ${formatCompact(gapXp)} XP，先去熔炉推进。`, `You need ${formatCompact(gapXp)} more XP. Head to Forge first.`));
            }
            return showToast(text('该赛季奖励当前不可领取。', 'This season reward is not claimable right now.'));
        }
        grantReward(node.reward);
        state.save.seasonClaimed.push(node.id);
        showToast(text('赛季奖励已领取。', 'Season reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimSponsorSeasonNode(nodeId) {
        const node = config.sponsorSeasonNodes.find((item) => item.id === nodeId);
        if (!node) return showToast(text('未找到该赞助赛季节点。', 'Sponsor season node not found.'));
        if (state.save.payment.premiumSeasonClaims[node.id]) return showToast(text('该赞助奖励已经领取。', 'This sponsor reward has already been claimed.'));
        if (!state.save.payment.passUnlocked) {
            state.tab = 'shop';
            renderAll();
            return showToast(text('需要先开通赞助，已跳到商店。', 'Sponsor unlock is required first. Routed to Shop.'));
        }
        if (!isSponsorSeasonClaimable(node.id)) {
            const gapXp = Math.max(0, Number(node.xp || 0) - Number(state.save.seasonXp || 0));
            if (gapXp > 0) {
                state.tab = 'forge';
                renderAll();
                return showToast(text(`还差 ${formatCompact(gapXp)} XP，先去熔炉推进。`, `You need ${formatCompact(gapXp)} more XP. Head to Forge first.`));
            }
            return showToast(text('该赞助赛季奖励当前不可领取。', 'This sponsor season reward is not claimable right now.'));
        }
        grantReward(node.reward);
        state.save.payment.premiumSeasonClaims[node.id] = true;
        showToast(text('赞助赛季奖励已领取。', 'Sponsor season reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimAllSeason() {
        let claimedCount = 0;
        config.seasonNodes.forEach((node) => {
            if (isSeasonClaimable(node.id)) {
                grantReward(node.reward);
                state.save.seasonClaimed.push(node.id);
                claimedCount += 1;
            }
        });
        config.sponsorSeasonNodes.forEach((node) => {
            if (isSponsorSeasonClaimable(node.id)) {
                grantReward(node.reward);
                state.save.payment.premiumSeasonClaims[node.id] = true;
                claimedCount += 1;
            }
        });
        if (!claimedCount) return showToast(text('当前没有可领取的赛季奖励。', 'There are no season rewards ready right now.'));
        showToast(text(`已领取 ${claimedCount} 个赛季奖励。`, `Claimed ${claimedCount} season rewards.`));
        saveProgress();
        renderAll();
    }

    function claimDailySupply() {
        if (!isDailySupplyReady()) {
            return showToast(text(`每日补给冷却中，${formatDurationCompact(getDailySupplyRemainingMs())} 后可领。`, `Daily supply is cooling down. Ready in ${formatDurationCompact(getDailySupplyRemainingMs())}.`));
        }
        const item = config.shopItems.find((entry) => entry.id === 'dailySupply');
        grantReward(item.reward);
        grantFocusShards(getCurrentContract().focus, 4);
        state.save.dailySupplyAt = Date.now();
        showToast(text('今日补给已到账。', 'Daily supply delivered.'));
        saveProgress();
        renderAll();
    }

    function buyShopItem(itemId) {
        const item = config.shopItems.find((entry) => entry.id === itemId);
        if (!item || item.free) return;
        if (item.requiresSponsor && !state.save.payment.passUnlocked) return showToast(text('需要先开通赞助。', 'Sponsor unlock is required first.'));
        const price = getShopPrice(itemId);
        if (item.priceType === 'gold') {
            if (state.save.gold < price) return showToast(text('金币不足。', 'Not enough gold.'));
            state.save.gold -= price;
        } else {
            if (state.save.dust < price) return showToast(text('熔尘不足。', 'Not enough dust.'));
            state.save.dust -= price;
        }
        grantReward(item.reward);
        grantFocusShards(getCurrentContract().focus, item.id === 'goldCrate' ? 6 : 4);
        state.save.shopPurchases[itemId] = getShopPurchaseCount(itemId) + 1;
        showToast(text('补给已到账。', 'Shop reward delivered.'));
        saveProgress();
        renderAll();
    }

    function buyPaymentOffer(offerId) {
        openPaymentModal(offerId);
        return;
        const offer = config.paymentOffers.find((entry) => entry.id === offerId);
        if (!offer) return;
        grantReward(offer.reward);
        state.save.payment.passUnlocked = true;
        state.save.payment.totalSpent = Number((state.save.payment.totalSpent + offer.price).toFixed(2));
        state.save.payment.purchaseCount += 1;
        state.save.permanent.heatCap += offer.permanent.heatCap || 0;
        state.save.permanent.rareRate += offer.permanent.rareRate || 0;
        state.save.permanent.dustYield += offer.permanent.dustYield || 0;
        state.save.permanent.catalystYield += offer.permanent.catalystYield || 0;
        grantFocusShards(getCurrentContract().focus, 10);
        showToast(text(`已模拟到账 ${localize(offer.name)}。`, `${localize(offer.name)} simulated successfully.`));
        saveProgress();
        renderAll();
    }

    function claimPaymentMilestone(milestoneId) {
        const milestone = config.paymentMilestones.find((item) => item.id === milestoneId);
        if (!milestone) return showToast(text('未找到该累充里程碑。', 'Payment milestone not found.'));
        const view = getMilestoneView(milestone);
        if (!view) return showToast(text('当前无法领取该累充里程碑。', 'This payment milestone cannot be claimed right now.'));
        if (view.claimed) return showToast(text('该累充里程碑已经领取过了。', 'This payment milestone has already been claimed.'));
        if (!view.claimable) {
            openPaymentModal(getMilestoneSummary().recommendedOfferId);
            return showToast(text('尚未达到该档位，已打开推荐礼包。', 'This tier is not reached yet. Opened the recommended pack.'));
        }
        grantReward(view.reward);
        applyPermanentBonus(view.permanent);
        state.save.payment.milestoneClaims[milestoneId] = true;
        showToast(text('累充里程碑奖励已领取。', 'Payment milestone claimed.'));
        saveProgress();
        renderAll();
    }

    function claimAllPaymentMilestones() {
        const claimable = config.paymentMilestones.map(getMilestoneView).filter((item) => item && item.claimable);
        if (!claimable.length) {
            const summary = getMilestoneSummary();
            return showToast(summary.nextThreshold > 0
                ? text(`当前没有可领取的累充奖励，距离下一档还差 $${summary.nextGap.toFixed(2)}。`, `No payment milestones are ready. $${summary.nextGap.toFixed(2)} more to the next tier.`)
                : text('当前没有可领取的累充奖励。', 'There are no payment milestones ready right now.'));
        }
        claimable.forEach((item) => {
            grantReward(item.reward);
            applyPermanentBonus(item.permanent);
            state.save.payment.milestoneClaims[item.id] = true;
        });
        showToast(text(`已领取 ${claimable.length} 个累充里程碑奖励。`, `Claimed ${claimable.length} payment milestone rewards.`));
        saveProgress();
        renderAll();
    }

    function grantReward(reward) {
        if (!reward) return;
        state.save.gold += Number(reward.gold) || 0;
        state.save.dust += Number(reward.dust) || 0;
        state.save.catalyst += Number(reward.catalyst) || 0;
        state.save.seasonXp += Number(reward.seasonXp) || 0;
        if (reward.sigils) {
            Object.entries(reward.sigils).forEach(([sigilId, amount]) => {
                state.save.sigilShards[sigilId] = getSigilShardCount(sigilId) + (Number(amount) || 0);
            });
        }
    }

    function grantFocusShards(familyIds = [], amount = 0) {
        if (!familyIds.length || amount <= 0) return;
        config.sigils.forEach((sigil) => {
            if (familyIds.includes(sigil.family)) {
                state.save.sigilShards[sigil.id] = getSigilShardCount(sigil.id) + amount;
            }
        });
    }

    function applyPermanentBonus(permanent, saveSnapshot = state.save) {
        if (!permanent || !saveSnapshot) return { heatCap: 0, rareRate: 0, dustYield: 0, catalystYield: 0 };
        const normalized = {
            heatCap: Number(permanent.heatCap) || 0,
            rareRate: Number(permanent.rareRate) || 0,
            dustYield: Number(permanent.dustYield) || 0,
            catalystYield: Number(permanent.catalystYield) || 0
        };
        saveSnapshot.permanent = {
            heatCap: Number(saveSnapshot.permanent?.heatCap || 0),
            rareRate: Number(saveSnapshot.permanent?.rareRate || 0),
            dustYield: Number(saveSnapshot.permanent?.dustYield || 0),
            catalystYield: Number(saveSnapshot.permanent?.catalystYield || 0)
        };
        saveSnapshot.permanent.heatCap += normalized.heatCap;
        saveSnapshot.permanent.rareRate += normalized.rareRate;
        saveSnapshot.permanent.dustYield += normalized.dustYield;
        saveSnapshot.permanent.catalystYield += normalized.catalystYield;
        return normalized;
    }

    function getCurrentContract() { return config.contracts[state.save.contractIndex] || config.contracts[0]; }
    function getTierMeta(tier) { return config.gemTiers.find((entry) => entry.tier === tier) || null; }
    function getWorkshopLevel(workshopId) { return Math.max(0, Number(state.save.workshopLevels[workshopId]) || 0); }
    function getSigilLevel(sigilId) { return Math.max(0, Number(state.save.sigilLevels[sigilId]) || 0); }
    function getSigilShardCount(sigilId) { return Math.max(0, Number(state.save.sigilShards[sigilId]) || 0); }

    function getWorkshopEffect(workshopId, level = getWorkshopLevel(workshopId)) {
        const item = workshopMap[workshopId];
        if (!item || level <= 0) return 0;
        return item.effectBase + item.effectStep * (level - 1);
    }

    function getWorkshopUpgradeCost(workshopId) {
        const item = workshopMap[workshopId];
        const level = getWorkshopLevel(workshopId);
        return { gold: Math.round(item.baseCostGold + item.costGoldStep * level), dust: Math.round(item.baseCostDust + item.costDustStep * level) };
    }

    function canUpgradeWorkshop(workshopId) {
        const item = workshopMap[workshopId];
        if (!item) return false;
        const level = getWorkshopLevel(workshopId);
        if (level >= item.maxLevel) return false;
        const cost = getWorkshopUpgradeCost(workshopId);
        return state.save.gold >= cost.gold && state.save.dust >= cost.dust;
    }

    function getSigilUpgradeCost(sigilId) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevel(sigilId);
        return { gold: Math.round(sigil.goldCostBase + sigil.goldCostStep * Math.max(0, level - 1)), shards: Math.round(sigil.shardCostBase + sigil.shardCostStep * Math.max(0, level - 1)) };
    }

    function getSigilPower(sigilId) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevel(sigilId);
        if (!sigil || level <= 0) return 0;
        return Math.round(sigil.baseScore + (level - 1) * (sigil.baseScore * 0.32 + 18));
    }

    function getSelectedSigils(saveSnapshot = state.save) {
        return saveSnapshot.selectedSigils.map((sigilId) => sigilMap[sigilId]).filter(Boolean).filter((sigil) => getSigilLevelForSave(sigil.id, saveSnapshot) > 0);
    }

    function getSelectedSigilPower(saveSnapshot = state.save) {
        return getSelectedSigils(saveSnapshot).reduce((sum, sigil) => sum + getSigilPowerForSave(sigil.id, saveSnapshot), 0);
    }

    function getSigilPassives(saveSnapshot = state.save) {
        const passive = { heatRegen: 0, rareRate: 0, dustYield: 0, catalystYield: 0, goldBonus: 0, doubleChance: 0, jumpChance: 0, batchDustBonus: 0, contractStability: 0, awakenPowerBonus: 0, bonusExtraGemChance: 0 };
        getSelectedSigils(saveSnapshot).forEach((sigil) => {
            const level = getSigilLevelForSave(sigil.id, saveSnapshot);
            switch (sigil.id) {
                case 'emberCore':
                    passive.goldBonus += 0.08 + level * 0.025;
                    passive.bonusExtraGemChance += 0.02 + level * 0.01;
                    break;
                case 'tideLoop':
                    passive.heatRegen += 0.12 + level * 0.08;
                    passive.batchDustBonus += 1 + Math.floor(level / 2);
                    break;
                case 'voltRelay':
                    passive.doubleChance += 0.05 + level * 0.025;
                    passive.jumpChance += 0.02 + level * 0.015;
                    break;
                case 'voidMirror':
                    passive.rareRate += 0.04 + level * 0.02;
                    passive.contractStability += 36 + level * 18;
                    break;
                case 'prismCrown':
                    passive.rareRate += 0.05 + level * 0.03;
                    passive.catalystYield += 0.04 + level * 0.02;
                    passive.awakenPowerBonus += 0.12 + level * 0.05;
                    break;
                default:
                    break;
            }
        });
        return passive;
    }

    function getHeatMax(saveSnapshot = state.save) {
        const sponsor = getSponsorTier(saveSnapshot);
        return Math.round(config.forgeBalance.heatMax + getWorkshopEffectForSave('heatCap', saveSnapshot) + (saveSnapshot.permanent?.heatCap || 0) + (sponsor.heatCapBonus || 0));
    }

    function getHeatRegenPerSecond(saveSnapshot = state.save) {
        return Number((0.28 + getWorkshopEffectForSave('heatRegen', saveSnapshot) + getSigilPassives(saveSnapshot).heatRegen).toFixed(2));
    }

    function getRareBonus(saveSnapshot = state.save) {
        const sponsor = getSponsorTier(saveSnapshot);
        const passive = getSigilPassives(saveSnapshot);
        return getWorkshopEffectForSave('rareRate', saveSnapshot) + (saveSnapshot.permanent?.rareRate || 0) + (sponsor.rareRateBonus || 0) + passive.rareRate;
    }

    function getDustBonus(saveSnapshot = state.save) {
        const sponsor = getSponsorTier(saveSnapshot);
        const passive = getSigilPassives(saveSnapshot);
        return getWorkshopEffectForSave('dustYield', saveSnapshot) + (saveSnapshot.permanent?.dustYield || 0) + (sponsor.dustYieldBonus || 0) + passive.dustYield;
    }

    function getCatalystBonus(saveSnapshot = state.save) {
        const sponsor = getSponsorTier(saveSnapshot);
        const passive = getSigilPassives(saveSnapshot);
        return getWorkshopEffectForSave('catalystRefine', saveSnapshot) + (saveSnapshot.permanent?.catalystYield || 0) + (sponsor.catalystYieldBonus || 0) + passive.catalystYield;
    }

    function getGoldBonus(saveSnapshot = state.save) { return getSigilPassives(saveSnapshot).goldBonus; }

    function getCurrentPower(saveSnapshot = state.save) {
        const sigilPower = getSelectedSigilPower(saveSnapshot);
        const gemScore = getTotalGemScore(saveSnapshot);
        const awakenedScore = getTotalAwakenedScore(saveSnapshot);
        const sponsor = getSponsorTier(saveSnapshot);
        const passive = getSigilPassives(saveSnapshot);
        const workshopPower = getWorkshopEffectForSave('heatCap', saveSnapshot) * 0.7 + getWorkshopEffectForSave('heatRegen', saveSnapshot) * 70 + getWorkshopEffectForSave('rareRate', saveSnapshot) * 2200 + getWorkshopEffectForSave('dustYield', saveSnapshot) * 540 + getWorkshopEffectForSave('catalystRefine', saveSnapshot) * 620;
        const permanentPower = (saveSnapshot.permanent?.heatCap || 0) * 0.7 + (saveSnapshot.permanent?.rareRate || 0) * 1800 + (saveSnapshot.permanent?.dustYield || 0) * 760 + (saveSnapshot.permanent?.catalystYield || 0) * 940;
        const sponsorPower = (sponsor.heatCapBonus || 0) * 0.75 + (sponsor.rareRateBonus || 0) * 1900 + (sponsor.dustYieldBonus || 0) * 860 + (sponsor.catalystYieldBonus || 0) * 980;
        const total = Math.round(36 + sigilPower + workshopPower + permanentPower + sponsorPower + gemScore * POWER_PER_GEM_SCORE + awakenedScore * (POWER_PER_AWAKEN_SCORE + passive.awakenPowerBonus));
        return { total, sigilPower: Math.round(sigilPower), workshopPower: Math.round(workshopPower), gemPower: Math.round(gemScore * POWER_PER_GEM_SCORE), awakenedPower: Math.round(awakenedScore * (POWER_PER_AWAKEN_SCORE + passive.awakenPowerBonus)), sponsorPower: Math.round(sponsorPower + permanentPower) };
    }

    function getTotalGemScore(saveSnapshot = state.save) {
        return Object.entries(saveSnapshot.gems || {}).reduce((sum, [key, count]) => {
            const parsed = parseGemKey(key);
            const tierMeta = getTierMeta(parsed.tier);
            return sum + (tierMeta ? tierMeta.score * (Number(count) || 0) : 0);
        }, 0);
    }

    function getTotalAwakenedScore(saveSnapshot = state.save) {
        return Object.entries(saveSnapshot.awakened || {}).reduce((sum, [key, count]) => {
            const parsed = parseGemKey(key);
            const tierMeta = getTierMeta(parsed.tier);
            return sum + (tierMeta ? tierMeta.score * (Number(count) || 0) : 0);
        }, 0);
    }

    function getGemInventoryRows() {
        const rows = [];
        config.gemFamilies.forEach((family) => {
            config.gemTiers.forEach((tierMeta) => {
                const key = buildGemKey(family.id, tierMeta.tier);
                const count = getGemCount(family.id, tierMeta.tier);
                const awakened = getAwakenedCount(key);
                const canFuse = count >= tierMeta.fuseNeed && tierMeta.tier < 5;
                const canAwaken = tierMeta.tier >= 3 && count >= 1 && state.save.catalyst >= tierMeta.awakenCatalyst;
                if (count > 0 || awakened > 0 || canFuse || canAwaken) {
                    rows.push({ key, familyId: family.id, tier: tierMeta.tier, count, awakened, score: tierMeta.score, canFuse, canAwaken, sort: (canFuse ? 10000 : 0) + (canAwaken ? 5000 : 0) + awakened * 600 + count * tierMeta.score });
                }
            });
        });
        return rows.sort((a, b) => b.sort - a.sort);
    }

    function getRecycleDustValue(tier, amount = 1) {
        const tierMeta = getTierMeta(tier);
        if (!tierMeta || amount <= 0) return 0;
        return Math.max(0, Math.round((Number(tierMeta.dismantleDust) || 0) * amount));
    }

    function getSmartRecycleKeepCount(familyId, tier) {
        const isFocusFamily = getCurrentContract().focus.includes(familyId);
        if (tier >= 4) return Number.POSITIVE_INFINITY;
        if (tier === 3) return isFocusFamily ? 3 : 1;
        return isFocusFamily ? 6 : 3;
    }

    function getSmartRecyclePlan() {
        const entries = [];
        let totalCount = 0;
        let totalDust = 0;

        config.gemFamilies.forEach((family) => {
            config.gemTiers.forEach((tierMeta) => {
                if (tierMeta.tier > 3) return;
                const count = getGemCount(family.id, tierMeta.tier);
                if (count <= 0) return;
                const keep = getSmartRecycleKeepCount(family.id, tierMeta.tier);
                const amount = Math.max(0, count - keep);
                if (amount <= 0) return;
                const dust = getRecycleDustValue(tierMeta.tier, amount);
                if (dust <= 0) return;
                entries.push({
                    key: buildGemKey(family.id, tierMeta.tier),
                    familyId: family.id,
                    tier: tierMeta.tier,
                    keep,
                    amount,
                    dust
                });
                totalCount += amount;
                totalDust += dust;
            });
        });

        return {
            entries,
            totalCount,
            totalDust,
            protectedCount: Math.max(0, getTotalGemCount() - totalCount)
        };
    }

    function getContractPreviewReward(contract, success = true) {
        const goldFactor = success ? 1 + getGoldBonus() : 0.58 + getGoldBonus() * 0.4;
        const dustFactor = success ? 1 + getDustBonus() : 0.64 + getDustBonus() * 0.4;
        const catalystFactor = success ? 1 + getCatalystBonus() : 0.42 + getCatalystBonus() * 0.35;
        return { gold: Math.round(contract.reward.gold * goldFactor), dust: Math.round(contract.reward.dust * dustFactor), catalyst: Math.max(1, Math.round(contract.reward.catalyst * catalystFactor)), seasonXp: success ? contract.reward.seasonXp : Math.round(contract.reward.seasonXp * 0.55) };
    }

    function getMissionMetric(missionId) {
        switch (missionId) {
            case 'm1': return state.save.stats.smelts;
            case 'm2': return state.save.stats.fuses;
            case 'm3': return state.save.stats.sigilUps;
            case 'm4': return state.save.bestContractIndex + 1;
            case 'm5': return state.save.stats.workshopUps;
            case 'm6': return state.save.stats.tier3Drops;
            case 'm7': return state.save.bestContractIndex + 1;
            case 'm8': return state.save.stats.fuses;
            case 'm9': return state.save.stats.tier4Drops;
            case 'm10': return state.save.bestContractIndex + 1;
            default: return 0;
        }
    }

    function getMissionView(mission) {
        if (!mission) return null;
        const progress = Math.min(mission.target, getMissionMetric(mission.id));
        const claimed = state.save.missionClaimed.includes(mission.id);
        const claimable = !claimed && progress >= mission.target;
        return { id: mission.id, title: localize(mission.title), desc: localize(mission.title), target: mission.target, progress, progressRate: mission.target > 0 ? progress / mission.target : 1, claimable, claimed, reward: mission.reward, sort: claimable ? 3000 : claimed ? 100 : 1000 + progress };
    }

    function getSeasonNodeView(node, sponsor = false) {
        const claimed = sponsor ? !!state.save.payment.premiumSeasonClaims[node.id] : state.save.seasonClaimed.includes(node.id);
        const claimable = sponsor ? isSponsorSeasonClaimable(node.id) : isSeasonClaimable(node.id);
        return { ...node, claimed, claimable, sort: claimable ? 3000 : claimed ? 100 : 1000 - node.xp };
    }

    function getMilestoneView(milestone) {
        if (!milestone) return null;
        const claimed = !!state.save.payment.milestoneClaims[milestone.id];
        const claimable = !claimed && Number(state.save.payment.totalSpent || 0) >= milestone.threshold;
        return { ...milestone, claimed, claimable };
    }

    function getMilestoneSummary() {
        const views = config.paymentMilestones.map(getMilestoneView);
        const claimable = views.filter((item) => item.claimable);
        const claimed = views.filter((item) => item.claimed);
        const next = views.find((item) => !item.claimed) || null;
        const spent = Number(state.save.payment.totalSpent || 0);
        return {
            totalCount: views.length,
            claimedCount: claimed.length,
            claimableCount: claimable.length,
            nextThreshold: next ? Number(next.threshold || 0) : 0,
            nextGap: next ? Math.max(0, Number(next.threshold || 0) - spent) : 0,
            nextReward: next?.reward || null,
            nextPermanent: next?.permanent || null,
            recommendedOfferId: next ? (getGrowthDiagnosis().recommendedOfferId || 'starter') : 'throne'
        };
    }

    function isSeasonClaimable(nodeId) {
        const node = config.seasonNodes.find((item) => item.id === nodeId);
        return !!node && !state.save.seasonClaimed.includes(node.id) && state.save.seasonXp >= node.xp;
    }

    function isSponsorSeasonClaimable(nodeId) {
        const node = config.sponsorSeasonNodes.find((item) => item.id === nodeId);
        return !!node && !!state.save.payment.passUnlocked && !state.save.payment.premiumSeasonClaims[node.id] && state.save.seasonXp >= node.xp;
    }

    function isDailySupplyReady() { return !state.save.dailySupplyAt || Date.now() - state.save.dailySupplyAt >= DAILY_SUPPLY_COOLDOWN_MS; }
    function getShopPurchaseCount(itemId) { return Math.max(0, Number(state.save.shopPurchases[itemId]) || 0); }

    function getShopPrice(itemId) {
        const item = config.shopItems.find((entry) => entry.id === itemId);
        if (!item || item.free) return 0;
        return Math.round(item.basePrice * Math.pow(1 + item.repeatGrowth, getShopPurchaseCount(itemId)));
    }

    function isShopItemReady(itemId) {
        const item = config.shopItems.find((entry) => entry.id === itemId);
        if (!item) return false;
        if (item.free) return isDailySupplyReady();
        if (item.requiresSponsor && !state.save.payment.passUnlocked) return false;
        const price = getShopPrice(itemId);
        return item.priceType === 'gold' ? state.save.gold >= price : state.save.dust >= price;
    }

    function getSponsorTier(saveSnapshot = state.save) {
        const spent = Number(saveSnapshot.payment?.totalSpent || 0);
        return config.sponsorTiers.slice().sort((a, b) => a.threshold - b.threshold).filter((tier) => spent >= tier.threshold).pop() || config.sponsorTiers[0];
    }

    function getProjectedSponsorTier(offer, saveSnapshot = state.save) {
        const spent = Number(saveSnapshot.payment?.totalSpent || 0) + Number(offer.price || 0);
        return config.sponsorTiers.slice().sort((a, b) => a.threshold - b.threshold).filter((tier) => spent >= tier.threshold).pop() || config.sponsorTiers[0];
    }

    function getPriorityWorkshopTarget() {
        const priorityOrder = ['rareRate', 'heatRegen', 'dustYield', 'catalystRefine', 'heatCap'];
        return priorityOrder.map((workshopId) => {
            const item = workshopMap[workshopId];
            if (!item) return null;
            const level = getWorkshopLevel(workshopId);
            if (level >= item.maxLevel) return null;
            const cost = getWorkshopUpgradeCost(workshopId);
            return {
                workshopId,
                item,
                cost,
                missingGold: Math.max(0, cost.gold - state.save.gold),
                missingDust: Math.max(0, cost.dust - state.save.dust),
                affordable: state.save.gold >= cost.gold && state.save.dust >= cost.dust
            };
        }).filter(Boolean)[0] || null;
    }

    function getPrioritySigilTarget() {
        const candidates = config.sigils.map((sigil) => {
            const level = getSigilLevel(sigil.id);
            const shardOwned = getSigilShardCount(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            const focus = getCurrentContract().focus.includes(sigil.family);
            const unlockReady = level <= 0 && shardOwned >= sigil.shardUnlock;
            const upgradeReady = level > 0 && level < 8 && state.save.gold >= cost.gold && shardOwned >= cost.shards;
            return {
                sigil,
                level,
                shardOwned,
                cost,
                focus,
                unlockReady,
                upgradeReady,
                missingGold: level > 0 ? Math.max(0, cost.gold - state.save.gold) : 0,
                missingShards: level > 0 ? Math.max(0, cost.shards - shardOwned) : Math.max(0, sigil.shardUnlock - shardOwned),
                score: (focus ? 1000 : 0) + (unlockReady ? 800 : 0) + (upgradeReady ? 700 : 0) + sigil.baseScore - level * 10
            };
        }).sort((left, right) => right.score - left.score);
        return candidates[0] || null;
    }

    function getGrowthDiagnosis() {
        const contract = getCurrentContract();
        const power = getCurrentPower().total;
        const effectivePower = getEffectiveContractPower();
        const powerGap = Math.max(0, contract.recommended - effectivePower);
        const inventoryRows = getGemInventoryRows();
        const fuseReadyCount = inventoryRows.filter((row) => row.canFuse).length;
        const awakenReadyCount = inventoryRows.filter((row) => row.canAwaken).length;
        const awakenCandidates = inventoryRows.filter((row) => row.tier >= 3 && row.count > 0).length;
        const sigilReadyCount = config.sigils.filter((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return (level <= 0 && getSigilShardCount(sigil.id) >= sigil.shardUnlock)
                || (level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards);
        }).length;
        const workshopReadyCount = config.workshop.filter((item) => canUpgradeWorkshop(item.id)).length;
        const workshopTarget = getPriorityWorkshopTarget();
        const sigilTarget = getPrioritySigilTarget();

        const targetGoldReserve = 600 + state.save.contractIndex * 360;
        const targetDustReserve = 70 + state.save.contractIndex * 45;
        const targetCatalystReserve = state.save.contractIndex <= 2
            ? 6 + state.save.contractIndex * 2
            : state.save.contractIndex <= 5
                ? 14 + state.save.contractIndex * 4
                : 28 + state.save.contractIndex * 6;

        const goldPressure = Math.max(0, targetGoldReserve - state.save.gold, workshopTarget?.missingGold || 0, sigilTarget?.missingGold || 0);
        const dustPressure = Math.max(0, targetDustReserve - state.save.dust, workshopTarget?.missingDust || 0);
        const catalystPressure = Math.max(0, targetCatalystReserve - state.save.catalyst, awakenCandidates > awakenReadyCount ? targetCatalystReserve - state.save.catalyst : 0);

        let pressureId = 'power';
        let title = text('战力仍有缺口', 'Power Gap Remains');
        let summary = text('当前最直接的推进问题仍然是合同有效战力不够。', 'The main issue right now is still not having enough effective contract power.');
        let freeTab = 'sigils';
        let freeLabel = text('去补符印', 'Raise Sigils');
        let freeShort = text('补符印', 'Sigils');

        if (powerGap <= 0) {
            pressureId = 'push';
            title = text('已经够线，直接推进', 'Ready to Push');
            summary = text(`当前已经达到合同 ${contract.id} 推荐线，优先去合同页推进，别让热量和免费补给空转。`, `You already meet the ${contract.id} contract line. Push contracts now so heat and free supplies do not sit idle.`);
            freeTab = 'contracts';
            freeLabel = text('去跑合同', 'Run Contract');
            freeShort = text('推进合同', 'Push');
        } else if (fuseReadyCount > 0 || awakenReadyCount > 0) {
            pressureId = 'forge';
            title = text('现有库存就能补强', 'Actionable Inventory Ready');
            summary = text(`你手上已经有 ${fuseReadyCount} 条可合成、${awakenReadyCount} 条可觉醒库存，先把现成成长吃掉，通常比直接充更划算。`, `You already have ${fuseReadyCount} fuse-ready and ${awakenReadyCount} awaken-ready rows. Use this growth first; it is usually more efficient than topping up immediately.`);
            freeTab = 'forge';
            freeLabel = text('去熔炉处理', 'Open Forge');
            freeShort = text('先合成', 'Forge');
        } else if (sigilReadyCount > 0) {
            pressureId = 'sigil';
            title = text('符印可升，优先补主印', 'Sigils Are Ready');
            summary = text(`当前至少有 ${sigilReadyCount} 个符印已经能解锁或升级，先补本章焦点符印，通常是最快的过线方式。`, `At least ${sigilReadyCount} sigils can already be unlocked or upgraded. Focus sigils are usually the fastest path to clear the current wall.`);
            freeTab = 'sigils';
            freeLabel = text('去补符印', 'Raise Sigils');
            freeShort = text('补符印', 'Sigils');
        } else if (workshopReadyCount > 0) {
            pressureId = 'workshop';
            title = text('工坊可点，先拉效率', 'Workshop Upgrade Ready');
            summary = text(`当前至少有 ${workshopReadyCount} 个工坊升级已能点出，优先补热量恢复和稀有率，熔炼效率会更平滑。`, `At least ${workshopReadyCount} workshop upgrades are already affordable. Prioritize heat regen and rare rate for smoother forge efficiency.`);
            freeTab = 'workshop';
            freeLabel = text('去点工坊', 'Open Workshop');
            freeShort = text('补工坊', 'Workshop');
        } else if (catalystPressure >= dustPressure && catalystPressure >= goldPressure && state.save.contractIndex >= 4) {
            pressureId = 'catalyst';
            title = text('催化剂开始卡觉醒', 'Catalyst Starts Gating');
            summary = text(`进入 ${contract.id} 后，催化剂会明显拖慢 T3+ 觉醒和后续推进，当前更像是“材料门槛”而不是纯战力门槛。`, `From ${contract.id} onward, catalyst starts slowing T3+ awakening and late pushes. The wall is now more about materials than pure power.`);
            freeTab = 'contracts';
            freeLabel = text('去刷合同回收', 'Farm Contracts');
            freeShort = text('补催化剂', 'Catalyst');
        } else if (dustPressure >= goldPressure && dustPressure > 0) {
            pressureId = 'dust';
            title = text('熔尘开始卡档', 'Dust Is Tight');
            summary = text(`你现在更缺的是中段熔尘，不补的话会拖慢高阶宝石与后续构筑节奏。`, `Dust is the tighter resource right now. Without more of it, higher-tier gem progress and later build tempo both slow down.`);
            freeTab = 'forge';
            freeLabel = text('去熔炉刷库存', 'Farm Forge');
            freeShort = text('补熔尘', 'Dust');
        } else if (goldPressure > 0) {
            pressureId = 'gold';
            title = text('金币开始吃紧', 'Gold Is Tight');
            summary = text(`当前主要被金币储备卡住：符印、工坊和合同推进都能做，但手头金币不够连起来。`, `Gold is the main bottleneck now: sigils, workshop, and contract pushes all want progress, but your current reserve cannot connect them smoothly.`);
            freeTab = 'contracts';
            freeLabel = text('去跑合同回金币', 'Farm Gold');
            freeShort = text('补金币', 'Gold');
        }

        let recommendedOfferId = 'starter';
        if (pressureId === 'push') {
            recommendedOfferId = state.save.payment.passUnlocked ? 'accelerator' : 'starter';
        } else if (pressureId === 'forge' || pressureId === 'sigil') {
            recommendedOfferId = state.save.contractIndex <= 2 ? 'starter' : state.save.contractIndex <= 5 ? 'accelerator' : 'rush';
        } else if (pressureId === 'workshop' || pressureId === 'gold') {
            recommendedOfferId = state.save.contractIndex <= 1 ? 'starter' : state.save.contractIndex <= 3 ? 'accelerator' : state.save.contractIndex <= 5 ? 'rush' : state.save.contractIndex <= 7 ? 'sovereign' : 'nexus';
        } else if (pressureId === 'dust') {
            recommendedOfferId = state.save.contractIndex <= 3 ? 'accelerator' : state.save.contractIndex <= 5 ? 'rush' : state.save.contractIndex <= 7 ? 'sovereign' : 'nexus';
        } else if (pressureId === 'catalyst') {
            recommendedOfferId = state.save.contractIndex <= 5 ? 'sovereign' : state.save.contractIndex <= 7 ? 'nexus' : 'throne';
        } else if (powerGap > 1800) {
            recommendedOfferId = 'throne';
        } else if (powerGap > 1100) {
            recommendedOfferId = 'nexus';
        } else if (powerGap > 700) {
            recommendedOfferId = 'sovereign';
        } else if (powerGap > 360) {
            recommendedOfferId = 'rush';
        } else if (powerGap > 160) {
            recommendedOfferId = 'accelerator';
        }

        return {
            pressureId,
            title,
            summary,
            freeTab,
            freeLabel,
            freeShort,
            contractId: contract.id,
            power,
            effectivePower,
            powerGap,
            goldPressure,
            dustPressure,
            catalystPressure,
            recommendedOfferId
        };
    }

    function getRecommendedPaymentOfferId() {
        return getGrowthDiagnosis().recommendedOfferId;
    }

    function getNextProgressSuggestion() {
        const contract = getCurrentContract();
        const power = getCurrentPower().total;
        const gap = contract.recommended - power;
        if (gap <= 0) return text('当前合同已经够线，优先去合同页执行推进，然后回熔炉把可合成的 T2/T3 继续往上抬。', 'You are already on the contract line, so run contracts first and then return to the forge to push fuse-ready T2/T3 gems further upward.');
        const fuseReady = getGemInventoryRows().filter((row) => row.canFuse).length;
        if (fuseReady > 0) return text(`当前有 ${fuseReady} 条可合成库存，先把高阶宝石做出来，再决定是否补符印或工坊。`, `You already have ${fuseReady} fuse-ready rows, so forge higher-tier gems first and then decide whether sigils or workshop need more resources.`);
        const sigilReady = config.sigils.some((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
        });
        if (sigilReady) return text('符印已经有可升级项，先补主印和共鸣槽，通常比盲目刷熔炼更快过线。', 'A sigil upgrade is already ready. Push your main and resonance slots first, which is usually faster than blind forging.');
        if (hasWorkshopRedDot()) return text('工坊已有可点项，优先热量恢复 / 稀有率强化，把熔炼效率拉上来。', 'The workshop already has an upgrade ready. Prioritize heat regen or rare rate to lift forge efficiency.');
        return text('当前还是资源积累阶段：继续熔炼、做每日免费，并在合同焦点家族上滚库存。', 'You are still in the resource build-up phase: keep forging, claim the daily free box, and stack stock on the current contract focus families.');
    }

    function getWorkshopRelationCopy(workshopId, currentEffect, nextEffect) {
        switch (workshopId) {
            case 'heatCap': return text(`热量上限决定你每轮能连续熔炼多少次；当前 +${formatCompact(currentEffect)}，下一级会到 +${formatCompact(nextEffect)}。`, `Heat cap controls how many smelts you can chain in one session; current +${formatCompact(currentEffect)}, next +${formatCompact(nextEffect)}.`);
            case 'heatRegen': return text(`热量恢复越高，空档越短；当前 +${formatCompact(currentEffect)}/秒，下一级会到 +${formatCompact(nextEffect)}/秒。`, `Higher heat regen shortens downtime; current +${formatCompact(currentEffect)}/s, next +${formatCompact(nextEffect)}/s.`);
            case 'rareRate': return text(`稀有率直接提高 T2/T3 产线，是合同战力的主来源之一；当前 +${formatPercent(currentEffect)}。`, `Rare rate directly lifts T2/T3 flow and is one of the main sources of contract power; current +${formatPercent(currentEffect)}.`);
            case 'dustYield': return text(`熔尘决定中期是否会卡升阶；当前回收 +${formatPercent(currentEffect)}。`, `Dust yield decides whether midgame ascension stalls; current return +${formatPercent(currentEffect)}.`);
            case 'catalystRefine': return text(`催化剂会在 T3+ 觉醒和后期合同形成硬门槛；当前提炼 +${formatPercent(currentEffect)}。`, `Catalyst becomes a hard gate around T3+ awakening and late contracts; current refine +${formatPercent(currentEffect)}.`);
            default: return '';
        }
    }

    function formatWorkshopEffect(workshopId, value) {
        if (workshopId === 'heatCap') return `+${formatCompact(value)}`;
        if (workshopId === 'heatRegen') return `${formatCompact(value)}/s`;
        return `+${formatPercent(value)}`;
    }

    function hasForgeRedDot() { return getGemInventoryRows().some((row) => row.canFuse || row.canAwaken) || state.save.heat >= getHeatMax() * 0.92; }
    function hasContractRedDot() { return getCurrentPower().total + getSigilPassives().contractStability >= getCurrentContract().recommended; }
    function hasWorkshopRedDot() { return config.workshop.some((item) => canUpgradeWorkshop(item.id)); }
    function hasMissionRedDot() { return config.missions.some((mission) => { const view = getMissionView(mission); return view && view.claimable; }); }
    function hasSeasonRedDot() { return config.seasonNodes.some((node) => isSeasonClaimable(node.id)) || config.sponsorSeasonNodes.some((node) => isSponsorSeasonClaimable(node.id)); }
    function hasShopRedDot() {
        return isDailySupplyReady()
            || (!!currentPaymentOrder && !isPaymentOrderSettledLocally(currentPaymentOrder))
            || config.paymentMilestones.some((milestone) => {
                const view = getMilestoneView(milestone);
                return view && view.claimable;
            });
    }

    function hasSigilRedDot() {
        return config.sigils.some((sigil) => {
            const level = getSigilLevel(sigil.id);
            const unlockReady = level <= 0 && getSigilShardCount(sigil.id) >= sigil.shardUnlock;
            const cost = getSigilUpgradeCost(sigil.id);
            const upgradeReady = level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
            return unlockReady || upgradeReady;
        });
    }

    function getSigilSortScore(sigilId) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevel(sigilId);
        const equipped = state.save.selectedSigils.includes(sigilId) ? 1000 : 0;
        const focus = getCurrentContract().focus.includes(sigil.family) ? 220 : 0;
        const unlockReady = level <= 0 && getSigilShardCount(sigilId) >= sigil.shardUnlock ? 420 : 0;
        const cost = getSigilUpgradeCost(sigilId);
        const upgradeReady = level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigilId) >= cost.shards ? 360 : 0;
        return equipped + focus + unlockReady + upgradeReady + level * 32 + sigil.baseScore;
    }

    function getSigilLevelForSave(sigilId, saveSnapshot) { return Math.max(0, Number(saveSnapshot?.sigilLevels?.[sigilId]) || 0); }
    function getSigilPowerForSave(sigilId, saveSnapshot) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevelForSave(sigilId, saveSnapshot);
        if (!sigil || level <= 0) return 0;
        return Math.round(sigil.baseScore + (level - 1) * (sigil.baseScore * 0.32 + 18));
    }
    function getWorkshopEffectForSave(workshopId, saveSnapshot) {
        const item = workshopMap[workshopId];
        const level = Math.max(0, Number(saveSnapshot?.workshopLevels?.[workshopId]) || 0);
        if (!item || level <= 0) return 0;
        return item.effectBase + item.effectStep * (level - 1);
    }

    function addGem(familyId, tier, amount) {
        const key = buildGemKey(familyId, tier);
        state.save.gems[key] = Math.max(0, (Number(state.save.gems[key]) || 0) + amount);
        if (!state.save.gems[key]) delete state.save.gems[key];
    }
    function getGemCount(familyId, tier) { return Math.max(0, Number(state.save.gems[buildGemKey(familyId, tier)]) || 0); }
    function getAwakenedCount(key) { return Math.max(0, Number(state.save.awakened[key]) || 0); }
    function getTotalGemCount() { return Object.values(state.save.gems).reduce((sum, value) => sum + (Number(value) || 0), 0); }
    function buildGemKey(familyId, tier) { return `${familyId}:${tier}`; }
    function parseGemKey(key) { const [familyId, tierText] = String(key || '').split(':'); return { familyId, tier: Number(tierText) || 0 }; }
    function getSlotName(slotId) { if (slotId === 'main') return text('主熔槽', 'Main Slot'); if (slotId === 'echo') return text('共鸣槽', 'Echo Slot'); return text('余烬槽', 'Ember Slot'); }
    function getPityLabel(pityType) { if (pityType === 't4') return text('T4 保底', 'T4 Pity'); if (pityType === 't3') return text('T3 保底', 'T3 Pity'); return ''; }
    function compareNodeState(a, b) { return (b.sort || 0) - (a.sort || 0); }
    function mergeRewards(...rewards) { return rewards.filter(Boolean).reduce((merged, reward) => { merged.gold += Number(reward.gold) || 0; merged.dust += Number(reward.dust) || 0; merged.catalyst += Number(reward.catalyst) || 0; merged.seasonXp += Number(reward.seasonXp) || 0; if (reward.sigils) { Object.entries(reward.sigils).forEach(([sigilId, amount]) => { merged.sigils[sigilId] = (merged.sigils[sigilId] || 0) + (Number(amount) || 0); }); } return merged; }, { gold: 0, dust: 0, catalyst: 0, seasonXp: 0, sigils: {} }); }
    function getEffectiveContractPower(saveSnapshot = state.save) {
        return getCurrentPower(saveSnapshot).total + getSigilPassives(saveSnapshot).contractStability;
    }

    function getHighestClearableContractIndex(saveSnapshot = state.save) {
        const effectivePower = getEffectiveContractPower(saveSnapshot);
        let bestIndex = -1;
        config.contracts.forEach((contract, index) => {
            if (effectivePower >= contract.recommended && index > bestIndex) bestIndex = index;
        });
        return bestIndex;
    }

    function getContractLabel(index) {
        return index >= 0 && config.contracts[index] ? config.contracts[index].id : text('未过 1-1', 'Below 1-1');
    }

    function getProjectedOfferImpact(offer, saveSnapshot = state.save) {
        const projected = clone(saveSnapshot);
        projected.payment = { ...(saveSnapshot.payment || {}) };
        projected.permanent = { ...(saveSnapshot.permanent || {}) };
        projected.payment.passUnlocked = true;
        projected.payment.totalSpent = Number((Number(projected.payment.totalSpent || 0) + Number(offer.price || 0)).toFixed(2));
        projected.payment.purchaseCount = Number(projected.payment.purchaseCount || 0) + 1;
        projected.permanent.heatCap = Number(projected.permanent.heatCap || 0) + Number(offer.permanent?.heatCap || 0);
        projected.permanent.rareRate = Number(projected.permanent.rareRate || 0) + Number(offer.permanent?.rareRate || 0);
        projected.permanent.dustYield = Number(projected.permanent.dustYield || 0) + Number(offer.permanent?.dustYield || 0);
        projected.permanent.catalystYield = Number(projected.permanent.catalystYield || 0) + Number(offer.permanent?.catalystYield || 0);

        const currentPower = getCurrentPower(saveSnapshot);
        const projectedPower = getCurrentPower(projected);
        const contract = config.contracts[saveSnapshot.contractIndex] || config.contracts[0];
        const currentGap = Math.max(0, contract.recommended - getEffectiveContractPower(saveSnapshot));
        const projectedGap = Math.max(0, contract.recommended - getEffectiveContractPower(projected));
        const currentReachIndex = getHighestClearableContractIndex(saveSnapshot);
        const projectedReachIndex = getHighestClearableContractIndex(projected);

        return {
            contractId: contract.id,
            currentTier: getSponsorTier(saveSnapshot),
            projectedTier: getSponsorTier(projected),
            powerGain: Math.max(0, projectedPower.total - currentPower.total),
            currentGap,
            projectedGap,
            currentReachIndex,
            projectedReachIndex,
            reachGain: Math.max(0, projectedReachIndex - currentReachIndex),
            unlocksPass: !saveSnapshot.payment?.passUnlocked
        };
    }
    function getVisibleSigils(limit = 4) {
        const sorted = config.sigils.slice().sort((a, b) => getSigilSortScore(b.id) - getSigilSortScore(a.id));
        const visible = [];
        const seen = new Set();

        function pushMatches(predicate) {
            sorted.forEach((sigil) => {
                if (visible.length >= limit || seen.has(sigil.id) || !predicate(sigil)) return;
                seen.add(sigil.id);
                visible.push(sigil);
            });
        }

        pushMatches((sigil) => state.save.selectedSigils.includes(sigil.id) && getSigilLevel(sigil.id) > 0);
        pushMatches((sigil) => getSigilLevel(sigil.id) <= 0 && getSigilShardCount(sigil.id) >= sigil.shardUnlock);
        pushMatches((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
        });
        pushMatches((sigil) => getCurrentContract().focus.includes(sigil.family));
        pushMatches(() => true);
        return visible;
    }

    function getSigilTabSummary() {
        const unlockedCount = config.sigils.filter((sigil) => getSigilLevel(sigil.id) > 0).length;
        const unlockReadyCount = config.sigils.filter((sigil) => getSigilLevel(sigil.id) <= 0 && getSigilShardCount(sigil.id) >= sigil.shardUnlock).length;
        const upgradeReadyCount = config.sigils.filter((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
        }).length;
        const focusFamilies = getCurrentContract().focus.slice();
        const focusCount = config.sigils.filter((sigil) => focusFamilies.includes(sigil.family)).length;
        return { unlockedCount, unlockReadyCount, upgradeReadyCount, focusCount, focusFamilies };
    }

    function renderLatestResultCard(result, options = {}) {
        if (!result) return '';
        if (result.type === 'contract') return renderContractSettlementCard(result, options);
        return `
            <article class="gf-result-box ${result.success === true ? 'is-success' : result.success === false ? 'is-warning' : ''}">
                <strong>${text('最近结果', 'Latest Result')} · ${result.title}</strong>
                <p>${result.copy}</p>
                ${(result.reward || result.permanent) ? `
                    <div class="gf-chip-row" style="margin-top:10px;">
                        ${renderRewardChips(result.reward, { limit: 4 })}
                        ${renderPermanentChips(result.permanent, { limit: 3 })}
                    </div>
                ` : ''}
                <div class="gf-chip-row" style="margin-top:10px;">
                    ${(result.tags || []).map((tag) => `<span class="gf-chip is-strong">${tag}</span>`).join('')}
                </div>
            </article>
        `;
    }

    function renderContractSettlementCard(result, options = {}) {
        const compact = !!options.compact;
        const nextValue = result.success
            ? (result.atCap ? text('当前版本上限', 'Current cap') : (result.nextContractId || text('继续刷当前档', 'Farm current')))
            : result.focusFamilies.map((familyId) => localize(familyMap[familyId].name)).join(' / ');
        const primaryAction = result.success
            ? (result.atCap
                ? `<button class="primary-btn" type="button" data-action="runContract" data-value="${result.contractIndex}">${text('再刷一轮', 'Run Again')}</button>`
                : `<button class="primary-btn" type="button" data-action="runContract" data-value="${result.nextContractIndex}">${text('冲下一档', 'Push Next')}</button>`)
            : `<button class="primary-btn" type="button" data-action="openTab" data-value="sigils">${text('先补符印', 'Raise Sigils')}</button>`;
        const secondaryAction = result.success
            ? `<button class="ghost-btn" type="button" data-action="openTab" data-value="${result.nextGap > 0 ? 'sigils' : 'forge'}">${result.nextGap > 0 ? text('去补符印', 'Raise Sigils') : text('回熔炉补库', 'Back to Forge')}</button>`
            : `<button class="ghost-btn" type="button" data-action="openTab" data-value="workshop">${text('补工坊', 'Workshop')}</button>`;

        return `
            <article class="gf-result-box ${result.success ? 'is-success' : 'is-warning'}">
                <strong>${options.context === 'contracts' ? text('本次结算', 'Settlement') : text('最近合同结算', 'Latest Contract')} · ${result.contractId}</strong>
                <p>${result.copy}</p>
                ${renderKpiGrid([
                    { label: text('有效战力', 'Effective Power'), value: formatCompact(result.effectivePower) },
                    { label: text('推荐线', 'Recommended'), value: formatCompact(result.recommended) },
                    { label: result.success ? text('超出', 'Overflow') : text('缺口', 'Gap'), value: formatCompact(result.success ? Math.max(0, result.effectivePower - result.recommended) : result.gap) },
                    { label: result.success ? text('下一目标', 'Next Target') : text('建议补强', 'Next Step'), value: nextValue }
                ])}
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${renderRewardChips(result.reward, { limit: compact ? 3 : 4 })}
                    ${result.focusFamilies.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                    ${result.unlockedNext ? `<span class="gf-chip is-success">${text('已解锁下一档', 'Next unlocked')}</span>` : ''}
                    <span class="gf-chip ${result.success ? 'is-strong' : 'is-warning'}">${result.success ? text('推进成功', 'Push cleared') : text('先补强再回打', 'Upgrade then retry')}</span>
                </div>
                <div class="gf-action-row gf-result-actions" style="margin-top:12px;">
                    ${primaryAction}
                    ${secondaryAction}
                </div>
            </article>
        `;
    }

    renderForgeTab = function renderForgeTabEnhanced() {
        const contract = getCurrentContract();
        const effectivePower = getEffectiveContractPower();
        const inventoryRows = getGemInventoryRows();
        const fuseReady = inventoryRows.filter((row) => row.canFuse);
        const awakenReady = inventoryRows.filter((row) => row.canAwaken);
        const lastResult = state.save.lastResult;
        const forgeResult = lastResult && lastResult.type !== 'contract' ? lastResult : null;
        const recyclePlan = getSmartRecyclePlan();
        const relicSummary = getForgeRelicSummary();
        const actionableRows = inventoryRows.filter((row) => row.canFuse || row.canAwaken).slice(0, 3);
        const previewRows = actionableRows.length ? actionableRows : inventoryRows.slice(0, 3);

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('熔炉', 'Forge'),
                '',
                `<div class="gf-chip">${contract.id} · ${text('焦点', 'Focus')} ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')}</div>`
            )}
            ${renderForgeStageCard({ contract, effectivePower })}
            <div class="gf-inline-grid gf-inline-grid--four">
                <div class="gf-inline-pill"><span>${text('可合成', 'Fuse Ready')}</span><strong>${formatCompact(fuseReady.length)}</strong></div>
                <div class="gf-inline-pill"><span>${text('可觉醒', 'Awaken Ready')}</span><strong>${formatCompact(awakenReady.length)}</strong></div>
                <div class="gf-inline-pill"><span>${text('可回收尘', 'Recycle Dust')}</span><strong>${formatCompact(recyclePlan.totalDust)}</strong></div>
                <div class="gf-inline-pill"><span>${text('珍藏柜', 'Relics')}</span><strong>${formatCompact(relicSummary.count)}</strong></div>
            </div>
            ${renderLatestResultCard(forgeResult, { context: 'forge', compact: true })}
            <article class="gf-list-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('熔炉捷径', 'Forge Routes')}</div>
                        <div class="gf-card-title">${text('熔炉页只保留控火和产出，完整藏柜与追逐改到合同页签查看。', 'Forge now focuses on control and output. Full cabinet and chase views move to Contracts.')}</div>
                    </div>
                    <div class="gf-card-number">${contract.id}</div>
                </div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    <span class="gf-chip is-strong">${text('焦点线', 'Focus')} · ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')}</span>
                    <span class="gf-chip">${text('珍藏数', 'Relics')} · ${formatCompact(relicSummary.count)}</span>
                    <span class="gf-chip">${text('连击', 'Streak')} · x${formatCompact(relicSummary.combo)}</span>
                    <span class="gf-chip">${text('保底', 'Pity')} · ${formatCompact(relicSummary.pityRemain)}</span>
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="contracts">${text('查看章节藏柜', 'Open Cabinet')}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="contracts">${text('查看珍藏追逐', 'Open Chase')}</button>
                </div>
            </article>
            <article class="gf-list-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('当前可操作', 'Action Queue')}</div>
                        <div class="gf-card-title">${previewRows.length ? text('先处理这几条，再继续开炉', 'Handle these first, then keep forging') : text('先开一炉拿第一批宝石', 'Forge once to get the first stock')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getTotalGemCount())}</div>
                </div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    <span class="gf-chip">${text('总库存', 'Total Gems')} · ${formatCompact(getTotalGemCount())}</span>
                    <span class="gf-chip">${text('焦点家族', 'Focus')} · ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')}</span>
                    ${recyclePlan.entries.length ? `<span class="gf-chip is-warning">${text('安全回收', 'Safe Recycle')} · ${formatCompact(recyclePlan.totalCount)}</span>` : ''}
                </div>
                <div class="gf-list gf-list--compact" style="margin-top:12px;">
                    ${previewRows.length ? previewRows.map(renderCompactGemActionRow).join('') : `<div class="gf-empty">${text('当前还没有库存，先点“立即熔炼”启动循环。', 'There is no stock yet. Tap Smelt Now to start the loop.')}</div>`}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="ghost-btn" type="button" data-action="smartRecycle">${recyclePlan.entries.length ? text(`一键回收 +${formatCompact(recyclePlan.totalDust)} 尘`, `Smart Recycle +${formatCompact(recyclePlan.totalDust)}`) : text('当前无可回收', 'No Recycle Now')}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="contracts">${text('去推进合同', 'Push Contracts')}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="sigils">${text('去补符印', 'Raise Sigils')}</button>
                </div>
                ${inventoryRows.length > previewRows.length ? `<div class="gf-empty" style="margin-top:12px;">${text(`其余 ${inventoryRows.length - previewRows.length} 条库存已折叠，避免手机单屏信息过载。`, `${inventoryRows.length - previewRows.length} more rows are collapsed to keep the mobile screen readable.`)}</div>` : ''}
            </article>
        `;
    };

    renderContractsTab = function renderContractsTabEnhanced() {
        const currentPower = getCurrentPower();
        const passives = getSigilPassives();
        const effectivePower = currentPower.total + passives.contractStability;
        const lastResult = state.save.lastResult;
        const diagnosis = getGrowthDiagnosis();
        const compactContracts = getVisibleContractViews(4);
        const currentContract = getCurrentContract();
        const nextPreview = config.contracts[Math.min(config.contracts.length - 1, state.save.bestContractIndex + 1)] || currentContract;
        const hiddenCount = Math.max(0, compactContracts.totalRelevant - compactContracts.visible.length);

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('合同推进', 'Contracts'),
                '',
                `<div class="gf-chip">${text('最高推进', 'Best')} · ${config.contracts[state.save.bestContractIndex].id}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card ${Math.max(0, currentContract.recommended - effectivePower) <= 0 ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('当前目标', 'Current Goal')}</div>
                            <div class="gf-card-title">${currentContract.id} · ${localize(currentContract.name)}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('基础战力', 'Base Power'), value: formatCompact(currentPower.total) },
                        { label: text('稳定补正', 'Stability'), value: `+${formatCompact(passives.contractStability)}` },
                        { label: text('推荐线', 'Recommended'), value: formatCompact(currentContract.recommended) },
                        { label: text('缺口', 'Gap'), value: formatCompact(Math.max(0, currentContract.recommended - effectivePower)) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${currentContract.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                        <span class="gf-chip ${Math.max(0, currentContract.recommended - effectivePower) > 0 ? 'is-warning' : 'is-success'}">${Math.max(0, currentContract.recommended - effectivePower) > 0 ? text('仍需补强', 'Need More Power') : text('已够线', 'Ready')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="runContract" data-value="${state.save.contractIndex}">${text('执行当前合同', 'Run Contract')}</button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="${diagnosis.freeTab}">${diagnosis.freeLabel}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('推进快照', 'Route Snapshot')}</div>
                            <div class="gf-card-title">${currentContract.id} → ${nextPreview.id}</div>
                        </div>
                        <div class="gf-card-number">${diagnosis.freeShort}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('当前档', 'Current'), value: currentContract.id },
                        { label: text('下一档', 'Next'), value: nextPreview.id },
                        { label: text('本档金币', 'Gold'), value: formatCompact(getContractPreviewReward(currentContract).gold) },
                        { label: text('建议', 'Next Step'), value: diagnosis.freeShort }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${diagnosis.title}</span>
                        ${nextPreview.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                    </div>
                </article>
            </div>
            ${lastResult?.type === 'contract' ? renderContractSettlementCard(lastResult, { context: 'contracts', compact: true }) : ''}
            ${renderRelicCabinetCard()}
            ${renderRelicChaseCard(currentContract)}
            <div class="gf-list gf-list--compact">
                ${compactContracts.visible.map(renderContractCompactRow).join('')}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 档合同已折叠，只保留当前最该看的几档。`, `${hiddenCount} more contracts are collapsed so the most relevant stages stay on screen.`)}</div>` : ''}
        `;
    };

    renderSigilsTab = function renderSigilsTabEnhanced() {
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, level, index };
        });
        const totalShards = Object.values(state.save.sigilShards).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const visibleSigils = getVisibleSigils(4);
        const summary = getSigilTabSummary();
        const hiddenCount = Math.max(0, config.sigils.length - visibleSigils.length);
        const priorityTarget = getPrioritySigilTarget();
        const prioritySigil = priorityTarget?.sigil || null;
        const priorityLevel = prioritySigil ? getSigilLevel(prioritySigil.id) : 0;
        const priorityUpgradeCost = prioritySigil ? getSigilUpgradeCost(prioritySigil.id) : { gold: 0, shards: 0 };
        const priorityReady = priorityTarget ? (priorityLevel <= 0 ? priorityTarget.unlockReady : priorityTarget.upgradeReady) : false;

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('符印', 'Sigils'),
                '',
                `<div class="gf-chip">${text('总碎片', 'Total Shards')} · ${formatCompact(totalShards)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('装配摘要', 'Loadout Summary')}</div>
                            <div class="gf-card-title">${text('先处理可升级、可解锁和本章焦点。', 'Handle ready upgrades, unlocks, and current focus first.')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(getSelectedSigilPower())}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('已解锁', 'Unlocked'), value: formatCompact(summary.unlockedCount) },
                        { label: text('可升级', 'Ready Up'), value: formatCompact(summary.upgradeReadyCount) },
                        { label: text('可解锁', 'Ready Unlock'), value: formatCompact(summary.unlockReadyCount) },
                        { label: text('焦点数', 'Focus Count'), value: formatCompact(summary.focusCount) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${summary.focusFamilies.map((familyId) => `<span class="gf-chip is-success">${localize(familyMap[familyId].name)}</span>`).join('')}
                        ${hiddenCount > 0 ? `<span class="gf-chip">${text(`其余 ${hiddenCount} 个已折叠`, `${hiddenCount} more collapsed`)}</span>` : ''}
                    </div>
                </article>
                <article class="gf-card ${priorityReady ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('下一目标', 'Next Target')}</div>
                            <div class="gf-card-title">${prioritySigil ? localize(prioritySigil.name) : text('先回熔炉刷焦点碎片', 'Forge for focus shards first')}</div>
                        </div>
                        <div class="gf-card-number">${prioritySigil ? formatCompact(getSigilPower(prioritySigil.id)) : '-'}</div>
                    </div>
                    ${prioritySigil ? renderKpiGrid([
                        { label: text('当前', 'Current'), value: `Lv.${priorityLevel}` },
                        { label: text('碎片', 'Shards'), value: `${formatCompact(getSigilShardCount(prioritySigil.id))}/${formatCompact(priorityLevel > 0 ? priorityUpgradeCost.shards : prioritySigil.shardUnlock)}` },
                        { label: text('金币', 'Gold'), value: priorityLevel > 0 ? formatCompact(priorityUpgradeCost.gold) : '-' },
                        { label: text('槽位', 'Slot'), value: getSlotName(prioritySigil.slot) }
                    ]) : renderKpiGrid([
                        { label: text('当前合同', 'Contract'), value: getCurrentContract().id },
                        { label: text('建议', 'Next'), value: text('回熔炉', 'Forge') },
                        { label: text('焦点家族', 'Focus'), value: getCurrentContract().focus.map((familyId) => localize(familyMap[familyId].name)).join('/') },
                        { label: text('可升符印', 'Ready Up'), value: formatCompact(summary.upgradeReadyCount) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${prioritySigil ? `<span class="gf-chip">${localize(familyMap[prioritySigil.family].name)}</span>` : ''}
                        ${prioritySigil && getCurrentContract().focus.includes(prioritySigil.family) ? `<span class="gf-chip is-success">${text('本章焦点', 'Focus')}</span>` : ''}
                        ${prioritySigil && state.save.selectedSigils.includes(prioritySigil.id) ? `<span class="gf-chip is-strong">${text('已装配', 'Equipped')}</span>` : ''}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${priorityReady ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${prioritySigil ? (priorityLevel > 0 ? 'upgradeSigil' : 'unlockSigil') : 'openTab'}" data-value="${prioritySigil ? prioritySigil.id : 'forge'}">${prioritySigil ? (priorityLevel > 0 ? text('立即升级', 'Upgrade Now') : text('立即解锁', 'Unlock Now')) : text('返回熔炉', 'Back to Forge')}</button>
                    </div>
                </article>
            </div>
            <div class="gf-mini-slot-grid">
                ${slotCards.map(renderMiniSlotCard).join('')}
            </div>
            <div class="gf-list gf-list--compact">
                ${visibleSigils.map(renderSigilCompactRow).join('')}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 个低优先符印已折叠，先把当前最关键的几项做完。`, `${hiddenCount} lower-priority sigils are collapsed. Finish the key ones first.`)}</div>` : ''}
        `;
    };

    renderPaymentOffer = function renderPaymentOfferEnhanced(offer) {
        const projected = getProjectedOfferImpact(offer);
        return `
            <article class="gf-compact-row ${projected.powerGain > 0 ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(offer.name)}</div>
                    <div class="gf-compact-sub">${projected.currentGap > projected.projectedGap
                        ? text(`预计缩小差距 ${formatCompact(projected.currentGap - projected.projectedGap)}，并立即补一波资源。`, `Cuts the gap by ${formatCompact(projected.currentGap - projected.projectedGap)} and instantly refills resources.`)
                        : text('直接补金币 / 熔尘 / 催化，并抬升常驻赞助属性。', 'Directly refills gold / dust / catalyst and raises permanent sponsor stats.')}</div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(offer.reward, { limit: 3 })}
                        <span class="gf-chip is-strong">${text('战力', 'Power')} +${formatCompact(projected.powerGain)}</span>
                        ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text('预计推进', 'Reach')} +${projected.reachGain}</span>` : ''}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>$${offer.price.toFixed(2)}</strong>
                    <button class="primary-btn" type="button" data-action="buyOffer" data-value="${offer.id}">${text('链上支付', 'Pay')}</button>
                </div>
            </article>
        `;
    };
    smeltOne = wrapActionWithMotion(smeltOne, 'forge', 420);
    smeltBatch = wrapActionWithMotion(smeltBatch, 'forge', 420);
    fuseGem = wrapActionWithMotion(fuseGem, 'forge', 420);
    awakenGem = wrapActionWithMotion(awakenGem, 'upgrade', 440);
    salvageGem = wrapActionWithMotion(salvageGem, 'forge', 380);
    smartRecycleGems = wrapActionWithMotion(smartRecycleGems, 'forge', 400);
    selectContract = wrapActionWithMotion(selectContract, 'tab', 280);
    unlockSigil = wrapActionWithMotion(unlockSigil, 'upgrade', 440);
    equipSigil = wrapActionWithMotion(equipSigil, 'tab', 280);
    upgradeSigil = wrapActionWithMotion(upgradeSigil, 'upgrade', 440);
    upgradeWorkshop = wrapActionWithMotion(upgradeWorkshop, 'upgrade', 440);
    claimMission = wrapActionWithMotion(claimMission, 'claim', 440);
    claimAllMissions = wrapActionWithMotion(claimAllMissions, 'claim', 440);
    claimSeasonNode = wrapActionWithMotion(claimSeasonNode, 'claim', 440);
    claimSponsorSeasonNode = wrapActionWithMotion(claimSponsorSeasonNode, 'claim', 440);
    claimAllSeason = wrapActionWithMotion(claimAllSeason, 'claim', 440);
    claimDailySupply = wrapActionWithMotion(claimDailySupply, 'claim', 440);
    buyShopItem = wrapActionWithMotion(buyShopItem, 'claim', 420);
    claimPaymentMilestone = wrapActionWithMotion(claimPaymentMilestone, 'claim', 440);
    claimAllPaymentMilestones = wrapActionWithMotion(claimAllPaymentMilestones, 'claim', 440);
    runContract = function runContractEnhanced(index) {
        if (!Number.isFinite(index) || index < 0 || index >= config.contracts.length) return;
        if (index > state.save.bestContractIndex + 1) return showToast(text('前一档还没打通。', 'This contract is not unlocked yet.'));
        const contract = config.contracts[index];
        const bestBefore = state.save.bestContractIndex;
        const power = getCurrentPower().total;
        const passives = getSigilPassives();
        const effectivePower = power + passives.contractStability;
        const success = effectivePower >= contract.recommended;
        const reward = getContractPreviewReward(contract, success);
        grantReward(reward);
        grantFocusShards(contract.focus, success ? 8 + index * 2 : 4 + index);
        state.save.stats.contractRuns += 1;
        if (success) {
            state.save.stats.contractWins += 1;
            if (index >= state.save.bestContractIndex) state.save.bestContractIndex = Math.min(config.contracts.length - 1, index + 1);
            state.save.contractIndex = Math.min(config.contracts.length - 1, Math.max(state.save.contractIndex, index + 1));
        }

        const nextContractIndex = success ? Math.min(config.contracts.length - 1, index + 1) : index;
        const nextContract = config.contracts[nextContractIndex] || null;
        const unlockedNext = success && index >= bestBefore && index < config.contracts.length - 1;

        state.save.lastResult = {
            type: 'contract',
            success,
            title: success ? text(`合同完成 · ${contract.id}`, `Contract Cleared · ${contract.id}`) : text(`合同未稳过 · ${contract.id}`, `Contract Missed · ${contract.id}`),
            copy: success
                ? (unlockedNext
                    ? text('本次已踩过推荐线，合同奖励已到账，并解锁了下一档。接下来优先补本章焦点符印，再尝试继续推进。', 'You cleared the recommended line, received the contract rewards, and unlocked the next contract. Raise the current focus sigils first, then keep pushing.')
                    : text('本次稳定过线，奖励已到账。当前档已可稳定刷取，可以继续冲线或回熔炉补更高阶宝石。', 'You cleared this contract cleanly and collected the rewards. This tier is now stable to farm, so you can push forward or return to the forge for higher-tier gems.'))
                : text('当前仍有战力缺口，只发放了保底回流。建议优先补符印、工坊和高阶宝石，再回到合同页复打。', 'There is still a power gap, so only fallback rewards were granted. Raise sigils, workshop, and higher-tier gems before retrying this contract.'),
            tags: [contract.id, success ? text('推进成功', 'Cleared') : text('还差一点', 'Almost'), `${text('战力', 'Power')} ${formatCompact(power)}`],
            contractId: contract.id,
            contractIndex: index,
            recommended: contract.recommended,
            power,
            stability: passives.contractStability,
            effectivePower,
            gap: Math.max(0, contract.recommended - effectivePower),
            reward,
            focusFamilies: contract.focus.slice(),
            unlockedNext,
            nextContractId: success && index < config.contracts.length - 1 ? nextContract?.id || '' : '',
            nextContractIndex,
            nextGap: success && index < config.contracts.length - 1 ? Math.max(0, nextContract.recommended - effectivePower) : Math.max(0, contract.recommended - effectivePower),
            atCap: success && index === config.contracts.length - 1
        };

        showToast(success ? text(`合同 ${contract.id} 已完成。`, `Contract ${contract.id} cleared.`) : text(`合同 ${contract.id} 仍有缺口。`, `Contract ${contract.id} still has a gap.`));
        saveProgress();
        renderAll();
    };

    runContract = wrapActionWithMotion(runContract, 'claim', 460);

    function getSigilUnlockCost(sigilId) {
        const sigil = sigilMap[sigilId];
        if (!sigil) return { gold: 0, shards: 0 };
        const economy = config.forgeEconomy || {};
        return {
            gold: Math.max(0, Math.round(
                Number(economy.sigilUnlockGoldBase || 0)
                + Number(sigil.baseScore || 0) * Number(economy.sigilUnlockGoldPerScore || 0)
                + Number(sigil.shardUnlock || 0) * Number(economy.sigilUnlockGoldPerShard || 0)
            )),
            shards: Math.max(0, Math.round(Number(sigil.shardUnlock || 0)))
        };
    }

    function getFuseCost(tier) {
        const preset = config.forgeEconomy?.fuseCosts?.[tier] || config.forgeEconomy?.fuseCosts?.[String(tier)] || {};
        return {
            gold: Math.max(0, Math.round(Number(preset.gold) || 0)),
            dust: Math.max(0, Math.round(Number(preset.dust) || 0)),
            catalyst: Math.max(0, Math.round(Number(preset.catalyst) || 0))
        };
    }

    function getAwakenCost(tier) {
        const preset = config.forgeEconomy?.awakenCosts?.[tier] || config.forgeEconomy?.awakenCosts?.[String(tier)] || {};
        const tierMeta = getTierMeta(tier);
        return {
            gold: Math.max(0, Math.round(Number(preset.gold) || 0)),
            dust: Math.max(0, Math.round(Number(preset.dust) || 0)),
            catalyst: Math.max(0, Math.round(Number(preset.catalyst) || Number(tierMeta?.awakenCatalyst) || 0))
        };
    }

    function canAffordCost(cost, saveSnapshot = state.save) {
        return (Number(saveSnapshot?.gold) || 0) >= (Number(cost?.gold) || 0)
            && (Number(saveSnapshot?.dust) || 0) >= (Number(cost?.dust) || 0)
            && (Number(saveSnapshot?.catalyst) || 0) >= (Number(cost?.catalyst) || 0);
    }

    function getCostShortage(cost, saveSnapshot = state.save) {
        return {
            gold: Math.max(0, (Number(cost?.gold) || 0) - (Number(saveSnapshot?.gold) || 0)),
            dust: Math.max(0, (Number(cost?.dust) || 0) - (Number(saveSnapshot?.dust) || 0)),
            catalyst: Math.max(0, (Number(cost?.catalyst) || 0) - (Number(saveSnapshot?.catalyst) || 0))
        };
    }

    function formatResourceCost(cost, options = {}) {
        const parts = [];
        if (Number(cost?.gold) > 0) parts.push(`${formatCompact(cost.gold)}G`);
        if (options.dust !== false && Number(cost?.dust) > 0) parts.push(`${formatCompact(cost.dust)}D`);
        if (options.catalyst !== false && Number(cost?.catalyst) > 0) parts.push(`${formatCompact(cost.catalyst)}C`);
        return parts.length ? parts.join(' / ') : text('免费', 'Free');
    }

    function getGemInventoryRows() {
        const rows = [];
        config.gemFamilies.forEach((family) => {
            config.gemTiers.forEach((tierMeta) => {
                const key = buildGemKey(family.id, tierMeta.tier);
                const count = getGemCount(family.id, tierMeta.tier);
                const awakened = getAwakenedCount(key);
                const fuseCost = getFuseCost(tierMeta.tier);
                const awakenCost = getAwakenCost(tierMeta.tier);
                const fuseBaseReady = count >= tierMeta.fuseNeed && tierMeta.tier < 5;
                const awakenBaseReady = tierMeta.tier >= 3 && count >= 1;
                const canFuse = fuseBaseReady && canAffordCost(fuseCost);
                const canAwaken = awakenBaseReady && canAffordCost(awakenCost);
                if (count > 0 || awakened > 0 || fuseBaseReady || awakenBaseReady) {
                    rows.push({
                        key,
                        familyId: family.id,
                        tier: tierMeta.tier,
                        count,
                        awakened,
                        score: tierMeta.score,
                        fuseCost,
                        awakenCost,
                        fuseBaseReady,
                        awakenBaseReady,
                        canFuse,
                        canAwaken,
                        sort: (canFuse ? 10000 : 0)
                            + (canAwaken ? 5000 : 0)
                            + (fuseBaseReady ? 1800 : 0)
                            + (awakenBaseReady ? 1200 : 0)
                            + awakened * 600
                            + count * tierMeta.score
                    });
                }
            });
        });
        return rows.sort((a, b) => b.sort - a.sort);
    }

    function renderGemRow(row) {
        const family = familyMap[row.familyId];
        const recycleDust = getRecycleDustValue(row.tier, 1);
        const safeKeep = getSmartRecycleKeepCount(row.familyId, row.tier);
        const safeOverflow = Number.isFinite(safeKeep) ? Math.max(0, row.count - safeKeep) : 0;
        return `
            <div class="gf-list-row">
                <div class="gf-list-copy">
                    <div class="gf-gem-badge">
                        <i class="gf-gem-dot" style="color:${family.accent}; background:${family.accent};"></i>
                        <div class="gf-list-title">${localize(family.name)} · T${row.tier}</div>
                    </div>
                    <div class="gf-list-sub">${text(`库存 ${row.count} · 觉醒 ${row.awakened} · 单颗战力 ${formatCompact(row.score)}`, `Owned ${row.count} · Awakened ${row.awakened} · ${formatCompact(row.score)} power each`)}</div>
                    ${safeOverflow > 0 ? `<div class="gf-list-sub">${text(`智能回收会保留 ${safeKeep} 颗，本行还可安全回收 ${safeOverflow} 颗。`, `Smart recycle keeps ${safeKeep}. ${safeOverflow} more can be safely recycled here.`)}</div>` : ''}
                    <div class="gf-chip-row" style="margin-top:10px;">
                        ${row.fuseBaseReady ? `<span class="gf-chip ${row.canFuse ? 'is-success' : 'is-warning'}">${text('合成成本', 'Fuse Cost')} · ${formatResourceCost(row.fuseCost, { dust: false })}</span>` : ''}
                        ${row.awakenBaseReady ? `<span class="gf-chip ${row.canAwaken ? 'is-warning' : ''}">${text('觉醒成本', 'Awaken Cost')} · ${formatResourceCost(row.awakenCost)}</span>` : ''}
                    </div>
                </div>
                <div class="gf-row-actions">
                    <button class="ghost-btn" type="button" data-action="salvageGem" data-value="${row.key}" ${row.count > 0 && recycleDust > 0 ? '' : 'disabled'}>${text(`回收 1 · +${formatCompact(recycleDust)} 尘`, `Recycle 1 · +${formatCompact(recycleDust)} dust`)}</button>
                    <button class="ghost-btn" type="button" data-action="fuseGem" data-value="${row.key}" ${row.canFuse ? '' : 'disabled'}>${text('3 合 1', 'Fuse 3 → 1')}</button>
                    <button class="primary-btn" type="button" data-action="awakenGem" data-value="${row.key}" ${row.canAwaken ? '' : 'disabled'}>${text('觉醒', 'Awaken')}</button>
                </div>
            </div>
        `;
    }

    function renderCompactGemActionRow(row) {
        const family = familyMap[row.familyId];
        const recycleDust = getRecycleDustValue(row.tier, 1);
        return `
            <article class="gf-compact-row">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">
                        <i class="gf-gem-dot" style="color:${family.accent}; background:${family.accent};"></i>
                        ${localize(family.name)} · T${row.tier}
                    </div>
                    <div class="gf-compact-sub">${text(`库存 ${row.count} · 觉醒 ${row.awakened}`, `Owned ${row.count} · Awakened ${row.awakened}`)}</div>
                </div>
                <div class="gf-compact-side">
                    <div class="gf-chip-row">
                        ${row.canFuse ? `<span class="gf-chip is-success">${text('可合成', 'Fuse Ready')}</span>` : ''}
                        ${row.canAwaken ? `<span class="gf-chip is-warning">${text('可觉醒', 'Awaken Ready')}</span>` : ''}
                        ${row.fuseBaseReady ? `<span class="gf-chip">${text('合成', 'Fuse')} · ${formatResourceCost(row.fuseCost, { dust: false })}</span>` : ''}
                        ${row.awakenBaseReady ? `<span class="gf-chip">${text('觉醒', 'Awaken')} · ${formatResourceCost(row.awakenCost)}</span>` : ''}
                    </div>
                    <div class="gf-action-row">
                        <button class="ghost-btn" type="button" data-action="salvageGem" data-value="${row.key}" ${row.count > 0 && recycleDust > 0 ? '' : 'disabled'}>${text(`回收 +${formatCompact(recycleDust)}`, `Recycle +${formatCompact(recycleDust)}`)}</button>
                        <button class="ghost-btn" type="button" data-action="fuseGem" data-value="${row.key}" ${row.canFuse ? '' : 'disabled'}>${text('合成', 'Fuse')}</button>
                        <button class="primary-btn" type="button" data-action="awakenGem" data-value="${row.key}" ${row.canAwaken ? '' : 'disabled'}>${text('觉醒', 'Awaken')}</button>
                    </div>
                </div>
            </article>
        `;
    }

    function renderSigilCompactRow(sigil) {
        const level = getSigilLevel(sigil.id);
        const unlocked = level > 0;
        const equipped = state.save.selectedSigils.includes(sigil.id);
        const slotLocked = sigil.slot === 'resonance' && state.save.bestContractIndex < 2;
        const shardOwned = getSigilShardCount(sigil.id);
        const unlockCost = getSigilUnlockCost(sigil.id);
        const upgradeCost = getSigilUpgradeCost(sigil.id);
        const focus = getCurrentContract().focus.includes(sigil.family);
        const unlockReady = !unlocked && state.save.gold >= unlockCost.gold && shardOwned >= unlockCost.shards;
        const upgradeReady = unlocked && level < 8 && state.save.gold >= upgradeCost.gold && shardOwned >= upgradeCost.shards;
        const primaryLabel = unlocked
            ? (level >= 8
                ? text('已满', 'Maxed')
                : text(`升 ${formatCompact(upgradeCost.gold)}G`, `Up ${formatCompact(upgradeCost.gold)}G`))
            : text(`解 ${formatCompact(unlockCost.gold)}G`, `Unlock ${formatCompact(unlockCost.gold)}G`);
        const detail = unlocked
            ? text(`碎片 ${formatCompact(shardOwned)}/${formatCompact(upgradeCost.shards)} · 金币 ${formatCompact(state.save.gold)}/${formatCompact(upgradeCost.gold)}`, `Shards ${formatCompact(shardOwned)}/${formatCompact(upgradeCost.shards)} · Gold ${formatCompact(state.save.gold)}/${formatCompact(upgradeCost.gold)}`)
            : text(`碎片 ${formatCompact(shardOwned)}/${formatCompact(unlockCost.shards)} · 金币 ${formatCompact(state.save.gold)}/${formatCompact(unlockCost.gold)} · ${getSlotName(sigil.slot)}`, `Shards ${formatCompact(shardOwned)}/${formatCompact(unlockCost.shards)} · Gold ${formatCompact(state.save.gold)}/${formatCompact(unlockCost.gold)} · ${getSlotName(sigil.slot)}`);

        return `
            <article class="gf-compact-row ${equipped || focus ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(sigil.name)} · ${localize(familyMap[sigil.family].name)}</div>
                    <div class="gf-compact-sub">${detail}</div>
                    <div class="gf-chip-row">
                        <span class="gf-chip">${getSlotName(sigil.slot)}</span>
                        <span class="gf-chip">${text('战力', 'Power')} · ${formatCompact(getSigilPower(sigil.id))}</span>
                        ${focus ? `<span class="gf-chip is-success">${text('本章焦点', 'Focus')}</span>` : ''}
                        ${equipped ? `<span class="gf-chip is-strong">${text('已装', 'Equipped')}</span>` : ''}
                        ${slotLocked ? `<span class="gf-chip is-warning">${text('槽位未开', 'Slot Locked')}</span>` : ''}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>${unlocked ? `Lv.${level}` : text('未解', 'Locked')}</strong>
                    <div class="gf-action-row">
                        <button class="ghost-btn" type="button" data-action="equipSigil" data-value="${sigil.id}">${equipped ? text('已装', 'Equipped') : text('装备', 'Equip')}</button>
                        <button class="primary-btn" type="button" data-action="${unlocked ? 'upgradeSigil' : 'unlockSigil'}" data-value="${sigil.id}" ${(unlocked ? !upgradeReady || level >= 8 : !unlockReady) ? 'disabled' : ''}>${primaryLabel}</button>
                    </div>
                </div>
            </article>
        `;
    }

    function renderSigilRow(sigil) {
        const level = getSigilLevel(sigil.id);
        const unlocked = level > 0;
        const equipped = state.save.selectedSigils.includes(sigil.id);
        const slotLocked = sigil.slot === 'resonance' && state.save.bestContractIndex < 2;
        const shardOwned = getSigilShardCount(sigil.id);
        const unlockCost = getSigilUnlockCost(sigil.id);
        const unlockReady = !unlocked && state.save.gold >= unlockCost.gold && shardOwned >= unlockCost.shards;
        const upgradeCost = getSigilUpgradeCost(sigil.id);
        const upgradeReady = unlocked && level < 8 && state.save.gold >= upgradeCost.gold && shardOwned >= upgradeCost.shards;
        const focus = getCurrentContract().focus.includes(sigil.family);
        return `
            <article class="gf-list-card gf-sigil-card ${equipped ? 'is-equipped' : ''} ${!unlocked ? 'is-locked' : ''}">
                <div class="gf-row-head">
                    <div>
                        <div class="eyebrow">${getSlotName(sigil.slot)} · ${localize(familyMap[sigil.family].name)}</div>
                        <div class="gf-card-title">${localize(sigil.name)} · Lv.${level}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getSigilPower(sigil.id))}</div>
                </div>
                <div class="gf-card-copy">${localize(sigil.effect)}</div>
                <div class="gf-chip-row" style="margin-top:10px;">
                    <span class="gf-chip">${text('碎片', 'Shards')} · ${formatCompact(shardOwned)}</span>
                    ${!unlocked ? `<span class="gf-chip ${unlockReady ? 'is-success' : ''}">${text('解锁成本', 'Unlock Cost')} · ${formatCompact(unlockCost.gold)}G / ${formatCompact(unlockCost.shards)}S</span>` : ''}
                    ${focus ? `<span class="gf-chip is-success">${text('本章焦点', 'Current Focus')}</span>` : ''}
                    ${equipped ? `<span class="gf-chip is-strong">${text('已装备', 'Equipped')}</span>` : ''}
                    ${slotLocked ? `<span class="gf-chip is-warning">${text('槽位未开', 'Slot Locked')}</span>` : ''}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="ghost-btn" type="button" data-action="equipSigil" data-value="${sigil.id}">${equipped ? text('当前已装', 'Equipped') : text('装到槽位', 'Equip')}</button>
                    <button class="primary-btn" type="button" data-action="${unlocked ? 'upgradeSigil' : 'unlockSigil'}" data-value="${sigil.id}" ${(unlocked ? !upgradeReady || level >= 8 : !unlockReady) ? 'disabled' : ''}>${unlocked
                        ? (level >= 8 ? text('已满级', 'Maxed') : text(`升级 · ${formatCompact(upgradeCost.gold)}G / ${formatCompact(upgradeCost.shards)} 碎片`, `Upgrade · ${formatCompact(upgradeCost.gold)}G / ${formatCompact(upgradeCost.shards)} shards`))
                        : text(`解锁 · ${formatCompact(unlockCost.gold)}G / ${formatCompact(unlockCost.shards)} 碎片`, `Unlock · ${formatCompact(unlockCost.gold)}G / ${formatCompact(unlockCost.shards)} shards`)}</button>
                </div>
            </article>
        `;
    }

    fuseGem = wrapActionWithMotion(function fuseGemRebalanced(key) {
        const { familyId, tier } = parseGemKey(key);
        const tierMeta = getTierMeta(tier);
        const count = getGemCount(familyId, tier);
        const cost = getFuseCost(tier);
        if (!familyId || !tierMeta || tier >= 5) return;
        if (count < tierMeta.fuseNeed) return showToast(text('同阶宝石不足 3 颗。', 'Need 3 gems of the same tier first.'));
        if (state.save.gold < cost.gold) return showToast(text('金币不足，先补金币再合成。', 'Not enough gold to fuse yet.'));
        if (state.save.catalyst < cost.catalyst) return showToast(text('催化剂不足，先补催化剂再冲高阶。', 'Not enough catalyst to push this higher-tier fuse.'));
        state.save.gold -= cost.gold;
        state.save.catalyst -= cost.catalyst;
        addGem(familyId, tier, -tierMeta.fuseNeed);
        addGem(familyId, tier + 1, 1);
        state.save.stats.fuses += 1;
        state.save.stats.highestTier = Math.max(state.save.stats.highestTier, tier + 1);
        state.save.seasonXp += 12 + tier * 4;
        const familyName = localize(familyMap[familyId].name);
        state.save.lastResult = {
            title: text(`合成成功 · ${familyName} T${tier + 1}`, `Fusion Complete · ${familyName} T${tier + 1}`),
            copy: text(`消耗 3 颗 T${tier}，并支付 ${formatResourceCost(cost, { dust: false })}，合成出 1 颗 T${tier + 1}。现在高阶宝石会开始明显拉升合同战力。`, `Three T${tier} gems plus ${formatResourceCost(cost, { dust: false })} fused into one T${tier + 1}. Higher tiers now start making a visible difference in contract power.`),
            tags: [familyName, `T${tier} → T${tier + 1}`, text('战力提升', 'Power Up'), `${text('成本', 'Cost')} ${formatResourceCost(cost, { dust: false })}`]
        };
        showToast(text(`合成成功，已支付 ${formatResourceCost(cost, { dust: false })}。`, `Fusion complete. Paid ${formatResourceCost(cost, { dust: false })}.`));
        saveProgress();
        renderAll();
    }, 'forge', 420);

    awakenGem = wrapActionWithMotion(function awakenGemRebalanced(key) {
        const { familyId, tier } = parseGemKey(key);
        const tierMeta = getTierMeta(tier);
        const cost = getAwakenCost(tier);
        if (!familyId || !tierMeta || tier < 3) return showToast(text('至少 T3 才能觉醒。', 'Awakening starts at T3.'));
        if (getGemCount(familyId, tier) < 1) return showToast(text('缺少可觉醒的本体宝石。', 'Missing the base gem to awaken.'));
        if (state.save.gold < cost.gold) return showToast(text('金币不足，先补金币再觉醒。', 'Not enough gold to awaken yet.'));
        if (state.save.dust < cost.dust) return showToast(text('熔尘不足，先补熔尘再觉醒。', 'Not enough dust to awaken yet.'));
        if (state.save.catalyst < cost.catalyst) return showToast(text('催化剂不足。', 'Not enough catalyst.'));
        state.save.gold -= cost.gold;
        state.save.dust -= cost.dust;
        addGem(familyId, tier, -1);
        state.save.catalyst -= cost.catalyst;
        state.save.awakened[key] = (Number(state.save.awakened[key]) || 0) + 1;
        state.save.stats.awakenings += 1;
        state.save.seasonXp += 28 + tier * 6;
        const familyName = localize(familyMap[familyId].name);
        state.save.lastResult = {
            title: text(`觉醒成功 · ${familyName} T${tier}`, `Awakened · ${familyName} T${tier}`),
            copy: text(`消耗 1 颗 T${tier} 本体，并支付 ${formatResourceCost(cost)}，换来永久觉醒战力。`, `Consumed one T${tier} gem and ${formatResourceCost(cost)} for permanent awakened power.`),
            tags: [familyName, `T${tier}`, text('永久加成', 'Permanent Bonus'), `${text('成本', 'Cost')} ${formatResourceCost(cost)}`]
        };
        showToast(text(`觉醒完成，已支付 ${formatResourceCost(cost)}。`, `Awakening complete. Paid ${formatResourceCost(cost)}.`));
        saveProgress();
        renderAll();
    }, 'upgrade', 440);

    unlockSigil = wrapActionWithMotion(function unlockSigilRebalanced(sigilId) {
        const sigil = sigilMap[sigilId];
        const cost = getSigilUnlockCost(sigilId);
        if (!sigil) return;
        if (getSigilLevel(sigilId) > 0) return showToast(text('该符印已经解锁。', 'This sigil is already unlocked.'));
        if (state.save.gold < cost.gold) return showToast(text('金币不足，先补金币再解锁。', 'Not enough gold to unlock this sigil.'));
        if (getSigilShardCount(sigilId) < cost.shards) return showToast(text('符印碎片不足。', 'Not enough sigil shards.'));
        state.save.gold -= cost.gold;
        state.save.sigilShards[sigilId] -= cost.shards;
        state.save.sigilLevels[sigilId] = 1;
        state.save.lastResult = {
            type: 'sigil',
            title: text(`符印解锁 · ${localize(sigil.name)}`, `Sigil Unlocked · ${localize(sigil.name)}`),
            copy: text(`支付 ${formatCompact(cost.gold)}G 与 ${formatCompact(cost.shards)} 碎片后，该符印已可投入构筑。`, `Paid ${formatCompact(cost.gold)}G and ${formatCompact(cost.shards)} shards to unlock this sigil for your build.`),
            tags: [localize(familyMap[sigil.family].name), getSlotName(sigil.slot), `${text('成本', 'Cost')} ${formatCompact(cost.gold)}G / ${formatCompact(cost.shards)}S`]
        };
        showToast(text(`符印已解锁，已支付 ${formatCompact(cost.gold)}G。`, `Sigil unlocked. Paid ${formatCompact(cost.gold)}G.`));
        saveProgress();
        renderAll();
    }, 'upgrade', 440);

    function getPrioritySigilTarget() {
        const candidates = config.sigils.map((sigil) => {
            const level = getSigilLevel(sigil.id);
            const shardOwned = getSigilShardCount(sigil.id);
            const unlockCost = getSigilUnlockCost(sigil.id);
            const upgradeCost = getSigilUpgradeCost(sigil.id);
            const cost = level > 0 ? upgradeCost : unlockCost;
            const focus = getCurrentContract().focus.includes(sigil.family);
            const unlockReady = level <= 0 && state.save.gold >= unlockCost.gold && shardOwned >= unlockCost.shards;
            const upgradeReady = level > 0 && level < 8 && state.save.gold >= upgradeCost.gold && shardOwned >= upgradeCost.shards;
            return {
                sigil,
                level,
                shardOwned,
                cost,
                focus,
                unlockReady,
                upgradeReady,
                missingGold: Math.max(0, cost.gold - state.save.gold),
                missingShards: Math.max(0, cost.shards - shardOwned),
                score: (focus ? 1000 : 0) + (unlockReady ? 800 : 0) + (upgradeReady ? 700 : 0) + sigil.baseScore - level * 10
            };
        }).sort((left, right) => right.score - left.score);
        return candidates[0] || null;
    }

    function getGrowthDiagnosis() {
        const contract = getCurrentContract();
        const power = getCurrentPower().total;
        const effectivePower = getEffectiveContractPower();
        const powerGap = Math.max(0, contract.recommended - effectivePower);
        const inventoryRows = getGemInventoryRows();
        const fuseReadyCount = inventoryRows.filter((row) => row.canFuse).length;
        const awakenReadyCount = inventoryRows.filter((row) => row.canAwaken).length;
        const fuseCandidates = inventoryRows.filter((row) => row.fuseBaseReady).length;
        const awakenCandidates = inventoryRows.filter((row) => row.awakenBaseReady).length;
        const sigilReadyCount = config.sigils.filter((sigil) => {
            const level = getSigilLevel(sigil.id);
            const unlockCost = getSigilUnlockCost(sigil.id);
            const upgradeCost = getSigilUpgradeCost(sigil.id);
            return (level <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigil.id) >= unlockCost.shards)
                || (level > 0 && level < 8 && state.save.gold >= upgradeCost.gold && getSigilShardCount(sigil.id) >= upgradeCost.shards);
        }).length;
        const workshopReadyCount = config.workshop.filter((item) => canUpgradeWorkshop(item.id)).length;
        const workshopTarget = getPriorityWorkshopTarget();
        const sigilTarget = getPrioritySigilTarget();
        const fuseTarget = inventoryRows.filter((row) => row.fuseBaseReady).sort((a, b) => b.sort - a.sort)[0] || null;
        const awakenTarget = inventoryRows.filter((row) => row.awakenBaseReady).sort((a, b) => b.sort - a.sort)[0] || null;
        const economy = config.forgeEconomy || {};

        const targetGoldReserve = Number(economy.goldReserveBase || 600) + state.save.contractIndex * Number(economy.goldReserveStep || 360);
        const targetDustReserve = Number(economy.dustReserveBase || 70) + state.save.contractIndex * Number(economy.dustReserveStep || 45);
        const targetCatalystReserve = state.save.contractIndex <= 2
            ? 6 + state.save.contractIndex * 2
            : state.save.contractIndex <= 5
                ? 14 + state.save.contractIndex * 4
                : 28 + state.save.contractIndex * 6;

        const goldPressure = Math.max(
            0,
            targetGoldReserve - state.save.gold,
            workshopTarget?.missingGold || 0,
            sigilTarget?.missingGold || 0,
            fuseTarget ? Math.max(0, fuseTarget.fuseCost.gold - state.save.gold) : 0,
            awakenTarget ? Math.max(0, awakenTarget.awakenCost.gold - state.save.gold) : 0
        );
        const dustPressure = Math.max(
            0,
            targetDustReserve - state.save.dust,
            workshopTarget?.missingDust || 0,
            awakenTarget ? Math.max(0, awakenTarget.awakenCost.dust - state.save.dust) : 0
        );
        const catalystPressure = Math.max(
            0,
            targetCatalystReserve - state.save.catalyst,
            fuseTarget ? Math.max(0, fuseTarget.fuseCost.catalyst - state.save.catalyst) : 0,
            awakenTarget ? Math.max(0, awakenTarget.awakenCost.catalyst - state.save.catalyst) : 0,
            awakenCandidates > awakenReadyCount || fuseCandidates > fuseReadyCount ? targetCatalystReserve - state.save.catalyst : 0
        );

        let pressureId = 'power';
        let title = text('战力仍有缺口', 'Power Gap Remains');
        let summary = text('当前最直接的推进问题，仍然是合同有效战力不够。', 'The main issue right now is still not having enough effective contract power.');
        let freeTab = 'sigils';
        let freeLabel = text('去补符印', 'Raise Sigils');
        let freeShort = text('补符印', 'Sigils');

        if (powerGap <= 0) {
            pressureId = 'push';
            title = text('已经够线，直接推进', 'Ready to Push');
            summary = text(`当前已经达到合同 ${contract.id} 推荐线，优先去合同页推进，别让热量和免费补给空转。`, `You already meet the ${contract.id} contract line. Push contracts now so heat and free supplies do not sit idle.`);
            freeTab = 'contracts';
            freeLabel = text('去跑合同', 'Run Contract');
            freeShort = text('推进合同', 'Push');
        } else if (fuseReadyCount > 0 || awakenReadyCount > 0) {
            pressureId = 'forge';
            title = text('现有库存就能补强', 'Actionable Inventory Ready');
            summary = text(`你手上已经有 ${fuseReadyCount} 条可合成、${awakenReadyCount} 条可觉醒库存，先把现成成长吃掉，通常比直接充值更划算。`, `You already have ${fuseReadyCount} fuse-ready and ${awakenReadyCount} awaken-ready rows. Use this growth first; it is usually more efficient than topping up immediately.`);
            freeTab = 'forge';
            freeLabel = text('去熔炉处理', 'Open Forge');
            freeShort = text('先合成', 'Forge');
        } else if (sigilReadyCount > 0) {
            pressureId = 'sigil';
            title = text('符印可升，优先补主印', 'Sigils Are Ready');
            summary = text(`当前至少有 ${sigilReadyCount} 个符印已经能解锁或升级，先补本章焦点符印，通常是最快的过线方式。`, `At least ${sigilReadyCount} sigils can already be unlocked or upgraded. Focus sigils are usually the fastest path to clear the current wall.`);
            freeTab = 'sigils';
            freeLabel = text('去补符印', 'Raise Sigils');
            freeShort = text('补符印', 'Sigils');
        } else if (workshopReadyCount > 0) {
            pressureId = 'workshop';
            title = text('工坊可点，先拉效率', 'Workshop Upgrade Ready');
            summary = text(`当前至少有 ${workshopReadyCount} 个工坊升级已经能点，优先补热量恢复和稀有率，熔炼效率会更平滑。`, `At least ${workshopReadyCount} workshop upgrades are already affordable. Prioritize heat regen and rare rate for smoother forge efficiency.`);
            freeTab = 'workshop';
            freeLabel = text('去点工坊', 'Open Workshop');
            freeShort = text('补工坊', 'Workshop');
        } else if (catalystPressure >= dustPressure && catalystPressure >= goldPressure && state.save.contractIndex >= 4) {
            pressureId = 'catalyst';
            title = text('催化剂开始卡档', 'Catalyst Starts Gating');
            summary = text(`进入 ${contract.id} 后，催化剂会同时卡住高阶合成与 T3+ 觉醒，当前更像是“材料门槛”而不是纯战力门槛。`, `From ${contract.id} onward, catalyst starts gating both high-tier fusion and T3+ awakening. The wall is now more about materials than pure power.`);
            freeTab = 'contracts';
            freeLabel = text('去刷合同回收', 'Farm Contracts');
            freeShort = text('补催化剂', 'Catalyst');
        } else if (dustPressure >= goldPressure && dustPressure > 0) {
            pressureId = 'dust';
            title = text('熔尘开始吃紧', 'Dust Is Tight');
            summary = text(`你现在更缺的是中段熔尘，不补的话会拖慢觉醒节奏与后续构筑转化。`, `Dust is the tighter resource right now. Without more of it, awakening tempo and later build conversion both slow down.`);
            freeTab = 'forge';
            freeLabel = text('去熔炉刷库存', 'Farm Forge');
            freeShort = text('补熔尘', 'Dust');
        } else if (goldPressure > 0) {
            pressureId = 'gold';
            title = text('金币开始吃紧', 'Gold Is Tight');
            summary = text(`当前主要被金币储备卡住：符印、工坊、合成与觉醒都会吃金，但手头金币不够把这条成长链连起来。`, `Gold is the main bottleneck now: sigils, workshop, fusion, and awakening all compete for gold, but your current reserve cannot keep the growth chain connected.`);
            freeTab = 'contracts';
            freeLabel = text('去跑合同回金币', 'Farm Gold');
            freeShort = text('补金币', 'Gold');
        }

        let recommendedOfferId = 'starter';
        if (pressureId === 'push') {
            recommendedOfferId = state.save.payment.passUnlocked ? 'accelerator' : 'starter';
        } else if (pressureId === 'forge' || pressureId === 'sigil') {
            recommendedOfferId = state.save.contractIndex <= 2 ? 'starter' : state.save.contractIndex <= 5 ? 'accelerator' : 'rush';
        } else if (pressureId === 'workshop' || pressureId === 'gold') {
            recommendedOfferId = state.save.contractIndex <= 1 ? 'starter' : state.save.contractIndex <= 3 ? 'accelerator' : state.save.contractIndex <= 5 ? 'rush' : state.save.contractIndex <= 7 ? 'sovereign' : 'nexus';
        } else if (pressureId === 'dust') {
            recommendedOfferId = state.save.contractIndex <= 3 ? 'accelerator' : state.save.contractIndex <= 5 ? 'rush' : state.save.contractIndex <= 7 ? 'sovereign' : 'nexus';
        } else if (pressureId === 'catalyst') {
            recommendedOfferId = state.save.contractIndex <= 5 ? 'sovereign' : state.save.contractIndex <= 7 ? 'nexus' : 'throne';
        } else if (powerGap > 1800) {
            recommendedOfferId = 'throne';
        } else if (powerGap > 1100) {
            recommendedOfferId = 'nexus';
        } else if (powerGap > 700) {
            recommendedOfferId = 'sovereign';
        } else if (powerGap > 360) {
            recommendedOfferId = 'rush';
        } else if (powerGap > 160) {
            recommendedOfferId = 'accelerator';
        }

        return {
            pressureId,
            title,
            summary,
            freeTab,
            freeLabel,
            freeShort,
            contractId: contract.id,
            power,
            effectivePower,
            powerGap,
            goldPressure,
            dustPressure,
            catalystPressure,
            recommendedOfferId
        };
    }

    function getNextProgressSuggestion() {
        const contract = getCurrentContract();
        const power = getCurrentPower().total;
        const gap = contract.recommended - power;
        const inventoryRows = getGemInventoryRows();
        if (gap <= 0) return text('当前合同已经够线，优先去合同页执行推进，然后回熔炉把可合成的 T2/T3 继续往上抬。', 'You are already on the contract line, so run contracts first and then return to the forge to push fuse-ready T2/T3 gems further upward.');
        const fuseReady = inventoryRows.filter((row) => row.canFuse).length;
        if (fuseReady > 0) return text(`当前有 ${fuseReady} 条可合成库存，先把高阶宝石做出来，再决定是否补符印或工坊。`, `You already have ${fuseReady} fuse-ready rows, so forge higher-tier gems first and then decide whether sigils or workshop need more resources.`);
        const blockedAwaken = inventoryRows.find((row) => row.awakenBaseReady && !row.canAwaken);
        if (blockedAwaken) {
            const missing = getCostShortage(blockedAwaken.awakenCost);
            return text(`你已经有可觉醒本体，但还差 ${formatResourceCost(missing)}；先把这段资源补齐，再回头点觉醒最划算。`, `You already have an awakenable base gem, but still need ${formatResourceCost(missing)}. Refill that gap first for the best next step.`);
        }
        const blockedFuse = inventoryRows.find((row) => row.fuseBaseReady && !row.canFuse);
        if (blockedFuse) {
            const missing = getCostShortage(blockedFuse.fuseCost);
            return text(`你已经攒够同阶宝石，但还差 ${formatResourceCost(missing, { dust: false })} 才能合成；先补资源再冲高阶。`, `You already have the gems needed, but still need ${formatResourceCost(missing, { dust: false })} to fuse. Refill that gap before pushing higher tiers.`);
        }
        const sigilReady = config.sigils.some((sigil) => {
            const level = getSigilLevel(sigil.id);
            const unlockCost = getSigilUnlockCost(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return (level <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigil.id) >= unlockCost.shards)
                || (level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards);
        });
        if (sigilReady) return text('符印已经有可升级项，优先补主印和共鸣槽，通常比盲目刷熔炼更快过线。', 'A sigil upgrade is already ready. Push your main and resonance slots first, which is usually faster than blind forging.');
        if (hasWorkshopRedDot()) return text('工坊已有可点项，优先热量恢复 / 稀有率强化，把熔炼效率拉上来。', 'The workshop already has an upgrade ready. Prioritize heat regen or rare rate to lift forge efficiency.');
        return text('当前还是资源积累阶段：继续熔炼、做每日免费，并在合同焦点家族上滚库存。', 'You are still in the resource build-up phase: keep forging, claim the daily free box, and stack stock on the current contract focus families.');
    }

    function hasSigilRedDot() {
        return config.sigils.some((sigil) => {
            const level = getSigilLevel(sigil.id);
            const unlockCost = getSigilUnlockCost(sigil.id);
            const unlockReady = level <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigil.id) >= unlockCost.shards;
            const cost = getSigilUpgradeCost(sigil.id);
            const upgradeReady = level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
            return unlockReady || upgradeReady;
        });
    }

    function getSigilSortScore(sigilId) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevel(sigilId);
        const equipped = state.save.selectedSigils.includes(sigilId) ? 1000 : 0;
        const focus = getCurrentContract().focus.includes(sigil.family) ? 220 : 0;
        const unlockCost = getSigilUnlockCost(sigilId);
        const unlockReady = level <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigilId) >= unlockCost.shards ? 420 : 0;
        const cost = getSigilUpgradeCost(sigilId);
        const upgradeReady = level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigilId) >= cost.shards ? 360 : 0;
        return equipped + focus + unlockReady + upgradeReady + level * 32 + sigil.baseScore;
    }

    function getSigilShardCountForSave(sigilId, saveSnapshot = state.save) {
        return Math.max(0, Number(saveSnapshot?.sigilShards?.[sigilId]) || 0);
    }

    function getGemCountForSave(familyId, tier, saveSnapshot = state.save) {
        return Math.max(0, Number(saveSnapshot?.gems?.[buildGemKey(familyId, tier)]) || 0);
    }

    function getWorkshopLevelForSave(workshopId, saveSnapshot = state.save) {
        return Math.max(0, Number(saveSnapshot?.workshopLevels?.[workshopId]) || 0);
    }

    function getWorkshopUpgradeCostForSave(workshopId, saveSnapshot = state.save) {
        const item = workshopMap[workshopId];
        const level = getWorkshopLevelForSave(workshopId, saveSnapshot);
        if (!item) return { gold: 0, dust: 0 };
        return {
            gold: Math.round(item.baseCostGold + item.costGoldStep * level),
            dust: Math.round(item.baseCostDust + item.costDustStep * level)
        };
    }

    function getSigilUpgradeCostForSave(sigilId, saveSnapshot = state.save) {
        const sigil = sigilMap[sigilId];
        const level = getSigilLevelForSave(sigilId, saveSnapshot);
        if (!sigil) return { gold: 0, shards: 0 };
        return {
            gold: Math.round(sigil.goldCostBase + sigil.goldCostStep * Math.max(0, level - 1)),
            shards: Math.round(sigil.shardCostBase + sigil.shardCostStep * Math.max(0, level - 1))
        };
    }

    function grantRewardToSave(reward, saveSnapshot) {
        if (!reward || !saveSnapshot) return;
        saveSnapshot.gold = Number(saveSnapshot.gold || 0) + (Number(reward.gold) || 0);
        saveSnapshot.dust = Number(saveSnapshot.dust || 0) + (Number(reward.dust) || 0);
        saveSnapshot.catalyst = Number(saveSnapshot.catalyst || 0) + (Number(reward.catalyst) || 0);
        saveSnapshot.seasonXp = Number(saveSnapshot.seasonXp || 0) + (Number(reward.seasonXp) || 0);
        if (reward.sigils) {
            saveSnapshot.sigilShards = { ...(saveSnapshot.sigilShards || {}) };
            Object.entries(reward.sigils).forEach(([sigilId, amount]) => {
                saveSnapshot.sigilShards[sigilId] = getSigilShardCountForSave(sigilId, saveSnapshot) + (Number(amount) || 0);
            });
        }
    }

    function grantFocusShardsToSave(familyIds = [], amount = 0, saveSnapshot = state.save) {
        if (!familyIds.length || amount <= 0 || !saveSnapshot) return;
        saveSnapshot.sigilShards = { ...(saveSnapshot.sigilShards || {}) };
        config.sigils.forEach((sigil) => {
            if (familyIds.includes(sigil.family)) {
                saveSnapshot.sigilShards[sigil.id] = getSigilShardCountForSave(sigil.id, saveSnapshot) + amount;
            }
        });
    }

    function getActionStateSummary(saveSnapshot = state.save) {
        let fuseReady = 0;
        let awakenReady = 0;
        let sigilUnlockReady = 0;
        let sigilUpgradeReady = 0;
        let workshopReady = 0;

        config.gemFamilies.forEach((family) => {
            config.gemTiers.forEach((tierMeta) => {
                const count = getGemCountForSave(family.id, tierMeta.tier, saveSnapshot);
                if (count >= tierMeta.fuseNeed && tierMeta.tier < 5 && canAffordCost(getFuseCost(tierMeta.tier), saveSnapshot)) fuseReady += 1;
                if (tierMeta.tier >= 3 && count >= 1 && canAffordCost(getAwakenCost(tierMeta.tier), saveSnapshot)) awakenReady += 1;
            });
        });

        config.sigils.forEach((sigil) => {
            const level = getSigilLevelForSave(sigil.id, saveSnapshot);
            const shardOwned = getSigilShardCountForSave(sigil.id, saveSnapshot);
            const unlockCost = getSigilUnlockCost(sigil.id);
            const upgradeCost = getSigilUpgradeCostForSave(sigil.id, saveSnapshot);
            if (level <= 0 && Number(saveSnapshot.gold || 0) >= unlockCost.gold && shardOwned >= unlockCost.shards) sigilUnlockReady += 1;
            if (level > 0 && level < 8 && Number(saveSnapshot.gold || 0) >= upgradeCost.gold && shardOwned >= upgradeCost.shards) sigilUpgradeReady += 1;
        });

        config.workshop.forEach((item) => {
            const level = getWorkshopLevelForSave(item.id, saveSnapshot);
            const cost = getWorkshopUpgradeCostForSave(item.id, saveSnapshot);
            if (level < item.maxLevel && Number(saveSnapshot.gold || 0) >= cost.gold && Number(saveSnapshot.dust || 0) >= cost.dust) workshopReady += 1;
        });

        return {
            fuseReady,
            awakenReady,
            sigilUnlockReady,
            sigilUpgradeReady,
            workshopReady,
            totalReady: fuseReady + awakenReady + sigilUnlockReady + sigilUpgradeReady + workshopReady
        };
    }

    function renderOfferActionDeltaChips(projected) {
        const chips = [];
        if (projected.newFuseReady > 0) chips.push(`<span class="gf-chip is-success">${text('新合成', 'New Fuse')} +${projected.newFuseReady}</span>`);
        if (projected.newAwakenReady > 0) chips.push(`<span class="gf-chip is-success">${text('新觉醒', 'New Awaken')} +${projected.newAwakenReady}</span>`);
        if (projected.newSigilUnlockReady > 0) chips.push(`<span class="gf-chip is-warning">${text('新解锁', 'New Unlock')} +${projected.newSigilUnlockReady}</span>`);
        if (projected.newSigilUpgradeReady > 0) chips.push(`<span class="gf-chip is-warning">${text('新升印', 'New Sigil Up')} +${projected.newSigilUpgradeReady}</span>`);
        if (projected.newWorkshopReady > 0) chips.push(`<span class="gf-chip">${text('新工坊', 'New Workshop')} +${projected.newWorkshopReady}</span>`);
        return chips.join('');
    }

    function getProjectedOfferImpact(offer, saveSnapshot = state.save) {
        const projected = clone(saveSnapshot);
        projected.payment = { ...(saveSnapshot.payment || {}) };
        projected.permanent = { ...(saveSnapshot.permanent || {}) };
        projected.sigilShards = { ...(saveSnapshot.sigilShards || {}) };
        projected.workshopLevels = { ...(saveSnapshot.workshopLevels || {}) };
        projected.gems = { ...(saveSnapshot.gems || {}) };
        projected.awakened = { ...(saveSnapshot.awakened || {}) };

        const currentSummary = getActionStateSummary(saveSnapshot);
        const contract = config.contracts[saveSnapshot.contractIndex] || config.contracts[0];

        grantRewardToSave(offer.reward, projected);
        grantFocusShardsToSave(contract.focus || [], Number(offer.focusShards) || 0, projected);
        applyPermanentBonus(offer.permanent, projected);
        projected.payment.passUnlocked = true;
        projected.payment.totalSpent = Number((Number(projected.payment.totalSpent || 0) + Number(offer.price || 0)).toFixed(2));
        projected.payment.purchaseCount = Number(projected.payment.purchaseCount || 0) + 1;

        const projectedSummary = getActionStateSummary(projected);
        const currentPower = getCurrentPower(saveSnapshot);
        const projectedPower = getCurrentPower(projected);
        const currentGap = Math.max(0, contract.recommended - getEffectiveContractPower(saveSnapshot));
        const projectedGap = Math.max(0, contract.recommended - getEffectiveContractPower(projected));
        const currentReachIndex = getHighestClearableContractIndex(saveSnapshot);
        const projectedReachIndex = getHighestClearableContractIndex(projected);

        return {
            contractId: contract.id,
            currentTier: getSponsorTier(saveSnapshot),
            projectedTier: getSponsorTier(projected),
            powerGain: Math.max(0, projectedPower.total - currentPower.total),
            currentGap,
            projectedGap,
            currentReachIndex,
            projectedReachIndex,
            reachGain: Math.max(0, projectedReachIndex - currentReachIndex),
            unlocksPass: !saveSnapshot.payment?.passUnlocked,
            newFuseReady: Math.max(0, projectedSummary.fuseReady - currentSummary.fuseReady),
            newAwakenReady: Math.max(0, projectedSummary.awakenReady - currentSummary.awakenReady),
            newSigilUnlockReady: Math.max(0, projectedSummary.sigilUnlockReady - currentSummary.sigilUnlockReady),
            newSigilUpgradeReady: Math.max(0, projectedSummary.sigilUpgradeReady - currentSummary.sigilUpgradeReady),
            newWorkshopReady: Math.max(0, projectedSummary.workshopReady - currentSummary.workshopReady),
            actionUnlocks: Math.max(0, projectedSummary.totalReady - currentSummary.totalReady)
        };
    }

    function renderPaymentOfferGrid() {
        if (!ui.paymentOfferGrid) return;
        const recommendedOfferId = getRecommendedPaymentOfferId();
        ui.paymentOfferGrid.innerHTML = config.paymentOffers.map((offer) => {
            const projected = getProjectedOfferImpact(offer);
            const summary = projected.actionUnlocks > 0
                ? text(`预计立刻打开 ${projected.actionUnlocks} 个可操作成长点。`, `Immediately opens ${projected.actionUnlocks} actionable growth steps.`)
                : projected.currentGap > projected.projectedGap
                    ? text(`预计缩小静态差距 ${formatCompact(projected.currentGap - projected.projectedGap)}，并立刻补一波资源。`, `Cuts the static gap by ${formatCompact(projected.currentGap - projected.projectedGap)} and instantly refills resources.`)
                    : text('直接补金币 / 熔尘 / 催化，并抬高常驻赞助属性。', 'Directly refills gold / dust / catalyst and raises permanent sponsor stats.');
            return `
                <button
                    class="gf-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}"
                    type="button"
                    data-select-payment-offer="${offer.id}"
                >
                    <span class="pill gf-payment-offer-badge">${text('链上礼包', 'On-Chain Pack')}</span>
                    ${offer.id === recommendedOfferId ? `<span class="pill gf-payment-offer-badge">${text('当前推荐', 'Recommended')}</span>` : ''}
                    <div class="gf-payment-offer-price">$${offer.price.toFixed(2)}</div>
                    <h3>${localize(offer.name)}</h3>
                    <p>${summary}</p>
                    <div class="gf-chip-row">
                        <span class="gf-chip is-strong">${text('战力', 'Power')} +${formatCompact(projected.powerGain)}</span>
                        <span class="gf-chip">${text('卡点差距', 'Gap')} ${formatCompact(projected.currentGap)} → ${formatCompact(projected.projectedGap)}</span>
                        ${(offer.focusShards || 0) > 0 ? `<span class="gf-chip is-success">${text('焦点碎片', 'Focus Shards')} +${formatCompact(offer.focusShards || 0)}</span>` : ''}
                        ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text('预计推进', 'Reach')} +${projected.reachGain}</span>` : ''}
                        ${renderOfferActionDeltaChips(projected)}
                    </div>
                </button>
            `;
        }).join('');
    }

    renderPaymentOffer = function renderPaymentOfferEnhancedV2(offer) {
        const projected = getProjectedOfferImpact(offer);
        const summary = projected.actionUnlocks > 0
            ? text(`预计立刻打开 ${projected.actionUnlocks} 个可操作成长点，适合直接越过当前卡点。`, `Immediately opens ${projected.actionUnlocks} actionable growth steps, making it suitable for breaking the current wall.`)
            : projected.currentGap > projected.projectedGap
                ? text(`预计缩小静态差距 ${formatCompact(projected.currentGap - projected.projectedGap)}，并立刻补一波资源。`, `Cuts the static gap by ${formatCompact(projected.currentGap - projected.projectedGap)} and instantly refills resources.`)
                : text('直接补金币 / 熔尘 / 催化，并抬高常驻赞助属性。', 'Directly refills gold / dust / catalyst and raises permanent sponsor stats.');
        return `
            <article class="gf-compact-row ${projected.powerGain > 0 || projected.actionUnlocks > 0 ? 'is-ready' : ''}">
                <div class="gf-compact-main">
                    <div class="gf-compact-title">${localize(offer.name)}</div>
                    <div class="gf-compact-sub">${summary}</div>
                    <div class="gf-chip-row">
                        ${renderRewardChips(offer.reward, { limit: 3 })}
                        <span class="gf-chip is-strong">${text('战力', 'Power')} +${formatCompact(projected.powerGain)}</span>
                        ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text('预计推进', 'Reach')} +${projected.reachGain}</span>` : ''}
                        ${renderOfferActionDeltaChips(projected)}
                    </div>
                </div>
                <div class="gf-compact-side">
                    <strong>$${offer.price.toFixed(2)}</strong>
                    <button class="primary-btn" type="button" data-action="buyOffer" data-value="${offer.id}">${text('链上支付', 'Pay')}</button>
                </div>
            </article>
        `;
    };

    function getShopPrice(itemId) {
        const item = config.shopItems.find((entry) => entry.id === itemId);
        if (!item || item.free) return 0;
        const repeatFactor = Math.pow(1 + item.repeatGrowth, getShopPurchaseCount(itemId));
        const progressFactor = 1 + Math.max(0, state.save.contractIndex - 2) * 0.04;
        return Math.round(item.basePrice * repeatFactor * progressFactor);
    }

    function getVisibleSigils(limit = 4) {
        const sorted = config.sigils.slice().sort((a, b) => getSigilSortScore(b.id) - getSigilSortScore(a.id));
        const visible = [];
        const seen = new Set();

        function pushMatches(predicate) {
            sorted.forEach((sigil) => {
                if (visible.length >= limit || seen.has(sigil.id) || !predicate(sigil)) return;
                seen.add(sigil.id);
                visible.push(sigil);
            });
        }

        pushMatches((sigil) => state.save.selectedSigils.includes(sigil.id) && getSigilLevel(sigil.id) > 0);
        pushMatches((sigil) => {
            const level = getSigilLevel(sigil.id);
            const unlockCost = getSigilUnlockCost(sigil.id);
            return level <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigil.id) >= unlockCost.shards;
        });
        pushMatches((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
        });
        pushMatches((sigil) => getCurrentContract().focus.includes(sigil.family));
        pushMatches(() => true);
        return visible;
    }

    function getSigilTabSummary() {
        const unlockedCount = config.sigils.filter((sigil) => getSigilLevel(sigil.id) > 0).length;
        const unlockReadyCount = config.sigils.filter((sigil) => {
            const unlockCost = getSigilUnlockCost(sigil.id);
            return getSigilLevel(sigil.id) <= 0 && state.save.gold >= unlockCost.gold && getSigilShardCount(sigil.id) >= unlockCost.shards;
        }).length;
        const upgradeReadyCount = config.sigils.filter((sigil) => {
            const level = getSigilLevel(sigil.id);
            const cost = getSigilUpgradeCost(sigil.id);
            return level > 0 && level < 8 && state.save.gold >= cost.gold && getSigilShardCount(sigil.id) >= cost.shards;
        }).length;
        const focusFamilies = getCurrentContract().focus.slice();
        const focusCount = config.sigils.filter((sigil) => focusFamilies.includes(sigil.family)).length;
        return { unlockedCount, unlockReadyCount, upgradeReadyCount, focusCount, focusFamilies };
    }

    buyShopItem = wrapActionWithMotion(function buyShopItemEnhanced(itemId) {
        const item = config.shopItems.find((entry) => entry.id === itemId);
        if (!item || item.free) return;
        if (item.requiresSponsor && !state.save.payment.passUnlocked) return showToast(text('需要先开通赞助。', 'Sponsor unlock is required first.'));
        const price = getShopPrice(itemId);
        if (item.priceType === 'gold') {
            if (state.save.gold < price) return showToast(text('金币不足。', 'Not enough gold.'));
            state.save.gold -= price;
        } else {
            if (state.save.dust < price) return showToast(text('熔尘不足。', 'Not enough dust.'));
            state.save.dust -= price;
        }
        grantReward(item.reward);
        grantFocusShards(getCurrentContract().focus, item.id === 'goldCrate' ? 6 : 4);
        state.save.shopPurchases[itemId] = getShopPurchaseCount(itemId) + 1;
        state.save.lastResult = {
            type: 'shop',
            title: text(`商店到账 · ${localize(item.title)}`, `Shop Delivery · ${localize(item.title)}`),
            copy: text(`支付 ${item.priceType === 'gold' ? `${formatCompact(price)} 金币` : `${formatCompact(price)} 熔尘`} 后，补给已到账。`, `Paid ${item.priceType === 'gold' ? `${formatCompact(price)} gold` : `${formatCompact(price)} dust`} and received the supply.`),
            tags: [
                item.priceType === 'gold' ? `${text('花费', 'Cost')} ${formatCompact(price)}G` : `${text('花费', 'Cost')} ${formatCompact(price)}D`,
                item.reward?.gold ? `${text('金币', 'Gold')} +${formatCompact(item.reward.gold)}` : '',
                item.reward?.dust ? `${text('熔尘', 'Dust')} +${formatCompact(item.reward.dust)}` : '',
                item.reward?.catalyst ? `${text('催化', 'Catalyst')} +${formatCompact(item.reward.catalyst)}` : ''
            ].slice(0, 3)
        };
        showToast(text('补给已到账。', 'Shop reward delivered.'));
        saveProgress();
        renderAll();
    }, 'claim', 420);

    function getForgeTimingBadgeLabel(outcome) {
        switch (outcome?.id) {
            case 'perfect': return text('完美窗', 'Perfect');
            case 'great': return text('甜区', 'Sweet');
            case 'good': return text('稳定区', 'Stable');
            case 'rough': return text('擦边', 'Rough');
            case 'unstable': return text('过热', 'Overheat');
            default: return text('待开炉', 'Ready');
        }
    }

    function getForgeTimingPreviewText(outcome) {
        if (!outcome || outcome.id === 'idle') {
            return text('甜区收炉更容易出珍藏，完美区还能把跳阶和双掉一起抬起来。', 'Sweet-zone stops are best for relics, while Perfect also boosts tier jumps and doubles.');
        }
        const parts = [];
        const relicChance = Math.max(0, Number(outcome.relicChance) || 0);
        const jumpChance = Math.max(0, Number(outcome.jumpChance) || 0);
        const doubleChance = Math.max(0, Number(outcome.doubleChance) || 0);
        const dustBonus = Math.max(0, Number(outcome.dustBonus) || 0);
        const streak = Math.max(0, Number(state.save.forgeCombo) || 0);

        if (relicChance > 0) parts.push(text(`珍藏 +${Math.round(relicChance * 100)}%`, `Relic +${Math.round(relicChance * 100)}%`));
        if (jumpChance > 0) parts.push(text(`跳阶 +${Math.round(jumpChance * 100)}%`, `Tier Jump +${Math.round(jumpChance * 100)}%`));
        if (doubleChance > 0) parts.push(text(`双掉 +${Math.round(doubleChance * 100)}%`, `Double +${Math.round(doubleChance * 100)}%`));
        if (dustBonus > 0) parts.push(text(`熔尘 +${formatCompact(dustBonus)}`, `Dust +${formatCompact(dustBonus)}`));
        if (streak > 0) parts.push(text(`连击 x${formatCompact(streak)}`, `Streak x${formatCompact(streak)}`));
        if (!parts.length) parts.push(text(`XP +${formatCompact(outcome.xpBonus || 0)}`, `XP +${formatCompact(outcome.xpBonus || 0)}`));
        return parts.slice(0, 3).join(' · ');
    }

    function getForgeTimingLadderLines(outcomeId) {
        const meta = getForgeTimingMeta(outcomeId);
        if (!meta) return { lead: '', sub: '' };
        if (meta.id === 'unstable') {
            return {
                lead: text(`熔尘 +${formatCompact(meta.dustBonus)}`, `Dust +${formatCompact(meta.dustBonus)}`),
                sub: text('练手区', 'Practice')
            };
        }
        if (meta.id === 'rough') {
            return {
                lead: text(`熔尘 +${formatCompact(meta.dustBonus)}`, `Dust +${formatCompact(meta.dustBonus)}`),
                sub: text('会断连', 'Breaks streak')
            };
        }
        return {
            lead: meta.relicChance > 0
                ? text(`珍藏 +${Math.round(meta.relicChance * 100)}%`, `Relic +${Math.round(meta.relicChance * 100)}%`)
                : text(`XP +${formatCompact(meta.xpBonus || 0)}`, `XP +${formatCompact(meta.xpBonus || 0)}`),
            sub: meta.jumpChance > 0
                ? text(`跳阶 +${Math.round(meta.jumpChance * 100)}%`, `Tier Jump +${Math.round(meta.jumpChance * 100)}%`)
                : meta.doubleChance > 0
                    ? text(`双掉 +${Math.round(meta.doubleChance * 100)}%`, `Double +${Math.round(meta.doubleChance * 100)}%`)
                    : text(`XP +${formatCompact(meta.xpBonus || 0)}`, `XP +${formatCompact(meta.xpBonus || 0)}`)
        };
    }

    function renderForgeTimingLadder(activeOutcomeId = 'idle') {
        return `
            <div class="gf-forge-ladder">
                ${['perfect', 'great', 'good', 'rough', 'unstable'].map((outcomeId) => {
                    const meta = getForgeTimingMeta(outcomeId);
                    const lines = getForgeTimingLadderLines(outcomeId);
                    return `
                        <div class="gf-forge-ladder-chip is-${outcomeId} ${activeOutcomeId === outcomeId ? 'is-active' : ''}">
                            <strong>${text(meta.shortZh, meta.shortEn)}</strong>
                            <span>${lines.lead}</span>
                            <small>${lines.sub}</small>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function getForgeStagePrimaryChase(contract = getCurrentContract()) {
        const views = getRelicChaseViews(contract);
        return views.find((item) => item.claimable)
            || views.find((item) => !item.claimed)
            || views[0]
            || null;
    }

    function getForgeStageChaseSummary(view) {
        if (!view) return text('先开一炉，拿到第一批库存和第一件珍藏，再开始滚动养成。', 'Forge once to get the first stock and first relic, then start the growth loop.');
        if (view.claimed) return text('这一档追逐已经完成，当前更适合继续冲更高稀有和更高收藏分。', 'This chase tier is done. The next best move is pushing for higher rarity and collector score.');
        if (view.claimable) return text('这一档已经达标，建议先领掉奖励，再继续冲下一档更高价值目标。', 'This chase tier is ready. Claim it first, then keep pushing the next higher-value target.');
        const remain = Math.max(0, Number(view.target || 0) - Number(view.progress || 0));
        if (Number(view.target || 0) <= 3) {
            return text(`还差 ${formatCompact(remain)} 步，优先盯准甜区和完美区收炉。`, `${formatCompact(remain)} steps left. Prioritize Sweet and Perfect stops.`);
        }
        return text(`还差 ${formatCompact(remain)}，继续抬高焦点线的收藏分即可推进。`, `${formatCompact(remain)} more. Keep raising collector score in the focus lines.`);
    }

    function renderForgeStageChaseCard(contract, chaseView) {
        if (!chaseView) return '';
        const action = chaseView.claimable
            ? { label: text('领取追逐', 'Claim Chase'), action: 'claimRelicChase', value: chaseView.claimKey, cls: 'primary-btn' }
            : state.forgeTiming.active
                ? { label: text('立即收炉', 'Stop Now'), action: 'stopForgeTiming', value: '', cls: 'primary-btn' }
                : { label: text('继续冲珍藏', 'Chase Relics'), action: 'startForgeTiming', value: '', cls: 'ghost-btn' };
        const rewardChips = renderRewardChips(chaseView.reward, { limit: 2 });
        const permanentChips = renderPermanentChips(chaseView.permanent, { limit: 1 });
        return `
            <article class="gf-forge-focus-card ${chaseView.claimable ? 'is-ready' : ''}">
                <div class="gf-forge-focus-head">
                    <span>${text('当前追逐', 'Current Chase')}</span>
                    <strong>${chaseView.title}</strong>
                </div>
                <p class="gf-forge-focus-copy">${getForgeStageChaseSummary(chaseView)}</p>
                <div class="gf-progress gf-progress--small"><i style="width:${(chaseView.progressRate * 100).toFixed(2)}%;"></i></div>
                <div class="gf-chip-row" style="margin-top:10px;">
                    <span class="gf-chip is-strong">${contract.id}</span>
                    <span class="gf-chip ${chaseView.claimable ? 'is-success' : ''}">${formatCompact(chaseView.progress)}/${formatCompact(chaseView.target)}</span>
                    ${rewardChips}
                    ${permanentChips}
                </div>
                <div class="gf-action-row gf-forge-mini-actions" style="margin-top:10px;">
                    <button class="${action.cls}" type="button" data-action="${action.action}" ${action.value ? `data-value="${action.value}"` : ''}>${action.label}</button>
                </div>
            </article>
        `;
    }

    function renderForgeStageCollectionCard(contract, relicSummary) {
        const breakdown = getForgeRelicBreakdown();
        const bestRelic = relicSummary.best;
        const bestLabel = bestRelic
            ? `${localize(bestRelic.title)} · ${getForgeRelicRarityLabel(bestRelic.rarity)}`
            : text('尚未入柜', 'No relic yet');
        const focusLabel = contract.focus.map((familyId) => localize(familyMap[familyId]?.name)).join(' / ');
        const nextRelicCopy = relicSummary.pityRemain <= 1
            ? text('下炉至少出 1 件珍藏', 'Next forge guarantees a relic')
            : text(`再控 ${formatCompact(relicSummary.pityRemain)} 炉保底珍藏`, `Relic pity in ${formatCompact(relicSummary.pityRemain)}`);
        return `
            <article class="gf-forge-focus-card is-secondary">
                <div class="gf-forge-focus-head">
                    <span>${text('当前藏柜', 'Current Cabinet')}</span>
                    <strong>${bestLabel}</strong>
                </div>
                ${renderKpiGrid([
                    { label: text('珍藏数', 'Relics'), value: formatCompact(relicSummary.count) },
                    { label: text('收藏分', 'Collector'), value: formatCompact(breakdown.collectorScore) },
                    { label: text('最高单件', 'Top Piece'), value: formatCompact(breakdown.topScore) }
                ])}
                <div class="gf-chip-row" style="margin-top:10px;">
                    <span class="gf-chip">${nextRelicCopy}</span>
                    <span class="gf-chip">${text('焦点', 'Focus')} · ${focusLabel || text('通用池', 'Mixed Pool')}</span>
                    <span class="gf-chip ${relicSummary.combo > 0 ? 'is-success' : ''}">${text('连击', 'Streak')} · x${formatCompact(relicSummary.combo)}</span>
                </div>
            </article>
        `;
    }

    getForgeTimingRestingState = function getForgeTimingRestingStateEnhanced() {
        const lastOutcome = state.forgeTiming.lastOutcome && state.forgeTiming.lastOutcome !== 'idle'
            ? getForgeTimingMeta(state.forgeTiming.lastOutcome)
            : null;
        return {
            id: lastOutcome ? lastOutcome.id : 'idle',
            status: lastOutcome
                ? text(`上次手感 · ${lastOutcome.shortZh}`, `Last touch · ${lastOutcome.shortEn}`)
                : text('手动控火', 'Manual Control'),
            hint: lastOutcome
                ? text(`保持节奏，再把收炉点压进更中间的甜区，珍藏和跳阶会更稳。`, 'Keep the rhythm and stop closer to the center to stabilize relic and tier-jump odds.')
                : text('先点开始控火，指针扫过甜区或完美区时再次点击收炉。', 'Tap Start Control, then stop again when the pointer crosses the Sweet or Perfect zone.'),
            tone: lastOutcome?.tone || 'neutral'
        };
    };

    renderForgeStageCard = function renderForgeStageCardEnhancedV3(options = {}) {
        const contract = options.contract || getCurrentContract();
        const effectivePower = Number(options.effectivePower || 0);
        const gap = Math.max(0, contract.recommended - effectivePower);
        const heatMax = Math.max(1, getHeatMax());
        const heatPercent = Math.min(100, (state.save.heat / heatMax) * 100);
        const t3Remain = Math.max(0, config.forgeBalance.pityTier3Need - state.save.pity.t3);
        const t4Remain = Math.max(0, config.forgeBalance.pityTier4Need - state.save.pity.t4);
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const locked = slotId === 'resonance' && state.save.bestContractIndex < 2;
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, locked, level };
        });
        const slotPills = slotCards.map((item) => ({
            label: getSlotName(item.slotId),
            value: item.locked
                ? text('未开', 'Locked')
                : item.sigil && item.level > 0
                    ? `${localize(item.sigil.name)} Lv.${item.level}`
                    : text('空位', 'Empty')
        }));
        const focusFamilies = contract.focus.map((familyId) => ({
            family: familyMap[familyId],
            total: getFamilyGemCount(familyId),
            awakened: getFamilyAwakenedCount(familyId)
        }));
        const focusAwakened = focusFamilies.reduce((sum, item) => sum + item.awakened, 0);
        const heatEnoughOne = state.save.heat >= SMELT_HEAT_COST;
        const heatEnoughBatch = state.save.heat >= config.forgeBalance.batchSmeltHeatCost;
        const timingOutcome = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer) : getForgeTimingRestingState();
        const timingQualityId = state.forgeTiming.active ? timingOutcome.id : String(state.forgeTiming.lastOutcome || 'idle');
        const relicSummary = getForgeRelicSummary();
        const timingNeedleLeft = `${(state.forgeTiming.pointer * 100).toFixed(2)}%`;
        const focusLabel = contract.focus.map((familyId) => localize(familyMap[familyId]?.name)).join(' / ');
        const chaseView = getForgeStagePrimaryChase(contract);

        return `
            <article id="gfForgeStageCard" class="gf-card gf-forge-stage" data-quality="${timingQualityId}">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('熔炉主舞台', 'Forge Stage')}</div>
                        <div class="gf-card-title">${gap > 0 ? text(`距离 ${contract.id} 还差 ${formatCompact(gap)}`, `${formatCompact(gap)} short of ${contract.id}`) : text(`${contract.id} 已可稳定推进`, `${contract.id} ready`)}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                </div>
                ${renderKpiGrid([
                    { label: gap > 0 ? text('合同缺口', 'Contract Gap') : text('推进状态', 'Push Status'), value: gap > 0 ? formatCompact(gap) : text('可推进', 'Ready') },
                    { label: text('热量恢复', 'Heat Regen'), value: `${formatCompact(getHeatRegenPerSecond())}/s` },
                    { label: text('珍藏保底', 'Relic Pity'), value: relicSummary.pityRemain <= 0 ? text('本炉', 'Now') : formatCompact(relicSummary.pityRemain) },
                    { label: text('焦点觉醒', 'Awakened'), value: formatCompact(focusAwakened) }
                ])}
                <div id="gfForgeScene" class="gf-forge-scene gf-forge-scene--solo" data-quality="${timingQualityId}">
                    <div class="gf-forge-core-wrap">
                        <div class="gf-forge-core">
                            <div id="gfForgeCoreBadge" class="gf-forge-core-badge is-${timingQualityId}">${state.forgeTiming.active ? text('控火中', 'Live') : text('待开炉', 'Ready')} · ${getForgeTimingBadgeLabel(timingOutcome)}</div>
                            <span>${text('炉芯热量', 'Core Heat')}</span>
                            <strong>${formatCompact(Math.floor(state.save.heat))}</strong>
                            <small>${heatPercent.toFixed(0)}% · ${text('上限', 'Cap')} ${formatCompact(heatMax)}</small>
                            <div class="gf-forge-core-sub">${text('焦点线', 'Focus')} · ${focusLabel || text('通用池', 'Mixed Pool')}</div>
                        </div>
                        <div class="gf-forge-meter-grid">
                            <div class="gf-forge-meter">
                                <span>T3 ${text('保底', 'Pity')}</span>
                                <strong>${t3Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t3 / Math.max(1, config.forgeBalance.pityTier3Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                            <div class="gf-forge-meter">
                                <span>T4 ${text('保底', 'Pity')}</span>
                                <strong>${t4Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t4 / Math.max(1, config.forgeBalance.pityTier4Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                        </div>
                        <div class="gf-forge-control">
                            <div class="gf-forge-control-head">
                                <span>${state.forgeTiming.active ? text('控火进行中', 'Control Live') : text('手动控火', 'Manual Control')}</span>
                                <strong id="gfForgeTimingStatus">${timingOutcome.status}</strong>
                            </div>
                            <div id="gfForgeTimingPreview" class="gf-forge-timing-preview">${getForgeTimingPreviewText(timingOutcome)}</div>
                            <button id="gfForgeTimingBar" class="gf-forge-timing-bar ${state.forgeTiming.active ? 'is-active' : ''}" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}" data-quality="${timingQualityId}">
                                <span class="gf-forge-timing-zone is-good"></span>
                                <span class="gf-forge-timing-zone is-great"></span>
                                <span class="gf-forge-timing-zone is-perfect"></span>
                                <span class="gf-forge-timing-center"></span>
                                <i id="gfForgeTimingNeedle" class="gf-forge-timing-needle" style="left:${timingNeedleLeft};"></i>
                                <b id="gfForgeTimingAimTag" class="gf-forge-timing-tag is-${timingQualityId}">${getForgeTimingBadgeLabel(timingOutcome)}</b>
                            </button>
                            <div id="gfForgeTimingHint" class="gf-forge-control-copy">${timingOutcome.hint}</div>
                            ${renderForgeTimingLadder(timingQualityId)}
                        </div>
                    </div>
                    <div class="gf-forge-focus-grid">
                        ${renderForgeStageChaseCard(contract, chaseView)}
                        ${renderForgeStageCollectionCard(contract, relicSummary)}
                    </div>
                    <div class="gf-action-row">
                        <button class="primary-btn" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}">${state.forgeTiming.active
                            ? text('定点收炉', 'Lock Result')
                            : (heatEnoughOne ? text('开始控火', 'Start Control') : text(`热量不足 · 还差 ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))}`, `Need ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))} heat`))}</button>
                        <button class="ghost-btn" type="button" data-action="smeltOne">${heatEnoughOne ? text('速熔 1 次', 'Quick Smelt') : text('等待热量', 'Wait Heat')}</button>
                        <button class="ghost-btn" type="button" data-action="smeltBatch">${heatEnoughBatch ? text('批量速熔 x3', 'Batch x3') : text(`批量还差 ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`, `Need ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`)}</button>
                    </div>
                    <div class="gf-inline-grid gf-forge-quick-grid">
                        ${slotPills.map((item) => `
                            <div class="gf-inline-pill">
                                <span>${item.label}</span>
                                <strong>${item.value}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </article>
        `;
    };

    syncForgeTimingUi = function syncForgeTimingUiEnhanced() {
        const bar = document.getElementById('gfForgeTimingBar');
        const needle = document.getElementById('gfForgeTimingNeedle');
        const status = document.getElementById('gfForgeTimingStatus');
        const hint = document.getElementById('gfForgeTimingHint');
        const preview = document.getElementById('gfForgeTimingPreview');
        const aimTag = document.getElementById('gfForgeTimingAimTag');
        const coreBadge = document.getElementById('gfForgeCoreBadge');
        const scene = document.getElementById('gfForgeScene');
        const stage = document.getElementById('gfForgeStageCard');
        const qualityId = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer).id : String(state.forgeTiming.lastOutcome || 'idle');
        const outcome = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer) : getForgeTimingRestingState();

        [bar, scene, stage].forEach((node) => {
            if (!node) return;
            if (node === bar) node.classList.toggle('is-active', !!state.forgeTiming.active);
            node.dataset.quality = qualityId;
        });
        if (needle) needle.style.left = `${(state.forgeTiming.pointer * 100).toFixed(2)}%`;
        if (status) status.textContent = outcome.status;
        if (hint) hint.textContent = outcome.hint;
        if (preview) preview.textContent = getForgeTimingPreviewText(outcome);
        if (aimTag) {
            aimTag.textContent = getForgeTimingBadgeLabel(outcome);
            aimTag.className = `gf-forge-timing-tag is-${qualityId}`;
        }
        if (coreBadge) {
            coreBadge.textContent = `${state.forgeTiming.active ? text('控火中', 'Live') : text('待开炉', 'Ready')} · ${getForgeTimingBadgeLabel(outcome)}`;
            coreBadge.className = `gf-forge-core-badge is-${qualityId}`;
        }
    };

    function renderRelicCabinetCompactCard(contract = getCurrentContract()) {
        const summary = getForgeRelicSummary();
        const breakdown = getForgeRelicBreakdown();
        const topRelic = getForgeTopRelics(1)[0] || null;
        const collectorTier = localize(getForgeCollectorTier(breakdown.collectorScore));
        const focusFamilies = (contract.focus || []).slice();
        const focusRelicCount = focusFamilies.reduce((sum, familyId) => sum + Math.max(0, Number(breakdown.byFamily[familyId]) || 0), 0);
        const mainLine = Object.entries(breakdown.byFamily)
            .sort((left, right) => right[1] - left[1])[0];
        const mainLineLabel = mainLine && mainLine[1] > 0
            ? `${localize(familyMap[mainLine[0]]?.name)} x${mainLine[1]}`
            : text('尚未成柜', 'No main line yet');

        return `
            <article class="gf-card gf-relic-cabinet">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('章节藏柜', 'Chapter Cabinet')}</div>
                        <div class="gf-card-title">${collectorTier}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(breakdown.collectorScore)}</div>
                </div>
                ${renderKpiGrid([
                    { label: text('收藏分', 'Collector'), value: formatCompact(breakdown.collectorScore) },
                    { label: text('焦点藏品', 'Focus Relics'), value: formatCompact(focusRelicCount) },
                    { label: text('最高单件', 'Top Piece'), value: formatCompact(breakdown.topScore) },
                    { label: text('保底', 'Pity'), value: formatCompact(summary.pityRemain) }
                ])}
                <div class="gf-chip-row" style="margin-top:12px;">
                    <span class="gf-chip is-strong">${text('主力线', 'Main Line')} · ${mainLineLabel}</span>
                    <span class="gf-chip">${text('神话/传说', 'Mythic/Legend')} · ${formatCompact(breakdown.byRarity.mythic)}/${formatCompact(breakdown.byRarity.legend)}</span>
                </div>
                <div class="gf-list gf-list--compact" style="margin-top:12px;">
                    ${topRelic
                        ? renderRelicCompactRow(topRelic, 0)
                        : `<div class="gf-empty">${text('当前还没有珍藏，先回熔炉把第一件焦点藏品打出来。', 'No relics yet. Return to Forge and drop the first focus relic.')}</div>`}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="openTab" data-value="forge">${text('回熔炉冲藏品', 'Back to Forge')}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="shop">${text('看赞助增益', 'Sponsor Boost')}</button>
                </div>
            </article>
        `;
    }

    function renderRelicChaseCompactCard(contract = getCurrentContract()) {
        const views = getRelicChaseViews(contract);
        const claimableCount = views.filter((item) => item.claimable).length;
        const claimedCount = views.filter((item) => item.claimed).length;
        const visibleViews = [...views.filter((item) => item.claimable), ...views.filter((item) => !item.claimed && !item.claimable)]
            .slice(0, 2);
        const primaryView = visibleViews[0] || views[0] || null;
        const action = primaryView
            ? (primaryView.claimable
                ? { label: text('领取追逐', 'Claim Chase'), action: 'claimRelicChase', value: primaryView.claimKey, cls: 'primary-btn' }
                : { label: text('继续冲目标', 'Keep Pushing'), action: 'openTab', value: 'forge', cls: 'primary-btn' })
            : { label: text('去熔炉开炉', 'Go Forge'), action: 'openTab', value: 'forge', cls: 'primary-btn' };

        return `
            <article class="gf-card gf-relic-chase-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('章节追逐', 'Chapter Chase')}</div>
                        <div class="gf-card-title">${primaryView ? primaryView.title : text('暂无追逐', 'No Chase Yet')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(claimedCount)}/${formatCompact(views.length || 0)}</div>
                </div>
                ${renderKpiGrid([
                    { label: text('当前合同', 'Contract'), value: contract.id },
                    { label: text('已完成', 'Done'), value: formatCompact(claimedCount) },
                    { label: text('可领取', 'Ready'), value: formatCompact(claimableCount) },
                    { label: text('焦点线', 'Focus'), value: contract.focus.map((familyId) => localize(familyMap[familyId].name)).join('/') || '-' }
                ])}
                <div class="gf-list gf-list--compact" style="margin-top:12px;">
                    ${visibleViews.length
                        ? visibleViews.map(renderRelicChaseRow).join('')
                        : `<div class="gf-empty">${text('这一章的追逐还没开启，先推进当前合同并回熔炉打第一轮。', 'This chapter chase is not active yet. Push the current contract and start forging first.')}</div>`}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="${action.cls}" type="button" data-action="${action.action}" data-value="${action.value}">${action.label}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="forge">${text('回熔炉', 'Open Forge')}</button>
                </div>
            </article>
        `;
    }

    renderContractsTab = function renderContractsTabEnhancedV2() {
        const currentPower = getCurrentPower();
        const passives = getSigilPassives();
        const effectivePower = currentPower.total + passives.contractStability;
        const lastResult = state.save.lastResult;
        const diagnosis = getGrowthDiagnosis();
        const compactContracts = getVisibleContractViews(3);
        const currentContract = getCurrentContract();
        const nextPreview = config.contracts[Math.min(config.contracts.length - 1, state.save.bestContractIndex + 1)] || currentContract;
        const hiddenCount = Math.max(0, compactContracts.totalRelevant - compactContracts.visible.length);

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('合同推进', 'Contracts'),
                '',
                `<div class="gf-chip">${text('最高推进', 'Best')} · ${config.contracts[state.save.bestContractIndex].id}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card ${Math.max(0, currentContract.recommended - effectivePower) <= 0 ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('当前目标', 'Current Goal')}</div>
                            <div class="gf-card-title">${currentContract.id} · ${localize(currentContract.name)}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('基础战力', 'Base'), value: formatCompact(currentPower.total) },
                        { label: text('稳定补正', 'Stability'), value: `+${formatCompact(passives.contractStability)}` },
                        { label: text('推荐线', 'Recommended'), value: formatCompact(currentContract.recommended) },
                        { label: text('缺口', 'Gap'), value: formatCompact(Math.max(0, currentContract.recommended - effectivePower)) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${currentContract.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                        <span class="gf-chip ${Math.max(0, currentContract.recommended - effectivePower) > 0 ? 'is-warning' : 'is-success'}">${Math.max(0, currentContract.recommended - effectivePower) > 0 ? text('仍需补强', 'Need More Power') : text('已可推进', 'Ready')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="runContract" data-value="${state.save.contractIndex}">${text('执行当前合同', 'Run Contract')}</button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="${diagnosis.freeTab}">${diagnosis.freeLabel}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('路线快照', 'Route Snapshot')}</div>
                            <div class="gf-card-title">${currentContract.id} → ${nextPreview.id}</div>
                        </div>
                        <div class="gf-card-number">${diagnosis.freeShort}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('当前档', 'Current'), value: currentContract.id },
                        { label: text('下一档', 'Next'), value: nextPreview.id },
                        { label: text('本档金币', 'Gold'), value: formatCompact(getContractPreviewReward(currentContract).gold) },
                        { label: text('建议', 'Next Step'), value: diagnosis.freeShort }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${diagnosis.title}</span>
                        ${nextPreview.focus.map((familyId) => `<span class="gf-chip">${localize(familyMap[familyId].name)}</span>`).join('')}
                    </div>
                </article>
            </div>
            ${lastResult?.type === 'contract' ? renderContractSettlementCard(lastResult, { context: 'contracts', compact: true }) : ''}
            <div class="gf-card-grid">
                ${renderRelicCabinetCompactCard(currentContract)}
                ${renderRelicChaseCompactCard(currentContract)}
            </div>
            <div class="gf-list gf-list--compact">
                ${compactContracts.visible.map(renderContractCompactRow).join('')}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 档合同已折叠，只保留当前最相关的几档。`, `${hiddenCount} more contracts are collapsed so only the most relevant stages stay visible.`)}</div>` : ''}
        `;
    };

    renderForgeStageCard = function renderForgeStageCardEnhancedV5(options = {}) {
        const contract = options.contract || getCurrentContract();
        const effectivePower = Number(options.effectivePower || 0);
        const gap = Math.max(0, contract.recommended - effectivePower);
        const heatMax = Math.max(1, getHeatMax());
        const heatPercent = Math.min(100, (state.save.heat / heatMax) * 100);
        const t3Remain = Math.max(0, config.forgeBalance.pityTier3Need - state.save.pity.t3);
        const t4Remain = Math.max(0, config.forgeBalance.pityTier4Need - state.save.pity.t4);
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const locked = slotId === 'resonance' && state.save.bestContractIndex < 2;
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, locked, level };
        });
        const slotPills = slotCards.map((item) => ({
            label: getSlotName(item.slotId),
            value: item.locked
                ? text('未开', 'Locked')
                : item.sigil && item.level > 0
                    ? `${localize(item.sigil.name)} Lv.${item.level}`
                    : text('空槽', 'Empty')
        }));
        const focusFamilies = contract.focus.map((familyId) => ({
            family: familyMap[familyId],
            total: getFamilyGemCount(familyId),
            awakened: getFamilyAwakenedCount(familyId)
        }));
        const focusAwakened = focusFamilies.reduce((sum, item) => sum + item.awakened, 0);
        const heatEnoughOne = state.save.heat >= SMELT_HEAT_COST;
        const heatEnoughBatch = state.save.heat >= config.forgeBalance.batchSmeltHeatCost;
        const timingOutcome = state.forgeTiming.active ? evaluateForgeTiming(state.forgeTiming.pointer) : getForgeTimingRestingState();
        const timingQualityId = state.forgeTiming.active ? timingOutcome.id : String(state.forgeTiming.lastOutcome || 'idle');
        const relicSummary = getForgeRelicSummary();
        const timingNeedleLeft = `${(state.forgeTiming.pointer * 100).toFixed(2)}%`;
        const focusLabel = contract.focus.map((familyId) => localize(familyMap[familyId]?.name)).join(' / ');
        const chaseView = getForgeStagePrimaryChase(contract);

        return `
            <article id="gfForgeStageCard" class="gf-card gf-forge-stage" data-quality="${timingQualityId}">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('熔炉主舞台', 'Forge Stage')}</div>
                        <div class="gf-card-title">${gap > 0 ? text(`距离 ${contract.id} 还差 ${formatCompact(gap)}`, `${formatCompact(gap)} short of ${contract.id}`) : text(`${contract.id} 已可稳定推进`, `${contract.id} ready`)}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                </div>
                <div class="gf-inline-grid gf-inline-grid--four gf-forge-stage-kpis">
                    <div class="gf-inline-pill">
                        <span>${text('推进状态', 'Push State')}</span>
                        <strong>${gap > 0 ? text('可补强', 'Need Power') : text('可推进', 'Ready')}</strong>
                    </div>
                    <div class="gf-inline-pill">
                        <span>${text('热量恢复', 'Heat Regen')}</span>
                        <strong>${formatCompact(getHeatRegenPerSecond())}/s</strong>
                    </div>
                    <div class="gf-inline-pill">
                        <span>${text('珍藏保底', 'Relic Pity')}</span>
                        <strong>${relicSummary.pityRemain <= 0 ? text('本炉', 'Now') : formatCompact(relicSummary.pityRemain)}</strong>
                    </div>
                    <div class="gf-inline-pill">
                        <span>${text('焦点觉醒', 'Awakened')}</span>
                        <strong>${formatCompact(focusAwakened)}</strong>
                    </div>
                </div>
                <div id="gfForgeScene" class="gf-forge-scene gf-forge-scene--solo" data-quality="${timingQualityId}">
                    <div class="gf-forge-core-wrap">
                        <div class="gf-forge-core">
                            <div id="gfForgeCoreBadge" class="gf-forge-core-badge is-${timingQualityId}">${state.forgeTiming.active ? text('控火中', 'Live') : text('待开炉', 'Ready')} · ${getForgeTimingBadgeLabel(timingOutcome)}</div>
                            <span>${text('炉芯热量', 'Core Heat')}</span>
                            <strong>${formatCompact(Math.floor(state.save.heat))}</strong>
                            <small>${heatPercent.toFixed(0)}% · ${text('上限', 'Cap')} ${formatCompact(heatMax)}</small>
                            <div class="gf-forge-core-sub">${text('焦点线', 'Focus')} · ${focusLabel || text('通用池', 'Mixed Pool')}</div>
                        </div>
                        <div class="gf-forge-meter-grid">
                            <div class="gf-forge-meter">
                                <span>T3 ${text('保底', 'Pity')}</span>
                                <strong>${t3Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t3 / Math.max(1, config.forgeBalance.pityTier3Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                            <div class="gf-forge-meter">
                                <span>T4 ${text('保底', 'Pity')}</span>
                                <strong>${t4Remain}</strong>
                                <div class="gf-progress gf-progress--small"><i style="width:${Math.min(100, (state.save.pity.t4 / Math.max(1, config.forgeBalance.pityTier4Need)) * 100).toFixed(2)}%;"></i></div>
                            </div>
                        </div>
                        <div class="gf-forge-control">
                            <div class="gf-forge-control-head">
                                <span>${state.forgeTiming.active ? text('控火进行中', 'Control Live') : text('手动控火', 'Manual Control')}</span>
                                <strong id="gfForgeTimingStatus">${timingOutcome.status}</strong>
                            </div>
                            <div id="gfForgeTimingPreview" class="gf-forge-timing-preview">${getForgeTimingPreviewText(timingOutcome)}</div>
                            <button id="gfForgeTimingBar" class="gf-forge-timing-bar ${state.forgeTiming.active ? 'is-active' : ''}" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}" data-quality="${timingQualityId}">
                                <span class="gf-forge-timing-zone is-good"></span>
                                <span class="gf-forge-timing-zone is-great"></span>
                                <span class="gf-forge-timing-zone is-perfect"></span>
                                <span class="gf-forge-timing-center"></span>
                                <i id="gfForgeTimingNeedle" class="gf-forge-timing-needle" style="left:${timingNeedleLeft};"></i>
                                <b id="gfForgeTimingAimTag" class="gf-forge-timing-tag is-${timingQualityId}">${getForgeTimingBadgeLabel(timingOutcome)}</b>
                            </button>
                            <div id="gfForgeTimingHint" class="gf-forge-control-copy">${timingOutcome.hint}</div>
                            ${renderForgeTimingLadder(timingQualityId)}
                            <div class="gf-action-row gf-forge-stage-actions">
                                <button class="primary-btn" type="button" data-action="${state.forgeTiming.active ? 'stopForgeTiming' : 'startForgeTiming'}">${state.forgeTiming.active
                                    ? text('定点收炉', 'Lock Result')
                                    : (heatEnoughOne ? text('开始控火', 'Start Control') : text(`热量不足 · 还差 ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))}`, `Need ${formatCompact(Math.max(0, SMELT_HEAT_COST - state.save.heat))} heat`))}</button>
                                <button class="ghost-btn" type="button" data-action="smeltOne">${heatEnoughOne ? text('速熔 1 次', 'Quick Smelt') : text('等待热量', 'Wait Heat')}</button>
                                <button class="ghost-btn" type="button" data-action="smeltBatch">${heatEnoughBatch ? text('批量速熔 x3', 'Batch x3') : text(`批量差 ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`, `Need ${formatCompact(Math.max(0, config.forgeBalance.batchSmeltHeatCost - state.save.heat))}`)}</button>
                            </div>
                        </div>
                    </div>
                    <div class="gf-inline-grid gf-forge-quick-grid">
                        ${slotPills.map((item) => `
                            <div class="gf-inline-pill">
                                <span>${item.label}</span>
                                <strong>${item.value}</strong>
                            </div>
                        `).join('')}
                    </div>
                    <div class="gf-forge-focus-grid">
                        ${renderForgeStageChaseCard(contract, chaseView)}
                        ${renderForgeStageCollectionCard(contract, relicSummary)}
                    </div>
                </div>
            </article>
        `;
    };

    renderWorkshopTab = function renderWorkshopTabEnhancedV2() {
        const sortedWorkshop = config.workshop.slice().sort((a, b) => {
            const affordA = canUpgradeWorkshop(a.id) ? 1 : 0;
            const affordB = canUpgradeWorkshop(b.id) ? 1 : 0;
            return affordB - affordA;
        });
        const priorityTarget = getPriorityWorkshopTarget();
        const rareRate = getWorkshopEffect('rareRate');
        const heatRegen = getWorkshopEffect('heatRegen');
        const dustYield = getWorkshopEffect('dustYield');
        const catalystRefine = getWorkshopEffect('catalystRefine');
        const readyCount = sortedWorkshop.filter((item) => canUpgradeWorkshop(item.id)).length;
        const maxedCount = sortedWorkshop.filter((item) => getWorkshopLevel(item.id) >= item.maxLevel).length;
        const visibleWorkshop = sortedWorkshop.slice(0, 3);
        const hiddenCount = Math.max(0, sortedWorkshop.length - visibleWorkshop.length);

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('工坊', 'Workshop'),
                '',
                `<div class="gf-chip">${text('可升', 'Ready')} · ${readyCount}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card ${priorityTarget?.affordable ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('优先升级', 'Priority Upgrade')}</div>
                            <div class="gf-card-title">${priorityTarget ? localize(priorityTarget.item.name) : text('当前已封顶', 'Workshop Maxed')}</div>
                        </div>
                        <div class="gf-card-number">${priorityTarget ? `Lv.${getWorkshopLevel(priorityTarget.workshopId)}` : text('完成', 'Done')}</div>
                    </div>
                    ${priorityTarget ? renderKpiGrid([
                        { label: text('当前', 'Current'), value: formatWorkshopEffect(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId)) },
                        { label: text('下级', 'Next'), value: formatWorkshopEffect(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId, getWorkshopLevel(priorityTarget.workshopId) + 1)) },
                        { label: text('金币', 'Gold'), value: formatCompact(priorityTarget.cost.gold) },
                        { label: text('熔尘', 'Dust'), value: formatCompact(priorityTarget.cost.dust) }
                    ]) : renderKpiGrid([
                        { label: text('热量恢复', 'Heat Regen'), value: formatWorkshopEffect('heatRegen', heatRegen) },
                        { label: text('稀有率', 'Rare Rate'), value: formatWorkshopEffect('rareRate', rareRate) },
                        { label: text('熔尘收益', 'Dust'), value: formatWorkshopEffect('dustYield', dustYield) },
                        { label: text('催化提炼', 'Catalyst'), value: formatWorkshopEffect('catalystRefine', catalystRefine) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${priorityTarget
                            ? `<span class="gf-chip is-strong">${getWorkshopRelationCopy(priorityTarget.workshopId, getWorkshopEffect(priorityTarget.workshopId), getWorkshopEffect(priorityTarget.workshopId, getWorkshopLevel(priorityTarget.workshopId) + 1))}</span>`
                            : `<span class="gf-chip is-success">${text('5 条常驻线都已升满，先回熔炉和合同推进。', 'All 5 permanent lines are maxed. Head back to Forge and Contracts.')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${priorityTarget?.affordable ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${priorityTarget ? 'upgradeWorkshop' : 'openTab'}" data-value="${priorityTarget ? priorityTarget.workshopId : 'forge'}">${priorityTarget ? text('立即升级', 'Upgrade Now') : text('返回熔炉', 'Back to Forge')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('常驻总览', 'Permanent Snapshot')}</div>
                            <div class="gf-card-title">${text('工坊加成会立刻写入熔炉、合同和产出。', 'Workshop bonuses apply instantly to forge, contracts, and economy.')}</div>
                        </div>
                        <div class="gf-card-number">${maxedCount}/${sortedWorkshop.length}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('热量恢复', 'Heat Regen'), value: formatWorkshopEffect('heatRegen', heatRegen) },
                        { label: text('稀有率', 'Rare Rate'), value: formatWorkshopEffect('rareRate', rareRate) },
                        { label: text('熔尘收益', 'Dust'), value: formatWorkshopEffect('dustYield', dustYield) },
                        { label: text('催化提炼', 'Catalyst'), value: formatWorkshopEffect('catalystRefine', catalystRefine) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} · ${formatWorkshopEffect('heatCap', getWorkshopEffect('heatCap'))}</span>
                        <span class="gf-chip">${text('可升项目', 'Ready Up')} · ${formatCompact(readyCount)}</span>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${visibleWorkshop.map(renderWorkshopCompactRow).join('')}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 条工坊线已折叠，先处理最前面的升级。`, `${hiddenCount} more workshop lines are collapsed. Handle the top upgrades first.`)}</div>` : ''}
        `;
    };

    renderMissionsTab = function renderMissionsTabEnhancedV2() {
        const missionViews = config.missions.map(getMissionView).sort((a, b) => b.sort - a.sort);
        const claimable = missionViews.filter((item) => item.claimable);
        const pending = missionViews.filter((item) => !item.claimed && !item.claimable);
        const activeRows = [...claimable, ...pending];
        const visible = activeRows.slice(0, 3);
        const hiddenCount = Math.max(0, activeRows.length - visible.length);
        const bundleReward = mergeRewards(...claimable.map((item) => item.reward));
        const nextMission = claimable[0] || pending[0] || null;
        const nextRoute = nextMission ? getMissionRoute(nextMission.id) : { tab: 'forge', label: text('打开熔炉', 'Open Forge') };
        const claimedCount = state.save.missionClaimed.length;
        const boardProgress = config.missions.length ? Math.round((claimedCount / config.missions.length) * 100) : 100;
        const batchAction = claimable.length > 0
            ? { action: 'claimAllMissions', value: '', label: text('一键领取', 'Claim All'), cls: 'primary-btn' }
            : { action: 'openTab', value: nextRoute.tab, label: nextRoute.label, cls: 'ghost-btn' };
        const nextAction = nextMission
            ? nextMission.claimable
                ? { action: 'claimMission', value: nextMission.id, label: text('立即领取', 'Claim Now'), cls: 'primary-btn' }
                : { action: 'openTab', value: nextRoute.tab, label: nextRoute.label, cls: 'ghost-btn' }
            : { action: 'openTab', value: 'forge', label: text('回熔炉', 'Back to Forge'), cls: 'ghost-btn' };

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('任务', 'Missions'),
                '',
                `<div class="gf-chip">${text('可领', 'Ready')} · ${claimable.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('任务总览', 'Mission Board')}</div>
                            <div class="gf-card-title">${claimable.length > 0 ? text(`${claimable.length} 个奖励待领`, `${claimable.length} rewards ready`) : text('先推最近目标', 'Push the nearest goal first')}</div>
                        </div>
                        <div class="gf-card-number">${claimable.length > 0 ? claimable.length : `${boardProgress}%`}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${text('待领', 'Ready')} · ${claimable.length}</span>
                        <span class="gf-chip">${text('已领', 'Claimed')} · ${claimedCount}/${config.missions.length}</span>
                        <span class="gf-chip">${text('完成率', 'Board')} · ${boardProgress}%</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${claimable.length > 0
                            ? renderRewardChips(bundleReward, { limit: 2 })
                            : `<span class="gf-chip">${text('当前无可领，直接做最近一条。', 'Nothing is ready. Just do the nearest task.')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${batchAction.cls}" type="button" data-action="${batchAction.action}" data-value="${batchAction.value}">${batchAction.label}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('最近目标', 'Nearest Goal')}</div>
                            <div class="gf-card-title">${nextMission ? nextMission.title : text('任务板已清空', 'Mission board clear')}</div>
                        </div>
                        <div class="gf-card-number">${nextMission ? `${Math.round(nextMission.progressRate * 100)}%` : '100%'}</div>
                    </div>
                    ${nextMission ? `<div class="gf-progress gf-progress--small"><i style="width:${(nextMission.progressRate * 100).toFixed(2)}%;"></i></div>` : ''}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${nextMission ? `${nextMission.progress}/${nextMission.target}` : text('已完成', 'Done')}</span>
                        <span class="gf-chip">${nextMission ? nextRoute.label : text('回熔炉或合同继续', 'Return to Forge or Contracts')}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${nextMission ? renderRewardChips(nextMission.reward, { limit: 2 }) : `<span class="gf-chip is-success">${text('当前任务已清完', 'Board cleared')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${nextAction.cls}" type="button" data-action="${nextAction.action}" data-value="${nextAction.value}">${nextAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${visible.length ? visible.map(renderMissionCompactRow).join('') : `<div class="gf-empty">${text('当前没有可显示的任务。', 'No visible missions right now.')}</div>`}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 条任务已折叠，先处理这 3 条。`, `${hiddenCount} more missions are collapsed. Clear these 3 first.`)}</div>` : ''}
        `;
    };

    renderSeasonTab = function renderSeasonTabEnhancedV2() {
        const seasonNodes = config.seasonNodes.map((node) => getSeasonNodeView(node, false)).sort(compareNodeState);
        const sponsorNodes = config.sponsorSeasonNodes.map((node) => getSeasonNodeView(node, true)).sort(compareNodeState);
        const claimableSeason = seasonNodes.filter((node) => node.claimable);
        const claimableSponsor = sponsorNodes.filter((node) => node.claimable);
        const sponsorTier = getSponsorTier();
        const nextFree = seasonNodes.find((node) => !node.claimed && !node.claimable) || null;
        const nextSponsor = sponsorNodes.find((node) => !node.claimed && !node.claimable) || null;
        const freeRows = [...claimableSeason, ...seasonNodes.filter((node) => !node.claimed && !node.claimable)];
        const sponsorRows = [...claimableSponsor, ...sponsorNodes.filter((node) => !node.claimed && !node.claimable)];
        const visibleFree = [...claimableSeason, ...(nextFree ? [nextFree] : [])].slice(0, 2);
        const visibleSponsor = [...claimableSponsor, ...(nextSponsor ? [nextSponsor] : [])].slice(0, 2);
        const hiddenFree = Math.max(0, freeRows.length - visibleFree.length);
        const hiddenSponsor = Math.max(0, sponsorRows.length - visibleSponsor.length);
        const totalReady = claimableSeason.length + claimableSponsor.length;
        const freeAction = totalReady > 0
            ? { action: 'claimAllSeason', value: '', label: text('一键领取', 'Claim All'), cls: 'primary-btn' }
            : { action: 'openTab', value: 'forge', label: text('去熔炉拿 XP', 'Forge for XP'), cls: 'ghost-btn' };
        const sponsorAction = !state.save.payment.passUnlocked
            ? { action: 'openPayment', value: getRecommendedPaymentOfferId(), label: text('开启赞助', 'Unlock Sponsor'), cls: 'primary-btn' }
            : claimableSponsor.length > 0
                ? { action: 'claimAllSeason', value: '', label: text(`领取赞助 ${claimableSponsor.length}`, `Claim ${claimableSponsor.length}`), cls: 'primary-btn' }
                : { action: 'openPayment', value: getRecommendedPaymentOfferId(), label: text('继续充值', 'Top Up'), cls: 'ghost-btn' };

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('赛季', 'Season'),
                '',
                `<div class="gf-chip">${text('赞助档位', 'Sponsor')} · ${localize(sponsorTier.title)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('免费轨', 'Free Track')}</div>
                            <div class="gf-card-title">${claimableSeason.length > 0 ? text(`${claimableSeason.length} 个节点待领`, `${claimableSeason.length} nodes ready`) : text('先拿 XP 再回来', 'Earn XP then come back')}</div>
                        </div>
                        <div class="gf-card-number">${claimableSeason.length > 0 ? claimableSeason.length : formatCompact(state.save.seasonXp)}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">XP · ${formatCompact(state.save.seasonXp)}</span>
                        <span class="gf-chip">${text('待领', 'Ready')} · ${claimableSeason.length}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${nextFree ? nextFree.id : text('已满', 'Done')}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('还差', 'Gap')} · ${nextFree ? formatCompact(Math.max(0, nextFree.xp - state.save.seasonXp)) : '0'}</span>
                        ${nextFree ? renderRewardChips(nextFree.reward, { limit: 2 }) : `<span class="gf-chip is-success">${text('免费轨已全部完成', 'Free track completed')}</span>`}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${freeAction.cls}" type="button" data-action="${freeAction.action}" data-value="${freeAction.value}">${freeAction.label}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助轨', 'Sponsor Track')}</div>
                            <div class="gf-card-title">${state.save.payment.passUnlocked ? text(`${claimableSponsor.length} 个赞助节点待领`, `${claimableSponsor.length} sponsor nodes ready`) : text('首充后开启', 'Unlocks after first top-up')}</div>
                        </div>
                        <div class="gf-card-number">${state.save.payment.passUnlocked ? claimableSponsor.length : text('未激活', 'Locked')}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${localize(sponsorTier.title)}</span>
                        <span class="gf-chip">${text('待领', 'Ready')} · ${claimableSponsor.length}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${nextSponsor ? nextSponsor.id : text('已满', 'Done')}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} +${formatCompact(sponsorTier.heatCapBonus)}</span>
                        <span class="gf-chip">${text('稀有率', 'Rare Rate')} +${formatPercent(sponsorTier.rareRateBonus)}</span>
                        <span class="gf-chip">${text('还差 XP', 'XP Gap')} · ${nextSponsor ? formatCompact(Math.max(0, nextSponsor.xp - state.save.seasonXp)) : '0'}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${sponsorAction.cls}" type="button" data-action="${sponsorAction.action}" data-value="${sponsorAction.value}">${sponsorAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="eyebrow">${text('免费可见节点', 'Free Visible Nodes')}</div>
            <div class="gf-list gf-list--compact">
                ${visibleFree.length ? visibleFree.map((node) => renderSeasonCompactRow(node, false)).join('') : `<div class="gf-empty">${text('当前没有免费轨节点。', 'No visible free-track nodes.')}</div>`}
            </div>
            ${hiddenFree > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenFree} 个免费节点已折叠。`, `${hiddenFree} more free nodes are collapsed.`)}</div>` : ''}
            <div class="eyebrow">${text('赞助可见节点', 'Sponsor Visible Nodes')}</div>
            <div class="gf-list gf-list--compact">
                ${visibleSponsor.length ? visibleSponsor.map((node) => renderSeasonCompactRow(node, true)).join('') : `<div class="gf-empty">${text('当前没有赞助轨节点。', 'No visible sponsor-track nodes.')}</div>`}
            </div>
            ${hiddenSponsor > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenSponsor} 个赞助节点已折叠。`, `${hiddenSponsor} more sponsor nodes are collapsed.`)}</div>` : ''}
        `;
    };

    renderShopTab = function renderShopTabEnhancedV2() {
        const sponsorTier = getSponsorTier();
        const milestoneViews = config.paymentMilestones.map((milestone) => getMilestoneView(milestone));
        const claimableMilestones = milestoneViews.filter((item) => item.claimable);
        const pendingMilestones = milestoneViews.filter((item) => !item.claimed && !item.claimable);
        const readyShopItems = config.shopItems.filter((item) => isShopItemReady(item.id));
        const activePaymentCard = renderActivePaymentCard();
        const growthDiagnosisCard = renderGrowthDiagnosisCard();
        const milestoneSummary = getMilestoneSummary();
        const recommendedItemId = getRecommendedShopItemId();
        const recommendedItem = config.shopItems.find((item) => item.id === recommendedItemId);
        const recommendedOffer = config.paymentOffers.find((item) => item.id === getRecommendedPaymentOfferId()) || config.paymentOffers[0];
        const visibleMilestones = [...claimableMilestones, ...pendingMilestones.slice(0, 1)].slice(0, 2);
        const hiddenMilestones = Math.max(0, milestoneViews.filter((item) => !item.claimed).length - visibleMilestones.length);
        const visibleShopItems = getVisibleShopItems(2);
        const dailySupply = config.shopItems.find((item) => item.id === 'dailySupply');
        const dailyReady = isDailySupplyReady();
        const dailyAction = dailyReady
            ? { action: 'claimDailySupply', value: '', label: text('免费领取', 'Claim Free'), cls: 'primary-btn' }
            : { action: 'openPayment', value: recommendedOffer.id, label: text('打开礼包', 'Open Pack'), cls: 'ghost-btn' };
        const sponsorAction = milestoneSummary.claimableCount > 0
            ? { action: 'claimAllMilestones', value: '', label: text('领取里程碑', 'Claim Milestones'), cls: 'primary-btn' }
            : { action: 'openPayment', value: recommendedOffer.id, label: text('打开推荐礼包', 'Open Pack'), cls: 'primary-btn' };

        const featuredItems = [];
        const seenItems = new Set();
        const pushItem = (item) => {
            if (!item || item.id === 'dailySupply' || seenItems.has(item.id)) return;
            seenItems.add(item.id);
            featuredItems.push(item);
        };
        pushItem(recommendedItem);
        visibleShopItems.forEach(pushItem);
        const shopRows = featuredItems.slice(0, 2);
        const hiddenShopItems = Math.max(0, config.shopItems.filter((item) => item.id !== 'dailySupply').length - shopRows.length);

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('商店', 'Shop'),
                '',
                `<div class="gf-chip">${text('可拿', 'Ready')} · ${readyShopItems.length + claimableMilestones.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card gf-shop-card ${dailyReady ? 'is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('每日免费', 'Daily Free')}</div>
                            <div class="gf-card-title">${text('每日引火箱', 'Daily Spark Box')}</div>
                        </div>
                        <div class="gf-card-number">${dailyReady ? text('免费', 'Free') : formatDurationCompact(getDailySupplyRemainingMs())}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${dailySupply ? renderRewardChips(dailySupply.reward, { limit: 2 }) : ''}
                        <span class="gf-chip is-success">${text('焦点碎片', 'Focus Shards')} +4</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${dailyReady ? text('当前可直接领取。', 'Ready to claim now.') : text('20 小时刷新一次。', 'Refreshes every 20 hours.')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${dailyAction.cls}" type="button" data-action="${dailyAction.action}" data-value="${dailyAction.value}">${dailyAction.label}</button>
                    </div>
                </article>
                <article class="gf-card gf-shop-card ${milestoneSummary.claimableCount > 0 ? 'is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助与里程碑', 'Sponsor & Milestones')}</div>
                            <div class="gf-card-title">${localize(sponsorTier.title)}</div>
                        </div>
                        <div class="gf-card-number">$${Number(state.save.payment.totalSpent || 0).toFixed(2)}</div>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip is-strong">${text('待领', 'Ready')} · ${milestoneSummary.claimableCount}</span>
                        <span class="gf-chip">${text('下一档', 'Next')} · ${milestoneSummary.nextThreshold > 0 ? `$${milestoneSummary.nextThreshold.toFixed(2)}` : text('已满', 'Maxed')}</span>
                        <span class="gf-chip">${text('还差', 'Gap')} · ${milestoneSummary.nextThreshold > 0 ? `$${milestoneSummary.nextGap.toFixed(2)}` : '0'}</span>
                    </div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} +${formatCompact(sponsorTier.heatCapBonus)}</span>
                        <span class="gf-chip">${text('稀有率', 'Rare Rate')} +${formatPercent(sponsorTier.rareRateBonus)}</span>
                        <span class="gf-chip">${text('熔尘加成', 'Dust')} +${formatPercent(sponsorTier.dustYieldBonus)}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${sponsorAction.cls}" type="button" data-action="${sponsorAction.action}" data-value="${sponsorAction.value}">${sponsorAction.label}</button>
                    </div>
                </article>
            </div>
            <div class="gf-list gf-list--compact">
                ${activePaymentCard || ''}
                ${growthDiagnosisCard}
                ${visibleMilestones.map((item) => `
                    <article class="gf-compact-row ${item.claimable ? 'is-ready' : ''}">
                        <div class="gf-compact-main">
                            <div class="gf-compact-title">${text('里程碑', 'Milestone')} · $${item.threshold.toFixed(2)}</div>
                            <div class="gf-compact-sub">${item.claimable ? text('这档已可领取，先收下再决定是否继续充值。', 'This tier is ready. Claim it first, then decide whether to top up further.') : text('这一档会补资源并给永久加成，适合卡点时跨一档。', 'This tier adds resources and permanent stats, ideal when stuck.')}</div>
                            <div class="gf-chip-row">
                                ${renderRewardChips(item.reward, { limit: 2 })}
                                ${renderPermanentChips(item.permanent, { limit: 1 })}
                            </div>
                        </div>
                        <div class="gf-compact-side">
                            <strong>${item.claimed ? text('已领', 'Claimed') : item.claimable ? text('可领', 'Ready') : text('未达', 'Pending')}</strong>
                            <button class="${item.claimable ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${item.claimable ? 'claimMilestone' : 'openPayment'}" data-value="${item.claimable ? item.id : milestoneSummary.recommendedOfferId}">${item.claimable ? text('领取', 'Claim') : text('去补', 'Top Up')}</button>
                        </div>
                    </article>
                `).join('')}
                ${renderPaymentOffer(recommendedOffer)}
                ${shopRows.map(renderShopItemRow).join('')}
            </div>
            ${hiddenMilestones > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenMilestones} 档里程碑已折叠。`, `${hiddenMilestones} more milestone tiers are collapsed.`)}</div>` : ''}
            ${hiddenShopItems > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenShopItems} 个补给已折叠，先买最关键的 2 个。`, `${hiddenShopItems} more supplies are collapsed. Focus on the top 2 first.`)}</div>` : ''}
        `;
    };

    renderSigilsTab = function renderSigilsTabEnhancedV2() {
        const slotCards = SLOT_ORDER.map((slotId, index) => {
            const sigilId = state.save.selectedSigils[index];
            const sigil = sigilMap[sigilId];
            const level = sigil ? getSigilLevel(sigil.id) : 0;
            return { slotId, sigil, level, index };
        });
        const totalShards = Object.values(state.save.sigilShards).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const visibleSigils = getVisibleSigils(3);
        const hiddenCount = Math.max(0, config.sigils.length - visibleSigils.length);
        const summary = getSigilTabSummary();
        const readyCount = summary.unlockReadyCount + summary.upgradeReadyCount;
        const equippedCount = slotCards.filter((item) => item.level > 0).length;
        const priorityTarget = getPrioritySigilTarget();
        const prioritySigil = priorityTarget?.sigil || null;
        const priorityLevel = prioritySigil ? getSigilLevel(prioritySigil.id) : 0;
        const unlockCost = prioritySigil ? getSigilUnlockCost(prioritySigil.id) : { gold: 0, shards: 0 };
        const upgradeCost = prioritySigil ? getSigilUpgradeCost(prioritySigil.id) : { gold: 0, shards: 0 };
        const priorityReady = priorityTarget ? (priorityLevel <= 0 ? priorityTarget.unlockReady : priorityTarget.upgradeReady) : false;

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('符印', 'Sigils'),
                '',
                `<div class="gf-chip">${text('总碎片', 'Total Shards')} · ${formatCompact(totalShards)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('装配总览', 'Loadout Summary')}</div>
                            <div class="gf-card-title">${text('先处理可升级、可解锁和当前章节焦点。', 'Handle ready upgrades, unlocks, and current focus first.')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(getSelectedSigilPower())}</div>
                    </div>
                    ${renderKpiGrid([
                        { label: text('已装配', 'Equipped'), value: formatCompact(equippedCount) },
                        { label: text('已解锁', 'Unlocked'), value: formatCompact(summary.unlockedCount) },
                        { label: text('可升级', 'Ready Up'), value: formatCompact(summary.upgradeReadyCount) },
                        { label: text('可解锁', 'Ready Unlock'), value: formatCompact(summary.unlockReadyCount) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${summary.focusFamilies.map((familyId) => `<span class="gf-chip is-success">${localize(familyMap[familyId].name)}</span>`).join('')}
                        <span class="gf-chip">${text('可操作', 'Actions')} · ${readyCount}</span>
                    </div>
                </article>
                <article class="gf-card ${priorityReady ? 'gf-shop-card is-highlight' : ''}">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('下一目标', 'Next Target')}</div>
                            <div class="gf-card-title">${prioritySigil ? localize(prioritySigil.name) : text('先回熔炉刷焦点碎片', 'Forge for focus shards first')}</div>
                        </div>
                        <div class="gf-card-number">${prioritySigil ? formatCompact(getSigilPower(prioritySigil.id)) : '-'}</div>
                    </div>
                    ${prioritySigil ? renderKpiGrid([
                        { label: text('当前', 'Current'), value: `Lv.${priorityLevel}` },
                        { label: text('碎片', 'Shards'), value: `${formatCompact(getSigilShardCount(prioritySigil.id))}/${formatCompact(priorityLevel > 0 ? upgradeCost.shards : unlockCost.shards)}` },
                        { label: text('金币', 'Gold'), value: formatCompact(priorityLevel > 0 ? upgradeCost.gold : unlockCost.gold) },
                        { label: text('槽位', 'Slot'), value: getSlotName(prioritySigil.slot) }
                    ]) : renderKpiGrid([
                        { label: text('当前合同', 'Contract'), value: getCurrentContract().id },
                        { label: text('建议', 'Next'), value: text('回熔炉', 'Forge') },
                        { label: text('焦点家族', 'Focus'), value: getCurrentContract().focus.map((familyId) => localize(familyMap[familyId].name)).join('/') },
                        { label: text('可升符印', 'Ready Up'), value: formatCompact(summary.upgradeReadyCount) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${prioritySigil ? `<span class="gf-chip">${localize(familyMap[prioritySigil.family].name)}</span>` : ''}
                        ${prioritySigil && getCurrentContract().focus.includes(prioritySigil.family) ? `<span class="gf-chip is-success">${text('本章焦点', 'Focus')}</span>` : ''}
                        ${prioritySigil && state.save.selectedSigils.includes(prioritySigil.id) ? `<span class="gf-chip is-strong">${text('已装配', 'Equipped')}</span>` : ''}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="${priorityReady ? 'primary-btn' : 'ghost-btn'}" type="button" data-action="${prioritySigil ? (priorityLevel > 0 ? 'upgradeSigil' : 'unlockSigil') : 'openTab'}" data-value="${prioritySigil ? prioritySigil.id : 'forge'}">${prioritySigil ? (priorityLevel > 0 ? text('立即升级', 'Upgrade Now') : text('立即解锁', 'Unlock Now')) : text('返回熔炉', 'Back to Forge')}</button>
                    </div>
                </article>
            </div>
            <div class="gf-mini-slot-grid">
                ${slotCards.map(renderMiniSlotCard).join('')}
            </div>
            <div class="gf-list gf-list--compact">
                ${visibleSigils.map(renderSigilCompactRow).join('')}
            </div>
            ${hiddenCount > 0 ? `<div class="gf-empty">${text(`其余 ${hiddenCount} 个符印已折叠，先处理最关键的 3 个。`, `${hiddenCount} more sigils are collapsed. Focus on the top 3 first.`)}</div>` : ''}
        `;
    };

    function readLang() { try { return localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh'; } catch (error) { return 'zh'; } }
    function localize(value) { if (!value) return ''; if (typeof value === 'string') return value; return value[state.lang] || value.zh || value.en || ''; }
    function text(zh, en) { return state.lang === 'en' ? en : zh; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function clampNumber(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) { const numeric = Math.floor(Number(value)); if (!Number.isFinite(numeric)) return fallback; return Math.max(min, Math.min(max, numeric)); }
    function formatCompact(value) { const number = Number(value) || 0; if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`; if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(1)}K`; return `${Math.round(number * 100) / 100}`; }
    function formatPercent(value) { return `${Math.round((Number(value) || 0) * 100)}%`; }
    function showToast(message, tone = 'neutral') {
        if (!message || !ui.toast) return;
        ui.toast.textContent = message;
        ui.toast.dataset.tone = tone;
        ui.toast.classList.add('show');
        clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => {
            ui.toast.classList.remove('show');
            ui.toast.dataset.tone = 'neutral';
        }, 2200);
    }
}());
