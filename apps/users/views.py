"""
Vues pour l'application users de FubaMaps.
Gere inscription, profil, deconnexion et changement de mot de passe.
"""

from rest_framework import generics, status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserProfileSerializer,
    LogoutSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register/
    Inscription d'un utilisateur.
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/users/login/
    Connexion utilisateur (retourne JWT).
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = data["user"]

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": data["refresh"],
                    "access": data["access"],
                },
            },
            status=status.HTTP_200_OK,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /api/users/me/
    Consultation et modification du profil connecte.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UpdateProfileView(APIView):
    """
    PUT /api/users/profile/update/
    Mise a jour du profil utilisateur.
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/users/logout/
    Deconnexion JWT (blacklist le refresh token).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Deconnexion reussie."},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    """
    POST /api/users/change-password/
    Modification du mot de passe.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Mot de passe modifie avec succes."},
            status=status.HTTP_200_OK,
        )
