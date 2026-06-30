/* 메인 애플리케이션 제어 스크립트 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 취득
  const languageToggleBtn = document.getElementById('language-toggle');
  const languageFlag = document.getElementById('language-flag');
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
  const workflowReelSection = document.getElementById('system-reel');
  const workflowReelVideo = document.querySelector('.workflow-reel-video');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LANGUAGE_STORAGE_KEY = 'language';
  const JAPANESE_TEXT = {
    '본문 바로가기': '本文へスキップ',
    'Home': 'ホーム',
    'About': '私について',
    'Focus': '注力',
    'Skills': 'スキル',
    'Projects': 'プロジェクト',
    'Contact': '連絡先',
    'Building AI-Powered Tools &': 'AIで動くツールと',
    'Interactive Systems': 'インタラクティブシステムを構築',
    '데이터 수집, AI 작성 흐름, 자동화 스크립트, 제품 UI를 연결해 반복 업무를 줄이는 도구를 만듭니다.': 'データ収集、AIライティングフロー、自動化スクリプト、プロダクトUIをつなぎ、反復作業を減らすツールを作ります。',
    'View Projects': 'プロジェクトを見る',
    'Contact Me': '連絡する',
    'AI Writing Flow': 'AIライティングフロー',
    'Evidence-grounded Drafting': '根拠に基づくドラフト作成',
    'Data Pipeline': 'データパイプライン',
    'ETL & Collection': 'ETL・収集',
    'Local Automation': 'ローカル自動化',
    'PowerShell & CLI Tools': 'PowerShell・CLIツール',
    'AI/CV Experiment': 'AI・CV実験',
    'YOLO & TensorRT': 'YOLO・TensorRT',
    'System Reel': 'システムリール',
    'From Signals to Shipped Tools': 'シグナルから実用ツールへ',
    '공개 데이터 수집, AI 처리, 검증, 자동화, 제품화까지 이어지는 흐름을 실행 가능한 시스템으로 엮습니다.': '公開データの収集、AI処理、検証、自動化、プロダクト化まで続く流れを、実行可能なシステムとして組み上げます。',
    'About Me': '私について',
    'e스포츠 데이터 분석 활동을 계기로 IT와 자동화에 관심을 가지게 되었고, 현재는 AI와 데이터 자동화를 활용해 반복적인 과제를 줄이는 도구를 만들고 있습니다.': 'eスポーツでのデータ分析活動をきっかけに、ITと自動化に関心を持つようになりました。現在は、AIとデータ自動化を活用して、反復的な課題を減らすツールづくりに取り組んでいます。',
    '개인 프로젝트에서는 구인 정보 수집, 문서 추출, AI 자기소개서 작성처럼 흩어진 작업을 하나의 흐름으로 연결하고, 자동화 작업에서는 실행 전 승인, 결과 검증, 기록이 남는 구조를 설계해 왔습니다.': '個人開発では、求人情報の収集、文書抽出、AIによる自己紹介文作成のように分かれている作業を一つの流れとしてつなぎ、自動化系の開発では、実行前の承認、結果の検証、記録が残る仕組みを意識して設計してきました。',
    'React/Vite, Express, Spring Boot, Python ETL, PowerShell, GitHub Actions 등을 다루며, 빠른 실험을 실제로 사용할 수 있는 풀스택 시스템으로 정리하는 개발을 지향합니다.': 'React/Vite、Express、Spring Boot、Python ETL、PowerShell、GitHub Actionsなどを扱い、素早い実験を実際に使えるフルスタックな仕組みとして整理する開発を志向しています。',
    '이성호': 'イ・ソンホ',
    '데이터 분석에서 출발해, AI와 자동화로 가치를 만드는 주니어 개발자': 'データ分析から始まり、AIと自動化で価値を生み出すジュニア開発者',
    '주력': '注力',
    'AI 서비스 흐름 기획 · 자동화 구현': 'AIサービスフロー設計・自動化実装',
    '기술': '技術',
    'React/Vite · Python ETL · GenAI/Codex': 'React/Vite・Python ETL・GenAI/Codex',
    '깃허브': 'GitHub',
    '자세': '姿勢',
    '"기획하고, 구현하고, 검증합니다"': '"企画し、実装し、検証します"',
    'Focus Areas': '注力領域',
    '로컬 실험에서 실제 서비스 흐름까지 이어지도록, 수집·AI·구현·검증을 한 사이클로 다룹니다.': 'ローカル実験から実サービスの流れまでつながるように、収集・AI・実装・検証を1つのサイクルとして扱います。',
    'Collect': '収集',
    'Data Collection & ETL': 'データ収集・ETL',
    '채용공고, 영화 상영 정보, 문서 본문처럼 흩어진 공개 데이터를 수집하고 표준 JSON과 DB 흐름으로 정규화합니다.': '求人情報、映画上映情報、文書本文のように散在する公開データを収集し、標準JSONとDBの流れへ正規化します。',
    'Reason': '設計',
    'AI Workflow Design': 'AIワークフロー設計',
    '사용자 경험을 먼저 구조화하고, 부족한 정보를 확인한 뒤, 근거가 연결된 초안과 리포트를 생성하는 AI 흐름을 설계합니다.': 'ユーザー体験を先に構造化し、不足情報を確認したうえで、根拠とつながるドラフトやレポートを生成するAIフローを設計します。',
    'Build': '実装',
    'Full-stack Product Dev': 'フルスタックプロダクト開発',
    'React/Vite 화면, Express·Spring Boot API, DB 마이그레이션을 연결해 데모가 아니라 끝까지 흐르는 기능을 만듭니다.': 'React/Vite画面、Express・Spring Boot API、DBマイグレーションを接続し、デモで終わらない一連の機能を作ります。',
    'Automate': '自動化',
    'Automation & Review': '自動化・レビュー',
    'PowerShell, CLI, Codex 작업 루프, 보안 리뷰 흐름을 묶어 승인·실행·검증·기록이 남는 도구를 구성합니다.': 'PowerShell、CLI、Codex作業ループ、セキュリティレビューの流れをまとめ、承認・実行・検証・記録が残るツールを構成します。',
    'Skills System': 'スキルシステム',
    '다양한 레이어에서 효율적인 해결책을 구성하기 위해 습득한 기술 스택입니다.': '複数のレイヤーで効率的な解決策を構成するために身につけた技術スタックです。',
    'Interface Layer': 'インターフェース層',
    'Service Layer': 'サービス層',
    'Data Layer': 'データ層',
    'AI Layer': 'AI層',
    'Automation Layer': '自動化層',
    'Quality Layer': '品質層',
    'Selected Projects': '主なプロジェクト',
    'AI 작성 흐름, 자동화, 로컬 도구, 컴퓨터 비전 실험을 실제 작업으로 구현한 기록입니다.': 'AIライティングフロー、自動化、ローカルツール、コンピュータビジョン実験を実作業として形にした記録です。',
    '채용공고 탐색, 문서 추출, AI 자기소개서 작성 흐름을 연결한 취업 지원 서비스': '求人探索、文書抽出、AI自己紹介書作成の流れをつないだ就職支援サービス',
    '주요 역할 및 기여': '主な役割と貢献',
    '공고 수집 ETL, AI 작성 단계 설계, 첨부 문서 본문 추출, AI provider 라우팅과 fallback demo 경로, React/Express 기능 연결을 맡았습니다.': '求人収集ETL、AI作成ステップ設計、添付文書本文抽出、AI providerルーティングとfallback demo経路、React/Express機能連携を担当しました。',
    '거친 요청을 감사 가능한 Goal mode 목표로 바꾸는 Codex skill과 /goalplz 프롬프트': '粗い依頼を監査可能なGoal mode目標へ変換するCodex skillと/goalplzプロンプト',
    '목표 문장, 성공 기준, 제약, 검증 관점을 한 번에 정리해 Codex 작업을 추적 가능한 실행 단위로 고정하는 흐름을 설계했습니다.': '目標文、成功基準、制約、検証観点を一度に整理し、Codex作業を追跡可能な実行単位へ固定する流れを設計しました。',
    '요청 입력': '依頼入力',
    '목표 고정': '目標固定',
    '검증 기준': '検証基準',
    'RAW 사진 분석부터 보정 후보, 미리보기, JPEG/PNG export까지 이어지는 로컬 사진 보정 추천 도구': 'RAW写真分析から補正候補、プレビュー、JPEG/PNG exportまでつながるローカル写真補正推薦ツール',
    '히스토그램 기반 이미지 분석, 스타일 목표 해석, 로컬 preview/export 흐름, Python 백엔드와 React UI, Windows용 설치 CLI를 구성했습니다.': 'ヒストグラムベースの画像分析、スタイル目標の解釈、ローカルpreview/exportフロー、PythonバックエンドとReact UI、Windows向けインストールCLIを構成しました。',
    'R5 AI Agent Lab': 'R5 AIエージェントラボ',
    'R5Reloaded private/local 환경에서 화면 인식, 행동 정책, human motor layer, safety-gated input backend를 연결한 autonomous FPS agent 연구 파이프라인': 'R5Reloadedのprivate/local環境で、画面認識、行動policy、human motor layer、safety-gated input backendを接続したautonomous FPS agent研究パイプライン',
    'YOLO26n TensorRT detector, visible bbox tracker, BC50 policy, Human Motor Layer, Null/SendInput backend, F9/F10 safety gate를 분리해 observe, shadow, armed dummy control 검증 흐름을 구성했습니다.': 'YOLO26n TensorRT detector、visible bbox tracker、BC50 policy、Human Motor Layer、Null/SendInput backend、F9/F10 safety gateを分離し、observe、shadow、armed dummy controlの検証フローを構成しました。',
    'Project Archive': 'プロジェクトアーカイブ',
    'Other Builds & Experiments': 'その他の開発・実験',
    '다양한 실험, 개발 기록들이 보관되어 있습니다.': 'さまざまな実験と開発記録をまとめています。',
    'Data': 'データ',
    'CGV, 롯데시네마, 메가박스 상영 데이터를 수집하고 비교 가능한 구조로 정리하는 도구': 'CGV、ロッテシネマ、メガボックスの上映データを収集し、比較可能な構造へ整理するツール',
    'Automation': '自動化',
    '후보 탐색부터 로컬 검증과 제출 준비까지 이어지는 승인 기반 작업 루프': '候補探索からローカル検証、提出準備までつながる承認ベースの作業ループ',
    'Codex 작업을 선택, 승인, 검증, 기록까지 통제하는 프로젝트 세션 오케스트레이션 도구': 'Codex作業の選択、承認、検証、記録まで制御するプロジェクトセッションオーケストレーションツール',
    'Vision': 'ビジョン',
    '학습된 YOLO 모델을 ONNX와 TensorRT로 변환하고 로컬 추론 결과를 비교한 실험 기록': '学習済みYOLOモデルをONNXとTensorRTへ変換し、ローカル推論結果を比較した実験記録',
    'Desktop': 'デスクトップ',
    'Shimeji-ee 엔진과 커스텀 이미지셋을 통합한 런처, 스프라이트, 패키징 실험': 'Shimeji-eeエンジンとカスタム画像セットを統合したランチャー、スプライト、パッケージング実験',
    'Email': 'メール',
    'Contact Connection': 'お問い合わせ',
    '프로젝트, 협업, 자동화 아이디어를 빠르게 이어갈 수 있습니다.': 'プロジェクト、協業、自動化アイデアをすばやく次の動きへつなげられます。',
    'Copy Email': 'メールをコピー',
    'Open Source Trace': 'オープンソースの記録',
    '작게 실험하고, 필요한 도구를 만들고, 기록으로 남깁니다.': '小さく試し、必要なツールを作り、記録として残します。',
    'Visit GitHub': 'GitHubを見る'
  };
  const LOCALIZED_UI = {
    ko: {
      documentTitle: 'Sungho Lee | AI & Data Automation Full-Stack Developer',
      metaDescription: 'AI 워크플로우, 데이터 수집, 자동화, 풀스택 개발을 연결해 실용적인 도구를 만드는 개발자 이성호의 포트폴리오입니다.',
      languageToggleAria: '언어 전환: 현재 한국어',
      themeToggleAria: '테마 전환',
      githubAria: 'GitHub 바로가기',
      menuToggleAria: '메뉴 토글',
      mainNavAria: '메인 내비게이션',
      workflowReelAria: 'AI workflow and product building reel',
      focusPipelineAria: '문제 해결 파이프라인',
      relatedKeywordsAria: '관련 키워드',
      skillsMapAria: '기술 스택 시스템 맵',
      projectArchiveAria: 'Project Archive',
      copyEmailAria: '이메일 주소 클립보드에 복사',
      neet2workAlt: 'Neet2Work main frontend screen',
      photoEditerAlt: 'photoEditer frontend screen with a loaded photo and visible histogram',
      toastEmailCopied: '이메일 주소가 클립보드에 복사되었습니다.',
      toastEmailCopyFailed: '클립보드 복사에 실패했습니다.'
    },
    ja: {
      documentTitle: 'Sungho Lee | AI・データ自動化フルスタック開発者',
      metaDescription: 'AIワークフロー、データ収集、自動化、フルスタック開発をつなぎ、実用的なツールを作る開発者イ・ソンホのポートフォリオです。',
      languageToggleAria: '言語切替: 現在は日本語',
      themeToggleAria: 'テーマ切替',
      githubAria: 'GitHubへ移動',
      menuToggleAria: 'メニュー切替',
      mainNavAria: 'メインナビゲーション',
      workflowReelAria: 'AIワークフローとプロダクト開発のリール',
      focusPipelineAria: '課題解決パイプライン',
      relatedKeywordsAria: '関連キーワード',
      skillsMapAria: '技術スタックシステムマップ',
      projectArchiveAria: 'プロジェクトアーカイブ',
      copyEmailAria: 'メールアドレスをクリップボードへコピー',
      neet2workAlt: 'Neet2Workのメインフロントエンド画面',
      photoEditerAlt: '写真を読み込みヒストグラムが表示されたphotoEditerのフロントエンド画面',
      toastEmailCopied: 'メールアドレスをクリップボードにコピーしました。',
      toastEmailCopyFailed: 'クリップボードへのコピーに失敗しました。'
    }
  };
  const ATTRIBUTE_TRANSLATIONS = [
    { selector: 'nav', attr: 'aria-label', key: 'mainNavAria' },
    { selector: '.workflow-reel-video', attr: 'aria-label', key: 'workflowReelAria' },
    { selector: '.focus-pipeline', attr: 'aria-label', key: 'focusPipelineAria' },
    { selector: '.focus-node-tags', attr: 'aria-label', key: 'relatedKeywordsAria' },
    { selector: '.skills-system-map', attr: 'aria-label', key: 'skillsMapAria' },
    { selector: '.project-archive', attr: 'aria-label', key: 'projectArchiveAria' },
    { selector: '#copy-email-btn', attr: 'aria-label', key: 'copyEmailAria' },
    { selector: '.project-preview-neet2work .project-preview-image', attr: 'alt', key: 'neet2workAlt' },
    { selector: '.project-preview-photoediter .project-preview-image', attr: 'alt', key: 'photoEditerAlt' }
  ];

  const normalizeLanguage = (language) => language === 'ja' ? 'ja' : 'ko';
  let currentLanguage = normalizeLanguage(document.documentElement.getAttribute('lang'));

  const collectTranslatableTextNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const key = node.nodeValue.trim();
        const parent = node.parentElement;

        if (!key || !parent) {
          return NodeFilter.FILTER_REJECT;
        }

        if (parent.closest('script, style, noscript, #toast')) {
          return NodeFilter.FILTER_REJECT;
        }

        return JAPANESE_TEXT[key] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    let node = walker.nextNode();

    while (node) {
      nodes.push({
        node,
        originalText: node.nodeValue,
        key: node.nodeValue.trim()
      });
      node = walker.nextNode();
    }

    return nodes;
  };

  const translatableTextNodes = collectTranslatableTextNodes();

  const getLocalizedUi = () => LOCALIZED_UI[currentLanguage] || LOCALIZED_UI.ko;

  const updateLanguageToggle = () => {
    if (!languageToggleBtn) return;

    const flagSrc = currentLanguage === 'ja'
      ? languageFlag?.dataset.flagJa
      : languageFlag?.dataset.flagKo;

    if (languageFlag && flagSrc) {
      languageFlag.setAttribute('src', flagSrc);
    }

    languageToggleBtn.setAttribute('aria-label', getLocalizedUi().languageToggleAria);
    languageToggleBtn.setAttribute('aria-pressed', String(currentLanguage === 'ja'));
    languageToggleBtn.setAttribute('title', getLocalizedUi().languageToggleAria);
  };

  const applyLanguage = (language, persist = true) => {
    currentLanguage = normalizeLanguage(language);
    const ui = getLocalizedUi();
    const metaDescription = document.querySelector('meta[name="description"]');

    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('data-language', currentLanguage);
    document.title = ui.documentTitle;

    if (metaDescription) {
      metaDescription.setAttribute('content', ui.metaDescription);
    }

    if (persist) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    }

    translatableTextNodes.forEach(({ node, originalText, key }) => {
      const translatedText = currentLanguage === 'ja' ? JAPANESE_TEXT[key] : key;
      node.nodeValue = originalText.replace(key, translatedText);
    });

    ATTRIBUTE_TRANSLATIONS.forEach(({ selector, attr, key }) => {
      document.querySelectorAll(selector).forEach(element => {
        element.setAttribute(attr, ui[key]);
      });
    });

    themeToggleBtn.setAttribute('aria-label', ui.themeToggleAria);
    menuToggleBtn.setAttribute('aria-label', ui.menuToggleAria);
    document.querySelectorAll('a[aria-label="GitHub 바로가기"], a[aria-label="GitHubへ移動"]').forEach(link => {
      link.setAttribute('aria-label', ui.githubAria);
    });

    if (toast && !toast.classList.contains('active')) {
      toast.textContent = ui.toastEmailCopied;
    }

    updateLanguageToggle();
  };

  const showToast = (messageKey) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toast.textContent = getLocalizedUi()[messageKey];
    toast.classList.add('active');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 2000);
  };

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

  applyLanguage(currentLanguage, false);
  if (languageToggleBtn) {
    languageToggleBtn.addEventListener('click', () => {
      const nextLanguage = currentLanguage === 'ja' ? 'ko' : 'ja';
      applyLanguage(nextLanguage);
    });
  }

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

  // 모션 감축 선호 사용자는 자동 재생 비디오 루프를 멈춤
  if (workflowReelVideo) {
    const syncWorkflowReelMotion = () => {
      if (reducedMotionQuery.matches) {
        workflowReelVideo.pause();
        workflowReelVideo.removeAttribute('autoplay');
      } else {
        workflowReelVideo.play().catch(() => {});
      }
    };

    syncWorkflowReelMotion();
    reducedMotionQuery.addEventListener('change', syncWorkflowReelMotion);
  }

  // 스크롤 진행도에 맞춰 시스템 릴 프레임을 Antigravity처럼 scale로 확장
  if (workflowReelSection) {
    let reelTicking = false;
    const workflowReelTrack = workflowReelSection.querySelector('.video-reel-scroll-track');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const updateWorkflowReelScale = () => {
      const rect = (workflowReelTrack || workflowReelSection).getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const rawProgress = (viewportHeight * 0.92 - rect.top) / (viewportHeight * 0.56);
      const progress = reducedMotionQuery.matches ? 1 : clamp(rawProgress, 0, 1);
      const easedProgress = easeOutCubic(progress);
      const scale = 0.52 + 0.48 * easedProgress;
      const shadowAlpha = 0.14 + 0.1 * easedProgress;

      workflowReelSection.style.setProperty('--reel-scale', scale.toFixed(4));
      workflowReelSection.style.setProperty('--reel-shadow-alpha', shadowAlpha.toFixed(3));
    };

    const requestWorkflowReelScale = () => {
      if (reelTicking) return;
      reelTicking = true;
      requestAnimationFrame(() => {
        updateWorkflowReelScale();
        reelTicking = false;
      });
    };

    updateWorkflowReelScale();
    window.addEventListener('scroll', requestWorkflowReelScale, { passive: true });
    window.addEventListener('resize', requestWorkflowReelScale);
    reducedMotionQuery.addEventListener('change', requestWorkflowReelScale);
  }

  // Focus Areas 파이프라인 진행도
  const focusPipeline = document.querySelector('.focus-pipeline');
  if (focusPipeline) {
    let focusTicking = false;
    const focusNodes = Array.from(focusPipeline.querySelectorAll('.focus-node'));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const updateFocusPipeline = () => {
      const rect = focusPipeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const rawProgress = (viewportHeight * 0.72 - rect.top) / Math.max(rect.height, 1);
      const progress = reducedMotionQuery.matches ? 1 : clamp(rawProgress, 0, 1);
      const activeIndex = clamp(Math.round(progress * (focusNodes.length - 1)), 0, focusNodes.length - 1);

      focusPipeline.style.setProperty('--focus-progress', progress.toFixed(4));
      focusNodes.forEach((node, index) => {
        node.classList.toggle('is-active', index === activeIndex);
      });
    };

    const requestFocusPipelineUpdate = () => {
      if (focusTicking) return;
      focusTicking = true;
      requestAnimationFrame(() => {
        updateFocusPipeline();
        focusTicking = false;
      });
    };

    updateFocusPipeline();
    window.addEventListener('scroll', requestFocusPipelineUpdate, { passive: true });
    window.addEventListener('resize', requestFocusPipelineUpdate);
    reducedMotionQuery.addEventListener('change', requestFocusPipelineUpdate);
  }

  // Skills System 레이어 포커스
  const skillsSystemMap = document.querySelector('.skills-system-map');
  if (skillsSystemMap) {
    const skillLayers = Array.from(skillsSystemMap.querySelectorAll('.skill-layer'));

    skillLayers.forEach(layer => {
      const activateLayer = () => {
        skillsSystemMap.classList.add('has-active');
        skillLayers.forEach(item => item.classList.toggle('is-active', item === layer));
      };

      const releaseLayer = () => {
        skillsSystemMap.classList.remove('has-active');
        skillLayers.forEach(item => item.classList.remove('is-active'));
      };

      layer.addEventListener('mouseenter', activateLayer);
      layer.addEventListener('focusin', activateLayer);
      layer.addEventListener('mouseleave', releaseLayer);
      layer.addEventListener('focusout', releaseLayer);
    });
  }

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
    const textToCopy = emailAddress.textContent.trim();

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showToast('toastEmailCopyFailed');
      return;
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast('toastEmailCopied');
      })
      .catch(() => {
        showToast('toastEmailCopyFailed');
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
