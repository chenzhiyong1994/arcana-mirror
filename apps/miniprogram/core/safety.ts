import type { SafetyDecision } from "./types";

const CRISIS_PATTERN = /(自杀|想死|寻死|轻生|不想活|活着没意思|结束(?:自己|我的)?生命|伤害自己|伤害我自己|自残|割腕|跳楼|杀了他|杀了她|杀人|伤人|伤害他人)/u;
const ABUSE_PATTERN = /(赌博|下注|操控(?:他|她|别人)|控制(?:他|她|别人)|报复|违法|骗取)/u;
const PROFESSIONAL_PATTERN = /(怀孕|疾病|癌症|诊断|吃什么药|停药|法律责任|判刑|起诉|股票|基金|投资|涨停|彩票)/u;
const PREDICTION_PATTERN = /(一定会|会不会|能不能复合|什么时候(?:结婚|复合|发财)|爱不爱我|结果一定|命中注定)/u;

export function classifyQuestion(rawQuestion: string): SafetyDecision {
  const question = rawQuestion.trim().normalize("NFKC");

  if (question.length < 5 || question.length > 200) {
    return { action: "rewrite", reasonCode: "INVALID_LENGTH", message: "问题需要在 5—200 个字符之间。" };
  }
  if (!/[\p{L}\p{N}]/u.test(question)) {
    return { action: "rewrite", reasonCode: "NO_MEANINGFUL_TEXT", message: "请用一句完整的话描述你想整理的困扰。" };
  }
  if (CRISIS_PATTERN.test(question)) {
    return {
      action: "crisis_block",
      reasonCode: "CRISIS_LANGUAGE",
      message: "现在最重要的不是抽牌。请立即联系身边可信赖的人、当地紧急服务或专业支持，并先确保自己和他人的安全。",
    };
  }
  if (ABUSE_PATTERN.test(question)) {
    return { action: "abuse_block", reasonCode: "ABUSE_OR_ILLEGAL", message: "这个问题涉及伤害、操纵、违法或赌博，不能进入解读流程。" };
  }
  if (PROFESSIONAL_PATTERN.test(question)) {
    return {
      action: "professional_boundary",
      reasonCode: "PROFESSIONAL_BOUNDARY",
      message: "医疗、法律或投资问题需要依据事实和专业意见，卡牌不能提供判断。你可以改为整理自己的感受与下一步信息收集。",
      suggestedQuestion: "面对这件事，我现在可以整理哪些感受、事实和下一步信息？",
    };
  }
  if (PREDICTION_PATTERN.test(question)) {
    return {
      action: "rewrite",
      reasonCode: "DETERMINISTIC_PREDICTION",
      message: "把确定性预测改成关注自身观察和选择的问题，会更适合自我探索。",
      suggestedQuestion: "面对这件事，我现在可以关注哪些感受、事实和选择？",
    };
  }
  return { action: "allow", reasonCode: "OK", message: "问题可以进入解读流程。" };
}
