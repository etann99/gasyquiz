/* =========================================================================
   script.js — Tout le MÉCANISME de l'application (aucun texte en dur ici,
   tout vient de strings.js : STRINGS et QUESTIONS).
   Remplace l'ancienne stack React/Vite/TypeScript : pas de build, pas de
   dépendance, juste du JS qui manipule le DOM directement.
   ========================================================================= */

'use strict';

/* -------------------------------------------------------------------------
   1) i18n — équivalent de l'ancien utils/i18n.ts
   ------------------------------------------------------------------------- */
function t(keyPath, params) {
  const keys = keyPath.split('.');
  let current = STRINGS;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn('[i18n] Missing translation key:', keyPath);
      return keyPath;
    }
  }
  if (typeof current !== 'string') return keyPath;
  let result = current;
  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }
  return result;
}

/* -------------------------------------------------------------------------
   2) Answer matching — équivalent de l'ancien utils/answerMatcher.ts
      (règles inchangées : normalisation, tri de mots, Levenshtein, seuil 82%)
   ------------------------------------------------------------------------- */
const FUZZY_MATCH_THRESHOLD = 0.82;

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^\w\s]/gi, ' ')       // ponctuation -> espace
    .replace(/\s+/g, ' ')            // espaces multiples
    .trim();
}

function sortWords(text) {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  return normalized.split(' ').sort().join(' ');
}

function computeLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const distance = computeLevenshteinDistance(str1, str2);
  return 1.0 - distance / maxLen;
}

function isSingleMatch(userInput, targetAnswer, threshold) {
  const normUser = normalizeText(userInput);
  const normTarget = normalizeText(targetAnswer);
  if (!normUser || !normTarget) return false;
  if (normUser === normTarget) return true;

  const rawSimilarity = calculateSimilarity(normUser, normTarget);
  if (rawSimilarity >= threshold) return true;

  const sortedUser = sortWords(userInput);
  const sortedTarget = sortWords(targetAnswer);
  if (sortedUser === sortedTarget) return true;

  const sortedSimilarity = calculateSimilarity(sortedUser, sortedTarget);
  if (sortedSimilarity >= threshold) return true;

  return false;
}

function checkCashAnswer(userInput, correctAnswer, acceptedAlternatives, threshold) {
  acceptedAlternatives = acceptedAlternatives || [];
  threshold = threshold === undefined ? FUZZY_MATCH_THRESHOLD : threshold;
  if (!userInput || !userInput.trim()) return false;

  const candidateTargets = [];
  if (correctAnswer.includes('/')) {
    candidateTargets.push(...correctAnswer.split('/').map(p => p.trim()).filter(Boolean));
  }
  candidateTargets.push(correctAnswer);
  if (acceptedAlternatives.length > 0) candidateTargets.push(...acceptedAlternatives);

  return candidateTargets.some(candidate => isSingleMatch(userInput, candidate, threshold));
}

/* -------------------------------------------------------------------------
   3) Icônes — SVG inline (mêmes tracés que la lib d'icônes utilisée avant)
   ------------------------------------------------------------------------- */
const ICON_PATHS = {
  checkCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  trophy: '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  tv: '<path d="m17 2-5 5-5-5"/><rect width="20" height="15" x="2" y="7" rx="2"/>',
  rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  grid2x2: '<path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>'
};

