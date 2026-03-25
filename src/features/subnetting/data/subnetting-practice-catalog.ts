export function shouldShowSubnettingTrainerForLesson(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
) {
  if (courseSlug !== "ccna-200-301-preparation" || moduleSlug !== "network-fundamentals") {
    return false;
  }

  return new Set([
    "ipv4-addressing-fundamentals",
    "configuring-and-verifying-ipv4-addresses",
    "subnetting-fundamentals",
    "vlsm-and-advanced-subnetting",
    "private-ipv4-addressing"
  ]).has(lessonSlug);
}
