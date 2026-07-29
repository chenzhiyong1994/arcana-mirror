const POSTER_WIDTH = 1000;
const POSTER_HEIGHT = 1650;

type Canvas2DContext = WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D;

export interface SharePosterCard {
  arcana: "major" | "minor";
  roman: string;
  name: string;
  englishName: string;
  orientation: "upright" | "reversed";
  orientationLabel: string;
  imagePath: string;
}

export interface SharePosterContent {
  topic: string;
  date: string;
  title: string;
  summary: string;
  microAction: string;
  cards: SharePosterCard[];
}

interface ShareCodeResult {
  ok?: boolean;
  imageBase64?: string;
  error?: string;
}

function getCanvas(page: WechatMiniprogram.Page.TrivialInstance): Promise<WechatMiniprogram.Canvas> {
  return new Promise((resolve, reject) => {
    page.createSelectorQuery()
      .select("#sharePoster")
      .fields({ node: true })
      .exec((result) => {
        const canvas = result[0]?.node as WechatMiniprogram.Canvas | undefined;
        if (canvas) resolve(canvas);
        else reject(new Error("POSTER_CANVAS_UNAVAILABLE"));
      });
  });
}

function loadCanvasImage(
  canvas: WechatMiniprogram.Canvas,
  src: string,
): Promise<WechatMiniprogram.Image> {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`POSTER_IMAGE_LOAD_FAILED:${src}`));
    image.src = src;
  });
}

export function wrapPosterText(
  text: string,
  maxWidth: number,
  maxLines: number,
  measure: (value: string) => number,
): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return [];

  const lines: string[] = [];
  let current = "";
  for (const character of normalized) {
    const next = current + character;
    if (current && measure(next) > maxWidth) {
      lines.push(current);
      current = character;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);

  const consumed = lines.join("").replace(/…$/, "").length;
  if (consumed < normalized.length && lines.length) {
    let last = lines[lines.length - 1];
    while (last && measure(`${last}…`) > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

async function fetchShareCode(): Promise<string> {
  if (!wx.cloud) throw new Error("CLOUD_UNAVAILABLE");
  const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
  const response = await wx.cloud.callFunction({
    name: "api",
    data: { action: "share.code", envVersion },
  });
  const result = response.result as ShareCodeResult | undefined;
  if (!result?.ok || !result.imageBase64) {
    throw new Error(result?.error || "SHARE_CODE_UNAVAILABLE");
  }

  const filePath = `${wx.env.USER_DATA_PATH}/arcana-mirror-share-code.jpg`;
  await wx.getFileSystemManager().writeFile({
    filePath,
    data: result.imageBase64,
    encoding: "base64",
  });
  return filePath;
}

function drawBackground(ctx: Canvas2DContext) {
  ctx.fillStyle = "#090806";
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  const glow = ctx.createRadialGradient(500, 150, 20, 500, 150, 680);
  glow.addColorStop(0, "rgba(184, 150, 87, 0.20)");
  glow.addColorStop(0.52, "rgba(91, 70, 37, 0.07)");
  glow.addColorStop(1, "rgba(9, 8, 6, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, POSTER_WIDTH, 850);

  ctx.strokeStyle = "rgba(184, 150, 87, 0.36)";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, POSTER_WIDTH - 64, POSTER_HEIGHT - 64);
  ctx.strokeStyle = "rgba(184, 150, 87, 0.14)";
  ctx.strokeRect(48, 48, POSTER_WIDTH - 96, POSTER_HEIGHT - 96);

  ctx.beginPath();
  ctx.arc(500, 76, 13, 0, Math.PI * 2);
  ctx.strokeStyle = "#b89657";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(486, 76);
  ctx.lineTo(514, 76);
  ctx.moveTo(500, 62);
  ctx.lineTo(500, 90);
  ctx.stroke();
}

function drawCard(
  ctx: Canvas2DContext,
  art: WechatMiniprogram.Image,
  frame: WechatMiniprogram.Image | null,
  card: SharePosterCard,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save();
  if (card.orientation === "reversed") {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(Math.PI);
    x = -width / 2;
    y = -height / 2;
  }

  ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 16;
  ctx.drawImage(art, x, y, width, height);
  ctx.shadowColor = "transparent";

  if (card.arcana === "minor" && frame) {
    ctx.drawImage(frame, x, y, width, height);
    ctx.fillStyle = "#e3c37c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.max(15, Math.round(width * 0.085))}px serif`;
    ctx.fillText(card.roman, x + width / 2, y + height * 0.075);
    ctx.font = `600 ${Math.max(13, Math.round(width * 0.067))}px serif`;
    ctx.fillText(card.name, x + width / 2, y + height * 0.865);
    ctx.font = `${Math.max(9, Math.round(width * 0.038))}px serif`;
    ctx.fillStyle = "rgba(227, 195, 124, 0.82)";
    ctx.fillText(card.englishName.toUpperCase(), x + width / 2, y + height * 0.91);
  }

  ctx.strokeStyle = "rgba(224, 191, 121, 0.60)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

function drawWrappedText(
  ctx: Canvas2DContext,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const lines = wrapPosterText(text, maxWidth, maxLines, (value) => ctx.measureText(value).width);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return lines.length;
}

function exportCanvas(
  canvas: WechatMiniprogram.Canvas,
  page: WechatMiniprogram.Page.TrivialInstance,
): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width: POSTER_WIDTH,
      height: POSTER_HEIGHT,
      destWidth: POSTER_WIDTH,
      destHeight: POSTER_HEIGHT,
      fileType: "jpg",
      quality: 0.94,
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: reject,
    }, page);
  });
}

