import { Injectable } from "@nestjs/common";
import { ConfigService } from "src/core";
import { AppLogger } from "src/core/logger";
import { HttpService } from "src/infra/http/http.service";
import { NotificationSeverity } from "./enums/notification-severity.enum";
import { KafkaMessage } from "kafkajs";
import {
  INotificationPayload,
  INotificationResponse,
} from "./interfaces/notification.interface";

@Injectable()
export class NotificationService {
  private notification_webhook_url;
  constructor(
    private readonly logger: AppLogger,
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.logger.setContext(NotificationService.name);
    this.notification_webhook_url = this.config.notification_webhook.url;
  }

  async sendNotif(
    payload: INotificationPayload,
  ): Promise<INotificationResponse> {
    return this.httpService.request(payload);
  }

  async getNotifSeverity(availability: number): Promise<NotificationSeverity> {
    const { blocker, critical, medium, low } =
      this.config.notification_threshold;
    let notificationSeverity: NotificationSeverity;
    if (availability <= blocker) {
      notificationSeverity = NotificationSeverity.BLOCKER;
    } else if (availability <= critical) {
      notificationSeverity = NotificationSeverity.CRITICAL;
    } else if (availability <= medium) {
      notificationSeverity = NotificationSeverity.MEDIUM;
    } else if (availability >= low) {
      notificationSeverity = NotificationSeverity.LOW;
    }

    return notificationSeverity;
  }

  async sendProductAvailabilityNotifAsync(
    payload: KafkaMessage,
  ): Promise<boolean> {
    const data = JSON.parse(payload?.value.toString());
    const notificationSeverity = await this.getNotifSeverity(data.availability);
    // only send notification when severity is > low. We can also use severity to decide what type of notification we want to send
    // this is being done to avoid sending too many notifications. eg. for each order we dont need to send notif if we have enough stock

    if (notificationSeverity === NotificationSeverity.LOW) {
      return true;
    }
    const requestPayload = {
      url: this.notification_webhook_url,
      method: "POST",
      data: {
        availability: data.availability,
        notificationSeverity,
      },
    };
    await this.sendNotif(requestPayload);

    return true;
  }
}
