document.addEventListener("DOMContentLoaded", () => {
  // const ref = document.referrer.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const logo = document.getElementById("dynamic-logo");
  if (!logo) return;

  if (source.includes("liotta.us")) {
    logo.src = "{{ '/assets/images/logo-liotta.png' | relative_url }}";
  } else {
    logo.src = "{{ '/assets/images/logo.png' | relative_url }}";
  }
});

