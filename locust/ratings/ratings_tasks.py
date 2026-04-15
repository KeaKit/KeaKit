import random
import string
import uuid

from locust import HttpUser, task, between
from utils.helpers import random_email


BASE_PASSWORD = "Password123"

created_rating_ids: list[int] = []

def _register_and_login(client, email: str) -> dict:
    client.post(
        "/api/users/register",
        json={
            "email": email,
            "password": BASE_PASSWORD,
            "name": "Rating Tester",
            "phone": "600000000",
            "address": "Calle Test 1",
            "city": "Sevilla",
            "country": "Spain",
        },
        name="/api/users/register [setup]",
    )
    resp = client.post(
        "/api/users/login",
        json={"email": email, "password": BASE_PASSWORD},
        name="/api/users/login [setup]",
    )
    if resp.status_code == 200:
        data = resp.json()
        return {"token": data.get("token"), "id": data.get("id")}
    return {}


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_finished_kit(client, tenant_token: str, tenant_id: int) -> dict | None:
    headers = _auth(tenant_token)

    kit_payload = {
        "name": f"Kit Rating Test {uuid.uuid4().hex[:6]}",
        "country": "Spain",
        "city": "Sevilla",
        "startDate": "2025-01-01",
        "endDate": "2025-01-31",
        "deliveryMethod": "COURIER",
        "tenantId": int(tenant_id),
        "itemSelections": [],
    }
    with client.post(
        "/api/kits/create",
        json=kit_payload,
        headers=headers,
        catch_response=True,
        name="/api/kits/create [setup]",
    ) as res:
        if res.status_code != 201:
            res.failure(f"Kit creation failed: {res.status_code} {res.text}")
            return None
        kit_id = res.json().get("id")

    with client.patch(
        f"/api/kits/{kit_id}/pay",
        headers=headers,
        catch_response=True,
        name="/api/kits/[id]/pay [setup]",
    ) as res:
        if res.status_code not in (200, 201):
            res.failure(f"Pay failed: {res.status_code} {res.text}")
            return None

    with client.patch(
        f"/api/kits/confirm/{kit_id}",
        headers=headers,
        catch_response=True,
        name="/api/kits/confirm/[id] [setup]",
    ) as res:
        if res.status_code != 200:
            res.failure(f"Confirm failed: {res.status_code} {res.text}")
            return None

    with client.put(
        f"/api/kits/{kit_id}",
        json={"status": "FINISHED"},
        headers=headers,
        catch_response=True,
        name="/api/kits/[id] FINISHED [setup]",
    ) as res:
        if res.status_code != 200:
            res.failure(f"Finish failed: {res.status_code} {res.text}")
            return None

    return {"kit_id": kit_id}

class RatingFlowUser(HttpUser):

    wait_time = between(1, 3)

    tenant_token: str | None = None
    tenant_id: int | None = None
    owner_token: str | None = None
    owner_id: int | None = None
    kit_id: int | None = None

    my_rating_ids: list[int]

    def on_start(self):
        self.my_rating_ids = []

        tenant_data = _register_and_login(self.client, random_email())
        self.tenant_token = tenant_data.get("token")
        self.tenant_id = tenant_data.get("id")

        owner_data = _register_and_login(self.client, random_email())
        self.owner_token = owner_data.get("token")
        self.owner_id = owner_data.get("id")

        if not self.tenant_token or not self.owner_id:
            return

        result = _create_finished_kit(self.client, self.tenant_token, self.tenant_id)
        if result:
            self.kit_id = result["kit_id"]

    @task(5)
    def create_rating(self):
        if not self.tenant_token or not self.owner_id:
            return

        result = _create_finished_kit(self.client, self.tenant_token, self.tenant_id)
        if not result:
            return
        kit_id = result["kit_id"]

        payload = {
            "revieweeId": int(self.owner_id),
            "kitId": int(kit_id),
            "score": random.randint(1, 5),
            "comment": f"Load test comment {uuid.uuid4().hex[:8]}",
        }

        with self.client.post(
            "/api/ratings",
            json=payload,
            headers=_auth(self.tenant_token),
            catch_response=True,
            name="/api/ratings POST",
        ) as res:
            if res.status_code == 201:
                rating_id = res.json().get("id")
                if rating_id:
                    self.my_rating_ids.append(rating_id)
                    created_rating_ids.append(rating_id)
                res.success()
            elif res.status_code == 409:
                res.success()
            else:
                res.failure(f"Create rating failed: {res.status_code} {res.text}")

    @task(8)
    def get_ratings_for_user(self):
        if not self.owner_id or not self.tenant_token:
            return
        self.client.get(
            f"/api/ratings/user/{self.owner_id}",
            headers=_auth(self.tenant_token),
            name="/api/ratings/user/[id]",
        )

    @task(4)
    def get_ratings_by_user(self):
        if not self.tenant_id or not self.tenant_token:
            return
        self.client.get(
            f"/api/ratings/given/{self.tenant_id}",
            headers=_auth(self.tenant_token),
            name="/api/ratings/given/[id]",
        )

    @task(3)
    def get_single_rating(self):
        if not self.tenant_token:
            return
        pool = self.my_rating_ids or created_rating_ids
        if not pool:
            return
        rating_id = random.choice(pool)
        self.client.get(
            f"/api/ratings/{rating_id}",
            headers=_auth(self.tenant_token),
            name="/api/ratings/[id]",
        )

    @task(4)
    def has_reviewed_check(self):
        if not self.owner_id or not self.kit_id or not self.tenant_id or not self.owner_token:
            return
        self.client.get(
            "/api/ratings/has-reviewed-kit",
            params={
                "reviewerId": self.owner_id,
                "itemId": 1,
                "kitIds": self.kit_id,
            },
            headers=_auth(self.owner_token),
            name="/api/ratings/has-reviewed-kit",
        )

    @task(1)
    def delete_rating(self):
        if not self.my_rating_ids or not self.tenant_token:
            return
        rating_id = self.my_rating_ids.pop()
        if rating_id in created_rating_ids:
            created_rating_ids.remove(rating_id)

        with self.client.delete(
            f"/api/ratings/{rating_id}",
            headers=_auth(self.tenant_token),
            catch_response=True,
            name="/api/ratings/[id] DELETE",
        ) as res:
            if res.status_code in (200, 204, 404):
                res.success()
            else:
                res.failure(f"Delete failed: {res.status_code} {res.text}")