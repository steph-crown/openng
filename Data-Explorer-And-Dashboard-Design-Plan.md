# OpenNG — Data Explorer & Dashboard Design Document

---

## 1. Overview

The Data Explorer is the no-code interface to the OpenNG API. It allows any user — developer, journalist, researcher, NGO analyst, student — to browse, filter, sort, and export Nigerian public data without writing a single line of code. It lives inside a larger dashboard shell that also handles API key management, usage analytics, and account settings.

The explorer is not a separate app. It is a module within the main `openng.dev` TanStack Start web application, accessible at `openng.dev/explore`.

---

## 2. Architecture Decision: Dashboard Shell

The data explorer lives inside a dashboard UI shell with a persistent sidebar. This is the correct pattern because:

- Users switch context between browsing data, checking their rate limit status, and managing their API key
- A persistent sidebar with shared chrome makes that switching seamless
- The sidebar navigation doubles as a resource directory — users can jump directly to any resource
- It sets the right expectation: this is a developer tool, not a consumer product

The dashboard shell wraps: the Data Explorer, API Keys, Usage Analytics, and Account Settings.

All dashboard routes are under `openng.dev/dashboard/*` and `openng.dev/explore/*`.

---

## 3. Dashboard Side Navigation — Full Structure

The sidebar is persistent on desktop (collapsible to icon-only on medium screens, hidden on mobile with a hamburger). It has four sections separated by dividers.

```
┌─────────────────────────────┐
│  [NG] OpenNG                │  ← logo, links to openng.dev
├─────────────────────────────┤
│  MAIN                       │
│  🏠  Overview               │
│                             │
│  📊  Data Explorer    [↓]   │  ← collapsible
│      All resources          │
│      Holidays     ● Live    │
│      Fuel prices  ○ Soon    │
│      Postal codes ○ Soon    │
│      Schools      ○ Soon    │
│      Health       ○ Soon    │
│      Electricity  ○ Soon    │
│      + more...              │
├─────────────────────────────┤
│  DEVELOPER                  │
│  🔑  API Keys               │
│  📈  Usage                  │
├─────────────────────────────┤
│  LINKS                      │
│  📚  Documentation    ↗     │
│  🤝  Contribute       ↗     │
├─────────────────────────────┤
│  ACCOUNT                    │
│  ⚙️  Settings               │
│  🚪  Log out                │
│                             │
│  [avatar] Steph Crown       │  ← if logged in
│  Free plan · 4,821 req left │  ← rate limit status
└─────────────────────────────┘
```

**Data Explorer collapsible behaviour:**
- Default state: expanded, showing all resources
- Collapsed state: shows "Data Explorer" label with a count badge of live resources
- "All resources" is always the first child and links to `/explore`
- Live resources are clickable and navigate directly to that resource's explorer view
- Coming soon resources are listed but grayed out (50% opacity) with a "Soon" badge
- Clicking a coming soon resource navigates to a "Coming soon" state within the explorer
- The active resource is highlighted in the sidebar

**Rate limit status in sidebar bottom:**
- Visible at all times for logged-in users
- Shows plan name, remaining requests for the current period
- No hover expansion in v1; keep it compact and readable
- For anonymous users: shows "Anonymous · Limited access" with a "Create account" link

---

## 4. Dashboard Pages

### 4.1 Overview Page — `openng.dev/dashboard`

The home page of the dashboard. Entry point after login or after clicking "Dashboard" in the main nav.

**Elements:**

**Header:**
- "Good morning" (time-aware greeting without personal name)
- For anonymous: "Welcome to OpenNG" with a "Create free account" CTA

**Stats row (4 cards):**
1. Requests today — number + sparkline mini chart
2. Requests this month — number + vs last month delta
3. Requests remaining — number + progress bar to limit
4. Resets in — countdown to rate limit reset (e.g. "Resets in 6h 22m")

For anonymous users: all four cards show with an overlay and "Log in to track usage"

**Recently explored (row of resource cards):**
- Last 3 resources the user visited
- Each card: resource name, last visited timestamp, "Continue exploring" link
- Persisted in localStorage (works for anonymous too)
- Hidden if no history

**Available resources (grid):**
- Same card grid as the Explorer home page (see section 5.1)
- Abbreviated version — shows live resources only, with a "View all" link to `/explore`

**Quick actions:**
- "Go to API Keys" button — if logged in
- "View docs" link
- "Request a resource" link (opens GitHub issues)

