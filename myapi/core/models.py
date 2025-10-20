from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    steam_id : str = models.CharField(null=True, default="", unique=False, max_length=17, blank=True)
    xbox_id : str = models.CharField(null=True, default="", unique=False, max_length=17, blank=True)
    psn_id : str = models.CharField(null=True, default="", unique=False, max_length=30, blank=True)
    retroachievements_id : str = models.CharField(null=True, default="", unique=False, max_length=17, blank=True)
    pass
