import { Composio } from "@composio/core";
import dotenv from "dotenv";
dotenv.config();

const client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

async function run() {
  try {
    console.log("Listing all active connected accounts...");
    const accounts = await client.connectedAccounts.list({ statuses: ["ACTIVE"] });
    const items = accounts.items || [];
    console.log(`Found ${items.length} active connected accounts.`);
    for (const acc of items) {
      console.log("- Account details:", JSON.stringify(acc, null, 2));
    }
  } catch (e) {
    console.error("Failed to list connected accounts:", e);
  }
}

run();
