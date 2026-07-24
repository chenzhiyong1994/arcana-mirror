# 阿卡纳心镜｜A 风格小阿尔卡那生成交接包

## 目标

在现有 22 张 A“仪式典藏”大阿尔卡那基础上，生成权杖、圣杯、宝剑、星币四组各 14 张，共 56 张小阿尔卡那，使产品形成完整 78 张塔罗牌组。

本包是增量合同，不覆盖 `../style-a-deck-generation-kit/` 已完成的 22 张大阿尔卡那合同。

## 参考图

所有牌只使用现有视觉参考：

- `../style-a-deck-generation-kit/references/style-a-front-back-reference.png`

它只负责煤黑、石墨灰、旧金、手工版画、纤维纸和收藏品质感，不负责当前牌的构图。禁止使用隐士语义锚点生成小阿尔卡那。

## 交付结构

```text
assets/tarot-card-style/minor-arcana/
├─ faces/
│  ├─ minor-wands-ace.jpg
│  ├─ ...
│  └─ minor-pentacles-king.jpg
├─ contact-sheets/
│  ├─ wands.jpg
│  ├─ cups.jpg
│  ├─ swords.jpg
│  └─ pentacles.jpg
└─ generation-report.md

apps/miniprogram/packages/deck/assets/cards/
├─ major-00-fool.jpg
├─ ...
├─ minor-pentacles-king.jpg
└─ card-back.jpg

apps/miniprogram/assets/card-thumbs/
├─ major-00-fool.jpg
├─ ...
└─ minor-pentacles-king.jpg
```

- `faces/`：1024×1536、2:3、无文字、无编号、无外框的正式源图，使用高质量 JPEG 保存；
- `contact-sheets/`：每花色 14 张缩略图一致性验收表；
- 牌组分包资源：从正式源图确定性生成的 384×576 发布版 JPEG；
- 主包缩略图：78 张 192×288 JPEG，仅供首页和分包入口预览；
- `generation-report.md`：逐牌最终 Prompt、重试、语义、风格和技术验收。

## 执行顺序

1. 阅读 `STYLE_A_MINOR_MASTER_PROMPT.md`、`CARD_PROMPTS.md` 和 `QA_CHECKLIST.md`；
2. 先做四张王牌，锁定四花色的象征材料；
3. 每花色先做二、五、十、王后四张，验证数字牌、冲突场景、群像和宫廷牌；
4. 每个花色通过 5 张试产后，再完成该花色剩余 9 张；
5. 逐张执行语义门禁，并生成花色 contact sheet 做一致性验收；
6. 全部通过后再生成小程序发布资源并接入。

## 不可变规则

- 文件名、顺序和牌义以 `apps/miniprogram/core/minor-cards.ts` 与 `CARD_PROMPTS.md` 为准；
- 不生成标题、编号、花色名、英文名、解释文字、Logo、水印或伪文字；
- 不生成实体卡片、卡框、桌面、手持、包装或透视 mockup；
- 数字牌必须让对应数量的花色物件清楚可数；宫廷牌必须保留人物、花色物件和动作关系；
- 不为逆位生成第二张图，逆位继续由前端旋转同一资产。
