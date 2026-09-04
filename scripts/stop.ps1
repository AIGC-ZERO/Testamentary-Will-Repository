#Requires -Version 5.1
<#
  Daocheng Will Platform - Stop local server
#>
$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$Root = Split-Path -Parent $PSScriptRoot
$RunDir = Join-Path $Root '.run'
$PidFile = Join-Path $RunDir 'dev-server.pid'
$Port = 5173
$HostAddr = '127.0.0.1'

function Write-Ok([string]$Message) { Write-Host ("[OK] " + $Message) -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host ("[!] " + $Message) -ForegroundColor Yellow }
function Write-Step([string]$Message) { Write-Host ("[.] " + $Message) -ForegroundColor Cyan }

$stopped = $false

Write-Host ''
Write-Host ' ========================================'
Write-Host '  Daocheng Will Platform - Stop'
Write-Host ' ========================================'
Write-Host ''

if (Test-Path $PidFile) {
  $raw = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($raw -and ("$raw".Trim() -match '^\d+$')) {
    $pidNum = [int]("$raw".Trim())
    $proc = Get-Process -Id $pidNum -ErrorAction SilentlyContinue
    if ($proc) {
      Write-Step "Stop PID $pidNum ..."
      taskkill /PID $pidNum /T /F 2>$null | Out-Null
      Start-Sleep -Milliseconds 500
      $stopped = $true
      Write-Ok "Stopped PID $pidNum"
    } else {
      Write-Warn "PID file exists but process $pidNum is gone."
    }
  }
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
} else {
  Write-Warn 'No PID file. Trying port cleanup...'
}

try {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $owning = $c.OwningProcess
    if (-not $owning) { continue }
    $p = Get-Process -Id $owning -ErrorAction SilentlyContinue
    if ($p -and $p.ProcessName -match 'node|vite|cmd') {
      Write-Step "Release port $Port (PID $owning)..."
      taskkill /PID $owning /T /F 2>$null | Out-Null
      $stopped = $true
      Write-Ok "Port $Port released"
    }
  }
} catch {}

if (-not $stopped) {
  $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  foreach ($line in $lines) {
    if ($line -match '\s+(\d+)\s*$') {
      $pidNum = [int]$Matches[1]
      taskkill /PID $pidNum /T /F 2>$null | Out-Null
      $stopped = $true
      Write-Ok "Stopped listener PID $pidNum"
    }
  }
}

if ($stopped) {
  Write-Ok 'Local service stopped.'
  exit 0
}
Write-Warn 'No running local service found.'
exit 0
