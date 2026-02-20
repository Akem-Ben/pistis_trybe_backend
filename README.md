# Pistis Trybe Backend API

A modular Express.js + TypeScript REST API with MongoDB, JWT authentication, WebSocket support, and Swagger docs.

---

## Prerequisites

- Node.js v16+
- MongoDB v4.4+
- npm or yarn

---

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-org/pistis_trybe_backend.git
cd pistis_trybe_backend
npm install

# 2. Set up environment
cp .env.example .env
```

Configure your `.env`:

```env
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pistis_trybe
APP_JWT_SECRET=your-super-secret-jwt-key
```

```bash
# 3. Run in development (two terminals)
npm run build-watch   # Terminal 1: TypeScript watch
npm run dev           # Terminal 2: Nodemon

# Or build and run for production
npm run build && npm start
```

---

## API Docs

Once running, visit:

- **Health check:** `http://localhost:8080/` (PORT MAY DIFFER BASED ON YOUR SETUP)
- **Swagger UI:** `http://localhost:8080/v1/swagger/docs` (PORT MAY DIFFER BASED ON YOUR SETUP)

---

## Project Structure

```
src/
├── auth/                  # Auth module (register, login)
│   ├── controllers/
│   ├── services/
│   ├── auth.routes.ts
│   └── auth_joi_schema.ts
├── configurations/        # DB, socket, swagger, constants
├── middlewares/           # Auth, error handling, response shaping
├── users/                 # User model
├── utilities/             # JWT helpers, password hashing, input validation
├── app.ts                 # Express app factory
├── routers.ts             # Route registration
└── server.ts              # Entry point
```

---

## Authentication Flow

The API uses JWT access tokens (2h expiry) with automatic refresh token rotation. Use the auth routes below as the reference pattern for your own modules.

### Register

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!",
  "role": "user"           // optional: super_admin | admin | user
}
```

### Login

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Response includes a `token` (access token) and the user object.

### Access Protected Routes

```http
GET /v1/users/me
Authorization: Bearer <token>
```

### Token Refresh (Automatic)

When an access token expires, the middleware automatically:
1. Validates the refresh token stored in the database
2. Issues a new access token via the `x-access-token` response header
3. Rotates the refresh token
4. Continues processing the original request

Your client should read `x-access-token` from responses and update stored tokens accordingly.

---

## Adding a New Module

The app is intentionally modular — each feature lives in its own folder following the same pattern.

### 1. Create the folder structure

```bash
mkdir -p src/your-module/controllers src/your-module/services
```

### 2. Create the files

**`src/your-module/your-module.routes.ts`**
```typescript
import { Router } from "express";
import yourController from "./controllers/your_controller";
import { inputValidator } from "../utilities/helper_functions";
import { yourSchema } from "./your_joi_schema";

const yourModuleRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: YOUR_MODULE
 *     description: Your module description
 *
 * /v1/your-module/endpoint:
 *   get:
 *     tags: [YOUR_MODULE]
 *     summary: Get something
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
yourModuleRouter.get("/endpoint", yourController);
yourModuleRouter.post("/create", inputValidator(yourSchema), yourController);

export default yourModuleRouter;
```

**`src/your-module/controllers/your_controller.ts`**
```typescript
import { Request, Response } from "express";
import { withControllerErrorHandling } from "../../middlewares/error_handlers";
import responseHandler from "../../middlewares/response_handler";
import yourService from "../services/your_service";

export const yourController = withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const result = await yourService(req.body);
    return responseHandler(result.message, result.statusCode, result.data, res);
  }
);

export default yourController;
```

**`src/your-module/services/your_service.ts`**
```typescript
import { withServiceErrorHandling } from "../../middlewares/error_handlers";
import responseHandler from "../../middlewares/response_handler";
import { StatusCodes } from "../../utilities/status_codes";

const yourService = withServiceErrorHandling(async (payload: any) => {
  // Business logic here
  return responseHandler("Operation successful", StatusCodes.OK, { result: "data" });
});

export default yourService;
```

**`src/your-module/your_joi_schema.ts`**
```typescript
import Joi from "joi";

export const yourSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
});
```

### 3. Register the module in `src/routers.ts`

```typescript
import { Router } from "express";
import authV1Router from "./auth/auth.routes";
import yourModuleRouter from "./your-module/your-module.routes"; // Add this

const pistisTribeRouterV1 = Router();

pistisTribeRouterV1.use(authV1Router);
pistisTribeRouterV1.use("/your-module", yourModuleRouter); // Add this

export { pistisTribeRouterV1 };
```

---

## Managing Auth on Routes

Authentication is handled in `src/middlewares/authorization.ts`.

### Exclude a route from auth (make it public)

Add it to `EXCLUDED_ENDPOINTS`:

```typescript
const EXCLUDED_ENDPOINTS: IExcludedEndpoint[] = [
  { method: "POST", path: "/v1/auth/login" },
  { method: "POST", path: "/v1/auth/register" },
  { method: "GET",  path: "/v1/public/your-route" }, // ← add here
];
```

### Protect a route (require auth)

Add its path prefix to `REGISTERED_PATHS`:

```typescript
const REGISTERED_PATHS: string[] = [
  "/v1/users/me",
  "/v1/your-module", // ← add here
];
```

> Any path not in `REGISTERED_PATHS` and not in `EXCLUDED_ENDPOINTS` is passed through without auth and will return a 404 from the router — it won't throw an auth error.

---

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run build-watch` | Compile in watch mode |
| `npm run dev` | Dev server with nodemon |
| `npm start` | Production server |
| `npm test` | Run tests |
| `npm run test:watch` | Tests in watch mode |

---

## Troubleshooting

**Swagger not loading** — ensure the server is running and visit `/v1/swagger/docs`. Check the `swagger.ts` base URL config.

**Auth errors** — confirm `APP_JWT_SECRET` is set in `.env`, tokens are sent as `Bearer <token>`, and the route is listed in `REGISTERED_PATHS`.

**DB connection failed** — verify MongoDB is running (`mongod`) and `MONGODB_URI` in `.env` is correct.