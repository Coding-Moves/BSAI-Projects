from django.contrib import admin
from .models import FileMetadata, UserKeyPair, ActivityLog

@admin.register(FileMetadata)
class FileMetadataAdmin(admin.ModelAdmin):
    list_display = ('id', 'original_filename', 'owner', 'size', 'storage_backend', 'created_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserKeyPair)
class UserKeyPairAdmin(admin.ModelAdmin):
    list_display = ('user',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'file', 'timestamp')
    readonly_fields = ('timestamp',)
