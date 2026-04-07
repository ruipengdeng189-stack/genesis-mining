(function () {
    const GAME_CATALOG = Array.isArray(window.GENESIS_GAME_CATALOG) ? window.GENESIS_GAME_CATALOG : [];
    const HUB_PROFILE_KEY = 'genesis_arcade_hub_profile_v1';
    const HUB_LANG_KEY = 'genesis_arcade_hub_lang_v1';
    const MINING_SAVE_KEY = 'genesis_mining_zone_v2_save';
    const UI_COPY = {
    "zh":  {
               "buildCard1Body":  "\u6839\u76ee\u5f55\u53ea\u8d1f\u8d23\u5bfc\u822a\u3002\u6bcf\u4e2a\u6e38\u620f\u90fd\u5355\u72ec\u653e\u5728 \u003ccode\u003egames/\u003c/code\u003e \u4e0b\u3002",
               "coinsChip":  "\u91d1\u5e01",
               "powerChip":  "\u7b97\u529b",
               "assetCard2Title":  "10 \u5f20\u6e38\u620f\u5c01\u9762",
               "assetCard2Body":  "\u5efa\u8bae\u89c4\u683c\uff1a\u003ccode\u003e800x1000\u003c/code\u003e\uff0c\u6700\u597d\u4fdd\u6301\u7edf\u4e00\u98ce\u683c\u3002",
               "topContinueBtn":  "\u7ee7\u7eed\u6316\u77ff",
               "assetCard1Body":  "\u5efa\u8bae\u89c4\u683c\uff1a\u003ccode\u003e512x512\u003c/code\u003e \u900f\u660e PNG \u6216 SVG\u3002",
               "modalEyebrow":  "\u65b9\u6848\u8bf4\u660e",
               "catalogEyebrow":  "\u6e38\u620f\u76ee\u5f55",
               "buildCard1Title":  "\u5927\u5385\u5148\u884c",
               "labelT4Gems":  "T4 \u5b9d\u77f3",
               "modalLine5":  "\u70b9\u51fb\u53f3\u4e0a\u89d2\u6216\u7a7a\u767d\u533a\u57df\u53ef\u5173\u95ed",
               "playNow":  "\u7acb\u5373\u8fdb\u5165",
               "buildCard2Body":  "\u6bcf\u4e2a\u6e38\u620f\u5148\u7528 \u003ccode\u003elocalStorage\u003c/code\u003e \u5b58\u6863\u3002\u5927\u5385\u5728\u540c\u57df\u540d\u4e0b\u53ef\u4ee5\u8bfb\u53d6\u8fd9\u4e9b\u6570\u636e\u3002",
               "assetCard4Body":  "\u4e3b\u9875\u5165\u53e3\u3001\u6392\u884c\u3001\u4efb\u52a1\u3001\u5546\u5e97\u3001\u901a\u884c\u8bc1\u3001\u6d3b\u52a8\u90fd\u9700\u8981\u7edf\u4e00\u56fe\u6807\u4f53\u7cfb\u3002",
               "catalogHeading":  "10 \u4e2a\u6e38\u620f\u5165\u53e3",
               "pageTitle":  "\u591a\u6e38\u620f\u5927\u5385 V1",
               "howItWorksBtn":  "\u67e5\u770b\u65b9\u6848",
               "assetCard1Title":  "\u5927\u5385 Logo",
               "buildCard3Body":  "\u4f60\u4ecd\u7136\u4f7f\u7528 \u003ccode\u003eGitHub -\u0026gt; Vercel\u003c/code\u003e \u81ea\u52a8\u53d1\u5e03\u6d41\u7a0b\u3002",
               "heroDescription":  "\u8fd9\u662f\u4f60\u73b0\u5728\u6700\u7a33\u7684\u7b2c\u4e00\u6b65\uff1a\u6839\u76ee\u5f55\u6539\u6210\u6e38\u620f\u5927\u5385\uff0c\u6316\u77ff\u6e38\u620f\u5355\u72ec\u653e\u5728\u5b50\u8def\u7531\uff0c\u5176\u4ed6\u6e38\u620f\u5148\u7528\u5360\u4f4d\u9875\u7559\u597d\u4f4d\u7f6e\u3002",
               "assetCard6Title":  "\u7279\u6548\u7d20\u6750",
               "modalBody":  "\u8fd9\u4e2a\u5927\u5385\u6682\u65f6\u4e0d\u4f9d\u8d56\u4ed8\u8d39\u6570\u636e\u5e93\u3002\u5b83\u8d1f\u8d23\u5bfc\u822a\u3001\u8bfb\u53d6\u5404\u4e2a\u6e38\u620f\u7684\u672c\u5730\u5b58\u6863\uff0c\u8ba9\u4f60\u53ef\u4ee5\u5148\u628a 10 \u4e2a\u6e38\u620f\u5165\u53e3\u642d\u8d77\u6765\uff0c\u518d\u4e00\u4e2a\u4e00\u4e2a\u586b\u5145\u771f\u6b63\u7684\u6e38\u620f\u5185\u5bb9\u3002",
               "featuredEyebrow":  "\u4e3b\u63a8\u6e38\u620f",
               "assetCard4Title":  "\u56fe\u6807\u5305",
               "heroStatus":  "\u5927\u5385\u5df2\u542f\u7528",
               "modalLine3":  "3. \u5176\u4ed6\u6e38\u620f\u5148\u7528\u5360\u4f4d\u9875",
               "labelMiningPower":  "\u6316\u77ff\u7b97\u529b",
               "modalCloseLabel":  "\u5173\u95ed",
               "buildPlanEyebrow":  "\u642d\u5efa\u65b9\u6848",
               "modalLine1":  "1. \u003ccode\u003eindex.html\u003c/code\u003e \u505a\u5927\u5385\u9996\u9875",
               "openedTemplate":  "\u5df2\u6253\u5f00 {count} \u6b21",
               "modalLine4":  "4. \u5171\u7528\u6210\u957f\u5148\u57fa\u4e8e \u003ccode\u003elocalStorage\u003c/code\u003e",
               "catalogNote":  "\u5df2\u5f00\u653e\u7684\u6e38\u620f\u76f4\u63a5\u8fdb\u5165\u3002\u672a\u5f00\u653e\u7684\u6e38\u620f\u5148\u8df3\u5230\u5360\u4f4d\u9875\uff0c\u540e\u7eed\u518d\u9010\u4e2a\u66ff\u6362\u4e3a\u771f\u6b63\u7684\u5c0f\u578b\u6e38\u620f\u3002",
               "levelChip":  "\u7b49\u7ea7",
               "assetCard3Body":  "\u5efa\u8bae\u4e3b\u9898\uff1a\u8d5b\u535a\u3001\u80fd\u6e90\u6838\u5fc3\u3001\u79d1\u6280\u673a\u623f\u3001\u9713\u8679\u8857\u673a\u98ce\u683c\u3002",
               "modalLine2":  "2. \u003ccode\u003egames/mining/\u003c/code\u003e \u653e\u6316\u77ff\u6e38\u620f",
               "enterMainGame":  "\u8fdb\u5165\u4e3b\u6e38\u620f",
               "newPlayerEntry":  "\u65b0\u73a9\u5bb6\u5165\u53e3",
               "notStarted":  "\u672a\u5f00\u59cb",
               "t4Chip":  "T4 \u5b9d\u77f3",
               "buildCard3Title":  "\u514d\u8d39\u53d1\u5e03",
               "labelMiningCoins":  "\u6316\u77ff\u91d1\u5e01",
               "labelHubVisits":  "\u5927\u5385\u8bbf\u95ee",
               "nextGame":  "\u67e5\u770b\u4e0b\u4e00\u4e2a\u6e38\u620f",
               "docTitle":  "\u521b\u4e16\u6e38\u620f\u5927\u5385",
               "metaDescription":  "Genesis Arcade Hub - \u4e00\u4e2a\u57fa\u4e8e\u9759\u6001\u9875\u9762\u3001localStorage \u4e0e Vercel \u642d\u5efa\u7684\u591a\u6e38\u620f\u5927\u5385\u3002",
               "readyToPlay":  "\u53ef\u4ee5\u76f4\u63a5\u5f00\u73a9",
               "assetsEyebrow":  "UI \u7d20\u6750\u6e05\u5355",
               "buildCard4Body":  "\u7b49\u4f60\u771f\u7684\u9700\u8981\u8de8\u8bbe\u5907\u540c\u6b65\u65f6\uff0c\u518d\u8865\u6700\u8f7b\u91cf\u7684\u6570\u636e\u5c42\u3002",
               "buildPlanHeading":  "\u4e3a\u4ec0\u4e48\u4e0d\u4e70\u6570\u636e\u5e93\u4e5f\u80fd\u5148\u8dd1\u8d77\u6765",
               "assetCard3Title":  "\u5927\u5385\u80cc\u666f",
               "assetCard5Title":  "\u97f3\u6548\u5305",
               "assetsHeading":  "\u4f60\u540e\u7eed\u53ef\u4ee5\u51c6\u5907\u7684\u7d20\u6750",
               "saveModeNote":  "\u5f53\u524d\u5927\u5385\u4e0e\u6316\u77ff\u8fdb\u5ea6\u5747\u4fdd\u5b58\u5728\u5f53\u524d\u6d4f\u89c8\u5668\u4e2d\uff0cV1 \u7248\u4e0d\u4f9d\u8d56\u4ed8\u8d39\u6570\u636e\u5e93\u3002",
               "labelLastPlayed":  "\u6700\u8fd1\u6e38\u73a9",
               "labelLiveGames":  "\u5df2\u5f00\u653e\u6e38\u620f",
               "lastPlayedFallback":  "\u521b\u4e16\u6316\u77ff\u533a",
               "featuredHeading":  "\u5f53\u524d\u4e3b\u7ebf\u5165\u53e3",
               "viewPlaceholder":  "\u67e5\u770b\u5360\u4f4d\u9875",
               "buildCard4Title":  "\u540e\u7eed\u6269\u5c55",
               "heroTitle":  "\u5148\u505a\u6210\u201c\u4e00\u4e2a\u5927\u5385 + \u591a\u4e2a\u6e38\u620f\u5165\u53e3\u201d",
               "continueMiningBtn":  "\u8fdb\u5165\u6316\u77ff",
               "assetCard5Body":  "\u70b9\u51fb\u3001\u9886\u5956\u3001\u5408\u6210\u3001\u786e\u8ba4\u3001\u83dc\u5355\u3001BGM \u5efa\u8bae\u7edf\u4e00\u4e3a\u79d1\u5e7b\u7535\u5b50\u98ce\u3002",
               "pageSubcopy":  "\u4e0d\u4e70\u6570\u636e\u5e93\u3001\u4e0d\u4e70\u670d\u52a1\u5668\u3002\u8fd9\u4e00\u7248\u5148\u57fa\u4e8e\u9759\u6001\u9875\u9762\u3001\u6d4f\u89c8\u5668\u672c\u5730\u5b58\u6863\u548c\u4f60\u73b0\u6709\u7684 Vercel \u8fdb\u884c\u642d\u5efa\u3002",
               "assetCard6Body":  "\u540e\u7eed\u53ef\u4ee5\u8865\u5fbd\u7ae0\u8fb9\u6846\u3001\u53d1\u5149\u7eb9\u7406\u3001\u5956\u676f\u7d20\u6750\u3001\u7c92\u5b50\u8499\u7248\u7b49\u6548\u679c\u3002",
               "modalTitle":  "\u5f53\u524d\u4e3a\u9759\u6001\u4f18\u5148\u67b6\u6784",
               "buildCard2Title":  "\u672c\u5730\u5b58\u6863"
           },
    "en":  {
               "buildCard1Body":  "The root page only handles navigation. Each game lives under \u003ccode\u003egames/\u003c/code\u003e.",
               "coinsChip":  "Coins",
               "powerChip":  "Power",
               "assetCard2Title":  "10 Game Covers",
               "assetCard2Body":  "Suggested size: \u003ccode\u003e800x1000\u003c/code\u003e, with a unified visual style.",
               "topContinueBtn":  "Continue Mining",
               "assetCard1Body":  "Suggested size: \u003ccode\u003e512x512\u003c/code\u003e, transparent PNG or SVG.",
               "modalEyebrow":  "Plan Notes",
               "catalogEyebrow":  "Game Catalog",
               "buildCard1Title":  "Hub First",
               "labelT4Gems":  "T4 Gems",
               "modalLine5":  "Click the top-right button or outside area to close",
               "playNow":  "Play Now",
               "buildCard2Body":  "Each game saves with \u003ccode\u003elocalStorage\u003c/code\u003e, and the hub reads those values on the same domain.",
               "assetCard4Body":  "Home entry, ranking, missions, shop, pass, and events should share one icon system.",
               "catalogHeading":  "10 Game Entrances",
               "pageTitle":  "Arcade Hub V1",
               "howItWorksBtn":  "View Plan",
               "assetCard1Title":  "Hub Logo",
               "buildCard3Body":  "You still deploy through the same \u003ccode\u003eGitHub -\u0026gt; Vercel\u003c/code\u003e auto-publish flow.",
               "heroDescription":  "Keep the root page as the game lobby, move mining into its own route, and reserve the rest as future game slots.",
               "assetCard6Title":  "FX Assets",
               "modalBody":  "This hub does not depend on a paid database for now. It handles navigation, reads local saves, and lets you build out 10 game entrances first.",
               "featuredEyebrow":  "Featured Game",
               "assetCard4Title":  "Icon Pack",
               "heroStatus":  "Hub Live",
               "modalLine3":  "3. Placeholders first for upcoming games",
               "labelMiningPower":  "Mining Power",
               "modalCloseLabel":  "Close",
               "buildPlanEyebrow":  "Build Plan",
               "modalLine1":  "1. \u003ccode\u003eindex.html\u003c/code\u003e hub homepage",
               "openedTemplate":  "Opened {count} times",
               "modalLine4":  "4. Shared local progress with \u003ccode\u003elocalStorage\u003c/code\u003e",
               "catalogNote":  "Released games can be entered directly. Upcoming games go to placeholder pages first, then get replaced one by one with real playable builds.",
               "levelChip":  "Level",
               "assetCard3Body":  "Suggested themes: cyber, reactor core, tech chamber, or neon arcade.",
               "modalLine2":  "2. \u003ccode\u003egames/mining/\u003c/code\u003e mining game route",
               "enterMainGame":  "Enter Main Game",
               "newPlayerEntry":  "New Player Entry",
               "notStarted":  "Not Started",
               "t4Chip":  "T4 Gems",
               "buildCard3Title":  "Free Deployment",
               "labelMiningCoins":  "Mining Coins",
               "labelHubVisits":  "Hub Visits",
               "nextGame":  "Next Game",
               "docTitle":  "Genesis Arcade Hub",
               "metaDescription":  "Genesis Arcade Hub - A multi-game lobby built with static pages, localStorage, and Vercel.",
               "readyToPlay":  "Ready To Play",
               "assetsEyebrow":  "UI Assets",
               "buildCard4Body":  "Add a lightweight data layer later only when you truly need cross-device sync.",
               "buildPlanHeading":  "Why It Works Without Paid Backend",
               "assetCard3Title":  "Hub Background",
               "assetCard5Title":  "Audio Pack",
               "assetsHeading":  "Assets To Prepare Next",
               "saveModeNote":  "Hub and mining progress are currently stored in this browser. V1 does not depend on a paid database.",
               "labelLastPlayed":  "Last Played",
               "labelLiveGames":  "Live Games",
               "lastPlayedFallback":  "Genesis Mining Zone",
               "featuredHeading":  "Current Main Entry",
               "viewPlaceholder":  "View Placeholder",
               "buildCard4Title":  "Expand Later",
               "heroTitle":  "Build One Hub + Multiple Game Entrances",
               "continueMiningBtn":  "Enter Mining",
               "assetCard5Body":  "Tap, reward, fusion, confirm, menu, and BGM should follow one sci-fi electronic style.",
               "pageSubcopy":  "This version runs on static pages, browser localStorage, and your current Vercel deployment.",
               "assetCard6Body":  "Later you can add badge frames, glow textures, trophies, and particle overlays.",
               "modalTitle":  "Static-first Architecture",
               "buildCard2Title":  "Local Save"
           }
};

    const STATIC_TEXT_KEYS = [
        'pageTitle', 'topContinueBtn', 'heroStatus', 'heroTitle', 'continueMiningBtn', 'howItWorksBtn',
        'labelHubVisits', 'labelLiveGames', 'labelMiningCoins', 'labelMiningPower', 'labelT4Gems', 'labelLastPlayed',
        'featuredEyebrow', 'featuredHeading', 'catalogEyebrow', 'catalogHeading', 'buildPlanEyebrow', 'buildPlanHeading',
        'buildCard1Title', 'buildCard2Title', 'buildCard3Title', 'buildCard4Title',
        'assetsEyebrow', 'assetsHeading', 'assetCard1Title', 'assetCard2Title', 'assetCard3Title', 'assetCard4Title', 'assetCard5Title', 'assetCard6Title',
        'modalEyebrow', 'modalTitle'
    ];

    const STATIC_HTML_KEYS = [
        'pageSubcopy', 'heroDescription', 'saveModeNote', 'catalogNote',
        'buildCard1Body', 'buildCard2Body', 'buildCard3Body', 'buildCard4Body',
        'assetCard1Body', 'assetCard2Body', 'assetCard3Body', 'assetCard4Body', 'assetCard5Body', 'assetCard6Body',
        'modalBody', 'modalLine1', 'modalLine2', 'modalLine3', 'modalLine4', 'modalLine5'
    ];

    let currentLang = getInitialLang();
    let activeProfile = null;
    let activeMiningSummary = null;

    function decodeHtmlEntities(value) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = String(value || '');
        return textarea.value;
    }

    function getInitialLang() {
        try {
            const savedLang = localStorage.getItem(HUB_LANG_KEY);
            if (savedLang === 'zh' || savedLang === 'en') {
                return savedLang;
            }
        } catch (error) {}

        const browserLang = String(navigator.language || navigator.userLanguage || '').toLowerCase();
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }

    function getLocaleName() {
        return currentLang === 'zh' ? 'zh-CN' : 'en-US';
    }

    function getCopy() {
        return UI_COPY[currentLang] || UI_COPY.zh;
    }

    function getLocalizedRaw(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value[currentLang] || value.zh || value.en || '';
        return String(value);
    }

    function getLocalizedText(value) {
        return decodeHtmlEntities(getLocalizedRaw(value));
    }

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    function saveJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {}
    }

    function formatCompact(value) {
        const number = Number(value) || 0;
        const locale = getLocaleName();
        if (number >= 1000000000) return `${(number / 1000000000).toFixed(1)}B`;
        if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
        if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
        return Math.floor(number).toLocaleString(locale);
    }

    function getMiningSummary() {
        const payload = loadJson(MINING_SAVE_KEY, null);
        if (!payload || typeof payload !== 'object') return null;

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
        const base = { visits: 0, lastGameId: 'mining', gameOpens: {}, interestedGameIds: [] };
        const profile = loadJson(HUB_PROFILE_KEY, base);
        profile.visits = Math.max(0, Number(profile.visits) || 0) + 1;
        profile.lastGameId = String(profile.lastGameId || 'mining');
        profile.gameOpens = profile.gameOpens && typeof profile.gameOpens === 'object' ? profile.gameOpens : {};
        profile.interestedGameIds = Array.isArray(profile.interestedGameIds) ? profile.interestedGameIds : [];
        saveJson(HUB_PROFILE_KEY, profile);
        return profile;
    }

    function markGameOpen(profile, gameId) {
        if (!profile) return;
        profile.lastGameId = gameId;
        profile.gameOpens[gameId] = Math.max(0, Number(profile.gameOpens[gameId]) || 0) + 1;
        if (!profile.interestedGameIds.includes(gameId) && gameId !== 'mining') {
            profile.interestedGameIds.push(gameId);
        }
        saveJson(HUB_PROFILE_KEY, profile);
    }

    function setText(id, value) {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    }

    function setHtml(id, value) {
        const node = document.getElementById(id);
        if (node) node.innerHTML = value;
    }

    function buildMetaChip(text) {
        return `<span class="meta-chip">${text}</span>`;
    }

    function formatOpenedMeta(count) {
        return getCopy().openedTemplate.replace('{count}', count);
    }

    function applyStaticCopy() {
        const copy = getCopy();
        const meta = document.getElementById('hubMetaDescription');
        const closeButton = document.getElementById('closeHubModal');

        document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
        document.title = getLocalizedText(copy.docTitle);
        if (meta) meta.setAttribute('content', getLocalizedText(copy.metaDescription));

        STATIC_TEXT_KEYS.forEach((key) => setText(key, getLocalizedText(copy[key])));
        STATIC_HTML_KEYS.forEach((key) => setHtml(key, getLocalizedRaw(copy[key])));

        if (closeButton) {
            closeButton.setAttribute('aria-label', getLocalizedText(copy.modalCloseLabel));
            closeButton.setAttribute('title', getLocalizedText(copy.modalCloseLabel));
            closeButton.innerHTML = '&times;';
        }
    }

    function renderFeaturedGame(miningSummary) {
        const node = document.getElementById('featuredGameCard');
        const mining = GAME_CATALOG.find((game) => game.id === 'mining');
        const copy = getCopy();
        if (!node || !mining) return;

        const progressChips = miningSummary
            ? [
                `${getLocalizedText(copy.coinsChip)} ${formatCompact(miningSummary.coins)}`,
                `${getLocalizedText(copy.powerChip)} ${formatCompact(miningSummary.power)}`,
                `${getLocalizedText(copy.t4Chip)} ${miningSummary.t4Count}`,
                `${getLocalizedText(copy.levelChip)} ${miningSummary.level}`
            ]
            : [getLocalizedText(copy.newPlayerEntry), getLocalizedText(copy.readyToPlay)];

        node.innerHTML = `
            <div class="featured-visual">
                <div class="featured-cover"${mining.cover ? ` style="background-image:url('${mining.cover}')"` : ''}></div>
                <div class="featured-icon" style="color:${mining.accent}; box-shadow: inset 0 0 0 1px ${mining.accent}33;">
                    ${mining.icon}
                </div>
            </div>
            <div class="featured-content">
                <span class="status-pill live">${getLocalizedText(mining.badge)}</span>
                <div>
                    <h4 class="featured-title">${getLocalizedText(mining.title)}</h4>
                    <div class="game-subtitle">${getLocalizedText(mining.subtitle)} | ${getLocalizedText(mining.genre)}</div>
                </div>
                <div class="featured-desc">${getLocalizedText(mining.description)}</div>
                <div class="featured-meta">${progressChips.map(buildMetaChip).join('')}</div>
                <div class="game-tags">${(Array.isArray(mining.tags) ? mining.tags : []).map((tag) => buildMetaChip(getLocalizedText(tag))).join('')}</div>
                <div class="hero-actions">
                    <a class="primary-btn" href="${mining.href}" data-game-link="${mining.id}">${getLocalizedText(copy.enterMainGame)}</a>
                    <a class="ghost-btn" href="/games/coming-soon/?id=gem-forge" data-game-link="gem-forge">${getLocalizedText(copy.nextGame)}</a>
                </div>
            </div>
        `;
    }

    function renderGameGrid(profile) {
        const node = document.getElementById('gameGrid');
        const copy = getCopy();
        if (!node) return;

        node.innerHTML = GAME_CATALOG.map((game) => {
            const openCount = Math.max(0, Number(profile?.gameOpens?.[game.id]) || 0);
            const badgeClass = game.status === 'live' ? 'live' : 'soon';
            const ctaLabel = game.status === 'live' ? getLocalizedText(copy.playNow) : getLocalizedText(copy.viewPlaceholder);

            return `
                <a class="game-card ${game.status}" href="${game.href}" data-game-link="${game.id}" style="--card-accent:${game.accent};">
                    ${game.cover ? `<div class="game-cover" style="background-image:url('${game.cover}')"></div>` : ''}
                    <div class="game-card-header">
                        <div class="game-icon" style="color:${game.accent};">${game.icon}</div>
                        <span class="status-pill ${badgeClass}">${getLocalizedText(game.badge)}</span>
                    </div>
                    <div>
                        <h4 class="game-title">${getLocalizedText(game.title)}</h4>
                        <div class="game-subtitle">${getLocalizedText(game.subtitle)}</div>
                    </div>
                    <div class="game-meta">${getLocalizedText(game.genre)} | ${getLocalizedText(formatOpenedMeta(openCount))}</div>
                    <div class="game-desc">${getLocalizedText(game.description)}</div>
                    <div class="game-tags">${(Array.isArray(game.tags) ? game.tags : []).map((tag) => buildMetaChip(getLocalizedText(tag))).join('')}</div>
                    <span class="game-cta">${ctaLabel}</span>
                </a>
            `;
        }).join('');
    }

    function openModal() {
        const node = document.getElementById('hubModal');
        if (node) node.hidden = false;
    }

    function closeModal() {
        const node = document.getElementById('hubModal');
        if (node) node.hidden = true;
    }

    function updateLangButtons() {
        document.querySelectorAll('[data-lang-switch]').forEach((button) => {
            const lang = button.getAttribute('data-lang-switch');
            button.classList.toggle('is-active', lang === currentLang);
            button.setAttribute('aria-pressed', lang === currentLang ? 'true' : 'false');
        });
    }

    function renderSummary(profile, miningSummary) {
        const liveCount = GAME_CATALOG.filter((game) => game.status === 'live').length;
        const locale = getLocaleName();
        const copy = getCopy();
        const lastPlayed = GAME_CATALOG.find((game) => game.id === profile.lastGameId) || GAME_CATALOG[0];

        setText('hubVisits', (Number(profile.visits) || 0).toLocaleString(locale));
        setText('liveGameCount', `${liveCount} / ${GAME_CATALOG.length}`);
        setText('miningCoins', miningSummary ? formatCompact(miningSummary.coins) : getLocalizedText(copy.notStarted));
        setText('miningPower', miningSummary ? formatCompact(miningSummary.power) : getLocalizedText(copy.notStarted));
        setText('miningTier4', miningSummary ? `${miningSummary.t4Count}` : '0');
        setText('lastPlayedGame', lastPlayed ? getLocalizedText(lastPlayed.title) : getLocalizedText(copy.lastPlayedFallback));
    }

    function bindDynamicActions(profile) {
        document.querySelectorAll('[data-game-link]').forEach((link) => {
            if (link.dataset.gameLinkBound === '1') return;
            link.dataset.gameLinkBound = '1';
            link.addEventListener('click', () => {
                markGameOpen(profile, link.getAttribute('data-game-link') || 'mining');
            });
        });
    }

    function renderHub() {
        if (!activeProfile) return;
        applyStaticCopy();
        updateLangButtons();
        renderSummary(activeProfile, activeMiningSummary);
        renderFeaturedGame(activeMiningSummary);
        renderGameGrid(activeProfile);
        bindDynamicActions(activeProfile);
    }

    function setLanguage(lang) {
        currentLang = lang === 'zh' ? 'zh' : 'en';
        try {
            localStorage.setItem(HUB_LANG_KEY, currentLang);
        } catch (error) {}
        renderHub();
    }

    function bindStaticActions() {
        const helpBtn = document.getElementById('howItWorksBtn');
        const closeBtn = document.getElementById('closeHubModal');
        const modal = document.getElementById('hubModal');

        if (helpBtn) helpBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) closeModal();
            });
        }
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeModal();
        });
        document.querySelectorAll('[data-lang-switch]').forEach((button) => {
            button.addEventListener('click', () => {
                const nextLang = button.getAttribute('data-lang-switch') || 'zh';
                if (nextLang !== currentLang) setLanguage(nextLang);
            });
        });
    }

    function initHubPage() {
        activeProfile = loadHubProfile();
        activeMiningSummary = getMiningSummary();
        bindStaticActions();
        renderHub();
        closeModal();
    }

    if (document.getElementById('gameGrid')) {
        initHubPage();
    }
}());
