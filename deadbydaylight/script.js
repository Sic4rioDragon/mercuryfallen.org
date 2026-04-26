const DBD_MEDIA_BASE = "https://sic4riodragon.uk/deadbydaylight/";
const DBD_PRESTIGE = {
  crestsDir: DBD_MEDIA_BASE + "assets/dbd/Prestige/Crests/",
  bordersDir: DBD_MEDIA_BASE + "assets/dbd/Prestige/Crest%20Borders/",
};

const DBD_IMG = {
  placeholder: DBD_MEDIA_BASE + "assets/img/placeholder.webp",
  missingLogKey: "ivy_dbd_missing_images_v1",
};

const PERK_ICON_BASE =
  "https://raw.githubusercontent.com/snoggles/dbd-perk-emoji/main/images/input/";

window.DBD_SURVIVOR_ORDER_IDS = [
  "dwightfairfield","megthomas","claudettemorel","jakepark","neakarlsson",
  "williambilloverbeck","lauriestrode","acevisconti","fengmin","davidking",
  "quentinsmith","detectivedavidtapp","kate","adamfrancis","jeffjohansen",
  "janeromero","ashleyjwilliams","nancy","steveharrington","yui",
  "zarinalkassir","cherylmason","felixrichter","elodierakoto","yunjinlee",
  "jillvalentine","leonkennedy","mikela","jonahvasquez","yoichiasakawa",
  "haddiekaur","ada","rebeccachambers","vittoriotoscano","thalitalyra",
  "renatolyra","gabrielsoma","nicolascage","ellenripley","alanwake",
  "sableward","thetroupe","laracroft","trevor","tauriecain","orela",
  "rickgrimes","michonnegrimes","VeeBoonyasak","dustin","eleven","kwon"
];

window.DBD_KILLER_ORDER_IDS = [
  "trapper","wraith","hillbilly","nurse","shape","hag","doctor","cannibal",
  "huntress","nightmare","pig","clown","spirit","legion","plague","ghostface",
  "demogorgon","oni","deathslinger","executioner","blight","twins","trickster",
  "nemesis","artist","onryo","dredge","mastermind","knight","skullmerchant",
  "singularity","xenomorph","goodguy","unknown","lich","dracula","houndmaster",
  "ghoul","animatronic","krasue","first","cenobite"
];

window.DBD_sortByMainThenOrder = function(list, orderIds) {
  const idx = new Map(orderIds.map((id, i) => [String(id), i]));
  return [...(list || [])].sort((a, b) => {
    const am = a && a.main ? 1 : 0;
    const bm = b && b.main ? 1 : 0;
    if (am !== bm) return bm - am;

    const ai = idx.has(a?.id) ? idx.get(a.id) : 999999;
    const bi = idx.has(b?.id) ? idx.get(b.id) : 999999;
    if (ai !== bi) return ai - bi;

    return String(a?.name || a?.id || "").localeCompare(String(b?.name || b?.id || ""));
  });
};

function cacheBust(url, version) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version || Date.now())}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[m]));
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

function toMediaPath(p) {
  if (!p) return p;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return DBD_MEDIA_BASE + String(p).replace(/^\/+/, "");
}

