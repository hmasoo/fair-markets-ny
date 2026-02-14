# Claude Instructions for Fair Markets NY

Read PROJECT.md first — it contains the full project vision, thematic research areas, data sources, tech stack, legal framework, and prior art.

## What This Project Is

A public data platform that joins siloed government datasets (federal, state, city) across shared geographic keys to make policy-relevant information accessible and explorable. The core value is **data integration** — linking parcel ownership records to violation data to Census income tables to regulatory filings — so that users don't have to do that joining themselves.

The platform currently covers housing, broadband, healthcare, and regulatory enforcement across New York State. It is designed so that the marginal cost of adding new policy verticals decreases over time, because new datasets plug into existing geographic scaffolding (census blocks, neighborhoods, counties, health planning regions).

## Who This Is For

People who need to make policy arguments and don't have a data team: community board members preparing rezoning testimony, local reporters covering hospital mergers, policy staffers drafting broadband subsidy proposals, advocates building evidence-based cases. The platform gives them a structured middle layer — connected enough to be useful, open enough to support their own conclusions.

## Naming & Identity

The current name "Fair Markets NY" presupposes a thesis about market fairness. The project is evolving toward a **neutral data platform** identity. Preferred direction: a name that signals public data infrastructure, not advocacy. Leading candidates include **Crosswalk NY** (describes the technical value of linking datasets, familiar to policy audience) or **Empire Data** (broader appeal, NY-specific). Avoid names containing "fair," "watch," "monitor," or "accountability" — these signal advocacy and limit trust with users who need a neutral tool.

## Core Design Principles

### 1. Lead with costs and outcomes, not market structure

Every page should follow this logic:
1. **What do you pay?** — the cost the audience feels
2. **What drives that cost?** — supply constraints, regulation, geography, income, and market structure where demonstrable
3. **What has been tried?** — policy interventions with honest assessment
4. **What could help?** — more supply, more competition, better regulation (distinguished clearly)

Concentration metrics (HHI, CR4) are **evidence**, not headlines. They appear when they earn their place — when connected to a price or quality outcome.

### 2. Don't conflate market structure with market failure

High concentration is not inherently harmful. The site's own data proves this: Stuyvesant Town (HHI 6,553) is entirely rent-stabilized with good outcomes; Co-op City (HHI 4,713) is resident-governed; Parkchester's top "landlord" is a condo association. Structure is an input to analysis, not a conclusion.

When presenting structure data, always pair it with outcome data (prices, quality, access) or explicitly note the absence of that evidence. Never let the framing imply a causal link that hasn't been demonstrated.

### 3. Distinguish between different types of problems

Not all consumer pain has the same cause or the same solution:
- **Infrastructure gaps** (rural broadband) → subsidized buildout, not antitrust
- **Market power** (urban ISP duopolies) → competition policy
- **Low incomes** (rent burden in West Farms) → income support, not ownership deconcentration
- **Supply constraints** (zoning-restricted housing) → regulatory reform

The platform should help users see which type of problem they're looking at. Mixing these up produces bad policy recommendations.

### 4. Make the data integration visible

Users should understand they're looking at multiple joined datasets, not a single source. Frame this as a feature: "This view combines parcel ownership, violation records, Census income data, and rent stabilization status — four public datasets that are normally siloed." The joining is the product.

### 5. Maintain editorial neutrality

