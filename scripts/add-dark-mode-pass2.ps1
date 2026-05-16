$ErrorActionPreference = 'Stop'

# Pass 2: target files that already have SOME dark: but still have
# hardcoded light tokens missing their dark counterpart.
# Uses negative lookahead so we never double-apply when the dark variant
# is already adjacent.

$root = Join-Path $PSScriptRoot '..\src'
$root = (Resolve-Path $root).Path

$replacements = @(
    @{ token = 'bg-white';        dark = 'dark:bg-gray-800';   followGroup = 'bg' },
    @{ token = 'bg-gray-50';      dark = 'dark:bg-gray-900';   followGroup = 'bg' },
    @{ token = 'bg-gray-100';     dark = 'dark:bg-gray-800';   followGroup = 'bg' },
    @{ token = 'bg-gray-200';     dark = 'dark:bg-gray-700';   followGroup = 'bg' },
    @{ token = 'bg-slate-50';     dark = 'dark:bg-gray-900';   followGroup = 'bg' },
    @{ token = 'bg-slate-100';    dark = 'dark:bg-gray-800';   followGroup = 'bg' },
    @{ token = 'text-gray-900';   dark = 'dark:text-gray-100'; followGroup = 'text' },
    @{ token = 'text-gray-800';   dark = 'dark:text-gray-200'; followGroup = 'text' },
    @{ token = 'text-gray-700';   dark = 'dark:text-gray-300'; followGroup = 'text' },
    @{ token = 'text-gray-600';   dark = 'dark:text-gray-400'; followGroup = 'text' },
    @{ token = 'text-gray-500';   dark = 'dark:text-gray-400'; followGroup = 'text' },
    @{ token = 'text-slate-900';  dark = 'dark:text-slate-100'; followGroup = 'text' },
    @{ token = 'text-slate-800';  dark = 'dark:text-slate-200'; followGroup = 'text' },
    @{ token = 'text-slate-700';  dark = 'dark:text-slate-300'; followGroup = 'text' },
    @{ token = 'text-slate-600';  dark = 'dark:text-slate-400'; followGroup = 'text' },
    @{ token = 'border-gray-100'; dark = 'dark:border-gray-700'; followGroup = 'border' },
    @{ token = 'border-gray-200'; dark = 'dark:border-gray-700'; followGroup = 'border' },
    @{ token = 'border-gray-300'; dark = 'dark:border-gray-700'; followGroup = 'border' },
    @{ token = 'border-slate-100'; dark = 'dark:border-slate-700'; followGroup = 'border' },
    @{ token = 'border-slate-200'; dark = 'dark:border-slate-700'; followGroup = 'border' },
    @{ token = 'border-slate-300'; dark = 'dark:border-slate-700'; followGroup = 'border' },
    @{ token = 'divide-gray-200'; dark = 'dark:divide-gray-700'; followGroup = 'divide' }
)

$files = Get-ChildItem -Path $root -Recurse -Include *.jsx, *.js -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\'
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$modified = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $original = $content

    foreach ($r in $replacements) {
        $token = [regex]::Escape($r.token)
        # complete token, NOT immediately followed by " dark:<group>-"
        # boundary: preceded by start, whitespace, quote, backtick;
        # followed by whitespace, quote, backtick.
        $pattern = "(?<=^|[\s`"'``])$token(?=[\s`"'``])(?!\s+dark:$($r.followGroup)-)"
        $newContent = [regex]::Replace($content, $pattern, "$($r.token) $($r.dark)")
        if ($newContent -ne $content) {
            $matches = ([regex]::Matches($content, $pattern)).Count
            $totalReplacements += $matches
            $content = $newContent
        }
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        $modified++
    }
}

Write-Output "Files modified in pass 2: $modified"
Write-Output "Total replacements: $totalReplacements"
