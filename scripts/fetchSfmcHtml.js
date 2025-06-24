// scripts/fetchAsset.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const {
  SFMC_CLIENT_ID,
  SFMC_CLIENT_SECRET,
  SFMC_ACCOUNT_ID,
  SFMC_AUTH_BASE_URL,
  SFMC_REST_BASE_URL,
  SFMC_ASSET_KEY
} = process.env;

(async () => {
  try {
    const tokenResponse = await axios.post(`${SFMC_AUTH_BASE_URL}/v2/token`, {
      grant_type: "client_credentials",
      client_id: SFMC_CLIENT_ID,
      client_secret: SFMC_CLIENT_SECRET,
      account_id: SFMC_ACCOUNT_ID
    });
    const accessToken = tokenResponse.data.access_token;

    const queryPayload = {
      page: 1,
      pageSize: 1,
      query: {
        property: "customerKey",
        simpleOperator: "equals",
        value: SFMC_ASSET_KEY
      }
    };

    const assetResponse = await axios.post(
      `${SFMC_REST_BASE_URL}/asset/v1/content/assets/query`,
      queryPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const outPath = path.join(__dirname, "..", "content", `${SFMC_ASSET_KEY}_response.json`);
    fs.writeFileSync(outPath, JSON.stringify(assetResponse.data, null, 2));
    console.log(`✅ Saved raw JSON to ${outPath}`);
  } catch (err) {
    console.error("❌ Failed to fetch SFMC asset:", err.message);
    process.exit(1);
  }
})();
