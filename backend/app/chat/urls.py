from django.urls import path
from . import views

urlpatterns = [
    path('conversations/',
         views.ConversationListView.as_view(),
         name='conversations'),

    path('conversations/<int:conversation_id>/messages/',
         views.MessageListView.as_view(),
         name='messages'),

    path('conversations/<int:conversation_id>/upload/',
         views.FileUploadView.as_view(),
         name='file-upload'),

    # Apagar mensagem (para mim ou para todos)
    path('messages/<int:message_id>/',
         views.MessageDeleteView.as_view(),
         name='message-delete'),
]