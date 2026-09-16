from django.contrib import admin
from .models import DocumentActivity, DocumentCategory, PolicyDocument

admin.site.register(DocumentCategory)
admin.site.register(PolicyDocument)
admin.site.register(DocumentActivity)
