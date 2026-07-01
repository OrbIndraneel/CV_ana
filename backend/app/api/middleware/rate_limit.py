"""
rate_limit.py
FastAPI middleware implementing a sliding-window rate limiter utilizing Redis.
Provides automatic no-op failover if the Redis broker is offline.
"""

import time
import logging
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from redis import Redis

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    HTTP Middleware checking client IP request frequencies.
    Uses sorted sets in Redis to track requests in a sliding window.
    """

    def __init__(
        self,
        app,
        redis_url: str,
        limit: int = 100,
        window: int = 60
    ) -> None:
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.redis = None

        try:
            # Connect to Redis and ping to verify connectivity
            self.redis = Redis.from_url(redis_url, socket_timeout=1)
            self.redis.ping()
            logger.info("Rate limiter successfully connected to Redis backend.")
        except Exception as e:
            logger.warning(
                f"Rate limiter could not connect to Redis: {e}. "
                "Requests will process without rate-limiting constraints."
            )

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        # Bypass rate limiter for system health checks or if Redis is offline
        if request.url.path == "/health" or not self.redis:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        # Unique Redis key per client IP + request path combination
        key = f"rate_limit:{client_ip}:{request.url.path}"

        # Determine limits based on route
        limit = self.limit
        window = self.window
        
        # Stricter rate limit for login page (5 attempts per 5 minutes)
        if request.url.path.endswith("/auth/login"):
            limit = 5
            window = 300

        try:
            current_time = time.time()
            
            # Use Redis pipeline to run commands atomically
            pipe = self.redis.pipeline()
            # 1. Remove request timestamps older than the sliding window boundary
            pipe.zremrangebyscore(key, 0, current_time - window)
            # 2. Count remaining items in the sorted set
            pipe.zcard(key)
            # Execute pipeline
            _, req_count = pipe.execute()

            if req_count >= limit:
                logger.warning(f"Rate limit exceeded: {client_ip} requesting {request.url.path}. Limit: {limit}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Too many requests. Please slow down and try again later.",
                        "code": "RATE_LIMIT_EXCEEDED"
                    }
                )

            # Record this request with current timestamp
            pipe = self.redis.pipeline()
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, window)
            pipe.execute()

        except Exception as e:
            # Fallback to allow request if Redis commands throw an error
            logger.error(f"Rate limiter encountered transactional error: {e}", exc_info=True)

        return await call_next(request)
