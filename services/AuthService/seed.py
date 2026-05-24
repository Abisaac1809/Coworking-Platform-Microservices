import sys
import argparse
from dotenv import load_dotenv
load_dotenv()

from database.config import SessionLocal, Base, engine
from models.user import User
from pwdlib import PasswordHash

_pwd_hash = PasswordHash.recommended()

def seed_admin():
    Base.metadata.create_all(bind=engine)
    
    parser = argparse.ArgumentParser(description="Sembrar un administrador inicial en la base de datos.")
    parser.add_argument("--name", help="Nombre del administrador")
    parser.add_argument("--email", help="Email del administrador")
    parser.add_argument("--phone", help="Teléfono del administrador")
    parser.add_argument("--password", help="Contraseña del administrador")
    args = parser.parse_args()

    print("--- Creando Administrador Inicial ---")
    
    name = args.name or input("Nombre completo [Admin]: ") or "Admin"
    email = args.email or input("Email [admin@example.com]: ") or "admin@example.com"
    phone = args.phone or input("Teléfono [+57 300-1234567]: ") or "+58 424-1234567"
    password = args.password or input("Contraseña [admin123]: ") or "admin123"

    db = SessionLocal()
    try:
        existing = db.query(User).filter((User.email == email) | (User.phone == phone)).first()
        if existing:
            print(f"Error: Ya existe un usuario con el email '{email}' o teléfono '{phone}'.")
            sys.exit(1)
            
        hashed_password = _pwd_hash.hash(password)
        admin_user = User(
            name=name,
            email=email,
            phone=phone,
            password=hashed_password,
            role="Admin"
        )
        db.add(admin_user)
        db.commit()
        print(f"¡Administrador '{name}' ({email}) creado exitosamente con rol 'Admin'!")
        
    except Exception as e:
        print(f"Error al sembrar la base de datos: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
