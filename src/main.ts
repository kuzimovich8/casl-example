import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from '@app/app.module';
import { ConfigService } from '@app/config/config.service';
import { getDefaultValidationPipe } from '@app/common/pipes/default-validation-pipe';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(getDefaultValidationPipe());
  app.enableCors();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);
  const appHost = configService.get('APP_HOST');
  const port = configService.get('PORT');

  await app
    .listen(port)
    .then(() => {
      console.log(`🚀 Server is ready: ${appHost}:${port}`);
    })
    .catch((e: unknown) => {
      console.log(e);
      console.log(`Uncaught error occurred`);
    });
};

(async () => {
  await bootstrap();
})();
