from fastapi import Header, HTTPException
from app.db import supabase


def get_current_user(authorization: str = Header(None)) -> str:
    """
    Verifies the Supabase auth token sent by the frontend and returns
    the user's id. The frontend sends this as:
    Authorization: Bearer <supabase_access_token>

    Every dispute-related endpoint will depend on this, so a dispute
    always has a real owner and merchants can't see each other's data.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_response.user.id