import { Request, Response } from "express";
import { withControllerErrorHandling } from "../../middlewares/error_handlers";
import responseHandler from "../../middlewares/response_handler";
import registerUserService from "../services/register_user_service";

export const registerUserController = withControllerErrorHandling(
  async (req: Request, res: Response) => {
    
    const { email, password, role } = req.body;

    const result = await registerUserService({ email, password, role });

    return responseHandler(result.message, result.statusCode, result.data, res);
  },
);

export default registerUserController;
