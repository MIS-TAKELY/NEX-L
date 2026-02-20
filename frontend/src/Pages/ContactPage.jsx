import Navbar from "../components/common/Navbar";
import ContactSection from "../components/landing/ContactSection";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24">
        <ContactSection />
      </div>
    </div>
  );
};

export default ContactPage;
