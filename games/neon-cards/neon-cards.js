(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_neon_cards_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;

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
                markBattleNotice(text('Back in battle.', 'Back in battle.'), 'good');
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
        if (ui.backLink) ui.backLink.textContent = text('鈫?Back To Hub', '鈫?Back To Hub');
        if (ui.heroEyebrow) ui.heroEyebrow.textContent = text('Genesis Neon Cards', 'Genesis Neon Cards');
        if (ui.heroTitle) ui.heroTitle.textContent = localize(config.meta.title);
        if (ui.heroSubtitle) ui.heroSubtitle.textContent = localize(config.meta.subtitle);
        document.title = state.lang === 'en' ? 'Neon Cards' : '闇撹櫣鍗＄墝';

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
                        <div class="nc-card-copy">${escapeHtml(text('Drag cards to lanes, cast tactics, and fight short matches. This first pass resolves battles with a value simulation so we can keep building the combat layer.', 'Drag cards to lanes, cast tactics, and fight short matches. This first pass resolves battles with a value simulation so we can keep building the combat layer.'))}</div>
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
                        <div class="nc-card-copy">${escapeHtml(text('The live battle layer comes next; for now we validate the layout and economy through three-lane pressure, hand cards, and results.', 'The live battle layer comes next; for now we validate the layout and economy through three-lane pressure, hand cards, and results.'))}</div>
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
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9992;', text('Current Lineup', 'Current Lineup'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('1 leader, 3 units, 1 tactic. Finish one core deck before chasing a second setup.', '1 leader, 3 units, 1 tactic. Finish one core deck before chasing a second setup.'))}</div>
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
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Leaders', 'Leaders'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Your leader defines the pace of the whole lineup. Only one can be active.', 'Your leader defines the pace of the whole lineup. Only one can be active.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid">
                    ${config.leaders.map(renderLeaderCard).join('')}
                </div>
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Units', 'Units'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Deploy up to 3 units. A strong starting shape is 1 tank, 1 damage, 1 support or finisher.', 'Deploy up to 3 units. A strong starting shape is 1 tank, 1 damage, 1 support or finisher.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid">
                    ${config.units.map(renderUnitCard).join('')}
                </div>
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9889;', text('Tactics', 'Tactics'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('The first version equips 1 tactic card to highlight burst responses and wall breaks in short matches.', 'The first version equips 1 tactic card to highlight burst responses and wall breaks in short matches.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid">
                    ${config.tactics.map(renderTacticCard).join('')}
                </div>
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', text('Crate Station', 'Crate Station'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Start with free and daily crates, then use cores and credits to patch missing fragments.', 'Start with free and daily crates, then use cores and credits to patch missing fragments.'))}</div>
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
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10070;', text('Permanent Lab', 'Permanent Lab'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Research feeds directly into clash energy, frontline, backline, tactics, and economy while steadily consuming credits and chips.', 'Research feeds directly into clash energy, frontline, backline, tactics, and economy while steadily consuming credits and chips.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag">${escapeHtml(text('Total Lv', 'Total Lv'))}</span>
                        <strong>${escapeHtml(String(getTotalResearchLevels()))}</strong>
                    </div>
                </div>
                <div class="nc-card-grid">
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
                <div class="nc-card-grid">
                    ${missions.map(({ mission, progress, claimed, ready }) => renderMissionCard(mission, progress, claimed, ready)).join('')}
                </div>
            </section>
        `;
    }

    function renderSeasonTab() {
        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10039;', text('Season Route', 'Season Route'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Matches, crate opens, upgrades, and boss wins all feed the season. This first pass focuses on the dual tracks and claim flow.', 'Matches, crate opens, upgrades, and boss wins all feed the season. This first pass focuses on the dual tracks and claim flow.'))}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${getClaimableSeasonCount() ? 'is-good' : ''}">${escapeHtml(text('Season XP', 'Season XP'))}</span>
                        <strong>${escapeHtml(String(state.save.seasonXp))}</strong>
                    </div>
                </div>
                <div class="nc-two-col">
                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9733;', text('Free Track', 'Free Track'))}</h3>
                                <div class="nc-card-copy">${escapeHtml(text('Available to every player.', 'Available to every player.'))}</div>
                            </div>
                        </div>
                        <div class="nc-track-grid">
                            ${config.seasonFreeTrack.map((node) => renderSeasonNode('free', node)).join('')}
                        </div>
                    </article>

                    <article class="nc-list-card">
                        <div class="nc-card-head">
                            <div>
                                <h3>${renderIconLabel('&#9734;', text('Sponsor Track', 'Sponsor Track'))}</h3>
                                <div class="nc-card-copy">${escapeHtml(isSeasonPassUnlocked() ? text('Unlocked and ready for extra long-term rewards.', 'Unlocked and ready for extra long-term rewards.') : text('The next payment integration step will unlock this track through first top-up.', 'The next payment integration step will unlock this track through first top-up.'))}</div>
                            </div>
                            <span class="nc-tag ${isSeasonPassUnlocked() ? 'is-good' : 'is-warning'}">${escapeHtml(isSeasonPassUnlocked() ? text('Unlocked', 'Unlocked') : text('Payment Next', 'Payment Next'))}</span>
                        </div>
                        <div class="nc-track-grid">
                            ${config.seasonPremiumTrack.map((node) => renderSeasonNode('premium', node)).join('')}
                        </div>
                    </article>
                </div>
            </section>
        `;
    }

    function renderShopTab() {
        const softItems = config.shopItems.filter((item) => item.price > 0).map(renderShopItemCard).join('');
        const premiumItems = config.paymentOffers.map(renderOfferCard).join('');
        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Supply Hub', 'Supply Hub'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Free supply, soft-currency catch-up, and premium packs all live on this page.', 'Free supply, soft-currency catch-up, and premium packs all live on this page.'))}</div>
                    </div>
                </div>

                <div class="nc-card-grid">
                    ${renderDailySupplyCard()}
                    ${softItems}
                </div>
            </section>

            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', text('Premium Pack Preview', 'Premium Pack Preview'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('This pass builds the pack structure, values, and entry points first; the next step will connect on-chain verification and reward delivery.', 'This pass builds the pack structure, values, and entry points first; the next step will connect on-chain verification and reward delivery.'))}</div>
                    </div>
                </div>
                <div class="nc-card-grid">
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
            note: `${text('Lane', 'Lane')}: ${unit.lane === 'front' ? 'Front' : unit.lane === 'back' ? 'Back' : 'Flex'}${starCost ? ` • ${text('Next Star', 'Next Star')}: ${formatStarCost(starCost)}` : ''}`,
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
            <article class="nc-card-item ${ready ? 'is-ready' : ''} ${claimed ? 'is-claimed' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(claimed ? '&#10003;' : ready ? '&#9733;' : '&#9679;', localize(mission.title), `${progress}/${mission.target}`)}</h3>
                        <div class="nc-card-copy">${escapeHtml(getMissionHint(mission.metric))}</div>
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
        return `
            <article class="nc-track-card ${ready && !claimed && !locked ? 'is-ready' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(track === 'premium' ? '&#9734;' : '&#9733;', `${track === 'premium' ? text('Sponsor', 'Sponsor') : text('Free', 'Free')} ${node.id.toUpperCase()}`)}</h3>
                    </div>
                    <span class="nc-tag ${ready && !locked ? 'is-good' : locked ? 'is-warning' : ''}">${escapeHtml(claimed ? text('Claimed', 'Claimed') : `${node.xp} XP`)}</span>
                </div>
                ${renderRewardPills(node.reward)}
                <div class="nc-action-row">
                    <button class="ghost-btn wide-btn" type="button" data-action="${track === 'premium' ? 'claimPremiumSeason' : 'claimSeason'}" data-value="${node.id}" ${ready && !claimed && !locked ? '' : 'disabled'}>${escapeHtml(locked ? text('Payment Next', 'Payment Next') : claimed ? text('Claimed', 'Claimed') : text('Claim', 'Claim'))}</button>
                </div>
            </article>
        `;
    }

    function renderDailySupplyCard() {
        const ready = canClaimDailySupply();
        return `
            <article class="nc-card-item ${ready ? 'is-ready' : ''}">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9733;', text('Daily Free Supply', 'Daily Free Supply'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('One claim per day for a small refill of credits, cores, and season XP.', 'One claim per day for a small refill of credits, cores, and season XP.'))}</div>
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
            <article class="nc-card-item">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9638;', localize(item.title))}</h3>
                        <div class="nc-card-copy">${escapeHtml(getShopItemHint(item.id))}</div>
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

    function renderOfferCard(offer) {
        return `
            <article class="nc-card-item is-premium">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9670;', localize(offer.name))}</h3>
                        <div class="nc-card-copy">${escapeHtml(localize(offer.permanent))}</div>
                    </div>
                    <span class="nc-tag is-good">${escapeHtml(`${offer.price} USDT`)}</span>
                </div>
                ${renderRewardPills(offer.reward)}
                <div class="nc-action-row">
                    <button class="primary-btn wide-btn" type="button" data-action="previewOffer" data-value="${offer.id}">${escapeHtml(text('Preview Pack', 'Preview Pack'))}</button>
                </div>
            </article>
        `;
    }

    function renderLastResultCard() {
        const result = state.save.lastResult;
        return `
            <section class="nc-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel(result.win ? '&#10003;' : '&#10005;', text('Latest Report', 'Latest Report'), result.chapterId)}</h3>
                        <div class="nc-card-copy">${escapeHtml(result.win ? text('This run is complete. Next, patch your current wall in Deck or Lab.', 'This run is complete. Next, patch your current wall in Deck or Lab.') : text('This run did not clear, but you still earned partial resources. Patch your key slots first.', 'This run did not clear, but you still earned partial resources. Patch your key slots first.'))}</div>
                    </div>
                    <span class="nc-tag ${result.win ? 'is-good' : 'is-warning'}">${escapeHtml(result.win ? text('Win', 'Win') : text('Retreat', 'Retreat'))}</span>
                </div>
                ${renderRewardPills(result.reward)}
                ${result.firstClear ? `<div class="nc-inline-note">${escapeHtml(text('First clear reward secured.', 'First clear reward secured.'))}</div>` : ''}
                ${result.fragments?.length ? `<div class="nc-inline-note">${escapeHtml(formatFragmentSummary(result.fragments))}</div>` : ''}
            </section>
        `;
    }

    function renderFlowStrip(tabId, context = {}) {
        const chapter = context.chapter || getSelectedChapter();
        const gap = Math.max(0, Number(context.gap) || 0);
        const freeLeft = getRemainingFreeClashes();
        const items = {
            clash: [
                { icon: '&#9655;', title: text('Entry', 'Entry'), body: text(`${freeLeft}/${getDailyFreeClashesLimit()} free today, then ${getEntryCost(chapter)} Cr per run.`, `${freeLeft}/${getDailyFreeClashesLimit()} free today, then ${getEntryCost(chapter)} Cr per run.`) },
                { icon: '&#9671;', title: text('First Clear', 'First Clear'), body: text('Boss first clears are the most valuable and grant extra chips plus bigger rewards.', 'Boss first clears are the most valuable and grant extra chips plus bigger rewards.') },
                { icon: '&#9888;', title: text('Current Wall', 'Current Wall'), body: gap > 0 ? text(`${formatCompact(gap)} more power needed right now.`, `${formatCompact(gap)} more power needed right now.`) : text('Your current power is on target. Keep pushing.', 'Your current power is on target. Keep pushing.') }
            ]
        }[tabId] || [];

        return `
            <div class="nc-flow-grid">
                ${items.map((item) => `
                    <div class="nc-flow-card">
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
            ? `${text('Tactic', 'Tactic')} • ${text('Cost', 'Cost')} ${card.cost}`
            : `${localize(card.role)} • ${text('Cost', 'Cost')} ${card.cost}`;
        return `
            <div class="nc-hand-card ${type === 'tactic' ? 'is-tactic' : ''}">
                <strong>${escapeHtml(localize(card.name))}</strong>
                <span>${escapeHtml(role)}</span>
            </div>
        `;
    }

    function renderCardPanel({ icon, title, subtitle, badge, locked = false, stats = [], note = '', actions = '' }) {
        return `
            <article class="nc-card-item ${locked ? 'is-locked' : ''}">
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
            <div class="nc-slot-card">
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
        ui.modalEyebrow.textContent = state.modal.eyebrow || text('INFO', 'INFO');
        ui.modalTitle.textContent = state.modal.title || '';
        ui.modalSubtitle.textContent = state.modal.subtitle || '';
        ui.modalBody.innerHTML = state.modal.body || '';
        ui.modalActions.innerHTML = (state.modal.actions || [{ label: text('Got it', 'Got it'), action: 'closeModal' }]).map((item) => `
            <button class="${item.tone === 'ghost' ? 'ghost-btn' : 'primary-btn'}" type="button" data-action="${item.action}" ${item.value ? `data-value="${item.value}"` : ''}>${escapeHtml(item.label)}</button>
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
        openModal({
            eyebrow: text('Pack Preview', 'Pack Preview'),
            title: localize(offer.name),
            subtitle: `${offer.price} USDT`,
            body: `
                <div class="nc-inline-note">${escapeHtml(text('The first pass now includes the page shell, tabs, economy loop, and pack values; the next step connects payment verification, order checks, and reward delivery.', 'The first pass now includes the page shell, tabs, economy loop, and pack values; the next step connects payment verification, order checks, and reward delivery.'))}</div>
                ${renderRewardPills(offer.reward)}
                <div class="nc-inline-note">${escapeHtml(localize(offer.permanent))}</div>
            `,
            actions: [
                { label: text('Connect Payment Next', 'Connect Payment Next'), action: 'closeModal' },
                { label: text('Close', 'Close'), action: 'closeModal', tone: 'ghost' }
            ]
        });
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
        const chapter = getSelectedChapter();
        const battle = state.tab === 'clash' ? state.battle : null;
        if (battle) {
            ui.heroSummary.innerHTML = `
                <div class="nc-summary-grid">
                    ${renderSummaryItem('&#10022;', text('Current Stage', 'Current Stage'), `${chapter.id} • ${localize(chapter.name)}`)}
                    ${renderSummaryItem('&#9201;', text('Timer', 'Timer'), battle.result ? text('Settled', 'Settled') : formatBattleTime(Math.max(0, battle.maxTime - battle.time)))}
                    ${renderSummaryItem('&#9889;', text('Energy', 'Energy'), `${battle.result ? 0 : battle.energy.toFixed(1)} / ${battle.maxEnergy}`)}
                    ${renderSummaryItem('&#9673;', text('Core', 'Core'), `${getBattleCorePercent('ally')}% / ${getBattleCorePercent('enemy')}%`)}
                </div>
            `;
            return;
        }

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
        const gap = chapter.recommended - power;
        const battle = state.battle;
        if (battle) {
            return renderBattleStage();
        }
        return `
            <section class="nc-card">
                <div class="nc-panel-head">
                    <div>
                        <h3>${renderIconLabel('&#10022;', localize(chapter.name), chapter.id)}</h3>
                        <div class="nc-card-copy">${escapeHtml(
                            battle
                                ? text('Tap a hand card, then tap a lane to deploy. Tactics and leader skills benefit from lane focus and lab bonuses.', 'Tap a hand card, then tap a lane to deploy. Tactics and leader skills benefit from lane focus and lab bonuses.')
                                : text('The first live tri-lane combat pass is now connected: deploy units, cast tactics, pick boosts, then grow through Deck and Lab.', 'The first live tri-lane combat pass is now connected: deploy units, cast tactics, pick boosts, then grow through Deck and Lab.')
                        )}</div>
                    </div>
                    <div class="nc-head-kpi">
                        <span class="nc-tag ${battle?.active ? 'is-good' : gap > 0 ? 'is-warning' : 'is-good'}">${escapeHtml(battle?.active ? text('Live Clash', 'Live Clash') : text('Recommended', 'Recommended'))}</span>
                        <strong>${escapeHtml(battle?.active ? formatBattleTime(Math.max(0, battle.maxTime - battle.time)) : `${power} / ${chapter.recommended}`)}</strong>
                    </div>
                </div>

                ${battle ? '' : `
                    <div class="nc-chip-row">
                        ${config.chapters.map((item, index) => renderChapterChip(item, index)).join('')}
                    </div>

                    ${renderFlowStrip('clash', { chapter, gap })}
                `}
            </section>

            ${battle ? renderBattleStage() : renderClashSetup(chapter, power)}

            ${!battle && state.save.lastResult ? renderLastResultCard() : ''}
        `;
    }

    function renderClashSetup(chapter, power) {
        const unitIds = state.save.selectedUnits;
        return `
            <section class="nc-card nc-battle-card">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9776;', text('Tri-Lane Preview', 'Tri-Lane Preview'))}</h3>
                        <div class="nc-card-copy">${escapeHtml(text('Confirm your 3 deployed units and tactic before the fight. Starting now enters a live battle instead of instant numeric resolution.', 'Confirm your 3 deployed units and tactic before the fight. Starting now enters a live battle instead of instant numeric resolution.'))}</div>
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
        `;
    }

    function renderBattleStage() {
        const battle = state.battle;
        if (!battle) return '';
        const chapter = battle.chapter;
        const selectedCard = getBattleSelectedCard();
        const boostList = battle.boosts.map((boostId) => getBattleBoostDef(boostId)).filter(Boolean);
        return `
            <section class="nc-card nc-battle-card nc-battle-card--live">
                <div class="nc-card-head">
                    <div>
                        <h3>${renderIconLabel('&#9876;', text('Live Clash', 'Live Clash'), chapter.id)}</h3>
                        <div class="nc-card-copy">${escapeHtml(getBattleHeadline(selectedCard))}</div>
                    </div>
                    <span class="nc-tag ${battle.result ? (battle.result.win ? 'is-good' : 'is-warning') : battle.pausedByVisibility ? 'is-warning' : 'is-good'}">${escapeHtml(
                        battle.result
                            ? (battle.result.win ? text('Victory', 'Victory') : text('Retreat', 'Retreat'))
                            : battle.pausedByVisibility
                                ? text('Paused', 'Paused')
                                : text('Active', 'Active')
                    )}</span>
                </div>

                <div class="nc-battle-hud">
                    ${renderBattleHudBox(text('Time Left', 'Time Left'), formatBattleTime(Math.max(0, battle.maxTime - battle.time)), battle.maxTime - battle.time <= 15 ? 'warning' : '')}
                    ${renderBattleHudBox(text('Energy', 'Energy'), `${battle.energy.toFixed(1)} / ${battle.maxEnergy}`)}
                    ${renderBattleHudBox(text('Leader Skill', 'Leader Skill'), `${Math.round(battle.leaderCharge)}%`, battle.leaderCharge >= 100 ? 'good' : '')}
                    ${renderBattleHudBox(text('Core HP', 'Core HP'), `${getBattleCorePercent('ally')}% / ${getBattleCorePercent('enemy')}%`, getBattleCorePercent('enemy') < getBattleCorePercent('ally') ? 'good' : '')}
                </div>

                <div class="nc-battle-state-strip">
                    ${renderBattleStateChip('&#10039;', `${text('Wave', 'Wave')} ${battle.wave}`)}
                    ${renderBattleStateChip('&#9673;', `${text('Focus', 'Focus')} • ${getBattleLaneLabel(battle.focusLaneId)}`)}
                    ${renderBattleStateChip('&#9888;', getBattleBossStateText(), battle.bossDefeated ? 'good' : battle.time >= Math.max(42, battle.maxTime - 16) ? 'warning' : '')}
                </div>

                ${boostList.length ? `
                    <div class="nc-battle-boosts">
                        ${boostList.map((boost) => `
                            <span class="nc-chip is-active nc-chip--mini">
                                <strong>${escapeHtml(localize(boost.title))}</strong>
                                <small>${escapeHtml(localize(boost.short))}</small>
                            </span>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="nc-battle-stage">
                    ${battle.notice && battle.notice.until > battle.time ? `<div class="nc-battle-notice ${battle.notice.tone ? `is-${battle.notice.tone}` : ''}">${escapeHtml(battle.notice.text)}</div>` : ''}
                    <div class="nc-battle-arena">
                        ${battle.banner && battle.banner.until > battle.time ? renderBattleBanner(battle.banner) : ''}
                        ${battle.lanes.map(renderBattleLane).join('')}
                        ${battle.reinforcementPending ? renderBattleBoostOverlay() : ''}
                        ${battle.result ? renderBattleResultOverlay() : ''}
                    </div>
                </div>

                <div class="nc-hand-row nc-hand-row--battle">
                    ${battle.hand.map((cardId) => renderBattleHandCard(cardId)).join('')}
                </div>

                <div class="nc-action-row nc-action-row--battle">
                    <button class="ghost-btn wide-btn" type="button" data-action="useLeaderSkill" ${battle.active && !battle.reinforcementPending && !battle.result && battle.leaderCharge >= 100 ? '' : 'disabled'}>${escapeHtml(text(`Leader Skill • ${getBattleLaneLabel(battle.focusLaneId)}`, `Leader Skill • ${getBattleLaneLabel(battle.focusLaneId)}`))}</button>
                    <button class="ghost-btn wide-btn" type="button" data-action="retreatBattle" ${battle.active && !battle.result ? '' : 'disabled'}>${escapeHtml(text('Tactical Retreat', 'Tactical Retreat'))}</button>
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
        const isFocus = battle.focusLaneId === lane.id;
        const pulseClass = lane.pulseUntil > battle.time ? ` is-pulse-${lane.pulseTone || 'good'}` : '';
        const selectedCard = getBattleSelectedCard();
        const actionLabel = battle.result
            ? text('Settled', 'Settled')
            : selectedCard
                ? `${selectedCard.type === 'tactic' ? text('Cast', 'Cast') : text('Deploy', 'Deploy')} ${localize(selectedCard.name)}`
                : text('Set Focus', 'Set Focus');
        return `
            <article class="nc-battle-lane ${isFocus ? 'is-focus' : ''}${pulseClass}">
                <div class="nc-lane-head">
                    <strong>${escapeHtml(getBattleLaneLabel(lane.id))}</strong>
                    <span>${escapeHtml(`${Math.round((lane.playerCoreHp / lane.playerCoreMax) * 100)}% / ${Math.round((lane.enemyCoreHp / lane.enemyCoreMax) * 100)}%`)}</span>
                </div>
                <div class="nc-battle-track">
                    <div class="nc-battle-core is-ally">
                        <span>${escapeHtml(text('Ally Core', 'Ally Core'))}</span>
                        <strong>${escapeHtml(String(Math.max(0, Math.round(lane.playerCoreHp))))}</strong>
                    </div>
                    <div class="nc-battle-core is-enemy">
                        <span>${escapeHtml(text('Enemy Core', 'Enemy Core'))}</span>
                        <strong>${escapeHtml(String(Math.max(0, Math.round(lane.enemyCoreHp))))}</strong>
                    </div>
                    <div class="nc-battle-unit-layer">
                        ${lane.friendly.map((unit, index) => renderBattleUnit(unit, index, lane.friendly.length)).join('')}
                        ${lane.enemy.map((unit, index) => renderBattleUnit(unit, index, lane.enemy.length)).join('')}
                    </div>
                </div>
                <div class="nc-battle-lane-foot">
                    <div>
                        <div class="nc-note-mini">${escapeHtml(renderBattleLaneHint(lane))}</div>
                        ${renderBattleLaneEffects(lane)}
                    </div>
                    <button class="ghost-btn" type="button" data-action="playBattleCard" data-value="${lane.id}" ${battle.active && !battle.reinforcementPending && !battle.result ? '' : 'disabled'}>${escapeHtml(actionLabel)}</button>
                </div>
            </article>
        `;
    }

    function renderBattleUnit(unit, index, count) {
        const baseTop = unit.side === 'ally' ? 48 : 12;
        const step = count > 1 ? Math.min(16, 28 / (count - 1)) : 0;
        const offset = unit.side === 'ally' ? (index * step) : ((count - 1 - index) * step);
        const hpRatio = Math.max(0, unit.hp / Math.max(1, unit.maxHp));
        const shieldRatio = Math.max(0, unit.shield / Math.max(1, unit.maxHp));
        return `
            <div class="nc-battle-unit ${unit.side === 'ally' ? 'is-ally' : 'is-enemy'} ${unit.isBoss ? 'is-boss' : ''}" style="left:${unit.x.toFixed(1)}%; top:${(baseTop + offset).toFixed(1)}px;">
                <strong>${escapeHtml(getBattleUnitShortName(unit))}</strong>
                <div class="nc-battle-unit-bars">
                    <div class="nc-battle-health"><div style="width:${(hpRatio * 100).toFixed(1)}%"></div></div>
                    ${unit.shield > 0 ? `<div class="nc-battle-shield"><div style="width:${Math.min(100, shieldRatio * 100).toFixed(1)}%"></div></div>` : ''}
                </div>
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
        return `
            <button class="nc-hand-card nc-battle-hand ${selected ? 'is-selected' : ''} ${ready ? 'is-ready' : 'is-cooling'} ${affordable && ready ? 'is-affordable' : ''}" type="button" data-action="selectBattleCard" data-value="${cardId}" ${battle.active && !battle.reinforcementPending && !battle.result ? '' : 'disabled'}>
                <strong>${escapeHtml(localize(card.name))}</strong>
                <span>${escapeHtml(`${card.type === 'tactic' ? text('Tactic', 'Tactic') : localize(card.role)} • ${text('Cost', 'Cost')} ${card.cost}`)}</span>
                <small>${escapeHtml(ready ? (affordable ? text('Ready', 'Ready') : text('Need Energy', 'Need Energy')) : `${text('Cooldown', 'Cooldown')} ${cooldown.toFixed(1)}s`)}</small>
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
        const nextChapter = result?.win ? getNextUnlockedChapterId(battle.chapter.id) : '';
        return `
            <div class="nc-battle-overlay">
                <div class="nc-battle-overlay-card">
                    <div class="eyebrow">${escapeHtml(result.win ? text('Clash Cleared', 'Clash Cleared') : text('Tactical Retreat', 'Tactical Retreat'))}</div>
                    <h3>${escapeHtml(localize(battle.chapter.name))}</h3>
                    <div class="nc-card-copy">${escapeHtml(result.summary)}</div>
                    <div class="nc-stat-grid">
                        ${renderStatBox(text('Ally Core', 'Ally Core'), `${getBattleCorePercent('ally')}%`)}
                        ${renderStatBox(text('Enemy Core', 'Enemy Core'), `${getBattleCorePercent('enemy')}%`)}
                        ${renderStatBox(text('Time Used', 'Time Used'), formatBattleTime(battle.time))}
                        ${renderStatBox(text('Boosts', 'Boosts'), String(battle.boosts.length))}
                    </div>
                    ${renderRewardPills(result.reward)}
                    ${result.firstClear ? `<div class="nc-inline-note">${escapeHtml(text('First clear reward secured.', 'First clear reward secured.'))}</div>` : ''}
                    ${result.fragments?.length ? `<div class="nc-inline-note">${escapeHtml(formatFragmentSummary(result.fragments))}</div>` : ''}
                    <div class="nc-action-row">
                        <button class="primary-btn wide-btn" type="button" data-action="closeBattleResult" ${nextChapter ? `data-value="${nextChapter}"` : ''}>${escapeHtml(nextChapter ? text('Next Chapter', 'Next Chapter') : text('Continue', 'Continue'))}</button>
                        <button class="ghost-btn wide-btn" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('Open Deck', 'Open Deck'))}</button>
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
        battle.selectedCardId = battle.selectedCardId === cardId ? '' : cardId;
        markBattleNotice(
            battle.selectedCardId
                ? text(`Selected ${localize(getBattleCardById(battle.selectedCardId).name)}. Tap a lane to deploy.`, `Selected ${localize(getBattleCardById(battle.selectedCardId).name)}. Tap a lane to deploy.`)
                : text('Card selection cleared.', 'Card selection cleared.'),
            battle.selectedCardId ? 'good' : ''
        );
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
            markBattleNotice(text(`${getBattleLaneLabel(laneId)} is now the focus lane.`, `${getBattleLaneLabel(laneId)} is now the focus lane.`), 'good');
            renderClashRuntime();
            return;
        }

        const card = getBattleCardById(battle.selectedCardId);
        if (!card) return;
        const cooldown = Math.max(0, battle.cooldowns[card.id] || 0);
        if (cooldown > 0.05) {
            showToast(text('That card is still cooling down.', 'That card is still cooling down.'), 'warning');
            return;
        }
        if (battle.energy < card.cost) {
            showToast(text('Not enough energy.', 'Not enough energy.'), 'warning');
            return;
        }

        if (card.type === 'unit') {
            if (lane.friendly.length >= 5) {
                showToast(text('This lane is full. Wait for your frontline to advance.', 'This lane is full. Wait for your frontline to advance.'), 'warning');
                return;
            }
            battle.energy -= card.cost;
            lane.friendly.push(createFriendlyBattleUnit(card.id));
            markLanePulse(laneId, 'good');
            battle.cooldowns[card.id] = getBattleCardCooldown(card);
            markBattleBanner(localize(card.name), `${getBattleLaneLabel(laneId)} deployment confirmed`, 'good');
            markBattleNotice(text(`${localize(card.name)} deployed to ${getBattleLaneLabel(laneId)}.`, `${localize(card.name)} deployed to ${getBattleLaneLabel(laneId)}.`), 'good');
        } else {
            battle.energy -= card.cost;
            battle.cooldowns[card.id] = getBattleCardCooldown(card);
            markLanePulse(laneId, 'warning');
            markBattleBanner(localize(card.name), `${getBattleLaneLabel(laneId)} tactic released`, 'warning');
            applyBattleTactic(card.id, lane);
        }

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
        markBattleBanner('Leader Skill Cast', `${leaderMap[state.save.selectedLeaderId] ? localize(leaderMap[state.save.selectedLeaderId].name) : 'Leader'} engaged`, 'good');
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
        markBattleBanner(localize(boost.title), localize(boost.short), 'good');
        markBattleNotice(text(`Boost picked: ${localize(boost.title)}.`, `Boost picked: ${localize(boost.title)}.`), 'good');
        renderClashRuntime();
    }

    function retreatBattle() {
        if (!state.battle?.active) return;
        finishBattle(false, true);
    }

    function closeBattleResult(nextChapterId = '') {
        stopBattleLoop();
        state.battle = null;
        if (nextChapterId && chapterMap[nextChapterId]) {
            state.save.selectedChapterId = nextChapterId;
            state.tab = 'clash';
            state.save.tab = 'clash';
        }
        saveProgress();
        renderAll();
    }

    function createBattleState(chapter) {
        const energyLevel = getResearchLevel('energyMatrix');
        const tacticLevel = getResearchLevel('tacticCompiler');
        const hand = [...state.save.selectedUnits, state.save.selectedTacticId];
        const chapterIndex = Math.max(0, getChapterIndex(chapter.id));
        const deckPower = getDeckPower();
        const playerCoreBase = 220 + Math.round(deckPower * 0.08);
        const enemyCoreBase = 180 + Math.round(chapter.recommended * 0.24);
        const laneScales = [0.94, 1, 1.08];
        return {
            active: true,
            result: null,
            chapter,
            time: 0,
            maxTime: Number(config.battle.sessionSeconds) || 72,
            wave: 1,
            nextWaveAt: 16,
            pausedByVisibility: false,
            reinforcementPending: false,
            reinforcementChoices: [],
            selectedCardId: hand[0] || '',
            hand,
            cooldowns: Object.fromEntries(hand.map((id) => [id, 0])),
            energy: 4,
            maxEnergy: 10 + Math.floor(energyLevel / 4),
            energyRegen: 1 * (1 + (energyLevel * 0.02) + (state.save.payment.totalSpent >= 6 ? 0.03 : 0)),
            leaderCharge: 0,
            leaderChargeRate: (Number(leaderMap[state.save.selectedLeaderId]?.stats?.charge) || 1) * (1.45 + (tacticLevel * 0.03)),
            leaderReadyMarked: false,
            focusLaneId: 'mid',
            boosts: [],
            rewardBoost: 0,
            tacticCooldownFactor: 1,
            attackBoost: 0,
            speedBoost: 0,
            spawnSlowRemaining: 0,
            bossDefeated: false,
            banner: null,
            notice: {
                text: text('Pick a card below, then tap a lane to deploy.', 'Pick a card below, then tap a lane to deploy.'),
                tone: 'good',
                until: 3.2
            },
            lanes: ['top', 'mid', 'bot'].map((id, index) => ({
                id,
                playerCoreMax: Math.round(playerCoreBase * laneScales[index]),
                playerCoreHp: Math.round(playerCoreBase * laneScales[index]),
                enemyCoreMax: Math.round(enemyCoreBase * laneScales[index]),
                enemyCoreHp: Math.round(enemyCoreBase * laneScales[index]),
                friendly: [],
                enemy: [],
                effects: [],
                spawnTimer: 1.4 + (index * 0.45),
                spawnCount: 0,
                bossSpawned: false,
                pulseTone: '',
                pulseUntil: 0,
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
            markBattleNotice('Leader skill is ready.', 'good');
            markBattleBanner('Leader Skill Ready', `Tap the button below to burst ${getBattleLaneLabel(battle.focusLaneId)}.`, 'good');
        }

        Object.keys(battle.cooldowns).forEach((cardId) => {
            battle.cooldowns[cardId] = Math.max(0, (battle.cooldowns[cardId] || 0) - delta);
        });

        if (battle.time >= battle.nextWaveAt && battle.wave < 4) {
            battle.wave += 1;
            battle.nextWaveAt += 16;
            markBattleBanner(`Wave ${battle.wave}`, 'Enemy pressure is rising. Stabilize your focus lane first.', 'warning');
            markBattleNotice(text(`Wave ${battle.wave} incoming.`, `Wave ${battle.wave} incoming.`), 'warning');
        }

        if (!battle.reinforcementPending && !battle.boosts.length && battle.time >= 28) {
            battle.reinforcementPending = true;
            battle.reinforcementChoices = pickBattleBoostChoices();
            markBattleBanner('Mid-Battle Boost', 'Pick one patch upgrade, then keep the pressure on.', 'good');
            markBattleNotice(text('Mid-battle boost is ready.', 'Mid-battle boost is ready.'), 'warning');
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

        const spawnDelta = battle.spawnSlowRemaining > 0 ? delta * 0.5 : delta;
        lane.spawnTimer -= spawnDelta;
        const bossMoment = Math.max(42, battle.maxTime - 16);
        if (!lane.bossSpawned && isBossStage(battle.chapter) && lane.id === 'mid' && battle.time >= bossMoment) {
            lane.bossSpawned = true;
            lane.enemy.push(createEnemyBattleUnit(lane, 'boss'));
            markLanePulse(lane.id, 'warning');
            markBattleBanner('Boss Arrived', 'Mid lane pressure spikes instantly. Hold the frontline first.', 'warning');
            markBattleNotice(text('Boss has entered the mid lane.', 'Boss has entered the mid lane.'), 'warning');
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
            if (unit.isBoss) state.battle.bossDefeated = true;
            return false;
        });
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
                    injured.hp = Math.min(injured.maxHp, injured.hp + unit.heal);
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
                        applyBattleDamage(target, damage);
                        if (unit.splash > 0) {
                            const secondary = enemies.find((enemy) => enemy !== target && enemy.hp > 0);
                            if (secondary) applyBattleDamage(secondary, damage * unit.splash);
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
                        const damage = unit.attack * (side === 'ally' ? (1 + attackBonus) : 1) * (unit.isBoss ? 1.14 : 0.82);
                        if (side === 'ally') {
                            lane.enemyCoreHp = Math.max(0, lane.enemyCoreHp - damage);
                        } else {
                            lane.playerCoreHp = Math.max(0, lane.playerCoreHp - damage);
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
            fragments
        };

        battle.active = false;
        battle.result = {
            win,
            reward,
            firstClear: !!firstClear,
            fragments,
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
        return enemyRatio < allyRatio || laneWins >= 2;
    }

    function createFriendlyBattleUnit(cardId) {
        const card = unitMap[cardId];
        const stats = getBattleUnitStats(cardId);
        return {
            id: `ally-${cardId}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            side: 'ally',
            cardId,
            name: card.name,
            hp: stats.hp,
            maxHp: stats.hp,
            shield: 0,
            attack: stats.attack,
            speed: stats.speed,
            range: stats.range,
            heal: stats.heal,
            splash: stats.splash,
            x: 8,
            attackCooldown: 0.4
        };
    }

    function createEnemyBattleUnit(lane, archetype) {
        const chapter = state.battle.chapter;
        const chapterIndex = Math.max(0, getChapterIndex(chapter.id));
        const scale = 1 + (chapter.chapter * 0.14) + (chapterIndex * 0.07) + (state.battle.time * 0.004);
        const template = getEnemyArchetype(archetype);
        return {
            id: `enemy-${archetype}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            side: 'enemy',
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
            attackCooldown: 0.8
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
        if (state.save.payment.totalSpent >= 68) {
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
            skirmisher: { name: { zh: 'Rift Scout', en: 'Rift Scout' }, attack: 16, hp: 104, speed: 1.02, range: 12 },
            brute: { name: { zh: '閽㈡爡閲嶅叺', en: 'Steel Brute' }, attack: 12, hp: 164, speed: 0.74, range: 12, splash: 0.25 },
            gunner: { name: { zh: '鑴夊啿鐐墜', en: 'Pulse Gunner' }, attack: 24, hp: 92, speed: 0.88, range: 22 },
            captain: { name: { zh: '瑁傜綉鎸囨尌', en: 'Net Captain' }, attack: 28, hp: 148, speed: 0.82, range: 16 },
            boss: { name: { zh: '娣卞煙涓绘満', en: 'Abyss Mainframe' }, attack: 34, hp: 440, speed: 0.68, range: 16, splash: 0.35 }
        };
        return map[id] || map.skirmisher;
    }

    function pickEnemyArchetype(lane) {
        const time = state.battle.time;
        if (time > 44 && Math.random() > 0.82) return 'captain';
        if (time > 20 && Math.random() > 0.68) return 'gunner';
        if (time > 30 && Math.random() > 0.76) return 'brute';
        return lane.spawnCount % 3 === 2 ? 'brute' : 'skirmisher';
    }

    function getEnemySpawnInterval(lane) {
        const chapter = state.battle.chapter.chapter;
        const base = 3.6 - (chapter * 0.22) - (state.battle.time * 0.012);
        return Math.max(1.4, base + (lane.id === 'mid' ? 0 : 0.18));
    }

    function findBattleTarget(unit, enemies) {
        if (!enemies.length) return null;
        const alive = enemies.filter((enemy) => enemy.hp > 0);
        if (!alive.length) return null;
        return alive.sort((left, right) => Math.abs(left.x - unit.x) - Math.abs(right.x - unit.x))[0];
    }

    function applyBattleDamage(target, damage) {
        let amount = Math.max(1, Number(damage) || 0);
        if (target.shield > 0) {
            const shieldLoss = Math.min(target.shield, amount);
            target.shield -= shieldLoss;
            amount -= shieldLoss;
        }
        if (amount > 0) target.hp = Math.max(0, target.hp - amount);
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
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} is overclocked.`, `${getBattleLaneLabel(lane.id)} is overclocked.`), 'good');
            return;
        }
        if (tacticId === 'shieldNet') {
            lane.playerCoreHp = Math.min(lane.playerCoreMax, lane.playerCoreHp + (28 * impact));
            lane.friendly.forEach((unit) => {
                unit.shield += 48 * impact;
            });
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} received shields.`, `${getBattleLaneLabel(lane.id)} received shields.`), 'good');
            return;
        }
        if (tacticId === 'empLock') {
            lane.effects.push({ side: 'enemy', jam: 1, remaining: 3.6 + (impact * 0.4) });
            markBattleNotice(text(`${getBattleLaneLabel(lane.id)} is hit by EMP lock.`, `${getBattleLaneLabel(lane.id)} is hit by EMP lock.`), 'warning');
            return;
        }
        if (tacticId === 'orbitalDrop') {
            if (lane.enemy.length) {
                lane.enemy.forEach((unit) => applyBattleDamage(unit, 78 * impact));
            } else {
                lane.enemyCoreHp = Math.max(0, lane.enemyCoreHp - (64 * impact));
            }
            markBattleNotice(text(`Orbital strike hit ${getBattleLaneLabel(lane.id)}.`, `Orbital strike hit ${getBattleLaneLabel(lane.id)}.`), 'warning');
        }
    }

    function applyLeaderSkill(laneId) {
        const battle = state.battle;
        const leaderId = state.save.selectedLeaderId;
        const lane = battle.lanes.find((item) => item.id === laneId) || battle.lanes[1];
        const leaderPower = getCardPower('leader', leaderId);
        if (leaderId === 'marshalZero') {
            battle.lanes.forEach((item) => {
                item.effects.push({ side: 'ally', attack: 0.18 + (leaderPower / 1800), speed: 0.12, remaining: 6.5 });
            });
            markLanePulse('all', 'good');
            markBattleNotice(text('Marshal Zero overclocked every lane.', 'Marshal Zero overclocked every lane.'), 'good');
            return;
        }
        if (leaderId === 'aegisNova') {
            battle.lanes.forEach((item) => {
                item.playerCoreHp = Math.min(item.playerCoreMax, item.playerCoreHp + (36 + (leaderPower * 0.12)));
                item.friendly.forEach((unit) => { unit.shield += 64 + (leaderPower * 0.08); });
            });
            markLanePulse('all', 'good');
            markBattleNotice(text('Aegis Nova reinforced shields across the field.', 'Aegis Nova reinforced shields across the field.'), 'good');
            return;
        }
        lane.enemy.forEach((unit) => applyBattleDamage(unit, 88 + (leaderPower * 0.42)));
        lane.effects.push({ side: 'ally', attack: 0.12, speed: 0.22, remaining: 5.5 });
        markLanePulse(lane.id, 'warning');
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
                title: { zh: '鑴夊啿杩囪浇', en: 'Pulse Overload' },
                short: { zh: '鍏ㄨ矾鏀诲嚮 +18%', en: 'All lanes ATK +18%' },
                desc: { zh: 'Raises total output for the rest of the clash once your frontline is stable.', en: 'Raises total output for the rest of the clash once your frontline is stable.' }
            },
            shieldMesh: {
                id: 'shieldMesh',
                icon: '&#10022;',
                title: { zh: '鐩剧綉琛ュ己', en: 'Shield Mesh' },
                short: { zh: '鍏ㄨ矾琛ョ浘 + 鏍稿績鍥炵ǔ', en: 'Shield all lanes + core stabilize' },
                desc: { zh: 'Adds shields to all lanes and cores, ideal when the board is under pressure.', en: 'Adds shields to all lanes and cores, ideal when the board is under pressure.' }
            },
            energySurge: {
                id: 'energySurge',
                icon: '&#10039;',
                title: { zh: '鑳介噺娴秾', en: 'Energy Surge' },
                short: { zh: '鑳介噺鍥炲鍔犲揩', en: 'Faster energy regen' },
                desc: { zh: 'Refills energy now and speeds up deployment for the second half.', en: 'Refills energy now and speeds up deployment for the second half.' }
            },
            bountyScript: {
                id: 'bountyScript',
                icon: '&#9670;',
                title: { zh: '璧忛噾鑴氭湰', en: 'Bounty Script' },
                short: { zh: '缁撶畻鏀剁泭鎻愰珮', en: 'Higher rewards' },
                desc: { zh: 'Raises battle rewards and shortens tactic cooldowns for this run.', en: 'Raises battle rewards and shortens tactic cooldowns for this run.' }
            },
            jamField: {
                id: 'jamField',
                icon: '&#9638;',
                title: { zh: '骞叉壈鍔涘満', en: 'Jam Field' },
                short: { zh: '鏁屾柟杩涘満鏀剧紦', en: 'Enemy spawn slows down' },
                desc: { zh: 'Temporarily slows enemy pressure to give your lanes breathing room.', en: 'Temporarily slows enemy pressure to give your lanes breathing room.' }
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

    function getBattleHeadline(selectedCard) {
        const battle = state.battle;
        if (battle.result) {
            return battle.result.win
                ? text('This run is complete. Push the next chapter or return to Deck to strengthen your key cards.', 'This run is complete. Push the next chapter or return to Deck to strengthen your key cards.')
                : text('This run retreated. Strengthen the focused lane鈥檚 frontline or burst first.', 'This run retreated. Strengthen the focused lane鈥檚 frontline or burst first.');
        }
        if (selectedCard) {
            return text(`Selected ${localize(selectedCard.name)}. Tap a lane to deploy.`, `Selected ${localize(selectedCard.name)}. Tap a lane to deploy.`);
        }
        return text(`Focus is on ${getBattleLaneLabel(battle.focusLaneId)}. Pick a card, then deploy it.`, `Focus is on ${getBattleLaneLabel(battle.focusLaneId)}. Pick a card, then deploy it.`);
    }

    function renderBattleLaneHint(lane) {
        if (lane.enemy.some((unit) => unit.isBoss)) {
            return text('Boss is present. Reinforce your frontline and burst the mid lane.', 'Boss is present. Reinforce your frontline and burst the mid lane.');
        }
        const focusText = state.battle.focusLaneId === lane.id ? text('Focus', 'Focus') : text('Side', 'Side');
        return text(`${lane.friendly.length} ally / ${lane.enemy.length} enemy • ${focusText}`, `${lane.friendly.length} ally / ${lane.enemy.length} enemy • ${focusText}`);
    }

    function getBattleLaneLabel(laneId) {
        if (laneId === 'top') return text('Top', 'Top');
        if (laneId === 'bot') return text('Bot', 'Bot');
        return text('Mid', 'Mid');
    }

    function renderBattleLaneEffects(lane) {
        const tags = [];
        const allyBuffActive = lane.effects.some((effect) => effect.side === 'ally' && ((effect.attack || 0) > 0 || (effect.speed || 0) > 0));
        const enemyJammed = lane.effects.some((effect) => effect.side === 'enemy' && (effect.jam || 0) > 0);
        const shieldUp = lane.friendly.some((unit) => unit.shield > 0);
        const bossPresent = lane.enemy.some((unit) => unit.isBoss);

        if (bossPresent) tags.push({ label: text('Boss in lane', 'Boss in lane'), tone: 'warning' });
        if (allyBuffActive) tags.push({ label: text('Ally buff', 'Ally buff'), tone: 'good' });
        if (shieldUp) tags.push({ label: text('Shield up', 'Shield up'), tone: 'good' });
        if (enemyJammed) tags.push({ label: text('Enemy jammed', 'Enemy jammed'), tone: 'warning' });
        if (!tags.length) {
            tags.push({
                label: state.battle.focusLaneId === lane.id ? text('Focus lane', 'Focus lane') : text('Stand by', 'Stand by'),
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
        if (!battle) return text('Boss idle', 'Boss idle');
        if (!isBossStage(battle.chapter)) return text('No Boss', 'No Boss');
        if (battle.bossDefeated) return text('Boss down', 'Boss down');
        if (battle.lanes.some((lane) => lane.enemy.some((unit) => unit.isBoss))) {
            return text('Boss engaged', 'Boss engaged');
        }

        const bossMoment = Math.max(42, battle.maxTime - 16);
        const secondsLeft = Math.max(0, Math.ceil(bossMoment - battle.time));
        if (secondsLeft <= 6) {
            return text(`Boss incoming ${secondsLeft}s`, `Boss incoming ${secondsLeft}s`);
        }
        return text(`Boss pending ${secondsLeft}s`, `Boss pending ${secondsLeft}s`);
    }

    function getBattleUnitShortName(unit) {
        const raw = localize(unit.name);
        return state.lang === 'en' ? raw.split(' ').slice(0, 2).join(' ') : raw.slice(0, 3);
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

    function formatBattleTime(value) {
        const totalSeconds = Math.max(0, Math.round(Number(value) || 0));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    function markBattleNotice(message, tone = '') {
        if (!state.battle) return;
        state.battle.notice = {
            text: message,
            tone,
            until: state.battle.time + 2.6
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

    function queueBattleStageScroll() {
        if (state.tab !== 'clash') return;
        const scrollTarget = () => {
            const node = document.querySelector('.nc-battle-stage') || document.querySelector('.nc-battle-card--live');
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

    function getSelectedChapter() {
        return chapterMap[state.save.selectedChapterId] || config.chapters[0];
    }

    function getStartClashLabel(chapter) {
        resetFreeClashWindow();
        const freeLeft = getRemainingFreeClashes();
        if (freeLeft > 0) return text('Start Clash • Free', 'Start Clash • Free');
        const cost = getEntryCost(chapter);
        return `Start Clash • ${cost} Cr`;
    }

    function getDailyFreeClashesLimit() {
        return Math.max(0, Number(config.battle.freeClashesPerDay) || 0);
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
        const researchBonus = getTotalResearchLevels() * 14;
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
            return state.lang === 'en' ? `+${level * 2}% regen / +${maxEnergyBonus} max` : `鎭㈠ +${level * 2}% / 涓婇檺 +${maxEnergyBonus}`;
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
                : `${formatCompact(cost.credits)}Cr / ${cost.cipherChips}Ch`;
        }
        return state.lang === 'en'
            ? `${formatCompact(cost.credits)} credits / ${cost.cipherChips} chips`
            : `${formatCompact(cost.credits)} credits / ${cost.cipherChips} chips`;
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
            : `${cost.fragments} Fr / ${cost.tactCores} Co / ${cost.credits} Cr${cost.cipherChips ? ` / ${cost.cipherChips} Ch` : ''}`;
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
        if (typeof value === 'object') return value.en || value.zh || '';
        return String(value);
    }

    function text(zh, en) {
        return en || zh || '';
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
                sponsorPass: false
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
        next.lastResult = parsed?.lastResult && typeof parsed.lastResult === 'object' ? parsed.lastResult : null;
        return next;
    }
}());
