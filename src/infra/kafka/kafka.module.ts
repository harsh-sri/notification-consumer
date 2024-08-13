import { Module } from "@nestjs/common";
import { ConsumerService } from "./services/consumer.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DLQEntity } from "./entities/dlq.entity";
import { ConfigService } from "src/core";
import { NotificationModule } from "src/notification/notification.module";
import { NotificationService } from "src/notification/notification.service";
import { HttpModule } from "../http/http.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DLQEntity]),
    HttpModule,
    NotificationModule,
  ],
  providers: [ConsumerService, NotificationService, ConfigService],
  exports: [ConsumerService],
})
export class KafkaModule {}
