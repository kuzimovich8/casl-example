import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@app/config/config.service';

const configService = new ConfigService();

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  subscribers: [`${__dirname}/../**/*.subscriber{.ts,.js}`],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  migrations: [`${__dirname}/../../migrations/*{.ts,.js}`],
  cli: { migrationsDir: 'src/migrations' },
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_DATABASE'),
};

export = config;
