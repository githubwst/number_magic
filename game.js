// game.js
// 核心游戏逻辑：管理状态机、控制奖励、关卡选择与交互

class NumberMagicGame {
    constructor() {
        this.maxLevel = 20;
        this.displayedCount = 5;
        this.chapterSize = 5;
        this.totalChapters = this.maxLevel / this.chapterSize;
        this.currentLevel = 1;
        this.selectedChapter = 1;
        this.lastTheme = null;
        this.isRewardWaitingDismiss = false;
        this.isAnimating = false;
        this.chapterOverlayVisible = false;
        this.chapterMode = 'select';

        this.playArea = document.getElementById('play-area');
        this.wrapper = document.getElementById('balloons-wrapper');
        this.rewardOverlay = document.getElementById('reward-overlay');
        this.rewardContent = document.getElementById('reward-content');
        this.soundPrompt = document.getElementById('sound-prompt');
        this.btnRestart = document.getElementById('btn-restart');
        this.errorToast = document.getElementById('error-toast');
        this.sceneBg = document.getElementById('scene-bg');

        this.chapterOverlay = document.getElementById('chapter-overlay');
        this.chapterBadge = document.getElementById('chapter-badge');
        this.chapterTitle = document.getElementById('chapter-title');
        this.chapterDesc = document.getElementById('chapter-desc');
        this.chapterGrid = document.getElementById('chapter-grid');
        this.chapterActions = document.getElementById('chapter-actions');
        this.btnRepeatChapter = document.getElementById('btn-repeat-chapter');
        this.btnSelectChapter = document.getElementById('btn-select-chapter');
        this.btnNextChapter = document.getElementById('btn-next-chapter');

        this.themes = ['forest', 'ocean', 'night', 'sky'];
        this.chapterMeta = [
            { title: '森林果园', subtitle: '数字 1 - 5', theme: 'forest' },
            { title: '海底气泡', subtitle: '数字 6 - 10', theme: 'ocean' },
            { title: '星空闪闪', subtitle: '数字 11 - 15', theme: 'night' },
            { title: '云朵热气球', subtitle: '数字 16 - 20', theme: 'sky' }
        ];

        this.rewardsConfig = typeof NumberConfig !== 'undefined' ? NumberConfig : [];
        this.setupEvents();
    }

    setupEvents() {
        this.soundPrompt.addEventListener('click', () => {
            this.soundPrompt.classList.add('hidden');
            window.audioManager.init();
            this.resetGameSurface();
            this.showChapterSelect(false);
            window.audioManager.playNarration('narrator_intro_start', () => {
                window.audioManager.playNarration('narrator_select_chapter');
            });
        });

        this.btnRestart.addEventListener('click', () => {
            this.resetToStartState();
        });

        this.rewardOverlay.addEventListener('click', () => {
            if (this.isRewardWaitingDismiss && this.btnRestart.classList.contains('hidden')) {
                this.dismissRewardAndAdvance();
            }
        });

        this.btnRepeatChapter.addEventListener('click', () => {
            const chapter = Number(this.btnRepeatChapter.dataset.chapter || this.selectedChapter || 1);
            this.chapterOverlay.classList.add('hidden');
            this.chapterOverlayVisible = false;
            window.audioManager.playNarration(`narrator_repeat_chapter_${chapter}`);
            this.startGame(chapter);
        });

        this.btnSelectChapter.addEventListener('click', () => {
            this.resetToStartState();
        });

        this.btnNextChapter.addEventListener('click', () => {
            const chapter = Number(this.btnNextChapter.dataset.chapter || this.selectedChapter || 1);
            if (chapter >= this.totalChapters) {
                this.resetToStartState();
                return;
            }
            const nextChapter = chapter + 1;
            this.chapterOverlay.classList.add('hidden');
            this.chapterOverlayVisible = false;
            window.audioManager.playNarration(`narrator_start_chapter_${nextChapter}`);
            this.startGame(nextChapter);
        });

        window.addEventListener('keydown', (e) => this.handleRandomKeyPress(e));
    }

