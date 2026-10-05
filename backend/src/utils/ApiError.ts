export class ApiError extends Error {
  statusCode: number;
  code?: string | undefined;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
  }
}
