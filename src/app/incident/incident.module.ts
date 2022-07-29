import { Module } from '@nestjs/common';
import { IncidentService } from '@app/incident/incident.service';
import { IncidentResolver } from '@app/incident/incident.resolver';

@Module({
  providers: [IncidentService, IncidentResolver],
  exports: [IncidentService],
})
export class IncidentModule {}
