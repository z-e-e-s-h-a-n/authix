import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";

@Module({
  imports: [AuthModule, PrismaModule],
})
export class AppModule {}
