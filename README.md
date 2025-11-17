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

## 2.TECH STACK
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

## 3.SCREENSHOTS
## Login Page:
<img width="660" height="638" alt="s1" src="https://github.com/user-attachments/assets/1a18163a-b635-41f9-a12b-ae7faf462ca9" />
## Admin DashBoard(Manage Employees):
<img width="1917" height="636" alt="s2" src="https://github.com/user-attachments/assets/f03a4041-af0d-4ef8-8fd4-bd7624c185e2" />
## Admin DashBoard(Manage Tasks):
<img width="1902" height="587" alt="s3" src="https://github.com/user-attachments/assets/da8b414b-ab7e-49e4-afd1-87fdf5f969ae" />
## Employee DashBoard:
<img width="1913" height="446" alt="s4" src="https://github.com/user-attachments/assets/c2bcc23a-548a-4c14-81db-a27b96dffb77" />
## Database Records:
<img width="742" height="217" alt="s5" src="https://github.com/user-attachments/assets/e793cd30-f447-45b3-b7ad-1461d61dd2b8" />


## 4.ASSUMPTION AND BONUS FEATURES
Assumptions:

Admin users are created manually or seeded.

Employees have restricted access and can see only tasks assigned to them.

Role is assigned during login based on backend validation.

## Bonus Features

Clean, responsive UI layout.

Role-based dashboard rendering.

Secure login with bcrypt hashing.

Search and filter functionality for employees and tasks.

Modal-based Add/Edit forms for better UX.

