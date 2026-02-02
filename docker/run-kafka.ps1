Write-Host "Starting Kafka Infrastructure..." -ForegroundColor Cyan
docker-compose -f docker-compose.yml up -d
Write-Host "Waiting for Kafka to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
./init-topics.ps1
Write-Host "Kafka and Zookeeper are ready." -ForegroundColor Green
docker ps --filter "name=kafka" --filter "name=zookeeper"
