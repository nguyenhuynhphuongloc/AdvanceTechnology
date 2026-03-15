# Postman Workspace

This directory stores the shared Postman artifacts for the microservice system.

## Structure

- `collections/api-gateway.postman_collection.json`: Primary gateway-first collection for manual testing.
- `environments/local.postman_environment.json`: Local development variables.
- `environments/shared.postman_environment.json`: Shared or staging variables template.
- `VALIDATION.md`: Notes from the current validation pass and known gaps.

## Import Steps

1. Open Postman and choose `Import`.
2. Import the collection from `postman/collections/`.
3. Import one or both environments from `postman/environments/`.
4. Select the active environment before sending requests.

## Collection Layout

- `Gateway Routes`: Requests grouped by the API Gateway route prefixes.
- `Service Debugging`: Direct requests for individual microservices when the gateway path is not the problem.

## Environment Variables

- `gatewayBaseUrl`: API Gateway base URL.
- `authServiceBaseUrl`
- `userServiceBaseUrl`
- `productServiceBaseUrl`
- `orderServiceBaseUrl`
- `cartServiceBaseUrl`
- `inventoryServiceBaseUrl`
- `paymentServiceBaseUrl`
- `notificationServiceBaseUrl`
- `accessToken`
- `userEmail`
- `userPassword`
- `userId`
- `userRole`
- `productLimit`
- `inventorySku`

## Workflow

1. Start the gateway and any target services you need to inspect.
2. Select the `local` or `shared` environment.
3. Run `Gateway Routes/Auth/Login` to populate `accessToken`.
4. Exercise gateway requests first to verify auth, proxying, and gateway-level errors.
5. Move to `Service Debugging` only when you need to inspect a downstream service directly.
6. Update the collection and environments in the same change whenever routes, payloads, or auth assumptions change.

## Sync Checklist

- Confirm the gateway route prefix still matches the collection folder.
- Update request paths when controllers or proxy mappings change.
- Update request bodies when DTOs change.
- Re-run the login request and verify the token capture script still stores `accessToken`.
- Validate at least one gateway request and one service-debugging request before merging.
