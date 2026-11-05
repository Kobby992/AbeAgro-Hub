CREATE TABLE `kobby_daily_usage` (
	`day` varchar(10) NOT NULL,
	`messages` int NOT NULL DEFAULT 0,
	CONSTRAINT `kobby_daily_usage_day` PRIMARY KEY(`day`)
);
--> statement-breakpoint
ALTER TABLE `kobby_conversations` ADD `tokens_cached` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `kobby_conversations_session_id` ON `kobby_conversations` (`session_id`);