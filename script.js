// ========================================
// REGINA VIOLETA PORTFOLIO - script.js
// Pastikan file ini satu folder dengan index.html.
// Foto dimasukkan melalui tag <img> di index.html.
// ========================================

"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ========================================
// 1. MOBILE NAVIGATION
// ========================================
const menuToggle = $("#menuToggle");
const navigation = $("#navigation");

if (menuToggle && navigation) {
  menuToggle.setAttribute("aria-expanded", "false");

  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Highlight the navigation link for the visible section.
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$(".nav-link").forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  $$("main section[id]").forEach((section) => sectionObserver.observe(section));
}

// ========================================
// 2. SKILLS CHART (CANVAS)
// ========================================
const skills = [
  { label: "UI / UX", value: 82, type: "pink" },
  { label: "Figma", value: 76, type: "pink" },
  { label: "HTML / CSS", value: 70, type: "blue" },
  { label: "JavaScript", value: 58, type: "blue" },
  { label: "Data / Excel", value: 68, type: "blue" }
];

const canvas = $("#skillsChart");
const ctx = canvas ? canvas.getContext("2d") : null;
let chartAnimated = false;
let resizeFrame = null;

function roundedRect(context, x, y, width, height, radius) {
  if (width <= 0 || height <= 0) return;
  const r = Math.min(radius, height / 2, width / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawSkillsChart(progress = 1) {
  if (!canvas || !ctx) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const left = Math.min(88, Math.max(70, width * 0.25));
  const right = 28;
  const top = 12;
  const bottom = 17;
  const plotWidth = Math.max(10, width - left - right);
  const rowHeight = (height - top - bottom) / skills.length;

  ctx.font = "10px Arial";
  ctx.textBaseline = "middle";

  [0, 25, 50, 75, 100].forEach((value) => {
    const x = left + (plotWidth * value) / 100;
    ctx.beginPath();
    ctx.strokeStyle = "#f0e4e9";
    ctx.lineWidth = 1;
    ctx.moveTo(x, top - 2);
    ctx.lineTo(x, height - bottom + 1);
    ctx.stroke();

    ctx.fillStyle = "#b2a3ae";
    ctx.textAlign = "center";
    ctx.fillText(String(value), x, height - 5);
  });

  skills.forEach((skill, index) => {
    const y = top + index * rowHeight + rowHeight * 0.22;
    const barHeight = Math.min(15, rowHeight * 0.48);

    ctx.textAlign = "left";
    ctx.fillStyle = "#746875";
    ctx.fillText(skill.label, 0, y + barHeight / 2);

    ctx.fillStyle = "#f5e9ed";
    roundedRect(ctx, left, y, plotWidth, barHeight, 7);
    ctx.fill();

    const barWidth = plotWidth * (skill.value / 100) * progress;
    const gradient = ctx.createLinearGradient(left, 0, left + Math.max(barWidth, 1), 0);
    if (skill.type === "pink") {
      gradient.addColorStop(0, "#e6a0b5");
      gradient.addColorStop(1, "#f0c2cf");
    } else {
      gradient.addColorStop(0, "#a7cfe5");
      gradient.addColorStop(1, "#c4e2f1");
    }

    ctx.fillStyle = gradient;
    roundedRect(ctx, left, y, barWidth, barHeight, 7);
    ctx.fill();

    if (progress > 0.96) {
      ctx.fillStyle = "#8a7181";
      ctx.textAlign = "right";
      ctx.fillText(`${skill.value}%`, width - 1, y + barHeight / 2);
    }
  });
}

function animateChart() {
  if (!canvas || !ctx || chartAnimated) return;
  chartAnimated = true;
  const startTime = performance.now();
  const duration = 1000;

  function frame(currentTime) {
    const progress = Math.min(1, (currentTime - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    drawSkillsChart(eased);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (canvas && ctx) {
  if ("IntersectionObserver" in window) {
    const chartObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) animateChart();
    }, { threshold: 0.2 });
    chartObserver.observe(canvas);
  } else {
    animateChart();
  }

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => drawSkillsChart(chartAnimated ? 1 : 0));
  });
  drawSkillsChart(0);
}

// ========================================
// 3. SCROLL REVEAL ANIMATION
// ========================================
const revealElements = $$(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// ========================================
// 4. CONTACT FORM
// ========================================
const contactForm = $("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const name = $("#name")?.value.trim() || "";
    const phone = $("#phone")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const message = $("#message")?.value.trim() || "";
    const status = $("#formStatus");

    if (!name || !phone || !email || !message) {
      if (status) status.textContent = "Please complete all fields.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    // GANTI alamat ini dengan email kamu sendiri.
    const recipient = "your.email@example.com";
    if (status) status.textContent = "Preparing your email message...";
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}

// ========================================
// 5. AUTOMATIC COPYRIGHT YEAR
// ========================================
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

// ========================================
// 6. CHECK IMAGE PATHS
// ========================================
$$("img[src]").forEach((image) => {
  image.addEventListener("error", () => {
    console.warn(`Image not found: ${image.getAttribute("src")}`);
  });
});