    getChapterStartLevel(chapter) {
        return (chapter - 1) * this.chapterSize + 1;
    }

    getChapterEndLevel(chapter) {
        return chapter * this.chapterSize;
    }

    getCurrentChapter() {
        return Math.floor((this.currentLevel - 1) / this.chapterSize) + 1;
    }

    resetGameSurface() {
        this.isAnimating = false;
        this.isRewardWaitingDismiss = false;
        this.lastTheme = null;
        this.rewardOverlay.classList.add('hidden');
        this.rewardContent.innerHTML = '';
        this.btnRestart.classList.add('hidden');
        this.chapterOverlay.classList.add('hidden');
        this.chapterOverlayVisible = false;
        document.body.style.backgroundColor = '#87CEEB';
        document.body.className = 'theme-forest';
        if (this.playArea) this.playArea.innerHTML = '';
        if (this.wrapper) this.wrapper.innerHTML = '';
        if (window.effectsManager && typeof window.effectsManager.stopWin === 'function') {
            window.effectsManager.stopWin();
        }
    }

    resetToStartState() {
        this.selectedChapter = 1;
        this.currentLevel = 1;
        this.resetGameSurface();
        this.showChapterSelect(false);
        window.audioManager.playNarration('narrator_back_to_select', () => {
            window.audioManager.playNarration('narrator_select_chapter');
        });
    }

    renderChapterButtons() {
        this.chapterGrid.innerHTML = '';
        this.chapterMeta.forEach((chapter, index) => {
            const chapterNumber = index + 1;
            const button = document.createElement('button');
            button.className = 'chapter-tile';
            button.innerHTML = `
                <div class="chapter-tile-title">第 ${chapterNumber} 大关</div>
                <div class="chapter-tile-subtitle">${chapter.title}</div>
                <div class="chapter-tile-subtitle">${chapter.subtitle}</div>
            `;
            button.addEventListener('click', () => {
                this.chapterOverlay.classList.add('hidden');
                this.chapterOverlayVisible = false;
                window.audioManager.playNarration(`narrator_start_chapter_${chapterNumber}`);
                this.startGame(chapterNumber);
            });
            this.chapterGrid.appendChild(button);
        });
    }

    showChapterSelect(playVoice = false) {
        this.chapterMode = 'select';
        this.chapterOverlayVisible = true;
        this.chapterBadge.textContent = '数字魔法';
        this.chapterTitle.textContent = '选择关卡';
        this.chapterDesc.textContent = '每 5 个数字是一大关，挑一个开始吧。';
        this.chapterGrid.classList.remove('hidden');
        this.chapterActions.classList.add('hidden');
        this.btnNextChapter.classList.remove('hidden');
        this.btnNextChapter.textContent = '继续下一关';
        this.renderChapterButtons();
        this.chapterOverlay.classList.remove('hidden');
        if (playVoice) {
            window.audioManager.playNarration('narrator_select_chapter');
        }
    }

    showChapterComplete(chapter) {
        this.chapterMode = 'complete';
        this.chapterOverlayVisible = true;
        this.selectedChapter = chapter;
        const isFinalChapter = chapter >= this.totalChapters;
        const meta = this.chapterMeta[chapter - 1];
        this.chapterBadge.textContent = `第 ${chapter} 大关完成`;
        this.chapterTitle.textContent = isFinalChapter ? '全部完成啦' : `${meta.title} 完成啦`;
        this.chapterDesc.textContent = isFinalChapter
            ? '可以重玩最后一关，或者回到选关页面重新开始。'
            : '你可以重玩本关、继续下一关，或者返回选关。';
        this.chapterGrid.classList.add('hidden');
        this.chapterActions.classList.remove('hidden');
        this.btnRepeatChapter.dataset.chapter = String(chapter);
        this.btnNextChapter.dataset.chapter = String(chapter);
        this.btnNextChapter.classList.toggle('hidden', isFinalChapter);
        this.btnNextChapter.textContent = '继续下一关';
        this.chapterOverlay.classList.remove('hidden');

        if (isFinalChapter) {
            window.audioManager.playNarration('narrator_game_complete', () => {
                window.audioManager.playNarration('narrator_final_choice');
            });
        } else {
            window.audioManager.playNarration(`narrator_complete_chapter_${chapter}`);
        }
    }

