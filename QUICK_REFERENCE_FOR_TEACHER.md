# 🏙️ Smart City Platform - Quick Reference Card

## ⚡ Quick Start (30 seconds)

1. **Application is RUNNING** ✅
2. **Open Browser**: http://localhost:3000
3. **See:** Login page, Dashboards, Features
4. **API Docs**: http://localhost:4100/swagger

---

## 🎯 What Can Teacher Do Right Now?

### **Explore Frontend** (Visual Learning)
- Login to different portals
- Create complaints
- View maps
- Check notifications
- Generate reports

### **Explore Backend** (API Learning)
- Read API documentation (Swagger)
- See all available endpoints
- Understand request/response formats
- Test API calls

### **Understand Code Structure**
```
Project Root
├── frontend/          → What users see (Next.js React)
├── backend/           → What makes it work (Node.js Express)
├── packages/
│   ├── common/        → Shared utilities
│   ├── shared/        → Shared data models
│   └── database/      → Database schema
└── docs/              → Documentation
```

---

## 👥 User Roles Explained

| Role | Access | Can Do |
|------|--------|--------|
| **Citizen** | Their own data | File complaints, view status, pay bills |
| **Officer** | Assigned complaints | Update complaint status, manage assets |
| **Department Head** | Department data | Manage officers, view stats |
| **Super Admin** | Everything | Manage all users, city-wide view |

---

## 🔑 5 Core Concepts

### **1. Authentication (Login System)**
- User registers → creates account
- User logs in → gets JWT token
- Token sent with every API request
- Token expires → user refreshes or logs in again

### **2. RBAC (Role-Based Access)**
- Different users have different permissions
- Citizens see only own complaints
- Officers see assigned tasks
- Admins see everything

### **3. REST API**
- Frontend makes HTTP requests to backend
- Backend processes, queries database
- Returns JSON data
- Frontend displays in browser

### **4. Database Models**
- Users (with roles & permissions)
- Complaints (status, priority, assigned officer)
- Departments (manage officers & assets)
- Notifications (sent to users)
- Emergencies (fire, medical, flood, accident)

### **5. Microservices (Optional for Scaling)**
- Auth Service → handles login/users
- Complaint Service → manages complaints
- Department Service → manages departments
- GIS Service → handles maps
- Notification Service → sends alerts

---

## 📞 Important URLs for Teacher

| Purpose | URL | What You'll See |
|---------|-----|-----------------|
| **Main App** | http://localhost:3000 | Login page & dashboards |
| **API Docs** | http://localhost:4100/swagger | All API endpoints |
| **Alt API Docs** | http://localhost:4100/api/swagger | Same as above |
| **Database CLI** | `mongosh` | Command-line database access |

---

## 🧪 Simple Test Steps

### **Test 1: Create User**
1. Go to http://localhost:3000
2. Click "Register"
3. Fill form: email, password, name
4. Click "Create Account"
5. You now have a user account ✅

### **Test 2: Login**
1. Enter your email and password
2. Click "Login"
3. You see your dashboard ✅

### **Test 3: Create Complaint**
1. Click "File Complaint" or similar button
2. Fill: title, description, category, location
3. Click "Submit"
4. Complaint created ✅

### **Test 4: View Map**
1. Click "Map" or "GIS" in menu
2. You see interactive map
3. You see complaint pins, asset pins
4. Click on pins to see details ✅

### **Test 5: Check API**
1. Go to http://localhost:4100/swagger
2. Click "GET /complaints"
3. Click "Try it out"
4. Click "Execute"
5. You see API response with complaints ✅

---

## 💡 Key Technologies Explained Simply

### **Frontend (What Users See)**
- **Next.js** = React + Server Features
- **Tailwind CSS** = Beautiful styling
- **Redux** = Remembers user state
- **Axios** = Talks to backend

### **Backend (The Engine)**
- **Express.js** = Web server
- **TypeScript** = JavaScript with safety
- **Prisma** = Database helper
- **JWT** = Security tokens

### **Database**
- **MongoDB** = Document storage (like JSON)
- Collections = Tables (users, complaints, etc.)
- Documents = Rows

---

## 🔒 Security Features (Why They Matter)

| Feature | What It Does | Why It Matters |
|---------|------|---|
| **JWT Tokens** | Authorization keys | Only logged-in users can use API |
| **bcrypt Hashing** | Scrambles passwords | Even admins can't see passwords |
| **RBAC** | Role-based access | Citizens can't see admin data |
| **Input Validation** | Checks all data | Prevents bad data in database |
| **CORS** | Cross-site protection | Only app can call backend |
| **Rate Limiting** | Request throttling | Prevents API abuse |

---

