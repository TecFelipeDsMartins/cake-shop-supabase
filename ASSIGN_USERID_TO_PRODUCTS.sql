-- Assign current user to all products with NULL user_id
-- Replace 'YOUR_USER_UUID_HERE' with your actual user UUID from auth.users

UPDATE products 
SET user_id = 'YOUR_USER_UUID_HERE' 
WHERE user_id IS NULL;

UPDATE ingredients
SET user_id = 'YOUR_USER_UUID_HERE'
WHERE user_id IS NULL;

UPDATE recipes
SET user_id = 'YOUR_USER_UUID_HERE'
WHERE user_id IS NULL;

UPDATE technical_sheets
SET user_id = 'YOUR_USER_UUID_HERE'
WHERE user_id IS NULL;
