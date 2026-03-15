# AdvanceTechnology

## Postman Workspace

Shared Postman artifacts now live under `postman/`. Use the collection in `postman/collections/api-gateway.postman_collection.json` with one of the environments in `postman/environments/local.postman_environment.json` or `postman/environments/shared.postman_environment.json`.

The intended workflow is gateway first:

1. Run the login request to populate `accessToken`.
2. Test public and protected requests through the API Gateway.
3. Use the `Service Debugging` folder only when you need to isolate a downstream service.

The usage guide and sync checklist are documented in `postman/README.md`.
