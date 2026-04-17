Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$deployRoot = Join-Path $repoRoot "deploy"
$stagingRoot = Join-Path $deployRoot "namecheap-upload"
$zipPath = Join-Path $deployRoot "certprep-namecheap-upload.zip"

$excludeDirectories = @(
  ".git",
  ".next",
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

Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -Force

Write-Output ""
Write-Output "Created deployment bundle:"
Write-Output $zipPath
Write-Output ""
Write-Output "Upload this zip to your Namecheap cPanel app folder, extract it, then run:"
Write-Output "npm install"
Write-Output "npm run build"
