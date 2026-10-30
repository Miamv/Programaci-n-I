from rest_framework import serializers

from .models import Brand, ProfessionalProfile, Project, Media, Contact, StudioAbout, TeamMember


class BrandSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = '__all__'

    def get_logo(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.logo.url)
        return obj.logo.url


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalProfile
        fields = '__all__'

    def get_avatar(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url


class MediaSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = '__all__'

    def get_file(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


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
            first_media = next(
                (m for m in media_cache if m.media_type in ('image', 'render')),
                None
            )
        else:
            first_media = obj.media.filter(media_type__in=['image', 'render']).first()

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


class StudioAboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioAbout
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            data['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        else:
            data['image'] = None
        return data


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.avatar:
            data['avatar'] = request.build_absolute_uri(instance.avatar.url) if request else instance.avatar.url
        else:
            data['avatar'] = None
        return data
