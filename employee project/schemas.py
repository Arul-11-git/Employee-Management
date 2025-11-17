from pydantic import BaseModel, EmailStr
from typing import Optional


class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    position: Optional[str] = None
    password: str
    role: Optional[str] = "employee"  # default to employee

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class EmployeeOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    position: Optional[str]
    role: str

    class Config:
        orm_mode = True

class EmployeeBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    position: Optional[str] = None

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    position: Optional[str] = None


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    employee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    employee_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    class Config:
        orm_mode = True
