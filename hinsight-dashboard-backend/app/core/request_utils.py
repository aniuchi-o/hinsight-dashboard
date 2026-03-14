from fastapi import Request


def client_ip(request: Request) -> str | None:
    # If later behind a proxy/load balancer, you'll handle X-Forwarded-For properly.
    return request.client.host if request.client else None


def user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")
