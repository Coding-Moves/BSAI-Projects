from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Frontend pages (simple template-based dashboard)
    path('', TemplateView.as_view(template_name='login.html')),
    path('login.html', TemplateView.as_view(template_name='login.html')),
    path('register.html', TemplateView.as_view(template_name='register.html')),
    path('dashboard.html', TemplateView.as_view(template_name='dashboard.html')),
]

# Serve storage & static in dev
if settings.DEBUG:
    urlpatterns += static('/storage/', document_root=getattr(settings, 'STORAGE_ROOT', settings.BASE_DIR / 'storage'))
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
