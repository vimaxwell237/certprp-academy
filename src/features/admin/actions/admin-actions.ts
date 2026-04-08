"use server";

import { revalidatePath } from "next/cache";

import {
  saveAdminCertification,
  saveAdminCliChallenge,
  saveAdminCourse,
  saveAdminLab,
  saveAdminLesson,
  saveAdminModule,
  saveAdminPlan,
  saveAdminQuiz,
  saveAdminQuizQuestion,
  saveAdminTutor,
  setCertificationPublishState,
  setCliChallengePublishState,
  setCoursePublishState,
  setLabPublishState,
  setLessonPublishState,
  setModulePublishState,
  setPlanActiveState,
  setQuizPublishState,
  setTutorActiveState
} from "@/features/admin/data/admin-service";
import {
  AdminFormError,
  readBoolean,
  readDifficulty,
  readExpertiseList,
  readOptionalFile,
  readNonNegativeInteger,
  readOptionalId,
  readOptionalText,
  readQuestionType,
  readOptionalUrl,
  readPlanInterval,
  readPositiveInteger,
  readRecordId,
  readRequiredId,
  readRequiredText,
  readSlug,
  toActionErrorState,
  toActionSuccessState
} from "@/features/admin/lib/validation";
import {
  buildDragDropBucketsFromLabels,
  parseDragDropItemLines,
  splitMultilineEntries
} from "@/lib/questions/drag-drop";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";
import type { AdminActionState, QuizQuestionMutationInput } from "@/types/admin";

function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function handleAdminAction(
  execute: () => Promise<{ id: string; message: string }>,
  paths: string[]
): Promise<AdminActionState> {
  try {
    await requireAdminUser();
    const result = await execute();

    revalidatePaths(paths);

    return toActionSuccessState(result.message, result.id);
  } catch (error) {
    return toActionErrorState(error);
  }
}

async function handlePublishToggle(
  formData: FormData,
  execute: (recordId: string, nextValue: boolean) => Promise<string>,
  successMessage: (nextValue: boolean) => string,
  paths: string[]
) {
  const recordId = readRequiredText(formData, "recordId", "Record ID");
  const nextValue = String(formData.get("nextValue")) === "true";
  const id = await execute(recordId, nextValue);

  revalidatePaths(paths);

  return toActionSuccessState(successMessage(nextValue), id);
}

export async function saveCertificationAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminCertification({
      id: readRecordId(formData),
      name: readRequiredText(formData, "name", "Name"),
      slug: readSlug(formData),
      description: readOptionalText(formData, "description"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Certification saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminCertifications, APP_ROUTES.courses]);
}

