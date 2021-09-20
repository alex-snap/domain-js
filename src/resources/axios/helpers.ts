import { ContentTypeEnum } from "../../enums/ContentTypeEnum";
import { transformToFormData } from "../../utils";
import { AxiosResourceOptions } from "./AxiosResourceOptions";

export function resolveAxiosRequestBody(
  body: Record<string, any> | null,
  options?: AxiosResourceOptions
): Record<string, any> | string | FormData | null {
  if (options && body != null && options.contentType === ContentTypeEnum.FORM_DATA) {
    return transformToFormData(body);
  }
  return body
}
