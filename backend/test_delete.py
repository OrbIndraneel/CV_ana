import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.resume import Resume
from app.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Resume))
        resumes = result.scalars().all()
        print(f"Found {len(resumes)} resumes.")
        for r in resumes:
            print(f"ID: {r.id}, User: {r.user_id}")
            # Try to delete it directly
            try:
                await session.delete(r)
                await session.commit()
                print("Deleted successfully via SQLAlchemy!")
            except Exception as e:
                print(f"Failed to delete: {e}")
                await session.rollback()

if __name__ == "__main__":
    asyncio.run(main())
