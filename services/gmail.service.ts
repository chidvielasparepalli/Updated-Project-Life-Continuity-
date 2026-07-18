import { IEmailRepository } from "../repositories/EmailRepository";

export class GmailService {
  constructor(private emailRepository: IEmailRepository) {}

  async getSettings(uid: string) {
    return this.emailRepository.getSettings(uid);
  }

  async updateSettings(uid: string, targetKeywords: string) {
    return this.emailRepository.updateSettings(uid, targetKeywords);
  }

  async getRecords(uid: string) {
    return this.emailRepository.getRecordsByUid(uid);
  }

  async deleteRecord(id: string) {
    return this.emailRepository.deleteRecord(id);
  }

  async syncEmails(
    uid: string,
    composio: any,
    ai: any,
    targetKeywords: string
  ) {
    // 1. Build search query
    const keywordList = targetKeywords.split(",").map((k: string) => k.trim().toLowerCase()).filter(Boolean);
    let gmailQuery = "";
    if (keywordList.length > 0) {
      const subTerms = keywordList.join(" OR ");
      const globalTerms = keywordList.map(k => `"${k}"`).join(" OR ");
      gmailQuery = `(subject:(${subTerms}) OR ${globalTerms})`;
    }
    const defaultQuery = "bill OR invoice OR renewal OR appointment OR booking OR flight OR check-in";
    const finalQuery = gmailQuery || defaultQuery;

    console.log(`[COMPOSIO GMAIL SYNC] Fetching emails for user: ${uid} with query: "${finalQuery}"`);

    // 2. Fetch via Composio
    const response = await composio.tools.execute("GMAIL_FETCH_EMAILS", {
      userId: uid,
      dangerouslySkipVersionCheck: true,
      arguments: {
        query: finalQuery,
        max_results: 8
      }
    });

    console.log("[COMPOSIO RESPONSE RECEIVED]", JSON.stringify(response)?.slice(0, 300));

    let emailList: any[] = [];
    if (response && typeof response === "object") {
      const dataObj = (response as any).data || (response as any).result || response;
      if (Array.isArray(dataObj)) {
        emailList = dataObj;
      } else if (dataObj && typeof dataObj === "object") {
        const possibleArray = dataObj.messages || dataObj.emails || dataObj.data || dataObj.result;
        if (Array.isArray(possibleArray)) {
          emailList = possibleArray;
        }
      }
    }

    const fetchedEmails: any[] = [];
    for (const email of emailList) {
      if (!email) continue;

      let subject = email.subject || email.title || email.messageSubject || "No Subject";
      let sender = email.from || email.sender || email.senderAddress || email.messageSender || "Unknown Sender";
      let dateStr = email.date || email.dateTime || email.receivedAt || email.messageDate || email.messageTimestamp || new Date().toISOString();

      const headers = email.payload?.headers || email.headers;
      if (Array.isArray(headers)) {
        const subHeader = headers.find((h: any) => h.name?.toLowerCase() === "subject");
        if (subHeader) subject = subHeader.value;
        const fromHeader = headers.find((h: any) => h.name?.toLowerCase() === "from");
        if (fromHeader) sender = fromHeader.value;
        const dateHeader = headers.find((h: any) => h.name?.toLowerCase() === "date");
        if (dateHeader) dateStr = dateHeader.value;
      }

      let body = email.body || email.snippet || email.content || email.messageText || "";
      if (body.includes("<html") || body.includes("<body") || body.includes("<div")) {
        body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      let gmailUrl = email.gmailUrl || email.webLink || email.display_url;
      if (gmailUrl) {
        gmailUrl = gmailUrl.replace("#inbox/", "#all/");
      } else {
        const emailId = email.threadId || email.id;
        if (emailId) {
          gmailUrl = `https://mail.google.com/mail/u/0/#all/${emailId}`;
        } else {
          let cleanSender = sender;
          const emailMatch = sender.match(/<([^>]+)>/);
          if (emailMatch && emailMatch[1]) {
            cleanSender = emailMatch[1];
          }
          gmailUrl = `https://mail.google.com/mail/u/0/#search/from:${encodeURIComponent(cleanSender)}+subject:(${encodeURIComponent(subject)})`;
        }
      }

      fetchedEmails.push({ subject, sender, body, date: new Date(dateStr).toISOString(), gmailUrl });
    }

    if (fetchedEmails.length === 0) {
      return [];
    }

    // 3. Classify
    let processed: any[] = [];
    if (fetchedEmails.length > 0 && ai) {
      try {
        const prompt = `You are an email classifier. Given the following list of emails, classify each into one of these exact categories: "Bills", "Insurance", "Travel", "Healthcare", "Appointments".
Then write a 1-sentence plain English summary of the critical action items or dates for each.
Respond with JSON ONLY as an array of objects matching this exact structure:
[
  {
    "index": number,
    "category": "Bills" | "Insurance" | "Travel" | "Healthcare" | "Appointments",
    "summary": "plain English summary of critical action items"
  }
]

Emails:
${fetchedEmails.map((e, idx) => `Email #${idx}:\nSubject: ${e.subject}\nBody: ${e.body}`).join("\n\n")}`;

        const classification = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        const resultsArray = JSON.parse(classification.text || "[]");
        processed = fetchedEmails.map((email, idx) => {
          const matched = Array.isArray(resultsArray) ? resultsArray.find((r: any) => r.index === idx) : null;
          const category = matched?.category || "Bills";
          const summary = matched?.summary || email.body;

          return {
            id: "email-" + Math.random().toString(36).substr(2, 9),
            uid,
            subject: email.subject,
            sender: email.sender,
            category,
            date: email.date,
            extractedSummary: summary,
            rawSnippet: email.body.substring(0, 150),
            gmailUrl: email.gmailUrl
          };
        });
      } catch (err: any) {
        console.warn("Gemini batch classification failed, using fast local processing fallback:", err.message || err);
      }
    }

    if (fetchedEmails.length > 0 && processed.length === 0) {
      processed = fetchedEmails.map((email) => {
        let category: "Bills" | "Insurance" | "Travel" | "Healthcare" | "Appointments" = "Bills";
        let summary = email.body;

        const sub = email.subject.toLowerCase();
        if (sub.includes("appointment") || sub.includes("dent clean-up")) {
          category = "Appointments";
          summary = `Scheduled appointment: ${email.subject}.`;
        } else if (sub.includes("policy") || sub.includes("insurance") || sub.includes("premium")) {
          category = "Insurance";
          summary = `Insurance policy update: ${email.subject}.`;
        } else if (sub.includes("flight") || sub.includes("confirmation") || sub.includes("booking") || sub.includes("cabin")) {
          category = "Travel";
          summary = `Travel booking details: ${email.subject}.`;
        } else if (sub.includes("lab") || sub.includes("health") || sub.includes("medical") || sub.includes("results")) {
          category = "Healthcare";
          summary = `Healthcare action item: ${email.subject}.`;
        } else {
          category = "Bills";
          summary = `Billing notification: ${email.subject}.`;
        }

        return {
          id: "email-" + Math.random().toString(36).substr(2, 9),
          uid,
          subject: email.subject,
          sender: email.sender,
          category,
          date: email.date,
          extractedSummary: summary,
          rawSnippet: email.body.substring(0, 150),
          gmailUrl: email.gmailUrl
        };
      });
    }

    // Save non-duplicates
    const existingRecords = await this.emailRepository.getRecordsByUid(uid);
    const existingKeys = new Set(existingRecords.map(r => `${r.subject}_${r.date}`));
    const uniqueNewRecords = processed.filter(r => !existingKeys.has(`${r.subject}_${r.date}`));

    for (const record of uniqueNewRecords) {
      await this.emailRepository.createRecord(record);
    }

    return processed;
  }
}
