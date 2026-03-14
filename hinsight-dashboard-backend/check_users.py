from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.user import User  # updated import

engine = create_engine(
    "sqlite:///./hinsight_ca.db", connect_args={"check_same_thread": False}
)
Session = sessionmaker(bind=engine)
db = Session()

users = db.query(User).all()

print("Users in CA DB:")
for u in users:
    print(u.email)

engine = create_engine(
    "sqlite:///./hinsight_ca.db", connect_args={"check_same_thread": False}
)
Session = sessionmaker(bind=engine)
db = Session()

for u in db.query(User).all():
    print(
        u.email,
        getattr(u, "is_active", None),
        getattr(u, "tenant_id", None),
        getattr(u, "tenant_slug", None),
    )
