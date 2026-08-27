/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `organizations` ADD COLUMN `logo` TEXT NULL,
    ADD COLUMN `primaryColor` VARCHAR(20) NULL,
    ADD COLUMN `slug` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `organizations_slug_key` ON `organizations`(`slug`);
