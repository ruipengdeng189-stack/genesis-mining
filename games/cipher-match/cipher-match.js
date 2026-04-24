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
                setLeader(value);
                break;
            case 'toggleModule':
                toggleModule(value);
                break;
            case 'setSkill':
                setSkill(value);
                break;
            case 'upgradeCard':
                upgradeCard(type, value);
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
        const gap = Math.max(0, chapter.recommended - power);
        const freeLeft = getRemainingFreeRuns();
        ui.heroSummary.innerHTML = `
            <div class="cm-summary-grid">
                ${renderSummaryItem('⌘', text('当前关卡', 'Stage'), `${chapter.id} · ${localize(chapter.name)}`)}
                ${renderSummaryItem('⚔', text('构筑战力', 'Power'), `${power} / ${chapter.recommended}`)}
                ${renderSummaryItem('△', text('缺口', 'Gap'), gap > 0 ? `-${formatCompact(gap)}` : text('已达标', 'Ready'))}
                ${renderSummaryItem('▷', text('免费次数', 'Free Runs'), `${freeLeft}/${config.board.freeRunsPerDay}`)}
            </div>
            <div class="cm-quick-row">
                <button class="cm-btn-soft" type="button" data-action="openTab" data-value="deck">${escapeHtml(text('去构筑', 'Open Deck'))}</button>
                <button class="cm-btn-soft" type="button" data-action="openTab" data-value="lab">${escapeHtml(text('去研究', 'Open Lab'))}</button>
                <button class="cm-btn-soft" type="button" data-action="openTab" data-value="shop">${escapeHtml(text('去补给', 'Open Shop'))}</button>
            </div>
        `;
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

    function renderRunTab() {
        const chapter = getSelectedChapter();
        const power = getDeckPower();
        const entryCost = getEntryCost(chapter);
        const run = state.run;
        const isCurrentRun = run?.active && run.chapterId === chapter.id;
        const isBoss = isBossChapter(chapter);
        const goals = isCurrentRun ? run.goals : chapter.goals.map((goal) => ({ ...goal, remaining: goal.amount }));
        const boardHtml = isCurrentRun ? renderLiveBoard(run) : renderPreviewBoard();
        const skill = skillMap[state.save.selectedSkill];
        const boardWrapClass = [
            'cm-board-wrap',
            isBoss ? 'is-boss' : '',
            isCurrentRun && run.energy >= run.maxEnergy ? 'is-skill-ready' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="cm-stack">
                <div class="cm-stage-strip">
                    ${config.chapters.map((item) => renderStageChip(item)).join('')}
                </div>

                ${!isCurrentRun ? renderRunGuide(chapter, power) : ''}

                <div class="cm-card cm-stage-card ${isBoss ? 'is-boss' : ''}">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('主舞台', 'Main Stage'))}</div>
                            <strong>${escapeHtml(`${chapter.id} · ${localize(chapter.name)}`)}</strong>
                            <div class="cm-copy">${escapeHtml(localize(chapter.pressure))} · ${escapeHtml(localize(chapter.rewardFocus))}</div>
                        </div>
                        <div class="cm-tag-row">
                            <span class="cm-tag">${escapeHtml(text('推荐', 'Recommended'))} ${chapter.recommended}</span>
                            <span class="cm-tag ${power >= chapter.recommended ? 'is-good' : ''}">${escapeHtml(text('当前', 'Current'))} ${power}</span>
                            ${isBoss ? `<span class="cm-tag is-danger-text">${escapeHtml(text('Boss 关', 'Boss'))}</span>` : ''}
                        </div>
                    </div>

                    <div class="cm-stage-grid">
                        <div class="cm-stack">
                            <div class="cm-battle-hud">
                                ${renderHudPill(text('步数', 'Moves'), isCurrentRun ? run.movesLeft : chapter.moves, text('交换一次才扣 1 步', 'Spend 1 move per valid swap'))}
                                ${renderHudPill(text('能量', 'Energy'), isCurrentRun ? `${run.energy}/${run.maxEnergy}` : `0/${getRunMaxEnergy()}`, escapeHtml(localize(skill.name)))}
                                ${renderHudPill(text('分数', 'Score'), isCurrentRun ? formatCompact(run.score) : '0', text('4 连与连锁更高', '4-match & cascades score more'))}
                                ${renderHudPill(text('门票', 'Entry'), getRemainingFreeRuns() > 0 ? text('免费', 'Free') : `${entryCost}`, getRemainingFreeRuns() > 0 ? `${getRemainingFreeRuns()}/${config.board.freeRunsPerDay}` : text('金币消耗', 'Credit cost'))}
                            </div>

                            <div class="${boardWrapClass}">
                                ${boardHtml}
                                ${isCurrentRun && run.feedback ? renderBattleFeedback(run.feedback) : ''}
                                ${isCurrentRun ? `
                                    <div class="cm-board-notice">
                                        <strong>${escapeHtml(text('战斗提示', 'Battle Hint'))}</strong>
                                        <span class="cm-note">${escapeHtml(run.notice || text('交换相邻两格，凑出 3 连。', 'Swap adjacent tiles to make a 3-match.'))}</span>
                                    </div>
                                ` : `
                                    <div class="cm-board-overlay">
                                        <strong>${escapeHtml(text('解码规则', 'How to Play'))}</strong>
                                        <span class="cm-note">${escapeHtml(text('点选两格相邻方块交换，凑出 3 连即可推进目标。', 'Swap two adjacent tiles. A 3-match advances your goals.'))}</span>
                                    </div>
                                `}
                            </div>

                            <div class="cm-control-row">
                                <button class="cm-btn-soft" type="button" data-action="useSkill" ${!isCurrentRun || run.failed ? 'disabled' : ''}>
                                    ${escapeHtml(text('释放技能', 'Cast Skill'))}
                                </button>
                                ${isCurrentRun ? `
                                    <button class="cm-btn" type="button" data-action="${run.failed ? 'buyMoves' : 'abandonRun'}">
                                        ${escapeHtml(run.failed ? text('+5 步继续', '+5 Moves') : text('结束本局', 'Retreat'))}
                                    </button>
                                ` : `
                                    <button class="cm-btn" type="button" data-action="startRun">${escapeHtml(text('开始解码', 'Start Run'))}</button>
                                `}
                            </div>
                        </div>

                        <div class="cm-board-side">
                            <div class="cm-mini-card">
                                <div class="cm-card-head">
                                    <div>
                                        <strong>${escapeHtml(text('当前目标', 'Current Goals'))}</strong>
                                        <div class="cm-copy">${escapeHtml(text('完成全部目标即通关。', 'Clear all goals to win.'))}</div>
                                    </div>
                                </div>
                                <div class="cm-goal-list">${goals.map((goal) => renderGoal(goal)).join('')}</div>
                            </div>

                            <div class="cm-mini-card">
                                <div class="cm-card-head">
                                    <div>
                                        <strong>${escapeHtml(text('本关收益', 'Stage Reward'))}</strong>
                                        <div class="cm-copy">${escapeHtml(text('研究与模块会加成胜利收益。', 'Research and modules improve victory rewards.'))}</div>
                                    </div>
                                </div>
                                <div class="cm-reward-row">${renderRewardChips(getScaledChapterReward(chapter))}</div>
                            </div>

                            <div class="cm-mini-card">
                                <div class="cm-card-head">
                                    <div>
                                        <strong>${escapeHtml(text('出战装配', 'Active Loadout'))}</strong>
                                        <div class="cm-copy">${escapeHtml(localize(skill.effect))}</div>
                                    </div>
                                </div>
                                <div class="cm-chip-row">
                                    <span class="cm-chip">${escapeHtml(localize(leaderMap[state.save.selectedLeader].name))}</span>
                                    ${state.save.selectedModules.map((id) => `<span class="cm-chip">${escapeHtml(localize(moduleMap[id].name))}</span>`).join('')}
                                    <span class="cm-chip">${escapeHtml(localize(skill.name))}</span>
                                </div>
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

        return `
            <div class="cm-stack">
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('队长', 'Leader'), localize(leader.name), localize(leader.role))}
                    ${renderWalletPill(text('模块', 'Modules'), `${state.save.selectedModules.length}/2`, text('最多上阵 2 个', 'Up to 2 equipped'))}
                    ${renderWalletPill(text('主动技', 'Skill'), localize(skill.name), localize(skill.role))}
                    ${renderWalletPill(text('总战力', 'Deck Power'), getDeckPower(), text('用于追赶推荐值', 'Used for stage checks'))}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('队长', 'Leader'))}</div>
                            <strong>${escapeHtml(text('选择 1 名主程式', 'Choose 1 leader'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('决定技能风格与核心战力。', 'Sets your skill style and core power.'))}</div>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.leaders.map((item) => renderCardItem('leader', item, item.id === state.save.selectedLeader)).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('模块', 'Modules'))}</div>
                            <strong>${escapeHtml(text('最多装配 2 个模块', 'Equip up to 2 modules'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('模块决定续航、收益与 Boss 压制。', 'Modules shape sustain, rewards, and boss pressure.'))}</div>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.modules.map((item) => renderCardItem('module', item, state.save.selectedModules.includes(item.id))).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('主动技', 'Skills'))}</div>
                            <strong>${escapeHtml(text('切换 1 个战斗主动技', 'Swap 1 active skill'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('充满能量后释放，直接影响闯关容错。', 'Cast at full energy to change your run tempo.'))}</div>
                        </div>
                    </div>
                    <div class="cm-card-grid">${config.skills.map((item) => renderCardItem('skill', item, item.id === state.save.selectedSkill)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderLabTab() {
        return `
            <div class="cm-stack">
                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('研究作用', 'Research Impact'))}</div>
                            <strong>${escapeHtml(text('研究会直接作用到闯关', 'Research directly affects runs'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('步数、技能、收益、战力都会被研究强化。', 'Moves, skills, rewards, and deck power all benefit from research.'))}</div>
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
        return `
            <div class="cm-stack">
                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('任务', 'Missions'))}</div>
                            <strong>${escapeHtml(text('可领奖励优先置顶', 'Claimable rewards first'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('完成闯关、升级与研究即可推进。', 'Runs, upgrades, and research all feed mission progress.'))}</div>
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
        return `
            <div class="cm-stack">
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('赛季经验', 'Season XP'), formatCompact(state.save.seasonXp), text('闯关 / 任务 / 商店', 'Runs / missions / shop'))}
                    ${renderWalletPill(text('赛季等级', 'Season Lv'), Math.floor(state.save.seasonXp / 120) + 1, text('每 120 经验约 1 级', 'Around 1 level per 120 XP'))}
                    ${renderWalletPill(text('高级轨道', 'Premium'), state.save.premiumSeason ? text('已解锁', 'Unlocked') : text('未解锁', 'Locked'), text('高级奖励更厚', 'Premium rewards are denser'))}
                    ${renderWalletPill(text('当前重点', 'Focus'), text('压缩展示', 'Compact view'), text('只看最近可领档位', 'Shows nearby milestones'))}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('免费轨道', 'Free Track'))}</div>
                            <strong>${escapeHtml(text('优先领取最近可拿的档位', 'Claim the closest rewards first'))}</strong>
                        </div>
                    </div>
                    <div class="cm-season-list">${freeTrack.map((item) => renderSeasonItem('free', item)).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('高级轨道', 'Premium Track'))}</div>
                            <strong>${escapeHtml(state.save.premiumSeason ? text('高级奖励已开启', 'Premium rewards unlocked') : text('解锁后可领取更多奖励', 'Unlock for extra rewards'))}</strong>
                            <div class="cm-copy">${escapeHtml(state.save.premiumSeason ? text('当前已可领取高级奖励。', 'Premium rewards are now claimable.') : text('可在商店中打开支付弹窗购买。', 'You can unlock it from the shop offer modal.'))}</div>
                        </div>
                        ${state.save.premiumSeason ? '' : `<button class="cm-btn-soft" type="button" data-action="previewOffer" data-value="seasonPass">${escapeHtml(text('解锁通行证', 'Unlock Pass'))}</button>`}
                    </div>
                    <div class="cm-season-list">${premiumTrack.map((item) => renderSeasonItem('premium', item)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderShopTab() {
        return `
            <div class="cm-stack">
                <div class="cm-wallet-row">
                    ${renderWalletPill(text('金币', 'Credits'), formatCompact(state.save.credits), text('升级 / 门票 / 商店', 'Upgrades / entry / shop'))}
                    ${renderWalletPill(text('密钥位', 'Key Bits'), formatCompact(state.save.keyBits), text('卡牌升级核心', 'Core card upgrade cost'))}
                    ${renderWalletPill(text('密码尘', 'Cipher Dust'), formatCompact(state.save.cipherDust), text('研究主材料', 'Main research material'))}
                    ${renderWalletPill(text('赛季经验', 'Season XP'), formatCompact(state.save.seasonXp), text('轨道进度', 'Track progress'))}
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('基础商店', 'Utility Shop'))}</div>
                            <strong>${escapeHtml(text('每日补给与追赶包', 'Daily supply and catch-up packs'))}</strong>
                        </div>
                    </div>
                    <div class="cm-shop-list">${config.shopItems.map((item) => renderShopItem(item)).join('')}</div>
                </div>

                <div class="cm-card">
                    <div class="cm-card-head">
                        <div>
                            <div class="eyebrow">${escapeHtml(text('充值礼包', 'Payment Offers'))}</div>
                            <strong>${escapeHtml(text('付费后直接缩短卡点', 'Pay to shorten progression walls'))}</strong>
                            <div class="cm-copy">${escapeHtml(text('弹窗支持上下滑动与金额复制。', 'The modal supports vertical scrolling and amount copy.'))}</div>
                        </div>
                    </div>
                    <div class="cm-offer-list">${config.paymentOffers.map((item) => renderOfferItem(item)).join('')}</div>
                </div>
            </div>
        `;
    }

    function renderLiveBoard(run) {
        return `
            <div class="cm-board">
                ${run.board.map((type, index) => {
                    const tile = tileMap[type];
                    const selected = run.selectedCell === index ? 'is-selected' : '';
                    return `
                        <button class="cm-cell cm-cell--${escapeHtml(type)} ${selected}" type="button" data-action="tapCell" data-value="${index}" aria-label="${escapeHtml(localize(tile.name))}">
                            ${escapeHtml(tile.icon)}
                        </button>
                    `;
                }).join('')}
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

    function renderRunGuide(chapter, power) {
        const gap = Math.max(0, chapter.recommended - power);
        return `
            <div class="cm-inline-grid cm-guide-grid">
                <div class="cm-mini-card cm-guide-card">
                    <div class="cm-titleline">
                        <span aria-hidden="true">①</span>
                        <strong>${escapeHtml(text('选两格', 'Pick Two'))}</strong>
                    </div>
                    <div class="cm-copy">${escapeHtml(text('先点 1 格，再点相邻 1 格。', 'Tap one tile, then an adjacent tile.'))}</div>
                </div>
                <div class="cm-mini-card cm-guide-card">
                    <div class="cm-titleline">
                        <span aria-hidden="true">②</span>
                        <strong>${escapeHtml(text('凑 3 连', 'Make a Match'))}</strong>
                    </div>
                    <div class="cm-copy">${escapeHtml(text('形成 3 连即可推进目标。', 'Any 3-match pushes the stage goals.'))}</div>
                </div>
                <div class="cm-mini-card cm-guide-card">
                    <div class="cm-titleline">
                        <span aria-hidden="true">③</span>
                        <strong>${escapeHtml(text('满能量放技', 'Cast at Full'))}</strong>
                    </div>
                    <div class="cm-copy">${escapeHtml(text('能量满 100 后可直接释放主动技。', 'Cast your active skill once energy reaches 100.'))}</div>
                </div>
                <div class="cm-mini-card cm-guide-card ${gap > 0 ? 'is-warning' : ''}">
                    <div class="cm-titleline">
                        <span aria-hidden="true">${gap > 0 ? '△' : '✓'}</span>
                        <strong>${escapeHtml(gap > 0 ? text('建议追战力', 'Power Gap') : text('可直接开打', 'Ready'))}</strong>
                    </div>
                    <div class="cm-copy">${escapeHtml(gap > 0 ? `${text('当前仍差', 'Still short by')} ${formatCompact(gap)}` : text('当前构筑已达到推荐线。', 'Your current deck meets the recommended line.'))}</div>
                </div>
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
        const cost = getCardCost(type, item.id);
        const canAfford = state.save.credits >= cost.credits && state.save.keyBits >= cost.keyBits;
        const power = getCardPower(type, item.id);
        const action = type === 'leader' ? 'setLeader' : type === 'module' ? 'toggleModule' : 'setSkill';
        const selectLabel = type === 'module'
            ? selected ? text('卸下', 'Unequip') : text('装配', 'Equip')
            : selected ? text('已上阵', 'Active') : text('设为当前', 'Set Active');

        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(localize(item.role))}</div>
                    </div>
                    <span class="cm-tag">${escapeHtml(text('Lv', 'Lv'))} ${level}</span>
                </div>
                <div class="cm-copy">${escapeHtml(localize(item.effect || item.skill))}</div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('战力', 'Power'))} +${power}</span>
                    <span class="cm-chip">${escapeHtml(text('升级', 'Upgrade'))} ${formatCompact(cost.credits)} / ${formatCompact(cost.keyBits)}</span>
                </div>
                <div class="cm-control-row">
                    <button class="cm-btn-soft" type="button" data-action="${action}" data-value="${item.id}">${escapeHtml(selectLabel)}</button>
                    <button class="cm-btn" type="button" data-action="upgradeCard" data-type="${type}" data-value="${item.id}" ${canAfford ? '' : 'disabled'}>${escapeHtml(text('升级', 'Upgrade'))}</button>
                </div>
            </div>
        `;
    }

    function renderResearchItem(item) {
        const level = getResearchLevel(item.id);
        const maxed = level >= item.maxLevel;
        const cost = getResearchCost(item.id);
        const canAfford = !maxed && state.save.credits >= cost.credits && state.save.cipherDust >= cost.cipherDust;
        return `
            <div class="cm-mini-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(item.icon)} ${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(localize(item.effect))}</div>
                    </div>
                    <span class="cm-tag">${escapeHtml(text('Lv', 'Lv'))} ${level}/${item.maxLevel}</span>
                </div>
                <div class="cm-copy">${escapeHtml(localize(item.desc))}</div>
                <div class="cm-chip-row">
                    <span class="cm-chip">${escapeHtml(text('花费', 'Cost'))} ${formatCompact(cost.credits)} / ${formatCompact(cost.cipherDust)}</span>
                </div>
                <button class="cm-btn" type="button" data-action="upgradeResearch" data-value="${item.id}" ${canAfford ? '' : 'disabled'}>
                    ${escapeHtml(maxed ? text('已满级', 'Maxed') : text('研究升级', 'Upgrade'))}
                </button>
            </div>
        `;
    }

    function renderMissionItem(mission) {
        const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100));
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
                <button class="cm-btn ${mission.canClaim ? '' : 'cm-btn-soft'}" type="button" data-action="claimMission" data-value="${mission.id}" ${mission.canClaim ? '' : 'disabled'}>
                    ${escapeHtml(buttonLabel)}
                </button>
            </div>
        `;
    }

    function renderSeasonItem(trackType, item) {
        const claimed = state.save.seasonClaims[trackType].includes(item.id);
        const unlocked = state.save.seasonXp >= item.xp;
        const action = trackType === 'free' ? 'claimSeason' : 'claimPremiumSeason';
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
                <button class="cm-btn ${claimed ? 'cm-btn-soft' : ''}" type="button" data-action="${action}" data-value="${item.id}" ${claimed || !unlocked ? 'disabled' : ''}>
                    ${escapeHtml(claimed ? text('已领取', 'Claimed') : text('领取奖励', 'Claim Reward'))}
                </button>
            </div>
        `;
    }

    function renderShopItem(item) {
        const claimed = item.daily && isDailyShopClaimed();
        const canAfford = item.price === 0 || state.save.credits >= item.price;
        const action = item.daily ? 'claimDailySupply' : 'buyShopItem';
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
                <button class="cm-btn" type="button" data-action="${action}" data-value="${item.id}" ${claimed || !canAfford ? 'disabled' : ''}>
                    ${escapeHtml(item.daily ? (claimed ? text('已领取', 'Claimed') : text('免费领取', 'Claim Free')) : text('购买', 'Buy'))}
                </button>
            </div>
        `;
    }

    function renderOfferItem(item) {
        return `
            <div class="cm-offer-card">
                <div class="cm-card-head">
                    <div>
                        <strong>${escapeHtml(localize(item.name))}</strong>
                        <div class="cm-copy">${escapeHtml(text('充值后立即到账', 'Delivered right after payment'))}</div>
                    </div>
                    <span class="cm-tag">USDT ${item.price}</span>
                </div>
                <div class="cm-reward-row">${renderRewardChips(item.reward)}</div>
                <button class="cm-btn" type="button" data-action="previewOffer" data-value="${item.id}">${escapeHtml(text('打开支付弹窗', 'Open Payment'))}</button>
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
        const freeLeft = getRemainingFreeRuns();
        if (freeLeft <= 0) {
            const cost = getEntryCost(chapter);
            if (state.save.credits < cost) {
                showToast(text('金币不足，先去商店补给。', 'Not enough credits. Visit the shop first.'), 'warn');
                return;
            }
            state.save.credits -= cost;
        } else {
            state.save.freeRunsUsed += 1;
        }

        state.run = {
            active: true,
            chapterId: chapter.id,
            board: createFreshBoard(),
            selectedCell: null,
            movesLeft: getRunStartMoves(chapter),
            energy: 0,
            maxEnergy: getRunMaxEnergy(),
            score: 0,
            goals: chapter.goals.map((goal) => ({ ...goal, remaining: goal.amount })),
            notice: text('先点 1 格，再点相邻 1 格完成交换。', 'Tap one tile, then an adjacent tile to swap.'),
            continuesBought: 0,
            settled: false,
            failed: false,
            feedback: buildRunStartFeedback(chapter),
            bestCascade: 0
        };

        saveProgress();
        renderAll();
        showToast(text('解码开始。', 'Run started.'), 'good');
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
            run.notice = text('请交换相邻方块。', 'Choose an adjacent tile to swap.');
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

        if (run.movesLeft <= 0) {
            openRunFailModal();
            return;
        }

        run.notice = result.cascades > 1
            ? text('已触发连锁，继续冲技能。', 'Cascade triggered. Keep charging your skill.')
            : text('有效交换成功，继续压低目标。', 'Successful swap. Keep pushing your goals.');
        saveProgress();
        renderAll();
    }

    function applyBoardResult(result) {
        const run = state.run;
        if (!run) return;
        const summary = {
            shieldDamage: 0,
            progressDamage: 0
        };

        const energyFromModules = hasModule('prismTap') ? 10 : 0;
        const scoreBonus = hasModule('burstIndex') && result.biggestGroup >= 4 ? 120 : 0;
        run.score += result.totalCleared * 18 + result.cascades * 36 + scoreBonus;
        run.energy = Math.min(run.maxEnergy, run.energy + result.totalCleared * 7 + (result.cascades - 1) * 18 + energyFromModules);

        run.goals.forEach((goal) => {
            if (goal.type === 'shield') {
                const before = goal.remaining;
                goal.remaining = Math.max(0, goal.remaining - Math.max(1, Math.floor(result.totalCleared / 4)));
                if (hasModule('traceMine')) {
                    goal.remaining = Math.max(0, goal.remaining - 1);
                }
                summary.shieldDamage += Math.max(0, before - goal.remaining);
                return;
            }
            const before = goal.remaining;
            goal.remaining = Math.max(0, goal.remaining - (result.byType[goal.type] || 0));
            summary.progressDamage += Math.max(0, before - goal.remaining);
        });

        state.save.stats.matchedTiles += result.totalCleared;
        return summary;
    }

    function useSkill() {
        const run = state.run;
        if (!run?.active || run.failed) return;
        const skill = skillMap[state.save.selectedSkill];
        if (run.energy < skill.energyCost) {
            showToast(text('能量未充满。', 'Not enough energy.'), 'warn');
            return;
        }

        const boostRate = 1 + getResearchLevel('signalAmp') * 0.04;
        const skillValue = Math.round(6 * boostRate);

        if (skill.id === 'gridBurst') {
            reduceLargestGoal(skillValue);
        } else if (skill.id === 'colorHack') {
            reduceLargestColorGoal(Math.round(8 * boostRate));
        } else if (skill.id === 'stasisField') {
            run.movesLeft += 3;
            reduceSmallestGoal(Math.round(3 * boostRate));
        }

        if (leaderMap[state.save.selectedLeader].id === 'novaEcho') {
            const shieldGoal = run.goals.find((goal) => goal.type === 'shield' && goal.remaining > 0);
            if (shieldGoal) shieldGoal.remaining = Math.max(0, shieldGoal.remaining - 4);
        }

        if (leaderMap[state.save.selectedLeader].id === 'wardenNine') {
            run.movesLeft += 1;
        }

        run.energy = leaderMap[state.save.selectedLeader].id === 'wardenNine' ? 35 : 0;
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
        run.failed = true;
        run.feedback = makeFeedback('danger', text('步数耗尽', 'Out of Moves'), text('可补 5 步继续，或直接退出调整构筑。', 'Buy 5 more moves or retreat to adjust your deck.'));
        run.notice = text('步数耗尽，可继续购买步数或结束本局。', 'Out of moves. Buy more or retreat.');
        openModal({
            eyebrow: text('本局失败', 'Run Failed'),
            title: text('步数耗尽', 'Out of Moves'),
            subtitle: text('可以直接补 5 步继续，也可以退出回去调整构筑。', 'You can buy +5 moves or retreat to adjust your deck.'),
            body: `
                <div class="cm-card">
                    <div class="cm-copy">${escapeHtml(text('继续价格会递增，单局最多购买 2 次。', 'Continue price increases each time, max 2 purchases per run.'))}</div>
                    <div class="cm-reward-row">
                        <span class="cm-chip">${escapeHtml(text('当前价格', 'Current Cost'))} ${formatCompact(getContinueCost())}</span>
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
            goals: state.run.goals.map((goal) => ({ ...goal }))
        };
        const chapter = chapterMap[state.run.chapterId];
        if (!state.run.settled) {
            state.save.stats.runs += 1;
            if (win) state.save.stats.wins += 1;
            state.run.settled = true;
        }

        if (win) {
            const reward = getScaledChapterReward(chapter);
            applyReward(reward);
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
                            ${renderWalletPill(text('得分', 'Score'), formatCompact(runSnapshot.score), text('本局累计分数', 'Total score this run'))}
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
        openModal({
            eyebrow: text('支付弹窗', 'Payment'),
            title: localize(offer.name),
            subtitle: `${PAYMENT_NETWORK} · USDT ${offer.price}`,
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

                <div class="cm-input-wrap">
                    <strong>${escapeHtml(text('收款地址', 'Wallet Address'))}</strong>
                    <input value="${escapeHtml(PAYMENT_WALLET)}" readonly>
                    <small>${escapeHtml(text('请按上方地址转入对应 USDT 金额。', 'Send the exact USDT amount to the address above.'))}</small>
                </div>

                <div class="cm-input-wrap">
                    <strong>${escapeHtml(text('转账金额', 'Amount'))}</strong>
                    <input value="USDT ${offer.price}" readonly>
                    <small>${escapeHtml(text('复制金额可避免支付时输错。', 'Copying the amount helps avoid mistakes.'))}</small>
                </div>

                <div class="cm-input-wrap">
                    <strong>${escapeHtml(text('交易哈希', 'Transaction Hash'))}</strong>
                    <input id="offerTxidInput" placeholder="${escapeHtml(text('请输入 64 位 TxID', 'Enter the 64-character TxID'))}" value="${order ? escapeHtml(order.txid || '') : ''}">
                    <small>${escapeHtml(text('这里做前端闭环演示：填入合法 TxID 即视为验证通过。', 'Frontend loop demo: a valid TxID format is treated as verified.'))}</small>
                </div>
            `,
            actions: `
                <button class="cm-btn-soft" type="button" data-action="copyOfferAddress">${escapeHtml(text('复制地址', 'Copy Address'))}</button>
                <button class="cm-btn-soft" type="button" data-action="copyOfferAmount" data-value="USDT ${offer.price}">${escapeHtml(text('复制金额', 'Copy Amount'))}</button>
                <button class="cm-btn-soft" type="button" data-action="cancelOfferOrder" data-value="${offer.id}">${escapeHtml(text('关闭订单', 'Cancel Order'))}</button>
                <button class="cm-btn" type="button" data-action="${order ? 'verifyOfferTxid' : 'createOfferOrder'}" data-value="${offer.id}">${escapeHtml(order ? text('验证支付', 'Verify Payment') : text('创建订单', 'Create Order'))}</button>
            `
        });
        renderAll();
    }

    function createOfferOrder(offerId) {
        const offer = offerMap[offerId];
        if (!offer) return;
        const existing = getPendingOrder(offerId);
        if (!existing) {
            state.save.pendingOrders.push({
                offerId,
                createdAt: Date.now(),
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
            showToast(text('TxID 格式不正确。', 'Invalid TxID format.'), 'warn');
            return;
        }
        order.txid = txid;
        applyReward(offer.reward);
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

    function renderHudPill(label, value, meta) {
        return `
            <div class="cm-hud-pill">
                <strong>${escapeHtml(label)}</strong>
                <span class="cm-value">${escapeHtml(String(value))}</span>
                <small>${escapeHtml(meta)}</small>
            </div>
        `;
    }

    function renderWalletPill(label, value, meta) {
        return `
            <div class="cm-wallet-pill">
                <strong>${escapeHtml(label)}</strong>
                <span class="cm-value">${escapeHtml(String(value))}</span>
                <small>${escapeHtml(meta)}</small>
            </div>
        `;
    }

    function renderRewardChips(reward) {
        return Object.entries(reward).map(([key, value]) => {
            if (!value) return '';
            return `<span class="cm-chip">${escapeHtml(getRewardLabel(key, value))}</span>`;
        }).join('');
    }

    function buildRunStartFeedback(chapter) {
        if (isBossChapter(chapter)) {
            return makeFeedback(
                'danger',
                text('Boss 到场', 'Boss Arrived'),
                text('优先压低护盾，再处理颜色目标。', 'Break the shield first, then finish the color goals.')
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
            case 'premiumSeason': return text('高级赛季已解锁', 'Premium track unlocked');
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
        const multiplier = 1 + getResearchLevel('stabilityMesh') * 0.03;
        return Math.round((leaderPower + skillPower + modulePower) * multiplier);
    }

    function getCardPower(type, cardId) {
        const level = getCardLevel(cardId);
        const source = type === 'leader' ? leaderMap[cardId] : type === 'module' ? moduleMap[cardId] : skillMap[cardId];
        if (!source) return 0;
        const step = type === 'leader' ? 22 : type === 'module' ? 12 : 16;
        return source.basePower + (level - 1) * step;
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
        return {
            credits: Math.round(item.baseCredits * Math.pow(1.32, level)),
            cipherDust: Math.round(item.baseDust * Math.pow(1.24, level))
        };
    }

    function getScaledChapterReward(chapter) {
        const rewardRate = 1 + getResearchLevel('lootRelay') * 0.05 + (hasModule('relayCache') ? 0.08 : 0);
        return {
            credits: Math.round(chapter.reward.credits * rewardRate),
            keyBits: Math.round(chapter.reward.keyBits * rewardRate),
            cipherDust: chapter.reward.cipherDust,
            seasonXp: chapter.reward.seasonXp
        };
    }

    function applyReward(reward) {
        state.save.credits += reward.credits || 0;
        state.save.keyBits += reward.keyBits || 0;
        state.save.cipherDust += reward.cipherDust || 0;
        state.save.seasonXp += reward.seasonXp || 0;
        if (reward.premiumSeason) state.save.premiumSeason = true;
    }

    function getContinueCost() {
        if (!state.run) return 0;
        const chapter = chapterMap[state.run.chapterId];
        return config.board.buyMovesBase * Math.pow(2, state.run.continuesBought) * Math.max(1, chapter.chapter);
    }

    function getEntryCost(chapter) {
        return config.board.entryCostByChapter[chapter.chapter] || 0;
    }

    function getRunStartMoves(chapter) {
        return chapter.moves + Math.floor(getResearchLevel('decodeCache') / 3) + (hasModule('hardPatch') ? 1 : 0);
    }

    function getRunMaxEnergy() {
        return 100 + getResearchLevel('pulseBattery') * 6;
    }

    function reduceLargestGoal(amount) {
        const goal = [...state.run.goals].sort((left, right) => right.remaining - left.remaining)[0];
        if (goal) goal.remaining = Math.max(0, goal.remaining - amount);
    }

    function reduceLargestColorGoal(amount) {
        const candidates = state.run.goals.filter((goal) => goal.type !== 'shield' && goal.remaining > 0);
        const target = candidates.sort((left, right) => right.remaining - left.remaining)[0];
        if (target) target.remaining = Math.max(0, target.remaining - amount);
    }

    function reduceSmallestGoal(amount) {
        const goal = [...state.run.goals].filter((entry) => entry.remaining > 0).sort((left, right) => left.remaining - right.remaining)[0];
        if (goal) goal.remaining = Math.max(0, goal.remaining - amount);
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

    function getPendingOrder(offerId) {
        return state.save.pendingOrders.find((item) => item.offerId === offerId && (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS) || null;
    }

    function isDailyShopClaimed() {
        return state.save.dailyShopStamp === getTodayStamp();
    }

    function getRemainingFreeRuns() {
        return Math.max(0, config.board.freeRunsPerDay - state.save.freeRunsUsed);
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
            const save = {
                ...base,
                ...raw,
                cardLevels: { ...base.cardLevels, ...(raw.cardLevels || {}) },
                researchLevels: { ...base.researchLevels, ...(raw.researchLevels || {}) },
                stats: { ...base.stats, ...(raw.stats || {}) },
                seasonClaims: {
                    free: Array.isArray(raw.seasonClaims?.free) ? raw.seasonClaims.free : [],
                    premium: Array.isArray(raw.seasonClaims?.premium) ? raw.seasonClaims.premium : []
                },
                claimedMissions: Array.isArray(raw.claimedMissions) ? raw.claimedMissions : [],
                clearedChapters: Array.isArray(raw.clearedChapters) ? raw.clearedChapters : [],
                selectedModules: Array.isArray(raw.selectedModules) ? raw.selectedModules.filter((id) => moduleMap[id]).slice(0, 2) : base.selectedModules,
                pendingOrders: Array.isArray(raw.pendingOrders) ? raw.pendingOrders : []
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
            clearedChapters: [],
            pendingOrders: [],
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
        if (state.save.freeRunsStamp !== today) {
            state.save.freeRunsStamp = today;
            state.save.freeRunsUsed = 0;
        }
        state.save.pendingOrders = state.save.pendingOrders.filter((item) => (Date.now() - item.createdAt) < PAYMENT_ORDER_EXPIRY_MS);
    }

    function saveProgress() {
        try {
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
                return;
            }
        } catch (error) {}
        showToast(successText, 'good');
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
