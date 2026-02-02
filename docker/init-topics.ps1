Write-Host "Creating Kafka Topics..." -ForegroundColor Cyan
$topics = @("user-registered", "transaction-completed", "customer-created", "audit.events")
foreach ($topic in $topics) {
    Write-Host "Checking topic: $topic"
    docker exec kafka kafka-topics --create --if-not-exists --topic $topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
}
Write-Host "Kafka topics check/creation completed." -ForegroundColor Green
