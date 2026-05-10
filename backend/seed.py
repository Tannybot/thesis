"""
Seed script — populates the database with sample data for development/demo.
Run with: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, datetime, timedelta, timezone
from app.database import SessionLocal, engine, Base
from app.models import Role, User, Animal, HealthRecord, Treatment, Vaccination, Movement, QRCode
from app.utils.security import hash_password
from app.services.qr_service import generate_qr_code


def seed():
    """Seed the database with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already has data. Skipping seed.")
            return

        # === ROLES ===
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user_role = db.query(Role).filter(Role.name == "user").first()

        if not admin_role:
            admin_role = Role(name="admin", description="Full system access")
            db.add(admin_role)
        if not user_role:
            user_role = Role(name="user", description="Standard user / farmer / staff")
            db.add(user_role)
        db.flush()

        # === USERS ===
        admin = User(
            email="admin@livestock.com",
            full_name="System Administrator",
            hashed_password=hash_password("admin123"),
            role_id=admin_role.id,
        )
        farmer1 = User(
            email="farmer@livestock.com",
            full_name="Juan Dela Cruz",
            hashed_password=hash_password("farmer123"),
            role_id=user_role.id,
        )
        farmer2 = User(
            email="maria@livestock.com",
            full_name="Maria Santos",
            hashed_password=hash_password("maria123"),
            role_id=user_role.id,
        )
        db.add_all([admin, farmer1, farmer2])
        db.flush()

        print(f"✓ Created users: admin@livestock.com / admin123, farmer@livestock.com / farmer123")

        # === ANIMALS ===
        animals_data = [
            {"name": "Bessie", "species": "cattle", "breed": "Angus", "gender": "female",
             "weight": 450.0, "growth_stage": "breeder", "dob": date(2022, 3, 15)},
            {"name": "Thunder", "species": "cattle", "breed": "Brahman", "gender": "male",
             "weight": 520.0, "growth_stage": "finisher", "dob": date(2023, 1, 10)},
            {"name": "Snowflake", "species": "goat", "breed": "Boer", "gender": "female",
             "weight": 45.0, "growth_stage": "grower", "dob": date(2024, 6, 20)},
            {"name": "Billy", "species": "goat", "breed": "Anglo-Nubian", "gender": "male",
             "weight": 55.0, "growth_stage": "breeder", "dob": date(2023, 9, 5)},
            {"name": "Woolly", "species": "sheep", "breed": "Merino", "gender": "female",
             "weight": 65.0, "growth_stage": "grower", "dob": date(2024, 2, 14)},
            {"name": "Porky", "species": "pig", "breed": "Large White", "gender": "male",
             "weight": 110.0, "growth_stage": "finisher", "dob": date(2024, 4, 1)},
            {"name": "Rosie", "species": "pig", "breed": "Landrace", "gender": "female",
             "weight": 95.0, "growth_stage": "grower", "dob": date(2024, 7, 12)},
            {"name": "Clucky", "species": "poultry", "breed": "Rhode Island Red", "gender": "female",
             "weight": 3.5, "growth_stage": "breeder", "dob": date(2024, 1, 30)},
            {"name": "Rex", "species": "cattle", "breed": "Hereford", "gender": "male",
             "weight": 380.0, "growth_stage": "weaner", "dob": date(2025, 6, 15)},
            {"name": "Daisy", "species": "cattle", "breed": "Holstein", "gender": "female",
             "weight": 490.0, "growth_stage": "breeder", "dob": date(2021, 11, 8)},
        ]

        created_animals = []
        for i, adata in enumerate(animals_data):
            uid = f"LV-{adata['species'].upper()[:5]}-2026-{str(i+1).zfill(4)}S"
            animal = Animal(
                animal_uid=uid,
                name=adata["name"],
                species=adata["species"],
                breed=adata["breed"],
                date_of_birth=adata["dob"],
                gender=adata["gender"],
                weight=adata["weight"],
                growth_stage=adata["growth_stage"],
                status="active",
                owner_id=farmer1.id if i < 6 else farmer2.id,
                registered_by=admin.id,
            )
            db.add(animal)
            db.flush()

            # Generate QR code
            qr_data, qr_path = generate_qr_code(uid)
            animal.qr_code_path = qr_path
            qr = QRCode(animal_id=animal.id, qr_data=qr_data, qr_image_path=qr_path)
            db.add(qr)

            created_animals.append(animal)

        db.flush()
        print(f"✓ Created {len(created_animals)} animals with QR codes")

        # === HEALTH RECORDS ===
        health_data = [
            {"animal": 0, "type": "checkup", "desc": "Routine health checkup — all vitals normal",
             "severity": "low", "date": date(2025, 12, 1)},
            {"animal": 0, "type": "disease", "desc": "Mild respiratory infection detected",
             "severity": "medium", "diagnosis": "Bovine Respiratory Disease", "date": date(2026, 1, 15)},
            {"animal": 1, "type": "checkup", "desc": "Pre-transport health verification",
             "severity": "low", "date": date(2026, 2, 1)},
            {"animal": 2, "type": "observation", "desc": "Weight gain tracking — on track",
             "severity": "low", "date": date(2026, 1, 20)},
            {"animal": 5, "type": "disease", "desc": "Skin lesion observed on left flank",
             "severity": "high", "diagnosis": "Dermatitis", "date": date(2026, 2, 10)},
            {"animal": 9, "type": "mortality", "desc": "Found deceased — suspected cardiac event",
             "severity": "critical", "date": date(2026, 3, 1)},
        ]

        for hd in health_data:
            hr = HealthRecord(
                animal_id=created_animals[hd["animal"]].id,
                record_type=hd["type"],
                description=hd["desc"],
                severity=hd["severity"],
                diagnosis=hd.get("diagnosis"),
                record_date=hd["date"],
                recorded_by=admin.id,
            )
            db.add(hr)
        db.flush()
        print(f"✓ Created {len(health_data)} health records")

        # === TREATMENTS ===
        treatments_data = [
            {"animal": 0, "type": "medication", "med": "Oxytetracycline", "dose": "10mg/kg",
             "date": date(2026, 1, 16), "next": date(2026, 1, 23), "by": "Dr. Reyes"},
            {"animal": 5, "type": "medication", "med": "Ivermectin", "dose": "0.2mg/kg",
             "date": date(2026, 2, 11), "next": date(2026, 2, 25), "by": "Dr. Garcia"},
            {"animal": 5, "type": "therapy", "med": "Topical antiseptic wash", "dose": "2x daily",
             "date": date(2026, 2, 11), "next": None, "by": "Staff Nurse"},
        ]

        for td in treatments_data:
            t = Treatment(
                animal_id=created_animals[td["animal"]].id,
                treatment_type=td["type"],
                medication=td["med"],
                dosage=td["dose"],
                treatment_date=td["date"],
                next_treatment_date=td["next"],
                administered_by=td["by"],
                recorded_by=admin.id,
            )
            db.add(t)
        db.flush()
        print(f"✓ Created {len(treatments_data)} treatments")

        # === VACCINATIONS ===
        vacc_data = [
            {"animal": 0, "vaccine": "FMD Vaccine", "batch": "FMD-2026-001",
             "date": date(2025, 11, 1), "next": date(2026, 5, 1), "by": "Dr. Reyes"},
            {"animal": 1, "vaccine": "FMD Vaccine", "batch": "FMD-2026-001",
             "date": date(2025, 11, 1), "next": date(2026, 5, 1), "by": "Dr. Reyes"},
            {"animal": 2, "vaccine": "PPR Vaccine", "batch": "PPR-2026-003",
             "date": date(2026, 1, 5), "next": date(2027, 1, 5), "by": "Dr. Garcia"},
            {"animal": 3, "vaccine": "PPR Vaccine", "batch": "PPR-2026-003",
             "date": date(2026, 1, 5), "next": date(2027, 1, 5), "by": "Dr. Garcia"},
            {"animal": 7, "vaccine": "Newcastle Disease Vaccine", "batch": "NDV-2026-012",
             "date": date(2026, 2, 15), "next": date(2026, 5, 15), "by": "Dr. Santos"},
        ]

        for vd in vacc_data:
            v = Vaccination(
                animal_id=created_animals[vd["animal"]].id,
                vaccine_name=vd["vaccine"],
                batch_number=vd["batch"],
                vaccination_date=vd["date"],
                next_due_date=vd["next"],
                administered_by=vd["by"],
                recorded_by=admin.id,
            )
            db.add(v)
        db.flush()
        print(f"✓ Created {len(vacc_data)} vaccinations")

        # === MOVEMENTS ===
        movements_data = [
            {"animal": 1, "type": "transport", "from": "Farm A, Batangas",
             "to": "Livestock Auction, Laguna", "depart": datetime(2026, 2, 5, 6, 0, tzinfo=timezone.utc),
             "arrive": datetime(2026, 2, 5, 10, 0, tzinfo=timezone.utc),
             "handler": "Pedro Cruz", "transport": "truck", "purpose": "Auction sale"},
            {"animal": 1, "type": "sale", "from": "Livestock Auction, Laguna",
             "to": "Santos Farm, Cavite", "depart": datetime(2026, 2, 6, 14, 0, tzinfo=timezone.utc),
             "arrive": datetime(2026, 2, 6, 17, 0, tzinfo=timezone.utc),
             "handler": "Mario Santos", "transport": "truck", "purpose": "Purchase",
             "buyer": "Santos Livestock Corp."},
            {"animal": 8, "type": "transfer", "from": "Farm A, Batangas",
             "to": "Farm B, Batangas", "depart": datetime(2026, 3, 10, 7, 0, tzinfo=timezone.utc),
             "arrive": datetime(2026, 3, 10, 8, 0, tzinfo=timezone.utc),
             "handler": "Juan Dela Cruz", "transport": "walk", "purpose": "Pasture rotation"},
        ]

        for md in movements_data:
            m = Movement(
                animal_id=created_animals[md["animal"]].id,
                movement_type=md["type"],
                from_location=md["from"],
                to_location=md["to"],
                departure_date=md["depart"],
                arrival_date=md["arrive"],
                handler=md["handler"],
                transport_method=md["transport"],
                purpose=md["purpose"],
                buyer_info=md.get("buyer"),
                recorded_by=admin.id,
            )
            db.add(m)

        # Update Thunder's status to sold
        created_animals[1].status = "sold"
        # Update Daisy's status to deceased
        created_animals[9].status = "deceased"

        db.commit()
        print(f"✓ Created {len(movements_data)} movement records")
        print("\n🎉 Database seeded successfully!")
        print("\n📋 Login Credentials:")
        print("   Admin:  admin@livestock.com / admin123")
        print("   Farmer: farmer@livestock.com / farmer123")
        print("   Farmer: maria@livestock.com / maria123")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
