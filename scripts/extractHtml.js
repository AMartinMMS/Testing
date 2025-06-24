const fs = require("fs");
const path = require("path");

const assetKey = process.env.SFMC_ASSET_KEY;
const inputPath = path.join(__dirname, "..", "content", `${assetKey}_response.json`);

try {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const data = JSON.parse(raw);
  const item = data.items?.[0];

  if (!item || !item.content) {
    throw new Error("Asset content not found.");
  }

  const htmlPath = path.join(__dirname, "..", "content", `${item.name}.html`);
  fs.writeFileSync(htmlPath, item.content, "utf-8");
  console.log(`✅ Saved HTML to ${htmlPath}`);
} catch (err) {
  console.error("❌ Failed to extract HTML:", err.message);
  process.exit(1);
}
