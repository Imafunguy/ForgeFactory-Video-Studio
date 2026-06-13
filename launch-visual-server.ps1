# launch-visual-server.ps1
# Self-contained launcher for ForgeFactory v2 Hyperframes + FFmpeg visual brainstorming session.
# Creates a persistent session under .superpowers/brainstorm/ for the visual companion server.

$projectRoot = 'C:\Users\fichb\Desktop\ForgeFactory\Working'
$brainstormRoot = Join-Path $projectRoot '.superpowers\brainstorm'
New-Item -ItemType Directory -Force -Path $brainstormRoot | Out-Null

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$rand = Get-Random -Minimum 1000 -Maximum 9999
$sessionId = "ff-hyperframes-$timestamp-$rand"

$sessionDir = Join-Path $brainstormRoot $sessionId
$contentDir = Join-Path $sessionDir 'content'
$stateDir = Join-Path $sessionDir 'state'

New-Item -ItemType Directory -Force -Path $contentDir, $stateDir | Out-Null

$latestFile = Join-Path $brainstormRoot 'latest-session.txt'
"SESSION:$sessionDir" | Out-File -FilePath $latestFile -Encoding utf8 -Force

Write-Host ("LAUNCHING_VISUAL: sessionDir=" + $sessionDir + " contentDir=" + $contentDir + " stateDir=" + $stateDir)

$env:BRAINSTORM_DIR = $sessionDir
$env:BRAINSTORM_HOST = '127.0.0.1'
$env:BRAINSTORM_URL_HOST = 'localhost'
$env:BRAINSTORM_OWNER_PID = '0'

# Start the long-running Node content + WS server (it will print the server-started JSON and write server-info).
& node 'C:\Users\fichb\.grok\installed-plugins\superpowers-21e2a56d\skills\brainstorming\scripts\server.cjs'
