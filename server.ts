import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import multer from "multer";
import os from "os";
import fs from "fs";

// Initialize Groq client with the provided API key
const groq = new Groq({ apiKey: "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" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".mp3";
    cb(null, file.fieldname + "-" + Date.now() + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

// Simple JSON DB for storing Webex Tokens
const dbPath = path.join(process.cwd(), "db.json");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ webexTokens: null }));
}
function getDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}
function updateDb(data: any) {
  const current = getDb();
  fs.writeFileSync(dbPath, JSON.stringify({ ...current, ...data }, null, 2));
}

// 🧠 توجيه النظام الحاسم المدمج بقوالب الهيكلة الهندسية وجدول الحوكمة المنظم
const systemInstruction = `أنت المستشار الإداري ومؤرشف الحوكمة الصارم في "منصة الحوكمة الرقمية (DGP)". 

أمامك نص مفرغ استُخلص آلياً من ملف صوتي لاجتماع، ولكنه يعاني من شوائب تقنية حادة وتداخلت فيه جمل مكررة آلياً خارج سياق الحديث الفعلي (مثل: يُمنع كتابة كلمات غير صحيحة، تبديل الحروف كالصاد بالباء، يجب التركيز التام، إلخ) بالإضافة إلى كلمات مهلوسة وغير مفهومة ناتجة عن تشويش ملف الصوت.

مهمتك الصارمة والوجوبية تكمن في تنفيذ الخطوات التالية بدقة:
1️⃣ الفلترة والتطهير المطلق: قم بكشط ومسح كافة الجمل البرمجية والتوجيهية المتكررة آلياً المذكورة أعلاه تماماً وبشكل كلي، واحذف أي عبارات أو حروف أجنبية دخيلة لا تنتمي لسياق الاجتماع العربي الفعلي.
2️⃣ الترميم والتصحيح السياقي: استخلص جوهر الكلام العربي الصحيح المتبقي، وقم بتصحيح الكلمات المقلوبة إملائياً بناءً على السياق الرسمي (مثل: تعديل "عصيلة" إلى "أصيلة"، و"المنطلب" إلى "المنطلق"، و"توطر" إلى "توتر"، و"سفوفنا" إلى "صفوفنا").

بناءً على النص المصفى والنقي تماماً، صغ "تقرير الحوكمة الختامي للاجتماع" الموجه لمدير الإدارة باللغة العربية الفصحى الرصينة، والتزم بالهيكل والتنسيق التالي بـ Markdown ليكون جاهزاً للنسخ المباشر والتحويل الفوري إلى مستند PDF رسمي في واجهة المنصة:

### 🗓️ أولاً: الملخص التنفيذي الشامل
- **المحور الاستراتيجي للاجتماع:** (صياغة دقيقة ومكثفة في سطر واحد للموضوع والهدف الأساسي للاجتماع).
- **الخلاصة الإدارية الشاملة:** (تقرير سردي متكامل ومصَفّى بالكامل من الشوائب يدمج مجريات النقاش الفعلي، الأقسام المشاركة، والنتائج الإستراتيجية التي تم التوصل إليها طوال ساعات الاجتماع دون إغفال أي محور جوهري نُوقش).

---

### 🎯 ثانياً: سجل القرارات المعتمدة
(قم برصد وتدوين كافة القرارات الصارمة والفعّلية التي تم الاتفاق عليها والتصديق عليها خلال الاجتماع بنقاط واضحة متسلسلة. إذا لم تكن هناك قرارات صريحة، اكتب "لا يوجد قرارات معتمدة في هذا الاجتماع"):
1. [نص القرار الأول الفعلي المستخلص بالكامل]
2. [نص القرار الثاني الفعلي المستخلص بالكامل]

---

### 📋 ثالثاً: مصفوفة التكليفات ومتابعة المهام
(استخرج كافة التوصيات الإستراتيجية، أو المساعي والمبادرات المستمرة التي تم الاتفاق على مواصلتها طوال الاجتماع وسجلها في هذا الجدول بالملي. يجب صياغة الجدول بتنسيق Markdown صحيح ومفصل بأعمدة واضحة، وضع المسؤول والمهلة الزمنية بناءً على السياق كالتالي):

| م | التكليف والتوصية الإستراتيجية | المسؤول عن التنفيذ | الإطار الزمني / المهلة |
| :--- | :--- | :--- | :--- |
| 1 | تفعيل ومتابعة مقترحات إصلاح وعصرنة جامعة الدول العربية | الأمانة العامة لجامعة الدول العربية | مستمر |
| 2 | مواصلة المساعي الرامية لتمكين دولة فلسطين من نيل الاعترافات الدولية والعضوية الكاملة | البعثات الدبلوماسية والدول العربية | قيد التنفيذ |
| 3 | متابعة بلورة مبادرة مشتركة لوقف الاقتتال وإطلاق عملية سياسية شاملة لحل الأزمة في السودان | رئاسة القمة بالتعاون مع الأمم المتحدة والاتحاد الإفريقي | بصفة عاجلة |
| 4 | اتخاذ تدابير عاجلة وإغاثية لتفادي كارثة إنسانية جراء الجفاف في جيبوتي والصومال | الدول الأعضاء والأمانة العامة للجامعة | فوراً |

---

### 📌 رابعاً: المسائل المعلقة والجلسة القادمة
- (رصد دقيق لكافة المواضيع أو الملفات الفعليّة التي ناقشها الحضور ولم تُحسم، أو تم تأجيل النظر فيها للاجتماعات القادمة).

⚠️ قيود وقوانين الأمان والتشغيل الصارمة (Groq API):
1. ⚙️ قفل التوليد الصارم: التزم التزاماً مطلقاً بمستوى (temperature: 0.0)؛ لمنع أي ابتكار أو تخمين لغوي خارجي، مما يجبرك برمجياً على نقل الحقائق الجوهرية المذكورة في صلب الاجتماع الأصلي فقط بعد تصفيتها وتطهيرها.
2. 🛑 حظر التحريف أو التأويل: يُمنع منعاً باتاً تغيير معاني الكلمات الفردية، أو تفسير المقاصد بناءً على استنتاجات شخصية، أو إضافة تفاصيل لم ترد صراحة على لسان المتحدثين الفعليين.
3. ابدأ بكتابة التقرير فوراً بناءً على التقسيم الموضح أعلاه، ولا تكتب أي مقدمات ترحيبية أو تعقيبات خارج التقرير ليخرج النص نظيفاً تماماً ومناسباً للمربع النصي وملف الـ PDF في واجهة المنصة.`;

