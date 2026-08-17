import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localConfigs = [
  ["project.config.example.json", "project.config.json"],
  ["apps/miniprogram/config/cloud.example.ts", "apps/miniprogram/config/cloud.ts"],
];

for (const [examplePath, localPath] of localConfigs) {
  const source = resolve(repositoryRoot, examplePath);
  const target = resolve(repositoryRoot, localPath);
  if (existsSync(target)) continue;
  copyFileSync(source, target);
  console.log(`Created local config: ${localPath}`);
}
