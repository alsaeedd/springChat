export const environment = {
    production: true,
    apiUrl: 'https://54.81.141.235:8443',  // Your EC2 instance IP with backend port
    keycloakUrl: 'https://54.81.141.235:9090',  // Your Keycloak URL (note HTTPS)
    keycloakRealm: 'springChat',  // Or whatever realm you created
    keycloakClientId: 'springChat-app',  // Your client ID in Keycloak
    keycloakConfig: {
      url: 'https://54.81.141.235:9090',
      realm: 'springChat',
      clientId: 'springChat-app',
      checkLoginIframe: false  // Try disabling the iframe check completely
    }
  };