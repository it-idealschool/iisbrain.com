from django.contrib import admin
from .models import InventoryItem, ItemCategory, ItemRequest, ItemRequestLine, RequestAction, StockTransaction

admin.site.register(ItemCategory)
admin.site.register(InventoryItem)
admin.site.register(ItemRequest)
admin.site.register(ItemRequestLine)
admin.site.register(RequestAction)
admin.site.register(StockTransaction)
