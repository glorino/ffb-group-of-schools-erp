# Fix double >> characters from the modal-overlay replacements

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    
    # Fix double >> patterns
    $content = $content.Replace('modal-overlay">>', 'modal-overlay">')
    $content = $content.Replace("modal-overlay'>(''>", "modal-overlay'>")
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nFiles fixed: $filesFixed"
