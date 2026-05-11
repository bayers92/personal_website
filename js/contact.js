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
      button.addEventListener("click", function () {
        var user = decodeRot13(button.getAttribute("data-email-user") || "");
        var domain = decodeRot13(button.getAttribute("data-email-domain") || "");

        if (!user || !domain) {
          return;
        }

        window.location.href = "mailto:" + user + "@" + domain;
      });
    });
  }

  bindEmailButtons();
}());
