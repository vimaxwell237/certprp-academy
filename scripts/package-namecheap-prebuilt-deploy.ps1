Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$deployRoot = Join-Path $repoRoot "deploy"
$stagingRoot = Join-Path $deployRoot "namecheap-prebuilt-upload"
$zipPath = Join-Path $deployRoot "certprep-namecheap-prebuilt-upload.zip"

$excludeDirectories = @(
  ".git",
  ".vscode",
  "coverage",
  "deploy",
  "node_modules",
  "playwright-report",
  "test-results",
  "tests",
  "docs"
)

$excludeFiles = @(
  ".env.local",
  "tsconfig.tsbuildinfo",
  "tsconfig.typecheck.tsbuildinfo"
)

$requiredPaths = @(
  ".next",
  "package.json",
  "package-lock.json",
  "server.js",
  "next.config.mjs"
)

foreach ($requiredPath in $requiredPaths) {
  $fullPath = Join-Path $repoRoot $requiredPath
  if (-not (Test-Path $fullPath)) {
    throw "Required deployment path missing: $requiredPath. Run 'npm run build' first."
  }
}

if (Test-Path $stagingRoot) {
  Remove-Item -LiteralPath $stagingRoot -Recurse -Force
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

New-Item -ItemType Directory -Path $stagingRoot | Out-Null

Get-ChildItem -LiteralPath $repoRoot -Force | ForEach-Object {
  $item = $_

  if ($excludeDirectories -contains $item.Name) {
    return
  }

  if ($excludeFiles -contains $item.Name) {
    return
  }

  $destination = Join-Path $stagingRoot $item.Name

  if ($item.PSIsContainer) {
    Copy-Item -LiteralPath $item.FullName -Destination $destination -Recurse -Force
  } else {
    Copy-Item -LiteralPath $item.FullName -Destination $destination -Force
  }
}

$nextCachePath = Join-Path $stagingRoot ".next\\cache"
if (Test-Path $nextCachePath) {
  Remove-Item -LiteralPath $nextCachePath -Recurse -Force
}

Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -Force

Write-Output ""
Write-Output "Created prebuilt deployment bundle:"
Write-Output $zipPath
Write-Output ""
Write-Output "Upload this zip to your Namecheap cPanel app folder, extract it, run npm install, and restart the app."
