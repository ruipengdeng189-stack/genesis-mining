(function () {
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const SAVE_KEY = 'genesis_gem_forge_save_v1';
    const DAILY_SUPPLY_COOLDOWN_MS = 20 * 60 * 60 * 1000;
    const SLOT_ORDER = ['main', 'echo', 'resonance'];
    const SMELT_HEAT_COST = 4;
    const POWER_PER_GEM_SCORE = 0.3;
    const POWER_PER_AWAKEN_SCORE = 0.95;

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
        toastTimer: 0
    };

    const ui = {};

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheUi();
        bindEvents();
        syncHeat();
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
            const target = event.target.closest('[data-tab]');
            if (!target) return;
            state.tab = tabMap[target.dataset.tab] ? target.dataset.tab : 'forge';
            renderAll();
        });

        ui.panelContent.addEventListener('click', onPanelAction);
        window.addEventListener('beforeunload', saveProgress);
    }

    function onPanelAction(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        const value = target.dataset.value || '';

        switch (action) {
            case 'smeltOne': smeltOne(); break;
            case 'smeltBatch': smeltBatch(); break;
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
            case 'buyOffer': buyPaymentOffer(value); break;
            case 'claimMilestone': claimPaymentMilestone(value); break;
            case 'openTab':
                state.tab = tabMap[value] ? value : state.tab;
                renderAll();
                break;
            default:
                break;
        }
    }

    function renderAll() {
        syncHeat();
        applyLangState();
        renderResourceStrip();
        renderHeroSummary();
        renderActiveTab();
        renderTabBar();
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
        const powerGap = Math.max(0, contract.recommended - power.total);
        const sponsorTier = getSponsorTier();
        const heatMax = getHeatMax();

        ui.heroSummary.innerHTML = `
            ${renderPanelHead(
                text('当前推进', 'Current Route'),
                powerGap > 0
                    ? text(`离 ${contract.id} 推荐线还差 ${formatCompact(powerGap)} 战力，优先补符印等级、熔尘与高阶宝石。`, `You are ${formatCompact(powerGap)} power short of ${contract.id}. Raise sigils, dust income, and higher-tier gems first.`)
                    : text(`${contract.id} 已达推荐线，可以继续推进合同并回收聚焦碎片。`, `${contract.id} is on pace. Push contracts now and recycle focus shards.`),
                `<div class="gf-chip is-strong">${text('当前合同', 'Contract')} · ${contract.id}</div>`
            )}
            <div class="gf-kpi-grid">
                <div class="gf-kpi-card"><span>${text('当前战力', 'Power')}</span><strong>${formatCompact(power.total)}</strong></div>
                <div class="gf-kpi-card"><span>${text('热量', 'Heat')}</span><strong>${formatCompact(Math.floor(state.save.heat))}/${formatCompact(heatMax)}</strong></div>
                <div class="gf-kpi-card"><span>${text('赞助档位', 'Sponsor')}</span><strong>${localize(sponsorTier.title)}</strong></div>
                <div class="gf-kpi-card"><span>${text('最高合同', 'Best')}</span><strong>${config.contracts[state.save.bestContractIndex].id}</strong></div>
            </div>
            <div class="gf-chip-row" style="margin-top:12px;">
                <span class="gf-chip is-success">${text('热量恢复', 'Heat Regen')} · ${formatCompact(getHeatRegenPerSecond())}/s</span>
                <span class="gf-chip">${text('稀有率强化', 'Rare Rate')} · +${formatPercent(getRareBonus())}</span>
                <span class="gf-chip">${text('熔尘回收', 'Dust Yield')} · +${formatPercent(getDustBonus())}</span>
                <span class="gf-chip">${text('催化提炼', 'Catalyst Yield')} · +${formatPercent(getCatalystBonus())}</span>
            </div>
            <div class="gf-result-box" style="margin-top:12px;">
                <strong>${text('下一步建议', 'Next Step')}</strong>
                <p>${getNextProgressSuggestion()}</p>
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

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('工坊研究', 'Workshop'),
                text('工坊不做复杂科技树，只保留 5 条能直接看懂的永久成长线。升级结果会立刻写进熔炉、合同和产出公式。', 'The workshop avoids a complex tech tree and keeps only 5 permanent growth lines. Upgrades apply immediately to forge, contracts, and economy formulas.'),
                `<div class="gf-chip">${text('总研究次数', 'Research Count')} · ${formatCompact(state.save.stats.workshopUps)}</div>`
            )}
            <div class="gf-list">
                ${sortedWorkshop.map((item) => {
                    const level = getWorkshopLevel(item.id);
                    const cost = getWorkshopUpgradeCost(item.id);
                    const currentEffect = getWorkshopEffect(item.id);
                    const nextEffect = getWorkshopEffect(item.id, level + 1);
                    const maxed = level >= item.maxLevel;
                    return `
                        <article class="gf-list-card">
                            <div class="gf-row-head">
                                <div>
                                    <div class="eyebrow">${text('永久线', 'Permanent Line')}</div>
                                    <div class="gf-card-title">${localize(item.name)} · Lv.${level}</div>
                                </div>
                                <div class="gf-card-number">${maxed ? text('封顶', 'Maxed') : `Lv.${level + 1}`}</div>
                            </div>
                            <div class="gf-card-copy">${getWorkshopRelationCopy(item.id, currentEffect, nextEffect)}</div>
                            ${renderKpiGrid([
                                { label: text('当前效果', 'Current'), value: formatWorkshopEffect(item.id, currentEffect) },
                                { label: text('下级效果', 'Next'), value: maxed ? text('封顶', 'Maxed') : formatWorkshopEffect(item.id, nextEffect) },
                                { label: text('金币消耗', 'Gold Cost'), value: maxed ? '-' : formatCompact(cost.gold) },
                                { label: text('熔尘消耗', 'Dust Cost'), value: maxed ? '-' : formatCompact(cost.dust) }
                            ])}
                            <div class="gf-action-row" style="margin-top:12px;">
                                <button class="primary-btn" type="button" data-action="upgradeWorkshop" data-value="${item.id}" ${(canUpgradeWorkshop(item.id) && !maxed) ? '' : 'disabled'}>${maxed ? text('已封顶', 'Maxed') : text('立即升级', 'Upgrade')}</button>
                            </div>
                        </article>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderMissionsTab() {
        const missionViews = config.missions.map(getMissionView).sort((a, b) => b.sort - a.sort);
        const claimable = missionViews.filter((item) => item.claimable);
        const pending = missionViews.filter((item) => !item.claimed && !item.claimable);
        const visible = [...claimable, ...pending.slice(0, Math.max(4, 6 - claimable.length))];
        const bundleReward = mergeRewards(...claimable.map((item) => item.reward));

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('任务中心', 'Missions'),
                text('这里只保留能领的和离完成最近的目标，避免长列表阅读疲劳。', 'This tab keeps only claimables and nearest goals to avoid long-list fatigue.'),
                `<div class="gf-chip">${text('可领取', 'Ready')} · ${claimable.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('一键回收', 'Batch Claim')}</div>
                            <div class="gf-card-title">${claimable.length > 0 ? text(`${claimable.length} 个奖励待领`, `${claimable.length} rewards ready`) : text('当前暂无可领奖励', 'No mission rewards ready')}</div>
                        </div>
                        <div class="gf-card-number">${claimable.length}</div>
                    </div>
                    <div class="gf-card-copy">${claimable.length > 0 ? text('先统一回收，再继续推进离完成最近的一条。', 'Sweep rewards first, then return to the nearest unfinished objective.') : text('还没有成熟奖励，就盯最近的 1 到 2 个目标即可。', 'Nothing is ready yet, so just focus on the nearest one or two goals.')}</div>
                    ${claimable.length > 0 ? `<div class="gf-chip-row" style="margin-top:12px;">${renderRewardChips(bundleReward, { limit: 4 })}</div>` : ''}
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="claimAllMissions" ${claimable.length > 0 ? '' : 'disabled'}>${text('一键领取', 'Claim All')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('最近目标', 'Nearest Goal')}</div>
                            <div class="gf-card-title">${visible[0] ? visible[0].title : text('当前任务已清空', 'Mission board clear')}</div>
                        </div>
                        <div class="gf-card-number">${visible[0] ? `${Math.round(visible[0].progressRate * 100)}%` : '100%'}</div>
                    </div>
                    <div class="gf-card-copy">${visible[0] ? visible[0].desc : text('继续熔炼、合成和推进合同，新的任务会自然解锁。', 'Keep forging, fusing, and pushing contracts to unlock more missions naturally.')}</div>
                </article>
            </div>
            <div class="gf-list">
                ${visible.length ? visible.map((mission) => `
                    <article class="gf-list-card ${mission.claimable ? 'gf-node-card is-ready' : ''}">
                        <div class="gf-row-head">
                            <div>
                                <div class="eyebrow">${text('任务', 'Mission')}</div>
                                <div class="gf-card-title">${mission.title}</div>
                            </div>
                            <div class="gf-card-number">${mission.progress}/${mission.target}</div>
                        </div>
                        <div class="gf-card-copy">${mission.desc}</div>
                        <div class="gf-progress"><i style="width:${(mission.progressRate * 100).toFixed(2)}%;"></i></div>
                        <div class="gf-chip-row" style="margin-top:10px;">
                            ${renderRewardChips(mission.reward, { limit: 4 })}
                        </div>
                        <div class="gf-action-row" style="margin-top:12px;">
                            <button class="primary-btn" type="button" data-action="claimMission" data-value="${mission.id}" ${mission.claimable ? '' : 'disabled'}>${mission.claimed ? text('已领取', 'Claimed') : text('领取奖励', 'Claim Reward')}</button>
                        </div>
                    </article>
                `).join('') : `<div class="gf-empty">${text('当前没有可显示的任务。', 'No visible missions right now.')}</div>`}
            </div>
        `;
    }

    function renderSeasonTab() {
        const seasonNodes = config.seasonNodes.map((node) => getSeasonNodeView(node, false)).sort(compareNodeState);
        const sponsorNodes = config.sponsorSeasonNodes.map((node) => getSeasonNodeView(node, true)).sort(compareNodeState);
        const claimableSeason = seasonNodes.filter((node) => node.claimable);
        const claimableSponsor = sponsorNodes.filter((node) => node.claimable);
        const sponsorTier = getSponsorTier();

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('赛季轨道', 'Season Track'),
                text('免费轨承担基础回流，赞助轨负责把充值后的提速感拉得更直观。', 'The free track handles baseline returns, while the sponsor track makes top-up acceleration feel much more obvious.'),
                `<div class="gf-chip">${text('赞助档位', 'Sponsor')} · ${localize(sponsorTier.title)}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('免费轨', 'Free Track')}</div>
                            <div class="gf-card-title">${text(`${claimableSeason.length} 个节点待领`, `${claimableSeason.length} nodes ready`)}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(state.save.seasonXp)}</div>
                    </div>
                    <div class="gf-card-copy">${text('赛季经验主要来自熔炼、合成、合同突破与觉醒。', 'Season XP mainly comes from smelting, fusion, contract clears, and awakening.')}</div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="claimAllSeason" ${claimableSeason.length + claimableSponsor.length > 0 ? '' : 'disabled'}>${text('领取全部可领奖励', 'Claim All Ready')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助轨', 'Sponsor Track')}</div>
                            <div class="gf-card-title">${state.save.payment.passUnlocked ? text(`${claimableSponsor.length} 个赞助节点待领`, `${claimableSponsor.length} sponsor nodes ready`) : text('首充后开启', 'Unlocks after first top-up')}</div>
                        </div>
                        <div class="gf-card-number">${localize(sponsorTier.title)}</div>
                    </div>
                    <div class="gf-card-copy">${state.save.payment.passUnlocked
                        ? text('赞助轨的奖励更偏中后期卡点：熔尘、催化剂和大包金币会更集中。', 'Sponsor rewards focus more heavily on mid-late walls: dust, catalyst, and larger gold injections.')
                        : text('任意一笔赞助到账后，会同步打开赞助轨和额外常驻增益。', 'Any sponsor purchase opens both the sponsor track and extra permanent boosts.')}</div>
                </article>
            </div>
            <div class="gf-node-grid">
                ${seasonNodes.slice(0, 8).map((node) => renderSeasonNode(node)).join('')}
            </div>
            <div class="gf-divider"></div>
            <div class="gf-node-grid">
                ${sponsorNodes.slice(0, 5).map((node) => renderSeasonNode(node, true)).join('')}
            </div>
        `;
    }

    function renderShopTab() {
        const sponsorTier = getSponsorTier();
        const milestoneViews = config.paymentMilestones.map((milestone) => getMilestoneView(milestone));
        const claimableMilestones = milestoneViews.filter((item) => item.claimable);
        const readyShopItems = config.shopItems.filter((item) => isShopItemReady(item.id));

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('补给商店', 'Shop'),
                text('商店只保留每日免费、金币箱、熔尘箱和赞助礼包四类入口，减少理解成本。', 'The shop keeps only four entry types: daily free, gold crate, dust crate, and sponsor offers.'),
                `<div class="gf-chip">${text('可回收入口', 'Ready Sources')} · ${readyShopItems.length + claimableMilestones.length}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card gf-shop-card is-highlight">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('每日免费', 'Daily Free')}</div>
                            <div class="gf-card-title">${text('每日引火箱', 'Daily Spark Box')}</div>
                        </div>
                        <div class="gf-card-number">${isDailySupplyReady() ? text('免费', 'Free') : text('冷却中', 'Cooldown')}</div>
                    </div>
                    <div class="gf-card-copy">${text('20 小时一轮，给一点基础金币、熔尘和催化剂，保证回流不断。', 'One cycle every 20 hours with a small amount of gold, dust, and catalyst so the baseline loop never fully stops.')}</div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${renderRewardChips(config.shopItems.find((item) => item.id === 'dailySupply').reward, { limit: 4 })}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="claimDailySupply" ${isDailySupplyReady() ? '' : 'disabled'}>${text('免费领取', 'Claim Free')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('赞助档位', 'Sponsor Tier')}</div>
                            <div class="gf-card-title">${localize(sponsorTier.title)}</div>
                        </div>
                        <div class="gf-card-number">$${Number(state.save.payment.totalSpent || 0).toFixed(2)}</div>
                    </div>
                    <div class="gf-card-copy">${text('赞助会同时提高热量上限、稀有率、熔尘回收和催化剂效率，并打开赛季赞助轨。', 'Sponsor purchases boost heat cap, rare rate, dust return, and catalyst efficiency while also opening the sponsor season track.')}</div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        <span class="gf-chip">${text('热量上限', 'Heat Cap')} +${formatCompact(sponsorTier.heatCapBonus)}</span>
                        <span class="gf-chip">${text('稀有率', 'Rare Rate')} +${formatPercent(sponsorTier.rareRateBonus)}</span>
                        <span class="gf-chip">${text('熔尘回收', 'Dust')} +${formatPercent(sponsorTier.dustYieldBonus)}</span>
                        <span class="gf-chip">${text('催化效率', 'Catalyst')} +${formatPercent(sponsorTier.catalystYieldBonus)}</span>
                    </div>
                </article>
            </div>
            <div class="gf-list">
                ${config.shopItems.map(renderShopItemRow).join('')}
            </div>
            <div class="gf-divider"></div>
            <div class="gf-offer-grid">
                ${config.paymentOffers.map(renderPaymentOffer).join('')}
            </div>
            <div class="gf-divider"></div>
            <div class="gf-node-grid">
                ${milestoneViews.map((item) => `
                    <article class="gf-card gf-node-card ${item.claimable ? 'is-ready' : ''}">
                        <div class="gf-card-head">
                            <div>
                                <div class="eyebrow">${text('累充里程碑', 'Milestone')}</div>
                                <div class="gf-card-title">$${item.threshold.toFixed(2)}</div>
                            </div>
                            <div class="gf-card-number">${item.claimed ? text('已领', 'Claimed') : item.claimable ? text('可领', 'Ready') : text('未达成', 'Pending')}</div>
                        </div>
                        <div class="gf-chip-row" style="margin-top:12px;">
                            ${renderRewardChips(item.reward, { limit: 4 })}
                        </div>
                        <div class="gf-action-row" style="margin-top:12px;">
                            <button class="primary-btn" type="button" data-action="claimMilestone" data-value="${item.id}" ${item.claimable ? '' : 'disabled'}>${item.claimed ? text('已领取', 'Claimed') : text('领取', 'Claim')}</button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderShopItemRow(item) {
        const ready = isShopItemReady(item.id);
        const locked = !!item.requiresSponsor && !state.save.payment.passUnlocked;
        const price = getShopPrice(item.id);
        return `
            <article class="gf-list-card gf-shop-card ${ready ? 'is-highlight' : ''}">
                <div class="gf-row-head">
                    <div>
                        <div class="eyebrow">${item.free ? text('免费补给', 'Free Supply') : localize(item.title)}</div>
                        <div class="gf-card-title">${localize(item.title)}</div>
                    </div>
                    <div class="gf-card-number">${item.free ? text('免费', 'Free') : `${formatCompact(price)} ${item.priceType === 'gold' ? text('金币', 'G') : text('熔尘', 'D')}`}</div>
                </div>
                <div class="gf-card-copy">${item.requiresSponsor && !state.save.payment.passUnlocked
                    ? text('需要先开通赞助，才会开放这类中后期资源箱。', 'Sponsor unlock is required before this mid-late crate becomes available.')
                    : text('这类箱子负责处理阶段性资源缺口，不建议在金币过紧时连续买。', 'These crates are meant to patch stage-specific shortages and should not be spammed while gold is already tight.')}</div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${renderRewardChips(item.reward, { limit: 4 })}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="${item.free ? 'claimDailySupply' : 'buyShopItem'}" data-value="${item.id}" ${ready && !locked ? '' : 'disabled'}>${item.free ? text('免费领取', 'Claim Free') : text('立即购买', 'Buy Now')}</button>
                </div>
            </article>
        `;
    }

    function renderPaymentOffer(offer) {
        const projected = getProjectedSponsorTier(offer);
        return `
            <article class="gf-card gf-shop-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('赞助礼包', 'Sponsor Offer')}</div>
                        <div class="gf-card-title">${localize(offer.name)}</div>
                    </div>
                    <div class="gf-card-number">$${offer.price.toFixed(2)}</div>
                </div>
                <div class="gf-card-copy">${text(`到账后直接加 ${formatCompact(offer.reward.gold)} 金币、${formatCompact(offer.reward.dust)} 熔尘和 ${formatCompact(offer.reward.catalyst)} 催化剂，并把赞助档位推进到 ${localize(projected.title)}。`, `This instantly grants ${formatCompact(offer.reward.gold)} gold, ${formatCompact(offer.reward.dust)} dust, ${formatCompact(offer.reward.catalyst)} catalyst, and pushes sponsor tier toward ${localize(projected.title)}.`)}</div>
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${renderRewardChips(offer.reward, { limit: 4 })}
                    <span class="gf-chip is-strong">${text('热量上限', 'Heat Cap')} +${formatCompact(offer.permanent.heatCap || 0)}</span>
                    <span class="gf-chip is-strong">${text('稀有率', 'Rare Rate')} +${formatPercent(offer.permanent.rareRate || 0)}</span>
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="buyOffer" data-value="${offer.id}">${text('模拟到账', 'Simulate Purchase')}</button>
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
                    <button class="ghost-btn" type="button" data-action="equipSigil" data-value="${sigil.id}" ${(unlocked && !slotLocked) ? '' : 'disabled'}>${equipped ? text('当前已装', 'Equipped') : text('装到槽位', 'Equip')}</button>
                    <button class="primary-btn" type="button" data-action="${unlocked ? 'upgradeSigil' : 'unlockSigil'}" data-value="${sigil.id}" ${(unlockReady || upgradeReady) ? '' : 'disabled'}>${unlocked
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
                <div>
                    <div class="eyebrow">${title}</div>
                    <h2>${title}</h2>
                    <div class="gf-panel-copy">${copy}</div>
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
                tier4Drops: 0
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
        next.payment.milestoneClaims = next.payment?.milestoneClaims && typeof next.payment.milestoneClaims === 'object' ? { ...next.payment.milestoneClaims } : {};
        next.payment.premiumSeasonClaims = next.payment?.premiumSeasonClaims && typeof next.payment.premiumSeasonClaims === 'object' ? { ...next.payment.premiumSeasonClaims } : {};
        return next;
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

    function smeltOne() {
        syncHeat();
        if (state.save.heat < SMELT_HEAT_COST) return showToast(text('热量不足，先等恢复或补热量上限。', 'Not enough heat. Wait for regen or raise heat cap first.'));
        const result = performSmeltRoll();
        state.save.heat -= SMELT_HEAT_COST;
        state.save.stats.smelts += 1;
        state.save.seasonXp += 6;
        applySmeltResult(result);
        saveProgress();
        renderAll();
    }

    function smeltBatch() {
        syncHeat();
        if (state.save.heat < config.forgeBalance.batchSmeltHeatCost) return showToast(text('批量熔炼至少需要 12 热量。', 'Batch forge needs at least 12 heat.'));
        state.save.heat -= config.forgeBalance.batchSmeltHeatCost;
        const rolls = [];
        for (let index = 0; index < 3; index += 1) {
            const result = performSmeltRoll();
            rolls.push(result);
            applySmeltResult(result, true);
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
        state.save.lastResult = {
            title: text(`批量熔炼完成 · 最高 T${topTier}`, `Batch Forge Complete · Top T${topTier}`),
            copy: text(`本轮共熔出 ${rolls.reduce((sum, item) => sum + item.quantity, 0)} 颗宝石，并额外回收 ${formatCompact(batchGoldBonus)} 金币 / ${formatCompact(batchDustBonus)} 熔尘。`, `This batch forged ${rolls.reduce((sum, item) => sum + item.quantity, 0)} gems and returned ${formatCompact(batchGoldBonus)} gold / ${formatCompact(batchDustBonus)} dust.`),
            tags: [
                `${text('首颗家族', 'Lead Family')} · ${familyName}`,
                `T${topTier}`,
                `${text('批量奖励', 'Batch Bonus')} +${formatCompact(batchDustBonus)}D`
            ]
        };
        showToast(text('批量熔炼完成，优先处理能合成的高价值宝石。', 'Batch forge complete. Handle the highest-value fuse candidates first.'));
        saveProgress();
        renderAll();
    }

    function performSmeltRoll() {
        const rareBonus = getRareBonus();
        const passives = getSigilPassives();
        const tier = rollTier(rareBonus, passives.jumpChance);
        const familyId = rollFamilyId();
        let quantity = Math.random() < Math.min(0.48, passives.doubleChance) ? 2 : 1;
        if (Math.random() < Math.min(0.18, passives.bonusExtraGemChance || 0)) quantity += 1;
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
        return { familyId, tier, quantity };
    }

    function rollTier(rareBonus, jumpChance) {
        const pityForceT3 = state.save.pity.t3 + 1 >= config.forgeBalance.pityTier3Need;
        const pityForceT4 = state.save.pity.t4 + 1 >= config.forgeBalance.pityTier4Need;
        if (pityForceT4) return 4;
        if (pityForceT3) return 3;
        const base = { ...config.forgeBalance.dropRates };
        const rareLift = Math.min(0.18, rareBonus);
        const tier3Rate = Math.min(0.18, base.tier3 + rareLift * 0.45);
        const tier2Rate = Math.min(0.34, base.tier2 + rareLift * 0.7);
        const tier1Rate = Math.max(0.42, 1 - tier2Rate - tier3Rate);
        const roll = Math.random();
        let tier = roll < tier1Rate ? 1 : roll < tier1Rate + tier2Rate ? 2 : 3;
        if (Math.random() < Math.min(0.22, jumpChance) && tier < 5) tier += 1;
        return Math.min(5, tier);
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

    function applySmeltResult(result, silent = false) {
        const familyName = localize(familyMap[result.familyId].name);
        state.save.lastResult = {
            title: text(`${familyName} T${result.tier} 宝石`, `${familyName} T${result.tier} Gem`),
            copy: text(`本次熔炼获得 ${result.quantity} 颗 ${familyName} T${result.tier} 宝石。继续攒到 3 颗就能合到下一阶。`, `You forged ${result.quantity} ${familyName} T${result.tier} gems. Reach 3 copies to fuse into the next tier.`),
            tags: [familyName, `T${result.tier}`, `${text('数量', 'Qty')} ${result.quantity}`]
        };
        if (!silent) showToast(text(`熔炼成功：${familyName} T${result.tier}`, `Forged ${familyName} T${result.tier}`));
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
        state.save.contractIndex = index;
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
        if (getSigilLevel(sigilId) > 0) return;
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
        if (level >= 8) return;
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
        const view = getMissionView(mission);
        if (!view || !view.claimable) return;
        grantReward(view.reward);
        state.save.missionClaimed.push(missionId);
        showToast(text('任务奖励已领取。', 'Mission reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimAllMissions() {
        const claimable = config.missions.map(getMissionView).filter((item) => item.claimable);
        if (!claimable.length) return;
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
        if (!node || !isSeasonClaimable(node.id)) return;
        grantReward(node.reward);
        state.save.seasonClaimed.push(node.id);
        showToast(text('赛季奖励已领取。', 'Season reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimSponsorSeasonNode(nodeId) {
        const node = config.sponsorSeasonNodes.find((item) => item.id === nodeId);
        if (!node || !isSponsorSeasonClaimable(node.id)) return;
        grantReward(node.reward);
        state.save.payment.premiumSeasonClaims[node.id] = true;
        showToast(text('赞助赛季奖励已领取。', 'Sponsor season reward claimed.'));
        saveProgress();
        renderAll();
    }

    function claimAllSeason() {
        config.seasonNodes.forEach((node) => {
            if (isSeasonClaimable(node.id)) {
                grantReward(node.reward);
                state.save.seasonClaimed.push(node.id);
            }
        });
        config.sponsorSeasonNodes.forEach((node) => {
            if (isSponsorSeasonClaimable(node.id)) {
                grantReward(node.reward);
                state.save.payment.premiumSeasonClaims[node.id] = true;
            }
        });
        showToast(text('全部可领奖励已回收。', 'All ready rewards claimed.'));
        saveProgress();
        renderAll();
    }

    function claimDailySupply() {
        if (!isDailySupplyReady()) return;
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
        const view = getMilestoneView(milestone);
        if (!view || !view.claimable) return;
        grantReward(view.reward);
        state.save.payment.milestoneClaims[milestoneId] = true;
        showToast(text('累充里程碑奖励已领取。', 'Payment milestone claimed.'));
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
    function hasShopRedDot() { return isDailySupplyReady() || config.paymentMilestones.some((milestone) => { const view = getMilestoneView(milestone); return view && view.claimable; }); }

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
    function getSlotName(slotId) { if (slotId === 'main') return text('主熔槽', 'Main Slot'); if (slotId === 'echo') return text('共鸣槽', 'Echo Slot'); return text('余烬槽', 'Resonance Slot'); }
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
        const power = getCurrentPower();
        const heatEnoughOne = state.save.heat >= SMELT_HEAT_COST;
        const heatEnoughBatch = state.save.heat >= config.forgeBalance.batchSmeltHeatCost;
        const inventoryRows = getGemInventoryRows();
        const fuseReady = inventoryRows.filter((row) => row.canFuse);
        const awakenReady = inventoryRows.filter((row) => row.canAwaken);
        const lastResult = state.save.lastResult;
        const recyclePlan = getSmartRecyclePlan();

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
                    <div class="gf-card-copy">${text('单次熔炼消耗 4 热量；批量熔炼用 12 热量换 3 次，并附带少量金币 / 熔尘回流。', 'Single forge spends 4 heat. Batch forge spends 12 heat for 3 rolls and adds a small gold/dust return.')}</div>
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
                        <span class="gf-chip is-warning">${text('建议同步补符印与工坊', 'Raise sigils and workshop together')}</span>
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="openTab" data-value="contracts">${text('去合同页推进', 'Open Contracts')}</button>
                        <button class="ghost-btn" type="button" data-action="openTab" data-value="sigils">${text('去补符印', 'Raise Sigils')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('智能回收', 'Smart Recycle')}</div>
                            <div class="gf-card-title">${recyclePlan.entries.length ? text(`${recyclePlan.totalCount} 颗可回收`, `${recyclePlan.totalCount} gems recyclable`) : text('无安全富余库存', 'No safe overflow')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(recyclePlan.totalDust)}</div>
                    </div>
                    <div class="gf-card-copy">${text('只回收当前推进用不上的低优先宝石，会为当前合同焦点保留合成和觉醒所需的基础库存。', 'Only low-priority gems outside your current push are recycled, while the stock needed for upcoming fuse and awaken steps is kept.')}</div>
                    ${renderKpiGrid([
                        { label: text('可回收行', 'Rows'), value: formatCompact(recyclePlan.entries.length) },
                        { label: text('可回收总数', 'Gems'), value: formatCompact(recyclePlan.totalCount) },
                        { label: text('熔尘返还', 'Dust Back'), value: formatCompact(recyclePlan.totalDust) },
                        { label: text('保留库存', 'Kept'), value: formatCompact(recyclePlan.protectedCount) }
                    ])}
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${recyclePlan.entries.slice(0, 4).map((entry) => `<span class="gf-chip">${localize(familyMap[entry.familyId].name)} T${entry.tier} · -${entry.amount}</span>`).join('')}
                        ${recyclePlan.entries.length > 4 ? `<span class="gf-chip is-warning">+${recyclePlan.entries.length - 4}</span>` : ''}
                    </div>
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="smartRecycle" ${recyclePlan.entries.length ? '' : 'disabled'}>${text('一键回收', 'Smart Recycle')}</button>
                    </div>
                </article>
            </div>
            ${renderLatestResultCard(lastResult, { context: 'forge', compact: true })}
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
    };

    renderContractsTab = function renderContractsTabEnhanced() {
        const currentPower = getCurrentPower();
        const passives = getSigilPassives();
        const effectivePower = currentPower.total + passives.contractStability;
        const lastResult = state.save.lastResult;
        const visibleContracts = config.contracts.map((contract, index) => {
            const unlocked = index <= state.save.bestContractIndex;
            const selected = index === state.save.contractIndex;
            const cleared = index < state.save.bestContractIndex;
            const preview = index === state.save.bestContractIndex + 1;
            const powerGap = Math.max(0, contract.recommended - effectivePower);
            return { contract, index, unlocked, selected, cleared, preview, powerGap };
        });

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('合同推进', 'Contracts'),
                text('这页只回答三件事：当前推哪一档、差多少、打赢后回什么。', 'This view answers only three things: which contract to push, how far you are, and what comes back when it clears.'),
                `<div class="gf-chip">${text('最高推进', 'Best')} · ${config.contracts[state.save.bestContractIndex].id}</div>`
            )}
            <div class="gf-card-grid">
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('当前目标', 'Current Goal')}</div>
                            <div class="gf-card-title">${getCurrentContract().id} · ${localize(getCurrentContract().name)}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(effectivePower)}</div>
                    </div>
                    <div class="gf-card-copy">${text('合同按“基础战力 + 符印稳定”一起结算。只看裸战力容易误判，所以这里直接展示可清线的有效战力。', 'Contracts resolve using base power plus sigil stability. Raw power alone can be misleading, so this card shows your effective clear power.')}</div>
                    ${renderKpiGrid([
                        { label: text('基础战力', 'Base Power'), value: formatCompact(currentPower.total) },
                        { label: text('符印稳定', 'Stability'), value: `+${formatCompact(passives.contractStability)}` },
                        { label: text('推荐战力', 'Recommended'), value: formatCompact(getCurrentContract().recommended) },
                        { label: text('缺口', 'Gap'), value: formatCompact(Math.max(0, getCurrentContract().recommended - effectivePower)) }
                    ])}
                    <div class="gf-action-row" style="margin-top:12px;">
                        <button class="primary-btn" type="button" data-action="runContract" data-value="${state.save.contractIndex}">${text('执行当前合同', 'Run Contract')}</button>
                    </div>
                </article>
                <article class="gf-card">
                    <div class="gf-card-head">
                        <div>
                            <div class="eyebrow">${text('奖励结构', 'Reward Mix')}</div>
                            <div class="gf-card-title">${text('越往后越缺金币与熔尘', 'Later contracts tighten gold and dust')}</div>
                        </div>
                        <div class="gf-card-number">${formatCompact(getCurrentContract().reward.gold)}</div>
                    </div>
                    <div class="gf-card-copy">${text('金币只覆盖一部分后续升级，熔尘和催化剂会越来越像真正卡点，所以这里既看收益，也看失败保底。', 'Gold only covers part of your next upgrades; dust and catalyst become the real walls over time, so this page shows both success rewards and failed-run fallback.')}</div>
                    <div class="gf-chip-row" style="margin-top:12px;">
                        ${renderRewardChips(getContractPreviewReward(getCurrentContract()), { limit: 4 })}
                        <span class="gf-chip is-warning">${text('失败也会回流一部分资源', 'Failed runs still return fallback loot')}</span>
                    </div>
                </article>
            </div>
            ${lastResult?.type === 'contract' ? renderLatestResultCard(lastResult, { context: 'contracts' }) : ''}
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
                                ? text(`当前还差 ${formatCompact(powerGap)} 有效战力，优先补 ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')} 焦点相关收益。`, `You are ${formatCompact(powerGap)} effective power short. Focus on ${contract.focus.map((familyId) => localize(familyMap[familyId].name)).join(' / ')} outputs first.`)
                                : text('当前有效战力已经过线，直接执行合同拿资源并解锁下一档。', 'Your effective power is already on the line. Run it now for resources and the next unlock.'))
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

        ui.panelContent.innerHTML = `
            ${renderPanelHead(
                text('符印构筑', 'Sigils'),
                text('每个符印只吃自己的碎片；顶部总碎片只是汇总，不代表任意一个符印都能直接解锁或升级。', 'Each sigil uses its own shards. The total shard number is only a summary and does not mean every sigil can be unlocked or upgraded immediately.'),
                `<div class="gf-chip">${text('总碎片', 'Total Shards')} · ${formatCompact(totalShards)}</div>`
            )}
            <article class="gf-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('当前装配摘要', 'Loadout Summary')}</div>
                        <div class="gf-card-title">${text('先处理可升级 / 可解锁 / 本章焦点', 'Handle upgrades, unlocks, and current focus first')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(getSelectedSigilPower())}</div>
                </div>
                <div class="gf-card-copy">${text('符印页压缩成“装配槽 + 关键符印”两层结构。先把可操作项做完，再去看折叠的低优先级符印，会更适合手机单屏决策。', 'The sigil page is compressed into two layers: slots and priority sigils. Finish actionable entries first, then expand into lower-priority sigils if needed for mobile-friendly decision making.')}</div>
                ${renderKpiGrid([
                    { label: text('已解锁', 'Unlocked'), value: formatCompact(summary.unlockedCount) },
                    { label: text('可升级', 'Ready Up'), value: formatCompact(summary.upgradeReadyCount) },
                    { label: text('可解锁', 'Ready Unlock'), value: formatCompact(summary.unlockReadyCount) },
                    { label: text('本章焦点', 'Focus Sigils'), value: formatCompact(summary.focusCount) }
                ])}
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${summary.focusFamilies.map((familyId) => `<span class="gf-chip is-success">${localize(familyMap[familyId].name)}</span>`).join('')}
                    ${hiddenCount > 0 ? `<span class="gf-chip">${text(`其余 ${hiddenCount} 个符印已折叠`, `${hiddenCount} more sigils collapsed`)}</span>` : ''}
                </div>
            </article>
            <div class="gf-slot-grid">
                ${slotCards.map(renderSlotCard).join('')}
            </div>
            <article class="gf-list-card">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('关键符印', 'Priority Sigils')}</div>
                        <div class="gf-card-title">${text('单屏只保留最值得现在操作的几项', 'Only the most valuable next actions stay on screen')}</div>
                    </div>
                    <div class="gf-card-number">${formatCompact(visibleSigils.length)}</div>
                </div>
                <div class="gf-card-copy">${text('排序优先级：已装配 > 可升级 / 可解锁 > 当前合同焦点 > 最高稀有度。这样手机端不用先读完整个列表。', 'Sorting priority: equipped > ready to unlock/upgrade > current contract focus > highest rarity, so mobile players do not need to scan the full list first.')}</div>
                <div class="gf-list" style="margin-top:12px;">
                    ${visibleSigils.map(renderSigilRow).join('')}
                    ${hiddenCount > 0 ? `<div class="gf-empty">${text(`剩余 ${hiddenCount} 个低优先级符印已折叠。等当前升级、解锁和焦点补强处理完，再回来看它们即可。`, `${hiddenCount} lower-priority sigils are collapsed for now. Come back to them after current upgrades, unlocks, and focus boosts are handled.`)}</div>` : ''}
                </div>
            </article>
        `;
    };

    renderPaymentOffer = function renderPaymentOfferEnhanced(offer) {
        const projected = getProjectedOfferImpact(offer);
        return `
            <article class="gf-card gf-shop-card ${projected.reachGain > 0 || projected.projectedGap < projected.currentGap ? 'is-highlight' : ''}">
                <div class="gf-card-head">
                    <div>
                        <div class="eyebrow">${text('赞助礼包', 'Sponsor Offer')}</div>
                        <div class="gf-card-title">${localize(offer.name)}</div>
                    </div>
                    <div class="gf-card-number">$${offer.price.toFixed(2)}</div>
                </div>
                <div class="gf-card-copy">${text(`到账后直接补 ${formatCompact(offer.reward.gold)} 金币、${formatCompact(offer.reward.dust)} 熔尘和 ${formatCompact(offer.reward.catalyst)} 催化剂；永久战力约 +${formatCompact(projected.powerGain)}，当前合同 ${projected.contractId} 的缺口会从 ${formatCompact(projected.currentGap)} 压到 ${formatCompact(projected.projectedGap)}。`, `This instantly grants ${formatCompact(offer.reward.gold)} gold, ${formatCompact(offer.reward.dust)} dust, and ${formatCompact(offer.reward.catalyst)} catalyst; permanent power rises by about ${formatCompact(projected.powerGain)} and the current ${projected.contractId} contract gap drops from ${formatCompact(projected.currentGap)} to ${formatCompact(projected.projectedGap)}.`)}</div>
                ${renderKpiGrid([
                    { label: text('永久战力', 'Perm Power'), value: `+${formatCompact(projected.powerGain)}` },
                    { label: text('缺口变化', 'Gap Shift'), value: `${formatCompact(projected.currentGap)} → ${formatCompact(projected.projectedGap)}` },
                    { label: text('赞助档位', 'Sponsor Tier'), value: localize(projected.projectedTier.title) },
                    { label: text('推进预估', 'Reach'), value: `${getContractLabel(projected.currentReachIndex)} → ${getContractLabel(projected.projectedReachIndex)}` }
                ])}
                <div class="gf-chip-row" style="margin-top:12px;">
                    ${renderRewardChips(offer.reward, { limit: 4 })}
                    <span class="gf-chip is-strong">${text('热量上限', 'Heat Cap')} +${formatCompact(offer.permanent.heatCap || 0)}</span>
                    <span class="gf-chip is-strong">${text('稀有率', 'Rare Rate')} +${formatPercent(offer.permanent.rareRate || 0)}</span>
                    ${(offer.permanent.dustYield || 0) > 0 ? `<span class="gf-chip is-success">${text('熔尘回收', 'Dust Yield')} +${formatPercent(offer.permanent.dustYield || 0)}</span>` : ''}
                    ${(offer.permanent.catalystYield || 0) > 0 ? `<span class="gf-chip is-success">${text('催化提炼', 'Catalyst Yield')} +${formatPercent(offer.permanent.catalystYield || 0)}</span>` : ''}
                    ${projected.unlocksPass ? `<span class="gf-chip is-warning">${text('同步开启赞助赛季轨', 'Unlocks sponsor season track')}</span>` : ''}
                    ${projected.reachGain > 0 ? `<span class="gf-chip is-success">${text(`预计多推 ${projected.reachGain} 档`, `Est. +${projected.reachGain} stages`)}</span>` : ''}
                </div>
                <div class="gf-action-row" style="margin-top:12px;">
                    <button class="primary-btn" type="button" data-action="buyOffer" data-value="${offer.id}">${text('模拟到账', 'Simulate Purchase')}</button>
                </div>
            </article>
        `;
    };

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

    function readLang() { try { return localStorage.getItem(HUB_LANG_KEY) === 'en' ? 'en' : 'zh'; } catch (error) { return 'zh'; } }
    function localize(value) { if (!value) return ''; if (typeof value === 'string') return value; return value[state.lang] || value.zh || value.en || ''; }
    function text(zh, en) { return state.lang === 'en' ? en : zh; }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function clampNumber(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) { const numeric = Math.floor(Number(value)); if (!Number.isFinite(numeric)) return fallback; return Math.max(min, Math.min(max, numeric)); }
    function formatCompact(value) { const number = Number(value) || 0; if (Math.abs(number) >= 1000000) return `${(number / 1000000).toFixed(1)}M`; if (Math.abs(number) >= 1000) return `${(number / 1000).toFixed(1)}K`; return `${Math.round(number * 100) / 100}`; }
    function formatPercent(value) { return `${Math.round((Number(value) || 0) * 100)}%`; }
    function showToast(message) { if (!message || !ui.toast) return; ui.toast.textContent = message; ui.toast.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2200); }
}());
