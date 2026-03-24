/**
 * Prisma seed - creates test users and sample data.
 * Run with: pnpm --filter api prisma db seed
 */

import "../src/bootstrap-env";
import { PrismaClient, UserRole, UserStatus, VerificationStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  const passwordHash = await bcrypt.hash("Test1234", SALT_ROUNDS);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@ustatap.test" },
    update: {},
    create: {
      email: "admin@ustatap.test",
      phone: "+994500000001",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Customer user
  const customer = await prisma.user.upsert({
    where: { email: "customer@ustatap.test" },
    update: {},
    create: {
      email: "customer@ustatap.test",
      phone: "+994500000002",
      passwordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerProfile: {
        create: {
          firstName: "Test",
          lastName: "Customer",
        },
      },
    },
    include: { customerProfile: true },
  });

  // Master user
  const masterUser = await prisma.user.upsert({
    where: { email: "master@ustatap.test" },
    update: {},
    create: {
      email: "master@ustatap.test",
      phone: "+994500000003",
      passwordHash,
      role: UserRole.MASTER,
      status: UserStatus.ACTIVE,
    },
  });

  const masterProfile = await prisma.masterProfile.upsert({
    where: { userId: masterUser.id },
    update: {},
    create: {
      userId: masterUser.id,
      displayName: "Test Master",
      bio: "Professional service provider",
      experienceYears: 5,
      verificationStatus: VerificationStatus.APPROVED,
      isAvailable: true,
    },
  });

  // Categories
  const cat1 = await prisma.serviceCategory.upsert({
    where: { slug: "home-services" },
    update: {},
    create: {
      nameAz: "Ev xidmətləri",
      nameEn: "Home Services",
      nameRu: "Домашние услуги",
      slug: "home-services",
      isActive: true,
    },
  });

  const cat2 = await prisma.serviceCategory.upsert({
    where: { slug: "repair" },
    update: {},
    create: {
      nameAz: "Təmir",
      nameEn: "Repair",
      nameRu: "Ремонт",
      slug: "repair",
      isActive: true,
    },
  });

  const cat3 = await prisma.serviceCategory.upsert({
    where: { slug: "cleaning" },
    update: {},
    create: {
      nameAz: "Təmizlik",
      nameEn: "Cleaning",
      nameRu: "Уборка",
      slug: "cleaning",
      isActive: true,
    },
  });

  // Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { categoryId_slug: { categoryId: cat1.id, slug: "plumbing" } },
      update: {},
      create: {
        categoryId: cat1.id,
        nameAz: "Santor işləri",
        nameEn: "Plumbing",
        nameRu: "Сантехника",
        slug: "plumbing",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { categoryId_slug: { categoryId: cat1.id, slug: "electrical" } },
      update: {},
      create: {
        categoryId: cat1.id,
        nameAz: "Elektrik",
        nameEn: "Electrical",
        nameRu: "Электрика",
        slug: "electrical",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { categoryId_slug: { categoryId: cat2.id, slug: "appliance-repair" } },
      update: {},
      create: {
        categoryId: cat2.id,
        nameAz: "Məişət texnikası təmiri",
        nameEn: "Appliance Repair",
        nameRu: "Ремонт бытовой техники",
        slug: "appliance-repair",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { categoryId_slug: { categoryId: cat3.id, slug: "house-cleaning" } },
      update: {},
      create: {
        categoryId: cat3.id,
        nameAz: "Ev təmizliyi",
        nameEn: "House Cleaning",
        nameRu: "Уборка дома",
        slug: "house-cleaning",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { categoryId_slug: { categoryId: cat3.id, slug: "deep-cleaning" } },
      update: {},
      create: {
        categoryId: cat3.id,
        nameAz: "Dərin təmizlik",
        nameEn: "Deep Cleaning",
        nameRu: "Глубокая уборка",
        slug: "deep-cleaning",
        isActive: true,
      },
    }),
  ]);

  // Master services - link master to first 3 services
  for (const svc of services.slice(0, 3)) {
    await prisma.masterService.upsert({
      where: {
        masterProfileId_serviceId: {
          masterProfileId: masterProfile.id,
          serviceId: svc.id,
        },
      },
      update: {},
      create: {
        masterProfileId: masterProfile.id,
        serviceId: svc.id,
        basePrice: 50,
        currency: "AZN",
        isActive: true,
      },
    });
  }

  // Service area for master (Baku coordinates)
  const existingArea = await prisma.serviceArea.findFirst({
    where: { masterProfileId: masterProfile.id },
  });
  if (!existingArea) {
    await prisma.serviceArea.create({
      data: {
        masterProfileId: masterProfile.id,
        city: "Baku",
        latitude: 40.4093,
        longitude: 49.8671,
      },
    });
  } else {
    await prisma.serviceArea.updateMany({
      where: { masterProfileId: masterProfile.id },
      data: { latitude: 40.4093, longitude: 49.8671 },
    });
  }

  // Categories for homepage: Electrician, Plumber, AC repair, Cleaning
  const catElectrician = await prisma.serviceCategory.upsert({
    where: { slug: "electrician" },
    update: {},
    create: {
      nameAz: "Elektrik",
      nameEn: "Electrician",
      nameRu: "Электрик",
      slug: "electrician",
      isActive: true,
    },
  });
  const catPlumber = await prisma.serviceCategory.upsert({
    where: { slug: "plumber" },
    update: {},
    create: {
      nameAz: "Santexnik",
      nameEn: "Plumber",
      nameRu: "Сантехник",
      slug: "plumber",
      isActive: true,
    },
  });
  const catAcRepair = await prisma.serviceCategory.upsert({
    where: { slug: "ac-repair" },
    update: {},
    create: {
      nameAz: "Klimatik təmiri",
      nameEn: "AC Repair",
      nameRu: "Ремонт кондиционеров",
      slug: "ac-repair",
      isActive: true,
    },
  });

  // Services under electrician and plumber categories
  const elecService = await prisma.service.upsert({
    where: { categoryId_slug: { categoryId: catElectrician.id, slug: "electrical" } },
    update: {},
    create: {
      categoryId: catElectrician.id,
      nameAz: "Elektrik işləri",
      nameEn: "Electrical",
      nameRu: "Электропроводка",
      slug: "electrical",
      isActive: true,
    },
  });
  const plumbService = await prisma.service.upsert({
    where: { categoryId_slug: { categoryId: catPlumber.id, slug: "plumbing" } },
    update: {},
    create: {
      categoryId: catPlumber.id,
      nameAz: "Santexnika",
      nameEn: "Plumbing",
      nameRu: "Сантехника",
      slug: "plumbing",
      isActive: true,
    },
  });
  await prisma.masterService.upsert({
    where: {
      masterProfileId_serviceId: { masterProfileId: masterProfile.id, serviceId: elecService.id },
    },
    update: {},
    create: { masterProfileId: masterProfile.id, serviceId: elecService.id, basePrice: 45, currency: "AZN", isActive: true },
  });
  await prisma.masterService.upsert({
    where: {
      masterProfileId_serviceId: { masterProfileId: masterProfile.id, serviceId: plumbService.id },
    },
    update: {},
    create: { masterProfileId: masterProfile.id, serviceId: plumbService.id, basePrice: 55, currency: "AZN", isActive: true },
  });

  const acRepairService = await prisma.service.upsert({
    where: { categoryId_slug: { categoryId: catAcRepair.id, slug: "ac-repair" } },
    update: {},
    create: {
      categoryId: catAcRepair.id,
      nameAz: "Klimatik təmiri",
      nameEn: "AC Repair",
      nameRu: "Ремонт кондиционеров",
      slug: "ac-repair",
      isActive: true,
    },
  });
  await prisma.masterService.upsert({
    where: {
      masterProfileId_serviceId: {
        masterProfileId: masterProfile.id,
        serviceId: acRepairService.id,
      },
    },
    update: {},
    create: {
      masterProfileId: masterProfile.id,
      serviceId: acRepairService.id,
      basePrice: 75,
      currency: "AZN",
      isActive: true,
    },
  });

  console.log("Seed completed:");
  console.log("  Admin:", admin.email);
  console.log("  Customer:", customer.email);
  console.log("  Master:", masterUser.email);
  console.log("  Categories:", 3);
  console.log("  Services:", services.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
