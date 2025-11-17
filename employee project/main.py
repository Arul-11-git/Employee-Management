from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import Base, engine, get_db
import crud
from crud import password_expired
from fastapi.middleware.cors import CORSMiddleware
import bcrypt
from schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, TaskCreate, TaskUpdate, TaskOut, LoginSchema
import models
from models import Employee, Task

# Create tables (if not exist)
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "*",  # allow all origins for testing, in production specify your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # allow these origins
    allow_credentials=True,
    allow_methods=["*"],            # allow all HTTP methods
    allow_headers=["*"],            # allow all headers
)

# -------- EMPLOYEES ---------

@app.post("/register", response_model=EmployeeOut)
def register(emp: EmployeeCreate, db: Session = Depends(get_db)):
    # check if email exists
    if db.query(Employee).filter(Employee.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    return crud.create_employee(db, emp)

@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.email == data.email).first()
    if not employee:
        raise HTTPException(status_code=400, detail="Invalid email")

    # check password
    if not bcrypt.checkpw(data.password.encode("utf-8"), employee.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    # check password expiry
    if crud.password_expired(employee):
        raise HTTPException(status_code=403, detail="Password expired, please update.")

    return {
        "message": "Login successful",
        "employee_id": employee.id,
        "role": employee.role,
        "name": employee.name
    }


@app.get("/employees", response_model=list[EmployeeOut])
def get_all_employees(db: Session = Depends(get_db)):
    return crud.get_employees(db)

@app.get("/employees/{emp_id}", response_model=EmployeeOut)
def get_employee(emp_id: int, db: Session = Depends(get_db)):
    return crud.get_employee(db, emp_id)

@app.put("/employees/{emp_id}", response_model=EmployeeOut)
def update_employee(emp_id: int, emp: EmployeeUpdate, db: Session = Depends(get_db)):
    return crud.update_employee(db, emp_id, emp)

@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    return crud.delete_employee(db, emp_id)


# -------- TASKS ---------

@app.post("/tasks", response_model=TaskOut)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task)

@app.get("/tasks", response_model=list[TaskOut])
def get_all_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)

@app.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return crud.get_task(db, task_id)

@app.get("/my-tasks", response_model=list[TaskOut])
def get_my_tasks(employee_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.employee_id == employee_id).all()
    return tasks

@app.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    return crud.update_task(db, task_id, task)

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    return crud.delete_task(db, task_id)
