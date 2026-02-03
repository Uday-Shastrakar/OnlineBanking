# 🏦 Online Banking System - Microservices Architecture

A comprehensive, production-ready online banking system built with **microservices architecture** using Spring Boot and React. This enterprise-grade application demonstrates modern banking practices with secure transactions, real-time auditing, and comprehensive user management.

---

## 🎯 Key Features

### 👤 Customer Portal
- **Secure Authentication**: JWT-based login with role-based access control
- **Account Management**: View balances, transaction history, and account details
- **Money Transfers**: Real-time inter-account transfers with banking-grade ledger
- **Dashboard**: Personalized overview with recent activity and account summaries
- **Profile Management**: Update personal information and security settings

### 🛡️ Admin Portal
- **User Management**: Comprehensive customer account administration
- **Audit Center**: Real-time forensic logging and compliance monitoring
- **System Metrics**: Live dashboard showing system health and statistics
- **Transaction Oversight**: Monitor and approve high-value transactions
- **Security Monitoring**: Track failed logins and suspicious activities

### 🔒 Banking-Grade Security
- **Atomic Transactions**: ACID-compliant money movement operations
- **Ledger System**: Immutable financial record with running balances
- **Audit Trail**: Complete forensic logging of all system events
- **Data Privacy**: Account number masking with user-controlled visibility
- **Role-Based Access**: Granular permissions for different user types

---

## 🏗️ Microservices Architecture

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 8080 | Spring Cloud Gateway for routing and load balancing |
| **Discovery Service** | 8761 | Eureka Server for service discovery |
| **Authentication Service** | 9093 | JWT authentication and user management |
| **Customer Service** | 9094 | Customer profile and registration management |
| **Accounts Service** | 9095 | Bank account management and balance operations |
| **Transaction Service** | 9096 | Money transfers and ledger management |
| **Notification Service** | 9098 | Email and SMS notifications |
| **Audit Service** | 9099 | Comprehensive audit logging and compliance |
| **Email Service** | - | Email template processing and PDF generation |
| **Config Service** | - | Centralized configuration management |

### Frontend
- **Client Service** (Port 3000): React + TypeScript with Material-UI

---

## 🛠️ Technology Stack

### Backend
- **Java 17** with Spring Boot 3.3.x
- **Spring Cloud 2023.0.3** for microservices
- **Spring Security** with JWT authentication
- **Spring Data JPA** for data persistence
- **MySQL** databases (separate per service)
- **Apache Kafka** for event-driven communication
- **Eureka** for service discovery
- **Spring Cloud Gateway** for API routing
- **Liquibase** for database migrations

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **Axios** for HTTP client
- **React Router** for navigation
- **Day.js** for date handling
- **Recharts** for data visualization

### DevOps & Infrastructure
- **Docker** containerization
- **Docker Compose** for local development
- **Maven** for build management
- **PowerShell** scripts for service orchestration

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Docker & Docker Compose
- Maven 3.8+

### Infrastructure Setup

1. **Start Infrastructure Services:**
```powershell
# Navigate to project root
cd d:\Online-banking\git store\OnlineBanking

# Start Kafka and Zookeeper
.\docker\run-kafka.ps1

# Start MySQL databases
docker-compose up -d
```

2. **Start Backend Services:**
```powershell
# Start all microservices (run in order)
.\start-all-services.ps1
```

3. **Start Frontend:**
```bash
cd Client-Service\client
npm install
npm start
```

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Customer & Admin Portals |
| **API Gateway** | http://localhost:8080 | Central API entry point |
| **Eureka Dashboard** | http://localhost:8761 | Service registry |
| **Customer Portal** | http://localhost:3000/login | User login |
| **Admin Portal** | http://localhost:3000/admin | Admin dashboard |

---

## 📊 Key Features Implemented

### 💳 Banking Operations
- **Atomic Transfers**: ACID-compliant money movement
- **Real-Time Ledger**: Immediate balance updates with running totals
- **Transaction History**: Complete audit trail with timestamps
- **Account Management**: Create, view, and manage bank accounts
- **Balance Inquiries**: Real-time balance checking

### 🔐 Security Features
- **JWT Authentication**: Stateless token-based auth
- **Password Encryption**: BCrypt hashing
- **Account Number Masking**: Privacy protection with toggle visibility
- **Role-Based Access**: Customer vs Admin permissions
- **CORS Configuration**: Secure cross-origin requests
- **Request Tracking**: Unique request IDs for audit trail

