# 阿卡纳心镜｜Arcana Mirror

> 翻开牌面，也照见自己。

阿卡纳心镜是一款以塔罗为交互媒介的微信小程序，通过短仪式、结构化模拟解读和可选的本地历史，帮助用户整理困扰、获得新的观察角度并形成一个可执行的小行动。

它是一项非商业化个人作品集项目，不宣称预测未来，也不替代心理、医疗、法律或金融专业意见。

## 当前状态

- 阶段：本地 MVP 功能闭环已完成，等待低保真交互验收
- 工程：微信原生小程序 TypeScript + 本地 Repository + 模拟 AI Provider；CloudBase 与真实 AI 后置
- MVP：22 张大阿卡纳、每日静态单牌、主题单牌模拟解读、安全阻断与降级、可选本地历史和删除
- 视觉：功能界面保持低保真；22 张大阿尔卡那已选用 A“仪式典藏”方向并独立推进资产生成
- 首版预算：64—80 小时，80 小时硬上限

## 卡牌视觉

![A 仪式典藏正反面样稿](assets/tarot-card-style/concepts/style-concept-a-ritual-archive-v1.png)

本轮全套卡牌生成使用 A“仪式典藏”：黑灰手工版画、纤维纸与不均匀旧金箔。每张牌先锁定主流人物、道具、姿态和象征，再应用统一材质与边框系统；G“古典新艺术”仅保留为备选，不混入本批次。完整生成交接材料见 [A 风格全套卡牌生成包](deliverables/style-a-deck-generation-kit/README.md)。

## 文档

1. [产品材料索引](docs/product/README.md)
2. [产品定义与调研结论](docs/product/01-product-brief.md)
3. [MVP PRD](docs/product/02-mvp-prd.md)
4. [技术架构方案](docs/product/03-technical-architecture.md)
5. [开发路线与作品集计划](docs/product/04-development-roadmap.md)
6. [Claude Opus 4.8 架构审查](docs/product/05-claude-architecture-review.md)
7. [PRD 自检报告](docs/product/06-prd-review.md)
8. [长程开发执行基线](docs/product/07-execution-baseline.md)
9. [卡片风格基准](assets/tarot-card-style/README.md)
10. [A 风格全套卡牌生成交接包](deliverables/style-a-deck-generation-kit/README.md)

## 仓库结构

```text
apps/miniprogram/  # 微信原生小程序与本地适配器
assets/            # 卡片、品牌与界面视觉资产
docs/              # 产品、架构、评审和验收资料
tests/             # 领域、安全与模拟解读契约测试
workspace/         # 临时工作文件，不进入版本库
```

## 本地运行

```powershell
npm install
npm run typecheck
npm test
```

随后在微信开发者工具中导入仓库根目录。工程默认使用 `touristappid`，也可以在开发者工具的本地私有配置中换成测试 AppID。设置页可切换模拟成功、超时、非法结构和不安全输出四种模式，用于验证正常路径与降级路径。

本阶段不接入 CloudBase、真实 AI、微信云身份或账号系统。每日一牌会自动保存在当前设备；主题解读仅在结果页主动选择后保存。所有历史均可单条删除或全部清空，不跨设备同步，也不包含日记字段。

本仓库自 2026-07-19 起作为阿卡纳心镜项目的唯一维护源。原 ProductManager 仓库只保留迁移前快照与位置说明。
