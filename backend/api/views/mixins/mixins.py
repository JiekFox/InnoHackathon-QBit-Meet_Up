from datetime import datetime, timezone

from api.models.meetups import Meeting, SignedToMeeting
from api.models.users import UserProfile
from api.views.filters.filters import MeetingFilter
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class MeetingPagination(PageNumberPagination):
    """
    Класс для настройки пагинации.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class SubscriptionMixin:
    @staticmethod
    def get_meeting(pk):
        try:
            return Meeting.objects.get(pk=pk), None
        except Meeting.DoesNotExist:
            return None, Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def manage_subscription(user, meeting, action="subscribe"):
        if action == "subscribe":
            subscription, created = SignedToMeeting.objects.get_or_create(user=user, meeting=meeting)
            return (
                {"message": "Subscribed successfully"} if created else {"message": "Already subscribed"},
                status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        if action == "unsubscribe":
            try:
                subscription = SignedToMeeting.objects.get(user=user, meeting=meeting)
                subscription.delete()
                return {"message": "Unsubscribed successfully"}, status.HTTP_204_NO_CONTENT
            except SignedToMeeting.DoesNotExist:
                return {"error": "Subscription not found"}, status.HTTP_404_NOT_FOUND


class MeetingQueryMixin:
    def get_filtered_paginated_meetings(self, meetings, request):
        meeting_filter = MeetingFilter(request.query_params, queryset=meetings)
        if not meeting_filter.is_valid():
            return None, Response(meeting_filter.errors, status=status.HTTP_400_BAD_REQUEST)

        paginator = MeetingPagination()
        paginated = paginator.paginate_queryset(meeting_filter.qs, request)
        serializer = self.get_serializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)


class UserMeetingQueryMixin(MeetingQueryMixin):
    def get_user_by_id(self, pk):
        try:
            return UserProfile.objects.get(id=pk), None
        except UserProfile.DoesNotExist:
            return None, Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def get_signed_meetings(self, user):
        return Meeting.objects.filter(attendees__user=user).exclude(author=user)

    def get_authored_meetings(self, user):
        return Meeting.objects.filter(author=user)

    def get_signed_active_meetings(self, user):
        return self.get_signed_meetings(user).filter(datetime_beg__gt=datetime.now(timezone.utc))

    def get_authored_active_meetings(self, user):
        return self.get_authored_meetings(user).filter(datetime_beg__gt=datetime.now(timezone.utc))
