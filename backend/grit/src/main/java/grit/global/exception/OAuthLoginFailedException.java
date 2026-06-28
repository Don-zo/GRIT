package grit.global.exception;

public class OAuthLoginFailedException extends RuntimeException {

    public OAuthLoginFailedException(String message) {
        super(message);
    }
}
