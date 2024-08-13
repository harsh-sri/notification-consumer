import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "./core";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get("PORT");
  app.init();
  await app.listen(port);
  Logger.log(`Application is running on port: ${port}`);
}
bootstrap();
