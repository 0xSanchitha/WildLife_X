"""
Seed MongoDB with simulation animal catalog (Forest + Ocean food chains).

Usage (from backend/ directory):
    python -m scripts.seed_animals
    python -m scripts.seed_animals --merge   # upsert only simulation animals, keep others
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import db
from data.simulation_animals import SIMULATION_ANIMALS

animals_col = db["animals"]


def seed(merge: bool = False):
    if not merge:
        result = animals_col.delete_many({})
        print(f"Removed {result.deleted_count} existing animal documents.")

    inserted = 0
    updated = 0
    for animal in SIMULATION_ANIMALS:
        result = animals_col.update_one(
            {"id": animal["id"]},
            {"$set": animal},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
        elif result.modified_count:
            updated += 1

    total = animals_col.count_documents({})
    print(f"Seed complete: {inserted} inserted, {updated} updated. Total in DB: {total}")
    print("Forest food chain:")
    print("  Grass/Plants -> Rabbit/Mouse/Deer -> Fox/Owl -> Snow Leopard")
    print("Ocean food chain:")
    print("  Plankton -> Small Fish/Clownfish -> Tuna -> Great White Shark")


if __name__ == "__main__":
    merge_mode = "--merge" in sys.argv
    seed(merge=merge_mode)
