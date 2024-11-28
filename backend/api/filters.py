from django_filters import FilterSet, BooleanFilter, CharFilter, IsoDateTimeFilter
from .models import Meeting

class MeetingFilter(FilterSet):

    datetime_beg__gt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="gt")
    datetime_beg__lt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="lt")
    datetime_beg = IsoDateTimeFilter(field_name="datetime_beg__date", lookup_expr="exact")
    location = CharFilter(field_name="location", lookup_expr="icontains")
    is_online = BooleanFilter(field_name="is_online")

    class Meta:
        model = Meeting
        fields = ["datetime_beg", "location", "is_online"]
