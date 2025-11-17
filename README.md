# Employee-Management

A simple and efficient Employee & Task Management System built with FastAPI, MySQL, and a clean HTML/CSS/JavaScript frontend. It supports role-based access for Admins and Employees.

---

## 🚀 Setup Steps

### 1. Clone the Repository

git clone https://github.com/Arul-11-git/Employee-Management.git
cd Employee-Management
2. Backend Setup (FastAPI)
Install dependencies:

pip install -r requirements.txt
Update your MySQL credentials in database.py.

Run the backend:

bash
Copy code
uvicorn main:app --reload
3. Frontend Setup
Open index.html directly
or serve locally:
python -m http.server 8000
Ensure your backend is running before using the UI.

TECH STACK
Frontend:
HTML
CSS
JavaScript

Backend:
FastAPI
Python
SQLAlchemy ORM
bcrypt (password hashing)

Database:
MySQL

Screenshots / Recording
Add your screenshots or screen recording here:

ASSUMPTION AND BONUS FEATURES
Assumptions:

Admin users are created manually or seeded.

Employees have restricted access and can see only tasks assigned to them.

Role is assigned during login based on backend validation.

Bonus Features

Clean, responsive UI layout.

Role-based dashboard rendering.

Secure login with bcrypt hashing.

Search and filter functionality for employees and tasks.

Modal-based Add/Edit forms for better UX.

