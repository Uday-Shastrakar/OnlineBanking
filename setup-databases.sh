# Online Banking System - Database Setup Script

echo "🏦 Setting up Online Banking System Databases..."

# MySQL Connection Parameters
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASSWORD="root"

# Databases to create
DATABASES=("authdb" "customer" "accounts" "transaction")

echo "📊 Creating databases..."

for db in "${DATABASES[@]}"; do
    echo "Creating database: $db"
    mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if [ $? -eq 0 ]; then
        echo "✅ Database '$db' created successfully"
    else
        echo "❌ Failed to create database '$db'"
    fi
done

echo "🎯 Database setup completed!"
echo ""
echo "📋 Summary:"
echo "   - Authentication DB: authdb"
echo "   - Customer DB: customer" 
echo "   - Accounts DB: accounts"
echo "   - Transaction DB: transaction"
echo "   - Audit DB: auditdb (Docker: localhost:3307)"
echo ""
echo "🚀 You can now start the services using: ./run_services.ps1"
