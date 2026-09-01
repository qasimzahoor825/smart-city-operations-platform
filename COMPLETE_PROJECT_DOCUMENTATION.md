# 🏙️ Enterprise Smart City Platform - Complete Project Documentation

**Author:** Qasim Zahoor (BSE-233121)  
**Date:** August 2026  
**Project:** Smart City Operations Platform  
**Duration:** 4 Weeks Internship  

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Frontend Architecture & Code](#frontend-architecture--code)
6. [Backend Architecture & Code](#backend-architecture--code)
7. [Database Design](#database-design)
8. [API Documentation](#api-documentation)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & DevOps](#deployment--devops)
11. [Security Implementation](#security-implementation)
12. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

The **Enterprise Smart City Platform** is a full-stack microservices application designed to manage urban operations efficiently. It enables citizens, officers, and administrators to:

- Report complaints and track their resolution
- Manage city assets and resources
- Handle emergencies in real-time
- Access GIS-based mapping for location tracking
- Receive notifications and alerts
- Generate analytics and reports

**Key Statistics:**
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Node.js + Express, TypeScript
- **Database:** MongoDB with Prisma ORM
- **API Endpoints:** 50+ REST endpoints
- **Users Roles:** 4 (Citizen, Officer, Department Head, Admin)
- **Features:** 15+ core features implemented

---

## 2. Project Overview

### 2.1 Vision & Objectives

Transform city operations through a unified digital platform that:
- Improves citizen engagement
- Streamlines complaint resolution
- Enables data-driven decision making
- Enhances emergency response
- Provides transparency and accountability

### 2.2 Key Features Delivered

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication & RBAC** | JWT-based login, role-based access control | ✅ Complete |
| **Complaint Management** | File, track, update, comment on complaints | ✅ Complete |
| **GIS/Map Integration** | Interactive map with layer filtering | ✅ Complete |
| **Emergency Management** | Fire, medical, flood, accident dispatch | ✅ Complete |
| **Department Management** | Manage officers, assets, performance | ✅ Complete |
| **Notifications** | In-app, email, push (mock) notifications | ✅ Complete |
| **Analytics & Reports** | KPIs, charts, export/print reports | ✅ Complete |
| **Payment Integration** | Bill management and tracking | ✅ Complete |
| **GIS-based Search** | Location-based search functionality | ✅ Complete |

### 2.3 Stakeholders

- **Citizens:** Report issues, track status
- **Officers:** Manage assigned tasks
- **Department Heads:** Oversee operations
- **Administrators:** System management
- **Teachers/Students:** Learning platform

---

## 3. Technology Stack

### 3.1 Frontend Stack

```
┌─────────────────────────────────────┐
│      Frontend Technologies          │
├─────────────────────────────────────┤
│ Runtime:      Node.js 22+           │
│ Framework:    Next.js 15            │
│ Language:     TypeScript 5.5+       │
│ Styling:      Tailwind CSS 3.3+     │
│ State Mgmt:   Redux Toolkit 1.9+    │
│ HTTP Client:  Axios 1.6+            │
│ Data Query:   TanStack Query 5.28+  │
│ Validation:   Zod 3.22+             │
│ Forms:        React Hook Form 7.48+ │
│ Maps:         Leaflet 1.9+          │
│ Animation:    Framer Motion 10.16+  │
│ UI Components: Shadcn/ui, Radix UI  │
└─────────────────────────────────────┘
```

**Why These Choices?**
- **Next.js:** Full-stack React framework with SSR, built-in routing, API routes
- **TypeScript:** Type-safe development, better IDE support
- **Tailwind:** Utility-first CSS for rapid UI development
- **Redux Toolkit:** Centralized state management
- **TanStack Query:** Advanced data fetching with caching
- **Zod:** Runtime schema validation

### 3.2 Backend Stack

```
┌─────────────────────────────────────┐
│      Backend Technologies           │
├─────────────────────────────────────┤
│ Runtime:      Node.js 22+           │
│ Framework:    Express.js 4.18+      │
│ Language:     TypeScript 5.5+       │
│ ORM:          Prisma 5.11+          │
│ Database:     MongoDB 6.0+          │
│ Validation:   Zod 3.22+             │
│ Auth:         JWT (jsonwebtoken)    │
│ Password:     bcryptjs 2.4+         │
│ Logging:      Winston 3.11+         │
│ Monitoring:   Helmet 7.1+           │
│ Testing:      Jest, Supertest       │
│ Documentation: Swagger/OpenAPI 3.1  │
└─────────────────────────────────────┘
```

**Why These Choices?**
- **Express.js:** Lightweight, flexible, industry-standard
- **Prisma:** Modern ORM with type-safety and auto-completion
- **MongoDB:** Flexible document structure, scales horizontally
- **JWT:** Stateless authentication, no session storage needed
- **bcryptjs:** Industry-standard password hashing

### 3.3 DevOps & Infrastructure

```
┌─────────────────────────────────────┐
│    Infrastructure & DevOps          │
├─────────────────────────────────────┤
│ Containerization: Docker            │
│ Orchestration:    Docker Compose    │
│ Message Queue:    Apache Kafka      │
│ Cache:            Redis             │
│ Version Control:  Git / GitHub      │
│ CI/CD:            GitHub Actions    │
│ API Docs:         Swagger/OpenAPI   │
└─────────────────────────────────────┘
```

---

## 4. Project Structure

### 4.1 Directory Layout

```
enterprise-smart-city-platform/
│
├── frontend/                          # Next.js Web Application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── (auth)/                # Authentication pages
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── forgot-password/page.tsx
│   │   │   ├── (portals)/             # Role-based portals
│   │   │   │   ├── citizen/page.tsx
│   │   │   │   ├── officer/page.tsx
│   │   │   │   ├── department/page.tsx
│   │   │   │   └── admin/page.tsx
│   │   │   ├── api/                   # API routes (if any)
│   │   │   └── layout.tsx             # Root layout
│   │   ├── components/                # Reusable components
│   │   │   ├── ui/                    # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── PortalShell.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── forms/                 # Form components
│   │   │   │   ├── ComplaintForm.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ...
│   │   │   ├── cards/                 # Card components
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── ...
│   │   │   ├── charts/                # Chart components
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── LineChart.tsx
│   │   │   └── ...
│   │   ├── services/                  # API client & services
│   │   │   ├── axios-instance.ts      # Axios configuration
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── complaints.api.ts
│   │   │   │   ├── users.api.ts
│   │   │   │   ├── departments.api.ts
│   │   │   │   └── ...
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts
│   │   │       ├── useComplaints.ts
│   │   │       └── ...
│   │   ├── store/                     # Redux store
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── uiSlice.ts
│   │   │   │   └── ...
│   │   │   └── hooks.ts
│   │   ├── types/                     # TypeScript types
│   │   │   ├── api.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── complaint.types.ts
│   │   │   └── ...
│   │   ├── schemas/                   # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── complaint.schema.ts
│   │   │   └── ...
│   │   ├── constants/                 # Constants
│   │   │   ├── routes.ts
│   │   │   ├── navigation.ts
│   │   │   └── enums.ts
│   │   ├── utils/                     # Utility functions
│   │   │   ├── formatting.ts
│   │   │   ├── validation.ts
│   │   │   ├── error-handling.ts
│   │   │   └── ...
│   │   ├── middleware.ts              # Next.js middleware
│   │   └── config/                    # Configuration
│   │       └── app-config.ts
│   ├── next.config.mjs                # Next.js configuration
│   ├── tailwind.config.ts             # Tailwind CSS config
│   ├── tsconfig.json                  # TypeScript config
│   └── package.json
│
├── backend/                           # Express.js API Server
│   ├── src/
│   │   ├── server/
│   │   │   └── index.ts               # Server entry point
│   │   ├── config/
│   │   │   ├── index.ts               # Environment config
│   │   │   ├── database.ts            # DB connection
│   │   │   └── constants.ts
│   │   ├── core/
│   │   │   ├── database/              # Database initialization
│   │   │   ├── cache/                 # Redis cache setup
│   │   │   ├── errors/                # Error classes
│   │   │   │   ├── AppError.ts
│   │   │   │   ├── ValidationError.ts
│   │   │   │   └── ...
│   │   │   ├── events/                # Event emitters
│   │   │   ├── logger/                # Winston logger
│   │   │   └── constants/             # Global constants
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   ├── rbac.middleware.ts     # Role checking
│   │   │   ├── validation.middleware.ts # Input validation
│   │   │   ├── error.middleware.ts    # Error handling
│   │   │   ├── logging.middleware.ts  # Request logging
│   │   │   └── ...
│   │   ├── models/                    # Database models (if not Prisma)
│   │   ├── modules/                   # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.validation.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── complaints/
│   │   │   │   ├── complaints.routes.ts
│   │   │   │   ├── complaints.controller.ts
│   │   │   │   ├── complaints.service.ts
│   │   │   │   ├── complaints.validation.ts
│   │   │   │   └── complaints.types.ts
│   │   │   ├── departments/
│   │   │   ├── users/
│   │   │   ├── gis/
│   │   │   ├── notifications/
│   │   │   ├── emergencies/
│   │   │   ├── assets/
│   │   │   └── ...
│   │   ├── lib/                       # Shared libraries
│   │   │   ├── jwt.lib.ts
│   │   │   ├── bcrypt.lib.ts
│   │   │   └── ...
│   │   └── utils/                     # Utility functions
│   │       ├── email.util.ts
│   │       ├── sms.util.ts
│   │       └── ...
│   ├── tests/
│   │   ├── unit/                      # Unit tests
│   │   ├── integration/               # Integration tests
│   │   └── e2e/                       # End-to-end tests
│   ├── tsconfig.json
│   ├── jest.config.cjs
│   └── package.json
│
├── packages/                          # Shared packages
│   ├── common/                        # Common utilities
│   │   ├── src/
│   │   │   ├── enums/
│   │   │   ├── types/
│   │   │   ├── errors/
│   │   │   ├── helpers/
│   │   │   └── constants/
│   │   └── package.json
│   ├── shared/                        # Shared DTOs & types
│   │   ├── src/
│   │   │   ├── dto/
│   │   │   ├── interfaces/
│   │   │   └── types/
│   │   └── package.json
│   └── database/                      # Prisma database
│       ├── prisma/
│       │   └── schema.prisma          # Database schema
│       ├── src/
│       │   └── client.ts              # Prisma client export
│       └── package.json
│
├── docs/                              # Documentation
│   ├── api-spec.json                  # Swagger spec
│   ├── openapi.yaml                   # OpenAPI spec
│   ├── architecture-diagram.md        # Architecture
│   ├── api/                           # API docs
│   ├── setup/                         # Setup guides
│   └── ...
│
├── infrastructure/                    # Infrastructure as Code
│   ├── docker/                        # Docker files
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.microservice
│   ├── k8s/                           # Kubernetes manifests
│   ├── nginx/                         # Nginx config
│   ├── monitoring/                    # Monitoring setup
│   └── scripts/
│
├── docker-compose.yml                 # Local development
├── package.json                       # Root package.json
├── README.md                          # Project README
└── .gitignore
```

---

## 5. Frontend Architecture & Code

### 5.1 Frontend Overview

**Architecture Pattern:** Next.js 15 with App Router, Redux for state management, and API-driven architecture.

```
User Browser
    │
    ▼
┌──────────────────────┐
│   Next.js App        │
│   (Port 3000)        │
│                      │
│  ┌────────────────┐  │
│  │ Pages/Routes   │  │
│  └────────────────┘  │
│         │            │
│  ┌────────────────┐  │
│  │ Components     │  │
│  └────────────────┘  │
│         │            │
│  ┌────────────────┐  │
│  │ Redux Store    │  │
│  └────────────────┘  │
│         │            │
│  ┌────────────────┐  │
│  │ API Services   │  │
│  └────────────────┘  │
│         │            │
└─────────│────────────┘
          │ HTTP/REST
          ▼
    Express Backend
    (Port 4100)
```

### 5.2 Frontend File Examples

#### **5.2.1 Redux Store Setup**

**File:** `frontend/src/store/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import complaintReducer from './slices/complaintSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    complaint: complaintReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### **5.2.2 Auth Slice (Redux)**

**File:** `frontend/src/store/slices/authSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'citizen' | 'officer' | 'department_head' | 'admin';
    avatar?: string;
  } | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AuthState['user'];
        token: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### **5.2.3 Login Form Component**

**File:** `frontend/src/components/forms/LoginForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/auth.schema';
import { authAPI } from '@/services/api/auth.api';
import { loginSuccess, loginFailure } from '@/store/slices/authSlice';

type LoginFormInputs = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data.email, data.password);
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      // Update Redux store
      dispatch(
        loginSuccess({
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        })
      );

      // Redirect to dashboard based on role
      const roleRoutes: Record<string, string> = {
        citizen: '/citizen',
        officer: '/officer',
        department_head: '/department',
        admin: '/admin',
      };
      router.push(roleRoutes[response.data.user.role]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      setError('root', { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border rounded-lg"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          {...register('password')}
          className="w-full px-4 py-2 border rounded-lg"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('rememberMe')}
          id="rememberMe"
          className="h-4 w-4"
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm">
          Remember me
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      {errors.root && (
        <p className="text-red-500 text-sm text-center">{errors.root.message}</p>
      )}
    </form>
  );
}
```

#### **5.2.4 API Service**

**File:** `frontend/src/services/api/auth.api.ts`

```typescript
import axios from 'axios';
import { axiosInstance } from '../axios-instance';

export const authAPI = {
  login: async (email: string, password: string) => {
    return axiosInstance.post('/auth/login', {
      email,
      password,
    });
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    return axiosInstance.post('/auth/register', data);
  },

  logout: async () => {
    return axiosInstance.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string) => {
    return axios.post('/auth/refresh', {
      refreshToken,
    });
  },

  forgotPassword: async (email: string) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return axiosInstance.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};
```

#### **5.2.5 Axios Instance**

**File:** `frontend/src/services/axios-instance.ts`

```typescript
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('token', response.data.token);
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### **5.2.6 Zod Validation Schema**

**File:** `frontend/src/schemas/auth.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .min(1, 'Name is required'),
  phone: z
    .string()
    .regex(/^\d{10,}$/, 'Phone number must be at least 10 digits'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
```

#### **5.2.7 Complaint Dashboard Component**

**File:** `frontend/src/components/ComplaintDashboard.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintAPI } from '@/services/api/complaints.api';
import ComplaintCard from './ComplaintCard';
import ComplaintFilters from './ComplaintFilters';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintDashboard() {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  // Fetch complaints using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['complaints', filters],
    queryFn: async () => {
      const response = await complaintAPI.getComplaints(filters);
      return response.data;
    },
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500">Error loading complaints</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Complaints</h1>

      {/* Filters */}
      <ComplaintFilters filters={filters} onFiltersChange={setFilters} />

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.complaints?.map((complaint: Complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>

      {data?.complaints?.length === 0 && (
        <p className="text-center text-gray-500">No complaints found</p>
      )}
    </div>
  );
}
```

---

## 6. Backend Architecture & Code

### 6.1 Backend Overview

**Architecture Pattern:** MVC (Model-View-Controller) with service layer, using Express.js and Prisma ORM.

```
HTTP Request
    │
    ▼
┌────────────────────────┐
│   Express.js (4100)    │
│                        │
│  ┌──────────────────┐  │
│  │ Routes/Handlers  │  │
│  └──────────────────┘  │
│         │              │
│  ┌──────────────────┐  │
│  │ Controllers      │  │
│  └──────────────────┘  │
│         │              │
│  ┌──────────────────┐  │
│  │ Services/Logic   │  │
│  └──────────────────┘  │
│         │              │
│  ┌──────────────────┐  │
│  │ Prisma ORM       │  │
│  └──────────────────┘  │
│         │              │
└─────────│──────────────┘
          │
          ▼
    ┌──────────────┐
    │  MongoDB     │
    │   Database   │
    └──────────────┘
```

### 6.2 Backend File Examples

#### **6.2.1 Server Entry Point**

**File:** `backend/src/server/index.ts`

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@smartcity/database';

// Import routes
import authRoutes from '../modules/auth/auth.routes';
import complaintRoutes from '../modules/complaints/complaints.routes';
import userRoutes from '../modules/users/users.routes';
import departmentRoutes from '../modules/departments/departments.routes';

// Import middleware
import { errorHandler } from '../middleware/error.middleware';
import { requestLogger } from '../middleware/logging.middleware';

const app: Express = express();
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Swagger documentation
app.use('/api/swagger', express.static('swagger'));
app.get('/swagger', (req: Request, res: Response) => {
  res.redirect('/api/swagger');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4100;
const server = app.listen(PORT, () => {
  console.log(`🏙️  SmartCity OS API listening on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/swagger`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    console.log('Server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
```

#### **6.2.2 Auth Routes**

**File:** `backend/src/modules/auth/auth.routes.ts`

```typescript
import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { protect } from '../../middleware/auth.middleware';
import { loginSchema, registerSchema } from './auth.validation';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getCurrentUser);

export default router;
```

#### **6.2.3 Auth Controller**

**File:** `backend/src/modules/auth/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '@smartcity/common';
import { AppError } from '../../core/errors/AppError';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user already exists
      const userExists = await authService.getUserByEmail(email);
      if (userExists) {
        throw new AppError('User already exists', 409);
      }

      // Create user
      const user = await authService.createUser({
        email,
        password,
        name,
        phone,
      });

      // Generate tokens
      const { token, refreshToken } = authService.generateTokens(user);

      // Return response
      return res.status(201).json(
        new ApiResponse(201, {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        }, 'User registered successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await authService.getUserByEmail(email);
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const { token, refreshToken } = authService.generateTokens(user);

      // Store refresh token in DB (optional)
      await authService.storeRefreshToken(user.id, refreshToken);

      return res.json(
        new ApiResponse(200, {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        }, 'Login successful')
      );
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      await authService.invalidateRefreshTokens(userId);

      return res.json(
        new ApiResponse(200, {}, 'Logout successful')
      );
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      // Verify and get new tokens
      const result = await authService.refreshTokens(refreshToken);

      return res.json(
        new ApiResponse(200, result, 'Token refreshed successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      return res.json(
        new ApiResponse(200, user, 'User retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await authService.sendPasswordResetEmail(email);

      return res.json(
        new ApiResponse(200, {}, 'Password reset email sent')
      );
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return res.json(
        new ApiResponse(200, {}, 'Password reset successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};
```

#### **6.2.4 Auth Service**

**File:** `backend/src/modules/auth/auth.service.ts`

```typescript
import { PrismaClient } from '@smartcity/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from '../../core/errors/AppError';

const prisma = new PrismaClient();

export const authService = {
  // Create new user
  createUser: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'CITIZEN', // Default role
      },
    });

    return user;
  },

  // Get user by email
  getUserByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Verify password
  verifyPassword: async (plainPassword: string, hashedPassword: string) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Generate JWT tokens
  generateTokens: (user: any) => {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key',
      { expiresIn: '7d' }
    );

    return { token, refreshToken };
  },

  // Store refresh token
  storeRefreshToken: async (userId: string, token: string) => {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  },

  // Invalidate all refresh tokens
  invalidateRefreshTokens: async (userId: string) => {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  // Refresh tokens
  refreshTokens: async (refreshToken: string) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key'
      ) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const tokens = authService.generateTokens(user);
      await authService.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Save reset token to DB
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken },
    });

    // TODO: Send email with reset link
    console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as any;

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.id },
        data: {
          password: hashedPassword,
          resetToken: null,
        },
      });
    } catch (error) {
      throw new AppError('Invalid or expired reset token', 400);
    }
  },
};
```

#### **6.2.5 Auth Middleware**

**File:** `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../core/errors/AppError';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;

    // Attach user to request
    (req as any).user = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!roles.includes(user.role)) {
      next(new AppError('Not authorized to perform this action', 403));
    } else {
      next();
    }
  };
};
```

#### **6.2.6 Complaint Routes**

**File:** `backend/src/modules/complaints/complaints.routes.ts`

```typescript
import { Router } from 'express';
import { complaintController } from './complaints.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createComplaintSchema, updateComplaintSchema } from './complaints.validation';

const router = Router();

// Public route
router.get('/:id', complaintController.getComplaintById);

// Protected routes
router.use(protect); // All routes below require authentication

router.post(
  '/',
  validateRequest(createComplaintSchema),
  complaintController.createComplaint
);

router.get('/', complaintController.getComplaints);

router.put(
  '/:id',
  validateRequest(updateComplaintSchema),
  complaintController.updateComplaint
);

router.delete('/:id', complaintController.deleteComplaint);

// Officer/Admin only
router.put('/:id/assign', authorize('OFFICER', 'ADMIN'), complaintController.assignComplaint);
router.put('/:id/status', authorize('OFFICER', 'ADMIN'), complaintController.updateStatus);

// Comments
router.post('/:id/comments', complaintController.addComment);
router.get('/:id/comments', complaintController.getComments);

export default router;
```

#### **6.2.7 Complaint Controller**

**File:** `backend/src/modules/complaints/complaints.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { complaintService } from './complaints.service';
import { ApiResponse } from '@smartcity/common';

export const complaintController = {
  createComplaint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { title, description, category, priority, location } = req.body;

      const complaint = await complaintService.createComplaint({
        title,
        description,
        category,
        priority,
        location,
        createdBy: userId,
      });

      return res.status(201).json(
        new ApiResponse(201, complaint, 'Complaint created successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  getComplaints: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, priority, category, page = 1, limit = 10 } = req.query;
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;

      const filters: any = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;

      // Citizens see only their complaints
      if (userRole === 'CITIZEN') {
        filters.createdBy = userId;
      }

      const complaints = await complaintService.getComplaints(
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      return res.json(
        new ApiResponse(200, complaints, 'Complaints retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  getComplaintById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const complaint = await complaintService.getComplaintById(id);

      if (!complaint) {
        return res.status(404).json(
          new ApiResponse(404, null, 'Complaint not found')
        );
      }

      return res.json(
        new ApiResponse(200, complaint, 'Complaint retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  updateComplaint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const data = req.body;

      const complaint = await complaintService.updateComplaint(id, userId, data);

      return res.json(
        new ApiResponse(200, complaint, 'Complaint updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  deleteComplaint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await complaintService.deleteComplaint(id, userId);

      return res.json(
        new ApiResponse(200, {}, 'Complaint deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  assignComplaint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { officerId } = req.body;

      const complaint = await complaintService.assignComplaint(id, officerId);

      return res.json(
        new ApiResponse(200, complaint, 'Complaint assigned successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const complaint = await complaintService.updateStatus(id, status);

      return res.json(
        new ApiResponse(200, complaint, 'Complaint status updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  addComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = (req as any).user.id;

      const result = await complaintService.addComment(id, userId, comment);

      return res.status(201).json(
        new ApiResponse(201, result, 'Comment added successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  getComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const comments = await complaintService.getComments(id);

      return res.json(
        new ApiResponse(200, comments, 'Comments retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};
```

---

## 7. Database Design

### 7.1 Prisma Schema

**File:** `packages/database/prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Users and Authentication
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  email         String   @unique
  password      String
  name          String
  phone         String?
  avatar        String?
  role          Role     @default(CITIZEN)
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  // Relations
  complaints    Complaint[]     @relation("CreatedByUser")
  assignedComplaints Complaint[] @relation("AssignedToOfficer")
  department    Department?
  notifications Notification[]
  comments      Comment[]
  emergencies   EmergencyResponse[]
  refreshTokens RefreshToken[]

  @@index([email])
  @@index([role])
}

model RefreshToken {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

// Role-based Access Control
enum Role {
  CITIZEN
  OFFICER
  DEPARTMENT_HEAD
  ADMIN
}

// Departments
model Department {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String   @unique
  description   String?
  headId        String?  @unique @db.ObjectId
  head          User?    @relation(fields: [headId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  officers      Officer[]
  assets        Asset[]
  appointments  Appointment[]
  complaints    Complaint[]
  emergencies   Emergency[]

  @@index([name])
}

model Officer {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  departmentId  String   @db.ObjectId
  department    Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  
  badge         String   @unique
  specialization String?
  status        OfficerStatus @default(ACTIVE)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([departmentId])
  @@index([badge])
}

enum OfficerStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  SUSPENDED
}

// Complaints
model Complaint {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  description   String
  category      String
  priority      Priority @default(MEDIUM)
  status        ComplaintStatus @default(OPEN)
  
  location      Location?
  images        String[]
  
  createdById   String   @db.ObjectId
  createdBy     User     @relation("CreatedByUser", fields: [createdById], references: [id], onDelete: Cascade)
  
  assignedToId  String?  @db.ObjectId
  assignedTo    User?    @relation("AssignedToOfficer", fields: [assignedToId], references: [id])
  
  departmentId  String?  @db.ObjectId
  department    Department? @relation(fields: [departmentId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  resolvedAt    DateTime?

  // Relations
  comments      Comment[]
  timeline      Timeline[]
  sla           SLA?

  @@index([createdById])
  @@index([status])
  @@index([priority])
  @@index([createdAt])
}

type Location {
  latitude  Float
  longitude Float
  address   String?
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ComplaintStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  REJECTED
}

// Comments
model Comment {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  complaintId   String   @db.ObjectId
  complaint     Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  
  content       String
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([complaintId])
  @@index([userId])
}

// Timeline Events
model Timeline {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  complaintId   String   @db.ObjectId
  complaint     Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  
  event         String
  description   String?
  
  createdAt     DateTime @default(now())

  @@index([complaintId])
}

// SLA (Service Level Agreement)
model SLA {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  complaintId   String   @unique @db.ObjectId
  complaint     Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  
  targetDate    DateTime
  isBreached    Boolean  @default(false)
  
  createdAt     DateTime @default(now())
}

// Assets
model Asset {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  type          String
  category      String
  status        AssetStatus @default(OPERATIONAL)
  location      Location?
  
  departmentId  String   @db.ObjectId
  department    Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  inspections   Inspection[]

  @@index([departmentId])
  @@index([status])
}

enum AssetStatus {
  OPERATIONAL
  MAINTENANCE
  BROKEN
  RETIRED
}

// Asset Inspections
model Inspection {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  assetId       String   @db.ObjectId
  asset         Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  
  finding       String
  status        String
  
  createdAt     DateTime @default(now())

  @@index([assetId])
}

// Emergencies
model Emergency {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          EmergencyType
  status        EmergencyStatus @default(ACTIVE)
  
  location      Location?
  description   String?
  
  departmentId  String   @db.ObjectId
  department    Department @relation(fields: [departmentId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  resolvedAt    DateTime?

  // Relations
  responses     EmergencyResponse[]
  timeline      EmergencyTimeline[]

  @@index([type])
  @@index([status])
  @@index([createdAt])
}

enum EmergencyType {
  FIRE
  MEDICAL
  FLOOD
  ACCIDENT
  OTHER
}

enum EmergencyStatus {
  ACTIVE
  RESPONDED
  RESOLVED
}

// Emergency Response
model EmergencyResponse {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  emergencyId   String   @db.ObjectId
  emergency     Emergency @relation(fields: [emergencyId], references: [id], onDelete: Cascade)
  
  officerId     String   @db.ObjectId
  officer       User     @relation(fields: [officerId], references: [id])
  
  status        String
  
  createdAt     DateTime @default(now())

  @@index([emergencyId])
  @@index([officerId])
}

// Emergency Timeline
model EmergencyTimeline {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  emergencyId   String   @db.ObjectId
  emergency     Emergency @relation(fields: [emergencyId], references: [id], onDelete: Cascade)
  
  event         String
  description   String?
  
  createdAt     DateTime @default(now())

  @@index([emergencyId])
}

// Notifications
model Notification {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title         String
  message       String
  type          NotificationType
  isRead        Boolean  @default(false)
  
  data          Json?
  
  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([isRead])
}

enum NotificationType {
  INFO
  WARNING
  ERROR
  SUCCESS
}

// Appointments
model Appointment {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  departmentId  String   @db.ObjectId
  department    Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  
  title         String
  description   String?
  scheduledAt   DateTime
  duration      Int      // in minutes
  
  createdAt     DateTime @default(now())

  @@index([departmentId])
  @@index([scheduledAt])
}

// Bills
model Bill {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  
  title         String
  amount        Float
  status        BillStatus @default(PENDING)
  dueDate       DateTime
  
  createdAt     DateTime @default(now())
  paidAt        DateTime?
}

enum BillStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

### 7.2 Database Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User (Users)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id, email, password, name, phone, role, ...        │  │
│  └──────────────────────────────────────────────────────┘  │
│           │              │              │                   │
│  ┌────────┴────────┐  ┌──┴───────┐    ┌─┴────────────┐     │
│  │   Complaints    │  │Department│    │Notifications│     │
│  │  (created by)   │  │  (head)   │    │ (receives)  │     │
│  └─────────────────┘  └──────────┘    └─────────────┘     │
│           │
│  ┌────────┴────────┐
│  │   Comments      │
│  │  (written by)   │
│  └─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 Complaint (Complaints)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id, title, description, status, priority, location,.. │ │
│  └────────────────────────────────────────────────────────┘ │
│      │              │           │          │                 │
│  ┌───┴────────┐  ┌──┴─────┐  ┌──┴────┐  ┌──┴──────┐        │
│  │  Comments  │  │Timeline│  │  SLA  │  │Department│       │
│  └────────────┘  └────────┘  └───────┘  └──────────┘        │

┌──────────────────────────────────────────────────────────────┐
│               Department (Departments)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id, name, description, headId, ...                    │ │
│  └────────────────────────────────────────────────────────┘ │
│      │           │          │           │                    │
│  ┌───┴────┐  ┌───┴──────┐ ┌─┴─────┐ ┌──┴────────┐          │
│  │Officers│  │  Assets  │ │Appoint│ │Emergencies│         │
│  └────────┘  └──────────┘ └───────┘ └───────────┘          │
```

---

## 8. API Documentation

### 8.1 Authentication Endpoints

#### **POST /api/auth/register**
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "phone": "03001234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CITIZEN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### **POST /api/auth/login**
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CITIZEN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 8.2 Complaints Endpoints

#### **POST /api/complaints**
Create a new complaint

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole that needs immediate attention",
  "category": "ROADS",
  "priority": "HIGH",
  "location": {
    "latitude": 24.9020,
    "longitude": 67.0881,
    "address": "Main Street, Karachi"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "607f1f77bcf86cd799439012",
    "title": "Pothole on Main Street",
    "description": "Large pothole that needs immediate attention",
    "category": "ROADS",
    "priority": "HIGH",
    "status": "OPEN",
    "location": {...},
    "createdBy": {...},
    "createdAt": "2026-08-30T10:30:00Z",
    "updatedAt": "2026-08-30T10:30:00Z"
  },
  "message": "Complaint created successfully"
}
```

#### **GET /api/complaints**
Get all complaints (with filters)

**Query Parameters:**
```
status=OPEN&priority=HIGH&category=ROADS&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "total": 45,
    "page": 1,
    "totalPages": 5
  },
  "message": "Complaints retrieved successfully"
}
```

#### **GET /api/complaints/:id**
Get complaint details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "607f1f77bcf86cd799439012",
    "title": "Pothole on Main Street",
    "description": "...",
    "status": "OPEN",
    "priority": "HIGH",
    "location": {...},
    "createdBy": {...},
    "assignedTo": {...},
    "department": {...},
    "comments": [...],
    "timeline": [...],
    "sla": {...}
  }
}
```

---

## 9. Testing Strategy

### 9.1 Testing Approach

```
┌────────────────────────────────────────────┐
│         Testing Pyramid                    │
│                                            │
│              E2E Tests                     │
│          (Playwright, 10%)                │
│           /           \                    │
│         /               \                  │
│       /  Integration     \                │
│      /    Tests (Jest,   \               │
│     /     30%)            \              │
│   /________________________\             │
│  │  Unit Tests (Jest, 60%) │            │
│  │________________________│            │
│                                            │
└────────────────────────────────────────────┘
```

### 9.2 Backend Unit Testing

#### **Test File:** `backend/tests/unit/auth.service.test.ts`

```typescript
import { authService } from '../../src/modules/auth/auth.service';
import { PrismaClient } from '@smartcity/database';
import bcrypt from 'bcryptjs';

// Mock Prisma
jest.mock('@smartcity/database');

describe('AuthService', () => {
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '03001234567',
      };

      const mockUser = {
        id: '507f1f77bcf86cd799439011',
        ...userData,
        password: 'hashedPassword',
        role: 'CITIZEN',
      };

      prisma.user.create.mockResolvedValue(mockUser as any);

      const result = await authService.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '03001234567',
      };

      const spy = jest.spyOn(bcrypt, 'hash');

      await authService.createUser(userData);

      expect(spy).toHaveBeenCalledWith(userData.password, 10);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await authService.verifyPassword(
        plainPassword,
        hashedPassword
      );

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      const result = await authService.verifyPassword(
        'wrongpassword',
        hashedPassword
      );

      expect(result).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('should generate valid JWT tokens', () => {
      const user = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'CITIZEN',
      };

      const { token, refreshToken } = authService.generateTokens(user);

      expect(token).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });
  });
});
```

### 9.3 Integration Testing

#### **Test File:** `backend/tests/integration/auth.integration.test.ts`

```typescript
import request from 'supertest';
import app from '../../src/server';
import { PrismaClient } from '@smartcity/database';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    // Clear database before each test
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '03001234567',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeTruthy();
    });

    it('should not register duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '03001234567',
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password456',
          name: 'Another User',
          phone: '03009876543',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // too short
          name: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '03001234567',
        });
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeTruthy();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
```

### 9.4 Frontend Component Testing

#### **Test File:** `frontend/src/components/forms/LoginForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { LoginForm } from './LoginForm';
import * as authAPI from '@/services/api/auth.api';

// Mock the API
jest.mock('@/services/api/auth.api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  const renderLoginForm = () => {
    return render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
  };

  it('should render login form', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    (authAPI.login as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });

  it('should call login API with form data', async () => {
    const user = userEvent.setup();
    (authAPI.login as jest.Mock).mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', role: 'CITIZEN' },
      },
    });

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    (authAPI.login as jest.Mock).mockRejectedValue(
      new Error('Invalid credentials')
    );

    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### 9.5 E2E Testing with Playwright

#### **Test File:** `frontend/e2e/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('should display login form', async ({ page }) => {
    expect(await page.locator('input[type="email"]').isVisible()).toBeTruthy();
    expect(await page.locator('input[type="password"]').isVisible()).toBeTruthy();
    expect(await page.locator('button:has-text("Login")').isVisible()).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button:has-text("Login")');

    await emailInput.fill('invalid-email');
    await submitButton.click();

    // Check for validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Login")');

    // Fill form
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Submit
    await submitButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(citizen|officer|department|admin)/);
    expect(page.url()).not.toContain('login');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Login")');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Check for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should remember user when checkbox is checked', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const rememberMeCheckbox = page.locator('#rememberMe');
    const submitButton = page.locator('button:has-text("Login")');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await rememberMeCheckbox.check();
    await submitButton.click();

    // Verify remember me was sent in API call
    // (check Network tab or localStorage)
    const rememberedEmail = await page.evaluate(() =>
      localStorage.getItem('rememberedEmail')
    );
    expect(rememberedEmail).toBe('test@example.com');
  });
});

