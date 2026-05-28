from rest_framework.throttling import SimpleRateThrottle


class RegisterRateThrottle(SimpleRateThrottle):
    """Throttle used for the register endpoint (per IP)."""
    scope = 'register'

    def get_cache_key(self, request, view):
        # Use the client IP as key (prevent mass registrations from an IP)
        return self.get_ident(request)


class LoginRateThrottle(SimpleRateThrottle):
    """Throttle used for the login endpoint: per-user when authenticated, otherwise per-IP."""
    scope = 'login'

    def get_cache_key(self, request, view):
        user = getattr(request, 'user', None)
        if user and getattr(user, 'is_authenticated', False):
            return f'user-{user.id}'
        return self.get_ident(request)
