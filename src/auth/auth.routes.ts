import { Router } from "express";
import registerUserController from "./controllers/register_user_controller";
import { inputValidator } from "../utilities/helper_functions";
import { loginUserSchema, userRegisterSchemaViaEmail } from "./auth_joi_schema";
import loginUserController from "./controllers/login_user_controller";

const authV1Router = Router();

/**
 * @openapi
 * tags:
 *   - name: AUTH
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         fullName:
 *           type: string
 *           description: User's full name
 *         biography:
 *           type: string
 *           description: User biography
 *         role:
 *           type: string
 *           enum: [super_admin, admin, user]
 *           description: User role
 *         singupMethod:
 *           type: string
 *           enum: [direct]
 *           description: Signup method
 *         isActive:
 *           type: boolean
 *           description: Account active status
 *         isVerified:
 *           type: boolean
 *           description: Email verification status
 *         isBlocked:
 *           type: boolean
 *           description: Account blocked status
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Password (min 8 chars with uppercase, lowercase, number, and special character)
 *           example: Password123!
 *         role:
 *           type: string
 *           enum: [super_admin, admin, user]
 *           description: User role (optional, defaults to 'user')
 *           example: user
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *           example: Password123!
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         statusCode:
 *           type: number
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT access token (expires in 2 hours)
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Registration successful
 *         statusCode:
 *           type: number
 *           example: 201
 *         data:
 *           type: string
 *           description: User email
 *           example: user@example.com
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 */

/**
 * @openapi
 * /v1/auth/register:
 *   post:
 *     tags: [AUTH]
 *     summary: Register a new user
 *     description: Creates a new user account. Super admin and admin roles are automatically verified upon registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             user-registration:
 *               summary: Regular user registration
 *               value:
 *                 email: john.doe@example.com
 *                 password: Password123!
 *                 role: user
 *             admin-registration:
 *               summary: Admin registration
 *               value:
 *                 email: admin@example.com
 *                 password: AdminPass123!
 *                 role: admin
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             examples:
 *               user-success:
 *                 summary: Regular user registration
 *                 value:
 *                   message: "Registration successful"
 *                   statusCode: 201
 *                   data: "john.doe@example.com"
 *               admin-success:
 *                 summary: Admin registration
 *                 value:
 *                   message: "Admin registration successful"
 *                   statusCode: 201
 *                   data: "admin@example.com"
 *       400:
 *         description: Bad request - Email already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email-exists:
 *                 value:
 *                   message: "Email already exists. Please login."
 *                   statusCode: 400
 *               validation-error:
 *                 value:
 *                   message: "Password must be at least 8 characters long containing at least a lowercase, upper case, a number and a special character"
 *                   statusCode: 400
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Process unsuccessful"
 *               statusCode: 500
 */

authV1Router.post(
  "/auth/register",
  inputValidator(userRegisterSchemaViaEmail),
  registerUserController,
);

/**
 * @openapi
 * /v1/auth/login:
 *   post:
 *     tags: [AUTH]
 *     summary: Login user
 *     description: Authenticates a user and returns access token with user details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: john.doe@example.com
 *             password: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               message: "Login successful"
 *               statusCode: 200
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   email: "john.doe@example.com"
 *                   fullName: null
 *                   biography: null
 *                   role: "user"
 *                   singupMethod: "direct"
 *                   isActive: true
 *                   isVerified: false
 *                   isBlocked: false
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid credentials"
 *               statusCode: 401
 *       403:
 *         description: Forbidden - Account blocked or wrong signup method
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               blocked:
 *                 value:
 *                   message: "Account is blocked. Please contact support."
 *                   statusCode: 403
 *               wrong-method:
 *                 value:
 *                   message: "This email uses a different signup method"
 *                   statusCode: 403
 *       404:
 *         description: Not found - User doesn't exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User not found"
 *               statusCode: 404
 */

authV1Router.post(
  "/auth/login",
  inputValidator(loginUserSchema),
  loginUserController,
);

export default authV1Router;
