import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyerProfile } from './entities/buyer-profile.entity';
import { SellerProfile, SellerProfileStatus } from './entities/seller-profile.entity';
import { Address } from './entities/address.entity';
import { UpdateBuyerProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(BuyerProfile)
    private readonly buyerProfileRepo: Repository<BuyerProfile>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  // ─── Buyer Profile ──────────────────────────────────────────────────────────

  async getBuyerProfile(userId: string) {
    let profile = await this.buyerProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = await this.buyerProfileRepo.save(
        this.buyerProfileRepo.create({ userId, fullName: '' }),
      );
    }
    return profile;
  }

  async updateBuyerProfile(userId: string, dto: UpdateBuyerProfileDto) {
    const profile = await this.getBuyerProfile(userId);
    Object.assign(profile, dto);
    return this.buyerProfileRepo.save(profile);
  }

  async getBuyerProfileOrFail(userId: string) {
    const profile = await this.buyerProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Buyer profile not found for user ${userId}`);
    }
    return profile;
  }

  // ─── Addresses ──────────────────────────────────────────────────────────────

  async getAddresses(userId: string) {
    const profile = await this.getBuyerProfileOrFail(userId);
    return this.addressRepo.find({ where: { buyerProfileId: profile.id } });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const profile = await this.getBuyerProfileOrFail(userId);

    const address = this.addressRepo.create({
      ...dto,
      buyerProfileId: profile.id,
    });

    if (dto.isDefault) {
      await this.addressRepo.update({ buyerProfileId: profile.id }, { isDefault: false });
    }

    return this.addressRepo.save(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const profile = await this.getBuyerProfileOrFail(userId);
    const address = await this.addressRepo.findOne({
      where: { id: addressId, buyerProfileId: profile.id },
    });
    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    if (dto.isDefault) {
      await this.addressRepo.update({ buyerProfileId: profile.id }, { isDefault: false });
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const profile = await this.getBuyerProfileOrFail(userId);
    const address = await this.addressRepo.findOne({
      where: { id: addressId, buyerProfileId: profile.id },
    });
    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }
    await this.addressRepo.remove(address);
    return { success: true };
  }

  // ─── Seller Profile ─────────────────────────────────────────────────────────

  async getSellerProfile(userId: string) {
    const profile = await this.sellerProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Seller profile not found for user ${userId}`);
    }
    return profile;
  }

  async getSellerProfileOrNull(userId: string) {
    return this.sellerProfileRepo.findOne({ where: { userId } });
  }

  async updateSellerProfile(userId: string, dto: { businessName?: string; phone?: string }) {
    const profile = await this.getSellerProfile(userId);
    Object.assign(profile, dto);
    return this.sellerProfileRepo.save(profile);
  }

  async updateSellerStatus(userId: string, status: SellerProfileStatus) {
    const profile = await this.getSellerProfile(userId);
    profile.status = status;
    return this.sellerProfileRepo.save(profile);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async listAllSellerProfiles() {
    return this.sellerProfileRepo.find({ order: { createdAt: 'DESC' } });
  }

  async adminUpdateSellerStatus(sellerProfileId: string, status: SellerProfileStatus) {
    const profile = await this.sellerProfileRepo.findOne({ where: { id: sellerProfileId } });
    if (!profile) {
      throw new NotFoundException(`Seller profile ${sellerProfileId} not found`);
    }
    profile.status = status;
    return this.sellerProfileRepo.save(profile);
  }

  async getSellerProfileById(sellerProfileId: string) {
    const profile = await this.sellerProfileRepo.findOne({ where: { id: sellerProfileId } });
    if (!profile) {
      throw new NotFoundException(`Seller profile ${sellerProfileId} not found`);
    }
    return profile;
  }
}
