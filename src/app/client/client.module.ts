import { Module } from '@nestjs/common';
import { ClientService } from '@app/client/client.service';
import { ClientResolver } from '@app/client/client.resolver';
import { PersonOfInterestModule } from '@app/person-of-interest/person-of-interest.module';

@Module({
  imports: [PersonOfInterestModule],
  providers: [ClientService, ClientResolver],
  exports: [ClientService],
})
export class ClientModule {}
