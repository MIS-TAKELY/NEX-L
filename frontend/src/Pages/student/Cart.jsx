import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useGetCartQuery, useRemoveFromCartMutation } from '../../store/slices/cartApi';
import { Skeleton } from '@/components/ui/skeleton';

const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useSelector((state) => state.auth);
  const { data: cartResp, isLoading } = useGetCartQuery(undefined, { skip: !isLoggedIn || userRole !== 'student' });
  const [removeFromCartApi] = useRemoveFromCartMutation();

  // Selection state
  const [selectedCourses, setSelectedCourses] = useState([]);

  const cart = cartResp?.data?.items || [];

  const handleRemove = async (courseId) => {
    try {
      await removeFromCartApi(courseId).unwrap();
      // Remove from selection if it was selected
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleToggleSelect = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === cart.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(cart.map(item => item.course._id));
    }
  };

  const calculateTotal = () => {
    return cart
      .filter(item => selectedCourses.includes(item.course._id))
      .reduce((total, item) => {
        const price = typeof item.course.price === 'string'
          ? parseFloat(item.course.price.replace(/,/g, ''))
          : item.course.price;
        return total + (price || 0);
      }, 0);
  };

  const handleCheckout = () => {
    if (selectedCourses.length === 0) return;

    const total = calculateTotal();
    const courseIdsParam = selectedCourses.join(',');
    navigate(`/payment-method-selection?courseIds=${courseIdsParam}&amount=${total}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 py-12 px-6">
        <div className="container mx-auto">
          <div className="mb-8 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-background rounded-md border-2 border-border p-4 flex gap-6">
                  <Skeleton className="w-5 h-5 mt-2 rounded" />
                  <Skeleton className="w-32 h-32 rounded-md" />
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="w-10 h-10 rounded-md" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-md border-2 border-border p-5 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full" />
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <Icon icon="solar:cart-large-2-bold-duotone" className="mx-auto text-gray-300 dark:text-zinc-700 mb-6" width={120} />
          <h2 className="text-3xl font-bold text-foreground dark:text-foreground mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground dark:text-zinc-400 mb-8">Add some courses to get started!</p>
          <button
            onClick={() => navigate('/course-list')}
            className="px-8 py-3 bg-primary text-foreground rounded-md font-bold hover:bg-primary-hover transition-all shadow-md"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground dark:text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground dark:text-zinc-400">{cart.length} {cart.length === 1 ? 'course' : 'courses'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const isSelected = selectedCourses.includes(item.course._id);
              return (
                <div
                  key={item.course._id}
                  className={`bg-background dark:bg-zinc-900 rounded-md border-2 transition-all duration-300 hover:shadow-lg ${isSelected
                    ? 'border-primary dark:border-primary'
                    : 'border-border dark:border-border'
                    } p-4`}
                >
                  <div className="flex gap-6">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.course._id)}
                        className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
                      />
                    </div>

                    {/* Course Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-primary dark:text-foreground mb-1">
                            {item.course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-2">
                            by {item.course.teacher?.name || 'Instructor'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.course._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title="Remove from cart"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" size={24} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">
                          {item.course.category}
                        </span>
                        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-md">
                          {item.course.level}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground dark:text-zinc-400 mb-3 line-clamp-2">
                        {item.course.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-extrabold text-primary dark:text-accent">
                          Rs. {item.course.price}
                        </p>
                        <button
                          onClick={() => navigate(`/course/${item.course._id}`)}
                          className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1"
                        >
                          View Details
                          <Icon icon="solar:arrow-right-linear" size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background dark:bg-zinc-900 rounded-md border-2 border-border dark:border-border p-5 sticky top-6">
              <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-4">Order Summary</h2>

              {/* Select All */}
              <div className="mb-6 pb-4 border-b border-border dark:border-zinc-700">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === cart.length && cart.length > 0}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />
                  <span className="text-foreground dark:text-zinc-300 font-semibold group-hover:text-primary transition-colors">
                    Select All ({cart.length})
                  </span>
                </label>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground dark:text-zinc-400">
                  <span>Selected ({selectedCourses.length} {selectedCourses.length === 1 ? 'item' : 'items'})</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground dark:text-zinc-400">
                  <span>Discount</span>
                  <span className="text-green-600">- Rs. 0</span>
                </div>
                <div className="border-t border-border dark:border-zinc-700 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-foreground dark:text-foreground">
                    <span>Total</span>
                    <span>Rs. {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedCourses.length === 0}
                className={`w-full py-4 rounded-md font-bold transition-all shadow-md mb-3 ${selectedCourses.length === 0
                    ? 'bg-gray-300 dark:bg-zinc-700 text-muted-foreground dark:text-zinc-500 cursor-not-allowed'
                    : 'bg-primary text-foreground hover:bg-primary-hover'
                  }`}
              >
                {selectedCourses.length === 0
                  ? 'Select courses to checkout'
                  : `Proceed to Checkout (${selectedCourses.length})`
                }
              </button>

              <button
                onClick={() => navigate('/course-list')}
                className="w-full py-4 bg-background dark:bg-zinc-800 border-2 border-primary text-primary rounded-md font-bold hover:bg-primary hover:text-foreground dark:hover:bg-primary transition-all"
              >
                Add More Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
