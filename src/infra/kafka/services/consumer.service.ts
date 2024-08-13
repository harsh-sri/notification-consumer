import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import {
  IConsumer,
  IKafkajsConsumerOptions,
} from "../interfaces/consumer.interface";
import { KafkajsConsumer } from "../kafkajs.consumer";
import { ConfigService } from "src/core";
import { Repository } from "typeorm";
import { DLQEntity } from "../entities/dlq.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationService } from "src/notification/notification.service";

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  constructor(
    // private readonly configService: ConfigService,
    @InjectRepository(DLQEntity)
    private readonly dlqRepository: Repository<DLQEntity>,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async consume({ topic, config, onMessage }: IKafkajsConsumerOptions) {
    const consumer = new KafkajsConsumer(
      topic,
      this.dlqRepository,
      this.configService,
      config,
      this.notificationService,
    );
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
