(() => {
  const BOT_URL = "https://aya-portfolio-chatbot.vercel.app";
  const W = 400, H = 520;

  const accentGradient = "linear-gradient(90deg, #667eea, #764ba2, #f093fb)";
  const glass = "rgba(15, 18, 40, 0.85)";
  const glow = "0 10px 40px rgba(118,75,162,0.45)";

  const iframe = document.createElement("iframe");
  iframe.src = BOT_URL;
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "90px",
    right: "26px",
    width: W + "px",
    height: H + "px",
    border: "none",
    borderRadius: "20px",
    boxShadow: glow,
    background: "transparent",
    backdropFilter: "blur(20px)",
    transition: "transform 0.35s ease, opacity 0.35s ease",
    transform: "translateY(20px)",
    opacity: "0",
    display: "none",
    zIndex: "9999"
  });

  const button = document.createElement("button");
  button.textContent = "💬";
  button.title = "Chat with Aya";
  Object.assign(button.style, {
    position: "fixed",
    bottom: "24px",
    right: "26px",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "none",
    background: accentGradient,
    color: "#fff",
    fontSize: "28px",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(118,75,162,0.5)",
    transition: "all 0.3s ease",
    zIndex: "10000",
    animation: "chatPulse 3s infinite ease-in-out"
  });

  const style = document.createElement("style");
  style.textContent = `
    @keyframes chatPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(240,147,251,0.4); transform: scale(1); }
      50% { box-shadow: 0 0 20px 10px rgba(240,147,251,0.2); transform: scale(1.06); }
    }
  `;
  document.head.appendChild(style);

  const badge = document.createElement("div");
  Object.assign(badge.style, {
    position: "fixed",
    bottom: "72px",
    right: "72px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#ff3b3b",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 6px rgba(255,0,0,0.7)",
    animation: "popBadge 0.6s ease-out",
    zIndex: "10001"
  });
  badge.textContent = "1";

  const badgeAnim = document.createElement("style");
  badgeAnim.textContent = `
    @keyframes popBadge {
      0% { transform: scale(0); opacity: 0; }
      60% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(badgeAnim);

  let open = false;
  button.onclick = () => {
    open = !open;
    if (open) {
      iframe.style.display = "block";
      requestAnimationFrame(() => {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";
      });
      button.textContent = "×";
      button.style.background = glass;
      button.style.color = "#f093fb";
      button.style.animation = "none";
      badge.remove();
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";
      setTimeout(() => (iframe.style.display = "none"), 350);
      button.textContent = "💬";
      button.style.background = accentGradient;
      button.style.color = "#fff";
      button.style.animation = "chatPulse 3s infinite ease-in-out";
    }
  };

  document.body.appendChild(button);
  document.body.appendChild(iframe);
  document.body.appendChild(badge);
})();
