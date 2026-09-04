#Requires -Version 5.1
<#
  Daocheng Will Platform - Local Start
  Security: bind 127.0.0.1 only. No remote install scripts.
#>
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root 'package.json'))) {
  Write-Host '[ERROR] package.json not found. Put scripts under will-demo\scripts\' -ForegroundColor Red
  exit 1
}
Set-Location -LiteralPath $Root

$Port = 5173
$HostAddr = '127.0.0.1'
$BaseUrl = "http://${HostAddr}:${Port}/"
$RunDir = Join-Path $Root '.run'
$PidFile = Join-Path $RunDir 'dev-server.pid'
$LogFile = Join-Path $RunDir 'dev-server.log'
$ErrFile = Join-Path $RunDir 'dev-server.err.log'
$MinNodeMajor = 18

function Write-Step([string]$Message) { Write-Host ("[.] " + $Message) -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host ("[OK] " + $Message) -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host ("[!] " + $Message) -ForegroundColor Yellow }
function Write-Err([string]$Message) { Write-Host ("[ERROR] " + $Message) -ForegroundColor Red }

function Resolve-NodeHome {
  $candidates = @(
    (Join-Path ${env:ProgramFiles} 'nodejs'),
    (Join-Path ${env:ProgramFiles(x86)} 'nodejs'),
    (Join-Path $env:LOCALAPPDATA 'Programs\nodejs')
  )
  foreach ($dir in $candidates) {
    if ((Test-Path (Join-Path $dir 'node.exe')) -and (Test-Path (Join-Path $dir 'npm.cmd'))) {
      return $dir
    }
  }
  $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npm) {
    $dir = Split-Path $npm.Source -Parent
    if (Test-Path (Join-Path $dir 'node.exe')) { return $dir }
  }
  return $null
}

function Test-HttpReady([string]$Url) {
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500)
  } catch {
    return $false
  }
}

function Test-PortListening([int]$PortNumber) {
  try {
    $c = Get-NetTCPConnection -LocalAddress $HostAddr -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue
    if ($c) { return $true }
  } catch {}
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($HostAddr, $PortNumber, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(350)
    if ($ok -and $client.Connected) {
      $client.EndConnect($iar) | Out-Null
      $client.Close()
      return $true
    }
    $client.Close()
  } catch {}
  return $false
}

function Show-Urls {
  Write-Host ''
  Write-Host ' ----------------------------------------'
  Write-Host '  Daocheng Will Platform is ready'
  Write-Host "  Portal : $BaseUrl"
  Write-Host "  H5     : ${BaseUrl}#/h5/login"
  Write-Host "  Admin  : ${BaseUrl}#/admin"
  Write-Host "  Screen : ${BaseUrl}#/admin/screen"
  Write-Host '  Account: 19526955095 / 123456'
  Write-Host ' ----------------------------------------'
  Write-Host '  Security: 127.0.0.1 only (not exposed to LAN/WAN)' -ForegroundColor DarkGray
  Write-Host '  Stop    : double-click stop.bat' -ForegroundColor DarkGray
  Write-Host "  Logs    : $LogFile" -ForegroundColor DarkGray
  Write-Host ''
}

Write-Host ''
Write-Host ' ========================================'
Write-Host '  Daocheng Will Platform - Local Start'
Write-Host ' ========================================'
Write-Host ''

Write-Step 'Resolve Node.js runtime...'
$nodeHome = Resolve-NodeHome
if (-not $nodeHome) {
  Write-Err 'Node.js 18+ not found. Install LTS from https://nodejs.org/ then retry.'
  exit 2
}
# Prefer system Node+npm together (avoid Cursor helper node mismatch)
$env:Path = "$nodeHome;" + $env:Path
$nodeExe = Join-Path $nodeHome 'node.exe'
$npmCmd = Join-Path $nodeHome 'npm.cmd'
$nodeVer = & $nodeExe -v
$npmVer = & $npmCmd -v
$nodeMajor = 0
if ($nodeVer -match 'v?(\d+)') { $nodeMajor = [int]$Matches[1] }
if ($nodeMajor -lt $MinNodeMajor) {
  Write-Err "Node.js $nodeVer is too old. Need ${MinNodeMajor}+."
  exit 2
}
Write-Ok "Node $nodeVer / npm $npmVer ($nodeHome)"

