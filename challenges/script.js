const CHALLENGE_LIST = document.getElementById("challengeList");

async function loadChallenges() {
  const res = await fetch("./challenges.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`challenges.json failed: ${res.status}`);
  return await res.json();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChallenges(data) {
  if (!CHALLENGE_LIST) return;

  const list = (data.challenges || [])
    .slice()
    .sort((a, b) => (a.enabled === false) - (b.enabled === false));

  CHALLENGE_LIST.innerHTML = list
    .map((c) => {
      const disabled = c.enabled === false;
      const metaBits = [];

      if (c.notes) metaBits.push(c.notes);
      if (disabled && c.why) metaBits.push(`Disabled: ${c.why}`);

      return `
        <div class="challengeItem ${disabled ? "disabled" : ""}">
          <div class="name">${escapeHtml(c.name || "")}</div>
          ${metaBits.length ? `<div class="meta">${metaBits.map(escapeHtml).join("<br>")}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

async function main() {
  try {
    const challenges = await loadChallenges();
    renderChallenges(challenges);
  } catch (err) {
    console.error("Failed to load challenges", err);
    CHALLENGE_LIST.innerHTML = `<div class="challengeItem disabled"><div class="name">Failed to load challenges.</div></div>`;
  }
}

main();