import { Icon } from '@iconify/react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useContext(AppContext);

  const calculateTotal = () => {
    return cart.reduce((total, course) => {
      const price = parseFloat(course.price.replace(/,/g, ''));
      return total + price;
    }, 0);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <Icon icon="solar:cart-large-2-bold-duotone" className="mx-auto text-gray-300 dark:text-zinc-700 mb-6" width={120} />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-8">Add some courses to get started!</p>
          <button
            onClick={() => navigate('/course-list')}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-md"
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-zinc-400">{cart.length} {cart.length === 1 ? 'course' : 'courses'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex gap-6">
                  {/* Course Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  </div>

                  {/* Course Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-primary dark:text-white mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">
                          by {course.instructor}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(course.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" size={24} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {course.category}
                      </span>
                      <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">
                        {course.level}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="text-2xl font-extrabold text-primary dark:text-accent">
                        Rs. {course.price}
                      </p>
                      <button
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1"
                      >
                        View Details
                        <Icon icon="solar:arrow-right-linear" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-100 dark:border-zinc-800 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                  <span>Discount</span>
                  <span className="text-green-600">- Rs. 0</span>
                </div>
                <div className="border-t border-gray-200 dark:border-zinc-700 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>Rs. {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-md mb-3">
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/course-list')}
                className="w-full py-4 bg-white dark:bg-zinc-800 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white dark:hover:bg-primary transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
