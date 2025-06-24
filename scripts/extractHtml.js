const fs = require("fs");
const path = require("path");

// Load asset keys
const assets = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "content", "assets.json"), "utf-8")
).assets;

for (const key of assets) {
  const jsonPath = path.join(__dirname, "..", "content", `${key}_response.json`);
  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️ JSON file not found: ${jsonPath}`);
    continue;
  }

  const response = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const item = response.items?.[0];

  if (!item) {
    console.warn(`⚠️ No items found in response for: ${key}`);
    continue;
  }

  if (!item.content || !item.name) {
    console.warn(`⚠️ Missing content or name for asset: ${key}`);
    continue;
  }

  const htmlPath = path.join(__dirname, "..", "content", `${item.name}.html`);
  fs.writeFileSync(htmlPath, item.content, "utf-8");
  console.log(`✅ Extracted: ${htmlPath}`);
}
