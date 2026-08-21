# PowerShell script to fix broken onClick handlers from the first pass
# This fixes cases where onClick values were lost or doubled

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    
    # Fix broken onClick= with no value - these were part of onClick={...} handlers
    # Pattern: "modal-overlay" onClick= (with space or newline before closing >)
    # We need to look at context to restore the onClick handler
    
    # Fix double onClick patterns: onClick= onClick={...}
    $doubleOnClickRegex = [regex]'onClick= onClick=\{([^}]+)\}'
    if ($doubleOnClickRegex.IsMatch($content)) {
        $content = $doubleOnClickRegex.Replace($content, 'onClick={$1}')
    }
    
    # Fix broken onClick= at end of line (no value)
    # These need to be removed since they had onClick={...} that got corrupted
    $brokenOnClickPatterns = @(
        'className="modal-overlay" onClick=>',
        'className="modal-overlay" onClick= >',
        'className="modal-overlay" onClick=  >'
    )
    
    foreach ($pattern in $brokenOnClickPatterns) {
        if ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-overlay">')
        }
    }
    
    # Write back if changes were made
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nFiles fixed: $filesFixed"
