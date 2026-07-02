const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json'));
const token = db.webexTokens.access_token;

async function run() {
  const resources = ['meetingRecordings', 'recordings', 'meetingTranscripts', 'transcripts', 'meetings'];
  for (const r of resources) {
    const res = await fetch("https://webexapis.com/v1/webhooks", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test Hook",
        targetUrl: "https://summray.onrender.com/api/webhooks/webex",
        resource: r,
        event: "created"
      })
    });
    console.log(r, res.status, await res.text());
  }
}
run();
