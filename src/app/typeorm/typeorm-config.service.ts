import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@app/config/config.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      subscribers: [`${__dirname}/../**/*.subscriber{.ts,.js}`],
      synchronize: false,
      migrationsRun: false,
      logging: false,
      migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
      cli: { migrationsDir: 'src/migrations' },
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASS'),
      database: this.configService.get('DB_DATABASE'),
    };
  }
}
