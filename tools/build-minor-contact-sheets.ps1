$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$specPath = Join-Path $projectRoot "deliverables/style-a-minor-arcana-generation-kit/card-specs.json"
$sourceDirectory = Join-Path $projectRoot "assets/tarot-card-style/minor-arcana/faces"
$outputDirectory = Join-Path $projectRoot "assets/tarot-card-style/minor-arcana/contact-sheets"
$stagingRoot = Join-Path $projectRoot "workspace/minor-contact-sheet-staging"
$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source

$spec = Get-Content -LiteralPath $specPath -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null

foreach ($suit in @("wands", "cups", "swords", "pentacles")) {
  $cards = @($spec.cards | Where-Object { $_.suit -eq $suit } | Sort-Object sequence)
  if ($cards.Count -ne 14) {
    throw "Expected 14 $suit cards, found $($cards.Count)."
  }

  $stagingDirectory = Join-Path $stagingRoot $suit
  New-Item -ItemType Directory -Force -Path $stagingDirectory | Out-Null

  for ($index = 0; $index -lt $cards.Count; $index += 1) {
    $sourcePath = Join-Path $sourceDirectory $cards[$index].filename
    $stagingPath = Join-Path $stagingDirectory ("{0:D2}.jpg" -f $index)
    if (-not (Test-Path -LiteralPath $sourcePath)) {
      throw "Missing source face: $sourcePath"
    }
    Copy-Item -LiteralPath $sourcePath -Destination $stagingPath -Force
  }

  $inputPattern = Join-Path $stagingDirectory "%02d.jpg"
  $outputPath = Join-Path $outputDirectory "$suit.jpg"
  & $ffmpeg -hide_banner -loglevel error -y -framerate 1 -i $inputPattern `
    -frames:v 1 `
    -vf "scale=170:255:force_original_aspect_ratio=decrease,pad=170:255:(ow-iw)/2:(oh-ih)/2:color=0x090907,tile=7x2:padding=4:margin=4:color=0x090907" `
    -q:v 3 $outputPath

  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputPath)) {
    throw "Failed to build contact sheet for $suit."
  }
  Write-Output "Built $outputPath"
}
