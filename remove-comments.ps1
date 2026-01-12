$files = Get-ChildItem -Path . -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules' -and 
        $_.FullName -notmatch 'coverage' -and 
        $_.FullName -notmatch 'dist' -and
        $_.FullName -notmatch '\.vscode' -and
        $_.FullName -notmatch '\.git'
    }

$totalFiles = $files.Count
$processedFiles = 0

Write-Host "Found $totalFiles files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    $processedFiles++
    Write-Host "[$processedFiles/$totalFiles] Processing: $($file.Name)" -ForegroundColor Gray
    
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    $content = $content -replace '(?m)(?<!:)//.*$', ''
    $content = $content -replace '(?s)/\*.*?\*/', ''
    $content = $content -replace '(?m)^\s*$(\r?\n)', '$1'
    $content = $content -replace '(\r?\n){3,}', '$1$1'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Removed comments" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Completed! Processed $processedFiles files." -ForegroundColor Cyan
