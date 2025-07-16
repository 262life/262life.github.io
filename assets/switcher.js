document.addEventListener("DOMContentLoaded", function () {
  const ref = document.referrer;
  const logo = document.getElementById("dynamic-logo");

  if (!logo) return;

  if (ref.includes("google.com")) {
    logo.src = "/assets/images/logo-google.png";
  } else if (ref.includes("facebook.com")) {
    logo.src = "/assets/images/logo-facebook.png";
  } else {
    logo.src = "/assets/images/logo-default.png";
  }
});


