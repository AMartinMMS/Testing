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

async function getAccessToken() {
  const url = `${SFMC_AUTH_BASE_URL}/v2/token`;

  const response = await axios.post(url, {
    grant_type: "client_credentials",
    client_id: SFMC_CLIENT_ID,
    client_secret: SFMC_CLIENT_SECRET,
    account_id: SFMC_ACCOUNT_ID
  });

  const authDebugPath = path.join("content", "auth_response.json");
  fs.writeFileSync(authDebugPath, JSON.stringify(response.data, null, 2));

  return response.data.access_token;
}

async function queryAssetByKey(token, customerKey) {
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

    const outputPath = path.join("content", `${customerKey}_response.json`);
    fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
    console.log(`✅ Saved raw response for asset "${customerKey}"`);
  } catch (error) {
    console.error(`❌ Error fetching asset ${customerKey}:`, error.message);
  }
}

(async () => {
  try {
    const token = await getAccessToken();
    if (!SFMC_ASSET_KEY) {
      console.error("❌ SFMC_ASSET_KEY environment variable is not set.");
      process.exit(1);
    }
    await queryAssetByKey(token, SFMC_ASSET_KEY);
  } catch (error) {
    console.error("❌ Unhandled error:", error.message);
    process.exit(1);
  }
})();
