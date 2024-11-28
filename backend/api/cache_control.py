from django.core.cache import cache

# Попытки сделать очистку кеша независимо друг от друга... Пока чет не очень

def clear_users_cache():
    """
    Очистка кэша для всех путей, связанных с пользователями.
    """
    cache.delete('users_list')

def clear_meetings_cache():
    """
    Очистка кэша для всех путей, связанных со встречами.
    """
    cache.delete('meetings_list')

def clear_all_cache():
    #cache.clear()
    ...