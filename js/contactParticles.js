/* Contact 섹션 파티클 문양 */

document.addEventListener('DOMContentLoaded', () => {
  const canvases = document.querySelectorAll('.contact-particle-canvas');
  if (!canvases.length) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;

  class ContactParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.panel = canvas.closest('.contact-panel');
      this.pattern = canvas.dataset.pattern || 'mail';
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.tick = 0;
      this.hover = 0;
      this.targetHover = reducedMotionQuery.matches ? 0.55 : 0;
      this.particles = [];
      this.targets = [];

      this.resize();
      this.bind();
      this.animate();
    }

    bind() {
      const activate = () => {
        this.targetHover = 1;
      };
      const release = () => {
        this.targetHover = reducedMotionQuery.matches ? 0.55 : 0;
      };

      this.panel.addEventListener('mouseenter', activate);
      this.panel.addEventListener('mouseleave', release);
      this.panel.addEventListener('focusin', activate);
      this.panel.addEventListener('focusout', release);
      window.addEventListener('resize', () => this.resize());
      reducedMotionQuery.addEventListener('change', () => {
        this.targetHover = reducedMotionQuery.matches ? 0.55 : 0;
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.targets = this.createTargets();
      this.createParticles();
    }

    createParticles() {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 260 : 720;
      const previous = this.particles;

      this.particles = Array.from({ length: count }, (_, index) => {
        const old = previous[index];
        const target = this.targets[index % this.targets.length];
        const spreadX = ((index * 73) % 997) / 997;
        const spreadY = ((index * 191) % 991) / 991;
        const jitterX = (Math.random() - 0.5) * 26;
        const jitterY = (Math.random() - 0.5) * 26;
        const targetSoftness = this.pattern === 'github' ? 15 : 11;
        const targetJitterX = (Math.random() - 0.5) * targetSoftness;
        const targetJitterY = (Math.random() - 0.5) * targetSoftness;
        const homeX = clamp(spreadX * this.width + jitterX, 0, this.width);
        const homeY = clamp(spreadY * this.height + jitterY, 0, this.height);

        return {
          x: old ? clamp(old.x, 0, this.width) : homeX,
          y: old ? clamp(old.y, 0, this.height) : homeY,
          homeX,
          homeY,
          targetX: clamp(target.x + targetJitterX, 0, this.width),
          targetY: clamp(target.y + targetJitterY, 0, this.height),
          accent: index % 97 === 0,
          vx: 0,
          vy: 0,
          size: Math.random() * 0.42 + 0.58,
          gather: old ? old.gather || 0 : 0,
          gatherSpeed: Math.random() * 0.018 + 0.018,
          phase: Math.random() * Math.PI * 2
        };
      });
    }

    createTargets() {
      const points = [];
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const scale = Math.min(this.width, this.height) * 0.92;

      const addPoint = (x, y) => {
        points.push({
          x: centerX + x * scale,
          y: centerY + y * scale
        });
      };

      const addLine = (x1, y1, x2, y2, count) => {
        for (let i = 0; i < count; i += 1) {
          const t = count === 1 ? 0 : i / (count - 1);
          addPoint(lerp(x1, x2, t), lerp(y1, y2, t));
        }
      };

      const addEllipse = (cx, cy, rx, ry, start, end, count) => {
        for (let i = 0; i < count; i += 1) {
          const t = count === 1 ? 0 : i / (count - 1);
          const angle = lerp(start, end, t);
          addPoint(cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry);
        }
      };

      if (this.pattern === 'github') {
        addLine(-0.44, -0.18, -0.36, -0.5, 46);
        addLine(-0.36, -0.5, -0.09, -0.34, 42);
        addLine(0.44, -0.18, 0.36, -0.5, 46);
        addLine(0.36, -0.5, 0.09, -0.34, 42);
        addEllipse(0, -0.07, 0.49, 0.42, Math.PI * 0.92, Math.PI * 2.08, 184);
        addEllipse(0, 0.33, 0.34, 0.24, Math.PI * 0.08, Math.PI * 0.92, 74);
        addEllipse(-0.14, -0.07, 0.047, 0.052, 0, Math.PI * 2, 18);
        addEllipse(0.14, -0.07, 0.047, 0.052, 0, Math.PI * 2, 18);
        addLine(-0.58, 0.07, -0.36, 0.04, 22);
        addLine(-0.58, 0.22, -0.35, 0.16, 22);
        addLine(0.58, 0.07, 0.36, 0.04, 22);
        addLine(0.58, 0.22, 0.35, 0.16, 22);
        addLine(-0.22, 0.42, -0.22, 0.55, 22);
        addLine(0.22, 0.42, 0.22, 0.55, 22);
      } else {
        addLine(-0.52, -0.33, 0.52, -0.33, 84);
        addLine(0.52, -0.33, 0.52, 0.34, 66);
        addLine(0.52, 0.34, -0.52, 0.34, 84);
        addLine(-0.52, 0.34, -0.52, -0.33, 66);
        addLine(-0.52, -0.33, -0.22, -0.07, 38);
        addLine(0.52, -0.33, 0.22, -0.07, 38);
        addLine(-0.52, 0.34, -0.26, 0.11, 34);
        addLine(0.52, 0.34, 0.26, 0.11, 34);
        addEllipse(-0.5, -0.32, 0.035, 0.035, 0, Math.PI * 2, 14);
        addEllipse(0.5, 0.32, 0.035, 0.035, 0, Math.PI * 2, 14);
      }

      return points.length ? points : [{ x: centerX, y: centerY }];
    }

    getPalette() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      if (isDark) {
        return {
          idle: 'rgba(226, 232, 240, 0.42)',
          active: 'rgba(96, 165, 250, 0.96)',
          accent: 'rgba(249, 115, 22, 0.88)'
        };
      }

      return {
        idle: 'rgba(15, 23, 42, 0.7)',
        active: 'rgba(37, 99, 235, 0.98)',
        accent: 'rgba(249, 115, 22, 0.9)'
      };
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const palette = this.getPalette();
      const stiffness = reducedMotionQuery.matches ? 0.08 : 0.022;
      const friction = reducedMotionQuery.matches ? 0.82 : 0.93;

      this.hover += (this.targetHover - this.hover) * (reducedMotionQuery.matches ? 0.08 : 0.026);
      this.tick += reducedMotionQuery.matches ? 0.06 : 0.16;

      this.particles.forEach((particle, index) => {
        const driftX = Math.cos(this.tick * 0.012 + particle.phase) * 5;
        const driftY = Math.sin(this.tick * 0.01 + particle.phase * 1.7) * 4;
        const idleX = particle.homeX + driftX;
        const idleY = particle.homeY + driftY;
        const targetBreathX = Math.cos(this.tick * 0.018 + particle.phase * 1.4) * 3;
        const targetBreathY = Math.sin(this.tick * 0.016 + particle.phase) * 3;
        const gatherSpeed = reducedMotionQuery.matches ? 0.08 : particle.gatherSpeed;
        particle.gather += (this.hover - particle.gather) * gatherSpeed;
        const shapedHover = particle.gather * particle.gather * (3 - 2 * particle.gather);
        const targetX = lerp(idleX, particle.targetX + targetBreathX, shapedHover);
        const targetY = lerp(idleY, particle.targetY + targetBreathY, shapedHover);

        particle.vx += (targetX - particle.x) * stiffness;
        particle.vy += (targetY - particle.y) * stiffness;
        particle.vx *= friction;
        particle.vy *= friction;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const activeWeight = shapedHover * (0.88 + (index % 7) * 0.025);
        this.ctx.fillStyle = activeWeight > 0.18
          ? (particle.accent ? palette.accent : palette.active)
          : palette.idle;
        this.ctx.globalAlpha = 0.34 + activeWeight * 0.5;

        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size + activeWeight * 0.28, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.ctx.globalAlpha = 1;
    }

    animate() {
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }

  canvases.forEach(canvas => new ContactParticleField(canvas));
});
