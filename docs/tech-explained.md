# Tech stack explained (beginner-friendly)

The basics behind each tool in [tech-and-gameplay.md](tech-and-gameplay.md): what it is, an everyday analogy, why we use it, and what it looks like in our app.

---

## 0. The big picture: how a web app works

```
Phone browser  ──asks for──▶  Server (Vercel)  ──sends back──▶  HTML + CSS + JS files
     │                                                          (our app)
     └── the app then runs INSIDE the phone's browser
```

- **HTML** = the skeleton (text, buttons, images).
- **CSS** = the clothes (colors, sizes, layout).
- **JavaScript (JS)** = the brain (what happens when you tap, timers, scores).

Every web app, including ours, is these three. The tools below just make writing them easier.

---

## 1. Node.js + npm: the toolbox
- **What:** Node.js runs JavaScript on your computer (not just in a browser). **npm** is its "app store" for code libraries.
- **Analogy:** Node is the workshop, npm is the shop where you buy ready-made parts.
- **Why:** React, Vite and everything else are installed through npm.
- **Looks like:**
  ```bash
  npm install      # download all parts listed in package.json
  npm run dev      # start the app on your computer
  ```

---

## 2. React: building the screens
- **What:** a JavaScript library for building interfaces from small reusable pieces called **components**.
- **Analogy:** LEGO. You build a `Button` brick once and reuse it on every screen.
- **Key ideas:**
  - **Component** = a function that returns what to show.
  - **Props** = settings you pass in (`<Mascot mood="popped" />`).
  - **State** = data that changes (score, current screen). When state changes, React redraws the screen automatically.
- **Looks like:**
  ```jsx
  function Button({ label, onClick }) {
    return <button className="btn" onClick={onClick}>{label}</button>;
  }

  const [screen, setScreen] = useState("start");   // state
  <Button label="BẮT ĐẦU" onClick={() => setScreen("game1")} />
  ```
- **JSX** = the HTML-looking code inside JS. It's just a nicer way to write UI.

---

## 3. Vite: the fast builder
- **What:** a tool that (1) runs the app on your computer with instant reload while you code, and (2) packs everything into small files for the internet (`npm run build`).
- **Analogy:** a kitchen. During cooking (dev) you taste instantly; at the end (build) it packs the meal into takeaway boxes.
- **Why:** it's the simplest and fastest starter for React today.

---

## 4. Plain CSS + variables: the look
- **What:** normal CSS, with **variables** for our design tokens.
- **Why:** no extra framework to learn; change one color in one place and the whole app updates.
- **Looks like:**
  ```css
  :root { --primary: #FF9F1C; --primary-lip: #E07F00; }
  .btn  { background: var(--primary); border-radius: 16px;
          box-shadow: 0 4px 0 var(--primary-lip); }       /* the Duolingo-style lip */
  .btn:active { transform: translateY(4px); box-shadow: none; }  /* pressed */
  ```

---

## 5. SVG: the mascot and icons
- **What:** images described as shapes (circles, paths) in code, not pixels.
- **Why:** sharp on every screen size, tiny file, and we can change color or mood with code.
- **Looks like:** `<circle cx="50" cy="50" r="40" fill="#FF9F1C" />` (a round kernel body).

---

## 6. `content.js` and `scoring.js`: separating text and logic
- **content.js** holds all Vietnamese text. The team edits wording here without touching code.
- **scoring.js** holds pure functions: same input → same output, no screens involved. Easy to test.
  ```js
  export function phoneDownRisk(touches) {
    return Math.min(touches * 25, 100);
  }
  ```
- **Why split:** content changes often, logic rarely. Separating them means fewer bugs.

---

## 7. localStorage: memory on the phone
- **What:** a small storage box inside the browser. Data stays after closing the tab.
- **Analogy:** a notebook left in the player's own bag. Only that phone can read it.
- **Why:** saves the Day 1 score and challenge progress with no login or database.
- **Limits:** cleared if the player clears browser data or uses another phone or incognito mode.
  ```js
  localStorage.setItem("day1Score", "74");
  localStorage.getItem("day1Score");   // "74"
  ```

---

## 8. Google Sheet + Apps Script: free research database
- **What:** Apps Script is JavaScript that runs inside Google. We publish a tiny script as a **web app URL**; the game sends results there and the script adds a row to the Sheet.
- **Analogy:** a mailbox. The game posts a letter (anonymous result) and Google files it in the spreadsheet.
- **Why:** free, and the team already knows Sheets, so charts for the report are easy.
- **Looks like (inside Google):**
  ```js
  function doPost(e) {
    const d = JSON.parse(e.postData.contents);
    SpreadsheetApp.getActiveSheet().appendRow([new Date(), d.score, d.level, d.school]);
    return ContentService.createTextOutput("ok");
  }
  ```
