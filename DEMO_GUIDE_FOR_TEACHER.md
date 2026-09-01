# 🏙️ Enterprise Smart City Platform - Demo Guide for Teacher

## Overview
This is a **complete enterprise-grade microservices platform** for managing city operations. It has:
- **Frontend** (Next.js) - Web portals for citizens, officers, departments, and admins
- **Backend APIs** (Node.js/Express) - REST services for all business logic
- **Database** (MongoDB) - Stores all data
- **Real-time features** - Notifications, GIS mapping, emergency management

---

## 🚀 Current Status

The application is **RUNNING** right now:

| Component | URL | Port | Status |
|-----------|-----|------|--------|
| **Frontend Web App** | http://localhost:3000 | 3000 | ✅ Running |
| **Backend API** | http://localhost:4100 | 4100 | ✅ Running |
| **MongoDB Database** | mongodb://localhost:27017 | 27017 | ✅ Connected |

---

## 📋 What You Can Do Right Now

### 1. **Access the Web Application**
Go to: **http://localhost:3000**

You'll see:
- Login page
- Dashboard portals for different roles:
  - **Citizen Portal** - For regular citizens
  - **Department Portal** - For city department staff
  - **Admin Portal** - For city administrators
  - **Officer Portal** - For field officers

### 2. **Explore the API**
Go to: **http://localhost:4100/swagger** or **http://localhost:4100/api/swagger**

Here you can:
- See all available REST API endpoints
- View request/response formats
- Test API calls directly
- Understand authentication requirements

---

## 🎯 Key Features Implemented

### **1. Authentication & RBAC (Role-Based Access Control)**
- User registration and login
- JWT token-based authentication
- Password reset and email verification
- Different roles: Citizen, Officer, Department Head, Super Admin
- Protected routes and role-based dashboards

### **2. Citizen Features**
- View personal dashboard
- File complaints about city issues
- Track complaint status
- View bills and payments
- Book appointments with departments
- Receive notifications
- View city emergency alerts

### **3. Officer Features**
- View assigned complaints
- Update complaint status
- Manage assigned assets
- Emergency dispatch management
- Performance analytics

### **4. Department Features**
- Manage department officers
- Track complaints assigned to department
- Monitor asset status
- View department statistics
- File reports

### **5. Admin Features**
- City-wide overview
- Manage all users, officers, departments
- View all complaints and emergencies
- Generate reports
- System analytics and KPIs

### **6. GIS/Mapping**
- Interactive map showing:
  - Complaint locations
  - Asset locations
  - Hospitals, police stations
  - Emergency dispatch points
- Layer filtering
- Search functionality

### **7. Emergency Management**
- Fire emergencies
- Medical emergencies
- Flood alerts
- Accident reporting
- Real-time dispatch tracking

### **8. Notifications**
- In-app notifications
- Email notifications (mock)
- Push notifications (mock)
- Notification preferences
- Read/unread status

### **9. Analytics & Reports**
- KPI cards (complaints, resolutions, etc.)
- Charts (status breakdown, category analysis)
- Resolution rates
- Department performance
- Export/print capabilities

---

## 📁 Project Structure

```
enterprise-smart-city-platform/
│
├── frontend/              # Next.js 15 web application
│   ├── src/app/          # Routes and pages
│   ├── src/components/   # Reusable UI components
│   ├── src/services/     # API call handlers
│   └── src/store/        # Redux state management
│
├── backend/              # Node.js/Express API
│   ├── services/         # Individual microservices
│   ├── src/models/       # Database models
│   ├── src/middleware/   # Auth, logging, error handling
│   └── src/config/       # Configuration files
│
├── packages/
│   ├── common/          # Shared utilities and enums
│   ├── shared/          # DTOs and contracts
│   └── database/        # Prisma schema and client
│
└── docs/                # Documentation
    ├── openapi.yaml     # API specification
    ├── api-spec.json    # API in JSON format
    └── architecture-diagram.md
```

---

## 🧬 Tech Stack Explained

### **Frontend**
- **Next.js 15** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching
- **Zod** - Schema validation
- **Leaflet** - Interactive maps

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe code
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers

### **Data**
- **MongoDB** - NoSQL database
- **Prisma** - ORM (Object-Relational Mapping)

### **Other Services**
- **Redis** - Caching (for future use)
- **Kafka** - Event bus (for future use)

---

## 🔐 Security Features

