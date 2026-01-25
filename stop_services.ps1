$ports = @(3000, 9092, 8761, 8080, 9093, 9095, 9094, 9096, 9097)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Write-Host "Killing process $process on port $port..."
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
    else {
        Write-Host "No process found on port $port."
    }
}
Write-Host "All services stopped."
