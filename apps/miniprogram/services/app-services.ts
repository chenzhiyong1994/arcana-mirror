import { CollectionService } from "../core/collection-service";
import { ReadingService } from "../core/reading-service";
import { CloudBaseInterpretationProvider } from "../infra/cloudbase-interpretation-provider";
import { WxCardCollectionRepository } from "../infra/wx-card-collection-repository";
import { WxReadingRepository } from "../infra/wx-reading-repository";

export const localReadingRepository = new WxReadingRepository();
export const localCardCollectionRepository = new WxCardCollectionRepository();
export const readingService = new ReadingService({
  repository: localReadingRepository,
  provider: new CloudBaseInterpretationProvider(),
});
export const collectionService = new CollectionService({ repository: localCardCollectionRepository });
