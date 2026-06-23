// Force full RTL layout for the Hebrew specification docs.
// Setting dir="rtl" on <html> flips Mintlify's Tailwind direction-aware
// layout (navbar, sidebar, content) — a CSS `direction` rule alone does not.
(function () {
  function applyRtl() {
    var html = document.documentElement;
    if (html.getAttribute("dir") !== "rtl") html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "he");
  }
  applyRtl();
  // Re-assert after Mintlify's client-side route changes (SPA navigation).
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(applyRtl).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"],
    });
  }
  document.addEventListener("DOMContentLoaded", applyRtl);
})();
