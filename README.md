# BuyRight

**Build the business case. Own the conversation.**

BuyRight is a business case development tool for software buying. It gives any business leader — with or without a procurement function — the structured thinking required to evaluate software on their own terms, not the vendor's.

---

## The problem it solves

Every software purchase starts the same way. A vendor fills the gap in your thinking before you've had a chance to define it yourself. By the time you're in demos, you're evaluating on their terms. You're answering their questions, not asking your own.

The result: you buy what they want to sell you, not what you actually need.

BuyRight flips that. It forces the rigor required to source software correctly — scoped requirements, a defensible business case, a cursory market survey — before you ever talk to a vendor. When procurement gets involved, you're already ready. When it doesn't, you don't need it.

---

## What it does

| Step | What happens |
|---|---|
| **Scope** | Describe the business problem in plain language. The agent drafts a formal scope, evaluates it for quality (specificity, exclusions, plain language, integration compatibility), and iterates until it meets the bar. |
| **Requirements** | Generates binary success criteria — "The solution shall..." statements vendors must answer yes or no. No narratives, no wiggle room. User can edit, reorder, and add their own. |
| **Due Diligence** | Discovery questions per requirement that unpack how vendors actually implement each capability — where the real differences live. |
| **Market Survey** | Agent-identified vendor shortlist for your specific category, including pricing signals, requirements fit, and deployment model. Works for mainstream SaaS and niche technical software alike. |
| **Buying Timeline** | Procurement timeline with Gantt chart, calibrated to your buying channel (competitive bid, sole source, open source, build vs. buy). |
| **Business Case** | Executive narrative, vendor comparison with pricing estimates, and requirements summary — formatted for a deck, memo, or internal alignment meeting. |

Export everything to `.docx` at any stage.

---

## Who it's for

- A VP of Engineering scoping a DevOps platform
- A CFO building the case for a new ERP
- A Head of HR evaluating HRIS vendors
- An IT Director defining requirements before a security tool RFP
- An Operations Manager replacing a legacy system

You don't need a procurement team to use it. You don't need to know what an RFx is. You need to know what problem you're trying to solve — BuyRight handles the rest.

---

## The methodology

BuyRight encodes 20 years of procurement practice from [Acuity Sourcing](https://acuitysourcing.com).

The core principle: **buy based on needs, not what vendors want to sell you.**

- Requirements are binary so vendors can't qualify their answers
- Scope is evaluated against procurement-grade quality criteria before moving forward
- Market research surfaces the right vendors for the specific category — not just the ones with the biggest marketing budgets
- Pricing estimates give you an order-of-magnitude anchor before any vendor conversation

When the stakes are high enough to want a practitioner in the room, that's what Acuity is for. BuyRight is the methodology made self-serve.

---

## Tech stack

- **Frontend:** Vite + React, deployed on Vercel
- **Backend:** Vercel serverless functions (API proxy)
- **Database:** Supabase (Postgres)
- **AI:** Anthropic API — Claude Sonnet 4.5 (scope, requirements, questions, narrative), Claude Haiku 4.5 (market research, company lookup, pricing)
- **Export:** docx (Word document generation in-browser)

---

## Part of the Acuity ecosystem

BuyRight is the pre-vendor layer of the **Procurement OS** — a full operating system for software sourcing built by Acuity Sourcing.

- **BuyRight** — define what you need before vendors show up
- **Procurement OS** — manage vendors, contracts, and spend after you've bought

Both are built on the same methodology. Both are sold and supported by Acuity Sourcing.

---

*© Acuity Sourcing. Built with the conviction that better buying starts before the first demo.*
