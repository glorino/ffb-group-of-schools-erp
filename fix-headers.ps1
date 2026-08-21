# PowerShell script to correctly apply modal-header only inside modals
# Strategy: For each file, find headers that appear between modal-overlay and modal-content
# These are the actual modal headers

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
    
    # Find lines that contain modal-overlay
    $lines = $content -split "`r?`n"
    $inModal = $false
    $inModalContent = $false
    $newLines = @()
    $fileHeaders = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Check if this line starts a modal overlay
        if ($line -match 'className="modal-overlay"') {
            $inModal = $true
            $inModalContent = $false
        }
        
        # Check if this line contains modal-content (meaning we're past the header area)
        if ($inModal -and $line -match 'className="modal-content"') {
            $inModalContent = $true
        }
        
        # If we're in a modal but not yet in modal-content, and this line has the header pattern
        if ($inModal -and -not $inModalContent -and $line -match 'className="flex items-center justify-between mb-6"') {
            $line = $line.Replace('className="flex items-center justify-between mb-6"', 'className="modal-header"')
            $fileHeaders++
        }
        
        # Check if this line closes the modal (closing div or motion.div)
        # Simple heuristic: if we hit a closing tag after modal-content, we're done with this modal
        if ($inModalContent -and $line -match '^\s*</(div|motion\.div)>' -and $line -notmatch 'onClick') {
            # Could be end of modal content, but keep scanning for more modals
        }
        
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