**API key status (if logged in):**
- Key prefix displayed (e.g. `ong_live_xK3...`)
- Created date
- "Manage key" link → goes to API Keys page

---

### 4.2 API Keys Page — `openng.dev/dashboard/keys`

**Elements:**

**Page header:**
- Title: "API Keys"
- Subtitle: "Your API key authenticates your requests and unlocks higher rate limits."

**Current key card (if key exists):**
- Key display: `ong_live_••••••••••••••••••••••••••••••••` (masked, never fully revealable after creation)
- "Copy prefix" button — copies only prefix/reference text
- Created: `April 1, 2026`
- Last used: `2 hours ago` (or "Never used")
- Plan: `Free — 5,000 requests/day`

**One-time secret handling:**
- Plaintext API key is shown only immediately after create/regenerate
- The UI warns clearly: "Copy and store this key now. You will not be able to view it again."
- If user loses it, they regenerate a new key and replace it in their apps

**Regenerate key section:**
- "Regenerate key" button — outlined danger button
- Clicking opens a confirmation dialog:
  - "Are you sure? Your current key will be immediately invalidated. Any application using it will stop working until you update the key."
  - Confirm button (red): "Yes, regenerate"
  - Cancel button

**Usage stats on this page:**
- Requests today: 179 / 5,000
- Requests this month: 4,821 / 150,000
- Rate limit resets: `in 6h 22m`
- Simple bar chart: requests per day for the last 7 days

