current transaction is aborted, commands ignored until end of transaction block
[
  {
    "file": null,
    "host": "db-tgblybswivkktbehkblu",
    "metadata": [],
    "parsed": [
      {
        "application_name": null,
        "backend_type": "client backend",
        "command_tag": "DEALLOCATE",
        "connection_from": "127.0.0.1:53357",
        "context": null,
        "database_name": "postgres",
        "detail": null,
        "error_severity": "ERROR",
        "hint": null,
        "internal_query": null,
        "internal_query_pos": null,
        "leader_pid": null,
        "location": null,
        "process_id": 202542,
        "query": "deallocate \"pgx_0\"",
        "query_id": 0,
        "query_pos": null,
        "session_id": "690f7b06.3172e",
        "session_line_num": 5,
        "session_start_time": "2025-11-08 17:16:54 UTC",
        "sql_state_code": "25P02",
        "timestamp": "2025-11-08 17:16:55.101 UTC",
        "transaction_id": 3946,
        "user_name": "supabase_auth_admin",
        "virtual_transaction_id": "41/0"
      }
    ],
    "parsed_from": null,
    "project": null,
    "source_type": null
  }
]

relation "admin_notification_settings" does not exist
[
  {
    "file": null,
    "host": "db-tgblybswivkktbehkblu",
    "metadata": [],
    "parsed": [
      {
        "application_name": null,
        "backend_type": "client backend",
        "command_tag": "INSERT",
        "connection_from": "127.0.0.1:53357",
        "context": "PL/pgSQL function public.notify_new_user() line 6 at SQL statement",
        "database_name": "postgres",
        "detail": null,
        "error_severity": "ERROR",
        "hint": null,
        "internal_query": "SELECT notify_new_users                          FROM admin_notification_settings\r\n  LIMIT 1",
        "internal_query_pos": 55,
        "leader_pid": null,
        "location": null,
        "process_id": 202542,
        "query": "INSERT INTO \"users\" (\"aud\", \"banned_until\", \"confirmation_sent_at\", \"confirmation_token\", \"created_at\", \"deleted_at\", \"email\", \"email_change\", \"email_change_confirm_status\", \"email_change_sent_at\", \"email_change_token_current\", \"email_change_token_new\", \"email_confirmed_at\", \"encrypted_password\", \"id\", \"instance_id\", \"invited_at\", \"is_anonymous\", \"is_sso_user\", \"last_sign_in_at\", \"phone\", \"phone_change\", \"phone_change_sent_at\", \"phone_change_token\", \"phone_confirmed_at\", \"raw_app_meta_data\", \"raw_user_meta_data\", \"reauthentication_sent_at\", \"reauthentication_token\", \"recovery_sent_at\", \"recovery_token\", \"role\", \"updated_at\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)",
        "query_id": -5643122554370342000,
        "query_pos": null,
        "session_id": "690f7b06.3172e",
        "session_line_num": 4,
        "session_start_time": "2025-11-08 17:16:54 UTC",
        "sql_state_code": "42P01",
        "timestamp": "2025-11-08 17:16:55.101 UTC",
        "transaction_id": 3946,
        "user_name": "supabase_auth_admin",
        "virtual_transaction_id": "41/2741"
      }
    ],
    "parsed_from": null,
    "project": null,
    "source_type": null
  }
]


current transaction is aborted, commands ignored until end of transaction block

[
  {
    "file": null,
    "host": "db-tgblybswivkktbehkblu",
    "metadata": [],
    "parsed": [
      {
        "application_name": null,
        "backend_type": "client backend",
        "command_tag": "DEALLOCATE",
        "connection_from": "127.0.0.1:52319",
        "context": null,
        "database_name": "postgres",
        "detail": null,
        "error_severity": "ERROR",
        "hint": null,
        "internal_query": null,
        "internal_query_pos": null,
        "leader_pid": null,
        "location": null,
        "process_id": 202269,
        "query": "deallocate \"pgx_0\"",
        "query_id": 0,
        "query_pos": null,
        "session_id": "690f79ca.3161d",
        "session_line_num": 5,
        "session_start_time": "2025-11-08 17:11:38 UTC",
        "sql_state_code": "25P02",
        "timestamp": "2025-11-08 17:11:38.658 UTC",
        "transaction_id": 3938,
        "user_name": "supabase_auth_admin",
        "virtual_transaction_id": "22/0"
      }
    ],
    "parsed_from": null,
    "project": null,
    "source_type": null
  }
]

relation "admin_notification_settings" does not exist

[
  {
    "file": null,
    "host": "db-tgblybswivkktbehkblu",
    "metadata": [],
    "parsed": [
      {
        "application_name": null,
        "backend_type": "client backend",
        "command_tag": "INSERT",
        "connection_from": "127.0.0.1:52319",
        "context": "PL/pgSQL function public.notify_new_user() line 6 at SQL statement",
        "database_name": "postgres",
        "detail": null,
        "error_severity": "ERROR",
        "hint": null,
        "internal_query": "SELECT notify_new_users                          FROM admin_notification_settings\r\n  LIMIT 1",
        "internal_query_pos": 55,
        "leader_pid": null,
        "location": null,
        "process_id": 202269,
        "query": "INSERT INTO \"users\" (\"aud\", \"banned_until\", \"confirmation_sent_at\", \"confirmation_token\", \"created_at\", \"deleted_at\", \"email\", \"email_change\", \"email_change_confirm_status\", \"email_change_sent_at\", \"email_change_token_current\", \"email_change_token_new\", \"email_confirmed_at\", \"encrypted_password\", \"id\", \"instance_id\", \"invited_at\", \"is_anonymous\", \"is_sso_user\", \"last_sign_in_at\", \"phone\", \"phone_change\", \"phone_change_sent_at\", \"phone_change_token\", \"phone_confirmed_at\", \"raw_app_meta_data\", \"raw_user_meta_data\", \"reauthentication_sent_at\", \"reauthentication_token\", \"recovery_sent_at\", \"recovery_token\", \"role\", \"updated_at\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)",
        "query_id": -5643122554370342000,
        "query_pos": null,
        "session_id": "690f79ca.3161d",
        "session_line_num": 4,
        "session_start_time": "2025-11-08 17:11:38 UTC",
        "sql_state_code": "42P01",
        "timestamp": "2025-11-08 17:11:38.657 UTC",
        "transaction_id": 3938,
        "user_name": "supabase_auth_admin",
        "virtual_transaction_id": "22/3334"
      }
    ],
    "parsed_from": null,
    "project": null,
    "source_type": null
  }
]