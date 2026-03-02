(() => {
  // Pull data + prestige assets from your sic4riodragon.uk DBD
  const REMOTE_BASE = "https://sic4riodragon.uk/deadbydaylight/";
  const SURVIVORS_JSON = REMOTE_BASE + "survivors.json";

  // Prestige assets (same folders your sic4rio page uses)
  const PRESTIGE = {
    crestsDir: REMOTE_BASE + "assets/dbd/Prestige/Crests/",
    bordersDir: REMOTE_BASE + "assets/dbd/Prestige/Crest%20Borders/",
  };

  // Perk icons (same as your sic4rio page)
  const PERK_ICON_BASE =
    "https://raw.githubusercontent.com/snoggles/dbd-perk-emoji/main/images/input/";

  function cacheBust(url, version) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${encodeURIComponent(version || Date.now())}`;
  }

  // ------------------ Prestige mapping (same logic as sic4rio) ------------------
  function prestigeBaseKey(p) {
    if (!p || p <= 0) return null;
    if (p <= 5) return "1 to 5";
    if (p <= 10) return "6 to 10";
    if (p <= 15) return "11 to 15";
    if (p <= 20) return "16 to 20";
    if (p <= 25) return "21 to 25";
    if (p < 30) return "21 to 25";

    const milestones = [30,35,40,45,50,55,60,65,70,75,80,85,90,95,99,100];
    if (p >= 100) return "100";
    for (let i = 0; i < milestones.length; i++) {
      if (p < milestones[i]) return String(milestones[i - 1]);
    }
    return "99";
  }

  function prestigeAssets(p) {
    const base = prestigeBaseKey(p);
    if (!base) return null;
    const is100 = base === "100";
    const fill = PRESTIGE.crestsDir + encodeURIComponent(base) + ".png";
    const border = is100
      ? null
      : PRESTIGE.bordersDir + encodeURIComponent(base) + "%20Border.png";
    return { fill, border };
  }

  // same “display prestige” rule as your site: mains/rotation show true, others cap at 3 after P3
  function displayPrestige(entry) {
    const real = Number(entry?.prestige || 0);
    if (entry?.main === true || entry?.rotation === true) return real;
    if (real <= 3) return real;
    return 3;
  }

  // ------------------ Perk icon mapping (simplified from sic4rio) ------------------
  const PERK_ALIASES = {
    "Barbecue & Chilli": "BBQ and Chili.png",
    "BBQ & Chilli": "BBQ and Chili.png",
    "BBQ & Chili": "BBQ and Chili.png",
    "Barbecue & Chili": "BBQ and Chili.png",
    "We're Gonna Live Forever": "We_re Gonna Live Forever.png",
  };

  function perkNameToFilename(perkName) {
    let name = String(perkName || "").trim();
    if (PERK_ALIASES[name]) return [PERK_ALIASES[name]];
    name = name.replace(/’/g, "'").replace(/:/g, "").replace(/'/g, "_");
    const andVersion = name.replace(/&/g, "and").replace(/\s+/g, " ").trim();
    return [name + ".png", andVersion + ".png"];
  }

  function setSlotIcon(id, urlOrEmpty) {
    const a = document.getElementById(id);
    if (!a) return;
    const img = a.querySelector("img");
    if (!urlOrEmpty) {
      a.classList.add("is-empty");
      if (img) img.removeAttribute("src");
      a.removeAttribute("href");
      return;
    }
    a.classList.remove("is-empty");
    if (img) img.src = urlOrEmpty;
    a.href = urlOrEmpty;
    a.addEventListener("click", (e) => e.stopPropagation());
  }

  function setPerkSlot(id, perkName) {
    const a = document.getElementById(id);
    if (!a) return;
    const img = a.querySelector("img");

    const name = String(perkName || "").trim();
    if (!name) return setSlotIcon(id, "");

    const files = perkNameToFilename(name);
    const first = PERK_ICON_BASE + files[0];
    const second = files[1] ? (PERK_ICON_BASE + files[1]) : null;

    // Try first filename; if fails, try second; if fails, hide slot
    if (img) {
      img.dataset.tried = "0";
      img.onerror = () => {
        if (second && img.dataset.tried === "0") {
          img.dataset.tried = "1";
          img.src = second;
        } else {
          a.classList.add("is-empty");
          img.onerror = null;
        }
      };
      img.src = first;
    }

    a.href = first;
    a.addEventListener("click", (e) => e.stopPropagation());
  }

  // ------------------ Modal (your existing Mercury modal) ------------------
  const card = document.getElementById("dwightCard");
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");
  const close = document.getElementById("modalClose");

  function openModal(src) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    if (modalImg) modalImg.src = "";
  }

  if (card) card.addEventListener("click", () => openModal(card.dataset.full));
  if (close) close.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ------------------ Load Dwight from sic4rio survivors.json ------------------
  fetch(cacheBust(SURVIVORS_JSON, Date.now()))
    .then((r) => r.json())
    .then((data) => {
      const list = data?.survivors || [];
      const dwight = list.find((s) => s.id === "dwightfairfield");
      if (!dwight) {
        console.warn("Dwight not found in survivors.json");
        return;
      }

      // Prestige badge
      const p = displayPrestige(dwight);
      const assets = prestigeAssets(p);

      const fillEl = document.getElementById("prestigeFill");
      const borderEl = document.getElementById("prestigeBorder");
      const numEl = document.getElementById("prestigeNum");

      if (assets && p > 0) {
        if (fillEl) fillEl.src = assets.fill;
        if (borderEl) {
          if (assets.border) {
            borderEl.style.display = "block";
            borderEl.src = assets.border;
          } else {
            borderEl.style.display = "none";
          }
        }
        if (numEl) numEl.textContent = String(p);
      } else {
        // Hide badge if prestige 0
        const badge = document.getElementById("prestigeBadge");
        if (badge) badge.style.display = "none";
      }

      // Favorite loadout -> perk icons on the card (if they exist in your JSON)
      const fav = dwight.favLoadout || {};
      const perks = Array.isArray(fav.perks) ? fav.perks : [];

      setPerkSlot("perk1", perks[0] || "");
      setPerkSlot("perk2", perks[1] || "");
      setPerkSlot("perk3", perks[2] || "");
      setPerkSlot("perk4", perks[3] || "");

      // These aren’t icon-defined in your survivors.json right now (it’s mainly perks/addons strings),
      // so we’ll hide them unless you later add icon filenames:
      setSlotIcon("item", "");
      setSlotIcon("addon1", "");
      setSlotIcon("addon2", "");
      setSlotIcon("offering", "");

      // Enable separator only if any slots show
      const any =
        !document.getElementById("perk1")?.classList.contains("is-empty") ||
        !document.getElementById("perk2")?.classList.contains("is-empty") ||
        !document.getElementById("perk3")?.classList.contains("is-empty") ||
        !document.getElementById("perk4")?.classList.contains("is-empty");

      const loadout = document.querySelector(".loadout");
      if (loadout) loadout.classList.toggle("has-any", !!any);
    })
    .catch((err) => console.error("Failed to load survivors.json", err));
})();