from django.db import transaction
from rest_framework import serializers
from .models import InventoryItem, ItemCategory, ItemRequest, ItemRequestLine, RequestAction, StockTransaction


class ItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCategory
        fields = '__all__'


class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'


class ItemRequestLineSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = ItemRequestLine
        fields = '__all__'
        read_only_fields = ('request',)


class RequestActionSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = RequestAction
        fields = '__all__'


class ItemRequestSerializer(serializers.ModelSerializer):
    lines = ItemRequestLineSerializer(many=True)
    actions = RequestActionSerializer(many=True, read_only=True)
    requester_name = serializers.CharField(source='requester.username', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ItemRequest
        fields = '__all__'
        read_only_fields = ('requester', 'status')

    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop('lines')
        request = ItemRequest.objects.create(**validated_data)
        for line in lines:
            ItemRequestLine.objects.create(request=request, **line)
        return request


class StockTransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = StockTransaction
        fields = '__all__'
        read_only_fields = ('created_by',)
