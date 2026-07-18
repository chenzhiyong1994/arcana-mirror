# 阿卡纳心镜｜Arcana Mirror

> 翻开牌面，也照见自己。

阿卡纳心镜是一款以塔罗为交互媒介的微信小程序，通过短仪式、结构化 AI 解读和个人记录，帮助用户整理困扰、获得新的观察角度并形成一个可执行的小行动。

它是一项非商业化个人作品集项目，不宣称预测未来，也不替代心理、医疗、法律或金融专业意见。

## 当前状态

- 阶段：产品与视觉基准已确定，准备进入 CloudBase/模型技术 Spike 和低保真原型
- MVP：22 张大阿卡纳、每日静态单牌、主题单牌 AI 解读、安全阻断与降级、日记、历史和删除
- 技术方向：微信原生小程序 TypeScript + CloudBase 模块化单体 + 薄 LLM Adapter
- 首版预算：64—80 小时，80 小时硬上限

## 主视觉

![阿卡纳心镜隐士牌面基准](assets/tarot-card-style/style-hermit-v3.png)

主视觉采用黑灰手工版画、纤维纸与不均匀旧金箔。牌面语义和视觉风格分层定义：每张牌先锁定主流人物、道具、姿态和象征，再应用统一材质与边框系统。

## 文档

1. [产品材料索引](docs/product/README.md)
2. [产品定义与调研结论](docs/product/01-product-brief.md)
3. [MVP PRD](docs/product/02-mvp-prd.md)
4. [技术架构方案](docs/product/03-technical-architecture.md)
5. [开发路线与作品集计划](docs/product/04-development-roadmap.md)
6. [Claude Opus 4.8 架构审查](docs/product/05-claude-architecture-review.md)
7. [PRD 自检报告](docs/product/06-prd-review.md)
8. [卡片风格基准](assets/tarot-card-style/README.md)

## 仓库结构

```text
assets/       # 卡片、品牌与界面视觉资产
docs/         # 产品、架构、评审和设计资料
src/          # 后续小程序与云函数代码
workspace/    # 临时工作文件，不进入版本库
```

本仓库自 2026-07-19 起作为阿卡纳心镜项目的唯一维护源。原 ProductManager 仓库只保留迁移前快照与位置说明。
