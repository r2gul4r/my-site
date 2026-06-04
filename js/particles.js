/* Living AI Workflow Graph - semantic particle background */

(function() {
  'use strict';

  const KNOWLEDGE_CLUSTERS = [
    { id: 'data', label: 'Data', relX: 0.13, relY: 0.56, weight: 1.05, spreadX: 1.05, spreadY: 0.72, phase: 0.2 },
    { id: 'ai', label: 'AI', relX: 0.31, relY: 0.34, weight: 1.16, spreadX: 0.96, spreadY: 0.78, phase: 1.1 },
    { id: 'agent', label: 'Agent', relX: 0.51, relY: 0.62, weight: 1.12, spreadX: 0.9, spreadY: 0.82, phase: 2.4 },
    { id: 'automation', label: 'Automation', relX: 0.69, relY: 0.36, weight: 1.05, spreadX: 1.0, spreadY: 0.72, phase: 3.3 },
    { id: 'build', label: 'Build', relX: 0.87, relY: 0.55, weight: 0.9, spreadX: 0.94, spreadY: 0.78, phase: 4.2 },
    { id: 'security', label: 'Security', relX: 0.45, relY: 0.18, weight: 0.82, spreadX: 0.88, spreadY: 0.68, phase: 5.0 },
    { id: 'open_source', label: 'Open Source', relX: 0.63, relY: 0.83, weight: 0.88, spreadX: 1.02, spreadY: 0.72, phase: 5.9 }
  ];

  const MAIN_FLOW = ['data', 'ai', 'agent', 'automation', 'build'];
  const SUPPORT_LINKS = [
    ['security', 'ai'],
    ['security', 'agent'],
    ['open_source', 'agent'],
    ['open_source', 'build']
  ];

  const ROLE_RADIUS = {
    hub: 9.2,
    node: 5.1,
    satellite: 3.35
  };

  const PALETTES = {
    light: {
      deepBlue: [30, 58, 138],
      nodeBlue: [37, 99, 235],
      orange: [249, 115, 22],
      hotOrange: [255, 107, 0],
      line: [30, 58, 138],
      lineSoft: [100, 116, 139],
      label: [15, 23, 42]
    },
    dark: {
      deepBlue: [96, 165, 250],
      nodeBlue: [59, 130, 246],
      orange: [249, 115, 22],
      hotOrange: [253, 186, 116],
      line: [147, 197, 253],
      lineSoft: [148, 163, 184],
      label: [226, 232, 240]
    }
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamp(alpha, 0, 1)})`;
  const gaussian = (distance, width) => Math.exp(-(distance * distance) / (2 * width * width));
  const addMediaQueryListener = (query, handler) => {
    if (query.addEventListener) {
      query.addEventListener('change', handler);
      return;
    }

    query.addListener(handler);
  };

  const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return x * x * (3 - 2 * x);
  };

  const distanceToSegment = (x, y, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return Math.hypot(x - x1, y - y1);
    }

    const t = clamp(((x - x1) * dx + (y - y1) * dy) / lengthSq, 0, 1);
    const px = x1 + t * dx;
    const py = y1 + t * dy;

    return Math.hypot(x - px, y - py);
  };

  class LivingWorkflowGraph {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.ripples = [];
      this.quietRects = [];
      this.hubs = new Map();
      this.tick = Math.random() * 1000;
      this.frame = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.animationFrame = null;
      this.theme = this.readTheme();
      this.fontFamily = this.readFontFamily();

      this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

      this.mouse = {
        x: 0,
        y: 0,
        smoothX: 0,
        smoothY: 0,
        active: false,
        radius: 180,
        lineRadius: 90
      };

      this.boundResize = () => this.handleResize();
      this.boundPointerMove = (event) => this.trackPointer(event);
      this.boundPointerLeave = () => this.clearPointer();
      this.boundPointerDown = (event) => this.triggerRipple(event);
      this.boundMotionChange = () => this.restart();
      this.boundInteractionChange = () => {
        this.clearPointer();
        this.resize();
      };

      this.init();
    }

    init() {
      this.resize();
      this.generateGraph();
      this.bindEvents();
      this.start();
    }

    bindEvents() {
      window.addEventListener('resize', this.boundResize, { passive: true });
      window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
      window.addEventListener('pointerdown', this.boundPointerDown, { passive: true });
      window.addEventListener('blur', this.boundPointerLeave);
      document.addEventListener('pointerleave', this.boundPointerLeave);

      addMediaQueryListener(this.reducedMotionQuery, this.boundMotionChange);
      addMediaQueryListener(this.hoverQuery, this.boundInteractionChange);

      this.themeObserver = new MutationObserver(() => {
        this.theme = this.readTheme();
        this.drawStatic();
      });

      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    readTheme() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    readFontFamily() {
      const cssFont = getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim();
      return cssFont || 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    }

    prefersReducedMotion() {
      return this.reducedMotionQuery.matches;
    }

    canInteract() {
      return !this.isMobile && this.hoverQuery.matches && !this.prefersReducedMotion();
    }

    handleResize() {
      this.resize();
      this.generateGraph();
      this.drawStatic();
    }

    restart() {
      this.clearPointer();
      this.resize();
      this.generateGraph();
      this.start();
    }

    resize() {
      const parent = this.canvas.parentElement || document.body;
      const rect = parent.getBoundingClientRect();
      const width = Math.max(320, Math.ceil(rect.width || window.innerWidth));
      const height = Math.max(420, Math.ceil(rect.height || window.innerHeight));

      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = width;
      this.height = height;
      this.isMobile = window.innerWidth < 768 || width < 680;

      this.canvas.width = Math.round(width * this.dpr);
      this.canvas.height = Math.round(height * this.dpr);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.mouse.radius = this.isMobile ? 0 : clamp(width * 0.16, 150, 230);
      this.mouse.lineRadius = clamp(width * 0.07, 62, 110);
      this.captureQuietRects();
    }

    getParticleTarget() {
      if (this.isMobile) {
        return this.prefersReducedMotion() ? 36 : 48;
      }

      if (this.width > 1500) {
        return this.prefersReducedMotion() ? 84 : 132;
      }

      if (this.width < 980) {
        return this.prefersReducedMotion() ? 68 : 96;
      }

      return this.prefersReducedMotion() ? 76 : 118;
    }

    generateGraph() {
      this.particles = [];
      this.hubs.clear();

      const totalParticles = this.getParticleTarget();
      const nonHubCount = Math.max(0, totalParticles - KNOWLEDGE_CLUSTERS.length);
      const allocations = this.allocateClusterNodes(nonHubCount);

      KNOWLEDGE_CLUSTERS.forEach((cluster) => {
        const center = this.getClusterCenter(cluster);
        const hub = new WorkflowParticle({
          x: center.x,
          y: center.y,
          cluster,
          role: 'hub',
          orbitRadius: 0,
          orbitAngle: cluster.phase
        });

        this.particles.push(hub);
        this.hubs.set(cluster.id, hub);

        const count = allocations.get(cluster.id) || 0;
        for (let index = 0; index < count; index += 1) {
          const role = index < count * 0.54 ? 'node' : 'satellite';
          const orbitRadius = role === 'node'
            ? randomBetween(42, this.isMobile ? 68 : 82)
            : randomBetween(this.isMobile ? 66 : 82, this.isMobile ? 104 : 136);
          const orbitAngle = (index / Math.max(count, 1)) * Math.PI * 2 + randomBetween(-0.42, 0.42);
          const initial = this.getInitialNodePosition(center, cluster, role, orbitAngle, orbitRadius);

          this.particles.push(new WorkflowParticle({
            x: initial.x,
            y: initial.y,
            cluster,
            role,
            orbitRadius,
            orbitAngle
          }));
        }
      });

      this.assignAccentNodes();
    }

    allocateClusterNodes(nonHubCount) {
      const totalWeight = KNOWLEDGE_CLUSTERS.reduce((sum, cluster) => sum + cluster.weight, 0);
      const allocations = new Map();
      const remainders = [];
      let assigned = 0;

      KNOWLEDGE_CLUSTERS.forEach((cluster) => {
        const exact = (nonHubCount * cluster.weight) / totalWeight;
        const count = Math.floor(exact);
        allocations.set(cluster.id, count);
        remainders.push({ id: cluster.id, value: exact - count });
        assigned += count;
      });

      remainders.sort((a, b) => b.value - a.value);

      for (let i = 0; assigned < nonHubCount; i += 1) {
        const target = remainders[i % remainders.length].id;
        allocations.set(target, allocations.get(target) + 1);
        assigned += 1;
      }

      return allocations;
    }

    assignAccentNodes() {
      const targetAccentCount = Math.round(this.particles.length * 0.17);
      const candidates = this.particles
        .filter((particle) => particle.role !== 'hub')
        .sort((a, b) => b.accentScore - a.accentScore);

      candidates.slice(0, targetAccentCount).forEach((particle) => {
        particle.isAccent = true;
      });
    }

    getInitialNodePosition(center, cluster, role, orbitAngle, orbitRadius) {
      let angle = orbitAngle;
      let radius = orbitRadius;
      let x = center.x;
      let y = center.y;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        x = center.x + Math.cos(angle) * radius * cluster.spreadX;
        y = center.y + Math.sin(angle) * radius * cluster.spreadY;

        if (role === 'hub' || this.getQuietFactor(x, y) > 0.62) {
          break;
        }

        angle += randomBetween(0.7, 1.35);
        radius += 14;
      }

      return {
        x: clamp(x, 12, this.width - 12),
        y: clamp(y, 12, this.height - 12)
      };
    }

    getClusterCenter(cluster) {
      const widthBias = this.isMobile ? 0.5 : cluster.relX;
      const mobileYMap = {
        data: 0.18,
        ai: 0.31,
        agent: 0.47,
        automation: 0.62,
        build: 0.78,
        security: 0.1,
        open_source: 0.9
      };

      const relX = this.isMobile
        ? clamp(widthBias + (cluster.relX - 0.5) * 0.28, 0.16, 0.84)
        : cluster.relX;
      const relY = this.isMobile ? mobileYMap[cluster.id] : cluster.relY;

      const driftScaleX = this.isMobile ? 0.035 : (cluster.id === 'data' || cluster.id === 'build' ? 0.06 : 0.095);
      const driftScaleY = this.isMobile ? 0.04 : (cluster.id === 'security' || cluster.id === 'open_source' ? 0.075 : 0.12);
      const wideDriftX =
        Math.sin(this.tick * 0.005 + cluster.phase * 1.7) * this.width * driftScaleX +
        Math.sin(this.tick * 0.0027 + cluster.phase * 0.9) * this.width * driftScaleX * 0.36;
      const wideDriftY =
        Math.cos(this.tick * 0.0038 + cluster.phase * 1.4) * this.height * driftScaleY +
        Math.sin(this.tick * 0.0022 + cluster.phase * 2.1) * this.height * driftScaleY * 0.28;
      const breathX = Math.sin(this.tick * 0.003 + cluster.phase) * (this.isMobile ? 2 : 5);
      const breathY = Math.cos(this.tick * 0.0025 + cluster.phase) * (this.isMobile ? 2 : 4);

      return {
        x: clamp(relX * this.width + wideDriftX + breathX, 24, this.width - 24),
        y: clamp(relY * this.height + wideDriftY + breathY, 24, this.height - 24)
      };
    }

    captureQuietRects() {
      const canvasRect = this.canvas.getBoundingClientRect();
      const selectors = ['.hero-content', '.hero-buttons', '.floating-status-container'];

      this.quietRects = selectors
        .map((selector) => ({ selector, element: document.querySelector(selector) }))
        .filter((item) => item.element)
        .map(({ selector, element }) => {
          const rect = element.getBoundingClientRect();
          const padX = selectorContains(selector, 'hero-buttons') ? 36 : 52;
          const padY = selectorContains(selector, 'floating-status') ? 30 : 44;

          return {
            left: rect.left - canvasRect.left - padX,
            top: rect.top - canvasRect.top - padY,
            right: rect.right - canvasRect.left + padX,
            bottom: rect.bottom - canvasRect.top + padY
          };
        });
    }

    getQuietFactor(x, y) {
      let factor = 1;

      this.quietRects.forEach((rect) => {
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          factor = Math.min(factor, 0.22);
        }
      });

      const relX = x / Math.max(this.width, 1);
      const relY = y / Math.max(this.height, 1);
      const centralX = smoothstep(0.18, 0.34, relX) * (1 - smoothstep(0.64, 0.82, relX));
      const centralY = smoothstep(0.2, 0.34, relY) * (1 - smoothstep(0.58, 0.74, relY));
      const centralQuiet = centralX * centralY;

      factor = Math.min(factor, 1 - centralQuiet * 0.54);
      return clamp(factor, 0.18, 1);
    }

    trackPointer(event) {
      if (!this.canInteract()) {
        return;
      }

      const point = this.getPointerPosition(event);
      if (!point) {
        this.clearPointer();
        return;
      }

      this.mouse.x = point.x;
      this.mouse.y = point.y;

      if (!this.mouse.active) {
        this.mouse.smoothX = point.x;
        this.mouse.smoothY = point.y;
      }

      this.mouse.active = true;
    }

    clearPointer() {
      this.mouse.active = false;
    }

    getPointerPosition(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < -20 || y < -20 || x > this.width + 20 || y > this.height + 20) {
        return null;
      }

      return {
        x: clamp(x, 0, this.width),
        y: clamp(y, 0, this.height)
      };
    }

    triggerRipple(event) {
      if (!this.canInteract()) {
        return;
      }

      const point = this.getPointerPosition(event);
      if (!point) {
        return;
      }

      this.ripples.push({
        x: point.x,
        y: point.y,
        radius: 0,
        maxRadius: clamp(this.width * 0.24, 170, 310),
        speed: 5.8,
        life: 1
      });

      if (this.ripples.length > 3) {
        this.ripples.shift();
      }
    }

    start() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      if (this.prefersReducedMotion()) {
        this.drawStatic();
        return;
      }

      this.animate();
    }

    animate() {
      this.tick += 0.3;
      this.frame += 1;

      if (this.frame % 28 === 0) {
        this.captureQuietRects();
      }

      this.updateMouse();
      this.updateRipples();
      this.updateParticles();
      this.drawFrame();

      this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    drawStatic() {
      if (!this.ctx || !this.width || !this.height) {
        return;
      }

      this.captureQuietRects();
      this.drawFrame(true);
    }

    updateMouse() {
      if (this.mouse.active) {
        this.mouse.smoothX += (this.mouse.x - this.mouse.smoothX) * 0.1;
        this.mouse.smoothY += (this.mouse.y - this.mouse.smoothY) * 0.1;
      }
    }

    updateRipples() {
      this.ripples.forEach((ripple) => {
        ripple.radius += ripple.speed;
        ripple.life = 1 - ripple.radius / ripple.maxRadius;
      });

      this.ripples = this.ripples.filter((ripple) => ripple.life > 0);
    }

    updateParticles() {
      const context = {
        tick: this.tick,
        width: this.width,
        height: this.height,
        mouse: this.mouse,
        ripples: this.ripples,
        canInteract: this.canInteract(),
        getClusterCenter: (cluster) => this.getClusterCenter(cluster),
        getQuietFactor: (x, y) => this.getQuietFactor(x, y)
      };

      this.particles.forEach((particle) => particle.update(context));
    }

    drawFrame(staticFrame = false) {
      const palette = PALETTES[this.theme] || PALETTES.light;
      const activities = this.getClusterActivities(staticFrame);

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawParticleConnections(palette, staticFrame, activities);
      this.drawMainWorkflow(palette, staticFrame, activities);
      this.drawRipples(palette);
      this.drawParticlesAndLabels(palette, staticFrame, activities);
    }

    getClusterActivities(staticFrame) {
      const activities = new Map(KNOWLEDGE_CLUSTERS.map((cluster) => [cluster.id, staticFrame ? 0.16 : 0]));

      if (staticFrame) {
        return activities;
      }

      const flowPosition = ((this.tick * 0.006) % 1) * MAIN_FLOW.length;
      const circularDistance = (a, b, size) => {
        const direct = Math.abs(a - b);
        return Math.min(direct, size - direct);
      };

      MAIN_FLOW.forEach((clusterId, index) => {
        const activity = gaussian(circularDistance(flowPosition, index, MAIN_FLOW.length), 0.58);
        activities.set(clusterId, activity);
      });

      const securityActivity = Math.max(
        gaussian(circularDistance(flowPosition, 1.08, MAIN_FLOW.length), 0.7),
        gaussian(circularDistance(flowPosition, 2.1, MAIN_FLOW.length), 0.68)
      );
      const openSourceActivity = Math.max(
        gaussian(circularDistance(flowPosition, 2.25, MAIN_FLOW.length), 0.72),
        gaussian(circularDistance(flowPosition, 4.0, MAIN_FLOW.length), 0.7)
      );

      activities.set('security', securityActivity * 0.72);
      activities.set('open_source', openSourceActivity * 0.68);

      return activities;
    }

    drawParticleConnections(palette, staticFrame, activities) {
      const count = this.particles.length;

      for (let i = 0; i < count; i += 1) {
        for (let j = i + 1; j < count; j += 1) {
          this.drawConnection(this.particles[i], this.particles[j], palette, staticFrame, activities);
        }
      }
    }

    drawConnection(p1, p2, palette, staticFrame, activities) {
      const sameCluster = p1.clusterId === p2.clusterId;
      const maxDist = sameCluster ? this.getSameClusterDistance(p1, p2) : this.getCrossClusterDistance(p1, p2);

      if (!sameCluster && p1.bridgeAffinity + p2.bridgeAffinity < 1.36) {
        return;
      }

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.hypot(dx, dy);

      if (distance > maxDist) {
        return;
      }

      const midpointX = (p1.x + p2.x) * 0.5;
      const midpointY = (p1.y + p2.y) * 0.5;
      const quiet = this.getQuietFactor(midpointX, midpointY);
      const falloff = Math.pow(1 - distance / maxDist, sameCluster ? 1.35 : 2.1);
      const activity = sameCluster
        ? activities.get(p1.clusterId) || 0
        : Math.min((activities.get(p1.clusterId) || 0), (activities.get(p2.clusterId) || 0));
      let alpha = falloff * (sameCluster ? 0.15 : 0.055) * (1 + activity * (sameCluster ? 1.0 : 1.55));

      if (this.mouse.active && !staticFrame) {
        const mouseDistance = distanceToSegment(
          this.mouse.smoothX,
          this.mouse.smoothY,
          p1.x,
          p1.y,
          p2.x,
          p2.y
        );

        if (mouseDistance < this.mouse.lineRadius) {
          alpha += (1 - mouseDistance / this.mouse.lineRadius) * (sameCluster ? 0.13 : 0.07);
        }
      }

      alpha *= quiet;

      if (alpha < 0.006) {
        return;
      }

      this.ctx.save();
      this.ctx.strokeStyle = rgba(p1.isAccent || p2.isAccent ? palette.orange : palette.line, alpha);
      this.ctx.lineWidth = sameCluster ? (p1.role === 'hub' || p2.role === 'hub' ? 0.78 : 0.56) : 0.42;
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
      this.ctx.restore();
    }

    getSameClusterDistance(p1, p2) {
      if (this.isMobile) {
        return p1.role === 'hub' || p2.role === 'hub' ? 92 : 58;
      }

      if (p1.role === 'hub' || p2.role === 'hub') {
        return 132;
      }

      if (p1.role === 'satellite' && p2.role === 'satellite') {
        return 62;
      }

      return 92;
    }

    getCrossClusterDistance(p1, p2) {
      if (this.isMobile) {
        return 32;
      }

      if (p1.role === 'hub' || p2.role === 'hub') {
        return 58;
      }

      return 46;
    }

    drawMainWorkflow(palette, staticFrame, activities) {
      this.ctx.save();
      this.ctx.setLineDash(staticFrame ? [] : [7, 12]);
      this.ctx.lineDashOffset = staticFrame ? 0 : -this.tick * 0.022;
      this.ctx.lineCap = 'round';

      for (let i = 0; i < MAIN_FLOW.length - 1; i += 1) {
        const start = this.hubs.get(MAIN_FLOW[i]);
        const end = this.hubs.get(MAIN_FLOW[i + 1]);
        if (!start || !end) continue;

        this.drawHubPath(start, end, palette.line, 0.072, i % 2 === 0 ? -18 : 18, activities);
      }

      this.ctx.setLineDash(staticFrame ? [] : [2, 14]);
      SUPPORT_LINKS.forEach(([from, to], index) => {
        const start = this.hubs.get(from);
        const end = this.hubs.get(to);
        if (!start || !end) return;

        this.drawHubPath(start, end, palette.lineSoft, 0.032, index % 2 === 0 ? 24 : -24, activities);
      });

      this.ctx.restore();
    }

    drawHubPath(start, end, color, baseAlpha, bend, activities) {
      const midX = (start.x + end.x) * 0.5;
      const midY = (start.y + end.y) * 0.5 + bend;
      const quiet = this.getQuietFactor(midX, midY);
      const activity = Math.max(activities.get(start.clusterId) || 0, activities.get(end.clusterId) || 0);
      let alpha = baseAlpha * 1.22 * (1 + activity * 1.18);

      if (this.mouse.active) {
        const mouseDistance = distanceToSegment(this.mouse.smoothX, this.mouse.smoothY, start.x, start.y, end.x, end.y);
        if (mouseDistance < this.mouse.lineRadius * 1.2) {
          alpha += (1 - mouseDistance / (this.mouse.lineRadius * 1.2)) * 0.08;
        }
      }

      this.ctx.strokeStyle = rgba(color, alpha * quiet);
      this.ctx.lineWidth = 0.86;
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      this.ctx.stroke();
    }

    drawRipples(palette) {
      this.ripples.forEach((ripple) => {
        const quiet = this.getQuietFactor(ripple.x, ripple.y);
        const alpha = ripple.life * 0.12 * quiet;

        this.ctx.save();
        this.ctx.strokeStyle = rgba(palette.hotOrange, alpha);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      });
    }

    drawParticlesAndLabels(palette, staticFrame, activities) {
      this.particles.forEach((particle) => {
        particle.draw(
          this.ctx,
          palette,
          this.getQuietFactor(particle.x, particle.y),
          this.tick,
          activities.get(particle.clusterId) || 0
        );
      });

      if (this.isMobile || staticFrame || !this.mouse.active) {
        return;
      }

      this.particles
        .filter((particle) => particle.role === 'hub')
        .forEach((particle) => this.drawHubLabel(particle, palette, activities.get(particle.clusterId) || 0));
    }

    drawHubLabel(particle, palette, activity) {
      const distance = Math.hypot(this.mouse.smoothX - particle.x, this.mouse.smoothY - particle.y);
      const labelRadius = 220;

      if (distance > labelRadius) {
        return;
      }

      const proximity = 1 - distance / labelRadius;
      const quiet = this.getQuietFactor(particle.x + 42, particle.y);
      let alpha = (0.18 + proximity * 0.24 + activity * 0.18) * quiet;

      if (quiet < 0.6) {
        alpha *= 0.55;
      }

      if (alpha < 0.04) {
        return;
      }

      this.ctx.save();
      this.ctx.font = `700 20px ${this.fontFamily}`;
      this.ctx.fillStyle = rgba(palette.label, clamp(alpha, 0.12, 0.42));
      this.ctx.fillText(particle.cluster.label, particle.x + 22, particle.y + 7);
      this.ctx.restore();
    }
  }

  class WorkflowParticle {
    constructor({ x, y, cluster, role, orbitRadius, orbitAngle }) {
      this.x = x;
      this.y = y;
      this.baseX = x;
      this.baseY = y;
      this.vx = 0;
      this.vy = 0;
      this.cluster = cluster;
      this.clusterId = cluster.id;
      this.role = role;
      this.isAccent = false;
      this.radius = ROLE_RADIUS[role];
      this.phase = Math.random() * Math.PI * 2;
      this.orbitRadius = orbitRadius;
      this.orbitAngle = orbitAngle;
      this.orbitSpeed = randomBetween(0.00045, 0.00165) * (Math.random() > 0.5 ? 1 : -1);
      this.hubOrbitRadius = role === 'hub' ? randomBetween(13, 22) : 0;
      this.hubOrbitSpeed = role === 'hub'
        ? randomBetween(0.0038, 0.0062) * (Math.random() > 0.5 ? 1 : -1)
        : 0;
      this.bridgeAffinity = Math.random();

      const accentBias = ['automation', 'security', 'agent'].includes(cluster.id) ? 0.18 : 0;
      this.accentScore = Math.random() + accentBias + (role === 'satellite' ? 0.04 : 0);
    }

    update(context) {
      const center = context.getClusterCenter(this.cluster);
      const target = this.getTarget(center, context.tick);

      this.baseX = target.x;
      this.baseY = target.y;

      const spring = this.role === 'hub' ? 0.024 : this.role === 'node' ? 0.019 : 0.015;
      const friction = this.role === 'hub' ? 0.9 : this.role === 'node' ? 0.91 : 0.92;

      this.vx += (this.baseX - this.x) * spring;
      this.vy += (this.baseY - this.y) * spring;

      if (context.canInteract && context.mouse.active) {
        this.applyMousePull(context.mouse);
      }

      context.ripples.forEach((ripple) => this.applyRipple(ripple));

      this.vx *= friction;
      this.vy *= friction;

      const speed = Math.hypot(this.vx, this.vy);
      const maxSpeed = this.role === 'hub' ? 2.1 : this.role === 'node' ? 3.15 : 3.65;

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        this.vx *= scale;
        this.vy *= scale;
      }

      this.x = clamp(this.x + this.vx, -18, context.width + 18);
      this.y = clamp(this.y + this.vy, -18, context.height + 18);
    }

    getTarget(center, tick) {
      if (this.role === 'hub') {
        const orbit = this.phase + tick * this.hubOrbitSpeed;

        return {
          x: center.x + Math.cos(orbit) * this.hubOrbitRadius + Math.sin(tick * 0.003 + this.phase) * 2.4,
          y: center.y + Math.sin(orbit) * this.hubOrbitRadius * 0.68 + Math.cos(tick * 0.0025 + this.phase) * 1.8
        };
      }

      const orbit = this.orbitAngle + tick * this.orbitSpeed;
      const pulse = 1 + Math.sin(tick * 0.0024 + this.phase) * (this.role === 'node' ? 0.08 : 0.12);
      const looseness = this.role === 'node' ? 1 : 1.16;

      return {
        x: center.x + Math.cos(orbit) * this.orbitRadius * this.cluster.spreadX * pulse * looseness,
        y: center.y + Math.sin(orbit * 0.94 + this.phase * 0.08) * this.orbitRadius * this.cluster.spreadY * pulse
      };
    }

    applyMousePull(mouse) {
      const dx = mouse.smoothX - this.x;
      const dy = mouse.smoothY - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 0.001 || distance > mouse.radius) {
        return;
      }

      const pull = Math.pow(1 - distance / mouse.radius, 2);
      const strength = this.role === 'hub' ? 0.18 : this.role === 'node' ? 0.48 : 0.62;

      this.vx += (dx / distance) * pull * strength;
      this.vy += (dy / distance) * pull * strength;
    }

    applyRipple(ripple) {
      const dx = this.x - ripple.x;
      const dy = this.y - ripple.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 0.001) {
        return;
      }

      const band = 38;
      const wave = 1 - Math.abs(distance - ripple.radius) / band;

      if (wave <= 0) {
        return;
      }

      const strength = wave * ripple.life * (this.role === 'hub' ? 0.65 : this.role === 'node' ? 1.35 : 1.7);
      this.vx += (dx / distance) * strength;
      this.vy += (dy / distance) * strength;
    }

    draw(ctx, palette, quietFactor, tick, activity) {
      const color = this.isAccent ? palette.orange : this.role === 'hub' ? palette.deepBlue : palette.nodeBlue;
      const baseAlpha = this.role === 'hub' ? 0.88 : this.role === 'node' ? 0.7 : 0.56;
      const radiusPulse = this.role === 'hub' ? 1 + Math.sin(tick * 0.006 + this.phase) * 0.04 : 1;
      const activePulse = 1 + activity * (this.role === 'hub' ? 0.16 : 0.1);
      const radius = this.radius * radiusPulse;
      const alpha = baseAlpha * quietFactor * (0.88 + activity * 0.28);

      ctx.save();

      if (this.role === 'hub') {
        ctx.strokeStyle = rgba(this.isAccent ? palette.orange : palette.deepBlue, (0.17 + activity * 0.12) * quietFactor);
        ctx.lineWidth = 1 + activity * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * activePulse + 8.2 + activity * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (this.isAccent) {
        ctx.fillStyle = rgba(palette.hotOrange, (0.09 + activity * 0.09) * quietFactor);
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * activePulse + 6.8 + activity * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius * activePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const selectorContains = (selector, value) => selector.indexOf(value) !== -1;

  document.addEventListener('DOMContentLoaded', () => {
    new LivingWorkflowGraph('hero-canvas');
  });
})();
