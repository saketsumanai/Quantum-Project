"""
SQLAlchemy ORM Models for Quantum Leap Platform.
Tables: users, user_sessions, lesson_progress, quiz_attempts
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)          # Firebase UID or user_id
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # Salted hash for email/password credentials
    photo_url = Column(String, nullable=True)
    provider = Column(String, default="google")    # "google" | "email"
    role = Column(String, default="student")       # "student" | "admin" | "researcher"
    age = Column(Integer, nullable=True)           # User age
    topics_covered = Column(Text, default="[]")    # JSON list of covered quantum topics
    tests_count = Column(Integer, default=0)       # Number of diagnostic tests completed
    total_xp = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="sessions")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String, nullable=False)
    module_id = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    completion_percentage = Column(Float, default=0.0)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="progress")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(String, nullable=False, index=True)
    selected_option = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    points_earned = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    topic = Column(String, nullable=True)
    attempted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")


class TestReport(Base):
    __tablename__ = "test_reports"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, default="intermediate")
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    score_percentage = Column(Float, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    question_reviews = Column(Text, nullable=False)  # JSON encoded detailed review
    ai_feedback = Column(Text, nullable=True)        # JSON encoded diagnosis
    created_at = Column(DateTime, default=datetime.utcnow)
