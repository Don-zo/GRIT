package grit.domain.auth.infrastructure.oauth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationExchange;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.endpoint.RestClientAuthorizationCodeTokenResponseClient;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GoogleOAuthClient {

    private static final String AUTHORIZATION_URI = "https://accounts.google.com/o/oauth2/v2/auth";

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.provider.google.token-uri}")
    private String tokenUri;

    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String userInfoUri;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    public OAuth2User getOAuth2User(String code) {
        OAuth2AccessTokenResponse tokenResponse = exchangeCodeForToken(code);
        return getUserInfo(tokenResponse.getAccessToken());
    }

    private OAuth2AccessTokenResponse exchangeCodeForToken(String code) {
        OAuth2AuthorizationCodeGrantRequest grantRequest = buildGrantRequest(code);
        RestClientAuthorizationCodeTokenResponseClient tokenClient =
                new RestClientAuthorizationCodeTokenResponseClient();
        return tokenClient.getTokenResponse(grantRequest);
    }

    private OAuth2AuthorizationCodeGrantRequest buildGrantRequest(String code) {
        ClientRegistration clientRegistration = buildClientRegistration();
        OAuth2AuthorizationExchange exchange = buildAuthorizationExchange(code);
        return new OAuth2AuthorizationCodeGrantRequest(clientRegistration, exchange);
    }

    private OAuth2AuthorizationExchange buildAuthorizationExchange(String code) {
        OAuth2AuthorizationRequest authRequest = OAuth2AuthorizationRequest
                .authorizationCode()
                .clientId(clientId)
                .authorizationUri(AUTHORIZATION_URI)
                .redirectUri(redirectUri)
                .scope("profile", "email")
                .state("state")
                .build();

        OAuth2AuthorizationResponse authResponse = OAuth2AuthorizationResponse
                .success(code)
                .redirectUri(redirectUri)
                .state("state")
                .build();

        return new OAuth2AuthorizationExchange(authRequest, authResponse);
    }

    private OAuth2User getUserInfo(OAuth2AccessToken accessToken) {
        ClientRegistration clientRegistration = buildClientRegistration();
        OAuth2UserRequest userRequest = new OAuth2UserRequest(clientRegistration, accessToken);

        DefaultOAuth2UserService userService = new DefaultOAuth2UserService();
        return userService.loadUser(userRequest);
    }

    private ClientRegistration buildClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(redirectUri)
                .scope("profile", "email")
                .authorizationUri(AUTHORIZATION_URI)
                .tokenUri(tokenUri)
                .userInfoUri(userInfoUri)
                .userNameAttributeName("id")
                .clientName("Google")
                .build();
    }
}
