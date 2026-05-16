import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from './entities/branch.entity';
import { CreateBranchDto, UpdateBranchDto, BranchDto } from './dto/branch.dto';

@Injectable()
export class BranchService implements OnModuleInit {
  private readonly logger = new Logger(BranchService.name);

  constructor(
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.branchRepository.count();
    if (count === 0) {
      this.logger.log('No branches found. Seeding default branch "Main Warehouse"...');
      const defaultBranch = this.branchRepository.create({
        name: 'Main Warehouse',
        location: 'Default Location',
        isActive: true,
      });
      await this.branchRepository.save(defaultBranch);
      this.logger.log(`Default branch created with ID: ${defaultBranch.id}`);
    }
  }

  async getDefaultBranch(): Promise<BranchEntity> {
    const branch = await this.branchRepository.findOne({ where: { isActive: true }, order: { createdAt: 'ASC' } });
    if (!branch) {
      throw new NotFoundException('No active branch found.');
    }
    return branch;
  }
  async create(dto: CreateBranchDto): Promise<BranchDto> {
    const existing = await this.branchRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Branch with name "${dto.name}" already exists.`);
    }

    const branch = this.branchRepository.create(dto);
    const saved = await this.branchRepository.save(branch);
    return saved;
  }

  async findAll(): Promise<BranchDto[]> {
    return this.branchRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found.`);
    }
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchDto> {
    const branch = await this.findOne(id);
    
    if (dto.name && dto.name !== branch.name) {
      const existing = await this.branchRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException(`Branch with name "${dto.name}" already exists.`);
      }
    }

    Object.assign(branch, dto);
    const saved = await this.branchRepository.save(branch);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    // Ideally we should check if inventory exists for this branch before deleting
    await this.branchRepository.remove(branch);
  }
}
