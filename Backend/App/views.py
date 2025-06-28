from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()

# Connect to MongoDB
MONGO_URL = os.getenv('MONGO_URL')
client = MongoClient(MONGO_URL)
db = client['tododatabase']           # DB name
collection = db['tasks']            # Collection name

@csrf_exempt
def task_handler(request):
    if request.method == 'GET':
        # Get all items
        items = list(collection.find({}, {'_id': 0}))  # exclude MongoDB's _id field
        return JsonResponse({"items": items})

    elif request.method == 'POST':
        data = json.loads(request.body)
        # Auto-increment id (classic relational mindset, but let's do it)
        last_item = collection.find_one(sort=[("id", -1)])
        new_id = (last_item['id'] + 1) if last_item else 1
        data['id'] = new_id
        collection.insert_one(data)
        return JsonResponse({"message": "Item created", "item": data})

    elif request.method == 'PUT':
        data = json.loads(request.body)
        item_id = data.get('id')
        if not item_id:
            return JsonResponse({"error": "Missing 'id' in request"}, status=400)
        result = collection.update_one({"id": item_id}, {"$set": data})
        if result.matched_count == 0:
            return JsonResponse({"error": "Item not found"}, status=404)
        updated_item = collection.find_one({"id": item_id}, {'_id': 0})
        return JsonResponse({"message": "Item updated", "item": updated_item})

    elif request.method == 'DELETE':
        data = json.loads(request.body)
        item_id = data.get('id')
        if not item_id:
            return JsonResponse({"error": "Missing 'id' in request"}, status=400)
        result = collection.delete_one({"id": item_id})
        if result.deleted_count == 0:
            return JsonResponse({"error": "Item not found"}, status=404)
        return JsonResponse({"message": f"Item {item_id} deleted"})

    return JsonResponse({"error": "Method not allowed"}, status=405)
