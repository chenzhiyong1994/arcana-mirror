# 阿卡纳心镜项目指南

## 项目定位

阿卡纳心镜（Arcana Mirror）是非商业化个人作品集项目，以塔罗为交互媒介提供娱乐性自我探索，不做确定性预测，不替代专业意见。

## 已确定基准

- MVP 范围与架构以 `docs/product/` 为准。
- `assets/tarot-card-style/style-hermit-v3.png` 只作为隐士牌义、人物关系和构图锚点；黑金 A 方向已归档为备选。
- 当前完整 78 张牌组均使用黑金仪式典藏 A：22 张大阿尔卡那合同位于 `deliverables/style-a-deck-generation-kit/`，56 张小阿尔卡那合同位于 `deliverables/style-a-minor-arcana-generation-kit/`；古典新艺术 G 继续作为备选，不混入 A 牌组。
- 小阿尔卡那正式源图、花色联排与验收报告位于 `assets/tarot-card-style/minor-arcana/`；任何单牌替换都必须重新通过对应逐牌语义、数量与整套一致性门禁。
- 小程序 Logo 已选定 L5“繁饰日蚀心镜”，正式源文件为 `assets/branding/logo-concepts/logo-l5-ornate-eclipse-mirror-v1.png`；后续适配不得将其简化为扁平卡通或丢失手绘卷草、旧金边框与古镜质感。
- 卡片生成必须先定义牌义层，再应用视觉层；核心人物、道具、姿态或象征缺失即不通过。
- 卡牌标题和编号由前端叠加，不写死在生成图片中。
- 大、小阿尔卡那的唯一共享正面框原件为 `assets/tarot-card-style/shared/front-frame-overlay.png`；小阿尔卡那必须通过 `apps/miniprogram/components/tarot-card-face/` 叠加其 384×576 运行时缩放图、顶部牌阶与底部中英文铭牌，不得再用 CSS 近似绘制；大阿尔卡那沿用已用该原件烘焙的成牌，不得重复套框。首页、仪式、结果、历史、图鉴和鉴赏大图都必须复用该组件，正逆位旋转整张成牌。
- 小程序 78 张展示图与仪式/结果/历史/图鉴页面位于普通分包 `apps/miniprogram/packages/deck/`，主包只保留 `assets/card-thumbs/` 缩略图和主包卡背；不得把完整展示图复制回主包，变更后运行 `npm run validate:assets`。
- v0.3 前端基线为“黑金典藏 · 镜廊仪式”：深墨底、旧金细节、真实 A 卡面、克制光晕与翻牌动效；不得退回通用卡片式低保真界面。
- 解读采用渐进披露和问题聚焦模型：首屏将用户困扰与“第一眼线索”分区展示，三牌一次只读一张，牌义依据默认折叠；新流程不要求用户预选感情/人际/事业/自我类别，由模型直接根据问题识别重点，旧主题字段和 v0.2 多维字段仅用于本地历史兼容。
- v1.0 主题解读使用 CloudBase 环境 `<your-cloudbase-env-id>` 的内置 AI Provider `cloudbase` 与模型 `hy3`；调用入口为小程序端 `wx.cloud.extend.AI.createModel`，不得把模型密钥或 AppSecret 写入仓库。
- 真实 AI 只接收当前问题、牌阵、卡牌事实与受控牌义，不读取本地历史；`summary` 不得复述或套话改写用户问题，输出必须通过结构、牌面事实、问题焦点和安全校验，失败统一回退到本地受控牌义。

## 工作规则

- 生图或图片编辑使用会话内 `imagegen`，生成资产保存到 `assets/`，并记录 Prompt 与验收结论。
- 产品范围变化同步更新 PRD、架构或路线文档，不只改 README。
- 私密问题、密钥、模型原始响应和无授权参考图不得进入仓库。
- 临时文件放在 `workspace/` 或 `tmp/`，不要放在项目根目录。
- 每次变更后检查 `git status --short`、实际差异和最窄验证；稳定成果创建本地提交。