    dismissRewardAndAdvance() {
        if (!this.isRewardWaitingDismiss) return;

        const finishedLevel = this.currentLevel;
        const finishedChapter = this.getCurrentChapter();

        this.isRewardWaitingDismiss = false;
        this.rewardOverlay.classList.add('hidden');
        this.rewardContent.innerHTML = '';

        if (finishedLevel >= this.getChapterEndLevel(finishedChapter)) {
            this.showChapterComplete(finishedChapter);
            return;
        }

        this.currentLevel++;
        const remainingItems = document.querySelectorAll('.magic-item').length;
        if (remainingItems === 0) {
            this.generateBatch();
        } else {
            this.updateTargetHighlight();
        }
    }

    handleRandomKeyPress(e) {
        if (!this.soundPrompt.classList.contains('hidden')) {
            this.soundPrompt.click();
            return;
        }

        if (this.chapterOverlayVisible) {
            if (this.chapterMode === 'select' && /^Digit[1-4]$/.test(e.code)) {
                const chapter = Number(e.code.replace('Digit', ''));
                if (chapter >= 1 && chapter <= this.totalChapters) {
                    this.chapterOverlay.classList.add('hidden');
                    this.chapterOverlayVisible = false;
                    this.startGame(chapter);
                }
            }
            return;
        }

        if (this.isRewardWaitingDismiss && this.btnRestart.classList.contains('hidden')) {
            this.dismissRewardAndAdvance();
            return;
        }

        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) {
            e.preventDefault();
        }

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const colors = ['#ff9a9e', '#fecfef', '#a1c4fd', '#9ae6b4', '#fdfd96', '#ffb347', '#cbaacb'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        window.effectsManager.triggerConfetti(x, y, randomColor);
        if (window.audioManager && window.audioManager.initialized) {
            window.audioManager.playRandomCharacterKey(e.key, e.code);
        }
        this.showRandomKeyChar(e.key, x, y, randomColor);
    }

    showRandomKeyChar(char, x, y, color) {
        if (char.length > 1 && char !== 'Enter' && char !== 'Space') return;

        const displayChar = char === ' ' ? '⭐' : char.toUpperCase();
        const keyEl = document.createElement('div');
        keyEl.textContent = displayChar;
        keyEl.style.position = 'absolute';
        keyEl.style.left = `${x}px`;
        keyEl.style.top = `${y}px`;
        keyEl.style.transform = 'translate(-50%, -50%)';
        keyEl.style.fontSize = '5rem';
        keyEl.style.fontWeight = '900';
        keyEl.style.color = color;
        keyEl.style.textShadow = '2px 2px 0px white, -2px -2px 0px white, 2px -2px 0px white, -2px 2px 0px white';
        keyEl.style.zIndex = '50';
        keyEl.style.pointerEvents = 'none';
        keyEl.style.animation = 'jellyBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, pop 0.4s 0.6s forwards';

        document.body.appendChild(keyEl);
        setTimeout(() => {
            if (document.body.contains(keyEl)) {
                keyEl.remove();
            }
        }, 1000);
    }

    startGame(chapter = 1) {
        this.selectedChapter = chapter;
        this.currentLevel = this.getChapterStartLevel(chapter);
        this.resetGameSurface();
        this.generateBatch();
    }

    setTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        let bgHtml = '';

