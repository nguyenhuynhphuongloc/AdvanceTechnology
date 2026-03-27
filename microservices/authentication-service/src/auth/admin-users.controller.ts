import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/admin/users')
export class AdminUsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  listUsers() {
    return this.authService.listAdminUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.authService.getAdminUserById(id);
  }
}
