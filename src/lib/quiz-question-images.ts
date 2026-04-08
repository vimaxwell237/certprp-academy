export const QUIZ_QUESTION_IMAGES_BUCKET = "quiz-question-images";
export const QUIZ_QUESTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const QUIZ_QUESTION_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
] as const;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

type QuestionImagePublicUrlClient = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => {
        data: {
          publicUrl: string;
        };
      };
    };
  };
};

function sanitizeExtension(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function getFileExtension(file: Pick<File, "name" | "type">) {
  const extensionFromName = sanitizeExtension(file.name.split(".").pop() ?? "");

  if (extensionFromName) {
    return extensionFromName;
  }

  return MIME_EXTENSION_MAP[file.type] ?? "img";
}

export function isQuizQuestionImageType(value: string) {
  return QUIZ_QUESTION_IMAGE_ALLOWED_TYPES.includes(
    value as (typeof QUIZ_QUESTION_IMAGE_ALLOWED_TYPES)[number]
  );
}

export function buildQuizQuestionImagePath(
  questionId: string,
  file: Pick<File, "name" | "type">,
  variant: "primary" | "secondary" = "primary"
) {
  return `${questionId}/${variant}-${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file)}`;
}

export function getQuizQuestionImagePublicUrl(
  client: QuestionImagePublicUrlClient,
  path: string | null
) {
  if (!path) {
    return null;
  }

  return client.storage.from(QUIZ_QUESTION_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}
