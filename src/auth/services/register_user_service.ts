import {
  createError,
  withServiceErrorHandling,
} from "../../middlewares/error_handlers";
import responseHandler from "../../middlewares/response_handler";
import { User } from "../../users/users.models";
import { hashPassword } from "../../utilities/helper_functions";
import { StatusCodes } from "../../utilities/status_codes";
import { AuthResponses } from "../responses";

interface IRegisterAttributes {
  email: string;
  password: string;
  role?: "super_admin" | "admin" | "user";
}

const registerUserService = withServiceErrorHandling(
  async (registerPayload: IRegisterAttributes) => {
    const { email, password, role } = registerPayload;
    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail }, [
      "_id",
      "email",
    ]);

    if (userExists) {
      throw createError(
        AuthResponses.EMAIL_EXISTS_LOGIN,
        StatusCodes.BadRequest,
      );
    }

    const newPassword = await hashPassword(password.trim());

    const createUserPayload = {
      email: normalizedEmail,
      password: newPassword,
      isVerified: role === "super_admin" || role === "admin",
      isActive: true,
      isBlocked: false,
      role: role ?? "user",
      singupMethod: "direct",
    };

    const newUser = await User.create(createUserPayload);

    if (!newUser) {
      throw createError(
        AuthResponses.PROCESS_UNSSUCCESSFUL,
        StatusCodes.InternalServerError,
      );
    }

    return responseHandler(
        role === "super_admin" || role === "admin"
          ? AuthResponses.ADMIN_REGISTRATION_SUCCESSFUL
          : AuthResponses.USER_REGSTRATION_SUCCESSFUL,
      StatusCodes.Created,
      createUserPayload.email,
    );
  },
);

export default registerUserService;
