# Comprehensive PowerShell script to fix ALL remaining modal patterns

$dashboardPath = "C:\Users\Martins\Downloads\ssv group of schools\ffb-erp\src\app\dashboard"
$pageFiles = Get-ChildItem -Path $dashboardPath -Recurse -Filter "page.tsx" -File

$filesFixed = 0
$totalReplacements = 0

foreach ($file in $pageFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath)
    $originalContent = $content
    $fileReplacements = 0
    
    # Skip the main dashboard page.tsx - it has intentionally styled modals
    if ($filePath -eq "$dashboardPath\page.tsx") {
        Write-Host "Skipping main dashboard page.tsx (intentionally styled modals)"
        continue
    }
    
    # 1. Replace modal overlay patterns - various styles with or without backdrop-blur
    # Pattern 1: with backdrop-blur-sm and bg-black/XX
    $overlayPatterns = @(
        'className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"',
        'className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"',
        'className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"',
        'className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"',
        'className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"',
        'className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"',
        'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"',
        'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"',
        'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"'
    )
    
    foreach ($pattern in $overlayPatterns) {
        while ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-overlay"')
            $fileReplacements++
        }
    }
    
    # Pattern 2: with style attribute for backdrop
    $styleOverlayRegex = [regex]'className="fixed inset-0 z-\d+ flex items-center justify-center p-4" style=\{\{ background: "rgba\(0,0,0,0\.6\)", backdropFilter: "blur\(8px\)" \}\}'
    while ($styleOverlayRegex.IsMatch($content)) {
        $content = $styleOverlayRegex.Replace($content, 'className="modal-overlay"')
        $fileReplacements++
    }
    
    # Pattern 3: fixed inset-0 z-50 with no bg classes but in the context of a modal
    # These are in classes, attendance, income, expenses, results, finance, parents pages
    $noBgOverlayPatterns = @(
        'className="fixed inset-0 z-50 flex items-center justify-center p-4"',
        'className="fixed inset-0 z-50 flex items-center justify-center p-4">'
    )
    
    foreach ($pattern in $noBgOverlayPatterns) {
        while ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-overlay">')
            $fileReplacements++
        }
    }
    
    # 2. Replace modal content patterns
    $contentPatterns = @(
        'className="w-full max-w-xl rounded-2xl bg-white border border-[#e2e8f0] p-6"',
        'className="w-full max-w-lg rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl p-6"',
        'className="w-full max-w-md rounded-2xl bg-white border border-[#e2e8f0] p-6"',
        'className="w-full max-w-2xl rounded-2xl bg-white border border-[#e2e8f0] p-6"',
        'className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"',
        'className="bg-white border border-[#e2e8f0] rounded-2xl p-6 w-full max-w-md mx-4"'
    )
    
    foreach ($pattern in $contentPatterns) {
        while ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-content"')
            $fileReplacements++
        }
    }
    
    # 3. Replace modal header patterns
    $headerPatterns = @(
        'className="flex items-center justify-between mb-6"',
        'className="flex items-center justify-between mb-5"'
    )
    
    foreach ($pattern in $headerPatterns) {
        while ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-header"')
            $fileReplacements++
        }
    }
    
    # 4. Replace modal footer patterns
    $footerPatterns = @(
        'className="flex justify-end gap-3 mt-6"',
        'className="flex gap-3 pt-2"',
        'className="flex gap-3 mt-5"'
    )
    
    foreach ($pattern in $footerPatterns) {
        while ($content.Contains($pattern)) {
            $content = $content.Replace($pattern, 'className="modal-footer"')
            $fileReplacements++
        }
    }
    
    # Write back if changes were made
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content)
        $filesFixed++
        $totalReplacements += $fileReplacements
        Write-Host "Fixed: $($file.Name) ($fileReplacements replacements)"
    }
}

Write-Host "`n=== Summary ==="
Write-Host "Files fixed: $filesFixed"
Write-Host "Total replacements: $totalReplacements"
