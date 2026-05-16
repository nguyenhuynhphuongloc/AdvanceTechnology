import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthUser } from './entities/auth-user.entity';
import { LoginDto, RegisterDto } from './dto/register.dto';

export const VALID_ROLES = ['customer', 'seller', 'admin'] as const;
export type UserRole = (typeof VALID_ROLES)[number];

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existing = await this.authUserRepository.findOne({ where: { email: adminEmail } });
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await this.authUserRepository.save(
      this.authUserRepository.create({
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
      }),
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.authUserRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const role = dto.role && VALID_ROLES.includes(dto.role as UserRole) ? dto.role : 'customer';
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.authUserRepository.save(
      this.authUserRepository.create({
        email: dto.email,
        passwordHash,
        role,
        isActive: true,
      }),
    );

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.authUserRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  async getCurrentSession(userId: string) {
    const user = await this.authUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async logout(userId: string) {
    const user = await this.authUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    user.refreshToken = null;
    await this.authUserRepository.save(user);
    return { success: true };
  }

  async listAdminUsers() {
    const users = await this.authUserRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      items: users.map((user) => this.toAdminUserResponse(user)),
      total: users.length,
    };
  }

  async getAdminUserById(userId: string) {
    const user = await this.authUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" was not found.`);
    }

    return this.toAdminUserResponse(user);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.authUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" was not found.`);
    }

    user.isActive = isActive;
    return this.authUserRepository.save(user);
  }

  async updateUserRole(userId: string, role: string) {
    if (!VALID_ROLES.includes(role as UserRole)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
      );
    }

    const user = await this.authUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" was not found.`);
    }

    user.role = role;
    const saved = await this.authUserRepository.save(user);
    return this.toAdminUserResponse(saved);
  }

  async createAdmin(email: string, password: string) {
    const existing = await this.authUserRepository.findOne({ where: { email } });
    if (existing) {
      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.authUserRepository.save(
      this.authUserRepository.create({
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
      }),
    );
  }

  private toAdminUserResponse(user: AuthUser) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
