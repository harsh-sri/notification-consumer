import { Injectable, Scope } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService extends NestConfigService {
  get mongo(): {
    uri: string;
    maxPoolSize: number;
    minPoolSize: number;
  } {
    return {
      uri: this.get("MONGO_URI"),
      maxPoolSize: Number(this.get("MONGO_MAX_POOL_SIZE")),
      minPoolSize: Number(this.get("MONGO_MIN_POOL_SIZE")),
    };
  }

  get log(): {
    name: string;
    level: string;
  } {
    return {
      name: this.get("LOG_NAME"),
      level: this.get("LOG_LEVEL"),
    };
  }

  get notification_webhook(): {
    url: string;
  } {
    return {
      url: this.get("NOTIFICATION_WEB_HOOK"),
    };
  }

  get notification_threshold(): {
    blocker: number;
    critical: number;
    medium: number;
    low: number;
  } {
    return {
      blocker: this.get("NOTIFICATION_STOCK_BLOCKER_THRESHOLD"),
      critical: this.get("NOTIFICATION_STOCK_CRITICAL_THRESHOLD"),
      medium: this.get("NOTIFICATION_STOCK_MEDIUM_THRESHOLD"),
      low: this.get("NOTIFICATION_STOCK_LOW_THRESHOLD"),
    };
  }

  get kafka(): {
    broker: string;
    sleepTime: number;
    topic: string;
    clientId: string;
    groupId: string;
    timeout: number;
  } {
    return {
      broker: this.get("KAFKA_BROKER"),
      sleepTime: this.get("KAFKA_SLEEP_TIME"),
      topic: this.get("KAFKA_TOPIC"),
      clientId: this.get("KAFKA_CLIENT_ID"),
      groupId: this.get("KAFKA_GROUP_ID"),
      timeout: this.get("KAFKA_REQUEST_TIMEOUT"),
    };
  }
}
