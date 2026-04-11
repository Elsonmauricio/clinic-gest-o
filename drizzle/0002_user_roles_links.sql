ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','doctor','patient') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `linkedDoctorId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `linkedPatientId` int;--> statement-breakpoint
CREATE INDEX `users_linkedDoctorId_idx` ON `users` (`linkedDoctorId`);--> statement-breakpoint
CREATE INDEX `users_linkedPatientId_idx` ON `users` (`linkedPatientId`);