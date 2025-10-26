"""
Finance models for fee management, invoices, and payments.
"""

from sqlalchemy import Column, String, Numeric, Boolean, Date, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel


class FeeStructure(BaseModel):
    """Fee structure for different types of fees."""
    
    __tablename__ = "fee_structure"

    # Fee information
    fee_type = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    
    # Department and academic period
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    academic_year = Column(String, nullable=False)
    semester = Column(String)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    department = relationship("Department", back_populates="fee_structures")
    
    def __repr__(self):
        return f"<FeeStructure(id={self.id}, fee_type={self.fee_type}, amount={self.amount})>"
    
    @property
    def department_name(self) -> str:
        """Get department name."""
        return self.department.name if self.department else "All Departments"


class Invoice(BaseModel):
    """Invoice model for student billing."""
    
    __tablename__ = "invoices"

    # Invoice information
    invoice_number = Column(String, nullable=False, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    description = Column(Text)
    
    # Student and academic period
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    academic_year = Column(String, nullable=False)
    semester = Column(String)
    
    # Status and creation
    status = Column(String, default='pending')  # pending, paid, overdue, cancelled
    created_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    student = relationship("Profile", back_populates="invoices", foreign_keys=[student_id])
    creator = relationship("Profile", foreign_keys=[created_by])
    payments = relationship("Payment", back_populates="invoice")
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, number={self.invoice_number}, amount={self.amount}, status={self.status})>"
    
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def total_paid(self) -> float:
        """Calculate total amount paid for this invoice."""
        return sum(float(payment.amount) for payment in self.payments if payment.status == 'completed')
    
    @property
    def balance_due(self) -> float:
        """Calculate remaining balance."""
        return float(self.amount) - self.total_paid
    
    @property
    def is_fully_paid(self) -> bool:
        """Check if invoice is fully paid."""
        return self.balance_due <= 0


class Payment(BaseModel):
    """Payment model for recording student payments."""
    
    __tablename__ = "payments"

    # Payment information
    payment_reference = Column(String, nullable=False, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String, nullable=False)  # cash, bank_transfer, mobile_money, card, cheque
    payment_date = Column(Date, server_default='now()')
    
    # Related records
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Status and processing
    status = Column(String, default='completed')  # pending, completed, failed, refunded
    notes = Column(Text)
    processed_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    
    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    student = relationship("Profile", back_populates="payments", foreign_keys=[student_id])
    processor = relationship("Profile", foreign_keys=[processed_by])
    
    def __repr__(self):
        return f"<Payment(id={self.id}, reference={self.payment_reference}, amount={self.amount}, status={self.status})>"
    
    @property
    def student_name(self) -> str:
        """Get student name."""
        return self.student.full_name if self.student else "Unknown Student"
    
    @property
    def invoice_number(self) -> str:
        """Get invoice number."""
        return self.invoice.invoice_number if self.invoice else "No Invoice"