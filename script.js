/* ================================================
   InterviewForge — Frontend Logic
   ================================================ */

// ── DOM Refs ──────────────────────────────────
const generateBtn       = document.getElementById('generateBtn');
const loadingState      = document.getElementById('loadingState');
const outputSection     = document.getElementById('outputSection');
const errorBox          = document.getElementById('errorBox');
const errorMsg          = document.getElementById('errorMsg');
const technicalList     = document.getElementById('technicalQuestions');
const hrList            = document.getElementById('hrQuestions');
const outputMeta        = document.getElementById('outputMeta');

// ── Main Generator ────────────────────────────
async function generateQuestions() {
  const role       = document.getElementById('jobRole').value.trim();
  const difficulty = document.getElementById('difficulty').value;

  // Validation
  if (!role) {
    showError('Please enter a job role before generating questions.');
    document.getElementById('jobRole').focus();
    return;
  }

  setLoadingState(true);
  hideError();
  hideOutput();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, difficulty }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result) throw new Error('No result returned from API.');

    renderOutput(data.result, role, difficulty);

  } catch (err) {
    console.error('Generation error:', err);
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoadingState(false);
  }
}

// ── Render Output ─────────────────────────────
function renderOutput(rawText, role, difficulty) {
  const { technical, hr } = parseQuestions(rawText);

  // Meta label
  outputMeta.textContent = `${role}  ·  ${difficulty} Level  ·  Generated ${formatTime()}`;

  // Render technical
  technicalList.innerHTML = '';
  technical.forEach((item, i) => {
    technicalList.appendChild(createQuestionCard(item, i + 1, 'tech'));
  });

  // Render HR
  hrList.innerHTML = '';
  hr.forEach((item, i) => {
    hrList.appendChild(createQuestionCard(item, i + 1, 'hr'));
  });

  // Animate in with stagger
  outputSection.classList.remove('hidden');
  outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Parse Raw AI Text ─────────────────────────
function parseQuestions(text) {
  const technical = [];
  const hr = [];

  // Split by === sections ===
  const techMatch = text.match(/=== Technical Questions ===([\s\S]*?)(?:=== HR Questions ===|$)/i);
  const hrMatch   = text.match(/=== HR Questions ===([\s\S]*?)$/i);

  if (techMatch) parseSection(techMatch[1], technical);
  if (hrMatch)   parseSection(hrMatch[1], hr);

  // Fallback: split on numbered patterns if sections not found
  if (technical.length === 0 && hr.length === 0) {
    const fallbackItems = parseFallback(text);
    technical.push(...fallbackItems.slice(0, 5));
    hr.push(...fallbackItems.slice(5, 8));
  }

  return { technical, hr };
}

function parseSection(sectionText, output) {
  // Match numbered questions: "1. Question text\nAnswer: answer text"
  const blocks = sectionText.split(/\n(?=\d+\.\s)/);

  blocks.forEach(block => {
    block = block.trim();
    if (!block) return;

    // Extract question number and text
    const qMatch = block.match(/^\d+\.\s*(.+?)(?:\n|$)/);
    if (!qMatch) return;

    const question = qMatch[1].trim();

    // Extract answer — look for "Answer:" label
    const answerMatch = block.match(/Answer:\s*([\s\S]+)/i);
    const answer = answerMatch
      ? answerMatch[1].trim()
      : block.replace(/^\d+\.\s*.+(\n|$)/, '').trim();

    if (question) output.push({ question, answer: answer || '—' });
  });
}

function parseFallback(text) {
  const items = [];
  const blocks = text.split(/\n(?=\d+\.\s)/);
  blocks.forEach(block => {
    const qMatch = block.match(/^\d+\.\s*(.+?)(?:\n|$)/);
    if (!qMatch) return;
    const question = qMatch[1].trim();
    const answerMatch = block.match(/Answer:\s*([\s\S]+)/i);
    const answer = answerMatch ? answerMatch[1].trim() : '';
    if (question) items.push({ question, answer });
  });
  return items;
}

// ── Create Question Card ──────────────────────
function createQuestionCard({ question, answer }, num, type) {
  const div = document.createElement('div');
  div.className = 'question-item';
  div.style.animationDelay = `${(num - 1) * 0.07}s`;

  div.innerHTML = `
    <div class="q-number">${type === 'tech' ? 'Technical' : 'HR'} Q${num}</div>
    <div class="q-text">${escapeHtml(question)}</div>
    <div class="a-label">Answer</div>
    <div class="a-text">${formatAnswer(answer)}</div>
  `;
  return div;
}

// ── Helpers ───────────────────────────────────
function setLoadingState(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.querySelector('.btn-text').textContent = isLoading ? 'Generating…' : 'Generate Questions';

  if (isLoading) {
    loadingState.classList.remove('hidden');
  } else {
    loadingState.classList.add('hidden');
  }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

function hideOutput() {
  outputSection.classList.add('hidden');
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}

function formatAnswer(text) {
  // Preserve line breaks in answers
  return escapeHtml(text).replace(/\n/g, '<br/>');
}

// ── Copy All ──────────────────────────────────
function copyAll() {
  const role       = document.getElementById('jobRole').value.trim();
  const difficulty = document.getElementById('difficulty').value;

  let output = `InterviewForge — AI Interview Questions\n`;
  output += `Role: ${role} | Level: ${difficulty}\n`;
  output += `Generated: ${new Date().toLocaleString()}\n\n`;

  output += `=== TECHNICAL QUESTIONS ===\n\n`;
  document.querySelectorAll('.tech-block .question-item').forEach((item, i) => {
    const q = item.querySelector('.q-text')?.textContent || '';
    const a = item.querySelector('.a-text')?.textContent || '';
    output += `${i + 1}. ${q}\nAnswer: ${a}\n\n`;
  });

  output += `=== HR QUESTIONS ===\n\n`;
  document.querySelectorAll('.hr-block .question-item').forEach((item, i) => {
    const q = item.querySelector('.q-text')?.textContent || '';
    const a = item.querySelector('.a-text')?.textContent || '';
    output += `${i + 1}. ${q}\nAnswer: ${a}\n\n`;
  });

  navigator.clipboard.writeText(output).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✓ Copied!';
    btn.style.color = '#4ecdc4';
    btn.style.borderColor = '#4ecdc4';
    setTimeout(() => {
      btn.innerHTML = '<span>⎘</span> Copy All';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(() => {
    alert('Copy failed. Please select and copy manually.');
  });
}

// ── Enter Key Support ─────────────────────────
document.getElementById('jobRole').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateQuestions();
});