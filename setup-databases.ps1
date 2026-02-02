# Online Banking System - Database Setup Script (PowerShell)

Write-Host "🏦 Setting up Online Banking System Databases..." -ForegroundColor Green

# MySQL Connection Parameters
$MySQLHost = "localhost"
$MySQLPort = "3306"
$MySQLUser = "root"
$MySQLPassword = "root"

# Databases to create with their specific ports
$DatabaseConfigs = @(
    @{ Name = "authdb"; Port = "33061" },
    @{ Name = "customer"; Port = "33062" },
    @{ Name = "accounts"; Port = "33063" },
    @{ Name = "transaction"; Port = "33064" },
    @{ Name = "auditdb"; Port = "3307" }
)

Write-Host "📊 Creating databases..." -ForegroundColor Yellow

foreach ($config in $DatabaseConfigs) {
    $db = $config.Name
    $port = $config.Port
    Write-Host "Creating database: $db on port $port" -ForegroundColor Cyan
    
    try {
        $result = & mysql -h $MySQLHost -P $port -u $MySQLUser -p$MySQLPassword -e "CREATE DATABASE IF NOT EXISTS $db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database '$db' created successfully" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to create database '$db' on port $port" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error creating database '$db': $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎯 Database setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "   - Authentication DB: authdb" -ForegroundColor White
Write-Host "   - Customer DB: customer" -ForegroundColor White
Write-Host "   - Accounts DB: accounts" -ForegroundColor White
Write-Host "   - Transaction DB: transaction" -ForegroundColor White
Write-Host "   - Audit DB: auditdb (Docker: localhost:3307)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now start the services using: ./run_services.ps1" -ForegroundColor Green
