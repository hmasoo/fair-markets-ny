# Claude Instructions for Fair Markets NY

Read PROJECT.md first — it contains the full project vision, thematic research areas, data sources, tech stack, legal framework, and prior art.

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

## Commit Conventions

- Do not include `Co-Authored-By: Claude` in commit messages
- Write concise commit messages focused on the "why"
- Use conventional commit style when appropriate (feat:, fix:, docs:, etc.)