function icon(name, cls) {
  return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

/* -------------------------------------------------------------------------
   4) Motifs décoratifs Zafimaniry — équivalent de ZafimaniryPattern.tsx
   ------------------------------------------------------------------------- */
function zafimaniry(variant, cls) {
  cls = cls || '';
  if (variant === 'background') {
    return `<div class="zf-bg ${cls}"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="zafimaniry-grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <polygon points="30,2 58,30 30,58 2,30" fill="none" stroke="#6B1D2F" stroke-width="1.2"/>
      <polygon points="30,12 48,30 30,48 12,30" fill="none" stroke="#C85A32" stroke-width="1"/>
      <polygon points="30,22 38,30 30,38 22,30" fill="#6B1D2F" opacity="0.4"/>
      <path d="M 0,0 L 8,8 M 60,0 L 52,8 M 0,60 L 8,52 M 60,60 L 52,52" stroke="#6B1D2F" stroke-width="1"/>
    </pattern></defs><rect width="100%" height="100%" fill="url(#zafimaniry-grid)"/></svg></div>`;
  }
  if (variant === 'strip') {
    return `<div class="zf-strip ${cls}"><svg width="100%" height="10" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="zafimaniry-strip" width="20" height="10" patternUnits="userSpaceOnUse">
      <polygon points="10,1 19,5 10,9 1,5" fill="none" stroke="#6B1D2F" stroke-width="1"/>
      <polygon points="10,2.5 15,5 10,7.5 5,5" fill="#C85A32" opacity="0.5"/>
      <circle cx="10" cy="5" r="0.8" fill="#6B1D2F"/>
    </pattern></defs><rect width="100%" height="10" fill="url(#zafimaniry-strip)"/></svg></div>`;
  }
  if (variant === 'corner-accents') {
    const corner = (posCls) => `<svg class="zf-corner ${posCls}" viewBox="0 0 16 16" fill="none">
      <polygon points="8,1 15,8 8,15 1,8" stroke="currentColor" stroke-width="1.2" fill="none"/>
      <polygon points="8,4 12,8 8,12 4,8" fill="#C85A32" opacity="0.4"/>
    </svg>`;
    return corner('zf-corner-tl') + corner('zf-corner-tr') + corner('zf-corner-bl') + corner('zf-corner-br');
  }
  if (variant === 'banner') {
    let diamonds = '';
    [0, 40, 80, 120, 160, 200, 240, 280].forEach((x) => {
      diamonds += `<g transform="translate(${x + 10}, 0)">
        <polygon points="10,1 19,10 10,19 1,10" fill="none" stroke="#6B1D2F" stroke-width="1.2"/>
        <polygon points="10,5 15,10 10,15 5,10" fill="#C85A32" opacity="0.6"/>
        <circle cx="10" cy="10" r="1.5" fill="#6B1D2F"/>
      </g>`;
    });
    return `<div class="zf-banner ${cls}"><svg width="320" height="20" viewBox="0 0 320 20" fill="none" xmlns="http://www.w3.org/2000/svg">${diamonds}</svg></div>`;
  }
  // 'divider' par défaut
  return `<div class="zf-divider ${cls}">
    <div class="zf-line"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="#6B1D2F" stroke-width="1.5"/>
      <polygon points="12,6 18,12 12,18 6,12" fill="none" stroke="#C85A32" stroke-width="1"/>
      <polygon points="12,9 15,12 12,15 9,12" fill="#6B1D2F"/>
    </svg>
    <div class="zf-line"></div>
  </div>`;
}

/* -------------------------------------------------------------------------
   5) Utilitaires d'échappement HTML
   ------------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

/* -------------------------------------------------------------------------
   6) État de l'application — équivalent du useState de App.tsx
   ------------------------------------------------------------------------- */
const state = {
  currentIndex: 0,
  selectedModes: {},   // { [questionId]: 'manta' | 'sosona' | 'efajoro' }
  results: {},          // { [questionId]: { questionId, mode, userAnswer, isCorrect, pointsEarned, timestamp } }
  showSummary: false
};

let typedInputValue = ''; // valeur transitoire du champ Manta (hors state pour ne pas perdre le focus au rendu)

function computeTotals() {
  const resultsArr = Object.values(state.results);
  const totalScore = resultsArr.reduce((acc, r) => acc + r.pointsEarned, 0);
  const answeredCount = resultsArr.length;
  return { totalScore, answeredCount };
}

/* -------------------------------------------------------------------------
   7) Actions
   ------------------------------------------------------------------------- */
function handlePrev() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    typedInputValue = '';
    render();
  }
}

function handleNext() {
  if (state.currentIndex < QUESTIONS.length - 1) {
    state.currentIndex += 1;
    typedInputValue = '';
    render();
  } else {
    state.showSummary = true;
    render();
  }
}

function handleReset() {
  if (window.confirm(t('header.confirmReset'))) {
    state.results = {};
    state.selectedModes = {};
    state.currentIndex = 0;
    state.showSummary = false;
    typedInputValue = '';
    render();
  }
}

function submitAnswer(mode, userAnswer) {
  const q = QUESTIONS[state.currentIndex];
  const isCorrect = checkCashAnswer(userAnswer, q.reponse, q.reponses_acceptees);
  let points = 0;
  if (mode === 'manta') points = isCorrect ? 5 : 0;
  else if (mode === 'efajoro') points = isCorrect ? 3 : 0;
  else points = isCorrect ? 1 : 0;

  state.results[q.id] = {
    questionId: q.id,
    mode,
    userAnswer,
    isCorrect,
    pointsEarned: points,
    timestamp: Date.now()
  };
  render();
}

