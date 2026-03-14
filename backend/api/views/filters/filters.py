import django_filters
from api.models import Tag
from api.models.meeting import Meeting
from django.utils import timezone
from django_filters import BooleanFilter, CharFilter, FilterSet, IsoDateTimeFilter


class MeetingFilter(FilterSet):
    datetime_beg__gt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="gt")
    datetime_beg__lt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="lt")
    location = CharFilter(field_name="location", lookup_expr="icontains")
    is_online = BooleanFilter(field_name="is_online")
    tags = django_filters.ModelMultipleChoiceFilter(
        field_name="tags__id", to_field_name="id", queryset=Tag.objects.all(), conjoined=False
    )
    is_active = BooleanFilter(method="filter_is_active", label="Только актуальные")

    class Meta:
        model = Meeting
        fields = ["location", "is_online", "tags", "is_active"]

    def filter_is_active(self, queryset, name, value):
        if value:
            return queryset.filter(datetime_beg__gt=timezone.now())
        return queryset
