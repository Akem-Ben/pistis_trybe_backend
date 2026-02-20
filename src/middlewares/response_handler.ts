import { Response } from "express";

export interface ResponseDetails {
  message: string;
  statusCode: number;
  data?: any;
}

const responseHandler = (
  message: string,
  statusCode: number,
  data?: any,
  response?: Response,
) => {
  if (response) {
    return response.status(statusCode).json({
      status:
        statusCode === 201 || statusCode === 200 || statusCode === 207
          ? "success"
          : "error",
      message: message,
      data: data || null,
    });
  }
  return {
    message,
    statusCode,
    data,
  };
};

export default responseHandler;
