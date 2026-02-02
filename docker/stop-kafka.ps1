Write-Host "Stopping Kafka Infrastructure..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml stop
Write-Host "Kafka and Zookeeper have been stopped." -ForegroundColor Green
