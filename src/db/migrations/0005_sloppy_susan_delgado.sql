ALTER TABLE `users` ADD `role` text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `verified` integer DEFAULT false;