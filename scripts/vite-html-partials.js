import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function htmlPartials(partialsDir = resolve("src/partials")) {
  const load = () => {
    const map = {};
    for (const file of readdirSync(partialsDir)) {
      if (!file.endsWith(".html")) continue;
      map[file.slice(0, -5)] = readFileSync(resolve(partialsDir, file), "utf8");
    }
    return map;
  };

  const expandPartials = (html, partials, stack = []) =>
    html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) {
        throw new Error(`Partial not found: ${name}`);
      }
      if (stack.includes(name)) {
        throw new Error(`Circular partial: ${[...stack, name].join(" > ")}`);
      }
      return expandPartials(partials[name], partials, [...stack, name]);
    });

  const render = (html, data) => {
    const partials = load();
    let out = expandPartials(html, partials);
    out = out.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, key) =>
      data[key] != null ? String(data[key]) : "",
    );
    return out;
  };

  return {
    name: "html-partials",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const match = html.match(/<!--\s*data:([\s\S]*?)-->/);
        let data = {};
        let source = html;
        if (match) {
          data = JSON.parse(match[1]);
          source = html.replace(match[0], "");
        }
        return render(source, data);
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.includes("partials")) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
