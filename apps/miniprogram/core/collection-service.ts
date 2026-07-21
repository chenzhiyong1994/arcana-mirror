import { getCard, getCardImagePath, TAROT_CARDS } from "./cards";
import { orientationLabel } from "./interpretation";
import type {
  CardCollectionRepository,
  CardDiscovery,
  Orientation,
} from "./types";

export interface CollectionServiceDependencies {
  repository: CardCollectionRepository;
  now?: () => Date;
}

export class CollectionService {
  private readonly now: () => Date;

  constructor(private readonly dependencies: CollectionServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date());
  }

  recordReveal(cardId: string, orientation: Orientation, revealedAt = this.now().toISOString()): CardDiscovery {
    getCard(cardId);
    const existing = this.dependencies.repository.list().find((item) => item.cardId === cardId);
    const discovery: CardDiscovery = existing
      ? {
        ...existing,
        lastRevealedAt: revealedAt,
        revealCount: existing.revealCount + 1,
        uprightSeen: existing.uprightSeen || orientation === "upright",
        reversedSeen: existing.reversedSeen || orientation === "reversed",
      }
      : {
        cardId,
        firstRevealedAt: revealedAt,
        lastRevealedAt: revealedAt,
        revealCount: 1,
        uprightSeen: orientation === "upright",
        reversedSeen: orientation === "reversed",
      };
    this.dependencies.repository.save(discovery);
    return discovery;
  }

  listCatalog() {
    const discoveries = new Map(this.dependencies.repository.list().map((item) => [item.cardId, item]));
    return TAROT_CARDS.map((card) => {
      const discovery = discoveries.get(card.id);
      const seenLabels = discovery
        ? [
          discovery.uprightSeen ? orientationLabel("upright") : "",
          discovery.reversedSeen ? orientationLabel("reversed") : "",
        ].filter(Boolean)
        : [];
      return {
        ...card,
        imagePath: getCardImagePath(card.id),
        discovered: Boolean(discovery),
        revealCount: discovery?.revealCount ?? 0,
        firstRevealedAt: discovery?.firstRevealedAt.slice(0, 10) ?? "",
        orientationProgress: seenLabels.join(" / "),
      };
    });
  }

  getProgress(): { discovered: number; total: number } {
    return { discovered: this.dependencies.repository.list().length, total: TAROT_CARDS.length };
  }

  clear(): void {
    this.dependencies.repository.clear();
  }
}
