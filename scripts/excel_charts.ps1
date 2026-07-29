param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [string]$PdfPath
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$excel = $null
$workbook = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $workbook = $excel.Workbooks.Open($InputPath, 0, $true)

  if ($PdfPath) {
    # xlTypePDF = 0. Excel itself preserves all chart styles and worksheet layout.
    $workbook.ExportAsFixedFormat(0, $PdfPath)
  }

  $index = 1
  foreach ($worksheet in $workbook.Worksheets) {
    foreach ($chartObject in $worksheet.ChartObjects()) {
      $path = Join-Path $OutputDirectory ("chart-{0}.png" -f $index)
      if ($chartObject.Chart.Export($path, 'PNG')) { $index++ }
    }
  }
  foreach ($chart in $workbook.Charts) {
    $path = Join-Path $OutputDirectory ("chart-{0}.png" -f $index)
    if ($chart.Export($path, 'PNG')) { $index++ }
  }
}
finally {
  if ($workbook) { $workbook.Close($false) }
  if ($excel) { $excel.Quit() }
  if ($workbook) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) }
  if ($excel) { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
