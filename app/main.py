from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, compliance, contracts, notifications, obligations, renewals, reports, users
from app.database.database import test_database_connection


app = FastAPI(
    title="ContractIQ API - Contract & Obligation Management Platform",
    description="ContractIQ Compliance & Contract Management Platform with RBAC authorization, Reports, Analytics & Dashboard",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(contracts.router)
app.include_router(obligations.router)
app.include_router(renewals.router)
app.include_router(compliance.router)
app.include_router(notifications.router)
app.include_router(reports.router)


@app.on_event("startup")
def startup_event():
    try:
        import app.models  # Register all SQLAlchemy models
        from app.database.database import engine, Base
        Base.metadata.create_all(bind=engine)
        test_database_connection()
    except Exception as e:
        print("Database startup test exception (handled):", e)


@app.get("/")
def root():
    return {
        "message": "ContractIQ Backend API with Role-Based Access Control (RBAC) and Sprint 13 Reports & Analytics is running successfully.",
        "docs": "/docs",
        "roles": [
            "Administrator",
            "Legal Manager",
            "Compliance Officer",
            "Contract Manager",
            "Department Head",
            "Employee"
        ]
    }