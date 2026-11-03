from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models
from rest_framework import serializers

from .models import Brand, ProfessionalProfile, Project, Media, Contact, StudioAbout, TeamMember


class AbsoluteMediaUrlMixin:
    """
    Convierte los campos de archivo configurados en `media_fields` en URLs absolutas
    al serializar la respuesta, manteniendo los campos del modelo habilitados para
    escritura (POST, PUT, PATCH con multipart/form-data).
    """
    media_fields = ()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        for field_name in self.media_fields:
            file_field = getattr(instance, field_name, None)
            if file_field:
                data[field_name] = (
                    request.build_absolute_uri(file_field.url)
                    if request
                    else file_field.url
                )
            else:
                data[field_name] = None
        return data


class BrandSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    media_fields = ('logo',)

    class Meta:
        model = Brand
        fields = '__all__'


class ProfessionalProfileSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    media_fields = ('avatar',)

    class Meta:
        model = ProfessionalProfile
        fields = '__all__'


class MediaSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    media_fields = ('file',)

    class Meta:
        model = Media
        fields = '__all__'

    def validate(self, attrs):
        instance = self.instance
        media_type = attrs.get('media_type', getattr(instance, 'media_type', None))
        plan_type = attrs.get('plan_type', getattr(instance, 'plan_type', None))
        file_obj = attrs.get('file', getattr(instance, 'file', None))

        try:
            Media.validate_media_coherence(media_type, plan_type, file_obj)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        return attrs


class ProjectSerializer(serializers.ModelSerializer):
    brands = BrandSerializer(many=True, read_only=True)
    media = MediaSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()
    coverImage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def _get_cover_url(self, obj):
        media_cache = getattr(obj, '_prefetched_objects_cache', {}).get('media')
        if media_cache is not None:
            # 1° prioridad: imagen o render general (sin plan_type)
            first_media = next(
                (
                    m for m in media_cache
                    if m.media_type in ('image', 'render') and not m.plan_type
                ),
                None,
            )
            # 2° prioridad (fallback): cualquier imagen o render si solo tiene planos
            if first_media is None:
                first_media = next(
                    (m for m in media_cache if m.media_type in ('image', 'render')),
                    None,
                )
        else:
            qs = obj.media.filter(media_type__in=['image', 'render'])
            first_media = (
                qs.filter(models.Q(plan_type__isnull=True) | models.Q(plan_type='')).first()
                or qs.first()
            )

        if not first_media or not first_media.file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(first_media.file.url)
        return first_media.file.url

    def get_cover_image(self, obj):
        return self._get_cover_url(obj)

    def get_coverImage(self, obj):
        return self._get_cover_url(obj)


class ContactSerializer(serializers.ModelSerializer):
    profile_name = serializers.ReadOnlyField(source='profile.name')

    class Meta:
        model = Contact
        fields = '__all__'


class StudioAboutSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    media_fields = ('image',)

    class Meta:
        model = StudioAbout
        fields = '__all__'


class TeamMemberSerializer(AbsoluteMediaUrlMixin, serializers.ModelSerializer):
    media_fields = ('avatar',)

    class Meta:
        model = TeamMember
        fields = '__all__'
