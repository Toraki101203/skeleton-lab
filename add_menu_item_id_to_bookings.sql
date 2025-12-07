-- Add menu_item_id column to bookings table
alter table public.bookings 
add column menu_item_id text;

-- Comment on column
comment on column public.bookings.menu_item_id is 'ID of the menu item (course) selected for this booking';
