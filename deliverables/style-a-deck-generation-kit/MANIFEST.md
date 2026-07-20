# 交接包清单

## 文档

- `AGENT_TASK.md`：可直接交给执行 Agent 的完整任务指令；
- `README.md`：任务范围、参考图职责、输出结构和执行顺序；
- `STYLE_A_MASTER_PROMPT.md`：公共视觉 Prompt、负面 Prompt 与批次锁定参数；
- `SHARED_ASSET_PROMPTS.md`：统一正面框、统一卡背与预览合成规则；
- `CARD_PROMPTS.md`：22 张逐牌牌义 Prompt；
- `card-specs.json`：与项目牌库一致的机器可读规格；
- `QA_CHECKLIST.md`：单张与整套验收门禁。

## 必须参考图

| 文件 | 角色 | SHA-256 |
| --- | --- | --- |
| `references/style-a-front-back-reference.png` | 所有牌的视觉与材质参考 | `D4B2E8AB49500771450B20E5186CF61F716E9A5B493C4DBD2018C864FA2B6B82` |
| `references/hermit-semantic-anchor.png` | 仅 IX 隐士的牌义与人物关系参考 | `E14963EFD5E2CD8942227E3082641F4F1C7E712DB3F743ED3B36B80631A732E2` |

## 版本

- 交接包版本：1.0.0
- 牌库来源：`apps/miniprogram/core/cards.ts`
- 牌组范围：0—XXI，共 22 张大阿尔卡那
- 视觉方向：A｜仪式典藏
