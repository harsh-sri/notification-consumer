import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "./infra/kafka/services/consumer.service";
import { ConfigService } from "./core";

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const { topic, groupId } = this.configService.kafka;
    await this.consumerService.consume({
      topic: { topics: [...topic] },
      config: { groupId },
      onMessage: async (message) => {
        console.log({
          value: message.value.toString(),
        });
      },
    });
  }
}