## 📊 Database Schema Overview

```
USERS
├── id, email, password (hashed)
├── name, phone, avatar
├── role (citizen/officer/admin)
└── createdAt, updatedAt

COMPLAINTS
├── id, title, description
├── status (open/in-progress/resolved)
├── priority (low/medium/high)
├── category (pothole/water/electricity)
├── location (lat, long)
├── assignedTo (officer id)
├── createdBy (citizen id)
└── comments (array)

DEPARTMENTS
├── id, name, description
├── head (officer id)
├── officers (array of officer ids)
├── assets (array of asset ids)
└── statistics

NOTIFICATIONS
├── id, message
├── type (alert/info/warning)
├── recipientId (user id)
├── isRead (boolean)
└── createdAt

EMERGENCIES
├── id, type (fire/medical/flood)
├── location (lat, long)
├── status (active/resolved)
├── dispatchedOfficers
└── timeline (events)
```

---

## 🎓 What Teacher Will Learn

### **From Frontend**
- How users interact with application
- React component structure
- State management with Redux
- API integration
- Form validation
- User authentication flow
- Responsive design

### **From Backend**
- REST API design
- Database queries
- Authentication & authorization
- Error handling
- Input validation
- Security practices
- Middleware usage
- Service architecture

### **From DevOps**
- Project structure
- Environment configuration
- Build & deployment setup
- Docker integration
- Database connectivity

---

## ❓ Teacher's Common Questions Answered

**Q: Is it a real working app?**
A: Yes! Fully functional, missing only email/payment integrations

**Q: Can I break something?**
A: No damage to running services. Restart if needed.

**Q: How do I see database data?**
A: Use MongoDB Compass or `mongosh` command-line

**Q: Where is the code?**
A: `frontend/` folder for UI, `backend/` for API logic

**Q: How do I reset everything?**
A: Run: `npm run db:seed --prefix backend -- --reset`

**Q: Can I create 100 users quickly?**
A: Yes! Use API in loop or modify seed script

**Q: Which file should I read first?**
A: Read: `DEMO_GUIDE_FOR_TEACHER.md` (you're reading it!)

---

## ✅ Teacher's 5-Minute Quick Test

1. ✅ Open http://localhost:3000 → see login page
2. ✅ Create account → fill registration form
3. ✅ Login → see dashboard
4. ✅ Create complaint → fill form, submit
5. ✅ Open http://localhost:4100/swagger → see API docs

**Done!** Teacher understands the basic flow.

---

## 🚀 Next Steps After Understanding Basics

1. **Dive into Code**
   - Read `frontend/src/app/page.tsx` (home page)
   - Read `backend/src/server/index.ts` (API entry)
   
2. **Understand Authentication**
   - Read auth logic in `backend/src/modules/auth`
   - See JWT token handling

3. **Learn Database**
   - Read schema in `packages/database/prisma/schema.prisma`
   - Understand relationships

4. **Study Features**
   - How complaints flow from creation to resolution
   - How notifications are triggered
   - How maps work with GIS data

5. **Advanced Topics**
   - Redis caching (future feature)
   - Kafka event streaming (future feature)
   - Microservices scaling
   - Docker deployment

---

## 📚 Files Teacher Should Review

| File | What It Contains | Why Important |
|------|-----------------|---|
| `README.md` | Project overview | Start here |
| `DEMO_GUIDE_FOR_TEACHER.md` | Full guide | You're reading it |
| `package.json` | Project scripts | How to run things |
| `frontend/next.config.mjs` | Frontend config | App settings |
| `backend/src/server/index.ts` | Backend entry | API starts here |
| `packages/database/prisma/schema.prisma` | Database schema | Data structure |
| `docs/openapi.yaml` | API specification | API documentation |

---

## 🎯 Learning Objectives for Teacher

After exploring this app, teacher will understand:

- ✅ How modern full-stack applications work
- ✅ Frontend and backend separation
- ✅ REST API design and implementation
- ✅ Database design and relationships
- ✅ Authentication and authorization
- ✅ Role-based access control
- ✅ Error handling and validation
- ✅ User experience design
- ✅ Code organization and structure
- ✅ TypeScript benefits
- ✅ Testing and debugging approaches
- ✅ Deployment considerations

---

## 🎉 Success Metrics

Teacher can confidently explain:
- [ ] What the app does
- [ ] How users interact with it
- [ ] How frontend talks to backend
- [ ] How data is stored and retrieved
- [ ] How security works
- [ ] The tech stack choices
- [ ] Why architecture is designed this way
- [ ] How to add new features
- [ ] How to test functionality
- [ ] How to debug issues

---

**Ready to learn? Start at http://localhost:3000 ! 🚀**

