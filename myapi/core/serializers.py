from .models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.contrib.auth import password_validation, authenticate

class UserModelSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,      # never return it in API responses
        required=False,       # optional for PUT/PATCH
        allow_blank=True      # allows empty string if you want
    )
    class Meta:
        model = User
        fields = (
            'username',
            'steam_id',
            'xbox_id',
            'psn_id',
            'retroachievements_id',
            'password',
            'id'
        )
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)   # hash the password
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)  # hash new password
        instance.save()
        return instance
        
class UserLoginSerializer(serializers.Serializer):

    # Campos que vamos a requerir
    username = serializers.CharField(min_length=3, max_length=64)
    password = serializers.CharField(min_length=8, max_length=64)

    # Primero validamos los datos
    def validate(self, data):

        # authenticate recibe las credenciales, si son válidas devuelve el objeto del usuario
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Las credenciales no son válidas')

        # Guardamos el usuario en el contexto para posteriormente en create recuperar el token
        self.context['user'] = user
        return data

    def create(self, data):
        """Generar o recuperar token."""
        token, created = Token.objects.get_or_create(user=self.context['user'])
        return self.context['user'], token.key