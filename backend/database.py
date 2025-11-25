"""
Supabase Database Integration
Handles user data storage and retrieval
"""

import logging
import os
from typing import Any, Dict, Optional

import httpx

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Optional[Client] = None

logger = logging.getLogger("SmartAgriNode.database")

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        # Use SERVICE_ROLE_KEY to bypass RLS
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
    async def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Supabase JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            User data if valid, None otherwise
        """
        if not token:
            logger.warning("No token provided for verification")
            return None

        if not SUPABASE_URL:
            logger.warning("SUPABASE_URL not configured; cannot verify token")
            return None

        api_key = SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY
        if not api_key:
            logger.warning("Supabase API key not configured; cannot verify token")
            return None

        verify_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {token}",
            "apikey": api_key
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(verify_url, headers=headers)
                response.raise_for_status()
                data = response.json()
                if not data.get("id"):
                    logger.warning("Supabase verification succeeded but missing user id")
                    return None
                return {
                    "id": data.get("id"),
                    "email": data.get("email"),
                    "user_metadata": data.get("user_metadata", {}),
                    "app_metadata": data.get("app_metadata", {})
                }
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 401:
                logger.warning("Token verification failed: unauthorized (401)")
            else:
                logger.exception("Supabase verification HTTP error: %s", exc)
            return None
        except httpx.RequestError:
            logger.exception("Supabase verification network error")
            return None
        except Exception:
            logger.exception("Unexpected error verifying Supabase token")
            return None
    
    @staticmethod
    async def store_user_metadata(user_id: str, email: str, username: Optional[str] = None) -> Dict[str, Any]:
        """
        Store user metadata
        
        Args:
            user_id: User ID
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
                "user_id": user_id,
                "email": email,
                "username": username or email.split('@')[0]
            }
            
            # Upsert user metadata
            result = supabase.table("users").upsert(data, on_conflict="user_id").execute()
            return result.data[0] if result.data else data
        except Exception:
            logger.exception("Error storing user metadata")
            return {"user_id": user_id, "email": email}
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by User ID
        
        Args:
            user_id: User ID
            
        Returns:
            User record or None
        """
        if not supabase:
            return None
        
        try:
            result = supabase.table("users").select("*").eq("user_id", user_id).execute()
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
            user_id: User ID
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
                "user_id": user_id,
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
        detections: int,
        input_image_url: Optional[str] = None,
        output_image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Store weed detection history
        
        Args:
            user_id: User ID
            filename: Uploaded image filename
            detections: Number of weeds detected
            input_image_url: URL of the input image
            output_image_url: URL of the output image
            
        Returns:
            Stored record
        """
        if not supabase:
            logger.warning("Supabase not configured, skipping history storage")
            return {}
        
        try:
            data = {
                "user_id": user_id,
                "image_filename": filename,
                "weed_count": int(detections),
                "input_image_url": input_image_url,
                "output_image_url": output_image_url
            }
            
            result = supabase.table("weed_detections").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.exception("Error storing weed detection")
            print(f"Error storing weed detection: {str(e)}")
            return {}
    
    @staticmethod
    async def get_user_history(user_id: str, limit: int = 10) -> Dict[str, Any]:
        """
        Get user's recommendation and detection history
        
        Args:
            user_id: User ID
            limit: Maximum records to fetch
            
        Returns:
            Dictionary with crop_recommendations and weed_detections lists
        """
        if not supabase:
            return {"crop_recommendations": [], "weed_detections": []}
        
        try:
            crop_recs = supabase.table("crop_recommendations")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            weed_dets = supabase.table("weed_detections")\
                .select("*")\
                .eq("user_id", user_id)\
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
    
    @staticmethod
    async def upload_weed_image(user_id: str, file_content: bytes, file_ext: str, bucket_name: str) -> str:
        """
        Upload weed detection image to storage and return public URL
        
        Args:
            user_id: User ID
            file_content: Raw file content
            file_ext: File extension (jpg, png, etc.)
            bucket_name: Name of the bucket (input-images or output-images)
            
        Returns:
            Public URL of the uploaded image
        """
        if not supabase:
            raise RuntimeError("Supabase not configured")
            
        import uuid
        filename = f"{user_id}/{uuid.uuid4()}.{file_ext}"
        
        try:
            # Ensure bucket exists (optional)
            try:
                supabase.storage.create_bucket(bucket_name, options={"public": True})
            except Exception:
                pass

            # Upload file
            supabase.storage.from_(bucket_name).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": f"image/{file_ext}", "upsert": "true"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
            return public_url
        except Exception as e:
            logger.exception(f"Error uploading image to {bucket_name}")
            raise e

    @staticmethod
    async def upload_avatar(user_id: str, file_content: bytes, file_ext: str) -> str:
        """
        Upload avatar to storage and return public URL
        
        Args:
            user_id: User ID
            file_content: Raw file content
            file_ext: File extension (jpg, png, etc.)
            
        Returns:
            Public URL of the uploaded avatar
        """
        if not supabase:
            raise RuntimeError("Supabase not configured")
            
        filename = f"{user_id}.{file_ext}"
        bucket = "avatars"
        
        try:
            # Ensure bucket exists (optional, but good practice)
            # Note: create_bucket might fail if it already exists, which is fine
            try:
                supabase.storage.create_bucket(bucket, options={"public": True})
            except Exception:
                pass  # Bucket likely exists

            # Upload file (upsert=True to overwrite)
            # Note: using 'upsert': 'true' as string for some versions, or bool for others. 
            # The python client usually expects a dict for file_options.
            supabase.storage.from_(bucket).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": f"image/{file_ext}", "upsert": "true"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(bucket).get_public_url(filename)
            
            # Update user metadata with new avatar URL
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"avatar_url": public_url}}
            )
            
            # Also update our local users table
            try:
                supabase.table("users").update({"avatar_url": public_url}).eq("user_id", user_id).execute()
            except Exception:
                logger.warning("Failed to update local users table with avatar URL")

            return public_url
        except Exception as e:
            logger.exception("Error uploading avatar")
            raise e
    
    @staticmethod
    async def clear_avatar_reference(user_id: str) -> bool:
        """
        Clear avatar reference from user metadata and database
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        if not supabase:
            return False
            
        try:
            # 1. Update user metadata (Supabase Auth)
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": {"avatar_url": None}}
            )
            
            # 2. Update local users table
            try:
                supabase.table("users").update({"avatar_url": None}).eq("user_id", user_id).execute()
            except Exception:
                logger.warning("Failed to update local users table after avatar deletion")

            return True
        except Exception:
            logger.exception("Error clearing avatar reference")
            raise

    @staticmethod
    async def delete_avatar_file(user_id: str) -> bool:
        """
        Delete user avatar file from storage
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        if not supabase:
            return False
            
        try:
            # List files to find any extension (jpg, png, etc.) associated with this user
            files = supabase.storage.from_("avatars").list(path="", options={"search": user_id})
            
            files_to_remove = []
            for f in files:
                name = f.get('name', '')
                # Ensure we match "{user_id}.ext" pattern
                if name.startswith(f"{user_id}."):
                    files_to_remove.append(name)
            
            if files_to_remove:
                supabase.storage.from_("avatars").remove(files_to_remove)
                msg = f"✅ Background Task Complete: Deleted avatar files for user {user_id}: {files_to_remove}"
                print(msg)
                logger.info(msg)
            else:
                print(f"ℹ️ Background Task Complete: No avatar files found to delete for user {user_id}")
            
            return True
        except Exception as e:
            print(f"❌ Background Task Failed: Error deleting avatar for user {user_id}: {e}")
            logger.exception("Error deleting avatar file from storage")
            # We don't raise here to prevent crashing the background task, just log it
            return False

    @staticmethod
    async def delete_avatar(user_id: str) -> bool:
        """
        Delete user avatar from storage and update metadata (Synchronous wrapper)
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful
        """
        await SupabaseDB.delete_avatar_file(user_id)
        return await SupabaseDB.clear_avatar_reference(user_id)
