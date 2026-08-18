/* ==========================================================================
   CODON — main.js
   Progressive enhancement: every interaction has a working baseline without
   any external library. GSAP + ScrollTrigger and Lenis, if they load, take
   over the scroll-driven and easing-sensitive parts for a smoother feel.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------
     Smooth scroll (Lenis), synced to GSAP's ticker when both are present.
     Falls back to native CSS scroll-behavior: smooth (already set) if
     Lenis didn't load, or is skipped entirely under reduced motion.
     --------------------------------------------------------------------- */
  function initSmoothScroll() {
    if (!hasLenis || reduceMotion) return;

    var lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true
    });

    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Header: compact + blurred once the page has scrolled a little.
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-nav]");
    var header = document.querySelector("[data-header]");
    if (!toggle || !panel) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      if (header) header.classList.remove("menu-open");
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      panel.classList.add("is-open");
      if (header) header.classList.add("menu-open");
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? close() : open();
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------------------
     Top scroll-progress bar
     --------------------------------------------------------------------- */
  function initScrollProgress() {
    var bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + pct.toFixed(4) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------------------------------------------------------------
     Scroll reveals — staggered within each page section, in DOM order.
     Uses GSAP + ScrollTrigger when available, IntersectionObserver
     otherwise. Either way, content is fully visible without JavaScript.
     --------------------------------------------------------------------- */
  function initReveals() {
    var sections = document.querySelectorAll("[data-section]");
    var all = [];

    sections.forEach(function (section) {
      var els = section.querySelectorAll("[data-reveal], [data-reveal-line]");
      els.forEach(function (el, i) {
        el.dataset.delay = Math.min(i * 70, 460);
        all.push(el);
      });
    });

    if (reduceMotion) {
      all.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    if (hasScrollTrigger) {
      all.forEach(function (el) {
        el.style.transition = "none"; // let GSAP own this element fully
        gsap.fromTo(el,
          { opacity: 0, y: 26 },
          {
            opacity: 1, y: 0, duration: 0.9,
            delay: (parseInt(el.dataset.delay, 10) || 0) / 1000,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" }
          }
        );
      });
      return;
    }

    all.forEach(function (el) { el.style.transitionDelay = el.dataset.delay + "ms"; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    all.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Reading-frame rail — highlights the codon matching the section
     currently in view; the whole page reads ATG (start) through TAA (stop).
     --------------------------------------------------------------------- */
  function initReadingRail() {
    var rail = document.querySelector("[data-rail]");
    if (!rail) return;
    var links = Array.prototype.slice.call(rail.querySelectorAll("[data-rail-link]"));
    var tooltips = {
      hero: "Hero \u2014 start",
      about: "Platform \u2014 his",
      research: "Research \u2014 ala",
      capabilities: "Capabilities \u2014 trp",
      impact: "Impact \u2014 lys",
      cta: "Close \u2014 stop"
    };
    links.forEach(function (link) {
      link.setAttribute("data-tooltip", tooltips[link.dataset.target] || "");
    });

    var sections = document.querySelectorAll("[data-section]");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute("id");
        links.forEach(function (link) {
          var active = link.dataset.target === id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { threshold: 0, rootMargin: "-45% 0px -45% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------------------------------------------------------------
     Hero chromatogram — an animated four-colour sequencing trace with a
     reading frame that steps forward one codon at a time and appends the
     translated amino acid to the readout beneath it.
     --------------------------------------------------------------------- */
  function initChromatogram() {
    var canvas = document.getElementById("chromatogram");
    var readout = document.getElementById("translation-readout");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0;
    var offset = 0;
    var frameX = 0;
    var running = false;
    var rafId = null;
    var stepTimer = null;

    var CHANNELS = [
      { seed: 1.3, color: "#2447E8" }, // A
      { seed: 4.1, color: "#C88A2E" }, // T
      { seed: 7.6, color: "#2E8F7A" }, // C
      { seed: 2.9, color: "#8A5FE0" }  // G
    ];
    var AMINO = "ARNDCQEGHILKMFPSTWYV".split("");

    function noise(x, seed) {
      return Math.sin(x * 0.024 + seed) * 0.5 +
             Math.sin(x * 0.011 + seed * 2.1) * 0.32 +
             Math.sin(x * 0.05 + seed * 3.3) * 0.18;
    }

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = canvas.clientHeight || 210;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      var baseline = height * 0.68;
      var amp = height * 0.34;

      CHANNELS.forEach(function (ch) {
        ctx.beginPath();
        for (var x = 0; x <= width; x += 3) {
          var v = Math.max(0, noise(x + offset, ch.seed));
          var y = baseline - v * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.85;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // baseline
      ctx.beginPath();
      ctx.moveTo(0, baseline + 1);
      ctx.lineTo(width, baseline + 1);
      ctx.strokeStyle = "rgba(14,22,19,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // reading-frame window (three bases wide)
      var frameWidth = 42;
      ctx.fillStyle = "rgba(36,71,232,0.08)";
      ctx.fillRect(frameX, 6, frameWidth, height - 12);
      ctx.strokeStyle = "#2447E8";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(frameX + 0.7, 6.7, frameWidth - 1.4, height - 13.4);
    }

    function tick() {
      offset += reduceMotion ? 0 : 1.15;
      frameX += reduceMotion ? 0 : 0.55;
      if (frameX > width - 46) frameX = 0;
      draw();
      if (running && !reduceMotion) rafId = requestAnimationFrame(tick);
    }

    function pushAminoAcid() {
      if (!readout) return;
      var span = document.createElement("span");
      span.className = "fade-char";
      span.textContent = AMINO[Math.floor(Math.random() * AMINO.length)] + " ";
      readout.appendChild(span);
      while (readout.children.length > 16) readout.removeChild(readout.firstChild);
    }

    function start() {
      if (running) return;
      running = true;
      if (reduceMotion) {
        draw();
        if (readout && !readout.children.length) readout.textContent = "M K V L T G R H A P Q";
        return;
      }
      rafId = requestAnimationFrame(tick);
      stepTimer = window.setInterval(pushAminoAcid, 640);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (stepTimer) clearInterval(stepTimer);
    }

    resize();
    draw();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(); }, 150);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (heroVisible) start();
    });

    var heroVisible = false;
    var hero = document.getElementById("hero");
    if (hero) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroVisible = entry.isIntersecting;
          if (heroVisible && !document.hidden) start(); else stop();
        });
      }, { threshold: 0.1 });
      io.observe(hero);
    } else {
      start();
    }
  }

  /* ---------------------------------------------------------------------
     Impact counters — animate from 0 to their target once in view.
     --------------------------------------------------------------------- */
  function formatCount(value, el) {
    var decimals = parseInt(el.dataset.decimals, 10) || 0;
    var suffix = el.dataset.suffix || "";
    if (el.dataset.format === "compact") {
      if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M" + suffix;
      if (value >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K" + suffix;
      return Math.round(value) + suffix;
    }
    return value.toFixed(decimals) + suffix;
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.dataset.countTo);
      if (reduceMotion) { el.textContent = formatCount(target, el); return; }

      var duration = 1500;
      var start = performance.now();
      function frame(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatCount(target * eased, el);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Impact chart bars — grow in once the panel is in view.
     --------------------------------------------------------------------- */
  function initChartBars() {
    var chart = document.querySelector("[data-chart]");
    if (!chart) return;
    if (reduceMotion) { chart.classList.add("is-visible"); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { chart.classList.add("is-visible"); io.unobserve(chart); }
      });
    }, { threshold: 0.4 });
    io.observe(chart);
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons — nudge toward the cursor within their own bounds.
     --------------------------------------------------------------------- */
  function initMagnetic() {
    if (reduceMotion) return;
    var els = document.querySelectorAll("[data-magnetic]");
    els.forEach(function (el) {
      var xTo, yTo;
      if (hasGSAP) {
        xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
        yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      }
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) * 0.3;
        var dy = (e.clientY - rect.top - rect.height / 2) * 0.5;
        if (hasGSAP) { xTo(dx); yTo(dy); }
        else { el.style.transition = "transform .15s ease-out"; el.style.transform = "translate(" + dx + "px," + dy + "px)"; }
      });
      el.addEventListener("mouseleave", function () {
        if (hasGSAP) { xTo(0); yTo(0); }
        else { el.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)"; el.style.transform = "translate(0,0)"; }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Card tilt — a restrained 3D tilt on the research pillar cards.
     --------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion) return;
    var cards = document.querySelectorAll("[data-tilt]");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transition = "transform .15s ease-out";
        card.style.transform = "perspective(800px) rotateX(" + (py * -6) + "deg) rotateY(" + (px * 6) + "deg) translateY(-2px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
        card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Subtle hero-visual parallax while the hero is in view.
     --------------------------------------------------------------------- */
  function initParallax() {
    if (!hasScrollTrigger || reduceMotion) return;
    var visual = document.querySelector(".hero-visual");
    if (!visual) return;
    gsap.to(visual, {
      y: 36, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initSmoothScroll();
    initHeader();
    initMobileNav();
    initScrollProgress();
    initReveals();
    initReadingRail();
    initChromatogram();
    initCounters();
    initChartBars();
    initMagnetic();
    initTilt();
    initParallax();
  });
})();
