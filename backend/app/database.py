import os
import re
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

_raw = os.getenv("DATABASE_URL", "")
# asyncpg does not accept sslmode as a query param — strip it and use connect_args
DATABASE_URL = re.sub(r"[?&]sslmode=[^&]*", "", _raw)

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"ssl": _ssl_ctx} if "neon.tech" in DATABASE_URL else {},
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
