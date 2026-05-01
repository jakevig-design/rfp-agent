-- ─────────────────────────────────────────────────────────────────────
-- Pario — Acme demo project seed
-- ─────────────────────────────────────────────────────────────────────
-- Paste into Supabase SQL editor (project: rysvlgllmnvxchxmraql).
-- The three sections are independent — run whichever you need.
--
--   (A) Preview existing sessions for test@acme.com
--   (B) Delete blank/incomplete sessions (keeps the seeded demo if present)
--   (C) Insert/refresh the demo project (idempotent — safe to re-run)
--
-- Typical reset playbook: A → B → C.
-- ─────────────────────────────────────────────────────────────────────


-- ── (A) PREVIEW ──────────────────────────────────────────────────────
-- Lists every saved session under the demo user, with how much scope
-- text each one has. Run before deleting to confirm what's blank.
SELECT
  id,
  project_title,
  status,
  updated_at,
  COALESCE(length(data->>'formalScope'), 0) AS scope_length,
  jsonb_array_length(COALESCE(data->'chatMessages', '[]'::jsonb)) AS chat_msgs
FROM procurement_sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@acme.com' LIMIT 1)
ORDER BY updated_at DESC;


-- ── (B) DELETE BLANKS ────────────────────────────────────────────────
-- Removes sessions where the user never finished intake — no formalScope
-- written. Leaves the seeded demo (and any genuine completed session)
-- untouched.
DELETE FROM procurement_sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@acme.com' LIMIT 1)
  AND COALESCE(data->>'formalScope', '') = '';


