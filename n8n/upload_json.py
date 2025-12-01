import requests

def send_to_webhook(webhook_url, api_key, data):
    #payload = {"text": text}
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(webhook_url, json=data, headers=headers)
        response.raise_for_status()
        return response
    except requests.RequestException as e:
        print(f"Error sending request: {e}")
        return None

webhook_url = "http://localhost:5678/webhook-test/update-policy"
api_key = "YOUR_API_KEY_HERE"

data = {"threshold":500}

result = send_to_webhook(webhook_url, api_key, data)
print(result)