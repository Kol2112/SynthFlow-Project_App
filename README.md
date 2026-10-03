# ⚡ SynthFlow

> Modern, full-stack project management platform built for speed, collaboration, and seamless developer workflows.

SynthFlow combines Kanban boards, interactive task lists, team collaboration, and automatic GitHub integration into a single, cohesive developer dashboard.

---

## 🌟 Key Features

### 📋 Interactive Task & Project Management
- **Kanban Board & List Views**: Switch seamlessly between visual Kanban columns and detailed list views.
- **Hierarchical Tasks**: Break down complex tasks into subtasks with real-time progress tracking.
- **Drag & Drop Reordering**: Intuitively reorder columns and tasks with instant backend persistence.
- **Priority & Deadline Management**: Assign priorities, track deadlines, and get visual warnings for overdue items.

### 🔗 GitHub Integration & Webhooks
- **Commit-Driven Task Updates**: Link your GitHub repository to automatically complete tasks via commit messages.
- **Flexible Smart References**:
  - `#12` – Complete a main task and all its associated subtasks.
  - `#12_2` – Mark the second subtask of Task #12 as completed.

### 👥 Team Collaboration & Access Control
- **Project Invitations**: Invite team members via direct email invitations.
- **Access Requests**: Request access to existing projects via project keys with owner authorization.
- **Real-Time Notifications**: Stay informed about task status changes, member actions, and deadline updates.

### 🔒 Security & User Management
- **Robust Authentication**: JWT (JSON Web Tokens) for secure session handling with access & refresh token flows.
- **Email Activations & Recovery**: Secure account verification and password resets using **Brevo REST API**.
- **User Profile Management**: Custom avatars, password changes, and email updates with security notifications.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React (Vite)
- **Styling**: CSS Modules with modern CSS Nesting
- **Icons**: React Icons
- **Deployment**: Vercel

### **Backend**
- **Framework**: FastAPI (Python 3.14)
- **ORM & Database Connection**: SQLAlchemy (with Connection Pooling) & `psycopg2`
- **Authentication**: Passlib (Bcrypt) + PyJWT
- **Email Service**: Brevo REST API (via `httpx`)
- **Background Tasks**: APScheduler & FastAPI `BackgroundTasks`
- **Deployment**: Render (Serverless/Web Service)

### **Database**
- **Database**: PostgreSQL on **Neon.tech** (Serverless with Connection Pooling enabled)

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.11+)
- **PostgreSQL**

---

### 1. Backend Setup

```bash
# Clone the repository
git clone [https://github.com/Kol2112/SynthFlow-Project_App.git](https://github.com/Kol2112/SynthFlow-Project_App.git)
cd SynthFlow-Project_App/backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

DATABASE_URL=postgresql://postgres:password@localhost:5432/synthflow_db
SECRET_KEY=your_super_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
BREVO_API_KEY=your_brevo_api_key
MAIL_FROM=your_verified_email@domain.com

#To start backend server
uvicorn main:app --reload
```

---

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
#inside .env
VITE_API_URL=http://localhost:8000/api

#To run frontend
npm run dev
```

### 3.GitHub Webhook Setup
Go to your GitHub Repository Settings -> Webhooks -> Add webhook.

- Set Payload URL to: https://your-backend-url.onrender.com/api/webhooks/github
- Set Content type to application/json.
- Select Just the push event.
- Save the webhook.
