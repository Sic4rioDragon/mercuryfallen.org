(() => {
  const ASSET_BASE = "https://sic4riodragon.uk/deadbydaylight/assets/";

  // ✅ Fill these with the exact filenames/paths you already use on your site.
  // If you tell me your exact asset paths, I’ll make this 100% exact.
  const dwight = {
    prestigeCrest: ASSET_BASE + "dbd/prestige/p100.png", // <-- change
    perks: [
      ASSET_BASE + "dbd/perks/bond.png",                 // <-- change
      ASSET_BASE + "dbd/perks/prove_thyself.png",        // <-- change
      ASSET_BASE + "dbd/perks/leader.png",               // <-- change
      ASSET_BASE + "dbd/perks/windows_of_opportunity.png"// <-- change
    ],
    item: ASSET_BASE + "dbd/items/medkit.png",           // <-- change
    addon1: ASSET_BASE + "dbd/addons/gauze_roll.png",    // <-- change
    addon2: ASSET_BASE + "dbd/addons/self_adherent_wrap.png", // <-- change
    offering: ASSET_BASE + "dbd/offerings/shroud.png"    // <-- change
  };

  // Crest
  const crest = document.getElementById("prestigeCrest");
  if (crest) crest.src = dwight.prestigeCrest;

  // Helper to set a slot image + link
  function setSlot(id, imgUrl) {
    const a = document.getElementById(id);
    if (!a) return;
    const img = a.querySelector("img");
    if (img) img.src = imgUrl;
    // Clicking an icon should not open the modal — keep it as a link
    a.href = imgUrl;
    a.addEventListener("click", (e) => e.stopPropagation());
  }

  setSlot("perk1", dwight.perks[0]);
  setSlot("perk2", dwight.perks[1]);
  setSlot("perk3", dwight.perks[2]);
  setSlot("perk4", dwight.perks[3]);
  setSlot("item", dwight.item);
  setSlot("addon1", dwight.addon1);
  setSlot("addon2", dwight.addon2);
  setSlot("offering", dwight.offering);

  // Click card => open modal (full portrait)
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

  if (card) {
    card.addEventListener("click", () => openModal(card.dataset.full));
  }
  if (close) close.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();