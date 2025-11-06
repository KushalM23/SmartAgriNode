"""
Supabase Database Integration
Handles user data storage and retrieval
"""

import logging
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client
supabase: Optional[Client] = None

logger = logging.getLogger("SmartAgriNode.database")

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        # Use SERVICE_ROLE_KEY to bypass RLS since we're using Clerk auth
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized")
    except Exception:  # pragma: no cover - configuration issue
        logger.exception("Failed to initialize Supabase client")
else:
    logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")

class SupabaseDB:
    """Supabase database operations"""
    
    @staticmethod
    def get_client() -> Client:
        """Get Supabase client instance"""
        if not supabase:
            raise RuntimeError("Supabase client not initialized. Check environment variables.")
        return supabase
    
    @staticmethod
    async def store_user_metadata(user_id: str, email: str, username: Optional[str] = None) -> Dict[str, Any]:
        """
        Store user metadata from Clerk
        
        Args:
            user_id: Clerk user ID
            email: User email
            username: Optional username
            
        Returns:
            User record
        """
        if not supabase:
            logger.warning("Supabase not configured, skipping user metadata storage")
            return {"user_id": user_id, "email": email}
        
        try:
            data = {
                "clerk_user_id": user_id,
                "email": email,
                "username": username or email.split('@')[0]
            }
            
            # Upsert user metadata
            result = supabase.table("users").upsert(data, on_conflict="clerk_user_id").execute()
            return result.data[0] if result.data else data
        except Exception:
            logger.exception("Error storing user metadata")
            return {"user_id": user_id, "email": email}
    
    @staticmethod
    async def get_user_by_clerk_id(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by Clerk user ID
        
        Args:
            user_id: Clerk user ID
            
        Returns:
            User record or None
        """
        if not supabase:
            return None
        
        try:
            result = supabase.table("users").select("*").eq("clerk_user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception:
            logger.exception("Error fetching user")
            return None
    
    @staticmethod
    async def store_crop_recommendation(
        user_id: str,
        input_data: Dict[str, float],
        recommendation: str,
        confidence: float
    ) -> Dict[str, Any]:
        """
        Store crop recommendation history
        
        Args:
            user_id: Clerk user ID
            input_data: Input parameters (N, P, K, etc.)
            recommendation: Recommended crop
            confidence: Prediction confidence
            
        Returns:
            Stored record
        """
        if not supabase:
            logger.warning("Supabase not configured, skipping history storage")
            return {}
        
        try:
            data = {
                "clerk_user_id": user_id,
                "input_data": input_data,
                "recommended_crop": recommendation,
                "confidence": confidence
            }
            
            result = supabase.table("crop_recommendations").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception:
            logger.exception("Error storing crop recommendation")
            return {}
    
    @staticmethod
    async def store_weed_detection(
        user_id: str,
        filename: str,
        detections: int
    ) -> Dict[str, Any]:
        """
        Store weed detection history
        
        Args:
            user_id: Clerk user ID
            filename: Uploaded image filename
            detections: Number of weeds detected
            
        Returns:
            Stored record
        """
        if not supabase:
            logger.warning("Supabase not configured, skipping history storage")
            return {}
        
        try:
            data = {
                "clerk_user_id": user_id,
                "image_filename": filename,
                "weed_count": detections
            }
            
            result = supabase.table("weed_detections").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception:
            logger.exception("Error storing weed detection")
            return {}
    
    @staticmethod
    async def get_user_history(user_id: str, limit: int = 10) -> Dict[str, Any]:
        """
        Get user's recommendation and detection history
        
        Args:
            user_id: Clerk user ID
            limit: Maximum records to fetch
            
        Returns:
            Dictionary with crop_recommendations and weed_detections lists
        """
        if not supabase:
            return {"crop_recommendations": [], "weed_detections": []}
        
        try:
            crop_recs = supabase.table("crop_recommendations")\
                .select("*")\
                .eq("clerk_user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            weed_dets = supabase.table("weed_detections")\
                .select("*")\
                .eq("clerk_user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return {
                "crop_recommendations": crop_recs.data or [],
                "weed_detections": weed_dets.data or []
            }
        except Exception:
            logger.exception("Error fetching user history")
            return {"crop_recommendations": [], "weed_detections": []}