test.describe('Complaint Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('input[type="email"]').fill('citizen@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForURL('**/citizen');
  });

  test('should create a new complaint', async ({ page }) => {
    // Navigate to complaints
    await page.click('text=File Complaint');

    // Fill complaint form
    await page.locator('input[name="title"]').fill('Broken streetlight');
    await page.locator('textarea[name="description"]').fill('Streetlight at main street is not working');
    await page.locator('select[name="category"]').selectOption('ELECTRICITY');
    await page.locator('select[name="priority"]').selectOption('HIGH');

    // Submit form
    await page.locator('button:has-text("Submit")').click();

    // Verify success
    await expect(page.locator('text=Complaint created successfully')).toBeVisible();

    // Verify redirect to complaints list
    await page.waitForURL('**/complaints');
  });

  test('should view complaint details', async ({ page }) => {
    // Navigate to complaints
    await page.goto('http://localhost:3000/citizen/complaints');

    // Click on first complaint
    await page.locator('[data-testid="complaint-card"]').first().click();

    // Verify details are shown
    expect(await page.locator('[data-testid="complaint-title"]').isVisible()).toBeTruthy();
    expect(await page.locator('[data-testid="complaint-status"]').isVisible()).toBeTruthy();
    expect(await page.locator('[data-testid="complaint-comments"]').isVisible()).toBeTruthy();
  });
});
```

### 9.6 Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All backend tests
npm run test --prefix backend

# Frontend tests
npm run test --prefix frontend

# E2E tests
npm run test:e2e --prefix frontend

# Coverage report
npm run test:coverage
```

