/* ============================================================
   DIGITAL LIBRARY — Shared JavaScript (library.js)
   Shared by: index.html (home) and dashboard.html
   ============================================================ */

// ── BOOK DATA ─────────────────────────────────────────────
const BOOKS = [
  { id:1,  title:"Atomic Habits",                      author:"James Clear",       category:"Self-Help",  cover:"📘", description:"An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life with tiny changes in behaviour that deliver remarkable results." },
  { id:2,  title:"Rich Dad Poor Dad",                  author:"Robert Kiyosaki",   category:"Finance",    cover:"💰", description:"What the Rich Teach Their Kids About Money. A personal finance classic that challenges conventional wisdom about wealth." },
  { id:3,  title:"The Alchemist",                      author:"Paulo Coelho",      category:"Fiction",    cover:"🌟", description:"A magical tale of following your dreams. A shepherd boy named Santiago travels from Spain to Egypt in search of treasure and destiny." },
  { id:4,  title:"Think and Grow Rich",                author:"Napoleon Hill",     category:"Self-Help",  cover:"🚀", description:"The landmark bestseller that teaches you the 13 principles of success that have made countless millionaires and billionaires." },
  { id:5,  title:"Sapiens",                            author:"Yuval Noah Harari", category:"History",    cover:"🗿", description:"A Brief History of Humankind. From the Stone Age to the modern age, Sapiens explores how Homo sapiens came to dominate Earth." },
  { id:6,  title:"The Psychology of Money",            author:"Morgan Housel",     category:"Finance",    cover:"💵", description:"Timeless lessons on wealth, greed, and happiness. Why understanding the psychology of money is crucial for financial success." },
  { id:7,  title:"Dune",                               author:"Frank Herbert",     category:"Sci-Fi",     cover:"🌌", description:"The epic science fiction masterpiece set on the desert planet Arrakis. Winner of the Hugo and Nebula Awards." },
  { id:8,  title:"Clean Code",                         author:"Robert C. Martin",  category:"Technology", cover:"💻", description:"A Handbook of Agile Software Craftsmanship. Essential reading for software developers who want to write clean, maintainable code." },
  { id:9,  title:"The Subtle Art of Not Giving a F*ck",author:"Mark Manson",       category:"Self-Help",  cover:"🤷", description:"A Counterintuitive Approach to Living a Good Life. Stop trying to be positive all the time and embrace life's challenges." },
  { id:10, title:"Educated",                           author:"Tara Westover",     category:"Biography",  cover:"📚", description:"A Memoir. An inspiring story of self-education and breaking free from a restrictive upbringing to attend university." },
  { id:11, title:"The Midnight Library",               author:"Matt Haig",         category:"Fiction",    cover:"🌙", description:"Between life and death there is a library. A novel about all the lives you could live and the choices that define us." },
  { id:12, title:"The Pragmatic Programmer",           author:"Andrew Hunt",       category:"Technology", cover:"🛠️", description:"Your journey to mastery. Practical advice for software developers from some of the best in the field." }
];

// ── LOCAL STORAGE HELPERS ─────────────────────────────────
function getLS(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
function setLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getIssued()    { return getLS('issued'); }
function getFavorites() { return getLS('favorites'); }
function getReading()   { return getLS('reading'); }
function getCompleted() { return getLS('completed'); }

// ── TOAST ─────────────────────────────────────────────────
function toast(msg, type = 'success') {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

// ── DARK MODE ─────────────────────────────────────────────
function initDarkMode() {
  if (localStorage.getItem('dark') === '1') {
    document.body.classList.add('dark');
    const btn = document.getElementById('darkBtn');
    if (btn) btn.textContent = '☀️';
  }
}

function toggleDark() {
  document.body.classList.toggle('dark');
  const btn = document.getElementById('darkBtn');
  if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  localStorage.setItem('dark', document.body.classList.contains('dark') ? '1' : '');
}

// ── SIDEBAR ───────────────────────────────────────────────
let _sidebarOpen = true;
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (!sb) return;
  if (window.innerWidth < 768) {
    sb.classList.toggle('mobile-open');
    if (bd) bd.classList.toggle('show');
  } else {
    _sidebarOpen = !_sidebarOpen;
    sb.classList.toggle('hidden', !_sidebarOpen);
  }
}

// ── BOOK ACTIONS (shared) ─────────────────────────────────
function issueBook(id, e) {
  if (e) e.stopPropagation();
  const issued = getIssued();
  if (issued.includes(id)) { toast('Already issued!', 'warning'); return; }
  issued.push(id);
  setLS('issued', issued);
  addActivity(`Issued "${BOOKS.find(b=>b.id===id)?.title}"`, 'issue');
  toast('Book issued! 📚', 'success');
  if (typeof afterAction === 'function') afterAction();
}

function returnBook(id, e) {
  if (e) e.stopPropagation();
  setLS('issued',    getIssued().filter(x => x !== id));
  setLS('reading',   getReading().filter(x => x !== id));
  setLS('completed', getCompleted().filter(x => x !== id));
  addActivity(`Returned "${BOOKS.find(b=>b.id===id)?.title}"`, 'return');
  toast('Book returned.', 'info');
  if (typeof afterAction === 'function') afterAction();
}

function startReading(id, e) {
  if (e) e.stopPropagation();
  const reading = getReading();
  if (!reading.includes(id)) { reading.push(id); setLS('reading', reading); }
  addActivity(`Started reading "${BOOKS.find(b=>b.id===id)?.title}"`, 'reading');
  toast('Started reading! 📖', 'success');
  if (typeof afterAction === 'function') afterAction();
}

function markDone(id, e) {
  if (e) e.stopPropagation();
  const completed = getCompleted();
  if (!completed.includes(id)) { completed.push(id); setLS('completed', completed); }
  setLS('reading', getReading().filter(x => x !== id));
  const prog = JSON.parse(localStorage.getItem('progress') || '{}');
  prog[id] = 100;
  localStorage.setItem('progress', JSON.stringify(prog));
  addActivity(`Completed "${BOOKS.find(b=>b.id===id)?.title}"! 🎉`, 'complete');
  toast('Marked as completed! 🎉', 'success');
  if (typeof afterAction === 'function') afterAction();
}

function toggleFav(id, e) {
  if (e) e.stopPropagation();
  let favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx > -1) { favs.splice(idx, 1); toast('Removed from wishlist', 'info'); }
  else           { favs.push(id);       toast('Added to wishlist! ⭐', 'success'); }
  setLS('favorites', favs);
  if (typeof afterAction === 'function') afterAction();
}

