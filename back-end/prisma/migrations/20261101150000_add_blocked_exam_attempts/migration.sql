CREATE TABLE `blocked_exam_attempts` (
    `id` CHAR(36) NOT NULL,
    `examId` CHAR(36) NOT NULL,
    `studentName` VARCHAR(100) NOT NULL,
    `studentPhone` VARCHAR(20) NOT NULL,
    `matchedStudentName` VARCHAR(100) NOT NULL,
    `reason` VARCHAR(40) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blocked_exam_attempts_examId_createdAt_idx`(`examId`, `createdAt`),
    INDEX `blocked_exam_attempts_studentPhone_idx`(`studentPhone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `blocked_exam_attempts`
    ADD CONSTRAINT `blocked_exam_attempts_examId_fkey`
    FOREIGN KEY (`examId`) REFERENCES `exams`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
