FROM quay.io/keycloak/keycloak:26.0.0

# Set environment variables
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Expose port
EXPOSE 8080

# This needs to be set for the health check
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8080/health || exit 1

# Command is set in ECS task definition
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev"]