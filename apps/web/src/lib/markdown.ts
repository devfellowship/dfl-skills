function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(t: string): string {
  return esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inCode = false;
  let code = "";
  let inList = false;

  const closeList = (): void => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const raw of lines) {
    if (raw.trim().startsWith("```")) {
      if (inCode) {
        html += `<pre><code>${esc(code)}</code></pre>`;
        code = "";
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code += `${raw}\n`;
      continue;
    }
    if (/^### /.test(raw)) {
      closeList();
      html += `<h3>${inline(raw.slice(4))}</h3>`;
    } else if (/^## /.test(raw)) {
      closeList();
      html += `<h2>${inline(raw.slice(3))}</h2>`;
    } else if (/^# /.test(raw)) {
      closeList();
      html += `<h1>${inline(raw.slice(2))}</h1>`;
    } else if (/^- /.test(raw)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inline(raw.slice(2))}</li>`;
    } else if (raw.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p>${inline(raw)}</p>`;
    }
  }
  closeList();
  return html;
}
