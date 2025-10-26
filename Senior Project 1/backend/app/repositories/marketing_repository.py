"""
Marketing repository for campaign and lead operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from uuid import UUID

from app.models.marketing import Campaign, Lead
from .base import BaseRepository


class MarketingRepository:
    """Repository for marketing operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.campaign_repo = BaseRepository(Campaign, db)
        self.lead_repo = BaseRepository(Lead, db)
    
    # Campaign operations
    def create_campaign(self, campaign_data: Dict[str, Any]) -> Campaign:
        """Create a new campaign."""
        return self.campaign_repo.create(campaign_data)
    
    def get_active_campaigns(self) -> List[Campaign]:
        """Get active campaigns."""
        return self.db.query(Campaign).filter(Campaign.status == 'active').all()
    
    # Lead operations
    def create_lead(self, lead_data: Dict[str, Any]) -> Lead:
        """Create a new lead."""
        return self.lead_repo.create(lead_data)
    
    def get_lead_by_email(self, email: str) -> Optional[Lead]:
        """Get lead by email."""
        return self.db.query(Lead).filter(Lead.email == email).first()
    
    def get_leads_by_status(self, status: str) -> List[Lead]:
        """Get leads by status."""
        return self.db.query(Lead).filter(Lead.status == status).all()
    
    def update_lead_status(self, lead_id: UUID, status: str) -> Optional[Lead]:
        """Update lead status."""
        update_data = {"status": status}
        if status == 'converted':
            update_data["converted_at"] = func.now()
        
        return self.lead_repo.update(lead_id, update_data)