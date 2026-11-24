const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
const initials = (n) =>
  n
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
const PALETTE = [
  ['#0054A5', '#002855'],
  ['#009CDE', '#0054A5'],
  ['#4FB3D9', '#0077A8'],
  ['#003872', '#001A3A'],
  ['#0077C8', '#004A8C'],
  ['#00B4E6', '#009CDE'],
];
const grad = (i) =>
  `linear-gradient(140deg,${PALETTE[i % PALETTE.length][0]},${
    PALETTE[i % PALETTE.length][1]
  })`;

(() => {
  const words = [
    'Математический анализ',
    'Высшая алгебра',
    'Общая топология',
    'Функциональный анализ',
    'Теория вероятностей',
    'Дифференциальная геометрия',
    'Спецсеминары',
    'ТФКП',
    'Теория представлений',
    'Листки задач',
  ];
  const row = $('#ticker');
  const html = words.map((w) => `<span>${w}</span>`).join('');
  row.innerHTML = html + html;
})();

const peopleEl = $('#people'),
  filtersEl = $('#filters');
let activeFilter = 'all',
  query = '';

FILTERS.forEach((f, i) => {
  const count =
    f.id === 'all'
      ? PEOPLE.length
      : PEOPLE.filter((p) => p.tags.includes(f.id)).length;
  const b = document.createElement('button');
  b.className = 'chip' + (i === 0 ? ' is-active' : '');
  b.dataset.id = f.id;
  b.innerHTML = `${f.label}<small>${count}</small>`;
  b.addEventListener('click', () => {
    activeFilter = f.id;
    $$('.chip', filtersEl).forEach((c) =>
      c.classList.toggle('is-active', c === b)
    );
    renderPeople();
  });
  filtersEl.appendChild(b);
});

function renderPeople() {
  const q = query.trim().toLowerCase();
  const list = PEOPLE.map((p, i) => ({ ...p, i })).filter((p) => {
    const okF = activeFilter === 'all' || p.tags.includes(activeFilter);
    const hay = (
      p.name +
      ' ' +
      p.chair +
      ' ' +
      p.role +
      ' ' +
      p.courses.join(' ') +
      ' ' +
      p.interests.join(' ')
    ).toLowerCase();
    return okF && (!q || hay.includes(q));
  });
  if (!list.length) {
    peopleEl.innerHTML = `<div class="empty">Никого не нашли. Попробуйте другой запрос или <a href="#contacts" style="color:var(--accent)">напишите нам</a>.</div>`;
    return;
  }
  peopleEl.innerHTML = list
    .map((p) => {
      const badges = [];
      if (p.tags.includes('lead'))
        badges.push(
          `<div class="person__badge" title="Руководство"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>`
        );
      if (p.tags.includes('cur'))
        badges.push(
          `<div class="person__badge" title="Куратор" style="background:var(--accent-2)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>`
        );
      return `
    <button class="person" data-i="${p.i}" aria-label="Подробнее: ${esc(
        p.name
      )}">
      <div class="person__badges">${badges.join('')}</div>
      <span class="person__num">${String(p.i + 1).padStart(2, '0')}</span>
      <span class="avatar" style="background:${grad(
        p.i
      )}" aria-hidden="true">${initials(p.name)}</span>
      <span>
        <span class="person__role">${esc(p.role)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="person__deg">${esc(p.degree)}</p>
      </span>
      <p class="person__chair">${esc(p.chair)}</p>
      <span class="person__more">Подробнее <span aria-hidden="true">→</span></span>
    </button>`;
    })
    .join('');
}
renderPeople();
$('#search').addEventListener('input', (e) => {
  query = e.target.value;
  renderPeople();
});

const modal = $('#modal'),
  modalContent = $('#modalContent');
let lastFocus = null;

peopleEl.addEventListener('click', (e) => {
  const card = e.target.closest('.person');
  if (card) openPerson(+card.dataset.i);
});

