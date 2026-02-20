import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../configurations";
import { generateToken } from "../utilities/helper_functions";
import { app_constants } from "../configurations/constants";
import { User } from "../users/users.models";

interface IExcludedEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
}

const EXCLUDED_ENDPOINTS: IExcludedEndpoint[] = [
  { method: "POST", path: "/v1/auth/login" },
  { method: "POST", path: "/v1/auth/register" },
  { method: "POST", path: "/v1/auth/refresh-token" },
];

const REGISTERED_PATHS: string[] = ["/v1/users/me"];

export const generalAuthFunction = async (
  request: JwtPayload,
  response: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const currentPath = request.baseUrl + request.path;
    const currentMethod = request.method as IExcludedEndpoint["method"];

    const shouldSkipAuth = EXCLUDED_ENDPOINTS.some(
      (endpoint) =>
        endpoint.method === currentMethod && endpoint.path === currentPath,
    );

    if (shouldSkipAuth) return next();

    // If path is not registered at all, skip auth and let the router return 404
    const isKnownPath = REGISTERED_PATHS.some((path) =>
      currentPath.startsWith(path),
    );

    if (!isKnownPath) return next();

    // --- rest of auth logic unchanged below ---

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return response.status(403).json({
        status: "Failed",
        message: "Please login again",
      });
    }

    const authorizationToken = authorizationHeader.split(" ")[1];

    if (!authorizationToken) {
      return response.status(403).json({
        status: "Failed",
        message: "Login required",
      });
    }

    let verifiedUser: any;

    try {
      verifiedUser = jwt.verify(authorizationToken, `${config.APP_JWT_SECRET}`);

      const decodedToken: any = jwt.decode(authorizationToken);

      const userDetails = await User.findById(decodedToken?.userId).select(
        "refreshToken isVerified isActive isBlocked role id",
      );

      if (!userDetails) {
        return response.status(403).json({
          status: "error",
          message: "User not found, please login again or contact admin",
        });
      }

      if (userDetails?.isBlocked) {
        return response.status(403).json({
          status: "error",
          message: "Account blocked, please contact admin",
        });
      }

      if (!userDetails.refreshToken) {
        return response.status(403).json({
          status: "error",
          message: "Please login again.",
        });
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        const decodedToken: any = jwt.decode(authorizationToken);

        if (!decodedToken?.userId) {
          return response.status(403).json({
            status: "error",
            message: "Invalid token",
          });
        }

        const userDetails = await User.findById(decodedToken?.userId).select(
          "refreshToken isVerified isActive isBlocked role id",
        );

        if (!userDetails) {
          return response.status(403).json({
            status: "error",
            message: "User not found, please login again or contact admin",
          });
        }

        if (userDetails?.isBlocked) {
          return response.status(403).json({
            status: "error",
            message: "Account blocked, please contact admin",
          });
        }

        const refreshToken: any = userDetails.refreshToken;

        let refreshVerifiedUser: any;
        try {
          refreshVerifiedUser = jwt.verify(
            refreshToken,
            `${config.APP_JWT_SECRET}`,
          );
        } catch {
          return response.status(403).json({
            status: "error",
            message: "Refresh Token Expired. Please login again.",
          });
        }

        const tokenPayload = {
          id: refreshVerifiedUser._id,
          email: refreshVerifiedUser.email,
          role: refreshVerifiedUser.role,
        };

        const newAccessToken = generateToken(
          tokenPayload,
          app_constants.ACCESS_TOKEN_EXPIRY,
        );
        const newRefreshToken = generateToken(
          tokenPayload,
          app_constants.REFRESH_TOKEN_EXPIRY,
        );

        response.setHeader("x-access-token", newAccessToken);

        await User.findByIdAndUpdate(refreshVerifiedUser.id, {
          refreshToken: newRefreshToken,
        });

        request.user = refreshVerifiedUser;
        return next();
      }

      return response.status(403).json({
        status: "error",
        message: `Login Again, Invalid Token: ${error.message}`,
      });
    }

    request.user = verifiedUser;
    return next();
  } catch (error: any) {
    return response.status(500).json({
      status: "error",
      message: `Internal Server Error: ${error.message}`,
    });
  }
};