function drawRotatedImage(
  ctx: Canvas2DContext,
  image: WechatMiniprogram.Image,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  radians: number,
  alpha = 1,
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(radians);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(0, 0, 0, 0.68)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(224, 191, 121, 0.48)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-width / 2, -height / 2, width, height);
  ctx.restore();
}

export async function createAppSharePoster(
  page: WechatMiniprogram.Page.TrivialInstance,
): Promise<string> {
  const canvas = await getCanvas(page);
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext("2d");
  const [shareCode, logo, cardBack] = await Promise.all([
    fetchShareCode().then((path) => loadCanvasImage(canvas, path)),
    loadCanvasImage(canvas, "/assets/branding/arcana-mirror-logo.jpg"),
    loadCanvasImage(canvas, "/assets/cards/card-back.jpg"),
  ]);

  drawBackground(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#e0bf79";
  ctx.font = "24px serif";
  ctx.fillText("MIRRORLIGHT · 心镜拾光", 500, 132);

  ctx.save();
  ctx.beginPath();
  ctx.arc(500, 244, 78, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, 422, 166, 156, 156);
  ctx.restore();
  ctx.strokeStyle = "rgba(224, 191, 121, 0.58)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(500, 244, 84, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f4ead7";
  ctx.font = "600 68px serif";
  ctx.fillText("翻开牌面，", 500, 405);
  ctx.fillText("照见自己。", 500, 490);
  ctx.fillStyle = "rgba(244, 234, 215, 0.65)";
  ctx.font = "28px sans-serif";
  ctx.fillText("用图像卡片整理当下，找到可以迈出的下一小步", 500, 550);

  drawRotatedImage(ctx, cardBack, 315, 810, 220, 330, -0.14, 0.62);
  drawRotatedImage(ctx, cardBack, 685, 810, 220, 330, 0.14, 0.62);
  drawRotatedImage(ctx, cardBack, 500, 790, 260, 390, 0);

  ctx.fillStyle = "#b89657";
  ctx.font = "22px sans-serif";
  ctx.fillText("每日一牌   ·   单牌与三牌   ·   AI 文字整理", 500, 1058);
  ctx.strokeStyle = "rgba(184, 150, 87, 0.28)";
  ctx.beginPath();
  ctx.moveTo(150, 1102);
  ctx.lineTo(850, 1102);
  ctx.stroke();

  const codeY = 1240;
  ctx.fillStyle = "#f1eadc";
  ctx.fillRect(76, codeY - 14, 306, 306);
  ctx.drawImage(shareCode, 89, codeY - 1, 280, 280);
  ctx.strokeStyle = "rgba(184, 150, 87, 0.55)";
  ctx.strokeRect(76, codeY - 14, 306, 306);

  ctx.textAlign = "left";
  ctx.fillStyle = "#e0bf79";
  ctx.font = "600 30px serif";
  ctx.fillText("长按识别小程序码", 430, codeY + 66);
  ctx.fillStyle = "rgba(244, 234, 215, 0.74)";
  ctx.font = "26px sans-serif";
  ctx.fillText("来看看，此刻什么值得被看见", 430, codeY + 116);
  ctx.fillStyle = "rgba(244, 234, 215, 0.42)";
  ctx.font = "19px sans-serif";
  ctx.fillText("娱乐性自我探索 · 不替代专业意见", 430, codeY + 171);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(184, 150, 87, 0.45)";
  ctx.font = "18px serif";
  ctx.fillText("A QUIET RITUAL FOR CLARITY", 500, 1594);

  return exportCanvas(canvas, page);
}

export async function createSharePoster(
  page: WechatMiniprogram.Page.TrivialInstance,
  content: SharePosterContent,
): Promise<string> {
  const canvas = await getCanvas(page);
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext("2d");

  const [shareCode, frame, ...cardImages] = await Promise.all([
    fetchShareCode().then((path) => loadCanvasImage(canvas, path)),
    loadCanvasImage(canvas, "/assets/cards/front-frame-overlay.png"),
    ...content.cards.map((card) => loadCanvasImage(canvas, card.imagePath)),
  ]);

  drawBackground(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#e0bf79";
  ctx.font = "24px serif";
  ctx.fillText("MIRRORLIGHT · 心镜拾光", 500, 132);
  ctx.fillStyle = "rgba(244, 234, 215, 0.64)";
  ctx.font = "21px sans-serif";
  ctx.fillText(`${content.topic} · ${content.date}`, 500, 172);
  ctx.fillStyle = "#f4ead7";
  ctx.font = "600 48px serif";
  ctx.fillText(content.title, 500, 232);

  const isThree = content.cards.length > 1;
  const cardWidth = isThree ? 190 : 286;
  const cardHeight = cardWidth * 1.5;
  const gap = 38;
  const totalWidth = cardWidth * content.cards.length + gap * (content.cards.length - 1);
  const startX = (POSTER_WIDTH - totalWidth) / 2;
  const cardsY = 282;
  content.cards.forEach((card, index) => {
    drawCard(
      ctx,
      cardImages[index],
      card.arcana === "minor" ? frame : null,
      card,
      startX + index * (cardWidth + gap),
      cardsY,
      cardWidth,
      cardHeight,
    );
  });

  const readingY = isThree ? 648 : 760;
  ctx.textAlign = "left";
  ctx.fillStyle = "#b89657";
  ctx.font = "22px sans-serif";
  ctx.fillText("✦  第一眼线索", 88, readingY);
  ctx.fillStyle = "#f4ead7";
  ctx.font = "38px serif";
  const summaryLines = drawWrappedText(ctx, content.summary, 88, readingY + 62, 824, 58, isThree ? 4 : 3);

  const actionY = readingY + 94 + summaryLines * 58;
  ctx.strokeStyle = "rgba(184, 150, 87, 0.30)";
  ctx.beginPath();
  ctx.moveTo(88, actionY);
  ctx.lineTo(912, actionY);
  ctx.stroke();
  ctx.fillStyle = "rgba(224, 191, 121, 0.76)";
  ctx.font = "21px sans-serif";
  ctx.fillText("今天只做这一件小事", 88, actionY + 48);
  ctx.fillStyle = "rgba(244, 234, 215, 0.82)";
  ctx.font = "30px sans-serif";
  drawWrappedText(ctx, content.microAction, 88, actionY + 94, 824, 47, 2);

  const codeY = 1240;
  ctx.fillStyle = "#f1eadc";
  ctx.fillRect(76, codeY - 14, 306, 306);
  ctx.drawImage(shareCode, 89, codeY - 1, 280, 280);
  ctx.strokeStyle = "rgba(184, 150, 87, 0.55)";
  ctx.strokeRect(76, codeY - 14, 306, 306);

  ctx.fillStyle = "#e0bf79";
  ctx.font = "600 30px serif";
  ctx.fillText("长按识别小程序码", 430, codeY + 58);
  ctx.fillStyle = "rgba(244, 234, 215, 0.76)";
  ctx.font = "26px sans-serif";
  ctx.fillText("来照见你此刻真正关心的事", 430, codeY + 105);
  ctx.fillStyle = "rgba(244, 234, 215, 0.42)";
  ctx.font = "19px sans-serif";
  ctx.fillText("娱乐性自我探索 · 不替代专业意见", 430, codeY + 154);
  ctx.fillText("分享图不会展示你的原问题", 430, codeY + 191);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(184, 150, 87, 0.45)";
  ctx.font = "18px serif";
  ctx.fillText("KEEP WHAT RESONATES · LEAVE THE REST", 500, 1594);

  return exportCanvas(canvas, page);
}
