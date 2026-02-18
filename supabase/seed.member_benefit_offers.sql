-- Member benefit offers seed template
-- Run in Supabase SQL Editor after migrations are applied.

insert into public.member_benefit_offers (
  id,
  kind,
  title,
  description,
  cta_label,
  cta_url,
  coupon_code,
  available_for,
  is_active,
  priority,
  starts_at,
  ends_at
)
values
(
  'subscription-discount-2026q1',
  'subscription_discount',
  'Member Subscription Discount',
  'Active paid members can renew at a discounted rate this term.',
  'Renew Plan',
  'https://www.25maths.com/membership/',
  null,
  'paid',
  true,
  10,
  null,
  null
),
(
  'coursepack-coupon-2026q1',
  'coursepack_coupon',
  'Course Pack Coupon',
  'Use this coupon when purchasing matching course packs.',
  'View Course Packs',
  'https://www.25maths.com/cie0580/products.html',
  'MEMBER-2026Q1',
  'paid',
  true,
  20,
  null,
  null
)
on conflict (id) do update set
  kind = excluded.kind,
  title = excluded.title,
  description = excluded.description,
  cta_label = excluded.cta_label,
  cta_url = excluded.cta_url,
  coupon_code = excluded.coupon_code,
  available_for = excluded.available_for,
  is_active = excluded.is_active,
  priority = excluded.priority,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  updated_at = now();
