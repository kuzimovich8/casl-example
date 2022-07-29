import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1659038449456 implements MigrationInterface {
  name = 'Init1659038449456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Incident" ("number" SERIAL NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "observedAt" TIMESTAMP WITH TIME ZONE, "notes" text, "personOfInterestId" uuid NOT NULL, CONSTRAINT "PK_1639834f13b16d92d6eafbb9b2a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_f8a8262d9debe8a3d82b5134d6" ON "Incident" ("createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_35668024aaf710c8e0b9826596" ON "Incident" ("deletedAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_792de5445785ec1c88126c314e" ON "Incident" ("observedAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_7dcd8aea0e5bc699528a4cddbc" ON "Incident" ("personOfInterestId") `);
    await queryRunner.query(`CREATE TYPE "public"."PersonOfInterestGender" AS ENUM('MALE', 'FEMALE', 'OTHER')`);
    await queryRunner.query(
      `CREATE TABLE "PersonOfInterest" ("number" SERIAL NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(128), "bornAt" date, "gender" "public"."PersonOfInterestGender", "notes" text, "clientId" uuid NOT NULL, CONSTRAINT "PK_f0fdef4e8b8698654704b1623e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_21374259f73c269d94abf40ced" ON "PersonOfInterest" ("createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_24c2dc12a6b258e0c3a7331031" ON "PersonOfInterest" ("deletedAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_d4976d7498dbead0067336940d" ON "PersonOfInterest" ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_b66a04404556d40acff66a2573" ON "PersonOfInterest" ("clientId") `);
    await queryRunner.query(`CREATE TYPE "public"."ClientStatus" AS ENUM('ACTIVE', 'INACTIVE')`);
    await queryRunner.query(
      `CREATE TABLE "Client" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "status" "public"."ClientStatus" NOT NULL, "name" character varying(128) NOT NULL, CONSTRAINT "PK_b79874c8d411b839b9ccc301972" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_cf706ce9e339bbaff9653274dd" ON "Client" ("deletedAt") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_08bd5491ae271078053ef4ebd2" ON "Client" ("name") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "ClientsUsers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "clientId" uuid NOT NULL, CONSTRAINT "PK_48b2e67767eac13c9b98572137f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "public"."UserStatus" AS ENUM('ACTIVE', 'INACTIVE')`);
    await queryRunner.query(
      `CREATE TYPE "public"."UserRole" AS ENUM('SUPER_ADMIN', 'CLIENT_ADMIN', 'CLIENT_WRITER', 'CLIENT_READER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying(32) NOT NULL, "firstName" character varying(32) NOT NULL, "lastName" character varying(32) NOT NULL, "status" "public"."UserStatus" NOT NULL, "role" "public"."UserRole" NOT NULL, CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_33584bb8f20585e49ae6f63d9f" ON "User" ("deletedAt") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5686f9f9d260339205b584dc87" ON "User" ("email") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "Auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "token" character varying(256) NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_fee4a2ee6693dbef79c39ff336d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Incident" ADD CONSTRAINT "FK_7dcd8aea0e5bc699528a4cddbc4" FOREIGN KEY ("personOfInterestId") REFERENCES "PersonOfInterest"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "PersonOfInterest" ADD CONSTRAINT "FK_b66a04404556d40acff66a2573c" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ClientsUsers" ADD CONSTRAINT "FK_9352d4305d912981faf9910a28d" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ClientsUsers" ADD CONSTRAINT "FK_a13b8ef11f9ba12a91d53fc3319" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Auth" ADD CONSTRAINT "FK_10b96a5538c04c5c9a93f33b960" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Auth" DROP CONSTRAINT "FK_10b96a5538c04c5c9a93f33b960"`);
    await queryRunner.query(`ALTER TABLE "ClientsUsers" DROP CONSTRAINT "FK_a13b8ef11f9ba12a91d53fc3319"`);
    await queryRunner.query(`ALTER TABLE "ClientsUsers" DROP CONSTRAINT "FK_9352d4305d912981faf9910a28d"`);
    await queryRunner.query(`ALTER TABLE "PersonOfInterest" DROP CONSTRAINT "FK_b66a04404556d40acff66a2573c"`);
    await queryRunner.query(`ALTER TABLE "Incident" DROP CONSTRAINT "FK_7dcd8aea0e5bc699528a4cddbc4"`);
    await queryRunner.query(`DROP TABLE "Auth"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5686f9f9d260339205b584dc87"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_33584bb8f20585e49ae6f63d9f"`);
    await queryRunner.query(`DROP TABLE "User"`);
    await queryRunner.query(`DROP TYPE "public"."UserRole"`);
    await queryRunner.query(`DROP TYPE "public"."UserStatus"`);
    await queryRunner.query(`DROP TABLE "ClientsUsers"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_08bd5491ae271078053ef4ebd2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf706ce9e339bbaff9653274dd"`);
    await queryRunner.query(`DROP TABLE "Client"`);
    await queryRunner.query(`DROP TYPE "public"."ClientStatus"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b66a04404556d40acff66a2573"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d4976d7498dbead0067336940d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_24c2dc12a6b258e0c3a7331031"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_21374259f73c269d94abf40ced"`);
    await queryRunner.query(`DROP TABLE "PersonOfInterest"`);
    await queryRunner.query(`DROP TYPE "public"."PersonOfInterestGender"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7dcd8aea0e5bc699528a4cddbc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_792de5445785ec1c88126c314e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_35668024aaf710c8e0b9826596"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f8a8262d9debe8a3d82b5134d6"`);
    await queryRunner.query(`DROP TABLE "Incident"`);
  }
}