- Only sent if the player ticks "Đóng góp kết quả cho nghiên cứu". No names.

---

## 9. API, API key, and why we need a "proxy"
- **API** = a door that lets one program ask another program for something. DeepSeek's API: we send a message, it replies with AI text.
- **API key** = the password for that door. Whoever has it can spend **your** balance.
- **Problem:** anything in the app's code can be seen by players (browser → "View source").
- **Solution: a proxy (serverless function).** The app talks to **our** small server; only the server knows the key and talks to DeepSeek.
  ```
  App ──"Mình học tối thì sao?"──▶ /api/coach (Vercel, has key) ──▶ DeepSeek
  App ◀────────── reply ─────────── /api/coach ◀──────────────────── DeepSeek
  ```
- **Analogy:** students don't get the school safe's code; they ask the office, and the office opens it.

---

## 10. Vercel + serverless functions: hosting
- **What:** a hosting service. Connect a GitHub repo and every update goes online automatically, with a free link like `naobongngo.vercel.app`.
- **Serverless function** = a small piece of backend code (a file in `api/`) that runs only when called. No server to manage.
- **Environment variable** = a secret setting stored in Vercel (`DEEPSEEK_API_KEY`), read by the function and never shipped to the browser.
- **Why:** free, hosts the app and the AI proxy together, and gives one link for the QR code.

---

## 11. DeepSeek API: the AI coach brain
- **What:** a large language model (like ChatGPT/Claude) you call through the API.
- **How a chat call works:** we send a list of messages:
  ```js
  [
    { role: "system", content: "Bạn là Hạt Bắp, chỉ nói về tập trung, điện thoại... Không chẩn đoán y khoa." },
    { role: "system", content: "Kết quả người chơi: điểm 74, lý do chính FOMO, kế hoạch: ..." },
    { role: "user",   content: "Mình học buổi tối thì sao?" }
  ]
  ```
  - **system** = hidden rules and context (the player doesn't see them).
  - **user** = what the player typed. **assistant** = the AI's earlier replies.
- **Cost:** paid per amount of text (tokens). Short chats cost very little; the prepaid balance limits total spend.
- **Our safety layer (the AI's own safety isn't enough for teens):**
  1. Crisis words ("tự tử", "muốn chết"…) → don't call the AI; show a "talk to an adult" message + hotline.
  2. System prompt restricts topics.
  3. Max 20 messages/day, short answers.

---

## 12. PWA: web app that feels like a real app
- **What:** Progressive Web App = a website plus a small **manifest** (name, icon) and a **service worker** (caches files so it works offline).
- **Result:** "Add to home screen" puts an icon on the phone, it opens full-screen, and it works without Wi-Fi (except the AI).
- **How:** the `vite-plugin-pwa` plugin generates both automatically.
- **APK later:** Capacitor wraps the same web app into an Android app file.

---

## 13. Git + GitHub: saving history
- **Git** = "save points" for code; you can always go back. **GitHub** = online backup + sharing for the team.
- **Why:** Vercel deploys from GitHub, and teammates can see and review changes.

---

## 14. Vitest: checking the math
- **What:** a tool that runs small automatic checks ("tests").
- **Why:** the score is the core of Level 1. A test makes sure that, e.g., 2 touches in the phone-down game → risk 50, every time.
  ```js
  test("phone-down risk", () => {
    expect(phoneDownRisk(2)).toBe(50);
  });
  ```

---

## Cheat sheet

| Tool | One line |
|---|---|
| HTML / CSS / JS | Skeleton / clothes / brain |
| Node + npm | Workshop + parts shop |
| React | Build screens from reusable LEGO components |
| Vite | Instant preview while coding, packs the app for the web |
| CSS variables | Change a color once, it updates everywhere |
| SVG | Mascot and icons as sharp, code-drawn shapes |
| localStorage | Notebook kept on the player's phone |
| Apps Script + Sheet | Free mailbox that files results into a spreadsheet |
| API key + proxy | Secret password kept on our server, not in the app |
| Vercel | Free hosting + backend functions + auto-deploy |
| DeepSeek | The AI brain behind Hạt Bắp |
| PWA | Website that installs and works offline like an app |
| Git / GitHub | Save points + online backup |
| Vitest | Automatic checks that scores are correct |

## Learn more (official, free)
- React: react.dev/learn
- Vite: vite.dev/guide
- Vercel functions: vercel.com/docs/functions
- Apps Script web apps: developers.google.com/apps-script/guides/web
- DeepSeek API: api-docs.deepseek.com
- PWA: web.dev/learn/pwa
