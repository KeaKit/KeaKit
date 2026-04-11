from locust import HttpUser, task, between
from utils.helpers import random_email

class KitFlowUser(HttpUser):
    wait_time = between(1, 2)
    token = None
    user_id = None

    def on_start(self):
        """Registro y Login para tener acceso a los endpoints"""
        self.email = random_email()
        self.password = "Password123"

        self.client.post("/api/users/register", json={
            "email": self.email, "password": self.password,
            "name": "Locust User", "phone": "600000000",
            "address": "Calle Test", "city": "Sevilla", "country": "Spain"
        })

        response = self.client.post("/api/users/login", json={
            "email": self.email, "password": self.password
        })

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.user_id = data.get("id")

    @task
    def test_confirm_flow(self):
        if not self.token or not self.user_id:
            return

        headers = {"Authorization": f"Bearer {self.token}"}
        
        kit_data = {
            "name": "Kit Load Test",
            "country": "Spain",
            "city": "Sevilla",
            "startDate": "2026-05-01",
            "endDate": "2026-05-10",
            "deliveryMethod": "COURIER",
            "tenantId": int(self.user_id),
            "itemSelections": []
        }

        with self.client.post(
            "/api/kits/create", 
            json=kit_data, 
            headers=headers, 
            catch_response=True, 
            name="/api/kits/create") as res:
            if res.status_code == 201:
                kit_id = res.json().get("id")

                self.client.patch(
                    f"/api/kits/{kit_id}/pay", 
                    headers=headers, 
                    name="/api/kits/[id]/pay")

                with self.client.patch(
                    f"/api/kits/confirm/{kit_id}", 
                    headers=headers, 
                    name="/api/kits/confirm/[id]",
                    catch_response=True
                ) as conf_res:
                    if conf_res.status_code == 200:
                        conf_res.success()
                    else:
                        conf_res.failure(f"Falló confirmación: {conf_res.status_code} - {conf_res.text}")
            else:
                res.failure(f"Fallo al crear kit (400): {res.text}")