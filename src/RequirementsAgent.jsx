import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Trash2, Loader, ChevronRight, CheckCircle, Pencil, X, Check, RefreshCw, AlertTriangle, Calendar } from "lucide-react";
import { saveAs } from "file-saver";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, HeadingLevel, LevelFormat
} from "docx";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(link);

const style = document.createElement("style");
style.textContent = `
  .rq-root{font-family:'Lora',Georgia,serif;background:#f7f5f2;min-height:100vh;color:#1a1714}
  .rq-root *{box-sizing:border-box}
  .rq-header{background:#1a1714;padding:28px 40px;display:flex;justify-content:space-between;align-items:center}
  .rq-logo{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#c9b99a;margin-bottom:4px}
  .rq-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#f7f5f2;margin:0}
  .rq-session{font-family:'JetBrains Mono',monospace;font-size:10px;color:#5a5048;margin-top:4px}
  .rq-export-btn{display:flex;align-items:center;gap:8px;background:#c9b99a;color:#1a1714;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;transition:background .15s;white-space:nowrap}
  .rq-export-btn:hover{background:#e2d5be}
  .rq-export-btn:disabled{opacity:.4;cursor:not-allowed}
  .rq-stepper{display:flex;border-bottom:1px solid #e3ddd6;background:#fff;padding:0 32px;overflow-x:auto}
  .rq-step{display:flex;align-items:center;gap:8px;padding:16px 20px 16px 0;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b0a899;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
  .rq-step.active{color:#1a1714;border-bottom-color:#c9b99a}
  .rq-step.done{color:#5a8a6a}
  .rq-step-num{width:20px;height:20px;border-radius:50%;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
  .rq-body{max-width:820px;margin:0 auto;padding:40px 24px}
  .rq-section-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#b0a899;margin-bottom:10px}
  .rq-textarea{width:100%;border:1.5px solid #e3ddd6;border-radius:6px;padding:14px 16px;font-family:'Lora',serif;font-size:15px;color:#1a1714;background:#faf9f7;resize:vertical;min-height:80px;outline:none;transition:border-color .15s;line-height:1.65}
  .rq-textarea:focus{border-color:#c9b99a;background:#fff}
  .rq-input{width:100%;border:1.5px solid #e3ddd6;border-radius:6px;padding:10px 14px;font-family:'Lora',serif;font-size:14px;color:#1a1714;background:#faf9f7;outline:none;transition:border-color .15s}
  .rq-input:focus{border-color:#c9b99a;background:#fff}
  .rq-btn-primary{display:inline-flex;align-items:center;gap:8px;background:#1a1714;color:#f7f5f2;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:12px 22px;border:none;border-radius:4px;cursor:pointer;transition:background .15s}
  .rq-btn-primary:hover{background:#2e2925}
  .rq-btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .rq-btn-ghost{display:inline-flex;align-items:center;gap:6px;background:transparent;color:#6b5f52;font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px;border:1.5px solid #e3ddd6;border-radius:4px;cursor:pointer;transition:all .15s}
  .rq-btn-ghost:hover{border-color:#c9b99a;color:#1a1714}
  .rq-btn-ghost:disabled{opacity:.4;cursor:not-allowed}
  .rq-btn-icon{display:inline-flex;align-items:center;justify-content:center;background:transparent;padding:6px 8px;border:1.5px solid #e3ddd6;border-radius:4px;cursor:pointer;transition:all .15s;color:#8a7e72}
  .rq-btn-icon:hover{border-color:#c9b99a;color:#1a1714}
  .rq-btn-del{color:#b85050;border-color:#e8c8c8}
  .rq-btn-del:hover{background:#fff0f0;border-color:#d09090;color:#8a2020}
  .rq-req-card{background:#fff;border:1.5px solid #e3ddd6;border-radius:8px;padding:18px 20px;margin-bottom:10px;transition:border-color .15s}
  .rq-req-card:hover{border-color:#d0c4b4}
  .rq-req-id{font-family:'JetBrains Mono',monospace;font-size:10px;color:#c9b99a;font-weight:500;margin-bottom:4px}
  .rq-req-text{font-size:14px;line-height:1.55;color:#1a1714}
  .rq-q-card{border:1.5px solid #e3ddd6;border-radius:6px;padding:16px 18px;margin-bottom:8px;background:#faf9f7}
  .rq-badge{display:inline-block;font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 7px;border-radius:3px;margin-bottom:7px}
  .rq-badge-open{background:#edf0ff;color:#3a4fa0}
  .rq-badge-mc{background:#edf7f2;color:#2a6a4a}
  .rq-q-text{font-size:14px;color:#2e2925;line-height:1.5}
  .rq-mc-opts{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
  .rq-mc-opt{font-family:'JetBrains Mono',monospace;font-size:11px;background:#fff;border:1px solid #d4ccc4;border-radius:3px;padding:3px 10px;color:#5a5048}
  .rq-scope-box{font-size:14px;line-height:1.75;color:#2e2925;background:#faf9f7;border:1px solid #e3ddd6;border-radius:8px;padding:18px 22px;white-space:pre-wrap;font-family:'Lora',serif}
  .rq-progress{display:flex;align-items:center;gap:10px;margin-bottom:36px}
  .rq-pb-wrap{flex:1;height:3px;background:#e3ddd6;border-radius:2px;overflow:hidden}
  .rq-pb{height:100%;background:#c9b99a;border-radius:2px;transition:width .5s ease}
  .rq-pb-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:#b0a899;white-space:nowrap}
  .rq-hint{font-size:13px;color:#8a7e72;line-height:1.6;font-style:italic;margin:0 0 16px}
  .rq-error{background:#fff4f0;border:1px solid #f0c4b4;border-radius:6px;padding:10px 14px;font-size:13px;color:#b85030;margin-top:10px;font-family:'Lora',serif}
  .rq-divider{border:none;border-top:1px solid #e3ddd6;margin:28px 0}
  .rq-row{display:flex;gap:8px;align-items:center}
  .rq-actions{display:flex;gap:8px;margin-top:16px;align-items:center;flex-wrap:wrap}
  .rq-req-group-label{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:#2e2925;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e3ddd6}
  .rq-loading-center{padding:36px 0;text-align:center;color:#8a7e72;font-style:italic;font-family:'Lora',serif}
  .rq-5w-card{background:#fff;border:1.5px solid #e3ddd6;border-radius:8px;padding:20px 22px;margin-bottom:14px}
  .rq-5w-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#c9b99a;margin-bottom:4px}
  .rq-5w-question{font-size:14px;font-weight:500;color:#1a1714;margin-bottom:10px;font-family:'Syne',sans-serif}
  .rq-flag-card{background:#fffbf0;border:1.5px solid #e8d8a0;border-radius:8px;padding:16px 20px;margin-bottom:14px}
  .rq-flag-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#a07820;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .rq-flag-text{font-size:14px;color:#4a3800;line-height:1.6;margin-bottom:12px}
  .rq-scope-approved{background:#f0faf4;border:1.5px solid #a0d8b4;border-radius:8px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2a7a4a}
  .tl-date-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .tl-date-card{background:#fff;border:1.5px solid #e3ddd6;border-radius:8px;padding:16px 18px}
  .tl-date-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#c9b99a;margin-bottom:6px}
  .tl-activity-row{display:grid;grid-template-columns:1fr 80px 80px 32px;gap:8px;align-items:center;margin-bottom:8px}
  .tl-activity-row input{border:1.5px solid #e3ddd6;border-radius:6px;padding:8px 10px;font-family:'Lora',serif;font-size:13px;color:#1a1714;background:#faf9f7;outline:none;width:100%}
  .tl-activity-row input:focus{border-color:#c9b99a}
  .tl-col-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#b0a899;margin-bottom:4px}
  .gantt-wrap{overflow-x:auto;margin-top:24px}
  .gantt-container{min-width:600px;background:#fff;border:1px solid #e3ddd6;border-radius:8px;padding:20px}
  .gantt-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#b0a899;margin-bottom:16px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite;display:inline-block}
  .rq-fade{animation:fadeUp .3s ease both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;
document.head.appendChild(style);

// ─── Utils ────────────────────────────────────────────────────────────────────
const genId = () => "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase();

async function callClaude(system, user) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.find(b => b.type === "text")?.text ?? "";
}

async function callJSON(system, user) {
  const t = await callClaude(system, user);
  return JSON.parse(t.replace(/```json\s*/g, "").replace(/```/g, "").trim());
}

// ─── Working day helpers ──────────────────────────────────────────────────────
function addWorkingDays(date, days) {
  let d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function workingDaysBetween(start, end) {
  let count = 0;
  let d = new Date(start);
  while (d <= end) {
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return Math.max(count, 1);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildSchedule(activities, rfpDate, goLiveDate) {
  if (!rfpDate || !goLiveDate || activities.length === 0) return [];
  const start = new Date(rfpDate + "T00:00:00");
  let cursor = new Date(start);
  return activities.map(a => {
    const dur = Math.max(parseInt(a.duration) || 1, 1);
    const actStart = new Date(cursor);
    const actEnd = addWorkingDays(cursor, dur - 1);
    cursor = addWorkingDays(actEnd, 1);
    return { ...a, startDate: actStart, endDate: actEnd, businessDays: dur };
  });
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
const P_SCOPE_GENERATE = `You are a professional business analyst writing a project scope for a software procurement document.

The user has answered the following 5 intake questions. Use their answers to write a formal scope narrative.

SCOPE QUALITY RULES — the scope MUST:
1. Be specific — include concrete details about deadlines, milestones, or deliverables where the user provided them
2. Include exclusions — explicitly state what is out of scope to prevent scope creep
3. Use plain language — no jargon, no acronyms without explanation
4. Be 3-6 sentences of clear prose — no bullets, no headers

Return ONLY the scope text. No preamble, no explanation.`;

const P_SCOPE_EVALUATE = `You are a senior business analyst reviewing a project scope narrative for quality.

Evaluate the scope against these criteria:
1. SPECIFICITY — Are deadlines, milestones, or deliverables clearly defined?
2. EXCLUSIONS — Does it explicitly state what is out of scope?
3. PLAIN LANGUAGE — Is it free of unexplained jargon?
4. COMPLETENESS — Does it address who, what, where, when, and why?

Respond ONLY with valid JSON, no markdown:
{
  "passed": true or false,
  "flags": [
    {
      "criterion": "EXCLUSIONS",
      "issue": "The scope does not define what is explicitly out of scope.",
      "prompt": "What should be explicitly excluded from this project? For example, are there integrations, features, or departments that should not be included?"
    }
  ]
}

If all criteria pass, return { "passed": true, "flags": [] }.
Only flag genuine gaps — do not invent issues if the scope is solid.`;

const P_SCOPE_REFINE = `You are a professional business analyst refining a project scope narrative.

The user has provided additional information to address a gap in the scope. Incorporate their response naturally into the existing scope. Keep the same tone and style. Return ONLY the updated scope text — no preamble, no explanation.`;

const P_REQS = `You are a business analyst writing a software procurement RFP.
Given a project scope, generate 5-8 binary functional requirements. Each must be phrased so a vendor can answer Yes or No.
Start each with "The solution shall..." or "The system must...".
Return ONLY a valid JSON array, no markdown, no preamble:
[{"id":"R-F1","text":"The solution shall..."},...]`;

const P_QS = `You are a business analyst writing a vendor discovery questionnaire.
Given a functional requirement, generate exactly 2-3 follow-up questions to help evaluate vendor compliance.
Use multiple choice when the answer space is predictable and finite; otherwise open-ended.
Return ONLY valid JSON, no markdown:
[{"type":"open_ended","text":"..."},{"type":"multiple_choice","text":"...","options":["A","B","C"]}]`;

const P_TIMELINE = `You are a procurement project manager. Given an RFP issue date, a go-live date, and a list of procurement activities, assign a realistic duration in working days to each activity. 

Distribute the total working days proportionally based on the typical effort each activity requires. Activities like "Vendor Q&A" and "NDA" are short; activities like "Evaluate" and "Negotiate Agreement" are longer.

Return ONLY a valid JSON array in the same order as the input, no markdown:
[{"id":"...","name":"...","duration":10},...]`;

// ─── Default activities ───────────────────────────────────────────────────────
const DEFAULT_ACTIVITIES = [
  { id: "a1", name: "NDA" },
  { id: "a2", name: "Scope & Requirements" },
  { id: "a3", name: "Market Analysis" },
  { id: "a4", name: "Vendor Identification" },
  { id: "a5", name: "Internal Alignment (Budget)" },
  { id: "a6", name: "Issue RFP" },
  { id: "a7", name: "Vendors Submit Clarifying Questions" },
  { id: "a8", name: "Respond to Vendor Questions" },
  { id: "a9", name: "Submit RFP Response" },
  { id: "a10", name: "Evaluate Responses" },
  { id: "a11", name: "Recommendation to Leadership" },
  { id: "a12", name: "Demo / POC & Evaluate" },
  { id: "a13", name: "Final Recommendation" },
  { id: "a14", name: "Negotiate Agreement" },
  { id: "a15", name: "Implementation" },
];

// ─── Gantt Chart Component ────────────────────────────────────────────────────
function GanttChart({ schedule, rfpDate, goLiveDate }) {
  if (!schedule.length) return null;
  const start = new Date(rfpDate + "T00:00:00");
  const end = new Date(goLiveDate + "T00:00:00");
  const totalDays = workingDaysBetween(start, end);

  const COLORS = [
    "#2e5984", "#3d7ab5", "#5a9fd4", "#7ab8e8",
    "#c9b99a", "#a89070", "#8a7258", "#6b5642",
    "#4a8a6a", "#3a6a52", "#2a4a3a", "#c87840",
    "#a05828",
  ];

  const BAR_H = 28;
  const LABEL_W = 180;
  const CHART_H = schedule.length * (BAR_H + 8) + 60;

  const xPct = (date) => {
    const days = workingDaysBetween(start, date);
    return Math.min((days / totalDays) * 100, 100);
  };

  const widthPct = (s, e) => {
    const days = workingDaysBetween(s, e) + 1;
    return Math.min((days / totalDays) * 100, 100);
  };

  return (
    <div className="gantt-wrap">
      <div className="gantt-container">
        <div className="gantt-title">Procurement Timeline — {fmtDate(start)} to {fmtDate(end)}</div>
        <div style={{ display: "flex" }}>
          {/* Labels */}
          <div style={{ width: LABEL_W, flexShrink: 0 }}>
            <div style={{ height: 28, marginBottom: 8 }} />
            {schedule.map((a, i) => (
              <div key={a.id} style={{ height: BAR_H, marginBottom: 8, display: "flex", alignItems: "center" }}>
                <span style={{ fontFamily: "'Lora', serif", fontSize: 12, color: "#2e2925", lineHeight: 1.3, paddingRight: 10 }}>{a.name}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Month markers */}
            <div style={{ height: 28, position: "relative", marginBottom: 8, borderBottom: "1px solid #e3ddd6" }}>
              {(() => {
                const markers = [];
                let d = new Date(start.getFullYear(), start.getMonth(), 1);
                while (d <= end) {
                  const pct = xPct(d);
                  if (pct >= 0 && pct <= 100) {
                    markers.push(
                      <div key={d.toISOString()} style={{ position: "absolute", left: `${pct}%`, top: 0, height: "100%", borderLeft: "1px solid #e3ddd6" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#b0a899", paddingLeft: 3, whiteSpace: "nowrap" }}>
                          {d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                        </span>
                      </div>
                    );
                  }
                  d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                }
                return markers;
              })()}
            </div>

            {/* Bars */}
            {schedule.map((a, i) => (
              <div key={a.id} style={{ height: BAR_H, marginBottom: 8, position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: `${xPct(a.startDate)}%`,
                  width: `${widthPct(a.startDate, a.endDate)}%`,
                  height: "100%",
                  background: COLORS[i % COLORS.length],
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  minWidth: 4,
                }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.businessDays}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DocX Export ──────────────────────────────────────────────────────────────
async function buildDocx({ sessionId, projectTitle, formalScope, requirements, questions, timeline }) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: "D4CCC4" };
  const borders = { top: b, bottom: b, left: b, right: b };
  const cm = { top: 90, bottom: 90, left: 130, right: 130 };

  const hCell = (text, w) => new TableCell({
    borders, margins: cm,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "2E2925", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "F7F5F2", font: "Arial", size: 20 })] })]
  });
  const bCell = (text, w, shade) => new TableCell({
    borders, margins: cm,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade ? "FAF9F7" : "FFFFFF", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text: String(text), font: "Arial", size: 20 })] })]
  });

  // Numbering config — unique alpha ref per MC question
  const numberingConfig = [
    { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 360 } } } }] },
  ];
  let alphaRefCounter = 0;

  const qChildren = [];
  for (const req of requirements) {
    const qs = questions[req.id] || [];
    if (!qs.length) continue;
    qChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `${req.id}: ${req.text}`, font: "Arial" })] }));
    qs.forEach(q => {
      qChildren.push(new Paragraph({ numbering: { reference: "nums", level: 0 }, children: [new TextRun({ text: q.text, font: "Arial", size: 22 })] }));
      if (q.type === "multiple_choice" && q.options?.length) {
        const alphaRef = `alpha-${alphaRefCounter++}`;
        numberingConfig.push({ reference: alphaRef, levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: "%1)", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
        q.options.forEach(opt => qChildren.push(new Paragraph({ numbering: { reference: alphaRef, level: 0 }, children: [new TextRun({ text: opt, font: "Arial", size: 20, color: "5A5048" })] })));
      } else {
        qChildren.push(new Paragraph({ children: [new TextRun({ text: "[Open response]", font: "Arial", size: 20, italics: true, color: "9A8E82" })] }));
      }
      qChildren.push(new Paragraph({ children: [new TextRun("")] }));
    });
  }

  // Timeline table
  const tlChildren = [];
  if (timeline.schedule && timeline.schedule.length > 0) {
    tlChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Procurement Timeline", font: "Arial" })] }));
    tlChildren.push(new Paragraph({ children: [new TextRun({ text: `RFP Issue Date: ${fmtDate(timeline.rfpDate + "T00:00:00")}   |   Go-Live Date: ${fmtDate(timeline.goLiveDate + "T00:00:00")}`, font: "Arial", size: 20, color: "6A6058" })] }));
    tlChildren.push(new Paragraph({ children: [new TextRun("")] }));
    tlChildren.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3200, 2080, 2080, 2000],
      rows: [
        new TableRow({ children: [hCell("Activity", 3200), hCell("Start", 2080), hCell("End", 2080), hCell("Duration (Business Days)", 2000)] }),
        ...timeline.schedule.map((a, i) => new TableRow({ children: [
          bCell(a.name, 3200, i % 2),
          bCell(fmtDate(a.startDate), 2080, i % 2),
          bCell(fmtDate(a.endDate), 2080, i % 2),
          bCell(a.businessDays, 2000, i % 2),
        ]}))
      ]
    }));
  }

  const doc = new Document({
    numbering: { config: numberingConfig },
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial", color: "1A1714" }, paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: "3A3028" }, paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ children: [new TextRun({ text: projectTitle || "Requirements Document", bold: true, size: 56, font: "Arial", color: "1A1714" })] }),
        new Paragraph({ children: [new TextRun({ text: `Session ID: ${sessionId}`, font: "Arial", size: 18, color: "9A8E82" })] }),
        new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, font: "Arial", size: 18, color: "9A8E82" })] }),
        new Paragraph({ children: [new TextRun("")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. Project Scope", font: "Arial" })] }),
        new Paragraph({ children: [new TextRun({ text: formalScope, font: "Arial", size: 24 })], spacing: { line: 360 } }),
        new Paragraph({ children: [new TextRun("")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Functional Requirements", font: "Arial" })] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1440, 7920],
          rows: [
            new TableRow({ children: [hCell("ID", 1440), hCell("Requirement", 7920)] }),
            ...requirements.map((r, i) => new TableRow({ children: [
              new TableCell({ borders, margins: cm, width: { size: 1440, type: WidthType.DXA }, shading: { fill: i % 2 ? "FAF9F7" : "FFFFFF", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: r.id, font: "Arial Narrow", size: 20 })] })] }),
              bCell(r.text, 7920, i % 2)
            ]}))
          ]
        }),
        new Paragraph({ children: [new TextRun("")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. Questions", font: "Arial" })] }),
        ...qChildren,
        new Paragraph({ children: [new TextRun("")] }),
        ...tlChildren,
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Requirements_${sessionId}.docx`);
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ["Scope", "Requirements", "Questions", "Review"];
const FIVE_WS = [
  { key: "who", label: "Who", question: "Who will use this system, and who owns this initiative?", placeholder: "e.g. Shop floor technicians will use it daily. The VP of Operations is the project sponsor." },
  { key: "what", label: "What", question: "What problem are you solving, or what capability are you adding?", placeholder: "e.g. We lose track of tools constantly. We need real-time visibility into tool location and condition." },
  { key: "where", label: "Where", question: "Where does this fit in your current environment? Any existing systems it must work with?", placeholder: "e.g. Must integrate with our SAP ERP. Deployed across 3 facilities in the US." },
  { key: "when", label: "When", question: "When is this needed, and what is driving the timeline?", placeholder: "e.g. Must be live by Q3. We have an audit in September that requires this to be in place." },
  { key: "why", label: "Why", question: "Why is the current state inadequate?", placeholder: "e.g. Everything is tracked on spreadsheets. We lose 10-15 tools per month and have no way to audit." },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RequirementsAgent() {
  const [sessionId] = useState(genId);
  const [step, setStep] = useState(0);
  const [projectTitle, setProjectTitle] = useState("");

  // Scope
  const [answers, setAnswers] = useState({ who: "", what: "", where: "", when: "", why: "" });
  const [formalScope, setFormalScope] = useState("");
  const [scopeFlags, setScopeFlags] = useState([]);
  const [flagResponses, setFlagResponses] = useState({});
  const [scopeApproved, setScopeApproved] = useState(false);
  const [scopeBusy, setScopeBusy] = useState(false);
  const [scopeErr, setScopeErr] = useState("");
  const [editingScope, setEditingScope] = useState(false);

  // Requirements
  const [requirements, setRequirements] = useState([]);
  const [reqsBusy, setReqsBusy] = useState(false);
  const [reqsErr, setReqsErr] = useState("");
  const [newReq, setNewReq] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  // Questions
  const [questions, setQuestions] = useState({});
  const [qBusy, setQBusy] = useState(false);
  const [qErr, setQErr] = useState("");

  // Timeline
  const [rfpDate, setRfpDate] = useState("");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES.map(a => ({ ...a, duration: "" })));
  const [tlBusy, setTlBusy] = useState(false);
  const [tlGenerated, setTlGenerated] = useState(false);
  const [tlErr, setTlErr] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [schedule, setSchedule] = useState([]);

  // Export
  const [exportBusy, setExportBusy] = useState(false);
  const [exportErr, setExportErr] = useState("");

  const allAnswered = FIVE_WS.every(w => answers[w.key].trim().length > 0);
  const isSkipped = (val) => val.trim().toLowerCase() === "skip";
  const allFlagResponsesFilled = scopeFlags.every(f => {
    const val = flagResponses[f.criterion] || "";
    return val.trim().length > 0;
  });

  // Rebuild schedule whenever activities or dates change
  useEffect(() => {
    if (tlGenerated && rfpDate && goLiveDate) {
      setSchedule(buildSchedule(activities, rfpDate, goLiveDate));
    }
  }, [activities, rfpDate, goLiveDate, tlGenerated]);

  // ── Scope ──
  const doGenerateScope = async () => {
    setScopeBusy(true); setScopeErr(""); setScopeFlags([]); setScopeApproved(false);
    try {
      const userMsg = FIVE_WS.map(w => `${w.label.toUpperCase()}: ${answers[w.key]}`).join("\n");
      const scope = await callClaude(P_SCOPE_GENERATE, userMsg);
      setFormalScope(scope.trim());
      await doEvaluateScope(scope.trim());
    } catch { setScopeErr("Could not generate scope. Please try again."); }
    finally { setScopeBusy(false); }
  };

  const doEvaluateScope = async (scopeText) => {
    try {
      const result = await callJSON(P_SCOPE_EVALUATE, `Scope to evaluate:\n\n${scopeText}`);
      if (result.passed && result.flags.length === 0) { setScopeFlags([]); setScopeApproved(true); }
      else { setScopeFlags(result.flags || []); setScopeApproved(false); }
    } catch { setScopeFlags([]); setScopeApproved(true); }
  };

  const doRefineScope = async () => {
    setScopeBusy(true); setScopeErr("");
    try {
      const activeFlags = scopeFlags.filter(f => !isSkipped(flagResponses[f.criterion] || ""));
      if (activeFlags.length === 0) {
        // All flags skipped — just approve as-is
        setScopeFlags([]); setScopeApproved(true); setScopeBusy(false); return;
      }
      const additions = activeFlags.map(f => `GAP: ${f.issue}\nUSER RESPONSE: ${flagResponses[f.criterion] || ""}`).join("\n\n");
      const refined = await callClaude(P_SCOPE_REFINE, `EXISTING SCOPE:\n${formalScope}\n\nADDITIONAL INFORMATION:\n${additions}`);
      setFormalScope(refined.trim()); setFlagResponses({});
      await doEvaluateScope(refined.trim());
    } catch { setScopeErr("Could not refine scope. Please try again."); }
    finally { setScopeBusy(false); }
  };

  // ── Requirements ──
  const doGenerateReqs = async () => {
    setReqsBusy(true); setReqsErr("");
    try {
      const arr = await callJSON(P_REQS, `Scope: ${formalScope}`);
      setRequirements(arr);
    } catch { setReqsErr("Could not generate requirements. Please try again."); }
    finally { setReqsBusy(false); }
  };

  const addReq = () => {
    if (!newReq.trim()) return;
    setRequirements(p => [...p, { id: `R-C${p.length + 1}`, text: newReq.trim() }]);
    setNewReq("");
  };
  const deleteReq = (id) => setRequirements(p => p.filter(r => r.id !== id));
  const saveEdit = (id) => { setRequirements(p => p.map(r => r.id === id ? { ...r, text: editText } : r)); setEditId(null); };

  // ── Questions ──
  const doGenerateQuestions = async () => {
    setQBusy(true); setQErr("");
    try {
      const out = {};
      for (const req of requirements) out[req.id] = await callJSON(P_QS, `Requirement: ${req.text}`);
      setQuestions(out); setStep(3);
    } catch { setQErr("Could not generate questions. Please try again."); }
    finally { setQBusy(false); }
  };

  // ── Timeline ──
  const doGenerateTimeline = async () => {
    if (!rfpDate || !goLiveDate) { setTlErr("Please enter both dates before generating."); return; }
    setTlBusy(true); setTlErr("");
    try {
      const actList = activities.map(a => ({ id: a.id, name: a.name }));
      const userMsg = `RFP Issue Date: ${rfpDate}\nGo-Live Date: ${goLiveDate}\nActivities: ${JSON.stringify(actList)}`;
      const result = await callJSON(P_TIMELINE, userMsg);
      const updated = activities.map(a => {
        const match = result.find(r => r.id === a.id || r.name === a.name);
        return { ...a, duration: match ? String(match.duration) : "5" };
      });
      setActivities(updated);
      setTlGenerated(true);
      setSchedule(buildSchedule(updated, rfpDate, goLiveDate));
    } catch { setTlErr("Could not generate timeline. Please try again."); }
    finally { setTlBusy(false); }
  };

  const updateActivity = (id, field, val) => {
    setActivities(p => p.map(a => a.id === id ? { ...a, [field]: val } : a));
  };
  const deleteActivity = (id) => setActivities(p => p.filter(a => a.id !== id));
  const addActivity = () => {
    if (!newActivity.trim()) return;
    const newId = "a" + Date.now();
    setActivities(p => [...p, { id: newId, name: newActivity.trim(), duration: "5" }]);
    setNewActivity("");
  };

  // ── Export ──
  const doExport = async () => {
    setExportBusy(true); setExportErr("");
    try {
      await buildDocx({ sessionId, projectTitle, formalScope, requirements, questions, timeline: { rfpDate, goLiveDate, schedule } });
    } catch (e) { setExportErr("Export failed. Please try again."); }
    finally { setExportBusy(false); }
  };

  const pct = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="rq-root">
      <div className="rq-header">
        <div>
          <div className="rq-logo">Requirements Discovery</div>
          <div className="rq-title">Procurement Agent</div>
          <div className="rq-session">{sessionId}</div>
        </div>
        <button className="rq-export-btn" onClick={doExport} disabled={step < 3 || exportBusy}>
          {exportBusy ? <Loader size={15} className="spin" /> : <FileText size={15} />} Export .docx
        </button>
      </div>

      <div className="rq-stepper">
        {STEPS.map((label, i) => (
          <div key={label} className={`rq-step ${i === step ? "active" : i < step ? "done" : ""}`}>
            <div className="rq-step-num">{i < step ? <CheckCircle size={12} /> : i + 1}</div>
            {label}
          </div>
        ))}
      </div>

      <div className="rq-body">
        <div className="rq-progress">
          <div className="rq-pb-wrap"><div className="rq-pb" style={{ width: `${pct}%` }} /></div>
          <div className="rq-pb-label">Step {step + 1} / {STEPS.length}</div>
        </div>

        {/* ── Step 0: Scope ── */}
        {step === 0 && (
          <div className="rq-fade">
            <div className="rq-section-label" style={{ marginBottom: 6 }}>Project Title</div>
            <input className="rq-input" style={{ marginBottom: 24 }} placeholder="e.g. Enterprise Tool Tracking System" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
            <div className="rq-section-label" style={{ marginBottom: 16 }}>Project Intake</div>
            {FIVE_WS.map(w => (
              <div className="rq-5w-card" key={w.key}>
                <div className="rq-5w-label">{w.label}</div>
                <div className="rq-5w-question">{w.question}</div>
                <textarea
                  key={`textarea-${w.key}`}
                  name={w.key}
                  className="rq-textarea"
                  placeholder={w.placeholder}
                  value={answers[w.key]}
                  onChange={e => {
                    const key = w.key;
                    const val = e.target.value;
                    setAnswers(prev => ({ ...prev, [key]: val }));
                  }}
                  rows={2}
                />
              </div>
            ))}
            {scopeErr && <div className="rq-error">{scopeErr}</div>}
            {formalScope && (
              <div style={{ marginTop: 24 }} className="rq-fade">
                <div className="rq-section-label">Generated Scope</div>
                {editingScope ? (
                  <>
                    <textarea className="rq-textarea" value={formalScope} onChange={e => setFormalScope(e.target.value)} rows={5} style={{ marginBottom: 10 }} />
                    <div className="rq-actions">
                      <button className="rq-btn-ghost" onClick={async () => { setEditingScope(false); await doEvaluateScope(formalScope); }}><Check size={12} /> Done editing</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rq-scope-box">{formalScope}</div>
                    <div className="rq-actions">
                      <button className="rq-btn-ghost" onClick={() => setEditingScope(true)}><Pencil size={12} /> Edit</button>
                      <button className="rq-btn-ghost" onClick={doGenerateScope} disabled={scopeBusy}><RefreshCw size={12} /> Regenerate</button>
                    </div>
                  </>
                )}
                {scopeFlags.length > 0 && !editingScope && (
                  <div style={{ marginTop: 20 }} className="rq-fade">
                    <div className="rq-section-label" style={{ marginBottom: 12 }}>Scope Review — Action Required</div>
                    {scopeFlags.map(flag => {
                      const val = flagResponses[flag.criterion] || "";
                      const skipped = isSkipped(val);
                      return (
                        <div className="rq-flag-card" key={flag.criterion} style={{ opacity: skipped ? 0.5 : 1, transition: "opacity 0.2s" }}>
                          <div className="rq-flag-title">
                            <AlertTriangle size={13} /> {flag.criterion}
                            {skipped && <span style={{ marginLeft: 8, fontFamily: "'Syne', sans-serif", fontSize: 9, color: "#a07820", background: "#f0e0a0", padding: "2px 7px", borderRadius: 3 }}>SKIPPED</span>}
                          </div>
                          {!skipped && <div className="rq-flag-text">{flag.prompt}</div>}
                          <textarea
                            className="rq-textarea"
                            placeholder={`Your response… (type "skip" to dismiss this flag)`}
                            value={val}
                            onChange={e => setFlagResponses(p => ({ ...p, [flag.criterion]: e.target.value }))}
                            rows={skipped ? 1 : 2}
                            style={{ opacity: skipped ? 0.6 : 1 }}
                          />
                        </div>
                      );
                    })}
                    <div className="rq-actions">
                      <button className="rq-btn-primary" onClick={doRefineScope} disabled={scopeBusy || !allFlagResponsesFilled}>
                        {scopeBusy ? <><Loader size={13} className="spin" /> Refining…</> : <>Refine Scope <ChevronRight size={13} /></>}
                      </button>
                    </div>
                  </div>
                )}
                {scopeApproved && !editingScope && (
                  <div style={{ marginTop: 16 }} className="rq-fade">
                    <div className="rq-scope-approved"><CheckCircle size={16} /> Scope approved — all criteria met</div>
                    <div className="rq-actions">
                      <button className="rq-btn-primary" onClick={() => { setStep(1); doGenerateReqs(); }}>Generate Requirements <ChevronRight size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!formalScope && (
              <div className="rq-actions" style={{ marginTop: 8 }}>
                <button className="rq-btn-primary" onClick={doGenerateScope} disabled={!allAnswered || scopeBusy}>
                  {scopeBusy ? <><Loader size={14} className="spin" /> Generating scope…</> : <>Generate Scope <ChevronRight size={14} /></>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Requirements ── */}
        {step === 1 && (
          <div className="rq-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div className="rq-section-label">Functional Requirements</div>
                <p className="rq-hint" style={{ marginBottom: 0 }}>Edit, delete, or add your own below.</p>
              </div>
              <button className="rq-btn-ghost" onClick={doGenerateReqs} disabled={reqsBusy}>
                {reqsBusy ? <Loader size={12} className="spin" /> : <RefreshCw size={12} />} Regenerate
              </button>
            </div>
            {reqsBusy && <div className="rq-loading-center"><Loader size={20} className="spin" style={{ marginBottom: 8 }} /><br />Generating requirements…</div>}
            {reqsErr && <div className="rq-error">{reqsErr}</div>}
            {!reqsBusy && requirements.map(req => (
              <div className="rq-req-card rq-fade" key={req.id}>
                <div className="rq-req-id">{req.id}</div>
                {editId === req.id ? (
                  <>
                    <input className="rq-input" value={editText} onChange={e => setEditText(e.target.value)} style={{ marginBottom: 10 }} />
                    <div className="rq-row">
                      <button className="rq-btn-ghost" onClick={() => saveEdit(req.id)}><Check size={12} /> Save</button>
                      <button className="rq-btn-ghost" onClick={() => setEditId(null)}><X size={12} /> Cancel</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div className="rq-req-text">{req.text}</div>
                    <div className="rq-row" style={{ flexShrink: 0 }}>
                      <button className="rq-btn-icon" onClick={() => { setEditId(req.id); setEditText(req.text); }}><Pencil size={13} /></button>
                      <button className="rq-btn-icon rq-btn-del" onClick={() => deleteReq(req.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!reqsBusy && (
              <div className="rq-row" style={{ marginTop: 8 }}>
                <input className="rq-input" placeholder="Add your own requirement…" value={newReq} onChange={e => setNewReq(e.target.value)} onKeyDown={e => e.key === "Enter" && addReq()} />
                <button className="rq-btn-ghost" onClick={addReq} disabled={!newReq.trim()} style={{ whiteSpace: "nowrap" }}><Plus size={13} /> Add</button>
              </div>
            )}
            {!reqsBusy && requirements.length > 0 && (
              <div className="rq-actions" style={{ marginTop: 24 }}>
                <button className="rq-btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button className="rq-btn-primary" onClick={() => setStep(2)}>Continue to Questions <ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Questions ── */}
        {step === 2 && (
          <div className="rq-fade">
            <div className="rq-section-label">Discovery Questions</div>
            <p className="rq-hint">The agent will generate 2–3 follow-up questions per requirement — a mix of open-ended and multiple choice.</p>
            {qErr && <div className="rq-error">{qErr}</div>}
            {qBusy && <div className="rq-loading-center"><Loader size={20} className="spin" style={{ marginBottom: 8 }} /><br />Generating questions for {requirements.length} requirement{requirements.length !== 1 ? "s" : ""}…</div>}
            {!qBusy && (
              <div className="rq-actions">
                <button className="rq-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="rq-btn-primary" onClick={doGenerateQuestions}>Generate Questions <ChevronRight size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="rq-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div className="rq-section-label">Review &amp; Export</div>
                <p className="rq-hint" style={{ marginBottom: 0 }}>Review everything, build your timeline, then export.</p>
              </div>
              <button className="rq-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            </div>

            {/* 1. Scope */}
            <div className="rq-section-label">1. Scope</div>
            <div className="rq-scope-box" style={{ marginBottom: 28 }}>{formalScope}</div>
            <hr className="rq-divider" />

            {/* 2. Requirements */}
            <div className="rq-section-label">2. Functional Requirements ({requirements.length})</div>
            <div style={{ marginBottom: 28 }}>
              {requirements.map(req => (
                <div className="rq-req-card" key={req.id} style={{ cursor: "default" }}>
                  <div className="rq-req-id">{req.id}</div>
                  <div className="rq-req-text">{req.text}</div>
                </div>
              ))}
            </div>
            <hr className="rq-divider" />

            {/* 3. Questions */}
            <div className="rq-section-label">3. Questions</div>
            <div style={{ marginBottom: 28 }}>
              {requirements.map(req => {
                const qs = questions[req.id] || [];
                return (
                  <div key={req.id} style={{ marginBottom: 24 }}>
                    <div className="rq-req-group-label">{req.id} — {req.text}</div>
                    {qs.map((q, i) => (
                      <div className="rq-q-card" key={i}>
                        <div className={`rq-badge ${q.type === "open_ended" ? "rq-badge-open" : "rq-badge-mc"}`}>{q.type === "open_ended" ? "Open Ended" : "Multiple Choice"}</div>
                        <div className="rq-q-text">{q.text}</div>
                        {q.type === "multiple_choice" && q.options?.length && (
                          <div className="rq-mc-opts">
                            {q.options.map((o, j) => <span key={j} className="rq-mc-opt">{String.fromCharCode(65 + j)}. {o}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <hr className="rq-divider" />

            {/* 4. Timeline */}
            <div className="rq-section-label">4. Procurement Timeline</div>
            <p className="rq-hint">Enter your RFP issue date and go-live date. The agent will distribute working days across all activities. You can adjust, add, or remove activities before exporting.</p>

            <div className="tl-date-row">
              <div className="tl-date-card">
                <div className="tl-date-label">RFP Issue Date</div>
                <input type="date" className="rq-input" value={rfpDate} onChange={e => setRfpDate(e.target.value)} />
              </div>
              <div className="tl-date-card">
                <div className="tl-date-label">Go-Live Date</div>
                <input type="date" className="rq-input" value={goLiveDate} onChange={e => setGoLiveDate(e.target.value)} />
              </div>
            </div>

            {rfpDate && goLiveDate && (() => {
              const start = new Date(rfpDate + "T00:00:00");
              const end = new Date(goLiveDate + "T00:00:00");
              const calDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
              const totalBizDays = activities.reduce((s, a) => s + (parseInt(a.duration) || 0), 0);
              const diff = totalBizDays - workingDaysBetween(start, end);
              const overUnder = diff === 0 ? null : diff > 0 ? `${diff} business days over` : `${Math.abs(diff)} business days under`;
              return (
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                  <div style={{ background: "#fff", border: "1.5px solid #e3ddd6", borderRadius: 8, padding: "10px 18px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <div className="tl-col-label">Total Span</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1714" }}>{calDays} calendar days</div>
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #e3ddd6", borderRadius: 8, padding: "10px 18px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <div className="tl-col-label">Allocated Business Days</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1714" }}>{totalBizDays} days</div>
                  </div>
                  {overUnder && (
                    <div style={{ background: diff > 0 ? "#fff4f0" : "#f0faf4", border: `1.5px solid ${diff > 0 ? "#f0c4b4" : "#a0d8b4"}`, borderRadius: 8, padding: "10px 18px", display: "flex", flexDirection: "column", gap: 2 }}>
                      <div className="tl-col-label">vs. Available</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: diff > 0 ? "#b85030" : "#2a7a4a" }}>{overUnder}</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Activity list headers */}
            {activities.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 32px", gap: 8, marginBottom: 6 }}>
                <div className="tl-col-label">Activity</div>
                <div className="tl-col-label">Duration (business days)</div>
                <div className="tl-col-label">Start</div>
                <div />
              </div>
            )}

            {activities.map((a, i) => {
              const sched = schedule.find(s => s.id === a.id);
              return (
                <div className="tl-activity-row" key={a.id}>
                  <input value={a.name} onChange={e => updateActivity(a.id, "name", e.target.value)} />
                  <input type="number" min="1" value={a.duration} onChange={e => updateActivity(a.id, "duration", e.target.value)} placeholder="days" style={{ textAlign: "center" }} />
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a7e72" }}>
                    {sched ? fmtDate(sched.startDate) : "—"}
                  </div>
                  <button className="rq-btn-icon rq-btn-del" onClick={() => deleteActivity(a.id)} style={{ padding: "5px 7px" }}><Trash2 size={12} /></button>
                </div>
              );
            })}

            <div className="rq-row" style={{ marginTop: 10 }}>
              <input className="rq-input" placeholder="Add activity…" value={newActivity} onChange={e => setNewActivity(e.target.value)} onKeyDown={e => e.key === "Enter" && addActivity()} />
              <button className="rq-btn-ghost" onClick={addActivity} disabled={!newActivity.trim()} style={{ whiteSpace: "nowrap" }}><Plus size={13} /> Add</button>
            </div>

            {tlErr && <div className="rq-error">{tlErr}</div>}

            <div className="rq-actions" style={{ marginTop: 16 }}>
              <button className="rq-btn-primary" onClick={doGenerateTimeline} disabled={tlBusy || !rfpDate || !goLiveDate}>
                {tlBusy ? <><Loader size={13} className="spin" /> Generating…</> : <><Calendar size={13} /> {tlGenerated ? "Regenerate Timeline" : "Generate Timeline"}</>}
              </button>
            </div>

            {/* Gantt */}
            {tlGenerated && schedule.length > 0 && (
              <GanttChart schedule={schedule} rfpDate={rfpDate} goLiveDate={goLiveDate} />
            )}

            <hr className="rq-divider" />
            {exportErr && <div className="rq-error">{exportErr}</div>}
            <button className="rq-btn-primary" onClick={doExport} disabled={exportBusy} style={{ padding: "14px 28px", fontSize: 12 }}>
              {exportBusy ? <><Loader size={15} className="spin" /> Exporting…</> : <><FileText size={15} /> Export to .docx</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
