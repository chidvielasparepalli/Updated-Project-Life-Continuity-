import { Composio } from "@composio/core";
import dotenv from "dotenv";
dotenv.config();

const client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

async function run() {
  try {
    const info = await client.toolkits.get("gmail");
    console.log("Found toolkit 'gmail'. Available tools:");
    console.log("Keys on info:", Object.keys(info));
    console.log("Meta structure:", Object.keys(info.meta || {}));
  } catch (e) {
    console.error("Failed:", e);
  }
}

run();
