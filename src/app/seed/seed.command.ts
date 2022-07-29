import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SeedService } from '@app/seed/seed.service';

@Injectable()
export class SeedCommand {
  constructor(private readonly seedService: SeedService) {}

  @Command({
    command: 'seed',
  })
  async seed() {
    await this.seedService.seedDatabaseAction();
  }
}
