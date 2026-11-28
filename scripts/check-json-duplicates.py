#!/usr/bin/env python3
"""Reject duplicate JSON object keys before normal JSON parsing loses them."""

import json
import sys
from pathlib import Path


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


def self_test():
    for text in (
        '{"schemaVersion":1,"schemaVersion":1,"registries":[]}',
        '{"review":{"reviewer":"a","reviewer":"b"}}',
    ):
        try:
            json.loads(text, object_pairs_hook=unique_object)
        except ValueError:
            continue
        raise AssertionError("duplicate-key checker accepted a duplicate object key")
    json.loads('{"schemaVersion":1,"registries":[]}', object_pairs_hook=unique_object)


def main():
    arguments = sys.argv[1:]
    if "--self-test" in arguments:
        self_test()
        arguments.remove("--self-test")
        print("duplicate-key checker self-test passed")
    if not arguments:
        if "--self-test" in sys.argv:
            return
        raise SystemExit("usage: check-json-duplicates.py FILE [FILE ...]")
    for argument in arguments:
        path = Path(argument)
        with path.open(encoding="utf-8") as stream:
            json.load(stream, object_pairs_hook=unique_object)
        print(f"{path}: duplicate-key check passed")


if __name__ == "__main__":
    main()
