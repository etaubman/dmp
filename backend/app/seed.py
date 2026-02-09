"""
Seed the database with sample data on first run.
Checks SeedFlag table; if no row exists, loads seed data from backend/seed-data/*.json
(domains, users, and per-domain data: applications, data elements, EUCs, endpoints,
DQ rules, data concerns, data feeds, etc.).

CLI: python -m app.seed (idempotent). python -m app.seed reset — wipes domain-related data
and re-seeds from seed-data files. python -m app.seed set-passwords — set all user passwords.
"""
from app.database import get_engine_and_session
from app.models import SeedFlag, User, Domain, DataElement, DataElementSOR, Application, EUC, Endpoint, DataFeed, DataFeedDataElement, DataFeedControl, DataQualityRule, DataQualityException, DataQualityRuleInstance, DataQualitySqlVersion, RuleModRequest, DataConcern
from app.auth.local_provider import hash_password
from app.seed_loader import add_domains_from_file, add_users_from_file, load_all_domain_data


# Default password for seed users (dev only; change in production)
SEED_DEFAULT_PASSWORD = "password"


def _add_users(db):
    """Create seed users from seed-data/users.json if the users table is empty; else ensure passwords."""
    if db.query(User).first() is not None:
        _ensure_users_have_passwords(db)
        return
    add_users_from_file(db, SEED_DEFAULT_PASSWORD)


def _ensure_users_have_passwords(db):
    """Set default password for any user with no password_hash (e.g. after adding column)."""
    for user in db.query(User).filter(User.password_hash.is_(None)):
        user.password_hash = hash_password(SEED_DEFAULT_PASSWORD)
    db.flush()


def _set_all_user_passwords(db):
    """Force-set every user's password to SEED_DEFAULT_PASSWORD. Use to fix 401 when hashes are missing or wrong."""
    for user in db.query(User).all():
        user.password_hash = hash_password(SEED_DEFAULT_PASSWORD)
    db.flush()


def ensure_all_users_have_passwords():
    """Call on startup: set default password for users with none, then force-set all (fixes bad/missing hashes)."""
    engine, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        _ensure_users_have_passwords(db)
        _set_all_user_passwords(db)  # force-set everyone so login works even if hashes were wrong
        db.commit()
    finally:
        db.close()


def set_all_passwords():
    """CLI: set every user's password to the default ('password'). Run once to fix login 401."""
    engine, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        _set_all_user_passwords(db)
        db.commit()
        count = db.query(User).count()
        print(f"Set password for {count} user(s). Use email + password 'password' to log in.")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


def run_seed():
    """If not already seeded, load seed data from seed-data/*.json and insert domains, users, and domain data."""
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        existing = db.query(SeedFlag).first()
        if existing:
            _add_users(db)
            db.commit()
            return

        name_to_id = add_domains_from_file(db)
        _add_users(db)
        load_all_domain_data(db, name_to_id)
        db.add(SeedFlag())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()



def reset_and_reseed():
    """
    Delete all domain-related data and the seed flag, then re-run the seed.
    Use this to replace old/imported domains with the current seed hierarchy (e.g. L0 Markets, L0 Banking).
    """
    _, SessionLocal = get_engine_and_session()
    db = SessionLocal()
    try:
        # Delete in dependency order (children before parents)
        db.query(DataConcern).delete()
        db.query(DataQualityException).delete()
        db.query(RuleModRequest).delete()
        db.query(DataQualityRuleInstance).delete()
        db.query(DataQualitySqlVersion).delete()
        db.query(DataQualityRule).delete()
        db.query(DataFeedControl).delete()
        db.query(DataFeedDataElement).delete()
        db.query(DataFeed).delete()
        db.query(Endpoint).delete()
        db.query(EUC).delete()
        db.query(DataElementSOR).delete()
        db.query(Application).delete()
        db.query(DataElement).delete()
        # Domains: clear parent_id to avoid self-FK, then delete all
        db.query(Domain).update({Domain.parent_id: None})
        db.query(Domain).delete()
        db.query(SeedFlag).delete()
        db.flush()

        name_to_id = add_domains_from_file(db)
        _add_users(db)
        load_all_domain_data(db, name_to_id)
        db.add(SeedFlag())
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        reset_and_reseed()
        print("Database reset and re-seeded with current domain hierarchy.")
    elif len(sys.argv) > 1 and sys.argv[1] == "set-passwords":
        set_all_passwords()
    else:
        run_seed()