export async function saveCourseAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminCourse({
      id: readRecordId(formData),
      certificationId: readRequiredId(formData, "certificationId", "Certification"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      description: readOptionalText(formData, "description"),
      level: readRequiredText(formData, "level", "Level"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Course saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminCourses, APP_ROUTES.courses]);
}

export async function saveModuleAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminModule({
      id: readRecordId(formData),
      courseId: readRequiredId(formData, "courseId", "Course"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      description: readOptionalText(formData, "description"),
      orderIndex: readPositiveInteger(formData, "orderIndex", "Order index"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Module saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminModules, APP_ROUTES.courses]);
}

export async function saveLessonAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminLesson({
      id: readRecordId(formData),
      moduleId: readRequiredId(formData, "moduleId", "Module"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      summary: readOptionalText(formData, "summary"),
      content: readOptionalText(formData, "content"),
      estimatedMinutes: readPositiveInteger(formData, "estimatedMinutes", "Estimated minutes"),
      videoUrl: readOptionalUrl(formData, "videoUrl"),
      orderIndex: readPositiveInteger(formData, "orderIndex", "Order index"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Lesson saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminLessons, APP_ROUTES.courses]);
}

export async function saveQuizAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminQuiz({
      id: readRecordId(formData),
      moduleId: readOptionalId(formData, "moduleId"),
      lessonId: readOptionalId(formData, "lessonId"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      description: readOptionalText(formData, "description"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Quiz saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminQuizzes, APP_ROUTES.quizzes]);
}

export async function saveQuizQuestionAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const questionType = readQuestionType(formData);
    const difficulty = readRequiredText(formData, "difficulty", "Difficulty");

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      throw new AdminFormError("Question difficulty is invalid.", {
        difficulty: "Select easy, medium, or hard."
      });
    }

    let showInQuiz = readBoolean(formData, "showInQuiz");
    let interactionConfig: QuizQuestionMutationInput["interactionConfig"] = null;
    let options: QuizQuestionMutationInput["options"] = [];

    if (questionType === "drag_drop_categorize") {
      const bucketLines = readRequiredText(
        formData,
        "dragDropBucketLines",
        "Bucket labels"
      );
      const itemLines = readRequiredText(
        formData,
        "dragDropItemLines",
        "Drag-and-drop items"
      );
      const bucketLabels = splitMultilineEntries(bucketLines);

      if (bucketLabels.length < 2) {
        throw new AdminFormError("Add at least two buckets for drag-and-drop questions.", {
          dragDropBucketLines: "Add at least two bucket labels, one per line."
        });
      }

      if (new Set(bucketLabels.map((label) => label.toLowerCase())).size !== bucketLabels.length) {
        throw new AdminFormError("Bucket labels must be unique.", {
          dragDropBucketLines: "Use unique bucket labels so every draggable item maps clearly."
        });
      }

      const buckets = buildDragDropBucketsFromLabels(bucketLabels);
      let dragDropItems;

      try {
        dragDropItems = parseDragDropItemLines(itemLines, buckets);
      } catch (error) {
        throw new AdminFormError(
          error instanceof Error ? error.message : "Drag-and-drop items are invalid.",
          {
            dragDropItemLines:
              error instanceof Error
                ? error.message
                : "Use one item per line in the format statement | bucket label."
          }
        );
      }

      if (dragDropItems.length < 2) {
        throw new AdminFormError(
          "Add at least two draggable items for a drag-and-drop question.",
          {
            dragDropItemLines:
              "Add at least two draggable items in the format statement | bucket label."
          }
        );
      }

      interactionConfig = { buckets };
      showInQuiz = false;
      options = dragDropItems.map((item, index) => ({
        optionText: item.optionText,
        isCorrect: false,
        matchKey: item.matchKey,
        orderIndex: index + 1
      }));
    } else {
      const optionCount = readPositiveInteger(formData, "optionCount", "Option count");

      if (optionCount < 2 || optionCount > 6) {
        throw new AdminFormError("Choice questions must have between 2 and 6 options.", {
          optionCount: "Use between 2 and 6 answer choices."
        });
      }

      let correctOption = 0;

      if (questionType === "single_choice") {
        const correctOptionRaw = readRequiredText(
          formData,
          "correctOption",
          "Correct option"
        );

        correctOption = Number(correctOptionRaw);

        if (
          !Number.isInteger(correctOption) ||
          correctOption < 1 ||
          correctOption > optionCount
        ) {
          throw new AdminFormError("Choose a valid correct option.", {
            correctOption: "Choose which option is correct."
          });
        }
      } else {
        showInQuiz = false;
      }

      options = Array.from({ length: optionCount }, (_, index) => {
        const optionIndex = index + 1;

        return {
          optionText: readRequiredText(
            formData,
            `option${optionIndex}Text`,
            `Answer option ${optionIndex}`
          ),
          isCorrect:
            questionType === "single_choice"
              ? correctOption === optionIndex
              : readBoolean(formData, `option${optionIndex}Correct`),
          matchKey: null,
          orderIndex: optionIndex
        };
      });
    }

    const id = await saveAdminQuizQuestion({
      id: readRecordId(formData),
      quizId: readRequiredId(formData, "quizId", "Quiz"),
      questionText: readRequiredText(formData, "questionText", "Question"),
      explanation: readOptionalText(formData, "explanation"),
      difficulty: difficulty as "easy" | "medium" | "hard",
      orderIndex: readPositiveInteger(formData, "orderIndex", "Order index"),
      questionType,
      showInQuiz,
      interactionConfig,
      questionImageAlt: readOptionalText(formData, "questionImageAlt"),
      questionImageFile: readOptionalFile(formData, "questionImage"),
      removeQuestionImage: readBoolean(formData, "removeQuestionImage"),
      questionImageSecondaryAlt: readOptionalText(formData, "questionImageSecondaryAlt"),
      questionImageSecondaryFile: readOptionalFile(formData, "questionImageSecondary"),
      removeQuestionImageSecondary: readBoolean(formData, "removeQuestionImageSecondary"),
      options
    });

    return {
      id,
      message: "Quiz question saved."
    };
  }, [
    APP_ROUTES.admin,
    APP_ROUTES.adminExamSimulator,
    APP_ROUTES.adminQuizzes,
    APP_ROUTES.quizzes,
    APP_ROUTES.examSimulator
  ]);
}

