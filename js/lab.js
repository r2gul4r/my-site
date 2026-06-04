/* Interactive Lab 입자 실험실 물리 시스템 */

class LabSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.bursts = [];
    this.mouse = { x: null, y: null, radius: 100 };
    this.center = { x: 0, y: 0 };
    this.theme = 'light';
    
    this.init();
  }

  // 시스템 초기화
  init() {
    this.resizeCanvas();
    this.detectTheme();
    this.createNodes();
    this.bindEvents();
    this.animate();
  }

  // 테마 동기화
  detectTheme() {
    this.theme = document.documentElement.getAttribute('data-theme') || 'light';
  }

  // 캔버스 크기 조정 및 모바일 스케일링
  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.center.x = this.canvas.width / 2;
    this.center.y = this.canvas.height / 2;
  }

  // 데이터 노드 입자 생성 (원형 기하 구조 배치)
  createNodes() {
    this.nodes = [];
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 40 : 80;
    const ringRadius = isMobile ? 80 : 130;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      // 기하학적인 배치 타겟 설정
      const targetX = this.center.x + Math.cos(angle) * ringRadius;
      const targetY = this.center.y + Math.sin(angle) * ringRadius;
      
      const startX = Math.random() * this.canvas.width;
      const startY = Math.random() * this.canvas.height;

      this.nodes.push(new LabNode(startX, startY, targetX, targetY));
    }
  }

  // 이벤트 바인딩
  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createNodes();
    });

    const observer = new MutationObserver(() => this.detectTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // 마우스 클릭 시 시그널 버스트 트리거
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      this.triggerBurst(clickX, clickY);
    });
  }

  // 버스트 스파크 생성 함수
  triggerBurst(x, y) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const count = 25;
    for (let i = 0; i < count; i++) {
      this.bursts.push(new BurstSignal(x, y));
    }
  }

  // 메인 애니메이션 렌더링 루프
  animate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.renderStatic();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateAndDrawNodes();
    this.updateAndDrawBursts();
    
    requestAnimationFrame(() => this.animate());
  }

  // 정적 렌더링
  renderStatic() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nodes.forEach(node => {
      node.draw(this.ctx, this.theme);
    });
  }

  // 노드 업데이트 및 렌더링
  updateAndDrawNodes() {
    this.nodes.forEach((node, index) => {
      node.update(this.mouse);
      node.draw(this.ctx, this.theme);

      // 주변 노드들 간에 실시간 신호 커넥션 렌더링
      for (let j = index + 1; j < this.nodes.length; j++) {
        const dx = node.x - this.nodes[j].x;
        const dy = node.y - this.nodes[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 70) {
          const isDark = this.theme === 'dark';
          this.ctx.strokeStyle = isDark ? `rgba(96, 165, 250, ${0.1 * (1 - dist / 70)})` : `rgba(0, 85, 255, ${0.1 * (1 - dist / 70)})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(node.x, node.y);
          this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          this.ctx.stroke();
        }
      }
    });
  }

  // 버스트 스파크 업데이트 및 가비지 컬렉션
  updateAndDrawBursts() {
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const spark = this.bursts[i];
      spark.update();
      spark.draw(this.ctx, this.theme);

      if (spark.life <= 0) {
        this.bursts.splice(i, 1);
      }
    }
  }
}

// 1. 커스텀 데이터 노드 클래스
class LabNode {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.radius = 3.5;
    this.friction = 0.88;
    this.ease = 0.08;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx, theme) {
    const isDark = theme === 'dark';
    ctx.fillStyle = isDark ? '#60a5fa' : '#0055ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 외각 코어 효과
    ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(0, 85, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  update(mouse) {
    // 타겟 지점으로 서서히 복귀하는 모션 연산
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.vx += dx * this.ease;
    this.vy += dy * this.ease;

    // 마우스 회피 물리
    if (mouse.x !== null && mouse.y !== null) {
      const mDx = mouse.x - this.x;
      const mDy = mouse.y - this.y;
      const dist = Math.hypot(mDx, mDy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const pushX = (mDx / dist) * force * 15;
        const pushY = (mDy / dist) * force * 15;
        
        this.vx -= pushX;
        this.vy -= pushY;
      }
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }
}

// 2. 버스트 시그널 스파크 클래스
class BurstSignal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.015;
    this.size = Math.random() * 2 + 1;
  }

  draw(ctx, theme) {
    const isDark = theme === 'dark';
    ctx.fillStyle = isDark ? `rgba(229, 193, 88, ${this.life})` : `rgba(212, 175, 55, ${this.life})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // 중력 가속 효과
    this.life -= this.decay;
  }
}

// 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {
  new LabSystem('lab-canvas');
});
