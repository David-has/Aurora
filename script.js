(() => {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover)").matches;
  const euro = (value) => `${Math.round(value).toLocaleString("ro-RO")} €`;

  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        return;
      }
    },
  };

  const destinations = [
    {
      id: "norvegia",
      name: "Norvegia",
      text: "Fiorduri, cabane pe malul oceanului și Tromsø, capitala aurorei. Ideal pentru fotografi.",
      art: "linear-gradient(160deg, #0b1d4a, #19d3a2 60%, #7c5cff)",
      facts: ["Tromsø", "Dec – Feb", "−6 °C"],
      night: 180,
      flight: 240,
    },
    {
      id: "islanda",
      name: "Islanda",
      text: "Gheizere, cascade și băi termale sub cerul aprins. Aurora se vede chiar din cadă.",
      art: "linear-gradient(160deg, #1b0f4a, #6c4dff 55%, #f2559a)",
      facts: ["Reykjavík", "Sep – Mar", "−2 °C"],
      night: 210,
      flight: 280,
    },
    {
      id: "finlanda",
      name: "Finlanda",
      text: "Iglu de sticlă, sauna finlandeză și câini husky în Laponia, la Rovaniemi.",
      art: "linear-gradient(160deg, #06303a, #0bb98a 55%, #ffb02e)",
      facts: ["Rovaniemi", "Dec – Mar", "−12 °C"],
      night: 160,
      flight: 220,
    },
  ];

  let toastTimer;

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("show"), 3200);
  }

  function isDark() {
    return root.getAttribute("data-theme") === "dark";
  }

  function initTheme() {
    const saved = store.get("aurora-theme");
    const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", theme);
    const button = $("#themeBtn");
    const paint = () => (button.textContent = isDark() ? "☀" : "☾");
    paint();

    button.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store.set("aurora-theme", next);
      paint();
    });
  }

  function initMenu() {
    const burger = $("#burger");
    const nav = $("#nav");
    const close = () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    };

    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });

    $$("a", nav).forEach((link) => link.addEventListener("click", close));
    addEventListener("keydown", (event) => event.key === "Escape" && close());
  }

  function initSplit() {
    const title = $(".split");
    const words = title.dataset.text.split(" ");
    let n = 0;

    title.innerHTML = words
      .map((word) => {
        const letters = [...word].map((char) => `<span style="--n:${n++}">${char}</span>`).join("");
        n++;
        return `<span style="display:inline-block;white-space:nowrap;opacity:1;transform:none;animation:none">${letters}</span>`;
      })
      .join(" ");
  }

  function animateNumber(element, target) {
    const start = performance.now();
    const duration = 1600;

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased).toLocaleString("ro-RO");
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  function initReveal() {
    $$("[data-rg]").forEach((group) => [...group.children].forEach((child, index) => child.style.setProperty("--i", index)));

    if (reduce || !("IntersectionObserver" in window)) {
      $$("[data-count]").forEach((element) => (element.textContent = Number(element.dataset.count).toLocaleString("ro-RO")));
      return;
    }

    root.classList.add("motion");

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          $$("[data-count]", entry.target).forEach((element) => animateNumber(element, Number(element.dataset.count)));
          observer.unobserve(entry.target);
        }),
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );

    $$("[data-r], [data-rg] > *").forEach((element) => observer.observe(element));
  }

  function initScroll() {
    const bar = $("#progress");
    const timeline = $("#timeline");
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

      const box = timeline.getBoundingClientRect();
      const filled = (innerHeight * 0.6 - box.top) / box.height;
      timeline.style.setProperty("--fill", `${Math.max(0, Math.min(1, filled)) * 100}%`);
      ticking = false;
    };

    addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  function initPointer() {
    if (!fine) return;

    const glow = $("#glow");

    addEventListener("pointermove", (event) => {
      glow.style.opacity = "1";
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    });

    if (reduce) return;

    $$(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const box = element.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.25;
        const y = (event.clientY - box.top - box.height / 2) * 0.35;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });

      element.addEventListener("pointerleave", () => (element.style.transform = ""));
    });
  }

  function initCountdown() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 11, 18, 18, 0, 0);
    if (target < now) target = new Date(now.getFullYear() + 1, 11, 18, 18, 0, 0);

    const pad = (value) => String(value).padStart(2, "0");

    const tick = () => {
      const left = Math.max(0, target - Date.now());
      $("#cd-d").textContent = pad(Math.floor(left / 864e5));
      $("#cd-h").textContent = pad(Math.floor(left / 36e5) % 24);
      $("#cd-m").textContent = pad(Math.floor(left / 6e4) % 60);
      $("#cd-s").textContent = pad(Math.floor(left / 1e3) % 60);
    };

    tick();
    setInterval(tick, 1000);
  }

  function initGauge() {
    const arc = $("#kpArc");
    const value = $("#kpVal");
    const label = $("#kpLabel");
    const levels = [
      [3, "Slabă", "var(--amber)"],
      [5, "Bună", "var(--green)"],
      [7, "Foarte bună", "var(--violet)"],
      [9, "Furtună!", "var(--pink)"],
    ];

    const set = () => {
      const kp = Math.round((1.5 + Math.random() * 7.5) * 10) / 10;
      const level = levels.find((item) => kp <= item[0]) || levels[3];
      arc.style.strokeDashoffset = 252 - (kp / 9) * 252;
      arc.style.stroke = level[2];
      value.textContent = kp.toFixed(1);
      label.textContent = `Kp · ${level[1]}`;
    };

    setTimeout(set, 400);
    setInterval(set, 4200);
  }

  function initDestinations() {
    const tabs = $("#tabs");
    const panel = $("#dest");

    tabs.innerHTML = destinations
      .map((item, index) => `<button type="button" role="tab" data-id="${item.id}" aria-selected="${index === 0}">${item.name}</button>`)
      .join("");

    const show = (id) => {
      const item = destinations.find((entry) => entry.id === id);
      $$("button", tabs).forEach((button) => button.setAttribute("aria-selected", String(button.dataset.id === id)));

      panel.innerHTML = `
        <div>
          <h3>${item.name}</h3>
          <p>${item.text}</p>
          <ul class="facts">${item.facts.map((fact) => `<li>${fact}</li>`).join("")}</ul>
        </div>
        <div class="dest-art" style="--art:${item.art}"></div>`;

      if (!reduce) panel.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: "ease-out" });
    };

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (button) show(button.dataset.id);
    });

    show(destinations[0].id);
  }

  function initCalculator() {
    const select = $("#selDest");
    const nights = $("#rngNights");
    const people = $("#rngPeople");
    const total = $("#total");
    const list = $("#breakdown");
    let multiplier = 1.25;
    let shown = 0;

    select.innerHTML = destinations.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");

    const render = () => {
      const item = destinations.find((entry) => entry.id === select.value);
      const n = Number(nights.value);
      const p = Number(people.value);
      const stay = item.night * n * p * multiplier;
      const flights = item.flight * p;
      const discount = p >= 4 ? (stay + flights) * 0.08 : 0;
      const sum = stay + flights - discount;

      $("#outNights").textContent = n;
      $("#outPeople").textContent = p;

      list.innerHTML = `
        <li><span>Cazare și ghid (${n} nopți)</span><span>${euro(stay)}</span></li>
        <li><span>Zboruri</span><span>${euro(flights)}</span></li>
        ${discount ? `<li><span>Reducere grup 8%</span><span>−${euro(discount)}</span></li>` : ""}`;

      const from = shown;
      shown = sum;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min(1, (now - start) / (reduce ? 1 : 600));
        total.textContent = euro(from + (sum - from) * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    [select, nights, people].forEach((element) => element.addEventListener("input", render));

    $("#season").addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      $$("button", event.currentTarget).forEach((item) => item.classList.toggle("on", item === button));
      multiplier = Number(button.dataset.m);
      render();
    });

    render();
  }

  function initSlider() {
    const slides = $$(".slide");
    const dots = $("#dots");
    let current = 0;
    let timer;

    dots.innerHTML = slides.map((_, index) => `<button type="button" aria-label="Recenzia ${index + 1}"></button>`).join("");

    const go = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("on", i === current));
      $$("button", dots).forEach((dot, i) => dot.classList.toggle("on", i === current));
    };

    const auto = () => {
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => go(current + 1), 5000);
    };

    dots.addEventListener("click", (event) => {
      const index = $$("button", dots).indexOf(event.target.closest("button"));
      if (index >= 0) {
        go(index);
        auto();
      }
    });

    go(0);
    auto();
  }

  function initSky() {
    const canvas = $("#sky");
    const ctx = canvas.getContext("2d");
    const mouse = { x: 0.5, y: 0.5 };
    let width;
    let height;
    let stars = [];

    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: Math.round(width / 6) }, () => ({
        x: Math.random(),
        y: Math.random() * 0.8,
        r: Math.random() * 1.6 + 0.3,
        s: Math.random() * 2 + 0.5,
        p: Math.random() * 6,
      }));
    };

    const bands = [
      { hue: 160, base: 0.32, amp: 0.07, speed: 0.0004, offset: 0 },
      { hue: 265, base: 0.4, amp: 0.09, speed: 0.0003, offset: 2 },
      { hue: 330, base: 0.26, amp: 0.06, speed: 0.0005, offset: 4 },
    ];

    const draw = (time) => {
      const dark = isDark();
      ctx.clearRect(0, 0, width, height);

      if (dark) {
        stars.forEach((star) => {
          const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time / 1000 * star.s + star.p));
          ctx.globalAlpha = twinkle;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc((star.x + (mouse.x - 0.5) * 0.02 * star.r) * width, star.y * height, star.r, 0, 6.3);
          ctx.fill();
        });
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = dark ? "lighter" : "multiply";

      bands.forEach((band) => {
        const gradient = ctx.createLinearGradient(0, height * (band.base - 0.2), 0, height * (band.base + 0.45));
        const alpha = dark ? 0.5 : 0.28;
        gradient.addColorStop(0, `hsla(${band.hue},95%,${dark ? 60 : 72}%,0)`);
        gradient.addColorStop(0.45, `hsla(${band.hue},95%,${dark ? 60 : 72}%,${alpha})`);
        gradient.addColorStop(1, `hsla(${band.hue},95%,${dark ? 60 : 72}%,0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 12) {
          const t = time * band.speed + band.offset;
          const wave = Math.sin(x * 0.004 + t * 3) * 0.6 + Math.sin(x * 0.011 - t * 5) * 0.4;
          const y = height * band.base + wave * height * band.amp + (mouse.y - 0.5) * 40;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      if (!reduce) requestAnimationFrame(draw);
    };

    addEventListener("pointermove", (event) => {
      mouse.x = event.clientX / innerWidth;
      mouse.y = event.clientY / innerHeight;
    });

    addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
  }

  function initBooking() {
    $("#book").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("#email");
      const hint = $("#hint");
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      hint.textContent = valid ? "" : "Introdu o adresă validă, de exemplu nume@email.ro.";

      if (!valid) {
        input.focus();
        return;
      }

      input.value = "";
      toast("Mulțumim! Îți scriem în curând cu detaliile.");
    });
  }

  initTheme();
  initMenu();
  initSplit();
  initReveal();
  initScroll();
  initPointer();
  initCountdown();
  initGauge();
  initDestinations();
  initCalculator();
  initSlider();
  initSky();
  initBooking();
  $("#year").textContent = new Date().getFullYear();
})();