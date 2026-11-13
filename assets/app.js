/* Urban Juice — interactions */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "24177000000";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     En-tête : fond au défilement + lien actif
     ------------------------------------------------------------------ */
  var head = document.querySelector(".uj-head");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".uj-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function updateHead() {
    head.classList.toggle("is-scrolled", window.scrollY > 40);
    var current = null;
    var marker = window.scrollY + window.innerHeight * 0.4;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= marker) current = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    });
  }

  /* ------------------------------------------------------------------
     Hero : chapitres pilotés par le défilement
     ------------------------------------------------------------------ */
  var scrub = document.querySelector(".scroll-scrub");
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scrub-scene"));
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".scrub-chapter"));
  var chapterBtns = Array.prototype.slice.call(document.querySelectorAll(".scrub-chapters button"));
  var count = chapters.length;
  var activeIndex = -1;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function updateScrub() {
    if (!scrub) return;
    var vh = window.innerHeight;
    var range = scrub.offsetHeight - vh;
    var y = clamp(-scrub.getBoundingClientRect().top, 0, range);
    var p = range > 0 ? y / range : 0;          // 0 → 1 sur toute la section
    var pos = p * count;                         // 0 → 3
    var index = clamp(Math.round(pos - 0.5), 0, count - 1);

    chapters.forEach(function (ch, i) {
      var t = pos - (i + 0.5);                   // 0 quand le chapitre est centré
      if (i === 0) t = Math.max(t, 0);           // le premier chapitre est en place dès l'arrivée
      if (i === count - 1) t = Math.min(t, 0);   // le dernier reste en place jusqu'à la fin
      var travel = reduceMotion ? 0 : -t * vh * 0.9;
      var fade = 1 - clamp((Math.abs(t) - 0.5) / 0.25, 0, 1);
      ch.style.transform = "translateY(calc(-50% + " + travel.toFixed(1) + "px))";
      ch.style.opacity = fade.toFixed(3);
      ch.classList.toggle("is-active", i === index);
    });

    if (index !== activeIndex) {
      activeIndex = index;
      scenes.forEach(function (s, i) { s.classList.toggle("is-active", i === index); });
      chapterBtns.forEach(function (b, i) { b.classList.toggle("is-active", i === index); });
    }
  }

  chapterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var i = Number(btn.getAttribute("data-chapter"));
      var vh = window.innerHeight;
      var range = scrub.offsetHeight - vh;
      var target = scrub.offsetTop + ((i + 0.5) / count) * range;
      window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ------------------------------------------------------------------
     Apparition des blocs au défilement
     ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(
    ".uj-sec .uj-kicker, .uj-title, .uj-intro, .uj-gamme, .uj-manifeste, .uj-values > div, " +
    ".uj-pdv-media, .uj-pdv-card, .uj-b2b-media, .uj-offer, .uj-form, .uj-fid-box, .uj-foot-big"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Formulaire de devis → WhatsApp
     ------------------------------------------------------------------ */
  var form = document.getElementById("devis-form");
  if (form) {
    var msg = form.querySelector(".uj-form-msg");
    var nameField = form.elements.nom;

    nameField.addEventListener("input", function () {
      nameField.removeAttribute("aria-invalid");
      msg.textContent = "";
      msg.className = "uj-form-msg";
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var nom = String(data.get("nom") || "").trim();

      if (!nom) {
        nameField.setAttribute("aria-invalid", "true");
        nameField.focus();
        msg.textContent = "Indiquez votre nom pour que nous puissions vous répondre.";
        msg.className = "uj-form-msg is-error";
        return;
      }

      var dateRaw = String(data.get("date") || "");
      var dateFr = "";
      if (dateRaw) {
        var parts = dateRaw.split("-");
        dateFr = parts.length === 3 ? parts[2] + "/" + parts[1] + "/" + parts[0] : dateRaw;
      }

      var lines = [
        "Bonjour Urban Juice, je souhaite un devis.",
        "",
        "Nom : " + nom,
        "Entreprise : " + (String(data.get("entreprise") || "").trim() || "—"),
        "Prestation : " + data.get("prestation"),
        "Nombre de boissons : " + (String(data.get("quantite") || "").trim() || "—"),
        "Date souhaitée : " + (dateFr || "—"),
        "Précisions : " + (String(data.get("details") || "").trim() || "—")
      ];

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      var win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;

      msg.textContent = "WhatsApp s'ouvre avec votre demande pré-remplie. Il ne reste qu'à l'envoyer.";
      msg.className = "uj-form-msg is-ok";
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     Boucle de défilement
     ------------------------------------------------------------------ */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHead();
      updateScrub();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  onScroll();
})();
