[CmdletBinding()]
param(
  [string]$ManifestPath = 'results/private_dps_logs/manifest.local.json'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$manifestAbsolutePath = [System.IO.Path]::GetFullPath($ManifestPath)
$privateRoot = Split-Path -Parent $manifestAbsolutePath
$sourceDirectory = Join-Path $privateRoot 'sources'
New-Item -ItemType Directory -Force -Path $sourceDirectory | Out-Null

if (-not (Test-Path -LiteralPath $manifestAbsolutePath)) {
  throw "비공개 로그 매니페스트를 찾을 수 없습니다: $ManifestPath"
}

$manifest = Get-Content -LiteralPath $manifestAbsolutePath -Raw -Encoding UTF8 | ConvertFrom-Json
$collectedAt = [DateTime]::UtcNow.ToString('o')

foreach ($record in $manifest.records) {
  $analysisId = [string]$record.analysisId
  if ([string]::IsNullOrWhiteSpace($analysisId)) {
    throw 'analysisId가 비어 있는 레코드가 있습니다.'
  }

  $recordId = ([string]$record.url).TrimEnd('/') -split '/' | Select-Object -Last 1
  if ([string]::IsNullOrWhiteSpace($recordId)) {
    throw "${analysisId}: 비공개 URL에서 기록 ID를 읽을 수 없습니다."
  }

  $temporaryPath = Join-Path $sourceDirectory "$analysisId.download"
  $outputPath = Join-Path $sourceDirectory "$analysisId.json"
  $apiUrl = "https://mobi-score.com/api/record-share/$recordId"

  & curl.exe --fail --location --silent --show-error --connect-timeout 15 --max-time 45 --output $temporaryPath $apiUrl
  if ($LASTEXITCODE -ne 0) {
    Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
    throw "${analysisId}: 원본 응답 수집에 실패했습니다."
  }

  try {
    $outer = Get-Content -LiteralPath $temporaryPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace([string]$outer.recordJson)) {
      throw 'recordJson이 비어 있습니다.'
    }
    [void](([string]$outer.recordJson | ConvertFrom-Json))
  } catch {
    Remove-Item -LiteralPath $temporaryPath -Force -ErrorAction SilentlyContinue
    throw "${analysisId}: 응답 또는 recordJson이 유효한 JSON이 아닙니다. $($_.Exception.Message)"
  }

  Move-Item -LiteralPath $temporaryPath -Destination $outputPath -Force
  $sourceSha256 = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $recordJsonSha256 = [System.Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes([string]$outer.recordJson))).ToLowerInvariant()
  $record | Add-Member -NotePropertyName sourceSha256 -NotePropertyValue $sourceSha256 -Force
  $record | Add-Member -NotePropertyName recordJsonSha256 -NotePropertyValue $recordJsonSha256 -Force
  $record | Add-Member -NotePropertyName collectedAt -NotePropertyValue $collectedAt -Force
  Write-Output "$analysisId 수집·검증 완료"
}

$manifest.collectedAt = $collectedAt
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestAbsolutePath -Encoding UTF8
Write-Output "비공개 원본 $($manifest.records.Count)건 수집 완료"