function openPerson(i) {
  const p = PEOPLE[i];
  lastFocus = document.activeElement;
  modalContent.innerHTML = `
    <div class="modal__head">
      <span class="avatar" style="background:${grad(
        i
      )}" aria-hidden="true">${initials(p.name)}</span>
      <div>
        <div class="person__role">${esc(p.role)}</div>
        <h3 id="modalName">${esc(p.name)}</h3>
        <p class="person__deg">${esc(p.degree)} · ${esc(p.chair)}</p>
      </div>
    </div>
    <div class="modal__body">
      <h4>О преподавателе</h4>
      <p>${esc(p.bio)}</p>
      <h4>Читает курсы</h4>
      <ul class="m-list">${p.courses
        .map((c) => `<li>${esc(c)}</li>`)
        .join('')}</ul>
      <h4>Научные интересы</h4>
      <div class="tags">${p.interests
        .map((t) => `<span class="tag">${esc(t)}</span>`)
        .join('')}</div>
      <h4>Контакты</h4>
      <div class="m-contact">
        <div><span>Почта</span><a href="mailto:${esc(p.email)}">${esc(
    p.email
  )}</a></div>
        <div><span>Кабинет</span><span style="font-size:14.5px;color:var(--text);text-transform:none;letter-spacing:0;font-family:var(--f-body)">${esc(
          p.office
        )}</span></div>
        <div><span>Консультации</span><span style="font-size:14.5px;color:var(--text);text-transform:none;letter-spacing:0;font-family:var(--f-body)">${esc(
          p.hours
        )}</span></div>
      </div>
    </div>`;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  $('.modal__close', modal).focus();
}
function closeModal() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const f = $$('a[href],button,input,select,textarea', modal).filter(
      (el) => el.offsetParent !== null
    );
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

const tabsEl = $('#tabs'),
  panelsEl = $('#panels');
let allSemestersHTML = '';

PROGRAM.forEach((c, courseIdx) => {
  const b = document.createElement('button');
  b.className = 'tab' + (courseIdx === 0 ? ' is-active' : '');
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-selected', courseIdx === 0);
  b.id = 'tab' + courseIdx;
  b.setAttribute('aria-controls', 'panel' + courseIdx);
  b.innerHTML = `${c.title}<small>${c.sub}</small>`;
  b.addEventListener('click', () => selectTab(courseIdx));
  tabsEl.appendChild(b);

  c.semesters.forEach((s) => {
    allSemestersHTML += `
      <section class="sem" data-course="${courseIdx}">
        <div class="sem__head"><h3>${s.n}</h3><span>${s.total}</span></div>
        ${s.courses
          .map(
            (k) => `
          <article class="course">
            <button class="course__btn" aria-expanded="false">
              <span class="course__name"><i aria-hidden="true">+</i>${esc(
                k.name
              )}</span>
              <span class="course__meta">${k.h}<span class="badge ${
              k.ex ? 'badge--ex' : ''
            }">${k.ex ? 'экзамен' : 'зачёт'}</span></span>
              <span class="course__teacher">${esc(k.t)}</span>
            </button>
            <div class="course__panel"><div class="course__inner"><div class="course__text">
              ${esc(k.d)}<br><b>Литература:</b> ${esc(k.lit)}
            </div></div></div>
          </article>`
          )
          .join('')}
      </section>`;
  });
});

panelsEl.innerHTML = `<div class="semesters" id="semestersGrid">${allSemestersHTML}</div>`;

function selectTab(i) {
  $$('.tab', tabsEl).forEach((t, j) => {
    t.classList.toggle('is-active', j === i);
    t.setAttribute('aria-selected', j === i);
  });
  $$('.sem', panelsEl).forEach((sem) => {
    const courseIdx = +sem.dataset.course;
    sem.style.display = courseIdx === i ? '' : 'none';
  });
}

selectTab(0);

tabsEl.addEventListener('keydown', (e) => {
  const tabs = $$('.tab', tabsEl),
    cur = tabs.indexOf(document.activeElement);
  if (cur < 0) return;
  let n = null;
  if (e.key === 'ArrowRight') n = (cur + 1) % tabs.length;
  if (e.key === 'ArrowLeft') n = (cur - 1 + tabs.length) % tabs.length;
  if (n !== null) {
    e.preventDefault();
    tabs[n].focus();
    selectTab(n);
  }
});

panelsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.course__btn');
  if (!btn) return;
  const c = btn.parentElement,
    open = c.classList.toggle('is-open');
  btn.setAttribute('aria-expanded', open);
});

$('#faq').innerHTML = FAQ.map(
  ([q, a]) => `
  <div class="q">
    <button class="q__btn" aria-expanded="false">${esc(q)}</button>
    <div class="q__panel"><div class="q__inner"><p>${esc(a)}</p></div></div>
  </div>`
).join('');
$('#faq').addEventListener('click', (e) => {
  const b = e.target.closest('.q__btn');
  if (!b) return;
  const q = b.parentElement,
    open = q.classList.toggle('is-open');
  b.setAttribute('aria-expanded', open);
});

const form = $('#form'),
  ok = $('#formOk');
