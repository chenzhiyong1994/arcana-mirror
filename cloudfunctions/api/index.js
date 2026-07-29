const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const ALLOWED_ENV_VERSIONS = new Set(["develop", "trial", "release"]);

async function getShareCode(event) {
  const envVersion = ALLOWED_ENV_VERSIONS.has(event.envVersion)
    ? event.envVersion
    : "release";

  const response = await cloud.openapi.wxacode.getUnlimited({
    scene: "from=poster",
    page: "pages/home/index",
    width: 430,
    autoColor: false,
    lineColor: { r: 64, g: 51, b: 31 },
    isHyaline: false,
    checkPath: envVersion === "release",
    envVersion,
  });

  if (!response.buffer) throw new Error("WXACODE_BUFFER_MISSING");
  return {
    ok: true,
    imageBase64: response.buffer.toString("base64"),
  };
}

exports.main = async (event = {}) => {
  if (event.action !== "share.code") {
    return { ok: false, error: "UNKNOWN_ACTION" };
  }

  try {
    return await getShareCode(event);
  } catch (error) {
    console.error("[api:share.code]", error?.errCode || error?.message || "unknown");
    return { ok: false, error: "SHARE_CODE_GENERATION_FAILED" };
  }
};
