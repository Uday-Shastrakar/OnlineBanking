$services = @(
    @{ Path = "Discovery-Service/discovery"; Name = "discovery-service"; Port = 8761 },
    @{ Path = "API-Gateway-Service/gateway"; Name = "gateway-service"; Port = 8080 },
    @{ Path = "Authentication-Service/authentication"; Name = "auth-service"; Port = 9093 },
    @{ Path = "Accounts-Service"; Name = "accounts-service"; Port = 9095 },
    @{ Path = "Customer-Service/customer"; Name = "customer-service"; Port = 9094 },
    @{ Path = "Transaction-Service/transaction"; Name = "transaction-service"; Port = 9096 },
    @{ Path = "Notification-Service/notification"; Name = "notification-service"; Port = 9098 },
    @{ Path = "Audit-Service"; Name = "audit-service"; Port = 9099 }
)

foreach ($service in $services) {
    Write-Host "Starting $($service.Name)..."
    $servicePath = Join-Path $PSScriptRoot $service.Path
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$servicePath'; mvn spring-boot:run"
    
    if ($service.Name -eq "discovery-service") {
        Start-Sleep -Seconds 10
    }
    else {
        Start-Sleep -Seconds 2
    }
}

Write-Host "Starting Client-Service..."
$clientPath = Join-Path $PSScriptRoot "Client-Service/client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm start"

Write-Host "All services (Backend + Frontend) startup initiated."
