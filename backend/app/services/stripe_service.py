import stripe
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.user import User

# Configure Stripe API secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

# Map app tiers to price IDs
TIER_PRICE_IDS = {
    "pro": settings.STRIPE_PRICE_PRO,
    "pro_plus": settings.STRIPE_PRICE_PRO_PLUS,
    "team": settings.STRIPE_PRICE_TEAM
}

class StripeService:
    @staticmethod
    async def get_or_create_customer(user: User, db: AsyncSession) -> str:
        """
        Check if a user already has a Stripe customer ID. If not, create a new
        Stripe customer and save the ID to the database.
        """
        if user.stripe_customer_id:
            return user.stripe_customer_id

        # Create Stripe customer
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name or user.email,
            metadata={"user_id": str(user.id)}
        )

        # Update user record
        user.stripe_customer_id = customer.id
        await db.commit()
        await db.refresh(user)
        return customer.id

    @staticmethod
    async def create_checkout_session(
        user_id: uuid.UUID,
        tier: str,
        success_url: str,
        cancel_url: str,
        db: AsyncSession
    ) -> Optional[str]:
        """
        Generate a Stripe checkout session url for upgrading subscription tier.
        """
        if tier not in TIER_PRICE_IDS:
            return None

        # Fetch user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return None

        # Ensure customer ID is set
        customer_id = await StripeService.get_or_create_customer(user, db)

        # Create session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": TIER_PRICE_IDS[tier],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": str(user_id),
                "target_tier": tier
            }
        )

        return session.url

    @staticmethod
    async def create_portal_session(user_id: uuid.UUID, return_url: str, db: AsyncSession) -> Optional[str]:
        """
        Generate Stripe customer billing portal URL.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.stripe_customer_id:
            return None

        session = stripe.billing_portal.Session.create(
            customer=user.stripe_customer_id,
            return_url=return_url
        )
        return session.url

    @staticmethod
    async def process_webhook_event(payload: bytes, sig_header: str, db: AsyncSession) -> bool:
        """
        Handle Stripe webhook updates and update database User subscription states accordingly.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception:
            # Return False on signature verification failures
            return False

        event_type = event["type"]
        data_object = event["data"]["object"]

        if event_type == "checkout.session.completed":
            # Upgrade user subscription tier
            metadata = data_object.get("metadata", {})
            user_id_str = metadata.get("user_id")
            tier = metadata.get("target_tier")
            subscription_id = data_object.get("subscription")

            if user_id_str and tier:
                user_uuid = uuid.UUID(user_id_str)
                result = await db.execute(select(User).where(User.id == user_uuid))
                user = result.scalar_one_or_none()
                if user:
                    user.subscription_tier = tier
                    user.subscription_status = "active"
                    user.stripe_subscription_id = subscription_id
                    await db.commit()

        elif event_type in ["customer.subscription.updated", "customer.subscription.deleted"]:
            # Sync subscription states
            subscription_id = data_object.get("id")
            status = data_object.get("status")
            customer_id = data_object.get("customer")

            # Try finding user by subscription ID or customer ID
            result = await db.execute(
                select(User).where(
                    (User.stripe_subscription_id == subscription_id) | 
                    (User.stripe_customer_id == customer_id)
                )
            )
            user = result.scalar_one_or_none()
            if user:
                if status == "active":
                    user.subscription_status = "active"
                else:
                    # Cancelled, unpaid, past_due, etc.
                    user.subscription_status = status
                    if status == "canceled":
                        user.subscription_tier = "free"
                        user.stripe_subscription_id = None
                await db.commit()

        return True
