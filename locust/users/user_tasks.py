import random

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
        
    @task(3)
    def get_article_record(self):
        if self.token is not None:
            article_id = random.randint(1, 100) 
            
            with self.client.get(
                f"/api/article/record/{article_id}",
                headers=self.auth_headers(),
                name="/api/article/record/[id]",
                catch_response=True
            ) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code == 404:
                    response.success()
                elif response.status_code == 401:
                    response.success()
                else:
                    response.failure(f"Fallo inesperado. Código HTTP: {response.status_code}")
                    
    @task(1)
    def create_rental_kit(self):
        if self.token is not None:
            self.client.post(
                "/api/kits",
                json={"articleId": random.randint(1, 100), "status": "ACTIVE"},
                headers=self.auth_headers(),
                name="/api/kits (Create Rental)"
            )