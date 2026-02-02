import { Icon } from '@iconify/react';
import { useState } from 'react';

const Messages = () => {
  const [selectedThread, setSelectedThread] = useState(0);

  const threads = [
    {
      id: 1,
      student: 'Sarah Johnson',
      course: 'Web Development Fundamentals',
      lastMessage: 'Can you explain the difference between let and const?',
      time: '2 hours ago',
      unread: true,
      avatar: 'Sarah'
    },
    {
      id: 2,
      student: 'Mike Chen',
      course: 'Advanced React Patterns',
      lastMessage: 'Thank you for the detailed explanation!',
      time: '1 day ago',
      unread: false,
      avatar: 'Mike'
    },
    {
      id: 3,
      student: 'Emily Davis',
      course: 'Node.js Backend Development',
      lastMessage: 'I\'m having trouble with async/await',
      time: '2 days ago',
      unread: true,
      avatar: 'Emily'
    },
  ];

  const messages = [
    { sender: 'student', text: 'Can you explain the difference between let and const?', time: '2:30 PM' },
    { sender: 'instructor', text: 'Great question! Let allows you to reassign values, while const creates a constant reference.', time: '2:35 PM' },
    { sender: 'student', text: 'So I can never change a const variable?', time: '2:37 PM' },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] font-outfit">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex overflow-hidden">
        {/* Threads List */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-600 mt-1">{threads.filter(t => t.unread).length} unread</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((thread, idx) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(idx)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedThread === idx ? 'bg-primary/5' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon icon="solar:user-circle-bold-duotone" size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{thread.student}</h3>
                      {thread.unread && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{thread.course}</p>
                    <p className="text-sm text-gray-600 truncate">{thread.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{thread.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{threads[selectedThread].student}</h3>
            <p className="text-sm text-gray-600">{threads[selectedThread].course}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'instructor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.sender === 'instructor' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'instructor' ? 'text-white/70' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors">
                <Icon icon="solar:plain-2-linear" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
