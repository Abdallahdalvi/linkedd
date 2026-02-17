-- ============================================================
-- FULL DATA MIGRATION: Lovable Cloud → Self-Hosted Supabase
-- Target: https://supabase.dalvi.cloud (Project ID: default)
-- ============================================================
-- 
-- PREREQUISITE: Create these auth users FIRST in your self-hosted
-- Supabase dashboard (Authentication → Users → Add User) with
-- EXACT same UUIDs. You can use the Supabase Admin API:
--
--   curl -X POST 'https://supabase.dalvi.cloud/auth/v1/admin/users' \
--     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
--     -H 'apikey: YOUR_SERVICE_ROLE_KEY' \
--     -H 'Content-Type: application/json' \
--     -d '{"id":"f364ce3a-095f-4403-a3a5-f5b15e179c84","email":"fortengie@gmail.com","password":"TEMP_PASSWORD","email_confirm":true,"user_metadata":{"full_name":"abd"}}'
--
--   Repeat for:
--   UUID: c45ba178-8a72-4817-bf3e-8e653c748cc8 | dalviabdallah76@gmail.com | abdallah
--   UUID: 4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4 | fortengie2@gmail.com | family
--   UUID: b887f5ad-c5d1-40dc-9bb5-62712b9c57a2 | abdallah.dalvi@ubiqedge.com | Ubiqedge
--
-- IMPORTANT: If your handle_new_user() trigger auto-creates profiles
-- and user_roles, you may need to TRUNCATE those tables first before
-- running this script, OR use ON CONFLICT DO NOTHING (already included).
-- ============================================================

