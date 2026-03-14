from contextvars import ContextVar

data_region_ctx: ContextVar[str] = ContextVar("data_region", default="")
