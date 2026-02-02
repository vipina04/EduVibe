from django.contrib import admin
from django.urls import path
from users.views import LoginView, ForgotPasswordView, VerifyOTPView, RegisterView, VerifyRegistrationOTPView
from admin_tasks.views import ApproveUserView, ClassCreateView, SubjectCreateView, ChapterCreateView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view()),
    path('api/forgot-password/', ForgotPasswordView.as_view()),
    path('api/verify-otp/', VerifyOTPView.as_view()),
    path('api/register/', RegisterView.as_view()),
    path('api/verify-reg-otp/', VerifyRegistrationOTPView.as_view()),
    path('api/approve-user/', ApproveUserView.as_view()),
    path('api/add-class/', ClassCreateView.as_view()),
    path('api/add-subject/', SubjectCreateView.as_view()),
    path('api/add-chapter/', ChapterCreateView.as_view()),
    # Add more URLs for other views
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
















# """
# URL configuration for backend project.

# The `urlpatterns` list routes URLs to views. For more information please see:
#     https://docs.djangoproject.com/en/6.0/topics/http/urls/
# Examples:
# Function views
#     1. Add an import:  from my_app import views
#     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# Class-based views
#     1. Add an import:  from other_app.views import Home
#     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# Including another URLconf
#     1. Import the include() function: from django.urls import include, path
#     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# """
# from django.contrib import admin
# from django.urls import path

# urlpatterns = [
#     path('admin/', admin.site.urls),
# ]