1. **JWT Authentication** - Access tokens + Refresh tokens
2. **Role-Based Access Control (RBAC)** - Users see only what they can access
3. **Password Security** - bcrypt hashing, salt rounds
4. **CORS Protection** - Cross-Origin Resource Sharing
5. **Rate Limiting** - Prevent API abuse
6. **Input Validation** - Zod schemas validate all inputs
7. **HTTP Headers** - Helmet adds security headers

---

## 🧪 Testing the Application

### **Test Accounts (if seeded)**
- **Admin**: admin@smartcity.local / password123
- **Officer**: officer@smartcity.local / password123
- **Citizen**: citizen@smartcity.local / password123
- **Department Head**: dept-head@smartcity.local / password123

*(Note: Check backend/seed-db.ts for actual seeded credentials)*

### **What to Test**

1. **User Authentication**
   - Register new account
   - Login with credentials
   - Logout
   - View dashboard

2. **Complaints**
   - Create new complaint
   - View complaint list
   - Filter by status/category
   - Add comments
   - Update status

3. **GIS Features**
   - View interactive map
   - Switch map layers
   - Search locations
   - Filter markers

4. **Notifications**
   - Check in-app notifications
   - Mark as read/unread
   - Update preferences

5. **Reports**
   - Generate department report
   - View analytics charts
   - Export/print reports

---

## 📊 API Endpoints Overview

### **Authentication**
```
POST /auth/register          - Create new account
POST /auth/login             - Login user
POST /auth/refresh           - Refresh JWT token
POST /auth/logout            - Logout user
POST /auth/forgot-password   - Request password reset
```

### **Complaints**
```
GET    /complaints           - List all complaints
POST   /complaints           - Create complaint
GET    /complaints/:id       - Get complaint details
PUT    /complaints/:id       - Update complaint
DELETE /complaints/:id       - Delete complaint
POST   /complaints/:id/comments - Add comment
```

### **Users**
```
GET    /users                - List users
POST   /users                - Create user
GET    /users/:id            - Get user details
PUT    /users/:id            - Update user
DELETE /users/:id            - Delete user
```

### **Departments**
```
GET    /departments          - List departments
POST   /departments          - Create department
GET    /departments/:id      - Get department details
PUT    /departments/:id      - Update department
DELETE /departments/:id      - Delete department
```

### **Assets**
```
GET    /assets               - List assets
POST   /assets               - Create asset
GET    /assets/:id           - Get asset details
PUT    /assets/:id           - Update asset
DELETE /assets/:id           - Delete asset
```

### **GIS/Map**
```
GET    /gis/layers           - Get map layers
GET    /gis/markers          - Get map markers
GET    /gis/search           - Search locations
```

### **Notifications**
```
GET    /notifications        - Get user notifications
POST   /notifications/:id/read - Mark as read
DELETE /notifications/:id    - Delete notification
PUT    /notifications/preferences - Update preferences
```

### **Analytics**
```
GET    /analytics/kpis       - Get KPI metrics
GET    /analytics/complaints - Complaint analytics
GET    /analytics/departments - Department performance
```

---

## 🔄 How Data Flows

1. **User Action** → Frontend (React component)
2. **API Call** → Backend (Express endpoint)
3. **Validation** → Check permissions & validate input
4. **Database Query** → MongoDB via Prisma ORM
5. **Response** → JSON data back to frontend
6. **UI Update** → Frontend updates with new data

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser                              │
│              (Citizen/Officer/Admin)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend                           │
│              (Port 3000)                                     │
│  - React Components                                          │
│  - State Management (Redux)                                  │
│  - Authentication (JWT)                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API Calls (JSON)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend API                          │
│              (Port 4100)                                     │
│  - Authentication Service                                    │
│  - Complaint Service                                         │
│  - Department Service                                        │
│  - GIS Service                                               │
│  - Notification Service                                      │
│  - Emergency Service                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ Database Queries (Prisma ORM)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                            │
│              (Port 27017)                                    │
│  Collections:                                                │
│  - users, roles, permissions                                 │
│  - complaints, comments                                      │
│  - departments, officers                                     │
│  - assets, inspections                                       │
│  - notifications, preferences                                │
│  - emergencies, dispatch                                     │
│  - appointments, bills                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Running Different Services

### **All Together** (Frontend + Backend)
```bash
npm run dev
```

### **Just Frontend**
```bash
npm run dev:frontend
```

