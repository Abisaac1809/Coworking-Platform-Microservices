from fastapi import Request
from fastapi.responses import JSONResponse
from errors.business_errors import BusinessError
from errors.server_errors import InternalServerError


async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, (BusinessError, InternalServerError)):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
