# A“仪式典藏”56 张小阿尔卡那生成与验收报告

## 结论

2026-07-25 完成权杖、圣杯、宝剑、星币四花色各 14 张，共 56 张小阿尔卡那。全部正式源图均通过逐牌语义、数量、风格和技术门禁，并与既有 22 张大阿尔卡那共同组成 78 张完整牌组。

- 正式源图：`faces/`，56 张 1024×1536 高质量 JPEG；
- 花色联排：`contact-sheets/`，4 张 7×2 一致性检查图；
- 小程序牌组分包：`apps/miniprogram/packages/deck/assets/cards/`，78 张牌面与统一卡背，384×576 JPEG；
- 主包缩略图：`apps/miniprogram/assets/card-thumbs/`，78 张 192×288 JPEG；
- 完整资产校验：`npm run validate:assets`。

## Prompt 与生成方式

- 生成工具：会话内置 `imagegen`；
- 唯一视觉参考：`deliverables/style-a-deck-generation-kit/references/style-a-front-back-reference.png`；
- 公共风格 Prompt：`deliverables/style-a-minor-arcana-generation-kit/STYLE_A_MINOR_MASTER_PROMPT.md`；
- 逐牌语义 Prompt：`deliverables/style-a-minor-arcana-generation-kit/CARD_PROMPTS.md`；
- 文件名、顺序与关键词合同：`deliverables/style-a-minor-arcana-generation-kit/card-specs.json`；
- 单张实际 Prompt 由“公共风格 Prompt + 对应逐牌 required/forbidden + 无文字/无编号/无外框技术限制”组合而成。参考图只传递煤黑、石墨灰、旧金、纤维纸和手工版画质感，不复用隐士构图。

正式图均为单张正视 2:3 牌面插画，不包含标题、编号、Logo、水印或实体卡片外框。正逆位共用同一图，逆位由前端旋转 180°。

## 逐组验收

| 花色 | 已验收牌 | 结论 |
| --- | --- | --- |
| 权杖 | A、II、III、IV、V、VI、VII、VIII、IX、X、PAGE、KNIGHT、QUEEN、KING | 14/14 通过；权杖数量、人物动作与火元素旧金锚点清楚 |
| 圣杯 | A、II、III、IV、V、VI、VII、VIII、IX、X、PAGE、KNIGHT、QUEEN、KING | 14/14 通过；圣杯数量、水元素与人物关系清楚 |
| 宝剑 | A、II、III、IV、V、VI、VII、VIII、IX、X、PAGE、KNIGHT、QUEEN、KING | 14/14 通过；宝剑数量、冲突/休息/判断语义清楚且无血腥 |
| 星币 | A、II、III、IV、V、VI、VII、VIII、IX、X、PAGE、KNIGHT、QUEEN、KING | 14/14 通过；星币数量、土元素、劳动与资源关系清楚 |

四张联排图复验确认：四花色可通过核心物件识别；同花色材料和旧金质感稳定；数字牌复杂度、宫廷人物身份与动势有清楚区分；整套仍属于同一 A“仪式典藏”视觉系统。

## 返工记录

只记录会影响验收判断的返工，未通过版本不进入正式资产：

1. `minor-cups-09`：首版出现十只杯，不符合九杯数量门禁；重生为人物前方单排正好九只杯后通过。
2. `minor-swords-10`：前两版分别出现十二把和十一把剑；第三次编辑移除多余前景剑，最终为后景五把、前景五把，共十把，且无血迹。
3. `minor-pentacles-06`：首版构图与数量通过但含装饰外框；确定性裁切并恢复 2:3 后通过。
4. `minor-pentacles-08`：裁切后仍残留外框；使用 `imagegen` 局部编辑移除全部边线与角饰，保持左墙七枚已完成星币和工匠手中一枚、合计正好八枚后通过。

## 技术处理

- 正式源图统一保存为 1024×1536、`yuvj444p`、JPEG quality 2；
- 牌组分包图使用 Lanczos 缩放为 384×576、JPEG quality 8、4:2:0；
- 主包首页/历史入口缩略图使用 Lanczos 缩放为 192×288、JPEG quality 10、4:2:0；
- 小程序主包只保留首页所需缩略图与卡背；仪式、结果、历史、图鉴及 78 张展示图位于普通分包 `packages/deck`；
- 资源校验同时检查数量、文件名、尺寸、花色分布、源图/发布图对应关系和主包/分包 2 MiB 上限。

## 最终门禁

- [x] 56 张正式源图齐全，四花色各 14 张；
- [x] 二至十的花色物件数量逐张可数，宫廷牌身份和持物关系明确；
- [x] 无标题、编号、Logo、水印、伪文字和外边框；
- [x] 4 张花色联排通过一致性复验；
- [x] 78 张牌面已接入抽牌、历史、图鉴和解读路径；
- [x] 主包与 `deck` 分包均低于 2 MiB；
- [x] 类型检查、自动化测试与资产校验通过。

微信开发者工具的真机/模拟器视觉复验仍属于发布门禁，不由静态资产报告替代。
