import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")


def validate_config():
	missing = [
		name
		for name, value in {
			"SUPABASE_URL": SUPABASE_URL,
			"SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY": SUPABASE_KEY,
		}.items()
		if not value
	]
	if missing:
		raise RuntimeError(f"Missing required environment variable(s): {', '.join(missing)}")