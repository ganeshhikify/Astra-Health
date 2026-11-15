"""
ASTRA HEALTH - Input Validation Module for Physiological Prediction
Validates incoming vital signs and derived metrics before feeding into the ML model.

Strict Rule:
Never invent missing physiological measurements. If a vital sign is missing,
raise a validation error instead of imputing fabricated values.
"""

from typing import Any, Dict, List, Optional, Tuple


class PhysiologicalValidationError(ValueError):
    """Raised when incoming physiological input is missing, invalid, or biologically implausible."""
    pass


# Biological plausibility boundaries for vital signs
# These are broad safety boundaries to catch corrupted sensors or invalid data,
# NOT diagnostic ranges.
PHYSIOLOGICAL_BOUNDS = {
    "heart_rate_bpm": {
        "min": 20.0,
        "max": 300.0,
        "unit": "BPM",
        "description": "Heart Rate",
    },
    "spo2_pct": {
        "min": 50.0,
        "max": 100.0,
        "unit": "%",
        "description": "Blood Oxygen Saturation (SpO2)",
    },
    "systolic_bp_mmhg": {
        "min": 40.0,
        "max": 300.0,
        "unit": "mmHg",
        "description": "Systolic Blood Pressure",
    },
    "diastolic_bp_mmhg": {
        "min": 20.0,
        "max": 200.0,
        "unit": "mmHg",
        "description": "Diastolic Blood Pressure",
    },
    "pulse_pressure_mmhg": {
        "min": 5.0,
        "max": 150.0,
        "unit": "mmHg",
        "description": "Pulse Pressure (Systolic - Diastolic)",
    },
    "map_mmhg": {
        "min": 30.0,
        "max": 220.0,
        "unit": "mmHg",
        "description": "Mean Arterial Pressure (Diastolic + PP/3)",
    },
}

REQUIRED_CORE_VITALS = [
    "heart_rate_bpm",
    "spo2_pct",
    "systolic_bp_mmhg",
    "diastolic_bp_mmhg",
]

EXPECTED_MODEL_FEATURES = [
    "heart_rate_bpm",
    "spo2_pct",
    "systolic_bp_mmhg",
    "diastolic_bp_mmhg",
    "pulse_pressure_mmhg",
    "map_mmhg",
]


