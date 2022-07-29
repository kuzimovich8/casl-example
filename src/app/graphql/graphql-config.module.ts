import { Module } from '@nestjs/common';
import { ConfigModule } from '@app/config/config.module';
import { GraphqlConfigService } from '@app/graphql/graphql-config.service';

@Module({
  imports: [ConfigModule],
  providers: [GraphqlConfigService],
  exports: [GraphqlConfigService],
})
export class GraphqlConfigModule {}
