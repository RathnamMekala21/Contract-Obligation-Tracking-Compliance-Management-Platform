import random
from datetime import date, datetime, timedelta
from app.database.database import SessionLocal
from app.core.roles import UserRole, normalize_role
from app.core.security import get_password_hash
from app.models import (
    User, Contract, ContractVersion, Obligation, Renewal,
    Notification, Report, AuditLog, Activity
)

ROLES = [
    UserRole.ADMINISTRATOR.value,
    UserRole.LEGAL_MANAGER.value,
    UserRole.COMPLIANCE_OFFICER.value,
    UserRole.CONTRACT_MANAGER.value,
    UserRole.DEPARTMENT_HEAD.value,
    UserRole.EMPLOYEE.value,
]

DEPARTMENTS = ["Legal", "Compliance", "Finance", "Operations", "Sales", "Engineering", "HR"]
CONTRACT_TYPES = ["Service", "Software", "NDA", "Vendor", "Employment", "Licensing", "Procurement"]
CONTRACT_STATUSES = ["Active", "Pending Review", "Under Negotiation", "Expired", "Terminated"]
OBLIGATION_TYPES = ["Compliance", "Financial", "Audit", "Security", "Delivery", "Reporting"]
PRIORITIES = ["High", "Medium", "Low", "Urgent"]
RENEWAL_TYPES = ["Automatic", "Manual", "Optional"]
RENEWAL_STATUSES = ["Upcoming", "Pending Notice", "Renewed", "Not Started", "Expired"]
NOTIFICATION_TYPES = ["Reminder", "Urgent", "Info", "Status Update", "Warning"]
REPORT_TYPES = ["Compliance", "Financial", "Renewal", "Audit", "Risk Analysis"]
ACTIONS = ["CREATE", "UPDATE", "DELETE", "UPLOAD", "LOGIN"]
ACTIVITY_TYPES = ["Contract Created", "Obligation Assigned", "Version Uploaded", "NDA Activated", "Status Change", "Report Generated"]


import random
from datetime import date, datetime, timedelta
from sqlalchemy import func
from app.database.database import SessionLocal
from app.core.roles import UserRole, normalize_role
from app.core.security import get_password_hash
from app.models import (
    User, Contract, ContractVersion, Obligation, Renewal,
    Notification, Report, AuditLog, Activity
)

ROLES = [
    UserRole.ADMINISTRATOR.value,
    UserRole.LEGAL_MANAGER.value,
    UserRole.COMPLIANCE_OFFICER.value,
    UserRole.CONTRACT_MANAGER.value,
    UserRole.DEPARTMENT_HEAD.value,
    UserRole.EMPLOYEE.value,
]

DEPARTMENTS = ["Legal", "Compliance", "Finance", "Operations", "Sales", "Engineering", "HR"]
CONTRACT_TYPES = ["Service", "Software", "NDA", "Vendor", "Employment", "Licensing", "Procurement"]
CONTRACT_STATUSES = ["Active", "Pending Review", "Under Negotiation", "Expired", "Terminated"]
OBLIGATION_TYPES = ["Compliance", "Financial", "Audit", "Security", "Delivery", "Reporting"]
PRIORITIES = ["High", "Medium", "Low", "Urgent"]
RENEWAL_TYPES = ["Automatic", "Manual", "Optional"]
RENEWAL_STATUSES = ["Upcoming", "Pending Notice", "Renewed", "Not Started", "Expired"]
NOTIFICATION_TYPES = ["Reminder", "Urgent", "Info", "Status Update", "Warning"]
REPORT_TYPES = ["Compliance", "Financial", "Renewal", "Audit", "Risk Analysis"]
ACTIONS = ["CREATE", "UPDATE", "DELETE", "UPLOAD", "LOGIN"]
ACTIVITY_TYPES = ["Contract Created", "Obligation Assigned", "Version Uploaded", "NDA Activated", "Status Change", "Report Generated"]