        switch (themeName) {
            case 'forest':
                bgHtml = `
                    <div class="sun"></div>
                    <div class="cloud cloud1"></div>
                    <div class="cloud cloud2"></div>
                    <div class="tree tree1"></div>
                    <div class="tree tree2"></div>
                    <div class="grass">
                        <div class="flower flower1"></div>
                        <div class="flower flower2"></div>
                        <div class="flower flower3"></div>
                        <div class="bush bush1"></div>
                        <div class="bush bush2"></div>
                    </div>
                `;
                break;
            case 'ocean':
                bgHtml = `
                    <div class="seaweed seaweed1"></div>
                    <div class="seaweed seaweed2"></div>
                    <div class="seaweed seaweed3"></div>
                    <div class="coral coral1"></div>
                    <div class="fish fish1"></div>
                    <div class="fish fish2"></div>
                    <div class="sand"></div>
                    <div class="bubbles-bg"></div>
                `;
                break;
            case 'night':
                bgHtml = `
                    <div class="moon"></div>
                    <div class="stars"></div>
                    <div class="shooting-star"></div>
                    <div class="mountain mountain1"></div>
                    <div class="mountain mountain2"></div>
                `;
                break;
            case 'sky':
                bgHtml = `
                    <div class="sun"></div>
                    <div class="cloud cloud1"></div>
                    <div class="cloud cloud2"></div>
                    <div class="cloud cloud3"></div>
                    <div class="bird bird1"></div>
                    <div class="bird bird2"></div>
                `;
                break;
        }

