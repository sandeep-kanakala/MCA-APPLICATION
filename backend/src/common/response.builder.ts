import { Response } from "./response.interface";

export class ResponseBuilder<T> {
  private response: Response<T>;

  public constructor() {
    this.response = {
      statusCode: 200,
      message: 'Success',
      data:null
    };
  }

  public withStatusCode(code: number): ResponseBuilder<T> {
    this.response.statusCode = code;
    return this;
  }

  public withMessage(message: string): ResponseBuilder<T> {
    this.response.message = message;
    return this;
  }

  public withData(data: T): ResponseBuilder<T> {
    this.response.data = data;
    return this;
  }

  public build(): Response<T> {
    return this.response;
  }
}
