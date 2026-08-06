/**
 * Servicio de usuarios: consulta y seed inicial desde students.json.
 */
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { SEED_USERS } from "./users.seed";

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /** Inserta usuarios seed si la tabla está vacía. */
  async onModuleInit(): Promise<void> {
    const count = await this.usersRepo.count();
    if (count > 0) {
      return;
    }
    for (const seed of SEED_USERS) {
      const passwordHash = await bcrypt.hash(seed.password, 10);
      await this.usersRepo.save(
        this.usersRepo.create({
          externalId: seed.externalId,
          email: seed.email,
          name: seed.name,
          role: seed.role,
          matricula: seed.matricula ?? null,
          passwordHash,
          active: true,
        }),
      );
    }
    this.logger.log(`Seed completado: ${SEED_USERS.length} usuarios`);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}
