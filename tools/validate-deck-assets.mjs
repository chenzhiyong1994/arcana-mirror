import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const twoMebibytes = 2 * 1024 * 1024;

const paths = {
  appRoot: join(projectRoot, "apps/miniprogram"),
  mainCards: join(projectRoot, "apps/miniprogram/assets/cards"),
  thumbnails: join(projectRoot, "apps/miniprogram/assets/card-thumbs"),
  deckPackage: join(projectRoot, "apps/miniprogram/packages/deck"),
  deckCards: join(projectRoot, "apps/miniprogram/packages/deck/assets/cards"),
  minorSources: join(
    projectRoot,
    "assets/tarot-card-style/minor-arcana/faces"
  ),
  contactSheets: join(
    projectRoot,
    "assets/tarot-card-style/minor-arcana/contact-sheets"
  ),
  cardSpecs: join(
    projectRoot,
    "deliverables/style-a-minor-arcana-generation-kit/card-specs.json"
  ),
  generationReport: join(
    projectRoot,
    "assets/tarot-card-style/minor-arcana/generation-report.md"
  ),
};

const fail = (message) => {
  throw new Error(message);
};

const listJpegs = (directory) =>
  readdirSync(directory)
    .filter((filename) => filename.endsWith(".jpg"))
    .sort();

const directoryBytes = (directory, excludedDirectory = "") =>
  readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirectory && resolve(entryPath) === resolve(excludedDirectory)) {
        return total;
      }
      return total + directoryBytes(entryPath, excludedDirectory);
    }
    return total + statSync(entryPath).size;
  }, 0);

const readJpegSize = (filename) => {
  const buffer = readFileSync(filename);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    fail(`Not a JPEG file: ${filename}`);
  }

  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = buffer.readUInt16BE(offset);
    if (
      [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
        marker
      )
    ) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  fail(`Could not read JPEG dimensions: ${filename}`);
};

const assertDimensions = (directory, filenames, width, height) => {
  for (const filename of filenames) {
    const dimensions = readJpegSize(join(directory, filename));
    if (dimensions.width !== width || dimensions.height !== height) {
      fail(
        `${filename} must be ${width}x${height}; found ${dimensions.width}x${dimensions.height}.`
      );
    }
  }
};

const specs = JSON.parse(readFileSync(paths.cardSpecs, "utf8"));
if (specs.schemaVersion !== "1.0.0" || specs.deckVersion !== "complete-78") {
  fail("Minor Arcana card specs use an unexpected schema or deck version.");
}
if (!Array.isArray(specs.cards) || specs.cards.length !== 56) {
  fail(`Expected 56 Minor Arcana specs; found ${specs.cards?.length ?? 0}.`);
}

const specFilenames = specs.cards.map((card) => card.filename).sort();
const uniqueIds = new Set(specs.cards.map((card) => card.id));
const uniqueSequences = new Set(specs.cards.map((card) => card.sequence));
if (uniqueIds.size !== 56 || uniqueSequences.size !== 56) {
  fail("Minor Arcana IDs and sequences must each be unique.");
}
for (const suit of ["wands", "cups", "swords", "pentacles"]) {
  const count = specs.cards.filter((card) => card.suit === suit).length;
  if (count !== 14) fail(`Expected 14 ${suit} cards; found ${count}.`);
}

const sourceFilenames = listJpegs(paths.minorSources);
if (JSON.stringify(sourceFilenames) !== JSON.stringify(specFilenames)) {
  fail("Formal Minor Arcana source files do not match card-specs.json.");
}
assertDimensions(paths.minorSources, sourceFilenames, 1024, 1536);

const deckFilenames = listJpegs(paths.deckCards);
const deckFaces = deckFilenames.filter((filename) => filename !== "card-back.jpg");
if (deckFilenames.length !== 79 || deckFaces.length !== 78) {
  fail(
    `Deck package must contain 78 faces plus one back; found ${deckFaces.length} faces and ${deckFilenames.length} JPEGs.`
  );
}
if (
  deckFaces.filter((filename) => filename.startsWith("major-")).length !== 22 ||
  deckFaces.filter((filename) => filename.startsWith("minor-")).length !== 56
) {
  fail("Deck package must contain 22 Major and 56 Minor Arcana faces.");
}
assertDimensions(paths.deckCards, deckFilenames, 384, 576);

const thumbnailFilenames = listJpegs(paths.thumbnails);
if (
  thumbnailFilenames.length !== 78 ||
  JSON.stringify(thumbnailFilenames) !== JSON.stringify(deckFaces)
) {
  fail("Main-package thumbnails must match all 78 deck faces exactly.");
}
assertDimensions(paths.thumbnails, thumbnailFilenames, 192, 288);

const legacyMainFaces = listJpegs(paths.mainCards).filter(
  (filename) => filename !== "card-back.jpg"
);
if (legacyMainFaces.length !== 0) {
  fail(`Found ${legacyMainFaces.length} duplicated faces in the main package.`);
}
assertDimensions(paths.mainCards, ["card-back.jpg"], 512, 768);

for (const suit of ["wands", "cups", "swords", "pentacles"]) {
  const sheet = `${suit}.jpg`;
  if (!listJpegs(paths.contactSheets).includes(sheet)) {
    fail(`Missing ${sheet} contact sheet.`);
  }
}
statSync(paths.generationReport);

const mainPackageBytes = directoryBytes(paths.appRoot, paths.deckPackage);
const deckPackageBytes = directoryBytes(paths.deckPackage);
if (mainPackageBytes >= twoMebibytes || deckPackageBytes >= twoMebibytes) {
  fail(
    `Package size limit exceeded: main=${mainPackageBytes}, deck=${deckPackageBytes}.`
  );
}

console.log(
  [
    "Deck asset validation passed.",
    `Formal sources: ${sourceFilenames.length} Minor Arcana faces at 1024x1536.`,
    `Deck package: ${deckFaces.length} faces + back at 384x576 (${deckPackageBytes} bytes).`,
    `Main package: ${thumbnailFilenames.length} thumbnails at 192x288 (${mainPackageBytes} bytes total excluding deck package).`,
  ].join("\n")
);