/* -------------------------------------------------------------------------
   8) Rendu — chaque fonction retourne une chaîne HTML (pas de virtual DOM,
      on reconstruit #app à chaque changement d'état ; simple et suffisant
      vu la taille de l'app).
   ------------------------------------------------------------------------- */
function renderHeader(score) {
  return `
  <header class="site-header">
    <div class="header-inner">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title">${escapeHtml(t('app.title'))}</h1>
      </div>
      <div class="header-actions">
        <button id="btn-open-summary" class="score-badge" type="button">
          ${icon('trophy', 'icon-gold')}<span>${score} pts</span>
        </button>
        <button id="btn-reset" class="icon-btn" type="button" title="${escapeHtml(t('header.resetGame'))}">
          ${icon('rotateCcw')}
        </button>
      </div>
    </div>
    ${zafimaniry('strip', 'zf-strip-opacity')}
  </header>`;
}

function renderNav() {
  const items = QUESTIONS.map((q, idx) => {
    const isCurrent = idx === state.currentIndex;
    const result = state.results[q.id];
    const isAnswered = Boolean(result);
    let cls = 'nav-dot';
    if (isCurrent) cls += ' active';
    else if (isAnswered) cls += result.isCorrect ? ' correct' : ' incorrect';
    const statusDot = (isAnswered && !isCurrent)
      ? `<span class="nav-status ${result.isCorrect ? 'ok' : 'bad'}"></span>` : '';
    return `<button class="${cls}" data-idx="${idx}" type="button">${q.id}${statusDot}</button>`;
  }).join('');
  return `<div class="nav-row" id="nav-row">${items}</div>`;
}

function renderModeSelector(selectedMode, disabled) {
  const modes = [
    { mode: 'manta', label: 'Manta', pts: '5 pts' },
    { mode: 'efajoro', label: 'Efajoro', pts: '3 pts' },
    { mode: 'sosona', label: 'Sosona', pts: '1 pt' }
  ];
  const items = modes.map(({ mode, label, pts }) => {
    const isSelected = selectedMode === mode;
    return `<button class="mode-btn ${isSelected ? 'selected' : ''}" data-mode="${mode}" type="button" ${disabled ? 'disabled' : ''}>
      <span>${label}</span><span class="mode-pts ${isSelected ? 'selected' : ''}">${pts}</span>
    </button>`;
  }).join('');
  return `<div class="mode-selector">${items}</div>`;
}

