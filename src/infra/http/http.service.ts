import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { AppLogger } from "src/core/logger";
import { IHttp } from "./http.interface";

@Injectable()
export class HttpService implements IHttp {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(HttpService.name);
  }

  async request(requestPayload: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      const { url, method, data } = requestPayload;

      const response: AxiosResponse = await axios.request({
        url,
        method,
        data,
      });

      Logger.log({
        requestPayload,
        responseStatus: response.status,
      });

      return response;
    } catch (err) {
      Logger.log("HTTP Request Exception", err, { requestPayload });
      // retry? failover?
      if (err?.code === "ECONNRESET") {
        return this.request(requestPayload);
      }

      throw err;
    }
  }
}
