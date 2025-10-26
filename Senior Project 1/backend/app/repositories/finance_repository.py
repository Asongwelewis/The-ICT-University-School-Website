"""
Finance repository for fee, invoice, and payment operations.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from uuid import UUID
from datetime import date, datetime

from app.models.finance import FeeStructure, Invoice, Payment
from .base import BaseRepository


class FinanceRepository:
    """Repository for finance operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.fee_repo = BaseRepository(FeeStructure, db)
        self.invoice_repo = BaseRepository(Invoice, db)
        self.payment_repo = BaseRepository(Payment, db)
    
    # Fee Structure operations
    def create_fee_structure(self, fee_data: Dict[str, Any]) -> FeeStructure:
        """Create a new fee structure."""
        return self.fee_repo.create(fee_data)
    
    def get_fee_structures(self, academic_year: str = None) -> List[FeeStructure]:
        """Get fee structures with optional filtering."""
        query = self.db.query(FeeStructure).filter(FeeStructure.is_active == True)
        
        if academic_year:
            query = query.filter(FeeStructure.academic_year == academic_year)
        
        return query.all()
    
    # Invoice operations
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Invoice:
        """Create a new invoice."""
        if 'invoice_number' not in invoice_data:
            invoice_data['invoice_number'] = self._generate_invoice_number()
        
        return self.invoice_repo.create(invoice_data)
    
    def get_student_invoices(self, student_id: UUID) -> List[Invoice]:
        """Get invoices for a student."""
        return self.db.query(Invoice).filter(Invoice.student_id == student_id).all()
    
    # Payment operations  
    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        """Create a new payment."""
        if 'payment_reference' not in payment_data:
            payment_data['payment_reference'] = self._generate_payment_reference()
        
        return self.payment_repo.create(payment_data)
    
    def get_student_payments(self, student_id: UUID) -> List[Payment]:
        """Get payments made by a student."""
        return self.db.query(Payment).filter(Payment.student_id == student_id).all()
    
    # Helper methods
    def _generate_invoice_number(self) -> str:
        """Generate a unique invoice number."""
        year = datetime.now().year
        month = datetime.now().month
        count = self.db.query(Invoice).count()
        return f"INV-{year}{month:02d}-{count + 1:04d}"
    
    def _generate_payment_reference(self) -> str:
        """Generate a unique payment reference."""
        year = datetime.now().year
        month = datetime.now().month
        count = self.db.query(Payment).count()
        return f"PAY-{year}{month:02d}-{count + 1:04d}"