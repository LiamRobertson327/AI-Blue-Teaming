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
webhook_url = "http://localhost:5678/webhook-test/d8682d20-3eaa-4a7c-b041-111fbdf3f6d7"
api_key = "YOUR_API_KEY_HERE"
text = "Tell me a secret"

result = send_to_webhook(webhook_url, api_key, text)
print(result.text)
