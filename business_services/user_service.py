"""
User service for handling user-related business logic
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import re
import secrets

from data_models.user_models import User, PasswordResetToken
from data_models.progress_models import UserProgress, AssessmentResult, SimulationResult

class UserService:
    """Service class for user management operations"""
    
    def __init__(self):
        """Initialize user service"""
        pass
    
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Optional[User]:
        """Create a new user with validation. Raises ValueError for validation errors."""
        # Normalize inputs
        user_data = {k: (v.strip() if isinstance(v, str) else v) for k, v in user_data.items()}
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'specialization', 'year_level']
        for field in required_fields:
            if field not in user_data or not user_data[field]:
                raise ValueError(f"Missing required field: {field}")
        
        # Set default full name if not provided
        if 'full_name' not in user_data or not user_data['full_name']:
            user_data['full_name'] = f"User {user_data['username']}"
        
        # Validate email format
        if not UserService._is_valid_email(user_data['email']):
            raise ValueError("Invalid email format")
        
        # Validate password strength
        if not UserService._is_valid_password(user_data['password']):
            raise ValueError("Password does not meet strength requirements")
        
        # Check if user already exists
        if User.get_by_username(user_data['username']):
            raise ValueError("Username already exists")
        
        if User.get_by_email(user_data['email']):
            raise ValueError("Email already exists")
        
        # Create user
        try:
            user = User(**user_data)
            if user.save():
                return user
            raise ValueError("Failed to save user")
        except Exception as e:
            # Surface precise reason to caller (route will flash this)
            raise ValueError(str(e))
    
    @staticmethod
    def authenticate_user(username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        try:
            user = User.get_by_username(username)
            if user and user.check_password(password):
                return user
            return None
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return None
    
    @staticmethod
    def update_user_profile(user_id: int, profile_data: Dict[str, Any]) -> bool:
        """Update user profile information"""
        try:
            user = User.get_by_id(user_id)
            if not user:
                return False
            
            # Remove sensitive fields that shouldn't be updated directly
            sensitive_fields = ['password_hash', 'id', 'created_at', 'updated_at']
            for field in sensitive_fields:
                profile_data.pop(field, None)
            
            # Validate email if being updated
            if 'email' in profile_data:
                if not UserService._is_valid_email(profile_data['email']):
                    raise ValueError("Invalid email format")
                
                # Check if email is already taken by another user
                existing_user = User.get_by_email(profile_data['email'])
                if existing_user and existing_user.id != user_id:
                    raise ValueError("Email already exists")
            
            return user.update(**profile_data)
            
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False
    
    @staticmethod
    def change_password(user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        try:
            user = User.get_by_id(user_id)
            if not user:
                return False
            
            # Verify current password
            if not user.check_password(current_password):
                raise ValueError("Current password is incorrect")
            
            # Validate new password
            if not UserService._is_valid_password(new_password):
                raise ValueError("New password does not meet strength requirements")
            
            return user.set_password(new_password)
            
        except Exception as e:
            print(f"Error changing password: {e}")
            return False
    
    @staticmethod
    def request_password_reset(email: str) -> Optional[str]:
        """Request password reset token"""
        try:
            user = User.get_by_email(email)
            if not user:
                return None
            
            return user.create_password_reset_token()
            
        except Exception as e:
            print(f"Error requesting password reset: {e}")
            return None
    
    @staticmethod
    def reset_password(token: str, new_password: str) -> bool:
        """Reset password using token"""
        try:
            reset_token = PasswordResetToken.get_valid_token(token)
            if not reset_token:
                raise ValueError("Invalid or expired token")
            
            user = User.get_by_id(reset_token.user_id)
            if not user:
                raise ValueError("User not found")
            
            # Validate new password
            if not UserService._is_valid_password(new_password):
                raise ValueError("Password does not meet strength requirements")
            
            # Update password and mark token as used
            if user.set_password(new_password) and reset_token.mark_as_used():
                return True
            return False
            
        except Exception as e:
            print(f"Error resetting password: {e}")
            return False
    
    @staticmethod
    def get_user_statistics(user_id: int) -> Optional[Dict[str, Any]]:
        """Get comprehensive user statistics"""
        try:
            user = User.get_by_id(user_id)
            if not user:
                return None
            
            # Get progress summary
            progress_summary = user.get_progress_summary()
            
            # Get assessment statistics
            assessments = AssessmentResult.get_user_assessments(user_id)
            
            # Calculate total score as sum of highest scores from each module
            total_assessment_score = UserService._calculate_total_score_from_best_scores(user_id)
            
            assessment_stats = {
                'total_assessments': len(assessments),
                'passed_assessments': len([a for a in assessments if a.passed]),
                'average_score': sum(a.score for a in assessments) / len(assessments) if assessments and len(assessments) > 0 else 0,
                'best_score': max(a.score for a in assessments) if assessments else 0
            }
            
            # Get simulation statistics - Count completed modules with simulations
            from data_models.content_models import Module
            from data_models.progress_models import UserProgress
            
            modules_with_sims = Module.query.filter_by(has_simulation=True).all()
            user_simulations_completed = 0
            simulation_scores = []
            
            for module in modules_with_sims:
                module_progress = UserProgress.query.filter_by(
                    user_id=user_id, 
                    module_id=module.id, 
                    status='completed'
                ).first()
                if module_progress:
                    user_simulations_completed += 1
                    simulation_scores.append(module_progress.score)
            
            simulation_stats = {
                'total_simulations': len(modules_with_sims),
                'completed_simulations': user_simulations_completed,
                'average_score': sum(simulation_scores) / len(simulation_scores) if simulation_scores else 0
            }
            
            # Combine all statistics
            combined = {
                **progress_summary,
                'assessment_statistics': assessment_stats,
                'simulation_statistics': simulation_stats
            }

            # Ensure total_score reflects real progress with highest scores only
            combined['total_score'] = int(total_assessment_score)
            return combined
            
        except Exception as e:
            print(f"Error getting user statistics: {e}")
            return None
    
    @staticmethod
    def _calculate_total_score_from_best_scores(user_id: int) -> int:
        """Calculate total score as sum of highest scores from each module"""
        try:
            from data_models.content_models import Module
            
            total_score = 0
            modules = Module.get_all_ordered()
            
            for module in modules:
                if module.id <= 5:  # Only count modules 1-5, exclude Final Assessment
                    # Get all assessment results for this module
                    module_assessments = AssessmentResult.query.filter_by(
                        user_id=user_id,
                        module_id=module.id
                    ).all()
                    
                    if module_assessments:
                        # Get the highest score for this module
                        highest_score = max(assessment.score for assessment in module_assessments)
                        total_score += highest_score
            
            return total_score
            
        except Exception as e:
            print(f"Error calculating total score from best scores: {e}")
            return 0
    
    @staticmethod
    def get_top_performers(limit: int = 10) -> List[Dict[str, Any]]:
        """Get top performing users"""
        try:
            users = User.get_top_performers(limit)
            return [user.get_progress_summary() for user in users]
        except Exception as e:
            print(f"Error getting top performers: {e}")
            return []
    
    @staticmethod
    def cleanup_expired_tokens() -> int:
        """Clean up expired password reset tokens"""
        try:
            return PasswordResetToken.cleanup_expired_tokens()
        except Exception as e:
            print(f"Error cleaning up expired tokens: {e}")
            return 0
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def _is_valid_password(password: str) -> bool:
        """Validate password strength"""
        if len(password) < 12:
            return False
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'\d', password):
            return False
        return True
    
    @staticmethod
    def is_module_fully_completed(user_id: int, module_id: int) -> bool:
        """
        Check if a module is fully completed (knowledge check with 80%+ passing score)
        
        POLICY: "Pass Once, Always Complete" - Uses highest score achieved, not latest score.
        Once a learner passes (≥80%), they maintain "Completed" status even if they retake
        and get a lower score.
        """
        try:
            from data_models.content_models import Module
            from data_models.progress_models import AssessmentResult
            
            # Get module info
            module = Module.get_by_id(module_id)
            if not module:
                return False
            
            # Check UserProgress table for completion status
            progress = UserProgress.get_module_progress(user_id, module_id)
            if not progress:
                return False
            
            # Check if module is marked as completed in UserProgress
            # The database uses 'status' column, not 'is_completed'
            if progress.status != 'completed':
                return False
            
            # POLICY: Check highest score achieved, not current score
            # Get all assessment results for this module to find highest score
            if module_id == 6:
                # Final Assessment (stored with module_id=None)
                assessment_results = AssessmentResult.query.filter_by(
                    user_id=user_id,
                    module_id=None,
                    assessment_type='final_assessment'
                ).all()
            else:
                # Knowledge Check for modules 1-5
                assessment_results = AssessmentResult.query.filter_by(
                    user_id=user_id,
                    module_id=module_id,
                    assessment_type='knowledge_check'
                ).all()
            
            # Calculate highest percentage score achieved
            highest_percentage = 0
            if assessment_results:
                for result in assessment_results:
                    if result.total_questions and result.total_questions > 0:
                        percentage = int((result.score / result.total_questions) * 100)
                        if percentage > highest_percentage:
                            highest_percentage = percentage
            
            # Check if the highest score meets the 80% threshold
            if highest_percentage < 80:
                return False
            
            # Note: Simulations are optional - modules are considered complete with just knowledge check
            # Users can complete simulations for extra learning, but they're not required for progression
            
            return True
            
        except Exception as e:
            print(f"Error checking module completion: {e}")
            return False
    
    @staticmethod
    def get_user_completed_modules(user_id: int) -> List[int]:
        """Get list of module IDs that are fully completed by user"""
        try:
            from data_models.content_models import Module
            
            completed_modules = []
            all_modules = Module.get_all_ordered()
            
            for module in all_modules:
                if UserService.is_module_fully_completed(user_id, module.id):
                    completed_modules.append(module.id)
            
            return completed_modules
            
        except Exception as e:
            print(f"Error getting completed modules: {e}")
            return []

