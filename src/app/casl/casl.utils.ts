import { Ability, AbilityBuilder, AbilityClass, InferSubjects, MatchConditions, PureAbility } from '@casl/ability';
import { UserEntity, UserRole } from '@app/user/user.entity';
import { ClientEntity } from '@app/client/client.entity';
import { PersonOfInterestEntity } from '@app/person-of-interest/person-of-interest.entity';
import { IncidentEntity } from '@app/incident/incident.entity';

export type Action = 'manage' | 'create' | 'readList' | 'read' | 'update' | 'delete' | 'test';

export type Subject =
  | InferSubjects<typeof UserEntity | typeof ClientEntity | typeof PersonOfInterestEntity | typeof IncidentEntity>
  | 'all';

export type AppAbility = PureAbility<[Action, Subject]>;

export const AppAbilityClass = Ability as AbilityClass<AppAbility>;

export type DefinePermissions = (
  user: { id: string; role: UserRole; clientIds: string[] },
  builder: AbilityBuilder<AppAbility>,
) => void;

export const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

export const rolePermissions: Record<UserRole, DefinePermissions> = {
  [UserRole.SUPER_ADMIN](user, { can }) {
    can('manage', 'all');
  },

  [UserRole.CLIENT_ADMIN](user, { can }) {
    can('readList', UserEntity);
    can('read', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );
    can('create', UserEntity);
    can('update', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );
    can('delete', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );

    can('readList', ClientEntity);
    can('read', ClientEntity, (subject) => subject.clientsUsers.map((item) => item.userId).includes(user.id));

    can('readList', PersonOfInterestEntity);
    can('read', PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));
    can('create', PersonOfInterestEntity);
    can(['update', 'delete'], PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));

    can('readList', IncidentEntity);
    can('read', IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));
    can('create', IncidentEntity);
    can(['update', 'delete'], IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));
  },

  [UserRole.CLIENT_WRITER](user, { can }) {
    can('readList', UserEntity);
    can('read', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );

    can('readList', ClientEntity);
    can('read', ClientEntity, (subject) => subject.clientsUsers.map((item) => item.userId).includes(user.id));

    can('readList', PersonOfInterestEntity);
    can('read', PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));
    can('create', PersonOfInterestEntity);
    can(['update', 'delete'], PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));

    can('readList', IncidentEntity);
    can('read', IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));
    can('create', IncidentEntity);
    can(['update', 'delete'], IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));
  },

  [UserRole.CLIENT_READER](user, { can }) {
    can('readList', [UserEntity, ClientEntity, PersonOfInterestEntity, IncidentEntity]);

    can('read', UserEntity, (subject) =>
      subject.clientsUsers.map((item) => item.clientId).every((id) => user.clientIds.includes(id)),
    );
    can('read', ClientEntity, (subject) => subject.clientsUsers.map((item) => item.userId).includes(user.id));
    can('read', PersonOfInterestEntity, (subject) => user.clientIds.includes(subject.clientId));
    can('read', IncidentEntity, (subject) => user.clientIds.includes(subject.personOfInterest.clientId));
  },
};
