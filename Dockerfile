FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj", "CodeCodexBackend/CodeCodexBackend/"]
COPY ["CodeCodexBackend/CodeCodexBackend.ServiceDefaults/CodeCodexBackend.ServiceDefaults.csproj", "CodeCodexBackend/CodeCodexBackend.ServiceDefaults/"]

RUN dotnet restore "CodeCodexBackend/CodeCodexBackend/CodeCodexBackend.csproj"

COPY . .

WORKDIR "/src/CodeCodexBackend/CodeCodexBackend"
RUN dotnet build "CodeCodexBackend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "CodeCodexBackend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CodeCodexBackend.dll"]