        if (this.sceneBg) {
            this.sceneBg.innerHTML = bgHtml;
        }
    }

    generateBatch() {
        if (this.playArea) {
            this.playArea.innerHTML = '';
        } else {
            // 兼容旧的 wrapper id
            const wrapper = document.getElementById('balloons-wrapper');
            if (wrapper) wrapper.innerHTML = '';
        }

        const batchIndex = Math.floor((this.currentLevel - 1) / this.displayedCount);
        const theme = this.themes[batchIndex % this.themes.length];
        this.setTheme(theme);
        if (this.lastTheme && this.lastTheme !== theme) {
            window.audioManager.playNarration('narrator_theme_switch');
        }
        this.lastTheme = theme;

        const startNum = this.currentLevel;
        const endNum = Math.min(startNum + this.displayedCount - 1, this.maxLevel);

        let numbers = [];
        for (let i = startNum; i <= endNum; i++) {
            numbers.push(i);
        }
        numbers = this.shuffle(numbers);

        let containerWidth = window.innerWidth * 0.9;
        let containerHeight = window.innerHeight * 0.8;
        if (this.playArea) {
            const rect = this.playArea.getBoundingClientRect();
            if (rect.width > 0) {
                containerWidth = rect.width;
                containerHeight = rect.height;
            }
        }

        numbers.forEach((num, index) => {
            const item = document.createElement('div');
            item.className = 'magic-item';
            item.dataset.num = num;
            const span = document.createElement('span');
            span.textContent = num;
            item.appendChild(span);
            let hue;
            if (theme === 'forest') {
                const hues = [0, 30, 60, 90, 280, 330, 360];
                hue = hues[Math.floor(Math.random() * hues.length)] + (Math.random() * 20 - 10);
            } else if (theme === 'ocean') {
                hue = 180 + Math.random() * 60;
            } else if (theme === 'night') {
                hue = 50;
            } else {
                hue = Math.random() * 360;
            }

            item.style.setProperty('--item-color', `hsl(${hue}, 80%, 60%)`);
            item.style.setProperty('--item-dark-color', `hsl(${hue}, 80%, 40%)`);
            const scale = 0.6 + Math.random() * 0.7; // 0.6 ~ 1.3
            item.style.transform = `scale(${scale})`;
            if (scale < 0.8) {
                item.style.zIndex = '5';
            } else if (scale > 1.1) {
                item.style.zIndex = '15';
            } else {
                item.style.zIndex = '10';
            }
            const cols = 3;
            const rows = 2;
            const cellW = containerWidth / cols;
            const cellH = containerHeight / rows;

            const cellIdx = index % (cols * rows);
            const col = cellIdx % cols;
            const row = Math.floor(cellIdx / cols);
            const itemSize = 120; // 近似物品尺寸
            const x = col * cellW + Math.random() * (cellW - itemSize);
            const y = row * cellH + Math.random() * (cellH - itemSize);
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            item.style.animationDelay = `${Math.random() * 2}s`;
            item.addEventListener('click', (_e) => this.handleItemClick(item, num));

            if (this.playArea) {
                this.playArea.appendChild(item);
            } else {
                document.getElementById('balloons-wrapper').appendChild(item);
            }
        });

        this.updateTargetHighlight();
    }

    shuffle(array) {
        let currentIndex = array.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    updateTargetHighlight() {
        const items = document.querySelectorAll('.magic-item');
        items.forEach(item => {
            item.classList.remove('active-target');
            item.style.animation = '';
        });
        const targetItem = document.querySelector(`.magic-item[data-num="${this.currentLevel}"]`);
        if (targetItem) {
            targetItem.classList.add('active-target');
            targetItem.style.animation = 'pulse 1.5s infinite';
        }
        const currentLevelEl = document.getElementById('current-level');
        if (currentLevelEl) {
            currentLevelEl.textContent = this.currentLevel;
        }
    }

    handleItemClick(item, num) {
        if (this.isAnimating) return;
        if (num === this.currentLevel) {
            this.isAnimating = true;
            item.classList.add('pop');
            const config = this.rewardsConfig.find(c => c.num === num);
            setTimeout(() => {
                item.remove();
                this.showReward(config);
                this.isAnimating = false;
            }, 300);
        } else {
            window.audioManager.playSingle('error');
            window.audioManager.playNarration('narrator_retry_gently');
            item.classList.add('shake');
            this.errorToast.classList.remove('hidden');
            setTimeout(() => {
                item.classList.remove('shake');
                this.errorToast.classList.add('hidden');
            }, 800);
            const targetItem = document.querySelector(`.magic-item[data-num="${this.currentLevel}"]`);
            if (targetItem) {
                targetItem.classList.add('bounce-hint');
                setTimeout(() => {
                    targetItem.classList.remove('bounce-hint');
                }, 1000);
            }
        }
    }

    showReward(config) {
        this.rewardContent.innerHTML = '';
        const baseDelay = 0.1;
        const animationDelay = Math.max(0.02, baseDelay - (config.num * 0.004));
        for (let i = 0; i < config.num; i++) {
            const item = document.createElement('div');
            item.className = 'reward-item';
            item.innerHTML = config.svg;
            item.style.animationDelay = `${i * animationDelay}s`;
            this.rewardContent.appendChild(item);
        }
        this.rewardOverlay.classList.remove('hidden');
        if (window.audioManager.playNumberAndSound) {
            window.audioManager.playNumberAndSound(config.num, config.soundKey, config.num);
        } else {
            window.audioManager.play(config.soundKey, config.num);
        }
        this.isRewardWaitingDismiss = true;
    }

    gameWin() {
        window.audioManager.playSingle('win');
        window.audioManager.playNarration('narrator_game_complete');
        window.effectsManager.triggerWin();
        document.body.style.backgroundColor = '#fff0f5';
        this.rewardContent.innerHTML = `
            <div style="font-size: 8rem; animation: pulse 2s infinite;">🎉</div>
            <h1 style="color: #ff6b6b; margin-top: 20px; width: 100%; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">太棒啦！</h1>
        `;
        this.rewardOverlay.classList.remove('hidden');
        setTimeout(() => {
            this.btnRestart.classList.remove('hidden');
        }, 2000);
    }
}

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NumberMagicGame();
});
