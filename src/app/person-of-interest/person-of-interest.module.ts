import { Module } from '@nestjs/common';
import { PersonOfInterestService } from './person-of-interest.service';
import { PersonOfInterestResolver } from './person-of-interest.resolver';

@Module({
  providers: [PersonOfInterestService, PersonOfInterestResolver],
  exports: [PersonOfInterestService, PersonOfInterestResolver],
})
export class PersonOfInterestModule {}
