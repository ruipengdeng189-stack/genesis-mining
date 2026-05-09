(function (global) {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function safeNumber(value, fallback) {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

    function createSilentEngine() {
        return {
            play() { return false; },
            toggle() { return false; },
            setEnabled() { return false; },
            isEnabled() { return false; },
            syncToggle(button, labels = {}) {
                if (!button) return;
                button.textContent = labels.off || 'SFX OFF';
                button.setAttribute('aria-pressed', 'false');
                button.disabled = true;
            }
        };
    }

    function readEnabled(storageKey, defaultEnabled) {
        try {
            const stored = global.localStorage.getItem(storageKey);
            if (stored === '0') return false;
            if (stored === '1') return true;
        } catch (error) {}
        return !!defaultEnabled;
    }

    function createEngine(options = {}) {
        const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
        if (!AudioContextCtor) return createSilentEngine();

        const storageKey = String(options.storageKey || 'genesis_sfx_enabled_v1');
        const defaultEnabled = options.defaultEnabled !== false;
        const masterVolume = clamp(safeNumber(options.volume, 1), 0.1, 1.4);
        const cooldowns = new Map();
        let enabled = readEnabled(storageKey, defaultEnabled);
        let context = null;
        let noiseBuffer = null;

        function persistEnabled() {
            try {
                global.localStorage.setItem(storageKey, enabled ? '1' : '0');
            } catch (error) {}
        }

        function ensureContext() {
            if (!enabled) return null;
            if (!context) context = new AudioContextCtor();
            if (context.state === 'suspended') context.resume().catch(() => {});
            return context;
        }

        function nowMs() {
            return global.performance && typeof global.performance.now === 'function'
                ? global.performance.now()
                : Date.now();
        }

        function passCooldown(key, cooldownMs) {
            const limit = Math.max(0, safeNumber(cooldownMs, 0));
            if (!key || limit <= 0) return true;
            const stamp = nowMs();
            const previous = cooldowns.get(key) || 0;
            if (stamp - previous < limit) return false;
            cooldowns.set(key, stamp);
            return true;
        }

        function getNoiseBuffer(ctx) {
            if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
            const duration = 0.35;
            const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
            const channel = buffer.getChannelData(0);
            for (let index = 0; index < channel.length; index += 1) {
                channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
            }
            noiseBuffer = buffer;
            return noiseBuffer;
        }

        function connectWithPan(node, pan = 0) {
            const ctx = node.context;
            if (!ctx.createStereoPanner) {
                node.connect(ctx.destination);
                return;
            }
            const panner = ctx.createStereoPanner();
            panner.pan.value = clamp(safeNumber(pan, 0), -1, 1);
            node.connect(panner);
            panner.connect(ctx.destination);
        }

        function tone(opts = {}) {
            const ctx = ensureContext();
            if (!ctx) return false;

            const startAt = ctx.currentTime + Math.max(0, safeNumber(opts.delay, 0));
            const duration = Math.max(0.02, safeNumber(opts.duration, 0.08));
            const attack = Math.min(duration * 0.45, Math.max(0.002, safeNumber(opts.attack, 0.004)));
            const release = Math.min(duration * 0.9, Math.max(0.01, safeNumber(opts.release, duration * 0.8)));
            const volume = clamp(safeNumber(opts.gain, 0.03) * masterVolume, 0.0005, 0.18);
            const baseFreq = Math.max(40, safeNumber(opts.freq, 440));
            const endFreq = Math.max(28, safeNumber(opts.toFreq, baseFreq));

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = opts.type || 'triangle';
            oscillator.frequency.setValueAtTime(baseFreq, startAt);
            if (endFreq !== baseFreq) {
                oscillator.frequency.exponentialRampToValueAtTime(endFreq, startAt + duration);
            }
            const detune = safeNumber(opts.detune, 0);
            if (detune) oscillator.detune.value = detune;

            gainNode.gain.setValueAtTime(0.0001, startAt);
            gainNode.gain.linearRampToValueAtTime(volume, startAt + attack);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + release);

            oscillator.connect(gainNode);
            connectWithPan(gainNode, opts.pan);
            oscillator.start(startAt);
            oscillator.stop(startAt + duration + 0.03);
            return true;
        }

        function noise(opts = {}) {
            const ctx = ensureContext();
            if (!ctx) return false;

            const startAt = ctx.currentTime + Math.max(0, safeNumber(opts.delay, 0));
            const duration = Math.max(0.02, safeNumber(opts.duration, 0.12));
            const volume = clamp(safeNumber(opts.gain, 0.02) * masterVolume, 0.0005, 0.16);
            const source = ctx.createBufferSource();
            source.buffer = getNoiseBuffer(ctx);

            const filter = ctx.createBiquadFilter();
            filter.type = opts.filterType || 'bandpass';
            filter.frequency.value = Math.max(120, safeNumber(opts.freq, 1200));
            filter.Q.value = clamp(safeNumber(opts.q, 1.4), 0.1, 18);

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(volume, startAt);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

            source.connect(filter);
            filter.connect(gainNode);
            connectWithPan(gainNode, opts.pan);
            source.start(startAt);
            source.stop(startAt + duration + 0.02);
            return true;
        }

        function pulse(freq, delay, gain, type, toFreq) {
            tone({
                freq,
                toFreq: toFreq || freq,
                delay,
                duration: 0.08,
                gain,
                type: type || 'triangle'
            });
        }

        function chord(notes, options = {}) {
            const baseDelay = safeNumber(options.delay, 0);
            const gain = safeNumber(options.gain, 0.025);
            notes.forEach((note, index) => {
                tone({
                    freq: note,
                    delay: baseDelay + index * safeNumber(options.stagger, 0.016),
                    duration: safeNumber(options.duration, 0.18),
                    gain,
                    type: options.type || 'triangle',
                    toFreq: safeNumber(options.toFreq, note)
                });
            });
        }

        function playBattleStart() {
            tone({ freq: 150, toFreq: 260, duration: 0.2, gain: 0.05, type: 'sawtooth' });
            tone({ freq: 360, toFreq: 620, delay: 0.05, duration: 0.15, gain: 0.03, type: 'triangle' });
            noise({ freq: 1560, duration: 0.06, gain: 0.01 });
        }

        function playVictory() {
            chord([392, 523, 659], { gain: 0.032, duration: 0.24, stagger: 0.045, type: 'triangle' });
            tone({ freq: 784, delay: 0.18, duration: 0.16, gain: 0.028, type: 'sine' });
        }

        function playDefeat() {
            tone({ freq: 440, toFreq: 280, duration: 0.16, gain: 0.038, type: 'sawtooth' });
            tone({ freq: 280, toFreq: 160, delay: 0.08, duration: 0.22, gain: 0.034, type: 'triangle' });
            noise({ freq: 420, filterType: 'lowpass', duration: 0.14, gain: 0.012 });
        }

        function playMatch(payload = {}) {
            const size = Math.max(3, safeNumber(payload.size, 3));
            const lift = Math.min(5, size - 3);
            pulse(560 + lift * 26, 0, 0.02 + lift * 0.003, 'triangle', 640 + lift * 28);
            pulse(760 + lift * 28, 0.04, 0.022 + lift * 0.003, 'triangle', 900 + lift * 30);
            pulse(980 + lift * 32, 0.08, 0.024 + lift * 0.004, 'sine', 1120 + lift * 34);
        }

        function play(name, payload = {}) {
            if (!enabled) return false;

            const cooldownMap = {
                select: 24,
                confirm: 80,
                error: 90,
                battleStart: 260,
                wave: 240,
                bossWarning: 480,
                shoot: 92,
                enemyShoot: 180,
                hit: 72,
                shieldHit: 120,
                enemyDown: 90,
                bossDown: 540,
                skillReady: 360,
                skillEmp: 280,
                skillOverclock: 220,
                skillShield: 220,
                ultimate: 520,
                upgrade: 180,
                victory: 600,
                defeat: 600,
                swap: 80,
                noMatch: 220,
                match: 120,
                cascade: 180,
                goal: 100,
                drop: 110,
                forgeStart: 180,
                forgeResult: 180,
                relic: 540,
                fuse: 240,
                awaken: 420,
                salvage: 180,
                purchase: 160
            };

            const cooldownKey = payload.cooldownKey || name;
            const cooldownMs = payload.cooldownMs ?? cooldownMap[name] ?? 80;
            if (!passCooldown(cooldownKey, cooldownMs)) return false;

            switch (name) {
                case 'select':
                    tone({ freq: 620, toFreq: 760, duration: 0.05, gain: 0.02, type: 'triangle', pan: safeNumber(payload.pan, 0) });
                    break;
                case 'confirm':
                    pulse(560, 0, 0.02, 'triangle', 700);
                    pulse(880, 0.045, 0.026, 'sine', 1040);
                    break;
                case 'error':
                    tone({ freq: 240, toFreq: 132, duration: 0.14, gain: 0.03, type: 'square' });
                    noise({ freq: 320, filterType: 'lowpass', duration: 0.09, gain: 0.009 });
                    break;
                case 'battleStart':
                    playBattleStart();
                    break;
                case 'wave':
                    pulse(240, 0, 0.028, 'sawtooth', 300);
                    pulse(420, 0.06, 0.022, 'triangle', 540);
                    pulse(760, 0.12, 0.014, 'sine', 920);
                    break;
                case 'bossWarning':
                    tone({ freq: 300, toFreq: 210, duration: 0.16, gain: 0.03, type: 'sawtooth' });
                    tone({ freq: 220, toFreq: 340, delay: 0.12, duration: 0.22, gain: 0.026, type: 'square' });
                    noise({ freq: 1320, duration: 0.16, gain: 0.012 });
                    break;
                case 'shoot':
                    tone({
                        freq: safeNumber(payload.freq, 860),
                        toFreq: safeNumber(payload.toFreq, 620),
                        duration: safeNumber(payload.duration, 0.035),
                        gain: safeNumber(payload.gain, 0.0115),
                        type: payload.type || 'square',
                        pan: safeNumber(payload.pan, 0)
                    });
                    break;
                case 'enemyShoot':
                    tone({ freq: 260, toFreq: 180, duration: 0.07, gain: 0.017, type: 'sawtooth', pan: safeNumber(payload.pan, 0) });
                    noise({ freq: 760, duration: 0.04, gain: 0.004, pan: safeNumber(payload.pan, 0) });
                    break;
                case 'hit':
                    tone({ freq: 220, toFreq: 118, duration: 0.065, gain: 0.018, type: 'square', pan: safeNumber(payload.pan, 0) });
                    tone({ freq: 126, toFreq: 90, delay: 0.012, duration: 0.05, gain: 0.008, type: 'triangle', pan: safeNumber(payload.pan, 0) });
                    noise({ freq: 920, duration: 0.05, gain: 0.0085, pan: safeNumber(payload.pan, 0) });
                    break;
                case 'shieldHit':
                    tone({ freq: 820, toFreq: 520, duration: 0.11, gain: 0.02, type: 'sine', pan: safeNumber(payload.pan, 0) });
                    pulse(1080, 0.045, 0.012, 'triangle', 1240);
                    break;
                case 'enemyDown':
                    tone({ freq: safeNumber(payload.boss ? 240 : 300, 300), toFreq: safeNumber(payload.boss ? 72 : 110, 110), duration: safeNumber(payload.boss ? 0.26 : 0.14, 0.14), gain: safeNumber(payload.boss ? 0.04 : 0.025, 0.025), type: payload.boss ? 'sawtooth' : 'triangle' });
                    noise({ freq: payload.boss ? 520 : 780, filterType: payload.boss ? 'lowpass' : 'bandpass', duration: payload.boss ? 0.2 : 0.08, gain: payload.boss ? 0.02 : 0.01 });
                    if (!payload.boss) pulse(760, 0.02, 0.01, 'sine', 920);
                    break;
                case 'bossDown':
                    playVictory();
                    noise({ freq: 480, filterType: 'lowpass', duration: 0.24, gain: 0.018 });
                    break;
                case 'skillReady':
                    pulse(740, 0, 0.02, 'triangle', 860);
                    pulse(960, 0.045, 0.022, 'sine', 1100);
                    pulse(1220, 0.09, 0.016, 'sine', 1360);
                    break;
                case 'skillEmp':
                    tone({ freq: 680, toFreq: 180, duration: 0.22, gain: 0.03, type: 'sawtooth' });
                    noise({ freq: 920, duration: 0.18, gain: 0.012 });
                    break;
                case 'skillOverclock':
                    pulse(420, 0, 0.02, 'square', 520);
                    pulse(620, 0.045, 0.024, 'square', 760);
                    pulse(880, 0.09, 0.028, 'triangle', 1040);
                    break;
                case 'skillShield':
                    pulse(360, 0, 0.022, 'sine', 520);
                    pulse(620, 0.05, 0.024, 'sine', 840);
                    pulse(920, 0.1, 0.02, 'triangle', 1080);
                    break;
                case 'ultimate':
                    tone({ freq: 220, toFreq: 560, duration: 0.2, gain: 0.034, type: 'sawtooth' });
                    tone({ freq: 140, toFreq: 240, delay: 0.02, duration: 0.18, gain: 0.014, type: 'triangle' });
                    chord([520, 760, 980], { delay: 0.08, gain: 0.024, duration: 0.2, stagger: 0.026, type: 'triangle' });
                    noise({ freq: 1180, duration: 0.16, gain: 0.016 });
                    break;
                case 'upgrade':
                    pulse(540, 0, 0.02, 'triangle', 700);
                    pulse(760, 0.04, 0.024, 'triangle', 960);
                    pulse(1020, 0.08, 0.028, 'sine', 1240);
                    break;
                case 'victory':
                    playVictory();
                    break;
                case 'defeat':
                    playDefeat();
                    break;
                case 'swap':
                    tone({ freq: 520, toFreq: 700, duration: 0.05, gain: 0.018, type: 'triangle', pan: -0.2 });
                    tone({ freq: 660, toFreq: 520, delay: 0.03, duration: 0.05, gain: 0.018, type: 'triangle', pan: 0.2 });
                    break;
                case 'noMatch':
                    tone({ freq: 320, toFreq: 180, duration: 0.12, gain: 0.022, type: 'square' });
                    break;
                case 'match':
                    playMatch(payload);
                    break;
                case 'cascade': {
                    const count = Math.max(2, safeNumber(payload.count, 2));
                    playMatch({ size: count + 2 });
                    pulse(1180 + Math.min(5, count) * 24, 0.11, 0.02 + Math.min(4, count) * 0.002, 'sine', 1400 + Math.min(5, count) * 32);
                    pulse(920 + Math.min(5, count) * 20, 0.16, 0.012 + Math.min(4, count) * 0.0015, 'triangle', 1160 + Math.min(5, count) * 26);
                    break;
                }
                case 'goal':
                    pulse(700, 0, 0.016, 'sine', 840);
                    pulse(980, 0.045, 0.018, 'sine', 1140);
                    pulse(1260, 0.1, 0.01, 'triangle', 1400);
                    break;
                case 'drop':
                    tone({ freq: 440, toFreq: 240, duration: 0.055, gain: 0.01, type: 'triangle' });
                    break;
                case 'forgeStart':
                    tone({ freq: 180, toFreq: 280, duration: 0.18, gain: 0.03, type: 'sawtooth' });
                    noise({ freq: 1600, duration: 0.12, gain: 0.012 });
                    break;
                case 'forgeResult':
                    pulse(420, 0, 0.02, 'triangle', 560);
                    pulse(620, 0.04, 0.022, 'triangle', 820);
                    pulse(900, 0.08, 0.028, 'sine', 1120);
                    break;
                case 'relic':
                    chord([392, 587, 784], { gain: 0.028, duration: 0.26, stagger: 0.032, type: 'sine' });
                    noise({ freq: 1800, duration: 0.16, gain: 0.015 });
                    break;
                case 'fuse':
                    pulse(300, 0, 0.022, 'triangle', 420);
                    pulse(520, 0.05, 0.024, 'triangle', 760);
                    pulse(860, 0.1, 0.028, 'sine', 1160);
                    break;
                case 'awaken':
                    chord([330, 494, 740], { gain: 0.026, duration: 0.22, stagger: 0.04, type: 'sine' });
                    tone({ freq: 880, toFreq: 1320, delay: 0.08, duration: 0.2, gain: 0.018, type: 'triangle' });
                    break;
                case 'salvage':
                    tone({ freq: 520, toFreq: 240, duration: 0.14, gain: 0.022, type: 'triangle' });
                    break;
                case 'purchase':
                    pulse(460, 0, 0.017, 'triangle', 560);
                    pulse(680, 0.045, 0.02, 'triangle', 840);
                    pulse(920, 0.09, 0.012, 'sine', 1080);
                    break;
                default:
                    pulse(540, 0, 0.018, 'triangle', 680);
                    break;
            }

            return true;
        }

        return {
            play,
            isEnabled() {
                return !!enabled;
            },
            setEnabled(nextValue) {
                enabled = !!nextValue;
                persistEnabled();
                if (enabled) ensureContext();
                return enabled;
            },
            toggle() {
                return this.setEnabled(!enabled);
            },
            syncToggle(button, labels = {}) {
                if (!button) return;
                const onLabel = labels.on || 'SFX ON';
                const offLabel = labels.off || 'SFX OFF';
                button.textContent = enabled ? onLabel : offLabel;
                button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
                button.classList.toggle('is-off', !enabled);
            }
        };
    }

    global.GenesisProceduralSfx = {
        createEngine
    };
})(window);
