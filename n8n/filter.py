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
    expected_num_cols = set(req.keys())
    
    # Number of columns in the received expense report
    actual_num_cols = set(df.columns)   
    
    # If columns are missing raise an eror
    missing_columns = expected_num_cols - actual_num_cols
    if missing_columns:
        result["is_valid"] = False
        return result
    
    # If extra columns are present, drop them and continue processing
    extra_columns = actual_num_cols - expected_num_cols
    if extra_columns:
        df = df.drop(columns=list(extra_columns))
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
            pass
    
    required_columns = [col for col, data in req.items() if data['required']]
    
    missing = False
    val = {}
    for col in required_columns:
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
        if df_to_validate['DateSubmitted'].dtype == 'datetime64[ns]':
            df_to_validate['DateSubmitted'] = df_to_validate['DateSubmitted'].fillna(current_datetime).dt.normalize()
        else:
            df_to_validate['DateSubmitted'] = df_to_validate['DateSubmitted'].fillna(current_datetime.date())
    
    invalid_dates_mask =  df_to_validate['DateSubmitted'].dt.normalize() > current_datetime
    
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
        return jsonify({"allowed": False, "reason": "Contains banned terms"}), 200

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
        # Check if it's the wrapped format from n8n
        if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict) and "data" in data[0]:
            data = data[0]["data"]

        # After unwrapping, it must be a list of rows
        if not isinstance(data, list):
           return jsonify({"allowed": False, "error": "Server configuration error: Expense template not loaded."}), 400

        df = pd.DataFrame(data)
        validated_df = validate_expense_report(df, template_stru)
        if validated_df['is_valid'] is False:
            return jsonify({"allowed": False, "error":"Required columns were missing"}), 200
        
        return jsonify({"allowed": True,"validated_data": validated_df["validated_df"].to_dict(orient="records")})


    except Exception as e:
        return jsonify({"allowed": False, "error": f"An unexpected error occurred: {e}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
