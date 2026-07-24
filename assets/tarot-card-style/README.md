# 阿卡纳心镜：塔罗卡片视觉备选

## 当前状态

视觉探索保留两个方向；当前 78 张完整牌组已选用 A，G 继续归档为备选：

1. **A：仪式典藏（本轮生成方向）**——黑灰手工版画、纤维纸、不均匀旧金箔与精细仪式边框；
2. **G：古典新艺术（备选）**——清晰黑色轮廓、克制全彩平涂、低颗粒与有机曲线边框。

淘汰方向及其图片、Prompt 和对照资产已移除，不再作为后续组合来源。

## 保留资产

- `concepts/style-concept-a-ritual-archive-v1.png`：A 方案正面与统一卡背概念样稿；
- `concepts/style-nouveau-g-classical-v1.png`：G 方案正面与统一卡背概念样稿；
- `style-hermit-v3.png`：只用于校验隐士牌义、人物关系与核心道具，不代表已确认的主视觉。

两套方案的 Prompt、优劣势与验收结论见 [`concepts/README.md`](concepts/README.md)。A 风格的 22 张大阿尔卡那合同见 [`../../deliverables/style-a-deck-generation-kit/README.md`](../../deliverables/style-a-deck-generation-kit/README.md)，56 张小阿尔卡那合同见 [`../../deliverables/style-a-minor-arcana-generation-kit/README.md`](../../deliverables/style-a-minor-arcana-generation-kit/README.md)。

正式小阿尔卡那源图位于 `minor-arcana/faces/`，四花色联排与完整返工、Prompt、验收记录位于 `minor-arcana/contact-sheets/` 和 `minor-arcana/generation-report.md`。

## 共同牌义基准

隐士牌必须表现一位年长隐士独自在高山上低头沉思，一手提含六芒星光的灯，一手持长杖。人物、灯、手、杖与山峰关系必须清楚，不能替换成远方灯火、独立悬浮物、微小旅人或第二人物。

本轮每张牌都先定义并验收牌义层，再应用 A 的视觉层；核心人物、道具、姿态或象征缺失即不通过。G 不作为本批次组合来源。

## 正反面与前端分层

正式资产必须拆成四层：

1. 每张牌独立生成的牌面插画层；
2. 全牌组共用的确定性正面边框层；
3. 由前端叠加的编号与中英文标题层；
4. 一张严格双轴与 180° 对称的统一卡背。

翻牌动效只在正面层与统一卡背层之间切换；卡背不按卡牌重新生成，生成图片中的示意文字不进入正式资产。

## 后续门禁

1. 由接收交接包的 Agent 先制作统一正面框、独立卡背和隐士试产；
2. 验证缩略图、文字叠加、翻牌与正逆位；
3. 22 张大阿尔卡那与 56 张小阿尔卡那均执行逐牌语义验收；
4. 当前 78 张已通过整套一致性门禁并回填项目资产；后续替换单牌时仍须重新执行对应逐牌与花色联排检查。
