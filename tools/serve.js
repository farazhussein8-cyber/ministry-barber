/**
 * Zero-dependency static file server for local development.
 *
 * Development tooling only — never deployed. The site itself is plain static
 * files and needs no server of its own in production.
 *
 *   node tools/serve.js [port]
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

/**
 * Dev-only image drop.
 *
 * There is no way to move an image out of a chat window and onto disk, so this
 * gives the browser a place to hand one over: paste or drop an image at
 * /dev-upload and it is written to images/hero-barber.jpg.
 *
 * Localhost dev tooling only — tools/ is never deployed.
 */
const DROP_PAGE = `<!doctype html><meta charset="utf-8">
<title>Drop the hero image</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#131211;color:#FAF9F6;
      font:16px/1.6 system-ui,sans-serif;text-align:center}
 .box{border:2px dashed #B4884D;border-radius:12px;padding:4rem 3rem;max-width:min(90vw,560px)}
 h1{font:400 1.5rem/1.2 Georgia,serif;margin:0 0 .75rem}
 p{color:#A9A49C;margin:.35rem 0}
 kbd{background:#2a2825;border-radius:4px;padding:2px 7px;font-size:.9em}
 .ok{color:#7FBF7F} .err{color:#D9A5A5}
 img{max-width:100%;margin-top:1.25rem;border-radius:8px}
</style>
<div class="box">
  <h1>Drop the hero image</h1>
  <p>Press <kbd>Ctrl</kbd>+<kbd>V</kbd> to paste it, or drag the file here.</p>
  <p>Saved as <code>images/hero-barber.jpg</code></p>
  <p id="status"></p>
  <img id="preview" hidden>
</div>
<script>
const status = document.getElementById('status');
const preview = document.getElementById('preview');
async function send(file){
  if(!file || !file.type.startsWith('image/')){ status.className='err'; status.textContent='That is not an image.'; return; }
  status.className=''; status.textContent='Saving ' + Math.round(file.size/1024) + ' KB...';
  const res = await fetch('/dev-upload/save', {method:'POST', headers:{'content-type':file.type}, body:file});
  const text = await res.text();
  status.className = res.ok ? 'ok' : 'err';
  status.textContent = text;
  if(res.ok){ preview.src = '/images/hero-barber.jpg?t=' + Date.now(); preview.hidden = false; }
}
addEventListener('paste', e => {
  const item = [...e.clipboardData.items].find(i => i.type.startsWith('image/'));
  if(item) send(item.getAsFile());
});
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); send(e.dataTransfer.files[0]); });
</script>`;

createServer(async (req, res) => {
  // --- dev-only image drop ---
  if (req.url.split("?")[0] === "/dev-upload") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(DROP_PAGE);
    return;
  }
  if (req.method === "POST" && req.url.split("?")[0] === "/dev-upload/save") {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 25 * 1024 * 1024) {
        res.writeHead(413).end("Too large (25MB limit).");
        return;
      }
      chunks.push(chunk);
    }
    const { writeFile } = await import("node:fs/promises");
    const target = join(ROOT, "images", "hero-barber.jpg");
    await writeFile(target, Buffer.concat(chunks));
    console.log(`saved hero image: ${(size / 1024).toFixed(0)} KB -> ${target}`);
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Saved ${(size / 1024).toFixed(0)} KB to images/hero-barber.jpg`);
    return;
  }

  const url = decodeURIComponent(req.url.split("?")[0]);
  const relative = normalize(url === "/" ? "/index.html" : url).replace(
    /^([/\\])+/,
    ""
  );
  const filePath = join(ROOT, relative);

  // Refuse anything that escapes the project root.
  if (!filePath.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
}).listen(PORT, () => {
  console.log(`Barber Station dev server: http://localhost:${PORT}`);
});
