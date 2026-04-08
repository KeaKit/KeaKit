from locust import HttpUser, task, between
from utils.helpers import random_email

class UserFlowUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        self.email = random_email()
        self.password = "Password123"

        self.client.post("/api/users/register", json={
            "email": self.email,
            "password": self.password,
            "name": "Test User",
            "phone": "612345678",
            "address": "Calle Falsa 123",
            "city": "Madrid",
            "country": "Spain"
        })

        response = self.client.post("/api/users/login", json={
            "email": self.email,
            "password": self.password
        })

        if response.status_code == 200:
            self.token = response.json().get("token")

    def auth_headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    @task(3)
    def login(self):
        self.client.post("/api/users/login", json={
            "email": self.email,
            "password": self.password
        })

    @task(1)
    def register_new_user(self):
        self.client.post("/api/users/register", json={
            "email": random_email(),
            "password": "Password123",
            "name": "New User",
            "phone": "698765432",
            "address": "Avenida Siempreviva 742",
            "city": "Madrid",
            "country": "Spain"
        })  