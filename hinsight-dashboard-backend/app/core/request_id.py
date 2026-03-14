import uuid
from contextvars import ContextVar

# Context variable so logs can include request_id even deep in services
request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)


def new_request_id() -> str:
    return uuid.uuid4().hex
