To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## Testing the GET route

This command will send a GET request for a project with the id of 1 using the username and password for Alice

```shell
curl 'http://localhost:3000/project/1' \
-H 'Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM='
```

## Testing the POST route

This command will send a POST request for a project with the id of 1 using the username and password for Alice

```shell
curl -X POST 'http://localhost:3000/project/1' \
-H 'Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM=' \
-H 'Content-Type: application/json'
```
