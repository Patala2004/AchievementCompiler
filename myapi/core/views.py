from typing import List
from .models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
import rest_framework.serializers as rest_serializers
from rest_framework.decorators import action
from . import serializers
from django.db.models import Q

from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset : List = User.objects.all()
    serializer_class : rest_serializers.ModelSerializer = serializers.UserModelSerializer
    authentication_classes = [TokenAuthentication] 

    def get_permissions(self):
        if self.action == "auth":  # per action
            self.permission_classes = [IsAuthenticated] # set the permission
        return super().get_permissions()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        searchpattern = self.request.query_params.get('filter')
        if searchpattern: 
            queryset = queryset.filter(
            Q(username__icontains=searchpattern) |
            Q(steam_id__icontains=searchpattern) |
            Q(psn_id__icontains=searchpattern) |
            Q(xbox_id__icontains=searchpattern) |
            Q(retroachievements_id__icontains=searchpattern)
        )
        return queryset
    
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User sign in."""
        serializer = serializers.UserLoginSerializer(data=request.data)
        user_query: List = User.objects.filter(username=request.data["username"])
        if(user_query and not user_query[0].is_active):
           return Response(status=status.HTTP_406_NOT_ACCEPTABLE)
        
        serializer.is_valid(raise_exception=True)
        user, token = serializer.save()
        data = {
            'user': serializers.UserModelSerializer(user).data,
            'access_token': token
        }
        return Response(data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def auth(self, request):
        #only authed users can access this
        user: User = request.user
        print(request.user)
        data = {
            'username': str(request.user),
            'auth': str(request.auth),
            'isadmin' : user.is_staff,
            'steam_id' : user.steam_id,
            'xbox_id' : user.xbox_id,
            'psn_id' : user.psn_id,
            'retroachievements_id' : user.retroachievements_id,
            'id' : user.id
        }
        #print(request.auth)
        return Response(data, status=status.HTTP_201_CREATED)
