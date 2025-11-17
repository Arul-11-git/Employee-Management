from sqlalchemy.orm import Session
from models import Employee, Task
from datetime import datetime,timedelta
import bcrypt
from schemas import EmployeeCreate, EmployeeUpdate, TaskCreate, TaskUpdate
from fastapi import HTTPException, status

import bcrypt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Employee

def hash_password(plain_password: str):
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())

def create_employee(db: Session, emp_data):
    hashed_pw = hash_password(emp_data.password)
    new_emp = Employee(
        name=emp_data.name,
        email=emp_data.email,
        position=emp_data.position,
        password=hashed_pw,
        role=getattr(emp_data, "role", "employee")
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

def password_expired(employee: Employee):
    return employee.last_password_change < datetime.utcnow() - timedelta(days=60)


def get_employees(db: Session):
    return db.query(Employee).all()

def get_employee(db: Session, emp_id: int):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp

def update_employee(db: Session, emp_id: int, emp_data: EmployeeUpdate):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    update_data = emp_data.dict(exclude_unset=True)
    if "password" in update_data:
        new_pass = update_data["password"]
        if new_pass:
            emp.password = hash_password(new_pass)
            emp.last_password_change = datetime.utcnow()   # ⭐ IMPORTANT
        update_data.pop("password")
    for key, value in emp_data.dict(exclude_unset=True).items():
        setattr(emp, key, value)
    db.commit()
    db.refresh(emp)
    return emp

def delete_employee(db: Session, emp_id: int):
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    db.delete(emp)
    db.commit()
    return {"message": "Employee deleted"}


def create_task(db: Session, t: TaskCreate):
    task = Task(**t.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_tasks(db: Session):
    return db.query(Task).all()

def get_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task

def update_task(db: Session, task_id: int, t_data: TaskUpdate):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    for key, value in t_data.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
