CREATE TABLE `doctor_schedules` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`doctor_id` int NOT NULL,
	`day_of_week` varchar(10) NOT NULL,
	`start_time` varchar(5) NOT NULL,
	`end_time` varchar(5) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT '2026-04-22 11:02:47.986',
	CONSTRAINT `doctor_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_records` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`symptoms` text NOT NULL,
	`diagnosis` text NOT NULL,
	`treatment` text,
	`prescription` text,
	`notes` text,
	`created_at` datetime NOT NULL DEFAULT '2026-04-22 11:02:47.986',
	CONSTRAINT `medical_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `doctorSchedules`;--> statement-breakpoint
DROP TABLE `medicalRecords`;--> statement-breakpoint
ALTER TABLE `doctors` DROP INDEX `doctors_licenseNumber_unique`;--> statement-breakpoint
ALTER TABLE `doctors` DROP INDEX `doctor_license_idx`;--> statement-breakpoint
ALTER TABLE `patients` DROP INDEX `patient_cpf_idx`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_patientId_patients_id_fk`;
--> statement-breakpoint
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_doctorId_doctors_id_fk`;
--> statement-breakpoint
ALTER TABLE `doctors` DROP FOREIGN KEY `doctors_specialtyId_specialties_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_appointmentId_appointments_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_patientId_patients_id_fk`;
--> statement-breakpoint
DROP INDEX `appointment_patientId_idx` ON `appointments`;--> statement-breakpoint
DROP INDEX `appointment_doctorId_idx` ON `appointments`;--> statement-breakpoint
DROP INDEX `appointment_date_idx` ON `appointments`;--> statement-breakpoint
DROP INDEX `appointment_status_idx` ON `appointments`;--> statement-breakpoint
DROP INDEX `doctor_specialtyId_idx` ON `doctors`;--> statement-breakpoint
DROP INDEX `doctor_email_idx` ON `doctors`;--> statement-breakpoint
DROP INDEX `notification_appointmentId_idx` ON `notifications`;--> statement-breakpoint
DROP INDEX `notification_patientId_idx` ON `notifications`;--> statement-breakpoint
DROP INDEX `notification_status_idx` ON `notifications`;--> statement-breakpoint
DROP INDEX `patient_email_idx` ON `patients`;--> statement-breakpoint
DROP INDEX `patient_phone_idx` ON `patients`;--> statement-breakpoint
DROP INDEX `specialty_name_idx` ON `specialties`;--> statement-breakpoint
DROP INDEX `email_idx` ON `users`;--> statement-breakpoint
DROP INDEX `openId_idx` ON `users`;--> statement-breakpoint
DROP INDEX `users_linkedDoctorId_idx` ON `users`;--> statement-breakpoint
DROP INDEX `users_linkedPatientId_idx` ON `users`;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE `doctors` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` MODIFY COLUMN `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `status` varchar(50) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `patients` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` MODIFY COLUMN `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `patients` MODIFY COLUMN `cpf` varchar(14) NOT NULL;--> statement-breakpoint
ALTER TABLE `specialties` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` serial AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(50) NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `appointments` ADD `patient_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `doctor_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `appointment_date` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.986' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `specialty_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `license_number` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `availability` json;--> statement-breakpoint
ALTER TABLE `doctors` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.985' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `message` text NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `scheduled_at` datetime;--> statement-breakpoint
ALTER TABLE `notifications` ADD `sent_at` datetime;--> statement-breakpoint
ALTER TABLE `notifications` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.986' NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` ADD `date_of_birth` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` ADD `medical_history` text;--> statement-breakpoint
ALTER TABLE `patients` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `patients` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.986' NOT NULL;--> statement-breakpoint
ALTER TABLE `specialties` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.985' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `open_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `login_method` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `linked_doctor_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `linked_patient_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` datetime DEFAULT '2026-04-22 11:02:47.983' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` datetime DEFAULT '2026-04-22 11:02:47.983' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_signed_in` datetime DEFAULT '2026-04-22 11:02:47.984' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_license_number_unique` UNIQUE(`license_number`);--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_open_id_unique` UNIQUE(`open_id`);--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `patientId`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `doctorId`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `appointmentDate`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `appointmentTime`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `diagnosis`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `treatment`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `appointments` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `specialtyId`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `licenseNumber`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `bio`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `isActive`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `doctors` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `appointmentId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `patientId`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `sentAt`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `scheduledFor`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `notifications` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `dateOfBirth`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `address`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `city`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `state`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `zipCode`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `emergencyContact`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `emergencyPhone`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `medicalHistory`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `allergies`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `currentMedications`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `isActive`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `patients` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `specialties` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `specialties` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `linkedDoctorId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `linkedPatientId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;