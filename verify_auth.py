import requests

def verify_login(username, password):
    url = 'http://127.0.0.1:8000/api/api-token-auth/'
    data = {'username': username, 'password': password}
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"SUCCESS: Login successful for {username}. Token: {response.json().get('token')}")
        else:
            print(f"FAILURE: Login failed for {username}. Status: {response.status_code}. Response: {response.text}")
    except Exception as e:
        print(f"ERROR: Could not connect to API. {e}")

if __name__ == '__main__':
    print("Testing admin login...")
    verify_login('admin', 'admin')
