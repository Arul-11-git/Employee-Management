from sqlalchemy import Column, Integer, String, Boolean, BLOB, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    position = Column(String(150), nullable=True)
    password = Column(BLOB, nullable=False)
    role = Column(String(20), default="employee")  # "admin" or "employee"
    last_password_change = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="employee", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    employee = relationship("Employee", back_populates="tasks")