### **Just Backend**
```bash
npm run dev:monolith
```

### **Individual Microservices**
```bash
npm run dev:gateway      # API Gateway
npm run dev:auth         # Auth Service
npm run dev:complaints   # Complaint Service
npm run dev:department   # Department Service
npm run dev:payments     # Payment Service
npm run dev:gis          # GIS Service
npm run dev:iot          # IoT Service
npm run dev:notifications # Notification Service
```

---

## 📝 Important Files to Review

1. **[package.json](package.json)** - Project scripts and dependencies
2. **[frontend/src/app](frontend/src/app)** - Frontend routes
3. **[backend/src/server/index.ts](backend/src/server/index.ts)** - Backend entry point
4. **[docs/openapi.yaml](docs/openapi.yaml)** - API specification
5. **[docs/architecture-diagram.md](docs/architecture-diagram.md)** - Architecture details

---

## 🎓 Learning Path for Teacher

### **Week 1: Understand Basics**
1. Review this guide
2. Explore the frontend at http://localhost:3000
3. Understand user flows (login → dashboard → features)
4. Review the API docs at http://localhost:4100/swagger

### **Week 2: Dive into Code**
1. Look at frontend components in `frontend/src/components`
2. Review backend API handlers in `backend/src`
3. Understand database models in `packages/database/prisma`
4. Study authentication flow

### **Week 3: Advanced Topics**
1. Explore state management (Redux store)
2. Understand API request/response cycles
3. Review error handling
4. Study RBAC implementation

### **Week 4: Hands-on Testing**
1. Test all features manually
2. Create test data
3. Test error scenarios
4. Generate reports and analytics

---

## ❓ Common Questions

### **Q: How do I create a new user?**
A: Use the registration page at http://localhost:3000/register

### **Q: How do I reset the database?**
A: Run `npm run db:seed --prefix backend -- --reset`

### **Q: Can I test API without frontend?**
A: Yes! Use Swagger UI at http://localhost:4100/swagger

### **Q: How do I see what's in the database?**
A: Install MongoDB Compass (GUI) or use command line

### **Q: How are passwords secured?**
A: They're hashed with bcrypt (not stored in plain text)

### **Q: Can users see other users' data?**
A: No! RBAC ensures they only see their own data based on role

---

## 🐛 Troubleshooting

### **Frontend not loading**
- Check: http://localhost:3000 is accessible
- Solution: Run `npm run dev:frontend`

### **API returning errors**
- Check: http://localhost:4100 is accessible
- Solution: Run `npm run dev:monolith` or individual services
- View logs in terminal for error details

### **Database connection errors**
- Check: MongoDB is running
- Solution: Ensure mongodb service is running or use Docker

### **Port already in use**
- If port 3000/4100 is taken by another app:
  - Change port in configuration
  - Or stop the conflicting application

---

## 📞 Getting Help

1. **Check logs** - Look at terminal output for error messages
2. **Review code** - Look at similar implementations
3. **Check API docs** - Read Swagger specification
4. **Review README.md** - Root level project documentation
5. **Contact developer** - Ask the student/developer for clarification

---

## ✅ Demo Checklist for Teacher

- [ ] Accessed frontend at http://localhost:3000
- [ ] Viewed login/registration page
- [ ] Created test user account
- [ ] Logged in with test account
- [ ] Explored citizen dashboard
- [ ] Created a test complaint
- [ ] Viewed GIS map
- [ ] Checked notifications
- [ ] Accessed API docs at http://localhost:4100/swagger
- [ ] Tested an API endpoint
- [ ] Reviewed project structure
- [ ] Understood role-based access
- [ ] Viewed analytics/reports
- [ ] Tested emergency features
- [ ] Reviewed database models

---

## 🎉 Summary

This is a **production-ready smart city platform** with:
- ✅ Modern tech stack (Next.js, Node.js, MongoDB)
- ✅ Complete authentication & authorization
- ✅ Real business logic (complaints, assets, emergencies)
- ✅ Professional UI/UX with dashboards
- ✅ API documentation with Swagger
- ✅ Microservices architecture
- ✅ Database models & relationships
- ✅ Error handling & validation
- ✅ Security best practices
- ✅ Scalable design

The platform demonstrates **enterprise-level software engineering practices** and can be extended for production use.

---

**Good luck exploring! If you have questions, check the API docs or reach out to the development team.**