function DBD_prestigeBaseKey(p) {
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

function DBD_prestigeAssets(p) {
  const base = DBD_prestigeBaseKey(p);
  if (!base) return null;

  const fill = DBD_PRESTIGE.crestsDir + encodeURIComponent(base) + ".png";
  const border = base === "100"
    ? null
    : (DBD_PRESTIGE.bordersDir + encodeURIComponent(base) + "%20Border.png");

  return { fill, border };
}

function DBD_displayPrestige(entry) {
  return Number(entry?.prestige || 0);
}

function DBD_renderPrestigeBadge(p) {
  if (!p || p <= 0) return "";
  const assets = DBD_prestigeAssets(p);
  if (!assets) return "";

  const digits = String(p).length;

  return `
    <div class="prestige-crest" data-d="${digits}" title="Prestige ${p}">
      <img class="prestige-fill" src="${assets.fill}" alt="">
      ${assets.border ? `<img class="prestige-border" src="${assets.border}" alt="">` : ""}
      <span class="prestige-num">${p}</span>
    </div>
  `;
}

function loadMissingLog() {
  try { return JSON.parse(localStorage.getItem(DBD_IMG.missingLogKey) || "[]"); }
  catch { return []; }
}

function saveMissingLog(list) {
  localStorage.setItem(DBD_IMG.missingLogKey, JSON.stringify(list.slice(0, 500)));
}

function addMissing(entry) {
  const list = loadMissingLog();
  const id = `${entry.type}:${entry.name}:${entry.path}`;
  if (!list.some(x => x.id === id)) {
    list.unshift({ id, ...entry, ts: Date.now() });
    saveMissingLog(list);
  }
}

function attachImageFallback(imgEl, meta) {
  if (!imgEl) return;
  imgEl.addEventListener("error", () => {
    addMissing({ type: meta.type, name: meta.name, path: meta.intendedSrc });

    if (imgEl.src !== DBD_IMG.placeholder) imgEl.src = DBD_IMG.placeholder;

    const wrap = imgEl.closest(".killer") || imgEl.parentElement;
    if (wrap && !wrap.querySelector(".missing-img-badge")) {
      const badge = document.createElement("div");
      badge.className = "missing-img-badge";
      badge.textContent = "MISSING IMG";
      wrap.appendChild(badge);
    }
  }, { once: true });
}

window.DBD_attachImageFallback = attachImageFallback;

function getQueryK() {
  const u = new URL(location.href);
  return (u.searchParams.get("k") || "").trim();
}

function setQueryK(idOrEmpty) {
  const u = new URL(location.href);
  if (idOrEmpty) u.searchParams.set("k", idOrEmpty);
  else u.searchParams.delete("k");
  history.pushState({}, "", u.toString());
}

function normalizeMedalEmbedUrl(url) {
  const s = String(url || "");
  const m = s.match(/\/clips\/([A-Za-z0-9_-]+)/);
  if (m) return `https://medal.tv/clip/${m[1]}`;
  return s;
}

function renderClipEmbed(url) {
  const s = String(url || "");

  if (s.includes("medal.tv/")) {
    const embed = normalizeMedalEmbedUrl(s);
    return `
      <div class="clip-embed">
        <div style="left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;">
          <iframe
            src="${escapeAttr(embed)}"
            style="top:0;left:0;width:100%;height:100%;position:absolute;border:0;"
            allowfullscreen
            scrolling="no"
            allow="autoplay; encrypted-media *; fullscreen *;">
          </iframe>
        </div>
      </div>
    `;
  }

  const yt = s.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{6,})/);
  if (yt) {
    const id = yt[1];
    return `
      <div class="clip-embed">
        <div style="left:0;width:100%;height:0;position:relative;padding-bottom:56.25%;">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${escapeAttr(id)}"
            style="top:0;left:0;width:100%;height:100%;position:absolute;border:0;"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;">
          </iframe>
        </div>
      </div>
    `;
  }

  return `<p><a href="${escapeAttr(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a></p>`;
}

