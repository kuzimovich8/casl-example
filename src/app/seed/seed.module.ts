import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedCommand } from '@app/seed/seed.command';

@Module({
  providers: [SeedService, SeedCommand],
})
export class SeedModule {}
