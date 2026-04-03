(function () {
    const GAME_CATALOG = Array.isArray(window.GENESIS_GAME_CATALOG) ? window.GENESIS_GAME_CATALOG : [];
    const HUB_PROFILE_KEY = 'genesis_arcade_hub_profile_v1';
    const MINING_SAVE_KEY = 'genesis_mining_zone_v2_save';

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
        }
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}B`;
        if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
        if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
        return Math.floor(number).toLocaleString('zh-CN');
    }

    function getMiningSummary() {
        const payload = loadJson(MINING_SAVE_KEY, null);
        if (!payload || typeof payload !== 'object') {
            return null;
        }

        const collection = Array.isArray(payload.collection) ? payload.collection : [];
        const tier4Count = collection.filter((item) => Number(item?.tier) === 4).length;

        return {
            coins: Number(payload.coins) || 0,
            power: Number(payload.power) || 0,
            level: Number(payload.level) || 1,
            t4Count: tier4Count
        };
    }

    function loadHubProfile() {
        const base = {
            visits: 0,
            lastGameId: 'mining',
            gameOpens: {},
            interestedGameIds: []
        };

        const profile = loadJson(HUB_PROFILE_KEY, base);
        profile.visits = Math.max(0, Number(profile.visits) || 0) + 1;
        profile.lastGameId = String(profile.lastGameId || 'mining');
        profile.gameOpens = profile.gameOpens && typeof profile.gameOpens === 'object' ? profile.gameOpens : {};
        profile.interestedGameIds = Array.isArray(profile.interestedGameIds) ? profile.interestedGameIds : [];
        saveJson(HUB_PROFILE_KEY, profile);
        return profile;
    }

    function markGameOpen(profile, gameId) {
        if (!profile) {
            return;
        }

        profile.lastGameId = gameId;
        profile.gameOpens[gameId] = Math.max(0, Number(profile.gameOpens[gameId]) || 0) + 1;
        if (!profile.interestedGameIds.includes(gameId) && gameId !== 'mining') {
            profile.interestedGameIds.push(gameId);
        }
        saveJson(HUB_PROFILE_KEY, profile);
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function buildMetaChip(text) {
        return `<span class="meta-chip">${text}</span>`;
    }

    function renderFeaturedGame(miningSummary) {
        const node = document.getElementById('featuredGameCard');
        const mining = GAME_CATALOG.find((game) => game.id === 'mining');
        if (!node || !mining) {
            return;
        }

        const progressChips = miningSummary
            ? [`\u91D1\u5E01 / Coins ${formatCompact(miningSummary.coins)}`, `\u7B97\u529B / Power ${formatCompact(miningSummary.power)}`, `T4 \u5B9D\u77F3 / T4 Gems ${miningSummary.t4Count}`, `\u7B49\u7EA7 / Lv.${miningSummary.level}`]
            : ['\u65B0\u73A9\u5BB6\u5165\u53E3 / New Player Entry', '\u53EF\u4EE5\u76F4\u63A5\u5F00\u73A9 / Ready To Play'];

        node.innerHTML = `
            <div class="featured-visual">
                <div class="featured-cover"${mining.cover ? ` style="background-image:url('${mining.cover}')"` : ''}></div>
                <div class="featured-icon" style="color:${mining.accent}; box-shadow: inset 0 0 0 1px ${mining.accent}33;">
                    ${mining.icon}
                </div>
            </div>
            <div class="featured-content">
                <span class="status-pill live">${mining.badge}</span>
                <div>
                    <h4 class="featured-title">${mining.title}</h4>
                    <div class="game-subtitle">${mining.subtitle} | ${mining.genre}</div>
                </div>
                <div class="featured-desc">${mining.description}</div>
                <div class="featured-meta">${progressChips.map(buildMetaChip).join('')}</div>
                <div class="game-tags">${mining.tags.map(buildMetaChip).join('')}</div>
                <div class="hero-actions">
                    <a class="primary-btn" href="${mining.href}" data-game-link="${mining.id}">\u8FDB\u5165\u4E3B\u6E38\u620F / Enter Main Game</a>
                    <a class="ghost-btn" href="/games/coming-soon/?id=gem-forge" data-game-link="gem-forge">\u67E5\u770B\u4E0B\u4E00\u4E2A\u6E38\u620F / Next Game</a>
                </div>
            </div>
        `;
    }

    function renderGameGrid(profile) {
        const node = document.getElementById('gameGrid');
        if (!node) {
            return;
        }

        node.innerHTML = GAME_CATALOG.map((game) => {
            const openCount = Math.max(0, Number(profile?.gameOpens?.[game.id]) || 0);
            const badgeClass = game.status === 'live' ? 'live' : 'soon';
            const ctaLabel = game.status === 'live' ? '\u7ACB\u5373\u8FDB\u5165 / Play Now' : '\u67E5\u770B\u5360\u4F4D\u9875 / View Placeholder';

            return `
                <a class="game-card ${game.status}" href="${game.href}" data-game-link="${game.id}" style="--card-accent:${game.accent};">
                    ${game.cover ? `<div class="game-cover" style="background-image:url('${game.cover}')"></div>` : ''}
                    <div class="game-card-header">
                        <div class="game-icon" style="color:${game.accent};">${game.icon}</div>
                        <span class="status-pill ${badgeClass}">${game.badge}</span>
                    </div>
                    <div>
                        <h4 class="game-title">${game.title}</h4>
                        <div class="game-subtitle">${game.subtitle}</div>
                    </div>
                    <div class="game-meta">${game.genre} | \u5DF2\u6253\u5F00 / Opened ${openCount} \u6B21</div>
                    <div class="game-desc">${game.description}</div>
                    <div class="game-tags">${game.tags.map(buildMetaChip).join('')}</div>
                    <span class="game-cta">${ctaLabel}</span>
                </a>
            `;
        }).join('');
    }

    function openModal() {
        const node = document.getElementById('hubModal');
        if (node) {
            node.hidden = false;
        }
    }

    function closeModal() {
        const node = document.getElementById('hubModal');
        if (node) {
            node.hidden = true;
        }
    }

    function bindGlobalActions(profile) {
        document.querySelectorAll('[data-game-link]').forEach((link) => {
            link.addEventListener('click', () => {
                markGameOpen(profile, link.getAttribute('data-game-link') || 'mining');
            });
        });

        const helpBtn = document.getElementById('howItWorksBtn');
        const closeBtn = document.getElementById('closeHubModal');
        const modal = document.getElementById('hubModal');

        if (helpBtn) helpBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    }

    function initHubPage() {
        const profile = loadHubProfile();
        const miningSummary = getMiningSummary();
        const liveCount = GAME_CATALOG.filter((game) => game.status === 'live').length;
        const lastPlayed = GAME_CATALOG.find((game) => game.id === profile.lastGameId) || GAME_CATALOG[0];

        setText('hubVisits', profile.visits.toLocaleString('zh-CN'));
        setText('liveGameCount', `${liveCount} / ${GAME_CATALOG.length}`);
        setText('miningCoins', miningSummary ? formatCompact(miningSummary.coins) : '\u672A\u5F00\u59CB / Not Started');
        setText('miningPower', miningSummary ? formatCompact(miningSummary.power) : '\u672A\u5F00\u59CB / Not Started');
        setText('miningTier4', miningSummary ? `${miningSummary.t4Count}` : '0');
        setText('lastPlayedGame', lastPlayed ? lastPlayed.title : '\u521B\u4E16\u6316\u77FF\u533A / Genesis Mining Zone');

        renderFeaturedGame(miningSummary);
        renderGameGrid(profile);
        bindGlobalActions(profile);
        closeModal();
    }

    if (document.getElementById('gameGrid')) {
        initHubPage();
    }
}());
