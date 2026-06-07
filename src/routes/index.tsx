import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Save the Date — הזמנה אישית" },
      { name: "description", content: "הזמנה אישית להפתעה מיוחדת" },
    ],
  }),
  component: Index,
});

// === CONFIG ===
const CONFIG = {
  name: "רייצ'ל",
  dateDisplay: "10/06",
  dateISO: "2026-06-10",
  timeStart: "19:00",
  timeEnd: "23:30",
  dayOfWeek: "יום רביעי · כ״ה בסיוון",
  place: "מקום סודי 🤫",
  calendarTitle: "ערב הפתעה 🎁 — אל תשאלי",
};

const TEASES = [
  "נו באמת 🙄",
  "לא היום!",
  "אמרתי לא 😏",
  "תנסי שוב...",
  "כמעט! לא.",
  "בחירה גרועה 😅",
  "חמוד, אבל לא 💅",
  "תפסיקי לרדוף 🏃‍♀️",
];

const FAKE_OPTIONS = [
  "להישאר בבית ולעשות כלום 🛋️",
  "פיצה וסדרה 🍕",
  "פיקניק על חוף הים 🏖️",
];

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return diff;
}

function buildICS() {
  const dt = CONFIG.dateISO.replace(/-/g, "");
  const start = `${dt}T${CONFIG.timeStart.replace(":", "")}00`;
  const end = `${dt}T${CONFIG.timeEnd.replace(":", "")}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SaveTheDate//HE",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@savethedate`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${CONFIG.calendarTitle}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "save-the-date.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function Index() {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [fading, setFading] = useState(false);

  const goto = (s: 1 | 2 | 3) => {
    setFading(true);
    setTimeout(() => {
      setScreen(s);
      setFading(false);
    }, 400);
  };

  return (
    <div dir="rtl" lang="he" className="stp-root">
      <style>{CSS}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;800&display=swap"
      />
      <Bubbles />
      <div className={`stp-screen ${fading ? "fading" : "shown"}`}>
        {screen === 1 && <Screen1 onNext={() => goto(2)} />}
        {screen === 2 && <Screen2 onPick={() => goto(3)} />}
        {screen === 3 && <Screen3 />}
      </div>
    </div>
  );
}

