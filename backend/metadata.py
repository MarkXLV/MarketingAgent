import json
import logging
import sys
from pathlib import Path

_metadata_cache = None
METADATA_PATH = Path(__file__).parent / "product_metadata.json"

def load_metadata():
    global _metadata_cache
    try:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata_cache = json.load(f)
    except Exception as e:
        logging.error(f"Failed to load product_metadata.json: {e}")
        sys.exit(1)

def get_metadata():
    if _metadata_cache is None:
        load_metadata()
    return _metadata_cache 