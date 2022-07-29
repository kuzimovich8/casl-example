import { PersonOfInterestGender } from '@app/person-of-interest/person-of-interest.entity';

type SeedPersonOfInterest = {
  name: string;
  gender: PersonOfInterestGender;
  bornAt?: string;
  notes?: string;
};

export const personsOfInterest: SeedPersonOfInterest[] = [
  {
    name: 'Woodie Roten',
    bornAt: '1964-03-04T00:00:00',
    notes: "Subject made veiled threats in email request for Bill's autograph",
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Chris G Obert',
    bornAt: '1955-12-12T00:00:00',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Scott David Reid',
    bornAt: '1982-01-07T00:00:00',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Ricky Munzy',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Gagik Miqayelyan',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Kathryn J Salazar',
    bornAt: '1954-07-25T00:00:00',
    gender: PersonOfInterestGender.FEMALE,
  },
  {
    name: 'David W Hull',
    bornAt: '1969-01-02T00:00:00',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'George O Jones',
    bornAt: '1974-01-15T00:00:00',
    notes: 'Of late POI does not show indications of nearing or approach.',
    gender: PersonOfInterestGender.MALE,
  },
  {
    name: 'Florence R Lockhart',
    bornAt: '1963-05-15T00:00:00',
    gender: PersonOfInterestGender.FEMALE,
  },
  {
    name: 'Dwayne Barr',
    bornAt: '1980-05-09T00:00:00',
    gender: PersonOfInterestGender.MALE,
  },
];
