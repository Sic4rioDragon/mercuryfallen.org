(() => {
  // Twitch embed requires parent=yourdomain.
  // We auto-detect the current hostname so it works on:
  // - mercuryfallen.org
  // - www.mercuryfallen.org
  // - local testing (localhost)
  const host = window.location.hostname || "mercuryfallen.org";
  const parent = encodeURIComponent(host);

  const channel = "mercuryfallen";
  const src = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`;

  const iframe = document.getElementById("twitchEmbed");
  if (iframe) {
    iframe.src = src;
  }
})();