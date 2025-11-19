# STAGE 1 - build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copia csproj e restaura
COPY *.csproj ./
RUN dotnet restore

# copia o restante
COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# STAGE 2 - runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "IsonelApi.dll"]
