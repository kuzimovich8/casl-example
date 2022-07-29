import { Module } from '@nestjs/common';
import { TypeOrmConfigService } from './typeorm-config.service';
import { ConfigModule } from '@app/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [TypeOrmConfigService],
  exports: [TypeOrmConfigService],
})
export class TypeOrmConfigModule {}
