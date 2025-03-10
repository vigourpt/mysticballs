# Mystic-Balls

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/vigourpt/Mystic-Balls)

## Database Migrations

The following migrations need to be applied to the Supabase database:

- 20250403210500_add_admin_field.sql (adds is_admin field to user_profiles)
- 20250310214700_add_plan_type_to_user_profiles.sql (adds plan_type field)
- 20250308153500_add_reading_history_table.sql (creates reading_history table)
- 20250307235900_add_auth_code_verifiers_table.sql (creates auth_code_verifiers table)
- 20250307015900_create_subscriptions_table.sql (creates subscriptions table)

To apply these migrations, run:

```bash
supabase db push
```

If you encounter issues with remote migrations not found locally, you may need to repair the migration history:

```bash
supabase migration repair --status reverted 20240218000000
supabase db push
```
