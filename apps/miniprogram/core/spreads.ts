import type { Reading, SpreadPosition, SpreadType } from "./types";

export interface SpreadPositionDefinition {
  key: SpreadPosition;
  label: string;
  description: string;
}

const SINGLE_POSITIONS: readonly SpreadPositionDefinition[] = [
  { key: "focus", label: "核心牌", description: "照见此刻最值得留意的主题" },
];

const THREE_POSITIONS: readonly SpreadPositionDefinition[] = [
  { key: "situation", label: "现状", description: "目前已经形成的局面与感受" },
  { key: "influence", label: "关键影响", description: "正在推动、牵制或被忽略的因素" },
  { key: "action", label: "行动建议", description: "接下来可以尝试的现实小动作" },
];

export function getReadingSpread(reading: Reading): SpreadType {
  return reading.spread === "three" || reading.cards.length === 3 ? "three" : "single";
}

export function getSpreadPositions(spread: SpreadType): readonly SpreadPositionDefinition[] {
  return spread === "three" ? THREE_POSITIONS : SINGLE_POSITIONS;
}

export function getReadingPosition(reading: Reading, index: number): SpreadPositionDefinition {
  const positions = getSpreadPositions(getReadingSpread(reading));
  return positions[index] ?? positions[positions.length - 1];
}
