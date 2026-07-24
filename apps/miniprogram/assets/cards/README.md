# 小程序卡牌资源

本目录现在只保留首页主包使用的 512×768 统一卡背。

- 78 张 192×288 首页缩略图位于 `../card-thumbs/`；
- 78 张 384×576 展示牌面与分包卡背位于 `../../packages/deck/assets/cards/`；
- 仪式、结果、历史和图鉴页面位于普通分包 `packages/deck`，避免 78 张完整牌组挤占主包；
- 22 张大阿尔卡那生成合同位于 `deliverables/style-a-deck-generation-kit/`，56 张小阿尔卡那合同位于 `deliverables/style-a-minor-arcana-generation-kit/`；
- 完整小阿尔卡那源图与验收报告位于 `assets/tarot-card-style/minor-arcana/`。

- 展示规则：正位直接展示，逆位由前端将同一图片旋转 180°；不维护第二套逆位图片。

替换任何图片时必须保持 2:3 比例、相同文件名，并同步更新源图、分包展示图和主包缩略图；完成后运行 `npm run validate:assets`。
