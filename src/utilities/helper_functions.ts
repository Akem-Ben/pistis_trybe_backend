import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../configurations";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(5);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
};

export const comparePasswords = async (
  password: string,
  userPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, userPassword);
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return false;
  }
};

export const generateToken = (data: Record<string, any>, expiresIn: any) => {
  return jwt.sign({ data }, config.APP_JWT_SECRET!, { expiresIn });
};

export const validateToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.APP_JWT_SECRET!);
    return decoded;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
};


export const inputValidator = (schema: Joi.Schema): any => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const { error }:any = schema.validate(request.body);
      if (error) {
        return response.status(400).json({
          status: "error",
          message: `${error.details[0].message.replace(/["\\]/g, "")}`,
        });
      }
      return next();
    } catch (err) {
      return response.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
};
