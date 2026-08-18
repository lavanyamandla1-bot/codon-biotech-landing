/* =========================================================================
   CODON — main.js
   Vanilla JS, with GSAP used selectively for easing (stat tweens). Content
   visibility never depends on the GSAP CDN loading — IntersectionObserver +
   CSS own the scroll reveals. No build step required. Mouse behavior is
   left standard — no custom cursor — except a subtle tilt on application
   cards and a scroll-linked parallax on the hero visual.
   Sections: header/nav · sequence strip · hero helix · scramble headline ·
   hero parallax · card tilt · scroll reveals · stat count-up ·
   sequence console (interactive encoder) · contact form
   ========================================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------------------------------------------------------------------
     Header: scrolled state + mobile nav toggle
     --------------------------------------------------------------------- */
  function initHeader() {
    const header = document.getElementById("siteHeader");
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const openNav = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------------------------------------------------------------------
     Sequence strip — doubles as a scroll-progress indicator, rendered as
     a strand of bases. Cells light up in sequence as the page scrolls.
     --------------------------------------------------------------------- */
  function initSeqStrip() {
    const track = document.getElementById("seqTrack");
    if (!track) return;

    const BASES = ["A", "T", "G", "C"];
    const COUNT = 90;
    const cells = [];

    for (let i = 0; i < COUNT; i++) {
      const span = document.createElement("span");
      span.textContent = BASES[Math.floor(Math.random() * BASES.length)];
      track.appendChild(span);
      cells.push(span);
    }

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const activeCount = Math.round(progress * COUNT);
      cells.forEach((cell, i) => {
        cell.classList.toggle("is-active", i < activeCount);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------------------------------------------------------------------
     Hero helix — procedurally drawn double helix that "breathes" and
     drifts, with a subtle mouse-parallax tilt. Two strands (coral / teal)
     connected by base-pair rungs.
     --------------------------------------------------------------------- */
  function initHelix() {
    const svg = document.getElementById("helixSvg");
    if (!svg) return;

    const W = 320, H = 520;
    const cx = W / 2;
    const amp = 62;
    const turns = 3.1;
    const rungGap = 24;

    const nsA = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const nsB = document.createElementNS("http://www.w3.org/2000/svg", "path");
    [nsA, nsB].forEach((p, i) => {
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", i === 0 ? "#C43E2C" : "#147063");
      p.setAttribute("stroke-width", "1.6");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("opacity", "0.85");
      svg.appendChild(p);
    });

    const rungGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(rungGroup);

    let rungs = [];
    const rungCount = Math.floor(H / rungGap);
    for (let i = 0; i <= rungCount; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "rung");
      line.setAttribute("stroke", "currentColor");
      line.setAttribute("stroke-width", "1");
      rungGroup.appendChild(line);

      const nodeA = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const nodeB = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      nodeA.setAttribute("r", "2.6");
      nodeB.setAttribute("r", "2.6");
      nodeA.setAttribute("class", "node");
      nodeB.setAttribute("class", "node");
      svg.appendChild(nodeA);
      svg.appendChild(nodeB);

      rungs.push({ line, nodeA, nodeB, y: i * rungGap });
    }

    function xAt(y, phase) {
      return cx + amp * Math.sin((y / H) * Math.PI * 2 * turns + phase);
    }

    function draw(phase) {
      const step = 4;
      let dA = "", dB = "";
      for (let y = 0; y <= H; y += step) {
        const xA = xAt(y, phase);
        const xB = xAt(y, phase + Math.PI);
        dA += (y === 0 ? "M" : "L") + xA.toFixed(1) + "," + y;
        dB += (y === 0 ? "M" : "L") + xB.toFixed(1) + "," + y;
      }
      nsA.setAttribute("d", dA);
      nsB.setAttribute("d", dB);

      rungs.forEach((r) => {
        const xA = xAt(r.y, phase);
        const xB = xAt(r.y, phase + Math.PI);
        const front = Math.sin((r.y / H) * Math.PI * 2 * turns + phase) > 0;

        r.line.setAttribute("x1", xA.toFixed(1));
        r.line.setAttribute("y1", r.y);
        r.line.setAttribute("x2", xB.toFixed(1));
        r.line.setAttribute("y2", r.y);
        r.line.setAttribute("opacity", front ? "0.35" : "0.15");

        r.nodeA.setAttribute("cx", xA.toFixed(1));
        r.nodeA.setAttribute("cy", r.y);
        r.nodeA.setAttribute("fill", "#C43E2C");
        r.nodeA.setAttribute("opacity", front ? "1" : "0.35");

        r.nodeB.setAttribute("cx", xB.toFixed(1));
        r.nodeB.setAttribute("cy", r.y);
        r.nodeB.setAttribute("fill", "#147063");
        r.nodeB.setAttribute("opacity", !front ? "1" : "0.35");
      });
    }

    let phase = 0;
    let targetTilt = 0, tilt = 0;

    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        targetTilt = nx * 14;
      });
    }

    if (reduceMotion) {
      draw(0);
    } else {
      const tick = () => {
        phase += 0.006;
        tilt += (targetTilt - tilt) * 0.04;
        draw(phase);
        svg.style.transform = `rotate(${tilt.toFixed(2)}deg)`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------------------------------------------------------------------
     Hero headline — decodes from scrambled monospace glyphs into the
     final headline, evoking a sequence resolving into a readable message.
     --------------------------------------------------------------------- */
  function initScramble() {
    const el = document.getElementById("scrambleHeadline");
    if (!el) return;
    const final = el.dataset.final || el.textContent.trim();

    if (reduceMotion) {
      el.textContent = final;
      return;
    }

    const glyphs = "ATGCACGTATCGGCTA";
    const chars = final.split("");
    let frame = 0;
    const revealEvery = 2; // frames between each character locking in
    const frameRate = 1000 / 30;

    el.setAttribute("aria-label", final);
    el.textContent = "";

    function render() {
      const lockedCount = Math.floor(frame / revealEvery);
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") { out += " "; continue; }
        if (i < lockedCount) {
          out += chars[i];
        } else {
          out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }
      el.textContent = out;
      frame++;
      if (lockedCount <= chars.length) {
        setTimeout(render, frameRate);
      } else {
        el.textContent = final;
      }
    }
    render();
  }

  /* ---------------------------------------------------------------------
     Hero scroll parallax — the helix settles back and fades slightly as
     the visitor scrolls past the hero, tying the hero to what follows
     instead of just cutting away from it.
     --------------------------------------------------------------------- */
  function initHeroParallax() {
    if (reduceMotion) return;
    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".hero__visual");
    if (!hero || !visual) return;

    let ticking = false;
    function update() {
      const heroHeight = hero.offsetHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / heroHeight));
      const translateY = progress * 46;
      const scale = 1 - progress * 0.08;
      visual.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      visual.style.opacity = (1 - progress * 0.55).toFixed(2);
      ticking = false;
    }
    update();
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Card tilt — a subtle 3D perspective tilt that follows the cursor,
     applied to the application cards. Desktop pointer only; skipped
     entirely on touch and under reduced motion rather than faked.
     --------------------------------------------------------------------- */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    const maxTilt = 5;
    document.querySelectorAll(".app-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - py) * maxTilt * 2;
        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveals — staggered fade/rise for elements marked .reveal.
     Triggered with a native IntersectionObserver (not the GSAP CDN) so
     content is never stuck invisible if a third-party script fails to
     load — CSS owns the actual transition either way. GSAP, when present,
     is layered on top purely for the stagger easing.
     --------------------------------------------------------------------- */
  function initReveals() {
    const items = Array.from(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (reduceMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const groups = new Map(); // parent section -> [elements], for stagger
    items.forEach((el) => {
      const key = el.closest("section") || document.body;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    const revealGroup = (el) => {
      const key = el.closest("section") || document.body;
      const siblings = groups.get(key) || [el];
      const i = siblings.indexOf(el);
      setTimeout(() => el.classList.add("is-visible"), Math.max(i, 0) * 90);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealGroup(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
     Stat count-up — IntersectionObserver trigger, GSAP tween if available,
     otherwise a small requestAnimationFrame fallback tween.
     --------------------------------------------------------------------- */
  function initStatCounters() {
    const stats = document.querySelectorAll(".stat__num");
    if (!stats.length) return;

    const animateCount = (el, target, decimals, suffix) => {
      if (window.gsap) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => { el.textContent = obj.val.toFixed(decimals) + suffix; },
        });
        return;
      }
      const start = performance.now();
      const dur = 1200;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    stats.forEach((el) => {
      const target = parseFloat(el.dataset.countTo || "0");
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";

      if (reduceMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(el, target, decimals, suffix);
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Sequence console — the interactive centerpiece. Deterministically
     encodes each letter into a base-4 "codon" (index scattered via a
     coprime multiplier so all four bases actually appear across the
     alphabet, rather than the first base only ever landing on A/T).
     --------------------------------------------------------------------- */
  function initConsole() {
    const input = document.getElementById("consoleInput");
    const output = document.getElementById("consoleOutput");
    const count = document.getElementById("consoleCount");
    const copyBtn = document.getElementById("consoleCopy");
    if (!input || !output) return;

    const BASES = ["A", "T", "G", "C"];

    function letterToCodon(letterIndex) {
      const v = (letterIndex * 7 + 3) % 64;
      return [
        BASES[Math.floor(v / 16) % 4],
        BASES[Math.floor(v / 4) % 4],
        BASES[v % 4],
      ];
    }

    function baseClass(base) {
      return { A: "b-a", T: "b-t", G: "b-g", C: "b-c" }[base] || "";
    }

    function render() {
      const raw = input.value;
      output.innerHTML = "";
      let baseCount = 0;

      for (const ch of raw) {
        if (/[a-zA-Z]/.test(ch)) {
          const idx = ch.toUpperCase().charCodeAt(0) - 65;
          const codon = letterToCodon(idx);
          baseCount += 3;

          const chip = document.createElement("div");
          chip.className = "console__chip";
          const letterEl = document.createElement("span");
          letterEl.className = "console__chip-letter";
          letterEl.textContent = ch;
          const codonEl = document.createElement("span");
          codonEl.className = "console__chip-codon";
          codon.forEach((base) => {
            const b = document.createElement("b");
            b.className = baseClass(base);
            b.textContent = base;
            codonEl.appendChild(b);
          });
          chip.append(letterEl, codonEl);
          output.appendChild(chip);
        } else if (ch === " ") {
          const gap = document.createElement("div");
          gap.className = "console__chip console__chip--gap";
          gap.innerHTML = '<span class="console__chip-letter">·</span><span class="console__chip-codon">···</span>';
          output.appendChild(gap);
        }
        // other characters (digits/punctuation) are quietly skipped —
        // the encoder only speaks in letters, same as the real thing.
      }

      count.textContent = baseCount + (baseCount === 1 ? " base" : " bases");
    }

    input.addEventListener("input", render);
    render();

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const sequence = Array.from(output.querySelectorAll(".console__chip:not(.console__chip--gap) .console__chip-codon"))
          .map((el) => el.textContent)
          .join(" ");
        if (!sequence) return;
        try {
          await navigator.clipboard.writeText(sequence);
        } catch (err) {
          // Clipboard API unavailable/blocked — fail silently rather than
          // throw; the sequence is still visible on screen to copy by hand.
        }
        copyBtn.textContent = "Copied ✓";
        copyBtn.classList.add("is-copied");
        setTimeout(() => {
          copyBtn.textContent = "Copy sequence";
          copyBtn.classList.remove("is-copied");
        }, 1500);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Contact form — front-end only. Validates, shows a success state.
     Ready to be wired to a real backend (e.g. a Laravel mail route).
     --------------------------------------------------------------------- */
  function initForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const note = document.getElementById("formNote");
    const submitBtn = document.getElementById("formSubmit");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = "Please fill in every field before sending.";
        return;
      }
      submitBtn.textContent = "Sending…";
      setTimeout(() => {
        note.textContent = "Thanks — we typically reply within one business day.";
        submitBtn.textContent = "Request a Briefing";
        form.reset();
      }, 700);
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initSeqStrip();
    initHelix();
    initScramble();
    initHeroParallax();
    initReveals();
    initStatCounters();
    initTilt();
    initConsole();
    initForm();
  });
})();

