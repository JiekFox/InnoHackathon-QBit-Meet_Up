from django_filters import FilterSet, DateFilter
from .models import Meeting

class MeetingFilter(FilterSet):

    datetime_beg = DateFilter(field_name="datetime_beg__date", lookup_expr="exact")
    location = DateFilter(field_name="location", lookup_expr="icontains")
    is_online = DateFilter(field_name="is_online")

    class Meta:
        model = Meeting
        fields = ["datetime_beg", "location", "is_online"]