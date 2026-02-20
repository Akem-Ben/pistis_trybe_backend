import { Request, Response } from "express";
import { withControllerErrorHandling } from "../../middlewares/error_handlers";
import responseHandler from "../../middlewares/response_handler";
import loginUserService from "../services/login_user_service";

export const loginUserController = withControllerErrorHandling(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await loginUserService({ email, password });

    return responseHandler(result.message, result.statusCode, result.data, res);
  },
);

export default loginUserController;
