# Context-aware script to apply modal-header only inside actual modals
# Strategy: Track nesting level. When we see modal-overlay, we're in a modal.
# The first "flex items-center justify-between mb-6" after modal-content is the header.

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0
$totalHeaders = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    
    # Skip main dashboard page.tsx
    if ($filePath -eq "$dashboardPath\page.tsx") {
        continue
    }
    
    # Only process files that have modal-overlay class
    if (-not $content.Contains('className="modal-overlay"')) {
        continue
    }
    
    $lines = $content -split "`r?`n"
    $inModalOverlay = $inModalContent = $foundHeaderInModal = $false
    $braceDepth = 0
    $newLines = @()
    $fileHeaders = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Detect start of modal overlay
        if ($line -match 'className="modal-overlay"') {
            $inModalOverlay = $true
            $inModalContent = $false
            $foundHeaderInModal = $false
        }
        
        # Detect modal-content inside a modal
        if ($inModalOverlay -and -not $inModalContent -and $line -match 'className="modal-content"') {
            $inModalContent = $true
        }
        
        # If we're inside a modal with content defined, and we haven't found the header yet,
        # look for the header pattern
        if ($inModalOverlay -and $inModalContent -and -not $foundHeaderInModal) {
            if ($line -match 'className="flex items-center justify-between mb-6"') {
                $line = $line.Replace('className="flex items-center justify-between mb-6"', 'className="modal-header"')
                $foundHeaderInModal = $true
                $fileHeaders++
            }
            # Also look for the h2/h3 that follows - if we hit a form or div before the header,
            # we've gone past it (some modals don't have a separate header div)
            if ($line -match '<form ' -or $line -match 'className="space-y-4"') {
                $foundHeaderInModal = $true  # Skip header detection, no header div
            }
        }
        
        # Track when we exit the modal overlay context
        # Simple heuristic: count opening/closing braces and detect when we're back at top level
        # Actually, let's use a simpler approach: reset when we see another modal-overlay
        # or when we see patterns that indicate we're outside the modal (like a new conditional block)
        
        $newLines += $line
    }
    
    $content = $newLines -join "`r`n"
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        $totalHeaders += $fileHeaders
        Write-Host "Fixed: $($file.Name) ($fileHeaders headers)"
    }
}

Write-Host "`n=== Summary ==="
Write-Host "Files fixed: $filesFixed"
Write-Host "Total modal headers converted: $totalHeaders"
