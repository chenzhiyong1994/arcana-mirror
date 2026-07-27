# A 仪式典藏共享卡面资产

本目录保存用户提供的原始共享素材，不使用重新描摹或 CSS 近似版本。

- `front-frame-overlay.png`：1024×1536 RGBA 透明正面框；22 张大阿尔卡那成品曾使用的同一张边框源图；
- `card-back.png`：1024×1536 统一卡背；与既有小程序卡背原始素材哈希一致。

来源归档：2026-07-27 收到的 `shared.zip`。压缩包本身不提交，正式源文件直接纳入资产目录。

SHA-256：

- `front-frame-overlay.png`：`04A5700E1ED8B37D9E509C263B5B82534A23BC6657A4F65F74280C5CCBF56C7A`
- `card-back.png`：`C792C762986BF5EEB6568E434C4D12748187D07F7943FDA3319D45C6AB251A5B`

小程序运行时使用 `npm run build:shared-card-assets` 将正面框确定性缩放为 384×576，输出至 `apps/miniprogram/assets/cards/front-frame-overlay.png`。标题、编号仍由 `tarot-card-face` 组件叠加，不写入无框小阿尔卡那插画。