-- ─── 1. PROFILES ───
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_verified, is_suspended, created_at, updated_at) VALUES
('f364ce3a-095f-4403-a3a5-f5b15e179c84', 'fortengie@gmail.com', 'abd', NULL, 'client', false, false, '2026-01-06 05:06:54.17291+00', '2026-01-06 05:06:54.17291+00'),
('c45ba178-8a72-4817-bf3e-8e653c748cc8', 'dalviabdallah76@gmail.com', 'abdallah', NULL, 'client', false, false, '2026-01-06 12:37:01.123569+00', '2026-01-06 12:37:01.123569+00'),
('4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'fortengie2@gmail.com', 'family', NULL, 'client', false, false, '2026-01-15 15:46:39.013929+00', '2026-01-15 15:46:39.013929+00'),
('b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'abdallah.dalvi@ubiqedge.com', 'Ubiqedge', NULL, 'client', false, false, '2026-01-16 09:29:15.729394+00', '2026-01-16 09:29:15.729394+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 2. USER ROLES (super_admin, admin, client) ───
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('0f487238-c9e8-4b72-83a9-2f81e412d4bf', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'client', '2026-01-06 12:37:01.123569+00'),
('07590c70-ce8c-4f1f-b304-37a761a696ef', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'super_admin', '2026-01-13 16:18:47.033975+00'),
('d4108aa4-ac9d-44f5-ba50-26e84629e258', 'f364ce3a-095f-4403-a3a5-f5b15e179c84', 'admin', '2026-01-14 18:07:41.375607+00'),
('edbb3091-d47d-48de-9373-408c55bae1a8', '4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'client', '2026-01-15 15:46:39.013929+00'),
('3a953c40-8de7-4c66-828b-4c00dc6d021e', 'b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'client', '2026-01-16 09:29:15.729394+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 3. LINK PROFILES ───
INSERT INTO public.link_profiles (id, user_id, username, display_name, bio, avatar_url, cover_url, location, theme_preset, background_type, background_value, custom_colors, custom_fonts, social_links, is_public, is_password_protected, password_hash, total_views, seo_title, seo_description, og_image_url, meta_pixel_id, google_ads_id, created_at, updated_at) VALUES
('baf47e4d-9a3e-43cb-9248-c517ab56beec', 'f364ce3a-095f-4403-a3a5-f5b15e179c84', 'abdallah', 'abdallah', 'Professional Digital Marketing and AI Automation services', 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/avatars/1767690552880.jpg', '', '', 'forest', 'solid', '#052e16', '{"accent":"#22c55e","animations":true,"bg":"#052e16","buttonRadius":16,"buttonStyle":"filled","cardBg":"#14532d","gradient":false,"id":"forest","name":"Forest","text":"#dcfce7"}', '{}', '{"email":"fortengie@gmail.com","facebook":"","instagram":"","linkedin":"https://www.linkedin.com/in/abdallahdalvi","phone":"+917400239134","pinterest":"","snapchat":"","tiktok":"","twitter":"","website":"","youtube":""}', true, false, NULL, 29, NULL, NULL, NULL, NULL, NULL, '2026-01-06 05:07:02.048489+00', '2026-02-04 21:57:59.962386+00'),
('15318d84-d3c5-406e-b6c8-38f0516e25aa', 'c45ba178-8a72-4817-bf3e-8e653c748cc8', 'admin76', 'abdallah', NULL, NULL, NULL, NULL, 'default', 'image', 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/c45ba178-8a72-4817-bf3e-8e653c748cc8/backgrounds/1771125863450.png', '{"accent":"#1a1a1a","animations":true,"bg":"#ffffff","buttonRadius":16,"buttonStyle":"filled","cardBg":"#f5f5f5","category":"clean","gradient":false,"id":"minimal","name":"Minimal","text":"#1a1a1a","textColor":"#3b82f6"}', '{}', '{}', true, false, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-06 12:37:12.815045+00', '2026-02-15 03:24:27.837232+00'),
('e2cafdea-9846-4e5d-8d38-e3707b3c2ea8', '4e5fb6a7-23a0-4cac-a55b-3c57eccd6ec4', 'family', 'family', NULL, NULL, NULL, NULL, 'default', 'solid', '#ffffff', '{}', '{}', '{}', true, false, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-15 15:46:44.579936+00', '2026-01-15 15:46:44.579936+00'),
('611e9b63-cfb4-4923-b904-e3f55cd8a081', 'b887f5ad-c5d1-40dc-9bb5-62712b9c57a2', 'ubiqedge', 'Ubiqedge', NULL, NULL, NULL, NULL, 'default', 'solid', '#ffffff', '{}', '{}', '{}', true, false, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-16 09:29:58.71606+00', '2026-01-16 09:29:58.71606+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 4. BLOCKS ───
INSERT INTO public.blocks (id, profile_id, type, title, subtitle, url, thumbnail_url, icon, content, button_style, is_enabled, is_featured, open_in_new_tab, mobile_only, desktop_only, position, total_clicks, schedule_start, schedule_end, created_at, updated_at) VALUES
('a5585337-eab6-485a-8420-5169ad83efdb', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'carousel', 'work', '', NULL, NULL, NULL, '{"items":[{"id":"6cddb2f7-324a-4a80-aa58-c939f0fabbf2","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681011578.jpg","title":"","url":""},{"id":"8cc9440c-5199-4e3a-97c8-abd2eec15a28","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681021039.jpg","title":"","url":""},{"id":"946850d4-58f2-4969-b019-7cb3789fb932","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681070056.jpeg","title":"","url":""},{"id":"d7f1ac7b-a715-4b0a-b832-44363858e0d4","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681066803.png","title":"","url":""},{"id":"934850ae-6629-4c9c-90e0-1765e8e68160","image_url":"https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/carousel-images/1767681063317.png","title":"","url":""}]}', '{}', true, false, true, false, false, 0, 0, NULL, NULL, '2026-01-06 06:30:32.675775+00', '2026-01-06 13:07:07.544233+00'),
('1e94a361-8ce8-431c-b55a-cea2bba975c1', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'contact_email', 'Send Email', NULL, 'mailto:fortengie@gmail.com', NULL, NULL, '{"message":""}', '{}', false, false, true, false, false, 1, 0, NULL, NULL, '2026-01-06 06:31:51.488797+00', '2026-01-06 09:13:56.516256+00'),
('3ad6a401-aea1-4dce-b0f0-56ce5a4ee522', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'link', 'Website', NULL, 'https://ubiqedge.com', 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/block-thumbnails/1767682603272.png', NULL, '{}', '{}', true, false, true, false, false, 2, 0, NULL, NULL, '2026-01-06 06:57:04.346674+00', '2026-01-06 09:14:05.157557+00'),
('0805620c-73d0-4fed-ab6e-516fa95b2757', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'video', 'Watch my latest video', NULL, 'https://www.youtube.com/watch?v=qx2WBSPVorI', 'https://img.youtube.com/vi/qx2WBSPVorI/maxresdefault.jpg', NULL, '{"video_type":"youtube"}', '{}', true, false, true, false, false, 3, 0, NULL, NULL, '2026-01-06 07:36:24.125387+00', '2026-01-06 07:36:24.125387+00'),
('ed13628c-2a5c-47e3-b00f-28170583dd3f', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'contact_whatsapp', 'Message on WhatsApp', '', 'https://wa.me/917400239134', NULL, NULL, '{"message":""}', '{}', true, false, true, false, false, 4, 0, NULL, NULL, '2026-01-06 09:14:52.113066+00', '2026-01-06 09:15:07.161289+00'),
('4c4bb18f-78f8-4acb-aac2-c8f45bf3818e', 'baf47e4d-9a3e-43cb-9248-c517ab56beec', 'shop', 'Mental Health Book', '', 'https://ubiqedge.com', 'https://bjkfzcexylofmmupvvxt.supabase.co/storage/v1/object/public/profile-images/f364ce3a-095f-4403-a3a5-f5b15e179c84/products/1767695695111.jpg', NULL, '{"badge":"","currency":"USD","display_style":"card","original_price":20,"price":10,"product_type":"digital"}', '{}', true, false, true, false, false, 5, 0, NULL, NULL, '2026-01-06 10:35:45.587143+00', '2026-01-06 10:40:12.736897+00'),
('9faf045b-d89b-468a-b5b4-0a38be3f5f28', 'e2cafdea-9846-4e5d-8d38-e3707b3c2ea8', 'link', 'hi', NULL, 'https:\\www.hi.com', NULL, NULL, '{}', '{}', true, false, true, false, false, 0, 0, NULL, NULL, '2026-01-16 14:03:52.395204+00', '2026-01-16 14:03:52.395204+00'),
('4c96bdbb-0c34-4678-a6fe-6ece8a5740e8', '15318d84-d3c5-406e-b6c8-38f0516e25aa', 'text', 'hello', 'testing hello', NULL, NULL, NULL, '{"text_align":"right","text_size":"large"}', '{}', true, false, true, false, false, 0, 0, NULL, NULL, '2026-02-15 03:22:37.605118+00', '2026-02-15 03:22:37.605118+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 5. ADMIN SETTINGS ───
INSERT INTO public.admin_settings (id, setting_key, setting_value, updated_at, updated_by) VALUES
('2d105a7b-baa3-4218-8315-19c513c44e76', 'supabase_url', '"https://supabase.dalvi.cloud"', '2026-02-15 10:23:57.267274+00', NULL),
('93865c72-8738-4dfb-a3c6-a1190e28644b', 'supabase_anon_key', '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9.0WkOW6P5n4cmZxft1WHV-REaQ5C0WqaARxSTXFcq4Cc"', '2026-02-15 10:23:57.267274+00', NULL),
('83f708b8-04b1-4758-8758-7a37bd381bd5', 'supabase_project_id', '"default"', '2026-02-15 10:23:57.267274+00', NULL),
('6f195b86-f4e5-4b80-9fc0-774771667dd2', 'custom_supabase_connection', '{"anon_key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.RjCcUwp4SwNpo053J_FiDFQjjlmH1aUPeRwDKQQuZ68","project_id":"default","updated_at":"2026-02-15T15:42:15.501Z","url":"https://supabase.dalvi.cloud"}', '2026-02-15 10:25:57.136966+00', 'c45ba178-8a72-4817-bf3e-8e653c748cc8')
ON CONFLICT (id) DO NOTHING;

-- ─── 6. ANALYTICS EVENTS (all 133 records) ───
INSERT INTO public.analytics_events (id, profile_id, block_id, event_type, device_type, referrer, visitor_id, browser, country, city, created_at) VALUES
('bb8ca318-461d-441d-814e-df4c0e0a8b6f','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 11:33:32.042216+00'),
('4e3c6bca-3662-4b92-a8fd-04476db6afce','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 11:46:05.43058+00'),
('69fcdbd1-dd17-4ce1-aeff-98728f67750e','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 11:59:15.355901+00'),
('6be1d891-01a9-4a01-b886-bac827f718c1','baf47e4d-9a3e-43cb-9248-c517ab56beec','0805620c-73d0-4fed-ab6e-516fa95b2757','click','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 11:59:25.740378+00'),
('431cf843-9aa3-4e98-8475-02f23f8499ad','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://www.facebook.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:02:32.384244+00'),
('0933a703-2c11-4c4f-908a-61bbf4dc5537','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:02:43.624047+00'),
('f5ce727f-d43a-4b8c-a77b-5fc09bdc0618','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:03:37.232364+00'),
('c5d72847-dec8-4dec-a010-e50e35e08405','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:04:38.027916+00'),
('19a0907c-e5c0-443c-89b6-68c3f89b00f4','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:10:44.529049+00'),
('939e37d4-fd58-4293-a7e6-171c4cfd2e8a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:11:27.942814+00'),
('925e990d-589c-4abd-9beb-639d713c2ad9','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:11:42.017415+00'),
('b2ec1a2e-2a04-4cc4-ad89-a1a215af1fa7','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:12:41.660799+00'),
('9ab09f7d-9bc3-46a6-943c-15f3bcfb2fdd','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://www.google.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:12:45.906447+00'),
('ba260c7f-fad8-4353-a84d-663de96d26ad','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:18:58.731585+00'),
('7f9324ba-ffad-4c62-817a-9b751a23accf','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:30:19.043143+00'),
('3b94c95d-9fd4-4da6-82bd-ee44d9c33918','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:36:08.595721+00'),
('775ae63d-7de7-4440-af6f-17447e8c53a0','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:39:46.617045+00'),
('c5a0d841-cca4-4a41-9dc3-a4d376f9d8ea','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:55:57.621017+00'),
('e2221bbd-1f34-44af-9bf0-93deda85c549','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:56:08.45924+00'),
('dd057efb-2608-43f5-a539-6fe012d868df','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:56:16.904616+00'),
('b2c8e3f8-3546-4b99-a8d3-4235aac54dca','baf47e4d-9a3e-43cb-9248-c517ab56beec','3ad6a401-aea1-4dce-b0f0-56ce5a4ee522','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 12:56:31.184864+00'),
('a38cac41-718d-445d-a0a4-00aec6c91d17','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 12:57:24.504277+00'),
('db20dd78-a01f-4fc2-a9cc-c0f5321e62b2','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 13:06:32.906163+00'),
('c1b57458-fa4f-453e-894b-17b60fc28cb0','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 13:07:16.227169+00'),
('4540b73e-016d-42a9-9cdb-858ad86db47c','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 13:09:36.460351+00'),
('cb0d33c5-1007-4279-8e45-fae2674b5d80','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 14:54:47.825736+00'),
('167a2c01-477b-42f4-9c93-ecc135de3c92','baf47e4d-9a3e-43cb-9248-c517ab56beec','0805620c-73d0-4fed-ab6e-516fa95b2757','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 14:54:56.569712+00'),
('707921b8-b7ac-4446-907a-557a8bcb778f','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 14:55:02.332424+00'),
('6d21f819-0906-481a-bf39-2883677331e1','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 14:55:08.501666+00'),
('fd224580-3539-48e9-8aaa-aa9e6a7d7f20','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 14:55:18.622692+00'),
('c4ffa80e-bc4b-42bd-825c-13042dafa106','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 14:55:22.166458+00'),
('9244acb7-b5ce-4626-a508-8de25e6722c6','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:00:13.107968+00'),
('4b2302f6-cd1e-4854-a626-5838a5374348','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-06 15:08:24.177376+00'),
('9f70e6bd-7b0f-4306-a116-ee8e19f6ca32','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:08:26.882091+00'),
('847b91f6-bd4c-47e5-9021-b09664a90ebe','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:08:29.446297+00'),
('55e32fe2-80d2-4c33-b0e5-11eb53f7f035','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:08:31.933022+00'),
('6d71f7ff-79b4-4f71-af08-df4addccee62','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:08:33.769417+00'),
('84074d8d-bb4d-4ff0-92da-bdac95bcb73f','baf47e4d-9a3e-43cb-9248-c517ab56beec','3ad6a401-aea1-4dce-b0f0-56ce5a4ee522','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:08:37.366912+00'),
('ad888bf2-43f2-4459-9c28-8725728053bd','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-06 15:35:25.99811+00'),
('4a720cd3-0bc0-4913-9aac-d89b4a96ca44','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-07 06:24:00.367516+00'),
('23e4b472-0b4b-4b24-a6ac-f57a9baed669','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 09:44:21.993598+00'),
('1bbac20b-0225-4a64-9c70-4e43ce9202a9','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 09:44:49.468032+00'),
('a3f1dd89-e991-4b3b-ad0a-d0aea85e86f0','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-07 10:59:52.435187+00'),
('3cfaf77c-883b-4ecc-b9b3-9f3caa9c8485','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 12:00:43.025819+00'),
('b431ad37-fd1b-457a-a44f-eb26a4f3fd9d','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 12:01:43.357846+00'),
('0cd1cdb5-e668-4fc6-bbf2-c348359eddf6','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 12:11:15.244574+00'),
('6dcaaa0a-c19e-4a6f-b99e-7f3f377816c7','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 12:12:13.379233+00'),
('efdf4dd3-95e2-47e7-8ff3-2b72f66f45d3','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://app.onecompiler.com/',NULL,NULL,NULL,NULL,'2026-01-07 12:20:55.810783+00'),
('670e7cdd-7c49-4db9-8a9b-8d319e2b90da','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','desktop','https://app.onecompiler.com/',NULL,NULL,NULL,NULL,'2026-01-07 12:21:16.953572+00'),
('aa2de597-9381-4652-a00f-7a99815616d9','baf47e4d-9a3e-43cb-9248-c517ab56beec','3ad6a401-aea1-4dce-b0f0-56ce5a4ee522','click','desktop','https://app.onecompiler.com/',NULL,NULL,NULL,NULL,'2026-01-07 12:21:20.532399+00'),
('ac8f6fcf-8c49-4e0a-95f1-930d58943f45','baf47e4d-9a3e-43cb-9248-c517ab56beec','0805620c-73d0-4fed-ab6e-516fa95b2757','click','desktop','https://app.onecompiler.com/',NULL,NULL,NULL,NULL,'2026-01-07 12:21:23.301453+00'),
('0b4b740d-1181-4fef-b0a3-0cd89b962218','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-07 20:28:39.190699+00'),
('ed0f1b25-d438-45c4-83c1-6a85a6abc37b','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 13:14:46.39417+00'),
('ff73d482-b438-4812-aae1-0d8f90d02a48','15318d84-d3c5-406e-b6c8-38f0516e25aa',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:25:11.799582+00'),
('b0784cb8-e246-473a-aed8-5f57d2c4c07a','15318d84-d3c5-406e-b6c8-38f0516e25aa',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:48:36.399892+00'),
('8d98579f-d059-4aaf-958e-e0a5d8039d0d','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:49:00.864972+00'),
('bba4eea2-eb48-4c83-8b65-668b1ff981fb','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:53:18.690337+00'),
('0958198e-74fe-426a-a9cf-a6425902e5cc','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:53:44.252695+00'),
('237d7bbb-9b89-4008-a24f-e88db641d722','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:58:59.279853+00'),
('7a02284e-9d49-498e-9169-154fd9da68a2','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 15:59:04.647093+00'),
('dd39bdd9-4541-41c1-aa41-a09832ec7d0e','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 16:07:53.020695+00'),
('2183744f-c6e4-4a0c-be99-decaae9ca6b4','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 16:07:58.945738+00'),
('27b46764-61b3-4a1e-928e-7cb33dbc267f','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 16:08:02.225871+00'),
('c1b2d8ca-01f9-49ea-93f3-a5cb113f182a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://lovable.dev/',NULL,NULL,NULL,NULL,'2026-01-09 18:14:09.744882+00'),
('d0664746-a066-44f6-80c0-22c5aeef49d4','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://lovable.dev/',NULL,NULL,NULL,NULL,'2026-01-09 18:16:42.598478+00'),
('f29df44a-a245-476d-9e73-c55dba02092e','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-09 18:51:14.040501+00'),
('8af04e96-6b53-4a1b-9717-557efb17fe67','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 19:00:02.100391+00'),
('2dfee0fb-ecf6-4718-9477-4e2690c3210c','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 19:00:08.203206+00'),
('f1c94f5b-70a8-4a12-ba8a-26a87747b194','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 19:00:10.054713+00'),
('06b8567d-5039-4383-8c6f-3ae0c63f223a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 19:06:04.295705+00'),
('597777b4-5d21-46fb-8069-318221dbdf49','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-09 19:06:07.919247+00'),
('c6c2881b-be7c-4b45-9f01-2f8f29cac479','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:46:17.578111+00'),
('ae6f535e-cefb-4931-ac9d-61412ab9d0bb','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:46:24.389786+00'),
('79272caf-b6af-4b71-9d67-61fae653f238','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:48:39.285786+00'),
('edee1130-e86f-49b6-87d9-1dd31c18776b','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:48:50.810308+00'),
('5041803d-7869-46ec-a9c5-fd044bf135a5','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:48:56.620585+00'),
('792cb3b4-508f-4134-ab3f-d94b8637cf15','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:49:01.549778+00'),
('2fe269de-fec9-4f4e-8ee9-d7fe8a5dd1e1','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 10:52:55.835111+00'),
('3ddbf676-74d2-4e6a-8ffe-be06637dfe25','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 10:55:30.013636+00'),
('4b6f8fcf-163e-439d-b281-4b1b1fd69056','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:01:50.243453+00'),
('9283a181-afa8-41ff-b206-5ba51f3a22ba','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:01:56.744183+00'),
('3e057d44-2757-47b0-9cbe-36aa400f3892','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:02:13.052537+00'),
('da263f69-6194-43a3-b388-a8a2147309c3','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:02:18.116612+00'),
('0324b062-6816-4b0c-8ddd-55eedf0eadc9','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:06:23.348391+00'),
('f0b12146-82d9-4822-bcf7-26f2a303093e','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:06:32.781012+00'),
('a0012abd-0983-4e7c-9667-ee023560f1c8','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:06:37.536301+00'),
('61dda95b-7d72-4e14-81db-cb3adf5aff27','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://cool.dalvi.cloud/',NULL,NULL,NULL,NULL,'2026-01-10 11:07:44.113786+00'),
('81f821f5-ea35-4422-a577-ef1e6c6ac925','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:08:58.41183+00'),
('45693ae3-34d6-421d-b392-08a71a836a11','15318d84-d3c5-406e-b6c8-38f0516e25aa',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:09:07.254901+00'),
('6ff4acd0-f526-4ed8-adbb-ff243312cce6','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:40:57.228819+00'),
('15902120-2b6a-4361-b839-a449dfb61903','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:40:58.541865+00'),
('f2a74546-3e89-4a74-893e-b17f7614d85f','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:41:01.953926+00'),
('d4a64da6-c5eb-4f17-bbdf-349c5e5e7d53','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:44:47.695668+00'),
('04a0ae30-eb7f-4186-afcb-dcdd4b609c28','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 11:44:55.370539+00'),
('cd16b492-1ea7-4c7e-b63a-29e892b03ec9','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:36:55.414928+00'),
('95dcb52c-b22d-4f68-9532-6a4c3f9937e8','baf47e4d-9a3e-43cb-9248-c517ab56beec','3ad6a401-aea1-4dce-b0f0-56ce5a4ee522','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:37:06.039354+00'),
('399bcb18-929e-49c9-95dd-358f5741ef3b','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:37:11.475061+00'),
('200cbacf-e345-47f8-a071-07d2e08d9cad','baf47e4d-9a3e-43cb-9248-c517ab56beec','4c4bb18f-78f8-4acb-aac2-c8f45bf3818e','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:37:18.714516+00'),
('8849e2b3-3761-43a6-93a2-66a81147433f','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:37:20.954144+00'),
('980cb51c-1953-4261-a646-ed320ed9601c','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-10 12:37:27.327252+00'),
('92cba7d2-775e-4065-8c2b-c97d55fc11ca','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:12:02.529587+00'),
('78c823f0-d19a-48f2-944c-97a9ca92a9a3','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:12:04.954663+00'),
('92ca8eef-3cd5-4e79-bdd1-72f2c62fe83c','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:13:56.31679+00'),
('29084d98-8e98-41b6-821e-9129abec973c','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:13:58.567086+00'),
('b4f64506-f05c-4294-948e-cbfcb4ab7ad2','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:15:22.623238+00'),
('01dc5113-a8af-48b1-9b0b-0eb20b355f76','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:15:23.773972+00'),
('7725e613-669d-40ae-84e0-bc60f13a9213','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:15:24.895885+00'),
('6030d60c-05b4-48da-bf99-009ca97cfcd8','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 15:40:04.710368+00'),
('5675fa33-007d-47b7-983c-19044d1fc4f1','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 16:21:23.968509+00'),
('54d7fed5-c711-4862-b4d9-7867dd987e51','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 16:58:50.318662+00'),
('eee53d45-dda5-40cf-9a23-bd1b5fe53b15','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 16:58:59.348077+00'),
('4573d92e-27d8-479d-b95d-686311acf3f7','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 17:15:29.630784+00'),
('8dc2136c-d95c-4ab7-a8ea-a1537e1364b9','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 17:15:32.82346+00'),
('d73997c1-bc4b-4d7f-8956-e74412333738','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 17:15:39.234948+00'),
('593afa47-9580-4918-8ca9-852ce0966df2','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-10 17:21:52.062636+00'),
('fcb094dd-f8a9-464e-827e-a0685871405f','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://lovable.dev/',NULL,NULL,NULL,NULL,'2026-01-11 11:42:03.537145+00'),
('9a7710e1-5d77-4cc0-b939-4c2afbfd532e','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-12 14:43:59.846113+00'),
('a6c30883-9d62-4652-bfd4-c6a83d5cde74','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-12 14:45:55.127249+00'),
('5ab33f4e-aaab-4ec5-9294-6a78aadd97be','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://50e6d70f-75f4-43fe-b6c5-c243769d7516.lovableproject.com/abdallah/',NULL,NULL,NULL,NULL,'2026-01-12 14:49:58.680972+00'),
('ad37199a-d52c-4081-8734-29c6ad324a37','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop','https://50e6d70f-75f4-43fe-b6c5-c243769d7516.lovableproject.com/abdallah/',NULL,NULL,NULL,NULL,'2026-01-12 14:51:32.366183+00'),
('0dc390c9-f6d6-4f6c-8f42-a0ed5674998a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-12 15:18:05.133636+00'),
('fb6688ee-155f-42bf-9c26-d03bd675ae38','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 15:31:16.125031+00'),
('f12ca27b-2526-44c4-b12e-917e60f2496a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-01-12 15:48:37.63305+00'),
('5631ab30-5b8e-4c68-91b5-a7ee3cf47144','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 16:19:55.280245+00'),
('5a0b81a4-dab7-4d2a-acdc-979e99ac0acf','baf47e4d-9a3e-43cb-9248-c517ab56beec','ed13628c-2a5c-47e3-b00f-28170583dd3f','click','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 16:20:14.794265+00'),
('88f96780-22bc-4582-a6a9-10ff4390d368','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 17:21:30.977906+00'),
('6e2ade42-025a-4434-a8f9-301496bc7b0b','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 17:21:34.292294+00'),
('1d597a2d-cde0-4720-8522-5086b87b4980','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile',NULL,NULL,NULL,NULL,NULL,'2026-01-12 18:20:28.575672+00'),
('2d3c91aa-4a97-4de2-a04c-ae648fc53ed2','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-18 15:55:44.95563+00'),
('20d5b849-edbc-4b15-81d7-ec9f9a6f2919','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','http://m.facebook.com',NULL,NULL,NULL,NULL,'2026-01-20 15:01:15.296892+00'),
('a0521fae-276e-4e1c-9dac-be97875a7d5a','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','http://m.facebook.com',NULL,NULL,NULL,NULL,'2026-01-20 15:05:04.776251+00'),
('45f4da9a-8d29-46bc-a920-4a554965a28d','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','mobile','https://l.instagram.com/',NULL,NULL,NULL,NULL,'2026-01-24 07:23:51.592167+00'),
('d4005f92-2880-4875-b300-cc98c72b158d','baf47e4d-9a3e-43cb-9248-c517ab56beec',NULL,'view','desktop',NULL,NULL,NULL,NULL,NULL,'2026-02-04 21:57:59.88522+00')
ON CONFLICT (id) DO NOTHING;

-- ─── 7. URL REWRITE (run AFTER all inserts above) ───
-- Replace Lovable Cloud storage URLs with your self-hosted Supabase
UPDATE public.link_profiles SET avatar_url = REPLACE(avatar_url, 'https://bjkfzcexylofmmupvvxt.supabase.co', 'https://supabase.dalvi.cloud') WHERE avatar_url LIKE '%bjkfzcexylofmmupvvxt%';
UPDATE public.link_profiles SET background_value = REPLACE(background_value, 'https://bjkfzcexylofmmupvvxt.supabase.co', 'https://supabase.dalvi.cloud') WHERE background_value LIKE '%bjkfzcexylofmmupvvxt%';
UPDATE public.blocks SET thumbnail_url = REPLACE(thumbnail_url, 'https://bjkfzcexylofmmupvvxt.supabase.co', 'https://supabase.dalvi.cloud') WHERE thumbnail_url LIKE '%bjkfzcexylofmmupvvxt%';
UPDATE public.blocks SET content = REPLACE(content::text, 'https://bjkfzcexylofmmupvvxt.supabase.co', 'https://supabase.dalvi.cloud')::jsonb WHERE content::text LIKE '%bjkfzcexylofmmupvvxt%';

-- ============================================================
-- DONE! Summary:
--   4 profiles
--   5 user_roles (1 super_admin, 1 admin, 3 client)
--   4 link_profiles
--   8 blocks
--   4 admin_settings
--   133 analytics_events
--   All image URLs rewritten to supabase.dalvi.cloud
-- ============================================================
