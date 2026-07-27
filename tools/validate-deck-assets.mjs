import { readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
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
  sharedFrameSource: join(
    projectRoot,
    "assets/tarot-card-style/shared/front-frame-overlay.png"
  ),
  sharedCardBackSource: join(
    projectRoot,
    "assets/tarot-card-style/shared/card-back.png"
  ),
  sharedFrameRuntime: join(
    projectRoot,
    "apps/miniprogram/assets/cards/front-frame-overlay.png"
  ),
  cardSpecs: join(
    projectRoot,
    "deliverables/style-a-minor-arcana-generation-kit/card-specs.json"
  ),
  generationReport: join(
    projectRoot,
    "assets/tarot-card-style/minor-arcana/generation-report.md"
  ),
  tarotCardFace: join(
    projectRoot,
    "apps/miniprogram/components/tarot-card-face"
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

const readPngMetadata = (filename) => {
  const buffer = readFileSync(filename);
  const signature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== signature) {
    fail(`Not a PNG file: ${filename}`);
  }
  if (buffer.subarray(12, 16).toString("ascii") !== "IHDR") {
    fail(`PNG is missing its IHDR header: ${filename}`);
  }
  const colorType = buffer[25];
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    hasAlpha: colorType === 4 || colorType === 6,
  };
};

const sha256 = (filename) =>
  createHash("sha256").update(readFileSync(filename)).digest("hex").toUpperCase();

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

const cardPresentationConsumers = [
  "pages/home/index",
  "components/card-preview/index",
  "packages/deck/pages/ritual/index",
  "packages/deck/pages/result/index",
  "packages/deck/pages/history/index",
  "packages/deck/pages/collection/index",
];

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
for (const card of specs.cards) {
  if (card.roman !== minorRankMarks[card.rank]) {
    fail(
      `${card.id} must use its suit rank ${minorRankMarks[card.rank]} as the face mark; found ${card.roman}.`
    );
  }
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

const canonicalSharedAssets = [
  {
    filename: paths.sharedFrameSource,
    hash: "04A5700E1ED8B37D9E509C263B5B82534A23BC6657A4F65F74280C5CCBF56C7A",
    requiresAlpha: true,
  },
  {
    filename: paths.sharedCardBackSource,
    hash: "C792C762986BF5EEB6568E434C4D12748187D07F7943FDA3319D45C6AB251A5B",
    requiresAlpha: false,
  },
];
for (const asset of canonicalSharedAssets) {
  const metadata = readPngMetadata(asset.filename);
  if (metadata.width !== 1024 || metadata.height !== 1536) {
    fail(`Canonical shared asset must be 1024x1536: ${asset.filename}.`);
  }
  if (asset.requiresAlpha && !metadata.hasAlpha) {
    fail(`Canonical shared frame must preserve transparency: ${asset.filename}.`);
  }
  if (sha256(asset.filename) !== asset.hash) {
    fail(`Canonical shared asset hash changed unexpectedly: ${asset.filename}.`);
  }
}
const runtimeFrameMetadata = readPngMetadata(paths.sharedFrameRuntime);
if (
  runtimeFrameMetadata.width !== 384 ||
  runtimeFrameMetadata.height !== 576 ||
  !runtimeFrameMetadata.hasAlpha
) {
  fail("Runtime shared frame must be a transparent 384x576 PNG.");
}

for (const suit of ["wands", "cups", "swords", "pentacles"]) {
  const sheet = `${suit}.jpg`;
  if (!listJpegs(paths.contactSheets).includes(sheet)) {
    fail(`Missing ${sheet} contact sheet.`);
  }
}
statSync(paths.generationReport);

const cardFaceWxml = readFileSync(join(paths.tarotCardFace, "index.wxml"), "utf8");
const cardFaceWxss = readFileSync(join(paths.tarotCardFace, "index.wxss"), "utf8");
for (const requiredMarkup of [
  "arcana === 'minor'",
  'class="frame-overlay"',
  'src="/assets/cards/front-frame-overlay.png"',
  'class="frame-rank"',
  'class="frame-title"',
  "{{topMark}}",
  "{{name}}",
  "{{englishName}}",
]) {
  if (!cardFaceWxml.includes(requiredMarkup)) {
    fail(`Tarot card face is missing required markup: ${requiredMarkup}.`);
  }
}
for (const requiredStyle of [
  ".frame-overlay",
  ".frame-rank",
  ".frame-title",
  ".frame-name",
  ".frame-english",
  ".tarot-face.is-reversed",
]) {
  if (!cardFaceWxss.includes(requiredStyle)) {
    fail(`Tarot card face is missing required style: ${requiredStyle}.`);
  }
}
for (const consumer of cardPresentationConsumers) {
  const wxml = readFileSync(join(paths.appRoot, `${consumer}.wxml`), "utf8");
  const config = JSON.parse(
    readFileSync(join(paths.appRoot, `${consumer}.json`), "utf8")
  );
  if (!wxml.includes("<tarot-card-face")) {
    fail(`${consumer}.wxml does not use the shared tarot-card-face component.`);
  }
  if (!wxml.includes('top-mark="{{')) {
    fail(`${consumer}.wxml does not pass the card face mark to tarot-card-face.`);
  }
  if (
    config.usingComponents?.["tarot-card-face"] !==
    "/components/tarot-card-face/index"
  ) {
    fail(`${consumer}.json does not register tarot-card-face.`);
  }
}

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
    "Shared assets: canonical 1024x1536 frame/back verified; transparent runtime frame is 384x576.",
    `Card presentation: canonical frame and identity layer registered in ${cardPresentationConsumers.length} consumers.`,
  ].join("\n")
);