function Bubbles() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        left: Math.random() * 100,
        size: 4 + Math.random() * 10,
        dur: 8 + Math.random() * 10,
        delay: Math.random() * 12,
      })),
    []
  );
  return (
    <div className="stp-bubbles" aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Screen1({ onNext }: { onNext: () => void }) {
  return (
    <div className="stp-s1">
      <div className="stp-tag">✦ הזמנה אישית ✦</div>
      <div className="stp-glass">
        <div className="stp-glass-body">
          <div className="stp-glass-fill" />
        </div>
        <div className="stp-glass-stem" />
        <div className="stp-glass-base" />
      </div>
      <h1 className="stp-h1">
        {CONFIG.name},
        <br />
        <span className="gold">זה הרגע שלך</span>
      </h1>
      <p className="stp-sub">יש לי משהו קטן בשבילך.<br />מבטיח שזה שווה את הלחיצה.</p>
      <button className="stp-btn-primary glow" onClick={onNext}>
        פתחי את ההזמנה ✨
      </button>
    </div>
  );
}

function Screen2({ onPick }: { onPick: () => void }) {
  const [tease, setTease] = useState("בחרי בחוכמה...");
  const [attempts, setAttempts] = useState<Record<number, number>>({});

  return (
    <div className="stp-s2">
      <h2 className="stp-h2">
        אז מה בא לך לעשות<br />ליום ההולדת?
      </h2>
      <div className="stp-tease">{tease}</div>
      <div className="stp-options">
        {FAKE_OPTIONS.map((label, i) => (
          <RunawayButton
            key={i}
            label={label}
            attempts={attempts[i] || 0}
            onEscape={() => {
              setAttempts((a) => ({ ...a, [i]: (a[i] || 0) + 1 }));
              setTease(TEASES[Math.floor(Math.random() * TEASES.length)]);
            }}
          />
        ))}
        <button className="stp-btn-correct glow" onClick={onPick}>
          הפתע אותי 🎁
        </button>
      </div>
    </div>
  );
}

function RunawayButton({
  label,
  attempts,
  onEscape,
}: {
  label: string;
  attempts: number;
  onEscape: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLButtonElement>(null);

  const escape = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const range = Math.min(40 + attempts * 15, 160);
    const x = (Math.random() - 0.5) * range * 2;
    const y = (Math.random() - 0.5) * range;
    const scale = Math.max(0.55, 1 - attempts * 0.08);
    const opacity = Math.max(0.45, 1 - attempts * 0.07);
    setStyle({
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
    });
    onEscape();
  };

  return (
    <button
      ref={ref}
      className="stp-btn-fake"
      style={style}
      onMouseEnter={escape}
      onTouchStart={escape}
      onClick={escape}
    >
      {label}
    </button>
  );
}

function Screen3() {
  const [rsvp, setRsvp] = useState(false);
  const days = daysUntil(CONFIG.dateISO);
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        left: Math.random() * 100,
        color: ["#e8c170", "#f7efe6", "#c9486b", "#7a3a52", "#f0b04a"][
          Math.floor(Math.random() * 5)
        ],
        dur: 3 + Math.random() * 3,
        delay: Math.random() * 2,
        rot: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="stp-s3">
      <div className="stp-confetti" aria-hidden>
        {confetti.map((c, i) => (
          <span
            key={i}
            style={{
              left: `${c.left}%`,
              background: c.color,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
              transform: `rotate(${c.rot}deg)`,
            }}
          />
        ))}
      </div>
      <div className="stp-tag">SAVE THE DATE</div>
      <div className="stp-gift">🎁</div>
      <h2 className="stp-h2">
        יום הולדת<br /><span className="gold">ל{CONFIG.name}</span>
      </h2>
      <p className="stp-sub">ערב הפתעה. סמכי עליי.</p>
      <div className="stp-countdown">
        {days > 0 ? `עוד ${days} ימים ⏳` : days === 0 ? "זה היום! 🎉" : "היה כיף 💛"}
      </div>

      <div className="stp-details">
        <div className="stp-detail">
          <div className="stp-label">מתי</div>
          <div className="stp-value-big">{CONFIG.dateDisplay}</div>
          <div className="stp-value-small">
            {CONFIG.dayOfWeek}
          </div>
        </div>
        <div className="stp-divider" />
        <div className="stp-detail">
          <div className="stp-label">איפה</div>
          <div className="stp-value-big">{CONFIG.place}</div>
          <div className="stp-value-small">(תגלי כשנגיע 😉)</div>
        </div>
      </div>

      {!rsvp ? (
        <button className="stp-btn-primary glow" onClick={() => setRsvp(true)}>
          אני באה! 🥂
        </button>
      ) : (
        <div className="stp-rsvp-ok">
          נתראה שם!<br />סימנתי אותך. אל תאחרי 😉
        </div>
      )}
      <button className="stp-btn-secondary" onClick={buildICS}>
        📅 הוסיפי ליומן
      </button>
    </div>
  );
}

