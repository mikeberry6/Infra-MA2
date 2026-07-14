(function () {
  "use strict";

  var BODY_STYLE = "font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#000000;mso-line-height-rule:at-least;";
  var BOLD_STYLE = "font-family:Arial,Helvetica,sans-serif;font-weight:700;color:#000000;";

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function applyStrongStyle(html) {
    return html.replace(/<strong(?:\s[^>]*)?>/gi, '<strong style="' + BOLD_STYLE + '">');
  }

  function buildOutlookHtml(email) {
    var content = email.querySelector("td");
    var rows = [];
    var paragraphIndex = 0;

    function addRow(innerHtml, style, padding) {
      rows.push(
        '<tr><td style="' + BODY_STYLE + (padding || "") + (style || "") + '">' + innerHtml + "</td></tr>"
      );
    }

    function addSpacer(height) {
      rows.push('<tr><td height="' + height + '" style="height:' + height + 'px;font-size:1px;line-height:1px;">&nbsp;</td></tr>');
    }

    Array.prototype.forEach.call(content.children, function (element) {
      if (element.tagName === "P") {
        var paragraphHtml = applyStrongStyle(element.innerHTML.trim());

        if (paragraphIndex === 0) {
          addRow(paragraphHtml, "font-size:18px;line-height:23px;font-weight:700;", "padding:0;");
          addSpacer(18);
        } else if (element.textContent.trim().indexOf("Tier ") === 0) {
          if (paragraphIndex > 1) addSpacer(8);
          addRow(paragraphHtml, "font-size:14px;line-height:19px;font-weight:700;", "padding:0 0 8px 0;");
        } else {
          addSpacer(8);
          addRow(paragraphHtml, "font-size:10px;line-height:14px;color:#444444;", "padding:0;");
        }

        paragraphIndex += 1;
        return;
      }

      if (element.tagName !== "UL") return;

      Array.prototype.forEach.call(element.children, function (managerItem, managerIndex) {
        var managerName = managerItem.firstElementChild.textContent.trim();
        var details = managerItem.querySelector("ul");

        if (managerIndex > 0) addSpacer(8);
        addRow(
          "&#8226;&nbsp;<strong style=\"" + BOLD_STYLE + "\">" + escapeHtml(managerName) + "</strong>",
          "font-weight:700;",
          "padding:0;"
        );

        Array.prototype.forEach.call(details.children, function (detailItem) {
          addRow(
            "&#9702;&nbsp;" + applyStrongStyle(detailItem.innerHTML.trim()),
            "",
            "padding:0 0 2px 18px;"
          );
        });
      });
    });

    return (
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" bgcolor="#FFFFFF" style="width:640px;background-color:#FFFFFF;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;">' +
      rows.join("") +
      "</table>"
    );
  }

  function buildOutlookPlainText(email) {
    var content = email.querySelector("td");
    var lines = [];

    Array.prototype.forEach.call(content.children, function (element) {
      if (element.tagName === "P") {
        if (lines.length) lines.push("");
        lines.push(element.textContent.trim());
        return;
      }

      if (element.tagName !== "UL") return;

      Array.prototype.forEach.call(element.children, function (managerItem) {
        var managerName = managerItem.firstElementChild;
        var details = managerItem.querySelector("ul");
        lines.push("• " + managerName.textContent.trim());

        Array.prototype.forEach.call(details.children, function (detailItem) {
          lines.push("  ◦ " + detailItem.textContent.trim());
        });

        lines.push("");
      });
    });

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function copyWithCommand(html, text) {
    var helper = document.createElement("textarea");
    var copyEventHandled = false;

    function handleCopy(event) {
      if (!event.clipboardData) return;
      event.preventDefault();
      event.clipboardData.setData("text/html", html);
      event.clipboardData.setData("text/plain", text);
      copyEventHandled = true;
    }

    helper.value = text;
    helper.setAttribute("aria-hidden", "true");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    document.addEventListener("copy", handleCopy);

    var commandSucceeded = false;

    try {
      commandSucceeded = document.execCommand("copy");
    } catch (error) {
      commandSucceeded = false;
    } finally {
      document.removeEventListener("copy", handleCopy);
      document.body.removeChild(helper);
    }

    return commandSucceeded && copyEventHandled;
  }

  function showSuccess(button, status) {
    button.textContent = "Copied";
    status.textContent = "Paste directly into Outlook.";
    window.setTimeout(function () {
      button.textContent = "Copy for Outlook";
      status.textContent = "Copies only the email below.";
    }, 5000);
  }

  async function copyForOutlook() {
    var email = document.getElementById("outlook-email");
    var button = document.getElementById("copy-outlook-button");
    var status = document.getElementById("copy-status");
    var html = buildOutlookHtml(email);
    var text = buildOutlookPlainText(email);
    var copied = copyWithCommand(html, text);
    button.focus();

    if (!copied && navigator.clipboard && window.ClipboardItem) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([text], { type: "text/plain" })
          })
        ]);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }

    if (copied) {
      showSuccess(button, status);
    } else {
      status.textContent = "Select the email below, copy, and paste into Outlook.";
    }
  }

  var copyButton = document.getElementById("copy-outlook-button");
  copyButton.addEventListener("click", copyForOutlook);
  copyButton.setAttribute("data-copy-ready", "true");
})();
