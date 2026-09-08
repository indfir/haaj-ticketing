export function ThemeInitScript() {
  const script = `
    (function() {
      try {
        var stored = JSON.parse(localStorage.getItem("theme") || "");
        var theme = stored;
        if (!theme) {
          theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else if (theme === "system") {
          theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      } catch(e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
