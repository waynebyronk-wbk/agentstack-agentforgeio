CREATE TABLE `audit_trail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`action` varchar(100) NOT NULL,
	`resource` varchar(100) NOT NULL,
	`resource_id` int,
	`ip_address` varchar(45),
	`user_agent` text,
	`device_fingerprint` varchar(255),
	`changes` json,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_trail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`company` varchar(255),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`zip_code` varchar(20),
	`country` varchar(100),
	`tax_id` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`data_type` varchar(100) NOT NULL,
	`data_key` varchar(255) NOT NULL,
	`data_value` text,
	`metadata` json,
	`source` varchar(100),
	`user_id` int,
	`tags` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`device_name` varchar(255),
	`device_type` varchar(50),
	`device_fingerprint` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`browser` varchar(100),
	`os` varchar(100),
	`is_authorized` boolean DEFAULT false,
	`last_access` timestamp NOT NULL DEFAULT (now()),
	`access_count` int DEFAULT 0,
	`location` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devices_device_fingerprint_unique` UNIQUE(`device_fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `error_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`error_type` varchar(100) NOT NULL,
	`error_code` varchar(50),
	`severity` enum('low','medium','high','critical') NOT NULL,
	`message` text NOT NULL,
	`stack_trace` text,
	`context` json,
	`auto_fixed` boolean DEFAULT false,
	`fix_action` text,
	`fixed_at` timestamp,
	`user_id` int,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `error_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`customer_id` int NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issue_date` timestamp NOT NULL,
	`due_date` timestamp NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`tax_rate` decimal(5,2) DEFAULT '0',
	`tax_amount` decimal(10,2) DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`paid_amount` decimal(10,2) DEFAULT '0',
	`paid_at` timestamp,
	`payment_method` varchar(50),
	`notes` text,
	`items` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `security_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` enum('unauthorized_access','info_usage_attempt','suspicious_activity','login_attempt','access_denied','data_breach_attempt') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`info_type` varchar(100),
	`ip_address` varchar(45),
	`user_agent` text,
	`device_fingerprint` varchar(255),
	`user_id` int,
	`description` text NOT NULL,
	`metadata` json,
	`resolved` boolean DEFAULT false,
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_type` enum('security','error','performance','business','system') NOT NULL,
	`severity` enum('info','warning','error','critical') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metadata` json,
	`read` boolean DEFAULT false,
	`read_at` timestamp,
	`action_required` boolean DEFAULT false,
	`action_taken` boolean DEFAULT false,
	`action_details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_alerts_id` PRIMARY KEY(`id`)
);
