import Badge from "../models/badge.model.js";
import UserBadge from "../models/user-badge.model.js";

/**
 * Evaluate and award badges for a student based on a performance context.
 *
 * @param {string} studentId  - The student's user ID
 * @param {string} courseId   - The course the activity occurred in
 * @param {object} context    - Performance data: { quizScore, assignmentGrade, participationCount, courseCompleted }
 *                              All values are percentages (0-100) or counts.
 * @returns {Array}           - Array of newly awarded UserBadge documents (populated with badge)
 */
export const checkAndAwardBadges = async (studentId, courseId, context = {}) => {
  const {
    quizScore = null,       // percentage 0-100
    assignmentGrade = null, // percentage 0-100
    participationCount = null, // e.g. number of forum posts / chat messages
    courseCompleted = false,
  } = context;

  // Fetch all active badges for this course
  const badges = await Badge.find({ course: courseId, isActive: true });
  if (!badges.length) return [];

  // Fetch badges already earned by this student to avoid re-awarding
  const alreadyEarned = await UserBadge.find({ student: studentId }).select("badge").lean();
  const earnedBadgeIds = new Set(alreadyEarned.map((ub) => ub.badge.toString()));

  const newlyAwarded = [];

  for (const badge of badges) {
    // Skip already-earned badges
    if (earnedBadgeIds.has(badge._id.toString())) continue;

    let qualifies = false;
    let awardedFor = "";

    switch (badge.type) {
      case "quiz_score":
        if (quizScore !== null && quizScore >= badge.threshold) {
          qualifies = true;
          awardedFor = `Quiz score: ${quizScore.toFixed(1)}%`;
        }
        break;

      case "assignment":
        if (assignmentGrade !== null && assignmentGrade >= badge.threshold) {
          qualifies = true;
          awardedFor = `Assignment grade: ${assignmentGrade.toFixed(1)}%`;
        }
        break;

      case "participation":
        if (participationCount !== null && participationCount >= badge.threshold) {
          qualifies = true;
          awardedFor = `Participation count: ${participationCount}`;
        }
        break;

      case "course_completion":
        if (courseCompleted) {
          qualifies = true;
          awardedFor = "Course completed";
        }
        break;

      default:
        break;
    }

    if (qualifies) {
      try {
        const userBadge = await UserBadge.create({
          student: studentId,
          badge: badge._id,
          course: courseId,
          awardedFor,
        });
        // Populate badge details for the response
        await userBadge.populate("badge");
        newlyAwarded.push(userBadge);
      } catch (err) {
        // Duplicate key = already awarded elsewhere (race condition); safe to ignore
        if (err.code !== 11000) {
          console.error("[BadgeService] Error awarding badge:", err.message);
        }
      }
    }
  }

  return newlyAwarded;
};
