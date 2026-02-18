from django.urls import path
from . import views
from .views import book_list_api # Asegúrate de que esta línea esté presente

urlpatterns = [
    path('', views.home, name='home'),
    path('book/<int:book_id>/', views.book_detail, name='book_detail'),
    path('upload/', views.upload_book, name='upload_book'),
    path('register/', views.register, name='register'),
    path('contact/', views.contact, name='contact'),
    path('read_ebook/<int:book_id>/', views.read_ebook, name='read_ebook'),
    path('payment/<int:book_id>/', views.payment_screen, name='payment_screen'),
    path('api/books/', book_list_api, name='book_list_api'), # Asegúrate de que esta línea esté presente
]