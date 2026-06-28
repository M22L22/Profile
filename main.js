lucide.createIcons();

const io = new IntersectionObserver(
  e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); }),
  { threshold: 0.07 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
