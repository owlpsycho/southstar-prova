document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // CAROUSELS MULTI (2x2 e generici)
  // ============================
  const carousels = document.querySelectorAll('.sthrs-carousel');

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.sthrs-track');
    const slides = Array.from(track.children);
    const prev = carousel.querySelector('.sthrs-prev');
    const next = carousel.querySelector('.sthrs-next');
    const dotsContainer = carousel.querySelector('.sthrs-dots');
    const autoplayAttr = parseInt(carousel.dataset.autoplay, 10) || 4000;

    let current = 0;
    let intervalId = null;

    // CREAZIONE DOTS
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'sthrs-dot';
      d.type = 'button';
      d.dataset.index = i;
      dotsContainer.appendChild(d);
    });
    const dots = Array.from(dotsContainer.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

      if (carousel.classList.contains('video-carousel')) playCurrentVideo();
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    next.addEventListener('click', () => { nextSlide(); restartAutoplay(); });
    prev.addEventListener('click', () => { prevSlide(); restartAutoplay(); });

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        goTo(Number(e.currentTarget.dataset.index));
        restartAutoplay();
      });
    });

    // ============================
    // AUTOPLAY
    // ============================
    function startAutoplay() {
      if (carousel.classList.contains('video-carousel')) return;
      if (!intervalId) intervalId = setInterval(nextSlide, autoplayAttr);
    }

    function stopAutoplay() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nextSlide(); restartAutoplay(); }
      if (e.key === 'ArrowLeft') { prevSlide(); restartAutoplay(); }
    });

    carousel.tabIndex = 0;

    // ============================
    // VIDEO CAROUSEL: PLAY / MUTE / SLIDER
    // ============================
    if (carousel.classList.contains('video-carousel')) {
      let isPlaying = true;
      let isMuted = true;

      const playPauseBtn = carousel.querySelector('.play-pause');
      const muteUnmuteBtn = carousel.querySelector('.mute-unmute');

      // CREO SLIDER VOLUME
      const volumeSlider = document.createElement('input');
      volumeSlider.type = 'range';
      volumeSlider.min = 0;
      volumeSlider.max = 1;
      volumeSlider.step = 0.01;
      volumeSlider.value = 0; // muto iniziale
      volumeSlider.className = 'volume-slider';
      volumeSlider.style.display = 'block';
      volumeSlider.style.bottom = '60px';
      volumeSlider.style.right = '30px'; // accanto al bottone
      volumeSlider.style.transform = 'translateY(50%) rotate(-90deg)';
      carousel.appendChild(volumeSlider);

      function playCurrentVideo() {
        slides.forEach((slide, i) => {
          const video = slide.querySelector('video');
          if (!video) return;
          video.muted = isMuted;
          video.pause();
          if (i === current && isPlaying) {
            video.play().catch(() => console.log('Autoplay bloccato'));
          }
          // sincronizzo slider col volume
          volumeSlider.value = isMuted ? 0 : video.volume;
        });
      }

      playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        playCurrentVideo();
      });

      muteUnmuteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteUnmuteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-xmark"></i>' : '<i class="fas fa-volume-high"></i>';
        slides.forEach(slide => {
          const video = slide.querySelector('video');
          if (video) {
            if (isMuted) {
              video.volume = 0;
              video.muted = true;
              volumeSlider.value = 0;
            } else {
              video.volume = 0.5;
              video.muted = false;
              volumeSlider.value = 0.5;
            }
          }
        });
      });

      // AGGIORNO VOLUME DALLO SLIDER
      volumeSlider.addEventListener('input', () => {
        const val = parseFloat(volumeSlider.value);
        slides.forEach(slide => {
          const video = slide.querySelector('video');
          if (video) {
            video.volume = val;
            video.muted = val === 0;
            isMuted = val === 0;
            muteUnmuteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-xmark"></i>' : '<i class="fas fa-volume-high"></i>';
          }
        });
      });

      slides.forEach((slide, i) => {
        const video = slide.querySelector('video');
        if (!video) return;
        video.addEventListener('ended', () => {
          if (i === current && isPlaying) nextSlide();
        });
      });
    }

    goTo(0);
    startAutoplay();
  });

  // ============================
  // HAMBURGER MENU RESPONSIVE
  // ============================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const icon = hamburger.querySelector('i');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    });
  });

  // ============================
  // DARK/LIGHT MODE
  // ============================
  const toggle = document.getElementById('mode-toggle');
  const body = document.body;
  const videoHero = document.querySelector('.hero video');
  const logo = document.querySelector('.logo');

  const savedMode = localStorage.getItem('mode') || 'light';
  if (savedMode === 'dark') {
    body.classList.add('dark-mode');
    toggle.classList.add('dark');
    if (videoHero) videoHero.src = 'img/videosouth.mp4';
    if (logo) logo.src = 'img/logoprova.png';
  } else {
    body.classList.add('light-mode');
    toggle.classList.add('light');
    if (videoHero) videoHero.src = 'img/videosouthlight.mp4';
    if (logo) logo.src = 'img/logoprovalight.png';
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    toggle.classList.toggle('dark');
    toggle.classList.toggle('light');

    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('mode', isDark ? 'dark' : 'light');

    if (videoHero) {
      videoHero.src = isDark ? 'img/videosouth.mp4' : 'img/videosouthlight.mp4';
      videoHero.play();
    }

    if (logo) {
      setTimeout(() => {
        logo.src = isDark ? 'img/logoprova.png' : 'img/logoprovalight.png';
      }, 0);
    }
  });

  // ============================
  // PAGINAZIONE GRIGLIA
  // ============================
  const itemsPerPage = 6;
  const tracks = document.querySelectorAll('.grid-carousel .sthrs-track');

  tracks.forEach(t => {
    let index = 0;
    const slides = t.children;
    const totalPages = Math.ceil(slides.length / itemsPerPage);

    function showPage(page) {
      t.style.transform = `translateX(-${page * 100}%)`;
      index = page;
    }

    t.parentElement.querySelector('.sthrs-prev').onclick = () => showPage(Math.max(index-1,0));
    t.parentElement.querySelector('.sthrs-next').onclick = () => showPage(Math.min(index+1,totalPages-1));
  });
});
