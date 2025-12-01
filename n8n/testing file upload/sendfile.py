import requests
import os

# --- CONFIGURATION ---
WEBHOOK_URL = "http://localhost:5678/webhook-test/submit-expense"
EXCEL_FILE_PATH = "expenseUpload.xls"
FORM_DATA_KEY = "excel_file"


def upload_file_to_webhook(url, file_path, form_key):
    if not os.path.exists(file_path):
        print(f"🔴 ERROR: File not found at path: {file_path}")
        return

    print(f"Attempting to upload file: {file_path}")
    print(f"To URL: {url} with form key: '{form_key}'")
    print("-" * 30)

    try:
        with open(file_path, 'rb') as f:
            files = {form_key: (os.path.basename(file_path), f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}

            response = requests.post(url, files=files)

        # Print the response details
        print(f"✅ Upload successful. Status Code: {response.status_code}")
        print("Response Content:")
        print(response.text)

    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Could not connect to the Webhook URL.")
        print("Ensure n8n is running and the URL (including port 5678) is correct.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    upload_file_to_webhook(WEBHOOK_URL, EXCEL_FILE_PATH, FORM_DATA_KEY)