import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchService } from './branch.service';
import { AdminBranchController, BranchController } from './branch.controller';
import { BranchEntity } from './entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchEntity])],
  controllers: [BranchController, AdminBranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
