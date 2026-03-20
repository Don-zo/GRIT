package grit.global.util;

import java.security.SecureRandom;

public class InviteCodeGenerator {

    // 가독성을 위해 0, O, 1, I 제외함
    private static final String CHARACTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    public static String generate() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(index));
        }
        return sb.toString().toUpperCase();
    }
}