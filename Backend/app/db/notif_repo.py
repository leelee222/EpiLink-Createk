from app.db.base_repo import BaseRepository

class NotificationRepository(BaseRepository):
    def __init__(self, db_name: str):
        super().__init__(db_name, "notifications")