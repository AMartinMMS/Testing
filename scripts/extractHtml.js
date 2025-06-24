const fs = require("fs");
const path = require("path");

// Load asset keys
const assets = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "content", "assets.json"), "utf-8")
).assets;

for (const key of assets) {
  const jsonPath = path.join(__dirname, "..", "content", `${key}_response.json`);
  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️ Response file not found for ${key}`);
    continue;
  }

  const response = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  const item = response.items?.[0];
  if (!item || !item.content) {
    console.warn(`⚠️ No content found for ${key}`);
    continue;
  }

  const html = item.content;
  const htmlPath = path.join(__dirname, "..", "content", `${item.name}.html`);
  fs.writeFileSync(htmlPath, html, "utf-8");
  console.log(`✅ Saved ${item.name}.html`);
}
