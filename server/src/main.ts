import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app.module";
import { ResponseInterceptor } from "@/common/interceptors";
import { AllExceptionsFilter } from "@/common/filters";
import cookieParser from "cookie-parser";
import { envConfig } from "@/config";
import { GlobalValidationPipe } from "@/common/pipes";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(GlobalValidationPipe);
  await app.listen(envConfig.app.port);
}
bootstrap();
