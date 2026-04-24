(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_cipher_match_save_v1';
    const PAYMENT_NETWORK = 'TRON (TRC20)';
    const PAYMENT_WALLET = 'TRiNCMEiH8ev31PbgN9ZCUkw48yFqF8boW';
    const PAYMENT_ORDER_EXPIRY_MS = 15 * 60 * 1000;
    const PAYMENT_TXID_RE = /^[a-fA-F0-9]{64}$/;

    const config = window.GENESIS_CIPHER_MATCH_CONFIG;
    if (!config) return;

    const tabMap = Object.fromEntries(config.tabs.map((item) => [item.id, item]));
    const chapterMap = Object.fromEntries(config.chapters.map((item) => [item.id, item]));
    const leaderMap = Object.fromEntries(config.leaders.map((item) => [item.id, item]));
    const moduleMap = Object.fromEntries(config.modules.map((item) => [item.id, item]));
    const skillMap = Object.fromEntries(config.skills.map((item) => [item.id, item]));
    const researchMap = Object.fromEntries(config.research.map((item) => [item.id, item]));
    const shopMap = Object.fromEntries(config.shopItems.map((item) => [item.id, item]));
    const offerMap = Object.fromEntries(config.paymentOffers.map((item) => [item.id, item]));
    const tileMap = Object.fromEntries(config.board.colors.map((item) => [item.id, item]));
    const allCardIds = [
        ...config.leaders.map((item) => item.id),
        ...config.modules.map((item) => item.id),
        ...config.skills.map((item) => item.id)
    ];
    const cardTypeMap = Object.fromEntries([
        ...config.leaders.map((item) => [item.id, 'leader']),
        ...config.modules.map((item) => [item.id, 'module']),
        ...config.skills.map((item) => [item.id, 'skill'])
    ]);

    const state = {
        lang: readLang(),
        save: null,
        tab: 'run',
        modal: null,
        toastTimer: 0,
        run: null
    };

    const ui = {};

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        state.save = loadSave();
        resetDailyState();
        state.tab = tabMap[state.save.tab] ? state.save.tab : 'run';
        cacheUi();
        bindEvents();
        renderAll();
    }

    function cacheUi() {
        ui.backLink = document.getElementById('backToHubLink');
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
        ui.toast = document.getElementById('toast');
        ui.langButtons = Array.from(document.querySelectorAll('[data-lang-switch]'));
    }

    function bindEvents() {
        ui.langButtons.forEach((button) => {
            button.addEventListener('click', () => {
                state.lang = button.dataset.langSwitch === 'en' ? 'en' : 'zh';
                try { localStorage.setItem(HUB_LANG_KEY, state.lang); } catch (error) {}
                if (state.modal) {
                    closeModal();
                }
                renderAll();
            });
        });

        ui.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            const nextTab = button.dataset.tab;
            if (!tabMap[nextTab]) return;
            state.tab = nextTab;
            state.save.tab = nextTab;
            closeModal();
            saveProgress();
            renderAll();
        });

        ui.heroSummary?.addEventListener('click', onPanelAction);
        ui.panelContent.addEventListener('click', onPanelAction);
        ui.modalCloseBtn?.addEventListener('click', closeModal);
        ui.modalRoot?.addEventListener('click', (event) => {
            if (event.target === ui.modalRoot) {
                closeModal();
                return;
            }
            if (event.target instanceof Element && event.target.closest('[data-action]')) {
                onPanelAction(event);
            }
        });
    }

    function onPanelAction(event) {
        const node = event.target.closest('[data-action]');
        if (!node) return;
        const action = node.dataset.action;
        const value = node.dataset.value || '';
        const type = node.dataset.type || '';

        switch (action) {
            case 'openTab':
                if (tabMap[value]) {
                    state.tab = value;
                    state.save.tab = value;
                    closeModal();
                    saveProgress();
                    renderAll();
                }
                break;
            case 'selectChapter':
                selectChapter(value);
                break;
            case 'startRun':
                startRun();
                break;
            case 'tapCell':
                tapCell(value);
                break;
            case 'useSkill':
                useSkill();
                break;
            case 'abandonRun':
                abandonRun();
                break;
            case 'buyMoves':
                buyMoves();
                break;
            case 'setLeader':
                if (guardMetaActionDuringRun()) return;
                setLeader(value);
                break;
            case 'toggleModule':
                if (guardMetaActionDuringRun()) return;
                toggleModule(value);
                break;
            case 'setSkill':
                if (guardMetaActionDuringRun()) return;
                setSkill(value);
                break;
            case 'upgradeCard':
                if (guardMetaActionDuringRun()) return;
                upgradeCard(type, value);
                break;
            case 'upgradeResearch':
                if (guardMetaActionDuringRun()) return;
                upgradeResearch(value);
                break;
            case 'claimMission':
                if (guardMetaActionDuringRun()) return;
                claimMission(value);
                break;
            case 'claimSeason':
                if (guardMetaActionDuringRun()) return;
                claimSeason('free', value);
                break;
            case 'claimPremiumSeason':
                if (guardMetaActionDuringRun()) return;
                claimSeason('premium', value);
                break;
            case 'claimDailySupply':
                if (guardMetaActionDuringRun()) return;
                claimDailySupply();
                break;
            case 'buyShopItem':
                if (guardMetaActionDuringRun()) return;
                buyShopItem(value);
                break;
            case 'previewOffer':
                if (guardMetaActionDuringRun()) return;
                previewOffer(value);
                break;
            case 'createOfferOrder':
                if (guardMetaActionDuringRun()) return;
                createOfferOrder(value);
                break;
            case 'verifyOfferTxid':
                if (guardMetaActionDuringRun()) return;
                verifyOfferTxid(value);
                break;
            case 'cancelOfferOrder':
                cancelOfferOrder(value);
                break;
            case 'copyOfferAddress':
                copyText(PAYMENT_WALLET, text('地址已复制。', 'Address copied.'));
                break;
            case 'copyOfferAmount':
                copyText(value, text('金额已复制。', 'Amount copied.'));
                break;
            case 'closeModal':
                closeModal();
                break;
            default:
                break;
        }
    }

    function isMetaActionLocked() {
        return !!state.run?.active;
    }

    function guardMetaActionDuringRun() {
        if (!isMetaActionLocked()) return false;
        showToast(text('当前对局进行中，请先返回战斗完成或撤退。', 'A run is active. Finish it or retreat first.'), 'warn');
        return true;
    }

    function renderAll() {
        document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
        document.body.dataset.cmTab = state.tab;
        renderTexts();
        renderResourceStrip();
        renderHeroSummary();
        renderTabBar();
        renderPanel();
        renderModal();
    }

    function renderTexts() {
        if (ui.backLink) ui.backLink.textContent = text('← 返回大厅', '← Back To Hub');
        if (ui.heroEyebrow) ui.heroEyebrow.textContent = text('创世 · 密码消除', 'Genesis · Cipher Match');
        if (ui.heroTitle) ui.heroTitle.textContent = localize(config.meta.title);
        if (ui.heroSubtitle) ui.heroSubtitle.textContent = localize(config.meta.subtitle);
        document.title = localize(config.meta.title);

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', text(
                '密码消除 - 6x6 解码消除、局外构筑、研究成长、赛季与商店闭环。',
                'Cipher Match - 6x6 decode puzzle runs, deck growth, research, season, and shop loop.'
            ));
        }

        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) langToggle.setAttribute('aria-label', text('语言切换', 'Language'));
        if (ui.tabBar) ui.tabBar.setAttribute('aria-label', text('密码消除页签', 'Cipher Match tabs'));
        if (ui.modalCloseBtn) ui.modalCloseBtn.setAttribute('aria-label', text('关闭弹窗', 'Close modal'));

        ui.langButtons.forEach((button) => {
            const active = (button.dataset.langSwitch === 'en' ? 'en' : 'zh') === state.lang;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function renderResourceStrip() {
        if (!ui.resourceStrip) return;
        ui.resourceStrip.innerHTML = config.currencies.map((currency) => {
            const value = state.save[currency.id] || 0;
            return `
                <div class="cm-resource-pill">
                    <div class="cm-pill-head">
                        <span aria-hidden="true">${escapeHtml(currency.icon)}</span>
                        <strong>${escapeHtml(localize(currency.label))}</strong>
                    </div>
                    <div class="cm-value">${formatCompact(value)}</div>
                    <small>${escapeHtml(getCurrencyMeta(currency.id))}</small>
                </div>
            `;
        }).join('');
    }

    function renderHeroSummary() {
        if (!ui.heroSummary) return;
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const freeLeft = getRemainingFreeRuns();
        const pendingRewards = getPendingRewardCount();
        const quickActions = getHeroQuickActions();
        ui.heroSummary.innerHTML = `
            <div class="cm-summary-grid">
                ${renderSummaryItem('⌘', text('当前关卡', 'Stage'), `${chapter.id} · ${localize(chapter.name)}`)}
                ${renderSummaryItem('⚔', text('构筑战力', 'Power'), `${power} / ${chapter.recommended}`)}
                ${renderSummaryItem('▷', text('免费次数', 'Free Runs'), `${freeLeft}/${getDailyFreeRunsLimit()}`)}
                ${renderSummaryItem('🎁', text('待领奖励', 'Ready Rewards'), formatCompact(pendingRewards))}
            </div>
            <div class="cm-quick-row">
                ${quickActions.map((action) => `
                    <button class="cm-btn-soft" type="button" data-action="openTab" data-value="${action.tab}">${escapeHtml(action.label)}</button>
                `).join('')}
            </div>
        `;
    }

    function getHeroQuickActions() {
        switch (state.tab) {
            case 'deck':
                return [
                    { tab: 'run', label: text('去闯关', 'Open Run') },
                    { tab: 'lab', label: text('去研究', 'Open Lab') },
                    { tab: 'shop', label: text('去商店', 'Open Shop') }
                ];
            case 'lab':
                return [
                    { tab: 'run', label: text('去闯关', 'Open Run') },
                    { tab: 'deck', label: text('去构筑', 'Open Deck') },
                    { tab: 'missions', label: text('去任务', 'Open Missions') }
                ];
            case 'missions':
                return [
                    { tab: 'run', label: text('去闯关', 'Open Run') },
                    { tab: 'season', label: text('去赛季', 'Open Season') },
                    { tab: 'shop', label: text('去商店', 'Open Shop') }
                ];
            case 'season':
                return [
                    { tab: 'run', label: text('去闯关', 'Open Run') },
                    { tab: 'missions', label: text('去任务', 'Open Missions') },
                    { tab: 'shop', label: text('去商店', 'Open Shop') }
                ];
            case 'shop':
                return [
                    { tab: 'run', label: text('去闯关', 'Open Run') },
                    { tab: 'deck', label: text('去构筑', 'Open Deck') },
                    { tab: 'season', label: text('去赛季', 'Open Season') }
                ];
            case 'run':
            default:
                return [
                    { tab: 'deck', label: text('去构筑', 'Open Deck') },
                    { tab: 'lab', label: text('去研究', 'Open Lab') },
                    { tab: 'shop', label: text('去商店', 'Open Shop') }
                ];
        }
    }

    function renderTabBar() {
        if (!ui.tabBar) return;
        ui.tabBar.innerHTML = config.tabs.map((tab) => `
            <button class="cm-tab-btn ${tab.id === state.tab ? 'is-active' : ''}" type="button" data-tab="${tab.id}">
                <span class="cm-tab-icon" aria-hidden="true">${getTabIcon(tab.id)}</span>
                <span>${escapeHtml(localize(tab.label))}</span>
            </button>
        `).join('');
    }

    function renderPanel() {
        if (!ui.panelContent) return;
        switch (state.tab) {
            case 'run':
                ui.panelContent.innerHTML = renderRunTab();
                break;
            case 'deck':
                ui.panelContent.innerHTML = renderDeckTab();
                break;
            case 'lab':
                ui.panelContent.innerHTML = renderLabTab();
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
                ui.panelContent.innerHTML = '';
                break;
        }
    }

    function renderRunLockNotice() {
        if (!isMetaActionLocked()) return '';
        return `
            <div class="cm-mini-card cm-lock-card">
                <div class="cm-titleline">
                    <span aria-hidden="true">⏵</span>
                    <strong>${escapeHtml(text('对局进行中', 'Run In Progress'))}</strong>
                </div>
                <div class="cm-copy">${escapeHtml(text('养成、领奖和支付已暂时锁定，先回战斗页完成或撤退。', 'Upgrades, claims, and payment are locked until you finish or retreat from the current run.'))}</div>
                <div class="cm-action-row">
                    <button class="cm-btn-soft" type="button" data-action="openTab" data-value="run">${escapeHtml(text('返回战斗', 'Back to Run'))}</button>
                </div>
            </div>
        `;
    }

    function getRunLeaderId(run = state.run) {
        return run?.leaderId || state.save.selectedLeader;
    }

    function getRunSkillId(run = state.run) {
        return run?.skillId || state.save.selectedSkill;
    }

    function getRunModuleIds(run = state.run) {
        return Array.isArray(run?.moduleIds) ? run.moduleIds : state.save.selectedModules;
    }

    function runHasModule(moduleId, run = state.run) {
        return getRunModuleIds(run).includes(moduleId);
    }

    function renderRunTab() {
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const entryCost = getEntryCost(chapter);
        const run = state.run;
        const isCurrentRun = run?.active && run.chapterId === chapter.id;
        const isBoss = isBossChapter(chapter);
        const assist = isCurrentRun ? (run.assist || getRunAssistState(chapter)) : getRunAssistState(chapter);
        const goals = isCurrentRun ? run.goals : chapter.goals.map((goal) => ({ ...goal, remaining: goal.amount }));
        const boardHtml = isCurrentRun ? renderLiveBoard(run) : renderPreviewBoard();
        const activeSkillId = isCurrentRun ? getRunSkillId(run) : state.save.selectedSkill;
        const skill = skillMap[activeSkillId];
        const stageReward = getScaledChapterReward(chapter);
        const firstClearReward = state.save.clearedChapters.includes(chapter.id) ? null : getFirstClearReward(chapter);
        const boardHintCopy = isCurrentRun
            ? (run.notice || text('先点 1 格，再点相邻 1 格完成交换。', 'Tap one tile, then an adjacent tile to swap.'))
            : getRunOpeningHint(chapter, assist);
        const tutorialEntryFree = !isCurrentRun && isTutorialEntryFree(chapter, assist);
        const boardWrapClass = [
            'cm-board-wrap',
            isBoss ? 'is-boss' : '',
            isCurrentRun && run.energy >= run.maxEnergy ? 'is-skill-ready' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="cm-stack cm-run-stack">
                <div class="cm-stage-strip">
                    ${config.chapters.map((item) => renderStageChip(item)).join('')}
                </div>

                <div class="cm-card cm-stage-card ${isBoss ? 'is-boss' : ''}">
                    <div class="cm-run-focus-head">
                        <div class="cm-run-stage-main">
                            <div class="cm-run-stage-badge">${escapeHtml(chapter.id)}</div>
                            <div class="cm-run-stage-copy">
                                <strong>${escapeHtml(localize(chapter.name))}</strong>
                                <div class="cm-chip-row">
                                    <span class="cm-chip">${escapeHtml(localize(chapter.pressure))}</span>
                                    ${!isCurrentRun ? `<span class="cm-chip">${escapeHtml(localize(chapter.rewardFocus))}</span>` : ''}
                                    ${tutorialEntryFree ? `<span class="cm-chip is-good">${escapeHtml(text('教学免费', 'Tutorial Free'))}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="cm-tag-row">
                            <span class="cm-tag">${escapeHtml(text('推', 'Rec'))} ${chapter.recommended}</span>
                            <span class="cm-tag ${power >= chapter.recommended ? 'is-good' : 'is-warn'}">${escapeHtml(text('战', 'Pow'))} ${power}</span>
                            ${isBoss ? `<span class="cm-tag is-danger-text">${escapeHtml(text('Boss', 'Boss'))}</span>` : ''}
                        </div>
                    </div>

                    <div class="cm-stage-grid">
                        <div class="cm-stack cm-run-board-column">
                            <div class="cm-battle-hud">
                                ${renderHudPill(text('步', 'Moves'), isCurrentRun ? run.movesLeft : chapter.moves, text('有效交换', 'Valid swaps'), '◫')}
                                ${renderHudPill(text('能', 'Energy'), isCurrentRun ? `${run.energy}/${run.maxEnergy}` : `${assist.bonusEnergy}/${getRunMaxEnergy()}`, localize(skill.name), '⚡')}
                                ${renderHudPill(text('分', 'Score'), isCurrentRun ? formatCompact(run.score) : '0', text('4 连更高', '4-match up'), '✦')}
                                ${isCurrentRun && isBoss
                                    ? renderHudPill(text('反', 'Counter'), `${run.bossTurnsLeft}/${run.bossPulseEvery}`, text('归零触发', 'Zero triggers'), '⛨')
                                    : renderHudPill(
                                        text('票', 'Entry'),
                                        tutorialEntryFree ? text('免', 'Free') : getRemainingFreeRuns() > 0 ? `${getRemainingFreeRuns()}` : `${entryCost}`,
                                        tutorialEntryFree ? text('教学', 'Tutorial') : getRemainingFreeRuns() > 0 ? `${getDailyFreeRunsLimit()}` : text('金币', 'Credits'),
                                        '◎'
                                    )}
                            </div>

                            <div class="${boardWrapClass}">
                                ${boardHtml}
                                ${isCurrentRun && run.feedback ? renderBattleFeedback(run.feedback) : ''}
                            </div>

                            <div class="cm-goal-strip">
                                ${goals.map((goal) => renderCompactGoal(goal)).join('')}
                            </div>

                            ${!isCurrentRun ? `
                                <div class="cm-chip-row cm-run-reward-strip">
                                    ${renderCompactRewardPills(stageReward)}
                                    ${firstClearReward ? `<span class="cm-chip is-good">${escapeHtml(text('首通+', '1st+'))}</span>${renderCompactRewardPills(firstClearReward)}` : ''}
                                </div>
                            ` : ''}

                            ${!isCurrentRun || run.failed ? `<div class="cm-run-tip">${escapeHtml(boardHintCopy)}</div>` : ''}

                            <div class="cm-control-row">
                                <button class="cm-btn-soft" type="button" data-action="useSkill" ${!isCurrentRun || run.failed ? 'disabled' : ''}>
                                    ${escapeHtml(text('放技', 'Skill'))}
                                </button>
                                ${isCurrentRun ? `
                                    <button class="cm-btn" type="button" data-action="${run.failed ? 'buyMoves' : 'abandonRun'}">
                                        ${escapeHtml(run.failed ? text('+5 步', '+5 Moves') : text('退出', 'Retreat'))}
                                    </button>
                                ` : `
                                    <button class="cm-btn" type="button" data-action="startRun">${escapeHtml(text('开打', 'Start'))}</button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderDeckTab() {
        const leader = leaderMap[state.save.selectedLeader];
        const skill = skillMap[state.save.selectedSkill];
        const chapter = getSelectedChapter();
        const assist = getRunAssistState(chapter);
        const stageReward = getScaledChapterReward(chapter);
        const firstClearReward = state.save.clearedChapters.includes(chapter.id) ? null : getFirstClearReward(chapter);
        const equippedModules = state.save.selectedModules.length
            ? state.save.selectedModules.map((id) => `<span class="cm-chip">▣ ${escapeHtml(localize(moduleMap[id].name))}</span>`).join('')
            : `<span class="cm-chip">${escapeHtml(text('模块空槽', 'Module Slot Empty'))}</span>`;

        return `
            <div class="cm-stack">
                ${renderRunLockNotice()}
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('金币', 'Credits'), formatCompact(state.save.credits), text('升级主消耗', 'Upgrade spend'), '◎')}
                    ${renderWalletPill(text('密钥位', 'Key Bits'), formatCompact(state.save.keyBits), text('卡牌升级', 'Card upgrades'), '◇')}
                    ${renderWalletPill(text('战力', 'Power'), `${getDeckPower()}/${chapter.recommended}`, text('当前推荐线', 'Current stage line'), '⚔')}
                    ${renderWalletPill(text('关卡', 'Stage'), chapter.id, localize(chapter.name), '▣')}
                </div>

                <div class="cm-inline-grid cm-deck-overview">
                    <div class="cm-mini-card">
                        <div class="cm-card-head">
                            <div>
                                <div class="eyebrow">${escapeHtml(text('当前出战', 'Current Loadout'))}</div>
                                <strong>${escapeHtml(text('直接影响闯关手感', 'Directly affects the run feel'))}</strong>
                            </div>
                            <span class="cm-tag">${escapeHtml(text('战力', 'Power'))} ${getDeckPower()}</span>
                        </div>
                        <div class="cm-chip-row">
                            <span class="cm-chip">👑 ${escapeHtml(localize(leader.name))}</span>
                            <span class="cm-chip">✦ ${escapeHtml(localize(skill.name))}</span>
                            ${equippedModules}
                        </div>
                        <div class="cm-copy">${escapeHtml(getRunAssistSummary(chapter, assist))}</div>
                    </div>

                    <div class="cm-mini-card">
                        <div class="cm-card-head">
                            <div>
                                <div class="eyebrow">${escapeHtml(text('当前关卡收益', 'Stage Loot'))}</div>
                                <strong>${escapeHtml(`${chapter.id} · ${localize(chapter.name)}`)}</strong>
                            </div>
                        </div>
                        <div class="cm-chip-row">
                            ${renderCompactRewardPills(stageReward)}
                            ${firstClearReward ? `<span class="cm-chip is-good">${escapeHtml(text('首通+', '1st+'))}</span>` : `<span class="cm-chip">${escapeHtml(text('常规结算', 'Normal'))}</span>`}
                        </div>
                        ${firstClearReward ? `<div class="cm-chip-row">${renderCompactRewardPills(firstClearReward)}</div>` : `<div class="cm-copy">${escapeHtml(localize(chapter.rewardFocus))}</div>`}
                    </div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('队长', 'Leader'))}</div>
                            <strong>${escapeHtml(text('选择 1 名核心队长', 'Choose 1 leader'))}</strong>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.leaders.map((item) => renderCardItem('leader', item, item.id === state.save.selectedLeader)).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('模块', 'Modules'))}</div>
                            <strong>${escapeHtml(text('最多装配 2 个模块', 'Equip up to 2 modules'))}</strong>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.modules.map((item) => renderCardItem('module', item, state.save.selectedModules.includes(item.id))).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('主动技', 'Skills'))}</div>
                            <strong>${escapeHtml(text('切换 1 个主动技能', 'Swap 1 active skill'))}</strong>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.skills.map((item) => renderCardItem('skill', item, item.id === state.save.selectedSkill)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderLabTab() {
        const decodeBonus = Math.floor(getResearchLevel('decodeCache') / 3);
        const energyBonus = getResearchLevel('pulseBattery') * 6;
        const skillBonus = getResearchLevel('signalAmp') * 4;
        const lootBonus = getResearchLevel('lootRelay') * 5;
        const powerBonus = getResearchLevel('stabilityMesh') * 4;
        return `
            <div class="cm-stack">
                ${renderRunLockNotice()}
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('密码尘', 'Cipher Dust'), formatCompact(state.save.cipherDust), text('研究材料', 'Research material'), '✦')}
                    ${renderWalletPill(text('开局步', 'Start Moves'), decodeBonus > 0 ? `+${decodeBonus}` : '0', text('解码缓存', 'Decode Cache'), '◫')}
                    ${renderWalletPill(text('能量上限', 'Max Energy'), energyBonus > 0 ? `+${energyBonus}` : '0', text('脉冲电池', 'Pulse Battery'), '⚡')}
                    ${renderWalletPill(text('章节收益', 'Loot Bonus'), lootBonus > 0 ? `+${lootBonus}%` : '0%', text('战利中继', 'Loot Relay'), '🎁')}
                </div>

                <div class="cm-inline-grid">
                    <div class="cm-mini-card">
                        <strong>${escapeHtml(text('技能增幅', 'Skill Bonus'))}</strong>
                        <div class="cm-value">${skillBonus}%</div>
                        <small>${escapeHtml(text('每级 +4%，提高主动技压制力。', 'Each level adds 4% skill impact.'))}</small>
                    </div>
                    <div class="cm-mini-card">
                        <strong>${escapeHtml(text('构筑加成', 'Deck Bonus'))}</strong>
                        <div class="cm-value">${powerBonus}%</div>
                        <small>${escapeHtml(text('每级 +4%，直接抬高推荐线追赶速度。', 'Each level adds 4% deck power.'))}</small>
                    </div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('研究作用', 'Research Impact'))}</div>
                            <strong>${escapeHtml(text('每项研究都对应一个明确战斗效果', 'Every node maps to a clear run benefit'))}</strong>
                        </div>
                    </div>
                    <div class="cm-card-grid">
                        ${config.research.map((item) => renderResearchItem(item)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderMissionsTab() {
        const missions = getMissionStates();
        const claimable = missions.filter((item) => item.canClaim).length;
        const claimed = missions.filter((item) => item.claimed).length;
        return `
            <div class="cm-stack">
                ${renderRunLockNotice()}
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('可领', 'Ready'), claimable, text('自动置顶', 'Pinned'), '🎁')}
                    ${renderWalletPill(text('完成', 'Claimed'), `${claimed}/${missions.length}`, text('任务进度', 'Mission progress'), '✓')}
                    ${renderWalletPill(text('对局', 'Runs'), formatCompact(state.save.stats.runs), text('完成累计', 'Finished total'), '▷')}
                    ${renderWalletPill(text('胜场', 'Wins'), formatCompact(state.save.stats.wins), text('推动成长', 'Feeds growth'), '⚔')}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('任务', 'Missions'))}</div>
                            <strong>${escapeHtml(text('可领奖励优先显示', 'Claimable rewards first'))}</strong>
                        </div>
                    </div>
                    <div class="cm-mission-list">
                        ${missions.map((item) => renderMissionItem(item)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderSeasonTab() {
        const freeTrack = getVisibleSeasonTrack(config.seasonFreeTrack, state.save.seasonClaims.free);
        const premiumTrack = getVisibleSeasonTrack(config.seasonPremiumTrack, state.save.seasonClaims.premium);
        const freeReady = getReadySeasonCount('free');
        const premiumReady = getReadySeasonCount('premium');
        const metaLocked = isMetaActionLocked();
        return `
            <div class="cm-stack">
                ${renderRunLockNotice()}
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('赛季经验', 'Season XP'), formatCompact(state.save.seasonXp), text('闯关 / 任务 / 商店', 'Runs / missions / shop'), '✧')}
                    ${renderWalletPill(text('赛季等级', 'Season Lv'), Math.floor(state.save.seasonXp / 120) + 1, text('每 120 经验', 'Per 120 XP'), '⇡')}
                    ${renderWalletPill(text('免费可领', 'Free Ready'), freeReady, text('最近档位', 'Closest milestones'), '🎁')}
                    ${renderWalletPill(text('高级轨', 'Premium'), state.save.premiumSeason ? premiumReady : text('未解锁', 'Locked'), state.save.premiumSeason ? text('高级可领', 'Premium ready') : text('解锁更厚', 'Unlock for more'), '⟡')}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('免费轨道', 'Free Track'))}</div>
                            <strong>${escapeHtml(text('只展示最近的关键档位', 'Shows the nearest milestones'))}</strong>
                        </div>
                    </div>
                    <div class="cm-season-list">${freeTrack.map((item) => renderSeasonItem('free', item)).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('高级轨道', 'Premium Track'))}</div>
                            <strong>${escapeHtml(state.save.premiumSeason ? text('高级奖励已开启', 'Premium rewards unlocked') : text('解锁后可领取更多奖励', 'Unlock for extra rewards'))}</strong>
                        </div>
                        ${state.save.premiumSeason ? '' : `<button class="cm-btn-soft" type="button" data-action="previewOffer" data-value="seasonPass" ${metaLocked ? 'disabled' : ''}>${escapeHtml(text('解锁通行证', 'Unlock Pass'))}</button>`}
                    </div>
                    <div class="cm-season-list">${premiumTrack.map((item) => renderSeasonItem('premium', item)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderShopTab() {
        const dailyClaimed = isDailyShopClaimed();
        const pendingOrders = getPendingOrderCount();
        const ownedOffers = getOwnedOfferCount();
        const gatePlan = getStageGatePlan();
        return `
            <div class="cm-stack">
                ${renderRunLockNotice()}
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('金币', 'Credits'), formatCompact(state.save.credits), text('升级 / 门票 / 商店', 'Upgrades / entry / shop'), '◎')}
                    ${renderWalletPill(text('密钥位', 'Key Bits'), formatCompact(state.save.keyBits), text('卡牌升级', 'Card upgrades'), '◇')}
                    ${renderWalletPill(text('密码尘', 'Cipher Dust'), formatCompact(state.save.cipherDust), text('研究主材料', 'Main research material'), '✦')}
                    ${renderWalletPill(text('订单 / 特权', 'Orders / Perks'), `${pendingOrders}/${ownedOffers}`, dailyClaimed ? text('每日补给已领', 'Daily supply claimed') : text('今日仍有免费补给', 'Daily free supply ready'), '🧾')}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('基础商店', 'Utility Shop'))}</div>
                            <strong>${escapeHtml(text('每日补给与资源追赶包', 'Daily supply and catch-up packs'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('金币买追赶包，免费补给每天 1 次。', 'Credits buy catch-up packs, and the free supply refreshes daily.'))}</div>
                        </div>
                    </div>
                    <div class="cm-shop-list">${config.shopItems.map((item) => renderShopItem(item)).join('')}</div>
                </div>

                ${renderPaymentStatusCard()}
                ${renderShopGateGuide(gatePlan)}

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('充值礼包', 'Payment Offers'))}</div>
                            <strong>${escapeHtml(text('永久特权会直接作用到闯关和收益', 'Permanent perks directly affect runs and rewards'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('已拥有礼包不会重复购买，待验证订单也会保留。', 'Owned one-time packs cannot be bought again, and pending orders are preserved.'))}</div>
                        </div>
                    </div>
                    <div class="cm-offer-list">${config.paymentOffers.map((item) => renderOfferItem(item)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderPreviewBoard() {
        const preview = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'beta'];
        const cells = [];
        for (let row = 0; row < config.board.size; row += 1) {
            for (let col = 0; col < config.board.size; col += 1) {
                const type = preview[(row + col) % preview.length];
                const tile = tileMap[type];
                cells.push(`<div class="cm-cell cm-cell--${escapeHtml(type)}" aria-hidden="true">${escapeHtml(tile.icon)}</div>`);
            }
        }
        return `<div class="cm-board">${cells.join('')}</div>`;
    }

    function renderStageChip(chapter) {
        const unlocked = isChapterUnlocked(chapter.id);
        const active = chapter.id === state.save.selectedChapter;
        return `
            <button class="cm-stage-chip ${active ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="selectChapter" data-value="${chapter.id}" ${unlocked ? '' : 'disabled'}>
                <strong>${escapeHtml(chapter.id)} ${isBossChapter(chapter) ? '⛨' : ''}</strong>
                <span>${escapeHtml(localize(chapter.name))}</span>
                <small>${escapeHtml(text('推荐', 'Rec'))} ${chapter.recommended}</small>
            </button>
        `;
    }

    function renderGoal(goal) {
        const meta = getGoalMeta(goal.type);
        const total = Math.max(1, goal.amount || goal.remaining || 1);
        const done = Math.max(0, total - goal.remaining);
        const percent = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
        return `
            <div class="cm-goal-chip">
                <div class="cm-titleline">
                    <span aria-hidden="true">${escapeHtml(meta.icon)}</span>
                    <strong>${escapeHtml(meta.label)}</strong>
                </div>
                <small>${escapeHtml(text('剩余', 'Left'))} ${Math.max(0, goal.remaining)} / ${total}</small>
                <div class="cm-progress"><span style="width:${percent}%"></span></div>
            </div>
        `;
    }

    function renderCompactGoal(goal) {
        const meta = getGoalMeta(goal.type);
        const total = Math.max(1, goal.amount || goal.remaining || 1);
        const done = Math.max(0, total - goal.remaining);
        const percent = Math.max(0, Math.min(100, Math.round((done / total) * 100)));
        return `
            <div class="cm-goal-token">
                <div class="cm-goal-token-head">
                    <span class="cm-goal-token-icon" aria-hidden="true">${escapeHtml(meta.icon)}</span>
                    <strong>${Math.max(0, goal.remaining)}</strong>
                    <small>/ ${total}</small>
                </div>
                <div class="cm-progress"><span style="width:${percent}%"></span></div>
            </div>
        `;
    }

    function renderRunGuide(chapter, power) {
        const gap = Math.max(0, chapter.recommended - power);
        const assist = getRunAssistState(chapter);
        const gatePlan = getStageGatePlan(chapter, power, assist);
        const tutorialFree = isTutorialEntryFree(chapter, assist);
        const readyBonus = assist.bonusMoves > 0 || assist.bonusEnergy > 0 || assist.progressBonus > 0;
        const masteryLabel = getPlayerMasteryLabel();
        const difficultyLabel = getStageDifficultyLabel(chapter, assist);
        const goalSummary = getRunGoalSummary(chapter);
        const openerHint = getRunOpeningHint(chapter, assist);
        const assistLabel = tutorialFree
            ? text('首通教学免费', 'Tutorial entry free')
            : assist.rookie.active
            ? text('新手保护已生效', 'Rookie assist active')
            : readyBonus
                ? text('构筑加成已生效', 'Deck bonus active')
                : text('当前可按正常节奏推进', 'Ready to push at the normal pace');
        const readinessLabel = gap > 0
            ? text(`战力仍差 ${formatCompact(gap)}`, `Still short ${formatCompact(gap)}`)
            : readyBonus
                ? text('已有开局加成', 'Opening bonus ready')
                : text('可以直接开打', 'Ready to start');
        const steps = [
            { icon: '①', label: text('点两格', 'Pick 2') },
            { icon: '②', label: text('凑 3 连', 'Match 3') },
            { icon: '③', label: text('满能量放技', 'Cast at 100') }
        ];
        if (assist.rookie.active) {
            steps.push({ icon: '④', label: text('首补免费', '1st continue free') });
        }
        return `
            <div class="cm-mini-card cm-run-brief">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(text('关卡简报', 'Stage Brief'))}</strong>
                        <div class="cm-copy">${escapeHtml(openerHint)}</div>
                    </div>
                    <span class="cm-tag ${gap > 0 ? 'is-warn' : assist.rookie.active ? 'is-good' : ''}">${escapeHtml(difficultyLabel)}</span>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('阶段', 'Phase'))} · ${escapeHtml(masteryLabel)}</span>
                    <span class="cm-chip">${escapeHtml(text('目标', 'Goals'))} · ${escapeHtml(goalSummary)}</span>
                    <span class="cm-chip ${assist.rookie.active || readyBonus ? 'is-good' : ''}">${escapeHtml(assistLabel)}</span>
                </div>
                <div class="cm-chip-row cm-run-steps">
                    ${steps.map((item) => `
                        <span class="cm-chip">
                            <strong aria-hidden="true">${escapeHtml(item.icon)}</strong>
                            <span>${escapeHtml(item.label)}</span>
                        </span>
                    `).join('')}
                    <span class="cm-chip ${gap > 0 ? 'is-warn' : readyBonus ? 'is-good' : ''}">
                        <strong aria-hidden="true">${gap > 0 ? '!' : readyBonus ? '+' : '✓'}</strong>
                        <span>${escapeHtml(readinessLabel)}</span>
                    </span>
                </div>
                <div class="cm-copy">${escapeHtml(getRunAssistSummary(chapter, assist))}</div>
                ${renderStageGateCard(gatePlan)}
            </div>
        `;
    }

    function renderBattleFeedback(feedback) {
        return `
            <div class="cm-board-centerfx tone-${escapeHtml(feedback.tone || 'good')}">
                <strong>${escapeHtml(feedback.title || '')}</strong>
                <span>${escapeHtml(feedback.detail || '')}</span>
            </div>
        `;
    }

    function renderCardItem(type, item, selected) {
        const level = getCardLevel(item.id);
        const maxLevel = getCardMaxLevel(type);
        const maxed = level >= maxLevel;
        const cost = getCardCost(type, item.id);
        const canAfford = !maxed && state.save.credits >= cost.credits && state.save.keyBits >= cost.keyBits;
        const metaLocked = isMetaActionLocked();
        const power = getCardPower(type, item.id);
        const nextPower = maxed ? power : power + getCardPowerStep(type);
        const action = type === 'leader' ? 'setLeader' : type === 'module' ? 'toggleModule' : 'setSkill';
        const selectLabel = type === 'module'
            ? selected ? text('卸下', 'Unequip') : text('装配', 'Equip')
            : selected ? text('已上阵', 'Active') : text('设为当前', 'Set Active');
        const stateLabel = type === 'module'
            ? selected ? text('已装配', 'Equipped') : text('待装配', 'Idle')
            : selected ? text('当前生效', 'Applied') : text('待命中', 'Idle');

        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(localize(item.role))}</div>
                    </div>
                    <span class="cm-tag ${selected ? 'is-good' : ''}">${escapeHtml(stateLabel)} · ${escapeHtml(text('等级', 'Lv'))} ${level}/${maxLevel}</span>
                </div>
                <div class="cm-copy">${escapeHtml(localize(item.effect || item.skill))}</div>
                <div class="cm-chip-row">
                    <span class="cm-chip">⚔ ${power}</span>
                    <span class="cm-chip">${escapeHtml(maxed ? text('✓ 满', '✓ Max') : `⇡ +${nextPower}`)}</span>
                    <span class="cm-chip">${escapeHtml(maxed ? text('✓ 完成', '✓ Done') : `◎${formatCompact(cost.credits)} ◇${formatCompact(cost.keyBits)}`)}</span>
                </div>
                <div class="cm-control-row">
                    <button class="cm-btn-soft" type="button" data-action="${action}" data-value="${item.id}" ${metaLocked ? 'disabled' : ''}>${escapeHtml(selectLabel)}</button>
                    <button class="cm-btn" type="button" data-action="upgradeCard" data-type="${type}" data-value="${item.id}" ${(canAfford && !metaLocked) ? '' : 'disabled'}>${escapeHtml(maxed ? text('已满级', 'Maxed') : text('升级', 'Upgrade'))}</button>
                </div>
            </div>
        `;
    }

    function renderResearchItem(item) {
        const level = getResearchLevel(item.id);
        const maxed = level >= item.maxLevel;
        const cost = getResearchCost(item.id);
        const canAfford = !maxed && state.save.credits >= cost.credits && state.save.cipherDust >= cost.cipherDust;
        const metaLocked = isMetaActionLocked();
        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(item.icon)} ${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(localize(item.effect))}</div>
                    </div>
                    <span class="cm-tag">${escapeHtml(text('等级', 'Lv'))} ${level}/${item.maxLevel}</span>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">◉ ${escapeHtml(getResearchImpactLabel(item.id, level))}</span>
                    <span class="cm-chip">${escapeHtml(maxed ? text('✓ 满', '✓ Max') : `⇡ ${getResearchNextImpactLabel(item.id, level)}`)}</span>
                    <span class="cm-chip">${escapeHtml(maxed ? text('✓ 完成', '✓ Done') : `◎${formatCompact(cost.credits)} ✦${formatCompact(cost.cipherDust)}`)}</span>
                </div>
                <button class="cm-btn" type="button" data-action="upgradeResearch" data-value="${item.id}" ${(canAfford && !metaLocked) ? '' : 'disabled'}>
                    ${escapeHtml(maxed ? text('已满级', 'Maxed') : text('研究升级', 'Upgrade'))}
                </button>
            </div>
        `;
    }

    function renderMissionItem(mission) {
        const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
        const metaLocked = isMetaActionLocked();
        const buttonLabel = mission.claimed
            ? text('已领取', 'Claimed')
            : mission.canClaim
                ? text('领取', 'Claim')
                : text('进行中', 'In Progress');
        return `
            <div class="cm-mission-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(mission.title))}</strong>
                        <div class="cm-copy">${escapeHtml(text('进度', 'Progress'))} ${Math.min(mission.progress, mission.target)} / ${mission.target}</div>
                    </div>
                    ${mission.canClaim ? '<span class="cm-tag is-good">●</span>' : ''}
                </div>
                <div class="cm-progress"><span style="width:${percent}%"></span></div>
                <div class="cm-reward-row">${renderRewardChips(mission.reward)}</div>
                <button class="cm-btn ${mission.canClaim ? '' : 'cm-btn-soft'}" type="button" data-action="claimMission" data-value="${mission.id}" ${mission.canClaim && !metaLocked ? '' : 'disabled'}>
                    ${escapeHtml(buttonLabel)}
                </button>
            </div>
        `;
    }

    function renderSeasonItem(trackType, item) {
        const claimed = state.save.seasonClaims[trackType].includes(item.id);
        const unlocked = state.save.seasonXp >= item.xp;
        const action = trackType === 'free' ? 'claimSeason' : 'claimPremiumSeason';
        const metaLocked = isMetaActionLocked();
        return `
            <div class="cm-season-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(text('档位', 'Tier'))} ${item.id.toUpperCase()}</strong>
                        <div class="cm-copy">${escapeHtml(text('需求经验', 'XP Needed'))} ${item.xp}</div>
                    </div>
                    ${claimed ? `<span class="cm-tag">${escapeHtml(text('已领', 'Claimed'))}</span>` : unlocked ? `<span class="cm-tag is-good">${escapeHtml(text('可领取', 'Ready'))}</span>` : ''}
                </div>
                <div class="cm-reward-row">${renderRewardChips(item.reward)}</div>
                <button class="cm-btn ${claimed ? 'cm-btn-soft' : ''}" type="button" data-action="${action}" data-value="${item.id}" ${claimed || !unlocked || metaLocked ? 'disabled' : ''}>
                    ${escapeHtml(claimed ? text('已领取', 'Claimed') : text('领取奖励', 'Claim Reward'))}
                </button>
            </div>
        `;
    }

    function renderShopItem(item) {
        const claimed = item.daily && isDailyShopClaimed();
        const canAfford = item.price === 0 || state.save.credits >= item.price;
        const action = item.daily ? 'claimDailySupply' : 'buyShopItem';
        const metaLocked = isMetaActionLocked();
        return `
            <div class="cm-shop-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(item.title))}</strong>
                        <div class="cm-copy">${escapeHtml(item.price === 0 ? text('每日一次', 'Once per day') : `${text('价格', 'Price')} ${formatCompact(item.price)}`)}</div>
                    </div>
                    ${item.daily && !claimed ? '<span class="cm-tag is-good">●</span>' : ''}
                </div>
                <div class="cm-reward-row">${renderRewardChips(item.reward)}</div>
                <button class="cm-btn" type="button" data-action="${action}" data-value="${item.id}" ${claimed || !canAfford || metaLocked ? 'disabled' : ''}>
                    ${escapeHtml(item.daily ? (claimed ? text('已领取', 'Claimed') : text('免费领取', 'Claim Free')) : text('购买', 'Buy'))}
                </button>
            </div>
        `;
    }

    function renderOfferItem(item) {
        const owned = isOfferOwned(item.id);
        const order = getPendingOrder(item.id);
        const lastVerified = getLastVerifiedPayment(item.id);
        const metaLocked = isMetaActionLocked();
        const targetSummary = getOfferTargetSummary(item.id);
        const recommendedNow = isOfferRecommendedNow(item.id);
        const fitLabel = owned && recommendedNow
            ? text('当前卡点已覆盖', 'Current gate covered')
            : recommendedNow
                ? text('当前卡点推荐', 'Recommended now')
                : '';
        const badge = owned
            ? text('已拥有', 'Owned')
            : order
                ? text('待验证', 'Pending')
                : `USDT ${item.price}`;
        const copy = owned && item.permanent
            ? (lastVerified
                ? text(`最近到账：${formatTimeLabel(lastVerified.verifiedAt)}`, `Last verified: ${formatTimeLabel(lastVerified.verifiedAt)}`)
                : localize(item.permanent))
            : order
                ? text('订单已创建，继续粘贴交易哈希即可完成验证。', 'Order created. Resume by pasting the TxID.')
                : item.permanent
                    ? localize(item.permanent)
                    : text('支付验证通过后立即发放。', 'Delivered right after payment.');
        return `
            <div class="cm-offer-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(copy)}</div>
                    </div>
                    <span class="cm-tag ${owned ? 'is-good' : order ? 'is-warning' : ''}">${escapeHtml(badge)}</span>
                </div>
                <div class="cm-reward-row">${renderRewardChips(item.reward)}</div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('适配卡点', 'Best For'))} · ${escapeHtml(targetSummary)}</span>
                    ${fitLabel ? `<span class="cm-chip">${escapeHtml(fitLabel)}</span>` : ''}
                </div>
                <button class="cm-btn" type="button" data-action="previewOffer" data-value="${item.id}" ${metaLocked ? 'disabled' : ''}>${escapeHtml(
                    owned
                        ? text('查看内容', 'View Pack')
                        : order
                            ? text('继续支付', 'Resume Payment')
                            : text('打开支付', 'Open Payment')
                )}</button>
            </div>
        `;
    }

    function renderPaymentStatusCard() {
        const pendingOrders = getPendingOrders().slice(0, 2);
        const paymentHistory = getRecentPaymentHistory(3);
        const ownedOffers = config.paymentOffers.filter((item) => isOfferOwned(item.id));
        return `
            <div class="cm-card">
                <div class="cm-card-head">
                    <div>
                        <div class="eyebrow">${escapeHtml(text('支付状态', 'Payment Status'))}</div>
                        <strong>${escapeHtml(text('订单、特权与到账记录', 'Orders, perks, and delivery log'))}</strong>
                        <div class="cm-copy">${escapeHtml(text('本地闭环版：创建订单 → 转账 → 粘贴交易哈希 → 验证后立即到账。', 'Local loop: create order → transfer → paste tx hash → verify → rewards arrive instantly.'))}</div>
                    </div>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('待验证订单', 'Pending Orders'))} · ${pendingOrders.length}</span>
                    <span class="cm-chip">${escapeHtml(text('已激活特权', 'Active Perks'))} · ${ownedOffers.length}</span>
                    <span class="cm-chip">${escapeHtml(text('最近到账', 'Recent Verifications'))} · ${paymentHistory.length}</span>
                </div>
                ${pendingOrders.length ? `
                    <div class="cm-stack">
                        ${pendingOrders.map((order) => renderPendingOrderStatus(order)).join('')}
                    </div>
                ` : `<div class="cm-copy">${escapeHtml(text('当前没有待验证订单；可直接打开礼包创建新的支付单。', 'No pending orders right now. Open any offer to create a new payment order.'))}</div>`}
                ${ownedOffers.length ? `
                    <div class="cm-chip-row">
                        ${ownedOffers.map((item) => `<span class="cm-chip">${escapeHtml(localize(item.name))}</span>`).join('')}
                    </div>
                ` : ''}
                ${paymentHistory.length ? `
                    <div class="cm-stack">
                        ${paymentHistory.map((entry) => renderPaymentHistoryItem(entry)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderStageGateCard(gatePlan) {
        if (!gatePlan) return '';
        const offer = gatePlan.offerId ? offerMap[gatePlan.offerId] : null;
        const recommendationLabel = gatePlan.owned
            ? text('对应礼包已持有', 'Recommended pack owned')
            : gatePlan.recommendedNow
                ? text('当前卡点推荐', 'Recommended now')
                : text('下一卡点预告', 'Next gate prep');
        return `
            <div class="cm-note-bar ${gatePlan.owned || !gatePlan.recommendedNow ? 'is-idle' : ''}">
                <strong>${escapeHtml(gatePlan.title)}</strong>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(gatePlan.tag)}</span>
                    ${offer ? `<span class="cm-chip">${escapeHtml(recommendationLabel)} · ${escapeHtml(localize(offer.name))}</span>` : ''}
                </div>
                <div class="cm-copy">${escapeHtml(gatePlan.summary)}</div>
                <div class="cm-copy">${escapeHtml(gatePlan.statusCopy)}</div>
                <div class="cm-copy">${escapeHtml(text('白嫖', 'Free'))}：${escapeHtml(gatePlan.freePath)}</div>
                <div class="cm-copy">${escapeHtml(text('小氪', 'Light Spend'))}：${escapeHtml(gatePlan.lightPath)}</div>
                <div class="cm-copy">${escapeHtml(text('中氪', 'Mid Spend'))}：${escapeHtml(gatePlan.midPath)}</div>
            </div>
        `;
    }

    function renderShopGateGuide(gatePlan) {
        if (!gatePlan || !gatePlan.offerId) return '';
        const offer = offerMap[gatePlan.offerId];
        if (!offer) return '';
        const recommendationLabel = gatePlan.owned
            ? text('对应礼包已持有', 'Recommended pack already owned')
            : gatePlan.recommendedNow
                ? text('当前卡点推荐', 'Recommended now')
                : text('下一卡点预告', 'Next gate prep');
        const recommendationCopy = gatePlan.owned
            ? text('当前卡点对应的永久增强已经具备，商店里优先拿每日免费和功能补给即可。', 'You already have the permanent perk for this gate, so the daily free supply and utility packs should be the priority here.')
            : gatePlan.recommendedNow
                ? text('这档付费正对应你当前的卡点与增强缺口，买到后会直接作用在闯关体验上。', 'This offer matches your current gate and missing power, so the boost applies directly to your run experience.')
                : text('这档付费主要服务你下一段成长卡点，不急着现在购买。', 'This offer mainly serves your next growth gate, so there is no need to rush the purchase.')
        return `
            <div class="cm-card">
                <div class="cm-card-head">
                    <div>
                        <div class="eyebrow">${escapeHtml(text('当前卡点指引', 'Current Gate Guide'))}</div>
                        <strong>${escapeHtml(gatePlan.title)}</strong>
                        <div class="cm-copy">${escapeHtml(gatePlan.summary)}</div>
                    </div>
                    <span class="cm-tag ${gatePlan.owned ? 'is-good' : gatePlan.recommendedNow ? 'is-warning' : ''}">${escapeHtml(recommendationLabel)}</span>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('适配区间', 'Best For'))} · ${escapeHtml(gatePlan.packFit)}</span>
                    <span class="cm-chip">${escapeHtml(text('推荐礼包', 'Pack'))} · ${escapeHtml(localize(offer.name))}</span>
                </div>
                <div class="cm-copy">${escapeHtml(gatePlan.statusCopy)}</div>
                <div class="cm-copy">${escapeHtml(recommendationCopy)}</div>
                <div class="cm-copy">${escapeHtml(text('白嫖', 'Free'))}：${escapeHtml(gatePlan.freePath)}</div>
                <div class="cm-copy">${escapeHtml(text('快进', 'Fast Path'))}：${escapeHtml(gatePlan.lightPath)}</div>
                <div class="cm-copy">${escapeHtml(text('强化解法', 'Power Solve'))}：${escapeHtml(gatePlan.midPath)}</div>
            </div>
        `;
    }

    function getStageGatePlan(chapter = getSelectedChapter(), power = getDeckPower(), assist = getRunAssistState(chapter)) {
        const gap = Math.max(0, chapter.recommended - power);
        let plan;
        if (chapter.id === '1-1' || chapter.id === '1-2') {
            plan = {
                title: text('新手热身段', 'Rookie Ramp'),
                tag: text('下一墙：1-3', 'Next wall: 1-3'),
                summary: text('这段先学交换、三连和拆盾，真正的早期卡点会在 1-3 出现。', 'Use this stretch to learn swaps, 3-matches, and shield breaking before the first real gate at 1-3.'),
                freePath: text('补到 2 轮核心构筑，或 1 轮核心构筑加稳定网格 2~3 级。', 'Reach 2 core build rounds, or 1 core round plus Stability Mesh level 2 to 3.'),
                lightPath: text('想更顺地进到 2-1，可提前用新手破译包补开局节奏。', 'If you want a smoother route into 2-1, the Starter Decode Pack is the early tempo shortcut.'),
                midPath: text('中氪先别在这里出手，把预算留给 2-2 / 2-3 更值。', 'Mid spend is better saved for 2-2 / 2-3 instead of being used here.'),
                offerId: 'starterPack',
                packFit: '1-3 / 2-1'
            };
        } else if (chapter.id === '1-3' || chapter.id === '2-1') {
            plan = {
                title: text('早期软卡点', 'Early Soft Gate'),
                tag: text('节奏与拆盾', 'Tempo and shield break'),
                summary: text('这里开始要求主力构筑成型，同时学会先拆盾再收尾。', 'This is where the main build needs to come together and boss shield timing starts to matter.'),
                freePath: text('建议补到 2 轮核心构筑，或 1 轮核心构筑加稳定网格 2~3 级。', 'Aim for 2 core build rounds, or 1 core round plus Stability Mesh level 2 to 3.'),
                lightPath: text('新手破译包对应当前缺口：补早期资源、每日免费局和更稳的开局。', 'The Starter Decode Pack covers this gap with early resources, an extra daily free run, and steadier starts.'),
                midPath: text('中氪不用提前跨档，真正的中档价值点在 2-2 / 2-3。', 'There is no need to jump into mid spend yet; the real mid-tier value begins at 2-2 / 2-3.'),
                offerId: 'starterPack',
                packFit: '1-3 / 2-1'
            };
        } else if (chapter.id === '2-2' || chapter.id === '2-3' || chapter.id === '3-1') {
            plan = {
                title: text('中期研究卡点', 'Mid Research Gate'),
                tag: text('卡牌转研究', 'Cards into research'),
                summary: text('只升卡会开始吃力，这段需要把研究、每日补给和免费赛季也拉进成长链。', 'Card upgrades alone start to stall here, so research, daily supplies, and the free season track must join the growth loop.'),
                freePath: text('目标是 4~5 轮核心构筑，并把稳定网格补到 4~5 级、脉冲电池补到 2 级。', 'Target 4 to 5 core build rounds, Stability Mesh 4 to 5, and Pulse Battery 2.'),
                lightPath: text('已有新手破译包时，重点是把节省下来的时间转成研究与任务进度。', 'If you already own the Starter Decode Pack, convert that saved time into research and mission progress.'),
                midPath: text('赛季通行证正对这段缺口：研究打折、高级轨道补给、额外能量和中期资源。', 'The Season Pass is built for this stretch with research discounts, premium track supplies, extra energy, and midgame resources.'),
                offerId: 'seasonPass',
                packFit: '2-2 / 2-3 / 3-1'
            };
        } else if (chapter.id === '3-2') {
            plan = {
                title: text('首领墙预热段', 'Boss Wall Prep'),
                tag: text('下一墙：3-3', 'Next wall: 3-3'),
                summary: text('这关本身是过渡，但它要求你提前把后段 Boss 构筑切好。', 'This stage is a transition, but it asks you to prepare the late boss build before the real wall at 3-3.'),
                freePath: text('建议补到 7 轮核心构筑，并把稳定网格补到 5~6 级、脉冲电池补到 3~4 级。', 'Aim for 7 core build rounds, Stability Mesh 5 to 6, and Pulse Battery 3 to 4.'),
                lightPath: text('小氪更适合保持新手包和赛季通行证的成长红利，同时开始切 Boss 构筑。', 'Light spend works best by keeping the Starter Pack plus Season Pass value online while switching into a boss build.'),
                midPath: text('如果想让下一道 Boss 墙从硬拖变成可控，破关金库会在这里开始对位。', 'If you want the next boss wall to feel controllable instead of dragged out, Breaker Vault starts to line up here.'),
                offerId: 'breakerVault',
                packFit: '3-2 / 3-3 / 4-x'
            };
        } else if (chapter.id === '3-3' || chapter.id === '4-1') {
            plan = {
                title: text('后段首领墙', 'Late Boss Wall'),
                tag: text('Boss 反制压力', 'Boss counter pressure'),
                summary: text('这里开始同时考验数值、首领对策和资源滚动速度。', 'This is where raw numbers, boss counterplay, and long-run resource pacing are all tested together.'),
                freePath: text('目标是 7~8 轮核心构筑、稳定网格 5~6 级、脉冲电池 3~4 级，并完成 Boss 构筑切换。', 'Target 7 to 8 core build rounds, Stability Mesh 5 to 6, Pulse Battery 3 to 4, and a proper boss build swap.'),
                lightPath: text('小氪路线仍以新手包加赛季通行为主，但必须配合 Boss 构筑而不是无脑平推。', 'Light spend still leans on Starter Pack plus Season Pass, but the boss build still matters more than brute forcing.'),
                midPath: text('破关金库是这一墙的专门解：减轻反制，同时让后段收益更像一次正反馈。', 'Breaker Vault is the dedicated answer here: it softens counters and makes late rewards feel like a meaningful payoff.'),
                offerId: 'breakerVault',
                packFit: '3-2 / 3-3 / 4-x'
            };
        } else {
            plan = {
                title: text('终盘成长墙', 'Endgame Growth Wall'),
                tag: text('长线资源经营', 'Long-term resource loop'),
                summary: text('终盘不是单次补强，而是构筑、研究、Boss 增益和每日经营一起闭环。', 'The endgame is not about one upgrade spike; it is about closing the loop between build, research, boss perks, and daily income.'),
                freePath: text('白嫖也能过，但要把 9~10 轮核心构筑、中高等级研究、免费赛季和每日都尽量吃满。', 'Free players can still clear it, but it asks for 9 to 10 core build rounds, high lab levels, and strong daily plus season collection.'),
                lightPath: text('小氪更像买时间，把 4-2 / 4-3 当成 1~2 周的终盘目标更合理。', 'Light spend mainly buys time here, so treating 4-2 / 4-3 as a 1 to 2 week endgame target is healthier.'),
                midPath: text('中氪路线需要三档都到位，其中破关金库负责把后段 Boss 战从高波动拉回可控。', 'Mid spend wants the full stack, and Breaker Vault is what pulls late boss fights back from high variance into controllable runs.'),
                offerId: 'breakerVault',
                packFit: '3-2 / 3-3 / 4-x'
            };
        }
        return {
            ...plan,
            gap,
            owned: isOfferOwned(plan.offerId),
            recommendedNow: isOfferRecommendedNow(plan.offerId, chapter),
            statusCopy: gap > 0
                ? text(`当前仍差 ${formatCompact(gap)} 战力，先补这一段最缺的成长块，再硬推会更顺。`, `You are still short by ${formatCompact(gap)} power. Fill the missing piece this gate asks for before forcing the push.`)
                : text('当前已接近或达到推荐线，这段更考验路线、构筑切换和资源分配。', 'You are near or above the recommended line, so route choice, build swaps, and resource routing matter more now.')
        };
    }

    function getOfferTargetSummary(offerId) {
        switch (offerId) {
            case 'starterPack': return '1-3 / 2-1';
            case 'seasonPass': return '2-2 / 2-3 / 3-1';
            case 'breakerVault': return '3-2 / 3-3 / 4-x';
            default: return text('成长补强', 'Growth support');
        }
    }

    function isOfferRecommendedNow(offerId, chapter = getSelectedChapter()) {
        switch (offerId) {
            case 'starterPack':
                return chapter.id === '1-3' || chapter.id === '2-1';
            case 'seasonPass':
                return chapter.id === '2-2' || chapter.id === '2-3' || chapter.id === '3-1';
            case 'breakerVault':
                return chapter.id === '3-2' || chapter.id === '3-3' || chapter.chapter >= 4;
            default:
                return false;
        }
    }

    function renderPendingOrderStatus(order) {
        const offer = offerMap[order.offerId];
        if (!offer) return '';
        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(offer.name))}</strong>
                        <div class="cm-copy">${escapeHtml(text('订单号', 'Order ID'))} · ${escapeHtml(order.id || createOrderId(order.offerId, order.createdAt))}</div>
                    </div>
                    <span class="cm-tag is-warning">${escapeHtml(text('待验证', 'Pending'))}</span>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">USDT ${offer.price}</span>
                    <span class="cm-chip">${escapeHtml(text('剩余', 'Time Left'))} · ${escapeHtml(getPendingOrderEta(order))}</span>
                    <span class="cm-chip">${escapeHtml(text('创建于', 'Created'))} · ${escapeHtml(formatTimeLabel(order.createdAt))}</span>
                </div>
            </div>
        `;
    }

    function renderPaymentHistoryItem(entry) {
        const offer = offerMap[entry.offerId];
        if (!offer) return '';
        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(offer.name))}</strong>
                        <div class="cm-copy">${escapeHtml(text('交易哈希', 'Transaction Hash'))} · ${escapeHtml(shortenTxid(entry.txid))}</div>
                    </div>
                    <span class="cm-tag is-good">${escapeHtml(text('已到账', 'Delivered'))}</span>
                </div>
                <div class="cm-chip-row">
                    <span class="cm-chip">USDT ${entry.amount}</span>
                    <span class="cm-chip">${escapeHtml(text('订单号', 'Order ID'))} · ${escapeHtml(entry.orderId || '--')}</span>
                    <span class="cm-chip">${escapeHtml(text('验证时间', 'Verified'))} · ${escapeHtml(formatTimeLabel(entry.verifiedAt))}</span>
                </div>
            </div>
        `;
    }

    function renderModal() {
        if (!ui.modalRoot || !ui.modalBody || !ui.modalActions) return;
        if (!state.modal) {
            ui.modalRoot.classList.add('is-hidden');
            ui.modalRoot.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            return;
        }

        ui.modalRoot.classList.remove('is-hidden');
        ui.modalRoot.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        ui.modalEyebrow.textContent = state.modal.eyebrow || text('信息', 'Info');
        ui.modalTitle.textContent = state.modal.title || localize(config.meta.title);
        ui.modalSubtitle.textContent = state.modal.subtitle || '';
        ui.modalBody.innerHTML = state.modal.body || '';
        ui.modalActions.innerHTML = state.modal.actions || '';
    }

    function selectChapter(chapterId) {
        if (!chapterMap[chapterId]) return;
        if (!isChapterUnlocked(chapterId)) {
            showToast(text('该关卡尚未解锁。', 'This stage is locked.'), 'warn');
            return;
        }
        if (state.run?.active) {
            showToast(text('请先完成或退出当前对局。', 'Finish or retreat from the current run first.'), 'warn');
            return;
        }
        state.save.selectedChapter = chapterId;
        saveProgress();
        renderAll();
    }

    function startRun() {
        if (state.run?.active) {
            showToast(text('当前已有进行中的对局。', 'A run is already active.'), 'warn');
            return;
        }

        const chapter = getSelectedChapter();
        const assist = getRunAssistState(chapter);
        const tutorialEntryFree = isTutorialEntryFree(chapter, assist);
        const freeLeft = getRemainingFreeRuns();
        if (!tutorialEntryFree && freeLeft <= 0) {
            const cost = getEntryCost(chapter);
            if (state.save.credits < cost) {
                showToast(text('金币不足，先去商店补给。', 'Not enough credits. Visit the shop first.'), 'warn');
                return;
            }
            state.save.credits -= cost;
        } else if (!tutorialEntryFree) {
            state.save.freeRunsUsed += 1;
        }

        state.run = {
            active: true,
            chapterId: chapter.id,
            leaderId: state.save.selectedLeader,
            skillId: state.save.selectedSkill,
            moduleIds: [...state.save.selectedModules],
            deckPower: getDeckPower(),
            tutorialEntryFree,
            board: createFreshBoard(),
            selectedCell: null,
            movesLeft: getRunStartMoves(chapter) + assist.bonusMoves,
            energy: assist.bonusEnergy,
            maxEnergy: getRunMaxEnergy(),
            score: 0,
            goals: chapter.goals.map((goal) => ({ ...goal, remaining: goal.amount })),
            notice: getRunStartNotice(chapter, assist),
            continuesBought: 0,
            settled: false,
            failed: false,
            feedback: buildRunStartFeedback(chapter, assist),
            bestCascade: 0,
            assist,
            bossPulseEvery: isBossChapter(chapter) ? assist.bossPulseEvery : 0,
            bossTurnsLeft: isBossChapter(chapter) ? assist.bossPulseEvery : 0,
            bossCountersTriggered: 0
        };

        saveProgress();
        renderAll();
        showToast(tutorialEntryFree ? text('教学关免费进入。', 'Tutorial entry is free.') : text('解码开始。', 'Run started.'), 'good');
    }

    function tapCell(value) {
        const run = state.run;
        if (!run?.active || run.failed) return;
        const index = Number(value);
        if (!Number.isFinite(index)) return;

        if (run.selectedCell === null) {
            run.selectedCell = index;
            run.feedback = null;
            run.notice = text('已选中第一格，再点相邻方块交换。', 'First tile selected. Tap an adjacent tile to swap.');
            saveProgress();
            renderAll();
            return;
        }

        if (run.selectedCell === index) {
            run.selectedCell = null;
            run.feedback = makeFeedback('warn', text('已取消', 'Selection Cleared'), text('重新选择一组相邻方块。', 'Pick another adjacent pair.'));
            run.notice = text('已取消选择。', 'Selection cleared.');
            saveProgress();
            renderAll();
            return;
        }

        if (!isAdjacent(run.selectedCell, index, config.board.size)) {
            run.selectedCell = index;
            run.feedback = makeFeedback('warn', text('相邻交换', 'Adjacent Only'), text('只能交换上下左右相邻的两格。', 'Only adjacent tiles can be swapped.'));
            run.notice = text('请选择相邻方块。', 'Choose an adjacent tile to swap.');
            saveProgress();
            renderAll();
            return;
        }

        const board = run.board.slice();
        swapItems(board, run.selectedCell, index);
        const check = findMatches(board);

        if (!check.indices.length) {
            swapItems(board, run.selectedCell, index);
            run.selectedCell = index;
            run.feedback = makeFeedback('warn', text('未形成 3 连', 'No Match'), text('这次交换无效，换一组相邻方块。', 'That swap did not form a 3-match.'));
            run.notice = text('未形成 3 连，换一组相邻方块。', 'No 3-match. Try another adjacent pair.');
            saveProgress();
            renderAll();
            return;
        }

        run.board = board;
        run.movesLeft = Math.max(0, run.movesLeft - 1);
        run.selectedCell = null;
        const result = resolveBoard(run.board);
        const summary = applyBoardResult(result);
        run.bestCascade = Math.max(run.bestCascade || 0, result.cascades || 0);
        run.feedback = buildMatchFeedback(result, summary, run);

        if (areGoalsComplete(run.goals)) {
            finishRun(true);
            return;
        }

        const bossCounter = advanceBossCountermeasure();
        if (bossCounter) {
            run.feedback = bossCounter.feedback;
            run.notice = bossCounter.notice;
        } else {
            run.notice = result.cascades > 1
                ? text('已触发连锁，继续冲技能。', 'Cascade triggered. Keep charging your skill.')
                : text('有效交换成功，继续压低目标。', 'Successful swap. Keep pushing your goals.');
        }

        if (run.movesLeft <= 0) {
            openRunFailModal();
            return;
        }

        saveProgress();
        renderAll();
    }

    function applyBoardResult(result) {
        const run = state.run;
        if (!run) return;
        const chapter = chapterMap[run.chapterId];
        const leaderId = getRunLeaderId(run);
        const summary = {
            shieldDamage: 0,
            progressDamage: 0,
            powerDamage: 0,
            moveRefund: 0,
            bonusCharge: 0
        };

        const energyFromModules = runHasModule('prismTap', run) ? 10 : 0;
        const scoreBonus = runHasModule('burstIndex', run) && result.biggestGroup >= 4 ? 120 : 0;
        run.score += result.totalCleared * 18 + result.cascades * 36 + scoreBonus;
        run.energy = Math.min(run.maxEnergy, run.energy + result.totalCleared * 7 + (result.cascades - 1) * 18 + energyFromModules);

        run.goals.forEach((goal) => {
            if (goal.type === 'shield') {
                const before = goal.remaining;
                goal.remaining = Math.max(0, goal.remaining - Math.max(1, Math.floor(result.totalCleared / 4)));
                if (runHasModule('traceMine', run)) {
                    goal.remaining = Math.max(0, goal.remaining - 1);
                }
                summary.shieldDamage += Math.max(0, before - goal.remaining);
                return;
            }
            const before = goal.remaining;
            goal.remaining = Math.max(0, goal.remaining - (result.byType[goal.type] || 0));
            summary.progressDamage += Math.max(0, before - goal.remaining);
        });

        if ((run.assist?.progressBonus || 0) > 0 && (result.biggestGroup >= 4 || result.cascades >= 2)) {
            const pressure = applyLargestGoalPressure(run.assist.progressBonus);
            summary.powerDamage = pressure.amount;
            if (pressure.type === 'shield') {
                summary.shieldDamage += pressure.amount;
            } else {
                summary.progressDamage += pressure.amount;
            }
        }

        if (leaderId === 'glintFox' && result.cascades >= 2) {
            summary.bonusCharge = 12 + ((run.assist?.supportTier || 0) * 4);
            run.energy = Math.min(run.maxEnergy, run.energy + summary.bonusCharge);
        }

        if (leaderId === 'wardenNine' && result.biggestGroup >= 4) {
            summary.moveRefund = 1;
            run.movesLeft += 1;
        }

        if (leaderId === 'novaEcho' && isBossChapter(chapter) && summary.shieldDamage > 0) {
            const extraBreak = reduceGoalType('shield', 2 + (run.assist?.supportTier || 0));
            summary.shieldDamage += extraBreak;
        }

        state.save.stats.matchedTiles += result.totalCleared;
        return summary;
    }

    function useSkill() {
        const run = state.run;
        if (!run?.active || run.failed) return;
        const skill = skillMap[getRunSkillId(run)];
        if (run.energy < skill.energyCost) {
            showToast(text('能量未充满。', 'Not enough energy.'), 'warn');
            return;
        }

        const boostRate = 1 + getResearchLevel('signalAmp') * 0.04;
        const skillValue = Math.round(6 * boostRate);
        const leaderId = getRunLeaderId(run);

        if (skill.id === 'gridBurst') {
            reduceLargestGoal(skillValue);
        } else if (skill.id === 'colorHack') {
            reduceLargestColorGoal(Math.round(8 * boostRate));
        } else if (skill.id === 'stasisField') {
            run.movesLeft += 3;
            reduceSmallestGoal(Math.round(3 * boostRate));
        }

        if (leaderId === 'novaEcho') {
            const shieldGoal = run.goals.find((goal) => goal.type === 'shield' && goal.remaining > 0);
            if (shieldGoal) shieldGoal.remaining = Math.max(0, shieldGoal.remaining - 4);
        }

        if (leaderId === 'wardenNine') {
            run.movesLeft += 1;
        }

        run.energy = leaderId === 'wardenNine' ? 35 : 0;
        run.feedback = makeFeedback('good', text('技能释放', 'Skill Cast'), `${localize(skill.name)} · ${localize(skill.effect)}`);
        run.notice = text('技能已释放。', 'Skill cast.');

        if (areGoalsComplete(run.goals)) {
            finishRun(true);
            return;
        }

        saveProgress();
        renderAll();
        showToast(text('技能释放成功。', 'Skill activated.'), 'good');
    }

    function openRunFailModal() {
        const run = state.run;
        if (!run) return;
        const continueCost = getContinueCost();
        run.failed = true;
        run.feedback = makeFeedback('danger', text('步数耗尽', 'Out of Moves'), text('可补 5 步继续，或直接退出调整构筑。', 'Buy 5 more moves or retreat to adjust your deck.'));
        run.notice = text('步数耗尽，可继续购买步数或结束本局。', 'Out of moves. Buy more or retreat.');
        openModal({
            eyebrow: text('本局失败', 'Run Failed'),
            title: text('步数耗尽', 'Out of Moves'),
            subtitle: text('可以直接补 5 步继续，也可以退出回去调整构筑。', 'You can buy +5 moves or retreat to adjust your deck.'),
            body: `
                <div class="cm-card">
                    <div class="cm-copy">${escapeHtml(continueCost === 0 ? text('新手保护生效：本次首补免费，单局最多补 2 次。', 'Rookie assist is active: your first continue is free, max 2 continues per run.') : text('继续价格会递增，单局最多购买 2 次。', 'Continue price increases each time, max 2 purchases per run.'))}</div>
                    <div class="cm-reward-row">
                        <span class="cm-chip">${escapeHtml(text('当前价格', 'Current Cost'))} ${continueCost === 0 ? escapeHtml(text('免费', 'Free')) : formatCompact(continueCost)}</span>
                        <span class="cm-chip">${escapeHtml(text('剩余目标', 'Remaining Goals'))} ${state.run.goals.reduce((sum, goal) => sum + goal.remaining, 0)}</span>
                    </div>
                </div>
            `,
            actions: `
                <button class="cm-btn-soft" type="button" data-action="closeModal">${escapeHtml(text('先看看棋盘', 'Back to Board'))}</button>
                <button class="cm-btn-soft" type="button" data-action="abandonRun">${escapeHtml(text('结束本局', 'Retreat'))}</button>
                <button class="cm-btn" type="button" data-action="buyMoves" ${run.continuesBought >= 2 ? 'disabled' : ''}>${escapeHtml(text('+5 步继续', '+5 Moves'))}</button>
            `
        });
        saveProgress();
        renderAll();
    }

    function buyMoves() {
        const run = state.run;
        if (!run?.active || run.continuesBought >= 2) return;
        const cost = getContinueCost();
        if (state.save.credits < cost) {
            showToast(text('金币不足，无法继续。', 'Not enough credits to continue.'), 'warn');
            return;
        }
        state.save.credits -= cost;
        run.movesLeft += 5;
        run.failed = false;
        run.continuesBought += 1;
        run.feedback = makeFeedback('good', text('继续成功', 'Continue Success'), text('已补充 5 步，继续推进关卡。', '5 moves restored. Keep pushing the stage.'));
        run.notice = text('已补充步数，继续解码。', 'Moves restored. Continue decoding.');
        closeModal();
        saveProgress();
        renderAll();
        showToast(text('继续成功。', 'Continue purchased.'), 'good');
    }

    function abandonRun() {
        if (!state.run?.active) return;
        if (!state.run.settled) {
            state.save.stats.runs += 1;
            state.run.settled = true;
        }
        state.run = null;
        closeModal();
        saveProgress();
        renderAll();
        showToast(text('已结束本局。', 'Run ended.'), 'warn');
    }

    function finishRun(win) {
        if (!state.run) return;
        const runSnapshot = {
            chapterId: state.run.chapterId,
            score: state.run.score,
            movesLeft: state.run.movesLeft,
            bestCascade: state.run.bestCascade || 0,
            goals: state.run.goals.map((goal) => ({ ...goal })),
            bossCountersTriggered: state.run.bossCountersTriggered || 0
        };
        const chapter = chapterMap[state.run.chapterId];
        if (!state.run.settled) {
            state.save.stats.runs += 1;
            if (win) state.save.stats.wins += 1;
            state.run.settled = true;
        }

        if (win) {
            const reward = getScaledChapterReward(chapter);
            const firstClearReward = state.save.clearedChapters.includes(chapter.id) ? null : getFirstClearReward(chapter);
            applyReward(reward);
            if (firstClearReward) {
                applyReward(firstClearReward);
            }
            if (!state.save.clearedChapters.includes(chapter.id)) {
                state.save.clearedChapters.push(chapter.id);
            }

            const nextChapter = getNextChapterId(chapter.id);
            if (nextChapter && isChapterUnlocked(nextChapter)) {
                state.save.selectedChapter = nextChapter;
            }

            state.run = null;
            openModal({
                eyebrow: text('通关结算', 'Stage Clear'),
                title: `${chapter.id} · ${localize(chapter.name)}`,
                subtitle: text('奖励已到账，可继续推进或先去构筑补强。', 'Rewards delivered. Push on or strengthen your deck first.'),
                body: `
                    <div class="cm-card">
                        <div class="cm-wallet-row">
                            ${renderWalletPill(text('得分', 'Score'), formatCompact(runSnapshot.score), text('本局累计得分', 'Total score this run'))}
                            ${renderWalletPill(text('剩余步数', 'Moves Left'), runSnapshot.movesLeft, text('剩余越多越稳', 'More left means safer clears'))}
                            ${renderWalletPill(text('最佳连锁', 'Best Cascade'), `x${Math.max(1, runSnapshot.bestCascade)}`, text('连锁越高越容易爆发', 'Higher cascades drive burst'))}
                            ${renderWalletPill(text('下一关', 'Next Stage'), nextChapter || text('已到当前末关', 'End of current set'), text('可继续推进章节', 'Ready for the next push'))}
                        </div>
                    </div>
                    <div class="cm-card">
                        <div class="cm-card-head">
                            <div>
                                <strong>${escapeHtml(text('奖励到账', 'Rewards'))}</strong>
                                <div class="cm-copy">${escapeHtml(text('这部分奖励已直接发放到你的资源池。', 'These rewards have already been delivered to your wallet.'))}</div>
                            </div>
                        </div>
                        <div class="cm-reward-row">${renderRewardChips(reward)}</div>
                        ${firstClearReward ? `
                            <div class="cm-copy">${escapeHtml(text('首通额外奖励也已到账。', 'First-clear bonus has also been delivered.'))}</div>
                            <div class="cm-reward-row">${renderRewardChips(firstClearReward)}</div>
                        ` : ''}
                    </div>
                `,
                actions: `
                    <button class="cm-btn-soft" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('去构筑', 'Open Deck'))}</button>
                    <button class="cm-btn" type="button" data-action="closeModal">${escapeHtml(text('继续推进', 'Continue'))}</button>
                `
            });
            showToast(text('通关成功。', 'Stage clear.'), 'good');
        }

        saveProgress();
        renderAll();
    }

    function setLeader(leaderId) {
        if (!leaderMap[leaderId]) return;
        state.save.selectedLeader = leaderId;
        saveProgress();
        renderAll();
        showToast(text('队长已切换。', 'Leader updated.'), 'good');
    }

    function toggleModule(moduleId) {
        if (!moduleMap[moduleId]) return;
        const exists = state.save.selectedModules.includes(moduleId);
        if (exists) {
            state.save.selectedModules = state.save.selectedModules.filter((item) => item !== moduleId);
            saveProgress();
            renderAll();
            return;
        }
        if (state.save.selectedModules.length >= 2) {
            showToast(text('最多装配 2 个模块。', 'You can equip up to 2 modules.'), 'warn');
            return;
        }
        state.save.selectedModules = [...state.save.selectedModules, moduleId];
        saveProgress();
        renderAll();
        showToast(text('模块已装配。', 'Module equipped.'), 'good');
    }

    function setSkill(skillId) {
        if (!skillMap[skillId]) return;
        state.save.selectedSkill = skillId;
        saveProgress();
        renderAll();
        showToast(text('主动技已切换。', 'Skill updated.'), 'good');
    }

    function upgradeCard(type, cardId) {
        const itemMap = type === 'leader' ? leaderMap : type === 'module' ? moduleMap : skillMap;
        if (!itemMap[cardId]) return;
        if (getCardLevel(cardId) >= getCardMaxLevel(type)) {
            showToast(text('该卡已满级。', 'This card is already maxed.'), 'warn');
            return;
        }
        const cost = getCardCost(type, cardId);
        if (state.save.credits < cost.credits || state.save.keyBits < cost.keyBits) {
            showToast(text('资源不足。', 'Not enough resources.'), 'warn');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.keyBits -= cost.keyBits;
        state.save.cardLevels[cardId] = getCardLevel(cardId) + 1;
        state.save.stats.upgrades += 1;
        saveProgress();
        renderAll();
        showToast(text('升级成功。', 'Upgrade complete.'), 'good');
    }

    function upgradeResearch(researchId) {
        const item = researchMap[researchId];
        if (!item) return;
        const level = getResearchLevel(researchId);
        if (level >= item.maxLevel) return;
        const cost = getResearchCost(researchId);
        if (state.save.credits < cost.credits || state.save.cipherDust < cost.cipherDust) {
            showToast(text('研究材料不足。', 'Not enough research materials.'), 'warn');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.cipherDust -= cost.cipherDust;
        state.save.researchLevels[researchId] = level + 1;
        state.save.stats.researchUpgrades += 1;
        saveProgress();
        renderAll();
        showToast(text('研究升级成功。', 'Research upgraded.'), 'good');
    }

    function claimMission(missionId) {
        const mission = getMissionStates().find((item) => item.id === missionId);
        if (!mission || mission.claimed || !mission.canClaim) return;
        state.save.claimedMissions.push(mission.id);
        applyReward(mission.reward);
        saveProgress();
        renderAll();
        showToast(text('任务奖励已领取。', 'Mission reward claimed.'), 'good');
    }

    function claimSeason(trackType, tierId) {
        const list = trackType === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack;
        const item = list.find((entry) => entry.id === tierId);
        if (!item) return;
        if (trackType === 'premium' && !state.save.premiumSeason) {
            previewOffer('seasonPass');
            return;
        }
        if (state.save.seasonClaims[trackType].includes(tierId) || state.save.seasonXp < item.xp) return;
        state.save.seasonClaims[trackType].push(tierId);
        applyReward(item.reward);
        saveProgress();
        renderAll();
        showToast(text('赛季奖励已领取。', 'Season reward claimed.'), 'good');
    }

    function claimDailySupply() {
        const item = shopMap.dailyFree;
        if (!item || isDailyShopClaimed()) return;
        state.save.dailyShopStamp = getTodayStamp();
        applyReward(item.reward);
        saveProgress();
        renderAll();
        showToast(text('每日补给已领取。', 'Daily supply claimed.'), 'good');
    }

    function buyShopItem(itemId) {
        const item = shopMap[itemId];
        if (!item || item.price <= 0) return;
        if (state.save.credits < item.price) {
            showToast(text('金币不足。', 'Not enough credits.'), 'warn');
            return;
        }
        state.save.credits -= item.price;
        applyReward(item.reward);
        saveProgress();
        renderAll();
        showToast(text('购买成功。', 'Purchase complete.'), 'good');
    }

    function previewOffer(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        const order = getPendingOrder(offerId);
        const owned = isOfferOwned(offerId);
        const lastVerified = getLastVerifiedPayment(offerId);
        const lockedByOwnership = !!(owned && offer.oneTime);
        const orderEta = order ? getPendingOrderEta(order) : '';
        const primaryAction = lockedByOwnership ? 'closeModal' : order ? 'verifyOfferTxid' : 'createOfferOrder';
        const primaryLabel = lockedByOwnership
            ? text('已拥有', 'Owned')
            : order
                ? text('验证支付', 'Verify Payment')
                : text('创建订单', 'Create Order');
        openModal({
            eyebrow: text('支付弹窗', 'Payment'),
            title: localize(offer.name),
            subtitle: lockedByOwnership ? text('永久特权已激活', 'Permanent perk already active') : `${PAYMENT_NETWORK} · USDT ${offer.price}`,
            body: `
                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <strong>${escapeHtml(text('礼包内容', 'Pack Contents'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('支付验证通过后立即发放。', 'Rewards are delivered right after verification.'))}</div>
                        </div>
                    </div>
                    <div class="cm-reward-row">${renderRewardChips(offer.reward)}</div>
                </div>

                ${offer.permanent ? `
                    <div class="cm-card">
                        <div class="cm-card-head">
                            <div>
                                <strong>${escapeHtml(text('永久特权', 'Permanent Perk'))}</strong>
                                <div class="cm-copy">${escapeHtml(localize(offer.permanent))}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${order && !lockedByOwnership ? `
                    <div class="cm-card">
                        <div class="cm-card-head">
                            <div>
                                <strong>${escapeHtml(text('当前订单', 'Current Order'))}</strong>
                                <div class="cm-copy">${escapeHtml(text('订单会保留 15 分钟，到期后可重新创建。', 'Orders remain for 15 minutes and can be recreated after expiry.'))}</div>
                            </div>
                        </div>
                        <div class="cm-chip-row">
                            <span class="cm-chip">${escapeHtml(text('订单号', 'Order ID'))} · ${escapeHtml(order.id || createOrderId(order.offerId, order.createdAt))}</span>
                            <span class="cm-chip">${escapeHtml(text('状态', 'Status'))} · ${escapeHtml(text('待验证', 'Pending'))}</span>
                            <span class="cm-chip">${escapeHtml(text('剩余', 'Time Left'))} · ${escapeHtml(orderEta)}</span>
                        </div>
                    </div>
                ` : ''}

                ${lastVerified ? `
                    <div class="cm-card">
                        <div class="cm-card-head">
                            <div>
                                <strong>${escapeHtml(text('最近到账记录', 'Latest Delivery'))}</strong>
                                <div class="cm-copy">${escapeHtml(text('用于确认这份礼包最近一次已完成的到账闭环。', 'Confirms the most recent completed delivery for this pack.'))}</div>
                            </div>
                        </div>
                        <div class="cm-chip-row">
                            <span class="cm-chip">${escapeHtml(text('订单号', 'Order ID'))} · ${escapeHtml(lastVerified.orderId || '--')}</span>
                            <span class="cm-chip">${escapeHtml(text('验证时间', 'Verified'))} · ${escapeHtml(formatTimeLabel(lastVerified.verifiedAt))}</span>
                            <span class="cm-chip">${escapeHtml(shortenTxid(lastVerified.txid))}</span>
                        </div>
                    </div>
                ` : ''}

                ${lockedByOwnership ? '' : `
                    <div class="cm-input-wrap">
                        <strong>${escapeHtml(text('收款地址', 'Wallet Address'))}</strong>
                        <input value="${escapeHtml(PAYMENT_WALLET)}" readonly>
                        <small>${escapeHtml(text('请按上方地址转入对应的 USDT 金额。', 'Send the exact USDT amount to the address above.'))}</small>
                    </div>

                    <div class="cm-input-wrap">
                        <strong>${escapeHtml(text('转账金额', 'Amount'))}</strong>
                        <input value="USDT ${offer.price}" readonly>
                        <small>${escapeHtml(text('复制金额可避免支付时输错。', 'Copying the amount helps avoid mistakes.'))}</small>
                    </div>

                    <div class="cm-input-wrap">
                        <strong>${escapeHtml(text('交易哈希', 'Transaction Hash'))}</strong>
                        <input id="offerTxidInput" placeholder="${escapeHtml(text('请输入 64 位交易哈希', 'Enter the 64-character TxID'))}" value="${order ? escapeHtml(order.txid || '') : ''}">
                        <small>${escapeHtml(text('当前为本地校验版：填入合法且未使用过的交易哈希即可完成到账验证。', 'Local validation build: any valid unused transaction hash completes delivery verification.'))}</small>
                    </div>
                `}
            `,
            actions: `
                ${lockedByOwnership ? '' : `<button class="cm-btn-soft" type="button" data-action="copyOfferAddress">${escapeHtml(text('复制地址', 'Copy Address'))}</button>`}
                ${lockedByOwnership ? '' : `<button class="cm-btn-soft" type="button" data-action="copyOfferAmount" data-value="USDT ${offer.price}">${escapeHtml(text('复制金额', 'Copy Amount'))}</button>`}
                ${lockedByOwnership || !order ? '' : `<button class="cm-btn-soft" type="button" data-action="cancelOfferOrder" data-value="${offer.id}">${escapeHtml(text('关闭订单', 'Cancel Order'))}</button>`}
                <button class="cm-btn" type="button" data-action="${primaryAction}" data-value="${offer.id}">${escapeHtml(primaryLabel)}</button>
            `
        });
        renderAll();
    }

    function createOfferOrder(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        if (offer.oneTime && isOfferOwned(offerId)) {
            showToast(text('该礼包已拥有，无需重复购买。', 'This pack is already owned.'), 'warn');
            return;
        }
        state.save.pendingOrders = state.save.pendingOrders.filter((item) => (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS);
        const existing = getPendingOrder(offerId);
        if (!existing) {
            const createdAt = Date.now();
            state.save.pendingOrders.push({
                id: createOrderId(offerId, createdAt),
                offerId,
                createdAt,
                txid: ''
            });
            saveProgress();
        }
        previewOffer(offerId);
        showToast(text('订单已创建。', 'Order created.'), 'good');
    }

    function verifyOfferTxid(offerId) {
        const offer = offerMap[offerId];
        const order = getPendingOrder(offerId);
        const input = document.getElementById('offerTxidInput');
        const txid = input instanceof HTMLInputElement ? input.value.trim() : '';
        if (!offer || !order) return;
        if (!PAYMENT_TXID_RE.test(txid)) {
            showToast(text('交易哈希格式不正确。', 'Invalid TxID format.'), 'warn');
            return;
        }
        const normalizedTxid = normalizeTxid(txid);
        if (state.save.verifiedTxids.includes(normalizedTxid)) {
            showToast(text('该交易哈希已验证过，请勿重复使用。', 'This transaction hash has already been used.'), 'warn');
            return;
        }
        order.txid = normalizedTxid;
        applyReward(offer.reward);
        state.save.verifiedTxids.push(normalizedTxid);
        state.save.paymentHistory = [
            {
                orderId: order.id || createOrderId(offerId, order.createdAt),
                offerId,
                txid: normalizedTxid,
                amount: offer.price,
                verifiedAt: Date.now()
            },
            ...state.save.paymentHistory.filter((item) => item.txid !== normalizedTxid)
        ].slice(0, 12);
        state.save.pendingOrders = state.save.pendingOrders.filter((item) => item.offerId !== offerId);
        saveProgress();
        openModal({
            eyebrow: text('支付成功', 'Payment Verified'),
            title: localize(offer.name),
            subtitle: text('奖励已发放到账。', 'Rewards have been delivered.'),
            body: `<div class="cm-card"><div class="cm-reward-row">${renderRewardChips(offer.reward)}</div></div>`,
            actions: `<button class="cm-btn" type="button" data-action="closeModal">${escapeHtml(text('完成', 'Done'))}</button>`
        });
        renderAll();
        showToast(text('支付验证通过。', 'Payment verified.'), 'good');
    }

    function cancelOfferOrder(offerId) {
        state.save.pendingOrders = state.save.pendingOrders.filter((item) => item.offerId !== offerId);
        saveProgress();
        closeModal();
        showToast(text('订单已关闭。', 'Order cancelled.'), 'warn');
    }

    function getMissionStates() {
        const claimedSet = new Set(state.save.claimedMissions);
        return config.missions.map((mission) => {
            const progress = getMissionProgress(mission.metric);
            return {
                ...mission,
                progress,
                claimed: claimedSet.has(mission.id),
                canClaim: progress >= mission.target && !claimedSet.has(mission.id)
            };
        }).sort((left, right) => {
            const leftRank = left.canClaim ? 0 : left.claimed ? 2 : 1;
            const rightRank = right.canClaim ? 0 : right.claimed ? 2 : 1;
            return leftRank - rightRank;
        });
    }

    function getMissionProgress(metric) {
        switch (metric) {
            case 'runs': return state.save.stats.runs;
            case 'wins': return state.save.stats.wins;
            case 'matchedTiles': return state.save.stats.matchedTiles;
            case 'upgrades': return state.save.stats.upgrades;
            case 'researchUpgrades': return state.save.stats.researchUpgrades;
            case 'chapterClears': return state.save.clearedChapters.length;
            default: return 0;
        }
    }

    function getClaimableMissionCount() {
        return getMissionStates().filter((item) => item.canClaim).length;
    }

    function getReadySeasonCount(trackType) {
        if (trackType === 'premium' && !state.save.premiumSeason) return 0;
        const list = trackType === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack;
        return list.filter((item) => state.save.seasonXp >= item.xp && !state.save.seasonClaims[trackType].includes(item.id)).length;
    }

    function getPendingRewardCount() {
        return getClaimableMissionCount() + getReadySeasonCount('free') + getReadySeasonCount('premium');
    }

    function getOwnedOfferCount() {
        return config.paymentOffers.filter((item) => isOfferOwned(item.id)).length;
    }

    function getPendingOrderCount() {
        return state.save.pendingOrders.filter((item) => (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS).length;
    }

    function getPendingOrders() {
        return [...state.save.pendingOrders]
            .filter((item) => (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS)
            .sort((left, right) => right.createdAt - left.createdAt);
    }

    function getRecentPaymentHistory(limit = 3) {
        return [...state.save.paymentHistory]
            .sort((left, right) => right.verifiedAt - left.verifiedAt)
            .slice(0, limit);
    }

    function getLastVerifiedPayment(offerId) {
        return state.save.paymentHistory
            .filter((item) => item.offerId === offerId)
            .sort((left, right) => right.verifiedAt - left.verifiedAt)[0] || null;
    }

    function getResearchImpactLabel(researchId, level = getResearchLevel(researchId)) {
        switch (researchId) {
            case 'decodeCache':
                return text(`当前：开局步数 +${Math.floor(level / 3)}`, `Current: Start Moves +${Math.floor(level / 3)}`);
            case 'pulseBattery':
                return text(`当前：能量上限 +${level * 6}`, `Current: Max Energy +${level * 6}`);
            case 'signalAmp':
                return text(`当前：技能强度 +${level * 4}%`, `Current: Skill Power +${level * 4}%`);
            case 'lootRelay':
                return text(`当前：章节收益 +${level * 5}%`, `Current: Chapter Loot +${level * 5}%`);
            case 'stabilityMesh':
                return text(`当前：构筑战力 +${level * 4}%`, `Current: Deck Power +${level * 4}%`);
            default:
                return text('当前：已生效', 'Current: Active');
        }
    }

    function getResearchNextImpactLabel(researchId, level = getResearchLevel(researchId)) {
        const nextLevel = level + 1;
        switch (researchId) {
            case 'decodeCache':
                return text(`下级：开局步数 +${Math.floor(nextLevel / 3)}`, `Next: Start Moves +${Math.floor(nextLevel / 3)}`);
            case 'pulseBattery':
                return text(`下级：能量上限 +${nextLevel * 6}`, `Next: Max Energy +${nextLevel * 6}`);
            case 'signalAmp':
                return text(`下级：技能强度 +${nextLevel * 4}%`, `Next: Skill Power +${nextLevel * 4}%`);
            case 'lootRelay':
                return text(`下级：章节收益 +${nextLevel * 5}%`, `Next: Chapter Loot +${nextLevel * 5}%`);
            case 'stabilityMesh':
                return text(`下级：构筑战力 +${nextLevel * 4}%`, `Next: Deck Power +${nextLevel * 4}%`);
            default:
                return text('下级：继续提升', 'Next: More power');
        }
    }

    function getVisibleSeasonTrack(list, claimedIds) {
        const firstLockedIndex = list.findIndex((item) => !claimedIds.includes(item.id));
        const start = Math.max(0, (firstLockedIndex === -1 ? list.length - 3 : firstLockedIndex) - 1);
        return list.slice(start, start + 3);
    }

    function renderSummaryItem(icon, label, value) {
        return `
            <div class="cm-summary-item">
                <div class="cm-pill-head">
                    <span aria-hidden="true">${escapeHtml(icon)}</span>
                    <strong>${escapeHtml(label)}</strong>
                </div>
                <div class="cm-value">${escapeHtml(String(value))}</div>
            </div>
        `;
    }

    function renderHudPill(label, value, meta, icon = '•') {
        return `
            <div class="cm-hud-pill">
                <div class="cm-pill-head">
                    <span class="cm-metric-icon" aria-hidden="true">${escapeHtml(icon)}</span>
                    <strong>${escapeHtml(label)}</strong>
                </div>
                <span class="cm-value">${escapeHtml(String(value))}</span>
                <small>${escapeHtml(meta)}</small>
            </div>
        `;
    }

    function renderWalletPill(label, value, meta, icon = '•') {
        return `
            <div class="cm-wallet-pill">
                <div class="cm-pill-head">
                    <span class="cm-metric-icon" aria-hidden="true">${escapeHtml(icon)}</span>
                    <strong>${escapeHtml(label)}</strong>
                </div>
                <span class="cm-value">${escapeHtml(String(value))}</span>
                <small>${escapeHtml(meta)}</small>
            </div>
        `;
    }

    function getRewardIcon(key) {
        switch (key) {
            case 'credits': return '◎';
            case 'keyBits': return '◇';
            case 'cipherDust': return '✦';
            case 'seasonXp': return '✧';
            case 'premiumSeason': return '⟡';
            case 'starterBoost': return '▲';
            case 'vaultRelay': return '⬡';
            default: return '+';
        }
    }

    function renderCompactRewardPills(reward) {
        return Object.entries(reward).map(([key, value]) => {
            if (!value) return '';
            const label = value === true
                ? (key === 'premiumSeason'
                    ? text('高级轨', 'Pass')
                    : key === 'starterBoost'
                        ? text('开局稳', 'Boost')
                        : key === 'vaultRelay'
                            ? text('Boss稳', 'Boss')
                            : key)
                : formatCompact(value);
            return `<span class="cm-chip">${escapeHtml(getRewardIcon(key))} ${escapeHtml(String(label))}</span>`;
        }).join('');
    }

    function renderRewardChips(reward) {
        return Object.entries(reward).map(([key, value]) => {
            if (!value) return '';
            return `<span class="cm-chip">${escapeHtml(getRewardLabel(key, value))}</span>`;
        }).join('');
    }

    function buildRunStartFeedback(chapter, assist = getRunAssistState(chapter)) {
        if (isBossChapter(chapter)) {
            return makeFeedback(
                'danger',
                text('首领到场', 'Boss Arrived'),
                assist.rookie.active
                    ? text(`本关已放慢首领反制，先压护盾；你有 ${assist.bossPulseEvery} 步窗口。`, `Boss counters are slowed for this run. Break the shield first; you have a ${assist.bossPulseEvery}-move window.`)
                    : assist.gap > 0
                        ? text(`先压护盾；当前战力不足，首领每 ${assist.bossPulseEvery} 步会发动一次反制。`, `Break the shield first; your power is short, and the boss counters every ${assist.bossPulseEvery} moves.`)
                        : text(`先压护盾；你有 ${assist.bossPulseEvery} 步窗口来稳住节奏。`, `Break the shield first; you have a ${assist.bossPulseEvery}-move window before each boss counter.`)
            );
        }
        if (assist.rookie.active) {
            return makeFeedback(
                'good',
                text('新手保护', 'Rookie Assist'),
                text(`本局开局 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，先熟悉交换再追 4 连。`, `Open with +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy. Learn the swaps first, then look for a 4-match.`)
            );
        }
        if (assist.bonusMoves > 0 || assist.bonusEnergy > 0) {
            return makeFeedback(
                'good',
                text('构筑加成', 'Deck Bonus'),
                text(`开局 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，优先找 4 连起手。`, `Open with +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy.`)
            );
        }
        return makeFeedback(
            'good',
            text('解码开始', 'Run Started'),
            text('先找最容易凑出的 3 连。', 'Start with the easiest 3-match on the board.')
        );
    }

    function buildMatchFeedback(result, summary, run) {
        if (run.energy >= run.maxEnergy) {
            return makeFeedback(
                'good',
                text('技能已就绪', 'Skill Ready'),
                text('现在可释放主动技直接压目标。', 'Your active skill is ready to slam the goals.')
            );
        }

        if (summary.shieldDamage > 0) {
            return makeFeedback(
                'danger',
                text('防火墙受损', 'Firewall Cracked'),
                `${text('护盾压低', 'Shield reduced')} -${summary.shieldDamage}`
            );
        }

        if (summary.moveRefund > 0) {
            return makeFeedback(
                'good',
                text('稳态回收', 'Move Refund'),
                text('4 连及以上返还 1 步，继续滚起节奏。', 'A 4+ match refunded 1 move. Keep the tempo rolling.')
            );
        }

        if (summary.bonusCharge > 0) {
            return makeFeedback(
                'good',
                text('连锁充能', 'Cascade Charge'),
                `${text('额外充能', 'Bonus Charge')} +${summary.bonusCharge}`
            );
        }

        if (summary.powerDamage > 0) {
            return makeFeedback(
                'good',
                text('构筑压制', 'Deck Pressure'),
                `${text('额外推进', 'Extra pressure')} +${summary.powerDamage}`
            );
        }

        if (result.cascades >= 2) {
            return makeFeedback(
                'good',
                `${text('连锁', 'Cascade')} x${result.cascades}`,
                `${text('清除', 'Cleared')} ${result.totalCleared} ${text('格', 'tiles')}`
            );
        }

        if (result.biggestGroup >= 5) {
            return makeFeedback(
                'good',
                text('5 连爆破', '5-Match Burst'),
                text('这次交换带来了更高分与更快充能。', 'This swap gave extra score and faster energy charge.')
            );
        }

        if (result.biggestGroup >= 4) {
            return makeFeedback(
                'good',
                text('4 连突破', '4-Match'),
                text('大消除会帮助你更快滚起节奏。', 'Big clears help you snowball the tempo.')
            );
        }

        return makeFeedback(
            'good',
            text('有效交换', 'Good Swap'),
            `${text('推进目标', 'Goal progress')} +${summary.progressDamage || result.totalCleared}`
        );
    }

    function makeFeedback(tone, title, detail) {
        return { tone, title, detail };
    }

    function getRewardLabel(key, value) {
        switch (key) {
            case 'credits': return `${text('金币', 'Credits')} +${formatCompact(value)}`;
            case 'keyBits': return `${text('密钥位', 'Key Bits')} +${formatCompact(value)}`;
            case 'cipherDust': return `${text('密码尘', 'Cipher Dust')} +${formatCompact(value)}`;
            case 'seasonXp': return `${text('赛季经验', 'Season XP')} +${formatCompact(value)}`;
            case 'premiumSeason': return text('高级赛季与中期增益已解锁', 'Premium track and midgame boost unlocked');
            case 'starterBoost': return text('每日免费局 +1 / 开局更稳', '+1 daily free run / steadier starts');
            case 'vaultRelay': return text('首领反制减弱 / 收益提高', 'Boss counters softened / rewards boosted');
            default: return `${key} +${value}`;
        }
    }

    function getSelectedChapter() {
        return chapterMap[state.save.selectedChapter] || config.chapters[0];
    }

    function getDeckPower() {
        const leaderPower = getCardPower('leader', state.save.selectedLeader);
        const skillPower = getCardPower('skill', state.save.selectedSkill);
        const modulePower = state.save.selectedModules.reduce((sum, id) => sum + getCardPower('module', id), 0);
        const multiplier = 1 + getResearchLevel('stabilityMesh') * 0.04;
        return Math.round((leaderPower + skillPower + modulePower) * multiplier);
    }

    function getCardPower(type, cardId) {
        const level = getCardLevel(cardId);
        const source = type === 'leader' ? leaderMap[cardId] : type === 'module' ? moduleMap[cardId] : skillMap[cardId];
        if (!source) return 0;
        const step = getCardPowerStep(type);
        return source.basePower + (level - 1) * step;
    }

    function getCardPowerStep(type) {
        return type === 'leader' ? 28 : type === 'module' ? 14 : 20;
    }

    function getCardMaxLevel(type) {
        return config.cardMaxLevels?.[type] || (type === 'leader' ? 12 : 10);
    }

    function getCardCost(type, cardId) {
        const level = getCardLevel(cardId);
        const curve = config.upgradeCurves[type];
        return {
            credits: Math.round(curve.baseCredits * Math.pow(curve.creditGrowth, Math.max(0, level - 1))),
            keyBits: Math.round(curve.baseBits * Math.pow(curve.bitGrowth, Math.max(0, level - 1)))
        };
    }

    function getResearchCost(researchId) {
        const item = researchMap[researchId];
        const level = getResearchLevel(researchId);
        const discount = state.save.premiumSeason ? 0.12 : 0;
        return {
            credits: Math.max(1, Math.round(item.baseCredits * Math.pow(1.32, level) * (1 - discount))),
            cipherDust: Math.max(1, Math.round(item.baseDust * Math.pow(1.24, level) * (1 - discount)))
        };
    }

    function getScaledChapterReward(chapter) {
        const rewardRate = 1 + getResearchLevel('lootRelay') * 0.05 + (hasModule('relayCache') ? 0.08 : 0) + (state.save.vaultRelay ? 0.15 : 0);
        return {
            credits: Math.round(chapter.reward.credits * rewardRate),
            keyBits: Math.round(chapter.reward.keyBits * rewardRate),
            cipherDust: chapter.reward.cipherDust,
            seasonXp: chapter.reward.seasonXp
        };
    }

    function getFirstClearReward(chapter) {
        const bossFactor = isBossChapter(chapter) ? 1.22 : 1;
        return {
            credits: Math.round(chapter.reward.credits * 0.62 * bossFactor),
            keyBits: Math.round(chapter.reward.keyBits * 0.48 * bossFactor),
            cipherDust: Math.round(chapter.reward.cipherDust * 0.55 * bossFactor),
            seasonXp: Math.round(chapter.reward.seasonXp * 0.42 * bossFactor)
        };
    }

    function applyReward(reward) {
        state.save.credits += reward.credits || 0;
        state.save.keyBits += reward.keyBits || 0;
        state.save.cipherDust += reward.cipherDust || 0;
        state.save.seasonXp += reward.seasonXp || 0;
        if (reward.premiumSeason) state.save.premiumSeason = true;
        if (reward.starterBoost) state.save.starterBoost = true;
        if (reward.vaultRelay) state.save.vaultRelay = true;
    }

    function getContinueCost() {
        if (!state.run) return 0;
        if (state.run.assist?.rookie.active && state.run.continuesBought === 0) {
            return 0;
        }
        const chapter = chapterMap[state.run.chapterId];
        const base = config.board.buyMovesBase * Math.pow(2, state.run.continuesBought) * Math.max(1, chapter.chapter);
        const discount = Math.min(0.2, (state.save.starterBoost ? 0.12 : 0) + (state.save.vaultRelay ? 0.08 : 0));
        return Math.round(base * (1 - discount));
    }

    function getEntryCost(chapter) {
        return config.board.entryCostByChapter[chapter.chapter] || 0;
    }

    function getRunStartMoves(chapter) {
        return chapter.moves + Math.floor(getResearchLevel('decodeCache') / 3) + (hasModule('hardPatch') ? 1 : 0);
    }

    function getRunMaxEnergy() {
        return 100 + getResearchLevel('pulseBattery') * 6 + (state.save.premiumSeason ? 10 : 0);
    }

    function getDailyFreeRunsLimit() {
        return config.board.freeRunsPerDay + (state.save.starterBoost ? 1 : 0);
    }

    function getPlayerMasteryLabel() {
        const wins = state.save.stats.wins || 0;
        if (wins < 2) return text('新手保护期', 'Rookie phase');
        if (wins < 6) return text('熟悉节奏期', 'Learning phase');
        if (wins < 12) return text('稳定推进期', 'Steady phase');
        return text('高压推进期', 'Pressure phase');
    }

    function getRookieAssistState(chapter) {
        const wins = state.save.stats.wins || 0;
        const power = getDeckPower();
        const gap = Math.max(0, chapter.recommended - power);
        const isBoss = isBossChapter(chapter);
        if (chapter.id === '1-1' && wins === 0) {
            return {
                active: true,
                bonusMoves: 3,
                bonusEnergy: 24,
                progressBonus: 1,
                bossGrace: 0,
                drainReduction: 0,
                note: text('首局保护：先熟悉交换与 3 连。', 'First-run assist: learn swapping and basic 3-matches first.')
            };
        }
        if (chapter.chapter === 1 && wins < 2) {
            return {
                active: true,
                bonusMoves: 2,
                bonusEnergy: 16,
                progressBonus: 1,
                bossGrace: chapter.id === '1-3' ? 1 : 0,
                drainReduction: chapter.id === '1-3' ? 4 : 0,
                note: text('第一章保护：给你更多步数和开局容错。', 'Chapter 1 assist: extra moves and a smoother opener.')
            };
        }
        if (chapter.id === '1-3' && wins < 4) {
            return {
                active: true,
                bonusMoves: 1,
                bonusEnergy: 10,
                progressBonus: 0,
                bossGrace: 1,
                drainReduction: 4,
                note: text('首个首领已放慢反制，先拆盾。', 'The first boss counter is slowed. Break the shield first.')
            };
        }
        if (chapter.chapter === 2 && wins < 5) {
            return {
                active: true,
                bonusMoves: gap >= 140 ? 2 : 1,
                bonusEnergy: gap >= 140 ? 12 : 8,
                progressBonus: gap >= 180 ? 1 : 0,
                bossGrace: isBoss ? 1 : 0,
                drainReduction: isBoss ? 4 : 0,
                note: text('第二章缓冲：继续给你更顺的开局与一次免费首补。', 'Chapter 2 easing: smoother starts and one free first continue remain active.')
            };
        }
        if (chapter.chapter === 2 && wins < 8 && gap > 0) {
            return {
                active: true,
                bonusMoves: gap >= 220 ? 2 : 1,
                bonusEnergy: gap >= 220 ? 10 : 6,
                progressBonus: gap >= 220 ? 1 : 0,
                bossGrace: isBoss ? 1 : 0,
                drainReduction: isBoss ? 2 : 0,
                note: text('第二章追赶保护：如果战力还没跟上，系统会再补一点容错。', 'Chapter 2 catch-up assist: if your deck is still behind, the game adds a bit more forgiveness.')
            };
        }
        if (chapter.chapter === 3 && wins < 10 && gap >= 260) {
            return {
                active: true,
                bonusMoves: 1,
                bonusEnergy: 8,
                progressBonus: 1,
                bossGrace: isBoss ? 1 : 0,
                drainReduction: isBoss ? 2 : 0,
                note: text('第三章追赶保护：仍会给一次轻量扶梯，避免断层卡关。', 'Chapter 3 catch-up assist: a light safety ramp remains to avoid a hard wall.')
            };
        }
        return {
            active: false,
            bonusMoves: 0,
            bonusEnergy: 0,
            progressBonus: 0,
            bossGrace: 0,
            drainReduction: 0,
            note: ''
        };
    }

    function getStageDifficultyLabel(chapter, assist = getRunAssistState(chapter)) {
        if (chapter.id === '1-1') return text('热身关', 'Warm-up');
        if (isBossChapter(chapter)) {
            return assist.rookie.active
                ? text('首领练手', 'Boss Practice')
                : assist.gap > 0
                    ? text('首领警戒', 'Boss Alert')
                    : text('首领压制', 'Boss Pressure');
        }
        if (assist.gap > 260) return text('建议补强', 'Upgrade Needed');
        if (assist.gap > 0) return text('可尝试推进', 'Try Push');
        if (chapter.chapter >= 3) return text('高压推进', 'High Pressure');
        return text('稳定推进', 'Steady');
    }

    function getRunGoalSummary(chapter) {
        return chapter.goals.map((goal) => {
            const meta = getGoalMeta(goal.type);
            return `${meta.icon}${goal.amount}`;
        }).join(' · ');
    }

    function getRunOpeningHint(chapter, assist = getRunAssistState(chapter)) {
        if (isBossChapter(chapter)) {
            return assist.rookie.active
                ? text('这关先拆护盾，再用技能收尾；系统已放慢首领反制。', 'Break the shield first, then finish with skills. Boss counters are slowed for this run.')
                : text('这关先拆护盾，再把 4 连和技能留给核心目标。', 'Break the shield first, then save 4-matches and skills for the core goal.');
        }
        if (assist.rookie.active) {
            return text('先随手做一个 3 连熟悉交换，再开始追 4 连和连锁。', 'Start with any easy 3-match to learn the board, then look for 4-matches and cascades.');
        }
        if (assist.progressBonus > 0) {
            return text('这局开局更顺，优先找 4 连把节奏滚起来。', 'This opener is stronger, so look for a 4-match first and snowball the tempo.');
        }
        return text('优先处理最容易完成的颜色目标。', 'Start with the easiest color goal on the board.');
    }

    function getRunAssistState(chapter = getSelectedChapter()) {
        const power = getDeckPower();
        const gap = Math.max(0, chapter.recommended - power);
        const surplus = Math.max(0, power - chapter.recommended);
        const supportTier = surplus >= 320 ? 2 : surplus >= 120 ? 1 : 0;
        const pressureTier = gap >= 420 ? 2 : gap >= 180 ? 1 : 0;
        const rookie = getRookieAssistState(chapter);
        return {
            gap,
            supportTier,
            pressureTier,
            rookie,
            bonusMoves: rookie.bonusMoves + (state.save.starterBoost ? 1 : 0) + supportTier,
            bonusEnergy: rookie.bonusEnergy + (state.save.starterBoost ? 18 : 0) + (state.save.premiumSeason && chapter.chapter >= 2 ? 8 : 0) + supportTier * 10,
            progressBonus: rookie.progressBonus + (state.save.vaultRelay ? 1 : 0) + supportTier,
            bossPulseEvery: Math.max(2, 4 + supportTier + (state.save.vaultRelay ? 2 : 0) + rookie.bossGrace - pressureTier),
            bossShieldPulse: Math.max(1, 2 + chapter.chapter + pressureTier - (state.save.vaultRelay ? 2 : 0)),
            bossEnergyDrain: Math.max(8, 16 + (chapter.chapter * 4) + (pressureTier * 6) - (state.save.vaultRelay ? 10 : 0) - rookie.drainReduction)
        };
    }

    function getRunAssistSummary(chapter, assist = getRunAssistState(chapter)) {
        if (isTutorialEntryFree(chapter, assist)) {
            return text(`首通教学免费：本关不扣日常次数，且开局提供 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，首补也免费。`, `Tutorial entry is free on this first clear. You also start with +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy, and the first continue is free.`);
        }
        if (assist.rookie.active && assist.gap > 0) {
            return text(`当前仍差 ${formatCompact(assist.gap)}，但本关提供新手保护：开局 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，且首补免费。`, `Still short by ${formatCompact(assist.gap)}, but rookie assist grants +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy this run, and the first continue is free.`);
        }
        if (assist.rookie.active) {
            return text(`新手保护生效：开局 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，大消除额外推进 ${assist.progressBonus}，首补免费。`, `Rookie assist is active: open with +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy, big clears deal +${assist.progressBonus} extra pressure, and the first continue is free.`);
        }
        if (assist.gap > 0) {
            return isBossChapter(chapter)
                ? text(`当前仍差 ${formatCompact(assist.gap)}，首领将每 ${assist.bossPulseEvery} 步发动一次反制。`, `Still short by ${formatCompact(assist.gap)}. The boss counters every ${assist.bossPulseEvery} moves.`)
                : text(`当前仍差 ${formatCompact(assist.gap)}，建议先补主力卡与研究。`, `Still short by ${formatCompact(assist.gap)}. Upgrade your core cards and lab first.`);
        }
        if (assist.bonusMoves > 0 || assist.bonusEnergy > 0 || assist.progressBonus > 0) {
            return text(`开局 +${assist.bonusMoves} 步 / +${assist.bonusEnergy} 能量，大消除额外推进 ${assist.progressBonus}。`, `Open with +${assist.bonusMoves} moves / +${assist.bonusEnergy} energy, and big clears deal +${assist.progressBonus} extra pressure.`);
        }
        return text('当前构筑已达到推荐线，可稳定推进。', 'Your current deck meets the recommended line and can push steadily.');
    }

    function getRunStartNotice(chapter, assist = getRunAssistState(chapter)) {
        if (isBossChapter(chapter)) {
            return assist.rookie.active
                ? text('首领反制已放慢：先拆盾，再用技能收尾。', 'Boss counters are slowed. Break the shield first, then finish with skills.')
                : assist.gap > 0
                    ? text('先压护盾，再用技能收尾；当前战力不足时首领反制会更快。', 'Break the shield first, then finish with skills; low power makes boss counters arrive faster.')
                    : text('先压护盾，再把大消除留给核心目标。', 'Break the shield first, then save big clears for the core goal.');
        }
        if (assist.rookie.active) {
            return text('先做任意 3 连熟悉交换，系统已给你额外步数和能量。', 'Start with any easy 3-match. Extra moves and energy are active for this run.');
        }
        if (assist.bonusMoves > 0 || assist.bonusEnergy > 0) {
            return text('构筑加成已生效，开局更顺，优先找 4 连。', 'Deck bonuses are active. Your opener is smoother, so look for a 4-match first.');
        }
        return text('先点 1 格，再点相邻 1 格完成交换。', 'Tap one tile, then an adjacent tile to swap.');
    }

    function applyLargestGoalPressure(amount) {
        const goal = [...state.run.goals].filter((entry) => entry.remaining > 0).sort((left, right) => right.remaining - left.remaining)[0];
        if (!goal || amount <= 0) return { type: '', amount: 0 };
        const before = goal.remaining;
        goal.remaining = Math.max(0, goal.remaining - amount);
        return { type: goal.type, amount: Math.max(0, before - goal.remaining) };
    }

    function reduceLargestGoal(amount) {
        return applyLargestGoalPressure(amount).amount;
    }

    function applyLargestColorPressure(amount) {
        const candidates = state.run.goals.filter((goal) => goal.type !== 'shield' && goal.remaining > 0);
        const target = candidates.sort((left, right) => right.remaining - left.remaining)[0];
        if (!target || amount <= 0) return { type: '', amount: 0 };
        const before = target.remaining;
        target.remaining = Math.max(0, target.remaining - amount);
        return { type: target.type, amount: Math.max(0, before - target.remaining) };
    }

    function reduceLargestColorGoal(amount) {
        return applyLargestColorPressure(amount).amount;
    }

    function reduceSmallestGoal(amount) {
        const goal = [...state.run.goals].filter((entry) => entry.remaining > 0).sort((left, right) => left.remaining - right.remaining)[0];
        if (!goal || amount <= 0) return 0;
        const before = goal.remaining;
        goal.remaining = Math.max(0, goal.remaining - amount);
        return Math.max(0, before - goal.remaining);
    }

    function reduceGoalType(type, amount) {
        const goal = state.run.goals.find((entry) => entry.type === type && entry.remaining > 0);
        if (!goal || amount <= 0) return 0;
        const before = goal.remaining;
        goal.remaining = Math.max(0, goal.remaining - amount);
        return Math.max(0, before - goal.remaining);
    }

    function restoreGoalType(type, amount) {
        const goal = state.run.goals.find((entry) => entry.type === type && entry.remaining < (entry.amount || entry.remaining));
        if (!goal || amount <= 0) return 0;
        const cap = Math.max(goal.amount || 0, goal.remaining);
        const before = goal.remaining;
        goal.remaining = Math.min(cap, goal.remaining + amount);
        return Math.max(0, goal.remaining - before);
    }

    function restoreLargestColorGoal(amount) {
        const target = state.run.goals
            .filter((entry) => entry.type !== 'shield' && entry.remaining < (entry.amount || entry.remaining))
            .sort((left, right) => ((left.amount - left.remaining) < (right.amount - right.remaining) ? 1 : -1))[0];
        if (!target || amount <= 0) return 0;
        const cap = Math.max(target.amount || 0, target.remaining);
        const before = target.remaining;
        target.remaining = Math.min(cap, target.remaining + amount);
        return Math.max(0, target.remaining - before);
    }

    function advanceBossCountermeasure() {
        const run = state.run;
        if (!run?.active) return null;
        const chapter = chapterMap[run.chapterId];
        if (!isBossChapter(chapter)) return null;
        run.bossTurnsLeft = Math.max(0, (run.bossTurnsLeft || run.bossPulseEvery || 0) - 1);
        if (run.bossTurnsLeft > 0) return null;

        run.bossTurnsLeft = run.bossPulseEvery || 3;
        run.bossCountersTriggered = (run.bossCountersTriggered || 0) + 1;

        const shieldRecovered = restoreGoalType('shield', run.assist?.bossShieldPulse || 2);
        const colorRecovered = shieldRecovered > 0 ? 0 : restoreLargestColorGoal(Math.max(1, chapter.chapter - 1));
        const energyLost = Math.min(run.energy, run.assist?.bossEnergyDrain || 12);
        run.energy = Math.max(0, run.energy - energyLost);

        const detail = [
            shieldRecovered > 0 ? `${text('护盾回补', 'Shield restored')} +${shieldRecovered}` : '',
            colorRecovered > 0 ? `${text('目标回滚', 'Goal restored')} +${colorRecovered}` : '',
            energyLost > 0 ? `${text('能量抽离', 'Energy drained')} -${energyLost}` : ''
        ].filter(Boolean).join(' · ');

        return {
            feedback: makeFeedback('danger', text('首领反制', 'Boss Counter'), detail || text('首领压力升高。', 'Boss pressure rises.')),
            notice: text('首领已发动反制，下一步优先找 4 连或技能回合。', 'The boss has countered. Prioritize a 4-match or skill turn next.')
        };
    }

    function createFreshBoard() {
        const size = config.board.size;
        const board = new Array(size * size).fill('');
        const types = config.board.colors.map((item) => item.id);
        for (let row = 0; row < size; row += 1) {
            for (let col = 0; col < size; col += 1) {
                let type = randomFrom(types);
                let guard = 0;
                while (createsInitialMatch(board, row, col, size, type) && guard < 12) {
                    type = randomFrom(types);
                    guard += 1;
                }
                board[row * size + col] = type;
            }
        }
        return board;
    }

    function createsInitialMatch(board, row, col, size, type) {
        const leftA = col >= 1 ? board[row * size + (col - 1)] : null;
        const leftB = col >= 2 ? board[row * size + (col - 2)] : null;
        const upA = row >= 1 ? board[(row - 1) * size + col] : null;
        const upB = row >= 2 ? board[(row - 2) * size + col] : null;
        return (leftA === type && leftB === type) || (upA === type && upB === type);
    }

    function findMatches(board) {
        const size = config.board.size;
        const marked = new Set();
        let biggestGroup = 0;

        for (let row = 0; row < size; row += 1) {
            let streakStart = 0;
            for (let col = 1; col <= size; col += 1) {
                const prev = board[row * size + (col - 1)];
                const next = col < size ? board[row * size + col] : null;
                if (next !== prev) {
                    const streak = col - streakStart;
                    if (prev && streak >= 3) {
                        biggestGroup = Math.max(biggestGroup, streak);
                        for (let index = streakStart; index < col; index += 1) {
                            marked.add(row * size + index);
                        }
                    }
                    streakStart = col;
                }
            }
        }

        for (let col = 0; col < size; col += 1) {
            let streakStart = 0;
            for (let row = 1; row <= size; row += 1) {
                const prev = board[(row - 1) * size + col];
                const next = row < size ? board[row * size + col] : null;
                if (next !== prev) {
                    const streak = row - streakStart;
                    if (prev && streak >= 3) {
                        biggestGroup = Math.max(biggestGroup, streak);
                        for (let index = streakStart; index < row; index += 1) {
                            marked.add(index * size + col);
                        }
                    }
                    streakStart = row;
                }
            }
        }

        return { indices: [...marked], biggestGroup };
    }

    function resolveBoard(board) {
        const result = {
            totalCleared: 0,
            cascades: 0,
            byType: {},
            biggestGroup: 0
        };

        while (true) {
            const match = findMatches(board);
            if (!match.indices.length) break;
            result.cascades += 1;
            result.biggestGroup = Math.max(result.biggestGroup, match.biggestGroup);
            match.indices.forEach((index) => {
                const type = board[index];
                result.byType[type] = (result.byType[type] || 0) + 1;
                result.totalCleared += 1;
                board[index] = null;
            });
            collapseBoard(board);
        }

        return result;
    }

    function collapseBoard(board) {
        const size = config.board.size;
        const types = config.board.colors.map((item) => item.id);
        for (let col = 0; col < size; col += 1) {
            const column = [];
            for (let row = size - 1; row >= 0; row -= 1) {
                const value = board[row * size + col];
                if (value) column.push(value);
            }
            while (column.length < size) {
                column.push(randomFrom(types));
            }
            for (let row = size - 1; row >= 0; row -= 1) {
                board[row * size + col] = column[size - 1 - row];
            }
        }
    }

    function isAdjacent(leftIndex, rightIndex, size) {
        const leftRow = Math.floor(leftIndex / size);
        const leftCol = leftIndex % size;
        const rightRow = Math.floor(rightIndex / size);
        const rightCol = rightIndex % size;
        return Math.abs(leftRow - rightRow) + Math.abs(leftCol - rightCol) === 1;
    }

    function swapItems(list, left, right) {
        const temp = list[left];
        list[left] = list[right];
        list[right] = temp;
    }

    function hasModule(moduleId) {
        return state.save.selectedModules.includes(moduleId);
    }

    function areGoalsComplete(goals) {
        return goals.every((goal) => goal.remaining <= 0);
    }

    function isChapterUnlocked(chapterId) {
        const index = config.chapters.findIndex((item) => item.id === chapterId);
        return index <= state.save.clearedChapters.length;
    }

    function getNextChapterId(currentId) {
        const index = config.chapters.findIndex((item) => item.id === currentId);
        if (index === -1) return '';
        return config.chapters[index + 1]?.id || '';
    }

    function getGoalMeta(type) {
        if (type === 'shield') {
            return {
                icon: '⛨',
                label: text('护盾', 'Shield')
            };
        }
        const tile = tileMap[type];
        return {
            icon: tile?.icon || '?',
            label: tile ? localize(tile.name) : type
        };
    }

    function isBossChapter(chapter) {
        return Array.isArray(chapter?.goals) && chapter.goals.some((goal) => goal.type === 'shield');
    }

    function isTutorialEntryFree(chapter, assist = getRunAssistState(chapter)) {
        return assist.rookie.active && !state.save.clearedChapters.includes(chapter.id) && chapter.chapter <= 2;
    }

    function getPendingOrder(offerId) {
        return state.save.pendingOrders.find((item) => item.offerId === offerId && (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS) || null;
    }

    function getPendingOrderEta(order) {
        const msLeft = Math.max(0, PAYMENT_ORDER_EXPIRY_MS - (Date.now() - order.createdAt));
        const minutes = Math.floor(msLeft / 60000);
        const seconds = Math.floor((msLeft % 60000) / 1000);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    function normalizeTxid(txid) {
        return String(txid || '').trim().toLowerCase();
    }

    function shortenTxid(txid) {
        const normalized = normalizeTxid(txid);
        if (normalized.length <= 12) return normalized || '--';
        return `${normalized.slice(0, 6)}…${normalized.slice(-6)}`;
    }

    function createOrderId(offerId, createdAt = Date.now()) {
        const offerCode = String(offerId || 'pack').replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'PACK';
        const stamp = Number(createdAt || Date.now()).toString(36).slice(-6).toUpperCase();
        const salt = Math.random().toString(36).slice(2, 5).toUpperCase();
        return `${offerCode}-${stamp}-${salt}`;
    }

    function formatTimeLabel(value) {
        if (!value) return '--';
        try {
            return new Date(value).toLocaleString(state.lang === 'en' ? 'en-US' : 'zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return '--';
        }
    }

    function sanitizeCardLevels(levels) {
        const nextLevels = {};
        allCardIds.forEach((cardId) => {
            const type = cardTypeMap[cardId];
            const rawLevel = Number(levels?.[cardId]) || 1;
            nextLevels[cardId] = Math.min(getCardMaxLevel(type), Math.max(1, Math.round(rawLevel)));
        });
        return nextLevels;
    }

    function sanitizeNumericValue(value, fallback = 0) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.max(0, Math.round(number));
    }

    function sanitizeIdList(list, validIds) {
        const allowed = new Set(validIds);
        const unique = [];
        const seen = new Set();
        (Array.isArray(list) ? list : []).forEach((item) => {
            const id = String(item || '');
            if (!allowed.has(id) || seen.has(id)) return;
            seen.add(id);
            unique.push(id);
        });
        return unique;
    }

    function sanitizeSelectedModules(list) {
        return sanitizeIdList(list, Object.keys(moduleMap)).slice(0, 2);
    }

    function sanitizeSeasonClaims(trackType, list) {
        const validIds = (trackType === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack).map((item) => item.id);
        return sanitizeIdList(list, validIds);
    }

    function sanitizeStats(stats) {
        return {
            runs: sanitizeNumericValue(stats?.runs),
            wins: sanitizeNumericValue(stats?.wins),
            matchedTiles: sanitizeNumericValue(stats?.matchedTiles),
            upgrades: sanitizeNumericValue(stats?.upgrades),
            researchUpgrades: sanitizeNumericValue(stats?.researchUpgrades)
        };
    }

    function sanitizeResearchLevels(levels) {
        return Object.fromEntries(config.research.map((item) => {
            const rawLevel = sanitizeNumericValue(levels?.[item.id]);
            return [item.id, Math.min(item.maxLevel, rawLevel)];
        }));
    }

    function sanitizePendingOrders(list) {
        if (!Array.isArray(list)) return [];
        const seenOffers = new Set();
        return list
            .map((item) => {
                const createdAt = Number(item?.createdAt) || 0;
                return {
                    id: String(item?.id || createOrderId(item?.offerId, createdAt)),
                    offerId: String(item?.offerId || ''),
                    createdAt,
                    txid: normalizeTxid(item?.txid || '')
                };
            })
            .filter((item) => offerMap[item.offerId] && item.createdAt > 0 && (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS)
            .sort((left, right) => right.createdAt - left.createdAt)
            .filter((item) => {
                if (seenOffers.has(item.offerId)) return false;
                seenOffers.add(item.offerId);
                return true;
            })
            .slice(0, 6);
    }

    function sanitizePaymentHistory(list) {
        if (!Array.isArray(list)) return [];
        const seenTxids = new Set();
        return list
            .map((item) => ({
                orderId: String(item?.orderId || '--'),
                offerId: String(item?.offerId || ''),
                txid: normalizeTxid(item?.txid || ''),
                amount: Number(item?.amount) || 0,
                verifiedAt: Number(item?.verifiedAt) || 0
            }))
            .filter((item) => offerMap[item.offerId] && PAYMENT_TXID_RE.test(item.txid) && item.verifiedAt > 0)
            .sort((left, right) => right.verifiedAt - left.verifiedAt)
            .filter((item) => {
                if (seenTxids.has(item.txid)) return false;
                seenTxids.add(item.txid);
                return true;
            })
            .slice(0, 12);
    }

    function sanitizeVerifiedTxids(list, paymentHistory = []) {
        const txids = [
            ...(Array.isArray(list) ? list : []),
            ...paymentHistory.map((item) => item.txid)
        ]
            .map((item) => normalizeTxid(item))
            .filter((item) => PAYMENT_TXID_RE.test(item));
        return [...new Set(txids)].slice(0, 64);
    }

    function isOfferOwned(offerId) {
        if (offerId === 'seasonPass') return !!state.save.premiumSeason;
        if (offerId === 'starterPack') return !!state.save.starterBoost;
        if (offerId === 'breakerVault') return !!state.save.vaultRelay;
        return false;
    }

    function isDailyShopClaimed() {
        return state.save.dailyShopStamp === getTodayStamp();
    }

    function getRemainingFreeRuns() {
        return Math.max(0, getDailyFreeRunsLimit() - state.save.freeRunsUsed);
    }

    function getCardLevel(cardId) {
        return state.save.cardLevels[cardId] || 1;
    }

    function getResearchLevel(researchId) {
        return state.save.researchLevels[researchId] || 0;
    }

    function getCurrencyMeta(currencyId) {
        switch (currencyId) {
            case 'credits': return text('升级 / 门票', 'Upgrades / Entry');
            case 'keyBits': return text('卡牌成长', 'Card upgrades');
            case 'cipherDust': return text('研究成长', 'Research');
            case 'seasonXp': return text('赛季轨道', 'Season track');
            default: return '';
        }
    }

    function getTabIcon(tabId) {
        switch (tabId) {
            case 'run': return '◫';
            case 'deck': return '⌘';
            case 'lab': return '✦';
            case 'missions': return '✓';
            case 'season': return '☼';
            case 'shop': return '◎';
            default: return '•';
        }
    }

    function loadSave() {
        const base = createDefaultSave();
        try {
            const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
            const paymentHistory = sanitizePaymentHistory(raw.paymentHistory);
            const save = {
                ...base,
                ...raw,
                credits: sanitizeNumericValue(raw.credits, base.credits),
                keyBits: sanitizeNumericValue(raw.keyBits, base.keyBits),
                cipherDust: sanitizeNumericValue(raw.cipherDust, base.cipherDust),
                seasonXp: sanitizeNumericValue(raw.seasonXp, base.seasonXp),
                freeRunsUsed: sanitizeNumericValue(raw.freeRunsUsed, base.freeRunsUsed),
                freeRunsStamp: typeof raw.freeRunsStamp === 'string' && raw.freeRunsStamp ? raw.freeRunsStamp : base.freeRunsStamp,
                dailyShopStamp: typeof raw.dailyShopStamp === 'string' ? raw.dailyShopStamp : base.dailyShopStamp,
                cardLevels: sanitizeCardLevels({ ...base.cardLevels, ...(raw.cardLevels || {}) }),
                researchLevels: sanitizeResearchLevels({ ...base.researchLevels, ...(raw.researchLevels || {}) }),
                stats: sanitizeStats({ ...base.stats, ...(raw.stats || {}) }),
                seasonClaims: {
                    free: sanitizeSeasonClaims('free', raw.seasonClaims?.free),
                    premium: sanitizeSeasonClaims('premium', raw.seasonClaims?.premium)
                },
                claimedMissions: sanitizeIdList(raw.claimedMissions, config.missions.map((item) => item.id)),
                clearedChapters: sanitizeIdList(raw.clearedChapters, config.chapters.map((item) => item.id)),
                selectedModules: sanitizeSelectedModules(raw.selectedModules),
                pendingOrders: sanitizePendingOrders(raw.pendingOrders),
                paymentHistory,
                verifiedTxids: sanitizeVerifiedTxids(raw.verifiedTxids, paymentHistory)
            };
            if (!leaderMap[save.selectedLeader]) save.selectedLeader = base.selectedLeader;
            if (!skillMap[save.selectedSkill]) save.selectedSkill = base.selectedSkill;
            if (!chapterMap[save.selectedChapter]) save.selectedChapter = base.selectedChapter;
            if (!save.selectedModules.length) save.selectedModules = base.selectedModules;
            return save;
        } catch (error) {
            return base;
        }
    }

    function createDefaultSave() {
        return {
            tab: 'run',
            credits: 1680,
            keyBits: 180,
            cipherDust: 56,
            seasonXp: 0,
            freeRunsStamp: getTodayStamp(),
            freeRunsUsed: 0,
            dailyShopStamp: '',
            selectedChapter: '1-1',
            selectedLeader: 'glintFox',
            selectedModules: ['prismTap', 'hardPatch'],
            selectedSkill: 'gridBurst',
            cardLevels: Object.fromEntries(allCardIds.map((id) => [id, 1])),
            researchLevels: Object.fromEntries(config.research.map((item) => [item.id, 0])),
            claimedMissions: [],
            seasonClaims: { free: [], premium: [] },
            premiumSeason: false,
            starterBoost: false,
            vaultRelay: false,
            clearedChapters: [],
            pendingOrders: [],
            paymentHistory: [],
            verifiedTxids: [],
            stats: {
                runs: 0,
                wins: 0,
                matchedTiles: 0,
                upgrades: 0,
                researchUpgrades: 0
            }
        };
    }

    function resetDailyState() {
        const today = getTodayStamp();
        let changed = false;
        if (state.save.freeRunsStamp !== today) {
            state.save.freeRunsStamp = today;
            state.save.freeRunsUsed = 0;
            changed = true;
        }
        const pendingOrders = sanitizePendingOrders(state.save.pendingOrders);
        const paymentHistory = sanitizePaymentHistory(state.save.paymentHistory);
        const verifiedTxids = sanitizeVerifiedTxids(state.save.verifiedTxids, paymentHistory);
        if (JSON.stringify(state.save.pendingOrders) !== JSON.stringify(pendingOrders)) changed = true;
        if (JSON.stringify(state.save.paymentHistory) !== JSON.stringify(paymentHistory)) changed = true;
        if (JSON.stringify(state.save.verifiedTxids) !== JSON.stringify(verifiedTxids)) changed = true;
        state.save.pendingOrders = pendingOrders;
        state.save.paymentHistory = paymentHistory;
        state.save.verifiedTxids = verifiedTxids;
        if (changed) saveProgress();
    }

    function saveProgress() {
        try {
            state.save.pendingOrders = sanitizePendingOrders(state.save.pendingOrders);
            state.save.paymentHistory = sanitizePaymentHistory(state.save.paymentHistory);
            state.save.verifiedTxids = sanitizeVerifiedTxids(state.save.verifiedTxids, state.save.paymentHistory);
            localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
        } catch (error) {}
    }

    function openModal(modal) {
        state.modal = modal;
    }

    function closeModal() {
        state.modal = null;
        renderModal();
    }

    function showToast(message, tone) {
        if (!ui.toast) return;
        ui.toast.className = 'cm-toast is-visible';
        if (tone === 'good') ui.toast.classList.add('is-good');
        if (tone === 'warn') ui.toast.classList.add('is-warn');
        if (tone === 'danger') ui.toast.classList.add('is-danger-text');
        ui.toast.textContent = message;
        clearTimeout(state.toastTimer);
        state.toastTimer = window.setTimeout(() => {
            ui.toast.className = 'cm-toast';
        }, 1800);
    }

    async function copyText(value, successText) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                showToast(successText, 'good');
                return true;
            }
        } catch (error) {}
        let copied = false;
        try {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.setAttribute('readonly', 'true');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            copied = !!document.execCommand?.('copy');
            textarea.remove();
        } catch (error) {}
        if (copied) {
            showToast(successText, 'good');
            return true;
        }
        showToast(text('复制失败，请手动长按复制。', 'Copy failed. Please long-press and copy manually.'), 'warn');
        return false;
    }

    function readLang() {
        try {
            return localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh';
        } catch (error) {
            return 'zh';
        }
    }

    function getTodayStamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function localize(value) {
        if (!value || typeof value !== 'object') return String(value || '');
        return state.lang === 'en' ? (value.en || value.zh || '') : (value.zh || value.en || '');
    }

    function text(zh, en) {
        return state.lang === 'en' ? en : zh;
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        if (number >= 1000000) return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
        if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
        return String(Math.round(number));
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function randomFrom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }
}());
