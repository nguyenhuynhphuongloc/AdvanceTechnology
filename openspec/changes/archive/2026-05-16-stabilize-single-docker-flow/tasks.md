## 1. Inspect current Docker runtime

- [x] 1.1 Review `docker-compose.yml`, root `.env`, and `scripts/dev-stack.cmd`
- [x] 1.2 Identify the broadest currently working service set for QA
- [x] 1.3 Verify service URL env values align with Compose service names

## 2. Consolidate Docker startup

- [x] 2.1 Make the default Compose startup run the stable QA-ready stack
- [x] 2.2 Remove or de-emphasize profile requirements from the primary workflow
- [x] 2.3 Keep direct service ports only where useful for local debugging

## 3. Update documentation

- [x] 3.1 Update `README.md` with one canonical Docker command
- [x] 3.2 Update `ROUTES.md` if runtime notes or service availability changed
- [x] 3.3 Document required env/test credential gaps for Stripe, Cloudinary, n8n, and admin auth

## 4. Validate runtime

- [x] 4.1 Start the stack with the canonical command
- [x] 4.2 Verify frontend `/`, `/products`, and `/admin/login` load
- [x] 4.3 Verify gateway can reach auth, product, cart, order, inventory, payment, and notification route groups
- [x] 4.4 Record any services that still require env/data fixes before QA execution
