export const getProfileImageUrl = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  const imageUrl =
    candidate.imageUrl ??
    candidate.profileImageUrl ??
    candidate.profileImage ??
    candidate.avatarUrl ??
    candidate.picture;

  return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl : null;
};

export const getParticipantMatchKeys = (value: unknown): string[] => {
  if (!value || typeof value !== "object") return [];

  const candidate = value as Record<string, unknown>;
  return [
    candidate.id,
    candidate.memberId,
    candidate.userId,
    candidate.nickname,
    candidate.name,
    candidate.email,
    candidate.identity,
  ]
    .filter(
      (key): key is string | number =>
        typeof key === "string" || typeof key === "number",
    )
    .map(String);
};
