import asyncio, asyncpg
async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/resume_analyzer')
    rows = await conn.fetch('SELECT id, user_id FROM resumes')
    print('RESUMES:', rows)
    await conn.close()
asyncio.run(main())
