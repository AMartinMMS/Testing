const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load env vars
const {
  SFMC_CLIENT_ID,
  SFMC_CLIENT_SECRET,
  SFMC_ACCOUNT_ID,
  SFMC_AUTH_BASE_URL,
  SFMC_REST_BASE_URL
} = process.env;

// Load list of asset keys from content/assets.json
const assetKeys = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "content", "assets.json"), "utf-8")
).assets;

async function getAccessToken() {
  const response = await axios.post(`${SFMC_AUTH_BASE_URL}/v2/token`, {
    grant_type: "client_credentials",
    client_id: SFMC_CLIENT_ID,
    client_secret: SFMC_CLIENT_SECRET,
    account_id: SFMC_ACCOUNT_ID
  });
  return response.data.access_token;
}

async function fetchAsset(key, token) {
  const response = await axios.post(
    `${SFMC_REST_BASE_URL}/asset/v1/content/assets/query`,
    {
      page: 1,
      pageSize: 1,
      query: {
        property: "customerKey",
        simpleOperator: "equals",
        value: key
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
}

(async () => {
  const token = await getAccessToken();

  for (const key of assetKeys) {
    try {
      const data = await fetchAsset(key, token);
      const filePath = path.join(__dirname, "..", "content", `${key}_response.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`✅ Saved response for ${key}`);
    } catch (err) {
      console.error(`❌ Failed to fetch ${key}: ${err.message}`);
    }
  }
})();
