import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, "apps/miniprogram/core/minor-cards.ts");
const outputPath = path.join(
  projectRoot,
  "deliverables/style-a-minor-arcana-generation-kit/card-specs.json",
);

const sourceText = fs.readFileSync(sourcePath, "utf8");

function stringField(entry, field) {
  const match = entry.match(new RegExp(`${field}:\\s*"([^"]+)"`));
  if (!match) throw new Error(`Missing ${field} in ${entry.slice(0, 80)}`);
  return match[1];
}

function numberField(entry, field) {
  const match = entry.match(new RegExp(`${field}:\\s*(\\d+)`));
  if (!match) throw new Error(`Missing ${field} in ${entry.slice(0, 80)}`);
  return Number(match[1]);
}

function arrayField(entry, field) {
  const match = entry.match(new RegExp(`${field}:\\s*\\[([^\\]]+)\\]`));
  if (!match) throw new Error(`Missing ${field} in ${entry.slice(0, 80)}`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

const entries = [...sourceText.matchAll(/\{\s*id:\s*"minor-[\s\S]*?\n\s*\},/g)].map((match) => match[0]);
const cards = entries.map((entry) => {
  const id = stringField(entry, "id");
  return {
    id,
    filename: `${id}.jpg`,
    sequence: numberField(entry, "sequence"),
    roman: stringField(entry, "roman"),
    name: stringField(entry, "name"),
    englishName: stringField(entry, "englishName"),
    suit: stringField(entry, "suit"),
    rank: stringField(entry, "rank"),
    keywords: arrayField(entry, "keywords"),
    promptSection: `CARD_PROMPTS.md#${id}`,
  };
});

const suits = ["wands", "cups", "swords", "pentacles"];
const minorRankMarks = {
  ace: "A",
  two: "II",
  three: "III",
  four: "IV",
  five: "V",
  six: "VI",
  seven: "VII",
  eight: "VIII",
  nine: "IX",
  ten: "X",
  page: "PAGE",
  knight: "KNIGHT",
  queen: "QUEEN",
  king: "KING",
};
if (cards.length !== 56) throw new Error(`Expected 56 minor cards, received ${cards.length}`);
if (new Set(cards.map((card) => card.id)).size !== 56) throw new Error("Duplicate minor card id");
if (new Set(cards.map((card) => card.sequence)).size !== 56) throw new Error("Duplicate sequence");
for (const card of cards) {
  if (card.roman !== minorRankMarks[card.rank]) {
    throw new Error(
      `${card.id} must use its suit rank ${minorRankMarks[card.rank]} as the face mark, received ${card.roman}`,
    );
  }
}
for (const suit of suits) {
  if (cards.filter((card) => card.suit === suit).length !== 14) {
    throw new Error(`Suit ${suit} does not contain 14 cards`);
  }
}

const output = {
  schemaVersion: "1.0.0",
  deckVersion: "complete-78",
  source: "apps/miniprogram/core/minor-cards.ts",
  styleContract: "STYLE_A_MINOR_MASTER_PROMPT.md",
  cardPromptContract: "CARD_PROMPTS.md",
  cards,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${cards.length} cards to ${path.relative(projectRoot, outputPath)}`);
