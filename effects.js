// effects.js
// 处理魔法星轨、爆破粒子等纯视觉特效

class EffectsManager {
    constructor() {
        this.canvas = document.getElementById('magic-trail');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isDrawing = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupListeners() {
        // 支持触摸和鼠标滑动产生星星轨迹
        const addParticle = (e) => {
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            
            // 控制产生密度
            if (Math.random() > 0.3) {
                this.createTrailParticle(x, y);
            }
        };

        window.addEventListener('mousemove', addParticle);
        window.addEventListener('touchmove', addParticle, { passive: false });
    }

    createTrailParticle(x, y) {
        // 随机马卡龙色系
        const colors = ['#ff9a9e', '#fecfef', '#a1c4fd', '#9ae6b4', '#fdfd96', '#ffb347', '#cbaacb'];
        
        this.particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1, // 寿命
            decay: Math.random() * 0.02 + 0.015,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            // 简单的物理效果
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 1 + 0.5 
        });
    }

    drawStar(x, y, radius, rot, color, alpha) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rot);
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius / 2;
        let step = Math.PI / spikes;
        
        for (let i = 0; i < spikes; i++) {
            this.ctx.lineTo(Math.cos(step * i * 2) * outerRadius, Math.sin(step * i * 2) * outerRadius);
            this.ctx.lineTo(Math.cos(step * (i * 2 + 1)) * innerRadius, Math.sin(step * (i * 2 + 1)) * innerRadius);
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.life -= p.decay;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.drawStar(p.x, p.y, p.size, p.rotation, p.color, p.life);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }

    // 触发单个气球爆炸的烟花特效
    triggerConfetti(x, y, color) {
        if (typeof confetti !== 'undefined') {
            const originX = x / window.innerWidth;
            const originY = y / window.innerHeight;
            
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { x: originX, y: originY },
                colors: [color, '#ffffff', '#ffd166'],
                disableForReducedMotion: true,
                zIndex: 150
            });
        }
    }

    // 触发全屏大胜利特效
    triggerWin() {
        if (typeof confetti !== 'undefined') {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 150 };

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // left edge
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 } }));
                // right edge
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() + 1.2, y: Math.random() - 0.2 } }));
            }, 250);
        }
    }
}

window.effectsManager = new EffectsManager();