function saveNote(id, val) {
  localStorage.setItem(`note_${id}`, val);
}

function updateProgress(id, val) {
  const prog = JSON.parse(localStorage.getItem('progress') || '{}');
  prog[id] = parseInt(val);
  localStorage.setItem('progress', JSON.stringify(prog));
  const pct  = document.getElementById('progPct');
  const fill = document.getElementById('progFill');
  if (pct)  pct.textContent    = val + '%';
  if (fill) fill.style.width   = val + '%';
  if (parseInt(val) === 100) markDone(id, null);
}

// ── ACTIVITY LOG ─────────────────────────────────────────
function addActivity(message, type = 'info') {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  activities.unshift({ id: Date.now(), message, type, timestamp: new Date().toISOString() });
  if (activities.length > 20) activities.splice(20);
  localStorage.setItem('activities', JSON.stringify(activities));
}

function getTimeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function activityIcon(type) {
  return { issue:'📚', return:'🔄', favorite:'❤️', reading:'📖', complete:'✅' }[type] || '📝';
}

// ── SHARED BOOK MODAL ─────────────────────────────────────
function openModal(id) {
  const book = BOOKS.find(b => b.id === id);
  if (!book) return;

  const issued = getIssued(), reading = getReading(), completed = getCompleted(), favs = getFavorites();
  const isIssued  = issued.includes(id);
  const isReading = reading.includes(id);
  const isDone    = completed.includes(id);
  const isFav     = favs.includes(id);
  const prog      = (JSON.parse(localStorage.getItem('progress') || '{}'))[id] || (isDone ? 100 : 0);
  const note      = localStorage.getItem(`note_${id}`) || '';

  const titleBar = document.getElementById('modalTitleBar');
  const body     = document.getElementById('modalBody');
  if (!titleBar || !body) return;

  titleBar.textContent = book.category;

  let actionBtns = '';
  if (isIssued) {
    if (!isDone) {
      actionBtns += isReading
        ? `<button class="modal-btn-green" onclick="markDone(${id},null);openModal(${id})">✅ Mark Completed</button>`
        : `<button class="modal-btn-green" onclick="startReading(${id},null);openModal(${id})">📖 Start Reading</button>`;
    }
    actionBtns += `<button class="modal-btn-danger" onclick="returnBook(${id},null)">↩ Return Book</button>`;
  } else {
    actionBtns += `<button class="modal-btn-primary" onclick="issueBook(${id},null);openModal(${id})">📚 Issue Book</button>`;
  }
  actionBtns += `<button class="modal-btn-secondary" onclick="toggleFav(${id},null);openModal(${id})">${isFav ? '💔 Remove' : '⭐ Wishlist'}</button>`;

  body.innerHTML = `
    <div class="modal-cover">${book.cover}</div>
    <div class="modal-cat">${book.category}</div>
    <div class="modal-book-title">${book.title}</div>
    <div class="modal-author">by ${book.author}</div>
    <p class="modal-desc">${book.description}</p>
    ${isIssued ? `
    <div class="reading-progress-wrap">
      <div class="reading-progress-label"><span>Reading Progress</span><span id="progPct">${prog}%</span></div>
      <div class="reading-progress-bar"><div class="reading-progress-fill" id="progFill" style="width:${prog}%"></div></div>
      <input type="range" class="progress-range" min="0" max="100" value="${prog}" oninput="updateProgress(${id},this.value)">
    </div>` : ''}
    <div class="modal-actions">${actionBtns}</div>
    <textarea class="notes-area" placeholder="Your notes about this book…" onchange="saveNote(${id},this.value)">${note}</textarea>
  `;

  document.getElementById('bookModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const m = document.getElementById('bookModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

// close on backdrop click
document.addEventListener('DOMContentLoaded', () => {
  const m = document.getElementById('bookModal');
  if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  initDarkMode();
});
