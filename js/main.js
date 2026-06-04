/* 메인 애플리케이션 제어 스크립트 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 취득
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  
  const menuToggleBtn = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const header = document.getElementById('header');
  
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailAddress = document.getElementById('email-address');
  const toast = document.getElementById('toast');
  
  const navLinks = document.querySelectorAll('.nav-link');
  const logoBtn = document.getElementById('logo-btn');

  // 다크모드/라이트모드 토글 처리 함수
  const updateThemeIcons = (theme) => {
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  };

  // 초기 테마 아이콘 설정
  const initialTheme = document.documentElement.getAttribute('data-theme');
  updateThemeIcons(initialTheme);
  themeToggleBtn.addEventListener('click', toggleTheme);

  // 모바일 메뉴 제어 함수
  const toggleMobileMenu = () => {
    menuToggleBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
  };

  const closeMobileMenu = () => {
    menuToggleBtn.classList.remove('active');
    navMenu.classList.remove('active');
  };

  menuToggleBtn.addEventListener('click', toggleMobileMenu);

  // 헤더 스크롤 클래스 토글
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 초기 로드 시 체크

  // 섹션 부드러운 스크롤 이동 함수
  const scrollToSection = (targetId) => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    closeMobileMenu();
    
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // 내비게이션 링크 클릭 이벤트 리스너
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      scrollToSection(targetId);
    });
  });

  logoBtn.addEventListener('click', () => {
    scrollToSection('hero');
  });

  // 이메일 클립보드 복사 및 토스트 출력 함수
  let toastTimeout = null;
  const copyEmailToClipboard = () => {
    const textToCopy = emailAddress.textContent;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // 기존 타임아웃 초기화
        if (toastTimeout) {
          clearTimeout(toastTimeout);
        }
        
        toast.classList.add('active');
        toastTimeout = setTimeout(() => {
          toast.classList.remove('active');
        }, 2000);
      })
      .catch(() => {
        // 복사 실패 핸들러
      });
  };

  copyEmailBtn.addEventListener('click', copyEmailToClipboard);

  // 현재 스크롤 위치에 맞춰 내비게이션 활성화 처리 (IntersectionObserver 활용 가능하나 스크롤 스파이 대체 구현)
  const spyScroll = () => {
    const scrollPosition = window.scrollY + 120; // 오프셋 반영

    navLinks.forEach(link => {
      const targetId = link.getAttribute('data-target');
      const section = document.getElementById(targetId);
      
      if (!section) return;

      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', spyScroll);

  // 프로젝트 카드 Canvas 데코 레이어 연동
  const initProjectVisuals = () => {
    const canvases = document.querySelectorAll('.project-visual-canvas');
    canvases.forEach(canvas => {
      const type = canvas.getAttribute('data-viz');
      const ctx = canvas.getContext('2d');
      let tick = 0;

      const resize = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      };

      window.addEventListener('resize', resize);
      resize();

      const drawGrid = (isDark) => {
        ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(0, 85, 255, 0.05)';
        ctx.lineWidth = 1;
        const spacing = 20;
        for (let x = 0; x < canvas.width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 85, 255, 0.1)';
        ctx.beginPath();
        const waveY = canvas.height / 2 + Math.sin(tick * 0.03) * 15;
        ctx.arc(canvas.width / 2, waveY, 4, 0, Math.PI * 2);
        ctx.fill();
      };

      const drawFlow = (isDark) => {
        ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(0, 85, 255, 0.08)';
        const count = 5;
        for (let i = 0; i < count; i++) {
          const speed = (i + 1) * 0.5;
          const x = (tick * speed) % (canvas.width + 40) - 20;
          const y = (canvas.height / (count + 1)) * (i + 1);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const drawParticles = (isDark) => {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)';
        const pCount = 8;
        for (let i = 0; i < pCount; i++) {
          const angle = (i * Math.PI * 2) / pCount + tick * 0.01;
          const x = canvas.width / 2 + Math.cos(angle) * 40;
          const y = canvas.height / 2 + Math.sin(angle * 1.5) * 30;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      const drawDetect = (isDark) => {
        const center = { x: canvas.width / 2, y: canvas.height / 2 };
        const boxSize = 60 + Math.sin(tick * 0.05) * 10;
        ctx.strokeStyle = isDark ? 'rgba(229, 193, 88, 0.25)' : 'rgba(212, 175, 55, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(center.x - boxSize / 2, center.y - boxSize / 2, boxSize, boxSize);
        ctx.beginPath();
        ctx.moveTo(center.x - 5, center.y);
        ctx.lineTo(center.x + 5, center.y);
        ctx.moveTo(center.x, center.y - 5);
        ctx.lineTo(center.x, center.y + 5);
        ctx.stroke();
      };

      const render = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        tick++;

        if (type === 'grid') drawGrid(isDark);
        else if (type === 'flow') drawFlow(isDark);
        else if (type === 'particles') drawParticles(isDark);
        else if (type === 'detect') drawDetect(isDark);

        requestAnimationFrame(render);
      };

      render();
    });
  };

  initProjectVisuals();
});
