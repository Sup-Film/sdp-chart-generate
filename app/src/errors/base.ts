/**
 * @fileoverview Base error class for typed HTTP errors
 */
import type { ErrorTemplate, ErrorTemplateKey } from "./template";

export class BaseError<
  const Key extends ErrorTemplateKey,
  const Status extends ErrorTemplate[Key]["status"] = ErrorTemplate[Key]["status"]
> extends Error {
  name: Key = "BAD_REQUEST" as Key;
  status: Status = 400 as Status;
}
