document.addEventListener("DOMContentLoaded", () => {
  const ref = document.referrer.toLowerCase();
  const logo = document.getElementById("dynamic-logo");
  if (!logo) return;

  if (ref.includes("google.com")) {
    logo.src = "{{ '/assets/images/logo-google.png' | relative_url }}";
  } else if (ref.includes("facebook.com")) {
    logo.src = "{{ '/assets/images/logo-facebook.png' | relative_url }}";
  }
});

