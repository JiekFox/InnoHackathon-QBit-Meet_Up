import django_filters
from api.models import Tag
from api.models.meeting import Meeting
from django.utils import timezone
from django_filters import BooleanFilter, CharFilter, ChoiceFilter, FilterSet, IsoDateTimeFilter

STATUS_CHOICES = (
    ("active", "Активные (будущие)"),
    ("past", "Прошедшие"),
    ("all", "Все"),
)


class MeetingFilter(FilterSet):
    datetime_beg__gt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="gt")
    datetime_beg__lt = IsoDateTimeFilter(field_name="datetime_beg", lookup_expr="lt")
    location = CharFilter(field_name="location", lookup_expr="icontains")
    is_online = BooleanFilter(field_name="is_online")
    tags = django_filters.ModelMultipleChoiceFilter(
        field_name="tags__id", to_field_name="id", queryset=Tag.objects.all(), conjoined=False
    )
    status = ChoiceFilter(choices=STATUS_CHOICES, null_value="active", method="filter_status", label="Статус митапа")

    def __init__(self, data=None, *args, **kwargs):
        if data is not None and ("status" not in data or data["status"] in django_filters.constants.EMPTY_VALUES):
            data = data.copy()
            data["status"] = "active"
        super().__init__(data, *args, **kwargs)

    class Meta:
        model = Meeting
        fields = ["location", "is_online", "tags", "status"]

    def filter_status(self, queryset, name, value):
        now = timezone.now()
        if value == "active":
            return queryset.filter(datetime_beg__gt=now)
        elif value == "past":
            return queryset.filter(datetime_beg__lte=now)
        return queryset
