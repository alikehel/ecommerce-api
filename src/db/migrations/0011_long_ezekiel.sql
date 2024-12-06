PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`phone` text,
	`password` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`avatar` text,
	`verified` integer DEFAULT false,
	`kyc_card_front` text,
	`kyc_card_back` text,
	`kyc_selfie` text,
	`balance` integer DEFAULT 0 NOT NULL,
	`global_id` text,
	CONSTRAINT "one_of_email_or_phone_not_null" CHECK("__new_users"."email" IS NOT NULL OR "__new_users"."phone" IS NOT NULL)
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "phone", "password", "first_name", "last_name", "role", "avatar", "verified", "kyc_card_front", "kyc_card_back", "kyc_selfie", "balance", "global_id") SELECT "id", "email", "phone", "password", "first_name", "last_name", "role", "avatar", "verified", "kyc_card_front", "kyc_card_back", "kyc_selfie", "balance", "global_id" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_globalId_unique` ON `users` (`global_id`);