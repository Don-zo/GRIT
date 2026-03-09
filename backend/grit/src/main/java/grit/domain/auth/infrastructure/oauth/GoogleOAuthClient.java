package grit.domain.auth.infrastructure.oauth;

import grit.global.exception.OAuthLoginFailedException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.RestClientAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationExchange;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Slf4j
@Component
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

    private RestClientAuthorizationCodeTokenResponseClient tokenClient;
    private DefaultOAuth2UserService userService;
    private ClientRegistration clientRegistration;

    @PostConstruct
    private void init() {
        this.tokenClient = new RestClientAuthorizationCodeTokenResponseClient();
        this.userService = new DefaultOAuth2UserService();
        this.clientRegistration = buildClientRegistration();
    }

    public OAuth2User getOAuth2User(String code, String redirectUri) {
        try {
            OAuth2AccessTokenResponse tokenResponse = exchangeCodeForToken(code, redirectUri);
            return getUserInfo(tokenResponse.getAccessToken());
        } catch (OAuth2AuthorizationException e) {
            OAuth2Error error = e.getError();

            log.warn("Google OAuth token 교환 실패: errorCode={}, description={}",
                    error != null ? error.getErrorCode() : "N/A",
                    error != null ? error.getDescription() : "N/A");

            throw new OAuthLoginFailedException("OAuth 로그인에 실패했습니다. 다시 시도해주세요.");
        }
    }

    private OAuth2AccessTokenResponse exchangeCodeForToken(String code, String redirectUri) {
        OAuth2AuthorizationCodeGrantRequest grantRequest = buildGrantRequest(code, redirectUri);
        return tokenClient.getTokenResponse(grantRequest);
    }

    private OAuth2AuthorizationCodeGrantRequest buildGrantRequest(String code, String redirectUri) {
        OAuth2AuthorizationExchange exchange = buildAuthorizationExchange(code, redirectUri);
        return new OAuth2AuthorizationCodeGrantRequest(clientRegistration, exchange);
    }

    private OAuth2AuthorizationExchange buildAuthorizationExchange(String code, String redirectUri) {
        OAuth2AuthorizationRequest authRequest = OAuth2AuthorizationRequest
                .authorizationCode()
                .clientId(clientId)
                .authorizationUri(AUTHORIZATION_URI)
                .redirectUri(redirectUri)
                .scope("profile", "email")
                .state(null)
                .build();

        OAuth2AuthorizationResponse authResponse = OAuth2AuthorizationResponse
                .success(code)
                .redirectUri(redirectUri)
                .state(null)
                .build();

        return new OAuth2AuthorizationExchange(authRequest, authResponse);
    }

    private OAuth2User getUserInfo(OAuth2AccessToken accessToken) {
        OAuth2UserRequest userRequest = new OAuth2UserRequest(clientRegistration, accessToken);
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
