import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { UserEntity, UserRole } from '@app/user/user.entity';
import { ClientEntity } from '@app/client/client.entity';
import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import { IncidentEntity } from '@app/incident/incident.entity';

import { AppAbility, AppAbilityClass, lambdaMatcher, rolePermissions, Subject } from '@app/casl/casl.utils';

@Injectable()
export class CaslAbilityFactory {
  /*================================= using AbilityBuilder class =======================================*/

  createAbilityByBuilder(user: { id: string; role: UserRole; clientIds: string[] }): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbilityClass);

    // all

    user.role === UserRole.SUPER_ADMIN ? can('manage', 'all') : cannot('manage', 'all');

    // user

    can('readList', UserEntity);

    can('read', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );

    if (user.role === UserRole.CLIENT_ADMIN) {
      can('create', UserEntity);
      can('update', UserEntity, (subject) =>
        subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
      );
      can('delete', UserEntity, (subject) =>
        subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
      );
    }

    // client

    can('readList', ClientEntity);
    can('read', ClientEntity, (subject) => subject.clientsUsers.map((item) => item.userId).includes(user.id));
    cannot('test', ClientEntity).because('Sorry, no permission');

    // person of interest

    can('readList', PersonOfInterestEntity);
    can('read', PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));

    if ([UserRole.CLIENT_ADMIN, UserRole.CLIENT_WRITER].includes(user.role)) {
      can('create', PersonOfInterestEntity);
      can(['update', 'delete'], PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));
    }

    // incident

    can('readList', IncidentEntity);
    can('read', IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));

    if ([UserRole.CLIENT_ADMIN, UserRole.CLIENT_WRITER].includes(user.role)) {
      can('create', IncidentEntity);
      can(['update', 'delete'], IncidentEntity, (subject) =>
        user.clientIds.includes(subject.personOfInterest.clientId),
      );
    }

    return build({
      detectSubjectType: (object) => object.constructor as ExtractSubjectType<Subject>,
      conditionsMatcher: lambdaMatcher,
    });
  }

  /*=================== using AbilityBuilder class (roles with predefined permissions) ==================*/

  createAbilityByBuilderWithRolesPermissions(user: { id: string; role: UserRole; clientIds: string[] }): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    rolePermissions[user.role](user, builder);

    return builder.build({
      detectSubjectType: (object) => object.constructor as ExtractSubjectType<Subject>,
      conditionsMatcher: lambdaMatcher,
    });
  }

  /*================================= using JSON objects =======================================*/

  createAbilityByJSON(user: { id: string; role: UserRole; clientIds: string[] }): AppAbility {
    const rules = [];

    // all

    rules.push(
      user.role === UserRole.SUPER_ADMIN
        ? { action: 'manage', subject: 'all' }
        : { action: 'manage', subject: 'all', inverted: true },
    );

    // user

    rules.push(
      { action: 'readList', subject: UserEntity },
      {
        action: 'read',
        subject: UserEntity,
        conditions: (subject) =>
          subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
      },
    );

    if (user.role === UserRole.CLIENT_ADMIN) {
      rules.push(
        { action: 'create', subject: UserEntity },
        {
          action: 'update',
          subject: UserEntity,
          conditions: (subject) =>
            subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
        },
        {
          action: 'delete',
          subject: UserEntity,
          conditions: (subject) =>
            subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
        },
      );
    }

    // client

    rules.push(
      { action: 'readList', subject: ClientEntity },
      {
        action: 'read',
        subject: ClientEntity,
        conditions: (subject) => subject.clientsUsers.map((item) => item.userId).includes(user.id),
      },
      { action: 'test', subject: ClientEntity, inverted: true, reason: 'Sorry, do not have a permission' },
    );

    // person of interest

    rules.push(
      { action: 'readList', subject: PersonOfInterestEntity },
      {
        action: 'read',
        subject: PersonOfInterestEntity,
        conditions: (subject) => user.clientIds.includes(subject.clientId),
      },
    );

    if ([UserRole.CLIENT_ADMIN, UserRole.CLIENT_WRITER].includes(user.role)) {
      rules.push(
        { action: 'create', subject: PersonOfInterestEntity },
        {
          action: ['update', 'delete'],
          subject: PersonOfInterestEntity,
          conditions: (subject) => user.clientIds.includes(subject.clientId),
        },
      );
    }

    // incident

    rules.push(
      { action: 'readList', subject: IncidentEntity },
      {
        action: 'read',
        subject: IncidentEntity,
        conditions: (subject) => user.clientIds.includes(subject.personOfInterest.clientId),
      },
    );

    if ([UserRole.CLIENT_ADMIN, UserRole.CLIENT_WRITER].includes(user.role)) {
      rules.push(
        { action: 'create', subject: IncidentEntity },
        {
          action: ['update', 'delete'],
          subject: IncidentEntity,
          conditions: (subject) => user.clientIds.includes(subject.personOfInterest.clientId),
        },
      );
    }

    return new AppAbilityClass(rules, {
      detectSubjectType: (object) => object.constructor as ExtractSubjectType<Subject>,
      conditionsMatcher: lambdaMatcher,
    });
  }
}
