# 💳 Online Banking Application

An end-to-end web-based online banking system built with **Java Spring Boot** on the backend and **React** for the frontend. This application enables users to manage bank accounts, perform transactions, and access banking services securely and efficiently.

---

## 🚀 Features

### 👤 User Module
- Register, login, logout with JWT-based authentication
- Profile management and account settings

### 🏦 Banking Operations
- View account balance and transaction history
- Money transfer between accounts
- Deposit and withdrawal functions
- Scheduled payments (optional)

### 📊 Admin Dashboard
- Manage users and bank accounts
- View and approve transactions
- Role-based access (Admin/User)

### 🛡️ Security
- Spring Security with JWT
- Password encryption (BCrypt)
- Role-based authorization
- CSRF protection

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|--------------------------------------|
| **Frontend** | React, Axios, Tailwind CSS / Bootstrap |
| **Backend**  | Java 17, Spring Boot, Spring Security, Spring Data JPA |
| **Database** | MySQL / PostgreSQL                   |
| **Auth**     | JWT (JSON Web Tokens), BCrypt        |
| **Tools**    | Maven, Postman, Git, Docker (optional) |

---

## 📁 Project Structure

### Backend (`/backend`)
src/
├── main/java/com/bankapp
│ ├── controller
│ ├── service
│ ├── model
│ ├── repository
│ └── config (Spring Security)
└── main/resources
└── application.properties

shell
Copy
Edit

### Frontend (`/frontend`)
src/
├── components
├── pages
├── services (API calls)
└── App.jsx / App.tsx

yaml
Copy
Edit

---

## ⚙️ Getting Started

### Backend Setup (Spring Boot)
```bash
cd backend
mvn clean install
# Run the app
mvn spring-boot:run
Frontend Setup (React)
bash
Copy
Edit
cd frontend
npm install
npm start
### Infrastructure Setup (Kafka & MySQL)

The project uses Docker for infrastructure. To start Kafka and Zookeeper:

```powershell
# Navigate to the docker folder
cd docker

# Run the Kafka setup script
./run-kafka.ps1
```

To stop Kafka:
```powershell
./stop-kafka.ps1
```

MySQL databases for various services are defined in the root `docker-compose.yml` and can be started using:
```powershell
docker-compose up -d
```

✅ API Overview (Sample)
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	User login, returns JWT
/api/account/balance	GET	Get current balance
/api/transaction/send	POST	Transfer money to another user

🧪 Testing
Unit Tests: JUnit + Mockito

API Testing: Postman collections included

📸 Screenshots
(Add screenshots of dashboard, transfer page, etc.)

📌 Future Enhancements
Add OTP-based transaction confirmation

Integrate email notifications

Add mobile responsiveness (React Native / PWA)

👨‍💻 Author
Uday Shastrakar
📧 uday.shastrakar@gmail.com
GitHub | LinkedIn
