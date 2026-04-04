import { updateUser } from '@/store/slices/authSlice';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const InstructorSettings = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);

  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [imagePreview, setImagePreview] = useState(userData?.image || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setImagePreview(userData.image || null);
    }
  }, [userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(updateUser({ name, email, image: imagePreview }));
    alert('Settings updated successfully!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-outfit w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
          <Icon icon="solar:settings-bold-duotone" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile information and account details.</p>
        </div>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm p-8 transition-all hover:shadow-md">
        <form onSubmit={handleSave} className="space-y-8">

          {/* Profile Photo Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:camera-outline" className="text-primary" size={24} />
              Profile Photo
            </h3>
            <div className="flex items-center gap-6 bg-muted/50 p-6 rounded-md border border-border">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <div className="w-24 h-24 rounded-md bg-card border-4 border-background shadow-md overflow-hidden flex items-center justify-center group-hover:border-primary/20 transition-all">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Icon icon="solar:user-circle-bold-duotone" size={48} className="text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon icon="solar:camera-add-bold" size={24} className="text-foreground" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground mb-1">Upload a new photo</p>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                  Recommended size is 256x256px. Supported formats: JPG, PNG, or GIF. Max size 2MB.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-5 py-2 text-sm font-bold text-primary bg-primary/10 rounded-md hover:bg-primary hover:text-foreground transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border"></div>

          {/* Personal Information Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:user-id-outline" className="text-primary" size={24} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/50 p-6 rounded-md border border-border">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground/80">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Icon icon="solar:user-bold-duotone" size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-card rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground/80">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Icon icon="solar:letter-bold-duotone" size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-card rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-border">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-foreground font-bold rounded-md shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Icon icon="solar:diskette-bold-duotone" size={20} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorSettings;
