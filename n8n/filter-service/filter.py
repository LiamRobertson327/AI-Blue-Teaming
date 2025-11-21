import json
import pandas as pd
from datetime import datetime
import io, os

from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

# ---- CONFIGURATION FOR EXPENSE DOCUMENTS ----
EXPENSE_CONFIG = 'expense_cfg.json'
template_stru = {}

try:
    with open(EXPENSE_CONFIG, 'r') as file:
        template_full = json.load(file)
        template_stru = template_full.get("expense_report_paradigm",{})
except Exception as e:
    print(f"❌ ERROR LOADING CONFIG FILE: {e}")
    pass

def validate_expense_report(df, req):
    result = {
        "is_valid": True,
        "validated_df": df
    }
    
    df_to_validate = df.copy()
        
    # Expected number of colums for an expense report
    required_cols = {col for col, data in req.items() if data.get("required")}
    
    # Number of columns in the received expense report
    received_cols = set(df_to_validate.columns)   
    
    # If columns are missing raise an eror
    missing_columns = required_cols - received_cols
    
    if missing_columns:
        result["is_valid"] = False
        return result
    
    # If extra columns are present, drop them and continue processing
    extra_columns = received_cols - set(req.keys())
    if extra_columns:
        df_to_validate = df_to_validate.drop(columns=list(extra_columns))
        print(f"Extra columns were present.  Dropping: {extra_columns}")

    for col, data in req.items():
        target_type = data['dtype']
        try:
            if 'float' in target_type:
                df_to_validate[col] = pd.to_numeric(df_to_validate[col], errors='coerce')
            elif 'datetime' in target_type:
                df_to_validate[col] = pd.to_datetime(df_to_validate[col], errors='coerce')
        except Exception as e:
            print(f"Critical Error: {e}")
    
    missing = False
    val = {}
    for col in required_cols:
        missing_values = df_to_validate[col].isnull().sum()
        if missing_values > 0:
            val[col] = int(missing_values)
            missing = True
    
    if missing:
        result["is_valid"] = False
        return result
    
    #Fill in missing Dates
    current_datetime = datetime.now()
    
    if 'DateSubmitted' in df_to_validate.columns:
        df_to_validate["DateSubmitted"] = pd.to_datetime(df_to_validate["DateSubmitted"], errors="coerce")
        df_to_validate["DateSubmitted"] = df_to_validate['DateSubmitted'].fillna(current_datetime)
    
        invalid_dates_mask =  df_to_validate['DateSubmitted'] > current_datetime
        
        if invalid_dates_mask.sum() > 0:
            print(f"Found supicious entries:\n{df_to_validate[invalid_dates_mask]}")
            print(f"Supicious entries will be dropped.")
            df_to_validate = df_to_validate[~invalid_dates_mask]
    
    result["validated_df"] = df_to_validate 
    return result



@app.route('/filter', methods=['POST'])
def filter_prompt():
    data = request.get_json()
    text = data.get("text", "")

    # Simple example: block banned words
    banned = ["ignore previous", "reveal", "secret", "token", "password", "return only"]
    if any(word in text.lower() for word in banned):
        return jsonify({"allowed": False, "reason": "Contains banned terms", "filtered_text": text}), 200

    return jsonify({"allowed": True, "filtered_text": text}), 200

@app.route('/verifyfile', methods=['POST'])
def verify_file():
    
    if not template_stru:
        # If config is missing, return a simple JSON error
        return jsonify({"allowed": False, "error": "Server configuration error: Expense template not loaded."}), 500

    if not request.is_json:
        return jsonify({"allowed": False, "error": "Server configuration error: Expense template not loaded."}), 400

    try:
        data = request.get_json()
        if isinstance(data,list) and len(data) > 0 and 'data' in data[0] and isinstance(data[0]['data'], list):
            rows = data[0]["data"]
            df = pd.DataFrame(rows)
        else:
            return jsonify({"allowed": False, "error": "Expected list of rows"})
        
        
        validated_df = validate_expense_report(df, template_stru)

        if validated_df['is_valid'] is False:
            return jsonify({"allowed": False, "error":"Required columns were missing"}), 200
        
        return jsonify({"allowed": True,"validated_data": validated_df["validated_df"].to_dict(orient="records")})


    except Exception as e:
        return jsonify({"allowed": False, "error": f"An unexpected error occurred: {e}"}), 500
    
@app.route('/health', methods=['GET'])
def health():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
