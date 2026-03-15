import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAddToCartMutation, useGetCartQuery, useRemoveFromCartMutation } from '../../store/slices/cartApi';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useSelector((state) => state.auth);
  const [addToCartApi] = useAddToCartMutation();
  const [removeFromCartApi] = useRemoveFromCartMutation();
  const { data: cartResp } = useGetCartQuery(undefined, { skip: !isLoggedIn || userRole !== 'student' });
  const cartItems = cartResp?.data?.items || [];

  const isInCart = cartItems.some((item) => item.course._id === course._id);

  const handleToggleCart = async (e) => {
    e.stopPropagation();
    try {
      if (isInCart) {
        await removeFromCartApi(course._id).unwrap();
      } else {
        await addToCartApi({ courseId: course._id, course }).unwrap();
      }
    } catch (err) {
      console.error(`Failed to ${isInCart ? 'remove from' : 'add to'} cart:`, err);
    }
  };

  return (
    <div className="group h-full flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">
      <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-100">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x225?text=No+Thumbnail"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-md text-white text-xs font-bold rounded-full">
          {course.category}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-primary dark:text-white leading-tight">
            {course.title}
          </h3>
        </div>

        {/* <p className="text-sm font-semibold text-accent mb-1">
          ✨ {course.benefit}
        </p> */}

        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Instructor</p>
            <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">
              {course?.teacher?.name || "NEXL Instructor"}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase mb-1">
              {course.level}
            </span>
            <p className="text-lg font-extrabold text-primary dark:text-accent">
              Rs. {course.price}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate(`/course/${course._id}`)}
          className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group"
        >
          View Course
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        {userRole === "student" && (
          <button
            onClick={handleToggleCart}
            className={`px-4 rounded-lg font-bold transition-all shadow-md active:scale-95 flex items-center justify-center border-2
                ${isInCart
                ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                : "bg-white border-primary text-primary hover:bg-primary hover:text-white dark:bg-zinc-800 dark:text-white dark:border-zinc-700 dark:hover:bg-primary dark:hover:border-primary"
              }`}
            title={isInCart ? "Remove from cart" : "Add to cart"}
          >
            {isInCart ? (
              <Icon icon="solar:trash-bin-trash-bold" size={24} />
            ) : (
              <Icon icon="solar:cart-large-2-bold" size={24} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
