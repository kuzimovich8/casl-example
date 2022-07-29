import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { ClientModule } from '@app/client/client.module';
import { ClientsUsersModule } from '@app/clients-users/clients-users.module';

@Module({
  imports: [ClientModule, ClientsUsersModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
