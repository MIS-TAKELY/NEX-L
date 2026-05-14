const DEFAULT_IMAGE = "/courses/bg.jpg";

export const compactNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

export const formatRating = (value) => {
  const numeric = Number(value || 0);
  return numeric ? numeric.toFixed(1) : "0.0";
};

export const getInitials = (value = "") =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "N";

const getTeacher = (course) => {
  const teacher = course?.teacher;
  if (!teacher) return { id: null, name: "NEXL Instructor" };
  if (typeof teacher === "string") {
    return { id: teacher, name: "NEXL Instructor" };
  }
  return {
    id: teacher._id || teacher.id || null,
    name: teacher.name || "NEXL Instructor",
  };
};

export const buildCourseInsights = (courses = []) => {
  const publishedCourses = courses.filter(
    (course) => !course?.status || course.status === "published",
  );
  const teacherIds = new Set();
  const categories = new Set();
  let ratingTotal = 0;
  let ratingCount = 0;
  let reviewTotal = 0;

  publishedCourses.forEach((course) => {
    const teacher = getTeacher(course);
    if (teacher.id) teacherIds.add(String(teacher.id));
    if (course?.category) categories.add(course.category);

    const rating = Number(course?.ratings?.average || 0);
    const count = Number(course?.ratings?.count || 0);
    if (rating > 0) {
      ratingTotal += rating * (count > 0 ? count : 1);
      ratingCount += count > 0 ? count : 1;
    }
    reviewTotal += count;
  });

  const averageRating = ratingCount > 0 ? ratingTotal / ratingCount : 0;

  const topCourses = [...publishedCourses]
    .sort((a, b) => {
      const ratingDiff = Number(b?.ratings?.average || 0) - Number(a?.ratings?.average || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b?.ratings?.count || 0) - Number(a?.ratings?.count || 0);
    })
    .slice(0, 3)
    .map((course) => {
      const teacher = getTeacher(course);
      return {
        id: course._id || course.id,
        title: course.title || "Untitled course",
        instructor: teacher.name,
        category: course.category || "General",
        image: course.thumbnail || course.image || DEFAULT_IMAGE,
        rating: formatRating(course?.ratings?.average),
        reviews: Number(course?.ratings?.count || 0),
        price:
          course.isFree || Number(course.price) === 0
            ? "Free"
            : `Rs. ${Number(course.price || 0).toLocaleString()}`,
        description:
          course.description ||
          "This course is currently live on the platform and ready for enrollment.",
      };
    });

  return {
    totalCourses: publishedCourses.length,
    totalInstructors: teacherIds.size,
    totalCategories: categories.size,
    totalReviews: reviewTotal,
    averageRating,
    topCourses,
  };
};