def seed_database():
    db = SessionLocal()
    try:
        print("Starting ContractIQ Database Seeding...")

        # 1. Ensure core demo users exist
        default_pw = get_password_hash("password123")
        demo_accounts = [
            ("Contract Manager", "contract.manager@contractiq.com", UserRole.CONTRACT_MANAGER.value, "Legal"),
            ("Admin User", "user7@contractiq.com", UserRole.ADMINISTRATOR.value, "Compliance"),
            ("Compliance Officer", "user9@contractiq.com", UserRole.COMPLIANCE_OFFICER.value, "Compliance"),
        ]
        for name, email, role, dept in demo_accounts:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                db.add(User(
                    name=name,
                    email=email,
                    password_hash=default_pw,
                    role=normalize_role(role),
                    department=dept,
                    is_active=True
                ))
        try:
            db.commit()
        except Exception:
            db.rollback()

        # Update/Normalize existing users
        try:
            existing_users = db.query(User).all()
            for u in existing_users:
                u.role = normalize_role(u.role)
                if not getattr(u, "password_hash", None):
                    u.password_hash = default_pw
            db.commit()
        except Exception:
            db.rollback()

        # 2. Seed extra Users if needed
        try:
            current_user_count = db.query(User).count()
            if current_user_count < 20:
                new_users = []
                for idx in range(current_user_count + 1, 21):
                    role = ROLES[(idx - 1) % len(ROLES)]
                    dept = DEPARTMENTS[(idx - 1) % len(DEPARTMENTS)]
                    email = f"user{idx}_{random.randint(100,999)}@contractiq.com"
                    new_users.append(User(
                        name=f"User {idx} ({role.split()[0]})",
                        email=email,
                        password_hash=default_pw,
                        role=role,
                        department=dept,
                        is_active=True
                    ))
                db.add_all(new_users)
                db.commit()
        except Exception as e:
            db.rollback()
            print("Notice on user seeding:", e)

        all_users = db.query(User).all()
        user_ids = [u.user_id for u in all_users] if all_users else [1]

        # 3. Seed Contracts
        try:
            current_contract_count = db.query(Contract).count()
            if current_contract_count < 15:
                new_contracts = []
                for idx in range(current_contract_count + 1, 16):
                    ctype = CONTRACT_TYPES[(idx - 1) % len(CONTRACT_TYPES)]
                    cstatus = CONTRACT_STATUSES[(idx - 1) % len(CONTRACT_STATUSES)]
                    owner = user_ids[(idx - 1) % len(user_ids)]
                    creator = user_ids[idx % len(user_ids)]
                    s_date = date(2025, 1, 1) + timedelta(days=idx * 5)
                    e_date = s_date + timedelta(days=365)
                    val = round(10000.00 + (idx * 2500.50), 2)

                    new_contracts.append(Contract(
                        title=f"{ctype} Agreement #{idx} - Partner {idx}",
                        contract_type=ctype,
                        counterparty_name=f"Partner Corp {idx}",
                        status=cstatus,
                        start_date=s_date,
                        end_date=e_date,
                        contract_value=val,
                        owner_id=owner,
                        created_by=creator
                    ))
                db.add_all(new_contracts)
                db.commit()
        except Exception as e:
            db.rollback()
            print("Notice on contract seeding:", e)

        all_contracts = db.query(Contract).all()
        contract_ids = [c.contract_id for c in all_contracts] if all_contracts else [1]

        # 4. Seed Obligations
        try:
            current_ob_count = db.query(Obligation).count()
            if current_ob_count < 15:
                new_obs = []
                for idx in range(current_ob_count + 1, 16):
                    cid = contract_ids[(idx - 1) % len(contract_ids)]
                    resp_user = user_ids[(idx - 1) % len(user_ids)]
                    otype = OBLIGATION_TYPES[(idx - 1) % len(OBLIGATION_TYPES)]
                    prio = PRIORITIES[(idx - 1) % len(PRIORITIES)]
                    due = date(2025, 9, 1) + timedelta(days=idx * 3)

                    new_obs.append(Obligation(
                        contract_id=cid,
                        title=f"Obligation #{idx}: {otype} Deliverable for Contract #{cid}",
                        description=f"Execution requirements for obligation #{idx}.",
                        obligation_type=otype,
                        due_date=due,
                        responsible_user_id=resp_user,
                        status="Pending" if idx % 2 == 0 else "Completed",
                        priority=prio
                    ))
                db.add_all(new_obs)
                db.commit()
        except Exception as e:
            db.rollback()
            print("Notice on obligation seeding:", e)

        print("[SUCCESS] Database seeding executed safely.")

    except Exception as e:
        db.rollback()
        print("General error during database seeding (handled):", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
