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
               "browseGamesBtn":  "\u67e5\u770b\u6e38\u620f",
               "pulseEyebrow":  "\u5927\u5385\u52a8\u6001",
               "pulseTitle":  "\u4eca\u65e5\u70ed\u95e8\u8def\u7ebf",
               "pulseCard1Label":  "\u6316\u77ff\u51b2\u699c",
               "pulseCard1Value":  "\u70b9\u51fb / \u5347\u7ea7 / \u51b2\u699c",
               "pulseCard2Label":  "\u5b9d\u77f3\u731c\u53d6",
               "pulseCard2Value":  "T4 \u7a00\u6709\u6389\u843d\u8ffd\u8e2a",
               "pulseCard3Label":  "\u540e\u7eed\u5f00\u653e",
               "upcomingCountTemplate":  "\u8fd8\u6709 {count} \u4e2a\u5165\u53e3\u5f85\u5f00\u653e",
               "assetCard1Body":  "\u5efa\u8bae\u89c4\u683c\uff1a\u003ccode\u003e512x512\u003c/code\u003e \u900f\u660e PNG \u6216 SVG\u3002",
               "modalEyebrow":  "\u65b9\u6848\u8bf4\u660e",
               "catalogEyebrow":  "\u6e38\u620f\u76ee\u5f55",
               "buildCard1Title":  "\u5927\u5385\u5148\u884c",
               "labelT4Gems":  "T4 \u5b9d\u77f3",
               "modalLine5":  "\u70b9\u51fb\u53f3\u4e0a\u89d2\u6216\u7a7a\u767d\u533a\u57df\u53ef\u5173\u95ed",
               "playNow":  "\u7acb\u5373\u8fdb\u5165",
               "liveCardHint":  "\u5f53\u524d\u53ef\u76f4\u63a5\u8fdb\u5165",
               "soonCardHint":  "\u9884\u544a\u5165\u53e3\uff0c\u5373\u5c06\u5f00\u653e",
               "buildCard2Body":  "\u6bcf\u4e2a\u6e38\u620f\u5148\u7528 \u003ccode\u003elocalStorage\u003c/code\u003e \u5b58\u6863\u3002\u5927\u5385\u5728\u540c\u57df\u540d\u4e0b\u53ef\u4ee5\u8bfb\u53d6\u8fd9\u4e9b\u6570\u636e\u3002",
               "assetCard4Body":  "\u4e3b\u9875\u5165\u53e3\u3001\u6392\u884c\u3001\u4efb\u52a1\u3001\u5546\u5e97\u3001\u901a\u884c\u8bc1\u3001\u6d3b\u52a8\u90fd\u9700\u8981\u7edf\u4e00\u56fe\u6807\u4f53\u7cfb\u3002",
               "catalogHeading":  "\u9009\u62e9\u4f60\u7684\u6e38\u620f",
               "pageTitle":  "\u521b\u4e16\u6e38\u620f\u5927\u5385",
               "assetCard1Title":  "\u5927\u5385 Logo",
               "buildCard3Body":  "\u4f60\u4ecd\u7136\u4f7f\u7528 \u003ccode\u003eGitHub -\u0026gt; Vercel\u003c/code\u003e \u81ea\u52a8\u53d1\u5e03\u6d41\u7a0b\u3002",
               "heroDescription":  "\u8fdb\u5165\u6316\u77ff\u4e3b\u7ebf\uff0c\u8ffd\u9010\u6392\u884c\u699c\uff0c\u6536\u96c6\u7a00\u6709\u5b9d\u77f3\uff0c\u5e76\u63a2\u7d22\u66f4\u591a\u5373\u5c06\u5f00\u653e\u7684\u73a9\u6cd5\u3002",
               "featuredBody":  "\u70b9\u51fb\u7b97\u529b\u6838\u5fc3\uff0c\u63d0\u5347\u4f60\u7684\u6316\u77ff\u6548\u7387\uff0c\u6536\u96c6\u5b9d\u77f3\uff0c\u5e76\u5411\u6392\u884c\u699c\u9876\u70b9\u53d1\u8d77\u51b2\u523a\u3002",
               "assetCard6Title":  "\u7279\u6548\u7d20\u6750",
               "modalBody":  "\u8fd9\u4e2a\u5927\u5385\u6682\u65f6\u4e0d\u4f9d\u8d56\u4ed8\u8d39\u6570\u636e\u5e93\u3002\u5b83\u8d1f\u8d23\u5bfc\u822a\u3001\u8bfb\u53d6\u5404\u4e2a\u6e38\u620f\u7684\u672c\u5730\u5b58\u6863\uff0c\u8ba9\u4f60\u53ef\u4ee5\u5148\u628a 10 \u4e2a\u6e38\u620f\u5165\u53e3\u642d\u8d77\u6765\uff0c\u518d\u4e00\u4e2a\u4e00\u4e2a\u586b\u5145\u771f\u6b63\u7684\u6e38\u620f\u5185\u5bb9\u3002",
               "featuredEyebrow":  "\u70ed\u95e8\u63a8\u8350",
               "assetCard4Title":  "\u56fe\u6807\u5305",
               "heroStatus":  "\u70ed\u95e8\u5165\u53e3",
               "modalLine3":  "3. \u5176\u4ed6\u6e38\u620f\u5148\u7528\u5360\u4f4d\u9875",
               "labelMiningPower":  "\u6316\u77ff\u7b97\u529b",
               "modalCloseLabel":  "\u5173\u95ed",
               "buildPlanEyebrow":  "\u642d\u5efa\u65b9\u6848",
               "modalLine1":  "1. \u003ccode\u003eindex.html\u003c/code\u003e \u505a\u5927\u5385\u9996\u9875",
               "openedTemplate":  "\u5df2\u6253\u5f00 {count} \u6b21",
               "modalLine4":  "4. \u5171\u7528\u6210\u957f\u5148\u57fa\u4e8e \u003ccode\u003elocalStorage\u003c/code\u003e",
               "catalogNote":  "\u5df2\u5f00\u653e\u7684\u6e38\u620f\u53ef\u4ee5\u7acb\u5373\u8fdb\u5165\uff0c\u66f4\u591a\u5165\u53e3\u4f1a\u968f\u540e\u9646\u7eed\u5f00\u653e\u3002",
               "levelChip":  "\u7b49\u7ea7",
               "assetCard3Body":  "\u5efa\u8bae\u4e3b\u9898\uff1a\u8d5b\u535a\u3001\u80fd\u6e90\u6838\u5fc3\u3001\u79d1\u6280\u673a\u623f\u3001\u9713\u8679\u8857\u673a\u98ce\u683c\u3002",
               "modalLine2":  "2. \u003ccode\u003egames/mining/\u003c/code\u003e \u653e\u6316\u77ff\u6e38\u620f",
               "enterMainGame":  "\u8fdb\u5165\u6316\u77ff",
               "newPlayerEntry":  "\u65b0\u73a9\u5bb6\u5165\u53e3",
               "notStarted":  "\u672a\u5f00\u59cb",
               "t4Chip":  "T4 \u5b9d\u77f3",
               "buildCard3Title":  "\u514d\u8d39\u53d1\u5e03",
               "labelMiningCoins":  "\u6316\u77ff\u91d1\u5e01",
               "labelHubVisits":  "\u8fdb\u5165\u6b21\u6570",
               "docTitle":  "\u521b\u4e16\u6e38\u620f\u5927\u5385",
               "metaDescription":  "Genesis Arcade - \u8fdb\u5165\u6316\u77ff\uff0c\u67e5\u770b\u8fdb\u5ea6\uff0c\u5e76\u63a2\u7d22\u66f4\u591a\u6e38\u620f\u5165\u53e3\u3002",
               "readyToPlay":  "\u53ef\u7acb\u5373\u5f00\u59cb",
               "assetsEyebrow":  "UI \u7d20\u6750\u6e05\u5355",
               "buildCard4Body":  "\u7b49\u4f60\u771f\u7684\u9700\u8981\u8de8\u8bbe\u5907\u540c\u6b65\u65f6\uff0c\u518d\u8865\u6700\u8f7b\u91cf\u7684\u6570\u636e\u5c42\u3002",
               "buildPlanHeading":  "\u4e3a\u4ec0\u4e48\u4e0d\u4e70\u6570\u636e\u5e93\u4e5f\u80fd\u5148\u8dd1\u8d77\u6765",
               "assetCard3Title":  "\u5927\u5385\u80cc\u666f",
               "assetCard5Title":  "\u97f3\u6548\u5305",
               "assetsHeading":  "\u4f60\u540e\u7eed\u53ef\u4ee5\u51c6\u5907\u7684\u7d20\u6750",
               "saveModeNote":  "\u8fd9\u91cc\u4f1a\u663e\u793a\u4f60\u7684\u8fd1\u671f\u8fdb\u5ea6\u4e0e\u70ed\u95e8\u5165\u53e3\uff0c\u65b9\u4fbf\u4f60\u968f\u65f6\u56de\u6765\u7ee7\u7eed\u6311\u6218\u3002",
               "labelLastPlayed":  "\u6700\u8fd1\u6e38\u73a9",
               "labelLiveGames":  "\u5df2\u5f00\u653e\u6e38\u620f",
               "lastPlayedFallback":  "\u521b\u4e16\u6316\u77ff\u533a",
               "featuredHeading":  "\u5f53\u524d\u70ed\u95e8\u5165\u53e3",
               "viewPlaceholder":  "\u656c\u8bf7\u671f\u5f85",
               "buildCard4Title":  "\u540e\u7eed\u6269\u5c55",
               "heroTitle":  "\u9009\u62e9\u4e00\u4e2a\u6e38\u620f\uff0c\u7acb\u5373\u5f00\u59cb\u6311\u6218",
               "continueMiningBtn":  "\u8fdb\u5165\u6316\u77ff",
               "assetCard5Body":  "\u70b9\u51fb\u3001\u9886\u5956\u3001\u5408\u6210\u3001\u786e\u8ba4\u3001\u83dc\u5355\u3001BGM \u5efa\u8bae\u7edf\u4e00\u4e3a\u79d1\u5e7b\u7535\u5b50\u98ce\u3002",
               "pageSubcopy":  "\u8fdb\u5165\u521b\u4e16\u5c0f\u6e38\u620f\u5927\u5385\uff0c\u67e5\u770b\u70ed\u95e8\u5165\u53e3\u4e0e\u4e2a\u4eba\u8fdb\u5ea6\uff0c\u968f\u65f6\u5f00\u542f\u6311\u6218\u3002",
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
               "browseGamesBtn":  "Browse Games",
               "pulseEyebrow":  "Arcade Pulse",
               "pulseTitle":  "Today's Hot Routes",
               "pulseCard1Label":  "Mining Sprint",
               "pulseCard1Value":  "Tap / Upgrade / Climb",
               "pulseCard2Label":  "Gem Hunt",
               "pulseCard2Value":  "Rare T4 Chase",
               "pulseCard3Label":  "Next Unlocks",
               "upcomingCountTemplate":  "{count} more entries on the way",
               "assetCard1Body":  "Suggested size: \u003ccode\u003e512x512\u003c/code\u003e, transparent PNG or SVG.",
               "modalEyebrow":  "Plan Notes",
               "catalogEyebrow":  "Game Catalog",
               "buildCard1Title":  "Hub First",
               "labelT4Gems":  "T4 Gems",
               "modalLine5":  "Click the top-right button or outside area to close",
               "playNow":  "Play Now",
               "liveCardHint":  "Open now and ready to enter",
               "soonCardHint":  "Preview entry, unlocking soon",
               "buildCard2Body":  "Each game saves with \u003ccode\u003elocalStorage\u003c/code\u003e, and the hub reads those values on the same domain.",
               "assetCard4Body":  "Home entry, ranking, missions, shop, pass, and events should share one icon system.",
               "catalogHeading":  "Choose Your Game",
               "pageTitle":  "Genesis Arcade",
               "assetCard1Title":  "Hub Logo",
               "buildCard3Body":  "You still deploy through the same \u003ccode\u003eGitHub -\u0026gt; Vercel\u003c/code\u003e auto-publish flow.",
               "heroDescription":  "Dive into mining, chase leaderboards, collect rare gems, and explore more games as they go live.",
               "featuredBody":  "Tap the core, boost your mining output, collect gems, and make your push toward the top of the leaderboard.",
               "assetCard6Title":  "FX Assets",
               "modalBody":  "This hub does not depend on a paid database for now. It handles navigation, reads local saves, and lets you build out 10 game entrances first.",
               "featuredEyebrow":  "Featured Game",
               "assetCard4Title":  "Icon Pack",
               "heroStatus":  "Featured Now",
               "modalLine3":  "3. Placeholders first for upcoming games",
               "labelMiningPower":  "Mining Power",
               "modalCloseLabel":  "Close",
               "buildPlanEyebrow":  "Build Plan",
               "modalLine1":  "1. \u003ccode\u003eindex.html\u003c/code\u003e hub homepage",
               "openedTemplate":  "Opened {count} times",
               "modalLine4":  "4. Shared local progress with \u003ccode\u003elocalStorage\u003c/code\u003e",
               "catalogNote":  "Available games can be played now. More entries will open over time.",
               "levelChip":  "Level",
               "assetCard3Body":  "Suggested themes: cyber, reactor core, tech chamber, or neon arcade.",
               "modalLine2":  "2. \u003ccode\u003egames/mining/\u003c/code\u003e mining game route",
               "enterMainGame":  "Enter Mining",
               "newPlayerEntry":  "New Player Entry",
               "notStarted":  "Not Started",
               "t4Chip":  "T4 Gems",
               "buildCard3Title":  "Free Deployment",
               "labelMiningCoins":  "Mining Coins",
               "labelHubVisits":  "Visits",
               "docTitle":  "Genesis Arcade",
               "metaDescription":  "Genesis Arcade - Jump into mining, track your progress, and explore more games.",
               "readyToPlay":  "Ready To Start",
               "assetsEyebrow":  "UI Assets",
               "buildCard4Body":  "Add a lightweight data layer later only when you truly need cross-device sync.",
               "buildPlanHeading":  "Why It Works Without Paid Backend",
               "assetCard3Title":  "Hub Background",
               "assetCard5Title":  "Audio Pack",
               "assetsHeading":  "Assets To Prepare Next",
               "saveModeNote":  "Your recent progress and hot entries are shown here so you can jump back in anytime.",
               "labelLastPlayed":  "Last Played",
               "labelLiveGames":  "Live Games",
               "lastPlayedFallback":  "Genesis Mining Zone",
               "featuredHeading":  "Hot Pick",
               "viewPlaceholder":  "Coming Soon",
               "buildCard4Title":  "Expand Later",
               "heroTitle":  "Choose a Game and Start Your Run",
               "continueMiningBtn":  "Enter Mining",
               "assetCard5Body":  "Tap, reward, fusion, confirm, menu, and BGM should follow one sci-fi electronic style.",
               "pageSubcopy":  "Jump into featured games, track your progress, and explore the Genesis arcade universe.",
               "assetCard6Body":  "Later you can add badge frames, glow textures, trophies, and particle overlays.",
               "modalTitle":  "Static-first Architecture",
               "buildCard2Title":  "Local Save"
           }
};

    const STATIC_TEXT_KEYS = [
        'pageTitle', 'topContinueBtn', 'browseGamesBtn', 'heroStatus', 'heroTitle', 'continueMiningBtn',
        'labelHubVisits', 'labelLiveGames', 'labelMiningCoins', 'labelMiningPower', 'labelT4Gems', 'labelLastPlayed',
        'featuredEyebrow', 'featuredHeading', 'catalogEyebrow', 'catalogHeading',
        'pulseEyebrow', 'pulseTitle', 'pulseCard1Label', 'pulseCard1Value', 'pulseCard2Label', 'pulseCard2Value', 'pulseCard3Label'
    ];

    const STATIC_HTML_KEYS = [
        'pageSubcopy', 'heroDescription', 'saveModeNote', 'catalogNote'
    ];

    let currentLang = getInitialLang();
    let activeProfile = null;
    let activeMiningSummary = null;
    let hubRenderFrameId = 0;

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
        const topContinueBtn = document.getElementById('topContinueBtn');

        document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
        document.title = getLocalizedText(copy.docTitle);
        if (meta) meta.setAttribute('content', getLocalizedText(copy.metaDescription));

        STATIC_TEXT_KEYS.forEach((key) => setText(key, getLocalizedText(copy[key])));
        STATIC_HTML_KEYS.forEach((key) => setHtml(key, getLocalizedRaw(copy[key])));

        if (topContinueBtn) {
            topContinueBtn.textContent = window.innerWidth <= 420
                ? (currentLang === 'zh' ? '继续' : 'Go')
                : getLocalizedText(copy.topContinueBtn);
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
                <div class="featured-desc">${getLocalizedText(copy.featuredBody)}</div>
                <div class="featured-meta">${progressChips.map(buildMetaChip).join('')}</div>
                <div class="hero-actions">
                    <a class="primary-btn" href="${mining.href}" data-game-link="${mining.id}">${getLocalizedText(copy.enterMainGame)}</a>
                    <a class="ghost-btn" href="#gameCatalogSection">${getLocalizedText(copy.browseGamesBtn)}</a>
                </div>
            </div>
        `;
    }

    function renderGameGrid(profile) {
        const node = document.getElementById('gameGrid');
        const copy = getCopy();
        if (!node) return;

        node.innerHTML = GAME_CATALOG.map((game) => {
            const badgeClass = game.status === 'live' ? 'live' : 'soon';
            const ctaLabel = game.status === 'live' ? getLocalizedText(copy.playNow) : getLocalizedText(copy.viewPlaceholder);
            const statusHint = game.status === 'live' ? getLocalizedText(copy.liveCardHint) : getLocalizedText(copy.soonCardHint);

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
                    <div class="game-meta">${getLocalizedText(game.genre)}</div>
                    <div class="game-desc">${statusHint}</div>
                    <span class="game-cta">${ctaLabel}</span>
                </a>
            `;
        }).join('');
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
        const upcomingCount = GAME_CATALOG.filter((game) => game.status !== 'live').length;
        const locale = getLocaleName();
        const copy = getCopy();
        const lastPlayed = GAME_CATALOG.find((game) => game.id === profile.lastGameId) || GAME_CATALOG[0];

        setText('hubVisits', (Number(profile.visits) || 0).toLocaleString(locale));
        setText('liveGameCount', `${liveCount}`);
        setText('miningCoins', miningSummary ? formatCompact(miningSummary.coins) : getLocalizedText(copy.notStarted));
        setText('miningPower', miningSummary ? formatCompact(miningSummary.power) : getLocalizedText(copy.notStarted));
        setText('miningTier4', miningSummary ? `${miningSummary.t4Count}` : '0');
        setText('lastPlayedGame', lastPlayed ? getLocalizedText(lastPlayed.title) : getLocalizedText(copy.lastPlayedFallback));
        setText('upcomingGameCount', getLocalizedText(copy.upcomingCountTemplate).replace('{count}', upcomingCount));
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

    function queueRenderHub() {
        if (hubRenderFrameId) {
            return;
        }

        hubRenderFrameId = window.requestAnimationFrame(() => {
            hubRenderFrameId = 0;
            renderHub();
        });
    }

    function setLanguage(lang) {
        currentLang = lang === 'zh' ? 'zh' : 'en';
        try {
            localStorage.setItem(HUB_LANG_KEY, currentLang);
        } catch (error) {}
        queueRenderHub();
    }

    function bindStaticActions() {
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
        window.addEventListener('resize', queueRenderHub, { passive: true });
        renderHub();
    }

    if (document.getElementById('gameGrid')) {
        initHubPage();
    }
}());
