# Tech stack & Gameplay — "Não bỏng ngô"

Related: [spec.md](spec.md) · [design-requirements.md](design-requirements.md) · mockup [ui-draft-v2.pdf](mockup/ui-draft-v2.pdf)

---

## Part A — Tech stack (keep it simple)

| Piece | Choice | Why / how |
|---|---|---|
| App | **React + Vite** (JavaScript) | Fast to build, one command to run (`npm run dev`). |
| Screens | One `screen` state ("start" → "game1" → … → "plan"), **no router** | A game is a sequence; a simple switch is enough. |
| Styling | Plain CSS + variables from design doc §3 | No framework to learn; tokens in one file `theme.css`. |
| Mascot & icons | Inline SVG React components | Crisp on every phone, mood = a prop (`<Mascot mood="popped"/>`). |
| Text content | `src/content.js` | All Vietnamese text in one place; team edits without touching code. |
| Scoring | `src/scoring.js`, pure functions | Easy to test and tune thresholds. |
| Saving progress | `localStorage` | No login, no database. |
| Research data | Google Sheet + Apps Script (`doPost`) | Free; opt-in, anonymous rows. |
| AI coach | Vercel serverless function `api/coach.js` → **DeepSeek API** (`deepseek-chat`) | The key stays on the server (Vercel env var `DEEPSEEK_API_KEY`), never in the browser. |
| Safety | Crisis-word check in `api/coach.js` + client; 20 msgs/day; system prompt scoped to the report | See spec §6b. |
| Offline fallback | Scripted replies in `content.js` | Demo works without Wi-Fi. |
| Hosting | **Vercel** (free), auto-deploy from GitHub | One link + QR code. Hosts both the app and the AI function. |
| Install as app | `vite-plugin-pwa` | "Add to home screen", works offline. APK later via Capacitor if needed. |
| Tests | Vitest on `scoring.js` | Scores must be right; UI checked by hand. |

### Folder structure
```
app/
  index.html
  src/
    main.jsx, App.jsx        ← screen switcher
    theme.css                ← colors, fonts, buttons
    content.js               ← ALL text (passage, questions, scenarios, solutions, personas)
    scoring.js               ← game metrics → scores → level/persona/reasons
    storage.js               ← localStorage + Sheet upload
    components/              ← Button, ChoiceCard, ProgressBar, FeedbackBanner, Mascot
    screens/                 ← Start, GameIntro, ReadGame, PatienceGame, SkipGame,
                               PhoneDownGame, SelfReport, Result1, Result2,
                               Scenario, Plan, Coach, Challenge, Demo
  api/coach.js               ← DeepSeek proxy (serverless)
  apps-script/sheet.gs       ← paste into Google Sheet
```

### How the pieces talk
```
Player ─▶ React app (phone browser)
            ├─ localStorage (progress, Day 1 score)
            ├─ POST /api/coach ─▶ Vercel function ─▶ DeepSeek
            └─ POST (opt-in) ──▶ Google Apps Script ─▶ Google Sheet
```

---

## Part B — Gameplay

**Total ≈ 8–10 min.** Level 1 measures (no right/wrong pressure, no hearts). Level 2 explores reasons.

### 0. Start
Start → optional info (trường, lớp, giới tính, can skip) → "Màn 1".

### 1. Level 1 — "Não bạn nổ đến mức nào?" (4 games + 5 questions, ~4 min)
Each game: intro screen (rule in 1 line) → play → next. Each game gives a **risk score 0–100** (higher = more popcorn).