def validate_input(
    raw_data: Dict[str, Any],
    strict_unexpected: bool = False,
) -> Tuple[Dict[str, float], Dict[str, float], List[str]]:
    """
    Validates input physiological vitals and computes standard derived hemodynamic parameters.

    Args:
        raw_data: Dictionary containing physiological vitals.
        strict_unexpected: If True, raises PhysiologicalValidationError on unknown fields.
                           If False, records warnings and ignores unexpected fields.

    Returns:
        Tuple of:
          - validated_features: Dict of all 6 features ordered for model consumption.
          - derived_features: Dict of derived metrics (pulse_pressure_mmhg, map_mmhg).
          - warnings: List of warning strings (e.g. unexpected fields ignored).

    Raises:
        PhysiologicalValidationError: If any required vital is missing, non-numeric,
                                     or outside plausible physiological bounds.
    """
    if not isinstance(raw_data, dict):
        raise PhysiologicalValidationError(
            f"Input data must be a dictionary, got {type(raw_data).__name__}"
        )

    warnings: List[str] = []
    validated: Dict[str, float] = {}
    derived: Dict[str, float] = {}

    # 1. Check unexpected fields
    unexpected_keys = set(raw_data.keys()) - set(EXPECTED_MODEL_FEATURES)
    if unexpected_keys:
        msg = f"Unexpected fields received and ignored: {sorted(list(unexpected_keys))}"
        if strict_unexpected:
            raise PhysiologicalValidationError(msg)
        warnings.append(msg)

    # 2. Check required core vitals (never impute or invent missing vitals)
    for vital in REQUIRED_CORE_VITALS:
        if vital not in raw_data or raw_data[vital] is None:
            raise PhysiologicalValidationError(
                f"Missing required physiological feature: '{vital}'. "
                f"Cannot invent or impute missing astronaut health measurements."
            )

        val = raw_data[vital]
        # Validate numeric type
        try:
            float_val = float(val)
        except (ValueError, TypeError):
            raise PhysiologicalValidationError(
                f"Invalid non-numeric value for '{vital}': {val!r}. Must be a valid float or int."
            )

        # Check bounds
        bounds = PHYSIOLOGICAL_BOUNDS[vital]
        if float_val < bounds["min"] or float_val > bounds["max"]:
            raise PhysiologicalValidationError(
                f"Value for '{vital}' ({float_val} {bounds['unit']}) is biologically implausible. "
                f"Valid physiological boundary is [{bounds['min']}, {bounds['max']}]."
            )

        validated[vital] = float_val

    # 3. Hemodynamic consistency check (Systolic must exceed Diastolic)
    sys_val = validated["systolic_bp_mmhg"]
    dia_val = validated["diastolic_bp_mmhg"]
    if sys_val <= dia_val:
        raise PhysiologicalValidationError(
            f"Systolic blood pressure ({sys_val} mmHg) must be strictly greater than "
            f"diastolic blood pressure ({dia_val} mmHg)."
        )

    # 4. Handle derived features: Pulse Pressure and Mean Arterial Pressure (MAP)
    # If provided explicitly, validate them; otherwise calculate via standard formulas.
    # Pulse Pressure = Systolic - Diastolic
    calc_pp = round(sys_val - dia_val, 2)
    if "pulse_pressure_mmhg" in raw_data and raw_data["pulse_pressure_mmhg"] is not None:
        try:
            pp_input = float(raw_data["pulse_pressure_mmhg"])
        except (ValueError, TypeError):
            raise PhysiologicalValidationError(
                f"Invalid non-numeric value for 'pulse_pressure_mmhg': {raw_data['pulse_pressure_mmhg']!r}"
            )
        # Check against bounds
        pp_bounds = PHYSIOLOGICAL_BOUNDS["pulse_pressure_mmhg"]
        if pp_input < pp_bounds["min"] or pp_input > pp_bounds["max"]:
            raise PhysiologicalValidationError(
                f"Pulse pressure ({pp_input} mmHg) is outside plausible boundary [{pp_bounds['min']}, {pp_bounds['max']}]."
            )
        validated["pulse_pressure_mmhg"] = pp_input
    else:
        validated["pulse_pressure_mmhg"] = calc_pp
        derived["pulse_pressure_mmhg"] = calc_pp

    # MAP = Diastolic + (Pulse Pressure / 3.0)
    calc_map = round(dia_val + (validated["pulse_pressure_mmhg"] / 3.0), 2)
    if "map_mmhg" in raw_data and raw_data["map_mmhg"] is not None:
        try:
            map_input = float(raw_data["map_mmhg"])
        except (ValueError, TypeError):
            raise PhysiologicalValidationError(
                f"Invalid non-numeric value for 'map_mmhg': {raw_data['map_mmhg']!r}"
            )
        map_bounds = PHYSIOLOGICAL_BOUNDS["map_mmhg"]
        if map_input < map_bounds["min"] or map_input > map_bounds["max"]:
            raise PhysiologicalValidationError(
                f"MAP ({map_input} mmHg) is outside plausible boundary [{map_bounds['min']}, {map_bounds['max']}]."
            )
        validated["map_mmhg"] = map_input
    else:
        validated["map_mmhg"] = calc_map
        derived["map_mmhg"] = calc_map

    # Ensure all expected model features are present
    for feature in EXPECTED_MODEL_FEATURES:
        if feature not in validated:
            raise PhysiologicalValidationError(f"Internal validation error: missing expected feature '{feature}'.")

    return validated, derived, warnings
