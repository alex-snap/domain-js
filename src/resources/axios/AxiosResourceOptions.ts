import { AxiosRequestConfig } from 'axios';
import { BaseResourceOptions } from '../../interfaces/BaseResourceOptions';
import { ContentTypeEnum } from "../../enums/ContentTypeEnum";

export interface AxiosResourceOptions extends BaseResourceOptions, AxiosRequestConfig {
  contentType?: ContentTypeEnum;
}
