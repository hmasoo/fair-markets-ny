import { prisma } from "../lib/db";
import { readFileSync } from "fs";
import { join } from "path";

const DRY_RUN = process.argv.includes("--dry-run");

interface YearData {
  year: number;
  hhi: number;
  cr4: number;
}

interface MarketShareEntry {
  company: string;
  share: number;
  source: string;
}

interface TimeSeriesFile {
  sector: string;
  naicsCode: string;
  geography: string;
  source: string;
  years: YearData[];
}

interface MarketShareFile {
  sector: string;
  naicsCode: string;
  year: number;
  geography: string;
  marketShares: MarketShareEntry[];
  hhi: number;
  cr4: number;
  hhiSource: string;
  cr4Source: string;
}

function readJson<T>(relativePath: string): T {
  const fullPath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(fullPath, "utf-8"));
}

async function main() {
  console.log(`Housing seed ${DRY_RUN ? "(DRY RUN)" : ""}`);

  const timeSeries = readJson<TimeSeriesFile>(
    "data/concentration/housing-nyc.json"
  );
  const marketShares = readJson<MarketShareFile>(
    "data/concentration/housing-nyc-market-shares.json"
  );

  // Ensure sector exists
  const existingSector = await prisma.sector.findFirst({
    where: { slug: "housing" },
  });

  if (DRY_RUN) {
    console.log(`Sector "housing": ${existingSector ? "exists" : "would create"}`);
    console.log(`Time series years to seed: ${timeSeries.years.length}`);
    console.log(
      `Market share entries to seed: ${marketShares.marketShares.length}`
    );
    console.log("Dry run complete.");
    return;
  }

  let sector = existingSector;
  if (!sector) {
    sector = await prisma.sector.create({
      data: {
        name: timeSeries.sector,
        slug: "housing",
        naicsCode: timeSeries.naicsCode,
        description:
          "Residential rental housing ownership and landlord concentration",
      },
    });
  }

  // Ensure geography exists
  let geography = await prisma.geography.findFirst({
    where: { slug: "nyc" },
  });
  if (!geography) {
    geography = await prisma.geography.create({
      data: {
        name: "New York City",
        slug: "nyc",
        type: "CITY",
        fipsCode: "3651000",
      },
    });
  }

  // Seed time series concentration data
  let created = 0;
  let updated = 0;

  for (const yearData of timeSeries.years) {
    const existing = await prisma.concentrationData.findFirst({
      where: {
        sectorId: sector.id,
        geographyId: geography.id,
        year: yearData.year,
        entityId: null,
      },
    });

    if (existing) {
      await prisma.concentrationData.update({
        where: { id: existing.id },
        data: {
          hhi: yearData.hhi,
          cr4: yearData.cr4,
          source: timeSeries.source,
        },
      });
      updated++;
    } else {
      await prisma.concentrationData.create({
        data: {
          sectorId: sector.id,
          geographyId: geography.id,
          year: yearData.year,
          hhi: yearData.hhi,
          cr4: yearData.cr4,
          source: timeSeries.source,
        },
      });
      created++;
    }
  }

  // Seed market share data (per-entity)
  let entityCreated = 0;
  let shareCreated = 0;

  for (const entry of marketShares.marketShares) {
    if (entry.company === "All other landlords") continue;

    const slug = entry.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let entity = await prisma.entity.findFirst({
      where: { slug },
    });
    if (!entity) {
      entity = await prisma.entity.create({
        data: {
          name: entry.company,
          slug,
          type: "LANDLORD",
          aliases: [],
        },
      });
      entityCreated++;
    }

    const existingShare = await prisma.concentrationData.findFirst({
      where: {
        sectorId: sector.id,
        geographyId: geography.id,
        year: marketShares.year,
        entityId: entity.id,
      },
    });

    if (!existingShare) {
      await prisma.concentrationData.create({
        data: {
          sectorId: sector.id,
          geographyId: geography.id,
          year: marketShares.year,
          entityId: entity.id,
          marketShare: entry.share,
          source: entry.source,
        },
      });
      shareCreated++;
    }
  }

  console.log(`Concentration data: ${created} created, ${updated} updated`);
  console.log(`Entities: ${entityCreated} created`);
  console.log(`Market shares: ${shareCreated} created`);
  console.log("Housing seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
