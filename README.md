# AI Driven Authorization Demo

This demo showcases an AI-driven authorization system using Hono, Oso Cloud, and risk assessment.

## Setup

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

## Environment Variables

Make sure to set the following environment variables:

- `OSO_URL`: The URL for your Oso Cloud instance
- `OSO_AUTH`: The AUTH key for Oso Cloud

## Authentication

The demo uses Basic Authentication. There are two predefined users:

1. Alice

   - Username: alice
   - Password: password123

2. Bob
   - Username: bob
   - Password: password456

## Supported Routes

| Method | Route               | Description                                                                 | Action |
| ------ | ------------------- | --------------------------------------------------------------------------- | ------ |
| GET    | /project/:projectId | Retrieves information about a specific project identified by the projectId. | read   |
| POST   | /project/:projectId | Creates a new project with the provided projectId.                          | manage |

Both routes use the authorization middleware to check access before processing the request.

## Oso Authorization Policy

This demo uses Oso Cloud for authorization. The authorization policy is written in Polar, Oso's declarative policy language. Below is the Polar code for the authorization policy:

```Polar
actor User {}

resource Project {
  permissions = ["read", "manage"];
  roles = ["member", "admin"];

  # admins can do everything members can do
  "member" if "admin";

  # member permissions
  "read" if "member";
}

has_permission(user: User, "manage", project: Project) if
  has_role(user, "admin", project) and
  has_risk_score(user, score) and score < 50;

test "default" {
  setup {
    has_role(User{"alice"}, "admin", Project{"project1"});
    has_risk_score(User{"alice"}, 40);

    has_role(User{"bob"}, "admin", Project{"project1"});
    has_risk_score(User{"bob"}, 60);
  }

  assert allow(User{"alice"}, "read", Project{"project1"});
  assert allow(User{"alice"}, "manage", Project{"project1"});
  assert_not allow(User{"bob"}, "manage", Project{"project1"});
}
```

This policy defines the rules for who can access which resources and under what conditions. It takes into account the user's role, the action they're trying to perform, and the risk score associated with the request.

You will want to add facts in Oso that assign Alice and Bob to the appropriate roles.

## Testing the Routes

When testing the routes, you can use either of the predefined users' credentials.

### Testing the GET route

This command will send a GET request for a project with the id of 1 using Alice's credentials:

```shell
curl 'http://localhost:3000/project/1' \
-H 'Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM='
```

### Testing the POST route

This command will send a POST request for a project with the id of 1 using Alice's credentials:

```shell
curl -X POST 'http://localhost:3000/project/1' \
-H 'Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM=' \
-H 'Content-Type: application/json'
```

To test with Bob's credentials, replace the Authorization header with:

```shell
-H 'Authorization: Basic Ym9iOnBhc3N3b3JkNDU2'
```

## Authorization Logic

The demo uses a middleware that:

1. Calculates a risk score for each request
2. Extracts the user identity from the Authorization header
3. Determines the action based on the HTTP method (GET/HEAD -> read, others -> manage)
4. Checks authorization using Oso Cloud, considering the user, action, resource, and risk score

If authorization fails, a 403 Forbidden error is returned.
