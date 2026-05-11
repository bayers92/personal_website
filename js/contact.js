(function () {
  "use strict";

  function decodeRot13(value) {
    return value.replace(/[a-z]/gi, function (letter) {
      var base = letter <= "Z" ? 65 : 97;
      return String.fromCharCode(((letter.charCodeAt(0) - base + 13) % 26) + base);
    });
  }

  function bindEmailButtons() {
    var buttons = document.querySelectorAll("[data-email-user][data-email-domain]");

    Array.prototype.forEach.call(buttons, function (button) {
      var user = decodeRot13(button.getAttribute("data-email-user") || "");
      var domain = decodeRot13(button.getAttribute("data-email-domain") || "");
      var email = user && domain ? user + "@" + domain : "";
      var contactEmail = button.parentNode;
      var display = contactEmail ? contactEmail.querySelector("[data-email-display]") : null;

      if (display && email) {
        display.textContent = email;
      }

      button.addEventListener("click", function () {
        if (!email) {
          return;
        }

        window.location.href = "mailto:" + email;
      });
    });
  }

  bindEmailButtons();
}());
