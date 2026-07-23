# 阿卡纳心镜｜Arcana Mirror

> 翻开牌面，照见自己。

阿卡纳心镜是一款以塔罗为交互媒介的微信小程序，通过短仪式、CloudBase AI 个性化解读和可选的本地历史，帮助用户整理困扰、获得新的观察角度并形成一个可执行的小行动。

它是一项非商业化个人作品集项目，不宣称预测未来，也不替代心理、医疗、法律或金融专业意见。

## 当前状态

- 阶段：v1.0 正式版候选；CloudBase AI 与 `hy3` 已接入，正在完成发布前人工门禁
- 工程：微信原生小程序 TypeScript + 本地 Repository + CloudBase AI Provider；无需在小程序包内配置模型密钥
- MVP：每日一牌、主题单牌与“现状—关键影响—行动建议”三牌模式、安全阻断与降级、可选本地历史
- 解读：按用户选择的主题提供聚焦解读；总览、逐牌切换、可展开牌义、综合提示、反思与行动按接收顺序渐进呈现
- 图鉴：22 张大阿卡纳按实际翻牌解锁，记录正逆位与翻开次数，独立于历史管理
- 视觉：A“仪式典藏”22 张正式卡牌与统一卡背已经接入小程序移动端资源；Logo 已选定 L5“繁饰日蚀心镜”
- 鉴赏：翻牌后、结果页和图鉴详情均可进入沉浸大图，保留正逆位、牌位与卡牌名称信息
- 首版预算：64—80 小时，80 小时硬上限

## 卡牌视觉

![A 仪式典藏正反面样稿](assets/tarot-card-style/concepts/style-concept-a-ritual-archive-v1.png)

本轮全套卡牌使用 A“仪式典藏”：黑灰手工版画、纤维纸与不均匀旧金箔。22 张牌与统一卡背已完成生成、语义及技术验收，并从 1024×1536 正式原图确定性生成 640×960 高清移动端版本，接入抽牌、结果、鉴赏大图和图鉴页面；逆位由前端旋转同一资产。完整生成合同见 [A 风格全套卡牌生成包](deliverables/style-a-deck-generation-kit/README.md)。

## 文档

1. [产品材料索引](docs/product/README.md)
2. [产品定义与调研结论](docs/product/01-product-brief.md)
3. [MVP PRD](docs/product/02-mvp-prd.md)
4. [技术架构方案](docs/product/03-technical-architecture.md)
5. [开发路线与作品集计划](docs/product/04-development-roadmap.md)
6. [Claude Opus 4.8 架构审查](docs/product/05-claude-architecture-review.md)
7. [PRD 自检报告](docs/product/06-prd-review.md)
8. [长程开发执行基线](docs/product/07-execution-baseline.md)
9. [v0.2 三牌与图鉴扩展 PRD](docs/product/08-v0.2-three-card-and-collection.md)
10. [v0.3 高保真体验与解读减负](docs/product/09-v0.3-high-fidelity-experience.md)
11. [卡片风格基准](assets/tarot-card-style/README.md)
12. [A 风格全套卡牌生成交接包](deliverables/style-a-deck-generation-kit/README.md)

## 仓库结构

```text
apps/miniprogram/  # 微信原生小程序与本地适配器
assets/            # 卡片、品牌与界面视觉资产
docs/              # 产品、架构、评审和验收资料
tests/             # 领域、安全、CloudBase Provider 与解读契约测试
workspace/         # 临时工作文件，不进入版本库
```

## 本地运行

```powershell
npm install
npm run typecheck
npm test
```

随后在微信开发者工具中导入仓库根目录。工程已配置正式小程序 AppID，并在 `apps/miniprogram/config/cloud.ts` 中固定 CloudBase 环境 `<your-cloudbase-env-id>`、AI Provider `cloudbase` 和模型 `hy3`。基础库需不低于 3.15.1；当前工程使用 3.17.0。

每日一牌仍使用本地受控牌义。主题问题会连同所选主题、牌阵、卡牌事实和受控牌义发送至 CloudBase AI，由 `hy3` 生成结构化建议；输出必须通过字段、牌面事实、主题和安全校验，否则自动降级为本地基础牌义。问题和历史不进入仓库，历史只保存在当前设备且不跨设备同步；CloudBase 控制台可能保留 AI 调用记录，用户不应输入姓名、电话、住址等可识别信息。

发布前验收与剩余门禁见 [v1.0 AI 接入与发布检查](docs/development/v1.0-ai-integration.md)。

本仓库自 2026-07-19 起作为阿卡纳心镜项目的唯一维护源。原 ProductManager 仓库只保留迁移前快照与位置说明。
