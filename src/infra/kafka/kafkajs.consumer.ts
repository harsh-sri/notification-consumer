import { Logger } from "@nestjs/common";
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaMessage,
} from "kafkajs";
import * as retry from "async-retry";
import { IConsumer } from "./interfaces/consumer.interface";
import { DLQEntity } from "./entities/dlq.entity";
import { Repository } from "typeorm";
import { sleep } from "src/common/utils/sleep";
import { NotificationService } from "src/notification/notification.service";
import { ConfigService } from "src/core";

export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;
  private readonly configService: ConfigService;
  private readonly notificationService: NotificationService;
  private readonly broker: string;
  private readonly clientId: string;

  constructor(
    private readonly topic: ConsumerSubscribeTopics,
    private readonly dlqRepository: Repository<DLQEntity>,
    configService: ConfigService,
    config: ConsumerConfig,
    notificationService: NotificationService,
  ) {
    this.configService = configService;
    this.broker = this.configService.kafka.broker;
    this.clientId = this.configService.kafka.clientId;

    this.kafka = new Kafka({
      brokers: [this.broker],
      clientId: this.clientId.toString(),
    });

    console.log(config);
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
    this.logger = new Logger(`${topic.topics}-${config.groupId}`);
    this.notificationService = notificationService;
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe({
      topic: this.configService.kafka.topic,
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message partition: ${partition}`);
        await this.notificationService.sendProductAvailabilityNotifAsync(
          message,
        );
        try {
          await retry(async () => onMessage(message), {
            retries: 3,
            onRetry: (error, attempt) =>
              this.logger.error(
                `Error consuming message, executing retry ${attempt}/3...`,
                error,
              ),
          });
        } catch (err) {
          this.logger.error(
            "Error consuming message. Adding to dead letter queue...",
            err,
          );
          await this.addMessageToDlq(message);
        }
      },
    });
  }

  private async addMessageToDlq(message: KafkaMessage) {
    const dlqEntity = new DLQEntity();
    dlqEntity.value = message.value.toString();
    dlqEntity.topic = this.topic.topics.toString();
    dlqEntity.createdAt = new Date();
    await this.dlqRepository.save(dlqEntity);
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error("Failed to connect to Kafka.", err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
