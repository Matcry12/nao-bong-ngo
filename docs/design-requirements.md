# Design Requirements — Game "Não bỏng ngô"

Style reference: **Duolingo** (principles only). Functional spec: [spec.md](spec.md).

---

## 1. Duolingo analysis — what makes it clean

Sources: blog.duolingo.com/hub/design, duolingo.com, third-party brand extractions (brand-atoms, webdesignhot). design.duolingo.com now redirects; the official hex/type values below are secondhand.

| Area | What Duolingo does | Why it works |
|---|---|---|
| Color | 1 primary (green #58CC02) for actions + success; red only for errors; blue for info; text dark grey #4B4B4B, never pure black; mostly white background | Color = meaning. You always know what to tap. |
| Type | 1 rounded font family, only 2 weights (500, 700); CTA labels in CAPS; few text styles | Friendly but very readable, no visual noise. |
| Buttons | Solid flat fill, radius ~16px, **3D "lip"** = hard bottom shadow 4px of darker shade, no blur; when pressed, the button moves down and the lip disappears | Feels physical and fun to tap. The signature detail. |
| Surfaces | Flat. Light grey 2px borders (#E5E5E5) instead of shadows; newer design even drops borders and uses white space | Clean, no "floating card" look. |
| Illustration | Flat geometric shapes, no outlines, no gradients; mascot shows clear **moods** (happy, sweaty, scared…) | Character carries the emotion so the UI can stay plain. |
| Flow | **One task per screen**, progress bar on top, check button fixed at bottom, feedback banner slides up (green = correct, red = wrong) | Zero decisions about where to look. |
| Motion | Short (120–320ms), purposeful: press, feedback, character reaction; big celebration only at the end of a lesson | Animation = reward, not decoration. |
| Gamification | Streaks, XP, hearts, celebration screens | Brings you back daily. |
| Voice | Short, playful, encouraging; CTAs 1–3 words; wrong answers get kind feedback | Never preachy. |
| Avoids | Gradients, blur shadows, pure black, clutter, many accent colors at once | "Knowing what to remove and what to keep." (Duolingo blog) |

### What we must NOT copy
Duo the owl, Duolingo green as our primary, the Feather font, their logo, names or screens. We copy **principles**, with our own mascot, colors and layout.

---

## 2. Why the first mockup looked "AI slop"
- Gradients everywhere (background, meter, bars).
- Too much on one screen (result: badge + meter + 4 bars + survey + disclaimer + CTA).
- Emoji used as icons, plus decorative dots and patterns.
- Soft blurry shadows on every card.
- Too many colors at once and small text.
- Mascot drawn with outlines and effects instead of flat shapes.

→ Fix with the rules below.

---

## 3. Our design system

### 3.1 Color (6 colors max)
| Token | Hex | Use |
|---|---|---|
| `primary` (Bắp rang) | #FF9F1C | Main buttons, progress, mascot body |
| `primary-lip` | #E07F00 | Button lip / pressed state |
| `correct` | #3CB371 | Correct / success / streak done |
| `danger` | #F25C54 | Wrong answer, "high risk" only, never big fills |
| `info` | #3A86FF | Links, secondary hints |
| `text` | #3D3D3D | Body text (not pure black) |
| `muted` | #8A8A8A | Secondary text |
| `line` | #E8E8E8 | Borders, inactive bars |
| `bg` | #FFFFFF / #FFF8EC | Page / soft section |

Rules: 1 primary per screen. No gradients. Red never means anything except "wrong / high risk". Primary buttons use dark text (#3D2A00) for contrast; white text only when contrast passes.

### 3.2 Typography
- Font: **Nunito** (Google Fonts, rounded, full Vietnamese support). One family only.
- Weights: 600 (body), 800 (headings, buttons).
- Sizes: 28 (title) · 22 (question) · 17 (body) · 15 (small). Nothing below 14.
- Button labels: CAPS, 1–3 words ("BẮT ĐẦU", "KIỂM TRA", "TIẾP TỤC").

### 3.3 Components
- **Button:** flat fill, radius 16, height 52, full width on mobile, lip `box-shadow: 0 4px 0 <lip>`; pressed → `translateY(4px)` and lip 0. Variants: primary, secondary (white + 2px `line` border + grey lip), ghost (text only).
- **Choice card:** white, 2px `line` border, 2px lip, radius 16. Selected → `info` border + light blue fill.
- **Progress bar:** 16px tall, rounded, `line` track, `primary` fill, no gradient.
- **Feedback banner:** slides up from the bottom; green (correct) or red (wrong) tint, icon + 1 short line + CONTINUE button.
- **Cards:** border or nothing. **No blur shadows.**
- Icons: simple flat icons (one set, e.g. Phosphor/Lucide, filled style). **No emoji in UI chrome.**
- Spacing: 4px scale (8 / 16 / 24 / 32). Side gutter 16–20px.

### 3.4 Mascot — "Hạt Bắp" (popcorn kernel)
- Flat geometric shapes, no outlines, no gradients; 2–3 colors.
- Moods = game states: calm kernel (low risk / start), wobbling (medium), popped (high risk), proud (challenge done), worried (streak at risk).
- Max **1 mascot per screen**. It reacts; it doesn't decorate.

### 3.5 Motion
- Press: 100ms. Banner/screen: 250ms ease-out. Celebration: 600ms with overshoot, only at end of a level.
- Respect `prefers-reduced-motion`.

### 3.6 Voice (Vietnamese)
- Short, warm, "bạn". Max 2 lines per message.
- Never scary or medical ("Bạn bị bệnh…" ❌ → "Não bạn đang hơi 'nổ' nhiều đó!" ✅).
- Wrong/weak results → encouraging, always with a next step.

---

## 4. Screen rules (Duolingo flow applied)
Every game screen = **top: progress bar + close (X)** · **middle: one task** · **bottom: one fixed action button**.

| Screen | Content (only this) |
|---|---|
| Start | Mascot (calm), title, 1 line subtitle, BẮT ĐẦU. Disclaimer in small text. |
| Info (optional) | 3 simple pickers: trường, lớp, giới tính. BỎ QUA allowed. |
| Game intro | Mascot + 1-line rule ("Đọc đoạn văn, đừng để thông báo làm phiền!") + SẴN SÀNG. |
| Game 1 – Read | Passage card + fake notifications (generic, no real app logos). Then questions one per screen with feedback banner. |
| Game 2 – Patience | One slow bar/dot, one instruction. |
| Game 3 – Skip urge | Calm scene + SKIP button always visible. |
| Game 4 – Phone-down | Big phone illustration buzzing, countdown ring. |
| Self-report | One question per screen, 5 large choice cards. |
| Result (split into 2 screens) | ① Mascot mood + persona name + level + score. ② 4 bars + 1 survey comparison line + disclaimer + SANG MÀN 2. |
| Scenario (×8) | Progress "3/8", one illustration, question, 3–4 choice cards. No right/wrong banner (no judging). |
| Plan | Top reason (1 line) + 3 solution cards (group label as text tag). LƯU KẾ HOẠCH. |
| 7-day challenge | Duolingo-style vertical **path** of 7 round nodes (done / today / locked) + streak counter. Day 7 node = re-test. |
| Coach chat | Mascot avatar + speech bubbles (mascot left, player right, `line` border, no shadows). 3 quick-reply chips above a text box. "AI có thể sai" note in small text. Opens from Plan screen and each challenge day. |
| Celebration | Mascot proud + 1 line + CONTINUE. Only after Level 1, Level 2, Day 7. |
| Demo (judges) | Plain list of jump buttons + 2 simple charts. No decoration. |

### Gamification mapping
| Duolingo | Ours | Note |
|---|---|---|
| Streak | 7-day challenge streak | Core retention hook |
| Lesson path | 7-node challenge path | |
| Celebration | End of each level | |
| Hearts | ❌ not used | Level 1 is a measurement; penalties would distort it |
| XP / leagues | ❌ not in v1 | Out of scope (<1 week) |

---

## 5. Acceptance checklist (UI review)
- [ ] No gradients, no blur shadows, no emoji icons.
- [ ] ≤ 1 primary color and ≤ 1 mascot per screen.
- [ ] One task per screen; action button fixed at bottom.
- [ ] All text ≥ 14px, Vietnamese diacritics render correctly.
- [ ] Buttons have the 4px lip + press animation.
- [ ] Works at 360px width without horizontal scroll.
- [ ] Wording never medical or scary.

## Open
- Final mascot drawing (Claude drafts SVG vs. team draws).
- Icon set choice.
- Vietnamese copy review (spec Q9).
