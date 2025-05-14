import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { AllExceptionsFilter } from "./common/filters/exceptions.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
