/**
 * @fileoverview ErrorResponse class for throwing typed HTTP errors
 * Usage: throw new ErrorResponse({ name: 'NOT_FOUND', message: 'Resource not found' })
 */
import { BaseError } from "./base";
import { type ErrorTemplateKey, ErrorTemplates } from "./template";

type Base<T extends ErrorTemplateKey> = Omit<BaseError<T>, "status"> &
  Partial<Pick<BaseError<T>, "status">>;

export class ErrorResponse<T extends ErrorTemplateKey> extends BaseError<T> {
  constructor(opt: string | Base<T>) {
    if (typeof opt === "string") {
      super(opt);
    } else {
      super(opt.message);
      this.name = opt.name;
      this.status = opt.status || ErrorTemplates[this.name].status;
    }
  }
}
