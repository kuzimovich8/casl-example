import { Module } from '@nestjs/common';
import { ClientsUsersService } from './clients-users.service';

@Module({
  providers: [ClientsUsersService],
  exports: [ClientsUsersService],
})
export class ClientsUsersModule {}
