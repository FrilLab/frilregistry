#!/usr/bin/env python3
"""Reject duplicate object keys that ordinary JSON decoders may silently overwrite."""

import json
from pathlib import Path


def reject_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


for filename in ("schema.json", "registries.json"):
    raw = Path(filename).read_bytes()
    raw.decode("utf-8", errors="strict")
    json.loads(raw, object_pairs_hook=reject_duplicates)
print("JSON duplicate-key validation passed.")
