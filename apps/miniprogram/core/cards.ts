import type { TarotCard } from "./types";
import { MINOR_ARCANA } from "./minor-cards";

const MAJOR_ARCANA_DATA: Omit<TarotCard, "arcana">[] = [
  { id: "major-00", sequence: 0, roman: "0", name: "愚者", englishName: "The Fool", keywords: ["开始", "自由", "信任"], upright: "以开放和好奇进入新的阶段，同时留意脚下的现实。", reversed: "冲动或迟疑都可能让开始失去方向，需要先确认边界。", reflection: "如果不要求一次做对，你愿意先迈出哪一小步？" },
  { id: "major-01", sequence: 1, roman: "I", name: "魔术师", englishName: "The Magician", keywords: ["行动", "资源", "专注"], upright: "你已经拥有可以启动事情的资源，关键是把意图转成行动。", reversed: "资源可能被分散或使用失衡，需要重新确认真实能力与承诺。", reflection: "你手上哪一项现成资源最值得先用起来？" },
  { id: "major-02", sequence: 2, roman: "II", name: "女祭司", englishName: "The High Priestess", keywords: ["直觉", "沉静", "未知"], upright: "答案尚未完全显现，安静观察比立即定论更有帮助。", reversed: "你可能忽略内在感受，或把猜测当成直觉。", reflection: "暂不下结论时，你还能观察到什么细节？" },
  { id: "major-03", sequence: 3, roman: "III", name: "皇后", englishName: "The Empress", keywords: ["滋养", "创造", "丰盛"], upright: "耐心照料正在生长的事物，让支持与创造力形成循环。", reversed: "过度付出或忽略自身需求，可能使滋养变成消耗。", reflection: "什么需要被更稳定地照顾，而不是被催促？" },
  { id: "major-04", sequence: 4, roman: "IV", name: "皇帝", englishName: "The Emperor", keywords: ["结构", "责任", "边界"], upright: "清晰结构和边界能让行动更稳，也需要承担相应责任。", reversed: "僵化控制或边界松散，都可能让关系和计划失衡。", reflection: "哪条规则能带来秩序，同时保留必要弹性？" },
  { id: "major-05", sequence: 5, roman: "V", name: "教皇", englishName: "The Hierophant", keywords: ["传统", "学习", "价值"], upright: "成熟经验和共同规则可以提供参照，但仍需理解其意义。", reversed: "既有规则可能不再适用，需要辨别哪些价值真正属于你。", reflection: "你正在遵循的规则，服务于什么价值？" },
  { id: "major-06", sequence: 6, roman: "VI", name: "恋人", englishName: "The Lovers", keywords: ["选择", "连接", "一致"], upright: "重要连接要求价值与行动一致，选择也意味着承担。", reversed: "关系或内在价值出现错位，需要诚实面对分歧。", reflection: "这个选择更接近你想成为怎样的人吗？" },
  { id: "major-07", sequence: 7, roman: "VII", name: "战车", englishName: "The Chariot", keywords: ["意志", "推进", "方向"], upright: "集中不同力量并明确方向，行动才会持续向前。", reversed: "急于推进或方向拉扯，容易消耗控制感。", reflection: "此刻最值得守住的单一方向是什么？" },
  { id: "major-08", sequence: 8, roman: "VIII", name: "力量", englishName: "Strength", keywords: ["勇气", "温柔", "自持"], upright: "真正的力量来自温和而坚定地面对本能与恐惧。", reversed: "自我怀疑或压抑情绪，可能削弱稳定行动的能力。", reflection: "你能怎样既不否认感受，也不被它带走？" },
  { id: "major-09", sequence: 9, roman: "IX", name: "隐士", englishName: "The Hermit", keywords: ["独处", "辨认", "内在指引"], upright: "暂时远离噪音，通过独处和审视辨认真正重要的事。", reversed: "封闭或过度反刍可能让独处失去照明作用。", reflection: "减少一种外界声音后，你自己的判断是什么？" },
  { id: "major-10", sequence: 10, roman: "X", name: "命运之轮", englishName: "Wheel of Fortune", keywords: ["变化", "周期", "契机"], upright: "环境正在变化，识别周期比试图控制一切更重要。", reversed: "反复出现的模式值得留意，抗拒变化可能增加摩擦。", reflection: "这个局面中，什么已经改变而你还没有承认？" },
  { id: "major-11", sequence: 11, roman: "XI", name: "正义", englishName: "Justice", keywords: ["事实", "平衡", "后果"], upright: "回到事实、责任和后果，有助于形成更公平的判断。", reversed: "信息偏差或逃避责任，会让判断失去平衡。", reflection: "如果只列事实，不加入猜测，你会看到什么？" },
  { id: "major-12", sequence: 12, roman: "XII", name: "倒吊人", englishName: "The Hanged Man", keywords: ["暂停", "换位", "放下"], upright: "主动暂停和转换视角，可能比继续用力带来更多理解。", reversed: "无意义的等待或拒绝放手，会让停顿变成消耗。", reflection: "换一个完全不同的位置看，这件事会如何变化？" },
  { id: "major-13", sequence: 13, roman: "XIII", name: "死神", englishName: "Death", keywords: ["结束", "转化", "更新"], upright: "某个阶段需要结束，释放旧结构才有空间进入新的状态。", reversed: "对结束的抗拒可能延长停滞；这不代表字面伤害或死亡。", reflection: "什么已经完成使命，可以被允许结束？" },
  { id: "major-14", sequence: 14, roman: "XIV", name: "节制", englishName: "Temperance", keywords: ["调和", "耐心", "适度"], upright: "把不同需求逐步调和，以可持续节奏代替极端选择。", reversed: "失衡和急躁提示你需要重新调整比例与节奏。", reflection: "哪两个看似冲突的需求可以各保留一部分？" },
  { id: "major-15", sequence: 15, roman: "XV", name: "恶魔", englishName: "The Devil", keywords: ["束缚", "欲望", "觉察"], upright: "看见依赖、诱惑或自我设限，才能重新取得选择权。", reversed: "你可能正在松开束缚，也可能还不愿承认其影响。", reflection: "哪种重复模式正在换取短期安慰却增加长期代价？" },
  { id: "major-16", sequence: 16, roman: "XVI", name: "高塔", englishName: "The Tower", keywords: ["冲击", "揭示", "重建"], upright: "突发变化揭开不稳固的基础，重点是看清后如何重建。", reversed: "变化可能被延迟或内化，持续回避会累积压力。", reflection: "如果旧结构不能维持，最先要保护的是什么？" },
  { id: "major-17", sequence: 17, roman: "XVII", name: "星星", englishName: "The Star", keywords: ["希望", "修复", "真诚"], upright: "在经历消耗后，温和、诚实的修复正在恢复方向感。", reversed: "失望可能遮住已有的微小进展，需要降低不现实期待。", reflection: "有什么微小证据说明事情仍有修复空间？" },
  { id: "major-18", sequence: 18, roman: "XVIII", name: "月亮", englishName: "The Moon", keywords: ["模糊", "情绪", "投射"], upright: "信息不完整且情绪活跃，先辨别事实、感受和想象。", reversed: "迷雾正在散开，或焦虑仍在放大不确定性。", reflection: "哪些是事实，哪些只是你目前最担心的解释？" },
  { id: "major-19", sequence: 19, roman: "XIX", name: "太阳", englishName: "The Sun", keywords: ["清晰", "活力", "坦诚"], upright: "清晰和坦诚带来行动能量，也适合确认已经取得的进展。", reversed: "快乐或成功可能被低估，也需避免用乐观跳过现实问题。", reflection: "什么值得被直接说清楚或真诚庆祝？" },
  { id: "major-20", sequence: 20, roman: "XX", name: "审判", englishName: "Judgement", keywords: ["回顾", "召唤", "决定"], upright: "回顾过去并回应真正重要的召唤，准备作出成熟决定。", reversed: "自我批判或迟迟不回应，会让旧问题持续占据注意力。", reflection: "如果停止责备自己，这段经历真正要求你学会什么？" },
  { id: "major-21", sequence: 21, roman: "XXI", name: "世界", englishName: "The World", keywords: ["完成", "整合", "展开"], upright: "一个阶段正在完成，经验得到整合，也为下一段旅程腾出空间。", reversed: "收尾尚有缺口，先完成关键闭环再急于开启下一阶段。", reflection: "为了真正结束这一阶段，还缺哪一个具体动作？" }
];

