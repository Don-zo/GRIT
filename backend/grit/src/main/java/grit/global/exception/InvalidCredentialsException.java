package grit.global.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("이메일 혹은 비밀번호가 일치하지 않습니다.");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
