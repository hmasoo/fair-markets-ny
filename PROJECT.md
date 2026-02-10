# Fair Markets NY

A public-interest data site tracking market concentration, corporate consolidation, and their impact on affordability across New York State, with a deep NYC layer.

## Why This Project

New York has two converging political agendas that both need data infrastructure:

**Mayor Zohran Mamdani** (NYC) — an explicitly anti-monopoly administration. Lina Khan co-chaired his transition team. He's proposed public grocery stores, a city-owned broadband network, an algorithmic pricing watchdog, and a crackdown on PE landlords. His framing: "for the people, not for Wall Street."

**Governor Kathy Hochul** (NYS) — a targeted affordability agenda. She signed the nation's first algorithmic rent-setting ban (targeting RealPage), created the first PBM watchdog bureau, expanded hospital merger oversight, committed $1B to public broadband (ConnectALL), and proposed auto insurance reform. Her framing: "Money in Your Pockets."

Both are responding to the same underlying problem — concentrated corporate power driving up the cost of living — but from different ideological positions. Fair Markets NY provides the shared evidence base.

Intellectually, the project draws from the "New Brandeis" school of antitrust thinking: Lina Khan (Amazon's Antitrust Paradox, FTC chair 2021-2025, Mamdani transition co-chair), Matt Stoller (Goliath, BIG newsletter), and Alvaro Bedoya (FTC commissioner, surveillance pricing). It also draws from the institutional work of the Open Markets Institute and the American Economic Liberties Project.

The project model combines two approaches: **CAMP** (Canadian Anti-Monopoly Project) for structured concentration data, sector-by-sector HHI/CR4 tracking, and methodology-transparent market share analysis; and **NLRB Edge / NLRB Research** (Matt Bruenig) for the automated government data scraping + searchable database + analysis pattern. Bruenig built a free, public database of 90,000+ NLRB legal documents that auto-updates by scraping government sources, paired with a newsletter providing context and commentary. That model — automated ingestion of public government data into a structured, searchable tool, paired with editorial analysis — is exactly what NY's fragmented public data landscape needs. CON filings, DFS market share reports, AG enforcement actions, PSC rate cases, and FCC broadband data all exist but are scattered, poorly indexed, and not queryable in useful ways.

## Thematic Research Areas

### Tier 1 — Active policy fights where data changes outcomes

#### 1. "The New Landlords" — Housing & Landlord Concentration
Both leaders' top priority. Mamdani: rent freeze, PE landlord crackdown, Cea Weaver running tenant protection. Hochul: algorithmic rent-setting ban, 75-day institutional investor waiting period.

**Data work:**
- ACRIS + HPD: Map residential landlord concentration by neighborhood. Entity-resolve LLCs using Local Law 18 beneficial ownership filings. Rank landlords by total units controlled.
- Correlate ownership concentration with HPD violation rates, eviction filings, and rent increases in stabilized units (DHCR data).
- Track institutional/PE acquisitions of NY residential property over time.
- Upstate: Mobile home park ownership concentration. Map against lot rent increases.
- Algorithmic rent-setting: Identify properties using RealPage/Yardi revenue management (DOJ lawsuit filings as starting point).

#### 2. "Your Doctor's Boss" — Healthcare Consolidation
Hochul expanding hospital merger oversight (60-day CON review, ongoing impact reporting), created nation's first PBM watchdog at DFS. NY AG has blocked multiple hospital mergers. Mamdani supports single-payer and public hospital investment.

**Data work:**
- Map every hospital, urgent care, and physician practice in NY by parent health system (NYS DOH + CMS provider enrollment).
- CON filing tracker: Scrape NYS DOH Certificate of Need applications. Track proposed mergers, approvals, conditions, post-merger outcomes.
- Hospital pricing: CMS price transparency data for NY hospitals. Compare consolidated systems vs. independents.
- PBM concentration: NYS DFS complaints + vertical integration mapping (CVS Caremark/Aetna, Express Scripts/Cigna, OptumRx/UnitedHealth).
- PE in healthcare: Track acquisitions of physician practices by PE-backed platforms using NYS licensing data.
- Upstate hospital monopolies: Map single-system counties against access metrics (ER wait times, OB/GYN closures).

#### 3. "One Wire" — Broadband & Utility Monopolies
Hochul: $1B ConnectALL with public-ownership model. Mamdani: city-owned broadband. Both frame broadband as a utility.

**Data work:**
- FCC Broadband Data Collection: ISP competition at census block level across NY State. Real choices at 100+ Mbps per household.
- NYC borough-by-borough breakdown: Spectrum vs. Optimum vs. Verizon FiOS. The "FiOS line."
- Upstate: Zero/one provider areas. Overlay with ConnectALL investment map.
- Price per Mbps comparison: NY vs. cities with municipal broadband.
- NYS PSC rate case data: Utility rate increases, executive compensation audits.

#### 4. "Platform Tax" — Delivery Apps, Rideshare & Algorithmic Pricing
Mamdani: algorithmic pricing watchdog (DCWP pilot), Digital Fairness Act, delivery app licensure. Hochul: signed consumer protection reforms, vetoed grocery delivery price transparency.

**Data work:**
- NYC TLC trip data: Uber/Lyft market share vs. yellow/green taxis, 2013-present.
- Delivery app market share: DoorDash, Uber Eats, Grubhub in NYC.
- Surge/dynamic pricing analysis using TLC data.
- Cumulative "platform toll" on small restaurants (delivery + booking + review + payment processing fees as % of revenue).

### Tier 2 — Important, less politically urgent

#### 5. "Aisle by Aisle" — Grocery Access & Concentration
Mamdani's public grocery store proposal (one per borough). Hochul's $10M Food Access Expansion Grants.

**Data work:**
- Grocery store ownership by parent company across NYC (DCA licensing + USDA food desert overlay).
- Upstate: Tops Markets closures after C&S Wholesale/PE acquisition.
- Bodega ecosystem mapping.

#### 6. "After the Merger" — AG & State Enforcement Tracker
NY AG Letitia James among the most active antitrust enforcers nationally. Donnelly Act strengthened 2021. 21st Century Antitrust Act introduced four times, unsigned.

**Data work:**
- AG antitrust case database from press releases and court filings.
- Post-merger outcome tracking (hospital, bank, pharmacy mergers).
- 21st Century Antitrust Act status.

#### 7. "Who Insures You" — Insurance Market Concentration
Hochul's 2026 auto insurance reform priority ($4,030/year vs. $2,680 national average). PBM bureau. Home insurance profit caps.

**Data work:**
- NYS DFS market share by line and county.
- ACA exchange competition by county.
- Insurer-PBM-provider vertical integration visualization.

#### 8. "Who Owns Your Block" — Commercial Real Estate & Small Business
Mamdani's "Mom-and-Pop Czar", halving fines, 500% increase in 1:1 support.

**Data work:**
- PLUTO + ACRIS: Commercial ownership concentration by corridor.
- Vacant storefront tracking vs. ownership concentration.

### Tier 3 — Background structural research

#### 9. "Follow the Money" — Corporate Ownership & PE Tracker
NYC is the global capital of PE. Blackstone, KKR, Apollo, Carlyle, Ares all headquartered here.

**Data work:**
- PE portfolio tracker (NY focus): firms to portfolio companies in healthcare, housing, retail.
- Common ownership visualizer: BlackRock/Vanguard/State Street overlapping stakes.
- LLC beneficial ownership chains.

#### 10. "News Desert" — Local Media Concentration
NY has lost dozens of local papers. Alden Capital owns many remaining ones.

**Data work:**
- Map remaining outlets against population.
- Track hedge fund/PE ownership of NY local media.

## Data Sources

| Source | Provides |
|---|---|
| NYC Open Data (ACRIS, PLUTO, HPD, TLC, DCA) | Property ownership, violations, taxi trips, business licenses |
| NYC Local Law 18 filings | LLC beneficial ownership for residential buildings |
| NYC DHCR | Rent stabilization rolls, rent increase history |
| NYS DOH (SPARCS, CON, facility data) | Hospital pricing, utilization, merger approvals |
| NYS DFS | Insurance/banking market share, PBM complaints, rate filings |
| NYS PSC | Utility rate cases, broadband, service territories |
| NY AG press releases / court filings | Antitrust enforcement actions |
| FCC Broadband Data Collection | ISP availability by census block |
| FDIC Summary of Deposits | Bank market share by county |
| CMS Hospital Price Transparency | Hospital procedure pricing |
| CMS Provider Enrollment | Practice ownership, health system affiliations |
| BLS CPI (NY metro) | Local price indices |
| USDA Food Access Research Atlas | Food desert designations |
| SEC EDGAR | Public company filings |
| NYS Open Data | State contracts, broadband maps |

## Tech Stack

- **Next.js + Prisma + PostgreSQL + PostGIS** — proven foundation from CAMP, spatial extensions for property/broadband/health facility maps
- **MapLibre GL** — open-source map rendering for NYC/NYS geographic layers
- **Recharts** — reuse HHI/CR4 timeseries components from CAMP
- **D3 force graphs** — corporate ownership/PE portfolio visualizations
- **API integrations** — NYC Open Data (Socrata API), FCC BDC, FDIC, CMS

## Prior Art & Inspiration

**Direct models:**
- [CAMP (Canadian Anti-Monopoly Project)](https://github.com/hmasoo/camp) — the direct predecessor; same tech stack, concentration tracking methodology, sector-by-sector HHI/CR4 with sourced JSON data files and a methodology page
- [NLRB Edge](https://www.nlrbedge.com/) + [NLRB Research](https://nlrbresearch.com/) (Matt Bruenig) — the model for automated government data scraping + searchable database + analysis. 90,000+ NLRB documents, auto-updated, free, more comprehensive than Westlaw/Lexis. Demonstrates that one person with scraping infrastructure can build a more useful research tool than the government itself provides. The newsletter layer (commentary, analysis, context) drives the audience; the database is the durable public good.

**Intellectual foundations:**
- [Open Markets Institute](https://www.openmarketsinstitute.org/) — research and policy advocacy on monopoly power
- [American Economic Liberties Project](https://www.economicliberties.us/) — corporate power and its impact on everyday life
- [Matt Stoller's BIG newsletter](https://www.thebignewsletter.com/) — monopoly analysis, PE tracking, political economy
- [Anti-Monopoly Fund](https://www.antimonopolyfund.org/) — funding ecosystem for anti-monopoly work

**NYC-specific tools:**
- [WHO OWNS WHAT in NYC](https://whoownswhat.justfix.org/) — JustFix's landlord lookup tool (LLC entity resolution model for housing data)
- [NYC Planning ZoLa](https://zola.planning.nyc.gov/) — zoning and land use map, demonstrates what good NYC spatial data presentation looks like

**Sector-specific precedents:**
- [Cleared for take-off (Competition Bureau Canada)](https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/publications/cleared-take-elevating-airline-competition) — model for sector-specific market study data presentation
- [BroadbandNow](https://broadbandnow.com/) — ISP competition maps by address, shows how to present FCC data accessibly

## Legal Framework for Government Data

This project aggregates, structures, and republishes data from government sources. The legal basis is strong across all three tiers of government we draw from.

### Federal government data (public domain)

**17 USC § 105** places all works of the United States Government in the public domain: "Copyright protection under this title is not available for any work of the United States Government." This covers every federal data source we use: FCC Broadband Data Collection, FDIC Summary of Deposits, CMS hospital pricing and provider enrollment, SEC EDGAR filings, BLS price indices, and USDA food access data. No license, attribution, or permission is required. These are public domain works that belong to the American people.

### New York State government data (permissive license)

Unlike federal works, state government works are not automatically public domain under 17 USC § 105 — that statute only covers "works of the United States Government." However, New York State has adopted a permissive open data license for data published through its Open NY portal: so long as you are not doing anything malicious with NYS data, you may use it as you wish. No attribution or share-alike requirements, no prohibition on commercial use. This covers NYS DOH facility data, DFS market share reports, PSC rate case filings, and AG press releases published through state channels.

For state government records not on the open data portal, NY's Freedom of Information Law (FOIL, Article 6 of the Public Officers Law) requires agencies to make records available for public inspection and copying. New York courts have held that "routine administrative collection and compilation of government records does not create a copyright interest in the resulting data set."

### New York City government data (unrestricted)

NYC Open Data is governed by Local Law 11 of 2012, which requires all public datasets to be published on the Open Data portal. The city's FAQ states explicitly: **"There are no restrictions on the use of open data"** published through the portal. This covers ACRIS property records, PLUTO land use data, HPD violations, TLC trip data, DCA business licenses, and DHCR rent stabilization data. The Socrata API provides programmatic access with application tokens for higher rate limits (1,000 requests/hour).

### Practical lessons from NLRB Research (Bruenig model)

Matt Bruenig's NLRB Research database (115,000+ documents) includes no legal disclaimers, terms of use, or fair use framing. He treats government documents as inherently public and builds automated scrapers to ingest them. His practical experience offers two lessons:

1. **Government agency websites are fair game; private aggregators are not.** When Justia (a private legal research site) blocked Bruenig's scraping, he couldn't fight it — Justia owns its presentation layer even if the underlying government documents are public domain. He switched to the Court Listener API (run by the Free Law Project, a 501(c)(3) nonprofit that provides open access to legal data). Lesson: always scrape the government source directly, or use an open API. Never depend on a private intermediary's goodwill.

2. **Just do it.** Bruenig doesn't ask permission, doesn't include legal disclaimers, doesn't retain counsel for the database. Federal government documents are public domain. State/local open data portals have permissive licenses. The legal risk of aggregating and republishing government data is effectively zero if you're not misrepresenting the data or violating a specific API's terms of service.

### Our approach

- Prefer official government APIs and open data portals (NYC Open Data Socrata API, FCC BDC API, FDIC API, CMS downloads) over scraping.
- For data not available via API (NYS DOH CON filings, AG press releases, PSC rate cases), scrape the government agency website directly.
- Never scrape private aggregators (Westlaw, Lexis, Justia, Statista) — they have copyright over their presentation even if the underlying data is public.
- Store raw source documents alongside structured data so provenance is always traceable.
- Cite the original government source for every data point.
- No legal disclaimers needed for republishing government data, but include a methodology page (following CAMP's model) explaining data sources, collection methods, and limitations.

## Suggested Starting Scope

Start with modules 1 and 3 (housing + broadband) because:
- Both have excellent public data (ACRIS/HPD/DHCR for housing, FCC BDC for broadband)
- Both are active policy priorities for both Mamdani and Hochul
- Housing landlord concentration is a uniquely NYC story with national relevance
- Broadband maps are visually compelling and immediately understandable
- Both can reuse CAMP's concentration chart components
