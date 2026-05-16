import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
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

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.authService.updateUserStatus(id, body.isActive);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.authService.updateUserRole(id, body.role);
  }
}
