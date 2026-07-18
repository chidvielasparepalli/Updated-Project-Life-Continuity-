import { Composio } from "@composio/core";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.COMPOSIO_API_KEY || "ak_3nsax86YqCGet-iCQ41M";
console.log("Using API Key:", apiKey);

const client = new Composio({ apiKey });

async function run() {
  try {
    console.log("Calling composio.connectedAccounts.link...");
    const connectionRequest = await client.connectedAccounts.link("sandbox-demo", process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID);
    console.log("Success! Redirect URL is:", connectionRequest.redirectUrl);
  } catch (err) {
    console.error("Caught error:", err);
    if (err && typeof err === "object") {
      console.log("Keys on error:", Object.keys(err));
      console.log("Error details:", JSON.stringify(err, null, 2));
    }
  }
}

run();
