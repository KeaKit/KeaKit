import uuid

from locust import HttpUser, task, between
from utils.helpers import random_email

class UserFlowUser(HttpUser):
    wait_time = between(1, 3)
    token = None
    user_id = None
    email = None
    password = None

    def on_start(self):
        self.email = random_email()
        self.password = "Password123"

        reg_response = self.client.post("/api/users/register", json={
            "email": self.email,
            "password": self.password,
            "name": "Test User",
            "phone": "612345678",
            "address": "Calle Falsa 123",
            "city": "Madrid",
            "country": "Spain"
        })

        if reg_response.status_code == 200:
            self.user_id = reg_response.json().get("id")

        log_response = self.client.post("/api/users/login", json={
            "email": self.email,
            "password": self.password
        })

        if log_response.status_code == 200:
            self.token = log_response.json().get("token")
            if not self.user_id:
                self.user_id = log_response.json().get("id")

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

    @task(5)
    def update_profile(self):
        if self.user_id is not None and self.token is not None:
            payload = {
                "name": "Updated User",
                "phone": "+34699888777",
                "address": "Nueva Dirección de Carga 456",
                "city": "Sevilla",
                "country": "Spain"
            }
            self.client.put(
                f"/api/users/{self.user_id}",
                json=payload,
                headers=self.auth_headers(),
                name="/api/users/[id]"
            )