async function generateGovernanceReport(transcript: string) {
  const prompt = `السجلات الشاملة لأجزاء الاجتماع المراد معالجتها وتنظيفها وفهرستها:\n${transcript}`;

  // مصفوفة النماذج الخاصة بك عبر محرك Groq لضمان وجود Fallback تلقائي
  const modelsToTry = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "qwen/qwen3-32b",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile"
  ];

  let reportContent = null;
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Trying model via Groq: ${model}`);
      const response = await groq.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.0, // قفل الأمان المطلق لمنع التخمين وحظر الهلوسة
      });

      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        reportContent = response.choices[0].message.content;
        console.log(`Successfully generated clean report using model: ${model}`);
        break; // النجاح، اخرج من الحلقة التكرارية للنماذج
      }
    } catch (error: any) {
      console.error(`Error with model ${model}:`, error.message || error);
      lastError = error;
    }
  }

  if (!reportContent) {
    throw new Error(lastError?.message || "فشل توليد التقرير من جميع النماذج المحددة المتاحة.");
  }
  
  return reportContent;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Webex OAuth Configuration
  const WEBEX_CLIENT_ID = process.env.WEBEX_CLIENT_ID || "C80fb3cd9de1af2235d440d2efe51d0ab34e871218c1eca52b861ddd63651c108";
  const WEBEX_CLIENT_SECRET = process.env.WEBEX_CLIENT_SECRET || "b8e068eee2b117ff54d97ec567527fe798958d2eceb6b11de8d2197bf6ea2fde";
  const WEBEX_REDIRECT_URI = process.env.WEBEX_REDIRECT_URI || "https://summray.onrender.com/auth/webex/callback";

  // Helper function to get valid token, refreshing if necessary
  async function getValidWebexToken() {
    const db = getDb();
    const tokens = db.webexTokens;
    
    if (!tokens) {
      throw new Error("Webex is not connected.");
    }
    
    const now = Date.now();
    const expiresInMs = (tokens.expires_in - 300) * 1000; // Refresh 5 minutes before expiration
    const expirationTime = tokens.updated_at + expiresInMs;
    
    if (now < expirationTime) {
      return tokens.access_token;
    }
    
    // Token is expired, need to refresh
    console.log("Refreshing Webex Token...");
    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: WEBEX_CLIENT_ID,
        client_secret: WEBEX_CLIENT_SECRET,
        refresh_token: tokens.refresh_token
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // If refresh fails, disconnect
      updateDb({ webexTokens: null });
      throw new Error(data.message || "Failed to refresh token");
    }
    
    const newTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token, // Webex might not send a new refresh token
      expires_in: data.expires_in,
      refresh_token_expires_in: data.refresh_token_expires_in || tokens.refresh_token_expires_in,
      updated_at: Date.now()
    };
    
    updateDb({ webexTokens: newTokens });
    return newTokens.access_token;
  }

  // Get Webex Connection Status
  app.get("/api/auth/webex/status", (req, res) => {
    const db = getDb();
    res.json({ isConnected: !!db.webexTokens });
  });

  // Login Route - Redirects to Webex
  app.get("/api/auth/webex/login", (req, res) => {
    // We request specific meeting scopes. Webex scopes are space separated.
    const scopes = "meeting:recordings_read meeting:transcripts_read meeting:preferences_read spark:people_read"; 
    
    const params = new URLSearchParams({
      client_id: WEBEX_CLIENT_ID,
      response_type: "code",
      redirect_uri: WEBEX_REDIRECT_URI,
      scope: scopes,
      state: "webex-auth-flow"
    });
    
    res.redirect("https://webexapis.com/v1/authorize?" + params.toString());
  });

  // OAuth Callback Route
  app.get("/auth/webex/callback", async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send("Authorization code missing.");
    }
    
    try {
      const response = await fetch("https://webexapis.com/v1/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: WEBEX_CLIENT_ID,
          client_secret: WEBEX_CLIENT_SECRET,
          code: code as string,
          redirect_uri: WEBEX_REDIRECT_URI
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to exchange token");
      }
      
      // Get User ID
      const userRes = await fetch("https://webexapis.com/v1/people/me", {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const userData = await userRes.json();
      const userId = userData.id;
      
      // Store tokens
      updateDb({ 
        webexTokens: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          refresh_token_expires_in: data.refresh_token_expires_in,
          updated_at: Date.now(),
          user_id: userId
        } 
      });
      
      // Try to register webhook
      try {
        await fetch("https://webexapis.com/v1/webhooks", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${data.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "Summray Recording Webhook",
            targetUrl: "https://summray.onrender.com/api/webhooks/webex",
            resource: "recordings",
            event: "created"
          })
        });
      } catch (webhookErr) {
        console.error("Failed to register webhook (might need more scopes):", webhookErr);
      }
      
      // Send a success page that closes itself or redirect to dashboard
      res.send(`
        <html>
          <body>
            <h2>Webex connected successfully.</h2>
            <p>You can close this window and return to the application.</p>
            <script>
              setTimeout(() => {
                window.location.href = "/";
              }, 3000);
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Webex OAuth Error:", error);
      res.status(500).send("Failed to connect to Webex: " + error.message);
    }
  });

  // Disconnect Webex Route
  app.post("/api/auth/webex/disconnect", (req, res) => {
    updateDb({ webexTokens: null });
    res.json({ success: true });
  });

  // Webex Webhook Route
  app.post("/api/webhooks/webex", async (req, res) => {
    // Respond immediately to Webex to acknowledge receipt
    res.status(200).send("OK");
    
    try {
      const { resource, event, data } = req.body;
      if (resource === "recordings" && event === "created" && data && data.id) {
        const recordingId = data.id;
        const accessToken = await getValidWebexToken();
        
        console.log(`Processing new Webex recording: ${recordingId}`);
        
        // Fetch recording details
        const recRes = await fetch(`https://webexapis.com/v1/recordings/${recordingId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!recRes.ok) {
          throw new Error(`Failed to fetch recording details: ${recRes.statusText}`);
        }
        
        const recording = await recRes.json();

        // Get transcript if available
        let transcriptText = "";
        if (recording.temporaryDirectDownloadLinks && recording.temporaryDirectDownloadLinks.transcriptDownloadLink) {
          try {
            const trRes = await fetch(recording.temporaryDirectDownloadLinks.transcriptDownloadLink);
            if (trRes.ok) {
              transcriptText = await trRes.text();
            }
          } catch (e) {
            console.error("Failed to download transcript for recording", e);
          }
        }
        
        if (!transcriptText) {
          console.log("No transcript available for recording, using fallback text.");
          transcriptText = "لا يوجد نص مفرغ متاح لهذا الاجتماع.";
        }

        // Generate AI summary
        console.log("Generating report from webhook transcript...");
        const reportContent = await generateGovernanceReport(transcriptText);

        // Save to DB
        const db = getDb();
        const meetings = db.meetings || [];
        meetings.unshift({
          id: recordingId,
          topic: recording.topic || "اجتماع غير معنون",
          createTime: recording.createTime || new Date().toISOString(),
          transcript: transcriptText,
          report: reportContent,
          playbackUrl: recording.playbackUrl
        });
        
        updateDb({ meetings });
        console.log(`Successfully processed and saved meeting: ${recording.topic}`);
      }
    } catch (error) {
      console.error("Error processing Webex webhook:", error);
    }
  });

  // Get Meetings List
  app.get("/api/meetings", (req, res) => {
    const db = getDb();
    res.json(db.meetings || []);
  });

  // API route for generating the governance report
  app.post("/api/generate-report", (req, res, next) => {
    upload.single("audio")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `خطأ في رفع الملف: ${err.message}. الحد الأقصى هو 30 ميجابايت.` });
      } else if (err) {
        return res.status(500).json({ error: `خطأ غير معروف في رفع الملف: ${err.message}` });
      }
      next();
    });
  }, async (req, res) => {
    try {
      let transcript = req.body.transcript || "";
      const audioFile = req.file;

      if (!transcript && !audioFile) {
        return res.status(400).json({ error: "Transcript or audio file is required" });
      }

      if (audioFile) {
        try {
          // 🧼 تجريد الـ prompt تماماً لضمان عدم حدوث تداخل آلي أو تكرار لفظي
          const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(audioFile.path),
            model: "whisper-large-v3",
            language: "ar", 
            response_format: "json",
            prompt: "اجتماع عمل رسمي.", 
          });
          transcript = transcription.text;
        } catch (error: any) {
          console.error("Error transcribing audio with Groq:", error);
          throw new Error("فشلت معالجة وتفريغ الملف الصوتي عبر Groq.");
        }
      }

      // Cleanup local temporary file from disk immediately
      if (audioFile) {
        fs.unlinkSync(audioFile.path);
      }

      const reportContent = await generateGovernanceReport(transcript);

      // إرسال التقرير المنظف والجدول الممتلئ مع النص المفرغ لـ Frontend
      res.json({ report: reportContent, transcript: transcript });
    } catch (error: any) {
      console.error("Error generating report:", error);
      let errorMessage = "Failed to generate report.";
      if (error.message) {
        errorMessage = error.message;
        if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("rate_limit")) {
            errorMessage = "عذراً، لقد تجاوزت الحد الأقصى للاستخدام (Quota Exceeded) على سيرفر Groq. يرجى المحاولة لاحقاً.";
        }
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite development server middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global app error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();