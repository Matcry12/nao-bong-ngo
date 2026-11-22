# Spec — Game "Não bỏng ngô" (Popcorn Brain)

Source: report "Nghiên cứu một số giải pháp hạn chế hiện tượng Não bỏng ngô ở học sinh THPT tỉnh Tuyên Quang" (450 students, 4 solution groups).
Deadline: < 1 week. Language: Vietnamese only.

## 1. Goal
- Level 1: player finds out their popcorn-brain **risk level** (not a diagnosis).
- Level 2: player finds **why** they scroll → gets a personal plan from the report's solutions.

## 2. Platform & stack
- Mobile-first web app, opened by QR/link. Works on laptop too.
- React + Vite, deployed on Vercel or GitHub Pages.
- Later: PWA (manifest + offline), then APK via Capacitor if needed. Same code.
- All text in one file `src/content.js` (team edits wording there, no code changes).

## 3. Flow
Start → (optional info: school, grade, gender) → Level 1 (4 games + 5 items, ~4 min) → Result → Level 2 (8 scenarios, ~4 min) → Plan card + 7-day challenge → (opt-in upload).
Day 7: re-test button (replays Level 1, compares with Day 1).

## 4. Level 1 — Assessment
| # | Game | Report evidence | Measures |
|---|---|---|---|
| 1 | Long read + fake notifications (TikTok/Zalo pop-ups) → 3 comprehension Qs | "bất lực khi đọc hết 1 trang sách" (62), check phone while studying (60–65%), App.03 Q2, App.04 Q2/Q4 | notification taps, accuracy, reading time |
| 2 | Patience test (slow loading bar / wait for green) | "mệt mỏi, thiếu kiên nhẫn" (153), bored by slow activities | early taps, quitting |
| 3 | Skip urge (calm slow scene, "Skip ⏭" always visible) | "khó tập trung >15 phút nếu không có hình ảnh sinh động" (157), App.04 Q3 | time to first skip, skip count |
| 4 | Phone-down challenge (on-screen phone buzzes/glows 60s, don't touch) | "sốt ruột khi không cầm điện thoại" (267) — top symptom | touches, hold-out time |

Self-report: 5 Likert items from Appendix 03/04 (check phone while studying, app-switching, impatience with long text, short-video >2h/day, procrastination).

Score: 60% games + 40% self-report → 0–100.
- 0–39 🌽 Low · 40–69 🍿 Medium · 70–100 💥 High (initial cutoffs; tune on 10–20 classmates).

## 5. Result screen
- Risk level + persona name + popcorn meter (mascot pops more at higher score).
- 4-bar breakdown: Focus under distraction · Patience · Switch urge · Phone attachment.
- Survey comparison line (e.g. "giống 57,1% trong 450 học sinh được khảo sát…").
- Footer: "Đây không phải chẩn đoán y khoa."
- Personas (6, draft names TBD): e.g. "Hạt ngô bình tĩnh" (low) … "Bắp rang nổ liên tục" (high).

## 6. Level 2 — Personal solution
8 daily-life scenarios (e.g. studying + phone buzzes, group study, family dinner, bored at night…). Each choice adds points to reasons (Appendix 02 Q5). Top 1–2 reasons → solutions:

| Reason | Solutions (report group) |
|---|---|
| 🎬 Content too fun | Gradual cut 2h → 1h30 (G1), weekend sports with friends (G3) |
| 🔁 Habit/autopilot | Notifications off, phone away from desk (G1), phone box in class (G4) |
| 😰 FOMO | Notifications off + fixed check times (G1), group phone-down rule (G3) |
| 👥 Friends all use it | Phone-in-bag group study + milk-tea penalty (G3), group weekly goal (G3) |
| 😮‍💨 Stress relief | Outdoor sport (G3), phone-free family dinner (G2), school activities (G4) |
| ⏳ Weak self-control | Gradual daily limit (G1), parents as role model (G2), group tracking (G3) |

+1 focus solution from Level 1's weakest bar.
Output: plan card (3 solutions) + 7-day challenge (1 small task/day, check-off).

## 6b. AI coach "Hạt Bắp" (chatbot)
- Role: personal coach after Level 2. Knows the player's result: score, 4 bars, top reasons, plan, challenge day.
- Where: (1) Plan screen: opens with a short explanation of the result + 3 suggested-question chips; (2) each 7-day challenge day: one check-in question, adapts the next task. **Never during Level 1 games.**
- Scope: focus, phone habits, the plan, study tips, using a summary of the report. Off-topic → friendly redirect. Never medical, never diagnoses.
- Provider: DeepSeek API (team's existing key, prepaid balance = spend cap), called via a Vercel serverless proxy. **Key never in the browser.**
- Privacy: send only anonymous data (scores, reasons, chat text). No names/school. Tell users the AI service is external.
- Safety: strict system prompt; crisis-word check (e.g. "tự tử", "muốn chết", "tự làm hại") runs before the AI call → skip the AI, show a "talk to a teacher/parent/counselor" message + hotline; limit 20 messages/player/day; short answers (≤ 120 words).
- Fallback: AI offline / limit reached → scripted answers from `content.js` (demo never breaks).
- Effort: ~1 extra day.

## 7. Data
- localStorage: results, Day 1 score, challenge progress. No login.
- Opt-in checkbox "Đóng góp kết quả cho nghiên cứu" → Google Sheet via Apps Script: score, breakdown, reasons, school, grade, gender, day (1/7). No names.

## 8. Look & feel
Playful popcorn theme: warm yellow / red / cream, corn-kernel mascot, rounded cards, big buttons, light animations.

## 9. Demo mode (judges)
Hidden button: jump to any game/scenario, sample results, survey charts (450 students), Day 1 vs Day 7 data from the Sheet.

## 10. Scope order (vertical slices)
1. Skeleton: start → 1 game → result (runnable, deployed).
2. Remaining 3 games + self-report + scoring + result screen.
3. Level 2 scenarios + plan card.
4. 7-day challenge + Day 7 re-test.
5. AI coach: proxy + plan-screen chat + scripted fallback, then daily check-ins.
6. Sheet upload, demo mode, PWA.
7. Theme polish, mascot animation.

## Open
- Q9 content: Claude drafts from report, team reviews (details TBD).
- Persona names, scenario texts, reading passage — drafted in `content.js`.
- Threshold tuning after classmate test.
