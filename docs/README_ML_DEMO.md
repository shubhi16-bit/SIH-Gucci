# SIH26121 (eRTMAC-NWIS) - RISK/PREDICTION MODEL Demo

## Setup
To run the demo, make sure you have the required dependencies installed:
```bash
pip install pandas numpy scikit-learn xgboost pyarrow fastparquet
```

## Running the End-to-End Pipeline
Run the following script to load the Volve `demo_stream.csv` and `events.csv`, extract features, train the XGBoost risk model, evaluate it, and run a test inference on the live stream.

```bash
python run_demo.py
```

## Example Final Output

```json
{
    "risk_score": 75.40,
    "risk_level": "HIGH",
    "likelihood": 0.81,
    "explanations": [
        "Torque increased (val: 1.25)",
        "Proximity to historical event depth is concerning",
        "Formation matches high-risk offset wells"
    ]
}
```

