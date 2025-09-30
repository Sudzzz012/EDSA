
-- EDSA SendGrid Template Mapping (generated 2025-09-30)
create table if not exists email_templates (
  key text primary key,
  template_id text,
  name text,
  subject text,
  updated_at timestamptz default now()
);

insert into email_templates(key, template_id, name, subject) values
  ('query_received', null, 'EDSA | Query Received', 'EDSA | Query Received – REF: {ref_number}'),
  ('otp_for_query', null, 'EDSA | Your One-Time PIN (OTP)', 'EDSA | Your OTP Code – REF: {ref_number}'),
  ('query_update', null, 'EDSA | Update on Your Query', 'EDSA | Update on Your Query – REF: {ref_number}'),
  ('welcome', null, 'EDSA | Welcome & Next Steps', 'Welcome to Erase Debt SA – {client_first_name}'),
  ('payment_reminder_T2', null, 'EDSA | Reminder: Debit in 2 Days', 'Reminder: Debit in 2 Days – {due_date}'),
  ('payment_thank_you', null, 'EDSA | Payment Received – Thank You', 'Payment Received – Thank You (R{amount})'),
  ('payment_missed', null, 'EDSA | Payment Not Received', 'Payment Not Received – Action Required'),
  ('password_reset', null, 'EDSA | Password Reset', 'Reset your password'),
  ('login_magic_link', null, 'EDSA | Secure Login Link', 'Your secure login link'),
  ('terms_confirmation', null, 'EDSA | Terms & Mandate Confirmation', 'Terms & Mandate Confirmation – {ref_number}')
on conflict (key) do nothing;
