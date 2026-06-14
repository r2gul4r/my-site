/* 스크롤 감지 및 등장 애니메이션 제어 */

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  
  // 사용자의 모션 감축 선호 여부 확인
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 모션 감축 시 모든 애니메이션 요소를 즉시 노출
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  // IntersectionObserver 옵션 설정
  const observerOptions = {
    root: null, // 뷰포트를 기준으로 감지
    rootMargin: '0px 0px -80px 0px', // 스크롤 바닥 감지 오프셋
    threshold: 0.1 // 10% 노출 시 트리거
  };

  // 요소 감지 시 호출되는 콜백 함수
  const handleReveal = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 한번 나타난 요소는 관찰 해제하여 리소스 절약
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(handleReveal, observerOptions);

  // 모든 대상 요소 관찰 시작
  revealElements.forEach(element => {
    observer.observe(element);
  });
});
