import { AxiosRequestConfig } from 'axios';
import { BaseResourceOptions } from '../../interfaces/BaseResourceOptions';

export interface AxiosResourceOptions extends BaseResourceOptions, AxiosRequestConfig {}
