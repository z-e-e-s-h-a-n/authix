import argon2 from "argon2";
import { envConfig } from "@/config";
import { PrismaClient } from "@prisma/client";
import { generateSecret, slugify } from "@/lib/utils";

const prisma = new PrismaClient();

// Config
const ADMIN_EMAIL = envConfig.admin.email;
const ADMIN_PASSWORD = envConfig.admin.password;
const [firstName, lastName] = envConfig.admin.name.split(" ");
const ORG_NAME = envConfig.admin.orgName;
const PROJECT_NAME = envConfig.admin.projectName;
const PUBLISHABLE_KEY = generateSecret("key");
const SECRET_KEY = generateSecret("key");

async function bootstrap() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingUser) {
      console.log("Admin user already exists. Skipping bootstrap.");
      return;
    }

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: await argon2.hash(ADMIN_PASSWORD),
        firstName: firstName!,
        lastName,
        isEmailVerified: true,
      },
    });
    console.log("✅ Created admin user");

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: ORG_NAME,
        slug: slugify(ORG_NAME),
      },
    });
    console.log("✅ Created organization");

    // Create project
    const project = await prisma.project.create({
      data: {
        name: PROJECT_NAME,
        slug: slugify(PROJECT_NAME),
        orgId: org.id,
      },
    });
    console.log("✅ Created project");

    // Create Api keys
    await prisma.apiKey.createMany({
      data: [
        {
          key: SECRET_KEY,
          prefix: "sk_test",
          projectId: project.id,
        },
        {
          key: PUBLISHABLE_KEY,
          prefix: "pk_test",
          projectId: project.id,
        },
      ],
    });
    console.log("✅ Created Api Keys");

    // Create project settings
    await prisma.projectSetting.create({
      data: {
        projectId: project.id,
        allowedProviders: ["email", "google", "github"],
      },
    });
    console.log("✅ Created project settings");

    // Create memberships
    await prisma.membership.createMany({
      data: [
        {
          userId: user.id,
          orgId: org.id,
          role: "owner",
        },
        {
          userId: user.id,
          projectId: project.id,
          role: "owner",
        },
      ],
    });
    console.log("✅ Created memberships");

    console.log("🎉 Bootstrap complete");
    console.log("🔐 Admin:", ADMIN_EMAIL);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("🔑 Keys:", {
      PUBLISHABLE_KEY,
      SECRET_KEY,
    });
  } catch (err: any) {
    console.error("❌ Error during bootstrap:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();
