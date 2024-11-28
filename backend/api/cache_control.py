from django.core.cache import cache

def clear_meetings_cache():
    cache.delete('meetings_list')