const rules = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/.test(v.trim()),
  topic: (v) => v !== '',
  msg: (v) => v.trim().length >= 15,
};
function validate(id) {
  const el = $('#' + id),
    wrap = $('#f-' + id),
    good = rules[id](el.value);
  wrap.classList.toggle('is-invalid', !good);
  el.setAttribute('aria-invalid', !good);
  return good;
}
['name', 'email', 'topic', 'msg'].forEach((id) => {
  const el = $('#' + id);
  el.addEventListener('blur', () => {
    if (el.value) validate(id);
  });
  el.addEventListener('input', () => {
    if ($('#f-' + id).classList.contains('is-invalid')) validate(id);
  });
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const results = ['name', 'email', 'topic', 'msg'].map(validate);
  const agree = $('#agree').checked;
  $('#f-agree').classList.toggle('is-invalid', !agree);
  if (results.includes(false) || !agree) {
    const bad = $(
      '.field.is-invalid input,.field.is-invalid select,.field.is-invalid textarea'
    );
    if (bad) bad.focus();
    else $('#agree').focus();
    return;
  }
  console.log('Заявка:', Object.fromEntries(new FormData(form)));
  form.style.display = 'none';
  ok.classList.add('is-shown');
  ok.scrollIntoView({
    block: 'center',
    behavior: reduce ? 'auto' : 'smooth',
  });
});
$('#again').addEventListener('click', () => {
  form.reset();
  form.style.display = '';
  ok.classList.remove('is-shown');
  $$('.field').forEach((f) => f.classList.remove('is-invalid'));
  $('#f-agree').classList.remove('is-invalid');
  $('#name').focus();
});

const header = $('#header'),
  progress = $('#progress'),
  toTop = $('#toTop'),
  nav = $('#nav'),
  burger = $('#burger');
function onScroll() {
  const y = scrollY,
    h = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('is-stuck', y > 10);
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  toTop.classList.toggle('is-shown', y > 700);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () =>
  scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
);
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }
});
const links = $$('.nav a[href^="#"]').filter(
  (a) => a.getAttribute('href').length > 1
);
const spy = new IntersectionObserver(
  (es) => {
    es.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) =>
          l.classList.toggle(
            'is-active',
            l.getAttribute('href') === '#' + en.target.id
          )
        );
      }
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
['about', 'team', 'program', 'admission', 'contacts'].forEach((id) => {
  const s = $('#' + id);
  if (s) spy.observe(s);
});

const rv = new IntersectionObserver(
  (es, o) => {
    es.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('is-in');
        o.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px' }
);
$$('.rv').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 70 + 'ms';
  rv.observe(el);
});

/* ================== МОДЕЛЬ АТОМА — МИНИМАЛИСТИЧНАЯ ================== */
(() => {
  const cv = $('#atom'),
    ctx = cv.getContext('2d');
  let w = 0,
    h = 0,
    dpr = Math.min(devicePixelRatio || 1, 2),
    visible = true;

  function size() {
    const r = cv.parentElement.getBoundingClientRect();
    w = r.width;
    h = r.height;
    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const orbits = [
    { angle: -30, ratio: 0.38, speed: 1.0, phase: 0 },
    { angle: 30, ratio: 0.38, speed: 0.75, phase: 2.1 },
    { angle: 90, ratio: 0.38, speed: 1.25, phase: 4.2 },
  ];

  function frame(time) {
    const t = reduce ? 0 : time / 1000;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2,
      cy = h / 2;
    const R = Math.min(w, h) * 0.4;

    // Орбиты — тонкие линии
    orbits.forEach((o) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((o.angle * Math.PI) / 180);
      ctx.strokeStyle = '#009CDE';
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, R, R * o.ratio, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Ядро — простая точка
    ctx.fillStyle = '#009CDE';
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Электроны — маленькие точки без хвостов
    orbits.forEach((o) => {
      const theta = t * o.speed + o.phase;
      const rad = (o.angle * Math.PI) / 180;
      const a = R,
        b = R * o.ratio;

      const lx = Math.cos(theta) * a;
      const ly = Math.sin(theta) * b;
      const ex = cx + lx * Math.cos(rad) - ly * Math.sin(rad);
      const ey = cy + lx * Math.sin(rad) + ly * Math.cos(rad);

      ctx.fillStyle = '#009CDE';
      ctx.beginPath();
      ctx.arc(ex, ey, R * 0.025, 0, Math.PI * 2);
      ctx.fill();
    });

    // Угловые метки
    ctx.strokeStyle = 'rgba(0,156,222,.3)';
    ctx.lineWidth = 1;
    const m = 12,
      L = 14;
    [
      [m, m, 1, 1],
      [w - m, m, -1, 1],
      [m, h - m, 1, -1],
      [w - m, h - m, -1, -1],
    ].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * L, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * L);
      ctx.stroke();
    });
  }

  function loop(t) {
    if (visible) frame(t);
    requestAnimationFrame(loop);
  }
  size();
  new ResizeObserver(() => {
    size();
    frame(performance.now());
  }).observe(cv.parentElement);
  new IntersectionObserver(
    (es) => {
      visible = es[0].isIntersecting;
    },
    { threshold: 0 }
  ).observe(cv);
  if (reduce) frame(0);
  else requestAnimationFrame(loop);
})();
