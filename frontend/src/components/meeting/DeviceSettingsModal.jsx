import React, { useEffect } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Icon } from '@iconify/react';

const DeviceSelect = ({ label, icon, devices, selectedDevice, onSelect }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
      <Icon icon={icon} className="w-4 h-4" />
      {label}
    </label>
    <select
      value={selectedDevice || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
    >
      {devices.length === 0 && (
        <option value="">No devices found</option>
      )}
      {devices.map((device) => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `Device ${device.deviceId.slice(0, 8)}...`}
        </option>
      ))}
    </select>
  </div>
);

const DeviceSettingsModal = ({ onClose }) => {
  const { useCameraState, useMicrophoneState, useSpeakerState } = useCallStateHooks();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const { camera, devices: cameraDevices, selectedDevice: selectedCamera } = useCameraState();
  const { microphone, devices: micDevices, selectedDevice: selectedMic } = useMicrophoneState();
  const { speaker, devices: speakerDevices, selectedDevice: selectedSpeaker, isDeviceSelectionSupported } = useSpeakerState();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-popover border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-lg font-bold">Device Settings</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground"
          >
            <Icon icon="material-symbols:close" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pt-4 space-y-6">
          <DeviceSelect
            label="Camera"
            icon="material-symbols:videocam-outline"
            devices={cameraDevices}
            selectedDevice={selectedCamera}
            onSelect={(deviceId) => camera.select(deviceId)}
          />

          <DeviceSelect
            label="Microphone"
            icon="material-symbols:mic-outline"
            devices={micDevices}
            selectedDevice={selectedMic}
            onSelect={(deviceId) => microphone.select(deviceId)}
          />

          {isDeviceSelectionSupported && (
            <DeviceSelect
              label="Speaker"
              icon="material-symbols:volume-up-outline"
              devices={speakerDevices}
              selectedDevice={selectedSpeaker}
              onSelect={(deviceId) => speaker.select(deviceId)}
            />
          )}
        </div>

        <div className="p-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettingsModal;
