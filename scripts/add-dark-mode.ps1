$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot '..\src'
$root = (Resolve-Path $root).Path

$replacements = @(
    @{ token = 'bg-white';        dark = 'dark:bg-gray-800' },
    @{ token = 'bg-gray-50';      dark = 'dark:bg-gray-900' },
    @{ token = 'bg-gray-100';     dark = 'dark:bg-gray-800' },
    @{ token = 'bg-gray-200';     dark = 'dark:bg-gray-700' },
    @{ token = 'bg-slate-50';     dark = 'dark:bg-gray-900' },
    @{ token = 'bg-slate-100';    dark = 'dark:bg-gray-800' },
    @{ token = 'bg-slate-200';    dark = 'dark:bg-gray-700' },
    @{ token = 'text-gray-900';   dark = 'dark:text-gray-100' },
    @{ token = 'text-gray-800';   dark = 'dark:text-gray-200' },
    @{ token = 'text-gray-700';   dark = 'dark:text-gray-300' },
    @{ token = 'text-gray-600';   dark = 'dark:text-gray-400' },
    @{ token = 'text-gray-500';   dark = 'dark:text-gray-400' },
    @{ token = 'text-slate-900';  dark = 'dark:text-slate-100' },
    @{ token = 'text-slate-800';  dark = 'dark:text-slate-200' },
    @{ token = 'text-slate-700';  dark = 'dark:text-slate-300' },
    @{ token = 'text-slate-600';  dark = 'dark:text-slate-400' },
    @{ token = 'text-slate-500';  dark = 'dark:text-slate-400' },
    @{ token = 'border-gray-100'; dark = 'dark:border-gray-700' },
    @{ token = 'border-gray-200'; dark = 'dark:border-gray-700' },
    @{ token = 'border-gray-300'; dark = 'dark:border-gray-700' },
    @{ token = 'border-slate-100'; dark = 'dark:border-slate-700' },
    @{ token = 'border-slate-200'; dark = 'dark:border-slate-700' },
    @{ token = 'border-slate-300'; dark = 'dark:border-slate-700' },
    @{ token = 'divide-gray-200'; dark = 'dark:divide-gray-700' }
)

$files = Get-ChildItem -Path $root -Recurse -Include *.jsx, *.js -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$modified = 0
$skippedHasDark = 0
$untouched = 0
$modifiedFiles = @()

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    if ($content -match 'dark:') {
        $skippedHasDark++
        continue
    }

    $original = $content

    foreach ($r in $replacements) {
        $token = [regex]::Escape($r.token)
        $pattern = "(?<=^|[\s`"'``])$token(?=[\s`"'``])"
        $content = [regex]::Replace($content, $pattern, "$($r.token) $($r.dark)")
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        $modified++
        $modifiedFiles += $file.FullName.Substring($root.Length + 1)
    }
    else {
        $untouched++
    }
}

Write-Output "Modified: $modified"
Write-Output "Skipped (already has dark:): $skippedHasDark"
Write-Output "Scanned but unchanged: $untouched"
Write-Output ""
Write-Output "First 20 modified files:"
$modifiedFiles | Select-Object -First 20
