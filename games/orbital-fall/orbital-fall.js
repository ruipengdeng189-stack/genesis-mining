(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_orbital_fall_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const PAYMENT_API_BASE = '/api';
    const PAYMENT_GAME_ID = 'orbital-fall';
    const PAYMENT_ORDER_STORAGE_KEY = 'genesis_orbital_fall_payment_order_v1';
    const PAYMENT_TXID_REGEX = /^[A-Fa-f0-9]{64}$/;
    const PAYMENT_ORDER_DISPLAY_DECIMALS = 4;
    const PAYMENT_ORDER_WINDOW_MS = 15 * 60 * 1000;
    const PAYMENT_ADDRESS_FIELDS = ['payAddress', 'pay_address', 'walletAddress', 'wallet_address', 'recipientAddress', 'recipient_address', 'receiveAddress', 'receive_address', 'receivingAddress', 'receiving_address', 'toAddress', 'to_address', 'address'];
    const CHOICE_IDS = ['attack-rate', 'projectile-count', 'shield-refill', 'pickup-range', 'crit-arc', 'ultimate-charge', 'drone-overclock', 'close-burst'];
    const BATTLE_HINT_DURATION_MS = 4200;

    const CHOICE_LIBRARY = {
        'attack-rate': {
            title: { zh: '火力超频', en: 'Power Overclock' },
            desc: { zh: '本局伤害与射速一起提升。', en: 'Boost damage and fire rate this run.' }
        },
        'projectile-count': {
            title: { zh: '散射列阵', en: 'Scatter Array' },
            desc: { zh: '增加侧向弹道，清杂更稳。', en: 'Adds side projectiles for smoother wave clear.' }
        },
        'shield-refill': {
            title: { zh: '护盾回灌', en: 'Shield Refill' },
            desc: { zh: '立刻回满护盾，并提高上限。', en: 'Fully refill shield and raise the cap.' }
        },
        'pickup-range': {
            title: { zh: '磁吸扩散', en: 'Magnet Spread' },
            desc: { zh: '扩大经验球拾取范围。', en: 'Widen pickup range for XP and drops.' }
        },
        'crit-arc': {
            title: { zh: '暴击弧线', en: 'Critical Arc' },
            desc: { zh: '提高暴击率，并追加小范围溅射。', en: 'Raise crit chance and add small splash.' }
        },
        'ultimate-charge': {
            title: { zh: '能量回路', en: 'Charge Relay' },
            desc: { zh: '大招充能更快，并立刻补一截。', en: 'Faster ultimate charge plus an instant chunk.' }
        },
        'drone-overclock': {
            title: { zh: '无人机超频', en: 'Drone Overclock' },
            desc: { zh: '无人机支援脉冲更频繁。', en: 'Drone support pulses more often.' }
        },
        'close-burst': {
            title: { zh: '近身爆发', en: 'Close Burst' },
            desc: { zh: '机体周围持续产生短脉冲。', en: 'Create a short-range pulse around the ship.' }
        }
    };

    const config = window.GENESIS_ORBITAL_FALL_CONFIG;
    if (!config) return;

    const tabMap = Object.fromEntries((config.tabs || []).map((item) => [item.id, item]));
    const resourceMap = Object.fromEntries((config.resources || []).map((item) => [item.id, item]));
    const hullMap = Object.fromEntries((config.hulls || []).map((item) => [item.id, item]));
    const weaponMap = Object.fromEntries((config.weapons || []).map((item) => [item.id, item]));
    const droneMap = Object.fromEntries((config.drones || []).map((item) => [item.id, item]));
    const ultimateMap = Object.fromEntries((config.ultimates || []).map((item) => [item.id, item]));
    const researchMap = Object.fromEntries((config.research || []).map((item) => [item.id, item]));
    const chapterMap = Object.fromEntries((config.chapters || []).map((item) => [item.id, item]));
    const missionMap = Object.fromEntries((config.missions || []).map((item) => [item.id, item]));
    const shopMap = Object.fromEntries((config.shopItems || []).map((item) => [item.id, item]));
    const offerMap = Object.fromEntries((config.paymentOffers || []).map((item) => [item.id, item]));
    const chapterIndexMap = Object.fromEntries((config.chapters || []).map((item, index) => [item.id, index]));
    const dailyRouteModels = Array.isArray(config.dailyRouteModels) ? config.dailyRouteModels : [];

    const state = {
        lang: readLang(),
        save: loadSave(),
        tab: 'run',
        toastTimer: 0,
        paymentOpen: false,
        battle: createBattleState()
    };

    const ui = {};
    let paymentCountdownTimer = 0;
    let selectedPaymentOfferId = config.paymentOffers?.[0]?.id || 'starter';
    let paymentStatusTone = 'info';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        state.tab = tabMap[state.save.tab] ? state.save.tab : 'run';
        ensureMissionCycle();
        cacheUi();
        bindEvents();
        restoreStoredPaymentOrder();
        if (!paymentCountdownTimer) {
            paymentCountdownTimer = window.setInterval(updatePaymentExpiryUI, 1000);
        }
        renderAll();
    }

    function cacheUi() {
        ui.heroEyebrow = document.getElementById('heroEyebrow');
        ui.heroTitle = document.getElementById('heroTitle');
        ui.heroSubtitle = document.getElementById('heroSubtitle');
        ui.resourceStrip = document.getElementById('resourceStrip');
        ui.heroSummary = document.getElementById('heroSummary');
        ui.panelContent = document.getElementById('panelContent');
        ui.tabBar = document.getElementById('tabBar');
        ui.paymentModal = document.getElementById('paymentModal');
        ui.paymentEyebrow = document.getElementById('paymentEyebrow');
        ui.paymentTitle = document.getElementById('paymentTitle');
        ui.paymentDesc = document.getElementById('paymentDesc');
        ui.paymentCloseBtn = document.getElementById('paymentCloseBtn');
        ui.paymentOfferGrid = document.getElementById('paymentOfferGrid');
        ui.paymentImpact = document.getElementById('paymentImpact');
        ui.paymentAmount = document.getElementById('paymentAmount');
        ui.paymentMeta = document.getElementById('paymentMeta');
        ui.paymentOrderLabel = document.getElementById('paymentOrderLabel');
        ui.paymentOrderId = document.getElementById('paymentOrderId');
        ui.paymentExactLabel = document.getElementById('paymentExactLabel');
        ui.paymentExactAmount = document.getElementById('paymentExactAmount');
        ui.paymentExpiryLabel = document.getElementById('paymentExpiryLabel');
        ui.paymentExpiry = document.getElementById('paymentExpiry');
        ui.paymentAddressLabel = document.getElementById('paymentAddressLabel');
        ui.paymentWallet = document.getElementById('paymentWallet');
        ui.paymentCreateBtn = document.getElementById('paymentCreateBtn');
        ui.paymentCopyAddressBtn = document.getElementById('paymentCopyAddressBtn');
        ui.paymentCopyAmountBtn = document.getElementById('paymentCopyAmountBtn');
        ui.paymentTxidLabel = document.getElementById('paymentTxidLabel');
        ui.paymentTxidInput = document.getElementById('paymentTxidInput');
        ui.paymentTxidHint = document.getElementById('paymentTxidHint');
        ui.paymentStatus = document.getElementById('paymentStatus');
        ui.paymentVerifyBtn = document.getElementById('paymentVerifyBtn');
        ui.toast = document.getElementById('toast');
        ui.langButtons = Array.from(document.querySelectorAll('[data-lang-switch]'));
    }

    function bindEvents() {
        ui.langButtons.forEach((button) => {
            button.addEventListener('click', () => {
                state.lang = button.dataset.langSwitch === 'en' ? 'en' : 'zh';
                try {
                    localStorage.setItem(HUB_LANG_KEY, state.lang);
                } catch (error) {}
                renderAll();
            });
        });

        ui.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            const nextTab = button.dataset.tab;
            if (!tabMap[nextTab]) return;
            if (state.battle.active && nextTab !== 'run') {
                showToast(text('战斗进行中，请先完成当前关卡。', 'Finish the current battle first.'), 'warning');
                return;
            }
            state.tab = nextTab;
            state.save.tab = nextTab;
            saveProgress();
            renderAll();
        });

        ui.panelContent.addEventListener('click', onPanelAction);
        ui.paymentModal.addEventListener('click', (event) => {
            if (event.target === ui.paymentModal) closePaymentModal();
        });
        ui.paymentCloseBtn.addEventListener('click', closePaymentModal);
        ui.paymentCreateBtn.addEventListener('click', () => handlePaymentPrimaryAction(selectedPaymentOfferId));
        ui.paymentCopyAddressBtn.addEventListener('click', () => copyOfferAddress(selectedPaymentOfferId));
        ui.paymentCopyAmountBtn.addEventListener('click', () => copyOfferAmount(selectedPaymentOfferId));
        ui.paymentVerifyBtn.addEventListener('click', () => verifyOfferTxid(selectedPaymentOfferId));
        ui.paymentOfferGrid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-select-payment-offer]');
            if (!button) return;
            selectPaymentOffer(button.dataset.selectPaymentOffer || '');
        });
        ui.paymentTxidInput.addEventListener('input', () => {
            paymentStatusTone = 'info';
            refreshPaymentUi();
        });

        document.addEventListener('visibilitychange', () => {
            if (!state.battle.active) return;
            if (document.hidden) {
                state.battle.pausedByVisibility = true;
            } else {
                state.battle.pausedByVisibility = false;
                state.battle.lastFrameAt = performance.now();
            }
        });

        window.addEventListener('resize', () => {
            if (state.battle.active) {
                resizeBattleCanvas();
                drawBattle();
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
        const type = actionNode.dataset.type || '';

        switch (action) {
            case 'startRun':
                startBattle();
                break;
            case 'toggleEliteKey':
                toggleEliteKeyBoost();
                break;
            case 'selectChapter':
                selectChapter(value);
                break;
            case 'openTab':
                if (tabMap[value]) {
                    state.tab = value;
                    state.save.tab = value;
                    saveProgress();
                    renderAll();
                }
                break;
            case 'selectHull':
                selectHull(value);
                break;
            case 'selectWeapon':
                selectWeapon(value);
                break;
            case 'selectDrone':
                selectDrone(value);
                break;
            case 'selectUltimate':
                selectUltimate(value);
                break;
            case 'upgradeHull':
                upgradeUnit('hull', value);
                break;
            case 'upgradeWeapon':
                upgradeUnit('weapon', value);
                break;
            case 'upgradeDrone':
                upgradeUnit('drone', value);
                break;
            case 'upgradeUltimate':
                upgradeUnit('ultimate', value);
                break;
            case 'upgradeResearch':
                upgradeResearch(value);
                break;
            case 'claimMission':
                claimMission(value);
                break;
            case 'claimSeasonFree':
                claimSeasonReward('free', value);
                break;
            case 'claimSeasonPremium':
                claimSeasonReward('premium', value);
                break;
            case 'claimDailySupply':
                claimDailySupply();
                break;
            case 'buyShop':
                buyShopItem(value);
                break;
            case 'openPayment':
                openPaymentModal(value || selectedPaymentOfferId);
                break;
            case 'choosePerk':
                chooseBattlePerk(value);
                break;
            case 'castUltimate':
                castUltimate();
                break;
            case 'togglePause':
                toggleBattlePause();
                break;
            case 'battleRetreat':
                abandonBattle();
                break;
            case 'battleContinue':
                continueBattle();
                break;
            case 'closeBattleResult':
                closeBattleResult(value);
                break;
            default:
                break;
        }
    }

    function renderAll() {
        ensureMissionCycle();
        document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
        document.title = state.lang === 'en' ? 'Orbital Fall' : '轨道坠落';
        document.body.setAttribute('data-of-battle', state.battle.active ? 'active' : 'idle');

        const backToHubLink = document.getElementById('backToHubLink');
        if (backToHubLink) backToHubLink.textContent = text('← 返回大厅', '← Back To Hub');
        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) langToggle.setAttribute('aria-label', text('语言切换', 'Language'));
        if (ui.tabBar) ui.tabBar.setAttribute('aria-label', text('轨道坠落页签', 'Orbital Fall tabs'));
        if (ui.paymentCloseBtn) ui.paymentCloseBtn.setAttribute('aria-label', text('关闭支付', 'Close payment'));

        ui.langButtons.forEach((button) => {
            const active = button.dataset.langSwitch === state.lang;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        renderHero();
        renderResourceStrip();
        renderSummary();
        renderTabBar();
        renderPanel();
        refreshPaymentUi();
        ui.paymentModal.classList.toggle('is-hidden', !state.paymentOpen);
        document.body.classList.toggle('modal-open', state.paymentOpen);
    }

    function renderHero() {
        ui.heroEyebrow.textContent = state.lang === 'en' ? 'GENESIS ORBITAL FALL' : 'GENESIS 轨道坠落';
        ui.heroTitle.textContent = localize(config.meta?.title);
        ui.heroSubtitle.textContent = localize(config.meta?.subtitle);
    }

    function renderResourceStrip() {
        const items = (config.resources || []).map((resource) => {
            const value = Number(state.save[resource.id] || 0);
            return `
                <div class="of-resource-pill">
                    <div class="of-pill-head">
                        <span class="of-resource-icon">${escapeHtml(resource.icon || '◈')}</span>
                        <small>${escapeHtml(localize(resource.label))}</small>
                    </div>
                    <strong>${escapeHtml(formatCompact(value))}</strong>
                    <small>${escapeHtml(localize(resource.short || resource.label))}</small>
                </div>
            `;
        }).join('');
        ui.resourceStrip.innerHTML = items;
    }

    function renderSummary() {
        if (state.battle.active) {
            ui.heroSummary.innerHTML = '';
            return;
        }

        const selectedChapter = getSelectedChapter();
        const unlockedStage = config.chapters[Math.min(state.save.unlockedChapterIndex || 0, config.chapters.length - 1)] || config.chapters[0];
        const bonusRunInfo = getDailyBonusRunInfo();
        const ownedCount = getOwnedOfferIds().length;

        ui.heroSummary.innerHTML = `
            <div class="of-summary-grid">
                ${renderSummaryItem(text('当前战力', 'Power'), formatCompact(getTotalPower()), '⚔')}
                ${renderSummaryItem(text('推进位置', 'Progress'), escapeHtml(unlockedStage?.id || '1-1'), '◎')}
                ${renderSummaryItem(text('本日加成局', 'Bonus Runs'), `${bonusRunInfo.left}/${bonusRunInfo.total}`, '✦')}
                ${renderSummaryItem(text('已生效礼包', 'Active Packs'), String(ownedCount), '◆')}
            </div>
            <div class="of-copy is-tight" style="margin-top:10px;">
                ${escapeHtml(getPrepGuidance(selectedChapter))}
            </div>
        `;
    }

    function renderSummaryItem(label, value, icon) {
        return `
            <div class="of-summary-item">
                <div class="of-stat-head">
                    <span class="of-stat-icon">${escapeHtml(icon)}</span>
                    <small>${escapeHtml(label)}</small>
                </div>
                <strong class="of-stat-value">${value}</strong>
            </div>
        `;
    }

    function renderTabBar() {
        ui.tabBar.innerHTML = (config.tabs || []).map((tab) => `
            <button class="of-tab-btn ${tab.id === state.tab ? 'is-active' : ''}" type="button" data-tab="${escapeHtml(tab.id)}">
                <span class="of-tab-icon">${escapeHtml(tab.icon || '◈')}</span>
                <span>${escapeHtml(localize(tab.label))}</span>
            </button>
        `).join('');
    }

    function renderPanel() {
        if (state.battle.active) {
            ui.panelContent.innerHTML = renderBattleShell();
            cacheBattleUi();
            resizeBattleCanvas();
            bindBattleCanvas();
            updateBattleHud();
            renderBattleOverlay();
            drawBattle();
            ensureBattleLoop();
            return;
        }

        switch (state.tab) {
            case 'run':
                ui.panelContent.innerHTML = renderRunPanel();
                break;
            case 'arsenal':
                ui.panelContent.innerHTML = renderArsenalPanel();
                break;
            case 'lab':
                ui.panelContent.innerHTML = renderLabPanel();
                break;
            case 'missions':
                ui.panelContent.innerHTML = renderMissionPanel();
                break;
            case 'season':
                ui.panelContent.innerHTML = renderSeasonPanel();
                break;
            case 'shop':
                ui.panelContent.innerHTML = renderShopPanel();
                break;
            default:
                ui.panelContent.innerHTML = renderRunPanel();
                break;
        }
    }

    function renderRunPanel() {
        const selectedChapter = getSelectedChapter();
        const power = getTotalPower();
        const pressurePoint = getRelevantPressurePoint(selectedChapter.id);
        const powerRatio = clamp(power / Math.max(1, Number(selectedChapter.recommended || 1)), 0, 2.5);
        const powerMeterWidth = Math.round(clamp(powerRatio, 0, 1) * 100);

        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('出击准备', 'Run Prep'))}</div>
                            <h2>${escapeHtml(localize(selectedChapter.name))}</h2>
                        </div>
                        <button class="primary-btn" type="button" data-action="startRun">${escapeHtml(text('开打', 'Start'))}</button>
                    </div>
                    <div class="of-inline-grid" style="margin-top:12px;">
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">⚔</span>
                                <strong>${escapeHtml(text('推荐战力', 'Recommended'))}</strong>
                            </div>
                            <div class="of-amount-strong">${escapeHtml(formatCompact(selectedChapter.recommended))}</div>
                            <div class="of-meter"><span class="of-meter-fill is-blue" style="width:${powerMeterWidth}%"></span></div>
                            <div class="of-note-mini">${escapeHtml(text('你的当前战力会直接影响清怪速度与容错。', 'Your power directly affects clear speed and survivability.'))}</div>
                        </div>
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">✦</span>
                                <strong>${escapeHtml(text('当前建议', 'Current Focus'))}</strong>
                            </div>
                            <div class="of-copy is-tight">${escapeHtml(getRunFocusCopy(selectedChapter, pressurePoint))}</div>
                            ${renderRunFocusGoal(selectedChapter, pressurePoint)}
                            ${renderRecoveryKeyHint()}
                            <div class="of-action-row">
                                <button class="ghost-btn" type="button" data-action="openTab" data-value="arsenal">${escapeHtml(text('去整备', 'Open Arsenal'))}</button>
                                <button class="ghost-btn" type="button" data-action="openTab" data-value="lab">${escapeHtml(text('去研究', 'Open Lab'))}</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('当前出战', 'Current Loadout'))}</div>
                            <h3>${escapeHtml(text('一屏确认后直接开打', 'Confirm and launch in one screen'))}</h3>
                        </div>
                    </div>
                    <div class="of-slot-grid" style="margin-top:12px;">
                        ${renderLoadoutSummaryCard('hull', getSelectedHull(), getHullLevel(state.save.selectedHullId))}
                        ${renderLoadoutSummaryCard('weapon', weaponMap[state.save.selectedWeaponIds[0]], getWeaponLevel(state.save.selectedWeaponIds[0]))}
                        ${renderLoadoutSummaryCard('weapon', weaponMap[state.save.selectedWeaponIds[1]], getWeaponLevel(state.save.selectedWeaponIds[1]))}
                        ${renderLoadoutSummaryCard('drone', getSelectedDrone(), getDroneLevel(state.save.selectedDroneId))}
                        ${renderLoadoutSummaryCard('ultimate', getSelectedUltimate(), getUltimateLevel(state.save.selectedUltimateId))}
                        <div class="of-slot-card">
                            <div class="of-card-head">
                                <span class="of-badge-icon">◎</span>
                                <strong>${escapeHtml(text('快速入口', 'Quick Actions'))}</strong>
                            </div>
                            <div class="of-copy is-tight">${escapeHtml(text('先补装备，再看研究，随时回来开打。', 'Tune gear, check research, and come right back.'))}</div>
                            <div class="of-action-row">
                                <button class="ghost-btn" type="button" data-action="openTab" data-value="arsenal">${escapeHtml(text('整备', 'Arsenal'))}</button>
                                <button class="ghost-btn" type="button" data-action="openTab" data-value="shop">${escapeHtml(text('商店', 'Shop'))}</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('关卡窗口', 'Stage Window'))}</div>
                            <h3>${escapeHtml(text('只显示当前附近关卡，减少滚动，确认后直接开打', 'Nearby stages only for faster browsing and instant launch'))}</h3>
                        </div>
                    </div>
                    <div class="of-stage-grid" style="margin-top:12px;">
                        ${getVisibleRunStages(selectedChapter.id).map((chapter) => renderStageCard(chapter)).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    function renderArsenalPanel() {
        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('整备中心', 'Arsenal'))}</div>
                            <h2>${escapeHtml(text('装备、等级、战力一屏看完', 'Loadout, levels, and power in one view'))}</h2>
                        </div>
                        <button class="primary-btn" type="button" data-action="openTab" data-value="run">${escapeHtml(text('返回开打', 'Back To Run'))}</button>
                    </div>
                </section>
                ${renderUnitSection('hull', config.hulls || [], {
                    titleZh: '机体',
                    titleEn: 'Hull',
                    selectAction: 'selectHull',
                    upgradeAction: 'upgradeHull',
                    selectedId: state.save.selectedHullId,
                    levelGetter: getHullLevel
                })}
                ${renderUnitSection('weapon', config.weapons || [], {
                    titleZh: '主武器',
                    titleEn: 'Weapons',
                    selectAction: 'selectWeapon',
                    upgradeAction: 'upgradeWeapon',
                    selectedId: '',
                    levelGetter: getWeaponLevel
                })}
                ${renderUnitSection('drone', config.drones || [], {
                    titleZh: '无人机',
                    titleEn: 'Drone',
                    selectAction: 'selectDrone',
                    upgradeAction: 'upgradeDrone',
                    selectedId: state.save.selectedDroneId,
                    levelGetter: getDroneLevel
                })}
                ${renderUnitSection('ultimate', config.ultimates || [], {
                    titleZh: '大招',
                    titleEn: 'Ultimate',
                    selectAction: 'selectUltimate',
                    upgradeAction: 'upgradeUltimate',
                    selectedId: state.save.selectedUltimateId,
                    levelGetter: getUltimateLevel
                })}
            </div>
        `;
    }

    function renderLabPanel() {
        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('研究中心', 'Lab'))}</div>
                            <h2>${escapeHtml(text('永久成长，优先补你当前最缺的一条线', 'Permanent growth, focus on the line you need most'))}</h2>
                        </div>
                    </div>
                    <div class="of-card-grid" style="margin-top:12px;">
                        ${(config.research || []).map((entry) => renderResearchCard(entry)).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    function renderMissionPanel() {
        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('任务', 'Missions'))}</div>
                            <h2>${escapeHtml(text('每日目标 + 日回收', 'Daily goals + recovery loop'))}</h2>
                        </div>
                    </div>
                    ${renderMissionLoopCard()}
                    <div class="of-card-grid" style="margin-top:12px;">
                        ${(config.missions || []).map((mission) => renderMissionCard(mission)).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    function renderSeasonPanel() {
        const premiumActive = !!state.save.payment.premiumSeason;
        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('赛季轨道', 'Season'))}</div>
                            <h2>${escapeHtml(text('免费线与高级线奖励总览', 'Free and Premium Reward Tracks'))}</h2>
                        </div>
                        <span class="of-chip ${premiumActive ? 'is-good' : 'is-warning'}">${escapeHtml(premiumActive ? text('高级线已启用', 'Premium Active') : text('高级线未启用', 'Premium Locked'))}</span>
                    </div>
                    ${renderSeasonPaceCard()}
                    <div class="of-inline-grid" style="margin-top:12px;">
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">★</span>
                                <strong>${escapeHtml(text('免费线', 'Free Track'))}</strong>
                            </div>
                            <div class="of-card-grid">
                                ${(config.seasonFreeTrack || []).map((node) => renderSeasonNode('free', node)).join('')}
                            </div>
                        </div>
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">✦</span>
                                <strong>${escapeHtml(text('高级线', 'Premium Track'))}</strong>
                            </div>
                            <div class="of-card-grid">
                                ${(config.seasonPremiumTrack || []).map((node) => renderSeasonNode('premium', node)).join('')}
                            </div>
                            ${premiumActive ? '' : `<button class="primary-btn" type="button" data-action="openPayment" data-value="accelerator">${escapeHtml(text('开启高级线', 'Unlock Premium'))}</button>`}
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function renderShopPanel() {
        const pressurePoint = getRelevantPressurePoint(getSelectedChapter().id);
        const suggestedOffer = pressurePoint?.recommendedOffer ? offerMap[pressurePoint.recommendedOffer] : offerMap[selectedPaymentOfferId] || config.paymentOffers[0];
        const pendingOrder = getPendingOrder();
        const pendingOffer = pendingOrder ? offerMap[pendingOrder.offerId] : null;

        return `
            <div class="of-panel-stack">
                <section class="of-card">
                    <div class="of-section-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('商店', 'Shop'))}</div>
                            <h2>${escapeHtml(text('补给 + 礼包', 'Supply + Packs'))}</h2>
                        </div>
                        <button class="primary-btn" type="button" data-action="openPayment" data-value="${escapeHtml(suggestedOffer?.id || 'starter')}">${escapeHtml(text('打开礼包', 'Open Packs'))}</button>
                    </div>
                    <div class="of-inline-grid" style="margin-top:12px;">
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">◎</span>
                                <strong>${escapeHtml(text('补给区', 'Supply'))}</strong>
                            </div>
                            ${renderShopRouteCard(pressurePoint)}
                            <div class="of-card-grid">
                                ${(config.shopItems || []).map((item) => renderShopItem(item)).join('')}
                            </div>
                        </div>
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">◆</span>
                                <strong>${escapeHtml(text('礼包区', 'Packs'))}</strong>
                            </div>
                            <div class="of-copy is-tight">${escapeHtml(text('会优先推荐更适合你当前进度的礼包，并突出显示价格与核心收益。', 'Packs are prioritized for your current progress, with price and core benefit shown first.'))}</div>
                            ${pendingOrder ? `
                                <div class="of-order-brief">
                                    <div class="of-card-head">
                                        <span class="of-badge-icon">⌛</span>
                                        <strong>${escapeHtml(text('待处理订单', 'Pending Order'))}</strong>
                                    </div>
                                    <div class="of-action-row">
                                        <span class="of-chip is-accent">${escapeHtml(localize(pendingOffer?.name || { zh: '当前礼包', en: 'Current Pack' }))}</span>
                                        <span class="of-chip">${escapeHtml(getPaymentExpiryLabel(pendingOrder))}</span>
                                    </div>
                                    <div class="of-copy is-tight">${escapeHtml(`${pendingOrder.orderId || pendingOrder.id || '--'} · ${formatPaymentAmount(pendingOrder.exactAmount)} USDT`)}</div>
                                    <button class="ghost-btn" type="button" data-action="openPayment" data-value="${escapeHtml(pendingOrder.offerId || suggestedOffer?.id || 'starter')}">${escapeHtml(text('继续支付', 'Continue Payment'))}</button>
                                </div>
                            ` : ''}
                            <div class="of-card-grid">
                                ${(config.paymentOffers || []).map((offer) => renderOfferPreview(offer)).join('')}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function renderMissionLoopCard() {
        const route = getCurrentDailyRoute();
        const loop = estimateDailyLoopReward(route);
        if (!route || !loop) return '';
        return `
            <div class="of-inline-card" style="margin-top:12px;">
                <div class="of-inline-head">
                    <span class="of-badge-icon">✓</span>
                    <strong>${escapeHtml(text('今日回收', 'Daily Loop'))}</strong>
                </div>
                <div class="of-chip-row">
                    <span class="of-chip">${escapeHtml(text(`${loop.stageCount} 局`, `${loop.stageCount} Runs`))}</span>
                    <span class="of-chip">${escapeHtml(text(`${loop.missionCount} 任务`, `${loop.missionCount} Missions`))}</span>
                    <span class="of-chip is-good">${escapeHtml(text(`${loop.bonusRunCount} 加成`, `${loop.bonusRunCount} Bonus`))}</span>
                </div>
                <div class="of-chip-row">${renderRewardChips(loop.totalReward)}</div>
                <div class="of-copy is-tight">${escapeHtml(localize(route.note))}</div>
            </div>
        `;
    }

    function renderSeasonPaceCard() {
        const route = getCurrentDailyRoute();
        const loop = estimateDailyLoopReward(route);
        if (!route || !loop) return '';
        const nextFree = getNextSeasonNode('free');
        const nextPremium = getNextSeasonNode('premium');
        const freeRemain = nextFree ? Math.max(0, Number(nextFree.xp || 0) - Number(state.save.seasonXp || 0)) : 0;
        const premiumRemain = nextPremium ? Math.max(0, Number(nextPremium.xp || 0) - Number(state.save.seasonXp || 0)) : 0;
        return `
            <div class="of-inline-card" style="margin-top:12px;">
                <div class="of-inline-head">
                    <span class="of-badge-icon">★</span>
                    <strong>${escapeHtml(text('赛季速率', 'Season Pace'))}</strong>
                </div>
                <div class="of-chip-row">
                    <span class="of-chip is-good">${escapeHtml(text(`线 +${formatCompact(loop.totalReward.seasonXp)} XP/日`, `+${formatCompact(loop.totalReward.seasonXp)} XP/day`))}</span>
                    ${nextFree ? `<span class="of-chip">${escapeHtml(text(`免费线下一档 ${formatCompact(freeRemain)} XP`, `Free next ${formatCompact(freeRemain)} XP`))}</span>` : `<span class="of-chip is-good">${escapeHtml(text('免费线已收满', 'Free track cleared'))}</span>`}
                    ${state.save.payment.premiumSeason
                        ? (nextPremium ? `<span class="of-chip">${escapeHtml(text(`高级线下一档 ${formatCompact(premiumRemain)} XP`, `Premium next ${formatCompact(premiumRemain)} XP`))}</span>` : `<span class="of-chip is-good">${escapeHtml(text('高级线已收满', 'Premium cleared'))}</span>`)
                        : `<span class="of-chip is-warning">${escapeHtml(text('开启高级线可同步拿双份奖励', 'Unlock premium for dual rewards'))}</span>`}
                </div>
                <div class="of-copy is-tight">${escapeHtml(localize(route.note))}</div>
            </div>
        `;
    }

    function renderShopRouteCard(pressurePoint) {
        const route = getCurrentDailyRoute();
        const loop = estimateDailyLoopReward(route);
        const focus = getShopFocusSuggestion(pressurePoint, route);
        if (!route || !loop) return '';
        const dailyItem = shopMap[route.shopDailyId || 'dailySupply'];
        return `
            <div class="of-inline-card is-compact">
                <div class="of-inline-head">
                    <span class="of-badge-icon">⟳</span>
                    <strong>${escapeHtml(text('补给节奏', 'Supply Rhythm'))}</strong>
                </div>
                <div class="of-chip-row">
                    <span class="of-chip is-good">${escapeHtml(text(`日补 ${formatRewardPlainText(dailyItem?.reward || {})}`, `Daily ${formatRewardPlainText(dailyItem?.reward || {})}`))}</span>
                </div>
                <div class="of-chip-row">
                    ${focus.items.map((item) => `<span class="of-chip">${escapeHtml(localize(item.title))}</span>`).join('')}
                </div>
                <div class="of-copy is-tight">${escapeHtml(focus.copy)}</div>
            </div>
        `;
    }

    function renderLoadoutSummaryCard(type, entry, level) {
        if (!entry) return '';
        return `
            <div class="of-slot-card">
                <div class="of-card-head">
                    <span class="of-badge-icon">${escapeHtml(typeIcon(type))}</span>
                    <strong>${escapeHtml(localize(entry.name))}</strong>
                </div>
                <div class="of-copy is-tight">${escapeHtml(localize(entry.role || entry.perk || { zh: '基础配置', en: 'Base setup' }))}</div>
                <div class="of-action-row">
                    <span class="of-chip">${escapeHtml(text(`Lv.${level}`, `Lv.${level}`))}</span>
                    <span class="of-chip is-good">${escapeHtml(text(`战力 ${formatCompact(getEntryPower(type, entry.id))}`, `Power ${formatCompact(getEntryPower(type, entry.id))}`))}</span>
                </div>
            </div>
        `;
    }

    function renderStageCard(chapter) {
        const active = chapter.id === state.save.selectedChapterId;
        const unlocked = isStageUnlocked(chapter.id);
        const currentPower = getTotalPower();
        const ratio = clamp(currentPower / Math.max(1, Number(chapter.recommended || 1)), 0, 2);
        const rewardText = renderRewardInline(chapter.reward);
        return `
            <button class="of-stage-card ${active ? 'is-active' : ''} ${!unlocked ? 'is-locked' : ''}" type="button" data-action="selectChapter" data-value="${escapeHtml(chapter.id)}" ${unlocked ? '' : 'disabled'}>
                <div class="of-stage-top">
                    <span class="of-chip ${chapter.kind === 'boss' ? 'is-warning' : chapter.kind === 'elite' ? 'is-accent' : ''}">${escapeHtml(chapter.id)}</span>
                    <span class="of-tag">${escapeHtml(chapter.kind === 'boss' ? text('首领', 'Boss') : chapter.kind === 'elite' ? text('精英', 'Elite') : text('普通', 'Normal'))}</span>
                </div>
                <div>
                    <div class="of-stage-name">${escapeHtml(localize(chapter.name))}</div>
                    <div class="of-copy is-tight is-2line">${escapeHtml(unlocked ? text('单手拖动走位，自动开火，局内升级三选一。', 'Drag to move, auto-fire, and choose upgrades during the run.') : getUnlockText(chapter.id))}</div>
                </div>
                <div class="of-stage-bottom">
                    <span class="of-chip">${escapeHtml(text(`推 ${formatCompact(chapter.recommended)}`, `Rec ${formatCompact(chapter.recommended)}`))}</span>
                    <span class="of-chip ${ratio >= 1 ? 'is-good' : ratio >= 0.85 ? 'is-warning' : ''}">${escapeHtml(text(`你 ${formatCompact(currentPower)}`, `You ${formatCompact(currentPower)}`))}</span>
                </div>
                <div class="of-copy is-tight">${rewardText}</div>
            </button>
        `;
    }

    function renderUnitSection(type, entries, options) {
        return `
            <section class="of-card">
                <div class="of-section-head">
                    <div>
                        <div class="eyebrow">${escapeHtml(state.lang === 'en' ? options.titleEn : options.titleZh)}</div>
                        <h3>${escapeHtml(getUnitSectionHint(type))}</h3>
                    </div>
                </div>
                <div class="of-card-grid" style="margin-top:12px;">
                    ${entries.map((entry) => renderUnitCard(type, entry, options)).join('')}
                </div>
            </section>
        `;
    }

    function renderUnitCard(type, entry, options) {
        const selected = type === 'weapon'
            ? state.save.selectedWeaponIds.includes(entry.id)
            : options.selectedId === entry.id;
        const unlocked = isContentUnlocked(entry.unlockStage || '1-1');
        const level = options.levelGetter(entry.id);
        const nextCost = getUnitNextCost(type, level);
        return `
            <div class="of-slot-card ${selected ? 'is-selected' : ''}">
                <div class="of-card-head">
                    <span class="of-badge-icon">${escapeHtml(typeIcon(type))}</span>
                    <strong>${escapeHtml(localize(entry.name))}</strong>
                </div>
                <div class="of-copy is-tight">${escapeHtml(localize(entry.role || entry.perk || { zh: '核心模块', en: 'Core module' }))}</div>
                <div class="of-action-row">
                    <span class="of-chip">${escapeHtml(text(`Lv.${level}`, `Lv.${level}`))}</span>
                    <span class="of-chip is-good">${escapeHtml(text(`战力 ${formatCompact(getEntryPower(type, entry.id))}`, `Power ${formatCompact(getEntryPower(type, entry.id))}`))}</span>
                </div>
                <div class="of-copy is-tight">${escapeHtml(unlocked ? getUpgradeCostLabel(nextCost) : getUnlockRequirementText(entry.unlockStage || '1-1'))}</div>
                <div class="of-action-row">
                    <button class="ghost-btn" type="button" data-action="${escapeHtml(options.selectAction)}" data-value="${escapeHtml(entry.id)}" ${unlocked ? '' : 'disabled'}>
                        ${escapeHtml(selected ? text('已上阵', 'Selected') : text('选择', 'Select'))}
                    </button>
                    <button class="primary-btn" type="button" data-action="${escapeHtml(options.upgradeAction)}" data-value="${escapeHtml(entry.id)}" ${(unlocked && nextCost) ? '' : 'disabled'}>
                        ${escapeHtml(nextCost ? text('升级', 'Upgrade') : text('满级', 'Max'))}
                    </button>
                </div>
            </div>
        `;
    }

    function renderResearchCard(entry) {
        const level = getResearchLevel(entry.id);
        const nextLevel = entry.levels?.[level] || null;
        const currentLevel = entry.levels?.[Math.max(0, level - 1)] || null;
        return `
            <div class="of-slot-card">
                <div class="of-card-head">
                    <span class="of-badge-icon">◎</span>
                    <strong>${escapeHtml(localize(entry.name))}</strong>
                </div>
                <div class="of-copy is-tight">${escapeHtml(localize(entry.focus || { zh: '永久成长', en: 'Permanent growth' }))}</div>
                <div class="of-action-row">
                    <span class="of-chip">${escapeHtml(text(`Lv.${level}/${entry.maxLevel}`, `Lv.${level}/${entry.maxLevel}`))}</span>
                    <span class="of-chip is-good">${escapeHtml(getResearchEffectLabel(entry, currentLevel))}</span>
                </div>
                <div class="of-copy is-tight">${escapeHtml(nextLevel ? getResearchCostLabel(nextLevel) : text('当前已满级。', 'Already maxed.'))}</div>
                <button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${escapeHtml(entry.id)}" ${nextLevel ? '' : 'disabled'}>${escapeHtml(nextLevel ? text('升级研究', 'Upgrade Research') : text('已满级', 'Maxed'))}</button>
            </div>
        `;
    }

    function renderMissionCard(mission) {
        const progress = getMissionProgress(mission);
        const claimed = state.save.missionClaimed.includes(mission.id);
        const ready = progress >= mission.target && !claimed;
        return `
            <div class="of-slot-card">
                <div class="of-card-head">
                    <span class="of-badge-icon">✓</span>
                    <strong>${escapeHtml(localize(mission.title))}</strong>
                </div>
                <div class="of-meter"><span class="of-meter-fill is-green" style="width:${Math.min(100, Math.round(progress / mission.target * 100))}%"></span></div>
                <div class="of-action-row">
                    <span class="of-chip">${escapeHtml(`${formatCompact(progress)} / ${formatCompact(mission.target)}`)}</span>
                    <span class="of-chip is-good">${renderRewardInline(mission.reward)}</span>
                </div>
                <button class="primary-btn" type="button" data-action="claimMission" data-value="${escapeHtml(mission.id)}" ${ready ? '' : 'disabled'}>
                    ${escapeHtml(claimed ? text('已领取', 'Claimed') : ready ? text('领取', 'Claim') : text('进行中', 'In Progress'))}
                </button>
            </div>
        `;
    }

    function renderSeasonNode(track, node) {
        const claimedList = track === 'premium' ? state.save.seasonClaimedPremium : state.save.seasonClaimed;
        const claimed = claimedList.includes(node.id);
        const unlocked = state.save.seasonXp >= Number(node.xp || 0);
        const premiumLocked = track === 'premium' && !state.save.payment.premiumSeason;
        return `
            <div class="of-slot-card">
                <div class="of-card-head">
                    <span class="of-badge-icon">${track === 'premium' ? '✦' : '★'}</span>
                    <strong>${escapeHtml(text(`赛季 ${node.id.toUpperCase()}`, `${track === 'premium' ? 'P' : 'F'}-${node.id.toUpperCase()}`))}</strong>
                </div>
                <div class="of-action-row">
                    <span class="of-chip">${escapeHtml(text(`需 ${formatCompact(node.xp)} XP`, `Need ${formatCompact(node.xp)} XP`))}</span>
                    <span class="of-chip is-good">${renderRewardInline(node.reward)}</span>
                </div>
                <button class="primary-btn" type="button" data-action="${track === 'premium' ? 'claimSeasonPremium' : 'claimSeasonFree'}" data-value="${escapeHtml(node.id)}" ${(unlocked && !claimed && !premiumLocked) ? '' : 'disabled'}>
                    ${escapeHtml(premiumLocked ? text('未开启', 'Locked') : claimed ? text('已领取', 'Claimed') : unlocked ? text('领取', 'Claim') : text('未解锁', 'Locked'))}
                </button>
            </div>
        `;
    }

    function renderShopItem(item) {
        const ready = item.daily ? canClaimDailySupply() : Number(state.save.credits || 0) >= Number(item.price || 0);
        return `
            <div class="of-slot-card">
                <div class="of-card-head">
                    <span class="of-badge-icon">◎</span>
                    <strong>${escapeHtml(localize(item.title))}</strong>
                </div>
                <div class="of-action-row">
                    <span class="of-chip ${item.price <= 0 ? 'is-good' : ''}">${escapeHtml(item.price <= 0 ? text('免费', 'Free') : formatResourceUnitAmount('credits', item.price))}</span>
                    <span class="of-chip is-good">${renderRewardInline(item.reward)}</span>
                </div>
                <button class="primary-btn" type="button" data-action="${item.daily ? 'claimDailySupply' : 'buyShop'}" data-value="${escapeHtml(item.id)}" ${ready ? '' : 'disabled'}>
                    ${escapeHtml(item.daily ? (ready ? text('领取', 'Claim') : text('冷却中', 'Cooling')) : text('购买', 'Buy'))}
                </button>
            </div>
        `;
    }

    function renderOfferPreview(offer) {
        const owned = isOfferOwned(offer.id);
        const recommended = getRelevantPressurePoint(getSelectedChapter().id)?.recommendedOffer === offer.id;
        const pendingOrder = getPendingOrderForOffer(offer.id);
        return `
            <div class="of-slot-card ${recommended ? 'is-selected' : ''}">
                <div class="of-card-head">
                    <span class="of-badge-icon">◆</span>
                    <strong>${escapeHtml(localize(offer.name))}</strong>
                </div>
                <div class="of-action-row">
                    <span class="of-chip is-accent">${escapeHtml(`${Number(offer.price || 0).toFixed(0)} USDT`)}</span>
                    ${recommended ? `<span class="of-chip is-good">${escapeHtml(text('更适合当前进度', 'Fits current progress'))}</span>` : ''}
                </div>
                <div class="of-action-row">
                    ${offer.unlocksPremiumSeason ? `<span class="of-chip">${escapeHtml(text('含高级线', 'Premium Line'))}</span>` : ''}
                    ${pendingOrder ? `<span class="of-chip is-accent">${escapeHtml(text('待处理', 'Pending'))}</span>` : owned ? `<span class="of-chip is-good">${escapeHtml(text('已生效', 'Active'))}</span>` : ''}
                </div>
                <div class="of-copy is-tight">${escapeHtml(localize(offer.permanentText || offer.permanent || { zh: '一条长期收益', en: 'One long-term benefit' }))}</div>
                <div class="of-copy is-tight is-2line">${escapeHtml(getOfferFitHint(offer))}</div>
                <button class="primary-btn" type="button" data-action="openPayment" data-value="${escapeHtml(offer.id)}">
                    ${escapeHtml(owned ? text('已拥有', 'Owned') : pendingOrder ? text('继续订单', 'Continue') : text('查看', 'View'))}
                </button>
            </div>
        `;
    }

    function renderBattleShell() {
        return `
            <div class="of-battle-shell">
                <div class="of-battle-hud">
                    <div class="of-battle-hud-top">
                        <div class="of-hud-block">
                            <small>${escapeHtml(text('生命', 'HP'))}</small>
                            <strong id="battleHpValue">--</strong>
                            <div class="of-meter"><span class="of-meter-fill is-danger" id="battleHpFill"></span></div>
                        </div>
                        <div class="of-hud-block">
                            <small>${escapeHtml(text('护盾', 'Shield'))}</small>
                            <strong id="battleShieldValue">--</strong>
                            <div class="of-meter"><span class="of-meter-fill is-blue" id="battleShieldFill"></span></div>
                        </div>
                        <div class="of-hud-block">
                            <small>${escapeHtml(text('倒计时', 'Timer'))}</small>
                            <strong id="battleTimerValue">--</strong>
                            <div class="of-copy is-tight" id="battleStageLabel">--</div>
                        </div>
                        <div class="of-hud-block">
                            <small>${escapeHtml(text('大招充能', 'Charge'))}</small>
                            <strong id="battleChargeValue">--</strong>
                            <div class="of-meter"><span class="of-meter-fill" id="battleChargeFill"></span></div>
                        </div>
                    </div>
                    <div class="of-hud-goals" id="battleGoalStrip"></div>
                </div>

                <div class="of-battle-stage" id="battleStage">
                    <canvas class="of-battle-canvas" id="battleCanvas"></canvas>
                    <div class="of-battle-vfx" id="battleVfx"></div>
                    <div class="of-battle-hint ${state.save.seenBattleHint ? 'is-hidden' : ''}" id="battleHint">${escapeHtml(text('拖动战机移动 · 自动开火 · 满能量放大招', 'Drag to move · Auto-fire · Cast when fully charged'))}</div>
                    <div class="of-battle-overlay" id="battleOverlay"></div>
                </div>

                <div class="of-battle-bottom">
                    <button class="primary-btn of-skill-btn" id="battleSkillBtn" type="button" data-action="castUltimate">
                        <span class="of-charge-ring" id="battleChargeRing"></span>
                        <span id="battleSkillText">${escapeHtml(text('释放大招', 'Cast Ultimate'))}</span>
                    </button>
                    <button class="ghost-btn of-pause-btn" type="button" data-action="togglePause">${escapeHtml(text('暂停', 'Pause'))}</button>
                </div>
            </div>
        `;
    }

    function cacheBattleUi() {
        const battle = state.battle;
        battle.ui.stage = document.getElementById('battleStage');
        battle.ui.canvas = document.getElementById('battleCanvas');
        battle.ui.vfx = document.getElementById('battleVfx');
        battle.ui.overlay = document.getElementById('battleOverlay');
        battle.ui.hint = document.getElementById('battleHint');
        battle.ui.hpValue = document.getElementById('battleHpValue');
        battle.ui.shieldValue = document.getElementById('battleShieldValue');
        battle.ui.timerValue = document.getElementById('battleTimerValue');
        battle.ui.chargeValue = document.getElementById('battleChargeValue');
        battle.ui.stageLabel = document.getElementById('battleStageLabel');
        battle.ui.goalStrip = document.getElementById('battleGoalStrip');
        battle.ui.hpFill = document.getElementById('battleHpFill');
        battle.ui.shieldFill = document.getElementById('battleShieldFill');
        battle.ui.chargeFill = document.getElementById('battleChargeFill');
        battle.ui.chargeRing = document.getElementById('battleChargeRing');
        battle.ui.skillBtn = document.getElementById('battleSkillBtn');
        battle.ui.skillText = document.getElementById('battleSkillText');
        battle.ctx = battle.ui.canvas.getContext('2d');
        scheduleBattleHintAutoHide();
    }

    function bindBattleCanvas() {
        const stageNode = state.battle.ui.stage;
        if (!stageNode || stageNode.dataset.bound === 'yes') return;
        stageNode.dataset.bound = 'yes';
        stageNode.addEventListener('pointerdown', onBattlePointer);
        stageNode.addEventListener('pointermove', onBattlePointer);
        stageNode.addEventListener('pointerup', onBattlePointerEnd);
        stageNode.addEventListener('pointercancel', onBattlePointerEnd);
        stageNode.addEventListener('pointerleave', onBattlePointerEnd);
    }

    function onBattlePointer(event) {
        if (!state.battle.active) return;
        const rect = state.battle.ui.stage.getBoundingClientRect();
        const x = clamp(event.clientX - rect.left, 24, rect.width - 24);
        const y = clamp(event.clientY - rect.top, 36, rect.height - 36);
        state.battle.pointerActive = true;
        state.battle.pointerX = x;
        state.battle.pointerY = y;
        if (!state.save.seenBattleHint) {
            state.save.seenBattleHint = true;
            saveProgress();
        }
        if (state.battle.ui.hint) state.battle.ui.hint.classList.add('is-hidden');
    }

    function onBattlePointerEnd() {
        state.battle.pointerActive = false;
    }

    function resizeBattleCanvas() {
        if (!state.battle.active || !state.battle.ui.canvas || !state.battle.ui.stage) return;
        const rect = state.battle.ui.stage.getBoundingClientRect();
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        state.battle.width = rect.width;
        state.battle.height = rect.height;
        state.battle.ui.canvas.width = Math.round(rect.width * dpr);
        state.battle.ui.canvas.height = Math.round(rect.height * dpr);
        state.battle.ui.canvas.style.width = `${rect.width}px`;
        state.battle.ui.canvas.style.height = `${rect.height}px`;
        state.battle.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!state.battle.player.x) {
            state.battle.player.x = rect.width * 0.5;
            state.battle.player.y = rect.height * 0.78;
            state.battle.pointerX = state.battle.player.x;
            state.battle.pointerY = state.battle.player.y;
        } else {
            state.battle.player.x = clamp(state.battle.player.x, 24, rect.width - 24);
            state.battle.player.y = clamp(state.battle.player.y, 36, rect.height - 36);
        }
    }

    function ensureBattleLoop() {
        if (!state.battle.active) return;
        if (state.battle.rafId) return;
        state.battle.lastFrameAt = performance.now();
        state.battle.rafId = window.requestAnimationFrame(runBattleFrame);
    }

    function runBattleFrame(timestamp) {
        const battle = state.battle;
        battle.rafId = 0;
        if (!battle.active) return;

        const rawDelta = Math.max(0, (timestamp - battle.lastFrameAt) / 1000);
        const delta = Math.min(0.033, rawDelta);
        battle.lastFrameAt = timestamp;

        if (!battle.paused && !battle.choiceOpen && !battle.result && !battle.pausedByVisibility) {
            updateBattle(delta);
        }
        updateBattleHud();
        drawBattle();
        renderBattleOverlay();
        battle.rafId = window.requestAnimationFrame(runBattleFrame);
    }

    function createBattleState() {
        return {
            active: false,
            paused: false,
            pausedByVisibility: false,
            rafId: 0,
            width: 0,
            height: 0,
            lastFrameAt: 0,
            pointerActive: false,
            pointerX: 0,
            pointerY: 0,
            ui: {},
            runtime: null,
            player: {
                x: 0,
                y: 0,
                radius: 14,
                hp: 0,
                maxHp: 0,
                shield: 0,
                maxShield: 0,
                speed: 260,
                invuln: 0
            },
            charge: 0,
            bulletTimer: 0,
            spawnTimer: 0,
            eliteTimer: 0,
            bossSpawned: false,
            bossKilled: false,
            timeRemaining: 0,
            xp: 0,
            xpToLevel: 36,
            level: 1,
            kills: 0,
            eliteKills: 0,
            bossDamageTaken: 0,
            continueUsed: 0,
            enemies: [],
            bullets: [],
            enemyBullets: [],
            drops: [],
            effects: [],
            choiceOpen: false,
            choiceOptions: [],
            choiceCounts: {},
            result: null,
            hintTimeoutId: 0
        };
    }

    function resetBattleState() {
        const active = state.battle.active;
        if (state.battle.rafId) {
            window.cancelAnimationFrame(state.battle.rafId);
        }
        if (state.battle.hintTimeoutId) {
            window.clearTimeout(state.battle.hintTimeoutId);
        }
        state.battle = createBattleState();
        state.battle.active = active;
    }

    function startBattle() {
        const chapter = getSelectedChapter();
        if (!isStageUnlocked(chapter.id)) {
            showToast(getUnlockText(chapter.id), 'warning');
            return;
        }

        resetBattleState();
        const runtime = buildBattleRuntime(chapter);
        state.battle.active = true;
        state.battle.runtime = runtime;
        state.battle.timeRemaining = Number(chapter.duration || 120);
        state.battle.player.maxHp = runtime.maxHp;
        state.battle.player.hp = runtime.maxHp;
        state.battle.player.maxShield = runtime.maxShield;
        state.battle.player.shield = runtime.maxShield;
        state.battle.player.speed = runtime.moveSpeed;
        state.battle.charge = 0;
        state.battle.spawnTimer = Math.max(0.26, Number(runtime.spawnIntervalStart || 0.3) * 0.48);
        state.battle.eliteTimer = runtime.firstEliteAt;
        state.battle.choiceCounts = {};
        state.battle.result = null;
        state.save.stats.runs += 1;
        state.save.stats.lastStageId = chapter.id;
        saveProgress();
        renderAll();
        showToast(localize(runtime.openingHint || {
            zh: '开局拖动战机走位，火力会自动追击最近敌人。',
            en: 'Drag the ship to move. Weapons auto-fire at nearby enemies.'
        }), 'info');
    }

    function buildBattleRuntime(chapter) {
        const hull = getSelectedHull();
        const drone = getSelectedDrone();
        const ultimate = getSelectedUltimate();
        const weaponIds = state.save.selectedWeaponIds.slice(0, 2);
        const power = getTotalPower();
        const combatTuning = resolveChapterCombatTuning(chapter);
        const eliteWindow = getStageEliteWindow(chapter);
        const thrusterBonus = getResearchBonus('thruster-mesh', 'powerBonus');
        const chargeBonus = getResearchBonus('core-reactor', 'ultimateChargeBonus') + Number(state.save.payment.permanent.ultimateCharge || 0);
        const globalGrowth = Number(state.save.payment.permanent.globalGrowth || 0);
        const weaponPower = weaponIds.reduce((sum, id) => sum + getEntryCombatPower('weapon', id), 0);
        const dronePower = getEntryCombatPower('drone', drone.id);
        const baseDamage = 8 + power * 0.058 + weaponPower * 0.08;
        const hpScale = 1 + globalGrowth * 0.45;
        const maxHp = Math.round((hull.stats.hp * (1 + (getHullLevel(hull.id) - 1) * 0.16) + power * 0.028) * hpScale);
        const maxShield = Math.round((hull.stats.shield * (1 + (getHullLevel(hull.id) - 1) * 0.18) + dronePower * 0.4) * hpScale);
        const moveSpeed = Math.round(238 * hull.stats.speed * (1 + thrusterBonus * 0.34));
        const baseSpawnInterval = Math.max(0.42, 1.08 - chapter.chapter * 0.09);
        const spawnIntervalStart = Math.max(0.34, baseSpawnInterval * Number(combatTuning.spawnIntervalRate || 1));
        const spawnIntervalEnd = Math.max(0.28, spawnIntervalStart * Number(combatTuning.lateSpawnRate || 0.84));
        const eliteWindowProgress = clamp(((Number(chapter.index || 1) - 1) / 5), 0, 1);
        const defaultFirstEliteAt = Math.max(26, Math.round(Number(chapter.duration || 120) * lerp(eliteWindow[0] || 0.45, eliteWindow[1] || eliteWindow[0] || 0.62, eliteWindowProgress)));
        const defaultEliteEvery = chapter.kind === 'elite' ? 42 : 58;
        const baseEnemyCap = Number(chapter.enemyCap || 18);
        const waveHpGrowth = Number(combatTuning.waveHpGrowth ?? 0.18);
        const waveDamageGrowth = Number(combatTuning.waveDamageGrowth ?? 0.12);

        const runtime = {
            chapterId: chapter.id,
            chapter,
            totalPower: power,
            baseDamage,
            fireRate: 2.35 + chapter.chapter * 0.08,
            projectileSpeed: 460,
            projectileRadius: 3,
            projectileTracking: 0,
            sideShots: 0,
            pierce: 0,
            critChance: 0.05,
            critMult: 1.75,
            splashRadius: 0,
            maxHp,
            maxShield,
            moveSpeed,
            pickupRange: 46 + (drone.id === 'scrap-magnet' ? 28 : 0) + Number(combatTuning.pickupRangeBonus || 0),
            shieldRegen: drone.id === 'guard-orb' ? 2.8 : 0,
            hpRegen: drone.id === 'spark-healer' ? 1.2 : 0,
            bossDamageBonus: drone.id === 'pierce-eye' ? 0.18 : 0,
            controlPulse: drone.id === 'shock-scout' ? 1 : 0,
            dronePulse: drone.id === 'echo-cache' ? 1 : 0,
            webPulse: 0,
            closeBurstBase: 0,
            chargePerSecond: (9 + chargeBonus * 22 + (drone.id === 'echo-cache' ? 2.2 : 0)) * Number(combatTuning.chargeRate || 1),
            chargeOnKill: (4 + chargeBonus * 8) * Number(combatTuning.chargeOnKillRate || 1),
            ultimateId: ultimate.id,
            ultimatePower: getEntryCombatPower('ultimate', ultimate.id),
            ultimateChargeNeed: Number(ultimate.chargeNeed || 100),
            firstEliteAt: Math.max(14, Math.round(defaultFirstEliteAt * Number(combatTuning.firstEliteRate || 1))),
            eliteEvery: Math.max(18, Math.round(defaultEliteEvery * Number(combatTuning.eliteEveryRate || 1))),
            enemyCap: Math.max(8, baseEnemyCap + Number(combatTuning.enemyCapBonus || 0)),
            spawnInterval: spawnIntervalStart,
            spawnIntervalStart,
            spawnIntervalEnd,
            bossSpawnAt: chapter.kind === 'boss' ? Math.max(32, Math.round(Number(chapter.duration || 120) * 0.32)) : -1,
            bonusCreditRate: getResearchBonus('salvage-link', 'creditsBonus') + Number(state.save.payment.permanent.creditYield || 0),
            bonusAlloyRate: getResearchBonus('alloy-press', 'alloyBonus') + Number(state.save.payment.permanent.alloyYield || 0),
            bonusSignalRate: Number(state.save.payment.permanent.signalYield || 0),
            bonusEliteRate: getResearchBonus('elite-protocol', 'eliteDropBonus') + Number(state.save.payment.permanent.bossYield || 0),
            researchDiscount: getResearchBonus('signal-tuner', 'researchDiscount'),
            rewardGrowthRate: globalGrowth,
            globalGrowth,
            allowEliteSpawns: combatTuning.allowEliteSpawns !== false,
            openingHint: getBattleOpeningHint(chapter, combatTuning),
            normalHpRate: Number(combatTuning.normalHpRate || 1),
            normalSpeedRate: Number(combatTuning.normalSpeedRate || 1),
            normalDamageRate: Number(combatTuning.normalDamageRate || 1),
            eliteHpRate: Number(combatTuning.eliteHpRate || 1),
            eliteSpeedRate: Number(combatTuning.eliteSpeedRate || 1),
            eliteDamageRate: Number(combatTuning.eliteDamageRate || 1),
            bossHpRate: Number(combatTuning.bossHpRate || 1),
            bossDamageRate: Number(combatTuning.bossDamageRate || 1),
            bossSpeedRate: Number(combatTuning.bossSpeedRate || 1),
            bossBulletSpeedRate: Number(combatTuning.bossBulletSpeedRate || 1),
            xpDropRate: Number(combatTuning.xpDropRate || 1),
            eliteDropRate: Number(combatTuning.eliteDropRate || 1),
            bossDropRate: Number(combatTuning.bossDropRate || 1),
            normalDropCountBonus: Number(combatTuning.normalDropCountBonus || 0),
            eliteDropCountBonus: Number(combatTuning.eliteDropCountBonus || 0),
            bossDropCountBonus: Number(combatTuning.bossDropCountBonus || 0),
            waveHpGrowth,
            waveDamageGrowth
        };
        applyWeaponRuntimeModifiers(runtime, weaponIds);
        runtime.fireRate = Math.max(1.45, runtime.fireRate);
        runtime.projectileSpeed = Math.max(380, runtime.projectileSpeed);
        runtime.projectileRadius = Math.max(3, runtime.projectileRadius);
        runtime.critChance = clamp(runtime.critChance, 0.04, 0.68);
        return runtime;
    }

    function resolveChapterCombatTuning(chapter) {
        const battleTuning = (config.balance && config.balance.battleTuning) || {};
        const defaults = battleTuning.combatDefaults || {};
        const stageTuning = battleTuning.stageCombatTuning || {};
        const kindDefaults = defaults[chapter.kind] || defaults.normal || {};
        return {
            ...kindDefaults,
            ...(stageTuning[chapter.id] || {})
        };
    }

    function getStageEliteWindow(chapter) {
        const battleTuning = (config.balance && config.balance.battleTuning) || {};
        const windows = Array.isArray(battleTuning.eliteSpawnWindows) ? battleTuning.eliteSpawnWindows : [];
        const fallback = chapter.kind === 'boss' ? [0.58, 0.74] : chapter.kind === 'elite' ? [0.38, 0.56] : [0.45, 0.62];
        const chapterNo = Number(chapter.chapter || 1);
        const matched = windows.find((entry) => {
            if (!entry || !entry.stageRange) return false;
            const [start, end] = String(entry.stageRange).split('-');
            const startNo = Number(start) || chapterNo;
            if (end === 'x') return chapterNo >= startNo;
            const endNo = Number(end);
            return chapterNo >= startNo && chapterNo <= endNo;
        });
        const seconds = matched && Array.isArray(matched.seconds) ? matched.seconds : null;
        if (!seconds || seconds.length < 2) return fallback;
        const duration = Math.max(1, Number(chapter.duration || 120));
        return [clamp(seconds[0] / duration, 0.16, 0.88), clamp(seconds[1] / duration, 0.2, 0.92)];
    }

    function getBattleOpeningHint(chapter, combatTuning) {
        const kindHints = {
            normal: {
                zh: '拖动战机走位，优先吃经验球，别被小怪包住。',
                en: 'Drag to move, grab XP first, and avoid getting boxed in.'
            },
            elite: {
                zh: '精英会更早压进来，技能别空放，先稳住安全区。',
                en: 'Elites enter earlier here. Hold skills for value and keep a safe lane open.'
            },
            boss: {
                zh: 'Boss 关先保血和护盾，满能量后把大招留给首领。',
                en: 'Protect HP and shield first. Save the ultimate for the boss.'
            }
        };
        const stageHints = {
            '1-1': { zh: '先熟悉拖动和拾取，前半段压力很轻，优先把经验吃满。', en: 'Learn movement and pickups first. Early pressure is light, so focus on XP.' },
            '1-2': { zh: '继续先拿升级，再练习边走位边收经验。', en: 'Keep prioritizing early upgrades while practicing movement and XP pickup.' },
            '1-3': { zh: '这一关开始要边清线边走位，不要被残骸逼到角落。', en: 'Start clearing while moving here. Do not let wreckage trap you in corners.' },
            '1-4': { zh: '第二把武器开始发力，优先保持中线清怪空间。', en: 'Your second weapon starts to matter here. Keep the center lane clear.' },
            '1-5': { zh: '第一只精英会更早出现，留好大招收它。', en: 'The first elite shows up earlier here. Save the ultimate for it.' },
            '1-6': { zh: '首个 Boss 关先保护盾，第一发大招尽量留给首领。', en: 'Protect your shield first. Try to spend the first ultimate on the boss.' },
            '2-3': { zh: '从这里开始同时考验清怪和资源转化，别贪吃边角经验。', en: 'Wave clear and resource conversion both matter here. Do not overreach for edge XP.' },
            '2-5': { zh: '精英会连续压进来，保持横向移动比站桩更重要。', en: 'Elites chain together here. Lateral movement matters more than standing and firing.' },
            '2-6': { zh: '这一战开始要求稳定循环，技能不要空放。', en: 'This fight starts testing your full loop. Do not waste your skills.' },
            '3-3': { zh: '完整配装的检验点来了，先保住走位空间，再追输出。', en: 'This is the first full build check. Protect your movement space before chasing damage.' },
            '3-5': { zh: '精英压力会明显抬高，技能转好就主动换一波空间。', en: 'Elite pressure rises sharply here. Spend skills to buy space when they are ready.' },
            '3-6': { zh: '母舰弹幕更密，优先清掉贴身杂兵再盯首领。', en: 'The carrier fires denser patterns. Clear nearby mobs before tunneling the boss.' },
            '4-2': { zh: '后期从这里开始，边走边收才能保住节奏。', en: 'Late-game starts here: keep moving while collecting, or you lose tempo fast.' },
            '4-4': { zh: '这是终盘前的稳定性测试，护盾节奏和大招时机比硬拼更重要。', en: 'This is the pre-final stability check. Shield timing and ult rhythm beat brute force.' },
            '4-5': { zh: '主炮区会持续压屏，能清侧翼就别只盯正前方。', en: 'The main gun zone compresses the screen. Clear the flanks instead of tunneling forward.' },
            '4-6': { zh: '最终首领更吃节奏，留出位移空间，满能量就立刻出手。', en: 'The final boss is rhythm-heavy. Keep escape space open and cast as soon as you are charged.' }
        };
        return stageHints[chapter.id] || combatTuning.openingHint || kindHints[chapter.kind] || kindHints.normal;
    }

    function applyWeaponRuntimeModifiers(runtime, weaponIds) {
        const uniqueWeaponIds = Array.from(new Set((weaponIds || []).filter(Boolean)));
        uniqueWeaponIds.forEach((weaponId) => {
            switch (weaponId) {
                case 'pulse-gun':
                    runtime.fireRate += 0.22;
                    break;
                case 'arc-laser':
                    runtime.baseDamage *= 1.1;
                    runtime.projectileRadius += 0.6;
                    break;
                case 'shard-cannon':
                    runtime.baseDamage *= 1.14;
                    runtime.fireRate *= 0.92;
                    runtime.splashRadius = Math.max(runtime.splashRadius, 38);
                    break;
                case 'rail-spike':
                    runtime.pierce += 1;
                    runtime.projectileSpeed += 26;
                    runtime.baseDamage *= 1.06;
                    break;
                case 'swarm-missile':
                    runtime.sideShots += 1;
                    runtime.projectileTracking = Math.max(runtime.projectileTracking, 0.16);
                    break;
                case 'ion-ring':
                    runtime.closeBurstBase += 1;
                    runtime.baseDamage *= 1.04;
                    break;
                case 'tesla-web':
                    runtime.webPulse += 1;
                    runtime.controlPulse += 1;
                    break;
                case 'singularity-core':
                    runtime.baseDamage *= 1.2;
                    runtime.fireRate *= 0.9;
                    runtime.critChance += 0.14;
                    break;
                default:
                    break;
            }
        });
    }

    function updateBattle(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;
        const chapter = runtime.chapter;

        battle.timeRemaining = Math.max(0, battle.timeRemaining - delta);
        battle.player.invuln = Math.max(0, battle.player.invuln - delta);

        updatePlayerMotion(delta);
        updateAutoFire(delta);
        updateSpawns(delta);
        updateEnemies(delta);
        updateBullets(delta);
        updateEnemyBullets(delta);
        updateDrops(delta);
        updateEffects(delta);
        updatePassiveSystems(delta);
        updateLevelUp();

        if (battle.player.hp <= 0 && !battle.result) {
            onBattleDefeat(false);
            return;
        }

        if (!battle.result && battle.timeRemaining <= 0) {
            if (chapter.kind !== 'boss' || battle.bossKilled) {
                onBattleVictory();
            } else if (!battle.bossSpawned) {
                spawnBossEnemy();
            }
        }
    }

    function updatePlayerMotion(delta) {
        const battle = state.battle;
        const player = battle.player;
        const moveTowardX = battle.pointerActive ? battle.pointerX : player.x;
        const moveTowardY = battle.pointerActive ? battle.pointerY : player.y;
        const dx = moveTowardX - player.x;
        const dy = moveTowardY - player.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0.001) {
            const maxStep = Math.max(120, player.speed * 1.85) * delta;
            const stepRatio = Math.min(1, maxStep / distance);
            player.x += dx * stepRatio;
            player.y += dy * stepRatio;
        }
        player.x = clamp(player.x, 24, battle.width - 24);
        player.y = clamp(player.y, 36, battle.height - 34);
    }

    function updateAutoFire(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;
        battle.bulletTimer -= delta;
        if (battle.bulletTimer > 0) return;

        const target = getNearestEnemy();
        const fireRate = runtime.fireRate * (1 + (battle.choiceCounts['attack-rate'] || 0) * 0.12);
        battle.bulletTimer = 1 / fireRate;
        createPlayerBullet(target, 0);
        const sideShots = runtime.sideShots;
        for (let i = 1; i <= sideShots; i += 1) {
            createPlayerBullet(target, i * 18);
            createPlayerBullet(target, -i * 18);
        }
    }

    function createPlayerBullet(target, offsetX) {
        const battle = state.battle;
        const runtime = battle.runtime;
        const sourceX = battle.player.x + offsetX;
        const sourceY = battle.player.y - 8;
        let vx = 0;
        let vy = -runtime.projectileSpeed;
        if (target) {
            const dx = target.x - sourceX;
            const dy = target.y - sourceY;
            const dist = Math.max(1, Math.hypot(dx, dy));
            vx = dx / dist * runtime.projectileSpeed;
            vy = dy / dist * runtime.projectileSpeed;
        }
        battle.bullets.push({
            x: sourceX,
            y: sourceY,
            vx,
            vy,
            radius: runtime.projectileRadius,
            damage: runtime.baseDamage,
            pierce: runtime.pierce,
            crit: Math.random() < runtime.critChance,
            tracking: runtime.projectileTracking
        });
    }

    function updateSpawns(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;
        const chapter = runtime.chapter;

        if (chapter.kind === 'boss' && !battle.bossSpawned && battle.timeRemaining <= runtime.bossSpawnAt) {
            spawnBossEnemy();
        }

        battle.spawnTimer -= delta;
        if (battle.spawnTimer <= 0 && battle.enemies.filter((enemy) => !enemy.boss).length < runtime.enemyCap) {
            battle.spawnTimer = lerp(runtime.spawnIntervalStart || runtime.spawnInterval || 0.6, runtime.spawnIntervalEnd || runtime.spawnInterval || 0.42, getStageDensityProgress());
            spawnNormalEnemy();
        }

        battle.eliteTimer -= delta;
        if (runtime.allowEliteSpawns && battle.eliteTimer <= 0) {
            battle.eliteTimer = runtime.eliteEvery;
            if (!battle.bossSpawned || chapter.kind !== 'boss') {
                spawnEliteEnemy();
            }
        }
    }

    function spawnNormalEnemy() {
        const runtime = state.battle.runtime;
        const chapter = runtime.chapter;
        const density = getStageDensityProgress();
        const hpGrowth = 1 + density * runtime.waveHpGrowth;
        const damageGrowth = 1 + density * runtime.waveDamageGrowth;
        state.battle.enemies.push({
            kind: 'normal',
            boss: false,
            elite: false,
            x: 28 + Math.random() * Math.max(40, state.battle.width - 56),
            y: -24,
            radius: 12 + chapter.chapter * 0.8,
            hp: (18 + chapter.recommended * 0.12) * runtime.normalHpRate * hpGrowth,
            maxHp: (18 + chapter.recommended * 0.12) * runtime.normalHpRate * hpGrowth,
            speed: (44 + chapter.chapter * 12 + Math.random() * 22) * runtime.normalSpeedRate,
            damage: (8 + chapter.chapter * 4 + chapter.index * 2) * runtime.normalDamageRate * damageGrowth,
            shootTimer: 0,
            phase: Math.random() * Math.PI * 2,
            flash: 0
        });
    }

    function spawnEliteEnemy() {
        const runtime = state.battle.runtime;
        const chapter = runtime.chapter;
        const density = getStageDensityProgress();
        const hpGrowth = 1 + density * (runtime.waveHpGrowth * 0.72);
        const damageGrowth = 1 + density * (runtime.waveDamageGrowth * 0.72);
        state.battle.enemies.push({
            kind: 'elite',
            elite: true,
            boss: false,
            x: 34 + Math.random() * Math.max(30, state.battle.width - 68),
            y: -36,
            radius: 18,
            hp: (140 + chapter.recommended * 0.54) * runtime.eliteHpRate * hpGrowth,
            maxHp: (140 + chapter.recommended * 0.54) * runtime.eliteHpRate * hpGrowth,
            speed: (38 + chapter.chapter * 8) * runtime.eliteSpeedRate,
            damage: (16 + chapter.chapter * 5 + chapter.index * 2) * runtime.eliteDamageRate * damageGrowth,
            shootTimer: 1.2,
            phase: Math.random() * Math.PI * 2,
            flash: 0
        });
    }

    function spawnBossEnemy() {
        if (state.battle.bossSpawned) return;
        const runtime = state.battle.runtime;
        const chapter = runtime.chapter;
        state.battle.bossSpawned = true;
        state.battle.enemies.push({
            kind: 'boss',
            boss: true,
            elite: false,
            x: state.battle.width * 0.5,
            y: -60,
            radius: 32,
            hp: (540 + chapter.recommended * 2.4) * runtime.bossHpRate,
            maxHp: (540 + chapter.recommended * 2.4) * runtime.bossHpRate,
            speed: 28 * runtime.bossSpeedRate,
            damage: (28 + chapter.chapter * 6 + chapter.index * 3) * runtime.bossDamageRate,
            shootTimer: 0.9,
            phase: 0,
            flash: 0
        });
        pushEffect({ type: 'ring', x: state.battle.width * 0.5, y: 120, radius: 20, maxRadius: 180, life: 0.7, color: '#ff9e63' });
        showToast(text('首领已进入战场，准备释放大招。', 'Boss entered the field. Save your ultimate.'), 'warning');
    }

    function updateEnemies(delta) {
        const battle = state.battle;
        const player = battle.player;

        for (let index = battle.enemies.length - 1; index >= 0; index -= 1) {
            const enemy = battle.enemies[index];
            enemy.flash = Math.max(0, enemy.flash - delta * 4);
            enemy.phase += delta;

            if (enemy.boss) {
                enemy.x += Math.sin(enemy.phase * 1.8) * 48 * delta;
                enemy.y += (Math.min(118, battle.height * 0.22) - enemy.y) * Math.min(1, delta * 1.8);
                enemy.shootTimer -= delta;
                if (enemy.shootTimer <= 0) {
                    enemy.shootTimer = 1.1;
                    fireEnemySpread(enemy);
                }
            } else if (enemy.elite) {
                enemy.x += Math.sin(enemy.phase * 2.4) * 22 * delta;
                enemy.y += enemy.speed * delta;
                enemy.shootTimer -= delta;
                if (enemy.shootTimer <= 0) {
                    enemy.shootTimer = 1.8;
                    fireEnemyBullet(enemy, player.x, player.y, 160);
                }
            } else {
                const homeFactor = 0.08 + (battle.runtime.chapter.chapter - 1) * 0.02;
                enemy.x += (player.x - enemy.x) * homeFactor * delta * 6;
                enemy.y += enemy.speed * delta;
            }

            if (enemy.kind !== 'boss' && enemy.y > battle.height + 60) {
                battle.enemies.splice(index, 1);
                continue;
            }

            const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (distance <= enemy.radius + player.radius) {
                battle.enemies.splice(index, 1);
                damagePlayer(enemy.damage, enemy.boss ? 'boss' : enemy.elite ? 'elite' : 'normal');
                pushEffect({ type: 'spark', x: player.x, y: player.y, radius: 10, life: 0.35, color: '#ffb07a' });
            }
        }
    }

    function fireEnemySpread(enemy) {
        const speedRate = Number(state.battle.runtime.bossBulletSpeedRate || 1);
        fireEnemyBullet(enemy, state.battle.player.x, state.battle.player.y, 172 * speedRate);
        fireEnemyBullet(enemy, state.battle.player.x - 90, state.battle.player.y + 60, 156 * speedRate);
        fireEnemyBullet(enemy, state.battle.player.x + 90, state.battle.player.y + 60, 156 * speedRate);
    }

    function fireEnemyBullet(enemy, targetX, targetY, speed) {
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        state.battle.enemyBullets.push({
            x: enemy.x,
            y: enemy.y + enemy.radius * 0.8,
            vx: dx / dist * speed,
            vy: dy / dist * speed,
            radius: enemy.boss ? 6 : 5,
            damage: enemy.damage * 0.65
        });
    }

    function updateBullets(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;

        for (let index = battle.bullets.length - 1; index >= 0; index -= 1) {
            const bullet = battle.bullets[index];
            if (bullet.tracking > 0 && battle.enemies.length) {
                const target = getNearestEnemy();
                if (target) {
                    const speed = Math.max(1, Math.hypot(bullet.vx, bullet.vy));
                    const dx = target.x - bullet.x;
                    const dy = target.y - bullet.y;
                    const dist = Math.max(1, Math.hypot(dx, dy));
                    const targetVx = dx / dist * speed;
                    const targetVy = dy / dist * speed;
                    const turnRate = clamp(delta * (2.4 + bullet.tracking * 8), 0, 1);
                    bullet.vx = lerp(bullet.vx, targetVx, turnRate);
                    bullet.vy = lerp(bullet.vy, targetVy, turnRate);
                }
            }
            bullet.x += bullet.vx * delta;
            bullet.y += bullet.vy * delta;

            if (bullet.x < -20 || bullet.x > battle.width + 20 || bullet.y < -40 || bullet.y > battle.height + 40) {
                battle.bullets.splice(index, 1);
                continue;
            }

            for (let enemyIndex = battle.enemies.length - 1; enemyIndex >= 0; enemyIndex -= 1) {
                const enemy = battle.enemies[enemyIndex];
                if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) > enemy.radius + bullet.radius) continue;

                const critMult = bullet.crit ? runtime.critMult : 1;
                let damage = bullet.damage * critMult;
                if (enemy.boss) damage *= (1 + runtime.bossDamageBonus);
                enemy.hp -= damage;
                enemy.flash = 1;
                pushEffect({ type: 'spark', x: bullet.x, y: bullet.y, radius: bullet.crit ? 14 : 10, life: 0.22, color: bullet.crit ? '#ffe38c' : '#ffb07a' });

                if (runtime.splashRadius > 0) {
                    battle.enemies.forEach((other) => {
                        if (other === enemy) return;
                        if (Math.hypot(other.x - enemy.x, other.y - enemy.y) <= runtime.splashRadius) {
                            other.hp -= damage * 0.18;
                            other.flash = 0.7;
                        }
                    });
                }

                if (enemy.hp <= 0) {
                    onEnemyDefeated(enemy);
                    battle.enemies.splice(enemyIndex, 1);
                }

                if (bullet.pierce > 0) {
                    bullet.pierce -= 1;
                } else {
                    battle.bullets.splice(index, 1);
                    break;
                }
            }
        }
    }

    function updateEnemyBullets(delta) {
        const battle = state.battle;
        for (let index = battle.enemyBullets.length - 1; index >= 0; index -= 1) {
            const bullet = battle.enemyBullets[index];
            bullet.x += bullet.vx * delta;
            bullet.y += bullet.vy * delta;

            if (bullet.x < -24 || bullet.x > battle.width + 24 || bullet.y < -24 || bullet.y > battle.height + 24) {
                battle.enemyBullets.splice(index, 1);
                continue;
            }

            if (Math.hypot(bullet.x - battle.player.x, bullet.y - battle.player.y) <= bullet.radius + battle.player.radius) {
                battle.enemyBullets.splice(index, 1);
                damagePlayer(bullet.damage, 'projectile');
                pushEffect({ type: 'spark', x: bullet.x, y: bullet.y, radius: 12, life: 0.2, color: '#ff727b' });
            }
        }
    }

    function updateDrops(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;
        for (let index = battle.drops.length - 1; index >= 0; index -= 1) {
            const drop = battle.drops[index];
            const dx = battle.player.x - drop.x;
            const dy = battle.player.y - drop.y;
            const dist = Math.hypot(dx, dy);

            if (dist < runtime.pickupRange) {
                const pull = Math.max(180, 360 - dist * 2.4);
                drop.x += dx / Math.max(1, dist) * pull * delta;
                drop.y += dy / Math.max(1, dist) * pull * delta;
            } else {
                drop.vy = Math.min(24, drop.vy + delta * 24);
                drop.y += drop.vy * delta;
            }

            if (dist <= drop.radius + battle.player.radius + 6) {
                battle.xp += drop.value;
                battle.drops.splice(index, 1);
                continue;
            }
        }
    }

    function updateEffects(delta) {
        for (let index = state.battle.effects.length - 1; index >= 0; index -= 1) {
            const effect = state.battle.effects[index];
            effect.life -= delta;
            if (effect.type === 'ring') {
                effect.radius = lerp(effect.radius, effect.maxRadius || effect.radius, 0.12);
            }
            if (effect.type === 'text') {
                effect.y -= delta * 28;
            }
            if (effect.life <= 0) {
                state.battle.effects.splice(index, 1);
            }
        }
    }

    function updatePassiveSystems(delta) {
        const battle = state.battle;
        const runtime = battle.runtime;

        if (runtime.shieldRegen > 0) {
            battle.player.shield = Math.min(battle.player.maxShield, battle.player.shield + runtime.shieldRegen * delta);
        }
        if (runtime.hpRegen > 0) {
            battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + runtime.hpRegen * delta);
        }

        const chargeGain = runtime.chargePerSecond * (1 + (battle.choiceCounts['ultimate-charge'] || 0) * 0.16);
        battle.charge = Math.min(runtime.ultimateChargeNeed, battle.charge + chargeGain * delta);

        if (runtime.controlPulse > 0) {
            battle.runtime.controlPulseTimer = (battle.runtime.controlPulseTimer || 2.8) - delta;
            if (battle.runtime.controlPulseTimer <= 0) {
                battle.runtime.controlPulseTimer = 4.8;
                state.battle.enemies.forEach((enemy) => {
                    if (!enemy.boss && Math.hypot(enemy.x - battle.player.x, enemy.y - battle.player.y) <= 120) {
                        enemy.speed *= 0.82;
                        enemy.flash = 0.8;
                    }
                });
                pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 10, maxRadius: 120, life: 0.45, color: '#75ddff' });
            }
        }

        const dronePulseLevel = (battle.choiceCounts['drone-overclock'] || 0) + Number(runtime.dronePulse || 0);
        if (dronePulseLevel > 0) {
            battle.runtime.dronePulseTimer = (battle.runtime.dronePulseTimer || 2.2) - delta;
            if (battle.runtime.dronePulseTimer <= 0) {
                battle.runtime.dronePulseTimer = Math.max(1.1, 2.4 - dronePulseLevel * 0.28);
                state.battle.enemies.forEach((enemy) => {
                    if (Math.hypot(enemy.x - battle.player.x, enemy.y - battle.player.y) <= 116 + dronePulseLevel * 16) {
                        enemy.hp -= runtime.baseDamage * (0.26 + dronePulseLevel * 0.08);
                        enemy.flash = 0.8;
                    }
                });
                pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 12, maxRadius: 110 + dronePulseLevel * 14, life: 0.42, color: '#72ffca' });
            }
        }

        if (runtime.webPulse > 0) {
            battle.runtime.webPulseTimer = (battle.runtime.webPulseTimer || 2.6) - delta;
            if (battle.runtime.webPulseTimer <= 0) {
                battle.runtime.webPulseTimer = Math.max(1.7, 2.8 - runtime.webPulse * 0.2);
                state.battle.enemies.forEach((enemy) => {
                    if (Math.hypot(enemy.x - battle.player.x, enemy.y - battle.player.y) <= 124) {
                        enemy.hp -= runtime.baseDamage * 0.24;
                        enemy.speed *= 0.76;
                        enemy.flash = 0.9;
                    }
                });
                pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 10, maxRadius: 126, life: 0.32, color: '#8bc6ff' });
            }
        }

        const burstLevel = (battle.choiceCounts['close-burst'] || 0) + Number(runtime.closeBurstBase || 0);
        if (burstLevel > 0) {
            battle.runtime.burstTimer = (battle.runtime.burstTimer || 0.6) - delta;
            if (battle.runtime.burstTimer <= 0) {
                battle.runtime.burstTimer = Math.max(0.28, 0.62 - burstLevel * 0.08);
                state.battle.enemies.forEach((enemy) => {
                    if (Math.hypot(enemy.x - battle.player.x, enemy.y - battle.player.y) <= 86 + burstLevel * 18) {
                        enemy.hp -= runtime.baseDamage * (0.22 + burstLevel * 0.05);
                        enemy.flash = 0.7;
                    }
                });
                pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 8, maxRadius: 92 + burstLevel * 18, life: 0.24, color: '#c891ff' });
            }
        }
    }

    function updateLevelUp() {
        const battle = state.battle;
        if (battle.choiceOpen || battle.result) return;
        if (battle.xp < battle.xpToLevel) return;

        battle.xp -= battle.xpToLevel;
        battle.level += 1;
        battle.xpToLevel = Math.round(battle.xpToLevel * 1.32 + 8);
        battle.choiceOpen = true;
        battle.choiceOptions = createChoiceOptions();
        pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 12, maxRadius: 130, life: 0.52, color: '#ffd981' });
    }

    function createChoiceOptions() {
        const takenCount = Object.values(state.battle.choiceCounts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
        const corePool = (config.battleTuning?.choiceCorePool || CHOICE_IDS.slice(0, 4)).slice();
        const advancedPool = (config.battleTuning?.choiceAdvancedPool || CHOICE_IDS.slice(4)).slice();
        const fallbackPool = (config.battleTuning?.levelChoicePool || CHOICE_IDS).slice();
        const options = [];
        const seen = new Set();

        const pickFromPool = (source, count) => {
            const pool = source.slice();
            shuffle(pool);
            for (let index = 0; index < pool.length && count > 0; index += 1) {
                const choiceId = pool[index];
                if (seen.has(choiceId)) continue;
                seen.add(choiceId);
                options.push(choiceId);
                count -= 1;
            }
        };

        if (takenCount < 2) {
            pickFromPool(corePool, 3);
        } else if (takenCount < 4) {
            pickFromPool(corePool, 2);
            pickFromPool(advancedPool, 1);
        } else {
            pickFromPool(corePool, 1);
            pickFromPool(advancedPool, 2);
        }

        if (options.length < 3) {
            pickFromPool(fallbackPool, 3 - options.length);
        }
        return options.slice(0, 3);
    }

    function chooseBattlePerk(choiceId) {
        if (!state.battle.choiceOpen) return;
        const runtime = state.battle.runtime;
        state.battle.choiceOpen = false;
        state.battle.choiceCounts[choiceId] = (state.battle.choiceCounts[choiceId] || 0) + 1;

        switch (choiceId) {
            case 'attack-rate':
                runtime.baseDamage *= 1.16;
                runtime.fireRate *= 1.08;
                break;
            case 'projectile-count':
                runtime.sideShots = Math.min(2, runtime.sideShots + 1);
                break;
            case 'shield-refill':
                state.battle.player.maxShield *= 1.12;
                state.battle.player.shield = state.battle.player.maxShield;
                pushEffect({ type: 'ring', x: state.battle.player.x, y: state.battle.player.y, radius: 10, maxRadius: 120, life: 0.42, color: '#72b7ff' });
                break;
            case 'pickup-range':
                runtime.pickupRange += 22;
                break;
            case 'crit-arc':
                runtime.critChance += 0.12;
                runtime.splashRadius = Math.max(runtime.splashRadius, 48);
                break;
            case 'ultimate-charge':
                runtime.chargePerSecond *= 1.16;
                state.battle.charge = Math.min(runtime.ultimateChargeNeed, state.battle.charge + runtime.ultimateChargeNeed * 0.24);
                break;
            case 'drone-overclock':
                damageEnemiesInRadius(state.battle.player.x, state.battle.player.y, 118, runtime.baseDamage * 0.28);
                pushEffect({ type: 'ring', x: state.battle.player.x, y: state.battle.player.y, radius: 12, maxRadius: 118, life: 0.34, color: '#72ffca' });
                break;
            case 'close-burst':
                damageEnemiesInRadius(state.battle.player.x, state.battle.player.y, 94, runtime.baseDamage * 0.26);
                pushEffect({ type: 'ring', x: state.battle.player.x, y: state.battle.player.y, radius: 8, maxRadius: 94, life: 0.28, color: '#c891ff' });
                break;
            default:
                break;
        }

        showToast(localize(CHOICE_LIBRARY[choiceId]?.title || { zh: '已强化', en: 'Boosted' }), 'success');
    }

    function castUltimate() {
        const battle = state.battle;
        if (!battle.active || battle.choiceOpen || battle.result) return;
        if (battle.charge < battle.runtime.ultimateChargeNeed) {
            showToast(text('充能还没满。', 'Charge is not full yet.'), 'warning');
            return;
        }

        const runtime = battle.runtime;
        battle.charge = 0;
        pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 16, maxRadius: 180, life: 0.54, color: '#ffb273' });

        switch (runtime.ultimateId) {
            case 'phase-dash':
                battle.player.y = Math.max(52, battle.player.y - 96);
                battle.player.invuln = 0.7;
                damageEnemiesInRadius(battle.player.x, battle.player.y, 132, runtime.baseDamage * 4.2);
                break;
            case 'gravity-net':
                battle.enemies.forEach((enemy) => {
                    const dx = battle.player.x - enemy.x;
                    const dy = battle.player.y - enemy.y;
                    const dist = Math.max(1, Math.hypot(dx, dy));
                    enemy.x += dx / dist * Math.min(96, dist * 0.45);
                    enemy.y += dy / dist * Math.min(82, dist * 0.32);
                    enemy.hp -= runtime.baseDamage * 2.6;
                    enemy.flash = 1;
                });
                pushEffect({ type: 'ring', x: battle.player.x, y: battle.player.y, radius: 18, maxRadius: 160, life: 0.65, color: '#76d4ff' });
                break;
            case 'orbital-lance': {
                const boss = battle.enemies.find((enemy) => enemy.boss) || getNearestEnemy();
                const x = boss ? boss.x : battle.player.x;
                damageEnemiesInRadius(x, battle.height * 0.36, 92, runtime.baseDamage * 6.2, true);
                pushEffect({ type: 'beam', x, y: battle.height * 0.36, radius: 18, maxRadius: battle.height * 0.58, life: 0.48, color: '#ffd37a' });
                break;
            }
            case 'nova-burst':
            default:
                damageEnemiesInRadius(battle.player.x, battle.player.y, 220, runtime.baseDamage * 4.8);
                break;
        }

        showToast(text('大招已释放。', 'Ultimate cast!'), 'success');
    }

    function damageEnemiesInRadius(x, y, radius, damage, beamMode) {
        for (let index = state.battle.enemies.length - 1; index >= 0; index -= 1) {
            const enemy = state.battle.enemies[index];
            const dist = beamMode ? Math.abs(enemy.x - x) : Math.hypot(enemy.x - x, enemy.y - y);
            if (dist > radius + enemy.radius) continue;
            enemy.hp -= damage * (enemy.boss ? 0.9 : 1);
            enemy.flash = 1;
            if (enemy.hp <= 0) {
                onEnemyDefeated(enemy);
                state.battle.enemies.splice(index, 1);
            }
        }
    }

    function onEnemyDefeated(enemy) {
        const battle = state.battle;
        battle.kills += 1;
        battle.charge = Math.min(battle.runtime.ultimateChargeNeed, battle.charge + battle.runtime.chargeOnKill);
        if (enemy.elite) battle.eliteKills += 1;
        if (enemy.boss) battle.bossKilled = true;

        const runtime = battle.runtime;
        const baseValue = enemy.boss ? 24 : enemy.elite ? 12 : 5;
        const valueRate = enemy.boss ? runtime.bossDropRate : enemy.elite ? runtime.eliteDropRate : runtime.xpDropRate;
        const baseCount = enemy.boss ? 6 : enemy.elite ? 6 : 3;
        const countBonus = enemy.boss ? runtime.bossDropCountBonus : enemy.elite ? runtime.eliteDropCountBonus : runtime.normalDropCountBonus;
        const value = Math.max(1, baseValue * valueRate);
        spawnDrop(enemy.x, enemy.y, value, Math.max(1, Math.round(baseCount + countBonus)));
        pushEffect({
            type: 'spark',
            x: enemy.x,
            y: enemy.y,
            radius: enemy.boss ? 22 : enemy.elite ? 16 : 12,
            life: 0.34,
            color: enemy.boss ? '#ffcf8b' : enemy.elite ? '#d8adff' : '#ff9c62'
        });
        pushEffect({
            type: 'text',
            x: enemy.x,
            y: enemy.y - 8,
            text: enemy.boss ? text('首领击破', 'Boss Down') : enemy.elite ? text('精英击破', 'Elite Down') : `+${value} XP`,
            life: 0.7,
            color: enemy.boss ? '#ffdf9b' : '#eef4ff'
        });
    }

    function spawnDrop(x, y, value, count) {
        for (let index = 0; index < count; index += 1) {
            state.battle.drops.push({
                x: x + (Math.random() - 0.5) * 18,
                y: y + (Math.random() - 0.5) * 18,
                vy: Math.random() * 18,
                radius: 5,
                value: value / count
            });
        }
    }

    function damagePlayer(amount) {
        const player = state.battle.player;
        if (player.invuln > 0) return;
        player.invuln = 0.26;
        let remaining = amount;
        if (player.shield > 0) {
            const absorbed = Math.min(player.shield, remaining);
            player.shield -= absorbed;
            remaining -= absorbed;
        }
        if (remaining > 0) {
            player.hp -= remaining;
        }
    }

    function toggleBattlePause() {
        if (!state.battle.active || state.battle.result || state.battle.choiceOpen) return;
        state.battle.paused = !state.battle.paused;
        renderBattleOverlay();
        showToast(state.battle.paused ? text('战斗已暂停。', 'Battle paused.') : text('战斗继续。', 'Battle resumed.'), 'info');
    }

    function continueBattle() {
        if (!state.battle.result || state.battle.result.type !== 'defeat') return;
        const continueMeta = getBattleContinueMeta();
        if (!continueMeta.canContinue) {
            showToast(text('继续所需资源不足，先回整备升级一下。', 'Not enough resources to continue. Upgrade first and try again.'), 'warning');
            return;
        }
        if (state.battle.continueUsed >= (config.economy?.continueCosts || []).length) {
            showToast(text('本局继续次数已用完。', 'No continues left this run.'), 'warning');
            return;
        }

        if (continueMeta.useKey) {
            state.save.eliteKeys = Math.max(0, Number(state.save.eliteKeys || 0) - 1);
        } else {
            state.save.credits -= continueMeta.price;
        }
        state.battle.continueUsed += 1;
        state.battle.player.hp = Math.max(state.battle.player.maxHp * 0.42, state.battle.player.hp + state.battle.player.maxHp * 0.32);
        state.battle.player.shield = Math.max(state.battle.player.maxShield * 0.45, state.battle.player.maxShield * 0.6);
        state.battle.player.invuln = 1.2;
        state.battle.charge = state.battle.runtime.ultimateChargeNeed;
        state.battle.result = null;
        state.battle.paused = false;
        trimBattleThreat();
        saveProgress();
        showToast(continueMeta.useKey
            ? text('已消耗 1 把续航钥匙，抓紧反打。', 'Used 1 recovery key. Take the momentum back.')
            : text('已继续本局，抓紧反打。', 'Continue used. Take the momentum back.'), 'success');
    }

    function trimBattleThreat() {
        const removable = state.battle.enemies.filter((enemy) => !enemy.boss);
        const removeCount = Math.floor(removable.length * 0.3);
        for (let index = 0; index < removeCount; index += 1) {
            const enemy = removable[index];
            const listIndex = state.battle.enemies.indexOf(enemy);
            if (listIndex >= 0) state.battle.enemies.splice(listIndex, 1);
        }
        state.battle.enemyBullets.splice(0, Math.floor(state.battle.enemyBullets.length * 0.6));
    }

    function abandonBattle() {
        if (!state.battle.active) return;
        onBattleDefeat(true);
    }

    function onBattleVictory() {
        if (state.battle.result) return;
        const reward = buildBattleReward(true);
        applyReward(reward);
        unlockNextStage();
        state.save.stats.wins += 1;
        state.save.stats.stageClears += 1;
        state.save.stats.totalKills += state.battle.kills;
        state.save.stats.eliteKills += state.battle.eliteKills;
        state.save.stats.bossKills += state.battle.bossKilled ? 1 : 0;
        state.save.stats.survivalSeconds += Math.round(Number(state.battle.runtime.chapter.duration || 0));
        saveProgress();
        state.battle.result = {
            type: 'victory',
            title: text('胜利', 'Victory'),
            subtitle: text('本局结算已到账，是否继续下一关？', 'Rewards are settled. Continue to the next stage?'),
            reward,
            nextStageId: getNextChapterId(state.battle.runtime.chapter.id)
        };
        showToast(text('关卡完成，奖励已发放。', 'Stage clear, rewards granted.'), 'success');
    }

    function onBattleDefeat(isRetreat) {
        if (state.battle.result) return;
        const reward = buildBattleReward(false, isRetreat);
        applyReward(reward);
        state.save.stats.losses += isRetreat ? 0 : 1;
        state.save.stats.totalKills += state.battle.kills;
        state.save.stats.eliteKills += state.battle.eliteKills;
        state.save.stats.survivalSeconds += Math.round(Number(state.battle.runtime.chapter.duration || 0) - state.battle.timeRemaining);
        saveProgress();
        state.battle.result = {
            type: 'defeat',
            title: isRetreat ? text('已撤离', 'Retreated') : text('失败', 'Defeat'),
            subtitle: isRetreat ? text('已保留部分结算，回整备升级后再来。', 'Partial rewards secured. Upgrade and come back stronger.') : text('还能继续一次，或先回整备升级。', 'You can continue once more or return to upgrade.'),
            reward,
            retreat: isRetreat
        };
        showToast(isRetreat ? text('已撤离并保留部分结算。', 'Retreated with partial rewards.') : text('战机损毁，先升级后再来挑战。', 'Ship destroyed. Upgrade and try again.'), 'warning');
    }

    function closeBattleResult(action) {
        const result = state.battle.result;
        if (!result) return;
        const nextStageId = result.nextStageId;
        const wasVictory = result.type === 'victory';
        resetBattleState();
        state.battle.active = false;
        if (action === 'next' && wasVictory && nextStageId && chapterMap[nextStageId]) {
            state.save.selectedChapterId = nextStageId;
        }
        state.tab = action === 'arsenal' ? 'arsenal' : 'run';
        state.save.tab = state.tab;
        saveProgress();
        renderAll();
    }

    function buildBattleReward(isVictory, isRetreat) {
        const chapter = state.battle.runtime.chapter;
        const base = { ...(chapter.reward || {}) };
        const bonusRuns = getDailyBonusRunInfo();
        let multiplier = isVictory ? 1 : isRetreat ? 0.35 : 0.46;
        const growthMultiplier = 1 + Number(state.battle.runtime.rewardGrowthRate || 0);
        if (isVictory && bonusRuns.left > 0) {
            multiplier += 0.15;
            state.save.freeRunsUsedToday += 1;
        }

        base.credits = Math.round((base.credits || 0) * multiplier * growthMultiplier * (1 + state.battle.runtime.bonusCreditRate));
        base.alloy = Math.round((base.alloy || 0) * multiplier * growthMultiplier * (1 + state.battle.runtime.bonusAlloyRate));
        base.signal = Math.round((base.signal || 0) * multiplier * growthMultiplier * (1 + state.battle.runtime.bonusSignalRate));
        base.seasonXp = Math.round((base.seasonXp || 0) * multiplier * growthMultiplier);

        if (chapter.kind === 'elite' || chapter.kind === 'boss') {
            base.credits = Math.round(base.credits * (1 + state.battle.runtime.bonusEliteRate));
            base.alloy = Math.round(base.alloy * (1 + state.battle.runtime.bonusEliteRate * 0.6));
            base.signal = Math.round(base.signal * (1 + state.battle.runtime.bonusEliteRate));
        }

        return base;
    }

    function updateBattleHud() {
        if (!state.battle.active) return;
        const battle = state.battle;
        const chapter = battle.runtime.chapter;
        const hpRatio = battle.player.maxHp > 0 ? battle.player.hp / battle.player.maxHp : 0;
        const shieldRatio = battle.player.maxShield > 0 ? battle.player.shield / battle.player.maxShield : 0;
        const chargeRatio = battle.runtime.ultimateChargeNeed > 0 ? battle.charge / battle.runtime.ultimateChargeNeed : 0;

        battle.ui.hpValue.textContent = `${Math.round(Math.max(0, battle.player.hp))} / ${Math.round(battle.player.maxHp)}`;
        battle.ui.shieldValue.textContent = `${Math.round(Math.max(0, battle.player.shield))} / ${Math.round(battle.player.maxShield)}`;
        battle.ui.timerValue.textContent = formatBattleTime(battle.timeRemaining);
        battle.ui.chargeValue.textContent = `${Math.round(Math.min(battle.charge, battle.runtime.ultimateChargeNeed))} / ${battle.runtime.ultimateChargeNeed}`;
        battle.ui.stageLabel.textContent = `${chapter.id} · ${localize(chapter.name)}`;
        battle.ui.hpFill.style.width = `${Math.max(0, Math.min(100, hpRatio * 100))}%`;
        battle.ui.shieldFill.style.width = `${Math.max(0, Math.min(100, shieldRatio * 100))}%`;
        battle.ui.chargeFill.style.width = `${Math.max(0, Math.min(100, chargeRatio * 100))}%`;
        battle.ui.chargeRing.style.transform = `scaleX(${Math.max(0, Math.min(1, chargeRatio))})`;
        battle.ui.skillBtn.classList.toggle('is-ready', chargeRatio >= 1);
        battle.ui.skillText.textContent = chargeRatio >= 1
            ? localize(ultimateMap[battle.runtime.ultimateId]?.name || { zh: '释放大招', en: 'Cast Ultimate' })
            : text('充能中', 'Charging');
        battle.ui.goalStrip.innerHTML = renderBattleGoals();
    }

    function renderBattleGoals() {
        const battle = state.battle;
        const chapter = battle.runtime.chapter;
        const pills = [
            {
                icon: '✦',
                label: chapter.kind === 'boss'
                    ? (battle.bossSpawned ? (battle.bossKilled ? text('首领已清除', 'Boss Down') : text('首领作战中', 'Boss Active')) : text('首领即将出现', 'Boss Incoming'))
                    : text(`击破 ${battle.kills}`, `Kills ${battle.kills}`),
                active: battle.bossSpawned || battle.kills > 0
            },
            {
                icon: '▲',
                label: text(`Lv.${battle.level} · ${Math.floor(battle.xp)}/${battle.xpToLevel}`, `Lv.${battle.level} · ${Math.floor(battle.xp)}/${battle.xpToLevel}`),
                active: battle.level >= 2
            },
            {
                icon: '◎',
                label: text(`精英 ${battle.eliteKills}`, `Elite ${battle.eliteKills}`),
                active: battle.eliteKills > 0
            },
            {
                icon: '⟡',
                label: battle.continueUsed > 0
                    ? text(`续关 ${battle.continueUsed}/${(config.economy?.continueCosts || []).length}`, `Continue ${battle.continueUsed}/${(config.economy?.continueCosts || []).length}`)
                    : Number(state.save.eliteKeys || 0) > 0
                        ? text(`钥匙 ${state.save.eliteKeys}`, `Keys ${state.save.eliteKeys}`)
                        : text('稳态', 'Stable'),
                active: battle.continueUsed > 0 || Number(state.save.eliteKeys || 0) > 0
            }
        ];
        return pills.map((pill) => `
            <span class="of-goal-pill ${pill.active ? 'is-active' : ''}">
                <span>${escapeHtml(pill.icon)}</span>
                <span>${escapeHtml(pill.label)}</span>
            </span>
        `).join('');
    }

    function renderBattleOverlay() {
        if (!state.battle.active || !state.battle.ui.overlay) return;
        const battle = state.battle;
        if (battle.choiceOpen) {
            battle.ui.overlay.innerHTML = `
                <div class="of-choice-card">
                    <div>
                        <div class="eyebrow">${escapeHtml(text('局内升级', 'In-Run Upgrade'))}</div>
                        <h3>${escapeHtml(text('三选一，立刻生效', 'Choose one, apply instantly'))}</h3>
                    </div>
                    <div class="of-choice-grid">
                        ${battle.choiceOptions.map((choiceId) => `
                            <button class="of-choice-btn" type="button" data-action="choosePerk" data-value="${escapeHtml(choiceId)}">
                                <strong>${escapeHtml(localize(CHOICE_LIBRARY[choiceId].title))}</strong>
                                <span class="of-copy is-tight">${escapeHtml(localize(CHOICE_LIBRARY[choiceId].desc))}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            return;
        }

        if (battle.result) {
            const continueMeta = getBattleContinueMeta();
            const canContinue = battle.result.type === 'defeat'
                && !battle.result.retreat
                && continueMeta.canContinue;
            battle.ui.overlay.innerHTML = `
                <div class="of-result-card">
                    <div>
                        <div class="eyebrow">${escapeHtml(battle.result.type === 'victory' ? text('战斗结算', 'Battle Result') : text('战斗结束', 'Run Ended'))}</div>
                        <h3>${escapeHtml(battle.result.title)}</h3>
                        <div class="of-copy">${escapeHtml(battle.result.subtitle)}</div>
                    </div>
                    <div class="of-result-grid">
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">◎</span>
                                <strong>${escapeHtml(text('本局奖励', 'Run Rewards'))}</strong>
                            </div>
                            <div class="of-copy is-tight">${renderRewardInline(battle.result.reward)}</div>
                        </div>
                        <div class="of-inline-card">
                            <div class="of-inline-head">
                                <span class="of-badge-icon">✦</span>
                                <strong>${escapeHtml(text('战斗数据', 'Battle Stats'))}</strong>
                            </div>
                            <div class="of-copy is-tight">${escapeHtml(text(`击破 ${battle.kills} · 精英 ${battle.eliteKills} · 等级 ${battle.level}`, `Kills ${battle.kills} · Elite ${battle.eliteKills} · Level ${battle.level}`))}</div>
                        </div>
                    </div>
                    <div class="of-action-row">
                        ${canContinue ? `<button class="ghost-btn" type="button" data-action="battleContinue">${escapeHtml(continueMeta.label)}</button>` : ''}
                        <button class="ghost-btn" type="button" data-action="closeBattleResult" data-value="arsenal">${escapeHtml(text('回整备', 'Open Arsenal'))}</button>
                        <button class="primary-btn" type="button" data-action="closeBattleResult" data-value="${battle.result.type === 'victory' && battle.result.nextStageId ? 'next' : 'run'}">${escapeHtml(battle.result.type === 'victory' && battle.result.nextStageId ? text('下一关', 'Next Stage') : text('返回闯关', 'Back To Run'))}</button>
                    </div>
                </div>
            `;
            return;
        }

        if (battle.paused || battle.pausedByVisibility) {
            battle.ui.overlay.innerHTML = `
                <div class="of-overlay-card">
                    <div>
                        <div class="eyebrow">${escapeHtml(text('战斗暂停', 'Battle Paused'))}</div>
                        <h3>${escapeHtml(text('当前战斗保持中', 'Current battle is on hold'))}</h3>
                        <div class="of-copy">${escapeHtml(text('继续后会回到同一场战斗。', 'Resume to return to the same battle.'))}</div>
                    </div>
                    <div class="of-action-row">
                        <button class="ghost-btn" type="button" data-action="battleRetreat">${escapeHtml(text('撤离结算', 'Retreat'))}</button>
                        <button class="primary-btn" type="button" data-action="togglePause">${escapeHtml(text('继续战斗', 'Resume'))}</button>
                    </div>
                </div>
            `;
            return;
        }

        battle.ui.overlay.innerHTML = '';
    }

    function drawBattle() {
        if (!state.battle.active || !state.battle.ctx) return;
        const ctx = state.battle.ctx;
        const battle = state.battle;

        ctx.clearRect(0, 0, battle.width, battle.height);
        drawBattleBackground(ctx);
        drawDrops(ctx);
        drawEnemyBullets(ctx);
        drawEnemies(ctx);
        drawPlayerBullets(ctx);
        drawPlayer(ctx);
        drawEffects(ctx);
        renderBattleVfxHtml();
    }

    function drawBattleBackground(ctx) {
        const battle = state.battle;
        ctx.save();
        const timeOffset = (performance.now() * 0.02) % 48;
        for (let index = -1; index < 18; index += 1) {
            const y = index * 48 + timeOffset;
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(battle.width, y);
            ctx.stroke();
        }
        for (let index = 0; index < 36; index += 1) {
            const x = (index * 71.3) % battle.width;
            const y = (index * 97.1 + timeOffset * 1.4) % battle.height;
            ctx.fillStyle = index % 4 === 0 ? 'rgba(255, 179, 102, 0.22)' : 'rgba(255,255,255,0.12)';
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.restore();
    }

    function drawPlayer(ctx) {
        const player = state.battle.player;
        ctx.save();
        if ((state.battle.choiceCounts['close-burst'] || 0) > 0) {
            ctx.fillStyle = 'rgba(200,145,255,0.08)';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 28 + (state.battle.choiceCounts['close-burst'] || 0) * 6, 0, Math.PI * 2);
            ctx.fill();
        }
        if (player.shield > 0) {
            ctx.strokeStyle = 'rgba(104,183,255,0.65)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius + 7, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = player.invuln > 0 ? '#ffe4b6' : '#ffa84d';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - player.radius - 6);
        ctx.lineTo(player.x - player.radius, player.y + player.radius);
        ctx.lineTo(player.x + player.radius, player.y + player.radius);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#122033';
        ctx.beginPath();
        ctx.arc(player.x, player.y + 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawEnemies(ctx) {
        state.battle.enemies.forEach((enemy) => {
            ctx.save();
            if (enemy.boss) {
                ctx.fillStyle = `rgba(255, 122, 131, ${0.55 + enemy.flash * 0.3})`;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius + 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff9e63';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffd18a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius - 12, 0, Math.PI * 2);
                ctx.stroke();
                drawEnemyHpBar(ctx, enemy, 78);
            } else if (enemy.elite) {
                ctx.translate(enemy.x, enemy.y);
                ctx.rotate(enemy.phase * 0.8);
                ctx.fillStyle = `rgba(200, 145, 255, ${0.62 + enemy.flash * 0.2})`;
                ctx.beginPath();
                for (let point = 0; point < 6; point += 1) {
                    const angle = point / 6 * Math.PI * 2;
                    const radius = point % 2 === 0 ? enemy.radius + 4 : enemy.radius - 2;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    if (point === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
                drawEnemyHpBar(ctx, enemy, 52, true);
            } else {
                ctx.translate(enemy.x, enemy.y);
                ctx.rotate(enemy.phase * 1.6);
                ctx.fillStyle = `rgba(255, 168, 77, ${0.7 + enemy.flash * 0.18})`;
                ctx.beginPath();
                ctx.moveTo(0, -enemy.radius);
                ctx.lineTo(enemy.radius, 0);
                ctx.lineTo(0, enemy.radius);
                ctx.lineTo(-enemy.radius, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });
    }

    function drawEnemyHpBar(ctx, enemy, width, translated) {
        ctx.save();
        if (!translated) ctx.translate(enemy.x, enemy.y);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(-width / 2, -enemy.radius - 18, width, 6);
        ctx.fillStyle = enemy.boss ? '#ffb272' : '#c891ff';
        ctx.fillRect(-width / 2, -enemy.radius - 18, width * clamp(enemy.hp / enemy.maxHp, 0, 1), 6);
        ctx.restore();
    }

    function drawPlayerBullets(ctx) {
        ctx.save();
        state.battle.bullets.forEach((bullet) => {
            ctx.fillStyle = bullet.crit ? '#ffe08b' : '#fff2d7';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius + (bullet.crit ? 1 : 0), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    function drawEnemyBullets(ctx) {
        ctx.save();
        state.battle.enemyBullets.forEach((bullet) => {
            ctx.fillStyle = '#ff747d';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    function drawDrops(ctx) {
        ctx.save();
        state.battle.drops.forEach((drop) => {
            ctx.fillStyle = '#64ffb2';
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.28)';
            ctx.beginPath();
            ctx.arc(drop.x - 1, drop.y - 1, drop.radius * 0.45, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    function drawEffects(ctx) {
        ctx.save();
        state.battle.effects.forEach((effect) => {
            const alpha = clamp(effect.life / 0.7, 0, 1);
            if (effect.type === 'ring') {
                ctx.strokeStyle = withAlpha(effect.color || '#ffb273', alpha);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (effect.type === 'beam') {
                ctx.fillStyle = withAlpha(effect.color || '#ffd272', alpha * 0.28);
                ctx.fillRect(effect.x - effect.radius, effect.y - effect.maxRadius * 0.5, effect.radius * 2, effect.maxRadius);
            } else if (effect.type === 'spark') {
                ctx.fillStyle = withAlpha(effect.color || '#ffb273', alpha);
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius * alpha, 0, Math.PI * 2);
                ctx.fill();
            } else if (effect.type === 'text') {
                ctx.fillStyle = withAlpha(effect.color || '#ffffff', alpha);
                ctx.font = '600 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(effect.text || '', effect.x, effect.y);
            }
        });
        ctx.restore();
    }

    function renderBattleVfxHtml() {
        if (!state.battle.ui.vfx) return;
        const fragments = [];
        if (state.battle.bossSpawned && !state.battle.bossKilled) {
            fragments.push(`<div class="of-battle-hint" style="top:auto;bottom:12px;">${escapeHtml(text('首领在场：优先走位，满能量后直接放大招。', 'Boss active: keep moving and cast as soon as charged.'))}</div>`);
        }
        state.battle.ui.vfx.innerHTML = fragments.join('');
    }

    function selectChapter(chapterId) {
        if (!chapterMap[chapterId]) return;
        if (!isStageUnlocked(chapterId)) {
            showToast(getUnlockText(chapterId), 'warning');
            return;
        }
        state.save.selectedChapterId = chapterId;
        saveProgress();
        if (state.tab === 'run') renderAll();
    }

    function selectHull(hullId) {
        if (!hullMap[hullId] || !isContentUnlocked(hullMap[hullId].unlockStage || '1-1')) return;
        state.save.selectedHullId = hullId;
        saveProgress();
        renderAll();
    }

    function selectWeapon(weaponId) {
        const weapon = weaponMap[weaponId];
        if (!weapon || !isContentUnlocked(weapon.unlockStage || '1-1')) return;
        const current = state.save.selectedWeaponIds.slice(0, 2).filter((id) => weaponMap[id]);
        if (current.includes(weaponId)) {
            const reordered = [weaponId, ...current.filter((id) => id !== weaponId)];
            state.save.selectedWeaponIds = reordered.slice(0, 2);
        } else if (current.length < 2) {
            current.push(weaponId);
            state.save.selectedWeaponIds = current;
        } else {
            state.save.selectedWeaponIds = [current[0], weaponId];
        }
        saveProgress();
        renderAll();
    }

    function selectDrone(droneId) {
        if (!droneMap[droneId] || !isContentUnlocked(droneMap[droneId].unlockStage || '1-1')) return;
        state.save.selectedDroneId = droneId;
        saveProgress();
        renderAll();
    }

    function selectUltimate(ultimateId) {
        if (!ultimateMap[ultimateId] || !isContentUnlocked(ultimateMap[ultimateId].unlockStage || '1-1')) return;
        state.save.selectedUltimateId = ultimateId;
        saveProgress();
        renderAll();
    }

    function upgradeUnit(type, entryId) {
        const levelGetter = type === 'hull' ? getHullLevel : type === 'weapon' ? getWeaponLevel : type === 'drone' ? getDroneLevel : getUltimateLevel;
        const currentLevel = levelGetter(entryId);
        const nextCost = getUnitNextCost(type, currentLevel);
        if (!nextCost) {
            showToast(text('当前已满级。', 'Already maxed.'), 'warning');
            return;
        }
        if (!canAfford(nextCost)) {
            showToast(text('资源不足，先去闯关或补给。', 'Not enough resources. Run stages or get supplies first.'), 'warning');
            return;
        }
        spendCost(nextCost);
        if (type === 'hull') state.save.hullLevels[entryId] = currentLevel + 1;
        else if (type === 'weapon') state.save.weaponLevels[entryId] = currentLevel + 1;
        else if (type === 'drone') state.save.droneLevels[entryId] = currentLevel + 1;
        else state.save.ultimateLevels[entryId] = currentLevel + 1;
        saveProgress();
        renderAll();
        showToast(text('升级完成。', 'Upgrade complete.'), 'success');
    }

    function upgradeResearch(researchId) {
        const entry = researchMap[researchId];
        if (!entry) return;
        const currentLevel = getResearchLevel(researchId);
        const next = entry.levels?.[currentLevel];
        if (!next) {
            showToast(text('该研究已满级。', 'Research is maxed.'), 'warning');
            return;
        }

        const discounted = applyResearchDiscount(next);
        if (!canAfford(discounted)) {
            showToast(text('信用点或信号不足。', 'Not enough credits or signal.'), 'warning');
            return;
        }
        spendCost(discounted);
        state.save.researchLevels[researchId] = currentLevel + 1;
        saveProgress();
        renderAll();
        showToast(text('研究升级完成。', 'Research upgraded.'), 'success');
    }

    function claimMission(missionId) {
        const mission = missionMap[missionId];
        if (!mission || state.save.missionClaimed.includes(missionId)) return;
        if (getMissionProgress(mission) < mission.target) {
            showToast(text('任务进度还没完成。', 'Mission is not complete yet.'), 'warning');
            return;
        }
        state.save.missionClaimed.push(missionId);
        applyReward(mission.reward);
        saveProgress();
        renderAll();
        showToast(text('任务奖励已领取。', 'Mission rewards claimed.'), 'success');
    }

    function claimSeasonReward(track, nodeId) {
        const list = track === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack;
        const node = (list || []).find((item) => item.id === nodeId);
        if (!node) return;
        const targetList = track === 'premium' ? state.save.seasonClaimedPremium : state.save.seasonClaimed;
        if (targetList.includes(nodeId)) return;
        if (track === 'premium' && !state.save.payment.premiumSeason) {
            showToast(text('先启用高级线。', 'Unlock premium first.'), 'warning');
            return;
        }
        if (state.save.seasonXp < Number(node.xp || 0)) {
            showToast(text('赛季经验还不够。', 'Not enough season XP.'), 'warning');
            return;
        }
        targetList.push(nodeId);
        applyReward(node.reward);
        saveProgress();
        renderAll();
        showToast(text('赛季奖励已领取。', 'Season reward claimed.'), 'success');
    }

    function claimDailySupply() {
        const item = config.shopItems.find((entry) => entry.daily);
        if (!item) return;
        if (!canClaimDailySupply()) {
            showToast(text('每日补给还在冷却中。', 'Daily supply is still cooling down.'), 'warning');
            return;
        }
        state.save.dailySupplyAt = Date.now();
        applyReward(item.reward);
        saveProgress();
        renderAll();
        showToast(text('每日补给已到账。', 'Daily supply claimed.'), 'success');
    }

    function buyShopItem(itemId) {
        const item = shopMap[itemId];
        if (!item || item.daily) return;
        if (Number(state.save.credits || 0) < Number(item.price || 0)) {
            showToast(text('金币不足。', 'Not enough credits.'), 'warning');
            return;
        }
        state.save.credits -= Number(item.price || 0);
        applyReward(item.reward);
        saveProgress();
        renderAll();
        showToast(text('购买成功。', 'Purchase successful.'), 'success');
    }

    function openPaymentModal(offerId) {
        const activePendingOrder = getActivePendingPaymentOrder();
        if (activePendingOrder && activePendingOrder.offerId && activePendingOrder.offerId !== offerId) {
            selectedPaymentOfferId = activePendingOrder.offerId;
            showToast(text('当前有一笔待处理订单，先完成这笔会更稳。', 'A pending order is already open. Finish that one first.'), 'info');
        } else if (offerId && offerMap[offerId]) {
            selectedPaymentOfferId = offerId;
        } else if (!offerMap[selectedPaymentOfferId]) {
            selectedPaymentOfferId = config.paymentOffers?.[0]?.id || 'starter';
        }
        state.paymentOpen = true;
        paymentStatusTone = 'info';
        renderAll();
        const storedOrder = getPendingOrderForOffer(selectedPaymentOfferId);
        if (storedOrder) {
            syncPaymentOrderStatus(selectedPaymentOfferId).catch(() => {});
        }
    }

    function closePaymentModal() {
        state.paymentOpen = false;
        renderAll();
    }

    function refreshPaymentUi() {
        const offer = offerMap[selectedPaymentOfferId] || config.paymentOffers[0];
        if (!offer) return;
        const order = getPendingOrderForOffer(offer.id);
        const orderStatus = String(order?.status || '').toLowerCase();
        const owned = isOfferOwned(offer.id);
        const activePendingOrder = getActivePendingPaymentOrder();
        const isLockedToOtherOrder = !!(activePendingOrder && activePendingOrder.offerId && activePendingOrder.offerId !== offer.id);

        ui.paymentEyebrow.textContent = text('链上支付', 'On-Chain Payment');
        ui.paymentTitle.textContent = text('支付中心', 'Payment Hub');
        ui.paymentDesc.textContent = text('建单 → 精确支付 → 粘贴 TXID 领取。', 'Create order → exact pay → paste TXID.');

        ui.paymentOfferGrid.innerHTML = (config.paymentOffers || []).map((entry) => {
            const selected = entry.id === offer.id;
            const entryOwned = isOfferOwned(entry.id);
            const recommended = getRelevantPressurePoint(getSelectedChapter().id)?.recommendedOffer === entry.id;
            return `
                <button class="of-payment-offer ${selected ? 'is-selected' : ''}" type="button" data-select-payment-offer="${escapeHtml(entry.id)}">
                    <div class="of-offer-top">
                        <strong class="of-offer-name">${escapeHtml(localize(entry.name))}</strong>
                        <span class="of-offer-price">${escapeHtml(`${Number(entry.price || 0).toFixed(0)} USDT`)}</span>
                    </div>
                    <div class="of-copy is-tight is-2line">${escapeHtml(localize(entry.permanentText || entry.permanent || { zh: '长期收益', en: 'Long-term benefit' }))}</div>
                    <div class="of-copy is-tight is-2line">${escapeHtml(getOfferFitHint(entry))}</div>
                    <div class="of-action-row">
                        ${recommended ? `<span class="of-chip is-good">${escapeHtml(text('更适合当前进度', 'Fits current progress'))}</span>` : '<span></span>'}
                        <span class="of-chip ${entryOwned ? 'is-good' : 'is-accent'}">${escapeHtml(entryOwned ? text('已拥有', 'Owned') : text('可购买', 'Available'))}</span>
                    </div>
                </button>
            `;
        }).join('');

        if (ui.paymentImpact) {
            ui.paymentImpact.innerHTML = renderPaymentImpact(offer, order, activePendingOrder);
        }

        ui.paymentAmount.textContent = order ? `${formatPaymentAmount(order.exactAmount)} USDT` : `${Number(offer.price || 0).toFixed(2)} USDT`;
        ui.paymentMeta.textContent = order
            ? `${order.network || 'TRON (TRC20)'} · ${text('按精确金额支付', 'Pay exact amount')}`
            : `TRON (TRC20) · ${text('先建单获取精确金额', 'Create order to get exact amount')}`;
        ui.paymentOrderLabel.textContent = text('订单', 'Order');
        ui.paymentOrderId.textContent = order?.orderId || order?.id || '--';
        ui.paymentExactLabel.textContent = text('金额', 'Amount');
        ui.paymentExactAmount.textContent = order ? `${formatPaymentAmount(order.exactAmount)} USDT` : text('建单后显示', 'Shown after create');
        ui.paymentExpiryLabel.textContent = text('时效', 'Time Left');
        ui.paymentAddressLabel.textContent = text('地址', 'Address');
        ui.paymentWallet.textContent = getPaymentAddress(order) || text('建单后显示地址', 'Address appears after create');
        ui.paymentCreateBtn.textContent = orderStatus === 'paid'
            ? text('恢复奖励', 'Restore Rewards')
            : order
                ? text('查单', 'Check')
                : text('建单', 'Create');
        ui.paymentCopyAddressBtn.textContent = text('复制地址', 'Copy Address');
        ui.paymentCopyAmountBtn.textContent = text('复制金额', 'Copy Amount');
        ui.paymentTxidLabel.textContent = text('粘贴 TXID', 'Paste TXID');
        ui.paymentTxidInput.placeholder = text('输入或粘贴交易哈希', 'Enter or paste the transaction hash');
        ui.paymentTxidHint.textContent = text('订单、地址、金额和时效需完全一致。', 'Order, address, amount, and time must match.');
        ui.paymentVerifyBtn.textContent = owned ? text('已生效', 'Already Applied') : text('校验并领取', 'Verify & Claim');
        ui.paymentCreateBtn.disabled = owned || isLockedToOtherOrder;
        ui.paymentCopyAddressBtn.disabled = !order;
        ui.paymentCopyAmountBtn.disabled = !order;
        ui.paymentVerifyBtn.disabled = owned || !order;

        const statusText = isLockedToOtherOrder
            ? text('当前有其他待处理订单，请先完成那一笔。', 'Another pending order is still active. Finish that one first.')
            : owned
            ? text('该礼包已生效。', 'This pack is active.')
            : orderStatus === 'paid'
                ? text('这笔支付已确认，点击恢复奖励即可到账。', 'This payment is confirmed. Tap Restore Rewards to apply it.')
            : order
                ? text('订单已生成，支付后粘贴 TXID。', 'Order ready. Paste TXID after payment.')
                : text('先建单，再支付并校验。', 'Create order, then pay and verify.');
        ui.paymentStatus.textContent = statusText;
        ui.paymentStatus.style.color = paymentStatusTone === 'warning'
            ? '#ffd766'
            : paymentStatusTone === 'success'
                ? '#9fffd0'
                : 'var(--of-text-soft)';

        updatePaymentExpiryUI();
    }

    function getPaymentExpiryLabel(order) {
        if (!order) return text('未建单', 'No Order');
        if (!order.expiresAt) return text('处理中', 'Pending');
        if (isPendingOrderExpired(order)) return text('已过期', 'Expired');
        const remainingMs = Math.max(0, new Date(order.expiresAt).getTime() - Date.now());
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return text(`剩 ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`);
    }

    function updatePaymentExpiryUI() {
        if (!ui.paymentExpiry) return;
        const order = getPendingOrderForOffer(selectedPaymentOfferId);
        if (!order || !order.expiresAt) {
            ui.paymentExpiry.textContent = '--:--';
            return;
        }
        const remainingMs = Math.max(0, new Date(order.expiresAt).getTime() - Date.now());
        if (remainingMs <= 0) {
            ui.paymentExpiry.textContent = '00:00';
            return;
        }
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        ui.paymentExpiry.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function renderPaymentImpact(offer, order, activePendingOrder) {
        const rewardSummary = renderRewardChips(offer.reward || {});
        const bonusSummary = renderPaymentBonusChips(offer);
        const fitHint = getOfferFitHint(offer);
        const progressHint = getOfferProgressImpactHint(offer);
        const activeOrderHint = activePendingOrder && activePendingOrder.offerId !== offer.id
            ? text(`当前有一笔 ${localize(offerMap[activePendingOrder.offerId]?.name || { zh: '待处理订单', en: 'pending order' })} 待处理，先完成那一笔即可。`, `There is already a pending ${localize(offerMap[activePendingOrder.offerId]?.name || { zh: 'order', en: 'order' })}. Finish that one first.`)
            : order
                ? text('当前展示的是这笔订单的精确金额与地址。', 'This order is showing the exact amount and address.')
                : text('建单后会锁定本次精确金额，按金额转账即可校验。', 'Create the order first to lock the exact amount before paying.');
        return `
            <div class="of-inline-head">
                <span class="of-badge-icon">✦</span>
                <strong>${escapeHtml(text('当前礼包效果', 'Current Pack Effect'))}</strong>
            </div>
            ${rewardSummary ? `<div class="of-chip-row">${rewardSummary}</div>` : ''}
            ${bonusSummary ? `<div class="of-chip-row">${bonusSummary}</div>` : ''}
            <div class="of-copy is-tight">${escapeHtml(fitHint)}</div>
            ${progressHint ? `<div class="of-copy is-tight">${escapeHtml(progressHint)}</div>` : ''}
            <div class="of-copy is-tight">${escapeHtml(activeOrderHint)}</div>
        `;
    }

    function renderPaymentBonusChips(offer) {
        const chips = [];
        const bonus = offer?.permanentBonus || {};
        if (Number(bonus.dailyFreeRuns || 0) > 0) chips.push(renderStaticChip(text(`每日加成 +${bonus.dailyFreeRuns} 局`, `+${bonus.dailyFreeRuns} bonus run/day`), 'accent'));
        if (Number(bonus.creditYield || 0) > 0) chips.push(renderStaticChip(text(`金币结算 +${Math.round(Number(bonus.creditYield || 0) * 100)}%`, `+${Math.round(Number(bonus.creditYield || 0) * 100)}% credits`), 'accent'));
        if (Number(bonus.alloyYield || 0) > 0) chips.push(renderStaticChip(text(`合金结算 +${Math.round(Number(bonus.alloyYield || 0) * 100)}%`, `+${Math.round(Number(bonus.alloyYield || 0) * 100)}% alloy`), 'accent'));
        if (Number(bonus.signalYield || 0) > 0) chips.push(renderStaticChip(text(`信号结算 +${Math.round(Number(bonus.signalYield || 0) * 100)}%`, `+${Math.round(Number(bonus.signalYield || 0) * 100)}% signal`), 'accent'));
        if (Number(bonus.bossYield || 0) > 0) chips.push(renderStaticChip(text(`精英 / 首领奖励 +${Math.round(Number(bonus.bossYield || 0) * 100)}%`, `+${Math.round(Number(bonus.bossYield || 0) * 100)}% elite/boss payout`), 'accent'));
        if (Number(bonus.ultimateCharge || 0) > 0) chips.push(renderStaticChip(text(`局内充能 +${Math.round(Number(bonus.ultimateCharge || 0) * 100)}%`, `+${Math.round(Number(bonus.ultimateCharge || 0) * 100)}% charge`), 'accent'));
        if (Number(bonus.globalGrowth || 0) > 0) chips.push(renderStaticChip(text(`全局成长 +${Math.round(Number(bonus.globalGrowth || 0) * 100)}%`, `+${Math.round(Number(bonus.globalGrowth || 0) * 100)}% global growth`), 'accent'));
        if (offer?.unlocksPremiumSeason) chips.push(renderStaticChip(text('同步开启高级线', 'Unlocks premium track'), 'good'));
        return chips.join('');
    }

    function getOfferRecommendedRange(offer) {
        const range = offer?.recommendedAt;
        if (!range) return '';
        return typeof range === 'string' ? range : localize(range);
    }

    function getOfferFitHint(offer) {
        if (!offer) return text('按当前进度选择更顺手的一档即可。', 'Pick the tier that best fits your current progress.');
        if (isOfferOwned(offer.id)) return text('这档已生效，长期收益会继续保留。', 'This tier is already active and its long-term perk is already applied.');

        const chapter = getSelectedChapter();
        const pressurePoint = getRelevantPressurePoint(chapter.id);
        const recommendedRange = getOfferRecommendedRange(offer);
        const currentIndex = chapterIndexMap[chapter.id] ?? 0;
        const unlockIndex = chapterIndexMap[offer.unlockStage || '1-1'] ?? 0;
        if (currentIndex < unlockIndex) {
            const unlockChapter = chapterMap[offer.unlockStage || '1-1'];
            return text(`推进到 ${localize(unlockChapter?.name || { zh: offer.unlockStage || '后续关卡', en: offer.unlockStage || 'later stage' })} 后再考虑也来得及。`, `You can wait until ${localize(unlockChapter?.name || { zh: offer.unlockStage || 'later stage', en: offer.unlockStage || 'later stage' })} before considering this tier.`);
        }
        if (pressurePoint?.recommendedOffer === offer.id) {
            if (recommendedRange) {
                return text(`这档更贴近你当前的 ${recommendedRange} 进度段，补完后推进会更顺。`, `This tier fits your current ${recommendedRange} stretch and smooths the next push well.`);
            }
            return text('这档更贴近你当前进度，补完后推进会更顺。', 'This tier fits your current progress and smooths the next stretch well.');
        }
        if (offer.unlocksPremiumSeason && !state.save.payment.premiumSeason) {
            return text('会同步开启高级线，赛季奖励会更完整。', 'It also unlocks the premium track for fuller season rewards.');
        }
        return text('主要补即时资源和长期收益，不会替代正常推进。', 'It mainly adds instant resources plus a long-term perk, not a full progression skip.');
    }

    function getOfferProgressImpactHint(offer) {
        const pressurePoint = getRelevantPressurePoint(getSelectedChapter().id);
        const focusEstimate = estimatePressurePointRecovery(pressurePoint);
        if (!offer || !focusEstimate || focusEstimate.isComplete) return '';

        const shortfall = normalizeCostBucket(focusEstimate.shortfall);
        if (isCostBucketEmpty(shortfall)) {
            return text('你手上的库存已经够用，回整备补上即可。', 'Your current inventory is already enough; just return to loadout and upgrade.');
        }

        const reward = normalizeCostBucket(offer.reward || {});
        const totalShortfall = Number(shortfall.credits || 0) + Number(shortfall.alloy || 0) + Number(shortfall.signal || 0);
        const covered = Math.min(shortfall.credits, reward.credits) + Math.min(shortfall.alloy, reward.alloy) + Math.min(shortfall.signal, reward.signal);
        if (totalShortfall <= 0 || covered <= 0) return '';

        const remaining = {
            credits: Math.max(0, shortfall.credits - reward.credits),
            alloy: Math.max(0, shortfall.alloy - reward.alloy),
            signal: Math.max(0, shortfall.signal - reward.signal)
        };
        if (isCostBucketEmpty(remaining)) {
            return text('这档基本能补上你现在这一步的资源缺口。', 'This tier can almost fully cover the resource gap for your next upgrade step.');
        }
        const ratio = Math.round((covered / totalShortfall) * 100);
        return text(`大约可覆盖你当前资源缺口的 ${ratio}% 。`, `It covers about ${ratio}% of your current resource gap.`);
    }

    function renderStaticChip(label, tone = '') {
        return `<span class="of-chip ${tone ? `is-${tone}` : ''}">${escapeHtml(label)}</span>`;
    }

    function selectPaymentOffer(offerId) {
        if (!offerMap[offerId]) return;
        const activePendingOrder = getActivePendingPaymentOrder();
        if (activePendingOrder && activePendingOrder.offerId && activePendingOrder.offerId !== offerId) {
            selectedPaymentOfferId = activePendingOrder.offerId;
            paymentStatusTone = 'info';
            refreshPaymentUi();
            if (ui.paymentStatus) {
                ui.paymentStatus.textContent = text('先完成当前待处理订单，再切换其他礼包。', 'Finish the current pending order before switching packs.');
                ui.paymentStatus.style.color = '#ffd766';
            }
            showToast(text('先完成当前待处理订单，再切换其他礼包。', 'Finish the current pending order before switching packs.'), 'warning');
            return;
        }
        selectedPaymentOfferId = offerId;
        paymentStatusTone = 'info';
        refreshPaymentUi();
    }

    async function createOfferOrder(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        if (isOfferOwned(offer.id)) {
            paymentStatusTone = 'success';
            refreshPaymentUi();
            return;
        }
        try {
            paymentStatusTone = 'info';
            ui.paymentStatus.textContent = text('正在创建订单...', 'Creating order...');
            const order = await createBackendPaymentOrder(offer.id);
            if (!order) throw new Error(text('订单创建失败。', 'Failed to create order.'));
            if (order.status === 'paid' && order.txid) {
                const claimResult = await claimBackendPayment(order.orderId, order.txid);
                grantPaymentRewards({
                    offerId: offer.id,
                    orderId: claimResult?.order?.orderId || order.orderId,
                    txid: order.txid,
                    exactAmount: claimResult?.order?.exactAmount || order.exactAmount
                });
                paymentStatusTone = 'success';
                ui.paymentStatus.textContent = text('已恢复已支付订单，奖励已发放。', 'Paid order restored and rewards granted.');
                refreshPaymentUi();
                renderAll();
                showToast(text('已补发这笔已支付订单。', 'Recovered the paid order rewards.'), 'success');
                return;
            }
            setPendingOrder(order);
            state.save.payment.recentOrders = [
                order,
                ...state.save.payment.recentOrders.filter((entry) => String(entry.orderId || entry.id || '') !== String(order.orderId || order.id || ''))
            ].slice(0, 12);
            saveProgress();
            refreshPaymentUi();
            showToast(
                order.reused
                    ? text('已恢复待支付订单，请按精确金额支付。', 'Pending order restored. Please pay the exact amount.')
                    : text('订单已创建，请按精确金额支付。', 'Order created. Please pay the exact amount.'),
                'success'
            );
        } catch (error) {
            if (error.order?.status === 'paid' && error.order?.txid) {
                const claimResult = await claimBackendPayment(error.order.orderId || error.order.id, error.order.txid);
                grantPaymentRewards({
                    offerId: error.order.offerId,
                    orderId: claimResult?.order?.orderId || error.order.orderId || error.order.id,
                    txid: error.order.txid,
                    exactAmount: claimResult?.order?.exactAmount || error.order.exactAmount || error.order.baseAmount
                });
                paymentStatusTone = 'success';
                ui.paymentStatus.textContent = text('已恢复待补发订单，奖励已到账。', 'Recovered the paid order and applied rewards.');
                refreshPaymentUi();
                renderAll();
                showToast(text('已恢复这笔已支付订单。', 'Recovered the paid order.'), 'success');
                return;
            }
            if (error.code === 'OFFER_ALREADY_OWNED' && error.order) {
                if (!isOfferOwned(error.order.offerId)) {
                    grantPaymentRewards({
                        offerId: error.order.offerId,
                        orderId: error.order.orderId || error.order.id,
                        txid: error.order.txid || '',
                        exactAmount: error.order.exactAmount || error.order.baseAmount
                    });
                }
                paymentStatusTone = 'success';
                ui.paymentStatus.textContent = text('该礼包权益已恢复。', 'Pack ownership restored.');
                refreshPaymentUi();
                renderAll();
                showToast(text('已恢复这档礼包的权益。', 'Restored this pack ownership.'), 'success');
                return;
            }
            if (error.order) {
                setPendingOrder(error.order);
                refreshPaymentUi();
            }
            paymentStatusTone = 'warning';
            ui.paymentStatus.textContent = error.message || text('订单创建失败。', 'Failed to create order.');
        }
    }

    async function handlePaymentPrimaryAction(offerId) {
        const currentOrder = getPendingOrderForOffer(offerId);
        if (!currentOrder) {
            await createOfferOrder(offerId);
            return;
        }
        await syncPaymentOrderStatus(offerId);
    }

    async function syncPaymentOrderStatus(offerId) {
        const offer = offerMap[offerId];
        const order = getPendingOrderForOffer(offerId);
        if (!offer || !order) {
            await createOfferOrder(offerId);
            return;
        }

        try {
            paymentStatusTone = 'info';
            ui.paymentStatus.textContent = text('正在检查订单状态...', 'Checking order status...');
            const payload = await checkBackendOrder(order.orderId);
            const remote = payload?.order || {};
            const mergedOrder = normalizeOrder({ ...order, ...remote }) || order;

            if (String(remote.status || '').toLowerCase() === 'expired') {
                state.save.payment.pendingOrder = null;
                persistCurrentPaymentOrder();
                saveProgress();
                paymentStatusTone = 'warning';
                refreshPaymentUi();
                ui.paymentStatus.textContent = text('订单已过期，请重新创建。', 'This order expired. Please create a new one.');
                return;
            }

            setPendingOrder(mergedOrder);

            if ((remote.status === 'paid' || remote.status === 'granted') && remote.txid) {
                if (remote.status !== 'granted') {
                    await claimBackendPayment(order.orderId, remote.txid);
                }
                grantPaymentRewards({
                    offerId,
                    orderId: mergedOrder.orderId,
                    txid: remote.txid,
                    exactAmount: remote.exactAmount || mergedOrder.exactAmount
                });
                paymentStatusTone = 'success';
                refreshPaymentUi();
                renderAll();
                showToast(text('订单已补发到账。', 'Order recovered and rewards applied.'), 'success');
                return;
            }

            paymentStatusTone = 'info';
            refreshPaymentUi();
            ui.paymentStatus.textContent = text('订单仍待支付，完成转账后再校验即可。', 'Order is still pending. Complete the transfer, then verify it.');
        } catch (error) {
            paymentStatusTone = 'warning';
            ui.paymentStatus.textContent = error.message || text('订单状态检查失败。', 'Failed to check order status.');
        }
    }

    async function verifyOfferTxid(offerId) {
        const offer = offerMap[offerId];
        const order = getPendingOrderForOffer(offerId);
        if (!offer || !order) {
            paymentStatusTone = 'warning';
            ui.paymentStatus.textContent = text('请先创建有效订单。', 'Please create a valid order first.');
            return;
        }
        if (isOfferOwned(offer.id)) {
            paymentStatusTone = 'success';
            ui.paymentStatus.textContent = text('该礼包已生效。', 'This pack is already active.');
            return;
        }

        const txid = String(ui.paymentTxidInput.value || '').trim();
        if (!PAYMENT_TXID_REGEX.test(txid)) {
            paymentStatusTone = 'warning';
            ui.paymentStatus.textContent = text('TXID 格式不正确。', 'TXID format is invalid.');
            return;
        }

        try {
            paymentStatusTone = 'info';
            ui.paymentStatus.textContent = text('正在校验交易...', 'Verifying transaction...');
            const verified = await verifyBackendPayment(order.orderId, txid);
            if (!verified?.order?.orderId && !verified?.orderId) {
                throw new Error(text('交易校验失败。', 'Transaction verification failed.'));
            }
            const claimResult = await claimBackendPayment(order.orderId, txid);
            grantPaymentRewards({
                offerId,
                orderId: claimResult?.order?.orderId || verified?.order?.orderId || order.orderId,
                txid,
                exactAmount: claimResult?.order?.exactAmount || verified?.order?.exactAmount || order.exactAmount
            });
            ui.paymentTxidInput.value = '';
            paymentStatusTone = 'success';
            ui.paymentStatus.textContent = text('支付校验完成，奖励已发放。', 'Payment verified and rewards granted.');
            refreshPaymentUi();
            renderAll();
            showToast(text('支付奖励已发放。', 'Payment rewards granted.'), 'success');
        } catch (error) {
            paymentStatusTone = 'warning';
            ui.paymentStatus.textContent = error.message || text('校验失败。', 'Verification failed.');
        }
    }

    function grantPaymentRewards(payload) {
        const offer = offerMap[payload.offerId];
        if (!offer) return;
        const orderId = String(payload.orderId || '');
        const lastPayAddress = getPaymentAddress(state.save.payment.pendingOrder) || state.save.payment.lastPayAddress;
        if (orderId && state.save.payment.claimedOrders[orderId]) return;
        if (isOfferOwned(offer.id)) return;

        applyReward(offer.reward || {});
        applyPermanentBonus(offer.permanentBonus || {});
        if (offer.unlocksPremiumSeason) state.save.payment.premiumSeason = true;
        state.save.payment.purchaseCount += 1;
        state.save.payment.totalSpent = roundMoney(Number(state.save.payment.totalSpent || 0) + Number(payload.exactAmount || offer.baseAmount || offer.price || 0));
        if (orderId) state.save.payment.claimedOrders[orderId] = true;
        if (!state.save.payment.claimedOfferIds.includes(offer.id)) state.save.payment.claimedOfferIds.push(offer.id);
        if (payload.txid && !state.save.payment.verifiedTxids.includes(payload.txid)) state.save.payment.verifiedTxids.push(payload.txid);
        if (state.save.payment.pendingOrder && String(state.save.payment.pendingOrder.orderId || state.save.payment.pendingOrder.id || '') === orderId) {
            state.save.payment.pendingOrder = null;
        }
        state.save.payment.recentOrders = [
            {
                orderId,
                offerId: offer.id,
                exactAmount: roundMoney(Number(payload.exactAmount || offer.baseAmount || offer.price || 0)),
                txid: String(payload.txid || ''),
                status: 'granted',
                payAddress: lastPayAddress
            },
            ...state.save.payment.recentOrders.filter((entry) => String(entry.orderId || entry.id || '') !== orderId)
        ].slice(0, 12);
        state.save.payment.lastPayAddress = lastPayAddress;
        saveProgress();
        persistCurrentPaymentOrder();
    }

    function applyPermanentBonus(bonus) {
        const target = state.save.payment.permanent;
        Object.keys(bonus || {}).forEach((key) => {
            target[key] = roundMoney(Number(target[key] || 0) + Number(bonus[key] || 0));
        });
    }

    async function createBackendPaymentOrder(offerId) {
        const response = await fetch(`${PAYMENT_API_BASE}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minerId: getPaymentMinerId(), offerId, gameId: PAYMENT_GAME_ID })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) {
            const error = new Error(payload.error || text('创建订单失败。', 'Failed to create order.'));
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

    async function copyOfferAddress(offerId) {
        let order = getPendingOrderForOffer(offerId);
        if (!order) {
            await createOfferOrder(offerId);
            order = getPendingOrderForOffer(offerId);
        }
        const address = getPaymentAddress(order);
        if (!address) {
            showToast(text('当前没有可复制的地址。', 'No address available yet.'), 'warning');
            return;
        }
        await copyText(address, text('地址已复制。', 'Address copied.'));
    }

    async function copyOfferAmount(offerId) {
        let order = getPendingOrderForOffer(offerId);
        if (!order) {
            await createOfferOrder(offerId);
            order = getPendingOrderForOffer(offerId);
        }
        if (!order?.exactAmount) {
            showToast(text('当前没有可复制的金额。', 'No amount available yet.'), 'warning');
            return;
        }
        await copyText(String(Number(order.exactAmount || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS)), text('精确金额已复制。', 'Exact amount copied.'));
    }

    function setPendingOrder(order) {
        state.save.payment.pendingOrder = order;
        state.save.payment.lastPayAddress = getPaymentAddress(order) || state.save.payment.lastPayAddress;
        persistCurrentPaymentOrder();
        saveProgress();
    }

    function getPendingOrder() {
        const order = normalizeOrder(state.save.payment.pendingOrder);
        if (!order) return null;
        if (isTerminalPaymentOrder(order)) {
            state.save.payment.pendingOrder = null;
            persistCurrentPaymentOrder();
            saveProgress();
            return null;
        }
        if (String(order.status || '').toLowerCase() === 'pending' && isPendingOrderExpired(order)) {
            state.save.payment.pendingOrder = null;
            persistCurrentPaymentOrder();
            saveProgress();
            return null;
        }
        return order;
    }

    function getActivePendingPaymentOrder() {
        const order = getPendingOrder();
        if (!order) return null;
        if (String(order.status || '').toLowerCase() !== 'pending') return null;
        return isOfferOwned(order.offerId) ? null : order;
    }

    function getPendingOrderForOffer(offerId) {
        const order = getPendingOrder();
        if (!order) return null;
        return String(order.offerId || '') === String(offerId || '') ? order : null;
    }

    function isTerminalPaymentOrder(order) {
        if (!order) return true;
        if (order.rewardGranted) return true;
        const status = String(order.status || '').toLowerCase();
        return status === 'granted' || status === 'cancelled' || status === 'expired';
    }

    function isPendingOrderExpired(order) {
        if (!order?.expiresAt) return true;
        return (new Date(order.expiresAt).getTime() + 1000) < Date.now();
    }

    function normalizeOrder(order) {
        if (!order || typeof order !== 'object') return null;
        const normalized = {
            orderId: String(order.orderId || order.order_id || order.id || ''),
            id: String(order.orderId || order.order_id || order.id || ''),
            offerId: String(order.offerId || order.offer_id || ''),
            offerName: String(order.offerName || order.offer_name || ''),
            exactAmount: roundMoney(Number(order.exactAmount || order.exact_amount || order.baseAmount || order.base_amount || 0)),
            baseAmount: roundMoney(Number(order.baseAmount || order.base_amount || 0)),
            payAddress: getPaymentAddress(order),
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
        if (!normalized.id || !normalized.offerId) return null;
        return normalized;
    }

    function restoreStoredPaymentOrder() {
        try {
            const raw = localStorage.getItem(PAYMENT_ORDER_STORAGE_KEY);
            if (!raw) return;
            const parsed = normalizeOrder(JSON.parse(raw));
            if (
                parsed
                && !isTerminalPaymentOrder(parsed)
                && (String(parsed.status || '').toLowerCase() !== 'pending' || !isPendingOrderExpired(parsed))
            ) {
                state.save.payment.pendingOrder = parsed;
            }
        } catch (error) {}
    }

    function persistCurrentPaymentOrder() {
        try {
            const order = getPendingOrder();
            if (!order) {
                localStorage.removeItem(PAYMENT_ORDER_STORAGE_KEY);
                return;
            }
            localStorage.setItem(PAYMENT_ORDER_STORAGE_KEY, JSON.stringify(order));
        } catch (error) {}
    }

    function getPaymentAddress(order) {
        if (!order || typeof order !== 'object') return '';
        for (const field of PAYMENT_ADDRESS_FIELDS) {
            const value = String(order[field] || '').trim();
            if (value) return value;
        }
        return '';
    }

    function getPaymentMinerId() {
        let minerId = String(state.save.payment.minerId || '').trim();
        if (!minerId) {
            minerId = `OF_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            state.save.payment.minerId = minerId;
            saveProgress();
        }
        return minerId;
    }

    function isOfferOwned(offerId) {
        return getOwnedOfferIds().includes(offerId);
    }

    function getOwnedOfferIds() {
        const owned = new Set(Array.isArray(state.save.payment.claimedOfferIds) ? state.save.payment.claimedOfferIds : []);
        Object.keys(state.save.payment.claimedOrders || {}).forEach((orderId) => {
            const order = state.save.payment.recentOrders.find((entry) => entry.orderId === orderId);
            if (order?.offerId) owned.add(order.offerId);
        });
        return Array.from(owned);
    }

    function unlockNextStage() {
        const currentIndex = chapterIndexMap[state.battle.runtime.chapter.id] ?? 0;
        state.save.clearedChapters = uniquePush(state.save.clearedChapters, state.battle.runtime.chapter.id);
        state.save.unlockedChapterIndex = Math.max(state.save.unlockedChapterIndex || 0, Math.min(config.chapters.length - 1, currentIndex + 1));
    }

    function getBattleContinueMeta() {
        const price = getContinueCost();
        const keyCount = Number(state.save.eliteKeys || 0);
        const useKey = keyCount > 0;
        return {
            price,
            useKey,
            canContinue: useKey || (price > 0 && Number(state.save.credits || 0) >= price),
            label: useKey
                ? text('消耗 1 钥匙继续', 'Continue · 1 Key')
                : text(`继续 ${price} 币`, `Continue ${price}`)
        };
    }

    function getNextChapterId(currentId) {
        const currentIndex = chapterIndexMap[currentId] ?? -1;
        return config.chapters[currentIndex + 1]?.id || '';
    }

    function getContinueCost() {
        return Number((config.economy?.continueCosts || [])[state.battle.continueUsed] || 0);
    }

    function canClaimDailySupply() {
        return Date.now() - Number(state.save.dailySupplyAt || 0) >= DAILY_SUPPLY_COOLDOWN_MS;
    }

    function getDailyBonusRunInfo() {
        const dayKey = getDayKey();
        if (state.save.freeRunDayKey !== dayKey) {
            state.save.freeRunDayKey = dayKey;
            state.save.freeRunsUsedToday = 0;
        }
        const total = Number(config.economy?.dailyFreeRunCount || 0) + Number(state.save.payment.permanent.dailyFreeRuns || 0);
        const used = Number(state.save.freeRunsUsedToday || 0);
        return {
            total,
            used,
            left: Math.max(0, total - used)
        };
    }

    function ensureMissionCycle() {
        const dayKey = getDayKey();
        if (state.save.missionDayKey === dayKey && state.save.missionDailyBaseStats) return;
        state.save.missionDayKey = dayKey;
        state.save.missionClaimed = [];
        state.save.missionDailyBaseStats = createMissionStatSnapshot(state.save.stats);
        saveProgress();
    }

    function createMissionStatSnapshot(stats) {
        const source = stats || {};
        return {
            runs: Number(source.runs || 0),
            survivalSeconds: Number(source.survivalSeconds || 0),
            eliteKills: Number(source.eliteKills || 0),
            stageClears: Number(source.stageClears || 0),
            bossKills: Number(source.bossKills || 0)
        };
    }

    function getCurrentDailyRoute() {
        const phase = getCurrentDailyRoutePhase(getSelectedChapter().id);
        const tier = getCurrentSpendTier();
        return dailyRouteModels.find((entry) => entry.phase === phase && entry.tier === tier)
            || dailyRouteModels.find((entry) => entry.phase === phase && entry.tier === 'free')
            || dailyRouteModels[0]
            || null;
    }

    function getCurrentDailyRoutePhase(stageId) {
        const currentIndex = chapterIndexMap[stageId] ?? 0;
        if (currentIndex <= (chapterIndexMap['1-6'] ?? 5)) return 'early';
        if (currentIndex <= (chapterIndexMap['3-3'] ?? 14)) return 'mid';
        return 'late';
    }

    function getCurrentSpendTier() {
        const owned = getOwnedOfferIds();
        if (owned.some((id) => ['rush', 'sovereign', 'nexus'].includes(id))) return 'mid';
        if (owned.some((id) => ['starter', 'accelerator'].includes(id))) return 'light';
        return 'free';
    }

    function estimateDailyLoopReward(route) {
        if (!route) return null;
        const totalReward = createRewardBucket();
        const bonusRunCount = Number(config.economy?.dailyFreeRunCount || 0) + Number(state.save.payment.permanent.dailyFreeRuns || 0);
        (route.stageIds || []).forEach((stageId, index) => {
            const chapter = chapterMap[stageId];
            if (!chapter) return;
            addRewardToBucket(totalReward, estimateVictoryRewardForChapter(chapter, index < bonusRunCount));
        });
        (route.missionIds || []).forEach((missionId) => {
            const mission = missionMap[missionId];
            if (mission?.reward) addRewardToBucket(totalReward, mission.reward);
        });
        const dailyItem = shopMap[route.shopDailyId || 'dailySupply'];
        if (dailyItem?.reward) addRewardToBucket(totalReward, dailyItem.reward);
        return {
            route,
            totalReward,
            stageCount: Array.isArray(route.stageIds) ? route.stageIds.length : 0,
            missionCount: Array.isArray(route.missionIds) ? route.missionIds.length : 0,
            bonusRunCount
        };
    }

    function estimateVictoryRewardForChapter(chapter, isBonusRun) {
        const base = cloneReward(chapter?.reward || {});
        const growthMultiplier = 1 + Number(state.save.payment.permanent.globalGrowth || 0);
        const bonusCreditRate = getResearchBonus('salvage-link', 'creditsBonus') + Number(state.save.payment.permanent.creditYield || 0);
        const bonusAlloyRate = getResearchBonus('alloy-press', 'alloyBonus') + Number(state.save.payment.permanent.alloyYield || 0);
        const bonusSignalRate = Number(state.save.payment.permanent.signalYield || 0);
        const bonusEliteRate = getResearchBonus('elite-protocol', 'eliteDropBonus') + Number(state.save.payment.permanent.bossYield || 0);
        const multiplier = isBonusRun ? 1.15 : 1;

        base.credits = Math.round(Number(base.credits || 0) * multiplier * growthMultiplier * (1 + bonusCreditRate));
        base.alloy = Math.round(Number(base.alloy || 0) * multiplier * growthMultiplier * (1 + bonusAlloyRate));
        base.signal = Math.round(Number(base.signal || 0) * multiplier * growthMultiplier * (1 + bonusSignalRate));
        base.seasonXp = Math.round(Number(base.seasonXp || 0) * multiplier * growthMultiplier);

        if (chapter?.kind === 'elite' || chapter?.kind === 'boss') {
            base.credits = Math.round(base.credits * (1 + bonusEliteRate));
            base.alloy = Math.round(base.alloy * (1 + bonusEliteRate * 0.6));
            base.signal = Math.round(base.signal * (1 + bonusEliteRate));
        }

        return base;
    }

    function getNextSeasonNode(track) {
        const list = track === 'premium' ? (config.seasonPremiumTrack || []) : (config.seasonFreeTrack || []);
        const claimed = track === 'premium' ? state.save.seasonClaimedPremium : state.save.seasonClaimed;
        return list.find((node) => !claimed.includes(node.id)) || null;
    }

    function getShopFocusSuggestion(pressurePoint, route) {
        const fallbackItems = (route?.shopFocus || []).map((id) => shopMap[id]).filter(Boolean);
        if (!pressurePoint?.goalCost) {
            return {
                items: fallbackItems.slice(0, 3),
                copy: text('先领日补给，再按背包情况补合金或信号。', 'Take daily supply first, then top up alloy or signal as needed.')
            };
        }

        const goalCost = pressurePoint.goalCost || {};
        const gaps = {
            credits: Math.max(0, Number(goalCost.credits || 0) - Number(state.save.credits || 0)),
            alloy: Math.max(0, Number(goalCost.alloy || 0) - Number(state.save.alloy || 0)),
            signal: Math.max(0, Number(goalCost.signal || 0) - Number(state.save.signal || 0))
        };
        const weighted = Object.entries(gaps).map(([key, value]) => ({
            key,
            value,
            ratio: value / Math.max(1, Number(goalCost[key] || 1))
        })).sort((left, right) => right.ratio - left.ratio);
        const primaryGap = weighted[0]?.key || 'alloy';

        const priorityIds = primaryGap === 'signal'
            ? ['dailySupply', 'signalBurst', 'eliteKey']
            : primaryGap === 'credits'
                ? ['dailySupply', 'alloyCache', 'signalBurst']
                : ['dailySupply', 'alloyCache', 'signalBurst'];
        const items = priorityIds.map((id) => shopMap[id]).filter(Boolean);
        const copy = weighted[0]?.value > 0
            ? text(`下一档更缺 ${localize(getRewardDisplayMeta(primaryGap).label)}，可先补软货币补给。`, `Next target is shorter on ${localize(getRewardDisplayMeta(primaryGap).label)}. Soft-currency supply helps first.`)
            : text('当前背包已够下一档，日补给优先留给后续节点。', 'Current inventory already covers the next checkpoint. Keep daily supply rolling for later nodes.');

        return { items, copy };
    }

    function createRewardBucket() {
        return {
            credits: 0,
            alloy: 0,
            signal: 0,
            seasonXp: 0,
            eliteKeys: 0
        };
    }

    function cloneReward(reward) {
        return {
            credits: Number(reward?.credits || 0),
            alloy: Number(reward?.alloy || 0),
            signal: Number(reward?.signal || 0),
            seasonXp: Number(reward?.seasonXp || 0),
            eliteKeys: Number(reward?.eliteKeys || 0)
        };
    }

    function addRewardToBucket(target, reward) {
        if (!target || !reward) return target;
        target.credits += Number(reward.credits || 0);
        target.alloy += Number(reward.alloy || 0);
        target.signal += Number(reward.signal || 0);
        target.seasonXp += Number(reward.seasonXp || 0);
        target.eliteKeys += Number(reward.eliteKeys || 0);
        return target;
    }

    function getMissionProgress(mission) {
        const stats = state.save.stats;
        const base = state.save.missionDailyBaseStats || createMissionStatSnapshot();
        switch (mission.metric) {
            case 'runs':
                return Math.max(0, Number(stats.runs || 0) - Number(base.runs || 0));
            case 'survivalSeconds':
                return Math.max(0, Number(stats.survivalSeconds || 0) - Number(base.survivalSeconds || 0));
            case 'eliteKills':
                return Math.max(0, Number(stats.eliteKills || 0) - Number(base.eliteKills || 0));
            case 'stageClears':
                return Math.max(0, Number(stats.stageClears || 0) - Number(base.stageClears || 0));
            case 'bossKills':
                return Math.max(0, Number(stats.bossKills || 0) - Number(base.bossKills || 0));
            default:
                return 0;
        }
    }

    function getTotalPower() {
        return calculateCurvedPower(getTotalCombatPower());
    }

    function getEntryPower(type, entryId) {
        const raw = getEntryCombatPower(type, entryId);
        const totalRaw = getTotalCombatPower();
        const totalPower = getTotalPower();
        if (raw <= 0) return 0;
        const scale = totalRaw > 0 ? totalPower / totalRaw : 1;
        return Math.max(1, Math.round(raw * scale));
    }

    function getEntryCombatPower(type, entryId) {
        if (!entryId) return 0;
        if (type === 'hull') {
            const entry = hullMap[entryId];
            if (!entry) return 0;
            return Math.round(entry.stats.power * (1 + (getHullLevel(entryId) - 1) * 0.16));
        }
        if (type === 'weapon') {
            const entry = weaponMap[entryId];
            if (!entry) return 0;
            return Math.round(entry.power * (1 + (getWeaponLevel(entryId) - 1) * 0.18));
        }
        if (type === 'drone') {
            const entry = droneMap[entryId];
            if (!entry) return 0;
            return Math.round(entry.power * (1 + (getDroneLevel(entryId) - 1) * 0.15));
        }
        const entry = ultimateMap[entryId];
        if (!entry) return 0;
        return Math.round(entry.power * (1 + (getUltimateLevel(entryId) - 1) * 0.2));
    }

    function getTotalCombatPower() {
        const hull = getSelectedHull();
        const weapons = state.save.selectedWeaponIds.map((id) => weaponMap[id]).filter(Boolean);
        const drone = getSelectedDrone();
        const ultimate = getSelectedUltimate();
        const hullPower = getEntryCombatPower('hull', hull.id);
        const weaponPower = weapons.reduce((sum, weapon) => sum + getEntryCombatPower('weapon', weapon.id), 0);
        const dronePower = getEntryCombatPower('drone', drone.id);
        const ultimatePower = getEntryCombatPower('ultimate', ultimate.id);
        const researchPower = 1 + getResearchBonus('thruster-mesh', 'powerBonus') + Number(state.save.payment.permanent.globalGrowth || 0);
        return Math.round((hullPower + weaponPower + dronePower + ultimatePower) * researchPower);
    }

    function getStartingCombatPower() {
        const loadout = config.economy?.startingLoadout || {};
        const hull = hullMap[loadout.hullId];
        const weapons = (loadout.weaponIds || []).map((id) => weaponMap[id]).filter(Boolean);
        const drone = droneMap[loadout.droneId];
        const ultimate = ultimateMap[loadout.ultimateId];
        const total = Number(hull?.stats?.power || 0)
            + weapons.reduce((sum, weapon) => sum + Number(weapon?.power || 0), 0)
            + Number(drone?.power || 0)
            + Number(ultimate?.power || 0);
        return total > 0 ? total : Number(config.economy?.startingPower || 252);
    }

    function calculateCurvedPower(rawPower) {
        const basePower = Number(config.economy?.startingPower || 252);
        const baseRaw = Math.max(1, getStartingCombatPower());
        const exponent = Number(config.economy?.powerCurveExponent || 4.1);
        const ratio = Math.max(0.6, Number(rawPower || 0) / baseRaw);
        return Math.max(60, Math.round(basePower * Math.pow(ratio, exponent)));
    }

    function getEntryBasePower(type, entry) {
        if (!entry) return 0;
        if (type === 'hull') return Number(entry.stats?.power || 0);
        return Number(entry.power || 0);
    }

    function getResearchBonus(researchId, field) {
        const entry = researchMap[researchId];
        if (!entry) return 0;
        const level = getResearchLevel(researchId);
        if (level <= 0) return 0;
        const current = entry.levels?.[level - 1];
        return Number(current?.[field] || 0);
    }

    function getHullLevel(hullId) {
        return Math.max(1, Number(state.save.hullLevels[hullId] || (state.save.selectedHullId === hullId ? 1 : 0) || 1));
    }

    function getWeaponLevel(weaponId) {
        return Math.max(1, Number(state.save.weaponLevels[weaponId] || (state.save.selectedWeaponIds.includes(weaponId) ? 1 : 0) || 1));
    }

    function getDroneLevel(droneId) {
        return Math.max(1, Number(state.save.droneLevels[droneId] || (state.save.selectedDroneId === droneId ? 1 : 0) || 1));
    }

    function getUltimateLevel(ultimateId) {
        return Math.max(1, Number(state.save.ultimateLevels[ultimateId] || (state.save.selectedUltimateId === ultimateId ? 1 : 0) || 1));
    }

    function getResearchLevel(researchId) {
        return Math.max(0, Number(state.save.researchLevels[researchId] || 0));
    }

    function getUnitNextCost(type, currentLevel) {
        const list = type === 'hull'
            ? config.economy?.hullLevelCosts
            : type === 'weapon'
                ? config.economy?.weaponLevelCosts
                : type === 'drone'
                    ? config.economy?.droneLevelCosts
                    : config.economy?.ultimateLevelCosts;
        return (list || []).find((item) => Number(item.level || 0) === currentLevel + 1) || null;
    }

    function applyResearchDiscount(cost) {
        const discount = getResearchBonus('signal-tuner', 'researchDiscount');
        return {
            credits: Math.round(Number(cost.credits || 0) * (1 - discount)),
            alloy: Math.round(Number(cost.alloy || 0)),
            signal: Math.round(Number(cost.signal || 0) * (1 - discount))
        };
    }

    function canAfford(cost) {
        return Number(state.save.credits || 0) >= Number(cost.credits || 0)
            && Number(state.save.alloy || 0) >= Number(cost.alloy || 0)
            && Number(state.save.signal || 0) >= Number(cost.signal || 0);
    }

    function spendCost(cost) {
        state.save.credits -= Number(cost.credits || 0);
        state.save.alloy -= Number(cost.alloy || 0);
        state.save.signal -= Number(cost.signal || 0);
    }

    function applyReward(reward) {
        state.save.credits += Number(reward.credits || 0);
        state.save.alloy += Number(reward.alloy || 0);
        state.save.signal += Number(reward.signal || 0);
        state.save.seasonXp += Number(reward.seasonXp || 0);
        state.save.eliteKeys += Number(reward.eliteKeys || 0);
        if (reward.premiumSeason) state.save.payment.premiumSeason = true;
    }

    function getSelectedChapter() {
        return chapterMap[state.save.selectedChapterId] || config.chapters[0];
    }

    function getSelectedHull() {
        return hullMap[state.save.selectedHullId] || config.hulls[0];
    }

    function getSelectedDrone() {
        return droneMap[state.save.selectedDroneId] || config.drones[0];
    }

    function getSelectedUltimate() {
        return ultimateMap[state.save.selectedUltimateId] || config.ultimates[0];
    }

    function isStageUnlocked(stageId) {
        const index = chapterIndexMap[stageId];
        if (index == null) return false;
        return index <= Number(state.save.unlockedChapterIndex || 0);
    }

    function isContentUnlocked(unlockStage) {
        const stageIndex = chapterIndexMap[unlockStage];
        if (stageIndex == null) return true;
        return Number(state.save.unlockedChapterIndex || 0) >= stageIndex;
    }

    function getUnlockText(stageId) {
        const index = chapterIndexMap[stageId] ?? 0;
        const previous = config.chapters[Math.max(0, index - 1)];
        const previousName = previous ? localize(previous.name) : stageId;
        return text(`先通过 ${previousName} 再开启。`, `Clear ${previousName} first.`);
    }

    function getUnlockRequirementText(unlockStage) {
        const chapter = chapterMap[unlockStage];
        const stageName = chapter ? localize(chapter.name) : unlockStage;
        return text(`通过 ${stageName} 后解锁。`, `Unlocks after clearing ${stageName}.`);
    }

    function getRelevantPressurePoint(stageId) {
        const currentIndex = chapterIndexMap[stageId] ?? 0;
        const points = config.battleTuning?.pressurePoints || [];
        for (let index = 0; index < points.length; index += 1) {
            const point = points[index];
            const pointIndex = chapterIndexMap[point.stageId] ?? -1;
            if (currentIndex <= pointIndex) return point;
        }
        return points[points.length - 1] || null;
    }

    function getVisibleRunStages(stageId) {
        const stages = config.chapters || [];
        if (stages.length <= 4) return stages;
        const currentIndex = chapterIndexMap[stageId] ?? 0;
        const start = clamp(currentIndex - 1, 0, Math.max(0, stages.length - 4));
        return stages.slice(start, start + 4);
    }

    function getRunFocusCopy(chapter, pressurePoint) {
        if (!pressurePoint) return getPrepGuidance(chapter);
        const currentIndex = chapterIndexMap[chapter.id] ?? 0;
        const pointIndex = chapterIndexMap[pressurePoint.stageId] ?? currentIndex;
        if (currentIndex + 1 < pointIndex) return getPrepGuidance(chapter);
        return localize(pressurePoint.playerHint || pressurePoint.cause || { zh: '先把主输出和生存升上来，再回来开打会更稳。', en: 'Upgrade damage and survivability for a smoother run.' });
    }

    function renderRunFocusGoal(chapter, pressurePoint) {
        if (!pressurePoint) return '';
        const currentIndex = chapterIndexMap[chapter.id] ?? 0;
        const pointIndex = chapterIndexMap[pressurePoint.stageId] ?? currentIndex;
        if (currentIndex + 1 < pointIndex) return '';

        const goalTags = Array.isArray(pressurePoint.goalTags) ? pressurePoint.goalTags : [];
        const focusTags = getPressurePointFocusTags(pressurePoint);
        const focusEstimate = estimatePressurePointRecovery(pressurePoint);
        const goalCost = !isCostBucketEmpty(focusEstimate?.remainingCost)
            ? focusEstimate.remainingCost
            : pressurePoint.goalCost;
        const statusCopy = getRunFocusStatusCopy(focusEstimate);
        const goalChips = statusCopy ? goalTags.concat([statusCopy]) : goalTags;
        if (!goalChips.length && !focusTags.length && !goalCost) return '';

        return `
            ${goalChips.length ? `
                <div class="of-chip-row">
                    ${goalChips.map((tag) => `<span class="of-chip">${escapeHtml(localize(tag))}</span>`).join('')}
                </div>
            ` : ''}
            ${focusTags.length ? `
                <div class="of-chip-row">
                    ${focusTags.map((tag) => `<span class="of-chip is-good">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            ${goalCost ? `<div class="of-copy is-tight">${escapeHtml(text('近期补齐', 'Next spend'))} ${escapeHtml(formatCostInline(goalCost))}</div>` : ''}
        `;
    }

    function renderRecoveryKeyHint() {
        const keyCount = Number(state.save.eliteKeys || 0);
        const firstContinueCost = Number((config.economy?.continueCosts || [])[0] || 0);
        const tip = keyCount > 0
            ? text('失败时会优先消耗钥匙续关。', 'A recovery key is used first when you continue after defeat.')
            : text(`没有钥匙时，首次续关需 ${firstContinueCost} 币；任务和赛季都能拿钥匙。`, `Without a key, the first continue costs ${firstContinueCost} credits. Missions and season rewards can grant keys.`);
        return `
            <div class="of-chip-row">
                <span class="of-chip ${keyCount > 0 ? 'is-good' : ''}">${escapeHtml(text(`续航钥匙 ${keyCount}`, `Keys ${keyCount}`))}</span>
                <span class="of-chip">${escapeHtml(tip)}</span>
            </div>
        `;
    }

    function toggleEliteKeyBoost() {
        showToast(
            text('续航钥匙会在战败续关时自动优先消耗。', 'Recovery keys are auto-used first when you continue after defeat.'),
            'info'
        );
    }

    function getPressurePointFocusTags(pressurePoint) {
        const list = Array.isArray(pressurePoint?.recommendedFocus) ? pressurePoint.recommendedFocus : [];
        return list
            .map((token) => getFocusTokenLabel(token))
            .filter(Boolean);
    }

    function getFocusTokenLabel(token) {
        const raw = String(token || '').trim();
        if (!raw) return '';

        const unitMatch = raw.match(/^(weapon|hull|drone|ultimate)Lv(\d+)$/i);
        if (unitMatch) {
            const unitLabelMap = {
                weapon: text('武器', 'Weapon'),
                hull: text('机体', 'Hull'),
                drone: text('无人机', 'Drone'),
                ultimate: text('大招', 'Ultimate')
            };
            const unitKey = String(unitMatch[1] || '').toLowerCase();
            return `${unitLabelMap[unitKey] || text('模块', 'Module')} Lv${unitMatch[2]}`;
        }

        const researchMatch = raw.match(/^([a-z0-9-]+)-(\d+)$/i);
        if (researchMatch) {
            const researchId = researchMatch[1];
            if (researchMap[researchId]) {
                return `${localize(researchMap[researchId].name)} Lv${researchMatch[2]}`;
            }
        }

        if (weaponMap[raw]) return localize(weaponMap[raw].name);
        if (researchMap[raw]) return localize(researchMap[raw].name);
        if (hullMap[raw]) return localize(hullMap[raw].name);
        if (droneMap[raw]) return localize(droneMap[raw].name);
        if (ultimateMap[raw]) return localize(ultimateMap[raw].name);

        return raw;
    }

    function estimatePressurePointRecovery(pressurePoint) {
        const remainingCost = estimatePressurePointRemainingCost(pressurePoint);
        if (!remainingCost) return null;

        const shortfall = {
            credits: Math.max(0, Number(remainingCost.credits || 0) - Number(state.save.credits || 0)),
            alloy: Math.max(0, Number(remainingCost.alloy || 0) - Number(state.save.alloy || 0)),
            signal: Math.max(0, Number(remainingCost.signal || 0) - Number(state.save.signal || 0))
        };
        const isComplete = isCostBucketEmpty(remainingCost);
        const isReady = !isComplete && isCostBucketEmpty(shortfall);

        const route = getCurrentDailyRoute();
        const loop = estimateDailyLoopReward(route);
        let days = null;
        if (!isComplete && !isReady && loop?.totalReward) {
            const maxDays = Math.max(
                getResourceRecoveryDays(shortfall.credits, loop.totalReward.credits),
                getResourceRecoveryDays(shortfall.alloy, loop.totalReward.alloy),
                getResourceRecoveryDays(shortfall.signal, loop.totalReward.signal)
            );
            days = Number.isFinite(maxDays) ? maxDays : null;
        }

        return {
            remainingCost,
            shortfall,
            isComplete,
            isReady,
            days
        };
    }

    function estimatePressurePointRemainingCost(pressurePoint) {
        const targetBuild = pressurePoint?.targetBuild;
        if (!targetBuild) return pressurePoint?.goalCost ? normalizeCostBucket(pressurePoint.goalCost) : null;

        const remainingCost = createRewardBucket();
        if (Number(targetBuild.hullLevel || 0) > 0) {
            addUnitUpgradeRangeCost(remainingCost, 'hull', getHullLevel(getSelectedHull().id), targetBuild.hullLevel);
        }

        const currentWeaponLevels = (state.save.selectedWeaponIds || [])
            .map((weaponId) => getWeaponLevel(weaponId))
            .sort((left, right) => left - right);
        const targetWeaponLevels = (targetBuild.weaponTargetLevels || [])
            .map((level) => Number(level || 0))
            .filter((level) => level > 0)
            .sort((left, right) => left - right);
        targetWeaponLevels.forEach((targetLevel, index) => {
            addUnitUpgradeRangeCost(remainingCost, 'weapon', currentWeaponLevels[index] || 1, targetLevel);
        });

        if (Number(targetBuild.droneLevel || 0) > 0) {
            addUnitUpgradeRangeCost(remainingCost, 'drone', getDroneLevel(getSelectedDrone().id), targetBuild.droneLevel);
        }
        if (Number(targetBuild.ultimateLevel || 0) > 0) {
            addUnitUpgradeRangeCost(remainingCost, 'ultimate', getUltimateLevel(getSelectedUltimate().id), targetBuild.ultimateLevel);
        }
        if (targetBuild.researchLevels && typeof targetBuild.researchLevels === 'object') {
            addResearchUpgradeRangeCost(remainingCost, targetBuild.researchLevels);
        }

        return normalizeCostBucket(remainingCost);
    }

    function addUnitUpgradeRangeCost(bucket, type, currentLevel, targetLevel) {
        const safeCurrentLevel = Math.max(1, Number(currentLevel || 1));
        const safeTargetLevel = Math.max(0, Number(targetLevel || 0));
        for (let level = safeCurrentLevel + 1; level <= safeTargetLevel; level += 1) {
            const cost = getUnitCostAtLevel(type, level);
            if (cost) addRewardToBucket(bucket, cost);
        }
        return bucket;
    }

    function addResearchUpgradeRangeCost(bucket, researchTargets) {
        const orderMap = new Map((config.research || []).map((entry, index) => [entry.id, index]));
        const targetEntries = Object.entries(researchTargets || {})
            .filter(([researchId, targetLevel]) => researchMap[researchId] && Number(targetLevel || 0) > 0)
            .sort(([leftId], [rightId]) => {
                if (leftId === 'signal-tuner') return -1;
                if (rightId === 'signal-tuner') return 1;
                return (orderMap.get(leftId) ?? 999) - (orderMap.get(rightId) ?? 999);
            });

        const simulatedLevels = { 'signal-tuner': getResearchLevel('signal-tuner') };
        targetEntries.forEach(([researchId]) => {
            simulatedLevels[researchId] = getResearchLevel(researchId);
        });

        targetEntries.forEach(([researchId, targetLevel]) => {
            const entry = researchMap[researchId];
            if (!entry) return;
            let currentLevel = simulatedLevels[researchId] ?? getResearchLevel(researchId);
            const safeTargetLevel = Math.max(0, Number(targetLevel || 0));
            while (currentLevel < safeTargetLevel) {
                const nextLevelData = entry.levels?.[currentLevel];
                if (!nextLevelData) break;
                const tunerLevel = simulatedLevels['signal-tuner'] ?? getResearchLevel('signal-tuner');
                const discount = getResearchValueAtLevel('signal-tuner', tunerLevel, 'researchDiscount');
                addRewardToBucket(bucket, applyResearchDiscountWithRate(nextLevelData, discount));
                currentLevel += 1;
                simulatedLevels[researchId] = currentLevel;
            }
        });

        return bucket;
    }

    function getUnitCostAtLevel(type, level) {
        const list = type === 'hull'
            ? config.economy?.hullLevelCosts
            : type === 'weapon'
                ? config.economy?.weaponLevelCosts
                : type === 'drone'
                    ? config.economy?.droneLevelCosts
                    : config.economy?.ultimateLevelCosts;
        return (list || []).find((item) => Number(item.level || 0) === Number(level || 0)) || null;
    }

    function applyResearchDiscountWithRate(cost, discount) {
        const safeDiscount = clamp(Number(discount || 0), 0, 0.9);
        return {
            credits: Math.round(Number(cost?.credits || 0) * (1 - safeDiscount)),
            alloy: Math.round(Number(cost?.alloy || 0)),
            signal: Math.round(Number(cost?.signal || 0) * (1 - safeDiscount))
        };
    }

    function getResearchValueAtLevel(researchId, level, field) {
        const entry = researchMap[researchId];
        if (!entry) return 0;
        const safeLevel = Math.max(0, Number(level || 0));
        if (safeLevel <= 0) return 0;
        const levelData = entry.levels?.[safeLevel - 1];
        return Number(levelData?.[field] || 0);
    }

    function normalizeCostBucket(cost) {
        return {
            credits: Math.max(0, Math.round(Number(cost?.credits || 0))),
            alloy: Math.max(0, Math.round(Number(cost?.alloy || 0))),
            signal: Math.max(0, Math.round(Number(cost?.signal || 0)))
        };
    }

    function isCostBucketEmpty(cost) {
        return Number(cost?.credits || 0) <= 0
            && Number(cost?.alloy || 0) <= 0
            && Number(cost?.signal || 0) <= 0;
    }

    function getResourceRecoveryDays(amount, dailyIncome) {
        const shortfall = Number(amount || 0);
        if (shortfall <= 0) return 0;
        const income = Number(dailyIncome || 0);
        if (income <= 0) return Number.POSITIVE_INFINITY;
        return Math.ceil(shortfall / income);
    }

    function getRunFocusStatusCopy(focusEstimate) {
        if (!focusEstimate) return '';
        if (focusEstimate.isComplete) {
            return text('\u5f53\u524d\u6574\u5907\u5df2\u5230\u4f4d\uff0c\u76f4\u63a5\u5f00\u6253\u3002', 'Build ready. Jump into the fight.');
        }
        if (focusEstimate.isReady) {
            return text('\u5e93\u5b58\u5df2\u591f\uff0c\u56de\u6574\u5907\u8865\u4e0a\u5373\u53ef\u3002', 'Inventory is ready. Return to loadout and upgrade.');
        }
        if (Number.isFinite(focusEstimate.days) && focusEstimate.days > 0) {
            return text(`\u6309\u5f53\u524d\u65e5\u5faa\u73af\u7ea6 ${focusEstimate.days} \u5929\u8865\u9f50\u3002`, `About ${focusEstimate.days} day${focusEstimate.days > 1 ? 's' : ''} at the current daily loop.`);
        }
        return '';
    }

    function getPrepGuidance(chapter) {
        const power = getTotalPower();
        const ratio = power / Math.max(1, Number(chapter.recommended || 1));
        if (ratio >= 1.08) return text('当前战力已经够用，优先直接进战斗拿局内成长。', 'Your power is ready. Jump in and grow through in-run upgrades.');
        if (ratio >= 0.9) return text('差距不大，补一层整备或研究后会更稳。', 'You are close. One more upgrade or research level will smooth the run.');
        return text('先补主武器与研究，再回来开打会更轻松。', 'Upgrade weapons and research first for a much smoother run.');
    }

    function formatResourceUnitAmount(key, value) {
        return `${formatCompact(value)} ${localize(getRewardDisplayMeta(key).short || getRewardDisplayMeta(key).label)}`;
    }

    function getUpgradeCostLabel(cost) {
        if (!cost) return text('当前已满级。', 'Already maxed.');
        const parts = [];
        if (cost.credits) parts.push(formatResourceUnitAmount('credits', cost.credits));
        if (cost.alloy) parts.push(formatResourceUnitAmount('alloy', cost.alloy));
        if (cost.signal) parts.push(formatResourceUnitAmount('signal', cost.signal));
        return `${text('升级消耗', 'Cost')} · ${parts.join(' / ')}`;
    }

    function formatCostInline(cost) {
        const parts = [];
        if (Number(cost?.credits || 0) > 0) parts.push(formatResourceUnitAmount('credits', cost.credits));
        if (Number(cost?.alloy || 0) > 0) parts.push(formatResourceUnitAmount('alloy', cost.alloy));
        if (Number(cost?.signal || 0) > 0) parts.push(formatResourceUnitAmount('signal', cost.signal));
        return parts.join(' · ');
    }

    function getResearchCostLabel(cost) {
        const discounted = applyResearchDiscount(cost);
        const parts = [];
        if (discounted.credits) parts.push(formatResourceUnitAmount('credits', discounted.credits));
        if (discounted.signal) parts.push(formatResourceUnitAmount('signal', discounted.signal));
        return `${text('下一层', 'Next')} · ${parts.join(' / ')}`;
    }

    function getResearchEffectLabel(entry, levelData) {
        if (!levelData) return text('等待升级', 'Upgrade to activate');
        const keys = ['powerBonus', 'creditsBonus', 'alloyBonus', 'researchDiscount', 'eliteDropBonus', 'ultimateChargeBonus'];
        const key = keys.find((field) => Number(levelData[field] || 0) > 0);
        if (!key) return text('基础成长', 'Base growth');
        const value = `${Math.round(Number(levelData[key] || 0) * 100)}%`;
        switch (key) {
            case 'powerBonus': return `${text('战力', 'Power')} +${value}`;
            case 'creditsBonus': return `${text('金币', 'Credits')} +${value}`;
            case 'alloyBonus': return `${text('合金', 'Alloy')} +${value}`;
            case 'researchDiscount': return `${text('减负', 'Discount')} ${value}`;
            case 'eliteDropBonus': return `${text('精英收益', 'Elite Yield')} +${value}`;
            case 'ultimateChargeBonus': return `${text('充能', 'Charge')} +${value}`;
            default: return value;
        }
    }

    function renderRewardInline(reward) {
        const entries = Object.entries(reward || {}).filter(([, value]) => Number(value || 0) > 0);
        if (!entries.length) return escapeHtml(text('无', 'None'));
        return entries.map(([key, value]) => {
            const resource = getRewardDisplayMeta(key);
            const label = localize(resource.short || resource.label);
            return `${escapeHtml(resource.icon || '•')} ${escapeHtml(formatCompact(value))} ${escapeHtml(label)}`;
        }).join(' · ');
    }

    function formatRewardPlainText(reward) {
        const entries = Object.entries(reward || {}).filter(([, value]) => Number(value || 0) > 0);
        if (!entries.length) return text('无', 'None');
        return entries.map(([key, value]) => {
            const resource = getRewardDisplayMeta(key);
            const label = localize(resource.short || resource.label);
            return `${resource.icon || '•'} ${formatCompact(value)} ${label}`;
        }).join(' · ');
    }

    function renderRewardChips(reward) {
        const entries = Object.entries(reward || {}).filter(([, value]) => Number(value || 0) > 0);
        return entries.map(([key, value]) => {
            const resource = getRewardDisplayMeta(key);
            return `<span class="of-chip is-good">${escapeHtml(resource.icon || '•')} ${escapeHtml(formatCompact(value))} ${escapeHtml(localize(resource.short || resource.label))}</span>`;
        }).join('');
    }

    function getRewardDisplayMeta(key) {
        if (resourceMap[key]) return resourceMap[key];
        if (key === 'eliteKeys') {
            return {
                label: { zh: '续航钥匙', en: 'Recovery Keys' },
                short: { zh: '钥', en: 'KEY' },
                icon: '⟡'
            };
        }
        if (key === 'premiumSeason') {
            return {
                label: { zh: '高级赛季', en: 'Premium Season' },
                short: { zh: '高线', en: 'PASS' },
                icon: '★'
            };
        }
        return {
            short: { zh: key, en: key },
            label: { zh: key, en: key },
            icon: '•'
        };
    }

    function loadSave() {
        const defaults = JSON.parse(JSON.stringify(config.baseSave || {}));
        defaults.tab = defaults.tab || 'run';
        defaults.selectedChapterId = chapterMap[defaults.selectedChapterId] ? defaults.selectedChapterId : config.chapters[0].id;
        defaults.selectedHullId = hullMap[defaults.selectedHullId] ? defaults.selectedHullId : config.hulls[0].id;
        defaults.selectedWeaponIds = Array.isArray(defaults.selectedWeaponIds) && defaults.selectedWeaponIds.length
            ? defaults.selectedWeaponIds.filter((id) => weaponMap[id]).slice(0, 2)
            : [config.weapons[0].id, config.weapons[1]?.id || config.weapons[0].id];
        if (defaults.selectedWeaponIds.length < 2) defaults.selectedWeaponIds = [defaults.selectedWeaponIds[0], config.weapons[1]?.id || defaults.selectedWeaponIds[0]];
        defaults.selectedDroneId = droneMap[defaults.selectedDroneId] ? defaults.selectedDroneId : config.drones[0].id;
        defaults.selectedUltimateId = ultimateMap[defaults.selectedUltimateId] ? defaults.selectedUltimateId : config.ultimates[0].id;
        defaults.hullLevels = defaults.hullLevels || {};
        defaults.weaponLevels = defaults.weaponLevels || {};
        defaults.droneLevels = defaults.droneLevels || {};
        defaults.ultimateLevels = defaults.ultimateLevels || {};
        defaults.researchLevels = defaults.researchLevels || {};
        defaults.clearedChapters = Array.isArray(defaults.clearedChapters) ? defaults.clearedChapters : [];
        defaults.missionClaimed = Array.isArray(defaults.missionClaimed) ? defaults.missionClaimed : [];
        defaults.missionDayKey = String(defaults.missionDayKey || '');
        defaults.missionDailyBaseStats = createMissionStatSnapshot(defaults.missionDailyBaseStats);
        defaults.seasonClaimed = Array.isArray(defaults.seasonClaimed) ? defaults.seasonClaimed : [];
        defaults.seasonClaimedPremium = [];
        defaults.stats = {
            runs: 0,
            wins: 0,
            losses: 0,
            totalKills: 0,
            eliteKills: 0,
            bossKills: 0,
            stageClears: 0,
            survivalSeconds: 0,
            lastStageId: defaults.selectedChapterId
        };
        defaults.payment = {
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
        };
        defaults.seenBattleHint = false;

        let parsed = null;
        try {
            parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        } catch (error) {
            parsed = null;
        }

        if (!parsed || typeof parsed !== 'object') return defaults;
        const next = { ...defaults, ...parsed };
        next.selectedChapterId = chapterMap[next.selectedChapterId] ? next.selectedChapterId : defaults.selectedChapterId;
        next.selectedHullId = hullMap[next.selectedHullId] ? next.selectedHullId : defaults.selectedHullId;
        next.selectedWeaponIds = Array.isArray(next.selectedWeaponIds) ? next.selectedWeaponIds.filter((id) => weaponMap[id]).slice(0, 2) : defaults.selectedWeaponIds.slice();
        while (next.selectedWeaponIds.length < 2) next.selectedWeaponIds.push(defaults.selectedWeaponIds[next.selectedWeaponIds.length] || defaults.selectedWeaponIds[0]);
        next.selectedDroneId = droneMap[next.selectedDroneId] ? next.selectedDroneId : defaults.selectedDroneId;
        next.selectedUltimateId = ultimateMap[next.selectedUltimateId] ? next.selectedUltimateId : defaults.selectedUltimateId;
        next.hullLevels = { ...defaults.hullLevels, ...(parsed.hullLevels || {}) };
        next.weaponLevels = { ...defaults.weaponLevels, ...(parsed.weaponLevels || {}) };
        next.droneLevels = { ...defaults.droneLevels, ...(parsed.droneLevels || {}) };
        next.ultimateLevels = { ...defaults.ultimateLevels, ...(parsed.ultimateLevels || {}) };
        next.researchLevels = { ...defaults.researchLevels, ...(parsed.researchLevels || {}) };
        next.clearedChapters = Array.isArray(parsed.clearedChapters) ? parsed.clearedChapters.filter((id) => chapterMap[id]) : defaults.clearedChapters;
        next.missionClaimed = Array.isArray(parsed.missionClaimed) ? parsed.missionClaimed.filter((id) => missionMap[id]) : defaults.missionClaimed;
        next.missionDayKey = String(parsed.missionDayKey || defaults.missionDayKey || '');
        next.missionDailyBaseStats = { ...defaults.missionDailyBaseStats, ...createMissionStatSnapshot(parsed.missionDailyBaseStats) };
        next.seasonClaimed = Array.isArray(parsed.seasonClaimed) ? parsed.seasonClaimed : [];
        next.seasonClaimedPremium = Array.isArray(parsed.seasonClaimedPremium) ? parsed.seasonClaimedPremium : [];
        next.stats = { ...defaults.stats, ...(parsed.stats || {}) };
        next.payment = {
            ...defaults.payment,
            ...(parsed.payment || {}),
            claimedOrders: { ...defaults.payment.claimedOrders, ...((parsed.payment || {}).claimedOrders || {}) },
            verifiedTxids: Array.isArray((parsed.payment || {}).verifiedTxids) ? parsed.payment.verifiedTxids : [],
            claimedOfferIds: Array.isArray((parsed.payment || {}).claimedOfferIds) ? parsed.payment.claimedOfferIds.filter((id) => offerMap[id]) : [],
            recentOrders: Array.isArray((parsed.payment || {}).recentOrders) ? parsed.payment.recentOrders.map((order) => normalizeOrder(order)).filter(Boolean) : [],
            permanent: { ...defaults.payment.permanent, ...((parsed.payment || {}).permanent || {}) }
        };
        next.unlockedChapterIndex = clamp(Number(parsed.unlockedChapterIndex || defaults.unlockedChapterIndex || 0), 0, config.chapters.length - 1);
        next.seenBattleHint = !!parsed.seenBattleHint;
        return next;
    }

    function saveProgress() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
        } catch (error) {}
    }

    function readLang() {
        try {
            const saved = localStorage.getItem(HUB_LANG_KEY);
            if (saved === 'zh' || saved === 'en') return saved;
        } catch (error) {}
        const browserLang = String(navigator.language || '').toLowerCase();
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }

    function text(zh, en) {
        return state.lang === 'en' ? en : zh;
    }

    function looksCorruptedLocalizedText(value) {
        if (typeof value !== 'string' || !value) return false;
        if (value.includes('\uFFFD')) return true;
        const suspiciousFragments = [
            '闂', '鍟', '杞', '璧', '鐮', '鍗', '鏁', '浠', '閲', '鈻', '鈼', '鈽', '鉁', '陇',
            '缁', '銆', '€', '鏈', '轰', '綋', '鏂', '墜', '浣', '儸', '濮', '娑', '閸', '閿',
            '閺', '閹', '顒', '鍫', '鍨', '鎮', '鍚', '鐞', '缍', '鏀', '绔', '绱', '淇', '鍘',
            '纰', '幆', '澶栨部', '鎺', '繘', '缃', '牸', '鍩', '鍥', '炴', '敹', '閾',
            '捐', '矾', '姣', '忔', '棩', '琛', 'ョ', '粰', '纰庣幆', '澶栨部', '鎺ㄨ繘',
            '缃戞牸', '鍩虹', '姣忔棩', '琛ョ粰', '鏂版墜', '鏈轰綋', '绔栧睆', '鐢熷瓨', '鍏绘垚', '闂叧'
        ];
        let score = 0;
        suspiciousFragments.forEach((fragment) => {
            if (value.includes(fragment)) score += fragment.length > 1 ? 2 : 1;
        });
        return score >= 1;
    }

    function localize(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            if (state.lang === 'en') return value.en || value.zh || '';
            const zhValue = value.zh || '';
            if (zhValue && !looksCorruptedLocalizedText(zhValue)) return zhValue;
            return value.en || zhValue || '';
        }
        return String(value);
    }

    function showToast(message, tone) {
        if (!ui.toast) return;
        ui.toast.textContent = message;
        ui.toast.classList.add('is-visible');
        ui.toast.dataset.tone = tone || 'info';
        if (state.toastTimer) window.clearTimeout(state.toastTimer);
        state.toastTimer = window.setTimeout(() => {
            ui.toast.classList.remove('is-visible');
        }, 1800);
    }

    async function copyText(value, successMessage) {
        try {
            await navigator.clipboard.writeText(String(value || ''));
            showToast(successMessage, 'success');
        } catch (error) {
            showToast(text('复制失败，请手动复制。', 'Copy failed. Please copy manually.'), 'warning');
        }
    }

    function scheduleBattleHintAutoHide() {
        const battle = state.battle;
        if (battle.hintTimeoutId) {
            window.clearTimeout(battle.hintTimeoutId);
            battle.hintTimeoutId = 0;
        }
        if (!battle.active || !battle.ui.hint || state.save.seenBattleHint) return;
        battle.hintTimeoutId = window.setTimeout(() => {
            if (state.battle.ui.hint) {
                state.battle.ui.hint.classList.add('is-hidden');
            }
            state.battle.hintTimeoutId = 0;
        }, BATTLE_HINT_DURATION_MS);
    }

    function getNearestEnemy() {
        let result = null;
        let bestDistance = Infinity;
        state.battle.enemies.forEach((enemy) => {
            const distance = Math.hypot(enemy.x - state.battle.player.x, enemy.y - state.battle.player.y);
            if (distance < bestDistance) {
                bestDistance = distance;
                result = enemy;
            }
        });
        return result;
    }

    function pushEffect(effect) {
        state.battle.effects.push(effect);
    }

    function getStageDensityProgress() {
        const duration = Number(state.battle.runtime?.chapter?.duration || 1);
        return clamp(1 - state.battle.timeRemaining / Math.max(1, duration), 0, 1);
    }

    function getDayKey() {
        const date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    function typeIcon(type) {
        switch (type) {
            case 'hull': return '⚔';
            case 'weapon': return '✦';
            case 'drone': return '◎';
            case 'ultimate': return '☄';
            default: return '•';
        }
    }

    function getUnitSectionHint(type) {
        switch (type) {
            case 'hull':
                return text('机体决定容错和移动手感', 'Hull defines survivability and handling');
            case 'weapon':
                return text('两把主武器决定清群和首领输出', 'Two weapons define wave clear and boss DPS');
            case 'drone':
                return text('无人机负责拾取、续航与辅助', 'Drones handle pickup, sustain, and utility');
            case 'ultimate':
                return text('大招负责关键时刻翻盘', 'Ultimate decides swing moments');
            default:
                return text('成长模块', 'Growth Module');
        }
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        const locale = state.lang === 'en' ? 'en-US' : 'zh-CN';
        if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
        if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
        return Math.round(number).toLocaleString(locale);
    }

    function formatBattleTime(seconds) {
        const safe = Math.max(0, Math.ceil(seconds));
        const minutes = Math.floor(safe / 60);
        const remain = safe % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`;
    }

    function formatPaymentAmount(value) {
        return Number(value || 0).toFixed(PAYMENT_ORDER_DISPLAY_DECIMALS);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(from, to, t) {
        return from + (to - from) * clamp(t, 0, 1);
    }

    function roundMoney(value) {
        return Math.round(Number(value || 0) * 10000) / 10000;
    }

    function shuffle(list) {
        for (let index = list.length - 1; index > 0; index -= 1) {
            const next = Math.floor(Math.random() * (index + 1));
            const current = list[index];
            list[index] = list[next];
            list[next] = current;
        }
        return list;
    }

    function uniquePush(list, value) {
        const result = Array.isArray(list) ? list.slice() : [];
        if (!result.includes(value)) result.push(value);
        return result;
    }

    function withAlpha(color, alpha) {
        if (!color || !color.startsWith('#')) return color;
        const safeAlpha = clamp(alpha, 0, 1);
        if (color.length === 7) return `${color}${Math.round(safeAlpha * 255).toString(16).padStart(2, '0')}`;
        return color;
    }
}());
