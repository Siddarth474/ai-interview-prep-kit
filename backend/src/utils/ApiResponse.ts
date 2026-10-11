export class ApiResponse<T = unknown> {
  statusCode: number;
  data?: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, data?: T, message = "Success") {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    if (data !== undefined) {
      this.data = data;
    }
  }
}