function renderQuestionCard(q, result, selectedMode) {
  let answerArea = '';

  if (selectedMode === 'manta') {
    answerArea = `
      <form id="manta-form" class="manta-form">
        <input type="text" id="manta-input" class="manta-input ${result ? 'answered' : ''}"
          placeholder="${escapeHtml(t('modes.manta.placeholder'))}" ${result ? 'disabled' : ''} autocomplete="off" />
        ${!result ? `<button type="submit" class="btn-submit" id="manta-submit">${icon('send')}<span>${escapeHtml(t('question.submitAnswer'))}</span></button>` : ''}
      </form>`;
  } else if (selectedMode) {
    const options = selectedMode === 'sosona' ? q.sosona : q.efajoro;
    answerArea = '<div class="options-grid">' + options.map((opt) => {
      const isUserChoice = result && result.userAnswer === opt;
      const isCorrectOption = checkCashAnswer(opt, q.reponse, q.reponses_acceptees);
      let cls = 'option-btn';
      let feedbackIcon = '';
      if (result) {
        if (isCorrectOption) { cls += ' correct'; feedbackIcon = icon('checkCircle2', 'icon-white'); }
        else if (isUserChoice && !result.isCorrect) { cls += ' incorrect'; feedbackIcon = icon('xCircle', 'icon-white'); }
        else cls += ' muted';
      }
      return `<button class="${cls}" data-value="${escapeHtml(opt)}" ${result ? 'disabled' : ''} type="button">
        <span>${escapeHtml(opt)}</span>${feedbackIcon}
      </button>`;
    }).join('') + '</div>';
  } else if (!result) {
    answerArea = `<p class="hint-text">Misafidiana fomba famaliana iray (Manta = malalaka isa 5, Efajoro = safidy 4 isa 3, Sosona = safidy 2 isa 1)</p>`;
  }

  const feedback = result ? `
    <div class="feedback ${result.isCorrect ? 'ok' : 'bad'}">
      <div class="feedback-top">
        <span class="feedback-label">${result.isCorrect ? icon('checkCircle2', 'icon-green') : icon('xCircle', 'icon-red')}${result.isCorrect ? escapeHtml(t('feedback.correct')) : escapeHtml(t('feedback.incorrect'))}</span>
        <span>${result.pointsEarned > 0 ? '+' + result.pointsEarned + ' pts' : '0 pt'}</span>
      </div>
      <p class="feedback-answer"><span class="muted-text">${escapeHtml(t('feedback.officialAnswer'))}</span> <strong>${escapeHtml(q.reponse)}</strong></p>
    </div>` : '';

  const hasPrev = state.currentIndex > 0;
  const hasNext = state.currentIndex < QUESTIONS.length - 1;

  return `
  <div class="question-card">
    ${zafimaniry('corner-accents')}
    <div class="card-top-row">
      <span class="q-index">Q${q.id}</span>
      ${result ? `<span class="mode-tag">${result.mode.toUpperCase()}</span>` : ''}
    </div>
    <div class="question-text-wrap">
      <h2 class="question-text">${escapeHtml(q.question)}</h2>
    </div>
    <div class="mode-selector-wrap">${renderModeSelector(selectedMode, Boolean(result))}</div>
    ${zafimaniry('divider', 'zf-divider-tight')}
    <div class="answer-area">${answerArea}</div>
    ${feedback}
    <div class="card-nav">
      <button id="btn-prev" class="btn-outline" type="button" ${!hasPrev ? 'disabled' : ''}>
        ${icon('arrowLeft')}<span>${escapeHtml(t('question.previousQuestion'))}</span>
      </button>
      <button id="btn-next" class="btn-primary" type="button" ${!hasNext ? 'disabled' : ''}>
        <span>${escapeHtml(t('question.nextQuestion'))}</span>${icon('arrowRight')}
      </button>
    </div>
  </div>`;
}

function renderSummaryTrigger() {
  return `<div class="summary-trigger-wrap">
    <button id="btn-summary-trigger" class="btn-summary-trigger" type="button">
      ${icon('trophy', 'icon-gold')}<span>${escapeHtml(t('summary.seeSummary'))}</span>
    </button>
  </div>`;
}

function renderScoreBoard(totalScore) {
  const resultsArr = Object.values(state.results);
  const answeredCount = resultsArr.length;
  const correctCount = resultsArr.filter((r) => r.isCorrect).length;
  const maxPossibleScore = QUESTIONS.length * 5;
  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const statsByMode = {
    manta: { count: 0, correct: 0, points: 0 },
    sosona: { count: 0, correct: 0, points: 0 },
    efajoro: { count: 0, correct: 0, points: 0 }
  };
  resultsArr.forEach((r) => {
    if (statsByMode[r.mode]) {
      statsByMode[r.mode].count += 1;
      if (r.isCorrect) statsByMode[r.mode].correct += 1;
      statsByMode[r.mode].points += r.pointsEarned;
    }
  });

  return `
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal-box">
      <button class="modal-close js-close-summary" type="button">${icon('x')}</button>

      <div class="modal-header">
        <div class="modal-trophy">${icon('trophy', 'icon-gold-lg')}</div>
        <h2 class="modal-title">${escapeHtml(t('summary.title'))}</h2>
        ${zafimaniry('banner')}
      </div>

      <div class="hero-score">
        <div class="hero-label">${escapeHtml(t('summary.finalScore'))}</div>
        <div class="hero-value">${totalScore} <span class="hero-pts">${escapeHtml(t('header.pts'))}</span></div>
        <div class="hero-max">${escapeHtml(t('summary.maxPossible', { max: maxPossibleScore }))}</div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-label">${escapeHtml(t('navigation.filterAnswered', { count: '' }))}</div>
          <div class="stat-value wine">${answeredCount} / ${QUESTIONS.length}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">${escapeHtml(t('feedback.correct'))}</div>
          <div class="stat-value green">${correctCount}</div>
        </div>
        <div class="stat-box wide">
          <div class="stat-label">${escapeHtml(t('summary.accuracy'))}</div>
          <div class="stat-value orange">${accuracyRate}%</div>
        </div>
      </div>

      <div class="mode-breakdown">
        <h3 class="breakdown-title">${escapeHtml(t('summary.statsByMode'))}</h3>
        <div class="breakdown-grid">
          <div class="breakdown-box">
            <div class="breakdown-head orange">${icon('zap', 'icon-sm')}<span>Manta</span></div>
            <div class="breakdown-value">${statsByMode.manta.correct}/${statsByMode.manta.count}</div>
            <div class="breakdown-pts">${statsByMode.manta.points} pts</div>
          </div>
          <div class="breakdown-box">
            <div class="breakdown-head blue">${icon('layers', 'icon-sm')}<span>Sosona</span></div>
            <div class="breakdown-value">${statsByMode.sosona.correct}/${statsByMode.sosona.count}</div>
            <div class="breakdown-pts">${statsByMode.sosona.points} pts</div>
          </div>
          <div class="breakdown-box">
            <div class="breakdown-head emerald">${icon('grid2x2', 'icon-sm')}<span>Efajoro</span></div>
            <div class="breakdown-value">${statsByMode.efajoro.correct}/${statsByMode.efajoro.count}</div>
            <div class="breakdown-pts">${statsByMode.efajoro.points} pts</div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button id="btn-restart" class="btn-restart" type="button">${icon('rotateCcw')}<span>${escapeHtml(t('summary.restartQuiz'))}</span></button>
        <button class="btn-primary js-close-summary" type="button">${escapeHtml(t('summary.close'))}</button>
      </div>
    </div>
  </div>`;
}