**No key state (new user who hasn't triggered key generation):**
- Explanation: "Your API key was automatically created when you signed up. If it doesn't appear, generate one now."
- "Generate key" button

**Usage guidelines section:**
- Keep your key private — don't expose it in client-side code or public repos
- If compromised, regenerate immediately
- Link to rate limits documentation

---

### 4.3 Usage Page — `openng.dev/dashboard/usage`

**Elements:**

**Period selector:**
- Tabs: Today / Last 7 days / Last 30 days / This month
- Default: Last 7 days

**Top stats row:**
- Total requests in period
- Avg requests per day
- Peak day (date + count)
- Unique resources accessed

**Request volume chart:**
- Line chart, requests per day over the selected period
- Hover tooltip showing exact count for that day
- Horizontal dashed line showing the daily limit

**Requests by resource (bar chart):**
- Horizontal bar chart
- One bar per resource accessed
- Shows absolute count and percentage of total

**Request timeline table:**
- Last 50 requests (or last 100 for paid tier)
- Columns: Timestamp, Resource, Status code, Response time (ms), Cached (yes/no)
- Sortable by timestamp
- Status code colour coded: green for 2xx, orange for 4xx, red for 5xx

**Rate limit panel:**
- Daily limit: progress bar showing used/remaining/limit
- Monthly limit: same
- Reset times: "Daily limit resets in 6h 22m" / "Monthly limit resets in 17 days"

**Anonymous state:**
- Usage is not tracked for anonymous requests
- Full page replaced with: "Create a free account to track your usage."
- Shows what they're missing with blurred/ghosted versions of the charts

---

### 4.4 Account Settings Page — `openng.dev/dashboard/settings`

**Elements:**

**Profile section:**
- Email address (display only, not editable yet)
- Account created date

**Preferences section:**
- Theme: System / Light / Dark (radio or segmented control)
- Default page size in explorer: dropdown (10 / 25 / 50) — pre-fills the explorer's per-page selector
- "Save preferences" button

**Danger zone section:**
- Clearly separated red-border section at the bottom
- "Delete account" — outlined danger button
- Clicking opens a confirmation dialog requiring them to type "DELETE" to confirm
- Explains: "All your API keys will be invalidated. Usage history will be deleted."

**Anonymous state:**
- Full page shows a "You're not logged in" state
- Prompt to log in or create account

---

## 5. Data Explorer Pages

### 5.1 Explorer Home — `openng.dev/explore`

The entry point for the explorer. Shows all resources as browseable cards.

**Elements:**

**Page header:**
- Title: "Data Explorer"
- Subtitle: "Browse and filter Nigerian public data. No code required."

**Search bar:**
- Placeholder: "Search resources..."
- Filters the card grid in real time as you type
- Searches across resource name and description

**Recently visited row:**
- Appears only if user has explored at least one resource (localStorage)
- Label: "Recently visited"
- Horizontal scrollable row of condensed resource chips/cards
- Each shows: resource name + "X minutes ago"

**Resource card grid:**
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card contains:
  - Status badge: `● Live` (teal) or `○ Coming soon` (gray)
  - Resource name (bold, larger)
  - One-line description
  - Metadata row: record count · last updated · update frequency
  - "Explore →" link button (disabled and replaced with "Coming soon" for unreleased)

**Live resources (current):**
1. Public Holidays
2. [more added as they ship]

**Coming soon resources (listed but inactive):**
- Fuel Prices
- Postal Codes
- Public Schools by LGA
- Health Facilities by LGA
- Electricity Tariffs
- CBN Policy History
- NAFDAC Products
- MDA Directory

**Empty search state:**
- "No resources found for '[search term]'"
- "Request a resource →" link to GitHub issues

---

### 5.2 Individual Resource Explorer — `openng.dev/explore/[resource]`

The main explorer view. This is where users spend most of their time.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar nav (persistent)                                        │
├──────────────┬──────────────────────────────────────────────────┤
│  Main content area                               │  Filter      │
│  ┌─────────────────────────────────────────────┐ │  Panel       │
│  │ Resource header                             │ │  (right)     │
│  ├─────────────────────────────────────────────┤ │              │
│  │ Toolbar (copy API / share / refresh / cols) │ │              │
│  ├─────────────────────────────────────────────┤ │              │
│  │ Table                                       │ │              │
│  ├─────────────────────────────────────────────┤ │              │
│  │ Pagination                                  │ │              │
│  └─────────────────────────────────────────────┘ │              │
├─────────────────────────────────────────────────────────────────┤
│  Mobile: filters open in a modal/sheet via "Filters" button    │
└──────────────┴──────────────────────────────────────────────────┘
```

---

#### 5.2.1 Resource Header

- Resource name (h1): "Public Holidays"
- Description: "Nigerian federal public holidays declared annually by the Ministry of Interior under the Public Holidays Act Cap P40 LFN 2004."
- Metadata chips (inline, small):
  - `91 records`
  - `Last updated: Apr 6, 2026`
  - `Updates: Yearly`
  - `Source: Ministry of Interior`
- Two action buttons (right-aligned):
  - `View docs ↗` — opens docs.openng.dev/docs/resources/holidays in new tab
  - `View source ↗` — opens the source URL for this resource

---

#### 5.2.2 Filter Panel

Right sidebar panel, hideable. When hidden: show a "Filters" button with active filter count badge.

**Panel header:**
- "Filters" label
- Active filter count badge (e.g. `2`) — appears when any non-default filter is active
- "Reset all" text button — clears all filters back to defaults, only visible when filters are active
- Collapse toggle (←)

**Filter fields:**

Each filter field is rendered based on the filter's `type` declared in the ResourceConfig:

| Filter type | UI component | Example |
|---|---|---|
| `exact` + string values (free text) | Text input with magnifier icon | Name contains... |
| `exact` + enum (known set of values) | Select/dropdown with all options | Type: Fixed / Variable Islamic / Variable Christian / Special |
| `exact` + boolean | Toggle switch (on/off) | Is confirmed: on/off |
| `range_gte` + date | Date picker input (from date) | From date: [date picker] |
| `range_lte` + date | Date picker input (to date) | To date: [date picker] |
| `range_gte` + number | Number input with up/down | Min value: [input] |
| `range_lte` + number | Number input with up/down | Max value: [input] |
| `in` (multiple values) | Multi-select with chips/tags | States: [Lagos] [Abuja] [+] |
| `ilike` (partial match) | Text input with search icon | Search: [input] |

**Sort controls (always in filter panel):**

- "Sort by" dropdown: lists all sortable columns for this resource
  - Default pre-selected based on ResourceConfig `defaultSort`
- "Direction" segmented control: `↑ Ascending` / `↓ Descending`
  - Default pre-selected based on ResourceConfig `defaultSortOrder`

**Apply behaviour:**
- Filter controls are draft state until user clicks "Apply"
- Include explicit "Apply" and "Reset all" actions
- Sort and pagination can still apply immediately
- Optional debounce is only for local input UX, not automatic network fetches

**Holiday-specific filters example:**
1. Year — number input (exact)
2. Type — dropdown: All / Fixed / Variable Islamic / Variable Christian / Special
3. Is confirmed — toggle switch: Any / Yes / No
4. Date from — date picker
5. Date to — date picker
6. Sort by — dropdown: Date / Name / Year (default: Date)
7. Direction — Ascending / Descending (default: Ascending)

---

#### 5.2.3 Toolbar

Sits between the resource header and the table. Contains actions that apply to the current view.

**Left side:**
- Results count: "Showing 13 of 91 results" (updates as filters change)
- Cache status badge: `⚡ Cached` (teal dot, "served from cache") or `↻ Fresh` (gray, "fetched from API")

**Right side (action buttons, left to right):**

1. **Refresh** — icon button (↻). Busts cache for current query and re-fetches. Tooltip: "Refresh data (bypass cache)"

2. **Columns** — icon button with dropdown. Opens a checklist of all available columns. Toggle columns on/off. "Reset to default" option at bottom.

3. **Share view** — icon button (share icon). Copies the current URL including all filter state as query params to clipboard. Tooltip: "Copy link to this view". Shows "Copied!" confirmation.

4. **Copy API call** — button with code icon. Primary action.
   - Default: copies request URL as curl without credentials
   - Secondary option: copy curl with `Authorization: Bearer $OPENNG_API_KEY` placeholder
   - Do not offer "Copy with key" because plaintext key is not retrievable after creation

5. **Export CSV** — button. Exports only the current page (not all pages, not all filtered results — just what's visible). Downloads a `.csv` file named `openng-holidays-2026-04-10.csv`.

---

#### 5.2.4 Data Table

**Table behaviour:**
- Full width of the content area
- Horizontal scroll on overflow (for wide resources)
- Sticky first column on horizontal scroll (the record ID or primary identifier)
- Row hover: subtle background highlight
- Row click: opens detail modal (see section 5.3)
- Cursor: pointer on rows

**Column headers:**
- Sortable columns have a sort icon (↕ by default, ↑ or ↓ when active)
- Clicking a header sorts by that column; clicking again reverses direction
- Active sort column header is highlighted
- The sort state in the header and the sort controls in the filter panel are in sync

**Default visible columns for Holidays:**
- Date
- Name
- Year
- Type
- Is Confirmed

**All available columns (togglable via Columns button):**
- ID
- Date
- Name
- Year
- Type
- Is Confirmed
- Observance Note
- Source Date
- Source URL (truncated, external link icon)

**Cell rendering by data type:**
- `date` — formatted as `Wed, 1 Jan 2026` (not raw ISO string)
- `boolean` — rendered as a coloured pill: `● Yes` (green) / `○ No` (gray)
- `type` (enum) — rendered as a pill with a colour per value: fixed (blue), variable_islamic (teal), variable_christian (purple), special (orange)
- `url` — truncated with an external link icon, full URL in tooltip
- `string` — plain text, truncated at ~40 chars with ellipsis and full value in tooltip
- `number` — right-aligned, formatted with locale (e.g. ₦1,234.56 for prices)
- `null` / empty — rendered as `—` (em dash, not blank)

**Loading state:**
- Skeleton rows (same number as current page size) with animated shimmer
- Not a spinner — the table structure is preserved during loading

**Empty state — no results:**
- Centered within the table area
- Illustration or icon
- "No results match your filters."
- "Try adjusting or resetting your filters."
- "Reset filters" button

**Empty state — coming soon:**
- "This resource is coming soon."
- "You can request early access or contribute data."
- Two buttons: "Request access" (GitHub issue) / "Contribute data" (openng.dev/contribute)

**Error state:**
- "Failed to load data."
- Error message if available
- "Try again" button (retries the fetch)

---

#### 5.2.5 Pagination

Sits below the table.

**Left side:**
- Records per page selector: dropdown with options `10 / 25 / 50` (50 is max for free tier)
- Label: "per page"
- Changing this triggers a new fetch

**Center:**
- Page indicator: "Page 3 of 7"
- Previous page button (← or "Previous") — disabled on page 1
- Page number buttons: shows current page ± 2, with ellipsis for gaps. E.g.: `1 ... 3 [4] 5 ... 9`
- Next page button (→ or "Next") — disabled on last page

**Right side:**
- Total results: "91 records total"

---

#### 5.2.6 URL State Persistence

All filter, sort, pagination, and page size state is encoded in the URL as query params. This means:

- Every view is shareable — paste the URL, land in the exact same state
- Browser back/forward navigation works correctly
- Refreshing the page restores the exact state

**Example URL:**
```
openng.dev/explore/holidays?year=2026&type=fixed&sort=date&order=asc&page=1&limit=25
```

Default values are omitted from the URL to keep it clean.

---

### 5.3 Row Detail Modal

Triggered by clicking any row in the table. Opens as a centred modal overlay (not a new page).

**Modal structure:**

```
┌─────────────────────────────────────────────────────┐
│  Public Holiday                        [×] Close     │
│  ID: 14                                              │
├─────────────────────────────────────────────────────┤
│  CORE FIELDS                                         │
│  Name           New Year's Day                       │
│  Date           Thursday, 1 January 2026             │
│  Year           2026                                 │
│  Type           Fixed                                │
│  Is Confirmed   ● Yes                                │
│  Observance     No substitute holiday when this      │
│  Note           date falls on a weekend              │
├─────────────────────────────────────────────────────┤
│  SOURCE & METADATA                                   │
│  Source         Federal Ministry of Interior         │
│  Source URL     interior.gov.ng/...  [Open ↗]       │
│  Source Date    January 1, 2026                      │
│  Last Updated   April 6, 2026 at 12:00 UTC           │
│  Created        April 10, 2026                       │
├─────────────────────────────────────────────────────┤
│  [Copy as JSON]          [View resource docs ↗]      │
└─────────────────────────────────────────────────────┘
```

**Modal behaviour:**
- Opens with a subtle slide-up or fade animation
- Background overlay is semi-transparent dark
- Click outside the modal to close
- Press `Escape` to close
- Scroll within modal if content is long

**Sections:**

**Core fields** — all the resource's data fields rendered as a clean key-value list. Labels are human-readable (not raw field names). Values are fully rendered (not truncated).

**Source & Metadata** — fields that are on every record but not shown in the table by default:
- Source (institution name)
- Source URL (with "Open ↗" button that opens in new tab)
- Source Date (when the government published this data)
- Last Updated (when OpenNG last synced this record)
- Created (when the record was added to OpenNG)
- Record ID

**Footer actions:**

`Copy as JSON` — copies the raw record as a formatted JSON object to clipboard. For developers who want to paste it into their code. Shows "Copied!" for 2 seconds.

`View resource docs ↗` — opens the docs page for this resource in a new tab.

**Keyboard shortcut in modal:**
- `←` → previous row (without closing modal)
- `→` → next row (without closing modal)
- Small "1 of 13" indicator at top right of modal showing position in current page

---

## 6. Rate Limiting UX

### 6.1 Caching Strategy

All API responses made by the explorer are cached in the browser. The cache is:

**Implementation:** in-memory JavaScript Map (not localStorage — localStorage has size limits and doesn't expire; in-memory resets on page reload which is fine)

**Cache key:** `${resource}:${JSON.stringify(sortedParams)}` — params are sorted so `year=2026&type=fixed` and `type=fixed&year=2026` produce the same cache key

**Cache TTL:** 5 minutes. After 5 minutes, the cached entry is stale and the next request for that query will fetch fresh.

**Cache hit behaviour:**
- Response is served instantly from memory
- The toolbar shows `⚡ Cached` badge with a tooltip: "Served from cache · Fetched 3 min ago"

**Cache miss behaviour:**
- Fetch is made to the API
- On success, result is stored in cache with a timestamp
- The toolbar shows `↻ Fresh` badge briefly then switches to `⚡ Cached`

**Manual cache bust:**
- The Refresh button (↻ in toolbar) busts the cache for exactly the current query and re-fetches
- Does not bust other cached queries

**Pagination and cache:**
- Each page is a separate cache entry
- Page 1 and page 2 of the same filters are cached independently

---

### 6.2 Anonymous User — Rate Limit UX

**Normal state (under limit):**
- No rate limit UI visible in the explorer itself
- Sidebar bottom shows: "Anonymous · Limited access"

**Approaching limit (over 80% consumed based on response headers):**
- A soft warning banner appears above the table: "You're approaching your anonymous request limit. Create a free account for 10× more requests."
- Banner has a dismiss button and a "Create account" CTA

**Limit hit (429 received):**
- A modal appears (cannot be dismissed until they take action):

```
┌─────────────────────────────────────────────────────┐
│  Request limit reached                               │
│                                                      │
│  You've reached the anonymous request limit.         │
│  Your limit resets in:                               │
│                                                      │
│         ╔══════════╗                                 │
│         ║  5m 32s  ║  ← countdown timer             │
│         ╚══════════╝                                 │
│                                                      │
│  Or create a free account to get 10× more requests  │
│  and track your usage.                               │
│                                                      │
│  [Create free account]    [Wait and retry]           │
└─────────────────────────────────────────────────────┘
```

- Countdown timer counts down from the `Retry-After` header value
- "Wait and retry" button is disabled until the countdown reaches 0, then auto-enables
- "Create free account" button redirects to signup

---

### 6.3 Authenticated User — Rate Limit UX

**Normal state:**
- Sidebar bottom shows: `Free plan · 4,821 req left`
- Hovering expands to show full breakdown: `5,000/day · 4,821 remaining · Resets in 6h 22m`

**Approaching limit (over 80% consumed):**
- Sidebar bottom text changes to amber: `Free plan · 821 req left ⚠`
- An amber banner appears in the explorer: "You've used 4,179 of your 5,000 daily requests. Explorer requests count toward your limit."

**Limit hit (429 received on their key):**
- Different modal from anonymous — more direct:

```
┌─────────────────────────────────────────────────────┐
│  Daily limit reached                                 │
│                                                      │
│  You've used all 5,000 requests for today.           │
│  Your limit resets in:                               │
│                                                      │
│         ╔══════════╗                                 │
│         ║ 6h 22m   ║  ← countdown                   │
│         ╚══════════╝                                 │
│                                                      │
│  Note: Cached results still available — you're       │
│  just blocked from new API requests until reset.     │
│                                                      │
│  [View usage]    [Got it — I'll wait]                │
└─────────────────────────────────────────────────────┘
```

- Cached results remain accessible (cache is in-memory, not affected by rate limit)
- The explorer continues to work for any previously cached query
- Uncached queries show an inline error instead of results: "New requests unavailable until [time]. Previously loaded results still available."
- "View usage" goes to the Usage page

---

### 6.4 Authentication Flow from Explorer

**Login / signup entry points in the explorer:**

1. Sidebar bottom "Create account" link
2. Rate limit 429 modal CTA
3. 80% warning banner CTA
4. API key copy (when anonymous, the copy includes a "Sign up for an API key" note)

**After login:**
- Explorer calls to `api.openng.dev` use session auth (`openng_session`) with `credentials: "include"`
- No client-side storage of plaintext API key
- Rate limit display in sidebar updates to show their actual quota
- In-memory cache carries over (no flush on login)

---

## 7. Search Within Resources

For resources that support `ilike` search (partial text match on a field), the explorer shows a search input above the filter panel. This is distinct from the "Search resources" input on the Explorer home.

**Search input behaviour:**
- Debounced 400ms — no request fired per keypress
- Applies as a filter alongside all other active filters
- Search term is persisted in URL state
- Cleared by the "Reset all" button in filters

**Which resources have search:**
Depends on whether the ResourceConfig defines an `ilike` filter. Example:
- Holidays: search by name (`name ilike %term%`)
- Schools: search by school name, LGA
- NAFDAC products: search by product name, manufacturer

---

## 8. Mobile Responsiveness

The explorer must be functional on mobile, even if the experience is simplified.

**Mobile layout (< 768px):**
- Sidebar collapses to a slide-out drawer, opened by a hamburger menu
- Filter panel collapses to a bottom sheet, opened by a "Filters" button above the table
- Table scrolls horizontally (swipe)
- Toolbar condenses: Copy API call and Export are accessible via a "⋯ More" menu
- Pagination simplifies to Previous / Page X of Y / Next (no page number buttons)

**Tablet layout (768px–1024px):**
- Sidebar collapses to icon-only (tooltips on hover)
- Filter panel stays as a right sidebar but narrower
- Table remains full-width

---

## 9. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `R` | Refresh current query (bust cache) |
| `C` | Copy API call to clipboard |
| `Escape` | Close any open modal or filter panel |
| `←` / `→` | In row detail modal: navigate to prev/next row |
| `/` | Focus the search input (if resource has search) |
| `F` | Toggle filter panel open/closed |

Shortcuts are only active when the user is not focused on an input field.
A keyboard shortcut reference is accessible via `?` key — shows a small modal listing all shortcuts.

---

## 10. Explorer State That Persists (and What Doesn't)

| State | Persisted where | Lifetime |
|---|---|---|
| Active filters, sort, page | URL query params | Until URL changes |
| Records per page | localStorage | Permanent (until cleared) |
| Column visibility | localStorage | Permanent |
| Recently visited resources | localStorage | 30 days |
| API response cache | In-memory (JS Map) | 5 minutes or page reload |
| Auth session | `openng_session` cookie | Until logout |
| Default page size from settings | User settings (DB) | Permanent for logged-in |

---

## 11. Coming Soon Resource State

When a user navigates to `openng.dev/explore/fuel` and fuel prices are not yet live:

```
┌─────────────────────────────────────────────────────┐
│  Fuel Prices                           ○ Coming soon │
│  Monthly PMS, diesel, and kerosene prices by state   │
├─────────────────────────────────────────────────────┤
│                                                      │
│          🔒 This resource is coming soon.            │
│                                                      │
│   Fuel prices will be sourced monthly from the       │
│   National Bureau of Statistics, covering all 36     │
│   states and the FCT.                                │
│                                                      │
│   Expected: Q2 2026                                  │
│                                                      │
│   [Request early access]   [Get notified]            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

"Request early access" → GitHub issue with pre-filled template
"Get notified" → email capture (simple form, stores email for launch announcement)

---

## 12. Empty and Error States — Complete Reference

| Scenario | Heading | Body | Action |
|---|---|---|---|
| No results (filters active) | "No results" | "No records match your current filters." | "Reset filters" button |
| Resource coming soon | "Coming soon" | [resource description + expected date] | "Request access" + "Get notified" |
| API error (500) | "Something went wrong" | "The API returned an error. This is our fault, not yours." | "Try again" button |
| Network error | "Connection failed" | "Couldn't reach the OpenNG API. Check your connection." | "Try again" button |
| Rate limit (anonymous) | "Request limit reached" | [countdown + upgrade prompt] | "Create account" + "Wait and retry" |
| Rate limit (authenticated) | "Daily limit reached" | [countdown + cached results note] | "View usage" + "Got it" |
| Resource not found | "Resource not found" | "This resource doesn't exist." | "Back to Explorer" |
| Auth error on API key | "Authentication failed" | "Your API key may have been regenerated. Refreshing your session." | Auto-retry + "Manage keys" |

---

## 13. Implementation Notes

### Tech stack for the explorer:

- **Framework:** TanStack Start + TanStack Router (`apps/web`)
- **State management:** URL search params as the source of truth (no Redux/Zustand needed)
- **Data fetching:** TanStack Query for all API requests
- **Cache:** TanStack Query cache (with stale time/gc time) plus optional lightweight in-memory metadata for custom cache badges
- **Table:** TanStack Table + UI primitives in `packages/ui`
- **Charts (Usage page):** Recharts
- **Date picker:** `react-day-picker` or a simple HTML date input with styling
- **Auth:** existing magic-link + session cookies from OpenNG API (`/auth/*`, `/account/*`)

### API calls from the explorer:

The explorer calls `api.openng.dev` directly from the browser. It does not proxy through the TanStack Start server. This means:
- CORS must be configured on the Hono API to allow requests from `openng.dev`
- Explorer requests include `credentials: "include"` so session-authenticated users get their higher tier without exposing keys in client state
- Optional external-copy snippets can include `Authorization: Bearer $OPENNG_API_KEY` placeholders
- Rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) are read from responses and used to update the sidebar display

### ResourceConfig drives everything:

The filter panel, column list, sort options, default sort, and search are all derived from the `ResourceConfig` for each resource. The explorer has zero per-resource hardcoding. Adding a new resource to the API automatically makes it available in the explorer — the resource card appears, the filters render correctly, and the table columns populate.

This is achieved by fetching `api.openng.dev/v1/{resource}/meta` on mount and using the `filters`, `fields`, `defaultSort`, and `defaultSortOrder` from the response to render the UI.

### Performance:

- Initial page load: Server-rendered resource header and skeleton table
- First data fetch: client-side, triggers on mount
- Subsequent filter changes: debounced client-side fetches
- Cache hit: synchronous from memory — table updates in < 16ms
- Target: filter change → visible table update in < 200ms (cache hit) or < 1000ms (API call)

### Delivery scope for this cycle:

- Focus is UI implementation first (dashboard shell, explorer pages, filters, table, pagination, states, responsiveness)
- For data/usage endpoints not yet implemented, use deterministic dummy data adapters in `apps/web`
- After UI is complete, produce a concrete API endpoint backlog for implementation