A thesis-driven advocacy site picks fights. A platform earns trust by showing data even when it cuts against expected narratives. The existing disclaimers (Stuy Town, Co-op City, the enforcement page's "What this tracker doesn't capture") exemplify the right instinct. Protect and extend this approach.

## Page-Specific Guidance

### Homepage
- Frame as: "What do New Yorkers pay for the basics — and why?"
- The "41 cents of every dollar" stat should describe spending on necessities, not imply those sectors all have competition problems
- Drop the word "concentration" from the landing page; let each vertical make its own case

### Housing (`/housing`)
- Lead with rent burden and income by neighborhood — that's what people feel
- Explain drivers in order of explanatory power: income levels → supply/zoning constraints → stabilization regime → ownership structure
- The ownership map is interesting context, not the diagnosis
- **Critical data gap:** median rent column is empty for every row in the neighborhood table. This is the single most important missing number for a cost-focused framing
- Kill HHI as a consumer-facing metric; use plain language ("5 companies own X% of rentals")

### Broadband (`/broadband`)
- The strongest concentration case on the site — an 88% CR4 is legitimately high
- Split explicitly into two problems with two solutions: rural infrastructure gaps (subsidized buildout) vs. urban duopolies (competition policy)
- **Critical data gap:** broadband prices by county/provider. If monopoly counties pay more, that's the killer fact. Without prices, the page documents provider counts but doesn't demonstrate consumer harm

### Healthcare (`/healthcare`)
- Bed share is the weakest metric on the site. Patients don't choose hospitals by bed count
- Need at least one of: insurer-negotiated rates by region, out-of-pocket cost comparisons, or quality metrics (readmissions, outcomes) correlated with consolidation
- The academic literature (Gaynor, Cooper, Craig) supports the link between hospital consolidation and higher prices — cite it directly rather than implying it through HHI tables
- NYS SPARCS has charge data that could strengthen this page substantially

### Enforcement (`/enforcement`)
- The best-written page on the site. The "What this tracker doesn't capture" section is excellent
- Drop the Coach/Capri handbag merger — it's unrelated to essential NY markets and reads as filler
- Cross-reference other pages: "This hospital merger affected the Finger Lakes region — here's what concentration looked like before and after." This is where the shared data layer pays off visibly
- Consider leading with the limitations framing — it signals intellectual seriousness

## Expansion Strategy

Choose new verticals by what plugs into existing geographic and demographic scaffolding, not by ideological affinity. High-value candidates:
- **Grocery access** — USDA food desert data, SNAP retailer locations (shares Census geography)
- **Energy costs** — utility service territories mapped to counties
- **School performance** — shares neighborhood boundaries
- **Childcare** — licensing data, cost data, shares Census geography

The question is never "what other markets have competition problems" — it's "what other policy-relevant datasets can we join to what we already have."

## Anti-Patterns to Avoid

- Using HHI or CR4 as headlines for a general audience
- Presenting a scatterplot that shows no correlation without saying so
- Framing consolidation trends as inherently alarming without outcome evidence
- Implying causation between concentration and rent burden when income is the dominant factor
- Including enforcement examples outside the platform's scope to pad numbers
- Letting "competitive," "moderate," and "highly concentrated" HHI labels do argumentative work that the underlying data doesn't support

## Technical Notes (Architecture)

- Geographic keys: census blocks, NTAs (neighborhoods), counties, health planning regions
- Primary data sources: NYC MapPLUTO, ACRIS, HPD (housing); FCC BDC (broadband); NYS DOH SPARCS, AHA (healthcare); BLS CEX (spending); Census ACS (income/demographics)
- All data from public government records — this is a feature, not a limitation
- The methodology/about page is as important as any vertical page; treat it like API documentation

## Project Bootstrap

### 1. Scaffold the app

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
npm install @prisma/client recharts zod
npm install -D prisma tsx dotenv @types/node
npx prisma init
```

Use the same build pattern as CAMP:
- `"build": "prisma generate && next build"`
- `"postinstall": "prisma generate"`
- Generate Prisma client to `src/generated/prisma` (set `output` in `generator client`)
- Use `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for Vercel deploys

### 2. Database

PostgreSQL on Supabase (same as CAMP). Set `DATABASE_URL` and `DIRECT_URL` in `.env`. Add PostGIS extension for spatial data:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Prisma schema design

The schema should be NY-specific, not a copy of CAMP. Core models:

**Reference tables:**
- `Sector` — NAICS-coded sectors (housing, healthcare, broadband, grocery, insurance, etc.)
- `Entity` — companies, landlords, health systems, ISPs, PE firms. Include `aliases: String[]` for entity resolution (LLC variants, DBAs)
- `Geography` — NYS counties, NYC boroughs, neighborhoods, census tracts. Include `geom` field (PostGIS) for spatial queries

**Data tables:**
- `ConcentrationData` — HHI, CR4, market_share by sector/year/geography. Same pattern as CAMP but with geography dimension
- `PropertyOwnership` — ACRIS/PLUTO-derived: parcel, owner entity, units, borough, block, lot
- `BroadbandCoverage` — FCC BDC-derived: census block, ISP entity, max download/upload speed, technology
- `HealthFacility` — DOH-derived: facility name, type, parent system entity, address, geom
- `EnforcementAction` — AG press releases, CON filings: date, type, parties, outcome, source URL
- `DataSource` — registry of all ingested sources with last-scraped timestamps

**Content tables (later):**
- `Analysis` — editorial write-ups linked to data (the Bruenig newsletter layer)

### 4. Tailwind theme

Extend with project colors. Suggested palette (can be refined):

```js
// Refer to CAMP's pattern: camp-navy, camp-red, camp-blue, camp-gray
// Fair Markets NY should have its own identity
colors: {
  'fm-navy': '#1a2744',    // primary dark
  'fm-red': '#c62c27',     // accent (reuse CAMP red or pick NY-specific)
  'fm-blue': '#2563eb',    // links, interactive
  'fm-gray': '#64748b',    // secondary text
}
```

### 5. Directory structure

```
src/
  app/
    page.tsx                          # Landing page
    about/page.tsx                    # About + methodology
    housing/page.tsx                  # Tier 1: landlord concentration
    housing/[neighborhood]/page.tsx   # Neighborhood drill-down
    healthcare/page.tsx               # Tier 1: health system consolidation
    broadband/page.tsx                # Tier 1: ISP competition maps
    broadband/[county]/page.tsx       # County drill-down
    platform/page.tsx                 # Tier 1: delivery/rideshare
    grocery/page.tsx                  # Tier 2: grocery access
    enforcement/page.tsx              # Tier 2: AG tracker
    insurance/page.tsx                # Tier 2: DFS market share
  components/
    charts/                           # Recharts wrappers (port from CAMP)
    maps/                             # MapLibre GL components
    ui/                               # Shared UI (Badge, DataTable, etc.)
    layout/                           # Nav, Footer
  lib/
    db.ts                             # Prisma client singleton
scripts/
  lib/
    db.ts                             # Prisma client for scripts (with dotenv)
  scrapers/                           # Government data scrapers
  seed/                               # Database seed scripts
data/
  concentration/                      # Structured JSON data files (CAMP pattern)
  raw/                                # Raw scraped data (gitignored if large)
prisma/
  schema.prisma
  migrations/
```

## Patterns to Reuse from CAMP

### Concentration charts
Port these components, adapting for NY geography:
- `ConcentrationTimeSeries` — recharts line chart for HHI/CR4 over time
- `MarketShareChart` — recharts bar chart for company market shares
- `ConcentrationSection` — tab switching between HHI and market share views

Key recharts gotchas:
- Don't type-annotate the Tooltip `value` parameter — use `(value) => Number(value)`
- Add `key={uniqueId}` to chart container divs when switching datasets via tabs
- recharts v3.7.0+ uses the new API

### Seed scripts
Follow CAMP's pattern:
- `--dry-run` flag for preview
- `findFirst` + conditional `create`/`update` for idempotent seeding (not `upsert` with nullable fields)
- Read data from `data/` JSON files, not hardcoded arrays
- Log counts at the end
- Use `scripts/lib/db.ts` with dotenv for Prisma client

### Data files
Follow the JSON file convention from `data/concentration/`:
- Per-sector timeseries: `{ sector, naicsCode, geography, source, years: [{ year, hhi, cr4 }] }`
- Per-sector-year market shares: `{ sector, naicsCode, year, geography, marketShares: [{ company, share, source }], hhi, cr4, hhiSource, cr4Source, notes }`
- Every data point must cite its government source

### Page patterns
- `export const dynamic = "force-dynamic"` for pages that query the database
- White card panels, consistent heading hierarchy
- Breadcrumb navigation back to parent section

## Starting Scope: Housing + Broadband

Per PROJECT.md, start with modules 1 and 3.

### Module 1: Housing — "The New Landlords"

**Data pipeline:**
1. ACRIS bulk download (NYC Open Data, Socrata API) — property transfers, ownership records
2. PLUTO (Primary Land Use Tax Lot Output) — parcel-level land use, building class, units
3. HPD violations and complaints — housing quality by building
4. LLC entity resolution — group LLCs by beneficial owner using Local Law 18 filings
5. Seed `PropertyOwnership` and `Entity` tables

**First visualizations:**
- Top landlords by unit count (bar chart)
- Ownership concentration by neighborhood (choropleth map)
- HPD violations per unit by owner size (scatter plot)

### Module 3: Broadband — "One Wire"

**Data pipeline:**
1. FCC Broadband Data Collection API — ISP availability at census block level
2. Filter to NY State, parse technology codes and speed tiers
3. Calculate choice count at 100+ Mbps per census block
4. Seed `BroadbandCoverage` table

**First visualizations:**
- ISP competition map (MapLibre choropleth: 0, 1, 2, 3+ providers per block)
- NYC borough breakdown: Spectrum vs Optimum vs FiOS coverage
- Upstate zero/one provider areas
- Price per Mbps comparison table

## Government Data Scraping

### API-first sources (use directly)
- **NYC Open Data** — Socrata API, get an app token for higher rate limits (1,000 req/hr). Base URL pattern: `https://data.cityofnewyork.us/resource/{dataset-id}.json`
- **FCC BDC** — REST API for broadband availability data
- **FDIC** — Summary of Deposits API for bank market share
- **CMS** — Hospital Price Transparency bulk downloads

### Scrape-required sources
- **NYS DOH CON filings** — HTML scraping needed (use cheerio, already a CAMP dependency)
- **NY AG press releases** — scrape enforcement action announcements
- **NYS PSC rate cases** — scrape docket filings

### Scraping rules
- Always scrape the government source directly, never private aggregators (Westlaw, Lexis, Justia, Statista)
- Store raw responses in `data/raw/` with timestamps
- Rate limit requests (1-2 second delays)
- Include User-Agent header identifying the project
- See PROJECT.md "Legal Framework" section — government data is public domain (federal) or permissively licensed (NYS/NYC)

## Deployment

- **Vercel** for hosting (same as CAMP)
- **Supabase** for PostgreSQL + PostGIS
- Set `DATABASE_URL` in Vercel environment variables
- The `prisma generate` step must handle missing `DATABASE_URL` gracefully during build (see CAMP's approach: the build script runs `prisma generate` which only needs the schema, not a live DB connection)

## Shared Architecture: @masoo/shared

Fair Markets NY is one of two data platforms built by Masoo (the other is CAMP, for Canadian competition policy). Both will eventually live in an npm workspaces monorepo (`~/Projects/masoo/`) with a shared package `@masoo/shared` that extracts the common domain model.

The full architecture plan is at `/Users/masuga/Projects/policy-map/policy-map-architecture-plan.md`. The business context is at `/Users/masuga/Projects/policy-map/Masoo Market Positioning Summary.md`.

### Domain model (the "policy map")

The shared ontology has four layers, defined in YAML and enforced via Zod schemas:

- **Sectors** — NAICS-coded policy areas (housing, broadband, healthcare, insurance, etc.)
- **Entities** — companies, landlords, health systems, ISPs, PE firms, universities, LLCs
- **Geographies** — hierarchical: country > state > county > city, and state > borough > NTA > census tract
- **Concentration metrics** — HHI, CR4, market share, plus domain-specific metrics (violations/unit, rent burden %, stabilized share, eviction filings/unit)

### What this means for FM-NY development

When adding new data dimensions, entity types, or metrics to Fair Markets NY, consider whether they belong in the shared model:

- **New entity types** (e.g., universities as property owners) should use canonical naming and be documented so they can later be added to `@masoo/shared/types/entity.ts`
- **New metrics** (e.g., HPD violations/unit, eviction filings/unit) should follow the concentration.yaml pattern: id, canonical name, range, unit, thresholds
- **New sectors** should reference NAICS codes and match the sector YAML hierarchy
- **Geography types** should fit the existing hierarchy (NTA, borough, county, etc.)

GitHub issues tagged `domain model` advance this shared ontology. Issues tagged `new metric` or `new entity type` introduce data shapes that will need representation in the YAML definitions and Zod schemas when `@masoo/shared` is built.

### Design constraints from the architecture plan

- No shared Prisma schema — each project keeps its own `schema.prisma`; shared types are the semantic layer
- Chart components will become theme-agnostic wrappers accepting a `ChartTheme` prop (FM-NY's Okabe-Ito palette, CAMP's red/navy palette)
- FM-NY will upgrade to Next.js 16 before the monorepo move
- Project-specific code (choropleth maps, housing-charts.tsx, PostGIS queries) stays in FM-NY

## Commit Conventions

- Do not include `Co-Authored-By: Claude` in commit messages
- Write concise commit messages focused on the "why"
- Use conventional commit style when appropriate (feat:, fix:, docs:, etc.)
