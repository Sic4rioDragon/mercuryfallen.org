(() => {
  const PERK_ICON_BASE =
    "https://raw.githubusercontent.com/snoggles/dbd-perk-emoji/main/images/input/";

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
    return "https://sic4riodragon.uk/deadbydaylight/" + String(p).replace(/^\/+/, "");
  }

  function getQueryS() {
    const u = new URL(location.href);
    return (u.searchParams.get("s") || "").trim();
  }

  function setQueryS(idOrEmpty) {
    const u = new URL(location.href);
    if (idOrEmpty) u.searchParams.set("s", idOrEmpty);
    else u.searchParams.delete("s");
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

  function openModalForSurvivor(s) {
    const modal = document.getElementById("killerModal");
    const nameEl = document.getElementById("modalName");
    const bodyEl = document.getElementById("modalBody");

    nameEl.textContent = `${s.name} — Prestige ${Number(s.prestige || 0)}`;

    const fav = s.favLoadout || { perks: [], addons: [] };
    const perks = fav.perks || [];
    const items = fav.addons || [];
    const notes = fav.notes || "";
    const clips = s.clips || [];

    bodyEl.innerHTML = `
      <div class="modal-section">
        <h3>Favorite Loadout</h3>
        <p><b>Perks</b></p>
        ${perks.length ? `<ul class="perk-list">${perks.map(renderPerkItem).join("")}</ul>` : `<p class="muted">(no perks set)</p>`}

        <p><b>Items / Add-ons</b></p>
        ${items.length ? `<ul>${items.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>` : `<p class="muted">(none set)</p>`}

        ${notes ? `<p><b>Notes:</b> ${escapeHtml(notes)}</p>` : ""}
      </div>

      <div class="modal-section">
        <h3>Clips</h3>
        ${clips.length ? clips.map(c => `${c.title ? `<p><b>${escapeHtml(c.title)}</b></p>` : ""}${renderClipEmbed(c.url)}`).join("") : `<p class="muted">(no clips yet)</p>`}
      </div>
    `;

    modal.classList.remove("hidden");
    setQueryS(s.id);
  }

  fetch(cacheBust("./survivors.json", Date.now()))
    .then(r => r.json())
    .then(data => {
      const grid = document.getElementById("survivor-grid");
      const updated = document.getElementById("updated");
      updated.textContent = "Last updated: " + (data.updated || "unknown");

      const list = data.survivors || [];
      const ordered = window.DBD_sortByMainThenOrder(list, window.DBD_SURVIVOR_ORDER_IDS);
      const searchInput = document.getElementById("searchInput");

      function renderGrid(arr) {
        grid.innerHTML = "";

        arr.forEach(s => {
          const div = document.createElement("div");
          div.className = "killer" + (s.main ? " main" : "");

          const src = cacheBust(toMediaPath(s.img), data.updated || Date.now());

          div.innerHTML = `
            <img src="${src}" alt="${escapeAttr(s.name)}">
            <div class="killer-name ${s.nameshown === false ? "is-hidden" : ""}">${escapeHtml(s.name)}</div>
            ${Number(s.prestige || 0) > 0 ? DBD_renderPrestigeBadge(Number(s.prestige || 0)) : ""}
          `;

          const imgEl = div.querySelector("img");
          if (imgEl && window.DBD_attachImageFallback) {
            const intendedSrc = imgEl.getAttribute("src") || imgEl.src;
            window.DBD_attachImageFallback(imgEl, {
              type: "survivor",
              name: s.name,
              intendedSrc
            });
          }

          div.addEventListener("click", (e) => {
            const url = `${location.origin}/deadbydaylight/survivors.html?s=${encodeURIComponent(s.id)}`;
            if (e.ctrlKey || e.metaKey) {
              window.open(url, "_blank");
              return;
            }
            openModalForSurvivor(s);
          });

          grid.appendChild(div);
        });
      }

      function applyFiltersAndRender() {
        const q = (searchInput?.value || "").toLowerCase().trim();
        const filtered = ordered.filter(s => {
          if (!q) return true;
          return (s.name || "").toLowerCase().includes(q) || (s.id || "").toLowerCase().includes(q);
        });
        renderGrid(filtered);
      }

      searchInput?.addEventListener("input", applyFiltersAndRender);
      applyFiltersAndRender();

      const qs = getQueryS();
      if (qs) {
        const found = ordered.find(x => x.id === qs);
        if (found) openModalForSurvivor(found);
      }
    })
    .catch(err => console.error("Failed to load survivors.json", err));
})();