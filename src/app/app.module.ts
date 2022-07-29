import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandModule } from 'nestjs-command';

import { UserModule } from '@app/user/user.module';
import { ConfigModule } from '@app/config/config.module';
import { ClientModule } from '@app/client/client.module';
import { AppController } from '@app/app.controller';
import { PersonOfInterestModule } from '@app/person-of-interest/person-of-interest.module';
import { IncidentModule } from '@app/incident/incident.module';
import { TypeOrmConfigModule } from '@app/typeorm/typeorm-config.module';
import { TypeOrmConfigService } from '@app/typeorm/typeorm-config.service';
import { AuthModule } from '@app/auth/auth.module';
import { SeedModule } from '@app/seed/seed.module';
import { CaslModule } from '@app/casl/casl.module';
import { GraphqlConfigModule } from '@app/graphql/graphql-config.module';
import { GraphqlConfigService } from '@app/graphql/graphql-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [TypeOrmConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    GraphQLModule.forRootAsync({
      imports: [GraphqlConfigModule],
      useExisting: GraphqlConfigService,
    }),
    CommandModule,
    ConfigModule,
    AuthModule,
    SeedModule,
    CaslModule,

    UserModule,
    ClientModule,
    PersonOfInterestModule,
    IncidentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
