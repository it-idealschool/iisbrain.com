from django.db import models


class RegistrationSettings(models.Model):
    """Singleton row controlling whether the public, no-login
    self-registration forms are open or closed. Admins can flip
    these from the dashboard; the public /register/* pages read
    them to decide whether to show the form or a "closed" message.
    """

    teacher_registration_open = models.BooleanField(default=True)
    admin_staff_registration_open = models.BooleanField(default=True)
    transport_registration_open = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Registration settings'
        verbose_name_plural = 'Registration settings'

    def __str__(self):
        return 'Registration settings'

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
