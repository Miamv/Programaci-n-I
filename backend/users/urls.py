from django.urls import path
from .views import RegisterView, UserProfileView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
