import axios, { AxiosResponse } from 'axios';
import { API, APIFunc } from './model';

const baseURL = `https://weibo.com/ajax`;

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
});

type RespHandlerFunc<T extends API> = (resp: AxiosResponse<T['Results']>, params: T['Paramas']) => T['Results'];

export enum ParamType {
  Path,
  Query,
  Body,
}

export function createAPIRequest<T extends API>(
  apiPath: string,
  options?: {
    respHandler?: RespHandlerFunc<T>;
    paramType?: ParamType;
    contentType?: string;
  },
) {
  const func: APIFunc<T> = params => {
    function createRequestTask() {
      const paramType = options?.paramType ?? ParamType.Query;

      switch (paramType) {
        case ParamType.Body:
          return http.post<T['Results']>(apiPath, params, {
            headers: {
              'Content-Type': options?.contentType ?? 'application/json',
            },
          });
        default:
          return http.get<T['Results']>(apiPath, params);
      }
    }
    const task = createRequestTask();

    return task.then(results => {
      if (options?.respHandler) {
        return options?.respHandler(results, params);
      } else {
        return results.data;
      }
    });
  };

  return func;
}

export type MyBlog = SimpleBlog & {
  comments: SimpleComment[];
};

export interface SimpleBlog {
  id: number;
  idstr: string;
  created_at: string;
  text_raw: string;
  text: string;
  textLength: number;
  source: string;
  comments_count: number;
  region_name: string;
}

export interface SimpleComment {
  created_at: string;
  floor_number: number;
  text: string;
  text_raw: string;
  source: string;
  rootid: string;
  rootidstr: string;
  id: number;
  idstr: string;
}