function perkNameToFilename(perkName) {
  let name = String(perkName || "").trim();
  const aliases = {
    "Barbecue & Chilli": "BBQ and Chili.png",
    "BBQ & Chilli": "BBQ and Chili.png",
    "BBQ & Chili": "BBQ and Chili.png",
    "Barbecue & Chili": "BBQ and Chili.png",
    "We're Gonna Live Forever": "We_re Gonna Live Forever.png"
  };
  if (aliases[name]) return [aliases[name]];
  name = name.replace(/’/g, "'").replace(/:/g, "").replace(/'/g, "_");
  const andVersion = name.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  return [name + ".png", andVersion + ".png"];
}

function renderPerkItem(perk) {
  const name = typeof perk === "string" ? perk : (perk?.name || "");
  if (!name) return `<li>(invalid perk)</li>`;

  const files = perkNameToFilename(name);
  const url = PERK_ICON_BASE + files[0];

  return `
    <li class="perk-item">
      <img class="perk-icon" src="${escapeAttr(url)}" alt="${escapeAttr(name)}"
           onerror="this.style.display='none'">
      <span>${escapeHtml(name)}</span>
    </li>
  `;
}

function openModalForKiller(k) {
  const modal = document.getElementById("killerModal");
  const nameEl = document.getElementById("modalName");
  const bodyEl = document.getElementById("modalBody");

  nameEl.textContent = `${k.name} — Prestige ${DBD_displayPrestige(k) || 0}`;

  const fav = k.favLoadout || { perks: [], addons: [] };
  const perks = fav.perks || [];
  const items = fav.addons || [];
  const notes = fav.notes || "";
  const clips = k.clips || [];

  bodyEl.innerHTML = `
    <div class="modal-section">
      <h3>Favorite Loadout</h3>
      <p><b>Perks</b></p>
      ${perks.length ? `<ul class="perk-list">${perks.map(renderPerkItem).join("")}</ul>` : `<p class="muted">(no perks set)</p>`}

      <p><b>Add-ons</b></p>
      ${items.length ? `<ul>${items.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : `<p class="muted">(none set)</p>`}

      ${notes ? `<p><b>Notes:</b> ${escapeHtml(notes)}</p>` : ""}
    </div>

    <div class="modal-section">
      <h3>Clips</h3>
      ${clips.length ? clips.map(c => `${c.title ? `<p><b>${escapeHtml(c.title)}</b></p>` : ""}${renderClipEmbed(c.url)}`).join("") : `<p class="muted">(no clips yet)</p>`}
    </div>
  `;

  modal.classList.remove("hidden");
  setQueryK(k.id);
}

function wireModalClose() {
  const modal = document.getElementById("killerModal");
  const closeBtn = document.getElementById("modalClose");
  if (closeBtn) closeBtn.onclick = () => { modal.classList.add("hidden"); setQueryK(""); };
  if (modal) {
    modal.onclick = (e) => {
      if (e.target.id === "killerModal") {
        modal.classList.add("hidden");
        setQueryK("");
      }
    };
  }
}

function initNameToggle() {
  const btn = document.getElementById("toggleNamesBtn");
  const key = "ivy_dbd_names_off";
  const isOff = localStorage.getItem(key) === "1";
  document.body.classList.toggle("names-off", isOff);
  if (btn) btn.textContent = isOff ? "Turn names on" : "Turn names off";

  btn?.addEventListener("click", () => {
    const next = !document.body.classList.contains("names-off");
    document.body.classList.toggle("names-off", next);
    localStorage.setItem(key, next ? "1" : "0");
    btn.textContent = next ? "Turn names on" : "Turn names off";
  });
}

wireModalClose();
initNameToggle();

if (document.getElementById("killer-grid")) {
  fetch(cacheBust("./killers.json", Date.now()))
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById("killer-grid");
      const updated = document.getElementById("updated");
      if (updated) updated.textContent = "Last updated: " + (data.updated || "unknown");

      const list = data.killers || [];
      const ordered = window.DBD_sortByMainThenOrder(list, window.DBD_KILLER_ORDER_IDS);
      const searchInput = document.getElementById("searchInput");

      function renderGrid(arr) {
        grid.innerHTML = "";

        arr.forEach(k => {
          const div = document.createElement("div");
          div.className = "killer" + (k.main ? " main" : "");

          const src = cacheBust(toMediaPath(k.img), data.updated || Date.now());

          div.innerHTML = `
            <img src="${src}" alt="${escapeAttr(k.name)}">
            <div class="killer-name ${k.nameshown === false ? "is-hidden" : ""}">${escapeHtml(k.name)}</div>
            ${DBD_displayPrestige(k) > 0 ? DBD_renderPrestigeBadge(DBD_displayPrestige(k)) : ""}
          `;

          const imgEl = div.querySelector("img");
          if (imgEl) {
            const intendedSrc = imgEl.getAttribute("src") || imgEl.src;
            attachImageFallback(imgEl, {
              type: "killer",
              name: k.name,
              intendedSrc
            });
          }

          div.addEventListener("click", (e) => {
            const url = `${location.origin}/deadbydaylight/?k=${encodeURIComponent(k.id)}`;
            if (e.ctrlKey || e.metaKey) {
              window.open(url, "_blank");
              return;
            }
            openModalForKiller(k);
          });

          grid.appendChild(div);
        });
      }

      function applyFiltersAndRender() {
        const q = (searchInput?.value || "").toLowerCase().trim();
        const filtered = ordered.filter(k => {
          if (!q) return true;
          return (k.name || "").toLowerCase().includes(q) || (k.id || "").toLowerCase().includes(q);
        });
        renderGrid(filtered);
      }

      searchInput?.addEventListener("input", applyFiltersAndRender);
      applyFiltersAndRender();

      const qk = getQueryK();
      if (qk) {
        const found = ordered.find(x => x.id === qk);
        if (found) openModalForKiller(found);
      }
    })
    .catch(err => console.error("Failed to load killers.json", err));
}