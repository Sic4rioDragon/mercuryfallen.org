(() => {
  // Pull data + prestige assets from your sic4riodragon.uk DBD
  const REMOTE_BASE = "https://sic4riodragon.uk/deadbydaylight/";
  const SURVIVORS_JSON = "./survivors.json";
  const KILLERS_JSON = "./killers.json";
  
  // Prestige assets
  const PRESTIGE = {
    crestsDir: REMOTE_BASE + "assets/dbd/Prestige/Crests/",
    bordersDir: REMOTE_BASE + "assets/dbd/Prestige/Crest%20Borders/",
  };

  // Perk icons
  const PERK_ICON_BASE =
    "https://raw.githubusercontent.com/snoggles/dbd-perk-emoji/main/images/input/";

  function cacheBust(url, version) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${encodeURIComponent(version || Date.now())}`;
  }
  function applyPrestige(prefix, entry) {
  const p = displayPrestige(entry);
  const assets = prestigeAssets(p);

  const fillEl = document.getElementById(prefix + "PrestigeFill");
  const borderEl = document.getElementById(prefix + "PrestigeBorder");
  const numEl = document.getElementById(prefix + "PrestigeNum");
  const badge = document.getElementById(prefix + "PrestigeBadge");

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
  } else if (badge) {
    badge.style.display = "none";
  }
}

function applyLoadouts(prefix, entry) {
  const favs = Array.isArray(entry.favLoadouts) ? entry.favLoadouts : [];
  const l1 = favs[0] || {};
  const l2 = favs[1] || {};

  const n1 = document.getElementById(prefix + "1name");
  if (n1) n1.textContent = l1.name ? `(${l1.name})` : "";

  const n2 = document.getElementById(prefix + "2name");
  if (n2) n2.textContent = l2.name ? `(${l2.name})` : "";

  const l1perks = Array.isArray(l1.perks) ? l1.perks : [];
  setPerkSlot(prefix + "1perk1", l1perks[0] || "");
  setPerkSlot(prefix + "1perk2", l1perks[1] || "");
  setPerkSlot(prefix + "1perk3", l1perks[2] || "");
  setPerkSlot(prefix + "1perk4", l1perks[3] || "");

  const l2perks = Array.isArray(l2.perks) ? l2.perks : [];
  setPerkSlot(prefix + "2perk1", l2perks[0] || "");
  setPerkSlot(prefix + "2perk2", l2perks[1] || "");
  setPerkSlot(prefix + "2perk3", l2perks[2] || "");
  setPerkSlot(prefix + "2perk4", l2perks[3] || "");

  const itemEl = document.getElementById(prefix + "2item");
  if (itemEl) itemEl.textContent = l2.item ? `Item: ${l2.item}` : "";

  const offEl = document.getElementById(prefix + "2offering");
  if (offEl) offEl.textContent = l2.offering ? `Offering: ${l2.offering}` : "";

  const loadout1Block = document.querySelector(`#${prefix}1perk1`)?.closest(".loadoutBlock");
  const loadout2Block = document.querySelector(`#${prefix}2perk1`)?.closest(".loadoutBlock");

  const l1HasStuff =
    l1perks.some(Boolean) ||
    !!l1.item ||
    !!l1.offering;

  const l2HasStuff =
    l2perks.some(Boolean) ||
    !!l2.item ||
    !!l2.offering;

  if (loadout1Block) loadout1Block.classList.toggle("is-empty", !l1HasStuff);
  if (loadout2Block) loadout2Block.classList.toggle("is-empty", !l2HasStuff);
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

  // display prestige
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
      a.removeAttribute("data-tip");
      a.removeAttribute("aria-label");
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
    a.setAttribute("data-tip", name);
    a.setAttribute("aria-label", name);

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
      const favs = Array.isArray(dwight.favLoadouts) ? dwight.favLoadouts : [];
      
const l1 = favs[0] || {};
const l2 = favs[1] || {};
const l1name = document.getElementById("l1name");
if (l1name) l1name.textContent = l1.name ? `(${l1.name})` : "";

const l2name = document.getElementById("l2name");
if (l2name) l2name.textContent = l2.name ? `(${l2.name})` : "";
const l1perks = Array.isArray(l1.perks) ? l1.perks : [];
setPerkSlot("l1perk1", l1perks[0] || "");
setPerkSlot("l1perk2", l1perks[1] || "");
setPerkSlot("l1perk3", l1perks[2] || "");
setPerkSlot("l1perk4", l1perks[3] || "");

const l2perks = Array.isArray(l2.perks) ? l2.perks : [];
setPerkSlot("l2perk1", l2perks[0] || "");
setPerkSlot("l2perk2", l2perks[1] || "");
setPerkSlot("l2perk3", l2perks[2] || "");
setPerkSlot("l2perk4", l2perks[3] || "");

// Item + offering as text pills for now
const itemEl = document.getElementById("l2item");
if (itemEl) itemEl.textContent = l2.item ? `Item: ${l2.item}` : "";

const offEl = document.getElementById("l2offering");
if (offEl) offEl.textContent = l2.offering ? `Offering: ${l2.offering}` : "";
      
    })
    .catch((err) => console.error("Failed to load survivors.json", err));
fetch(cacheBust(KILLERS_JSON, Date.now()))
  .then((r) => r.json())
  .then((data) => {
    const list = data?.killers || [];
    const wraith = list.find((k) => k.id === "thewraith");
    if (!wraith) {
      console.warn("Wraith not found in killers.json");
      return;
    }

    applyPrestige("wraith", wraith);
    applyLoadouts("w", wraith);
  })
  .catch((err) => console.error("Failed to load killers.json", err));
  })();