function renderApp() {
  const { totalScore, answeredCount } = computeTotals();
  const currentQuestion = QUESTIONS[state.currentIndex];
  const currentResult = state.results[currentQuestion.id];
  const currentMode = state.selectedModes[currentQuestion.id] || (currentResult && currentResult.mode) || null;

  return `
    ${zafimaniry('background', 'zf-fixed')}
    ${renderHeader(totalScore)}
    <main class="main">
      ${renderNav()}
      ${renderQuestionCard(currentQuestion, currentResult, currentMode)}
      ${answeredCount === QUESTIONS.length ? renderSummaryTrigger() : ''}
    </main>
    ${state.showSummary ? renderScoreBoard(totalScore) : ''}
  `;
}

/* -------------------------------------------------------------------------
   9) Rendu + branchement des événements
   ------------------------------------------------------------------------- */
function render() {
  const app = document.getElementById('app');
  app.innerHTML = renderApp();
  attachListeners();
}

function attachListeners() {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const openSummaryBtn = $('#btn-open-summary');
  if (openSummaryBtn) openSummaryBtn.addEventListener('click', () => { state.showSummary = true; render(); });

  const resetBtn = $('#btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', handleReset);

  $$('.nav-dot').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentIndex = parseInt(btn.dataset.idx, 10);
      typedInputValue = '';
      render();
    });
  });

  const prevBtn = $('#btn-prev');
  if (prevBtn) prevBtn.addEventListener('click', handlePrev);

  const nextBtn = $('#btn-next');
  if (nextBtn) nextBtn.addEventListener('click', handleNext);

  $$('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const q = QUESTIONS[state.currentIndex];
      state.selectedModes[q.id] = btn.dataset.mode;
      typedInputValue = '';
      render();
    });
  });

  const mantaForm = $('#manta-form');
  if (mantaForm) {
    mantaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = typedInputValue.trim();
      if (!val) return;
      submitAnswer('manta', val);
    });
  }

  const mantaInput = $('#manta-input');
  if (mantaInput) {
    mantaInput.value = typedInputValue;
    mantaInput.addEventListener('input', (e) => { typedInputValue = e.target.value; });
    if (!mantaInput.disabled) {
      mantaInput.focus();
      const v = mantaInput.value;
      mantaInput.value = '';
      mantaInput.value = v; // place le curseur à la fin
    }
  }

  $$('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const q = QUESTIONS[state.currentIndex];
      const result = state.results[q.id];
      const mode = state.selectedModes[q.id] || (result && result.mode);
      if (!mode || result) return;
      submitAnswer(mode, btn.dataset.value);
    });
  });

  const summaryTriggerBtn = $('#btn-summary-trigger');
  if (summaryTriggerBtn) summaryTriggerBtn.addEventListener('click', () => { state.showSummary = true; render(); });

  $$('.js-close-summary').forEach((btn) => {
    btn.addEventListener('click', () => { state.showSummary = false; render(); });
  });

  const restartBtn = $('#btn-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      handleReset();
      state.showSummary = false;
      render();
    });
  }
}

document.addEventListener('DOMContentLoaded', render);
