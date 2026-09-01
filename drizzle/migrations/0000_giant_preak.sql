CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`user_role` text NOT NULL,
	`action` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text,
	`old_data` text,
	`new_data` text,
	`reason` text,
	`ip_address` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_created_idx` ON `audit_logs` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_action_idx` ON `audit_logs` (`tenant_id`,`action`);--> statement-breakpoint
CREATE TABLE `cash_flows` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cash_flows_tenant_created_idx` ON `cash_flows` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `cash_shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`user_id` text NOT NULL,
	`starting_cash` real NOT NULL,
	`expected_cash` real DEFAULT 0 NOT NULL,
	`actual_cash` real,
	`discrepancy` real DEFAULT 0,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`opened_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cash_shifts_tenant_outlet_status_idx` ON `cash_shifts` (`tenant_id`,`outlet_id`,`status`);--> statement-breakpoint
CREATE INDEX `cash_shifts_tenant_opened_idx` ON `cash_shifts` (`tenant_id`,`opened_at`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `category_tenant_idx` ON `categories` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`debt_limit` real DEFAULT 0 NOT NULL,
	`current_debt` real DEFAULT 0 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `customer_tenant_idx` ON `customers` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `debt_payments_tenant_customer_idx` ON `debt_payments` (`tenant_id`,`customer_id`);--> statement-breakpoint
CREATE TABLE `outlet_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`product_id` text NOT NULL,
	`current_stock` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outlet_product_unique_idx` ON `outlet_stock` (`outlet_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `outlets` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone` text,
	`is_main` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `outlet_tenant_idx` ON `outlets` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `platform_admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'superadmin' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_admins_username_unique` ON `platform_admins` (`username`);--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` text PRIMARY KEY DEFAULT 'global' NOT NULL,
	`starter_price` real DEFAULT 0 NOT NULL,
	`pro_price` real DEFAULT 99000 NOT NULL,
	`ultra_price` real DEFAULT 249000 NOT NULL,
	`support_phone` text DEFAULT '6281234567890',
	`support_email` text DEFAULT 'support@miegraine.id',
	`trial_days` integer DEFAULT 7 NOT NULL,
	`broadcast_banner` text DEFAULT '',
	`is_broadcast_active` integer DEFAULT false NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `product_price_tiers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_unit_id` text,
	`tier_name` text DEFAULT 'ecer' NOT NULL,
	`min_qty` real DEFAULT 1 NOT NULL,
	`price` real NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_unit_id`) REFERENCES `product_units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `price_tiers_product_idx` ON `product_price_tiers` (`product_id`);--> statement-breakpoint
CREATE INDEX `price_tiers_tenant_idx` ON `product_price_tiers` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `product_units` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`product_id` text NOT NULL,
	`unit_name` text NOT NULL,
	`conversion_qty` real NOT NULL,
	`barcode` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_units_product_idx` ON `product_units` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_units_tenant_idx` ON `product_units` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`barcode` text,
	`base_unit` text DEFAULT 'pcs' NOT NULL,
	`cost_price` real DEFAULT 0 NOT NULL,
	`has_imei` integer DEFAULT false NOT NULL,
	`min_stock_alert` real DEFAULT 5,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `product_tenant_barcode_idx` ON `products` (`tenant_id`,`barcode`);--> statement-breakpoint
CREATE INDEX `product_tenant_active_idx` ON `products` (`tenant_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `product_tenant_category_idx` ON `products` (`tenant_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`subtotal` real NOT NULL,
	`batch_number` text,
	`expired_date` integer,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_items_purchase_idx` ON `purchase_items` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `purchase_items_product_idx` ON `purchase_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`unit_name` text NOT NULL,
	`conversion_qty` real DEFAULT 1 NOT NULL,
	`qty` real NOT NULL,
	`purchase_price` real NOT NULL,
	`subtotal` real NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `po_items_po_idx` ON `purchase_order_items` (`purchase_order_id`);--> statement-breakpoint
CREATE INDEX `po_items_product_idx` ON `purchase_order_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`supplier_id` text,
	`po_number` text NOT NULL,
	`total_amount` real NOT NULL,
	`status` text DEFAULT 'COMPLETED' NOT NULL,
	`received_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_orders_tenant_idx` ON `purchase_orders` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`supplier_id` text,
	`supplier_name` text NOT NULL,
	`invoice_no` text NOT NULL,
	`purchase_date` integer NOT NULL,
	`total_amount` real NOT NULL,
	`payment_status` text DEFAULT 'PAID' NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`due_days` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_by_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchases_tenant_date_idx` ON `purchases` (`tenant_id`,`purchase_date`);--> statement-breakpoint
CREATE INDEX `purchases_tenant_outlet_idx` ON `purchases` (`tenant_id`,`outlet_id`);--> statement-breakpoint
CREATE TABLE `stock_mutations` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`qty_change` real NOT NULL,
	`stock_before` real NOT NULL,
	`stock_after` real NOT NULL,
	`reference_id` text,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_mut_tenant_prod_created_idx` ON `stock_mutations` (`tenant_id`,`product_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `stock_mut_tenant_outlet_idx` ON `stock_mutations` (`tenant_id`,`outlet_id`);--> statement-breakpoint
CREATE TABLE `stock_opname_items` (
	`id` text PRIMARY KEY NOT NULL,
	`opname_id` text NOT NULL,
	`product_id` text NOT NULL,
	`system_stock` real NOT NULL,
	`physical_stock` real NOT NULL,
	`difference_qty` real NOT NULL,
	`reason` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`opname_id`) REFERENCES `stock_opnames`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `opname_items_opname_idx` ON `stock_opname_items` (`opname_id`);--> statement-breakpoint
CREATE INDEX `opname_items_product_idx` ON `stock_opname_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `stock_opnames` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`user_id` text NOT NULL,
	`opname_no` text NOT NULL,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_opnames_tenant_idx` ON `stock_opnames` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `stock_transfer_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transfer_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_name` text DEFAULT 'pcs' NOT NULL,
	FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transfer_items_transfer_idx` ON `stock_transfer_items` (`transfer_id`);--> statement-breakpoint
CREATE INDEX `transfer_items_product_idx` ON `stock_transfer_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `stock_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`transfer_no` text NOT NULL,
	`source_outlet_id` text NOT NULL,
	`target_outlet_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`notes` text,
	`created_by_id` text NOT NULL,
	`received_by_id` text,
	`transferred_at` integer,
	`received_at` integer,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`received_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transfers_tenant_status_idx` ON `stock_transfers` (`tenant_id`,`status`);--> statement-breakpoint
CREATE INDEX `transfers_tenant_created_idx` ON `stock_transfers` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `store_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`owner_name` text NOT NULL,
	`owner_username` text NOT NULL,
	`owner_phone` text,
	`store_name` text NOT NULL,
	`business_type` text NOT NULL,
	`requested_plan` text DEFAULT 'pro' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`admin_notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `store_requests_owner_idx` ON `store_requests` (`owner_id`);--> statement-breakpoint
CREATE INDEX `store_requests_status_idx` ON `store_requests` (`status`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`phone` text,
	`address` text,
	`email` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `supplier_tenant_idx` ON `suppliers` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`business_type` text NOT NULL,
	`phone` text,
	`address` text,
	`receipt_header` text,
	`receipt_footer` text DEFAULT 'Terima kasih telah berbelanja',
	`subscription_plan` text DEFAULT 'starter' NOT NULL,
	`subscription_status` text DEFAULT 'trial' NOT NULL,
	`subscription_expires_at` integer,
	`trial_ends_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`product_id` text NOT NULL,
	`unit_name` text NOT NULL,
	`conversion_qty` real DEFAULT 1 NOT NULL,
	`qty` real NOT NULL,
	`price_per_unit` real NOT NULL,
	`cost_price` real NOT NULL,
	`subtotal` real NOT NULL,
	`imei_list` text,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tx_items_transaction_idx` ON `transaction_items` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `tx_items_product_idx` ON `transaction_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text NOT NULL,
	`user_id` text NOT NULL,
	`customer_id` text,
	`invoice_no` text NOT NULL,
	`subtotal` real NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`paid_amount` real NOT NULL,
	`change_amount` real DEFAULT 0 NOT NULL,
	`remaining_debt` real DEFAULT 0 NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`payment_status` text DEFAULT 'PAID' NOT NULL,
	`notes` text,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transaction_tenant_invoice_idx` ON `transactions` (`tenant_id`,`invoice_no`);--> statement-breakpoint
CREATE INDEX `transaction_tenant_created_idx` ON `transactions` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `transaction_tenant_outlet_idx` ON `transactions` (`tenant_id`,`outlet_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`outlet_id` text,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'cashier' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tenant_username_idx` ON `users` (`tenant_id`,`username`);