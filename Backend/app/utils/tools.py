import requests
import json
import redis
from app.credentials.config import REDIS_HOST, REDIS_PORT

def count_available_services_triggers_reactions(mapping):
    service_count = 0
    trigger_count = 0
    reaction_count = 0
    for service_name, service_data in mapping.items():
        if "is_available" in service_data and service_data["is_available"]:
            service_count += 1

        if "trigger" in service_data:
            for trigger_name, trigger_data in service_data["trigger"].items():
                if "is_available" in trigger_data and trigger_data["is_available"]:
                    trigger_count += 1

        if "reaction" in service_data:
            for reaction_name, reaction_data in service_data["reaction"].items():
                if "is_available" in reaction_data and reaction_data["is_available"]:
                    reaction_count += 1
    
    return {
        "available_services": service_count,
        "available_triggers": trigger_count,
        "available_reactions": reaction_count
    }