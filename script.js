/* =====================================================================
   EVERY MEMORY WITH YOU — script.js
   All interactivity: loading screen, particles, floating hearts,
   typing effect, scroll reveals, navigation, theme + music toggles,
   gallery lightbox, video autoplay fallback, countdown, and the
   surprise popup. No dependencies, no backend.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. LOADING SCREEN
     Hide once the page (and fonts) are ready, with a small minimum
     delay so the animation doesn't just flash on fast connections.
  --------------------------------------------------------------- */
  const loadingScreen = document.getElementById('loading-screen');
  const hideLoader = () => loadingScreen.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hideLoader, 900));
  // Safety net in case 'load' is delayed by slow external assets
  setTimeout(hideLoader, 3500);


  /* ---------------------------------------------------------------
     2. AMBIENT BACKGROUND PARTICLES (canvas)
     Soft glowing dots that drift slowly, like light or pollen.
  --------------------------------------------------------------- */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    const count = window.innerWidth < 700 ? 35 : 70;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.6,
      speedY: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.5 ? 'rose' : 'gold'
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    particles.forEach(p => {
      ctx.beginPath();
      const color = p.hue === 'rose'
        ? (isDark ? `rgba(217,68,102,${p.opacity})` : `rgba(217,68,102,${p.opacity * 0.7})`)
        : (isDark ? `rgba(241,217,164,${p.opacity})` : `rgba(207,159,79,${p.opacity * 0.7})`);
      ctx.fillStyle = color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
    });
    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();
  window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });


  /* ---------------------------------------------------------------
     3. FLOATING HEARTS
     Periodically spawn small hearts that float from bottom to top.
  --------------------------------------------------------------- */
  const heartsLayer = document.getElementById('floating-hearts');
  const heartGlyphs = ['❤', '💕', '♡'];

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];
    const size = Math.random() * 16 + 12;
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = size + 'px';
    heart.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    const duration = Math.random() * 6 + 8;
    heart.style.animationDuration = duration + 's';
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 500);
  }
  setInterval(spawnHeart, 900);
  for (let i = 0; i < 5; i++) setTimeout(spawnHeart, i * 300); // a few on load


  /* ---------------------------------------------------------------
     4. TYPING TEXT ANIMATION (hero title)
  --------------------------------------------------------------- */
  const typingEl = document.getElementById('typing-text');
  const fullText = 'Every memory with you is my favorite story ❤️';
  let typeIndex = 0;

  function typeNextChar() {
    if (typeIndex <= fullText.length) {
      typingEl.textContent = fullText.slice(0, typeIndex);
      typeIndex++;
      setTimeout(typeNextChar, 42);
    }
  }
  setTimeout(typeNextChar, 700);


  /* ---------------------------------------------------------------
     5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  --------------------------------------------------------------- */
  const revealItems = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));


  /* ---------------------------------------------------------------
     6. NAVIGATION: scroll shadow, mobile menu, smooth scroll
  --------------------------------------------------------------- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    backToTop.classList.toggle('visible', window.scrollY > 600);
  });

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // "Start Our Journey" smooth scroll (native smooth-scroll handles anchors already,
  // this just ensures nice behavior even if smooth-scroll is unsupported)
  document.getElementById('start-journey').addEventListener('click', (e) => {
    const target = document.querySelector('#meeting');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const backToTop = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


  /* ---------------------------------------------------------------
     7. THEME TOGGLE (dark / light) — persists via localStorage
  --------------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('site-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('site-theme', isDark ? 'light' : 'dark');
  });


  /* ---------------------------------------------------------------
     8. BACKGROUND MUSIC PLAY / PAUSE
     Browsers block autoplay with sound, so playback only starts
     on user interaction with the button — that's expected here.
  --------------------------------------------------------------- */
  const music = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  musicToggle.addEventListener('click', () => {
    if (music.paused) {
      music.play().catch(() => { /* file may be missing/blocked — fail silently */ });
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.setAttribute('aria-label', 'Pause background music');
    } else {
      music.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.setAttribute('aria-label', 'Play background music');
    }
  });


  /* ---------------------------------------------------------------
     9. PHOTO GALLERY LIGHTBOX
  --------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  let currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    const item = galleryItems[index];
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showGalleryOffset(offset) {
    currentGalleryIndex = (currentGalleryIndex + offset + galleryItems.length) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => showGalleryOffset(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => showGalleryOffset(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showGalleryOffset(1);
    if (e.key === 'ArrowLeft') showGalleryOffset(-1);
  });


  /* ---------------------------------------------------------------
     10. MEMORY VIDEOS — autoplay with manual fallback
     Most mobile browsers allow muted+playsinline autoplay, but if
     it's ever blocked, show a tappable play button instead.
  --------------------------------------------------------------- */
  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.video-play-btn');

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => card.classList.add('needs-tap'));
      }
    };
    attemptPlay();

    playBtn.addEventListener('click', () => {
      video.play().then(() => card.classList.remove('needs-tap')).catch(() => {});
    });
    video.addEventListener('click', () => {
      if (video.paused) { video.play().catch(() => {}); card.classList.remove('needs-tap'); }
    });
  });


  /* ---------------------------------------------------------------
     11. LIVE COUNTDOWN — time together since a given start date
     Edit the data-start attribute on #countdown-grid in index.html
     to change the anniversary date.
  --------------------------------------------------------------- */
  const countdownGrid = document.getElementById('countdown-grid');
  const startDate = new Date(countdownGrid.dataset.start);

  const cd = {
    years: document.getElementById('cd-years'),
    months: document.getElementById('cd-months'),
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    const now = new Date();
    if (isNaN(startDate.getTime()) || now < startDate) return;

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();
    let seconds = now.getSeconds() - startDate.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
      months--;
    }
    if (months < 0) { months += 12; years--; }

    cd.years.textContent = pad(years);
    cd.months.textContent = pad(months);
    cd.days.textContent = pad(days);
    cd.hours.textContent = pad(hours);
    cd.minutes.textContent = pad(minutes);
    cd.seconds.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  /* ---------------------------------------------------------------
     12. SURPRISE BUTTON — romantic popup with a heart burst
  --------------------------------------------------------------- */
  const surpriseBtn = document.getElementById('surprise-btn');
  const surpriseModal = document.getElementById('surprise-modal');
  const surpriseClose = document.getElementById('surprise-close');
  const surpriseHeartsLayer = document.getElementById('surprise-hearts');

  function burstHearts() {
    surpriseHeartsLayer.innerHTML = '';
    const count = window.innerWidth < 700 ? 18 : 30;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];
      h.className = 'floating-heart';
      h.style.left = Math.random() * 100 + '%';
      h.style.bottom = '-5%';
      h.style.fontSize = (Math.random() * 20 + 14) + 'px';
      h.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      const duration = Math.random() * 3 + 3;
      h.style.animationDuration = duration + 's';
      surpriseHeartsLayer.appendChild(h);
      setTimeout(() => h.remove(), duration * 1000 + 300);
    }
  }

  function openSurprise() {
    surpriseModal.classList.add('open');
    surpriseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    burstHearts();
    const burstInterval = setInterval(burstHearts, 1400);
    surpriseModal._burstInterval = burstInterval;
  }

  function closeSurprise() {
    surpriseModal.classList.remove('open');
    surpriseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    clearInterval(surpriseModal._burstInterval);
  }

  surpriseBtn.addEventListener('click', openSurprise);
  surpriseClose.addEventListener('click', closeSurprise);
  surpriseModal.addEventListener('click', (e) => { if (e.target === surpriseModal) closeSurprise(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && surpriseModal.classList.contains('open')) closeSurprise(); });

});
