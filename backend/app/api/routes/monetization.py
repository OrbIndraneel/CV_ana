from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.session import get_db
from app.dependencies import get_current_active_user
from app.models.user import User
from app.services.stripe_service import StripeService

router = APIRouter()

class CheckoutRequest(BaseModel):
    tier: str
    success_url: str
    cancel_url: str

class PortalRequest(BaseModel):
    return_url: str

@router.post("/checkout")
async def create_stripe_checkout(
    request_data: CheckoutRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a Stripe checkout session URL for upgrading user subscription.
    """
    checkout_url = await StripeService.create_checkout_session(
        user_id=current_user.id,
        tier=request_data.tier,
        success_url=request_data.success_url,
        cancel_url=request_data.cancel_url,
        db=db
    )
    
    if not checkout_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tier selection or checkout initialization failed."
        )
        
    return {"url": checkout_url}

@router.post("/portal")
async def create_stripe_portal(
    request_data: PortalRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a Stripe billing portal URL to manage payments and subscription cancellation.
    """
    portal_url = await StripeService.create_portal_session(
        user_id=current_user.id,
        return_url=request_data.return_url,
        db=db
    )
    
    if not portal_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not initialize billing portal. User may not have an active customer ID."
        )
        
    return {"url": portal_url}

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook endpoint to sync stripe subscription updates asynchronously.
    """
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature header."
        )
        
    payload = await request.body()
    success = await StripeService.process_webhook_event(
        payload=payload,
        sig_header=stripe_signature,
        db=db
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature or webhook processing failure."
        )
        
    return {"status": "success"}