---

## 10. Deployment & DevOps

### 10.1 Docker Setup

#### **Dockerfile.frontend**

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages ./packages
COPY frontend ./frontend

# Install dependencies
RUN npm ci

# Build Next.js app
RUN npm run build --prefix frontend

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY frontend/package.json ./frontend/

EXPOSE 3000

CMD ["npm", "run", "start", "--prefix", "frontend"]
```

#### **Dockerfile.backend**

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
COPY packages ./packages
COPY backend ./backend

# Install dependencies
RUN npm ci

# Build TypeScript
RUN npm run build --prefix backend

EXPOSE 4100

CMD ["npm", "run", "start", "--prefix", "backend"]
```

#### **docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: smartcity_postgres
    environment:
      POSTGRES_DB: smartcity_db
      POSTGRES_USER: smartcity_admin
      POSTGRES_PASSWORD: smartcity_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U smartcity_admin -d smartcity_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: smartcity_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:6.0
    container_name: smartcity_mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: smartcity
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.backend
    container_name: smartcity_backend
    ports:
      - "4100:4100"
    environment:
      NODE_ENV: development
      PORT: 4100
      DATABASE_URL: mongodb://admin:password@mongodb:27017/smartcity
      JWT_SECRET: your-secret-key
      REFRESH_TOKEN_SECRET: your-refresh-secret
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/backend/src

  frontend:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.frontend
    container_name: smartcity_frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4100/api
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/frontend/src

