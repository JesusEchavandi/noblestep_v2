param(
  [string]$InputDir = ".",
  [int]$Width = 3840,
  [int]$Height = 2160,
  [string]$Background = "White"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path $InputDir -Filter "*.mmd" | Sort-Object Name
if (-not $files) {
  Write-Host "No se encontraron archivos .mmd en $InputDir"
  exit 0
}

foreach ($f in $files) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f.FullName)
  $svg = Join-Path $f.DirectoryName ($base + ".svg")
  $png = Join-Path $f.DirectoryName ($base + ".png")
  $jpg = Join-Path $f.DirectoryName ($base + "_4k.jpg")

  Write-Host "Renderizando" $f.Name
  & npx.cmd --yes @mermaid-js/mermaid-cli -i $f.FullName -o $svg -b transparent | Out-Null
  & npx.cmd --yes @mermaid-js/mermaid-cli -i $f.FullName -o $png -b transparent | Out-Null

  $src = [System.Drawing.Image]::FromFile($png)
  try {
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    try {
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $bg = [System.Drawing.Color]::FromName($Background)
        $g.Clear($bg)

        $scale = [Math]::Min($Width / $src.Width, $Height / $src.Height)
        $drawW = [int]([Math]::Round($src.Width * $scale))
        $drawH = [int]([Math]::Round($src.Height * $scale))
        $x = [int](($Width - $drawW) / 2)
        $y = [int](($Height - $drawH) / 2)

        $g.DrawImage($src, $x, $y, $drawW, $drawH)
      }
      finally {
        $g.Dispose()
      }

      $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
      $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 95L)
      $bmp.Save($jpg, $enc, $ep)
    }
    finally {
      $bmp.Dispose()
    }
  }
  finally {
    $src.Dispose()
  }

  Write-Host "Generado:" $jpg
}

Write-Host "Proceso terminado"
