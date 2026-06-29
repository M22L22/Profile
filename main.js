fetch('site.json')
  .then(r => r.json())
  .then(render);

function render(d) {
  const { meta, hero, sections, footer } = d;

  // <title>
  document.title = meta.title;

  // NAV
  document.getElementById('nav-cta').href = `mailto:${meta.email}`;
  document.getElementById('nav-links').innerHTML =
    ['competitions', 'research', 'activities']
      .map(s => `<li><a href="#${s}">${cap(s)}</a></li>`).join('');

  // SIDE NAV
  const sectionIds = ['about', 'competitions', 'research', 'activities'];
  const labels = ['About', 'Competitions', 'Research', 'Activities'];
  document.getElementById('side-nav').innerHTML = sectionIds
    .map((id, i) =>
      (i === 0 ? '' : '<div class="sn-line"></div>') +
      `<a class="sn-dot${i === 0 ? ' on' : ''}" href="#${id}" data-label="${labels[i]}"></a>`)
    .join('');

  // HERO
  document.getElementById('hero-bg').src = hero.bg_image;
  document.getElementById('hero-year').textContent = hero.year;
  document.getElementById('hero-tagline').innerHTML =
    `<p><strong>${hero.tagline}</strong><br>${hero.tagline_sub.replace('\n', '<br>')}</p>`;
  document.getElementById('hero-meta').innerHTML = [
    ['school', hero.school],
    ['map-pin', hero.location],
    ['layers', hero.grade]
  ].map(([icon, text]) =>
    `<div class="hm-item"><i data-lucide="${icon}" style="width:12px;height:12px;color:#00C46A"></i><strong>${text}</strong></div>`
  ).join('');
  document.getElementById('hero-name').innerHTML =
    `<h1 class="hero-name"><span class="stroke">${hero.name_first}</span><br><span class="green">${hero.name_last}</span></h1>
     <p style="color:rgba(255,255,255,.35);font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-top:12px">${hero.name_zh} · ${hero.tagline}</p>`;

  // COMPETITIONS POSTER
  renderPoster('poster-competitions', sections.competitions.poster);

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
     <h2 class="section-heading">${sections.research.heading}<span class="zh">${sections.research.heading_zh}</span></h2>`;
  document.getElementById('research-items').innerHTML =
    sections.research.items.map(item =>
      `<div class="research-item reveal">
        <div class="r-visual">
          <img class="r-img" src="${item.image}" alt="${item.image_alt}" />
          <div class="r-img-tag${item.status_class ? ' ' + item.status_class : ''}">${item.status}</div>
        </div>
        <div class="r-body">
          <h3>${item.title.replace('\n', '<br>')}</h3>
          <p>${item.desc}</p>
          <div class="r-award${item.status_class ? ' ' + item.status_class : ''}"><i data-lucide="${item.award_icon}"></i>${item.award}</div>
        </div>
      </div>`
    ).join('');

  // ACTIVITIES POSTER
  renderPoster('poster-activities', sections.activities.poster);

  // ACTIVITIES BANNER
  const act = sections.activities;
  document.getElementById('act-banner-wrap').innerHTML =
    `<div class="act-banner reveal">
      <img class="act-banner-img" src="${act.banner_image}" alt="${act.banner_image_alt}" />
      <div class="act-banner-circle"><img src="${act.circle_image}" alt="${act.circle_image_alt}" /></div>
    </div>
    <p class="act-caption">${act.caption}</p>`;

  document.getElementById('act-cols').innerHTML =
    act.items.map(item =>
      `<div class="act-col">
        <div class="act-col-icon"><i data-lucide="${item.icon}"></i></div>
        <div class="act-col-title">${item.title.replace('\n', '<br>')}</div>
        <div class="act-col-desc">${item.desc}</div>
        <a class="act-col-btn" href="#">${item.btn}</a>
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

  // Scroll reveal
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
