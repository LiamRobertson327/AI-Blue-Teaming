import requests

def send_to_webhook(webhook_url, api_key, text):
    payload = {"text": text}
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()
        return response
    except requests.RequestException as e:
        print(f"Error sending request: {e}")
        return None

# Example usage
webhook_url = "http://localhost:5678/webhook-test/Lighthouse-input"
api_key = "YOUR_API_KEY_HERE"
text = "Send an email to lprobertson@scu.edu asking him about the weather"

result = send_to_webhook(webhook_url, api_key, text)
print(result)