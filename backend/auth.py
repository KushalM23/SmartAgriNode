import logging
from typing import Optional
from fastapi import Header, HTTPException
from database import SupabaseDB

logger = logging.getLogger("SmartAgriNode.auth")

async def verify_supabase_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify Supabase JWT token from Authorization header
    Returns user data if valid, raises HTTPException if invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    # Verify token using Supabase client
    try:
        user = await SupabaseDB.verify_jwt(token)
        
        if user:
            user_id = user.get("id") or user.get("user_id")
            logger.info("Token verified for user %s", user_id)
            return {
                "user_id": user_id,
                "email": user.get("email")
            }
        else:
            logger.warning("Token verification failed: verify_jwt returned None")
            raise HTTPException(status_code=401, detail="Invalid token or expired session")
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token or expired session")
