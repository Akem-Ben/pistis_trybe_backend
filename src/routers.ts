import { Router } from "express";
import authV1Router from "./auth/auth.routes";

const pistisTribeRouterV1 = Router();
const pistisTribeRouterV2 = Router();


pistisTribeRouterV1.use(authV1Router);



export { pistisTribeRouterV1, pistisTribeRouterV2 };