ALTER TABLE `products` ADD `user_id` integer NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `services` ADD `user_id` integer NOT NULL REFERENCES users(id);