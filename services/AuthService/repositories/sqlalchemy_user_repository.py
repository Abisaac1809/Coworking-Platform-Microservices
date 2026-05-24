from sqlalchemy.orm import Session
from schemas.user_schemas import UserToCreateSchema, UserInDb
from models.user import User


class SqlAlchemyUserRepository:
    def __init__(self, db: Session):
        self._db = db

    def _to_dto(self, orm_user: User) -> UserInDb:
        return UserInDb.model_validate(orm_user)

    def get_user_by_id(self, user_id: int) -> UserInDb | None:
        row = self._db.get(User, user_id)
        return self._to_dto(row) if row else None

    def get_user_by_email(self, email: str) -> UserInDb | None:
        row = self._db.query(User).filter(User.email == email).first()
        return self._to_dto(row) if row else None

    def get_user_by_phone(self, phone: str) -> UserInDb | None:
        row = self._db.query(User).filter(User.phone == phone).first()
        return self._to_dto(row) if row else None

    def get_list_of_users(self) -> list[UserInDb]:
        return [self._to_dto(r) for r in self._db.query(User).all()]

    def create_user(self, user_data: UserToCreateSchema) -> UserInDb:
        orm_user = User(**user_data.model_dump())
        self._db.add(orm_user)
        self._db.commit()
        self._db.refresh(orm_user)
        return self._to_dto(orm_user)

    def update_user(self, user_id: int, user_data: UserToCreateSchema) -> UserInDb:
        orm_user = self._db.get(User, user_id)
        for key, value in user_data.model_dump().items():
            setattr(orm_user, key, value)
        self._db.commit()
        self._db.refresh(orm_user)
        return self._to_dto(orm_user)

    def delete_user(self, user_id: int) -> None:
        orm_user = self._db.get(User, user_id)
        self._db.delete(orm_user)
        self._db.commit()
