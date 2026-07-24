import { existsSync, readdirSync, realpathSync, unlinkSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const mainCardsDirectory = realpathSync(
  join(projectRoot, "apps/miniprogram/assets/cards")
);
const deckCardsDirectory = realpathSync(
  join(projectRoot, "apps/miniprogram/packages/deck/assets/cards")
);
const thumbnailDirectory = realpathSync(
  join(projectRoot, "apps/miniprogram/assets/card-thumbs")
);

const assertInsideProject = (directory) => {
  const relativePath = relative(projectRoot, directory);
  if (
    relativePath === "" ||
    relativePath.startsWith("..") ||
    resolve(projectRoot, relativePath) !== directory
  ) {
    throw new Error(`Refusing to operate outside the project: ${directory}`);
  }
};

[mainCardsDirectory, deckCardsDirectory, thumbnailDirectory].forEach(
  assertInsideProject
);

const faceFiles = readdirSync(mainCardsDirectory)
  .filter((filename) => filename.endsWith(".jpg") && filename !== "card-back.jpg")
  .sort();

if (faceFiles.length === 0) {
  console.log("No legacy main-package card faces remain.");
  process.exit(0);
}

if (faceFiles.length !== 78) {
  throw new Error(
    `Expected exactly 78 legacy card faces, found ${faceFiles.length}.`
  );
}

for (const filename of faceFiles) {
  const sourcePath = join(mainCardsDirectory, filename);
  const deckPath = join(deckCardsDirectory, filename);
  const thumbnailPath = join(thumbnailDirectory, filename);

  if (
    basename(sourcePath) !== filename ||
    !existsSync(deckPath) ||
    !existsSync(thumbnailPath)
  ) {
    throw new Error(`Replacement assets are incomplete for ${filename}.`);
  }
}

for (const filename of faceFiles) {
  unlinkSync(join(mainCardsDirectory, filename));
}

console.log(
  `Removed ${faceFiles.length} duplicated main-package card faces after replacement verification.`
);
