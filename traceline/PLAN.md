# Traceline: plan for the next features

This is a hand-over plan for five features. Do **one feature per chat**, in the order below. Each phase changes the data that the next one builds on.

| Order | Feature | Why it matters to a senior investigator |
|---|---|---|
| 1 | **Sources and confidence** (#2) | Every fact can answer "how do we know this?" |
| 2 | **Recovery tracker** (#1) | "How much can we get back, and have we frozen it?" |
| 3 | **More kinds of identifiers** (#7) | Addresses, IP addresses, devices, company numbers and handles link people automatically |
| 4 | **Contact events on the timeline** (#12) | Shows how the scam unfolded, not just where the money went |
| 5 | **Links across cases** (#4) | The same mule account or phone in two cases points to an organised network |

Already done: **#3 Exact amounts traced** (see "Existing building blocks" below). The recovery tracker builds on it.

---

## How to start each new chat

Paste this, changing the phase number:

> Read `traceline/PLAN.md` in the Projects-Map repo and build **Phase N** only. Follow the ground rules in the plan. Work on the branch `claude/fraud-victim-mindmap-jg4coz` (or on `main` if PR #1 has been merged). Update the example case so the new feature is visible straight away. Test it in a real browser, then commit, push and update the PR.

---

## Ground rules (all phases)

- **One file.** Everything lives in `traceline/index.html`: HTML, CSS and JavaScript, with no build step and no frameworks. Edit that file directly. The parts it was first assembled from are not in the repo.
- **Local only.** Data is saved in the browser (`localStorage`, key `traceline-cases-v1`). Nothing is uploaded. The only network requests allowed are Google Fonts and the PowerPoint library (`pptxgenjs@3.12.0` from jsDelivr, loaded only when exporting).
- **Every automatic link explains itself.** Any link the engine finds must carry a plain-English `why`, such as "The phone number … appears in both records". Never draw a line without one.
- **Money is exact.** Do money arithmetic in pennies (whole numbers), as the tracing engine does. Totals must always reconcile.
- **Old saved cases must still open.** Add every new field to `sanitize()` with a safe default, so older cases load without errors.
- **Keep the outputs in step.** A new feature should show up everywhere it matters: the map, the dossier, the findings, the top-bar figures, the on-screen presenter (`buildSlides`) and the PowerPoint export (`exportPPTX`). Slides stay visual-first: no data tables.
- **Plain language in the interface.** Write "Freeze requested", not "status=FRZ_REQ".
- **Test before pushing.** Open the page in headless Chromium (Playwright, with the browser at `/opt/pw-browsers`). Check there are no page errors at 1600×950, 1366×768 and 400×820 (phone). Check that Present works and that the PowerPoint export downloads (for tests, serve pptxgenjs from `npm pack pptxgenjs@3.12.0`). Check any new amounts against a hand calculation.

## Where things are in `traceline/index.html`

Search for these function names; line numbers drift as the file changes.

| Area | Functions |
|---|---|
| Example data, repair on load | `exampleCase`, `emptyCase`, `sanitize`, `parseDate` |
| Case library and saving | `LIB_KEY`, `loadLib`, `save`, `switchCase`, `addCase` |
| Link-finding engine | `analyse()`: ownership, money flows, identifiers (`extract`, `ident`), mentions, money trails, findings, suggested questions |
| Traced amounts (#3, done) | `traceFunds`, `traceFindings`, `tracedVictimHTML`, `tracedAccountHTML`, `tracedHolderHTML`, `victimColor` |
| Map | `buildLayout`, `groupSVG`, `compBar`, `chipSVG`, `drawEdges`, `edgeGeom`, `trailFor`, `highlightSet`, `applyState` |
| Side panels | `renderKpis`, `renderLeft`, `renderRight`, `dossierHTML`, `caseSummary`, `renderAll` / `renderAllUnsafe` |
| Timeline strip | `renderTimeline`, `play`, `setT`, `replayTrail` |
| Presenter and exports | `timelineGraphic`, `victimStory`, `keyLinks`, `buildSlides`, `exportPPTX`, `mapPNG`, `exportJSON`, `saveFile` |
| Forms | `editPerson`, `editAccount`, `editTx`, `editNote`, `editQuestion`, `editSettings`, `openPaste` |
| Search and menus | `palSource`, `openMenu`, and the export and case menus |

## Existing building blocks you can reuse

- `A = analyse()` gives `A.nodes`, `A.edges` (with `type`: `money`, `owns`, `shared`, `mention`), `A.findings`, `A.suggested`, `A.ownerId` (account → person), `A.inflow` and `A.outflow`, `A.lossBy`, `A.trails` (per victim: `reached` and `pathTo(acc)`), and `A.reachedBy`.
- `A.trace = traceFunds(method)` gives, per account, `received` and `holding` (victim → pennies), plus `byVictim` (where each victim's money is now, and how much was returned) and `perTx`. Methods: proportional (`prorata`) and first in, first out (`fifo`), switchable in the dossier and in Case details.
- A finding looks like this: `{ sev: 'high'|'med'|'info', kind, title, text (HTML), nodes: [...ids], edges: [...edge ids] }`. Selecting a finding highlights its `nodes` and `edges` on the map, and key findings become slides automatically.

---

## Phase 1: Sources and confidence (#2)

**Goal:** every fact shows where it came from and how sure we are. Confirmed links are drawn as solid lines and suspected ones as faint dashed lines.

**Data** (add to `sanitize`):
- On every person, account, payment, note and question answer: `source` (text, for example "HSBC statement p.3" or "Victim statement 12 Jan") and `confidence`, one of `confirmed`, `reported` or `suspected`. The default is `reported`.

**Forms:** add a "Source" field and a three-button "How sure are we?" choice to each form.

**Engine:**
- A money line is only as strong as its weakest payment.
- An ownership line takes the account's confidence.
- Links Traceline finds itself are marked "Found automatically", and their `why` names the sources of both records.

**Map:**
- Confirmed: solid line.
- Reported: slightly lighter.
- Suspected: dashed, with a small "?".
- Records with no source get a small "No source" tag.
- Add a "Confirmed only" chip in the layer bar.

**Dossier:** an "Evidence" list of sources. Each link reason ends with "Source: …".

**Findings and figures:**
- A new "Evidence coverage" figure (the share of records with a source).
- A finding: "7 facts have no source".

**Slides:** a short "Sources: …" line under each key-link picture, and a small legend for the line styles.

**Example case:** give most records a source, leave two without one, and mark one link as suspected.

**Done when:**
- Unsourced and suspected items look visibly different.
- The filter hides unconfirmed money lines.
- Old cases open with every record set to "reported".

## Phase 2: Recovery tracker (#1)

**Goal:** show at a glance how much was lost, how much is frozen, how much has come back, and how much is still outstanding, per victim and for the whole case.

**Data:**
- On accounts:
  - `status`: `unknown`, `open`, `freeze-requested`, `frozen` or `closed`
  - `freezeRequested` (date), `frozenAmount`, `frozenDate`, `bankRef`, `bankContact`
- A new list, `recoveries`: `{ id, date, fromAccount, toVictim, amount, kind: 'recalled'|'returned'|'reimbursed', reference, source }`.
  - Reimbursement by the victim's own bank (UK APP scam reimbursement rules, in force since October 2024) is counted separately from money recovered out of other accounts.

**Engine:**
- Per victim: `lost`, `frozen` (their share of frozen amounts, allocated using `A.trace.holding` for that account), `returned`, `reimbursed`, and `outstanding = lost − returned − reimbursed`.
- Per account: money traced as still held versus the amount frozen. The difference is the "recoverable gap".

**Findings:**
- "£38,400 traced to accounts with no freeze requested". This is high priority and time-critical.
- "Frozen amount is higher than the traced balance: check the figures".
- "No movement for 30+ days".

**Top bar:** add "Frozen" and "Recovered" figures, each with a percentage of the loss.

**Map:** a status chip on each account row (FROZEN, FREEZE REQUESTED, CLOSED) and the frozen amount.

**Dossier:**
- Account: a "Recovery" section with one-click actions ("Freeze requested today", "Record frozen amount").
- Victim: a bar split into lost, frozen, returned and outstanding.

**Timeline:** markers for freeze and recovery events. The timeline graphic gets a "recovered" line under the loss line.

**Slides:** a new "Recovery" slide with four big numbers and a bar made of native shapes. Each victim slide gets a "£X recovered" fact.

**Example case:**
- Revolut: freeze requested 23 Jan, £500 frozen.
- Barclays reimbursed Margaret £6,000 on 20 Feb.

**Done when:**
- Per victim, `returned + reimbursed + outstanding = lost`, to the penny.
- The figures match a hand calculation.

## Phase 3: More kinds of identifiers (#7)

**Goal:** Traceline automatically links people and accounts that share an address, IP address, device, company number, website or social handle.

**Data:**
- On people and accounts: `identifiers: [{ type, value, source }]`.
- Types: `address`, `ip`, `device`, `company`, `website`, `handle`, `vehicle`.

**Engine:** extend `extract()` and the identifier index inside `analyse()`, with careful normalising:
- **Address:** UK postcode plus house number (a postcode alone is too weak; treat it as a softer link).
- **IP address:** v4 and v6. Private ranges such as 192.168.x.x are marked low confidence.
- **Device:** a 15-digit IMEI that passes the Luhn check, or a device ID.
- **Company number:** 8 characters, for example `12345678` or `SC123456`.
- **Handle:** `@name`.
- **Website:** reduce to the bare domain, for example `veltrix-capital.example`.
- **Soft link:** an email address on a company's own website domain (for example `d.mercer@veltrix-capital.example` and the website `veltrix-capital.example`) gives a "same domain" link.
- Every link gets a `why`, for example "The IP address 81.2.69.160 was used by both".

**Forms:** an "+ Add identifier" repeater, with a type picker and a value box.

**Dossier:** an "Identifiers" list. The Ctrl+K search finds identifiers too.

**Map:** shared-detail labels name the type ("Same IP", "Same address").

**Example case:**
- Kestrel Trading Ltd and David Mercer share a registered address.
- Jamal Price's Monzo account and the Revolut account were logged into from the same IP address.

**Done when:**
- No false links from partial matches.
- Every new type is covered by a test value in the example case.

## Phase 4: Contact events on the timeline (#12)

**Goal:** show how the scam unfolded: first contact, calls, messages and pressure before each payment.

**Data:** a new list, `events`: `{ id, date, time, kind: 'first-contact'|'call'|'message'|'email'|'meeting'|'advert'|'other', channel, from, to, identifierUsed, summary, source, confidence }`.

**Engine:**
- Events link the two people involved (a new `contact` line type).
- The identifier used, such as a phone number or handle, joins the identifier index.
- New findings:
  - "First contact to first payment: 14 days".
  - "3 payments followed a call within 24 hours" (a pressure pattern).
  - "Same WhatsApp number contacted 2 victims".

**Left rail:** a "Contact" section on the Notes tab, and an `editEvent` form. Paste-many support for events is optional.

**Timeline strip:** a third row with an icon for each kind of event. The replay plays events too.

**Timeline graphic:** a "Contact" lane above the payments.

**Dossier:** a "Contact history" list for each person.

**Slides:** a "How the scam unfolded" slide that combines the contacts and payments lanes.

**Example case:** a dating-app match (10 Nov), first WhatsApp message (14 Nov), and calls before each of Margaret's payments.

**Done when:** events appear in the replay and can be selected. Their links are explained.

## Phase 5: Links across cases (#4)

**Goal:** spot the same people, accounts and identifiers across all cases saved on the device, and give a portfolio view.

**Engine:**
- `crossCase()` builds an index across every case in the library, keyed on normalised account numbers, phones, emails, wallets, names and aliases, and the identifiers from Phase 3.
- The result maps each key to `[{ caseId, entityId, label }]`.

**Findings in the open case:** "This account also appears in CASE-2026-0152 (Harbour invoice redirection)". This is high priority. Selecting it offers "Open that case", which opens the case with that record selected.

**Case details:** new fields `status` (Open, With police, Closed), `priority`, `owner`, `crimeRef` and `sarRef`.

**Portfolio view** (from the case switcher):
- A card per case showing victims, loss, recovered (from Phase 2), open questions and status.
- A network picture: each case as a cluster, joined by the records they share.

**Map:** an "Also in 1 other case" badge on cards.

**Slides:** a portfolio deck, with a network slide plus one summary slide per case, and a choice of which cases to include.

**Example:** add a second example case that shares Jamal Price's Monzo account and David Mercer's phone number.

**Done when:**
- Matches use exactly the same normalising as inside a single case.
- Nothing is sent anywhere.
- Deleting a case removes it from the index.

---

## Later ideas (not planned yet)

- **Share-safe export:** hide account numbers and victims' names in slides.
- **Actions, deadlines and change history.**
- **Possible duplicates:** "J. Price may be Jamal Price".
- **Scam type and warning-sign checklist.**
- **Report drafts:** summaries for suspicious activity reports (SAR) and police referrals.
- **Bank statement import** from Excel or CSV.
