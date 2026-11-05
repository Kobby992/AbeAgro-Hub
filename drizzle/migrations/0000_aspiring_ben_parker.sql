CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(80) NOT NULL,
	`phone_e164` varchar(20),
	`email` varchar(160),
	`message` text NOT NULL,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kobby_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` varchar(64) NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`messages` json NOT NULL,
	`tokens_in` int NOT NULL DEFAULT 0,
	`tokens_out` int NOT NULL DEFAULT 0,
	`quote_reference` varchar(20),
	`page_context` varchar(500),
	CONSTRAINT `kobby_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`name` varchar(80) NOT NULL,
	`company` varchar(120),
	`phone_e164` varchar(20),
	`email` varchar(160),
	`message` text,
	CONSTRAINT `partner_enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`source` enum('site','kobby','product-quick','partner','contact') NOT NULL,
	`name` varchar(80),
	`phone_e164` varchar(20),
	`location` varchar(180),
	`customer_type` varchar(40),
	`message` text,
	`items` json NOT NULL,
	`page_url` varchar(500),
	`utm` json,
	`user_agent` varchar(500),
	`wa_link_opened` boolean NOT NULL DEFAULT false,
	`status` enum('new','contacted','quoted','won','lost') NOT NULL DEFAULT 'new',
	`staff_note` text,
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_requests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE INDEX `kobby_conversations_started_at` ON `kobby_conversations` (`started_at`);--> statement-breakpoint
CREATE INDEX `quote_requests_created_at` ON `quote_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `quote_requests_status` ON `quote_requests` (`status`);