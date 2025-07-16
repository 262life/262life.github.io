document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const logo = document.getElementById("dynamic-logo");
  if (!logo) return;

  if (source.includes("liotta.us")) {
    logo.src = "/assets/images/logo-liotta.png";
  }
});

