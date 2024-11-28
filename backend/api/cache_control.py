from django.core.cache import cache

def clear_meetings_cache():
    cache.clear()

def clear_users_cache():
    ...