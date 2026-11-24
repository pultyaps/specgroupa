(function () {
      'use strict';

      /* =========================================================================
         1. СТРУКТУРИРОВАННЫЕ ДАННЫЕ (ЛЕГКО РЕДАКТИРОВАТЬ ПОД ВАШУ ПРОГРАММУ)
         ========================================================================= */

      

      /* =========================================================================
         2. УТИЛИТЫ: TOAST, МОДАЛЬНЫЕ ОКНА, ЭКРАНИРОВАНИЕ
         ========================================================================= */

      let toastTimer = null;
      function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
          toast.classList.remove('translate-y-0', 'opacity-100');
        }, 3600);
      }

      function openModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('hidden');
        el.classList.add('flex');
        document.body.classList.add('overflow-hidden');
      }

      function closeModal(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('hidden');
        el.classList.remove('flex');
        // Разблокируем прокрутку, если нет других открытых модалок
        const anyOpen = document.querySelector('[role="dialog"].flex');
        if (!anyOpen) {
          document.body.classList.remove('overflow-hidden');
        }
      }

      function closeAllModals() {
        ['apply-modal', 'detail-modal', 'search-modal'].forEach(closeModal);
      }

      /* =========================================================================
         3. РЕНДЕР ДОКУМЕНТОВ И ПОЛОЖЕНИЙ
         ========================================================================= */

      function renderDocuments() {
        const list = document.getElementById('documents-list');
        if (!list) return;
        list.innerHTML = DOCUMENTS_DATA.map((doc) => `
          <li>
            <button
              type="button"
              data-doc-id="${doc.id}"
              class="w-full text-left p-3.5 rounded-xl bg-white hover:bg-navy-900 hover:text-white border border-slate-200/80 transition-all group flex items-center justify-between gap-3"
            >
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-lg bg-ice-100 group-hover:bg-white/10 text-navy-900 group-hover:text-gold-400 flex items-center justify-center shrink-0 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold leading-snug">${doc.title}</div>
                  <div class="text-xs text-slate-500 group-hover:text-blue-200 mt-0.5">${doc.meta}</div>
                </div>
              </div>
              <svg class="w-4 h-4 text-slate-400 group-hover:text-gold-400 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </li>
        `).join('');

        list.querySelectorAll('[data-doc-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const doc = DOCUMENTS_DATA.find((d) => d.id === btn.dataset.docId);
            if (!doc) return;
            openDetailModal({
              badges: ['Документ программы', doc.meta],
              title: doc.title,
              bodyHtml: `
                <p>${doc.summary}</p>
                <div class="p-4 rounded-xl bg-ice-100 border border-slate-200">
                  <div class="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">Ключевые разделы документа:</div>
                  <ul class="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    ${doc.highlights.map((h) => `<li>${h}</li>`).join('')}
                  </ul>
                </div>
                <p class="text-xs text-slate-500">Примечание: в данном шаблоне используется интерактивный предпросмотр. Подставьте прямую ссылку на ваш PDF-файл в атрибуте кнопки загрузки.</p>
              `,
              actionLabel: 'Скачать PDF-версию',
              onAction: () => {
                closeModal('detail-modal');
                showToast(`Загрузка «${doc.title}» (демо-режим шаблона)`);
              }
            });
          });
        });
      }

      /* =========================================================================
         4. УЧЕБНЫЙ ПЛАН: ВКЛАДКИ, ПОИСК И РАСКРЫВАЕМЫЕ ПРОГРАММЫ КУРСОВ
         ========================================================================= */

      let activeCurriculumTab = 'mandatory';
      let courseSearchQuery = '';

      function renderCourses() {
        const container = document.getElementById('courses-container');
        const emptyMsg = document.getElementById('courses-empty');
        if (!container || !emptyMsg) return;

        const q = courseSearchQuery.trim().toLowerCase();
        const filtered = COURSES_DATA.filter((course) => {
          const matchesTab = course.categories.includes(activeCurriculumTab);
          if (!q) return matchesTab;
          // При поиске ищем внутри активной вкладки, либо по всем, если вкладка не совпадает — оставим фильтрацию в рамках выбранной вкладки + понятный UX
          return matchesTab && (
            course.title.toLowerCase().includes(q) ||
            course.lecturer.toLowerCase().includes(q) ||
            course.syllabus.some((topic) => topic.toLowerCase().includes(q))
          );
        });

        if (filtered.length === 0) {
          container.innerHTML = '';
          container.classList.add('hidden');
          emptyMsg.classList.remove('hidden');
          return;
        }

        container.classList.remove('hidden');
        emptyMsg.classList.add('hidden');

        container.innerHTML = filtered.map((course) => `
          <div class="course-row bg-white hover:bg-ice-50/70 transition-colors">
            <div class="grid md:grid-cols-12 gap-3 md:gap-4 items-center px-5 py-4">
              <div class="md:col-span-5">
                <div class="font-semibold text-navy-900 text-base leading-snug">${course.title}</div>
                <div class="text-xs text-slate-500 mt-0.5">${course.credits}</div>
              </div>
              <div class="md:col-span-3 text-sm text-slate-700 flex items-center gap-2">
                <span class="md:hidden text-xs font-semibold text-slate-400">Лектор:</span>
                <span>${course.lecturer}</span>
              </div>
              <div class="md:col-span-2 flex flex-wrap md:flex-col gap-1.5 md:gap-0.5">
                <span class="text-xs font-semibold text-navy-800">${course.semester}</span>
                <span class="inline-flex w-fit px-2 py-0.5 rounded-md bg-ice-100 text-slate-600 text-[11px] font-medium">${course.format}</span>
              </div>
              <div class="md:col-span-2 md:text-right pt-1 md:pt-0">
                <button
                  type="button"
                  data-toggle-syllabus="${course.id}"
                  aria-expanded="false"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-navy-600 hover:text-navy-900 bg-ice-100 hover:bg-ice-200 transition-colors"
                >
                  <span>Программа курса</span>
                  <svg class="w-3.5 h-3.5 transition-transform duration-200 syllabus-chevron" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Раскрываемая программа курса -->
            <div id="syllabus-${course.id}" class="accordion-content bg-ice-50/90 border-t border-slate-100">
              <div class="accordion-inner">
                <div class="px-5 py-4 sm:px-7">
                  <div class="text-xs font-bold uppercase tracking-wider text-gold-600 mb-2.5">Основные разделы программы</div>
                  <ul class="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
                    ${course.syllabus.map((topic, idx) => `
                      <li class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-md bg-navy-900/10 text-navy-900 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                        <span>${topic}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `).join('');

        // Навешиваем обработчики раскрытия программы курса
        container.querySelectorAll('[data-toggle-syllabus]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.toggleSyllabus;
            const panel = document.getElementById(`syllabus-${id}`);
            const chevron = btn.querySelector('.syllabus-chevron');
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
            if (chevron) chevron.classList.toggle('rotate-180', isOpen);
          });
        });
      }

      function initCurriculumControls() {
        const tabs = document.querySelectorAll('.curriculum-tab');
        tabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            activeCurriculumTab = tab.dataset.curriculumTab;
            tabs.forEach((t) => {
              const active = t === tab;
              t.setAttribute('aria-selected', String(active));
              t.className = active
                ? 'curriculum-tab px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-navy-900 text-white shadow-sm'
                : 'curriculum-tab px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-ice-100 text-slate-700 hover:bg-ice-200';
            });
            renderCourses();
          });
        });

        const searchInput = document.getElementById('course-search');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            courseSearchQuery = e.target.value;
            renderCourses();
          });
        }
      }

      /* =========================================================================
         5. НОВОСТИ И РАСПИСАНИЕ СЕМИНАРОВ
         ========================================================================= */

      let activeNewsFilter = 'all';

      function getCategoryBadgeClass(cat) {
        if (cat === 'Семинары') return 'bg-navy-900/10 text-navy-900';
        if (cat === 'Объявления') return 'bg-amber-100 text-amber-900';
        return 'bg-blue-100 text-blue-900';
      }

      function renderNews() {
        const grid = document.getElementById('news-grid');
        if (!grid) return;

        const items = activeNewsFilter === 'all'
          ? NEWS_DATA
          : NEWS_DATA.filter((item) => item.category === activeNewsFilter);

        grid.innerHTML = items.map((item) => `
          <article class="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-academic transition-all flex flex-col overflow-hidden">
            <div class="p-6 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-navy-900 text-white flex flex-col items-center justify-center shrink-0 leading-none">
                    <span class="font-serif font-bold text-base">${item.day}</span>
                    <span class="text-[10px] uppercase tracking-wider text-gold-400 mt-0.5">${item.month}</span>
                  </div>
                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${getCategoryBadgeClass(item.category)}">
                      ${item.category}
                    </span>
                    <div class="text-[11px] text-slate-400 mt-1">${item.year}</div>
                  </div>
                </div>
              </div>

              <h3 class="mt-4 font-serif text-lg font-bold text-navy-900 leading-snug">
                ${item.title}
              </h3>

              <div class="mt-3 space-y-1 text-xs text-slate-500">
                <div class="font-medium text-slate-700">${item.speaker}</div>
                <div>${item.timePlace}</div>
              </div>

              <p class="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
                ${item.excerpt}
              </p>

              <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  data-news-id="${item.id}"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors"
                >
                  <span>Подробнее</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        `).join('');

        grid.querySelectorAll('[data-news-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const item = NEWS_DATA.find((n) => n.id === btn.dataset.newsId);
            if (!item) return;
            openDetailModal({
              badges: [item.category, `${item.day} ${item.month} ${item.year}`],
              title: item.title,
              bodyHtml: `
                <div class="p-4 rounded-xl bg-ice-100 border border-slate-200 space-y-1 text-sm">
                  <div class="font-semibold text-navy-900">${item.speaker}</div>
                  <div class="text-slate-600">${item.timePlace}</div>
                </div>
                <p>${item.fullText}</p>
              `,
              actionLabel: item.category === 'Семинары' ? 'Напомнить о семинаре' : 'Задать вопрос по событию',
              onAction: () => {
                closeModal('detail-modal');
                if (item.category === 'Семинары') {
                  showToast('Событие отмечено! Ссылку на трансляцию можно добавить в календарь.');
                } else {
                  openModal('apply-modal');
                }
              }
            });
          });
        });
      }

      function initNewsFilters() {
        const buttons = document.querySelectorAll('.news-filter-btn');
        buttons.forEach((btn) => {
          btn.addEventListener('click', () => {
            activeNewsFilter = btn.dataset.newsFilter;
            buttons.forEach((b) => {
              const active = b === btn;
              b.className = active
                ? 'news-filter-btn px-4 py-2 rounded-xl text-sm font-semibold bg-navy-900 text-white shadow-sm transition-all'
                : 'news-filter-btn px-4 py-2 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:border-navy-600/40 transition-all';
            });
            renderNews();
          });
        });
      }

      /* =========================================================================
         6. ПРЕПОДАВАТЕЛИ
         ========================================================================= */

      function renderFaculty() {
        const grid = document.getElementById('faculty-grid');
        if (!grid) return;

        grid.innerHTML = FACULTY_DATA.map((person) => `
          <article class="rounded-2xl bg-ice-50 border border-slate-200/80 p-5 hover:bg-white hover:shadow-card transition-all flex flex-col">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${person.accent} text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                ${person.initials}
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-navy-900 text-sm leading-snug">${person.name}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${person.title}</p>
              </div>
            </div>
            <div class="mt-4 pt-3.5 border-t border-slate-200/70 flex flex-wrap gap-1.5">
              ${person.tags.map((tag) => `
                <span class="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-navy-800 text-[11px] font-medium">${tag}</span>
              `).join('')}
            </div>
          </article>
        `).join('');
      }

      /* =========================================================================
         7. FAQ-АККОРДЕОН
         ========================================================================= */

      function renderFAQ() {
        const container = document.getElementById('faq-container');
        if (!container) return;

        container.innerHTML = FAQ_DATA.map((item, idx) => `
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <button
              type="button"
              data-faq-idx="${idx}"
              aria-expanded="${idx === 0 ? 'true' : 'false'}"
              class="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-ice-50 transition-colors"
            >
              <span class="font-semibold text-navy-900 text-sm sm:text-base leading-snug">${item.q}</span>
              <span class="w-7 h-7 rounded-lg bg-ice-100 text-navy-900 flex items-center justify-center shrink-0 transition-transform duration-200 faq-icon ${idx === 0 ? 'rotate-180' : ''}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </button>
            <div id="faq-panel-${idx}" class="accordion-content ${idx === 0 ? 'open' : ''}">
              <div class="accordion-inner">
                <div class="px-5 sm:px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  ${item.a}
                </div>
              </div>
            </div>
          </div>
        `).join('');

        container.querySelectorAll('[data-faq-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = btn.dataset.faqIdx;
            const panel = document.getElementById(`faq-panel-${idx}`);
            const icon = btn.querySelector('.faq-icon');
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(isOpen));
            if (icon) icon.classList.toggle('rotate-180', isOpen);
          });
        });
      }

      /* =========================================================================
         8. УНИВЕРСАЛЬНОЕ МОДАЛЬНОЕ ОКНО ПОДРОБНОСТЕЙ
         ========================================================================= */

      function openDetailModal({ badges, title, bodyHtml, actionLabel, onAction }) {
        const metaEl = document.getElementById('detail-modal-meta');
        const titleEl = document.getElementById('detail-modal-title');
        const bodyEl = document.getElementById('detail-modal-body');
        const footerEl = document.getElementById('detail-modal-footer');
        if (!metaEl || !titleEl || !bodyEl || !footerEl) return;

        metaEl.innerHTML = badges
          .map((b) => `<span class="px-2.5 py-0.5 rounded-md bg-navy-900/10 text-navy-900">${b}</span>`)
          .join('');
        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHtml;

        footerEl.innerHTML = `
          <button type="button" data-close-modal="detail-modal" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-ice-100 text-sm font-medium transition-colors">
            Закрыть
          </button>
          ${actionLabel ? `<button type="button" id="detail-action-btn" class="px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold transition-colors">${actionLabel}</button>` : ''}
        `;

        footerEl.querySelector('[data-close-modal="detail-modal"]')?.addEventListener('click', () => closeModal('detail-modal'));
        if (actionLabel && onAction) {
          document.getElementById('detail-action-btn')?.addEventListener('click', onAction);
        }

        openModal('detail-modal');
      }

      /* =========================================================================
         9. ФОРМА ПОДАЧИ ЗАЯВКИ (ВАЛИДАЦИЯ НА КЛИЕНТЕ)
         ========================================================================= */

      function initApplyForm() {
        const form = document.getElementById('apply-form');
        const successBox = document.getElementById('apply-success');
        const successText = document.getElementById('apply-success-text');
        const resetBtn = document.getElementById('apply-reset-btn');
        if (!form || !successBox) return;

        function setFieldError(inputId, errorId, hasError) {
          const input = document.getElementById(inputId);
          const err = document.getElementById(errorId);
          if (err) err.classList.toggle('hidden', !hasError);
          if (input && input.type !== 'checkbox') {
            input.classList.toggle('border-red-500', hasError);
            input.classList.toggle('border-slate-300', !hasError);
          }
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameVal = document.getElementById('apply-name').value.trim();
          const emailVal = document.getElementById('apply-email').value.trim();
          const statusVal = document.getElementById('apply-status').value;
          const msgVal = document.getElementById('apply-message').value.trim();
          const consentVal = document.getElementById('apply-consent').checked;

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

          const nameErr = nameVal.length < 2;
          const emailErr = !emailRegex.test(emailVal);
          const msgErr = msgVal.length < 10;
          const consentErr = !consentVal;

          setFieldError('apply-name', 'error-name', nameErr);
          setFieldError('apply-email', 'error-email', emailErr);
          setFieldError('apply-message', 'error-message', msgErr);
          setFieldError('apply-consent', 'error-consent', consentErr);

          if (nameErr || emailErr || msgErr || consentErr) {
            return;
          }

          form.classList.add('hidden');
          successBox.classList.remove('hidden');
          if (successText) {
            successText.textContent = `${nameVal} (${statusVal}), ваша заявка зарегистрирована. Ответ будет направлен на адрес ${emailVal}.`;
          }
          showToast('Заявка успешно отправлена в учебный офис');
        });

        resetBtn?.addEventListener('click', () => {
          form.reset();
          form.classList.remove('hidden');
          successBox.classList.add('hidden');
          closeModal('apply-modal');
        });
      }

      /* =========================================================================
         10. ГЛОБАЛЬНЫЙ БЫСТРЫЙ ПОИСК
         ========================================================================= */

      function initGlobalSearch() {
        const openBtn = document.getElementById('open-search-btn');
        const input = document.getElementById('global-search-input');
        const resultsEl = document.getElementById('global-search-results');
        if (!openBtn || !input || !resultsEl) return;

        openBtn.addEventListener('click', () => {
          openModal('search-modal');
          setTimeout(() => input.focus(), 60);
        });

        input.addEventListener('input', (e) => {
          const q = e.target.value.trim().toLowerCase();
          if (q.length < 2) {
            resultsEl.innerHTML = '<div class="p-6 text-center text-sm text-slate-400">Введите не менее 2 символов для поиска.</div>';
            return;
          }

          const matches = [];
          COURSES_DATA.forEach((c) => {
            if (c.title.toLowerCase().includes(q) || c.lecturer.toLowerCase().includes(q)) {
              matches.push({ type: 'Курс', title: c.title, sub: c.lecturer, target: '#curriculum' });
            }
          });
          NEWS_DATA.forEach((n) => {
            if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)) {
              matches.push({ type: n.category, title: n.title, sub: n.timePlace, target: '#news' });
            }
          });
          FACULTY_DATA.forEach((f) => {
            if (f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q))) {
              matches.push({ type: 'Преподаватель', title: f.name, sub: f.title, target: '#faculty' });
            }
          });

          if (matches.length === 0) {
            resultsEl.innerHTML = '<div class="p-6 text-center text-sm text-slate-400">Ничего не найдено. Попробуйте другой запрос.</div>';
            return;
          }

          resultsEl.innerHTML = matches.slice(0, 8).map((m) => `
            <a href="${m.target}" class="search-result-link block px-4 py-3 rounded-xl hover:bg-ice-100 transition-colors">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-semibold text-navy-900">${m.title}</span>
                <span class="px-2 py-0.5 rounded-md bg-navy-900/10 text-navy-800 text-[11px] font-semibold shrink-0">${m.type}</span>
              </div>
              <div class="text-xs text-slate-500 mt-0.5">${m.sub}</div>
            </a>
          `).join('');

          resultsEl.querySelectorAll('.search-result-link').forEach((link) => {
            link.addEventListener('click', () => closeModal('search-modal'));
          });
        });
      }

      /* =========================================================================
         11. МОБИЛЬНОЕ МЕНЮ, КОПИРОВАНИЕ EMAIL И ОБЩИЕ СОБЫТИЯ
         ========================================================================= */

      function initNavigationAndEvents() {
        // Мобильное меню
        const openDrawerBtn = document.getElementById('mobile-menu-btn');
        const closeDrawerBtn = document.getElementById('close-mobile-menu');
        const drawer = document.getElementById('mobile-drawer');
        const overlay = document.getElementById('mobile-drawer-overlay');

        function setDrawerOpen(open) {
          if (!drawer || !overlay || !openDrawerBtn) return;
          openDrawerBtn.setAttribute('aria-expanded', String(open));
          drawer.classList.toggle('translate-x-full', !open);
          overlay.classList.toggle('hidden', !open);
          document.body.classList.toggle('overflow-hidden', open);
        }

        openDrawerBtn?.addEventListener('click', () => setDrawerOpen(true));
        closeDrawerBtn?.addEventListener('click', () => setDrawerOpen(false));
        overlay?.addEventListener('click', () => setDrawerOpen(false));
        document.querySelectorAll('.mobile-nav-link').forEach((link) => {
          link.addEventListener('click', () => setDrawerOpen(false));
        });

        // Кнопки открытия формы заявки
        document.querySelectorAll('[data-open-apply]').forEach((btn) => {
          btn.addEventListener('click', () => {
            setDrawerOpen(false);
            // Сбросим экран успеха, если форма уже отправлялась
            document.getElementById('apply-form')?.classList.remove('hidden');
            document.getElementById('apply-success')?.classList.add('hidden');
            openModal('apply-modal');
          });
        });

        // Кнопки закрытия модальных окон
        document.querySelectorAll('[data-close-modal]').forEach((btn) => {
          btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
        });

        // Клик по затемнённому фону модалки закрывает её
        ['apply-modal', 'detail-modal', 'search-modal'].forEach((id) => {
          const modal = document.getElementById(id);
          modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(id);
          });
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeAllModals();
            setDrawerOpen(false);
          }
        });

        // Тень хедера при прокрутке
        const header = document.getElementById('site-header');
        window.addEventListener('scroll', () => {
          if (!header) return;
          header.classList.toggle('shadow-md', window.scrollY > 12);
        }, { passive: true });

        // Копирование email через execCommand (безопасно для iFrame)
        const copyBtn = document.getElementById('copy-email-btn');
        copyBtn?.addEventListener('click', () => {
          const text = copyBtn.dataset.copy || 'info@program-template.edu.ru';
          try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(`Email ${text} скопирован`);
          } catch (err) {
            showToast(`Почта: ${text}`);
          }
        });
      }

      /* =========================================================================
         12. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
         ========================================================================= */

      document.addEventListener('DOMContentLoaded', () => {
        try {
          renderDocuments();
          initCurriculumControls();
          renderCourses();
          initNewsFilters();
          renderNews();
          renderFaculty();
          renderFAQ();
          initApplyForm();
          initGlobalSearch();
          initNavigationAndEvents();
        } catch (error) {
          console.error('Ошибка инициализации интерфейса:', error);
        }
      });
    })();