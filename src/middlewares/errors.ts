import { NextFunction, Request, Response } from "express";
import axios from "axios";
import logger from "../providers/logger";

export const errorsHandler = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  const stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

  console.log("RES: ", err);

  if (axios.isAxiosError(err)) {
    status = err.response?.status || 502;
    message =
      err.response?.data?.errors?.[0] ||
      err.response?.data?.message ||
      err.message;

    logger.error(`[Axios Error] ${err.config?.url}:`, err.response?.data);
  }

  if (err.name === "ZodError") {
    status = 400;
    message = "Validation Error";
  }

  res.status(status).json({
    status: "error",
    message,
    stack,
  });
};
