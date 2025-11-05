"""
Supabase Database Integration
Handles user data storage and retrieval
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional, Dict, Any

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client
supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        # Use SERVICE_ROLE_KEY to bypass RLS since we're using Clerk auth
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✅ Supabase client initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing Supabase client: {e}")
else:
    print("⚠️ Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")

class SupabaseDB:
    """Supabase database operations"""
    
    @staticmethod
    def get_client() -> Client:
        """Get Supabase client instance"""
        if not supabase:
            raise Exception("Supabase client not initialized. Check environment variables.")
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
            print("⚠️ Supabase not configured, skipping user metadata storage")
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
        except Exception as e:
            print(f"Error storing user metadata: {e}")
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
        except Exception as e:
            print(f"Error fetching user: {e}")
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
            print("⚠️ Supabase not configured, skipping history storage")
            return {}
        
        try:
            data = {
                "clerk_user_id": user_id,
                "input_data": input_data,
                "recommended_crop": recommendation,
                "confidence": confidence
            }
            
            print(f"📝 Storing crop recommendation for user: {user_id}")
            print(f"   Data: {data}")
            
            result = supabase.table("crop_recommendations").insert(data).execute()
            print(f"✅ Successfully stored crop recommendation!")
            return result.data[0] if result.data else {}
        except Exception as e:
            print(f"❌ Error storing crop recommendation: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
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
            print("⚠️ Supabase not configured, skipping history storage")
            return {}
        
        try:
            data = {
                "clerk_user_id": user_id,
                "image_filename": filename,
                "weed_count": detections
            }
            
            print(f"📝 Storing weed detection for user: {user_id}")
            print(f"   Data: {data}")
            
            result = supabase.table("weed_detections").insert(data).execute()
            print(f"✅ Successfully stored weed detection!")
            return result.data[0] if result.data else {}
        except Exception as e:
            print(f"❌ Error storing weed detection: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
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
        except Exception as e:
            print(f"Error fetching user history: {e}")
            return {"crop_recommendations": [], "weed_detections": []}
