CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`doctorId` int NOT NULL,
	`appointmentDate` date NOT NULL,
	`appointmentTime` time NOT NULL,
	`status` enum('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`diagnosis` text,
	`treatment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctorSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctorSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`specialtyId` int NOT NULL,
	`licenseNumber` varchar(50) NOT NULL,
	`bio` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_licenseNumber_unique` UNIQUE(`licenseNumber`),
	CONSTRAINT `doctor_license_idx` UNIQUE(`licenseNumber`)
);
--> statement-breakpoint
CREATE TABLE `medicalRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`appointmentId` int,
	`recordDate` timestamp NOT NULL DEFAULT (now()),
	`symptoms` text,
	`diagnosis` text,
	`treatment` text,
	`prescription` text,
	`notes` longtext,
	`nextAppointmentDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicalRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appointmentId` int NOT NULL,
	`patientId` int NOT NULL,
	`type` enum('reminder','confirmation','cancellation','rescheduling') NOT NULL,
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`scheduledFor` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`dateOfBirth` date NOT NULL,
	`cpf` varchar(20) NOT NULL,
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(20),
	`emergencyContact` varchar(255),
	`emergencyPhone` varchar(20),
	`medicalHistory` longtext,
	`allergies` text,
	`currentMedications` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_cpf_unique` UNIQUE(`cpf`),
	CONSTRAINT `patient_cpf_idx` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doctorSchedules` ADD CONSTRAINT `doctorSchedules_doctorId_doctors_id_fk` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_specialtyId_specialties_id_fk` FOREIGN KEY (`specialtyId`) REFERENCES `specialties`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicalRecords` ADD CONSTRAINT `medicalRecords_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medicalRecords` ADD CONSTRAINT `medicalRecords_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_appointmentId_appointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `appointment_patientId_idx` ON `appointments` (`patientId`);--> statement-breakpoint
CREATE INDEX `appointment_doctorId_idx` ON `appointments` (`doctorId`);--> statement-breakpoint
CREATE INDEX `appointment_date_idx` ON `appointments` (`appointmentDate`);--> statement-breakpoint
CREATE INDEX `appointment_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `schedule_doctorId_idx` ON `doctorSchedules` (`doctorId`);--> statement-breakpoint
CREATE INDEX `doctor_specialtyId_idx` ON `doctors` (`specialtyId`);--> statement-breakpoint
CREATE INDEX `doctor_email_idx` ON `doctors` (`email`);--> statement-breakpoint
CREATE INDEX `record_patientId_idx` ON `medicalRecords` (`patientId`);--> statement-breakpoint
CREATE INDEX `record_appointmentId_idx` ON `medicalRecords` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `record_date_idx` ON `medicalRecords` (`recordDate`);--> statement-breakpoint
CREATE INDEX `notification_appointmentId_idx` ON `notifications` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `notification_patientId_idx` ON `notifications` (`patientId`);--> statement-breakpoint
CREATE INDEX `notification_status_idx` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `patient_email_idx` ON `patients` (`email`);--> statement-breakpoint
CREATE INDEX `patient_phone_idx` ON `patients` (`phone`);--> statement-breakpoint
CREATE INDEX `specialty_name_idx` ON `specialties` (`name`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);