Write-Step 'Check dependencies...'
$viteJs = Join-Path $Root 'node_modules\vite\bin\vite.js'
$viteCmd = Join-Path $Root 'node_modules\.bin\vite.cmd'
if (-not (Test-Path $viteJs)) {
  Write-Warn 'Installing npm dependencies (package.json only)...'
  & $npmCmd install --no-fund --no-audit
  if ($LASTEXITCODE -ne 0) {
    Write-Err 'npm install failed. Check network / package.json.'
    exit 3
  }
  Write-Ok 'Dependencies installed'
} else {
  Write-Ok 'Dependencies ready'
}

if (-not (Test-Path $RunDir)) {
  New-Item -ItemType Directory -Path $RunDir | Out-Null
}

if (Test-HttpReady $BaseUrl) {
  Write-Ok "Already running: $BaseUrl"
  try { Start-Process $BaseUrl | Out-Null; Write-Ok 'Browser opened' } catch { Write-Warn "Open manually: $BaseUrl" }
  Show-Urls
  exit 0
}

# Clean stale pid
if (Test-Path $PidFile) {
  $oldPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($oldPid) { $oldPid = "$oldPid".Trim() }
  if ($oldPid -match '^\d+$') {
    $alive = Get-Process -Id ([int]$oldPid) -ErrorAction SilentlyContinue
    if (-not $alive) {
      Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    } elseif (-not (Test-PortListening $Port)) {
      Write-Warn "Stale PID $oldPid, killing..."
      taskkill /PID $oldPid /T /F 2>$null | Out-Null
      Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    }
  }
}

if ((Test-PortListening $Port) -and -not (Test-HttpReady $BaseUrl)) {
  Write-Err "Port $Port is occupied by another process."
  exit 4
}

Write-Step "Start server on ${HostAddr}:${Port} (localhost only)..."
Remove-Item $LogFile -Force -ErrorAction SilentlyContinue
Remove-Item $ErrFile -Force -ErrorAction SilentlyContinue

# Launch via cmd with PATH pinned to system Node; redirect logs separately
$startLine = "set `"PATH=$nodeHome;%PATH%`" && `"$npmCmd`" run start"
$arg = "/d /c `"$startLine > `"$LogFile`" 2> `"$ErrFile`"`""
$proc = Start-Process -FilePath $env:ComSpec `
  -ArgumentList $arg `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -PassThru

if (-not $proc) {
  Write-Err 'Failed to create process.'
  exit 5
}
Set-Content -Path $PidFile -Value $proc.Id -Encoding ascii
Write-Ok "Process started, PID $($proc.Id)"

Write-Step 'Health check...'
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  if (Test-HttpReady $BaseUrl) {
    $ready = $true
    break
  }
  if ($proc.HasExited) {
    Start-Sleep -Milliseconds 600
    if (Test-HttpReady $BaseUrl) {
      $ready = $true
      break
    }
    Write-Err "Process exited (code $($proc.ExitCode)). See:"
    Write-Host "  $LogFile"
    Write-Host "  $ErrFile"
    if (Test-Path $ErrFile) { Get-Content $ErrFile -ErrorAction SilentlyContinue | Select-Object -First 20 | ForEach-Object { Write-Host $_ -ForegroundColor Red } }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    exit 5
  }
}

if (-not $ready) {
  Write-Err "Startup timeout. See logs: $LogFile / $ErrFile"
  try { taskkill /PID $proc.Id /T /F 2>$null | Out-Null } catch {}
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  exit 6
}

Write-Ok "Ready: $BaseUrl"
try {
  Start-Process $BaseUrl | Out-Null
  Write-Ok 'Browser opened'
} catch {
  Write-Warn "Open manually: $BaseUrl"
}
Show-Urls
exit 0
