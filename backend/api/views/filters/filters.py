import django_filters
from api.models import Tag
from api.models.meeting import Meeting
from django_filters import BooleanFilter, CharFilter, FilterSet, IsoDateTimeFilter


class MeetingFilter(FilterSet):
    datetime_beg__gt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="gt")
    datetime_beg__lt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="lt")
    location = CharFilter(field_name="location", lookup_expr="icontains")
    is_online = BooleanFilter(field_name="is_online")
    tags = django_filters.ModelMultipleChoiceFilter(
        field_name="tags__slug", to_field_name="slug", queryset=Tag.objects.all(), conjoined=False
    )

    class Meta:
        model = Meeting
        fields = ["location", "is_online", "tags"]
