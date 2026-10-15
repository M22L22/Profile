fetch('site.json')
  .then(r => r.json())
  .then(render);

function render(d) {
  const { meta, hero, sections, footer } = d;

  // <title>
  document.title = meta.title;

  // NAV
  document.getElementById('nav-links').innerHTML =
    ['competitions', 'research', 'activities']
      .map(s => `<li><a href="#${s}">${cap(s)}</a></li>`).join('');

  // SIDE NAV
  const sectionIds = ['about', 'competitions', 'research', 'activities'];
  const labels = ['About', 'Competitions', 'Research', 'Activities'];
  document.getElementById('side-nav').innerHTML = sectionIds
    .map((id, i) =>
      (i === 0 ? '' : '<div class="sn-line"></div>') +
      `<a class="sn-dot${i === 0 ? ' on' : ''}" href="#${id}" aria-label="${labels[i]}" data-label="${labels[i]}"></a>`)
    .join('');

  // HERO
  document.getElementById('hero-bg').src = hero.bg_image;
  document.getElementById('hero-bg').alt = hero.bg_image_alt;
  document.getElementById('hero-year').textContent = hero.year;

  document.getElementById('hero-meta').innerHTML = [
    ['school', hero.school],
    ['map-pin', hero.location],
    ['layers', hero.grade]
  ].map(([icon, text]) =>
    `<div class="hm-item"><i data-lucide="${icon}"></i><strong>${text}</strong></div>`
  ).join('');
  document.getElementById('hero-name').innerHTML =
    `<h1 class="hero-name"><span class="stroke">${hero.name_first}</span><br><span class="green">${hero.name_last}</span></h1>
     <p class="hero-major">${hero.tagline}</p>`;

  // COMPETITIONS POSTER
  renderPoster('poster-competitions', sections.competitions.poster);
  document.getElementById('ap-summary').textContent = sections.competitions.ap_summary;

  // STAIRCASE
  document.getElementById('stair-container').innerHTML =
    sections.competitions.items.map(item => {
      const short = parseFloat(item.width) <= 30;
      if (!short) {
        return `<div class="stair-row">
          <div class="stair-bar${item.highlight ? ' hl' : ''}" style="--w:${item.width}">
            <span class="s-num">${item.num}</span>
            <div class="s-in">
              <div class="s-name">${item.name}</div>
              <div class="s-evt">${item.event}</div>
            </div>
            <span class="s-date">${item.date}</span>
          </div></div>`;
      } else {
        return `<div class="stair-row">
          <div class="stair-bar" style="--w:${item.width}"><span class="s-num">${item.num}</span></div>
          <div class="s-out">
            <div class="s-name">${item.name}</div>
            <div class="s-evt">${item.event} · <span class="s-date">${item.date}</span></div>
          </div></div>`;
      }
    }).join('');

  // RESEARCH POSTER
  renderPoster('poster-research', sections.research.poster);

  // RESEARCH ITEMS
  document.getElementById('research-heading').innerHTML =
    `<div class="eyebrow">${sections.research.eyebrow}</div>
     <h2 class="section-heading">${sections.research.heading}</h2>`;
  document.getElementById('research-items').innerHTML =
    sections.research.items.map(item =>
      `<div class="research-item reveal">
        <div class="r-visual">
          <img class="r-img" src="${item.image}" alt="${item.image_alt}" loading="lazy" />
          <div class="r-img-tag${item.status_class ? ' ' + item.status_class : ''}">${item.status}</div>
        </div>
        <div class="r-body">
          <h3>${item.title.replace('\n', '<br>')}</h3>
          <p>${item.desc}</p>
          <div class="r-details"><p>${item.details}</p><p class="r-details-note">${item.details_note}</p></div>
          <div class="r-award${item.status_class ? ' ' + item.status_class : ''}"><i data-lucide="${item.award_icon}"></i>${item.award}</div>
        </div>
      </div>`
    ).join('') + `<div class="research-honor reveal"><div class="eyebrow">Modeling Award</div><p>${sections.research.honor}</p></div>`;

  // ACTIVITIES POSTER
  renderPoster('poster-activities', sections.activities.poster);

  // TEXT-ONLY ACTIVITIES
  const act = sections.activities;
  document.getElementById('act-cols').innerHTML =
    act.items.map(item =>
      `<div class="act-col reveal">
        <div class="eyebrow">${item.role}</div>
        <div class="act-col-title">${item.title.replace('\n', '<br>')}</div>
        <div class="act-col-desc">${item.desc}</div>
      </div>`
    ).join('');

  // FOOTER
  document.getElementById('footer-info').innerHTML =
    `<div class="f-name">${footer.name}</div><div class="f-sub">${footer.sub}</div>`;
  document.getElementById('footer-links').innerHTML =
    ['about', 'competitions', 'research', 'activities']
      .map(s => `<a href="#${s}">${cap(s)}</a>`).join('');

  // Init lucide icons
  lucide.createIcons();

  // ── STAIRCASE: alternate left/right slide-in ──
  const stairIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const rows = document.querySelectorAll('.stair-row');
      rows.forEach((row, i) => {
        const delay = i * 80;
        row.style.animationDelay = delay + 'ms';
        row.classList.add(i % 2 === 0 ? 'al' : 'ar');
      });
      stairIO.disconnect();
    });
  }, { threshold: 0.05 });
  const stairEl = document.getElementById('stair-container');
  if (stairEl) stairIO.observe(stairEl);

  // ── RESEARCH: pop visual then slide body ──
  document.querySelectorAll('.research-item').forEach((item, idx) => {
    const visual = item.querySelector('.r-visual');
    const body = item.querySelector('.r-body');
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        visual.style.animationDelay = (idx * 120) + 'ms';
        visual.classList.add('popped');
        setTimeout(() => {
          body.style.animationDelay = '0ms';
          body.classList.add('slid');
        }, 420 + idx * 120);
        io.disconnect();
      });
    }, { threshold: 0.1 });
    io.observe(item);
  });

  // generic reveal for remaining .reveal elements
  const revealIO = new IntersectionObserver(
    e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); }),
    { threshold: 0.07 }
  );
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  // Side nav active
  const dots = document.querySelectorAll('.side-nav .sn-dot');
  const lines = document.querySelectorAll('.side-nav .sn-line');
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sectionIds.indexOf(entry.target.id);
      if (idx === -1) return;
      dots.forEach((d, i) => d.classList.toggle('on', i === idx));
      lines.forEach((l, i) => l.classList.toggle('filled', i < idx));
    });
  }, { threshold: 0.4 });
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) secIO.observe(el);
  });
}

function renderPoster(id, p) {
  document.getElementById(id).innerHTML =
    `<div class="poster-txt">${p.title.replace('\n', '<br>')}</div>
     <div class="poster-sub">${p.sub}</div>
     <div class="poster-ghost">${p.ghost}</div>`;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
