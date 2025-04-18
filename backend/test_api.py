import unittest
from main import create_app
from config import TestConfig
from exts import db

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)

        self.client = self.app.test_client(self)

        with self.app.app_context():
            #db.init_app(self.app)

            db.create_all()
            
    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            
    def test_hello_world(self):
        hello_response = self.client.get("/ASTtest/hello")

        json = hello_response.json

        #print(json)
        self.assertEqual(json, {"message": "Hello World"})
        
    def test_signup(self):
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password",
            },
        )

        status_code = signup_response.status_code

        self.assertEqual(status_code, 201)
        
    def test_login(self):
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password",
            },
        )

        login_response = self.client.post(
            "auth/login", json={"username": "testuser", "password": "password"}
        )

        status_code = login_response.status_code

        json = login_response.json

        #print(json)

        self.assertEqual(status_code, 200)    
        
    def test_get_all_test(self):
        """TEST GETTING ALL test"""
        response = self.client.get("/ASTtest/astTest")

        #print(response.json)

        status_code = response.status_code

        self.assertEqual(status_code, 200)

    def test_get_one_test(self):
        id = 1
        response = self.client.get(f"/ASTtest/astTest/{id}")

        status_code = response.status_code
        #print(status_code)

        self.assertEqual(status_code, 404)

    def test_create_test(self):
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password",
            },
        )

        login_response = self.client.post(
            "auth/login", json={"username": "testuser", "password": "password"}
        )

        access_token = login_response.json["access_token"]

        create_recipe_response = self.client.post(
            "/ASTtest/astTest",
            json={"bacteria_name": "Test Cookie"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        status_code = create_recipe_response.status_code

        #print(create_recipe_response.json)

        self.assertEqual(status_code, 201)

    def test_update_test(self):
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password",
            },
        )

        login_response = self.client.post(
            "auth/login", json={"username": "testuser", "password": "password"}
        )

        access_token = login_response.json["access_token"]

        create_recipe_response = self.client.post(
            "/ASTtest/astTest",
            json={"bacteria_name": "Test Cookie"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        status_code = create_recipe_response.status_code

        id = 1

        update_response = self.client.put(
            f"ASTtest/astTest/{id}",
            json={
                "bacteria_name": "Test Cookie Updated",
            },
            headers={"Authorization": f"Bearer {access_token}"},
        )

        #print(update_response.json)
        status_code = update_response.status_code
        self.assertEqual(status_code, 200)

    def test_delete_test(self):
        signup_response = self.client.post(
            "/auth/signup",
            json={
                "username": "testuser",
                "email": "testuser@test.com",
                "password": "password",
            },
        )

        login_response = self.client.post(
            "auth/login", json={"username": "testuser", "password": "password"}
        )

        access_token = login_response.json["access_token"]

        create_test_response = self.client.post(
            "/ASTtest/astTest",
            json={"bacteria_name": "Test Cookie"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

        id = 1
        delete_response = self.client.delete(
            f"/ASTtest/astTest/{id}", headers={"Authorization": f"Bearer {access_token}"}
        )

        status_code = delete_response.status_code

        print(delete_response.json)

        self.assertEqual(status_code, 200)
            
if __name__ == "__main__":
    unittest.main()