/* ============================================================
   INSTITUTO PIRATININGA — interações
   Lenis (smooth) + GSAP/ScrollTrigger.
   Progressive enhancement: se faltar lib ou houver
   prefers-reduced-motion, remove .anims e mostra tudo.
   ============================================================ */
(function () {
  "use strict";

  var html = document.documentElement;
  var nav = document.getElementById("nav");
  var preloader = document.getElementById("preloader");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var lenis = null;

  /* ---------- helpers ---------- */
  function navHeight() {
    return nav ? nav.offsetHeight : 72;
  }

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
    window.setTimeout(function () { preloader.style.display = "none"; }, 900);
  }

  function setupDraw(nodes) {
    nodes.forEach(function (n) {
      var len = 1500;
      try { if (n.getTotalLength) len = n.getTotalLength() || 1500; } catch (e) {}
      n.style.setProperty("--len", len);
      n.style.strokeDasharray = len;
      n.style.strokeDashoffset = len;
    });
  }

  /* ============================================================
     BASICS — funcionam mesmo sem GSAP
     ============================================================ */

  /* Mobile menu */
  var menu = document.getElementById("menu");
  var navToggle = document.getElementById("navToggle");

  function closeMenu() {
    if (!menu) return;
    nav.classList.remove("is-open");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menu");
    }
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  }
  function openMenu() {
    if (!menu) return;
    nav.classList.add("is-open");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Fechar menu");
    }
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
  }
  if (navToggle && menu) {
    navToggle.addEventListener("click", function () {
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Nav scrolled state + barra de progresso de leitura */
  var progressBar = document.getElementById("progressBar");
  function updateScrolled() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progressBar.style.transform = "scaleX(" + p + ")";
    }
  }
  window.addEventListener("scroll", updateScrolled, { passive: true });
  window.addEventListener("resize", updateScrolled, { passive: true });
  updateScrolled();

  /* Nav theme swap via IntersectionObserver (sem depender de GSAP) */
  var currentSectionTheme = "light";
  function applyNavTheme() {
    if (!nav) return;
    var isDark = html.getAttribute("data-mode") === "dark" || currentSectionTheme === "dark";
    nav.classList.toggle("nav--dark", isDark);
    nav.classList.toggle("nav--light", !isDark);
  }
  (function setupNavTheme() {
    if (!nav || !("IntersectionObserver" in window)) return;
    var sections = document.querySelectorAll("[data-theme]");
    function build() {
      var nh = navHeight();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          currentSectionTheme = en.target.getAttribute("data-theme");
          applyNavTheme();
        });
      }, { rootMargin: "-" + nh + "px 0px -" + Math.max(0, window.innerHeight - nh - 4) + "px 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
    build();
  })();

  /* Alternância de modo escuro global (sobrepõe o tema por seção).
     Sem escolha salva, segue o esquema de cores do sistema. */
  (function setupThemeToggle() {
    var STORAGE_KEY = "piratininga-mode";
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');

    function apply(isDark) {
      if (isDark) html.setAttribute("data-mode", "dark");
      else html.removeAttribute("data-mode");
      btn.classList.toggle("is-dark", isDark);
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
      if (themeColorMeta) themeColorMeta.setAttribute("content", isDark ? "#111111" : "#F5F5F5");
      applyNavTheme();
    }

    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(saved ? saved === "dark" : systemDark);

    btn.addEventListener("click", function () {
      var next = html.getAttribute("data-mode") !== "dark";
      apply(next);
      try { localStorage.setItem(STORAGE_KEY, next ? "dark" : "light"); } catch (e) {}
    });
  })();

  /* Smooth-scroll anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -navHeight() });
      } else {
        var y = target.getBoundingClientRect().top + window.scrollY - navHeight();
        window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
      }
    });
  });

  /* ============================================================
     FALLBACK — sem animação: mostra tudo e sai
     ============================================================ */
  if (prefersReduced || !hasGSAP || !hasST) {
    html.classList.remove("anims");
    hidePreloader();
    return;
  }

  /* ============================================================
     ENHANCED — GSAP + ScrollTrigger
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll */
  if (hasLenis) {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1
    });
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", updateScrolled);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* Collect targets */
  var allReveals = gsap.utils.toArray("[data-reveal]");
  var heroReveals = allReveals.filter(function (el) { return el.closest("#topo"); });
  var scrollReveals = allReveals.filter(function (el) { return !el.closest("#topo"); });
  var revealItems = gsap.utils.toArray("[data-reveal-item]");
  var heroSplitSpans = gsap.utils.toArray("#topo [data-split] > span");
  var scrollSplitLines = gsap.utils.toArray("[data-split]").filter(function (el) { return !el.closest("#topo"); });

  /* Initial states (GSAP owns them) */
  if (scrollReveals.length) gsap.set(scrollReveals, { opacity: 0, y: 30 });
  if (heroReveals.length) gsap.set(heroReveals, { opacity: 0, y: 24 });
  if (revealItems.length) gsap.set(revealItems, { opacity: 0, y: 30 });
  gsap.set(gsap.utils.toArray("[data-split] > span"), { yPercent: 110 });
  gsap.set(".hero__fish .fish-eye", { opacity: 0 });

  /* Scroll reveals */
  scrollReveals.forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  /* Reveal groups (stagger) */
  gsap.utils.toArray("[data-reveal-group]").forEach(function (group) {
    var items = group.querySelectorAll("[data-reveal-item]");
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07,
      scrollTrigger: { trigger: group, start: "top 80%", once: true }
    });
  });

  /* Split lines on scroll */
  scrollSplitLines.forEach(function (line) {
    var span = line.querySelector("span");
    if (!span) return;
    gsap.to(span, {
      yPercent: 0, duration: 1.05, ease: "power3.out",
      scrollTrigger: { trigger: line, start: "top 90%", once: true }
    });
  });

  /* Parallax (preserva centragem por baseline) */
  function parallax(el, baseX, baseY) {
    if (!el) return;
    var speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0.1;
    var section = el.closest("section") || el;
    gsap.set(el, { xPercent: baseX, yPercent: baseY });
    gsap.to(el, {
      yPercent: baseY + speed * 100,
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
    });
  }
  parallax(document.querySelector(".hero__watermark"), 0, 0);
  parallax(document.querySelector(".manifesto__spine"), 0, -50);
  parallax(document.querySelector(".invite__watermark"), -50, -50);

  /* Marquee — sutil reação à direção do scroll */
  (function marqueeReact() {
    var track = document.getElementById("marquee");
    if (!track) return;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var v = self.getVelocity();
        if (!v) return;
        var skew = gsap.utils.clamp(-12, 12, v / -260);
        gsap.to(track, { skewX: skew, duration: 0.4, ease: "power2.out", overwrite: true });
      }
    });
  })();

  /* Custom cursor + magnetic (apenas pointer fino) */
  if (finePointer) {
    var cursor = document.getElementById("cursor");
    if (cursor) {
      html.classList.add("has-cursor");
      var cLabel = cursor.querySelector(".cursor__label");
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      var xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
      var yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
      window.addEventListener("pointermove", function (e) {
        if (!cursor.classList.contains("is-active")) cursor.classList.add("is-active");
        xTo(e.clientX); yTo(e.clientY);
      }, { passive: true });

      document.querySelectorAll("a, button, .magnetic, [data-cursor]").forEach(function (el) {
        el.addEventListener("pointerenter", function () {
          var txt = el.getAttribute("data-cursor");
          if (txt) { cursor.classList.add("is-label"); if (cLabel) cLabel.textContent = txt; }
          else { cursor.classList.add("is-hover"); }
        });
        el.addEventListener("pointerleave", function () {
          cursor.classList.remove("is-hover", "is-label");
          if (cLabel) cLabel.textContent = "";
        });
      });
    }

    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: mx * 0.35, y: my * 0.45, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* Hero entrance (após preloader) */
  function initHero() {
    var draws = gsap.utils.toArray(".hero__fish .draw");
    setupDraw(draws);
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(draws, { strokeDashoffset: 0, duration: 1.5, stagger: 0.18, ease: "power2.inOut" }, 0)
      .to(".hero__fish .fish-eye", { opacity: 1, duration: 0.4 }, 1.1)
      .to(heroSplitSpans, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.5)
      .to(heroReveals, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.85);
    ScrollTrigger.refresh();
  }

  /* Preloader sequence */
  function runPreloader(done) {
    if (!preloader) { done(); return; }
    var draws = gsap.utils.toArray(".preloader__fish .pf-draw");
    setupDraw(draws);
    var bar = document.getElementById("preloaderBar");
    var tl = gsap.timeline({
      onComplete: function () { preloader.style.display = "none"; done(); }
    });
    tl.to(draws, { strokeDashoffset: 0, duration: 0.9, stagger: 0.1, ease: "power2.inOut" }, 0)
      .to(".preloader__fish .pf-eye", { opacity: 1, duration: 0.3 }, 0.6)
      .to(bar, { width: "100%", duration: 0.95, ease: "power1.inOut" }, 0.1)
      .to(preloader, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.2");
  }

  /* Refresh on font load + window load (layout estável) */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  /* Mostra tudo no estado final, sem depender de rAF. Bulletproof:
     limpa a global timeline, remove os estilos inline do gsap e tira .anims —
     o conteúdo nunca fica preso escondido (aba em 2º plano, rAF travado). */
  function showAllStatic() {
    if (preloader) { preloader.style.display = "none"; }
    gsap.globalTimeline.clear();
    gsap.set("[data-reveal],[data-reveal-item],[data-split] > span", { clearProps: "transform,opacity" });
    gsap.set(".hero__fish .draw, .preloader__fish .pf-draw", { clearProps: "strokeDasharray,strokeDashoffset" });
    gsap.set(".hero__fish .fish-eye, .preloader__fish .pf-eye", { clearProps: "opacity" });
    html.classList.remove("anims");
  }

  /* GO — anima a entrada só com a página visível (rAF ativo);
     em segundo plano mostra tudo estático. */
  if (document.hidden) {
    showAllStatic();
  } else {
    runPreloader(initHero);
  }

  /* Failsafe: se após 6.5s o hero não revelou (rAF estrangulado), mostra tudo. */
  window.setTimeout(function () {
    var eb = document.querySelector("#topo .eyebrow");
    if (eb && parseFloat(getComputedStyle(eb).opacity) < 0.9) showAllStatic();
  }, 6500);

})();
