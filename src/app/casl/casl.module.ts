import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '@app/casl/casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
