import time
from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def safe_execute(query_builder, retries: int = 3, delay: float = 0.3):
    """
    Runs a Supabase query with automatic retries.
    Windows can occasionally drop HTTP/2 connections mid-request under
    rapid repeated calls (a known socket-handling quirk) -- this wraps
    every DB call so a transient failure doesn't crash a whole batch run.
    """
    last_error = None
    for attempt in range(retries):
        try:
            return query_builder.execute()
        except Exception as e:
            last_error = e
            time.sleep(delay)
    raise last_error