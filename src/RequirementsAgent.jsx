import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Trash2, Loader, ChevronRight, CheckCircle, Pencil, X, Check, RefreshCw, AlertTriangle, Calendar, Save, Clock, ArrowLeft, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType, HeadingLevel, LevelFormat } from "docx";
import { saveSession, loadSessions, loadSession, deleteSession } from "./supabase";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const _link = document.createElement("link");
_link.rel = "stylesheet";
_link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(_link);

const _style = document.createElement("style");
_style.textContent = `
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
  .rq-body{max-width:900px;margin:0 auto;padding:40px 24px}
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
  .rq-btn-icon:disabled{opacity:.35;cursor:not-allowed}
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
  .sv-bar{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e3ddd6;border-radius:8px;padding:10px 16px;margin-bottom:20px;gap:12px}
  .sv-status{font-family:'JetBrains Mono',monospace;font-size:11px;color:#8a7e72;display:flex;align-items:center;gap:6px}
  .sv-status.saved{color:#2a7a4a}
  .sv-status.saving{color:#a07820}
  .sv-status.error{color:#b85030}
  .sessions-panel{background:#fff;border:1px solid #e3ddd6;border-radius:8px;overflow:hidden;margin-bottom:24px}
  .sessions-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e3ddd6;background:#faf9f7}
  .sessions-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#b0a899}
  .session-row{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #f0ede8;cursor:pointer;transition:background .15s;gap:12px}
  .session-row:last-child{border-bottom:none}
  .session-row:hover{background:#faf9f7}
  .session-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:600;color:#1a1714;margin-bottom:2px}
  .session-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:#b0a899}
  .session-status{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:3px}
  .session-status.draft{background:#fdf0ea;color:#a05020}
  .session-status.complete{background:#edf7f2;color:#2a6a4a}
  .tl-group-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f0ede8;border-radius:6px;margin-bottom:6px;cursor:pointer;user-select:none;border:1px solid #e3ddd6}
  .tl-group-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#6b5f52}
  .tl-group-pre{color:#2e5984}
  .tl-group-rfp{color:#3a6a52}
  .tl-group-post{color:#a05828}
  .tl-act-row{display:grid;gap:6px;align-items:center;margin-bottom:6px;padding:8px 10px;background:#fff;border:1px solid #e3ddd6;border-radius:6px;transition:border-color .15s}
  .tl-act-row:hover{border-color:#d0c4b4}
  .tl-act-row.is-child{margin-left:24px;background:#faf9f7;border-left:3px solid #c9b99a}
  .tl-act-row.is-parent{border-left:3px solid #1a1714}
  .tl-act-row.dragging{opacity:.5}
  .tl-act-row.drag-over{border-color:#c9b99a;border-style:dashed}
  .tl-cell-input{border:1px solid #e3ddd6;border-radius:4px;padding:5px 7px;font-family:'Lora',serif;font-size:12px;color:#1a1714;background:#faf9f7;outline:none;width:100%}
  .tl-cell-input:focus{border-color:#c9b99a}
  .tl-col-hdr{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b0a899}
  .gantt-wrap{overflow-x:auto;margin-top:24px}
  .gantt-container{min-width:640px;background:#fff;border:1px solid #e3ddd6;border-radius:8px;padding:20px}
  .gantt-title{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#b0a899;margin-bottom:16px}
  .gantt-group-bar{height:6px;border-radius:3px;margin-bottom:4px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin .8s linear infinite;display:inline-block}
  .rq-fade{animation:fadeUp .3s ease both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;
document.head.appendChild(_style);

// ─── Utils ────────────────────────────────────────────────────────────────────
const genId = () => "SES-" + Math.random().toString(36).substring(2, 9).toUpperCase();
const uid = () => "a" + Date.now() + Math.random().toString(36).substring(2, 5);

async function callClaude(system, user) {
  const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system, user }) });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.find(b => b.type === "text")?.text ?? "";
}

async function callJSON(system, user) {
  const t = await callClaude(system, user);
  return JSON.parse(t.replace(/```json\s*/g, "").replace(/```/g, "").trim());
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function addCalDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function calDaysBetween(startStr, endStr) {
  const s = new Date(startStr + "T00:00:00");
  const e = new Date(endStr + "T00:00:00");
  return Math.round((e - s) / 86400000);
}

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function today() { return new Date().toISOString().split("T")[0]; }

// ─── Default activities ───────────────────────────────────────────────────────
// offsetDays: n+ days after startDate for endDate default
// parentId: sub-activity of another
// group: Pre-RFP | RFP | Post-RFP
function makeDefaultActivities(startDate) {
  const t = startDate || today();

  // Helper: date string from a reference + offset
  const d = (base, offset) => addCalDays(base, offset);

  const scopeStart = t;
  const scopeEnd = d(t, 7);           // +1 week
  const marketEnd = d(t, 14);         // +2 weeks from scope start
  const vendorEnd = d(marketEnd, 7);  // +1 week from market end
  const finScopeEnd = d(vendorEnd, 7);
  const evalTeamEnd = d(vendorEnd, 14);
  const issueStart = d(evalTeamEnd, 3);
  const issueEnd = d(issueStart, 14);
  const vendorQEnd = d(issueStart, 4 + 2); // n+4 days start, +2 days duration
  const respondEnd = d(vendorQEnd, 3);
  const submitStart = d(respondEnd, 2);
  const submitEnd = d(submitStart, 7);
  const evalStart = d(respondEnd, 3);
  const evalRespEnd = d(evalStart, 8);
  const shortlistEnd = d(d(evalRespEnd, 1), 5);
  const techStart = d(d(shortlistEnd, 0), 28);
  const techEnd = d(techStart, 28);
  const evalTechEnd = d(techStart, 5);
  const alignStart = d(evalTechEnd, 10);
  const alignEnd = d(alignStart, 5);
  const finalStart = d(alignEnd, 10);
  const finalEnd = d(finalStart, 5);
  const negoStart = d(finalEnd, 1);
  const negoEnd = d(negoStart, 45);
  const implStart = d(negoEnd, 10);
  const implEnd = d(implStart, 45);

  return [
    // ── Pre-RFP ──
    { id: "a1",  group: "Pre-RFP",  parentId: null, name: "Draft Scope & Requirements",           startDate: scopeStart,  endDate: scopeEnd,     offsetDays: 7  },
    { id: "a2",  group: "Pre-RFP",  parentId: null, name: "Execute NDA",                           startDate: scopeStart,  endDate: issueStart,   offsetDays: calDaysBetween(scopeStart, issueStart) },
    { id: "a3",  group: "Pre-RFP",  parentId: null, name: "Market Analysis",                       startDate: scopeStart,  endDate: marketEnd,    offsetDays: 14 },
    { id: "a4",  group: "Pre-RFP",  parentId: null, name: "Vendor Identification",                 startDate: scopeStart,  endDate: vendorEnd,    offsetDays: calDaysBetween(scopeStart, vendorEnd) },
    { id: "a5",  group: "Pre-RFP",  parentId: null, name: "Draft RFP",                             startDate: vendorEnd,   endDate: issueStart,   offsetDays: calDaysBetween(vendorEnd, issueStart) },
    { id: "a5a", group: "Pre-RFP",  parentId: "a5", name: "Finalize Scope & Requirements",         startDate: vendorEnd,   endDate: finScopeEnd,  offsetDays: 7  },
    { id: "a5b", group: "Pre-RFP",  parentId: "a5", name: "Establish Evaluation Team, Criteria & Weighting", startDate: vendorEnd, endDate: evalTeamEnd, offsetDays: 14 },
    // ── RFP ──
    { id: "a6",  group: "RFP",      parentId: null, name: "Issue RFP",                             startDate: issueStart,  endDate: issueEnd,     offsetDays: 14 },
    { id: "a6a", group: "RFP",      parentId: "a6", name: "Vendors Submit Clarifying Questions",   startDate: d(issueStart, 4), endDate: vendorQEnd, offsetDays: 2 },
    { id: "a6b", group: "RFP",      parentId: "a6", name: "Respond to Vendor Questions",           startDate: vendorQEnd,  endDate: respondEnd,   offsetDays: 3  },
    { id: "a6c", group: "RFP",      parentId: "a6", name: "Submit RFP Response",                   startDate: submitStart, endDate: submitEnd,    offsetDays: 7  },
    { id: "a7",  group: "RFP",      parentId: null, name: "Evaluate RFP",                          startDate: evalStart,   endDate: evalTechEnd,  offsetDays: calDaysBetween(evalStart, evalTechEnd) },
    { id: "a7a", group: "RFP",      parentId: "a7", name: "Evaluate Responses",                    startDate: evalStart,   endDate: evalRespEnd,  offsetDays: 8  },
    { id: "a7b", group: "RFP",      parentId: "a7", name: "Shortlist (Recommendation to Leadership)", startDate: d(evalRespEnd, 1), endDate: shortlistEnd, offsetDays: 5 },
    { id: "a7c", group: "RFP",      parentId: "a7", name: "Technical Evaluation (Demo / POC)",     startDate: techStart,   endDate: techEnd,      offsetDays: 28 },
    { id: "a7d", group: "RFP",      parentId: "a7", name: "Evaluate Technical Evaluation",         startDate: techStart,   endDate: evalTechEnd,  offsetDays: 5  },
    // ── Post-RFP ──
    { id: "a8",  group: "Post-RFP", parentId: null, name: "Internal Alignment & Confirm Budget",   startDate: alignStart,  endDate: alignEnd,     offsetDays: 5  },
    { id: "a9",  group: "Post-RFP", parentId: null, name: "Final Recommendation",                  startDate: finalStart,  endDate: finalEnd,     offsetDays: 5  },
    { id: "a10", group: "Post-RFP", parentId: null, name: "Negotiate Contract",                    startDate: negoStart,   endDate: negoEnd,      offsetDays: 45 },
    { id: "a11", group: "Post-RFP", parentId: null, name: "Implementation",                        startDate: implStart,   endDate: implEnd,      offsetDays: 45 },
  ];
}

const GROUPS = ["Pre-RFP", "RFP", "Post-RFP"];
const GROUP_COLORS = { "Pre-RFP": "#2e5984", "RFP": "#3a6a52", "Post-RFP": "#a05828" };

// ─── Gantt ────────────────────────────────────────────────────────────────────
function GanttChart({ activities }) {
  const allDates = activities.flatMap(a => [a.startDate, a.endDate]).filter(Boolean).sort();
  if (!allDates.length) return null;
  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];
  const totalDays = Math.max(calDaysBetween(minDate, maxDate), 1);
  const BAR_H = 22;

  const xPct = (dateStr) => {
    if (!dateStr) return 0;
    return Math.min(Math.max((calDaysBetween(minDate, dateStr) / totalDays) * 100, 0), 100);
  };
  const wPct = (s, e) => {
    if (!s || !e) return 1;
    return Math.max(Math.min((calDaysBetween(s, e) / totalDays) * 100, 100), 0.5);
  };

  // Month markers
  const markers = [];
  const mStart = new Date(minDate + "T00:00:00");
  const mEnd = new Date(maxDate + "T00:00:00");
  let md = new Date(mStart.getFullYear(), mStart.getMonth(), 1);
  while (md <= mEnd) {
    const ds = md.toISOString().split("T")[0];
    markers.push({ ds, pct: xPct(ds), label: md.toLocaleDateString("en-US", { month: "short", year: "2-digit" }) });
    md = new Date(md.getFullYear(), md.getMonth() + 1, 1);
  }

  return (
    <div className="gantt-wrap">
      <div className="gantt-container">
        <div className="gantt-title">Procurement Timeline — {fmtDate(minDate)} to {fmtDate(maxDate)}</div>
        <div style={{ display: "flex" }}>
          {/* Labels */}
          <div style={{ width: 210, flexShrink: 0 }}>
            <div style={{ height: 28, marginBottom: 4 }} />
            {GROUPS.map(g => {
              const gas = activities.filter(a => a.group === g);
              if (!gas.length) return null;
              return (
                <div key={g}>
                  <div style={{ height: 20, marginBottom: 4, display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: GROUP_COLORS[g] }}>{g}</span>
                  </div>
                  {gas.map(a => (
                    <div key={a.id} style={{ height: BAR_H, marginBottom: 4, display: "flex", alignItems: "center", paddingLeft: a.parentId ? 14 : 0 }}>
                      <span style={{ fontFamily: "'Lora',serif", fontSize: a.parentId ? 10 : 11, color: a.parentId ? "#6b5f52" : "#2e2925", lineHeight: 1.2, paddingRight: 8, fontStyle: a.parentId ? "italic" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.parentId ? "↳ " : ""}{a.name}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Chart area */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            {/* Month markers */}
            <div style={{ height: 28, position: "relative", marginBottom: 4, borderBottom: "1px solid #e3ddd6" }}>
              {markers.map(m => (
                <div key={m.ds} style={{ position: "absolute", left: `${m.pct}%`, top: 0, height: "100%", borderLeft: "1px solid #e3ddd6" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "#b0a899", paddingLeft: 3, whiteSpace: "nowrap" }}>{m.label}</span>
                </div>
              ))}
            </div>

            {GROUPS.map(g => {
              const gas = activities.filter(a => a.group === g);
              if (!gas.length) return null;
              const color = GROUP_COLORS[g];
              return (
                <div key={g}>
                  {/* Group span bar */}
                  <div style={{ height: 20, marginBottom: 4, position: "relative" }}>
                    {(() => {
                      const gDates = gas.flatMap(a => [a.startDate, a.endDate]).filter(Boolean).sort();
                      if (gDates.length < 2) return null;
                      return (
                        <div style={{ position: "absolute", left: `${xPct(gDates[0])}%`, width: `${wPct(gDates[0], gDates[gDates.length - 1])}%`, height: 6, top: 7, background: color, opacity: 0.25, borderRadius: 3 }} />
                      );
                    })()}
                  </div>
                  {gas.map(a => {
                    const isChild = !!a.parentId;
                    return (
                      <div key={a.id} style={{ height: BAR_H, marginBottom: 4, position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          left: `${xPct(a.startDate)}%`,
                          width: `${wPct(a.startDate, a.endDate)}%`,
                          height: isChild ? "70%" : "100%",
                          top: isChild ? "15%" : 0,
                          background: isChild ? "transparent" : color,
                          border: isChild ? `1.5px solid ${color}` : "none",
                          opacity: isChild ? 0.8 : 1,
                          borderRadius: 3,
                          display: "flex", alignItems: "center", paddingLeft: 5, minWidth: 3,
                        }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: isChild ? color : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {a.endDate && a.startDate ? calDaysBetween(a.startDate, a.endDate) + "d" : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {GROUPS.map(g => (
            <div key={g} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 8, background: GROUP_COLORS[g], borderRadius: 2 }} />
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, color: "#8a7e72" }}>{g}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 14, height: 8, border: "1.5px solid #2e5984", borderRadius: 2 }} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, color: "#8a7e72" }}>Sub-activity</span>
          </div>
        </div>
      </div>
    </div>
  );
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

const STEPS = ["Scope", "Requirements", "Questions", "Review"];
const FIVE_WS = [
  { key: "who", label: "Who", question: "Who will use this system, and who owns this initiative?", placeholder: "e.g. Shop floor technicians will use it daily. The VP of Operations is the project sponsor." },
  { key: "what", label: "What", question: "What problem are you solving, or what capability are you adding?", placeholder: "e.g. We lose track of tools constantly. We need real-time visibility into tool location and condition." },
  { key: "where", label: "Where", question: "Where does this fit in your current environment? Any existing systems it must work with?", placeholder: "e.g. Must integrate with our SAP ERP. Deployed across 3 facilities in the US." },
  { key: "when", label: "When", question: "When is this needed, and what is driving the timeline?", placeholder: "e.g. Must be live by Q3. We have an audit in September that requires this to be in place." },
  { key: "why", label: "Why", question: "Why is the current state inadequate?", placeholder: "e.g. Everything is tracked on spreadsheets. We lose 10-15 tools per month and have no way to audit." },
];

// ─── DocX Export ──────────────────────────────────────────────────────────────
async function buildDocx({ sessionId, projectTitle, formalScope, requirements, questions, activities }) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: "D4CCC4" };
  const borders = { top: b, bottom: b, left: b, right: b };
  const cm = { top: 90, bottom: 90, left: 130, right: 130 };

  const hCell = (text, w) => new TableCell({ borders, margins: cm, width: { size: w, type: WidthType.DXA }, shading: { fill: "2E2925", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "F7F5F2", font: "Arial", size: 20 })] })] });
  const bCell = (text, w, shade) => new TableCell({ borders, margins: cm, width: { size: w, type: WidthType.DXA }, shading: { fill: shade ? "FAF9F7" : "FFFFFF", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: String(text), font: "Arial", size: 20 })] })] });

  const numberingConfig = [{ reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 360 } } } }] }];
  let alphaCounter = 0;

  const qChildren = [];
  for (const req of requirements) {
    const qs = questions[req.id] || [];
    if (!qs.length) continue;
    qChildren.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: `${req.id}: ${req.text}`, font: "Arial" })] }));
    qs.forEach(q => {
      qChildren.push(new Paragraph({ numbering: { reference: "nums", level: 0 }, children: [new TextRun({ text: q.text, font: "Arial", size: 22 })] }));
      if (q.type === "multiple_choice" && q.options?.length) {
        const ref = `alpha-${alphaCounter++}`;
        numberingConfig.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.LOWER_LETTER, text: "%1)", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
        q.options.forEach(opt => qChildren.push(new Paragraph({ numbering: { reference: ref, level: 0 }, children: [new TextRun({ text: opt, font: "Arial", size: 20, color: "5A5048" })] })));
      } else {
        qChildren.push(new Paragraph({ children: [new TextRun({ text: "[Open response]", font: "Arial", size: 20, italics: true, color: "9A8E82" })] }));
      }
      qChildren.push(new Paragraph({ children: [new TextRun("")] }));
    });
  }

  const tlRows = [new TableRow({ children: [hCell("Activity", 3400), hCell("Start", 1900), hCell("End", 1900), hCell("Duration (days)", 2160)] })];
  let rowIdx = 0;
  for (const g of GROUPS) {
    const gas = activities.filter(a => a.group === g);
    if (!gas.length) continue;
    tlRows.push(new TableRow({ children: [new TableCell({ borders, margins: cm, columnSpan: 4, width: { size: 9360, type: WidthType.DXA }, shading: { fill: "F0EDE8", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: g, bold: true, font: "Arial", size: 20, color: "6B5F52" })] })] })] }));
    gas.forEach(a => {
      const shade = rowIdx++ % 2 === 1;
      const dur = a.startDate && a.endDate ? String(calDaysBetween(a.startDate, a.endDate)) : "—";
      tlRows.push(new TableRow({ children: [bCell((a.parentId ? "    ↳ " : "") + a.name, 3400, shade), bCell(fmtDate(a.startDate), 1900, shade), bCell(fmtDate(a.endDate), 1900, shade), bCell(dur, 2160, shade)] }));
    });
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
          width: { size: 9360, type: WidthType.DXA }, columnWidths: [1440, 7920],
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
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Procurement Timeline", font: "Arial" })] }),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3400, 1900, 1900, 2160], rows: tlRows }),
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Requirements_${sessionId}.docx`);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RequirementsAgent() {
  const [sessionId] = useState(genId);
  const [step, setStep] = useState(0);
  const [projectTitle, setProjectTitle] = useState("");
  const [view, setView] = useState("sessions");
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [lastSaved, setLastSaved] = useState(null);
  const isDirty = useRef(false);

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
  const [activities, setActivities] = useState(() => makeDefaultActivities());
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [newActName, setNewActName] = useState("");
  const [newActGroup, setNewActGroup] = useState("Pre-RFP");

  // Export
  const [exportBusy, setExportBusy] = useState(false);
  const [exportErr, setExportErr] = useState("");

  const allAnswered = FIVE_WS.every(w => answers[w.key].trim().length > 0);
  const isSkipped = (val) => val.trim().toLowerCase() === "skip";
  const allFlagResponsesFilled = scopeFlags.every(f => (flagResponses[f.criterion] || "").trim().length > 0);

  useEffect(() => { isDirty.current = true; }, [projectTitle, answers, formalScope, requirements, questions, activities]);

  useEffect(() => {
    setSessionsLoading(true);
    loadSessions().then(rows => { setSessionsList(rows); setSessionsLoading(false); });
  }, []);

  useEffect(() => {
    const t = setInterval(() => { if (isDirty.current && formalScope) doSave("draft"); }, 30000);
    return () => clearInterval(t);
  });

  const getSessionData = () => ({ step, projectTitle, answers, formalScope, scopeApproved, requirements, questions, activities });

  const doSave = async (status = "draft") => {
    setSaveStatus("saving");
    const ok = await saveSession({ id: sessionId, projectTitle: projectTitle || "Untitled", status, data: getSessionData() });
    if (ok) { setSaveStatus("saved"); setLastSaved(new Date()); isDirty.current = false; loadSessions().then(setSessionsList); setTimeout(() => setSaveStatus("idle"), 2500); }
    else { setSaveStatus("error"); setTimeout(() => setSaveStatus("idle"), 3000); }
  };

  const doLoadSession = async (id) => {
    const row = await loadSession(id);
    if (!row?.data) return;
    const d = row.data;
    if (d.step !== undefined) setStep(d.step);
    if (d.projectTitle) setProjectTitle(d.projectTitle);
    if (d.answers) setAnswers(d.answers);
    if (d.formalScope) setFormalScope(d.formalScope);
    if (d.scopeApproved) setScopeApproved(d.scopeApproved);
    if (d.requirements) setRequirements(d.requirements);
    if (d.questions) setQuestions(d.questions);
    if (d.activities) setActivities(d.activities);
    setView("agent");
    setLastSaved(new Date(row.updated_at));
  };

  const doDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this session?")) return;
    await deleteSession(id);
    setSessionsList(p => p.filter(s => s.id !== id));
  };

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
      if (activeFlags.length === 0) { setScopeFlags([]); setScopeApproved(true); setScopeBusy(false); return; }
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
    try { const arr = await callJSON(P_REQS, `Scope: ${formalScope}`); setRequirements(arr); }
    catch { setReqsErr("Could not generate requirements. Please try again."); }
    finally { setReqsBusy(false); }
  };

  const addReq = () => { if (!newReq.trim()) return; setRequirements(p => [...p, { id: `R-C${p.length + 1}`, text: newReq.trim() }]); setNewReq(""); };
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
  const updateActivity = (id, field, val) => {
    setActivities(prev => {
      const updated = prev.map(a => {
        if (a.id !== id) return a;
        const next = { ...a, [field]: val };
        // If startDate changes, shift endDate by same offset
        if (field === "startDate" && a.startDate && a.endDate) {
          const oldDur = calDaysBetween(a.startDate, a.endDate);
          next.endDate = addCalDays(val, oldDur);
        }
        // If offsetDays changes, recompute endDate
        if (field === "offsetDays" && a.startDate) {
          next.endDate = addCalDays(a.startDate, parseInt(val) || 0);
        }
        return next;
      });
      return updated;
    });
  };

  const deleteActivity = (id) => setActivities(p => p.filter(a => a.id !== id && a.parentId !== id));

  const addActivity = () => {
    if (!newActName.trim()) return;
    setActivities(p => [...p, { id: uid(), group: newActGroup, parentId: null, name: newActName.trim(), startDate: today(), endDate: addCalDays(today(), 7), offsetDays: 7 }]);
    setNewActName("");
  };

  const toggleGroup = (g) => setCollapsedGroups(p => ({ ...p, [g]: !p[g] }));

  // Drag handlers
  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const onDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setActivities(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(a => a.id === dragId);
      const toIdx = arr.findIndex(a => a.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      // Move group to match target
      const targetGroup = arr[toIdx].group;
      const [moved] = arr.splice(fromIdx, 1);
      moved.group = targetGroup;
      if (moved.parentId) moved.parentId = null; // reset parent on drag
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };

  // ── Export ──
  const doExport = async () => {
    setExportBusy(true); setExportErr("");
    try {
      await buildDocx({ sessionId, projectTitle, formalScope, requirements, questions, activities });
      await doSave("complete");
    } catch { setExportErr("Export failed. Please try again."); }
    finally { setExportBusy(false); }
  };

  const pct = (step / (STEPS.length - 1)) * 100;

  // ── Sessions view ──
  if (view === "sessions") {
    return (
      <div className="rq-root">
        <div className="rq-header">
          <div><div className="rq-logo">Requirements Discovery</div><div className="rq-title">Procurement Agent</div></div>
          <button className="rq-export-btn" onClick={() => setView("agent")}><Plus size={15} /> New Session</button>
        </div>
        <div className="rq-body">
          <div className="rq-section-label" style={{ marginBottom: 16 }}>Sessions</div>
          {sessionsLoading && <div className="rq-loading-center"><Loader size={18} className="spin" /></div>}
          {!sessionsLoading && sessionsList.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#8a7e72", fontStyle: "italic", fontSize: 14 }}>No sessions yet. Start a new one.</div>
          )}
          {!sessionsLoading && sessionsList.length > 0 && (
            <div className="sessions-panel">
              <div className="sessions-header"><div className="sessions-title">{sessionsList.length} session{sessionsList.length !== 1 ? "s" : ""}</div></div>
              {sessionsList.map(s => (
                <div className="session-row" key={s.id} onClick={() => doLoadSession(s.id)}>
                  <div style={{ minWidth: 0 }}>
                    <div className="session-name">{s.project_title || "Untitled"}</div>
                    <div className="session-meta">{s.id} · {new Date(s.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span className={`session-status ${s.status}`}>{s.status}</span>
                    <button className="rq-btn-icon rq-btn-del" onClick={(e) => doDeleteSession(s.id, e)} style={{ padding: "5px 7px" }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Agent view ──
  return (
    <div className="rq-root">
      <div className="rq-header">
        <div><div className="rq-logo">Requirements Discovery</div><div className="rq-title">Procurement Agent</div><div className="rq-session">{sessionId}</div></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="rq-btn-ghost" style={{ color: "#c9b99a", borderColor: "#3a3530" }} onClick={() => setView("sessions")}><ArrowLeft size={13} /> Sessions</button>
          <button className="rq-export-btn" onClick={doExport} disabled={step < 3 || exportBusy}>{exportBusy ? <Loader size={15} className="spin" /> : <FileText size={15} />} Export .docx</button>
        </div>
      </div>

      <div className="rq-stepper">
        {STEPS.map((label, i) => (
          <div key={label} className={`rq-step ${i === step ? "active" : i < step ? "done" : ""}`}>
            <div className="rq-step-num">{i < step ? <CheckCircle size={12} /> : i + 1}</div>{label}
          </div>
        ))}
      </div>

      <div className="rq-body">
        <div className="sv-bar">
          <div className={`sv-status ${saveStatus === "idle" ? "" : saveStatus}`}>
            {saveStatus === "saving" && <><Loader size={12} className="spin" /> Saving…</>}
            {saveStatus === "saved" && <><CheckCircle size={12} /> Saved</>}
            {saveStatus === "error" && <>Save failed</>}
            {saveStatus === "idle" && lastSaved && <><Clock size={12} /> Last saved {lastSaved.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</>}
            {saveStatus === "idle" && !lastSaved && <><Clock size={12} /> Not yet saved</>}
          </div>
          <button className="rq-btn-ghost" onClick={() => doSave("draft")} disabled={saveStatus === "saving"}><Save size={12} /> Save Draft</button>
        </div>

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
                <textarea key={`ta-${w.key}`} name={w.key} className="rq-textarea" placeholder={w.placeholder} value={answers[w.key]} onChange={e => { const k = w.key, v = e.target.value; setAnswers(p => ({ ...p, [k]: v })); }} rows={2} />
              </div>
            ))}
            {scopeErr && <div className="rq-error">{scopeErr}</div>}
            {formalScope && (
              <div style={{ marginTop: 24 }} className="rq-fade">
                <div className="rq-section-label">Generated Scope</div>
                {editingScope ? (
                  <>
                    <textarea className="rq-textarea" value={formalScope} onChange={e => setFormalScope(e.target.value)} rows={5} style={{ marginBottom: 10 }} />
                    <div className="rq-actions"><button className="rq-btn-ghost" onClick={async () => { setEditingScope(false); await doEvaluateScope(formalScope); }}><Check size={12} /> Done editing</button></div>
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
                        <div className="rq-flag-card" key={flag.criterion} style={{ opacity: skipped ? 0.5 : 1 }}>
                          <div className="rq-flag-title"><AlertTriangle size={13} /> {flag.criterion}{skipped && <span style={{ marginLeft: 8, fontFamily: "'Syne',sans-serif", fontSize: 9, color: "#a07820", background: "#f0e0a0", padding: "2px 7px", borderRadius: 3 }}>SKIPPED</span>}</div>
                          {!skipped && <div className="rq-flag-text">{flag.prompt}</div>}
                          <textarea className="rq-textarea" placeholder={`Your response… (type "skip" to dismiss)`} value={val} onChange={e => setFlagResponses(p => ({ ...p, [flag.criterion]: e.target.value }))} rows={skipped ? 1 : 2} style={{ opacity: skipped ? 0.6 : 1 }} />
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
                    <div className="rq-actions"><button className="rq-btn-primary" onClick={() => { setStep(1); doGenerateReqs(); }}>Generate Requirements <ChevronRight size={14} /></button></div>
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
              <div><div className="rq-section-label">Functional Requirements</div><p className="rq-hint" style={{ marginBottom: 0 }}>Edit, delete, or add your own below.</p></div>
              <button className="rq-btn-ghost" onClick={doGenerateReqs} disabled={reqsBusy}>{reqsBusy ? <Loader size={12} className="spin" /> : <RefreshCw size={12} />} Regenerate</button>
            </div>
            {reqsBusy && <div className="rq-loading-center"><Loader size={20} className="spin" style={{ marginBottom: 8 }} /><br />Generating requirements…</div>}
            {reqsErr && <div className="rq-error">{reqsErr}</div>}
            {!reqsBusy && requirements.map(req => (
              <div className="rq-req-card rq-fade" key={req.id}>
                <div className="rq-req-id">{req.id}</div>
                {editId === req.id ? (
                  <>
                    <input className="rq-input" value={editText} onChange={e => setEditText(e.target.value)} style={{ marginBottom: 10 }} />
                    <div className="rq-row"><button className="rq-btn-ghost" onClick={() => saveEdit(req.id)}><Check size={12} /> Save</button><button className="rq-btn-ghost" onClick={() => setEditId(null)}><X size={12} /> Cancel</button></div>
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
              <div><div className="rq-section-label">Review &amp; Export</div><p className="rq-hint" style={{ marginBottom: 0 }}>Review everything, adjust the timeline, then export.</p></div>
              <button className="rq-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            </div>

            <div className="rq-section-label">1. Scope</div>
            <div className="rq-scope-box" style={{ marginBottom: 28 }}>{formalScope}</div>
            <hr className="rq-divider" />

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
                          <div className="rq-mc-opts">{q.options.map((o, j) => <span key={j} className="rq-mc-opt">{String.fromCharCode(65 + j)}. {o}</span>)}</div>
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
            <p className="rq-hint">Dates cascade automatically — changing a start date shifts the end date by the same offset. Drag activities between groups. Sub-activities are indented under their parent.</p>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 110px 110px 70px 60px 32px", gap: 6, marginBottom: 6, paddingLeft: 10, paddingRight: 4 }}>
              <div /><div className="tl-col-hdr">Activity</div><div className="tl-col-hdr">Start</div><div className="tl-col-hdr">End</div><div className="tl-col-hdr">Offset (days)</div><div className="tl-col-hdr">Duration</div><div />
            </div>

            {GROUPS.map(g => {
              const gas = activities.filter(a => a.group === g);
              const collapsed = collapsedGroups[g];
              const colorClass = g === "Pre-RFP" ? "tl-group-pre" : g === "RFP" ? "tl-group-rfp" : "tl-group-post";
              return (
                <div key={g} style={{ marginBottom: 16 }}>
                  <div className="tl-group-header" onClick={() => toggleGroup(g)}>
                    <div className={`tl-group-label ${colorClass}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: GROUP_COLORS[g] }} />
                      {g} <span style={{ fontWeight: 400, color: "#b0a899", marginLeft: 4 }}>({gas.length})</span>
                    </div>
                    {collapsed ? <ChevronDown size={14} style={{ color: "#b0a899" }} /> : <ChevronUp size={14} style={{ color: "#b0a899" }} />}
                  </div>

                  {!collapsed && gas.map(a => {
                    const dur = a.startDate && a.endDate ? calDaysBetween(a.startDate, a.endDate) : "—";
                    return (
                      <div
                        key={a.id}
                        className={`tl-act-row${a.parentId ? " is-child" : " is-parent"}${dragId === a.id ? " dragging" : ""}${dragOverId === a.id ? " drag-over" : ""}`}
                        style={{ gridTemplateColumns: "20px 1fr 110px 110px 70px 60px 32px", display: "grid", gap: 6 }}
                        draggable
                        onDragStart={() => onDragStart(a.id)}
                        onDragOver={(e) => onDragOver(e, a.id)}
                        onDrop={(e) => onDrop(e, a.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", cursor: "grab", color: "#c9b99a" }}><GripVertical size={14} /></div>
                        <input className="tl-cell-input" value={a.name} onChange={e => updateActivity(a.id, "name", e.target.value)} style={{ fontStyle: a.parentId ? "italic" : "normal" }} />
                        <input type="date" className="tl-cell-input" value={a.startDate || ""} onChange={e => updateActivity(a.id, "startDate", e.target.value)} />
                        <input type="date" className="tl-cell-input" value={a.endDate || ""} onChange={e => updateActivity(a.id, "endDate", e.target.value)} />
                        <input type="number" min="0" className="tl-cell-input" style={{ textAlign: "center" }} value={a.offsetDays ?? ""} onChange={e => updateActivity(a.id, "offsetDays", e.target.value)} />
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#8a7e72", display: "flex", alignItems: "center", justifyContent: "center" }}>{dur}d</div>
                        <button className="rq-btn-icon rq-btn-del" onClick={() => deleteActivity(a.id)} style={{ padding: "4px 6px" }}><Trash2 size={11} /></button>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Add activity */}
            <div className="rq-row" style={{ marginTop: 8, marginBottom: 24 }}>
              <input className="rq-input" placeholder="New activity name…" value={newActName} onChange={e => setNewActName(e.target.value)} onKeyDown={e => e.key === "Enter" && addActivity()} style={{ flex: 1 }} />
              <select style={{ border: "1.5px solid #e3ddd6", borderRadius: 6, padding: "10px 10px", fontFamily: "'Syne',sans-serif", fontSize: 11, color: "#1a1714", background: "#faf9f7", outline: "none" }} value={newActGroup} onChange={e => setNewActGroup(e.target.value)}>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button className="rq-btn-ghost" onClick={addActivity} disabled={!newActName.trim()} style={{ whiteSpace: "nowrap" }}><Plus size={13} /> Add</button>
            </div>

            {/* Gantt */}
            <GanttChart activities={activities} />

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
