# 阿卡纳心镜｜A 风格全套卡牌生成交接包

## 目标

为阿卡纳心镜生成 0—XXI 共 22 张大阿尔卡那牌面，使用已经确认用于本轮生成的 **A：仪式典藏** 风格。

最终资产服务于微信小程序：必须正视、平面、清晰、可缩放，不能出现实体卡片 mockup、透视、手持展示、桌面布景或包装盒。

## 开始前必须阅读

按顺序阅读并执行：

1. `AGENT_TASK.md`：可直接作为执行 Agent 的任务指令；
2. `STYLE_A_MASTER_PROMPT.md`：统一视觉合同、参考图职责和全局负面约束；
3. `SHARED_ASSET_PROMPTS.md`：统一正面框与卡背的生成要求；
4. `CARD_PROMPTS.md`：22 张牌逐张语义提示词；
5. `card-specs.json`：文件名、编号、标题与验收字段的机器可读清单；
6. `QA_CHECKLIST.md`：逐张与整套验收门禁。

## 参考图职责

### `references/style-a-front-back-reference.png`

- 所有 22 张牌都必须使用；
- 只继承煤黑/石墨灰/旧金配色、手工版画与纤维纸材质、克制金箔、精细仪式边框、画面层级和收藏品气质；
- 不复制隐士人物、灯、杖、山峰或现有文字；
- 右侧卡背只作为统一卡背的方向参考，最终卡背必须单独输出并做严格对称校验。

### `references/hermit-semantic-anchor.png`

- **只用于 `major-09-hermit`**；
- 只锁定隐士人物、提灯、六芒星光、长杖与高山的关系；
- 禁止作为其他 21 张牌的构图参考，避免全套都变成披风人物站在山上。

## 必须交付的文件

```text
output/
├─ faces/
│  ├─ major-00-fool.png
│  ├─ major-01-magician.png
│  ├─ ...
│  └─ major-21-world.png
├─ shared/
│  ├─ front-frame-overlay.png
│  └─ card-back.png
├─ previews/
│  ├─ major-00-fool-preview.png
│  ├─ ...
│  └─ major-21-world-preview.png
└─ generation-report.md
```

- `faces/`：22 张无文字、无编号、无外框的纯牌面插画，PNG，1024×1536，2:3；
- `shared/front-frame-overlay.png`：全套唯一的透明正面框，RGBA PNG，1024×1536；
- `shared/card-back.png`：全套唯一卡背，PNG，1024×1536，严格双轴及 180° 对称；
- `previews/`：将纯插画、统一正面框及确定性文字排版合成后的 22 张预览；
- `generation-report.md`：模型/工具、每张图最终 Prompt、重试次数、验收结论与已知问题。

## 执行顺序

1. 先生成并验收 `front-frame-overlay.png` 与 `card-back.png`；
2. 先做 `major-09-hermit.png`，确认 A 风格、人物尺度和安全区；
3. 再做语义差异最大的 5 张：愚者、女祭司、命运之轮、高塔、世界；
4. 六张通过后，批量完成剩余 16 张；
5. 对每张牌执行语义验收，再做整套一致性验收；
6. 所有文件通过 `QA_CHECKLIST.md` 后再交付，不以“已生成”代替“已验收”。

## 不可擅自修改

- 牌组范围固定为现有 22 张大阿尔卡那；
- 编号、中文名、英文名及文件名以 `card-specs.json` 为准；
- 不增加小阿尔卡那、品牌 Logo、占卜文案、水印或伪文字；
- 不把牌面生成成彩色、霓虹、玻璃、3D 浮雕、厚卡透视或写实摄影；
- 不把正位/逆位画成两套图；逆位由前端旋转同一资产完成。
