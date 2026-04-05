// audio.js
// 终极还原：直接从您提供的《嗨道奇和制作音乐徽章.mp4》视频中提取的中文原声音轨！

class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.initialized = false;

        // 预加载当前仍在使用的角色原声与旁白素材
        this.audioCache = {};
        this.audioUrls = {
            'dog': 'sounds/movie_clips/char1.wav',
            'cat': 'sounds/movie_clips/char2.wav',
            'elephant': 'sounds/movie_clips/char3.wav',
            'frog': 'sounds/movie_clips/char4.wav',
            'duck': 'sounds/movie_clips/char5.wav',
            // 互动旁白
            'narrator_intro_start': 'sounds/voice_bank/narrator/intro_start.wav',
            'narrator_hint_find_one': 'sounds/voice_bank/narrator/hint_find_one.wav',
            'narrator_hint_find_6': 'sounds/voice_bank/narrator/hint_find_6.wav',
            'narrator_hint_find_11': 'sounds/voice_bank/narrator/hint_find_11.wav',
            'narrator_hint_find_16': 'sounds/voice_bank/narrator/hint_find_16.wav',
            'narrator_retry_gently': 'sounds/voice_bank/narrator/retry_gently.wav',
            'narrator_theme_switch': 'sounds/voice_bank/narrator/theme_switch.wav',
            'narrator_game_complete': 'sounds/voice_bank/narrator/game_complete.wav',
            'narrator_select_chapter': 'sounds/voice_bank/narrator/select_chapter.wav',
            'narrator_back_to_select': 'sounds/voice_bank/narrator/back_to_select.wav',
            'narrator_start_chapter_1': 'sounds/voice_bank/narrator/start_chapter_1.wav',
            'narrator_start_chapter_2': 'sounds/voice_bank/narrator/start_chapter_2.wav',
            'narrator_start_chapter_3': 'sounds/voice_bank/narrator/start_chapter_3.wav',
            'narrator_start_chapter_4': 'sounds/voice_bank/narrator/start_chapter_4.wav',
            'narrator_repeat_chapter_1': 'sounds/voice_bank/narrator/repeat_chapter_1.wav',
            'narrator_repeat_chapter_2': 'sounds/voice_bank/narrator/repeat_chapter_2.wav',
            'narrator_repeat_chapter_3': 'sounds/voice_bank/narrator/repeat_chapter_3.wav',
            'narrator_repeat_chapter_4': 'sounds/voice_bank/narrator/repeat_chapter_4.wav',
            'narrator_complete_chapter_1': 'sounds/voice_bank/narrator/complete_chapter_1.wav',
            'narrator_complete_chapter_2': 'sounds/voice_bank/narrator/complete_chapter_2.wav',
            'narrator_complete_chapter_3': 'sounds/voice_bank/narrator/complete_chapter_3.wav',
            'narrator_final_choice': 'sounds/voice_bank/narrator/final_choice.wav'
        };
        this.keyboardVoiceSlugs = [];

        for (let i = 0; i <= 9; i++) {
            this.keyboardVoiceSlugs.push(`digit_${i}`);
        }
        for (let i = 65; i <= 90; i++) {
            this.keyboardVoiceSlugs.push(`letter_${String.fromCharCode(i)}`);
        }
        this.keyboardVoiceSlugs.push('space', 'enter', 'arrow_up', 'arrow_down', 'arrow_left', 'arrow_right');

        for (const slug of this.keyboardVoiceSlugs) {
            this.audioUrls[`keyvoice_narrator__${slug}`] = `sounds/voice_bank/key_narrator/narrator__${slug}.wav`;
        }

        // 加载 1-20 的整句克隆旁白
        for (let i = 1; i <= 20; i++) {
            this.audioUrls[`voice_line_${i}`] = `sounds/clone_lines/line_${String(i).padStart(2, '0')}.wav`;
        }

        this.preloadAudio();

        // 绑定全局点击事件以初始化 AudioContext (浏览器限制)
        document.body.addEventListener('click', () => this.init(), { once: true });
    }

    preloadAudio() {
        for (const [key, url] of Object.entries(this.audioUrls)) {
            const audio = new Audio(url);
            // Use lazy loading to avoid a burst of startup requests and
            // noisy ERR_ABORTED logs when the browser cancels prefetches.
            audio.preload = 'none';
            this.audioCache[key] = audio;
        }
    }

    init() {
        if (!this.initialized) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('AudioContext initialized');
        }
    }

    playAudioByKey(key, onEndCallback) {
        const audioRef = this.audioCache[key];
        if (!audioRef) {
            console.warn(`Audio key not found: ${key}`);
            if (onEndCallback) onEndCallback();
            return;
        }

        audioRef.pause();
        audioRef.currentTime = 0;
        audioRef.volume = 1;
        audioRef.onended = () => {
            if (onEndCallback) onEndCallback();
        };
        audioRef.onerror = () => {
            console.warn(`Audio play failed: ${key}`);
            if (onEndCallback) onEndCallback();
        };

        audioRef.play().catch((e) => {
            console.warn(`Audio play failed: ${key}`, e);
            if (onEndCallback) onEndCallback();
        });
    }

    playNarration(key, onEndCallback) {
        this.playAudioByKey(key, onEndCallback);
    }

    speakText(text, onEndCallback, options = {}) {
        if (!text) {
            if (onEndCallback) onEndCallback();
            return;
        }
        if (!window.speechSynthesis) {
            if (onEndCallback) onEndCallback();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = options.rate ?? 0.9;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
            if (onEndCallback) onEndCallback();
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    getKeyboardSpeakText(key, code) {
        if (code === 'Space' || key === ' ') return '空格';
        if (code === 'Enter' || key === 'Enter') return '回车';
        if (code === 'ArrowUp') return '上';
        if (code === 'ArrowDown') return '下';
        if (code === 'ArrowLeft') return '左';
        if (code === 'ArrowRight') return '右';
        if (/^[a-z]$/i.test(key)) return key.toUpperCase();
        if (/^[0-9]$/.test(key)) return key;
        return '';
    }

    speakKeyboardFallback(key, code, onEndCallback) {
        const text = this.getKeyboardSpeakText(key, code);
        if (!text || !window.speechSynthesis) {
            if (onEndCallback) onEndCallback();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
        };
        utterance.onerror = () => {
            if (onEndCallback) onEndCallback();
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }

    getKeyboardVoiceSlug(key, code) {
        if (code === 'Space' || key === ' ') return 'space';
        if (code === 'Enter' || key === 'Enter') return 'enter';
        if (code === 'ArrowUp') return 'arrow_up';
        if (code === 'ArrowDown') return 'arrow_down';
        if (code === 'ArrowLeft') return 'arrow_left';
        if (code === 'ArrowRight') return 'arrow_right';

        if (/^[a-z]$/i.test(key)) {
            return `letter_${key.toUpperCase()}`;
        }
        if (/^[0-9]$/.test(key)) {
            return `digit_${key}`;
        }

        return null;
    }

    playRandomCharacterKey(key, code, onEndCallback) {
        const slug = this.getKeyboardVoiceSlug(key, code);
        if (!slug) {
            if (onEndCallback) onEndCallback();
            return;
        }

        const audioKey = `keyvoice_narrator__${slug}`;
        const audioRef = this.audioCache[audioKey];
        if (!audioRef) {
            this.speakKeyboardFallback(key, code, onEndCallback);
            return;
        }

        const audio = new Audio(audioRef.src);
        audio.volume = 1;
        audio.onended = () => {
            if (onEndCallback) onEndCallback();
        };
        audio.onerror = () => {
            this.speakKeyboardFallback(key, code, onEndCallback);
        };
        audio.play().catch(() => {
            this.speakKeyboardFallback(key, code, onEndCallback);
        });
    }

    // 按顺序播放音频队列
    playSequence(keys, onEndCallback) {
        if (!this.ctx || keys.length === 0) {
            if (onEndCallback) onEndCallback();
            return;
        }

        const playNext = (index) => {
            if (index >= keys.length) {
                if (onEndCallback) onEndCallback();
                return;
            }

            const key = keys[index];
            if (this.audioCache[key]) {
                this.playAudioByKey(key, () => playNext(index + 1));
            } else {
                // 如果音频不存在（比如还没提取 6-20 的语音），直接跳过播放下一个
                console.warn(`Audio key not found: ${key}`);
                playNext(index + 1);
            }
        };

        playNext(0);
    }

    playNumberAndSound(number, type, count) {
        if (!this.ctx) return;

        const fullLineKey = `voice_line_${number}`;

        if (this.audioCache[fullLineKey]) {
            this.playAudioByKey(fullLineKey, () => {
                if (this.audioCache[type]) {
                    this.playSingle(type);
                } else {
                    let delay = 0;
                    const interval = type === 'elephant' ? 1200 : 800;
                    for (let i = 0; i < count; i++) {
                        setTimeout(() => this.playSingle(type), delay);
                        delay += interval;
                    }
                }
            });
        } else {
            // 降级：如果完整克隆句子不存在，则退回到旧方案/机器合成 TTS
            const characterNames = {
                'dog': '阿奇',
                'cat': '诺丽',
                'elephant': '塔格',
                'frog': '罗利',
                'duck': '贝蒂'
            };

            const name = characterNames[type] || '小动物';
            const textToSpeak = `${number} 个 ${name}`;

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 1.2;

            utterance.onend = () => {
                if (this.audioCache[type]) {
                    this.playSingle(type);
                    return;
                }
                let delay = 0;
                const interval = type === 'elephant' ? 1200 : 800;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => this.playSingle(type), delay);
                    delay += interval;
                }
            };

            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }
        }
    }

    play(type, count = 1) {
        if (!this.ctx) return;

        // 如果是提取的真实音频，我们只播放一次，避免多重叠音变成噪音
        if (this.audioCache[type]) {
            this.playSingle(type);
            return;
        }

        let delay = 0;
        // 控制一下间隔，真实的动物叫声通常比合成音长
        const interval = type === 'elephant' ? 1200 : 800;

        for (let i = 0; i < count; i++) {
            setTimeout(() => this.playSingle(type), delay);
            delay += interval;
        }
    }

    playSingle(type) {
        // 如果有真实录音，优先播放真实录音
        if (this.audioCache[type]) {
            // 创建一个新的 audio 实例以支持并发播放重叠
            const a = new Audio(this.audioCache[type].src);
            a.volume = 0.8;

            a.play().then(() => {
                // 强行截断 1 秒后的音频，避免宝宝狂按产生巨大噪音
                setTimeout(() => {
                    a.pause();
                    a.currentTime = 0;
                }, 1000);
            }).catch(e => {
                console.warn("Audio play failed, falling back to synthesizer:", e);
                this.playSynthesized(type); // 降级播放合成音
            });
            return;
        }

        this.playSynthesized(type);
    }

    playSynthesized(type) {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
            case 'dog':
                // 阿奇 (Duggee) 的 "Woof" - 低沉、宽厚、短促有力的双音
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, time);
                osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);

                // 并发一个更低的次波增加厚度
                const osc2 = this.ctx.createOscillator();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(80, time);
                osc2.frequency.exponentialRampToValueAtTime(40, time + 0.15);
                osc2.connect(gain);
                osc2.start(time);
                osc2.stop(time + 0.15);

                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.5, time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.15);
                break;

            case 'cat':
                // 诺丽 (Norrie) - 细声细气、略带疑问的调皮吱声
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, time);
                osc.frequency.linearRampToValueAtTime(800, time + 0.1);
                osc.frequency.linearRampToValueAtTime(750, time + 0.2);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
                gain.gain.linearRampToValueAtTime(0.01, time + 0.2);
                osc.start(time);
                osc.stop(time + 0.2);
                break;

            case 'elephant':
                // 塔格 (Tag) - 憨厚、略带鼻音的低吟
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, time);
                osc.frequency.linearRampToValueAtTime(250, time + 0.1);
                osc.frequency.linearRampToValueAtTime(180, time + 0.3);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.4, time + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
                osc.start(time);
                osc.stop(time + 0.3);
                break;

            case 'frog':
                // 罗利 (Roly) - 大嗓门、非常热情高亢的叫声
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, time);
                osc.frequency.linearRampToValueAtTime(350, time + 0.05);
                osc.frequency.linearRampToValueAtTime(150, time + 0.2);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.4, time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
                osc.start(time);
                osc.stop(time + 0.2);
                break;

            case 'duck':
                // 贝蒂 (Betty) - 清脆、急促、聪明的说话声
                osc.type = 'square';
                osc.frequency.setValueAtTime(500, time);
                osc.frequency.exponentialRampToValueAtTime(300, time + 0.15);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.2, time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.15);
                break;

            case 'pop':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, time);
                osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
                osc.start(time);
                osc.stop(time + 0.1);
                break;

            case 'error':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, time);
                osc.frequency.setValueAtTime(120, time + 0.2);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
                gain.gain.linearRampToValueAtTime(0, time + 0.2);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
                osc.start(time);
                osc.stop(time + 0.4);
                break;

            case 'success':
            case 'star':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, time);
                osc.frequency.setValueAtTime(659.25, time + 0.1);
                osc.frequency.setValueAtTime(783.99, time + 0.2);
                osc.frequency.setValueAtTime(1046.50, time + 0.3);

                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
                osc.start(time);
                osc.stop(time + 0.5);
                break;

            case 'win':
                const freqs = [440, 554.37, 659.25, 880];
                freqs.forEach((f, i) => {
                    const o = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    o.type = 'sine';
                    o.frequency.value = f;
                    o.connect(g);
                    g.connect(this.ctx.destination);
                    g.gain.setValueAtTime(0, time);
                    g.gain.linearRampToValueAtTime(0.2, time + 0.1);
                    g.gain.exponentialRampToValueAtTime(0.01, time + 2);
                    o.start(time);
                    o.stop(time + 2);
                });
                break;
        }
    }
}

window.audioManager = new AudioSynthesizer();
