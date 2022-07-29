import { Module } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { AuthStrategy } from '@app/auth/auth.strategy';
import { CaslModule } from '@app/casl/casl.module';

@Module({
  imports: [CaslModule],
  providers: [AuthService, AuthStrategy],
})
export class AuthModule {}