const CSS = `
.stp-root {
  font-family: "Heebo", system-ui, sans-serif;
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #241820 0%, #1a1116 70%, #110a0e 100%);
  color: #f7efe6;
  overflow: hidden;
  position: relative;
  padding: 24px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.stp-screen {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 2;
  transition: opacity 0.4s ease;
  opacity: 1;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 0;
}
.stp-screen.fading { opacity: 0; }

.stp-bubbles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}
.stp-bubbles span {
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f5d57a, #e8c170 60%, transparent 70%);
  opacity: 0.5;
  animation: stp-rise linear infinite;
  filter: blur(0.3px);
}
@keyframes stp-rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
}

.stp-tag {
  text-align: center;
  letter-spacing: 0.3em;
  font-size: 11px;
  color: #e8c170;
  font-weight: 600;
  margin-bottom: 28px;
}
.stp-h1 {
  text-align: center;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.1;
  margin: 24px 0 16px;
}
.stp-h2 {
  text-align: center;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px;
}
.gold {
  color: #e8c170;
  background: linear-gradient(135deg, #f5d57a, #e8c170, #c79a4a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stp-sub {
  text-align: center;
  font-size: 16px;
  opacity: 0.8;
  margin: 0 0 32px;
  line-height: 1.6;
  font-weight: 300;
}

/* Wine glass */
.stp-glass {
  width: 90px;
  margin: 8px auto 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stp-glass-body {
  width: 90px;
  height: 110px;
  border: 2px solid #e8c170;
  border-radius: 0 0 45px 45px / 0 0 60px 60px;
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}
.stp-glass-fill {
  position: absolute;
  inset: auto 0 0 0;
  background: linear-gradient(180deg, #c9486b, #7a1d34);
  animation: stp-fill 2.4s ease-out forwards;
  height: 0;
}
@keyframes stp-fill {
  to { height: 78%; }
}
.stp-glass-stem {
  width: 2px;
  height: 50px;
  background: #e8c170;
}
.stp-glass-base {
  width: 70px;
  height: 3px;
  background: #e8c170;
  border-radius: 2px;
}

/* Buttons */
.stp-btn-primary {
  display: block;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5d57a, #e8c170, #c79a4a);
  color: #1a1116;
  border: none;
  font-family: inherit;
  font-weight: 800;
  font-size: 18px;
  padding: 18px 36px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.glow {
  animation: stp-glow 2.2s ease-in-out infinite;
}
@keyframes stp-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(232,193,112,0.4), 0 0 0 0 rgba(232,193,112,0.5); }
  50% { box-shadow: 0 0 40px rgba(232,193,112,0.7), 0 0 0 12px rgba(232,193,112,0); }
}
.stp-btn-secondary {
  display: block;
  margin: 14px auto 0;
  background: transparent;
  color: #f7efe6;
  border: 1px solid rgba(247,239,230,0.3);
  font-family: inherit;
  font-weight: 400;
  font-size: 15px;
  padding: 14px 28px;
  border-radius: 999px;
  cursor: pointer;
}

/* Screen 2 */
.stp-tease {
  text-align: center;
  color: #e8c170;
  opacity: 0.85;
  font-size: 15px;
  margin: -8px 0 24px;
  min-height: 22px;
  font-weight: 600;
}
.stp-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}
.stp-btn-fake {
  background: rgba(247,239,230,0.06);
  border: 1px solid rgba(247,239,230,0.2);
  color: #f7efe6;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  padding: 16px 22px;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.3,1.4,0.5,1), opacity 0.35s ease;
  width: 100%;
  max-width: 320px;
}
.stp-btn-correct {
  background: linear-gradient(135deg, #f5d57a, #e8c170, #c79a4a);
  color: #1a1116;
  border: none;
  font-family: inherit;
  font-weight: 800;
  font-size: 17px;
  padding: 18px 28px;
  border-radius: 16px;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  margin-top: 8px;
}

/* Screen 3 */
.stp-gift {
  text-align: center;
  font-size: 56px;
  margin: 12px 0 18px;
  animation: stp-bounce 2s ease-in-out infinite;
}
@keyframes stp-bounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}
.stp-countdown {
  text-align: center;
  color: #e8c170;
  font-weight: 800;
  font-size: 18px;
  padding: 12px 24px;
  border: 1px solid rgba(232,193,112,0.4);
  border-radius: 999px;
  display: block;
  margin: 8px auto 28px;
}
.stp-details {
  background: rgba(247,239,230,0.04);
  border: 1px solid rgba(247,239,230,0.1);
  border-radius: 20px;
  padding: 24px 20px;
  margin-bottom: 24px;
}
.stp-detail { text-align: center; padding: 8px 0; }
.stp-label {
  letter-spacing: 0.25em;
  font-size: 11px;
  color: #e8c170;
  font-weight: 600;
  margin-bottom: 8px;
}
.stp-value-big { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.stp-value-small { font-size: 14px; opacity: 0.7; font-weight: 300; }
.stp-divider {
  height: 1px;
  background: rgba(247,239,230,0.12);
  margin: 8px 0;
}

.stp-rsvp-ok {
  text-align: center;
  background: linear-gradient(135deg, rgba(232,193,112,0.15), rgba(232,193,112,0.05));
  border: 1px solid rgba(232,193,112,0.4);
  color: #f7efe6;
  padding: 18px;
  border-radius: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.stp-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.stp-confetti span {
  position: absolute;
  top: -20px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: stp-fall linear infinite;
}
@keyframes stp-fall {
  0% { transform: translateY(-20px) rotate(0); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0.7; }
}
`;
