# nuke_db.py
from database import engine
from sqlalchemy import text  # <-- DODAJEMY TEN IMPORT

def nuke():
    print("Nuking old tables...")
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            # Owijamy zapytania w funkcję text()
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            trans.commit()
            print("Sukces! Baza jest całkowicie czysta.")
        except Exception as e:
            trans.rollback()
            print(f"Błąd podczas czyszczenia: {e}")

if __name__ == "__main__":
    nuke()