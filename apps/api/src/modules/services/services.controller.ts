import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ServicesService } from "./services.service";
import {
  CreateServiceDto,
  UpdateServiceDto,
  UpdateServiceStatusDto,
  ServicesQueryDto,
} from "./dto";

@Controller("services")
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  async findAll(@Query() query: ServicesQueryDto) {
    return this.services.findAll(
      { categorySlug: query.categorySlug, search: query.search },
      { page: query.page, limit: query.limit },
    );
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.services.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateServiceDto) {
    return this.services.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(id, dto);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.services.updateStatus(id, dto.isActive);
  }
}
