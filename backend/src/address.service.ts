import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { User } from './auth/entity/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAddresses(userId: number): Promise<Address[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user.addresses || [];
  }

  async addAddress(userId: number, address: Partial<Address>): Promise<Address> {
    if (!address.name || !address.address || !address.mobileNumber) {
      throw new HttpException('Name, address, and mobile number are required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const newAddress = this.addressRepository.create({ ...address, user });
    try {
      return await this.addressRepository.save(newAddress);
    } catch (error) {
      throw new HttpException(`Failed to add address: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAddress(addressId: number, userId: number, address: Partial<Address>): Promise<Address> {
    const existingAddress = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!existingAddress) {
      throw new HttpException('Address not found or not authorized', HttpStatus.NOT_FOUND);
    }

    Object.assign(existingAddress, address);
    try {
      return await this.addressRepository.save(existingAddress);
    } catch (error) {
      throw new HttpException(`Failed to update address: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAddress(addressId: number, userId: number) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) {
      throw new HttpException('Address not found or not authorized', HttpStatus.NOT_FOUND);
    }

    try {
      await this.addressRepository.remove(address);
      return { message: 'Address deleted successfully' };
    } catch (error) {
      throw new HttpException(`Failed to delete address: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}