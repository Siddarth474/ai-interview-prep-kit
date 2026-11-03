/*
  Warnings:

  - The values [COMPANY,PROJECT] on the enum `QuestionCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionCategory_new" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'ROLE_SPECIFIC', 'SYSTEM_DESIGN');
ALTER TABLE "Requirement" ALTER COLUMN "category" TYPE "QuestionCategory_new" USING ("category"::text::"QuestionCategory_new");
ALTER TABLE "Question" ALTER COLUMN "category" TYPE "QuestionCategory_new" USING ("category"::text::"QuestionCategory_new");
ALTER TYPE "QuestionCategory" RENAME TO "QuestionCategory_old";
ALTER TYPE "QuestionCategory_new" RENAME TO "QuestionCategory";
DROP TYPE "public"."QuestionCategory_old";
COMMIT;
