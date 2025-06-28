from django.urls import path
from .views import task_handler

urlpatterns = [
    path('', task_handler, name='task_handler'),
]
