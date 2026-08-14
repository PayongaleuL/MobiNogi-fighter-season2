"""Classify master-rune sentence inventory into explicit DPS model requirements.

This script treats the LLM output as a review aid only. It never changes runes.json
or the calculator; the master source and later deterministic tests remain authoritative.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "results" / "rune_sentence_inventory.json"
OUTPUT_PATH = ROOT / "results" / "rune_sentence_model_candidates.json"
MODEL = "gpt-5-mini"
BATCH_SIZE = 56

SCHEMA: dict[str, Any] = {
    "name": "rune_sentence_model_candidates",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "records": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "model_family": {
                            "type": "string",
                            "enum": [
                                "permanent_stat",
                                "duration_cooldown",
                                "stack_consume",
                                "target_debuff",
                                "direct_damage_dot",
                                "speed_recovery",
                                "external_context",
                                "non_outgoing_dps",
                            ],
                        },
                        "result_kind": {
                            "type": "string",
                            "enum": [
                                "applied_modifier",
                                "timeline_dps_delta",
                                "direct_damage_event",
                                "scenario_input_dps_delta",
                                "verified_zero_dps_delta",
                            ],
                        },
                        "effect_amount": {"type": "string"},
                        "trigger": {"type": "string"},
                        "duration_or_cooldown": {"type": "string"},
                        "stack_or_consumption": {"type": "string"},
                        "required_input": {"type": "string"},
                        "formula": {"type": "string"},
                        "requires_external_evidence": {"type": "boolean"},
                        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                    },
                    "required": [
                        "id",
                        "model_family",
                        "result_kind",
                        "effect_amount",
                        "trigger",
                        "duration_or_cooldown",
                        "stack_or_consumption",
                        "required_input",
                        "formula",
                        "requires_external_evidence",
                        "confidence",
                    ],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["records"],
        "additionalProperties": False,
    },
}

SYSTEM = """You are classifying Korean MMORPG rune descriptions for a deterministic DPS calculator.
Use only the quoted master-source sentence. Do not invent numeric values, probabilities,
stack rules, refresh rules, or defaults. Every sentence must be assigned a result path:
permanent modifier, timeline DPS delta, direct damage event, scenario-input DPS delta,
or verified zero outgoing-DPS delta. Korean output is required. A defensive/healing/movement
sentence may be verified_zero_dps_delta only when the sentence itself contains no outgoing
DPS or timeline effect. If a crucial rule is absent, set requires_external_evidence=true
and state exactly what is missing in required_input. Preserve numerical values exactly."""


def batch_records(records: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    return [records[index:index + BATCH_SIZE] for index in range(0, len(records), BATCH_SIZE)]


def request(batch: list[dict[str, Any]]) -> dict[str, Any]:
    payload = [
        {
            "id": item["id"],
            "rune": item["runeName"],
            "slot": item["slotType"],
            "sentence": item["sentence"],
        }
        for item in batch
    ]
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": "Classify every record exactly once.\n" + json.dumps(payload, ensure_ascii=False)},
        ],
        "response_format": {"type": "json_schema", "json_schema": SCHEMA},
        "max_completion_tokens": 12000,
    }, ensure_ascii=False).encode("utf-8")
    request_url = f"{os.environ['OPENAI_API_BASE'].rstrip('/')}/chat/completions"
    request_object = Request(
        request_url,
        data=body,
        headers={
            "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urlopen(request_object, timeout=180) as response:
        response_data = json.loads(response.read().decode("utf-8"))
    return json.loads(response_data["choices"][0]["message"]["content"])


def main() -> None:
    inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    source_records = inventory["records"]
    candidates: list[dict[str, Any]] = []

    for index, batch in enumerate(batch_records(source_records), start=1):
        result = request(batch)
        received = result["records"]
        expected_ids = {item["id"] for item in batch}
        received_ids = {item["id"] for item in received}
        if expected_ids != received_ids:
            raise RuntimeError(f"batch {index}: expected {len(expected_ids)} IDs, received {len(received_ids)}")
        candidates.extend(received)
        print(f"completed batch {index}: {len(received)} records")

    output = {
        "generatedFrom": "results/rune_sentence_inventory.json",
        "model": MODEL,
        "recordCount": len(candidates),
        "records": candidates,
    }
    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT_PATH), "recordCount": len(candidates)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
