ALTER TABLE `users` ADD `global_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_globalId_unique` ON `users` (`global_id`);