-- ── (C) INSERT / REFRESH SEED ────────────────────────────────────────
-- Idempotent — the ON CONFLICT clause refreshes the row if it exists.
INSERT INTO procurement_sessions (id, project_title, status, data, user_id, tenant_id, updated_at)
VALUES (
  'SES-DEMO01',
  'Contract Lifecycle Management Platform',
  'final',
  $$
  {
    "step": 3,
    "projectTitle": "Contract Lifecycle Management Platform",
    "answers": {},
    "formalScope": "Acme's General Counsel sponsors the implementation of a Contract Lifecycle Management (\"CLM\") platform to replace the current email-based contract review process. Today, legal reviews and approves contracts via inbound email threads, with redlines tracked in attached Microsoft Word documents and final versions stored ad-hoc in shared drives. The current state is causing contract throughput to slow to a point where Q3 close deals are routinely delayed pending legal sign-off, and there is no centralized audit trail for SOX Section 404 compliance.\n\nThe CLM platform must support contract intake, version control with redline tracking, role-based approvals, and a complete audit log accessible to internal audit. The platform must integrate bidirectionally with Acme's Salesforce CRM so opportunity contracts populate from CRM and final contract status writes back. Approximately 40 users across legal, sales operations, and procurement will use the system in daily workflow, with a target go-live of August 31 to be operational ahead of Q3 close.\n\nE-signature is explicitly out of scope — Acme will continue using DocuSign and the CLM must integrate with the existing DocuSign account rather than replacing it. The contract template library migration is a phased follow-up, not part of initial go-live.",
    "execSummary": "",
    "scopeBullets": [
      "Manual contract management — legal reviewing via email; Q3 close deals slipping",
      "CLM platform to centralize lifecycle, capture audit trail, accelerate review",
      "Sponsor: General Counsel; ~40 users across legal, sales operations, procurement",
      "Required integrations: Salesforce CRM (bidirectional), DocuSign (e-signature execution)",
      "SOX Section 404 compliance — full audit log of every contract state transition",
      "Go-live by August 31; out of scope: replace DocuSign, contract template library migration"
    ],
    "bulletsApproved": true,
    "chatMessages": [
      {"role": "assistant", "content": "Welcome. What's the business problem you're trying to solve — and how do you think software can help?"},
      {"role": "user", "content": "We need a contract lifecycle management platform. Legal is drowning in email reviews and we can't keep up with deal velocity heading into Q3 close."},
      {"role": "assistant", "content": "Who sponsors this — and roughly how many people will use the system day to day?"},
      {"role": "user", "content": "General Counsel is the sponsor. About 40 users — legal, sales ops, procurement."},
      {"role": "assistant", "content": "Are there integrations or compliance requirements I should factor in — and do you have a target go-live?"},
      {"role": "user", "content": "Salesforce bidirectional sync, DocuSign for e-signatures (we're keeping DocuSign), and SOX Section 404 audit trails are non-negotiable. Live by August 31 to be operational for Q3 close."},
      {"role": "assistant", "content": "Last question — what does success look like, and what's explicitly out of scope?"},
      {"role": "user", "content": "Success: legal processes contracts in the new system instead of email by Q3, and we pass our next SOX audit with the system audit trail. Out of scope: replacing DocuSign, migrating our contract template library — that's a follow-up phase."}
    ],
    "scopeApproved": true,
    "requirements": [
      {"id": "R-F1", "text": "The solution shall integrate bidirectionally with Salesforce CRM for opportunity-to-contract data sync."},
      {"id": "R-F2", "text": "The solution shall maintain a SOX-compliant audit log capturing every contract state transition with timestamp, user, and prior value."},
      {"id": "R-F3", "text": "The solution shall support role-based approval workflows with a minimum of three distinct permission tiers."},
      {"id": "R-F4", "text": "The solution shall integrate with Acme's existing DocuSign account for e-signature execution."},
      {"id": "R-F5", "text": "The solution shall track redline versions with attribution to each reviewer across the contract lifecycle."},
      {"id": "R-F6", "text": "The solution shall expose a contract status API for internal reporting on cycle time, throughput, and pending approvals."}
    ],
    "questions": {
      "scope": [
        {"type": "multiple_choice", "text": "What is the maximum number of approval tiers your standard configuration supports without custom development?", "options": ["3", "5", "7", "Unlimited"]},
        {"type": "open_ended", "text": "What configuration is required to maintain bidirectional Salesforce sync when Salesforce releases a major API version, and is that maintenance included in the base license or a separately priced module?"},
        {"type": "open_ended", "text": "How do you handle redline attribution when contracts pass through external counsel who don't have user accounts in the system?"},
        {"type": "multiple_choice", "text": "Which DocuSign integration method do you support out of the box?", "options": ["Native certified connector", "REST API integration", "Custom webhook", "Not supported"]},
        {"type": "open_ended", "text": "What is your largest customer in legal+sales user count, and what was the implementation timeline for that deployment?"}
      ]
    },
    "activities": null,
    "rfpStart": "2026-05-05",
    "goLive": "2026-08-31",
    "buyingChannel": "sole-source",
    "vendors": [
      {"name": "Ironclad", "category": "Contract Lifecycle Management", "g2Rating": "4.5/5", "g2ReviewCount": "1,200", "description": "Mid-to-enterprise CLM with strong Salesforce integration and a polished workflow builder. Best fit for legal teams that need fast time-to-value without heavy IT lift.", "deployment": "SaaS", "pricingModel": "Per Seat", "estimatedPrice": "$80K–$140K/yr", "priceConfidence": "medium", "implementationComplexity": "Medium", "marketPresence": "Established", "vendorUrl": "https://www.ironcladapp.com", "requirementsMatch": 6, "requirementsTotal": 6, "matchConfidence": "high", "reviewPlatforms": ["g2", "capterra"], "g2Url": null},
      {"name": "DocuSign CLM", "category": "Contract Lifecycle Management", "g2Rating": "4.1/5", "g2ReviewCount": "780", "description": "Native pairing with the existing DocuSign e-signature account; lower integration risk for heavy DocuSign users. Configuration burden heavier than peers for non-standard workflows.", "deployment": "SaaS", "pricingModel": "Per Seat", "estimatedPrice": "$90K–$160K/yr", "priceConfidence": "medium", "implementationComplexity": "Medium", "marketPresence": "Established", "vendorUrl": "https://www.docusign.com/products/clm", "requirementsMatch": 6, "requirementsTotal": 6, "matchConfidence": "high", "reviewPlatforms": ["g2", "capterra"], "g2Url": null},
      {"name": "Conga CLM", "category": "Contract Lifecycle Management", "g2Rating": "4.2/5", "g2ReviewCount": "620", "description": "Deep Salesforce-native CLM, strongest fit if Salesforce is the source of truth for contracts. Reporting and analytics weaker than peers.", "deployment": "SaaS", "pricingModel": "Per Seat", "estimatedPrice": "$70K–$120K/yr", "priceConfidence": "medium", "implementationComplexity": "Medium", "marketPresence": "Established", "vendorUrl": "https://conga.com/products/conga-clm", "requirementsMatch": 5, "requirementsTotal": 6, "matchConfidence": "high", "reviewPlatforms": ["g2", "capterra"], "g2Url": null},
      {"name": "Icertis", "category": "Contract Lifecycle Management", "g2Rating": "4.3/5", "g2ReviewCount": "450", "description": "Enterprise-grade with AI-driven contract analytics; better fit at 200+ users than at 40, but worth pricing for benchmarking.", "deployment": "SaaS", "pricingModel": "Enterprise License", "estimatedPrice": "$150K–$300K/yr", "priceConfidence": "low", "implementationComplexity": "High", "marketPresence": "Established", "vendorUrl": "https://www.icertis.com", "requirementsMatch": 6, "requirementsTotal": 6, "matchConfidence": "medium", "reviewPlatforms": ["g2"], "g2Url": null},
      {"name": "ContractWorks", "category": "Contract Lifecycle Management", "g2Rating": "4.7/5", "g2ReviewCount": "320", "description": "Lighter-weight CLM with fast deployment; best for teams prioritizing simplicity over advanced workflow. Salesforce integration via API rather than native connector.", "deployment": "SaaS", "pricingModel": "Flat Annual", "estimatedPrice": "$30K–$50K/yr", "priceConfidence": "high", "implementationComplexity": "Low", "marketPresence": "Growth", "vendorUrl": "https://www.contractworks.com", "requirementsMatch": 4, "requirementsTotal": 6, "matchConfidence": "high", "reviewPlatforms": ["g2", "capterra"], "g2Url": null}
    ],
    "vendorStatus": {
      "Ironclad": "shortlisted",
      "DocuSign CLM": "shortlisted",
      "Conga CLM": "shortlisted"
    },
    "narrative": "Acme's contract operations are at a breaking point. Legal reviews flow through email threads with redlines tracked in attached Word documents, contract status lives in shared inboxes rather than a system of record, and Q3 close deals are routinely slipping past quarter-end pending legal sign-off. The General Counsel sponsors this initiative because the current state has become a quarterly revenue risk and a SOX Section 404 audit risk simultaneously.\n\nThe target state is a Contract Lifecycle Management platform that centralizes intake, redline tracking, role-based approvals, and a complete audit log — with bidirectional Salesforce CRM integration so contracts populate from opportunities and final status writes back. Acme's existing DocuSign account remains the e-signature engine, integrated rather than replaced. Approximately 40 users across legal, sales operations, and procurement transition into the new system before August 31 to be operational ahead of Q3 close. Migration of the contract template library is explicitly deferred to a phased follow-up.\n\nWhy now: Acme's next SOX audit lands in October, and the current email-based audit trail will not pass without significant manual reconstruction. Risk of inaction is twofold — continued Q3 close delays that hit revenue recognition, and an audit finding on contract controls. The CLM market is mature; five qualified vendors operate at Acme's scale with a Year 1 cost range of $30K–$160K, and budget has been confirmed for a deployment in the upper-mid range to align with capability and integration requirements."
  }
  $$::jsonb,
  (SELECT id FROM auth.users WHERE email = 'test@acme.com' LIMIT 1),
  'acme',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  project_title = EXCLUDED.project_title,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = NOW();
