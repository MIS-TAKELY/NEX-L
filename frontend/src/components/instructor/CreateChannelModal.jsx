import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const CreateChannelModal = ({ courseId, isOpen, onClose, onChannelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BACKEND}/api/v1/stream/channels/${courseId}`,
        { name, description },
        { withCredentials: true }
      );

      if (data.success) {
        showToast('Channel created successfully!', 'success');
        onChannelCreated(data);
        onClose();
        setName('');
        setDescription('');
      }
    } catch (error) {
      console.error('Create channel error:', error);
      showToast(error.response?.data?.message || 'Failed to create channel', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:hashtag-bold" className="text-primary w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Create New Channel</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition-colors">
            <Icon icon="solar:close-circle-bold" className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Channel Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">#</span>
              <input
                type="text"
                placeholder="e.g. general, announcements, q-a"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full pl-8 pr-4 py-3 bg-muted border border-border rounded-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Description (Optional)</label>
            <textarea
              placeholder="What is this channel for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-foreground min-h-[100px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-4 bg-primary text-foreground rounded-md font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
          >
            {loading ? 'Creating...' : (
              <>
                Create Channel
                <Icon icon="solar:add-circle-bold" className="group-hover:rotate-90 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
