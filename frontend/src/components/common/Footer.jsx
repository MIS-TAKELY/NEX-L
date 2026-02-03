const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 border-t border-gray-100">
      <div className="container mx-auto px-6 text-center text-gray-500">
        &copy; {new Date().getFullYear()} NEXL. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
