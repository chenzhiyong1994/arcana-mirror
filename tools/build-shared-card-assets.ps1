$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceFrame = Join-Path $projectRoot "assets/tarot-card-style/shared/front-frame-overlay.png"
$runtimeFrame = Join-Path $projectRoot "apps/miniprogram/assets/cards/front-frame-overlay.png"
$ffmpeg = Get-Command ffmpeg -ErrorAction Stop

if (-not (Test-Path -LiteralPath $sourceFrame)) {
  throw "Missing canonical shared frame: $sourceFrame"
}

& $ffmpeg.Source `
  -y `
  -v error `
  -i $sourceFrame `
  -vf "scale=384:576:flags=lanczos" `
  -frames:v 1 `
  -compression_level 9 `
  -pred mixed `
  -pix_fmt rgba `
  $runtimeFrame

if ($LASTEXITCODE -ne 0) {
  throw "ffmpeg failed to build the runtime shared frame."
}

Write-Output "Built $runtimeFrame from the canonical 1024x1536 overlay."
