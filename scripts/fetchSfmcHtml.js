const fs = require("fs");
const path = require("path");
const axios = require("axios");

const {
  SFMC_CLIENT_ID,
  SFMC_CLIENT_SECRET,
  SFMC_ACCOUNT_ID,
  SFMC_AUTH_BASE_URL,
  SFMC_REST_BASE_URL
} = process.env;

// Load Customer Keys from JSON
const assetListPath = path.join("content", "assets.json");
const assetKeys = JSON.parse(fs.readFileSync(assetListPath, "utf8")).assets;

async function getAccessToken() {
  const url = `${SFMC_AUTH_BASE_URL}/v2/token`;

  const response = await axios.post(url, {
    grant_type: "client_credentials",
    client_id: SFMC_CLIENT_ID,
    client_secret: SFMC_CLIENT_SECRET,
    account_id: SFMC_ACCOUNT_ID
  });

  return response.data.access_token;
}

async function getHtmlContent(token, customerKey) {
  const url = `${SFMC_REST_BASE_URL}/asset/v1/content/assets/query`;

  try {
    const response = await axios.post(
      url,
      {
        query: {
          property: "customerKey",
          simpleOperator: "equals",
          value: customerKey
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data?.items?.length > 0) {
      const asset = response.data.items[0];

      console.log(`\n🎯 Asset Found for Key: ${customerKey}`);
      console.log("🔍 Asset Metadata:\n", JSON.stringify(asset, null, 2));

      const htmlContent = asset.content?.html || "";

      if (!htmlContent.trim()) {
        console.warn(`⚠️  Asset ${customerKey} has no HTML content.`);
      }

      const outputPath = path.join("content", `${customerKey}.html`);
      fs.writeFileSync(outputPath, htmlContent);
      console.log(`✅ Saved ${customerKey}.html\n`);
    } else {
      console.warn(`⚠️  No asset found for: ${customerKey}`);
    }
  } catch (error) {
    console.error(`❌ Error fetching asset ${customerKey}:`, error.message);
  }
}


(async () => {
  try {
    const token = await getAccessToken();

    for (const customerKey of assetKeys) {
      await getHtmlContent(token, customerKey);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
