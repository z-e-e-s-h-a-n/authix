import { ValidationPipe } from "@nestjs/common";

export const GlobalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
});
