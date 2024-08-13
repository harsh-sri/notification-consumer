import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "./core";
import { HealthCheckModule } from "./health-check/health-check.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "./core/logger";
import { HttpModule } from "./infra/http/http.module";
import { NotificationModule } from "./notification/notification.module";
import { KafkaModule } from "./infra/kafka/kafka.module";
import { sLog } from "./common/constants/slog.constant";
import { AppService } from "./app.service";
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mongodb",
        url: configService.mongo.uri,
        useNewUrlParser: true,
        minPoolSize: configService.mongo.minPoolSize,
        maxPoolSize: configService.mongo.maxPoolSize,
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    NotificationModule,
    LoggerModule,
    HealthCheckModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [AppService, ConfigService, sLog],
})
export class AppModule {}
