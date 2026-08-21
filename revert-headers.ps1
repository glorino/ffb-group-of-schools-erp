# PowerShell script to revert incorrect modal-header replacements
# The className="flex items-center justify-between mb-6" pattern is used in both
# modal headers AND regular section headers. We need to only keep modal-header
# where it's actually inside a modal (near modal-overlay).

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    
    # Only process files that have modal-overlay class (meaning they have modals)
    if (-not $content.Contains('className="modal-overlay"')) {
        # File has no modals, so any modal-header is incorrect
        # Revert all modal-header back to original
        while ($content.Contains('className="modal-header"')) {
            $content = $content.Replace('className="modal-header"', 'className="flex items-center justify-between mb-6"')
        }
    } else {
        # File has modals - need to be more careful
        # Count occurrences of modal-overlay vs modal-header
        $overlayCount = ([regex]::Matches($content, 'className="modal-overlay"')).Count
        $headerCount = ([regex]::Matches($content, 'className="modal-header"')).Count
        
        # If there are more headers than overlays, some headers are non-modal
        # In this case, revert ALL header changes to be safe
        # (the ones that are actually in modals should still work with the original classes)
        if ($headerCount -gt $overlayCount) {
            while ($content.Contains('className="modal-header"')) {
                $content = $content.Replace('className="modal-header"', 'className="flex items-center justify-between mb-6"')
            }
        }
    }
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        Write-Host "Reverted: $($file.Name)"
    }
}

Write-Host "`nFiles reverted: $filesFixed"
