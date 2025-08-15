-- Добавляем столбец path в product_images и заполняем его из url/относительного пути
alter table if exists public.product_images
  add column if not exists path text;

-- Попытка извлечь ключ из полного URL (…/object/public/product-images/<key>) или оставить как есть
update public.product_images
set path = case
  when path is not null and path <> '' then path
  when url ~ 'product-images/' then regexp_replace(url, '.*product-images/', '')
  else url
end
where path is null;

-- На будущее: можно сделать url nullable (если хочешь хранить только path)
-- alter table public.product_images alter column url drop not null;
