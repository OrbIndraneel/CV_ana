import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.user import User
from app.models.resume import Resume
from app.config import settings
from app.core.security import create_access_token

async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get first user and their first resume
        user = (await session.execute(select(User))).scalars().first()
        if not user:
            print("No user found")
            return
            
        resume = (await session.execute(select(Resume).filter(Resume.user_id == user.id))).scalars().first()
        if not resume:
            print("No resume found for user")
            return
            
        # Generate token
        token = create_access_token(subject=str(user.id))
        
        print(f"Testing DELETE for resume {resume.id}")
        
        # Make request
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.delete(
                f"http://localhost:8000/api/v1/resumes/{resume.id}", 
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")

if __name__ == "__main__":
    asyncio.run(main())
