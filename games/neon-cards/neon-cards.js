(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_neon_cards_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const PAYMENT_NETWORK = 'TRON (TRC20)';
    const PAYMENT_WALLET = 'TRiNCMEiH8ev31PbgN9ZCUkw48yFqF8boW';
    const PAYMENT_ORDER_EXPIRY_MS = 15 * 60 * 1000;
    const PAYMENT_TXID_RE = /^[a-fA-F0-9]{64}$/;

    const config = window.GENESIS_NEON_CARDS_CONFIG;
    if (!config) return;

    const tabMap = Object.fromEntries(config.tabs.map((item) => [item.id, item]));
    const chapterMap = Object.fromEntries(config.chapters.map((item) => [item.id, item]));
    const leaderMap = Object.fromEntries(config.leaders.map((item) => [item.id, item]));
    const unitMap = Object.fromEntries(config.units.map((item) => [item.id, item]));
    const tacticMap = Object.fromEntries(config.tactics.map((item) => [item.id, item]));
    const researchMap = Object.fromEntries(config.research.map((item) => [item.id, item]));
    const shopMap = Object.fromEntries(config.shopItems.map((item) => [item.id, item]));
    const offerMap = Object.fromEntries(config.paymentOffers.map((item) => [item.id, item]));
    const allCardIds = [...config.leaders.map((item) => item.id), ...config.units.map((item) => item.id), ...config.tactics.map((item) => item.id)];

    const state = {
        lang: readLang(),
        save: loadSave(),
        tab: 'clash',
        battle: null,
        battleLoopId: 0,
        modal: null,
        toastTimer: 0
    };

    const ui = {};

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        state.tab = tabMap[state.save.tab] ? state.save.tab : 'clash';
        cacheUi();
        bindEvents();
        resetFreeClashWindow();
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
                renderAll();
            });
        });

        ui.tabBar.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            const nextTab = button.dataset.tab;
            if (!tabMap[nextTab]) return;
            if (state.battle?.active && nextTab !== 'clash') {
                showToast(text('A clash is active. Finish or retreat first.', 'A clash is active. Finish or retreat first.'), 'warning');
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

        document.addEventListener('visibilitychange', () => {
            if (!state.battle?.active) return;
            state.battle.pausedByVisibility = document.hidden;
            if (!document.hidden) {
                markBattleNotice(text('已返回战斗。', 'Back in battle.'), 'good');
                renderClashRuntime();
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
                if (state.battle?.active && value !== 'clash') {
                    showToast(text('A clash is active. Finish or retreat first.', 'A clash is active. Finish or retreat first.'), 'warning');
                    break;
                }
                if (tabMap[value]) {
                    state.tab = value;
                    state.save.tab = value;
                    saveProgress();
                    renderAll();
                }
                break;
            case 'selectChapter':
                selectChapter(value);
                break;
            case 'startClash':
                startClash();
                break;
            case 'selectBattleCard':
                selectBattleCard(value);
                break;
            case 'playBattleCard':
                playBattleCard(value);
                break;
            case 'useLeaderSkill':
                useLeaderSkill();
                break;
            case 'chooseBattleBoost':
                chooseBattleBoost(value);
                break;
            case 'retreatBattle':
                retreatBattle();
                break;
            case 'closeBattleResult':
                closeBattleResult(value);
                break;
            case 'closeBattleResultOpenTab':
                closeBattleResultWithTab('', value);
                break;
            case 'openResultChapter':
                openResultChapter(value);
                break;
            case 'setLeader':
                setLeader(value);
                break;
            case 'toggleUnit':
                toggleUnit(value);
                break;
            case 'setTactic':
                setTactic(value);
                break;
            case 'upgradeCard':
                upgradeCard(type, value);
                break;
            case 'promoteCard':
                promoteCard(type, value);
                break;
            case 'upgradeResearch':
                upgradeResearch(value);
                break;
            case 'claimMission':
                claimMission(value);
                break;
            case 'claimSeason':
                claimSeason('free', value);
                break;
            case 'claimPremiumSeason':
                claimSeason('premium', value);
                break;
            case 'claimDailySupply':
                claimDailySupply();
                break;
            case 'buyShopItem':
                buyShopItem(value);
                break;
            case 'openCrate':
                openCrate(value);
                break;
            case 'previewOffer':
                previewOffer(value);
                break;
            case 'createOfferOrder':
                createOfferOrder(value);
                break;
            case 'verifyOfferTxid':
                verifyOfferTxid(value);
                break;
            case 'cancelOfferOrder':
                cancelOfferOrder(value);
                break;
            case 'copyOfferAddress':
                copyOfferAddress();
                break;
            case 'copyOfferAmount':
                copyOfferAmount(value);
                break;
            case 'closeModal':
                closeModal();
                break;
            default:
                break;
        }
    }

    function renderAll() {
        document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
        document.body.dataset.neonTab = state.tab;
        document.body.dataset.neonLive = state.battle?.active ? '1' : '0';
        renderTexts();
        renderResourceStrip();
        renderHeroSummary();
        renderTabBar();
        renderPanel();
        renderModal();
    }

    function renderTexts() {
        if (ui.backLink) ui.backLink.textContent = text('← 返回大厅', '← Back To Hub');
        if (ui.heroEyebrow) ui.heroEyebrow.textContent = text('创世·霓虹卡牌', 'Genesis Neon Cards');
        if (ui.heroTitle) ui.heroTitle.textContent = localize(config.meta.title);
        if (ui.heroSubtitle) ui.heroSubtitle.textContent = localize(config.meta.subtitle);
        document.title = state.lang === 'en' ? 'Neon Cards' : '霓虹卡牌';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute('content', text('霓虹卡牌 - 单线起步、逐章扩线的实时卡战，搭配卡组养成与赛季成长。', 'Neon Cards - A live card battler that starts single-lane and expands chapter by chapter, with deck growth and season progression.'));
        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) langToggle.setAttribute('aria-label', text('语言切换', 'Language'));
        if (ui.tabBar) ui.tabBar.setAttribute('aria-label', text('霓虹卡牌页签', 'Neon Cards tabs'));
        if (ui.modalCloseBtn) ui.modalCloseBtn.setAttribute('aria-label', text('关闭弹窗', 'Close modal'));

        ui.langButtons.forEach((button) => {
            const active = (button.dataset.langSwitch === 'en' ? 'en' : 'zh') === state.lang;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function renderResourceStrip() {
        if (!ui.resourceStrip) return;
        const items = [
            { icon: '&#9679;', label: text('Credits', 'Credits'), value: formatCompact(state.save.credits), meta: text('Upgrades / Entry', 'Upgrades / Entry') },
            { icon: '&#10022;', label: text('Cores', 'Cores'), value: formatCompact(state.save.tactCores), meta: text('Stars / Crates', 'Stars / Crates') },
            { icon: '&#9671;', label: text('Chips', 'Chips'), value: formatCompact(state.save.cipherChips), meta: text('Research / Awaken', 'Research / Awaken') },
            { icon: '&#10039;', label: text('Season XP', 'Season XP'), value: formatCompact(state.save.seasonXp), meta: text('Season Track', 'Season Track') }
        ];
        ui.resourceStrip.innerHTML = items.map(renderResourcePill).join('');
    }

    function legacyRenderHeroSummary() {
        if (!ui.heroSummary) return;
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const gap = Math.max(0, chapter.recommended - power);
        const freeLeft = getRemainingFreeClashes();
        ui.heroSummary.innerHTML = `
            <div class="nc-summary-grid">
                ${renderSummaryItem('&#10022;', text('Current Stage', 'Current Stage'), `${chapter.id} • ${localize(chapter.name)}`)}
                ${renderSummaryItem('&#9889;', text('Power', 'Power'), `${power} / ${chapter.recommended}`)}
                ${renderSummaryItem('&#9888;', text('Gap', 'Gap'), gap > 0 ? `-${formatCompact(gap)}` : text('Ready', 'Ready'))}
                ${renderSummaryItem('&#9655;', text('Free Clashes', 'Free Clashes'), `${freeLeft}/${getDailyFreeClashesLimit()}`)}
            </div>
        `;
    }

    function renderTabBar() {
        if (!ui.tabBar) return;
        ui.tabBar.innerHTML = config.tabs.map((tab) => `
            <button class="nc-tab-btn ${tab.id === state.tab ? 'is-active' : ''}" type="button" data-tab="${tab.id}">
                <span class="nc-tab-icon" aria-hidden="true">${getTabIcon(tab.id)}</span>
                <span>${escapeHtml(localize(tab.label))}</span>
            </button>
        `).join('');
    }

    function renderPanel() {
        if (!ui.panelContent) return;
        if (state.tab === 'clash') {
            ui.panelContent.innerHTML = renderClashTab();
            return;
        }
        if (state.tab === 'deck') {
            ui.panelContent.innerHTML = renderDeckTab();
            return;
        }
        if (state.tab === 'lab') {
            ui.panelContent.innerHTML = renderLabTab();
            return;
        }
        if (state.tab === 'missions') {
            ui.panelContent.innerHTML = renderMissionsTab();
            return;
        }
        if (state.tab === 'season') {
            ui.panelContent.innerHTML = renderSeasonTab();
            return;
        }
        if (state.tab === 'shop') {
            ui.panelContent.innerHTML = renderShopTab();
        }
    }

    function legacyRenderClashTab() {
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const gap = chapter.recommended - power;
        const unitIds = state.save.selectedUnits;
        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10022;', localize(chapter.name), chapter.id)}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('先用单路线学会出兵与技能，再逐章开放更多路线。你需要在有限能量内守住核心并压穿敌方路线。', 'Learn deployment and skills in a single lane first, then unlock more lanes chapter by chapter. Manage limited energy, hold your core, and break through the enemy route.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${gap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(text('Recommended', 'Recommended'))}</span>
                        <strong>${escapeHtml(`${power} / ${chapter.recommended}`)}</strong>
                    </div>
                </div>

                ${battle ? '' : `
                    <div class="nc-chip-row">
                        ${config.chapters.map((item, index) => renderChapterChip(item, index)).join('')}
                    </div>

                    ${renderFlowStrip('clash', { chapter, gap })}
                `}
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Tri-Lane Preview', 'Tri-Lane Preview'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('当前对战会随章节逐步开放路线：先学单线，再到双线、三线。手牌部署、战术释放、首领压力与中途强化都会直接影响结算。', 'The clash expands lanes by chapter: single lane first, then two lanes, then full three-lane combat. Hand deployment, tactics, boss pressure, and mid-battle boosts all directly affect the result.'))}</div>
                    </div>
                </div>

                <div class="nc-board-grid">
                    ${renderLaneCard(text('Top Lane', 'Top Lane'), unitIds[0], chapter, power, 0.94)}
                    ${renderLaneCard(text('Mid Lane', 'Mid Lane'), unitIds[1], chapter, power, 1)}
                    ${renderLaneCard(text('Bot Lane', 'Bot Lane'), unitIds[2], chapter, power, 1.08)}
                </div>

                <div class="nc-hand-row">
                    ${unitIds.map((unitId) => renderHandCard(unitMap[unitId], 'unit')).join('')}
                    ${renderHandCard(tacticMap[state.save.selectedTacticId], 'tactic')}
                </div>

                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="startClash">${escapeHtml(getStartClashLabel(chapter))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('Open Deck', 'Open Deck'))}</button>
                </div>
            </section>

            ${state.save.lastResult ? renderLastResultCard() : ''}
        `;
    }

    function renderDeckTab() {
        const leader = leaderMap[state.save.selectedLeaderId];
        return `
            <section class="nc-card nc-card--compact">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9992;', text('Current Lineup', 'Current Lineup'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('1 队长、3 单位、1 战术。先练成一套主力。', '1 leader, 3 units, 1 tactic. Finish one core deck before building a second setup.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag is-good">${escapeHtml(text('Power', 'Power'))}</span>
                        <strong>${escapeHtml(String(getDeckPower()))}</strong>
                    </div>
                </div>

                <div class="nc-lineup-grid">
                    ${renderSlotCard(text('Leader', 'Leader'), leader ? localize(leader.name) : '--', leader ? `${text('Lv', 'Lv')}.${getCardLevel('leader', leader.id)} • ${getStarsText(getCardStar('leader', leader.id))}` : '--')}
                    ${state.save.selectedUnits.map((unitId, index) => renderSlotCard(`${text('Unit', 'Unit')} ${index + 1}`, localize(unitMap[unitId]?.name || '--'), unitId ? `${text('Lv', 'Lv')}.${getCardLevel('unit', unitId)} • ${getStarsText(getCardStar('unit', unitId))}` : '--')).join('')}
                    ${renderSlotCard(text('Tactic', 'Tactic'), localize(tacticMap[state.save.selectedTacticId]?.name || '--'), state.save.selectedTacticId ? `${text('Lv', 'Lv')}.${getCardLevel('tactic', state.save.selectedTacticId)}` : '--')}
                </div>

                <div class="nc-wallet-strip">
                    ${renderWalletPill('&#9679;', text('Credits', 'Credits'), formatCompact(state.save.credits), text('Upgrades / Shop', 'Upgrades / Shop'))}
                    ${renderWalletPill('&#10022;', text('Cores', 'Cores'), formatCompact(state.save.tactCores), text('Stars / Crates', 'Stars / Crates'))}
                    ${renderWalletPill('&#9671;', text('Chips', 'Chips'), formatCompact(state.save.cipherChips), text('Research / High Stars', 'Research / High Stars'))}
                    ${renderWalletPill('&#9638;', text('Crates', 'Crates'), `${state.save.inventory.standardCrates} / ${state.save.inventory.eliteCrates}`, text('Standard / Elite', 'Standard / Elite'))}
                </div>

                ${renderQuickActions([
                    { label: text('Go Lab', 'Go Lab'), action: 'openTab', value: 'lab', tone: 'ghost' },
                    { label: text('Open Shop', 'Open Shop'), action: 'openTab', value: 'shop', tone: 'ghost' },
                    { label: text('Open Crate', 'Open Crate'), action: 'openCrate', value: 'standard', disabled: state.save.inventory.standardCrates <= 0 }
                ])}
            </section>

            <section class="nc-card nc-card--compact">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Leaders', 'Leaders'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('队长决定全队节奏，只能上阵 1 名。', 'Your leader sets the pace of the whole lineup. Only one can be active.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid nc-card-grid--mobile-scroll">
                    ${config.leaders.map(renderLeaderCard).join('')}
                </div>
            </section>

            <section class="nc-card nc-card--compact">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Units', 'Units'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('推荐 1 前排 + 1 输出 + 1 辅助/收割。', 'A strong base shape is 1 tank, 1 damage, and 1 support or finisher.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid nc-card-grid--mobile-scroll">
                    ${config.units.map(renderUnitCard).join('')}
                </div>
            </section>

            <section class="nc-card nc-card--compact">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9889;', text('Tactics', 'Tactics'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('当前只装 1 张战术，负责爆发、补盾或解场。', 'You equip 1 tactic card for burst, shielding, or lane-breaking plays.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid nc-card-grid--mobile-scroll">
                    ${config.tactics.map(renderTacticCard).join('')}
                </div>
            </section>

            <section class="nc-card nc-card--compact">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', text('Crate Station', 'Crate Station'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('先开包补碎片，不够再用核心和金币追进度。', 'Open crates for fragments first, then use cores and credits to patch the rest.'))}</div>
                    </div>
                </div>
                <div class="nc-stat-grid">
                    ${renderStatBox(text('Standard', 'Standard'), String(state.save.inventory.standardCrates), text('Regular fragments', 'Regular fragments'))}
                    ${renderStatBox(text('Elite', 'Elite'), String(state.save.inventory.eliteCrates), text('Higher rarity / big fragments', 'Higher rarity / big fragments'))}
                </div>
                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="openCrate" data-value="standard" ${state.save.inventory.standardCrates > 0 ? '' : 'disabled'}>${escapeHtml(text('Open Standard Crate', 'Open Standard Crate'))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="openCrate" data-value="elite" ${state.save.inventory.eliteCrates > 0 ? '' : 'disabled'}>${escapeHtml(text('Open Elite Crate', 'Open Elite Crate'))}</button>
                </div>
            </section>
        `;
    }

    function renderLabTab() {
        return `
            <section class="nc-card nc-card--compact">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10070;', text('Permanent Lab', 'Permanent Lab'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('研究永久强化能量、前排、后排、战术与收益。', 'Research permanently boosts energy, frontline, backline, tactics, and income.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag">${escapeHtml(text('Total Lv', 'Total Lv'))}</span>
                        <strong>${escapeHtml(String(getTotalResearchLevels()))}</strong>
                    </div>
                </div>
                ${renderQuickActions([
                    { label: text('Go Clash', 'Go Clash'), action: 'openTab', value: 'clash', tone: 'ghost' },
                    { label: text('Open Deck', 'Open Deck'), action: 'openTab', value: 'deck', tone: 'ghost' }
                ])}
                <div class="nc-card-grid nc-card-grid--mobile-scroll">
                    ${config.research.map(renderResearchCard).join('')}
                </div>
            </section>
        `;
    }

    function renderMissionsTab() {
        const missions = config.missions.map((mission, index) => {
            const progress = getMissionProgress(mission.metric);
            const claimed = state.save.missionClaimed.includes(mission.id);
            const ready = !claimed && progress >= mission.target;
            const ratio = mission.target > 0 ? Math.min(1, progress / mission.target) : 0;
            return { mission, index, progress, claimed, ready, ratio };
        }).sort((left, right) => {
            const leftRank = left.ready ? 0 : left.claimed ? 2 : 1;
            const rightRank = right.ready ? 0 : right.claimed ? 2 : 1;
            if (leftRank !== rightRank) return leftRank - rightRank;
            if (left.ratio !== right.ratio) return right.ratio - left.ratio;
            return left.index - right.index;
        });
        const readyMissions = missions.filter((item) => item.ready);
        const activeMissions = missions.filter((item) => !item.ready && !item.claimed).slice(0, 4);
        const claimedCount = missions.filter((item) => item.claimed).length;

        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Protocol Missions', 'Protocol Missions'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('This page only keeps claimable, near-finished, and milestone missions to avoid long mobile scrolling.', 'This page only keeps claimable, near-finished, and milestone missions to avoid long mobile scrolling.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${getClaimableMissionCount() ? 'is-good' : ''}">${escapeHtml(text('Ready', 'Ready'))}</span>
                        <strong>${escapeHtml(String(getClaimableMissionCount()))}</strong>
                    </div>
                </div>
                ${renderQuickActions([
                    { label: text('Go Clash', 'Go Clash'), action: 'openTab', value: 'clash', tone: 'ghost' },
                    { label: text('Open Deck', 'Open Deck'), action: 'openTab', value: 'deck', tone: 'ghost' }
                ])}
                <div class="nc-wallet-strip">
                    ${renderWalletPill('&#9733;', text('Ready', 'Ready'), String(readyMissions.length), text('Claim now', 'Claim now'))}
                    ${renderWalletPill('&#9201;', text('In Progress', 'In Progress'), String(missions.filter((item) => !item.ready && !item.claimed).length), text('Closest tasks', 'Closest tasks'))}
                    ${renderWalletPill('&#10003;', text('Claimed', 'Claimed'), `${claimedCount}/${missions.length}`, text('Total done', 'Total done'))}
                </div>
                ${state.save.lastResult ? renderLastResultCard() : ''}
                ${readyMissions.length ? `
                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9733;', text('Ready Now', 'Ready Now'))}</h3>
                            </div>
                            <span class="nc-tag is-good">${escapeHtml(String(readyMissions.length))}</span>
                        </div>
                        <div class="nc-card-grid nc-card-grid--scroll">
                            ${readyMissions.map(({ mission, progress, claimed, ready }) => renderMissionCard(mission, progress, claimed, ready)).join('')}
                        </div>
                    </article>
                ` : ''}
                ${activeMissions.length ? `
                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9201;', text('Up Next', 'Up Next'))}</h3>
                            </div>
                            <span class="nc-tag">${escapeHtml(text('Top 4', 'Top 4'))}</span>
                        </div>
                        <div class="nc-card-grid nc-card-grid--scroll">
                            ${activeMissions.map(({ mission, progress, claimed, ready }) => renderMissionCard(mission, progress, claimed, ready)).join('')}
                        </div>
                    </article>
                ` : ''}
                ${!readyMissions.length && !activeMissions.length ? `<div class="nc-inline-note">${escapeHtml(text('当前任务已全部完成，等待新的进度推进。', 'All current missions are complete. Push more progress to unlock the next rewards.'))}</div>` : ''}
            </section>
        `;
    }

    function renderSeasonTab() {
        const freeTrack = getSeasonTrackState('free');
        const premiumTrack = getSeasonTrackState('premium');
        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10039;', text('Season Route', 'Season Route'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('对战、开包、升级与击败首领都会累计赛季进度；免费与赞助双轨奖励会按经验节点逐步解锁。', 'Matches, crate opens, upgrades, and boss wins all feed the season; both free and sponsor tracks unlock step by step as your XP grows.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${getClaimableSeasonCount() ? 'is-good' : ''}">${escapeHtml(text('Season XP', 'Season XP'))}</span>
                        <strong>${escapeHtml(String(state.save.seasonXp))}</strong>
                    </div>
                </div>
                ${renderQuickActions([
                    { label: text('Go Clash', 'Go Clash'), action: 'openTab', value: 'clash', tone: 'ghost' },
                    { label: isSeasonPassUnlocked() ? text('Open Shop', 'Open Shop') : text('Unlock Pass', 'Unlock Pass'), action: isSeasonPassUnlocked() ? 'openTab' : 'previewOffer', value: isSeasonPassUnlocked() ? 'shop' : 'starter', tone: 'ghost' }
                ])}
                <div class="nc-wallet-strip">
                    ${renderWalletPill('&#10039;', text('Season XP', 'Season XP'), String(state.save.seasonXp), text('Current total', 'Current total'))}
                    ${renderWalletPill('&#9733;', text('Ready', 'Ready'), String(getClaimableSeasonCount()), text('Claim now', 'Claim now'))}
                    ${renderWalletPill('&#9671;', text('Free Done', 'Free Done'), `${freeTrack.claimedCount}/${freeTrack.totalCount}`, freeTrack.nextNode ? text(`${Math.max(0, freeTrack.nextNode.xp - state.save.seasonXp)} XP left`, `${Math.max(0, freeTrack.nextNode.xp - state.save.seasonXp)} XP left`) : text('Track done', 'Track done'))}
                    ${renderWalletPill('&#9670;', text('Sponsor', 'Sponsor'), premiumTrack.locked ? text('Locked', 'Locked') : `${premiumTrack.claimedCount}/${premiumTrack.totalCount}`, premiumTrack.locked ? text('Unlock to claim', 'Unlock to claim') : premiumTrack.nextNode ? text(`${Math.max(0, premiumTrack.nextNode.xp - state.save.seasonXp)} XP left`, `${Math.max(0, premiumTrack.nextNode.xp - state.save.seasonXp)} XP left`) : text('Track done', 'Track done'))}
                </div>
                <div class="nc-two-col">
                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9733;', text('Free Track', 'Free Track'))}</h3>
                            </div>
                            <span class="nc-tag ${freeTrack.readyCount ? 'is-good' : ''}">${escapeHtml(freeTrack.readyCount ? text(`${freeTrack.readyCount} Ready`, `${freeTrack.readyCount} Ready`) : text('Queue', 'Queue'))}</span>
                        </div>
                        ${freeTrack.visibleNodes.length ? `
                            <div class="nc-track-grid nc-track-grid--scroll">
                                ${freeTrack.visibleNodes.map((node) => renderSeasonNode('free', node)).join('')}
                            </div>
                        ` : `<div class="nc-inline-note">${escapeHtml(text('免费轨奖励已经全部领完。', 'All rewards on the free track are already claimed.'))}</div>`}
                    </article>

                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9734;', text('Sponsor Track', 'Sponsor Track'))}</h3>
                            </div>
                            <span class="nc-tag ${isSeasonPassUnlocked() ? 'is-good' : 'is-warning'}">${escapeHtml(isSeasonPassUnlocked() ? text('Unlocked', 'Unlocked') : text('Payment Next', 'Payment Next'))}</span>
                        </div>
                        ${premiumTrack.visibleNodes.length ? `
                            <div class="nc-track-grid nc-track-grid--scroll">
                                ${premiumTrack.visibleNodes.map((node) => renderSeasonNode('premium', node)).join('')}
                            </div>
                        ` : `<div class="nc-inline-note">${escapeHtml(text('赞助轨奖励已经全部领完。', 'All rewards on the sponsor track are already claimed.'))}</div>`}
                    </article>
                </div>
            </section>
        `;
    }

    function renderShopTab() {
        const softItems = config.shopItems.filter((item) => item.price > 0).map(renderShopItemCard).join('');
        const premiumItems = config.paymentOffers.map(renderOfferCard).join('');
        return `
            <section class="nc-card nc-card--compact">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Supply Hub', 'Supply Hub'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('免费补给、金币追赶与充值包都在这里处理。', 'Free supply, soft-currency catch-up, and premium packs all live here.'))}</div>
                    </div>
                </div>
                ${renderQuickActions([
                    { label: canClaimDailySupply() ? text('Claim Daily', 'Claim Daily') : text('Season', 'Season'), action: canClaimDailySupply() ? 'claimDailySupply' : 'openTab', value: canClaimDailySupply() ? '' : 'season' },
                    { label: text('Open Deck', 'Open Deck'), action: 'openTab', value: 'deck', tone: 'ghost' },
                    { label: text('Season', 'Season'), action: 'openTab', value: 'season', tone: 'ghost' }
                ])}
                <div class="nc-wallet-strip">
                    ${renderWalletPill('&#9679;', text('Credits', 'Credits'), formatCompact(state.save.credits), text('Spend here', 'Spend here'))}
                    ${renderWalletPill('&#9638;', text('Crates', 'Crates'), `${state.save.inventory.standardCrates}/${state.save.inventory.eliteCrates}`, text('Std / Elite', 'Std / Elite'))}
                    ${renderWalletPill('&#9733;', text('Daily', 'Daily'), canClaimDailySupply() ? text('Ready', 'Ready') : getDailySupplyCooldownText(), canClaimDailySupply() ? text('Tap to claim', 'Tap to claim') : text('Cooldown', 'Cooldown'))}
                </div>

                <div class="nc-card-grid nc-card-grid--two nc-card-grid--mobile-scroll">
                    ${renderDailySupplyCard()}
                    ${softItems}
                </div>
            </section>

            <section class="nc-card nc-card--compact">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', text('Premium Top-Up', 'Premium Top-Up'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('创建精确订单、提交 TXID、解锁赞助轨与永久特权。', 'Create exact orders, verify TXIDs, unlock the sponsor track, and activate permanent perks.'))}</div>
                    </div>
                </div>
                ${renderPaymentStatusPanel()}
                ${renderPaymentInsightPanel()}
                <div class="nc-card-grid nc-card-grid--two nc-card-grid--mobile-scroll">
                    ${premiumItems}
                </div>
            </section>
        `;
    }

    function renderLeaderCard(leader) {
        const active = state.save.selectedLeaderId === leader.id;
        const level = getCardLevel('leader', leader.id);
        const star = getCardStar('leader', leader.id);
        const upgradeCost = getUpgradeCost('leader', leader.id);
        const starCost = getNextStarCost(star);
        const unlocked = isCardUnlocked(leader.unlockStage);
        return renderCardPanel({
            icon: '&#9733;',
            title: localize(leader.name),
            subtitle: localize(leader.role),
            badge: active ? text('Active', 'Active') : unlocked ? text('Ready', 'Ready') : text('Locked', 'Locked'),
            locked: !unlocked,
            stats: [
                { label: text('Level', 'Level'), value: `${text('Lv', 'Lv')}.${level}` },
                { label: text('Stars', 'Stars'), value: getStarsText(star) },
                { label: text('Power', 'Power'), value: String(getCardPower('leader', leader.id)) },
                { label: text('Fragments', 'Fragments'), value: String(getFragments(leader.id)) }
            ],
            note: `${localize(leader.skill)}${starCost ? ` • ${text('Next Star', 'Next Star')}: ${formatStarCost(starCost)}` : ''}`,
            actions: `
                <button class="ghost-btn" type="button" data-action="setLeader" data-value="${leader.id}" ${unlocked ? '' : 'disabled'}>${escapeHtml(active ? text('Current Leader', 'Current Leader') : text('Set Leader', 'Set Leader'))}</button>
                <button class="ghost-btn" type="button" data-action="upgradeCard" data-type="leader" data-value="${leader.id}" ${state.save.credits >= upgradeCost ? '' : 'disabled'}>${escapeHtml(`${text('Upgrade', 'Upgrade')} • ${upgradeCost}`)}</button>
                <button class="ghost-btn" type="button" data-action="promoteCard" data-type="leader" data-value="${leader.id}" ${canPromoteCard('leader', leader.id) ? '' : 'disabled'}>${escapeHtml(text('Promote', 'Promote'))}</button>
            `
        });
    }

    function renderUnitCard(unit) {
        const selected = state.save.selectedUnits.includes(unit.id);
        const level = getCardLevel('unit', unit.id);
        const star = getCardStar('unit', unit.id);
        const upgradeCost = getUpgradeCost('unit', unit.id);
        const starCost = getNextStarCost(star);
        const unlocked = isCardUnlocked(unit.unlockStage);
        return renderCardPanel({
            icon: unit.lane === 'front' ? '&#9867;' : unit.lane === 'back' ? '&#9656;' : '&#10057;',
            title: localize(unit.name),
            subtitle: `${localize(unit.role)} • ${text('Cost', 'Cost')} ${unit.cost}`,
            badge: selected ? text('Deployed', 'Deployed') : unlocked ? text('Ready', 'Ready') : text('Locked', 'Locked'),
            locked: !unlocked,
            stats: [
                { label: text('Level', 'Level'), value: `${text('Lv', 'Lv')}.${level}` },
                { label: text('Stars', 'Stars'), value: getStarsText(star) },
                { label: text('Power', 'Power'), value: String(getCardPower('unit', unit.id)) },
                { label: text('Fragments', 'Fragments'), value: String(getFragments(unit.id)) }
            ],
            note: `${text('Lane', 'Lane')}: ${getUnitLaneText(unit.lane)}${starCost ? ` • ${text('Next Star', 'Next Star')}: ${formatStarCost(starCost)}` : ''}`,
            actions: `
                <button class="ghost-btn" type="button" data-action="toggleUnit" data-value="${unit.id}" ${unlocked ? '' : 'disabled'}>${escapeHtml(selected ? text('Remove', 'Remove') : text('Deploy', 'Deploy'))}</button>
                <button class="ghost-btn" type="button" data-action="upgradeCard" data-type="unit" data-value="${unit.id}" ${state.save.credits >= upgradeCost ? '' : 'disabled'}>${escapeHtml(`${text('Upgrade', 'Upgrade')} • ${upgradeCost}`)}</button>
                <button class="ghost-btn" type="button" data-action="promoteCard" data-type="unit" data-value="${unit.id}" ${canPromoteCard('unit', unit.id) ? '' : 'disabled'}>${escapeHtml(text('Promote', 'Promote'))}</button>
            `
        });
    }

    function renderTacticCard(tactic) {
        const active = state.save.selectedTacticId === tactic.id;
        const level = getCardLevel('tactic', tactic.id);
        const star = getCardStar('tactic', tactic.id);
        const upgradeCost = getUpgradeCost('tactic', tactic.id);
        const starCost = getNextStarCost(star);
        const unlocked = isCardUnlocked(tactic.unlockStage);
        return renderCardPanel({
            icon: '&#9889;',
            title: localize(tactic.name),
            subtitle: `${localize(tactic.role)} • ${text('Cost', 'Cost')} ${tactic.cost}`,
            badge: active ? text('Active', 'Active') : unlocked ? text('Ready', 'Ready') : text('Locked', 'Locked'),
            locked: !unlocked,
            stats: [
                { label: text('Level', 'Level'), value: `${text('Lv', 'Lv')}.${level}` },
                { label: text('Stars', 'Stars'), value: getStarsText(star) },
                { label: text('Power', 'Power'), value: String(getCardPower('tactic', tactic.id)) },
                { label: text('Fragments', 'Fragments'), value: String(getFragments(tactic.id)) }
            ],
            note: `${text('Impact', 'Impact')}: x${(tactic.stats.impact || 1).toFixed(2)}${starCost ? ` • ${text('Next Star', 'Next Star')}: ${formatStarCost(starCost)}` : ''}`,
            actions: `
                <button class="ghost-btn" type="button" data-action="setTactic" data-value="${tactic.id}" ${unlocked ? '' : 'disabled'}>${escapeHtml(active ? text('Current Tactic', 'Current Tactic') : text('Equip', 'Equip'))}</button>
                <button class="ghost-btn" type="button" data-action="upgradeCard" data-type="tactic" data-value="${tactic.id}" ${state.save.credits >= upgradeCost ? '' : 'disabled'}>${escapeHtml(`${text('Upgrade', 'Upgrade')} • ${upgradeCost}`)}</button>
                <button class="ghost-btn" type="button" data-action="promoteCard" data-type="tactic" data-value="${tactic.id}" ${canPromoteCard('tactic', tactic.id) ? '' : 'disabled'}>${escapeHtml(text('Promote', 'Promote'))}</button>
            `
        });
    }

    function renderResearchCard(research) {
        const level = getResearchLevel(research.id);
        const maxed = level >= research.maxLevel;
        const cost = getResearchCost(research.id);
        return renderCardPanel({
            icon: '&#10070;',
            title: localize(research.name),
            subtitle: `${text('Lv', 'Lv')}.${level}/${research.maxLevel}`,
            badge: maxed ? text('Max', 'Max') : formatResearchCost(cost, true),
            stats: [
                { label: text('Current', 'Current'), value: getResearchEffectText(research.id, level) },
                { label: text('Next Cost', 'Next Cost'), value: maxed ? text('Maxed', 'Maxed') : formatResearchCost(cost) }
            ],
            note: `${localize(research.desc)} • ${localize(research.effect)}`,
            actions: `
                <button class="primary-btn" type="button" data-action="upgradeResearch" data-value="${research.id}" ${!maxed && canUpgradeResearch(research.id) ? '' : 'disabled'}>${escapeHtml(maxed ? text('Maxed', 'Maxed') : text('Upgrade Research', 'Upgrade Research'))}</button>
            `
        });
    }

    function renderMissionCard(mission, progress, claimed, ready) {
        return `
            <article class="nc-card-item nc-card-item--dense ${ready ? 'is-ready' : ''} ${claimed ? 'is-claimed' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(claimed ? '&#10003;' : ready ? '&#9733;' : '&#9679;', localize(mission.title), `${progress}/${mission.target}`)}</h3>
                    </div>
                    <span class="nc-tag ${ready ? 'is-good' : ''}">${escapeHtml(claimed ? text('Claimed', 'Claimed') : ready ? text('Ready', 'Ready') : `${progress}/${mission.target}`)}</span>
                </div>
                <div class="nc-progress"><div class="nc-progress-fill" style="width:${Math.min(100, (progress / mission.target) * 100)}%"></div></div>
                ${renderRewardPills(mission.reward)}
                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="claimMission" data-value="${mission.id}" ${ready ? '' : 'disabled'}>${escapeHtml(claimed ? text('Claimed', 'Claimed') : text('Claim Reward', 'Claim Reward'))}</button>
                </div>
            </article>
        `;
    }

    function renderSeasonNode(track, node) {
        const key = `${track}:${node.id}`;
        const ready = state.save.seasonXp >= node.xp;
        const claimed = (track === 'premium' ? state.save.premiumSeasonClaimed : state.save.seasonClaimed).includes(key);
        const locked = track === 'premium' && !isSeasonPassUnlocked();
        const action = locked ? 'previewOffer' : track === 'premium' ? 'claimPremiumSeason' : 'claimSeason';
        const actionValue = locked ? 'starter' : node.id;
        const disabled = !locked && (!ready || claimed);
        return `
            <article class="nc-track-card nc-card-item--dense ${ready && !claimed && !locked ? 'is-ready' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(track === 'premium' ? '&#9734;' : '&#9733;', `${track === 'premium' ? text('Sponsor', 'Sponsor') : text('Free', 'Free')} ${node.id.toUpperCase()}`)}</h3>
                    </div>
                    <span class="nc-tag ${ready && !locked ? 'is-good' : locked ? 'is-warning' : ''}">${escapeHtml(claimed ? text('Claimed', 'Claimed') : `${node.xp} XP`)}</span>
                </div>
                ${renderRewardPills(node.reward)}
                <div class="nc-action-row">
                    <button class="ghost-btn wide-btn" type="button" data-action="${action}" data-value="${actionValue}" ${disabled ? 'disabled' : ''}>${escapeHtml(locked ? text('Unlock Pass', 'Unlock Pass') : claimed ? text('Claimed', 'Claimed') : text('Claim', 'Claim'))}</button>
                </div>
            </article>
        `;
    }

    function renderDailySupplyCard() {
        const ready = canClaimDailySupply();
        return `
            <article class="nc-card-item nc-card-item--dense ${ready ? 'is-ready' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Daily Free Supply', 'Daily Free Supply'))}</h3>
                    </div>
                    <span class="nc-tag ${ready ? 'is-good' : ''}">${escapeHtml(ready ? text('Ready', 'Ready') : getDailySupplyCooldownText())}</span>
                </div>
                ${renderRewardPills(shopMap.dailySupply.reward)}
                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="claimDailySupply" ${ready ? '' : 'disabled'}>${escapeHtml(text('Claim Supply', 'Claim Supply'))}</button>
                </div>
            </article>
        `;
    }

    function renderShopItemCard(item) {
        return `
            <article class="nc-card-item nc-card-item--dense">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', localize(item.title))}</h3>
                    </div>
                    <span class="nc-tag">${escapeHtml(`${item.price} Cr`)}</span>
                </div>
                ${renderRewardPills(item.reward)}
                <div class="nc-action-row">
                    <button class="ghost-btn wide-btn" type="button" data-action="buyShopItem" data-value="${item.id}" ${state.save.credits >= item.price ? '' : 'disabled'}>${escapeHtml(text('Buy Now', 'Buy Now'))}</button>
                </div>
            </article>
        `;
    }

    function renderPaymentStatusPanel() {
        const pending = getPendingPaymentOrder();
        const hasLivePending = !!(pending && !isPaymentOrderExpired(pending));
        const pass = isSeasonPassUnlocked();
        const extraFree = getPaymentFreeClashBonus();
        return `
            <div class="nc-stat-grid">
                ${renderStatBox(text('Spent', 'Spent'), `${formatPaymentAmount(state.save.payment.totalSpent)} USDT`, text('Lifetime verified', 'Lifetime verified'))}
                ${renderStatBox(text('Orders', 'Orders'), String(state.save.payment.purchaseCount || 0), hasLivePending ? text('1 pending', '1 pending') : text('No pending order', 'No pending order'))}
                ${renderStatBox(text('Sponsor Pass', 'Sponsor Pass'), pass ? text('Unlocked', 'Unlocked') : text('Locked', 'Locked'), pass ? text('Premium season ready', 'Premium season ready') : text('Unlocked on first top-up', 'Unlocked on first top-up'))}
                ${renderStatBox(text('Daily Free', 'Daily Free'), String(getDailyFreeClashesLimit()), extraFree ? text(`+${extraFree} from Tactical Pack`, `+${extraFree} from Tactical Pack`) : text('Base quota only', 'Base quota only'))}
            </div>
        `;
    }

    function renderPaymentInsightPanel() {
        const chapter = getSelectedChapter();
        const checkpoint = getGrowthCheckpointSummary(chapter);
        const paymentFit = getPaymentFitSummary(chapter, Math.max(0, chapter.recommended - getDeckPower()));
        const activePerks = getActivePaymentPerkTexts();
        return `
            <div class="nc-card-grid nc-card-grid--two nc-card-grid--mobile-scroll">
                <article class="nc-card-item nc-card-item--dense">
                    <div class="nc-card-head">
                        <div>
                            <h3>${renderIconLabel('&#10022;', text('生效特权', 'Active Perks'))}</h3>
                        </div>
                        <span class="nc-tag ${activePerks.length ? 'is-good' : ''}">${escapeHtml(activePerks.length ? `${activePerks.length}/${config.paymentOffers.length}` : text('None', 'None'))}</span>
                    </div>
                    <div class="nc-inline-note">${escapeHtml(activePerks.length ? activePerks.join(' • ') : text('当前还没有永久充值特权生效。', 'No permanent top-up perks are active yet.'))}</div>
                </article>
                <article class="nc-card-item nc-card-item--dense">
                    <div class="nc-card-head">
                        <div>
                            <h3>${renderIconLabel('&#9888;', text('当前卡点', 'Current Wall'))}</h3>
                        </div>
                        <span class="nc-tag ${paymentFit.urgent ? 'is-warning' : 'is-good'}">${escapeHtml(paymentFit.label)}</span>
                    </div>
                    <div class="nc-inline-note">${escapeHtml(checkpoint.focus)}</div>
                    <div class="nc-note-mini">${escapeHtml(paymentFit.detail)}</div>
                </article>
            </div>
        `;
    }

    function renderOfferCard(offer) {
        const owned = isOfferOwned(offer.id);
        const pendingOrder = getPendingPaymentOrder(offer.id);
        const hasLiveOrder = !!(pendingOrder && !isPaymentOrderExpired(pendingOrder));
        const fitHint = getOfferFitHint(offer.id);
        const badge = owned
            ? text('Claimed', 'Claimed')
            : hasLiveOrder
                ? text('Pending', 'Pending')
                : `${offer.price} USDT`;
        return `
            <article class="nc-card-item nc-card-item--dense is-premium ${owned ? 'is-ready' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', localize(offer.name))}</h3>
                    </div>
                    <span class="nc-tag ${owned ? 'is-good' : hasLiveOrder ? 'is-warning' : 'is-good'}">${escapeHtml(badge)}</span>
                </div>
                ${renderRewardPills(offer.reward)}
                <div class="nc-inline-note">${escapeHtml(localize(offer.permanent))}</div>
                ${fitHint ? `<div class="nc-note-mini">${escapeHtml(fitHint)}</div>` : ''}
                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="previewOffer" data-value="${offer.id}">${escapeHtml(owned ? text('View Rewards', 'View Rewards') : hasLiveOrder ? text('Resume Order', 'Resume Order') : text('Create Order', 'Create Order'))}</button>
                </div>
            </article>
        `;
    }

    function renderLastResultCard() {
        const result = state.save.lastResult;
        const targetChapterId = result.win && result.nextChapterId ? result.nextChapterId : result.chapterId;
        const totalLanes = Math.max(1, Number(result.totalLanes) || getBattleLaneIdsForChapter(chapterMap[result.chapterId]).length);
        return `
            <section class="nc-card nc-card--compact">
                <div class="nc-result-hero">
                    <div>
                        <div class="eyebrow">${escapeHtml(text('最近战报', 'Latest Report'))}</div>
                        <h3>${escapeHtml(`${result.chapterId} • ${localize(chapterMap[result.chapterId]?.name || result.chapterId)}`)}</h3>
                        <div class="nc-card-copy">${escapeHtml(result.win ? text('本次推进已完成，下一步建议去卡组或研究补当前卡点。', 'This run is complete. Next, patch your current wall in Deck or Lab.') : text('本次未通关，但仍拿到了部分资源，优先补强关键卡位。', 'This run did not clear, but you still earned partial resources. Patch your key slots first.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${result.win ? 'is-good' : 'is-warning'}">${escapeHtml(result.win ? text('胜利', 'Win') : text('撤退', 'Retreat'))}</span>
                        <strong>${escapeHtml(`${result.laneWins || 0}/${totalLanes}`)}</strong>
                    </div>
                </div>
                <div class="nc-stat-grid">
                    ${renderStatBox(text('路线优势', 'Lane Edge'), `${result.laneWins || 0}/${totalLanes}`, text('获胜路线', 'Won lanes'))}
                    ${renderStatBox(text('用时', 'Time'), formatBattleTime(result.timeUsed || 0))}
                    ${renderStatBox(text('我方核心', 'Ally Core'), `${Math.max(0, Number(result.allyCorePercent) || 0)}%`)}
                    ${renderStatBox(text('敌方核心', 'Enemy Core'), `${Math.max(0, Number(result.enemyCorePercent) || 0)}%`)}
                </div>
                <article class="nc-result-card nc-result-card--compact">
                    <div class="nc-card-head">
                        <div>
                            <h3>${renderIconLabel('&#9733;', text('本局奖励', 'Run Rewards'))}</h3>
                        </div>
                    </div>
                    ${renderRewardPills(result.reward)}
                    ${result.firstClearReward ? `
                        <div class="nc-inline-note">
                            <strong>${escapeHtml(text('首通加成', 'First Clear Bonus'))}</strong>
                            ${renderRewardPills(result.firstClearReward)}
                        </div>
                    ` : result.firstClear ? `<div class="nc-inline-note">${escapeHtml(text('首通奖励已领取。', 'First clear reward secured.'))}</div>` : ''}
                    ${result.fragments?.length ? `<div class="nc-inline-note">${escapeHtml(formatFragmentSummary(result.fragments))}</div>` : ''}
                </article>
                ${renderBattleFollowupCard(result, { compact: true })}
                <div class="nc-result-actions">
                    <button class="primary-btn wide-btn" type="button" data-action="openResultChapter" data-value="${escapeHtml(targetChapterId)}">${escapeHtml(result.win && result.nextChapterId ? text(`进入 ${result.nextChapterId}`, `Open ${result.nextChapterId}`) : text('返回对战', 'Open Clash'))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('调整卡组', 'Tune Deck'))}</button>
                </div>
            </section>
        `;
    }

    function renderFlowStrip(tabId, context = {}) {
        const chapter = context.chapter || getSelectedChapter();
        const gap = Math.max(0, Number(context.gap) || 0);
        const freeLeft = getRemainingFreeClashes();
        const items = {
            clash: [
                { icon: '&#9655;', title: text('门票', 'Entry'), body: text(`今日免费 ${freeLeft}/${getDailyFreeClashesLimit()}，之后每局 ${getEntryCost(chapter)} 金币。`, `${freeLeft}/${getDailyFreeClashesLimit()} free today, then ${getEntryCost(chapter)} credits per run.`) },
                { icon: '&#9671;', title: text('首通', 'First Clear'), body: text('首领首通额外给芯片和更高结算。', 'Boss first clears grant extra chips and higher rewards.') },
                { icon: '&#9888;', title: text('卡点', 'Current Wall'), body: gap > 0 ? text(`当前还差 ${formatCompact(gap)} 战力。`, `${formatCompact(gap)} more power needed right now.`) : text('当前战力达标，可继续推进。', 'Your current power is on target. Keep pushing.') }
            ]
        }[tabId] || [];

        return `
            <div class="nc-flow-grid nc-flow-grid--strip">
                ${items.map((item) => `
                    <div class="nc-flow-card nc-flow-card--compact">
                        <div class="nc-flow-head">
                            <span class="nc-flow-icon" aria-hidden="true">${item.icon}</span>
                            <strong>${escapeHtml(item.title)}</strong>
                        </div>
                        <div class="nc-note-mini">${escapeHtml(item.body)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function legacyRenderChapterChip(chapter, index) {
        const active = chapter.id === state.save.selectedChapterId;
        const unlocked = isChapterUnlocked(index);
        return `
            <button class="nc-chip ${active ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="selectChapter" data-value="${chapter.id}" ${unlocked ? '' : 'disabled'}>
                <span>${escapeHtml(chapter.id)}</span>
                <strong>${escapeHtml(localize(chapter.name))}</strong>
                <small>${escapeHtml(unlocked ? `${text('Power', 'Power')} ${chapter.recommended}` : text('Locked', 'Locked'))}</small>
            </button>
        `;
    }

    function renderLaneCard(label, unitId, chapter, power, scalar) {
        const unit = unitMap[unitId];
        const friendly = Math.round((power / 3) * scalar);
        const enemy = Math.round((chapter.recommended / 3) * scalar);
        return `
            <div class="nc-lane-card ${friendly >= enemy ? 'is-good' : 'is-warning'}">
                <div class="nc-lane-head">
                    <strong>${escapeHtml(label)}</strong>
                    <span>${escapeHtml(`${friendly} / ${enemy}`)}</span>
                </div>
                <div class="nc-lane-unit">${escapeHtml(unit ? localize(unit.name) : text('Empty', 'Empty'))}</div>
                <div class="nc-note-mini">${escapeHtml(unit ? `${localize(unit.role)} • ${text('Cost', 'Cost')} ${unit.cost}` : text('Choose a unit in Deck next.', 'Choose a unit in Deck next.'))}</div>
            </div>
        `;
    }

    function renderHandCard(card, type) {
        if (!card) return '';
        const role = type === 'tactic'
            ? `${getBattleCardCompactMeta({ ...card, type: 'tactic' })} • ${text('Cost', 'Cost')} ${card.cost}`
            : `${getBattleCardCompactMeta({ ...card, type: 'unit' })} • ${text('Cost', 'Cost')} ${card.cost}`;
        return `
            <div class="nc-hand-card ${type === 'tactic' ? 'is-tactic' : ''}">
                <strong>${escapeHtml(localize(card.name))}</strong>
                <span>${escapeHtml(role)}</span>
            </div>
        `;
    }

    function renderCardPanel({ icon, title, subtitle, badge, locked = false, stats = [], note = '', actions = '' }) {
        return `
            <article class="nc-card-item nc-card-item--dense ${locked ? 'is-locked' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(icon, title)}</h3>
                        <div class="nc-card-copy">${escapeHtml(subtitle || '')}</div>
                    </div>
                    <span class="nc-tag ${locked ? 'is-warning' : ''}">${escapeHtml(badge || '')}</span>
                </div>
                <div class="nc-stat-grid">
                    ${stats.map((item) => renderStatBox(item.label, item.value)).join('')}
                </div>
                ${note ? `<div class="nc-inline-note">${escapeHtml(note)}</div>` : ''}
                <div class="nc-action-row">${actions}</div>
            </article>
        `;
    }

    function renderSlotCard(label, title, subline) {
        return `
            <div class="nc-slot-card nc-slot-card--compact">
                <span class="nc-slot-label">${escapeHtml(label)}</span>
                <strong>${escapeHtml(title || '--')}</strong>
                <small>${escapeHtml(subline || '--')}</small>
            </div>
        `;
    }

    function renderWalletPill(icon, label, value, meta) {
        return `
            <div class="nc-wallet-pill">
                <div class="nc-pill-head">
                    <span class="nc-resource-icon" aria-hidden="true">${icon}</span>
                    <span>${escapeHtml(label)}</span>
                </div>
                <strong>${escapeHtml(String(value))}</strong>
                <small>${escapeHtml(meta || '')}</small>
            </div>
        `;
    }

    function renderSummaryItem(icon, label, value) {
        return `
            <div class="nc-summary-item">
                <div class="nc-pill-head">
                    <span class="nc-summary-icon" aria-hidden="true">${icon}</span>
                    <span>${escapeHtml(label)}</span>
                </div>
                <strong>${escapeHtml(String(value))}</strong>
            </div>
        `;
    }

    function renderStatBox(label, value, meta = '') {
        return `
            <div class="nc-stat-box">
                <span class="nc-stat-label">${escapeHtml(label)}</span>
                <strong class="nc-stat-value">${escapeHtml(String(value))}</strong>
                ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
            </div>
        `;
    }

    function renderResourcePill(item) {
        return `
            <div class="nc-resource-pill">
                <div class="nc-pill-head">
                    <span class="nc-resource-icon" aria-hidden="true">${item.icon}</span>
                    <span>${escapeHtml(item.label)}</span>
                </div>
                <strong>${escapeHtml(String(item.value))}</strong>
                <small>${escapeHtml(item.meta || '')}</small>
            </div>
        `;
    }

    function renderRewardPills(reward) {
        const entries = getRewardPillEntries(reward);
        if (!entries.length) return '';
        return `
            <div class="nc-reward-row">
                ${entries.map((entry) => `
                    <div class="nc-reward-pill" title="${escapeHtml(entry.label)}">
                        <span class="nc-reward-icon" aria-hidden="true">${entry.icon}</span>
                        <strong>${escapeHtml(entry.value)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderIconLabel(icon, label, small = '') {
        return `
            <span class="nc-titleline">
                <span class="nc-title-icon" aria-hidden="true">${icon}</span>
                <span>${escapeHtml(label)}</span>
                ${small ? `<small>${escapeHtml(small)}</small>` : ''}
            </span>
        `;
    }

    function renderModal() {
        if (!ui.modalRoot || !ui.modalBody || !ui.modalActions) return;
        if (!state.modal) {
            ui.modalRoot.classList.add('is-hidden');
            document.body.classList.remove('modal-open');
            return;
        }

        ui.modalRoot.classList.remove('is-hidden');
        document.body.classList.add('modal-open');
        ui.modalEyebrow.textContent = state.modal.eyebrow || text('信息', 'INFO');
        ui.modalTitle.textContent = state.modal.title || '';
        ui.modalSubtitle.textContent = state.modal.subtitle || '';
        ui.modalBody.innerHTML = state.modal.body || '';
        ui.modalActions.innerHTML = (state.modal.actions || [{ label: text('Got it', 'Got it'), action: 'closeModal' }]).map((item) => `
            <button class="${item.tone === 'ghost' ? 'ghost-btn' : 'primary-btn'}" type="button" data-action="${item.action}" ${item.value ? `data-value="${item.value}"` : ''} ${item.disabled ? 'disabled' : ''}>${escapeHtml(item.label)}</button>
        `).join('');
    }

    function openModal(modal) {
        state.modal = modal;
        renderModal();
    }

    function closeModal() {
        state.modal = null;
        renderModal();
    }

    function previewOffer(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        const owned = isOfferOwned(offerId);
        const order = getPendingPaymentOrder(offerId);
        const expired = !!(order && isPaymentOrderExpired(order));
        const activeOrder = getPendingPaymentOrder();
        const otherLiveOrder = activeOrder && activeOrder.offerId !== offerId && !isPaymentOrderExpired(activeOrder)
            ? activeOrder
            : null;
        openModal({
            eyebrow: text('Payment Center', 'Payment Center'),
            title: localize(offer.name),
            subtitle: owned ? text('Verified and granted', 'Verified and granted') : `${offer.price} USDT • ${PAYMENT_NETWORK}`,
            body: renderOfferPaymentBody(offer, { owned, order, expired, otherLiveOrder }),
            actions: getOfferModalActions(offer, { owned, order, expired, otherLiveOrder })
        });
    }

    function renderOfferPaymentBody(offer, { owned, order, expired, otherLiveOrder }) {
        const statusText = owned
            ? text('This pack has already been verified and the rewards are permanently attached to your account.', 'This pack has already been verified and the rewards are permanently attached to your account.')
            : otherLiveOrder
                ? text(`当前还有 1 笔 ${localize(offerMap[otherLiveOrder.offerId]?.name || otherLiveOrder.offerId)} 待处理订单，请先完成或取消。`, `Another ${localize(offerMap[otherLiveOrder.offerId]?.name || otherLiveOrder.offerId)} order is still pending. Finish or cancel it first.`)
                : order && !expired
                    ? text('Pay the exact amount below in OKX Wallet, then paste the txid to verify and grant rewards.', 'Pay the exact amount below in OKX Wallet, then paste the txid to verify and grant rewards.')
                    : order && expired
                        ? text('The previous order expired. Create a fresh order to continue payment and reward verification.', 'The previous order expired. Create a fresh order to continue payment and reward verification.')
                        : text('Create an exact order first. The first successful top-up unlocks the sponsor season track.', 'Create an exact order first. The first successful top-up unlocks the sponsor season track.');
        const verifiedOrder = getRecentOfferOrder(offer.id);
        return `
            <div class="nc-inline-note">${escapeHtml(statusText)}</div>
            <div class="nc-stat-grid">
                ${renderStatBox(text('Pack Price', 'Pack Price'), `${offer.price} USDT`, text('Base display price', 'Base display price'))}
                ${renderStatBox(text('Exact Amount', 'Exact Amount'), order ? `${formatPaymentAmount(order.exactAmount)} USDT` : '--', text('Use exact amount for verify', 'Use exact amount for verify'))}
                ${renderStatBox(text('Order ID', 'Order ID'), order ? order.id : verifiedOrder?.id || '--', order ? formatPaymentCountdown(order.expiresAt) : owned ? text('Verified', 'Verified') : text('Create order first', 'Create order first'))}
                ${renderStatBox(text('Perk', 'Perk'), localize(offer.permanent), owned ? text('Active now', 'Active now') : text('Activates after verify', 'Activates after verify'))}
            </div>
            ${renderRewardPills(offer.reward)}
            <div class="nc-payment-panel">
                <div class="nc-payment-address-block">
                    <span class="nc-stat-label">${escapeHtml(text('Receiving Address', 'Receiving Address'))}</span>
                    <div class="nc-payment-address">${escapeHtml(order?.payAddress || PAYMENT_WALLET)}</div>
                </div>
                <div class="nc-action-row">
                    <button class="ghost-btn" type="button" data-action="copyOfferAddress">${escapeHtml(text('Copy Address', 'Copy Address'))}</button>
                    <button class="ghost-btn" type="button" data-action="copyOfferAmount" data-value="${offer.id}" ${order && !otherLiveOrder ? '' : 'disabled'}>${escapeHtml(text('Copy Amount', 'Copy Amount'))}</button>
                </div>
                ${owned ? `
                    <div class="nc-payment-status is-good">${escapeHtml(text('Payment verified. Rewards were granted and the sponsor pass is active on this account.', 'Payment verified. Rewards were granted and the sponsor pass is active on this account.'))}</div>
                ` : otherLiveOrder ? `
                    <div class="nc-payment-status is-warning">${escapeHtml(text(`当前待处理订单：${otherLiveOrder.id}`, `Active pending order: ${otherLiveOrder.id}`))}</div>
                ` : `
                    <label class="nc-payment-field">
                        <span class="nc-stat-label">${escapeHtml(text('Paste OKX Wallet txid', 'Paste OKX Wallet txid'))}</span>
                        <input class="nc-payment-input" id="ncPaymentTxidInput" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(text('Paste the 64-character on-chain txid after payment.', 'Paste the 64-character on-chain txid after payment.'))}">
                    </label>
                    <div class="nc-payment-status ${expired ? 'is-warning' : order ? '' : 'is-warning'}">${escapeHtml(
                        expired
                            ? text('This order expired. Create a new order before verifying the txid.', 'This order expired. Create a new order before verifying the txid.')
                            : order
                                ? text('Only txids that match the active order amount, address, and valid time window can pass verification.', 'Only txids that match the active order amount, address, and valid time window can pass verification.')
                                : text('Create an order first, then complete payment in OKX Wallet and verify the txid.', 'Create an order first, then complete payment in OKX Wallet and verify the txid.')
                    )}</div>
                `}
            </div>
            <div class="nc-inline-note">${escapeHtml(text('首笔验证成功的充值会解锁赞助赛季；战术包额外提供每日 +1 免费对战；队长包提供领袖技充能 +6%；冠军包提供全队攻击与生命 +8%。', 'First verified top-up unlocks the sponsor season track. Tactical Pack adds +1 daily free clash. Captain Pack adds +6% leader skill charge. Champion Pack grants +8% squad ATK/HP.'))}</div>
        `;
    }

    function renderQuickActions(actions = []) {
        const visible = actions.filter(Boolean);
        if (!visible.length) return '';
        return `
            <div class="nc-quick-actions">
                ${visible.map((item) => `
                    <button class="${item.tone === 'ghost' ? 'ghost-btn' : 'primary-btn'}" type="button" data-action="${item.action}" ${item.value ? `data-value="${item.value}"` : ''} ${item.disabled ? 'disabled' : ''}>${escapeHtml(item.label)}</button>
                `).join('')}
            </div>
        `;
    }

    function getOfferModalActions(offer, { owned, order, expired, otherLiveOrder }) {
        if (owned) {
            return [
                { label: text('Open Season', 'Open Season'), action: 'openTab', value: 'season' },
                { label: text('Close', 'Close'), action: 'closeModal', tone: 'ghost' }
            ];
        }
        if (otherLiveOrder) {
            return [
                { label: text('继续待处理订单', 'Resume Pending Order'), action: 'previewOffer', value: otherLiveOrder.offerId },
                { label: text('Close', 'Close'), action: 'closeModal', tone: 'ghost' }
            ];
        }
        if (order && !expired) {
            return [
                { label: text('Verify TXID', 'Verify TXID'), action: 'verifyOfferTxid', value: offer.id },
                { label: text('Cancel Order', 'Cancel Order'), action: 'cancelOfferOrder', value: offer.id, tone: 'ghost' }
            ];
        }
        return [
            { label: text('Create Order', 'Create Order'), action: 'createOfferOrder', value: offer.id },
            { label: text('Close', 'Close'), action: 'closeModal', tone: 'ghost' }
        ];
    }

    function selectChapter(chapterId) {
        const chapter = chapterMap[chapterId];
        if (!chapter) return;
        if (!isChapterUnlocked(getChapterIndex(chapterId))) {
            showToast(text('That chapter is still locked.', 'That chapter is still locked.'), 'warning');
            return;
        }
        state.save.selectedChapterId = chapterId;
        saveProgress();
        renderAll();
    }

    function setLeader(leaderId) {
        if (!leaderMap[leaderId]) return;
        if (!isCardUnlocked(leaderMap[leaderId].unlockStage)) return;
        state.save.selectedLeaderId = leaderId;
        saveProgress();
        showToast(text('Leader switched.', 'Leader switched.'), 'success');
        renderAll();
    }

    function toggleUnit(unitId) {
        const unit = unitMap[unitId];
        if (!unit || !isCardUnlocked(unit.unlockStage)) return;
        const current = state.save.selectedUnits.slice();
        const index = current.indexOf(unitId);
        if (index >= 0) {
            if (current.length <= 1) {
                showToast(text('Keep at least one unit deployed.', 'Keep at least one unit deployed.'), 'warning');
                return;
            }
            current.splice(index, 1);
        } else {
            if (current.length >= 3) {
                showToast(text('You can only deploy 3 units right now.', 'You can only deploy 3 units right now.'), 'warning');
                return;
            }
            current.push(unitId);
        }
        state.save.selectedUnits = current;
        saveProgress();
        renderAll();
    }

    function setTactic(tacticId) {
        const tactic = tacticMap[tacticId];
        if (!tactic || !isCardUnlocked(tactic.unlockStage)) return;
        state.save.selectedTacticId = tacticId;
        saveProgress();
        showToast(text('Tactic card switched.', 'Tactic card switched.'), 'success');
        renderAll();
    }

    function legacyStartClash() {
        resetFreeClashWindow();
        const chapter = getSelectedChapter();
        const entry = getEntryCost(chapter);
        const freeLeft = getRemainingFreeClashes();
        if (freeLeft <= 0 && state.save.credits < entry) {
            showToast(text('Not enough credits to keep battling.', 'Not enough credits to keep battling.'), 'warning');
            return;
        }

        if (freeLeft > 0) {
            state.save.freeClashesUsedToday += 1;
        } else {
            state.save.credits -= entry;
        }

        const power = getDeckPower();
        const recommended = chapter.recommended;
        const ratio = power / Math.max(1, recommended);
        const winChance = clampNumber(0.28 + (ratio * 0.42), 0.18, 0.88);
        const win = Math.random() < winChance;
        const reward = {
            credits: Math.round(chapter.reward.credits * (win ? 1 : 0.56)),
            tactCores: Math.round(chapter.reward.tactCores * (win ? 1 : 0.66)),
            cipherChips: win ? chapter.reward.cipherChips : 0,
            seasonXp: Math.round(chapter.reward.seasonXp * (win ? 1 : 0.6))
        };

        const firstClear = win && !state.save.clearedChapters.includes(chapter.id) ? getFirstClearReward(chapter) : null;
        const fragments = rollClashFragments(chapter);

        grantReward(reward);
        if (firstClear) {
            grantReward(firstClear);
            state.save.clearedChapters.push(chapter.id);
        }
        fragments.forEach((item) => addFragments(item.id, item.amount));

        state.save.stats.duels += 1;
        if (win) state.save.stats.wins += 1;
        if (win && isBossStage(chapter)) state.save.stats.bossWins += 1;
        state.save.lastResult = {
            chapterId: chapter.id,
            win,
            reward,
            firstClear: !!firstClear,
            fragments
        };

        saveProgress();
        showToast(win ? text('Clash won.', 'Clash won.') : text('Clash retreated with partial rewards.', 'Clash retreated with partial rewards.'), win ? 'success' : 'warning');
        renderAll();
    }

    function upgradeCard(type, cardId) {
        const cost = getUpgradeCost(type, cardId);
        if (!cost) return;
        if (state.save.credits < cost) {
            showToast(text('Not enough credits.', 'Not enough credits.'), 'warning');
            return;
        }
        state.save.credits -= cost;
        getLevelMap(type)[cardId] = getCardLevel(type, cardId) + 1;
        state.save.stats.cardUpgrades += 1;
        saveProgress();
        showToast(text('Card upgraded.', 'Card upgraded.'), 'success');
        renderAll();
    }

    function promoteCard(type, cardId) {
        const star = getCardStar(type, cardId);
        const cost = getNextStarCost(star);
        if (!cost) return;
        if (!canPromoteCard(type, cardId)) {
            showToast(text('Not enough promotion materials.', 'Not enough promotion materials.'), 'warning');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.tactCores -= cost.tactCores;
        state.save.cipherChips -= cost.cipherChips;
        addFragments(cardId, -cost.fragments);
        getStarMap(type)[cardId] = star + 1;
        saveProgress();
        showToast(text('Promotion complete.', 'Promotion complete.'), 'success');
        renderAll();
    }

    function upgradeResearch(researchId) {
        const research = researchMap[researchId];
        if (!research) return;
        const level = getResearchLevel(researchId);
        if (level >= research.maxLevel) return;
        const cost = getResearchCost(researchId);
        if (!canUpgradeResearch(researchId)) {
            showToast(text('Not enough credits or chips.', 'Not enough credits or chips.'), 'warning');
            return;
        }
        state.save.credits -= cost.credits;
        state.save.cipherChips -= cost.cipherChips;
        state.save.researchLevels[researchId] = level + 1;
        state.save.stats.researchUpgrades += 1;
        saveProgress();
        showToast(text('Research upgraded.', 'Research upgraded.'), 'success');
        renderAll();
    }

    function claimMission(missionId) {
        const mission = config.missions.find((item) => item.id === missionId);
        if (!mission || state.save.missionClaimed.includes(missionId)) return;
        if (getMissionProgress(mission.metric) < mission.target) return;
        state.save.missionClaimed.push(missionId);
        grantReward(mission.reward);
        saveProgress();
        showToast(text('Mission reward claimed.', 'Mission reward claimed.'), 'success');
        renderAll();
    }

    function claimSeason(track, nodeId) {
        const list = track === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack;
        const store = track === 'premium' ? state.save.premiumSeasonClaimed : state.save.seasonClaimed;
        const key = `${track}:${nodeId}`;
        const node = list.find((item) => item.id === nodeId);
        if (!node || store.includes(key)) return;
        if (track === 'premium' && !isSeasonPassUnlocked()) return;
        if (state.save.seasonXp < node.xp) return;
        store.push(key);
        grantReward(node.reward);
        saveProgress();
        showToast(text('Season reward claimed.', 'Season reward claimed.'), 'success');
        renderAll();
    }

    function claimDailySupply() {
        if (!canClaimDailySupply()) return;
        state.save.dailySupplyAt = Date.now();
        grantReward(shopMap.dailySupply.reward);
        saveProgress();
        showToast(text('Daily supply claimed.', 'Daily supply claimed.'), 'success');
        renderAll();
    }

    function buyShopItem(itemId) {
        const item = shopMap[itemId];
        if (!item || item.price <= 0) return;
        if (state.save.credits < item.price) {
            showToast(text('Not enough credits.', 'Not enough credits.'), 'warning');
            return;
        }
        state.save.credits -= item.price;
        grantReward(item.reward);
        saveProgress();
        showToast(text('Supply purchased.', 'Supply purchased.'), 'success');
        renderAll();
    }

    function createOfferOrder(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        if (isOfferOwned(offerId)) {
            previewOffer(offerId);
            showToast(text('This pack has already been claimed.', 'This pack has already been claimed.'), 'warning');
            return;
        }
        const activeOrder = getPendingPaymentOrder();
        if (activeOrder && !isPaymentOrderExpired(activeOrder)) {
            if (activeOrder.offerId === offerId) {
                previewOffer(offerId);
                showToast(text('Resume the active order below.', 'Resume the active order below.'), 'warning');
                return;
            }
            previewOffer(activeOrder.offerId);
            showToast(text('当前还有 1 笔待处理订单，请先完成或取消。', 'Another payment order is still pending. Finish or cancel it first.'), 'warning');
            return;
        }

        state.save.payment.pendingOrder = {
            id: buildPaymentOrderId(offerId),
            offerId,
            exactAmount: getOfferExactAmount(offer),
            payAddress: PAYMENT_WALLET,
            network: PAYMENT_NETWORK,
            createdAt: Date.now(),
            expiresAt: Date.now() + PAYMENT_ORDER_EXPIRY_MS
        };
        saveProgress();
        previewOffer(offerId);
        showToast(text('Exact payment order created.', 'Exact payment order created.'), 'success');
        renderAll();
    }

    function cancelOfferOrder(offerId) {
        const current = getPendingPaymentOrder();
        if (!current || (offerId && current.offerId !== offerId)) {
            closeModal();
            return;
        }
        state.save.payment.pendingOrder = null;
        saveProgress();
        previewOffer(offerId || current.offerId);
        showToast(text('Pending order canceled.', 'Pending order canceled.'), 'warning');
        renderAll();
    }

    function verifyOfferTxid(offerId) {
        const offer = offerMap[offerId];
        const order = getPendingPaymentOrder(offerId);
        const txid = getOfferTxidInput();
        if (!offer || !order) {
            showToast(text('Create an order first.', 'Create an order first.'), 'warning');
            previewOffer(offerId);
            return;
        }
        if (isPaymentOrderExpired(order)) {
            showToast(text('This order expired. Create a new one.', 'This order expired. Create a new one.'), 'warning');
            previewOffer(offerId);
            return;
        }
        if (!PAYMENT_TXID_RE.test(txid)) {
            showToast(text('TXID must be 64 hex characters.', 'TXID must be 64 hex characters.'), 'warning');
            return;
        }
        if (state.save.payment.verifiedTxids.includes(txid)) {
            showToast(text('This TXID was already used.', 'This TXID was already used.'), 'warning');
            return;
        }
        if (state.save.payment.claimedOrderIds.includes(order.id) || isOfferOwned(offerId)) {
            previewOffer(offerId);
            showToast(text('Rewards for this pack were already granted.', 'Rewards for this pack were already granted.'), 'warning');
            return;
        }

        const sponsorUnlockedBefore = isSeasonPassUnlocked();
        state.save.payment.totalSpent = roundMoney(Number(state.save.payment.totalSpent || 0) + Number(offer.price || 0));
        state.save.payment.sponsorPass = true;
        state.save.payment.purchaseCount = (state.save.payment.purchaseCount || 0) + 1;
        pushUniqueValue(state.save.payment.claimedOfferIds, offerId);
        pushUniqueValue(state.save.payment.claimedOrderIds, order.id);
        pushUniqueValue(state.save.payment.verifiedTxids, txid, 40);
        state.save.payment.recentOrders = [
            {
                id: order.id,
                offerId,
                txid,
                exactAmount: order.exactAmount,
                verifiedAt: Date.now()
            },
            ...(Array.isArray(state.save.payment.recentOrders) ? state.save.payment.recentOrders : []).filter((item) => item?.id !== order.id)
        ].slice(0, 8);
        state.save.payment.pendingOrder = null;
        grantReward(offer.reward);
        saveProgress();
        openModal({
            eyebrow: text('Payment Verified', 'Payment Verified'),
            title: localize(offer.name),
            subtitle: `${formatPaymentAmount(order.exactAmount)} USDT • ${PAYMENT_NETWORK}`,
            body: `
                <div class="nc-payment-status is-good">${escapeHtml(text('The order was verified successfully and rewards have been granted to this account.', 'The order was verified successfully and rewards have been granted to this account.'))}</div>
                <div class="nc-stat-grid">
                    ${renderStatBox(text('Order ID', 'Order ID'), order.id)}
                    ${renderStatBox(text('TXID', 'TXID'), shortenTxid(txid))}
                    ${renderStatBox(text('Total Spent', 'Total Spent'), `${formatPaymentAmount(state.save.payment.totalSpent)} USDT`)}
                    ${renderStatBox(text('Sponsor Pass', 'Sponsor Pass'), isSeasonPassUnlocked() ? text('Unlocked', 'Unlocked') : text('Locked', 'Locked'), sponsorUnlockedBefore ? text('Already active', 'Already active') : text('Unlocked now', 'Unlocked now'))}
                </div>
                ${renderRewardPills(offer.reward)}
                <div class="nc-inline-note">${escapeHtml(localize(offer.permanent))}</div>
            `,
            actions: [
                { label: text('Open Season', 'Open Season'), action: 'openTab', value: 'season' },
                { label: text('Close', 'Close'), action: 'closeModal', tone: 'ghost' }
            ]
        });
        showToast(text('Payment verified. Rewards granted.', 'Payment verified. Rewards granted.'), 'success');
        renderAll();
    }

    async function copyOfferAddress() {
        const copied = await copyTextToClipboard(PAYMENT_WALLET);
        showToast(copied ? text('Receiving address copied.', 'Receiving address copied.') : text('Please copy the address manually.', 'Please copy the address manually.'), copied ? 'success' : 'warning');
    }

    async function copyOfferAmount(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        const order = getPendingPaymentOrder(offerId);
        if (!order) {
            showToast(text('Create an order first.', 'Create an order first.'), 'warning');
            return;
        }
        const copied = await copyTextToClipboard(String(formatPaymentAmount(order.exactAmount)));
        showToast(copied ? text('Exact amount copied.', 'Exact amount copied.') : text('Please copy the amount manually.', 'Please copy the amount manually.'), copied ? 'success' : 'warning');
    }

    function openCrate(type) {
        if (type === 'standard' && state.save.inventory.standardCrates <= 0) return;
        if (type === 'elite' && state.save.inventory.eliteCrates <= 0) return;

        if (type === 'standard') {
            state.save.inventory.standardCrates -= 1;
        } else {
            state.save.inventory.eliteCrates -= 1;
        }

        const pulls = type === 'elite' ? 3 : 2;
        const minAmount = type === 'elite' ? 14 : 6;
        const maxAmount = type === 'elite' ? 28 : 14;
        const unlockedCards = allCardIds.filter((id) => isCardUnlocked(getCardUnlockStage(id)));
        const rewards = [];

        for (let index = 0; index < pulls; index += 1) {
            const cardId = unlockedCards[Math.floor(Math.random() * unlockedCards.length)] || allCardIds[0];
            const amount = randomInt(minAmount, maxAmount);
            addFragments(cardId, amount);
            rewards.push({ id: cardId, amount });
        }

        if (type === 'elite') {
            state.save.tactCores += 18;
            state.save.cipherChips += 1;
        }

        state.save.stats.cratesOpened += 1;
        saveProgress();
        openModal({
            eyebrow: text('Crate Result', 'Crate Result'),
            title: type === 'elite' ? text('Elite Crate', 'Elite Crate') : text('Standard Crate', 'Standard Crate'),
            subtitle: text('Rewards have been added to your inventory.', 'Rewards have been added to your inventory.'),
            body: `
                <div class="nc-inline-note">${escapeHtml(formatFragmentSummary(rewards))}</div>
                ${type === 'elite' ? renderRewardPills({ tactCores: 18, cipherChips: 1 }) : ''}
            `,
            actions: [
                { label: text('Keep Building', 'Keep Building'), action: 'closeModal' }
            ]
        });
        renderAll();
    }

    function grantReward(reward) {
        if (!reward) return;
        state.save.credits += Math.round(Number(reward.credits) || 0);
        state.save.tactCores += Math.round(Number(reward.tactCores) || 0);
        state.save.cipherChips += Math.round(Number(reward.cipherChips) || 0);
        state.save.seasonXp += Math.round(Number(reward.seasonXp) || 0);
        state.save.inventory.standardCrates += Math.round(Number(reward.standardCrates) || 0);
        state.save.inventory.eliteCrates += Math.round(Number(reward.eliteCrates) || 0);

        if (reward.cardFragments && typeof reward.cardFragments === 'object') {
            Object.keys(reward.cardFragments).forEach((cardId) => addFragments(cardId, reward.cardFragments[cardId]));
        }
    }

    function showToast(message, tone = '') {
        if (!ui.toast) return;
        ui.toast.textContent = message;
        ui.toast.className = `nc-toast is-visible ${tone ? `is-${tone}` : ''}`.trim();
        if (state.toastTimer) window.clearTimeout(state.toastTimer);
        state.toastTimer = window.setTimeout(() => {
            ui.toast.className = 'nc-toast';
        }, 2200);
    }

    function renderHeroSummary() {
        if (!ui.heroSummary) return;
        if (state.tab === 'clash') {
            ui.heroSummary.innerHTML = '';
            return;
        }
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const gap = Math.max(0, chapter.recommended - power);
        const freeLeft = getRemainingFreeClashes();
        ui.heroSummary.innerHTML = `
            <div class="nc-summary-grid">
                ${renderSummaryItem('&#10022;', text('Current Stage', 'Current Stage'), `${chapter.id} • ${localize(chapter.name)}`)}
                ${renderSummaryItem('&#9889;', text('Power', 'Power'), `${power} / ${chapter.recommended}`)}
                ${renderSummaryItem('&#9888;', text('Gap', 'Gap'), gap > 0 ? `-${formatCompact(gap)}` : text('Ready', 'Ready'))}
                ${renderSummaryItem('&#9655;', text('Free Clashes', 'Free Clashes'), `${freeLeft}/${getDailyFreeClashesLimit()}`)}
            </div>
        `;
    }

    function renderClashTab() {
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const battle = state.battle;
        if (battle) {
            return renderBattleStage();
        }
        return renderClashSetup(chapter, power);
    }

    function renderClashSetup(chapter, power) {
        const unitIds = state.save.selectedUnits;
        const gap = Math.max(0, chapter.recommended - power);
        const freeLeft = getRemainingFreeClashes();
        const tactic = tacticMap[state.save.selectedTacticId];
        const laneIds = getBattleLaneIdsForChapter(chapter);
        const setupModeCopy = getBattleModeIntro(chapter);
        return `
            <section class="nc-card nc-card--compact nc-battle-card nc-battle-card--setup">
                <div class="nc-card-head nc-card-head--battle-compact">
                    <div>
                        <h3>${renderIconLabel('&#10022;', localize(chapter.name), chapter.id)}</h3>
                        <div class="nc-note-mini">${escapeHtml(setupModeCopy)}</div>
                    </div>
                    <span class="nc-tag ${gap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(gap > 0 ? text('需补战力', 'Need Power') : text('可开战', 'Ready'))}</span>
                </div>

                <div class="nc-chip-row">
                    ${config.chapters.map((item, index) => renderChapterChip(item, index)).join('')}
                </div>

                <div class="nc-board-grid nc-board-grid--clash-setup" style="--nc-setup-columns:${laneIds.length};">
                    ${laneIds.map((laneId) => renderLaneCard(
                        getBattleLaneLabelByIds(laneId, laneIds),
                        getSetupLanePreviewUnitId(laneId, unitIds),
                        chapter,
                        power,
                        getBattleLaneScale(laneId, laneIds)
                    )).join('')}
                </div>

                <div class="nc-hand-row nc-hand-row--setup">
                    ${unitIds.map((unitId) => renderHandCard(unitMap[unitId], 'unit')).join('')}
                    ${renderHandCard(tacticMap[state.save.selectedTacticId], 'tactic')}
                </div>

                <div class="nc-battle-launch-strip">
                    <div class="nc-battle-state-strip">
                        ${renderBattleStateChip('&#9889;', `${text('战力', 'Power')} ${power}/${chapter.recommended}`, gap > 0 ? 'warning' : 'good')}
                        ${renderBattleStateChip('&#9655;', freeLeft > 0 ? text(`免费 ${freeLeft}/${getDailyFreeClashesLimit()}`, `Free ${freeLeft}/${getDailyFreeClashesLimit()}`) : text(`入场 ${getEntryCost(chapter)} Cr`, `Entry ${getEntryCost(chapter)} Cr`), freeLeft > 0 ? 'good' : '')}
                        ${renderBattleStateChip('&#10038;', `${text('战术', 'Tactic')} • ${tactic ? localize(tactic.name) : text('未装配', 'None')}`)}
                    </div>

                    <div class="nc-action-row nc-action-row--setup">
                        <button class="primary-btn wide-btn" type="button" data-action="startClash">${escapeHtml(getStartClashLabel(chapter))}</button>
                        <button class="ghost-btn wide-btn" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('卡组', 'Deck'))}</button>
                    </div>

                    <div class="nc-inline-note nc-inline-note--battle">${escapeHtml(getBattleFlowHint(chapter))}</div>
                </div>

            </section>
        `;
    }

    function renderBattleStage() {
        const battle = state.battle;
        if (!battle) return '';
        syncBattleSelectedCard();
        const chapter = battle.chapter;
        const commandCard = getBattleCommandCard();
        const boostList = battle.boosts.map((boostId) => getBattleBoostDef(boostId)).filter(Boolean);
        const leaderReady = battle.active && !battle.reinforcementPending && !battle.result && battle.leaderCharge >= 100;
        const arenaTone = battle.arenaGlowUntil > battle.time ? ` is-${battle.arenaTone || 'good'}` : '';
        const arenaModeClass = battle.lanes.length === 1 ? ' is-single-lane' : battle.lanes.length === 2 ? ' is-two-lane' : '';
        return `
            <section class="nc-card nc-battle-card nc-battle-card--live">
                <div class="nc-card-head nc-card-head--battle-compact">
                    <div>
                        <h3>${renderIconLabel('&#9876;', text('实时对战', 'Live Clash'), chapter.id)}</h3>
                    </div>
                    <span class="nc-tag ${battle.result ? (battle.result.win ? 'is-good' : 'is-warning') : battle.pausedByVisibility ? 'is-warning' : 'is-good'}">${escapeHtml(
                        battle.result
                            ? (battle.result.win ? text('胜利', 'Victory') : text('撤退', 'Retreat'))
                            : battle.pausedByVisibility
                                ? text('已暂停', 'Paused')
                                : text('进行中', 'Active')
                    )}</span>
                </div>

                <div class="nc-battle-hud">
                    ${renderBattleHudBox(text('⏱ 时间', '⏱ Time'), formatBattleTime(Math.max(0, battle.maxTime - battle.time)), battle.maxTime - battle.time <= 15 ? 'warning' : '')}
                    ${renderBattleHudBox(text('⚡ 能量', '⚡ Energy'), `${battle.energy.toFixed(1)} / ${battle.maxEnergy}`)}
                    ${renderBattleHudBox(text('❤ 核心', '❤ Core'), `${getBattleCorePercent('ally')} / ${getBattleCorePercent('enemy')}`, getBattleCorePercent('enemy') < getBattleCorePercent('ally') ? 'good' : '')}
                    ${renderBattleHudBox(text('✦ 技能', '✦ Skill'), `${Math.round(battle.leaderCharge)}%`, battle.leaderCharge >= 100 ? 'good' : '')}
                </div>

                <div class="nc-battle-state-strip">
                    ${renderBattleStateChip('&#10039;', `${text('波', 'Wave')} ${battle.wave}`)}
                    ${renderBattleStateChip('&#9673;', `${text('主攻', 'Focus')} ${getBattleLaneLabel(battle.focusLaneId)}`)}
                    ${renderBattleStateChip('&#9888;', getBattleBossStateText(), battle.bossDefeated ? 'good' : battle.time >= Math.max(42, battle.maxTime - 16) ? 'warning' : '')}
                    ${boostList.length ? renderBattleStateChip('&#10022;', text(`强化 ${boostList.length}`, `Boosts ${boostList.length}`), 'good') : ''}
                </div>

                <div class="nc-battle-stage">
                    <div class="nc-battle-arena${arenaTone}${arenaModeClass}">
                        ${battle.notice && battle.notice.until > battle.time ? `<div class="nc-battle-notice ${battle.notice.tone ? `is-${battle.notice.tone}` : ''}">${escapeHtml(battle.notice.text)}</div>` : ''}
                        ${battle.banner && battle.banner.until > battle.time ? renderBattleBanner(battle.banner) : ''}
                        ${battle.lanes.map(renderBattleLane).join('')}
                        ${battle.reinforcementPending ? renderBattleBoostOverlay() : ''}
                        ${battle.result ? renderBattleResultOverlay() : ''}
                    </div>
                </div>

                ${renderBattleCommandDock(commandCard, leaderReady)}
            </section>
        `;
    }

    function renderBattleCommandDock(selectedCard, leaderReady) {
        const battle = state.battle;
        const playableCount = getBattlePlayableCardIds().length;
        const commandState = getBattleCommandState(selectedCard, battle);
        const singleLane = battle.lanes.length === 1;
        const showLaneQuick = battle.lanes.length > 1;
        const canPressBattleActions = battle.active && !battle.reinforcementPending && !battle.result;
        const singleLaneId = singleLane ? battle.lanes[0]?.id || '' : '';
        const stepTwoLabel = battle.lanes.length === 1
            ? (commandState.ready ? text('② 自动上阵', '2 Auto Deploy') : text('② 蓄能中', '2 Charging'))
            : (commandState.ready ? text('② 点路线', '2 Tap Lane') : text('② 蓄能中', '2 Charging'));
        return `
            <section class="nc-battle-command nc-battle-command--lanes-${battle.lanes.length}">
                <div class="nc-battle-command-head">
                    <div class="nc-battle-command-copy">
                        <div class="eyebrow">${escapeHtml(text('战斗操作', 'Battle Controls'))}</div>
                        <strong>${escapeHtml(commandState.title)}</strong>
                        ${commandState.showHint ? `<small>${escapeHtml(commandState.hint)}</small>` : ''}
                    </div>
                    <span class="nc-tag ${commandState.tone ? `is-${commandState.tone}` : playableCount ? 'is-good' : 'is-warning'}">${escapeHtml(commandState.badge)}</span>
                </div>

                ${commandState.showSteps ? `
                    <div class="nc-battle-command-steps">
                        <span class="nc-tag nc-tag--mini ${selectedCard ? 'is-good' : ''}">${escapeHtml(text('① 选卡', '1 Card'))}</span>
                        <span class="nc-tag nc-tag--mini ${commandState.ready ? 'is-good' : 'is-warning'}">${escapeHtml(stepTwoLabel)}</span>
                    </div>
                ` : ''}

                <div class="nc-hand-row nc-hand-row--battle nc-hand-row--battle-dock">
                    ${battle.hand.map((cardId) => renderBattleHandCard(cardId)).join('')}
                </div>

                ${showLaneQuick ? `
                    <div class="nc-battle-lane-quick" style="--nc-battle-quick-columns:${battle.lanes.length};">
                        ${battle.lanes.map((lane) => `
                            <button class="primary-btn wide-btn" type="button" data-action="playBattleCard" data-value="${escapeHtml(lane.id)}" ${canPressBattleActions ? '' : 'disabled'}>
                                ${renderBattleLaneQuickLabel(lane.id, commandState.ready, selectedCard)}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="nc-action-row nc-action-row--battle ${singleLane ? 'nc-action-row--battle-single' : ''}">
                    ${singleLane ? `
                        <button class="primary-btn wide-btn" type="button" data-action="playBattleCard" data-value="${escapeHtml(singleLaneId)}" ${canPressBattleActions ? '' : 'disabled'}>
                            ${escapeHtml(renderBattleSingleLaneActionLabel(singleLaneId, selectedCard, commandState))}
                        </button>
                    ` : ''}
                    <button class="${leaderReady ? 'primary-btn' : 'ghost-btn'} wide-btn" type="button" data-action="useLeaderSkill" ${leaderReady ? '' : 'disabled'}>${escapeHtml(text(`✦ 技能 ${getBattleLaneLabel(battle.focusLaneId)}`, `✦ Skill ${getBattleLaneLabel(battle.focusLaneId)}`))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="retreatBattle" ${battle.active && !battle.result ? '' : 'disabled'}>${escapeHtml(text('↩ 撤退', '↩ Retreat'))}</button>
                </div>
            </section>
        `;
    }

    function renderBattleHudBox(label, value, tone = '') {
        return `
            <div class="nc-battle-hud-box ${tone ? `is-${tone}` : ''}">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(String(value))}</strong>
            </div>
        `;
    }

    function renderBattleStateChip(icon, label, tone = '') {
        return `
            <span class="nc-tag ${tone ? `is-${tone}` : ''}">
                ${icon} ${escapeHtml(label)}
            </span>
        `;
    }

    function renderBattleLaneQuickLabel(laneId, ready, selectedCard = null) {
        const icon = getBattleLaneIcon(laneId);
        if (ready) {
            return escapeHtml(
                selectedCard?.type === 'tactic'
                    ? `${icon} ${getBattleLaneLabel(laneId)} ${text('放术', 'Cast')}`
                    : `${icon} ${getBattleLaneLabel(laneId)} ${text('出兵', 'Deploy')}`
            );
        }
        return escapeHtml(`${icon} ${getBattleLaneLabel(laneId)} ${text('待命', 'Standby')}`);
    }

    function renderBattleSingleLaneActionLabel(laneId, selectedCard, commandState) {
        const icon = getBattleLaneIcon(laneId);
        if (!selectedCard) {
            return `${icon} ${text('先选卡', 'Pick Card')}`;
        }
        if (commandState.ready) {
            return selectedCard.type === 'tactic'
                ? `${icon} ${text('主线放术', 'Cast Main')}`
                : `${icon} ${text('主线出兵', 'Deploy Main')}`;
        }
        if (commandState.badge === text('缺能量', 'Low Energy')) {
            return `${icon} ${text('能量不足', 'Low Energy')}`;
        }
        if (commandState.badge === text('冷却中', 'Cooldown')) {
            return `${icon} ${text('冷却中', 'Cooldown')}`;
        }
        return `${icon} ${text('待命中', 'Standby')}`;
    }

    function renderClashGuideStrip() {
        const laneIds = getBattleLaneIds();
        const laneDetail = laneIds.length === 1
            ? text('点亮起卡牌即可自动出兵', 'Tap a glowing card to auto-deploy')
            : laneIds.length === 2
                ? text('点主线 / 侧线出手', 'Tap Main / Side to deploy')
                : text('点上 / 中 / 下任一路线', 'Tap top / mid / bot lane');
        const items = [
            { icon: '&#9312;', title: text('选卡', 'Pick Card'), detail: text('点单位或战术卡', 'Tap a unit or tactic card') },
            { icon: '&#9313;', title: text('出兵', 'Deploy'), detail: laneDetail },
            { icon: '&#9889;', title: text('放技能', 'Cast Skill'), detail: text('100% 充能放领袖技', 'Use leader skill at 100%') }
        ];
        return `
            <div class="nc-guide-strip">
                ${items.map((item) => `
                    <div class="nc-guide-chip">
                        <div class="nc-pill-head">
                            <span class="nc-resource-icon" aria-hidden="true">${item.icon}</span>
                            <span>${escapeHtml(item.title)}</span>
                        </div>
                        <small>${escapeHtml(item.detail)}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderBattleBanner(banner) {
        return `
            <div class="nc-battle-banner ${banner.tone ? `is-${banner.tone}` : ''}">
                <strong>${escapeHtml(banner.title)}</strong>
                ${banner.detail ? `<small>${escapeHtml(banner.detail)}</small>` : ''}
            </div>
        `;
    }

    function renderBattleLane(lane) {
        const battle = state.battle;
        const isSingleLane = battle.lanes.length === 1;
        const isFocus = battle.focusLaneId === lane.id;
        const pulseClass = lane.pulseUntil > battle.time ? ` is-pulse-${lane.pulseTone || 'good'}` : '';
        const impactClass = lane.impactUntil > battle.time ? ` is-impact-${lane.impactTone || 'good'} is-impact-${lane.impactSide || 'ally'}` : '';
        const selectedCard = getBattleCommandCard();
        const commandState = getBattleCommandState(selectedCard, battle);
        const pressure = getBattleLanePressure(lane);
        const canAct = battle.active && !battle.reinforcementPending && !battle.result && getBattlePlayableCardIds(battle).length > 0;
        const actionLabel = battle.result
            ? text('已结算', 'Settled')
            : battle.reinforcementPending
                ? text('选强化', 'Pick Boost')
                : canAct
                    ? (selectedCard?.type === 'tactic'
                        ? (isSingleLane ? text('点卡放术', 'Tap Card To Cast') : text('点路放术', 'Tap To Cast'))
                        : (isSingleLane ? text('点卡自动上阵', 'Tap Card Auto Deploy') : text('点路出兵', 'Tap To Deploy')))
                    : text('蓄能中', 'Charging')
        const actionTone = battle.result ? '' : canAct ? 'is-good' : (commandState.tone ? `is-${commandState.tone}` : '');
        return `
            <article class="nc-battle-lane ${isFocus ? 'is-focus' : ''}${pulseClass}" data-action="${battle.active && !battle.reinforcementPending && !battle.result ? 'playBattleCard' : ''}" data-value="${escapeHtml(lane.id)}">
                <div class="nc-lane-head">
                    <strong>${escapeHtml(getBattleLaneLabel(lane.id))}</strong>
                    <span>${escapeHtml(`${Math.round((lane.playerCoreHp / lane.playerCoreMax) * 100)}% / ${Math.round((lane.enemyCoreHp / lane.enemyCoreMax) * 100)}%`)}</span>
                </div>
                <div class="nc-battle-lane-counts">
                    <span class="nc-tag nc-tag--mini is-good">${escapeHtml(text(`友 ${lane.friendly.length}`, `Ally ${lane.friendly.length}`))}</span>
                    <span class="nc-tag nc-tag--mini ${lane.enemy.length ? 'is-warning' : ''}">${escapeHtml(text(`敌 ${lane.enemy.length}`, `Enemy ${lane.enemy.length}`))}</span>
                </div>
                <div class="nc-battle-pressure">
                    <div class="nc-battle-pressure-bar">
                        <div class="nc-battle-pressure-fill is-ally" style="width:${pressure.allyWidth.toFixed(1)}%"></div>
                        <div class="nc-battle-pressure-fill is-enemy" style="width:${pressure.enemyWidth.toFixed(1)}%"></div>
                        <div class="nc-battle-pressure-marker" style="left:${pressure.marker.toFixed(1)}%"></div>
                    </div>
                    <span class="nc-tag nc-tag--mini ${pressure.tone ? `is-${pressure.tone}` : ''}">${escapeHtml(pressure.label)}</span>
                </div>
                <div class="nc-battle-track${impactClass}">
                    <div class="nc-battle-core is-ally">
                        <span>${escapeHtml(text('我方核心', 'Ally Core'))}</span>
                        <strong>${escapeHtml(String(Math.max(0, Math.round(lane.playerCoreHp))))}</strong>
                    </div>
                    <div class="nc-battle-core is-enemy">
                        <span>${escapeHtml(text('敌方核心', 'Enemy Core'))}</span>
                        <strong>${escapeHtml(String(Math.max(0, Math.round(lane.enemyCoreHp))))}</strong>
                    </div>
                    ${renderBattleFloaters(lane)}
                    <div class="nc-battle-unit-layer">
                        ${lane.friendly.map((unit, index) => renderBattleUnit(unit, index, lane.friendly.length)).join('')}
                        ${lane.enemy.map((unit, index) => renderBattleUnit(unit, index, lane.enemy.length)).join('')}
                    </div>
                    ${renderBattleLaneTouchHint(lane, selectedCard, commandState)}
                </div>
                <div class="nc-battle-lane-foot">
                    <div>
                        <div class="nc-note-mini">${escapeHtml(renderBattleLaneHint(lane))}</div>
                        ${renderBattleLaneEventStrip(lane)}
                        ${renderBattleLaneEffects(lane)}
                    </div>
                    <span class="nc-tag nc-battle-lane-status ${actionTone}">${escapeHtml(actionLabel)}</span>
                </div>
            </article>
        `;
    }

    function renderBattleLaneTouchHint(lane, selectedCard, commandState) {
        const battle = state.battle;
        if (!battle || battle.result) return '';
        if ((battle.lanes?.length || 0) <= 2) return '';
        if (lane.id !== battle.focusLaneId) return '';
        const shouldShow = commandState.ready
            || battle.reinforcementPending
            || (battle.time < 8 && ((lane.friendly?.length || 0) + (lane.enemy?.length || 0)) < 2);
        if (!shouldShow) return '';

        const title = commandState.ready
            ? (selectedCard?.type === 'tactic' ? text('点此释放', 'Tap To Cast') : text('点此出兵', 'Tap To Deploy'))
            : battle.reinforcementPending
                ? text('先选强化', 'Pick Boost First')
                : text('等待可出卡', 'Waiting For Card');

        const detail = commandState.ready
            ? ''
            : battle.reinforcementPending
                ? text('选 1 项后继续', 'Pick 1 boost')
                : text('等下方卡亮起', 'Wait card ready');

        return `
            <div class="nc-battle-lane-touch ${commandState.ready ? 'is-ready' : 'is-wait'}">
                <strong>${escapeHtml(title)}</strong>
                ${detail ? `<small>${escapeHtml(detail)}</small>` : ''}
            </div>
        `;
    }

    function renderBattleUnit(unit, index, count) {
        const battle = state.battle;
        const baseTop = unit.side === 'ally' ? 48 : 12;
        const step = count > 1 ? Math.min(16, 28 / (count - 1)) : 0;
        const offset = unit.side === 'ally' ? (index * step) : ((count - 1 - index) * step);
        const hpRatio = Math.max(0, unit.hp / Math.max(1, unit.maxHp));
        const shieldRatio = Math.max(0, unit.shield / Math.max(1, unit.maxHp));
        const visual = getBattleUnitVisual(unit);
        const spawnClass = unit.spawnUntil > battle.time ? ' is-spawn' : '';
        const actionClass = unit.actionUntil > battle.time ? ' is-action' : '';
        const hitClass = unit.hitUntil > battle.time ? ' is-hit' : '';
        return `
            <div class="nc-battle-unit ${unit.side === 'ally' ? 'is-ally' : 'is-enemy'} ${unit.isBoss ? 'is-boss' : ''} is-${visual.tone}${spawnClass}${actionClass}${hitClass}" style="left:${unit.x.toFixed(1)}%; top:${(baseTop + offset).toFixed(1)}px;">
                <div class="nc-battle-unit-head">
                    <span class="nc-battle-unit-icon" aria-hidden="true">${visual.icon}</span>
                    <strong>${escapeHtml(getBattleUnitShortName(unit))}</strong>
                </div>
                <div class="nc-battle-unit-bars">
                    <div class="nc-battle-health"><div style="width:${(hpRatio * 100).toFixed(1)}%"></div></div>
                    ${unit.shield > 0 ? `<div class="nc-battle-shield"><div style="width:${Math.min(100, shieldRatio * 100).toFixed(1)}%"></div></div>` : ''}
                </div>
            </div>
        `;
    }

    function renderBattleFloaters(lane) {
        if (!lane.floaters?.length) return '';
        return `
            <div class="nc-battle-floater-layer">
                ${lane.floaters.map((item) => `
                    <div class="nc-battle-floater ${item.tone ? `is-${item.tone}` : ''} ${item.size === 'major' ? 'is-major' : ''}" style="left:${item.x.toFixed(1)}%; top:${item.y.toFixed(1)}px;">
                        ${escapeHtml(item.text)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderBattleLaneEventStrip(lane) {
        if (!lane.events?.length) return '';
        return `
            <div class="nc-battle-event-strip">
                ${lane.events.slice(0, 3).map((event) => `
                    <span class="nc-tag nc-tag--mini ${event.tone ? `is-${event.tone}` : ''}">
                        ${event.icon} ${escapeHtml(event.label)}
                    </span>
                `).join('')}
            </div>
        `;
    }

    function renderBattleHandCard(cardId) {
        const battle = state.battle;
        const card = getBattleCardById(cardId);
        if (!card) return '';
        const cooldown = Math.max(0, battle.cooldowns[cardId] || 0);
        const ready = cooldown <= 0.05;
        const affordable = battle.energy >= card.cost;
        const selected = battle.selectedCardId === cardId;
        const feedbackTone = battle.commandFeedback?.cardId === cardId && battle.commandFeedback.until > battle.time
            ? battle.commandFeedback.tone || ''
            : '';
        const visual = getBattleCardVisual(card);
        const meta = getBattleCardCompactMeta(card);
        const stateLabel = ready
            ? (affordable ? text('可出', 'Ready') : text('缺能', 'Low'))
            : `${cooldown.toFixed(1)}s`;
        return `
            <button class="nc-hand-card nc-battle-hand ${selected ? 'is-selected' : ''} ${ready ? 'is-ready' : 'is-cooling'} ${affordable && ready ? 'is-affordable' : ''} ${feedbackTone ? `is-feedback-${feedbackTone}` : ''}" type="button" data-action="selectBattleCard" data-value="${cardId}" ${battle.active && !battle.reinforcementPending && !battle.result ? '' : 'disabled'}>
                <div class="nc-battle-hand-top">
                    <span class="nc-battle-hand-icon is-${visual.tone}" aria-hidden="true">${visual.icon}</span>
                    <span class="nc-battle-hand-cost">${escapeHtml(String(card.cost))}</span>
                </div>
                <strong>${escapeHtml(localize(card.name))}</strong>
                <span class="nc-battle-hand-meta">${escapeHtml(meta)}</span>
                <small class="nc-battle-hand-state ${ready ? (affordable ? 'is-ready' : 'is-warning') : 'is-cooling'}">${escapeHtml(stateLabel)}</small>
            </button>
        `;
    }

    function renderBattleBoostOverlay() {
        const battle = state.battle;
        return `
            <div class="nc-battle-overlay">
                <div class="nc-battle-overlay-card">
                    <div class="eyebrow">${escapeHtml(text('Mid-Battle Boost', 'Mid-Battle Boost'))}</div>
                    <h3>${escapeHtml(text('Choose 1 Boost', 'Choose 1 Boost'))}</h3>
                    <div class="nc-card-copy">${escapeHtml(text('This only lasts for this clash. Patch the weakest part of the run first.', 'This only lasts for this clash. Patch the weakest part of the run first.'))}</div>
                    <div class="nc-card-grid">
                        ${battle.reinforcementChoices.map((choice) => `
                            <article class="nc-card-item is-ready">
                                <div class="nc-card-head">
                                    <div>
                                        <h3>${renderIconLabel(choice.icon, localize(choice.title))}</h3>
                                        <div class="nc-card-copy">${escapeHtml(localize(choice.desc))}</div>
                                    </div>
                                </div>
                                <div class="nc-inline-note">${escapeHtml(localize(choice.short))}</div>
                                <div class="nc-action-row">
                                    <button class="primary-btn wide-btn" type="button" data-action="chooseBattleBoost" data-value="${choice.id}">${escapeHtml(text('Pick Boost', 'Pick Boost'))}</button>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderBattleResultOverlay() {
        const battle = state.battle;
        const result = battle.result;
        const nextChapter = result?.nextChapterId || '';
        const stageLabel = `${battle.chapter.id} • ${localize(battle.chapter.name)}`;
        const clearedCount = state.save.clearedChapters.length;
        const progressText = `${clearedCount}/${config.chapters.length}`;
        const totalLanes = Math.max(1, battle.lanes?.length || 1);
        const primaryAction = result.win
            ? { action: 'closeBattleResult', value: nextChapter || battle.chapter.id, label: nextChapter ? text(`前往 ${nextChapter}`, `Preview ${nextChapter}`) : text('返回对战', 'Back to Clash') }
            : { action: 'closeBattleResult', value: battle.chapter.id, label: text('重试当前章节', 'Retry Same Chapter') };
        return `
            <div class="nc-battle-overlay">
                <div class="nc-battle-overlay-card">
                    <div class="nc-result-hero">
                        <div>
                            <div class="eyebrow">${escapeHtml(result.win ? text('对战通关', 'Clash Cleared') : text('战术撤退', 'Tactical Retreat'))}</div>
                            <h3>${escapeHtml(stageLabel)}</h3>
                            <div class="nc-card-copy">${escapeHtml(result.summary)}</div>
                        </div>
                        <div class="nc-head-kpi">
                            <span class="nc-tag ${result.win ? 'is-good' : 'is-warning'}">${escapeHtml(result.win ? text('胜利', 'Victory') : text('撤退', 'Retreat'))}</span>
                            <strong>${escapeHtml(`${result.laneWins || 0}/${totalLanes}`)}</strong>
                        </div>
                    </div>
                    <div class="nc-stat-grid">
                        ${renderStatBox(text('我方核心', 'Ally Core'), `${Math.max(0, Number(result.allyCorePercent) || 0)}%`)}
                        ${renderStatBox(text('敌方核心', 'Enemy Core'), `${Math.max(0, Number(result.enemyCorePercent) || 0)}%`)}
                        ${renderStatBox(text('战斗用时', 'Time Used'), formatBattleTime(result.timeUsed || battle.time))}
                        ${renderStatBox(text('章节进度', 'Route'), progressText, text('已通关章节', 'Stages cleared'))}
                        ${renderStatBox(text('强化数', 'Boosts'), String(battle.boosts.length))}
                        ${renderStatBox(text('首领', 'Boss'), battle.bossDefeated ? text('已击破', 'Down') : isBossStage(battle.chapter) ? text('存活', 'Alive') : text('无', 'None'))}
                    </div>
                    <div class="nc-card-grid nc-card-grid--two">
                        <article class="nc-result-card">
                            <div class="nc-card-head">
                                <div>
                                    <h3>${renderIconLabel('&#9733;', text('本局奖励', 'Run Rewards'))}</h3>
                                    <div class="nc-card-copy">${escapeHtml(text('这里显示本局已即时到账的实际收益。', 'This section shows what the run actually paid out right now.'))}</div>
                                </div>
                            </div>
                            ${renderRewardPills(result.reward)}
                            ${result.firstClearReward ? `
                                <div class="nc-inline-note">
                                    <strong>${escapeHtml(text('首通加成', 'First Clear Bonus'))}</strong>
                                    ${renderRewardPills(result.firstClearReward)}
                                </div>
                            ` : result.firstClear ? `<div class="nc-inline-note">${escapeHtml(text('首通奖励已领取。', 'First clear reward secured.'))}</div>` : ''}
                            ${result.fragments?.length ? `<div class="nc-inline-note">${escapeHtml(formatFragmentSummary(result.fragments))}</div>` : ''}
                        </article>
                        ${renderBattleFollowupCard(result)}
                    </div>
                    <div class="nc-result-actions">
                        <button class="primary-btn wide-btn" type="button" data-action="${primaryAction.action}" data-value="${escapeHtml(primaryAction.value)}">${escapeHtml(primaryAction.label)}</button>
                        <button class="ghost-btn wide-btn" type="button" data-action="closeBattleResultOpenTab" data-value="deck">${escapeHtml(text('调整卡组', 'Tune Deck'))}</button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderChapterChip(chapter, index) {
        const active = chapter.id === state.save.selectedChapterId;
        const unlocked = isChapterUnlocked(index);
        const disabled = !unlocked || !!state.battle?.active;
        return `
            <button class="nc-chip ${active ? 'is-active' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-action="selectChapter" data-value="${chapter.id}" ${disabled ? 'disabled' : ''}>
                <span>${escapeHtml(chapter.id)}</span>
                <strong>${escapeHtml(localize(chapter.name))}</strong>
                <small>${escapeHtml(
                    state.battle?.active
                        ? (active ? text('Live Chapter', 'Live Chapter') : text('Locked During Clash', 'Locked During Clash'))
                        : unlocked
                            ? `${text('Power', 'Power')} ${chapter.recommended}`
                            : text('Locked', 'Locked')
                )}</small>
            </button>
        `;
    }

    function startClash() {
        if (state.battle?.active) {
            showToast(text('A clash is already in progress.', 'A clash is already in progress.'), 'warning');
            return;
        }
        closeModal();
        resetFreeClashWindow();
        const chapter = getSelectedChapter();
        const entry = getEntryCost(chapter);
        const freeLeft = getRemainingFreeClashes();
        if (freeLeft <= 0 && state.save.credits < entry) {
            showToast(text('Not enough credits to keep battling.', 'Not enough credits to keep battling.'), 'warning');
            return;
        }

        if (freeLeft > 0) {
            state.save.freeClashesUsedToday += 1;
        } else {
            state.save.credits -= entry;
        }

        state.save.lastResult = null;
        state.battle = createBattleState(chapter);
        saveProgress();
        renderAll();
        queueBattleStageScroll();
        startBattleLoop();
    }

    function selectBattleCard(cardId) {
        const battle = state.battle;
        if (!battle || !battle.active || battle.reinforcementPending || battle.result) return;
        const card = getBattleCardById(cardId);
        if (!card) return;
        const nextSelected = battle.selectedCardId === cardId ? '' : cardId;
        const cooldown = Math.max(0, battle.cooldowns[cardId] || 0);
        const affordable = battle.energy >= card.cost;
        battle.selectedCardId = nextSelected;
        markBattleCardFeedback(cardId, nextSelected ? (cooldown <= 0.05 && affordable ? 'good' : 'warning') : 'good');
        if (battle.lanes.length === 1 && nextSelected) {
            if (cooldown > 0.05) {
                markBattleNotice(text(`${localize(card.name)} 冷却 ${cooldown.toFixed(1)}s`, `${localize(card.name)} ready in ${cooldown.toFixed(1)}s`), 'warning', 1.15);
                renderClashRuntime();
                return;
            }
            if (!affordable) {
                markBattleNotice(text(`${localize(card.name)} 需要 ${card.cost} 点能量`, `${localize(card.name)} needs ${card.cost} energy`), 'warning', 1.15);
                renderClashRuntime();
                return;
            }
            playBattleCard(battle.lanes[0].id);
            return;
        }
        renderClashRuntime();
    }

    function playBattleCard(laneId) {
        const battle = state.battle;
        if (!battle || !battle.active || battle.reinforcementPending || battle.result) return;
        const lane = battle.lanes.find((item) => item.id === laneId);
        if (!lane) return;
        battle.focusLaneId = laneId;
        markLanePulse(laneId, 'good');

        if (!battle.selectedCardId) {
            syncBattleSelectedCard();
        }

        if (!battle.selectedCardId) {
            markBattleNotice(text('先点下方卡牌，再执行出兵。', 'Pick a card below before deploying.'), 'warning', 1.15);
            renderClashRuntime();
            return;
        }

        let card = getBattleCardById(battle.selectedCardId);
        if (!card) return;
        let cooldown = Math.max(0, battle.cooldowns[card.id] || 0);
        if (cooldown > 0.05) {
            markBattleCardFeedback(card.id, 'warning');
            markBattleNotice(text(`${localize(card.name)} 冷却 ${cooldown.toFixed(1)}s`, `${localize(card.name)} ready in ${cooldown.toFixed(1)}s`), 'warning', 1.15);
            renderClashRuntime();
            return;
        }
        if (battle.energy < card.cost) {
            markBattleCardFeedback(card.id, 'warning');
            markBattleNotice(text(`${localize(card.name)} 需要 ${card.cost} 点能量`, `${localize(card.name)} needs ${card.cost} energy`), 'warning', 1.15);
            renderClashRuntime();
            return;
        }

        if (card.type === 'unit') {
            if (lane.friendly.length >= 5) {
                markBattleNotice(text(`${getBattleLaneLabel(laneId)} 已满员，等前排推进后再补兵。`, 'This lane is full. Wait for your frontline to advance.'), 'warning');
                return;
            }
            battle.energy -= card.cost;
            lane.friendly.push(createFriendlyBattleUnit(card.id));
            pushBattleFloater(lane.id, {
                text: text('出兵', 'Deploy'),
                tone: 'good',
                x: 14,
                y: 56,
                size: 'major'
            });
            markLanePulse(laneId, 'good');
            markLaneImpact(laneId, 'good', 'ally');
            pushLaneEvent(laneId, '&#9654;', localize(card.name), 'good');
            markBattleArena('good', 0.9);
            battle.cooldowns[card.id] = getBattleCardCooldown(card);
            markBattleCardFeedback(card.id, 'good');
        } else {
            battle.energy -= card.cost;
            battle.cooldowns[card.id] = getBattleCardCooldown(card);
            const tacticTone = (card.id === 'shieldNet' || card.id === 'overclockBurst') ? 'good' : 'warning';
            markLanePulse(laneId, tacticTone);
            markLaneImpact(laneId, tacticTone, tacticTone === 'good' ? 'ally' : 'enemy');
            pushLaneEvent(laneId, '&#10038;', localize(card.name), tacticTone);
            markBattleArena(tacticTone, 1.1);
            markBattleBanner(localize(card.name), text(`${getBattleLaneLabel(laneId)} 战术生效`, `${getBattleLaneLabel(laneId)} tactic released`), tacticTone);
            markBattleCardFeedback(card.id, tacticTone === 'warning' ? 'warning' : 'good');
            applyBattleTactic(card.id, lane);
        }

        syncBattleSelectedCard(card.id);
        renderClashRuntime();
    }

    function useLeaderSkill() {
        const battle = state.battle;
        if (!battle || !battle.active || battle.reinforcementPending || battle.result) return;
        if (battle.leaderCharge < 100) {
            showToast(text('Leader skill is not charged yet.', 'Leader skill is not charged yet.'), 'warning');
            return;
        }
        applyLeaderSkill(battle.focusLaneId);
        battle.leaderCharge = 0;
        battle.leaderReadyMarked = false;
        pushLaneEvent('all', '&#9889;', text('Leader Burst', 'Leader Burst'), 'good');
        markBattleArena('good', 1.25);
        const leaderName = leaderMap[state.save.selectedLeaderId]
            ? localize(leaderMap[state.save.selectedLeaderId].name)
            : text('队长', 'Leader');
        markBattleBanner(text('领袖技能释放', 'Leader Skill Cast'), text(`${leaderName} 已进场支援`, `${leaderName} engaged`), 'good');
        renderClashRuntime();
    }

    function chooseBattleBoost(boostId) {
        const battle = state.battle;
        if (!battle || !battle.reinforcementPending) return;
        const boost = getBattleBoostDef(boostId);
        if (!boost) return;
        applyBattleBoost(boostId);
        battle.reinforcementPending = false;
        battle.reinforcementChoices = [];
        battle.boosts.push(boostId);
        pushLaneEvent('all', boost.icon, localize(boost.title), 'good');
        markBattleArena('good', 1.2);
        markBattleBanner(localize(boost.title), localize(boost.short), 'good');
        markBattleNotice(text(`已选择强化：${localize(boost.title)}。`, `Boost picked: ${localize(boost.title)}.`), 'good');
        renderClashRuntime();
    }

    function retreatBattle() {
        if (!state.battle?.active) return;
        finishBattle(false, true);
    }

    function closeBattleResultWithTab(nextChapterId = '', nextTab = 'clash') {
        stopBattleLoop();
        state.battle = null;
        let jumpedChapter = '';
        if (nextChapterId && chapterMap[nextChapterId]) {
            state.save.selectedChapterId = nextChapterId;
            jumpedChapter = nextChapterId;
        }
        state.tab = tabMap[nextTab] ? nextTab : 'clash';
        state.save.tab = state.tab;
        saveProgress();
        renderAll();
        if (state.tab === 'clash') {
            queueBattleStageScroll();
        }
        if (jumpedChapter) {
            showToast(text(`${jumpedChapter} 已就绪。`, `${jumpedChapter} ready.`), 'success');
        }
    }

    function closeBattleResult(nextChapterId = '') {
        closeBattleResultWithTab(nextChapterId, 'clash');
    }

    function openResultChapter(chapterId = '') {
        if (chapterId && chapterMap[chapterId]) {
            state.save.selectedChapterId = chapterId;
        }
        state.tab = 'clash';
        state.save.tab = 'clash';
        saveProgress();
        renderAll();
        queueBattleStageScroll();
    }

    function getPreferredOpeningBattleCardId(hand, startEnergy) {
        const cards = (hand || [])
            .map((cardId) => ({ cardId, card: getBattleCardById(cardId) }))
            .filter((item) => !!item.card);
        const preferredAffordable = cards
            .filter((item) => item.card.type === 'unit' && item.card.cost <= startEnergy)
            .sort((left, right) => {
                if (left.card.cost !== right.card.cost) return left.card.cost - right.card.cost;
                if ((left.card.stats?.hp || 0) !== (right.card.stats?.hp || 0)) return (right.card.stats?.hp || 0) - (left.card.stats?.hp || 0);
                return 0;
            })[0];
        if (preferredAffordable) return preferredAffordable.cardId;
        const fallbackAffordable = cards
            .filter((item) => item.card.cost <= startEnergy)
            .sort((left, right) => left.card.cost - right.card.cost)[0];
        if (fallbackAffordable) return fallbackAffordable.cardId;
        return cards.sort((left, right) => left.card.cost - right.card.cost)[0]?.cardId || '';
    }

    function getBattleChapterTuning(chapter) {
        const defaults = {
            playerCoreScale: 1,
            enemyCoreScale: 1,
            enemyStatScale: 1,
            startEnergy: 4,
            energyRegenScale: 1,
            nextWaveAt: 16,
            waveInterval: 16,
            reinforcementAt: 28,
            startSpawnDelay: 1.4,
            sideLaneSpawnDelay: 0.45,
            sideLaneIntervalLag: 0.18,
            spawnIntervalBonus: 0,
            minSpawnInterval: 1.4,
            bruteUnlockTime: 30,
            gunnerUnlockTime: 20,
            captainUnlockTime: 44,
            bossDelay: 0,
            timeBonus: 0,
            openingNotice: text('先点下方卡牌，再点一路出手。', 'Pick a card below, then tap a lane to deploy.'),
            openingBannerDetail: text('先稳住一条路，再向两侧滚动扩大优势。', 'Secure one lane first, then roll pressure outward.')
        };
        if (!chapter) return defaults;
        switch (String(chapter.id || '')) {
            case '1-1':
                return {
                    ...defaults,
                    playerCoreScale: 1.3,
                    enemyCoreScale: 0.66,
                    enemyStatScale: 0.6,
                    startEnergy: 8,
                    energyRegenScale: 1.34,
                    nextWaveAt: 30,
                    waveInterval: 21,
                    reinforcementAt: 40,
                    startSpawnDelay: 3.8,
                    sideLaneSpawnDelay: 1.2,
                    sideLaneIntervalLag: 0.24,
                    spawnIntervalBonus: 1.55,
                    minSpawnInterval: 2.9,
                    bruteUnlockTime: 36,
                    gunnerUnlockTime: 999,
                    captainUnlockTime: 999,
                    bossDelay: 10,
                    timeBonus: 14,
                    openingNotice: text('第一章先教学单路线：点亮起的卡，再点主线出兵。', 'Chapter 1 starts with one lane: tap a glowing card, then deploy to Main.'),
                    openingBannerDetail: text('第一关只开 1 条主线，先熟悉出兵与能量节奏。', 'Stage 1 only uses one main lane so you can learn deployment and energy timing.')
                };
            case '1-2':
                return {
                    ...defaults,
                    playerCoreScale: 1.18,
                    enemyCoreScale: 0.8,
                    enemyStatScale: 0.74,
                    startEnergy: 6.2,
                    energyRegenScale: 1.2,
                    nextWaveAt: 25,
                    waveInterval: 18.5,
                    reinforcementAt: 35,
                    startSpawnDelay: 3,
                    sideLaneSpawnDelay: 0.9,
                    sideLaneIntervalLag: 0.2,
                    spawnIntervalBonus: 1.05,
                    minSpawnInterval: 2.35,
                    bruteUnlockTime: 24,
                    gunnerUnlockTime: 48,
                    captainUnlockTime: 999,
                    bossDelay: 5,
                    timeBonus: 9,
                    openingNotice: text('第二关仍是单路线，先学会让前排与后排轮流上场。', 'Stage 2 is still single-lane. Learn to rotate frontline and backline.'),
                    openingBannerDetail: text('敌人会更稳地推进，但仍只需处理 1 条主线。', 'Enemies push more steadily, but you still only manage one main lane.')
                };
            case '1-3':
                return {
                    ...defaults,
                    playerCoreScale: 1.14,
                    enemyCoreScale: 0.86,
                    enemyStatScale: 0.82,
                    startEnergy: 5.9,
                    energyRegenScale: 1.14,
                    nextWaveAt: 22,
                    waveInterval: 17.5,
                    reinforcementAt: 32,
                    startSpawnDelay: 2.6,
                    sideLaneSpawnDelay: 0.8,
                    sideLaneIntervalLag: 0.18,
                    spawnIntervalBonus: 0.72,
                    minSpawnInterval: 2.15,
                    bruteUnlockTime: 20,
                    gunnerUnlockTime: 33,
                    captainUnlockTime: 999,
                    bossDelay: 6,
                    timeBonus: 8,
                    openingNotice: text('首个首领关仍只守 1 条主线，先稳住前排再交技能。', 'The first boss stage is still one lane. Stabilize the frontline before using your skill.'),
                    openingBannerDetail: text('先打熟单路线首领，再在第 2 章开始双路线。', 'Learn the boss in single-lane mode before Chapter 2 unlocks two lanes.')
                };
            case '2-1':
                return {
                    ...defaults,
                    playerCoreScale: 1.02,
                    enemyCoreScale: 1,
                    enemyStatScale: 0.98,
                    startEnergy: 4.5,
                    energyRegenScale: 1.02,
                    nextWaveAt: 18,
                    waveInterval: 15.5,
                    reinforcementAt: 28,
                    startSpawnDelay: 1.8,
                    sideLaneSpawnDelay: 0.5,
                    sideLaneIntervalLag: 0.18,
                    spawnIntervalBonus: 0.15,
                    minSpawnInterval: 1.75,
                    bruteUnlockTime: 12,
                    gunnerUnlockTime: 18,
                    captainUnlockTime: 999,
                    bossDelay: 2,
                    timeBonus: 2,
                    openingNotice: text('第 2 章开放双路线：先守主线，再照顾侧线。', 'Chapter 2 unlocks two lanes: hold Main first, then cover Side.')
                };
            case '2-2':
                return {
                    ...defaults,
                    enemyCoreScale: 1.02,
                    enemyStatScale: 1.02,
                    startEnergy: 4.2,
                    nextWaveAt: 17,
                    waveInterval: 15.2,
                    reinforcementAt: 27,
                    startSpawnDelay: 1.7,
                    sideLaneSpawnDelay: 0.45,
                    sideLaneIntervalLag: 0.16,
                    spawnIntervalBonus: 0.05,
                    minSpawnInterval: 1.65,
                    bruteUnlockTime: 10,
                    gunnerUnlockTime: 16,
                    captainUnlockTime: 34,
                    bossDelay: 1,
                    openingNotice: text('控制型敌人开始出现，战术牌要更及时。', 'Control enemies appear here. Use tactics on time.')
                };
            default:
                break;
        }
        const chapterDepth = Math.max(0, (Number(chapter.chapter) || 1) - 2);
        return {
            ...defaults,
            enemyStatScale: 1 + (chapterDepth * 0.05),
            nextWaveAt: Math.max(14, defaults.nextWaveAt - chapterDepth),
            waveInterval: Math.max(13.5, defaults.waveInterval - (chapterDepth * 0.6)),
            reinforcementAt: Math.max(24, defaults.reinforcementAt - chapterDepth),
            startSpawnDelay: Math.max(1.35, defaults.startSpawnDelay - (chapterDepth * 0.08)),
            minSpawnInterval: Math.max(1.35, defaults.minSpawnInterval - (chapterDepth * 0.04)),
            bruteUnlockTime: Math.max(8, defaults.bruteUnlockTime - (chapterDepth * 4)),
            gunnerUnlockTime: Math.max(12, defaults.gunnerUnlockTime - (chapterDepth * 3)),
            captainUnlockTime: Math.max(24, defaults.captainUnlockTime - (chapterDepth * 4)),
            openingNotice: text('先守住焦点路线，再用战术去摆动侧路。', 'Stabilize the focus lane first, then swing side lanes with tactics.')
        };
    }

    function createBattleState(chapter) {
        const tuning = getBattleChapterTuning(chapter);
        const energyLevel = getResearchLevel('energyMatrix');
        const tacticLevel = getResearchLevel('tacticCompiler');
        const hand = [...state.save.selectedUnits, state.save.selectedTacticId];
        const chapterIndex = Math.max(0, getChapterIndex(chapter.id));
        const deckPower = getDeckPower();
        const playerCoreBase = Math.round((220 + Math.round(deckPower * 0.08)) * tuning.playerCoreScale);
        const enemyCoreBase = Math.round((180 + Math.round(chapter.recommended * 0.24)) * tuning.enemyCoreScale);
        const laneIds = getBattleLaneIdsForChapter(chapter);
        return {
            active: true,
            result: null,
            chapter,
            time: 0,
            maxTime: Math.round((Number(config.battle.sessionSeconds) || 72) + tuning.timeBonus),
            wave: 1,
            nextWaveAt: tuning.nextWaveAt,
            waveInterval: tuning.waveInterval,
            pausedByVisibility: false,
            reinforcementPending: false,
            reinforcementChoices: [],
            selectedCardId: getPreferredOpeningBattleCardId(hand, tuning.startEnergy),
            hand,
            cooldowns: Object.fromEntries(hand.map((id) => [id, 0])),
            energy: tuning.startEnergy,
            maxEnergy: 10 + Math.floor(energyLevel / 4),
            energyRegen: 1 * (1 + (energyLevel * 0.02) + (hasStarterPaymentPerk() ? 0.03 : 0)) * tuning.energyRegenScale,
            leaderCharge: 0,
            leaderChargeRate: (Number(leaderMap[state.save.selectedLeaderId]?.stats?.charge) || 1) * (1.45 + (tacticLevel * 0.03)) * (hasCaptainPaymentPerk() ? 1.06 : 1),
            leaderReadyMarked: false,
            focusLaneId: getPrimaryBattleLaneIdFromIds(laneIds),
            boosts: [],
            rewardBoost: 0,
            tacticCooldownFactor: 1,
            attackBoost: 0,
            speedBoost: 0,
            spawnSlowRemaining: 0,
            bossDefeated: false,
            arenaTone: '',
            arenaGlowUntil: 0,
            tuning,
            banner: null,
            notice: null,
            lanes: laneIds.map((id) => ({
                id,
                playerCoreMax: Math.round(playerCoreBase * getBattleLaneScale(id, laneIds)),
                playerCoreHp: Math.round(playerCoreBase * getBattleLaneScale(id, laneIds)),
                enemyCoreMax: Math.round(enemyCoreBase * getBattleLaneScale(id, laneIds)),
                enemyCoreHp: Math.round(enemyCoreBase * getBattleLaneScale(id, laneIds)),
                friendly: [],
                enemy: [],
                effects: [],
                events: [],
                floaters: [],
                spawnTimer: tuning.startSpawnDelay + (laneIds.indexOf(id) * tuning.sideLaneSpawnDelay),
                spawnCount: 0,
                bossSpawned: false,
                pulseTone: '',
                pulseUntil: 0,
                impactTone: '',
                impactUntil: 0,
                impactSide: '',
                allyCoreAlertStage: 0,
                enemyCoreAlertStage: 0,
                chapterIndex
            }))
        };
    }

    function startBattleLoop() {
        stopBattleLoop();
        state.battleLoopId = window.setInterval(tickBattleLoop, 220);
    }

    function stopBattleLoop() {
        if (state.battleLoopId) {
            window.clearInterval(state.battleLoopId);
            state.battleLoopId = 0;
        }
    }

    function tickBattleLoop() {
        const battle = state.battle;
        if (!battle || battle.result || !battle.active) {
            stopBattleLoop();
            return;
        }
        if (battle.pausedByVisibility || battle.reinforcementPending) {
            renderClashRuntime();
            return;
        }

        const delta = 0.22;
        battle.time += delta;
        battle.energy = Math.min(battle.maxEnergy, battle.energy + (battle.energyRegen * delta));
        battle.leaderCharge = Math.min(100, battle.leaderCharge + (battle.leaderChargeRate * delta));
        battle.spawnSlowRemaining = Math.max(0, battle.spawnSlowRemaining - delta);

        if (battle.leaderCharge >= 100 && !battle.leaderReadyMarked) {
            battle.leaderReadyMarked = true;
            markBattleArena('good', 0.9);
            markBattleBanner(
                text('领袖技就绪', 'Leader Skill Ready'),
                text(`点击下方按钮，强攻 ${getBattleLaneLabel(battle.focusLaneId)}。`, `Tap the button below to burst ${getBattleLaneLabel(battle.focusLaneId)}.`),
                'good'
            );
        }

        Object.keys(battle.cooldowns).forEach((cardId) => {
            battle.cooldowns[cardId] = Math.max(0, (battle.cooldowns[cardId] || 0) - delta);
        });

        if (battle.time >= battle.nextWaveAt && battle.wave < 4) {
            battle.wave += 1;
            battle.nextWaveAt += battle.waveInterval || 16;
            pushLaneEvent('all', '&#10039;', `${text('Wave', 'Wave')} ${battle.wave}`, 'warning');
            markBattleArena('warning', 1.3);
            markBattleBanner(`Wave ${battle.wave}`, 'Enemy pressure is rising. Stabilize your focus lane first.', 'warning');
        }

        if (!battle.reinforcementPending && !battle.boosts.length && battle.time >= (battle.tuning?.reinforcementAt || 28)) {
            battle.reinforcementPending = true;
            battle.reinforcementChoices = pickBattleBoostChoices();
            markBattleArena('good', 1.1);
            markBattleBanner('Mid-Battle Boost', 'Pick one patch upgrade, then keep the pressure on.', 'good');
            renderClashRuntime();
            return;
        }

        battle.lanes.forEach((lane) => tickBattleLane(lane, delta));

        if (getBattleCoreRatio('enemy') <= 0) {
            finishBattle(true, false);
            return;
        }
        if (getBattleCoreRatio('ally') <= 0) {
            finishBattle(false, false);
            return;
        }
        if (battle.time >= battle.maxTime) {
            finishBattle(determineBattleWin(), false);
            return;
        }

        renderClashRuntime();
    }

    function tickBattleLane(lane, delta) {
        const battle = state.battle;
        lane.effects = lane.effects
            .map((effect) => ({ ...effect, remaining: Math.max(0, effect.remaining - delta) }))
            .filter((effect) => effect.remaining > 0);
        lane.events = (lane.events || []).filter((event) => event.until > battle.time);
        lane.floaters = (lane.floaters || []).filter((item) => item.until > battle.time);

        const spawnDelta = battle.spawnSlowRemaining > 0 ? delta * 0.5 : delta;
        lane.spawnTimer -= spawnDelta;
        const bossMoment = Math.min(
            battle.maxTime - 6,
            Math.max(42, battle.maxTime - 16) + (battle.tuning?.bossDelay || 0)
        );
        if (!lane.bossSpawned && isBossStage(battle.chapter) && lane.id === 'mid' && battle.time >= bossMoment) {
            lane.bossSpawned = true;
            lane.enemy.push(createEnemyBattleUnit(lane, 'boss'));
            markLanePulse(lane.id, 'warning');
            markLaneImpact(lane.id, 'warning', 'enemy', 1.2);
            pushLaneEvent(lane.id, '&#9888;', text('首领', 'Boss'), 'warning', 2.6);
            markBattleArena('warning', 1.5);
            markBattleBanner(text('首领到场', 'Boss Arrived'), text(`${getBattleLaneLabel(lane.id)} 压力瞬间拉高，优先稳住前排。`, `${getBattleLaneLabel(lane.id)} pressure spikes instantly. Hold the frontline first.`), 'warning');
        }

        if (lane.spawnTimer <= 0 && lane.enemy.length < 5) {
            lane.enemy.push(createEnemyBattleUnit(lane, pickEnemyArchetype(lane)));
            lane.spawnCount += 1;
            lane.spawnTimer = getEnemySpawnInterval(lane);
        }

        tickBattleUnits(lane.friendly, lane.enemy, lane, delta, 'ally');
        tickBattleUnits(lane.enemy, lane.friendly, lane, delta, 'enemy');

        lane.friendly = lane.friendly.filter((unit) => unit.hp > 0);
        lane.enemy = lane.enemy.filter((unit) => {
            if (unit.hp > 0) return true;
            if (unit.isBoss) {
                state.battle.bossDefeated = true;
                pushLaneEvent(lane.id, '&#10003;', text('首领击破', 'Boss Down'), 'good', 2.4);
                markLaneImpact(lane.id, 'good', 'ally', 1.1);
                markBattleArena('good', 1.3);
            }
            return false;
        });

        checkBattleCoreBreakpoints(lane);
    }

    function tickBattleUnits(allies, enemies, lane, delta, side) {
        const battle = state.battle;
        allies.forEach((unit) => {
            unit.attackCooldown = Math.max(0, unit.attackCooldown - delta);
            const attackBonus = side === 'ally' ? (battle.attackBoost + getLaneEffectBonus(lane, 'ally', 'attack')) : 0;
            const speedBonus = side === 'ally' ? (battle.speedBoost + getLaneEffectBonus(lane, 'ally', 'speed')) : 0;
            const jammed = side === 'enemy' && getLaneEffectBonus(lane, 'enemy', 'jam') > 0;

            if (unit.heal > 0 && side === 'ally') {
                const injured = allies
                    .filter((item) => item.hp > 0 && item.hp < item.maxHp)
                    .sort((left, right) => (left.hp / left.maxHp) - (right.hp / right.maxHp))[0];
                if (injured && unit.attackCooldown <= 0) {
                    const healed = Math.min(unit.heal, injured.maxHp - injured.hp);
                    injured.hp = Math.min(injured.maxHp, injured.hp + unit.heal);
                    if (healed > 0 && (!injured.floatUntil || injured.floatUntil <= battle.time)) {
                        pushBattleFloater(lane.id, {
                            text: `+${Math.round(healed)}`,
                            tone: 'good',
                            x: injured.x,
                            y: 58,
                            size: 'tiny'
                        });
                        injured.floatUntil = battle.time + 0.45;
                    }
                    unit.attackCooldown = Math.max(0.7, 1.25 / Math.max(0.4, unit.speed * (1 + speedBonus)));
                    return;
                }
            }

            const target = findBattleTarget(unit, enemies);
            if (target) {
                const distance = Math.abs(unit.x - target.x);
                if (distance <= unit.range) {
                    if (unit.attackCooldown <= 0 && !jammed) {
                        const damage = unit.attack * (1 + attackBonus);
                        unit.actionUntil = battle.time + 0.18;
                        target.hitUntil = battle.time + 0.24;
                        const totalLoss = applyBattleDamage(target, damage);
                        if (totalLoss > 0 && ((!target.floatUntil || target.floatUntil <= battle.time) || totalLoss >= 24 || target.hp <= 0)) {
                            pushBattleFloater(lane.id, {
                                text: `-${Math.round(totalLoss)}`,
                                tone: side === 'ally' ? 'good' : 'warning',
                                x: target.x,
                                y: side === 'ally' ? 22 : 58,
                                size: totalLoss >= 28 || target.hp <= 0 ? 'major' : 'tiny'
                            });
                            target.floatUntil = battle.time + 0.42;
                        }
                        if (unit.splash > 0) {
                            const secondary = enemies.find((enemy) => enemy !== target && enemy.hp > 0);
                            if (secondary) {
                                secondary.hitUntil = battle.time + 0.24;
                                const splashLoss = applyBattleDamage(secondary, damage * unit.splash);
                                if (splashLoss > 0 && (!secondary.floatUntil || secondary.floatUntil <= battle.time)) {
                                    pushBattleFloater(lane.id, {
                                        text: `-${Math.round(splashLoss)}`,
                                        tone: side === 'ally' ? 'good' : 'warning',
                                        x: secondary.x,
                                        y: side === 'ally' ? 18 : 62,
                                        size: 'tiny'
                                    });
                                    secondary.floatUntil = battle.time + 0.5;
                                }
                            }
                        }
                        unit.attackCooldown = Math.max(0.55, 1.1 / Math.max(0.4, unit.speed * (1 + speedBonus)));
                    }
                } else {
                    const direction = side === 'ally' ? 1 : -1;
                    unit.x += direction * unit.speed * (1 + speedBonus) * 6.4 * delta;
                }
            } else {
                const coreX = side === 'ally' ? 96 : 4;
                const coreDistance = Math.abs(unit.x - coreX);
                if (coreDistance <= unit.range + 2) {
                    if (unit.attackCooldown <= 0 && !jammed) {
                        unit.actionUntil = battle.time + 0.18;
                        const damage = unit.attack * (side === 'ally' ? (1 + attackBonus) : 1) * (unit.isBoss ? 1.14 : 0.82);
                        if (side === 'ally') {
                            lane.enemyCoreHp = Math.max(0, lane.enemyCoreHp - damage);
                            markLaneImpact(lane.id, 'good', 'ally', 0.35);
                            if (!lane.enemyCoreFloatUntil || lane.enemyCoreFloatUntil <= battle.time) {
                                pushBattleFloater(lane.id, {
                                    text: `核 -${Math.round(damage)}`,
                                    tone: 'good',
                                    x: 91,
                                    y: 24,
                                    size: 'major'
                                });
                                lane.enemyCoreFloatUntil = battle.time + 0.48;
                            }
                        } else {
                            lane.playerCoreHp = Math.max(0, lane.playerCoreHp - damage);
                            markLaneImpact(lane.id, 'warning', 'enemy', 0.35);
                            if (!lane.playerCoreFloatUntil || lane.playerCoreFloatUntil <= battle.time) {
                                pushBattleFloater(lane.id, {
                                    text: `核 -${Math.round(damage)}`,
                                    tone: 'warning',
                                    x: 9,
                                    y: 56,
                                    size: 'major'
                                });
                                lane.playerCoreFloatUntil = battle.time + 0.48;
                            }
                        }
                        unit.attackCooldown = Math.max(0.6, 1.2 / Math.max(0.4, unit.speed * (1 + speedBonus)));
                    }
                } else {
                    const direction = side === 'ally' ? 1 : -1;
                    unit.x += direction * unit.speed * (1 + speedBonus) * 6.8 * delta;
                }
            }

            unit.x = clampNumber(unit.x, side === 'ally' ? 6 : 12, 4, 96);
        });
    }

    function finishBattle(win, retreated = false) {
        const battle = state.battle;
        if (!battle || battle.result) return;
        stopBattleLoop();

        const reward = calculateBattleReward(win, retreated);
        const firstClear = win && !state.save.clearedChapters.includes(battle.chapter.id) ? getFirstClearReward(battle.chapter) : null;
        const fragments = (win ? rollClashFragments(battle.chapter) : rollClashFragments(battle.chapter).slice(0, 1).map((item) => ({ ...item, amount: Math.max(2, Math.round(item.amount * 0.5)) })));

        grantReward(reward);
        if (firstClear) {
            grantReward(firstClear);
            state.save.clearedChapters.push(battle.chapter.id);
        }
        fragments.forEach((item) => addFragments(item.id, item.amount));

        state.save.stats.duels += 1;
        if (win) state.save.stats.wins += 1;
        if (win && (battle.bossDefeated || isBossStage(battle.chapter))) state.save.stats.bossWins += 1;

        state.save.lastResult = {
            chapterId: battle.chapter.id,
            win,
            reward,
            firstClear: !!firstClear,
            firstClearReward: firstClear,
            fragments,
            timeUsed: battle.time,
            laneWins: getBattleLaneWinCount(battle),
            totalLanes: battle.lanes.length,
            allyCorePercent: getBattleCorePercent('ally'),
            enemyCorePercent: getBattleCorePercent('enemy'),
            nextChapterId: win ? getNextUnlockedChapterId(battle.chapter.id) : ''
        };

        battle.active = false;
        battle.result = {
            win,
            reward,
            firstClear: !!firstClear,
            firstClearReward: firstClear,
            fragments,
            timeUsed: battle.time,
            laneWins: getBattleLaneWinCount(battle),
            totalLanes: battle.lanes.length,
            allyCorePercent: getBattleCorePercent('ally'),
            enemyCorePercent: getBattleCorePercent('enemy'),
            nextChapterId: win ? getNextUnlockedChapterId(battle.chapter.id) : '',
            summary: retreated
                ? text('The clash has been retreated. Partial rewards were granted based on progress. Strengthen your focused lane first.', 'The clash has been retreated. Partial rewards were granted based on progress. Strengthen your focused lane first.')
                : win
                    ? text('You broke through the enemy core. Your current deck and lab are strong enough to keep pushing.', 'You broke through the enemy core. Your current deck and lab are strong enough to keep pushing.')
                    : text('Time ran out before the enemy core fully broke. Raise power and improve mid-fight boosts first.', 'Time ran out before the enemy core fully broke. Raise power and improve mid-fight boosts first.')
        };

        saveProgress();
        showToast(
            retreated
                ? text('Battle retreated with partial rewards.', 'Battle retreated with partial rewards.')
                : win
                    ? text('Clash won.', 'Clash won.')
                    : text('The clash did not fully clear but partial rewards were granted.', 'The clash did not fully clear but partial rewards were granted.'),
            win ? 'success' : 'warning'
        );
        renderAll();
    }

    function calculateBattleReward(win, retreated) {
        const battle = state.battle;
        const chapter = battle.chapter;
        const enemyBreak = 1 - getBattleCoreRatio('enemy');
        const allyHold = getBattleCoreRatio('ally');
        const rewardFactor = win
            ? (0.96 + (enemyBreak * 0.24) + (battle.rewardBoost || 0))
            : ((retreated ? 0.34 : 0.44) + (enemyBreak * 0.24));
        const incomeBoost = 1 + (getResearchLevel('bountyRelay') * 0.03);
        return {
            credits: Math.round(chapter.reward.credits * rewardFactor * incomeBoost),
            tactCores: Math.round(chapter.reward.tactCores * Math.max(0.45, rewardFactor) * incomeBoost),
            cipherChips: win ? Math.round(chapter.reward.cipherChips + (battle.bossDefeated ? 1 : 0)) : 0,
            seasonXp: Math.round(chapter.reward.seasonXp * (win ? (0.92 + (allyHold * 0.18)) : 0.58))
        };
    }

    function determineBattleWin() {
        const battle = state.battle;
        const enemyRatio = getBattleCoreRatio('enemy');
        const allyRatio = getBattleCoreRatio('ally');
        if (enemyRatio <= 0) return true;
        if (allyRatio <= 0) return false;
        if (battle.bossDefeated && enemyRatio <= allyRatio + 0.05) return true;
        const laneWins = battle.lanes.filter((lane) => lane.enemyCoreHp < lane.playerCoreHp).length;
        return enemyRatio < allyRatio || laneWins >= getBattleRequiredLaneWins(battle);
    }

    function createFriendlyBattleUnit(cardId) {
        const card = unitMap[cardId];
        const stats = getBattleUnitStats(cardId);
        return {
            id: `ally-${cardId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            side: 'ally',
            cardId,
            name: card.name,
            lane: card.lane,
            role: card.role,
            hp: stats.hp,
            maxHp: stats.hp,
            shield: 0,
            attack: stats.attack,
            speed: stats.speed,
            range: stats.range,
            heal: stats.heal,
            splash: stats.splash,
            x: 8,
            attackCooldown: 0.4,
            spawnUntil: (state.battle?.time || 0) + 0.42,
            actionUntil: 0,
            hitUntil: 0
        };
    }

    function createEnemyBattleUnit(lane, archetype) {
        const battle = state.battle;
        const chapter = battle.chapter;
        const chapterIndex = Math.max(0, getChapterIndex(chapter.id));
        const scale = (1 + (chapter.chapter * 0.14) + (chapterIndex * 0.07) + (battle.time * 0.004)) * (battle.tuning?.enemyStatScale || 1);
        const template = getEnemyArchetype(archetype);
        return {
            id: `enemy-${archetype}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            side: 'enemy',
            archetype,
            name: template.name,
            hp: Math.round(template.hp * scale),
            maxHp: Math.round(template.hp * scale),
            shield: 0,
            attack: Math.round(template.attack * scale),
            speed: template.speed,
            range: template.range,
            heal: 0,
            splash: template.splash || 0,
            x: 92,
            isBoss: archetype === 'boss',
            attackCooldown: 0.8,
            spawnUntil: (state.battle?.time || 0) + 0.42,
            actionUntil: 0,
            hitUntil: 0
        };
    }

    function getBattleUnitStats(cardId) {
        const card = unitMap[cardId];
        const level = getCardLevel('unit', cardId);
        const star = getCardStar('unit', cardId);
        const levelAttack = 1 + ((level - 1) * 0.06);
        const levelHp = 1 + ((level - 1) * 0.08);
        const starBonus = 1 + ((star - 1) * 0.14);
        let attack = (Number(card.stats.attack) || 0) * levelAttack * starBonus;
        let hp = (Number(card.stats.hp) || 0) * levelHp * starBonus;
        let speed = (Number(card.stats.speed) || 1) * (1 + ((level - 1) * 0.012) + ((star - 1) * 0.025));
        if (card.lane === 'front') hp *= 1 + (getResearchLevel('frontlineArmor') * 0.04);
        if (card.lane === 'back') attack *= 1 + (getResearchLevel('fireControl') * 0.035);
        if (hasChampionPaymentPerk()) {
            attack *= 1.08;
            hp *= 1.08;
        }
        return {
            attack: Math.round(attack),
            hp: Math.round(hp),
            speed,
            range: card.lane === 'back' ? 22 : card.id === 'repairPixie' ? 16 : 12,
            heal: card.id === 'repairPixie' ? Math.round(18 * levelAttack * starBonus) : 0,
            splash: card.id === 'chainBrute' ? 0.45 : 0
        };
    }

    function getEnemyArchetype(id) {
        const map = {
            skirmisher: { name: { zh: '裂隙侦察兵', en: 'Rift Scout' }, attack: 16, hp: 104, speed: 1.02, range: 12 },
            brute: { name: { zh: '钢栅重兵', en: 'Steel Brute' }, attack: 12, hp: 164, speed: 0.74, range: 12, splash: 0.25 },
            gunner: { name: { zh: '脉冲枪手', en: 'Pulse Gunner' }, attack: 24, hp: 92, speed: 0.88, range: 22 },
            captain: { name: { zh: '织网指挥官', en: 'Net Captain' }, attack: 28, hp: 148, speed: 0.82, range: 16 },
            boss: { name: { zh: '深渊主机', en: 'Abyss Mainframe' }, attack: 34, hp: 440, speed: 0.68, range: 16, splash: 0.35 }
        };
        return map[id] || map.skirmisher;
    }

    function pickEnemyArchetype(lane) {
        const battle = state.battle;
        const time = battle.time;
        const tuning = battle.tuning || getBattleChapterTuning(battle.chapter);
        const canCaptain = time >= tuning.captainUnlockTime && lane.spawnCount >= 6;
        const canGunner = time >= tuning.gunnerUnlockTime && lane.spawnCount >= 3;
        const canBrute = time >= tuning.bruteUnlockTime;
        if (canCaptain && Math.random() > 0.84) return 'captain';
        if (canGunner && Math.random() > 0.72) return 'gunner';
        if (canBrute && (lane.spawnCount % 3 === 2 || Math.random() > 0.8)) return 'brute';
        return 'skirmisher';
    }

    function getEnemySpawnInterval(lane) {
        const battle = state.battle;
        const tuning = battle.tuning || getBattleChapterTuning(battle.chapter);
        const chapter = battle.chapter.chapter;
        const base = 3.6 - (chapter * 0.22) - (battle.time * 0.012) + tuning.spawnIntervalBonus;
        const primaryLaneId = getPrimaryBattleLaneId();
        return Math.max(tuning.minSpawnInterval, base + (lane.id === primaryLaneId ? 0 : tuning.sideLaneIntervalLag));
    }

    function findBattleTarget(unit, enemies) {
        if (!enemies.length) return null;
        const alive = enemies.filter((enemy) => enemy.hp > 0);
        if (!alive.length) return null;
        return alive.sort((left, right) => Math.abs(left.x - unit.x) - Math.abs(right.x - unit.x))[0];
    }

    function applyBattleDamage(target, damage) {
        const beforeShield = Math.max(0, Number(target.shield) || 0);
        const beforeHp = Math.max(0, Number(target.hp) || 0);
        let amount = Math.max(1, Number(damage) || 0);
        if (target.shield > 0) {
            const shieldLoss = Math.min(target.shield, amount);
            target.shield -= shieldLoss;
            amount -= shieldLoss;
        }
        if (amount > 0) target.hp = Math.max(0, target.hp - amount);
        return Math.max(0, (beforeShield - Math.max(0, Number(target.shield) || 0)) + (beforeHp - Math.max(0, Number(target.hp) || 0)));
    }

    function getLaneEffectBonus(lane, side, key) {
        return lane.effects.reduce((sum, effect) => {
            if (effect.side !== side) return sum;
            return sum + (Number(effect[key]) || 0);
        }, 0);
    }

    function applyBattleTactic(tacticId, lane) {
        const battle = state.battle;
        const impact = getBattleTacticImpact(tacticId);
        if (tacticId === 'overclockBurst') {
            lane.effects.push({ side: 'ally', attack: 0.22 * impact, speed: 0.18 * impact, remaining: 6.2 });
            pushBattleFloater(lane.id, { text: text('超频', 'Overclock'), tone: 'good', x: 22, y: 54, size: 'major' });
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} is overclocked.`, `${getBattleLaneLabel(lane.id)} is overclocked.`), 'good');
            return;
        }
        if (tacticId === 'shieldNet') {
            lane.playerCoreHp = Math.min(lane.playerCoreMax, lane.playerCoreHp + (28 * impact));
            lane.friendly.forEach((unit) => {
                unit.shield += 48 * impact;
            });
            pushBattleFloater(lane.id, { text: text('护盾网', 'Shield Up'), tone: 'good', x: 16, y: 56, size: 'major' });
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} received shields.`, `${getBattleLaneLabel(lane.id)} received shields.`), 'good');
            return;
        }
        if (tacticId === 'empLock') {
            lane.effects.push({ side: 'enemy', jam: 1, remaining: 3.6 + (impact * 0.4) });
            pushBattleFloater(lane.id, { text: 'EMP', tone: 'warning', x: 78, y: 24, size: 'major' });
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} is hit by EMP lock.`, `${getBattleLaneLabel(lane.id)} is hit by EMP lock.`), 'warning');
            return;
        }
        if (tacticId === 'orbitalDrop') {
            if (lane.enemy.length) {
                lane.enemy.forEach((unit) => applyBattleDamage(unit, 78 * impact));
            } else {
                lane.enemyCoreHp = Math.max(0, lane.enemyCoreHp - (64 * impact));
            }
            pushBattleFloater(lane.id, { text: text('轨道打击', 'Orbital'), tone: 'warning', x: 76, y: 18, size: 'major' });
            markBattleNotice(text(`Orbital strike hit ${getBattleLaneLabel(lane.id)}.`, `Orbital strike hit ${getBattleLaneLabel(lane.id)}.`), 'warning');
        }
    }

    function applyLeaderSkill(laneId) {
        const battle = state.battle;
        const leaderId = state.save.selectedLeaderId;
        const lane = battle.lanes.find((item) => item.id === laneId) || battle.lanes[0];
        const leaderPower = getCardPower('leader', leaderId);
        if (leaderId === 'marshalZero') {
            battle.lanes.forEach((item) => {
                item.effects.push({ side: 'ally', attack: 0.18 + (leaderPower / 1800), speed: 0.12, remaining: 6.5 });
                pushBattleFloater(item.id, { text: text('全线超频', 'All Burst'), tone: 'good', x: 50, y: 36, size: 'major' });
            });
            markLanePulse('all', 'good');
            markBattleNotice(text('Marshal Zero overclocked every lane.', 'Marshal Zero overclocked every lane.'), 'good');
            return;
        }
        if (leaderId === 'aegisNova') {
            battle.lanes.forEach((item) => {
                item.playerCoreHp = Math.min(item.playerCoreMax, item.playerCoreHp + (36 + (leaderPower * 0.12)));
                item.friendly.forEach((unit) => { unit.shield += 64 + (leaderPower * 0.08); });
                pushBattleFloater(item.id, { text: text('全线护盾', 'Field Shield'), tone: 'good', x: 24, y: 54, size: 'major' });
            });
            markLanePulse('all', 'good');
            markBattleNotice(text('Aegis Nova reinforced shields across the field.', 'Aegis Nova reinforced shields across the field.'), 'good');
            return;
        }
        lane.enemy.forEach((unit) => applyBattleDamage(unit, 88 + (leaderPower * 0.42)));
        lane.effects.push({ side: 'ally', attack: 0.12, speed: 0.22, remaining: 5.5 });
        markLanePulse(lane.id, 'warning');
        pushBattleFloater(lane.id, { text: text('爆发节奏', 'Burst Tempo'), tone: 'warning', x: 64, y: 28, size: 'major' });
        markBattleNotice(text(`${getBattleLaneLabel(lane.id)} gained burst tempo.`, `${getBattleLaneLabel(lane.id)} gained burst tempo.`), 'warning');
    }

    function getBattleTacticImpact(tacticId) {
        const level = getCardLevel('tactic', tacticId);
        const star = getCardStar('tactic', tacticId);
        const base = Number(tacticMap[tacticId]?.stats?.impact) || 1;
        return base * (1 + ((level - 1) * 0.05)) * (1 + ((star - 1) * 0.08)) * (1 + (getResearchLevel('tacticCompiler') * 0.05));
    }

    function getBattleCardCooldown(card) {
        if (card.type === 'tactic') return (6.8 + (card.cost * 1.4)) * (state.battle.tacticCooldownFactor || 1);
        return 2.8 + (card.cost * 1.35);
    }

    function pickBattleBoostChoices() {
        const pool = ['pulseOverload', 'shieldMesh', 'energySurge', 'bountyScript', 'jamField']
            .filter((id) => !state.battle.boosts.includes(id));
        const picks = [];
        while (pool.length && picks.length < 3) {
            const index = Math.floor(Math.random() * pool.length);
            picks.push(getBattleBoostDef(pool.splice(index, 1)[0]));
        }
        return picks;
    }

    function getBattleBoostDef(boostId) {
        const map = {
            pulseOverload: {
                id: 'pulseOverload',
                icon: '&#9889;',
                title: { zh: '脉冲过载', en: 'Pulse Overload' },
                short: { zh: '全路攻击 +18%', en: 'All lanes ATK +18%' },
                desc: { zh: '前排稳住后，本局剩余时间内提高全队输出。', en: 'Raises total output for the rest of the clash once your frontline is stable.' }
            },
            shieldMesh: {
                id: 'shieldMesh',
                icon: '&#10022;',
                title: { zh: '护盾网格', en: 'Shield Mesh' },
                short: { zh: '全路补盾 + 核心稳固', en: 'Shield all lanes + core stabilize' },
                desc: { zh: '为三路与核心补充护盾，适合在承压时使用。', en: 'Adds shields to all lanes and cores, ideal when the board is under pressure.' }
            },
            energySurge: {
                id: 'energySurge',
                icon: '&#10039;',
                title: { zh: '能量激涌', en: 'Energy Surge' },
                short: { zh: '能量回复加速', en: 'Faster energy regen' },
                desc: { zh: '立即回能，并在后半局加快出牌节奏。', en: 'Refills energy now and speeds up deployment for the second half.' }
            },
            bountyScript: {
                id: 'bountyScript',
                icon: '&#9670;',
                title: { zh: '赏金脚本', en: 'Bounty Script' },
                short: { zh: '结算收益提高', en: 'Higher rewards' },
                desc: { zh: '本局提高结算奖励，并缩短战术冷却。', en: 'Raises battle rewards and shortens tactic cooldowns for this run.' }
            },
            jamField: {
                id: 'jamField',
                icon: '&#9638;',
                title: { zh: '干扰力场', en: 'Jam Field' },
                short: { zh: '敌方进场减速', en: 'Enemy spawn slows down' },
                desc: { zh: '暂时减缓敌方压线速度，为三路争取喘息空间。', en: 'Temporarily slows enemy pressure to give your lanes breathing room.' }
            }
        };
        return map[boostId] || null;
    }

    function applyBattleBoost(boostId) {
        const battle = state.battle;
        if (boostId === 'pulseOverload') {
            battle.attackBoost += 0.18;
            return;
        }
        if (boostId === 'shieldMesh') {
            battle.lanes.forEach((lane) => {
                lane.playerCoreHp = Math.min(lane.playerCoreMax, lane.playerCoreHp + (lane.playerCoreMax * 0.12));
                lane.friendly.forEach((unit) => { unit.shield += 64; });
            });
            return;
        }
        if (boostId === 'energySurge') {
            battle.energy = Math.min(battle.maxEnergy, battle.energy + 2.6);
            battle.energyRegen += 0.32;
            battle.speedBoost += 0.06;
            return;
        }
        if (boostId === 'bountyScript') {
            battle.rewardBoost += 0.12;
            battle.tacticCooldownFactor *= 0.84;
            return;
        }
        if (boostId === 'jamField') {
            battle.spawnSlowRemaining = Math.max(battle.spawnSlowRemaining, 7);
        }
    }

    function getBattleCardById(cardId) {
        if (unitMap[cardId]) return { ...unitMap[cardId], id: cardId, type: 'unit' };
        if (tacticMap[cardId]) return { ...tacticMap[cardId], id: cardId, type: 'tactic' };
        return null;
    }

    function getBattleSelectedCard() {
        return state.battle?.selectedCardId ? getBattleCardById(state.battle.selectedCardId) : null;
    }

    function isBattleCardReady(cardId, battle = state.battle) {
        if (!battle || !cardId) return false;
        return Math.max(0, battle.cooldowns[cardId] || 0) <= 0.05;
    }

    function canBattleCardPlay(cardId, battle = state.battle) {
        const card = getBattleCardById(cardId);
        if (!battle || !card) return false;
        return isBattleCardReady(cardId, battle) && battle.energy >= card.cost;
    }

    function getBattlePlayableCardIds(battle = state.battle, excludeCardId = '') {
        if (!battle?.hand?.length) return [];
        return battle.hand
            .filter((cardId) => cardId !== excludeCardId)
            .map((cardId) => ({ cardId, card: getBattleCardById(cardId) }))
            .filter((item) => !!item.card && canBattleCardPlay(item.cardId, battle))
            .sort((left, right) => {
                if (left.card.type !== right.card.type) return left.card.type === 'unit' ? -1 : 1;
                if (left.card.cost !== right.card.cost) return left.card.cost - right.card.cost;
                return battle.hand.indexOf(left.cardId) - battle.hand.indexOf(right.cardId);
            })
            .map((item) => item.cardId);
    }

    function getBattleCommandCardId(excludeCardId = '') {
        const battle = state.battle;
        if (!battle) return '';
        if (battle.selectedCardId && battle.selectedCardId !== excludeCardId && canBattleCardPlay(battle.selectedCardId, battle)) {
            return battle.selectedCardId;
        }
        const nextPlayable = getBattlePlayableCardIds(battle, excludeCardId)[0] || '';
        if (nextPlayable) return nextPlayable;
        if (battle.selectedCardId && battle.selectedCardId !== excludeCardId) return battle.selectedCardId;
        return '';
    }

    function getBattleCommandCard() {
        const cardId = getBattleCommandCardId();
        return cardId ? getBattleCardById(cardId) : null;
    }

    function getBattleCommandState(card, battle = state.battle) {
        const isSingleLane = (battle?.lanes?.length || 0) === 1;
        if (!battle) {
            return {
                ready: false,
                tone: '',
                title: text('等待开战', 'Waiting For Battle'),
                hint: text('点击开始对战后进入实时推进战斗。', 'Tap start clash to begin the live battle.'),
                badge: text('未开战', 'Idle'),
                showHint: true,
                showSteps: false
            };
        }
        if (battle.reinforcementPending) {
            return {
                ready: false,
                tone: 'good',
                title: text('选择强化', 'Pick Boost'),
                hint: text('先选 1 项强化，再继续推线。', 'Pick 1 boost, then keep pushing.'),
                badge: text('强化中', 'Boost'),
                showHint: true,
                showSteps: false
            };
        }
        if (!card) {
            return {
                ready: false,
                tone: 'warning',
                title: text('等待出牌', 'Waiting For Card'),
                hint: isSingleLane
                    ? text('单路线点亮可出卡会自动上阵。', 'Single-lane auto deploys when you tap a ready card.')
                    : getBattleLaneActionPrompt(battle),
                badge: text('蓄能中', 'Charging'),
                showHint: true,
                showSteps: true
            };
        }

        const cooldown = Math.max(0, battle.cooldowns[card.id] || 0);
        if (cooldown > 0.05) {
            return {
                ready: false,
                tone: 'warning',
                title: localize(card.name),
                hint: text(`${cooldown.toFixed(1)}s 后可出手`, `Ready in ${cooldown.toFixed(1)}s`),
                badge: text('冷却中', 'Cooldown'),
                showHint: true,
                showSteps: true
            };
        }
        if (battle.energy < card.cost) {
            return {
                ready: false,
                tone: 'warning',
                title: localize(card.name),
                hint: text(`能量 ${battle.energy.toFixed(1)} / ${card.cost}`, `Energy ${battle.energy.toFixed(1)} / ${card.cost}`),
                badge: text('缺能量', 'Low Energy'),
                showHint: true,
                showSteps: true
            };
        }
        return {
            ready: true,
            tone: 'good',
            title: localize(card.name),
            hint: card.type === 'tactic'
                ? (isSingleLane ? text('点卡会自动对主线放术', 'Tap the card to auto-cast on Main.') : text('点路线放术', 'Tap lane to cast'))
                : (isSingleLane ? text('点卡会自动上阵到主线', 'Tap the card to auto-deploy on Main.') : text('点路线出兵', 'Tap lane to deploy')),
            badge: isSingleLane ? text('自动出兵', 'Auto Deploy') : text('点路线', 'Tap Lane'),
            showHint: false,
            showSteps: false
        };
    }

    function syncBattleSelectedCard(excludeCardId = '') {
        const battle = state.battle;
        if (!battle) return;
        const nextCardId = getBattleCommandCardId(excludeCardId);
        if (nextCardId) battle.selectedCardId = nextCardId;
    }

    function getBattleCardCommandHint(card) {
        return getBattleCommandState(card, state.battle).hint;
    }

    function getBattleHeadline(selectedCard) {
        const battle = state.battle;
        if (battle.result) {
            return battle.result.win
                ? text('本次推进完成，可继续下一章，或回卡组补强核心卡。', 'This run is complete. Push the next chapter or return to Deck to strengthen your key cards.')
                : text('本次已撤退，优先补强焦点路线的前排或爆发。', 'This run retreated. Strengthen the focused lane\'s frontline or burst first.');
        }
        if (selectedCard) {
            return text(`已选择 ${localize(selectedCard.name)}，点击路线部署。`, `Selected ${localize(selectedCard.name)}. Tap a lane to deploy.`);
        }
        return text(`当前焦点是 ${getBattleLaneLabel(battle.focusLaneId)}，先选卡再部署。`, `Focus is on ${getBattleLaneLabel(battle.focusLaneId)}. Pick a card, then deploy it.`);
    }

    function renderBattleLaneHint(lane) {
        if (lane.enemy.some((unit) => unit.isBoss)) {
            return text('首领压路 · 先补前排', 'Boss present · hold frontline');
        }
        const focusText = state.battle.focusLaneId === lane.id ? text('主攻', 'Focus') : text('侧路', 'Side');
        return text(`${focusText} · ${lane.friendly.length}v${lane.enemy.length}`, `${focusText} · ${lane.friendly.length}v${lane.enemy.length}`);
    }

    function getBattleLaneLabel(laneId) {
        return getBattleLaneLabelByIds(laneId, getBattleLaneIds());
    }

    function getBattleLaneIdsForChapter(chapter) {
        const chapterNumber = Math.max(1, Number(chapter?.chapter) || 1);
        if (chapterNumber <= 1) return ['mid'];
        if (chapterNumber === 2) return ['top', 'mid'];
        return ['top', 'mid', 'bot'];
    }

    function getBattleLaneIds(battle = state.battle) {
        if (battle?.lanes?.length) return battle.lanes.map((lane) => lane.id);
        return getBattleLaneIdsForChapter(getSelectedChapter());
    }

    function getPrimaryBattleLaneId() {
        return getPrimaryBattleLaneIdFromIds(getBattleLaneIds());
    }

    function getPrimaryBattleLaneIdFromIds(laneIds) {
        return laneIds.includes('mid') ? 'mid' : (laneIds[0] || 'mid');
    }

    function getBattleLaneScale(laneId, laneIds) {
        const ids = Array.isArray(laneIds) ? laneIds : ['top', 'mid', 'bot'];
        if (ids.length === 1) return 1;
        if (ids.length === 2) return laneId === 'mid' ? 1.04 : 0.96;
        if (laneId === 'top') return 0.94;
        if (laneId === 'bot') return 1.08;
        return 1;
    }

    function getSetupLanePreviewUnitId(laneId, unitIds) {
        if (laneId === 'top') return unitIds[0] || unitIds[1] || unitIds[2] || '';
        if (laneId === 'mid') return unitIds[1] || unitIds[0] || unitIds[2] || '';
        return unitIds[2] || unitIds[1] || unitIds[0] || '';
    }

    function getBattleLaneLabelByIds(laneId, laneIds) {
        const ids = Array.isArray(laneIds) && laneIds.length ? laneIds : ['top', 'mid', 'bot'];
        if (ids.length === 1) return text('主线', 'Main');
        if (ids.length === 2) {
            return laneId === 'mid' ? text('主线', 'Main') : text('侧线', 'Side');
        }
        if (laneId === 'top') return text('上路', 'Top');
        if (laneId === 'bot') return text('下路', 'Bot');
        return text('中路', 'Mid');
    }

    function getBattleLaneIcon(laneId) {
        const laneIds = getBattleLaneIds();
        if (laneIds.length === 1) return '●';
        if (laneIds.length === 2) return laneId === 'mid' ? '●' : '▲';
        return laneId === 'top' ? '▲' : laneId === 'bot' ? '▼' : '●';
    }

    function getBattleLaneActionPrompt(battle = state.battle) {
        const laneIds = getBattleLaneIds(battle);
        if (laneIds.length === 1) {
            return text('亮起卡牌点一下就会自动出兵；主线按钮可手动补位。', 'Tap a glowing card to auto-deploy; Main is there for manual fallback.');
        }
        if (laneIds.length === 2) {
            return text('下方卡牌亮起后，点主线或侧线出手。', 'When a card lights up, tap Main or Side.');
        }
        return text('下方卡牌亮起后，点上 / 中 / 下任一路线出手。', 'When a card lights up, tap top / mid / bot.');
    }

    function getBattleModeIntro(chapter) {
        const laneIds = getBattleLaneIdsForChapter(chapter);
        if (laneIds.length === 1) {
            return text('第 1 章改为单路线教学，先学会“选卡 → 出兵 → 放技能”。', 'Chapter 1 is single-lane training: card → deploy → skill.');
        }
        if (laneIds.length === 2) {
            return text('第 2 章开放双路线，先稳主线，再照顾侧线。', 'Chapter 2 unlocks two lanes: stabilize Main, then cover Side.');
        }
        return text('第 3 章后开放三路线，开始完整的实时对冲。', 'Chapter 3 unlocks the full three-lane clash.');
    }

    function getBattleFlowHint(chapter) {
        const laneIds = getBattleLaneIdsForChapter(chapter);
        if (laneIds.length === 1) {
            return text('流程：点亮卡自动出兵 → 稳住主线 → 100% 放领袖技。', 'Flow: tap a glowing card to auto-deploy → hold Main → cast leader skill at 100%.');
        }
        if (laneIds.length === 2) {
            return text('流程：先守主线，再把空档火力转去侧线。', 'Flow: hold Main first, then swing spare pressure to Side.');
        }
        return text('流程：选卡 → 点路线 → 100% 放领袖技。', 'Flow: pick a card → tap a lane → cast leader skill at 100%.');
    }

    function getBattleRequiredLaneWins(battle = state.battle) {
        const laneCount = battle?.lanes?.length || 1;
        return Math.max(1, Math.floor(laneCount / 2) + 1);
    }

    function renderBattleLaneEffects(lane) {
        const tags = [];
        const allyBuffActive = lane.effects.some((effect) => effect.side === 'ally' && ((effect.attack || 0) > 0 || (effect.speed || 0) > 0));
        const enemyJammed = lane.effects.some((effect) => effect.side === 'enemy' && (effect.jam || 0) > 0);
        const shieldUp = lane.friendly.some((unit) => unit.shield > 0);
        const bossPresent = lane.enemy.some((unit) => unit.isBoss);

        if (bossPresent) tags.push({ label: text('首领', 'Boss'), tone: 'warning' });
        if (allyBuffActive) tags.push({ label: text('增益', 'Buff'), tone: 'good' });
        if (shieldUp) tags.push({ label: text('护盾', 'Shield'), tone: 'good' });
        if (enemyJammed) tags.push({ label: text('干扰', 'Jammed'), tone: 'warning' });
        if (!tags.length) {
            tags.push({
                label: state.battle.focusLaneId === lane.id ? text('焦点', 'Focus') : text('待命', 'Stand by'),
                tone: ''
            });
        }

        return `
            <div class="nc-battle-lane-effects">
                ${tags.map((tag) => `<span class="nc-tag nc-tag--mini ${tag.tone ? `is-${tag.tone}` : ''}">${escapeHtml(tag.label)}</span>`).join('')}
            </div>
        `;
    }

    function getBattleBossStateText() {
        const battle = state.battle;
        if (!battle) return text('首领待机', 'Boss idle');
        if (!isBossStage(battle.chapter)) return text('无首领', 'No Boss');
        if (battle.bossDefeated) return text('首领已破', 'Boss down');
        if (battle.lanes.some((lane) => lane.enemy.some((unit) => unit.isBoss))) {
            return text('首领交战', 'Boss engaged');
        }

        const bossMoment = Math.max(42, battle.maxTime - 16);
        const secondsLeft = Math.max(0, Math.ceil(bossMoment - battle.time));
        return text(`首领 ${secondsLeft}秒`, `Boss ${secondsLeft}s`);
    }

    function getBattleLanePressure(lane) {
        const allyFront = lane.friendly.length ? Math.max(...lane.friendly.map((unit) => unit.x)) : 8;
        const enemyFront = lane.enemy.length ? Math.min(...lane.enemy.map((unit) => unit.x)) : 92;
        const coreSwing = (((lane.playerCoreHp / lane.playerCoreMax) - (lane.enemyCoreHp / lane.enemyCoreMax)) * 18);
        const rawMarker = 50 + (((allyFront - (100 - enemyFront)) * 1.2) + coreSwing);
        const marker = clampNumber(rawMarker, 50, 8, 92);
        const allyWidth = marker;
        const enemyWidth = 100 - marker;
        let label = text('拉锯中', 'Contested');
        let tone = '';
        if (marker >= 62) {
            label = text('我方推进', 'Pushing');
            tone = 'good';
        } else if (marker <= 38) {
            label = text('敌压过来', 'Brace');
            tone = 'warning';
        }
        if (lane.enemy.some((unit) => unit.isBoss)) {
            label = text('Boss Pressure', 'Boss Pressure');
            tone = 'warning';
        }
        return { marker, allyWidth, enemyWidth, label, tone };
    }

    function getBattleUnitShortName(unit) {
        const raw = localize(unit.name);
        return state.lang === 'en' ? raw.split(' ').slice(0, 2).join(' ') : raw.slice(0, 3);
    }

    function getBattleUnitVisual(unit) {
        if (unit.isBoss) return { icon: '&#9888;', tone: 'boss' };
        if (unit.side === 'enemy') {
            if (unit.archetype === 'brute') return { icon: '&#11035;', tone: 'brute' };
            if (unit.archetype === 'gunner') return { icon: '&#9678;', tone: 'gunner' };
            if (unit.archetype === 'captain') return { icon: '&#10038;', tone: 'captain' };
            return { icon: '&#10016;', tone: 'skirmisher' };
        }
        if (unit.heal > 0) return { icon: '&#10010;', tone: 'support' };
        if (unit.range >= 20) return { icon: '&#9678;', tone: 'ranged' };
        if (unit.maxHp >= 150) return { icon: '&#11035;', tone: 'frontline' };
        return { icon: '&#10016;', tone: 'assault' };
    }

    function getBattleCardVisual(card) {
        if (!card) return { icon: '&#9673;', tone: 'neutral' };
        if (card.type === 'tactic') {
            if (card.id === 'shieldNet') return { icon: '&#11036;', tone: 'shield' };
            if (card.id === 'overclockBurst') return { icon: '&#10022;', tone: 'boost' };
            return { icon: '&#9889;', tone: 'jam' };
        }
        if (card.id === 'repairPixie') return { icon: '&#10010;', tone: 'support' };
        if (card.lane === 'back') return { icon: '&#9678;', tone: 'ranged' };
        if ((card.stats?.hp || 0) >= 140) return { icon: '&#11035;', tone: 'frontline' };
        return { icon: '&#10016;', tone: 'assault' };
    }

    function getBattleCardCompactMeta(card) {
        if (!card) return '';
        if (card.type === 'tactic') return text('技能', 'Skill');
        if (card.id === 'repairPixie') return text('治疗', 'Heal');
        if (card.lane === 'back') return text('后排', 'Backline');
        if ((card.stats?.hp || 0) >= 140) return text('前排', 'Frontline');
        return text('突击', 'Assault');
    }

    function getBattleCoreRatio(side) {
        const battle = state.battle;
        if (!battle?.lanes?.length) return 1;
        const hp = battle.lanes.reduce((sum, lane) => sum + (side === 'ally' ? lane.playerCoreHp : lane.enemyCoreHp), 0);
        const max = battle.lanes.reduce((sum, lane) => sum + (side === 'ally' ? lane.playerCoreMax : lane.enemyCoreMax), 0);
        return max > 0 ? Math.max(0, hp / max) : 0;
    }

    function getBattleCorePercent(side) {
        return Math.round(getBattleCoreRatio(side) * 100);
    }

    function getBattleLaneWinCount(battle = state.battle) {
        if (!battle?.lanes?.length) return 0;
        return battle.lanes.filter((lane) => lane.enemyCoreHp < lane.playerCoreHp).length;
    }

    function formatBattleTime(value) {
        const totalSeconds = Math.max(0, Math.round(Number(value) || 0));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    function markBattleNotice(message, tone = '', duration = 1.7) {
        if (!state.battle) return;
        const currentNotice = state.battle.notice;
        if (
            currentNotice
            && currentNotice.text === message
            && currentNotice.tone === tone
            && currentNotice.until > state.battle.time + 0.35
        ) {
            return;
        }
        state.battle.notice = {
            text: message,
            tone,
            until: state.battle.time + duration
        };
    }

    function markBattleCardFeedback(cardId, tone = 'good', duration = 0.68) {
        if (!state.battle || !cardId) return;
        state.battle.commandFeedback = {
            cardId,
            tone,
            until: state.battle.time + duration
        };
    }

    function markBattleBanner(title, detail = '', tone = '') {
        if (!state.battle) return;
        state.battle.banner = {
            title,
            detail,
            tone,
            until: state.battle.time + 2.2
        };
    }

    function markBattleArena(tone = 'good', duration = 1) {
        if (!state.battle) return;
        state.battle.arenaTone = tone;
        state.battle.arenaGlowUntil = state.battle.time + duration;
    }

    function pushLaneEvent(laneId, icon, label, tone = '', duration = 1.9) {
        if (!state.battle?.lanes?.length) return;
        const lanes = laneId === 'all'
            ? state.battle.lanes
            : state.battle.lanes.filter((lane) => lane.id === laneId);
        lanes.forEach((lane) => {
            lane.events = Array.isArray(lane.events) ? lane.events : [];
            lane.events.unshift({
                id: `${lane.id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                icon,
                label,
                tone,
                until: state.battle.time + duration
            });
            lane.events = lane.events.slice(0, 3);
        });
    }

    function pushBattleFloater(laneId, {
        text = '',
        tone = '',
        x = 50,
        y = 38,
        size = 'tiny',
        duration = 0.9
    } = {}) {
        if (!state.battle?.lanes?.length || !text) return;
        const lane = state.battle.lanes.find((item) => item.id === laneId);
        if (!lane) return;
        lane.floaters = Array.isArray(lane.floaters) ? lane.floaters : [];
        lane.floaters.unshift({
            id: `${lane.id}-flt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            text,
            tone,
            x: clampNumber(x, 50, 8, 92),
            y: clampNumber(y, 38, 14, 64),
            size,
            until: state.battle.time + duration
        });
        lane.floaters = lane.floaters.slice(0, 8);
    }

    function markLanePulse(laneId, tone = 'good') {
        if (!state.battle?.lanes?.length) return;
        const targets = laneId === 'all'
            ? state.battle.lanes
            : state.battle.lanes.filter((lane) => lane.id === laneId);
        targets.forEach((lane) => {
            lane.pulseTone = tone;
            lane.pulseUntil = state.battle.time + 0.8;
        });
    }

    function markLaneImpact(laneId, tone = 'good', side = 'ally', duration = 0.85) {
        if (!state.battle?.lanes?.length) return;
        const targets = laneId === 'all'
            ? state.battle.lanes
            : state.battle.lanes.filter((lane) => lane.id === laneId);
        targets.forEach((lane) => {
            lane.impactTone = tone;
            lane.impactSide = side;
            lane.impactUntil = state.battle.time + duration;
        });
    }

    function checkBattleCoreBreakpoints(lane) {
        const coreMarks = [0.75, 0.5, 0.25];
        const allyRatio = lane.playerCoreMax > 0 ? lane.playerCoreHp / lane.playerCoreMax : 0;
        const enemyRatio = lane.enemyCoreMax > 0 ? lane.enemyCoreHp / lane.enemyCoreMax : 0;

        while (lane.enemyCoreAlertStage < coreMarks.length && enemyRatio <= coreMarks[lane.enemyCoreAlertStage]) {
            pushLaneEvent(lane.id, '&#10022;', text('Enemy Core Cracked', 'Enemy Core Cracked'), 'good', 2.1);
            markLanePulse(lane.id, 'good');
            markLaneImpact(lane.id, 'good', 'ally', 0.95);
            lane.enemyCoreAlertStage += 1;
        }

        while (lane.allyCoreAlertStage < coreMarks.length && allyRatio <= coreMarks[lane.allyCoreAlertStage]) {
            pushLaneEvent(lane.id, '&#9888;', text('Core Under Fire', 'Core Under Fire'), 'warning', 2.1);
            markLanePulse(lane.id, 'warning');
            markLaneImpact(lane.id, 'warning', 'enemy', 0.95);
            lane.allyCoreAlertStage += 1;
        }
    }

    function queueBattleStageScroll() {
        if (state.tab !== 'clash') return;
        const scrollTarget = () => {
            const node = document.querySelector('.nc-battle-stage') || document.querySelector('.nc-battle-card--live') || document.querySelector('.nc-battle-card--setup');
            if (!node) return;
            node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.requestAnimationFrame(() => {
            scrollTarget();
            window.setTimeout(scrollTarget, 120);
        });
    }

    function renderClashRuntime() {
        renderHeroSummary();
        if (state.tab === 'clash' && ui.panelContent) {
            ui.panelContent.innerHTML = renderClashTab();
        }
    }

    function getNextUnlockedChapterId(currentChapterId) {
        const index = getChapterIndex(currentChapterId);
        const next = config.chapters[index + 1];
        return next ? next.id : '';
    }

    function renderBattleFollowupCard(result, { compact = false } = {}) {
        const targetChapterId = result.win && result.nextChapterId ? result.nextChapterId : result.chapterId;
        const targetChapter = chapterMap[targetChapterId];
        if (!targetChapter) return '';
        const power = getDeckPower();
        const gap = Math.max(0, targetChapter.recommended - power);
        const unlockedNext = result.win && !!result.nextChapterId;
        const ready = gap <= 0;
        const badgeText = unlockedNext
            ? (ready ? text('可继续推进', 'Ready To Push') : text('战力墙', 'Power Wall'))
            : (ready ? text('可立即重试', 'Retry Ready') : text('先补养成', 'Needs Build'));
        const note = unlockedNext
            ? (ready
                ? text(`${targetChapter.id} 已就绪，可以直接推进。`, `${targetChapter.id} is ready. You can push it immediately.`)
                : text(`${targetChapter.id} 已开放，但你当前还差 ${formatCompact(gap)} 战力，建议先补卡组或研究。`, `${targetChapter.id} has opened, but you are still ${formatCompact(gap)} power short. Patch Deck or Lab first.`))
            : (ready
                ? text('你可以立即重试这一关，或继续刷它来稳定补资源。', 'You can retry this stage immediately or keep farming it for stable resources.')
                : text(`当前卡点还差 ${formatCompact(gap)} 战力，建议下次重试前先补强卡组。`, `You are ${formatCompact(gap)} power short for this wall. Tune your deck before the next retry.`));

        return `
            <article class="nc-result-card ${compact ? 'nc-result-card--compact' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(unlockedNext ? '&#10022;' : '&#9888;', unlockedNext ? text('下一章节', 'Next Chapter') : text('当前卡点', 'Current Wall'), targetChapter.id)}</h3>
                        <div class="nc-card-copy">${escapeHtml(localize(targetChapter.name))}</div>
                    </div>
                    <span class="nc-tag ${ready ? 'is-good' : 'is-warning'}">${escapeHtml(badgeText)}</span>
                </div>
                <div class="nc-stat-grid">
                    ${renderStatBox(text('战力', 'Power'), `${power}/${targetChapter.recommended}`)}
                    ${renderStatBox(text('差距', 'Gap'), gap > 0 ? `-${formatCompact(gap)}` : text('已就绪', 'Ready'))}
                    ${renderStatBox(text('入场', 'Entry'), `${getEntryCost(targetChapter)} Cr`)}
                    ${renderStatBox(text('奖励侧重', 'Reward Focus'), localize(targetChapter.rewardFocus))}
                </div>
                <div class="nc-inline-note">${escapeHtml(`${localize(targetChapter.pressure)} • ${note}`)}</div>
            </article>
        `;
    }

    function getSelectedChapter() {
        return chapterMap[state.save.selectedChapterId] || config.chapters[0];
    }

    function getStartClashLabel(chapter) {
        resetFreeClashWindow();
        const freeLeft = getRemainingFreeClashes();
        if (freeLeft > 0) return text('开始对战 • 免费', 'Start Clash • Free');
        const cost = getEntryCost(chapter);
        return state.lang === 'en' ? `Start Clash • ${cost} Cr` : `开始对战 • ${cost} Cr`;
    }

    function getDailyFreeClashesLimit() {
        return Math.max(0, (Number(config.battle.freeClashesPerDay) || 0) + getPaymentFreeClashBonus());
    }

    function getRemainingFreeClashes() {
        resetFreeClashWindow();
        return Math.max(0, getDailyFreeClashesLimit() - state.save.freeClashesUsedToday);
    }

    function getEntryCost(chapter) {
        const chapterNumber = Number(chapter?.chapter) || 1;
        return config.battle.entryCostByChapter[`chapter${chapterNumber}`] || config.battle.entryCostByChapter.chapter1 || 0;
    }

    function getDeckPower() {
        const leaderPower = getCardPower('leader', state.save.selectedLeaderId);
        const unitPower = state.save.selectedUnits.reduce((sum, unitId) => sum + getCardPower('unit', unitId), 0);
        const tacticPower = getCardPower('tactic', state.save.selectedTacticId);
        const researchBonus = getTotalResearchLevels() * 18;
        return Math.round(leaderPower + unitPower + tacticPower + researchBonus);
    }

    function getCardPower(type, cardId) {
        const card = getCardDef(type, cardId);
        if (!card) return 0;
        const basePower = Number(card.stats?.power) || 0;
        const level = getCardLevel(type, cardId);
        const star = getCardStar(type, cardId);
        return Math.round(basePower * (1 + ((level - 1) * 0.08)) * (1 + ((star - 1) * 0.16)));
    }

    function getCardLevel(type, cardId) {
        return clampNumber(Number(getLevelMap(type)[cardId]) || 1, 1, 1, 999);
    }

    function getCardStar(type, cardId) {
        return clampNumber(Number(getStarMap(type)[cardId]) || 1, 1, 1, 5);
    }

    function getFragments(cardId) {
        return Math.max(0, Number(state.save.fragments[cardId]) || 0);
    }

    function addFragments(cardId, amount) {
        state.save.fragments[cardId] = Math.max(0, getFragments(cardId) + Math.round(Number(amount) || 0));
    }

    function getUpgradeCost(type, cardId) {
        if (!getCardDef(type, cardId)) return 0;
        const level = getCardLevel(type, cardId);
        if (type === 'leader') return Math.round(config.upgradeCurves.leaderCreditBase * Math.pow(config.upgradeCurves.leaderCreditGrowth, level - 1));
        if (type === 'unit') return Math.round(config.upgradeCurves.unitCreditBase * Math.pow(config.upgradeCurves.unitCreditGrowth, level - 1));
        return Math.round(config.upgradeCurves.tacticCreditBase * Math.pow(config.upgradeCurves.tacticCreditGrowth, level - 1));
    }

    function getNextStarCost(currentStar) {
        return config.starUpgrades.find((item) => item.from === currentStar) || null;
    }

    function canPromoteCard(type, cardId) {
        const star = getCardStar(type, cardId);
        const cost = getNextStarCost(star);
        if (!cost) return false;
        return state.save.credits >= cost.credits
            && state.save.tactCores >= cost.tactCores
            && state.save.cipherChips >= cost.cipherChips
            && getFragments(cardId) >= cost.fragments;
    }

    function getResearchLevel(researchId) {
        return clampNumber(Number(state.save.researchLevels[researchId]) || 0, 0, 0, 999);
    }

    function getResearchCost(researchId) {
        const research = researchMap[researchId];
        const level = getResearchLevel(researchId);
        return {
            credits: Math.round(research.baseCredits * Math.pow(1.28, level)),
            cipherChips: Math.round(research.baseChips * Math.pow(1.35, level))
        };
    }

    function canUpgradeResearch(researchId) {
        const research = researchMap[researchId];
        if (!research) return false;
        const level = getResearchLevel(researchId);
        if (level >= research.maxLevel) return false;
        const cost = getResearchCost(researchId);
        return state.save.credits >= cost.credits && state.save.cipherChips >= cost.cipherChips;
    }

    function getResearchEffectText(researchId, level) {
        if (!level) return '--';
        if (researchId === 'energyMatrix') {
            const maxEnergyBonus = Math.floor(level / 4);
            return state.lang === 'en' ? `+${level * 2}% regen / +${maxEnergyBonus} max` : `回复 +${level * 2}% / 上限 +${maxEnergyBonus}`;
        }
        if (researchId === 'frontlineArmor') return `+${level * 4}%`;
        if (researchId === 'fireControl') return `+${(level * 3.5).toFixed(1)}%`;
        if (researchId === 'tacticCompiler') return `+${level * 5}%`;
        if (researchId === 'bountyRelay') return `+${level * 3}%`;
        return '--';
    }

    function formatResearchCost(cost, short = false) {
        if (!cost) return '--';
        if (short) {
            return state.lang === 'en'
                ? `${formatCompact(cost.credits)}Cr / ${cost.cipherChips}Ch`
                : `${formatCompact(cost.credits)}币 / ${cost.cipherChips}芯`;
        }
        return state.lang === 'en'
            ? `${formatCompact(cost.credits)} credits / ${cost.cipherChips} chips`
            : `${formatCompact(cost.credits)} 金币 / ${cost.cipherChips} 芯片`;
    }

    function getMissionProgress(metric) {
        switch (metric) {
            case 'duels': return state.save.stats.duels;
            case 'wins': return state.save.stats.wins;
            case 'bossWins': return state.save.stats.bossWins;
            case 'cardUpgrades': return state.save.stats.cardUpgrades;
            case 'researchUpgrades': return state.save.stats.researchUpgrades;
            case 'researchTotal': return getTotalResearchLevels();
            case 'seasonXp': return state.save.seasonXp;
            case 'cratesOpened': return state.save.stats.cratesOpened;
            default: return 0;
        }
    }

    function getMissionHint(metric) {
        switch (metric) {
            case 'duels': return text('Use your 3 free clashes first for the fastest daily progress.', 'Use your 3 free clashes first for the fastest daily progress.');
            case 'wins': return text('If power is low, return to Deck and fix your core three cards first.', 'If power is low, return to Deck and fix your core three cards first.');
            case 'bossWins': return text('The third stage of each chapter is the boss stage and your best chip-value run.', 'The third stage of each chapter is the boss stage and your best chip-value run.');
            case 'cardUpgrades': return text('Credits are permanently drained by upgrades, research, and entry costs, so avoid wasting them.', 'Credits are permanently drained by upgrades, research, and entry costs, so avoid wasting them.');
            case 'researchTotal': return text('Research is your most stable permanent late-game growth.', 'Research is your most stable permanent late-game growth.');
            case 'seasonXp': return text('Season XP mainly comes from clashes, bosses, and crate opens.', 'Season XP mainly comes from clashes, bosses, and crate opens.');
            case 'cratesOpened': return text('Crates mainly solve fragment growth speed.', 'Crates mainly solve fragment growth speed.');
            default: return text('Complete it and claim the reward.', 'Complete it and claim the reward.');
        }
    }

    function getClaimableMissionCount() {
        return config.missions.filter((mission) => !state.save.missionClaimed.includes(mission.id) && getMissionProgress(mission.metric) >= mission.target).length;
    }

    function getClaimableSeasonCount() {
        const free = config.seasonFreeTrack.filter((node) => state.save.seasonXp >= node.xp && !state.save.seasonClaimed.includes(`free:${node.id}`)).length;
        const premium = isSeasonPassUnlocked()
            ? config.seasonPremiumTrack.filter((node) => state.save.seasonXp >= node.xp && !state.save.premiumSeasonClaimed.includes(`premium:${node.id}`)).length
            : 0;
        return free + premium;
    }

    function getSeasonTrackState(track) {
        const list = track === 'premium' ? config.seasonPremiumTrack : config.seasonFreeTrack;
        const claimedStore = track === 'premium' ? state.save.premiumSeasonClaimed : state.save.seasonClaimed;
        const locked = track === 'premium' && !isSeasonPassUnlocked();
        const nodes = list.map((node) => {
            const key = `${track}:${node.id}`;
            const claimed = claimedStore.includes(key);
            const ready = state.save.seasonXp >= node.xp;
            return { ...node, claimed, ready };
        });
        const readyNodes = locked ? [] : nodes.filter((node) => node.ready && !node.claimed);
        const upcomingNodes = locked
            ? nodes.slice(0, 3)
            : nodes.filter((node) => !node.claimed && !node.ready).slice(0, 3);
        const visibleNodes = [...readyNodes, ...upcomingNodes].slice(0, 4);
        return {
            locked,
            readyCount: readyNodes.length,
            claimedCount: nodes.filter((node) => node.claimed).length,
            totalCount: nodes.length,
            nextNode: locked ? nodes[0] || null : nodes.find((node) => !node.claimed && !node.ready) || null,
            visibleNodes
        };
    }

    function getTotalResearchLevels() {
        return config.research.reduce((sum, item) => sum + getResearchLevel(item.id), 0);
    }

    function getFirstClearReward(chapter) {
        const stage = Number(String(chapter.id).split('-')[1]) || 1;
        const chapterNumber = Number(chapter.chapter) || 1;
        return {
            credits: Math.round((chapter.reward.credits * 0.7) + 160),
            tactCores: Math.round((chapter.reward.tactCores * 0.8) + 10),
            cipherChips: isBossStage(chapter) ? Math.max(1, chapter.reward.cipherChips + chapterNumber - 1) : 0,
            eliteCrates: (chapterNumber >= 4 && isBossStage(chapter)) ? 1 : 0,
            standardCrates: stage === 2 ? 1 : 0
        };
    }

    function rollClashFragments(chapter) {
        const chapterNumber = Number(chapter.chapter) || 1;
        const pool = [state.save.selectedLeaderId, ...state.save.selectedUnits, state.save.selectedTacticId];
        const rewards = [];
        for (let index = 0; index < 2; index += 1) {
            const id = pool[Math.floor(Math.random() * pool.length)];
            rewards.push({ id, amount: randomInt(4 + chapterNumber, 8 + (chapterNumber * 2)) });
        }
        return rewards;
    }

    function isBossStage(chapter) {
        return String(chapter?.id || '').endsWith('-3');
    }

    function isChapterUnlocked(index) {
        if (index <= 0) return true;
        const previousChapter = config.chapters[index - 1];
        return state.save.clearedChapters.includes(previousChapter.id);
    }

    function isCardUnlocked(unlockStage) {
        if (!unlockStage) return true;
        return getHighestUnlockedChapterIndex() >= getChapterIndex(unlockStage);
    }

    function getHighestUnlockedChapterIndex() {
        return Math.max(0, getHighestClearedChapterIndex() + 1);
    }

    function getHighestClearedChapterIndex() {
        return config.chapters.reduce((highest, chapter, index) => state.save.clearedChapters.includes(chapter.id) ? index : highest, -1);
    }

    function getChapterIndex(chapterId) {
        return config.chapters.findIndex((item) => item.id === chapterId);
    }

    function getCardUnlockStage(cardId) {
        if (leaderMap[cardId]) return leaderMap[cardId].unlockStage;
        if (unitMap[cardId]) return unitMap[cardId].unlockStage;
        if (tacticMap[cardId]) return tacticMap[cardId].unlockStage;
        return '1-1';
    }

    function isSeasonPassUnlocked() {
        return !!state.save.payment.sponsorPass;
    }

    function inferLegacyOwnedOfferIds(payment = state.save.payment) {
        const claimedOfferIds = Array.isArray(payment?.claimedOfferIds) ? payment.claimedOfferIds.filter((id) => !!offerMap[id]) : [];
        const recentOrders = Array.isArray(payment?.recentOrders) ? payment.recentOrders.filter((item) => !!offerMap[item?.offerId]) : [];
        if (claimedOfferIds.length || recentOrders.length) return [];

        const totalSpent = roundMoney(Number(payment?.totalSpent || 0));
        const purchaseCount = clampNumber(Number(payment?.purchaseCount) || 0, 0, 0, config.paymentOffers.length);
        if (totalSpent <= 0 || (!payment?.sponsorPass && purchaseCount <= 0)) return [];

        const offers = config.paymentOffers.map((offer) => ({
            id: offer.id,
            price: roundMoney(Number(offer.price) || 0)
        }));

        let bestMatch = null;
        const totalMasks = Math.pow(2, offers.length);
        for (let mask = 1; mask < totalMasks; mask += 1) {
            const ids = [];
            let sum = 0;
            for (let index = 0; index < offers.length; index += 1) {
                if (!(mask & (1 << index))) continue;
                ids.push(offers[index].id);
                sum = roundMoney(sum + offers[index].price);
            }
            if (purchaseCount && ids.length !== purchaseCount) continue;
            if (sum > totalSpent + 0.001) continue;
            const gap = Math.abs(totalSpent - sum);
            if (!bestMatch || gap < bestMatch.gap || (gap === bestMatch.gap && sum > bestMatch.sum)) {
                bestMatch = { ids, gap, sum };
            }
        }

        if (bestMatch?.ids?.length) return bestMatch.ids;

        const fallback = offers
            .filter((offer) => offer.price <= totalSpent + 0.001)
            .sort((left, right) => right.price - left.price)[0];
        return fallback ? [fallback.id] : [];
    }

    function getOwnedOfferIds(payment = state.save.payment) {
        const owned = new Set();
        (Array.isArray(payment?.claimedOfferIds) ? payment.claimedOfferIds : []).forEach((offerId) => {
            if (offerMap[offerId]) owned.add(offerId);
        });
        (Array.isArray(payment?.recentOrders) ? payment.recentOrders : []).forEach((order) => {
            if (offerMap[order?.offerId]) owned.add(order.offerId);
        });
        inferLegacyOwnedOfferIds(payment).forEach((offerId) => {
            if (offerMap[offerId]) owned.add(offerId);
        });
        return Array.from(owned);
    }

    function hasPaymentOffer(offerId) {
        return getOwnedOfferIds().includes(offerId);
    }

    function getActivePaymentPerkTexts() {
        const owned = getOwnedOfferIds();
        const items = [];
        if (owned.includes('starter')) items.push(text('首充回能 +3%', 'Starter regen +3%'));
        if (owned.includes('tactical')) items.push(text('每日免费对战 +1', 'Daily free clash +1'));
        if (owned.includes('captain')) items.push(text('领袖技充能 +6%', 'Leader charge +6%'));
        if (owned.includes('champion')) items.push(text('全队攻击/生命 +8%', 'Squad ATK/HP +8%'));
        return items;
    }

    function getGrowthCheckpointSummary(chapter) {
        const chapterNumber = Math.max(1, Number(chapter?.chapter) || 1);
        const stageNumber = Number(String(chapter?.id || '1-1').split('-')[1]) || 1;
        if (chapterNumber === 1 && stageNumber < 3) {
            return {
                focus: text('先把前排和主输出升到 Lv3~5，熟悉出兵与技能节奏。', 'Bring your frontline and carry to Lv3~5 first and learn deployment plus skill timing.')
            };
        }
        if (chapterNumber === 1) {
            return {
                focus: text('这里是首个软卡点：需要 1 张前排 Lv5、1 张主输出 Lv5 和第一张 2★。', 'First soft wall: aim for one frontline Lv5, one carry Lv5, and your first 2-star card.')
            };
        }
        if (chapterNumber === 2) {
            return {
                focus: text('第二章主要卡研究和战术：优先能量矩阵 Lv3、战术卡 Lv5。', 'Chapter 2 mainly checks lab and tactics: prioritize Energy Matrix Lv3 and your tactic card at Lv5.')
            };
        }
        if (chapterNumber === 3) {
            return {
                focus: text('第三章开始吃队长和双研究线：队长 2★、两条主研究线 Lv5+ 更稳。', 'Chapter 3 starts checking leader depth and dual lab lines: leader 2-star plus two core research lines at Lv5+ stabilizes the run.')
            };
        }
        return {
            focus: text('终盘更看重高星主力与芯片研究：至少 2 张 4★ 主力更舒服。', 'Late game is mainly about high-star carries and chip-backed lab growth: at least two 4-star core cards makes it much smoother.')
        };
    }

    function getPaymentFitSummary(chapter, gap = Math.max(0, (chapter?.recommended || 0) - getDeckPower())) {
        const chapterNumber = Math.max(1, Number(chapter?.chapter) || 1);
        const owned = getOwnedOfferIds();
        if (gap <= 0) {
            return {
                label: text('已达标', 'On Pace'),
                detail: text('当前更适合先回卡组或研究补效率，不急着靠充值解卡点。', 'You are on pace now; Deck or Lab upgrades matter more than spending immediately.'),
                urgent: false
            };
        }
        if (chapterNumber === 1 && !owned.includes('starter')) {
            return {
                label: text('首充适配', 'Starter Fit'),
                detail: text('首充包当前最有体感，补的是前期升级、碎片和回能节奏。', 'Starter is the clearest boost here, mainly helping early upgrades, fragments, and energy tempo.'),
                urgent: true
            };
        }
        if (chapterNumber === 2 && !owned.includes('tactical')) {
            return {
                label: text('战术适配', 'Tactical Fit'),
                detail: text('第二章更缺稳定出战频率和中期资源，战术包的日常价值最高。', 'Chapter 2 usually wants stable run frequency and midgame resources, so Tactical has the best steady value here.'),
                urgent: true
            };
        }
        if (chapterNumber <= 3 && !owned.includes('captain')) {
            return {
                label: text('队长适配', 'Captain Fit'),
                detail: text('当前更偏领袖技与队长碎片成长，队长包的针对性最强。', 'This wall leans more on leader-skill tempo and leader fragments, which is exactly what Captain targets best.'),
                urgent: true
            };
        }
        if (chapterNumber >= 3 && !owned.includes('champion')) {
            return {
                label: text('冠军适配', 'Champion Fit'),
                detail: text('后段首领墙更吃全队面板和容错，冠军包的强化最直接。', 'Late boss walls care more about raw squad stats and error margin, which Champion boosts most directly.'),
                urgent: true
            };
        }
        return {
            label: text('先补构筑', 'Build First'),
            detail: text('当前卡点更偏构筑或研究，不是单纯缺一个充值包。', 'This wall looks more like a build or lab issue than simply missing another pack.'),
            urgent: false
        };
    }

    function getOfferFitHint(offerId) {
        const chapter = getSelectedChapter();
        const chapterNumber = Math.max(1, Number(chapter?.chapter) || 1);
        if (isOfferOwned(offerId)) return text('已拥有，永久收益已生效。', 'Owned already. Permanent perk is active.');
        if (offerId === 'starter') return chapterNumber === 1
            ? text('当前最适合前期开荒与首个软卡点。', 'Best fit right now for early push and the first soft wall.')
            : text('偏早期追赶包，后段主要是补资源。', 'Mostly an early catch-up pack; later it is mainly raw resources.');
        if (offerId === 'tactical') return chapterNumber === 2
            ? text('当前最适合第二章日常推进与资源续航。', 'Best fit right now for Chapter 2 daily progression and resource sustain.')
            : text('核心价值是长期多 1 次免费对战。', 'Its core value is the long-term extra daily free clash.');
        if (offerId === 'captain') return chapterNumber >= 2 && chapterNumber <= 3
            ? text('当前最适合 2-3 ~ 3-3 的领袖技节奏卡点。', 'Best fit right now for the 2-3 to 3-3 leader-skill tempo wall.')
            : text('核心价值是队长碎片与领袖技充能。', 'Its core value is leader fragments plus faster leader charge.');
        if (offerId === 'champion') return chapterNumber >= 3
            ? text('当前最适合后段 Boss 墙与终盘容错。', 'Best fit right now for late boss walls and endgame error margin.')
            : text('更偏后段强度包，前中期容易溢出。', 'This is more of a late-strength pack and can overshoot early-mid game.');
        return '';
    }

    function hasStarterPaymentPerk() {
        return hasPaymentOffer('starter');
    }

    function hasTacticalPaymentPerk() {
        return hasPaymentOffer('tactical');
    }

    function hasCaptainPaymentPerk() {
        return hasPaymentOffer('captain');
    }

    function hasChampionPaymentPerk() {
        return hasPaymentOffer('champion');
    }

    function getPaymentFreeClashBonus() {
        return hasTacticalPaymentPerk() ? 1 : 0;
    }

    function resetFreeClashWindow() {
        const key = getDayKey(Date.now());
        if (state.save.freeClashDayKey !== key) {
            state.save.freeClashDayKey = key;
            state.save.freeClashesUsedToday = 0;
        }
    }

    function canClaimDailySupply() {
        return (Date.now() - Number(state.save.dailySupplyAt || 0)) >= DAILY_SUPPLY_COOLDOWN_MS;
    }

    function getDailySupplyCooldownText() {
        const remaining = Math.max(0, DAILY_SUPPLY_COOLDOWN_MS - (Date.now() - Number(state.save.dailySupplyAt || 0)));
        if (!remaining) return text('Ready', 'Ready');
        const totalMinutes = Math.ceil(remaining / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    }

    function isOfferOwned(offerId) {
        return hasPaymentOffer(offerId);
    }

    function getPendingPaymentOrder(offerId = '') {
        const order = state.save.payment.pendingOrder;
        if (!order || typeof order !== 'object') return null;
        if (offerId && order.offerId !== offerId) return null;
        return order;
    }

    function getRecentOfferOrder(offerId = '') {
        return (Array.isArray(state.save.payment.recentOrders) ? state.save.payment.recentOrders : []).find((item) => !offerId || item.offerId === offerId) || null;
    }

    function buildPaymentOrderId(offerId) {
        return `NC-${String(offerId || 'PACK').slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    }

    function getOfferExactAmount(offer) {
        const seed = (Date.now() % 9) + 1;
        return roundMoney(Number(offer?.price || 0) + (seed / 1000));
    }

    function isPaymentOrderExpired(order) {
        return !order || Number(order.expiresAt || 0) <= Date.now();
    }

    function formatPaymentCountdown(expiresAt) {
        const remain = Math.max(0, Number(expiresAt || 0) - Date.now());
        if (!remain) return text('Expired', 'Expired');
        const totalSeconds = Math.ceil(remain / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function getOfferTxidInput() {
        return String(document.getElementById('ncPaymentTxidInput')?.value || '').trim();
    }

    function formatPaymentAmount(value) {
        return roundMoney(value).toFixed(3).replace(/\.?0+$/, (match) => match === '.000' ? '' : match.replace(/0+$/, '').replace(/\.$/, ''));
    }

    function roundMoney(value) {
        return Math.round((Number(value) || 0) * 1000) / 1000;
    }

    function shortenTxid(txid) {
        const value = String(txid || '').trim();
        if (value.length <= 14) return value || '--';
        return `${value.slice(0, 8)}…${value.slice(-6)}`;
    }

    function pushUniqueValue(list, value, max = 12) {
        if (!Array.isArray(list) || !value) return;
        const next = [value, ...list.filter((item) => item !== value)];
        list.splice(0, list.length, ...next.slice(0, max));
    }

    async function copyTextToClipboard(text) {
        const value = String(text || '').trim();
        if (!value) return false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                return true;
            }
        } catch (error) {}
        try {
            const node = document.createElement('textarea');
            node.value = value;
            node.setAttribute('readonly', 'readonly');
            node.style.position = 'fixed';
            node.style.opacity = '0';
            document.body.appendChild(node);
            node.select();
            const copied = document.execCommand('copy');
            document.body.removeChild(node);
            return !!copied;
        } catch (error) {
            return false;
        }
    }

    function getShopItemHint(itemId) {
        if (itemId === 'standardCrate') return text('Standard crates are best for filling basic fragment gaps.', 'Standard crates are best for filling basic fragment gaps.');
        if (itemId === 'coreBundle') return text('Tact cores become noticeably tight after 2-2.', 'Tact cores become noticeably tight after 2-2.');
        if (itemId === 'chipCache') return text('Chips mostly gate research and high-star upgrades.', 'Chips mostly gate research and high-star upgrades.');
        return text('Used to patch your current shortage.', 'Used to patch your current shortage.');
    }

    function getLevelMap(type) {
        if (type === 'leader') return state.save.leaderLevels;
        if (type === 'unit') return state.save.unitLevels;
        return state.save.tacticLevels;
    }

    function getStarMap(type) {
        if (type === 'leader') return state.save.leaderStars;
        if (type === 'unit') return state.save.unitStars;
        return state.save.tacticStars;
    }

    function getCardDef(type, cardId) {
        if (type === 'leader') return leaderMap[cardId];
        if (type === 'unit') return unitMap[cardId];
        return tacticMap[cardId];
    }

    function getRewardPillEntries(reward) {
        const entries = [];
        if (reward?.credits) entries.push({ icon: '&#9679;', label: text('Credits', 'Credits'), value: `+${formatCompact(reward.credits)}` });
        if (reward?.tactCores) entries.push({ icon: '&#10022;', label: text('Cores', 'Cores'), value: `+${formatCompact(reward.tactCores)}` });
        if (reward?.cipherChips) entries.push({ icon: '&#9671;', label: text('Chips', 'Chips'), value: `+${formatCompact(reward.cipherChips)}` });
        if (reward?.seasonXp) entries.push({ icon: '&#10039;', label: text('Season XP', 'Season XP'), value: `+${formatCompact(reward.seasonXp)}` });
        if (reward?.standardCrates) entries.push({ icon: '&#9638;', label: text('Standard', 'Standard'), value: `+${formatCompact(reward.standardCrates)}` });
        if (reward?.eliteCrates) entries.push({ icon: '&#9670;', label: text('Elite', 'Elite'), value: `+${formatCompact(reward.eliteCrates)}` });
        const fragmentTotal = reward?.cardFragments && typeof reward.cardFragments === 'object'
            ? Object.values(reward.cardFragments).reduce((sum, amount) => sum + Math.max(0, Number(amount) || 0), 0)
            : 0;
        if (fragmentTotal) entries.push({ icon: '&#10032;', label: text('Fragments', 'Fragments'), value: `+${formatCompact(fragmentTotal)}` });
        return entries;
    }

    function formatFragmentSummary(entries) {
        return entries.map((entry) => `${localize(getCardDefById(entry.id)?.name || entry.id)} +${entry.amount}`).join(' • ');
    }

    function getCardDefById(cardId) {
        return leaderMap[cardId] || unitMap[cardId] || tacticMap[cardId] || null;
    }

    function formatStarCost(cost) {
        if (!cost) return '--';
        return state.lang === 'en'
            ? `${cost.fragments} Fr / ${cost.tactCores} Co / ${cost.credits} Cr${cost.cipherChips ? ` / ${cost.cipherChips} Ch` : ''}`
            : `${cost.fragments}碎 / ${cost.tactCores}核 / ${cost.credits}币${cost.cipherChips ? ` / ${cost.cipherChips}芯` : ''}`;
    }

    function getUnitLaneText(lane) {
        if (lane === 'front') return text('前排', 'Front');
        if (lane === 'back') return text('后排', 'Back');
        return text('灵活', 'Flex');
    }

    function getTabIcon(tabId) {
        if (tabId === 'clash') return '&#10022;';
        if (tabId === 'deck') return '&#9776;';
        if (tabId === 'lab') return '&#10070;';
        if (tabId === 'missions') return '&#9638;';
        if (tabId === 'season') return '&#10039;';
        if (tabId === 'shop') return '&#9670;';
        return '&#8226;';
    }

    function getStarsText(stars) {
        return '★'.repeat(Math.max(1, stars));
    }

    function localize(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            return state.lang === 'en'
                ? (value.en || value.zh || '')
                : (value.zh || value.en || '');
        }
        return String(value);
    }

    function translateZhFallback(value) {
        if (!value || typeof value !== 'string') return value || '';
        const exactMap = {
            'A clash is active. Finish or retreat first.': '对战进行中，请先打完或撤退。',
            'Credits': '金币',
            'Upgrades / Entry': '升级 / 门票',
            'Cores': '战术核心',
            'Stars / Crates': '升星 / 卡包',
            'Chips': '芯片',
            'Research / Awaken': '研究 / 高星',
            'Season XP': '赛季经验',
            'Season Track': '赛季进度',
            'Current Stage': '当前章节',
            'Power': '战力',
            'Gap': '差距',
            'Ready': '就绪',
            'Free Clashes': '免费对战',
            'Recommended': '推荐',
            'Tri-Lane Preview': '三路线预览',
            'Top Lane': '上路',
            'Mid Lane': '中路',
            'Bot Lane': '下路',
            'Open Deck': '前往卡组',
            'Current Lineup': '当前阵容',
            'Leader': '队长',
            'Unit': '单位',
            'Tactic': '战术',
            'Lv': '等级',
            'Upgrades / Shop': '升级 / 商店',
            'Research / High Stars': '研究 / 高星',
            'Crates': '卡包',
            'Standard / Elite': '标准 / 精英',
            'Go Lab': '前往研究',
            'Open Shop': '前往商店',
            'Open Crate': '开启卡包',
            'Leaders': '队长',
            'Units': '单位',
            'Tactics': '战术',
            'Crate Station': '开包站',
            'Standard': '标准',
            'Elite': '精英',
            'Regular fragments': '常规碎片',
            'Higher rarity / big fragments': '高稀有 / 大额碎片',
            'Open Standard Crate': '开启标准卡包',
            'Open Elite Crate': '开启精英卡包',
            'Permanent Lab': '永久研究',
            'Total Lv': '总等级',
            'Go Clash': '前往对战',
            'Protocol Missions': '协议任务',
            'This page only keeps claimable, near-finished, and milestone missions to avoid long mobile scrolling.': '本页只保留可领取、接近完成和关键里程碑任务，减少手机端滚动。',
            'In Progress': '进行中',
            'Claimed': '已领取',
            'Claim now': '立即领取',
            'Closest tasks': '最近目标',
            'Total done': '累计完成',
            'Ready Now': '可领奖励',
            'Up Next': '下一批',
            'Top 4': '前四项',
            'Season Route': '赛季路线',
            'Current total': '当前总量',
            'Free Done': '免费已领',
            'XP left': '经验差',
            'Track done': '轨道完成',
            'Sponsor': '赞助',
            'Unlock to claim': '解锁后可领',
            'Free Track': '免费轨',
            'Queue': '待推进',
            'Sponsor Track': '赞助轨',
            'Unlocked': '已解锁',
            'Payment Next': '充值解锁',
            'Supply Hub': '补给中心',
            'Claim Daily': '领取每日',
            'Season': '赛季',
            'Spend here': '这里消耗',
            'Std / Elite': '标 / 精',
            'Daily': '每日',
            'Tap to claim': '点击领取',
            'Cooldown': '冷却中',
            'Premium Top-Up': '充值补给',
            'Active': '生效中',
            'Locked': '未解锁',
            'Level': '等级',
            'Stars': '星级',
            'Fragments': '碎片',
            'Next Star': '下一星',
            'Current Leader': '当前队长',
            'Set Leader': '设为队长',
            'Upgrade': '升级',
            'Promote': '升星',
            'Cost': '费用',
            'Deployed': '已上阵',
            'Lane': '定位',
            'Remove': '移除',
            'Deploy': '上阵',
            'Impact': '效果倍率',
            'Current Tactic': '当前战术',
            'Equip': '装配',
            'Max': '已满',
            'Current': '当前效果',
            'Next Cost': '下级消耗',
            'Maxed': '已满级',
            'Upgrade Research': '升级研究',
            'Claim Reward': '领取奖励',
            'Free': '免费',
            'Unlock Pass': '解锁通行证',
            'Claim': '领取',
            'Daily Free Supply': '每日免费补给',
            'Claim Supply': '领取补给',
            'Buy Now': '立即购买',
            'Spent': '累计充值',
            'Lifetime verified': '累计已验证',
            'Orders': '订单数',
            '1 pending': '1 个待处理',
            'No pending order': '暂无待处理',
            'Sponsor Pass': '赞助通行证',
            'Premium season ready': '赞助赛季已启用',
            'Unlocked on first top-up': '首充后解锁',
            'Daily Free': '每日免费',
            'Base quota only': '仅基础次数',
            'Pending': '待处理',
            'View Rewards': '查看奖励',
            'Resume Order': '继续订单',
            'Create Order': '创建订单',
            'Current Wall': '当前卡点',
            'Empty': '空位',
            'Choose a unit in Deck next.': '去卡组选择一个单位。',
            'INFO': '提示',
            'Got it': '知道了',
            'Payment Center': '支付中心',
            'Verified and granted': '已验证并发奖',
            'Pack Price': '礼包价格',
            'Exact Amount': '精确金额',
            'Order ID': '订单号',
            'Perk': '永久特权',
            'Base display price': '展示基准价',
            'Use exact amount for verify': '按精确金额验证',
            'Verified': '已验证',
            'Create order first': '请先创建订单',
            'Active now': '当前生效',
            'Activates after verify': '验证后生效',
            'Receiving Address': '收款地址',
            'Copy Address': '复制地址',
            'Copy Amount': '复制金额',
            'Paste OKX Wallet txid': '粘贴 OKX 钱包 TXID',
            'Open Season': '前往赛季',
            'Close': '关闭',
            'Verify TXID': '验证 TXID',
            'Cancel Order': '取消订单',
            'That chapter is still locked.': '该章节尚未解锁。',
            'Leader switched.': '队长已切换。',
            'Keep at least one unit deployed.': '至少保留 1 个单位上阵。',
            'You can only deploy 3 units right now.': '当前最多只能上阵 3 个单位。',
            'Tactic card switched.': '战术卡已切换。',
            'Not enough credits to keep battling.': '金币不足，无法继续对战。',
            'Clash won.': '对战胜利。',
            'Clash retreated with partial rewards.': '已撤退，并获得部分奖励。',
            'Not enough credits.': '金币不足。',
            'Card upgraded.': '卡牌已升级。',
            'Not enough promotion materials.': '升星材料不足。',
            'Promotion complete.': '升星完成。',
            'Not enough credits or chips.': '金币或芯片不足。',
            'Research upgraded.': '研究已升级。',
            'Mission reward claimed.': '任务奖励已领取。',
            'Season reward claimed.': '赛季奖励已领取。',
            'Daily supply claimed.': '每日补给已领取。',
            'Supply purchased.': '补给购买成功。',
            'This pack has already been claimed.': '该礼包已领取。',
            'Resume the active order below.': '请继续下方未完成订单。',
            'Exact payment order created.': '精确支付订单已创建。',
            'Pending order canceled.': '待处理订单已取消。',
            'Create an order first.': '请先创建订单。',
            'This order expired. Create a new one.': '该订单已过期，请重新创建。',
            'TXID must be 64 hex characters.': 'TXID 必须是 64 位十六进制字符串。',
            'This TXID was already used.': '该 TXID 已被使用。',
            'Rewards for this pack were already granted.': '该礼包奖励已发放。',
            'Payment Verified': '支付验证成功',
            'TXID': '交易哈希',
            'Total Spent': '累计充值',
            'Already active': '已生效',
            'Unlocked now': '现已解锁',
            'Payment verified. Rewards granted.': '支付验证成功，奖励已发放。',
            'Payment verified. Rewards were granted and the sponsor pass is active on this account.': '支付验证成功，奖励已发放，赞助通行证已在当前账号生效。',
            'This pack has already been verified and the rewards are permanently attached to your account.': '该礼包已验证，奖励已永久绑定到当前账号。',
            'Pay the exact amount below in OKX Wallet, then paste the txid to verify and grant rewards.': '请在 OKX 钱包按下方精确金额支付，然后粘贴 TXID 完成验证与发奖。',
            'The previous order expired. Create a fresh order to continue payment and reward verification.': '上一笔订单已过期，请重新创建新订单后继续支付与验证。',
            'Create an exact order first. The first successful top-up unlocks the sponsor season track.': '请先创建精确订单，首次成功充值会解锁赞助赛季轨道。',
            'Paste the 64-character on-chain txid after payment.': '支付完成后粘贴 64 位链上 TXID。',
            'This order expired. Create a new order before verifying the txid.': '该订单已过期，请先创建新订单再验证 TXID。',
            'Only txids that match the active order amount, address, and valid time window can pass verification.': '只有金额、地址和有效时间窗口都匹配当前订单的 TXID 才能通过验证。',
            'Create an order first, then complete payment in OKX Wallet and verify the txid.': '请先创建订单，再到 OKX 钱包完成支付并验证 TXID。',
            'First verified top-up unlocks the sponsor season track. Tactical Pack adds +1 daily free clash. Champion Pack grants +8% squad ATK/HP.': '首笔验证成功的充值会解锁赞助赛季轨道；战术包额外提供每日 +1 免费对战；冠军包提供全队攻击与生命 +8%。',
            'The order was verified successfully and rewards have been granted to this account.': '订单验证成功，奖励已发放到当前账号。',
            'Receiving address copied.': '收款地址已复制。',
            'Please copy the address manually.': '请手动复制地址。',
            'Exact amount copied.': '精确金额已复制。',
            'Please copy the amount manually.': '请手动复制金额。',
            'Crate Result': '卡包结果',
            'Elite Crate': '精英卡包',
            'Standard Crate': '标准卡包',
            'Rewards have been added to your inventory.': '奖励已加入库存。',
            'Keep Building': '继续养成',
            'Mid-Battle Boost': '战中强化',
            'Choose 1 Boost': '选择 1 项强化',
            'This only lasts for this clash. Patch the weakest part of the run first.': '该强化仅本局生效，优先补强最弱的一环。',
            'Pick Boost': '选择强化',
            'Live Chapter': '当前战斗章节',
            'Locked During Clash': '对战中不可切换',
            'Leader skill is not charged yet.': '领袖技尚未充能完成。',
            'Leader Burst': '领袖爆发',
            'Leader Skill Cast': '领袖技能释放',
            'Wave': '波次',
            'Boss': '首领',
            'Boss Pressure': '首领压力',
            'Boss Arrived': '首领到场',
            'Boss idle': '首领待机',
            'No Boss': '无首领',
            'Boss down': '首领已破',
            'Boss engaged': '首领交战',
            'Enemy Core Cracked': '敌方核心破裂',
            'Core Under Fire': '核心受击',
            'Ready in ': 'Ready in ',
            'Use your 3 free clashes first for the fastest daily progress.': '优先用完每日免费对战，可最快推进日常。',
            'If power is low, return to Deck and fix your core three cards first.': '如果战力不足，先回卡组补强核心三张卡。',
            'The third stage of each chapter is the boss stage and your best chip-value run.': '每章第 3 关是首领关，也是芯片收益更高的关卡。',
            'Credits are permanently drained by upgrades, research, and entry costs, so avoid wasting them.': '金币会长期消耗在升级、研究和门票上，尽量避免乱花。',
            'Research is your most stable permanent late-game growth.': '研究是后期最稳定的永久成长线。',
            'Season XP mainly comes from clashes, bosses, and crate opens.': '赛季经验主要来自对战、首领与开包。',
            'Crates mainly solve fragment growth speed.': '卡包主要解决碎片成长速度。',
            'Complete it and claim the reward.': '完成后即可领取奖励。',
            'Expired': '已过期',
            'Latest Report': '最近战报',
            'Lane Edge': '路线优势',
            'Won lanes': '获胜路线',
            'Run Rewards': '本局奖励',
            'First Clear Bonus': '首通加成',
            'Victory': '胜利',
            'Down': '已击破',
            'Alive': '存活',
            'None': '无',
            'A clash is already in progress.': '已有一场对战正在进行。',
            'Battle retreated with partial rewards.': '战斗已撤退，并获得了部分奖励。',
            'The clash has been retreated. Partial rewards were granted based on progress. Strengthen your focused lane first.': '本次对战已撤退，已按进度发放部分奖励，建议先补强当前主攻路线。',
            'The clash did not fully clear but partial rewards were granted.': '本次未完全通关，但已发放部分奖励。',
            'Time ran out before the enemy core fully broke. Raise power and improve mid-fight boosts first.': '时间结束前未能彻底击破敌方核心，建议先补战力并加强战中强化。',
            'You broke through the enemy core. Your current deck and lab are strong enough to keep pushing.': '你已突破敌方核心，当前卡组与研究强度足以继续推进。',
            'Mid-battle boost is ready.': '战中强化已就绪。',
            'Marshal Zero overclocked every lane.': '零式统帅已为全路线完成超频。',
            'Aegis Nova reinforced shields across the field.': '神盾星核已为全场补强护盾。',
            'Standard crates are best for filling basic fragment gaps.': '标准卡包最适合补基础碎片缺口。',
            'Tact cores become noticeably tight after 2-2.': '战术核心在 2-2 之后会明显吃紧。',
            'Chips mostly gate research and high-star upgrades.': '芯片主要卡研究和高星升级。',
            'Used to patch your current shortage.': '用于补当前短缺资源。'
        };
        if (exactMap[value]) return exactMap[value];

        let match = value.match(/^(\d+) Ready$/);
        if (match) return `${match[1]} 可领`;
        match = value.match(/^([0-9.]+) XP left$/);
        if (match) return `还差 ${match[1]} 经验`;
        match = value.match(/^\+(\d+) from Tactical Pack$/);
        if (match) return `战术包 +${match[1]}`;
        match = value.match(/^Boss (\d+)s$/);
        if (match) return `首领 ${match[1]}秒`;
        match = value.match(/^Ready in ([0-9.]+)s$/);
        if (match) return `${match[1]}秒后可出手`;
        match = value.match(/^Open ([0-9-]+)$/);
        if (match) return `进入 ${match[1]}`;
        if (value === 'Front') return '前排';
        if (value === 'Back') return '后排';
        if (value === 'Flex') return '灵活';
        return value;
    }

    function text(zh, en) {
        const zhValue = translateZhFallback(zh || '');
        return state.lang === 'en'
            ? (en || zhValue || zh || '')
            : (zhValue || zh || en || '');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
        if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(1)}K`;
        return String(Math.round(number));
    }

    function randomInt(min, max) {
        const low = Math.min(min, max);
        const high = Math.max(min, max);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }

    function clampNumber(value, fallback = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(max, Math.max(min, number));
    }

    function getDayKey(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function readLang() {
        try {
            return localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh';
        } catch (error) {
            return 'zh';
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
        } catch (error) {}
    }

    function loadSave() {
        const defaults = createDefaultSave();
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return defaults;
            const parsed = JSON.parse(raw);
            return normalizeSave(parsed, defaults);
        } catch (error) {
            return defaults;
        }
    }

    function createDefaultSave() {
        const base = {
            tab: 'clash',
            selectedChapterId: '1-1',
            selectedLeaderId: 'marshalZero',
            selectedUnits: ['bladePup', 'bulwarkBot', 'pulseGunner'],
            selectedTacticId: 'overclockBurst',
            credits: 3200,
            tactCores: 160,
            cipherChips: 14,
            seasonXp: 0,
            inventory: { standardCrates: 1, eliteCrates: 0 },
            fragments: {},
            leaderLevels: {},
            leaderStars: {},
            unitLevels: {},
            unitStars: {},
            tacticLevels: {},
            tacticStars: {},
            researchLevels: {},
            missionClaimed: [],
            seasonClaimed: [],
            premiumSeasonClaimed: [],
            clearedChapters: [],
            freeClashDayKey: '',
            freeClashesUsedToday: 0,
            dailySupplyAt: 0,
            stats: {
                duels: 0,
                wins: 0,
                bossWins: 0,
                cardUpgrades: 0,
                researchUpgrades: 0,
                cratesOpened: 0
            },
            payment: {
                totalSpent: 0,
                sponsorPass: false,
                purchaseCount: 0,
                claimedOfferIds: [],
                claimedOrderIds: [],
                verifiedTxids: [],
                recentOrders: [],
                pendingOrder: null
            },
            lastResult: null
        };

        config.leaders.forEach((leader, index) => {
            base.leaderLevels[leader.id] = 1;
            base.leaderStars[leader.id] = 1;
            base.fragments[leader.id] = index === 0 ? 26 : 0;
        });

        config.units.forEach((unit, index) => {
            base.unitLevels[unit.id] = 1;
            base.unitStars[unit.id] = 1;
            base.fragments[unit.id] = index < 3 ? 22 : 8;
        });

        config.tactics.forEach((tactic, index) => {
            base.tacticLevels[tactic.id] = 1;
            base.tacticStars[tactic.id] = 1;
            base.fragments[tactic.id] = index === 0 ? 20 : 4;
        });

        config.research.forEach((research) => {
            base.researchLevels[research.id] = 0;
        });

        return base;
    }

    function normalizeSave(parsed, defaults) {
        const next = createDefaultSave();
        next.tab = tabMap[parsed?.tab] ? parsed.tab : defaults.tab;
        next.selectedChapterId = chapterMap[parsed?.selectedChapterId] ? parsed.selectedChapterId : defaults.selectedChapterId;
        next.selectedLeaderId = leaderMap[parsed?.selectedLeaderId] ? parsed.selectedLeaderId : defaults.selectedLeaderId;
        next.selectedUnits = Array.isArray(parsed?.selectedUnits)
            ? parsed.selectedUnits.filter((id) => !!unitMap[id]).slice(0, 3)
            : defaults.selectedUnits.slice();
        if (!next.selectedUnits.length) next.selectedUnits = defaults.selectedUnits.slice();
        next.selectedTacticId = tacticMap[parsed?.selectedTacticId] ? parsed.selectedTacticId : defaults.selectedTacticId;

        next.credits = clampNumber(parsed?.credits, defaults.credits, 0);
        next.tactCores = clampNumber(parsed?.tactCores, defaults.tactCores, 0);
        next.cipherChips = clampNumber(parsed?.cipherChips, defaults.cipherChips, 0);
        next.seasonXp = clampNumber(parsed?.seasonXp, defaults.seasonXp, 0);

        next.inventory.standardCrates = clampNumber(parsed?.inventory?.standardCrates, defaults.inventory.standardCrates, 0);
        next.inventory.eliteCrates = clampNumber(parsed?.inventory?.eliteCrates, defaults.inventory.eliteCrates, 0);

        allCardIds.forEach((cardId) => {
            next.fragments[cardId] = clampNumber(parsed?.fragments?.[cardId], defaults.fragments[cardId] || 0, 0);
        });
        config.leaders.forEach((item) => {
            next.leaderLevels[item.id] = clampNumber(parsed?.leaderLevels?.[item.id], defaults.leaderLevels[item.id], 1);
            next.leaderStars[item.id] = clampNumber(parsed?.leaderStars?.[item.id], defaults.leaderStars[item.id], 1, 5);
        });
        config.units.forEach((item) => {
            next.unitLevels[item.id] = clampNumber(parsed?.unitLevels?.[item.id], defaults.unitLevels[item.id], 1);
            next.unitStars[item.id] = clampNumber(parsed?.unitStars?.[item.id], defaults.unitStars[item.id], 1, 5);
        });
        config.tactics.forEach((item) => {
            next.tacticLevels[item.id] = clampNumber(parsed?.tacticLevels?.[item.id], defaults.tacticLevels[item.id], 1);
            next.tacticStars[item.id] = clampNumber(parsed?.tacticStars?.[item.id], defaults.tacticStars[item.id], 1, 5);
        });
        config.research.forEach((item) => {
            next.researchLevels[item.id] = clampNumber(parsed?.researchLevels?.[item.id], defaults.researchLevels[item.id], 0);
        });

        next.missionClaimed = Array.isArray(parsed?.missionClaimed) ? parsed.missionClaimed.filter((id) => config.missions.some((item) => item.id === id)) : [];
        next.seasonClaimed = Array.isArray(parsed?.seasonClaimed) ? parsed.seasonClaimed.filter((id) => typeof id === 'string') : [];
        next.premiumSeasonClaimed = Array.isArray(parsed?.premiumSeasonClaimed) ? parsed.premiumSeasonClaimed.filter((id) => typeof id === 'string') : [];
        next.clearedChapters = Array.isArray(parsed?.clearedChapters) ? parsed.clearedChapters.filter((id) => !!chapterMap[id]) : [];

        next.freeClashDayKey = typeof parsed?.freeClashDayKey === 'string' ? parsed.freeClashDayKey : defaults.freeClashDayKey;
        next.freeClashesUsedToday = clampNumber(parsed?.freeClashesUsedToday, defaults.freeClashesUsedToday, 0);
        next.dailySupplyAt = clampNumber(parsed?.dailySupplyAt, defaults.dailySupplyAt, 0);

        next.stats.duels = clampNumber(parsed?.stats?.duels, defaults.stats.duels, 0);
        next.stats.wins = clampNumber(parsed?.stats?.wins, defaults.stats.wins, 0);
        next.stats.bossWins = clampNumber(parsed?.stats?.bossWins, defaults.stats.bossWins, 0);
        next.stats.cardUpgrades = clampNumber(parsed?.stats?.cardUpgrades, defaults.stats.cardUpgrades, 0);
        next.stats.researchUpgrades = clampNumber(parsed?.stats?.researchUpgrades, defaults.stats.researchUpgrades, 0);
        next.stats.cratesOpened = clampNumber(parsed?.stats?.cratesOpened, defaults.stats.cratesOpened, 0);

        next.payment.totalSpent = clampNumber(parsed?.payment?.totalSpent, defaults.payment.totalSpent, 0);
        next.payment.sponsorPass = !!parsed?.payment?.sponsorPass;
        next.payment.purchaseCount = clampNumber(parsed?.payment?.purchaseCount, defaults.payment.purchaseCount, 0);
        next.payment.claimedOfferIds = Array.isArray(parsed?.payment?.claimedOfferIds) ? parsed.payment.claimedOfferIds.filter((id) => !!offerMap[id]) : [];
        next.payment.claimedOrderIds = Array.isArray(parsed?.payment?.claimedOrderIds) ? parsed.payment.claimedOrderIds.filter((id) => typeof id === 'string') : [];
        next.payment.verifiedTxids = Array.isArray(parsed?.payment?.verifiedTxids) ? parsed.payment.verifiedTxids.filter((id) => typeof id === 'string').slice(0, 40) : [];
        next.payment.recentOrders = Array.isArray(parsed?.payment?.recentOrders)
            ? parsed.payment.recentOrders
                .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
                .slice(0, 8)
                .map((item) => ({
                    id: item.id,
                    offerId: offerMap[item.offerId] ? item.offerId : '',
                    txid: typeof item.txid === 'string' ? item.txid : '',
                    exactAmount: clampNumber(item.exactAmount, 0, 0),
                    verifiedAt: clampNumber(item.verifiedAt, 0, 0)
                }))
                .filter((item) => !!item.offerId)
            : [];
        next.payment.recentOrders.forEach((item) => {
            if (!next.payment.claimedOfferIds.includes(item.offerId)) next.payment.claimedOfferIds.push(item.offerId);
            if (!next.payment.claimedOrderIds.includes(item.id)) next.payment.claimedOrderIds.push(item.id);
            if (item.txid && !next.payment.verifiedTxids.includes(item.txid)) next.payment.verifiedTxids.push(item.txid);
        });
        inferLegacyOwnedOfferIds(next.payment).forEach((offerId) => {
            if (!next.payment.claimedOfferIds.includes(offerId)) next.payment.claimedOfferIds.push(offerId);
        });
        next.payment.verifiedTxids = next.payment.verifiedTxids.slice(0, 40);
        next.payment.pendingOrder = parsed?.payment?.pendingOrder && typeof parsed.payment.pendingOrder === 'object'
            ? {
                id: typeof parsed.payment.pendingOrder.id === 'string' ? parsed.payment.pendingOrder.id : '',
                offerId: offerMap[parsed.payment.pendingOrder.offerId] ? parsed.payment.pendingOrder.offerId : '',
                exactAmount: clampNumber(parsed.payment.pendingOrder.exactAmount, 0, 0),
                payAddress: typeof parsed.payment.pendingOrder.payAddress === 'string' ? parsed.payment.pendingOrder.payAddress : PAYMENT_WALLET,
                network: typeof parsed.payment.pendingOrder.network === 'string' ? parsed.payment.pendingOrder.network : PAYMENT_NETWORK,
                createdAt: clampNumber(parsed.payment.pendingOrder.createdAt, 0, 0),
                expiresAt: clampNumber(parsed.payment.pendingOrder.expiresAt, 0, 0)
            }
            : null;
        if (!next.payment.pendingOrder?.id || !next.payment.pendingOrder?.offerId) next.payment.pendingOrder = null;
        if (next.payment.pendingOrder && (next.payment.claimedOrderIds.includes(next.payment.pendingOrder.id) || next.payment.claimedOfferIds.includes(next.payment.pendingOrder.offerId))) {
            next.payment.pendingOrder = null;
        }
        next.payment.purchaseCount = Math.max(next.payment.purchaseCount, next.payment.recentOrders.length, next.payment.claimedOrderIds.length, next.payment.claimedOfferIds.length);
        next.payment.sponsorPass = next.payment.sponsorPass || next.payment.purchaseCount > 0 || next.payment.claimedOfferIds.length > 0 || next.payment.recentOrders.length > 0;
        next.lastResult = parsed?.lastResult && typeof parsed.lastResult === 'object' ? parsed.lastResult : null;
        return next;
    }
}());
