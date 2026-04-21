(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_drone_squad_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_GAME_ID = 'drone-squad';
    const PAYMENT_ORDER_STORAGE_KEY = 'genesis_drone_squad_payment_order_v1';
    const PAYMENT_TXID_REGEX = /^[A-Fa-f0-9]{64}$/;
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_ORDER_WINDOW_MS = 15 * 60 * 1000;
    const PAYMENT_ADDRESS_FIELDS = ['payAddress', 'pay_address', 'walletAddress', 'wallet_address', 'recipientAddress', 'recipient_address', 'receiveAddress', 'receive_address', 'receivingAddress', 'receiving_address', 'toAddress', 'to_address', 'address'];
    const WING_SLOT_UNLOCK_STAGES = ['1-1', '1-2'];
    const MODULE_RARITY_SCORE = { common: 1, rare: 2.2, epic: 4.8, legend: 8.6 };
    const STARTER_MODULES = [
        { uid: 'starter-burst', id: 'burstCore', rarity: 'common', level: 1 },
        { uid: 'starter-shell', id: 'aegisShell', rarity: 'common', level: 1 }
    ];
    const BATTLE_PERKS = [
        { id: 'attack', title: { zh: '火力超频', en: 'Power Overclock' }, desc: { zh: '本局伤害 +22%', en: 'Damage +22% this sortie' } },
        { id: 'rate', title: { zh: '连发回路', en: 'Rapid Circuit' }, desc: { zh: '本局射速 +18%', en: 'Fire rate +18% this sortie' } },
        { id: 'magnet', title: { zh: '磁吸扩散', en: 'Magnet Burst' }, desc: { zh: '本局吸附半径扩大', en: 'Larger pickup radius this sortie' } },
        { id: 'pierce', title: { zh: '穿透阵列', en: 'Pierce Array' }, desc: { zh: '本局子弹额外穿透 +1', en: 'Bullets pierce +1 this sortie' } },
        { id: 'barrier', title: { zh: '屏障修复', en: 'Barrier Repair' }, desc: { zh: '回复 35% 护盾并提高上限', en: 'Restore 35% shield and raise max shield' } },
        { id: 'volley', title: { zh: '双翼齐射', en: 'Volley Sync' }, desc: { zh: '本局追加双弹道', en: 'Adds side bullets this sortie' } },
        { id: 'charge', title: { zh: '能量回馈', en: 'Charge Relay' }, desc: { zh: '本局技能充能更快', en: 'Faster skill charge this sortie' } }
    ];

    const config = window.GENESIS_DRONE_SQUAD_CONFIG;
    if (!config) return;

    const tabMap = Object.fromEntries(config.tabs.map((item) => [item.id, item]));
    const chapterMap = Object.fromEntries(config.chapters.map((item) => [item.id, item]));
    const chassisMap = Object.fromEntries(config.chassis.map((item) => [item.id, item]));
    const wingmanMap = Object.fromEntries(config.wingmen.map((item) => [item.id, item]));
    const moduleMap = Object.fromEntries(config.modules.map((item) => [item.id, item]));
    const researchMap = Object.fromEntries(config.research.map((item) => [item.id, item]));
    const shopMap = Object.fromEntries(config.shopItems.map((item) => [item.id, item]));
    const offerMap = Object.fromEntries(config.paymentOffers.map((item) => [item.id, item]));

    const state = {
        lang: readLang(),
        save: loadSave(),
        tab: 'sortie',
        toastTimer: 0,
        modal: null,
        battle: createBattleState()
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        state.tab = tabMap[state.save.tab] ? state.save.tab : 'sortie';
        cacheUi();
        bindEvents();
        const grantedDailyRevive = applyDailyReviveGrant({ silent: true });
        restoreStoredPaymentOrder();
        if (!paymentCountdownTimer) {
            paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
        }
        flushPendingPaymentClaims().catch(() => {});
        renderAll();
        if (grantedDailyRevive) {
            showToast(text(`Daily revive chip +${config.battle.reviveChipDailyGrant || 0}.`, `Daily revive chip +${config.battle.reviveChipDailyGrant || 0}.`), 'success');
        }
    }

    function cacheUi() {
        ui.heroEyebrow = document.getElementById('heroEyebrow');
        ui.heroTitle = document.getElementById('heroTitle');
        ui.heroSubtitle = document.getElementById('heroSubtitle');
        ui.resourceStrip = document.getElementById('resourceStrip');
        ui.heroSummary = document.getElementById('heroSummary');
        ui.panelContent = document.getElementById('panelContent');
        ui.tabBar = document.getElementById('tabBar');
        ui.modalRoot = document.getElementById('modalRoot');
        ui.modalEyebrow = document.getElementById('modalEyebrow');
        ui.modalTitle = document.getElementById('modalTitle');
        ui.modalSubtitle = document.getElementById('modalSubtitle');
        ui.modalBody = document.getElementById('modalBody');
        ui.modalActions = document.getElementById('modalActions');
        ui.modalCloseBtn = document.getElementById('modalCloseBtn');
        ui.paymentModal = document.getElementById('dsPaymentModal');
        ui.paymentEyebrow = document.getElementById('dsPaymentEyebrow');
        ui.paymentTitle = document.getElementById('dsPaymentTitle');
        ui.paymentDesc = document.getElementById('dsPaymentDesc');
        ui.paymentCloseBtn = document.getElementById('dsPaymentCloseBtn');
        ui.paymentOfferGrid = document.getElementById('dsPaymentOfferGrid');
        ui.paymentAmount = document.getElementById('dsPaymentAmount');
        ui.paymentMeta = document.getElementById('dsPaymentMeta');
        ui.paymentOrderLabel = document.getElementById('dsPaymentOrderLabel');
        ui.paymentOrderId = document.getElementById('dsPaymentOrderId');
        ui.paymentExactLabel = document.getElementById('dsPaymentExactLabel');
        ui.paymentExactAmount = document.getElementById('dsPaymentExactAmount');
        ui.paymentExpiryLabel = document.getElementById('dsPaymentExpiryLabel');
        ui.paymentExpiry = document.getElementById('dsPaymentExpiry');
        ui.paymentAddressLabel = document.getElementById('dsPaymentAddressLabel');
        ui.paymentWallet = document.getElementById('dsPaymentWallet');
        ui.paymentCopyAddressBtn = document.getElementById('dsPaymentCopyAddressBtn');
        ui.paymentCopyAmountBtn = document.getElementById('dsPaymentCopyAmountBtn');
        ui.paymentTxidLabel = document.getElementById('dsPaymentTxidLabel');
        ui.paymentTxidInput = document.getElementById('dsPaymentTxidInput');
        ui.paymentTxidHint = document.getElementById('dsPaymentTxidHint');
        ui.paymentStatus = document.getElementById('dsPaymentStatus');
        ui.paymentVerifyBtn = document.getElementById('dsPaymentVerifyBtn');
        ui.toast = document.getElementById('toast');
        ui.langButtons = Array.from(document.querySelectorAll('[data-lang-switch]'));
    }

    function bindEvents() {
        ui.langButtons.forEach((button) => {
            button.addEventListener('click', () => {
                state.lang = button.dataset.langSwitch === 'en' ? 'en' : 'zh';
                try { localStorage.setItem(HUB_LANG_KEY, state.lang); } catch (error) {}
                renderAll();
            });
        });

        ui.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            const nextTab = button.dataset.tab;
            if (!tabMap[nextTab]) return;
            if (state.battle.active && nextTab !== 'sortie') {
                showToast(text('当前正在出击，请先完成本局。', 'A sortie is in progress. Finish the current run first.'), 'warning');
                return;
            }
            state.tab = nextTab;
            state.save.tab = nextTab;
            saveProgress();
            renderAll();
        });

        ui.panelContent.addEventListener('click', onPanelAction);
        ui.modalCloseBtn?.addEventListener('click', closeModal);
        ui.modalRoot?.addEventListener('click', (event) => {
            if (event.target instanceof Element && event.target.closest('[data-action]')) {
                onPanelAction(event);
                return;
            }
            if (event.target === ui.modalRoot) closeModal();
        });
        ui.paymentCloseBtn?.addEventListener('click', closePaymentModal);
        ui.paymentModal?.addEventListener('click', (event) => {
            if (event.target === ui.paymentModal) closePaymentModal();
        });
        ui.paymentOfferGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-select-payment-offer]');
            if (!button) return;
            selectPaymentOffer(button.dataset.selectPaymentOffer || '');
        });
        ui.paymentCopyAddressBtn?.addEventListener('click', copyPaymentAddress);
        ui.paymentCopyAmountBtn?.addEventListener('click', copyPaymentAmount);
        ui.paymentVerifyBtn?.addEventListener('click', handlePaymentConfirm);
        ui.paymentTxidInput?.addEventListener('input', () => {
            paymentVerificationState = paymentVerificationState === 'verified' ? 'idle' : paymentVerificationState;
            paymentVerificationError = '';
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
        });

        window.addEventListener('resize', () => {
            if (state.tab === 'sortie') mountSortieCanvas();
        });

        document.addEventListener('visibilitychange', () => {
            if (!state.battle.active) return;
            if (document.hidden) {
                state.battle.pausedByVisibility = true;
                showToast(text('战斗已暂停，返回后会继续。', 'Battle paused and will continue when you return.'), 'warning');
            } else {
                state.battle.pausedByVisibility = false;
                state.battle.lastFrameAt = performance.now();
                showToast(text('战斗已继续。', 'Battle resumed.'), 'success');
            }
        });

        window.addEventListener('beforeunload', () => {
            persistCurrentPaymentOrder();
            saveProgress();
        });
    }

    function onPanelAction(event) {
        const actionNode = event.target.closest('[data-action]');
        if (!actionNode) return;

        const action = actionNode.dataset.action;
        const value = actionNode.dataset.value || '';
        const slot = actionNode.dataset.slot || '';
        const type = actionNode.dataset.type || '';

        switch (action) {
            case 'startSortie': startSortie(); break;
            case 'selectChapter': selectChapter(value); break;
            case 'castSkill': castSkill(); break;
            case 'choosePerk': chooseBattlePerk(value); break;
            case 'closeBattleResult': closeBattleResult(value); break;
            case 'openTab':
                if (tabMap[value] && !(state.battle.active && value !== 'sortie')) {
                    state.tab = value;
                    state.save.tab = value;
                    saveProgress();
                    renderAll();
                }
                break;
            case 'selectChassis': selectChassis(value); break;
            case 'upgradeUnit': upgradeUnit(type, value); break;
            case 'starUnit': starUnit(type, value); break;
            case 'equipWing': equipWing(slot, value); break;
            case 'unequipWing': unequipWing(slot); break;
            case 'upgradeResearch': upgradeResearch(value); break;
            case 'craftModule': craftModule(); break;
            case 'equipModule': equipModule(value); break;
            case 'unequipModule': unequipModule(slot); break;
            case 'upgradeModule': upgradeModule(value); break;
            case 'claimMission': claimMission(value); break;
            case 'claimSeason': claimSeasonNode('free', value); break;
            case 'claimSponsorSeason': claimSeasonNode('premium', value); break;
            case 'claimDailySupply': claimDailySupply(); break;
            case 'buyShopItem': buyShopItem(value); break;
            case 'previewOffer': previewOffer(value); break;
            case 'openPayment': openPaymentModal(value || ''); break;
            case 'closeModal': closeModal(); break;
            default: break;
        }
    }

    function renderAll() {
        document.body.setAttribute('data-drone-tab', state.tab);
        document.body.setAttribute('data-drone-lang', state.lang);
        document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
        document.title = state.lang === 'en' ? 'Drone Squad' : '\u65e0\u4eba\u673a\u7f16\u961f';
        const backToHubLink = document.getElementById('backToHubLink');
        if (backToHubLink) backToHubLink.textContent = state.lang === 'en' ? '\u2190 Back To Hub' : '\u2190 \u8fd4\u56de\u5927\u5385';
        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) langToggle.setAttribute('aria-label', text('\u8bed\u8a00\u5207\u6362', 'Language'));
        if (ui.tabBar) ui.tabBar.setAttribute('aria-label', text('\u65e0\u4eba\u673a\u7f16\u961f\u9875\u7b7e', 'Drone Squad tabs'));
        if (ui.modalCloseBtn) ui.modalCloseBtn.setAttribute('aria-label', text('\u5173\u95ed\u5f39\u7a97', 'Close modal'));
        if (ui.paymentCloseBtn) ui.paymentCloseBtn.setAttribute('aria-label', text('\u5173\u95ed\u652f\u4ed8', 'Close payment'));
        ui.langButtons.forEach((button) => {
            const isActive = button.dataset.langSwitch === state.lang;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        renderHero();
        renderResourceStrip();
        renderHeroSummary();
        renderPanel();
        renderTabBar();
        renderModal();
        renderPaymentModalChrome();
        renderPaymentOfferGrid();
        renderPaymentOrderUI();
    }

    function renderHero() {
        if (ui.heroEyebrow) ui.heroEyebrow.textContent = state.lang === 'en' ? 'GENESIS DRONE SQUAD' : '\u521b\u4e16\u65e0\u4eba\u673a\u7f16\u961f';
        if (ui.heroTitle) ui.heroTitle.textContent = localize(config.meta.title);
        if (ui.heroSubtitle) ui.heroSubtitle.textContent = localize(config.meta.subtitle);
    }

    function getTabIcon(tabId) {
        if (tabId === 'sortie') return '&#10022;';
        if (tabId === 'intel') return '&#9674;';
        if (tabId === 'hangar') return '&#9992;';
        if (tabId === 'blueprints') return '&#10070;';
        if (tabId === 'missions') return '&#9776;';
        if (tabId === 'season') return '&#10039;';
        if (tabId === 'shop') return '&#9670;';
        return '&#8226;';
    }

    function getResearchIcon(researchId) {
        if (researchId === 'weaponSync') return '&#10022;';
        if (researchId === 'shieldVolume') return '&#10010;';
        if (researchId === 'energyLoop') return '&#9889;';
        if (researchId === 'magnetField') return '&#9673;';
        if (researchId === 'bountyProtocol') return '&#9679;';
        return '&#10070;';
    }

    function renderIconLabel(icon, label, small = '') {
        return `
            <span class="ds-titleline">
                <span class="ds-title-icon" aria-hidden="true">${icon}</span>
                <span>${escapeHtml(label)}</span>
                ${small ? `<small>${escapeHtml(small)}</small>` : ''}
            </span>
        `;
    }

    function getRewardPillEntries(reward) {
        const entries = [];
        if (reward.credits) entries.push({ icon: '&#9679;', label: text('Credits', 'Credits'), value: `+${formatCompact(reward.credits)}` });
        if (reward.alloy) entries.push({ icon: '&#10010;', label: text('Alloy', 'Alloy'), value: `+${formatCompact(reward.alloy)}` });
        if (reward.coreChips) entries.push({ icon: '&#9671;', label: text('Core', 'Core'), value: `+${formatCompact(reward.coreChips)}` });
        if (reward.seasonXp) entries.push({ icon: '&#10039;', label: 'XP', value: `+${formatCompact(reward.seasonXp)}` });
        if (reward.reviveChips) entries.push({ icon: '&#10057;', label: text('Revive', 'Revive'), value: `+${formatCompact(reward.reviveChips)}` });
        if (reward.chassisShards) entries.push({ icon: '&#9992;', label: text('Chassis', 'Chassis'), value: `+${formatCompact(reward.chassisShards)}` });
        if (reward.wingmanShards) entries.push({ icon: '&#9651;', label: text('Wing', 'Wing'), value: `+${formatCompact(reward.wingmanShards)}` });
        if (reward.epicModuleCrates) entries.push({ icon: '&#9638;', label: text('Epic', 'Epic'), value: `+${formatCompact(reward.epicModuleCrates)}` });
        if (reward.legendModuleCrates) entries.push({ icon: '&#9733;', label: text('Legend', 'Legend'), value: `+${formatCompact(reward.legendModuleCrates)}` });
        return entries;
    }

    function renderRewardPills(reward, maxItems = 4) {
        const entries = getRewardPillEntries(reward).slice(0, maxItems);
        if (!entries.length) return '';
        return `
            <div class="ds-reward-row">
                ${entries.map((entry) => `
                    <div class="ds-reward-pill" title="${escapeHtml(entry.label)}">
                        <span class="ds-reward-icon" aria-hidden="true">${entry.icon}</span>
                        <strong>${escapeHtml(entry.value)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderResourceStrip() {
        if (!ui.resourceStrip) return;
        const freeLeft = getRemainingFreeSorties();
        const sponsorTier = getSponsorTier();
        const items = [
            { icon: '&#9679;', label: text('Credits', 'Credits'), value: formatCompact(state.save.credits), meta: text('Wallet', 'Wallet') },
            { icon: '&#10010;', label: text('Alloy', 'Alloy'), value: formatCompact(state.save.alloy), meta: text('Upgrade', 'Upgrade') },
            { icon: '&#9671;', label: text('Core', 'Core'), value: formatCompact(state.save.coreChips), meta: text('Research', 'Research') },
            { icon: '&#9655;', label: text('Free', 'Free'), value: `${freeLeft}/${getDailyFreeSortiesLimit()}`, meta: text('Sorties', 'Sorties') },
            { icon: '&#10057;', label: text('Revive', 'Revive'), value: formatCompact(state.save.reviveChips), meta: text('Safety', 'Safety') },
            { icon: '&#9733;', label: text('Sponsor', 'Sponsor'), value: localize(sponsorTier.title), meta: text('Tier', 'Tier') }
        ];
        ui.resourceStrip.innerHTML = items.map((item) => renderResourcePill(item.icon, item.label, item.value, item.meta)).join('');
    }

    function renderResourcePill(icon, label, value, meta = '') {
        return `
            <div class="ds-resource-pill">
                <div class="ds-pill-head">
                    <span class="ds-resource-icon" aria-hidden="true">${icon}</span>
                    <span>${escapeHtml(label)}</span>
                </div>
                <strong>${escapeHtml(String(value))}</strong>
                ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
            </div>
        `;
    }

    function renderHeroSummary() {
        if (!ui.heroSummary) return;
        const chapter = getSelectedChapter();
        const currentPower = getCurrentPower();
        const gap = Math.max(0, chapter.recommended - currentPower);
        const chapterProgress = `${Math.max(0, getHighestClearedChapterIndex() + 1)}/${config.chapters.length}`;
        const readyMissions = getClaimableMissionCount();
        const equippedModules = Object.values(state.save.selectedModules || {}).filter(Boolean).length;
        const unlockedWingSlots = WING_SLOT_UNLOCK_STAGES.filter((_, slotIndex) => isWingSlotUnlocked(slotIndex)).length;
        const selectedChassis = chassisMap[state.save.selectedChassisId] || config.chassis[0];
        const sponsorTier = getSponsorTier();
        const seasonClaims = getClaimableSeasonCount();
        const itemsByTab = {
            sortie: [
                { icon: '&#10022;', label: text('Power', 'Power'), value: currentPower, tone: gap > 0 ? 'is-warning' : 'is-good' },
                { icon: '&#9651;', label: text('Stage', 'Stage'), value: chapter.id, tone: '' },
                { icon: '&#9655;', label: text('Free', 'Free'), value: `${getRemainingFreeSorties()}/${getDailyFreeSortiesLimit()}`, tone: getRemainingFreeSorties() > 0 ? 'is-good' : '' },
                { icon: '&#9679;', label: text('Credits', 'Credits'), value: formatCompact(state.save.credits), tone: '' }
            ],
            intel: [
                { icon: '&#9651;', label: text('Stage', 'Stage'), value: chapter.id, tone: '' },
                { icon: '&#9661;', label: text('Gap', 'Gap'), value: gap > 0 ? `-${gap}` : text('Ready', 'Ready'), tone: gap > 0 ? 'is-warning' : 'is-good' },
                { icon: '&#9674;', label: text('Progress', 'Progress'), value: chapterProgress, tone: '' },
                { icon: '&#9655;', label: text('Free', 'Free'), value: `${getRemainingFreeSorties()}/${getDailyFreeSortiesLimit()}`, tone: getRemainingFreeSorties() > 0 ? 'is-good' : '' }
            ],
            hangar: [
                { icon: '&#10022;', label: text('Power', 'Power'), value: currentPower, tone: gap > 0 ? 'is-warning' : 'is-good' },
                { icon: '&#9992;', label: text('Chassis', 'Chassis'), value: `${text('Lv', 'Lv')}.${getUnitLevel(state.save.chassisLevels, selectedChassis.id)}`, tone: '' },
                { icon: '&#9651;', label: text('Wings', 'Wings'), value: `${state.save.selectedWingmen.filter(Boolean).length}/${unlockedWingSlots}`, tone: unlockedWingSlots >= 2 ? 'is-good' : '' },
                { icon: '&#9638;', label: text('Modules', 'Modules'), value: `${equippedModules}/4`, tone: equippedModules >= 4 ? 'is-good' : '' }
            ],
            blueprints: [
                { icon: '&#9671;', label: text('Core', 'Core'), value: formatCompact(state.save.coreChips), tone: '' },
                { icon: '&#10010;', label: text('Alloy', 'Alloy'), value: formatCompact(state.save.alloy), tone: '' },
                { icon: '&#9638;', label: text('Modules', 'Modules'), value: state.save.moduleInventory.length, tone: '' },
                { icon: '&#9734;', label: text('Epic Pity', 'Epic Pity'), value: `${state.save.crafting.epicPity}/${getEpicPityTarget()}`, tone: (state.save.crafting.epicPity + 3) >= getEpicPityTarget() ? 'is-warning' : '' }
            ],
            missions: [
                { icon: '&#9636;', label: text('Ready', 'Ready'), value: readyMissions, tone: readyMissions > 0 ? 'is-good' : '' },
                { icon: '&#10003;', label: text('Claimed', 'Claimed'), value: `${state.save.missionClaimed.length}/${config.missions.length}`, tone: '' },
                { icon: '&#9651;', label: text('Stage', 'Stage'), value: chapter.id, tone: '' },
                { icon: '&#10039;', label: text('Season', 'Season'), value: formatCompact(state.save.seasonXp), tone: '' }
            ],
            season: [
                { icon: '&#10039;', label: text('Season', 'Season'), value: formatCompact(state.save.seasonXp), tone: '' },
                { icon: '&#9733;', label: text('Claims', 'Claims'), value: seasonClaims, tone: seasonClaims > 0 ? 'is-good' : '' },
                { icon: '&#9734;', label: text('Sponsor', 'Sponsor'), value: localize(sponsorTier.title), tone: isSeasonPassUnlocked() ? 'is-good' : 'is-warning' },
                { icon: '&#9674;', label: text('Progress', 'Progress'), value: chapterProgress, tone: '' }
            ],
            shop: [
                { icon: '&#9679;', label: text('Credits', 'Credits'), value: formatCompact(state.save.credits), tone: '' },
                { icon: '&#9733;', label: text('Supply', 'Supply'), value: canClaimDailySupply() ? text('Ready', 'Ready') : text('Cooldown', 'Cooldown'), tone: canClaimDailySupply() ? 'is-good' : '' },
                { icon: '&#9734;', label: text('Sponsor', 'Sponsor'), value: localize(sponsorTier.title), tone: isSeasonPassUnlocked() ? 'is-good' : 'is-warning' },
                { icon: '&#9670;', label: text('Spent', 'Spent'), value: `${Number(state.save.payment.totalSpent || 0).toFixed(0)}U`, tone: Number(state.save.payment.totalSpent || 0) > 0 ? 'is-good' : '' }
            ]
        };
        const items = itemsByTab[state.tab] || itemsByTab.sortie;
        ui.heroSummary.innerHTML = `
            <div class="ds-summary-grid">
                ${items.map((item) => renderSummaryItem(item.icon, item.label, item.value, item.tone)).join('')}
            </div>
        `;
    }

    function renderSummaryItem(icon, label, value, tone = '') {
        return `
            <div class="ds-summary-item ${tone}">
                <div class="ds-summary-head">
                    <span class="ds-summary-icon" aria-hidden="true">${icon}</span>
                    <span>${escapeHtml(label)}</span>
                </div>
                <strong>${escapeHtml(String(value))}</strong>
            </div>
        `;
    }
    function renderPanel() {
        if (!ui.panelContent) return;
        switch (state.tab) {
            case 'sortie':
                ui.panelContent.innerHTML = renderSortieTab();
                mountSortieCanvas();
                break;
            case 'intel':
                ui.panelContent.innerHTML = renderIntelTab();
                break;
            case 'hangar':
                ui.panelContent.innerHTML = renderHangarTab();
                break;
            case 'blueprints':
                ui.panelContent.innerHTML = renderBlueprintsTab();
                break;
            case 'missions':
                ui.panelContent.innerHTML = renderMissionsTab();
                break;
            case 'season':
                ui.panelContent.innerHTML = renderSeasonTab();
                break;
            case 'shop':
                ui.panelContent.innerHTML = renderShopTab();
                break;
            default:
                ui.panelContent.innerHTML = renderSortieTab();
                mountSortieCanvas();
                break;
        }
    }

    function renderTabBar() {
        if (!ui.tabBar) return;
        const claimableMissionCount = getClaimableMissionCount();
        const claimableSeasonCount = getClaimableSeasonCount();
        const canClaimShop = canClaimDailySupply();
        ui.tabBar.innerHTML = config.tabs.map((tab) => {
            const isActive = state.tab === tab.id;
            let subline = '';
            if (tab.id === 'missions') subline = claimableMissionCount > 0 ? text('\u53ef\u9886', 'Ready') : text('\u76ee\u6807', 'Goals');
            if (tab.id === 'season') subline = claimableSeasonCount > 0 ? text('\u7ed3\u7b97', 'Claim') : text('\u901a\u884c', 'Pass');
            if (tab.id === 'shop') subline = canClaimShop ? text('\u514d\u8d39', 'Free') : text('\u8865\u7ed9', 'Supply');
            const hasAlert = (tab.id === 'missions' && claimableMissionCount > 0)
                || (tab.id === 'season' && claimableSeasonCount > 0)
                || (tab.id === 'shop' && canClaimShop);
            return `
                <button class="ds-tab-btn ${isActive ? 'is-active' : ''} ${hasAlert ? 'has-alert' : ''}" data-tab="${tab.id}" type="button" aria-label="${escapeHtml(localize(tab.label))}">
                    <span class="ds-tab-icon" aria-hidden="true">${getTabIcon(tab.id)}</span>
                    <strong>${escapeHtml(localize(tab.label))}</strong>
                    <span>${subline ? escapeHtml(subline) : '&nbsp;'}</span>
                </button>
            `;
        }).join('');
    }
    function renderSortieTab() {
        const chapter = getSelectedChapter();
        const chapterIndex = getChapterIndex(chapter.id);
        const chapterPower = getCurrentPower();
        const powerGap = chapter.recommended - chapterPower;

        return `
            <section class="ds-stage-card ds-stage-card--sortie">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#10022;', localize(chapter.name), localize(chapter.pressure || chapter.name))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('\u62d6\u52a8\u95ea\u907f\uff0c\u70b9\u5f00\u59cb\u540e\u7acb\u5373\u8fdb\u5165\u6218\u6597\u3002', 'Drag to dodge and jump into combat right away.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${powerGap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(text('Recommended', 'Recommended'))} ${chapter.recommended}</span>
                        <strong>${escapeHtml(String(chapterPower))}</strong>
                    </div>
                </div>

                <div class="ds-sortie-quickbar">
                    ${config.chapters.map((item, index) => renderSortieQuickChip(item, index)).join('')}
                </div>

                <div class="ds-stage-hud">
                    <div class="ds-stage-hud-card">
                        <span>${escapeHtml(text('Shield', 'Shield'))}</span>
                        <strong id="battleHudShield">${escapeHtml(text('Standby', 'Standby'))}</strong>
                    </div>
                    <div class="ds-stage-hud-card">
                        <span>${escapeHtml(text('Skill', 'Skill'))}</span>
                        <strong id="battleHudCharge">0%</strong>
                    </div>
                    <div class="ds-stage-hud-card">
                        <span>${escapeHtml(text('Status', 'Status'))}</span>
                        <strong id="battleHudStatus">${escapeHtml(text('Standby', 'Standby'))}</strong>
                    </div>
                </div>

                <div class="ds-stage-wrap">
                    <canvas class="ds-stage-canvas" id="sortieCanvas"></canvas>
                    <div class="ds-stage-center" id="sortieCenter"></div>
                </div>

                <div class="ds-action-row ds-sortie-action-row" style="margin-top: 8px;">
                    <button class="ghost-btn wide-btn" type="button" data-action="castSkill" ${state.battle.active ? '' : 'disabled'}>${escapeHtml(text('Cast Skill', 'Cast Skill'))}</button>
                    <button class="primary-btn wide-btn" type="button" data-action="startSortie" ${state.battle.active ? 'disabled' : ''}>${escapeHtml(getStartSortieButtonLabel(chapterIndex))}</button>
                </div>
            </section>
        `;
    }

    function renderIntelTab() {
        const chapter = getSelectedChapter();
        const chapterPower = getCurrentPower();
        const powerGap = chapter.recommended - chapterPower;
        const result = state.save.lastResult;
        const pressureTone = getChapterPressureTone(chapter, powerGap);

        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9674;', text('Chapter Route', 'Chapter Route'), chapter.id)}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('\u7ae0\u8282\u9009\u62e9\u3001\u5956\u52b1\u9884\u89c8\u548c\u5361\u70b9\u5224\u65ad\u90fd\u653e\u5728\u8fd9\u91cc\u3002', 'Chapter picks, reward preview, and wall checks live here.'))}</div>
                    </div>
                    <div class="ds-tag ${powerGap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(powerGap > 0 ? `${text('Gap', 'Gap')} ${powerGap}` : text('Ready', 'Ready'))}</div>
                </div>
                <div class="ds-chip-grid ds-chip-grid--route">
                    ${config.chapters.map((item, index) => renderChapterChip(item, index)).join('')}
                </div>
            </section>

            <section class="ds-grid ds-intel-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                <article class="ds-card">
                    <div class="ds-card-head">
                        <div>
                            <h3>${renderIconLabel('&#9636;', text('Stage Intel', 'Stage Intel'))}</h3>
                            <div class="ds-card-copy">${escapeHtml(text('\u628a\u538b\u529b\u3001\u5956\u52b1\u548c\u9996\u901a\u60c5\u62a5\u7edf\u4e00\u770b\u5b8c\uff0c\u518d\u56de\u51fa\u51fb\u9875\u5f00\u6253\u3002', 'Review pressure, rewards, and first-clear info here, then return to Sortie.'))}</div>
                        </div>
                        <span class="ds-mini-badge ${pressureTone}">${escapeHtml(localize(chapter.pressure || { zh: 'Current Wall', en: 'Current Wall' }))}</span>
                    </div>
                    <div class="ds-stage-guide-grid">
                        ${renderStageGuideBox('&#9888;', text('Pressure', 'Pressure'), localize(chapter.pressure || chapter.name), pressureTone)}
                        ${renderStageGuideBox('&#9638;', text('Prep', 'Prep'), localize(chapter.prep || chapter.name))}
                        ${renderStageGuideBox('&#9679;', text('Focus', 'Focus'), localize(chapter.rewardFocus || chapter.name))}
                        ${renderStageGuideBox('&#9655;', text('Free', 'Free'), `${getRemainingFreeSorties()}/${getDailyFreeSortiesLimit()}`)}
                        ${renderStageGuideBox('&#10010;', text('Extra', 'Extra'), String(getSortieCost(chapter)))}
                        ${renderStageGuideBox('&#10039;', text('Boss', 'Boss'), `${config.battle.bossSpawnSecond}s`)}
                    </div>
                    <div class="ds-inline-note ds-inline-note-rich">
                        ${renderIconLabel('&#9733;', text('First Clear Pack', 'First Clear Pack'), isChapterFirstClearPending(chapter) ? text('Pending', 'Pending') : text('Claimed', 'Claimed'))}
                        ${isChapterFirstClearPending(chapter)
                            ? renderRewardPills(getFirstClearReward(chapter), 5)
                            : `<div class="ds-note-mini">${escapeHtml(text('First clear reward already secured.', 'First clear reward already secured.'))}</div>`}
                    </div>
                </article>

                <article class="ds-card">
                    <div class="ds-card-head">
                        <h3>${renderIconLabel('&#9776;', text('Latest Report', 'Latest Report'))}</h3>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="hangar">${escapeHtml(text('Open Hangar', 'Open Hangar'))}</button>
                    </div>
                    ${result ? renderLatestResult(result) : `<div class="ds-empty-state">${escapeHtml(text('No battle report yet. Launch your first sortie.', 'No battle report yet. Launch your first sortie.'))}</div>`}
                </article>
            </section>
        `;
    }

    function renderSortieQuickChip(chapter, index) {
        const isActive = chapter.id === state.save.selectedChapterId;
        const unlocked = isChapterUnlocked(index);
        return `
            <button class="ds-chip-btn ds-sortie-chip ${isActive ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="selectChapter" data-value="${chapter.id}" ${unlocked ? '' : 'disabled'}>
                <span>${escapeHtml(chapter.id)}</span>
                <strong>${escapeHtml(localize(chapter.name))}</strong>
            </button>
        `;
    }
    function renderChapterChip(chapter, index) {
        const isActive = chapter.id === state.save.selectedChapterId;
        const unlocked = isChapterUnlocked(index);
        return `
            <button class="ds-chip-btn ${isActive ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="selectChapter" data-value="${chapter.id}" ${unlocked ? '' : 'disabled'}>
                <span>${escapeHtml(chapter.id)}</span>
                <strong>${escapeHtml(localize(chapter.name))}</strong>
                <span>${escapeHtml(unlocked ? `${text('Power', 'Power')} ${chapter.recommended}` : text('Locked', 'Locked'))}</span>
                ${unlocked ? `<small class="ds-chip-note">${escapeHtml(localize(chapter.pressure || chapter.name))}</small>` : ''}
            </button>
        `;
    }

    function renderStageGuideBox(icon, label, value, tone = '') {
        return `
            <div class="ds-stat-box ds-stage-guide-box ${tone}">
                <div class="ds-pill-head">
                    <span class="ds-guide-icon" aria-hidden="true">${icon}</span>
                    <span class="ds-stat-label">${escapeHtml(label)}</span>
                </div>
                <strong class="ds-stat-value">${escapeHtml(String(value || '--'))}</strong>
            </div>
        `;
    }
    function getChapterPressureTone(chapter, powerGap) {
        if (powerGap <= 0) return 'is-good';
        if ((chapter?.chapter || 1) >= 4 || powerGap >= 2200) return 'is-danger';
        return 'is-warning';
    }

    function renderLatestResult(result) {
        const reward = {
            credits: result.credits || 0,
            alloy: result.alloy || 0,
            coreChips: result.coreChips || 0,
            seasonXp: result.seasonXp || 0
        };
        return `
            <div class="ds-result-grid">
                ${renderResultItem('&#9674;', text('章节', 'Chapter'), result.chapterId || '--')}
                ${renderResultItem(result.win ? '&#10003;' : '&#10005;', text('结果', 'Outcome'), result.win ? text('胜利', 'Win') : text('撤离', 'Retreat'))}
                ${renderResultItem('&#9679;', text('金币', 'Credits'), `+${reward.credits}`)}
                ${renderResultItem('&#10010;', text('合金', 'Alloy'), `+${reward.alloy}`)}
                ${renderResultItem('&#9671;', text('核芯', 'Core Chips'), `+${reward.coreChips}`)}
                ${renderResultItem('&#10039;', text('赛季经验', 'Season XP'), `+${reward.seasonXp}`)}
            </div>
            ${result.firstClear ? `
                <div class="ds-inline-note ds-inline-note-rich">
                    ${renderIconLabel('&#9733;', text('首通奖励', 'First Clear Pack'))}
                    ${renderRewardPills(result.firstClear, 5)}
                </div>
            ` : ''}
        `;
    }

    function renderResultItem(icon, label, value) {
        return `
            <div class="ds-result-item">
                <div class="ds-pill-head">
                    <span class="ds-guide-icon" aria-hidden="true">${icon}</span>
                    <span class="ds-stat-label">${escapeHtml(label)}</span>
                </div>
                <strong class="ds-stat-value">${escapeHtml(String(value))}</strong>
            </div>
        `;
    }

    function renderHangarWalletStrip() {
        const items = [
            { icon: '&#9679;', label: text('\u6301\u6709', 'Wallet'), value: formatCompact(state.save.credits), meta: text('Credits', 'Credits') },
            { icon: '&#10010;', label: text('\u5408\u91d1', 'Alloy'), value: formatCompact(state.save.alloy), meta: text('Blueprints', 'Blueprints') },
            { icon: '&#9671;', label: text('\u6838\u82af', 'Core'), value: formatCompact(state.save.coreChips), meta: text('Research', 'Research') },
            { icon: '&#10057;', label: text('\u590d\u6d3b', 'Revive'), value: formatCompact(state.save.reviveChips), meta: text('Safety', 'Safety') }
        ];
        return `
            <div class="ds-resource-strip ds-resource-strip--inline">
                ${items.map((item) => renderResourcePill(item.icon, item.label, item.value, item.meta)).join('')}
            </div>
        `;
    }

    function renderHangarTab() {
        const selectedChassis = chassisMap[state.save.selectedChassisId] || config.chassis[0];
        const selectedModules = getEquippedModules();
        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9992;', text('Hangar Overview', 'Hangar Overview'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('主机定底盘，僚机补短板，模组定玩法。', 'Chassis sets base, wingmen patch gaps, modules define the run.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag is-good">${escapeHtml(text('Power', 'Power'))}</span>
                        <strong>${escapeHtml(String(getCurrentPower()))}</strong>
                    </div>
                </div>
                <div class="ds-roster-slots">
                    ${renderSlotCard('&#9992;', text('Chassis', 'Chassis'), localize(selectedChassis.name), `${text('Lv', 'Lv')}.${getUnitLevel(state.save.chassisLevels, selectedChassis.id)} 路 ${getStarsText(getUnitStar(state.save.chassisStars, selectedChassis.id))}`)}
                    ${renderWingSlotCard(0)}
                    ${renderWingSlotCard(1)}
                </div>
                ${renderHangarWalletStrip()}
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9881;', text('Chassis Fleet', 'Chassis Fleet'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('先养一台主机，再补双僚机。', 'Raise one chassis first, then fill both wingmen.'))}</div>
                    </div>
                </div>
                <div class="ds-unit-grid">
                    ${config.chassis.map(renderChassisCard).join('')}
                </div>
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9651;', text('Wingman Bay', 'Wingman Bay'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('同一僚机不能同时上双翼。', 'The same wingman cannot fill both slots.'))}</div>
                    </div>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="blueprints">${escapeHtml(text('Open Blueprints', 'Open Blueprints'))}</button>
                </div>
                <div class="ds-unit-grid">
                    ${config.wingmen.map(renderWingmanCard).join('')}
                </div>
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', text('Equipped Modules', 'Equipped Modules'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('卡关时回蓝图补研究和模组。', 'Hit a wall? Return to Blueprints for research and modules.'))}</div>
                    </div>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="blueprints">${escapeHtml(text('Manage Modules', 'Manage Modules'))}</button>
                </div>
                <div class="ds-module-grid">
                    ${['core', 'weapon', 'shield', 'boss'].map((slot) => renderEquippedModuleCard(slot, selectedModules[slot])).join('')}
                </div>
            </section>
        `;
    }

    function renderSlotCard(icon, label, name, subline) {
        return `
            <div class="ds-slot-card">
                <div class="ds-slot-title">
                    <span class="ds-title-icon" aria-hidden="true">${icon}</span>
                    <span class="ds-mini-label">${escapeHtml(label)}</span>
                </div>
                <strong>${escapeHtml(name)}</strong>
                <div class="ds-note-mini">${escapeHtml(subline)}</div>
            </div>
        `;
    }

    function renderWingSlotCard(slotIndex) {
        const unlocked = isWingSlotUnlocked(slotIndex);
        const wingId = state.save.selectedWingmen[slotIndex] || '';
        const wing = wingmanMap[wingId];
        const title = slotIndex === 0 ? text('Left Wing', 'Left Wing') : text('Right Wing', 'Right Wing');
        const icon = slotIndex === 0 ? '&#9651;' : '&#9633;';
        if (!unlocked) {
            return `
                <div class="ds-slot-card is-locked">
                    <div class="ds-slot-title">
                        <span class="ds-title-icon" aria-hidden="true">${icon}</span>
                        <span class="ds-mini-label">${escapeHtml(title)}</span>
                    </div>
                    <strong>${escapeHtml(text('Locked', 'Locked'))}</strong>
                    <div class="ds-panel-copy">${escapeHtml(text(`Unlocks after clearing ${WING_SLOT_UNLOCK_STAGES[slotIndex]}`, `Unlocks after clearing ${WING_SLOT_UNLOCK_STAGES[slotIndex]}`))}</div>
                </div>
            `;
        }
        return renderSlotCard(icon, title, wing ? localize(wing.name) : text('Empty Slot', 'Empty Slot'), wing ? `${text('Lv', 'Lv')}.${getUnitLevel(state.save.wingmanLevels, wing.id)} 路 ${getStarsText(getUnitStar(state.save.wingmanStars, wing.id))}` : text('Equip any unlocked wingman', 'Equip any unlocked wingman'));
    }
    function renderChassisCard(chassis) {
        const unlocked = isChapterClearedOrReached(chassis.unlockStage);
        const selected = state.save.selectedChassisId === chassis.id;
        const level = getUnitLevel(state.save.chassisLevels, chassis.id);
        const stars = getUnitStar(state.save.chassisStars, chassis.id);
        const upgradeCost = getUnitUpgradeCost('chassis', chassis.id, level);
        const starCost = getStarUpgradeCost(stars);
        const shardCount = getShardCount(chassis.id);
        return `
            <article class="ds-unit-card ${selected ? 'is-selected' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${escapeHtml(localize(chassis.name))}</h3>
                        <div class="ds-card-copy">${escapeHtml(localize(chassis.role))}</div>
                    </div>
                    <div class="ds-tag ${unlocked ? 'is-good' : 'is-warning'}">${escapeHtml(unlocked ? text('已解锁', 'Unlocked') : chassis.unlockStage)}</div>
                </div>
                <div class="ds-unit-kpis ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('等级', 'Level'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(level))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('星级', 'Stars'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getStarsText(stars))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('碎片', 'Shards'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(shardCount))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('定位', 'Role'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(text('主机', 'Chassis'))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('\u6301\u6709', 'Wallet'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatCompact(state.save.credits))}</strong>
                    </div>
                </div>
                <div class="ds-row-actions">
                    <button class="ghost-btn" type="button" data-action="selectChassis" data-value="${chassis.id}" ${unlocked ? '' : 'disabled'}>${escapeHtml(selected ? text('已装备', 'Equipped') : text('装配', 'Equip'))}</button>
                    <button class="ghost-btn" type="button" data-action="upgradeUnit" data-type="chassis" data-value="${chassis.id}" ${unlocked && state.save.credits >= upgradeCost ? '' : 'disabled'}>${escapeHtml(`${text('升级', 'Upgrade')} · ${upgradeCost}`)}</button>
                    <button class="ghost-btn" type="button" data-action="starUnit" data-type="chassis" data-value="${chassis.id}" ${canStarUnit(chassis.id, stars) ? '' : 'disabled'}>${escapeHtml(starCost ? `${text('升星', 'Star Up')} · ${starCost.shards}` : text('满星', 'Max'))}</button>
                </div>
            </article>
        `;
    }

    function renderWingmanCard(wingman) {
        const unlocked = isChapterClearedOrReached(wingman.unlockStage);
        const level = getUnitLevel(state.save.wingmanLevels, wingman.id);
        const stars = getUnitStar(state.save.wingmanStars, wingman.id);
        const upgradeCost = getUnitUpgradeCost('wingman', wingman.id, level);
        const starCost = getStarUpgradeCost(stars);
        const shardCount = getShardCount(wingman.id);
        const inLeft = state.save.selectedWingmen[0] === wingman.id;
        const inRight = state.save.selectedWingmen[1] === wingman.id;
        return `
            <article class="ds-unit-card ${(inLeft || inRight) ? 'is-selected' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${escapeHtml(localize(wingman.name))}</h3>
                        <div class="ds-card-copy">${escapeHtml(localize(wingman.role))}</div>
                    </div>
                    <div class="ds-tag ${unlocked ? 'is-good' : 'is-warning'}">${escapeHtml(unlocked ? text('已解锁', 'Unlocked') : wingman.unlockStage)}</div>
                </div>
                <div class="ds-unit-kpis ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('等级', 'Level'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(level))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('星级', 'Stars'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getStarsText(stars))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('碎片', 'Shards'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(shardCount))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('槽位', 'Slot'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(inLeft ? text('左翼', 'Left') : inRight ? text('右翼', 'Right') : text('未装配', 'Idle'))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('\u6301\u6709', 'Wallet'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatCompact(state.save.credits))}</strong>
                    </div>
                </div>
                <div class="ds-row-actions">
                    <button class="ghost-btn" type="button" data-action="equipWing" data-slot="0" data-value="${wingman.id}" ${canEquipWing(0, wingman.id) ? '' : 'disabled'}>${escapeHtml(inLeft ? text('左翼中', 'Left Ready') : text('装左翼', 'Equip Left'))}</button>
                    <button class="ghost-btn" type="button" data-action="equipWing" data-slot="1" data-value="${wingman.id}" ${canEquipWing(1, wingman.id) ? '' : 'disabled'}>${escapeHtml(inRight ? text('右翼中', 'Right Ready') : text('装右翼', 'Equip Right'))}</button>
                    <button class="ghost-btn" type="button" data-action="upgradeUnit" data-type="wingman" data-value="${wingman.id}" ${unlocked && state.save.credits >= upgradeCost ? '' : 'disabled'}>${escapeHtml(`${text('升级', 'Upgrade')} · ${upgradeCost}`)}</button>
                    <button class="ghost-btn" type="button" data-action="starUnit" data-type="wingman" data-value="${wingman.id}" ${canStarUnit(wingman.id, stars) ? '' : 'disabled'}>${escapeHtml(starCost ? `${text('升星', 'Star Up')} · ${starCost.shards}` : text('满星', 'Max'))}</button>
                </div>
            </article>
        `;
    }

    function renderEquippedModuleCard(slot, module) {
        const slotLabel = getModuleSlotLabel(slot);
        if (!module) {
            return `
                <article class="ds-module-card">
                    <div class="ds-card-head">
                        <div>
                            <h3>${escapeHtml(slotLabel)}</h3>
                            <div class="ds-card-copy">${escapeHtml(text('当前空置，去蓝图装配。', 'Empty now. Equip in Blueprints.'))}</div>
                        </div>
                        <span class="ds-tag">${escapeHtml(text('空', 'Empty'))}</span>
                    </div>
                </article>
            `;
        }
        const definition = moduleMap[module.id];
        return `
            <article class="ds-module-card is-equipped">
                <div class="ds-card-head">
                    <div>
                        <h3>${escapeHtml(localize(definition.name))}</h3>
                        <div class="ds-card-copy">${escapeHtml(localize(definition.effect))}</div>
                    </div>
                    <span class="ds-tag">${escapeHtml(localizeRarity(module.rarity))}</span>
                </div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('槽位', 'Slot'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(slotLabel)}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('等级', 'Level'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(module.level || 1))}</strong>
                    </div>
                </div>
            </article>
        `;
    }

    function renderBlueprintsTab() {
        const blueprintWallet = `${formatCompact(state.save.credits)} / ${formatCompact(state.save.coreChips)} / ${formatCompact(state.save.alloy)}`;
        return `
            ${renderBlueprintPlanCard()}

            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10070;', text('Permanent Blueprints', 'Permanent Blueprints'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('研究是永久成长，会持续消耗金币、芯片、合金；优先补当前卡点。', 'Research is permanent growth and steadily drains credits, chips, and alloy; prioritize the current wall.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag">${escapeHtml(text('币 / 芯 / 合', 'Cr / Chip / Alloy'))}</span>
                        <strong>${escapeHtml(blueprintWallet)}</strong>
                    </div>
                </div>
                ${renderBlueprintResourceTips()}
                <div class="ds-unit-grid">
                    ${config.research.map(renderResearchCard).join('')}
                </div>
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', text('Module Crafting', 'Module Crafting'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('每日一次免费，之后消耗金币与合金。', 'One free craft daily, then spend credits and alloy.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${canUseFreeCraft() ? 'is-good' : ''}">${escapeHtml(canUseFreeCraft() ? text('Free Ready', 'Free Ready') : text('Used', 'Used'))}</span>
                        <strong>${escapeHtml(String(state.save.moduleInventory.length))}</strong>
                    </div>
                </div>
                <div class="ds-stat-grid" style="margin-bottom: 10px;">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Rare Pity', 'Rare Pity'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(`${state.save.crafting.rarePity}/${config.moduleCrafting.rarePity}`)}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Epic Pity', 'Epic Pity'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(`${state.save.crafting.epicPity}/${getEpicPityTarget()}`)}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Paid Today', 'Paid Today'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(state.save.crafting.craftsToday || 0))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Current Cost', 'Current Cost'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getCraftCostLabel())}</strong>
                    </div>
                </div>
                <div class="ds-action-row ds-craft-actions">
                    <button class="primary-btn wide-btn" type="button" data-action="craftModule" ${canCraftModule() ? '' : 'disabled'}>${escapeHtml(text('Craft Now', 'Craft Now'))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="openTab" data-value="hangar">${escapeHtml(text('Back To Hangar', 'Back To Hangar'))}</button>
                </div>
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Module Inventory', 'Module Inventory'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('先补满四个槽位，再追高稀有度。', 'Fill the four slots first, then chase rarer drops.'))}</div>
                    </div>
                </div>
                ${state.save.moduleInventory.length
                    ? `<div class="ds-module-grid ds-list-scroll">${state.save.moduleInventory.map(renderModuleInventoryCard).join('')}</div>`
                    : `<div class="ds-empty-state">${escapeHtml(text('No modules yet. Start with your free craft.', 'No modules yet. Start with your free craft.'))}</div>`
                }
            </section>
        `;
    }

    function renderResearchCard(research) {
        const level = getResearchLevel(research.id);
        const maxed = level >= research.maxLevel;
        const cost = getResearchCost(research.id);
        const affordable = canUpgradeResearch(research.id);
        return `
            <article class="ds-unit-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel(getResearchIcon(research.id), localize(research.name), `${text('Lv', 'Lv')}.${level}/${research.maxLevel}`)}</h3>
                        <div class="ds-card-copy">${escapeHtml(localize(research.desc))}</div>
                    </div>
                    <span class="ds-tag">${escapeHtml(maxed ? text('Max', 'Max') : formatResearchCost(cost, true))}</span>
                </div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Current', 'Current'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getResearchEffectText(research.id, level))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Next Cost', 'Next Cost'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(maxed ? text('Maxed', 'Maxed') : formatResearchCost(cost))}</strong>
                    </div>
                </div>
                <div class="ds-inline-note">${escapeHtml(getResearchRoleText(research.id))}</div>
                <div class="ds-row-actions">
                    <button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${research.id}" ${affordable ? '' : 'disabled'}>${escapeHtml(maxed ? text('Maxed', 'Maxed') : `${text('Upgrade', 'Upgrade')} · ${formatResearchCost(cost, true)}`)}</button>
                </div>
            </article>
        `;
    }

    function renderBlueprintResourceTips() {
        const tips = [
            {
                icon: '&#9671;',
                title: text('芯片来源', 'Chip Sources'),
                body: text('Boss 关首通、任务、赛季、芯片中继都能拿到。', 'Boss first clears, missions, season rewards, and Chip Relay all grant chips.')
            },
            {
                icon: '&#10010;',
                title: text('合金来源', 'Alloy Sources'),
                body: text('关卡结算、首通奖励、任务、赛季、每日补给都会产出。', 'Stage clears, first-clear rewards, missions, season, and daily supply all feed alloy.')
            },
            {
                icon: '&#9679;',
                title: text('金币去向', 'Credit Sinks'),
                body: text('研究、升星、模块制造都会长期吃金币，后期卡点先补关键研究。', 'Research, star-ups, and module crafting all consume credits long-term; break walls by funding key research first.')
            }
        ];
        return `
            <div class="ds-blueprint-tip-grid">
                ${tips.map((tip) => `
                    <div class="ds-blueprint-tip">
                        <div class="ds-blueprint-tip-head">
                            <span class="ds-blueprint-tip-icon" aria-hidden="true">${tip.icon}</span>
                            <strong>${escapeHtml(tip.title)}</strong>
                        </div>
                        <div class="ds-note-mini">${escapeHtml(tip.body)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function getChapterBuildPlan(chapter) {
        const plans = {
            '1-1': { primaryResearch: 'weaponSync', primaryTarget: 1, secondaryResearch: 'shieldVolume', secondaryTarget: 1, wingmanId: 'interceptorWing', moduleId: 'burstCore', note: text('1-1 先练走位，主机升 1-2 级即可过。', '1-1: learn dodge rhythm; 1-2 chassis levels are enough.') },
            '1-2': { primaryResearch: 'weaponSync', primaryTarget: 2, secondaryResearch: 'magnetField', secondaryTarget: 1, wingmanId: 'interceptorWing', moduleId: 'burstCore', note: text('1-2 补基础伤害，优先武器同步。', '1-2: add base damage and prioritize Weapon Sync.') },
            '1-3': { primaryResearch: 'weaponSync', primaryTarget: 3, secondaryResearch: 'energyLoop', secondaryTarget: 1, wingmanId: 'pierceWing', moduleId: 'pierceArray', note: text('1-3 补穿透与爆发，再进第 2 章。', '1-3: add pierce and burst before Chapter 2.') },
            '2-1': { primaryResearch: 'bountyProtocol', primaryTarget: 2, secondaryResearch: 'shieldVolume', secondaryTarget: 2, wingmanId: 'magnetWing', moduleId: 'aegisShell', note: text('2-1 先补合金收入，保证后续养成。', '2-1: fix alloy income for later growth.') },
            '2-2': { primaryResearch: 'shieldVolume', primaryTarget: 3, secondaryResearch: 'energyLoop', secondaryTarget: 2, wingmanId: 'aegisWing', moduleId: 'aegisShell', note: text('2-2 是生存墙，优先护盾与星级。', '2-2: survival wall, prioritize shield and stars.') },
            '2-3': { primaryResearch: 'weaponSync', primaryTarget: 4, secondaryResearch: 'bountyProtocol', secondaryTarget: 3, wingmanId: 'pierceWing', moduleId: 'pierceArray', note: text('2-3 开始追稀有武器模组。', '2-3: start chasing rare weapon modules.') },
            '3-1': { primaryResearch: 'energyLoop', primaryTarget: 3, secondaryResearch: 'weaponSync', secondaryTarget: 5, wingmanId: 'pierceWing', moduleId: 'hunterNode', note: text('3-1 是 Boss 墙，补爆发和 Boss 增伤。', '3-1: boss wall, add burst and boss damage.') },
            '3-2': { primaryResearch: 'shieldVolume', primaryTarget: 5, secondaryResearch: 'bountyProtocol', secondaryTarget: 4, wingmanId: 'aegisWing', moduleId: 'aegisShell', note: text('3-2 是续航墙，护盾和收益一起拉。', '3-2: sustain wall, lift shield and income together.') },
            '3-3': { primaryResearch: 'weaponSync', primaryTarget: 6, secondaryResearch: 'shieldVolume', secondaryTarget: 6, wingmanId: 'interceptorWing', moduleId: 'hunterNode', note: text('3-3 爆发与生存并重，史诗模组起效。', '3-3: balance burst and survival; epic modules matter.') },
            '4-1': { primaryResearch: 'shieldVolume', primaryTarget: 7, secondaryResearch: 'energyLoop', secondaryTarget: 4, wingmanId: 'aegisWing', moduleId: 'aegisShell', note: text('4-1 是后期生存关，优先星级与护盾。', '4-1: late survival check, prioritize stars and shield.') },
            '4-2': { primaryResearch: 'weaponSync', primaryTarget: 8, secondaryResearch: 'magnetField', secondaryTarget: 4, wingmanId: 'pierceWing', moduleId: 'pierceArray', note: text('4-2 精英密集，穿透和收取都要补。', '4-2: elites are dense, add pierce and pickup support.') },
            '4-3': { primaryResearch: 'weaponSync', primaryTarget: 9, secondaryResearch: 'shieldVolume', secondaryTarget: 8, wingmanId: 'pierceWing', moduleId: 'hunterNode', note: text('4-3 是终局 Boss 墙，高星主机和 Boss 模组最关键。', '4-3: endgame boss wall, high-star chassis and boss modules are key.') }
        };
        return plans[chapter?.id] || plans['1-1'];
    }

    function renderBlueprintPlanCard() {
        const chapter = getSelectedChapter();
        const plan = getChapterBuildPlan(chapter);
        const power = getCurrentPower();
        const gap = Math.max(0, chapter.recommended - power);
        const primaryResearch = researchMap[plan.primaryResearch] || config.research[0];
        const secondaryResearch = researchMap[plan.secondaryResearch] || config.research[1] || primaryResearch;
        const wing = wingmanMap[plan.wingmanId];
        const module = moduleMap[plan.moduleId];
        const firstClearReward = getFirstClearReward(chapter);

        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9674;', text('Growth Route', 'Growth Route'), chapter.id)}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('Research feeds directly back into sortie damage, shield, skill charge, and farming.', 'Research feeds directly back into sortie damage, shield, skill charge, and farming.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${gap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(text('Current Wall', 'Current Wall'))}</span>
                        <strong>${escapeHtml(gap > 0 ? `-${gap}` : text('Ready', 'Ready'))}</strong>
                    </div>
                </div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Pressure', 'Pressure'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(localize(chapter.pressure || chapter.name))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Primary', 'Primary'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(`${localize(primaryResearch.name)} ${getResearchLevel(primaryResearch.id)}/${plan.primaryTarget}`)}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Backup', 'Backup'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(`${localize(secondaryResearch.name)} ${getResearchLevel(secondaryResearch.id)}/${plan.secondaryTarget}`)}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Wing', 'Wing'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(wing ? localize(wing.name) : '--')}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Module', 'Module'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(module ? localize(module.name) : '--')}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Power', 'Power'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(`${power}/${chapter.recommended}`)}</strong>
                    </div>
                </div>
                <div class="ds-inline-note">${escapeHtml(plan.note)}</div>
                <div class="ds-inline-note ds-inline-note-rich">
                    ${renderIconLabel('&#9733;', text('First Clear Pack', 'First Clear Pack'))}
                    ${renderRewardPills(firstClearReward, 5)}
                </div>
            </section>
        `;
    }
    function isChapterFirstClearPending(chapter) {
        return !!chapter && !state.save.clearedChapters.includes(chapter.id);
    }
    function isBossChapterStage(chapter) {
        const stageNumber = Math.max(1, Number(String(chapter?.id || '').split('-')[1]) || 1);
        return stageNumber === 3;
    }

    function applySponsorBossChipBonus(baseChips, chapter) {
        const chips = Math.max(0, Math.round(Number(baseChips) || 0));
        if (!chips || !isBossChapterStage(chapter)) return chips;
        const bonusRate = Number(getSponsorTier().bossChipBonus || 0);
        if (bonusRate <= 0) return chips;
        return chips + Math.max(1, Math.round(chips * bonusRate));
    }

    function getFirstClearReward(chapter) {
        if (!chapter) return {};
        const stageNumber = Math.max(1, Number(String(chapter.id || '').split('-')[1]) || 1);
        const chapterNumber = Math.max(1, Number(chapter.chapter) || 1);
        const reward = {
            credits: Math.round((chapter.reward.credits * 0.72) + (chapterNumber * 110) + (stageNumber * 60)),
            alloy: Math.max(6, Math.round((chapter.reward.alloy * 0.78) + (chapterNumber * 3) + stageNumber)),
            seasonXp: Math.round((chapter.reward.seasonXp * 0.85) + (chapterNumber * 8))
        };

        if (chapterNumber >= 2) {
            reward.coreChips = Math.max(1, Math.round((chapter.reward.coreChips || 0) + ((chapterNumber - 1) * 0.8) + (stageNumber === 3 ? 1 : 0)));
        } else if (stageNumber === 3) {
            reward.coreChips = 1;
        }

        if (stageNumber === 3 && chapterNumber >= 2) {
            reward.reviveChips = Math.max(1, chapterNumber - 1);
        }

        if (chapterNumber >= 4 && stageNumber === 3) {
            reward.epicModuleCrates = 1;
        }

        if (reward.coreChips) {
            reward.coreChips = applySponsorBossChipBonus(reward.coreChips, chapter);
        }

        return reward;
    }

    function renderModuleInventoryCard(module) {
        const definition = moduleMap[module.id];
        const slot = definition.slot;
        const equipped = state.save.selectedModules[slot] === module.uid;
        const cost = getModuleUpgradeCost(module);
        return `
            <article class="ds-module-card ${equipped ? 'is-equipped' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${escapeHtml(localize(definition.name))}</h3>
                        <div class="ds-card-copy">${escapeHtml(localize(definition.effect))}</div>
                    </div>
                    <span class="ds-tag">${escapeHtml(localizeRarity(module.rarity))}</span>
                </div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('槽位', 'Slot'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getModuleSlotLabel(slot))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('等级', 'Level'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(String(module.level || 1))}</strong>
                    </div>
                </div>
                <div class="ds-row-actions">
                    <button class="ghost-btn" type="button" data-action="equipModule" data-value="${module.uid}">${escapeHtml(equipped ? text('已装备', 'Equipped') : text('装配', 'Equip'))}</button>
                    <button class="ghost-btn" type="button" data-action="upgradeModule" data-value="${module.uid}" ${canUpgradeModule(module) ? '' : 'disabled'}>${escapeHtml(`${text('升级', 'Upgrade')} · ${cost.credits}`)}</button>
                    ${equipped ? `<button class="ghost-btn" type="button" data-action="unequipModule" data-slot="${slot}">${escapeHtml(text('卸下', 'Unequip'))}</button>` : ''}
                </div>
            </article>
        `;
    }

    function renderMissionsTab() {
        const missions = config.missions
            .map((mission, index) => {
                const progress = getMissionProgress(mission.id);
                const claimed = state.save.missionClaimed.includes(mission.id);
                const ready = !claimed && progress >= mission.target;
                const ratio = mission.target > 0 ? Math.min(1, progress / mission.target) : 0;
                return { mission, index, progress, claimed, ready, ratio };
            })
            .sort((left, right) => {
                const leftRank = left.ready ? 0 : left.claimed ? 2 : 1;
                const rightRank = right.ready ? 0 : right.claimed ? 2 : 1;
                if (leftRank !== rightRank) return leftRank - rightRank;
                if (leftRank === 1 && left.ratio !== right.ratio) return right.ratio - left.ratio;
                if (left.progress !== right.progress) return right.progress - left.progress;
                return left.index - right.index;
            })
            .map(({ mission, progress, claimed, ready }) => {
                const icon = claimed ? '&#10003;' : ready ? '&#9733;' : '&#9679;';
                const progressText = `${progress}/${mission.target}`;
                const buttonLabel = claimed ? text('Claimed', 'Claimed') : text('Claim Reward', 'Claim Reward');
                return `
                    <article class="ds-mission-card ${ready ? 'is-ready' : ''} ${claimed ? 'is-claimed' : ''}">
                        <div class="ds-card-head">
                            <div>
                                <h3>${renderIconLabel(icon, localize(mission.title), progressText)}</h3>
                                <div class="ds-card-copy">${escapeHtml(getMissionHint(mission.id))}</div>
                            </div>
                            <span class="ds-tag ${ready ? 'is-good' : ''}">${escapeHtml(claimed ? text('Claimed', 'Claimed') : ready ? text('Ready', 'Ready') : progressText)}</span>
                        </div>
                        <div class="ds-progress">
                            <div class="ds-progress-fill" style="width:${Math.min(100, (progress / mission.target) * 100)}%"></div>
                        </div>
                        ${renderRewardPills(mission.reward, 5)}
                        <div class="ds-row-actions">
                            <button class="primary-btn ds-claim-btn" type="button" data-action="claimMission" data-value="${mission.id}" ${ready ? '' : 'disabled'}>${ready ? '<span class="ds-btn-alert-dot" aria-hidden="true"></span>' : ''}${escapeHtml(buttonLabel)}</button>
                        </div>
                    </article>
                `;
            });

        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Protocol Missions', 'Protocol Missions'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('Only claimable, near-finished, and long-term goals stay here.', 'Only claimable, near-finished, and long-term goals stay here.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${getClaimableMissionCount() ? 'is-good' : ''}">${escapeHtml(text('Ready', 'Ready'))}</span>
                        <strong>${escapeHtml(String(getClaimableMissionCount()))}</strong>
                    </div>
                </div>
                <div class="ds-mission-grid">${missions.join('')}</div>
            </section>
        `;
    }
    function renderSeasonTab() {
        const freeTrack = config.seasonFreeTrack.map((node) => renderSeasonNode('free', node)).join('');
        const premiumTrack = config.seasonPremiumTrack.map((node) => renderSeasonNode('premium', node)).join('');
        const passUnlocked = isSeasonPassUnlocked();
        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10039;', text('Season Route', 'Season Route'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('Sorties, elite kills, and boss clears all charge your season route.', 'Sorties, elite kills, and boss clears all charge your season route.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${getClaimableSeasonCount() ? 'is-good' : ''}">${escapeHtml(text('Season XP', 'Season XP'))}</span>
                        <strong>${escapeHtml(String(state.save.seasonXp))}</strong>
                    </div>
                </div>
                <div class="ds-grid ds-season-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                    <article class="ds-list-card">
                        <div class="ds-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9733;', text('Free Track', 'Free Track'))}</h3>
                                <div class="ds-card-copy">${escapeHtml(text('Available to every player.', 'Available to every player.'))}</div>
                            </div>
                        </div>
                        <div class="ds-track-grid ds-list-scroll">${freeTrack}</div>
                    </article>
                    <article class="ds-list-card">
                        <div class="ds-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9734;', text('Sponsor Track', 'Sponsor Track'))}</h3>
                                <div class="ds-card-copy">${escapeHtml(passUnlocked ? text('Unlocked and ready for premium reward claims.', 'Unlocked and ready for premium reward claims.') : text('Your first top-up unlocks the sponsor track and extra rewards.', 'Your first top-up unlocks the sponsor track and extra rewards.'))}</div>
                            </div>
                            <span class="ds-tag ${passUnlocked ? 'is-good' : 'is-warning'}">${escapeHtml(passUnlocked ? text('Unlocked', 'Unlocked') : text('First Top-Up', 'First Top-Up'))}</span>
                        </div>
                        <div class="ds-track-grid ds-list-scroll">${premiumTrack}</div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderSeasonNode(trackType, node) {
        const ready = state.save.seasonXp >= node.xp;
        const claimed = state.save.seasonClaimed.includes(`${trackType}:${node.id}`);
        const lockedByPass = trackType === 'premium' && !isSeasonPassUnlocked();
        const trackIcon = trackType === 'premium' ? '&#9734;' : '&#9733;';
        return `
            <article class="ds-track-card ${ready && !claimed && !lockedByPass ? 'is-ready' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel(trackIcon, `${trackType === 'premium' ? text('Sponsor', 'Sponsor') : text('Free', 'Free')} 路 ${node.id.toUpperCase()}`)}</h3>
                    </div>
                    <span class="ds-tag ${claimed ? 'is-good' : ready ? 'is-warning' : ''}">${escapeHtml(claimed ? text('Claimed', 'Claimed') : `${node.xp} XP`)}</span>
                </div>
                ${renderRewardPills(node.reward, 5)}
                <div class="ds-row-actions">
                    <button class="primary-btn" type="button" data-action="${lockedByPass ? 'openPayment' : trackType === 'premium' ? 'claimSponsorSeason' : 'claimSeason'}" data-value="${lockedByPass ? getRecommendedOfferId() : node.id}" ${ready && !claimed && !lockedByPass ? '' : lockedByPass ? '' : 'disabled'}>${escapeHtml(lockedByPass ? text('Unlock Sponsor', 'Unlock Sponsor') : claimed ? text('Claimed', 'Claimed') : text('Claim', 'Claim'))}</button>
                </div>
            </article>
        `;
    }

    function renderShopTab() {
        const softItems = config.shopItems.filter((item) => item.price > 0).map(renderShopItemCard).join('');
        const premiumItems = config.paymentOffers.map(renderOfferCard).join('');
        return `
            ${renderSponsorOverviewCard()}

            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Supply Hub', 'Supply Hub'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('Free supply, soft-currency items, and premium packs all live here.', 'Free supply, soft-currency items, and premium packs all live here.'))}</div>
                    </div>
                </div>
                <div class="ds-offer-grid ds-shop-offer-grid ds-shop-offer-grid--soft">
                    ${renderDailySupplyCard()}
                    ${softItems}
                </div>
            </section>

            <section class="ds-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', text('Sponsor Packs', 'Sponsor Packs'))}</h3>
                        <div class="ds-card-copy">${escapeHtml(text('Packs use verified on-chain orders and grant resources plus permanent boosts right away.', 'Packs use verified on-chain orders and grant resources plus permanent boosts right away.'))}</div>
                    </div>
                </div>
                <div class="ds-offer-grid ds-shop-offer-grid ds-shop-offer-grid--premium">${premiumItems}</div>
            </section>
        `;
    }

    function renderSponsorOverviewCard() {
        const sponsorTier = getSponsorTier();
        const recommendedOffer = offerMap[getRecommendedOfferId()] || config.paymentOffers[0];
        const totalCreditYield = Number(sponsorTier.creditYieldBonus || 0) + getPermanentBonusValue('creditYield');
        const totalAlloyYield = Number(sponsorTier.alloyYieldBonus || 0) + getPermanentBonusValue('alloyYield');
        return `
            <section class="ds-card">
                <div class="ds-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9734;', text('Sponsor Status', 'Sponsor Status'))}</h3>
                        <div class="ds-panel-copy">${escapeHtml(text('This panel shows your lasting top-up impact: tier, season access, daily sorties, and permanent bonuses.', 'This panel shows your lasting top-up impact: tier, season access, daily sorties, and permanent bonuses.'))}</div>
                    </div>
                    <div class="ds-head-kpi">
                        <span class="ds-tag ${isSeasonPassUnlocked() ? 'is-good' : 'is-warning'}">${escapeHtml(localize(sponsorTier.title))}</span>
                        <strong>${escapeHtml(`${Number(state.save.payment.totalSpent || 0).toFixed(2)} USDT`)}</strong>
                    </div>
                </div>
                <div class="ds-stat-grid" style="margin-bottom: 10px;">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Attack', 'Attack'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatPercent(getPermanentBonusValue('attackBoost')))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Shield', 'Shield'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatPercent(getPermanentBonusValue('shieldBoost')))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Boss Dmg', 'Boss Dmg'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatPercent(getPermanentBonusValue('bossDamage')))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Credit Yield', 'Credit Yield'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatPercent(totalCreditYield))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('Alloy Yield', 'Alloy Yield'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(formatPercent(totalAlloyYield))}</strong>
                    </div>
                </div>
                <div class="ds-inline-note">${escapeHtml(text(`当前赞助档额外提供 ${Number(sponsorTier.dailyFreeSorties || 0)} 次免费出击、${formatPercent(sponsorTier.bossChipBonus || 0)} Boss 核芯加成、${formatPercent(sponsorTier.epicPityBonus || 0)} 史诗保底缩短。`, `Current tier adds ${Number(sponsorTier.dailyFreeSorties || 0)} free sorties, ${formatPercent(sponsorTier.bossChipBonus || 0)} boss core bonus, and ${formatPercent(sponsorTier.epicPityBonus || 0)} shorter epic pity.`))}</div>
                <div class="ds-row-actions ds-sponsor-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${escapeHtml(recommendedOffer.id)}">${escapeHtml(text('Open Recommended Pack', 'Open Recommended Pack'))}</button>
                    <button class="ghost-btn" type="button" data-action="openTab" data-value="season">${escapeHtml(text('Open Season', 'Open Season'))}</button>
                </div>
            </section>
        `;
    }

    function renderDailySupplyCard() {
        const ready = canClaimDailySupply();
        return `
            <article class="ds-offer-card ${ready ? 'is-recommended' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Daily Free Supply', 'Daily Free Supply'))}</h3>
                    </div>
                    <span class="ds-tag ${ready ? 'is-good' : ''}">${escapeHtml(ready ? text('Ready', 'Ready') : getDailySupplyCooldownText())}</span>
                </div>
                ${renderRewardPills(shopMap.dailySupply.reward, 5)}
                <div class="ds-row-actions">
                    <button class="primary-btn" type="button" data-action="claimDailySupply" ${ready ? '' : 'disabled'}>${escapeHtml(text('Claim Supply', 'Claim Supply'))}</button>
                </div>
            </article>
        `;
    }

    function renderShopItemCard(item) {
        return `
            <article class="ds-offer-card">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', localize(item.title))}</h3>
                    </div>
                    <strong class="ds-offer-price">${escapeHtml(String(item.price))}</strong>
                </div>
                ${renderRewardPills(item.reward, 5)}
                <div class="ds-row-actions">
                    <button class="ghost-btn" type="button" data-action="buyShopItem" data-value="${item.id}" ${state.save.credits >= item.price ? '' : 'disabled'}>${escapeHtml(text('Buy Now', 'Buy Now'))}</button>
                </div>
            </article>
        `;
    }

    function renderOfferCard(offer) {
        const recommended = getRecommendedOfferId() === offer.id;
        return `
            <article class="ds-offer-card is-premium ${recommended ? 'is-recommended' : ''}">
                <div class="ds-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', localize(offer.name), recommended ? text('Recommended', 'Recommended') : '')}</h3>
                    </div>
                    <strong class="ds-offer-price">${escapeHtml(`${offer.price} USDT`)}</strong>
                </div>
                ${renderRewardPills(offer.reward, 5)}
                <div class="ds-inline-note">${escapeHtml(getOfferImpactText(offer))}</div>
                <div class="ds-row-actions">
                    <button class="primary-btn" type="button" data-action="openPayment" data-value="${offer.id}">${escapeHtml(text('Open Payment', 'Open Payment'))}</button>
                </div>
            </article>
        `;
    }
    function renderModal() {
        if (!ui.modalRoot || !ui.modalBody || !ui.modalActions) return;
        if (!state.modal) {
            ui.modalRoot.classList.add('is-hidden');
            const paymentVisible = !!ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden');
            if (!paymentVisible) {
                document.body.classList.remove('modal-open');
            }
            return;
        }

        ui.modalRoot.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
        ui.modalEyebrow.textContent = state.modal.eyebrow || text('\u4fe1\u606f', 'INFO');
        ui.modalTitle.textContent = state.modal.title || '';
        ui.modalSubtitle.textContent = state.modal.subtitle || '';
        ui.modalBody.innerHTML = state.modal.body || '';
        ui.modalActions.innerHTML = (state.modal.actions || [
            { label: text('知道了', 'Got it'), action: 'closeModal', tone: 'primary' }
        ]).map((item) => `
            <button class="${item.tone === 'ghost' ? 'ghost-btn' : 'primary-btn'}" type="button" data-action="${item.action}" ${item.value ? `data-value="${item.value}"` : ''}>${escapeHtml(item.label)}</button>
        `).join('');
    }

    function closeModal() {
        state.modal = null;
        renderModal();
    }

    function renderPaymentModalChrome() {
        if (!ui.paymentTitle) return;
        const offer = getSelectedPaymentOffer();
        ui.paymentEyebrow.textContent = text('链上支付', 'Verified Top-Up');
        ui.paymentTitle.textContent = text('无人机编队充值中心', 'Drone Squad Top-Up Center');
        ui.paymentDesc.textContent = isSeasonPassUnlocked()
            ? text('当前账号已开启赞助轨。继续充值可提升赞助档位、增加每日免费出击并强化永久增幅。', 'Sponsor access is already unlocked. Continue topping up to raise sponsor tier, add free sorties, and strengthen permanent boosts.')
            : text('首充可开启赞助赛季轨道。创建链上订单后，在 OKX 钱包支付精确金额，再粘贴交易哈希（TXID）校验发奖。', 'Your first top-up unlocks the sponsor season track. Create the on-chain order, pay the exact amount in OKX Wallet, then paste the txid to verify and grant rewards.');
        if (ui.paymentMeta) ui.paymentMeta.textContent = text('TRON (TRC20) · OKX 钱包', 'TRON (TRC20) · OKX Wallet');
        if (ui.paymentOrderLabel) ui.paymentOrderLabel.textContent = text('订单', 'Order');
        if (ui.paymentExactLabel) ui.paymentExactLabel.textContent = text('精确金额', 'Exact Amount');
        if (ui.paymentExpiryLabel) ui.paymentExpiryLabel.textContent = text('剩余时间', 'Time Left');
        if (ui.paymentAddressLabel) ui.paymentAddressLabel.textContent = text('收款地址', 'Recipient Address');
        if (ui.paymentCopyAddressBtn) ui.paymentCopyAddressBtn.textContent = text('复制地址', 'Copy Address');
        if (ui.paymentCopyAmountBtn) ui.paymentCopyAmountBtn.textContent = text('复制金额', 'Copy Exact Amount');
        if (ui.paymentTxidLabel) ui.paymentTxidLabel.textContent = text('粘贴 OKX 钱包交易哈希（TXID）', 'Paste OKX Wallet txid');
        if (ui.paymentTxidInput) ui.paymentTxidInput.placeholder = text('粘贴 64 位链上交易哈希（TXID）', 'Paste the 64-character on-chain txid');
        if (ui.paymentTxidHint) ui.paymentTxidHint.textContent = text('只有收款地址、精确金额、订单有效期都匹配的支付，才会通过校验并发奖。', 'Only payments that match the recipient address, exact amount, and valid order window can pass verification.');
        if (ui.paymentVerifyBtn) ui.paymentVerifyBtn.textContent = text(`校验 ${localize(offer.name)}`, `Verify ${localize(offer.name)}`);
    }

    function getSelectedPaymentOffer() {
        return config.paymentOffers.find((offer) => offer.id === selectedPaymentOfferId) || config.paymentOffers[0];
    }

    function hasPaymentOffer(offerId) {
        return config.paymentOffers.some((offer) => offer.id === offerId);
    }

    function doesPaymentOrderMatchOffer(order, offer = getSelectedPaymentOffer()) {
        if (!order || !offer) return false;
        if (String(order.offerId || '') !== String(offer.id || '')) return false;
        const expectedBaseAmount = Number(offer.price || 0);
        if (!(expectedBaseAmount > 0)) return true;
        const orderBaseAmount = Number(order.baseAmount || 0);
        if (orderBaseAmount > 0) {
            return Math.abs(orderBaseAmount - expectedBaseAmount) < 0.0001;
        }
        const exactAmount = Number(order.exactAmount || 0);
        return exactAmount >= expectedBaseAmount && exactAmount < (expectedBaseAmount + 0.01);
    }

    function getActivePaymentOrderForSelectedOffer() {
        const offer = getSelectedPaymentOffer();
        return doesPaymentOrderMatchOffer(currentPaymentOrder, offer) ? currentPaymentOrder : null;
    }

    function getPaymentMinerId() {
        if (state.save.payment.minerId) return state.save.payment.minerId;
        state.save.payment.minerId = `DRONESQD_${Math.random().toString(16).slice(2, 10).toUpperCase()}${Date.now().toString(16).slice(-6).toUpperCase()}`;
        saveProgress();
        return state.save.payment.minerId;
    }

    function resolvePaymentAddress(order = null, { allowLastKnown = true } = {}) {
        const source = order && typeof order === 'object' ? order : null;
        if (source) {
            for (const field of PAYMENT_ADDRESS_FIELDS) {
                const value = String(source[field] ?? '').trim();
                if (value && value !== '--') return value;
            }
        }
        if (allowLastKnown) {
            const lastKnown = String(state.save.payment.lastPayAddress || '').trim();
            if (lastKnown && lastKnown !== '--') return lastKnown;
        }
        return '';
    }

    function mapPaymentApiError(errorMessage) {
        const raw = String(errorMessage || '').trim();
        const lower = raw.toLowerCase();
        if (!raw) return text('支付校验失败，请稍后重试。', 'Payment verification failed. Please try again.');
        if (lower.includes('txid not found')) return text('这笔交易哈希（TXID）暂时还没在 TRON 主网上查到，请稍后再试。', 'This txid was not found on TRON mainnet yet.');
        if (lower.includes('not confirmed yet')) return text('这笔交易还未确认，请稍后再试。', 'This transfer is not confirmed yet. Try again shortly.');
        if (lower.includes('execution failed')) return text('链上交易执行失败，无法发放奖励。', 'The on-chain transaction failed, so rewards cannot be granted.');
        if (lower.includes('not a trc20 contract transfer')) return text('这不是 TRC20 合约转账。', 'This transaction is not a TRC20 transfer.');
        if (lower.includes('not trc20 usdt')) return text('这笔支付不是 TRC20-USDT。', 'This transaction is not a TRC20-USDT payment.');
        if (lower.includes('recipient address')) return text('收款地址不匹配，请按当前订单展示的地址支付。', 'Recipient address mismatch. Please pay to the address shown in the current order.');
        if (lower.includes('amount mismatch')) return text('支付金额与当前订单的精确金额不一致。', 'The payment amount does not match the current exact order amount.');
        if (lower.includes('before this order was created')) return text('这笔转账早于订单创建时间，不能用于当前订单。', 'This transfer happened before the order was created and cannot be used.');
        if (lower.includes('after the order expired') || lower.includes('order expired')) return text('当前订单已过期，请重新创建订单后再支付。', 'This order has expired. Please create a new order before paying again.');
        if (lower.includes('already been used by another order') || lower.includes('another txid')) return text('这笔交易哈希（TXID）已被其他订单使用。', 'This txid has already been used by another order.');
        if (lower.includes('minerid does not match order')) return text('当前订单与本地账号不匹配，请重新创建订单。', 'This order does not belong to the current player. Please create a new order.');
        if (lower.includes('order not found') || lower.includes('invalid offerid') || lower.includes('minerid is required')) return text('订单创建失败，请重新选择礼包。', 'Failed to create the payment order. Please select the pack again.');
        if (lower.includes('supabase') || lower.includes('tron api failed') || lower.includes('missing environment variable') || lower.includes('failed')) return text('支付服务暂时不可用，请稍后再试。', 'The payment service is temporarily unavailable. Please try again later.');
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
            gameId: String(order?.gameId || order?.game_id || PAYMENT_GAME_ID),
            minerId: String(order?.minerId || order?.miner_id || getPaymentMinerId()),
            createdAt: typeof createdAtRaw === 'number' ? createdAtRaw : (Date.parse(createdAtRaw || '') || Date.now()),
            expiresAt: typeof expiresAtRaw === 'number' ? expiresAtRaw : (Date.parse(expiresAtRaw || '') || (Date.now() + PAYMENT_ORDER_WINDOW_MS)),
            baseAmount: Number(order?.baseAmount ?? order?.base_amount ?? 0),
            exactAmount: Number(order?.exactAmount ?? order?.exact_amount ?? order?.baseAmount ?? order?.base_amount ?? 0),
            payAddress: resolvePaymentAddress(order),
            network: String(order?.network || 'TRON (TRC20)'),
            status: String(order?.status || 'pending'),
            txid: String(order?.txid || ''),
            paidAt: String(order?.paidAt || order?.paid_at || ''),
            rewardGranted: !!(order?.rewardGranted ?? order?.reward_granted)
        };
    }

    function persistCurrentPaymentOrder() {
        try {
            const order = currentPaymentOrder;
            const shouldPersist = !!order
                && !!order.id
                && order.id !== '--'
                && !state.save.payment.claimedOrders?.[order.id]
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
        const resolvedAddress = currentPaymentOrder ? resolvePaymentAddress(currentPaymentOrder, { allowLastKnown: false }) : '';
        if (resolvedAddress && state.save.payment.lastPayAddress !== resolvedAddress) {
            state.save.payment.lastPayAddress = resolvedAddress;
            saveProgress();
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

    function getPaymentOrderCountdown(order = currentPaymentOrder) {
        if (!order) return '--:--';
        return formatCountdown(Math.max(0, Number(order.expiresAt || 0) - Date.now()));
    }

    async function createBackendPaymentOrder(offerId) {
        const payload = await requestPaymentApi('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minerId: getPaymentMinerId(), offerId, gameId: PAYMENT_GAME_ID })
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

    function renderPaymentOfferGrid() {
        if (!ui.paymentOfferGrid) return;
        ui.paymentOfferGrid.innerHTML = config.paymentOffers.map((offer) => `
            <button class="ds-payment-offer ${offer.id === selectedPaymentOfferId ? 'is-active' : ''}" type="button" data-select-payment-offer="${offer.id}">
                <span class="pill ds-payment-offer-badge">${escapeHtml(offer.id === getRecommendedOfferId() ? text('推荐礼包', 'Recommended') : text('链上礼包', 'On-Chain Pack'))}</span>
                <div class="ds-payment-offer-price">${escapeHtml(`${offer.price} USDT`)}</div>
                <h3>${escapeHtml(localize(offer.name))}</h3>
                <p>${escapeHtml(getOfferImpactText(offer))}</p>
                <div class="ds-inline-note">${escapeHtml(getRewardText(offer.reward))}</div>
            </button>
        `).join('');
    }

    function renderPaymentOrderUI() {
        if (!ui.paymentAmount || !ui.paymentOrderId || !ui.paymentExactAmount || !ui.paymentExpiry || !ui.paymentWallet) return;
        renderPaymentModalChrome();
        const offer = getSelectedPaymentOffer();
        const order = doesPaymentOrderMatchOffer(currentPaymentOrder, offer) ? currentPaymentOrder : null;
        ui.paymentAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : `${offer.price} USDT`;
        ui.paymentOrderId.textContent = order?.id || '--';
        ui.paymentExactAmount.textContent = order ? formatPaymentUsdt(order.exactAmount) : '--';
        ui.paymentExpiry.textContent = order ? getPaymentOrderCountdown(order) : '--:--';
        ui.paymentWallet.textContent = resolvePaymentAddress(order) || '--';
    }

    function getNormalizedPaymentTxid() {
        return String(ui.paymentTxidInput?.value || '').trim().toLowerCase();
    }

    function refreshPaymentVerificationState() {
        if (!ui.paymentStatus || !ui.paymentVerifyBtn || !ui.paymentCopyAddressBtn || !ui.paymentCopyAmountBtn) return;
        const txid = getNormalizedPaymentTxid();
        const txidValid = PAYMENT_TXID_REGEX.test(txid);
        const activeOrder = getActivePaymentOrderForSelectedOffer();
        const hasOrder = !!activeOrder;
        const orderExpired = isPaymentOrderExpired(activeOrder);
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
                ? text('当前订单倒计时已结束；如果你已在有效期内完成支付，仍可继续用该交易哈希（TXID）校验。', 'The order window has ended, but you can still verify this txid if the payment was completed before expiry.')
                : text('当前订单已过期；未支付请重新创建订单，已支付可继续粘贴交易哈希（TXID）校验。', 'The order window has ended. Create a new order if you did not pay, or paste the txid if you already paid in time.');
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
            ui.paymentStatus.textContent = text('交易哈希（TXID）格式不正确，请粘贴 64 位链上交易哈希。', 'TXID format looks invalid. Please paste the 64-character on-chain txid.');
            ui.paymentStatus.classList.add('is-error');
            ui.paymentVerifyBtn.disabled = true;
            return;
        }

        ui.paymentStatus.textContent = paymentVerificationNotice || text('先创建订单，再去 OKX 钱包完成支付，最后把交易哈希（TXID）粘贴到这里校验。', 'Create an order, complete the payment in OKX Wallet, then paste the txid here.');
        ui.paymentVerifyBtn.disabled = !txidValid || !hasOrder;
    }

    function resetPaymentVerificationState(clearInput = false) {
        paymentVerificationState = 'idle';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        if (clearInput && ui.paymentTxidInput) ui.paymentTxidInput.value = '';
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

    async function syncCurrentPaymentOrderStatus({ silent = true } = {}) {
        if (!currentPaymentOrder?.id || currentPaymentOrder.id === '--') return null;
        try {
            const payload = await checkBackendPaymentOrder(currentPaymentOrder.id);
            const syncedOrder = buildClientPaymentOrder(payload?.order || currentPaymentOrder);
            if (syncedOrder.minerId && syncedOrder.minerId !== getPaymentMinerId()) {
                setCurrentPaymentOrder(null);
                if (!silent) {
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = text('检测到缓存订单归属不一致，已自动清除。', 'The cached order belongs to a different player and was cleared.');
                    refreshPaymentVerificationState();
                }
                return null;
            }
            if (syncedOrder.status === 'expired' || syncedOrder.status === 'cancelled') {
                setCurrentPaymentOrder(null);
                if (!silent) {
                    paymentVerificationState = 'idle';
                    paymentVerificationNotice = '';
                    paymentVerificationError = text('当前订单已失效，请重新创建订单。', 'This order is no longer valid. Please create a new one.');
                    renderPaymentOrderUI();
                    refreshPaymentVerificationState();
                }
                return null;
            }
            setCurrentPaymentOrder(syncedOrder);
            renderPaymentOrderUI();
            refreshPaymentVerificationState();
            return syncedOrder;
        } catch (error) {
            if (!silent) {
                paymentVerificationState = 'idle';
                paymentVerificationNotice = '';
                paymentVerificationError = error?.message || text('订单同步失败，请稍后重试。', 'Order sync failed. Please try again later.');
                refreshPaymentVerificationState();
            }
            return null;
        }
    }

    async function syncPaymentOrderForSelectedOffer(force = false, clearInput = false) {
        const offer = getSelectedPaymentOffer();
        if (!force && doesPaymentOrderMatchOffer(currentPaymentOrder, offer) && !isPaymentOrderExpired(currentPaymentOrder)) {
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
        if (currentPaymentOrder && currentPaymentOrder.offerId === offer.id && !doesPaymentOrderMatchOffer(currentPaymentOrder, offer)) {
            setCurrentPaymentOrder(null);
        }
        renderPaymentOfferGrid();
        renderPaymentOrderUI();
        if (refreshOrder && ui.paymentModal && !ui.paymentModal.classList.contains('is-hidden')) {
            resetPaymentVerificationState(true);
            syncPaymentOrderForSelectedOffer(true, true).catch(() => {});
        }
    }

    async function openPaymentModal(offerId = '') {
        if (!ui.paymentModal) return;
        closeModal();
        const previousSelectedOfferId = selectedPaymentOfferId;
        if (!currentPaymentOrder) restoreStoredPaymentOrder();
        if (offerId && hasPaymentOffer(offerId)) {
            selectedPaymentOfferId = offerId;
        } else if (hasPaymentOffer(previousSelectedOfferId)) {
            selectedPaymentOfferId = previousSelectedOfferId;
        } else if (currentPaymentOrder?.offerId && hasPaymentOffer(currentPaymentOrder.offerId)) {
            selectedPaymentOfferId = currentPaymentOrder.offerId;
        } else if (!hasPaymentOffer(selectedPaymentOfferId)) {
            selectedPaymentOfferId = getRecommendedOfferId();
        }

        if (currentPaymentOrder && currentPaymentOrder.offerId === getSelectedPaymentOffer().id && !doesPaymentOrderMatchOffer(currentPaymentOrder, getSelectedPaymentOffer())) {
            setCurrentPaymentOrder(null);
        }

        renderPaymentOfferGrid();
        resetPaymentVerificationState(true);
        renderPaymentOrderUI();
        ui.paymentModal.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
        flushPendingPaymentClaims().catch(() => {});

        try {
            if (currentPaymentOrder) {
                await syncCurrentPaymentOrderStatus({ silent: true });
            }
            if (!doesPaymentOrderMatchOffer(currentPaymentOrder, getSelectedPaymentOffer()) || isPaymentOrderExpired(currentPaymentOrder)) {
                await syncPaymentOrderForSelectedOffer(true, true);
            }
        } catch (error) {}

        refreshPaymentVerificationState();
    }

    function closePaymentModal() {
        if (!ui.paymentModal) return;
        ui.paymentModal.classList.add('is-hidden');
        const infoVisible = !!ui.modalRoot && !ui.modalRoot.classList.contains('is-hidden');
        if (!infoVisible) {
            document.body.classList.remove('modal-open');
        }
    }

    async function copyTextToClipboard(value) {
        const textValue = String(value || '').trim();
        if (!textValue) return false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textValue);
                return true;
            }
        } catch (error) {}

        const textarea = document.createElement('textarea');
        textarea.value = textValue;
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

    async function copyPaymentAddress() {
        const address = String(ui.paymentWallet?.textContent || '').trim();
        const copied = await copyTextToClipboard(address);
        paymentVerificationError = '';
        paymentVerificationNotice = copied ? text('收款地址已复制。', 'Receiving address copied.') : text('自动复制不可用，请手动复制地址。', 'Automatic copy is unavailable. Please copy the address manually.');
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    async function copyPaymentAmount() {
        let order = getActivePaymentOrderForSelectedOffer();
        if (order && isPaymentOrderExpired(order)) {
            order = null;
        }
        if (!order) {
            try {
                order = await syncPaymentOrderForSelectedOffer(true, false);
            } catch (error) {
                return;
            }
        }
        const copied = await copyTextToClipboard(Number(order.exactAmount || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS));
        paymentVerificationError = '';
        paymentVerificationNotice = copied ? text('精确金额已复制。', 'Exact amount copied.') : text('自动复制不可用，请手动复制精确金额。', 'Automatic copy is unavailable. Please copy the exact amount manually.');
        paymentVerificationState = 'idle';
        refreshPaymentVerificationState();
    }

    function mountSortieCanvas() {
        const canvas = document.getElementById('sortieCanvas');
        if (!canvas) return;

        ui.sortieCanvas = canvas;
        ui.sortieCenter = document.getElementById('sortieCenter');
        ui.battleHudShield = document.getElementById('battleHudShield');
        ui.battleHudCharge = document.getElementById('battleHudCharge');
        ui.battleHudStatus = document.getElementById('battleHudStatus');

        if (!canvas.dataset.bound) {
            canvas.dataset.bound = 'true';
            canvas.addEventListener('pointerdown', handleStagePointerDown);
            canvas.addEventListener('pointermove', handleStagePointerMove);
            canvas.addEventListener('pointerup', handleStagePointerUp);
            canvas.addEventListener('pointerleave', handleStagePointerUp);
            canvas.addEventListener('pointercancel', handleStagePointerUp);
        }

        if (ui.sortieCenter && !ui.sortieCenter.dataset.bound) {
            ui.sortieCenter.dataset.bound = 'true';
            ui.sortieCenter.addEventListener('pointerup', (event) => {
                const actionNode = event.target instanceof Element ? event.target.closest('[data-action]') : null;
                if (!actionNode) return;
                event.preventDefault();
                event.stopPropagation();
                onPanelAction(event);
            });
        }

        resizeBattleCanvas();
        updateBattleHud();
        renderStageCenter();

        if (state.battle.active) {
            state.battle.lastFrameAt = performance.now();
            if (!state.battle.rafId) startBattleLoop();
        } else {
            drawBattleCanvas();
        }
    }

    function handleStagePointerDown(event) {
        if (!state.battle.active || state.battle.pendingPerks.length || state.battle.result) return;
        state.battle.pointerActive = true;
        syncPointerToBattle(event);
        try { ui.sortieCanvas.setPointerCapture(event.pointerId); } catch (error) {}
    }

    function handleStagePointerMove(event) {
        if (!state.battle.active || !state.battle.pointerActive || state.battle.pendingPerks.length || state.battle.result) return;
        syncPointerToBattle(event);
    }

    function handleStagePointerUp(event) {
        if (!state.battle.active) return;
        state.battle.pointerActive = false;
        try { ui.sortieCanvas.releasePointerCapture(event.pointerId); } catch (error) {}
    }

    function syncPointerToBattle(event) {
        const rect = ui.sortieCanvas.getBoundingClientRect();
        state.battle.pointerX = clampNumber(event.clientX - rect.left, rect.width / 2, 20, rect.width - 20);
        state.battle.pointerY = clampNumber(event.clientY - rect.top, rect.height - 48, 40, rect.height - 22);
    }

    function resizeBattleCanvas() {
        if (!ui.sortieCanvas) return;
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(280, Math.round(ui.sortieCanvas.clientWidth));
        const height = Math.max(280, Math.round(ui.sortieCanvas.clientHeight));
        ui.sortieCanvas.width = Math.round(width * ratio);
        ui.sortieCanvas.height = Math.round(height * ratio);
        const context = ui.sortieCanvas.getContext('2d');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        state.battle.viewportWidth = width;
        state.battle.viewportHeight = height;
        if (state.battle.player) {
            state.battle.player.x = clampNumber(state.battle.player.x, width / 2, 18, width - 18);
            state.battle.player.y = clampNumber(state.battle.player.y, height - 56, 46, height - 24);
        }
        drawBattleCanvas();
    }

    function startSortie() {
        if (state.battle.active) return;
        const chapter = getSelectedChapter();
        if (!consumeSortieCost(chapter)) return;

        const stats = getBattleStats();
        state.save.stats.sorties += 1;
        saveProgress();

        state.battle = createBattleState();
        state.battle.active = true;
        state.battle.chapterId = chapter.id;
        state.battle.chapter = chapter;
        state.battle.stats = stats;
        state.battle.player = {
            x: state.battle.viewportWidth ? state.battle.viewportWidth / 2 : 160,
            y: state.battle.viewportHeight ? state.battle.viewportHeight - 56 : 300,
            radius: 14,
            attack: stats.attack,
            fireRate: stats.fireRate,
            maxShield: stats.maxShield,
            shield: stats.maxShield,
            speed: stats.speed,
            magnet: stats.magnet,
            chargeRate: stats.chargeRate,
            critChance: stats.critChance,
            critDamage: stats.critDamage,
            pierce: stats.pierce,
            bossDamageMultiplier: stats.bossDamageMultiplier,
            wingDamage: stats.wingDamage,
            regen: stats.regen
        };
        state.battle.pointerX = state.battle.player.x;
        state.battle.pointerY = state.battle.player.y;
        state.battle.nextSpawnAt = 0.5;
        state.battle.notice = {
            text: text('\\u51fa\\u51fb\\u5f00\\u59cb', 'Sortie Started'),
            tone: 'accent',
            until: 1.8
        };

        renderAll();
        pushBattleNotice(text('\\u9996\\u6ce2\\u654c\\u4eba\\u63a5\\u8fd1\\u4e2d', 'First wave approaching'), 'accent');
        startBattleLoop();
    }

    function startBattleLoop() {
        if (!state.battle.active) return;
        if (state.battle.rafId) cancelAnimationFrame(state.battle.rafId);
        state.battle.lastFrameAt = performance.now();
        state.battle.rafId = requestAnimationFrame(tickBattle);
    }

    function stopBattleLoop() {
        if (state.battle.rafId) {
            cancelAnimationFrame(state.battle.rafId);
            state.battle.rafId = 0;
        }
    }

    function tickBattle(now) {
        if (!state.battle.active) {
            stopBattleLoop();
            drawBattleCanvas();
            return;
        }

        const elapsed = Math.min(0.033, Math.max(0, (now - state.battle.lastFrameAt) / 1000));
        state.battle.lastFrameAt = now;

        if (!state.battle.pausedByVisibility && !state.battle.pendingPerks.length && !state.battle.result) {
            updateBattle(elapsed);
        }

        drawBattleCanvas();
        updateBattleHud();
        renderStageCenter();
        state.battle.rafId = requestAnimationFrame(tickBattle);
    }

    function updateBattle(delta) {
        const battle = state.battle;
        battle.time += delta;
        battle.fireCooldown = Math.max(0, battle.fireCooldown - delta);

        if (battle.player.regen > 0) {
            battle.player.shield = Math.min(battle.player.maxShield, battle.player.shield + (battle.player.regen * delta));
        }

        if (battle.time >= config.battle.upgradePickSeconds[battle.nextUpgradeIndex] && battle.nextUpgradeIndex < config.battle.upgradePickSeconds.length) {
            battle.nextUpgradeIndex += 1;
            battle.pointerActive = false;
            battle.pendingPerks = pickBattlePerks();
            pushBattleNotice(text('\u9009\u62e9\u4e00\u9879\u5f3a\u5316', 'Choose an upgrade'), 'accent');
            return;
        }

        if (!battle.bossSpawned && battle.time >= config.battle.bossSpawnSecond) {
            spawnBoss();
        }

        const spawnInterval = Math.max(0.44, 1.18 - (battle.time * 0.012) - (battle.chapter.chapter * 0.06));
        if (!battle.bossSpawned && battle.time >= battle.nextSpawnAt) {
            spawnEnemy(false);
            if (battle.time > 36 && Math.random() > 0.6) spawnEnemy(false);
            battle.nextSpawnAt = battle.time + spawnInterval;
        }

        if (battle.nextEliteIndex < config.battle.eliteSpawnSeconds.length && battle.time >= config.battle.eliteSpawnSeconds[battle.nextEliteIndex]) {
            battle.nextEliteIndex += 1;
            spawnEnemy(true);
            pushBattleNotice(text('精英入场', 'Elite incoming'), 'warning');
        }

        updatePlayer(delta);
        updateBullets(delta);
        updateEnemyShots(delta);
        updateEnemies(delta);
        updatePickups(delta);
        updateFloats(delta);

        if (battle.player.shield <= 0 && !battle.result) {
            endBattle(false);
        }
    }

    function updatePlayer(delta) {
        const battle = state.battle;
        if (!battle.player) return;
        const moveRate = 0.18 + (battle.player.speed * 0.12);
        battle.player.x += (battle.pointerX - battle.player.x) * Math.min(1, moveRate * 60 * delta);
        battle.player.y += (battle.pointerY - battle.player.y) * Math.min(1, moveRate * 60 * delta);
        battle.player.x = clampNumber(battle.player.x, battle.viewportWidth / 2, 18, battle.viewportWidth - 18);
        battle.player.y = clampNumber(battle.player.y, battle.viewportHeight - 56, 40, battle.viewportHeight - 18);

        if (battle.fireCooldown <= 0) {
            firePlayerBullets();
            battle.fireCooldown = Math.max(0.12, 0.34 / battle.player.fireRate);
        }
    }

    function firePlayerBullets() {
        const battle = state.battle;
        const bulletDamage = battle.player.attack;
        battle.bullets.push(createBullet(battle.player.x, battle.player.y - 18, 0, -420, bulletDamage, battle.player.pierce));

        if (battle.mods.volley) {
            battle.bullets.push(createBullet(battle.player.x - 12, battle.player.y - 14, -70, -410, bulletDamage * 0.82, battle.player.pierce));
            battle.bullets.push(createBullet(battle.player.x + 12, battle.player.y - 14, 70, -410, bulletDamage * 0.82, battle.player.pierce));
        }

        state.battle.charge = Math.min(100, state.battle.charge + (0.65 * battle.player.chargeRate));
    }

    function createBullet(x, y, vx, vy, damage, pierce) {
        return {
            x,
            y,
            vx,
            vy,
            radius: 4,
            damage,
            pierce
        };
    }

    function updateBullets(delta) {
        const battle = state.battle;
        for (let index = battle.bullets.length - 1; index >= 0; index -= 1) {
            const bullet = battle.bullets[index];
            bullet.x += bullet.vx * delta;
            bullet.y += bullet.vy * delta;

            if (bullet.y < -20 || bullet.x < -20 || bullet.x > battle.viewportWidth + 20) {
                battle.bullets.splice(index, 1);
                continue;
            }

            for (let enemyIndex = battle.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
                const enemy = battle.enemies[enemyIndex];
                const hitRadius = bullet.radius + enemy.radius;
                if (distanceSquared(bullet.x, bullet.y, enemy.x, enemy.y) > hitRadius * hitRadius) continue;

                const damage = isCriticalHit(battle.player.critChance) ? bullet.damage * battle.player.critDamage : bullet.damage;
                const bossAdjustedDamage = enemy.isBoss ? damage * battle.player.bossDamageMultiplier : damage;
                enemy.hp -= bossAdjustedDamage;
                createFloat(enemy.x, enemy.y - enemy.radius, `-${Math.round(bossAdjustedDamage)}`, enemy.isBoss ? '#ffd766' : '#68b7ff');
                bullet.pierce -= 1;

                if (enemy.hp <= 0) {
                    defeatEnemy(enemyIndex);
                }

                if (bullet.pierce < 0) {
                    battle.bullets.splice(index, 1);
                    break;
                }
            }
        }
    }

    function updateEnemies(delta) {
        const battle = state.battle;
        for (let index = battle.enemies.length - 1; index >= 0; index -= 1) {
            const enemy = battle.enemies[index];
            if (enemy.isBoss) {
                enemy.y += (Math.min(82, 64 + enemy.radius) - enemy.y) * Math.min(1, delta * 2.2);
                enemy.x = battle.viewportWidth / 2 + Math.sin(battle.time * 1.4) * (battle.viewportWidth * 0.28);
                enemy.shotCooldown -= delta;
                if (enemy.shotCooldown <= 0) {
                    enemy.shotCooldown = 1.15;
                    fireEnemySpread(enemy, 3, 210);
                }
            } else {
                enemy.y += enemy.speed * delta;
                if (enemy.isElite) {
                    enemy.x += Math.sin((battle.time * 2.1) + enemy.waveSeed) * 26 * delta;
                    enemy.shotCooldown -= delta;
                    if (enemy.shotCooldown <= 0) {
                        enemy.shotCooldown = 1.55;
                        battle.enemyShots.push(createEnemyShot(enemy.x, enemy.y + enemy.radius + 6, 0, 220, enemy.damage));
                    }
                }
            }

            const hitRadius = enemy.radius + battle.player.radius;
            if (distanceSquared(enemy.x, enemy.y, battle.player.x, battle.player.y) <= hitRadius * hitRadius) {
                damagePlayer(enemy.damage * 1.2);
                battle.enemies.splice(index, 1);
                createFloat(battle.player.x, battle.player.y - 20, `-${Math.round(enemy.damage * 1.2)}`, '#ff7e7e');
                continue;
            }

            if (enemy.y > battle.viewportHeight + enemy.radius + 10) {
                damagePlayer(enemy.damage * 0.72);
                battle.enemies.splice(index, 1);
                pushBattleNotice(text('有敌人突破防线', 'An enemy slipped through'), 'danger');
            }
        }
    }

    function updateEnemyShots(delta) {
        const battle = state.battle;
        for (let index = battle.enemyShots.length - 1; index >= 0; index -= 1) {
            const shot = battle.enemyShots[index];
            shot.x += shot.vx * delta;
            shot.y += shot.vy * delta;
            if (shot.y > battle.viewportHeight + 22 || shot.x < -20 || shot.x > battle.viewportWidth + 20) {
                battle.enemyShots.splice(index, 1);
                continue;
            }
            const hitRadius = shot.radius + battle.player.radius;
            if (distanceSquared(shot.x, shot.y, battle.player.x, battle.player.y) <= hitRadius * hitRadius) {
                damagePlayer(shot.damage);
                battle.enemyShots.splice(index, 1);
                createFloat(battle.player.x, battle.player.y - 18, `-${Math.round(shot.damage)}`, '#ff7e7e');
            }
        }
    }

    function createEnemyShot(x, y, vx, vy, damage) {
        return { x, y, vx, vy, radius: 5, damage };
    }

    function updatePickups(delta) {
        const battle = state.battle;
        for (let index = battle.pickups.length - 1; index >= 0; index -= 1) {
            const pickup = battle.pickups[index];
            const distance = Math.sqrt(distanceSquared(pickup.x, pickup.y, battle.player.x, battle.player.y));
            if (distance <= battle.player.magnet) {
                const moveScale = Math.min(1, ((battle.player.magnet + 24) / Math.max(20, distance)) * delta * 6);
                pickup.x += (battle.player.x - pickup.x) * moveScale;
                pickup.y += (battle.player.y - pickup.y) * moveScale;
            } else {
                pickup.y += pickup.vy * delta;
            }

            if (distance <= pickup.radius + battle.player.radius + 4) {
                collectPickup(pickup);
                battle.pickups.splice(index, 1);
                continue;
            }

            if (pickup.y > battle.viewportHeight + 24) {
                battle.pickups.splice(index, 1);
            }
        }
    }

    function updateFloats(delta) {
        for (let index = state.battle.floats.length - 1; index >= 0; index -= 1) {
            const item = state.battle.floats[index];
            item.y -= 28 * delta;
            item.life -= delta;
            if (item.life <= 0) state.battle.floats.splice(index, 1);
        }
    }

    function spawnEnemy(isElite) {
        const battle = state.battle;
        const chapterIndex = getChapterIndex(battle.chapter.id);
        const baseScale = 1 + (battle.chapter.chapter * 0.28) + (chapterIndex * 0.08);
        const x = 24 + Math.random() * Math.max(40, battle.viewportWidth - 48);
        if (isElite) {
            battle.enemies.push({
                x,
                y: -22,
                radius: 16,
                hp: Math.round(110 * baseScale),
                maxHp: Math.round(110 * baseScale),
                speed: 74 + (chapterIndex * 4),
                damage: 18 * baseScale,
                shotCooldown: 0.9,
                waveSeed: Math.random() * Math.PI * 2,
                isElite: true,
                isBoss: false
            });
            return;
        }
        battle.enemies.push({
            x,
            y: -18,
            radius: 11,
            hp: Math.round(38 * baseScale),
            maxHp: Math.round(38 * baseScale),
            speed: 62 + (chapterIndex * 6) + Math.random() * 18,
            damage: 9 * baseScale,
            isElite: false,
            isBoss: false
        });
    }

    function spawnBoss() {
        const battle = state.battle;
        const chapterIndex = getChapterIndex(battle.chapter.id);
        const baseScale = 1 + (battle.chapter.chapter * 0.42) + (chapterIndex * 0.1);
        battle.bossSpawned = true;
        battle.enemies = battle.enemies.filter((enemy) => enemy.isElite);
        battle.enemyShots = [];
        battle.enemies.push({
            x: battle.viewportWidth / 2,
            y: -48,
            radius: 30,
            hp: Math.round(760 * baseScale),
            maxHp: Math.round(760 * baseScale),
            speed: 0,
            damage: 24 * baseScale,
            shotCooldown: 0.5,
            isElite: true,
            isBoss: true
        });
        pushBattleNotice(text('Boss 到场', 'Boss arriving'), 'danger');
    }

    function fireEnemySpread(enemy, count, speed) {
        const spread = count === 1 ? [0] : Array.from({ length: count }, (_, index) => (index - (count - 1) / 2) * 0.34);
        spread.forEach((angle) => {
            state.battle.enemyShots.push(createEnemyShot(
                enemy.x,
                enemy.y + enemy.radius,
                Math.sin(angle) * speed,
                Math.cos(angle) * speed,
                enemy.damage
            ));
        });
    }

    function defeatEnemy(enemyIndex) {
        const enemy = state.battle.enemies[enemyIndex];
        if (!enemy) return;
        state.battle.enemies.splice(enemyIndex, 1);
        if (enemy.isElite) state.battle.eliteKills += 1;
        if (enemy.isBoss) {
            state.battle.bossDefeated = true;
            state.save.stats.bossesKilled += 1;
            pushBattleNotice(text('Boss 已击破', 'Boss destroyed'), 'good');
            endBattle(true);
            return;
        }

        state.battle.score += Math.round(enemy.maxHp);
        dropEnemyPickups(enemy);
    }

    function dropEnemyPickups(enemy) {
        const baseCredits = enemy.isElite ? 34 : 10;
        const baseAlloy = enemy.isElite ? 5 : (Math.random() > 0.76 ? 1 : 0);
        state.battle.pickups.push(createPickup(enemy.x, enemy.y, 'credits', baseCredits + Math.round(Math.random() * 6)));
        if (baseAlloy > 0) state.battle.pickups.push(createPickup(enemy.x + 10, enemy.y - 4, 'alloy', baseAlloy));
        if (Math.random() > 0.64 || enemy.isElite) state.battle.pickups.push(createPickup(enemy.x - 8, enemy.y + 6, 'charge', enemy.isElite ? 14 : 6));
    }

    function createPickup(x, y, type, value) {
        return {
            x,
            y,
            type,
            value,
            vy: 22,
            radius: type === 'charge' ? 6 : 7
        };
    }

    function collectPickup(pickup) {
        if (pickup.type === 'credits') {
            state.battle.collectedCredits += pickup.value;
            createFloat(pickup.x, pickup.y, `+${pickup.value}`, '#ffd766');
            return;
        }
        if (pickup.type === 'alloy') {
            state.battle.collectedAlloy += pickup.value;
            createFloat(pickup.x, pickup.y, `+${pickup.value}`, '#64ffb2');
            return;
        }
        if (pickup.type === 'charge') {
            state.battle.charge = Math.min(100, state.battle.charge + pickup.value);
            createFloat(pickup.x, pickup.y, `+${pickup.value}%`, '#68b7ff');
            return;
        }
    }

    function damagePlayer(amount) {
        state.battle.player.shield = Math.max(0, state.battle.player.shield - amount);
    }

    function castSkill() {
        if (!state.battle.active || state.battle.charge < 100 || state.battle.pendingPerks.length || state.battle.result) return;
        state.battle.charge = 0;
        pushBattleNotice(text('超载脉冲释放', 'Overload pulse released'), 'accent');
        for (let index = state.battle.enemies.length - 1; index >= 0; index -= 1) {
            const enemy = state.battle.enemies[index];
            const damage = (state.battle.player.attack * 4.8) + 120;
            enemy.hp -= enemy.isBoss ? damage * state.battle.player.bossDamageMultiplier : damage;
            createFloat(enemy.x, enemy.y - 12, `-${Math.round(damage)}`, '#bf8dff');
            if (enemy.hp <= 0) defeatEnemy(index);
        }
    }

    function pickBattlePerks() {
        const available = BATTLE_PERKS.filter((perk) => {
            if (perk.id === 'volley' && state.battle.mods.volley) return false;
            return true;
        });
        const picks = [];
        while (available.length && picks.length < 3) {
            const index = Math.floor(Math.random() * available.length);
            picks.push(available.splice(index, 1)[0]);
        }
        return picks;
    }

    function chooseBattlePerk(perkId) {
        if (!state.battle.pendingPerks.length) return;
        const perk = BATTLE_PERKS.find((item) => item.id === perkId);
        if (!perk) return;

        const player = state.battle.player;
        if (!player) return;

        switch (perkId) {
            case 'attack':
                player.attack *= 1.22;
                break;
            case 'rate':
                player.fireRate *= 1.18;
                break;
            case 'magnet':
                player.magnet += 28;
                break;
            case 'pierce':
                player.pierce += 1;
                break;
            case 'barrier':
                player.maxShield *= 1.12;
                player.shield = Math.min(player.maxShield, player.shield + player.maxShield * 0.35);
                break;
            case 'volley':
                state.battle.mods.volley = true;
                break;
            case 'charge':
                player.chargeRate *= 1.2;
                break;
            default:
                break;
        }

        state.battle.pendingPerks = [];
        renderStageCenter();
        showToast(text('\u5f3a\u5316\u5df2\u751f\u6548\u3002', 'Upgrade applied.'), 'success');
    }

    function endBattle(win) {
        if (state.battle.result) return;
        stopBattleLoop();
        const reward = settleBattleRewards(win);
        state.battle.active = false;
        state.battle.result = {
            win,
            reward
        };
        state.save.lastResult = {
            win,
            chapterId: state.battle.chapter.id,
            credits: reward.credits,
            alloy: reward.alloy,
            coreChips: reward.coreChips,
            seasonXp: reward.seasonXp,
            firstClear: reward.firstClear || null
        };
        saveProgress();
        drawBattleCanvas();
        updateBattleHud();
        renderStageCenter();
    }

    function settleBattleRewards(win) {
        const chapter = state.battle.chapter;
        const creditMultiplier = getCreditRewardMultiplier();
        const alloyMultiplier = getAlloyRewardMultiplier();
        const firstClear = win && isChapterFirstClearPending(chapter) ? getFirstClearReward(chapter) : null;

        let credits = Math.floor(((chapter.reward.credits * (win ? 1 : 0.58)) + state.battle.collectedCredits) * creditMultiplier);
        let alloy = Math.floor(((chapter.reward.alloy * (win ? 1 : 0.62)) + state.battle.collectedAlloy) * alloyMultiplier);
        let coreChips = win ? applySponsorBossChipBonus(chapter.reward.coreChips, chapter) : 0;
        let seasonXp = Math.floor(chapter.reward.seasonXp * (win ? 1 : 0.55));
        let reviveChips = 0;
        let epicModuleCrates = 0;
        let legendModuleCrates = 0;
        const shardReward = {};
        shardReward[state.save.selectedChassisId] = win ? 6 : 2;
        state.save.selectedWingmen.filter(Boolean).forEach((wingId) => {
            shardReward[wingId] = (shardReward[wingId] || 0) + (win ? 4 : 1);
        });

        if (firstClear) {
            credits += Number(firstClear.credits || 0);
            alloy += Number(firstClear.alloy || 0);
            coreChips += Number(firstClear.coreChips || 0);
            seasonXp += Number(firstClear.seasonXp || 0);
            reviveChips += Number(firstClear.reviveChips || 0);
            epicModuleCrates += Number(firstClear.epicModuleCrates || 0);
            legendModuleCrates += Number(firstClear.legendModuleCrates || 0);
        }

        state.save.credits += credits;
        state.save.alloy += alloy;
        state.save.coreChips += coreChips;
        state.save.seasonXp += seasonXp;
        state.save.reviveChips += reviveChips;
        Object.entries(shardReward).forEach(([unitId, amount]) => addShards(unitId, amount));
        if (epicModuleCrates || legendModuleCrates) {
            grantRewardModuleCrates({ epicModuleCrates, legendModuleCrates });
        }

        state.save.stats.eliteKills += state.battle.eliteKills;
        if (win) {
            state.save.stats.wins += 1;
            if (!state.save.clearedChapters.includes(chapter.id)) {
                state.save.clearedChapters.push(chapter.id);
            }
            const nextChapterIndex = Math.min(config.chapters.length - 1, getChapterIndex(chapter.id) + 1);
            state.save.unlockedChapterIndex = Math.max(state.save.unlockedChapterIndex, nextChapterIndex);
            state.save.selectedChapterId = config.chapters[nextChapterIndex].id;
        }

        return {
            credits,
            alloy,
            coreChips,
            seasonXp,
            reviveChips,
            epicModuleCrates,
            legendModuleCrates,
            firstClear,
            shards: shardReward
        };
    }

    function closeBattleResult(nextChapterId = '') {
        if (nextChapterId && chapterMap[nextChapterId]) {
            state.save.selectedChapterId = nextChapterId;
        }
        state.battle = createBattleState();
        renderAll();
    }

    function drawBattleCanvas() {
        if (!ui.sortieCanvas) return;
        const context = ui.sortieCanvas.getContext('2d');
        const width = state.battle.viewportWidth || ui.sortieCanvas.clientWidth || 320;
        const height = state.battle.viewportHeight || ui.sortieCanvas.clientHeight || 360;

        context.clearRect(0, 0, width, height);
        drawStageBackground(context, width, height);

        if (!state.battle.active && !state.battle.result) {
            drawIdlePreview(context, width, height);
            return;
        }

        drawPickups(context);
        drawBullets(context);
        drawEnemyShots(context);
        drawEnemies(context);
        drawPlayer(context);
        drawFloats(context);
        drawBattleNotice(context, width, height);
    }

    function drawStageBackground(context, width, height) {
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#10192e');
        gradient.addColorStop(1, '#060a13');
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = 'rgba(104, 183, 255, 0.08)';
        context.lineWidth = 1;
        for (let x = 20; x < width; x += 34) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        for (let y = 18; y < height; y += 32) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    }

    function drawIdlePreview(context, width, height) {
        context.fillStyle = 'rgba(255,255,255,0.04)';
        for (let index = 0; index < 22; index += 1) {
            const x = ((index * 47) % width);
            const y = ((index * 63) % height);
            context.fillRect(x, y, 2, 2);
        }
        const centerX = width / 2;
        const centerY = height * 0.72;
        drawPlayerShape(context, centerX, centerY, 14, '#68b7ff');
        drawWingShape(context, centerX - 24, centerY + 4, 10, '#64ffb2');
        drawWingShape(context, centerX + 24, centerY + 4, 10, '#64ffb2');
        context.fillStyle = '#dce7ff';
        context.font = '600 14px Inter';
        context.textAlign = 'center';
        context.fillText(text('准备出击', 'Ready to launch'), centerX, height * 0.26);
        context.fillStyle = 'rgba(220, 231, 255, 0.72)';
        context.font = '12px Inter';
        context.fillText(text('拖动机体走位，自动攻击所有来袭目标', 'Drag your chassis to dodge while auto-firing at all threats'), centerX, height * 0.31);
    }

    function drawPlayer(context) {
        const player = state.battle.player;
        if (!player) return;
        drawPlayerShape(context, player.x, player.y, player.radius, '#68b7ff');
        if (state.battle.mods.volley) {
            drawWingShape(context, player.x - 18, player.y + 8, 8, '#64ffb2');
            drawWingShape(context, player.x + 18, player.y + 8, 8, '#64ffb2');
        } else {
            drawWingShape(context, player.x - 18, player.y + 8, 7, '#64ffb2');
            drawWingShape(context, player.x + 18, player.y + 8, 7, '#64ffb2');
        }
    }

    function drawPlayerShape(context, x, y, radius, color) {
        context.save();
        context.translate(x, y);
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(0, -radius);
        context.lineTo(radius * 0.84, radius * 0.9);
        context.lineTo(0, radius * 0.44);
        context.lineTo(-radius * 0.84, radius * 0.9);
        context.closePath();
        context.fill();
        context.fillStyle = '#eff6ff';
        context.fillRect(-2, -radius + 4, 4, radius * 1.2);
        context.restore();
    }

    function drawWingShape(context, x, y, radius, color) {
        context.save();
        context.translate(x, y);
        context.fillStyle = color;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }

    function drawEnemies(context) {
        state.battle.enemies.forEach((enemy) => {
            context.save();
            context.translate(enemy.x, enemy.y);
            if (enemy.isBoss) {
                context.fillStyle = '#ff9e6f';
                context.beginPath();
                context.moveTo(0, -enemy.radius);
                context.lineTo(enemy.radius * 0.92, -enemy.radius * 0.1);
                context.lineTo(enemy.radius * 0.58, enemy.radius);
                context.lineTo(-enemy.radius * 0.58, enemy.radius);
                context.lineTo(-enemy.radius * 0.92, -enemy.radius * 0.1);
                context.closePath();
                context.fill();
                context.fillStyle = '#fff3db';
                context.fillRect(-enemy.radius * 0.64, enemy.radius + 8, enemy.radius * 1.28 * (enemy.hp / enemy.maxHp), 6);
            } else if (enemy.isElite) {
                context.fillStyle = '#ffd766';
                context.beginPath();
                context.moveTo(0, enemy.radius);
                context.lineTo(enemy.radius, -enemy.radius);
                context.lineTo(-enemy.radius, -enemy.radius);
                context.closePath();
                context.fill();
            } else {
                context.fillStyle = '#ff7e7e';
                context.beginPath();
                context.arc(0, 0, enemy.radius, 0, Math.PI * 2);
                context.fill();
            }
            context.restore();
        });
    }

    function drawBullets(context) {
        context.fillStyle = '#9bd4ff';
        state.battle.bullets.forEach((bullet) => {
            context.beginPath();
            context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            context.fill();
        });
    }

    function drawEnemyShots(context) {
        context.fillStyle = '#ffb5b5';
        state.battle.enemyShots.forEach((shot) => {
            context.beginPath();
            context.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
            context.fill();
        });
    }

    function drawPickups(context) {
        state.battle.pickups.forEach((pickup) => {
            context.fillStyle = pickup.type === 'credits' ? '#ffd766' : pickup.type === 'alloy' ? '#64ffb2' : '#68b7ff';
            context.beginPath();
            context.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
            context.fill();
        });
    }

    function drawFloats(context) {
        context.save();
        context.textAlign = 'center';
        context.font = '600 12px Inter';
        state.battle.floats.forEach((item) => {
            context.globalAlpha = Math.max(0, Math.min(1, item.life / item.maxLife));
            context.fillStyle = item.color;
            context.fillText(item.text, item.x, item.y);
        });
        context.restore();
    }

    function drawBattleNotice(context, width, height) {
        if (!state.battle.notice || state.battle.notice.until < state.battle.time) return;
        context.save();
        context.textAlign = 'center';
        context.font = '700 16px Inter';
        context.fillStyle = state.battle.notice.tone === 'danger' ? '#ff7e7e' : state.battle.notice.tone === 'good' ? '#64ffb2' : '#dce7ff';
        context.fillText(state.battle.notice.text, width / 2, height * 0.18);
        context.restore();
    }

    function createFloat(x, y, textValue, color) {
        state.battle.floats.push({
            x,
            y,
            text: textValue,
            color,
            life: 0.72,
            maxLife: 0.72
        });
    }

    function pushBattleNotice(textValue, tone) {
        state.battle.notice = {
            text: textValue,
            tone,
            until: state.battle.time + 1.4
        };
    }

    function updateBattleHud() {
        if (!ui.battleHudShield || !ui.battleHudCharge || !ui.battleHudStatus) return;
        if (!state.battle.active && !state.battle.result) {
            ui.battleHudShield.textContent = text('待机', 'Standby');
            ui.battleHudCharge.textContent = '0%';
            ui.battleHudStatus.textContent = getSelectedChapter().id;
            return;
        }
        if (state.battle.result) {
            ui.battleHudShield.textContent = text('结算中', 'Settled');
            ui.battleHudCharge.textContent = `${Math.round(state.battle.charge || 0)}%`;
            ui.battleHudStatus.textContent = state.battle.result.win ? text('任务完成', 'Mission Clear') : text('战术撤离', 'Retreated');
            return;
        }

        ui.battleHudShield.textContent = `${Math.max(0, Math.round(state.battle.player.shield))}/${Math.round(state.battle.player.maxShield)}`;
        ui.battleHudCharge.textContent = `${Math.round(state.battle.charge)}%`;
        ui.battleHudStatus.textContent = state.battle.bossSpawned
            ? (state.battle.bossDefeated ? text('Boss 击破', 'Boss Down') : text('Boss 交战', 'Boss Fight'))
            : `${text('波次', 'Wave')} ${Math.max(1, state.battle.nextEliteIndex + 1)}`;
    }

    function renderStageCenter() {
        if (!ui.sortieCenter) return;

        let viewKey = 'active';
        let markup = '';

        if (state.battle.pendingPerks.length) {
            viewKey = `perk:${state.battle.pendingPerks.map((perk) => perk.id).join('|')}`;
            markup = `
                <div class="ds-stage-overlay-card">
                    <div class="eyebrow">${escapeHtml(text('\u9009\u62e9\u4e00\u9879\u5f3a\u5316', 'Choose an Upgrade'))}</div>
                    <div class="ds-perk-grid">${state.battle.pendingPerks.map(renderPerkCard).join('')}</div>
                </div>
            `;
        } else if (state.battle.result) {
            const reward = state.battle.result.reward;
            const nextChapter = getNextUnlockedChapterId(state.battle.chapter.id);
            viewKey = `result:${state.battle.chapter.id}:${state.battle.result.win ? 'win' : 'lose'}:${reward.credits}:${reward.alloy}:${reward.coreChips}:${reward.seasonXp}`;
            markup = `
                <div class="ds-stage-overlay-card">
                    <div class="eyebrow">${escapeHtml(state.battle.result.win ? text('\u51fa\u51fb\u6210\u529f', 'Sortie Cleared') : text('\u6218\u672f\u64a4\u79bb', 'Tactical Retreat'))}</div>
                    <h3 style="margin:0;">${escapeHtml(localize(state.battle.chapter.name))}</h3>
                    <div class="ds-result-grid">
                        <div class="ds-result-item">
                            <span class="ds-stat-label">${escapeHtml(text('\u91d1\u5e01', 'Credits'))}</span>
                            <strong class="ds-stat-value">+${escapeHtml(String(reward.credits))}</strong>
                        </div>
                        <div class="ds-result-item">
                            <span class="ds-stat-label">${escapeHtml(text('\u5408\u91d1', 'Alloy'))}</span>
                            <strong class="ds-stat-value">+${escapeHtml(String(reward.alloy))}</strong>
                        </div>
                        <div class="ds-result-item">
                            <span class="ds-stat-label">${escapeHtml(text('\u6838\u82af', 'Core Chips'))}</span>
                            <strong class="ds-stat-value">+${escapeHtml(String(reward.coreChips))}</strong>
                        </div>
                        <div class="ds-result-item">
                            <span class="ds-stat-label">${escapeHtml(text('\u8d5b\u5b63\u7ecf\u9a8c', 'Season XP'))}</span>
                            <strong class="ds-stat-value">+${escapeHtml(String(reward.seasonXp))}</strong>
                        </div>
                    </div>
                    <div class="ds-inline-note">${escapeHtml(getShardSummaryText(reward.shards))}</div>
                    ${reward.firstClear ? `<div class="ds-inline-note">${escapeHtml(`${text('\u9996\u901a\u5956\u52b1', 'First Clear Pack')} \u00b7 ${getRewardText(reward.firstClear)}`)}</div>` : ''}
                    <div class="ds-stage-overlay-actions">
                        <button class="ghost-btn" type="button" data-action="closeBattleResult">${escapeHtml(text('\u6574\u7406\u673a\u5e93', 'Back to Hangar'))}</button>
                        ${state.battle.result.win && nextChapter ? `<button class="primary-btn" type="button" data-action="closeBattleResult" data-value="${nextChapter}">${escapeHtml(text('\u63a8\u8fdb\u4e0b\u4e00\u7ae0', 'Next Chapter'))}</button>` : `<button class="primary-btn" type="button" data-action="closeBattleResult">${escapeHtml(text('\u7ee7\u7eed\u51fa\u51fb', 'Continue'))}</button>`}
                    </div>
                </div>
            `;
        } else if (!state.battle.active) {
            const chapter = getSelectedChapter();
            const gap = Math.max(0, chapter.recommended - getCurrentPower());
            viewKey = `brief:${chapter.id}:${gap}`;
            markup = `
                <div class="ds-stage-overlay-card">
                    <div class="eyebrow">${escapeHtml(text('\u6218\u524d\u7b80\u62a5', 'Pre-sortie Brief'))}</div>
                    <h3 style="margin:0;">${escapeHtml(localize(chapter.name))}</h3>
                    <div class="ds-inline-note">${escapeHtml(gap > 0 ? text(`\u5f53\u524d\u8fd8\u5dee ${gap} \u6218\u529b\uff0c\u5efa\u8bae\u5148\u8865\u673a\u5e93\u6216\u84dd\u56fe\u3002`, `You are ${gap} power short. Upgrade the hangar or blueprints first.`) : text('\u5f53\u524d\u6218\u529b\u5df2\u8fbe\u5230\u63a8\u8350\u7ebf\uff0c\u53ef\u4ee5\u76f4\u63a5\u8d77\u98de\u3002', 'Your power meets the recommendation. Launch now.'))}</div>
                </div>
            `;
        }

        if (ui.sortieCenter.dataset.viewKey === viewKey) return;
        ui.sortieCenter.dataset.viewKey = viewKey;
        ui.sortieCenter.innerHTML = markup;
    }

    function renderPerkCard(perk) {
        return `
            <button class="ds-perk-card" type="button" data-action="choosePerk" data-value="${perk.id}">
                <strong>${escapeHtml(localize(perk.title))}</strong>
                <div class="ds-card-copy">${escapeHtml(localize(perk.desc))}</div>
            </button>
        `;
    }

    function selectChapter(chapterId) {
        const chapterIndex = getChapterIndex(chapterId);
        if (chapterIndex < 0 || !isChapterUnlocked(chapterIndex) || state.battle.active) return;
        state.save.selectedChapterId = chapterId;
        saveProgress();
        renderAll();
    }

    function selectChassis(chassisId) {
        if (!chassisMap[chassisId] || !isChapterClearedOrReached(chassisMap[chassisId].unlockStage)) return;
        state.save.selectedChassisId = chassisId;
        saveProgress();
        renderAll();
    }

    function equipWing(slotValue, wingmanId) {
        const slotIndex = Number(slotValue);
        if (!canEquipWing(slotIndex, wingmanId)) return;
        const otherIndex = slotIndex === 0 ? 1 : 0;
        if (state.save.selectedWingmen[otherIndex] === wingmanId) {
            state.save.selectedWingmen[otherIndex] = '';
        }
        state.save.selectedWingmen[slotIndex] = wingmanId;
        saveProgress();
        renderAll();
    }

    function unequipWing(slotValue) {
        const slotIndex = Number(slotValue);
        if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= state.save.selectedWingmen.length) return;
        state.save.selectedWingmen[slotIndex] = '';
        saveProgress();
        renderAll();
    }

    function upgradeUnit(type, unitId) {
        const levelMap = type === 'wingman' ? state.save.wingmanLevels : state.save.chassisLevels;
        const currentLevel = getUnitLevel(levelMap, unitId);
        const cost = getUnitUpgradeCost(type, unitId, currentLevel);
        if (state.save.credits < cost) {
            showToast(text('金币不足。', 'Not enough credits.'), 'warning');
            return;
        }
        state.save.credits -= cost;
        levelMap[unitId] = currentLevel + 1;
        saveProgress();
        showToast(text('升级完成。', 'Upgrade complete.'), 'success');
        renderAll();
    }

    function starUnit(type, unitId) {
        const starMap = type === 'wingman' ? state.save.wingmanStars : state.save.chassisStars;
        const currentStars = getUnitStar(starMap, unitId);
        const cost = getStarUpgradeCost(currentStars);
        if (!cost) return;
        if (state.save.credits < cost.credits || state.save.alloy < cost.alloy || getShardCount(unitId) < cost.shards) {
            showToast(text('升星材料不足。', 'Not enough star-up materials.'), 'warning');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.alloy -= cost.alloy;
        addShards(unitId, -cost.shards);
        starMap[unitId] = currentStars + 1;
        saveProgress();
        showToast(text('升星成功。', 'Star-up successful.'), 'success');
        renderAll();
    }

    function upgradeResearch(researchId) {
        const research = researchMap[researchId];
        if (!research) return;
        const level = getResearchLevel(researchId);
        const cost = getResearchCost(researchId);
        if (level >= research.maxLevel || !canUpgradeResearch(researchId)) {
            showToast(text('金币、芯片或合金不足，或已满级。', 'Not enough credits, chips, or alloy, or already maxed.'), 'warning');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.coreChips -= cost.coreChips;
        state.save.alloy -= cost.alloy;
        state.save.researchLevels[researchId] = level + 1;
        saveProgress();
        showToast(text('研究升级完成。', 'Research upgraded.'), 'success');
        renderAll();
    }

    function craftModule() {
        resetCraftDayWindow();
        const cost = getCraftCost();
        if (!cost.free) {
            if (state.save.credits < cost.credits || state.save.alloy < cost.alloy) {
                showToast(text('制造资源不足。', 'Not enough crafting resources.'), 'warning');
                return;
            }
            state.save.credits -= cost.credits;
            state.save.alloy -= cost.alloy;
            state.save.crafting.craftDayKey = getDayKey(Date.now());
            state.save.crafting.craftsToday += 1;
        } else {
            state.save.crafting.freeDayKey = getDayKey(Date.now());
        }

        const rarity = rollModuleRarity();
        const definition = config.modules[Math.floor(Math.random() * config.modules.length)];
        const module = {
            uid: createUid('mod'),
            id: definition.id,
            rarity,
            level: 1
        };
        state.save.moduleInventory.unshift(module);
        state.save.crafting.totalCrafts += 1;
        if (rarity === 'rare' || rarity === 'epic' || rarity === 'legend') {
            state.save.crafting.rarePity = 0;
            state.save.stats.rareCrafts += 1;
        } else {
            state.save.crafting.rarePity += 1;
        }
        if (rarity === 'epic' || rarity === 'legend') {
            state.save.crafting.epicPity = 0;
            state.save.stats.epicCrafts += 1;
        } else {
            state.save.crafting.epicPity += 1;
        }
        saveProgress();

        state.modal = {
            eyebrow: text('制造完成', 'Craft Complete'),
            title: localize(definition.name),
            subtitle: localize(definition.effect),
            body: `
                <div class="ds-inline-note">${escapeHtml(text('新模组已加入库存，可立即装配到对应槽位。', 'The new module has been added to inventory and can be equipped right away.'))}</div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('稀有度', 'Rarity'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(localizeRarity(rarity))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('槽位', 'Slot'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getModuleSlotLabel(definition.slot))}</strong>
                    </div>
                </div>
            `,
            actions: [
                { label: text('继续制造', 'Keep Crafting'), action: 'closeModal', tone: 'ghost' },
                { label: text('装备到机库', 'Equip in Hangar'), action: 'openTab', value: 'blueprints', tone: 'primary' }
            ]
        };
        renderModal();
        renderAll();
    }

    function equipModule(moduleUid) {
        const module = state.save.moduleInventory.find((item) => item.uid === moduleUid);
        if (!module) return;
        const slot = moduleMap[module.id]?.slot;
        if (!slot) return;
        state.save.selectedModules[slot] = module.uid;
        saveProgress();
        renderAll();
    }

    function unequipModule(slot) {
        if (!(slot in state.save.selectedModules)) return;
        state.save.selectedModules[slot] = '';
        saveProgress();
        renderAll();
    }

    function upgradeModule(moduleUid) {
        const module = state.save.moduleInventory.find((item) => item.uid === moduleUid);
        if (!module) return;
        const cost = getModuleUpgradeCost(module);
        const extraChipCost = getModuleChipCost(module);
        if (state.save.credits < cost.credits || state.save.alloy < cost.alloy || state.save.coreChips < extraChipCost) {
            showToast(text('模组升级材料不足。', 'Not enough module upgrade materials.'), 'warning');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.alloy -= cost.alloy;
        state.save.coreChips -= extraChipCost;
        module.level += 1;
        saveProgress();
        showToast(text('模组升级完成。', 'Module upgraded.'), 'success');
        renderAll();
    }

    function claimMission(missionId) {
        const mission = config.missions.find((item) => item.id === missionId);
        if (!mission || state.save.missionClaimed.includes(missionId) || getMissionProgress(missionId) < mission.target) return;
        grantReward(mission.reward);
        state.save.missionClaimed.push(missionId);
        saveProgress();
        showToast(text('任务奖励已到账。', 'Mission reward claimed.'), 'success');
        renderAll();
    }

    function claimSeasonNode(trackType, nodeId) {
        const node = trackType === 'premium'
            ? config.seasonPremiumTrack.find((item) => item.id === nodeId)
            : config.seasonFreeTrack.find((item) => item.id === nodeId);
        const claimKey = `${trackType}:${nodeId}`;
        if (!node || state.save.seasonClaimed.includes(claimKey) || state.save.seasonXp < node.xp) return;
        if (trackType === 'premium' && !isSeasonPassUnlocked()) return;
        grantReward(node.reward);
        state.save.seasonClaimed.push(claimKey);
        saveProgress();
        showToast(text('赛季奖励已领取。', 'Season reward claimed.'), 'success');
        renderAll();
    }

    function claimDailySupply() {
        if (!canClaimDailySupply()) return;
        const item = shopMap.dailySupply;
        state.save.dailySupplyAt = Date.now();
        grantReward(item.reward);
        saveProgress();
        showToast(text('每日补给已领取。', 'Daily supply claimed.'), 'success');
        renderAll();
    }

    function buyShopItem(itemId) {
        const item = shopMap[itemId];
        if (!item || item.price <= 0) return;
        if (state.save.credits < item.price) {
            showToast(text('金币不足。', 'Not enough credits.'), 'warning');
            return;
        }
        state.save.credits -= item.price;
        grantReward(item.reward);
        saveProgress();
        showToast(text('补给已发放。', 'Supply purchased.'), 'success');
        renderAll();
    }

    function previewOffer(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        state.modal = {
            eyebrow: text('赞助礼包', 'Sponsor Pack'),
            title: localize(offer.name),
            subtitle: getOfferImpactText(offer),
            body: `
                <div class="ds-inline-note">${escapeHtml(text('礼包会通过链上订单校验发奖。支付成功后会立即发放资源、模块奖励，并同步提高永久战斗加成。', 'This pack uses the verified on-chain order flow. Rewards, module drops, and permanent combat boosts are granted right after verification.'))}</div>
                <div class="ds-stat-grid">
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">USDT</span>
                        <strong class="ds-stat-value">${escapeHtml(String(offer.price))}</strong>
                    </div>
                    <div class="ds-stat-box">
                        <span class="ds-stat-label">${escapeHtml(text('即时收益', 'Immediate Value'))}</span>
                        <strong class="ds-stat-value">${escapeHtml(getRewardText(offer.reward))}</strong>
                    </div>
                </div>
            `,
            actions: [
                { label: text('稍后再说', 'Maybe Later'), action: 'closeModal', tone: 'ghost' },
                { label: text('去支付', 'Open Payment'), action: 'openPayment', value: offer.id, tone: 'primary' }
            ]
        };
        renderModal();
    }

    function grantReward(reward) {
        state.save.credits += Number(reward.credits || 0);
        state.save.alloy += Number(reward.alloy || 0);
        state.save.coreChips += Number(reward.coreChips || 0);
        state.save.seasonXp += Number(reward.seasonXp || 0);
        state.save.reviveChips += Number(reward.reviveChips || 0);
        if (reward.chassisShards) addShards(state.save.selectedChassisId, reward.chassisShards);
        if (reward.wingmanShards) {
            state.save.selectedWingmen.filter(Boolean).forEach((wingId) => addShards(wingId, Math.ceil(reward.wingmanShards / Math.max(1, state.save.selectedWingmen.filter(Boolean).length))));
        }
        grantRewardModuleCrates(reward);
    }

    function createRewardModule(rarity) {
        const definition = config.modules[Math.floor(Math.random() * config.modules.length)] || config.modules[0];
        if (!definition) return null;
        const module = normalizeModule({
            uid: createUid('mod'),
            id: definition.id,
            rarity,
            level: 1
        });
        if (module) state.save.moduleInventory.unshift(module);
        return module;
    }

    function grantRewardModuleCrates(reward) {
        const epicCrates = Math.max(0, Math.round(Number(reward.epicModuleCrates || 0)));
        const legendCrates = Math.max(0, Math.round(Number(reward.legendModuleCrates || 0)));
        for (let index = 0; index < epicCrates; index += 1) {
            createRewardModule(Math.random() < 0.16 ? 'legend' : 'epic');
        }
        for (let index = 0; index < legendCrates; index += 1) {
            createRewardModule('legend');
        }
    }

    async function flushPendingPaymentClaims() {
        const pendingEntries = Object.entries(state.save.payment.pendingClaims || {});
        if (!pendingEntries.length) return;
        for (const [orderId, txid] of pendingEntries) {
            try {
                await claimBackendPayment(orderId, txid);
                delete state.save.payment.pendingClaims[orderId];
            } catch (error) {
            }
        }
        saveProgress();
    }

    function grantPaymentRewards({ orderId, txid, offerId, queueClaim = true }) {
        const offer = offerMap[offerId] || getSelectedPaymentOffer();
        if (!offer || !orderId || state.save.payment.claimedOrders[orderId]) return false;

        const beforeTier = getSponsorTier();
        const normalizedTxid = PAYMENT_TXID_REGEX.test(String(txid || '').trim()) ? String(txid).trim().toLowerCase() : '';

        grantReward(offer.reward);
        applyPermanentBonus(offer.permanent);
        state.save.payment.passUnlocked = true;
        state.save.payment.purchaseCount = Number(state.save.payment.purchaseCount || 0) + 1;
        state.save.payment.totalSpent = Math.round((Number(state.save.payment.totalSpent || 0) + Number(offer.price || 0)) * 100) / 100;
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
        const tierPromoted = beforeTier.id !== afterTier.id;
        const seasonReady = config.seasonPremiumTrack.filter((node) => !state.save.seasonClaimed.includes(`premium:${node.id}`) && state.save.seasonXp >= node.xp).length;
        saveProgress();
        showToast(
            tierPromoted
                ? text(`充值完成：${localize(offer.name)} 已到账，赞助档位提升到 ${localize(afterTier.title)}。${seasonReady > 0 ? ` 另有 ${seasonReady} 个赞助赛季奖励可领。` : ''}`, `Top-up complete: ${localize(offer.name)} granted and sponsor tier promoted to ${localize(afterTier.title)}.${seasonReady > 0 ? ` ${seasonReady} sponsor rewards are now ready.` : ''}`)
                : text(`充值完成：${localize(offer.name)} 奖励已到账。${seasonReady > 0 ? ` 当前有 ${seasonReady} 个赞助赛季奖励可领。` : ''}`, `Top-up complete: ${localize(offer.name)} rewards granted.${seasonReady > 0 ? ` ${seasonReady} sponsor season rewards are now ready.` : ''}`),
            'success'
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
            paymentVerificationError = text('这笔交易哈希（TXID）已经用过，不能重复发奖。', 'This TXID has already been used and cannot grant rewards again.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        const activeOrder = getActivePaymentOrderForSelectedOffer();

        if (!activeOrder) {
            paymentVerificationError = text('当前没有可校验的订单，请先创建订单。', 'There is no active order to verify. Please create one first.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        if (activeOrder.status === 'expired' || activeOrder.status === 'cancelled') {
            paymentVerificationError = text('当前订单已失效，请重新创建订单。', 'This order is no longer valid. Please create a new one.');
            paymentVerificationNotice = '';
            refreshPaymentVerificationState();
            return;
        }

        const orderId = activeOrder.id;
        paymentVerificationState = 'verifying';
        paymentVerificationError = '';
        paymentVerificationNotice = '';
        refreshPaymentVerificationState();

        try {
            const verificationResult = await verifyBackendPayment(orderId, txid);
            const orderPayload = verificationResult?.order || {};
            const resolvedOrder = buildClientPaymentOrder({
                ...activeOrder,
                ...orderPayload,
                txid: orderPayload?.txid || txid
            });
            const resolvedOfferId = String(resolvedOrder.offerId || activeOrder.offerId || selectedPaymentOfferId);
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
            } catch (error) {
                setCurrentPaymentOrder({ ...resolvedOrder, status: resolvedOrder.status || 'paid', rewardGranted: false, txid });
                paymentVerificationNotice = text('支付已校验通过，奖励已到账；后台入账确认会自动补齐。', 'Payment was verified and rewards were granted locally; backend claim confirmation will retry automatically.');
                saveProgress();
            }

            refreshPaymentVerificationState();
        } catch (error) {
            paymentVerificationState = 'idle';
            paymentVerificationNotice = '';
            paymentVerificationError = error?.message || text('支付校验失败，请稍后重试。', 'Payment verification failed. Please try again.');
            refreshPaymentVerificationState();
        }
    }

    function consumeSortieCost(chapter) {
        resetDailySortieWindow();
        if (state.save.freeSortiesUsedToday < getDailyFreeSortiesLimit()) {
            state.save.freeSortiesUsedToday += 1;
            showToast(text('\u6d88\u8017 1 \u6b21\u514d\u8d39\u51fa\u51fb\u3002', 'Consumed 1 free sortie.'), 'success');
            return true;
        }
        const cost = getSortieCost(chapter);
        if (state.save.credits < cost) {
            showToast(text('\u91d1\u5e01\u4e0d\u8db3\uff0c\u65e0\u6cd5\u7ee7\u7eed\u51fa\u51fb\u3002', 'Not enough credits for another sortie.'), 'warning');
            return false;
        }
        state.save.credits -= cost;
        showToast(text(`\u989d\u5916\u51fa\u51fb\u6d88\u8017 ${cost} \u91d1\u5e01\u3002`, `Extra sortie cost ${cost} credits.`), 'warning');
        return true;
    }

    function getStartSortieButtonLabel(chapterIndex) {
        const chapter = config.chapters[chapterIndex] || getSelectedChapter();
        resetDailySortieWindow();
        if (state.save.freeSortiesUsedToday < getDailyFreeSortiesLimit()) return text('\u5f00\u59cb\u51fa\u51fb', 'Start Sortie');
        return `${text('\u7ee7\u7eed\u51fa\u51fb', 'Continue')} \u00b7 ${getSortieCost(chapter)}`;
    }

    function getSortieCost(chapter) {
        if (!chapter) return config.battle.sortieCostByChapter.chapter1;
        const chapterKey = `chapter${Math.max(1, Number(chapter.chapter) || 1)}`;
        return config.battle.sortieCostByChapter[chapterKey]
            || config.battle.sortieCostByChapter.chapter4
            || config.battle.sortieCostByChapter.chapter3
            || config.battle.sortieCostByChapter.chapter2
            || config.battle.sortieCostByChapter.chapter1;
    }

    function getRemainingFreeSorties() {
        resetDailySortieWindow();
        return Math.max(0, getDailyFreeSortiesLimit() - state.save.freeSortiesUsedToday);
    }

    function getDailyFreeSortiesLimit() {
        return config.battle.freeSortiesPerDay + Number(getSponsorTier().dailyFreeSorties || 0);
    }

    function resetDailySortieWindow() {
        const key = getDayKey(Date.now());
        if (state.save.freeSortieDayKey !== key) {
            state.save.freeSortieDayKey = key;
            state.save.freeSortiesUsedToday = 0;
            applyDailyReviveGrant({ silent: true });
        }
    }

    function resetCraftDayWindow() {
        const key = getDayKey(Date.now());
        if (state.save.crafting.craftDayKey !== key) {
            state.save.crafting.craftDayKey = key;
            state.save.crafting.craftsToday = 0;
        }
    }

    function canClaimDailySupply() {
        return (Date.now() - Number(state.save.dailySupplyAt || 0)) >= DAILY_SUPPLY_COOLDOWN_MS;
    }

    function getDailySupplyCooldownText() {
        const remaining = Math.max(0, DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - Number(state.save.dailySupplyAt || 0)));
        if (!remaining) return text('可领取', 'Ready');
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}h ${minutes}m`;
    }

    function getCreditRewardMultiplier() {
        return 1
            + (getResearchLevel('bountyProtocol') * 0.04)
            + Number(getSponsorTier().creditYieldBonus || 0)
            + getPermanentBonusValue('creditYield');
    }

    function getAlloyRewardMultiplier() {
        return 1 + (getResearchLevel('bountyProtocol') * 0.03) + Number(getSponsorTier().alloyYieldBonus || 0) + getPermanentBonusValue('alloyYield');
    }

    function applyDailyReviveGrant({ silent = false } = {}) {
        const grant = Math.max(0, Number(config.battle.reviveChipDailyGrant || 0));
        if (!grant) return 0;
        const key = getDayKey(Date.now());
        if (state.save.reviveGrantDayKey === key) return 0;
        state.save.reviveGrantDayKey = key;
        state.save.reviveChips += grant;
        saveProgress();
        if (!silent) {
            showToast(text(`每日复活芯片 +${grant}`, `Daily revive chip +${grant}`), 'success');
        }
        return grant;
    }

    function applyPermanentBonus(permanent = {}) {
        const current = state.save.payment.permanent || {};
        state.save.payment.permanent = {
            attackBoost: roundBonus(current.attackBoost) + roundBonus(permanent.attackBoost),
            shieldBoost: roundBonus(current.shieldBoost) + roundBonus(permanent.shieldBoost),
            bossDamage: roundBonus(current.bossDamage) + roundBonus(permanent.bossDamage),
            alloyYield: roundBonus(current.alloyYield) + roundBonus(permanent.alloyYield),
            creditYield: roundBonus(current.creditYield) + roundBonus(permanent.creditYield)
        };
    }

    function getPermanentBonusValue(key) {
        return roundBonus(state.save.payment.permanent?.[key]);
    }

    function getCurrentPower() {
        const stats = getBattleStats();
        return Math.round(
            (stats.attack * 2.05)
            + (stats.maxShield * 0.38)
            + (stats.fireRate * 52)
            + (stats.speed * 34)
            + (stats.wingDamage * 1.4)
            + (stats.magnet * 0.36)
            + (stats.pierce * 44)
            + ((stats.bossDamageMultiplier - 1) * 120)
        );
    }

    function getBattleStats() {
        const chassis = chassisMap[state.save.selectedChassisId] || config.chassis[0];
        const chassisLevel = getUnitLevel(state.save.chassisLevels, chassis.id);
        const chassisStars = getUnitStar(state.save.chassisStars, chassis.id);
        const weaponLevel = getResearchLevel('weaponSync');
        const shieldLevel = getResearchLevel('shieldVolume');
        const energyLevel = getResearchLevel('energyLoop');
        const magnetLevel = getResearchLevel('magnetField');

        let attack = chassis.stats.attack * (1 + ((chassisLevel - 1) * 0.09) + ((chassisStars - 1) * 0.2) + (weaponLevel * 0.05));
        let fireRate = chassis.stats.fireRate * (1 + ((chassisLevel - 1) * 0.024) + (energyLevel * 0.016));
        let maxShield = chassis.stats.maxShield * (1 + ((chassisLevel - 1) * 0.08) + ((chassisStars - 1) * 0.22) + (shieldLevel * 0.05));
        let speed = chassis.stats.speed * (1 + ((chassisLevel - 1) * 0.008));
        let magnet = 32 + (magnetLevel * 16);
        let chargeRate = 1 + (energyLevel * 0.06);
        let critChance = 0.08;
        let critDamage = 1.6;
        let pierce = 0;
        let bossDamageMultiplier = 1;
        let wingDamage = 0;
        let regen = 0;

        state.save.selectedWingmen.forEach((wingId) => {
            if (!wingId || !wingmanMap[wingId]) return;
            const wingLevel = getUnitLevel(state.save.wingmanLevels, wingId);
            const wingStars = getUnitStar(state.save.wingmanStars, wingId);
            wingDamage += 12 + (wingLevel * 4) + (wingStars * 7);
            if (wingId === 'magnetWing') magnet += 18 + (wingLevel * 2);
            if (wingId === 'aegisWing') regen += 2 + (wingStars * 0.6);
            if (wingId === 'pierceWing') pierce += wingStars >= 3 ? 1 : 0;
            if (wingId === 'interceptorWing') attack *= 1.04 + (wingLevel * 0.004);
        });

        Object.entries(getEquippedModules()).forEach(([slot, module]) => {
            if (!module) return;
            const rarityScore = MODULE_RARITY_SCORE[module.rarity] || 1;
            if (slot === 'core') {
                attack *= 1 + (0.035 * rarityScore) + ((module.level - 1) * 0.02);
                critChance += (0.012 * rarityScore) + ((module.level - 1) * 0.01);
            }
            if (slot === 'weapon') {
                attack *= 1 + (0.028 * rarityScore);
                pierce += Math.floor((rarityScore + 1) / 2);
            }
            if (slot === 'shield') {
                maxShield *= 1 + (0.05 * rarityScore) + ((module.level - 1) * 0.018);
                regen += 0.6 * rarityScore;
            }
            if (slot === 'boss') {
                bossDamageMultiplier += (0.06 * rarityScore) + ((module.level - 1) * 0.025);
            }
        });

        attack *= 1 + getPermanentBonusValue('attackBoost');
        maxShield *= 1 + getPermanentBonusValue('shieldBoost');
        bossDamageMultiplier += getPermanentBonusValue('bossDamage');

        return {
            attack,
            fireRate,
            maxShield,
            speed,
            magnet,
            chargeRate,
            critChance,
            critDamage,
            pierce,
            bossDamageMultiplier,
            wingDamage,
            regen
        };
    }

    function getSelectedChapter() {
        return chapterMap[state.save.selectedChapterId] || config.chapters[0];
    }

    function getChapterIndex(chapterId) {
        return config.chapters.findIndex((item) => item.id === chapterId);
    }

    function isChapterUnlocked(index) {
        return index <= state.save.unlockedChapterIndex;
    }

    function isChapterClearedOrReached(chapterId) {
        const index = getChapterIndex(chapterId);
        return index >= 0 && state.save.unlockedChapterIndex >= index;
    }

    function getHighestClearedChapterIndex() {
        const clearedIndexes = state.save.clearedChapters
            .map((item) => getChapterIndex(item))
            .filter((item) => item >= 0);
        return clearedIndexes.length ? Math.max(...clearedIndexes) : -1;
    }

    function isWingSlotUnlocked(slotIndex) {
        const chapterId = WING_SLOT_UNLOCK_STAGES[slotIndex] || '1-1';
        return isChapterClearedOrReached(chapterId);
    }

    function canEquipWing(slotIndex, wingmanId) {
        if (!wingmanMap[wingmanId] || !isWingSlotUnlocked(slotIndex)) return false;
        if (!isChapterClearedOrReached(wingmanMap[wingmanId].unlockStage)) return false;
        const otherIndex = slotIndex === 0 ? 1 : 0;
        return state.save.selectedWingmen[otherIndex] !== wingmanId;
    }

    function getUnitLevel(levelMap, unitId) {
        return clampNumber(levelMap[unitId], 1, 1, 999);
    }

    function getUnitStar(starMap, unitId) {
        return clampNumber(starMap[unitId], 1, 1, 5);
    }

    function getUnitUpgradeCost(type, unitId, currentLevel) {
        if (type === 'wingman') {
            return Math.round(config.upgradeCurves.wingmanCreditBase * Math.pow(config.upgradeCurves.wingmanCreditGrowth, Math.max(0, currentLevel - 1)));
        }
        return Math.round(config.upgradeCurves.chassisCreditBase * Math.pow(config.upgradeCurves.chassisCreditGrowth, Math.max(0, currentLevel - 1)));
    }

    function getStarUpgradeCost(currentStars) {
        return config.starUpgrades.find((item) => item.from === currentStars) || null;
    }

    function getShardCount(unitId) {
        return clampNumber(state.save.shardInventory[unitId], 0, 0, 999999);
    }

    function addShards(unitId, amount) {
        state.save.shardInventory[unitId] = Math.max(0, getShardCount(unitId) + Math.round(Number(amount) || 0));
    }

    function canStarUnit(unitId, currentStars) {
        const cost = getStarUpgradeCost(currentStars);
        if (!cost) return false;
        return state.save.credits >= cost.credits && state.save.alloy >= cost.alloy && getShardCount(unitId) >= cost.shards;
    }

    function getResearchLevel(researchId) {
        return clampNumber(state.save.researchLevels[researchId], 0, 0, 999);
    }

    function getResearchAlloyBase(researchId) {
        if (researchId === 'weaponSync') return 24;
        if (researchId === 'shieldVolume') return 24;
        if (researchId === 'energyLoop') return 30;
        if (researchId === 'magnetField') return 18;
        if (researchId === 'bountyProtocol') return 28;
        return 24;
    }

    function getResearchCreditBase(researchId) {
        if (researchId === 'weaponSync') return 120;
        if (researchId === 'shieldVolume') return 120;
        if (researchId === 'energyLoop') return 150;
        if (researchId === 'magnetField') return 90;
        if (researchId === 'bountyProtocol') return 140;
        return 120;
    }

    function getResearchCreditGrowth(researchId) {
        if (researchId === 'weaponSync') return 1.29;
        if (researchId === 'shieldVolume') return 1.29;
        if (researchId === 'energyLoop') return 1.3;
        if (researchId === 'magnetField') return 1.26;
        if (researchId === 'bountyProtocol') return 1.31;
        return 1.29;
    }

    function getResearchCost(researchId) {
        const research = researchMap[researchId];
        const level = getResearchLevel(researchId);
        return {
            credits: Math.round(getResearchCreditBase(researchId) * Math.pow(getResearchCreditGrowth(researchId), level)),
            coreChips: Math.round(research.baseCost * Math.pow(research.growth, level)),
            alloy: Math.round(getResearchAlloyBase(researchId) * Math.pow(1.34, level))
        };
    }

    function formatResearchCost(cost, short = false) {
        if (!cost) return '--';
        if (short) {
            return state.lang === 'en'
                ? `${formatCompact(cost.credits)}Cr / ${cost.coreChips}Ch / ${cost.alloy}Al`
                : `${formatCompact(cost.credits)}币 / ${cost.coreChips}芯 / ${cost.alloy}合`;
        }
        return state.lang === 'en'
            ? `${formatCompact(cost.credits)} credits / ${cost.coreChips} chips / ${cost.alloy} alloy`
            : `${formatCompact(cost.credits)} 金币 / ${cost.coreChips} 芯片 / ${cost.alloy} 合金`;
    }

    function canUpgradeResearch(researchId) {
        const research = researchMap[researchId];
        if (!research) return false;
        const level = getResearchLevel(researchId);
        if (level >= research.maxLevel) return false;
        const cost = getResearchCost(researchId);
        return state.save.credits >= cost.credits && state.save.coreChips >= cost.coreChips && state.save.alloy >= cost.alloy;
    }

    function getResearchEffectText(researchId, level) {
        if (researchId === 'weaponSync') return `+${Math.round(level * 5)}%`;
        if (researchId === 'shieldVolume') return `+${Math.round(level * 6)}%`;
        if (researchId === 'energyLoop') return `+${Math.round(level * 6)}%`;
        if (researchId === 'magnetField') return `+${level * 16}px`;
        if (researchId === 'bountyProtocol') return `+${Math.round(level * 4)}%`;
        return '--';
    }

    function getResearchRoleText(researchId) {
        if (researchId === 'weaponSync') return text('直接提升全队攻击，是打精英和 Boss 最稳定的永久战力。', 'Directly raises squad attack and is the steadiest permanent damage gain for elites and bosses.');
        if (researchId === 'shieldVolume') return text('直接提升最大护盾，长时间战斗和 Boss 爆发更容易扛过。', 'Directly raises max shield so long runs and boss bursts are much safer.');
        if (researchId === 'energyLoop') return text('直接提升技能充能速度，意味着每局会多出更多爆发窗口。', 'Directly speeds up skill charge, which means more burst windows per run.');
        if (researchId === 'magnetField') return text('直接扩大收取范围，让资源回收和续航都更稳定。', 'Directly expands pickup radius so resource collection and sustain are more stable.');
        if (researchId === 'bountyProtocol') return text('直接提高关卡金币与合金收益，会加速后续一切升级与制造。', 'Directly raises stage credits and alloy income, which speeds up every later upgrade and craft.');
        return text('研究效果会直接映射到出击属性上。', 'Research effects feed directly into sortie combat stats.');
    }

    function canUseFreeCraft() {
        resetCraftDayWindow();
        return state.save.crafting.freeDayKey !== getDayKey(Date.now());
    }

    function getEpicPityTarget() {
        const baseTarget = Number(config.moduleCrafting.epicPity || 0);
        const discount = Number(getSponsorTier().epicPityBonus || 0);
        return Math.max(4, Math.round(baseTarget * (1 - discount)));
    }

    function getCraftCost() {
        resetCraftDayWindow();
        if (canUseFreeCraft()) return { free: true, credits: 0, alloy: 0 };
        const surged = (state.save.crafting.craftsToday || 0) >= config.moduleCrafting.surgeAfterCrafts;
        return {
            free: false,
            credits: surged ? config.moduleCrafting.surgeCreditCost : config.moduleCrafting.baseCreditCost,
            alloy: surged ? config.moduleCrafting.surgeAlloyCost : config.moduleCrafting.baseAlloyCost
        };
    }

    function getCraftCostLabel() {
        const cost = getCraftCost();
        return cost.free ? text('免费', 'Free') : `${cost.credits} / ${cost.alloy}`;
    }

    function canCraftModule() {
        const cost = getCraftCost();
        return cost.free || (state.save.credits >= cost.credits && state.save.alloy >= cost.alloy);
    }

    function rollModuleRarity() {
        const forcedEpic = (state.save.crafting.epicPity + 1) >= getEpicPityTarget();
        const forcedRare = (state.save.crafting.rarePity + 1) >= config.moduleCrafting.rarePity;
        const roll = Math.random() * 100;

        if (forcedEpic) return roll < 18 ? 'legend' : 'epic';
        if (forcedRare) return roll < 15 ? 'epic' : 'rare';
        if (roll < 0.6) return 'legend';
        if (roll < 4) return 'epic';
        if (roll < 22) return 'rare';
        return 'common';
    }

    function getEquippedModules() {
        return {
            core: getEquippedModuleBySlot('core'),
            weapon: getEquippedModuleBySlot('weapon'),
            shield: getEquippedModuleBySlot('shield'),
            boss: getEquippedModuleBySlot('boss')
        };
    }

    function getEquippedModuleBySlot(slot) {
        const uid = state.save.selectedModules[slot];
        if (!uid) return null;
        const module = state.save.moduleInventory.find((item) => item.uid === uid);
        return module || null;
    }

    function getModuleSlotLabel(slot) {
        if (slot === 'core') return text('核心槽', 'Core Slot');
        if (slot === 'weapon') return text('武器槽', 'Weapon Slot');
        if (slot === 'shield') return text('护盾槽', 'Shield Slot');
        if (slot === 'boss') return text('Boss 槽', 'Boss Slot');
        return text('模组槽', 'Module Slot');
    }

    function getModuleUpgradeCost(module) {
        return {
            credits: Math.round(config.upgradeCurves.moduleCreditBase * Math.pow(config.upgradeCurves.moduleCreditGrowth, Math.max(0, (module.level || 1) - 1))),
            alloy: Math.max(4, 4 + ((module.level || 1) * 2))
        };
    }

    function getModuleChipCost(module) {
        if (module.rarity === 'legend') return Math.max(2, module.level);
        if (module.rarity === 'epic') return Math.max(1, Math.floor((module.level + 1) / 2));
        return 0;
    }

    function canUpgradeModule(module) {
        const cost = getModuleUpgradeCost(module);
        return state.save.credits >= cost.credits && state.save.alloy >= cost.alloy && state.save.coreChips >= getModuleChipCost(module);
    }

    function getMissionProgress(missionId) {
        switch (missionId) {
            case 'm1': return state.save.stats.sorties;
            case 'm2': return state.save.stats.eliteKills;
            case 'm3': return isWingSlotUnlocked(1) ? 1 : 0;
            case 'm4': return Math.max(0, getHighestClearedChapterIndex() + 1);
            case 'm5': return getUnitLevel(state.save.chassisLevels, state.save.selectedChassisId);
            case 'm6': return state.save.stats.rareCrafts;
            case 'm7': return Math.max(0, getHighestClearedChapterIndex() + 1);
            case 'm8': return countThreeStarUnits();
            case 'm9': return state.save.stats.bossesKilled;
            case 'm10': return Math.max(0, getHighestClearedChapterIndex() + 1);
            case 'm11': return Math.max(0, getHighestClearedChapterIndex() + 1);
            case 'm12': return countOwnedModulesByMinimumRarity('epic');
            case 'm13': return getTotalResearchLevels();
            case 'm14': return getHighestChassisLevel();
            case 'm15': return Math.max(0, getHighestClearedChapterIndex() + 1);
            default: return 0;
        }
    }

    function getMissionHint(missionId) {
        switch (missionId) {
            case 'm1': return text('Use your first three free sorties to learn the drag-dodge rhythm.', 'Use your first three free sorties to learn the drag-dodge rhythm.');
            case 'm2': return text('Elites arrive three times during a run.', 'Elites arrive three times during a run.');
            case 'm3': return text('Clearing 1-2 unlocks the second wing slot.', 'Clearing 1-2 unlocks the second wing slot.');
            case 'm4': return text('After 1-3, the first real power wall starts forming.', 'After 1-3, the first real power wall starts forming.');
            case 'm5': return text('Chassis levels are always your most direct power gain.', 'Chassis levels are always your most direct power gain.');
            case 'm6': return text('Use the free craft, then craft a few more to start seeing rare modules.', 'Use the free craft, then craft a few more to start seeing rare modules.');
            case 'm7': return text('2-2 is the first real alloy pressure wall.', '2-2 is the first real alloy pressure wall.');
            case 'm8': return text('Push the chassis and both wingmen to 3 stars.', 'Push the chassis and both wingmen to 3 stars.');
            case 'm9': return text('The first boss is the key test for your early hangar.', 'The first boss is the key test for your early hangar.');
            case 'm10': return text('3-3 is the first full-version finish line before late-game chapters begin.', '3-3 is the first full-version finish line before late-game chapters begin.');
            case 'm11': return text('4-1 starts checking shield, levels, and whether your daily investment kept up.', '4-1 starts checking shield, levels, and whether your daily investment kept up.');
            case 'm12': return text('Epic modules mostly come from pity cycles, higher season rewards, and premium packs.', 'Epic modules mostly come from pity cycles, higher season rewards, and premium packs.');
            case 'm13': return text('Research is permanent growth that directly improves combat stats and farming efficiency.', 'Research is permanent growth that directly improves combat stats and farming efficiency.');
            case 'm14': return text('Chassis levels are the most stable late-game power source and the cheapest wall breaker.', 'Chassis levels are the most stable late-game power source and the cheapest wall breaker.');
            case 'm15': return text('4-3 is the current endgame wall and wants a high-star chassis, boss damage, and epic modules.', '4-3 is the current endgame wall and wants a high-star chassis, boss damage, and epic modules.');
            default: return text('Keep pushing.', 'Keep pushing.');
        }
    }

    function countThreeStarUnits() {
        const unitIds = [
            ...config.chassis.map((item) => item.id),
            ...config.wingmen.map((item) => item.id)
        ];
        return unitIds.reduce((count, unitId) => {
            const stars = state.save.chassisStars[unitId] || state.save.wingmanStars[unitId] || 1;
            return count + (stars >= 3 ? 1 : 0);
        }, 0);
    }

    function countOwnedModulesByMinimumRarity(minimumRarity) {
        const minimumScore = MODULE_RARITY_SCORE[minimumRarity] || 0;
        return state.save.moduleInventory.reduce((count, module) => count + ((MODULE_RARITY_SCORE[module.rarity] || 0) >= minimumScore ? 1 : 0), 0);
    }

    function getTotalResearchLevels() {
        return config.research.reduce((total, item) => total + getResearchLevel(item.id), 0);
    }

    function getHighestChassisLevel() {
        return config.chassis.reduce((highest, item) => Math.max(highest, getUnitLevel(state.save.chassisLevels, item.id)), 1);
    }

    function getClaimableMissionCount() {
        return config.missions.filter((mission) => !state.save.missionClaimed.includes(mission.id) && getMissionProgress(mission.id) >= mission.target).length;
    }

    function getClaimableSeasonCount() {
        let total = config.seasonFreeTrack.filter((node) => !state.save.seasonClaimed.includes(`free:${node.id}`) && state.save.seasonXp >= node.xp).length;
        if (isSeasonPassUnlocked()) {
            total += config.seasonPremiumTrack.filter((node) => !state.save.seasonClaimed.includes(`premium:${node.id}`) && state.save.seasonXp >= node.xp).length;
        }
        return total;
    }

    function isSeasonPassUnlocked() {
        return !!state.save.payment.passUnlocked;
    }

    function getSponsorTier() {
        const claimed = Object.keys(state.save.payment.claimedOrders || {}).length;
        const purchaseCount = Math.max(Number(state.save.payment.purchaseCount || 0), claimed);
        const totalSpent = Math.max(0, Number(state.save.payment.totalSpent || 0));
        return [...config.sponsorTiers].reverse().find((item) => {
            const byCount = purchaseCount >= Number(item.threshold || 0);
            const bySpend = totalSpent >= Number(item.spendThreshold ?? Number.MAX_SAFE_INTEGER);
            return byCount || bySpend;
        }) || config.sponsorTiers[0];
    }

    function getRewardText(reward) {
        const parts = [];
        if (reward.credits) parts.push(`+${reward.credits} ${text('金币', 'credits')}`);
        if (reward.alloy) parts.push(`+${reward.alloy} ${text('合金', 'alloy')}`);
        if (reward.coreChips) parts.push(`+${reward.coreChips} ${text('核芯', 'chips')}`);
        if (reward.seasonXp) parts.push(`+${reward.seasonXp} XP`);
        if (reward.reviveChips) parts.push(`+${reward.reviveChips} ${text('复活芯片', 'revive chips')}`);
        if (reward.chassisShards) parts.push(`+${reward.chassisShards} ${text('主机碎片', 'chassis shards')}`);
        if (reward.wingmanShards) parts.push(`+${reward.wingmanShards} ${text('翼机碎片', 'wing shards')}`);
        if (reward.epicModuleCrates) parts.push(`+${reward.epicModuleCrates} ${text('史诗模组箱', 'epic module crate')}`);
        if (reward.legendModuleCrates) parts.push(`+${reward.legendModuleCrates} ${text('传说模组箱', 'legend module crate')}`);
        return parts.join(' · ');
    }

    function getOfferImpactText(offer) {
        if (offer.id === 'starter') return text('Best for unlocking dual-wing tempo, clearing 1-3, and opening sponsor season value.', 'Best for unlocking dual-wing tempo, clearing 1-3, and opening sponsor season value.');
        if (offer.id === 'accelerator') return text('Best for solving early Chapter 2 alloy and research shortages so daily growth keeps pace.', 'Best for solving early Chapter 2 alloy and research shortages so daily growth keeps pace.');
        if (offer.id === 'rush') return text('Best for breaking the 2-3 to 3-1 pierce wall and stabilizing midgame modules fast.', 'Best for breaking the 2-3 to 3-1 pierce wall and stabilizing midgame modules fast.');
        if (offer.id === 'sovereign') return text('Best for Chapter 3 boss walls and the survival pressure before 4-1, with better sustain and boss damage.', 'Best for Chapter 3 boss walls and the survival pressure before 4-1, with better sustain and boss damage.');
        return text('Best for Chapter 4 endgame walls, epic module catch-up, and shorter late pity cycles.', 'Best for Chapter 4 endgame walls, epic module catch-up, and shorter late pity cycles.');
    }

    function getRecommendedOfferId() {
        const chapter = getSelectedChapter();
        const power = getCurrentPower();
        const gap = chapter.recommended - power;
        const epicModules = countOwnedModulesByMinimumRarity('epic');
        if (chapter.chapter <= 1) return 'starter';
        if (chapter.chapter === 2) return gap > 900 ? 'rush' : 'accelerator';
        if (chapter.chapter === 3) {
            if (gap > 1700 || epicModules <= 0) return 'sovereign';
            return 'rush';
        }
        if (gap > 2200 || epicModules < 2) return 'nexus';
        return 'sovereign';
    }

    function getShardSummaryText(shardReward) {
        const parts = Object.entries(shardReward || {}).map(([unitId, amount]) => {
            const unit = chassisMap[unitId] || wingmanMap[unitId];
            return `${localize(unit.name)} +${amount}`;
        });
        return parts.join(' · ');
    }

    function getNextUnlockedChapterId(currentChapterId) {
        const nextIndex = getChapterIndex(currentChapterId) + 1;
        if (nextIndex < 0 || nextIndex >= config.chapters.length) return '';
        return isChapterUnlocked(nextIndex) ? config.chapters[nextIndex].id : '';
    }

    function localizeRarity(rarity) {
        if (rarity === 'common') return text('普通', 'Common');
        if (rarity === 'rare') return text('稀有', 'Rare');
        if (rarity === 'epic') return text('史诗', 'Epic');
        if (rarity === 'legend') return text('传说', 'Legend');
        return rarity;
    }

    function getStarsText(stars) {
        return '★'.repeat(Math.max(1, stars));
    }

    function createBattleState() {
        return {
            active: false,
            chapterId: '',
            chapter: null,
            stats: null,
            player: null,
            bullets: [],
            enemies: [],
            enemyShots: [],
            pickups: [],
            floats: [],
            time: 0,
            charge: 0,
            fireCooldown: 0,
            nextSpawnAt: 0,
            nextEliteIndex: 0,
            nextUpgradeIndex: 0,
            bossSpawned: false,
            bossDefeated: false,
            collectedCredits: 0,
            collectedAlloy: 0,
            eliteKills: 0,
            score: 0,
            pointerActive: false,
            pointerX: 160,
            pointerY: 300,
            viewportWidth: 0,
            viewportHeight: 0,
            lastFrameAt: 0,
            rafId: 0,
            pausedByVisibility: false,
            notice: null,
            pendingPerks: [],
            mods: {
                volley: false
            },
            result: null
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
            selectedWingmen: Array.isArray(save?.selectedWingmen) ? save.selectedWingmen.slice(0, 2) : base.selectedWingmen.slice(),
            selectedModules: { ...base.selectedModules, ...(save?.selectedModules || {}) },
            chassisLevels: { ...(save?.chassisLevels || {}) },
            chassisStars: { ...(save?.chassisStars || {}) },
            wingmanLevels: { ...(save?.wingmanLevels || {}) },
            wingmanStars: { ...(save?.wingmanStars || {}) },
            shardInventory: { ...base.shardInventory, ...(save?.shardInventory || {}) },
            researchLevels: { ...(save?.researchLevels || {}) },
            crafting: { ...base.crafting, ...(save?.crafting || {}) },
            stats: { ...base.stats, ...(save?.stats || {}) },
            payment: { ...base.payment, ...(save?.payment || {}) },
            moduleInventory: Array.isArray(save?.moduleInventory) ? save.moduleInventory.map(normalizeModule).filter(Boolean) : base.moduleInventory.map(normalizeModule).filter(Boolean),
            missionClaimed: Array.isArray(save?.missionClaimed) ? Array.from(new Set(save.missionClaimed)) : [],
            seasonClaimed: Array.isArray(save?.seasonClaimed) ? Array.from(new Set(save.seasonClaimed)) : [],
            clearedChapters: Array.isArray(save?.clearedChapters) ? Array.from(new Set(save.clearedChapters.filter((item) => chapterMap[item]))) : []
        };

        next.tab = tabMap[next.tab] ? next.tab : 'sortie';
        next.selectedChapterId = chapterMap[next.selectedChapterId] ? next.selectedChapterId : base.selectedChapterId;
        next.selectedChassisId = chassisMap[next.selectedChassisId] ? next.selectedChassisId : base.selectedChassisId;
        while (next.selectedWingmen.length < 2) next.selectedWingmen.push('');
        next.selectedWingmen = next.selectedWingmen.map((wingId, index) => canEquipWingNormalized(next, index, wingId) ? wingId : '');
        next.selectedModules = Object.fromEntries(Object.keys(base.selectedModules).map((slot) => [slot, typeof next.selectedModules[slot] === 'string' ? next.selectedModules[slot] : '']));

        next.credits = clampNumber(next.credits, base.credits, 0, Number.MAX_SAFE_INTEGER);
        next.alloy = clampNumber(next.alloy, base.alloy, 0, Number.MAX_SAFE_INTEGER);
        next.coreChips = clampNumber(next.coreChips, base.coreChips, 0, Number.MAX_SAFE_INTEGER);
        next.seasonXp = clampNumber(next.seasonXp, base.seasonXp, 0, Number.MAX_SAFE_INTEGER);
        next.reviveChips = clampNumber(next.reviveChips, base.reviveChips, 0, Number.MAX_SAFE_INTEGER);
        next.unlockedChapterIndex = clampNumber(next.unlockedChapterIndex, base.unlockedChapterIndex, 0, config.chapters.length - 1);
        next.freeSortieDayKey = typeof next.freeSortieDayKey === 'string' ? next.freeSortieDayKey : '';
        next.reviveGrantDayKey = typeof next.reviveGrantDayKey === 'string' ? next.reviveGrantDayKey : '';
        next.freeSortiesUsedToday = clampNumber(next.freeSortiesUsedToday, 0, 0, 999);
        next.dailySupplyAt = Math.max(0, Number(next.dailySupplyAt) || 0);
        next.crafting.totalCrafts = clampNumber(next.crafting.totalCrafts, 0, 0, Number.MAX_SAFE_INTEGER);
        next.crafting.craftsToday = clampNumber(next.crafting.craftsToday, 0, 0, Number.MAX_SAFE_INTEGER);
        next.crafting.freeDayKey = typeof next.crafting.freeDayKey === 'string' ? next.crafting.freeDayKey : '';
        next.crafting.craftDayKey = typeof next.crafting.craftDayKey === 'string' ? next.crafting.craftDayKey : '';
        next.crafting.rarePity = clampNumber(next.crafting.rarePity, 0, 0, config.moduleCrafting.rarePity);
        next.crafting.epicPity = clampNumber(next.crafting.epicPity, 0, 0, config.moduleCrafting.epicPity);
        next.payment.minerId = typeof next.payment.minerId === 'string' ? next.payment.minerId : '';
        next.payment.claimedOrders = next.payment.claimedOrders && typeof next.payment.claimedOrders === 'object' ? { ...next.payment.claimedOrders } : {};
        next.payment.pendingClaims = next.payment.pendingClaims && typeof next.payment.pendingClaims === 'object' ? { ...next.payment.pendingClaims } : {};
        next.payment.verifiedTxids = Array.isArray(next.payment.verifiedTxids) ? Array.from(new Set(next.payment.verifiedTxids.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))) : [];
        next.payment.purchaseCount = clampNumber(next.payment.purchaseCount, 0, 0, Number.MAX_SAFE_INTEGER);
        next.payment.totalSpent = Math.max(0, Number(next.payment.totalSpent) || 0);
        next.payment.lastPayAddress = typeof next.payment.lastPayAddress === 'string' ? next.payment.lastPayAddress : '';
        next.payment.permanent = {
            attackBoost: roundBonus(next.payment.permanent?.attackBoost),
            shieldBoost: roundBonus(next.payment.permanent?.shieldBoost),
            bossDamage: roundBonus(next.payment.permanent?.bossDamage),
            alloyYield: roundBonus(next.payment.permanent?.alloyYield),
            creditYield: roundBonus(next.payment.permanent?.creditYield)
        };
        next.payment.passUnlocked = !!next.payment.passUnlocked;
        if (!next.moduleInventory.length) {
            next.moduleInventory = STARTER_MODULES.map(normalizeModule).filter(Boolean);
        }
        return next;
    }

    function normalizeModule(module) {
        if (!module || !moduleMap[module.id]) return null;
        return {
            uid: String(module.uid || createUid('mod')),
            id: String(module.id),
            rarity: ['common', 'rare', 'epic', 'legend'].includes(module.rarity) ? module.rarity : 'common',
            level: clampNumber(module.level, 1, 1, 99)
        };
    }

    function createBaseSave() {
        const base = clone(config.baseSave);
        return {
            ...base,
            tab: 'sortie',
            credits: base.credits,
            alloy: base.alloy,
            coreChips: base.coreChips,
            seasonXp: base.seasonXp,
            reviveChips: base.reviveChips,
            reviveGrantDayKey: '',
            selectedWingmen: ['interceptorWing', ''],
            selectedModules: { core: '', weapon: '', shield: '', boss: '' },
            shardInventory: {
                pulseFrame: 24,
                interceptorWing: 18,
                pierceWing: 6
            },
            moduleInventory: STARTER_MODULES.map(normalizeModule).filter(Boolean),
            crafting: {
                totalCrafts: 0,
                craftsToday: 0,
                freeDayKey: '',
                craftDayKey: '',
                rarePity: 0,
                epicPity: 0
            },
            stats: {
                sorties: 0,
                wins: 0,
                eliteKills: 0,
                bossesKilled: 0,
                rareCrafts: 0,
                epicCrafts: 0
            },
            lastResult: null,
            payment: {
                ...base.payment,
                purchaseCount: 0,
                totalSpent: 0,
                lastPayAddress: '',
                permanent: {
                    attackBoost: 0,
                    shieldBoost: 0,
                    bossDamage: 0,
                    alloyYield: 0,
                    creditYield: 0
                },
                passUnlocked: false
            }
        };
    }

    function saveProgress() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch (error) {}
    }

    function canEquipWingNormalized(saveState, slotIndex, wingId) {
        if (!wingId || !wingmanMap[wingId]) return false;
        const unlockIndex = getChapterIndex(wingmanMap[wingId].unlockStage);
        if (saveState.unlockedChapterIndex < unlockIndex) return false;
        if (slotIndex === 1 && saveState.unlockedChapterIndex < getChapterIndex('1-2')) return false;
        return true;
    }

    function showToast(message, tone = '') {
        if (!ui.toast) return;
        ui.toast.textContent = message;
        ui.toast.dataset.tone = tone;
        ui.toast.classList.add('show');
        clearTimeout(state.toastTimer);
        state.toastTimer = window.setTimeout(() => {
            ui.toast.classList.remove('show');
        }, 1800);
    }

    function createUid(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function readLang() {
        try {
            return localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh';
        } catch (error) {
            return 'zh';
        }
    }

    function localize(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value[state.lang] || value.zh || value.en || '';
    }

    const DRONE_SQUAD_ZH_TEXT_FALLBACKS = {
        '2-2 is the first real alloy pressure wall.': '2-2 是第一个真正吃合金的卡点。',
        '3-3 is the first full-version finish line before late-game chapters begin.': '3-3 是前中期完整内容的第一条终点线，之后进入后期章节。',
        '4-1 starts checking shield, levels, and whether your daily investment kept up.': '4-1 开始同时检查护盾、等级和每日投入是否跟上。',
        '4-3 is the current endgame wall and wants a high-star chassis, boss damage, and epic modules.': '4-3 是当前终局卡点，需要高星主机、首领增伤和史诗模组。',
        'After 1-3, the first real power wall starts forming.': '通关 1-3 后，第一道真正的战力墙开始形成。',
        'Alloy': '合金',
        'Alloy Yield': '合金收益',
        'Attack': '攻击',
        'Available to every player.': '所有玩家都可领取。',
        'Back To Hangar': '返回机库',
        'Backup': '备补',
        'Best for breaking the 2-3 to 3-1 pierce wall and stabilizing midgame modules fast.': '最适合突破 2-3 到 3-1 的穿透卡点，并快速稳住中期模组强度。',
        'Best for Chapter 3 boss walls and the survival pressure before 4-1, with better sustain and boss damage.': '最适合第 3 章 Boss 卡点与 4-1 前的生存压力，续航和 Boss 伤害提升更明显。',
        'Best for Chapter 4 endgame walls, epic module catch-up, and shorter late pity cycles.': '最适合第 4 章终局卡点、史诗模组追赶，以及缩短后期保底周期。',
        'Best for solving early Chapter 2 alloy and research shortages so daily growth keeps pace.': '最适合解决第 2 章前期的合金与研究短缺，让日常成长不断档。',
        'Best for unlocking dual-wing tempo, clearing 1-3, and opening sponsor season value.': '最适合解锁双翼节奏、通关 1-3，并开启赞助赛季收益。',
        'Boss': '首领',
        'Boss Dmg': '首领增伤',
        'Boss Slot': '首领槽',
        'Buy Now': '立即购买',
        'Cast Skill': '释放技能',
        'Chapter Route': '章节部署',
        'Chassis': '主机',
        'Chassis Fleet': '主机编队',
        'Chassis levels are always your most direct power gain.': '主机等级始终是最直接的战力提升。',
        'Chassis levels are the most stable late-game power source and the cheapest wall breaker.': '主机等级是后期最稳定、也最便宜的破墙战力来源。',
        'Chips / Alloy': '芯片 / 合金',
        'Claim': '领取',
        'Claim Reward': '领取奖励',
        'Claim Supply': '领取补给',
        'Claimed': '已领取',
        'Clearing 1-2 unlocks the second wing slot.': '通关 1-2 后解锁第二个僚机位。',
        'Cooldown': '冷却',
        'Core': '核芯',
        'Craft Now': '立即制造',
        'Credits': '金币',
        'Current': '当前',
        'Current Cost': '当前消耗',
        'Current Wall': '当前卡点',
        'Daily Free Supply': '每日免费补给',
        'Elites arrive three times during a run.': '一局内会出现三次精英敌人。',
        'Empty Slot': '空槽位',
        'Epic': '史诗',
        'Epic modules mostly come from pity cycles, higher season rewards, and premium packs.': '史诗模组主要来自保底循环、更高赛季奖励和付费礼包。',
        'Epic Pity': '史诗保底',
        'Equip any unlocked wingman': '可装任意已解锁僚机',
        'Equipped Modules': '已装模组',
        'Extra': '额外',
        'First Clear Pack': '首通奖励',
        'First clear reward already secured.': '首通奖励已领取。',
        'First Top-Up': '首充解锁',
        'Focus': '焦点',
        'Free': '免费',
        'Free Ready': '免费可用',
        'Free supply, soft-currency items, and premium packs all live here.': '免费补给、软通货道具和付费礼包都在这里。',
        'Free Track': '免费路线',
        'Gap': '差距',
        'Growth Route': '成长路线',
        'Hangar Overview': '机库总览',
        'Keep pushing.': '继续推进。',
        'Latest Report': '最近战报',
        'Left Wing': '左翼',
        'Legend': '传说',
        'Locked': '未解锁',
        'Lv': '等级',
        'Manage Modules': '管理模组',
        'Max': '满级',
        'Maxed': '已满级',
        'Missions': '任务',
        'Module': '模组',
        'Module Crafting': '模组制造',
        'Module Inventory': '模组仓库',
        'Modules': '模组',
        'Next Cost': '下级消耗',
        'No battle report yet. Launch your first sortie.': '暂无战报，先开始第一次出击。',
        'No modules yet. Start with your free craft.': '还没有模组，先使用免费制造。',
        'Only claimable, near-finished, and long-term goals stay here.': '这里只保留可领、快完成和长期目标。',
        'Open Blueprints': '前往蓝图',
        'Open Hangar': '前往机库',
        'Open Payment': '前往支付',
        'Open Recommended Pack': '打开推荐礼包',
        'Open Season': '前往赛季',
        'Packs use verified on-chain orders and grant resources plus permanent boosts right away.': '礼包使用链上校验订单，到账后会立即发放资源与永久加成。',
        'Paid Today': '今日付费',
        'Pending': '待领取',
        'Permanent Blueprints': '常驻蓝图',
        'Power': '战力',
        'Prep': '备战',
        'Pressure': '压力',
        'Primary': '主补',
        'Progress': '进度',
        'Protocol Missions': '协议任务',
        'Push the chassis and both wingmen to 3 stars.': '把主机和两台僚机都推到 3 星。',
        'Rare Pity': '稀有保底',
        'Ready': '就绪',
        'Recommended': '推荐',
        'Research': '研究',
        'Research feeds directly back into sortie damage, shield, skill charge, and farming.': '研究会直接提升出击伤害、护盾、技能充能和养成效率。',
        'Research is permanent growth that directly improves combat stats and farming efficiency.': '研究属于永久成长，会直接提升战斗属性和养成效率。',
        'Revive': '复活芯片',
        'Right Wing': '右翼',
        'Safety': '保障',
        'Season': '赛季',
        'Season Route': '赛季路线',
        'Season XP': '赛季经验',
        'Shield': '护盾',
        'Skill': '技能',
        'Sorties': '出击',
        'Sorties, elite kills, and boss clears all charge your season route.': '出击、精英击杀和 Boss 击破都会推进赛季路线。',
        'Sponsor': '赞助',
        'Sponsor Packs': '赞助礼包',
        'Sponsor Status': '赞助状态',
        'Sponsor Track': '赞助路线',
        'Stage': '关卡',
        'Stage Intel': '关卡情报',
        'Standby': '待命',
        'Status': '状态',
        'Supply': '补给',
        'Supply Hub': '补给中心',
        'The first boss is the key test for your early hangar.': '第一个 Boss 是检验前期机库强度的关键。',
        'This panel shows your lasting top-up impact: tier, season access, and permanent bonuses.': '这里展示充值后的长期收益：档位、赛季权益和永久加成。',
        'Tier': '档位',
        'Unlock Sponsor': '解锁赞助',
        'Unlocked': '已解锁',
        'Unlocked and ready for premium reward claims.': '已解锁，可领取赞助奖励。',
        'Upgrade': '升级',
        'Use the free craft, then craft a few more to start seeing rare modules.': '先用免费制造，再补几次，开始见到稀有模组。',
        'Use your first three free sorties to learn the drag-dodge rhythm.': '前三次免费出击先熟悉拖拽闪避节奏。',
        'Used': '已使用',
        'Wallet': '库存',
        'Wing': '僚机',
        'Wingman Bay': '僚机舱',
        'Your first top-up unlocks the sponsor track and extra rewards.': '首充后解锁赞助路线和额外奖励。'
    };

    const ASCII_ONLY_PATTERN = /^[\x00-\x7F]*$/;

    function normalizeTextKey(value) {
        return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
    }

    function text(zh, en) {
        if (state.lang === 'en') return en;
        const zhKey = normalizeTextKey(zh);
        const enKey = normalizeTextKey(en);
        const fallback = DRONE_SQUAD_ZH_TEXT_FALLBACKS[zhKey] || DRONE_SQUAD_ZH_TEXT_FALLBACKS[enKey];
        if (fallback && (!zhKey || ASCII_ONLY_PATTERN.test(zhKey) || /[A-Za-z]/.test(zhKey))) return fallback;
        return zh || fallback || en || '';
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
        if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(1)}K`;
        return `${Math.round(number * 100) / 100}`;
    }

    function formatPercent(value) {
        return `+${Math.round((Number(value) || 0) * 100)}%`;
    }

    function formatCountdown(ms) {
        const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function clampNumber(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        return Math.max(min, Math.min(max, numeric));
    }

    function roundBonus(value) {
        return Math.max(0, Math.round((Number(value) || 0) * 10000) / 10000);
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function getDayKey(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function distanceSquared(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return (dx * dx) + (dy * dy);
    }

    function isCriticalHit(chance) {
        return Math.random() < chance;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
}());
