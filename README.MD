# OAuth provider example

This is an example of an OAuth implementation using Node.js, Express and MongoDB. It leverages the [express-oauth-server](https://github.com/oauthjs/express-oauth-server) module.

## Running

The project uses docker-compose in order to run MongoDB and seed the database. To run it, execute the following command:

`docker-compose up`

The MongoDB database will be seeded with the following entry in the `users` collection:

```
{ "id" : 123,
  "username" : "testuser", 
  "password" : "pass123" }
```

And the following entry in the `clients` collection:

```
{ "id" : "my-client", 
  "redirectUris" : [ "http://localhost:8000/sampleredirect" ], 
  "grants" : [ "authorization_code" ] }
```

## Using

Once running, start a browser and navigate to http://localhost:8000. You will be prompted for username and password. After providing the values from the seed user (testuser/pass123), you will be redirected to the authorization screen. By clicking allow you will then be redirected to the client's redirectUri (http://localhost:8000/sampleredirect), along with the authorization code as a query parameter.

Now you can trade the authorization code for a token by POSTing grant_type, code, redirect_uri, client_id and client_secret to the http://localhost:8000/o/token endpoint. You can do it with [httpie](https://httpie.org/) with the following command:

```
http -f POST http://localhost:8000/o/token \ 
  grant_type='authorization_code' \ 
  code='<authorization_code>' \
  client_id='my-client' \
  client_secret='my-client-secret' \
  redirect_uri='http://localhost:8000/sampleredirect'
```

Note that the client configuration will be checked against the entry in the `clients` collection. 

Congratulations, you just finished the OAuth flow and got an access token! Let's try using it now. The example contains a `/accounts/profile` endpoint that, given a access token, will reply with user's data pertaining that token. You can call the endpoint with `httpie` with the following command:

```
http http://localhost:8000/accounts/profile Authorization:"Bearer <acess_token>"
```