| # | Game | What the player does | What we record | Risk score (draft) |
|---|---|---|---|---|
| 1 | **Đọc + thông báo** | Read a ~120-word passage about phones/focus (60s). 4–5 fake notifications slide in; tapping one opens a fake "video" and costs time. Then 3 questions, one per screen with feedback banner. | notification taps, reading time, correct answers | taps × 15 (max 60) + wrong × 13 (max 40) |
| 2 | **Kiên nhẫn** | "Chờ chấm chuyển xanh rồi bấm." The wait is 8–20s (random). | early taps, gave up? | early taps × 25 (max 75) + gave up 25 |
| 3 | **Nút bỏ qua** | Watch a calm slow scene (45s). A "BỎ QUA" button is always visible. | time before first skip | (1 − seconds watched / 45) × 100 |
| 4 | **Đặt điện thoại xuống** | An on-screen phone buzzes/glows for 60s. Don't touch it. | touches, seconds held | touches × 25 (max 100) |

**Self-report:** 5 questions (one per screen, 5 choices: Không bao giờ → Luôn luôn = 0–4).
Self score = average / 4 × 100.

**Final score** = 60% × average(4 games) + 40% × self score.
- 0–39 → **Thấp** · 40–69 → **Trung bình** · 70–100 → **Cao** (tune after testing 10–20 classmates).

**Result screens**
- Result 1: mascot mood (calm / wobbling / popped) + persona name + level + score.
- Result 2: 4 bars:
  - Tập trung khi bị xao nhãng = Game 1
  - Kiên nhẫn = Game 2
  - Muốn chuyển nội dung = Game 3
  - Gắn bó với điện thoại = Game 4 (+ the self-report "check phone" item)

  Plus 1 survey comparison line and the disclaimer.

### 2. Level 2 — "Vì sao bạn hay lướt?" (8 scenarios, ~4 min)
- 8 daily situations (studying + phone buzzes, group study, family dinner, bored at night, after a bad test, friends post a trend, before sleep, weekend).
- Each has 3–4 choices; each choice adds points to the 6 reasons: **Nội dung hấp dẫn · Thói quen · FOMO · Bạn bè · Giảm căng thẳng · Khó tự kiểm soát**.
- No right/wrong, no judging.
- **Top 1–2 reasons** → 2 solutions from the mapping table (spec §6) + 1 solution for the weakest Level 1 bar = **3-solution plan**.

### 3. Plan + AI coach
- Plan screen: main reason + 3 solution cards (tagged Bản thân / Gia đình / Bạn bè / Nhà trường) → LƯU KẾ HOẠCH.
- "HỎI HẠT BẮP": the chat opens with the coach explaining your result, plus 3 quick-reply chips. It knows only your scores, reasons and plan.

### 4. 21-day challenge (retention)
- Vertical path of 21 nodes in 3 weeks: Tuần 1 "Làm quen", Tuần 2 "Giữ nhịp", Tuần 3 "Thành thói quen". Days 1-20 = 1 small task from your 3 solutions, cycled; each solution has 3 lines (one per week, progressively harder, e.g. week 1 "Để điện thoại cách bàn học 2 mét trong 30 phút").
- Each day: the coach asks a check-in question → tick done → streak +1. Finishing day 7 and day 14 shows a "Xong tuần N!" celebration (no retest).
- **Day 21 = replay Level 1** → compare Day 1 vs Day 21 score ("Bạn đã giảm 18 điểm!") → celebration.
- If opted in: Day 1 and Day 21 rows go to the Sheet = before/after evidence for the report.

### 5. Demo mode (judges)
Hidden button (e.g. tap the logo 5 times): jump to any game or scenario, sample result, survey charts, and the Day 1 vs Day 21 summary from the Sheet.

---

## Build order (each step runnable)
1. Vite app + theme + Start → Game 1 → simple result, deployed on Vercel.
2. Games 2–4 + self-report + `scoring.js` (with tests) + Result 1/2.
3. Level 2 scenarios + Plan.
4. AI coach (proxy + chat + fallback).
5. 21-day challenge + Day 21 re-test.
6. Sheet upload, demo mode, PWA, polish.

## What the team must prepare
- DeepSeek API key → put it in Vercel settings (never in code or chat).
- A Google account for the Sheet + Vercel + GitHub (free).
- Review Vietnamese text in `content.js` (passage, questions, scenarios).
- 10–20 classmates to test and tune thresholds.