export async function saveLabAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminLab({
      id: readRecordId(formData),
      moduleId: readRequiredId(formData, "moduleId", "Module"),
      lessonId: readOptionalId(formData, "lessonId"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      summary: readOptionalText(formData, "summary"),
      instructions: readOptionalText(formData, "instructions"),
      difficulty: readDifficulty(formData),
      estimatedMinutes: readPositiveInteger(formData, "estimatedMinutes", "Estimated minutes"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "Lab saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminLabs, APP_ROUTES.labs]);
}

export async function saveCliChallengeAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminCliChallenge({
      id: readRecordId(formData),
      moduleId: readRequiredId(formData, "moduleId", "Module"),
      lessonId: readOptionalId(formData, "lessonId"),
      title: readRequiredText(formData, "title", "Title"),
      slug: readSlug(formData),
      summary: readOptionalText(formData, "summary"),
      scenario: readOptionalText(formData, "scenario"),
      objectives: readOptionalText(formData, "objectives"),
      difficulty: readDifficulty(formData),
      estimatedMinutes: readPositiveInteger(formData, "estimatedMinutes", "Estimated minutes"),
      isPublished: readBoolean(formData, "isPublished")
    });

    return {
      id,
      message: "CLI challenge saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminCliChallenges, APP_ROUTES.cliPractice]);
}

export async function saveTutorAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminTutor({
      id: readRecordId(formData),
      userId: readRequiredText(formData, "userId", "Tutor user ID"),
      displayName: readRequiredText(formData, "displayName", "Display name"),
      bio: readOptionalText(formData, "bio"),
      expertise: readExpertiseList(formData, "expertise"),
      isActive: readBoolean(formData, "isActive")
    });

    return {
      id,
      message: "Tutor profile saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminTutors, APP_ROUTES.tutors]);
}

export async function savePlanAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  return handleAdminAction(async () => {
    const id = await saveAdminPlan({
      id: readRecordId(formData),
      name: readRequiredText(formData, "name", "Name"),
      slug: readSlug(formData),
      description: readOptionalText(formData, "description"),
      priceAmount: readNonNegativeInteger(formData, "priceAmount", "Price"),
      billingInterval: readPlanInterval(formData),
      isActive: readBoolean(formData, "isActive")
    });

    return {
      id,
      message: "Plan saved."
    };
  }, [APP_ROUTES.admin, APP_ROUTES.adminPlans, APP_ROUTES.pricing, APP_ROUTES.billing]);
}

export async function toggleCertificationPublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setCertificationPublishState,
      (nextValue) => (nextValue ? "Certification published." : "Certification moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminCertifications, APP_ROUTES.courses]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleCoursePublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setCoursePublishState,
      (nextValue) => (nextValue ? "Course published." : "Course moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminCourses, APP_ROUTES.courses]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleModulePublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setModulePublishState,
      (nextValue) => (nextValue ? "Module published." : "Module moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminModules, APP_ROUTES.courses]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleLessonPublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setLessonPublishState,
      (nextValue) => (nextValue ? "Lesson published." : "Lesson moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminLessons, APP_ROUTES.courses]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleQuizPublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setQuizPublishState,
      (nextValue) => (nextValue ? "Quiz published." : "Quiz moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminQuizzes, APP_ROUTES.quizzes]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleLabPublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setLabPublishState,
      (nextValue) => (nextValue ? "Lab published." : "Lab moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminLabs, APP_ROUTES.labs]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleCliChallengePublishAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setCliChallengePublishState,
      (nextValue) => (nextValue ? "CLI challenge published." : "CLI challenge moved to draft."),
      [APP_ROUTES.admin, APP_ROUTES.adminCliChallenges, APP_ROUTES.cliPractice]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function toggleTutorActiveAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setTutorActiveState,
      (nextValue) => (nextValue ? "Tutor profile activated." : "Tutor profile deactivated."),
      [APP_ROUTES.admin, APP_ROUTES.adminTutors, APP_ROUTES.tutors]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}

export async function togglePlanActiveAction(
  _previousState: AdminActionState,
  formData: FormData
) {
  try {
    await requireAdminUser();

    return handlePublishToggle(
      formData,
      setPlanActiveState,
      (nextValue) => (nextValue ? "Plan activated." : "Plan deactivated."),
      [APP_ROUTES.admin, APP_ROUTES.adminPlans, APP_ROUTES.pricing, APP_ROUTES.billing]
    );
  } catch (error) {
    return toActionErrorState(error);
  }
}
