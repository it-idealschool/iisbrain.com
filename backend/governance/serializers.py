from rest_framework import serializers
from .models import DocumentActivity, DocumentCategory, PolicyDocument


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = '__all__'


class DocumentActivitySerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = DocumentActivity
        fields = ('id', 'action', 'comment', 'actor_name', 'created_at')


class PolicyDocumentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    activities = DocumentActivitySerializer(many=True, read_only=True)

    class Meta:
        model = PolicyDocument
        fields = '__all__'
        read_only_fields = ('created_by', 'approved_by')