export const MAJOR_ARCANA: TarotCard[] = MAJOR_ARCANA_DATA.map((card) => ({
  ...card,
  arcana: "major",
}));

export const TAROT_CARDS: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

const CARD_IMAGE_FILES = [
  "major-00-fool",
  "major-01-magician",
  "major-02-high-priestess",
  "major-03-empress",
  "major-04-emperor",
  "major-05-hierophant",
  "major-06-lovers",
  "major-07-chariot",
  "major-08-strength",
  "major-09-hermit",
  "major-10-wheel-of-fortune",
  "major-11-justice",
  "major-12-hanged-man",
  "major-13-death",
  "major-14-temperance",
  "major-15-devil",
  "major-16-tower",
  "major-17-star",
  "major-18-moon",
  "major-19-sun",
  "major-20-judgement",
  "major-21-world",
] as const;

export const CARD_BACK_IMAGE_PATH = "/assets/cards/card-back.jpg";
export const DECK_CARD_BACK_IMAGE_PATH = "/packages/deck/assets/cards/card-back.jpg";

export function getCard(cardId: string): TarotCard {
  const card = TAROT_CARDS.find((item) => item.id === cardId);
  if (!card) throw new Error(`Unknown tarot card: ${cardId}`);
  return card;
}

export function getCardImagePath(cardId: string): string {
  const card = getCard(cardId);
  const filename = card.arcana === "major"
    ? CARD_IMAGE_FILES[card.sequence]
    : card.id;
  return `/packages/deck/assets/cards/${filename}.jpg`;
}

export function getCardThumbnailPath(cardId: string): string {
  const card = getCard(cardId);
  const filename = card.arcana === "major"
    ? CARD_IMAGE_FILES[card.sequence]
    : card.id;
  return `/assets/card-thumbs/${filename}.jpg`;
}
