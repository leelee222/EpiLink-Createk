from typing import Optional, Dict, List, Any
import motor.motor_asyncio
from contextlib import asynccontextmanager
from app.credentials.config import MONGO_CONNECTION_STRING
from bson.objectid import ObjectId
from app.routers.models import UserInDB

class MongoConnectionManager:
    _instance: Optional['MongoConnectionManager'] = None
    _clients: Dict[str, motor.motor_asyncio.AsyncIOMotorClient] = {}
    
    MONGO_CONFIG = {
        "maxPoolSize": 1000,
        "minPoolSize": 50,
        "maxIdleTimeMS": 45000,
        "waitQueueTimeoutMS": 10000,
        "serverSelectionTimeoutMS": 10000,
        "retryWrites": True,
    }

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.url = MONGO_CONNECTION_STRING
        
    async def get_client(self) -> motor.motor_asyncio.AsyncIOMotorClient:
        if 'default' not in self._clients:
            self._clients['default'] = motor.motor_asyncio.AsyncIOMotorClient(
                self.url, 
                **self.MONGO_CONFIG
            )
        return self._clients['default']

    async def close_all(self):
        for client in self._clients.values():
            client.close()
        self._clients.clear()

    @asynccontextmanager
    async def get_collection(self, db_name: str, collection_name: str):
        client = await self.get_client()
        try:
            collection = client[db_name][collection_name]
            yield collection
        finally:
            pass

class MongoRepository:
    def __init__(self, db_name: str, collection_name: str):
        self.db_name = db_name
        self.collection_name = collection_name
        self.connection_manager = MongoConnectionManager()

    def _user_helper(self, user: dict) -> dict:
        return {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "password": user["password"]
        }

    async def create_db(self, db: str) -> None:
        client = await self.connection_manager.get_client()
        if db not in await client.list_database_names():
            client[db]

    async def create_collection(self, collection: str) -> None:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as db:
            if collection not in await db.database.list_collection_names():
                await db.database.create_collection(collection)

    async def get_user(self, username: str) -> Optional[UserInDB]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            user = await collection.find_one({"username": username})
            if user:
                return UserInDB(
                    username=user["username"],
                    email=user.get("email"),
                    hashed_password=user.get("hashed_password", ""),
                    provider=user.get("provider", "area"),
                    disabled=user.get("disabled", False),
                    is_superuser=user.get("is_superuser", False),
                )
            return None

    async def create_user(self, user: dict) -> dict:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.insert_one(user)
            return await collection.find_one({"_id": result.inserted_id})

    async def get_me_id(self, username: str) -> str:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            user = await collection.find_one({"username": username})
            return str(user["_id"])

    async def get_user_by_github_id(self, github_id: int) -> Optional[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find_one({"github_id": github_id})

    async def get_user_by_username(self, username: str) -> Optional[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find_one({"username": username})

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find_one({"email": email})

    async def update_user(self, username: str, data: dict) -> bool:
        if len(data) < 1:
            return False
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.update_one(
                {"username": username}, {"$set": data}
            )
            return result.modified_count > 0

    async def delete_user(self, username: str) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.delete_one({"username": username})
            return result.deleted_count > 0

    async def dump_data(self) -> List[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find({}).to_list(length=None)

    async def insert_data(self, data) -> Any:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.insert_one(data)
            return result.inserted_id

    async def get_data(self, username: str) -> Optional[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find_one({"username": username})
    
    async def get_workflow_by_id(self, workflow_id: str) -> Optional[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            return await collection.find_one({"_id": ObjectId(workflow_id)})

    async def update_data(self, username: str, workflow_id: str, data: dict) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.update_one(
                {"username": username, "_id": ObjectId(workflow_id)},
                {"$set": data}
            )
            return result.modified_count > 0

    async def delete_workflow(self, username: str, workflow_id: str) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.delete_one(
                {"username": username, "_id": ObjectId(workflow_id)}
            )
            return result.deleted_count > 0

    async def disable_workflow(self, username: str, workflow_id: str) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.update_one(
                {"username": username, "_id": ObjectId(workflow_id)},
                {"$set": {"is_active": False}}
            )
            return result.modified_count > 0

    async def get_all(self) -> List[dict]:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            cursor = collection.find({})
            results = await cursor.to_list(length=None)
            for document in results:
                document["_id"] = str(document["_id"])
            return results
    async def update_data_by_id(self, _id: str, data: dict) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.update_one(
                {"_id": ObjectId(_id)},
                {"$set": data}
            )
            return result.modified_count > 0

    async def delete_data_by_id(self, _id: str) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.delete_one({"_id": ObjectId(_id)})
            return result.deleted_count > 0

    async def delete_all(self, username: str) -> None:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            await collection.delete_many({"username": username})
    
    async def get_username_by_id(self, _id: str) -> str:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            user = await collection.find_one({"_id": ObjectId(_id)})
            return user["username"]
    
    async def delete_user(self, username: str) -> bool:
        async with self.connection_manager.get_collection(self.db_name, self.collection_name) as collection:
            result = await collection.delete_one({"username": username})
            return result.deleted_count > 0