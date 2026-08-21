# PowerShell script to revert ALL modal-header replacements back to original
# The original pattern works fine in both modal and non-modal contexts

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    
    # Revert all modal-header back to original pattern
    while ($content.Contains('className="modal-header"')) {
        $content = $content.Replace('className="modal-header"', 'className="flex items-center justify-between mb-6"')
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        Write-Host "Reverted: $($file.Name)"
    }
}

Write-Host "`nFiles reverted: $filesFixed"
