Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$imageRoot = Join-Path $projectRoot 'assets\images'

function New-RoundedRectanglePath {
  param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-CalendarMark {
  param([System.Drawing.Graphics]$Graphics, [float]$Size, [System.Drawing.Color]$Color, [float]$Scale = 1.0)
  $offset = ($Size - ($Size * $Scale)) / 2
  $unit = $Size * $Scale
  $pen = New-Object System.Drawing.Pen($Color, ($unit * 0.052))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $calendarPath = New-RoundedRectanglePath -X ($offset + $unit * 0.20) -Y ($offset + $unit * 0.21) -Width ($unit * 0.60) -Height ($unit * 0.61) -Radius ($unit * 0.075)
  $Graphics.DrawPath($pen, $calendarPath)
  $Graphics.DrawLine($pen, $offset + $unit * 0.20, $offset + $unit * 0.38, $offset + $unit * 0.80, $offset + $unit * 0.38)
  $Graphics.DrawLine($pen, $offset + $unit * 0.36, $offset + $unit * 0.16, $offset + $unit * 0.36, $offset + $unit * 0.27)
  $Graphics.DrawLine($pen, $offset + $unit * 0.64, $offset + $unit * 0.16, $offset + $unit * 0.64, $offset + $unit * 0.27)
  $Graphics.DrawLine($pen, $offset + $unit * 0.34, $offset + $unit * 0.59, $offset + $unit * 0.46, $offset + $unit * 0.70)
  $Graphics.DrawLine($pen, $offset + $unit * 0.46, $offset + $unit * 0.70, $offset + $unit * 0.69, $offset + $unit * 0.49)
  $calendarPath.Dispose()
  $pen.Dispose()
}

function Save-BrandBitmap {
  param([string]$Path, [int]$Size, [string]$Background, [string]$Mark, [bool]$RoundedTile, [bool]$Transparent, [float]$MarkScale = 1.0)
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.Clear($(if ($Transparent) { [System.Drawing.Color]::Transparent } else { [System.Drawing.ColorTranslator]::FromHtml($Background) }))

  if ($RoundedTile) {
    $tilePath = New-RoundedRectanglePath -X ($Size * 0.10) -Y ($Size * 0.10) -Width ($Size * 0.80) -Height ($Size * 0.80) -Radius ($Size * 0.18)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($Background))
    $graphics.FillPath($brush, $tilePath)
    $brush.Dispose()
    $tilePath.Dispose()
  }

  Draw-CalendarMark -Graphics $graphics -Size $Size -Color ([System.Drawing.ColorTranslator]::FromHtml($Mark)) -Scale $MarkScale
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-BrandBitmap -Path (Join-Path $imageRoot 'icon.png') -Size 1024 -Background '#006B6B' -Mark '#FFFFFF' -RoundedTile $false -Transparent $false -MarkScale 0.78
Save-BrandBitmap -Path (Join-Path $imageRoot 'splash-icon.png') -Size 512 -Background '#006B6B' -Mark '#FFFFFF' -RoundedTile $true -Transparent $true -MarkScale 0.66
Save-BrandBitmap -Path (Join-Path $imageRoot 'android-icon-foreground.png') -Size 432 -Background '#006B6B' -Mark '#FFFFFF' -RoundedTile $false -Transparent $true -MarkScale 0.58
Save-BrandBitmap -Path (Join-Path $imageRoot 'android-icon-monochrome.png') -Size 432 -Background '#000000' -Mark '#000000' -RoundedTile $false -Transparent $true -MarkScale 0.58
Save-BrandBitmap -Path (Join-Path $imageRoot 'notification-icon.png') -Size 96 -Background '#000000' -Mark '#FFFFFF' -RoundedTile $false -Transparent $true -MarkScale 0.88
Save-BrandBitmap -Path (Join-Path $imageRoot 'favicon.png') -Size 64 -Background '#006B6B' -Mark '#FFFFFF' -RoundedTile $false -Transparent $false -MarkScale 0.82

Write-Output "Brand assets generated in $imageRoot"
