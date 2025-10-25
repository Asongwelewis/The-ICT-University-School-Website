"""
Marketing models for campaigns and lead management.
"""

from sqlalchemy import Column, String, Numeric, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class Campaign(BaseModel):
    """Marketing campaign model."""
    
    __tablename__ = "campaigns"

    # Campaign information
    name = Column(String, nullable=False)
    description = Column(Text)
    campaign_type = Column(String, nullable=False)
    
    # Campaign period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    
    # Budget and targeting
    budget = Column(Numeric(10, 2))
    target_audience = Column(Text)
    
    # Status and creation
    status = Column(String, default='draft')
    created_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    creator = relationship("Profile", back_populates="campaigns_created", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<Campaign(id={self.id}, name={self.name})>"


class Lead(BaseModel):
    """Lead model for potential students."""
    
    __tablename__ = "leads"

    # Personal information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    
    # Lead source and status
    source = Column(String, nullable=False)
    status = Column(String, default='new')
    interest_level = Column(String, default='medium')
    
    # Interest and notes
    program_interest = Column(String)
    notes = Column(Text)
    
    # Assignment and conversion
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    converted_at = Column(DateTime(timezone=True))
    
    # Relationships
    assigned_to_user = relationship("Profile", back_populates="assigned_leads", foreign_keys=[assigned_to])
    
    def __repr__(self):
        return f"<Lead(id={self.id}, name={self.first_name} {self.last_name})>"