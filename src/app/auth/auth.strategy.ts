import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';
import { UserRole, UserStatus } from '@app/user/user.entity';
import { AuthService } from '@app/auth/auth.service';
import { CaslAbilityFactory } from '@app/casl/casl-ability.factory';
import { AppAbility } from '@app/casl/casl.utils';

export type CurrentUserData = {
  id: string;
  role: UserRole;
  token: string;
  clientIds: string[];
  ability: AppAbility;
};

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private caslAbilityFactory: CaslAbilityFactory,
    private connection: Connection,
  ) {
    super();
  }

  async validate(token: string): Promise<CurrentUserData> {
    const auth = await this.authService.getAuth(token, this.connection.manager);

    if (!auth) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.getUser(auth.userId, this.connection.manager);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException();
    }

    const { id, role, clientsUsers } = user;

    const clientIds = clientsUsers.map((item) => item.clientId);

    const ability = this.caslAbilityFactory.createAbilityByBuilder({ id, role, clientIds });
    // const ability = this.caslAbilityFactory.createAbilityByBuilderWithRolesPermissions({ id, role, clientIds });
    // const ability = this.caslAbilityFactory.createAbilityByJSON({ id, role, clientIds });

    return { id, role, clientIds, token, ability };
  }
}