### 📈 Dashboard Features
- **Customer Dashboard**: Account overview, recent transactions, quick actions
- **Admin Dashboard**: System metrics, user management, audit center
- **Real-Time Updates**: Live data refresh
- **Responsive Design**: Mobile-friendly interface
- **Interactive Charts**: Data visualization with Recharts

### 🕵️ Audit & Compliance
- **Comprehensive Logging**: All system events tracked
- **Forensic Audit Trail**: Immutable audit records
- **System Metrics**: Real-time statistics and health monitoring
- **Security Events**: Failed logins, account blocks, suspicious activity
- **Compliance Reporting**: Export audit data for regulatory requirements

---

## 📁 Project Structure

```
OnlineBanking/
├── API-Gateway-Service/          # Spring Cloud Gateway
├── Discovery-Service/           # Eureka Server
├── Authentication-Service/      # JWT Authentication
├── Customer-Service/           # Customer Management
├── Accounts-Service/           # Account Operations
├── Transaction-Service/        # Money Transfers & Ledger
├── Notification-Service/       # Email/SMS Notifications
├── Audit-Service/             # Audit Logging
├── Email-Service/              # Email Templates
├── Config-Service/            # Configuration Management
├── Client-Service/            # React Frontend
├── docker/                     # Docker Scripts
├── docker-compose.yml          # Infrastructure Services
└── README.md                   # This file
```

---

## 🔧 Configuration

### Database Configuration
Each service uses its own MySQL database:
- `authdb` - Authentication Service
- `customerdb` - Customer Service
- `accountdb` - Accounts Service
- `transactiondb` - Transaction Service
- `auditdb` - Audit Service

### Service Discovery
All services register with Eureka at `http://localhost:8761`

### API Gateway Routes
- `/api/auth/**` → Authentication Service
- `/api/customer/**` → Customer Service
- `/api/account/**` → Accounts Service
- `/api/transaction/**` → Transaction Service
- `/api/transactions/**` → Transaction Service (Ledger)
- `/api/audit/**` → Audit Service

---

## 🧪 Testing

### Unit Tests
```bash
# Run tests for any service
cd [Service-Directory]
mvn test
```

### Integration Tests
```bash
# Run integration tests
mvn test -Dspring.profiles.active=test
```

### API Testing
Postman collections available for each service with comprehensive test scenarios.

---

## 📸 Screenshots & Demos

### Customer Portal
- **Dashboard**: Account overview with recent transactions
- **Transaction History**: Complete ledger with running balances
- **Money Transfer**: Secure inter-account transfers
- **Account Management**: View account details with masked numbers

### Admin Portal
- **Admin Dashboard**: System metrics and health monitoring
- **Audit Center**: Comprehensive forensic logging interface
- **User Management**: Customer account administration
- **System Monitoring**: Real-time service health

---

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: React Native mobile application
- **OTP Verification**: Two-factor authentication for transactions
- **Bill Payments**: Utility bill payment integration
- **Loan Management**: Personal loan application and management
- **Investment Portal**: Mutual funds and investment options
- **Advanced Analytics**: AI-powered financial insights
- **International Transfers**: Cross-border money transfers
- **Card Management**: Debit/credit card services

### Technical Improvements
- **Kubernetes Deployment**: Container orchestration for production
- **Circuit Breakers**: Resilience patterns with Hystrix
- **Distributed Tracing**: Zipkin for request tracing
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Advanced Monitoring**: Prometheus and Grafana integration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

### Author
**Uday Shastrakar**
- 📧 uday.shastrakar@gmail.com
- 🐙 GitHub: [Uday-Shastrakar](https://github.com/Uday-Shastrakar)
- 💼 LinkedIn: [Uday Shastrakar](https://linkedin.com/in/uday-shastrakar)

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Acknowledgments

- Spring Boot team for the excellent framework
- Material-UI for the beautiful React components
- The open-source community for the amazing tools and libraries
- Banking industry professionals for security and compliance guidance

---

**⭐ If this project helped you, please give it a star!**

---

## 📋 Version History

### v2.0.0 (Current) - Banking-Grade Features
- ✅ Atomic transaction processing with ACID compliance
- ✅ Banking-grade ledger system with running balances
- ✅ Comprehensive audit logging and compliance
- ✅ Account number privacy with toggle visibility
- ✅ Real-time system metrics and monitoring
- ✅ Enhanced security with role-based access
- ✅ Production-ready error handling and fallbacks

### v1.0.0 - Initial Release
- ✅ Basic microservices architecture
- ✅ User authentication and registration
- ✅ Simple money transfers
- ✅ Basic admin dashboard
- ✅ Docker containerization

---

*Built with ❤️ for modern banking*