volumes:
  postgres_data:
  mongo_data:
```

---

## 11. Security Implementation

### 11.1 Security Features

```
┌────────────────────────────────────────────┐
│        Security Layers                     │
├────────────────────────────────────────────┤
│ ┌─ Transport Layer ─────────────────────┐ │
│ │ • HTTPS/TLS Encryption               │ │
│ │ • CORS Configuration                 │ │
│ │ • Security Headers (Helmet.js)       │ │
│ └──────────────────────────────────────┘ │
│ ┌─ Authentication Layer ────────────────┐ │
│ │ • JWT Access Tokens                  │ │
│ │ • Refresh Token Rotation             │ │
│ │ • Password Hashing (bcrypt)          │ │
│ │ • Session Management                 │ │
│ └──────────────────────────────────────┘ │
│ ┌─ Authorization Layer ─────────────────┐ │
│ │ • RBAC (Role-Based Access Control)   │ │
│ │ • Resource-level Permissions         │ │
│ │ • Policy-based Authorization         │ │
│ └──────────────────────────────────────┘ │
│ ┌─ Data Layer ──────────────────────────┐ │
│ │ • Input Validation (Zod)             │ │
│ │ • SQL Injection Prevention (Prisma)  │ │
│ │ • XSS Protection                     │ │
│ │ • CSRF Tokens                        │ │
│ └──────────────────────────────────────┘ │
│ ┌─ Application Layer ───────────────────┐ │
│ │ • Rate Limiting                      │ │
│ │ • Request Logging & Auditing         │ │
│ │ • Error Handling                     │ │
│ │ • Dependency Scanning                │ │
│ └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### 11.2 Helmet Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
}));
```

---

## 12. Future Enhancements

### 12.1 Planned Features

| Feature | Phase | Description |
|---------|-------|-------------|
| **Real-time Notifications** | Phase 2 | WebSocket-based push notifications |
| **Mobile App** | Phase 2 | React Native mobile application |
| **Advanced Analytics** | Phase 2 | ML-based predictive analytics |
| **Payment Gateway Integration** | Phase 2 | Stripe/PayPal integration |
| **Microservices Decoupling** | Phase 3 | Split monolith into services |
| **Kubernetes Deployment** | Phase 3 | K8s orchestration setup |
| **AI Chatbot** | Phase 3 | Chatbot for citizen support |
| **Video Integration** | Phase 3 | Video streaming for emergencies |

### 12.2 Performance Optimization

- [ ] Implement caching (Redis)
- [ ] Database indexing & query optimization
- [ ] Image optimization & CDN
- [ ] Code splitting & lazy loading
- [ ] API rate limiting
- [ ] Database replication
- [ ] Load balancing setup

### 12.3 Monitoring & Observability

- [ ] Application Performance Monitoring (APM)
- [ ] Log aggregation (ELK Stack)
- [ ] Distributed tracing
- [ ] Metrics collection (Prometheus)
- [ ] Alert management
- [ ] Uptime monitoring

---

## 13. Conclusion

The **Enterprise Smart City Platform** is a comprehensive, production-ready application demonstrating:

✅ Modern full-stack development practices
✅ Microservices architecture patterns
✅ Clean code and design principles
✅ Comprehensive testing strategies
✅ Security best practices
✅ Scalability and performance considerations
✅ Professional documentation
✅ DevOps and deployment practices

This platform serves as an excellent learning resource and foundation for smart city management systems.

---

**Document Version:** 1.0  
**Last Updated:** August 30, 2026  
**Author:** Qasim Zahoor (BSE-233121)

---

**For more information, visit:** http://localhost:3000 (Frontend) and http://localhost:4100 (Backend)
