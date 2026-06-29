lucide.createIcons();

// Scroll reveal
const revealIO = new IntersectionObserver(
  e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); }),
  { threshold: 0.07 }
);
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

// Side nav: active dot + line fill on scroll
const sections = ['about', 'competitions', 'research', 'activities'];
const dots = document.querySelectorAll('.side-nav .sn-dot');
const lines = document.querySelectorAll('.side-nav .sn-line');

const secIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    const idx = sections.indexOf(id);
    if (idx === -1) return;
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    lines.forEach((l, i) => l.classList.toggle('filled', i < idx));
  });
}, { threshold: 0.4 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) secIO.observe(el);
});
